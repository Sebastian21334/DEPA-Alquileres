import type { ChatAbierto } from '../../core/services/chat.service';
import { ConversacionResumen, ParticipanteMensaje } from '../models/mensaje.model';

/** Devuelve el participante que no es el usuario autenticado. */
export function interlocutor(conversacion: ConversacionResumen): ParticipanteMensaje {
  const mensaje = conversacion.ultimoMensaje;
  return mensaje.origenUsuario.id === conversacion.idOtroUsuario
    ? mensaje.origenUsuario
    : mensaje.destinoUsuario;
}

export function nombreInterlocutor(conversacion: ConversacionResumen): string {
  const usuario = interlocutor(conversacion);
  return [usuario.nombre, usuario.apellido].filter(Boolean).join(' ').trim();
}

/** Datos para abrir la ventana de chat de una conversación de la bandeja. */
export function chatDeConversacion(conversacion: ConversacionResumen): Omit<ChatAbierto, 'minimizado'> {
  return {
    idPublicacion: conversacion.idPublicacion,
    idOtroUsuario: conversacion.idOtroUsuario,
    titulo: conversacion.ultimoMensaje.publicacion.titulo,
    nombreOtro: nombreInterlocutor(conversacion),
    fotoOtro: interlocutor(conversacion).foto_url ?? null,
  };
}
