// Compara la base de back/.env con el esquema que arman todas las migraciones. Solo lee.
const { construirEsperado, fotografiar, comparar } = require('./migraciones/esquema.cjs');
const { crearCliente, mensajeDeError } = require('./migraciones/conexion.cjs');
const { informe } = require('./migraciones/informe.cjs');

async function main() {
  // Se arma antes de conectarse para no mantener abierta la conexión mientras tanto.
  const esperado = await construirEsperado();
  const client = crearCliente();
  await client.connect();
  let base;
  let real;
  try {
    await client.query('BEGIN TRANSACTION READ ONLY');
    ({ rows: [{ base }] } = await client.query('SELECT current_database() AS base'));
    real = await fotografiar(async (sql) => (await client.query(sql)).rows);
  } finally {
    await client.query('ROLLBACK').catch(() => {});
    await client.end();
  }
  const resultado = comparar(esperado, real);
  console.log(informe(base, esperado, resultado));
  if (resultado.errores.length) {
    console.log('\nPara aplicar lo que falta: node scripts/migrar.cjs --verificar (simula) y después npm run db:migrar.');
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('No se pudo verificar el esquema:', mensajeDeError(error));
  process.exitCode = 1;
});
