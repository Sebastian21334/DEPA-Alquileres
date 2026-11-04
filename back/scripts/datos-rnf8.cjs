const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { Client } = require('pg');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const { BlobServiceClient, BlobSASPermissions } = require('@azure/storage-blob');

const envPath = path.join(__dirname, '..', '.env');
const backupDir = path.join(__dirname, '..', 'backups');
const originalTables = {
  publicacion: 'id_publicacion', usuario: 'id_usuario', anunciante: 'id_usuario',
  imagen: 'id_imagen', fecha: 'id_fecha', reserva: 'id_reserva', pago: 'id_pago',
};
const COUNT = 1000;

function fingerprint(url) {
  const u = new URL(url);
  return crypto.createHash('sha256').update([
    u.hostname.replace('-pooler.', '.'), u.port || '5432', u.pathname, u.username,
  ].join('|')).digest('hex');
}

function setEnv(key, value) {
  let text = fs.readFileSync(envPath, 'utf8');
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  text = pattern.test(text) ? text.replace(pattern, `${key}=${value}`) : `${text.trimEnd()}\n${key}=${value}\n`;
  fs.writeFileSync(envPath, text);
}

function save(manifest) {
  fs.mkdirSync(backupDir, { recursive: true });
  fs.writeFileSync(path.join(backupDir, `${manifest.runId}.json`), JSON.stringify(manifest, null, 2));
}

async function originals(db, saved) {
  const values = [];
  const queries = Object.entries(originalTables).map(([table, key]) => {
    let where = '';
    if (saved) {
      values.push(saved.find((s) => s.tabla === table).ids);
      where = `WHERE ${key} = ANY($${values.length}::int[])`;
    }
    return `SELECT '${table}' AS tabla, coalesce(array_agg(${key} ORDER BY ${key}), '{}') AS ids,
      md5(coalesce(string_agg(to_jsonb(t)::text, '' ORDER BY ${key}), '')) AS hash
      FROM public.${table} t ${where}`;
  });
  return (await db.query(queries.join(' UNION ALL '), values)).rows.sort((a, b) => a.tabla.localeCompare(b.tabla));
}

async function catalogs(db) {
  const monedas = (await db.query('SELECT * FROM tipo_moneda ORDER BY id_tipo_moneda')).rows;
  const modalidades = (await db.query('SELECT * FROM modalidad ORDER BY id_modalidad')).rows;
  const tipos = (await db.query("SELECT * FROM tipo_propiedad WHERE lower(nombre) IN ('departamento','casa','ph','dúplex','duplex','cabaña','quinta') ORDER BY id_tipo_propiedad")).rows;
  const ciudades = (await db.query(`SELECT c.*, p.nombre AS provincia FROM ciudad c
    JOIN provincia p ON p.id_provincia=c.id_provincia
    WHERE (p.nombre='Córdoba' AND c.nombre IN ('Villa María','Córdoba','Río Cuarto'))
       OR (p.nombre='Buenos Aires' AND c.nombre IN ('La Plata','Mar del Plata'))
       OR (p.nombre='Santa Fe' AND c.nombre IN ('Rosario','Santa Fe'))
    ORDER BY p.nombre,c.nombre`)).rows;
  const role = (await db.query("SELECT id_rol FROM rol WHERE lower(nombre)='inquilino' LIMIT 1")).rows[0];
  const tipo = (await db.query("SELECT id_tipo_anunciante FROM tipo_anunciante WHERE lower(nombre)='particular' LIMIT 1")).rows[0];
  const ars = monedas.find((m) => /ARS/i.test(m.nombre));
  const usd = monedas.find((m) => /USD/i.test(m.nombre));
  const temporal = modalidades.find((m) => m.permite_reservas_por_fecha === true);
  const largo = modalidades.find((m) => m.permite_reservas_por_fecha === false);
  if (!ars || !usd || !temporal || !largo || !role || !tipo || tipos.length < 3 || ciudades.length < 3) {
    throw new Error('Faltan catalogos o ubicaciones para el conjunto de prueba');
  }
  return { ars, usd, temporal, largo, tipos, ciudades, role: role.id_rol, tipo: tipo.id_tipo_anunciante };
}

