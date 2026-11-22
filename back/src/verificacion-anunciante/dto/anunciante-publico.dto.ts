export interface AnunciantePublicoDto {
  idUsuario: number;
  nombre_publico: string;
  tipoAnunciante: { id: number; nombre: string } | null;
  verificado: boolean;
  numero_contacto: string;
  foto_url: string | null;
}
