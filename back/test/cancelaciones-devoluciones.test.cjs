const { catalogosDePrueba } = require('./soporte/catalogos-pruebas.cjs');
require('reflect-metadata');
const assert = require('node:assert/strict');
const { test, before, beforeEach, after } = require('node:test');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { DataSource } = require('typeorm');
const { crearPostgresPruebas } = require('./soporte/postgres-pruebas.cjs');
const { Reserva } = require('../dist/reservas/entity/reserva.entity');
const { Liquidacion } = require('../dist/liquidaciones/entity/liquidacion.entity');
const { LiquidacionRepository } = require('../dist/liquidaciones/repository/liquidacion.repository');
const { LiquidacionesService } = require('../dist/liquidaciones/service/liquidaciones.service');
const { Pago } = require('../dist/pagos/entity/pago.entity');
const { PagosService } = require('../dist/pagos/service/pagos.service');
const { PagosRepository } = require('../dist/pagos/repository/pagos.repository');
const { Reembolso, OrigenReembolso, TipoReembolso } = require('../dist/reembolsos/entity/reembolso.entity');
const { ReembolsosService } = require('../dist/reembolsos/service/reembolsos.service');
const { ReembolsosRepository } = require('../dist/reembolsos/repository/reembolsos.repository');
const { ReservasService } = require('../dist/reservas/service/reservas.service');
const { OperacionesReembolsoService } = require('../dist/operaciones-reserva/service/operaciones-reembolso.service');
const { ReservaRepository } = require('../dist/reservas/repository/reserva.repository');
const { ReservaEstadoService } = require('../dist/reservas-consulta/service/reserva-estado.service');
const { SolicitudCancelacion } = require('../dist/cancelaciones/entity/solicitud-cancelacion.entity');
const { CancelacionesService } = require('../dist/cancelaciones/service/cancelaciones.service');
const { CancelacionesRepository } = require('../dist/cancelaciones/repository/cancelaciones.repository');
const { PublicacionesService } = require('../dist/publicaciones/service/publicaciones.service');
const { CatalogosService } = require('../dist/catalogos/service/catalogos.service');
const { ReclamosService } = require('../dist/reclamos/service/reclamos.service');
const { ReclamosRepository } = require('../dist/reclamos/repository/reclamos.repository');
const { Reclamo, ResolucionReclamo } = require('../dist/reclamos/entity/reclamo.entity');
const { ReclamoMensaje } = require('../dist/reclamos/entity/reclamo-mensaje.entity');
const { ReclamoEvidencia } = require('../dist/reclamos/entity/reclamo-evidencia.entity');

let base, db, source;
const migracion = nombre => readFileSync(path.join(__dirname, '../migrations', nombre), 'utf8');
const sqlEstadosDisputa = migracion('20261110-estados-disputa.sql');
const sqlEstadosPorAmbito = migracion('20261110-estados-por-ambito.sql');
let reembolsos, reservas, cancelaciones, repositorioCancelaciones, operacionesReembolso, disponibilidad, reclamos, pasarela;

before(async () => {
  base = await crearPostgresPruebas();
  ({ db, source } = base);
  await db.exec(`
    INSERT INTO rol (id_rol,nombre) VALUES (1,'Inquilino'),(2,'Anunciante'),(3,'Administrador');
    INSERT INTO usuario (id_usuario,nombre,apellido,email,telefono,contrasenia,email_verificado,id_rol)
      SELECT id,'Prueba','Integración','usuario' || id || '@example.invalid','123','hash',true,LEAST(id,3)
      FROM generate_series(1,4) AS id;
    INSERT INTO anunciante (id_usuario,numero_contacto) VALUES (2,'123');
    INSERT INTO publicacion (id_publicacion,titulo,descripcion,fecha_publicacion,precio,direccion,cantidad_ambientes,superficie,id_anunciante)
      VALUES (1,'Publicación de prueba','Integración',CURRENT_DATE,100,'Dirección',1,30,2);
  `);
  await base.cargarSeed();
});

beforeEach(async () => {
  await db.exec('TRUNCATE reserva RESTART IDENTITY CASCADE');
  pasarela = { reembolsar: async (_id, importe) => ({ id: 'mp-refund-1', status: 'approved', amount: importe }) };
  const estadoReserva = new ReservaEstadoService(new PublicacionesService({}, catalogosDePrueba()), catalogosDePrueba());
  reembolsos = new ReembolsosService(
    new ReembolsosRepository(source.getRepository(Reembolso)),
    pasarela,
    new PagosService(new PagosRepository(source.getRepository(Pago))),
    estadoReserva, catalogosDePrueba(),
  );
  const repositorio = new ReservaRepository(source.getRepository(Reserva));
  disponibilidad = { liberarReserva: async () => {} };
  const liquidaciones = new LiquidacionesService(new LiquidacionRepository(source.getRepository(Liquidacion)), catalogosDePrueba());
  reservas = new ReservasService({}, repositorio, disponibilidad, {}, {}, {}, reembolsos, estadoReserva,
    liquidaciones, catalogosDePrueba());
  repositorioCancelaciones = new CancelacionesRepository(source.getRepository(SolicitudCancelacion));
  cancelaciones = new CancelacionesService(repositorioCancelaciones, reservas, reembolsos, catalogosDePrueba());
  reclamos = new ReclamosService(
    new ReclamosRepository(source.getRepository(Reclamo), source.getRepository(ReclamoEvidencia),
      source.getRepository(ReclamoMensaje)),
    reservas, reembolsos, {}, catalogosDePrueba(),
  );
  operacionesReembolso = new OperacionesReembolsoService(reembolsos, reservas, reclamos);
});

after(async () => {
  if (base) await base.cerrar();
});

async function escenario(fechaInicio = '2099-01-10') {
  const reserva = await source.getRepository(Reserva).save({
    monto_pago: 100, estado_pago: 'APROBADO',
    usuario: { id: 1 }, publicacion: { id: 1 }, fecha_inicio: fechaInicio, fecha_fin: '2099-01-20',
  });
  const pago = await source.getRepository(Pago).save({
    reserva, amount: 100, currency: 'ARS', status: 'approved',
    payment_id: 'mp-1', payment_method_id: 'account_money', external_reference: 'reserva-prueba', idempotency_key: 'clave-pago-prueba',
  });
  const crearReembolso = (datos = {}) => reembolsos.crearSolicitud({
    reserva, pago, importe: 100, tipo: TipoReembolso.TOTAL, origen: OrigenReembolso.CANCELACION,
    motivo: 'Cancelación de prueba', idSolicitadoPor: 3, ...datos,
  });
  return { reserva, pago, crearReembolso };
}

test('la migración de estados por ámbito es repetible y conserva reservas y pagos', async () => {
  const { reserva, pago } = await escenario();
  await db.exec(sqlEstadosPorAmbito);
  assert.equal((await source.getRepository(Reserva).findOneByOrFail({ id: reserva.id })).estado_pago, 'APROBADO');
  assert.equal(Number((await source.getRepository(Pago).findOneByOrFail({ id: pago.id })).amount), 100);
});

test('la migración conserva las claves históricas y separa los aprobados ambiguos', async () => {
  const anterior = await crearPostgresPruebas({ aplicacionReembolsos: false });
  try {
    await anterior.cargarSeed();
    await anterior.db.exec(`
      INSERT INTO reserva (id_reserva, monto_pago) VALUES (21, 100), (22, 100);
      INSERT INTO pago (id_pago, id_reserva, amount, currency, external_reference, idempotency_key)
        VALUES (21, 21, 100, 'ARS', 'reserva:21', 'pago:21'), (22, 22, 100, 'ARS', 'reserva:22', 'pago:22');
      INSERT INTO reembolso (id_pago, id_reserva, importe, tipo, origen, motivo, estado, idempotency_key, resuelto_en)
        VALUES (21, 21, 20, 'PARCIAL', 'AJUSTE_ADMIN', 'Histórico con evidencia', 'APROBADO', 'liq:21:p:2000', '2026-10-01'),
               (22, 22, 30, 'PARCIAL', 'AJUSTE_ADMIN', 'Histórico ambiguo', 'APROBADO', 'liq:22:p:3000', '2026-10-01');
      INSERT INTO liquidacion (id_reserva, estado, importe, moneda, fecha_resolucion)
        VALUES (21, 'DEVUELTO_PARCIAL_INQUILINO', 20, 'ARS', '2026-10-02');
    `);
    const sql = migracion('20261113-aplicacion-reembolsos.sql');
    await anterior.db.exec(sql);
    await anterior.db.exec(`
      INSERT INTO reembolso (id_pago, id_reserva, importe, tipo, origen, motivo, estado, idempotency_key)
        VALUES (22, 22, 10, 'PARCIAL', 'AJUSTE_ADMIN', 'Pendiente nuevo', 'APROBADO', 'liquidacion-nueva');
    `);
    await anterior.db.exec(sql);
    const { rows } = await anterior.db.query(`
      SELECT idempotency_key, referencia_interna, aplicado_en IS NOT NULL AS aplicado, revision_aplicacion
      FROM reembolso ORDER BY id_reembolso
    `);
    assert.deepEqual(rows, [
      { idempotency_key: 'liq:21:p:2000', referencia_interna: 'liq:21', aplicado: true, revision_aplicacion: false },
      { idempotency_key: 'liq:22:p:3000', referencia_interna: 'liq:22', aplicado: false, revision_aplicacion: true },
      { idempotency_key: 'liquidacion-nueva', referencia_interna: null, aplicado: false, revision_aplicacion: false },
    ]);
  } finally { await anterior.cerrar(); }
});

