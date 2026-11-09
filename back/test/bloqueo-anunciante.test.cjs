require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  ReservaBloqueoAnuncianteService,
} = require('../dist/reservas/service/reserva-bloqueo-anunciante.service');
const {
  ReservaReembolsoAplicacionService,
} = require('../dist/reservas/service/reserva-reembolso-aplicacion.service');
const {
  ReservaBloqueoDevolucionService,
} = require('../dist/reservas/service/reserva-bloqueo-devolucion.service');
const {
  ReservaEstadoService,
} = require('../dist/reservas/service/reserva-estado.service');
const {
  ReservaCicloVidaService,
} = require('../dist/reservas/service/reserva-ciclo-vida.service');
const { Reserva } = require('../dist/reservas/entity/reserva.entity');
const {
  BloqueoAnuncianteService,
} = require('../dist/bloqueo-anunciante/service/bloqueo-anunciante.service');

function crearReserva(extra = {}) {
  return Object.assign(new Reserva(), {
    id: 1,
    estado_pago: 'PENDIENTE',
    estado_liquidacion: 'NO_APLICA',
    cancelada: false,
    finalizada: false,
    codigo_validado_en: null,
    fecha_inicio: '2030-01-01',
    fecha_fin: '2030-01-02',
    publicacion: {
      id: 10,
      titulo: 'Depto',
      anunciante: { idUsuario: 7, usuario: { bloqueado: true } },
    },
    usuario: { id: 20, email: 'inquilino@example.com' },
    ...extra,
  });
}

