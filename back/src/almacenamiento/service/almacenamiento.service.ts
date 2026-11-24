import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  ARCHIVO_REPOSITORY,
  type ContenedorArchivos,
  type IArchivoRepository,
} from '../repository/archivo.repository.interface';

/** Tamaño máximo de un comprobante de transferencia. */
export const MAX_BYTES_COMPROBANTE = 5 * 1024 * 1024;

/**
 * Los comprobantes van al contenedor privado que ya existe, en su propia carpeta:
 * así no hace falta crear otro contenedor en Azure ni configurar otra variable.
 */
const CONTENEDOR_COMPROBANTES: ContenedorArchivos = 'reclamos';

/** Tipos admitidos, reconocidos por la firma del contenido y no por lo que declara el navegador. */
const FIRMAS_COMPROBANTE = [
  { tipo: 'application/pdf', extension: 'pdf', firma: [0x25, 0x50, 0x44, 0x46, 0x2d] },
  { tipo: 'image/jpeg', extension: 'jpg', firma: [0xff, 0xd8, 0xff] },
  { tipo: 'image/png', extension: 'png', firma: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
] as const;

export interface ComprobanteSubido {
  url: string;
  nombre: string;
  tipo: string;
}

@Injectable()
export class AlmacenamientoService {
  constructor(@Inject(ARCHIVO_REPOSITORY) private readonly archivosRepo: IArchivoRepository) {}

  subir(contenedor: ContenedorArchivos, nombre: string, contenido: Buffer, tipo: string): Promise<string> {
    return this.archivosRepo.subir(contenedor, nombre, contenido, tipo);
  }

  eliminarImagenPropia(url: string): Promise<void> {
    return this.archivosRepo.eliminarImagenPropia(url);
  }

  firmarDocumento(url: string): Promise<string> {
    return this.firmarArchivo('verificaciones', url);
  }

  firmarArchivo(contenedor: ContenedorArchivos, url: string): Promise<string> {
    return this.archivosRepo.firmarArchivo(contenedor, url);
  }

  eliminarDocumentoPropio(url: string): Promise<void> {
    return this.archivosRepo.eliminarDocumentoPropio(url);
  }

  eliminarArchivo(contenedor: ContenedorArchivos, url: string): Promise<void> {
    return this.archivosRepo.eliminarArchivo(contenedor, url);
  }

  /**
   * Valida y guarda un comprobante (PDF, JPG o PNG de hasta 5 MB) en el almacenamiento privado.
   * `carpeta` la define el módulo que lo usa, por ejemplo `reembolsos/12`; nunca viene del usuario.
   */
  async subirComprobante(carpeta: string, archivo: Express.Multer.File | undefined): Promise<ComprobanteSubido> {
    if (!/^[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(carpeta)) throw new Error('Carpeta de comprobantes inválida');
    if (!archivo?.buffer?.length) throw new BadRequestException('Adjuntá el comprobante de la transferencia');
    if (archivo.size > MAX_BYTES_COMPROBANTE || archivo.buffer.length > MAX_BYTES_COMPROBANTE)
      throw new BadRequestException('El comprobante puede pesar hasta 5 MB');
    const formato = FIRMAS_COMPROBANTE.find(({ firma }) => firma.every((byte, indice) => archivo.buffer[indice] === byte));
    if (!formato) throw new BadRequestException('El comprobante tiene que ser un PDF, JPG o PNG válido');
    const url = await this.archivosRepo.subir(
      CONTENEDOR_COMPROBANTES, `comprobantes/${carpeta}/${randomUUID()}.${formato.extension}`, archivo.buffer, formato.tipo,
    );
    return { url, nombre: this.nombreVisible(archivo.originalname, formato.extension), tipo: formato.tipo };
  }

  /** Enlace de lectura de 15 minutos; el módulo dueño verifica antes quién lo pide. */
  firmarComprobante(url: string): Promise<string> {
    return this.archivosRepo.firmarArchivo(CONTENEDOR_COMPROBANTES, url);
  }

  /** Para deshacer la subida si después falla el registro que la usa. */
  eliminarComprobante(url: string): Promise<void> {
    return this.archivosRepo.eliminarArchivo(CONTENEDOR_COMPROBANTES, url);
  }

  private nombreVisible(original: string | undefined, extension: string): string {
    const limpio = Array.from((original ?? '').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '').trim()).slice(0, 200).join('');
    return limpio || `comprobante.${extension}`;
  }
}
