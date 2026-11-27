import type { Pagina } from '../../common/persistence/paginacion';
import type { ResumenResenas, TipoObjetivoResena } from '../resenas.types';

export type MotivoNoPuedeResenar =
  | 'SESION'
  | 'SIN_ESTADIA'
  | 'PROPIO'
  | 'YA_RESENO';

export interface ResenaAutorDto {
  id: number;
  nombre: string;
  apellido: string;
  foto_url: string | null;
}

export interface ResenaImagenDto {
  id: number;
  url: string;
  orden: number;
}

export interface ResenaPublicaDto {
  id: number;
  puntaje: number;
  comentario: string;
  fecha: Date;
  actualizada_en: Date | null;
  autor: ResenaAutorDto;
  imagenes: ResenaImagenDto[];
  visible?: boolean;
  motivo_moderacion?: string | null;
  fecha_moderacion?: Date | null;
  denunciada?: boolean;
}

export interface ObjetivoResenaDto {
  tipo: TipoObjetivoResena;
  id: number;
  titulo: string;
}

export interface ResenasObjetivoDto extends ResumenResenas {
  objetivo: ObjetivoResenaDto;
  resenas: ResenaPublicaDto[];
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
  puedeResenar: boolean;
  motivoNoPuede?: MotivoNoPuedeResenar;
  miResena: ResenaPublicaDto | null;
}

export interface ResenaAdministracionDto extends ResenaPublicaDto {
  objetivo: ObjetivoResenaDto;
  visible: boolean;
  motivo_moderacion: string | null;
  fecha_moderacion: Date | null;
  moderador: { id: number; nombre: string; apellido: string } | null;
  denunciada: boolean;
  motivo_denuncia: string | null;
  fecha_denuncia: Date | null;
}

export type PaginaResenasAdministracionDto = Pagina<ResenaAdministracionDto>;
