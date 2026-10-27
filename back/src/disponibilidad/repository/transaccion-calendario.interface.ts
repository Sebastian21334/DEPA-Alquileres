import type { IFechaRepository } from './fecha.repository.interface';
import type { IReservaRepository } from '../../reservas/repository/reserva.repository.interface';

export interface RepositoriosCalendario {
  fechas: IFechaRepository;
  reservas: IReservaRepository;
}

export interface ITransaccionCalendario {
  ejecutar<T>(
    operacion: (repositorios: RepositoriosCalendario) => Promise<T>,
  ): Promise<T>;
}

export const TRANSACCION_CALENDARIO = 'TRANSACCION_CALENDARIO';
