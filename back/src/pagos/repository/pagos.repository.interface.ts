import { Pago } from '../entity/pago.entity';
import type { EntityManager } from 'typeorm';

export const PAGOS_REPOSITORY = 'PAGOS_REPOSITORY';

export interface IPagosRepository {
  crear(datos: Partial<Pago>): Pago;
  guardar(pago: Pago, transaccion?: EntityManager): Promise<Pago>;
  buscarPorId(id: number): Promise<Pago | null>;
  buscarPorReferencia(referencia: string): Promise<Pago | null>;
  buscarPorReserva(idReserva: number, incluirReserva?: boolean): Promise<Pago | null>;
  buscarBloqueado(id: number, transaccion: EntityManager): Promise<Pago | null>;
}
