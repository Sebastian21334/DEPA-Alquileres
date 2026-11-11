import { EstadoReembolso } from '../../catalogos/estados';
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
import { PagosRegistroService } from '../../pagos/service/pagos-registro.service';
import { ReservaEstadoService } from '../../reservas-consulta/service/reserva-estado.service';
import type { Reserva } from '../../reservas/entity/reserva.entity';
import {
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

export type CrearReembolsoDatos = {
  reserva: Reserva;
  pago: Pago;
  tipo: TipoReembolso;
  origen: OrigenReembolso;
  importe: number;
  motivo: string;
  idSolicitadoPor: number | null;
  idempotencyKey?: string;
};

@Injectable()
export class ReembolsosService {
  private readonly logger = new Logger(ReembolsosService.name);

  constructor(@Inject(REEMBOLSOS_REPOSITORY) private readonly reembolsos: IReembolsosRepository, @Inject(PASARELA_REEMBOLSOS) private readonly pasarela: IPasarelaReembolsos, private readonly config: ConfigService, private readonly pagos: PagosRegistroService, private readonly estadoService: ReservaEstadoService) {}

  get ejecucionAutomaticaHabilitada(): boolean {
    return this.config.get<string>('MP_REFUNDS_ENABLED') === 'true';
  }

  async crearSolicitud(datos: CrearReembolsoDatos): Promise<Reembolso> {
    const importe = Number(datos.importe);
    if (!Number.isFinite(importe) || importe <= 0)
      throw new BadRequestException('El importe del reembolso debe ser positivo');

    const guardado = await this.reembolsos.conTransaccion(async (reembolsos, transaccion) => {
      const pago = await this.pagos.buscarParaReembolso(datos.pago.id, transaccion);
      if (!pago)
        throw new NotFoundException('No se encontró el pago de la reserva');

      const pendientes = await reembolsos.buscarPendientesPorPago(pago.id);
      const reservado = pendientes.reduce((total, fila) => total + Number(fila.importe), 0);
      const saldo =
        Number(pago.amount) - Number(pago.amount_refunded ?? 0) - reservado;
      if (importe > saldo + 0.009)
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
        idempotency_key: datos.idempotencyKey ?? randomUUID(),
        solicitado_por:
          datos.idSolicitadoPor != null
            ? ({ id: datos.idSolicitadoPor } as never)
            : null,
        resuelto_por: null,
        resuelto_en: null,
        error_detalle: null,
      });
      return reembolsos.guardar(reembolso);
    });
    return this.prepararRespuesta(guardado);
  }

  async registrarManual(id: number, referencia: string, idActor: number): Promise<Reembolso> {
    if (!referencia.trim())
      throw new BadRequestException('La referencia es obligatoria');
    return this.confirmar(id, {
      referencia,
      idActor,
      idExterno: null,
    });
  }

  /** Ejecuta por Mercado Pago si está habilitado; si no, exige registro manual. */
  async registrarOejecutar(id: number, referencia: string | null | undefined, idActor: number): Promise<Reembolso> {
    if (this.ejecucionAutomaticaHabilitada) {
      const reembolso = await this.ejecutar(id, idActor);
      if (reembolso.estado !== EstadoReembolso.APROBADO)
        throw new ConflictException('El reembolso todavía no fue confirmado por Mercado Pago');
      return reembolso;
    }
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

    const enProceso = await this.reembolsos.conTransaccion(async (repo) => {
      const actual = await repo.buscarRegistro(id, { bloquear: true });
      if (!actual) throw new NotFoundException('Reembolso no encontrado');
      if (actual.estado === EstadoReembolso.APROBADO) return actual;
      if (actual.estado !== EstadoReembolso.PENDIENTE && actual.estado !== EstadoReembolso.FALLIDO)
        throw new ConflictException('El reembolso no está disponible para ejecutar');
      actual.estado = EstadoReembolso.EN_PROCESO;
      actual.resuelto_por = { id: idActor } as never;
      return repo.guardar(actual);
    });

    if (enProceso.estado === EstadoReembolso.APROBADO) return enProceso;

    try {
      const resultado = await this.pasarela.reembolsar(
        reembolso.pago.payment_id!,
        Number(enProceso.importe),
        enProceso.idempotency_key,
      );
      if (resultado.id == null)
        throw new ConflictException('La pasarela no confirmó el identificador del reembolso');
      if (resultado.status !== 'approved') {
        enProceso.id_externo = String(resultado.id);
        enProceso.referencia_externa = String(resultado.id);
        if (resultado.status === 'rejected')
          return this.rechazar(enProceso.id, 'Mercado Pago rechazó el reembolso', idActor);
        return this.prepararRespuesta(await this.reembolsos.guardar(enProceso));
      }
      return this.confirmar(enProceso.id, {
        referencia: String(resultado.id ?? ''),
        idActor,
        idExterno: resultado.id != null ? String(resultado.id) : null,
      });
    } catch (error) {
      await this.fallar(enProceso.id, error);
      throw error;
    }
  }

  async confirmar(id: number, datos: { referencia: string; idActor: number | null; idExterno: string | null }): Promise<Reembolso> {
    const guardado = await this.reembolsos.conTransaccion(async (repo, transaccion) => {
      const reembolso = await repo.buscarRegistro(id, { bloquear: true, idPago: true });
      if (!reembolso) throw new NotFoundException('Reembolso no encontrado');
      if (reembolso.estado === EstadoReembolso.APROBADO) return reembolso;

      const pago = await this.pagos.buscarParaReembolso(reembolso.pago.id, transaccion);
      if (!pago) throw new NotFoundException('Pago no encontrado');
      if (Number(reembolso.importe) > this.saldoReembolsable(pago) + 0.009)
        throw new ConflictException('El reembolso supera el saldo del pago');

      reembolso.estado = EstadoReembolso.APROBADO;
      reembolso.referencia_externa = datos.referencia || null;
      reembolso.id_externo = datos.idExterno;
      reembolso.resuelto_en = new Date();
      reembolso.resuelto_por =
        datos.idActor != null
          ? ({ id: datos.idActor } as never)
          : null;
      reembolso.error_detalle = null;
      await this.pagos.aplicarReembolso(
        pago,
        Number(reembolso.importe),
        reembolso.origen === OrigenReembolso.CONTRACARGO,
        transaccion,
      );
      return repo.guardar(reembolso);
    });
    return this.prepararRespuesta(guardado);
  }

  async rechazar(id: number, motivo: string, idActor: number | null): Promise<Reembolso> {
    const guardado = await this.reembolsos.conTransaccion(async (repo) => {
      const reembolso = await repo.buscarRegistro(id, { bloquear: true });
      if (!reembolso) throw new NotFoundException('Reembolso no encontrado');
      if (reembolso.estado === EstadoReembolso.APROBADO)
        throw new ConflictException('Un reembolso aprobado no puede rechazarse');
      reembolso.estado = EstadoReembolso.RECHAZADO;
      reembolso.error_detalle = motivo.trim();
      reembolso.resuelto_en = new Date();
      reembolso.resuelto_por =
        idActor != null ? ({ id: idActor } as never) : null;
      return repo.guardar(reembolso);
    });
    return this.prepararRespuesta(guardado);
  }

  async fallar(id: number, error: unknown): Promise<void> {
    const mensaje = error instanceof Error ? error.message : String(error);
    await this.reembolsos.conTransaccion(async (repo) => {
      const reembolso = await repo.buscarRegistro(id);
      if (!reembolso) return;
      reembolso.estado = EstadoReembolso.FALLIDO;
      reembolso.error_detalle = mensaje.slice(0, 500);
      await repo.guardar(reembolso);
    });
    this.logger.error(`Falló el reembolso ${id}: ${mensaje}`);
  }

  /**
   * Concilia un reembolso informado por Mercado Pago que no fue iniciado
   * desde la plataforma. Es idempotente por referencia externa.
   */
  async registrarDesdeWebhook(datos: { pago: Pago; importe: number; referenciaExterna: string; idExterno: string | null; }): Promise<Reembolso> {
    const existente = await this.reembolsos.buscarPorReferenciaExterna(
      datos.referenciaExterna,
    );
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
      idempotencyKey: randomUUID(),
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
    return this.prepararRespuesta(reembolso);
  }

  async listarPorReserva(idReserva: number): Promise<Reembolso[]> {
    const reembolsos = await this.reembolsos.buscarPorReserva(idReserva);
    return reembolsos.map((reembolso) => this.prepararRespuesta(reembolso));
  }

  async buscarPagoPorReserva(idReserva: number): Promise<Pago | null> {
    return this.pagos.buscarPorReserva(idReserva);
  }

  saldoReembolsable(pago: Pago): number {
    return this.pagos.saldoReembolsable(pago);
  }

  esTotal(reembolso: Reembolso): boolean {
    return reembolso.tipo === TipoReembolso.TOTAL || reembolso.tipo === TipoReembolso.CONTRACARGO;
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
    const reembolsos = await this.reembolsos.listarAdministracion();
    return reembolsos.map((reembolso) => this.prepararRespuesta(reembolso));
  }

  private prepararRespuesta(reembolso: Reembolso): Reembolso {
    if (reembolso.reserva?.estado_pago) {
      reembolso.reserva = this.estadoService.prepararRespuesta(reembolso.reserva);
    }
    if (reembolso.pago?.reserva?.estado_pago) {
      reembolso.pago.reserva = this.estadoService.prepararRespuesta(reembolso.pago.reserva);
    }
    return reembolso;
  }

  async reconciliarPendientes(): Promise<void> {
    if (!this.ejecucionAutomaticaHabilitada) return;
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
          await this.confirmar(reembolso.id, {
            referencia: String(resultado.id ?? idExterno),
            idActor: null,
            idExterno: String(resultado.id ?? idExterno),
          });
        } else if (resultado.status === 'rejected') {
          await this.rechazar(
            reembolso.id,
            'Mercado Pago rechazó el reembolso',
            null,
          );
        }
      } catch (error) {
        this.logger.warn(
          `No se pudo conciliar el reembolso ${reembolso.id}`,
          error as Error,
        );
      }
    }
  }
}
