import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Ciudad, Provincia } from '../models/ubicacion.model';

// Consume el módulo `ubicacion` del backend (back/src/ubicacion). No existe un
// endpoint que devuelva "todas las ciudades" de una: el backend las expone
// anidadas por provincia (GET /ubicacion/provincias/:id/ciudades). Para el
// selector de Locación de búsqueda avanzada, que necesita una lista plana,
// se piden todas las provincias y luego se piden en paralelo las ciudades de
// cada una, aplanando el resultado.
@Injectable({ providedIn: 'root' })
export class UbicacionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/ubicacion`;

  /** GET /ubicacion/provincias */
  getProvincias(): Observable<Provincia[]> {
    return this.http.get<Provincia[]>(`${this.baseUrl}/provincias`);
  }

  /** GET /ubicacion/provincias/:id/ciudades */
  getCiudadesPorProvincia(idProvincia: number): Observable<Ciudad[]> {
    return this.http.get<Ciudad[]>(`${this.baseUrl}/provincias/${idProvincia}/ciudades`);
  }

  /**
   * Lista plana de todas las ciudades, con su provincia embebida, para
   * poblar el selector único de "Locación" en búsqueda avanzada (ver
   * prototipo: "Villa María, Cba."). Hace 1 request de provincias + N
   * requests de ciudades (una por provincia) en paralelo.
   */
  getTodasCiudades(): Observable<Ciudad[]> {
    return this.getProvincias().pipe(
      switchMap((provincias) => {
        if (!provincias.length) return [];

        const porProvincia = provincias.map((provincia) =>
          this.getCiudadesPorProvincia(provincia.id).pipe(
            map((ciudades) => ciudades.map((c) => ({ ...c, provincia }))),
          ),
        );

        return forkJoin(porProvincia).pipe(map((listas) => listas.flat()));
      }),
    );
  }
}