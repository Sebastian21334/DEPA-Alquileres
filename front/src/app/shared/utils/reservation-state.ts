import type { Reserva } from '../services/reservation.service';
import { rentalDays } from './rental-dates';

export type EstadoEstadia =
  | 'PENDIENTE_PAGO'
  | 'CONFIRMADA'
  | 'PENDIENTE_INGRESO'
  | 'EN_CURSO'
  | 'FINALIZADA'
  | 'INGRESO_NO_VERIFICADO'
  | 'CANCELADA'
  | 'REEMBOLSADA'
  | 'PAGO_RECHAZADO'
  | 'EN_DISPUTA'
  | 'FECHAS_A_REVISAR';

export const etiquetasEstadia: Record<EstadoEstadia, string> = {
  PENDIENTE_PAGO: 'Pendiente de pago',
  CONFIRMADA: 'Confirmada',
  PENDIENTE_INGRESO: 'Pendiente de ingreso',
  EN_CURSO: 'En curso',
  FINALIZADA: 'Finalizada',
  INGRESO_NO_VERIFICADO: 'Ingreso no verificado',
  CANCELADA: 'Cancelada',
  REEMBOLSADA: 'Reembolsada',
  PAGO_RECHAZADO: 'Pago rechazado',
  EN_DISPUTA: 'En disputa',
  FECHAS_A_REVISAR: 'Fechas pendientes de revisión',
};

export function devolucionRegistrada(reserva: Reserva) {
  if (reserva.estado_liquidacion === 'DEVUELTO_PARCIAL_INQUILINO') {
    return {
      etiqueta: 'Reembolsada parcialmente',
      mensaje: 'Devolución parcial al inquilino registrada',
    };
  }
  if (reserva.estado_liquidacion === 'DEVUELTO_INQUILINO' || reserva.estado_estadia === 'REEMBOLSADA') {
    return {
      etiqueta: etiquetasEstadia.REEMBOLSADA,
      mensaje: 'Devolución total al inquilino registrada',
    };
  }
  return null;
}

export function estadiaActiva(reserva: Reserva): boolean {
  return (
    reserva.estado_pago === 'APROBADO' &&
    !reserva.cancelada &&
    !reserva.finalizada &&
    ['CONFIRMADA', 'PENDIENTE_INGRESO', 'EN_CURSO'].includes(reserva.estado_estadia)
  );
}

export function puedeReprogramar(reserva: Reserva): boolean {
  return estadiaActiva(reserva) &&
    reserva.estado_estadia === 'CONFIRMADA' &&
    !reserva.codigo_validado_en &&
    !['EN_REVISION', 'PAGADO_PROPIETARIO', 'DEVUELTO_INQUILINO', 'DEVUELTO_PARCIAL_INQUILINO']
      .includes(reserva.estado_liquidacion) &&
    !!reserva.publicacion &&
    rentalDays(reserva.fecha_inicio, reserva.fecha_fin) > 0 &&
    Number(reserva.precio_unitario_contratado) > 0 &&
    Number(reserva.importe_contratado) > 0 &&
    ['ARS', 'USD'].includes(reserva.moneda_contratada ?? '');
}

/**
 * Liquidación ya decidida: Administración confirmó el ingreso (pendiente de pago al anunciante),
 * se pagó o se devolvió al inquilino. Desde ahí el código de alojamiento ya no cuenta.
 */
const LIQUIDACION_DECIDIDA = ['PENDIENTE_PAGO_PROPIETARIO', 'PAGADO_PROPIETARIO', 'DEVUELTO_INQUILINO', 'DEVUELTO_PARCIAL_INQUILINO'];

function liquidacionDecidida(reserva: { estado_liquidacion?: string | null }): boolean {
  return LIQUIDACION_DECIDIDA.includes(reserva.estado_liquidacion ?? '');
}

export function puedeConsultarCodigo(reserva: Reserva): boolean {
  return (estadiaActiva(reserva) || ingresoEnPlazo(reserva)) && !reserva.codigo_validado_en && !liquidacionDecidida(reserva);
}

/** Solo los datos que decide la carga del código, para usarla también desde un reclamo. */
type EstadoCodigo = Partial<Pick<Reserva, 'estado_estadia' | 'estado_liquidacion' | 'fecha_fin' | 'intentos_codigo_restantes'>>;

/** El anunciante carga el código mientras siga pendiente, sin bloqueo ni revisión ni una decisión sobre el pago. */
export function puedeValidarCodigo(reserva: EstadoCodigo): boolean {
  return (reserva.estado_estadia === 'PENDIENTE_INGRESO' || ingresoEnPlazo(reserva)) &&
    reserva.estado_liquidacion !== 'EN_REVISION' && !liquidacionDecidida(reserva) && reserva.intentos_codigo_restantes !== 0;
}

/** T34: con el código bloqueado, el anunciante pide el reinicio solo si el pago todavía no se decidió. */
export function puedePedirReinicioCodigo(reserva: Reserva): boolean {
  return !reserva.cancelada && !reserva.codigo_validado_en && reserva.intentos_codigo_restantes === 0 &&
    !liquidacionDecidida(reserva) && !devolucionRegistrada(reserva);
}

function ingresoEnPlazo(reserva: EstadoCodigo): boolean {
  if (reserva.estado_estadia !== 'INGRESO_NO_VERIFICADO' || reserva.estado_liquidacion !== 'RETENIDO' || !reserva.fecha_fin) return false;
  const vencimiento = new Date(`${reserva.fecha_fin}T00:00:00Z`);
  if (!Number.isFinite(vencimiento.getTime())) return false;
  vencimiento.setUTCDate(vencimiento.getUTCDate() + 5);
  const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  return hoy < vencimiento.toISOString().slice(0, 10);
}
