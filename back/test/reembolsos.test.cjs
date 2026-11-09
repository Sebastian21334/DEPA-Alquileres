require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  ReembolsosService,
} = require('../dist/reembolsos/service/reembolsos.service');

function uow(repo, pagos) {
  return {
    ejecutar: async (operacion) => operacion({ reembolsos: repo, pagos }),
  };
}

test('confirmar aprueba y actualiza el pago en la misma transacción', async () => {
  const reembolso = {
    id: 5,
    importe: 50,
    estado: 'PENDIENTE',
    origen: 'CANCELACION',
    idempotency_key: 'clave',
    pago: { id: 10 },
    reserva: { id: 3 },
  };
  const pago = {
    id: 10,
    amount: 100,
    amount_refunded: 0,
    status: 'approved',
    currency: 'ARS',
  };
  const repo = {
    buscarPorId: async () => reembolso,
    buscarPorIdConBloqueo: async () => reembolso,
    buscarPagoId: async () => 10,
    guardar: async (actual) => actual,
  };
  const pagosRepo = {
    buscarPorIdConBloqueo: async () => pago,
    guardar: async (actual) => actual,
  };
  const service = new ReembolsosService(
    repo,
    {},
    { get: () => 'false' },
    { saldoReembolsable: () => 100 },
    uow(repo, pagosRepo),
  );

  const resultado = await service.registrarManual(5, 'transferencia-1', 7);

  assert.equal(resultado.estado, 'APROBADO');
  assert.equal(resultado.referencia_externa, 'transferencia-1');
  assert.equal(pago.amount_refunded, 50);
  assert.equal(pago.status, 'approved');
});

test('crearSolicitud reutiliza la clave idempotente y no duplica', async () => {
  const existente = { id: 9, estado: 'PENDIENTE' };
  let creados = 0;
  const repo = {
    buscarPorIdempotencyKey: async () => existente,
    crear: () => {
      creados += 1;
      return {};
    },
  };
  const service = new ReembolsosService(
    repo,
    {},
    { get: () => 'false' },
    {},
    uow(repo, {}),
  );

  const resultado = await service.crearSolicitud({
    reserva: {},
    pago: { id: 1 },
    tipo: 'TOTAL',
    origen: 'CANCELACION',
    importe: 10,
    motivo: 'Prueba',
    idSolicitadoPor: null,
    idempotencyKey: 'cancelacion:1',
  });

  assert.equal(resultado, existente);
  assert.equal(creados, 0);
});

test('fallar no degrada un reembolso ya aprobado', async () => {
  const reembolso = { id: 1, estado: 'APROBADO' };
  const repo = {
    actualizarEnTransaccion: async (_id, operacion) => {
      operacion(reembolso);
      return reembolso;
    },
  };
  const service = new ReembolsosService(
    repo,
    {},
    { get: () => 'false' },
    {},
    uow(repo, {}),
  );

  await service.fallar(1, new Error('fallo posterior a la aprobación'));

  assert.equal(reembolso.estado, 'APROBADO');
});

test('crearSolicitud devuelve el reembolso ganador si choca la clave única', async () => {
  const existente = { id: 9, estado: 'PENDIENTE' };
  let consultas = 0;
  const repo = {
    buscarPorIdempotencyKey: async () => {
      consultas += 1;
      return consultas === 1 ? null : existente;
    },
    sumarImportesReservados: async () => 0,
    crear: (datos) => datos,
    guardar: async () => {
      throw new Error('duplicado');
    },
  };
  const pago = {
    id: 10,
    amount: 100,
    amount_refunded: 0,
    currency: 'ARS',
  };
  const pagosRepo = {
    buscarPorIdConBloqueo: async () => pago,
  };
  const service = new ReembolsosService(
    repo,
    {},
    { get: () => 'false' },
    { saldoReembolsable: () => 100 },
    uow(repo, pagosRepo),
  );

  const resultado = await service.crearSolicitud({
    reserva: {},
    pago: { id: 10 },
    tipo: 'TOTAL',
    origen: 'CANCELACION',
    importe: 100,
    motivo: 'Prueba',
    idSolicitadoPor: null,
    idempotencyKey: 'blq:7:1',
  });

  assert.equal(resultado, existente);
  assert.equal(consultas, 2);
});

