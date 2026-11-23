import 'reflect-metadata';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CrearPublicacionDto } from '../../../src/publicaciones/dto/crear-publicacion.dto';

describe('CP-01 · Precio de una publicación · PDF Pruebas Unitarias - TP', () => {
  test.each([
    ['PU-01', 150000, true, 'Partición válida'],
    ['PU-02', -100, false, 'Partición inválida'],
    ['PU-03', 0, false, 'Valor límite'],
    ['PU-04', 1, true, 'Valor límite'],
  ] as const)('%s · precio %s · aceptado=%s · %s', async (_id, precio, aceptado, _tecnica) => {
    // Arrange: solo cambia el precio; el resto cumple el DTO real.
    const entrada = {
      titulo: 'Departamento en el centro',
      descripcion: 'Departamento equipado',
      precio,
      direccion: 'San Martin 100',
      latitud: -32.41,
      longitud: -63.24,
      cantidad_ambientes: 2,
      superficie: 50,
      idTipoMoneda: 1,
      idModalidad: 1,
      idProvincia: 1,
      idCiudad: 1,
      idTipoPropiedad: 1,
    };
    const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });

    // Act: misma validación global usada por POST /publicaciones.
    const resultado = pipe.transform(entrada, { type: 'body', metatype: CrearPublicacionDto });

    // Assert: la entrada inválida debe fallar específicamente por precio.
    if (aceptado) {
      await expect(resultado).resolves.toEqual(entrada);
    } else {
      await expect(resultado).rejects.toBeInstanceOf(BadRequestException);
      await expect(resultado).rejects.toMatchObject({
        response: { statusCode: 400, message: ['precio must be a positive number'] },
      });
    }
  });
});
