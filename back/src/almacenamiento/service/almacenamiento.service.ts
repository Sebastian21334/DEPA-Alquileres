import { Inject, Injectable } from '@nestjs/common';
import {
  ARCHIVO_REPOSITORY,
  type ContenedorArchivos,
  type IArchivoRepository,
} from '../repository/archivo.repository.interface';

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
}
