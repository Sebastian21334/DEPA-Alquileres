require('reflect-metadata');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { once } = require('node:events');
const { Duplex } = require('node:stream');
const { Module, ValidationPipe } = require('@nestjs/common');
const { ConfigService } = require('@nestjs/config');
const { NestFactory } = require('@nestjs/core');
const { JwtService } = require('@nestjs/jwt');
const { crearPostgresPruebas } = require('./soporte/postgres-pruebas.cjs');
const { CatalogosController } = require('../dist/catalogos/controller/catalogos.controller');
const { CatalogosRepository } = require('../dist/catalogos/repository/catalogos.repository');
const { CatalogosService } = require('../dist/catalogos/service/catalogos.service');
const { UsuariosController } = require('../dist/usuarios/controller/usuarios.controller');
const { UsuariosRepository } = require('../dist/usuarios/repository/usuarios.repository');
const { UsuariosService } = require('../dist/usuarios/service/usuarios.service');
const { SeguridadService } = require('../dist/seguridad/service/seguridad.service');
const { JwtStrategy } = require('../dist/seguridad/strategy/jwt.strategy');
const { Usuario } = require('../dist/usuarios/entity/usuario.entity');
const { Rol } = require('../dist/catalogos/entity/rol.entity');
const { TipoAnunciante } = require('../dist/catalogos/entity/tipo-anunciante.entity');
const { TipoPropiedad } = require('../dist/catalogos/entity/tipo-propiedad.entity');
const { TipoMoneda } = require('../dist/catalogos/entity/tipo-moneda.entity');
const { Modalidad } = require('../dist/catalogos/entity/modalidad.entity');
const { Estado } = require('../dist/catalogos/entity/estado.entity');

// Usa el servidor HTTP real sin puertos ni conexiones a la base del usuario.
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
  const cabecera = respuesta.slice(0, respuesta.indexOf('\r\n\r\n'));
  const texto = respuesta.slice(respuesta.indexOf('\r\n\r\n') + 4);
  return { estado: Number(cabecera.split(' ')[1]), cuerpo: texto ? JSON.parse(texto) : null };
}

