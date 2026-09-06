import { Fecha } from '../entity/fecha.entity';

export interface IFechaRepository {
  crear(datos: Partial<Fecha>): Fecha;
  guardar(fecha: Fecha): Promise<Fecha>;
  guardarVarias(fechas: Fecha[]): Promise<Fecha[]>;
  buscarPorId(id: number): Promise<Fecha | null>;
  buscarPorPublicacion(idPublicacion: number): Promise<Fecha[]>;
  buscarPorRango(idPublicacion: number, fechaInicio: Date, fechaFin: Date): Promise<Fecha[]>;
  eliminar(id: number): Promise<number>; // devuelve la cantidad de filas afectadas
}

export const FECHA_REPOSITORY = 'FECHA_REPOSITORY';