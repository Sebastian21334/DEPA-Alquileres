const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const dotenv = require('dotenv');
const { Client } = require('pg');
const { fingerprint } = require('../scripts/datos-rnf8.cjs');

async function main() {
  const api = (process.argv[2] || '').replace(/\/$/, '');
  if (!/^https?:\/\//.test(api)) throw new Error('Indicar la URL del backend');
  const env = dotenv.parse(fs.readFileSync(path.join(__dirname, '..', '.env')));
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'backups', 'rnf8-20261102-cd588e.json')));
  assert.equal(fingerprint(env.DATABASE_URL), manifest.fingerprint, 'El .env no apunta a la base del lote RNF8');
  const db = new Client({ connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000 });
  await db.connect();
  try {
    await db.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const config = { api, lote: manifest.runId, generado: new Date().toISOString(),
      usuarios: 10, limite_ms: 2000, plan_backend: 'Azure App Service B1',
      escenarios: {}, comprobacion: `/publicaciones?limite=1&q=${manifest.runId}` };
    const visible = `p.activa AND EXISTS (SELECT 1 FROM imagen i WHERE i.id_publicacion=p.id_publicacion)`;
    const [n] = (await db.query(`SELECT count(*)::int AS total FROM publicacion p WHERE ${visible}`)).rows;
    config.publicaciones_visibles = n.total;
    config.postgresql = (await db.query('SHOW server_version')).rows[0].server_version;
    async function add(group, name, params, where = 'TRUE', values = [], order = 'p.fecha_publicacion DESC,p.id_publicacion DESC', pages = [1]) {
      const ids = (await db.query(`SELECT p.id_publicacion FROM publicacion p WHERE ${visible} AND (${where}) ORDER BY ${order}`, values)).rows.map(r => r.id_publicacion);
      for (const page of pages) {
        if (page > 1 && (page - 1) * 12 >= ids.length) continue;
        const query = new URLSearchParams({ pagina: String(page), limite: '12', ...params });
        (config.escenarios[group] ||= []).push({ nombre: `${name}_p${page}`, url: `/publicaciones?${query}`,
          pagina: page, total: ids.length, ids: ids.slice((page - 1) * 12, page * 12) });
      }
    }
    await add('E1', 'general', { orden: 'recientes' }, 'TRUE', [], undefined, [1, 25, Math.ceil(n.total / 12)]);
    const c = manifest.catalogs;
    const cordoba = c.ciudades.find(x => x.provincia === 'Córdoba');
    const city = c.ciudades[0];
    await add('E2', 'provincia', { idProvincia: String(cordoba.id_provincia) }, 'p.id_provincia=$1', [cordoba.id_provincia], undefined, [1, 10]);
    await add('E2', 'ciudad', { idProvincia: String(city.id_provincia), idsCiudad: String(city.id_ciudad) }, 'p.id_provincia=$1 AND p.id_ciudad=$2', [city.id_provincia, city.id_ciudad], undefined, [1, 5]);
    const empty = (await db.query(`SELECT c.id_ciudad,c.id_provincia FROM ciudad c WHERE NOT EXISTS
      (SELECT 1 FROM publicacion p WHERE ${visible} AND p.id_ciudad=c.id_ciudad) ORDER BY c.id_ciudad LIMIT 1`)).rows[0];
    if (!empty) throw new Error('No hay una ciudad sin coincidencias para E2');
    await add('E2', 'ubicacion_sin_resultados', { idProvincia: String(empty.id_provincia), idsCiudad: String(empty.id_ciudad) }, 'p.id_provincia=$1 AND p.id_ciudad=$2', [empty.id_provincia, empty.id_ciudad]);
    const ars = c.ars.id_tipo_moneda, tipo = c.tipos[0].id_tipo_propiedad;
    const filters = { idsTipoMoneda: String(ars), idsTipoPropiedad: String(tipo), precioMin: '200000', precioMax: '1800000', ambientes: '2,3', superficieMin: '45', orden: 'precio-menor' };
    await add('E3', 'combinados', filters, 'p.id_tipo_moneda=$1 AND p.id_tipo_propiedad=$2 AND p.precio BETWEEN 200000 AND 1800000 AND p.cantidad_ambientes IN (2,3) AND p.superficie>=45', [ars, tipo], 'p.precio ASC,p.id_publicacion DESC', [1, 2]);
    await add('E3', 'rango_estrecho', { ...filters, precioMin: '300000', precioMax: '800000' }, 'p.id_tipo_moneda=$1 AND p.id_tipo_propiedad=$2 AND p.precio BETWEEN 300000 AND 800000 AND p.cantidad_ambientes IN (2,3) AND p.superficie>=45', [ars, tipo], 'p.precio ASC,p.id_publicacion DESC');
    await add('E3', 'precio_sin_resultados', { idsTipoMoneda: String(ars), precioMin: '99999999', precioMax: '99999999' }, 'p.id_tipo_moneda=$1 AND p.precio=99999999', [ars]);
    await add('E4', 'texto_precio_menor', { q: manifest.runId, idsTipoMoneda: String(ars), orden: 'precio-menor' }, 'p.titulo LIKE $1 AND p.id_tipo_moneda=$2', [`%${manifest.runId}%`, ars], 'p.precio ASC,p.id_publicacion DESC', [1, 20]);
    await add('E4', 'texto_balcon', { q: `${manifest.runId} balcon`, orden: 'precio-mayor' }, "p.titulo LIKE $1 AND p.descripcion ILIKE '%balcón%'", [`%${manifest.runId}%`], 'p.precio DESC,p.id_publicacion DESC', [1, 10]);
    await add('E4', 'texto_sin_resultados', { q: `${manifest.runId} sincoincidenciasrnf8` }, "p.titulo LIKE $1 AND p.descripcion ILIKE '%sincoincidenciasrnf8%'", [`%${manifest.runId}%`]);
    await db.query('COMMIT');
    const response = await fetch(api + config.comprobacion, { signal: AbortSignal.timeout(60000) });
    if (!response.ok) throw new Error(`El backend responde HTTP ${response.status}`);
    const body = await response.json();
    assert.equal(body.total, 1000, 'La API no muestra el lote: revisar DATABASE_URL en Azure y reiniciar');
    for (const [scenario, variants] of Object.entries(config.escenarios)) {
      for (const variant of variants) {
        const r = await fetch(api + variant.url, { signal: AbortSignal.timeout(60000) });
        assert.equal(r.status, 200, `Fallo HTTP en ${scenario}/${variant.nombre}`);
        const data = await r.json();
        assert.equal(data.total, variant.total, `Total incorrecto en ${scenario}/${variant.nombre}`);
        assert.deepEqual(data.datos.map(p => p.id), variant.ids, `Resultados u orden incorrectos en ${scenario}/${variant.nombre}`);
      }
    }
    const folder = path.join(__dirname, 'local'); fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(path.join(folder, 'config-rnf8.json'), JSON.stringify(config, null, 2));
    console.log(`API comprobada. ${n.total} publicaciones visibles. Configuracion E1-E4 preparada.`);
  } finally { await db.end(); }
}
main().catch(e => { console.error('No se pudo preparar RNF8:', e.message.replace(/postgres(?:ql)?:\/\/\S+/g, '[conexion omitida]')); process.exitCode = 1; });
