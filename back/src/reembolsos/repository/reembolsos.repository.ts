import { EstadoReembolso } from '../../catalogos/estados';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, type EntityManager } from 'typeorm';
import { Reembolso } from '../entity/reembolso.entity';
import type { IReembolsosRepository } from './reembolsos.repository.interface';

@Injectable()
export class ReembolsosRepository implements IReembolsosRepository {
  constructor(@InjectRepository(Reembolso) private readonly repository: Repository<Reembolso>) {}

  conTransaccion<T>(operacion: (repositorio: IReembolsosRepository, transaccion: EntityManager) => Promise<T>): Promise<T> {
    return this.repository.manager.transaction((transaccion) =>
      operacion(new ReembolsosRepository(transaccion.getRepository(Reembolso)), transaccion),
    );
  }

  crear(datos: Partial<Reembolso>): Reembolso {
    return this.repository.create(datos);
  }

  guardar(reembolso: Reembolso): Promise<Reembolso> {
    return this.repository.save(reembolso);
  }

  buscarPorId(id: number): Promise<Reembolso | null> {
    return this.repository.findOne({
      where: { id },
      relations: {
        reserva: { publicacion: { anunciante: { usuario: true } }, usuario: true },
        pago: true,
        solicitado_por: true,
        resuelto_por: true,
      },
    });
  }

  buscarPorIdempotencyKey(clave: string): Promise<Reembolso | null> {
    return this.repository.findOne({ where: { idempotency_key: clave } });
  }

  buscarPorReferenciaExterna(referencia: string): Promise<Reembolso | null> {
    return this.repository.findOne({ where: { referencia_externa: referencia } });
  }

  buscarPorPago(idPago: number): Promise<Reembolso[]> {
    return this.repository.find({
      where: { pago: { id: idPago } },
      order: { id: 'DESC' },
    });
  }

  buscarRegistro(id: number, { bloquear, idPago }: { bloquear?: boolean; idPago?: boolean } = {}): Promise<Reembolso | null> {
    return this.repository.findOne({
      where: { id },
      lock: bloquear ? { mode: 'pessimistic_write' } : undefined,
      loadRelationIds: idPago
        ? { relations: ['pago'], disableMixedMap: true }
        : undefined,
    });
  }

  buscarPorReserva(idReserva: number): Promise<Reembolso[]> {
    return this.repository.find({
      where: { reserva: { id: idReserva } },
      order: { id: 'DESC' },
    });
  }

  buscarPendientesPorPago(idPago: number): Promise<Reembolso[]> {
    return this.repository.find({
      where: {
        pago: { id: idPago },
        estado: In([EstadoReembolso.PENDIENTE, EstadoReembolso.EN_PROCESO]),
      },
    });
  }

  buscarPendientesConciliacion(): Promise<Reembolso[]> {
    return this.repository.find({
      where: {
        estado: In([EstadoReembolso.EN_PROCESO, EstadoReembolso.FALLIDO]),
      },
      relations: { pago: true, reserva: true },
      order: { id: 'ASC' },
      take: 50,
    });
  }

  listarAdministracion(): Promise<Reembolso[]> {
    return this.repository.find({
      relations: {
        reserva: { publicacion: { anunciante: { usuario: true } }, usuario: true },
        pago: true,
        solicitado_por: true,
        resuelto_por: true,
      },
      order: { id: 'DESC' },
      take: 200,
    });
  }
}
