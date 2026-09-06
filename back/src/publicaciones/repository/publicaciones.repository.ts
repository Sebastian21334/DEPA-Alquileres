import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publicacion } from '../entity/publicacion.entity';
import { IPublicacionesRepository } from './publicaciones.repository.interface';

@Injectable()
export class PublicacionesRepository implements IPublicacionesRepository {
  constructor(
    @InjectRepository(Publicacion)
    private readonly repo: Repository<Publicacion>,
  ) {}

  crear(datos: Partial<Publicacion>): Publicacion {
    return this.repo.create(datos);
  }

  guardar(publicacion: Publicacion): Promise<Publicacion> {
    return this.repo.save(publicacion);
  }

  buscarPorId(id: number): Promise<Publicacion | null> {
    // Esta consulta carga todas las relaciones necesarias para detalle, propiedad y galería.
    return this.repo.findOne({
      where: { id },
      relations: {
        anunciante: { usuario: true },
        tipoMoneda: true,
        modalidad: true,
        provincia: true,
        ciudad: true,
        tipoPropiedad: true,
        imagenes: true, // <- agregado
      },
    });
  }

  buscarTodasActivas(): Promise<Publicacion[]> {
    return this.repo.find({
      where: { activa: true },
      relations: { tipoPropiedad: true, ciudad: true, provincia: true, modalidad: true },
    });
  }

  buscarPorAnunciante(idAnunciante: number, soloActivas: boolean): Promise<Publicacion[]> {
    // El spread agrega el filtro activa únicamente cuando el caller lo solicita.
    return this.repo.find({
      where: {
        anunciante: { idUsuario: idAnunciante },
        ...(soloActivas ? { activa: true } : {}),
      },
      relations: { tipoPropiedad: true, ciudad: true, provincia: true },
    });
  }

  eliminar(publicacion: Publicacion): Promise<Publicacion> {
    return this.repo.remove(publicacion);
  }
}