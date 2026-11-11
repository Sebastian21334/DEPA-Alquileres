require('reflect-metadata');
const assert = require('node:assert/strict');
const { test, beforeEach } = require('node:test');
const { ValidationPipe } = require('@nestjs/common');
const { JwtService } = require('@nestjs/jwt');
const { CrearCheckoutDto } = require('../dist/pagos/dto/crear-checkout.dto');
const { PresupuestosService } = require('../dist/pagos/service/presupuestos.service');
const { PagosService } = require('../dist/pagos/service/pagos.service');
const { ReservasService } = require('../dist/reservas/service/reservas.service');
const { Reserva } = require('../dist/reservas/entity/reserva.entity');
const { Pago } = require('../dist/pagos/entity/pago.entity');
const { PublicacionesService } = require('../dist/publicaciones/service/publicaciones.service');
const { CatalogosService } = require('../dist/catalogos/service/catalogos.service');
const { ReservaEstadoService } = require('../dist/reservas-consulta/service/reserva-estado.service');

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
  const publicaciones = new PublicacionesService({
    buscarPorId: async () => ({ ...publicacion, tipoMoneda: { ...publicacion.tipoMoneda } }),
    buscarCondicionesDeReserva: async () => ({ ...publicacion, tipoMoneda: { ...publicacion.tipoMoneda } }),
    bloquearPorId: async () => { estado.alBloquear(); return true; },
  }, new CatalogosService());
  const repositorio = {
    conTransaccion: (operacion) => operacion(repositorio, {}),
    buscarPendientesVencidas: async () => [],
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
  const disponibilidad = {
    verificarDisponibilidad: async () => true,
    marcarComoReservadas: async () => {},
  };
  const reservas = new ReservasService(
    config,
    repositorio,
    disponibilidad,
    { buscarPorId: async () => ({ nombre: 'Prueba', apellido: 'Reserva' }) },
    publicaciones,
    { enviarConfirmacion: async () => {} },
    { crearSolicitud: async () => ({}) },
    new ReservaEstadoService(publicaciones),
  );
  const presupuestos = new PresupuestosService(
    { obtenerVigente: async () => ({ ...cotizacion }) },
    publicaciones, disponibilidad, new JwtService(), config,
  );
  const pagos = new PagosService(
    presupuestos,
    {
      crear: (datos) => Object.assign(new Pago(), datos),
      guardar: async (pago) => {
        if (!estado.pagos.includes(pago)) estado.pagos.push(pago);
        return pago;
      },
      buscarPorReferencia: async (referencia) => estado.pagos.find(p => p.external_reference === referencia),
    },
    reservas,
    { registrarDesdeWebhook: async () => ({}), registrarManual: async () => ({}) },
    { registrarContracargo: async () => ({}) },
    config,
    {
      validarConfiguracionCheckout: () => {},
      crearCheckout: async (reserva, referencia, clave, currency) => {
        estado.checkouts.push({ amount: reserva.monto_pago, currency });
        return { id: 'preferencia-prueba', url: 'https://example.invalid/pago' };
      },
      validarWebhook: () => {},
      consultarPago: async () => estado.pagoExterno,
    },
  );
  pagos.logger = { warn: () => {} };
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

test('eliminar impide nuevos presupuestos y checkout incluso con presupuesto anterior', async () => {
  const e = escenario();
  const presupuesto = await e.presupuestos.cotizar(solicitud, USUARIO);
  e.publicacion.eliminada = true;
  await assert.rejects(e.presupuestos.cotizar(solicitud, USUARIO), /no admite reservas/);
  await assert.rejects(
    e.pagos.crearCheckout({ ...solicitud, presupuesto_token: presupuesto.token }, USUARIO),
    /no está disponible/,
  );
  sinOperaciones(e.estado);
});

test('eliminar entre cotización y bloqueo transaccional impide crear la reserva', async () => {
  const e = escenario();
  const presupuesto = await e.presupuestos.cotizar(solicitud, USUARIO);
  e.estado.alBloquear = () => { e.publicacion.eliminada = true; };
  await assert.rejects(
    e.pagos.crearCheckout({ ...solicitud, presupuesto_token: presupuesto.token }, USUARIO),
    /publicación cambió/,
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
    // El bloqueo posterior no impide conciliar una operación ya iniciada.
    e.publicacion.anunciante.usuario.bloqueado = true;
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
