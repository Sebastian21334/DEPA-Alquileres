import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  // El servidor no puede leer localStorage. Deja que la navegación inicial se
  // hidrate y aplica la autorización en el navegador, donde vive el JWT.
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;
  const auth = inject(AuthService);
  return auth.isAdmin
    ? true
    : inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: '/admin' } });
};
