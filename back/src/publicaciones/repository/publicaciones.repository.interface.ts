import { Publicacion } from '../entity/publicacion.entity';
import { ListarAdministracionDto } from '../../common/dto/listar-administracion.dto';
import { Pagina } from '../../common/persistence/paginacion';
import type { EntityManager } from 'typeorm';
import type { Reserva } from '../../reservas/entity/reserva.entity';

export interface ConsultaReservasAcceso {
  idPublicacion: number;
  idUsuario: number;
  fechaFinDesde: string;
  cancelada: boolean;
  finalizada: boolean;
  pagos: { estado: Reserva['estado_pago']; venceDespues?: Date }[];
}

export type CategoriaInicio =
  'recientes' | 'temporales' | 'largo-plazo' | 'villa-maria' | 'reservadas';
export type OrdenPublicaciones =
  'recientes' | 'antiguas' | 'precio-menor' | 'precio-mayor' | 'titulo';

export interface ConsultaPublicaciones {
  pagina: number;
  limite: number;
  categoria?: CategoriaInicio;
  orden?: OrdenPublicaciones;
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
  marcarActiva(id: number): Promise<void>;
  bloquearPorAnunciante(idUsuario: number, transaccion: EntityManager): Promise<boolean>;
  bloquearPorId(id: number, transaccion: EntityManager): Promise<Publicacion | null>;
  buscarCondicionesDeReserva(id: number, transaccion: EntityManager): Promise<Publicacion | null>;
  desactivarPorAnunciante(idUsuario: number, transaccion: EntityManager): Promise<void>;
  darDeBaja(id: number, motivo: string): Promise<void>;
  incrementarVisualizaciones(id: number): Promise<void>;
  buscarPorId(id: number): Promise<Publicacion | null>;
  existeReserva(consulta: ConsultaReservasAcceso): Promise<boolean>;
  buscarTodasActivas(): Promise<Publicacion[]>;
  buscarTodas(): Promise<Publicacion[]>;
  buscarAdministracion(consulta: ListarAdministracionDto): Promise<Pagina<Publicacion>>;
  buscarPaginadas(consulta: ConsultaPublicaciones): Promise<PaginaPublicaciones>;
  buscarPorAnunciante(idAnunciante: number, soloActivas: boolean): Promise<Publicacion[]>;
  eliminar(publicacion: Publicacion): Promise<Publicacion>;
}

export const PUBLICACIONES_REPOSITORY = 'PUBLICACIONES_REPOSITORY';
