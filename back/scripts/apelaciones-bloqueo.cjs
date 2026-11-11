const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
const dotenv = require('dotenv');

async function main() {
  const { DATABASE_URL } = dotenv.parse(fs.readFileSync(path.join(__dirname, '..', '.env')));
  if (!DATABASE_URL) throw new Error('Falta DATABASE_URL en back/.env');

  const client = new Client({ connectionString: DATABASE_URL, connectionTimeoutMillis: 10000 });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '10s'");
    await client.query(fs.readFileSync(path.join(__dirname, '..', 'migrations', '20261111-apelaciones-bloqueo.sql'), 'utf8'));
    await client.query('COMMIT');
    console.log('Migración de apelaciones de bloqueo aplicada.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('No se pudo aplicar la migración:', error.code || error.message);
  process.exitCode = 1;
});
