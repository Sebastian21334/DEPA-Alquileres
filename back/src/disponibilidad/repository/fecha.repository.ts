import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type EntityManager } from 'typeorm';
import { Fecha } from '../entity/fecha.entity';
import { IFechaRepository } from './fecha.repository.interface';

@Injectable()
export class FechaRepository implements IFechaRepository {
  constructor(@InjectRepository(Fecha) private readonly repository: Repository<Fecha>) {}

  conTransaccion<T>(operacion: (fechas: IFechaRepository, transaccion: EntityManager) => Promise<T>): Promise<T> {
    return this.repository.manager.transaction('READ COMMITTED', (transaccion) =>
      operacion(this.enTransaccion(transaccion), transaccion),
    );
  }

  enTransaccion(transaccion: EntityManager): IFechaRepository {
    return new FechaRepository(transaccion.getRepository(Fecha));
  }

  async buscarPublicacionPorFecha(id: number): Promise<number | null> {
    const fecha = await this.repository.findOne({ where: { id }, relations: { publicacion: true } });
    return fecha?.publicacion.id ?? null;
  }

  async buscarPublicacionPorReserva(idReserva: number): Promise<number | null> {
    const fecha = await this.repository.findOne({
      where: { reserva: { id: idReserva } },
      relations: { publicacion: true },
    });
    return fecha?.publicacion.id ?? null;
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

  buscarPorId(id: number): Promise<Fecha | null> {
    return this.consultaFechas().where('fecha.id = :id', { id }).getOne();
  }

  buscarPorPublicacion(idPublicacion: number): Promise<Fecha[]> {
    return this.repository.find({
      where: { publicacion: { id: idPublicacion } },
      order: { fecha: 'ASC' },
    });
  }

  buscarPorPublicacionParaAdministracion(idPublicacion: number): Promise<Fecha[]> {
    return this.repository.find({
      where: { publicacion: { id: idPublicacion } },
      relations: { reserva: true },
      order: { fecha: 'ASC' },
    });
  }

  buscarPorReserva(idReserva: number): Promise<Fecha[]> {
    return this.consultaFechas()
      .where('fecha.id_reserva = :idReserva', { idReserva })
      .getMany();
  }

  buscarPorRango(idPublicacion: number, fechaInicio: Date, fechaFin: Date): Promise<Fecha[]> {
    return this.consultaFechas()
      .where('fecha.id_publicacion = :idPublicacion', { idPublicacion })
      .andWhere('fecha.fecha BETWEEN :fechaInicio AND :fechaFin', {
        fechaInicio: fechaInicio.toISOString().slice(0, 10),
        fechaFin: fechaFin.toISOString().slice(0, 10),
      })
      .getMany();
  }

  buscarPorRangoConReserva(idPublicacion: number, fechaInicio: Date, fechaFin: Date): Promise<Fecha[]> {
    return this.buscarPorRango(idPublicacion, fechaInicio, fechaFin);
  }

  async eliminar(id: number): Promise<number> {
    const resultado = await this.repository.delete(id);
    // TypeORM no lanza 404: devuelve affected y el service decide la respuesta HTTP.
    return resultado.affected ?? 0;
  }
}
