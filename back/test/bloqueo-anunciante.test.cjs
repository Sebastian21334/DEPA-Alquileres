const { preparacionImagenes } = require('./soporte/imagenes-pruebas.cjs');
const { BcryptAdapter } = require('../dist/usuarios/proveedor/bcrypt.adapter');
const { operacionesCuentaDePrueba } = require('./soporte/operaciones-cuenta-pruebas.cjs');
require('reflect-metadata');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const bcrypt = require('bcrypt');
const { Module } = require('@nestjs/common');
const { ConfigService } = require('@nestjs/config');
const { NestFactory } = require('@nestjs/core');
const { JwtService } = require('@nestjs/jwt');
const { PassportModule } = require('@nestjs/passport');
const { crearPostgresPruebas } = require('./soporte/postgres-pruebas.cjs');
const { catalogosDePrueba } = require('./soporte/catalogos-pruebas.cjs');
const { AuthController } = require('../dist/auth/controller/auth.controller');
const { AuthService } = require('../dist/auth/service/auth.service');
const { Anunciante } = require('../dist/anunciantes/entity/anunciante.entity');
const { AnunciantesRepository } = require('../dist/anunciantes/repository/anunciantes.repository');
const { AnunciantesService } = require('../dist/anunciantes/service/anunciantes.service');
const { BloqueoAnuncianteService } = require('../dist/bloqueo-anunciante/service/bloqueo-anunciante.service');
const { PagosController } = require('../dist/operaciones-reserva/controller/pagos.controller');
const { OperacionesPagoService } = require('../dist/operaciones-reserva/service/operaciones-pago.service');
const { PresupuestosService } = require('../dist/operaciones-reserva/service/presupuestos.service');
const { Publicacion } = require('../dist/publicaciones/entity/publicacion.entity');
const { PublicacionesRepository } = require('../dist/publicaciones/repository/publicaciones.repository');
const { PublicacionesService } = require('../dist/publicaciones/service/publicaciones.service');
const { ReclamosController } = require('../dist/reclamos/controller/reclamos.controller');
const { ReclamosService } = require('../dist/reclamos/service/reclamos.service');
const { SeguridadService } = require('../dist/seguridad/service/seguridad.service');
const { JwtStrategy } = require('../dist/seguridad/strategy/jwt.strategy');
const { Usuario } = require('../dist/usuarios/entity/usuario.entity');
const { UsuariosController } = require('../dist/usuarios/controller/usuarios.controller');
const { UsuariosRepository } = require('../dist/usuarios/repository/usuarios.repository');
const { UsuariosCredencialesService } = require('../dist/usuarios/service/usuarios-credenciales.service');
const { UsuariosService } = require('../dist/usuarios/service/usuarios.service');

