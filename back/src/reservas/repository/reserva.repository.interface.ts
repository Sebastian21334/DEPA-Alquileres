import { Reserva } from '../entity/reserva.entity';

export const RESERVA_REPOSITORY = 'RESERVA_REPOSITORY';

export interface IReservaRepository {
  crear(datos: Partial<Reserva>): Reserva;
  guardar(reserva: Reserva): Promise<Reserva>;
  guardarVarias(reservas: Reserva[]): Promise<Reserva[]>;
  buscarPorId(id: number): Promise<Reserva | null>;
  buscarPorUsuario(idUsuario: number): Promise<Reserva[]>;
  buscarPorPublicacion(idPublicacion: number): Promise<Reserva[]>;
}
