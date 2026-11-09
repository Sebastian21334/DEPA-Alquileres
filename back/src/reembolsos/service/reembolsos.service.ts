import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import type { Pago } from '../../pagos/entity/pago.entity';
import { PagosService } from '../../pagos/service/pagos.service';
import type { Reserva } from '../../reservas/entity/reserva.entity';
import {
  EstadoReembolso,
  OrigenReembolso,
  Reembolso,
  TipoReembolso,
} from '../entity/reembolso.entity';
import {
  PASARELA_REEMBOLSOS,
  type IPasarelaReembolsos,
} from '../ports/pasarela-reembolsos.interface';
import {
  REEMBOLSOS_REPOSITORY,
  type IReembolsosRepository,
} from '../repository/reembolsos.repository.interface';
import {
  DEVOLUCIONES_UOW,
  type IDevolucionesUnitOfWork,
} from '../persistence/devoluciones.unit-of-work.interface';
import { TOLERANCIA_MONETARIA } from '../../common/utils/dinero';

const ESTADOS_REEMBOLSO_ACTIVO = [
  EstadoReembolso.PENDIENTE,
  EstadoReembolso.EN_PROCESO,
  EstadoReembolso.FALLIDO,
  EstadoReembolso.APROBADO,
];

export type CrearReembolsoDatos = {
  reserva: Reserva;
  pago: Pago;
  tipo: TipoReembolso;
  origen: OrigenReembolso;
  importe: number;
  motivo: string;
  idSolicitadoPor: number | null;
  idempotencyKey?: string;
  /** Los ajustes externos pueden tener más de un reembolso por reserva. */
  permitirMultiplesAjustes?: boolean;
};

@Injectable()
export class ReembolsosService {
  private readonly logger = new Logger(ReembolsosService.name);

  constructor(
    @Inject(REEMBOLSOS_REPOSITORY)
    private readonly reembolsos: IReembolsosRepository,
    @Inject(PASARELA_REEMBOLSOS)
    private readonly pasarela: IPasarelaReembolsos,
    private readonly config: ConfigService,
    private readonly pagosService: PagosService,
    @Inject(DEVOLUCIONES_UOW)
    private readonly uow: IDevolucionesUnitOfWork,
  ) {}

  get ejecucionAutomaticaHabilitada(): boolean {
    return this.config.get<string>('MP_REFUNDS_ENABLED') === 'true';
  }

  esTotal(reembolso: Reembolso): boolean {
    return (
      reembolso.tipo === TipoReembolso.TOTAL ||
      reembolso.tipo === TipoReembolso.CONTRACARGO
    );
  }

  async crearSolicitud(datos: CrearReembolsoDatos): Promise<Reembolso> {
    const { reembolso } = await this.crearSolicitudConResultado(datos);
    return reembolso;
  }

  async crearSolicitudConResultado(
    datos: CrearReembolsoDatos,
  ): Promise<{ reembolso: Reembolso; creado: boolean }> {
    const importe = Number(datos.importe);
    if (!Number.isFinite(importe) || importe <= 0)
      throw new BadRequestException('El importe del reembolso debe ser positivo');

    const clave = datos.idempotencyKey ?? randomUUID();
    const existente = await this.reembolsos.buscarPorIdempotencyKey(clave);
    if (existente) return { reembolso: existente, creado: false };

    try {
      return await this.uow.ejecutar(async ({ reembolsos, pagos }) => {
        const pago = await pagos.buscarPorIdConBloqueo(datos.pago.id);
        if (!pago)
          throw new NotFoundException(
            'No se encontró el pago de la reserva',
          );

        const existenteEnTx =
          await reembolsos.buscarPorIdempotencyKey(clave);
        if (existenteEnTx)
          return { reembolso: existenteEnTx, creado: false };

        if (
          datos.origen === OrigenReembolso.AJUSTE_ADMIN &&
          !datos.permitirMultiplesAjustes
        ) {
          const deLaReserva = await reembolsos.buscarPorReserva(
            datos.reserva.id,
          );
          const activa = deLaReserva.find(
            (actual) =>
              actual.origen === OrigenReembolso.AJUSTE_ADMIN &&
              [
                EstadoReembolso.PENDIENTE,
                EstadoReembolso.EN_PROCESO,
                EstadoReembolso.FALLIDO,
                EstadoReembolso.APROBADO,
              ].includes(actual.estado),
          );
          if (activa)
            throw new ConflictException(
              'Ya existe una devolución de liquidación en curso para la reserva',
            );
        }

        const reservado =
          await reembolsos.sumarImportesReservados(pago.id);
        const saldo =
          this.pagosService.saldoReembolsable(pago) - reservado;
        if (importe > saldo + TOLERANCIA_MONETARIA)
          throw new ConflictException(
            `El importe supera el saldo reembolsable de ${pago.currency} ${saldo.toFixed(2)}`,
          );

        const reembolso = reembolsos.crear({
          reserva: datos.reserva,
          pago,
          tipo: datos.tipo,
          origen: datos.origen,
          importe,
          moneda: pago.currency,
          estado: EstadoReembolso.PENDIENTE,
          motivo: datos.motivo.trim().slice(0, 500),
          referencia_interna: null,
          referencia_externa: null,
          id_externo: null,
          idempotency_key: clave,
          solicitado_por:
            datos.idSolicitadoPor != null
              ? ({ id: datos.idSolicitadoPor } as never)
              : null,
          resuelto_por: null,
          resuelto_en: null,
          error_detalle: null,
        });
        return {
          reembolso: await reembolsos.guardar(reembolso),
          creado: true,
        };
      });
    } catch (error) {
      const ganador = await this.reembolsos.buscarPorIdempotencyKey(clave);
      if (ganador) return { reembolso: ganador, creado: false };
      throw error;
    }
  }

