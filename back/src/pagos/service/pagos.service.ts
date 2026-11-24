import type { ParticipacionEnReserva } from '../../common/persistence/participacion-en-reserva';
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

  /** Define los estados finales y pide el conteo de los pagos que todavía requieren conciliación. */
  contarSinConciliar(idUsuario: number, participacion: ParticipacionEnReserva, limiteCheckout: Date, transaccion: EntityManager): Promise<number> {
    return this.pagosRepo.contarSinConciliar(idUsuario, participacion, limiteCheckout, transaccion, [
      'approved', 'rejected', 'cancelled', 'refunded',
    ]);
  }

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

  async registrarEstadoExterno(pago: Pago, datos: DatosPagoExterno, transaccion?: EntityManager): Promise<boolean> {
    this.validarDatosExternos(pago, datos);
    const cambios = {
      payment_id: String(datos.id),
      status: datos.status ?? 'unknown',
      status_detail: datos.status_detail ?? null,
      payment_method_id: datos.payment_method_id ?? null,
      approved_at: datos.date_approved ? new Date(datos.date_approved) : null,
    };
    if (cambios.status === 'rejected' || cambios.status === 'cancelled') {
      if (!await this.pagosRepo.actualizarIntentoFallido(pago.id, cambios)) return false;
    } else {
      await this.pagosRepo.actualizar(pago.id, cambios, transaccion);
    }
    Object.assign(pago, cambios);
    return true;
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

  /** Lo que la plataforma conserva del pago: se le devuelve al inquilino o se le liquida al anunciante. */
  saldoReembolsable(pago: Pago): number {
    // En centavos: la resta en coma flotante deja colas como 999.8000000000001.
    return Math.max(0, Math.round((Number(pago.amount) - Number(pago.amount_refunded ?? 0)) * 100) / 100);
  }

  listarPorReservas(idsReserva: number[]): Promise<Pago[]> {
    return this.pagosRepo.buscarPorReservas(idsReserva);
  }

  aplicarReembolso(pago: Pago, importe: number, transaccion: EntityManager): Promise<Pago> {
    pago.amount_refunded = Number(pago.amount_refunded ?? 0) + importe;
    if (pago.amount_refunded >= Number(pago.amount)) {
      pago.amount_refunded = Number(pago.amount);
      pago.status = 'refunded';
      pago.refunded_at = new Date();
    }
    return this.pagosRepo.guardar(pago, transaccion);
  }
}
