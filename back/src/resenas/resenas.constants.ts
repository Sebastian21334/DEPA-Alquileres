/** Límites compartidos por los DTO, los controllers y los servicios de reseñas. */
export const MAX_CARACTERES_COMENTARIO = 200;
export const MIN_CARACTERES_MOTIVO_MODERACION = 5;
export const MAX_CARACTERES_MOTIVO_MODERACION = 300;
export const MAX_CARACTERES_MOTIVO_DENUNCIA = 300;
export const MAX_BYTES_IMAGEN_RESENA = 10 * 1024 * 1024;

/** El front replica esta lista para la experiencia; el servidor valida la firma real. */
export const TIPOS_IMAGEN_RESENA = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;
