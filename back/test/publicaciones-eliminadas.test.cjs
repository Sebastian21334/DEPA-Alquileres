require('reflect-metadata');
const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { DataSource } = require('typeorm');
const { PGlite } = require('@electric-sql/pglite');
const { Publicacion } = require('../dist/publicaciones/entity/publicacion.entity');
const { Reserva } = require('../dist/reservas/entity/reserva.entity');
const { PublicacionesRepository } = require('../dist/publicaciones/repository/publicaciones.repository');
const { PublicacionesService } = require('../dist/publicaciones/service/publicaciones.service');
const { MensajesService } = require('../dist/mensajes/service/mensajes.service');
const { FavoritosService } = require('../dist/favoritos/service/favoritos.service');
const publicacionVisible = (publicacion) => new PublicacionesService().esVisible(publicacion);
const { fechaArgentina } = require('../dist/common/utils/fechas');
const { OptionalJwtAuthGuard } = require('../dist/seguridad/guards/optional-jwt-auth.guard');
const { JwtAuthGuard } = require('../dist/seguridad/guards/jwt-auth.guard');
const { ImagenesService } = require('../dist/imagenes/service/imagenes.service');

const source = new DataSource({ type: 'postgres', entities: [__dirname + '/../dist/**/*.entity.js'] });
before(async () => source.buildMetadatas());

function escenario() {
  const publicacion = Object.assign(new Publicacion(), {
    id: 10, activa: true, eliminada: false, imagenes: [{ id: 50, url: 'foto.jpg' }],
    anunciante: { idUsuario: 2, usuario: { activa: true, bloqueado: false } },
  });
  const reservas = [{ id: 1, publicacion, usuario: { id: 1 }, pendiente: true }];
  const repository = new PublicacionesRepository({
    update: async ({ id }, cambios) => { assert.equal(id, 10); Object.assign(publicacion, cambios); },
  }, {});
  repository.buscarPorId = async () => publicacion;
  repository.buscarPorAnunciante = async () => [publicacion];
  repository.existeReserva = async ({ idPublicacion, idUsuario }) => reservas.some(
    r => r.publicacion.id === idPublicacion && r.usuario.id === idUsuario && r.pendiente,
  );
  const servicio = new PublicacionesService(repository, {}, {}, {});
  return { publicacion, reservas, servicio };
}

test('eliminar conserva la publicación, fotos y reserva; solo el inquilino vigente puede abrirla', async () => {
  const e = escenario();
  await assert.rejects(e.servicio.eliminar(10, { idUsuario: 99 }), { status: 403 });
  await e.servicio.eliminar(10, { idUsuario: 2 });
  assert.equal(e.publicacion.activa, false);
  assert.equal(e.publicacion.eliminada, true);
  assert.equal(e.reservas[0].publicacion, e.publicacion);
  assert.equal(e.publicacion.imagenes[0].url, 'foto.jpg');
  assert.equal(await e.servicio.buscarPorId(10), e.publicacion);
  assert.equal(await e.servicio.buscarPublicaPorId(10, 1), e.publicacion);
  for (const id of [undefined, 2, 99]) {
    await assert.rejects(e.servicio.buscarPublicaPorId(10, id), { status: 404 });
  }
  e.reservas[0].pendiente = false;
  await assert.rejects(e.servicio.buscarPublicaPorId(10, 1), { status: 404 });
});

test('una eliminada no aparece en listados ni favoritos y no puede reactivarse o modificarse', async () => {
  const e = escenario();
  await e.servicio.eliminar(10, { idUsuario: 2 });
  assert.equal(publicacionVisible(e.publicacion), false);
  for (const activas of [true, false]) {
    assert.deepEqual(await e.servicio.listarPorAnunciante(2, activas), []);
  }
  const favoritos = new FavoritosService({ buscarPorUsuario: async () => [{ publicacion: e.publicacion }] }, e.servicio);
  assert.deepEqual(await favoritos.listar(1), []);
  await assert.rejects(favoritos.agregar(1, 10), { status: 409 });
  await assert.rejects(e.servicio.actualizar(10, { idUsuario: 2 }, { activa: true }), { status: 404 });
  await e.servicio.activar(e.publicacion);
  assert.equal(e.publicacion.activa, false);
  await assert.rejects(e.servicio.registrarVisualizacion(10), { status: 404 });
});

