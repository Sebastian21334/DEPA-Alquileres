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
  getProvincias() {
    return this.ubicacionRepo.buscarTodasProvincias();
  }

  async getProvinciaPorId(id: number): Promise<Provincia> {
    const provincia = await this.ubicacionRepo.buscarProvinciaPorId(id);
    if (!provincia) throw new NotFoundException(`La provincia con ID ${id} no existe`);
    return provincia;
  }

  crearProvincia(datos: Partial<Provincia>) {
    return this.ubicacionRepo.crearProvincia(datos);
  }

  // --- CIUDADES ---
  async getCiudadPorId(id: number): Promise<Ciudad> {
    const ciudad = await this.ubicacionRepo.buscarCiudadPorId(id);
    if (!ciudad) throw new NotFoundException(`La ciudad con ID ${id} no existe`);
    return ciudad;
  }

  async getCiudadesPorProvincia(idProvincia: number) {
    await this.getProvinciaPorId(idProvincia); // valida que exista la provincia
    return this.ubicacionRepo.buscarCiudadesPorProvincia(idProvincia);
  }

  crearCiudad(datos: Partial<Ciudad>) {
    return this.ubicacionRepo.crearCiudad(datos);
  }
}