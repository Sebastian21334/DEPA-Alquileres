const { catalogosDePrueba, decisionDePrueba } = require('./soporte/catalogos-pruebas.cjs');
require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ReservaCicloVidaService } = require('../dist/reservas/service/reserva-ciclo-vida.service');
const decision = decisionDePrueba();
const ciclo = new ReservaCicloVidaService(decision, catalogosDePrueba());
const { ReservaLiquidacionesService } = require('../dist/reservas/service/reserva-liquidaciones.service');

function crearReserva(extra = {}) {
  return {
    id: 1,
    fecha_inicio: '2099-01-01',
    monto_pago: 100,
    estado_pago: 'APROBADO',
    estado_liquidacion: 'RETENIDO',
    cancelada: false,
    finalizada: false,
    codigo_validado_en: null,
    ...extra,
  };
}

function reservasService() {
  return {
    pagoAprobado: (r) => r.estado_pago === 'APROBADO',
    codigoValidado: (r) => !!r.codigo_validado_en,
    liquidacionEnRevision: (r) => r.estado_liquidacion === 'EN_REVISION',
    liquidacionResuelta: (r) => ['PAGADO_PROPIETARIO', 'DEVUELTO_INQUILINO', 'DEVUELTO_PARCIAL_INQUILINO'].includes(r.estado_liquidacion),
    marcarCancelada: (r, actor) => { r.cancelada = true; r.cancelada_por = actor; },
    prepararRespuesta: (r) => r,
  };
}

function repositorio(reserva, sobreescribir = {}) {
  const repo = {
    buscarPorId: async () => reserva,
    guardar: async (actual) => actual,
    conTransaccion: async (operacion) => operacion(repo, {}),
    ...sobreescribir,
  };
  return repo;
}

function liquidacionesService() {
  return {
    asegurarParaReserva: async (reserva) => {
      reserva.liquidacion ??= { reserva };
      return reserva.liquidacion;
    },
    registrarResolucion: async (reserva, estado, datos) => {
      reserva.estado_liquidacion = estado;
      reserva.referencia_liquidacion = datos.referencia?.trim() || null;
      reserva.observacion_liquidacion =
        datos.observacion?.trim() || reserva.observacion_liquidacion;
      reserva.fecha_resolucion_liquidacion = [
        'PAGADO_PROPIETARIO',
        'DEVUELTO_INQUILINO',
        'DEVUELTO_PARCIAL_INQUILINO',
      ].includes(estado)
        ? new Date()
        : null;
      return reserva.liquidacion;
    },
    registrarRevision: async (reserva, motivo) => {
      reserva.estado_liquidacion = 'EN_REVISION';
      reserva.observacion_liquidacion = motivo.trim();
      reserva.fecha_resolucion_liquidacion = null;
      return reserva.liquidacion;
    },
    registrarRetencion: async (reserva) => reserva.liquidacion,
    registrarValidacionCodigo: async (reserva) => reserva.liquidacion,
  };
}

test('DEVUELTO_INQUILINO devuelve el saldo completo aunque el DTO traiga otro importe', async () => {
  const reserva = crearReserva();
  const pago = { id: 10, amount: 100, amount_refunded: 0, currency: 'ARS' };
  let solicitudCreada = null;
  let referenciaEjecutada = null;
  const reembolsos = {
    ejecucionAutomaticaHabilitada: true,
    buscarPagoPorReserva: async () => pago,
    listarPorReserva: async () => [],
    saldoReembolsable: () => 100,
    crearSolicitud: async (datos) => {
      solicitudCreada = datos;
      return { id: 1, estado: 'PENDIENTE', importe: datos.importe };
    },
    registrarOejecutar: async (_id, referencia) => {
      referenciaEjecutada = referencia;
      return { id: 1, estado: 'APROBADO' };
    },
  };
  const service = new ReservaLiquidacionesService(
    repositorio(reserva),
    { liberarReserva: async () => {} },
    reembolsos,
    reservasService(),
    liquidacionesService(), ciclo, decision, catalogosDePrueba(),
  );

  await service.resolverLiquidacion(1, { estado: 'DEVUELTO_INQUILINO', importe: 1 }, 7);

  assert.equal(solicitudCreada.importe, 100);
  assert.equal(solicitudCreada.tipo, 'TOTAL');
  assert.equal(solicitudCreada.idempotencyKey, 'liq:1:t:10000');
  assert.equal(referenciaEjecutada, undefined);
});

