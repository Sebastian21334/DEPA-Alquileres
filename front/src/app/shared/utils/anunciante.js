/** Misma regla que usa el alta de anunciante para distinguir una inmobiliaria. */
export function esInmobiliaria(tipo) {
    return /inmobiliaria|institucional/i.test(tipo?.nombre ?? '');
}
