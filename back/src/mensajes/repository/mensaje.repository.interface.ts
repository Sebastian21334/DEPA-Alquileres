import { Mensaje } from '../entity/mensaje.entity';

export interface IMensajeRepository {
  crear(datos: Partial<Mensaje>): Mensaje;
  guardar(mensaje: Mensaje): Promise<Mensaje>;
  // Todos los mensajes de UNA conversación puntual (misma publicación + mismo par de usuarios)
  buscarConversacion(idPublicacion: number, idUsuarioA: number, idUsuarioB: number): Promise<Mensaje[]>;
  // Todos los mensajes donde el usuario participa (como origen o destino), sin importar publicación ni interlocutor
  buscarPorUsuario(idUsuario: number): Promise<Mensaje[]>;
}

export const MENSAJE_REPOSITORY = 'MENSAJE_REPOSITORY';