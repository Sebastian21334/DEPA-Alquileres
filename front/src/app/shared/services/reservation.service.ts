import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CrearReservaPayload {
  id_publicacion: number;
  id_metodo_pago: number;
  fecha_inicio: string;
  fecha_fin: string;
}

export interface ReservaCreada {
  id: number;
  monto_pago: number;
  fecha_inicio: string;
  fecha_fin: string;
}

export interface Reserva {
  id: number;
  finalizada: boolean;
  cancelada: boolean;
  fecha_cancelacion: string | null;
  monto_pago: number;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  publicacion?: { id: number; titulo: string; direccion?: string } | null;
  usuario_nombre?: string | null;
  usuario_apellido?: string | null;
  usuario_email?: string | null;
  usuario_telefono?: string | null;
  usuario?: { id: number; nombre: string; apellido: string; email: string; telefono?: string } | null;
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reservas`;

  create(payload: CrearReservaPayload): Observable<ReservaCreada> {
    return this.http.post<ReservaCreada>(this.baseUrl, payload);
  }

  mine(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.baseUrl}/mis-reservas`);
  }

  received(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.baseUrl}/recibidas`);
  }

  cancel(id: number): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.baseUrl}/${id}/cancelar`, {});
  }

  finish(id: number): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.baseUrl}/${id}/finalizar`, {});
  }
}
