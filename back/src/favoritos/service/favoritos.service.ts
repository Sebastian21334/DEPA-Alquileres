import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorito } from '../entity/favorito.entity';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';

@Injectable()
export class FavoritosService {
  constructor(
    @InjectRepository(Favorito)
    private readonly favoritos: Repository<Favorito>,
    private readonly publicaciones: PublicacionesService,
  ) {}

  async listar(idUsuario: number) {
    const favoritos = await this.favoritos.find({
      where: { usuario: { id: idUsuario } },
      relations: {
        publicacion: {
          tipoPropiedad: true,
          ciudad: true,
          provincia: true,
          modalidad: true,
          tipoMoneda: true,
          imagenes: true,
          anunciante: { usuario: true, tipoAnunciante: true },
        },
      },
      order: { creado_en: 'DESC' },
    });

    return favoritos
      .map((favorito) => favorito.publicacion)
      .filter((publicacion) => publicacion.activa && (publicacion.imagenes?.length ?? 0) > 0);
  }

  async agregar(idUsuario: number, idPublicacion: number) {
    const publicacion = await this.publicaciones.buscarPorId(idPublicacion);
    if (!publicacion.activa || !(publicacion.imagenes?.length ?? 0)) {
      throw new ConflictException('La publicación no está disponible');
    }

    const existente = await this.favoritos.findOne({
      where: { usuario: { id: idUsuario }, publicacion: { id: idPublicacion } },
    });
    if (existente) return { idPublicacion, favorito: true };

    await this.favoritos.save(
      this.favoritos.create({ usuario: { id: idUsuario }, publicacion: { id: idPublicacion } }),
    );
    return { idPublicacion, favorito: true };
  }

  async quitar(idUsuario: number, idPublicacion: number) {
    await this.favoritos.delete({
      usuario: { id: idUsuario },
      publicacion: { id: idPublicacion },
    });
    return { idPublicacion, favorito: false };
  }
}
