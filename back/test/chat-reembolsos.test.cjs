require('reflect-metadata');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { catalogosDePrueba } = require('./soporte/catalogos-pruebas.cjs');
const { ReembolsosService } = require('../dist/reembolsos/service/reembolsos.service');
const { comprobantePdf: pdf, almacenamientoDePrueba } = require('./soporte/comprobantes-pruebas.cjs');

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
    buscarComprobante: async () => ({ url: reembolso.comprobante_url ?? null, idInquilino: 2 }),
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
  const { almacenamiento, archivos } = almacenamientoDePrueba();
  const servicio = new ReembolsosService(repo, {
    reembolsar: async () => { intentos += 1; return respuesta(); },
  }, pagos, {}, catalogosDePrueba(), almacenamiento);
  return { servicio, reembolso, pago, pagos, archivos, intentos: () => intentos };
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

test('la tarjeta se gestiona por transferencia, con comprobante, y solo se registra una vez', async () => {
  const { servicio, reembolso, pago, archivos, intentos } = escenario();
  await assert.rejects(servicio.ejecutar(1, 10), { status: 409 });
  assert.equal(intentos(), 0);
  // T44: sin comprobante no se registra; la referencia es opcional.
  await assert.rejects(servicio.registrarTransferencia(1, { referencia: 'op-1' }, undefined, 10), /Adjuntá el comprobante/);
  // T56: la observación también es opcional y queda guardada sin espacios sobrantes.
  await assert.rejects(servicio.registrarTransferencia(1, { observacion: 'x'.repeat(501) }, pdf(), 10), { status: 400 });
  assert.equal(archivos.subidos.length, 0);
  await servicio.registrarTransferencia(1, { observacion: ' Transferencia desde el Banco Nación ' }, pdf(), 10);
  assert.equal(reembolso.referencia_externa, null);
  assert.equal(reembolso.observacion_transferencia, 'Transferencia desde el Banco Nación');
  assert.equal(reembolso.comprobante_nombre, 'transferencia.pdf');
  assert.match(reembolso.comprobante_url, /^https:\/\/privado\.example\/comprobantes\/reembolsos\/1\/.+\.pdf$/);
  // Un segundo registro se rechaza antes de subir otro archivo.
  await assert.rejects(servicio.registrarTransferencia(1, { referencia: 'op-2' }, pdf(), 11), { status: 409 });
  assert.equal(archivos.subidos.length, 1);
  assert.equal(pago.amount_refunded, 100);
  assert.equal((await servicio.conversar(1, { id: 2 }, 0)).abierta, false);
  await assert.rejects(servicio.conversar(1, { id: 2 }, 0, 'Tarde'), { status: 409 });
});

test('T44: si el registro falla, el comprobante subido se borra', async () => {
  const { servicio, reembolso, pagos, archivos } = escenario();
  pagos.aplicarReembolso = async () => { throw new Error('falla al aplicar'); };
  await assert.rejects(servicio.registrarTransferencia(1, { referencia: 'op-1' }, pdf(), 10), /falla al aplicar/);
  assert.equal(archivos.subidos.length, 1);
  assert.deepEqual(archivos.borrados, [`https://privado.example/${archivos.subidos[0]}`]);
  assert.equal(reembolso.comprobante_url, undefined);
});

test('T44: el comprobante lo ven el admin y el inquilino; el anunciante no', async () => {
  const { servicio, reembolso } = escenario();
  await assert.rejects(servicio.urlComprobante(1, { id: 10, rol: 'Administrador' }), { status: 404 });
  await servicio.registrarTransferencia(1, { referencia: 'op-1' }, pdf(), 10);
  assert.match((await servicio.urlComprobante(1, { id: 10, rol: 'Administrador' })).url, /\?firmado$/);
  assert.equal((await servicio.urlComprobante(1, { id: 2 })).url, `${reembolso.comprobante_url}?firmado`);
  await assert.rejects(servicio.urlComprobante(1, { id: 7, rol: 'Anunciante' }), { status: 404 });
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
  await assert.rejects(incierto.servicio.registrarTransferencia(1, { referencia: 'op-1' }, pdf(), 10), { status: 409 });
  assert.equal(incierto.archivos.subidos.length, 0);
});

test('T44: la API de transferencia recibe el comprobante por multipart y lo exige', async () => {
  const { Test } = require('@nestjs/testing');
  const { ValidationPipe } = require('@nestjs/common');
  const request = require('supertest');
  const { JwtAuthGuard } = require('../dist/seguridad/guards/jwt-auth.guard');
  const { RolesGuard } = require('../dist/seguridad/guards/roles.guard');
  const { ReembolsosReservaController } = require('../dist/operaciones-reserva/controller/reembolsos-reserva.controller');
  const { OperacionesReembolsoService } = require('../dist/operaciones-reserva/service/operaciones-reembolso.service');
  const { servicio, reembolso } = escenario();
  const operaciones = {
    registrarTransferencia: async (id, datos, comprobante, idAdmin) =>
      ({ reembolso: await servicio.registrarTransferencia(id, datos, comprobante, idAdmin) }),
  };
  const modulo = await Test.createTestingModule({
    controllers: [ReembolsosReservaController],
    providers: [{ provide: OperacionesReembolsoService, useValue: operaciones }],
  }).overrideGuard(JwtAuthGuard).useValue({
    canActivate(contexto) { contexto.switchToHttp().getRequest().user = { id: 10, rol: 'Administrador' }; return true; },
  }).overrideGuard(RolesGuard).useValue({ canActivate: () => true }).compile();
  const app = modulo.createNestApplication({ logger: false });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.init();
  try {
    const ruta = '/reservas/reembolsos/1/transferencia';
    const sinArchivo = await request(app.getHttpServer()).patch(ruta).field('referencia', 'op-1');
    assert.equal(sinArchivo.status, 400);
    assert.match(sinArchivo.body.message, /Adjuntá el comprobante/);
    const falso = await request(app.getHttpServer()).patch(ruta)
      .attach('comprobante', Buffer.from('no es un PDF'), { filename: 'falso.pdf', contentType: 'application/pdf' });
    assert.equal(falso.status, 400);
    const larga = await request(app.getHttpServer()).patch(ruta).field('observacion', 'x'.repeat(501))
      .attach('comprobante', Buffer.from('%PDF-1.7 comprobante'), { filename: 'banco.pdf', contentType: 'application/pdf' });
    assert.equal(larga.status, 400);
    const ok = await request(app.getHttpServer()).patch(ruta).field('referencia', 'op-1').field('observacion', 'Banco Nación')
      .attach('comprobante', Buffer.from('%PDF-1.7 comprobante'), { filename: 'banco.pdf', contentType: 'application/pdf' });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.reembolso.comprobante_nombre, 'banco.pdf');
    assert.equal(reembolso.referencia_externa, 'op-1');
    assert.equal(reembolso.observacion_transferencia, 'Banco Nación');
  } finally {
    await app.close();
  }
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
    // T44: el enlace del comprobante, por la API, para el inquilino y no para un tercero.
    await servicio.registrarTransferencia(1, { referencia: 'op-api' }, pdf(), 10);
    const comprobante = await api('GET', '/reembolsos/1/comprobante', 2);
    assert.equal(comprobante.estado, 200);
    assert.match(comprobante.body.url, /\?firmado$/);
    assert.equal((await api('GET', '/reembolsos/1/comprobante', 7)).estado, 404);
  } finally {
    await app.close();
  }
});