function escenario(reservas) {
  const pendientes = [];
  const creados = [];
  const liberadas = [];
  const rechazados = [];
  let existentes = [];
  let auto = false;
  let falloCreacion = false;
  let pagoAprobadoConcurrente = false;
  let amountRefunded = 0;
  let falloEjecucion = false;
  let ganadorRechazado = false;
  let ganadorParcial = false;
  let snapshot = () => reservas;
  let buscarPorIdHook = null;
  const repo = {
    buscarPorAnunciante: async () => snapshot(),
    buscarPorId: async (id) => {
      const reserva = reservas.find((r) => r.id === id) ?? null;
      if (buscarPorIdHook) buscarPorIdHook(reserva);
      return reserva;
    },
    guardar: async (reserva) => reserva,
  };
  const fechas = {};
  const transaccion = {
    ejecutar: async (operacion) =>
      operacion({ reservas: repo, fechas }),
  };
  const disponibilidad = {
    liberarReserva: async (id) => liberadas.push(id),
  };
  const reembolsos = {
    listarPorReserva: async () => [...existentes, ...creados],
    crearSolicitud: async (datos) => {
      if (falloCreacion) throw new Error('fallo simulado al crear el reembolso');
      if (ganadorRechazado) {
        const reembolso = { id: 77, estado: 'RECHAZADO', ...datos };
        creados.push(reembolso);
        return reembolso;
      }
      const reembolso = { id: 99, estado: 'PENDIENTE', ...datos };
      creados.push(reembolso);
      return reembolso;
    },
    crearSolicitudConResultado: async function (datos) {
      if (ganadorParcial) {
        return {
          reembolso: { ...datos, id: 88, estado: 'PENDIENTE', importe: 50 },
          creado: false,
        };
      }
      const reembolso = await this.crearSolicitud(datos);
      return {
        reembolso,
        creado:
          reembolso.estado === 'PENDIENTE' ||
          reembolso.estado === 'EN_PROCESO',
      };
    },
    get ejecucionAutomaticaHabilitada() {
      return auto;
    },
    registrarOejecutar: async (id) => {
      if (falloEjecucion) throw new Error('fallo simulado de Mercado Pago');
      return { id, estado: 'APROBADO' };
    },
    rechazar: async (id, motivo, idActor) => {
      rechazados.push({ id, motivo, idActor });
      const reembolso =
        creados.find((r) => r.id === id) ??
        existentes.find((r) => r.id === id);
      if (reembolso) reembolso.estado = 'RECHAZADO';
      return reembolso ?? { id, estado: 'RECHAZADO' };
    },
    compensar: async (id, idActor) => {
      rechazados.push({ id, motivo: 'compensación', idActor });
      const reembolso =
        creados.find((r) => r.id === id) ??
        existentes.find((r) => r.id === id);
      if (reembolso) reembolso.estado = 'RECHAZADO';
      return true;
    },
    buscar: async (id) =>
      existentes.find((r) => r.id === id) ??
      creados.find((r) => r.id === id) ?? {
        id,
        estado: 'PENDIENTE',
      },
    esTotal: () => true,
  };
  const pagos = {
    buscarPorReserva: async () => ({
      id: 30,
      amount: 100,
      amount_refunded: amountRefunded,
      currency: 'ARS',
    }),
    saldoReembolsable: () => Math.max(0, 100 - amountRefunded),
  };
  const vencimiento = {
    rechazarPago: async (id, estado, actor, motivo) => {
      pendientes.push({ id, estado, actor, motivo });
      const reserva = reservas.find((r) => r.id === id);
      if (pagoAprobadoConcurrente) {
        reserva.cancelada = false;
        reserva.estado_pago = 'APROBADO';
        return reserva;
      }
      reserva.cancelada = true;
      reserva.estado_pago = 'CANCELADO';
      return reserva;
    },
  };
  const estado = new ReservaEstadoService();
  const ciclo = new ReservaCicloVidaService(estado);
  const aplicacion = new ReservaReembolsoAplicacionService(
    repo,
    transaccion,
    disponibilidad,
    reembolsos,
    estado,
    ciclo,
    pagos,
  );
  const devolucion = new ReservaBloqueoDevolucionService(
    reembolsos,
    pagos,
  );
  const service = new ReservaBloqueoAnuncianteService(
    repo,
    transaccion,
    disponibilidad,
    reembolsos,
    estado,
    ciclo,
    pagos,
    vencimiento,
    aplicacion,
    devolucion,
  );
  return {
    service,
    pendientes,
    creados,
    liberadas,
    rechazados,
    setExistentes: (valor) => {
      existentes = valor;
    },
    setAuto: (valor) => {
      auto = valor;
    },
    setFalloCreacion: (valor) => {
      falloCreacion = valor;
    },
    setPagoAprobadoConcurrente: (valor) => {
      pagoAprobadoConcurrente = valor;
    },
    setAmountRefunded: (valor) => {
      amountRefunded = valor;
    },
    setFalloEjecucion: (valor) => {
      falloEjecucion = valor;
    },
    setGanadorRechazado: (valor) => {
      ganadorRechazado = valor;
    },
    setGanadorParcial: (valor) => {
      ganadorParcial = valor;
    },
    setSnapshot: (fn) => {
      snapshot = fn;
    },
    setBuscarPorIdHook: (fn) => {
      buscarPorIdHook = fn;
    },
  };
}

test('reserva pendiente de pago: cancela y libera sin devolución', async () => {
  const e = escenario([crearReserva({ estado_pago: 'PENDIENTE' })]);

  const resumen = await e.service.cancelarReservasPorBloqueoAnunciante(
    7,
    99,
    'Fraude',
  );

  assert.equal(resumen.canceladasPendientes, 1);
  assert.equal(e.creados.length, 0);
  assert.equal(e.pendientes.length, 1);
  assert.deepEqual(e.pendientes[0], {
    id: 1,
    estado: 'CANCELADO',
    actor: 'ADMINISTRADOR',
    motivo: 'Bloqueo de cuenta del anunciante: Fraude',
  });
});

test('reserva pagada sin código: cancela, libera y crea devolución del 100 %', async () => {
  const reserva = crearReserva({
    estado_pago: 'APROBADO',
    estado_liquidacion: 'RETENIDO',
  });
  const e = escenario([reserva]);

  const resumen = await e.service.cancelarReservasPorBloqueoAnunciante(
    7,
    99,
    'Fraude',
  );

  assert.equal(resumen.canceladasConDevolucion, 1);
  assert.equal(reserva.cancelada, true);
  assert.equal(reserva.estado_liquidacion, 'EN_REVISION');
  assert.equal(e.creados.length, 1);
  assert.equal(e.creados[0].importe, 100);
  assert.equal(e.creados[0].origen, 'CANCELACION');
  assert.equal(e.creados[0].idempotencyKey, 'blq:7:1');
  assert.deepEqual(e.liberadas, [1]);
});

