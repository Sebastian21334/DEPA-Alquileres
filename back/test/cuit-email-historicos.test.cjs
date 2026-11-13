const { catalogosDePrueba } = require('./soporte/catalogos-pruebas.cjs');
require('reflect-metadata');
const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const { DataSource } = require('typeorm');
const { ConflictException } = require('@nestjs/common');
const { Usuario } = require('../dist/usuarios/entity/usuario.entity');
const { Anunciante } = require('../dist/anunciantes/entity/anunciante.entity');
const { UsuariosService } = require('../dist/usuarios/service/usuarios.service');
const { UsuariosRepository } = require('../dist/usuarios/repository/usuarios.repository');
const { AnunciantesService, MENSAJE_CUIT_EN_USO } = require('../dist/anunciantes/service/anunciantes.service');
const { AnunciantesRepository } = require('../dist/anunciantes/repository/anunciantes.repository');
const { PublicacionesService } = require('../dist/publicaciones/service/publicaciones.service');
const { PublicacionesRepository } = require('../dist/publicaciones/repository/publicaciones.repository');
const { ValorDuplicadoError, guardarSinDuplicados } = require('../dist/common/persistence/valor-duplicado.error');
const { SolicitudVerificacion } = require('../dist/verificacion-anunciante/entity/solicitud-verificacion.entity');
const { RevisionVerificacion } = require('../dist/verificacion-anunciante/entity/revision-verificacion.entity');
const { VerificacionRepository } = require('../dist/verificacion-anunciante/repository/verificacion.repository');
const { VerificacionAnuncianteService } = require('../dist/verificacion-anunciante/service/verificacion-anunciante.service');
const { crearPostgresPruebas } = require('./soporte/postgres-pruebas.cjs');

// Metadatos reales de TypeORM para PostgreSQL, sin conectarse a una base.
const source = new DataSource({ type: 'postgres', entities: [__dirname + '/../dist/**/*.entity.js'] });
before(async () => source.buildMetadatas());

// Ejecuta en SQLite el SQL que arma TypeORM: $1, $2… pasan a ?1, ?2…
function ejecutar(db, sql, params) {
  const valores = params.map((v) => (typeof v === 'boolean' ? Number(v) : v));
  return db.prepare(sql.replace(/\$(\d+)/g, '?$1')).run(...valores);
}

function base() {
  const db = new DatabaseSync(':memory:');
  // PostgreSQL trae regexp_replace; en SQLite se registra con el mismo comportamiento.
  db.function('regexp_replace', (texto, patron, reemplazo, opciones) =>
    texto === null ? null : String(texto).replace(new RegExp(patron, opciones), reemplazo));
  db.exec(`
    CREATE TABLE usuario (id INTEGER PRIMARY KEY, activa BOOLEAN, bloqueado BOOLEAN, fecha_baja TEXT,
      email TEXT, email_historico TEXT);
    CREATE TABLE anunciante (id_usuario INTEGER PRIMARY KEY, verificado BOOLEAN, cuit_cuil TEXT,
      cuit_cuil_historico TEXT, numero_contacto TEXT, id_tipo_anunciante INTEGER);
    CREATE TABLE publicacion (id INTEGER PRIMARY KEY, id_anunciante INTEGER, activa BOOLEAN);
    CREATE TABLE reserva (id INTEGER PRIMARY KEY, id_usuario INTEGER, id_publicacion INTEGER,
      estado_pago TEXT, cancelada BOOLEAN, finalizada BOOLEAN, fecha_inicio TEXT, fecha_fin TEXT,
      estado_liquidacion TEXT);
    CREATE TABLE liquidacion (id_reserva INTEGER PRIMARY KEY, estado TEXT);
    CREATE TABLE pago (id INTEGER PRIMARY KEY, id_reserva INTEGER, payment_id TEXT, status TEXT, created_at TEXT);
    INSERT INTO usuario VALUES (1, 1, 0, NULL, 'ana@mail.com', NULL), (2, 1, 0, NULL, 'beto@mail.com', NULL);
    INSERT INTO anunciante VALUES (1, 1, '20-12345678-9', NULL, '3510000000', 1);
    INSERT INTO publicacion VALUES (10, 1, 1);
  `);
  return db;
}

