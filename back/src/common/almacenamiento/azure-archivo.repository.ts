import {
  type IArchivoRepository,
  type ContenedorArchivos,
} from './archivo.repository.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlobSASPermissions, BlobServiceClient } from '@azure/storage-blob';

@Injectable()
export class AzureArchivoRepository implements IArchivoRepository {
  constructor(private readonly config: ConfigService) {}

  async subir(
    contenedor: ContenedorArchivos,
    nombre: string,
    contenido: Buffer,
    tipo: string,
  ): Promise<string> {
    const blob = this.contenedor(contenedor).getBlockBlobClient(nombre);
    await blob.uploadData(contenido, {
      blobHTTPHeaders: { blobContentType: tipo },
    });
    return blob.url;
  }

  async eliminarImagenPropia(url: string): Promise<void> {
    const contenedor = this.contenedor('imagenes');
    const nombre = this.nombrePropio(url, contenedor.url);
    if (nombre === null) return;
    await contenedor.deleteBlob(nombre);
  }

  async firmarDocumento(url: string): Promise<string> {
    const contenedor = this.contenedor('verificaciones');
    const nombre = this.nombrePropio(url, contenedor.url);
    if (nombre === null)
      throw new Error(
        'El documento no pertenece al contenedor de verificaciones',
      );
    return contenedor.getBlobClient(nombre).generateSasUrl({
      permissions: BlobSASPermissions.parse('r'),
      expiresOn: new Date(Date.now() + 15 * 60 * 1000),
    });
  }

  async eliminarDocumentoPropio(url: string): Promise<void> {
    const contenedor = this.contenedor('verificaciones');
    const nombre = this.nombrePropio(url, contenedor.url);
    if (nombre === null)
      throw new Error('Documento ajeno al almacenamiento privado');
    await contenedor.getBlobClient(nombre).deleteIfExists();
  }

  private contenedor(tipo: ContenedorArchivos) {
    const conexion = this.config.getOrThrow<string>(
      'AZURE_STORAGE_CONNECTION_STRING',
    );
    const variable =
      tipo === 'imagenes'
        ? 'AZURE_STORAGE_CONTAINER'
        : 'AZURE_VERIFICACION_CONTAINER';
    const nombre = this.config.get<string>(variable) ?? tipo;
    return BlobServiceClient.fromConnectionString(conexion).getContainerClient(
      nombre,
    );
  }

  private nombrePropio(url: string, contenedorUrl: string): string | null {
    const archivo = new URL(url);
    const contenedor = new URL(contenedorUrl);
    const prefijo = `${contenedor.pathname.replace(/\/$/, '')}/`;
    if (
      archivo.origin !== contenedor.origin ||
      !archivo.pathname.startsWith(prefijo)
    )
      return null;
    return decodeURIComponent(archivo.pathname.slice(prefijo.length));
  }
}
