import { Reserva } from '../../reservas/entity/reserva.entity';

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

/** Lo que se le devolvió al inquilino, según el pago y en su moneda. */
export interface DevolucionInquilinoDto {
  devuelto: number;
  pagado: number;
  moneda: string;
}

export class ReservaRespuestaDto extends Reserva {
  estado_estadia: EstadoEstadia;
  /** Último día (AAAA-MM-DD) para reclamar; null si está cancelada o no tiene fechas válidas. */
  fin_plazo_reclamo: string | null;
  /** Intentos de código que le quedan al anunciante antes del bloqueo. */
  intentos_codigo_restantes: number;
  /** Solo en los listados de las partes y en el resumen de la reserva; null si no hubo devolución. */
  devolucion_inquilino?: DevolucionInquilinoDto | null;
}
