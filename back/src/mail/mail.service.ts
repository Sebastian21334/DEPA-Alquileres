import { Injectable } from '@nestjs/common';
import { EmailClient } from '@azure/communication-email';
import { IMailService } from './mail.interface';

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
      'Verificá tu cuenta',
      `<p>Gracias por registrarte. Hacé click en el siguiente link para verificar tu cuenta:</p>
       <a href="${link}">${link}</a>
       <p>Si no creaste esta cuenta, ignorá este mensaje.</p>`,
    );
  }

  async enviarRecuperacion(destinatario: string, token: string): Promise<void> {
    const link = `${this.frontendUrl}/restablecer-contrasena?token=${token}`;

    await this.enviar(
      destinatario,
      'Recuperá tu contraseña',
      `<p>Recibimos una solicitud para restablecer tu contraseña.</p>
       <a href="${link}">${link}</a>
       <p>Este link expira en 1 hora. Si no pediste esto, ignorá este mensaje.</p>`,
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

    await this.enviar(destinatario, asunto, contenido);
  }

  async enviarReservaConfirmada(destinatario: string, titulo: string, fechaInicio: Date, fechaFin: Date): Promise<void> {
    await this.enviar(destinatario, 'Tu reserva fue confirmada', `<p>Tu reserva para <strong>${this.escapar(titulo)}</strong> fue confirmada.</p><p>Fechas: ${this.fecha(fechaInicio)} al ${this.fecha(fechaFin)}.</p><p>Podés verla desde <a href="${this.frontendUrl}/mis-reservas">Mis reservas</a>.</p>`);
  }

  async enviarNuevaReserva(destinatario: string, titulo: string, nombreInquilino: string, fechaInicio: Date, fechaFin: Date): Promise<void> {
    await this.enviar(destinatario, 'Nueva reserva recibida', `<p><strong>${this.escapar(nombreInquilino)}</strong> reservó tu publicación <strong>${this.escapar(titulo)}</strong>.</p><p>Fechas: ${this.fecha(fechaInicio)} al ${this.fecha(fechaFin)}.</p><p>Consultá los datos desde <a href="${this.frontendUrl}/mis-reservas">Reservas recibidas</a>.</p>`);
  }

  async enviarMensajeNuevo(destinatario: string, nombreRemitente: string, titulo: string): Promise<void> {
    await this.enviar(destinatario, 'Tenés un nuevo mensaje', `<p><strong>${this.escapar(nombreRemitente)}</strong> te escribió por <strong>${this.escapar(titulo)}</strong>.</p><p>Entrá a DEPA para responder desde el chat.</p>`);
  }

  async enviarSolicitudAnunciante(destinatario: string): Promise<void> {
    await this.enviar(destinatario, 'Guardamos tus datos de anunciante', `<p>Guardamos tus datos iniciales.</p><p>La solicitud se enviará al equipo de revisión cuando completes la captura del DNI, la prueba de vida y la comparación facial.</p>`);
  }

  async enviarSolicitudParaRevision(destinatarios: string[], nombreSolicitante: string, emailSolicitante: string): Promise<void> {
    await Promise.all(destinatarios.map((email) => this.enviar(email, 'Nueva solicitud de anunciante para revisar', `<p><strong>${this.escapar(nombreSolicitante)}</strong> envió su documentación para ser anunciante.</p><p>Contacto: ${this.escapar(emailSolicitante)}.</p><p>Revisala desde el panel de administración.</p>`)));
  }

  async enviarCambioBloqueo(destinatario: string, bloqueado: boolean, motivo?: string): Promise<void> {
    const motivoSeguro = motivo ? `<p>Motivo: ${this.escapar(motivo)}</p>` : '';
    const contenido = bloqueado
      ? `<p>Tu cuenta fue bloqueada y no podrás iniciar sesión.</p>${motivoSeguro}<p>Si creés que se trata de un error, comunicate con soporte.</p>`
      : '<p>Tu cuenta fue habilitada nuevamente. Ya podés iniciar sesión.</p>';
    await this.enviar(destinatario, bloqueado ? 'Tu cuenta fue bloqueada' : 'Tu cuenta fue habilitada', contenido);
  }

  private fecha(valor: Date): string {
    return new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(new Date(valor));
  }

  private escapar(valor: string): string {
    return valor.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
  }

  // Método privado compartido para no repetir la lógica de envío en cada método público
  private async enviar(destinatario: string, asunto: string, html: string): Promise<void> {
    // Azure devuelve un poller porque el envío es asíncrono; se espera hasta su estado final.
    const poller = await this.client.beginSend({
      senderAddress: this.remitente,
      content: {
        subject: asunto,
        html,
      },
      recipients: {
        to: [{ address: destinatario }],
      },
    });

    await poller.pollUntilDone();
  }
}
