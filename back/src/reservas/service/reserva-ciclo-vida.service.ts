import { CatalogosService } from '../../catalogos/service/catalogos.service';
import { Injectable } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import { Reserva, type ActorCancelacion, type CausaCancelacion } from '../entity/reserva.entity';
import { ReservaDecisionService } from './reserva-decision.service';

/**
 * Transiciones de estado de una reserva. La entidad es anémica; este service
 * concentra las reglas y los campos que cambian juntos.
 */
@Injectable()
export class ReservaCicloVidaService {
  constructor(private readonly decision: ReservaDecisionService, private readonly catalogos: CatalogosService) {}

  confirmarPago(reserva: Reserva, fechaPago: Date, codigoAlojamiento: string): void {
    reserva.estado_pago = this.catalogos.codigoEstado('PAGO_RESERVA', 'APROBADO');
    reserva.fecha_pago = fechaPago;
    reserva.pago_vencimiento = null;
    reserva.codigo_alojamiento = codigoAlojamiento;
    reserva.codigo_generado_en = new Date();
    reserva.codigo_validado_en = null;
    reserva.intentos_codigo = 0;
    reserva.estado_liquidacion = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'RETENIDO');
  }

  cerrarSinPago(reserva: Reserva, estado: string, actor?: ActorCancelacion, motivo?: string, causa?: CausaCancelacion): void {
    reserva.estado_pago = estado;
    reserva.estado_liquidacion =
      estado === this.catalogos.codigoEstado('PAGO_RESERVA', 'REEMBOLSADO')
        ? this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_INQUILINO')
        : this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'NO_APLICA');
    this.cancelar(reserva, actor, motivo, causa);
  }

  reactivarPago(reserva: Reserva, fechaPago: Date, codigoAlojamiento: string): void {
    reserva.cancelada = false;
    reserva.fecha_cancelacion = null;
    reserva.causa_cancelacion = null;
    this.confirmarPago(reserva, fechaPago, codigoAlojamiento);
  }

  registrarPagoParaRevision(reserva: Reserva, fechaPago: Date, motivo: string): void {
    reserva.estado_pago = this.catalogos.codigoEstado('PAGO_RESERVA', 'APROBADO');
    reserva.fecha_pago = fechaPago;
    reserva.estado_liquidacion = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'EN_REVISION');
    reserva.observacion_liquidacion = motivo.trim();
    reserva.fecha_resolucion_liquidacion = null;
    reserva.codigo_alojamiento = null;
    reserva.codigo_generado_en = null;
    reserva.codigo_validado_en = null;
    reserva.intentos_codigo = 0;
  }

  cancelar(reserva: Reserva, actor?: ActorCancelacion, motivo?: string, causa?: CausaCancelacion): void {
    reserva.cancelada = true;
    reserva.fecha_cancelacion = new Date();
    if (actor) reserva.cancelada_por = actor;
    if (causa) reserva.causa_cancelacion = causa;
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
    if (reserva.estado_liquidacion === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'NO_APLICA'))
      reserva.estado_liquidacion = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'RETENIDO');
    return true;
  }

  registrarIntentoCodigo(reserva: Reserva, codigo: string): boolean {
    const recibido = Buffer.from(codigo.trim().toUpperCase());
    const esperado = Buffer.from(reserva.codigo_alojamiento ?? '');
    const coincide =
      esperado.length > 0 &&
      recibido.length === esperado.length &&
      timingSafeEqual(recibido, esperado);
    if (!coincide) {
      reserva.intentos_codigo += 1;
      if (this.decision.codigoBloqueado(reserva)) {
        reserva.estado_liquidacion = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'EN_REVISION');
        reserva.observacion_liquidacion =
          'Código bloqueado después de cinco intentos incorrectos';
      }
      return false;
    }
    reserva.codigo_validado_en = new Date();
    reserva.estado_liquidacion =
      this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PENDIENTE_PAGO_PROPIETARIO');
    reserva.observacion_liquidacion =
      'Código de alojamiento validado por el anunciante';
    return true;
  }

  resolverLiquidacion(reserva: Reserva, estado: string, referencia?: string, observacion?: string): void {
    reserva.estado_liquidacion = estado;
    reserva.referencia_liquidacion = referencia?.trim() || null;
    reserva.observacion_liquidacion =
      observacion?.trim() || reserva.observacion_liquidacion;
    reserva.fecha_resolucion_liquidacion = this.decision.liquidacionResuelta(
      reserva,
    )
      ? new Date()
      : null;
    if (estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'RETENIDO'))
      reserva.intentos_codigo = 0;
    if (estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_INQUILINO')) {
      reserva.estado_pago = this.catalogos.codigoEstado('PAGO_RESERVA', 'REEMBOLSADO');
      this.cancelar(reserva, 'ADMINISTRADOR');
    }
    if (estado === this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_PARCIAL_INQUILINO'))
      reserva.fecha_resolucion_liquidacion = new Date();
  }

  restaurarPagoAprobado(reserva: Reserva): void {
    if (reserva.estado_pago === this.catalogos.codigoEstado('PAGO_RESERVA', 'CONTRACARGO'))
      reserva.estado_pago = this.catalogos.codigoEstado('PAGO_RESERVA', 'APROBADO');
  }

  /** Congela la liquidación cuando se abre un reclamo antes del pago al propietario. */
  marcarEnRevisionPorReclamo(reserva: Reserva, motivo: string): void {
    reserva.estado_liquidacion = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'EN_REVISION');
    reserva.observacion_liquidacion = motivo.trim();
    reserva.fecha_resolucion_liquidacion = null;
  }

  /** Libera la retención cuando el reclamo se resuelve sin devolución. */
  resolverReclamoSinDevolucion(reserva: Reserva, observacion: string): void {
    reserva.estado_liquidacion = this.decision.codigoValidado(reserva)
      ? this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'PENDIENTE_PAGO_PROPIETARIO')
      : this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'RETENIDO');
    reserva.observacion_liquidacion = observacion.trim();
    reserva.fecha_resolucion_liquidacion = null;
  }

  /** Congela la reserva mientras Mercado Pago tramita un contracargo. */
  marcarContracargoPorDisputa(reserva: Reserva, motivo: string): void {
    reserva.estado_pago = this.catalogos.codigoEstado('PAGO_RESERVA', 'CONTRACARGO');
    reserva.estado_liquidacion = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'EN_REVISION');
    reserva.observacion_liquidacion = motivo.trim();
    reserva.fecha_resolucion_liquidacion = null;
  }

  /** Restaura el estado previo cuando el contracargo se resuelve a favor. */
  restaurarContracargo(reserva: Reserva, estadoPago: string, estadoLiquidacion: string, observacion: string): void {
    reserva.estado_pago = estadoPago;
    reserva.estado_liquidacion = estadoLiquidacion;
    reserva.observacion_liquidacion = observacion.trim();
  }

  aplicarReembolsoTotal(reserva: Reserva): void {
    reserva.estado_pago = this.catalogos.codigoEstado('PAGO_RESERVA', 'REEMBOLSADO');
    reserva.estado_liquidacion = this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_INQUILINO');
    reserva.fecha_resolucion_liquidacion = new Date();
  }

  aplicarReembolsoParcial(reserva: Reserva): void {
    reserva.estado_liquidacion =
      this.catalogos.codigoEstado('LIQUIDACION_RESERVA', 'DEVUELTO_PARCIAL_INQUILINO');
    reserva.fecha_resolucion_liquidacion = new Date();
  }

  marcarAvisoEnviado(reserva: Reserva, destinatario: 'inquilino' | 'anunciante'): void {
    if (destinatario === 'inquilino')
      reserva.email_confirmacion_inquilino_enviado = true;
    else reserva.email_nueva_reserva_anunciante_enviado = true;
  }
}
