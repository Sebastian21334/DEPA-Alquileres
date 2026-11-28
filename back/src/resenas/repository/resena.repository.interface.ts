import type { Pagina } from '../../common/persistence/paginacion';
import type { Resena } from '../entity/resena.entity';
import type {
  DatosResenaAnunciante,
  DatosResenaPublicacion,
  ResumenResenas,
  TipoObjetivoResena,
} from '../resenas.types';

export interface FiltroResenasAdministracion {
  visible?: boolean;
  denunciada?: boolean;
}

export interface ResenaAcceso {
  id: number;
  visible: boolean;
  autor: { id: number };
}

export interface DatosModeracionResena {
  visible: boolean;
  motivo: string | null;
  idAdministrador: number | null;
  fecha: Date | null;
}

export interface ResolucionDenunciaResena {
  id: number;
  id_resena: number;
  motivo_denuncia: string | null;
  fecha_denuncia: Date | null;
  aceptada: boolean;
  motivo_resolucion: string;
  fecha_resolucion: Date;
  id_administrador: number | null;
  administrador_nombre: string | null;
  administrador_apellido: string | null;
}

export const RESENA_REPOSITORY = 'RESENA_REPOSITORY';
export const RESENA_ACCESO_REPOSITORY = 'RESENA_ACCESO_REPOSITORY';

export interface IResenaAccesoRepository {
  /** Proyección mínima para autorizar operaciones sobre las imágenes. */
  buscarParaImagenes(id: number): Promise<ResenaAcceso | null>;
}

export interface IResenaRepository {
  buscarVisiblesRecibidas(idAnunciante: number, autores: number[], publicaciones: number[]): Promise<{ autor: number; publicacion: number | null; anunciante: number | null }[]>;
  crearParaPublicacion(datos: DatosResenaPublicacion): Resena;
  crearParaAnunciante(datos: DatosResenaAnunciante): Resena;
  guardar(resena: Resena): Promise<Resena>;
  buscarPorId(id: number): Promise<Resena | null>;
  buscarPorObjetivoYAutor(tipo: TipoObjetivoResena, idObjetivo: number, idUsuario: number): Promise<Resena | null>;
  buscarPaginaPorObjetivo(tipo: TipoObjetivoResena, idObjetivo: number, pagina: number, limite: number, excluirAutorId?: number): Promise<Pagina<Resena>>;
  obtenerResumen(tipo: TipoObjetivoResena, idObjetivo: number): Promise<ResumenResenas>;
  actualizar(resena: Resena, cambios: Partial<Resena>): Promise<Resena>;
  eliminar(resena: Resena): Promise<void>;
  listarAdministracion(pagina: number, limite: number, filtro: FiltroResenasAdministracion, idResena?: number): Promise<Pagina<Resena>>;
  registrarDenuncia(idResena: number, idUsuario: number, motivo: string, fecha: Date): Promise<boolean>;
  registrarModeracion(idResena: number, datos: DatosModeracionResena): Promise<void>;
  quitarDenuncia(idResena: number): Promise<void>;
  resolverDenuncia(idResena: number, idAdministrador: number, aceptada: boolean, motivo: string): Promise<boolean>;
  historialDenuncias(): Promise<ResolucionDenunciaResena[]>;
}
