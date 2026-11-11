require('reflect-metadata');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { ValidationPipe } = require('@nestjs/common');
const {
  HistorialCotizacionesDto,
} = require('../dist/cotizaciones/dto/historial-cotizaciones.dto');
const {
  DolarApiAdapter,
} = require('../dist/cotizaciones/proveedor/dolar-api.adapter');
const {
  CotizacionesService,
} = require('../dist/cotizaciones/service/cotizaciones.service');

function escenario({ cotizacion = null, consulta = null, datos } = {}) {
  const guardadas = [];
  const filtros = [];
  let intentos = 0;
  const repo = {
    ultima: async () => cotizacion,
    ultimaConsulta: async () => consulta,
    consultas: async () => (consulta ? [consulta] : []),
    async historial(...args) {
      filtros.push(args);
      return { items: guardadas, total: guardadas.length };
    },
    async guardar(valores) {
      cotizacion = { id: 2, ...valores, consultada_en: new Date() };
      guardadas.push(cotizacion);
      return cotizacion;
    },
    async registrarConsulta(exitosa, error) {
      consulta = { id: 2, exitosa, error, realizada_en: new Date() };
    },
    conBloqueo: async (operacion) => operacion(repo),
  };
  const proveedor = {
    async consultar() {
      intentos++;
      return { compra: 1200, venta: 1220, actualizadaEn: new Date(), ...datos };
    },
  };
  return {
    servicio: new CotizacionesService(repo, proveedor, {
      get: () => undefined,
    }),
    guardadas,
    filtros,
    intentos: () => intentos,
  };
}

test('una consulta exitosa reciente no impide renovar una cotización vencida', async () => {
  const anterior = new Date(Date.now() - 4 * 60 * 60 * 1000);
  const { servicio, intentos } = escenario({
    cotizacion: {
      id: 1,
      compra: '1100',
      venta: '1150',
      consultada_en: anterior,
      actualizada_fuente_en: anterior,
    },
    consulta: { realizada_en: new Date(), exitosa: true },
  });
  const antes = await servicio.administracion({ pagina: 1 });
  assert.equal(antes.vigente, false);
  assert.ok(antes.proxima_revision_en.getTime() <= Date.now());
  assert.equal((await servicio.obtenerVigente()).venta, '1220.000000');
  assert.equal((await servicio.administracion({ pagina: 1 })).vigente, true);
  await servicio.obtenerVigente();
  assert.equal(intentos(), 1);
});

test('se rechazan importes que redondean a cero y se registra el intento fallido', async () => {
  const { servicio, guardadas, intentos } = escenario({
    datos: { compra: 0.0000001, venta: 0.0000002 },
  });
  await assert.rejects(servicio.obtenerVigente(), { status: 503 });
  const panel = await servicio.administracion({ pagina: 1 });
  assert.equal(panel.vigente, false);
  assert.equal(panel.consulta.exitosa, false);
  assert.equal(guardadas.length, 0);
  await assert.rejects(servicio.obtenerVigente(), { status: 503 });
  assert.equal(intentos(), 1);
});

test('una cotización histórica en cero se renueva aunque su consulta sea reciente', async () => {
  const ahora = new Date();
  const { servicio, intentos } = escenario({
    cotizacion: {
      id: 1,
      compra: '0.000000',
      venta: '0.000000',
      consultada_en: ahora,
      actualizada_fuente_en: ahora,
    },
    consulta: { realizada_en: ahora, exitosa: true },
  });
  assert.equal((await servicio.administracion({ pagina: 1 })).vigente, false);
  assert.equal((await servicio.obtenerVigente()).venta, '1220.000000');
  assert.equal(intentos(), 1);
});

test('el historial valida los parámetros e incluye el día indicado en hasta', async () => {
  const { servicio, filtros } = escenario();
  const pipe = new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  const validar = (datos) =>
    pipe.transform(datos, {
      type: 'query',
      metatype: HistorialCotizacionesDto,
    });
  await assert.rejects(validar({ desde: '2026-02-30' }), { status: 400 });
  await assert.rejects(validar({ pagina: '0' }), { status: 400 });
  await assert.rejects(
    servicio.administracion({
      desde: '2026-10-16',
      hasta: '2026-10-15',
      pagina: 1,
    }),
    { status: 400 },
  );
  assert.deepEqual(filtros, []);

  const dto = await validar({
    desde: '2026-10-15',
    hasta: '2026-10-15',
    pagina: '2',
  });
  const resultado = await servicio.administracion(dto);
  assert.deepEqual(filtros, [
    [new Date('2026-10-15T03:00:00Z'), new Date('2026-10-16T03:00:00Z'), 2],
  ]);
  assert.equal(resultado.pagina, 2);
});

test('DolarApi admite una respuesta válida de hasta 16 KiB', async (t) => {
  const fecha = '2026-10-15T12:00:00Z';
  const json = JSON.stringify({
    compra: 1200,
    venta: 1220,
    casa: 'blue',
    moneda: 'USD',
    fechaActualizacion: fecha,
  });
  t.mock.method(globalThis, 'fetch', async (url, opciones) => {
    assert.equal(url, 'https://dolarapi.com/v1/dolares/blue');
    assert.equal(opciones.redirect, 'error');
    assert.ok(opciones.signal instanceof AbortSignal);
    return new Response(json.padEnd(16 * 1024, ' '));
  });
  assert.deepEqual(await new DolarApiAdapter().consultar(), {
    compra: 1200,
    venta: 1220,
    actualizadaEn: new Date(fecha),
  });
});

test(
  'DolarApi cancela la lectura al superar el límite de bytes',
  { timeout: 3000 },
  async (t) => {
    let cancelada = false;
    t.mock.method(
      globalThis,
      'fetch',
      async () =>
        new Response(
          new ReadableStream({
            start(lector) {
              lector.enqueue(new Uint8Array(8 * 1024));
              lector.enqueue(new Uint8Array(8 * 1024 + 1));
            },
            cancel() {
              cancelada = true;
            },
          }),
        ),
    );
    await assert.rejects(
      new DolarApiAdapter().consultar(),
      /respuesta demasiado grande/,
    );
    assert.equal(cancelada, true);
  },
);
