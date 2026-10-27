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
      const { rows: duplicados } = await client.query(`
        SELECT id_publicacion, fecha, count(*)::int AS cantidad,
          array_agg(id_fecha ORDER BY id_fecha) AS ids
        FROM fecha GROUP BY id_publicacion, fecha HAVING count(*) > 1
        ORDER BY id_publicacion, fecha
      `);
      const { rows: [sinPublicacion] } = await client.query(
        'SELECT count(*)::int AS cantidad FROM fecha WHERE id_publicacion IS NULL',
      );
      console.log(JSON.stringify({ duplicados, sinPublicacion: sinPublicacion.cantidad,
        aplicacion: 'Con el backend detenido, usar --aplicar. No se borran ni fusionan datos.' }));
      return;
    }
    await client.query('BEGIN');
    try {
      await client.query("SET LOCAL lock_timeout = '10s'");
      await client.query(fs.readFileSync(path.join(__dirname, '..', 'migrations',
        '20261027-calendario-unico.sql'), 'utf8'));
      await client.query('COMMIT');
      console.log('Unicidad del calendario aplicada; datos conservados.');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } finally {
    await client.end();
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
