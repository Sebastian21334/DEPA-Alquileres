import { ConversacionResumen } from '../models/mensaje.model';
import { Usuario } from '../models/usuario.model';

/** Devuelve el participante que no es el usuario autenticado. */
export function interlocutor(conversacion: ConversacionResumen): Usuario {
  const mensaje = conversacion.ultimoMensaje;
  return mensaje.origenUsuario.id === conversacion.idOtroUsuario
    ? mensaje.origenUsuario
    : mensaje.destinoUsuario;
}

export function nombreInterlocutor(conversacion: ConversacionResumen): string {
  const usuario = interlocutor(conversacion);
  return [usuario.nombre, usuario.apellido].filter(Boolean).join(' ').trim();
}
