import { JwtService } from '@nestjs/jwt';
import { UnprocessableEntityException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { VerificacionFacialService } from './verificacion-facial.service';
import type { IAnalisisFacialRepository } from '../repository/analisis-facial.repository.interface';
import type { ArchivoSubido } from '../../common/interfaces/archivo-subido.interface';

describe('VerificacionFacialService', () => {
  const jwt = new JwtService({ secret: 'secreto-de-pruebas' });
  const analisis: IAnalisisFacialRepository = {
    analizarRostro: async () => ({
      descriptor: new Float32Array([0]),
      yaw: 0,
      roll: 0,
      aperturaBoca: 0,
    }),
    distancia: () => 0,
  };
  const service = new VerificacionFacialService(jwt, analisis);

  it('firma tres acciones distintas ligadas al usuario', async () => {
    const desafio = await service.crearDesafio(7);
    const payload = await jwt.verifyAsync(desafio.challengeToken);
    expect(payload).toMatchObject({ sub: 7, scope: 'face-liveness-challenge' });
    expect(new Set(desafio.instructions.map((i) => i.type)).size).toBe(3);
    expect(desafio.expiresInSeconds).toBe(600);
  });

  it('emite un desafío nuevo si el anterior venció', async () => {
    const vencido = await jwt.signAsync(
      {
        sub: 7,
        scope: 'face-liveness-challenge',
        actions: ['TURN_LEFT', 'TURN_RIGHT', 'TILT_HEAD'],
        jti: 'desafio-vencido',
      },
      { expiresIn: -1 },
    );

    const nuevo = await service.cambiarDesafio(7, vencido);
    const payload = await jwt.verifyAsync(nuevo.challengeToken);
    expect(payload).toMatchObject({ sub: 7, scope: 'face-liveness-challenge' });
    expect(nuevo.instructions).toHaveLength(3);
    expect(nuevo.expiresInSeconds).toBe(600);
  });

  it('rechaza desafíos de otro usuario y evidencias ausentes', async () => {
    const desafio = await service.crearDesafio(7);
    await expect(
      service.cambiarDesafio(99, desafio.challengeToken),
    ).rejects.toThrow('inválida o venció');
    await expect(
      service.validarVitalidad(7, desafio.challengeToken),
    ).rejects.toThrow('Faltan capturas');
  });

  it('acepta una acción si al menos una de las dos capturas valida', async () => {
    const analisisBurst: IAnalisisFacialRepository = {
      analizarRostro: async (_buffer, nombre) => {
        if (nombre.includes('neutral') || nombre.includes('final')) {
          return {
            descriptor: new Float32Array([1]),
            yaw: 0,
            roll: 0,
            aperturaBoca: 0,
          };
        }
        if (nombre.includes('captura 1')) {
          throw new UnprocessableEntityException(
            'No se detectó una cara en la primera captura',
          );
        }
        const accion = nombre.match(/\(([A-Z_]+)\)/)?.[1];
        return {
          descriptor: new Float32Array([1]),
          yaw:
            accion === 'TURN_LEFT' ? 0.1 : accion === 'TURN_RIGHT' ? -0.1 : 0,
          roll: accion === 'TILT_HEAD' ? 0.2 : 0,
          aperturaBoca: accion === 'OPEN_MOUTH' ? 0.2 : 0,
        };
      },
      distancia: () => 0,
    };
    const serviceBurst = new VerificacionFacialService(jwt, analisisBurst);
    const desafio = await serviceBurst.crearDesafio(7);
    const foto = (nombre: string): ArchivoSubido => ({
      buffer: Buffer.from(nombre),
      originalname: `${nombre}.jpg`,
      mimetype: 'image/jpeg',
      size: nombre.length,
    });
    const archivos = {
      neutralPhoto: [foto('neutral')],
      action0: [foto('accion-0-1'), foto('accion-0-2')],
      action1: [foto('accion-1-1'), foto('accion-1-2')],
      action2: [foto('accion-2-1'), foto('accion-2-2')],
      livePhoto: [foto('live')],
    };

    await expect(
      serviceBurst.validarVitalidad(7, desafio.challengeToken, archivos),
    ).resolves.toMatchObject({ valid: true });
  });

  it('acepta solo la imagen vinculada a la autorización facial', async () => {
    const captura = Buffer.from('captura-validada');
    const token = await jwt.signAsync({
      sub: 7,
      scope: 'face-liveness-verified',
      livePhotoHash: createHash('sha256').update(captura).digest('hex'),
    });
    await expect(
      service.verificarCapturaAutorizada(7, token, captura),
    ).resolves.toBeUndefined();
    await expect(
      service.verificarCapturaAutorizada(7, token, Buffer.from('otra-imagen')),
    ).rejects.toThrow('no es la captura validada');
  });
});
