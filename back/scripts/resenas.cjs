const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const MIGRACION = path.join(__dirname, '..', 'migrations', '20261126-resenas.sql');

async function estado(client) {
  const { rows } = await client.query(`
    SELECT
      to_regclass('public.resena') IS NOT NULL AS resena,
      to_regclass('public.resena_imagen') IS NOT NULL AS resena_imagen,
      to_regclass('public.uq_resena_publicacion_autor') IS NOT NULL AS uq_publicacion,
      to_regclass('public.uq_resena_anunciante_autor') IS NOT NULL AS uq_anunciante,
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'publicacion'
          AND column_name = 'promedio_resenas'
      ) AS promedio_publicacion,
      EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'anunciante'
          AND column_name = 'promedio_resenas'
      ) AS promedio_anunciante
  `);
  return rows[0];
}

async function main() {
  const argumentos = process.argv.slice(2);
  const aplicar = argumentos.includes('--aplicar');
  const verificar = argumentos.includes('--verificar');
  if (argumentos.some((arg) => !['--aplicar', '--verificar'].includes(arg)) || (aplicar && verificar)) {
    throw new Error('Usar sin argumentos, --verificar o --aplicar');
  }
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL');
  const url = new URL(process.env.DATABASE_URL);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  const client = new Client({
    connectionString: url.toString(),
    connectionTimeoutMillis: 10000,
    ...(local ? {} : { ssl: { rejectUnauthorized: false } }),
  });
  await client.connect();
  try {
    if (!aplicar) {
      const actual = await estado(client);
      console.log(JSON.stringify({ host: url.hostname, ...actual,
        accion: verificar ? 'verificado' : 'sin guardar; usar --aplicar' }, null, 2));
      if (verificar && !Object.values(actual).every(Boolean)) process.exitCode = 1;
      return;
    }
    await client.query('BEGIN');
    try {
      await client.query("SET LOCAL lock_timeout = '10s'");
      await client.query(`SELECT pg_advisory_xact_lock(hashtext('depa:resenas:public'))`);
      await client.query(fs.readFileSync(MIGRACION, 'utf8'));
      const actual = await estado(client);
      if (!Object.values(actual).every(Boolean)) {
        throw new Error('La migración no dejó el esquema esperado');
      }
      await client.query('COMMIT');
      console.log(JSON.stringify({ aplicada: true, host: url.hostname, ...actual }, null, 2));
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('No se pudo aplicar la migración de reseñas:', error.code || error.message);
  process.exitCode = 1;
});
