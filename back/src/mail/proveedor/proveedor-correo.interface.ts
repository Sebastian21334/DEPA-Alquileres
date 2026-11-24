export const PROVEEDOR_CORREO = 'PROVEEDOR_CORREO';

export interface Correo {
  destinatario: string;
  asunto: string;
  html: string;
}

/** Servicio externo que entrega los correos ya armados. */
export interface IProveedorCorreo {
  enviar(correo: Correo): Promise<void>;
}
