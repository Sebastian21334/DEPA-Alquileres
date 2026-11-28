import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
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
  private readonly api = environment.apiUrl;

  estadosRecibidosPorReserva(): Observable<Record<number, { publicacion: boolean; anunciante: boolean }>> {
    return this.http.get<Record<number, { publicacion: boolean; anunciante: boolean }>>(`${this.api}/resenas/recibidas-por-reserva`);
  }

  listar(tipo: TipoObjetivoResena, idObjetivo: number, pagina = 1, limite = 6): Observable<ResenasObjetivo> {
    const params = new HttpParams().set('pagina', pagina).set('limite', limite);
    return this.http.get<ResenasObjetivo>(this.urlObjetivo(tipo, idObjetivo), { params });
  }

  crear(tipo: TipoObjetivoResena, idObjetivo: number, payload: CrearResenaPayload): Observable<Resena> {
    return this.http.post<Resena>(this.urlObjetivo(tipo, idObjetivo), payload);
  }

  actualizar(idResena: number, payload: CrearResenaPayload): Observable<Resena> {
    return this.http.patch<Resena>(`${this.api}/resenas/${idResena}`, payload);
  }

  eliminar(idResena: number): Observable<{ id: number }> {
    return this.http.delete<{ id: number }>(`${this.api}/resenas/${idResena}`);
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
}