test('reserva con código validado: no cancela ni devuelve; congela liquidación', async () => {
  const reserva = crearReserva({
    estado_pago: 'APROBADO',
    estado_liquidacion: 'RETENIDO',
    codigo_validado_en: new Date('2030-01-01T15:00:00Z'),
  });
  const e = escenario([reserva]);

  const resumen = await e.service.cancelarReservasPorBloqueoAnunciante(
    7,
    99,
    'Fraude',
  );

  assert.equal(resumen.enRevision, 1);
  assert.equal(reserva.cancelada, false);
  assert.equal(reserva.estado_liquidacion, 'EN_REVISION');
  assert.deepEqual(e.creados, []);
  assert.deepEqual(e.liberadas, []);
});

test('reserva con reclamo o liquidación en revisión: no cancela ni devuelve', async () => {
  const reserva = crearReserva({
    estado_pago: 'APROBADO',
    estado_liquidacion: 'EN_REVISION',
  });
  const e = escenario([reserva]);

  const resumen = await e.service.cancelarReservasPorBloqueoAnunciante(
    7,
    99,
    'Fraude',
  );

  assert.equal(resumen.enRevision, 1);
  assert.equal(reserva.cancelada, false);
  assert.equal(reserva.estado_liquidacion, 'EN_REVISION');
  assert.deepEqual(e.creados, []);
});

test('devolución pendiente existente: no duplica el reembolso', async () => {
  const reserva = crearReserva({
    estado_pago: 'APROBADO',
    estado_liquidacion: 'RETENIDO',
  });
  const e = escenario([reserva]);
  e.setExistentes([{ id: 5, estado: 'PENDIENTE', importe: 100 }]);

  const resumen = await e.service.cancelarReservasPorBloqueoAnunciante(
    7,
    99,
    'Fraude',
  );

  assert.equal(resumen.canceladasConDevolucion, 1);
  assert.equal(reserva.cancelada, true);
  assert.deepEqual(e.creados, []);
});

test('el módulo de composición solo resuelve reservas al bloquear un Anunciante', async () => {
  const llamadas = [];
  const usuarios = {
    buscarPorId: async () => ({ rol: { nombre: 'Anunciante' } }),
    cambiarBloqueo: async () => ({ mensaje: 'ok' }),
  };
  const cancelaciones = {
    cancelarReservasPorBloqueoAnunciante: async () => {
      llamadas.push('reservas');
      return {
        canceladasPendientes: 0,
        canceladasConDevolucion: 0,
        enRevision: 0,
        sinAccion: 0,
        fallidas: 0,
        detalles: [],
      };
    },
  };
  const service = new BloqueoAnuncianteService(usuarios, cancelaciones);

  const bloqueo = await service.cambiarBloqueo(7, true, 99, 'Fraude');
  assert.equal(bloqueo.reservas.canceladasPendientes, 0);
  assert.deepEqual(llamadas, ['reservas']);

  await service.cambiarBloqueo(7, false, 99, 'Revisión');
  assert.deepEqual(llamadas, ['reservas']);
});


test('C1: congelar liquidación no pisa un código validado concurrente', async () => {
  const original = crearReserva({
    estado_pago: 'APROBADO',
    estado_liquidacion: 'RETENIDO',
    codigo_validado_en: new Date('2030-01-01T15:00:00Z'),
  });
  const snapshot = crearReserva({
    estado_pago: 'APROBADO',
    estado_liquidacion: 'EN_REVISION',
  });
  const e = escenario([original]);
  e.setSnapshot(() => [snapshot]);

  const resumen = await e.service.cancelarReservasPorBloqueoAnunciante(
    7,
    99,
    'Fraude',
  );

  assert.equal(resumen.enRevision, 1);
  assert.equal(original.cancelada, false);
  assert.ok(original.codigo_validado_en instanceof Date);
  assert.equal(original.estado_liquidacion, 'EN_REVISION');
});

