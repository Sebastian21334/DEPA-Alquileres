import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Imagen } from '../entity/imagen.entity';
import { IImagenesRepository } from './imagenes.repository.interface';

@Injectable()
export class ImagenesRepository implements IImagenesRepository {
  constructor(
    @InjectRepository(Imagen)
    private readonly repo: Repository<Imagen>,
  ) {}

  crear(datos: Partial<Imagen>): Imagen {
    return this.repo.create(datos);
  }

  guardar(imagen: Imagen): Promise<Imagen> {
    return this.repo.save(imagen);
  }

  buscarPorId(id: number): Promise<Imagen | null> {
    // La publicación y su anunciante permiten validar quién puede borrar la imagen.
    return this.repo.findOne({
      where: { id },
      relations: { publicacion: { anunciante: true } },
    });
  }

  buscarPorPublicacion(idPublicacion: number): Promise<Imagen[]> {
    return this.repo.find({
      where: { publicacion: { id: idPublicacion } },
    });
  }

  eliminar(imagen: Imagen): Promise<Imagen> {
    return this.repo.remove(imagen);
  }
}