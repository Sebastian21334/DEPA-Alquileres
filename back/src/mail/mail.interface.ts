export interface IMailService {
  enviarVerificacion(destinatario: string, token: string): Promise<void>;
  enviarRecuperacion(destinatario: string, token: string): Promise<void>;
}

export const MAIL_SERVICE = 'MAIL_SERVICE';