test('C2: si el código ya está validado antes de crear la devolución, no cancela ni crea reembolso', async () => {
  const original = crearReserva({
    estado_pago: 'APROBADO',
    estado_liquidacion: 'RETENIDO',
    codigo_validado_en: new Date('2030-01-01T15:00:00Z'),
  });
  const snapshot = crearReserva({
    estado_pago: 'APROBADO',
    estado_liquidacion: 'RETENIDO',
  });
  const e = escenario([original]);
  e.setSnapshot(() => [snapshot]);

  const resumen = await e.service.cancelarReservasPorBloqueoAnunciante(
    7,
    99,
    'Fraude',
  );

  assert.equal(resumen.enRevision, 1);
  assert.equal(original.cancelada, false);
  assert.deepEqual(e.liberadas, []);
  assert.equal(e.creados.length, 0);
  assert.equal(e.rechazados.length, 0);
});

test('C2b: si el código se valida después de crear el reembolso, no cancela y lo compensa', async () => {
  const original = crearReserva({
    estado_pago: 'APROBADO',
    estado_liquidacion: 'RETENIDO',
  });
  const e = escenario([original]);
  let lecturas = 0;
  e.setBuscarPorIdHook(() => {
    lecturas += 1;
    if (lecturas === 2) {
      original.codigo_validado_en = new Date('2030-01-01T15:00:00Z');
    }
  });

  const resumen = await e.service.cancelarReservasPorBloqueoAnunciante(
    7,
    99,
    'Fraude',
  );

  assert.equal(resumen.enRevision, 1);
  assert.equal(original.cancelada, false);
  assert.deepEqual(e.liberadas, []);
  assert.equal(e.creados.length, 1);
  assert.equal(e.rechazados.length, 1);
  assert.equal(e.rechazados[0].id, 99);
});

test('C3: si falla la creación del reembolso, no cancela la reserva y reporta la falla', async () => {
  const reserva = crearReserva({
    estado_pago: 'APROBADO',
    estado_liquidacion: 'RETENIDO',
  });
  const e = escenario([reserva]);
  e.setFalloCreacion(true);

  const resumen = await e.service.cancelarReservasPorBloqueoAnunciante(
    7,
    99,
    'Fraude',
  );

  assert.equal(resumen.fallidas, 1);
  assert.equal(resumen.detalles.length, 1);
  assert.equal(reserva.cancelada, false);
  assert.equal(reserva.estado_liquidacion, 'EN_REVISION');
  assert.deepEqual(e.liberadas, []);
  assert.deepEqual(e.creados, []);
});


test('A1: si otro administrador ya canceló, no compensa el reembolso compartido', async () => {
  const original = crearReserva({
    estado_pago: 'APROBADO',
    estado_liquidacion: 'EN_REVISION',
    cancelada: true,
    cancelada_por: 'ADMINISTRADOR',
    motivo_cancelacion:
      'Bloqueo de cuenta del anunciante: Fraude',
  });
  const snapshot = crearReserva({
    estado_pago: 'APROBADO',
    estado_liquidacion: 'RETENIDO',
  });
  const e = escenario([original]);
  e.setSnapshot(() => [snapshot]);

  const resumen = await e.service.cancelarReservasPorBloqueoAnunciante(
    7,
    99,
    'Fraude',
  );

  assert.equal(resumen.canceladasConDevolucion, 1);
  assert.deepEqual(e.rechazados, []);
  assert.equal(e.creados.length, 1);
});

test('A2: si el pago se aprueba durante el cierre, se deriva a devolución y no se cuenta como pendiente', async () => {
  const reserva = crearReserva({ estado_pago: 'PENDIENTE' });
  const e = escenario([reserva]);
  e.setPagoAprobadoConcurrente(true);

  const resumen = await e.service.cancelarReservasPorBloqueoAnunciante(
    7,
    99,
    'Fraude',
  );

  assert.equal(resumen.canceladasPendientes, 0);
  assert.equal(resumen.canceladasConDevolucion, 1);
  assert.equal(reserva.cancelada, true);
  assert.equal(e.creados.length, 1);
});

