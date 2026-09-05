import { Imagen } from '../entity/imagen.entity';

export interface IImagenesRepository {
  crear(datos: Partial<Imagen>): Imagen;
  guardar(imagen: Imagen): Promise<Imagen>;
  buscarPorId(id: number): Promise<Imagen | null>;
  buscarPorPublicacion(idPublicacion: number): Promise<Imagen[]>;
  eliminar(imagen: Imagen): Promise<Imagen>;
}

export const IMAGENES_REPOSITORY = 'IMAGENES_REPOSITORY';