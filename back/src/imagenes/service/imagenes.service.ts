import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlobServiceClient } from '@azure/storage-blob';
import sharp from 'sharp';
import { IMAGENES_REPOSITORY } from '../repository/imagenes.repository.interface';
import type { IImagenesRepository } from '../repository/imagenes.repository.interface';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';
import { Anunciante } from '../../anunciantes/entity/anunciante.entity';
import type { ArchivoSubido } from '../../common/interfaces/archivo-subido.interface';

@Injectable()
export class ImagenesService {
  private readonly blobServiceClient: BlobServiceClient;
  private readonly containerName: string;

  constructor(
    @Inject(IMAGENES_REPOSITORY)
    private readonly imagenesRepo: IImagenesRepository,
    private readonly publicacionesService: PublicacionesService,
    private readonly configService: ConfigService,
  ) {
    const connectionString = this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING')!;
    this.containerName = this.configService.get<string>('AZURE_STORAGE_CONTAINER') ?? 'imagenes';
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  }

  /** Procesa una imagen, la guarda en Azure y registra su URL en la base. */
  async subir(idPublicacion: number, anuncianteQueOpera: Anunciante, archivo: ArchivoSubido) {
    const publicacion = await this.publicacionesService.buscarPorId(idPublicacion);

    if (publicacion.anunciante.idUsuario !== anuncianteQueOpera.idUsuario) {
      throw new ForbiddenException('No podés subir imágenes a una publicación que no es tuya');
    }

    // Validar el contenido real evita aceptar archivos disfrazados con un mimetype de imagen.
    let bufferProcesado: Buffer;
    try {
      // Sharp valida el contenido binario y normaliza todos los formatos a JPEG.
      bufferProcesado = await sharp(archivo.buffer)
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 75 })
        .toBuffer();
    } catch {
      throw new BadRequestException('El archivo no es una imagen válida');
    }

    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    // El nombre incluye la publicacion y la hora para evitar colisiones entre cargas.
    const nombreBlob = `publicaciones/${idPublicacion}-${Date.now()}.jpg`;
    const blockBlobClient = containerClient.getBlockBlobClient(nombreBlob);

    // Azure recibe solo la versión procesada, reduciendo peso y estandarizando la URL.
    await blockBlobClient.uploadData(bufferProcesado, {
      blobHTTPHeaders: { blobContentType: 'image/jpeg' },
    });

    const nuevaImagen = this.imagenesRepo.crear({
      url: blockBlobClient.url,
      publicacion,
    });

    return this.imagenesRepo.guardar(nuevaImagen);
  }

  /** Elimina el blob y su registro, verificando antes la propiedad de la publicacion. */
  async eliminar(idImagen: number, anuncianteQueOpera: Anunciante) {
    const imagen = await this.imagenesRepo.buscarPorId(idImagen);
    if (!imagen) throw new NotFoundException('Imagen no encontrada');

    if (imagen.publicacion.anunciante.idUsuario !== anuncianteQueOpera.idUsuario) {
      throw new ForbiddenException('No podés eliminar una imagen que no es tuya');
    }

    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const nombreBlob = this.extraerNombreBlobDeUrl(imagen.url);
    await containerClient.deleteBlob(nombreBlob);

    return this.imagenesRepo.eliminar(imagen);
  }

  /** Lista las imagenes asociadas a una publicacion. */
  async listarPorPublicacion(idPublicacion: number) {
    return this.imagenesRepo.buscarPorPublicacion(idPublicacion);
  }

  /** Convierte la URL publica de Azure al nombre relativo usado para borrarla. */
  private extraerNombreBlobDeUrl(url: string): string {
    // La ruta contiene /<container>/<blob>; se descartan protocolo, host y container.
    const partes = new URL(url).pathname.split('/');
    return partes.slice(2).join('/');
  }
}