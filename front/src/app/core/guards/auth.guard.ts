import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { PerfilService } from '../services/perfil.service';
import { ToastService } from '../services/toast.service';

/** Exige sesión activa; si no, manda a /login y vuelve a la ruta pedida al ingresar. */
export const authGuard: CanActivateFn = (_route, state) => {
  // Igual que adminGuard: en SSR no hay localStorage, se decide en el navegador.
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;
  return inject(AuthService).sesionActiva()
    ? true
    : inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Los avisos por correo abren páginas públicas con `?chat=` o `?resena=`: sin sesión, primero se pide ingresar y se vuelve al enlace. */
export const avisoConSesionGuard: CanActivateFn = (route, state) =>
  ['chat', 'resena'].some((parametro) => route.queryParamMap.has(parametro)) ? authGuard(route, state) : true;

/**
 * Exige ser anunciante verificado (mismo criterio que AnuncianteGuard del backend).
 * Quien no lo es va a completar su verificación en vez de ver un 403.
 */
export const anuncianteGuard: CanActivateFn = (route, state) => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;
  const router = inject(Router);
  const toast = inject(ToastService);
  if (!inject(AuthService).sesionActiva()) {
    toast.mostrar('Para publicar una propiedad necesitás iniciar sesión o registrarte.');
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
  return inject(PerfilService).cargarSolicitud().pipe(map((solicitud) => {
      if (solicitud?.estado === 'aprobada') {
        if (!route.data['requiereCbu'] || solicitud.cbu_ultimos_digitos) return true;
        toast.mostrar('Necesitás un CBU validado para publicar una propiedad.');
        return router.createUrlTree(['/mi-perfil/validar-cbu']);
      }
      toast.mostrar('Para publicar una propiedad primero debés solicitar ser anunciante.');
      return router.createUrlTree(['/mi-perfil/anunciante']);
    }));
};