test('gestión administrativa por HTTP: permisos, CRUD, integridad y promoción de usuarios', async t => {
  const { db, source, cerrar, cargarSeed } = await crearPostgresPruebas();
  t.after(cerrar);
  await cargarSeed();
  // PGlite tiene una sola conexión física: presta el cliente de forma exclusiva
  // para poder enviar solicitudes HTTP simultáneas sin mezclar transacciones.
  const pool = source.driver.master;
  const conectar = pool.connect.bind(pool);
  let turno = Promise.resolve();
  pool.connect = callback => {
    const anterior = turno;
    let liberar;
    turno = new Promise(resolve => { liberar = resolve; });
    anterior.then(() => conectar((error, cliente, soltar) => callback(error, cliente, () => { soltar(); liberar(); })));
  };
  const repositorio = new CatalogosRepository(...[Rol, TipoAnunciante, TipoPropiedad, Modalidad, TipoMoneda, Estado].map(entidad => source.getRepository(entidad)));
  const catalogos = new CatalogosService(repositorio);
  const usuarios = new UsuariosService(new UsuariosRepository(source.getRepository(Usuario)), catalogos);
  await db.exec(`
    INSERT INTO usuario (id_usuario,nombre,apellido,email,telefono,contrasenia,email_verificado,id_rol,activa,bloqueado)
    SELECT u.id,u.nombre,'Prueba',u.id || '@example.invalid','123','secreto',true,r.id_rol,u.activa,u.bloqueado
    FROM (VALUES (1,'Admin',true,false,'Administrador'),(2,'Usuario',true,false,'Inquilino'),
      (3,'Bloqueado',true,true,'Inquilino'),(4,'Baja',false,false,'Inquilino'),(5,'Anunciante',true,false,'Inquilino'))
      AS u(id,nombre,activa,bloqueado,rol) JOIN rol r ON r.nombre = u.rol;
    INSERT INTO anunciante(id_usuario,numero_contacto,id_tipo_anunciante)
      SELECT 5,'123',id_tipo_anunciante FROM tipo_anunciante WHERE nombre='Particular';
  `);
  const secret = 'pruebas-locales-catalogos';
  const jwt = new JwtService({ secret });
  class ModuloPrueba {}
  Module({ controllers: [CatalogosController, UsuariosController], providers: [
    JwtStrategy,
    { provide: ConfigService, useValue: { getOrThrow: () => secret } },
    { provide: SeguridadService, useValue: new SeguridadService(usuarios) },
    { provide: CatalogosService, useValue: catalogos },
    { provide: UsuariosService, useValue: usuarios },
  ] })(ModuloPrueba);
  const app = await NestFactory.create(ModuloPrueba, { logger: false, abortOnError: false });
  t.after(() => app.close());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.init();
  const pedir = (metodo, ruta, id, datos) => solicitar(app.getHttpServer(), metodo, ruta, id ? jwt.sign({ sub: id }) : undefined, datos);

  for (const [metodo, ruta, datos] of [
    ['POST', '/catalogos/tipos-propiedad', { nombre: 'Loft' }],
    ['PUT', '/catalogos/tipos-propiedad/1', { nombre: 'Cambio' }],
    ['DELETE', '/catalogos/tipos-propiedad/1'],
    ['PATCH', '/usuarios/administracion/5/administrador', {}],
  ]) {
    assert.equal((await pedir(metodo, ruta, null, datos)).estado, 401);
    assert.equal((await pedir(metodo, ruta, 2, datos)).estado, 403);
    assert.equal((await pedir(metodo, ruta, 3, datos)).estado, 401);
  }

  for (const clave of ['tipos-anunciante', 'tipos-propiedad', 'modalidades', 'tipos-moneda']) {
    const ruta = `/catalogos/${clave}`;
    const nombre = clave === 'tipos-moneda' ? 'Nueva moneda (ARS)' : 'Nueva opción';
    const editado = clave === 'tipos-moneda' ? 'Moneda editada (ARS)' : 'Nombre editado';
    const datos = { nombre: `  ${nombre.replace(' ', '   ')}  `, descripcion: 'Descripción', ...(clave === 'modalidades' ? { permite_reservas_por_fecha: true } : {}) };
    const alta = await pedir('POST', ruta, 1, datos);
    assert.equal(alta.estado, 201, JSON.stringify(alta.cuerpo));
    assert.equal(alta.cuerpo.nombre, nombre);
    assert.equal((await pedir('POST', ruta, 1, { ...datos, nombre: nombre.toLowerCase() })).estado, 409);
    const cambio = await pedir('PUT', `${ruta}/${alta.cuerpo.id}`, 1, { nombre: editado, descripcion: null });
    assert.equal(cambio.estado, 200, JSON.stringify(cambio.cuerpo));
    assert.equal(cambio.cuerpo.descripcion, null);
    if (clave === 'modalidades') assert.equal(cambio.cuerpo.admite_reservas_por_fecha, true);
    const listado = await pedir('GET', ruta);
    assert.equal(listado.cuerpo.find(item => item.id === alta.cuerpo.id).nombre, editado);
    assert.equal((await pedir('DELETE', `${ruta}/${alta.cuerpo.id}`, 1)).estado, 204);
    assert.equal((await pedir('DELETE', `${ruta}/${alta.cuerpo.id}`, 1)).estado, 404);
  }

  for (const datos of [{ nombre: '' }, { nombre: '   ' }, { nombre: 5 }, { nombre: 'a'.repeat(101) },
    { nombre: 'Prueba', descripcion: 'a'.repeat(251) }, { nombre: 'Prueba', permite_reservas_por_fecha: 'true' },
    { nombre: 'Prueba', permite_reservas_por_fecha: null }, { nombre: 'Prueba', rol: 'Administrador' }]) {
    assert.equal((await pedir('POST', '/catalogos/tipos-propiedad', 1, datos)).estado, 400);
  }
  assert.equal((await pedir('POST', '/catalogos/modalidades', 1, { nombre: 'Sin configurar' })).estado, 400);
  assert.equal((await pedir('POST', '/catalogos/tipos-propiedad', 1, { nombre: 'Otra', permite_reservas_por_fecha: true })).estado, 400);
  for (const clave of ['roles', 'estado', 'comision-depa', 'desconocido']) {
    assert.equal((await pedir('POST', `/catalogos/${clave}`, 1, { nombre: 'Prueba' })).estado, 400);
  }
  for (const id of ['0', '-1', '2.5', 'abc', '2147483648']) {
    assert.equal((await pedir('PUT', `/catalogos/tipos-propiedad/${id}`, 1, { nombre: 'Prueba' })).estado, 400);
  }
  assert.equal((await pedir('PUT', '/catalogos/tipos-propiedad/999999', 1, { nombre: 'Prueba' })).estado, 404);

  const particular = (await pedir('GET', '/catalogos/tipos-anunciante')).cuerpo.find(item => item.nombre === 'Particular');
  const borradoEnUso = await pedir('DELETE', `/catalogos/tipos-anunciante/${particular.id}`, 1);
  assert.equal(borradoEnUso.estado, 409);
  assert.match(borradoEnUso.cuerpo.message, /en uso/);
  assert.equal((await source.getRepository(TipoAnunciante).findOneBy({ id: particular.id })).nombre, 'Particular');
  assert.equal((await pedir('PUT', `/catalogos/tipos-anunciante/${particular.id}`, 1, { nombre: 'Institucional' })).estado, 409);
  assert.equal((await pedir('POST', '/catalogos/tipos-moneda', 1, { nombre: 'Euro (EUR)' })).estado, 400);
  const peso = (await pedir('GET', '/catalogos/tipos-moneda')).cuerpo.find(item => item.nombre.includes('ARS'));
  assert.equal((await pedir('PUT', `/catalogos/tipos-moneda/${peso.id}`, 1, { nombre: 'Otra moneda (USD)' })).estado, 409);

  // Un error intermedio revierte la escritura y permite reintentar.
  const guardar = repositorio.guardarItem.bind(repositorio);
  repositorio.guardarItem = async (...args) => { await guardar(...args); throw new Error('Fallo simulado'); };
  assert.equal((await pedir('POST', '/catalogos/tipos-propiedad', 1, { nombre: 'Reintento' })).estado, 500);
  repositorio.guardarItem = guardar;
  assert.equal((await pedir('POST', '/catalogos/tipos-propiedad', 1, { nombre: 'Reintento' })).estado, 201);

  for (const id of [3, 4]) assert.equal((await pedir('PATCH', `/usuarios/administracion/${id}/administrador`, 1, {})).estado, 409);
  assert.equal((await pedir('PATCH', '/usuarios/administracion/9999/administrador', 1, {})).estado, 404);
  assert.equal((await pedir('PATCH', '/usuarios/administracion/2147483648/administrador', 1, {})).estado, 400);
  const promovido = await pedir('PATCH', '/usuarios/administracion/5/administrador', 1, {});
  assert.equal(promovido.estado, 200);
  assert.equal(promovido.cuerpo.rol.nombre, 'Administrador');
  assert.equal('contrasenia' in promovido.cuerpo, false);
  assert.equal('version_sesion' in promovido.cuerpo, false);
  assert.equal((await db.query('SELECT count(*) AS total FROM anunciante WHERE id_usuario=5')).rows[0].total, 1);
  assert.equal((await pedir('PATCH', '/usuarios/administracion/5/administrador', 1, {})).estado, 200);
  // Un token anterior a la promoción toma los permisos actuales desde la base.
  assert.equal((await pedir('POST', '/catalogos/tipos-propiedad', 5, { nombre: 'Creado por nuevo admin' })).estado, 201);
  const simultaneas = await Promise.all([1, 2].map(() => pedir('POST', '/catalogos/tipos-propiedad', 1, { nombre: 'Alta simultánea' })));
  assert.deepEqual(simultaneas.map(respuesta => respuesta.estado).sort(), [201, 409]);
  assert.equal((await db.query("SELECT count(*) AS total FROM tipo_propiedad WHERE nombre='Alta simultánea'")).rows[0].total, 1);
  const promociones = await Promise.all([1, 2].map(() => pedir('PATCH', '/usuarios/administracion/2/administrador', 1, {})));
  assert.deepEqual(promociones.map(respuesta => respuesta.estado), [200, 200]);
  assert.equal((await usuarios.buscarParaSesion(2)).rol.nombre, 'Administrador');
});
