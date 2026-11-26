const assert = require('node:assert/strict');
const { test } = require('node:test');
const { MailService } = require('../dist/mail/service/mail.service');
const { MailPlantilla } = require('../dist/mail/presentation/mail-plantilla');

const FRONT = 'https://depa.test';

function correo() {
  const enviados = [];
  const mail = new MailService({ enviar: async (enviado) => { enviados.push(enviado); } }, new MailPlantilla(), { getOrThrow: () => `${FRONT}/` });
  // El botón es el enlace con el color de DEPA; el logo del encabezado también enlaza al inicio.
  const boton = () => {
    const [, href, texto] = enviados.at(-1).html.match(/<a href="([^"]+)" style="display:inline-block[^>]*>([^<]+)<\/a>/);
    return [href.replaceAll('&amp;', '&'), texto];
  };
  return { mail, boton, enviados };
}

test('cada aviso de reserva lleva a la pantalla de su tema según quién lo recibe', async () => {
  const { mail, boton } = correo();
  const casos = [
    ['reclamo', 'inquilino', '/mis-reservas?vista=reclamos&reserva=7', 'Abrir reclamo'],
    ['reclamo', 'anunciante', '/mis-reservas?vista=reclamos&reserva=7', 'Abrir reclamo'],
    ['reclamo', 'admin', '/admin?reserva=7#reclamos', 'Abrir reclamo'],
    ['reserva', 'inquilino', '/reserva/resultado?reserva_id=7', 'Abrir reserva'],
    ['reserva', 'anunciante', '/reserva/resultado?reserva_id=7', 'Abrir reserva'],
    ['reserva', 'admin', '/admin/reservas/7', 'Abrir reserva'],
    ['reembolso', 'inquilino', '/reserva/resultado?reserva_id=7', 'Abrir reserva'],
    ['reembolso', 'admin', '/admin#reembolsos', 'Abrir reembolsos'],
    ['liquidacion', 'anunciante', '/dashboard#liquidaciones-pendientes', 'Abrir liquidaciones'],
    ['liquidacion', 'admin', '/admin#liquidaciones', 'Abrir liquidaciones'],
    ['pago-liquidacion', 'anunciante', '/dashboard#historial-liquidaciones', 'Abrir liquidaciones'],
  ];
  for (const [tema, panel, ruta, texto] of casos) {
    await mail.enviarAvisoReserva('parte@example.invalid', 7, 'Asunto', 'Mensaje', panel, tema);
    assert.deepEqual(boton(), [FRONT + ruta, texto], `${tema} para ${panel}`);
  }
});

test('los avisos para administración se distinguen de los de las partes en el asunto y en el cuerpo', async () => {
  const { mail, enviados } = correo();
  await mail.enviarAvisoReserva('admin@example.invalid', 7, 'Reclamo resuelto', 'Se resolvió el reclamo.', 'admin', 'reclamo');
  await mail.enviarAvisoReserva('parte@example.invalid', 7, 'Reclamo resuelto', 'Se resolvió el reclamo.', 'anunciante', 'reclamo');
  await mail.enviarSolicitudParaRevision(['admin@example.invalid'], 'Ana', 'ana@example.invalid');
  const [admin, parte, revision] = enviados;
  assert.equal(admin.asunto, '[Administración] Reclamo resuelto');
  assert.ok(admin.html.includes('<strong>Para administración</strong>'));
  // El título dentro del correo no repite la marca del asunto.
  assert.match(admin.html, /<h1[^>]*>Reclamo resuelto<\/h1>/);
  assert.equal(parte.asunto, 'Reclamo resuelto');
  assert.doesNotMatch(parte.html, /Para administración/);
  assert.ok(parte.html.includes('Reserva #7 · Te avisamos como anunciante.'));
  assert.equal(revision.asunto, '[Administración] Nueva solicitud de anunciante para revisar');
  assert.ok(revision.html.includes('<strong>Para administración</strong>'));
});

