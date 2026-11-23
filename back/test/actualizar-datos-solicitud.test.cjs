const { preparacionImagenes } = require('./soporte/imagenes-pruebas.cjs');
require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { VerificacionAnuncianteService } = require('../dist/verificacion-anunciante/service/verificacion-anunciante.service');
const { MENSAJE_CUIT_EN_USO } = require('../dist/anunciantes/service/anunciantes.service');

function crearEscenario(opciones = {}) {
  const {
    estado = 'borrador',
    tipoNombre = 'Particular',
    cuitEnUso = false,
  } = opciones;
  const solicitud = {
    id: 1,
    estado,
    actualizada_en: new Date(0),
    anunciante: {
      idUsuario: 7,
      cuit_cuil: '20-12345678-9',
      numero_contacto: '351 400-0000',
      tipoAnunciante: { id: 1, nombre: 'Particular' },
    },
    razon_social: null,
    matricula_profesional: null,
    colegio_profesional: null,
    domicilio_comercial: null,
    dni_corredor: null,
  };
  const estadoEscenario = { actualizaciones: 0, guardados: 0 };
  const repositorio = {
    conSolicitudBloqueada: async (_id, operacion) => operacion(
      opciones.sinSolicitud ? null : solicitud,
      {
        guardarSolicitud: async (actual) => {
          estadoEscenario.guardados++;
          return actual;
        },
      },
      {},
    ),
  };
  const catalogos = {
    codigoEstado: (_ambito, codigo) => codigo,
    getTipoAnunciantePorId: async (id) => ({ id, nombre: tipoNombre }),
    esInmobiliaria: (tipo) => /inmobiliaria|institucional/i.test(tipo?.nombre ?? ''),
  };
  const anunciantes = {
    existeCuitVigente: async () => cuitEnUso,
    actualizarDatos: async (_id, datos) => {
      estadoEscenario.actualizaciones++;
      Object.assign(solicitud.anunciante, datos);
    },
  };
  const servicio = new VerificacionAnuncianteService(
    anunciantes,
    {},
    catalogos,
    repositorio,
    {},
    {},
    {},
    {}, preparacionImagenes,
  );
  return { servicio, solicitud, estado: estadoEscenario };
}

test('actualiza los datos del solicitante y los de la inmobiliaria en una sola operación', async () => {
  const { servicio, solicitud, estado } = crearEscenario({ tipoNombre: 'Inmobiliaria' });
  const respuesta = await servicio.actualizarDatosSolicitud(7, {
    idTipoAnunciante: 2,
    cuit: ' 27-12345678-9 ',
    numero_contacto: ' 351 555-0000 ',
    razon_social: 'Inmobiliaria Sur',
    matricula_profesional: 'MAT-123',
    colegio_profesional: 'Colegio de Corredores',
    domicilio_comercial: 'Calle 123',
    dni_corredor: '30123456',
  });
  assert.equal(estado.actualizaciones, 1);
  assert.equal(estado.guardados, 1);
  assert.equal(solicitud.anunciante.cuit_cuil, '27-12345678-9');
  assert.equal(solicitud.anunciante.numero_contacto, '351 555-0000');
  assert.equal(solicitud.anunciante.tipoAnunciante.nombre, 'Inmobiliaria');
  assert.equal(solicitud.razon_social, 'Inmobiliaria Sur');
  assert.equal(respuesta.anunciante.tipoAnunciante.nombre, 'Inmobiliaria');
});

test('al pasar a particular limpia los datos de inmobiliaria', async () => {
  const { servicio, solicitud } = crearEscenario({ tipoNombre: 'Particular' });
  Object.assign(solicitud, {
    razon_social: 'Inmobiliaria anterior',
    matricula_profesional: 'MAT',
    colegio_profesional: 'Colegio',
    domicilio_comercial: 'Calle',
    dni_corredor: '30123456',
  });
  await servicio.actualizarDatosSolicitud(7, {
    idTipoAnunciante: 1,
    cuit: '20-12345678-9',
    numero_contacto: '351 400-0000',
  });
  assert.equal(solicitud.razon_social, null);
  assert.equal(solicitud.matricula_profesional, null);
  assert.equal(solicitud.dni_corredor, null);
});

test('rechaza un CUIT que pertenece a otra cuenta', async () => {
  const { servicio } = crearEscenario({ cuitEnUso: true });
  await assert.rejects(
    servicio.actualizarDatosSolicitud(7, {
      idTipoAnunciante: 1,
      cuit: '27-12345678-9',
      numero_contacto: '351',
    }),
    (error) => error.getStatus() === 409 && error.message === MENSAJE_CUIT_EN_USO,
  );
});

test('rechaza la edición si la solicitud ya no es editable', async () => {
  const { servicio } = crearEscenario({ estado: 'pendiente' });
  await assert.rejects(
    servicio.actualizarDatosSolicitud(7, {
      idTipoAnunciante: 1,
      cuit: '20-12345678-9',
      numero_contacto: '351',
    }),
    (error) => error.getStatus() === 409,
  );
});

test('rechaza la edición si no existe solicitud', async () => {
  const { servicio } = crearEscenario({ sinSolicitud: true });
  await assert.rejects(
    servicio.actualizarDatosSolicitud(7, {
      idTipoAnunciante: 1,
      cuit: '20-12345678-9',
      numero_contacto: '351',
    }),
    (error) => error.getStatus() === 404,
  );
});
