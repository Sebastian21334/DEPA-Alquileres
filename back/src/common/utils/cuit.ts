/** Permite comparar el CUIT/CUIL con o sin guiones. */
export function digitosCuit(cuit: string): string {
  return cuit.replace(/\D/g, '');
}
