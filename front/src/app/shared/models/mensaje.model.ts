// Refleja MensajeRespuesta (back/src/mensajes/dto/mensaje-respuesta.dto.ts):
// de cada participante solo llega lo que muestra el chat.
export interface ParticipanteMensaje {
  id: number;
  nombre: string;
  apellido: string;
  foto_url: string | null;
}

export interface Mensaje {
  id: number;
  texto: string;
  fecha: string;
  leido: boolean;
  fecha_lectura: string | null;
  contactoSuspendido?: boolean;
  origenUsuario: ParticipanteMensaje;
  destinoUsuario: ParticipanteMensaje;
  publicacion: { id: number; titulo: string; eliminada?: boolean };
}

// Una fila de la bandeja: GET /mensajes agrupa por publicación + interlocutor.
export interface ConversacionResumen {
  idPublicacion: number;
  idOtroUsuario: number;
  ultimoMensaje: Mensaje;
  cantidadNoLeidos: number;
}