test('la migración distingue las cancelaciones históricas por bloqueo del resto', async () => {
  await db.exec(`
    ALTER TABLE reserva DROP COLUMN causa_cancelacion;
    INSERT INTO reserva (monto_pago, cancelada, cancelada_por, motivo_cancelacion) VALUES
      (100, true, 'ADMINISTRADOR', 'Bloqueo de cuenta del anunciante: prueba'),
      (100, true, 'ADMINISTRADOR', 'Cancelación administrativa'),
      (100, true, 'INQUILINO', 'Bloqueo de cuenta del anunciante: prueba');
  `);
  const sql = migracion('20261112-causa-cancelacion-reserva.sql');
  await db.exec(sql);
  await db.exec(sql);
  const { rows } = await db.query('SELECT causa_cancelacion FROM reserva ORDER BY id_reserva');
  assert.deepEqual(rows.map(({ causa_cancelacion }) => causa_cancelacion), [
    'BLOQUEO_ANUNCIANTE', null, null,
  ]);
});

test('la migración conserva los estados de las disputas existentes y su valor por defecto', async () => {
  const { PGlite } = require('@electric-sql/pglite');
  const anterior = new PGlite();
  try {
    await anterior.exec(`
      CREATE TYPE public.disputa_estado_enum AS ENUM ('ABIERTA', 'EN_REVISION', 'GANADA', 'PERDIDA', 'CERRADA');
      CREATE TABLE public.disputa (
        id_disputa integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
        estado public.disputa_estado_enum NOT NULL DEFAULT 'ABIERTA'
      );
      INSERT INTO public.disputa (estado) VALUES ('ABIERTA'), ('EN_REVISION'), ('GANADA'), ('PERDIDA'), ('CERRADA');
    `);
    const consultar = () => anterior.query(`
      SELECT disputa.id_disputa, estado.codigo
      FROM disputa JOIN estado_disputa estado USING (id_estado_disputa)
      ORDER BY disputa.id_disputa
    `);
    await anterior.exec(sqlEstadosDisputa);
    const { rows: migradas } = await consultar();
    assert.deepEqual(migradas, ['ABIERTA', 'EN_REVISION', 'GANADA', 'PERDIDA', 'CERRADA']
      .map((codigo, indice) => ({ id_disputa: indice + 1, codigo })));
    await anterior.exec(sqlEstadosDisputa);
    assert.deepEqual((await consultar()).rows, migradas);
    await anterior.exec('INSERT INTO disputa DEFAULT VALUES');
    assert.equal((await consultar()).rows.at(-1).codigo, 'ABIERTA');
    await assert.rejects(anterior.exec('UPDATE disputa SET id_estado_disputa = -1'), { code: '23503' });
  } finally {
    await anterior.close();
  }
});

test('el reembolso manual se confirma una sola vez usando el pago persistido', async () => {
  const { pago, crearReembolso } = await escenario();
  const reembolso = await crearReembolso();
  assert.equal((await reembolsos.registrarManual(reembolso.id, 'comprobante-1', 3)).estado, 'APROBADO');
  await reembolsos.registrarManual(reembolso.id, 'comprobante-1', 3);
  const actual = await source.getRepository(Pago).findOneByOrFail({ id: pago.id });
  assert.equal(Number(actual.amount_refunded), 100);
  assert.equal(actual.status, 'refunded');
});

test('el reembolso automático usa el identificador del pago relacionado', async () => {
  const { crearReembolso } = await escenario();
  const reembolso = await crearReembolso();
  pasarela.reembolsar = async (id, importe, clave, total) => {
    assert.equal(id, 'mp-1'); assert.equal(importe, 100);
    assert.equal(clave, reembolso.idempotency_key);
    assert.equal(total, true);
    return { id: 'mp-refund-1', status: 'approved', amount: importe };
  };
  assert.equal((await reembolsos.ejecutar(reembolso.id, 3)).estado, 'APROBADO');
});

test('un reembolso externo pendiente no se registra como dinero devuelto', async () => {
  const { pago, crearReembolso } = await escenario();
  const reembolso = await crearReembolso();
  pasarela.reembolsar = async (_id, importe) => ({ id: 'mp-pendiente', status: 'pending', amount: importe });
  await reembolsos.ejecutar(reembolso.id, 3);
  const actual = await reembolsos.buscar(reembolso.id);
  assert.equal(actual.estado, 'EN_PROCESO');
  assert.equal(actual.id_externo, 'mp-pendiente');
  assert.equal(Number((await source.getRepository(Pago).findOneByOrFail({ id: pago.id })).amount_refunded), 0);
});

test('recupera el resultado perdido de Mercado Pago con la clave del primer intento', async () => {
  const { pago, crearReembolso } = await escenario();
  const reembolso = await crearReembolso();
  const operaciones = new Map();
  let llamadas = 0;
  pasarela.reembolsar = async (id, importe, clave) => {
    assert.equal(id, 'mp-1');
    assert.equal(importe, 100);
    assert.equal(clave, reembolso.idempotency_key);
    llamadas++;
    if (!operaciones.has(clave)) {
      operaciones.set(clave, { id: 'mp-confirmado', status: 'approved', amount: importe });
      throw new Error('Se perdió la respuesta después de aprobar');
    }
    return operaciones.get(clave);
  };
  await assert.rejects(reembolsos.ejecutar(reembolso.id, 3), /perdió la respuesta/);
  const pendiente = await reembolsos.buscar(reembolso.id);
  assert.equal(pendiente.estado, 'FALLIDO');
  assert.equal(pendiente.id_externo, null);
  await assert.rejects(reembolsos.registrarManual(reembolso.id, 'comprobante', 3), /disponible/);
  await source.query('UPDATE reembolso SET conciliar_en = $1 WHERE id_reembolso = $2', [new Date(Date.now() - 60_000), reembolso.id]);
  await reembolsos.reconciliarPendientes();
  assert.equal(llamadas, 2);
  assert.equal(operaciones.size, 1);
  assert.equal((await reembolsos.buscar(reembolso.id)).estado, 'APROBADO');
  assert.equal((await reembolsos.buscar(reembolso.id)).resuelto_por.id, 3);
  assert.equal(Number((await source.getRepository(Pago).findOneByOrFail({ id: pago.id })).amount_refunded), 100);
});

test('una falla al guardar la aprobación se recupera consultando el identificador externo', async (t) => {
  const { crearReembolso } = await escenario();
  const reembolso = await crearReembolso();
  const crear = t.mock.method(pasarela, 'reembolsar', async (_id, importe) => ({ id: 'mp-ya-confirmado', status: 'approved', amount: importe }));
  const anterior = PagosRepository.prototype.guardar;
  const guardar = t.mock.method(PagosRepository.prototype, 'guardar', async function (pago, transaccion) {
    if (Number(pago.amount_refunded) > 0) throw new Error('fallo al guardar pago');
    return anterior.call(this, pago, transaccion);
  });
  await assert.rejects(reembolsos.ejecutar(reembolso.id, 3), /fallo al guardar pago/);
  assert.equal((await reembolsos.buscar(reembolso.id)).id_externo, 'mp-ya-confirmado');
  guardar.mock.restore();
  pasarela.consultarReembolso = async (paymentId, id) => {
    assert.equal(paymentId, 'mp-1');
    assert.equal(id, 'mp-ya-confirmado');
    return { id, status: 'approved', amount: 100 };
  };
  await source.query('UPDATE reembolso SET conciliar_en = $1 WHERE id_reembolso = $2', [new Date(Date.now() - 60_000), reembolso.id]);
  await reembolsos.reconciliarPendientes();
  assert.equal(crear.mock.callCount(), 1);
  assert.equal((await reembolsos.buscar(reembolso.id)).estado, 'APROBADO');
});

test('la conciliación administrativa verifica el identificador, el pago y el importe en Mercado Pago', async () => {
  const { crearReembolso } = await escenario();
  const reembolso = await crearReembolso();
  await source.getRepository(Reembolso).update(reembolso.id, { estado: 'FALLIDO' });
  pasarela.consultarReembolso = async () => ({ id: 789, amount: 90, status: 'approved' });
  await assert.rejects(operacionesReembolso.recuperarConfirmacion(reembolso.id, '789', 3), /importe/);
  pasarela.consultarReembolso = async (paymentId, id) => {
    assert.equal(paymentId, 'mp-1');
    assert.equal(id, '789');
    return { id: 789, amount: 100, status: 'approved' };
  };
  const aplicado = await operacionesReembolso.recuperarConfirmacion(reembolso.id, '789', 3);
  assert.equal(aplicado.reembolso.id_externo, '789');
  assert.equal(aplicado.reserva.estado_pago, 'REEMBOLSADO');
});

test('dos parciales distintos se aplican una vez y actualizan el importe acumulado', async () => {
  const { reserva, crearReembolso } = await escenario();
  pasarela.reembolsar = async (_pago, importe, _clave, total) => {
    assert.equal(total, false);
    return { id: `mp-parcial-${importe}`, status: 'approved', amount: importe };
  };
  const primero = await crearReembolso({ tipo: TipoReembolso.PARCIAL, importe: 30 });
  await operacionesReembolso.ejecutar(primero.id, 3);
  const segundo = await crearReembolso({ tipo: TipoReembolso.PARCIAL, importe: 20 });
  await operacionesReembolso.ejecutar(segundo.id, 3);
  const resultado = await operacionesReembolso.aplicarReembolsoConfirmado(primero.id);
  assert.ok(resultado.reembolso.aplicado_en);
  assert.deepEqual(await reembolsos.listarPendientesAplicacion(), []);
  assert.equal(Number((await source.getRepository(Liquidacion).findOneByOrFail({ reserva: { id: reserva.id } })).importe), 50);
  assert.equal(resultado.reserva.estado_liquidacion, 'DEVUELTO_PARCIAL_INQUILINO');
});

test('no aplica a la reserva un reembolso que todavía no fue confirmado', async () => {
  const { reserva, crearReembolso } = await escenario();
  const reembolso = await crearReembolso();
  await assert.rejects(operacionesReembolso.aplicarReembolsoConfirmado(reembolso.id), /confirmado|aprobado/i);
  assert.equal((await source.getRepository(Reserva).findOneByOrFail({ id: reserva.id })).estado_pago, 'APROBADO');
});