function buildRows(c, users, runId, today) {
  return Array.from({ length: COUNT }, (_, i) => {
    const ciudad = c.ciudades[(i * 11) % c.ciudades.length];
    const tipo = c.tipos[(i * 7) % c.tipos.length];
    const usd = (i * 37) % 10 >= 7;
    const temporal = (i * 29) % 10 < 6;
    const moneda = usd ? c.usd : c.ars;
    const precio = usd
      ? (temporal ? 30 + (i * 7) % 221 : 250 + (i * 17) % 2251)
      : (temporal ? 25000 + (i * 7919) % 125000 : 200000 + (i * 12979) % 1600000);
    const fecha = new Date(`${today}T12:00:00Z`);
    fecha.setUTCDate(fecha.getUTCDate() - (i * 17) % 180);
    return {
      titulo: `[RNF8 ${runId}] ${tipo.nombre} en ${ciudad.nombre} ${String(i + 1).padStart(4, '0')}`,
      descripcion: `Publicación ficticia para RNF8. ${i % 2 ? 'Balcón y luminosidad' : 'Patio y espacio de trabajo'}. ${temporal ? 'Alquiler temporal' : 'Alquiler de largo plazo'}. No corresponde a una propiedad real.`,
      fecha_publicacion: fecha.toISOString().slice(0, 10), precio, activa: true,
      direccion: `Domicilio ficticio RNF8 ${100 + i}`, latitud: null, longitud: null,
      cantidad_ambientes: 1 + (i * 3) % 5, superficie: 35 + (i * 13) % 166,
      id_tipo_moneda: moneda.id_tipo_moneda,
      id_modalidad: (temporal ? c.temporal : c.largo).id_modalidad,
      id_anunciante: users[i % users.length], id_provincia: ciudad.id_provincia,
      id_ciudad: ciudad.id_ciudad, id_tipo_propiedad: tipo.id_tipo_propiedad,
    };
  });
}

