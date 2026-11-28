const { readFileSync } = require('node:fs');
const path = require('node:path');
const { ORDEN } = require('./orden.cjs');

const CARPETA_MIGRACIONES = path.join(__dirname, '..', '..', 'migrations');
/** Filas que cargan las migraciones y que la aplicación necesita, identificadas por su clave. */
const CATALOGOS = { ambito: ['codigo'], estado: ['codigo_ambito', 'codigo'], configuracion_comision: ['id'] };

const leerMigracion = (nombre) => readFileSync(path.join(CARPETA_MIGRACIONES, nombre), 'utf8');

const CONVERSIONES = /::(?:"[^"]+"|character varying|(?:timestamp|time)(?:\(\d\))? with(?:out)? time zone|double precision|bit varying|[a-z_][\w.]*)(?:\(\d+(?:,\s*\d+)?\))?(?:\[\])*/gi;

/**
 * Cada versión de PostgreSQL escribe distinto las conversiones y los paréntesis de una
 * misma expresión (por ejemplo, `ANY ((ARRAY['A'::varchar])::text[])` y
 * `ANY (ARRAY[('A'::varchar)::text])`). Para comparar se quitan ambos.
 */
const normalizarExpresion = (texto) => texto.replace(CONVERSIONES, '').replace(/[()]/g, '').replace(/\s+/g, ' ').trim();

const sinNombreDeIndice = (definicion) =>
  definicion.replace(/^CREATE (UNIQUE )?INDEX \S+ ON (ONLY )?/, 'CREATE $1INDEX ON ');

/**
 * Lee la estructura del esquema `public` desde el catálogo de PostgreSQL.
 * `consulta(sql)` devuelve las filas; solo ejecuta lecturas.
 * Las restricciones y los índices se identifican por su definición, no por su nombre.
 * Con `search_path` en `pg_catalog`, las definiciones siempre nombran `public.`: el
 * esquema inicial lo vacía y las demás migraciones lo dejan en `public`.
 */
async function fotografiar(consulta) {
  await consulta('SET search_path TO pg_catalog');
  const elementos = new Map();
  const agregar = (clave, tipo, valor, descripcion) => elementos.set(clave, { tipo, valor, descripcion });

  for (const { tabla } of await consulta(`
    SELECT c.relname AS tabla FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p')`))
    agregar(`tabla:${tabla}`, 'tabla', 'existe', `tabla ${tabla}`);

  for (const fila of await consulta(`
    SELECT c.relname AS tabla, a.attname AS columna, format_type(a.atttypid, a.atttypmod) AS tipo,
      a.attnotnull AS no_nulo, a.attidentity AS identidad, pg_get_expr(d.adbin, d.adrelid) AS por_defecto
    FROM pg_attribute a
    JOIN pg_class c ON c.oid = a.attrelid JOIN pg_namespace n ON n.oid = c.relnamespace
    LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p') AND a.attnum > 0 AND NOT a.attisdropped`)) {
    const columna = `${fila.tabla}.${fila.columna}`;
    const valor = `${fila.tipo}${fila.identidad ? ' identity' : ''}${fila.no_nulo ? ' not null' : ''}`;
    agregar(`columna:${columna}`, 'columna', valor, `columna ${columna} (${valor})`);
    if (fila.por_defecto !== null)
      agregar(`por-defecto:${columna}`, 'por-defecto', normalizarExpresion(fila.por_defecto), `valor por defecto de ${columna} (${fila.por_defecto})`);
  }

  for (const { tabla, definicion } of await consulta(`
    SELECT c.relname AS tabla, pg_get_constraintdef(r.oid) AS definicion
    FROM pg_constraint r JOIN pg_class c ON c.oid = r.conrelid JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND r.contype IN ('p', 'u', 'f', 'c', 'x')`))
    agregar(`restriccion:${tabla}:${normalizarExpresion(definicion)}`, 'restriccion', 'existe', `restricción de ${tabla}: ${definicion}`);

  // Los índices propios de una clave primaria, única o de exclusión ya quedan cubiertos por la restricción.
  for (const { tabla, definicion } of await consulta(`
    SELECT c.relname AS tabla, pg_get_indexdef(i.indexrelid) AS definicion
    FROM pg_index i JOIN pg_class c ON c.oid = i.indrelid JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND NOT EXISTS (
      SELECT 1 FROM pg_constraint r WHERE r.conindid = i.indexrelid AND r.contype IN ('p', 'u', 'x'))`)) {
    const definicionSinNombre = sinNombreDeIndice(definicion);
    agregar(`indice:${tabla}:${normalizarExpresion(definicionSinNombre)}`, 'indice', 'existe', `índice de ${tabla}: ${definicionSinNombre}`);
  }

  for (const { nombre, valores } of await consulta(`
    SELECT t.typname AS nombre, string_agg(e.enumlabel, ',' ORDER BY e.enumsortorder) AS valores
    FROM pg_type t JOIN pg_enum e ON e.enumtypid = t.oid JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' GROUP BY t.typname`))
    agregar(`tipo:${nombre}`, 'tipo', valores, `tipo ${nombre} (${valores})`);

  for (const [tabla, columnas] of Object.entries(CATALOGOS)) {
    if (!elementos.has(`tabla:${tabla}`)) continue;
    for (const fila of await consulta(`SELECT ${columnas.join(', ')} FROM public.${tabla}`)) {
      const clave = columnas.map((columna) => String(fila[columna])).join('/');
      agregar(`fila:${tabla}:${clave}`, 'fila', 'existe', `fila ${clave} de ${tabla}`);
    }
  }
  return elementos;
}

