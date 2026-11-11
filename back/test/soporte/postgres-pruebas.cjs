const { EventEmitter } = require('node:events');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { PGlite } = require('@electric-sql/pglite');
const { DataSource } = require('typeorm');
const { cargarDatosBase } = require('../../scripts/seed.cjs');
const tiposPg = require('pg').types;

// Mantiene el SQL y la hidratación de TypeORM/pg, sin conexiones ni datos reales.
async function crearPostgresPruebas({ estadosDisputa = false, estadosPorAmbito = true } = {}) {
  const db = new PGlite({ parsers: {
    1082: tiposPg.getTypeParser(1082),
    1114: tiposPg.getTypeParser(1114),
  } });
  const query = (sql, parametros = []) => db.query(sql, parametros)
    .then((r) => ({ ...r, rowCount: r.affectedRows ?? r.rows.length }));
  class Pool extends EventEmitter {
    connect(callback) {
      const cliente = new EventEmitter();
      cliente.query = (sql, parametros = [], cb) => {
        if (typeof parametros === 'function') { cb = parametros; parametros = []; }
        const resultado = query(sql, parametros);
        if (cb) resultado.then(r => cb(null, r), cb);
        return resultado;
      };
      callback(null, cliente, () => {});
    }
    end(callback) { callback(); }
  }
  const source = new DataSource({
    type: 'postgres', driver: { Pool }, database: 'pruebas',
    entities: [path.join(__dirname, '../../dist/**/*.entity.js').replaceAll('\\', '/')],
    synchronize: false, installExtensions: false,
  });
  const cerrar = async () => {
    try { if (source.isInitialized) await source.destroy(); }
    finally { await db.close(); }
  };
  try {
    const leerMigracion = (nombre) => readFileSync(path.join(__dirname, '../../migrations', nombre), 'utf8');
    for (const nombre of [
      '20261102-esquema-inicial.sql', '20261101-baja-logica-usuario.sql',
      '20261104-cuit-email-historicos.sql', '20261104-orden-imagenes.sql',
      '20261105-eliminacion-documentos.sql',
      '20261111-apelaciones-bloqueo.sql',
    ]) {
      await db.exec('SET search_path TO public');
      await db.exec(leerMigracion(nombre));
    }
    // El comando de migración aplica el circuito y el catálogo en una misma transacción.
    const migraciones = [
      '20261104-cancelaciones-devoluciones.sql',
      ...(estadosDisputa ? ['20261110-estados-disputa.sql'] : []),
      ...(estadosPorAmbito ? ['20261110-estados-por-ambito.sql'] : []),
    ].map(leerMigracion);
    await db.exec(`BEGIN;\n${migraciones.join('\n')}\nCOMMIT;`);
    await db.exec('SET search_path TO public');
    await source.initialize();
    return { db, source, cerrar, cargarSeed: () => cargarDatosBase({ query }) };
  } catch (error) {
    await cerrar();
    throw error;
  }
}

module.exports = { crearPostgresPruebas };
