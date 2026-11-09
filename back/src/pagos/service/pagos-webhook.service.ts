import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { WebhookEntrada } from '../dto/webhook-pago.dto';
import { EstadoPagoReserva } from '../../reservas/entity/reserva.entity';
import { ReservaEstadoService } from '../../reservas/service/reserva-estado.service';
import { ReservaCancelacionesService } from '../../reservas/service/reserva-cancelaciones.service';
import { ReservasService } from '../../reservas/service/reservas.service';
import { ReembolsosService } from '../../reembolsos/service/reembolsos.service';
import {
  PASARELA_REEMBOLSOS,
  type IPasarelaReembolsos,
  type ResultadoReembolsoExterno,
} from '../../reembolsos/ports/pasarela-reembolsos.interface';
import type { Pago } from '../entity/pago.entity';
import { DisputasService } from '../../disputas/service/disputas.service';
import {
  PASARELA_PAGOS,
  type IPasarelaPagos,
  type PagoExterno,
} from '../repository/pasarela-pagos.interface';
import { PagosService } from './pagos.service';

/**
 * Orquestador de incidentes de pago: webhook, conciliación y contracargos.
 * Es el único punto que conoce reservas, reembolsos y disputas.
 */
@Injectable()
export class PagosWebhookService {
  private readonly logger = new Logger(PagosWebhookService.name);

  constructor(
    private readonly pagosService: PagosService,
    private readonly reservasService: ReservasService,
    private readonly cancelaciones: ReservaCancelacionesService,
    private readonly reembolsosService: ReembolsosService,
    private readonly disputasService: DisputasService,
    @Inject(PASARELA_PAGOS)
    private readonly pasarela: IPasarelaPagos,
    @Inject(PASARELA_REEMBOLSOS)
    private readonly pasarelaReembolsos: IPasarelaReembolsos,
    private readonly estado: ReservaEstadoService,
  ) {}

  async procesarWebhook(entrada: WebhookEntrada) {
    if (entrada.body?.type && entrada.body.type !== 'payment') {
      return { received: true };
    }
    if (!entrada.dataId)
      throw new BadRequestException('La notificación no contiene un pago');

    this.pasarela.validarWebhook(entrada);
    const payment = await this.pasarela.consultarPago(entrada.dataId);
    await this.aplicarPago(payment);

    return { received: true };
  }

  /**
   * Segunda vía de confirmación para el regreso desde Checkout Pro.
   * El navegador solo aporta el ID: el estado, importe y referencia siempre
   * se consultan nuevamente a Mercado Pago antes de modificar la reserva.
   */
  async reconciliarPago(paymentId: string, idUsuario: number) {
    const payment = await this.pasarela.consultarPago(paymentId);
    const externalReference = payment.external_reference;
    if (!externalReference?.startsWith('reserva:')) {
      throw new BadRequestException('El pago no corresponde a una reserva');
    }

    const idReserva = Number(externalReference.slice('reserva:'.length));
    if (!Number.isInteger(idReserva)) {
      throw new BadRequestException('La referencia del pago es inválida');
    }

    const reserva = await this.reservasService.buscarPorId(
      idReserva,
      idUsuario,
    );
    if (!this.estado.esDelInquilino(reserva, idUsuario)) {
      throw new ForbiddenException('Solo el inquilino puede validar este pago');
    }

    const pago = await this.aplicarPago(payment);
    const reservaActualizada = await this.reservasService.buscarPorId(
      idReserva,
      idUsuario,
    );
    return {
      reserva_id: pago.reserva.id,
      estado_pago: reservaActualizada.estado_pago,
      mercado_pago_status: pago.status,
      mercado_pago_status_detail: pago.status_detail,
    };
  }

