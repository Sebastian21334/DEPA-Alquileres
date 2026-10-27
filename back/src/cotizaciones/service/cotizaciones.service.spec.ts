import { jest } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { CotizacionesService } from './cotizaciones.service';
import { CotizacionDolar } from '../entity/cotizacion-dolar.entity';
import { ConsultaCotizacion } from '../entity/consulta-cotizacion.entity';
import type { ICotizacionRepository } from '../repository/cotizacion.repository.interface';
import type { IProveedorDolar } from '../repository/proveedor-dolar.interface';

describe('Cotización con backend que duerme', () => {
  let precios: CotizacionDolar[],
    consultas: ConsultaCotizacion[],
    repo: ICotizacionRepository;
  let servicio: CotizacionesService;
  const consultar = jest.fn<IProveedorDolar['consultar']>();
  const crear = () =>
    new CotizacionesService(repo, { consultar }, new ConfigService());
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-10-27T12:00:00Z'));
    precios = [];
    consultas = [];
    let turno = Promise.resolve();
    consultar
      .mockReset()
      .mockImplementation(async () => ({
        compra: 1400,
        venta: 1500,
        actualizadaEn: new Date(),
      }));
    repo = {
      ultima: async () => precios.at(-1) ?? null,
      ultimaConsulta: async () => consultas.at(-1) ?? null,
      guardar: async (datos) => {
        const precio = Object.assign(new CotizacionDolar(), datos, {
          id: precios.length + 1,
          consultada_en: new Date(),
        });
        precios.push(precio);
        return precio;
      },
      registrarConsulta: async (exitosa, error) => {
        consultas.push(
          Object.assign(new ConsultaCotizacion(), {
            id: consultas.length + 1,
            exitosa,
            error,
            realizada_en: new Date(),
          }),
        );
      },
      historial: async () => ({ items: precios, total: precios.length }),
      consultas: async () => consultas,
      conBloqueo: async (operacion) => {
        const anterior = turno;
        let liberar!: () => void;
        turno = new Promise<void>((resolve) => {
          liberar = resolve;
        });
        await anterior;
        try {
          return await operacion(repo);
        } finally {
          liberar();
        }
      },
    };
    servicio = crear();
  });
  afterEach(() => {
    servicio.onModuleDestroy();
    jest.useRealTimers();
  });

  it('comprueba al iniciar y agrupa solicitudes simultáneas en una sola consulta', async () => {
    servicio.onApplicationBootstrap();
    const resultados = await Promise.all(
      Array.from({ length: 20 }, () => servicio.obtenerVigente()),
    );
    expect(consultar).toHaveBeenCalledTimes(1);
    expect(resultados.every((precio) => precio.id === 1)).toBe(true);
    expect(consultas).toHaveLength(1);
    await jest.advanceTimersByTimeAsync(60000);
    expect(consultar).toHaveBeenCalledTimes(1);
  });
  it('después de dormir seis horas actualiza por demanda sin necesitar los temporizadores perdidos', async () => {
    const primera = await servicio.obtenerVigente();
    jest.setSystemTime(new Date(Date.now() + 6 * 3600000));
    consultar.mockResolvedValue({
      compra: 1500,
      venta: 1600,
      actualizadaEn: new Date(),
    });
    const segunda = await servicio.obtenerVigente();
    expect(segunda.id).toBe(2);
    expect(segunda.venta).toBe('1600.000000');
    expect(primera.venta).toBe('1500.000000');
    expect(consultar).toHaveBeenCalledTimes(2);
    expect(precios).toHaveLength(2);
  });
  it('un reinicio conserva el último control en la BD y no reinicia la vigencia del precio viejo', async () => {
    await servicio.obtenerVigente();
    servicio = crear();
    await servicio.obtenerVigente();
    expect(consultar).toHaveBeenCalledTimes(1);
    jest.setSystemTime(new Date(Date.now() + 4 * 3600000));
    await servicio.obtenerVigente();
    expect(consultar).toHaveBeenCalledTimes(2);
  });
  it('registra la falla al despertar, bloquea conversiones y espera cinco minutos antes de reintentar', async () => {
    await servicio.obtenerVigente();
    jest.setSystemTime(new Date(Date.now() + 8 * 3600000));
    consultar.mockRejectedValueOnce(new Error('Tiempo de espera agotado'));
    await expect(servicio.obtenerVigente()).rejects.toThrow(
      'No hay una cotización',
    );
    await expect(servicio.obtenerVigente()).rejects.toThrow(
      'No hay una cotización',
    );
    expect(precios).toHaveLength(1);
    expect(consultar).toHaveBeenCalledTimes(2);
    expect(consultas.at(-1)).toMatchObject({
      exitosa: false,
      error: 'Tiempo de espera agotado',
    });
    jest.setSystemTime(new Date(Date.now() + 5 * 60000));
    await servicio.obtenerVigente();
    expect(precios).toHaveLength(2);
    expect(consultar).toHaveBeenCalledTimes(3);
  });
  it('dos instancias que despiertan juntas comparten el control persistente', async () => {
    const otra = crear();
    await Promise.all([servicio.obtenerVigente(), otra.obtenerVigente()]);
    expect(consultar).toHaveBeenCalledTimes(1);
    expect(precios).toHaveLength(1);
  });
  it.each([
    { compra: 0, venta: 1500 },
    { compra: 1500, venta: 1000 },
    { compra: 1400, venta: Number.NaN },
  ])('no guarda ni permite usar datos inválidos: %j', async (datos) => {
    consultar.mockResolvedValue({ ...datos, actualizadaEn: new Date() });
    await expect(servicio.obtenerVigente()).rejects.toThrow(
      'No hay una cotización',
    );
    expect(precios).toHaveLength(0);
    expect(consultas[0].exitosa).toBe(false);
  });
  it('no confunde consultar ahora con una actualización reciente de la fuente', async () => {
    consultar.mockResolvedValue({
      compra: 1400,
      venta: 1500,
      actualizadaEn: new Date(Date.now() - 97 * 3600000),
    });
    await expect(servicio.obtenerVigente()).rejects.toThrow(
      'No hay una cotización',
    );
    expect(precios).toHaveLength(0);
    consultar.mockResolvedValue({
      compra: 1400,
      venta: 1500,
      actualizadaEn: new Date(Date.now() + 3600000),
    });
    jest.setSystemTime(new Date(Date.now() + 300000));
    await expect(servicio.obtenerVigente()).rejects.toThrow(
      'No hay una cotización',
    );
    expect(precios).toHaveLength(0);
  });
  it('expone por separado historial, intentos y vigencia para administración', async () => {
    await servicio.obtenerVigente();
    const estado = await servicio.administracion(undefined, undefined, 1);
    expect(estado).toMatchObject({
      vigente: true,
      total: 1,
      por_pagina: 25,
      max_antiguedad_fuente_horas: 96,
    });
    expect(estado.proxima_revision_en!.getTime()).toBe(
      Date.now() + 3 * 3600000,
    );
  });
});
