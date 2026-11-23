require('reflect-metadata');
const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const { DataSource } = require('typeorm');
const { ReembolsosService } = require('../dist/reembolsos/service/reembolsos.service');
const { ReembolsosController } = require('../dist/reembolsos/controller/reembolsos.controller');
const { ReembolsosRepository } = require('../dist/reembolsos/repository/reembolsos.repository');
const { Reembolso } = require('../dist/reembolsos/entity/reembolso.entity');

const catalogos = { codigoEstado: (_ambito, codigo) => codigo };

function servicioCon(filas) {
  const reembolsos = { contarPorEstado: async () => filas };
  return new ReembolsosService(reembolsos, {}, {}, {}, catalogos);
}

test('resume pendientes, fallidos y total sin depender del listado truncado', async () => {
  const servicio = servicioCon([
    { estado: 'PENDIENTE', cantidad: '2' },
    { estado: 'EN_PROCESO', cantidad: '3' },
    { estado: 'FALLIDO', cantidad: '1' },
    { estado: 'APROBADO', cantidad: '5' },
    { estado: 'RECHAZADO', cantidad: '4' },
    { estado: 'CANCELADO', cantidad: '6' },
  ]);
  assert.deepEqual(await servicio.resumenAdministracion(), { pendientes: 5, fallidos: 1, total: 21 });
});

test('sin reembolsos devuelve ceros', async () => {
  const servicio = servicioCon([]);
  assert.deepEqual(await servicio.resumenAdministracion(), { pendientes: 0, fallidos: 0, total: 0 });
});

test('el controlador delega el resumen en el servicio', async () => {
  const resumen = { pendientes: 4, fallidos: 2, total: 37 };
  const controlador = new ReembolsosController({ resumenAdministracion: async () => resumen });
  assert.deepEqual(await controlador.resumen(), resumen);
});

// Verifica el SQL real de TypeORM sin conectarse a una base ni modificar datos.
const source = new DataSource({ type: 'postgres', entities: [__dirname + '/../dist/**/*.entity.js'] });
before(async () => source.buildMetadatas());

test('cuenta por estado en SQL con GROUP BY sin límite de filas', async () => {
  const repo = source.getRepository(Reembolso);
  let query;
  const repository = new ReembolsosRepository({ createQueryBuilder(alias) {
    query = repo.createQueryBuilder(alias);
    query.getRawMany = async () => [];
    return query;
  } });
  await repository.contarPorEstado();
  const [sql] = query.getQueryAndParameters();
  assert.match(sql, /COUNT\(\*\)/i);
  assert.match(sql, /GROUP BY/i);
  assert.doesNotMatch(sql, /LIMIT/i);
});
