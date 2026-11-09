import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EstadoLiquidacionReserva,
  EstadoPagoReserva,
} from '../../reservas/entity/reserva.entity';
import { ReservaCancelacionesService } from '../../reservas/service/reserva-cancelaciones.service';
import { ReservasService } from '../../reservas/service/reservas.service';
import {
  OrigenReembolso,
  TipoReembolso,
} from '../../reembolsos/entity/reembolso.entity';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import { PagosService } from '../../pagos/service/pagos.service';
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

@Injectable()
export class DisputasService {
  constructor(
    @Inject(DISPUTAS_REPOSITORY)
    private readonly disputas: IDisputasRepository,
    private readonly reembolsos: ReembolsosService,
    private readonly reservasService: ReservasService,
    private readonly cancelaciones: ReservaCancelacionesService,
    private readonly pagosService: PagosService,
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

    const reserva = await this.reservasService.obtenerPorId(datos.idReserva);
    const pago = await this.pagosService.buscarPorId(datos.idPago);
    const motivo =
      datos.motivo?.trim().slice(0, 500) ||
      'Contracargo informado por Mercado Pago';

    const disputa = this.disputas.crear({
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

    await this.pagosService.actualizarEstado(pago.id, {
      status: 'charged_back',
      chargeback_id: datos.chargebackId,
    });
    await this.reservasService.marcarContracargo(
      reserva.id,
      'Contracargo abierto: liquidación congelada hasta su resolución',
    );
    return this.disputas.guardar(disputa);
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
    if ([EstadoDisputa.GANADA, EstadoDisputa.PERDIDA].includes(disputa.estado))
      throw new ConflictException('La disputa ya fue resuelta');

    const { reserva, pago } = disputa;
    const estadoPagoPrev =
      (disputa.estado_pago_previo as EstadoPagoReserva | null) ??
      EstadoPagoReserva.APROBADO;
    const estadoLiquidacionPrev =
      (disputa.estado_liquidacion_previo as EstadoLiquidacionReserva | null) ??
      EstadoLiquidacionReserva.RETENIDO;

    if (dto.resultado === 'GANADA') {
      const status =
        estadoPagoPrev === EstadoPagoReserva.REEMBOLSADO
          ? 'refunded'
          : estadoPagoPrev === EstadoPagoReserva.CANCELADO
            ? 'cancelled'
            : estadoPagoPrev === EstadoPagoReserva.RECHAZADO
              ? 'rejected'
              : 'approved';
      await this.pagosService.actualizarEstado(pago.id, {
        status,
        chargeback_id: null,
      });
      await this.reservasService.restaurarContracargo(
        reserva.id,
        estadoPagoPrev,
        estadoLiquidacionPrev,
        'Contracargo resuelto a favor del Anunciante',
      );
      disputa.estado = EstadoDisputa.GANADA;
      disputa.resolucion = dto.observacion?.trim() || 'Contracargo ganado';
    } else {
      const importe = Number(disputa.importe);
      const total = importe >= Number(pago.amount) - TOLERANCIA_MONETARIA;
      const reembolso = await this.reembolsos.crearSolicitud({
        reserva,
        pago,
        tipo: total ? TipoReembolso.CONTRACARGO : TipoReembolso.PARCIAL,
        origen: OrigenReembolso.CONTRACARGO,
        importe,
        motivo: 'Contracargo perdido',
        idSolicitadoPor: idAdmin,
        idempotencyKey: `disputa:${disputa.id}`,
      });
      // El contracargo ya revirtió el dinero en Mercado Pago: se registra,
      // pero no se dispara un segundo reembolso automático.
      await this.reembolsos.registrarManual(
        reembolso.id,
        dto.referencia?.trim() || disputa.chargeback_id || `contracargo-${disputa.id}`,
        idAdmin,
      );
      // El orquestador aplica el estado de la reserva y libera fechas solo
      // cuando el contracargo perdido ocurre antes del inicio.
      await this.cancelaciones.aplicarReembolsoConfirmado(reembolso.id);
      disputa.estado = EstadoDisputa.PERDIDA;
      disputa.resolucion = dto.observacion?.trim() || 'Contracargo perdido';
    }

    disputa.resuelto_por = referenciaUsuario(idAdmin);
    disputa.resuelto_en = new Date();
    return this.disputas.guardar(disputa);
  }
}
