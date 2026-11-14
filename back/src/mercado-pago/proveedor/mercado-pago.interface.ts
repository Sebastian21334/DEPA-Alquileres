export const MERCADO_PAGO_PROVEEDOR = Symbol('MERCADO_PAGO_PROVEEDOR');

export type DatosCheckout = {
  idReserva: number;
  titulo?: string;
  inicio: string | null;
  fin: string | null;
  importe: number;
  moneda: string;
  nombre: string | null;
  apellido: string | null;
  email: string | null;
  vencimiento: Date | null;
  referencia: string;
  clave: string;
};

export type FirmaWebhookPago = {
  dataId?: string;
  signature?: string;
  requestId?: string;
};

export type PagoExterno = {
  id?: string | number;
  external_reference?: string;
  transaction_amount?: number;
  currency_id?: string;
  status?: string;
  status_detail?: string;
  payment_method_id?: string;
  date_approved?: string;
  chargeback_id?: string;
  refunds?: ResultadoReembolsoExterno[];
};

export type ResultadoReembolsoExterno = {
  id?: string | number;
  payment_id?: string | number;
  status?: string;
  amount?: number;
  currency_id?: string;
};

export interface IMercadoPago {
  crearCheckout(datos: DatosCheckout): Promise<{ id: string; url: string }>;
  consultarCheckout(id: string): Promise<string>;
  consultarPago(id: string): Promise<PagoExterno>;
  firmaWebhookValida(entrada: FirmaWebhookPago, secret: string): boolean;
  reembolsar(paymentId: string, importe: number, idempotencyKey: string): Promise<ResultadoReembolsoExterno>;
  consultarReembolso(paymentId: string, refundId: string): Promise<ResultadoReembolsoExterno>;
  listarReembolsos(paymentId: string): Promise<ResultadoReembolsoExterno[]>;
}
