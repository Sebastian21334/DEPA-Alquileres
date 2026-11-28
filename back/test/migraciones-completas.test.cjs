require('reflect-metadata');
const assert = require('node:assert/strict');
const { before, test } = require('node:test');
const { readdirSync } = require('node:fs');
const { PGlite } = require('@electric-sql/pglite');
const { ORDEN, CONSOLIDADAS, REEMPLAZADAS } = require('../scripts/migraciones/orden.cjs');
const { construirEsperado, fotografiar, comparar, normalizarExpresion, leerMigracion, CARPETA_MIGRACIONES } = require('../scripts/migraciones/esquema.cjs');
const { migrarPendientes } = require('../scripts/migrar.cjs');
const { crearPostgresPruebas } = require('./soporte/postgres-pruebas.cjs');

const SIN_DIFERENCIAS = { errores: [], advertencias: [], pendientes: [] };
let esperado;

before(async () => {
  esperado = await construirEsperado();
});

/** Base en memoria con las migraciones indicadas y un cliente con la forma de `pg`. */
async function conBase(migraciones, prueba) {
  const db = new PGlite();
  try {
    for (const nombre of migraciones) {
      await db.exec('SET search_path TO public');
      await db.exec(leerMigracion(nombre));
    }
    const cliente = { query: async (sql) => ({ rows: (await db.exec(sql)).at(-1)?.rows ?? [] }) };
    await prueba({ db, cliente, foto: () => fotografiar(async (sql) => (await cliente.query(sql)).rows) });
  } finally {
    await db.close();
  }
}

test('cada archivo de migrations está en el orden o clasificado como consolidado o reemplazado', () => {
  const archivos = readdirSync(CARPETA_MIGRACIONES).filter((archivo) => archivo.endsWith('.sql')).sort();
  const clasificadas = [...ORDEN, ...CONSOLIDADAS, ...Object.keys(REEMPLAZADAS)];
  assert.equal(new Set(clasificadas).size, clasificadas.length);
  assert.deepEqual([...clasificadas].sort(), archivos);
});

test('las migraciones consolidadas ya están incluidas en el esquema inicial', async () => {
  await conBase([...ORDEN, ...CONSOLIDADAS], async ({ foto }) => {
    assert.deepEqual(comparar(esperado, await foto()), SIN_DIFERENCIAS);
  });
});

test('la base de pruebas tiene el esquema de todas las migraciones y cubre las entidades', async () => {
  const { db, source, cerrar } = await crearPostgresPruebas();
  try {
    assert.deepEqual(comparar(esperado, await fotografiar(async (sql) => (await db.query(sql)).rows)), SIN_DIFERENCIAS);
    // TypeORM también propone retirar índices y restricciones que solo declara el SQL: interesan las tablas, columnas y tipos que falten.
    await db.exec('SET search_path TO public');
    await db.exec('CREATE TABLE IF NOT EXISTS typeorm_metadata ("type" varchar NOT NULL, "database" varchar, "schema" varchar, "table" varchar, "name" varchar, "value" text)');
    const faltantes = (await source.driver.createSchemaBuilder().log()).upQueries
      .map(({ query }) => query.replace(/\s+/g, ' '))
      .filter((query) => /^CREATE TABLE|ADD (COLUMN )?"|ALTER COLUMN "[^"]+" TYPE/.test(query) && !query.includes('ADD CONSTRAINT'));
    assert.deepEqual(faltantes, []);
  } finally {
    await cerrar();
  }
});

test('migrar simula sin guardar, aplica solo las migraciones que faltan y la segunda vez no aplica nada', async () => {
  const faltantes = ['20261122-comision-depa.sql', '20261123-fechas-con-zona-horaria.sql', '20261127-historial-denuncias-resenas.sql'];
  await conBase(ORDEN.filter((nombre) => !faltantes.includes(nombre)), async ({ cliente, foto }) => {
    assert.deepEqual(comparar(esperado, await foto()).pendientes, faltantes);

    const simulacion = await migrarPendientes(cliente, esperado);
    assert.deepEqual([simulacion.aplicadas, simulacion.guardado], [faltantes, false]);
    assert.deepEqual(comparar(esperado, await foto()).pendientes, faltantes);

    const aplicacion = await migrarPendientes(cliente, esperado, { aplicar: true });
    assert.deepEqual([aplicacion.aplicadas, aplicacion.guardado], [faltantes, true]);
    assert.deepEqual(comparar(esperado, await foto()), SIN_DIFERENCIAS);
    assert.deepEqual((await migrarPendientes(cliente, esperado, { aplicar: true })).aplicadas, []);
  });
});

test('lo que no crea ninguna migración es una advertencia y lo que una migración retira es un error', async () => {
  await conBase(ORDEN, async ({ db, foto }) => {
    await db.exec(`ALTER TABLE public.reserva ADD COLUMN columna_manual text;
      ALTER TABLE public.reserva ADD COLUMN fecha_resolucion_liquidacion timestamp`);
    const resultado = comparar(esperado, await foto());
    assert.ok(resultado.advertencias.some(({ descripcion }) => descripcion.startsWith('columna reserva.columna_manual')));
    assert.deepEqual(resultado.pendientes, ['20261113-retirar-liquidacion-de-reserva.sql']);
  });
});

test('la misma expresión escrita por distintas versiones de PostgreSQL se compara igual', () => {
  // Definiciones reales del mismo índice: la de PGlite y la de la base de Neon.
  const pglite = "CREATE UNIQUE INDEX ON public.reclamo_reserva USING btree (id_reserva) WHERE ((id_solicitud_cancelacion IS NOT NULL) AND ((estado)::text = ANY ((ARRAY['ABIERTO'::character varying, 'EN_REVISION'::character varying])::text[])))";
  const neon = "CREATE UNIQUE INDEX ON public.reclamo_reserva USING btree (id_reserva) WHERE ((id_solicitud_cancelacion IS NOT NULL) AND ((estado)::text = ANY (ARRAY[('ABIERTO'::character varying)::text, ('EN_REVISION'::character varying)::text])))";
  assert.equal(normalizarExpresion(pglite), normalizarExpresion(neon));
  assert.notEqual(normalizarExpresion(pglite), normalizarExpresion(neon.replace("'EN_REVISION'", "'CERRADO'")));
});

test('no vuelve a aplicar el esquema inicial y no guarda nada', async () => {
  await conBase(ORDEN, async ({ db, cliente }) => {
    await db.exec('DROP TABLE public.favorito');
    await assert.rejects(migrarPendientes(cliente, esperado, { aplicar: true }), /esquema inicial/);
    assert.equal((await db.query("SELECT to_regclass('public.favorito') AS tabla")).rows[0].tabla, null);
  });
});
