import 'reflect-metadata';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { RegisterDto } from '../../../src/auth/dto/register.dto';

describe('CP-03 · Formato de correo electrónico · PDF Pruebas Unitarias - TP', () => {
  test.each([
    ['PU-08', 'ejemplo@gmail.com', true, 'Partición válida'],
    ['PU-09', 'ejemplo.com', false, 'Partición inválida'],
    ['PU-10', 'ejemplo@', false, 'Partición inválida'],
    ['PU-11', '', false, 'Valor límite'],
    ['PU-12', 'ejemplo@gmail', false, 'Partición inválida'],
  ] as const)('%s · correo "%s" · aceptado=%s · %s', async (_id, email, aceptado, _tecnica) => {
    // Arrange: también se satisface la contraseña heredada de ContraseniaSeguraDto.
    const entrada = {
      nombre: 'Santiago',
      apellido: 'Gomez',
      telefono: '3534000000',
      contrasenia: 'ClavePrueba2026!',
      email,
    };
    const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });

    // Act: misma validación global usada por POST /auth/register.
    const resultado = pipe.transform(entrada, { type: 'body', metatype: RegisterDto });

    // Assert: evita confundir un rechazo de otro campo con un correo inválido.
    if (aceptado) {
      await expect(resultado).resolves.toEqual(entrada);
    } else {
      await expect(resultado).rejects.toBeInstanceOf(BadRequestException);
      await expect(resultado).rejects.toMatchObject({
        response: {
          statusCode: 400,
          message: expect.arrayContaining(['email must be an email']),
        },
      });
      const error = await resultado.catch((e: BadRequestException) => e);
      const mensajes = (error as BadRequestException).getResponse() as { message: string[] };
      expect(mensajes.message.every((mensaje) => mensaje.startsWith('email '))).toBe(true);
    }
  });
});