for (const [origen, destino] of [[1, 2], [2, 1], [99, 2]]) {
  test(`no permite contactos después de la baja (${origen} → ${destino})`, async () => {
    const e = escenario();
    await e.servicio.eliminar(10, { idUsuario: 2 });
    // Sin repositorio de mensajes: debe rechazar antes de guardar o notificar.
    const mensajes = new MensajesService({}, e.servicio, {}, {}, {});
    await assert.rejects(mensajes.enviar({
      id_publicacion: 10, id_destino_usuario: destino, texto: 'hola',
    }, origen), { status: 409 });
  });
}

test('el dueño no puede borrar las fotos conservadas para una reserva vigente', async () => {
  const e = escenario();
  await e.servicio.eliminar(10, { idUsuario: 2 });
  const imagenes = new ImagenesService({
    buscarPorId: async () => ({ publicacion: e.publicacion }),
  }, e.servicio, {});
  await assert.rejects(imagenes.eliminar(50, { idUsuario: 2 }), { status: 400 });
});

test('la consulta real de reservas respeta usuario, publicación, fechas, pago y cierre', async (t) => {
  // 00:30 UTC todavía corresponde al día anterior en Argentina.
  t.mock.timers.enable({ apis: ['Date'], now: Date.parse('2030-02-11T00:30:00Z') });
  assert.equal(fechaArgentina(), '2030-02-10');
  const db = new DatabaseSync(':memory:');
  t.after(() => db.close());
  db.exec(`
    CREATE TABLE publicacion (id_publicacion INTEGER PRIMARY KEY);
    CREATE TABLE usuario (id_usuario INTEGER PRIMARY KEY);
    CREATE TABLE reserva (id_reserva INTEGER PRIMARY KEY, id_publicacion INTEGER, id_usuario INTEGER,
      cancelada BOOLEAN, finalizada BOOLEAN, fecha_fin TEXT, estado_pago TEXT, pago_vencimiento TEXT);
    INSERT INTO publicacion VALUES (10), (20);
    INSERT INTO usuario VALUES (1), (2);
  `);
  const repoReservas = source.getRepository(Reserva);
  const repository = new PublicacionesRepository({}, {
    exists: async (options) => {
      const [sql, params] = repoReservas.createQueryBuilder('reserva')
        .setFindOptions(options).select('1').getQueryAndParameters();
      const valores = params.map(v => v instanceof Date ? v.toISOString() : typeof v === 'boolean' ? Number(v) : v);
      return !!db.prepare(sql.replace(/\$(\d+)/g, '?$1')).get(...valores);
    },
  });
  const casos = [
    [{}, true],
    [{ fecha_fin: '2030-02-10' }, true],
    [{ fecha_fin: '2030-02-09' }, false],
    [{ fecha_fin: null }, false],
    [{ cancelada: 1 }, false],
    [{ finalizada: 1 }, false],
    [{ id_usuario: 2 }, false],
    [{ id_publicacion: 20 }, false],
    [{ estado_pago: 'PENDIENTE', pago_vencimiento: '2030-02-11T01:00:00.000Z' }, true],
    [{ estado_pago: 'PENDIENTE', pago_vencimiento: '2030-02-11T00:30:00.000Z' }, false],
    [{ estado_pago: 'PENDIENTE', pago_vencimiento: null }, false],
    ...['RECHAZADO', 'CANCELADO', 'REEMBOLSADO'].map(estado_pago => [{ estado_pago }, false]),
  ];
  for (const [cambio, esperado] of casos) {
    const fila = { id_publicacion: 10, id_usuario: 1, cancelada: 0, finalizada: 0,
      fecha_fin: '2030-02-12', estado_pago: 'APROBADO', pago_vencimiento: null, ...cambio };
    db.exec('DELETE FROM reserva');
    db.prepare(`INSERT INTO reserva VALUES (1, :id_publicacion, :id_usuario, :cancelada,
      :finalizada, :fecha_fin, :estado_pago, :pago_vencimiento)`).run(fila);
    const servicio = new PublicacionesService(repository);
    repository.buscarPorId = async () => ({ id: 10, eliminada: true });
    if (esperado) assert.equal((await servicio.buscarPublicaPorId(10, 1)).id, 10);
    else await assert.rejects(servicio.buscarPublicaPorId(10, 1), { status: 404 }, JSON.stringify(cambio));
  }
});