/**
 * Arma el esquema esperado aplicando `ORDEN` sobre una base vacía en memoria y
 * registra qué migración crea, cambia o retira cada elemento.
 */
async function construirEsperado() {
  const { PGlite } = require('@electric-sql/pglite');
  const db = new PGlite();
  const consulta = async (sql) => (await db.query(sql)).rows;
  const origen = new Map();
  const retirado = new Map();
  const soloDatos = [];
  try {
    let anterior = await fotografiar(consulta);
    for (const nombre of ORDEN) {
      await db.exec('SET search_path TO public');
      await db.exec(leerMigracion(nombre));
      const actual = await fotografiar(consulta);
      let cambios = 0;
      for (const [clave, elemento] of actual) {
        if (anterior.get(clave)?.valor === elemento.valor) continue;
        origen.set(clave, nombre);
        cambios++;
      }
      for (const clave of anterior.keys()) {
        if (actual.has(clave)) continue;
        retirado.set(clave, nombre);
        cambios++;
      }
      // Sin cambios y sin sentencias de estructura solo toca datos; si tiene, el esquema inicial ya la incluye.
      if (!cambios && !/CREATE TABLE|ALTER TABLE|CREATE (UNIQUE )?INDEX/i.test(leerMigracion(nombre))) soloDatos.push(nombre);
      anterior = actual;
    }
    return { esquema: anterior, origen, retirado, soloDatos };
  } finally {
    await db.close();
  }
}

/**
 * Compara la base real con el esquema esperado. Es un error lo que falta, lo que
 * difiere y lo que una migración retira pero sigue en la base; cada error indica
 * la migración que lo resuelve. Los valores por defecto y los elementos que no
 * crea ninguna migración son advertencias.
 */
function comparar(esperado, real) {
  const errores = [];
  const advertencias = [];
  const informar = (elemento, motivo, migracion) =>
    (elemento.tipo === 'por-defecto' || !migracion ? advertencias : errores).push({ motivo, descripcion: elemento.descripcion, migracion });

  for (const [clave, elemento] of esperado.esquema) {
    const actual = real.get(clave);
    if (!actual) informar(elemento, 'falta', esperado.origen.get(clave));
    else if (actual.valor !== elemento.valor)
      informar(elemento, `difiere: la base tiene ${actual.valor}`, esperado.origen.get(clave));
  }
  for (const [clave, elemento] of real) {
    if (esperado.esquema.has(clave)) continue;
    const migracion = esperado.retirado.get(clave);
    informar(elemento, migracion ? 'debería haberse retirado' : 'no lo crea ninguna migración', migracion);
  }
  const conError = new Set(errores.map(({ migracion }) => migracion));
  return { errores, advertencias, pendientes: ORDEN.filter((nombre) => conError.has(nombre)) };
}

module.exports = { fotografiar, construirEsperado, comparar, normalizarExpresion, leerMigracion, CARPETA_MIGRACIONES };