// Consultas de lectura de la baja (usuario, publicaciones, pendientes) sobre SQLite.
const JOINS = {
  'reserva.publicacion': 'INNER JOIN publicacion publicacion ON publicacion.id = reserva.id_publicacion',
  'pago.reserva': 'INNER JOIN reserva reserva ON reserva.id = pago.id_reserva',
};
function consulta(db, tabla, alias) {
  const joins = [], condiciones = [], params = {};
  const sql = (select) => {
    let texto = `SELECT ${select} FROM ${tabla} ${alias} ${joins.join(' ')}` +
      (condiciones.length ? ` WHERE ${condiciones.map((c) => `(${c})`).join(' AND ')}` : '');
    const simples = {};
    for (const [clave, valor] of Object.entries(params)) {
      if (Array.isArray(valor)) texto = texto.replace(`:...${clave}`, valor.map((v) => `'${v}'`).join(', '));
      else simples[clave] = valor instanceof Date ? valor.toISOString() : valor;
    }
    return [texto, simples];
  };
  const b = {
    select() { return b; }, orderBy() { return b; }, setLock() { return b; },
    leftJoin() { joins.push('LEFT JOIN liquidacion liquidacion ON liquidacion.id_reserva = reserva.id'); return b; },
    innerJoin(ruta) { joins.push(JOINS[ruta]); return b; },
    where(c, v = {}) { condiciones.push(c); Object.assign(params, v); return b; },
    andWhere(c, v) { return b.where(c, v); },
    async getCount() { const [t, p] = sql('COUNT(*) AS n'); return db.prepare(t).get(p).n; },
    async getMany() { const [t, p] = sql(`${alias}.*`); return db.prepare(t).all(p); },
    async getOne() {
      const [t, p] = sql(`${alias}.*`);
      const fila = db.prepare(t).get(p);
      return fila && Object.assign(new Usuario(), { ...fila, activa: !!fila.activa, bloqueado: !!fila.bloqueado });
    },
  };
  return b;
}

// Las escrituras de la baja usan el SQL real de TypeORM (UPDATE … SET …).
function servicioUsuarios(db) {
  const manager = {
    getRepository(entidad) {
      return {
        createQueryBuilder: (alias) => consulta(db, entidad.name.toLowerCase(), alias),
        async save(u) {
          db.prepare('UPDATE usuario SET activa = ?, fecha_baja = ?, email = ?, email_historico = ? WHERE id = ?')
            .run(u.activa ? 1 : 0, u.fecha_baja?.toISOString() ?? null, u.email, u.email_historico, u.id);
          return u;
        },
      };
    },
    createQueryBuilder() {
      const qb = source.createQueryBuilder();
      const original = qb.update.bind(qb);
      qb.update = (entidad) => {
        const update = original(entidad);
        update.execute = async () => ejecutar(db, ...update.getQueryAndParameters());
        return update;
      };
      return qb;
    },
  };
  const repo = new UsuariosRepository({ manager: { transaction: (fn) => fn(manager) } });
  return new UsuariosService(repo, catalogosDePrueba(), {}, {}, {},
    new PublicacionesService(new PublicacionesRepository()),
    new AnunciantesService(new AnunciantesRepository()));
}

const fila = (db, sql, id) => db.prepare(sql).get(id);

test('la baja de la cuenta mueve el email al histórico y lo libera', async () => {
  const usuario = Object.assign(new Usuario(), { id: 1, activa: true, email: 'ana@mail.com' });
  const repo = {
    conTransaccion: (operacion) => operacion({}),
    buscarBloqueado: async () => usuario,
    contarOperacionesPendientes: async () => ({
      reservasPendientes: 0, estadiasVigentes: 0, liquidacionesPendientes: 0, pagosSinConciliar: 0,
    }),
    guardar: async (cuenta) => cuenta,
  };
  const servicio = new UsuariosService(repo, catalogosDePrueba(), {}, {}, {},
    { bloquearPublicacionesParaCambioDeCuenta: async () => false, desactivarPorBajaDeCuenta: async () => {} },
    { archivarCuitPorBajaDeCuenta: async () => {} });
  await servicio.darDeBajaPropia(usuario.id);
  assert.equal(usuario.activa, false);
  assert.equal(usuario.email, null);
  assert.equal(usuario.email_historico, 'ana@mail.com');
});

test('la baja de un Anunciante mueve su CUIT/CUIL y su email al histórico', async () => {
  const db = base();
  await servicioUsuarios(db).darDeBajaPropia(1);
  assert.deepEqual({ ...fila(db, 'SELECT cuit_cuil, cuit_cuil_historico FROM anunciante WHERE id_usuario = ?', 1) },
    { cuit_cuil: null, cuit_cuil_historico: '20-12345678-9' });
  assert.deepEqual({ ...fila(db, 'SELECT activa, email, email_historico FROM usuario WHERE id = ?', 1) },
    { activa: 0, email: null, email_historico: 'ana@mail.com' });
  assert.equal(fila(db, 'SELECT activa FROM publicacion WHERE id = ?', 10).activa, 0);
});

