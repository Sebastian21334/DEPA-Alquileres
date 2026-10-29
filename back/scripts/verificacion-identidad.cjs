const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL');
  const url = new URL(process.env.DATABASE_URL);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  const client = new Client({ connectionString: url.toString(),
    ...(local ? {} : { ssl: { rejectUnauthorized: false } }),
  });
  await client.connect();
  try {
    if (!process.argv.includes('--aplicar')) {
      const { rows } = await client.query(`SELECT table_name, column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = current_schema() AND
          ((table_name = 'solicitud_verificacion' AND column_name LIKE 'prueba_vida_%')
          OR (table_name = 'revision_verificacion' AND column_name = 'id_administrador'))
        ORDER BY table_name, column_name`);
      console.log(JSON.stringify({ columnas: rows,
        aplicacion: 'Con el backend detenido, usar --aplicar. No modifica solicitudes históricas.' }));
      return;
    }
    await client.query('BEGIN');
    try {
      await client.query("SET LOCAL lock_timeout = '10s'");
      await client.query(fs.readFileSync(path.join(__dirname, '..', 'migrations',
        '20261028-verificacion-identidad.sql'), 'utf8'));
      await client.query('COMMIT');
      console.log('Prueba de vida de uso único y auditoría administrativa preparadas.');
    } catch (error) { await client.query('ROLLBACK'); throw error; }
  } finally { await client.end(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
