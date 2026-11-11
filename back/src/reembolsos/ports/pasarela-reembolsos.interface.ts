export const PASARELA_REEMBOLSOS = 'PASARELA_REEMBOLSOS';

export interface ResultadoReembolsoExterno {
  id?: string | number;
  status?: string;
  amount?: number;
  currency_id?: string;
}

export interface IPasarelaReembolsos {
  reembolsar(paymentId: string, importe: number, idempotencyKey: string): Promise<ResultadoReembolsoExterno>;
  consultarReembolso(paymentId: string, refundId: string): Promise<ResultadoReembolsoExterno>;
}
