import { jest } from '@jest/globals';
import { DolarApiAdapter } from './dolar-api.adapter';

describe('Proveedor del dólar', () => {
  afterEach(() => jest.restoreAllMocks());
  it('consulta solo la ruta fija de blue con tiempo de espera y valida la moneda', async () => {
    const consultar = jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({
        casa: 'blue',
        moneda: 'USD',
        compra: 1400,
        venta: 1500,
        fechaActualizacion: '2026-10-27T12:00:00Z',
      }),
    );
    expect(await new DolarApiAdapter().consultar()).toMatchObject({
      venta: 1500,
      actualizadaEn: new Date('2026-10-27T12:00:00Z'),
    });
    expect(consultar).toHaveBeenCalledWith(
      'https://dolarapi.com/v1/dolares/blue',
      expect.objectContaining({
        redirect: 'error',
        signal: expect.any(AbortSignal),
      }),
    );
    consultar.mockResolvedValue(
      Response.json({
        moneda: 'ARS',
        casa: 'blue',
        compra: 1,
        venta: 2,
        fechaActualizacion: '2026-10-27',
      }),
    );
    await expect(new DolarApiAdapter().consultar()).rejects.toThrow(
      'datos incompletos',
    );
  });
  it('propaga el fallo sin inventar una cotización si el servicio no responde', async () => {
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Timeout'));
    await expect(new DolarApiAdapter().consultar()).rejects.toThrow('Timeout');
  });
});
