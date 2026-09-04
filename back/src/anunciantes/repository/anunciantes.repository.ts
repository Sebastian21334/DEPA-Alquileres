import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Anunciante } from '../entity/anunciante.entity';

@Injectable()
export class AnunciantesRepository {
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
}