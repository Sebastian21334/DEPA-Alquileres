import type { Provider } from '@angular/core';
import { type ActivatedRouteSnapshot, BaseRouteReuseStrategy, RouteReuseStrategy } from '@angular/router';

/**
 * Angular reutiliza el componente al navegar a la misma ruta con otros parámetros, por ejemplo de `/publicaciones/1`
 * a `/publicaciones/3` desde el asistente o el chat: la URL cambia y la pantalla sigue mostrando lo anterior.
 * Las rutas con `data: { recrearConOtrosParametros: true }` crean el componente de nuevo, sin arrastrar su estado.
 */
export class ReutilizacionRutas extends BaseRouteReuseStrategy {
  override shouldReuseRoute(futura: ActivatedRouteSnapshot, actual: ActivatedRouteSnapshot): boolean {
    if (!super.shouldReuseRoute(futura, actual)) return false;
    return !futura.data['recrearConOtrosParametros'] || mismosParametros(futura, actual);
  }
}

function mismosParametros(futura: ActivatedRouteSnapshot, actual: ActivatedRouteSnapshot): boolean {
  const claves = new Set([...futura.paramMap.keys, ...actual.paramMap.keys]);
  return [...claves].every((clave) => futura.paramMap.get(clave) === actual.paramMap.get(clave));
}

/** Lo usan la aplicación y la vista previa, que arma sus propios proveedores. */
export const proveerReutilizacionRutas: Provider = { provide: RouteReuseStrategy, useClass: ReutilizacionRutas };
