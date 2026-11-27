export type TipoObjetivoResena = 'PUBLICACION' | 'ANUNCIANTE';

export interface ObjetivoResena {
  tipo: TipoObjetivoResena;
  id: number;
}

export interface ResumenResenas {
  cantidad: number;
  promedio: number | null;
  distribucion: { puntaje: number; cantidad: number }[];
}

export interface DatosNuevaResena {
  puntaje: number;
  comentario: string;
  fecha: Date;
}

export interface DatosResenaPublicacion extends DatosNuevaResena {
  idUsuario: number;
  idPublicacion: number;
}

export interface DatosResenaAnunciante extends DatosNuevaResena {
  idUsuario: number;
  idAnunciante: number;
}
