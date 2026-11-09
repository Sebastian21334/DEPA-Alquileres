import type { EntityManager } from 'typeorm';
import type { Pago } from '../entity/pago.entity';

export const PAGOS_TRANSACCIONALES = 'PAGOS_TRANSACCIONALES';

/** Operaciones de Pago que participan de una transacción de devoluciones. */
export interface IPagosDevoluciones {
  buscarPorIdConBloqueo(id: number): Promise<Pago | null>;
  guardar(pago: Pago): Promise<Pago>;
}

/** Fábrica de la vista transaccional de Pago para una Unit of Work. */
export interface IPagosTransaccionales {
  conManager(manager: EntityManager): IPagosDevoluciones;
}