test('el bloqueo usa el perfil y las operaciones propias sin otorgar privilegios administrativos', async (t) => {
  const base = await crearPostgresPruebas();
  t.after(() => base.cerrar());
  const { db, source } = base;
  const contrasenia = 'clave-de-prueba';
  const hash = await bcrypt.hash(contrasenia, 4);
  await db.exec("INSERT INTO rol (id_rol,nombre) VALUES (1,'Inquilino'),(3,'Administrador')");
  await db.query(`
    INSERT INTO usuario (id_usuario,nombre,apellido,email,telefono,contrasenia,email_verificado,id_rol)
    SELECT id,'Prueba','Integración','usuario' || id || '@example.invalid','123',$1,true,
           CASE WHEN id IN (2,3) THEN 3 ELSE 1 END
    FROM generate_series(1,5) AS id`, [hash]);
  await db.exec(`
    INSERT INTO anunciante (id_usuario,numero_contacto,verificado)
      VALUES (2,'123',true), (4,'123',true), (5,'123',false);
    INSERT INTO publicacion (id_publicacion,titulo,descripcion,fecha_publicacion,precio,direccion,cantidad_ambientes,superficie,id_anunciante)
      VALUES (10,'Publicación de prueba','Integración',CURRENT_DATE,100,'Dirección',1,30,2),
             (11,'Publicación de inquilino verificado','Integración',CURRENT_DATE,100,'Dirección',1,30,4),
             (12,'Publicación de perfil sin verificar','Integración',CURRENT_DATE,100,'Dirección',1,30,5);
    INSERT INTO reserva (id_reserva,id_usuario,id_publicacion,estado_pago,monto_pago)
      VALUES (20,1,10,'PENDIENTE',100), (21,4,10,'PENDIENTE',100),
             (22,3,11,'PENDIENTE',100), (23,3,12,'PENDIENTE',100);
    INSERT INTO reclamo_reserva (id_reserva,id_inquilino,id_anunciante,categoria,descripcion)
      VALUES (23,3,5,'OTRO','Reclamo de perfil sin verificar');`);
  const avisos = [];
  const mail = { enviarCambioBloqueo: async (...datos) => avisos.push(datos) };
  const repo = new UsuariosRepository(source.getRepository(Usuario));
  const catalogos = catalogosDePrueba();
  const publicaciones = new PublicacionesService(new PublicacionesRepository(source.getRepository(Publicacion)), catalogos);
  const credenciales = new UsuariosCredencialesService(repo, new BcryptAdapter({ get: () => undefined }));
  const anunciantes = new AnunciantesService(new AnunciantesRepository(source.getRepository(Anunciante)));
  const usuarios = new UsuariosService(repo, catalogos, credenciales, mail, {}, publicaciones, anunciantes, undefined, operacionesCuentaDePrueba(), preparacionImagenes);
  const bloqueo = new BloqueoAnuncianteService(usuarios, mail);
  const secreto = 'clave-local-de-bloqueo-para-pruebas';
  const jwt = new JwtService({ secret: secreto, signOptions: { expiresIn: 300 } });
  const auth = new AuthService(usuarios, credenciales, jwt, mail);
  const login = (id) => ({ email: `usuario${id}@example.invalid`, contrasenia });

  class AplicacionPrueba {}
  Module({
    imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
    controllers: [AuthController, PagosController, ReclamosController, UsuariosController],
    providers: [
      JwtStrategy, SeguridadService,
      { provide: AuthService, useValue: auth },
      { provide: UsuariosService, useValue: usuarios },
      { provide: ConfigService, useValue: { getOrThrow: () => secreto } },
      { provide: OperacionesPagoService, useValue: { consultarEstado: (id) => ({ id }), crearCheckout: () => ({ creado: true }) } },
      { provide: PresupuestosService, useValue: {} },
      { provide: ReclamosService, useValue: { obtener: (_id, _usuario, esAdmin) => ({ esAdmin }) } },
    ],
  })(AplicacionPrueba);
  const app = await NestFactory.create(AplicacionPrueba, { logger: false, abortOnError: false });
  t.after(() => app.close());
  await app.listen(0, '127.0.0.1');
  const url = await app.getUrl();
  const solicitar = (token, ruta, body) => fetch(`${url}/${ruta}`, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${token}`, ...(body && { 'Content-Type': 'application/json' }) },
    ...(body && { body: JSON.stringify(body) }),
  });
  const detalleAnterior = { id: 'bloqueo-de-prueba-anterior', administradorId: 3, motivo: 'Motivo original',
    fecha: new Date().toISOString(), apelacion: { texto: 'Ya apelé este bloqueo', fecha: new Date().toISOString() } };
  const sesiones = [];
  for (const id of [1, 2, 4]) {
    const sesionAnterior = (await auth.login(login(id))).access_token;
    if (id === 2) {
      assert.equal((await solicitar(sesionAnterior, 'usuarios/administracion/bloqueados')).status, 200);
      await db.query('UPDATE usuario SET bloqueado = true, bloqueo_detalle = $1 WHERE id_usuario = 2', [detalleAnterior]);
    } else {
      assert.equal((await bloqueo.cambiarBloqueo(id, true, 3, 'Motivo de prueba')).accesoLimitado, true);
    }
    const estado = await solicitar(sesionAnterior, 'auth/sesion');
    assert.deepEqual(await estado.json(), { accesoLimitado: true, anuncianteVerificado: id !== 1, rol: null });
    const nuevaSesion = (await auth.login(login(id))).access_token;
    const datosSesion = jwt.decode(nuevaSesion);
    assert.equal(datosSesion.accesoLimitado, true);
    assert.equal(datosSesion.anuncianteVerificado, id !== 1);
    assert.equal(datosSesion.rol, undefined);
    sesiones.push({ id, nuevaSesion });
    assert.equal((await solicitar(sesionAnterior, 'pagos/reservas/20/estado')).status, 200);
    const checkout = await solicitar(sesionAnterior, 'pagos/checkout', {});
    assert.equal(checkout.status, 403);
    assert.equal((await checkout.json()).codigo, 'ACCESO_LIMITADO');
    if (id === 2) {
      assert.equal((await solicitar(sesionAnterior, 'usuarios/administracion/bloqueados')).status, 403);
      const reclamo = await solicitar(sesionAnterior, 'reclamos/1');
      assert.deepEqual(await reclamo.json(), { esAdmin: false });
      assert.equal((await repo.buscarParaSesion(id)).rol.nombre, 'Administrador');
      assert.deepEqual((await repo.buscarConBloqueo(id)).bloqueoDetalle, { ...detalleAnterior, accesoLimitado: true });
      const apelacion = await solicitar(nuevaSesion, 'auth/bloqueo/actual');
      assert.equal((await apelacion.json()).apelacion.texto, detalleAnterior.apelacion.texto);
    } else {
      const apelacion = await solicitar(nuevaSesion, 'auth/bloqueo/actual', { texto: 'Solicito una revisión' });
      assert.equal(apelacion.status, 201);
      assert.equal((await apelacion.json()).apelacion.texto, 'Solicito una revisión');
    }
  }
  assert.equal(avisos.length, 2);
  assert.ok(avisos.every((aviso) => aviso[3] === true));
  assert.equal((await db.query('SELECT estado_pago FROM reserva WHERE id_reserva = 20')).rows[0].estado_pago, 'PENDIENTE');
  assert.equal((await bloqueo.cambiarBloqueo(5, true, 3, 'Perfil sin verificar')).accesoLimitado, false);
  await assert.rejects(auth.login(login(5)), { status: 403 });

  await db.exec(`
    UPDATE reserva SET estado_pago = 'CANCELADO', cancelada = true WHERE id_reserva IN (20,22);
    INSERT INTO reclamo_reserva (id_reserva,id_inquilino,id_anunciante,categoria,descripcion)
      VALUES (20,1,2,'OTRO','Pendiente de revisión');`);
  assert.equal((await solicitar(sesiones[0].nuevaSesion, 'auth/sesion')).status, 200);
  assert.equal((await solicitar(sesiones[2].nuevaSesion, 'auth/sesion')).status, 200);
  await db.exec(`
    UPDATE reclamo_reserva SET estado = 'CERRADO' WHERE id_reserva = 20;
    UPDATE reserva SET estado_pago = 'CANCELADO', cancelada = true WHERE id_reserva = 21;`);

  for (const { id, nuevaSesion } of sesiones) {
    assert.equal((await solicitar(nuevaSesion, 'auth/sesion')).status, 401);
    assert.equal((await repo.buscarConBloqueo(id)).bloqueoDetalle.accesoLimitado, false);
    await assert.rejects(auth.login(login(id)), (error) => {
      const respuesta = error.getResponse();
      assert.equal(respuesta.codigo, 'USUARIO_BLOQUEADO');
      assert.ok(respuesta.tokenBloqueo);
      sesiones.find((sesion) => sesion.id === id).tokenBloqueo = respuesta.tokenBloqueo;
      return true;
    });
  }
  for (const { id, tokenBloqueo } of sesiones) {
    assert.equal((await auth.consultarBloqueo(tokenBloqueo)).apelacion.texto,
      id === 2 ? detalleAnterior.apelacion.texto : 'Solicito una revisión');
    const actualizada = await auth.apelarBloqueo(tokenBloqueo, 'Información adicional');
    assert.equal(actualizada.mensajes.at(-1).texto, 'Información adicional');
  }
  await db.exec("UPDATE reserva SET estado_pago = 'PENDIENTE', cancelada = false WHERE id_reserva = 20");
  await assert.rejects(auth.login(login(2)), { status: 403 });
  await bloqueo.cambiarBloqueo(2, false, 3);
  const habilitada = await solicitar(sesiones[1].nuevaSesion, 'usuarios/administracion/bloqueados');
  assert.equal(habilitada.status, 200);
});
