import { Provincia } from '../entity/provincia.entity';
import { Ciudad } from '../entity/ciudad.entity';

export interface IUbicacionRepository {
  // Provincias
  buscarTodasProvincias(): Promise<Provincia[]>;
  buscarProvinciaPorId(id: number): Promise<Provincia | null>;
  crearProvincia(datos: Partial<Provincia>): Promise<Provincia>;
  actualizarProvincia(
    id: number,
    datos: Partial<Provincia>,
  ): Promise<Provincia>;
  eliminarProvincia(id: number): Promise<void>;

  // Ciudades
  buscarCiudadPorId(id: number): Promise<Ciudad | null>;
  buscarCiudadesPorProvincia(idProvincia: number): Promise<Ciudad[]>;
  crearCiudad(datos: Partial<Ciudad>): Promise<Ciudad>;
  actualizarCiudad(id: number, datos: Partial<Ciudad>): Promise<Ciudad>;
  eliminarCiudad(id: number): Promise<void>;
}

export const UBICACION_REPOSITORY = 'UBICACION_REPOSITORY';
