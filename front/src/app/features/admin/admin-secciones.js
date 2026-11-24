/** Secciones del panel admin, agrupadas como en el menú lateral. */
export const ADMIN_NAVIGATION = [
    { label: 'Operaciones', items: [
            { id: 'cancelaciones', label: 'Cancelaciones' },
            { id: 'reclamos', label: 'Reclamos' },
            { id: 'reembolsos', label: 'Reembolsos' },
            { id: 'liquidaciones', label: 'Liquidaciones pendientes' },
            { id: 'historial-liquidaciones', label: 'Historial de liquidaciones' },
        ] },
    { label: 'Gestión', items: [
            { id: 'verificaciones', label: 'Verificaciones' },
            { id: 'publicaciones', label: 'Publicaciones' },
            { id: 'usuarios', label: 'Usuarios' },
            { id: 'bloqueos', label: 'Bloqueos y apelaciones' },
        ] },
    { label: 'Configuración', items: [
            { id: 'catalogos', label: 'Catálogos' },
            { id: 'ubicaciones', label: 'Ubicaciones' },
            { id: 'cotizaciones', label: 'Cotizaciones' },
            { id: 'comision', label: 'Comisión DEPA' },
        ] },
];
const SECCIONES = ADMIN_NAVIGATION.flatMap((grupo) => grupo.items);
/** La sección va en la URL (`/admin#reclamos`); un valor desconocido se ignora. */
export function seccionAdmin(valor) {
    return SECCIONES.find((seccion) => seccion.id === valor)?.id ?? null;
}
export function etiquetaSeccionAdmin(seccion) {
    return SECCIONES.find((item) => item.id === seccion)?.label ?? 'Resumen';
}
