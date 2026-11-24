const FORMATO_ENTERO = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
const FORMATO_IMPORTE = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formatea un entero con separadores de miles en es-AR. */
export function formatearEntero(valor: number): string {
  return FORMATO_ENTERO.format(valor);
}

/** Formatea un importe con dos decimales y separadores de miles en es-AR. */
export function formatearImporte(valor: number): string {
  return FORMATO_IMPORTE.format(valor);
}

/** Importe con el símbolo de su moneda (ARS si no se indica), por ejemplo «$ 1.824,00». */
export function formatearMoneda(valor: number | string, moneda?: string | null, decimalesMaximos?: number): string {
  return Number(valor).toLocaleString('es-AR', {
    style: 'currency',
    currency: moneda || 'ARS',
    ...(decimalesMaximos == null ? {} : { maximumFractionDigits: decimalesMaximos }),
  });
}

/** Importe precedido por el código de moneda, por ejemplo «ARS 1.824,00». */
export function formatearImporteConMoneda(valor: number, moneda: string | null): string {
  return [moneda, formatearImporte(valor)].filter(Boolean).join(' ');
}
