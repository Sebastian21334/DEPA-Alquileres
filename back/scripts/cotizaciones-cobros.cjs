const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL');
  const destino = new URL(process.env.DATABASE_URL);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(destino.hostname);
  const client = new Client({ connectionString: destino.toString(), ...(local ? {} : { ssl: { rejectUnauthorized: false } }) });
  await client.connect();
  try {
    if (!process.argv.includes('--aplicar')) {
      const { rows: monedas } = await client.query(`SELECT m.nombre, count(*)::int AS publicaciones
        FROM publicacion p LEFT JOIN tipo_moneda m ON m.id_tipo_moneda = p.id_tipo_moneda GROUP BY m.nombre ORDER BY m.nombre`);
      const { rows: [estado] } = await client.query(`SELECT to_regclass('cotizacion_dolar') IS NOT NULL AS cotizaciones,
        to_regclass('consulta_cotizacion') IS NOT NULL AS consultas`);
      console.log(JSON.stringify({ monedas, estado, aplicacion: 'Con el backend detenido, usar --aplicar. No consulta al proveedor ni modifica pagos históricos.' }));
      return;
    }
    await client.query('BEGIN');
    try {
      await client.query("SET LOCAL lock_timeout = '10s'");
      await client.query(fs.readFileSync(path.join(__dirname, '..', 'migrations', '20261027-cotizaciones-cobros.sql'), 'utf8'));
      await client.query('COMMIT');
      console.log('Cotizaciones y trazabilidad de conversiones preparadas; pagos históricos conservados.');
    } catch (error) { await client.query('ROLLBACK'); throw error; }
  } finally { await client.end(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
