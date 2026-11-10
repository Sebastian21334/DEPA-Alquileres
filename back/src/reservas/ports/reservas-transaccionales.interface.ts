import type { EntityManager } from 'typeorm';
import type { IReservaRepository } from '../repository/reserva.repository.interface';

export const RESERVAS_TRANSACCIONALES = 'RESERVAS_TRANSACCIONALES';

/** Vista transaccional de Reserva para operaciones de otros casos de uso. */
export interface IReservasTransaccionales {
  conManager(manager: EntityManager): IReservaRepository;
}
