import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
    if (!provincia)
      throw new NotFoundException(`La provincia con ID ${id} no existe`);
    return provincia;
  }

  /** Crea una provincia; las validaciones de formato vienen del controlador. */
  crearProvincia(datos: Partial<Provincia>) {
    return this.ubicacionRepo.crearProvincia(datos);
  }

  async actualizarProvincia(id: number, datos: Partial<Provincia>) {
    await this.getProvinciaPorId(id);
    return this.ubicacionRepo.actualizarProvincia(id, datos);
  }

  async eliminarProvincia(id: number) {
    await this.getProvinciaPorId(id);
    await this.eliminarSeguro(() => this.ubicacionRepo.eliminarProvincia(id), 'provincia');
    return { mensaje: 'Provincia eliminada correctamente' };
  }

  // --- CIUDADES ---
  /** Busca una ciudad y garantiza que exista antes de usarla como relacion. */
  async getCiudadPorId(id: number): Promise<Ciudad> {
    const ciudad = await this.ubicacionRepo.buscarCiudadPorId(id);
    if (!ciudad)
      throw new NotFoundException(`La ciudad con ID ${id} no existe`);
    return ciudad;
  }

  /** Lista ciudades y valida primero que la provincia padre exista. */
  async getCiudadesPorProvincia(idProvincia: number) {
    // Primero valida el padre para no devolver un listado vacío ambiguo.
    await this.getProvinciaPorId(idProvincia); // valida que exista la provincia
    return this.ubicacionRepo.buscarCiudadesPorProvincia(idProvincia);
  }

  /** Crea una ciudad asociada a una provincia ya resuelta por el controlador. */
  crearCiudad(datos: Partial<Ciudad>) {
    return this.ubicacionRepo.crearCiudad(datos);
  }

  async actualizarCiudad(id: number, nombre: string, idProvincia: number) {
    await this.getCiudadPorId(id);
    const provincia = await this.getProvinciaPorId(idProvincia);
    return this.ubicacionRepo.actualizarCiudad(id, { nombre, provincia });
  }

  async eliminarCiudad(id: number) {
    await this.getCiudadPorId(id);
    await this.eliminarSeguro(() => this.ubicacionRepo.eliminarCiudad(id), 'ciudad');
    return { mensaje: 'Ciudad eliminada correctamente' };
  }

  private async eliminarSeguro(accion: () => Promise<void>, nombre: string): Promise<void> {
    try {
      await accion();
    } catch (error: any) {
      if (error?.code === '23503') {
        throw new ConflictException(`No se puede eliminar la ${nombre} porque está siendo utilizada`);
      }
      throw error;
    }
  }
}
