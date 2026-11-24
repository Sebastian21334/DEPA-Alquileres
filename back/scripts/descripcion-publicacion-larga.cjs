const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

async function main() {
  if (!process.argv.includes('--aplicar')) {
    console.log('Amplía las descripciones de publicaciones a 5000 caracteres. Usar --aplicar para guardar.');
    return;
  }
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL');
  const url = new URL(process.env.DATABASE_URL);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (!local) {
    for (const parametro of ['sslmode', 'ssl', 'sslnegotiation', 'uselibpqcompat']) url.searchParams.delete(parametro);
  }
  const client = new Client({ connectionString: url.toString(), connectionTimeoutMillis: 10000,
    ...(local ? {} : { ssl: { rejectUnauthorized: true } }) });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '10s'");
    await client.query(fs.readFileSync(path.join(__dirname, '..', 'migrations', '20261124-descripcion-publicacion-larga.sql'), 'utf8'));
    await client.query('COMMIT');
    console.log('Descripciones de publicaciones ampliadas a 5000 caracteres.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}
main().catch(error => {
  console.error('No se pudo aplicar la migración:', error.code || 'Revisá la configuración y los permisos de la base.');
  process.exitCode = 1;
});
