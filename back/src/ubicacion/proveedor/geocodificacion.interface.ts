export const GEOCODIFICACION = 'GEOCODIFICACION';

export interface DireccionEncontrada {
  nombre: string;
  latitud: number;
  longitud: number;
}

export interface IGeocodificacion {
  buscar(consulta: string): Promise<DireccionEncontrada[]>;
}
