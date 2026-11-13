import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type EntityManager } from 'typeorm';
import { Usuario } from '../../usuarios/entity/usuario.entity';
import type { IBloqueoAnuncianteRepository } from './bloqueo-anunciante.repository.interface';

@Injectable()
export class BloqueoAnuncianteRepository implements IBloqueoAnuncianteRepository {
  constructor(@InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>) {}

  conTransaccion<T>(operacion: (transaccion: EntityManager) => Promise<T>): Promise<T> {
    return this.usuarios.manager.transaction(operacion);
  }

  buscarBloqueado(idUsuario: number, transaccion: EntityManager): Promise<Usuario | null> {
    return transaccion.getRepository(Usuario).createQueryBuilder('usuario')
      .addSelect('usuario.bloqueoDetalle')
      .leftJoinAndSelect('usuario.rol', 'rol')
      .where('usuario.id = :idUsuario', { idUsuario })
      .setLock('pessimistic_write', undefined, ['usuario'])
      .getOne();
  }

  async guardar(usuario: Usuario, transaccion: EntityManager): Promise<void> {
    await transaccion.getRepository(Usuario).update(usuario.id, {
      bloqueado: usuario.bloqueado,
      bloqueoDetalle: usuario.bloqueoDetalle,
    });
  }
}
