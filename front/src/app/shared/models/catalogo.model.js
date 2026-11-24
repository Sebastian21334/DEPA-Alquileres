// Interfaces que reflejan los catálogos del módulo `catalogos` del backend.
// Todas comparten la misma forma (id, nombre, descripción opcional).
// GET /catalogos/tipos-propiedad | /modalidades | /tipos-moneda | /tipos-anunciante | /roles
/** Código que figura en el nombre de la moneda, por ejemplo «Dólar (USD)». */
export function codigoMoneda(moneda) {
    const codigo = moneda.nombre.match(/\b(ARS|USD)\b/i)?.[1].toUpperCase();
    return codigo === 'ARS' || codigo === 'USD' ? codigo : null;
}
/** Indica si la modalidad trabaja con calendario y reservas por fecha (alquiler temporal). */
export function admiteReservasPorFecha(modalidad) {
    return modalidad?.admite_reservas_por_fecha ?? false;
}
