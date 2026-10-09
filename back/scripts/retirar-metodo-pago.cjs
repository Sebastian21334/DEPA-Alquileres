const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const migration = path.join(__dirname, '..', 'migrations', '20261009-retirar-metodo-pago.sql');
const backups = path.join(__dirname, '..', 'backups');

async function esquema(client) {
  const { rows: [estado] } = await client.query(`
    SELECT to_regclass('public.metodo_pago') IS NOT NULL AS catalogo,
      EXISTS(SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='reserva' AND column_name='id_metodo_pago') AS relacion,
      EXISTS(SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='pago' AND column_name='payment_method_id') AS medio_mercado_pago
  `);
  return estado;
}

async function historial(client) {
  const { rows: [estado] } = await client.query(`
    SELECT (SELECT count(*)::int FROM public.reserva) AS reservas,
      (SELECT md5(coalesce(string_agg(to_jsonb(r)::text, ',' ORDER BY id_reserva), ''))
        FROM (SELECT to_jsonb(reserva) - 'id_metodo_pago' AS datos, id_reserva FROM public.reserva) r) AS reservas_hash,
      (SELECT count(*)::int FROM public.pago) AS pagos,
      (SELECT md5(coalesce(string_agg(to_jsonb(p)::text, ',' ORDER BY id_pago), '')) FROM public.pago p) AS pagos_hash
  `);
  return estado;
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL');
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    const estado = await esquema(client);
    if (!estado.medio_mercado_pago) throw new Error('Falta pago.payment_method_id; no se aplica la migración');
    if (!process.argv.includes('--aplicar')) {
      console.log(JSON.stringify({ esquema: estado, historial: await historial(client), aplicacion: 'Usar --aplicar con el back detenido.' }));
      return;
    }
    await client.query('BEGIN');
    try {
      await client.query("SET LOCAL lock_timeout = '10s'");
      await client.query('LOCK TABLE public.reserva, public.pago IN ACCESS EXCLUSIVE MODE');
      if (estado.catalogo) await client.query('LOCK TABLE public.metodo_pago IN ACCESS EXCLUSIVE MODE');
      const antes = await historial(client);
      let respaldo;
      if (estado.catalogo || estado.relacion) {
        const datos = { fecha: new Date().toISOString(), historial: antes, esquema: estado,
          catalogo: estado.catalogo ? (await client.query('SELECT * FROM public.metodo_pago ORDER BY id_metodo_pago')).rows : [],
          relaciones: estado.relacion ? (await client.query('SELECT id_reserva, id_metodo_pago FROM public.reserva WHERE id_metodo_pago IS NOT NULL ORDER BY id_reserva')).rows : [],
          definicion: (await client.query("SELECT table_name, column_name, data_type, is_nullable, column_default, character_maximum_length FROM information_schema.columns WHERE table_schema='public' AND (table_name='metodo_pago' OR (table_name='reserva' AND column_name='id_metodo_pago')) ORDER BY table_name, ordinal_position")).rows,
          restricciones: (await client.query("SELECT c.conname, c.conrelid::regclass::text AS tabla, pg_get_constraintdef(c.oid) AS definicion FROM pg_constraint c WHERE c.conrelid=to_regclass('public.metodo_pago') OR (c.conrelid='public.reserva'::regclass AND c.confrelid=to_regclass('public.metodo_pago'))")).rows,
        };
        fs.mkdirSync(backups, { recursive: true });
        respaldo = path.join(backups, `metodo-pago-${datos.fecha.replace(/[:.]/g, '-')}.json`);
        fs.writeFileSync(respaldo, JSON.stringify(datos, null, 2));
      }
      await client.query(fs.readFileSync(migration, 'utf8'));
      const despues = await historial(client);
      const nuevoEsquema = await esquema(client);
      if (JSON.stringify(antes) !== JSON.stringify(despues)) throw new Error('El historial cambió; se revierte la migración');
      if (nuevoEsquema.catalogo || nuevoEsquema.relacion || !nuevoEsquema.medio_mercado_pago) throw new Error('Esquema final inesperado');
      await client.query('COMMIT');
      console.log(JSON.stringify({ aplicada: true, esquema: nuevoEsquema, reservas: despues.reservas, pagos: despues.pagos, historialConservado: true, respaldo }));
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } finally {
    await client.end();
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
