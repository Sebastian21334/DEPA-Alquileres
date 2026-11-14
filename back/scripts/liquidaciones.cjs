const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const MIGRACIONES = path.join(__dirname, '..', 'migrations');

function leerMigracion(nombre) {
  return fs.readFileSync(path.join(MIGRACIONES, nombre), 'utf8');
}

async function estadoBase(client) {
  const { rows: [estado] } = await client.query(`
    SELECT
      to_regclass('public.liquidacion') IS NOT NULL AS liquidacion,
      to_regclass('public.estado') IS NOT NULL AS catalogo,
      to_regclass('public.reembolso') IS NOT NULL AS cancelaciones
  `);
  const resumen = { ...estado };
  if (estado.liquidacion) {
    const { rows: [conteo] } = await client.query(`
      SELECT
        count(*)::int AS filas,
        count(*) FILTER (WHERE estado = 'PENDIENTE_PAGO_PROPIETARIO')::int AS pendientes_propietario,
        count(*) FILTER (WHERE estado = 'EN_REVISION')::int AS en_revision
      FROM public.liquidacion
    `);
    Object.assign(resumen, conteo);
  }
  if (estado.catalogo) {
    const { rows: [reservas] } = await client.query(
      'SELECT count(*)::int AS reservas FROM public.reserva',
    );
    resumen.reservas = reservas.reservas;
  }
  return resumen;
}

async function aplicarMigracion(client, nombre) {
  await client.query('BEGIN');
  try {
    await client.query("SET LOCAL lock_timeout = '10s'");
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtext('depa:liquidaciones'))",
    );
    await client.query(leerMigracion(nombre));
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL');
  const url = new URL(process.env.DATABASE_URL);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  const client = new Client({
    connectionString: url.toString(),
    ...(local ? {} : { ssl: { rejectUnauthorized: false } }),
  });
  await client.connect();
  try {
    const estado = await estadoBase(client);
    if (!process.argv.includes('--aplicar')) {
      console.log(JSON.stringify({
        ...estado,
        aplicacion:
          'Con el backend detenido, usar --aplicar. La migración crea la tabla liquidacion y completa una fila por reserva sin modificar reserva.',
      }));
      return;
    }

    // La tabla liquida el catálogo de estados; en bases viejas hay que crearlo primero.
    if (!estado.catalogo) {
      if (!estado.cancelaciones)
        await aplicarMigracion(client, '20261104-cancelaciones-devoluciones.sql');
      await aplicarMigracion(client, '20261110-estados-por-ambito.sql');
    }
    await aplicarMigracion(client, '20261112-liquidaciones.sql');
    await aplicarMigracion(client, '20261113-reconciliar-liquidaciones.sql');
    await aplicarMigracion(client, '20261113-retirar-liquidacion-de-reserva.sql');
    console.log(JSON.stringify({
      aplicada: true,
      ...(await estadoBase(client)),
    }));
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
