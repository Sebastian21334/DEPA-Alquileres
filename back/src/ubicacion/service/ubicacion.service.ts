import { GEOCODIFICACION_REPOSITORY } from '../repository/geocodificacion.repository.interface';
import type { IGeocodificacionRepository } from '../repository/geocodificacion.repository.interface';
import { RegistroEnUsoError } from '../../common/persistence/registro-en-uso.error';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { UBICACION_REPOSITORY } from '../repository/ubicacion.repository.interface';
import type { IUbicacionRepository } from '../repository/ubicacion.repository.interface';
import { Provincia } from '../entity/provincia.entity';
import { CrearCiudadDto } from '../dto/crear-ciudad.dto';
import { Ciudad } from '../entity/ciudad.entity';

@Injectable()
export class UbicacionService {
  constructor(
    @Inject(UBICACION_REPOSITORY)
    private readonly ubicacionRepo: IUbicacionRepository,
    @Inject(GEOCODIFICACION_REPOSITORY)
    private readonly geocodificacionRepo: IGeocodificacionRepository,
  ) {}

  /** Búsqueda puntual con cache y un máximo de una consulta externa por segundo. */
  async buscarDireccion(
    direccion?: string,
    ciudad?: string,
    provincia?: string,
  ) {
    const partes = [direccion, ciudad, provincia, 'Argentina']
      .map((valor) => valor?.trim())
      .filter((valor): valor is string => Boolean(valor));
    if (partes.length < 4 || partes.some((valor) => valor.length > 255)) {
      throw new BadRequestException(
        'Completá dirección, ciudad y provincia antes de buscar.',
      );
    }

    try {
      return await this.geocodificacionRepo.buscar(partes.join(', '));
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

  /** Crea una provincia; las validaciones de formato vienen del controlador. */
  crearProvincia(datos: Partial<Provincia>) {
    return this.ubicacionRepo.crearProvincia(datos);
  }

  async actualizarProvincia(id: number, datos: Partial<Provincia>) {
    await this.getProvinciaPorId(id);
    const actualizada = await this.ubicacionRepo.actualizarProvincia(id, datos);
    if (!actualizada) throw new NotFoundException('La provincia ya no existe');
    return actualizada;
  }

  async eliminarProvincia(id: number) {
    await this.getProvinciaPorId(id);
    await this.eliminarSeguro(
      () => this.ubicacionRepo.eliminarProvincia(id),
      'provincia',
    );
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

  /** La capa de negocio resuelve la provincia antes de persistir la ciudad. */
  async crearCiudad(datos: CrearCiudadDto) {
    const provincia = await this.getProvinciaPorId(datos.idProvincia);
    return this.ubicacionRepo.crearCiudad({ nombre: datos.nombre, provincia });
  }

  async actualizarCiudad(id: number, nombre: string, idProvincia: number) {
    await this.getCiudadPorId(id);
    const provincia = await this.getProvinciaPorId(idProvincia);
    const actualizada = await this.ubicacionRepo.actualizarCiudad(id, {
      nombre,
      provincia,
    });
    if (!actualizada) throw new NotFoundException('La ciudad ya no existe');
    return actualizada;
  }

  async eliminarCiudad(id: number) {
    await this.getCiudadPorId(id);
    await this.eliminarSeguro(
      () => this.ubicacionRepo.eliminarCiudad(id),
      'ciudad',
    );
    return { mensaje: 'Ciudad eliminada correctamente' };
  }

  private async eliminarSeguro(
    accion: () => Promise<void>,
    nombre: string,
  ): Promise<void> {
    try {
      await accion();
    } catch (error: unknown) {
      if (error instanceof RegistroEnUsoError) {
        throw new ConflictException(
          `No se puede eliminar la ${nombre} porque está siendo utilizada`,
        );
      }
      throw error;
    }
  }
}
