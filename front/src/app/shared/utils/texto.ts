/** Normaliza para búsquedas locales: sin acentos, sin mayúsculas y en español. */
export function normalizarTexto(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('es-AR');
}
