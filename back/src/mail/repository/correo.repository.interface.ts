export const CORREO_REPOSITORY = 'CORREO_REPOSITORY';

export interface Correo {
  destinatario: string;
  asunto: string;
  html: string;
}

export interface ICorreoRepository {
  enviar(correo: Correo): Promise<void>;
}
