const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

// Retira las notas internas de los reclamos: borra las que quedaran, la columna y su catálogo. Es reejecutable.
async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL');
  if (!process.argv.includes('--aplicar')) {
    console.log('Usá --aplicar para retirar las notas internas de los reclamos. Las que queden se borran para no mostrárselas a las partes.');
    return;
  }
  const url = new URL(process.env.DATABASE_URL);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  const client = new Client({ connectionString: url.toString(), ...(local ? {} : { ssl: { rejectUnauthorized: false } }) });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '10s'");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('depa:retirar-notas-internas-reclamo'))");
    const { rows: [columna] } = await client.query(`SELECT count(*)::int AS existe FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'reclamo_mensaje' AND column_name = 'visible_para'`);
    const notas = columna.existe
      ? (await client.query("SELECT count(*)::int AS cantidad FROM public.reclamo_mensaje WHERE visible_para::text = 'ADMIN'")).rows[0].cantidad
      : 0;
    await client.query(fs.readFileSync(path.join(__dirname, '../migrations/20261126-retirar-notas-internas-reclamo.sql'), 'utf8'));
    await client.query('COMMIT');
    console.log(`Migración aplicada. Notas internas borradas: ${notas}.`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
