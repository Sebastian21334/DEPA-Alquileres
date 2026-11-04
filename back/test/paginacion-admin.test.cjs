require('reflect-metadata');
const assert = require('node:assert/strict');
const { test, before } = require('node:test');
const { ValidationPipe } = require('@nestjs/common');
const { DataSource } = require('typeorm');
const { ListarAdministracionDto } = require('../dist/common/dto/listar-administracion.dto');
const { paginar } = require('../dist/common/paginacion');
const { PublicacionesRepository } = require('../dist/publicaciones/repository/publicaciones.repository');
const { UsuariosRepository } = require('../dist/usuarios/repository/usuarios.repository');
const { Publicacion } = require('../dist/publicaciones/entity/publicacion.entity');
const { Usuario } = require('../dist/usuarios/entity/usuario.entity');

const pipe = new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true });
const validar = (value) => pipe.transform(value, { type: 'query', metatype: ListarAdministracionDto });

test('valida y convierte página, tamaño y búsqueda', async () => {
  assert.deepEqual(await validar({}), new ListarAdministracionDto());
  const dto = await validar({ pagina: '2', limite: '25', q: 'Ana' });
  assert.equal(dto.pagina, 2);
  assert.equal(dto.limite, 25);
  for (const value of [
    { pagina: '0' }, { pagina: '-1' }, { pagina: '1.5' }, { pagina: 'abc' },
    { pagina: 'Infinity' }, { pagina: '1000001' }, { limite: '0' },
    { limite: '101' }, { q: ['Ana'] }, { q: 'a'.repeat(201) }, { desconocido: 1 },
  ]) await assert.rejects(validar(value));
});

test('una página fuera de rango vuelve a la última página disponible', async () => {
  const filas = Array.from({ length: 23 }, (_, id) => ({ id: id + 1 }));
  const query = {
    clone() { return this; },
    async getCount() { return filas.length; },
    skip(value) { this.inicio = value; return this; },
    take(value) { this.limite = value; return this; },
    async getMany() { return filas.slice(this.inicio, this.inicio + this.limite); },
  };
  const resultado = await paginar(query, { pagina: 9, limite: 10 });
  assert.equal(resultado.pagina, 3);
  assert.equal(resultado.totalPaginas, 3);
  assert.equal(resultado.total, 23);
  assert.deepEqual(resultado.datos.map(r => r.id), [21, 22, 23]);
});

test('sin resultados devuelve la página uno vacía sin consultar filas', async () => {
  const resultado = await paginar({
    clone() { return this; }, async getCount() { return 0; },
    getMany() { assert.fail('No hay filas que cargar'); },
  }, { pagina: 5, limite: 10 });
  assert.deepEqual(resultado, { datos: [], pagina: 1, limite: 10, total: 0, totalPaginas: 1 });
});

// Construye SQL real de TypeORM sin conectarse a una base ni modificar datos.
const source = new DataSource({ type: 'postgres', entities: [__dirname + '/../dist/**/*.entity.js'] });
before(async () => source.buildMetadatas());

for (const [nombre, entidad, crear] of [
  ['publicaciones', Publicacion, repo => new PublicacionesRepository(repo, {})],
  ['usuarios', Usuario, repo => new UsuariosRepository(repo)],
]) {
  test(`${nombre}: filtra en SQL, parametriza búsqueda y limita las filas`, async () => {
    const repo = source.getRepository(entidad);
    let query;
    const repository = crear({ createQueryBuilder(alias) {
      query = repo.createQueryBuilder(alias);
      query.clone = () => ({ getCount: async () => 25 });
      query.getMany = async () => [];
      return query;
    } });
    const buscar = nombre === 'publicaciones' ? 'buscarAdministracion' : 'listarAdministracion';
    await repository[buscar]({ pagina: 2, limite: 10, q: "  ANA%_'  " });
    const [sql, params] = query.getQueryAndParameters();
    assert.match(sql, /POSITION\(\$1 IN LOWER\(CONCAT_WS/);
    assert.deepEqual(params, ["ana%_'"]);
    assert.equal(query.expressionMap.skip, 10);
    assert.equal(query.expressionMap.take, 10);
    assert.match(sql, /ORDER BY/);
    assert.doesNotMatch(sql, /contrasenia|token_recuperacion|token_verificacion/);
    if (nombre === 'publicaciones') assert.doesNotMatch(sql, /WHERE.*activa/);
  });
}
