require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  ReservaLiquidacionesService,
} = require('../dist/reservas/service/reserva-liquidaciones.service');
const {
  ReservaSolicitudCancelacionResolucionService,
} = require('../dist/reservas/service/reserva-solicitud-cancelacion-resolucion.service');
const {
  ReservaEstadoService,
} = require('../dist/reservas/service/reserva-estado.service');

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
    usuario: { id: 2 },
    publicacion: { anunciante: { usuario: { id: 7 } } },
    ...extra,
  };
}

test('DEVUELTO_INQUILINO devuelve el saldo completo aunque el DTO traiga otro importe', async () => {
  const reserva = crearReserva();
  const pago = {
    id: 10,
    amount: 100,
    amount_refunded: 0,
    currency: 'ARS',
  };
  let solicitudCreada = null;
  let referenciaEjecutada = null;
  const reembolsos = {
    buscarPagoPorReserva: async () => pago,
    listarPorReserva: async () => [],
    crearSolicitudConResultado: async (datos) => {
      solicitudCreada = datos;
      return {
        reembolso: { id: 1, estado: 'PENDIENTE' },
        creado: true,
      };
    },
    registrarOejecutar: async (_id, referencia) => {
      referenciaEjecutada = referencia;
      return { id: 1, estado: 'APROBADO' };
    },
  };
  const repositorio = {
    buscarPorId: async () => reserva,
    guardar: async (actual) => actual,
  };
  const transaccion = {
    ejecutar: async (operacion) =>
      operacion({ reservas: repositorio, fechas: {} }),
  };
  const service = new ReservaLiquidacionesService(
    transaccion,
    repositorio,
    { liberarReserva: async () => {} },
    reembolsos,
    new ReservaEstadoService(),
    { resolverLiquidacion: () => {} },
    { saldoReembolsable: () => 100 },
  );

  await service.resolverLiquidacion(
    1,
    { estado: 'DEVUELTO_INQUILINO', importe: 1 },
    7,
  );

  assert.equal(solicitudCreada.importe, 100);
  assert.equal(solicitudCreada.tipo, 'TOTAL');
  assert.equal(solicitudCreada.idempotencyKey, 'liq:1:t:10000');
  assert.equal(referenciaEjecutada, 'liquidacion-1-1');
});

test('no resuelve la reserva si la devolución quedó EN_PROCESO', async () => {
  const reserva = crearReserva();
  let guardados = 0;
  let ejecuciones = 0;
  const reembolsos = {
    buscarPagoPorReserva: async () => ({
      id: 10,
      amount: 100,
      amount_refunded: 0,
      currency: 'ARS',
    }),
    listarPorReserva: async () => [],
    crearSolicitudConResultado: async () => ({
      reembolso: { id: 1, estado: 'PENDIENTE' },
      creado: true,
    }),
    registrarOejecutar: async () => ({ id: 1, estado: 'EN_PROCESO' }),
  };
  const repositorio = {
    buscarPorId: async () => reserva,
    guardar: async (actual) => {
      guardados += 1;
      return actual;
    },
  };
  const transaccion = {
    ejecutar: async (operacion) => {
      ejecuciones += 1;
      return operacion({ reservas: repositorio, fechas: {} });
    },
  };
  const service = new ReservaLiquidacionesService(
    transaccion,
    repositorio,
    { liberarReserva: async () => {} },
    reembolsos,
    new ReservaEstadoService(),
    { resolverLiquidacion: () => {} },
    { saldoReembolsable: () => 100 },
  );

  await assert.rejects(
    () =>
      service.resolverLiquidacion(
        1,
        { estado: 'DEVUELTO_PARCIAL_INQUILINO', importe: 30 },
        7,
      ),
    /no quedó aprobada/,
  );
  assert.equal(guardados, 1);
  assert.equal(ejecuciones, 1);
  assert.equal(reserva.estado_liquidacion, 'EN_REVISION');
});

test('una solicitud que venció durante la transacción no se aprueba', async () => {
  const reserva = crearReserva();
  const solicitud = {
    id: 9,
    estado: 'PENDIENTE',
    motivo: 'Motivo',
    reserva,
    solicitante: { id: 2 },
  };
  let solicitudGuardada = null;
  let compensado = false;
  const repo = {
    buscarSolicitudCancelacion: async () => solicitud,
  };
  const reembolsos = {
    buscarPagoPorReserva: async () => ({
      id: 10,
      amount: 100,
      amount_refunded: 0,
      currency: 'ARS',
    }),
    listarPorReserva: async () => [],
    crearSolicitudConResultado: async () => ({
      reembolso: { id: 5, estado: 'PENDIENTE', importe: 100 },
      creado: true,
    }),
    compensar: async () => {
      compensado = true;
      return true;
    },
    ejecucionAutomaticaHabilitada: false,
  };
  const actualSolicitud = { ...solicitud };
  const actualReserva = crearReserva({ cancelada: true });
  const transaccion = {
    ejecutar: async (operacion) =>
      operacion({
        reservas: {
          buscarSolicitudCancelacionConBloqueo: async () => actualSolicitud,
          buscarPorId: async () => actualReserva,
          guardarSolicitudCancelacion: async (actual) => {
            solicitudGuardada = actual;
            return actual;
          },
        },
      }),
  };
  const service = new ReservaSolicitudCancelacionResolucionService(
    repo,
    transaccion,
    { liberarReserva: async () => {} },
    reembolsos,
    new ReservaEstadoService(),
    { cancelar: () => {} },
    { aplicarReembolsoConfirmado: async () => ({}) },
  );

  await assert.rejects(
    () =>
      service.resolverSolicitudCancelacion(
        1,
        9,
        { decision: 'APROBADA', observacion: null },
        7,
      ),
    /ya no admite/,
  );
  assert.equal(solicitudGuardada.estado, 'VENCIDA');
  assert.equal(compensado, true);
});