test('todos los correos tienen un botón con un texto propio', async () => {
  const { mail, boton } = correo();
  const reserva = { idReserva: 7, nombreDestinatario: 'Ana', titulo: 'Departamento', direccion: 'Calle 1', fechaInicio: new Date('2026-12-01'), fechaFin: new Date('2026-12-03'), cantidadDias: 3, monto: 1000, moneda: 'ARS', nombreContraparte: 'Beto' };
  const reprogramacion = { idReserva: 7, nombreAnunciante: 'Beto', nombreInquilino: 'Ana', titulo: 'Departamento', inicioAnterior: '2026-12-01', finAnterior: '2026-12-03', inicioNuevo: '2026-12-05', finNuevo: '2026-12-07', cantidadDias: 3, monto: 1000, moneda: 'ARS' };
  const casos = {
    enviarVerificacion: [['parte@example.invalid', 'token'], 'Verificar mi cuenta'],
    enviarReactivacion: [['parte@example.invalid', 'token'], 'Recuperar mi cuenta'],
    enviarReprogramacionReserva: [['parte@example.invalid', reprogramacion], 'Abrir reserva'],
    enviarRecuperacion: [['parte@example.invalid', 'token'], 'Crear una contraseña nueva'],
    enviarCambioContrasenia: [['parte@example.invalid'], 'Recuperar acceso a mi cuenta'],
    enviarResultadoVerificacion: [['parte@example.invalid', true], 'Ir a Mi perfil'],
    enviarReservaConfirmada: [['parte@example.invalid', reserva], 'Ver reserva y comprobante'],
    enviarNuevaReserva: [['parte@example.invalid', reserva], 'Ver reserva y contactar'],
    enviarMensajeNuevo: [['parte@example.invalid', 'Ana', 'Beto', 'Departamento', 12, 34], 'Abrir el chat y responder'],
    enviarSolicitudAnunciante: [['parte@example.invalid'], 'Continuar verificación'],
    enviarSolicitudParaRevision: [[['admin@example.invalid'], 'Ana', 'ana@example.invalid'], 'Revisar la solicitud'],
    enviarCambioBloqueo: [['parte@example.invalid', true, 'Motivo'], 'Iniciar sesión y consultar el bloqueo'],
    enviarBajaPublicacion: [['parte@example.invalid', 'Departamento', 'Motivo'], 'Ver mis publicaciones'],
    enviarPublicacionActiva: [['parte@example.invalid', 'Departamento', 12], 'Ver publicación'],
    enviarReactivacionPublicacion: [['parte@example.invalid', 'Departamento'], 'Ver mis publicaciones'],
    enviarConfirmacionBaja: [['parte@example.invalid', 'token'], 'Revisar y confirmar la baja'],
    enviarAvisoReserva: [['parte@example.invalid', 7, 'Asunto', 'Mensaje', 'inquilino', 'reserva'], 'Abrir reserva'],
  };
  // Un correo nuevo sin caso acá hace fallar la prueba: así ninguno queda sin botón.
  const metodos = Object.getOwnPropertyNames(Object.getPrototypeOf(mail)).filter((nombre) => /^enviar.+/.test(nombre));
  assert.deepEqual(metodos.sort(), Object.keys(casos).sort());
  for (const [metodo, [argumentos, texto]] of Object.entries(casos)) {
    await mail[metodo](...argumentos);
    assert.equal(boton()[1], texto, metodo);
  }
});

test('el aviso de bloqueo o habilitación lleva a iniciar sesión', async () => {
  const { mail, boton } = correo();
  const casos = [[true, false, 'Iniciar sesión y consultar el bloqueo'], [true, true, 'Iniciar sesión y resolver pendientes'], [false, false, 'Iniciar sesión']];
  for (const [bloqueado, accesoLimitado, texto] of casos) {
    await mail.enviarCambioBloqueo('parte@example.invalid', bloqueado, undefined, accesoLimitado);
    assert.deepEqual(boton(), [`${FRONT}/login`, texto]);
  }
});

test('los demás avisos llevan a la conversación, a la revisión o a Mi perfil', async () => {
  const { mail, boton } = correo();
  await mail.enviarMensajeNuevo('parte@example.invalid', 'Ana', 'Beto', 'Departamento', 12, 34);
  assert.deepEqual(boton(), [`${FRONT}/publicaciones/12?chat=34`, 'Abrir el chat y responder']);
  await mail.enviarSolicitudParaRevision(['admin@example.invalid'], 'Ana', 'ana@example.invalid');
  assert.deepEqual(boton(), [`${FRONT}/admin#verificaciones`, 'Revisar la solicitud']);
  for (const aprobada of [true, false]) {
    await mail.enviarResultadoVerificacion('parte@example.invalid', aprobada, 'Falta el dorso del DNI');
    assert.deepEqual(boton(), [`${FRONT}/mi-perfil`, 'Ir a Mi perfil']);
  }
});
