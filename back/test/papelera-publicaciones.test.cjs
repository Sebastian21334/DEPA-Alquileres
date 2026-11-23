require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Module, ValidationPipe } = require('@nestjs/common');
const { NestFactory } = require('@nestjs/core');
const { JwtModule, JwtService } = require('@nestjs/jwt');
const { PassportModule } = require('@nestjs/passport');
const { ConfigService } = require('@nestjs/config');
const { PublicacionesController } = require('../dist/publicaciones/controller/publicaciones.controller');
const { PublicacionesService } = require('../dist/publicaciones/service/publicaciones.service');
const { PublicacionesRepository } = require('../dist/publicaciones/repository/publicaciones.repository');
const { Publicacion } = require('../dist/publicaciones/entity/publicacion.entity');
const { Reserva } = require('../dist/reservas/entity/reserva.entity');
const { JwtStrategy } = require('../dist/seguridad/strategy/jwt.strategy');
const { SeguridadService } = require('../dist/seguridad/service/seguridad.service');
const { UsuariosService } = require('../dist/usuarios/service/usuarios.service');
const { AnunciantesService } = require('../dist/anunciantes/service/anunciantes.service');
const { crearPostgresPruebas } = require('./soporte/postgres-pruebas.cjs');
const { catalogosDePrueba } = require('./soporte/catalogos-pruebas.cjs');

