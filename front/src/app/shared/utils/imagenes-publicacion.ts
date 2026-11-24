/** Reglas de las fotos de una publicación, las mismas que aplica el back (ImagenesController e ImagenesService). */
export const TIPOS_IMAGEN_PUBLICACION = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
export const MAX_BYTES_IMAGEN_PUBLICACION = 10 * 1024 * 1024;
export const MAX_IMAGENES_PUBLICACION = 15;

/** Descarta los archivos que no son fotos válidas y los que ya no entran en la galería, y explica por qué. */
export function filtrarImagenesPublicacion(archivos: readonly File[], cargadas: number): { aceptadas: File[]; aviso: string } {
  const validas = archivos.filter((archivo) => TIPOS_IMAGEN_PUBLICACION.includes(archivo.type) && archivo.size <= MAX_BYTES_IMAGEN_PUBLICACION);
  const lugar = Math.max(0, MAX_IMAGENES_PUBLICACION - cargadas);
  const avisos: string[] = [];
  const descartadas = archivos.length - validas.length;
  if (descartadas) avisos.push(`${descartadas} archivo(s) descartado(s): solo imágenes JPG, PNG, WEBP o HEIC de hasta 10 MB.`);
  if (validas.length > lugar) avisos.push(`Máximo ${MAX_IMAGENES_PUBLICACION} imágenes por publicación.`);
  return { aceptadas: validas.slice(0, lugar), aviso: avisos.join(' ') };
}
