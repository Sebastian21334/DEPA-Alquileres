const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

// T44/T56: agrega las columnas del comprobante y la observación de la transferencia al reembolso. Es reejecutable.
async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL');
  if (!process.argv.includes('--aplicar')) {
    console.log('Usá --aplicar para agregar las columnas del comprobante. Los reembolsos existentes quedan sin comprobante.');
    return;
  }
  const url = new URL(process.env.DATABASE_URL);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  const client = new Client({ connectionString: url.toString(), ...(local ? {} : { ssl: { rejectUnauthorized: false } }) });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '10s'");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('depa:comprobante-reembolso'))");
    await client.query(fs.readFileSync(path.join(__dirname, '../migrations/20261123-comprobante-reembolso.sql'), 'utf8'));
    await client.query('COMMIT');
    console.log('Migración aplicada. Los reembolsos anteriores quedan sin comprobante.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
