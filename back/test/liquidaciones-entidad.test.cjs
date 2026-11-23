const { catalogosDePrueba } = require('./soporte/catalogos-pruebas.cjs');
require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { LiquidacionesService } = require('../dist/liquidaciones/service/liquidaciones.service');
const { OperacionesLiquidacionService } = require('../dist/operaciones-reserva/service/operaciones-liquidacion.service');
const { ReservaEstadoService } = require('../dist/reservas-consulta/service/reserva-estado.service');

test('una estadía cerrada sin código mantiene el ingreso no verificado', () => {
  const service = new ReservaEstadoService({}, catalogosDePrueba());
  const reserva = crearReserva({ estado_pago: 'APROBADO', finalizada: true, fecha_inicio: '2026-11-10', fecha_fin: '2026-11-16' });
  assert.equal(service.calcularEstadoEstadia(reserva, new Date('2026-11-21T12:00:00Z')), 'INGRESO_NO_VERIFICADO');
  reserva.codigo_validado_en = new Date('2026-11-10T12:00:00Z');
  assert.equal(service.calcularEstadoEstadia(reserva, new Date('2026-11-21T12:00:00Z')), 'FINALIZADA');
});

test('el vencimiento libera solo ingresos sin código y sin revisión ni devolución, a partir del quinto día', async () => {
  const catalogos = catalogosDePrueba();
  const repositorio = crearRepositorio();
  const liquidaciones = new LiquidacionesService(repositorio, catalogos);
  const reservas = [
    crearReserva({ id: 1, fecha_inicio: '2026-11-10', fecha_fin: '2026-11-16', estado_pago: 'APROBADO' }),
    crearReserva({ id: 2, fecha_inicio: '2026-11-10', fecha_fin: '2026-11-17', estado_pago: 'APROBADO' }),
    crearReserva({ id: 3, fecha_inicio: '2026-11-10', fecha_fin: '2026-11-16', estado_pago: 'APROBADO', estado_liquidacion: 'EN_REVISION' }),
    crearReserva({ id: 4, fecha_inicio: '2026-11-10', fecha_fin: '2026-11-16', estado_pago: 'APROBADO' }),
  ];
  for (const reserva of reservas) await liquidaciones.asegurarParaReserva(reserva);
  repositorio.listarIngresosNoVerificadosVencidos = async () => reservas.map(r => r.id);
  const reservaService = {
    conReservaBloqueada: async (id, operar) => operar(reservas.find(r => r.id === id), {}),
    pagoAprobado: r => r.estado_pago === 'APROBADO',
    codigoValidado: r => !!r.codigo_validado_en,
    codigoBloqueado: r => (r.intentos_codigo ?? 0) >= 5,
  };
  const reembolsos = { listarPorReserva: async id => id === 4 ? [{ estado: 'PENDIENTE' }] : [] };
  const operaciones = new OperacionesLiquidacionService(reembolsos, reservaService, liquidaciones, catalogos, {}, { tieneReclamoAbierto: async () => false });
  await operaciones.avisarLiquidacionesDisponibles(new Date('2026-11-21T12:00:00Z'));
  assert.equal(reservas[0].estado_liquidacion, 'PENDIENTE_PAGO_PROPIETARIO');
  assert.equal(reservas[0].codigo_validado_en, undefined);
  assert.equal(reservas[1].estado_liquidacion, 'RETENIDO');
  assert.equal(reservas[2].estado_liquidacion, 'EN_REVISION');
  assert.equal(reservas[3].estado_liquidacion, 'RETENIDO');
  assert.match(reservas[0].observacion_liquidacion, /Ingreso no verificado/);
  await operaciones.avisarLiquidacionesDisponibles(new Date('2026-11-21T12:00:00Z'));
  assert.equal(repositorio.filas.size, 4);
});

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
    listarPorEstados: async (estados) => [...filas.values()].filter(fila => estados.includes(fila.estado)),
    listarPagosRegistrados: async (estado) =>
      [...filas.values()].filter(fila => fila.estado === estado || fila.pagos_anunciante),
  };
  return repositorio;
}

test('el panel incluye liquidaciones en espera y en revisión y calcula la fecha de pago', async () => {
  const repositorio = crearRepositorio();
  const service = new LiquidacionesService(repositorio, catalogosDePrueba());
  const reserva = crearReserva({ fecha_inicio: '2026-11-12', fecha_fin: '2026-11-16',
    estado_liquidacion: 'PENDIENTE_PAGO_PROPIETARIO' });
  const revision = crearReserva({ id: 2, fecha_inicio: '2026-11-20', fecha_fin: null,
    estado_liquidacion: 'EN_REVISION' });
  await service.asegurarParaReserva(reserva);
  await service.asegurarParaReserva(revision);

  assert.equal(service.fechaDisponiblePagoManual(reserva), '2026-11-21');
  assert.equal(service.fechaDisponiblePagoManual(revision), null);
  assert.deepEqual((await service.listarParaAdministracion()).map(r => r.id), [1, 2]);
});

test('el historial conserva los datos del pago al anunciante después de una devolución', async () => {
  const reserva = crearReserva();
  const service = new LiquidacionesService(crearRepositorio(), catalogosDePrueba());
  const importe = 95;
  await service.registrarResolucion(reserva, 'PAGADO_PROPIETARIO', {
    importe, moneda: 'ARS', referencia: 'transferencia-1', observacion: 'Pago acreditado',
  }, 7);
  await service.registrarDevolucion(reserva, {
    parcial: false, importe: 100, moneda: 'ARS', referencia: 'reembolso-1',
  }, 8);

  const [pago] = await service.listarPagosRegistrados();
  assert.equal(pago.reservaId, reserva.id);
  assert.equal(pago.importe, importe);
  assert.equal(pago.referencia, 'transferencia-1');
  assert.equal(pago.observacion, 'Pago acreditado');
  assert.equal(pago.administrador, 'Usuario #7');
  assert.ok(pago.fecha);
});

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
