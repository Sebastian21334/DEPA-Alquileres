import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { EntityManager } from 'typeorm';
import { TOLERANCIA_MONETARIA } from '../../common/utils/dinero';
import type { Pago } from '../entity/pago.entity';
import {
  PAGOS_REPOSITORY,
  type IPagosRepository,
} from '../repository/pagos.repository.interface';

export type DatosPagoExterno = {
  id?: string | number;
  transaction_amount?: number;
  currency_id?: string;
  status?: string;
  status_detail?: string;
  payment_method_id?: string;
  date_approved?: string;
};

@Injectable()
export class PagosService {
  constructor(@Inject(PAGOS_REPOSITORY) private readonly pagosRepo: IPagosRepository) {}

  async buscarPorId(idPago: number, transaccion?: EntityManager): Promise<Pago> {
    const pago = transaccion
      ? await this.pagosRepo.buscarBloqueado(idPago, transaccion)
      : await this.pagosRepo.buscarPorId(idPago);
    if (!pago) throw new NotFoundException('No se encontró el pago');
    return pago;
  }

  registrarInicio(idReserva: number, importe: number, moneda: string): Promise<Pago> {
    return this.pagosRepo.guardar(this.pagosRepo.crear({
      reserva: { id: idReserva },
      external_reference: `reserva:${idReserva}`,
      status: 'pending',
      amount: importe,
      currency: moneda,
      idempotency_key: randomUUID(),
    }));
  }

  registrarPreferencia(idPago: number, idPreferencia: string): Promise<void> {
    return this.pagosRepo.actualizar(idPago, { preference_id: idPreferencia });
  }

  validarDatosExternos(pago: Pago, datos: DatosPagoExterno): void {
    if (datos.id == null || !String(datos.id).trim())
      throw new BadRequestException('El proveedor no devolvió un identificador de pago');
    if (datos.transaction_amount == null || !(Math.abs(datos.transaction_amount - Number(pago.amount)) <= TOLERANCIA_MONETARIA))
      throw new BadRequestException('El importe del pago no coincide con la reserva');
    if (datos.currency_id !== pago.currency)
      throw new BadRequestException('La moneda del pago no coincide con la reserva');
  }

  async registrarEstadoExterno(pago: Pago, datos: DatosPagoExterno, transaccion?: EntityManager): Promise<void> {
    this.validarDatosExternos(pago, datos);
    const cambios = {
      payment_id: String(datos.id),
      status: datos.status ?? 'unknown',
      status_detail: datos.status_detail ?? null,
      payment_method_id: datos.payment_method_id ?? null,
      approved_at: datos.date_approved ? new Date(datos.date_approved) : null,
    };
    if (cambios.status === 'rejected' || cambios.status === 'cancelled') {
      if (!await this.pagosRepo.actualizarIntentoFallido(pago.id, cambios)) return;
    } else {
      await this.pagosRepo.actualizar(pago.id, cambios, transaccion);
    }
    Object.assign(pago, cambios);
  }

  buscarPorReferencia(referencia: string): Promise<Pago | null> {
    return this.pagosRepo.buscarPorReferencia(referencia);
  }

  buscarPorReserva(idReserva: number, incluirReserva = true, transaccion?: EntityManager): Promise<Pago | null> {
    return this.pagosRepo.buscarPorReserva(idReserva, incluirReserva, transaccion);
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

  marcarContracargo(idPago: number, chargebackId: string, transaccion: EntityManager): Promise<void> {
    return this.pagosRepo.actualizar(idPago, { status: 'charged_back', chargeback_id: chargebackId }, transaccion);
  }

  restaurarPagoAprobado(idPago: number, transaccion: EntityManager): Promise<void> {
    return this.pagosRepo.actualizar(idPago, { status: 'approved', chargeback_id: null }, transaccion);
  }
}
