import { Pago } from '../entity/pago.entity';

export const PAGOS_REPOSITORY = 'PAGOS_REPOSITORY';

export interface IPagosRepository {
  crear(datos: Partial<Pago>): Pago;
  guardar(pago: Pago): Promise<Pago>;
  buscarPorReferencia(referencia: string): Promise<Pago | null>;
  buscarPorReserva(idReserva: number): Promise<Pago | null>;
}
