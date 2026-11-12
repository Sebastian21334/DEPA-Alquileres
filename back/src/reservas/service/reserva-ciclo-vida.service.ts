import { Injectable } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import {
  EstadoLiquidacionReserva,
  EstadoPagoReserva,
} from '../../catalogos/estados';
import { Reserva } from '../entity/reserva.entity';
import type { ActorCancelacion } from '../actor-cancelacion';
import { ReservaDecisionService } from './reserva-decision.service';

/**
 * Transiciones de estado de una reserva. La entidad es anémica; este service
 * concentra las reglas y los campos que cambian juntos.
 */
@Injectable()
export class ReservaCicloVidaService {
  constructor(private readonly decision: ReservaDecisionService) {}

  confirmarPago(reserva: Reserva, fechaPago: Date, codigoAlojamiento: string): void {
    reserva.estado_pago = EstadoPagoReserva.APROBADO;
    reserva.fecha_pago = fechaPago;
    reserva.pago_vencimiento = null;
    reserva.codigo_alojamiento = codigoAlojamiento;
    reserva.codigo_generado_en = new Date();
    reserva.codigo_validado_en = null;
    reserva.intentos_codigo = 0;
    reserva.estado_liquidacion = EstadoLiquidacionReserva.RETENIDO;
  }

  cerrarSinPago(reserva: Reserva, estado: EstadoPagoReserva, actor?: ActorCancelacion, motivo?: string): void {
    reserva.estado_pago = estado;
    reserva.estado_liquidacion =
      estado === EstadoPagoReserva.REEMBOLSADO
        ? EstadoLiquidacionReserva.DEVUELTO_INQUILINO
        : EstadoLiquidacionReserva.NO_APLICA;
    this.cancelar(reserva, actor, motivo);
  }

  reactivarPago(reserva: Reserva, fechaPago: Date, codigoAlojamiento: string): void {
    reserva.cancelada = false;
    reserva.fecha_cancelacion = null;
    this.confirmarPago(reserva, fechaPago, codigoAlojamiento);
  }

  registrarPagoParaRevision(reserva: Reserva, fechaPago: Date, motivo: string): void {
    reserva.estado_pago = EstadoPagoReserva.APROBADO;
    reserva.fecha_pago = fechaPago;
    reserva.estado_liquidacion = EstadoLiquidacionReserva.EN_REVISION;
    reserva.observacion_liquidacion = motivo.trim();
    reserva.fecha_resolucion_liquidacion = null;
    reserva.codigo_alojamiento = null;
    reserva.codigo_generado_en = null;
    reserva.codigo_validado_en = null;
    reserva.intentos_codigo = 0;
  }

  cancelar(reserva: Reserva, actor?: ActorCancelacion, motivo?: string): void {
    reserva.cancelada = true;
    reserva.fecha_cancelacion = new Date();
    if (actor) reserva.cancelada_por = actor;
    if (motivo?.trim()) reserva.motivo_cancelacion = motivo.trim();
  }

  finalizar(reserva: Reserva): void {
    reserva.finalizada = true;
  }

  reprogramar(reserva: Reserva, inicio: string, fin: string): void {
    reserva.fecha_inicio = inicio;
    reserva.fecha_fin = fin;
  }

  asegurarCodigoAlojamiento(reserva: Reserva, codigo: string): boolean {
    if (reserva.codigo_alojamiento) return false;
    reserva.codigo_alojamiento = codigo;
    reserva.codigo_generado_en = new Date();
    reserva.estado_liquidacion = EstadoLiquidacionReserva.RETENIDO;
    return true;
  }

  registrarIntentoCodigo(reserva: Reserva, codigo: string): boolean {
    const recibido = codigo.trim().toUpperCase();
    const esperado = reserva.codigo_alojamiento ?? '';
    const coincide =
      recibido.length === esperado.length &&
      timingSafeEqual(Buffer.from(recibido), Buffer.from(esperado));
    if (!coincide) {
      reserva.intentos_codigo += 1;
      if (this.decision.codigoBloqueado(reserva)) {
        reserva.estado_liquidacion = EstadoLiquidacionReserva.EN_REVISION;
        reserva.observacion_liquidacion =
          'Código bloqueado después de cinco intentos incorrectos';
      }
      return false;
    }
    reserva.codigo_validado_en = new Date();
    reserva.estado_liquidacion =
      EstadoLiquidacionReserva.PENDIENTE_PAGO_PROPIETARIO;
    reserva.observacion_liquidacion =
      'Código de alojamiento validado por el anunciante';
    return true;
  }

