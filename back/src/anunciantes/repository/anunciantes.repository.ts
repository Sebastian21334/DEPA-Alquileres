import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Anunciante } from '../entity/anunciante.entity';
import { IAnunciantesRepository } from './anunciantes.repository.interface';

@Injectable()
export class AnunciantesRepository implements IAnunciantesRepository {
  constructor(
    @InjectRepository(Anunciante)
    private readonly repo: Repository<Anunciante>,
  ) {}

  crear(datos: Partial<Anunciante>): Anunciante {
    return this.repo.create(datos);
  }

  guardar(anunciante: Anunciante): Promise<Anunciante> {
    return this.repo.save(anunciante);
  }

  buscarPorUsuario(idUsuario: number): Promise<Anunciante | null> {
    return this.repo.findOneBy({ idUsuario });
  }

  buscarPendientes(): Promise<Anunciante[]> {
    return this.repo.find({
      where: { verificado: false },
      relations: {
        usuario: true,
        tipoAnunciante: true,
      },
    });
  }

  eliminar(anunciante: Anunciante): Promise<Anunciante> {
    return this.repo.remove(anunciante);
  }

  buscarPorId(id: number): Promise<Anunciante | null> {
    return this.repo.findOne({
      where: { idUsuario: id }, // ajustá el nombre real de la PK
      relations: { usuario: true, tipoAnunciante: true },
    });
  }


}