test('crearSolicitud rechaza el sobre-reembolso dentro de la transacción', async () => {
  let creados = 0;
  const repo = {
    buscarPorIdempotencyKey: async () => null,
    sumarImportesReservados: async () => 0,
    crear: () => {
      creados += 1;
      return {};
    },
  };
  const pago = {
    id: 10,
    amount: 100,
    amount_refunded: 90,
    currency: 'ARS',
  };
  const service = new ReembolsosService(
    repo,
    {},
    { get: () => 'false' },
    { saldoReembolsable: () => 10 },
    uow(repo, { buscarPorIdConBloqueo: async () => pago }),
  );

  await assert.rejects(
    () =>
      service.crearSolicitud({
        reserva: {},
        pago: { id: 10 },
        tipo: 'PARCIAL',
        origen: 'CANCELACION',
        importe: 20,
        motivo: 'Prueba',
        idSolicitadoPor: null,
        idempotencyKey: 'blq:7:1:c1',
      }),
    /saldo reembolsable/,
  );
  assert.equal(creados, 0);
});

test('confirmar no permite aprobar manualmente un reembolso EN_PROCESO', async () => {
  const reembolso = {
    id: 5,
    estado: 'EN_PROCESO',
    importe: 50,
    origen: 'CANCELACION',
  };
  let pagoGuardado = 0;
  const repo = {
    buscarPagoId: async () => 10,
    buscarPorIdConBloqueo: async () => reembolso,
    guardar: async (actual) => actual,
  };
  const pagosRepo = {
    buscarPorIdConBloqueo: async () => ({
      id: 10,
      amount: 100,
      amount_refunded: 0,
      currency: 'ARS',
    }),
    guardar: async (actual) => {
      pagoGuardado += 1;
      return actual;
    },
  };
  const service = new ReembolsosService(
    repo,
    {},
    { get: () => 'false' },
    { saldoReembolsable: () => 100 },
    uow(repo, pagosRepo),
  );

  await assert.rejects(
    () =>
      service.confirmar(5, {
        referencia: 'manual',
        idActor: 1,
        idExterno: null,
      }),
    /en proceso/,
  );
  assert.equal(pagoGuardado, 0);
});

test('ejecutar valida el saldo con lock antes de llamar a Mercado Pago', async () => {
  const reembolso = {
    id: 5,
    estado: 'PENDIENTE',
    importe: 30,
    origen: 'CANCELACION',
    idempotency_key: 'clave',
    moneda: 'ARS',
    pago: { id: 10, payment_id: 'mp-1' },
  };
  const pago = {
    id: 10,
    amount: 100,
    amount_refunded: 90,
    currency: 'ARS',
  };
  let llamadasMp = 0;
  const repo = {
    buscarPorId: async () => reembolso,
    buscarPagoId: async () => 10,
    buscarPorIdConBloqueo: async () => reembolso,
    sumarImportesReservados: async () => 0,
    guardar: async (actual) => actual,
  };
  const pasarela = {
    reembolsar: async () => {
      llamadasMp += 1;
      return { id: 'r-1', status: 'approved' };
    },
    consultarReembolso: async () => ({}),
  };
  const service = new ReembolsosService(
    repo,
    pasarela,
    { get: () => 'true' },
    { saldoReembolsable: () => 10 },
    uow(repo, { buscarPorIdConBloqueo: async () => pago }),
  );

  await assert.rejects(() => service.ejecutar(5, 1), /saldo disponible/);
  assert.equal(llamadasMp, 0);
});

test('ejecutar reintenta un FALLIDO excluyendo su propio importe del saldo', async () => {
  const reembolso = {
    id: 5,
    estado: 'FALLIDO',
    importe: 30,
    origen: 'CANCELACION',
    idempotency_key: 'clave',
    moneda: 'ARS',
    pago: { id: 10, payment_id: 'mp-1' },
  };
  const pago = {
    id: 10,
    amount: 100,
    amount_refunded: 0,
    currency: 'ARS',
  };
  let argumentosReserva = null;
  const repo = {
    buscarPorId: async () => reembolso,
    buscarPagoId: async () => 10,
    buscarPorIdConBloqueo: async () => reembolso,
    sumarImportesReservados: async (...args) => {
      argumentosReserva = args;
      return 0;
    },
    guardar: async (actual) => actual,
    actualizarEnTransaccion: async (_id, operacion) => {
      operacion(reembolso);
      return reembolso;
    },
  };
  const pasarela = {
    reembolsar: async () => {
      throw new Error('Mercado Pago caído');
    },
    consultarReembolso: async () => ({}),
  };
  const service = new ReembolsosService(
    repo,
    pasarela,
    { get: () => 'true' },
    { saldoReembolsable: () => 100 },
    uow(repo, { buscarPorIdConBloqueo: async () => pago }),
  );

  await assert.rejects(() => service.ejecutar(5, 1), /Mercado Pago caído/);
  assert.deepEqual(argumentosReserva, [10, 5]);
  assert.equal(reembolso.estado, 'FALLIDO');
});

