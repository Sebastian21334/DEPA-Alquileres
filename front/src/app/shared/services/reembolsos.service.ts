import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { contextoCarga } from '../../core/interceptors/carga.interceptor';

export interface ConversacionReembolsoResumen {
  id: number;
  importe: number;
  moneda: string;
  estado: string;
  comprobante_nombre?: string | null;
  referencia_externa?: string | null;
  observacion_transferencia?: string | null;
}

export interface MensajeReembolso {
  id: number;
  autor: string;
  administracion: boolean;
  texto: string;
  creado_en: string;
}

export interface ConversacionReembolso {
  abierta: boolean;
  mensajes: MensajeReembolso[];
}

@Injectable({ providedIn: 'root' })
export class ReembolsosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reembolsos`;

  comprobante(id: number): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.baseUrl}/${id}/comprobante`);
  }

  conversacionesDeReserva(id: number): Observable<ConversacionReembolsoResumen[]> {
    return this.http.get<ConversacionReembolsoResumen[]>(`${this.baseUrl}/reserva/${id}/conversaciones`, {
      context: contextoCarga(true),
    });
  }

  leerConversacion(id: number, despuesDe: number, silenciosa: boolean): Observable<ConversacionReembolso> {
    return this.http.get<ConversacionReembolso>(`${this.baseUrl}/${id}/conversacion`, {
      params: { despuesDe },
      context: contextoCarga(silenciosa),
    });
  }

  enviarMensaje(id: number, texto: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/${id}/conversacion`, { texto });
  }
}
