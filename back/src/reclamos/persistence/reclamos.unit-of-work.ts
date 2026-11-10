import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  RESERVAS_TRANSACCIONALES,
  type IReservasTransaccionales,
} from '../../reservas/ports/reservas-transaccionales.interface';
import { Reclamo } from '../entity/reclamo.entity';
import { ReclamoEvidencia } from '../entity/reclamo-evidencia.entity';
import { ReclamoMensaje } from '../entity/reclamo-mensaje.entity';
import { ReclamosRepository } from '../repository/reclamos.repository';
import type {
  ContextoReclamos,
  IReclamosUnitOfWork,
} from './reclamos.unit-of-work.interface';

/**
 * Infraestructura de la transacción Reclamo/Reserva. El service solo recibe
 * las interfaces y no conoce TypeORM ni EntityManager.
 */
@Injectable()
export class ReclamosUnitOfWork implements IReclamosUnitOfWork {
  constructor(
    private readonly dataSource: DataSource,
    @Inject(RESERVAS_TRANSACCIONALES)
    private readonly reservasTransaccionales: IReservasTransaccionales,
  ) {}

  ejecutar<T>(
    operacion: (contexto: ContextoReclamos) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction(async (manager) => {
      const reclamos = new ReclamosRepository(
        manager.getRepository(Reclamo),
        manager.getRepository(ReclamoEvidencia),
        manager.getRepository(ReclamoMensaje),
      );
      const reservas = this.reservasTransaccionales.conManager(manager);
      return operacion({ reclamos, reservas });
    });
  }
}
