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
  return { mail, boton };
}

test('cada aviso de reserva lleva a la pantalla de su tema según quién lo recibe', async () => {
  const { mail, boton } = correo();
  const casos = [
    ['reclamo', 'inquilino', '/mis-reservas?vista=reclamos&reserva=7', 'Ver reclamo'],
    ['reclamo', 'anunciante', '/mis-reservas?vista=reclamos&reserva=7', 'Ver reclamo'],
    ['reclamo', 'admin', '/admin#reclamos', 'Ver reclamo'],
    ['reserva', 'inquilino', '/reserva/resultado?reserva_id=7', 'Ver reserva'],
    ['reserva', 'anunciante', '/reserva/resultado?reserva_id=7', 'Ver reserva'],
    ['reserva', 'admin', '/admin/reservas/7', 'Ver reserva'],
    ['reembolso', 'inquilino', '/reserva/resultado?reserva_id=7', 'Ver reserva'],
    ['reembolso', 'admin', '/admin#reembolsos', 'Ver reembolsos'],
    ['liquidacion', 'anunciante', '/dashboard#liquidaciones-pendientes', 'Ver liquidaciones'],
    ['liquidacion', 'admin', '/admin#liquidaciones', 'Ver liquidaciones'],
    ['pago-liquidacion', 'anunciante', '/dashboard#historial-liquidaciones', 'Ver liquidaciones'],
  ];
  for (const [tema, panel, ruta, texto] of casos) {
    await mail.enviarAvisoReserva('parte@example.invalid', 7, 'Asunto', 'Mensaje', panel, tema);
    assert.deepEqual(boton(), [FRONT + ruta, texto], `${tema} para ${panel}`);
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
