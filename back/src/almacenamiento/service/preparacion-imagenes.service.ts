import { Inject, Injectable } from '@nestjs/common';
import { PROCESADOR_IMAGENES, type IProcesadorImagenes, type OpcionesImagenJpeg } from '../proveedor/procesador-imagenes.interface';

const TAMAÑO_EVIDENCIA = { lado: 1600, ajuste: 'inside' } as const;
// Cada perfil conserva el tamaño, la orientación y la calidad que necesita su flujo.
const OPCIONES = {
  publicacion: { calidad: 75, tamaño: TAMAÑO_EVIDENCIA },
  reclamo: { calidad: 80, tamaño: TAMAÑO_EVIDENCIA },
  resena: { calidad: 80, tamaño: TAMAÑO_EVIDENCIA, orientar: true },
  apelacion: { calidad: 80, tamaño: TAMAÑO_EVIDENCIA, orientar: true },
  avatar: { calidad: 80, tamaño: { lado: 400, ajuste: 'cover' }, orientar: true },
  verificacion: { calidad: 80 },
} as const satisfies Record<string, OpcionesImagenJpeg>;

@Injectable()
export class PreparacionImagenesService {
  constructor(@Inject(PROCESADOR_IMAGENES) private readonly procesador: IProcesadorImagenes) {}

  /** Aplica el perfil del flujo y delega en el proveedor la conversión a JPEG. */
  preparar(buffer: Buffer, uso: keyof typeof OPCIONES): Promise<Buffer> {
    return this.procesador.aJpeg(buffer, OPCIONES[uso]);
  }
}
