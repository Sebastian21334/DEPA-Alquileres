import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UBICACION_REPOSITORY } from '../repository/ubicacion.repository.interface';
import type { IUbicacionRepository } from '../repository/ubicacion.repository.interface';
import { Provincia } from '../entity/provincia.entity';
import { Ciudad } from '../entity/ciudad.entity';

@Injectable()
export class UbicacionService {
  constructor(
    @Inject(UBICACION_REPOSITORY)
    private readonly ubicacionRepo: IUbicacionRepository,
  ) {}

  // --- PROVINCIAS ---
  /** Lista todas las provincias disponibles para los formularios de publicaciones. */
  getProvincias() {
    return this.ubicacionRepo.buscarTodasProvincias();
  }

  /** Busca una provincia y convierte la ausencia en un 404 de negocio. */
  async getProvinciaPorId(id: number): Promise<Provincia> {
    const provincia = await this.ubicacionRepo.buscarProvinciaPorId(id);
    if (!provincia) throw new NotFoundException(`La provincia con ID ${id} no existe`);
    return provincia;
  }

  /** Crea una provincia; las validaciones de formato vienen del controlador. */
  crearProvincia(datos: Partial<Provincia>) {
    return this.ubicacionRepo.crearProvincia(datos);
  }

  // --- CIUDADES ---
  /** Busca una ciudad y garantiza que exista antes de usarla como relacion. */
  async getCiudadPorId(id: number): Promise<Ciudad> {
    const ciudad = await this.ubicacionRepo.buscarCiudadPorId(id);
    if (!ciudad) throw new NotFoundException(`La ciudad con ID ${id} no existe`);
    return ciudad;
  }

  /** Lista ciudades y valida primero que la provincia padre exista. */
  async getCiudadesPorProvincia(idProvincia: number) {
    await this.getProvinciaPorId(idProvincia); // valida que exista la provincia
    return this.ubicacionRepo.buscarCiudadesPorProvincia(idProvincia);
  }

  /** Crea una ciudad asociada a una provincia ya resuelta por el controlador. */
  crearCiudad(datos: Partial<Ciudad>) {
    return this.ubicacionRepo.crearCiudad(datos);
  }
}