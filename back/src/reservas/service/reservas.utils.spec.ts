import { normalizarFechaReserva } from './reservas.utils';

describe('normalizarFechaReserva', () => {
  it('convierte las columnas date devueltas como texto por PostgreSQL', () => {
    const inicio = normalizarFechaReserva('2026-10-10');
    const fin = normalizarFechaReserva('2026-10-12');
    const cantidadDias =
      Math.floor((fin.getTime() - inicio.getTime()) / 86_400_000) + 1;

    expect(cantidadDias).toBe(3);
  });

  it('conserva las instancias Date recibidas durante la creación', () => {
    const fecha = new Date('2026-10-10T12:00:00Z');

    expect(normalizarFechaReserva(fecha)).toBe(fecha);
  });
});
