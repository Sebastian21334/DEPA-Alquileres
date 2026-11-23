import type { Reclamo } from '../entity/reclamo.entity';
import type { ReclamoEvidencia } from '../entity/reclamo-evidencia.entity';
import type { ReclamoMensaje } from '../entity/reclamo-mensaje.entity';
import type { Usuario } from '../../usuarios/entity/usuario.entity';
import type { EntityManager } from 'typeorm';

export const RECLAMOS_REPOSITORY = 'RECLAMOS_REPOSITORY';

export interface IReclamosRepository {
  enTransaccion(transaccion: EntityManager): IReclamosRepository;
  /** Abre una transacción propia del reclamo (T49: mensaje e imágenes se guardan juntos). */
  transaccion<T>(trabajo: (reclamos: IReclamosRepository) => Promise<T>): Promise<T>;
  /** Bloquea la fila del reclamo hasta el fin de la transacción, para controlar el cupo de imágenes. */
  bloquear(idReclamo: number): Promise<void>;
  existeAbierto(idReserva: number, estados: string[], excluirCategoria?: Reclamo['categoria']): Promise<boolean>;
  guardar(reclamo: Partial<Reclamo>): Promise<Reclamo>;
  listarPorParticipante(idUsuario: number): Promise<Reclamo[]>;
  listarAdministracion(): Promise<Reclamo[]>;
  buscarPorId(id: number): Promise<Reclamo | null>;
  contarEvidencias(idReclamo: number): Promise<number>;
  guardarEvidencias(evidencias: Partial<ReclamoEvidencia>[]): Promise<ReclamoEvidencia[]>;
  guardarMensaje(mensaje: Omit<Partial<ReclamoMensaje>, 'autor'> & { autor: Pick<Usuario, 'id'> }): Promise<ReclamoMensaje>;
}
