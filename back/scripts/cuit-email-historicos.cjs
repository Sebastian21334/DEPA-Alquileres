const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const MIGRACION = path.join(__dirname, '..', 'migrations', '20261104-cuit-email-historicos.sql');

async function conectar() {
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL');
  const url = new URL(process.env.DATABASE_URL);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  const client = new Client({ connectionString: url.toString(),
    ...(local ? {} : { ssl: { rejectUnauthorized: false } }),
  });
  await client.connect();
  return client;
}

/** Informa qué haría la migración, sin modificar la base. */
async function informar(client) {
  const { rows: [bajas] } = await client.query(`
    SELECT
      (SELECT count(*) FROM public.usuario WHERE activa = false AND email IS NOT NULL)::int AS emails,
      (SELECT count(*) FROM public.anunciante a JOIN public.usuario u ON u.id_usuario = a.id_usuario
        WHERE u.activa = false AND a.cuit_cuil IS NOT NULL)::int AS cuits`);
  const { rows: repetidos } = await client.query(`
    SELECT regexp_replace(a.cuit_cuil, '[^0-9]', '', 'g') AS digitos,
           string_agg(a.id_usuario::text, ', ' ORDER BY a.id_usuario) AS cuentas
      FROM public.anunciante a JOIN public.usuario u ON u.id_usuario = a.id_usuario
     WHERE a.cuit_cuil IS NOT NULL AND u.activa = true
     GROUP BY 1 HAVING count(*) > 1`);
  console.log(`Cuentas dadas de baja cuyo email pasa al histórico: ${bajas.emails}`);
  console.log(`Cuentas dadas de baja cuyo CUIT/CUIL pasa al histórico: ${bajas.cuits}`);
  if (repetidos.length) {
    console.log('CUIT/CUIL repetidos entre cuentas vigentes (la migración se revertiría):');
    for (const fila of repetidos) console.log(`  ${fila.digitos}: cuentas ${fila.cuentas}`);
  } else {
    console.log('No hay CUIT/CUIL repetidos entre cuentas vigentes.');
  }
}

async function main() {
  const client = await conectar();
  try {
    if (!process.argv.includes('--aplicar')) {
      await informar(client);
      console.log('Sin cambios. Usar --aplicar para guardar.');
      return;
    }
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '10s'");
    await client.query(fs.readFileSync(MIGRACION, 'utf8'));
    await client.query('COMMIT');
    console.log('CUIT/CUIL y email únicos entre cuentas vigentes; históricos de las bajas conservados.');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
