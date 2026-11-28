require('reflect-metadata');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { once } = require('node:events');
const { Duplex } = require('node:stream');
const { Module, ValidationPipe } = require('@nestjs/common');
const { NestFactory } = require('@nestjs/core');
const { ConfigService } = require('@nestjs/config');
const { JwtService } = require('@nestjs/jwt');
const { crearPostgresPruebas } = require('./soporte/postgres-pruebas.cjs');
const { UbicacionController } = require('../dist/ubicacion/controller/ubicacion.controller');
const { UbicacionService } = require('../dist/ubicacion/service/ubicacion.service');
const { UbicacionRepository } = require('../dist/ubicacion/repository/ubicacion.repository');
const { Provincia } = require('../dist/ubicacion/entity/provincia.entity');
const { Ciudad } = require('../dist/ubicacion/entity/ciudad.entity');
const { JwtStrategy } = require('../dist/seguridad/strategy/jwt.strategy');
const { SeguridadService } = require('../dist/seguridad/service/seguridad.service');

async function solicitar(server, metodo, ruta, token, datos) {
  const salida = [];
  const conexion = new Duplex({ read() {}, write(datos, _encoding, listo) { salida.push(datos); listo(); } });
  server.emit('connection', conexion);
  const fin = once(conexion, 'finish');
  const cuerpo = datos === undefined ? '' : JSON.stringify(datos);
  conexion.push(`${metodo} ${ruta} HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\nContent-Type: application/json\r\nContent-Length: ${Buffer.byteLength(cuerpo)}\r\n${token ? `Authorization: Bearer ${token}\r\n` : ''}\r\n${cuerpo}`);
  await fin;
  conexion.destroy();
  const respuesta = Buffer.concat(salida).toString('utf8');
  const separacion = respuesta.indexOf('\r\n\r\n');
  const texto = respuesta.slice(separacion + 4);
  return { estado: Number(respuesta.slice(0, separacion).split(' ')[1]), cuerpo: texto ? JSON.parse(texto) : null };
}

