import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SOLICITUD_ANONIMA } from '../interceptors/auth.interceptor';
import { contextoCarga } from '../interceptors/carga.interceptor';

export interface MensajeAsistente {
  rol: 'user' | 'assistant';
  contenido: string;
}

export interface PublicacionAsistente {
  id: number;
  titulo: string;
  ciudad: string;
  modalidad: string;
  precio: number;
  moneda: string;
  ambientes: number;
}

export interface RespuestaAsistente {
  respuesta: string;
  publicaciones: PublicacionAsistente[];
}

@Injectable({ providedIn: 'root' })
export class AsistenteDepaService {
  private readonly http = inject(HttpClient);

  consultar(mensajes: MensajeAsistente[]) {
    return this.http.post<RespuestaAsistente>(`${environment.apiUrl}/chatbot`, { mensajes }, {
      timeout: 25_000,
      context: contextoCarga(true).set(SOLICITUD_ANONIMA, true),
    });
  }
}
