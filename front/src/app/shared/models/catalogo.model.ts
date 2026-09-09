// Interfaces que reflejan los catálogos del módulo `catalogos` del backend.
// Todas comparten la misma forma (id, nombre, descripción opcional).
// GET /catalogos/tipos-propiedad | /modalidades | /tipos-moneda | /tipos-anunciante | /metodos-pago | /roles

export interface Catalogo {
  id: number;
  nombre: string;
  descripcion?: string | null;
}

export type TipoPropiedad = Catalogo;
export type Modalidad = Catalogo;
export type TipoMoneda = Catalogo;
export type TipoAnunciante = Catalogo;
export type MetodoPago = Catalogo;
export type Rol = Catalogo;
