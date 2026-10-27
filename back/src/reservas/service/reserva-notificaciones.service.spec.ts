import { jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { ReservaNotificacionesService } from './reserva-notificaciones.service';
import { RESERVA_REPOSITORY } from '../repository/reserva.repository.interface';
import { MAIL_SERVICE } from '../../mail/mail.interface';
import { Reserva } from '../entity/reserva.entity';
import { Publicacion } from '../../publicaciones/entity/publicacion.entity';
import { Anunciante } from '../../anunciantes/entity/anunciante.entity';
import { Usuario } from '../../usuarios/entity/usuario.entity';
import type { IReservaRepository } from '../repository/reserva.repository.interface';
import { TRANSACCION_CALENDARIO } from '../../disponibilidad/repository/transaccion-calendario.interface';

describe('ReservaNotificacionesService', () => {
  it('reintenta solo el correo fallido y conserva la confirmación exitosa', async () => {
    const reserva = Object.assign(new Reserva(), {
      id: 42,
      fecha_inicio: new Date('2026-10-10'),
      fecha_fin: new Date('2026-10-12'),
      usuario_email: 'inquilino@example.test',
      usuario_nombre: 'Ana',
      usuario_apellido: 'Pérez',
      monto_pago: 1000,
      moneda_contratada: 'USD',
      publicacion: Object.assign(new Publicacion(), {
        titulo: 'Departamento',
        anunciante: Object.assign(new Anunciante(), {
          usuario: Object.assign(new Usuario(), {
            email: 'anunciante@example.test',
            nombre: 'Juan',
            apellido: 'Pérez',
          }),
        }),
      }),
    });
    const registrarNotificaciones = jest
      .fn<IReservaRepository['registrarNotificaciones']>()
      .mockResolvedValue(undefined);
    const enviarReservaConfirmada = jest
      .fn<() => Promise<void>>()
      .mockResolvedValue(undefined);
    const enviarNuevaReserva = jest
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error('Error temporal'))
      .mockResolvedValue(undefined);
    const module = await Test.createTestingModule({
      providers: [
        ReservaNotificacionesService,
        { provide: TRANSACCION_CALENDARIO, useValue: {} },
        { provide: RESERVA_REPOSITORY, useValue: { registrarNotificaciones } },
        {
          provide: MAIL_SERVICE,
          useValue: { enviarReservaConfirmada, enviarNuevaReserva },
        },
      ],
    }).compile();
    const service = module.get(ReservaNotificacionesService);

    await expect(service.enviarConfirmacion(reserva)).rejects.toThrow(
      'quedó una notificación',
    );
    expect(reserva.email_confirmacion_inquilino_enviado).toBe(true);
    expect(reserva.email_nueva_reserva_anunciante_enviado).toBeFalsy();
    await expect(service.enviarConfirmacion(reserva)).resolves.toBeUndefined();
    expect(enviarReservaConfirmada).toHaveBeenCalledTimes(1);
    expect(enviarNuevaReserva).toHaveBeenCalledTimes(2);
    expect(enviarNuevaReserva).toHaveBeenLastCalledWith(
      'anunciante@example.test',
      expect.objectContaining({ moneda: 'USD' }),
    );
    expect(reserva.email_nueva_reserva_anunciante_enviado).toBe(true);
    expect(registrarNotificaciones).toHaveBeenLastCalledWith(42, {
      email_confirmacion_inquilino_enviado: true,
      email_nueva_reserva_anunciante_enviado: true,
    });
  });
});
