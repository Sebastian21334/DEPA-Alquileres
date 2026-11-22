import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Publicacion, PublicacionPayload } from '../models/publicacion.model';
import { Imagen } from '../models/imagen.model';

export interface PagoPublicacion {
  id: string;
  reservaId: number;
  /** Título de la publicación; el panel del anunciante lo muestra porque junta todas. */
  publicacion?: string | null;
  fecha: string | null;
  importe: number | null;
  moneda: string | null;
  referencia: string | null;
  observacion: string | null;
}

// Operaciones del anunciante verificado sobre sus propias publicaciones e imágenes.
// El backend valida la propiedad con AnuncianteGuard; acá solo se arman los requests.
@Injectable({ providedIn: 'root' })
export class GestionPublicacionesService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  /** GET /publicaciones/anunciante/:id — todas (activas e inactivas). */
  listarMias(idAnunciante: number): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(`${this.api}/publicaciones/anunciante/${idAnunciante}`);
  }

  /** Lista privada que incluye la papelera del anunciante autenticado. */
  listarConPapelera(): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(`${this.api}/publicaciones/mias`);
  }

  cambiarActividad(id: number, activa: boolean): Observable<Publicacion> {
    return this.http.patch<Publicacion>(`${this.api}/publicaciones/${id}`, { activa });
  }

  restaurar(id: number): Observable<Publicacion> {
    return this.http.patch<Publicacion>(`${this.api}/publicaciones/${id}/restaurar`, {});
  }

  listarLiquidaciones(idPublicacion: number): Observable<PagoPublicacion[]> {
    return this.http.get<PagoPublicacion[]>(`${this.api}/reservas/liquidaciones/publicacion/${idPublicacion}`);
  }

  /** Pagos registrados de todas las publicaciones del anunciante autenticado (T55). */
  listarMisLiquidaciones(): Observable<PagoPublicacion[]> {
    return this.http.get<PagoPublicacion[]>(`${this.api}/reservas/liquidaciones/mias`);
  }

  /** POST /publicaciones (alineado con back/src/publicaciones/dto/crear-publicacion.dto.ts). */
  crear(dto: PublicacionPayload): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${this.api}/publicaciones`, dto);
  }

  /** DELETE /publicaciones/:id */
  eliminar(id: number) {
    return this.http.delete<Publicacion>(`${this.api}/publicaciones/${id}`);
  }

  /** POST /imagenes/publicacion/:id (multipart, campo "archivo") */
  subirImagen(idPublicacion: number, archivo: File): Observable<Imagen> {
    const body = new FormData();
    body.append('archivo', archivo);
    return this.http.post<Imagen>(`${this.api}/imagenes/publicacion/${idPublicacion}`, body);
  }

  /** La primera imagen del orden completo será la portada. */
  ordenarImagenes(idPublicacion: number, ids: number[]): Observable<Imagen[]> {
    return this.http.patch<Imagen[]>(`${this.api}/imagenes/publicacion/${idPublicacion}/orden`, { ids });
  }

  /** DELETE /imagenes/:id */
  eliminarImagen(id: number) {
    return this.http.delete(`${this.api}/imagenes/${id}`);
  }
}
