import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mensaje } from '../entity/mensaje.entity';
import { IMensajeRepository } from './mensaje.repository.interface';

@Injectable()
export class MensajeRepository implements IMensajeRepository {
  constructor(
    @InjectRepository(Mensaje)
    private readonly repository: Repository<Mensaje>,
  ) {}

  crear(datos: Partial<Mensaje>): Mensaje {
    return this.repository.create(datos);
  }

  guardar(mensaje: Mensaje): Promise<Mensaje> {
    return this.repository.save(mensaje);
  }

  buscarConversacion(idPublicacion: number, idUsuarioA: number, idUsuarioB: number): Promise<Mensaje[]> {
    // El par puede estar en cualquier sentido (A->B o B->A), por eso el OR.
    return this.repository
      .createQueryBuilder('mensaje')
      .leftJoinAndSelect('mensaje.origenUsuario', 'origenUsuario')
      .leftJoinAndSelect('mensaje.destinoUsuario', 'destinoUsuario')
      .leftJoinAndSelect('mensaje.publicacion', 'publicacion')
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

  buscarPorUsuario(idUsuario: number): Promise<Mensaje[]> {
    return this.repository
      .createQueryBuilder('mensaje')
      .leftJoinAndSelect('mensaje.origenUsuario', 'origenUsuario')
      .leftJoinAndSelect('mensaje.destinoUsuario', 'destinoUsuario')
      .leftJoinAndSelect('mensaje.publicacion', 'publicacion')
      .where('mensaje.id_origen_usuario = :idUsuario OR mensaje.id_destino_usuario = :idUsuario', { idUsuario })
      .orderBy('mensaje.fecha', 'DESC') // el más nuevo primero, importante para armar la lista de conversaciones
      .getMany();
  }
}