async function seed(db, env) {
  const c = await catalogs(db);
  const { rows: [existing] } = await db.query("SELECT count(*)::int AS cantidad FROM publicacion WHERE titulo LIKE '[RNF8 %]'");
  if (existing.cantidad) throw new Error('Ya hay publicaciones RNF8. Limpiar el lote anterior antes de crear otro');
  const baseline = await originals(db);
  const service = BlobServiceClient.fromConnectionString(env.AZURE_STORAGE_CONNECTION_STRING);
  const sourceName = env.RNF8_SOURCE_CONTAINER || env.AZURE_STORAGE_CONTAINER || 'imagenes';
  const source = service.getContainerClient(sourceName);
  const sourceUrl = new URL(source.url);
  const { rows: photos } = await db.query(`SELECT DISTINCT i.url FROM imagen i
    JOIN publicacion p ON p.id_publicacion=i.id_publicacion WHERE p.activa ORDER BY i.url`);
  const sources = photos.map((p) => new URL(p.url)).filter((u) =>
    u.origin === sourceUrl.origin && u.pathname.startsWith(`${sourceUrl.pathname}/publicaciones/`));
  if (!sources.length) throw new Error('No hay fotos de publicaciones en el almacenamiento configurado');
  const runId = `rnf8-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${crypto.randomBytes(3).toString('hex')}`;
  const manifest = { version: 1, runId, fingerprint: fingerprint(env.DATABASE_URL),
    container: runId, previousContainer: sourceName, blobs: [], publicationIds: [], userIds: [], baseline,
    createdAt: new Date().toISOString(), status: 'preparando' };
  const target = service.getContainerClient(runId);
  save(manifest);
  await target.create({ access: 'blob', metadata: { purpose: 'rnf8', runid: runId } });
  for (let i = 0; i < sources.length && manifest.blobs.length < 24; i++) {
    const sourceBlob = source.getBlobClient(decodeURIComponent(sources[i].pathname.slice(sourceUrl.pathname.length + 1)));
    const name = `publicaciones/foto-${String(manifest.blobs.length + 1).padStart(2, '0')}.jpg`;
    const blob = target.getBlockBlobClient(name);
    try {
      const sas = await sourceBlob.generateSasUrl({ permissions: BlobSASPermissions.parse('r'), expiresOn: new Date(Date.now() + 15 * 60000) });
      await blob.syncUploadFromURL(sas, { metadata: { purpose: 'rnf8', runid: runId } });
    } catch (error) {
      if (error.statusCode === 404) continue;
      throw error;
    }
    manifest.blobs.push({ name, url: blob.url });
    save(manifest);
  }
  if (!manifest.blobs.length) throw new Error('No se pudieron copiar fotos validas');
  const head = await fetch(manifest.blobs[0].url, { method: 'HEAD' });
  if (!head.ok) throw new Error('Las fotos de prueba no se pueden mostrar publicamente');
  console.log(JSON.stringify({ imagenes_copiadas: manifest.blobs.length, contenedor: runId }));

  await db.query('BEGIN');
  try {
    await db.query("SET LOCAL lock_timeout='10s'");
    await db.query("SELECT pg_advisory_xact_lock(hashtext('depa:datos-rnf8'))");
    if ((await db.query("SELECT 1 FROM publicacion WHERE titulo LIKE '[RNF8 %]' LIMIT 1")).rowCount) throw new Error('Otro proceso ya creo un lote RNF8');
    const hash = await bcrypt.hash(crypto.randomBytes(48).toString('hex'), 12);
    const { rows: users } = await db.query(`INSERT INTO usuario
      (nombre,apellido,email,telefono,bloqueado,id_rol,contrasenia,email_verificado)
      SELECT 'Prueba RNF8', 'Anunciante '||n, $1||'.'||n||'@pruebas.invalid',
        '0000000000',false,$2,$3,true FROM generate_series(1,5) n RETURNING id_usuario`, [runId, c.role, hash]);
    manifest.userIds = users.map((u) => u.id_usuario);
    await db.query(`INSERT INTO anunciante (id_usuario,verificado,numero_contacto,id_tipo_anunciante)
      SELECT unnest($1::int[]),true,'0000000000',$2`, [manifest.userIds, c.tipo]);
    const { rows: [date] } = await db.query("SELECT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Argentina/Buenos_Aires')::date::text AS hoy");
    const rows = buildRows(c, manifest.userIds, runId, date.hoy);
    const { rows: pubs } = await db.query(`INSERT INTO publicacion
      (titulo,descripcion,fecha_publicacion,precio,activa,direccion,latitud,longitud,cantidad_ambientes,superficie,
       id_tipo_moneda,id_modalidad,id_anunciante,id_provincia,id_ciudad,id_tipo_propiedad)
      SELECT titulo,descripcion,fecha_publicacion,precio,activa,direccion,latitud,longitud,cantidad_ambientes,superficie,
       id_tipo_moneda,id_modalidad,id_anunciante,id_provincia,id_ciudad,id_tipo_propiedad
      FROM jsonb_to_recordset($1::jsonb) AS x(titulo text,descripcion text,fecha_publicacion date,precio numeric,
       activa boolean,direccion text,latitud numeric,longitud numeric,cantidad_ambientes integer,superficie numeric,
       id_tipo_moneda integer,id_modalidad integer,id_anunciante integer,id_provincia integer,id_ciudad integer,id_tipo_propiedad integer)
      RETURNING id_publicacion,titulo`, [JSON.stringify(rows)]);
    pubs.sort((a, b) => a.titulo.localeCompare(b.titulo));
    manifest.publicationIds = pubs.map((p) => p.id_publicacion);
    const images = pubs.flatMap((p, i) => Array.from({ length: 1 + i % 5 }, (_, j) => ({
      id_publicacion: p.id_publicacion, url: manifest.blobs[(i * 3 + j) % manifest.blobs.length].url,
    })));
    await db.query(`INSERT INTO imagen (id_publicacion,url)
      SELECT id_publicacion,url FROM jsonb_to_recordset($1::jsonb) AS x(id_publicacion integer,url text)`, [JSON.stringify(images)]);
    const fechas = await db.query(`INSERT INTO fecha (id_publicacion,fecha,disponible)
      SELECT p.id_publicacion,d::date,true FROM publicacion p
      CROSS JOIN generate_series($2::date + 1,$2::date + 30,interval '1 day') d
      WHERE p.id_publicacion=ANY($1::int[]) AND p.id_modalidad=$3`, [manifest.publicationIds, date.hoy, c.temporal.id_modalidad]);
    const { rows: [check] } = await db.query(`SELECT count(*)::int AS nuevas,
      count(*) FILTER (WHERE activa AND EXISTS (SELECT 1 FROM imagen i WHERE i.id_publicacion=p.id_publicacion))::int AS visibles
      FROM publicacion p WHERE id_publicacion=ANY($1::int[])`, [manifest.publicationIds]);
    if (check.nuevas !== COUNT || check.visibles !== COUNT) throw new Error('La carga no produjo 1000 publicaciones visibles');
    const after = await originals(db, baseline);
    if (JSON.stringify(after) !== JSON.stringify(baseline)) throw new Error('Cambiaron registros originales; se revierte el lote');
    manifest.status = 'preparado';
    manifest.imageRecords = images.length;
    manifest.calendarRecords = fechas.rowCount;
    manifest.catalogs = c;
    manifest.count = COUNT;
    save(manifest);
    await db.query('COMMIT');
  } catch (error) { await db.query('ROLLBACK'); throw error; }
  manifest.status = 'creado';
  save(manifest);
  setEnv('RNF8_SOURCE_CONTAINER', sourceName);
  setEnv('AZURE_STORAGE_CONTAINER', runId);
  console.log(JSON.stringify({ creado: true, publicaciones_nuevas: COUNT, usuarios_ficticios: manifest.userIds.length,
    imagenes_en_bd: manifest.imageRecords, archivos_copiados: manifest.blobs.length,
    fechas_disponibles: manifest.calendarRecords, manifiesto: path.join(backupDir, `${runId}.json`),
    originales_conservados: true, contenedor_configurado: runId }));
}

