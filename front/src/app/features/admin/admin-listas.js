import { ETIQUETAS_CATEGORIA_RECLAMO, etiquetaCategoriaReclamo } from '../../shared/utils/reclamo-categorias';
import { fechaHoyArgentina } from '../../shared/utils/rental-dates';
// Qué datos busca y qué filtros tiene cada lista del panel admin. Todo se aplica en el navegador.
export const ORIGENES_REEMBOLSO = {
    CANCELACION: 'Cancelación', RECLAMO: 'Reclamo', CONTRACARGO: 'Contracargo',
    PAGO_TARDIO: 'Pago tardío', AJUSTE_ADMIN: 'Ajuste administrativo',
};
export const reclamoAbierto = (reclamo) => reclamo.estado === 'ABIERTO' || reclamo.estado === 'EN_REVISION';
export const reembolsoPendiente = (reembolso) => reembolso.estado === 'PENDIENTE' || reembolso.estado === 'EN_PROCESO';
/** Días que faltan para poder pagar al anunciante; null si la fecha de habilitación no es válida. */
export function diasEsperaLiquidacion(settlement) {
    const fecha = settlement.fecha_disponible_pago;
    if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha))
        return null;
    const fechaPago = Date.parse(`${fecha}T00:00:00Z`);
    if (!Number.isFinite(fechaPago) || new Date(fechaPago).toISOString().slice(0, 10) !== fecha)
        return null;
    return Math.max(0, Math.round((fechaPago - Date.parse(`${fechaHoyArgentina()}T00:00:00Z`)) / 86_400_000));
}
// Lo decide el back: estado pendiente para el anunciante, resto mayor a cero y fecha de pago cumplida.
export const pagoHabilitado = (settlement) => settlement.habilitada_para_pago;
/** El pago queda para el anunciante: pendiente o el resto de una devolución parcial. */
export const pendienteParaAnunciante = (settlement) => settlement.estado_liquidacion === 'PENDIENTE_PAGO_PROPIETARIO' || settlement.estado_liquidacion === 'DEVUELTO_PARCIAL_INQUILINO';
/** Hubo una devolución al inquilino: lo que se le liquida al anunciante es menos que lo pagado. */
export const tieneDevolucion = (settlement) => Number(settlement.importe_a_liquidar) < Number(settlement.monto_pago) - 0.009;
export function etiquetaLiquidacion(settlement) {
    if (settlement.estado_liquidacion === 'EN_REVISION')
        return 'En revisión';
    if (settlement.estado_liquidacion === 'DEVUELTO_PARCIAL_INQUILINO')
        return 'Devolución parcial · resto al anunciante';
    if (settlement.cancelada)
        return 'Cancelada · retención para el anunciante';
    return settlement.codigo_validado_en ? 'Código validado' : 'Ingreso no verificado: plazo vencido';
}
export function nombreInquilino(settlement) {
    return [settlement.usuario_nombre ?? settlement.usuario?.nombre, settlement.usuario_apellido ?? settlement.usuario?.apellido].filter(Boolean).join(' ') || 'Inquilino eliminado';
}
/** La conversación espera respuesta si el último mensaje es del usuario bloqueado. */
export function apelacionSinResponder(detalle) {
    const ultimo = detalle.mensajes?.at(-1);
    return ultimo ? ultimo.autor === 'usuario' : !!detalle.apelacion && !detalle.respuesta;
}
export const tieneApelacion = (detalle) => !!detalle.apelacion || !!detalle.mensajes?.length;
const esInmobiliaria = (solicitud) => !!(solicitud.razon_social || solicitud.matricula_profesional);
export const textosCancelacion = (solicitud) => [solicitud.id, solicitud.reserva?.id, solicitud.reserva?.usuario?.nombre, solicitud.reserva?.usuario?.apellido, solicitud.reserva?.publicacion?.titulo, solicitud.motivo];
export const FILTROS_CANCELACION = [{
        nombre: 'devolucion', etiqueta: 'Devolución', opciones: [
            { valor: 'todas', etiqueta: 'Todas' },
            { valor: 'con', etiqueta: 'Con devolución', aplica: (solicitud) => !!solicitud.devolucion && solicitud.devolucion.porcentaje > 0 },
            { valor: 'sin', etiqueta: 'Sin devolución (0 %)', aplica: (solicitud) => solicitud.devolucion?.porcentaje === 0 },
            { valor: 'sin-calculo', etiqueta: 'Sin cálculo', aplica: (solicitud) => !solicitud.devolucion },
        ],
    }];
