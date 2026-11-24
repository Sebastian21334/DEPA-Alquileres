require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { VerificacionAnuncianteService } = require('../dist/verificacion-anunciante/service/verificacion-anunciante.service');

const jpeg = (nombre) => ({ mimetype: 'image/jpeg', size: nombre.length, buffer: Buffer.from(nombre) });
const pdf = () => {
  const buffer = Buffer.from('%PDF-1.4 constancia %%EOF');
  return { mimetype: 'application/pdf', size: buffer.length, buffer };
};
const capturas = () => ({ dni_frente: [jpeg('frente')], dni_dorso: [jpeg('dorso')], rostro: [jpeg('rostro')] });
const constancias = () => ({ matricula: [pdf()], constancia_cuit: [pdf()] });

// Servicio real con colaboradores reemplazados: no sube archivos ni envía correos.
function escenario({ estado = 'borrador', inmobiliaria = false, autorizaciones = [], avisoFalla = false } = {}) {
  const solicitud = {
    id: 1, estado, numero_revision: 0, motivo_rechazo: 'anterior',
    anunciante: { idUsuario: 7, tipoAnunciante: { nombre: inmobiliaria ? 'Inmobiliaria' : 'Particular' } },
    razon_social: 'Inmobiliaria Sur', matricula_profesional: 'MAT-1', colegio_profesional: 'Colegio',
    domicilio_comercial: 'Calle 1', dni_corredor: '30123456',
  };
  const registro = { subidos: [], eliminados: [], guardados: 0, avisos: 0, comprobaciones: 0 };
  const repositorio = {
    buscarSolicitudPorAnunciante: async () => solicitud,
    conSolicitudBloqueada: async (_id, operacion) => operacion(solicitud, {
      guardarSolicitud: async (actual) => { registro.guardados++; return actual; },
    }),
  };
  const catalogos = {
    codigoEstado: (_ambito, codigo) => codigo,
    esInmobiliaria: (tipo) => /inmobiliaria/i.test(tipo?.nombre ?? ''),
  };
  const pruebaVida = {
    puedeRecibirDocumentos: (actual) => actual.estado !== 'cerrada',
    verificarCapturaAutorizada: async () => ({ solicitudId: 1, jti: 'jti', revision: 0, livePhotoHash: 'hash' }),
    // Cada comprobación consume el siguiente resultado; sin resultados, la autorización sigue vigente.
    autorizacionPruebaVidaVigente: () => autorizaciones[registro.comprobaciones++] ?? true,
  };
  const almacenamiento = {
    subir: async (_contenedor, nombre) => { const url = `https://blob.example.invalid/${nombre}`; registro.subidos.push(url); return url; },
    eliminarDocumentoPropio: async (url) => { registro.eliminados.push(url); },
  };
  const mail = {
    enviarSolicitudParaRevision: async () => {
      if (avisoFalla) throw new Error('Correo no disponible');
      registro.avisos++;
    },
  };
  const servicio = new VerificacionAnuncianteService(
    { datosContacto: () => ({ nombre: 'Ana', email: 'ana@example.invalid' }) },
    { emailsAdministradores: async () => ['admin@example.invalid'] },
    catalogos, repositorio, mail, almacenamiento, pruebaVida, {},
    { preparar: async (buffer) => buffer },
  );
  servicio.logger = { error: () => {} };
  return { servicio, solicitud, registro };
}

test('rechaza presentaciones que no corresponden al estado o al tipo de anunciante, sin subir archivos', async () => {
  const casos = [
    [{ estado: 'aprobada' }, capturas(), { status: 409, message: /ya fue aprobada/ }],
    [{ estado: 'cerrada' }, capturas(), { status: 409, message: /no admite documentos/ }],
    [{}, { ...capturas(), rostro: [] }, { status: 400, message: /DNI frente, DNI dorso y rostro/ }],
    [{}, { ...capturas(), dni_dorso: [{ ...jpeg('dorso'), mimetype: 'image/png' }] }, { status: 400, message: /desde la cámara/ }],
    [{ inmobiliaria: true }, capturas(), { status: 400, message: /matrícula y constancia de CUIT/ }],
    [{}, { ...capturas(), ...constancias() }, { status: 400, message: /corresponden a inmobiliarias/ }],
  ];
  for (const [opciones, archivos, error] of casos) {
    const { servicio, registro } = escenario(opciones);
    await assert.rejects(servicio.subirDocumentos(7, archivos, 'token'), error);
    assert.deepEqual([registro.subidos, registro.guardados], [[], 0]);
  }
});

test('un particular presenta sus tres capturas, consume la autorización y se avisa a administración', async () => {
  const { servicio, solicitud, registro } = escenario();
  const respuesta = await servicio.subirDocumentos(7, capturas(), 'token');
  assert.equal(registro.subidos.length, 3);
  assert.deepEqual([respuesta.dni_frente_url, respuesta.dni_dorso_url, respuesta.rostro_url], registro.subidos);
  assert.deepEqual([respuesta.estado, respuesta.motivo_rechazo, respuesta.numero_revision], ['pendiente', null, 0]);
  // La marca de consumo queda guardada, pero no viaja en la respuesta.
  assert.ok(solicitud.prueba_vida_consumida_en instanceof Date);
  assert.equal(Object.hasOwn(respuesta, 'prueba_vida_consumida_en'), false);
  assert.deepEqual([registro.guardados, registro.avisos, registro.comprobaciones], [1, 1, 2]);
});

test('un reenvío suma una revisión y queda como reenviada', async () => {
  const { servicio } = escenario({ estado: 'rechazada' });
  const respuesta = await servicio.subirDocumentos(7, capturas(), 'token', true);
  assert.deepEqual([respuesta.estado, respuesta.numero_revision], ['reenviada', 1]);
});

test('una inmobiliaria suma la matrícula y la constancia de CUIT', async () => {
  const { servicio, registro } = escenario({ inmobiliaria: true });
  const respuesta = await servicio.subirDocumentos(7, { ...capturas(), ...constancias() }, 'token');
  assert.equal(registro.subidos.length, 5);
  assert.deepEqual([respuesta.matricula_url, respuesta.constancia_cuit_url], registro.subidos.slice(3));
});

test('si la autorización deja de valer antes de confirmar, se borran los archivos subidos', async () => {
  const { servicio, registro } = escenario({ autorizaciones: [true, false] });
  await assert.rejects(servicio.subirDocumentos(7, capturas(), 'token'), { status: 409, message: /autorización de prueba de vida/ });
  assert.equal(registro.subidos.length, 3);
  assert.deepEqual(registro.eliminados, registro.subidos);
  assert.equal(registro.guardados, 0);
});

test('si falla el aviso a administración, la presentación queda guardada', async () => {
  const { servicio, registro } = escenario({ avisoFalla: true });
  const respuesta = await servicio.subirDocumentos(7, capturas(), 'token');
  assert.equal(respuesta.estado, 'pendiente');
  assert.deepEqual([registro.guardados, registro.eliminados], [1, []]);
});
