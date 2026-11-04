require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const { ReservaFinalizacionService } = require('../dist/reservas/service/reserva-finalizacion.service');
const { Reserva } = require('../dist/reservas/entity/reserva.entity');

// Ejecuta los predicados construidos por el servicio sobre una base aislada.
function base() {
  const db = new DatabaseSync(':memory:');
  db.exec(`CREATE TABLE reserva (id INTEGER PRIMARY KEY, finalizada BOOLEAN, cancelada BOOLEAN,
    estado_pago TEXT, codigo_validado_en TEXT, fecha_inicio TEXT, fecha_fin TEXT,
    estado_liquidacion TEXT)`);
  const insert = db.prepare('INSERT INTO reserva VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const filas = [
    [1,0,0,'APROBADO','2030-01-01','2030-01-01','2030-01-02','EN_REVISION'],
    [2,0,0,'APROBADO',null,'2030-01-01','2030-01-02','RETENIDO'],
    [3,0,0,'PENDIENTE','2030-01-01','2030-01-01','2030-01-02','RETENIDO'],
    [4,0,1,'APROBADO','2030-01-01','2030-01-01','2030-01-02','RETENIDO'],
    [5,0,0,'APROBADO','2030-01-01','2030-01-01','2030-01-03','RETENIDO'],
    [6,0,0,'APROBADO','2030-01-01',null,'2030-01-02','RETENIDO'],
    [7,0,0,'APROBADO','2030-01-01','2030-01-04','2030-01-02','RETENIDO'],
    [8,1,0,'APROBADO','2030-01-01','2030-01-01','2030-01-02','RETENIDO'],
    [9,0,0,'REEMBOLSADO','2030-01-01','2030-01-01','2030-01-02','RETENIDO'],
  ];
  for (const fila of filas) insert.run(...fila);
  const repo = { createQueryBuilder() {
    const conditions = [], params = {};
    const builder = {
      update() { return this; },
      set(values) { assert.deepEqual(values, { finalizada: true }); return this; },
      where(sql, values = {}) { conditions.push(sql); Object.assign(params, values); return this; },
      andWhere(sql, values = {}) { return this.where(sql, values); },
      async execute() { return db.prepare(`UPDATE reserva SET finalizada = 1 WHERE ${conditions.join(' AND ')}`).run(params); },
    };
    return builder;
  }};
  return { db, service: new ReservaFinalizacionService(repo) };
}

test('cierra solo estadías vencidas con pago e ingreso verificados, y conserva la liquidación', async () => {
  const { db, service } = base();
  try {
    // Todavía es 2 de enero en Argentina.
    await service.ejecutar(new Date('2030-01-03T02:59:59Z'));
    assert.equal(db.prepare('SELECT finalizada FROM reserva WHERE id = 1').get().finalizada, 0);
    await service.ejecutar(new Date('2030-01-03T03:00:00Z'));
    const rows = db.prepare('SELECT id, finalizada, estado_liquidacion FROM reserva ORDER BY id').all();
    assert.deepEqual(rows.filter(r => r.finalizada).map(r => r.id), [1,8]);
    assert.equal(rows[0].estado_liquidacion, 'EN_REVISION');
    await service.ejecutar(new Date('2030-01-03T03:01:00Z'));
    assert.deepEqual(db.prepare('SELECT id FROM reserva WHERE finalizada = 1 ORDER BY id').all().map(r => r.id), [1,8]);
  } finally { db.close(); }
});

test('estado calculado respeta el último día, el ingreso y las fechas inválidas', () => {
  const reserva = Object.assign(new Reserva(), { estado_pago: 'APROBADO', cancelada: false,
    finalizada: false, fecha_inicio: '2030-01-01', fecha_fin: '2030-01-02', codigo_validado_en: new Date() });
  assert.equal(reserva.calcularEstadoEstadia(new Date('2030-01-03T02:59:59Z')), 'EN_CURSO');
  assert.equal(reserva.calcularEstadoEstadia(new Date('2030-01-03T03:00:00Z')), 'FINALIZADA');
  reserva.codigo_validado_en = null;
  assert.equal(reserva.calcularEstadoEstadia(new Date('2030-01-03T03:00:00Z')), 'INGRESO_NO_VERIFICADO');
  reserva.fecha_inicio = '2030-01-04';
  assert.equal(reserva.calcularEstadoEstadia(new Date('2030-01-03T03:00:00Z')), 'FECHAS_A_REVISAR');
});

test('si falla una ejecución se vuelve a intentar en la siguiente', async () => {
  const { db, service } = base();
  const crear = service.reservas.createQueryBuilder.bind(service.reservas);
  let primerIntento = true;
  service.reservas.createQueryBuilder = () => {
    if (primerIntento) { primerIntento = false; throw new Error('base no disponible'); }
    return crear();
  };
  service.logger.error = () => {};
  try {
    await service.ejecutar(new Date('2030-01-03T03:00:00Z'));
    assert.equal(db.prepare('SELECT finalizada FROM reserva WHERE id = 1').get().finalizada, 0);
    await service.ejecutar(new Date('2030-01-03T03:01:00Z'));
    assert.equal(db.prepare('SELECT finalizada FROM reserva WHERE id = 1').get().finalizada, 1);
  } finally { db.close(); }
});
