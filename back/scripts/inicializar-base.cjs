const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
const dotenv = require('dotenv');

const archivoEnv = path.join(__dirname, '..', '.env');
const migracion = path.join(__dirname, '..', 'migrations', '20261102-esquema-inicial.sql');
const tablasEsperadas = [
  'anunciante', 'ciudad', 'consulta_cotizacion', 'cotizacion_dolar', 'favorito',
  'fecha', 'imagen', 'mensaje', 'modalidad', 'pago', 'provincia', 'publicacion',
  'reprogramacion_reserva', 'reserva', 'revision_verificacion', 'rol',
  'solicitud_verificacion', 'tipo_anunciante', 'tipo_moneda', 'tipo_propiedad', 'usuario',
];

async function objetosExistentes(client) {
  const { rows } = await client.query(`
    SELECT c.relname AS nombre
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p', 'v', 'm', 'S', 'f')
    UNION ALL
    SELECT t.typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typtype IN ('e', 'd')
    ORDER BY nombre
  `);
  return rows;
}

async function verificarEstructura(client) {
  const { rows } = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  const tablas = rows.map((r) => r.table_name);
  if (JSON.stringify(tablas) !== JSON.stringify(tablasEsperadas)) {
    throw new Error('La estructura creada no coincide con las 21 tablas esperadas');
  }
  const { rows: [estado] } = await client.query(`
    SELECT
      (SELECT count(*)::int FROM public.publicacion) AS publicaciones,
      (SELECT count(*)::int FROM public.usuario) AS usuarios,
      (SELECT count(*)::int FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace
       WHERE n.nspname = 'public' AND c.contype = 'f') AS relaciones,
      EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.fecha'::regclass
        AND conname = 'UQ_fecha_publicacion_dia') AS calendario_unico,
      to_regclass('public.metodo_pago') IS NULL AS sin_catalogo_pago_obsoleto
  `);
  if (estado.publicaciones !== 0 || estado.usuarios !== 0 ||
      !estado.calendario_unico || !estado.sin_catalogo_pago_obsoleto || estado.relaciones === 0) {
    throw new Error('No se pudo verificar la estructura inicial vacia');
  }
  return { tablas: tablas.length, ...estado };
}

async function main() {
  const argumentos = process.argv.slice(2);
  if (argumentos.some((a) => !['--aplicar', '--verificar'].includes(a)) ||
      (argumentos.includes('--aplicar') && argumentos.includes('--verificar'))) {
    throw new Error('Usar sin argumentos, --verificar o --aplicar');
  }
  // La conexion se toma exclusivamente del archivo solicitado, no del entorno de otra terminal.
  const { DATABASE_URL } = dotenv.parse(fs.readFileSync(archivoEnv));
  if (!DATABASE_URL) throw new Error('Falta DATABASE_URL en back/.env');
  const destino = new URL(DATABASE_URL);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(destino.hostname);
  const client = new Client({
    connectionString: DATABASE_URL,
    connectionTimeoutMillis: 10000,
    ...(local ? {} : { ssl: { rejectUnauthorized: false } }),
  });

  await client.connect();
  try {
    const { rows: [destinoActual] } = await client.query('SELECT current_database() AS base');
    console.log(JSON.stringify({ archivo: 'back/.env', ...destinoActual }));
    if (argumentos.length === 0) {
      const objetos = await objetosExistentes(client);
      console.log(JSON.stringify({ objetos_existentes: objetos.length,
        aplicacion: 'npm run db:inicializar',
        comprobacion_sin_guardar: 'node scripts/inicializar-base.cjs --verificar' }));
      return;
    }

    await client.query('BEGIN');
    try {
      await client.query("SET LOCAL lock_timeout = '10s'");
      await client.query("SELECT pg_advisory_xact_lock(hashtext('depa:inicializar:public'))");
      if ((await objetosExistentes(client)).length > 0) {
        throw new Error('La base ya tiene objetos en public. La inicializacion solo admite una base vacia; no se modifico su contenido');
      }
      await client.query(fs.readFileSync(migracion, 'utf8'));
      const estado = await verificarEstructura(client);
      const aplicar = argumentos.includes('--aplicar');
      await client.query(aplicar ? 'COMMIT' : 'ROLLBACK');
      console.log(JSON.stringify({ aplicada: aplicar, verificada: true, ...estado }));
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  // No imprimir la cadena de conexion, contrasenas ni el objeto de configuracion.
  console.error('No se pudo inicializar la base:', error.code || error.message);
  process.exitCode = 1;
});
