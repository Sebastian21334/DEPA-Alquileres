import { contextoCarga } from '../../core/interceptors/carga.interceptor';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  Reclamo,
  ReclamoMensaje,
  Reserva,
} from '../../shared/services/reservation.service';
import { Publicacion } from '../../shared/models/publicacion.model';
import type { SolicitudVerificacion } from '../../shared/models/perfil.model';
import { cuerpoMensajeReclamo } from '../../shared/utils/reclamo-imagenes';
import type { DesglosePago } from '../../shared/utils/desglose-pago';

export const ESTADOS_PUBLICACION_ADMINISTRACION = ['todas', 'activas', 'inactivas', 'bajas'] as const;
export type AdminPublicacionEstado = (typeof ESTADOS_PUBLICACION_ADMINISTRACION)[number];

export interface AdminUser {
  id: number;
  nombre: string;
  apellido: string;
  /** null cuando la cuenta se dio de baja (RN-37). */
  email: string | null;
  email_historico: string | null;
  /** Solo si la cuenta tiene perfil de Anunciante. */
  cuit_cuil?: string | null;
  cuit_cuil_historico?: string | null;
  es_anunciante?: boolean;
  telefono: string;
  bloqueado: boolean;
  /** Baja lógica: false cuando la cuenta fue dada de baja. */
  activa: boolean;
  fecha_baja: string | null;
  email_verificado: boolean;
  rol: { id: number; nombre: string } | null;
}

export interface AdminPage<T> {
  datos: T[];
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}

export interface AdminHistorialAnunciante {
  esAnunciante: boolean;
  solicitud: Pick<SolicitudVerificacion, 'id' | 'estado' | 'numero_revision' | 'creada_en' | 'actualizada_en' | 'revisiones'> | null;
}

export interface AdminBloqueo {
  usuario: Pick<AdminUser, 'id' | 'nombre' | 'apellido' | 'email'>;
  administrador: Pick<AdminUser, 'nombre' | 'apellido'> | null;
  detalle: {
    id: string;
    motivo: string | null;
    administradorId: number | null;
    fecha: string | null;
    accesoLimitado?: boolean;
    apelacion?: { texto: string; fecha: string };
    respuesta?: { texto: string; fecha: string; administradorId: number };
    mensajes?: { id: string; autor: 'usuario' | 'administracion'; texto: string; fecha: string; imagen?: string }[];
    fechaDesbloqueo?: string | null;
    desbloqueadoPorId?: number | null;
  };
}

export interface VerificationRequest {
  id: number;
  revisar_identidad: boolean;
  cbu_pendiente: string | null;
  estado: string;
  numero_revision: number;
  actualizada_en: string;
  prueba_vida_validada_en: string | null;
  dni_frente_url: string | null;
  dni_dorso_url: string | null;
  rostro_url: string | null;
  razon_social?: string;
  matricula_profesional?: string;
  colegio_profesional?: string;
  domicilio_comercial?: string;
  dni_corredor?: string;
  matricula_url?: string | null;
  constancia_cuit_url?: string | null;
  anunciante: {
    idUsuario: number;
    cuit_cuil: string | null;
    numero_contacto: string;
    usuario?: AdminUser;
  };
}

export interface AdminCatalogItem {
  id: number;
  nombre: string;
  descripcion?: string | null;
  permite_reservas_por_fecha?: boolean | null;
  admite_reservas_por_fecha?: boolean;
}
export type AdminCatalogDatos = Pick<AdminCatalogItem, 'nombre' | 'descripcion' | 'permite_reservas_por_fecha'>;
export interface AdminProvince extends AdminCatalogItem {}
export interface AdminCity extends AdminCatalogItem {
  provincia?: AdminProvince;
}
/** Reserva por liquidar: el back calcula el importe desde el pago y si ya se le puede pagar al anunciante. */
export type AdminSettlement = Reserva & {
  reclamos: { id: number; categoria: Reclamo['categoria']; estado: string; resolucion: string | null; motivo_resolucion: string | null; solicitud_cancelacion_id: number | null }[];
  cancelaciones: { id: number; estado: string; motivo: string; observacion: string | null; solicitante_id: number }[];
  fecha_disponible_pago: string | null;
  porcentaje_comision_depa: number | null;
  /** Lo que pagó el inquilino menos lo que ya se le devolvió. */
  importe_a_liquidar: number;
  moneda_liquidacion: string;
  importe_comision_depa: number;
  importe_neto_anunciante: number;
  habilitada_para_pago: boolean;
};

export interface AdminPagoLiquidacion {
  id: string;
  reservaId: number;
  publicacion: string | null;
  anunciante: string | null;
  administrador: string | null;
  fecha: string | null;
  importe: number | null;
  moneda: string | null;
  referencia: string | null;
  observacion: string | null;
  /** Posición del pago dentro de la liquidación, para pedir su comprobante. */
  indice: number;
  comprobante: string | null;
  /** Null en reservas sin un cobro registrado. */
  desglose: DesglosePago | null;
}

