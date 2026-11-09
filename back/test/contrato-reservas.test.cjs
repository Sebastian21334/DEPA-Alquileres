require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  ReservaConsultaService,
} = require('../dist/reservas/service/reserva-consulta.service');
const {
  ReservaEstadoService,
} = require('../dist/reservas/service/reserva-estado.service');
const {
  ReclamosController,
} = require('../dist/reclamos/controller/reclamos.controller');
const {
  DisputasController,
} = require('../dist/disputas/controller/disputas.controller');
const {
  ReembolsosController,
} = require('../dist/reembolsos/controller/reembolsos.controller');
const {
  ReservasController,
} = require('../dist/reservas/controller/reservas.controller');

function reserva() {
  return {
    id: 1,
    estado_pago: 'PENDIENTE',
    estado_liquidacion: 'NO_APLICA',
    cancelada: false,
    finalizada: false,
    fecha_inicio: '2030-01-01',
    fecha_fin: '2030-01-02',
    codigo_validado_en: null,
  };
}

function consulta() {
  return new ReservaConsultaService(new ReservaEstadoService(), {
    listarActivosPorReservas: async () => [],
  });
}

test('el mapper de reserva conserva estado_estadia', () => {
  const respuesta = consulta().paraRespuesta(reserva());
  assert.equal(respuesta.estado_estadia, 'PENDIENTE_PAGO');
});

test('el listado administrativo marca las devoluciones activas', async () => {
  const servicio = new ReservaConsultaService(
    new ReservaEstadoService(),
    {
      listarActivosPorReservas: async () => [{ reserva: { id: 1 } }],
    },
  );
  const [respuesta] = await servicio.paraRespuestasAdministracion([
    reserva(),
  ]);
  assert.equal(respuesta.estado_estadia, 'PENDIENTE_PAGO');
  assert.equal(respuesta.tiene_reembolso_activo, true);
  assert.equal(respuesta.fue_cancelada_por_bloqueo, false);

  const [cancelada] = await servicio.paraRespuestasAdministracion([
    {
      ...reserva(),
      cancelada: true,
      cancelada_por: 'ADMINISTRADOR',
      motivo_cancelacion: 'Bloqueo de cuenta del anunciante: Fraude',
    },
  ]);
  assert.equal(cancelada.fue_cancelada_por_bloqueo, true);
});

test('ReclamosController serializa la reserva anidada', async () => {
  const controller = new ReclamosController(
    { obtener: async () => ({ id: 5, reserva: reserva() }) },
    consulta(),
  );
  const respuesta = await controller.obtener(5, {
    user: { id: 7, rol: 'Inquilino' },
  });
  assert.equal(respuesta.reserva.estado_estadia, 'PENDIENTE_PAGO');
});

test('DisputasController serializa la reserva anidada', async () => {
  const controller = new DisputasController(
    { listarAdministracion: async () => [{ id: 3, reserva: reserva() }] },
    consulta(),
  );
  const [respuesta] = await controller.listar();
  assert.equal(respuesta.reserva.estado_estadia, 'PENDIENTE_PAGO');
});

test('ReembolsosController serializa la reserva anidada', async () => {
  const controller = new ReembolsosController(
    { listarAdministracion: async () => [{ id: 2, reserva: reserva() }] },
    consulta(),
  );
  const [respuesta] = await controller.listar();
  assert.equal(respuesta.reserva.estado_estadia, 'PENDIENTE_PAGO');
});

test('ReservasController serializa la solicitud de cancelación', async () => {
  const controller = new ReservasController(
    {},
    {},
    {},
    consulta(),
    {
      solicitarCancelacion: async () => ({
        id: 8,
        estado: 'PENDIENTE',
        reserva: reserva(),
      }),
    },
  );
  const respuesta = await controller.solicitarCancelacion(
    1,
    { motivo: 'Prueba' },
    { user: { id: 7 } },
  );
  assert.equal(respuesta.reserva.estado_estadia, 'PENDIENTE_PAGO');
});

test('la lista administrativa incluye canceladas por bloqueo en NO_APLICA', async () => {
  const { ReservaRepository } = require('../dist/reservas/repository/reserva.repository');
  let consulta = null;
  const builder = {
    leftJoinAndSelect: () => builder,
    where: () => builder,
    orWhere: (sql, parametros) => {
      consulta = { sql, parametros };
      return builder;
    },
    orderBy: () => builder,
    addOrderBy: () => builder,
    getMany: async () => [],
  };
  const repositorio = new ReservaRepository({
    createQueryBuilder: () => builder,
  });

  await repositorio.buscarLiquidacionesAdministracion({
    estados: ['PENDIENTE_PAGO_PROPIETARIO', 'EN_REVISION'],
    incluirCanceladasPorBloqueo: true,
    actorCancelacion: 'ADMINISTRADOR',
    motivoBloqueo: 'Bloqueo de cuenta del anunciante',
  });

  assert.match(consulta.sql, /cancelada_por/);
  assert.equal(consulta.parametros.noAplica, 'NO_APLICA');
  assert.match(consulta.parametros.motivoBloqueo, /Bloqueo de cuenta/);
});
