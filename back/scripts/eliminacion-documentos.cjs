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
      const { rows } = await client.query(`SELECT estado, COUNT(*)::int AS solicitudes,
        COUNT(*) FILTER (WHERE dni_frente_url IS NOT NULL OR dni_dorso_url IS NOT NULL
          OR rostro_url IS NOT NULL OR matricula_url IS NOT NULL
          OR constancia_cuit_url IS NOT NULL)::int AS con_documentos
        FROM solicitud_verificacion GROUP BY estado ORDER BY estado`);
      console.log(JSON.stringify({ solicitudes: rows,
        aplicacion: 'Con el backend detenido, usar --aplicar. Programa la eliminación de adjuntos de solicitudes ya aprobadas o rechazadas.' }));
      return;
    }
    await client.query('BEGIN');
    try {
      await client.query("SET LOCAL lock_timeout = '10s'");
      await client.query(fs.readFileSync(path.join(__dirname, '..', 'migrations',
        '20261105-eliminacion-documentos.sql'), 'utf8'));
      await client.query('COMMIT');
      console.log('Cola documental preparada. El backend procesará los borrados al iniciar.');
    } catch (error) { await client.query('ROLLBACK'); throw error; }
  } finally { await client.end(); }
}
main().catch(() => { console.error('No se pudo preparar la eliminación documental. Revisá la conexión y las migraciones previas.'); process.exitCode = 1; });
