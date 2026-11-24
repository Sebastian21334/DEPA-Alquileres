const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const MIGRACION = path.join(__dirname, '../migrations/20261123-fechas-con-zona-horaria.sql');

// Pasa las fechas con hora a timestamptz para que no dependan de la zona horaria del backend. Es reejecutable.
async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL');
  const url = new URL(process.env.DATABASE_URL);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  const client = new Client({ connectionString: url.toString(), ...(local ? {} : { ssl: { rejectUnauthorized: false } }) });
  await client.connect();
  try {
    if (!process.argv.includes('--aplicar')) {
      const { rows: [{ pendientes }] } = await client.query("SELECT count(*)::int AS pendientes FROM information_schema.columns WHERE table_schema = 'public' AND data_type = 'timestamp without time zone' AND table_name <> 'disputa'");
      console.log(`Quedan ${pendientes} columnas sin zona horaria. Usá --aplicar para convertirlas a timestamptz.`);
      return;
    }
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '10s'");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('depa:fechas-con-zona-horaria'))");
    await client.query(fs.readFileSync(MIGRACION, 'utf8'));
    await client.query('COMMIT');
    console.log('Migración aplicada. Las fechas con hora quedaron como timestamptz.');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