  async registrarManual(
    id: number,
    referencia: string,
    idActor: number,
  ): Promise<Reembolso> {
    if (!referencia.trim())
      throw new BadRequestException('La referencia es obligatoria');
    return this.confirmar(id, {
      referencia,
      idActor,
      idExterno: null,
    });
  }

  /** Ejecuta por Mercado Pago si está habilitado; si no, exige registro manual. */
  async registrarOejecutar(
    id: number,
    referencia: string | null | undefined,
    idActor: number,
  ): Promise<Reembolso> {
    if (this.ejecucionAutomaticaHabilitada) return this.ejecutar(id, idActor);
    return this.registrarManual(id, referencia ?? '', idActor);
  }

  async ejecutar(id: number, idActor: number): Promise<Reembolso> {
    const reembolso = await this.buscar(id);
    if (!this.ejecucionAutomaticaHabilitada)
      throw new BadRequestException(
        'La ejecución automática está deshabilitada. Registrá la devolución manualmente.',
      );
    if (!reembolso.pago.payment_id)
      throw new ConflictException('El pago no tiene identificador de Mercado Pago');
    if (reembolso.estado === EstadoReembolso.APROBADO) return reembolso;
    if (reembolso.estado === EstadoReembolso.EN_PROCESO) return reembolso;
    if (
      reembolso.estado !== EstadoReembolso.PENDIENTE &&
      reembolso.estado !== EstadoReembolso.FALLIDO
    )
      throw new ConflictException(
        'El reembolso no está en un estado ejecutable',
      );

    const preparacion = await this.uow.ejecutar(
      async ({ reembolsos, pagos }) => {
        const idPago = await reembolsos.buscarPagoId(id);
        if (idPago == null)
          throw new NotFoundException(
            'El reembolso no tiene un pago asociado',
          );
        const pago = await pagos.buscarPorIdConBloqueo(idPago);
        if (!pago) throw new NotFoundException('Pago no encontrado');
        const actual = await reembolsos.buscarPorIdConBloqueo(id);
        if (!actual)
          throw new NotFoundException('Reembolso no encontrado');

        if (
          actual.estado === EstadoReembolso.APROBADO ||
          actual.estado === EstadoReembolso.EN_PROCESO
        )
          return { reembolso: actual, transiciono: false };
        if (
          actual.estado !== EstadoReembolso.PENDIENTE &&
          actual.estado !== EstadoReembolso.FALLIDO
        )
          throw new ConflictException(
            'El reembolso no está en un estado ejecutable',
          );

        const reservados = await reembolsos.sumarImportesReservados(
          idPago,
          id,
        );
        const saldo =
          this.pagosService.saldoReembolsable(pago) - reservados;
        if (Number(actual.importe) > saldo + TOLERANCIA_MONETARIA)
          throw new ConflictException(
            'El reembolso supera el saldo disponible del pago',
          );

        actual.estado = EstadoReembolso.EN_PROCESO;
        actual.resuelto_por = { id: idActor } as never;
        return {
          reembolso: await reembolsos.guardar(actual),
          transiciono: true,
        };
      },
    );

    if (!preparacion.transiciono) return preparacion.reembolso;
    const enProceso = preparacion.reembolso;
    let referenciaMp: string | null = null;
    let idExternoMp: string | null = null;

    try {
      const resultado = await this.pasarela.reembolsar(
        reembolso.pago.payment_id,
        Number(enProceso.importe),
        enProceso.idempotency_key,
      );
      referenciaMp = String(resultado.id ?? '');
      idExternoMp = resultado.id != null ? String(resultado.id) : null;
      await this.registrarResultadoPasarela(
        enProceso.id,
        referenciaMp,
        idExternoMp,
      );
      const estadoMp = (resultado.status ?? '').toLowerCase();
      if (estadoMp && !['approved', 'succeeded'].includes(estadoMp))
        throw new ConflictException(
          `Mercado Pago devolvió el estado ${resultado.status}`,
        );
      if (
        resultado.amount != null &&
        Math.abs(Number(resultado.amount) - Number(enProceso.importe)) > TOLERANCIA_MONETARIA
      )
        throw new ConflictException(
          'Mercado Pago devolvió un importe distinto al solicitado',
        );
      if (
        resultado.currency_id != null &&
        resultado.currency_id !== reembolso.moneda
      )
        throw new ConflictException(
          'Mercado Pago devolvió una moneda distinta a la del pago',
        );
      return this.confirmar(
        enProceso.id,
        {
          referencia: String(resultado.id ?? ''),
          idActor,
          idExterno: resultado.id != null ? String(resultado.id) : null,
        },
        { permitirEnProceso: true },
      );
    } catch (error) {
      await this.fallar(enProceso.id, error, {
        idExterno: idExternoMp,
        referencia: referenciaMp,
      });
      throw error;
    }
  }

