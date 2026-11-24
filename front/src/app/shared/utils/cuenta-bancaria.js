/**
 * Muestra un CBU o CVU legible. Respeta sus dos bloques (8 dígitos de entidad y
 * sucursal, 14 de cuenta) y los agrupa de a cuatro. Para copiar se usan los 22 dígitos.
 */
export function formatearCbu(cbu) {
    const digitos = cbu.replace(/\D/g, '');
    if (digitos.length !== 22)
        return cbu;
    const agrupar = (bloque) => bloque.match(/.{1,4}/g)?.join(' ') ?? bloque;
    return `${agrupar(digitos.slice(0, 8))} · ${agrupar(digitos.slice(8))}`;
}
/** Las billeteras virtuales usan CVU, que empieza con 000 en lugar del código de un banco. */
export function tipoCuentaBancaria(cbu) {
    return cbu.replace(/\D/g, '').startsWith('000') ? 'CVU' : 'CBU';
}
/** CUIT/CUIL con guiones (20-12345678-3), venga como venga guardado. */
export function formatearCuit(cuit) {
    const digitos = cuit.replace(/\D/g, '');
    return digitos.length === 11 ? `${digitos.slice(0, 2)}-${digitos.slice(2, 10)}-${digitos.slice(10)}` : cuit;
}
