export const PROVEEDOR_DOLAR = 'PROVEEDOR_DOLAR';
export interface DatosDolar {
  compra: number;
  venta: number;
  actualizadaEn: Date;
}
export interface IProveedorDolar {
  consultar(): Promise<DatosDolar>;
}
