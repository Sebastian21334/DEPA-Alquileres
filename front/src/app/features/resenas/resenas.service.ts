import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { EMPTY, Observable, defer, filter, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { contextoCarga } from '../../core/interceptors/carga.interceptor';
import { AuthService } from '../../core/services/auth.service';
import type { EstadoResenasAdministracion } from './resenas.constantes';
import {
  CrearResenaPayload,
  PaginaResenasAdministracion,
  Resena,
  ResenaAdministracion,
  ResenaImagen,
  ResenasObjetivo,
  TipoObjetivoResena,
  ResolucionDenunciaResena,
} from './resenas.model';

@Injectable({ providedIn: 'root' })
export class ResenasService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly api = environment.apiUrl;
  private readonly estadosPropios = signal<{ token: string; publicaciones: Partial<Record<number, boolean>> } | null>(null);
  readonly estadoPublicaciones = computed(() => {
    const estado = this.estadosPropios();
    return estado && this.perteneceALaSesion(estado.token) ? estado.publicaciones : {};
  });

  estadosRecibidosPorReserva(): Observable<Record<number, { publicacion: boolean; anunciante: boolean }>> {
    return this.http.get<Record<number, { publicacion: boolean; anunciante: boolean }>>(`${this.api}/resenas/recibidas-por-reserva`);
  }

  listar(tipo: TipoObjetivoResena, idObjetivo: number, pagina = 1, limite = 6): Observable<ResenasObjetivo> {
    const params = new HttpParams().set('pagina', pagina).set('limite', limite);
    return this.http.get<ResenasObjetivo>(this.urlObjetivo(tipo, idObjetivo), { params });
  }

  consultarEstadoPublicacion(id: number): Observable<boolean> {
    return defer(() => {
      const token = this.auth.token;
      if (!token || !this.auth.currentUser()) return EMPTY;
      const estado = this.estadoPublicaciones()[id];
      if (estado !== undefined) return of(estado);

      const params = new HttpParams().set('pagina', 1).set('limite', 1);
      return this.http.get<ResenasObjetivo>(this.urlObjetivo('PUBLICACION', id), {
        params, context: contextoCarga(true),
      }).pipe(
        filter(() => this.perteneceALaSesion(token)),
        map(({ miResena }) => this.estadoPublicaciones()[id] ?? !!miResena),
        tap((resenada) => this.guardarEstadoPublicacion(token, id, resenada)),
      );
    });
  }

  crear(tipo: TipoObjetivoResena, idObjetivo: number, payload: CrearResenaPayload): Observable<Resena> {
    return defer(() => {
      const token = this.auth.token;
      return this.http.post<Resena>(this.urlObjetivo(tipo, idObjetivo), payload).pipe(
        tap(() => {
          if (token && tipo === 'PUBLICACION') this.guardarEstadoPublicacion(token, idObjetivo, true);
        }),
      );
    });
  }

  actualizar(idResena: number, payload: CrearResenaPayload): Observable<Resena> {
    return this.http.patch<Resena>(`${this.api}/resenas/${idResena}`, payload);
  }

  eliminar(idResena: number, tipo: TipoObjetivoResena, idObjetivo: number): Observable<{ id: number }> {
    return defer(() => {
      const token = this.auth.token;
      return this.http.delete<{ id: number }>(`${this.api}/resenas/${idResena}`).pipe(
        tap(() => {
          if (token && tipo === 'PUBLICACION') this.guardarEstadoPublicacion(token, idObjetivo, false);
        }),
      );
    });
  }

  subirImagen(idResena: number, archivo: File): Observable<ResenaImagen> {
    const formulario = new FormData();
    formulario.append('archivo', archivo, archivo.name);
    return this.http.post<ResenaImagen>(`${this.api}/resenas/${idResena}/imagenes`, formulario);
  }

  eliminarImagen(idResena: number, idImagen: number): Observable<{ id: number }> {
    return this.http.delete<{ id: number }>(`${this.api}/resenas/${idResena}/imagenes/${idImagen}`);
  }

  listarAdministracion(estado: EstadoResenasAdministracion, pagina: number, limite = 10, q = ''): Observable<PaginaResenasAdministracion> {
    let params = new HttpParams()
      .set('estado', estado)
      .set('pagina', pagina)
      .set('limite', limite);
    if (q.trim()) params = params.set('q', q.trim());
    return this.http.get<PaginaResenasAdministracion>(`${this.api}/administracion/resenas`, { params });
  }

  moderar(idResena: number, visible: boolean, motivo?: string): Observable<ResenaAdministracion> {
    return this.http.patch<ResenaAdministracion>(
      `${this.api}/administracion/resenas/${idResena}/visibilidad`,
      { visible, ...(motivo ? { motivo } : {}) },
    );
  }

  quitarDenuncia(idResena: number): Observable<ResenaAdministracion> {
    return this.http.delete<ResenaAdministracion>(
      `${this.api}/administracion/resenas/${idResena}/denuncia`,
    );
  }

  resolverDenuncia(idResena: number, aceptada: boolean, motivo: string): Observable<ResenaAdministracion> {
    return this.http.patch<ResenaAdministracion>(`${this.api}/administracion/resenas/${idResena}/denuncia/resolucion`, { aceptada, motivo });
  }

  historialDenuncias(): Observable<ResolucionDenunciaResena[]> {
    return this.http.get<ResolucionDenunciaResena[]>(`${this.api}/administracion/resenas/denuncias/historial`);
  }

  denunciar(idResena: number, motivo?: string): Observable<{ id: number; denunciada: boolean }> {
    return this.http.post<{ id: number; denunciada: boolean }>(
      `${this.api}/resenas/${idResena}/denunciar`,
      motivo ? { motivo } : {},
    );
  }

  private urlObjetivo(tipo: TipoObjetivoResena, idObjetivo: number): string {
    return tipo === 'PUBLICACION'
      ? `${this.api}/publicaciones/${idObjetivo}/resenas`
      : `${this.api}/anunciantes/${idObjetivo}/resenas`;
  }

  private perteneceALaSesion(token: string): boolean {
    return !!this.auth.currentUser() && this.auth.token === token;
  }

  private guardarEstadoPublicacion(token: string, id: number, resenada: boolean): void {
    if (!this.perteneceALaSesion(token)) return;
    this.estadosPropios.set({ token, publicaciones: { ...this.estadoPublicaciones(), [id]: resenada } });
  }
}