/** Datos para transferir al anunciante. */
export interface DatosTransferenciaAnunciante {
  cbu: string | null;
  cuit_cuil: string | null;
}

/** Campos opcionales que acompañan al comprobante de una transferencia manual. */
export interface DatosTransferencia {
  referencia?: string;
  observacion?: string;
}

export interface AdminReembolso {
  transferencia_manual?: boolean;
  aplicado_en?: string | null;
  revision_aplicacion?: boolean;
  id: number;
  tipo: 'TOTAL' | 'PARCIAL' | 'CONTRACARGO';
  origen: string;
  importe: number;
  moneda: string;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'APROBADO' | 'RECHAZADO' | 'FALLIDO' | 'CANCELADO';
  motivo: string;
  creado_en: string;
  /** Origen interno del reembolso; en los reclamos es `rec:<id del reclamo>`. */
  referencia_interna?: string | null;
  referencia_externa?: string | null;
  /** Nombre del comprobante de la transferencia; null en los registros anteriores. */
  comprobante_nombre?: string | null;
  observacion_transferencia?: string | null;
  resuelto_en?: string | null;
  resuelto_por?: { nombre?: string; apellido?: string } | null;
  pago?: { id: number; payment_id?: string | null } | null;
  reserva?: {
    id: number;
    fecha_inicio?: string | null;
    fecha_fin?: string | null;
    usuario?: { nombre?: string; apellido?: string } | null;
    publicacion?: { id?: number; titulo?: string } | null;
  } | null;
}

export interface AdminResumenReembolsos {
  pendientes: number;
  fallidos: number;
  total: number;
}

