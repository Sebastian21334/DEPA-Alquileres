require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { DisputasService } = require('../dist/disputas/service/disputas.service');

test('cerrar pasa una disputa resuelta a CERRADA', async () => {
  const disputa = {
    id: 1,
    estado: 'PERDIDA',
    resuelto_por: null,
    resuelto_en: null,
    reserva: { id: 3 },
    pago: { id: 4 },
  };
  const repo = {
    buscarPorIdConBloqueo: async () => disputa,
    buscarPorId: async () => disputa,
    guardar: async (actual) => actual,
  };
  const uow = {
    ejecutar: async (operacion) => operacion({ disputas: repo }),
  };
  const service = new DisputasService(
    repo,
    {},
    {},
    {},
    uow,
  );

  const cerrada = await service.cerrar(1, 99);

  assert.equal(cerrada.estado, 'CERRADA');
});
