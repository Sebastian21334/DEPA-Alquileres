const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

// Guarda en el reclamo el motivo de su resolución y completa los resueltos con devolución. Es reejecutable.
async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL');
  if (!process.argv.includes('--aplicar')) {
    console.log('Usá --aplicar para agregar el motivo de la resolución. Los reclamos resueltos con devolución lo toman del reembolso.');
    return;
  }
  const url = new URL(process.env.DATABASE_URL);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  const client = new Client({ connectionString: url.toString(), ...(local ? {} : { ssl: { rejectUnauthorized: false } }) });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '10s'");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('depa:motivo-resolucion-reclamo'))");
    await client.query(fs.readFileSync(path.join(__dirname, '../migrations/20261124-motivo-resolucion-reclamo.sql'), 'utf8'));
    const { rows: [estado] } = await client.query(`SELECT
        count(*) FILTER (WHERE resolucion IS NOT NULL)::int AS resueltos,
        count(motivo_resolucion)::int AS con_motivo
      FROM public.reclamo_reserva`);
    await client.query('COMMIT');
    console.log(`Migración aplicada. Reclamos resueltos: ${estado.resueltos}; con motivo: ${estado.con_motivo}.`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
