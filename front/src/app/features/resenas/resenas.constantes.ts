/** Límites replicados desde el backend; el servidor vuelve a validarlos. */
export const MAX_CARACTERES_COMENTARIO = 200;
export const MIN_CARACTERES_MOTIVO_MODERACION = 5;
export const MAX_CARACTERES_MOTIVO_MODERACION = 300;
export const MAX_IMAGENES_RESENA = 3;
export const MAX_BYTES_IMAGEN_RESENA = 10 * 1024 * 1024;
export const TIPOS_IMAGEN_RESENA = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;
export const ACEPTAR_IMAGENES_RESENA = TIPOS_IMAGEN_RESENA.join(',');

export const ESTADOS_RESENAS_ADMINISTRACION = [
  { valor: 'todas', etiqueta: 'Todas' },
  { valor: 'visibles', etiqueta: 'Visibles' },
  { valor: 'ocultas', etiqueta: 'Ocultas' },
  { valor: 'denunciadas', etiqueta: 'Denunciadas' },
] as const;

export type EstadoResenasAdministracion =
  (typeof ESTADOS_RESENAS_ADMINISTRACION)[number]['valor'];