test('la operación administrativa no informa éxito con una devolución externa pendiente', async () => {
  const { crearReembolso } = await escenario();
  const reembolso = await crearReembolso();
  pasarela.reembolsar = async (_id, importe) => ({ id: 'mp-pendiente', status: 'pending', amount: importe });
  await assert.rejects(reembolsos.ejecutarYConfirmar(reembolso.id, 3), /no fue confirmado/i);
  assert.equal((await reembolsos.buscar(reembolso.id)).estado, 'EN_PROCESO');
});

test('la cancelación aprobada conserva la reserva hasta confirmar la devolución', async () => {
  const { reserva } = await escenario();
  const solicitud = await cancelaciones.solicitar(reserva.id, { motivo: 'Cambio de planes', aceptaTerminos: true }, 1);
  const resultado = await cancelaciones.resolver(reserva.id, solicitud.id, { decision: 'APROBADA' }, 3);
  assert.equal(Number(resultado.reembolso.importe), 100);
  assert.equal((await source.getRepository(Reserva).findOneByOrFail({ id: reserva.id })).cancelada, false);
  await operacionesReembolso.ejecutar(resultado.reembolso.id, 3);
  const actual = await reservas.obtenerReserva(reserva.id);
  assert.equal(actual.cancelada, true);
  assert.equal(actual.estado_pago, 'REEMBOLSADO');
});

/** Repositorio real cuyas operaciones dentro de la transacción se pueden interceptar. */
function repositorioInterceptado(interceptar) {
  return Object.assign(Object.create(repositorioCancelaciones), {
    conTransaccion: (operacion) => repositorioCancelaciones.conTransaccion((enTransaccion, transaccion) =>
      operacion(Object.assign(Object.create(enTransaccion), interceptar(enTransaccion)), transaccion)),
  });
}

const fechaEnDias = dias => require('../dist/common/utils/fechas').fechaArgentina(new Date(Date.now() + dias * 86400000));
const solicitudActual = id => source.getRepository(SolicitudCancelacion).findOneByOrFail({ id });

test('la solicitud admite exactamente dos días y exige aceptar los términos', async () => {
  const { ValidationPipe } = require('@nestjs/common');
  const { SolicitarCancelacionDto } = require('../dist/cancelaciones/dto/solicitar-cancelacion.dto');
  const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });
  const validar = dto => pipe.transform(dto, { type: 'body', metatype: SolicitarCancelacionDto });
  const { reserva } = await escenario(fechaEnDias(2));
  const motivo = 'Cambio de planes';
  for (const dto of [{ motivo }, { motivo, aceptaTerminos: false }, { motivo, aceptaTerminos: 'true' }]) {
    await assert.rejects(validar(dto), { status: 400 });
  }
  const condiciones = await cancelaciones.consultarCondiciones(reserva.id, 1);
  assert.equal(condiciones.motivoBloqueo, null);
  assert.equal(condiciones.politica.porcentajeParcial, 50);
  const dto = await validar({ motivo, aceptaTerminos: true });
  assert.equal((await cancelaciones.solicitar(reserva.id, dto, 1)).estado, 'PENDIENTE');
});

test('la consulta muestra los términos aunque el plazo haya vencido', async () => {
  const { reserva } = await escenario(fechaEnDias(1));
  const dto = { motivo: 'Cambio de planes', aceptaTerminos: true };
  const condiciones = await cancelaciones.consultarCondiciones(reserva.id, 1);
  assert.equal(condiciones.politica.diasDevolucionParcial, 2);
  assert.match(condiciones.motivoBloqueo, /plazo venció/);
  await assert.rejects(cancelaciones.solicitar(reserva.id, dto, 1), /plazo venció/);

  assert.equal(await source.getRepository(SolicitudCancelacion).count(), 0);
});

for (const medio of ['visa', 'debvisa', null]) {
  test(`deriva a transferencia el reembolso por cancelación con medio ${medio}`, async () => {
    const { reserva, pago } = await escenario(fechaEnDias(7));
    await source.getRepository(Pago).update(pago.id, { payment_method_id: medio });
    const condicionesPago = await cancelaciones.consultarCondiciones(reserva.id, 1);
    assert.equal(condicionesPago.motivoBloqueo, null);
    assert.equal(condicionesPago.admiteReembolso, true);
    assert.equal(condicionesPago.devolucionPorTransferencia, true);
    const solicitud = await cancelaciones.solicitar(reserva.id, { motivo: 'Cambio de planes', aceptaTerminos: true }, 1);
    const resultado = await cancelaciones.resolver(reserva.id, solicitud.id, { decision: 'APROBADA' }, 3);
    assert.equal(resultado.reembolso.transferencia_manual, true);
    assert.equal(resultado.reembolso.estado, 'PENDIENTE');
    assert.equal(await source.getRepository(Reembolso).count(), 1);
  });
}

test('la devolución de una cancelación queda identificada por su solicitud', async () => {
  const { reserva } = await escenario();
  const solicitud = await cancelaciones.solicitar(reserva.id, { motivo: 'Cambio de planes', aceptaTerminos: true }, 1);
  const { reembolso } = await cancelaciones.resolver(reserva.id, solicitud.id, { decision: 'APROBADA' }, 3);
  const guardado = await source.getRepository(Reembolso).findOneByOrFail({ id: reembolso.id });
  assert.equal(guardado.idempotency_key, `can:${solicitud.id}`);
  assert.equal(guardado.origen, OrigenReembolso.CANCELACION);
  assert.equal((await solicitudActual(solicitud.id)).estado, 'APROBADA');
});

test('resolver dos veces la misma solicitud deja una sola devolución', async () => {
  const { reserva } = await escenario();
  const solicitud = await cancelaciones.solicitar(reserva.id, { motivo: 'Cambio de planes', aceptaTerminos: true }, 1);
  await cancelaciones.resolver(reserva.id, solicitud.id, { decision: 'APROBADA' }, 3);
  // La segunda resolución espera el bloqueo de la solicitud y la encuentra decidida.
  await assert.rejects(cancelaciones.resolver(reserva.id, solicitud.id, { decision: 'APROBADA' }, 3), { status: 409 });
  assert.equal(await source.getRepository(Reembolso).count(), 1);
  assert.equal((await source.getRepository(Reserva).findOneByOrFail({ id: reserva.id })).cancelada, false);
});

test('un reintento recupera la solicitud aprobada mientras su devolución está activa', async () => {
  const { reserva } = await escenario();
  const dto = { motivo: 'Cambio de planes', aceptaTerminos: true };
  const solicitud = await cancelaciones.solicitar(reserva.id, dto, 1);
  const { reembolso } = await cancelaciones.resolver(reserva.id, solicitud.id, { decision: 'APROBADA' }, 3);
  const activa = await cancelaciones.consultarActiva(reserva.id, 1);
  assert.equal(activa.id, solicitud.id);
  assert.equal(activa.estado, 'APROBADA');
  assert.equal((await cancelaciones.solicitar(reserva.id, dto, 1)).id, solicitud.id);
  assert.equal(await source.getRepository(SolicitudCancelacion).count(), 1);

  await reembolsos.rechazar(reembolso.id, 'Devolución rechazada', 3);
  assert.equal(await cancelaciones.consultarActiva(reserva.id, 1), null);
  assert.notEqual((await cancelaciones.solicitar(reserva.id, dto, 1)).id, solicitud.id);
});

test('aprobar revalida la reserva y conserva la solicitud pendiente si otro flujo la canceló', async () => {
  for (const fecha of [fechaEnDias(2), '2099-01-10']) {
    const { reserva } = await escenario(fecha);
    const solicitud = await cancelaciones.solicitar(reserva.id, { motivo: 'Cambio de planes', aceptaTerminos: true }, 1);
    await source.getRepository(Reserva).update(reserva.id, { cancelada: true, cancelada_por: 'ADMINISTRADOR' });
    await assert.rejects(cancelaciones.resolver(reserva.id, solicitud.id, { decision: 'APROBADA' }, 3), { status: 409 });
    assert.equal((await solicitudActual(solicitud.id)).estado, 'PENDIENTE');
    assert.equal(await source.getRepository(Reembolso).countBy({ reserva: { id: reserva.id } }), 0);
    assert.equal((await source.getRepository(Reserva).findOneByOrFail({ id: reserva.id })).cancelada_por, 'ADMINISTRADOR');
    await db.exec('TRUNCATE reserva RESTART IDENTITY CASCADE');
  }
});

test('el alta bloquea la reserva antes de buscar solicitudes pendientes', async () => {
  const { reserva } = await escenario();
  const consultas = [];
  const original = db.query;
  db.query = (sql, parametros) => { consultas.push(sql); return original.call(db, sql, parametros); };
  try {
    await cancelaciones.solicitar(reserva.id, { motivo: 'Cambio de planes', aceptaTerminos: true }, 1);
  } finally {
    db.query = original;
  }
  const bloqueo = consultas.findIndex(sql => /FROM "reserva"[\s\S]*FOR NO KEY UPDATE/i.test(sql));
  const consulta = consultas.findIndex(sql => /FROM "solicitud_cancelacion"/i.test(sql));
  const escritura = consultas.findIndex(sql => /INSERT INTO "solicitud_cancelacion"/i.test(sql));
  assert.ok(bloqueo >= 0 && bloqueo < consulta && consulta < escritura);
});

