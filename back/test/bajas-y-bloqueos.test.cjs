require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const { ConflictException, NotFoundException } = require('@nestjs/common');
const { UsuariosService } = require('../dist/usuarios/service/usuarios.service');
const { UsuariosRepository } = require('../dist/usuarios/repository/usuarios.repository');
const { PublicacionesService } = require('../dist/publicaciones/service/publicaciones.service');
const { PublicacionesRepository } = require('../dist/publicaciones/repository/publicaciones.repository');
const { MensajesService } = require('../dist/mensajes/service/mensajes.service');
const { Usuario } = require('../dist/usuarios/entity/usuario.entity');

const FUTURO = '2099-01-10';
const PASADO = '2000-01-10';

// Base aislada donde se ejecutan los predicados de los repositorios.
function base() {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE usuario (id INTEGER PRIMARY KEY, activa BOOLEAN, bloqueado BOOLEAN, fecha_baja TEXT);
    CREATE TABLE publicacion (id INTEGER PRIMARY KEY, id_anunciante INTEGER, activa BOOLEAN);
    CREATE TABLE reserva (id INTEGER PRIMARY KEY, id_usuario INTEGER, id_publicacion INTEGER,
      estado_pago TEXT, cancelada BOOLEAN, finalizada BOOLEAN, fecha_inicio TEXT, fecha_fin TEXT,
      estado_liquidacion TEXT);
    CREATE TABLE pago (id INTEGER PRIMARY KEY, id_reserva INTEGER, payment_id TEXT, status TEXT,
      created_at TEXT);
    INSERT INTO usuario VALUES (1, 1, 0, NULL), (2, 1, 0, NULL);
    INSERT INTO publicacion VALUES (10, 2, 1);
  `);
  return db;
}

let ultimaReserva = 100;
function reserva(db, datos) {
  const fila = {
    id: ++ultimaReserva, id_usuario: 1, id_publicacion: 10, estado_pago: 'APROBADO',
    cancelada: 0, finalizada: 0, fecha_inicio: PASADO, fecha_fin: PASADO,
    estado_liquidacion: 'PAGADO_PROPIETARIO', ...datos,
  };
  db.prepare(`INSERT INTO reserva VALUES (:id, :id_usuario, :id_publicacion, :estado_pago,
    :cancelada, :finalizada, :fecha_inicio, :fecha_fin, :estado_liquidacion)`).run(fila);
  return fila.id;
}

const HACE_DOS_DIAS = () => new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
const HACE_UN_MINUTO = () => new Date(Date.now() - 60 * 1000).toISOString();
let ultimoPago = 0;
function pago(db, idReserva, paymentId, status, creadoEn) {
  db.prepare('INSERT INTO pago VALUES (?, ?, ?, ?, ?)').run(++ultimoPago, idReserva, paymentId, status, creadoEn);
  return ultimoPago;
}

const JOINS = {
  'reserva.publicacion': 'INNER JOIN publicacion publicacion ON publicacion.id = reserva.id_publicacion',
  'pago.reserva': 'INNER JOIN reserva reserva ON reserva.id = pago.id_reserva',
};

// Imita el QueryBuilder de TypeORM traduciendo las condiciones a SQLite.
function consulta(db, tabla, alias) {
  const joins = [], condiciones = [], params = {};
  const sql = (select) => {
    let texto = `SELECT ${select} FROM ${tabla} ${alias} ${joins.join(' ')}` +
      (condiciones.length ? ` WHERE ${condiciones.map((c) => `(${c})`).join(' AND ')}` : '');
    const simples = {};
    for (const [clave, valor] of Object.entries(params)) {
      if (Array.isArray(valor)) {
        texto = texto.replace(`:...${clave}`, valor.map((v) => `'${v}'`).join(', '));
      } else simples[clave] = valor instanceof Date ? valor.toISOString() : valor;
    }
    return [texto, simples];
  };
  const builder = {
    select() { return builder; },
    orderBy() { return builder; },
    setLock() { return builder; },
    innerJoin(ruta) { joins.push(JOINS[ruta]); return builder; },
    where(condicion, valores = {}) { condiciones.push(condicion); Object.assign(params, valores); return builder; },
    andWhere(condicion, valores) { return builder.where(condicion, valores); },
    async getCount() { const [t, p] = sql('COUNT(*) AS n'); return db.prepare(t).get(p).n; },
    async getMany() { const [t, p] = sql(`${alias}.*`); return db.prepare(t).all(p); },
    async getOne() {
      const [t, p] = sql(`${alias}.*`);
      const fila = db.prepare(t).get(p);
      return fila && Object.assign(new Usuario(), { ...fila, activa: !!fila.activa, bloqueado: !!fila.bloqueado });
    },
  };
  return builder;
}

function servicioUsuarios(db) {
  const manager = {
    getRepository(entidad) {
      const tabla = entidad.name.toLowerCase();
      return {
        createQueryBuilder: (alias) => consulta(db, tabla, alias),
        async save(usuario) {
          db.prepare('UPDATE usuario SET activa = ?, bloqueado = ?, fecha_baja = ? WHERE id = ?')
            .run(usuario.activa ? 1 : 0, usuario.bloqueado ? 1 : 0, usuario.fecha_baja?.toISOString() ?? null, usuario.id);
          return usuario;
        },
      };
    },
    createQueryBuilder() {
      const b = {
        update(entidad) { b.entidad = entidad.name; return b; },
        set(valores) {
          // Publicaciones inactivas; el CUIT/CUIL se prueba en cuit-email-historicos.test.cjs.
          if (b.entidad === 'Publicacion') assert.deepEqual(valores, { activa: false });
          return b;
        },
        where(_sql, { idUsuario }) { b.id = idUsuario; return b; },
        async execute() {
          if (b.entidad === 'Publicacion') {
            db.prepare('UPDATE publicacion SET activa = 0 WHERE id_anunciante = ?').run(b.id);
          }
        },
      };
      return b;
    },
  };
  const repo = new UsuariosRepository({
    manager: { transaction: (fn) => fn(manager) },
    findOne: async ({ where: { id } }) => {
      const fila = db.prepare('SELECT * FROM usuario WHERE id = ?').get(id);
      return fila && Object.assign(new Usuario(), { ...fila, activa: !!fila.activa, bloqueado: !!fila.bloqueado });
    },
  });
  return new UsuariosService(repo, {}, {}, {}, {},
    new PublicacionesService(new PublicacionesRepository()),
    { archivarCuitPorBajaDeCuenta: async () => {} });
}

test('bloquear y habilitar conserva reservas, reclamos, liquidaciones y pausa de publicaciones', async () => {
  const db = base();
  reserva(db, { estado_pago: 'PENDIENTE', estado_liquidacion: 'NO_APLICA' });
  reserva(db, { estado_liquidacion: 'RETENIDO', fecha_fin: FUTURO });
  reserva(db, { estado_liquidacion: 'EN_REVISION' });
  reserva(db, { estado_liquidacion: 'PENDIENTE_PAGO_PROPIETARIO' });
  db.exec('INSERT INTO publicacion VALUES (11, 2, 0)');
  const antes = db.prepare('SELECT * FROM reserva').all();
  const publicaciones = db.prepare('SELECT * FROM publicacion').all();
  const servicio = servicioUsuarios(db);
  await servicio.cambiarBloqueo(2, true, 99, 'Moderación');
  assert.equal(db.prepare('SELECT bloqueado FROM usuario WHERE id = 2').get().bloqueado, 1);
  assert.deepEqual(db.prepare('SELECT * FROM reserva').all(), antes);
  assert.deepEqual(db.prepare('SELECT * FROM publicacion').all(), publicaciones);
  await servicio.cambiarBloqueo(2, false, 99);
  assert.equal(db.prepare('SELECT bloqueado FROM usuario WHERE id = 2').get().bloqueado, 0);
  assert.deepEqual(db.prepare('SELECT * FROM reserva').all(), antes);
  assert.deepEqual(db.prepare('SELECT * FROM publicacion').all(), publicaciones);
});

const activa = (db, id) => !!db.prepare('SELECT activa FROM usuario WHERE id = ?').get(id).activa;

async function rechazaBaja(db, id, ...fragmentos) {
  const servicio = servicioUsuarios(db);
  await assert.rejects(servicio.darDeBajaPropia(id), (error) => {
    assert.ok(error instanceof ConflictException);
    for (const fragmento of fragmentos) assert.match(error.message, fragmento);
    return true;
  });
  assert.equal(activa(db, id), true);
}

test('un Inquilino sin publicaciones no puede darse de baja con una reserva pendiente de pago', async () => {
  const db = base();
  reserva(db, { estado_pago: 'PENDIENTE', estado_liquidacion: 'NO_APLICA', fecha_inicio: FUTURO, fecha_fin: FUTURO });
  await rechazaBaja(db, 1, /como Inquilino: 1 reserva\(s\) pendiente\(s\) de pago/);
});

test('rechaza la baja con una estadía confirmada vigente o futura', async () => {
  const db = base();
  reserva(db, { estado_liquidacion: 'RETENIDO', fecha_inicio: FUTURO, fecha_fin: FUTURO });
  await rechazaBaja(db, 1, /como Inquilino: 1 estadía\(s\) vigente\(s\) o futura\(s\)/);
});

test('rechaza la baja con un reclamo en revisión aunque la estadía haya terminado', async () => {
  const db = base();
  reserva(db, { estado_liquidacion: 'EN_REVISION' });
  await rechazaBaja(db, 1, /como Inquilino: 1 reclamo\(s\) en revisión/);
});

test('un pago iniciado en Mercado Pago bloquea la baja; un checkout abandonado no', async () => {
  const db = base();
  const abandonada = reserva(db, { estado_pago: 'CANCELADO', cancelada: 1, estado_liquidacion: 'NO_APLICA' });
  pago(db, abandonada, null, 'pending', HACE_DOS_DIAS());
  const enProceso = reserva(db, { estado_pago: 'CANCELADO', cancelada: 1, estado_liquidacion: 'NO_APLICA' });
  const idPago = pago(db, enProceso, 'mp-2', 'in_process', HACE_DOS_DIAS());
  await rechazaBaja(db, 1, /como Inquilino: 1 pago\(s\) en proceso en Mercado Pago/);

  db.prepare("UPDATE pago SET status = 'rejected' WHERE id = ?").run(idPago);
  await servicioUsuarios(db).darDeBajaPropia(1);
  assert.equal(activa(db, 1), false);
});

test('un checkout reciente sin pago todavía bloquea la baja del Inquilino', async () => {
  const db = base();
  const vencida = reserva(db, { estado_pago: 'CANCELADO', cancelada: 1, estado_liquidacion: 'NO_APLICA' });
  pago(db, vencida, null, 'pending', HACE_UN_MINUTO());
  await rechazaBaja(db, 1, /como Inquilino: 1 pago\(s\) en proceso en Mercado Pago/);
});

test('un checkout abandonado en una publicación no bloquea para siempre la baja del Anunciante', async () => {
  const db = base();
  const abandonada = reserva(db, { id_usuario: 1, id_publicacion: 10, estado_pago: 'CANCELADO', cancelada: 1, estado_liquidacion: 'NO_APLICA' });
  const idPago = pago(db, abandonada, null, 'pending', HACE_UN_MINUTO());
  // Mientras la preferencia puede usarse o notificarse tarde, sigue pendiente.
  await rechazaBaja(db, 2, /como Anunciante: 1 pago\(s\) sin conciliar con Mercado Pago/);

  db.prepare('UPDATE pago SET created_at = ? WHERE id = ?').run(HACE_DOS_DIAS(), idPago);
  await servicioUsuarios(db).darDeBajaPropia(2);
  assert.equal(activa(db, 2), false);
  assert.equal(db.prepare('SELECT activa FROM publicacion WHERE id = 10').get().activa, 0);
});

test('un pago iniciado sin conciliar bloquea al Anunciante aunque sea viejo', async () => {
  const db = base();
  const cancelada = reserva(db, { estado_pago: 'CANCELADO', cancelada: 1, estado_liquidacion: 'NO_APLICA' });
  pago(db, cancelada, 'mp-9', 'in_process', HACE_DOS_DIAS());
  await rechazaBaja(db, 2, /como Anunciante: 1 pago\(s\) sin conciliar con Mercado Pago/);
});

test('el historial cerrado no impide la baja del Inquilino', async () => {
  const db = base();
  reserva(db, { finalizada: 1, estado_liquidacion: 'PAGADO_PROPIETARIO' });
  reserva(db, { estado_pago: 'REEMBOLSADO', cancelada: 1, estado_liquidacion: 'DEVUELTO_INQUILINO', fecha_inicio: FUTURO, fecha_fin: FUTURO });
  reserva(db, { estado_pago: 'CANCELADO', cancelada: 1, estado_liquidacion: 'NO_APLICA', fecha_inicio: FUTURO, fecha_fin: FUTURO });
  // Estadía pasada sin código validado: la liquidación la resuelve el Administrador.
  reserva(db, { estado_liquidacion: 'RETENIDO' });
  const respuesta = await servicioUsuarios(db).darDeBajaPropia(1);
  assert.match(respuesta.mensaje, /dada de baja/);
  assert.equal(activa(db, 1), false);
});

test('informa por separado los pendientes como Anunciante y como Inquilino', async () => {
  const db = base();
  db.exec('INSERT INTO publicacion VALUES (11, 1, 1)');
  reserva(db, { id_usuario: 2, id_publicacion: 11, estado_pago: 'PENDIENTE', estado_liquidacion: 'NO_APLICA' });
  reserva(db, { estado_liquidacion: 'EN_REVISION' });
  await rechazaBaja(db, 1,
    /como Anunciante: 1 reserva\(s\) pendiente\(s\) de pago/,
    /como Inquilino: 1 reclamo\(s\) en revisión/,
  );
  assert.equal(db.prepare('SELECT activa FROM publicacion WHERE id = 11').get().activa, 1);
});

test('no se puede bloquear ni habilitar una cuenta dada de baja', async () => {
  const usuario = Object.assign(new Usuario(), { id: 5, activa: false, bloqueado: false });
  let guardado = false, avisado = false;
  const repo = { buscarPorId: async () => usuario, guardar: async () => { guardado = true; } };
  const mail = { enviarCambioBloqueo: async () => { avisado = true; } };
  const servicio = new UsuariosService(repo, {}, {}, mail, {}, {}, {});
  await assert.rejects(servicio.cambiarBloqueo(5, true, 1, 'motivo'), ConflictException);
  assert.equal(guardado, false);
  assert.equal(avisado, false);
});

function servicioMensajes(usuarios) {
  const guardados = [], correos = [];
  const publicacion = { id: 10, titulo: 'Casa', activa: false, anunciante: { idUsuario: 2 } };
  const servicio = new MensajesService(
    {
      conTransaccion: async (accion) => accion({ crear: (datos) => datos,
        guardar: async (mensaje) => { guardados.push(mensaje); return mensaje; } }, {}),
      crear: (datos) => datos,
      guardar: async (mensaje) => { guardados.push(mensaje); return mensaje; },
      existeConversacion: async () => true,
    },
    new PublicacionesService({ buscarPorId: async () => publicacion, bloquearPorId: async () => publicacion }),
    new UsuariosService({ buscarPorId: async (id) => usuarios[id] ?? null }),
    { existeReservaAprobada: async () => true },
    { enviarMensajeNuevo: async (email) => { correos.push(email); } },
  );
  return { servicio, guardados, correos };
}

const persona = (id, datos = {}) =>
  Object.assign(new Usuario(), { id, nombre: `U${id}`, apellido: '', email: `u${id}@depa.test`, activa: true, ...datos });

for (const bloqueado of [1, 2]) {
  test(`no guarda ni notifica mensajes cuando la cuenta ${bloqueado} está bloqueada`, async () => {
    const { servicio, guardados, correos } = servicioMensajes({
      1: persona(1, { bloqueado: bloqueado === 1 }),
      2: persona(2, { bloqueado: bloqueado === 2 }),
    });
    await assert.rejects(
      servicio.enviar({ id_publicacion: 10, id_destino_usuario: 2, texto: 'hola' }, 1),
      (error) => error instanceof ConflictException && /suspendido/.test(error.message),
    );
    assert.equal(guardados.length, 0);
    assert.equal(correos.length, 0);
  });
}

test('no se le puede escribir a una cuenta dada de baja ni le llega el correo', async () => {
  const { servicio, guardados, correos } = servicioMensajes({
    1: persona(1), 2: persona(2, { activa: false, fecha_baja: new Date() }),
  });
  await assert.rejects(
    servicio.enviar({ id_publicacion: 10, id_destino_usuario: 2, texto: 'hola' }, 1),
    (error) => error instanceof ConflictException && /dada de baja/.test(error.message),
  );
  assert.equal(guardados.length, 0);
  assert.equal(correos.length, 0);
});

test('con la publicación pausada se le puede seguir escribiendo a un Anunciante activo', async () => {
  const { servicio, guardados, correos } = servicioMensajes({ 1: persona(1), 2: persona(2) });
  await servicio.enviar({ id_publicacion: 10, id_destino_usuario: 2, texto: 'hola' }, 1);
  assert.equal(guardados.length, 1);
  assert.deepEqual(correos, ['u2@depa.test']);
});

test('el Anunciante tampoco puede escribirle a un Inquilino dado de baja', async () => {
  const { servicio, guardados } = servicioMensajes({ 1: persona(1, { activa: false }), 2: persona(2) });
  await assert.rejects(
    servicio.enviar({ id_publicacion: 10, id_destino_usuario: 1, texto: 'hola' }, 2),
    ConflictException,
  );
  assert.equal(guardados.length, 0);
});

test('un destinatario inexistente se rechaza antes de guardar', async () => {
  const { servicio, guardados } = servicioMensajes({ 1: persona(1) });
  await assert.rejects(
    servicio.enviar({ id_publicacion: 10, id_destino_usuario: 2, texto: 'hola' }, 1),
    NotFoundException,
  );
  assert.equal(guardados.length, 0);
});
