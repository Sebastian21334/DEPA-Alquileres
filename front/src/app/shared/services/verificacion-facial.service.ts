import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export type AccionVitalidad = 'TURN_LEFT' | 'TURN_RIGHT' | 'TILT_HEAD' | 'OPEN_MOUTH';

export interface InstruccionVitalidad {
  type: AccionVitalidad;
  label: string;
}

export interface DesafioVitalidad {
  challengeToken: string;
  instructions: InstruccionVitalidad[];
  expiresInSeconds: number;
}

export interface VitalidadValidada {
  valid: true;
  verificationToken: string;
}

@Injectable({ providedIn: 'root' })
export class VerificacionFacialService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/anunciantes/verificacion-facial`;

  crearDesafio() {
    return this.http.get<DesafioVitalidad>(`${this.api}/desafio`);
  }

  cambiarDesafio(challengeToken: string) {
    return this.http.post<DesafioVitalidad>(`${this.api}/desafio/cambiar`, { challengeToken });
  }

  validarVitalidad(
    challengeToken: string,
    neutralPhoto: File,
    actionPhotos: File[],
    livePhoto: File,
  ) {
    const body = new FormData();
    body.append('challengeToken', challengeToken);
    body.append('neutralPhoto', neutralPhoto);
    actionPhotos.forEach((photo, index) => body.append(`action${index}`, photo));
    body.append('livePhoto', livePhoto);
    return this.http.post<VitalidadValidada>(`${this.api}/validar`, body);
  }
}
