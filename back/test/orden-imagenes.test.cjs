require('reflect-metadata');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { ValidationPipe, ForbiddenException } = require('@nestjs/common');
const { OrdenarImagenesDto } = require('../dist/imagenes/dto/ordenar-imagenes.dto');
const { ImagenesRepository } = require('../dist/imagenes/repository/imagenes.repository');
const { ImagenesService } = require('../dist/imagenes/service/imagenes.service');
const { Imagen } = require('../dist/imagenes/entity/imagen.entity');
const { PublicacionesService } = require('../dist/publicaciones/service/publicaciones.service');
const { PublicacionesRepository } = require('../dist/publicaciones/repository/publicaciones.repository');
const sharp = require('sharp');

test('el endpoint acepta solo un orden de IDs enteros positivos sin repetidos', async () => {
  const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });
  const validar = (value) => pipe.transform(value, { type: 'body', metatype: OrdenarImagenesDto });
  await validar({ ids: [3, 1, 2] });
  await validar({ ids: [] });
  for (const ids of [[1, 1], [0], [-2], [1.5], ['1'], null, '1,2']) {
    await assert.rejects(validar({ ids }));
  }
  await assert.rejects(validar({ ids: [1], otro: true }));
});

function escenario() {
  let fotos = [
    { id: 10, orden: 0, url: 'a.jpg' },
    { id: 20, orden: 1, url: 'b.jpg' },
    { id: 30, orden: 2, url: 'c.jpg' },
  ];
  const estado = { bloqueos: 0, actualizaciones: 0, fallarEn: null };
  const repoImagen = {
    find: async () => fotos.map(f => ({ ...f })),
    findOne: async () => [...fotos].sort((a, b) => b.orden - a.orden)[0] ?? null,
    update: async ({ id, publicacion }, { orden }) => {
      assert.equal(publicacion.id, 7);
      if (id === estado.fallarEn) throw new Error('Fallo de escritura');
      fotos.find(f => f.id === id).orden = orden;
      estado.actualizaciones++;
    },
    save: async (foto) => { fotos.push(foto); return foto; },
  };
  const manager = {
    queryRunner: { isTransactionActive: true },
    getRepository: (entidad) => entidad === Imagen ? repoImagen : {
      createQueryBuilder: () => ({
        where(sql, { id }) { assert.equal(id, 7); return this; },
        setLock(modo) { assert.equal(modo, 'pessimistic_write'); estado.bloqueos++; return this; },
        getOne: async () => ({ id: 7 }),
      }),
    },
  };
  const repository = new ImagenesRepository({ create: (datos) => datos, manager: {
    transaction: async (accion) => {
      const copia = fotos.map(f => ({ ...f }));
      try { return await accion(manager); }
      catch (error) { fotos = copia; throw error; }
    },
  } });
  const publicaciones = new PublicacionesService(new PublicacionesRepository({
    findOne: async () => ({ id: 7, activa: true, anunciante: { idUsuario: 88 } }),
  }));
  const servicio = new ImagenesService(repository, publicaciones, { subir: async () => 'd.jpg' });
  return { servicio, estado, fotos: () => fotos };
}

test('elegir portada persiste todo el orden y las nuevas subidas quedan al final', async () => {
  const { servicio, estado } = escenario();
  const resultado = await servicio.ordenar(7, [30, 10, 20], { idUsuario: 88 });
  assert.deepEqual(resultado.map(f => [f.id, f.orden]), [[30, 0], [10, 1], [20, 2]]);
  const buffer = await sharp({ create: { width: 1, height: 1, channels: 3, background: 'white' } }).png().toBuffer();
  const subida = await servicio.subir(7, { idUsuario: 88 }, { buffer });
  assert.equal(subida.orden, 3);
  assert.equal(estado.bloqueos, 2);
});

test('rechaza fotos ajenas, repetidas o galerías desactualizadas sin escrituras parciales', async () => {
  for (const ids of [[30, 10], [30, 10, 99], [30, 10, 20, 40], [30, 10, 10], []]) {
    const { servicio, estado } = escenario();
    await assert.rejects(servicio.ordenar(7, ids, { idUsuario: 88 }), { status: 409 });
    assert.equal(estado.actualizaciones, 0);
  }
});

test('un fallo al reordenar revierte la operación completa', async () => {
  const { servicio, estado, fotos } = escenario();
  estado.fallarEn = 10;
  await assert.rejects(servicio.ordenar(7, [30, 10, 20], { idUsuario: 88 }), /Fallo de escritura/);
  assert.deepEqual(fotos().map(f => f.orden), [0, 1, 2]);
});

test('el servicio exige propiedad antes de permitir ordenar', async () => {
  let escrituras = 0;
  const servicio = new ImagenesService({ conTransaccion: async () => { escrituras++; } }, {
    obtenerPropia: async () => { throw new ForbiddenException(); },
  }, {});
  await assert.rejects(servicio.ordenar(7, [30, 10, 20], { idUsuario: 88 }), { status: 403 });
  assert.equal(escrituras, 0);
});

test('el dueño puede ordenar y recibe la galería actualizada', async () => {
  const esperado = [{ id: 30, orden: 0 }, { id: 10, orden: 1 }];
  const servicio = new ImagenesService({
    conTransaccion: (accion) => accion({
      buscarPorPublicacion: async () => [{ id: 10, orden: 1 }, { id: 30, orden: 0 }],
      actualizarOrden: async (id, ids) => {
        assert.equal(id, 7);
        assert.deepEqual(ids, [30, 10]);
      },
    }, {}),
  }, { obtenerPropia: async (id, usuario) => {
    assert.equal(id, 7); assert.equal(usuario, 88);
  }, bloquearParaModificacion: async () => {} }, {});
  assert.deepEqual(await servicio.ordenar(7, [30, 10], { idUsuario: 88 }), esperado);
});

// Ejecuta el mismo movimiento usado por la creación, edición y Mis publicaciones.
const codigo = fs.readFileSync(path.join(__dirname, '../../front/src/app/shared/utils/orden-imagenes.ts'), 'utf8');
const contexto = { exports: {} };
vm.runInNewContext(ts.transpileModule(codigo, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, contexto);
const { moverImagen } = contexto.exports;
test('selección de portada y movimientos conservan todas las fotos sin mutar la lista original', () => {
  const original = Object.freeze(['a', 'b', 'c']);
  assert.deepEqual([...moverImagen(original, 2, 0)], ['c', 'a', 'b']);
  assert.deepEqual([...moverImagen(original, 0, 1)], ['b', 'a', 'c']);
  assert.deepEqual([...moverImagen(original, 1, 0)], ['b', 'a', 'c']);
  for (const [desde, hasta] of [[0, -1], [2, 3], [-1, 0], [1.5, 0]]) {
    assert.deepEqual([...moverImagen(original, desde, hasta)], ['a', 'b', 'c']);
  }
  assert.deepEqual(original, ['a', 'b', 'c']);
});
