import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ApiError } from './api-error';
import { AuthService } from '../services/auth.service';

// Interceptor funcional (Angular standalone): centraliza el manejo de errores HTTP
// para no repetir catchError en cada service. Traduce el error del backend (que
// NestJS devuelve como { message, statusCode, error }) a un ApiError con mensaje
// legible y el código HTTP. Los componentes solo leen `err.message` y `err.status`.
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const mensaje = mensajeDe(error);
      console.error(`[HTTP ${error.status}] ${req.method} ${req.url} -> ${mensaje}`);

      // Un 401 fuera del login significa que el token venció o dejó de ser
      // válido. Se limpia la sesión y se vuelve al login en lugar de dejar
      // que el flujo facial interprete el 401 como un fallo de vitalidad.
      if (error.status === 401 && !req.url.includes('/auth/')) {
        auth.logout();
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.startsWith('/login')
        ) {
          const returnUrl = window.location.pathname + window.location.search;
          window.location.assign(
            `/login?returnUrl=${encodeURIComponent(returnUrl)}&sesionExpirada=1`,
          );
        }
      }

      return throwError(() => new ApiError(error.status, mensaje));
    }),
  );
};

function mensajeDe(error: HttpErrorResponse): string {
  const delBack = Array.isArray(error.error?.message)
    ? error.error.message.join(', ')
    : error.error?.message;
  if (delBack) return delBack;
  // Sin respuesta del servidor, el mensaje de Angular ("Http failure response…") no le sirve al usuario.
  return error.status === 0
    ? 'No pudimos comunicarnos con el servidor. Revisá tu conexión e intentá nuevamente.'
    : error.message || 'Ocurrió un error inesperado al comunicarse con el servidor.';
}
