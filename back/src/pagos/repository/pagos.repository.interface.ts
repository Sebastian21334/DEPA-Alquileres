import { Pago } from '../entity/pago.entity';
import type { DeepPartial, EntityManager } from 'typeorm';

export const PAGOS_REPOSITORY = 'PAGOS_REPOSITORY';

export interface IPagosRepository {
  crear(datos: DeepPartial<Pago>): Pago;
  guardar(pago: Pago, transaccion?: EntityManager): Promise<Pago>;
  actualizar(id: number, datos: Partial<Pago>, transaccion?: EntityManager): Promise<void>;
  buscarPorId(id: number): Promise<Pago | null>;
  buscarPorReferencia(referencia: string): Promise<Pago | null>;
  buscarPorReserva(idReserva: number, incluirReserva?: boolean, transaccion?: EntityManager): Promise<Pago | null>;
  buscarBloqueado(id: number, transaccion: EntityManager): Promise<Pago | null>;
}
