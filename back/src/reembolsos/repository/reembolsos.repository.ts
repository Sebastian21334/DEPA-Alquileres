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

  buscarPorReservasConEstados(idsReserva: number[], estados: string[]): Promise<Reembolso[]> {
    if (idsReserva.length === 0) return Promise.resolve([]);
    return this.repository.find({
      where: {
        reserva: { id: In(idsReserva) },
        estado: In(estados),
      },
      relations: { reserva: true },
    });
  }

  async sumarImportesReservados(idPago: number, estados: string[]): Promise<number> {
    const filas = await this.repository.find({
      where: {
        pago: { id: idPago },
        estado: In(estados),
      },
    });
    return filas.reduce((total, fila) => total + Number(fila.importe), 0);
  }

  actualizarEnTransaccion(id: number, operacion: (reembolso: Reembolso) => void | Promise<void>): Promise<Reembolso | null> {
    return this.repository.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Reembolso);
      const reembolso = await repo.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!reembolso) return null;
      await operacion(reembolso);
      return repo.save(reembolso);
    });
  }

  buscarPendientesConciliacion(estados: string[]): Promise<Reembolso[]> {
    return this.repository.find({
      where: {
        estado: In(estados),
      },
      relations: { pago: true, reserva: true },
      order: { id: 'ASC' },
      take: 50,
    });
  }

  buscarAprobados(estado: string): Promise<Reembolso[]> {
    return this.repository.find({
      where: { estado },
      relations: { pago: true, reserva: true },
      order: { id: 'ASC' },
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
