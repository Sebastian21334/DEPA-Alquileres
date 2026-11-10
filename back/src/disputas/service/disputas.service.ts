import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import {
  EstadoLiquidacionReserva,
  EstadoPagoReserva,
} from '../../reservas/entity/reserva.entity';
import { ReservaCancelacionesService } from '../../reservas/service/reserva-cancelaciones.service';
import { ReservaCicloVidaService } from '../../reservas/service/reserva-ciclo-vida.service';
import {
  EstadoReembolso,
  OrigenReembolso,
  TipoReembolso,
} from '../../reembolsos/entity/reembolso.entity';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import {
  Disputa,
  EstadoDisputa,
  OrigenDisputa,
} from '../entity/disputa.entity';
import { ResolverDisputaDto } from '../dto/resolver-disputa.dto';
import {
  DISPUTAS_REPOSITORY,
  type IDisputasRepository,
} from '../repository/disputas.repository.interface';
import { TOLERANCIA_MONETARIA } from '../../common/utils/dinero';
import { referenciaUsuario } from '../../usuarios/usuario-referencia';
import {
  DISPUTAS_UOW,
  type IDisputasUnitOfWork,
} from '../persistence/disputas.unit-of-work.interface';
import { NotificacionesService } from '../../notificaciones/service/notificaciones.service';

@Injectable()
export class DisputasService {
  constructor(
    @Inject(DISPUTAS_REPOSITORY)
    private readonly disputas: IDisputasRepository,
    private readonly reembolsos: ReembolsosService,
    private readonly cancelaciones: ReservaCancelacionesService,
    private readonly ciclo: ReservaCicloVidaService,
    @Inject(DISPUTAS_UOW)
    private readonly uow: IDisputasUnitOfWork,
    @Optional()
    private readonly notificaciones?: NotificacionesService,
  ) {}

  /**
   * Registra el contracargo y congela la liquidación. No cancela la reserva
   * ni libera fechas: primero hay que preservar la evidencia y resolver.
   */
  async registrarContracargo(datos: {
    idReserva: number;
    idPago: number;
    chargebackId: string;
    importe: number;
    motivo?: string;
  }): Promise<Disputa> {
    const existente = await this.disputas.buscarPorChargebackId(
      datos.chargebackId,
    );
    if (existente) return existente;

    const creada = await this.uow.ejecutar(
      async ({ disputas, reservas, pagos }) => {
        const pago = await pagos.buscarPorIdConBloqueo(datos.idPago);
        if (!pago)
          throw new NotFoundException('No se encontró el pago de la disputa');
        const reserva = await reservas.buscarPorId(datos.idReserva);
        if (!reserva)
          throw new NotFoundException('No se encontró la reserva de la disputa');
        const motivo =
          datos.motivo?.trim().slice(0, 500) ||
          'Contracargo informado por Mercado Pago';

        const disputa = disputas.crear({
          reserva,
          pago,
          origen: OrigenDisputa.CONTRACARGO,
          estado: EstadoDisputa.ABIERTA,
          importe: datos.importe,
          moneda: pago.currency,
          motivo,
          chargeback_id: datos.chargebackId,
          referencia_externa: datos.chargebackId,
          evidencia: null,
          fecha_limite_respuesta: null,
          resolucion: null,
          estado_pago_previo: reserva.estado_pago,
          estado_liquidacion_previo: reserva.estado_liquidacion,
          resuelto_por: null,
          resuelto_en: null,
        });

        pago.status = 'charged_back';
        pago.chargeback_id = datos.chargebackId;
        await pagos.guardar(pago);
        this.ciclo.marcarContracargoPorDisputa(
          reserva,
          'Contracargo abierto: liquidación congelada hasta su resolución',
        );
        await reservas.guardar(reserva);
        return disputas.guardar(disputa);
      },
    );

    const completa = await this.disputas.buscarPorId(creada.id);
    if (!completa) throw new NotFoundException('Disputa no encontrada');
    await this.notificaciones?.disputaCreada(completa);
    return completa;
  }

  async listarAdministracion(): Promise<Disputa[]> {
    return this.disputas.listarAdministracion();
  }

