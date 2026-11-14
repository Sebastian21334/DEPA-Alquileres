import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Anunciante } from '../models/anunciante.model';
import { Usuario } from '../models/usuario.model';
import { CotizacionDolar } from './cotizaciones.service';
import type { FechaDisponible } from './availability.service';
import type { EstadoEstadia } from '../utils/reservation-state';

export interface CrearReservaPayload {
  id_publicacion: number;
  fecha_inicio: string;
  fecha_fin: string;
}

export interface PresupuestoReserva {
  token: string;
  precio_unitario_origen: string;
  moneda_origen: 'ARS' | 'USD';
  total_origen: string;
  total_cobro: string;
  moneda_cobro: 'ARS';
  cantidad_dias: number;
  emitida_en: string;
  vence_en: string;
  cotizacion: CotizacionDolar | null;
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
  estado_estadia: EstadoEstadia;
  finalizada: boolean;
  cancelada: boolean;
  fecha_cancelacion: string | null;
  estado_pago:
    | 'PENDIENTE'
    | 'APROBADO'
    | 'RECHAZADO'
    | 'CANCELADO'
    | 'REEMBOLSADO'
    | 'CONTRACARGO';
  estado_liquidacion:
    | 'NO_APLICA'
    | 'RETENIDO'
    | 'PENDIENTE_PAGO_PROPIETARIO'
    | 'EN_REVISION'
    | 'PAGADO_PROPIETARIO'
    | 'DEVUELTO_INQUILINO'
    | 'DEVUELTO_PARCIAL_INQUILINO';
  codigo_generado_en: string | null;
  codigo_validado_en: string | null;
  intentos_codigo: number;
  fecha_resolucion_liquidacion: string | null;
  referencia_liquidacion: string | null;
  observacion_liquidacion: string | null;
  monto_pago: number;
  precio_unitario_contratado?: number | null;
  importe_contratado?: number | null;
  moneda_contratada?: string | null;
  moneda_origen?: string | null;
  importe_origen?: number | null;
  cotizacion_dolar?: CotizacionDolar | null;
  cotizacion_aceptada_en?: string | null;
  reprogramaciones?: ReprogramacionReserva[];
  fecha_pago: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  publicacion?: {
    id: number;
    titulo: string;
    imagenes?: { url: string }[];
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

export interface ReprogramacionReserva {
  id: number;
  fecha_inicio_anterior: string;
  fecha_fin_anterior: string;
  fecha_inicio_nueva: string;
  fecha_fin_nueva: string;
  creada_en: string;
  notificada_en: string | null;
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
  puede_reintentar: boolean;
}

export interface SolicitudCancelacion {
  id: number;
  motivo: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'VENCIDA';
  decidida_en: string | null;
  observacion: string | null;
  creada_en: string;
}

export interface Reembolso {
  id: number;
  tipo: 'TOTAL' | 'PARCIAL' | 'CONTRACARGO';
  origen: 'CANCELACION' | 'RECLAMO' | 'CONTRACARGO' | 'PAGO_TARDIO' | 'AJUSTE_ADMIN';
  importe: number;
  moneda: string;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'APROBADO' | 'RECHAZADO' | 'FALLIDO' | 'CANCELADO';
  motivo: string;
  creado_en: string;
}

export interface ParticipanteReclamo {
  id: number;
  nombre?: string;
  apellido?: string;
}

export interface Reclamo {
  id: number;
  reserva?: {
    id: number;
    publicacion?: { id?: number; titulo?: string; imagenes?: { url: string }[] } | null;
  } | null;
  anunciante?: ParticipanteReclamo | null;
  inquilino?: ParticipanteReclamo | null;
  categoria: 'LIMPIEZA' | 'MANTENIMIENTO' | 'INGRESO' | 'DESCRIPCION' | 'OTRO';
  descripcion: string;
  estado: 'ABIERTO' | 'EN_REVISION' | 'RESUELTO_INQUILINO' | 'RESUELTO_ANUNCIANTE' | 'CERRADO';
  resolucion: 'SIN_DEVOLUCION' | 'DEVOLUCION_TOTAL' | 'DEVOLUCION_PARCIAL' | null;
  importe_reembolso: number | null;
  creado_en: string;
  resuelto_en: string | null;
  evidencias?: ReclamoEvidencia[];
  mensajes?: ReclamoMensaje[];
}

export interface ReclamoEvidencia {
  id: number;
  url: string;
  nombre_archivo: string;
  tipo: string;
}

export interface ReclamoMensaje {
  id: number;
  texto: string;
  visible_para: 'TODOS' | 'ADMIN';
  creado_en: string;
  autor?: ParticipanteReclamo & { rol?: { nombre: string } | null };
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reservas`;
  private readonly paymentUrl = `${environment.apiUrl}/pagos`;

  quote(payload: CrearReservaPayload): Observable<PresupuestoReserva> {
    return this.http.post<PresupuestoReserva>(`${this.paymentUrl}/presupuesto`, payload);
  }

  createCheckout(payload: CrearReservaPayload & { presupuesto_token: string }): Observable<CheckoutCreado> {
    return this.http.post<CheckoutCreado>(`${this.paymentUrl}/checkout`, payload);
  }

  reconcilePayment(paymentId: string): Observable<EstadoPago> {
    return this.http.post<EstadoPago>(`${this.paymentUrl}/reconciliar`, { payment_id: paymentId });
  }

  retryCheckout(idReserva: number): Observable<CheckoutCreado> {
    return this.http.post<CheckoutCreado>(`${this.paymentUrl}/reservas/${idReserva}/reintentar`, {});
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

  rescheduleAvailability(id: number): Observable<FechaDisponible[]> {
    return this.http.get<FechaDisponible[]>(`${this.baseUrl}/${id}/fechas-disponibles`);
  }

  reschedule(id: number, fecha_inicio: string, fecha_fin: string): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.baseUrl}/${id}/fechas`, { fecha_inicio, fecha_fin });
  }

