import { jest } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { AzureCorreoRepository } from './azure-correo.repository';
import type { ClienteCorreo } from './cliente-correo.interface';

describe('AzureCorreoRepository', () => {
  const correo = {
    destinatario: 'ana@example.test',
    asunto: 'Reserva confirmada',
    html: '<p>Confirmada</p>',
  };
  const config = new ConfigService({
    ACS_SENDER_ADDRESS: 'noreply@example.test',
  });

  it('reintenta cuando Azure devuelve Failed y acepta el segundo envío exitoso', async () => {
    const beginSend = jest
      .fn<ClienteCorreo['beginSend']>()
      .mockResolvedValueOnce({
        pollUntilDone: async () => ({
          status: 'Failed',
          error: { code: 'ServiceUnavailable', message: 'Error temporal' },
        }),
      })
      .mockResolvedValueOnce({
        pollUntilDone: async () => ({ status: 'Succeeded' }),
      });
    const repository = new AzureCorreoRepository(config, { beginSend });

    await expect(repository.enviar(correo)).resolves.toBeUndefined();
    expect(beginSend).toHaveBeenCalledTimes(2);
  });

  it('informa el error cuando Azure rechaza ambos intentos', async () => {
    const beginSend = jest.fn<ClienteCorreo['beginSend']>().mockResolvedValue({
      pollUntilDone: async () => ({
        status: 'Failed',
        error: { code: 'InvalidRecipient', message: 'Destinatario rechazado' },
      }),
    });
    const repository = new AzureCorreoRepository(config, { beginSend });

    await expect(repository.enviar(correo)).rejects.toThrow(
      'InvalidRecipient: Destinatario rechazado',
    );
    expect(beginSend).toHaveBeenCalledTimes(2);
  });
});
