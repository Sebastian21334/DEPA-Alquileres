require('reflect-metadata');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { crearPostgresPruebas } = require('./soporte/postgres-pruebas.cjs');
const { CatalogosService } = require('../dist/catalogos/service/catalogos.service');
const { CatalogosRepository } = require('../dist/catalogos/repository/catalogos.repository');
const { Rol } = require('../dist/catalogos/entity/rol.entity');
const { Estado } = require('../dist/catalogos/entity/estado.entity');
const { provincias } = require('../scripts/datos-iniciales/ubicaciones.json');

test('la seed completa una base parcial y se puede repetir sin duplicar datos', async () => {
  const { db, source, cerrar, cargarSeed } = await crearPostgresPruebas();
  try {
    const repositorio = new CatalogosRepository(
      source.getRepository(Rol), undefined, undefined, undefined, undefined, source.getRepository(Estado),
    );
    const servicio = new CatalogosService(repositorio);
    const { rows: [cordoba] } = await db.query(
      "INSERT INTO provincia (nombre) VALUES ('Cordoba') RETURNING id_provincia",
    );
    await db.query(
      "INSERT INTO ciudad (nombre, id_provincia) VALUES ('Villa Maria', $1)",
      [cordoba.id_provincia],
    );
    await db.exec(`
      INSERT INTO provincia (nombre) VALUES ('CABA');
      INSERT INTO rol (nombre, descripcion) VALUES ('Administrador', 'Descripción propia');
      INSERT INTO tipo_moneda (nombre) VALUES ('Dólar estadounidense');
      DELETE FROM estado WHERE codigo_ambito = 'DISPUTA' AND codigo = 'GANADA';
      UPDATE estado SET nombre = 'Etiqueta del panel' WHERE codigo_ambito = 'DISPUTA' AND codigo = 'ABIERTA';
    `);
    await assert.rejects(servicio.onModuleInit(), /rol Inquilino.*DISPUTA\/GANADA.*db:seed/);

    const primera = await cargarSeed();
    assert.equal(primera.rol, 1);
    assert.equal(primera.estado, 1);
    assert.equal(primera.tipo_moneda, 1);
    assert.equal(primera.modalidad, 2);
    assert.equal(primera.tipo_anunciante, 2);
    assert.equal(primera.tipo_propiedad, 11);
    assert.equal(primera.provincia, provincias.length - 2);
    assert.equal(primera.ciudad, provincias.reduce((total, provincia) => total + provincia.localidades.length, 0) - 1);
    await servicio.onModuleInit();

    const segunda = await cargarSeed();
    assert.ok(Object.values(segunda).every((cantidad) => cantidad === 0));
    assert.equal((await repositorio.buscarRolPorNombre('Administrador')).descripcion, 'Descripción propia');
    assert.equal((await repositorio.buscarEstadoPorCodigo('DISPUTA', 'ABIERTA')).nombre, 'Etiqueta del panel');
    const inquilino = await repositorio.buscarRolPorNombre('Inquilino');
    await assert.rejects(servicio.actualizarRol(inquilino.id, { nombre: 'Otro nombre' }), /debe conservar su nombre/);
    await assert.rejects(servicio.eliminarRol(inquilino.id), /necesario para el sistema/);
    const editado = await servicio.actualizarRol(inquilino.id, { nombre: 'Inquilino', descripcion: 'Descripción editada' });
    assert.equal(editado.descripcion, 'Descripción editada');
    await servicio.onModuleInit();
    const { rows: ciudades } = await db.query(
      "SELECT nombre FROM ciudad WHERE id_provincia = $1 AND nombre IN ('Villa Maria', 'Villa María')",
      [cordoba.id_provincia],
    );
    assert.deepEqual(ciudades, [{ nombre: 'Villa Maria' }]);
    assert.equal((await db.query('SELECT count(*)::int AS total FROM usuario')).rows[0].total, 0);
  } finally {
    await cerrar();
  }
});
