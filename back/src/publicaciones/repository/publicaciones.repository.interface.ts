import { Publicacion } from '../entity/publicacion.entity';

export interface IPublicacionesRepository {
  crear(datos: Partial<Publicacion>): Publicacion;
  guardar(publicacion: Publicacion): Promise<Publicacion>;
  buscarPorId(id: number): Promise<Publicacion | null>;
  buscarTodasActivas(): Promise<Publicacion[]>;
 buscarPorAnunciante(idAnunciante: number, soloActivas: boolean): Promise<Publicacion[]>; 
  eliminar(publicacion: Publicacion): Promise<Publicacion>;
}

export const PUBLICACIONES_REPOSITORY = 'PUBLICACIONES_REPOSITORY';