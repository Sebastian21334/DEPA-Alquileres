import { Injectable } from '@nestjs/common';
import { EmailClient } from '@azure/communication-email';
import { IMailService, ReservaEmailDetalle } from './mail.interface';

@Injectable()
export class MailService implements IMailService {
  private readonly client: EmailClient;
  private readonly remitente: string;
  private readonly frontendUrl: string;

  constructor() {
    const connectionString = process.env.ACS_CONNECTION_STRING;
    const remitente = process.env.ACS_SENDER_ADDRESS;
    const frontendUrls = process.env.FRONTEND_URLS;

    if (!connectionString || !remitente || !frontendUrls) {
      // Fallar al arrancar evita que la API acepte registros que luego no puede verificar.
      throw new Error(
        'Faltan variables de entorno para el envío de mails (ACS_CONNECTION_STRING, ACS_SENDER_ADDRESS, FRONTEND_URLS)',
      );
    }

    this.client = new EmailClient(connectionString);
    this.remitente = remitente;
    // Si hay varios frontends configurados, el primero es el destino de los links.
    this.frontendUrl = frontendUrls.split(',')[0];
  }

  async enviarVerificacion(destinatario: string, token: string): Promise<void> {
    const link = `${this.frontendUrl}/verificar-cuenta?token=${token}`;

    await this.enviar(
      destinatario,
      'Verificá tu cuenta de DEPA',
      `<p style="margin:0 0 16px">Gracias por registrarte en DEPA. Para proteger tu cuenta necesitamos confirmar que este correo te pertenece.</p>
       ${this.boton('Verificar mi cuenta', link)}
       <p style="margin:20px 0 0;color:#667085;font-size:13px">Si no creaste una cuenta en DEPA, podés ignorar este mensaje con tranquilidad.</p>`,
      'Confirmá tu correo para comenzar a usar DEPA.',
    );
  }

  async enviarRecuperacion(destinatario: string, token: string): Promise<void> {
    const link = `${this.frontendUrl}/restablecer-contrasena?token=${token}`;

    await this.enviar(
      destinatario,
      'Restablecé tu contraseña de DEPA',
      `<p style="margin:0 0 16px">Recibimos una solicitud para cambiar la contraseña de tu cuenta.</p>
       ${this.boton('Crear una contraseña nueva', link)}
       <p style="margin:20px 0 0;color:#667085;font-size:13px">El enlace vence en una hora. Si no solicitaste el cambio, no hace falta que hagas nada.</p>`,
      'Usá este enlace seguro para recuperar el acceso a tu cuenta.',
    );
  }

  async enviarResultadoVerificacion(
    destinatario: string,
    aprobada: boolean,
    motivo?: string,
  ): Promise<void> {
    // El mismo método cubre los dos resultados administrativos.
    const asunto = aprobada ? 'Verificación de identidad aprobada' : 'Verificación de identidad rechazada';
    // El motivo proviene de un administrador y se escapa antes de insertarse en HTML.
    const motivoSeguro = (motivo ?? 'Documentación no válida')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
    const contenido = aprobada
      ? '<p>Tu identidad fue verificada correctamente. Ya podés publicar propiedades.</p>'
      : `<p>Tu solicitud de verificación fue rechazada.</p><p>Motivo: ${motivoSeguro}</p><p>Podés cargar nuevamente la documentación desde tu cuenta.</p>`;

    await this.enviar(destinatario, asunto, contenido, aprobada
      ? 'Tu perfil ya está habilitado para publicar propiedades.'
      : 'Revisá el resultado de la validación de tu identidad.');
  }

  async enviarReservaConfirmada(destinatario: string, detalle: ReservaEmailDetalle): Promise<void> {
    const enlace = `${this.frontendUrl}/reserva/resultado?reserva_id=${detalle.idReserva}`;
    await this.enviar(
      destinatario,
      `Reserva #${detalle.idReserva} confirmada — ${detalle.titulo}`,
      `<p style="margin:0 0 16px">Hola <strong>${this.escapar(detalle.nombreDestinatario)}</strong>, tu pago fue acreditado y la estadía quedó confirmada.</p>
       ${this.detalleReserva(detalle)}
       <div style="margin:20px 0;padding:16px;border-radius:10px;background:#f0fdf4;border:1px solid #bbf7d0;color:#166534">
         <strong>Contacto del anfitrión</strong><br>
         ${this.escapar(detalle.nombreContraparte)}<br>
         ${detalle.emailContraparte ? this.escapar(detalle.emailContraparte) : 'Correo no informado'} · ${detalle.telefonoContraparte ? this.escapar(detalle.telefonoContraparte) : 'Teléfono no informado'}
       </div>
       ${this.boton('Ver reserva y comprobante', enlace)}
       ${this.avisoContacto()}`,
      `Tu pago se acreditó y la reserva #${detalle.idReserva} quedó confirmada.`,
    );
  }

