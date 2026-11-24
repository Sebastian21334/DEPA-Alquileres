// Contratos de respuesta del chat: de cada participante solo viaja lo que muestra la interfaz.
export interface ParticipanteMensaje {
  id: number;
  nombre: string;
  apellido: string;
  foto_url: string | null;
}

export interface PublicacionMensaje {
  id: number;
  titulo: string;
  eliminada: boolean;
}

export interface MensajeRespuesta {
  id: number;
  texto: string;
  fecha: Date;
  leido: boolean;
  fecha_lectura: Date | null;
  origenUsuario: ParticipanteMensaje;
  destinoUsuario: ParticipanteMensaje;
  publicacion: PublicacionMensaje;
  contactoSuspendido?: boolean;
}

// Una fila de la bandeja de entrada por publicación e interlocutor.
export interface ConversacionResumen {
  idPublicacion: number;
  idOtroUsuario: number;
  ultimoMensaje: MensajeRespuesta;
  cantidadNoLeidos: number;
}
