const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { Client } = require('pg');
const { parse } = require('dotenv');
const catalogos = require('../src/catalogos/catalogos-iniciales.json');
const estadosIniciales = require('../src/catalogos/estados-iniciales.json');
const { provincias } = require('./datos-iniciales/ubicaciones.json');

const normalizar = (nombre) => nombre.normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .trim()
  .toLocaleLowerCase('es-AR')
  .replace(/\s+/g, ' ');

async function cargarEstados(cliente) {
  const ambitos = Object.entries(estadosIniciales);
  const { rowCount: ambito } = await cliente.query(`
    INSERT INTO public.ambito (codigo, nombre)
    SELECT codigo, nombre FROM jsonb_to_recordset($1::jsonb) AS datos(codigo text, nombre text)
    ON CONFLICT (codigo) DO NOTHING
  `, [JSON.stringify(ambitos.map(([codigo, { nombre }]) => ({ codigo, nombre })))]);

  const estados = ambitos.flatMap(([codigo_ambito, { estados }]) =>
    Object.entries(estados).map(([codigo, { nombre }]) => ({ codigo_ambito, codigo, nombre })),
  );
  const { rowCount: estado } = await cliente.query(`
    INSERT INTO public.estado (codigo_ambito, codigo, nombre)
    SELECT codigo_ambito, codigo, nombre
    FROM jsonb_to_recordset($1::jsonb) AS datos(codigo_ambito text, codigo text, nombre text)
    ON CONFLICT (codigo_ambito, codigo) DO NOTHING
  `, [JSON.stringify(estados)]);

  return { ambito, estado };
}

function existeFila(tabla, fila, nombres) {
  if (tabla === 'rol') {
    if (nombres.includes(fila.nombre)) return true;
    if (nombres.some((nombre) => normalizar(nombre) === normalizar(fila.nombre))) {
      throw new Error(`El rol existente debe llamarse exactamente "${fila.nombre}" para que funcionen los permisos`);
    }
    return false;
  }

  const claves = [fila.nombre, ...(fila.alias ?? [])].map(normalizar);
  return nombres.some((nombre) => {
    const clave = normalizar(nombre);
    if (claves.includes(clave)) return true;
    if (tabla !== 'tipo_moneda') return false;
    const codigos = new Set(clave.match(/\b(?:ars|usd)\b/g));
    return codigos.size === 1 && codigos.has(fila.codigo.toLowerCase());
  });
}

async function cargarCatalogos(cliente) {
  const insertados = {};
  for (const [tabla, filas] of Object.entries(catalogos)) {
    const { rows } = await cliente.query(`SELECT nombre FROM public.${tabla}`);
    const nombres = rows.map(({ nombre }) => nombre);
    const faltantes = filas.filter((fila) => !existeFila(tabla, fila, nombres));
    const campos = tabla === 'modalidad' ? 'nombre, descripcion, permite_reservas_por_fecha' : 'nombre, descripcion';
    const esquema = tabla === 'modalidad'
      ? 'nombre text, descripcion text, permite_reservas_por_fecha boolean'
      : 'nombre text, descripcion text';
    const { rowCount } = await cliente.query(`
      INSERT INTO public.${tabla} (${campos})
      SELECT ${campos} FROM jsonb_to_recordset($1::jsonb) AS datos(${esquema})
    `, [JSON.stringify(faltantes)]);
    insertados[tabla] = rowCount;
  }
  return insertados;
}

