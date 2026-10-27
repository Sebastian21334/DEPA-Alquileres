import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface CotizacionDolar {
  id: number;
  compra: string;
  venta: string;
  tipo: string;
  proveedor: string;
  actualizada_fuente_en: string;
  consultada_en: string;
}
export interface ConsultaDolar {
  id: number;
  realizada_en: string;
  exitosa: boolean;
  error: string | null;
}
export interface HistorialDolar {
  cotizacion: CotizacionDolar | null;
  consulta: ConsultaDolar | null;
  items: CotizacionDolar[];
  consultas: ConsultaDolar[];
  total: number;
  pagina: number;
  por_pagina: number;
  vigente: boolean;
  proxima_revision_en: string | null;
  max_antiguedad_fuente_horas: number;
}
@Injectable({ providedIn: 'root' })
export class CotizacionesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/cotizaciones/administracion`;
  listar(desde = '', hasta = '', pagina = 1) {
    let params = new HttpParams().set('pagina', pagina);
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get<HistorialDolar>(this.url, { params });
  }
  verificar() {
    return this.http.post<HistorialDolar>(`${this.url}/verificar`, {});
  }
}
