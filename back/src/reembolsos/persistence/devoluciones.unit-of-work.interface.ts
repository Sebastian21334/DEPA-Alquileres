import type { IPagosDevoluciones } from '../../pagos/ports/pagos-transaccionales.interface';
import type { IReembolsosRepository } from '../repository/reembolsos.repository.interface';

export const DEVOLUCIONES_UOW = 'DEVOLUCIONES_UOW';

export interface ContextoDevoluciones {
  reembolsos: IReembolsosRepository;
  pagos: IPagosDevoluciones;
}

/**
 * Unit of Work del agregado de devoluciones. Permite que el service coordine
 * Reembolso y Pago en una misma transacción sin inyectar DataSource.
 */
export interface IDevolucionesUnitOfWork {
  ejecutar<T>(
    operacion: (contexto: ContextoDevoluciones) => Promise<T>,
  ): Promise<T>;
}
