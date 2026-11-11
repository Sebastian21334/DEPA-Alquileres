const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

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
    if (!process.argv.includes('--aplicar')) {
      const { rows } = await client.query(`
        SELECT
          (SELECT count(*) FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'reembolso') AS reembolso,
          (SELECT count(*) FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'disputa') AS disputa,
          to_regclass('public.ambito') IS NOT NULL AS ambito,
          to_regclass('public.estado') IS NOT NULL AS estado,
          (SELECT count(*) FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'reclamo_reserva') AS reclamo`);
      console.log(JSON.stringify({
        tablas: rows[0],
        aplicacion:
          'Con el backend detenido, usar --aplicar. La migración de estados por ámbito conserva los códigos existentes.',
      }));
      return;
    }

    await client.query('BEGIN');
    try {
      await client.query("SET LOCAL lock_timeout = '10s'");
      await client.query("SELECT pg_advisory_xact_lock(hashtext('depa:estados-por-ambito'))");
      const { rows: [{ catalogoAplicado }] } = await client.query(`
        SELECT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conrelid = 'public.reserva'::regclass AND conname = 'fk_reserva_estado_pago'
        ) AS "catalogoAplicado"
      `);
      const archivos = catalogoAplicado
        ? ['20261110-estados-por-ambito.sql']
        : ['20261104-cancelaciones-devoluciones.sql', '20261110-estados-por-ambito.sql'];
      for (const archivo of archivos) {
        const sql = fs.readFileSync(path.join(__dirname, '..', 'migrations', archivo), 'utf8');
        await client.query(sql);
      }
      await client.query('COMMIT');
      console.log('Cancelaciones, reembolsos, disputas, reclamos y estados por ámbito preparados.');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
