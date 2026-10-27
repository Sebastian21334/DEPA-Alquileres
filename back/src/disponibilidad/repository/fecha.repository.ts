import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publicacion } from '../../publicaciones/entity/publicacion.entity';
import { Fecha } from '../entity/fecha.entity';
import { IFechaRepository } from './fecha.repository.interface';

@Injectable()
export class FechaRepository implements IFechaRepository {
  constructor(
    @InjectRepository(Fecha)
    private readonly repository: Repository<Fecha>,
  ) {}

  async bloquearPublicacion(idPublicacion: number): Promise<void> {
    if (!this.repository.manager.queryRunner?.isTransactionActive) {
      throw new Error(
        'El calendario debe modificarse dentro de una transacción',
      );
    }
    // También protege inserciones de días que todavía no tienen una fila bloqueable.
    const publicacion = await this.repository.manager
      .getRepository(Publicacion)
      .createQueryBuilder('publicacion')
      .where('publicacion.id = :id', { id: idPublicacion })
      .setLock('pessimistic_write')
      .getOne();
    if (!publicacion) throw new NotFoundException('Publicación no encontrada');
  }

  private consultaFechas() {
    const consulta = this.repository
      .createQueryBuilder('fecha')
      .leftJoinAndSelect('fecha.reserva', 'reserva')
      .leftJoinAndSelect('fecha.publicacion', 'publicacion')
      .orderBy('fecha.fecha', 'ASC')
      .addOrderBy('fecha.id', 'ASC');
    if (this.repository.manager.queryRunner?.isTransactionActive) {
      // Los joins son opcionales: PostgreSQL bloquea solo las filas de fecha.
      consulta.setLock('pessimistic_write', undefined, ['fecha']);
    }
    return consulta;
  }

  crear(datos: Partial<Fecha>): Fecha {
    return this.repository.create(datos);
  }

  guardar(fecha: Fecha): Promise<Fecha> {
    return this.repository.save(fecha);
  }

  guardarVarias(fechas: Fecha[]): Promise<Fecha[]> {
    return this.repository.save(fechas);
  }

  async buscarPorId(id: number): Promise<Fecha | null> {
    if (this.repository.manager.queryRunner?.isTransactionActive) {
      const fecha = await this.repository.findOne({
        where: { id },
        relations: { publicacion: true },
      });
      if (!fecha) return null;
      await this.bloquearPublicacion(fecha.publicacion.id);
    }
    return this.consultaFechas().where('fecha.id = :id', { id }).getOne();
  }

  buscarPorPublicacion(idPublicacion: number): Promise<Fecha[]> {
    return this.repository.find({
      where: { publicacion: { id: idPublicacion } },
      order: { fecha: 'ASC' },
    });
  }

  buscarPorPublicacionParaAdministracion(
    idPublicacion: number,
  ): Promise<Fecha[]> {
    return this.repository.find({
      where: { publicacion: { id: idPublicacion } },
      relations: { reserva: true },
      order: { fecha: 'ASC' },
    });
  }

  async buscarPorReserva(idReserva: number): Promise<Fecha[]> {
    if (this.repository.manager.queryRunner?.isTransactionActive) {
      const fecha = await this.repository.findOne({
        where: { reserva: { id: idReserva } },
        relations: { publicacion: true },
      });
      if (fecha) await this.bloquearPublicacion(fecha.publicacion.id);
    }
    return this.consultaFechas()
      .where('fecha.id_reserva = :idReserva', { idReserva })
      .getMany();
  }

  buscarPorRango(
    idPublicacion: number,
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<Fecha[]> {
    return this.consultaFechas()
      .where('fecha.id_publicacion = :idPublicacion', { idPublicacion })
      .andWhere('fecha.fecha BETWEEN :fechaInicio AND :fechaFin', {
        fechaInicio: fechaInicio.toISOString().slice(0, 10),
        fechaFin: fechaFin.toISOString().slice(0, 10),
      })
      .getMany();
  }

  buscarPorRangoConReserva(
    idPublicacion: number,
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<Fecha[]> {
    return this.buscarPorRango(idPublicacion, fechaInicio, fechaFin);
  }

  async eliminar(id: number): Promise<number> {
    const resultado = await this.repository.delete(id);
    // TypeORM no lanza 404: devuelve affected y el service decide la respuesta HTTP.
    return resultado.affected ?? 0;
  }
}
