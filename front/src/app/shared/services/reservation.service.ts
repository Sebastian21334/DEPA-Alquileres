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

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reservas`;

  create(payload: CrearReservaPayload): Observable<ReservaCreada> {
    return this.http.post<ReservaCreada>(this.baseUrl, payload);
  }
}
