import { Publicacion } from '../entity/publicacion.entity';
import { ListarPublicacionesAdministracionDto } from '../dto/listar-publicaciones-administracion.dto';
import { ListarMisPublicacionesDto } from '../dto/listar-mis-publicaciones.dto';
import { Pagina } from '../../common/persistence/paginacion';
import type { EntityManager } from 'typeorm';

export type CategoriaInicio =
  'recientes' | 'temporales' | 'largo-plazo' | 'villa-maria' | 'reservadas';
export type OrdenPublicaciones =
  'recientes' | 'antiguas' | 'precio-menor' | 'precio-mayor' | 'titulo';

export interface FiltrosPublicaciones {
  categoria?: CategoriaInicio;
  busqueda?: string;
  idsCiudad?: number[];
  idProvincia?: number;
  idsTipoPropiedad?: number[];
  idsTipoMoneda?: number[];
  precioMin?: number;
  precioMax?: number;
  superficieMin?: number;
  ambientes?: string[];
}

/** Monedas en USD y venta del dólar blue con la que se comparan en pesos. */
export interface ConversionUsd {
  idsMoneda: number[];
  venta: number;
}

export interface ConsultaPublicaciones extends FiltrosPublicaciones {
  pagina: number;
  limite: number;
  orden?: OrdenPublicaciones;
  conversionUsd?: ConversionUsd;
}

export interface AreaMapaPublicaciones {
  sur: number;
  norte: number;
  oeste: number;
  este: number;
}

export interface PuntoPublicacion {
  id: number;
  titulo: string;
  ciudad: string | null;
  portada: string | null;
  latitud: number;
  longitud: number;
  precio: number;
  moneda: string | null;
  temporal: boolean;
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
  actualizarSiNoEliminada(id: number, cambios: Partial<Publicacion>): Promise<boolean>;
  marcarActiva(id: number): Promise<boolean>;
  bloquearPorAnunciante(idUsuario: number, transaccion: EntityManager): Promise<boolean>;
  bloquearPorId(id: number, transaccion: EntityManager): Promise<Publicacion | null>;
  buscarCondicionesDeReserva(id: number, transaccion: EntityManager): Promise<Publicacion | null>;
  desactivarPorAnunciante(idUsuario: number, transaccion: EntityManager): Promise<void>;
  darDeBaja(id: number, motivo: string): Promise<void>;
  reactivar(id: number): Promise<boolean>;
  incrementarVisualizaciones(id: number): Promise<void>;
  buscarPorId(id: number): Promise<Publicacion | null>;
  buscarTodasActivas(): Promise<Publicacion[]>;
  buscarAdministracion(consulta: ListarPublicacionesAdministracionDto): Promise<Pagina<Publicacion>>;
  buscarMiasPaginadas(idAnunciante: number, consulta: ListarMisPublicacionesDto): Promise<Pagina<Publicacion> & { activas: number }>;
  buscarPapeleraPorAnunciante(idAnunciante: number): Promise<Publicacion[]>;
  buscarPaginadas(consulta: ConsultaPublicaciones): Promise<PaginaPublicaciones>;
  buscarPuntos(filtros: FiltrosPublicaciones, area: AreaMapaPublicaciones | undefined, limite: number, antesDe?: number): Promise<PuntoPublicacion[]>;
  buscarPorAnunciante(idAnunciante: number, soloActivas: boolean, incluirEliminadas?: boolean): Promise<Publicacion[]>;
  restaurar(id: number): Promise<boolean>;
  eliminar(publicacion: Publicacion): Promise<Publicacion>;
}

export const PUBLICACIONES_REPOSITORY = 'PUBLICACIONES_REPOSITORY';
