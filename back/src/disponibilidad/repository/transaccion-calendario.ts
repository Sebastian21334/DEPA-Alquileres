import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Fecha } from '../entity/fecha.entity';
import { Reserva } from '../../reservas/entity/reserva.entity';
import { FechaRepository } from './fecha.repository';
import { ReservaRepository } from '../../reservas/repository/reserva.repository';
import type {
  ITransaccionCalendario,
  RepositoriosCalendario,
} from './transaccion-calendario.interface';

@Injectable()
export class TransaccionCalendario implements ITransaccionCalendario {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  ejecutar<T>(
    operacion: (repositorios: RepositoriosCalendario) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction('READ COMMITTED', (manager) =>
      operacion({
        fechas: new FechaRepository(manager.getRepository(Fecha)),
        reservas: new ReservaRepository(manager.getRepository(Reserva)),
      }),
    );
  }
}