  async resolver(
    id: number,
    dto: ResolverDisputaDto,
    idAdmin: number,
  ): Promise<Disputa> {
    const disputa = await this.disputas.buscarPorId(id);
    if (!disputa) throw new NotFoundException('Disputa no encontrada');
    if (
      [
        EstadoDisputa.GANADA,
        EstadoDisputa.PERDIDA,
        EstadoDisputa.CERRADA,
      ].includes(disputa.estado)
    )
      throw new ConflictException('La disputa ya fue resuelta');

    const estadoPagoPrev =
      (disputa.estado_pago_previo as EstadoPagoReserva | null) ??
      EstadoPagoReserva.APROBADO;
    const estadoLiquidacionPrev =
      (disputa.estado_liquidacion_previo as EstadoLiquidacionReserva | null) ??
      EstadoLiquidacionReserva.RETENIDO;

    if (dto.resultado === 'GANADA') {
      const resuelta = await this.uow.ejecutar(
        async ({ disputas, reservas, pagos }) => {
          const pago = await pagos.buscarPorIdConBloqueo(disputa.pago.id);
          if (!pago) throw new NotFoundException('Pago no encontrado');
          const reserva = await reservas.buscarPorId(disputa.reserva.id);
          if (!reserva)
            throw new NotFoundException('Reserva no encontrada');
          const actual = await disputas.buscarPorIdConBloqueo(id);
          if (!actual) throw new NotFoundException('Disputa no encontrada');
          if (
            [EstadoDisputa.GANADA, EstadoDisputa.PERDIDA, EstadoDisputa.CERRADA].includes(
              actual.estado,
            )
          )
            throw new ConflictException('La disputa ya fue resuelta');

          const status =
            estadoPagoPrev === EstadoPagoReserva.REEMBOLSADO
              ? 'refunded'
              : estadoPagoPrev === EstadoPagoReserva.CANCELADO
                ? 'cancelled'
                : estadoPagoPrev === EstadoPagoReserva.RECHAZADO
                  ? 'rejected'
                  : 'approved';
          pago.status = status;
          pago.chargeback_id = null;
          await pagos.guardar(pago);
          this.ciclo.restaurarContracargo(
            reserva,
            estadoPagoPrev,
            estadoLiquidacionPrev,
            'Contracargo resuelto a favor del Anunciante',
          );
          await reservas.guardar(reserva);

          actual.estado = EstadoDisputa.GANADA;
          actual.resolucion =
            dto.observacion?.trim() || 'Contracargo ganado';
          actual.resuelto_por = referenciaUsuario(idAdmin);
          actual.resuelto_en = new Date();
          return disputas.guardar(actual);
        },
      );
      const completa = await this.disputas.buscarPorId(resuelta.id);
      if (!completa) throw new NotFoundException('Disputa no encontrada');
      await this.notificaciones?.disputaResuelta(completa);
      return completa;
    }

    const importe = Number(disputa.importe);
    const total =
      importe >= Number(disputa.pago.amount) - TOLERANCIA_MONETARIA;
    const referencia = dto.referencia?.trim() || disputa.chargeback_id;
    if (!referencia)
      throw new BadRequestException(
        'Indicá la referencia del contracargo para registrar la devolución',
      );

    const reembolso = await this.reembolsos.crearSolicitud({
      reserva: disputa.reserva,
      pago: disputa.pago,
      tipo: total ? TipoReembolso.CONTRACARGO : TipoReembolso.PARCIAL,
      origen: OrigenReembolso.CONTRACARGO,
      importe,
      motivo: 'Contracargo perdido',
      idSolicitadoPor: idAdmin,
      idempotencyKey: `disputa:${disputa.id}`,
    });
    // El contracargo ya revirtió el dinero en Mercado Pago: se registra,
    // pero no se dispara un segundo reembolso automático.
    if (reembolso.estado !== EstadoReembolso.APROBADO)
      await this.reembolsos.registrarManual(
        reembolso.id,
        referencia,
        idAdmin,
      );
    await this.cancelaciones.aplicarReembolsoConfirmado(reembolso.id);

    const resuelta = await this.uow.ejecutar(async ({ disputas }) => {
      const actual = await disputas.buscarPorIdConBloqueo(id);
      if (!actual) throw new NotFoundException('Disputa no encontrada');
      if (
        [EstadoDisputa.GANADA, EstadoDisputa.PERDIDA, EstadoDisputa.CERRADA].includes(
          actual.estado,
        )
      )
        throw new ConflictException('La disputa ya fue resuelta');
      actual.estado = EstadoDisputa.PERDIDA;
      actual.resolucion = dto.observacion?.trim() || 'Contracargo perdido';
      actual.resuelto_por = referenciaUsuario(idAdmin);
      actual.resuelto_en = new Date();
      return disputas.guardar(actual);
    });
    const completa = await this.disputas.buscarPorId(resuelta.id);
    if (!completa) throw new NotFoundException('Disputa no encontrada');
    await this.notificaciones?.disputaResuelta(completa);
    return completa;
  }

  async cerrar(
    id: number,
    idAdmin: number,
  ): Promise<Disputa> {
    const cerrada = await this.uow.ejecutar(async ({ disputas }) => {
      const actual = await disputas.buscarPorIdConBloqueo(id);
      if (!actual) throw new NotFoundException('Disputa no encontrada');
      if (actual.estado === EstadoDisputa.CERRADA) return actual;
      if (
        ![EstadoDisputa.GANADA, EstadoDisputa.PERDIDA].includes(actual.estado)
      )
        throw new ConflictException(
          'Solo puede cerrarse una disputa que ya fue resuelta',
        );
      actual.estado = EstadoDisputa.CERRADA;
      actual.resuelto_por = actual.resuelto_por ?? referenciaUsuario(idAdmin);
      actual.resuelto_en = actual.resuelto_en ?? new Date();
      return disputas.guardar(actual);
    });
    const completa = await this.disputas.buscarPorId(cerrada.id);
    if (!completa) throw new NotFoundException('Disputa no encontrada');
    await this.notificaciones?.disputaResuelta(completa);
    return completa;
  }
}
