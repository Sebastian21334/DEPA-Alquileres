import { Imagen } from '../entity/imagen.entity';
import type { EntityManager } from 'typeorm';

export interface IImagenesRepository {
  crear(datos: Partial<Imagen>): Imagen;
  conTransaccion<T>(operacion: (imagenes: IImagenesRepository, transaccion: EntityManager) => Promise<T>): Promise<T>;
  guardar(imagen: Imagen): Promise<Imagen>;
  buscarUltimoOrden(idPublicacion: number): Promise<number>;
  buscarPorId(id: number): Promise<Imagen | null>;
  buscarPorPublicacion(idPublicacion: number): Promise<Imagen[]>;
  actualizarOrden(idPublicacion: number, ids: number[]): Promise<void>;
  eliminar(imagen: Imagen): Promise<Imagen>;
}

export const IMAGENES_REPOSITORY = 'IMAGENES_REPOSITORY';
