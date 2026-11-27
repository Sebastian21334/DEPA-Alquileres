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
import { ImagenInvalidaError } from '../../almacenamiento/proveedor/procesador-imagenes.interface';
import { AlmacenamientoService } from '../../almacenamiento/service/almacenamiento.service';
import { PreparacionImagenesService } from '../../almacenamiento/service/preparacion-imagenes.service';
import { ValorDuplicadoError } from '../../common/persistence/valor-duplicado.error';
import type { ResenaImagenDto } from '../dto/resena-respuesta.dto';
import type { ResenaImagen } from '../entity/resena-imagen.entity';
import {
  MAX_BYTES_IMAGEN_RESENA,
  MAX_IMAGENES_RESENA,
} from '../resenas.constants';
import {
  RESENA_ACCESO_REPOSITORY,
  type IResenaAccesoRepository,
} from '../repository/resena.repository.interface';
import {
  RESENA_IMAGEN_REPOSITORY,
  type IResenaImagenRepository,
} from '../repository/resena-imagen.repository.interface';

@Injectable()
export class ResenasImagenesService {
  private readonly logger = new Logger(ResenasImagenesService.name);

  constructor(
    @Inject(RESENA_ACCESO_REPOSITORY) private readonly resenasRepo: IResenaAccesoRepository,
    @Inject(RESENA_IMAGEN_REPOSITORY) private readonly imagenesRepo: IResenaImagenRepository,
    private readonly almacenamiento: AlmacenamientoService,
    private readonly preparacionImagenes: PreparacionImagenesService,
  ) {}

  async agregar(idResena: number, idUsuario: number, archivo: Express.Multer.File | undefined): Promise<ResenaImagenDto> {
    const resena = await this.resenasRepo.buscarParaImagenes(idResena);
    if (!resena) throw new NotFoundException('Reseña no encontrada');
    if (resena.autor.id !== idUsuario) {
      throw new ForbiddenException('No podés agregar imágenes a una reseña que no es tuya.');
    }
    if (!resena.visible) {
      throw new ConflictException('La reseña fue ocultada por moderación.');
    }
    const cantidad = await this.imagenesRepo.contarPorResena(idResena);
    if (cantidad >= MAX_IMAGENES_RESENA) {
      throw new BadRequestException(`Una reseña puede tener hasta ${MAX_IMAGENES_RESENA} imágenes.`);
    }
    if (!archivo?.buffer?.length) {
      throw new BadRequestException('No se envió ninguna imagen.');
    }
    if (archivo.size > MAX_BYTES_IMAGEN_RESENA || archivo.buffer.length > MAX_BYTES_IMAGEN_RESENA) {
      throw new BadRequestException(`La imagen puede pesar hasta ${this.maximoEnMb()} MB.`);
    }
    let contenido: Buffer;
    try {
      // Sharp valida la firma real del archivo y normaliza a JPEG.
      contenido = await this.preparacionImagenes.preparar(archivo.buffer, 'resena');
    } catch (error) {
      if (error instanceof ImagenInvalidaError) {
        throw new BadRequestException('El archivo no es una imagen válida.');
      }
      this.logger.error(
        `No se pudo procesar la imagen de la reseña ${idResena}.`,
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
    const url = await this.almacenamiento.subir(
      'imagenes',
      `resenas/${idResena}-${randomUUID()}.jpg`,
      contenido,
      'image/jpeg',
    );
    const orden = (await this.imagenesRepo.buscarUltimoOrden(idResena)) + 1;
    const imagen = this.imagenesRepo.crear(idResena, url, orden);
    try {
      const guardada = await this.imagenesRepo.guardar(imagen);
      return { id: guardada.id, url: guardada.url, orden: guardada.orden };
    } catch (error) {
      try {
        await this.almacenamiento.eliminarImagenPropia(url);
      } catch {
        this.logger.warn(`No se pudo borrar una imagen no registrada de la reseña ${idResena}`);
      }
      if (error instanceof ValorDuplicadoError) {
        throw new ConflictException('La galería de la reseña cambió. Volvé a intentar.');
      }
      throw error;
    }
  }

  async eliminar(idResena: number, idImagen: number, idUsuario: number): Promise<{ id: number }> {
    const resena = await this.resenasRepo.buscarParaImagenes(idResena);
    if (!resena) throw new NotFoundException('Reseña no encontrada');
    if (resena.autor.id !== idUsuario) {
      throw new ForbiddenException('No podés borrar imágenes de una reseña que no es tuya.');
    }
    if (!resena.visible) {
      throw new ConflictException('La reseña fue ocultada por moderación.');
    }
    const imagen = await this.imagenesRepo.buscarPorId(idImagen);
    if (!imagen || imagen.resena.id !== idResena) {
      throw new NotFoundException('Imagen no encontrada');
    }
    // La fila es la fuente de verdad; el blob se limpia después y sin bloquear la baja.
    await this.imagenesRepo.eliminar(imagen);
    try {
      await this.almacenamiento.eliminarImagenPropia(imagen.url);
    } catch {
      this.logger.warn(`No se pudo borrar la imagen ${imagen.id} de la reseña ${idResena}`);
    }
    return { id: idImagen };
  }

  /** Se llama después de borrar la reseña: las filas caen por cascada. */
  async eliminarArchivos(imagenes: ResenaImagen[]): Promise<void> {
    for (const imagen of imagenes) {
      try {
        await this.almacenamiento.eliminarImagenPropia(imagen.url);
      } catch {
        this.logger.warn(`No se pudo borrar la imagen ${imagen.id} de la reseña ${imagen.resena?.id ?? 'desconocida'}`);
      }
    }
  }

  private maximoEnMb(): number {
    const megas = MAX_BYTES_IMAGEN_RESENA / (1024 * 1024);
    return Number.isInteger(megas) ? megas : Number(megas.toFixed(1));
  }
}
