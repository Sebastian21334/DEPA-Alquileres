import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type DeepPartial, type EntityManager } from 'typeorm';
import { Pago } from '../entity/pago.entity';
import { IPagosRepository } from './pagos.repository.interface';

@Injectable()
export class PagosRepository implements IPagosRepository {
  constructor(@InjectRepository(Pago) private readonly pagos: Repository<Pago>) {}

  crear(datos: DeepPartial<Pago>): Pago {
    return this.pagos.create(datos);
  }

  guardar(pago: Pago, transaccion?: EntityManager): Promise<Pago> {
    return (transaccion?.getRepository(Pago) ?? this.pagos).save(pago);
  }

  async actualizar(id: number, datos: Partial<Pago>, transaccion?: EntityManager): Promise<void> {
    await (transaccion?.getRepository(Pago) ?? this.pagos).update(id, datos);
  }

  async actualizarIntentoFallido(id: number, datos: Partial<Pago>): Promise<boolean> {
    const resultado = await this.pagos.createQueryBuilder()
      .update(Pago)
      .set(datos)
      .where('id_pago = :id', { id })
      .andWhere("status NOT IN ('approved', 'refunded', 'charged_back')")
      .andWhere("(status NOT IN ('pending', 'in_process', 'authorized', 'in_mediation') OR payment_id IS NULL OR payment_id = :paymentId)", { paymentId: datos.payment_id })
      .execute();
    return resultado.affected === 1;
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

  buscarPorReserva(idReserva: number, incluirReserva = false, transaccion?: EntityManager): Promise<Pago | null> {
    return (transaccion?.getRepository(Pago) ?? this.pagos).findOne({
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