test('la baja de un usuario sin perfil de Anunciante no toca otros CUIT/CUIL', async () => {
  const db = base();
  await servicioUsuarios(db).darDeBajaPropia(2);
  assert.equal(fila(db, 'SELECT cuit_cuil FROM anunciante WHERE id_usuario = ?', 1).cuit_cuil, '20-12345678-9');
  assert.equal(fila(db, 'SELECT email_historico FROM usuario WHERE id = ?', 2).email_historico, 'beto@mail.com');
});

// Ejecuta en SQLite la consulta real de existeCuitVigente.
function repositorioAnunciantes(db) {
  const repo = source.getRepository(Anunciante);
  return new AnunciantesRepository({
    createQueryBuilder(alias) {
      const qb = repo.createQueryBuilder(alias);
      qb.getExists = async () => {
        const [sql, params] = qb.getQueryAndParameters();
        return !!db.prepare(sql.replace(/\$(\d+)/g, '?$1')).get(...params);
      };
      return qb;
    },
  });
}

test('el CUIT/CUIL se compara por dígitos, con o sin guiones', async () => {
  const repo = repositorioAnunciantes(base());
  assert.equal(await repo.existeCuitVigente('20123456789'), true);
  assert.equal(await repo.existeCuitVigente('20-12345678-9'), true);
  assert.equal(await repo.existeCuitVigente('27-12345678-9'), false);
});

test('el CUIT/CUIL de una cuenta dada de baja queda libre para una cuenta nueva', async () => {
  const db = base();
  await servicioUsuarios(db).darDeBajaPropia(1);
  assert.equal(await repositorioAnunciantes(db).existeCuitVigente('20-12345678-9'), false);
});

function servicioAnunciantes({ enUso = false, errorAlGuardar } = {}) {
  const guardados = [];
  const repo = {
    existeCuitVigente: async () => enUso,
    crear: (datos) => Object.assign(new Anunciante(), datos),
    guardar: async (a) => { if (errorAlGuardar) throw errorAlGuardar; guardados.push(a); return a; },
  };
  return { servicio: new AnunciantesService(repo), guardados };
}
const solicitud = { usuario: { id: 5 }, cuit_cuil: '20-12345678-9', numero_contacto: '351', tipoAnunciante: {} };

test('rechaza una solicitud con un CUIT/CUIL de otra cuenta vigente, también de inmobiliaria', async () => {
  const { servicio, guardados } = servicioAnunciantes({ enUso: true });
  await assert.rejects(servicio.crearPendiente(solicitud), (error) => {
    assert.ok(error instanceof ConflictException);
    assert.equal(error.message, MENSAJE_CUIT_EN_USO);
    return true;
  });
  assert.equal(guardados.length, 0);
});

test('dos solicitudes simultáneas: el índice único se informa como 409', async () => {
  const violacion = Object.assign(new Error('duplicate key'), {
    code: '23505', constraint: 'uq_anunciante_cuit_cuil_digitos',
  });
  const error = await guardarSinDuplicados(() => Promise.reject(violacion), ['uq_anunciante_cuit_cuil_digitos'])
    .catch((e) => e);
  assert.ok(error instanceof ValorDuplicadoError);
  const { servicio } = servicioAnunciantes({ errorAlGuardar: error });
  await assert.rejects(servicio.crearPendiente(solicitud), ConflictException);
});

test('otras violaciones de unicidad no se confunden con el CUIT/CUIL', async () => {
  const otra = Object.assign(new Error('duplicate key'), { code: '23505', constraint: 'otra_restriccion' });
  const error = await guardarSinDuplicados(() => Promise.reject(otra), ['uq_anunciante_cuit_cuil_digitos'])
    .catch((e) => e);
  assert.equal(error, otra);
});

test('una solicitud con un CUIT/CUIL libre se guarda', async () => {
  const { servicio, guardados } = servicioAnunciantes();
  await servicio.crearPendiente(solicitud);
  assert.equal(guardados.length, 1);
  assert.equal(guardados[0].cuit_cuil, '20-12345678-9');
});

