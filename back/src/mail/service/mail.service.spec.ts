import { jest } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { MailPlantilla } from '../presentation/mail-plantilla';
import type { ICorreoRepository } from '../repository/correo.repository.interface';

describe('MailService', () => {
  it('avisa al anunciante con fechas anteriores y nuevas, total conservado y datos escapados', async () => {
    const enviar = jest
      .fn<ICorreoRepository['enviar']>()
      .mockResolvedValue(undefined);
    const service = new MailService(
      { enviar },
      new MailPlantilla(),
      new ConfigService({ FRONTEND_URLS: 'https://example.test' }),
    );
    await service.enviarReprogramacionReserva('dueno@example.test', {
      idReserva: 37,
      nombreAnunciante: '<Ana>',
      nombreInquilino: '<script>Juan</script>',
      titulo: '<Casa>',
      inicioAnterior: '2100-01-01',
      finAnterior: '2100-01-02',
      inicioNuevo: '2100-01-04',
      finNuevo: '2100-01-05',
      cantidadDias: 2,
      monto: 200,
      moneda: 'ARS',
    });
    const correo = enviar.mock.calls[0][0];
    expect(correo.destinatario).toBe('dueno@example.test');
    expect(correo.asunto).toContain('Cambio de fechas');
    expect(correo.html).toContain('1 de enero de 2100');
    expect(correo.html).toContain('4 de enero de 2100');
    expect(correo.html).toContain('200,00');
    expect(correo.html).toContain('no genera cobros ni devoluciones');
    expect(correo.html).toContain('&lt;script&gt;Juan&lt;/script&gt;');
    expect(correo.html).not.toContain('<script>');
    expect(correo.html).toContain(
      'https://example.test/reserva/resultado?reserva_id=37',
    );
  });
  it('notifica la baja con el título, motivo escapado y enlace a Mis publicaciones', async () => {
    const enviar = jest
      .fn<ICorreoRepository['enviar']>()
      .mockResolvedValue(undefined);
    const service = new MailService(
      { enviar },
      new MailPlantilla(),
      new ConfigService({ FRONTEND_URLS: 'https://example.test' }),
    );
    await service.enviarBajaPublicacion(
      'dueno@gmail.com',
      '<Casa>',
      '<script>Motivo</script>',
    );
    const correo = enviar.mock.calls[0][0];
    expect(correo.destinatario).toBe('dueno@gmail.com');
    expect(correo.html).toContain('&lt;Casa&gt;');
    expect(correo.html).toContain('&lt;script&gt;Motivo&lt;/script&gt;');
    expect(correo.html).not.toContain('<script>');
    expect(correo.html).toContain('https://example.test/mis-publicaciones');
  });
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