  async enviarNuevaReserva(destinatario: string, detalle: ReservaEmailDetalle): Promise<void> {
    const enlace = `${this.frontendUrl}/reserva/resultado?reserva_id=${detalle.idReserva}`;
    await this.enviar(
      destinatario,
      `Nueva reserva pagada #${detalle.idReserva} — ${detalle.titulo}`,
      `<p style="margin:0 0 16px">Hola <strong>${this.escapar(detalle.nombreDestinatario)}</strong>, recibiste una nueva reserva con el pago acreditado.</p>
       ${this.detalleReserva(detalle)}
       <div style="margin:20px 0;padding:16px;border-radius:10px;background:#eef4ff;border:1px solid #c7d7fe;color:#163a70">
         <strong>Datos del huésped</strong><br>
         ${this.escapar(detalle.nombreContraparte)}<br>
         ${detalle.emailContraparte ? this.escapar(detalle.emailContraparte) : 'Correo no informado'} · ${detalle.telefonoContraparte ? this.escapar(detalle.telefonoContraparte) : 'Teléfono no informado'}
       </div>
       ${this.boton('Ver reserva y contactar', enlace)}
       ${this.avisoContacto()}`,
      `${detalle.nombreContraparte} reservó ${detalle.titulo}.`,
    );
  }

  async enviarMensajeNuevo(destinatario: string, nombreDestinatario: string, nombreRemitente: string, titulo: string, idPublicacion: number): Promise<void> {
    await this.enviar(
      destinatario,
      `${nombreRemitente} te envió un mensaje en DEPA`,
      `<p style="margin:0 0 16px">Hola <strong>${this.escapar(nombreDestinatario)}</strong>, <strong>${this.escapar(nombreRemitente)}</strong> te escribió por la publicación <strong>${this.escapar(titulo)}</strong>.</p>
       <p style="margin:0 0 20px;color:#667085">Respondé desde la mensajería interna para que la conversación quede asociada a la publicación.</p>
       ${this.boton('Abrir publicación y responder', `${this.frontendUrl}/publicaciones/${idPublicacion}`)}`,
      `Tenés un nuevo mensaje relacionado con ${titulo}.`,
    );
  }

  async enviarSolicitudAnunciante(destinatario: string): Promise<void> {
    await this.enviar(destinatario, 'Recibimos tus datos de anunciante', `<p>Guardamos correctamente la primera parte de tu solicitud.</p><p>Para enviarla a revisión todavía tenés que completar la captura del DNI, la prueba de vida y la comparación facial.</p>${this.boton('Continuar verificación', `${this.frontendUrl}/mi-perfil/anunciante`)}`, 'Tu solicitud de anunciante quedó guardada.');
  }

  async enviarSolicitudParaRevision(destinatarios: string[], nombreSolicitante: string, emailSolicitante: string): Promise<void> {
    await Promise.all(destinatarios.map((email) => this.enviar(email, 'Nueva solicitud de anunciante para revisar', `<p><strong>${this.escapar(nombreSolicitante)}</strong> envió su documentación para ser anunciante.</p><p>Contacto: ${this.escapar(emailSolicitante)}.</p>${this.boton('Abrir panel administrativo', `${this.frontendUrl}/admin`)}`, 'Hay una nueva solicitud de identidad pendiente de revisión.')));
  }

  async enviarCambioBloqueo(destinatario: string, bloqueado: boolean, motivo?: string): Promise<void> {
    const motivoSeguro = motivo ? `<p>Motivo: ${this.escapar(motivo)}</p>` : '';
    const contenido = bloqueado
      ? `<p>Tu cuenta fue bloqueada y no podrás iniciar sesión.</p>${motivoSeguro}<p>Si creés que se trata de un error, comunicate con soporte.</p>`
      : '<p>Tu cuenta fue habilitada nuevamente. Ya podés iniciar sesión.</p>';
    await this.enviar(destinatario, bloqueado ? 'Tu cuenta de DEPA fue bloqueada' : 'Tu cuenta de DEPA fue habilitada', contenido, bloqueado ? 'Información importante sobre el acceso a tu cuenta.' : 'Ya podés volver a ingresar a DEPA.');
  }

