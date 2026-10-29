import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Reserva } from '../../shared/services/reservation.service';
import { Publicacion } from '../../shared/models/publicacion.model';

export interface AdminUser {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  bloqueado: boolean;
  email_verificado: boolean;
  rol: { id: number; nombre: string } | null;
}

export interface VerificationRequest {
  id: number;
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
}
export interface AdminProvince extends AdminCatalogItem {}
export interface AdminCity extends AdminCatalogItem {
  provincia?: AdminProvince;
}
export type AdminSettlement = Reserva;
export type CatalogKey =
  | 'roles'
  | 'tipos-anunciante'
  | 'tipos-propiedad'
  | 'modalidades'
  | 'tipos-moneda';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;
  listarPublicaciones() {
    return this.http.get<Publicacion[]>(`${this.api}/publicaciones/administracion`);
  }
  darDeBajaPublicacion(id: number, motivo: string) {
    return this.http.patch<{ publicacion: Publicacion; correoEnviado: boolean }>(
      `${this.api}/publicaciones/administracion/${id}/baja`, { motivo },
    );
  }
  listarUsuarios() {
    return this.http.get<AdminUser[]>(`${this.api}/usuarios`);
  }
  listarPendientes() {
    return this.http.get<VerificationRequest[]>(`${this.api}/anunciantes/pendientes`);
  }
  listarLiquidaciones() {
    return this.http.get<AdminSettlement[]>(`${this.api}/reservas/liquidaciones/administracion`);
  }
  resolverLiquidacion(
    id: number,
    estado: Reserva['estado_liquidacion'],
    referencia?: string,
    observacion?: string,
  ) {
    return this.http.patch<AdminSettlement>(`${this.api}/reservas/${id}/liquidacion`, {
      estado,
      referencia,
      observacion,
    });
  }
  cambiarBloqueo(id: number, bloquear: boolean, motivo?: string) {
    return this.http.patch(`${this.api}/usuarios/${id}/${bloquear ? 'bloquear' : 'habilitar'}`, { motivo });
  }
  cambiarRol(id: number, nombreRol: string) {
    return this.http.patch<AdminUser>(`${this.api}/usuarios/${id}/rol`, { nombreRol });
  }
  aprobar(id: number, numero_revision: number) {
    return this.http.patch(`${this.api}/anunciantes/${id}/aprobar`, { numero_revision });
  }
  rechazar(id: number, motivo: string, numero_revision: number) {
    return this.http.delete(`${this.api}/anunciantes/${id}/rechazar`, { body: { motivo, numero_revision } });
  }
  listarCatalogo(key: CatalogKey) {
    return this.http.get<AdminCatalogItem[]>(`${this.api}/catalogos/${key}`);
  }
  crearCatalogo(key: CatalogKey, nombre: string) {
    return this.http.post<AdminCatalogItem>(`${this.api}/catalogos/${key}`, { nombre });
  }
  actualizarCatalogo(key: CatalogKey, id: number, nombre: string) {
    return this.http.put<AdminCatalogItem>(`${this.api}/catalogos/${key}/${id}`, { nombre });
  }
  eliminarCatalogo(key: CatalogKey, id: number) {
    return this.http.delete(`${this.api}/catalogos/${key}/${id}`);
  }
  listarProvincias() {
    return this.http.get<AdminProvince[]>(`${this.api}/ubicacion/provincias`);
  }
  listarCiudades(id: number) {
    return this.http.get<AdminCity[]>(`${this.api}/ubicacion/provincias/${id}/ciudades`);
  }
  crearProvincia(nombre: string) {
    return this.http.post<AdminProvince>(`${this.api}/ubicacion/provincias`, { nombre });
  }
  actualizarProvincia(id: number, nombre: string) {
    return this.http.put<AdminProvince>(`${this.api}/ubicacion/provincias/${id}`, { nombre });
  }
  eliminarProvincia(id: number) {
    return this.http.delete(`${this.api}/ubicacion/provincias/${id}`);
  }
  crearCiudad(nombre: string, idProvincia: number) {
    return this.http.post<AdminCity>(`${this.api}/ubicacion/ciudades`, { nombre, idProvincia });
  }
  actualizarCiudad(id: number, nombre: string, idProvincia: number) {
    return this.http.put<AdminCity>(`${this.api}/ubicacion/ciudades/${id}`, {
      nombre,
      idProvincia,
    });
  }
  eliminarCiudad(id: number) {
    return this.http.delete(`${this.api}/ubicacion/ciudades/${id}`);
  }
}
