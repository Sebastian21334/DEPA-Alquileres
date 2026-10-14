import type { EmailMessage } from '@azure/communication-email';

export const CLIENTE_CORREO = 'CLIENTE_CORREO';

/** Contrato mínimo del SDK que permite probar estados fallidos sin abrir conexiones. */
export interface ClienteCorreo {
  beginSend(mensaje: EmailMessage): Promise<{
    pollUntilDone(): Promise<{
      status?: string;
      error?: { code?: string; message?: string };
    }>;
  }>;
}
