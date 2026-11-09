import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago } from '../entity/pago.entity';
import { IPagosRepository } from './pagos.repository.interface';

@Injectable()
export class PagosRepository implements IPagosRepository {
  constructor(
    @InjectRepository(Pago) private readonly pagos: Repository<Pago>,
  ) {}

  crear(datos: Partial<Pago>): Pago {
    return this.pagos.create(datos);
  }

  guardar(pago: Pago): Promise<Pago> {
    return this.pagos.save(pago);
  }

  buscarPorId(id: number): Promise<Pago | null> {
    return this.pagos.findOne({
      where: { id },
      relations: { reserva: true },
    });
  }

  async actualizarEstado(
    id: number,
    cambios: Partial<
      Pick<
        Pago,
        | 'status'
        | 'status_detail'
        | 'payment_id'
        | 'payment_method_id'
        | 'approved_at'
        | 'chargeback_id'
      >
    >,
  ): Promise<void> {
    await this.pagos.update(id, cambios);
  }

  buscarPorIdConBloqueo(id: number): Promise<Pago | null> {
    return this.pagos.findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
  }

  buscarPorReferencia(external_reference: string): Promise<Pago | null> {
    return this.pagos.findOne({
      where: { external_reference },
      relations: { reserva: true },
    });
  }

  buscarPorReserva(idReserva: number): Promise<Pago | null> {
    return this.pagos.findOne({ where: { reserva: { id: idReserva } } });
  }
}
