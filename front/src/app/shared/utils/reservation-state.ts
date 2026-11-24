import type { Reserva } from '../services/reservation.service';
import { DIAS_MINIMOS_REPROGRAMACION, diasDeAntelacion, rentalDays } from './rental-dates';
import { formatearImporteConMoneda } from './formato-numero';

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
  if (reserva.referencia_liquidacion?.startsWith('SIMULADO:tarjeta:')) {
    return { etiqueta: 'Devolución simulada', mensaje: 'Devolución de prueba. No se transfirió dinero.' };
  }
  // Lo devuelto sale del pago, así que sigue visible cuando después se le paga el resto al anunciante.
  const devolucion = reserva.devolucion_inquilino;
  if (devolucion && devolucion.devuelto < devolucion.pagado - 0.009) {
    return {
      etiqueta: 'Reembolsada parcialmente',
      mensaje: `Devolución parcial al inquilino: ${formatearImporteConMoneda(devolucion.devuelto, devolucion.moneda)} de ${formatearImporteConMoneda(devolucion.pagado, devolucion.moneda)}.`,
    };
  }
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
    diasDeAntelacion(reserva.fecha_inicio) >= DIAS_MINIMOS_REPROGRAMACION &&
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

/** El código se muestra solo durante la estadía: terminada, ya no prueba que el huésped estuvo en la propiedad. */
export function puedeConsultarCodigo(reserva: Reserva): boolean {
  return estadiaActiva(reserva) && !reserva.codigo_validado_en && !liquidacionDecidida(reserva);
}

/** Solo los datos que decide la carga del código, para usarla también desde un reclamo. */
type EstadoCodigo = Partial<Pick<Reserva, 'estado_estadia' | 'estado_liquidacion' | 'intentos_codigo_restantes'>>;

/** El anunciante carga el código durante la estadía, sin bloqueo ni revisión ni una decisión sobre el pago. */
export function puedeValidarCodigo(reserva: EstadoCodigo): boolean {
  return reserva.estado_estadia === 'PENDIENTE_INGRESO' &&
    reserva.estado_liquidacion !== 'EN_REVISION' && !liquidacionDecidida(reserva) && reserva.intentos_codigo_restantes !== 0;
}

/** Con el código bloqueado, el anunciante pide el reinicio solo si el pago todavía no se decidió. */
export function puedePedirReinicioCodigo(reserva: Reserva): boolean {
  return !reserva.cancelada && !reserva.codigo_validado_en && reserva.intentos_codigo_restantes === 0 &&
    !liquidacionDecidida(reserva) && !devolucionRegistrada(reserva);
}