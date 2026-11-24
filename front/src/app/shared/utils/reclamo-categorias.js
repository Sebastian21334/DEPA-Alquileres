export const CATEGORIAS_RECLAMO = {
    LIMPIEZA: 'Limpieza', MANTENIMIENTO: 'Mantenimiento', INGRESO: 'Problemas de ingreso',
    DESCRIPCION: 'La propiedad no coincide', OTRO: 'Otro motivo', DEMORA_ADMINISTRATIVA: 'Demora administrativa',
    CODIGO_BLOQUEADO: 'Pedido de reinicio del código de alojamiento',
};
const FALTANTE_CANCELACION = 'Reembolso faltante de cancelación';
/** Categoría que se muestra: el reclamo por el faltante de una cancelación tiene su propia etiqueta. */
export function etiquetaCategoriaReclamo(reclamo) {
    return reclamo.solicitud_cancelacion_id && reclamo.categoria !== 'DEMORA_ADMINISTRATIVA' ? FALTANTE_CANCELACION : CATEGORIAS_RECLAMO[reclamo.categoria];
}
/** Todas las etiquetas posibles, para filtrar por categoría. */
export const ETIQUETAS_CATEGORIA_RECLAMO = [...Object.values(CATEGORIAS_RECLAMO), FALTANTE_CANCELACION];