async function cleanup(db, env, file, apply) {
  const resolved = path.resolve(file);
  if (path.dirname(resolved).toLowerCase() !== backupDir.toLowerCase()) throw new Error('El manifiesto debe pertenecer a back/backups');
  const m = JSON.parse(fs.readFileSync(resolved, 'utf8'));
  if (m.fingerprint !== fingerprint(env.DATABASE_URL) || m.container !== m.runId || !/^rnf8-\d{8}-[a-f0-9]{6}$/.test(m.runId)) {
    throw new Error('El lote no corresponde al destino configurado');
  }
  const target = BlobServiceClient.fromConnectionString(env.AZURE_STORAGE_CONNECTION_STRING).getContainerClient(m.container);
  const props = await target.getProperties();
  if (props.metadata?.runid !== m.runId || props.metadata?.purpose !== 'rnf8') throw new Error('El contenedor no pertenece al lote');
  const { rows: [state] } = await db.query(`SELECT
    (SELECT count(*)::int FROM publicacion WHERE id_publicacion=ANY($1::int[])) AS publicaciones,
    (SELECT count(*)::int FROM reserva WHERE id_publicacion=ANY($1::int[])) AS reservas`, [m.publicationIds]);
  console.log(JSON.stringify({ vista_previa: !apply, lote: m.runId, ...state, archivos_del_lote: m.blobs.length }));
  if (!apply) return;
  if (state.reservas) throw new Error('El lote tiene reservas: no se elimina automaticamente');
  await db.query('BEGIN');
  try {
    await db.query("SET LOCAL lock_timeout='10s'");
    await db.query('SELECT id_publicacion FROM publicacion WHERE id_publicacion=ANY($1::int[]) FOR UPDATE', [m.publicationIds]);
    if ((await db.query('SELECT 1 FROM reserva WHERE id_publicacion=ANY($1::int[]) LIMIT 1', [m.publicationIds])).rowCount) throw new Error('El lote tiene reservas');
    if ((await db.query('SELECT 1 FROM publicacion WHERE id_publicacion=ANY($1::int[]) AND titulo NOT LIKE $2 LIMIT 1', [m.publicationIds, `[RNF8 ${m.runId}]%`])).rowCount) throw new Error('Hay publicaciones ajenas al lote');
    await db.query('DELETE FROM publicacion WHERE id_publicacion=ANY($1::int[])', [m.publicationIds]);
    if ((await db.query('SELECT 1 FROM publicacion WHERE id_anunciante=ANY($1::int[]) LIMIT 1', [m.userIds])).rowCount) throw new Error('Los usuarios de prueba tienen otras publicaciones');
    await db.query('DELETE FROM usuario WHERE id_usuario=ANY($1::int[]) AND email LIKE $2', [m.userIds, `${m.runId}.%@pruebas.invalid`]);
    await db.query('COMMIT');
  } catch (error) { await db.query('ROLLBACK'); throw error; }
  m.status = 'registros_eliminados'; save(m);
  for (const blob of m.blobs) {
    if (!/^publicaciones\/foto-\d{2}\.jpg$/.test(blob.name)) throw new Error('Nombre de archivo inesperado en el manifiesto');
    await target.deleteBlob(blob.name, { deleteSnapshots: 'include' }).catch((error) => { if (error.statusCode !== 404) throw error; });
  }
  m.status = 'limpiado'; save(m);
  console.log('Lote eliminado. El contenedor de pruebas queda separado para futuras cargas; no se modifico ningun contenedor de produccion.');
}

