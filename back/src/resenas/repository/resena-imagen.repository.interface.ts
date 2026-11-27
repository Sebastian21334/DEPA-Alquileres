import type { ResenaImagen } from '../entity/resena-imagen.entity';

export const RESENA_IMAGEN_REPOSITORY = 'RESENA_IMAGEN_REPOSITORY';

export interface IResenaImagenRepository {
  crear(idResena: number, url: string, orden: number): ResenaImagen;
  guardar(imagen: ResenaImagen): Promise<ResenaImagen>;
  buscarPorId(id: number): Promise<ResenaImagen | null>;
  contarPorResena(idResena: number): Promise<number>;
  buscarUltimoOrden(idResena: number): Promise<number>;
  eliminar(imagen: ResenaImagen): Promise<void>;
}
