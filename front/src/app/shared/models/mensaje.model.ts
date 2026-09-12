import { Usuario } from './usuario.model';

// Refleja la entidad Mensaje (back/src/mensajes/entity/mensaje.entity.ts).
export interface Mensaje {
  id: number;
  texto: string;
  fecha: string;
  origenUsuario: Usuario;
  destinoUsuario: Usuario;
  publicacion: { id: number; titulo: string };
}

// Una fila de la bandeja: GET /mensajes agrupa por publicación + interlocutor.
export interface ConversacionResumen {
  idPublicacion: number;
  idOtroUsuario: number;
  ultimoMensaje: Mensaje;
}
