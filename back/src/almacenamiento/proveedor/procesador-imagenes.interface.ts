export const PROCESADOR_IMAGENES = 'PROCESADOR_IMAGENES';

export interface OpcionesImagenJpeg {
  calidad: number;
  orientar?: boolean;
  tamaño?: { lado: number; ajuste: 'inside' | 'cover' };
}

export interface IProcesadorImagenes {
  aJpeg(buffer: Buffer, opciones: OpcionesImagenJpeg): Promise<Buffer>;
}

/** El contenido no es una imagen válida; no representa una falla de infraestructura. */
export class ImagenInvalidaError extends Error {
  constructor(message = 'El archivo no es una imagen válida.', cause?: unknown) {
    super(message, { cause });
    this.name = 'ImagenInvalidaError';
  }
}
