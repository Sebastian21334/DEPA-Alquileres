import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Pago } from '../entity/pago.entity';
import type {
  IPagosDevoluciones,
  IPagosTransaccionales,
} from '../ports/pagos-transaccionales.interface';
import { PagosRepository } from './pagos.repository';

@Injectable()
export class PagosTransaccionales implements IPagosTransaccionales {
  conManager(manager: EntityManager): IPagosDevoluciones {
    return new PagosRepository(manager.getRepository(Pago));
  }
}
