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

export function puedeConsultarCodigo(reserva: Reserva): boolean {
  return estadiaActiva(reserva) && !reserva.codigo_validado_en;
}
