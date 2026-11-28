const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL');
  const aplicar = process.argv.includes('--aplicar');
  const client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 });
  await client.connect();
  try {
    if (aplicar) {
      await client.query('BEGIN');
      try {
        await client.query("SELECT pg_advisory_xact_lock(hashtext('depa:historial-denuncias-resenas'))");
        await client.query(fs.readFileSync(path.join(__dirname, '../migrations/20261127-historial-denuncias-resenas.sql'), 'utf8'));
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
    const { rows } = await client.query("SELECT to_regclass('public.resena_denuncia_resolucion') IS NOT NULL AS disponible");
    console.log(JSON.stringify({ aplicada: aplicar, ...rows[0] }));
  } finally { await client.end(); }
}
main().catch((error) => { console.error('Error al preparar historial:', error.message); process.exitCode = 1; });
