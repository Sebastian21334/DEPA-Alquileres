/**
 * Orden en que se aplican las migraciones sobre una base vacía, el mismo que usa
 * la base de pruebas. Toda migración nueva se agrega acá: un test falla si queda
 * un archivo de `migrations/` sin clasificar.
 */
const ORDEN = [
  '20261102-esquema-inicial.sql',
  '20261101-baja-logica-usuario.sql',
  '20261104-cuit-email-historicos.sql',
  '20261104-orden-imagenes.sql',
  '20261105-eliminacion-documentos.sql',
  '20261111-apelaciones-bloqueo.sql',
  '20261122-historial-bloqueos.sql',
  '20261111-publicaciones-eliminadas.sql',
  '20261120-reactivacion-cuenta.sql',
  '20261104-cancelaciones-devoluciones.sql',
  '20261112-causa-cancelacion-reserva.sql',
  '20261113-politica-cancelacion.sql',
  '20261110-estados-por-ambito.sql',
  '20261112-liquidaciones.sql',
  '20261113-reconciliar-liquidaciones.sql',
  '20261113-aplicacion-reembolsos.sql',
  '20261113-catalogos-de-expedientes.sql',
  '20261122-reinicio-codigo-alojamiento.sql',
  '20261113-retirar-liquidacion-de-reserva.sql',
  '20261116-historial-pagos-anunciantes.sql',
  '20261121-avisos-liquidacion-disponible.sql',
  '20261116-chat-reembolsos.sql',
  '20261121-reclamo-faltante-cancelacion.sql',
  '20261123-reclamo-demora-administrativa.sql',
  '20261113-vencimiento-pago-zona-horaria.sql',
  '20261116-cbu-anunciantes.sql',
  '20261116-pausa-actividades.sql',
  '20261122-comision-depa.sql',
  '20261123-comprobante-reembolso.sql',
  '20261123-imagenes-mensajes-reclamo.sql',
  '20261123-vencimiento-verificacion.sql',
  '20261123-fechas-con-zona-horaria.sql',
  '20261124-motivo-resolucion-reclamo.sql',
  '20261124-descripcion-publicacion-larga.sql',
  '20261124-nombres-archivos-utf8.sql',
  '20261125-mensajes-reclamo-administracion.sql',
  '20261126-retirar-notas-internas-reclamo.sql',
  '20261126-resenas.sql',
  '20261127-historial-denuncias-resenas.sql',
];

/** Anteriores al esquema inicial: sus cambios ya están incluidos en él. */
const CONSOLIDADAS = [
  '20261009-retirar-metodo-pago.sql',
  '20261027-calendario-unico.sql',
  '20261027-cotizaciones-cobros.sql',
  '20261027-reprogramacion-reservas.sql',
  '20261028-documentacion-inmobiliaria.sql',
  '20261028-verificacion-identidad.sql',
];

/** Pasos intermedios que otra migración reemplazó y que no se aplican en una base nueva. */
const REEMPLAZADAS = {
  '20261110-estados-disputa.sql': '20261110-estados-por-ambito.sql',
};

module.exports = { ORDEN, CONSOLIDADAS, REEMPLAZADAS };
