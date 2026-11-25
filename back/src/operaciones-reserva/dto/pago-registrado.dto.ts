/** Cómo se repartió el cobro de la reserva, con el pago de Mercado Pago y lo transferido al anunciante. */
export interface DesglosePagoRegistradoDto {
  pagoInquilino: number;
  devueltoInquilino: number;
  /** Lo que quedó entre lo cobrado y lo transferido; 0 si no hubo comisión. */
  comisionDepa: number;
  /** Porcentaje de la reserva con que se calculó la comisión; null si no se aplicó. */
  porcentajeComision: number | null;
  pagadoAnunciante: number;
}

/** Pago registrado al anunciante con su desglose; null si la reserva no tiene un cobro registrado. */
export type ConDesglose<T> = T & { desglose: DesglosePagoRegistradoDto | null };
