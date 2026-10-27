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
      const { rows } = await client.query(`SELECT r.id_reserva,
        r.monto_pago AS importe_reserva, p.amount AS importe_pago, p.currency AS moneda,
        CASE WHEN p.status = 'approved' AND r.monto_pago = p.amount
          THEN 'Condiciones recuperables del pago'
          ELSE 'Requiere revisión antes de reprogramar' END AS estado
        FROM reserva r LEFT JOIN pago p ON p.id_reserva = r.id_reserva
        WHERE r.estado_pago = 'APROBADO' AND NOT r.cancelada AND NOT r.finalizada
        ORDER BY r.id_reserva`);
      console.log(JSON.stringify({ reservas: rows,
        aplicacion: 'Con el backend detenido, usar --aplicar. No modifica importes pagados ni estima tarifas históricas.' }));
      return;
    }
    await client.query('BEGIN');
    try {
      await client.query("SET LOCAL lock_timeout = '10s'");
      await client.query(fs.readFileSync(path.join(__dirname, '..', 'migrations',
        '20261027-reprogramacion-reservas.sql'), 'utf8'));
      await client.query('COMMIT');
      console.log('Reprogramaciones y avisos preparados; importes pagados conservados.');
    } catch (error) { await client.query('ROLLBACK'); throw error; }
  } finally { await client.end(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
