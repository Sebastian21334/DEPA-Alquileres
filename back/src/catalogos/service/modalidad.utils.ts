import type { Modalidad } from '../entity/modalidad.entity';

/** Una única regla compartida por calendario y reservas. */
export function admiteReservaPorFecha(modalidad?: Modalidad): boolean {
  if (modalidad?.permite_reservas_por_fecha != null) {
    return modalidad.permite_reservas_por_fecha;
  }
  return /tempor|diari/i.test(modalidad?.nombre ?? '');
}
