import type { IReclamosRepository } from '../repository/reclamos.repository.interface';
import type { IReservaRepository } from '../../reservas/repository/reserva.repository.interface';

export const RECLAMOS_UOW = 'RECLAMOS_UOW';

export interface ContextoReclamos {
  reclamos: IReclamosRepository;
  reservas: IReservaRepository;
}

/**
 * Transacción local del reclamo y la reserva. El reembolso conserva su propia
 * unit of work; el dinero se mueve fuera de esta transacción.
 */
export interface IReclamosUnitOfWork {
  ejecutar<T>(
    operacion: (contexto: ContextoReclamos) => Promise<T>,
  ): Promise<T>;
}
