import { ValidationPipe } from '@nestjs/common';
import { ListarPublicacionesDto } from '../src/publicaciones/dto/listar-publicaciones.dto';
import { RestablecerContraseniaDto } from '../src/auth/dto/restablecer-contrasenia.dto';
import { CatalogoDto } from '../src/catalogos/dto/catalogo.dto';
import { ActualizarFechasReservaDto } from '../src/reservas/dto/actualizar-fechas-reserva.dto';

describe('Contratos HTTP', () => {
  const pipe = new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  it.each([
    { fecha_inicio: '2100-02-30', fecha_fin: '2100-03-02' },
    { fecha_inicio: '2100-01-01T12:00:00Z', fecha_fin: '2100-01-03' },
    { fecha_inicio: '2100-01-01', fecha_fin: '2100-01-03', monto_pago: 1 },
  ])(
    'rechaza fechas inválidas y cambios de importe en la reprogramación: %j',
    async (entrada) => {
      await expect(
        pipe.transform(entrada, {
          type: 'body',
          metatype: ActualizarFechasReservaDto,
        }),
      ).rejects.toThrow();
    },
  );

  it('convierte filtros y conserva los valores predeterminados de paginación', async () => {
    const consulta = await pipe.transform(
      {
        idProvincia: '14',
        idsCiudad: '1,2',
        precioMin: '100',
        superficieMin: '50.5',
        ambientes: '1,4+',
      },
      { type: 'query', metatype: ListarPublicacionesDto },
    );
    expect(consulta).toMatchObject({
      pagina: 1,
      limite: 12,
      idProvincia: 14,
      idsCiudad: [1, 2],
      precioMin: 100,
      superficieMin: 50.5,
      ambientes: ['1', '4+'],
    });
  });

  it.each([
    { pagina: 'Infinity' },
    { pagina: '1.5' },
    { idsCiudad: '-1' },
    { idProvincia: '-1' },
    { orden: 'inexistente' },
    { superficieMin: '-1' },
    { superficieMin: 'Infinity' },
    { superficieMin: 'texto' },
  ])('rechaza filtros inválidos: %j', async (consulta) => {
    await expect(
      pipe.transform(consulta, {
        type: 'query',
        metatype: ListarPublicacionesDto,
      }),
    ).rejects.toThrow();
  });

  it('valida la contraseña nueva aunque el token exista', async () => {
    await expect(
      pipe.transform(
        { token: 'token', nuevaContrasenia: '123' },
        { type: 'body', metatype: RestablecerContraseniaDto },
      ),
    ).rejects.toThrow();
  });

  it('rechaza nombres vacíos y campos extra en catálogos', async () => {
    await expect(
      pipe.transform(
        { nombre: '   ' },
        { type: 'body', metatype: CatalogoDto },
      ),
    ).rejects.toThrow();
    await expect(
      pipe.transform(
        { nombre: 'Casa', id: 99 },
        { type: 'body', metatype: CatalogoDto },
      ),
    ).rejects.toThrow();
  });
});
