// Aplica en la base de back/.env solo las migraciones que le faltan, en una transacción.
// Sin argumentos o con --verificar simula y deshace; con --aplicar guarda.
const { ORDEN } = require('./migraciones/orden.cjs');
const { construirEsperado, fotografiar, comparar, leerMigracion } = require('./migraciones/esquema.cjs');
const { crearCliente, mensajeDeError } = require('./migraciones/conexion.cjs');
const { informe } = require('./migraciones/informe.cjs');

/**
 * `cliente.query(sql)` devuelve `{ rows }`. Toma un bloqueo, aplica las migraciones
 * pendientes y vuelve a comparar. Si queda alguna diferencia, deshace todo; si no,
 * guarda solo cuando `aplicar` es true.
 */
async function migrarPendientes(cliente, esperado, { aplicar = false } = {}) {
  const consulta = async (sql) => (await cliente.query(sql)).rows;
  await cliente.query('BEGIN');
  try {
    await cliente.query("SET LOCAL lock_timeout = '10s'");
    await cliente.query("SELECT pg_advisory_xact_lock(hashtext('depa:migrar'))");
    const antes = comparar(esperado, await fotografiar(consulta));
    if (antes.pendientes.includes(ORDEN[0])) {
      const error = new Error('Falta lo que crea el esquema inicial: en una base vacía usá npm run db:inicializar; si tiene datos, revisalo a mano.');
      error.resultado = antes;
      throw error;
    }
    for (const nombre of antes.pendientes) {
      await cliente.query('SET LOCAL search_path TO public');
      try {
        await cliente.query(leerMigracion(nombre));
      } catch (error) {
        error.migracion = nombre;
        throw error;
      }
    }
    const despues = comparar(esperado, await fotografiar(consulta));
    if (despues.errores.length) {
      const error = new Error('Después de aplicar las migraciones todavía hay diferencias; no se guardó nada.');
      error.resultado = despues;
      throw error;
    }
    await cliente.query(aplicar ? 'COMMIT' : 'ROLLBACK');
    return { aplicadas: antes.pendientes, guardado: aplicar, antes };
  } catch (error) {
    await cliente.query('ROLLBACK').catch(() => {});
    throw error;
  }
}

async function main() {
  const argumentos = process.argv.slice(2);
  if (argumentos.some((argumento) => !['--aplicar', '--verificar'].includes(argumento)) ||
      (argumentos.includes('--aplicar') && argumentos.includes('--verificar')))
    throw new Error('Usar sin argumentos, --verificar o --aplicar');
  const aplicar = argumentos.includes('--aplicar');
  const esperado = await construirEsperado();
  const client = crearCliente();
  await client.connect();
  try {
    const { rows: [{ base }] } = await client.query('SELECT current_database() AS base');
    let resultado;
    try {
      resultado = await migrarPendientes(client, esperado, { aplicar });
    } catch (error) {
      if (error.resultado) console.log(informe(base, esperado, error.resultado));
      if (error.migracion) console.log(`Falló al aplicar ${error.migracion}.`);
      throw error;
    }
    console.log(informe(base, esperado, resultado.antes));
    if (!resultado.aplicadas.length) console.log('\nNo hay migraciones para aplicar.');
    else console.log(`\n${resultado.guardado ? 'Aplicadas y guardadas' : 'Simulación correcta (no se guardó nada)'}: ${resultado.aplicadas.join(', ')}.` +
      (resultado.guardado ? '' : '\nPara guardarlas: npm run db:migrar'));
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('No se pudo migrar:', mensajeDeError(error));
    process.exitCode = 1;
  });
}

module.exports = { migrarPendientes };
