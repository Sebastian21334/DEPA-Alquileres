import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin.component').then((m) => m.AdminComponent),
    title: 'Panel administrativo — SIAlquileres',
  },
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
    title: 'SIAlquileres — Encontrá tu próximo hogar',
  },
  {
    path: 'publicaciones/:id',
    loadComponent: () =>
      import('./features/publication-detail/publication-detail.component').then(
        (m) => m.PublicationDetailComponent,
      ),
    title: 'Detalle de publicación — SIAlquileres',
  },
  {
    path: 'perfil/:id',
    loadComponent: () =>
      import('./features/advertiser-profile/advertiser-profile.component').then(
        (m) => m.AdvertiserProfileComponent,
      ),
    title: 'Perfil del anunciante — SIAlquileres',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    title: 'Iniciar sesión — SIAlquileres',
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
    title: 'Crear cuenta — SIAlquileres',
  },
  {
    path: 'verificar-cuenta',
    loadComponent: () =>
      import('./features/auth/verificar-cuenta/verificar-cuenta.component').then(
        (m) => m.VerificarCuentaComponent,
      ),
    title: 'Verificar cuenta — SIAlquileres',
  },
  {
    path: 'recuperar-contrasenia',
    loadComponent: () =>
      import('./features/auth/recuperar-contrasenia/recuperar-contrasenia.component').then(
        (m) => m.RecuperarContraseniaComponent,
      ),
    title: 'Recuperar contraseña — SIAlquileres',
  },
  {
    // OJO: este path debe coincidir exactamente con el que arma
    // back/src/mail/mail.service.ts#enviarRecuperacion ("restablecer-contrasena",
    // sin la "i" de "contrasenia") o el link del mail apuntaría a un 404.
    path: 'restablecer-contrasena',
    loadComponent: () =>
      import('./features/auth/restablecer-contrasenia/restablecer-contrasenia.component').then(
        (m) => m.RestablecerContraseniaComponent,
      ),
    title: 'Restablecer contraseña — SIAlquileres',
  },
];