test('M3: aplicar un reembolso aprobado relee y actualiza la reserva con lock', async () => {
  const reserva = crearReserva({
    estado_pago: 'APROBADO',
    estado_liquidacion: 'RETENIDO',
  });
  const e = escenario([reserva]);
  e.setExistentes([
    {
      id: 5,
      estado: 'APROBADO',
      importe: 100,
      origen: 'CANCELACION',
      tipo: 'TOTAL',
      motivo: 'Bloqueo de cuenta del anunciante: Fraude',
      reserva: { id: 1 },
      pago: { id: 30, amount: 100, amount_refunded: 100 },
    },
  ]);
  e.setAmountRefunded(100);

  const resumen = await e.service.cancelarReservasPorBloqueoAnunciante(
    7,
    99,
    'Fraude',
  );

  assert.equal(resumen.canceladasConDevolucion, 1);
  assert.equal(reserva.estado_pago, 'REEMBOLSADO');
  assert.equal(reserva.estado_liquidacion, 'DEVUELTO_INQUILINO');
  assert.ok(e.liberadas.includes(1));
});


test('H2: un reembolso parcial existente se completa con un complemento del 100 %', async () => {
  const reserva = crearReserva({
    estado_pago: 'APROBADO',
    estado_liquidacion: 'RETENIDO',
  });
  const e = escenario([reserva]);
  e.setExistentes([
    { id: 5, estado: 'PENDIENTE', importe: 50, origen: 'CANCELACION' },
  ]);

  const resumen = await e.service.cancelarReservasPorBloqueoAnunciante(
    7,
    99,
    'Fraude',
  );

  assert.equal(resumen.canceladasConDevolucion, 1);
  assert.equal(reserva.cancelada, true);
  assert.equal(e.creados.length, 1);
  assert.equal(e.creados[0].importe, 50);
  assert.equal(e.creados[0].idempotencyKey, 'blq:7:1:c1');
});

test('H3: un reembolso compartido rechazado no se acepta como devolución válida', async () => {
  const reserva = crearReserva({
    estado_pago: 'APROBADO',
    estado_liquidacion: 'RETENIDO',
  });
  const e = escenario([reserva]);
  e.setGanadorRechazado(true);

  const resumen = await e.service.cancelarReservasPorBloqueoAnunciante(
    7,
    99,
    'Fraude',
  );

  assert.equal(resumen.enRevision, 1);
  assert.equal(reserva.cancelada, false);
  assert.deepEqual(e.liberadas, []);
});

test('H6: si el pago concurrente llega con código validado, no crea reembolso', async () => {
  const original = crearReserva({
    estado_pago: 'PENDIENTE',
    estado_liquidacion: 'NO_APLICA',
    codigo_validado_en: new Date('2030-01-01T15:00:00Z'),
  });
  const snapshot = crearReserva({ estado_pago: 'PENDIENTE' });
  const e = escenario([original]);
  e.setSnapshot(() => [snapshot]);
  e.setPagoAprobadoConcurrente(true);

  const resumen = await e.service.cancelarReservasPorBloqueoAnunciante(
    7,
    99,
    'Fraude',
  );

  assert.equal(resumen.enRevision, 1);
  assert.equal(original.cancelada, false);
  assert.equal(e.creados.length, 0);
});

test('H5: si falla la ejecución automática, se reporta como fallida', async () => {
  const reserva = crearReserva({
    estado_pago: 'APROBADO',
    estado_liquidacion: 'RETENIDO',
  });
  const e = escenario([reserva]);
  e.setAuto(true);
  e.setFalloEjecucion(true);

  const resumen = await e.service.cancelarReservasPorBloqueoAnunciante(
    7,
    99,
    'Fraude',
  );

  assert.equal(resumen.fallidas, 1);
  assert.equal(resumen.detalles.length, 1);
  assert.equal(reserva.cancelada, true);
});


test('B1: una reserva cancelada manualmente sin marca de bloqueo no se cancela ni devuelve', async () => {
  const original = crearReserva({
    estado_pago: 'APROBADO',
    estado_liquidacion: 'NO_APLICA',
    cancelada: true,
    cancelada_por: 'INQUILINO',
    motivo_cancelacion: 'Cancelación manual',
  });
  const snapshot = crearReserva({
    estado_pago: 'APROBADO',
    estado_liquidacion: 'RETENIDO',
  });
  const e = escenario([original]);
  e.setSnapshot(() => [snapshot]);

  const resumen = await e.service.cancelarReservasPorBloqueoAnunciante(
    7,
    99,
    'Fraude',
  );

  assert.equal(resumen.enRevision, 1);
  assert.equal(original.cancelada, true);
  assert.equal(e.creados.length, 0);
});

