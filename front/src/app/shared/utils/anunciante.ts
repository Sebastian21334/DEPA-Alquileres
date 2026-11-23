/** Misma regla que usa el alta de anunciante para distinguir una inmobiliaria. */
export function esInmobiliaria(tipo?: { nombre?: string | null } | null): boolean {
  return /inmobiliaria|institucional/i.test(tipo?.nombre ?? '');
}
