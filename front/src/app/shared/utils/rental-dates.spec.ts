import { isRentalRangeAvailable, rentalDays } from './rental-dates';

describe('Fechas de alquiler', () => {
  it('cobra un día si ambos extremos coinciden', () => {
    expect(rentalDays('2026-10-15', '2026-10-15')).toBe(1);
  });
  it('cuenta los extremos, años bisiestos y cambios de mes sin depender del horario local', () => {
    expect(rentalDays('2028-02-28', '2028-03-01')).toBe(3);
    expect(rentalDays('2027-03-13', '2027-03-15')).toBe(3);
    expect(rentalDays('2026-12-31', '2027-01-01')).toBe(2);
    expect(rentalDays('2026-10-20', '2026-10-15')).toBe(0);
    expect(rentalDays('2026-10-15', null)).toBe(0);
  });
  it('verifica todos los días, incluidas las reservas y fechas recibidas con hora', () => {
    const dates = [
      { fecha: '2026-10-15T00:00:00Z', disponible: true },
      { fecha: '2026-10-16', disponible: true, reserva: { id: 1 } },
      { fecha: '2026-10-17', disponible: true },
    ];
    expect(isRentalRangeAvailable('2026-10-15', '2026-10-15', dates)).toBe(true);
    expect(isRentalRangeAvailable('2026-10-15', '2026-10-17', dates)).toBe(false);
    expect(isRentalRangeAvailable('2026-10-17', '2026-10-18', dates)).toBe(false);
  });
});
