import { Inject, Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { AnunciantesService } from '../../anunciantes/service/anunciantes.service';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';
import type { ResumenResenasDto } from '../dto/resena-respuesta.dto';
import type { ObjetivoResena } from '../entity/resena.entity';
import {
  RESENA_REPOSITORY,
  type IResenaRepository,
} from '../repository/resena.repository.interface';

/**
 * Único punto de escritura de las cachés derivadas de publicaciones y perfiles.
 * Puede participar de la transacción que modifica la reseña.
 */
@Injectable()
export class ResenasResumenService {
  constructor(
    @Inject(RESENA_REPOSITORY) private readonly resenasRepo: IResenaRepository,
    private readonly publicacionesService: PublicacionesService,
    private readonly anunciantesService: AnunciantesService,
  ) {}

  async obtener(objetivo: ObjetivoResena, repositorio = this.resenasRepo): Promise<ResumenResenasDto> {
    const filas = await repositorio.contarVisiblesPorPuntaje(objetivo);
    const porPuntaje = new Map(filas.map(({ puntaje, cantidad }) => [Number(puntaje), Number(cantidad)]));
    const distribucion = [5, 4, 3, 2, 1].map((puntaje) => ({
      puntaje,
      cantidad: porPuntaje.get(puntaje) ?? 0,
    }));
    const cantidad = distribucion.reduce((total, fila) => total + fila.cantidad, 0);
    const suma = distribucion.reduce((total, fila) => total + fila.puntaje * fila.cantidad, 0);
    return {
      cantidad,
      promedio: cantidad ? Math.round((suma / cantidad) * 100) / 100 : null,
      distribucion,
    };
  }

  async recalcular(objetivo: ObjetivoResena, contexto?: { repositorio: IResenaRepository; transaccion: EntityManager }): Promise<void> {
    if (contexto) {
      return this.guardarResumen(objetivo, contexto.repositorio, contexto.transaccion);
    }
    return this.resenasRepo.conTransaccion((repositorio, transaccion) => this.guardarResumen(objetivo, repositorio, transaccion));
  }

  private async guardarResumen(objetivo: ObjetivoResena, repositorio: IResenaRepository, transaccion: EntityManager): Promise<void> {
    await repositorio.bloquearResumen(objetivo);
    const resumen = await this.obtener(objetivo, repositorio);
    if (objetivo.tipo === 'PUBLICACION') {
      await this.publicacionesService.actualizarResumenResenas(
        objetivo.id,
        resumen.cantidad,
        resumen.promedio,
        transaccion,
      );
      return;
    }
    await this.anunciantesService.actualizarResumenResenas(
      objetivo.id,
      resumen.cantidad,
      resumen.promedio,
      transaccion,
    );
  }
}