test('la migración es repetible y el UPDATE real conserva las relaciones en PostgreSQL', async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec(`
    CREATE TABLE publicacion (id_publicacion serial PRIMARY KEY, activa boolean NOT NULL);
    CREATE TABLE reserva (id_reserva serial PRIMARY KEY, id_publicacion integer REFERENCES publicacion ON DELETE SET NULL);
    CREATE TABLE imagen (id_imagen serial PRIMARY KEY, id_publicacion integer REFERENCES publicacion ON DELETE CASCADE);
    INSERT INTO publicacion VALUES (10, true);
    INSERT INTO reserva VALUES (1, 10);
    INSERT INTO imagen VALUES (1, 10);
  `);
  const migration = fs.readFileSync(path.join(__dirname, '../migrations/20261111-publicaciones-eliminadas.sql'), 'utf8');
  await db.exec(migration);
  await db.exec(migration);
  assert.equal((await db.query('SELECT eliminada FROM publicacion')).rows[0].eliminada, false);
  const repo = source.getRepository(Publicacion);
  const repository = new PublicacionesRepository({
    update: async (where, values) => {
      const [sql, params] = repo.createQueryBuilder().update().set(values).where(where).getQueryAndParameters();
      await db.query(sql, params);
    },
  }, {});
  repository.buscarPorId = async () => ({ id: 10, anunciante: { idUsuario: 2 } });
  await new PublicacionesService(repository).eliminar(10, { idUsuario: 2 });
  assert.deepEqual((await db.query('SELECT * FROM publicacion')).rows, [{ id_publicacion: 10, activa: false, eliminada: true }]);
  assert.equal((await db.query('SELECT id_publicacion FROM reserva')).rows[0].id_publicacion, 10);
  assert.equal((await db.query('SELECT id_publicacion FROM imagen')).rows[0].id_publicacion, 10);
});

test('el acceso opcional permite anónimos y valida tokens antes de confiar en el usuario', async (t) => {
  const guard = new OptionalJwtAuthGuard();
  const request = { headers: {} };
  const context = { switchToHttp: () => ({ getRequest: () => request }) };
  assert.equal(await guard.canActivate(context), true);
  const validar = t.mock.method(JwtAuthGuard.prototype, 'canActivate', () => { throw new Error('Token inválido'); });
  request.headers.authorization = 'Bearer invalido';
  assert.throws(() => guard.canActivate(context), /Token inválido/);
  assert.equal(validar.mock.callCount(), 1);
});

