import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Reembolso, EstadoReembolso } from '../entity/reembolso.entity';
import { Pago } from '../../pagos/entity/pago.entity';
import type { IReembolsosRepository } from './reembolsos.repository.interface';

@Injectable()
export class ReembolsosRepository implements IReembolsosRepository {
  constructor(
    @InjectRepository(Reembolso)
    private readonly repository: Repository<Reembolso>,
    @InjectRepository(Pago)
    private readonly pagos: Repository<Pago>,
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

  buscarPagoPorReserva(idReserva: number): Promise<Pago | null> {
    return this.pagos.findOne({
      where: { reserva: { id: idReserva } },
      relations: { reserva: true },
    });
  }

  buscarPorReserva(idReserva: number): Promise<Reembolso[]> {
    return this.repository.find({
      where: { reserva: { id: idReserva } },
      order: { id: 'DESC' },
    });
  }

  async sumarImportesReservados(idPago: number): Promise<number> {
    const filas = await this.repository.find({
      where: {
        pago: { id: idPago },
        estado: In([EstadoReembolso.PENDIENTE, EstadoReembolso.EN_PROCESO]),
      },
    });
    return filas.reduce((total, fila) => total + Number(fila.importe), 0);
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
