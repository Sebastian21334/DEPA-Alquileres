const { catalogosDePrueba } = require('./soporte/catalogos-pruebas.cjs');
require('reflect-metadata');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const bcrypt = require('bcrypt');
const { JwtService } = require('@nestjs/jwt');
const { crearPostgresPruebas } = require('./soporte/postgres-pruebas.cjs');
const { BloqueoAnuncianteService } = require('../dist/bloqueo-anunciante/service/bloqueo-anunciante.service');
const { Usuario } = require('../dist/usuarios/entity/usuario.entity');
const { UsuariosRepository } = require('../dist/usuarios/repository/usuarios.repository');
const { UsuariosCredencialesService } = require('../dist/usuarios/service/usuarios-credenciales.service');
const { UsuariosService } = require('../dist/usuarios/service/usuarios.service');
const { AuthService } = require('../dist/auth/service/auth.service');
const { SeguridadService } = require('../dist/seguridad/service/seguridad.service');

test('F-04 conserva bloqueos anteriores y permite apelar únicamente el bloqueo propio y vigente', async (t) => {
  const base = await crearPostgresPruebas();
  t.after(() => base.cerrar());
  const { db, source } = base;
  const hash = await bcrypt.hash('clave-de-prueba', 4);
  await db.exec('ALTER TABLE public.usuario DROP COLUMN bloqueo_detalle');
  await db.exec("INSERT INTO rol (id_rol, nombre) VALUES (1, 'Inquilino'), (2, 'Administrador')");
  await db.query(`
    INSERT INTO usuario (id_usuario, nombre, apellido, email, telefono, contrasenia, id_rol, email_verificado, bloqueado)
    VALUES (1, 'Ana', 'Prueba', 'ana@example.invalid', '123', $1, 1, true, false),
           (2, 'Admin', 'Prueba', 'admin@example.invalid', '123', $1, 2, true, false),
           (3, 'Cuenta', 'Anterior', 'anterior@example.invalid', '123', $1, 1, true, true)`, [hash]);

  const migracion = readFileSync(join(__dirname, '../migrations/20261111-apelaciones-bloqueo.sql'), 'utf8');
  await db.exec(migracion);
  const repo = new UsuariosRepository(source.getRepository(Usuario));
  const legado = (await repo.buscarConBloqueo(3)).bloqueoDetalle;
  await db.exec(migracion);
  assert.deepEqual((await repo.buscarConBloqueo(3)).bloqueoDetalle, legado);
  assert.equal(legado.motivo, null);

  const mail = { enviarCambioBloqueo: async () => {} };
  const credenciales = new UsuariosCredencialesService(repo, {});
  const usuarios = new UsuariosService(repo, catalogosDePrueba(), credenciales, mail, {},
    { bloquearPublicacionesParaCambioDeCuenta: async () => {} }, {});
  const bloqueo = new BloqueoAnuncianteService(usuarios, {}, mail);
  const jwt = new JwtService({ secret: 'clave-jwt-solo-para-pruebas' });
  const auth = new AuthService(usuarios, credenciales, jwt, mail);
  const seguridad = new SeguridadService(repo);
  const login = { email: 'ana@example.invalid', contrasenia: 'clave-de-prueba' };
  const sesion = (await auth.login(login)).access_token;
  await bloqueo.cambiarBloqueo(1, true, 2, 'Motivo para Ana');
  await assert.rejects(auth.login({ ...login, contrasenia: 'incorrecta' }), { status: 401 });
  await assert.rejects(auth.consultarBloqueo(sesion), { status: 401 });
  await assert.rejects(seguridad.validarSesion(1), { status: 401 });

  let token;
  await assert.rejects(auth.login(login), (error) => {
    const respuesta = error.getResponse();
    assert.equal(error.getStatus(), 403);
    assert.equal(respuesta.codigo, 'USUARIO_BLOQUEADO');
    assert.equal(respuesta.access_token, undefined);
    token = respuesta.tokenBloqueo;
    return Boolean(token);
  });
  await assert.rejects(seguridad.validarSesion(jwt.decode(token).sub), { status: 401 });
  const fila = (await usuarios.listarBloqueados()).find(({ usuario }) => usuario.id === 1);
  assert.equal(fila.administrador.nombre, 'Admin');
  assert.equal((await repo.buscarPorId(1)).bloqueoDetalle, undefined);
  assert.equal((await auth.consultarBloqueo(token)).motivo, 'Motivo para Ana');
  await assert.rejects(usuarios.responderApelacion(3, fila.detalle.id, 2, 'Cuenta ajena'), { status: 403 });
  await assert.rejects(usuarios.responderApelacion(1, fila.detalle.id, 2, 'Prematura'), { status: 409 });
  await auth.apelarBloqueo(token, 'Solicito una revisión');
  await assert.rejects(auth.apelarBloqueo(token, 'Duplicada'), { status: 409 });
  await usuarios.responderApelacion(1, fila.detalle.id, 2, 'Apelación revisada');
  assert.equal((await auth.consultarBloqueo(token)).respuesta.texto, 'Apelación revisada');
  await assert.rejects(auth.login(login), { status: 403 });
  await bloqueo.cambiarBloqueo(1, false, 2);
  assert.ok((await auth.login(login)).access_token);
  await bloqueo.cambiarBloqueo(1, true, 2, 'Otro bloqueo');
  await assert.rejects(auth.consultarBloqueo(token), { status: 403 });
});
