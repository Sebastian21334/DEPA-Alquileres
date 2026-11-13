import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import type { Pago } from '../entity/pago.entity';
import {
  PAGOS_REPOSITORY,
  type IPagosRepository,
} from '../repository/pagos.repository.interface';

@Injectable()
export class PagosRegistroService {
  constructor(@Inject(PAGOS_REPOSITORY) private readonly pagosRepo: IPagosRepository) {}

  async buscarPorId(idPago: number): Promise<Pago> {
    const pago = await this.pagosRepo.buscarPorId(idPago);
    if (!pago) throw new NotFoundException('No se encontró el pago');
    return pago;
  }

  crear(datos: Partial<Pago>): Pago {
    return this.pagosRepo.crear(datos);
  }

  guardar(pago: Pago): Promise<Pago> {
    return this.pagosRepo.guardar(pago);
  }

  buscarPorReferencia(referencia: string): Promise<Pago | null> {
    return this.pagosRepo.buscarPorReferencia(referencia);
  }

  buscarPorReserva(idReserva: number, incluirReserva = true): Promise<Pago | null> {
    return this.pagosRepo.buscarPorReserva(idReserva, incluirReserva);
  }

  buscarParaReembolso(idPago: number, transaccion: EntityManager): Promise<Pago | null> {
    return this.pagosRepo.buscarBloqueado(idPago, transaccion);
  }

  saldoReembolsable(pago: Pago): number {
    return Math.max(0, Number(pago.amount) - Number(pago.amount_refunded ?? 0));
  }

  aplicarReembolso(pago: Pago, importe: number, resuelveContracargo: boolean, transaccion: EntityManager): Promise<Pago> {
    pago.amount_refunded = Number(pago.amount_refunded ?? 0) + importe;
    if (pago.amount_refunded >= Number(pago.amount)) {
      pago.amount_refunded = Number(pago.amount);
      pago.status = 'refunded';
      pago.refunded_at = new Date();
    } else if (resuelveContracargo && pago.status !== 'refunded') {
      pago.status = 'approved';
    }
    return this.pagosRepo.guardar(pago, transaccion);
  }

  marcarContracargo(pago: Pago, chargebackId: string): Promise<Pago> {
    pago.status = 'charged_back';
    pago.chargeback_id = chargebackId;
    return this.pagosRepo.guardar(pago);
  }

  restaurarPagoAprobado(pago: Pago): Promise<Pago> {
    pago.status = 'approved';
    pago.chargeback_id = null;
    return this.pagosRepo.guardar(pago);
  }
}
