import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

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
  dni_frente_url: string | null;
  dni_dorso_url: string | null;
  rostro_url: string | null;
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
export type CatalogKey =
  | 'roles'
  | 'tipos-anunciante'
  | 'tipos-propiedad'
  | 'modalidades'
  | 'metodos-pago'
  | 'tipos-moneda';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;
  listarUsuarios() {
    return this.http.get<AdminUser[]>(`${this.api}/usuarios`);
  }
  listarPendientes() {
    return this.http.get<VerificationRequest[]>(`${this.api}/anunciantes/pendientes`);
  }
  cambiarBloqueo(id: number, bloquear: boolean) {
    return this.http.patch(`${this.api}/usuarios/${id}/${bloquear ? 'bloquear' : 'habilitar'}`, {});
  }
  cambiarRol(id: number, nombreRol: string) {
    return this.http.patch<AdminUser>(`${this.api}/usuarios/${id}/rol`, { nombreRol });
  }
  aprobar(id: number) {
    return this.http.patch(`${this.api}/anunciantes/${id}/aprobar`, {});
  }
  rechazar(id: number, motivo: string) {
    return this.http.delete(`${this.api}/anunciantes/${id}/rechazar`, { body: { motivo } });
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
