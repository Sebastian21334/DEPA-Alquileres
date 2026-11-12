import type { EntityManager } from 'typeorm';
import type { Liquidacion } from '../entity/liquidacion.entity';

export const LIQUIDACION_REPOSITORY = 'LIQUIDACION_REPOSITORY';

export interface ILiquidacionRepository {
  conTransaccion<T>(operacion: (liquidaciones: ILiquidacionRepository, transaccion: EntityManager) => Promise<T>): Promise<T>;
  crear(datos: Partial<Liquidacion>): Liquidacion;
  guardar(liquidacion: Liquidacion, transaccion?: EntityManager): Promise<Liquidacion>;
  buscarPorReserva(idReserva: number, transaccion?: EntityManager): Promise<Liquidacion | null>;
  buscarPorReservaConBloqueo(idReserva: number, transaccion?: EntityManager): Promise<Liquidacion | null>;
  buscarAdministracion(): Promise<Liquidacion[]>;
  buscarPorId(id: number, transaccion?: EntityManager): Promise<Liquidacion | null>;
}
