require('reflect-metadata');
const assert = require('node:assert/strict');
const { test, beforeEach } = require('node:test');
const { ValidationPipe } = require('@nestjs/common');
const { JwtService } = require('@nestjs/jwt');
const { CrearCheckoutDto } = require('../dist/pagos/dto/crear-checkout.dto');
const { PresupuestosService } = require('../dist/pagos/service/presupuestos.service');
const { PagosService } = require('../dist/pagos/service/pagos.service');
const { CheckoutService } = require('../dist/pagos/service/checkout.service');
const { PagosWebhookService } = require('../dist/pagos/service/pagos-webhook.service');
const { ReservasService } = require('../dist/reservas/service/reservas.service');
const { ReservaEstadoService } = require('../dist/reservas/service/reserva-estado.service');
const { ReservaCicloVidaService } = require('../dist/reservas/service/reserva-ciclo-vida.service');
const { ReservaCreacionService } = require('../dist/reservas/service/reserva-creacion.service');
const { Reserva } = require('../dist/reservas/entity/reserva.entity');
const { Pago } = require('../dist/pagos/entity/pago.entity');

const AHORA = Date.parse('2030-01-01T12:00:00Z');
const USUARIO = 7;
const solicitud = {
  id_publicacion: 1,
  fecha_inicio: '2030-02-10',
  fecha_fin: '2030-02-12',
};

beforeEach((t) => {
  t.mock.timers.enable({ apis: ['Date'], now: AHORA });
});

// Servicios reales; base de datos y pasarela reemplazadas para no crear cobros.
function escenario(moneda = 'ARS') {
  const publicacion = {
    id: 1,
    activa: true,
    anunciante: { usuario: { activa: true, bloqueado: false } },
    precio: moneda === 'USD' ? 50 : 100,
    tipoMoneda: { nombre: moneda },
    modalidad: { permite_reservas_por_fecha: true },
    perteneceA: () => false,
  };
  const estado = { reservas: [], pagos: [], checkouts: [], alBloquear: () => {} };
  const cotizacion = {
    id: 10, venta: '1200.000000', tipo: 'blue', proveedor: 'prueba',
    actualizada_fuente_en: new Date(), consultada_en: new Date(),
  };
  const config = {
    get: (clave) => clave === 'MP_CURRENCY_ID' ? 'ARS' : undefined,
    getOrThrow: () => 'clave-exclusiva-de-pruebas',
  };
  const publicaciones = {
    buscarPorId: async () => ({ ...publicacion, tipoMoneda: { ...publicacion.tipoMoneda } }),
  };
  const repositorio = {
    buscarPendientesVencidas: async () => [],
    buscarCondicionesPublicacion: publicaciones.buscarPorId,
    crear: (datos) => Object.assign(new Reserva(), datos),
    guardar: async (reserva) => {
      if (!reserva.id) {
        reserva.id = estado.reservas.length + 1;
        estado.reservas.push(reserva);
      }
      return reserva;
    },
    buscarPorId: async (id) => estado.reservas.find(r => r.id === id),
  };
  const fechas = { bloquearPublicacion: async () => estado.alBloquear() };
  const disponibilidad = {
    verificarDisponibilidad: async () => true,
    marcarComoReservadas: async () => {},
    liberarReserva: async () => {},
  };
  const reservaEstado = new ReservaEstadoService();
  const reservaCiclo = new ReservaCicloVidaService(reservaEstado);
  const usuarios = {
    buscarPorId: async () => ({ nombre: 'Prueba', apellido: 'Reserva' }),
  };
  const vencimiento = {
    expirarPendientes: async () => 0,
    rechazarPago: async (id) => repositorio.buscarPorId(id),
  };
  const creacion = new ReservaCreacionService(
    config,
    { ejecutar: (operacion) => operacion({ reservas: repositorio, fechas }) },
    repositorio,
    disponibilidad,
    usuarios,
    publicaciones,
    vencimiento,
  );
  const reservas = new ReservasService(
    { ejecutar: (operacion) => operacion({ reservas: repositorio, fechas }) },
    repositorio,
    disponibilidad,
    publicaciones,
    { enviarConfirmacion: async () => {} },
    reservaEstado,
    reservaCiclo,
    vencimiento,
    creacion,
  );
  const presupuestos = new PresupuestosService(
    { obtenerVigente: async () => ({ ...cotizacion }) },
    publicaciones, disponibilidad, new JwtService(), config,
  );
  const repositorioPagos = {
    crear: (datos) => Object.assign(new Pago(), datos),
    guardar: async (pago) => {
      if (!estado.pagos.includes(pago)) estado.pagos.push(pago);
      return pago;
    },
    buscarPorId: async (id) => estado.pagos.find(p => p.id === id),
    buscarPorReferencia: async (referencia) => estado.pagos.find(p => p.external_reference === referencia),
    buscarPorReserva: async (idReserva) => estado.pagos.find(p => p.reserva?.id === idReserva),
    actualizarEstado: async (id, cambios) => {
      const pago = estado.pagos.find(p => p.id === id) ?? estado.pagos[0];
      if (pago) Object.assign(pago, cambios);
    },
  };
  const pagosCore = new PagosService(repositorioPagos);
  const pasarela = {
    validarConfiguracionCheckout: () => {},
    crearCheckout: async (reserva, referencia, clave, currency) => {
      estado.checkouts.push({ amount: reserva.monto_pago, currency });
      return { id: 'preferencia-prueba', url: 'https://example.invalid/pago' };
    },
    validarWebhook: () => {},
    consultarPago: async () => estado.pagoExterno,
  };
  const reembolsos = {
    registrarDesdeWebhook: async () => ({}),
    registrarManual: async () => ({}),
    tieneReembolsoTotalAprobado: async () => false,
  };
  const disputas = { registrarContracargo: async () => ({}) };
  const cancelaciones = { aplicarReembolsoConfirmado: async () => ({}) };
  const checkout = new CheckoutService(
    presupuestos, reservas, pagosCore, config, pasarela,
  );
  const webhook = new PagosWebhookService(
    pagosCore, reservas, cancelaciones, reembolsos, disputas, pasarela, reservaEstado,
  );
  webhook.logger = { warn: () => {} };
  const pagos = {
    crearCheckout: (...args) => checkout.crearCheckout(...args),
    procesarWebhook: (...args) => webhook.procesarWebhook(...args),
  };
  return { publicacion, cotizacion, estado, presupuestos, reservas, pagos };
}

