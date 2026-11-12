import type { Reclamo } from '../entity/reclamo.entity';
import type { ReclamoEvidencia } from '../entity/reclamo-evidencia.entity';
import type { ReclamoMensaje } from '../entity/reclamo-mensaje.entity';
import type { Usuario } from '../../usuarios/entity/usuario.entity';
import type { EntityManager } from 'typeorm';

export const RECLAMOS_REPOSITORY = 'RECLAMOS_REPOSITORY';

export interface IReclamosRepository {
  enTransaccion(transaccion: EntityManager): IReclamosRepository;
  existeAbierto(idReserva: number): Promise<boolean>;
  guardar(reclamo: Partial<Reclamo>): Promise<Reclamo>;
  listarPorParticipante(idUsuario: number): Promise<Reclamo[]>;
  listarAdministracion(): Promise<Reclamo[]>;
  buscarPorId(id: number): Promise<Reclamo | null>;
  contarEvidencias(idReclamo: number): Promise<number>;
  guardarEvidencia(evidencia: Partial<ReclamoEvidencia>): Promise<ReclamoEvidencia>;
  buscarEvidencia(idReclamo: number, idEvidencia: number): Promise<ReclamoEvidencia | null>;
  guardarMensaje(mensaje: Omit<Partial<ReclamoMensaje>, 'autor'> & { autor: Pick<Usuario, 'id'> }): Promise<ReclamoMensaje>;
}