test('la fecha de pago selecciona la versión de política y una reserva histórica conserva la inicial', async () => {
  await db.exec(`
    INSERT INTO politica_cancelacion VALUES ('2026-11-13', 7, 2, 80, 40, 0, 100)
  `);
  try {
    for (const [fecha, esperado] of [[null, 100], ['2026-11-12T15:00:00Z', 100], ['2026-11-13T15:00:00Z', 80]]) {
      const { reserva } = await escenario();
      if (fecha) await source.getRepository(Reserva).update(reserva.id, { fecha_pago: new Date(fecha) });
      const solicitud = await cancelaciones.solicitar(reserva.id, { motivo: 'Cambio de planes', aceptaTerminos: true }, 1);
      const { reembolso } = await cancelaciones.resolver(reserva.id, solicitud.id, { decision: 'APROBADA' }, 3);
      assert.equal(Number(reembolso.importe), esperado);
      await db.exec('TRUNCATE reserva RESTART IDENTITY CASCADE');
    }
  } finally {
    await db.exec("DELETE FROM politica_cancelacion WHERE vigente_desde = '2026-11-13'");
  }
});

test('la resolución bloquea la solicitud antes de leer su estado y decide en la misma transacción', async () => {
  const { reserva } = await escenario();
  const solicitud = await cancelaciones.solicitar(reserva.id, { motivo: 'Cambio de planes', aceptaTerminos: true }, 1);
  const consultas = [];
  const original = db.query;
  db.query = (sql, parametros) => { consultas.push(sql); return original.call(db, sql, parametros); };
  try {
    await cancelaciones.resolver(reserva.id, solicitud.id, { decision: 'APROBADA' }, 3);
  } finally {
    db.query = original;
  }
  const posicion = patron => consultas.findIndex(sql => patron.test(sql));
  const inicio = posicion(/^START TRANSACTION/i);
  const bloqueo = posicion(/FROM "solicitud_cancelacion"[\s\S]*FOR UPDATE/i);
  const lectura = consultas.findIndex((sql, indice) => indice > bloqueo && /FROM "solicitud_cancelacion"/i.test(sql));
  const devolucion = posicion(/INSERT INTO "reembolso"/i);
  const decision = posicion(/^UPDATE "solicitud_cancelacion"/i);
  const confirmacion = posicion(/^COMMIT/i);
  assert.ok(inicio >= 0 && inicio < bloqueo, 'la solicitud se bloquea dentro de la transacción');
  assert.ok(bloqueo < lectura && lectura < devolucion, 'el estado se lee con la solicitud ya bloqueada');
  assert.ok(devolucion < decision && decision < confirmacion, 'la devolución y la decisión se confirman juntas');
  assert.equal(consultas.filter(sql => /^(START TRANSACTION|COMMIT)/i.test(sql)).length, 2);
});

test('si falla la liberación de fechas se revierte la aprobación y se puede reintentar', async () => {
  const { reserva } = await escenario(fechaEnDias(2));
  const solicitud = await cancelaciones.solicitar(reserva.id, { motivo: 'Cambio de planes', aceptaTerminos: true }, 1);
  await source.getRepository(Reserva).update(reserva.id, { fecha_inicio: fechaEnDias(1) });
  disponibilidad.liberarReserva = async () => { throw new Error('fallo simulado del calendario'); };
  await assert.rejects(cancelaciones.resolver(reserva.id, solicitud.id, { decision: 'APROBADA' }, 3), /fallo simulado del calendario/);
  const pendiente = await solicitudActual(solicitud.id);
  assert.equal(pendiente.estado, 'PENDIENTE');
  assert.equal(pendiente.decidida_en, null);
  const sinCambios = await reservas.obtenerReserva(reserva.id);
  assert.equal(sinCambios.cancelada, false);
  assert.equal(sinCambios.estado_liquidacion, 'NO_APLICA');
  assert.equal(await source.getRepository(Liquidacion).countBy({ reserva: { id: reserva.id } }), 0);

  let liberadas = 0;
  disponibilidad.liberarReserva = async (idReserva) => { assert.equal(idReserva, reserva.id); liberadas += 1; };
  const resultado = await cancelaciones.resolver(reserva.id, solicitud.id, { decision: 'APROBADA' }, 3);
  assert.equal(resultado.reembolso, null);
  assert.equal(liberadas, 1);
  assert.equal((await solicitudActual(solicitud.id)).estado, 'APROBADA');
  const cancelada = await source.getRepository(Reserva).findOneByOrFail({ id: reserva.id });
  assert.equal(cancelada.cancelada, true);
  assert.equal(cancelada.cancelada_por, 'INQUILINO');
  const liquidacion = await source.getRepository(Liquidacion).findOneByOrFail({ reserva: { id: reserva.id } });
  // Sin devolución, lo retenido corresponde al anunciante.
  assert.equal(liquidacion.estado, 'PENDIENTE_PAGO_PROPIETARIO');
});

test('si falla la aprobación no queda una devolución sin decisión', async () => {
  const { reserva } = await escenario();
  const solicitud = await cancelaciones.solicitar(reserva.id, { motivo: 'Cambio de planes', aceptaTerminos: true }, 1);
  let fallar = true;
  const conFallo = new CancelacionesService(repositorioInterceptado((enTransaccion) => ({
    guardar: async (actual) => {
      if (fallar) { fallar = false; throw new Error('fallo simulado al aprobar'); }
      return enTransaccion.guardar(actual);
    },
  })), reservas, reembolsos, catalogosDePrueba());
  await assert.rejects(conFallo.resolver(reserva.id, solicitud.id, { decision: 'APROBADA' }, 3), /fallo simulado al aprobar/);
  assert.equal(await source.getRepository(Reembolso).count(), 0);
  assert.equal((await solicitudActual(solicitud.id)).estado, 'PENDIENTE');
  const resultado = await conFallo.resolver(reserva.id, solicitud.id, { decision: 'APROBADA' }, 3);
  assert.equal(Number(resultado.reembolso.importe), 100);
  assert.equal(await source.getRepository(Reembolso).count(), 1);
});

test('rechazar o dejar vencer una solicitud no cancela la reserva ni crea devoluciones', async () => {
  const { reserva } = await escenario();
  const solicitud = await cancelaciones.solicitar(reserva.id, { motivo: 'Cambio de planes', aceptaTerminos: true }, 1);
  assert.equal((await cancelaciones.solicitar(reserva.id, { motivo: 'Otro pedido igual', aceptaTerminos: true }, 1)).id, solicitud.id);
  const rechazo = await cancelaciones.resolver(reserva.id, solicitud.id, { decision: 'RECHAZADA', observacion: ' No corresponde ' }, 3);
  assert.equal(rechazo.reembolso, null);
  assert.equal(rechazo.solicitud.estado, 'RECHAZADA');
  assert.equal(rechazo.solicitud.observacion, 'No corresponde');
  await assert.rejects(cancelaciones.resolver(reserva.id + 1, solicitud.id, { decision: 'APROBADA' }, 3), { status: 404 });

  const otra = await cancelaciones.solicitar(reserva.id, { motivo: 'Segundo pedido', aceptaTerminos: true }, 1);
  assert.notEqual(otra.id, solicitud.id);
  await source.getRepository(Reserva).update(reserva.id, { fecha_inicio: '2026-01-01' });
  await assert.rejects(cancelaciones.resolver(reserva.id, otra.id, { decision: 'APROBADA' }, 3), /quedó vencida/);
  // El vencimiento se confirma aunque la respuesta sea un conflicto.
  assert.equal((await solicitudActual(otra.id)).estado, 'VENCIDA');
  assert.equal(await source.getRepository(Reembolso).count(), 0);
  assert.equal((await source.getRepository(Reserva).findOneByOrFail({ id: reserva.id })).cancelada, false);
});

test('las notas internas de reclamos solo se entregan al administrador', async () => {
  const { reserva } = await escenario();
  const reclamo = await source.getRepository(Reclamo).save({
    reserva, inquilino: { id: 1 }, anunciante: { id: 2 }, categoria: 'OTRO', descripcion: 'Reclamo de prueba',
  });
  await source.getRepository(ReclamoMensaje).save([
    { reclamo, autor: { id: 3 }, texto: 'Mensaje público', visible_para: 'TODOS' },
    { reclamo, autor: { id: 3 }, texto: 'Nota interna privada', visible_para: 'ADMIN' },
  ]);
  assert.equal((await reclamos.obtener(reclamo.id, 1, false)).mensajes.length, 1);
  assert.equal((await reclamos.listarMios(2))[0].mensajes.length, 1);
  assert.equal((await reclamos.obtener(reclamo.id, 3, true)).mensajes.length, 2);
  await assert.rejects(reclamos.obtener(reclamo.id, 4, false), /No formás parte/);
});

for (const [dias, porcentaje] of [[7, 100], [2, 50], [1, 0]]) {
  test(`cancelar con ${dias} días de anticipación aplica ${porcentaje}% de devolución`, async () => {
    const { reserva } = await escenario(fechaEnDias(Math.max(dias, 2)));
    const solicitud = await cancelaciones.solicitar(reserva.id, { motivo: 'Cambio de planes', aceptaTerminos: true }, 1);
    if (dias === 1) {
      await source.getRepository(Reserva).update(reserva.id, { fecha_inicio: fechaEnDias(1) });
    }
    const resultado = await cancelaciones.resolver(reserva.id, solicitud.id, { decision: 'APROBADA' }, 3);
    const listado = await reembolsos.listarAdministracion();
    if (porcentaje > 0) {
      assert.equal(Number(resultado.reembolso.importe), porcentaje);
      assert.equal(resultado.reembolso.estado, 'PENDIENTE');
      assert.equal(listado.length, 1);
      assert.equal(listado[0].id, resultado.reembolso.id);
      assert.equal(listado[0].reserva.id, reserva.id);
    } else {
      assert.equal(resultado.reembolso, null);
      assert.equal(listado.length, 0);
      assert.equal((await source.getRepository(Reserva).findOneByOrFail({ id: reserva.id })).cancelada, true);
    }
  });
}

