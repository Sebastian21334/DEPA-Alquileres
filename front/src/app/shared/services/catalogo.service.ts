import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Modalidad, TipoAnunciante, TipoPropiedad, TipoMoneda } from '../models/catalogo.model';

// Consume el módulo `catalogos` del backend (back/src/catalogos). Son lecturas
// públicas (sin JWT) usadas para poblar selectores de filtros.
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/catalogos`;

  /** GET /catalogos/tipos-propiedad */
  getTiposPropiedad(): Observable<TipoPropiedad[]> {
    return this.http.get<TipoPropiedad[]>(`${this.baseUrl}/tipos-propiedad`);
  }

  /** GET /catalogos/modalidades */
  getModalidades(): Observable<Modalidad[]> {
    return this.http.get<Modalidad[]>(`${this.baseUrl}/modalidades`);
  }

  /** GET /catalogos/tipos-anunciante */
  getTiposAnunciante(): Observable<TipoAnunciante[]> {
    return this.http.get<TipoAnunciante[]>(`${this.baseUrl}/tipos-anunciante`);
  }

  /** GET /catalogos/tipos-moneda */
  getTiposMoneda(): Observable<TipoMoneda[]> {
    return this.http.get<TipoMoneda[]>(`${this.baseUrl}/tipos-moneda`);
  }
}