import type { Reembolso } from '../entity/reembolso.entity';
import type { EntityManager } from 'typeorm';

export const REEMBOLSOS_REPOSITORY = 'REEMBOLSOS_REPOSITORY';

export interface IReembolsosRepository {
  conTransaccion<T>(operacion: (repositorio: IReembolsosRepository, transaccion: EntityManager) => Promise<T>): Promise<T>;
  enTransaccion(transaccion: EntityManager): IReembolsosRepository;
  crear(datos: Partial<Reembolso>): Reembolso;
  guardar(reembolso: Reembolso): Promise<Reembolso>;
  actualizar(id: number, datos: Partial<Reembolso>): Promise<void>;
  buscarPorId(id: number): Promise<Reembolso | null>;
  buscarPorIdempotencyKey(clave: string): Promise<Reembolso | null>;
  buscarPorReferenciaExterna(referencia: string): Promise<Reembolso | null>;
  buscarPorPago(idPago: number): Promise<Reembolso[]>;
  buscarPorIdExterno(id: string): Promise<Reembolso | null>;
  buscarRegistro(id: number, opciones?: { bloquear?: boolean; idsRelaciones?: boolean }): Promise<Reembolso | null>;
  buscarPorReserva(idReserva: number): Promise<Reembolso[]>;
  buscarPorReservasConEstados(idsReserva: number[], estados: string[]): Promise<Reembolso[]>;
  sumarImportesReservados(idPago: number, estados: string[]): Promise<number>;
  actualizarEnTransaccion(id: number, operacion: (reembolso: Reembolso) => void | Promise<void>): Promise<Reembolso | null>;
  buscarPendientesConciliacion(estados: string[], hasta: Date): Promise<Reembolso[]>;
  buscarPendientesAplicacion(estado: string, desdeId: number): Promise<Reembolso[]>;
  buscarPorOrigen(origen: Reembolso['origen'], referencia: string): Promise<Reembolso | null>;
  listarAdministracion(): Promise<Reembolso[]>;
}
