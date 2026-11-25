import type { ReservaRespuestaDto } from '../../reservas-consulta/dto/reserva-respuesta.dto';

/** Reserva del panel de liquidaciones con lo que le corresponde al anunciante, calculado desde el pago. */
export type LiquidacionPendienteDto = ReservaRespuestaDto & {
  fecha_disponible_pago: string | null;
  /** Lo que pagó el inquilino menos lo que ya se le devolvió. */
  importe_a_liquidar: number;
  moneda_liquidacion: string;
  importe_comision_depa: number;
  importe_neto_anunciante: number;
  /** Se le puede registrar el pago al anunciante hoy. */
  habilitada_para_pago: boolean;
  reclamos: { id: number; categoria: string; estado: string; resolucion: string | null; motivo_resolucion: string | null; solicitud_cancelacion_id: number | null }[];
  cancelaciones: { id: number; estado: string; motivo: string; observacion: string | null; solicitante_id: number }[];
};
