import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  PAGOS_TRANSACCIONALES,
  type IPagosTransaccionales,
} from '../../pagos/ports/pagos-transaccionales.interface';
import { Reembolso } from '../entity/reembolso.entity';
import { ReembolsosRepository } from '../repository/reembolsos.repository';
import type {
  ContextoDevoluciones,
  IDevolucionesUnitOfWork,
} from './devoluciones.unit-of-work.interface';

/**
 * Infraestructura de transacción del agregado Reembolso/Pago.
 * Es la única pieza que conoce ambas tablas; el service solo ve interfaces.
 */
@Injectable()
export class DevolucionesUnitOfWork implements IDevolucionesUnitOfWork {
  constructor(
    private readonly dataSource: DataSource,
    @Inject(PAGOS_TRANSACCIONALES)
    private readonly pagosTransaccionales: IPagosTransaccionales,
  ) {}

  ejecutar<T>(
    operacion: (contexto: ContextoDevoluciones) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction(async (manager) => {
      const reembolsos = new ReembolsosRepository(
        manager.getRepository(Reembolso),
      );
      const pagos = this.pagosTransaccionales.conManager(manager);
      return operacion({ reembolsos, pagos });
    });
  }
}
