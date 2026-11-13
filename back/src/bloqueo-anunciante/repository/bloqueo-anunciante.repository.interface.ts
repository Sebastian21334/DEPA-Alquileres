import type { EntityManager } from 'typeorm';
import type { Usuario } from '../../usuarios/entity/usuario.entity';

export const BLOQUEO_ANUNCIANTE_REPOSITORY = 'BLOQUEO_ANUNCIANTE_REPOSITORY';

export interface IBloqueoAnuncianteRepository {
  conTransaccion<T>(operacion: (transaccion: EntityManager) => Promise<T>): Promise<T>;
  buscarBloqueado(idUsuario: number, transaccion: EntityManager): Promise<Usuario | null>;
  guardar(usuario: Usuario, transaccion: EntityManager): Promise<void>;
}
