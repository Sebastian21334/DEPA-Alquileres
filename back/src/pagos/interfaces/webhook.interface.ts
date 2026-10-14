export interface WebhookPago {
  type?: string;
  data?: { id?: string | number };
}

export interface WebhookEntrada {
  body: WebhookPago;
  dataId?: string;
  signature?: string;
  requestId?: string;
}
