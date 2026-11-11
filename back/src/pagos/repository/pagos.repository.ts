import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type EntityManager } from 'typeorm';
import { Pago } from '../entity/pago.entity';
import { IPagosRepository } from './pagos.repository.interface';

@Injectable()
export class PagosRepository implements IPagosRepository {
  constructor(@InjectRepository(Pago) private readonly pagos: Repository<Pago>) {}

  crear(datos: Partial<Pago>): Pago {
    return this.pagos.create(datos);
  }

  guardar(pago: Pago, transaccion?: EntityManager): Promise<Pago> {
    return (transaccion?.getRepository(Pago) ?? this.pagos).save(pago);
  }

  buscarPorId(id: number): Promise<Pago | null> {
    return this.pagos.findOneBy({ id });
  }

  buscarPorReferencia(external_reference: string): Promise<Pago | null> {
    return this.pagos.findOne({
      where: { external_reference },
      relations: { reserva: true },
    });
  }

  buscarPorReserva(idReserva: number, incluirReserva = false): Promise<Pago | null> {
    return this.pagos.findOne({
      where: { reserva: { id: idReserva } },
      relations: { reserva: incluirReserva },
    });
  }

  buscarBloqueado(id: number, transaccion: EntityManager): Promise<Pago | null> {
    return transaccion.getRepository(Pago).findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
  }
}
