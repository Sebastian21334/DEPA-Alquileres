import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type EntityManager } from 'typeorm';
import { Mensaje } from '../entity/mensaje.entity';
import { IMensajeRepository } from './mensaje.repository.interface';

@Injectable()
export class MensajeRepository implements IMensajeRepository {
  constructor(@InjectRepository(Mensaje) private readonly repository: Repository<Mensaje>) {}

  conTransaccion<T>(operacion: (mensajes: IMensajeRepository, transaccion: EntityManager) => Promise<T>): Promise<T> {
    return this.repository.manager.transaction((transaccion) =>
      operacion(new MensajeRepository(transaccion.getRepository(Mensaje)), transaccion),
    );
  }

  crear(datos: Partial<Mensaje>): Mensaje {
    return this.repository.create(datos);
  }

  guardar(mensaje: Mensaje): Promise<Mensaje> {
    return this.repository.save(mensaje);
  }

  existeConversacion(idPublicacion: number, idUsuarioA: number, idUsuarioB: number): Promise<boolean> {
    return this.repository.exists({
      where: [
        {
          publicacion: { id: idPublicacion },
          origenUsuario: { id: idUsuarioA },
          destinoUsuario: { id: idUsuarioB },
        },
        {
          publicacion: { id: idPublicacion },
          origenUsuario: { id: idUsuarioB },
          destinoUsuario: { id: idUsuarioA },
        },
      ],
    });
  }

  buscarConversacion(idPublicacion: number, idUsuarioA: number, idUsuarioB: number): Promise<Mensaje[]> {
    // El par puede estar en cualquier sentido (A->B o B->A), por eso el OR.
    return this.consultaConParticipantes()
      .where('mensaje.id_publicacion = :idPublicacion', { idPublicacion })
      .andWhere(
        // Los dos términos representan ambos sentidos de la misma conversación.
        '((mensaje.id_origen_usuario = :idA AND mensaje.id_destino_usuario = :idB) OR ' +
          '(mensaje.id_origen_usuario = :idB AND mensaje.id_destino_usuario = :idA))',
        { idA: idUsuarioA, idB: idUsuarioB },
      )
      .orderBy('mensaje.fecha', 'ASC')
      .getMany();
  }

  async buscarUltimosPorConversacion(idUsuario: number): Promise<{ mensaje: Mensaje; noLeidos: number }[]> {
    // La base resuelve una fila por publicación e interlocutor: su último mensaje y los no leídos que recibió el usuario.
    const filas: { id: number; noLeidos: number }[] = await this.repository.query(
      `SELECT DISTINCT ON (c.id_publicacion, c.otro) c.id_mensaje AS id, c.no_leidos::int AS "noLeidos"
       FROM (
         SELECT m.id_mensaje, m.id_publicacion, m.fecha, par.otro,
           count(*) FILTER (WHERE m.id_destino_usuario = $1 AND NOT m.leido)
             OVER (PARTITION BY m.id_publicacion, par.otro) AS no_leidos
         FROM public.mensaje m
         CROSS JOIN LATERAL (SELECT CASE WHEN m.id_origen_usuario = $1 THEN m.id_destino_usuario ELSE m.id_origen_usuario END AS otro) par
         WHERE m.id_origen_usuario = $1 OR m.id_destino_usuario = $1
       ) c
       ORDER BY c.id_publicacion, c.otro, c.fecha DESC, c.id_mensaje DESC`,
      [idUsuario],
    );
    if (!filas.length) return [];
    const noLeidos = new Map(filas.map((fila) => [Number(fila.id), Number(fila.noLeidos)]));
    const mensajes = await this.consultaConParticipantes()
      .where('mensaje.id IN (:...ids)', { ids: [...noLeidos.keys()] })
      .orderBy('mensaje.fecha', 'DESC')
      .addOrderBy('mensaje.id', 'DESC')
      .getMany();
    return mensajes.map((mensaje) => ({ mensaje, noLeidos: noLeidos.get(mensaje.id) ?? 0 }));
  }

  private consultaConParticipantes() {
    // De cada participante se lee lo que muestra el chat y si la cuenta sigue activa para suspender el contacto.
    return this.repository
      .createQueryBuilder('mensaje')
      .leftJoin('mensaje.origenUsuario', 'origenUsuario')
      .leftJoin('mensaje.destinoUsuario', 'destinoUsuario')
      .leftJoin('mensaje.publicacion', 'publicacion')
      .addSelect(['origenUsuario.id', 'origenUsuario.nombre', 'origenUsuario.apellido', 'origenUsuario.foto_url', 'origenUsuario.activa'])
      .addSelect(['destinoUsuario.id', 'destinoUsuario.nombre', 'destinoUsuario.apellido', 'destinoUsuario.foto_url', 'destinoUsuario.activa'])
      .addSelect(['publicacion.id', 'publicacion.titulo', 'publicacion.eliminada']);
  }

  async marcarConversacionComoLeida(idPublicacion: number, idRemitente: number, idDestinatario: number): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(Mensaje)
      .set({ leido: true, fecha_lectura: new Date() })
      .where('id_publicacion = :idPublicacion', { idPublicacion })
      .andWhere('id_origen_usuario = :idRemitente', { idRemitente })
      .andWhere('id_destino_usuario = :idDestinatario', { idDestinatario })
      .andWhere('leido = false')
      .execute();
  }
}