test('si falla el borrador, revierte el alta del anunciante y permite reintentar', async () => {
  const { source: db, cerrar } = await crearPostgresPruebas();
  try {
    const usuarios = db.getRepository(Usuario);
    const anunciantes = db.getRepository(Anunciante);
    const solicitudes = db.getRepository(SolicitudVerificacion);
    const usuario = await usuarios.save({
      nombre: 'Usuario', apellido: 'Prueba', email: 'alta@example.invalid',
      telefono: '351', contrasenia: 'hash-de-prueba', email_verificado: true,
    });
    const [{ id }] = await db.query(
      "INSERT INTO tipo_anunciante (nombre) VALUES ('Particular') RETURNING id_tipo_anunciante AS id",
    );
    let notificaciones = 0;
    const servicio = new VerificacionAnuncianteService(
      new AnunciantesService(new AnunciantesRepository(anunciantes)),
      new UsuariosService(new UsuariosRepository(usuarios)),
      catalogosDePrueba({ getTipoAnunciantePorId: async () => ({ id }), esInmobiliaria: () => false }),
      new VerificacionRepository(solicitudes, db.getRepository(RevisionVerificacion), db),
      { enviarSolicitudAnunciante: async () => { notificaciones++; } },
    );
    servicio.logger = { error() {} };
    const datos = { cuit: '20-12345678-9', numero_contacto: '351', idTipoAnunciante: id };

    await db.query('ALTER TABLE solicitud_verificacion ADD CONSTRAINT fallo_alta_prueba CHECK (numero_revision > 1)');
    await assert.rejects(servicio.solicitarAlta(usuario.id, datos), /No se pudo iniciar la solicitud/);
    assert.equal(await anunciantes.count(), 0);
    assert.equal(await solicitudes.count(), 0);
    assert.equal(notificaciones, 0);

    await db.query('ALTER TABLE solicitud_verificacion DROP CONSTRAINT fallo_alta_prueba');
    const anunciante = await servicio.solicitarAlta(usuario.id, datos);
    assert.equal(anunciante.verificado, false);
    assert.equal((await solicitudes.findOneByOrFail({ anunciante: { idUsuario: usuario.id } })).estado, 'borrador');
    assert.equal(notificaciones, 1);
    await assert.rejects(servicio.solicitarAlta(usuario.id, datos), ConflictException);
  } finally {
    await cerrar();
  }
});

function sqlListado(q) {
  const repo = source.getRepository(Usuario);
  let query;
  const repository = new UsuariosRepository({ createQueryBuilder(alias) {
    query = repo.createQueryBuilder(alias);
    query.clone = () => ({ getCount: async () => 0 });
    return query;
  } });
  return repository.listarAdministracion({ pagina: 1, limite: 10, q }).then(() => query.getQueryAndParameters());
}

test('el panel busca por email histórico y por CUIT/CUIL vigente o histórico', async () => {
  const [sql, params] = await sqlListado('20-1234');
  assert.match(sql, /email_historico/);
  assert.match(sql, /LEFT JOIN "anunciante" "anunciante" ON "anunciante"\."id_usuario" = "usuario"\."id_usuario"/);
  assert.match(sql, /cuit_cuil_historico/);
  assert.deepEqual(params, ['20-1234', '201234']);
});

test('una búsqueda sin dígitos no agrega la condición de CUIT/CUIL', async () => {
  const [, params] = await sqlListado('Ana');
  assert.deepEqual(params, ['ana']);
});

test('el panel recibe el email y el CUIT/CUIL históricos de una cuenta dada de baja', async () => {
  const usuario = Object.assign(new Usuario(), {
    id: 1, nombre: 'Ana', apellido: 'Paz', email: null, email_historico: 'ana@mail.com', activa: false,
    anunciante: Object.assign(new Anunciante(), { cuit_cuil: null, cuit_cuil_historico: '20-12345678-9' }),
  });
  const repo = {
    listarAdministracion: async () => ({ datos: [usuario], pagina: 1, limite: 10, total: 1, totalPaginas: 1 }),
    contarUsuarios: async () => 1,
  };
  const servicio = new UsuariosService(repo, catalogosDePrueba(), {}, {}, {}, {});
  const { datos: [fila] } = await servicio.listarAdministracion({ pagina: 1, limite: 10 });
  assert.equal(fila.email, null);
  assert.equal(fila.email_historico, 'ana@mail.com');
  assert.equal(fila.cuit_cuil, null);
  assert.equal(fila.cuit_cuil_historico, '20-12345678-9');
});
