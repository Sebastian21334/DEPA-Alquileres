import { jest } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { MailPlantilla } from '../presentation/mail-plantilla';
import type { ICorreoRepository } from '../repository/correo.repository.interface';

describe('MailService', () => {
  it('escapa datos personales y usa el primer frontend configurado', async () => {
    const enviar = jest
      .fn<ICorreoRepository['enviar']>()
      .mockResolvedValue(undefined);
    const service = new MailService(
      { enviar },
      new MailPlantilla(),
      new ConfigService({
        FRONTEND_URLS: ' https://example.test ,https://otro.test',
      }),
    );
    await service.enviarMensajeNuevo(
      'ana@example.test',
      '<Ana>',
      '<script>alert(1)</script>',
      '<Casa>',
      42,
    );
    const correo = enviar.mock.calls[0][0];
    expect(correo.html).toContain('&lt;script&gt;');
    expect(correo.html).not.toContain('<script>');
    expect(correo.html).toContain('https://example.test/publicaciones/42');
    expect(correo.html).not.toContain('https://otro.test');
  });
});
