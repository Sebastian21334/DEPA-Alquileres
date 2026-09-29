import { jest } from '@jest/globals';
import { MailService } from './mail.service';
import type { ReservaEmailDetalle } from './mail.interface';

describe('MailService', () => {
  const variablesOriginales = {
    connectionString: process.env.ACS_CONNECTION_STRING,
    sender: process.env.ACS_SENDER_ADDRESS,
    frontendUrls: process.env.FRONTEND_URLS,
  };

  const detalle: ReservaEmailDetalle = {
    idReserva: 42,
    nombreDestinatario: 'Ana Pérez',
    titulo: 'Departamento céntrico',
    direccion: 'Córdoba 123, Rosario',
    fechaInicio: new Date('2026-10-10T12:00:00Z'),
    fechaFin: new Date('2026-10-12T12:00:00Z'),
    cantidadDias: 3,
    monto: 150000,
    moneda: 'ARS',
    nombreContraparte: 'Juan Gómez',
  };

  beforeEach(() => {
    process.env.ACS_CONNECTION_STRING =
      'endpoint=https://example.test/;accesskey=test';
    process.env.ACS_SENDER_ADDRESS = 'noreply@example.test';
    process.env.FRONTEND_URLS = 'https://depa.example.test';
  });

  afterAll(() => {
    restaurarVariable(
      'ACS_CONNECTION_STRING',
      variablesOriginales.connectionString,
    );
    restaurarVariable('ACS_SENDER_ADDRESS', variablesOriginales.sender);
    restaurarVariable('FRONTEND_URLS', variablesOriginales.frontendUrls);
  });

  it('reintenta cuando Azure devuelve Failed y acepta el segundo envío exitoso', async () => {
    const beginSend = jest
      .fn()
      .mockResolvedValueOnce({
        pollUntilDone: jest.fn().mockResolvedValue({
          id: 'fallido',
          status: 'Failed',
          error: { code: 'ServiceUnavailable', message: 'Error temporal' },
        }),
      })
      .mockResolvedValueOnce({
        pollUntilDone: jest
          .fn()
          .mockResolvedValue({ id: 'enviado', status: 'Succeeded' }),
      });
    const service = new MailService();
    (service as unknown as { client: { beginSend: typeof beginSend } }).client =
      { beginSend };

    await expect(
      service.enviarReservaConfirmada('ana@example.test', detalle),
    ).resolves.toBeUndefined();
    expect(beginSend).toHaveBeenCalledTimes(2);
  });

  it('informa el error cuando Azure rechaza ambos intentos', async () => {
    const beginSend = jest.fn().mockResolvedValue({
      pollUntilDone: jest.fn().mockResolvedValue({
        id: 'fallido',
        status: 'Failed',
        error: { code: 'InvalidRecipient', message: 'Destinatario rechazado' },
      }),
    });
    const service = new MailService();
    (service as unknown as { client: { beginSend: typeof beginSend } }).client =
      { beginSend };

    await expect(
      service.enviarReservaConfirmada('ana@example.test', detalle),
    ).rejects.toThrow('InvalidRecipient: Destinatario rechazado');
    expect(beginSend).toHaveBeenCalledTimes(2);
  });
});

function restaurarVariable(nombre: string, valor: string | undefined): void {
  if (valor === undefined) delete process.env[nombre];
  else process.env[nombre] = valor;
}
