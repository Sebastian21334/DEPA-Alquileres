require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { PGlite } = require('@electric-sql/pglite');
const { OperacionesLiquidacionService } = require('../dist/operaciones-reserva/service/operaciones-liquidacion.service');
const { ComisionDto } = require('../dist/catalogos/dto/comision.dto');
const { validate } = require('class-validator');
const { CatalogosController } = require('../dist/catalogos/controller/catalogos.controller');
const { GUARDS_METADATA } = require('@nestjs/common/constants');
const { catalogosDePrueba } = require('./soporte/catalogos-pruebas.cjs');

test('migración conserva reservas anteriores y configuración al repetirse', async () => {
  const db = new PGlite();
  try {
    await db.exec('CREATE TABLE reserva (id integer primary key); INSERT INTO reserva VALUES (1)');
    const migracion = readFileSync('migrations/20261122-comision-depa.sql', 'utf8');
    await db.exec(migracion);
    assert.equal((await db.query('SELECT porcentaje_comision_depa FROM reserva WHERE id = 1')).rows[0].porcentaje_comision_depa, null);
    assert.equal(Number((await db.query('SELECT porcentaje FROM configuracion_comision')).rows[0].porcentaje), 10);
    await db.query('UPDATE configuracion_comision SET porcentaje = $1', [12]);
    await db.exec(migracion);
    assert.equal(Number((await db.query('SELECT porcentaje FROM configuracion_comision')).rows[0].porcentaje), 12);
  } finally { await db.close(); }
});

test('comisión neta redondeada, reserva histórica y devolución', () => {
  const servicio = new OperacionesLiquidacionService();
  assert.deepEqual(servicio.calcularComision({ porcentaje_comision_depa: 10 }, 100000, false), { importe_comision_depa: 10000, importe_neto_anunciante: 90000 });
  assert.deepEqual(servicio.calcularComision({ porcentaje_comision_depa: null }, 100000, false), { importe_comision_depa: 0, importe_neto_anunciante: 100000 });
  assert.deepEqual(servicio.calcularComision({ porcentaje_comision_depa: 10 }, 70000, true), { importe_comision_depa: 0, importe_neto_anunciante: 70000 });
  assert.deepEqual(servicio.calcularComision({ porcentaje_comision_depa: 10 }, 0.05, false), { importe_comision_depa: 0.01, importe_neto_anunciante: 0.04 });
});

test('configuración rechaza valores inválidos y protege lectura y escritura', async () => {
  for (const porcentaje of [-1, 100.01, 1.001, '10', null]) {
    assert.ok((await validate(Object.assign(new ComisionDto(), { porcentaje }))).length);
  }
  for (const porcentaje of [0, 10, 99.99, 100]) {
    assert.equal((await validate(Object.assign(new ComisionDto(), { porcentaje }))).length, 0);
  }
  for (const metodo of ['obtenerComision', 'actualizarComision']) {
    const fn = CatalogosController.prototype[metodo];
    assert.equal(Reflect.getMetadata(GUARDS_METADATA, fn).length, 2);
    assert.deepEqual(Reflect.getMetadata('roles', fn), ['Administrador']);
  }
});

test('al registrar el pago total se guarda el neto con la comisión de la reserva', async () => {
  let datosGuardados;
  const reserva = { id: 1, monto_pago: 100000, porcentaje_comision_depa: 10, estado_pago: 'APROBADO', estado_liquidacion: 'PENDIENTE_PAGO_PROPIETARIO', fecha_inicio: '2020-01-01', fecha_fin: '2020-01-02', publicacion: { anunciante: { idUsuario: 2 } } };
  const reservas = { conReservaBloqueada: async (_, fn) => { await fn(reserva, {}); return reserva; }, pagoAprobado: () => true, liquidacionResuelta: () => false, liquidacionEnRevision: () => false };
  const liquidaciones = { fechaDisponiblePagoManual: () => '2020-01-07', registrarResolucion: async (_, __, datos) => { datosGuardados = datos; } };
  const reembolsos = { listarPorReserva: async () => [], buscarPagoPorReserva: async () => ({ amount: 100000, amount_refunded: 0, currency: 'ARS' }), saldoReembolsable: () => 100000 };
  const servicio = new OperacionesLiquidacionService(reembolsos, reservas, liquidaciones, catalogosDePrueba(), { buscarCbuValidado: async () => '123' }, { tieneReclamoAbierto: async () => false });
  await servicio.resolverLiquidacion(1, { estado: 'PAGADO_PROPIETARIO' }, 3);
  assert.equal(datosGuardados.importe, 90000);
});
