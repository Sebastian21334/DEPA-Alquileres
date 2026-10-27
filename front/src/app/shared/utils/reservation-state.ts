import type { Reserva } from '../services/reservation.service';

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

export function puedeConsultarCodigo(reserva: Reserva): boolean {
  return estadiaActiva(reserva) && !reserva.codigo_validado_en;
}
