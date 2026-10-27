import { calcularEstadoEstadia, fechaArgentina } from './estado-estadia';
import {
  Reserva,
  EstadoPagoReserva,
  EstadoLiquidacionReserva,
} from '../entity/reserva.entity';

const datos = () => ({
  estado_pago: EstadoPagoReserva.APROBADO,
  estado_liquidacion: EstadoLiquidacionReserva.RETENIDO,
  cancelada: false,
  finalizada: false,
  fecha_inicio: '2026-10-27',
  fecha_fin: '2026-10-30',
  codigo_validado_en: null as Date | null,
});

describe('Estado de la estadía según el calendario argentino', () => {
  it.each([
    ['2026-10-27T02:59:59Z', false, 'CONFIRMADA'],
    ['2026-10-27T03:00:00Z', false, 'PENDIENTE_INGRESO'],
    ['2026-10-29T12:00:00Z', false, 'PENDIENTE_INGRESO'],
    ['2026-10-29T12:00:00Z', true, 'EN_CURSO'],
    ['2026-10-31T02:59:59Z', true, 'EN_CURSO'],
    ['2026-10-31T02:59:59Z', false, 'PENDIENTE_INGRESO'],
    ['2026-10-31T03:00:00Z', true, 'FINALIZADA'],
    ['2026-10-31T03:00:00Z', false, 'INGRESO_NO_VERIFICADO'],
  ])('%s, ingreso %s → %s', (ahora, validado, esperado) => {
    const reserva = {
      ...datos(),
      codigo_validado_en: validado ? new Date('2026-10-27T12:00:00Z') : null,
    };
    expect(calcularEstadoEstadia(reserva, new Date(ahora))).toBe(esperado);
  });

  it('incluye todo el día en una reserva de un solo día', () => {
    const reserva = { ...datos(), fecha_fin: '2026-10-27' };
    expect(
      calcularEstadoEstadia(reserva, new Date('2026-10-28T02:59:59Z')),
    ).toBe('PENDIENTE_INGRESO');
    expect(
      calcularEstadoEstadia(reserva, new Date('2026-10-28T03:00:00Z')),
    ).toBe('INGRESO_NO_VERIFICADO');
  });

  it.each([
    [{ estado_pago: EstadoPagoReserva.PENDIENTE }, 'PENDIENTE_PAGO'],
    [
      { estado_pago: EstadoPagoReserva.RECHAZADO, cancelada: true },
      'PAGO_RECHAZADO',
    ],
    [
      { estado_pago: EstadoPagoReserva.REEMBOLSADO, cancelada: true },
      'REEMBOLSADA',
    ],
    [{ estado_pago: EstadoPagoReserva.CANCELADO }, 'CANCELADA'],
    [{ cancelada: true }, 'CANCELADA'],
    [{ finalizada: true }, 'FINALIZADA'],
    [{ fecha_inicio: null }, 'FECHAS_A_REVISAR'],
    [{ fecha_fin: null }, 'FECHAS_A_REVISAR'],
    [{ fecha_fin: '2026-02-30' }, 'FECHAS_A_REVISAR'],
    [{ fecha_fin: '2026-10-26' }, 'FECHAS_A_REVISAR'],
  ])(
    'conserva estados previos y trata fechas incompletas: %j',
    (cambios, esperado) => {
      expect(
        calcularEstadoEstadia(
          { ...datos(), ...cambios },
          new Date('2026-11-01T12:00:00Z'),
        ),
      ).toBe(esperado);
    },
  );

  it('recalcula tras una reprogramación y no altera el dinero ni los indicadores guardados', () => {
    const reserva = datos();
    const original = { ...reserva };
    const ahora = new Date('2026-10-29T12:00:00Z');
    expect(calcularEstadoEstadia(reserva, ahora)).toBe('PENDIENTE_INGRESO');
    expect(reserva).toEqual(original);
    reserva.fecha_inicio = '2026-11-01';
    reserva.fecha_fin = '2026-11-04';
    expect(calcularEstadoEstadia(reserva, ahora)).toBe('CONFIRMADA');
  });

  it('serializa reservas antiguas y anidadas sin guardar un estado derivado', () => {
    const reserva = Object.assign(new Reserva(), datos(), {
      fecha_inicio: '2000-01-01',
      fecha_fin: '2000-01-02',
    });
    const resumen = JSON.parse(JSON.stringify({ reserva, listado: [reserva] }));
    expect(resumen.reserva.estado_estadia).toBe('INGRESO_NO_VERIFICADO');
    expect(resumen.listado[0].estado_estadia).toBe('INGRESO_NO_VERIFICADO');
    expect(reserva.finalizada).toBe(false);
    expect(reserva.estado_pago).toBe(EstadoPagoReserva.APROBADO);
    expect(reserva.estado_liquidacion).toBe(EstadoLiquidacionReserva.RETENIDO);
    expect(Object.hasOwn(reserva, 'estado_estadia')).toBe(false);
  });

  it('no utiliza la fecha UTC para cambiar de día', () => {
    expect(fechaArgentina(new Date('2027-01-01T02:59:59Z'))).toBe('2026-12-31');
    expect(fechaArgentina(new Date('2027-01-01T03:00:00Z'))).toBe('2027-01-01');
  });
});
