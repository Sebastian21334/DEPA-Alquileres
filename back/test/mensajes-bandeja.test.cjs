require('reflect-metadata');
const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const { crearPostgresPruebas } = require('./soporte/postgres-pruebas.cjs');
const { Mensaje } = require('../dist/mensajes/entity/mensaje.entity');
const { MensajeRepository } = require('../dist/mensajes/repository/mensajes.repository');
const { MensajesService } = require('../dist/mensajes/service/mensajes.service');
const { MensajesController } = require('../dist/mensajes/controller/mensajes.controller');
const { Publicacion } = require('../dist/publicaciones/entity/publicacion.entity');
const { PublicacionesRepository } = require('../dist/publicaciones/repository/publicaciones.repository');
const { PublicacionesService } = require('../dist/publicaciones/service/publicaciones.service');
const { Reserva } = require('../dist/reservas/entity/reserva.entity');
const { Usuario } = require('../dist/usuarios/entity/usuario.entity');
const { UsuariosRepository } = require('../dist/usuarios/repository/usuarios.repository');
const { UsuariosService } = require('../dist/usuarios/service/usuarios.service');

let base, controlador;
const sesion = id => ({ user: { id } });
const CAMPOS_PARTICIPANTE = ['apellido', 'foto_url', 'id', 'nombre'];
const CAMPOS_MENSAJE = ['destinoUsuario', 'fecha', 'fecha_lectura', 'id', 'leido', 'origenUsuario', 'publicacion', 'texto'];
// Nada de contacto, estado de la cuenta ni historial del otro participante.
const DATOS_PRIVADOS = /example\.invalid|351555|telefono|email|bloqueado|activa|fecha_baja|contrasenia/;

const verificarMensaje = (mensaje, extra = []) => {
  assert.deepEqual(Object.keys(mensaje).sort(), [...CAMPOS_MENSAJE, ...extra].sort());
  assert.deepEqual(Object.keys(mensaje.origenUsuario).sort(), CAMPOS_PARTICIPANTE);
  assert.deepEqual(Object.keys(mensaje.destinoUsuario).sort(), CAMPOS_PARTICIPANTE);
  assert.deepEqual(Object.keys(mensaje.publicacion).sort(), ['eliminada', 'id', 'titulo']);
};

before(async () => {
  base = await crearPostgresPruebas();
  const { db, source } = base;
  await db.exec(`
    INSERT INTO rol (id_rol, nombre) VALUES (1, 'Inquilino'), (2, 'Anunciante');
    INSERT INTO usuario (id_usuario, nombre, apellido, email, telefono, contrasenia, email_verificado, id_rol)
      VALUES (1, 'Inquilino', 'Uno', 'inquilino@example.invalid', '3515550001', 'hash', true, 1),
        (2, 'Anunciante', 'Dos', 'anunciante@example.invalid', '3515550002', 'hash', true, 2),
        (3, 'Anunciante', 'Tres', 'otro@example.invalid', '3515550003', 'hash', true, 2);
    INSERT INTO anunciante (id_usuario, numero_contacto) VALUES (2, '3515550002'), (3, '3515550003');
    INSERT INTO publicacion (id_publicacion, titulo, descripcion, fecha_publicacion, precio, direccion, cantidad_ambientes, superficie, id_anunciante)
      VALUES (10, 'Casa de Dos', 'Prueba', CURRENT_DATE, 100, 'Calle 1', 1, 30, 2),
        (11, 'Casa de Tres', 'Prueba', CURRENT_DATE, 100, 'Calle 2', 1, 30, 3);
    INSERT INTO mensaje (texto, fecha, leido, id_origen_usuario, id_destino_usuario, id_publicacion) VALUES
      ('Consulta', '2020-01-01 10:00Z', true, 1, 2, 10),
      ('Respuesta', '2020-01-01 11:00Z', false, 2, 1, 10),
      ('Otra respuesta', '2020-01-01 12:00Z', false, 2, 1, 10),
      ('Consulta a Tres', '2020-01-02 09:00Z', false, 1, 3, 11);
  `);
  const publicaciones = new PublicacionesService(new PublicacionesRepository(source.getRepository(Publicacion), source.getRepository(Reserva)));
  const usuarios = new UsuariosService(new UsuariosRepository(source.getRepository(Usuario)));
  const servicio = new MensajesService(new MensajeRepository(source.getRepository(Mensaje)), publicaciones, usuarios, {}, { enviarMensajeNuevo: async () => {} });
  controlador = new MensajesController(servicio);
});

after(async () => { if (base) await base.cerrar(); });

test('la bandeja trae el último mensaje de cada conversación, sus no leídos y nada privado del interlocutor', async () => {
  const bandeja = await controlador.listarConversaciones(sesion(1));
  assert.deepEqual(bandeja.map(({ idPublicacion, idOtroUsuario, cantidadNoLeidos, ultimoMensaje }) =>
    [idPublicacion, idOtroUsuario, cantidadNoLeidos, ultimoMensaje.texto]),
  [[11, 3, 0, 'Consulta a Tres'], [10, 2, 2, 'Otra respuesta']]);
  bandeja.forEach(({ ultimoMensaje }) => verificarMensaje(ultimoMensaje));
  assert.deepEqual(bandeja[1].ultimoMensaje.origenUsuario, { id: 2, nombre: 'Anunciante', apellido: 'Dos', foto_url: null });
  assert.doesNotMatch(JSON.stringify(bandeja), DATOS_PRIVADOS);

  const delAnunciante = await controlador.listarConversaciones(sesion(2));
  assert.deepEqual(delAnunciante.map(({ idOtroUsuario, cantidadNoLeidos }) => [idOtroUsuario, cantidadNoLeidos]), [[1, 0]]);
  assert.deepEqual(await controlador.listarConversaciones(sesion(99)), []);
});

test('la conversación y el mensaje enviado solo exponen los datos que muestra el chat', async () => {
  const conversacion = await controlador.listarConversacion(10, 2, sesion(1));
  assert.deepEqual(conversacion.map(({ texto }) => texto), ['Consulta', 'Respuesta', 'Otra respuesta']);
  conversacion.forEach(mensaje => verificarMensaje(mensaje, ['contactoSuspendido']));
  assert.equal(conversacion[0].contactoSuspendido, false);
  assert.doesNotMatch(JSON.stringify(conversacion), DATOS_PRIVADOS);

  const enviado = await controlador.enviar({ id_publicacion: 10, id_destino_usuario: 2, texto: 'Nueva consulta' }, sesion(1));
  verificarMensaje(enviado);
  assert.equal(enviado.origenUsuario.nombre, 'Inquilino');
  assert.equal(enviado.destinoUsuario.nombre, 'Anunciante');
  assert.doesNotMatch(JSON.stringify(enviado), DATOS_PRIVADOS);
  const [primera] = await controlador.listarConversaciones(sesion(1));
  assert.deepEqual([primera.idPublicacion, primera.ultimoMensaje.texto], [10, 'Nueva consulta']);

  // La cuenta inactiva se sigue leyendo para suspender el contacto, aunque no viaja en la respuesta.
  await base.db.exec('UPDATE usuario SET activa = false WHERE id_usuario = 3');
  const suspendida = await controlador.listarConversacion(11, 3, sesion(1));
  assert.equal(suspendida[0].contactoSuspendido, true);
  verificarMensaje(suspendida[0], ['contactoSuspendido']);
});
