import { AlmacenamientoService } from '../../almacenamiento/service/almacenamiento.service';
import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PreparacionImagenesService } from '../../almacenamiento/service/preparacion-imagenes.service';
import { IMAGENES_REPOSITORY } from '../repository/imagenes.repository.interface';
import type { IImagenesRepository } from '../repository/imagenes.repository.interface';
import type { Imagen } from '../entity/imagen.entity';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';
import { Anunciante } from '../../anunciantes/entity/anunciante.entity';

/** Tope de fotos por publicación; el front aplica el mismo en el alta y en la edición. */
export const MAX_IMAGENES_PUBLICACION = 15;
const MENSAJE_TOPE_IMAGENES = `Una publicación puede tener hasta ${MAX_IMAGENES_PUBLICACION} fotos. Borrá alguna antes de subir otra.`;

@Injectable()
export class ImagenesService {
  private readonly logger = new Logger(ImagenesService.name);
  constructor(@Inject(IMAGENES_REPOSITORY) private readonly imagenesRepo: IImagenesRepository, private readonly publicacionesService: PublicacionesService, private readonly almacenamientoService: AlmacenamientoService, private readonly preparacionImagenes: PreparacionImagenesService) {}

  /** Procesa una imagen, la guarda en Azure y registra su URL en la base. */
  async subir(idPublicacion: number, anuncianteQueOpera: Anunciante, archivo: Express.Multer.File) {
    const publicacion = await this.publicacionesService.obtenerPropia(
      idPublicacion,
      anuncianteQueOpera.idUsuario,
      'No podés subir imágenes a una publicación que no es tuya',
    );
    // Corte temprano: una foto que no entra no se procesa ni se sube a Azure.
    if ((publicacion.imagenes?.length ?? 0) >= MAX_IMAGENES_PUBLICACION) throw new BadRequestException(MENSAJE_TOPE_IMAGENES);

    // Validar el contenido real evita aceptar archivos disfrazados con un mimetype de imagen.
    let bufferProcesado: Buffer;
    try {
      // Sharp valida el contenido binario y normaliza todos los formatos a JPEG.
      bufferProcesado = await this.preparacionImagenes.preparar(archivo.buffer, 'publicacion');
    } catch {
      throw new BadRequestException('El archivo no es una imagen válida');
    }

    const url = await this.almacenamientoService.subir(
      'imagenes',
      `publicaciones/${idPublicacion}-${randomUUID()}.jpg`,
      bufferProcesado,
      'image/jpeg',
    );

    const nuevaImagen = this.imagenesRepo.crear({
      url,
      publicacion,
    });

    let guardada: Imagen;
    try {
      guardada = await this.imagenesRepo.conTransaccion(async (imagenes, transaccion) => {
        await this.publicacionesService.bloquearParaModificacion(idPublicacion, transaccion, false);
        // Con la publicación bloqueada, dos subidas simultáneas no pueden pasar juntas el tope.
        if ((await imagenes.buscarPorPublicacion(idPublicacion)).length >= MAX_IMAGENES_PUBLICACION) throw new BadRequestException(MENSAJE_TOPE_IMAGENES);
        nuevaImagen.orden = (await imagenes.buscarUltimoOrden(idPublicacion)) + 1;
        return imagenes.guardar(nuevaImagen);
      });
    } catch (error) {
      // La foto ya está en Azure: si no quedó registrada, se borra para no dejarla huérfana.
      try { await this.almacenamientoService.eliminarImagenPropia(url); }
      catch { this.logger.warn(`No se pudo eliminar una foto no registrada de la publicación ${idPublicacion}`); }
      throw error;
    }
    // Con la primera imagen la publicación cumple la regla y pasa a estar visible.
    await this.publicacionesService.activar(publicacion);
    return guardada;
  }

  /** Elimina el blob y su registro, verificando antes la propiedad de la publicacion. */
  async eliminar(idImagen: number, anuncianteQueOpera: Anunciante) {
    const imagen = await this.imagenesRepo.buscarPorId(idImagen);
    if (!imagen) throw new NotFoundException('Imagen no encontrada');

    if (!this.publicacionesService.perteneceA(imagen.publicacion, anuncianteQueOpera.idUsuario)) {
      throw new ForbiddenException(
        'No podés eliminar una imagen que no es tuya',
      );
    }
    if (imagen.publicacion.eliminada) {
      throw new BadRequestException('No podés modificar las imágenes de una publicación eliminada');
    }

    return this.imagenesRepo.conTransaccion(async (imagenes, transaccion) => {
      await this.publicacionesService.bloquearParaModificacion(imagen.publicacion.id, transaccion, false);
      // Serializa dos borrados y la baja de la publicación antes de tocar Azure.
      const actual = await imagenes.buscarPorId(idImagen);
      if (!actual) throw new NotFoundException('Imagen no encontrada');
      const imagenesDePublicacion = await imagenes.buscarPorPublicacion(imagen.publicacion.id);
      if (imagenesDePublicacion.length <= 1) {
        throw new BadRequestException(
          'Una publicación debe tener al menos una imagen. Subí otra antes de borrar esta.',
        );
      }
      await this.almacenamientoService.eliminarImagenPropia(actual.url);
      return imagenes.eliminar(actual);
    });
  }

  async ordenar(idPublicacion: number, ids: number[], anunciante: Anunciante) {
    await this.publicacionesService.obtenerPropia(
      idPublicacion, anunciante.idUsuario,
      'No podés ordenar imágenes de una publicación que no es tuya',
    );
    return this.imagenesRepo.conTransaccion(async (imagenes, transaccion) => {
      await this.publicacionesService.bloquearParaModificacion(idPublicacion, transaccion, false);
      const actuales = await imagenes.buscarPorPublicacion(idPublicacion);
      const porId = new Map(actuales.map((imagen) => [imagen.id, imagen]));
      if (
        ids.length !== actuales.length ||
        new Set(ids).size !== ids.length ||
        ids.some((id) => !porId.has(id))
      ) {
        throw new ConflictException('La galería cambió. Recargá la publicación antes de ordenar sus fotos.');
      }
      await imagenes.actualizarOrden(idPublicacion, ids);
      return ids.map((id, orden) => Object.assign(porId.get(id)!, { orden }));
    });
  }

  /** Lista las imagenes asociadas a una publicacion. */
  async listarPorPublicacion(idPublicacion: number, idUsuario?: number) {
    await this.publicacionesService.buscarPublicaPorId(idPublicacion, idUsuario);
    const imagenes = await this.imagenesRepo.buscarPorPublicacion(idPublicacion);
    for (const imagen of imagenes) {
      if (imagen.publicacion) {
        imagen.publicacion = this.publicacionesService.prepararRespuesta(imagen.publicacion);
      }
    }
    return imagenes;
  }
}
