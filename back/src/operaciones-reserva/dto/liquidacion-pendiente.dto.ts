import { ReservaRespuestaDto } from '../../reservas-consulta/dto/reserva-respuesta.dto';

/** Reserva del panel de liquidaciones con lo que corresponde pagarle al anunciante. */
export class LiquidacionPendienteDto extends ReservaRespuestaDto {
  importe_a_liquidar: number;
  moneda_liquidacion: string;
  habilitada_para_pago: boolean;
}