  private async registrarResultadoPasarela(
    id: number,
    referencia: string,
    idExterno: string | null,
  ): Promise<void> {
    await this.reembolsos.actualizarEnTransaccion(id, (reembolso) => {
      if (reembolso.estado === EstadoReembolso.APROBADO) return;
      reembolso.referencia_externa = referencia || null;
      reembolso.id_externo = idExterno;
    });
  }

  async confirmar(
    id: number,
    datos: { referencia: string; idActor: number | null; idExterno: string | null },
    opciones?: { permitirEnProceso?: boolean },
  ): Promise<Reembolso> {
    return this.uow.ejecutar(async ({ reembolsos, pagos }) => {
      // Se bloquea primero el Pago para respetar el mismo orden que crearSolicitud
      // y evitar deadlocks entre creación y confirmación.
      const idPago = await reembolsos.buscarPagoId(id);
      if (idPago == null)
        throw new NotFoundException('El reembolso no tiene un pago asociado');
      const pago = await pagos.buscarPorIdConBloqueo(idPago);
      if (!pago) throw new NotFoundException('Pago no encontrado');

      const reembolso = await reembolsos.buscarPorIdConBloqueo(id);
      if (!reembolso) throw new NotFoundException('Reembolso no encontrado');
      if (reembolso.estado === EstadoReembolso.APROBADO) return reembolso;
      if (
        reembolso.estado === EstadoReembolso.RECHAZADO ||
        reembolso.estado === EstadoReembolso.CANCELADO
      )
        throw new ConflictException(
          'Un reembolso rechazado o cancelado no puede aprobarse',
        );
      if (
        reembolso.estado === EstadoReembolso.EN_PROCESO &&
        !opciones?.permitirEnProceso
      )
        throw new ConflictException(
          'El reembolso está en proceso; no puede confirmarse manualmente',
        );
      if (
        Number(reembolso.importe) >
        this.pagosService.saldoReembolsable(pago) + TOLERANCIA_MONETARIA
      )
        throw new ConflictException('El reembolso supera el saldo del pago');

      reembolso.estado = EstadoReembolso.APROBADO;
      reembolso.referencia_externa = datos.referencia || null;
      reembolso.id_externo = datos.idExterno;
      reembolso.resuelto_en = new Date();
      reembolso.resuelto_por =
        datos.idActor != null ? ({ id: datos.idActor } as never) : null;
      reembolso.error_detalle = null;

      this.aplicarDevolucionAlPago(pago, reembolso);
      await pagos.guardar(pago);
      return reembolsos.guardar(reembolso);
    });
  }