export type CatalogKey =
  | 'tipos-anunciante'
  | 'tipos-propiedad'
  | 'modalidades'
  | 'tipos-moneda';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;
  listarPublicaciones(pagina = 1, q = '', estado: AdminPublicacionEstado = 'todas') {
    const params = new HttpParams().set('pagina', pagina).set('limite', 10).set('q', q).set('estado', estado);
    return this.http.get<AdminPage<Publicacion>>(`${this.api}/publicaciones/administracion`, { params });
  }
  darDeBajaPublicacion(id: number, motivo: string) {
    return this.http.patch<{ publicacion: Publicacion; correoEnviado: boolean }>(
      `${this.api}/publicaciones/administracion/${id}/baja`, { motivo },
    );
  }
  reactivarPublicacion(id: number) {
    return this.http.patch<Publicacion>(`${this.api}/publicaciones/administracion/${id}/reactivar`, {});
  }
  obtenerPerfilUsuario(id: number) {
    return this.http.get<AdminUser & { foto_url: string | null }>(`${this.api}/usuarios/administracion/${id}`);
  }

  obtenerHistorialAnunciante(id: number) {
    return this.http.get<AdminHistorialAnunciante>(`${this.api}/anunciantes/administracion/usuarios/${id}/solicitud`);
  }

  listarUsuarios(pagina = 1, q = '') {
    const params = new HttpParams().set('pagina', pagina).set('limite', 10).set('q', q);
    return this.http.get<AdminPage<AdminUser> & { totalRegistros: number }>(`${this.api}/usuarios/administracion`, { params });
  }
  listarPendientes() {
    return this.http.get<VerificationRequest[]>(`${this.api}/anunciantes/pendientes`);
  }
  otorgarAdministrador(id: number) {
    return this.http.patch<AdminUser>(`${this.api}/usuarios/administracion/${id}/administrador`, {});
  }
  listarLiquidaciones() {
    return this.http.get<AdminSettlement[]>(`${this.api}/reservas/liquidaciones/administracion`);
  }
  consultarCbuParaPago(id: number) {
    return this.http.get<DatosTransferenciaAnunciante>(`${this.api}/reservas/${id}/liquidacion/cbu`);
  }
  listarHistorialLiquidaciones() {
    return this.http.get<AdminPagoLiquidacion[]>(`${this.api}/reservas/liquidaciones/administracion/historial`);
  }
  resolverLiquidacion(id: number, estado: Reserva['estado_liquidacion'], referencia?: string, observacion?: string) {
    return this.http.patch<AdminSettlement>(`${this.api}/reservas/${id}/liquidacion`, {
      estado,
      referencia,
      observacion,
    });
  }
  listarReembolsos() {
    return this.http.get<AdminReembolso[]>(`${this.api}/reembolsos/administracion`);
  }
  resumenReembolsos() {
    return this.http.get<AdminResumenReembolsos>(`${this.api}/reembolsos/administracion/resumen`);
  }
  solicitarReembolso(id: number) {
    return this.http.patch<{ reembolso: AdminReembolso }>(`${this.api}/reservas/reembolsos/${id}/ejecutar`, {});
  }
  conciliarReembolso(id: number, referencia: string) {
    return this.http.patch<{ reembolso: AdminReembolso }>(`${this.api}/reservas/reembolsos/${id}/conciliar`, { referencia });
  }

  habilitarTransferenciaReembolso(id: number) {
    return this.http.patch<AdminReembolso>(`${this.api}/reservas/reembolsos/${id}/habilitar-transferencia`, {});
  }

  /** Multipart con el comprobante obligatorio y la referencia opcional. */
  registrarTransferenciaReembolso(id: number, comprobante: File, datos: DatosTransferencia = {}) {
    return this.http.patch<{ reembolso: AdminReembolso }>(`${this.api}/reservas/reembolsos/${id}/transferencia`, this.formularioTransferencia(comprobante, datos));
  }

  /** El pago al anunciante se registra con el comprobante de la transferencia. */
  registrarPagoAnunciante(idReserva: number, comprobante: File, datos: DatosTransferencia = {}) {
    return this.http.patch<AdminSettlement>(`${this.api}/reservas/${idReserva}/liquidacion/pago`, this.formularioTransferencia(comprobante, datos));
  }

  urlComprobantePago(idReserva: number, indice: number) {
    return this.http.get<{ url: string }>(`${this.api}/reservas/${idReserva}/liquidacion/pagos/${indice}/comprobante`);
  }

  private formularioTransferencia(comprobante: File, { referencia, observacion }: DatosTransferencia): FormData {
    const formulario = new FormData();
    formulario.append('comprobante', comprobante);
    if (referencia) formulario.append('referencia', referencia);
    if (observacion) formulario.append('observacion', observacion);
    return formulario;
  }

  listarReclamos() {
    return this.http.get<Reclamo[]>(`${this.api}/reclamos/administracion`);
  }
  responderReclamo(id: number, texto: string, imagenes: readonly File[] = []) {
    return this.http.post<ReclamoMensaje>(`${this.api}/reclamos/${id}/mensajes/administracion`, cuerpoMensajeReclamo(texto, imagenes));
  }
  resolverReclamo(id: number, resolucion: NonNullable<Reclamo['resolucion']>, importe?: number, observacion?: string) {
    return this.http.patch<Reclamo>(`${this.api}/reclamos/${id}/resolver`, {
      resolucion,
      importe,
      observacion,
    });
  }
  cambiarBloqueo(id: number, bloquear: boolean, motivo?: string) {
    return this.http.patch<{ mensaje: string; accesoLimitado: boolean }>(
      `${this.api}/usuarios/${id}/${bloquear ? 'bloquear' : 'habilitar'}`, { motivo },
    );
  }

  listarBloqueados(silenciosa = false) {
    return this.http.get<AdminBloqueo[]>(`${this.api}/usuarios/administracion/bloqueados`, { context: contextoCarga(silenciosa) });
  }

  listarHistorialBloqueos(silenciosa = false) {
    return this.http.get<AdminBloqueo[]>(`${this.api}/usuarios/administracion/historial-bloqueos`, { context: contextoCarga(silenciosa) });
  }

  responderApelacion(id: number, bloqueoId: string, texto: string, imagen?: File | null) {
    const datos = new FormData();
    datos.append('bloqueoId', bloqueoId);
    datos.append('texto', texto);
    if (imagen) datos.append('imagen', imagen);
    return this.http.post<{ mensaje: string }>(`${this.api}/usuarios/${id}/bloqueo/mensajes`, datos);
  }
  aprobar(id: number, numero_revision: number, revisar_cbu: boolean, titular_cbu_confirmado: boolean) {
    return this.http.patch(`${this.api}/anunciantes/${id}/aprobar`, { numero_revision, revisar_cbu, titular_cbu_confirmado });
  }
  rechazar(id: number, body: { motivo: string; numero_revision: number; revisar_cbu: boolean; titular_cbu_confirmado: boolean; rechazar_identidad: boolean; rechazar_cbu: boolean }) {
    return this.http.delete(`${this.api}/anunciantes/${id}/rechazar`, { body });
  }
  listarCatalogo(key: CatalogKey) {
    return this.http.get<AdminCatalogItem[]>(`${this.api}/catalogos/${key}`);
  }
  crearCatalogo(key: CatalogKey, datos: AdminCatalogDatos) {
    return this.http.post<AdminCatalogItem>(`${this.api}/catalogos/${key}`, datos);
  }
  actualizarCatalogo(key: CatalogKey, id: number, datos: AdminCatalogDatos) {
    return this.http.put<AdminCatalogItem>(`${this.api}/catalogos/${key}/${id}`, datos);
  }
  eliminarCatalogo(key: CatalogKey, id: number) {
    return this.http.delete<void>(`${this.api}/catalogos/${key}/${id}`);
  }
  obtenerComisionDepa() {
    return this.http.get<{ porcentaje: number }>(`${this.api}/catalogos/comision-depa`);
  }
  actualizarComisionDepa(porcentaje: number) {
    return this.http.put<{ porcentaje: number }>(`${this.api}/catalogos/comision-depa`, { porcentaje });
  }
  listarProvincias() {
    return this.http.get<AdminProvince[]>(`${this.api}/ubicacion/provincias`);
  }
  listarCiudades(id: number) {
    return this.http.get<AdminCity[]>(`${this.api}/ubicacion/provincias/${id}/ciudades`);
  }
}
