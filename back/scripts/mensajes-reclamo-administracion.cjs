const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

// Registra desde qué chat se escribió cada mensaje de reclamo y marca los anteriores de Administración. Es reejecutable.
async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL');
  if (!process.argv.includes('--aplicar')) {
    console.log('Usá --aplicar para registrar los mensajes de reclamos escritos desde Administración. Los anteriores se marcan según su autor.');
    return;
  }
  const url = new URL(process.env.DATABASE_URL);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  const client = new Client({ connectionString: url.toString(), ...(local ? {} : { ssl: { rejectUnauthorized: false } }) });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '10s'");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('depa:mensajes-reclamo-administracion'))");
    await client.query(fs.readFileSync(path.join(__dirname, '../migrations/20261125-mensajes-reclamo-administracion.sql'), 'utf8'));
    const { rows: [estado] } = await client.query(`SELECT
        count(*)::int AS mensajes,
        count(*) FILTER (WHERE como_administracion)::int AS desde_administracion
      FROM public.reclamo_mensaje`);
    await client.query('COMMIT');
    console.log(`Migración aplicada. Mensajes de reclamos: ${estado.mensajes}; escritos desde Administración: ${estado.desde_administracion}.`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
