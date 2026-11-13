import type { EntityManager } from 'typeorm';
import type { SolicitudCancelacion } from '../entity/solicitud-cancelacion.entity';

export const CANCELACIONES_REPOSITORY = 'CANCELACIONES_REPOSITORY';

export interface ICancelacionesRepository {
  conTransaccion<T>(operacion: (cancelaciones: ICancelacionesRepository, transaccion: EntityManager) => Promise<T>): Promise<T>;
  crear(datos: Partial<SolicitudCancelacion>): SolicitudCancelacion;
  guardar(solicitud: SolicitudCancelacion): Promise<SolicitudCancelacion>;
  buscarParaResolver(id: number, idReserva: number): Promise<SolicitudCancelacion | null>;
  buscarActiva(idReserva: number, estado: string): Promise<SolicitudCancelacion | null>;
  listarPorEstado(estado: string): Promise<SolicitudCancelacion[]>;
}
