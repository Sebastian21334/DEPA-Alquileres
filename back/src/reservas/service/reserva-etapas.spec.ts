import { jest } from '@jest/globals';
import {
  Reserva,
  EstadoPagoReserva,
  EstadoLiquidacionReserva,
} from '../entity/reserva.entity';
import { Publicacion } from '../../publicaciones/entity/publicacion.entity';
import { Anunciante } from '../../anunciantes/entity/anunciante.entity';
import { Usuario } from '../../usuarios/entity/usuario.entity';
import { ReservasService } from './reservas.service';
import { ReservaLiquidacionesService } from './reserva-liquidaciones.service';
import type { IReservaRepository } from '../repository/reserva.repository.interface';
import type { ITransaccionCalendario } from '../../disponibilidad/repository/transaccion-calendario.interface';

describe('Acciones permitidas según la etapa de la estadía', () => {
  const guardar = jest.fn<IReservaRepository['guardar']>();
  let reserva: Reserva;
  const repo = {
    buscarPorId: async () => reserva,
    buscarPorIdConCodigo: async () => reserva,
    guardar,
  } as unknown as IReservaRepository;
  const transaccion = {
    ejecutar: async (operacion) => operacion({ reservas: repo, fechas: null! }),
  } as ITransaccionCalendario;
  const reservas = new ReservasService(
    null!,
    transaccion,
    repo,
    null!,
    null!,
    null!,
    null!,
  );
  const liquidaciones = new ReservaLiquidacionesService(
    transaccion,
    repo,
    null!,
  );

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-28T12:00:00Z'));
    guardar.mockReset();
    guardar.mockImplementation(async (r) => r);
    reserva = Object.assign(new Reserva(), {
      id: 1,
      usuario: Object.assign(new Usuario(), { id: 2 }),
      // Instancias reales: la entidad responde quién es el anunciante (ver violación 14).
      publicacion: Object.assign(new Publicacion(), {
        anunciante: Object.assign(new Anunciante(), { idUsuario: 3 }),
      }),
      estado_pago: EstadoPagoReserva.APROBADO,
      estado_liquidacion: EstadoLiquidacionReserva.RETENIDO,
      finalizada: false,
      cancelada: false,
      fecha_inicio: '2026-10-27',
      fecha_fin: '2026-10-30',
      codigo_alojamiento: 'ABCD1234',
      codigo_validado_en: null,
      intentos_codigo: 0,
    });
  });
  afterEach(() => jest.useRealTimers());

  it.each([
    ['2026-10-29', '2026-11-01'],
    ['2026-10-25', '2026-10-27'],
    [null, null],
  ])('no valida códigos fuera del período: %s — %s', async (inicio, fin) => {
    reserva.fecha_inicio = inicio;
    reserva.fecha_fin = fin;
    await expect(
      liquidaciones.validarCodigoAlojamiento(1, 'ABCD1234', 3),
    ).rejects.toThrow('durante las fechas');
    expect(guardar).not.toHaveBeenCalled();
  });

  it('valida el ingreso durante la estadía y devuelve la etapa en curso', async () => {
    const resultado = await liquidaciones.validarCodigoAlojamiento(
      1,
      'ABCD1234',
      3,
    );
    expect(resultado.estado_estadia).toBe('EN_CURSO');
    expect(resultado.estado_liquidacion).toBe(
      EstadoLiquidacionReserva.PENDIENTE_PAGO_PROPIETARIO,
    );
    expect(resultado.estado_pago).toBe(EstadoPagoReserva.APROBADO);
  });

  it('no permite recuperar un código de una reserva terminada sin ingreso', async () => {
    reserva.fecha_fin = '2026-10-27';
    await expect(
      liquidaciones.consultarCodigoAlojamiento(1, 2),
    ).rejects.toThrow('estadía cerrada');
    expect(guardar).not.toHaveBeenCalled();
  });

  it.each([
    ['2026-10-27', '2026-10-30'],
    ['2026-10-25', '2026-10-27'],
  ])(
    'no permite mover una estadía iniciada o vencida: %s',
    async (inicio, fin) => {
      reserva.fecha_inicio = inicio;
      reserva.fecha_fin = fin;
      await expect(
        reservas.actualizarFechas(
          1,
          { fecha_inicio: '2026-11-01', fecha_fin: '2026-11-04' },
          2,
        ),
      ).rejects.toThrow('antes del inicio');
      expect(guardar).not.toHaveBeenCalled();
    },
  );

  it('no convierte una reserva sin ingreso en finalizada', async () => {
    reserva.fecha_fin = '2026-10-27';
    await expect(reservas.finalizar(1, 3)).rejects.toThrow('validar el código');
    expect(reserva.estado_estadia).toBe('INGRESO_NO_VERIFICADO');
    expect(guardar).not.toHaveBeenCalled();
  });

  it('conserva el cierre manual de una estadía en curso', async () => {
    reserva.codigo_validado_en = new Date();
    const resultado = await reservas.finalizar(1, 3);
    expect(resultado.finalizada).toBe(true);
    expect(resultado.estado_estadia).toBe('FINALIZADA');
  });
});
