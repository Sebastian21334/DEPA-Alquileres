export const GEOCODIFICACION_REPOSITORY = 'GEOCODIFICACION_REPOSITORY';

export interface DireccionEncontrada {
  nombre: string;
  latitud: number;
  longitud: number;
}

export interface IGeocodificacionRepository {
  buscar(consulta: string): Promise<DireccionEncontrada[]>;
}
