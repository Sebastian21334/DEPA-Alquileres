import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Disputa } from '../entity/disputa.entity';
import type { IDisputasRepository } from './disputas.repository.interface';

@Injectable()
export class DisputasRepository implements IDisputasRepository {
  constructor(
    @InjectRepository(Disputa)
    private readonly disputas: Repository<Disputa>,
  ) {}

  crear(datos: Partial<Disputa>): Disputa {
    return this.disputas.create(datos);
  }

  guardar(disputa: Disputa): Promise<Disputa> {
    return this.disputas.save(disputa);
  }

  buscarPorChargebackId(chargebackId: string): Promise<Disputa | null> {
    return this.disputas.findOne({ where: { chargeback_id: chargebackId } });
  }

  buscarPorId(id: number): Promise<Disputa | null> {
    return this.disputas.findOne({
      where: { id },
      relations: {
        reserva: {
          usuario: true,
          publicacion: { anunciante: { usuario: true } },
        },
        pago: true,
        resuelto_por: true,
      },
    });
  }

  buscarPorIdConBloqueo(id: number): Promise<Disputa | null> {
    return this.disputas.findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
  }

  listarAdministracion(): Promise<Disputa[]> {
    return this.disputas.find({
      relations: {
        reserva: {
          usuario: true,
          publicacion: { anunciante: { usuario: true } },
        },
        pago: true,
        resuelto_por: true,
      },
      order: { id: 'DESC' },
      take: 200,
    });
  }
}
