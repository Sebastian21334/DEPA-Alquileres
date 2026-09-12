import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { PerfilService } from '../services/perfil.service';

/** Exige sesión activa; si no, manda a /login y vuelve a la ruta pedida al ingresar. */
export const authGuard: CanActivateFn = (_route, state) => {
  // Igual que adminGuard: en SSR no hay localStorage, se decide en el navegador.
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;
  return inject(AuthService).isAuthenticated
    ? true
    : inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/**
 * Exige ser anunciante verificado (mismo criterio que AnuncianteGuard del backend).
 * Quien no lo es va a completar su verificación en vez de ver un 403.
 */
export const anuncianteGuard: CanActivateFn = (route, state) => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;
  const router = inject(Router);
  if (!inject(AuthService).isAuthenticated) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
  return inject(PerfilService)
    .esAnunciante()
    .pipe(map((ok) => (ok ? true : router.createUrlTree(['/mi-perfil/anunciante']))));
};
