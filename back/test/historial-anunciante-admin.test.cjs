require('reflect-metadata');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { once } = require('node:events');
const { Duplex } = require('node:stream');
const { Module } = require('@nestjs/common');
const { ConfigService } = require('@nestjs/config');
const { NestFactory } = require('@nestjs/core');
const { JwtService } = require('@nestjs/jwt');
const { crearPostgresPruebas } = require('./soporte/postgres-pruebas.cjs');
const { Anunciante } = require('../dist/anunciantes/entity/anunciante.entity');
const { AnunciantesRepository } = require('../dist/anunciantes/repository/anunciantes.repository');
const { AnunciantesService } = require('../dist/anunciantes/service/anunciantes.service');
const { SeguridadService } = require('../dist/seguridad/service/seguridad.service');
const { JwtStrategy } = require('../dist/seguridad/strategy/jwt.strategy');
const { VerificacionAnuncianteController } = require('../dist/verificacion-anunciante/controller/verificacion-anunciante.controller');
const { RevisionVerificacion } = require('../dist/verificacion-anunciante/entity/revision-verificacion.entity');
const { SolicitudVerificacion } = require('../dist/verificacion-anunciante/entity/solicitud-verificacion.entity');
const { VerificacionRepository } = require('../dist/verificacion-anunciante/repository/verificacion.repository');
const { PerfilAnunciantePublicoService } = require('../dist/verificacion-anunciante/service/perfil-anunciante-publico.service');
const { PruebaVidaService } = require('../dist/verificacion-anunciante/service/prueba-vida.service');
const { VerificacionAnuncianteService } = require('../dist/verificacion-anunciante/service/verificacion-anunciante.service');

// Envía la solicitud por el servidor HTTP de Nest sin abrir un puerto.
async function solicitar(server, ruta, token) {
  const salida = [];
  const conexion = new Duplex({
    read() {},
    write(datos, _encoding, listo) { salida.push(datos); listo(); },
  });
  server.emit('connection', conexion);
  const fin = once(conexion, 'finish');
  const autorizacion = token ? `Authorization: Bearer ${token}\r\n` : '';
  conexion.push(`GET ${ruta} HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n${autorizacion}\r\n`);
  await fin;
  conexion.destroy();
  const respuesta = Buffer.concat(salida).toString('utf8');
  const separador = respuesta.indexOf('\r\n\r\n');
  const cabecera = respuesta.slice(0, separador);
  return { estado: Number(cabecera.split(' ')[1]), cabecera, cuerpo: JSON.parse(respuesta.slice(separador + 4)) };
}

test('solo administración puede consultar la solicitud y las revisiones de otra cuenta', { timeout: 20_000 }, async (t) => {
  const { db, source, cerrar } = await crearPostgresPruebas();
  t.after(cerrar);
  await db.exec(`
    INSERT INTO usuario (id_usuario,nombre,apellido,email,telefono,contrasenia,activa)
      VALUES (7,'Usuario','Prueba','siete@example.invalid','123','hash',false),
             (8,'Usuario','Prueba','ocho@example.invalid','123','hash',true),
             (9,'Usuario','Prueba','nueve@example.invalid','123','hash',true),
             (10,'Usuario','Prueba','diez@example.invalid','123','hash',true);
    INSERT INTO anunciante (id_usuario,numero_contacto,verificado)
      VALUES (7,'123',false),(8,'123',true),(9,'123',true);
    INSERT INTO solicitud_verificacion (id_anunciante,estado,numero_revision,dni_frente_url,cbu_pendiente)
      VALUES (7,'reenviada',2,'documento-privado','1234567890123456789012'),(9,'aprobada',1,NULL,NULL);
    INSERT INTO revision_verificacion (id_anunciante,numero_revision,estado,motivo,identidad_aprobada,cbu_aprobado,creada_en)
      VALUES (7,2,'rechazada','Revisar identidad',false,NULL,'2026-11-23T15:00:00Z'),
             (7,1,'rechazada','Revisar CBU',true,false,'2026-11-22T15:00:00Z'),
             (9,1,'aprobada',NULL,true,true,'2026-11-24T15:00:00Z');
  `);
  const repo = new VerificacionRepository(source.getRepository(SolicitudVerificacion), source.getRepository(RevisionVerificacion), source);
  const anunciantes = new AnunciantesService(new AnunciantesRepository(source.getRepository(Anunciante)));
  const servicio = new VerificacionAnuncianteService(anunciantes, {}, {}, repo, {}, {}, {}, {}, {});
  const secret = 'secreto-local-historial-admin';
  const jwt = new JwtService({ secret });
  class ModuloPrueba {}
  Module({
    controllers: [VerificacionAnuncianteController],
    providers: [
      JwtStrategy,
      { provide: ConfigService, useValue: { getOrThrow: () => secret } },
      { provide: SeguridadService, useValue: { validarSesion: id => ({ id, rol: id === 1 ? 'Administrador' : 'Inquilino' }) } },
      { provide: VerificacionAnuncianteService, useValue: servicio },
      { provide: PruebaVidaService, useValue: {} },
      { provide: PerfilAnunciantePublicoService, useValue: {} },
    ],
  })(ModuloPrueba);
  const app = await NestFactory.create(ModuloPrueba, { logger: false, abortOnError: false });
  t.after(() => app.close());
  await app.init();
  const ruta = id => `/anunciantes/administracion/usuarios/${id}/solicitud`;
  const consultar = (id, token) => solicitar(app.getHttpServer(), ruta(id), token);
  const admin = id => consultar(id, jwt.sign({ sub: 1 }));

  assert.equal((await consultar(7)).estado, 401);
  assert.equal((await consultar(7, jwt.sign({ sub: 2 }))).estado, 403);
  assert.equal((await admin(2_147_483_648)).estado, 400);
  const { estado, cabecera, cuerpo } = await admin(7);
  assert.equal(estado, 200);
  assert.match(cabecera, /^Cache-Control: no-store$/im);
  assert.equal(cuerpo.esAnunciante, false);
  assert.equal(cuerpo.solicitud.estado, 'reenviada');
  assert.deepEqual(cuerpo.solicitud.revisiones.map(revision => revision.motivo), ['Revisar identidad', 'Revisar CBU']);
  assert.deepEqual(Object.keys(cuerpo.solicitud).sort(), ['actualizada_en', 'creada_en', 'estado', 'id', 'numero_revision', 'revisiones']);
  assert.deepEqual((await admin(8)).cuerpo, { esAnunciante: true, solicitud: null });
  const aprobada = await admin(9);
  assert.equal(aprobada.cuerpo.esAnunciante, true);
  assert.equal(aprobada.cuerpo.solicitud.revisiones.length, 1);
  assert.deepEqual((await admin(10)).cuerpo, { esAnunciante: false, solicitud: null });
});