  private async aplicarPago(payment: PagoExterno) {
    const externalReference = payment.external_reference;
    if (!externalReference?.startsWith('reserva:')) {
      throw new BadRequestException('El pago no corresponde a una reserva');
    }

    const pago = await this.pagosService.buscarPorReferencia(externalReference);
    if (!pago) throw new BadRequestException('No existe el pago informado');

    if (!this.pagosService.importeCoincide(pago, Number(payment.transaction_amount))) {
      this.logger.warn(`Importe inválido para ${externalReference}`);
      throw new BadRequestException(
        'El importe del pago no coincide con la reserva',
      );
    }
    if (!this.pagosService.monedaCoincide(pago, payment.currency_id)) {
      this.logger.warn(`Moneda inválida para ${externalReference}`);
      throw new BadRequestException(
        'La moneda del pago no coincide con la reserva',
      );
    }

    this.pagosService.registrarResultado(pago, {
      paymentId: String(payment.id),
      status: payment.status ?? 'unknown',
      statusDetail: payment.status_detail ?? null,
      paymentMethodId: payment.payment_method_id ?? null,
      approvedAt: payment.date_approved
        ? new Date(payment.date_approved)
        : null,
    });
    await this.pagosService.actualizarEstado(pago.id, {
      payment_id: pago.payment_id,
      status: pago.status,
      status_detail: pago.status_detail,
      payment_method_id: pago.payment_method_id,
      approved_at: pago.approved_at,
    });

    if (
      Number(payment.transaction_amount_refunded ?? 0) > 0 ||
      payment.status === 'refunded'
    )
      await this.reconciliarReembolsosExternos(pago, payment);

    if (payment.status === 'approved') {
      await this.reservasService.confirmarPago(
        pago.reserva.id,
        pago.approved_at ?? new Date(),
      );
    } else if (payment.status === 'charged_back') {
      await this.disputasService.registrarContracargo({
        idReserva: pago.reserva.id,
        idPago: pago.id,
        chargebackId:
          payment.chargeback_id ??
          `payment:${payment.id}:charged_back`,
        importe: Number(payment.transaction_amount ?? pago.amount),
        motivo: payment.status_detail ?? 'Contracargo informado por Mercado Pago',
      });
    } else if (['rejected', 'cancelled'].includes(payment.status ?? '')) {
      await this.reservasService.rechazarPago(
        pago.reserva.id,
        this.mapearEstado(payment.status),
      );
    }

    return pago;
  }

  private async reconciliarReembolsosExternos(
    pago: Pago,
    payment: PagoExterno,
  ): Promise<void> {
    if (payment.id == null) return;
    let reembolsos: ResultadoReembolsoExterno[];
    try {
      reembolsos = await this.pasarelaReembolsos.listarReembolsos(
        String(payment.id),
      );
    } catch (error) {
      this.logger.warn(
        `No se pudieron listar los reembolsos externos del pago ${payment.id}`,
        error as Error,
      );
      return;
    }

    for (const reembolsoExterno of reembolsos) {
      if (
        reembolsoExterno.id == null ||
        reembolsoExterno.amount == null
      )
        continue;
      const estado = (reembolsoExterno.status ?? 'approved').toLowerCase();
      if (!['approved', 'succeeded'].includes(estado)) continue;
      const reembolso =
        await this.reembolsosService.registrarDesdeWebhook({
          pago,
          importe: Number(reembolsoExterno.amount),
          referenciaExterna: `mp-refund:${reembolsoExterno.id}`,
          idExterno: String(reembolsoExterno.id),
        });
      if (reembolso.estado !== 'APROBADO') continue;
      try {
        await this.cancelaciones.aplicarReembolsoConfirmado(reembolso.id);
      } catch (error) {
        this.logger.warn(
          `El reembolso externo ${reembolso.id} se registró, pero no se pudo aplicar a la reserva`,
          error as Error,
        );
      }
    }
  }

  private mapearEstado(status?: string): EstadoPagoReserva {
    if (status === 'refunded' || status === 'charged_back')
      return EstadoPagoReserva.REEMBOLSADO;
    if (status === 'cancelled') return EstadoPagoReserva.CANCELADO;
    return EstadoPagoReserva.RECHAZADO;
  }
}
