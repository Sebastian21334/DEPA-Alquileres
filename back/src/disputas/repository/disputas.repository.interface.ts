import type { Disputa } from '../entity/disputa.entity';
import type { EntityManager } from 'typeorm';

export const DISPUTAS_REPOSITORY = 'DISPUTAS_REPOSITORY';

export interface IDisputasRepository {
  conTransaccion<T>(operacion: (disputas: IDisputasRepository, transaccion: EntityManager) => Promise<T>): Promise<T>;
  enTransaccion(transaccion: EntityManager): IDisputasRepository;
  buscarPorContracargo(chargebackId: string): Promise<Disputa | null>;
  buscarPorId(id: number): Promise<Disputa | null>;
  listarAdministracion(): Promise<Disputa[]>;
  crear(datos: Partial<Disputa>): Disputa;
  guardar(disputa: Disputa): Promise<Disputa>;
}
