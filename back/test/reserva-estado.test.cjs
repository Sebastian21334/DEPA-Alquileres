require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Reserva } = require('../dist/reservas/entity/reserva.entity');
const {
  ReservaEstadoService,
} = require('../dist/reservas/service/reserva-estado.service');
const {
  ReservaCicloVidaService,
} = require('../dist/reservas/service/reserva-ciclo-vida.service');
const {
  ReservaConsultaService,
} = require('../dist/reservas/service/reserva-consulta.service');

function reservaBase() {
  return Object.assign(new Reserva(), {
    id: 1,
    estado_pago: 'APROBADO',
    cancelada: false,
    finalizada: false,
    fecha_inicio: '2030-01-01',
    fecha_fin: '2030-01-02',
    codigo_validado_en: null,
    intentos_codigo: 0,
  });
}

test('la entidad Reserva no expone comportamiento ni estado derivado', () => {
  const reserva = new Reserva();
  assert.equal(typeof reserva.estado_estadia, 'undefined');
  assert.equal(typeof reserva.calcularEstadoEstadia, 'undefined');
  assert.equal(typeof reserva.toJSON, 'undefined');
  assert.equal(typeof reserva.confirmarPago, 'undefined');
  assert.equal(typeof reserva.cancelar, 'undefined');
});

test('el read model conserva estado_estadia en el JSON de la API', () => {
  const estado = new ReservaEstadoService();
  const consulta = new ReservaConsultaService(estado, {
    listarActivosPorReservas: async () => [],
  });
  const respuesta = consulta.paraRespuesta(reservaBase());
  assert.equal(respuesta.estado_estadia, 'CONFIRMADA');
  assert.equal(
    JSON.parse(JSON.stringify(respuesta)).estado_estadia,
    'CONFIRMADA',
  );
});

test('el ciclo de vida conserva las transiciones de la reserva', () => {
  const estado = new ReservaEstadoService();
  const ciclo = new ReservaCicloVidaService(estado);
  const reserva = new Reserva();

  ciclo.confirmarPago(reserva, new Date(), 'ABCD1234');
  assert.equal(reserva.estado_pago, 'APROBADO');
  assert.equal(reserva.estado_liquidacion, 'RETENIDO');
  assert.equal(estado.estaConfirmada(reserva), true);

  ciclo.cancelar(reserva, 'INQUILINO', 'Prueba');
  assert.equal(reserva.cancelada, true);
  assert.equal(reserva.cancelada_por, 'INQUILINO');
  assert.equal(estado.estaConfirmada(reserva), false);

  reserva.pago_vencimiento = new Date(Date.now() + 60_000);
  ciclo.reactivarPago(reserva, new Date(), 'EFGH5678');
  assert.equal(reserva.cancelada, false);
  assert.equal(reserva.estado_pago, 'APROBADO');

  reserva.codigo_alojamiento = 'ABCD1234';
  assert.equal(ciclo.registrarIntentoCodigo(reserva, 'INCORRECTO'), false);
  assert.equal(reserva.intentos_codigo, 1);
  assert.equal(ciclo.registrarIntentoCodigo(reserva, 'abcd1234'), true);
  assert.equal(
    reserva.estado_liquidacion,
    'PENDIENTE_PAGO_PROPIETARIO',
  );
});
