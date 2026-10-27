/** Aritmética decimal con enteros: evita redondear por día antes de calcular el total. */
export function decimalEntero(
  valor: string | number,
  decimales: number,
): bigint {
  const texto = String(valor);
  if (!/^\d+(\.\d+)?$/.test(texto)) throw new Error('Importe decimal inválido');
  const [entero, fraccion = ''] = texto.split('.');
  if (fraccion.length > decimales)
    throw new Error('El importe tiene demasiados decimales');
  return (
    BigInt(entero) * 10n ** BigInt(decimales) +
    BigInt(fraccion.padEnd(decimales, '0'))
  );
}
export function importeTexto(centavos: bigint): string {
  if (centavos < 0n || centavos > 9999999999n)
    throw new Error('El total supera el máximo admitido para una reserva');
  return `${centavos / 100n}.${String(centavos % 100n).padStart(2, '0')}`;
}
export function monedaPublicacion(nombre?: string): 'ARS' | 'USD' {
  const codigo = (nombre ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
  const ars = /\bARS\b/.test(codigo),
    usd = /\bUSD\b/.test(codigo);
  if (ars && !usd) return 'ARS';
  if (usd && !ars) return 'USD';
  if (
    [
      'ARS',
      '$',
      '$ARS',
      'AR$',
      'PESO',
      'PESOS',
      'PESO ARGENTINO',
      'PESOS ARGENTINOS',
    ].includes(codigo)
  )
    return 'ARS';
  if (
    [
      'USD',
      'US$',
      'U$S',
      '$USD',
      'DOLAR',
      'DOLARES',
      'DOLAR ESTADOUNIDENSE',
      'DOLARES ESTADOUNIDENSES',
    ].includes(codigo)
  )
    return 'USD';
  throw new Error(
    'La moneda de la publicación no está habilitada para reservas',
  );
}
