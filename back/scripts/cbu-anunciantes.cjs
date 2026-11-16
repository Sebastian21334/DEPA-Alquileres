const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { Client } = require('pg');
const dotenv = require('dotenv');

async function main() {
  const { DATABASE_URL } = dotenv.parse(readFileSync(join(__dirname, '../.env')));
  if (!DATABASE_URL) throw new Error('Falta DATABASE_URL en back/.env');
  const url = new URL(DATABASE_URL);
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
  await cliente.connect();
  try {
    await cliente.query('BEGIN');
    await cliente.query("SET LOCAL lock_timeout = '10s'");
    await cliente.query("SELECT pg_advisory_xact_lock(hashtext('depa:cbu-anunciantes'))");
    await cliente.query(readFileSync(join(__dirname, '../migrations/20261116-cbu-anunciantes.sql'), 'utf8'));
    const aplicar = process.argv.includes('--aplicar');
    await cliente.query(aplicar ? 'COMMIT' : 'ROLLBACK');
    console.log(aplicar ? 'Migración de CBU aplicada.' : 'Migración de CBU verificada sin guardar cambios.');
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    await cliente.end();
  }
}

main().catch((error) => {
  console.error('No se pudo preparar la migración de CBU:', error.code || 'Revisá back/.env y los permisos de la base.');
  process.exitCode = 1;
});
