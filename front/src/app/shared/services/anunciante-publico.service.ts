import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AnunciantePublico } from '../models/anunciante.model';

@Injectable({ providedIn: 'root' })
export class AnunciantePublicoService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  getPublicProfile(id: number): Observable<AnunciantePublico> {
    return this.http.get<AnunciantePublico>(`${this.api}/anunciantes/${id}/publico`);
  }
}