test('resolver un reclamo con devolución parcial conserva la estadía y registra el importe', async () => {
  const { reserva, pago } = await escenario('2026-01-01');
  const reclamo = await reclamos.crear({ id_reserva: reserva.id, categoria: 'OTRO', descripcion: 'Problema durante la estadía' }, 1);
  const resultado = await reclamos.resolver(reclamo.id, {
    resolucion: ResolucionReclamo.DEVOLUCION_PARCIAL, importe: 40,
  }, 3);
  assert.equal(resultado.estado, 'RESUELTO_INQUILINO');
  assert.equal(Number((await source.getRepository(Pago).findOneByOrFail({ id: pago.id })).amount_refunded), 40);
  const actual = await reservas.obtenerReserva(reserva.id);
  assert.equal(actual.estado_pago, 'APROBADO');
  assert.equal(actual.cancelada, false);
  assert.equal(actual.estado_liquidacion, 'DEVUELTO_PARCIAL_INQUILINO');
  const liquidacion = await source.getRepository(Liquidacion).findOneByOrFail({ reserva: { id: reserva.id } });
  assert.equal(liquidacion.estado, actual.estado_liquidacion);
  assert.equal(Number(liquidacion.importe), 40);
  assert.equal(liquidacion.moneda, 'ARS');
});

test('si falla la escritura de la liquidación se revierte la reserva y se puede reintentar', async () => {
  const { reserva, crearReembolso } = await escenario();
  const reembolso = await crearReembolso({ importe: 40, tipo: TipoReembolso.PARCIAL });
  await reembolsos.registrarManual(reembolso.id, 'comprobante-prueba', 3);
  await db.exec("ALTER TABLE liquidacion ADD CONSTRAINT prueba_fallo_liquidacion CHECK (estado <> 'DEVUELTO_PARCIAL_INQUILINO')");
  try {
    await assert.rejects(operacionesReembolso.aplicarReembolsoConfirmado(reembolso.id), /prueba_fallo_liquidacion/);
    const actual = await reservas.obtenerReserva(reserva.id);
    assert.equal(actual.estado_liquidacion, 'NO_APLICA');
    assert.equal(actual.cancelada, false);
  } finally {
    await db.exec('ALTER TABLE liquidacion DROP CONSTRAINT prueba_fallo_liquidacion');
  }
  await operacionesReembolso.aplicarReembolsoConfirmado(reembolso.id);
  const liquidacion = await source.getRepository(Liquidacion).findOneByOrFail({ reserva: { id: reserva.id } });
  assert.equal(Number(liquidacion.importe), 40);
  assert.equal(liquidacion.estado, 'DEVUELTO_PARCIAL_INQUILINO');
});

function operacionesLiquidacion() {
  const { OperacionesLiquidacionService } = require('../dist/operaciones-reserva/service/operaciones-liquidacion.service');
  const liquidaciones = new LiquidacionesService(new LiquidacionRepository(source.getRepository(Liquidacion)), catalogosDePrueba());
  return new OperacionesLiquidacionService(reembolsos, reservas, liquidaciones, catalogosDePrueba(),
    { buscarCbuValidado: async () => '0010000700000000000017' },
    new PagosService(new PagosRepository(source.getRepository(Pago))));
}

async function filaLiquidacion(operaciones, idReserva) {
  return (await operaciones.listarLiquidacionesAdministracion()).find(fila => fila.id === idReserva);
}

async function cancelarSinDevolucion(reserva) {
  const solicitud = await cancelaciones.solicitar(reserva.id, { motivo: 'Cambio de planes', aceptaTerminos: true }, 1);
  await source.getRepository(Reserva).update(reserva.id, { fecha_inicio: fechaEnDias(1) });
  await cancelaciones.resolver(reserva.id, solicitud.id, { decision: 'APROBADA' }, 3);
}

test('después de pagarle al inquilino una devolución parcial por reclamo, el resto se liquida al anunciante', async () => {
  const { reserva, pago } = await escenario('2026-01-01');
  await source.getRepository(Pago).update(pago.id, { payment_method_id: 'visa' });
  await source.getRepository(Reserva).update(reserva.id, { codigo_validado_en: new Date() });
  const operaciones = operacionesLiquidacion();
  const reclamo = await reclamos.crear({ id_reserva: reserva.id, categoria: 'OTRO', descripcion: 'Problema durante la estadía' }, 1);
  await reclamos.resolver(reclamo.id, { resolucion: ResolucionReclamo.DEVOLUCION_PARCIAL, importe: 40 }, 3);
  // Primero se le paga al inquilino en Reembolsos.
  assert.equal(await filaLiquidacion(operaciones, reserva.id), undefined);
  const [pendiente] = await reembolsos.listarPorReserva(reserva.id);
  await operacionesReembolso.registrarTransferencia(pendiente.id, 'trf-inquilino', 3);

  const fila = await filaLiquidacion(operaciones, reserva.id);
  assert.equal(fila.estado_liquidacion, 'DEVUELTO_PARCIAL_INQUILINO');
  assert.equal(fila.importe_a_liquidar, 60);
  assert.equal(fila.moneda_liquidacion, 'ARS');
  assert.equal(fila.habilitada_para_pago, true);

  const pagada = await operaciones.resolverLiquidacion(reserva.id, { estado: 'PAGADO_PROPIETARIO', referencia: 'trf-anunciante' }, 3);
  assert.equal(pagada.estado_liquidacion, 'PAGADO_PROPIETARIO');
  assert.equal(pagada.habilitada_para_pago, false);
  const liquidacion = await source.getRepository(Liquidacion).findOneByOrFail({ reserva: { id: reserva.id } });
  assert.equal(Number(liquidacion.importe), 60);
  assert.deepEqual(liquidacion.pagos_anunciante.map(registro => registro.importe), [60]);
  assert.equal(await filaLiquidacion(operaciones, reserva.id), undefined);
  await assert.rejects(operaciones.resolverLiquidacion(reserva.id, { estado: 'PAGADO_PROPIETARIO' }, 3), /ya fue resuelta/);
});

test('sin código validado ni cancelación, el resto espera y no se le puede pagar al anunciante', async () => {
  const { reserva } = await escenario('2026-01-01');
  const operaciones = operacionesLiquidacion();
  const reclamo = await reclamos.crear({ id_reserva: reserva.id, categoria: 'OTRO', descripcion: 'Problema durante la estadía' }, 1);
  await reclamos.resolver(reclamo.id, { resolucion: ResolucionReclamo.DEVOLUCION_PARCIAL, importe: 40 }, 3);
  const fila = await filaLiquidacion(operaciones, reserva.id);
  assert.equal(fila.importe_a_liquidar, 60);
  assert.equal(fila.habilitada_para_pago, false);
  await assert.rejects(operaciones.resolverLiquidacion(reserva.id, { estado: 'PAGADO_PROPIETARIO' }, 3), /sin validar el código/);
});

test('en una cancelación con devolución parcial, lo retenido se liquida al anunciante', async () => {
  const { reserva } = await escenario(fechaEnDias(2));
  const operaciones = operacionesLiquidacion();
  const solicitud = await cancelaciones.solicitar(reserva.id, { motivo: 'Cambio de planes', aceptaTerminos: true }, 1);
  const { reembolso } = await cancelaciones.resolver(reserva.id, solicitud.id, { decision: 'APROBADA' }, 3);
  assert.equal(await filaLiquidacion(operaciones, reserva.id), undefined);
  await operacionesReembolso.ejecutar(reembolso.id, 3);

  const fila = await filaLiquidacion(operaciones, reserva.id);
  assert.equal(fila.cancelada, true);
  assert.equal(fila.importe_a_liquidar, 50);
  assert.equal(fila.habilitada_para_pago, true);
  const pagada = await operaciones.resolverLiquidacion(reserva.id, { estado: 'PAGADO_PROPIETARIO', referencia: 'trf-anunciante' }, 3);
  assert.equal(pagada.estado_liquidacion, 'PAGADO_PROPIETARIO');
  const liquidacion = await source.getRepository(Liquidacion).findOneByOrFail({ reserva: { id: reserva.id } });
  assert.equal(Number(liquidacion.importe), 50);
});

test('en una cancelación sin devolución, todo el importe se liquida al anunciante', async () => {
  const { reserva } = await escenario(fechaEnDias(2));
  const operaciones = operacionesLiquidacion();
  await cancelarSinDevolucion(reserva);
  const fila = await filaLiquidacion(operaciones, reserva.id);
  assert.equal(fila.estado_liquidacion, 'PENDIENTE_PAGO_PROPIETARIO');
  assert.equal(fila.importe_a_liquidar, 100);
  assert.equal(fila.habilitada_para_pago, true);
  await operaciones.resolverLiquidacion(reserva.id, { estado: 'PAGADO_PROPIETARIO' }, 3);
  const liquidacion = await source.getRepository(Liquidacion).findOneByOrFail({ reserva: { id: reserva.id } });
  assert.equal(liquidacion.estado, 'PAGADO_PROPIETARIO');
  assert.equal(Number(liquidacion.importe), 100);
});

test('una cancelada en revisión se puede cerrar para pagarle al anunciante, pero no vuelve a esperar el ingreso', async () => {
  const { reserva } = await escenario(fechaEnDias(2));
  const operaciones = operacionesLiquidacion();
  await cancelarSinDevolucion(reserva);
  // Congelada, por ejemplo, al bloquear al anunciante.
  await source.query("UPDATE liquidacion SET estado = 'EN_REVISION' WHERE id_reserva = $1", [reserva.id]);
  assert.equal((await filaLiquidacion(operaciones, reserva.id)).habilitada_para_pago, false);
  await assert.rejects(operaciones.resolverLiquidacion(reserva.id, { estado: 'PAGADO_PROPIETARIO' }, 3), /en revisión/);
  await assert.rejects(operaciones.resolverLiquidacion(reserva.id, { estado: 'RETENIDO' }, 3), /circuito de ingreso/);

  const reabierta = await operaciones.resolverLiquidacion(reserva.id, { estado: 'PENDIENTE_PAGO_PROPIETARIO', observacion: 'Revisión cerrada' }, 3);
  assert.equal(reabierta.estado_liquidacion, 'PENDIENTE_PAGO_PROPIETARIO');
  assert.equal(reabierta.habilitada_para_pago, true);
  const pagada = await operaciones.resolverLiquidacion(reserva.id, { estado: 'PAGADO_PROPIETARIO' }, 3);
  assert.equal(pagada.estado_liquidacion, 'PAGADO_PROPIETARIO');
});

