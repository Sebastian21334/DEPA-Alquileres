import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { UBICACION_REPOSITORY } from '../repository/ubicacion.repository.interface';
import type { IUbicacionRepository } from '../repository/ubicacion.repository.interface';
import { Provincia } from '../entity/provincia.entity';
import { Ciudad } from '../entity/ciudad.entity';

@Injectable()
export class UbicacionService {
  private readonly geocodificaciones = new Map<string, Array<{ nombre: string; latitud: number; longitud: number }>>();
  private colaGeocodificacion: Promise<void> = Promise.resolve();
  private proximaConsultaPermitida = 0;

  constructor(
    @Inject(UBICACION_REPOSITORY)
    private readonly ubicacionRepo: IUbicacionRepository,
  ) {}

  /** Búsqueda puntual con cache y un máximo de una consulta externa por segundo. */
  async buscarDireccion(direccion?: string, ciudad?: string, provincia?: string) {
    const partes = [direccion, ciudad, provincia, 'Argentina']
      .map((valor) => valor?.trim())
      .filter((valor): valor is string => Boolean(valor));
    if (partes.length < 4 || partes.some((valor) => valor.length > 255)) {
      throw new BadRequestException('Completá dirección, ciudad y provincia antes de buscar.');
    }

    const consulta = partes.join(', ');
    const clave = consulta.toLocaleLowerCase('es-AR');
    const cacheado = this.geocodificaciones.get(clave);
    if (cacheado) return cacheado;

    let resultado: Array<{ nombre: string; latitud: number; longitud: number }> = [];
    const tarea = this.colaGeocodificacion.then(async () => {
      const espera = Math.max(0, this.proximaConsultaPermitida - Date.now());
      if (espera) await new Promise((resolve) => setTimeout(resolve, espera));

      try {
        const params = new URLSearchParams({
          q: consulta,
          format: 'jsonv2',
          addressdetails: '1',
          countrycodes: 'ar',
          limit: '5',
        });
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
          headers: {
            'User-Agent': 'DEPA-Seminario-Integrador/1.0',
            'Accept-Language': 'es-AR,es',
          },
          signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) throw new Error(`Nominatim respondió ${response.status}`);
        const datos = await response.json() as Array<{ display_name: string; lat: string; lon: string }>;
        resultado = datos.map((item) => ({
          nombre: item.display_name,
          latitud: Number(item.lat),
          longitud: Number(item.lon),
        })).filter((item) => Number.isFinite(item.latitud) && Number.isFinite(item.longitud));
        this.geocodificaciones.set(clave, resultado);
        if (this.geocodificaciones.size > 500) {
          const primeraClave = this.geocodificaciones.keys().next().value;
          if (primeraClave) this.geocodificaciones.delete(primeraClave);
        }
      } catch {
        throw new ServiceUnavailableException('No pudimos consultar el mapa en este momento. Intentá nuevamente.');
      } finally {
        this.proximaConsultaPermitida = Date.now() + 1000;
      }
    });

    this.colaGeocodificacion = tarea.then(() => undefined, () => undefined);
    await tarea;
    return resultado;
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
