import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import type { IProcesadorImagenes, OpcionesImagenJpeg } from './procesador-imagenes.interface';

@Injectable()
export class SharpImagenesAdapter implements IProcesadorImagenes {
  /** Aplica orientación, tamaño y calidad según el perfil recibido y entrega el contenido en JPEG. */
  aJpeg(buffer: Buffer, { calidad, orientar, tamaño }: OpcionesImagenJpeg): Promise<Buffer> {
    const imagen = sharp(buffer);
    if (orientar) imagen.rotate();
    if (tamaño) {
      imagen.resize(tamaño.lado, tamaño.lado, {
        fit: tamaño.ajuste,
        withoutEnlargement: tamaño.ajuste === 'inside',
      });
    }
    return imagen.jpeg({ quality: calidad }).toBuffer();
  }
}
