export interface CondicionesCobro {
  precio_unitario_origen: string;
  moneda_origen: 'ARS' | 'USD';
  total_origen: string;
  total_cobro: string;
  cotizacion_id: number | null;
  emitida_en: string;
  vence_en: string;
}
