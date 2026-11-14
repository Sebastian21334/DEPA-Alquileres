import { Inject, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MERCADO_PAGO_PROVEEDOR } from '../proveedor/mercado-pago.interface';
import type {
  DatosCheckout,
  FirmaWebhookPago,
  IMercadoPago,
  PagoExterno,
  ResultadoReembolsoExterno,
} from '../proveedor/mercado-pago.interface';

export type { FirmaWebhookPago, PagoExterno, ResultadoReembolsoExterno } from '../proveedor/mercado-pago.interface';

@Injectable()
export class MercadoPagoService {
  constructor(@Inject(MERCADO_PAGO_PROVEEDOR) private readonly proveedor: IMercadoPago, private readonly config: ConfigService) {}

  validarConfiguracionCheckout(): void {
    for (const variable of ['MP_ACCESS_TOKEN', 'MP_SUCCESS_URL', 'MP_FAILURE_URL', 'MP_PENDING_URL']) {
      this.configRequerida(variable);
    }
  }

  crearCheckout(datos: DatosCheckout): Promise<{ id: string; url: string }> {
    return this.proveedor.crearCheckout(datos);
  }

  consultarPago(id: string): Promise<PagoExterno> {
    this.configRequerida('MP_ACCESS_TOKEN');
    return this.proveedor.consultarPago(id);
  }

  consultarCheckout(id: string): Promise<string> {
    this.configRequerida('MP_ACCESS_TOKEN');
    return this.proveedor.consultarCheckout(id);
  }

  validarWebhook(entrada: FirmaWebhookPago): void {
    const secret = this.configRequerida('MP_WEBHOOK_SECRET');
    if (!this.proveedor.firmaWebhookValida(entrada, secret))
      throw new UnauthorizedException('Firma de webhook inválida');
  }

  reembolsar(paymentId: string, importe: number, idempotencyKey: string): Promise<ResultadoReembolsoExterno> {
    this.configRequerida('MP_ACCESS_TOKEN');
    return this.proveedor.reembolsar(paymentId, importe, idempotencyKey);
  }

  consultarReembolso(paymentId: string, refundId: string): Promise<ResultadoReembolsoExterno> {
    this.configRequerida('MP_ACCESS_TOKEN');
    return this.proveedor.consultarReembolso(paymentId, refundId);
  }

  listarReembolsos(paymentId: string): Promise<ResultadoReembolsoExterno[]> {
    this.configRequerida('MP_ACCESS_TOKEN');
    return this.proveedor.listarReembolsos(paymentId);
  }

  private configRequerida(nombre: string): string {
    const valor = this.config.get<string>(nombre)?.trim();
    if (!valor) throw new ServiceUnavailableException(`Falta configurar ${nombre} en back/.env`);
    return valor;
  }
}
