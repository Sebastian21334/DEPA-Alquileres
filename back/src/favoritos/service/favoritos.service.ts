import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { FAVORITOS_REPOSITORY } from '../repository/favoritos.repository.interface';
import type { IFavoritosRepository } from '../repository/favoritos.repository.interface';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';

@Injectable()
export class FavoritosService {
  constructor(
    @Inject(FAVORITOS_REPOSITORY)
    private readonly favoritos: IFavoritosRepository,
    private readonly publicaciones: PublicacionesService,
  ) {}

  async listar(idUsuario: number) {
    const favoritos = await this.favoritos.buscarPorUsuario(idUsuario);

    return favoritos
      .map((favorito) => favorito.publicacion)
      .filter(
        (publicacion) =>
          publicacion.activa && (publicacion.imagenes?.length ?? 0) > 0,
      );
  }

  async agregar(idUsuario: number, idPublicacion: number) {
    const publicacion = await this.publicaciones.buscarPorId(idPublicacion);
    if (!publicacion.activa || !(publicacion.imagenes?.length ?? 0)) {
      throw new ConflictException('La publicación no está disponible');
    }

    const existente = await this.favoritos.existe(idUsuario, idPublicacion);
    if (existente) return { idPublicacion, favorito: true };

    await this.favoritos.agregar(idUsuario, idPublicacion);
    return { idPublicacion, favorito: true };
  }

  async quitar(idUsuario: number, idPublicacion: number) {
    await this.favoritos.quitar(idUsuario, idPublicacion);
    return { idPublicacion, favorito: false };
  }
}
