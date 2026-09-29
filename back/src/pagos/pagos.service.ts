import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import {
  MercadoPagoConfig,
  Payment,
  Preference,
  WebhookSignatureValidator,
} from 'mercadopago';
import { Repository } from 'typeorm';
import { EstadoPagoReserva } from '../reservas/entity/reserva.entity';
import { ReservasService } from '../reservas/service/reservas.service';
import { CrearCheckoutDto } from './dto/crear-checkout.dto';
import { Pago } from './entity/pago.entity';

type WebhookEntrada = {
  body: any;
  dataId?: string;
  signature?: string;
  requestId?: string;
};

@Injectable()
export class PagosService {
  private readonly logger = new Logger(PagosService.name);

  constructor(
    @InjectRepository(Pago) private readonly pagos: Repository<Pago>,
    private readonly reservasService: ReservasService,
    private readonly config: ConfigService,
  ) {}

  async crearCheckout(dto: CrearCheckoutDto, idUsuario: number) {
    const client = this.crearCliente();
    const successUrl = this.configRequerida('MP_SUCCESS_URL');
    const failureUrl = this.configRequerida('MP_FAILURE_URL');
    const pendingUrl = this.configRequerida('MP_PENDING_URL');
    const reserva = await this.reservasService.crearPendiente(dto, idUsuario);
    const externalReference = `reserva:${reserva.id}`;
    const idempotencyKey = randomUUID();
    const currency = this.config.get<string>('MP_CURRENCY_ID') ?? 'ARS';

    let pago = this.pagos.create({
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
    pago = await this.pagos.save(pago);

    try {
      const preference = await new Preference(client).create({
        body: {
          items: [{
            id: externalReference,
            title: `Reserva #${reserva.id} - ${reserva.publicacion?.titulo ?? 'Alojamiento'}`,
            description: `${this.fechaCorta(reserva.fecha_inicio)} al ${this.fechaCorta(reserva.fecha_fin)}`,
            quantity: 1,
            currency_id: currency,
            unit_price: Number(reserva.monto_pago),
          }],
          external_reference: externalReference,
          payer: {
            name: reserva.usuario_nombre ?? undefined,
            surname: reserva.usuario_apellido ?? undefined,
            email: reserva.usuario_email ?? undefined,
          },
          back_urls: {
            success: successUrl,
            failure: failureUrl,
            pending: pendingUrl,
          },
          auto_return: 'approved',
          notification_url: this.config.get<string>('MP_WEBHOOK_URL') || undefined,
          expires: true,
          expiration_date_to: reserva.pago_vencimiento?.toISOString(),
          metadata: { reserva_id: reserva.id },
          statement_descriptor: 'DEPA ALQUILER',
        },
        requestOptions: { idempotencyKey },
      });

      if (!preference.id || !preference.init_point) {
        throw new Error('Mercado Pago no devolvió la URL del checkout');
      }

      pago.preference_id = preference.id;
      await this.pagos.save(pago);
      return {
        reserva_id: reserva.id,
        preference_id: preference.id,
        checkout_url: preference.init_point,
        expires_at: reserva.pago_vencimiento,
      };
    } catch (error) {
      await this.reservasService.rechazarPago(reserva.id);
      this.logger.error('No se pudo crear la preferencia de Mercado Pago', error);
      throw new ServiceUnavailableException(
        'No se pudo iniciar Mercado Pago. Verificá las credenciales y volvé a intentar.',
      );
    }
  }

  async procesarWebhook(entrada: WebhookEntrada) {
    if (entrada.body?.type && entrada.body.type !== 'payment') {
      return { received: true };
    }
    if (!entrada.dataId) throw new BadRequestException('La notificación no contiene un pago');

    const secret = this.config.get<string>('MP_WEBHOOK_SECRET');
    if (secret) {
      try {
        WebhookSignatureValidator.validate({
          xSignature: entrada.signature,
          xRequestId: entrada.requestId,
          dataId: entrada.dataId,
          secret,
          toleranceSeconds: 300,
        });
      } catch {
        throw new UnauthorizedException('Firma de webhook inválida');
      }
    }

    const payment = await new Payment(this.crearCliente()).get({ id: entrada.dataId });
    const externalReference = payment.external_reference;
    if (!externalReference?.startsWith('reserva:')) {
      throw new BadRequestException('El pago no corresponde a una reserva');
    }

    const pago = await this.pagos.findOne({
      where: { external_reference: externalReference },
      relations: { reserva: true },
    });
    if (!pago) throw new BadRequestException('No existe el pago informado');

    const importeRecibido = Number(payment.transaction_amount);
    if (!Number.isFinite(importeRecibido) || Math.abs(importeRecibido - Number(pago.amount)) > 0.009) {
      this.logger.warn(`Importe inválido para ${externalReference}`);
      throw new BadRequestException('El importe del pago no coincide con la reserva');
    }
    if (payment.currency_id !== pago.currency) {
      this.logger.warn(`Moneda inválida para ${externalReference}`);
      throw new BadRequestException('La moneda del pago no coincide con la reserva');
    }

    pago.payment_id = String(payment.id);
    pago.status = payment.status ?? 'unknown';
    pago.status_detail = payment.status_detail ?? null;
    pago.payment_method_id = payment.payment_method_id ?? null;
    pago.approved_at = payment.date_approved ? new Date(payment.date_approved) : null;
    await this.pagos.save(pago);

    if (payment.status === 'approved') {
      await this.reservasService.confirmarPago(pago.reserva.id, pago.approved_at ?? new Date());
    } else if (['rejected', 'cancelled', 'refunded', 'charged_back'].includes(payment.status ?? '')) {
      await this.reservasService.rechazarPago(pago.reserva.id, this.mapearEstado(payment.status));
    }

    return { received: true };
  }

  async consultarEstado(idReserva: number, idUsuario: number) {
    const reserva = await this.reservasService.buscarPorId(idReserva, idUsuario);
    if (reserva.usuario?.id !== idUsuario) {
      throw new ForbiddenException('Solo el inquilino puede consultar el estado del pago');
    }
    const pago = await this.pagos.findOne({ where: { reserva: { id: idReserva } } });
    return {
      reserva_id: idReserva,
      estado_pago: reserva.estado_pago,
      mercado_pago_status: pago?.status ?? null,
      mercado_pago_status_detail: pago?.status_detail ?? null,
    };
  }

  private crearCliente(): MercadoPagoConfig {
    const accessToken = this.config.get<string>('MP_ACCESS_TOKEN');
    if (!accessToken) {
      throw new ServiceUnavailableException(
        'Falta configurar MP_ACCESS_TOKEN en el archivo back/.env',
      );
    }
    return new MercadoPagoConfig({ accessToken, options: { timeout: 10_000 } });
  }

  private configRequerida(nombre: string): string {
    const value = this.config.get<string>(nombre)?.trim();
    if (!value) {
      throw new ServiceUnavailableException(`Falta configurar ${nombre} en el archivo back/.env`);
    }
    return value;
  }

  private mapearEstado(status?: string): EstadoPagoReserva {
    if (status === 'refunded' || status === 'charged_back') return EstadoPagoReserva.REEMBOLSADO;
    if (status === 'cancelled') return EstadoPagoReserva.CANCELADO;
    return EstadoPagoReserva.RECHAZADO;
  }

  private fechaCorta(value: Date | null): string {
    return value ? new Date(value).toISOString().slice(0, 10) : '-';
  }
}