test('HTTP y PostgreSQL: papelera privada, restauración y actividad de publicaciones', async (t) => {
  const base = await crearPostgresPruebas();
  t.after(() => base.cerrar());
  const { db, source } = base;
  await db.exec(`
    INSERT INTO rol (id_rol,nombre) VALUES (1,'Inquilino'),(2,'Anunciante');
    INSERT INTO usuario (id_usuario,nombre,apellido,email,telefono,contrasenia,email_verificado,id_rol)
      VALUES (1,'Inquilino','Prueba','inquilino@example.invalid','123','hash',true,1),
        (2,'Dueño','Prueba','dueno@example.invalid','123','hash',true,2),
        (3,'Otro','Prueba','otro@example.invalid','123','hash',true,2),
        (4,'Sin verificar','Prueba','pendiente@example.invalid','123','hash',true,2);
    INSERT INTO anunciante (id_usuario,numero_contacto,verificado) VALUES (2,'123',true),(3,'123',true),(4,'123',false);
    INSERT INTO publicacion (id_publicacion,titulo,descripcion,fecha_publicacion,precio,direccion,cantidad_ambientes,superficie,id_anunciante,activa,eliminada)
      VALUES (10,'Casa de prueba','Prueba',CURRENT_DATE,100,'Calle 1',1,30,2,true,false),
        (20,'Casa ajena','Prueba',CURRENT_DATE,100,'Calle 2',1,30,3,false,true),
        (30,'Sin fotos','Prueba',CURRENT_DATE,100,'Calle 3',1,30,2,false,false);
    INSERT INTO imagen (id_imagen,id_publicacion,url) VALUES (50,10,'https://example.invalid/foto.jpg');
  `);
  const repository = new PublicacionesRepository(source.getRepository(Publicacion), source.getRepository(Reserva));
  const correos = [];
  const servicio = new PublicacionesService(
    repository,
    catalogosDePrueba(),
    undefined,
    { enviarBajaPublicacion: async (destinatario, titulo, motivo) => { correos.push({ destinatario, titulo, motivo }); } },
    { datosContacto: anunciante => ({ email: anunciante?.usuario?.email }) },
  );
  const bloqueados = new Set();
  class AplicacionPrueba {}
  Module({
    imports: [PassportModule.register({ defaultStrategy: 'jwt' }), JwtModule.register({ secret: 'papelera-solo-pruebas' })],
    controllers: [PublicacionesController],
    providers: [JwtStrategy, SeguridadService,
      { provide: PublicacionesService, useValue: servicio },
      { provide: ConfigService, useValue: { getOrThrow: () => 'papelera-solo-pruebas' } },
      { provide: UsuariosService, useValue: {
        buscarParaSesion: async id => ({ id, activa: true, bloqueado: bloqueados.has(id), rol: { nombre: id === 9 ? 'Administrador' : 'Anunciante' } }),
      } },
      { provide: AnunciantesService, useValue: {
        buscarPorUsuario: async id => id === 1 ? null : ({ idUsuario: id, verificado: id !== 4 }),
      } }],
  })(AplicacionPrueba);
  const app = await NestFactory.create(AplicacionPrueba, { logger: false, abortOnError: false });
  t.after(() => app.close());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.listen(0, '127.0.0.1');
  const jwt = app.get(JwtService);
  const url = await app.getUrl();
  const request = (ruta, id, method = 'GET', body) => fetch(`${url}/publicaciones${ruta}`, {
    method,
    headers: { ...(id ? { Authorization: `Bearer ${jwt.sign({ sub: id })}` } : {}), 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const estado = async () => (await db.query('SELECT activa, eliminada, motivo_baja_admin FROM publicacion WHERE id_publicacion=10')).rows[0];
  const estadoDe = async id => (await db.query('SELECT activa, eliminada, motivo_baja_admin FROM publicacion WHERE id_publicacion=$1', [id])).rows[0];
  const feed = async () => (await (await request('')).json()).datos.map(p => p.id);

  await t.test('el mapa es público, valida el área y devuelve solo los campos del pin', async () => {
    await db.exec('UPDATE publicacion SET latitud = -32.41, longitud = -63.24');
    const respuesta = await request('/mapa?sur=-33&norte=-32&oeste=-64&este=-63');
    assert.equal(respuesta.status, 200);
    const mapa = await respuesta.json();
    assert.equal(mapa.recortado, false);
    assert.equal(mapa.siguienteId, null);
    assert.deepEqual(mapa.puntos.map(punto => punto.id), [10]);
    assert.equal(mapa.puntos[0].latitud, -32.41);
    assert.equal('anunciante' in mapa.puntos[0], false);
    assert.equal((await request('/mapa?sur=-33')).status, 400);
    assert.equal((await request('/mapa?antesDe=0')).status, 400);
  });

  await t.test('autentica y limita la papelera al anunciante verificado y propietario', async () => {
    assert.equal((await request('/mias')).status, 401);
    for (const id of [1, 4]) {
      assert.equal((await request('/mias', id)).status, 403);
      assert.equal((await request('/20/restaurar', id, 'PATCH', {})).status, 403);
    }
    const propias = await request('/mias', 2);
    assert.equal(propias.status, 200);
    assert.deepEqual((await propias.json()).map(p => p.id).sort(), [10, 30]);
    assert.deepEqual((await (await request('/mias', 3)).json()).map(p => p.id), [20]);
    assert.equal((await request('/20/restaurar', 2, 'PATCH', {})).status, 403);
    assert.equal((await request('/10', 3, 'PATCH', { activa: false })).status, 403);
    assert.equal((await request('/10', 3, 'DELETE')).status, 403);
    assert.equal((await request('/999/restaurar', 2, 'PATCH', {})).status, 404);
    assert.equal((await request('/invalido/restaurar', 2, 'PATCH', {})).status, 400);
    bloqueados.add(2);
    assert.equal((await request('/mias', 2)).status, 401);
    assert.equal((await request('/10', 2, 'PATCH', { activa: false })).status, 401);
    bloqueados.delete(2);
  });

  await t.test('desactiva y activa; el feed respeta ambas operaciones', async () => {
    assert.deepEqual(await feed(), [10]);
    const desactivada = await request('/10', 2, 'PATCH', { activa: false });
    assert.equal(desactivada.status, 200);
    assert.equal((await desactivada.json()).activa, false);
    assert.deepEqual(await feed(), []);
    const activada = await request('/10', 2, 'PATCH', { activa: true });
    assert.equal(activada.status, 200);
    assert.equal((await activada.json()).activa, true);
    assert.deepEqual(await feed(), [10]);
    for (const activa of ['true', null, 1]) assert.equal((await request('/10', 2, 'PATCH', { activa })).status, 400);
    assert.equal((await request('/10', 2, 'PATCH', { activa: true, eliminada: false })).status, 400);
    assert.equal((await request('/30', 2, 'PATCH', { activa: true })).status, 400);
  });

  await t.test('elimina, conserva imágenes y restaura inactiva sin perder datos', async () => {
    const eliminada = await request('/10', 2, 'DELETE');
    assert.equal(eliminada.status, 200);
    assert.equal((await eliminada.json()).eliminada, true);
    assert.deepEqual(await feed(), []);
    assert.equal((await request('/10')).status, 404);
    assert.equal((await (await request('/anunciante/2')).json()).some(p => p.id === 10), false);
    const papelera = (await (await request('/mias', 2)).json()).filter(p => p.eliminada);
    assert.deepEqual(papelera.map(p => p.id), [10]);
    assert.equal(papelera[0].imagenes[0].id, 50);
    assert.equal((await request('/10', 2, 'PATCH', { activa: true })).status, 404);
    assert.equal((await request('/10/restaurar', undefined, 'PATCH', {})).status, 401);
    const restaurada = await request('/10/restaurar', 2, 'PATCH', {});
    assert.equal(restaurada.status, 200);
    const pub = await restaurada.json();
    assert.equal(pub.eliminada, false);
    assert.equal(pub.activa, false);
    assert.equal(pub.imagenes[0].id, 50);
    assert.deepEqual(await feed(), []);
    assert.equal((await request('/10/restaurar', 2, 'PATCH', {})).status, 409);
    assert.equal((await request('/10', 2, 'PATCH', { activa: true })).status, 200);
    assert.deepEqual(await feed(), [10]);
  });

  await t.test('restaurar conserva la baja administrativa y no habilita reactivarla', async () => {
    await repository.darDeBaja(10, 'Moderación');
    await request('/10', 2, 'DELETE');
    const restaurada = await request('/10/restaurar', 2, 'PATCH', {});
    assert.equal(restaurada.status, 200);
    assert.equal((await restaurada.json()).motivo_baja_admin, 'Moderación');
    assert.equal((await request('/10', 2, 'PATCH', { activa: true })).status, 403);
    assert.deepEqual(await estado(), { activa: false, eliminada: false, motivo_baja_admin: 'Moderación' });
    assert.deepEqual(await feed(), []);
  });

  await t.test('una baja administrativa concurrente impide activar incluso después de validar', async () => {
    await db.exec('UPDATE publicacion SET motivo_baja_admin=NULL WHERE id_publicacion=10');
    const actualizar = repository.actualizarSiNoEliminada.bind(repository);
    repository.actualizarSiNoEliminada = async (id, cambios) => {
      await repository.darDeBaja(id, 'Baja concurrente');
      return actualizar(id, cambios);
    };
    try {
      assert.equal((await request('/10', 2, 'PATCH', { activa: true })).status, 403);
      assert.equal((await estado()).activa, false);
    } finally { repository.actualizarSiNoEliminada = actualizar; }
  });

  await t.test('dos restauraciones simultáneas producen una sola transición y conservan las fotos', async () => {
    await request('/10', 2, 'DELETE');
    const respuestas = await Promise.all([request('/10/restaurar', 2, 'PATCH', {}), request('/10/restaurar', 2, 'PATCH', {})]);
    assert.deepEqual(respuestas.map(r => r.status).sort(), [200, 409]);
    assert.equal((await estado()).eliminada, false);
    assert.equal((await estado()).activa, false);
    assert.equal((await db.query('SELECT id_publicacion FROM imagen WHERE id_imagen=50')).rows[0].id_publicacion, 10);
  });

  await t.test('administración: reactiva bajas, filtra por estado y rechaza carreras', async () => {
    // La prueba anterior deja una baja administrativa en la publicación 10; se limpia para aislar el escenario.
    await db.exec('UPDATE publicacion SET motivo_baja_admin=NULL WHERE id_publicacion=10');
    await db.exec(`
      INSERT INTO publicacion (id_publicacion,titulo,descripcion,fecha_publicacion,precio,direccion,cantidad_ambientes,superficie,id_anunciante,activa,eliminada)
        VALUES (40,'Reactivar con foto','Prueba',CURRENT_DATE,100,'Calle 4',1,30,2,true,false),
          (50,'Pausada con foto','Prueba',CURRENT_DATE,100,'Calle 7',1,30,2,false,false),
          (60,'Reactivar sin foto','Prueba',CURRENT_DATE,100,'Calle 5',1,30,2,false,false),
          (70,'Baja de eliminada','Prueba',CURRENT_DATE,100,'Calle 6',1,30,2,false,true);
      INSERT INTO imagen (id_imagen,id_publicacion,url) VALUES
        (80,40,'https://example.invalid/foto2.jpg'),
        (90,50,'https://example.invalid/foto3.jpg');
    `);
    const ids = publicaciones => publicaciones.map(p => p.id).sort((a, b) => a - b);
    const administracion = async consulta => {
      const respuesta = await request(`/administracion${consulta}`, 9);
      assert.equal(respuesta.status, 200);
      return (await respuesta.json()).datos;
    };

    for (const id of [40, 50, 60, 70]) {
      const respuesta = await request(`/administracion/${id}/baja`, 9, 'PATCH', { motivo: 'Moderación' });
      assert.equal(respuesta.status, 200);
      assert.equal((await respuesta.json()).correoEnviado, true);
    }
    assert.equal(correos.length, 4);
    assert.ok(!(await feed()).includes(40));
    assert.ok(!(await feed()).includes(50));

    assert.deepEqual(ids(await administracion('?estado=bajas&limite=100')), [40, 50, 60, 70]);
    const inactivas = await administracion('?estado=inactivas&limite=100');
    assert.ok(inactivas.every(p => p.activa === false && p.motivo_baja_admin === null));
    assert.deepEqual(ids(inactivas), [10, 20, 30]);
    assert.deepEqual(ids(await administracion('?estado=activas&limite=100')), []);
    const todas = await administracion('?estado=todas&limite=100');
    for (const id of [10, 20, 30, 40, 50, 60, 70]) assert.ok(ids(todas).includes(id));
    assert.deepEqual(ids(await administracion('?limite=100')), ids(todas));
    assert.equal((await request('/administracion?estado=eliminadas', 9)).status, 400);

    assert.equal((await request('/administracion/40/reactivar', undefined, 'PATCH')).status, 401);
    for (const id of [1, 2]) assert.equal((await request('/administracion/40/reactivar', id, 'PATCH')).status, 403);
    assert.equal((await request('/40', 2, 'PATCH', { activa: true })).status, 403);

    const reactivada = await request('/administracion/40/reactivar', 9, 'PATCH');
    assert.equal(reactivada.status, 200);
    const cuerpo = await reactivada.json();
    assert.equal(cuerpo.motivo_baja_admin, null);
    assert.equal(cuerpo.activa, false);
    assert.deepEqual(await estadoDe(40), { activa: false, eliminada: false, motivo_baja_admin: null });
    assert.ok(!(await feed()).includes(40));
    assert.ok(ids(await administracion('?estado=inactivas&limite=100')).includes(40));
    assert.ok(!ids(await administracion('?estado=activas&limite=100')).includes(40));
    assert.ok(!ids(await administracion('?estado=bajas&limite=100')).includes(40));

    const reactivadaPausada = await request('/administracion/50/reactivar', 9, 'PATCH');
    assert.equal(reactivadaPausada.status, 200);
    assert.equal((await reactivadaPausada.json()).activa, false);
    assert.deepEqual(await estadoDe(50), { activa: false, eliminada: false, motivo_baja_admin: null });
    assert.ok(!(await feed()).includes(50));
    assert.ok(ids(await administracion('?estado=inactivas&limite=100')).includes(50));

    const sinImagenes = await request('/administracion/60/reactivar', 9, 'PATCH');
    assert.equal(sinImagenes.status, 200);
    assert.equal((await sinImagenes.json()).activa, false);
    assert.deepEqual(await estadoDe(60), { activa: false, eliminada: false, motivo_baja_admin: null });
    assert.ok(!(await feed()).includes(60));
    assert.ok(!ids(await administracion('?estado=bajas&limite=100')).includes(60));
    assert.equal((await request('/60', 2, 'PATCH', { activa: true })).status, 400);

    const eliminada = await request('/administracion/70/reactivar', 9, 'PATCH');
    assert.equal(eliminada.status, 409);
    assert.equal((await eliminada.json()).message, 'La publicación fue eliminada por su anunciante y no se puede reactivar');
    assert.equal((await estadoDe(70)).motivo_baja_admin, 'Moderación');

    const repetida = await request('/administracion/40/reactivar', 9, 'PATCH');
    assert.equal(repetida.status, 409);
    assert.equal((await repetida.json()).message, 'La publicación no está dada de baja');

    assert.equal((await request('/administracion/999/reactivar', 9, 'PATCH')).status, 404);
    assert.equal((await request('/administracion/invalido/reactivar', 9, 'PATCH')).status, 400);

    const activadaPorDueno = await request('/40', 2, 'PATCH', { activa: true });
    assert.equal(activadaPorDueno.status, 200);
    assert.deepEqual(await estadoDe(40), { activa: true, eliminada: false, motivo_baja_admin: null });
    assert.ok((await feed()).includes(40));
    assert.ok(ids(await administracion('?estado=activas&limite=100')).includes(40));
    assert.ok(!ids(await administracion('?estado=inactivas&limite=100')).includes(40));

    assert.equal((await request('/administracion/60/baja', 9, 'PATCH', { motivo: 'Segunda moderación' })).status, 200);
    const simultaneas = await Promise.all([
      request('/administracion/60/reactivar', 9, 'PATCH'),
      request('/administracion/60/reactivar', 9, 'PATCH'),
    ]);
    assert.deepEqual(simultaneas.map(r => r.status).sort(), [200, 409]);
    assert.deepEqual(await estadoDe(60), { activa: false, eliminada: false, motivo_baja_admin: null });
    assert.equal(correos.length, 5);
  });

  await t.test('mis publicaciones: pagina y busca las vigentes y sirve la papelera simple', async () => {
    const mias = async (consulta, id = 2) => {
      const respuesta = await request(`/mias/paginadas${consulta}`, id);
      assert.equal(respuesta.status, 200);
      return respuesta.json();
    };
    const papeleraDe = async (id = 2) => {
      const respuesta = await request('/mias/papelera', id);
      assert.equal(respuesta.status, 200);
      return respuesta.json();
    };
    const ids = (pagina) => pagina.datos.map((publicacion) => publicacion.id);
    const idsPapelera = (lista) => lista.map((publicacion) => publicacion.id);

    const defecto = await mias('');
    assert.equal(defecto.pagina, 1);
    assert.equal(defecto.limite, 6);
    assert.equal(defecto.total, 5);
    assert.equal(defecto.totalPaginas, 1);
    assert.equal(defecto.activas, 1);
    assert.deepEqual(ids(defecto), [60, 50, 40, 30, 10]);

    const primera = await mias('?limite=2&pagina=1');
    assert.deepEqual(ids(primera), [60, 50]);
    assert.equal(primera.total, 5);
    assert.equal(primera.totalPaginas, 3);
    assert.equal(primera.activas, 1);
    assert.deepEqual(ids(await mias('?limite=2&pagina=2')), [40, 30]);
    assert.deepEqual(ids(await mias('?limite=2&pagina=3')), [10]);
    const fuera = await mias('?limite=2&pagina=99');
    assert.equal(fuera.pagina, 3);
    assert.deepEqual(ids(fuera), [10]);

    const busqueda = await mias('?q=foto&limite=10');
    assert.deepEqual(ids(busqueda), [60, 50, 40, 30]);
    assert.equal(busqueda.total, 4);
    assert.equal(busqueda.activas, 1);
    assert.deepEqual(ids(await mias('?q=Calle%207&limite=10')), [50]);

    assert.deepEqual(idsPapelera(await papeleraDe(2)), [70]);
    assert.deepEqual(idsPapelera(await papeleraDe(3)), [20]);
    const otro = await mias('?limite=10', 3);
    assert.deepEqual(ids(otro), []);
    assert.equal(otro.total, 0);
    assert.equal(otro.activas, 0);

    assert.equal((await request('/mias/paginadas', undefined)).status, 401);
    assert.equal((await request('/mias/paginadas', 1)).status, 403);
    assert.equal((await request('/mias/paginadas?estado=vigentes', 2)).status, 400);
    assert.equal((await request('/mias/paginadas?pagina=0', 2)).status, 400);
    assert.equal((await request('/mias/paginadas?limite=101', 2)).status, 400);
    assert.equal((await request(`/mias/paginadas?q=${'a'.repeat(201)}`, 2)).status, 400);
    assert.equal((await request('/mias/papelera', undefined)).status, 401);
    assert.equal((await request('/mias/papelera', 1)).status, 403);
  });
});

test('subir imágenes no reactiva una publicación pausada que ya tenía fotos', async () => {
  let activaciones = 0;
  const servicio = new PublicacionesService({ marcarActiva: async () => { activaciones++; } });
  const pausada = { id: 10, activa: false, eliminada: false, imagenes: [{ id: 50 }] };
  await servicio.activar(pausada);
  assert.equal(pausada.activa, false);
  assert.equal(activaciones, 0);
  const nueva = { id: 30, activa: false, eliminada: false, imagenes: [] };
  await servicio.activar(nueva);
  assert.equal(nueva.activa, true);
  assert.equal(activaciones, 1);
});