  private aplicarDevolucionAlPago(
    pago: Pago,
    reembolso: Reembolso,
  ): void {
    const total = Math.min(
      Number(pago.amount),
      Number(pago.amount_refunded ?? 0) + Number(reembolso.importe),
    );
    pago.amount_refunded = total;
    if (total >= Number(pago.amount)) {
      pago.status = 'refunded';
      pago.refunded_at = pago.refunded_at ?? new Date();
    } else if (pago.status === 'refunded') {
      pago.status = 'approved';
      pago.refunded_at = null;
    }
    if (
      reembolso.origen === OrigenReembolso.CONTRACARGO &&
      pago.status !== 'refunded'
    )
      pago.status = 'approved';
  }

  /** Compensa un reembolso pendiente/fallido; no toca aprobados ni en proceso. */
  async compensar(id: number, idActor: number | null): Promise<boolean> {
    try {
      const reembolso = await this.buscar(id);
      if (
        reembolso.estado === EstadoReembolso.RECHAZADO ||
        reembolso.estado === EstadoReembolso.CANCELADO
      )
        return true;
      if (
        reembolso.estado !== EstadoReembolso.PENDIENTE &&
        reembolso.estado !== EstadoReembolso.FALLIDO
      )
        return false;
      if (reembolso.estado === EstadoReembolso.FALLIDO) {
        // Un FALLIDO puede haber salido igual: sin respuesta definitiva de MP
        // se mantiene reservado para no habilitar un segundo reembolso.
        const idExterno =
          reembolso.id_externo ?? reembolso.referencia_externa;
        if (!reembolso.pago?.payment_id || !idExterno) return false;
        const resultado = await this.pasarela.consultarReembolso(
          reembolso.pago.payment_id,
          idExterno,
        );
        const estado = (resultado.status ?? '').toLowerCase();
        if (!['rejected', 'cancelled', 'failed'].includes(estado))
          return false;
      }
      await this.rechazar(
        id,
        'La reserva no se pudo cancelar por el bloqueo del anunciante',
        idActor,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `No se pudo compensar el reembolso ${id}`,
        error as Error,
      );
      return false;
    }
  }

  async rechazar(
    id: number,
    motivo: string,
    idActor: number | null,
    opciones?: { desdePasarela?: boolean },
  ): Promise<Reembolso> {
    const rechazado = await this.reembolsos.actualizarEnTransaccion(
      id,
      (reembolso) => {
        if (reembolso.estado === EstadoReembolso.APROBADO)
          throw new ConflictException('Un reembolso aprobado no puede rechazarse');
        if (
          reembolso.estado === EstadoReembolso.RECHAZADO ||
          reembolso.estado === EstadoReembolso.CANCELADO
        )
          throw new ConflictException(
            'El reembolso ya está rechazado o cancelado',
          );
        if (
          reembolso.estado === EstadoReembolso.EN_PROCESO &&
          !opciones?.desdePasarela
        )
          throw new ConflictException(
            'El reembolso está en proceso; esperá la conciliación',
          );
        reembolso.estado = EstadoReembolso.RECHAZADO;
        reembolso.error_detalle = motivo.trim();
        reembolso.resuelto_en = new Date();
        reembolso.resuelto_por =
          idActor != null ? ({ id: idActor } as never) : null;
      },
    );
    if (!rechazado) throw new NotFoundException('Reembolso no encontrado');
    return rechazado;
  }

  async fallar(
    id: number,
    error: unknown,
    datos?: { idExterno?: string | null; referencia?: string | null },
  ): Promise<void> {
    const mensaje = error instanceof Error ? error.message : String(error);
    await this.reembolsos.actualizarEnTransaccion(id, (reembolso) => {
      if (
        reembolso.estado === EstadoReembolso.APROBADO ||
        reembolso.estado === EstadoReembolso.RECHAZADO ||
        reembolso.estado === EstadoReembolso.CANCELADO
      )
        return;
      reembolso.estado = EstadoReembolso.FALLIDO;
      reembolso.error_detalle = mensaje.slice(0, 500);
      if (datos?.idExterno !== undefined)
        reembolso.id_externo = datos.idExterno;
      if (datos?.referencia !== undefined)
        reembolso.referencia_externa = datos.referencia;
    });
    this.logger.error(`Falló el reembolso ${id}: ${mensaje}`);
  }