test('ejecutar aprueba una devolución con Mercado Pago y actualiza el pago', async () => {
  const reembolso = {
    id: 5,
    estado: 'PENDIENTE',
    importe: 30,
    origen: 'CANCELACION',
    idempotency_key: 'clave',
    moneda: 'ARS',
    pago: { id: 10, payment_id: 'mp-1' },
  };
  const pago = {
    id: 10,
    amount: 100,
    amount_refunded: 0,
    status: 'approved',
    currency: 'ARS',
  };
  let llamadasMp = 0;
  const repo = {
    buscarPorId: async () => reembolso,
    buscarPagoId: async () => 10,
    buscarPorIdConBloqueo: async () => reembolso,
    sumarImportesReservados: async () => 0,
    guardar: async (actual) => actual,
    actualizarEnTransaccion: async (_id, operacion) => {
      operacion(reembolso);
      return reembolso;
    },
  };
  const pasarela = {
    reembolsar: async () => {
      llamadasMp += 1;
      return { id: 'r-1', status: 'approved', amount: 30, currency_id: 'ARS' };
    },
    consultarReembolso: async () => ({}),
  };
  const service = new ReembolsosService(
    repo,
    pasarela,
    { get: () => 'true' },
    { saldoReembolsable: () => 100 },
    uow(repo, { buscarPorIdConBloqueo: async () => pago, guardar: async (p) => p }),
  );

  const resultado = await service.ejecutar(5, 1);

  assert.equal(llamadasMp, 1);
  assert.equal(resultado.estado, 'APROBADO');
  assert.equal(resultado.id_externo, 'r-1');
  assert.equal(pago.amount_refunded, 30);
  assert.equal(pago.status, 'approved');
});

test('confirmar una devolución total deja el pago como reembolsado', async () => {
  const reembolso = {
    id: 6,
    importe: 100,
    estado: 'PENDIENTE',
    origen: 'CANCELACION',
  };
  const pago = {
    id: 10,
    amount: 100,
    amount_refunded: 0,
    status: 'approved',
    currency: 'ARS',
  };
  const repo = {
    buscarPagoId: async () => 10,
    buscarPorIdConBloqueo: async () => reembolso,
    guardar: async (actual) => actual,
  };
  const service = new ReembolsosService(
    repo,
    {},
    { get: () => 'false' },
    { saldoReembolsable: () => 100 },
    uow(repo, { buscarPorIdConBloqueo: async () => pago, guardar: async (p) => p }),
  );

  await service.registrarManual(6, 'transferencia-total', 1);

  assert.equal(reembolso.estado, 'APROBADO');
  assert.equal(pago.amount_refunded, 100);
  assert.equal(pago.status, 'refunded');
  assert.ok(pago.refunded_at);
});

test('rechazar y ejecutar respetan los estados terminales', async () => {
  const aprobado = { id: 1, estado: 'APROBADO' };
  const repoAprobado = {
    actualizarEnTransaccion: async (_id, operacion) => {
      operacion(aprobado);
      return aprobado;
    },
  };
  const serviceAprobado = new ReembolsosService(
    repoAprobado,
    {},
    { get: () => 'false' },
    {},
    uow(repoAprobado, {}),
  );
  await assert.rejects(
    () => serviceAprobado.rechazar(1, 'No corresponde', 1),
    /aprobado/,
  );

  const rechazado = {
    id: 2,
    estado: 'RECHAZADO',
    importe: 10,
    pago: { payment_id: 'mp-2' },
  };
  const repoRechazado = { buscarPorId: async () => rechazado };
  const serviceRechazado = new ReembolsosService(
    repoRechazado,
    {},
    { get: () => 'true' },
    {},
    uow(repoRechazado, {}),
  );
  await assert.rejects(
    () => serviceRechazado.ejecutar(2, 1),
    /estado ejecutable/,
  );
});

test('ejecutar respeta MP_REFUNDS_ENABLED=false', async () => {
  const reembolso = {
    id: 7,
    estado: 'PENDIENTE',
    importe: 30,
    pago: { payment_id: 'mp-7' },
  };
  const service = new ReembolsosService(
    { buscarPorId: async () => reembolso },
    {},
    { get: () => 'false' },
    {},
    uow({}, {}),
  );

  await assert.rejects(
    () => service.ejecutar(7, 1),
    /ejecución automática está deshabilitada/,
  );
});
