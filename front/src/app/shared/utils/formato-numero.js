const FORMATO_ENTERO = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
const FORMATO_IMPORTE = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});
/** Formatea un entero con separadores de miles en es-AR. */
export function formatearEntero(valor) {
    return FORMATO_ENTERO.format(valor);
}
/** Formatea un importe con dos decimales y separadores de miles en es-AR. */
export function formatearImporte(valor) {
    return FORMATO_IMPORTE.format(valor);
}
/** Importe precedido por el código de moneda, por ejemplo «ARS 1.824,00». */
export function formatearImporteConMoneda(valor, moneda) {
    return [moneda, formatearImporte(valor)].filter(Boolean).join(' ');
}
