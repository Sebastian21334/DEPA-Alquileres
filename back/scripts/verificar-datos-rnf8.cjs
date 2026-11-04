require('reflect-metadata');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const dotenv = require('dotenv');
const { DataSource } = require('typeorm');
const { BlobServiceClient } = require('@azure/storage-blob');
const { fingerprint } = require('./datos-rnf8.cjs');
const { Publicacion } = require('../dist/publicaciones/entity/publicacion.entity');
const { Reserva } = require('../dist/reservas/entity/reserva.entity');
const { PublicacionesRepository } = require('../dist/publicaciones/repository/publicaciones.repository');

async function main() {
  if (!process.argv[2]) throw new Error('Indicar la ruta del manifiesto del lote');
  const file = path.resolve(process.argv[2]);
  const m = JSON.parse(fs.readFileSync(file));
  const env = dotenv.parse(fs.readFileSync(path.join(__dirname, '..', '.env')));
  assert.equal(fingerprint(env.DATABASE_URL), m.fingerprint, 'La base no coincide con la del lote');
  const ds = new DataSource({ type: 'postgres', url: env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, synchronize: false, logging: false,
    entities: [path.join(__dirname, '..', 'dist', '**', '*.entity.js').replaceAll('\\', '/')] });
  await ds.initialize();
  try {
    const repo = new PublicacionesRepository(ds.getRepository(Publicacion), ds.getRepository(Reserva));
    const base = { pagina: 1, limite: 12, busqueda: m.runId };
    const listado = await repo.buscarPaginadas(base);
    assert.equal(listado.total, 1000); assert.equal(listado.datos.length, 12);
    assert(listado.datos.every(p => p.activa && p.imagenes.length > 0 &&
      p.imagenes.every(i => i.url.includes(`/${m.container}/`))));
    assert.equal((await repo.buscarPaginadas({ ...base, pagina: 84 })).datos.length, 4);
    for (const [categoria, total] of [['temporales', 600], ['largo-plazo', 400]]) {
      assert.equal((await repo.buscarPaginadas({ ...base, categoria })).total, total);
    }
    const city = m.catalogs.ciudades[0];
    const [expectedCity] = await ds.query('SELECT count(*)::int AS n FROM publicacion WHERE id_publicacion=ANY($1::int[]) AND id_ciudad=$2 AND id_provincia=$3', [m.publicationIds, city.id_ciudad, city.id_provincia]);
    const cityResult = await repo.buscarPaginadas({ ...base, idProvincia: city.id_provincia, idsCiudad: [city.id_ciudad] });
    assert.equal(cityResult.total, expectedCity.n); assert(cityResult.total > 0);
    const filtros = { ...base, idsTipoMoneda: [m.catalogs.ars.id_tipo_moneda],
      idsTipoPropiedad: [m.catalogs.tipos[0].id_tipo_propiedad], precioMin: 200000,
      precioMax: 1800000, ambientes: ['2', '3'], superficieMin: 45, orden: 'precio-menor' };
    const [expected] = await ds.query('SELECT count(*)::int AS n FROM publicacion WHERE id_publicacion=ANY($1::int[]) AND id_tipo_moneda=$2 AND id_tipo_propiedad=$3 AND precio BETWEEN 200000 AND 1800000 AND cantidad_ambientes IN (2,3) AND superficie>=45', [m.publicationIds, m.catalogs.ars.id_tipo_moneda, m.catalogs.tipos[0].id_tipo_propiedad]);
    const combined = await repo.buscarPaginadas(filtros);
    assert.equal(combined.total, expected.n); assert(combined.total > 0);
    for (let i = 1; i < combined.datos.length; i++) assert(Number(combined.datos[i].precio) >= Number(combined.datos[i - 1].precio));
    assert.equal((await repo.buscarPaginadas({ ...base, busqueda: `${m.runId} sincoincidenciasrnf8` })).total, 0);

    const keys = { publicacion: 'id_publicacion', usuario: 'id_usuario', anunciante: 'id_usuario', imagen: 'id_imagen', fecha: 'id_fecha', reserva: 'id_reserva', pago: 'id_pago' };
    for (const original of m.baseline) {
      const table = original.tabla, key = keys[table];
      if (!key) throw new Error('Tabla desconocida en el manifiesto');
      const [r] = await ds.query(`SELECT md5(coalesce(string_agg(to_jsonb(t)::text,'' ORDER BY ${key}),'')) AS hash FROM public.${table} t WHERE ${key}=ANY($1::int[])`, [original.ids]);
      assert.equal(r.hash, original.hash, `Registros originales modificados: ${table}`);
    }
    const [counts] = await ds.query(`SELECT
      (SELECT count(*)::int FROM publicacion) AS publicaciones_totales,
      (SELECT count(*)::int FROM usuario) AS usuarios_totales,
      (SELECT count(*)::int FROM imagen WHERE id_publicacion=ANY($1::int[])) AS imagenes_del_lote,
      (SELECT count(*)::int FROM fecha WHERE id_publicacion=ANY($1::int[])) AS fechas_del_lote,
      (SELECT count(*)::int FROM publicacion WHERE id_publicacion=ANY($1::int[]) AND id_tipo_moneda=$2) AS ars,
      (SELECT count(*)::int FROM publicacion WHERE id_publicacion=ANY($1::int[]) AND id_tipo_moneda=$3) AS usd`, [m.publicationIds, m.catalogs.ars.id_tipo_moneda, m.catalogs.usd.id_tipo_moneda]);
    assert.equal(counts.publicaciones_totales, m.baseline.find(b => b.tabla === 'publicacion').ids.length + m.count);
    assert.equal(counts.imagenes_del_lote, 3000);
    assert.equal(counts.fechas_del_lote, 18000); assert.equal(counts.ars, 700); assert.equal(counts.usd, 300);
    const visible = await repo.buscarPaginadas({ pagina: 1, limite: 12 });
    const container = BlobServiceClient.fromConnectionString(env.AZURE_STORAGE_CONNECTION_STRING).getContainerClient(m.container);
    const names = [];
    for await (const b of container.listBlobsFlat()) names.push(b.name);
    assert.equal(names.length, 24); assert(m.blobs.every(b => names.includes(b.name)));
    const head = await fetch(m.blobs[0].url, { method: 'HEAD' }); assert.equal(head.status, 200);
    const resultado = { verificado: true, ...counts, publicaciones_visibles_totales: visible.total,
      nuevas_visibles: listado.total, temporales: 600, largo_plazo: 400,
      ciudades: m.catalogs.ciudades.length, tipos: m.catalogs.tipos.length,
      archivos_azure: names.length, filtro_ubicacion: cityResult.total,
      filtros_combinados: combined.total, originales_conservados: true, busquedas_y_paginacion: 'OK' };
    m.verificacion = resultado;
    fs.writeFileSync(file, JSON.stringify(m, null, 2));
    console.log(JSON.stringify(resultado));
  } finally { await ds.destroy(); }
}
main().catch(e => { console.error('Fallo de verificacion RNF8:', e.message.replace(/https?:\/\/\S+/g, '[URL omitida]')); process.exitCode = 1; });
