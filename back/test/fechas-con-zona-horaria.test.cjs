require('reflect-metadata');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { readFileSync, readdirSync } = require('node:fs');
const path = require('node:path');
const { getMetadataArgsStorage } = require('typeorm');

const MIGRACION = readFileSync(path.join(__dirname, '../migrations/20261123-fechas-con-zona-horaria.sql'), 'utf8');

function archivosDeEntidades(directorio) {
  return readdirSync(directorio, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = path.join(directorio, entrada.name);
    if (entrada.isDirectory()) return archivosDeEntidades(ruta);
    return entrada.name.endsWith('.entity.js') ? [ruta] : [];
  });
}

test('ninguna entidad guarda fechas con hora sin zona horaria', () => {
  archivosDeEntidades(path.join(__dirname, '../dist')).forEach((archivo) => require(archivo));
  const sinZona = getMetadataArgsStorage().columns
    .filter((columna) => columna.options.type === 'timestamp')
    .map((columna) => `${columna.target.name}.${columna.propertyName}`);
  assert.deepEqual(sinZona, []);
});

test('la migración convierte cada fecha según quién la guardó y se puede repetir', async () => {
  const { PGlite } = require('@electric-sql/pglite');
  const base = new PGlite();
  const utc = async (sql) => (await base.query(sql)).rows;
  try {
    await base.exec(`
      CREATE TABLE reclamo_reserva (id int PRIMARY KEY, creado_en timestamp NOT NULL DEFAULT now(), resuelto_en timestamp);
      CREATE TABLE solicitud_cancelacion (id int PRIMARY KEY, creada_en timestamp NOT NULL DEFAULT now(), decidida_en timestamp);
      CREATE TABLE reserva (id int PRIMARY KEY, cotizacion_aceptada_en timestamptz, presupuesto_emitido_en timestamptz, fecha_pago timestamp, fecha_cancelacion timestamp);
      CREATE TABLE mensaje (id int PRIMARY KEY, fecha timestamp NOT NULL);
      -- 1: resuelto por un backend en Argentina (leído en UTC queda antes de crearse).
      -- 2: resuelto por un backend en UTC. 3: sin resolver.
      INSERT INTO reclamo_reserva VALUES
        (1, '2026-11-22 23:38:36.980818', '2026-11-22 20:39:25.197'),
        (2, '2026-11-23 19:34:10.43283', '2026-11-23 19:37:49.88'),
        (3, '2026-11-23 10:00:00.123456', NULL);
      -- 1: creada por la base y decidida en UTC. 2: creada y decidida por un backend en Argentina.
      INSERT INTO solicitud_cancelacion VALUES
        (1, '2026-11-14 18:05:07.971948', '2026-11-14 18:05:32.527'),
        (2, '2026-11-21 02:17:23.568', '2026-11-21 02:46:07.759');
      -- El pago llega después de aceptar el presupuesto: 1 lo guardó un backend en UTC y 2 uno en Argentina.
      -- 3 no tiene referencia y se toma como hora argentina.
      INSERT INTO reserva VALUES
        (1, '2026-11-20 15:00:00+00', '2026-11-20 14:00:00+00', '2026-11-20 15:05:00.5', '2026-11-20 14:30:00'),
        (2, '2026-11-20 15:00:00+00', '2026-11-20 14:00:00+00', '2026-11-20 12:05:00.5', '2026-11-20 10:30:00'),
        (3, NULL, NULL, '2026-11-20 12:05:00', NULL);
      INSERT INTO mensaje VALUES (1, '2026-11-20 10:00:00');`);

    await base.exec(MIGRACION);
    const reclamos = `SELECT id, (creado_en AT TIME ZONE 'UTC')::text AS creado, (resuelto_en AT TIME ZONE 'UTC')::text AS resuelto FROM reclamo_reserva ORDER BY id`;
    const esperados = [
      { id: 1, creado: '2026-11-22 23:38:36.980818', resuelto: '2026-11-22 23:39:25.197' },
      { id: 2, creado: '2026-11-23 19:34:10.43283', resuelto: '2026-11-23 19:37:49.88' },
      { id: 3, creado: '2026-11-23 10:00:00.123456', resuelto: null },
    ];
    assert.deepEqual(await utc(reclamos), esperados);
    assert.deepEqual(await utc(`SELECT id, (creada_en AT TIME ZONE 'UTC')::text AS creada, (decidida_en AT TIME ZONE 'UTC')::text AS decidida FROM solicitud_cancelacion ORDER BY id`), [
      { id: 1, creada: '2026-11-14 18:05:07.971948', decidida: '2026-11-14 18:05:32.527' },
      { id: 2, creada: '2026-11-21 05:17:23.568', decidida: '2026-11-21 05:46:07.759' },
    ]);
    assert.deepEqual(await utc(`SELECT id, (fecha_pago AT TIME ZONE 'UTC')::text AS pago, (fecha_cancelacion AT TIME ZONE 'UTC')::text AS cancelacion FROM reserva ORDER BY id`), [
      { id: 1, pago: '2026-11-20 15:05:00.5', cancelacion: '2026-11-20 14:30:00' },
      { id: 2, pago: '2026-11-20 15:05:00.5', cancelacion: '2026-11-20 13:30:00' },
      { id: 3, pago: '2026-11-20 15:05:00', cancelacion: null },
    ]);
    assert.deepEqual(await utc(`SELECT (fecha AT TIME ZONE 'UTC')::text AS fecha FROM mensaje`), [{ fecha: '2026-11-20 13:00:00' }]);

    await base.exec(MIGRACION);
    assert.deepEqual(await utc(reclamos), esperados);
    assert.deepEqual(await utc(`SELECT DISTINCT data_type FROM information_schema.columns WHERE table_schema = 'public' AND column_name IN ('creado_en', 'resuelto_en', 'creada_en', 'decidida_en', 'fecha_pago', 'fecha_cancelacion', 'fecha')`), [{ data_type: 'timestamp with time zone' }]);

    // La fecha que completa la base sigue siendo el instante actual.
    await base.exec('INSERT INTO reclamo_reserva (id) VALUES (4)');
    assert.deepEqual(await utc(`SELECT abs(extract(epoch FROM creado_en - now())) < 5 AS actual FROM reclamo_reserva WHERE id = 4`), [{ actual: true }]);
  } finally {
    await base.close();
  }
});
