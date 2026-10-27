import { Fecha } from './fecha.entity';

describe('Fecha', () => {
  it('se ocupa y se libera junto con su reserva', () => {
    const fecha: Fecha = Object.assign(new Fecha(), {
      disponible: true,
      reserva: null,
    });
    expect(fecha.estaLibre()).toBe(true);
    fecha.ocuparPor(42);
    expect(fecha.estaLibre()).toBe(false);
    expect(fecha.reserva?.id).toBe(42);
    fecha.liberar();
    expect(fecha.estaLibre()).toBe(true);
    expect(fecha.reserva).toBeNull();
  });

  it('al reprogramar acepta los días de la misma reserva y rechaza los ajenos o bloqueados', () => {
    const propia: Fecha = Object.assign(new Fecha(), { disponible: true });
    propia.ocuparPor(42);
    const bloqueada: Fecha = Object.assign(new Fecha(), {
      disponible: false,
      reserva: null,
    });
    expect(propia.puedeOcuparla(42)).toBe(true);
    expect(propia.puedeOcuparla(43)).toBe(false);
    expect(bloqueada.puedeOcuparla(42)).toBe(false);
  });
});
