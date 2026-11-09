import { Pago } from '../entity/pago.entity';

export const PAGOS_REPOSITORY = 'PAGOS_REPOSITORY';

export interface IPagosRepository {
  crear(datos: Partial<Pago>): Pago;
  guardar(pago: Pago): Promise<Pago>;
  buscarPorId(id: number): Promise<Pago | null>;
  buscarPorIdConBloqueo(id: number): Promise<Pago | null>;
  actualizarEstado(
    id: number,
    cambios: Partial<
      Pick<
        Pago,
        | 'status'
        | 'status_detail'
        | 'payment_id'
        | 'payment_method_id'
        | 'approved_at'
        | 'chargeback_id'
      >
    >,
  ): Promise<void>;
  buscarPorReferencia(referencia: string): Promise<Pago | null>;
  buscarPorReserva(idReserva: number): Promise<Pago | null>;
}
