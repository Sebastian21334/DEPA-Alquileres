import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Payload del JWT emitido por POST /auth/login (back/src/auth/service/auth.service.ts):
// { sub, email, rol, iat, exp }. Este service SOLO detecta si hay una sesión activa
// (para mostrar avatar vs. botón "Ingresar" en el navbar) — no implementa el flujo de
// login/registro, eso queda fuera del alcance de esta página.
interface JwtPayload {
  sub: number;
  email: string;
  rol?: string;
  exp: number;
}

const TOKEN_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Signal de solo-lectura que expone el usuario autenticado (o null).
  readonly currentUser = signal<JwtPayload | null>(this.leerPayloadInicial());

  get isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  private leerPayloadInicial(): JwtPayload | null {
    if (!this.isBrowser) return null; // en SSR no hay localStorage

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    const payload = this.decodificar(token);
    if (!payload || this.expirado(payload)) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return payload;
  }

  private decodificar(token: string): JwtPayload | null {
    try {
      const [, payloadBase64] = token.split('.');
      const json = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json) as JwtPayload;
    } catch {
      return null;
    }
  }

  private expirado(payload: JwtPayload): boolean {
    return !payload.exp || Date.now() >= payload.exp * 1000;
  }
}
