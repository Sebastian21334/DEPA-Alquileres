require('reflect-metadata');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { catalogosDePrueba } = require('./soporte/catalogos-pruebas.cjs');
const { ReembolsosService } = require('../dist/reembolsos/service/reembolsos.service');

function escenario({ manual = true, medio = 'visa', respuesta = async () => ({ status: 'rejected' }) } = {}) {
  const registros = [];
  const pago = { id: 1, payment_id: '100', payment_method_id: medio, amount: 100, amount_refunded: 0 };
  const reembolso = {
    id: 1, reserva: { usuario: { id: 2 } }, pago, importe: 100, estado: 'PENDIENTE',
    transferencia_manual: manual,
  };
  const repo = {
    conTransaccion: async (operar) => operar(repo, {}),
    buscarPorId: async () => reembolso,
    buscarRegistro: async () => reembolso,
    actualizar: async (_id, cambios) => Object.assign(reembolso, cambios),
    guardarMensaje: async (_id, autor, administracion, texto) =>
      registros.push({ id: registros.length + 1, autor, administracion, texto }),
    listarMensajes: async (_id, cursor) => registros.filter(({ id }) => id > cursor),
  };
  const pagos = {
    buscarParaReembolso: async () => pago,
    saldoReembolsable: () => pago.amount - pago.amount_refunded,
    aplicarReembolso: async (_pago, importe) => { pago.amount_refunded += importe; },
  };
  let intentos = 0;
  const servicio = new ReembolsosService(repo, {
    reembolsar: async () => { intentos += 1; return respuesta(); },
  }, pagos, {}, catalogosDePrueba());
  return { servicio, reembolso, pago, intentos: () => intentos };
}

test('el propietario y dos administradores comparten el chat y terceros quedan excluidos', async () => {
  const { servicio } = escenario();
  await servicio.conversar(1, { id: 10, rol: 'Administrador' }, 0, ' Primer mensaje ');
  await servicio.conversar(1, { id: 2, rol: 'Inquilino' }, 0, 'Recibido');
  await servicio.conversar(1, { id: 11, rol: 'Administrador' }, 0, 'Continúo el caso');
  const { abierta, mensajes } = await servicio.conversar(1, { id: 2 }, 1);
  assert.equal(abierta, true);
  assert.deepEqual(mensajes.map(({ autor, administracion }) => [autor, administracion]), [[2, false], [11, true]]);
  await assert.rejects(servicio.conversar(1, { id: 7, rol: 'Anunciante' }, 0), { status: 404 });
  await assert.rejects(servicio.conversar(1, { id: 7 }, 0, 'Mensaje externo'), { status: 404 });
});

test('la tarjeta se gestiona por transferencia y solo se registra una vez', async () => {
  const { servicio, pago, intentos } = escenario();
  await assert.rejects(servicio.ejecutar(1, 10), { status: 409 });
  assert.equal(intentos(), 0);
  await servicio.registrarTransferencia(1, 'op-1', 10);
  await servicio.registrarTransferencia(1, 'op-1', 11);
  await assert.rejects(servicio.registrarTransferencia(1, 'op-2', 11), { status: 409 });
  assert.equal(pago.amount_refunded, 100);
  assert.equal((await servicio.conversar(1, { id: 2 }, 0)).abierta, false);
  await assert.rejects(servicio.conversar(1, { id: 2 }, 0, 'Tarde'), { status: 409 });
});

test('solo una negativa definitiva de Mercado Pago abre la vía manual', async () => {
  const rechazo = escenario({ manual: false, medio: 'account_money' });
  assert.equal((await rechazo.servicio.ejecutar(1, 10)).transferencia_manual, true);
  assert.equal((await rechazo.servicio.conversar(1, { id: 2 }, 0)).abierta, true);
  const incierto = escenario({
    manual: false, medio: 'account_money', respuesta: async () => { throw new Error('timeout'); },
  });
  await assert.rejects(incierto.servicio.ejecutar(1, 10), /timeout/);
  assert.equal(incierto.reembolso.transferencia_manual, false);
  await assert.rejects(incierto.servicio.registrarTransferencia(1, 'op-1', 10), { status: 409 });
});

test('la API valida mensajes y permite el acceso al inquilino y a administración', async () => {
  const { Test } = require('@nestjs/testing');
  const { ValidationPipe } = require('@nestjs/common');
  const { request } = require('node:http');
  const { randomUUID } = require('node:crypto');
  const { tmpdir } = require('node:os');
  const { join } = require('node:path');
  const { JwtAuthGuard } = require('../dist/seguridad/guards/jwt-auth.guard');
  const { ReembolsosController } = require('../dist/reembolsos/controller/reembolsos.controller');
  const { servicio } = escenario();
  const modulo = await Test.createTestingModule({
    controllers: [ReembolsosController],
    providers: [{ provide: ReembolsosService, useValue: servicio }],
  }).overrideGuard(JwtAuthGuard).useValue({
    canActivate(contexto) {
      const req = contexto.switchToHttp().getRequest();
      const id = Number(req.headers['x-test-user']);
      req.user = { id, rol: id === 10 || id === 11 ? 'Administrador' : 'Usuario' };
      return !!id;
    },
  }).compile();
  const app = modulo.createNestApplication({ logger: false });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  const nombre = `depa-chat-${randomUUID()}`;
  const socketPath = join(process.platform === 'win32' ? '\\\\.\\pipe\\' : tmpdir(), nombre);
  const api = (method, path, actor, datos) => new Promise((resolve, reject) => {
    const req = request({ socketPath, path, method, headers: {
      'x-test-user': actor, 'content-type': 'application/json',
    } }, res => {
      let contenido = '';
      res.setEncoding('utf8');
      res.on('data', parte => { contenido += parte; });
      res.on('end', () => {
        try { resolve({ estado: res.statusCode, body: JSON.parse(contenido) }); }
        catch (error) { reject(error); }
      });
    });
    req.on('error', reject);
    req.end(datos ? JSON.stringify(datos) : undefined);
  });
  try {
    await app.listen(socketPath);
    const ruta = '/reembolsos/1/conversacion';
    assert.equal((await api('POST', ruta, 10, { texto: ' ' })).estado, 400);
    assert.equal((await api('POST', ruta, 10, { texto: 'Coordinemos la transferencia' })).estado, 201);
    const { estado, body } = await api('GET', ruta, 11);
    assert.equal(estado, 200);
    assert.equal(body.mensajes[0].autor, 10);
    assert.equal((await api('GET', ruta, 2)).estado, 200);
    assert.equal((await api('GET', ruta, 7)).estado, 404);
    assert.equal((await api('GET', '/reembolsos/administracion', 2)).estado, 403);
  } finally {
    await app.close();
  }
});
