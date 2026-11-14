const { catalogosDePrueba } = require('./soporte/catalogos-pruebas.cjs');
require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { LiquidacionesService } = require('../dist/liquidaciones/service/liquidaciones.service');

function crearReserva(extra = {}) {
  return {
    id: 1,
    monto_pago: 100,
    estado_liquidacion: 'RETENIDO',
    referencia_liquidacion: null,
    observacion_liquidacion: null,
    fecha_resolucion_liquidacion: null,
    ...extra,
  };
}

function crearRepositorio() {
  const filas = new Map();
  let ultimoId = 0;
  const repositorio = {
    filas,
    crear: (datos) => ({ ...datos }),
    guardar: async (liquidacion) => {
      liquidacion.id ??= ++ultimoId;
      filas.set(liquidacion.reserva.id, liquidacion);
      return liquidacion;
    },
    buscarPorReserva: async (idReserva) => filas.get(idReserva) ?? null,
    buscarPorReservaConBloqueo: async (idReserva) => filas.get(idReserva) ?? null,
  };
  return repositorio;
}

test('asegurarParaReserva copia la caché de la reserva y solo crea una fila', async () => {
  const fecha = new Date('2026-01-02T03:04:05.000Z');
  const reserva = crearReserva({
    estado_liquidacion: 'PAGADO_PROPIETARIO',
    referencia_liquidacion: 'ref-1',
    observacion_liquidacion: 'observación previa',
    fecha_resolucion_liquidacion: fecha,
  });
  const repositorio = crearRepositorio();
  const service = new LiquidacionesService(repositorio, catalogosDePrueba());

  const primera = await service.asegurarParaReserva(reserva);
  const segunda = await service.asegurarParaReserva(reserva);

  assert.equal(repositorio.filas.size, 1);
  assert.equal(segunda, primera);
  assert.equal(primera.estado, 'PAGADO_PROPIETARIO');
  assert.equal(Number(primera.importe), 100);
  assert.equal(primera.moneda, 'ARS');
  assert.equal(primera.referencia, 'ref-1');
  assert.equal(primera.observacion, 'observación previa');
  assert.equal(primera.fecha_resolucion, fecha);
  assert.equal(primera.fecha_pago_propietario, fecha);
});

test('asegurarParaReserva no inventa un importe si la liquidación sigue pendiente', async () => {
  const reserva = crearReserva();
  const service = new LiquidacionesService(crearRepositorio(), catalogosDePrueba());

  const liquidacion = await service.asegurarParaReserva(reserva);

  assert.equal(liquidacion.estado, 'RETENIDO');
  assert.equal(liquidacion.importe, null);
  assert.equal(liquidacion.fecha_resolucion, null);
});

test('registrarResolucion actualiza importe, moneda, referencia, administrador y fecha', async () => {
  const reserva = crearReserva();
  const repositorio = crearRepositorio();
  const service = new LiquidacionesService(repositorio, catalogosDePrueba());
  const desde = Date.now();

  const liquidacion = await service.registrarResolucion(
    reserva,
    'DEVUELTO_PARCIAL_INQUILINO',
    {
      importe: 40.5,
      moneda: 'ARS',
      referencia: '  comprobante-1  ',
      observacion: '  devolución parcial  ',
    },
    7,
  );

  assert.equal(repositorio.filas.size, 1);
  assert.equal(liquidacion.estado, 'DEVUELTO_PARCIAL_INQUILINO');
  assert.equal(Number(liquidacion.importe), 40.5);
  assert.equal(liquidacion.moneda, 'ARS');
  assert.equal(liquidacion.referencia, 'comprobante-1');
  assert.equal(liquidacion.observacion, 'devolución parcial');
  assert.equal(liquidacion.admin_resolucion.id, 7);
  assert.ok(liquidacion.fecha_resolucion instanceof Date);
  assert.ok(liquidacion.fecha_resolucion.getTime() >= desde);
  assert.equal(liquidacion.fecha_pago_propietario, null);
  assert.equal(reserva.estado_liquidacion, 'DEVUELTO_PARCIAL_INQUILINO');
  assert.equal(reserva.referencia_liquidacion, 'comprobante-1');
  assert.equal(reserva.observacion_liquidacion, 'devolución parcial');
  assert.equal(reserva.fecha_resolucion_liquidacion, liquidacion.fecha_resolucion);
});

test('registrarResolucion es idempotente sobre la misma fila y registra el pago al propietario', async () => {
  const reserva = crearReserva();
  const repositorio = crearRepositorio();
  const service = new LiquidacionesService(repositorio, catalogosDePrueba());

  await service.registrarResolucion(
    reserva,
    'PENDIENTE_PAGO_PROPIETARIO',
    { importe: null, moneda: 'ARS' },
    5,
  );
  const liquidacion = await service.registrarResolucion(
    reserva,
    'PAGADO_PROPIETARIO',
    { importe: 100, moneda: 'ARS', referencia: 'transferencia-9' },
    5,
  );

  assert.equal(repositorio.filas.size, 1);
  assert.equal(liquidacion.estado, 'PAGADO_PROPIETARIO');
  assert.equal(Number(liquidacion.importe), 100);
  assert.equal(liquidacion.referencia, 'transferencia-9');
  assert.equal(liquidacion.admin_resolucion.id, 5);
  assert.ok(liquidacion.fecha_pago_propietario instanceof Date);
  assert.equal(liquidacion.fecha_pago_propietario, liquidacion.fecha_resolucion);
  assert.equal(reserva.estado_liquidacion, 'PAGADO_PROPIETARIO');
  assert.equal(reserva.fecha_resolucion_liquidacion, liquidacion.fecha_resolucion);
});

