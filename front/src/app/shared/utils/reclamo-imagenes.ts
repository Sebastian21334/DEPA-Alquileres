import type { Reclamo } from '../services/reservation.service';

/** Mismos límites que el back (reclamos.service): por envío y por reclamo, sumando las de todas las partes. */
export const MAX_IMAGENES_POR_ENVIO = 10;
export const MAX_IMAGENES_POR_RECLAMO = 30;

/** Cuántas imágenes se pueden adjuntar en el próximo mensaje; el back vuelve a controlar el total. */
export function imagenesDisponibles(reclamo: Reclamo): number {
  const enMensajes = (reclamo.mensajes ?? []).reduce((total, mensaje) => total + (mensaje.evidencias?.length ?? 0), 0);
  const total = (reclamo.evidencias?.length ?? 0) + enMensajes;
  return Math.max(0, Math.min(MAX_IMAGENES_POR_ENVIO, MAX_IMAGENES_POR_RECLAMO - total));
}

/** Sin imágenes el mensaje va como JSON; con imágenes, como multipart con el texto opcional. */
export function cuerpoMensajeReclamo(texto: string, imagenes: readonly File[]): FormData | { texto: string; visible_para: 'TODOS' } {
  if (!imagenes.length) return { texto, visible_para: 'TODOS' };
  const datos = new FormData();
  if (texto) datos.append('texto', texto);
  datos.append('visible_para', 'TODOS');
  imagenes.forEach((imagen) => datos.append('evidencias', imagen));
  return datos;
}
