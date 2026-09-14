import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FechaDisponible {
  id: number;
  fecha: string;
  disponible: boolean;
  reserva?: { id: number } | null;
}

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/disponibilidad`;

  getByPublication(idPublicacion: number): Observable<FechaDisponible[]> {
    return this.http.get<FechaDisponible[]>(`${this.baseUrl}/publicacion/${idPublicacion}`);
  }

  addRange(idPublicacion: number, start: string, end: string): Observable<FechaDisponible[]> {
    return this.http.post<FechaDisponible[]>(this.baseUrl, {
      id_publicacion: idPublicacion,
      fecha_inicio: start,
      fecha_fin: end,
    });
  }

  setAvailable(id: number, disponible: boolean): Observable<FechaDisponible> {
    return this.http.patch<FechaDisponible>(`${this.baseUrl}/${id}`, { disponible });
  }
}
