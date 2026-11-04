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
          (SELECT count(*) FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'reclamo_reserva') AS reclamo`);
      console.log(JSON.stringify({
        tablas: rows[0],
        aplicacion:
          'Con el backend detenido, usar --aplicar. La migración es repetible y no modifica pagos existentes.',
      }));
      return;
    }

    await client.query('BEGIN');
    try {
      await client.query("SET LOCAL lock_timeout = '10s'");
      await client.query(
        fs.readFileSync(
          path.join(
            __dirname,
            '..',
            'migrations',
            '20261104-cancelaciones-devoluciones.sql',
          ),
          'utf8',
        ),
      );
      await client.query('COMMIT');
      console.log('Cancelaciones, reembolsos, disputas y reclamos preparados.');
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
