import { Mensaje } from '../entity/mensaje.entity';
import type { EntityManager } from 'typeorm';

export interface IMensajeRepository {
  conTransaccion<T>(operacion: (mensajes: IMensajeRepository, transaccion: EntityManager) => Promise<T>): Promise<T>;
  crear(datos: Partial<Mensaje>): Mensaje;
  guardar(mensaje: Mensaje): Promise<Mensaje>;
  existeConversacion(idPublicacion: number, idUsuarioA: number, idUsuarioB: number): Promise<boolean>;
  // Todos los mensajes de UNA conversación puntual (misma publicación + mismo par de usuarios)
  buscarConversacion(idPublicacion: number, idUsuarioA: number, idUsuarioB: number): Promise<Mensaje[]>;
  // El último mensaje de cada conversación del usuario y cuántos recibió sin leer, del más reciente al más viejo
  buscarUltimosPorConversacion(idUsuario: number): Promise<{ mensaje: Mensaje; noLeidos: number }[]>;
  marcarConversacionComoLeida(idPublicacion: number, idRemitente: number, idDestinatario: number): Promise<void>;
}

export const MENSAJE_REPOSITORY = 'MENSAJE_REPOSITORY';
