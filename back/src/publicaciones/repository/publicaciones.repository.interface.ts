import { Publicacion } from '../entity/publicacion.entity';

export type CategoriaInicio = 'recientes' | 'temporales' | 'largo-plazo' | 'villa-maria' | 'reservadas';
export type OrdenPublicaciones = 'recientes' | 'antiguas' | 'precio-menor' | 'precio-mayor' | 'titulo';

export interface ConsultaPublicaciones {
  pagina: number;
  limite: number;
  categoria?: CategoriaInicio;
  orden?: OrdenPublicaciones;
  busqueda?: string;
  idsCiudad?: number[];
  idsTipoPropiedad?: number[];
  idsTipoMoneda?: number[];
  precioMin?: number;
  precioMax?: number;
  ambientes?: string[];
}

export interface PaginaPublicaciones {
  datos: (Publicacion & { cantidad_reservas: number })[];
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}

export interface IPublicacionesRepository {
  crear(datos: Partial<Publicacion>): Publicacion;
  guardar(publicacion: Publicacion): Promise<Publicacion>;
  marcarActiva(id: number): Promise<void>;
  buscarPorId(id: number): Promise<Publicacion | null>;
  buscarTodasActivas(): Promise<Publicacion[]>;
  buscarPaginadas(consulta: ConsultaPublicaciones): Promise<PaginaPublicaciones>;
 buscarPorAnunciante(idAnunciante: number, soloActivas: boolean): Promise<Publicacion[]>; 
  eliminar(publicacion: Publicacion): Promise<Publicacion>;
}

export const PUBLICACIONES_REPOSITORY = 'PUBLICACIONES_REPOSITORY';
