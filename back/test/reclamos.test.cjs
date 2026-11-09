require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ReclamosService } = require('../dist/reclamos/service/reclamos.service');

function reclamoConMensajes() {
  return {
    id: 1,
    estado: 'ABIERTO',
    inquilino: { id: 7 },
    anunciante: { id: 8 },
    reserva: { id: 3 },
    mensajes: [
      { id: 1, texto: 'visible', visible_para: 'TODOS' },
      { id: 2, texto: 'interna', visible_para: 'ADMIN' },
    ],
  };
}

function servicio(reclamo) {
  const copia = () => ({
    ...reclamo,
    mensajes: reclamo.mensajes.map((mensaje) => ({ ...mensaje })),
  });
  const repo = {
    buscarPorUsuario: async () => [copia()],
    buscarPorId: async () => copia(),
  };
  return new ReclamosService(repo, {}, {}, {}, {}, {});
}

test('listarMios oculta las notas internas del Administrador', async () => {
  const service = servicio(reclamoConMensajes());
  const [reclamo] = await service.listarMios(7);
  assert.deepEqual(
    reclamo.mensajes.map((mensaje) => mensaje.texto),
    ['visible'],
  );
});

test('obtener oculta notas internas para el inquilino y las conserva para el Administrador', async () => {
  const service = servicio(reclamoConMensajes());
  const delInquilino = await service.obtener(1, 7, false);
  assert.deepEqual(
    delInquilino.mensajes.map((mensaje) => mensaje.texto),
    ['visible'],
  );

  const delAdmin = await service.obtener(1, 99, true);
  assert.deepEqual(
    delAdmin.mensajes.map((mensaje) => mensaje.texto),
    ['visible', 'interna'],
  );
});
