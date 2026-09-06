import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Fecha } from '../entity/fecha.entity';
import { IFechaRepository } from './fecha.repository.interface';

@Injectable()
export class FechaRepository implements IFechaRepository {
  constructor(
    @InjectRepository(Fecha)
    private readonly repository: Repository<Fecha>,
  ) {}

  crear(datos: Partial<Fecha>): Fecha {
    return this.repository.create(datos);
  }

  guardar(fecha: Fecha): Promise<Fecha> {
    return this.repository.save(fecha);
  }

  guardarVarias(fechas: Fecha[]): Promise<Fecha[]> {
    return this.repository.save(fechas);
  }

  buscarPorId(id: number): Promise<Fecha | null> {
    return this.repository.findOne({
      where: { id },
      relations: { publicacion: true },
    });
  }

  buscarPorPublicacion(idPublicacion: number): Promise<Fecha[]> {
    return this.repository.find({
      where: { publicacion: { id: idPublicacion } },
      order: { fecha: 'ASC' },
    });
  }

  buscarPorRango(idPublicacion: number, fechaInicio: Date, fechaFin: Date): Promise<Fecha[]> {
    // Between incluye ambos extremos, por eso el rango reserva también el día de salida.
    return this.repository.find({
      where: {
        publicacion: { id: idPublicacion },
        fecha: Between(fechaInicio, fechaFin),
      },
    });
  }

  async eliminar(id: number): Promise<number> {
    const resultado = await this.repository.delete(id);
    // TypeORM no lanza 404: devuelve affected y el service decide la respuesta HTTP.
    return resultado.affected ?? 0;
  }
}