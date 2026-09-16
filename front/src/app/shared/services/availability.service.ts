import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FechaDisponible {
  fecha: string;
  disponible: boolean;
  reserva?: { id: number } | null;
}

export interface FechaDisponibleAdministracion extends FechaDisponible {
  id: number;
  reserva: { id: number } | null;
}

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/disponibilidad`;

  getByPublication(idPublicacion: number): Observable<FechaDisponible[]> {
    return this.http.get<FechaDisponible[]>(`${this.baseUrl}/publicacion/${idPublicacion}`);
  }

  getForAdministration(idPublicacion: number): Observable<FechaDisponibleAdministracion[]> {
    return this.http.get<FechaDisponibleAdministracion[]>(
      `${this.baseUrl}/publicacion/${idPublicacion}/administracion`,
    );
  }

  addRange(idPublicacion: number, start: string, end: string): Observable<FechaDisponibleAdministracion[]> {
    return this.http.post<FechaDisponibleAdministracion[]>(this.baseUrl, {
      id_publicacion: idPublicacion,
      fecha_inicio: start,
      fecha_fin: end,
    });
  }

  setAvailable(id: number, disponible: boolean): Observable<FechaDisponibleAdministracion> {
    return this.http.patch<FechaDisponibleAdministracion>(`${this.baseUrl}/${id}`, { disponible });
  }
}
