import type { FechaDisponible } from '../services/availability.service';

export interface RentalDateRange {
  start: string | null;
  end: string | null;
}

/** La regla autoritativa vive en ReservaReprogramacionService. */
export const DIAS_MINIMOS_REPROGRAMACION = 6;

export function fechaHoyArgentina(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function sumarDias(fecha: string, dias: number): string {
  return new Date(Date.parse(`${fecha}T00:00:00Z`) + dias * 86_400_000)
    .toISOString()
    .slice(0, 10);
}

export function diasDeAntelacion(fecha: string | null, hoy = fechaHoyArgentina()): number {
  if (!fecha) return Number.NEGATIVE_INFINITY;
  return Math.round(
    (Date.parse(`${fecha}T00:00:00Z`) - Date.parse(`${hoy}T00:00:00Z`)) /
      86_400_000,
  );
}

// Los alquileres incluyen tanto el primer día como el último.
export function rentalDays(start: string | null, end: string | null): number {
  if (!start || !end || start > end) return 0;
  return Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1;
}

export function rentalEnd(start: string, days: number): string {
  return new Date(Date.parse(start) + (days - 1) * 86_400_000).toISOString().slice(0, 10);
}

export function availableRentalStarts(dates: FechaDisponible[], days: number): Set<string> {
  const available = [...new Set(dates.filter((day) => day.disponible && !day.reserva)
    .map((day) => day.fecha.slice(0, 10)))].sort();
  // Si el último día queda a la distancia esperada, no hay huecos en el período.
  return new Set(available.filter((start, index) =>
    available[index + days - 1] === rentalEnd(start, days),
  ));
}

export function isRentalRangeAvailable(start: string, end: string, dates: FechaDisponible[]): boolean {
  const available = new Set(
    dates.filter((day) => day.disponible && !day.reserva).map((day) => day.fecha.slice(0, 10)),
  );
  const count = rentalDays(start, end);
  if (!count) return false;
  const first = Date.parse(start);
  for (let offset = 0; offset < count; offset++) {
    if (!available.has(new Date(first + offset * 86_400_000).toISOString().slice(0, 10)))
      return false;
  }
  return true;
}