test('administración de ubicaciones por HTTP respeta permisos, validaciones y relaciones', async t => {
  const { db, source, cerrar } = await crearPostgresPruebas();
  t.after(cerrar);
  const pool = source.driver.master;
  const conectar = pool.connect.bind(pool);
  let turno = Promise.resolve();
  pool.connect = callback => {
    const anterior = turno;
    let liberar;
    turno = new Promise(resolve => { liberar = resolve; });
    anterior.then(() => conectar((error, cliente, soltar) => callback(error, cliente, () => { soltar(); liberar(); })));
  };
  await db.exec("INSERT INTO provincia (id_provincia, nombre) VALUES (1, 'Norte'), (2, 'Sur'); INSERT INTO ciudad (id_ciudad, nombre, id_provincia) VALUES (1, 'Primera', 1), (2, 'Segunda', 1), (3, 'Segunda', 2);");
  await db.exec("SELECT setval('provincia_id_provincia_seq', 2); SELECT setval('ciudad_id_ciudad_seq', 3);");
  const repo = new UbicacionRepository(source.getRepository(Provincia), source.getRepository(Ciudad));
  const servicio = new UbicacionService(repo, {});
  const secret = 'prueba-ubicaciones';
  const jwt = new JwtService({ secret });
  class ModuloPrueba {}
  Module({ controllers: [UbicacionController], providers: [JwtStrategy,
    { provide: ConfigService, useValue: { getOrThrow: () => secret } },
    { provide: SeguridadService, useValue: { validarSesion: id => ({ id, rol: id === 1 ? 'Administrador' : 'Inquilino' }) } },
    { provide: UbicacionService, useValue: servicio },
  ] })(ModuloPrueba);
  const app = await NestFactory.create(ModuloPrueba, { logger: false, abortOnError: false });
  t.after(() => app.close());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.init();
  const pedir = (metodo, ruta, id, datos) => solicitar(app.getHttpServer(), metodo, ruta, id ? jwt.sign({ sub: id }) : undefined, datos);

  for (const [metodo, ruta, datos] of [
    ['POST', '/ubicacion/provincias', { nombre: 'Nueva' }],
    ['POST', '/ubicacion/ciudades', { nombre: 'Nueva', idProvincia: 1 }],
    ['DELETE', '/ubicacion/provincias/1'],
    ['DELETE', '/ubicacion/ciudades/1'],
  ]) {
    assert.equal((await pedir(metodo, ruta, null, datos)).estado, 401);
    assert.equal((await pedir(metodo, ruta, 2, datos)).estado, 403);
  }
  assert.equal((await pedir('POST', '/ubicacion/provincias', 1, { nombre: ' NORTE ' })).estado, 409);
  assert.equal((await pedir('POST', '/ubicacion/ciudades', 1, { nombre: ' segunda ', idProvincia: 1 })).estado, 409);
  assert.equal((await pedir('POST', '/ubicacion/ciudades', 1, { nombre: 'Nueva', idProvincia: 9999 })).estado, 404);
  for (const datos of [{ nombre: 'Nueva' }, { nombre: 'Nueva', idProvincia: 0 }, { nombre: 'Nueva', idProvincia: '1' }, { nombre: ' ' , idProvincia: 1 }]) assert.equal((await pedir('POST', '/ubicacion/ciudades', 1, datos)).estado, 400);
  const nuevaProvincia = await pedir('POST', '/ubicacion/provincias', 1, { nombre: '  Nueva  Provincia ' });
  assert.equal(nuevaProvincia.estado, 201);
  assert.equal(nuevaProvincia.cuerpo.nombre, 'Nueva Provincia');
  const nuevaCiudad = await pedir('POST', '/ubicacion/ciudades', 1, { nombre: 'Segunda', idProvincia: nuevaProvincia.cuerpo.id });
  assert.equal(nuevaCiudad.estado, 201);
  assert.equal(nuevaCiudad.cuerpo.provincia.id, nuevaProvincia.cuerpo.id);
  assert.equal((await pedir('DELETE', `/ubicacion/provincias/${nuevaProvincia.cuerpo.id}`, 1)).estado, 409);
  await db.exec(`INSERT INTO publicacion (titulo, descripcion, fecha_publicacion, precio, direccion, cantidad_ambientes, superficie, id_ciudad, id_provincia) VALUES ('Aviso', 'Prueba', '2026-01-01', 100, 'Calle', 1, 10, ${nuevaCiudad.cuerpo.id}, ${nuevaProvincia.cuerpo.id})`);
  assert.equal((await pedir('DELETE', `/ubicacion/ciudades/${nuevaCiudad.cuerpo.id}`, 1)).estado, 409);
  await db.exec("DELETE FROM publicacion WHERE titulo='Aviso'");
  assert.equal((await pedir('DELETE', `/ubicacion/ciudades/${nuevaCiudad.cuerpo.id}`, 1)).estado, 204);
  assert.equal((await pedir('DELETE', `/ubicacion/provincias/${nuevaProvincia.cuerpo.id}`, 1)).estado, 204);
  assert.equal((await pedir('DELETE', `/ubicacion/ciudades/${nuevaCiudad.cuerpo.id}`, 1)).estado, 404);

  for (const ruta of ['/ubicacion/provincias/1', '/ubicacion/ciudades/1']) {
    assert.equal((await pedir('PUT', ruta, null, { nombre: 'Nuevo' })).estado, 401);
    assert.equal((await pedir('PUT', ruta, 2, { nombre: 'Nuevo' })).estado, 403);
    for (const datos of [{ nombre: '' }, { nombre: '  ' }, { nombre: 123 }, { nombre: 'x'.repeat(101) }, { nombre: 'Valido', provincia: 2 }]) {
      assert.equal((await pedir('PUT', ruta, 1, datos)).estado, 400);
    }
  }
  for (const id of ['0', '-1', '2.5', 'abc', '2147483648']) assert.equal((await pedir('PUT', `/ubicacion/ciudades/${id}`, 1, { nombre: 'Cambio' })).estado, 400);
  assert.equal((await pedir('PUT', '/ubicacion/provincias/9999', 1, { nombre: 'Cambio' })).estado, 404);
  assert.equal((await pedir('PUT', '/ubicacion/ciudades/9999', 1, { nombre: 'Cambio' })).estado, 404);
  assert.equal((await pedir('PUT', '/ubicacion/provincias/1', 1, { nombre: 'sUr' })).estado, 409);
  assert.equal((await pedir('PUT', '/ubicacion/ciudades/1', 1, { nombre: 'segunda' })).estado, 409);
  const provincia = await pedir('PUT', '/ubicacion/provincias/1', 1, { nombre: '  Nuevo   Norte  ' });
  assert.equal(provincia.estado, 200);
  assert.equal(provincia.cuerpo.nombre, 'Nuevo Norte');
  const ciudad = await pedir('PUT', '/ubicacion/ciudades/1', 1, { nombre: '  Nueva   Ciudad  ' });
  assert.equal(ciudad.estado, 200);
  assert.equal(ciudad.cuerpo.nombre, 'Nueva Ciudad');
  assert.equal(ciudad.cuerpo.provincia.id, 1);
  assert.equal((await pedir('GET', '/ubicacion/provincias/1/ciudades')).cuerpo.find(x => x.id === 1).nombre, 'Nueva Ciudad');
  assert.equal((await db.query('SELECT id_provincia FROM ciudad WHERE id_ciudad=1')).rows[0].id_provincia, 1);
  const guardar = repo.guardarProvincia.bind(repo);
  repo.guardarProvincia = async (...args) => { await guardar(...args); throw new Error('Fallo simulado'); };
  assert.equal((await pedir('PUT', '/ubicacion/provincias/1', 1, { nombre: 'Reintento' })).estado, 500);
  repo.guardarProvincia = guardar;
  assert.equal((await db.query('SELECT nombre FROM provincia WHERE id_provincia=1')).rows[0].nombre, 'Nuevo Norte');
  assert.equal((await pedir('PUT', '/ubicacion/provincias/1', 1, { nombre: 'Reintento' })).estado, 200);
  const simultaneas = await Promise.all([1, 2].map(id => pedir('PUT', `/ubicacion/provincias/${id}`, 1, { nombre: 'Mismo nombre' })));
  assert.deepEqual(simultaneas.map(respuesta => respuesta.estado).sort(), [200, 409]);
  const altasSimultaneas = await Promise.all([1, 2].map(() => pedir('POST', '/ubicacion/ciudades', 1, { nombre: 'Ciudad concurrente', idProvincia: 1 })));
  assert.deepEqual(altasSimultaneas.map(respuesta => respuesta.estado).sort(), [201, 409]);
});
