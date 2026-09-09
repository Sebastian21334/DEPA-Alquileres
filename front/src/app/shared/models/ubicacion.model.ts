// Interfaces que reflejan las entidades Provincia y Ciudad del módulo `ubicacion` del backend.
// GET /ubicacion/provincias y GET /ubicacion/provincias/:id/ciudades

export interface Provincia {
  id: number;
  nombre: string;
}

export interface Ciudad {
  id: number;
  nombre: string;
  provincia?: Provincia;
}