  /**
   * Concilia un reembolso informado por Mercado Pago que no fue iniciado
   * desde la plataforma. Es idempotente por referencia externa.
   */
  async registrarDesdeWebhook(datos: {
    pago: Pago;
    importe: number;
    referenciaExterna: string;
    idExterno: string | null;
  }): Promise<Reembolso> {
    const porIdExterno = datos.idExterno
      ? await this.reembolsos.buscarPorIdExterno(datos.idExterno)
      : null;
    const existente =
      porIdExterno ??
      (await this.reembolsos.buscarPorReferenciaExterna(
        datos.referenciaExterna,
      ));
    if (existente) {
      if (existente.estado !== EstadoReembolso.APROBADO)
        return this.confirmar(existente.id, {
          referencia: datos.referenciaExterna,
          idActor: null,
          idExterno: datos.idExterno,
        });
      return existente;
    }
    const reserva = datos.pago.reserva;
    if (!reserva)
      throw new ConflictException('El pago no tiene una reserva asociada');
    const reembolso = await this.crearSolicitud({
      reserva,
      pago: datos.pago,
      tipo:
        Number(datos.importe) >= Number(datos.pago.amount)
          ? TipoReembolso.TOTAL
          : TipoReembolso.PARCIAL,
      origen: OrigenReembolso.AJUSTE_ADMIN,
      importe: Number(datos.importe),
      motivo: 'Reembolso informado por Mercado Pago',
      idSolicitadoPor: null,
      idempotencyKey: datos.idExterno
        ? `mp-refund:${datos.idExterno}`.slice(0, 36)
        : randomUUID(),
      permitirMultiplesAjustes: true,
    });
    return this.confirmar(reembolso.id, {
      referencia: datos.referenciaExterna,
      idActor: null,
      idExterno: datos.idExterno,
    });
  }

  async buscar(id: number): Promise<Reembolso> {
    const reembolso = await this.reembolsos.buscarPorId(id);
    if (!reembolso) throw new NotFoundException('Reembolso no encontrado');
    return reembolso;
  }

  async listarPorReserva(idReserva: number): Promise<Reembolso[]> {
    return this.reembolsos.buscarPorReserva(idReserva);
  }

  async listarActivosPorReservas(
    idsReserva: number[],
  ): Promise<Reembolso[]> {
    return this.reembolsos.buscarPorReservasConEstados(
      idsReserva,
      ESTADOS_REEMBOLSO_ACTIVO,
    );
  }

  async buscarPagoPorReserva(idReserva: number): Promise<Pago | null> {
    return this.pagosService.buscarPorReserva(idReserva);
  }

  async tieneReembolsoTotalAprobado(idReserva: number): Promise<boolean> {
    const reembolsos = await this.reembolsos.buscarPorReserva(idReserva);
    return reembolsos.some(
      (reembolso) =>
        reembolso.estado === EstadoReembolso.APROBADO &&
        this.esTotal(reembolso),
    );
  }

  async listarAdministracion(): Promise<Reembolso[]> {
    return this.reembolsos.listarAdministracion();
  }

  async listarAprobados(): Promise<Reembolso[]> {
    return this.reembolsos.buscarAprobados();
  }

  async reconciliarPendientes(): Promise<number[]> {
    if (!this.ejecucionAutomaticaHabilitada) return [];
    const aplicados: number[] = [];
    const pendientes = await this.reembolsos.buscarPendientesConciliacion();
    for (const reembolso of pendientes) {
      if (!reembolso.pago?.payment_id) continue;
      try {
        const idExterno = reembolso.id_externo ?? reembolso.referencia_externa;
        if (!idExterno) continue;
        const resultado = await this.pasarela.consultarReembolso(
          reembolso.pago.payment_id,
          idExterno,
        );
        if (resultado.status === 'approved') {
          await this.confirmar(
            reembolso.id,
            {
              referencia: String(resultado.id ?? idExterno),
              idActor: null,
              idExterno: String(resultado.id ?? idExterno),
            },
            { permitirEnProceso: true },
          );
          aplicados.push(reembolso.id);
        } else if (resultado.status === 'rejected') {
          await this.rechazar(
            reembolso.id,
            'Mercado Pago rechazó el reembolso',
            null,
            { desdePasarela: true },
          );
        }
      } catch (error) {
        this.logger.warn(
          `No se pudo conciliar el reembolso ${reembolso.id}`,
          error as Error,
        );
      }
    }
    return aplicados;
  }
}
