import type { IDisputasRepository } from '../repository/disputas.repository.interface';
import type { IReservaRepository } from '../../reservas/repository/reserva.repository.interface';
import type { IPagosDevoluciones } from '../../pagos/ports/pagos-transaccionales.interface';

export const DISPUTAS_UOW = 'DISPUTAS_UOW';

export interface ContextoDisputas {
  disputas: IDisputasRepository;
  reservas: IReservaRepository;
  pagos: IPagosDevoluciones;
}

/**
 * Transacción local de la disputa, el pago y la reserva. El reembolso que
 * pueda derivarse conserva su propia unit of work.
 */
export interface IDisputasUnitOfWork {
  ejecutar<T>(
    operacion: (contexto: ContextoDisputas) => Promise<T>,
  ): Promise<T>;
}
