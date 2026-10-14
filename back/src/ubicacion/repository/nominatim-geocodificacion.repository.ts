import { Injectable } from '@nestjs/common';
import {
  DireccionEncontrada,
  IGeocodificacionRepository,
} from './geocodificacion.repository.interface';

@Injectable()
export class NominatimGeocodificacionRepository implements IGeocodificacionRepository {
  private readonly geocodificaciones = new Map<
    string,
    Array<{ nombre: string; latitud: number; longitud: number }>
  >();
  private colaGeocodificacion: Promise<void> = Promise.resolve();
  private proximaConsultaPermitida = 0;

  async buscar(consulta: string): Promise<DireccionEncontrada[]> {
    const clave = consulta.toLocaleLowerCase('es-AR');
    const cacheado = this.geocodificaciones.get(clave);
    if (cacheado) return cacheado;

    let resultado: Array<{
      nombre: string;
      latitud: number;
      longitud: number;
    }> = [];
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
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          {
            headers: {
              'User-Agent': 'DEPA-Seminario-Integrador/1.0',
              'Accept-Language': 'es-AR,es',
            },
            signal: AbortSignal.timeout(8000),
          },
        );
        if (!response.ok)
          throw new Error(`Nominatim respondió ${response.status}`);
        const datos = (await response.json()) as Array<{
          display_name: string;
          lat: string;
          lon: string;
        }>;
        resultado = datos
          .map((item) => ({
            nombre: item.display_name,
            latitud: Number(item.lat),
            longitud: Number(item.lon),
          }))
          .filter(
            (item) =>
              Number.isFinite(item.latitud) && Number.isFinite(item.longitud),
          );
        this.geocodificaciones.set(clave, resultado);
        if (this.geocodificaciones.size > 500) {
          const primeraClave = this.geocodificaciones.keys().next().value;
          if (primeraClave) this.geocodificaciones.delete(primeraClave);
        }
      } catch {
        throw new Error('No se pudo consultar el proveedor de geocodificación');
      } finally {
        this.proximaConsultaPermitida = Date.now() + 1000;
      }
    });

    this.colaGeocodificacion = tarea.then(
      () => undefined,
      () => undefined,
    );
    await tarea;
    return resultado;
  }
}