function sinOperaciones(estado) {
  assert.equal(estado.reservas.length, 0);
  assert.equal(estado.pagos.length, 0);
  assert.equal(estado.checkouts.length, 0);
}

test('bloquear impide nuevos presupuestos y checkout con presupuesto anterior', async () => {
  const e = escenario();
  const presupuesto = await e.presupuestos.cotizar(solicitud, USUARIO);
  e.publicacion.anunciante.usuario.bloqueado = true;
  await assert.rejects(e.presupuestos.cotizar(solicitud, USUARIO), /no admite reservas/);
  await assert.rejects(
    e.pagos.crearCheckout({ ...solicitud, presupuesto_token: presupuesto.token }, USUARIO),
    /no está disponible/,
  );
  sinOperaciones(e.estado);
});

for (const token of [undefined, null, '', 123]) {
  test(`checkout rechaza presupuesto ausente o invalido: ${token}`, async () => {
    const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });
    await assert.rejects(
      pipe.transform({ ...solicitud, presupuesto_token: token }, { type: 'body', metatype: CrearCheckoutDto }),
      (error) => error.getStatus() === 400,
    );
  });
}

for (const moneda of ['ARS', 'USD']) {
  test(`${moneda}: no permite omitir el presupuesto ni llamando al servicio`, async () => {
    const e = escenario(moneda);
    await assert.rejects(e.pagos.crearCheckout(solicitud, USUARIO), /presupuesto/);
    await assert.rejects(e.reservas.crearPendiente(solicitud, USUARIO), /presupuesto/);
    sinOperaciones(e.estado);
  });

  for (const cambio of ['aumento', 'disminucion', 'moneda']) {
    test(`${moneda}: ${cambio} antes de pagar exige aceptar otro presupuesto`, async () => {
      const e = escenario(moneda);
      const presupuesto = await e.presupuestos.cotizar(solicitud, USUARIO);
      if (cambio === 'moneda') e.publicacion.tipoMoneda.nombre = moneda === 'ARS' ? 'USD' : 'ARS';
      else e.publicacion.precio *= cambio === 'aumento' ? 2 : 0.5;
      await assert.rejects(
        e.pagos.crearCheckout({ ...solicitud, presupuesto_token: presupuesto.token }, USUARIO),
        /precio o la moneda cambiaron/,
      );
      sinOperaciones(e.estado);
      const actualizado = await e.presupuestos.cotizar(solicitud, USUARIO);
      await e.pagos.crearCheckout({ ...solicitud, presupuesto_token: actualizado.token }, USUARIO);
      assert.equal(e.estado.reservas[0].importe_contratado, Number(actualizado.total_cobro));
    });
  }

  test(`${moneda}: rechaza presupuesto al alcanzar su vencimiento`, async (t) => {
    const e = escenario(moneda);
    const presupuesto = await e.presupuestos.cotizar(solicitud, USUARIO);
    t.mock.timers.setTime(new Date(presupuesto.vence_en).getTime());
    await assert.rejects(
      e.pagos.crearCheckout({ ...solicitud, presupuesto_token: presupuesto.token }, USUARIO),
      /presupuesto/,
    );
    sinOperaciones(e.estado);
  });

  test(`${moneda}: conserva condiciones al aprobar aunque cambie la publicacion`, async (t) => {
    const e = escenario(moneda);
    const presupuesto = await e.presupuestos.cotizar(solicitud, USUARIO);
    t.mock.timers.setTime(AHORA + 60000);
    await e.pagos.crearCheckout({ ...solicitud, presupuesto_token: presupuesto.token }, USUARIO);
    const reserva = e.estado.reservas[0];
    assert.equal(reserva.precio_unitario_contratado, Number(presupuesto.precio_unitario_origen));
    assert.equal(reserva.moneda_origen, moneda);
    assert.equal(reserva.importe_origen, Number(presupuesto.total_origen));
    assert.equal(reserva.importe_contratado, Number(presupuesto.total_cobro));
    assert.equal(reserva.moneda_contratada, 'ARS');
    assert.equal(reserva.cotizacion_dolar?.id ?? null, moneda === 'USD' ? 10 : null);
    assert.equal(reserva.cotizacion_aceptada_en.getTime(), AHORA + 60000);
    assert.equal(reserva.presupuesto_emitido_en.toISOString(), presupuesto.emitida_en);
    assert.equal(reserva.presupuesto_vence_en.toISOString(), presupuesto.vence_en);
    assert.equal(reserva.pago_vencimiento.toISOString(), presupuesto.vence_en);
    const historico = JSON.stringify([
      reserva.precio_unitario_contratado, reserva.moneda_origen, reserva.importe_origen,
      reserva.importe_contratado, reserva.moneda_contratada, reserva.cotizacion_dolar,
    ]);
    e.publicacion.precio *= 3;
    e.publicacion.tipoMoneda.nombre = moneda === 'ARS' ? 'USD' : 'ARS';
    e.cotizacion.venta = '2000.000000';
    e.cotizacion.id = 11;
    e.estado.pagoExterno = {
      id: 123, external_reference: `reserva:${reserva.id}`, status: 'approved',
      transaction_amount: Number(presupuesto.total_cobro), currency_id: 'ARS',
      date_approved: new Date().toISOString(),
    };
    await e.pagos.procesarWebhook({ dataId: '123' });
    assert.equal(reserva.estado_pago, 'APROBADO');
    assert.equal(JSON.stringify([
      reserva.precio_unitario_contratado, reserva.moneda_origen, reserva.importe_origen,
      reserva.importe_contratado, reserva.moneda_contratada, reserva.cotizacion_dolar,
    ]), historico);
  });
}