test('HTTP: elimina con permiso y conserva el detalle solo para la sesión del inquilino vigente', async (t) => {
  const { Module } = require('@nestjs/common');
  const { NestFactory } = require('@nestjs/core');
  const { JwtModule, JwtService } = require('@nestjs/jwt');
  const { PassportModule } = require('@nestjs/passport');
  const { ConfigService } = require('@nestjs/config');
  const { PublicacionesController } = require('../dist/publicaciones/controller/publicaciones.controller');
  const { ImagenesController } = require('../dist/imagenes/controller/imagenes.controller');
  const { DisponibilidadController } = require('../dist/disponibilidad/controller/disponibilidad.controller');
  const { DisponibilidadService } = require('../dist/disponibilidad/service/disponibilidad.service');
  const { JwtStrategy } = require('../dist/seguridad/strategy/jwt.strategy');
  const { SeguridadService } = require('../dist/seguridad/service/seguridad.service');
  const { UsuariosConsultaService } = require('../dist/usuarios/service/usuarios-consulta.service');
  const { AnunciantesService } = require('../dist/anunciantes/service/anunciantes.service');
  const e = escenario();
  const bloqueados = new Set();
  class AplicacionPrueba {}
  Module({
    imports: [PassportModule.register({ defaultStrategy: 'jwt' }),
      JwtModule.register({ secret: 'secreto-local-exclusivo-de-pruebas', signOptions: { expiresIn: 300 } })],
    controllers: [PublicacionesController, ImagenesController, DisponibilidadController],
    providers: [JwtStrategy, SeguridadService, OptionalJwtAuthGuard,
      { provide: PublicacionesService, useValue: e.servicio },
      { provide: ImagenesService, useValue: new ImagenesService({
        buscarPorPublicacion: async () => e.publicacion.imagenes,
      }, e.servicio, {}) },
      { provide: DisponibilidadService, useValue: new DisponibilidadService({
        buscarPorPublicacion: async () => [{ fecha: '2030-02-12', disponible: false }],
      }, e.servicio) },
      { provide: ConfigService, useValue: { getOrThrow: () => 'secreto-local-exclusivo-de-pruebas' } },
      { provide: UsuariosConsultaService, useValue: {
        buscarPorId: async id => ({ id, activa: true, bloqueado: bloqueados.has(id) }),
      } },
      { provide: AnunciantesService, useValue: {
        buscarPorUsuario: async id => ({ idUsuario: id, verificado: true }),
      } }],
  })(AplicacionPrueba);
  const app = await NestFactory.create(AplicacionPrueba, { logger: false, abortOnError: false });
  t.after(() => app.close());
  await app.listen(0, '127.0.0.1');
  const url = `${await app.getUrl()}/publicaciones/10`;
  const rutasRelacionadas = ['imagenes/publicacion/10', 'disponibilidad/publicacion/10'];
  const jwt = app.get(JwtService);
  const consultar = (id, method = 'GET') => fetch(url, { method,
    headers: id ? { Authorization: `Bearer ${jwt.sign({ sub: id })}` } : {},
  });
  assert.equal((await consultar()).status, 200);
  for (const ruta of rutasRelacionadas) assert.equal((await fetch(`${await app.getUrl()}/${ruta}`)).status, 200);
  assert.equal((await consultar(99, 'DELETE')).status, 403);
  const eliminacion = await consultar(2, 'DELETE');
  assert.equal(eliminacion.status, 200);
  assert.equal((await eliminacion.json()).eliminada, true);
  const anonimo = await consultar();
  assert.equal(anonimo.status, 404);
  assert.equal((await anonimo.json()).message, 'Publicación no disponible');
  const vigente = await consultar(1);
  assert.equal(vigente.status, 200);
  assert.equal((await vigente.json()).id, 10);
  for (const id of [2, 99]) assert.equal((await consultar(id)).status, 404);
  for (const ruta of rutasRelacionadas) {
    const destino = `${await app.getUrl()}/${ruta}`;
    assert.equal((await fetch(destino)).status, 404);
    for (const id of [1, 99]) {
      const respuesta = await fetch(destino, { headers: { Authorization: `Bearer ${jwt.sign({ sub: id })}` } });
      assert.equal(respuesta.status, id === 1 ? 200 : 404);
      if (id === 1) assert.equal((await respuesta.json()).length, 1);
    }
  }
  assert.equal((await fetch(url, { headers: { Authorization: 'Bearer invalido' } })).status, 401);
  bloqueados.add(1);
  assert.equal((await consultar(1)).status, 401);
  bloqueados.delete(1);
  e.reservas[0].pendiente = false;
  assert.equal((await consultar(1)).status, 404);
  for (const ruta of rutasRelacionadas) {
    assert.equal((await fetch(`${await app.getUrl()}/${ruta}`, {
      headers: { Authorization: `Bearer ${jwt.sign({ sub: 1 })}` },
    })).status, 404);
  }
});

