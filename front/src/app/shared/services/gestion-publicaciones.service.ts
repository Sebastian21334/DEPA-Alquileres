import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Publicacion } from '../models/publicacion.model';
import { Imagen } from '../models/imagen.model';

// Alineado con back/src/publicaciones/dto/crear-publicacion.dto.ts.
export interface CrearPublicacionDto {
  titulo: string;
  descripcion: string;
  precio: number;
  direccion: string;
  cantidad_ambientes: number;
  superficie: number;
  idTipoMoneda: number;
  idModalidad: number;
  idProvincia: number;
  idCiudad: number;
  idTipoPropiedad: number;
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

  /** POST /publicaciones */
  crear(dto: CrearPublicacionDto): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${this.api}/publicaciones`, dto);
  }

  /** DELETE /publicaciones/:id */
  eliminar(id: number) {
    return this.http.delete(`${this.api}/publicaciones/${id}`);
  }

  /** POST /imagenes/publicacion/:id (multipart, campo "archivo") */
  subirImagen(idPublicacion: number, archivo: File): Observable<Imagen> {
    const body = new FormData();
    body.append('archivo', archivo);
    return this.http.post<Imagen>(`${this.api}/imagenes/publicacion/${idPublicacion}`, body);
  }

  /** DELETE /imagenes/:id */
  eliminarImagen(id: number) {
    return this.http.delete(`${this.api}/imagenes/${id}`);
  }
}
