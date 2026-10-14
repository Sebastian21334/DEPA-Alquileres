import { JwtService } from '@nestjs/jwt';
import { createHash } from 'node:crypto';
import { VerificacionFacialService } from './verificacion-facial.service';
import type { IAnalisisFacialRepository } from '../repository/analisis-facial.repository.interface';

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
    expect(desafio.expiresInSeconds).toBe(300);
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
