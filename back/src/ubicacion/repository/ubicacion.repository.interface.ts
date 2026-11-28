import { Provincia } from '../entity/provincia.entity';
import { Ciudad } from '../entity/ciudad.entity';
import type { EntityManager } from 'typeorm';

export interface IUbicacionRepository {
  conUbicacionesBloqueadas<T>(operacion: (transaccion: EntityManager) => Promise<T>): Promise<T>;
  buscarProvinciaParaModificar(id: number, transaccion: EntityManager): Promise<Provincia | null>;
  buscarCiudadParaModificar(id: number, transaccion: EntityManager): Promise<Ciudad | null>;
  buscarProvinciaPorNombre(nombre: string, transaccion: EntityManager): Promise<Provincia | null>;
  buscarCiudadPorNombre(nombre: string, provinciaId: number, transaccion: EntityManager): Promise<Ciudad | null>;
  guardarProvincia(provincia: Provincia, transaccion: EntityManager): Promise<Provincia>;
  guardarCiudad(ciudad: Ciudad, transaccion: EntityManager): Promise<Ciudad>;
  crearProvincia(nombre: string, transaccion: EntityManager): Promise<Provincia>;
  crearCiudad(nombre: string, provincia: Provincia, transaccion: EntityManager): Promise<Ciudad>;
  eliminarProvincia(id: number, transaccion: EntityManager): Promise<void>;
  eliminarCiudad(id: number, transaccion: EntityManager): Promise<void>;
  // Provincias
  buscarTodasProvincias(): Promise<Provincia[]>;
  buscarProvinciaPorId(id: number): Promise<Provincia | null>;

  // Ciudades
  buscarCiudadPorId(id: number): Promise<Ciudad | null>;
  buscarIdsCiudadesPorNombre(nombre: string): Promise<number[]>;
  buscarCiudadesPorProvincia(idProvincia: number): Promise<Ciudad[]>;
}

export const UBICACION_REPOSITORY = 'UBICACION_REPOSITORY';