test('devolverle al inquilino lo que quedaba exige motivo y deriva el resto a Reembolsos', async () => {
  const { reserva } = await escenario('2026-01-01');
  await source.getRepository(Reserva).update(reserva.id, { codigo_validado_en: new Date() });
  const operaciones = operacionesLiquidacion();
  const reclamo = await reclamos.crear({ id_reserva: reserva.id, categoria: 'OTRO', descripcion: 'Problema durante la estadía' }, 1);
  await reclamos.resolver(reclamo.id, { resolucion: ResolucionReclamo.DEVOLUCION_PARCIAL, importe: 40 }, 3);
  await assert.rejects(operaciones.resolverLiquidacion(reserva.id, { estado: 'DEVUELTO_INQUILINO' }, 3), /motivo/);
  await assert.rejects(operaciones.resolverLiquidacion(reserva.id, { estado: 'DEVUELTO_INQUILINO', observacion: '   ' }, 3), /motivo/);

  await operaciones.resolverLiquidacion(reserva.id, { estado: 'DEVUELTO_INQUILINO', observacion: 'Anunciante bloqueado por fraude' }, 3);
  const ajuste = (await reembolsos.listarPorReserva(reserva.id)).find(item => item.origen === OrigenReembolso.AJUSTE_ADMIN);
  assert.equal(Number(ajuste.importe), 60);
  assert.equal(ajuste.estado, 'PENDIENTE');
  assert.equal(await filaLiquidacion(operaciones, reserva.id), undefined);
});

for (const resultado of ['GANADA', 'PERDIDA']) {
  test(`el contracargo ${resultado} integra la disputa, el pago y la reserva sin duplicaciones`, async (t) => {
    const { Disputa } = require('../dist/disputas/entity/disputa.entity');
    const { DisputasService } = require('../dist/disputas/service/disputas.service');
    const { DisputasRepository } = require('../dist/disputas/repository/disputas.repository');
    const { PagosRepository } = require('../dist/pagos/repository/pagos.repository');
    const { CatalogosService } = require('../dist/catalogos/service/catalogos.service');
    const { Estado } = require('../dist/catalogos/entity/estado.entity');
    const { reserva, pago } = await escenario();
    const estados = source.getRepository(Estado);
    const catalogos = new CatalogosService({
      buscarTodosRoles: async () => [{ nombre: 'Administrador' }, { nombre: 'Inquilino' }],
      listarEstados: () => estados.find({ relations: { ambito: true } }),
    });
    await catalogos.onModuleInit();
    const disputasRepo = new DisputasRepository(source.getRepository(Disputa));
    const pagos = new PagosService(new PagosRepository(source.getRepository(Pago)));
    const disputas = new DisputasService(disputasRepo, pagos, reembolsos, reservas, catalogos);
    let llamadasPasarela = 0;
    pasarela.reembolsar = async () => { llamadasPasarela++; throw new Error('El contracargo ya movió el dinero'); };
    const datos = { idReserva: reserva.id, idPago: pago.id, chargebackId: 'contracargo-prueba', importe: 100 };
    const disputa = await disputas.registrarContracargo(datos);
    assert.equal(disputa.estado.codigo, 'ABIERTA');
    assert.equal((await disputas.registrarContracargo(datos)).id, disputa.id);
    assert.equal(await source.getRepository(Disputa).count(), 1);
    assert.equal((await source.getRepository(Reserva).findOneByOrFail({ id: reserva.id })).estado_pago, 'CONTRACARGO');
    assert.equal((await disputas.listarAdministracion())[0].estado, 'ABIERTA');
    if (resultado === 'GANADA') {
      const guardar = t.mock.method(DisputasRepository.prototype, 'guardar', async () => { throw new Error('fallo al cerrar disputa'); });
      await assert.rejects(disputas.resolver(disputa.id, { resultado }, 3), /fallo al cerrar disputa/);
      assert.equal((await pagos.buscarPorId(pago.id)).status, 'charged_back');
      assert.equal((await reservas.obtenerReserva(reserva.id)).estado_pago, 'CONTRACARGO');
      guardar.mock.restore();
    }
    assert.equal((await disputas.resolver(disputa.id, { resultado }, 3)).estado, resultado);
    await assert.rejects(disputas.resolver(disputa.id, { resultado }, 3), /ya fue resuelta/);
    assert.equal((await disputasRepo.buscarPorId(disputa.id)).estado.codigo, resultado);
    const actual = await reservas.obtenerReserva(reserva.id);
    assert.equal(actual.estado_pago, resultado === 'GANADA' ? 'APROBADO' : 'REEMBOLSADO');
    assert.equal(actual.cancelada, resultado === 'PERDIDA');
    assert.equal(Number((await source.getRepository(Pago).findOneByOrFail({ id: pago.id })).amount_refunded), resultado === 'GANADA' ? 0 : 100);
    const pagoResuelto = await pagos.buscarPorId(pago.id);
    await disputas.registrarContracargo(datos);
    assert.equal((await pagos.buscarPorId(pago.id)).status, pagoResuelto.status);
    assert.equal(llamadasPasarela, 0);
  });
}

test('si falla el contracargo revierte el pago y la liquidación, y el aviso permite reintentar', async (t) => {
  const { Disputa } = require('../dist/disputas/entity/disputa.entity');
  const { DisputasService } = require('../dist/disputas/service/disputas.service');
  const { DisputasRepository } = require('../dist/disputas/repository/disputas.repository');
  const { reserva, pago } = await escenario();
  const repo = new DisputasRepository(source.getRepository(Disputa));
  const pagos = new PagosService(new PagosRepository(source.getRepository(Pago)));
  const disputas = new DisputasService(repo, pagos, reembolsos, reservas, catalogosDePrueba());
  const guardar = t.mock.method(DisputasRepository.prototype, 'guardar', async () => { throw new Error('fallo de escritura'); });
  const datos = { idReserva: reserva.id, idPago: pago.id, chargebackId: 'contracargo-con-reintento', importe: 100 };
  await assert.rejects(disputas.registrarContracargo(datos), /fallo de escritura/);
  assert.equal((await pagos.buscarPorId(pago.id)).status, 'approved');
  assert.equal((await reservas.obtenerReserva(reserva.id)).estado_pago, 'APROBADO');
  assert.equal(await source.getRepository(Liquidacion).count(), 0);
  guardar.mock.restore();
  assert.equal((await disputas.registrarContracargo(datos)).estado.codigo, 'ABIERTA');
  assert.equal((await pagos.buscarPorId(pago.id)).status, 'charged_back');
  assert.equal(await source.getRepository(Liquidacion).count(), 1);
});

test('el webhook de reembolso permite recuperar la aplicación tras un fallo sin registrar otro movimiento', async (t) => {
  const { OperacionesPagoService } = require('../dist/operaciones-reserva/service/operaciones-pago.service');
  const { reserva, pago } = await escenario();
  const referencia = `reserva:${reserva.id}`;
  await source.getRepository(Pago).update(pago.id, { external_reference: referencia, payment_id: '123' });
  const consultarPago = async () => ({
    id: 123, external_reference: referencia, status: 'refunded', transaction_amount: 100, currency_id: 'ARS',
    refunds: [{ id: 321, payment_id: 123, amount: 100, status: 'approved' }],
  });
  const pagos = new PagosService(new PagosRepository(source.getRepository(Pago)));
  const operaciones = new OperacionesPagoService({}, pagos, reservas, reembolsos, {}, {},
    { consultarPago, validarWebhook: () => {} }, catalogosDePrueba(), operacionesReembolso);
  const aplicar = t.mock.method(operacionesReembolso, 'aplicarReembolsoConfirmado', async () => { throw new Error('fallo de aplicación'); });
  const entrada = { body: { type: 'payment' }, dataId: '123' };
  await assert.rejects(operaciones.procesarWebhook(entrada), /fallo de aplicación/);
  assert.equal((await reservas.obtenerReserva(reserva.id)).estado_pago, 'APROBADO');
  aplicar.mock.restore();
  await operaciones.procesarWebhook(entrada);
  await operaciones.procesarWebhook(entrada);
  assert.equal(await source.getRepository(Reembolso).count(), 1);
  assert.equal(Number((await pagos.buscarPorId(pago.id)).amount_refunded), 100);
  assert.equal((await reservas.obtenerReserva(reserva.id)).estado_pago, 'REEMBOLSADO');
});

