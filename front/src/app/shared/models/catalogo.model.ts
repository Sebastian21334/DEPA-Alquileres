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

/** Indica si la modalidad trabaja con calendario y reservas por fecha (alquiler temporal). */
export function admiteReservasPorFecha(modalidad?: Modalidad | null): boolean {
  return modalidad?.admite_reservas_por_fecha ?? false;
}
