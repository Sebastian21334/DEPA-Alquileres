import { formatearImporteConMoneda } from './formato-numero';

/** Cómo se repartió el cobro de la reserva; lo arma el back con el pago de Mercado Pago. */
export interface DesglosePago {
  pagoInquilino: number;
  devueltoInquilino: number;
  comisionDepa: number;
  pagadoAnunciante: number;
}

/**
 * Explica por qué lo pagado al anunciante, que ya se muestra como importe, es menos de lo que pagó el inquilino.
 * Sin devolución ni comisión no hay nada que explicar.
 */
export function filasDesglose(desglose: DesglosePago, moneda: string | null): { etiqueta: string; importe: string }[] {
  if (desglose.devueltoInquilino <= 0 && desglose.comisionDepa <= 0) return [];
  const filas: [string, number][] = [
    ['Pagó el inquilino', desglose.pagoInquilino],
    ...(desglose.devueltoInquilino > 0 ? [['Devuelto al inquilino', desglose.devueltoInquilino] as [string, number]] : []),
    ...(desglose.comisionDepa > 0 ? [['Comisión DEPA', desglose.comisionDepa] as [string, number]] : []),
  ];
  return filas.map(([etiqueta, valor]) => ({ etiqueta, importe: formatearImporteConMoneda(valor, moneda) }));
}
