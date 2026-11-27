require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { plainToInstance } = require('class-transformer');
const { validate } = require('class-validator');
const { BadRequestException } = require('@nestjs/common');
const { ListarResenasAdministracionDto } = require('../dist/resenas/dto/listar-resenas-administracion.dto');
const { ESTADOS_RESENAS_ADMINISTRACION } = require('../dist/resenas/resenas.constants');
const { resenaMock, servicioMock } = require('./soporte/resenas-pruebas.cjs');

test('el DTO administrativo reutiliza los estados válidos y rechaza otros', async () => {
  const dto = (datos) => plainToInstance(ListarResenasAdministracionDto, datos);
  for (const estado of ESTADOS_RESENAS_ADMINISTRACION) {
    assert.equal((await validate(dto({ estado }))).length, 0, estado);
  }
  assert.ok((await validate(dto({ estado: 'inventado' }))).length);
  assert.equal(dto({}).estado, 'todas');
});

test('el listado administrativo traduce el estado a un filtro de persistencia', async () => {
  for (const [estado, filtro] of [
    ['visibles', { visible: true }],
    ['ocultas', { visible: false }],
    ['denunciadas', { denunciada: true }],
    ['todas', {}],
  ]) {
    const { admin, estado: capturado } = servicioMock();
    await admin.listarAdministracion({ pagina: 2, limite: 10, estado });
    assert.deepEqual(capturado.listarAdministracion, [2, 10, filtro, undefined]);
  }
});

test('el listado administrativo usa la página devuelta por el repositorio y busca por ID', async () => {
  let argumentos;
  const { admin } = servicioMock({
    repo: {
      listarAdministracion: async (...args) => {
        argumentos = args;
        return {
          datos: [resenaMock()],
          pagina: 2,
          limite: 10,
          total: 11,
          totalPaginas: 2,
        };
      },
    },
  });
  const resultado = await admin.listarAdministracion({
    pagina: 99,
    limite: 10,
    estado: 'todas',
    q: '44',
  });
  assert.deepEqual(argumentos, [99, 10, {}, 44]);
  assert.equal(resultado.pagina, 2);
  assert.equal(resultado.totalPaginas, 2);
  assert.equal(resultado.datos[0].id, 10);

  const { admin: invalido, estado } = servicioMock();
  const busqueda = await invalido.listarAdministracion({
    pagina: 1,
    limite: 10,
    estado: 'todas',
    q: 'abc',
  });
  assert.equal(busqueda.total, 0);
  assert.equal(busqueda.pagina, 1);
  assert.equal(estado.listarAdministracion, null);
});

test('moderar exige motivo, valida su tipo, audita y recalcula el promedio', async () => {
  let actual = resenaMock();
  let moderacion;
  let resumen;
  const { admin } = servicioMock({
    repo: {
      buscarPorId: async () => actual,
      registrarModeracion: async (id, datos) => {
        moderacion = { id, datos };
        actual = resenaMock({
          visible: datos.visible,
          motivo_moderacion: datos.motivo,
          fecha_moderacion: datos.fecha,
          moderador: datos.idAdministrador === null
            ? null
            : { id: datos.idAdministrador, nombre: 'Admin', apellido: 'Uno' },
        });
      },
    },
    publicaciones: {
      actualizarResumenResenas: async (...args) => {
        resumen = args;
      },
    },
  });

  await assert.rejects(
    () => admin.moderar(10, 1, { visible: false }),
    BadRequestException,
  );
  await assert.rejects(
    () => admin.moderar(10, 1, { visible: true, motivo: 123 }),
    BadRequestException,
  );

  const oculta = await admin.moderar(10, 1, {
    visible: false,
    motivo: '  Lenguaje ofensivo  ',
  });
  assert.equal(moderacion.id, 10);
  assert.deepEqual(moderacion.datos, {
    visible: false,
    motivo: 'Lenguaje ofensivo',
    idAdministrador: 1,
    fecha: moderacion.datos.fecha,
  });
  assert.ok(moderacion.datos.fecha instanceof Date);
  assert.equal(oculta.visible, false);
  assert.equal(oculta.motivo_moderacion, 'Lenguaje ofensivo');
  assert.equal(oculta.moderador.nombre, 'Admin');
  assert.deepEqual(resumen, [5, 1, 5]);

  const restaurada = await admin.moderar(10, 1, { visible: true });
  assert.equal(restaurada.visible, true);
  assert.equal(restaurada.motivo_moderacion, null);
  assert.equal(restaurada.moderador, null);
  assert.equal(moderacion.datos.idAdministrador, null);
});

/** Servicio de administración cuya reseña cambia de visibilidad al moderarla. */
function moderable(inicial, mail) {
  let actual = inicial;
  return servicioMock({
    repo: {
      buscarPorId: async () => actual,
      registrarModeracion: async (id, datos) => {
        actual = { ...actual, visible: datos.visible, motivo_moderacion: datos.motivo };
      },
    },
    ...(mail ? { mail } : {}),
  });
}

test('ocultar avisa al autor por correo una sola vez, sin repetir al volver a ocultar ni al restaurar', async () => {
  const { admin, estado } = moderable(resenaMock());
  await admin.moderar(10, 1, { visible: false, motivo: 'Lenguaje ofensivo' });
  assert.deepEqual(estado.correos, [[
    'privado@example.invalid',
    { tipo: 'PUBLICACION', id: 5, titulo: 'Depto demo' },
    'Lenguaje ofensivo',
  ]]);
  await admin.moderar(10, 1, { visible: false, motivo: 'Otro motivo' });
  await admin.moderar(10, 1, { visible: true });
  assert.equal(estado.correos.length, 1);

  // Una cuenta dada de baja no tiene correo vigente: no se intenta el envío.
  const { admin: sinCorreo, estado: estadoSinCorreo } = moderable(resenaMock({ autor: { id: 3, nombre: 'Ana', apellido: 'Paz', email: null } }));
  await sinCorreo.moderar(10, 1, { visible: false, motivo: 'Lenguaje ofensivo' });
  assert.equal(estadoSinCorreo.correos, undefined);
});

test('si el correo al autor falla, la reseña igual queda oculta', async () => {
  const { admin } = moderable(resenaMock(), {
    enviarResenaOcultada: async () => {
      throw new Error('Azure no respondió');
    },
  });
  const oculta = await admin.moderar(10, 1, { visible: false, motivo: 'Lenguaje ofensivo' });
  assert.equal(oculta.visible, false);
  assert.equal(oculta.motivo_moderacion, 'Lenguaje ofensivo');
});

test('quitar denuncia limpia la auditoría y conserva la visibilidad', async () => {
  let actual = resenaMock({
    denunciada: true,
    motivo_denuncia: 'Prueba',
    fecha_denuncia: new Date('2026-11-20T12:00:00.000Z'),
    visible: false,
  });
  const { admin } = servicioMock({
    repo: {
      buscarPorId: async () => actual,
      quitarDenuncia: async () => {
        actual = resenaMock({
          ...actual,
          denunciada: false,
          motivo_denuncia: null,
          fecha_denuncia: null,
        });
      },
    },
  });
  const resultado = await admin.quitarDenuncia(10);
  assert.equal(resultado.denunciada, false);
  assert.equal(resultado.motivo_denuncia, null);
  assert.equal(resultado.fecha_denuncia, null);
  assert.equal(resultado.visible, false);
});
