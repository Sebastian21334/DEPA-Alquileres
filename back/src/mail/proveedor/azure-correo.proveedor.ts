import { type FactoryProvider, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailClient } from '@azure/communication-email';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CLIENTE_CORREO } from './cliente-correo.interface';
import type { ClienteCorreo } from './cliente-correo.interface';
import type { Correo, IProveedorCorreo } from './proveedor-correo.interface';

/** Cliente del SDK de Azure Communication Services, creado con la cadena de conexión del entorno. */
export const clienteCorreoAzure: FactoryProvider = {
  provide: CLIENTE_CORREO,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => new EmailClient(config.getOrThrow<string>('ACS_CONNECTION_STRING')),
};

@Injectable()
export class AzureCorreoProveedor implements IProveedorCorreo {
  private readonly logger = new Logger(AzureCorreoProveedor.name);
  private readonly logo = readFileSync(join(__dirname, '../presentation/assets/logo-depa.png'), 'base64');
  private readonly remitente: string;

  constructor(config: ConfigService, @Inject(CLIENTE_CORREO) private readonly client: ClienteCorreo) {
    this.remitente = config.getOrThrow<string>('ACS_SENDER_ADDRESS');
  }

  async enviar(correo: Correo): Promise<void> {
    const mensaje = {
      senderAddress: this.remitente,
      content: {
        subject: correo.asunto,
        html: correo.html,
      },
      recipients: {
        to: [{ address: correo.destinatario }],
      },
      attachments: [{
        name: 'logo-depa.png',
        contentId: 'logo-depa',
        contentType: 'image/png',
        contentInBase64: this.logo,
      }],
    };
    let ultimoError: unknown;

    // Azure resuelve el poller aun cuando la operación termina en "Failed".
    // Validar el estado evita registrar silenciosamente como enviado un correo rechazado.
    for (let intento = 1; intento <= 2; intento += 1) {
      try {
        const poller = await this.client.beginSend(mensaje);
        const resultado = await poller.pollUntilDone();
        if (resultado.status === 'Succeeded') return;

        const detalle = [resultado.error?.code, resultado.error?.message]
          .filter(Boolean)
          .join(': ');
        ultimoError = new Error(
          `Azure Communication Services finalizó el envío con estado ${resultado.status}${detalle ? ` (${detalle})` : ''}`,
        );
      } catch (error) {
        ultimoError = error;
      }

      if (intento === 1) {
        // La dirección no se registra: los logs no guardan datos personales.
        this.logger.warn('Reintentando un correo después de un envío fallido');
      }
    }

    throw ultimoError instanceof Error
      ? ultimoError
      : new Error('No se pudo completar el envío del correo');
  }
}