test('USD: una variacion del dolar no invalida la conversion de un presupuesto vigente', async () => {
  const e = escenario('USD');
  const presupuesto = await e.presupuestos.cotizar(solicitud, USUARIO);
  e.cotizacion.venta = '2000.000000';
  e.cotizacion.id = 11;
  await e.pagos.crearCheckout({ ...solicitud, presupuesto_token: presupuesto.token }, USUARIO);
  assert.equal(e.estado.reservas[0].importe_contratado, 180000);
  assert.equal(e.estado.reservas[0].cotizacion_dolar.id, 10);
});

for (const cambio of ['precio', 'moneda', 'vencimiento', 'bloqueo']) {
  test(`revalida ${cambio} despues de esperar el bloqueo del calendario`, async (t) => {
    const e = escenario();
    const presupuesto = await e.presupuestos.cotizar(solicitud, USUARIO);
    e.estado.alBloquear = () => {
      if (cambio === 'precio') e.publicacion.precio = 200;
      if (cambio === 'moneda') e.publicacion.tipoMoneda.nombre = 'USD';
      if (cambio === 'bloqueo') e.publicacion.anunciante.usuario.bloqueado = true;
      if (cambio === 'vencimiento') t.mock.timers.setTime(new Date(presupuesto.vence_en).getTime());
    };
    await assert.rejects(
      e.pagos.crearCheckout({ ...solicitud, presupuesto_token: presupuesto.token }, USUARIO),
      (error) => error.getStatus() === 409,
    );
    sinOperaciones(e.estado);
  });
}

for (const diferencia of [{ transaction_amount: 301 }, { currency_id: 'USD' }]) {
  test(`pago con ${Object.keys(diferencia)[0]} diferente no confirma la reserva`, async () => {
    const e = escenario();
    const presupuesto = await e.presupuestos.cotizar(solicitud, USUARIO);
    await e.pagos.crearCheckout({ ...solicitud, presupuesto_token: presupuesto.token }, USUARIO);
    e.estado.pagoExterno = {
      id: 123, external_reference: 'reserva:1', status: 'approved',
      transaction_amount: 300, currency_id: 'ARS', ...diferencia,
    };
    await assert.rejects(e.pagos.procesarWebhook({ dataId: '123' }), (error) => error.getStatus() === 400);
    assert.equal(e.estado.reservas[0].estado_pago, 'PENDIENTE');
  });
}


