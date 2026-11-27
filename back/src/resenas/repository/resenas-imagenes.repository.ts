import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { guardarSinDuplicados } from '../../common/persistence/valor-duplicado.error';
import { ResenaImagen } from '../entity/resena-imagen.entity';
import type { IResenaImagenRepository } from './resena-imagen.repository.interface';

@Injectable()
export class ResenasImagenesRepository implements IResenaImagenRepository {
  constructor(
    @InjectRepository(ResenaImagen) private readonly repo: Repository<ResenaImagen>,
  ) {}

  crear(idResena: number, url: string, orden: number): ResenaImagen {
    return this.repo.create({ url, orden, resena: { id: idResena } });
  }

  guardar(imagen: ResenaImagen): Promise<ResenaImagen> {
    return guardarSinDuplicados(
      () => this.repo.save(imagen),
      ['uq_resena_imagen_orden'],
    );
  }

  buscarPorId(id: number): Promise<ResenaImagen | null> {
    return this.repo.findOne({
      where: { id },
      relations: { resena: true },
    });
  }

  contarPorResena(idResena: number): Promise<number> {
    return this.repo.countBy({ resena: { id: idResena } });
  }

  async buscarUltimoOrden(idResena: number): Promise<number> {
    const fila = await this.repo
      .createQueryBuilder('imagen')
      .select('COALESCE(MAX(imagen.orden), -1)', 'max')
      .where('imagen.id_resena = :idResena', { idResena })
      .getRawOne<{ max: number }>();
    return Number(fila?.max ?? -1);
  }

  async eliminar(imagen: ResenaImagen): Promise<void> {
    await this.repo.remove(imagen);
  }
}
