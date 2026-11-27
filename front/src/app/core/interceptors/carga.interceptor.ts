import { HttpContext, HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { defer, finalize } from 'rxjs';
import { CargaService } from '../services/carga.service';

const CARGA_SILENCIOSA = new HttpContextToken(() => false);

/** Solo las consultas de fondo omiten el indicador; no modifica la petición HTTP. */
export function contextoCarga(silenciosa = false): HttpContext {
  return new HttpContext().set(CARGA_SILENCIOSA, silenciosa);
}

export const cargaInterceptor: HttpInterceptorFn = (req, next) => {
  const carga = inject(CargaService);
  if (req.context.get(CARGA_SILENCIOSA)) return next(req);
  return defer(() => {
    const terminar = carga.iniciar();
    return defer(() => next(req)).pipe(finalize(terminar));
  });
};
