import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { UBICACION_REPOSITORY } from '../repository/ubicacion.repository.interface';
import type { IUbicacionRepository } from '../repository/ubicacion.repository.interface';
import { Provincia } from '../entity/provincia.entity';
import { Ciudad } from '../entity/ciudad.entity';
import {
  GEOCODIFICACION,
  type IGeocodificacion,
} from '../proveedor/geocodificacion.interface';

@Injectable()
export class UbicacionService {
  constructor(@Inject(UBICACION_REPOSITORY) private readonly ubicacionRepo: IUbicacionRepository, @Inject(GEOCODIFICACION) private readonly geocodificacion: IGeocodificacion) {}

  /** Búsqueda puntual con cache y un máximo de una consulta externa por segundo. */
  async buscarDireccion(direccion?: string, ciudad?: string, provincia?: string) {
    const partes = [direccion, ciudad, provincia, 'Argentina']
      .map((valor) => valor?.trim())
      .filter((valor): valor is string => Boolean(valor));
    if (partes.length < 4 || partes.some((valor) => valor.length > 255)) {
      throw new BadRequestException(
        'Completá dirección, ciudad y provincia antes de buscar.',
      );
    }

    try {
      return await this.geocodificacion.buscar(partes.join(', '));
    } catch {
      throw new ServiceUnavailableException(
        'No pudimos consultar el mapa en este momento. Intentá nuevamente.',
      );
    }
  }

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

  buscarIdsCiudadesPorNombre(nombre: string): Promise<number[]> {
    return this.ubicacionRepo.buscarIdsCiudadesPorNombre(nombre.trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, ''));
  }
}
