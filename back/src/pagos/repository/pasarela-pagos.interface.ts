import type { Reserva } from '../../reservas/entity/reserva.entity';
import type { WebhookEntrada } from '../interfaces/webhook.interface';

export const PASARELA_PAGOS = 'PASARELA_PAGOS';

export interface PagoExterno {
  id?: number | string;
  external_reference?: string;
  transaction_amount?: number;
  currency_id?: string;
  status?: string;
  status_detail?: string;
  payment_method_id?: string;
  date_approved?: string;
}

export interface IPasarelaPagos {
  validarConfiguracionCheckout(): void;
  crearCheckout(
    reserva: Reserva,
    referencia: string,
    clave: string,
    moneda: string,
  ): Promise<{ id: string; url: string }>;
  consultarPago(id: string): Promise<PagoExterno>;
  validarWebhook(entrada: WebhookEntrada): void;
}
