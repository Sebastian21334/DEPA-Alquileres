import { formatearImporteConMoneda, formatearPorcentaje } from './formato-numero';

/** Cómo se repartió el cobro de la reserva; lo arma el back con el pago de Mercado Pago. */
export interface DesglosePago {
  pagoInquilino: number;
  devueltoInquilino: number;
  comisionDepa: number;
  /** Porcentaje con que se calculó la comisión; null si no se aplicó. */
  porcentajeComision: number | null;
  pagadoAnunciante: number;
}

/**
 * Explica cómo se llega del ingreso bruto (lo que pagó el inquilino) al neto transferido, que ya se muestra como importe.
 * Sin devolución ni comisión el bruto y el neto coinciden y no hay nada que explicar.
 */
export function filasDesglose(desglose: DesglosePago, moneda: string | null): { etiqueta: string; importe: string }[] {
  const { pagoInquilino, devueltoInquilino, comisionDepa, porcentajeComision } = desglose;
  if (devueltoInquilino <= 0 && comisionDepa <= 0) return [];
  const descuento = (valor: number) => `− ${formatearImporteConMoneda(valor, moneda)}`;
  const filas = [{ etiqueta: 'Ingreso bruto (pagó el inquilino)', importe: formatearImporteConMoneda(pagoInquilino, moneda) }];
  if (devueltoInquilino > 0) filas.push({ etiqueta: 'Devuelto al inquilino', importe: descuento(devueltoInquilino) });
  // Si hubo devolución, DEPA no cobra comisión (Términos, punto 4).
  filas.push(comisionDepa > 0
    ? { etiqueta: porcentajeComision === null ? 'Comisión DEPA' : `Comisión DEPA (${formatearPorcentaje(porcentajeComision)})`, importe: descuento(comisionDepa) }
    : { etiqueta: 'Comisión DEPA', importe: 'No se aplica (hubo devolución)' });
  return filas;
}
