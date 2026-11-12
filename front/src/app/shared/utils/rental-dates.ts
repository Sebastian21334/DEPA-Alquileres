import type { FechaDisponible } from '../services/availability.service';

export interface RentalDateRange {
  start: string | null;
  end: string | null;
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
