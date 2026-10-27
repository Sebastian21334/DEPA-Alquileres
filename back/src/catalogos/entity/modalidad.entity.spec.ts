import { Modalidad, admiteReservaPorFecha } from './modalidad.entity';

describe('Regla de modalidad por fecha', () => {
  it('prioriza la configuración explícita sobre el nombre visible', () => {
    expect(
      admiteReservaPorFecha({
        nombre: 'Alquiler diario',
        permite_reservas_por_fecha: true,
      }),
    ).toBe(true);
    expect(
      admiteReservaPorFecha({
        nombre: 'Temporal',
        permite_reservas_por_fecha: false,
      }),
    ).toBe(false);
  });

  it('para filas sin configurar usa el nombre como respaldo', () => {
    expect(
      admiteReservaPorFecha({
        nombre: 'Temporal',
        permite_reservas_por_fecha: null,
      }),
    ).toBe(true);
    expect(
      admiteReservaPorFecha({
        nombre: 'Alquiler diario',
        permite_reservas_por_fecha: null,
      }),
    ).toBe(true);
    expect(
      admiteReservaPorFecha({
        nombre: 'Largo Plazo',
        permite_reservas_por_fecha: null,
      }),
    ).toBe(false);
    expect(admiteReservaPorFecha(undefined)).toBe(false);
  });

  it('expone el resultado calculado al cargar la entidad para que el front no repita la regla', () => {
    const modalidad = Object.assign(new Modalidad(), {
      nombre: 'Alquiler diario',
      permite_reservas_por_fecha: true,
    });
    modalidad['calcularAdmiteReservasPorFecha']();
    expect(JSON.parse(JSON.stringify(modalidad))).toMatchObject({
      admite_reservas_por_fecha: true,
    });
  });
});
