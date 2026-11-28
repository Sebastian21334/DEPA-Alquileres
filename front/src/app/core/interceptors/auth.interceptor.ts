import { DOCUMENT } from '@angular/common';
import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const SOLICITUD_ANONIMA = new HttpContextToken(() => false);
const origenApi = new URL(environment.apiUrl).origin;

export function esSolicitudDeApi(url: string, base: string): boolean {
  try {
    return new URL(url, base).origin === origenApi;
  } catch {
    return false;
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SOLICITUD_ANONIMA) || !esSolicitudDeApi(req.url, inject(DOCUMENT).baseURI)) return next(req);
  const token = inject(AuthService).token;
  return next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req);
};
