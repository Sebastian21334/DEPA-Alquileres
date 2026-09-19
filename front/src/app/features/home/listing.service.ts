import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Publicacion, PublicacionPayload } from '../../shared/models/publicacion.model';

/**
 * Consume el módulo `publicaciones` del backend (back/src/publicaciones).
 *
 * Endpoint usado por esta página: GET /publicaciones (método `listarActivas`).
 * Devuelve únicamente publicaciones con `activa = true` (RN-10 / RN-21), con las
 * relaciones necesarias para la tarjeta (imágenes, anunciante, catálogos, ubicación).
 *
 * Los filtros y la búsqueda textual se resuelven en el backend para conservar
 * la paginación correcta sin descargar el catálogo completo.
 */
@Injectable({ providedIn: 'root' })
export class ListingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/publicaciones`;

  getActivas(opciones: {
    pagina?: number;
    limite?: number;
    categoria?: string;
    busqueda?: string;
    idsCiudad?: number[];
    idsTipoPropiedad?: number[];
    idsTipoMoneda?: number[];
    precioMin?: number | null;
    precioMax?: number | null;
    ambientes?: string[];
  } = {}): Observable<PaginaPublicaciones> {
    let params = new HttpParams();
    if (opciones.pagina) params = params.set('pagina', opciones.pagina);
    if (opciones.limite) params = params.set('limite', opciones.limite);
    if (opciones.categoria) params = params.set('categoria', opciones.categoria);
    if (opciones.busqueda?.trim()) params = params.set('q', opciones.busqueda.trim());
    if (opciones.idsCiudad?.length) params = params.set('idsCiudad', opciones.idsCiudad.join(','));
    if (opciones.idsTipoPropiedad?.length) params = params.set('idsTipoPropiedad', opciones.idsTipoPropiedad.join(','));
    if (opciones.idsTipoMoneda?.length) params = params.set('idsTipoMoneda', opciones.idsTipoMoneda.join(','));
    if (opciones.precioMin != null) params = params.set('precioMin', opciones.precioMin);
    if (opciones.precioMax != null) params = params.set('precioMax', opciones.precioMax);
    if (opciones.ambientes?.length) params = params.set('ambientes', opciones.ambientes.join(','));
    return this.http.get<PaginaPublicaciones>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Publicacion> {
    return this.http.get<Publicacion>(`${this.baseUrl}/${id}`);
  }

  getByAdvertiser(id: number): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(`${this.baseUrl}/anunciante/${id}`, {
      params: { activa: 'true' },
    });
  }


  create(payload: PublicacionPayload): Observable<Publicacion> {
    return this.http.post<Publicacion>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<PublicacionPayload>): Observable<Publicacion> {
    return this.http.patch<Publicacion>(`${this.baseUrl}/${id}`, payload);
  }
}

export interface PaginaPublicaciones {
  datos: Publicacion[];
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}
