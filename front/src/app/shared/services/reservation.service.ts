import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Anunciante } from '../models/anunciante.model';
import { Usuario } from '../models/usuario.model';
import { CotizacionDolar } from './cotizaciones.service';
import type { FechaDisponible } from './availability.service';
import type { EstadoEstadia } from '../utils/reservation-state';
import { cuerpoMensajeReclamo } from '../utils/reclamo-imagenes';

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
  /** Último día (AAAA-MM-DD) para reclamar; hasta entonces se retiene el pago al anunciante. */
  fin_plazo_reclamo?: string | null;
  /** Intentos que le quedan al anunciante antes de que se bloquee el código (T34). */
  intentos_codigo_restantes?: number;
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

export interface CondicionesCancelacion {
  solicitud: SolicitudCancelacion | null;
  motivoBloqueo: string | null;
  advertencia: string | null;
  admiteReembolso: boolean;
  devolucionPorTransferencia?: boolean;
  devolucion: {
    fechaSolicitud: string;
    diasAnticipacion: number;
    porcentaje: number;
    importe: number;
    moneda: string;
  } | null;
  politica: {
    diasDevolucionTotal: number;
    diasDevolucionParcial: number;
    porcentajeTotal: number;
    porcentajeParcial: number;
    porcentajeFueraDePlazo: number;
    porcentajeOtrosActores: number;
  };
}

export interface DemoraAdministrativa {
  solicitudId: number;
  reservaId: number;
  titulo: string;
  fechaInicio: string | null;
  fechaSolicitud: string;
  reclamoAbierto: boolean;
}

export interface SolicitudCancelacion {
  id: number;
  motivo: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'VENCIDA';
  decidida_en: string | null;
  observacion: string | null;
  creada_en: string;
}

export interface SaldoDevolucionCancelacion {
  solicitudId: number;
  porcentaje: number;
  moneda: string;
  esperado: number;
  devuelto: number;
  enGestion: number;
  faltante: number;
  importeReclamable: number;
}

export interface FaltanteCancelacion {
  devolucion: SaldoDevolucionCancelacion | null;
  reclamoAbierto: boolean;
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
  solicitud_cancelacion_id?: number | null;
  devolucion_cancelacion?: SaldoDevolucionCancelacion | null;
  id: number;
  reserva?: {
    id: number;
    monto_pago?: number | string;
    moneda_contratada?: string | null;
    estado_estadia?: EstadoEstadia;
    estado_liquidacion?: Reserva['estado_liquidacion'];
    fecha_fin?: string | null;
    intentos_codigo_restantes?: number;
    publicacion?: { id?: number; titulo?: string; imagenes?: { url: string }[] } | null;
  } | null;
  anunciante?: ParticipanteReclamo | null;
  inquilino?: ParticipanteReclamo | null;
  /** CODIGO_BLOQUEADO: pedido de reinicio del código que abre el anunciante (T34). */
  categoria: 'LIMPIEZA' | 'MANTENIMIENTO' | 'INGRESO' | 'DESCRIPCION' | 'OTRO' | 'DEMORA_ADMINISTRATIVA' | 'CODIGO_BLOQUEADO';
  descripcion: string;
  estado: 'ABIERTO' | 'EN_REVISION' | 'RESUELTO_INQUILINO' | 'RESUELTO_ANUNCIANTE' | 'CERRADO';
  resolucion: 'SIN_DEVOLUCION' | 'DEVOLUCION_TOTAL' | 'DEVOLUCION_PARCIAL' | 'REINICIAR_CODIGO' | 'CONFIRMAR_INGRESO' | null;
  importe_reembolso: number | null;
  creado_en: string;
  resuelto_en: string | null;
  evidencias?: ReclamoEvidencia[];
  mensajes?: ReclamoMensaje[];
}

export type AutorReclamo = ParticipanteReclamo & { rol?: { nombre: string } | null };

/** T49: imagen de un reclamo con su autor; `url` es un enlace firmado que vence a los 15 minutos. */
export interface ReclamoEvidencia {
  id: number;
  /** null: es de la descripción del reclamo. */
  id_mensaje: number | null;
  nombre_archivo: string;
  creado_en: string;
  autor: AutorReclamo | null;
  url: string;
}

export interface ReclamoMensaje {
  id: number;
  texto: string;
  visible_para: 'TODOS' | 'ADMIN';
  creado_en: string;
  autor?: AutorReclamo | null;
  /** T49: imágenes enviadas con este mensaje. */
  evidencias?: ReclamoEvidencia[];
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

  byPublication(idPublicacion: number): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.baseUrl}/publicacion/${idPublicacion}`);
  }

  /** GET /reservas/:id: una sola reserva, para el inquilino o el anunciante. */
  byId(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.baseUrl}/${id}`);
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

  requestCancellation(id: number, motivo: string, aceptaTerminos: boolean): Observable<SolicitudCancelacion> {
    return this.http.post<SolicitudCancelacion>(`${this.baseUrl}/${id}/cancelacion`, { motivo, aceptaTerminos });
  }

  cancellationConditions(id: number): Observable<CondicionesCancelacion> {
    return this.http.get<CondicionesCancelacion>(`${this.baseUrl}/${id}/cancelacion/condiciones`);
  }

  refunds(id: number): Observable<Reembolso[]> {
    return this.http.get<Reembolso[]>(`${this.baseUrl}/${id}/reembolsos`);
  }

  myAdministrativeDelays(): Observable<DemoraAdministrativa[]> {
    return this.http.get<DemoraAdministrativa[]>(`${environment.apiUrl}/reclamos/demoras/mias`);
  }

  createClaim(payload: { id_reserva: number; categoria: Reclamo['categoria']; descripcion: string; }): Observable<Reclamo> {
    return this.http.post<Reclamo>(`${environment.apiUrl}/reclamos`, payload);
  }

  cancellationRefundBalance(id: number): Observable<FaltanteCancelacion> {
    return this.http.get<FaltanteCancelacion>(`${environment.apiUrl}/reclamos/cancelacion/${id}`);
  }

  claimMissingRefund(id: number, descripcion: string): Observable<Reclamo> {
    return this.http.post<Reclamo>(`${environment.apiUrl}/reclamos/cancelacion/${id}`, { descripcion });
  }

  myClaims(): Observable<Reclamo[]> {
    return this.http.get<Reclamo[]>(`${environment.apiUrl}/reclamos/mios`);
  }

  uploadClaimEvidence(id: number, archivos: File[]): Observable<ReclamoEvidencia[]> {
    const datos = new FormData();
    archivos.forEach((archivo) => datos.append('evidencias', archivo));
    return this.http.post<ReclamoEvidencia[]>(`${environment.apiUrl}/reclamos/${id}/evidencias`, datos);
  }

  claimMessages(id: number): Observable<ReclamoMensaje[]> {
    return this.http.get<ReclamoMensaje[]>(`${environment.apiUrl}/reclamos/${id}/mensajes`);
  }

  sendClaimMessage(id: number, texto: string, imagenes: readonly File[] = []): Observable<ReclamoMensaje> {
    return this.http.post<ReclamoMensaje>(`${environment.apiUrl}/reclamos/${id}/mensajes`, cuerpoMensajeReclamo(texto, imagenes));
  }
}