test('una edición concurrente no restaura una publicación eliminada', async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec(`CREATE TABLE publicacion (id_publicacion integer PRIMARY KEY, titulo text,
    activa boolean NOT NULL, eliminada boolean NOT NULL DEFAULT false);
    INSERT INTO publicacion VALUES (10, 'Original', true, false);`);
  const repo = source.getRepository(Publicacion);
  const repository = new PublicacionesRepository({
    update: async (where, values) => {
      const [sql, params] = repo.createQueryBuilder().update().set(values).where(where).getQueryAndParameters();
      const resultado = await db.query(sql, params);
      return { affected: resultado.affectedRows };
    },
    save: async (publicacion) => {
      await db.query('UPDATE publicacion SET titulo=$1, activa=$2, eliminada=$3 WHERE id_publicacion=10',
        [publicacion.titulo, publicacion.activa, publicacion.eliminada]);
      return publicacion;
    },
  }, {});
  let eliminadaMientrasSeEdita = false;
  repository.buscarPorId = async () => {
    const { rows: [actual] } = await db.query('SELECT * FROM publicacion WHERE id_publicacion=10');
    const anterior = { id: 10, ...actual, anunciante: { idUsuario: 2 }, imagenes: [{ id: 50 }] };
    // La eliminación se confirma después de leer el formulario y antes de guardar la edición.
    if (!eliminadaMientrasSeEdita) {
      eliminadaMientrasSeEdita = true;
      await db.exec('UPDATE publicacion SET activa=false, eliminada=true WHERE id_publicacion=10');
    }
    return anterior;
  };
  const servicio = new PublicacionesService(repository);
  await assert.rejects(servicio.actualizar(10, { idUsuario: 2 }, { titulo: 'Editada' }), { status: 404 });
  assert.deepEqual((await db.query('SELECT titulo, activa, eliminada FROM publicacion')).rows[0],
    { titulo: 'Original', activa: false, eliminada: true });
  // La misma actualización funciona sobre una publicación que sigue habilitada.
  await db.exec('UPDATE publicacion SET eliminada=false WHERE id_publicacion=10');
  assert.equal((await servicio.actualizar(10, { idUsuario: 2 }, { titulo: 'Editada' })).titulo, 'Editada');
  assert.equal((await db.query('SELECT titulo FROM publicacion')).rows[0].titulo, 'Editada');
});

test('una eliminación confirmada mientras se espera el bloqueo impide modificar fotos o enviar mensajes', async () => {
  for (const operacion of ['ordenar', 'eliminar', 'enviar']) {
    const e = escenario();
    let escrituras = 0;
    const repositorio = {
      buscarPorId: async () => ({ id: 50, publicacion: e.publicacion }),
      conTransaccion: async accion => accion(repositorio, {}),
      guardar: async () => { escrituras++; },
      eliminar: async () => { escrituras++; },
      actualizarOrden: async () => { escrituras++; },
    };
    // La lectura inicial ve la publicación activa; el bloqueo ya ve la baja confirmada.
    e.servicio.publicacionesRepo.bloquearPorId = async () => ({ ...e.publicacion, eliminada: true });
    const imagenes = new ImagenesService(repositorio, e.servicio, {
      eliminarImagenPropia: async () => { escrituras++; },
    });
    const mensajes = new MensajesService(repositorio, e.servicio, {}, {}, {});
    const accion = operacion === 'ordenar'
      ? imagenes.ordenar(10, [50], { idUsuario: 2 })
      : operacion === 'eliminar' ? imagenes.eliminar(50, { idUsuario: 2 })
      : mensajes.enviar({ id_publicacion: 10, id_destino_usuario: 2, texto: 'hola' }, 1);
    await assert.rejects(accion, { status: 404 });
    assert.equal(escrituras, 0, operacion);
  }
});

test('un fallo de transacción al enviar revierte el mensaje y no manda correo; permite reintentar', async () => {
  const e = escenario();
  e.servicio.publicacionesRepo.bloquearPorId = async () => e.publicacion;
  let filas = [], correos = 0, fallar = true;
  const repo = {
    crear: datos => datos,
    guardar: async mensaje => { filas.push(mensaje); return mensaje; },
    conTransaccion: async accion => {
      const respaldo = [...filas];
      try {
        const respuesta = await accion(repo, {});
        if (fallar) throw new Error('Fallo antes de confirmar');
        return respuesta;
      } catch (error) { filas = respaldo; throw error; }
    },
  };
  const mensajes = new MensajesService(repo, e.servicio, {
    buscarPorId: async id => ({ id, activa: true, bloqueado: false, email: 'prueba@example.invalid' }),
    nombreCompleto: () => 'Prueba',
  }, {}, { enviarMensajeNuevo: async () => { correos++; } });
  const dto = { id_publicacion: 10, id_destino_usuario: 2, texto: 'hola' };
  await assert.rejects(mensajes.enviar(dto, 1), /Fallo antes de confirmar/);
  assert.equal(filas.length, 0);
  assert.equal(correos, 0);
  fallar = false;
  await mensajes.enviar(dto, 1);
  assert.equal(filas.length, 1);
  assert.equal(correos, 1);
});

