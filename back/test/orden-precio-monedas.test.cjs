require('reflect-metadata');
const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const { crearPostgresPruebas } = require('./soporte/postgres-pruebas.cjs');
const { catalogosDePrueba } = require('./soporte/catalogos-pruebas.cjs');
const { PublicacionesService } = require('../dist/publicaciones/service/publicaciones.service');
const { PublicacionesRepository } = require('../dist/publicaciones/repository/publicaciones.repository');
const { CotizacionesLecturaService } = require('../dist/cotizaciones/service/cotizaciones-lectura.service');
const { CotizacionRepository } = require('../dist/cotizaciones/repository/cotizacion.repository');
const { Publicacion } = require('../dist/publicaciones/entity/publicacion.entity');
const { Reserva } = require('../dist/reservas/entity/reserva.entity');
const { CotizacionDolar } = require('../dist/cotizaciones/entity/cotizacion-dolar.entity');

let base, servicio;
const ARS = 10, USD = 11;
const ids = async (filtros) => (await servicio.listarActivas(1, 12, undefined, filtros)).datos.map(({ id }) => id);

before(async () => {
  base = await crearPostgresPruebas();
  const { db, source } = base;
  // Precios: 1 → $1.000, 2 → US$1, 3 → $2.000, 4 → US$2.
  await db.exec(`
    INSERT INTO rol (id_rol, nombre) VALUES (1, 'Anunciante');
    INSERT INTO usuario (id_usuario, nombre, apellido, email, telefono, contrasenia, id_rol)
      VALUES (1, 'Uno', 'Prueba', 'uno@example.invalid', '123', 'hash', 1);
    INSERT INTO anunciante (id_usuario, numero_contacto, verificado) VALUES (1, '123', true);
    INSERT INTO modalidad (id_modalidad, nombre, permite_reservas_por_fecha) VALUES (1, 'Temporal', true);
    INSERT INTO tipo_moneda (id_tipo_moneda, nombre) VALUES (${ARS}, 'Peso (ARS)'), (${USD}, 'Dólar (USD)');
    INSERT INTO publicacion (id_publicacion, titulo, descripcion, fecha_publicacion, precio, direccion,
      cantidad_ambientes, superficie, id_anunciante, id_modalidad, id_tipo_moneda, activa)
      VALUES (1, 'Casa 1', 'Prueba', CURRENT_DATE, 1000, 'Calle 1', 1, 30, 1, 1, ${ARS}, true),
        (2, 'Casa 2', 'Prueba', CURRENT_DATE, 1, 'Calle 1', 1, 30, 1, 1, ${USD}, true),
        (3, 'Casa 3', 'Prueba', CURRENT_DATE, 2000, 'Calle 1', 1, 30, 1, 1, ${ARS}, true),
        (4, 'Casa 4', 'Prueba', CURRENT_DATE, 2, 'Calle 1', 1, 30, 1, 1, ${USD}, true);
    INSERT INTO imagen (id_imagen, id_publicacion, url)
      SELECT n, n, 'https://example.invalid/foto.jpg' FROM generate_series(1, 4) AS n;
  `);
  const catalogos = catalogosDePrueba({
    getTiposMoneda: async () => [{ id: ARS, nombre: 'Peso (ARS)' }, { id: USD, nombre: 'Dólar (USD)' }],
  });
  const cotizaciones = new CotizacionesLecturaService(new CotizacionRepository(source.getRepository(CotizacionDolar)));
  const repositorio = new PublicacionesRepository(source.getRepository(Publicacion), source.getRepository(Reserva));
  servicio = new PublicacionesService(repositorio, catalogos, undefined, undefined, undefined, undefined, cotizaciones);
});

after(async () => { if (base) await base.cerrar(); });

test('sin cotización registrada, el precio se ordena por su número', async () => {
  assert.deepEqual(await ids({ orden: 'precio-menor' }), [2, 4, 1, 3]);
});

test('con cotización, los precios en USD se ordenan convertidos a pesos', async () => {
  await base.db.exec(`INSERT INTO cotizacion_dolar (compra, venta, tipo, proveedor, actualizada_fuente_en)
    VALUES (1480, 1500, 'blue', 'prueba', now())`);
  assert.deepEqual(await ids({ orden: 'precio-menor' }), [1, 2, 3, 4]);
  assert.deepEqual(await ids({ orden: 'precio-mayor' }), [4, 3, 2, 1]);
  // La conversión solo ordena: el filtro de precio compara importes de la moneda elegida.
  assert.deepEqual(await ids({ orden: 'precio-menor', idsTipoMoneda: [USD], precioMax: 1500 }), [2, 4]);
  assert.deepEqual(await ids({ orden: 'precio-menor', idsTipoMoneda: [ARS], precioMax: 1500 }), [1]);
});
