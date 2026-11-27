export type TipoObjetivoResena = 'PUBLICACION' | 'ANUNCIANTE';

export type MotivoNoPuedeResenar = 'SESION' | 'SIN_ESTADIA' | 'PROPIO' | 'YA_RESENO';

export interface ResenaAutor {
  id: number;
  nombre: string;
  apellido: string;
  foto_url: string | null;
}

export interface ResenaImagen {
  id: number;
  url: string;
  orden: number;
}

export interface Resena {
  id: number;
  puntaje: number;
  comentario: string;
  fecha: string;
  actualizada_en: string | null;
  autor: ResenaAutor;
  imagenes: ResenaImagen[];
  visible?: boolean;
  motivo_moderacion?: string | null;
  fecha_moderacion?: string | null;
  denunciada?: boolean;
}

export interface ResumenResenas {
  promedio: number | null;
  cantidad: number;
  distribucion: { puntaje: number; cantidad: number }[];
}

export interface ObjetivoResena {
  tipo: TipoObjetivoResena;
  id: number;
  titulo: string;
}

export interface ResenasObjetivo extends ResumenResenas {
  objetivo: ObjetivoResena;
  resenas: Resena[];
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
  puedeResenar: boolean;
  motivoNoPuede?: MotivoNoPuedeResenar;
  miResena: Resena | null;
}

export interface CrearResenaPayload {
  puntaje: number;
  comentario: string;
}

export interface ResenaAdministracion extends Resena {
  objetivo: ObjetivoResena;
  visible: boolean;
  motivo_moderacion: string | null;
  fecha_moderacion: string | null;
  moderador: { id: number; nombre: string; apellido: string } | null;
  denunciada: boolean;
  motivo_denuncia: string | null;
  fecha_denuncia: string | null;
}

export interface PaginaResenasAdministracion {
  datos: ResenaAdministracion[];
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}
