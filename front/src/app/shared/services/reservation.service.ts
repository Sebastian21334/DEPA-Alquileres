import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CrearReservaPayload {
  id_publicacion: number;
  fecha_inicio: string;
  fecha_fin: string;
}

export interface CheckoutCreado {
  reserva_id: number;
  preference_id: string;
  checkout_url: string;
  expires_at: string;
}

export interface EstadoPago {
  reserva_id: number;
  estado_pago: Reserva['estado_pago'];
  mercado_pago_status: string | null;
  mercado_pago_status_detail: string | null;
}

export interface Reserva {
  id: number;
  finalizada: boolean;
  cancelada: boolean;
  fecha_cancelacion: string | null;
  estado_pago: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'CANCELADO' | 'REEMBOLSADO';
  monto_pago: number;
  fecha_pago: string;
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
  private readonly paymentUrl = `${environment.apiUrl}/pagos`;

  createCheckout(payload: CrearReservaPayload): Observable<CheckoutCreado> {
    return this.http.post<CheckoutCreado>(`${this.paymentUrl}/checkout`, payload);
  }

  reconcilePayment(paymentId: string): Observable<EstadoPago> {
    return this.http.post<EstadoPago>(`${this.paymentUrl}/reconciliar`, { payment_id: paymentId });
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
