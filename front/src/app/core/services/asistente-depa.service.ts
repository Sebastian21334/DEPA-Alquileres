import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

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
  // La consulta pública viaja sin el token de sesión.
  private readonly http = new HttpClient(inject(HttpBackend));

  consultar(mensajes: MensajeAsistente[]) {
    return this.http.post<RespuestaAsistente>(`${environment.apiUrl}/chatbot`, { mensajes }, { timeout: 25_000 });
  }
}
