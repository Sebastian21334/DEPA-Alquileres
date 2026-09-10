import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

// Payload del JWT emitido por POST /auth/login (back/src/auth/service/auth.service.ts):
// { sub, email, rol, iat, exp }.
interface JwtPayload {
  sub: number;
  email: string;
  rol?: string;
  exp: number;
}

// DTOs alineados con back/src/auth/dto/register.dto.ts y login.dto.ts.
export interface RegisterDto {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  contrasenia: string;
}

export interface LoginDto {
  email: string;
  contrasenia: string;
}

interface LoginResponse {
  access_token: string;
}

interface MensajeResponse {
  mensaje: string;
}

const TOKEN_KEY = 'auth_token';

// Implementa RF2 (autenticación) y el alta de usuarios de RF1: registro, login,
// consumo del link de verificación de email y logout. Toda la persistencia de
// sesión es un JWT de corta duración guardado en localStorage (ver RNF3/diseño:
// "JWT de corta duración junto con un mecanismo de refresh token" — el backend
// todavía no expone el refresh token, así que por ahora solo se maneja el
// access_token; cuando el backend lo agregue, este service es el único lugar
// a tocar).
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  // Signal de solo-lectura que expone el usuario autenticado (o null).
  readonly currentUser = signal<JwtPayload | null>(this.leerPayloadInicial());

  get isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  get token(): string | null {
    return this.isBrowser ? localStorage.getItem(TOKEN_KEY) : null;
  }

  get isAdmin(): boolean {
    return this.currentUser()?.rol === 'Administrador';
  }

  /** POST /auth/register — crea la cuenta (siempre como Inquilino) y dispara el mail de verificación. */
  register(dto: RegisterDto): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(`${this.baseUrl}/register`, dto);
  }

  /** POST /auth/verificar-cuenta — consume el token del link recibido por mail. */
  verificarCuenta(token: string): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(`${this.baseUrl}/verificar-cuenta`, { token });
  }

  /**
   * POST /auth/recuperar-contrasenia — pide el mail con el link de
   * restablecimiento. El backend siempre devuelve el mismo mensaje neutro
   * exista o no la cuenta (evita que alguien pueda usar este endpoint para
   * confirmar qué emails están registrados), así que no hay un "caso de
   * error" propio de negocio acá, solo errores de red/validación.
   */
  solicitarRecuperacion(email: string): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(`${this.baseUrl}/recuperar-contrasenia`, { email });
  }

  /** POST /auth/restablecer-contrasenia — consume el token del link y fija la nueva contraseña. */
  restablecerContrasenia(token: string, nuevaContrasenia: string): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(`${this.baseUrl}/restablecer-contrasenia`, {
      token,
      nuevaContrasenia,
    });
  }

  /** POST /auth/login — valida credenciales y guarda el JWT devuelto. */
  login(dto: LoginDto): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, dto)
      .pipe(tap((res) => this.guardarSesion(res.access_token)));
  }

  /** Cierra la sesión activa (borra el token y limpia el estado en memoria). */
  logout(): void {
    if (this.isBrowser) localStorage.removeItem(TOKEN_KEY);
    this.currentUser.set(null);
  }

  private guardarSesion(token: string): void {
    if (this.isBrowser) localStorage.setItem(TOKEN_KEY, token);
    this.currentUser.set(this.decodificar(token));
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
