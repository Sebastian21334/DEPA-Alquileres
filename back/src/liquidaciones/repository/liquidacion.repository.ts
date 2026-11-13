import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, type EntityManager } from 'typeorm';
import { guardarSinDuplicados } from '../../common/persistence/valor-duplicado.error';
import { Liquidacion } from '../entity/liquidacion.entity';
import { ILiquidacionRepository } from './liquidacion.repository.interface';

@Injectable()
export class LiquidacionRepository implements ILiquidacionRepository {
  constructor(@InjectRepository(Liquidacion) private readonly repository: Repository<Liquidacion>) {}

  buscarPorReservas(ids: number[]): Promise<Liquidacion[]> {
    return this.repository.find({ where: { reserva: { id: In(ids) } }, relations: { reserva: true } });
  }

  listarPorEstados(estados: string[]): Promise<Liquidacion[]> {
    return this.repository.find({
      where: { estado: In(estados) },
      relations: { reserva: { usuario: true, publicacion: { anunciante: { usuario: true }, ciudad: true, provincia: true } } },
      order: { reserva: { codigo_validado_en: 'ASC', id: 'DESC' } },
    });
  }

  crear(datos: Partial<Liquidacion>): Liquidacion {
    return this.repository.create(datos);
  }

  async guardar(liquidacion: Liquidacion, transaccion?: EntityManager): Promise<Liquidacion> {
    return guardarSinDuplicados(
      () => this.repositorio(transaccion).save(liquidacion),
      ['uq_liquidacion_reserva'],
    );
  }

  buscarPorReserva(idReserva: number, transaccion?: EntityManager): Promise<Liquidacion | null> {
    return this.repositorio(transaccion).findOne({
      where: { reserva: { id: idReserva } },
    });
  }

  async buscarPorReservaConBloqueo(idReserva: number, transaccion?: EntityManager): Promise<Liquidacion | null> {
    const repositorio = this.repositorio(transaccion);
    if (!repositorio.manager.queryRunner?.isTransactionActive)
      return repositorio.findOne({ where: { reserva: { id: idReserva } } });
    return repositorio
      .createQueryBuilder('liquidacion')
      .where('liquidacion.id_reserva = :idReserva', { idReserva })
      .setLock('pessimistic_write')
      .getOne();
  }

  private repositorio(transaccion?: EntityManager): Repository<Liquidacion> {
    return transaccion
      ? transaccion.getRepository(Liquidacion)
      : this.repository;
  }
}