async function main() {
  const args = process.argv.slice(2);
  const cleanArg = args.find((a) => a.startsWith('--limpiar='));
  if (args.some((a) => a !== '--aplicar' && !a.startsWith('--limpiar='))) throw new Error('Usar --aplicar o --limpiar=RUTA [--aplicar]');
  const env = dotenv.parse(fs.readFileSync(envPath));
  if (!env.DATABASE_URL) throw new Error('Falta DATABASE_URL');
  if (!env.RNF8_DATABASE_FINGERPRINT || env.RNF8_DATABASE_FINGERPRINT !== fingerprint(env.DATABASE_URL)) {
    throw new Error('La base no esta identificada como destino de pruebas RNF8');
  }
  const db = new Client({ connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000 });
  await db.connect();
  try {
    if (cleanArg) await cleanup(db, env, cleanArg.slice('--limpiar='.length), args.includes('--aplicar'));
    else if (args.includes('--aplicar')) await seed(db, env);
    else {
      const c = await catalogs(db);
      console.log(JSON.stringify({ plan: true, publicaciones_nuevas: COUNT, usuarios_ficticios: 5,
        imagenes_por_publicacion: '1 a 5', contenedor: 'exclusivo por lote',
        ciudades: c.ciudades.map((x) => `${x.nombre}, ${x.provincia}`), tipos: c.tipos.map((x) => x.nombre) }));
    }
  } finally { await db.end(); }
}

if (require.main === module) main().catch((e) => {
  console.error('No se pudo completar el lote RNF8:', e.code || e.message.replace(/https?:\/\/\S+/g, '[URL omitida]'));
  process.exitCode = 1;
});
module.exports = { buildRows, fingerprint };
