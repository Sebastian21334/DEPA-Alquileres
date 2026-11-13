const { catalogosDePrueba } = require('./soporte/catalogos-pruebas.cjs');
require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { CatalogosService } = require('../dist/catalogos/service/catalogos.service');
const { PublicacionesService } = require('../dist/publicaciones/service/publicaciones.service');
const { ReservaEstadoService } = require('../dist/reservas-consulta/service/reserva-estado.service');
const { ReservasService } = require('../dist/reservas/service/reservas.service');
const { CancelacionesService } = require('../dist/cancelaciones/service/cancelaciones.service');
const { ReembolsosService } = require('../dist/reembolsos/service/reembolsos.service');
const { ReclamosService } = require('../dist/reclamos/service/reclamos.service');
const { VerificacionAnuncianteService } = require('../dist/verificacion-anunciante/service/verificacion-anunciante.service');
const { CAMPOS_PRUEBA_PRIVADOS } = require('../dist/verificacion-anunciante/dto/solicitud-verificacion-respuesta.dto');

const catalogos = new CatalogosService();
const publicaciones = new PublicacionesService({}, catalogosDePrueba(catalogos));
const estados = new ReservaEstadoService(publicaciones, catalogosDePrueba());
const reserva = () => ({
  id: 1, estado_pago: 'APROBADO', cancelada: false, finalizada: false,
  fecha_inicio: '2099-01-01', fecha_fin: '2099-01-05',
  publicacion: { id: 2, modalidad: { nombre: 'Temporal', permite_reservas_por_fecha: null } },
});
const json = (valor) => JSON.parse(JSON.stringify(valor));

test('los servicios conservan el estado derivado y la modalidad al serializar una reserva', () => {
  const respuesta = json(estados.prepararRespuesta(reserva()));
  assert.equal(respuesta.estado_estadia, 'CONFIRMADA');
  assert.equal(respuesta.publicacion.modalidad.admite_reservas_por_fecha, true);
  assert.equal(respuesta.publicacion.modalidad.permite_reservas_por_fecha, null);
});

test('la proyección de modalidades conserva los valores explícitos y el respaldo histórico', () => {
  for (const [nombre, permite, esperado] of [
    ['Temporal', null, true], ['Diario', null, true], ['Mensual', null, false],
    ['Temporal', false, false], ['Mensual', true, true],
  ]) {
    const respuesta = catalogos.prepararModalidad({ nombre, permite_reservas_por_fecha: permite });
    assert.equal(respuesta.admite_reservas_por_fecha, esperado);
  }
});

test('reembolsos y reclamos conservan los campos calculados de las reservas anidadas', async () => {
  const reembolsos = new ReembolsosService({
    listarAdministracion: async () => [{ id: 3, reserva: reserva(), pago: { reserva: reserva() } }],
  }, {}, {}, {}, estados, catalogosDePrueba());
  const reclamos = new ReclamosService({
    listarAdministracion: async () => [{ id: 4, reserva: reserva() }],
  }, { prepararRespuesta: (actual) => estados.prepararRespuesta(actual) }, undefined, undefined, catalogosDePrueba());
  const [devolucion] = json(await reembolsos.listarAdministracion());
  const [reclamo] = json(await reclamos.listarAdministracion());
  for (const actual of [devolucion.reserva, devolucion.pago.reserva, reclamo.reserva]) {
    assert.equal(actual.estado_estadia, 'CONFIRMADA');
    assert.equal(actual.publicacion.modalidad.admite_reservas_por_fecha, true);
  }
});

test('el historial de verificación omite secretos aunque el repositorio los haya seleccionado', async () => {
  const solicitud = { id: 1, estado: 'pendiente', numero_revision: 2 };
  for (const campo of CAMPOS_PRUEBA_PRIVADOS) solicitud[campo] = 'dato-privado';
  const servicio = new VerificacionAnuncianteService({}, {}, catalogosDePrueba(), {
    buscarSolicitudPorAnunciante: async () => solicitud,
    buscarRevisiones: async () => [{ numero_revision: 1, estado: 'rechazada' }],
  });
  const respuesta = json(await servicio.buscarSolicitudConHistorial(1));
  for (const campo of CAMPOS_PRUEBA_PRIVADOS) assert.equal(Object.hasOwn(respuesta, campo), false);
  assert.equal(respuesta.numero_revision, 2);
  assert.equal(respuesta.revisiones[0].estado, 'rechazada');
});

test('consultar una solicitud activa conserva las relaciones que cargó el repositorio', async () => {
  const solicitud = { id: 5, estado: 'PENDIENTE', solicitante: { id: 7 } };
  const repo = { buscarPorId: async () => ({ ...reserva(), usuario: { id: 7 } }) };
  const reservas = new ReservasService({}, repo, {}, {}, publicaciones, {}, {}, estados,
    { proyectarEnReserva: async reserva => reserva }, catalogosDePrueba());
  const servicio = new CancelacionesService({ buscarActiva: async () => solicitud }, reservas, {}, catalogosDePrueba());
  const respuesta = await servicio.consultarActiva(1, 7);
  assert.deepEqual(respuesta, solicitud);
  assert.equal(Object.hasOwn(respuesta, 'reserva'), false);
  // Quien no participa de la reserva no puede consultar su solicitud.
  await assert.rejects(servicio.consultarActiva(1, 8), { status: 403 });
});
