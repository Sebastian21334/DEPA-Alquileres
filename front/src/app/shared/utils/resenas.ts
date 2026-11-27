/** Utilidades puras de presentación de reseñas; no replican reglas del backend. */

export const MAX_ESTRELLAS = 5;

/**
 * El promedio solo se muestra cuando existe al menos una reseña visible.
 * Acepta string porque PostgreSQL devuelve `numeric` como texto.
 */
export function promedioMostrable(
  cantidad: number | string | null | undefined,
  promedio: number | string | null | undefined,
): number | null {
  const total = Number(cantidad ?? 0);
  const valor = Number(promedio);
  if (!Number.isFinite(total) || total <= 0) return null;
  if (!Number.isFinite(valor) || valor <= 0) return null;
  return Math.min(MAX_ESTRELLAS, Math.max(0, valor));
}

export function formatearPromedio(promedio: number): string {
  return promedio.toLocaleString('es-AR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function porcentajeEstrellas(puntaje: number): number {
  const valor = Number(puntaje);
  if (!Number.isFinite(valor)) return 0;
  return Math.min(100, Math.max(0, (valor / MAX_ESTRELLAS) * 100));
}

export function porcentajeResenas(cantidad: number, total: number): number {
  if (!Number.isFinite(cantidad) || !Number.isFinite(total) || total <= 0) return 0;
  return Math.min(100, Math.max(0, (cantidad / total) * 100));
}
