import { PresupuestosService } from './presupuestos.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Inject,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { PAGOS_REPOSITORY } from '../repository/pagos.repository.interface';
import type { IPagosRepository } from '../repository/pagos.repository.interface';
import type { WebhookEntrada } from '../interfaces/webhook.interface';
import { PASARELA_PAGOS } from '../repository/pasarela-pagos.interface';
import type {
  IPasarelaPagos,
  PagoExterno,
} from '../repository/pasarela-pagos.interface';
import { EstadoPagoReserva } from '../../reservas/entity/reserva.entity';
import { ReservasService } from '../../reservas/service/reservas.service';
import { CrearCheckoutDto } from '../dto/crear-checkout.dto';
import { Pago } from '../entity/pago.entity';

@Injectable()
export class PagosService {
  private readonly logger = new Logger(PagosService.name);

  constructor(
    private readonly presupuestos: PresupuestosService,
    @Inject(PAGOS_REPOSITORY) private readonly pagos: IPagosRepository,
    private readonly reservasService: ReservasService,
    private readonly config: ConfigService,
    @Inject(PASARELA_PAGOS) private readonly pasarela: IPasarelaPagos,
  ) {}

  async crearCheckout(dto: CrearCheckoutDto, idUsuario: number) {
    this.pasarela.validarConfiguracionCheckout();
    const condiciones = dto.presupuesto_token
      ? await this.presupuestos.validar(dto.presupuesto_token, dto, idUsuario)
      : undefined;
    const reserva = await this.reservasService.crearPendiente(
      dto,
      idUsuario,
      condiciones,
    );
    const externalReference = `reserva:${reserva.id}`;
    const idempotencyKey = randomUUID();
    const currency =
      reserva.moneda_contratada ??
      this.config.get<string>('MP_CURRENCY_ID') ??
      'ARS';

    try {
      let pago = this.pagos.crear({
        reserva,
        external_reference: externalReference,
        preference_id: null,
        payment_id: null,
        status: 'pending',
        status_detail: null,
        amount: Number(reserva.monto_pago),
        currency,
        payment_method_id: null,
        idempotency_key: idempotencyKey,
        approved_at: null,
      });
      pago = await this.pagos.guardar(pago);

      const preference = await this.pasarela.crearCheckout(
        reserva,
        externalReference,
        idempotencyKey,
        currency,
      );
      pago.registrarPreferencia(preference.id);
      await this.pagos.guardar(pago);
      return {
        reserva_id: reserva.id,
        preference_id: preference.id,
        checkout_url: preference.url,
        expires_at: reserva.pago_vencimiento,
      };
    } catch (error) {
      await this.reservasService.rechazarPago(reserva.id);
      this.logger.error(
        'No se pudo crear la preferencia de Mercado Pago',
        error,
      );
      throw new ServiceUnavailableException(
        'No se pudo iniciar Mercado Pago. Verificá las credenciales y volvé a intentar.',
      );
    }
  }

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
    if (!reserva.esDelInquilino(idUsuario)) {
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

  private async aplicarPago(payment: PagoExterno): Promise<Pago> {
    const externalReference = payment.external_reference;
    if (!externalReference?.startsWith('reserva:')) {
      throw new BadRequestException('El pago no corresponde a una reserva');
    }

    const pago = await this.pagos.buscarPorReferencia(externalReference);
    if (!pago) throw new BadRequestException('No existe el pago informado');

    if (!pago.importeCoincide(Number(payment.transaction_amount))) {
      this.logger.warn(`Importe inválido para ${externalReference}`);
      throw new BadRequestException(
        'El importe del pago no coincide con la reserva',
      );
    }
    if (!pago.monedaCoincide(payment.currency_id)) {
      this.logger.warn(`Moneda inválida para ${externalReference}`);
      throw new BadRequestException(
        'La moneda del pago no coincide con la reserva',
      );
    }

    pago.registrarResultado({
      paymentId: String(payment.id),
      status: payment.status ?? 'unknown',
      statusDetail: payment.status_detail ?? null,
      paymentMethodId: payment.payment_method_id ?? null,
      approvedAt: payment.date_approved
        ? new Date(payment.date_approved)
        : null,
    });
    await this.pagos.guardar(pago);

    if (payment.status === 'approved') {
      await this.reservasService.confirmarPago(
        pago.reserva.id,
        pago.approved_at ?? new Date(),
      );
    } else if (
      ['rejected', 'cancelled', 'refunded', 'charged_back'].includes(
        payment.status ?? '',
      )
    ) {
      await this.reservasService.rechazarPago(
        pago.reserva.id,
        this.mapearEstado(payment.status),
      );
    }

    return pago;
  }

  async consultarEstado(idReserva: number, idUsuario: number) {
    const reserva = await this.reservasService.buscarPorId(
      idReserva,
      idUsuario,
    );
    if (!reserva.esDelInquilino(idUsuario)) {
      throw new ForbiddenException(
        'Solo el inquilino puede consultar el estado del pago',
      );
    }
    const pago = await this.pagos.buscarPorReserva(idReserva);
    return {
      reserva_id: idReserva,
      estado_pago: reserva.estado_pago,
      mercado_pago_status: pago?.status ?? null,
      mercado_pago_status_detail: pago?.status_detail ?? null,
    };
  }

  async consultarResumen(idReserva: number, idUsuario: number) {
    const reserva = await this.reservasService.buscarPorId(
      idReserva,
      idUsuario,
    );
    const pago = await this.pagos.buscarPorReserva(idReserva);
    return {
      reserva,
      pago: pago
        ? {
            preference_id: pago.preference_id,
            payment_id: pago.payment_id,
            status: pago.status,
            status_detail: pago.status_detail,
            amount: Number(pago.amount),
            currency: pago.currency,
            payment_method_id: pago.payment_method_id,
            approved_at: pago.approved_at,
            created_at: pago.created_at,
          }
        : null,
    };
  }

  private mapearEstado(status?: string): EstadoPagoReserva {
    if (status === 'refunded' || status === 'charged_back')
      return EstadoPagoReserva.REEMBOLSADO;
    if (status === 'cancelled') return EstadoPagoReserva.CANCELADO;
    return EstadoPagoReserva.RECHAZADO;
  }
}
