import type { EntityManager } from 'typeorm';
import type { Liquidacion, PagoAnuncianteRegistrado } from '../entity/liquidacion.entity';

export const LIQUIDACION_REPOSITORY = 'LIQUIDACION_REPOSITORY';

export interface ILiquidacionRepository {
  buscarPorReservas(ids: number[]): Promise<Liquidacion[]>;
  listarPorEstados(estados: string[]): Promise<Liquidacion[]>;
  listarReservasPendientesDeAviso(estadoLiquidacion: string, estadoPago: string, fechaFinLimite: string): Promise<number[]>;
  listarIngresosNoVerificadosVencidos(estados: { retenido: string; revision: string; maxIntentosCodigo: number }, estadoPago: string, fechaFinLimite: string): Promise<number[]>;
  listarPagosRegistrados(estadoPagado: string, propietario?: { idUsuario: number; idPublicacion?: number }): Promise<Liquidacion[]>;
  crear(datos: Partial<Liquidacion>): Liquidacion;
  guardar(liquidacion: Liquidacion, transaccion?: EntityManager): Promise<Liquidacion>;
  buscarPorReserva(idReserva: number, transaccion?: EntityManager): Promise<Liquidacion | null>;
  buscarPorReservaConBloqueo(idReserva: number, transaccion?: EntityManager): Promise<Liquidacion | null>;
  buscarPagosConAnunciante(idReserva: number): Promise<{ pagos: PagoAnuncianteRegistrado[]; idAnunciante: number | null } | null>;
}
