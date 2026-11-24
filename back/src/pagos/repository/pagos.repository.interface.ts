import type { ParticipacionEnReserva } from '../../common/persistence/participacion-en-reserva';
import { Pago } from '../entity/pago.entity';
import type { DeepPartial, EntityManager } from 'typeorm';

export const PAGOS_REPOSITORY = 'PAGOS_REPOSITORY';

export interface IPagosRepository {
  contarSinConciliar(idUsuario: number, participacion: ParticipacionEnReserva, limiteCheckout: Date, transaccion: EntityManager, estadosFinales: string[]): Promise<number>;
  crear(datos: DeepPartial<Pago>): Pago;
  guardar(pago: Pago, transaccion?: EntityManager): Promise<Pago>;
  actualizar(id: number, datos: Partial<Pago>, transaccion?: EntityManager): Promise<void>;
  actualizarIntentoFallido(id: number, datos: Partial<Pago>): Promise<boolean>;
  buscarPorId(id: number): Promise<Pago | null>;
  buscarPorReferencia(referencia: string): Promise<Pago | null>;
  buscarPorReserva(idReserva: number, incluirReserva?: boolean, transaccion?: EntityManager): Promise<Pago | null>;
  buscarPorReservas(idsReserva: number[]): Promise<Pago[]>;
  buscarBloqueado(id: number, transaccion: EntityManager): Promise<Pago | null>;
}
