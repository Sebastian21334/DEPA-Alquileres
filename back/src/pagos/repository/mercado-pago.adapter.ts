import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MercadoPagoConfig,
  Payment,
  Preference,
  WebhookSignatureValidator,
} from 'mercadopago';
import { IPasarelaPagos, PagoExterno } from './pasarela-pagos.interface';
import { Reserva } from '../../reservas/entity/reserva.entity';
import { WebhookEntrada } from '../interfaces/webhook.interface';

@Injectable()
export class MercadoPagoAdapter implements IPasarelaPagos {
  constructor(private readonly config: ConfigService) {}

  validarConfiguracionCheckout(): void {
    this.crearCliente();
    for (const variable of [
      'MP_SUCCESS_URL',
      'MP_FAILURE_URL',
      'MP_PENDING_URL',
    ])
      this.configRequerida(variable);
  }

  async crearCheckout(
    reserva: Reserva,
    referencia: string,
    clave: string,
    moneda: string,
  ) {
    const client = this.crearCliente();
    const successUrl = this.configRequerida('MP_SUCCESS_URL');
    const failureUrl = this.configRequerida('MP_FAILURE_URL');
    const pendingUrl = this.configRequerida('MP_PENDING_URL');
    const preference = await new Preference(client).create({
      body: {
        items: [
          {
            id: referencia,
            title: `Reserva #${reserva.id} - ${reserva.publicacion?.titulo ?? 'Alojamiento'}`,
            description: `${this.fechaCorta(reserva.fecha_inicio)} al ${this.fechaCorta(reserva.fecha_fin)}`,
            quantity: 1,
            currency_id: moneda,
            unit_price: Number(reserva.monto_pago),
          },
        ],
        external_reference: referencia,
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
        notification_url:
          this.config.get<string>('MP_WEBHOOK_URL') || undefined,
        expires: true,
        expiration_date_to: reserva.pago_vencimiento?.toISOString(),
        metadata: { reserva_id: reserva.id },
        statement_descriptor: 'DEPA ALQUILER',
      },
      requestOptions: { idempotencyKey: clave },
    });

    if (!preference.id || !preference.init_point) {
      throw new Error('Mercado Pago no devolvió la URL del checkout');
    }

    return { id: preference.id, url: preference.init_point };
  }

  consultarPago(id: string): Promise<PagoExterno> {
    return new Payment(this.crearCliente()).get({ id });
  }

  validarWebhook(entrada: WebhookEntrada): void {
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
      throw new ServiceUnavailableException(
        `Falta configurar ${nombre} en el archivo back/.env`,
      );
    }
    return value;
  }

  private fechaCorta(value: Date | null): string {
    return value ? new Date(value).toISOString().slice(0, 10) : '-';
  }
}