  resolverLiquidacion(reserva: Reserva, estado: EstadoLiquidacionReserva, referencia?: string, observacion?: string): void {
    reserva.estado_liquidacion = estado;
    reserva.referencia_liquidacion = referencia?.trim() || null;
    reserva.observacion_liquidacion =
      observacion?.trim() || reserva.observacion_liquidacion;
    reserva.fecha_resolucion_liquidacion = this.decision.liquidacionResuelta(
      reserva,
    )
      ? new Date()
      : null;
    if (estado === EstadoLiquidacionReserva.RETENIDO)
      reserva.intentos_codigo = 0;
    if (estado === EstadoLiquidacionReserva.DEVUELTO_INQUILINO) {
      reserva.estado_pago = EstadoPagoReserva.REEMBOLSADO;
      this.cancelar(reserva, 'ADMINISTRADOR');
    }
    if (estado === EstadoLiquidacionReserva.DEVUELTO_PARCIAL_INQUILINO)
      reserva.fecha_resolucion_liquidacion = new Date();
  }

  restaurarPagoAprobado(reserva: Reserva): void {
    if (reserva.estado_pago === EstadoPagoReserva.CONTRACARGO)
      reserva.estado_pago = EstadoPagoReserva.APROBADO;
  }

  /** Congela la liquidación cuando se abre un reclamo antes del pago al propietario. */
  marcarEnRevisionPorReclamo(reserva: Reserva, motivo: string): void {
    reserva.estado_liquidacion = EstadoLiquidacionReserva.EN_REVISION;
    reserva.observacion_liquidacion = motivo.trim();
    reserva.fecha_resolucion_liquidacion = null;
  }

  /** Libera la retención cuando el reclamo se resuelve sin devolución. */
  resolverReclamoSinDevolucion(reserva: Reserva, observacion: string): void {
    reserva.estado_liquidacion = this.decision.codigoValidado(reserva)
      ? EstadoLiquidacionReserva.PENDIENTE_PAGO_PROPIETARIO
      : EstadoLiquidacionReserva.RETENIDO;
    reserva.observacion_liquidacion = observacion.trim();
    reserva.fecha_resolucion_liquidacion = null;
  }

  /** Congela la reserva mientras Mercado Pago tramita un contracargo. */
  marcarContracargoPorDisputa(reserva: Reserva, motivo: string): void {
    reserva.estado_pago = EstadoPagoReserva.CONTRACARGO;
    reserva.estado_liquidacion = EstadoLiquidacionReserva.EN_REVISION;
    reserva.observacion_liquidacion = motivo.trim();
    reserva.fecha_resolucion_liquidacion = null;
  }

  /** Restaura el estado previo cuando el contracargo se resuelve a favor. */
  restaurarContracargo(reserva: Reserva, estadoPago: EstadoPagoReserva, estadoLiquidacion: EstadoLiquidacionReserva, observacion: string): void {
    reserva.estado_pago = estadoPago;
    reserva.estado_liquidacion = estadoLiquidacion;
    reserva.observacion_liquidacion = observacion.trim();
  }

  aplicarReembolsoTotal(reserva: Reserva): void {
    reserva.estado_pago = EstadoPagoReserva.REEMBOLSADO;
    reserva.estado_liquidacion = EstadoLiquidacionReserva.DEVUELTO_INQUILINO;
    reserva.fecha_resolucion_liquidacion = new Date();
  }

  aplicarReembolsoParcial(reserva: Reserva): void {
    reserva.estado_liquidacion =
      EstadoLiquidacionReserva.DEVUELTO_PARCIAL_INQUILINO;
    reserva.fecha_resolucion_liquidacion = new Date();
  }

  marcarAvisoEnviado(reserva: Reserva, destinatario: 'inquilino' | 'anunciante'): void {
    if (destinatario === 'inquilino')
      reserva.email_confirmacion_inquilino_enviado = true;
    else reserva.email_nueva_reserva_anunciante_enviado = true;
  }
}
