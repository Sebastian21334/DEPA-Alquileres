import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Anunciante } from '../models/anunciante.model';
import { Usuario } from '../models/usuario.model';

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
  estado_liquidacion: 'NO_APLICA' | 'RETENIDO' | 'PENDIENTE_PAGO_PROPIETARIO' | 'EN_REVISION' | 'PAGADO_PROPIETARIO' | 'DEVUELTO_INQUILINO';
  codigo_generado_en: string | null;
  codigo_validado_en: string | null;
  intentos_codigo: number;
  fecha_resolucion_liquidacion: string | null;
  referencia_liquidacion: string | null;
  observacion_liquidacion: string | null;
  monto_pago: number;
  fecha_pago: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  publicacion?: {
    id: number;
    titulo: string;
    direccion?: string;
    ciudad?: { id?: number; nombre: string };
    provincia?: { id?: number; nombre: string };
    anunciante?: Anunciante;
  } | null;
  usuario_nombre?: string | null;
  usuario_apellido?: string | null;
  usuario_email?: string | null;
  usuario_telefono?: string | null;
  usuario?: Usuario | null;
}

export interface CodigoAlojamiento {
  reserva_id: number;
  codigo: string;
  generado_en: string;
  validado_en: string | null;
  estado_liquidacion: Reserva['estado_liquidacion'];
}

export interface PagoResumen {
  preference_id: string | null;
  payment_id: string | null;
  status: string;
  status_detail: string | null;
  amount: number;
  currency: string;
  payment_method_id: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface ResumenReserva {
  reserva: Reserva;
  pago: PagoResumen | null;
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

  summary(idReserva: number): Observable<ResumenReserva> {
    return this.http.get<ResumenReserva>(`${this.paymentUrl}/reservas/${idReserva}/resumen`);
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

  lodgingCode(id: number): Observable<CodigoAlojamiento> {
    return this.http.get<CodigoAlojamiento>(`${this.baseUrl}/${id}/codigo-alojamiento`);
  }

  validateLodgingCode(id: number, codigo: string): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.baseUrl}/${id}/validar-codigo`, { codigo });
  }

  reportProblem(id: number, motivo: string): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.baseUrl}/${id}/reportar-problema`, { motivo });
  }
}
