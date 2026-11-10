import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  PAGOS_TRANSACCIONALES,
  type IPagosTransaccionales,
} from '../../pagos/ports/pagos-transaccionales.interface';
import {
  RESERVAS_TRANSACCIONALES,
  type IReservasTransaccionales,
} from '../../reservas/ports/reservas-transaccionales.interface';
import { Disputa } from '../entity/disputa.entity';
import { DisputasRepository } from '../repository/disputas.repository';
import type {
  ContextoDisputas,
  IDisputasUnitOfWork,
} from './disputas.unit-of-work.interface';

@Injectable()
export class DisputasUnitOfWork implements IDisputasUnitOfWork {
  constructor(
    private readonly dataSource: DataSource,
    @Inject(PAGOS_TRANSACCIONALES)
    private readonly pagosTransaccionales: IPagosTransaccionales,
    @Inject(RESERVAS_TRANSACCIONALES)
    private readonly reservasTransaccionales: IReservasTransaccionales,
  ) {}

  ejecutar<T>(
    operacion: (contexto: ContextoDisputas) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction(async (manager) => {
      const disputas = new DisputasRepository(
        manager.getRepository(Disputa),
      );
      const reservas = this.reservasTransaccionales.conManager(manager);
      const pagos = this.pagosTransaccionales.conManager(manager);
      return operacion({ disputas, reservas, pagos });
    });
  }
}