async function cargarUbicaciones(cliente) {
  const { rows: provinciasExistentes } = await cliente.query(
    'SELECT id_provincia, nombre FROM public.provincia ORDER BY id_provincia',
  );
  const { rows: ciudadesExistentes } = await cliente.query('SELECT id_provincia, nombre FROM public.ciudad');
  const ciudadesPorProvincia = new Map();
  for (const { id_provincia, nombre } of ciudadesExistentes) {
    if (!ciudadesPorProvincia.has(id_provincia)) ciudadesPorProvincia.set(id_provincia, new Set());
    ciudadesPorProvincia.get(id_provincia).add(normalizar(nombre));
  }

  let provinciasInsertadas = 0;
  const ciudadesNuevas = [];
  for (const { nombre, alias = [], localidades } of provincias) {
    const claves = [nombre, ...alias].map(normalizar);
    const coincidencias = provinciasExistentes.filter((fila) => claves.includes(normalizar(fila.nombre)));
    if (coincidencias.length === 0) {
      const { rows: [provincia] } = await cliente.query(
        'INSERT INTO public.provincia (nombre) VALUES ($1) RETURNING id_provincia, nombre',
        [nombre],
      );
      coincidencias.push(provincia);
      provinciasInsertadas += 1;
    }
    const provincia = coincidencias.find((fila) => fila.nombre === nombre) ?? coincidencias[0];
    const ciudades = new Set(coincidencias.flatMap(({ id_provincia }) =>
      [...(ciudadesPorProvincia.get(id_provincia) ?? [])],
    ));
    for (const localidad of localidades) {
      if (!ciudades.has(normalizar(localidad))) {
        ciudadesNuevas.push({ id_provincia: provincia.id_provincia, nombre: localidad });
      }
    }
  }

  const { rowCount: ciudad } = await cliente.query(`
    INSERT INTO public.ciudad (id_provincia, nombre)
    SELECT id_provincia, nombre FROM jsonb_to_recordset($1::jsonb) AS datos(id_provincia int, nombre text)
  `, [JSON.stringify(ciudadesNuevas)]);
  return { provincia: provinciasInsertadas, ciudad };
}

async function cargarDatosBase(cliente) {
  await cliente.query('BEGIN');
  try {
    await cliente.query("SET LOCAL lock_timeout = '10s'");
    // Los catálogos por nombre no tienen una restricción única. Bloquear las
    // escrituras durante la carga evita duplicados en dos ejecuciones simultáneas.
    await cliente.query(`
      LOCK TABLE public.provincia, public.ciudad, public.rol, public.tipo_anunciante,
        public.tipo_propiedad, public.modalidad, public.tipo_moneda
      IN SHARE ROW EXCLUSIVE MODE
    `);
    const catalogosCargados = await cargarCatalogos(cliente);
    const estadosCargados = await cargarEstados(cliente);
    const { rowCount: politica_cancelacion } = await cliente.query(`
      INSERT INTO public.politica_cancelacion (
        vigente_desde, dias_devolucion_total, dias_devolucion_parcial,
        porcentaje_total, porcentaje_parcial, porcentaje_fuera_de_plazo, porcentaje_otros_actores
      ) VALUES ('0001-01-01', 7, 2, 100, 50, 0, 100)
      ON CONFLICT (vigente_desde) DO NOTHING
    `);
    const ubicacionesCargadas = await cargarUbicaciones(cliente);
    await cliente.query('COMMIT');
    return { ...catalogosCargados, ...estadosCargados, politica_cancelacion, ...ubicacionesCargadas };
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  }
}

async function main() {
  const { DATABASE_URL } = parse(readFileSync(join(__dirname, '..', '.env')));
  if (!DATABASE_URL) throw new Error('Falta DATABASE_URL en back/.env');
  const { hostname } = new URL(DATABASE_URL);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(hostname);
  const cliente = new Client({
    connectionString: DATABASE_URL,
    connectionTimeoutMillis: 10000,
    ...(local ? {} : { ssl: { rejectUnauthorized: true } }),
  });
  await cliente.connect();
  try {
    const insertados = await cargarDatosBase(cliente);
    console.log(JSON.stringify({ host: hostname, insertados }, null, 2));
  } finally {
    await cliente.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    if (['42P01', '42703'].includes(error.code)) {
      console.error('Aplicá las migraciones del backend antes de ejecutar la seed.');
    } else {
      console.error('No se pudo cargar la seed:', error.code || error.message);
    }
    process.exitCode = 1;
  });
}

module.exports = { cargarDatosBase };
