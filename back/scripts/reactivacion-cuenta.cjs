const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { Client } = require('pg');
require('dotenv').config({ path: join(__dirname, '..', '.env'), quiet: true });

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL');
  const url = new URL(process.env.DATABASE_URL);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (!local) {
    for (const parametro of ['sslmode', 'ssl', 'sslnegotiation', 'uselibpqcompat']) {
      url.searchParams.delete(parametro);
    }
  }
  const cliente = new Client({
    connectionString: url.toString(),
    connectionTimeoutMillis: 10000,
    ...(local ? {} : { ssl: { rejectUnauthorized: true } }),
  });
  const sql = readFileSync(join(__dirname, '../migrations/20261120-reactivacion-cuenta.sql'), 'utf8');

  await cliente.connect();
  try {
    await cliente.query('BEGIN');
    await cliente.query("SET LOCAL lock_timeout = '10s'");
    await cliente.query(sql);
    await cliente.query('COMMIT');
    console.log('Migración aplicada. La recuperación de cuentas está disponible.');
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    await cliente.end();
  }
}

main().catch((error) => {
  console.error('No se pudo aplicar la migración:', error.code || error.message);
  process.exitCode = 1;
});
