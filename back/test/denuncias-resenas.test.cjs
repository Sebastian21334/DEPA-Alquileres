require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ResenasRepository } = require('../dist/resenas/repository/resenas.repository');
const { Resena } = require('../dist/resenas/entity/resena.entity');
const { ResenasAdministracionService } = require('../dist/resenas/service/resenas-administracion.service');
const { ResenasResumenService } = require('../dist/resenas/service/resenas-resumen.service');
const { Anunciante } = require('../dist/anunciantes/entity/anunciante.entity');
const { AnunciantesRepository } = require('../dist/anunciantes/repository/anunciantes.repository');
const { AnunciantesService } = require('../dist/anunciantes/service/anunciantes.service');
const { Reflector } = require('@nestjs/core');
const { plainToInstance } = require('class-transformer');
const { validate } = require('class-validator');
const { ResenasAdministracionController } = require('../dist/resenas/controller/resenas-administracion.controller');
const { JwtAuthGuard } = require('../dist/seguridad/guards/jwt-auth.guard');
const { RolesGuard } = require('../dist/seguridad/guards/roles.guard');
const { ResolverDenunciaDto } = require('../dist/resenas/dto/resolver-denuncia.dto');
const { servicioMock, resenaMock } = require('./soporte/resenas-pruebas.cjs');
const { crearPostgresPruebas } = require('./soporte/postgres-pruebas.cjs');

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
  let actual = resenaMock({ denunciada: true });
  const { admin, estado } = servicioMock({ repo: {
    buscarPorId: async () => actual,
    registrarResolucionDenuncia: async () => {
      actual = { ...actual, denunciada: false };
    },
    registrarModeracion: async (_id, datos) => {
      actual = { ...actual, visible: datos.visible, motivo_moderacion: datos.motivo };
    },
  } });
  const resultado = await admin.resolverDenuncia(10, 1, { aceptada: true, motivo: 'Contenido ofensivo' });
  assert.equal(resultado.visible, false);
  assert.ok(estado.resumenPublicacion);
  await assert.rejects(admin.resolverDenuncia(10, 1, { aceptada: true, motivo: 'Contenido ofensivo' }));
});

test('la migración conserva denuncias previas y la resolución confirma o revierte todos los cambios', async () => {
  const { db, source, cerrar } = await crearPostgresPruebas();
  try {
    await db.exec(`
      INSERT INTO usuario (id_usuario, nombre, apellido, email, telefono, contrasenia)
      VALUES (1, 'Ana', 'García', 'ana@test.invalid', '1', 'x'),
             (2, 'Usuario', 'Prueba', 'prueba@test.invalid', '2', 'x'),
             (3, 'Anunciante', 'Prueba', 'anunciante@test.invalid', '3', 'x');
      INSERT INTO anunciante (id_usuario, verificado, numero_contacto, cantidad_resenas, promedio_resenas)
      VALUES (3, true, '3', 1, 4);
      INSERT INTO resena (id_resena, id_usuario, id_anunciante, puntaje, comentario, fecha, denunciada, motivo_denuncia, fecha_denuncia, denunciada_por)
      VALUES (10, 2, 3, 4, 'Reseña original', now(), true, 'Contenido ofensivo', now(), 2);
    `);
    const sql = fs.readFileSync(path.join(__dirname, '../migrations/20261127-historial-denuncias-resenas.sql'), 'utf8');
    await db.exec(sql);
    await db.exec(sql);
    const repo = new ResenasRepository(source.getRepository(Resena));
    const anuncianteRepo = new AnunciantesRepository(source.getRepository(Anunciante));
    const anunciantes = new AnunciantesService(anuncianteRepo);
    const resumen = new ResenasResumenService(repo, {}, anunciantes);
    const correos = [];
    const admin = new ResenasAdministracionService(repo, resumen, {
      enviarResenaOcultada: async (...datos) => correos.push(datos),
    });
    const actualizarResumen = anunciantes.actualizarResumenResenas.bind(anunciantes);
    anunciantes.actualizarResumenResenas = async (...args) => {
      await actualizarResumen(...args);
      throw new Error('Fallo al guardar el resumen');
    };
    const aceptacion = { aceptada: true, motivo: 'Contenido inapropiado' };
    await assert.rejects(admin.resolverDenuncia(10, 1, aceptacion), /Fallo al guardar el resumen/);
    const antes = await repo.buscarPorId(10);
    assert.equal(antes.denunciada, true);
    assert.equal(antes.visible, true);
    assert.equal((await anuncianteRepo.buscarPorId(3)).cantidad_resenas, 1);
    assert.equal((await admin.historialDenuncias()).length, 0);
    assert.equal(correos.length, 0);

    anunciantes.actualizarResumenResenas = actualizarResumen;
    await admin.moderar(10, 1, { visible: false, motivo: aceptacion.motivo });
    await assert.rejects(admin.resolverDenuncia(10, 1, aceptacion), { status: 409 });
    const resena = (await db.query('SELECT * FROM resena WHERE id_resena = 10')).rows[0];
    assert.equal(resena.denunciada, false);
    assert.equal(resena.visible, false);
    assert.equal((await anuncianteRepo.buscarPorId(3)).cantidad_resenas, 0);
    assert.equal(correos.length, 1);
    const historial = await admin.historialDenuncias();
    assert.equal(historial.length, 1);
    assert.equal(historial[0].motivo_denuncia, 'Contenido ofensivo');
    assert.equal(historial[0].aceptada, true);
    assert.equal(historial[0].administrador_nombre, 'Ana');
    assert.equal(historial[0].administrador_apellido, 'García');
    await db.query("UPDATE resena SET denunciada = true, visible = true, motivo_denuncia = 'Otra denuncia' WHERE id_resena = 10");
    await admin.resolverDenuncia(10, 1, { aceptada: false, motivo: 'No corresponde' });
    assert.equal((await db.query('SELECT visible FROM resena WHERE id_resena = 10')).rows[0].visible, true);
    assert.equal((await repo.historialDenuncias()).length, 2);
    await db.query('DELETE FROM usuario WHERE id_usuario = 1');
    const historialSinAdministrador = await repo.historialDenuncias();
    assert.equal(historialSinAdministrador[0].administrador_nombre, null);
    assert.equal(historialSinAdministrador[0].administrador_apellido, null);
  } finally { await cerrar(); }
});
