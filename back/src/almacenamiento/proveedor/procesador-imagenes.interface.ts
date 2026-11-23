export const PROCESADOR_IMAGENES = 'PROCESADOR_IMAGENES';

export interface OpcionesImagenJpeg {
  calidad: number;
  orientar?: boolean;
  tamaño?: { lado: number; ajuste: 'inside' | 'cover' };
}

export interface IProcesadorImagenes {
  aJpeg(buffer: Buffer, opciones: OpcionesImagenJpeg): Promise<Buffer>;
}
