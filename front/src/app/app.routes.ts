import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { anuncianteGuard, authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin.component').then((m) => m.AdminComponent),
    title: 'Panel administrativo — DEPA',
  },
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
    title: 'DEPA — Encontrá tu próximo hogar',
  },
  {
    // Debe ir antes de 'publicaciones/:id' para que "nueva" no se tome como id.
    path: 'publicaciones/nueva',
    canActivate: [anuncianteGuard],
    loadComponent: () =>
      import('./features/crear-publicacion/crear-publicacion.component').then((m) => m.CrearPublicacionComponent),
    title: 'Publicar propiedad — DEPA',
  },
  {
    path: 'mis-publicaciones',
    canActivate: [anuncianteGuard],
    loadComponent: () =>
      import('./features/mis-publicaciones/mis-publicaciones.component').then((m) => m.MisPublicacionesComponent),
    title: 'Mis publicaciones — DEPA',
  },
  {
    path: 'mi-perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./features/mi-perfil/mi-perfil.component').then((m) => m.MiPerfilComponent),
    title: 'Mi perfil — DEPA',
  },
  {
    path: 'mi-perfil/anunciante',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/solicitud-anunciante/solicitud-anunciante.component').then(
        (m) => m.SolicitudAnuncianteComponent,
      ),
    title: 'Convertite en anunciante — DEPA',
  },
  {
    path: 'publicaciones/:id',
    loadComponent: () =>
      import('./features/publication-detail/publication-detail.component').then(
        (m) => m.PublicationDetailComponent,
      ),
    title: 'Detalle de publicación — DEPA',
  },
  {
    path: 'perfil/:id',
    loadComponent: () =>
      import('./features/advertiser-profile/advertiser-profile.component').then(
        (m) => m.AdvertiserProfileComponent,
      ),
    title: 'Perfil del anunciante — DEPA',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    title: 'Iniciar sesión — DEPA',
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
    title: 'Crear cuenta — DEPA',
  },
  {
    path: 'verificar-cuenta',
    loadComponent: () =>
      import('./features/auth/verificar-cuenta/verificar-cuenta.component').then(
        (m) => m.VerificarCuentaComponent,
      ),
    title: 'Verificar cuenta — DEPA',
  },
  {
    path: 'recuperar-contrasenia',
    loadComponent: () =>
      import('./features/auth/recuperar-contrasenia/recuperar-contrasenia.component').then(
        (m) => m.RecuperarContraseniaComponent,
      ),
    title: 'Recuperar contraseña — DEPA',
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
    title: 'Restablecer contraseña — DEPA',
  },
];
