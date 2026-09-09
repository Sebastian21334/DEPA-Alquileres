import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Publicacion } from '../../shared/models/publicacion.model';

/**
 * Consume el módulo `publicaciones` del backend (back/src/publicaciones).
 *
 * Endpoint usado por esta página: GET /publicaciones (método `listarActivas`).
 * Devuelve únicamente publicaciones con `activa = true` (RN-10 / RN-21), con las
 * relaciones necesarias para la tarjeta (imágenes, anunciante, catálogos, ubicación).
 *
 * Contrato de filtros esperado (RF8 / RN-22) — pendiente de implementar en el
 * backend: se documenta acá para cuando se agregue soporte de query params:
 *
 *   GET /publicaciones?ciudad=<texto>&idTipoPropiedad=<id>&idModalidad=<id>
 *                      &precioMin=<num>&precioMax=<num>&ambientes=<num>
 *
 * Hasta que el backend soporte esos params, el filtrado (ubicación, tipo,
 * precio, ambientes, modalidad) se resuelve del lado del cliente en
 * HomeComponent sobre el resultado de este mismo endpoint.
 */
@Injectable({ providedIn: 'root' })
export class ListingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/publicaciones`;

  getActivas(): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(this.baseUrl);
  }
}
