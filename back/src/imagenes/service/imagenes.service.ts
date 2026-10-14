import { ARCHIVO_REPOSITORY } from '../../common/almacenamiento/archivo.repository.interface';
import type { IArchivoRepository } from '../../common/almacenamiento/archivo.repository.interface';
import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import sharp from 'sharp';
import { IMAGENES_REPOSITORY } from '../repository/imagenes.repository.interface';
import type { IImagenesRepository } from '../repository/imagenes.repository.interface';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';
import { Anunciante } from '../../anunciantes/entity/anunciante.entity';
import type { ArchivoSubido } from '../../common/interfaces/archivo-subido.interface';

@Injectable()
export class ImagenesService {
  constructor(
    @Inject(IMAGENES_REPOSITORY)
    private readonly imagenesRepo: IImagenesRepository,
    private readonly publicacionesService: PublicacionesService,
    @Inject(ARCHIVO_REPOSITORY)
    private readonly archivosRepo: IArchivoRepository,
  ) {}

  /** Procesa una imagen, la guarda en Azure y registra su URL en la base. */
  async subir(
    idPublicacion: number,
    anuncianteQueOpera: Anunciante,
    archivo: ArchivoSubido,
  ) {
    const publicacion =
      await this.publicacionesService.buscarPorId(idPublicacion);

    if (publicacion.anunciante.idUsuario !== anuncianteQueOpera.idUsuario) {
      throw new ForbiddenException(
        'No podés subir imágenes a una publicación que no es tuya',
      );
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

    const url = await this.archivosRepo.subir(
      'imagenes',
      `publicaciones/${idPublicacion}-${randomUUID()}.jpg`,
      bufferProcesado,
      'image/jpeg',
    );

    const nuevaImagen = this.imagenesRepo.crear({
      url,
      publicacion,
    });

    const guardada = await this.imagenesRepo.guardar(nuevaImagen);
    // Con la primera imagen la publicación cumple la regla y pasa a estar visible.
    await this.publicacionesService.activar(publicacion);
    return guardada;
  }

  /** Elimina el blob y su registro, verificando antes la propiedad de la publicacion. */
  async eliminar(idImagen: number, anuncianteQueOpera: Anunciante) {
    const imagen = await this.imagenesRepo.buscarPorId(idImagen);
    if (!imagen) throw new NotFoundException('Imagen no encontrada');

    if (
      imagen.publicacion.anunciante.idUsuario !== anuncianteQueOpera.idUsuario
    ) {
      throw new ForbiddenException(
        'No podés eliminar una imagen que no es tuya',
      );
    }

    // Regla de negocio: la publicación debe conservar al menos una imagen.
    const imagenesDePublicacion = await this.imagenesRepo.buscarPorPublicacion(
      imagen.publicacion.id,
    );
    if (imagenesDePublicacion.length <= 1) {
      throw new BadRequestException(
        'Una publicación debe tener al menos una imagen. Subí otra antes de borrar esta.',
      );
    }

    await this.archivosRepo.eliminarImagenPropia(imagen.url);

    return this.imagenesRepo.eliminar(imagen);
  }

  /** Lista las imagenes asociadas a una publicacion. */
  async listarPorPublicacion(idPublicacion: number) {
    return this.imagenesRepo.buscarPorPublicacion(idPublicacion);
  }
}
