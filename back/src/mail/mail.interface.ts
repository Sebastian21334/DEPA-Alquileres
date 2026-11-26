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

/** Avisos sobre la cuenta: alta, baja, acceso y bloqueos. */
export interface IMailCuenta {
  enviarConfirmacionBaja(destinatario: string, token: string, origen?: string): Promise<void>;
  enviarVerificacion(destinatario: string, token: string, origen?: string): Promise<void>;
  enviarReactivacion(destinatario: string, token: string, origen?: string): Promise<void>;
  enviarRecuperacion(destinatario: string, token: string): Promise<void>;
  enviarCambioContrasenia(destinatario: string): Promise<void>;
  enviarCambioBloqueo(destinatario: string, bloqueado: boolean, motivo?: string, accesoLimitado?: boolean): Promise<void>;
}

/** Quién recibe un aviso de reserva. */
export type DestinoAvisoReserva = 'inquilino' | 'anunciante' | 'admin';

/** De qué trata un aviso de reserva: decide a qué pantalla lleva su botón. */
export type TemaAvisoReserva = 'reserva' | 'reembolso' | 'reclamo' | 'liquidacion' | 'pago-liquidacion';

/** Avisos a las partes de una reserva. */
export interface IMailReservas {
  enviarAvisoReserva(destinatario: string, idReserva: number, asunto: string, mensaje: string, panel: DestinoAvisoReserva, tema: TemaAvisoReserva): Promise<void>;
  enviarReprogramacionReserva(destinatario: string, detalle: ReprogramacionEmailDetalle): Promise<void>;
  enviarReservaConfirmada(destinatario: string, detalle: ReservaEmailDetalle): Promise<void>;
  enviarNuevaReserva(destinatario: string, detalle: ReservaEmailDetalle): Promise<void>;
}

/** Avisos al anunciante sobre sus publicaciones. */
export interface IMailPublicaciones {
  enviarBajaPublicacion(destinatario: string, titulo: string, motivo: string): Promise<void>;
  enviarPublicacionActiva(destinatario: string, titulo: string, idPublicacion: number): Promise<void>;
  enviarReactivacionPublicacion(destinatario: string, titulo: string): Promise<void>;
}

export interface IMailMensajes {
  enviarMensajeNuevo(destinatario: string, nombreDestinatario: string, nombreRemitente: string, titulo: string, idPublicacion: number, idRemitente: number): Promise<void>;
}

/** Avisos de la solicitud para ser anunciante y su revisión. */
export interface IMailVerificacionAnunciante {
  enviarResultadoVerificacion(destinatario: string, aprobada: boolean, motivo?: string): Promise<void>;
  enviarSolicitudAnunciante(destinatario: string): Promise<void>;
  enviarSolicitudParaRevision(destinatarios: string[], nombreSolicitante: string, emailSolicitante: string): Promise<void>;
}

/** Todos los avisos; lo implementa MailService y se inyecta con MAIL_SERVICE. */
export interface IMailService extends IMailCuenta, IMailReservas, IMailPublicaciones, IMailMensajes, IMailVerificacionAnunciante {}

export const MAIL_SERVICE = 'MAIL_SERVICE';
