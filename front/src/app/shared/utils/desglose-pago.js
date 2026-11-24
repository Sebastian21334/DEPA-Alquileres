import { formatearImporteConMoneda } from './formato-numero';
/**
 * Explica por qué lo pagado al anunciante, que ya se muestra como importe, es menos de lo que pagó el inquilino.
 * Sin devolución ni comisión no hay nada que explicar.
 */
export function filasDesglose(desglose, moneda) {
    if (desglose.devueltoInquilino <= 0 && desglose.comisionDepa <= 0)
        return [];
    const filas = [
        ['Pagó el inquilino', desglose.pagoInquilino],
        ...(desglose.devueltoInquilino > 0 ? [['Devuelto al inquilino', desglose.devueltoInquilino]] : []),
        ...(desglose.comisionDepa > 0 ? [['Comisión DEPA', desglose.comisionDepa]] : []),
    ];
    return filas.map(([etiqueta, valor]) => ({ etiqueta, importe: formatearImporteConMoneda(valor, moneda) }));
}
