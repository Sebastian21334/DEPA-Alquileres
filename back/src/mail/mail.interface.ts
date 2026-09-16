export interface IMailService {
  enviarVerificacion(destinatario: string, token: string): Promise<void>;
  enviarRecuperacion(destinatario: string, token: string): Promise<void>;
  enviarResultadoVerificacion(
    destinatario: string,
    aprobada: boolean,
    motivo?: string,
  ): Promise<void>;
  enviarReservaConfirmada(destinatario: string, titulo: string, fechaInicio: Date, fechaFin: Date): Promise<void>;
  enviarNuevaReserva(destinatario: string, titulo: string, nombreInquilino: string, fechaInicio: Date, fechaFin: Date): Promise<void>;
  enviarMensajeNuevo(destinatario: string, nombreRemitente: string, titulo: string): Promise<void>;
  enviarSolicitudAnunciante(destinatario: string): Promise<void>;
  enviarSolicitudParaRevision(destinatarios: string[], nombreSolicitante: string, emailSolicitante: string): Promise<void>;
  enviarCambioBloqueo(destinatario: string, bloqueado: boolean, motivo?: string): Promise<void>;
}

export const MAIL_SERVICE = 'MAIL_SERVICE';
