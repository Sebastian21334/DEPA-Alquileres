require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Duplex } = require('node:stream');
const { Test } = require('@nestjs/testing');
const { ForbiddenException, ValidationPipe } = require('@nestjs/common');
const { JwtAuthGuard } = require('../dist/seguridad/guards/jwt-auth.guard');
const { OptionalJwtAuthGuard } = require('../dist/seguridad/guards/optional-jwt-auth.guard');
const { DisponibilidadController } = require('../dist/disponibilidad/controller/disponibilidad.controller');
const { CrearDisponibilidadDto } = require('../dist/disponibilidad/dto/crear-disponibilidad.dto');
const { PropietarioPublicacionGuard } = require('../dist/disponibilidad/guards/propietario-publicacion.guard');
const { DisponibilidadService } = require('../dist/disponibilidad/service/disponibilidad.service');

// Usa el servidor HTTP real de Nest con un stream en memoria. No abre un puerto.
function enviar(server, datos, usuario) {
  const body = JSON.stringify(datos);
  return new Promise((resolve, reject) => {
    let respuesta = '';
    const socket = new Duplex({
      read() {},
      write(chunk, _encoding, listo) {
        respuesta += chunk.toString();
        listo();
      },
      final(listo) {
        try {
          const [cabecera, json] = respuesta.split('\r\n\r\n');
          resolve({ status: Number(cabecera.split(' ')[1]), body: JSON.parse(json) });
        } catch (error) {
          reject(error);
        }
        listo();
      },
    });
    socket.on('error', reject);
    server.emit('connection', socket);
    socket.push([
      'POST /disponibilidad HTTP/1.1', 'Host: prueba.local', 'Connection: close',
      'Content-Type: application/json', 'Content-Length: ' + Buffer.byteLength(body),
      'X-Usuario-Prueba: ' + usuario, '', body,
    ].join('\r\n'));
  });
}

test('el propietario puede cargar hasta 366 días válidos y se rechazan fechas inválidas y rangos excesivos', async (t) => {
  const guardadas = [];
  let transacciones = 0;
  const repositorio = {
    conTransaccion: async (trabajo) => {
      transacciones++;
      return trabajo(repositorio, {});
    },
    buscarPorRango: async () => [],
    crear: (datos) => datos,
    guardarVarias: async (fechas) => {
      guardadas.push(...fechas);
      return fechas;
    },
  };
  const servicio = new DisponibilidadService(repositorio, {
    obtenerPropia: async (_id, usuario) => {
      if (usuario !== 1) throw new ForbiddenException();
    },
    buscarPorId: async () => ({ id: 10 }),
    admiteReservaPorFecha: () => true,
    bloquearParaModificacion: async () => {},
  });
  const modulo = await Test.createTestingModule({
    controllers: [DisponibilidadController],
    providers: [PropietarioPublicacionGuard, { provide: DisponibilidadService, useValue: servicio }],
  }).overrideGuard(JwtAuthGuard).useValue({
    canActivate(context) {
      const req = context.switchToHttp().getRequest();
      req.user = { id: Number(req.headers['x-usuario-prueba']) };
      return true;
    },
  }).overrideGuard(OptionalJwtAuthGuard).useValue({ canActivate: () => true }).compile();
  const app = modulo.createNestApplication({ logger: false });
  t.after(() => app.close());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.init();

  const crear = (fecha_inicio, fecha_fin, usuario = 1) =>
    enviar(app.getHttpServer(), { id_publicacion: 10, fecha_inicio, fecha_fin }, usuario);
  const excedido = await crear('2028-01-01', '2029-01-01');
  assert.equal(excedido.status, 400);
  assert.match(excedido.body.message, /366/);
  assert.equal((await crear('2028-02-30', '2028-03-02')).status, 400);
  assert.equal((await crear('2028-03-01', '2028-02-29')).status, 400);
  assert.equal((await crear('2028-01-01', '2028-01-02', 2)).status, 403);
  assert.equal(transacciones, 0);
  const respuesta = await crear('2028-01-01', '2028-12-31');
  assert.equal(respuesta.status, 201);
  assert.equal(guardadas.length, 366);
  assert.equal(respuesta.body[0].fecha, '2028-01-01');
  assert.equal(respuesta.body.at(-1).fecha, '2028-12-31');
  assert.equal(transacciones, 1);
});
