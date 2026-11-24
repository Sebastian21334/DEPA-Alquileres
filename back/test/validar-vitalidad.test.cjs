require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { PruebaVidaService } = require('../dist/verificacion-anunciante/service/prueba-vida.service');

// Cada captura describe el rostro que «detecta» el análisis simulado.
const foto = (rostro = {}) => ({ buffer: Buffer.from(JSON.stringify({ persona: 'ana', yaw: 0, roll: 0, boca: 0, ...rostro })) });
const ACCIONES = ['TURN_LEFT', 'OPEN_MOUTH', 'TILT_HEAD'];
const capturasValidas = () => ({
  neutralPhoto: [foto()],
  livePhoto: [foto()],
  action0: [foto({ yaw: 0.1 })],
  action1: [foto({ boca: 0.2 })],
  action2: [foto({ roll: 0.2 })],
});

function escenario({ acciones = ACCIONES } = {}) {
  const solicitud = {
    id: 1, estado: 'borrador', numero_revision: 1, prueba_vida_desafio: 'jti-1', prueba_vida_revision: 1,
    prueba_vida_validada_en: null, prueba_vida_consumida_en: null,
  };
  const desafio = { sub: 7, scope: 'face-liveness-challenge', actions: acciones, jti: 'jti-1', solicitudId: 1, revision: 1 };
  const registro = { firmado: null, guardados: 0 };
  const jwt = {
    verifyAsync: async () => desafio,
    signAsync: async (datos) => { registro.firmado = datos; return 'token-verificado'; },
  };
  const analisis = {
    analizarRostro: async (buffer) => {
      const rostro = JSON.parse(buffer.toString());
      return { descriptor: Float32Array.of(rostro.persona === 'ana' ? 0 : 1), yaw: rostro.yaw, roll: rostro.roll, aperturaBoca: rostro.boca };
    },
    distancia: (a, b) => Math.abs(a[0] - b[0]),
  };
  const verificaciones = {
    conSolicitudBloqueada: async (_id, operacion) => operacion(solicitud, {
      guardarSolicitud: async (actual) => { registro.guardados++; return actual; },
    }),
  };
  const servicio = new PruebaVidaService(jwt, analisis, verificaciones, { codigoEstado: (_ambito, codigo) => codigo });
  servicio.logger = { debug: () => {}, warn: () => {} };
  return { servicio, solicitud, registro };
}

test('con las tres acciones y la captura final válidas, autoriza la presentación de esa captura', async () => {
  const { servicio, solicitud, registro } = escenario();
  const resultado = await servicio.validarVitalidad(7, 'desafio', capturasValidas());
  assert.deepEqual(resultado, { valid: true, verificationToken: 'token-verificado' });
  assert.equal(registro.firmado.scope, 'face-liveness-verified');
  assert.deepEqual([registro.firmado.jti, registro.firmado.solicitudId, registro.firmado.revision], ['jti-1', 1, 1]);
  assert.equal(solicitud.prueba_vida_rostro_hash, registro.firmado.livePhotoHash);
  assert.ok(solicitud.prueba_vida_validada_en instanceof Date);
  assert.equal(registro.guardados, 1);
});

test('una acción se acepta con la segunda captura si la primera no alcanza', async () => {
  const { servicio } = escenario();
  const capturas = { ...capturasValidas(), action0: [foto({ yaw: 0.01 }), foto({ yaw: 0.1 })] };
  assert.equal((await servicio.validarVitalidad(7, 'desafio', capturas)).valid, true);
});

test('rechaza desafíos y capturas incompletas o que no superan la prueba, sin guardar', async () => {
  const casos = [
    [{ acciones: ACCIONES.slice(0, 2) }, capturasValidas(), { status: 400, message: /secuencia válida/ }],
    [{}, { ...capturasValidas(), livePhoto: [] }, { status: 400, message: /Faltan capturas/ }],
    [{}, { ...capturasValidas(), action2: [] }, { status: 400, message: /Faltan capturas/ }],
    [{}, { ...capturasValidas(), action1: [foto({ boca: 0.05 }), foto({ boca: 0.06 })] }, { status: 422, message: /No se pudo confirmar la acción.*boca/ }],
    [{}, { ...capturasValidas(), action0: [foto({ persona: 'otra', yaw: 0.1 })] }, { status: 422, message: /La persona cambió/ }],
    [{}, { ...capturasValidas(), livePhoto: [foto({ yaw: 0.2 })] }, { status: 422, message: /no está centrada/ }],
    [{}, { ...capturasValidas(), livePhoto: [foto({ persona: 'otra' })] }, { status: 422, message: /La persona cambió/ }],
  ];
  for (const [opciones, capturas, error] of casos) {
    const { servicio, registro } = escenario(opciones);
    await assert.rejects(servicio.validarVitalidad(7, 'desafio', capturas), error);
    assert.deepEqual([registro.guardados, registro.firmado], [0, null]);
  }
});
