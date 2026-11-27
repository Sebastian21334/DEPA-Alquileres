import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import {
  ImagenInvalidaError,
  type IProcesadorImagenes,
  type OpcionesImagenJpeg,
} from './procesador-imagenes.interface';

@Injectable()
export class SharpImagenesAdapter implements IProcesadorImagenes {
  /** Aplica orientación, tamaño y calidad según el perfil recibido y entrega el contenido en JPEG. */
  async aJpeg(buffer: Buffer, { calidad, orientar, tamaño }: OpcionesImagenJpeg): Promise<Buffer> {
    await this.validarContenido(buffer);
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

  /** metadata() solo lee la cabecera: separa un archivo inválido de un fallo del procesador. */
  private async validarContenido(buffer: Buffer): Promise<void> {
    try {
      await sharp(buffer).metadata();
    } catch (error) {
      throw new ImagenInvalidaError(undefined, error);
    }
  }
}
