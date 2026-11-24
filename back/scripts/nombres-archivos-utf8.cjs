const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

// Repara los nombres de comprobantes e imágenes de reclamos guardados con la codificación equivocada. Es reejecutable.
const PATRON = '[\\u00c2-\\u00f4][\\u0080-\\u00bf]';
const CONTEO = `SELECT
    (SELECT count(*) FROM public.reembolso WHERE comprobante_nombre ~ $1)::int AS reembolsos,
    (SELECT count(*) FROM public.reclamo_evidencia WHERE nombre_archivo ~ $1)::int AS evidencias,
    (SELECT count(*) FROM public.liquidacion l
      CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(l.pagos_anunciante) = 'array' THEN l.pagos_anunciante ELSE '[]' END) AS p
      WHERE p ->> 'comprobanteNombre' ~ $1)::int AS pagos`;

const resumen = ({ reembolsos, evidencias, pagos }) =>
  `comprobantes de reembolsos: ${reembolsos}; imágenes de reclamos: ${evidencias}; comprobantes de pagos al anunciante: ${pagos}`;

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL');
  const aplicar = process.argv.includes('--aplicar');
  const url = new URL(process.env.DATABASE_URL);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  const client = new Client({ connectionString: url.toString(), ...(local ? {} : { ssl: { rejectUnauthorized: false } }) });
  await client.connect();
  try {
    await client.query(aplicar ? 'BEGIN' : 'BEGIN READ ONLY');
    const { rows: [antes] } = await client.query(CONTEO, [PATRON]);
    if (!aplicar) {
      console.log(`Nombres a revisar: ${resumen(antes)}. Usá --aplicar para repararlos.`);
      await client.query('ROLLBACK');
      return;
    }
    await client.query("SET LOCAL lock_timeout = '10s'");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('depa:nombres-archivos-utf8'))");
    await client.query(fs.readFileSync(path.join(__dirname, '../migrations/20261124-nombres-archivos-utf8.sql'), 'utf8'));
    const { rows: [despues] } = await client.query(CONTEO, [PATRON]);
    await client.query('COMMIT');
    console.log(`Migración aplicada. Antes: ${resumen(antes)}. Quedan: ${resumen(despues)}.`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
