// Interfaces que reflejan los catálogos del módulo `catalogos` del backend.
// Todas comparten la misma forma (id, nombre, descripción opcional).
// GET /catalogos/tipos-propiedad | /modalidades | /tipos-moneda | /tipos-anunciante | /roles

export interface Catalogo {
  id: number;
  nombre: string;
  descripcion?: string | null;
}

export type TipoPropiedad = Catalogo;
export interface Modalidad extends Catalogo {
  permite_reservas_por_fecha?: boolean | null;
  /** Calculado por el back con la única regla de negocio; el front no la reimplementa. */
  admite_reservas_por_fecha: boolean;
}
export type TipoMoneda = Catalogo;
export type TipoAnunciante = Catalogo;
export type Rol = Catalogo;

export type CodigoMoneda = 'ARS' | 'USD';

/** Moneda del catálogo con su código, para elegirla en el filtro de precio. */
export interface MonedaPrecio {
  id: number;
  codigo: CodigoMoneda;
}

/** Código que figura en el nombre de la moneda, por ejemplo «Dólar (USD)». */
export function codigoMoneda(moneda: TipoMoneda): CodigoMoneda | null {
  const codigo = moneda.nombre.match(/\b(ARS|USD)\b/i)?.[1].toUpperCase();
  return codigo === 'ARS' || codigo === 'USD' ? codigo : null;
}

/** Indica si la modalidad trabaja con calendario y reservas por fecha (alquiler temporal). */
export function admiteReservasPorFecha(modalidad?: Modalidad | null): boolean {
  return modalidad?.admite_reservas_por_fecha ?? false;
}
