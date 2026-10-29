/** Cuerpo recibido de Mercado Pago; la firma se comprueba en la pasarela. */
export type WebhookPago = {
  type?: string;
  data?: { id?: string | number };
};

export type WebhookEntrada = {
  body: WebhookPago;
  dataId?: string;
  signature?: string;
  requestId?: string;
};