test('la API integra pagos, firma del webhook, permisos, cancelación y devolución por Mercado Pago', async (t) => {
  const { Test } = require('@nestjs/testing');
  const { ConfigModule, ConfigService } = require('@nestjs/config');
  const { TypeOrmModule } = require('@nestjs/typeorm');
  const { JwtService } = require('@nestjs/jwt');
  const { ValidationPipe } = require('@nestjs/common');
  const request = require('supertest');
  const { AuthModule } = require('../dist/auth/auth.module');
  const { OperacionesReservaModule } = require('../dist/operaciones-reserva/operaciones-reserva.module');
  const { CancelacionesModule } = require('../dist/cancelaciones/cancelaciones.module');
  const { ReclamosModule } = require('../dist/reclamos/reclamos.module');
  const { DisputasService } = require('../dist/disputas/service/disputas.service');
  const { MercadoPagoAdapter } = require('../dist/mercado-pago/proveedor/mercado-pago.adapter');
  const { Estado } = require('../dist/catalogos/entity/estado.entity');
  const { CLIENTE_CORREO } = require('../dist/mail/repository/cliente-correo.interface');
  const { PROVEEDOR_DOLAR } = require('../dist/cotizaciones/proveedor/proveedor-dolar.interface');
  const { createHmac } = require('node:crypto');
  const firmaPruebas = 'secreto-webhook-exclusivo-pruebas';
  const cobro = { id: 123, status: 'approved', status_detail: 'accredited', transaction_amount: 100, currency_id: 'ARS', payment_method_id: 'account_money' };
  const consultarPago = t.mock.method(MercadoPagoAdapter.prototype, 'consultarPago', async () => ({ ...cobro }));
  const reembolsar = t.mock.method(MercadoPagoAdapter.prototype, 'reembolsar', async () => ({ id: 456, status: 'approved', amount: 100, payment_id: 123 }));
  const ajustes = { JWT_SECRET: 'secreto-exclusivo-pruebas-integracion', FRONTEND_URLS: 'http://localhost:4200', ACS_SENDER_ADDRESS: 'pruebas@example.invalid', MP_ACCESS_TOKEN: 'token-exclusivo-pruebas' };
  const config = { get: clave => ajustes[clave], getOrThrow: clave => {
    if (!ajustes[clave]) throw new Error(`Configuración de prueba ausente: ${clave}`);
    return ajustes[clave];
  } };
  const modulo = await Test.createTestingModule({ imports: [
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
    TypeOrmModule.forRoot(source.options), AuthModule, OperacionesReservaModule, CancelacionesModule, ReclamosModule,
  ] })
    .overrideProvider(DataSource).useValue(source)
    .overrideProvider(ConfigService).useValue(config)
    .overrideProvider(CLIENTE_CORREO).useValue({})
    .overrideProvider(PROVEEDOR_DOLAR).useValue({ consultar: async () => ({ venta: 1200, compra: 1180, actualizadaEn: new Date(), proveedor: 'prueba' }) })
    .compile();
  const app = modulo.createNestApplication({ logger: false });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  try {
    const estados = source.getRepository(Estado);
    const codigoAmbito = 'DISPUTA';
    await estados.delete({ codigoAmbito, codigo: 'GANADA' });
    await estados.update({ codigoAmbito, codigo: 'ABIERTA' }, { nombre: 'Abierta en el panel' });
    await base.cargarSeed();
    await app.init();
    assert.equal((await estados.findOneByOrFail({ codigoAmbito, codigo: 'GANADA' })).nombre, 'Ganada');
    assert.equal((await estados.findOneByOrFail({ codigoAmbito, codigo: 'ABIERTA' })).nombre, 'Abierta en el panel');
    assert.equal(await estados.countBy({ codigoAmbito }), 5);
    const http = app.getHttpServer();
    const token = id => app.get(JwtService).sign({ sub: id });
    const tenant = `Bearer ${token(1)}`, admin = `Bearer ${token(3)}`, ajeno = `Bearer ${token(4)}`;
    const { reserva, pago } = await escenario();
    cobro.external_reference = `reserva:${reserva.id}`;
    await source.getRepository(Pago).update(pago.id, { external_reference: cobro.external_reference, payment_id: '123' });
    await source.getRepository(Reserva).update(reserva.id, {
      estado_pago: 'PENDIENTE',
      email_confirmacion_inquilino_enviado: true, email_nueva_reserva_anunciante_enviado: true,
    });
    for (const ruta of ['presupuesto', 'checkout', 'reconciliar']) {
      await request(http).post(`/pagos/${ruta}`).send({}).expect(401);
      await request(http).post(`/pagos/${ruta}`).set('Authorization', tenant).send({}).expect(400);
    }
    for (const ruta of ['estado', 'resumen']) {
      const url = `/pagos/reservas/${reserva.id}/${ruta}`;
      await request(http).get(url).expect(401);
      await request(http).get(url).set('Authorization', ajeno).expect(403);
      await request(http).get(url).set('Authorization', tenant).expect(200);
    }
    await request(http).post('/pagos/webhook?data.id=123').send({ type: 'payment' }).expect(503);
    ajustes.MP_WEBHOOK_SECRET = firmaPruebas;
    await request(http).post('/pagos/webhook?data.id=123').send({ type: 'payment' }).expect(401);
    const requestId = 'webhook-pago-pruebas';
    const ts = Math.floor(Date.now() / 1000);
    const hash = createHmac('sha256', firmaPruebas).update(`id:123;request-id:${requestId};ts:${ts};`).digest('hex');
    const webhook = (id, firma) => request(http).post(`/pagos/webhook?data.id=${id}`)
      .set('x-signature', firma).set('x-request-id', requestId).send({ type: 'payment', data: { id: 123 } });
    await webhook('124', `ts=${ts},v1=${hash}`).expect(401);
    assert.equal(consultarPago.mock.callCount(), 0);
    await webhook('123', `ts=${ts},v1=${hash}`).expect(201, { received: true });
    const primeraConfirmacion = await source.getRepository(Reserva).findOneByOrFail({ id: reserva.id });
    assert.equal(primeraConfirmacion.estado_pago, 'APROBADO');
    assert.ok(primeraConfirmacion.codigo_generado_en);
    await webhook('123', `ts=${ts},v1=${hash}`).expect(201, { received: true });
    assert.deepEqual((await source.getRepository(Reserva).findOneByOrFail({ id: reserva.id })).codigo_generado_en, primeraConfirmacion.codigo_generado_en);
    const reconciliar = (autorizacion) => request(http).post('/pagos/reconciliar')
      .set('Authorization', autorizacion).send({ payment_id: '123' });
    await reconciliar(ajeno).expect(403);
    await reconciliar(tenant).expect(201, {
      reserva_id: reserva.id, estado_pago: 'APROBADO', mercado_pago_status: 'approved', mercado_pago_status_detail: 'accredited',
    });
    assert.equal(await source.getRepository(Pago).count(), 1);
    const anunciante = `Bearer ${token(2)}`;
    const hoy = require('../dist/common/utils/fechas').fechaArgentina();
    const ingreso = await source.getRepository(Reserva).save({
      monto_pago: 100, estado_pago: 'APROBADO', estado_liquidacion: 'RETENIDO',
      usuario: { id: 1 }, publicacion: { id: 1 }, fecha_inicio: hoy, fecha_fin: hoy,
    });
    const codigoUrl = `/reservas/${ingreso.id}/codigo-alojamiento`;
    const validarUrl = `/reservas/${ingreso.id}/validar-codigo`;
    const reservasPublicacion = '/reservas/publicacion/1';
    await request(http).get(reservasPublicacion).set('Authorization', ajeno).expect(403);
    const { body: reservasDelAnunciante } = await request(http).get(reservasPublicacion).set('Authorization', anunciante).expect(200);
    assert.equal(reservasDelAnunciante.find(fila => fila.id === ingreso.id).estado_estadia, 'PENDIENTE_INGRESO');
    await request(http).get(codigoUrl).set('Authorization', anunciante).expect(403);
    const { body: acceso } = await request(http).get(codigoUrl).set('Authorization', tenant).expect(200);
    await request(http).patch(validarUrl).set('Authorization', ajeno).send({ codigo: acceso.codigo }).expect(403);
    const incorrecto = acceso.codigo === 'AAAAAAAA' ? 'BBBBBBBB' : 'AAAAAAAA';
    for (let intento = 0; intento < 5; intento++)
      await request(http).patch(validarUrl).set('Authorization', anunciante).send({ codigo: incorrecto }).expect(400);
    await request(http).patch(validarUrl).set('Authorization', anunciante).send({ codigo: acceso.codigo }).expect(409);
    const rutaLiquidacion = `/reservas/${ingreso.id}/liquidacion`;
    await request(http).patch(rutaLiquidacion).set('Authorization', tenant).send({ estado: 'RETENIDO' }).expect(403);
    await request(http).patch(rutaLiquidacion).set('Authorization', admin).send({ estado: 'RETENIDO' }).expect(200);
    const { body: validada } = await request(http).patch(validarUrl).set('Authorization', anunciante).send({ codigo: acceso.codigo }).expect(200);
    assert.equal(validada.estado_liquidacion, 'PENDIENTE_PAGO_PROPIETARIO');
    assert.equal(Object.hasOwn(validada, 'codigo_alojamiento'), false);
    const lista = await request(http).get('/reservas/liquidaciones/administracion').set('Authorization', admin).expect(200);
    assert.equal(lista.body.find(fila => fila.id === ingreso.id).estado_liquidacion, 'PENDIENTE_PAGO_PROPIETARIO');
    const detalle = await request(http).get(`/reservas/${ingreso.id}`).set('Authorization', tenant).expect(200);
    assert.equal(detalle.body.estado_liquidacion, 'PENDIENTE_PAGO_PROPIETARIO');
    const historialAnunciante = '/reservas/liquidaciones/publicacion/1';
    await request(http).get(historialAnunciante).set('Authorization', anunciante).expect(200, []);
    const consultaCbu = `/reservas/${ingreso.id}/liquidacion/cbu`;
    await request(http).get(consultaCbu).set('Authorization', anunciante).expect(403);
    await request(http).get(consultaCbu).set('Authorization', admin).expect(200, { cbu: null });
    await request(http).patch(rutaLiquidacion).set('Authorization', admin).send({ estado: 'PAGADO_PROPIETARIO' }).expect(409);
    const cbu = '0010000700000000000017';
    await source.query('UPDATE anunciante SET cbu_validado = $1 WHERE id_usuario = 2', [cbu]);
    await request(http).get(consultaCbu).set('Authorization', admin).expect(200, { cbu });
    await request(http).patch(rutaLiquidacion).set('Authorization', admin).send({
      estado: 'PAGADO_PROPIETARIO', referencia: 'pago-prueba', observacion: 'Transferencia acreditada',
    }).expect(200);
    await request(http).get(historialAnunciante).expect(401);
    await request(http).get(historialAnunciante).set('Authorization', tenant).expect(200, []);
    await request(http).get(historialAnunciante).set('Authorization', ajeno).expect(200, []);
    await request(http).get('/reservas/liquidaciones/publicacion/999').set('Authorization', anunciante).expect(200, []);
    const { body: historialPropio } = await request(http).get(historialAnunciante).set('Authorization', anunciante).expect(200);
    const [{ id: idPago, fecha: fechaPago }] = historialPropio;
    assert.ok(idPago);
    assert.ok(Number.isFinite(Date.parse(fechaPago)));
    assert.deepEqual(historialPropio, [{
      id: idPago, reservaId: ingreso.id, fecha: fechaPago, importe: 100, moneda: 'ARS',
      referencia: 'pago-prueba', observacion: 'Transferencia acreditada',
    }]);
    await request(http).patch(rutaLiquidacion).set('Authorization', admin).send({ estado: 'PAGADO_PROPIETARIO', referencia: 'pago-repetido' }).expect(409);
    // Lo que no se le devolvió al inquilino se liquida al anunciante: la cancelada sí, la que no acreditó el ingreso no.
    const conResto = async (datos, clave) => {
      const conDevolucion = await source.getRepository(Reserva).save({
        monto_pago: 100, estado_pago: 'APROBADO', usuario: { id: 1 }, publicacion: { id: 1 },
        fecha_inicio: '2099-03-01', fecha_fin: '2099-03-05', ...datos,
      });
      await source.getRepository(Pago).save({
        reserva: conDevolucion, amount: 100, amount_refunded: 50, currency: 'ARS', status: 'approved', payment_id: `mp-${clave}`,
        payment_method_id: 'account_money', external_reference: `reserva:${conDevolucion.id}`, idempotency_key: `pago-${clave}`,
      });
      await source.query("INSERT INTO liquidacion (id_reserva, estado, moneda) VALUES ($1, 'DEVUELTO_PARCIAL_INQUILINO', 'ARS')", [conDevolucion.id]);
      return conDevolucion;
    };
    const cancelada = await conResto({ cancelada: true }, 'cancelada-resto');
    const sinIngreso = await conResto({}, 'sin-ingreso-resto');
    const { body: porLiquidar } = await request(http).get('/reservas/liquidaciones/administracion').set('Authorization', admin).expect(200);
    const filaCancelada = porLiquidar.find(fila => fila.id === cancelada.id);
    assert.deepEqual([filaCancelada.importe_a_liquidar, filaCancelada.moneda_liquidacion, filaCancelada.habilitada_para_pago], [50, 'ARS', true]);
    assert.equal(porLiquidar.find(fila => fila.id === sinIngreso.id).habilitada_para_pago, false);
    const rutaCancelada = `/reservas/${cancelada.id}/liquidacion`;
    await request(http).patch(rutaCancelada).set('Authorization', admin).send({ estado: 'DEVUELTO_INQUILINO' }).expect(400);
    await request(http).patch(`/reservas/${sinIngreso.id}/liquidacion`).set('Authorization', admin).send({ estado: 'PAGADO_PROPIETARIO' }).expect(409);
    const { body: liquidada } = await request(http).patch(rutaCancelada).set('Authorization', admin)
      .send({ estado: 'PAGADO_PROPIETARIO', referencia: 'pago-retenido' }).expect(200);
    assert.equal(liquidada.estado_liquidacion, 'PAGADO_PROPIETARIO');
    assert.equal(liquidada.importe_a_liquidar, 50);
    await source.query(`INSERT INTO fecha (fecha,disponible,id_publicacion,id_reserva)
      VALUES ('2099-01-10',false,1,$1)`, [reserva.id]);
    const disputa = await app.get(DisputasService).registrarContracargo({
      idReserva: reserva.id, idPago: pago.id, chargebackId: 'contracargo-api', importe: 100,
    });
    await request(http).get('/disputas/administracion').expect(401);
    await request(http).get('/disputas/administracion').set('Authorization', tenant).expect(403);
    const expedientes = await request(http).get('/disputas/administracion')
      .set('Authorization', admin).expect(200);
    assert.equal(expedientes.body[0].estado, 'ABIERTA');
    assert.equal(Object.hasOwn(expedientes.body[0], 'ambitoEstado'), false);
    const resolucion = await request(http).patch(`/disputas/${disputa.id}/resolver`)
      .set('Authorization', admin).send({ resultado: 'GANADA' }).expect(200);
    assert.equal(resolucion.body.estado, 'GANADA');
    await request(http).patch(`/reservas/${reserva.id}/liquidacion`)
      .set('Authorization', admin).send({ estado: 'GANADA' }).expect(400);
    await request(http).get('/reservas/cancelaciones/administracion').expect(401);
    await request(http).get('/reservas/cancelaciones/administracion').set('Authorization', tenant).expect(403);
    // Las rutas de solicitudes conservan su contrato al pasar al módulo de cancelaciones.
    await request(http).post(`/reservas/${reserva.id}/cancelacion`).send({ motivo: 'Cambio de planes', aceptaTerminos: true }).expect(401);
    await request(http).post(`/reservas/${reserva.id}/cancelacion`)
      .set('Authorization', ajeno).send({ motivo: 'Cambio de planes', aceptaTerminos: true }).expect(403);
    await request(http).post(`/reservas/${reserva.id}/cancelacion`)
      .set('Authorization', tenant).send({ motivo: 'Corto' }).expect(400);
    const sinSolicitud = await request(http).get(`/reservas/${reserva.id}/cancelacion`)
      .set('Authorization', tenant).expect(200);
    assert.equal(sinSolicitud.text, '');
    const rutaCondiciones = `/reservas/${reserva.id}/cancelacion/condiciones`;
    await request(http).get(rutaCondiciones).set('Authorization', ajeno).expect(403);
    const { body: condiciones } = await request(http).get(rutaCondiciones).set('Authorization', tenant).expect(200);
    assert.equal(condiciones.motivoBloqueo, null);
    assert.equal(condiciones.politica.diasDevolucionParcial, 2);
    await request(http).post(`/reservas/${reserva.id}/cancelacion`)
      .set('Authorization', tenant).send({ motivo: 'Cambio de planes' }).expect(400);
    const solicitud = await request(http).post(`/reservas/${reserva.id}/cancelacion`)
      .set('Authorization', tenant).send({ motivo: 'Cambio de planes', aceptaTerminos: true }).expect(201);
    assert.equal(solicitud.body.estado, 'PENDIENTE');
    assert.equal(Object.hasOwn(solicitud.body, 'ambitoEstado'), false);
    assert.equal(solicitud.body.reserva.id, reserva.id);
    assert.equal(solicitud.body.reserva.estado_estadia, 'CONFIRMADA');
    await request(http).get(`/reservas/${reserva.id}/cancelacion`).set('Authorization', ajeno).expect(403);
    const activa = await request(http).get(`/reservas/${reserva.id}/cancelacion`)
      .set('Authorization', tenant).expect(200);
    assert.equal(activa.body.id, solicitud.body.id);
    const pendientes = await request(http).get('/reservas/cancelaciones/administracion')
      .set('Authorization', admin).expect(200);
    assert.deepEqual(pendientes.body.map(({ id }) => id), [solicitud.body.id]);
    assert.equal(pendientes.body[0].reserva.estado_estadia, 'CONFIRMADA');
    await request(http).patch(`/reservas/${reserva.id}/cancelacion/${solicitud.body.id}`)
      .set('Authorization', tenant).send({ decision: 'APROBADA' }).expect(403);
    await request(http).patch(`/reservas/${reserva.id}/cancelacion/${solicitud.body.id}`)
      .set('Authorization', admin).send({ decision: 'OTRA' }).expect(400);
    const resultado = await request(http).patch(`/reservas/${reserva.id}/cancelacion/${solicitud.body.id}`)
      .set('Authorization', admin).send({ decision: 'APROBADA' }).expect(200);
    assert.equal(resultado.body.solicitud.estado, 'APROBADA');
    assert.equal(Number(resultado.body.reembolso.importe), 100);
    const aprobada = await request(http).get(`/reservas/${reserva.id}/cancelacion`)
      .set('Authorization', tenant).expect(200);
    assert.equal(aprobada.body.id, solicitud.body.id);
    assert.equal(aprobada.body.estado, 'APROBADA');
    const reintento = await request(http).post(`/reservas/${reserva.id}/cancelacion`)
      .set('Authorization', tenant).send({ motivo: 'Cambio de planes', aceptaTerminos: true }).expect(201);
    assert.equal(reintento.body.id, solicitud.body.id);
    await request(http).patch(`/reservas/${reserva.id}/cancelacion/${solicitud.body.id}`)
      .set('Authorization', admin).send({ decision: 'APROBADA' }).expect(409);
    assert.equal((await source.query('SELECT disponible FROM fecha WHERE id_reserva=$1', [reserva.id]))[0].disponible, false);
    const rutaReembolso = `/reservas/reembolsos/${resultado.body.reembolso.id}/ejecutar`;
    await request(http).patch(rutaReembolso).send({}).expect(401);
    await request(http).patch(rutaReembolso).set('Authorization', tenant).send({}).expect(403);
    const aplicado = await request(http).patch(rutaReembolso)
      .set('Authorization', admin).send({}).expect(200);
    assert.ok(aplicado.body.reembolso.aplicado_en);
    assert.equal(reembolsar.mock.callCount(), 1);
    assert.equal(aplicado.body.reembolso.referencia_interna, `can:${solicitud.body.id}`);
    const final = await request(http).get(`/reservas/${reserva.id}`).set('Authorization', tenant).expect(200);
    assert.equal(final.body.cancelada, true);
    assert.equal(final.body.estado_pago, 'REEMBOLSADO');
    const [dia] = await source.query("SELECT disponible,id_reserva FROM fecha WHERE fecha='2099-01-10'");
    assert.equal(dia.disponible, true);
    assert.equal(dia.id_reserva, null);
  } finally { await app.close(); }
});
