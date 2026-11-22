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

export class ReservaRespuestaDto extends Reserva {
  estado_estadia: EstadoEstadia;
  /** Último día (AAAA-MM-DD) para reclamar; null si está cancelada o no tiene fechas válidas. */
  fin_plazo_reclamo: string | null;
}