test('registrarRevision deja la liquidación en revisión y limpia la fecha de resolución', async () => {
  const reserva = crearReserva({
    estado_liquidacion: 'PAGADO_PROPIETARIO',
    fecha_resolucion_liquidacion: new Date('2026-01-02T03:04:05.000Z'),
  });
  const service = new LiquidacionesService(crearRepositorio(), catalogosDePrueba());

  const liquidacion = await service.registrarRevision(
    reserva,
    'Reclamo del inquilino: humedad',
  );

  assert.equal(liquidacion.estado, 'EN_REVISION');
  assert.equal(liquidacion.observacion, 'Reclamo del inquilino: humedad');
  assert.equal(liquidacion.fecha_resolucion, null);
  assert.equal(liquidacion.fecha_pago_propietario, null);
  assert.equal(reserva.estado_liquidacion, 'EN_REVISION');
  assert.equal(reserva.observacion_liquidacion, 'Reclamo del inquilino: humedad');
  assert.equal(reserva.fecha_resolucion_liquidacion, null);
});

test('sincronizarDesdeReserva copia la caché sin pisar la resolución administrativa ni el importe', async () => {
  const fecha = new Date('2026-02-03T04:05:06.000Z');
  const fechaPago = new Date('2026-02-04T04:05:06.000Z');
  const reserva = crearReserva({
    estado_liquidacion: 'DEVUELTO_PARCIAL_INQUILINO',
    referencia_liquidacion: 'ref-2',
    observacion_liquidacion: 'devolución parcial registrada',
    fecha_resolucion_liquidacion: fecha,
  });
  const repositorio = crearRepositorio();
  repositorio.filas.set(1, {
    id: 9,
    reserva,
    estado: 'EN_REVISION',
    importe: 40,
    moneda: 'ARS',
    referencia: null,
    observacion: null,
    admin_resolucion: { id: 7 },
    fecha_resolucion: null,
    fecha_pago_propietario: fechaPago,
  });
  const service = new LiquidacionesService(repositorio, catalogosDePrueba());

  const liquidacion = await service.sincronizarDesdeReserva(reserva);

  assert.equal(liquidacion.estado, 'DEVUELTO_PARCIAL_INQUILINO');
  assert.equal(liquidacion.observacion, 'devolución parcial registrada');
  assert.equal(liquidacion.referencia, 'ref-2');
  assert.equal(liquidacion.fecha_resolucion, fecha);
  assert.equal(Number(liquidacion.importe), 40);
  assert.equal(liquidacion.admin_resolucion.id, 7);
  assert.equal(liquidacion.fecha_pago_propietario, fechaPago);
});

test('sincronizarDesdeReserva completa el importe de una liquidación resuelta sin importe', async () => {
  const fecha = new Date('2026-02-03T04:05:06.000Z');
  const reserva = crearReserva({
    estado_liquidacion: 'DEVUELTO_INQUILINO',
    fecha_resolucion_liquidacion: fecha,
  });
  const repositorio = crearRepositorio();
  repositorio.filas.set(1, {
    id: 9,
    reserva,
    estado: 'EN_REVISION',
    importe: null,
    moneda: 'ARS',
    referencia: null,
    observacion: null,
    admin_resolucion: { id: 7 },
    fecha_resolucion: null,
    fecha_pago_propietario: null,
  });
  const service = new LiquidacionesService(repositorio, catalogosDePrueba());

  const liquidacion = await service.sincronizarDesdeReserva(reserva);

  assert.equal(Number(liquidacion.importe), 100);
  assert.equal(liquidacion.estado, 'DEVUELTO_INQUILINO');
});

test('sincronizarDesdeReserva no guarda si la reserva no cambió', async () => {
  const reserva = crearReserva();
  const repositorio = crearRepositorio();
  let guardados = 0;
  const guardar = repositorio.guardar;
  repositorio.guardar = async (liquidacion) => {
    guardados += 1;
    return guardar(liquidacion);
  };
  const service = new LiquidacionesService(repositorio, catalogosDePrueba());

  await service.asegurarParaReserva(reserva);
  const liquidacion = await service.sincronizarDesdeReserva(reserva);

  assert.equal(guardados, 1);
  assert.equal(liquidacion.estado, 'RETENIDO');
});

test('registrarDevolucion distingue el reembolso total del parcial', async () => {
  const service = new LiquidacionesService(crearRepositorio(), catalogosDePrueba());

  const parcial = await service.registrarDevolucion(
    crearReserva({ id: 1 }),
    { importe: 25, parcial: true },
    3,
  );
  const total = await service.registrarDevolucion(
    crearReserva({ id: 2 }),
    { importe: 100 },
    3,
  );

  assert.equal(parcial.estado, 'DEVUELTO_PARCIAL_INQUILINO');
  assert.equal(Number(parcial.importe), 25);
  assert.equal(total.estado, 'DEVUELTO_INQUILINO');
  assert.equal(Number(total.importe), 100);
});
