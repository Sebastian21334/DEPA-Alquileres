import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MercadoPagoConfig,
  Payment,
  PaymentRefund,
  Preference,
  WebhookSignatureValidator,
} from 'mercadopago';
import type { DatosCheckout, FirmaWebhookPago, IMercadoPago, PagoExterno, ResultadoReembolsoExterno } from './mercado-pago.interface';

@Injectable()
export class MercadoPagoAdapter implements IMercadoPago {
  constructor(private readonly config: ConfigService) {}

  async crearCheckout(datos: DatosCheckout): Promise<{ id: string; url: string }> {
    const { referencia, clave, moneda } = datos;
    const client = this.crearCliente();
    const successUrl = this.config.getOrThrow<string>('MP_SUCCESS_URL').trim();
    const failureUrl = this.config.getOrThrow<string>('MP_FAILURE_URL').trim();
    const pendingUrl = this.config.getOrThrow<string>('MP_PENDING_URL').trim();
    const preference = await new Preference(client).create({
      body: {
        items: [
          {
            id: referencia,
            title: `Reserva #${datos.idReserva} - ${datos.titulo ?? 'Alojamiento'}`,
            description: `${this.fechaCorta(datos.inicio)} al ${this.fechaCorta(datos.fin)}`,
            quantity: 1,
            currency_id: moneda,
            unit_price: datos.importe,
          },
        ],
        external_reference: referencia,
        payer: {
          name: datos.nombre ?? undefined,
          surname: datos.apellido ?? undefined,
          email: datos.email ?? undefined,
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
        expiration_date_to: datos.vencimiento?.toISOString(),
        metadata: { reserva_id: datos.idReserva },
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

  async reembolsar(paymentId: string, importe: number, idempotencyKey: string): Promise<ResultadoReembolsoExterno> {
    const client = this.crearCliente();
    return new PaymentRefund(client).create({
      payment_id: paymentId,
      body: { amount: importe },
      requestOptions: { idempotencyKey },
    });
  }

  consultarReembolso(paymentId: string, refundId: string): Promise<ResultadoReembolsoExterno> {
    const client = this.crearCliente();
    return new PaymentRefund(client).get({
      payment_id: paymentId,
      refund_id: refundId,
    });
  }

  listarReembolsos(paymentId: string): Promise<ResultadoReembolsoExterno[]> {
    return new PaymentRefund(this.crearCliente()).list({ payment_id: paymentId });
  }

  firmaWebhookValida(entrada: FirmaWebhookPago, secret: string): boolean {
    try {
      WebhookSignatureValidator.validate({
        xSignature: entrada.signature,
        xRequestId: entrada.requestId,
        dataId: entrada.dataId,
        secret,
        toleranceSeconds: 300,
      });
      return true;
    } catch {
      return false;
    }
  }

  private crearCliente(): MercadoPagoConfig {
    const accessToken = this.config.getOrThrow<string>('MP_ACCESS_TOKEN').trim();
    return new MercadoPagoConfig({ accessToken, options: { timeout: 10_000 } });
  }

  private fechaCorta(value: Date | string | null): string {
    return value ? new Date(value).toISOString().slice(0, 10) : '-';
  }
}
