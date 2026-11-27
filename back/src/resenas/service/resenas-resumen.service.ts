import { Inject, Injectable } from '@nestjs/common';
import { AnunciantesService } from '../../anunciantes/service/anunciantes.service';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';
import {
  RESENA_REPOSITORY,
  type IResenaRepository,
} from '../repository/resena.repository.interface';
import type { ObjetivoResena, ResumenResenas } from '../resenas.types';

/**
 * Único punto de escritura de las cachés derivadas de publicaciones y perfiles.
 * Si la actualización falla, la próxima operación o el backfill la reconstruye.
 */
@Injectable()
export class ResenasResumenService {
  constructor(
    @Inject(RESENA_REPOSITORY) private readonly resenasRepo: IResenaRepository,
    private readonly publicacionesService: PublicacionesService,
    private readonly anunciantesService: AnunciantesService,
  ) {}

  obtener(objetivo: ObjetivoResena): Promise<ResumenResenas> {
    return this.resenasRepo.obtenerResumen(objetivo.tipo, objetivo.id);
  }

  async recalcular(objetivo: ObjetivoResena): Promise<void> {
    const resumen = await this.obtener(objetivo);
    if (objetivo.tipo === 'PUBLICACION') {
      await this.publicacionesService.actualizarResumenResenas(
        objetivo.id,
        resumen.cantidad,
        resumen.promedio,
      );
      return;
    }
    await this.anunciantesService.actualizarResumenResenas(
      objetivo.id,
      resumen.cantidad,
      resumen.promedio,
    );
  }
}
