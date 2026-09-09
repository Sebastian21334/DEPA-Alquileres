import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

// Interceptor funcional (Angular standalone): centraliza el manejo de errores HTTP
// para no repetir catchError en cada service. Traduce el error del backend (que
// NestJS devuelve como { message, statusCode, error }) a un Error con mensaje
// legible, y lo deja pasar para que cada componente decida cómo mostrarlo.
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const mensaje =
        (Array.isArray(error.error?.message) ? error.error.message.join(', ') : error.error?.message) ||
        error.message ||
        'Ocurrió un error inesperado al comunicarse con el servidor.';

      console.error(`[HTTP ${error.status}] ${req.method} ${req.url} -> ${mensaje}`);
      return throwError(() => new Error(mensaje));
    }),
  );
};