  retryRescheduleNotice(id: number, idCambio: number): Observable<Reserva> {
    return this.http.patch<Reserva>(
      `${this.baseUrl}/${id}/reprogramaciones/${idCambio}/notificar`,
      {},
    );
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

  requestCancellation(id: number, motivo: string): Observable<SolicitudCancelacion> {
    return this.http.post<SolicitudCancelacion>(`${this.baseUrl}/${id}/cancelacion`, { motivo });
  }

  cancellationRequest(id: number): Observable<SolicitudCancelacion | null> {
    return this.http.get<SolicitudCancelacion | null>(`${this.baseUrl}/${id}/cancelacion`);
  }

  refunds(id: number): Observable<Reembolso[]> {
    return this.http.get<Reembolso[]>(`${this.baseUrl}/${id}/reembolsos`);
  }

  createClaim(payload: { id_reserva: number; categoria: Reclamo['categoria']; descripcion: string; }): Observable<Reclamo> {
    return this.http.post<Reclamo>(`${environment.apiUrl}/reclamos`, payload);
  }

  myClaims(): Observable<Reclamo[]> {
    return this.http.get<Reclamo[]>(`${environment.apiUrl}/reclamos/mios`);
  }

  claimEvidenceUrl(id: number, evidencia: number): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${environment.apiUrl}/reclamos/${id}/evidencias/${evidencia}/url`);
  }

  uploadClaimEvidence(id: number, archivos: File[]): Observable<ReclamoEvidencia[]> {
    const datos = new FormData();
    archivos.forEach((archivo) => datos.append('evidencias', archivo));
    return this.http.post<ReclamoEvidencia[]>(`${environment.apiUrl}/reclamos/${id}/evidencias`, datos);
  }

  claimMessages(id: number): Observable<ReclamoMensaje[]> {
    return this.http.get<ReclamoMensaje[]>(`${environment.apiUrl}/reclamos/${id}/mensajes`);
  }

  sendClaimMessage(id: number, texto: string): Observable<ReclamoMensaje> {
    return this.http.post<ReclamoMensaje>(`${environment.apiUrl}/reclamos/${id}/mensajes`, {
      texto,
      visible_para: 'TODOS',
    });
  }
}
