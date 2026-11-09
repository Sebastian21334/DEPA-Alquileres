import type { Reclamo } from '../entity/reclamo.entity';
import type { ReclamoEvidencia } from '../entity/reclamo-evidencia.entity';
import type { ReclamoMensaje } from '../entity/reclamo-mensaje.entity';

export const RECLAMOS_REPOSITORY = 'RECLAMOS_REPOSITORY';

export interface IReclamosRepository {
  crear(datos: Partial<Reclamo>): Reclamo;
  guardar(reclamo: Reclamo): Promise<Reclamo>;
  buscarPorId(id: number): Promise<Reclamo | null>;
  buscarAbiertoPorReserva(idReserva: number): Promise<Reclamo | null>;
  buscarPorUsuario(idUsuario: number): Promise<Reclamo[]>;
  listarAdministracion(): Promise<Reclamo[]>;
  contarEvidencias(idReclamo: number): Promise<number>;
  crearEvidencia(datos: Partial<ReclamoEvidencia>): ReclamoEvidencia;
  guardarEvidencia(evidencia: ReclamoEvidencia): Promise<ReclamoEvidencia>;
  buscarEvidencia(
    idReclamo: number,
    idEvidencia: number,
  ): Promise<ReclamoEvidencia | null>;
  crearMensaje(datos: Partial<ReclamoMensaje>): ReclamoMensaje;
  guardarMensaje(mensaje: ReclamoMensaje): Promise<ReclamoMensaje>;
}
