import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pago } from '../entity/pago.entity';
import {
  PAGOS_REPOSITORY,
  type IPagosRepository,
} from '../repository/pagos.repository.interface';
import { TOLERANCIA_MONETARIA } from '../../common/utils/dinero';

/**
 * Estado y persistencia del pago. No conoce reservas, reembolsos ni disputas:
 * esos casos de uso viven en el módulo de aplicación.
 */
@Injectable()
export class PagosService {
  constructor(
    @Inject(PAGOS_REPOSITORY)
    private readonly pagos: IPagosRepository,
  ) {}

  crear(datos: Partial<Pago>): Pago {
    return this.pagos.crear(datos);
  }

  guardar(pago: Pago): Promise<Pago> {
    return this.pagos.guardar(pago);
  }

  buscarPorReferencia(referencia: string): Promise<Pago | null> {
    return this.pagos.buscarPorReferencia(referencia);
  }

  buscarPorReserva(idReserva: number): Promise<Pago | null> {
    return this.pagos.buscarPorReserva(idReserva);
  }

  async actualizarEstado(
    id: number,
    cambios: Partial<
      Pick<
        Pago,
        | 'status'
        | 'status_detail'
        | 'payment_id'
        | 'payment_method_id'
        | 'approved_at'
        | 'chargeback_id'
      >
    >,
  ): Promise<void> {
    await this.pagos.actualizarEstado(id, cambios);
  }

  async buscarPorId(id: number): Promise<Pago> {
    const pago = await this.pagos.buscarPorId(id);
    if (!pago) throw new NotFoundException('No se encontró el pago');
    return pago;
  }

  registrarPreferencia(pago: Pago, preferenceId: string): void {
    pago.preference_id = preferenceId;
  }

  registrarResultado(
    pago: Pago,
    resultado: {
      paymentId: string;
      status: string;
      statusDetail: string | null;
      paymentMethodId: string | null;
      approvedAt: Date | null;
    },
  ): void {
    pago.payment_id = resultado.paymentId;
    pago.status = resultado.status;
    pago.status_detail = resultado.statusDetail;
    pago.payment_method_id = resultado.paymentMethodId;
    pago.approved_at = resultado.approvedAt;
  }

  importeCoincide(pago: Pago, importe: number): boolean {
    return (
      Number.isFinite(importe) &&
      Math.abs(importe - Number(pago.amount)) <= TOLERANCIA_MONETARIA
    );
  }

  monedaCoincide(pago: Pago, moneda: string | undefined): boolean {
    return moneda === pago.currency;
  }

  saldoReembolsable(pago: Pago): number {
    return Math.max(0, Number(pago.amount) - Number(pago.amount_refunded ?? 0));
  }

}