export const textosReclamo = (reclamo) => [reclamo.id, reclamo.reserva?.id, reclamo.reserva?.publicacion?.titulo, reclamo.inquilino?.nombre, reclamo.inquilino?.apellido, reclamo.anunciante?.nombre, reclamo.anunciante?.apellido, reclamo.descripcion];
export const FILTROS_RECLAMO = [
    {
        nombre: 'estado', etiqueta: 'Estado', opciones: [
            { valor: 'todos', etiqueta: 'Todos' },
            { valor: 'abiertos', etiqueta: 'Abiertos y en revisión', aplica: reclamoAbierto },
            { valor: 'inquilino', etiqueta: 'A favor del inquilino', aplica: (reclamo) => reclamo.estado === 'RESUELTO_INQUILINO' },
            { valor: 'anunciante', etiqueta: 'A favor del anunciante', aplica: (reclamo) => reclamo.estado === 'RESUELTO_ANUNCIANTE' },
            { valor: 'cerrados', etiqueta: 'Cerrados', aplica: (reclamo) => reclamo.estado === 'CERRADO' },
        ],
    },
    {
        nombre: 'categoria', etiqueta: 'Categoría', opciones: [
            { valor: 'todas', etiqueta: 'Todas' },
            ...ETIQUETAS_CATEGORIA_RECLAMO.map((etiqueta) => ({ valor: etiqueta, etiqueta, aplica: (reclamo) => etiquetaCategoriaReclamo(reclamo) === etiqueta })),
        ],
    },
];
export const textosReembolso = (reembolso) => [reembolso.id, reembolso.reserva?.id, reembolso.reserva?.publicacion?.titulo, reembolso.reserva?.usuario?.nombre, reembolso.reserva?.usuario?.apellido, reembolso.motivo, reembolso.referencia_externa];
export const FILTROS_REEMBOLSO = [
    {
        nombre: 'estado', etiqueta: 'Estado', opciones: [
            { valor: 'todos', etiqueta: 'Todos' },
            { valor: 'pendientes', etiqueta: 'Pendientes', aplica: reembolsoPendiente },
            { valor: 'fallidos', etiqueta: 'Fallidos', aplica: (reembolso) => reembolso.estado === 'FALLIDO' },
            { valor: 'aprobados', etiqueta: 'Aprobados', aplica: (reembolso) => reembolso.estado === 'APROBADO' },
            { valor: 'cerrados', etiqueta: 'Rechazados o cancelados', aplica: (reembolso) => reembolso.estado === 'RECHAZADO' || reembolso.estado === 'CANCELADO' },
        ],
    },
    {
        nombre: 'origen', etiqueta: 'Origen', opciones: [
            { valor: 'todos', etiqueta: 'Todos' },
            // Los contracargos ya no se usan: la etiqueta queda solo para mostrar registros viejos.
            ...Object.entries(ORIGENES_REEMBOLSO).filter(([valor]) => valor !== 'CONTRACARGO')
                .map(([valor, etiqueta]) => ({ valor, etiqueta, aplica: (reembolso) => reembolso.origen === valor })),
        ],
    },
];
export const textosLiquidacion = (settlement) => [settlement.id, settlement.publicacion?.titulo, nombreInquilino(settlement), settlement.publicacion?.anunciante?.usuario?.nombre, settlement.publicacion?.anunciante?.usuario?.apellido];
export const FILTROS_LIQUIDACION = [{
        nombre: 'situacion', etiqueta: 'Situación', opciones: [
            { valor: 'todas', etiqueta: 'Todas' },
            { valor: 'habilitado', etiqueta: 'Pago habilitado', aplica: pagoHabilitado },
            { valor: 'espera', etiqueta: 'En espera', aplica: (settlement) => settlement.estado_liquidacion !== 'EN_REVISION' && !pagoHabilitado(settlement) },
            { valor: 'revision', etiqueta: 'En revisión', aplica: (settlement) => settlement.estado_liquidacion === 'EN_REVISION' },
        ],
    }];
export const textosPagoLiquidacion = (pago) => [pago.reservaId, pago.publicacion, pago.anunciante, pago.referencia, pago.administrador, pago.observacion];
export const textosVerificacion = (solicitud) => [solicitud.id, solicitud.anunciante.usuario?.nombre, solicitud.anunciante.usuario?.apellido, solicitud.anunciante.usuario?.email, solicitud.anunciante.cuit_cuil, solicitud.razon_social];
export const FILTROS_VERIFICACION = [
    {
        nombre: 'revision', etiqueta: 'Qué revisar', opciones: [
            { valor: 'todo', etiqueta: 'Todo' },
            { valor: 'identidad', etiqueta: 'Identidad', aplica: (solicitud) => solicitud.revisar_identidad },
            { valor: 'cbu', etiqueta: 'CBU', aplica: (solicitud) => !!solicitud.cbu_pendiente },
        ],
    },
    {
        nombre: 'tipo', etiqueta: 'Tipo de anunciante', opciones: [
            { valor: 'todos', etiqueta: 'Todos' },
            { valor: 'particular', etiqueta: 'Particular', aplica: (solicitud) => !esInmobiliaria(solicitud) },
            { valor: 'inmobiliaria', etiqueta: 'Inmobiliaria', aplica: esInmobiliaria },
        ],
    },
];
export const textosBloqueo = (bloqueo) => [bloqueo.usuario.nombre, bloqueo.usuario.apellido, bloqueo.usuario.email, bloqueo.detalle.motivo, bloqueo.administrador?.nombre, bloqueo.administrador?.apellido];
export const FILTROS_BLOQUEO = [{
        nombre: 'apelacion', etiqueta: 'Apelación', opciones: [
            { valor: 'todas', etiqueta: 'Todas' },
            { valor: 'en-curso', etiqueta: 'En curso (sin responder)', aplica: (bloqueo) => apelacionSinResponder(bloqueo.detalle) },
            { valor: 'respondida', etiqueta: 'Respondida', aplica: (bloqueo) => tieneApelacion(bloqueo.detalle) && !apelacionSinResponder(bloqueo.detalle) },
            { valor: 'sin', etiqueta: 'Sin apelación', aplica: (bloqueo) => !tieneApelacion(bloqueo.detalle) },
        ],
    }];