  private fecha(valor: Date): string {
    return new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(new Date(valor));
  }

  private escapar(valor: string): string {
    return valor.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
  }

  private importe(valor: number, moneda: string): string {
    const codigo = moneda.includes('USD') ? 'USD' : 'ARS';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: codigo }).format(valor);
  }

  private detalleReserva(detalle: ReservaEmailDetalle): string {
    return `<table role="presentation" style="width:100%;border-collapse:collapse;margin:20px 0;border:1px solid #e5e7eb;border-radius:10px">
      <tr><td colspan="2" style="padding:14px 16px;background:#f8fafc;font-weight:700">Reserva #${detalle.idReserva} · ${this.escapar(detalle.titulo)}</td></tr>
      <tr><td style="padding:10px 16px;color:#667085">Ubicación</td><td style="padding:10px 16px;text-align:right;font-weight:600">${this.escapar(detalle.direccion)}</td></tr>
      <tr><td style="padding:10px 16px;color:#667085">Ingreso</td><td style="padding:10px 16px;text-align:right;font-weight:600">${this.fecha(detalle.fechaInicio)}</td></tr>
      <tr><td style="padding:10px 16px;color:#667085">Salida</td><td style="padding:10px 16px;text-align:right;font-weight:600">${this.fecha(detalle.fechaFin)}</td></tr>
      <tr><td style="padding:10px 16px;color:#667085">Duración</td><td style="padding:10px 16px;text-align:right;font-weight:600">${detalle.cantidadDias} ${detalle.cantidadDias === 1 ? 'día' : 'días'}</td></tr>
      <tr><td style="padding:12px 16px;border-top:1px solid #e5e7eb;font-weight:700">Total pagado</td><td style="padding:12px 16px;border-top:1px solid #e5e7eb;text-align:right;font-size:18px;font-weight:800;color:#d94217">${this.importe(detalle.monto, detalle.moneda)}</td></tr>
    </table>`;
  }

  private avisoContacto(): string {
    return '<p style="margin:20px 0 0;padding-top:16px;border-top:1px solid #e5e7eb;color:#667085;font-size:12px;line-height:1.5"><strong>Consejo de seguridad:</strong> la mensajería interna mantiene la conversación dentro de DEPA. Si elegís continuar por WhatsApp, DEPA no podrá revisar esa conversación ni ayudarte a verificar acuerdos realizados fuera de la plataforma.</p>';
  }

  private boton(texto: string, enlace: string): string {
    return `<a href="${enlace}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#d94217;color:#ffffff;text-decoration:none;font-weight:700">${this.escapar(texto)}</a>`;
  }

  private plantilla(preheader: string, html: string): string {
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>DEPA</title></head><body style="margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#101828">
      <span style="display:none;max-height:0;overflow:hidden;opacity:0">${this.escapar(preheader)}</span>
      <table role="presentation" style="width:100%;border-collapse:collapse;background:#f3f4f6"><tr><td style="padding:28px 12px">
        <table role="presentation" style="width:100%;max-width:620px;margin:0 auto;border-collapse:collapse;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 8px 28px rgba(16,24,40,.08)">
          <tr><td style="padding:22px 28px;background:#101828;color:#ffffff"><strong style="font-size:25px;letter-spacing:.5px">DEPA</strong><span style="display:block;margin-top:4px;color:#cbd5e1;font-size:12px">Alquileres simples, decisiones seguras</span></td></tr>
          <tr><td style="padding:28px;line-height:1.6">${html}</td></tr>
          <tr><td style="padding:18px 28px;background:#f8fafc;color:#667085;font-size:12px;line-height:1.5">Este correo fue enviado por DEPA porque existe una actividad asociada a tu cuenta. Nunca te pediremos contraseñas ni datos completos de tarjeta por correo.</td></tr>
        </table>
      </td></tr></table>
    </body></html>`;
  }

  // Método privado compartido para no repetir la lógica de envío en cada método público
  private async enviar(destinatario: string, asunto: string, html: string, preheader = 'Tenés una novedad en tu cuenta de DEPA.'): Promise<void> {
    // Azure devuelve un poller porque el envío es asíncrono; se espera hasta su estado final.
    const poller = await this.client.beginSend({
      senderAddress: this.remitente,
      content: {
        subject: asunto,
        html: this.plantilla(preheader, html),
      },
      recipients: {
        to: [{ address: destinatario }],
      },
    });

    await poller.pollUntilDone();
  }
}
