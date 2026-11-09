import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Reembolso, EstadoReembolso } from '../entity/reembolso.entity';
import type { IReembolsosRepository } from './reembolsos.repository.interface';

@Injectable()
export class ReembolsosRepository implements IReembolsosRepository {
  constructor(
    @InjectRepository(Reembolso)
    private readonly repository: Repository<Reembolso>,
  ) {}

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

  buscarPorIdConBloqueo(id: number): Promise<Reembolso | null> {
    return this.repository.findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
  }

  async buscarPagoId(id: number): Promise<number | null> {
    const filas = await this.repository.query(
      'SELECT id_pago FROM reembolso WHERE id_reembolso = $1',
      [id],
    );
    const idPago = filas?.[0]?.id_pago;
    return idPago != null ? Number(idPago) : null;
  }

  buscarPorIdempotencyKey(clave: string): Promise<Reembolso | null> {
    return this.repository.findOne({
      where: { idempotency_key: clave },
      relations: {
        reserva: {
          publicacion: { anunciante: { usuario: true } },
          usuario: true,
        },
        pago: true,
      },
    });
  }

  buscarPorReferenciaExterna(referencia: string): Promise<Reembolso | null> {
    return this.repository.findOne({
      where: { referencia_externa: referencia },
      relations: {
        reserva: {
          publicacion: { anunciante: { usuario: true } },
          usuario: true,
        },
        pago: true,
      },
    });
  }

  buscarPorIdExterno(idExterno: string): Promise<Reembolso | null> {
    return this.repository.findOne({
      where: { id_externo: idExterno },
      relations: {
        reserva: {
          publicacion: { anunciante: { usuario: true } },
          usuario: true,
        },
        pago: true,
      },
    });
  }

  buscarPorPago(idPago: number): Promise<Reembolso[]> {
    return this.repository.find({
      where: { pago: { id: idPago } },
      order: { id: 'DESC' },
    });
  }

  buscarPorReserva(idReserva: number): Promise<Reembolso[]> {
    return this.repository.find({
      where: { reserva: { id: idReserva } },
      relations: {
        reserva: {
          publicacion: { anunciante: { usuario: true } },
          usuario: true,
        },
        pago: true,
      },
      order: { id: 'DESC' },
    });
  }

  buscarPorReservasConEstados(
    idsReserva: number[],
    estados: EstadoReembolso[],
  ): Promise<Reembolso[]> {
    if (idsReserva.length === 0) return Promise.resolve([]);
    return this.repository.find({
      where: {
        reserva: { id: In(idsReserva) },
        estado: In(estados),
      },
      relations: { reserva: true },
    });
  }

  async sumarImportesReservados(
    idPago: number,
    excluirId?: number,
  ): Promise<number> {
    const filas = await this.repository.find({
      where: {
        pago: { id: idPago },
        estado: In([
          EstadoReembolso.PENDIENTE,
          EstadoReembolso.EN_PROCESO,
          EstadoReembolso.FALLIDO,
        ]),
        ...(excluirId != null ? { id: Not(excluirId) } : {}),
      },
    });
    return filas.reduce((total, fila) => total + Number(fila.importe), 0);
  }

  async actualizarEnTransaccion(
    id: number,
    operacion: (reembolso: Reembolso) => void,
  ): Promise<Reembolso | null> {
    return this.repository.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Reembolso);
      const reembolso = await repo.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!reembolso) return null;
      operacion(reembolso);
      return repo.save(reembolso);
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

  buscarAprobados(): Promise<Reembolso[]> {
    return this.repository.find({
      where: { estado: EstadoReembolso.APROBADO },
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
