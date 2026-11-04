import type { Reembolso } from '../entity/reembolso.entity';
import type { Pago } from '../../pagos/entity/pago.entity';

export const REEMBOLSOS_REPOSITORY = 'REEMBOLSOS_REPOSITORY';

export interface IReembolsosRepository {
  crear(datos: Partial<Reembolso>): Reembolso;
  guardar(reembolso: Reembolso): Promise<Reembolso>;
  buscarPorId(id: number): Promise<Reembolso | null>;
  buscarPorIdempotencyKey(clave: string): Promise<Reembolso | null>;
  buscarPorReferenciaExterna(referencia: string): Promise<Reembolso | null>;
  buscarPorPago(idPago: number): Promise<Reembolso[]>;
  buscarPagoPorReserva(idReserva: number): Promise<Pago | null>;
  buscarPorReserva(idReserva: number): Promise<Reembolso[]>;
  sumarImportesReservados(idPago: number): Promise<number>;
  buscarPendientesConciliacion(): Promise<Reembolso[]>;
  listarAdministracion(): Promise<Reembolso[]>;
}
