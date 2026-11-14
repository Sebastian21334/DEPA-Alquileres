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