test('no resuelve la reserva si la devolución quedó EN_PROCESO', async () => {
  const reserva = crearReserva();
  let guardados = 0;
  let ejecuciones = 0;
  const reembolsos = {
    ejecucionAutomaticaHabilitada: true,
    buscarPagoPorReserva: async () => ({ id: 10, amount: 100, amount_refunded: 0, currency: 'ARS' }),
    listarPorReserva: async () => [],
    saldoReembolsable: () => 100,
    crearSolicitud: async () => ({ id: 1, estado: 'PENDIENTE', importe: 30 }),
    registrarOejecutar: async () => ({ id: 1, estado: 'EN_PROCESO' }),
  };
  const repo = repositorio(reserva, {
    guardar: async (actual) => { guardados += 1; return actual; },
    conTransaccion: async (operacion) => {
      ejecuciones += 1;
      return operacion(repo, {});
    },
  });
  const service = new ReservaLiquidacionesService(
    repo,
    { liberarReserva: async () => {} },
    reembolsos,
    reservasService(),
    liquidacionesService(), ciclo, decision, catalogosDePrueba(),
  );

  await assert.rejects(
    () => service.resolverLiquidacion(1, { estado: 'DEVUELTO_PARCIAL_INQUILINO', importe: 30 }, 7),
    /no quedó aprobada/,
  );
  assert.equal(guardados, 1);
  assert.equal(ejecuciones, 1);
  assert.equal(reserva.estado_liquidacion, 'EN_REVISION');
});

test('exige referencia cuando la devolución es manual', async () => {
  const reserva = crearReserva();
  const reembolsos = { ejecucionAutomaticaHabilitada: false };
  const service = new ReservaLiquidacionesService(
    repositorio(reserva),
    { liberarReserva: async () => {} },
    reembolsos,
    reservasService(),
    liquidacionesService(), ciclo, decision, catalogosDePrueba(),
  );

  await assert.rejects(
    () => service.resolverLiquidacion(1, { estado: 'DEVUELTO_INQUILINO' }, 7),
    { status: 400 },
  );
});

test('permite resolver la devolución de un pago tardío con reserva cancelada en revisión', async () => {
  const reserva = crearReserva({
    cancelada: true,
    estado_liquidacion: 'EN_REVISION',
    estado_pago: 'APROBADO',
  });
  const reembolsos = {
    ejecucionAutomaticaHabilitada: true,
    buscarPagoPorReserva: async () => ({ id: 10, amount: 100, amount_refunded: 0, currency: 'ARS' }),
    listarPorReserva: async () => [],
    saldoReembolsable: () => 100,
    crearSolicitud: async (datos) => ({ id: 7, estado: 'PENDIENTE', importe: datos.importe }),
    registrarOejecutar: async () => ({ id: 7, estado: 'APROBADO' }),
  };
  const service = new ReservaLiquidacionesService(
    repositorio(reserva),
    { liberarReserva: async () => {} },
    reembolsos,
    reservasService(),
    liquidacionesService(), ciclo, decision, catalogosDePrueba(),
  );

  await service.resolverLiquidacion(1, { estado: 'DEVUELTO_INQUILINO' }, 7);

  assert.equal(reserva.estado_liquidacion, 'DEVUELTO_INQUILINO');
  assert.equal(reserva.estado_pago, 'REEMBOLSADO');
});

test('reutiliza un reembolso FALLIDO de la misma liquidación en lugar de crear otro', async () => {
  const reserva = crearReserva();
  let creados = 0;
  let ejecutado = null;
  const reembolsos = {
    ejecucionAutomaticaHabilitada: true,
    buscarPagoPorReserva: async () => ({ id: 10, amount: 100, amount_refunded: 0, currency: 'ARS' }),
    listarPorReserva: async () => [
      { id: 8, estado: 'FALLIDO', importe: 100, origen: 'AJUSTE_ADMIN', idempotency_key: 'liq:1:t:10000' },
    ],
    saldoReembolsable: () => 100,
    crearSolicitud: async () => { creados += 1; return { id: 9, estado: 'PENDIENTE' }; },
    registrarOejecutar: async (id) => { ejecutado = id; return { id, estado: 'APROBADO' }; },
  };
  const service = new ReservaLiquidacionesService(
    repositorio(reserva),
    { liberarReserva: async () => {} },
    reembolsos,
    reservasService(),
    liquidacionesService(), ciclo, decision, catalogosDePrueba(),
  );

  await service.resolverLiquidacion(1, { estado: 'DEVUELTO_INQUILINO' }, 7);

  assert.equal(creados, 0);
  assert.equal(ejecutado, 8);
});
