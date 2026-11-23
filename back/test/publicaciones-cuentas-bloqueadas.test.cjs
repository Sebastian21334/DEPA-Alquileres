const { catalogosDePrueba } = require('./soporte/catalogos-pruebas.cjs');
require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { PublicacionesService } = require('../dist/publicaciones/service/publicaciones.service');
const { AnunciantesService } = require('../dist/anunciantes/service/anunciantes.service');
const { FavoritosService } = require('../dist/favoritos/service/favoritos.service');
const publicacionVisible = (publicacion) => new PublicacionesService().esVisible(publicacion);
const { DataSource } = require('typeorm');
const { Publicacion } = require('../dist/publicaciones/entity/publicacion.entity');
const { Reserva } = require('../dist/reservas/entity/reserva.entity');
const { PublicacionesRepository } = require('../dist/publicaciones/repository/publicaciones.repository');
const { PublicacionesController } = require('../dist/publicaciones/controller/publicaciones.controller');
const { ListarPublicacionesMapaDto } = require('../dist/publicaciones/dto/listar-publicaciones-mapa.dto');
const { ValidationPipe } = require('@nestjs/common');
const { crearPostgresPruebas } = require('./soporte/postgres-pruebas.cjs');

function escenario() {
  const usuario = { activa: true, bloqueado: false };
  const publicacion = { id: 10, activa: true, imagenes: [{ id: 1 }], anunciante: { usuario } };
  let vistas = 0;
  const servicio = new PublicacionesService({
    buscarPorId: async () => publicacion,
    buscarPorAnunciante: async () => [publicacion],
    incrementarVisualizaciones: async () => { vistas++; },
  }, catalogosDePrueba(), {}, {}, new AnunciantesService({}));
  const favoritos = new FavoritosService({
    buscarPorUsuario: async () => [{ publicacion }],
    existe: async () => true,
  }, servicio);
  return { usuario, publicacion, servicio, favoritos, vistas: () => vistas };
}

test('un enlace deja de servir el anuncio al bloquear y vuelve a servirlo al habilitar', async () => {
  const e = escenario();
  assert.equal(await e.servicio.buscarPublicaPorId(10), e.publicacion);
  e.usuario.bloqueado = true;
  await assert.rejects(e.servicio.buscarPublicaPorId(10), (err) => err.getStatus() === 404);
  // Las reservas y la administración siguen usando la búsqueda interna.
  assert.equal(await e.servicio.buscarPorId(10), e.publicacion);
  e.usuario.bloqueado = false;
  assert.equal(await e.servicio.buscarPublicaPorId(10), e.publicacion);
});

for (const soloActivas of [true, false]) {
  test(`la lista por anunciante no expone la cuenta bloqueada con activa=${soloActivas}`, async () => {
    const e = escenario();
    e.usuario.bloqueado = true;
    assert.deepEqual(await e.servicio.listarPorAnunciante(2, soloActivas), []);
  });
}

test('oculta favoritos durante el bloqueo, rechaza agregarlos y los recupera al habilitar', async () => {
  const e = escenario();
  assert.equal((await e.favoritos.listar(1)).length, 1);
  e.usuario.bloqueado = true;
  assert.deepEqual(await e.favoritos.listar(1), []);
  await assert.rejects(e.favoritos.agregar(1, 10), (err) => err.getStatus() === 409);
  e.usuario.bloqueado = false;
  assert.equal((await e.favoritos.listar(1)).length, 1);
});

test('un enlace bloqueado no incrementa visitas', async () => {
  const e = escenario();
  e.usuario.bloqueado = true;
  await assert.rejects(e.servicio.registrarVisualizacion(10), (err) => err.getStatus() === 404);
  assert.equal(e.vistas(), 0);
});

test('desbloquear conserva la pausa, la falta de imágenes y la baja administrativa', () => {
  const e = escenario();
  e.publicacion.activa = false;
  assert.equal(publicacionVisible(e.publicacion), false);
  e.usuario.bloqueado = true;
  e.usuario.bloqueado = false;
  assert.equal(e.publicacion.activa, false);
  assert.equal(publicacionVisible(e.publicacion), false);
  e.publicacion.activa = true;
  e.publicacion.imagenes = [];
  assert.equal(publicacionVisible(e.publicacion), false);
  e.publicacion.imagenes = [{ id: 1 }];
  e.publicacion.motivo_baja_admin = 'Moderación';
  assert.equal(publicacionVisible(e.publicacion), false);
});

test('una cuenta dada de baja tampoco sirve el enlace ni aparece en favoritos', async () => {
  const e = escenario();
  e.usuario.activa = false;
  await assert.rejects(e.servicio.buscarPublicaPorId(10), (err) => err.getStatus() === 404);
  assert.deepEqual(await e.favoritos.listar(1), []);
});

test('el catálogo aplica la restricción en SQL antes de contar y paginar', async () => {
  const source = new DataSource({ type: 'postgres', entities: [__dirname + '/../dist/**/*.entity.js'] });
  await source.buildMetadatas();
  const repo = source.getRepository(Publicacion);
  const consultas = [];
  const repository = new PublicacionesRepository({
    createQueryBuilder(alias) {
      const query = repo.createQueryBuilder(alias);
      const clone = query.clone.bind(query);
      query.clone = () => {
        const copia = clone();
        copia.getCount = async () => { consultas.push(copia.getSql()); return 0; };
        copia.getRawMany = async () => { consultas.push(copia.getSql()); return []; };
        return copia;
      };
      return query;
    },
  }, source.getRepository(Reserva));
  const pagina = await repository.buscarPaginadas({ pagina: 1, limite: 12 });
  assert.equal(pagina.total, 0);
  assert.deepEqual(pagina.datos, []);
  assert.equal(consultas.length, 2);
  for (const sql of consultas) {
    assert.match(sql, /"publicacion"\."eliminada" = false/);
    assert.match(sql, /"usuario"\."activa" = true AND "usuario"\."bloqueado" = false/);
  }
});

