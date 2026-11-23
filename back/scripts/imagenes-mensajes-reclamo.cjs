const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

// T49: une cada imagen de un reclamo al mensaje del chat con el que se envió. Es reejecutable.
async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL');
  if (!process.argv.includes('--aplicar')) {
    console.log('Usá --aplicar para agregar el mensaje de cada imagen. Las imágenes existentes quedan con la descripción del reclamo.');
    return;
  }
  const url = new URL(process.env.DATABASE_URL);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  const client = new Client({ connectionString: url.toString(), ...(local ? {} : { ssl: { rejectUnauthorized: false } }) });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '10s'");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('depa:imagenes-mensajes-reclamo'))");
    await client.query(fs.readFileSync(path.join(__dirname, '../migrations/20261123-imagenes-mensajes-reclamo.sql'), 'utf8'));
    await client.query('COMMIT');
    console.log('Migración aplicada. Las imágenes anteriores quedan con la descripción del reclamo.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
