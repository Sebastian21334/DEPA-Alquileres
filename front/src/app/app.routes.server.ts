import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // El panel depende del JWT almacenado en el navegador y no debe intentar
    // consultar endpoints administrativos durante SSR.
    path: 'admin',
    renderMode: RenderMode.Client,
  },
  // Páginas de cuenta: dependen del JWT en localStorage, igual que el panel admin.
  { path: 'mi-perfil', renderMode: RenderMode.Client },
  { path: 'mi-perfil/anunciante', renderMode: RenderMode.Client },
  { path: 'mis-publicaciones', renderMode: RenderMode.Client },
  { path: 'publicaciones/nueva', renderMode: RenderMode.Client },
  {
    path: 'publicaciones/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'perfil/:id',
    renderMode: RenderMode.Client,
  },
  {
    // La Home consume datos en vivo del backend (publicaciones activas), así que
    // se renderiza por request (SSR) en vez de precomputarse en build time
    // (Prerender exigiría que el backend esté disponible durante `ng build`).
    path: '**',
    renderMode: RenderMode.Server,
  },
];
