require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PGlite } = require('@electric-sql/pglite');
const { ResenasRepository } = require('../dist/resenas/repository/resenas.repository');
const { Reflector } = require('@nestjs/core');
const { plainToInstance } = require('class-transformer');
const { validate } = require('class-validator');
const { ResenasAdministracionController } = require('../dist/resenas/controller/resenas-administracion.controller');
const { JwtAuthGuard } = require('../dist/seguridad/guards/jwt-auth.guard');
const { RolesGuard } = require('../dist/seguridad/guards/roles.guard');
const { ResolverDenunciaDto } = require('../dist/resenas/dto/resolver-denuncia.dto');
const { servicioMock, resenaMock } = require('./soporte/resenas-pruebas.cjs');

test('resolver exige guard de autenticación, rol administrador y motivo válido', async () => {
  const handler = ResenasAdministracionController.prototype.resolverDenuncia;
  const guards = Reflect.getMetadata('__guards__', handler);
  assert.ok(guards.includes(JwtAuthGuard));
  assert.ok(guards.includes(RolesGuard));
  const guard = new RolesGuard(new Reflector());
  const contexto = (rol) => ({ getHandler: () => handler, getClass: () => ResenasAdministracionController, switchToHttp: () => ({ getRequest: () => ({ user: { rol } }) }) });
  assert.equal(guard.canActivate(contexto('Inquilino')), false);
  assert.equal(guard.canActivate(contexto('Administrador')), true);
  assert.ok((await validate(plainToInstance(ResolverDenunciaDto, { aceptada: true, motivo: 'no' }))).length);
  assert.equal((await validate(plainToInstance(ResolverDenunciaDto, { aceptada: true, motivo: 'Contenido ofensivo' }))).length, 0);
});

test('la resolución actualiza el resumen únicamente si se acepta y rechaza una resolución repetida', async () => {
  let pendiente = true;
  let actual = resenaMock({ denunciada: true });
  const { admin, estado } = servicioMock({ repo: {
    buscarPorId: async () => actual,
    resolverDenuncia: async (_id, _admin, aceptada, motivo) => {
      if (!pendiente) return false;
      pendiente = false;
      actual = resenaMock({ denunciada: false, visible: !aceptada, motivo_moderacion: motivo });
      return true;
    },
  } });
  const resultado = await admin.resolverDenuncia(10, 1, { aceptada: true, motivo: 'Contenido ofensivo' });
  assert.equal(resultado.visible, false);
  assert.ok(estado.resumenPublicacion);
  await assert.rejects(admin.resolverDenuncia(10, 1, { aceptada: true, motivo: 'Contenido ofensivo' }));
});

test('la migración conserva denuncias previas, es idempotente y resolver guarda historial', async () => {
  const db = new PGlite();
  try {
    await db.exec(`CREATE TABLE usuario (id_usuario integer PRIMARY KEY, nombre varchar(100), apellido varchar(100));
      CREATE TABLE resena (id_resena integer PRIMARY KEY, denunciada boolean, motivo_denuncia varchar(300), fecha_denuncia timestamptz, denunciada_por integer, visible boolean, motivo_moderacion varchar(300), fecha_moderacion timestamptz, moderada_por integer);
      INSERT INTO usuario VALUES (1, 'Sebastián', 'González'), (2, 'Usuario', 'Prueba');
      INSERT INTO resena VALUES (10, true, 'Contenido ofensivo', now(), 2, true, null, null, null);`);
    const sql = fs.readFileSync(path.join(__dirname, '../migrations/20261127-historial-denuncias-resenas.sql'), 'utf8');
    await db.exec(sql);
    await db.exec(sql);
    const adapter = { query: async (query, params) => (await db.query(query, params)).rows };
    const repo = new ResenasRepository({ manager: { ...adapter, transaction: (fn) => db.transaction((tx) => fn({ query: async (q, p) => (await tx.query(q, p)).rows })) } });
    await assert.rejects(repo.resolverDenuncia(10, 999, true, 'Contenido inapropiado'));
    assert.equal((await db.query('SELECT denunciada FROM resena WHERE id_resena = 10')).rows[0].denunciada, true);
    const concurrentes = await Promise.all([
      repo.resolverDenuncia(10, 1, true, 'Contenido inapropiado'),
      repo.resolverDenuncia(10, 1, true, 'Intento repetido'),
    ]);
    assert.deepEqual([...concurrentes].sort(), [false, true]);
    const resena = (await db.query('SELECT * FROM resena WHERE id_resena = 10')).rows[0];
    assert.equal(resena.denunciada, false);
    assert.equal(resena.visible, false);
    const historial = await repo.historialDenuncias();
    assert.equal(historial.length, 1);
    assert.equal(historial[0].motivo_denuncia, 'Contenido ofensivo');
    assert.equal(historial[0].aceptada, true);
    assert.equal(historial[0].administrador_nombre, 'Sebastián');
    assert.equal(historial[0].administrador_apellido, 'González');
    await db.query("UPDATE resena SET denunciada = true, visible = true, motivo_denuncia = 'Otra denuncia' WHERE id_resena = 10");
    assert.equal(await repo.resolverDenuncia(10, 1, false, 'No corresponde'), true);
    assert.equal((await db.query('SELECT visible FROM resena WHERE id_resena = 10')).rows[0].visible, true);
    assert.equal((await repo.historialDenuncias()).length, 2);
    await db.query('DELETE FROM usuario WHERE id_usuario = 1');
    const historialSinAdministrador = await repo.historialDenuncias();
    assert.equal(historialSinAdministrador[0].administrador_nombre, null);
    assert.equal(historialSinAdministrador[0].administrador_apellido, null);
  } finally { await db.close(); }
});
