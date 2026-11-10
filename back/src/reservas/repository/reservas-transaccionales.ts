import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Reserva } from '../entity/reserva.entity';
import type { IReservasTransaccionales } from '../ports/reservas-transaccionales.interface';
import { ReservaRepository } from './reserva.repository';

@Injectable()
export class ReservasTransaccionales implements IReservasTransaccionales {
  conManager(manager: EntityManager): ReservaRepository {
    return new ReservaRepository(manager.getRepository(Reserva));
  }
}
