import type { Reembolso } from '../entity/reembolso.entity';
import type { EntityManager } from 'typeorm';

export const REEMBOLSOS_REPOSITORY = 'REEMBOLSOS_REPOSITORY';

export interface IReembolsosRepository {
  conTransaccion<T>(operacion: (repositorio: IReembolsosRepository, transaccion: EntityManager) => Promise<T>): Promise<T>;
  crear(datos: Partial<Reembolso>): Reembolso;
  guardar(reembolso: Reembolso): Promise<Reembolso>;
  buscarPorId(id: number): Promise<Reembolso | null>;
  buscarPorIdempotencyKey(clave: string): Promise<Reembolso | null>;
  buscarPorReferenciaExterna(referencia: string): Promise<Reembolso | null>;
  buscarPorPago(idPago: number): Promise<Reembolso[]>;
  buscarRegistro(id: number, opciones?: { bloquear?: boolean; idPago?: boolean }): Promise<Reembolso | null>;
  buscarPorReserva(idReserva: number): Promise<Reembolso[]>;
  buscarPendientesPorPago(idPago: number): Promise<Reembolso[]>;
  buscarPendientesConciliacion(): Promise<Reembolso[]>;
  listarAdministracion(): Promise<Reembolso[]>;
}