test('un pago aprobado después de bloquear al anunciante no confirma la reserva', async () => {
  const e = escenario();
  const presupuesto = await e.presupuestos.cotizar(solicitud, USUARIO);
  await e.pagos.crearCheckout(
    { ...solicitud, presupuesto_token: presupuesto.token },
    USUARIO,
  );
  const reserva = e.estado.reservas[0];
  e.publicacion.anunciante.usuario.bloqueado = true;
  e.estado.pagoExterno = {
    id: 123,
    external_reference: `reserva:${reserva.id}`,
    status: 'approved',
    transaction_amount: 300,
    currency_id: 'ARS',
    date_approved: new Date().toISOString(),
  };
  await e.pagos.procesarWebhook({ dataId: '123' });
  assert.equal(reserva.cancelada, true);
  assert.equal(reserva.estado_pago, 'APROBADO');
  assert.equal(reserva.estado_liquidacion, 'EN_REVISION');
});

test('un pago tardío no reactiva una reserva cancelada por bloqueo', async () => {
  const e = escenario();
  const reserva = Object.assign(new Reserva(), {
    id: 99,
    estado_pago: 'CANCELADO',
    estado_liquidacion: 'NO_APLICA',
    cancelada: true,
    cancelada_por: 'ADMINISTRADOR',
    motivo_cancelacion:
      'Bloqueo de cuenta del anunciante: Fraude',
    fecha_inicio: '2030-02-10',
    fecha_fin: '2030-02-12',
    monto_pago: 100,
    publicacion: e.publicacion,
    usuario: { id: USUARIO },
  });
  e.estado.reservas.push(reserva);

  await e.reservas.confirmarPago(99, new Date('2030-02-11T12:00:00Z'));

  assert.equal(reserva.cancelada, true);
  assert.equal(reserva.cancelada_por, 'ADMINISTRADOR');
  assert.equal(reserva.estado_pago, 'APROBADO');
  assert.equal(reserva.estado_liquidacion, 'EN_REVISION');
  assert.match(reserva.observacion_liquidacion, /bloqueo/i);
});

test('un pago aprobado con la cuenta del anunciante inactiva pasa a revisión', async () => {
  const e = escenario();
  e.publicacion.anunciante.usuario.activa = false;
  const reserva = Object.assign(new Reserva(), {
    id: 98,
    estado_pago: 'PENDIENTE',
    estado_liquidacion: 'NO_APLICA',
    cancelada: false,
    finalizada: false,
    fecha_inicio: '2030-02-10',
    fecha_fin: '2030-02-12',
    monto_pago: 100,
    publicacion: e.publicacion,
    usuario: { id: USUARIO },
  });
  e.estado.reservas.push(reserva);

  await e.reservas.confirmarPago(98, new Date('2030-02-01T12:00:00Z'));

  assert.equal(reserva.cancelada, true);
  assert.equal(reserva.estado_pago, 'APROBADO');
  assert.equal(reserva.estado_liquidacion, 'EN_REVISION');
  assert.match(reserva.observacion_liquidacion, /inactivo/i);
});

test('un webhook tardío no reactiva tras desbloquear una reserva cancelada por bloqueo', async () => {
  const e = escenario();
  const reserva = Object.assign(new Reserva(), {
    id: 99,
    estado_pago: 'CANCELADO',
    estado_liquidacion: 'NO_APLICA',
    cancelada: true,
    cancelada_por: 'ADMINISTRADOR',
    motivo_cancelacion:
      'Bloqueo de cuenta del anunciante: Fraude',
    fecha_inicio: '2030-02-10',
    fecha_fin: '2030-02-12',
    monto_pago: 100,
    publicacion: e.publicacion,
    usuario: { id: USUARIO },
  });
  e.estado.reservas.push(reserva);
  const pago = Object.assign(new Pago(), {
    id: 10,
    external_reference: 'reserva:99',
    amount: 100,
    currency: 'ARS',
    status: 'pending',
    reserva,
  });
  e.estado.pagos.push(pago);
  e.publicacion.anunciante.usuario.bloqueado = false;
  e.estado.pagoExterno = {
    id: 123,
    external_reference: 'reserva:99',
    status: 'approved',
    transaction_amount: 100,
    currency_id: 'ARS',
    date_approved: new Date('2030-02-11T12:00:00Z').toISOString(),
  };

  await e.pagos.procesarWebhook({ dataId: '123' });

  assert.equal(reserva.cancelada, true);
  assert.equal(reserva.estado_pago, 'APROBADO');
  assert.equal(reserva.estado_liquidacion, 'EN_REVISION');
  assert.match(reserva.observacion_liquidacion, /bloqueo/i);
});
