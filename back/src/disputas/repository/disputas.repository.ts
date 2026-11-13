import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type EntityManager, type FindOptionsRelations } from 'typeorm';
import { Disputa } from '../entity/disputa.entity';
import type { IDisputasRepository } from './disputas.repository.interface';

const RELACIONES_DISPUTA: FindOptionsRelations<Disputa> = {
  estado: true,
  reserva: {
    usuario: true,
    publicacion: { anunciante: { usuario: true } },
  },
  pago: true,
};

@Injectable()
export class DisputasRepository implements IDisputasRepository {
  constructor(@InjectRepository(Disputa) private readonly repo: Repository<Disputa>) {}

  conTransaccion<T>(operacion: (disputas: IDisputasRepository, transaccion: EntityManager) => Promise<T>): Promise<T> {
    return this.repo.manager.transaction('READ COMMITTED', (transaccion) =>
      operacion(this.enTransaccion(transaccion), transaccion),
    );
  }

  enTransaccion(transaccion: EntityManager): IDisputasRepository {
    return new DisputasRepository(transaccion.getRepository(Disputa));
  }

  buscarPorContracargo(chargebackId: string): Promise<Disputa | null> {
    return this.repo.findOne({
      where: { chargeback_id: chargebackId },
      relations: { estado: true },
    });
  }

  buscarPorId(id: number): Promise<Disputa | null> {
    return this.repo.findOne({ where: { id }, relations: RELACIONES_DISPUTA });
  }

  listarAdministracion(): Promise<Disputa[]> {
    return this.repo.find({
      relations: { ...RELACIONES_DISPUTA, resuelto_por: true },
      order: { id: 'DESC' },
      take: 200,
    });
  }

  crear(datos: Partial<Disputa>): Disputa {
    return this.repo.create(datos);
  }

  guardar(disputa: Disputa): Promise<Disputa> {
    return this.repo.save(disputa);
  }
}
