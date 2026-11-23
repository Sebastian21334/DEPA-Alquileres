import { Provincia } from '../entity/provincia.entity';
import { Ciudad } from '../entity/ciudad.entity';

export interface IUbicacionRepository {
  // Provincias
  buscarTodasProvincias(): Promise<Provincia[]>;
  buscarProvinciaPorId(id: number): Promise<Provincia | null>;

  // Ciudades
  buscarCiudadPorId(id: number): Promise<Ciudad | null>;
  buscarCiudadesPorProvincia(idProvincia: number): Promise<Ciudad[]>;
}

export const UBICACION_REPOSITORY = 'UBICACION_REPOSITORY';
