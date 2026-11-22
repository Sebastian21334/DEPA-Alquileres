const { test } = require('node:test');
const assert = require('node:assert/strict');
const { CatalogosRepository } = require('../dist/catalogos/repository/catalogos.repository');
const { CatalogosService } = require('../dist/catalogos/service/catalogos.service');

const casos = [
  ['Rol', 'usuario', 'id_rol'],
  ['TipoAnunciante', 'anunciante', 'id_tipo_anunciante'],
  ['TipoPropiedad', 'publicacion', 'id_tipo_propiedad'],
  ['Modalidad', 'publicacion', 'id_modalidad'],
  ['TipoMoneda', 'publicacion', 'id_tipo_moneda'],
];

for (const [tipo, tabla, columna] of casos) {
  test(`${tipo}: impide modificar registros en uso y permite los libres`, async () => {
    let enUso = true, actualizaciones = 0;
    const item = { id: 42, nombre: 'Original', permite_reservas_por_fecha: false };
    const repoTransaccion = {
      createQueryBuilder: () => ({ where() { return this; }, setLock(modo) { assert.equal(modo, 'pessimistic_write'); return this; }, async getOne() { return item; } }),
      async update(id, datos) { actualizaciones++; Object.assign(item, datos); },
      async findOneBy() { return item; },
    };
    const repo = {
      target: tipo,
      async findOneBy(criterio) { return criterio.id ? item : null; },
      manager: { async transaction(fn) { return fn({ getRepository: () => repoTransaccion, async query(sql, params) {
        assert.match(sql, new RegExp(`FROM "${tabla}" WHERE "${columna}"`));
        assert.deepEqual(params, [42]);
        return enUso ? [{ '?column?': 1 }] : [];
      } }); } },
    };
    const repos = Array(6).fill(repo);
    const servicio = new CatalogosService(new CatalogosRepository(...repos));
    await assert.rejects(() => servicio[`actualizar${tipo}`](42, { nombre: 'Nuevo' }), e => e.status === 409 && /no se puede modificar.*en uso/i.test(e.message));
    assert.equal(actualizaciones, 0);
    enUso = false;
    const resultado = await servicio[`actualizar${tipo}`](42, { nombre: 'Nuevo' });
    assert.equal(resultado.nombre, 'Nuevo');
    assert.equal(actualizaciones, 1);
  });
}
