import { jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PresupuestosService } from './presupuestos.service';
import { CotizacionesService } from '../../cotizaciones/service/cotizaciones.service';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';
import { DisponibilidadService } from '../../disponibilidad/service/disponibilidad.service';
import { Publicacion } from '../../publicaciones/entity/publicacion.entity';
import { CotizacionDolar } from '../../cotizaciones/entity/cotizacion-dolar.entity';
import { decimalEntero, importeTexto } from '../../common/utils/importes';

describe('Presupuesto aceptado antes de cobrar', () => {
  let servicio: PresupuestosService, publicacion: Publicacion;
  const obtenerVigente = jest.fn<() => Promise<CotizacionDolar>>();
  const dto = {
    id_publicacion: 42,
    fecha_inicio: '2100-01-01',
    fecha_fin: '2100-01-02',
  };
  beforeEach(async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
    jest.setSystemTime(new Date('2026-10-27T12:00:00Z'));
    publicacion = {
      id: 42,
      precio: 100,
      activa: true,
      modalidad: { nombre: 'Temporal' },
      tipoMoneda: { nombre: 'USD' },
      anunciante: { idUsuario: 1 },
    } as Publicacion;
    obtenerVigente.mockReset().mockResolvedValue(
      Object.assign(new CotizacionDolar(), {
        id: 8,
        venta: '1500.000000',
        compra: '1400.000000',
        actualizada_fuente_en: new Date(),
        consultada_en: new Date(),
      }),
    );
    const modulo = await Test.createTestingModule({
      providers: [
        PresupuestosService,
        JwtService,
        {
          provide: ConfigService,
          useValue: new ConfigService({
            JWT_SECRET: 'secreto-de-prueba',
            MP_CURRENCY_ID: 'ARS',
          }),
        },
        { provide: CotizacionesService, useValue: { obtenerVigente } },
        {
          provide: PublicacionesService,
          useValue: { buscarPorId: async () => publicacion },
        },
        {
          provide: DisponibilidadService,
          useValue: { verificarDisponibilidad: async () => true },
        },
      ],
    }).compile();
    servicio = modulo.get(PresupuestosService);
  });
  afterEach(() => jest.useRealTimers());
  it('convierte el total USD a pesos con blue venta y firma importe, usuario y fechas', async () => {
    const precio = await servicio.cotizar(dto, 7);
    expect(precio).toMatchObject({
      total_origen: '200.00',
      moneda_origen: 'USD',
      total_cobro: '300000.00',
      moneda_cobro: 'ARS',
      cotizacion_id: 8,
    });
    expect(await servicio.validar(precio.token, dto, 7)).toMatchObject({
      total_cobro: '300000.00',
    });
    await expect(servicio.validar(precio.token, dto, 9)).rejects.toThrow(
      'no corresponde',
    );
    await expect(
      servicio.validar(precio.token, { ...dto, fecha_fin: '2100-01-03' }, 7),
    ).rejects.toThrow('no corresponde');
    await expect(
      new JwtService().verifyAsync(precio.token, {
        secret: 'secreto-de-prueba',
      }),
    ).rejects.toThrow();
  });
  it('al despertar con un presupuesto vencido exige cotizar de nuevo', async () => {
    const precio = await servicio.cotizar(dto, 7);
    jest.setSystemTime(new Date(Date.now() + 16 * 60000));
    await expect(servicio.validar(precio.token, dto, 7)).rejects.toThrow(
      'venció',
    );
  });
  it('el precio ya emitido conserva la cotización aunque cambie el dólar mientras se paga', async () => {
    const precio = await servicio.cotizar(dto, 7);
    obtenerVigente.mockRejectedValue(new Error('Proveedor caído'));
    expect((await servicio.validar(precio.token, dto, 7)).total_cobro).toBe(
      '300000.00',
    );
    expect(obtenerVigente).toHaveBeenCalledTimes(1);
  });
  it('las reservas en pesos no dependen de que el dólar responda', async () => {
    publicacion.tipoMoneda.nombre = 'Pesos argentinos';
    obtenerVigente.mockRejectedValue(new Error('Proveedor dormido'));
    expect(await servicio.cotizar(dto, 7)).toMatchObject({
      total_origen: '200.00',
      total_cobro: '200.00',
      cotizacion: null,
    });
    expect(obtenerVigente).not.toHaveBeenCalled();
  });
  it('rechaza un token alterado y monedas que no estén habilitadas', async () => {
    const precio = await servicio.cotizar(dto, 7);
    const partes = precio.token.split('.');
    partes[1] = Buffer.from('{"total_cobro":"1.00"}').toString('base64url');
    await expect(servicio.validar(partes.join('.'), dto, 7)).rejects.toThrow(
      'no es válido',
    );
    publicacion.tipoMoneda.nombre = 'EUR';
    await expect(servicio.cotizar(dto, 7)).rejects.toThrow(
      'no está habilitada',
    );
  });
  it('redondea una sola vez el resultado y rechaza importes que no caben en el cobro', () => {
    expect(
      importeTexto(
        (decimalEntero('0.07', 2) * decimalEntero('1.500000', 6) + 500000n) /
          1000000n,
      ),
    ).toBe('0.11');
    expect(() => importeTexto(10000000000n)).toThrow('supera el máximo');
  });
});
