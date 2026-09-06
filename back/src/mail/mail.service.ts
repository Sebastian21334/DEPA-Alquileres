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