test('H2b: un parcial devuelto por la clave idempotente no se acepta como cobertura total', async () => {
  const reserva = crearReserva({
    estado_pago: 'APROBADO',
    estado_liquidacion: 'RETENIDO',
  });
  const e = escenario([reserva]);
  e.setGanadorParcial(true);

  const resumen = await e.service.cancelarReservasPorBloqueoAnunciante(
    7,
    99,
    'Fraude',
  );

  assert.equal(resumen.enRevision, 1);
  assert.equal(reserva.cancelada, false);
  assert.equal(e.creados.length, 0);
});


test('H1: si el reembolso compartido se rechaza antes de cancelar, se restablece una devolución válida', async () => {
  const reserva = crearReserva({
    estado_pago: 'APROBADO',
    estado_liquidacion: 'RETENIDO',
  });
  const e = escenario([reserva]);
  let lecturas = 0;
  e.setBuscarPorIdHook(() => {
    lecturas += 1;
    if (lecturas === 2 && e.creados[0]) {
      e.creados[0].estado = 'RECHAZADO';
    }
  });

  const resumen = await e.service.cancelarReservasPorBloqueoAnunciante(
    7,
    99,
    'Fraude',
  );

  assert.equal(resumen.canceladasConDevolucion, 1);
  assert.equal(reserva.cancelada, true);
  assert.equal(e.creados.length, 2);
  assert.match(e.creados[1].idempotencyKey, /^blq:7:1:r1:[a-z0-9]+$/);
  assert.deepEqual(e.rechazados, []);
});

test('H2a: un parcial aprobado se completa por el saldo faltante', async () => {
  const reserva = crearReserva({
    estado_pago: 'APROBADO',
    estado_liquidacion: 'RETENIDO',
  });
  const e = escenario([reserva]);
  e.setExistentes([
    {
      id: 5,
      estado: 'APROBADO',
      importe: 50,
      origen: 'CANCELACION',
      idempotency_key: 'blq:7:1',
    },
  ]);
  e.setAmountRefunded(50);

  const resumen = await e.service.cancelarReservasPorBloqueoAnunciante(
    7,
    99,
    'Fraude',
  );

  assert.equal(resumen.canceladasConDevolucion, 1);
  assert.equal(reserva.cancelada, true);
  assert.equal(e.creados.length, 1);
  assert.equal(e.creados[0].importe, 50);
  assert.equal(e.creados[0].idempotencyKey, 'blq:7:1:c1');
});

test('H7: un bloqueo repetido no vuelve a cancelar ni a devolver', async () => {
  const reserva = crearReserva({ estado_pago: 'PENDIENTE' });
  const e = escenario([reserva]);

  const primero = await e.service.cancelarReservasPorBloqueoAnunciante(
    7,
    99,
    'Fraude',
  );
  const segundo = await e.service.cancelarReservasPorBloqueoAnunciante(
    7,
    99,
    'Fraude',
  );

  assert.equal(primero.canceladasPendientes, 1);
  assert.equal(segundo.sinAccion, 1);
  assert.equal(segundo.canceladasPendientes, 0);
  assert.equal(e.creados.length, 0);
  assert.equal(e.pendientes.length, 1);
});

test('H7b: un bloqueo repetido sobre una reserva pagada reutiliza la devolución', async () => {
  const reserva = crearReserva({
    estado_pago: 'APROBADO',
    estado_liquidacion: 'RETENIDO',
  });
  const e = escenario([reserva]);

  const primero = await e.service.cancelarReservasPorBloqueoAnunciante(
    7,
    99,
    'Fraude',
  );
  const segundo = await e.service.cancelarReservasPorBloqueoAnunciante(
    7,
    99,
    'Fraude',
  );

  assert.equal(primero.canceladasConDevolucion, 1);
  assert.equal(segundo.enRevision, 1);
  assert.equal(e.creados.length, 1);
  assert.equal(e.liberadas.length, 1);
});