test('una cancelación con parcial aprobado crea un complemento por el saldo', async () => {
  const reserva = crearReserva();
  const solicitud = {
    id: 9,
    estado: 'PENDIENTE',
    motivo: 'Motivo',
    reserva,
    solicitante: { id: 2 },
  };
  const pago = {
    id: 10,
    amount: 100,
    amount_refunded: 50,
    currency: 'ARS',
  };
  const existente = {
    id: 5,
    estado: 'APROBADO',
    importe: 50,
    idempotency_key: 'cancelacion:9',
  };
  let creada = null;
  const repo = { buscarSolicitudCancelacion: async () => solicitud };
  const reembolsos = {
    buscarPagoPorReserva: async () => pago,
    listarPorReserva: async () => [existente],
    crearSolicitudConResultado: async (datos) => {
      creada = datos;
      return {
        reembolso: { id: 6, estado: 'PENDIENTE', importe: datos.importe },
        creado: true,
      };
    },
    compensar: async () => true,
    ejecucionAutomaticaHabilitada: false,
  };
  const actualSolicitud = { ...solicitud };
  const transaccion = {
    ejecutar: async (operacion) =>
      operacion({
        reservas: {
          buscarSolicitudCancelacionConBloqueo: async () => actualSolicitud,
          buscarPorId: async () => reserva,
          guardarSolicitudCancelacion: async (actual) => {
            actualSolicitud.estado = actual.estado;
            return actual;
          },
        },
      }),
  };
  const service = new ReservaSolicitudCancelacionResolucionService(
    repo,
    transaccion,
    { liberarReserva: async () => {} },
    reembolsos,
    new ReservaEstadoService(),
    { cancelar: () => {} },
    { aplicarReembolsoConfirmado: async () => ({}) },
  );

  await service.resolverSolicitudCancelacion(
    1,
    9,
    { decision: 'APROBADA', observacion: null },
    7,
  );

  assert.equal(creada.importe, 50);
  assert.equal(creada.tipo, 'PARCIAL');
  assert.equal(creada.idempotencyKey, 'cancelacion:9:c1');
  assert.equal(actualSolicitud.estado, 'APROBADA');
});

test('permite resolver la devolución de un pago tardío con reserva cancelada en revisión', async () => {
  const reserva = crearReserva({
    cancelada: true,
    estado_liquidacion: 'EN_REVISION',
    estado_pago: 'APROBADO',
  });
  const reembolsos = {
    buscarPagoPorReserva: async () => ({
      id: 10,
      amount: 100,
      amount_refunded: 0,
      currency: 'ARS',
    }),
    listarPorReserva: async () => [],
    crearSolicitudConResultado: async (datos) => ({
      reembolso: { id: 7, estado: 'PENDIENTE', importe: datos.importe },
      creado: true,
    }),
    registrarOejecutar: async () => ({ id: 7, estado: 'APROBADO' }),
  };
  const repositorio = {
    buscarPorId: async () => reserva,
    guardar: async (actual) => actual,
  };
  const transaccion = {
    ejecutar: async (operacion) =>
      operacion({ reservas: repositorio, fechas: {} }),
  };
  const service = new ReservaLiquidacionesService(
    transaccion,
    repositorio,
    { liberarReserva: async () => {} },
    reembolsos,
    new ReservaEstadoService(),
    { resolverLiquidacion: () => {} },
    { saldoReembolsable: () => 100 },
  );

  await service.resolverLiquidacion(
    1,
    { estado: 'DEVUELTO_INQUILINO' },
    7,
  );

  assert.equal(reserva.estado_liquidacion, 'EN_REVISION');
});

test('reutiliza un reembolso FALLIDO de la misma liquidación en lugar de crear otro', async () => {
  const reserva = crearReserva();
  let creados = 0;
  let ejecutado = null;
  const reembolsos = {
    buscarPagoPorReserva: async () => ({
      id: 10,
      amount: 100,
      amount_refunded: 0,
      currency: 'ARS',
    }),
    listarPorReserva: async () => [
      {
        id: 8,
        estado: 'FALLIDO',
        importe: 100,
        origen: 'AJUSTE_ADMIN',
        idempotency_key: 'liq:1:t:10000',
      },
    ],
    crearSolicitudConResultado: async () => {
      creados += 1;
      return { reembolso: { id: 9, estado: 'PENDIENTE' }, creado: true };
    },
    registrarOejecutar: async (id) => {
      ejecutado = id;
      return { id, estado: 'APROBADO' };
    },
  };
  const repositorio = {
    buscarPorId: async () => reserva,
    guardar: async (actual) => actual,
  };
  const transaccion = {
    ejecutar: async (operacion) =>
      operacion({ reservas: repositorio, fechas: {} }),
  };
  const service = new ReservaLiquidacionesService(
    transaccion,
    repositorio,
    { liberarReserva: async () => {} },
    reembolsos,
    new ReservaEstadoService(),
    { resolverLiquidacion: () => {} },
    { saldoReembolsable: () => 100 },
  );

  await service.resolverLiquidacion(
    1,
    { estado: 'DEVUELTO_INQUILINO' },
    7,
  );

  assert.equal(creados, 0);
  assert.equal(ejecutado, 8);
});
