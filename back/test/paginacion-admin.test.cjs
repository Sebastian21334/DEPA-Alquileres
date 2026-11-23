require('reflect-metadata');
const assert = require('node:assert/strict');
const { test, before } = require('node:test');
const { ValidationPipe } = require('@nestjs/common');
const { DataSource } = require('typeorm');
const { ListarPublicacionesAdministracionDto, ESTADOS_PUBLICACION_ADMINISTRACION } = require('../dist/publicaciones/dto/listar-publicaciones-administracion.dto');
const { paginar } = require('../dist/common/persistence/paginacion');
const { PublicacionesRepository } = require('../dist/publicaciones/repository/publicaciones.repository');
const { UsuariosRepository } = require('../dist/usuarios/repository/usuarios.repository');
const { Publicacion } = require('../dist/publicaciones/entity/publicacion.entity');
const { Usuario } = require('../dist/usuarios/entity/usuario.entity');

const pipe = new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true });
const validar = (value) => pipe.transform(value, { type: 'query', metatype: ListarPublicacionesAdministracionDto });

test('valida y convierte página, tamaño, búsqueda y estado administrativo', async () => {
  assert.deepEqual(await validar({}), new ListarPublicacionesAdministracionDto());
  assert.equal((await validar({})).estado, 'todas');
  for (const estado of ESTADOS_PUBLICACION_ADMINISTRACION)
    assert.equal((await validar({ estado })).estado, estado);
  const dto = await validar({ pagina: '2', limite: '25', q: 'Ana', estado: 'bajas' });
  assert.equal(dto.pagina, 2);
  assert.equal(dto.limite, 25);
  assert.equal(dto.estado, 'bajas');
  for (const value of [
    { pagina: '0' }, { pagina: '-1' }, { pagina: '1.5' }, { pagina: 'abc' },
    { pagina: 'Infinity' }, { pagina: '1000001' }, { limite: '0' },
    { limite: '101' }, { q: ['Ana'] }, { q: 'a'.repeat(201) }, { desconocido: 1 },
    { estado: '' }, { estado: 'ACTIVAS' }, { estado: 'eliminadas' },
    { estado: ['activas'] }, { estado: null },
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

test('publicaciones: filtra los cuatro estados administrativos en SQL', async () => {
  const repo = source.getRepository(Publicacion);
  const consultar = async (estado) => {
    let query;
    const repository = new PublicacionesRepository({ createQueryBuilder(alias) {
      query = repo.createQueryBuilder(alias);
      query.clone = () => ({ getCount: async () => 0 });
      return query;
    } }, {});
    await repository.buscarAdministracion({ pagina: 1, limite: 10, estado });
    return query.getSql();
  };
  assert.doesNotMatch(await consultar('todas'), /WHERE/);
  const activas = await consultar('activas');
  assert.match(activas, /"publicacion"\."activa" = true/);
  assert.match(activas, /"publicacion"\."motivo_baja_admin" IS NULL/);
  const inactivas = await consultar('inactivas');
  assert.match(inactivas, /"publicacion"\."activa" = false/);
  assert.match(inactivas, /"publicacion"\."motivo_baja_admin" IS NULL/);
  const bajas = await consultar('bajas');
  assert.match(bajas, /"publicacion"\."motivo_baja_admin" IS NOT NULL/);
  assert.doesNotMatch(bajas, /"publicacion"\."activa" =/);
  assert.doesNotMatch(await consultar(undefined), /WHERE/);
});