test('el mapa incluye puntos fuera de la primera página y respeta el área y la visibilidad del catálogo', async (t) => {
  const base = await crearPostgresPruebas();
  t.after(() => base.cerrar());
  const { db, source } = base;
  await db.exec(`
    INSERT INTO rol (id_rol, nombre) VALUES (1, 'Anunciante');
    INSERT INTO usuario (id_usuario, nombre, apellido, email, telefono, contrasenia, id_rol, bloqueado)
      VALUES (1,'Uno','Prueba','uno@example.invalid','123','hash',1,false),
        (2,'Dos','Prueba','dos@example.invalid','123','hash',1,true),
        (3,'Tres','Prueba','tres@example.invalid','123','hash',1,false);
    INSERT INTO anunciante (id_usuario, numero_contacto, verificado, actividades_pausadas)
      VALUES (1,'123',true,false), (2,'123',true,false), (3,'123',true,true);
    INSERT INTO modalidad (id_modalidad, nombre, permite_reservas_por_fecha)
      VALUES (1,'Temporal',true), (2,'Largo plazo',false);
    INSERT INTO publicacion (id_publicacion, titulo, descripcion, fecha_publicacion, precio, direccion,
      cantidad_ambientes, superficie, id_anunciante, id_modalidad, activa, eliminada, latitud, longitud)
      SELECT n, 'Casa ' || n, 'Prueba', CURRENT_DATE, 100 + n, 'Calle 1', 1, 30,
        CASE n WHEN 17 THEN 2 WHEN 18 THEN 3 ELSE 1 END,
        CASE WHEN n % 2 = 0 THEN 2 ELSE 1 END, n <> 19, n = 20,
        CASE n WHEN 15 THEN -31 WHEN 16 THEN NULL ELSE -32.41 END, -63.24
      FROM generate_series(1, 21) AS n;
    INSERT INTO imagen (id_imagen,id_publicacion,url)
      SELECT n, n, 'https://example.invalid/foto.jpg' FROM generate_series(1, 20) AS n;
    INSERT INTO imagen (id_imagen,id_publicacion,url) VALUES (22,1,'https://example.invalid/otra.jpg');
    UPDATE imagen SET orden = 2 WHERE id_imagen = 1;
  `);
  const repo = new PublicacionesRepository(source.getRepository(Publicacion), source.getRepository(Reserva));
  const servicio = new PublicacionesService(repo, catalogosDePrueba());
  const controlador = new PublicacionesController(servicio);
  const pipe = new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true });
  const consulta = (query) => pipe.transform(query, { type: 'query', metatype: ListarPublicacionesMapaDto });
  const mapa = async (query) => controlador.listarMapa(await consulta(query));

  const general = await mapa({});
  assert.deepEqual(general.puntos.map(punto => punto.id), Array.from({ length: 15 }, (_, i) => 15 - i));
  assert.equal(general.recortado, false);
  assert.equal(general.siguienteId, null);
  assert.equal(general.puntos[0].latitud, -31);
  assert.equal((await servicio.listarActivas()).datos.length, 12);
  const zona = await mapa({ sur: '-33', norte: '-32', oeste: '-64', este: '-63', categoria: 'temporales' });
  assert.deepEqual(zona.puntos.map(punto => punto.id), [13, 11, 9, 7, 5, 3, 1]);
  assert(zona.puntos.every(punto => punto.temporal && typeof punto.precio === 'number'));
  assert.deepEqual(Object.keys(zona.puntos[0]).sort(), ['ciudad', 'id', 'latitud', 'longitud', 'moneda', 'portada', 'precio', 'temporal', 'titulo']);
  assert.equal(zona.puntos.at(-1).portada, 'https://example.invalid/otra.jpg');
  for (const query of [{ sur: '' }, { sur: '-92' }, { este: '-64' }, { limite: '600' },
    { sur: '-32', norte: '-33', oeste: '-64', este: '-63' }, { precioMin: '200', precioMax: '100' },
    { antesDe: '' }, { antesDe: '0' }, { antesDe: '1.5' }, { antesDe: '2147483648' }]) {
    await assert.rejects(mapa(query), { status: 400 });
  }

  await db.exec(`
    INSERT INTO publicacion (id_publicacion, titulo, descripcion, fecha_publicacion, precio, direccion,
      cantidad_ambientes, superficie, id_anunciante, id_modalidad, activa, eliminada, latitud, longitud)
      SELECT n, 'Paginado ' || n, 'Prueba', CURRENT_DATE, 100, 'Calle 1',
        1, 30, 1, 1, true, false, -32.41, -63.24
      FROM generate_series(1000, 1500) AS n;
    INSERT INTO imagen (id_imagen,id_publicacion,url)
      SELECT n, n, 'https://example.invalid/foto.jpg' FROM generate_series(1000, 1500) AS n;
  `);
  const primera = await mapa({ q: 'Paginado' });
  assert.equal(primera.puntos.length, 500);
  assert.equal(primera.siguienteId, primera.puntos.at(-1).id);
  const segunda = await mapa({ q: 'Paginado', antesDe: String(primera.siguienteId) });
  assert.equal(segunda.siguienteId, null);
  assert.deepEqual([...primera.puntos, ...segunda.puntos].map(punto => punto.id),
    Array.from({ length: 501 }, (_, i) => 1500 - i));
});
