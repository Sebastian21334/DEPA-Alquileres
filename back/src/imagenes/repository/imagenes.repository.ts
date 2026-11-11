import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type EntityManager } from 'typeorm';
import { Imagen } from '../entity/imagen.entity';
import { IImagenesRepository } from './imagenes.repository.interface';

@Injectable()
export class ImagenesRepository implements IImagenesRepository {
  constructor(@InjectRepository(Imagen) private readonly repo: Repository<Imagen>) {}

  crear(datos: Partial<Imagen>): Imagen {
    return this.repo.create(datos);
  }

  conTransaccion<T>(operacion: (imagenes: IImagenesRepository, transaccion: EntityManager) => Promise<T>): Promise<T> {
    return this.repo.manager.transaction((transaccion) =>
      operacion(new ImagenesRepository(transaccion.getRepository(Imagen)), transaccion),
    );
  }

  async buscarUltimoOrden(idPublicacion: number): Promise<number> {
    const ultima = await this.repo.findOne({
      where: { publicacion: { id: idPublicacion } },
      order: { orden: 'DESC', id: 'DESC' },
    });
    return ultima?.orden ?? -1;
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
      order: { orden: 'ASC', id: 'ASC' },
    });
  }

  async actualizarOrden(idPublicacion: number, ids: number[]): Promise<void> {
    for (const [orden, id] of ids.entries()) {
      await this.repo.update({ id, publicacion: { id: idPublicacion } }, { orden });
    }
  }

  eliminar(imagen: Imagen): Promise<Imagen> {
    return this.repo.remove(imagen);
  }
}