test('el script de migración valida el certificado y no revela credenciales ante un fallo', async () => {
  const vm = require('node:vm');
  const registros = [];
  let configuracion;
  class Client {
    constructor(opciones) { configuracion = opciones; }
    async connect() { throw new Error('postgres://usuario:clave-privada@base.example.invalid/prueba'); }
  }
  const proceso = { argv: ['node', 'script', '--aplicar'], env: {
    DATABASE_URL: 'postgres://usuario:clave-privada@base.example.invalid/prueba?sslmode=no-verify&ssl=false',
  } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../scripts/publicaciones-eliminadas.cjs'), 'utf8'), {
    require: nombre => nombre === 'pg' ? { Client }
      : nombre === 'dotenv' ? { config: () => {} } : require(nombre),
    __dirname, process: proceso, URL,
    console: { log: (...args) => registros.push(args.join(' ')), error: (...args) => registros.push(args.join(' ')) },
  });
  await new Promise(setImmediate);
  assert.equal(configuracion.ssl.rejectUnauthorized, true);
  assert.equal(new URL(configuracion.connectionString).searchParams.has('sslmode'), false);
  assert.equal(new URL(configuracion.connectionString).searchParams.has('ssl'), false);
  assert.equal(proceso.exitCode, 1);
  assert.doesNotMatch(registros.join('\n'), /clave-privada|postgres:\/\//);
});

test('los repositorios reales revierten un mensaje fallido y conservan el historial tras eliminar', async (t) => {
  const { crearPostgresPruebas } = require('./soporte/postgres-pruebas.cjs');
  const { Mensaje } = require('../dist/mensajes/entity/mensaje.entity');
  const { Usuario } = require('../dist/usuarios/entity/usuario.entity');
  const { MensajeRepository } = require('../dist/mensajes/repository/mensajes.repository');
  const { UsuariosRepository } = require('../dist/usuarios/repository/usuarios.repository');
  const { UsuariosService } = require('../dist/usuarios/service/usuarios.service');
  const base = await crearPostgresPruebas();
  t.after(() => base.cerrar());
  const { db, source: datos } = base;
  await db.exec(`
    INSERT INTO rol (id_rol,nombre) VALUES (1,'Inquilino'),(2,'Anunciante');
    INSERT INTO usuario (id_usuario,nombre,apellido,email,telefono,contrasenia,email_verificado,id_rol)
      VALUES (1,'Inquilino','Prueba','inquilino@example.invalid','123','hash',true,1),
        (2,'Anunciante','Prueba','anunciante@example.invalid','123','hash',true,2);
    INSERT INTO anunciante (id_usuario,numero_contacto) VALUES (2,'123');
    INSERT INTO publicacion (id_publicacion,titulo,descripcion,fecha_publicacion,precio,direccion,cantidad_ambientes,superficie,id_anunciante)
      VALUES (10,'Casa de prueba','Prueba',CURRENT_DATE,100,'Calle de prueba',1,30,2);
  `);
  const publicaciones = new PublicacionesService(new PublicacionesRepository(
    datos.getRepository(Publicacion), datos.getRepository(Reserva),
  ));
  const usuarios = new UsuariosService(new UsuariosRepository(datos.getRepository(Usuario)));
  const repo = new MensajeRepository(datos.getRepository(Mensaje));
  let correos = 0;
  const mensajes = new MensajesService(repo, publicaciones, usuarios, {}, {
    enviarMensajeNuevo: async () => { correos++; },
  });
  const dto = { id_publicacion: 10, id_destino_usuario: 2, texto: 'Consulta de prueba' };
  const conTransaccion = repo.conTransaccion.bind(repo);
  repo.conTransaccion = accion => conTransaccion(async (mensajes, transaccion) => {
    await accion(mensajes, transaccion);
    throw new Error('Fallo después del INSERT');
  });
  await assert.rejects(mensajes.enviar(dto, 1), /Fallo después del INSERT/);
  assert.equal((await db.query('SELECT count(*)::int AS cantidad FROM mensaje')).rows[0].cantidad, 0);
  assert.equal(correos, 0);
  repo.conTransaccion = conTransaccion;
  await mensajes.enviar(dto, 1);
  assert.equal(correos, 1);
  await publicaciones.eliminar(10, { idUsuario: 2 });
  await assert.rejects(mensajes.enviar(dto, 1), { status: 409 });
  const historial = await mensajes.listarConversacion(10, 2, 1);
  assert.equal(historial.length, 1);
  assert.equal(historial[0].publicacion.eliminada, true);
  assert.equal(correos, 1);
});
