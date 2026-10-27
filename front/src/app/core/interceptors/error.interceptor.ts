import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiError } from './api-error';

// Interceptor funcional (Angular standalone): centraliza el manejo de errores HTTP
// para no repetir catchError en cada service. Traduce el error del backend (que
// NestJS devuelve como { message, statusCode, error }) a un ApiError con mensaje
// legible y el código HTTP. Los componentes solo leen `err.message` y `err.status`.
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const mensaje = mensajeDe(error);
      console.error(`[HTTP ${error.status}] ${req.method} ${req.url} -> ${mensaje}`);
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
