import type { EntityManager } from 'typeorm';
import type { Liquidacion } from '../entity/liquidacion.entity';

export const LIQUIDACION_REPOSITORY = 'LIQUIDACION_REPOSITORY';

export interface ILiquidacionRepository {
  buscarPorReservas(ids: number[]): Promise<Liquidacion[]>;
  listarPorEstados(estados: string[]): Promise<Liquidacion[]>;
  crear(datos: Partial<Liquidacion>): Liquidacion;
  guardar(liquidacion: Liquidacion, transaccion?: EntityManager): Promise<Liquidacion>;
  buscarPorReserva(idReserva: number, transaccion?: EntityManager): Promise<Liquidacion | null>;
  buscarPorReservaConBloqueo(idReserva: number, transaccion?: EntityManager): Promise<Liquidacion | null>;
}
