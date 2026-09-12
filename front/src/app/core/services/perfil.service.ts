import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, catchError, map, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActualizarPerfilDto, PerfilUsuario, SolicitudVerificacion } from '../../shared/models/perfil.model';
import { AuthService } from './auth.service';

export interface SolicitarAnuncianteDto {
  cuit: string;
  numero_contacto: string;
  idTipoAnunciante: number;
}

export interface DocumentosVerificacion {
  dni_frente: File;
  dni_dorso: File;
  rostro: File;
}

// Estado de la cuenta del usuario logueado: datos personales (GET /usuarios/me)
// y su solicitud de anunciante (GET /anunciantes/mi-solicitud). La navbar lo usa
// para decidir qué accesos mostrar y los guards para proteger rutas de anunciante.
@Injectable({ providedIn: 'root' })
export class PerfilService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly api = environment.apiUrl;

  readonly solicitud = signal<SolicitudVerificacion | null>(null);
  /** Datos del usuario logueado, para mostrar su nombre en el header. */
  readonly usuario = signal<PerfilUsuario | null>(null);
  readonly esAnuncianteVerificado = computed(() => this.solicitud()?.estado === 'aprobada');

  // Cachea la solicitud por sesión para que navbar + guard no dupliquen el request.
  private solicitud$: Observable<SolicitudVerificacion | null> | null = null;
  private solicitudDeUsuario: number | null = null;

  getPerfil(): Observable<PerfilUsuario> {
    return this.http
      .get<PerfilUsuario>(`${this.api}/usuarios/me`)
      .pipe(tap((perfil) => this.usuario.set(perfil)));
  }

  /** PATCH /usuarios/:id — el backend solo permite modificar los datos propios. */
  actualizarPerfil(id: number, dto: ActualizarPerfilDto): Observable<PerfilUsuario> {
    return this.http
      .patch<PerfilUsuario>(`${this.api}/usuarios/${id}`, dto)
      .pipe(tap((perfil) => this.usuario.set(perfil)));
  }

  /** POST /usuarios/me/foto (multipart, campo "foto"). */
  subirFoto(archivo: File): Observable<PerfilUsuario> {
    const body = new FormData();
    body.append('foto', archivo);
    return this.http
      .post<PerfilUsuario>(`${this.api}/usuarios/me/foto`, body)
      .pipe(tap((perfil) => this.usuario.set(perfil)));
  }

  /** DELETE /usuarios/me/foto */
  eliminarFoto(): Observable<PerfilUsuario> {
    return this.http
      .delete<PerfilUsuario>(`${this.api}/usuarios/me/foto`)
      .pipe(tap((perfil) => this.usuario.set(perfil)));
  }

  /** Devuelve la solicitud de anunciante (null si nunca la pidió). */
  cargarSolicitud(forzar = false): Observable<SolicitudVerificacion | null> {
    const idUsuario = this.auth.currentUser()?.sub ?? null;
    if (!this.isBrowser || idUsuario === null) {
      this.limpiar();
      return of(null);
    }
    if (!forzar && this.solicitud$ && this.solicitudDeUsuario === idUsuario) return this.solicitud$;

    this.solicitudDeUsuario = idUsuario;
    this.solicitud$ = this.http.get<SolicitudVerificacion>(`${this.api}/anunciantes/mi-solicitud`).pipe(
      // El backend responde 404 cuando no existe solicitud: no es un error para la UI.
      catchError(() => of(null)),
      tap((solicitud) => this.solicitud.set(solicitud)),
      shareReplay(1),
    );
    return this.solicitud$;
  }

  esAnunciante(): Observable<boolean> {
    return this.cargarSolicitud().pipe(map((s) => s?.estado === 'aprobada'));
  }

  limpiar(): void {
    this.solicitud$ = null;
    this.solicitudDeUsuario = null;
    this.solicitud.set(null);
    this.usuario.set(null);
  }

  /** POST /anunciantes/solicitar */
  solicitarAnunciante(dto: SolicitarAnuncianteDto) {
    return this.http.post(`${this.api}/anunciantes/solicitar`, dto);
  }

  /** POST /anunciantes/mi-solicitud/documentos o /reenviar si la anterior fue rechazada. */
  subirDocumentos(docs: DocumentosVerificacion, reenvio: boolean) {
    const body = new FormData();
    body.append('dni_frente', docs.dni_frente);
    body.append('dni_dorso', docs.dni_dorso);
    body.append('rostro', docs.rostro);
    const accion = reenvio ? 'reenviar' : 'documentos';
    return this.http.post<SolicitudVerificacion>(`${this.api}/anunciantes/mi-solicitud/${accion}`, body);
  }
}
