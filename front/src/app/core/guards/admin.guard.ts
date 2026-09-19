import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (_route, state) => {
  // El servidor no puede leer localStorage. Deja que la navegación inicial se
  // hidrate y aplica la autorización en el navegador, donde vive el JWT.
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;

  const auth = inject(AuthService);
  const router = inject(Router);

  // No tener sesión es un problema de autenticación: se pide ingresar y se
  // conserva la ruta original para volver luego del login.
  if (!auth.isAuthenticated) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  // Tener sesión pero carecer del rol requerido es un problema de
  // autorización. No se manda al login porque volver a autenticarse no cambia
  // los permisos de la cuenta.
  return auth.isAdmin
    ? true
    : router.createUrlTree(['/403']);
};
