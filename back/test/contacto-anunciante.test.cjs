require('reflect-metadata');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { once } = require('node:events');
const { Duplex } = require('node:stream');
const { Module } = require('@nestjs/common');
const { ConfigService } = require('@nestjs/config');
const { NestFactory } = require('@nestjs/core');
const { JwtService } = require('@nestjs/jwt');
const { JwtStrategy } = require('../dist/seguridad/strategy/jwt.strategy');
const { SeguridadService } = require('../dist/seguridad/service/seguridad.service');
const { AnunciantesController } = require('../dist/anunciantes/controller/anunciantes.controller');
const { AnunciantesService } = require('../dist/anunciantes/service/anunciantes.service');

async function solicitar(server, token, datos) {
  const salida = [];
  const conexion = new Duplex({ read() {}, write(chunk, _encoding, listo) { salida.push(chunk); listo(); } });
  server.emit('connection', conexion);
  const fin = once(conexion, 'finish');
  const cuerpo = JSON.stringify(datos);
  conexion.push(`PATCH /anunciantes/me/contacto HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\nContent-Type: application/json\r\nContent-Length: ${Buffer.byteLength(cuerpo)}\r\n${token ? `Authorization: Bearer ${token}\r\n` : ''}\r\n${cuerpo}`);
  await fin;
  conexion.destroy();
  const respuesta = Buffer.concat(salida).toString('utf8');
  const separador = respuesta.indexOf('\r\n\r\n');
  return { estado: Number(respuesta.split(' ')[1]), cuerpo: JSON.parse(respuesta.slice(separador + 4)) };
}

test('solo el anunciante autenticado y verificado modifica su propio contacto', async t => {
  const contactos = new Map([[1, '111'], [2, '222']]);
  const servicio = new AnunciantesService({ async actualizarContacto(id, telefono) {
    if (id !== 1) return false;
    contactos.set(id, telefono);
    return true;
  } });
  const secret = 'secreto-prueba-contacto';
  const jwt = new JwtService({ secret });
  class ModuloPrueba {}
  Module({ controllers: [AnunciantesController], providers: [JwtStrategy,
    { provide: ConfigService, useValue: { getOrThrow: () => secret } },
    { provide: SeguridadService, useValue: { validarSesion: id => ({ id, rol: 'Inquilino' }) } },
    { provide: AnunciantesService, useValue: servicio },
  ] })(ModuloPrueba);
  const app = await NestFactory.create(ModuloPrueba, { logger: false, abortOnError: false });
  t.after(() => app.close());
  await app.init();
  const enviar = (id, datos) => solicitar(app.getHttpServer(), id ? jwt.sign({ sub: id }) : null, datos);
  assert.equal((await enviar(null, { numero_contacto: '333' })).estado, 401);
  assert.equal((await enviar(2, { numero_contacto: '333' })).estado, 403);
  for (const datos of [{ numero_contacto: '  ' }, { numero_contacto: '1'.repeat(21) }, { numero_contacto: 123 }, { numero_contacto: '333', idUsuario: 2 }]) {
    assert.equal((await enviar(1, datos)).estado, 400);
  }
  const respuesta = await enviar(1, { numero_contacto: ' +54 353 1234567 ' });
  assert.equal(respuesta.estado, 200);
  assert.deepEqual(respuesta.cuerpo, { numero_contacto: '+54 353 1234567' });
  assert.equal(contactos.get(1), '+54 353 1234567');
  assert.equal(contactos.get(2), '222');
});
