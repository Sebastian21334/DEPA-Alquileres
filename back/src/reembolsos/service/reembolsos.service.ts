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
import { DataSource, In } from 'typeorm';
import { Pago } from '../../pagos/entity/pago.entity';
import { Reserva } from '../../reservas/entity/reserva.entity';
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

  constructor(
    @Inject(REEMBOLSOS_REPOSITORY)
    private readonly reembolsos: IReembolsosRepository,
    @Inject(PASARELA_REEMBOLSOS)
    private readonly pasarela: IPasarelaReembolsos,
    private readonly config: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  get ejecucionAutomaticaHabilitada(): boolean {
    return this.config.get<string>('MP_REFUNDS_ENABLED') === 'true';
  }

  async crearSolicitud(datos: CrearReembolsoDatos): Promise<Reembolso> {
    const importe = Number(datos.importe);
    if (!Number.isFinite(importe) || importe <= 0)
      throw new BadRequestException('El importe del reembolso debe ser positivo');

    return this.dataSource.transaction(async (manager) => {
      const pagos = manager.getRepository(Pago);
      const pago = await pagos.findOne({
        where: { id: datos.pago.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!pago)
        throw new NotFoundException('No se encontró el pago de la reserva');

      const reembolsos = manager.getRepository(Reembolso);
      const pendientes = await reembolsos.find({
        where: {
          pago: { id: pago.id },
          estado: In([
            EstadoReembolso.PENDIENTE,
            EstadoReembolso.EN_PROCESO,
          ]),
        },
      });
      const reservado = pendientes.reduce(
        (total, fila) => total + Number(fila.importe),
        0,
      );
      const saldo =
        Number(pago.amount) - Number(pago.amount_refunded ?? 0) - reservado;
      if (importe > saldo + 0.009)
        throw new ConflictException(
          `El importe supera el saldo reembolsable de ${pago.currency} ${saldo.toFixed(2)}`,
        );

      const reembolso = reembolsos.create({
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
      return reembolsos.save(reembolso);
    });
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

    const enProceso = await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Reembolso);
      const actual = await repo.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!actual) throw new NotFoundException('Reembolso no encontrado');
      actual.estado = EstadoReembolso.EN_PROCESO;
      actual.resuelto_por = { id: idActor } as never;
      return repo.save(actual);
    });

    try {
      const resultado = await this.pasarela.reembolsar(
        enProceso.pago.payment_id!,
        Number(enProceso.importe),
        enProceso.idempotency_key,
      );
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

  async confirmar(
    id: number,
    datos: { referencia: string; idActor: number | null; idExterno: string | null },
  ): Promise<Reembolso> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Reembolso);
      const pagos = manager.getRepository(Pago);
      const reembolso = await repo.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!reembolso) throw new NotFoundException('Reembolso no encontrado');
      if (reembolso.estado === EstadoReembolso.APROBADO) return reembolso;

      const pago = await pagos.findOne({
        where: { id: reembolso.pago.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!pago) throw new NotFoundException('Pago no encontrado');
      if (Number(reembolso.importe) > pago.saldoReembolsable() + 0.009)
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
      pago.acumularReembolso(Number(reembolso.importe));
      if (
        reembolso.origen === OrigenReembolso.CONTRACARGO &&
        pago.status !== 'refunded'
      )
        pago.status = 'approved';
      await pagos.save(pago);
      return repo.save(reembolso);
    });
  }

  async rechazar(
    id: number,
    motivo: string,
    idActor: number | null,
  ): Promise<Reembolso> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Reembolso);
      const reembolso = await repo.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!reembolso) throw new NotFoundException('Reembolso no encontrado');
      if (reembolso.estado === EstadoReembolso.APROBADO)
        throw new ConflictException('Un reembolso aprobado no puede rechazarse');
      reembolso.estado = EstadoReembolso.RECHAZADO;
      reembolso.error_detalle = motivo.trim();
      reembolso.resuelto_en = new Date();
      reembolso.resuelto_por =
        idActor != null ? ({ id: idActor } as never) : null;
      return repo.save(reembolso);
    });
  }

  async fallar(id: number, error: unknown): Promise<void> {
    const mensaje = error instanceof Error ? error.message : String(error);
    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Reembolso);
      const reembolso = await repo.findOne({ where: { id } });
      if (!reembolso) return;
      reembolso.estado = EstadoReembolso.FALLIDO;
      reembolso.error_detalle = mensaje.slice(0, 500);
      await repo.save(reembolso);
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
    return reembolso;
  }

  async listarPorReserva(idReserva: number): Promise<Reembolso[]> {
    return this.reembolsos.buscarPorReserva(idReserva);
  }

  async buscarPagoPorReserva(idReserva: number): Promise<Pago | null> {
    return this.reembolsos.buscarPagoPorReserva(idReserva);
  }

  async tieneReembolsoTotalAprobado(idReserva: number): Promise<boolean> {
    const reembolsos = await this.reembolsos.buscarPorReserva(idReserva);
    return reembolsos.some(
      (reembolso) =>
        reembolso.estado === EstadoReembolso.APROBADO &&
        (reembolso.tipo === TipoReembolso.TOTAL ||
          reembolso.tipo === TipoReembolso.CONTRACARGO),
    );
  }

  async listarAdministracion(): Promise<Reembolso[]> {
    return this.reembolsos.listarAdministracion();
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
            0,
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
