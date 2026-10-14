import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Ciudad, Provincia } from '../models/ubicacion.model';

export interface ResultadoGeocodificacion {
  nombre: string;
  latitud: number;
  longitud: number;
}

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

  /** Búsqueda puntual; el usuario la inicia con el botón del selector de mapa. */
  buscarDireccion(
    direccion: string,
    ciudad: string,
    provincia: string,
  ): Observable<ResultadoGeocodificacion[]> {
    return this.http.get<ResultadoGeocodificacion[]>(`${this.baseUrl}/buscar-direccion`, {
      params: { direccion, ciudad, provincia },
    });
  }
}
