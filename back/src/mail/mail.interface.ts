export interface ConversionEmailDetalle {
  importeOrigen: number;
  monedaOrigen: string;
  cotizacionVenta: number;
  fechaFuente: string;
  proveedor: string;
}

export interface ReservaEmailDetalle {
  conversion?: ConversionEmailDetalle;
  idReserva: number;
  nombreDestinatario: string;
  titulo: string;
  direccion: string;
  fechaInicio: Date;
  fechaFin: Date;
  cantidadDias: number;
  monto: number;
  moneda: string;
  nombreContraparte: string;
  emailContraparte?: string | null;
  telefonoContraparte?: string | null;
}

export interface ReprogramacionEmailDetalle {
  conversion?: ConversionEmailDetalle;
  idReserva: number;
  nombreAnunciante: string;
  nombreInquilino: string;
  titulo: string;
  inicioAnterior: string;
  finAnterior: string;
  inicioNuevo: string;
  finNuevo: string;
  cantidadDias: number;
  monto: number;
  moneda: string;
}

export interface IMailService {
  enviarReprogramacionReserva(
    destinatario: string,
    detalle: ReprogramacionEmailDetalle,
  ): Promise<void>;
  enviarBajaPublicacion(
    destinatario: string,
    titulo: string,
    motivo: string,
  ): Promise<void>;
  enviarVerificacion(destinatario: string, token: string): Promise<void>;
  enviarRecuperacion(destinatario: string, token: string): Promise<void>;
  enviarResultadoVerificacion(
    destinatario: string,
    aprobada: boolean,
    motivo?: string,
  ): Promise<void>;
  enviarReservaConfirmada(
    destinatario: string,
    detalle: ReservaEmailDetalle,
  ): Promise<void>;
  enviarNuevaReserva(
    destinatario: string,
    detalle: ReservaEmailDetalle,
  ): Promise<void>;
  enviarMensajeNuevo(
    destinatario: string,
    nombreDestinatario: string,
    nombreRemitente: string,
    titulo: string,
    idPublicacion: number,
  ): Promise<void>;
  enviarSolicitudAnunciante(destinatario: string): Promise<void>;
  enviarSolicitudParaRevision(
    destinatarios: string[],
    nombreSolicitante: string,
    emailSolicitante: string,
  ): Promise<void>;
  enviarCambioBloqueo(
    destinatario: string,
    bloqueado: boolean,
    motivo?: string,
  ): Promise<void>;
}

export const MAIL_SERVICE = 'MAIL_SERVICE';
