import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorito } from '../entity/favorito.entity';
import { IFavoritosRepository } from './favoritos.repository.interface';

@Injectable()
export class FavoritosRepository implements IFavoritosRepository {
  constructor(
    @InjectRepository(Favorito)
    private readonly favoritos: Repository<Favorito>,
  ) {}

  buscarPorUsuario(idUsuario: number): Promise<Favorito[]> {
    return this.favoritos.find({
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
  }

  existe(idUsuario: number, idPublicacion: number): Promise<boolean> {
    return this.favoritos.exists({
      where: { usuario: { id: idUsuario }, publicacion: { id: idPublicacion } },
    });
  }

  async agregar(idUsuario: number, idPublicacion: number): Promise<void> {
    // La clave única hace que agregar el mismo favorito sea idempotente incluso en paralelo.
    await this.favoritos.upsert(
      { usuario: { id: idUsuario }, publicacion: { id: idPublicacion } },
      ['usuario', 'publicacion'],
    );
  }

  async quitar(idUsuario: number, idPublicacion: number): Promise<void> {
    await this.favoritos.delete({
      usuario: { id: idUsuario },
      publicacion: { id: idPublicacion },
    });
  }
}
