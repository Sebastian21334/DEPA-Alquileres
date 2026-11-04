import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Imagen } from '../entity/imagen.entity';
import { IImagenesRepository } from './imagenes.repository.interface';
import { Publicacion } from '../../publicaciones/entity/publicacion.entity';

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
    return this.repo.manager.transaction(async (manager) => {
      // Las subidas y los cambios de orden de una misma galería se serializan.
      await manager.getRepository(Publicacion).createQueryBuilder('p')
        .where('p.id = :id', { id: imagen.publicacion.id })
        .setLock('pessimistic_write').getOneOrFail();
      const repo = manager.getRepository(Imagen);
      const ultima = await repo.findOne({
        where: { publicacion: { id: imagen.publicacion.id } },
        order: { orden: 'DESC', id: 'DESC' },
      });
      imagen.orden = (ultima?.orden ?? -1) + 1;
      return repo.save(imagen);
    });
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

  ordenar(idPublicacion: number, ids: number[]): Promise<Imagen[]> {
    return this.repo.manager.transaction(async (manager) => {
      await manager.getRepository(Publicacion).createQueryBuilder('p')
        .where('p.id = :id', { id: idPublicacion })
        .setLock('pessimistic_write').getOneOrFail();
      const repo = manager.getRepository(Imagen);
      const actuales = await repo.find({ where: { publicacion: { id: idPublicacion } } });
      const porId = new Map(actuales.map((imagen) => [imagen.id, imagen]));
      if (ids.length !== actuales.length || new Set(ids).size !== ids.length ||
          ids.some((id) => !porId.has(id))) {
        throw new ConflictException('La galería cambió. Recargá la publicación antes de ordenar sus fotos.');
      }
      const ordenadas: Imagen[] = [];
      for (const [orden, id] of ids.entries()) {
        await repo.update({ id, publicacion: { id: idPublicacion } }, { orden });
        ordenadas.push(Object.assign(porId.get(id)!, { orden }));
      }
      return ordenadas;
    });
  }

  eliminar(imagen: Imagen): Promise<Imagen> {
    return this.repo.remove(imagen);
  }
}
