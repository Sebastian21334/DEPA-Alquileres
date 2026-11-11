require('reflect-metadata');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { crearPostgresPruebas } = require('./soporte/postgres-pruebas.cjs');
const { Estado } = require('../dist/catalogos/entity/estado.entity');
const { ESTADOS_INICIALES } = require('../dist/catalogos/estados');

const migracion = readFileSync(join(__dirname, '../migrations/20261110-estados-por-ambito.sql'), 'utf8');

test('migra estados históricos, conserva los nombres de Disputas y protege cada ámbito', async () => {
  const { db, source, cerrar } = await crearPostgresPruebas({
    estadosDisputa: true,
    estadosPorAmbito: false,
  });
  try {
    await db.exec(`
      INSERT INTO usuario (id_usuario, nombre, apellido, email, telefono, contrasenia)
        VALUES (1, 'Usuario', 'Prueba', 'prueba@example.invalid', '123', 'hash');
      INSERT INTO anunciante (id_usuario, numero_contacto) VALUES (1, '123');
      INSERT INTO reserva (id_reserva, monto_pago, estado_pago, estado_liquidacion)
        VALUES (1, 100, 'CONTRACARGO', 'DEVUELTO_PARCIAL_INQUILINO');
      INSERT INTO pago (id_pago, id_reserva, amount, external_reference, idempotency_key)
        VALUES (1, 1, 100, 'reserva-prueba', 'pago-prueba');
      INSERT INTO solicitud_cancelacion (id_reserva, id_solicitante, motivo, estado)
        VALUES (1, 1, 'Prueba', 'VENCIDA');
      INSERT INTO reembolso (id_reserva, id_pago, tipo, origen, importe, estado, motivo, idempotency_key)
        VALUES (1, 1, 'PARCIAL', 'RECLAMO', 25, 'EN_PROCESO', 'Prueba', 'reembolso-prueba');
      INSERT INTO reclamo_reserva (id_reserva, id_inquilino, categoria, descripcion, estado)
        VALUES (1, 1, 'OTRO', 'Prueba', 'RESUELTO_INQUILINO');
      INSERT INTO solicitud_verificacion (id_anunciante, estado) VALUES (1, 'reenviada');
      INSERT INTO revision_verificacion (id_anunciante, numero_revision, estado)
        VALUES (1, 1, 'rechazada');
      UPDATE estado_disputa SET nombre = 'Ganada en el panel' WHERE codigo = 'GANADA';
      INSERT INTO disputa (id_reserva, id_pago, origen, id_estado_disputa, importe)
        SELECT 1, 1, 'CONTRACARGO', id_estado_disputa, 100
        FROM estado_disputa WHERE codigo = 'GANADA';
    `);

    await db.exec(migracion);
    await db.exec(migracion);

    const { rows: [estados] } = await db.query(`
      SELECT
        (SELECT estado_pago FROM reserva WHERE id_reserva = 1) AS pago,
        (SELECT estado_liquidacion FROM reserva WHERE id_reserva = 1) AS liquidacion,
        (SELECT estado FROM solicitud_cancelacion) AS cancelacion,
        (SELECT estado FROM reembolso) AS reembolso,
        (SELECT estado FROM reclamo_reserva) AS reclamo,
        (SELECT estado FROM solicitud_verificacion) AS solicitud,
        (SELECT estado FROM revision_verificacion) AS revision,
        (SELECT estado FROM disputa) AS disputa
    `);
    assert.deepEqual(estados, {
      pago: 'CONTRACARGO',
      liquidacion: 'DEVUELTO_PARCIAL_INQUILINO',
      cancelacion: 'VENCIDA',
      reembolso: 'EN_PROCESO',
      reclamo: 'RESUELTO_INQUILINO',
      solicitud: 'reenviada',
      revision: 'rechazada',
      disputa: 'GANADA',
    });

    const catalogo = source.getRepository(Estado);
    const ganada = await catalogo.findOneOrFail({
      where: { codigoAmbito: 'DISPUTA', codigo: 'GANADA' },
      relations: { ambito: true },
    });
    assert.equal(ganada.nombre, 'Ganada en el panel');
    assert.equal(ganada.ambito.codigo, 'DISPUTA');
    for (const [codigoAmbito, { estados: definidos }] of Object.entries(ESTADOS_INICIALES)) {
      const filas = await catalogo.findBy({ codigoAmbito });
      assert.deepEqual(filas.map(({ codigo }) => codigo).sort(), Object.keys(definidos).sort());
    }
    assert.equal((await db.query("SELECT to_regclass('public.estado_disputa') AS tabla")).rows[0].tabla, null);

    await assert.rejects(db.exec("UPDATE reserva SET estado_pago = 'GANADA'"), { code: '23503' });
    await assert.rejects(
      db.exec("UPDATE reserva SET ambito_estado_pago = 'DISPUTA', estado_pago = 'GANADA'"),
      { code: '23514' },
    );
    await assert.rejects(
      db.exec("DELETE FROM estado WHERE codigo_ambito = 'DISPUTA' AND codigo = 'GANADA'"),
      { constraint: 'fk_disputa_estado' },
    );

    const nueva = await db.query(`
      INSERT INTO solicitud_cancelacion (id_reserva, id_solicitante, motivo)
        VALUES (1, 1, 'Otra solicitud') RETURNING estado
    `);
    assert.equal(nueva.rows[0].estado, 'PENDIENTE');
    await assert.rejects(
      db.exec("INSERT INTO solicitud_cancelacion (id_reserva, id_solicitante, motivo) VALUES (1, 1, 'Duplicada')"),
      { code: '23505' },
    );
    const disputa = await db.query(`
      INSERT INTO disputa (id_reserva, id_pago, origen, importe)
        VALUES (1, 1, 'CONTRACARGO', 100) RETURNING estado
    `);
    assert.equal(disputa.rows[0].estado, 'ABIERTA');
  } finally {
    await cerrar();
  }
});
