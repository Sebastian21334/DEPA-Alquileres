const { preparacionImagenes } = require('./soporte/imagenes-pruebas.cjs');
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
const { AlmacenamientoService } = require('../dist/almacenamiento/service/almacenamiento.service');
// Almacenamiento privado de prueba para los comprobantes de transferencia.
const { comprobantePdf, almacenamientoDePrueba, imagenPng } = require('./soporte/comprobantes-pruebas.cjs');
const { ReembolsosRepository } = require('../dist/reembolsos/repository/reembolsos.repository');
const { ReservasService } = require('../dist/reservas/service/reservas.service');
const { OperacionesReembolsoService } = require('../dist/operaciones-reserva/service/operaciones-reembolso.service');
const { OperacionesPagoService } = require('../dist/operaciones-reserva/service/operaciones-pago.service');
const { OperacionesLiquidacionService } = require('../dist/operaciones-reserva/service/operaciones-liquidacion.service');
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
  const publicaciones = new PublicacionesService({}, catalogosDePrueba());
  const estadoReserva = new ReservaEstadoService(publicaciones, catalogosDePrueba());
  reembolsos = new ReembolsosService(
    new ReembolsosRepository(source.getRepository(Reembolso)),
    pasarela,
    new PagosService(new PagosRepository(source.getRepository(Pago))),
    estadoReserva, catalogosDePrueba(), almacenamientoDePrueba().almacenamiento,
  );
  const repositorio = new ReservaRepository(source.getRepository(Reserva));
  disponibilidad = { liberarReserva: async () => {} };
  const liquidaciones = new LiquidacionesService(new LiquidacionRepository(source.getRepository(Liquidacion)), catalogosDePrueba());
  reservas = new ReservasService({}, repositorio, disponibilidad, {}, publicaciones, { avisarCambio: async () => {} }, reembolsos, estadoReserva,
    liquidaciones, catalogosDePrueba());
  repositorioCancelaciones = new CancelacionesRepository(source.getRepository(SolicitudCancelacion));
  cancelaciones = new CancelacionesService(repositorioCancelaciones, reservas, reembolsos, catalogosDePrueba());
  reclamos = new ReclamosService(
    new ReclamosRepository(source.getRepository(Reclamo), source.getRepository(ReclamoEvidencia),
      source.getRepository(ReclamoMensaje)),
    reservas, reembolsos, {}, catalogosDePrueba(), cancelaciones, undefined, preparacionImagenes,
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

// Solicitud pendiente del circuito manual anterior: solo queda como dato histórico.
function solicitudHistorica(idReserva, dto, idUsuario) {
  return source.getRepository(SolicitudCancelacion).save({
    reserva: { id: idReserva }, solicitante: { id: idUsuario }, motivo: dto.motivo,
    estado: 'PENDIENTE', creada_en: new Date(),
  });
}

async function confirmarCancelacion(reserva, idUsuario, cambios = {}) {
  const { devolucion } = await cancelaciones.consultarCondiciones(reserva.id, idUsuario);
  return cancelaciones.solicitar(reserva.id, {
    motivo: 'Cambio de planes', aceptaTerminos: true,
    importeAceptado: devolucion?.importe, monedaAceptada: devolucion?.moneda, ...cambios,
  }, idUsuario);
}

/** Procesa las devoluciones automáticas como la conciliación periódica, con el medio que informa Mercado Pago. */
async function conciliarDevoluciones(tipoDePago = 'account_money') {
  pasarela.consultarPago = async (id) => ({ id, status: 'approved', payment_type_id: tipoDePago });
  await operacionesReembolso.conciliar();
}

/** Confirma la cancelación y devuelve la solicitud con la devolución que generó, si corresponde. */
async function cancelarConDevolucion(reserva, idUsuario, motivo = 'Cambio de planes') {
  const solicitud = await confirmarCancelacion(reserva, idUsuario, { motivo });
  const reembolso = await source.getRepository(Reembolso).findOneBy({ referencia_interna: `auto-can:${solicitud.id}` });
  return { solicitud, reembolso };
}

function consultarPagoDelInquilino(idReserva) {
  const pagos = new PagosService(new PagosRepository(source.getRepository(Pago)));
  const operaciones = new OperacionesPagoService(null, pagos, reservas, reembolsos, null, pasarela, catalogosDePrueba(), operacionesReembolso);
  return operaciones.consultarResumen(idReserva, 1);
}

async function cancelacionConFaltante(recibido = 30) {
  // A dos días del ingreso, la cancelación del inquilino devuelve el 50 %.
  const { reserva, pago } = await escenario(fechaEnDias(2));
  // Pago sin el medio confirmado: la devolución se gestiona por transferencia.
  await source.getRepository(Pago).update(pago.id, { payment_method_id: null });
  const { solicitud, reembolso } = await cancelarConDevolucion(reserva, 1);
  // Mercado Pago informa un medio sin devolución automática: la conciliación la deriva a transferencia.
  await conciliarDevoluciones('ticket');
  if (recibido > 0) {
    // Reproduce una devolución histórica incompleta sin falsificar el saldo agregado del pago.
    await source.getRepository(Reembolso).update(reembolso.id, { importe: recibido });
    await operacionesReembolso.registrarTransferencia(reembolso.id, { referencia: 'comprobante-original' }, comprobantePdf(), 3);
  }
  return { reserva, pago, solicitud, reembolso };
}

const descripcionFaltante = 'Recibí una devolución menor a la que correspondía por la cancelación.';

test('automática: valida el importe aceptado y aprueba una sola solicitud', async () => {
  const { reserva } = await escenario();
  const condiciones = await cancelaciones.consultarCondiciones(reserva.id, 1);
  const datos = { motivo: 'Cambio de planes', aceptaTerminos: true, importeAceptado: condiciones.devolucion.importe, monedaAceptada: condiciones.devolucion.moneda };
  await assert.rejects(() => cancelaciones.solicitar(reserva.id, { ...datos, importeAceptado: datos.importeAceptado + 1 }, 1));
  const primera = await cancelaciones.solicitar(reserva.id, datos, 1);
  const segunda = await cancelaciones.solicitar(reserva.id, datos, 1);
  assert.equal(primera.id, segunda.id);
  assert.equal(primera.estado, 'APROBADA');
  assert.equal((await source.getRepository(Reembolso).find()).length, 1);
});

test('automática: tarjeta se simula sin llamar al proveedor de devolución', async () => {
  const { reserva } = await escenario();
  const condiciones = await cancelaciones.consultarCondiciones(reserva.id, 2);
  const solicitud = await cancelaciones.solicitar(reserva.id, { motivo: 'Cambio de planes', aceptaTerminos: true, importeAceptado: condiciones.devolucion.importe, monedaAceptada: condiciones.devolucion.moneda }, 2);
  assert.equal(solicitud.estado, 'APROBADA');
  const [reembolso] = await reembolsos.listarCancelacionesAutomaticasPendientes(0);
  pasarela.consultarPago = async () => ({ id: 'mp-1', status: 'approved', payment_type_id: 'credit_card' });
  pasarela.permiteSimulacionTarjeta = () => true;
  pasarela.reembolsar = async () => { throw new Error('No debe solicitarse devolución real'); };
  const resultado = await reembolsos.ejecutarCancelacionAutomatica(reembolso.id);
  assert.equal(resultado.estado, 'APROBADO');
  assert.match(resultado.referencia_externa, /^SIMULADO:tarjeta:/);
  await operacionesReembolso.aplicarReembolsoConfirmado(reembolso.id);
  const actual = await reservas.obtenerReserva(reserva.id);
  assert.equal(actual.cancelada, true);
  assert.equal(actual.cancelada_por, 'ANUNCIANTE');
  assert.equal(actual.referencia_liquidacion, resultado.referencia_externa);
  const { pago } = await consultarPagoDelInquilino(reserva.id);
  assert.equal(pago.amount, 100);
  assert.deepEqual(pago.devolucion, { reembolsado: 0, simulado: 100, sinDevolver: 100 });
});

test('automática: el resumen separa el pago original de una devolución parcial aprobada', async () => {
  const { reserva, pago } = await escenario(fechaEnDias(2));
  await source.getRepository(Pago).update(pago.id, { amount: 6 });
  await confirmarCancelacion(reserva, 1);
  assert.equal((await consultarPagoDelInquilino(reserva.id)).pago.devolucion, null);
  const [reembolso] = await reembolsos.listarCancelacionesAutomaticasPendientes(0);
  pasarela.consultarPago = async () => ({ id: pago.payment_id, status: 'approved', payment_type_id: 'account_money' });
  await reembolsos.ejecutarCancelacionAutomatica(reembolso.id);
  const { pago: resumen } = await consultarPagoDelInquilino(reserva.id);
  assert.equal(resumen.amount, 6);
  assert.deepEqual(resumen.devolucion, { reembolsado: 3, simulado: 0, sinDevolver: 3 });
});

test('automática: no simula tarjeta cuando la simulación está deshabilitada', async () => {
  const { reserva } = await escenario();
  const condiciones = await cancelaciones.consultarCondiciones(reserva.id, 1);
  await cancelaciones.solicitar(reserva.id, { motivo: 'Cambio de planes', aceptaTerminos: true, importeAceptado: condiciones.devolucion.importe, monedaAceptada: condiciones.devolucion.moneda }, 1);
  const [reembolso] = await reembolsos.listarCancelacionesAutomaticasPendientes(0);
  pasarela.consultarPago = async () => ({ id: 'mp-1', status: 'approved', payment_type_id: 'debit_card' });
  pasarela.permiteSimulacionTarjeta = () => false;
  const resultado = await reembolsos.ejecutarCancelacionAutomatica(reembolso.id);
  assert.equal(resultado.estado, 'PENDIENTE');
  assert.equal(resultado.transferencia_manual, true);
  assert.deepEqual(await reembolsos.listarCancelacionesAutomaticasPendientes(0), []);
});

test('automática: dinero en cuenta solicita devolución real y aplica la cancelación', async () => {
  const { reserva } = await escenario();
  const condiciones = await cancelaciones.consultarCondiciones(reserva.id, 1);
  await cancelaciones.solicitar(reserva.id, { motivo: 'Cambio de planes', aceptaTerminos: true, importeAceptado: condiciones.devolucion.importe, monedaAceptada: condiciones.devolucion.moneda }, 1);
  const [reembolso] = await reembolsos.listarCancelacionesAutomaticasPendientes(0);
  let llamadas = 0;
  pasarela.consultarPago = async () => ({ id: 'mp-1', status: 'approved', payment_type_id: 'account_money' });
  pasarela.reembolsar = async (_id, importe) => { llamadas++; return { id: 'refund-real', status: 'approved', amount: importe }; };
  const resultado = await reembolsos.ejecutarCancelacionAutomatica(reembolso.id);
  assert.equal(resultado.estado, 'APROBADO');
  await reembolsos.ejecutarCancelacionAutomatica(reembolso.id);
  assert.equal(llamadas, 1);
  await operacionesReembolso.aplicarReembolsoConfirmado(reembolso.id);
  assert.equal((await source.getRepository(Reserva).findOneByOrFail({ id: reserva.id })).cancelada, true);
  assert.deepEqual((await consultarPagoDelInquilino(reserva.id)).pago.devolucion,
    { reembolsado: 100, simulado: 0, sinDevolver: 0 });
});

test('automática: un error al liberar las fechas deja la aprobación sin aplicar y se recupera sin devolver otra vez', async t => {
  const { reserva } = await escenario();
  await confirmarCancelacion(reserva, 1);
  pasarela.consultarPago = async () => ({ id: 'mp-1', status: 'approved', payment_type_id: 'account_money' });
  const devolver = t.mock.method(pasarela, 'reembolsar');
  const liberar = t.mock.method(disponibilidad, 'liberarReserva', async () => { throw new Error('Calendario temporalmente indisponible'); });

  await operacionesReembolso.conciliar();
  const [reembolso] = await source.getRepository(Reembolso).find();
  assert.equal(reembolso.estado, 'APROBADO');
  assert.equal(reembolso.aplicado_en, null);
  assert.equal((await reservas.obtenerReserva(reserva.id)).cancelada, false);

  liberar.mock.restore();
  await operacionesReembolso.conciliar();
  await operacionesReembolso.conciliar();
  assert.ok((await reembolsos.buscar(reembolso.id)).aplicado_en);
  assert.equal((await reservas.obtenerReserva(reserva.id)).cancelada_por, 'INQUILINO');
  assert.equal(devolver.mock.callCount(), 1);
});

test('el anunciante puede identificar al huésped pero solo el titular y administración ven su contacto', async () => {
  const { reserva } = await escenario();
  await source.getRepository(Reserva).update(reserva.id, { usuario_email: 'privado@example.invalid', usuario_telefono: '555001' });
  const recibidas = await reservas.listarRecibidasPorAnunciante(2);
  const detalle = await reservas.buscarPorId(reserva.id, 2);
  for (const respuesta of [recibidas[0], detalle]) {
    assert.equal(respuesta.usuario.id, 1);
    assert.equal(respuesta.usuario.email, null);
    assert.equal(respuesta.usuario.email_historico, null);
    assert.equal(respuesta.usuario.telefono, '');
    assert.equal(respuesta.usuario_email, null);
    assert.equal(respuesta.usuario_telefono, null);
  }
  assert.equal((await reservas.buscarPorId(reserva.id, 1)).usuario_email, 'privado@example.invalid');
  assert.equal((await reservas.buscarParaAdministracion(reserva.id)).usuario_telefono, '555001');
  await confirmarCancelacion(reserva, 1);
  assert.equal((await cancelaciones.consultarActiva(reserva.id, 2)).solicitante.email, undefined);
});

test('el reembolso fallido pasa a transferencia solo cuando Mercado Pago permite descartar un reintegro duplicado', async () => {
  const { reserva, pago } = await escenario();
  await confirmarCancelacion(reserva, 1);
  const [reembolso] = await reembolsos.listarCancelacionesAutomaticasPendientes(0);
  const repo = source.getRepository(Reembolso);
  await assert.rejects(reembolsos.habilitarTransferenciaFallida(reembolso.id), { status: 409 });
  await repo.update(reembolso.id, { estado: 'FALLIDO', primer_intento_en: new Date() });
  let consultas = 0;
  pasarela.listarReembolsos = async () => { consultas++; return []; };
  await assert.rejects(reembolsos.habilitarTransferenciaFallida(reembolso.id), { status: 409 });
  assert.equal(consultas, 0);
  await repo.update(reembolso.id, { primer_intento_en: new Date(Date.now() - 16 * 60_000) });
  for (const status of ['pending', 'approved']) {
    pasarela.listarReembolsos = async () => [{ id: 123, status, amount: 100, payment_id: pago.payment_id }];
    await assert.rejects(reembolsos.habilitarTransferenciaFallida(reembolso.id), { status: 409 });
  }
  pasarela.listarReembolsos = async () => [{ id: 123, status: 'rejected', payment_id: pago.payment_id }];
  let habilitada = await reembolsos.habilitarTransferenciaFallida(reembolso.id);
  assert.deepEqual([habilitada.estado, habilitada.transferencia_manual], ['PENDIENTE', true]);
  assert.equal((await reembolsos.habilitarTransferenciaFallida(reembolso.id)).id, habilitada.id);
  assert.deepEqual(await reembolsos.listarCancelacionesAutomaticasPendientes(0), []);
  const resultado = await operacionesReembolso.registrarTransferencia(reembolso.id, { referencia: 'Banco 123' }, comprobantePdf(), 3);
  assert.equal(resultado.reembolso.estado, 'APROBADO');
  assert.equal(resultado.reserva.cancelada, true);
  await assert.rejects(reembolsos.habilitarTransferenciaFallida(reembolso.id), { status: 409 });
});

test('reclama y completa solo los 20 faltantes de una devolución del 50 %, incluso antes del ingreso', async () => {
  const { reserva, pago, solicitud } = await cancelacionConFaltante();
  const saldo = await reclamos.consultarFaltanteCancelacion(reserva.id, 1);
  assert.deepEqual(saldo.devolucion, { solicitudId: solicitud.id, porcentaje: 50, moneda: 'ARS', esperado: 50, devuelto: 30, enGestion: 0, faltante: 20, importeReclamable: 20 });
  const reclamo = await reclamos.reclamarFaltanteCancelacion(reserva.id, { descripcion: descripcionFaltante }, 1);
  assert.equal(reclamo.solicitud_cancelacion_id, solicitud.id);
  assert.equal(reclamo.devolucion_cancelacion.importeReclamable, 20);
  assert.equal((await reclamos.listarMios(1))[0].devolucion_cancelacion.esperado, 50);
  assert.equal((await reclamos.listarAdministracion())[0].devolucion_cancelacion.devuelto, 30);
  await assert.rejects(reclamos.reclamarFaltanteCancelacion(reserva.id, { descripcion: descripcionFaltante }, 1), /reclamo abierto/);
  assert.equal(await source.getRepository(Reclamo).count(), 1);
  assert.equal(await source.getRepository(Reembolso).count(), 1);
  const resuelto = await reclamos.resolver(reclamo.id, { resolucion: 'DEVOLUCION_TOTAL', importe: 999 }, 3);
  assert.equal(Number(resuelto.importe_reembolso), 20);
  const complemento = await reembolsos.buscarPorOrigen('RECLAMO', `rec:${reclamo.id}`);
  assert.equal(Number(complemento.importe), 20);
  assert.equal(complemento.tipo, 'PARCIAL');
  assert.equal((await reclamos.consultarFaltanteCancelacion(reserva.id, 1)).devolucion.importeReclamable, 0);
  await operacionesReembolso.registrarTransferencia(complemento.id, { referencia: 'comprobante-complemento' }, comprobantePdf(), 3);
  assert.equal(Number((await source.getRepository(Pago).findOneByOrFail({ id: pago.id })).amount_refunded), 50);
  assert.equal((await reservas.obtenerReserva(reserva.id)).cancelada, true);
  assert.equal((await reclamos.consultarFaltanteCancelacion(reserva.id, 1)).devolucion.faltante, 0);
  await assert.rejects(reclamos.reclamarFaltanteCancelacion(reserva.id, { descripcion: descripcionFaltante }, 1), /No hay un importe faltante/);
  await assert.rejects(reclamos.resolver(reclamo.id, { resolucion: 'DEVOLUCION_TOTAL' }, 3), /ya fue resuelto/);
});

for (const estado of ['PENDIENTE', 'EN_PROCESO', 'FALLIDO']) {
  test(`una devolución ${estado} que cubre el faltante impide otro reclamo`, async () => {
    const { reserva, reembolso } = await cancelacionConFaltante(0);
    await source.getRepository(Reembolso).update(reembolso.id, { estado });
    const { devolucion } = await reclamos.consultarFaltanteCancelacion(reserva.id, 1);
    assert.equal(devolucion.faltante, 50);
    assert.equal(devolucion.enGestion, 50);
    assert.equal(devolucion.importeReclamable, 0);
    await assert.rejects(reclamos.reclamarFaltanteCancelacion(reserva.id, { descripcion: descripcionFaltante }, 1), /No hay un importe faltante/);
    assert.equal(await source.getRepository(Reclamo).count(), 0);
  });
}

test('retener el 50 % según la política no es un faltante', async () => {
  const { reserva } = await cancelacionConFaltante(50);
  const saldo = await reclamos.consultarFaltanteCancelacion(reserva.id, 1);
  assert.equal(saldo.devolucion.esperado, 50);
  assert.equal(saldo.devolucion.devuelto, 50);
  assert.equal(saldo.devolucion.faltante, 0);
  await assert.rejects(reclamos.reclamarFaltanteCancelacion(reserva.id, { descripcion: descripcionFaltante }, 1), /No hay un importe faltante/);
});

test('una cancelación con 0 % no permite reclamar el importe retenido', async () => {
  const { reserva, solicitud, reembolso } = await cancelacionConFaltante(0);
  // Confirmada el día anterior al ingreso, no corresponde devolución.
  await source.getRepository(SolicitudCancelacion).update(solicitud.id, { creada_en: new Date(Date.now() + 86400000) });
  await source.getRepository(Reembolso).update(reembolso.id, { estado: 'RECHAZADO' });
  const { devolucion } = await reclamos.consultarFaltanteCancelacion(reserva.id, 1);
  assert.equal(devolucion.esperado, 0);
  assert.equal(devolucion.importeReclamable, 0);
  await assert.rejects(reclamos.reclamarFaltanteCancelacion(reserva.id, { descripcion: descripcionFaltante }, 1), /No hay un importe faltante/);
});

test('si canceló el anunciante el faltante se calcula sobre el 100 %', async () => {
  const { reserva, solicitud } = await cancelacionConFaltante();
  await source.getRepository(SolicitudCancelacion).update(solicitud.id, { solicitante: { id: 2 } });
  const { devolucion } = await reclamos.consultarFaltanteCancelacion(reserva.id, 1);
  assert.equal(devolucion.esperado, 100);
  assert.equal(devolucion.importeReclamable, 70);
});

test('descuenta los complementos en gestión y permite devolver una parte del faltante', async () => {
  const { reserva, pago } = await cancelacionConFaltante();
  await reembolsos.crearSolicitud({ reserva, pago, importe: 5, tipo: 'PARCIAL', origen: 'AJUSTE_ADMIN', motivo: 'Parte del complemento', idSolicitadoPor: 3 });
  const saldo = await reclamos.consultarFaltanteCancelacion(reserva.id, 1);
  assert.equal(saldo.devolucion.importeReclamable, 15);
  const reclamo = await reclamos.reclamarFaltanteCancelacion(reserva.id, { descripcion: descripcionFaltante }, 1);
  const resuelto = await reclamos.resolver(reclamo.id, { resolucion: 'DEVOLUCION_PARCIAL', importe: 10 }, 3);
  assert.equal(Number(resuelto.importe_reembolso), 10);
  assert.equal((await reclamos.consultarFaltanteCancelacion(reserva.id, 1)).devolucion.importeReclamable, 5);
});

test('vuelve a comprobar el faltante antes de resolver y no duplica una devolución nueva', async () => {
  const { reserva, pago } = await cancelacionConFaltante();
  const reclamo = await reclamos.reclamarFaltanteCancelacion(reserva.id, { descripcion: descripcionFaltante }, 1);
  await reembolsos.crearSolicitud({ reserva, pago, importe: 20, tipo: 'PARCIAL', origen: 'AJUSTE_ADMIN', motivo: 'Complemento en gestión', idSolicitadoPor: 3 });
  await assert.rejects(reclamos.resolver(reclamo.id, { resolucion: 'DEVOLUCION_TOTAL' }, 3), /faltante ya está cubierto/);
  assert.equal((await source.getRepository(Reclamo).findOneByOrFail({ id: reclamo.id })).estado, 'ABIERTO');
  assert.equal(await source.getRepository(Reembolso).count(), 2);
});

test('limita una devolución parcial al faltante y permite rechazar sin cambiar la cancelación', async () => {
  const { reserva } = await cancelacionConFaltante();
  const reclamo = await reclamos.reclamarFaltanteCancelacion(reserva.id, { descripcion: descripcionFaltante }, 1);
  await assert.rejects(reclamos.resolver(reclamo.id, { resolucion: 'DEVOLUCION_PARCIAL', importe: 30 }, 3), /no superar el faltante/);
  await assert.rejects(reclamos.resolver(reclamo.id, { resolucion: 'DEVOLUCION_PARCIAL', importe: 20 }, 3), /Completar faltante/);
  const antes = await reservas.obtenerReserva(reserva.id);
  await reclamos.resolver(reclamo.id, { resolucion: 'SIN_DEVOLUCION' }, 3);
  const despues = await reservas.obtenerReserva(reserva.id);
  assert.equal(despues.estado_liquidacion, antes.estado_liquidacion);
  assert.equal(despues.cancelada, true);
  assert.equal(await source.getRepository(Reembolso).count(), 1);
});

test('un fallo al guardar la reserva revierte el alta del reclamo y permite reintentar', async t => {
  const { reserva } = await cancelacionConFaltante();
  const fallo = t.mock.method(ReservaRepository.prototype, 'guardar', async () => { throw new Error('fallo al guardar reserva'); });
  await assert.rejects(reclamos.reclamarFaltanteCancelacion(reserva.id, { descripcion: descripcionFaltante }, 1), /fallo al guardar reserva/);
  assert.equal(await source.getRepository(Reclamo).count(), 0);
  fallo.mock.restore();
  await reclamos.reclamarFaltanteCancelacion(reserva.id, { descripcion: descripcionFaltante }, 1);
  assert.equal(await source.getRepository(Reclamo).count(), 1);
});

test('si falla la decisión se revierte el complemento y permite resolver una sola vez', async t => {
  const { reserva } = await cancelacionConFaltante();
  const reclamo = await reclamos.reclamarFaltanteCancelacion(reserva.id, { descripcion: descripcionFaltante }, 1);
  const fallo = t.mock.method(ReclamosRepository.prototype, 'guardar', async () => { throw new Error('fallo de decisión'); });
  await assert.rejects(reclamos.resolver(reclamo.id, { resolucion: 'DEVOLUCION_TOTAL' }, 3), /fallo de decisión/);
  assert.equal(await source.getRepository(Reembolso).count(), 1);
  assert.equal((await source.getRepository(Reclamo).findOneByOrFail({ id: reclamo.id })).estado, 'ABIERTO');
  fallo.mock.restore();
  await reclamos.resolver(reclamo.id, { resolucion: 'DEVOLUCION_TOTAL' }, 3);
  assert.equal(await source.getRepository(Reembolso).count(), 2);
});

test('la migración es repetible y conserva expedientes de la versión anterior', async () => {
  const anterior = await crearPostgresPruebas({ reclamoFaltante: false });
  try {
    await anterior.cargarSeed();
    await anterior.db.exec("INSERT INTO usuario (id_usuario,nombre,apellido,email,telefono,contrasenia) VALUES (900,'Prueba','Migración','migracion@example.invalid','123','hash'); INSERT INTO reserva (id_reserva,monto_pago) VALUES (900,100); INSERT INTO reclamo_reserva (id_reserva,id_inquilino,categoria,descripcion) VALUES (900,900,'OTRO','Expediente anterior que debe conservarse');");
    const sql = migracion('20261121-reclamo-faltante-cancelacion.sql');
    await anterior.db.exec(sql);
    await anterior.db.exec(sql);
    const { rows } = await anterior.db.query('SELECT descripcion,id_solicitud_cancelacion FROM reclamo_reserva WHERE id_reserva=900');
    assert.equal(rows.length, 1);
    assert.equal(rows[0].id_solicitud_cancelacion, null);
  } finally { await anterior.cerrar(); }
});

test('el vencimiento se revierte ante un error y se puede reintentar sin validar el código', async () => {
  const { reserva } = await escenario('2026-11-10');
  await source.getRepository(Reserva).update(reserva.id, { fecha_fin: '2026-11-16' });
  await source.getRepository(Liquidacion).save({ reserva, estado: 'RETENIDO', moneda: 'ARS' });
  const liquidaciones = new LiquidacionesService(new LiquidacionRepository(source.getRepository(Liquidacion)), catalogosDePrueba());
  const operaciones = new OperacionesLiquidacionService(reembolsos, reservas, liquidaciones, catalogosDePrueba(), {}, reclamos);
  const leer = () => source.getRepository(Liquidacion).findOneByOrFail({ reserva: { id: reserva.id } });
  await operaciones.avisarLiquidacionesDisponibles(new Date('2026-11-20T12:00:00Z'));
  assert.equal((await leer()).estado, 'RETENIDO');
  const registrar = liquidaciones.registrarVencimientoIngreso.bind(liquidaciones);
  liquidaciones.registrarVencimientoIngreso = async (...args) => { await registrar(...args); throw new Error('fallo simulado'); };
  await operaciones.avisarLiquidacionesDisponibles(new Date('2026-11-21T12:00:00Z'));
  assert.equal((await leer()).estado, 'RETENIDO');
  liquidaciones.registrarVencimientoIngreso = registrar;
  await operaciones.avisarLiquidacionesDisponibles(new Date('2026-11-21T12:00:00Z'));
  await operaciones.avisarLiquidacionesDisponibles(new Date('2026-11-21T12:00:00Z'));
  assert.equal((await leer()).estado, 'PENDIENTE_PAGO_PROPIETARIO');
  assert.equal((await source.getRepository(Reserva).findOneByOrFail({ id: reserva.id })).codigo_validado_en, null);
  assert.equal(await source.getRepository(Liquidacion).count(), 1);
});

test('el código bloqueado con la estadía terminada llega al pago del anunciante', async (t) => {
  // Estadía del 10 al 20/01/2099: el pago se habilita el 25/01.
  const { reserva } = await escenario();
  await source.getRepository(Reserva).update(reserva.id, { codigo_alojamiento: 'K7M4P9Q2', codigo_generado_en: new Date() });
  await source.getRepository(Liquidacion).save({ reserva, estado: 'RETENIDO', moneda: 'ARS' });
  const liquidaciones = new LiquidacionesService(new LiquidacionRepository(source.getRepository(Liquidacion)), catalogosDePrueba());
  const operaciones = new OperacionesLiquidacionService(
    reembolsos, reservas, liquidaciones, catalogosDePrueba(), { buscarCbuValidado: async () => '0010000700000000000017' }, reclamos, undefined, almacenamientoDePrueba().almacenamiento,
  );
  const liquidacion = () => source.getRepository(Liquidacion).findOneByOrFail({ reserva: { id: reserva.id } });
  const actual = () => source.getRepository(Reserva).findOneByOrFail({ id: reserva.id });

  // 1. Durante la estadía el anunciante falla 5 veces y el código se bloquea.
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-15T15:00:00Z') });
  for (let intento = 0; intento < 5; intento++)
    await assert.rejects(reservas.validarCodigoAlojamiento(reserva.id, 'AAAAAAAA', 2), /Código incorrecto/);
  assert.equal((await liquidacion()).estado, 'EN_REVISION');

  // 2. Terminada la estadía, el admin cierra la revisión: vuelve a RETENIDO con los intentos en 0.
  t.mock.timers.setTime(new Date('2099-01-22T15:00:00Z').getTime());
  await operaciones.resolverLiquidacion(reserva.id, { estado: 'RETENIDO', observacion: 'Revisión cerrada' }, 3);
  assert.equal((await liquidacion()).estado, 'RETENIDO');
  assert.equal((await actual()).intentos_codigo, 0);

  // 3. Antes de que venza el plazo no se puede pagar ni se adelanta el vencimiento.
  t.mock.timers.setTime(new Date('2099-01-24T15:00:00Z').getTime());
  await operaciones.avisarLiquidacionesDisponibles();
  assert.equal((await liquidacion()).estado, 'RETENIDO');
  await assert.rejects(operaciones.registrarPagoAnunciante(reserva.id, { referencia: 'pago-anticipado' }, comprobantePdf(), 3),
    (error) => error.getStatus() === 409);

  // 4. Al vencer el plazo, queda pendiente de pago a favor del anunciante y el admin paga sin código.
  t.mock.timers.setTime(new Date('2099-01-25T15:00:00Z').getTime());
  await operaciones.avisarLiquidacionesDisponibles();
  assert.equal((await liquidacion()).estado, 'PENDIENTE_PAGO_PROPIETARIO');
  await operaciones.registrarPagoAnunciante(reserva.id, { referencia: 'transferencia-1' }, comprobantePdf(), 3);
  const pagada = await liquidacion();
  assert.equal(pagada.estado, 'PAGADO_PROPIETARIO');
  assert.equal(Number(pagada.importe), 100);
  assert.equal((await actual()).codigo_validado_en, null);
});

test('cada caso del código de alojamiento tiene su mensaje y la reserva informa los intentos restantes', async (t) => {
  // Estadía del 10 al 20/01/2099: el código se carga solo durante la estadía.
  const codigo = 'K7M4P9Q2';
  const conCodigo = async () => {
    const reserva = await reservaParaReclamo({ fecha_inicio: '2099-01-10', fecha_fin: '2099-01-20' }, { estado: 'RETENIDO' });
    await source.getRepository(Reserva).update(reserva.id, { codigo_alojamiento: codigo, codigo_generado_en: new Date() });
    return reserva;
  };
  const validar = (reserva, valor = 'AAAAAAAA') => reservas.validarCodigoAlojamiento(reserva.id, valor, 2);
  const restantes = async (reserva) => reservas.prepararRespuesta(await reservas.obtenerReserva(reserva.id)).intentos_codigo_restantes;
  const rechaza = (promesa, estado, mensaje) => assert.rejects(promesa, (error) => {
    assert.equal(error.getStatus(), estado);
    assert.match(error.message, mensaje);
    return true;
  });
  const reserva = await conCodigo();
  const vencida = await conCodigo();

  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-09T15:00:00Z') });
  await rechaza(validar(reserva, codigo), 409, /Vas a poder validar el código desde el 10\/01\/2099/);

  t.mock.timers.setTime(new Date('2099-01-15T15:00:00Z').getTime());
  assert.equal(await restantes(reserva), 5);
  await rechaza(validar(reserva), 400, /^Código incorrecto\. Te quedan 4 intentos de 5\.$/);
  for (let intento = 0; intento < 2; intento++) await rechaza(validar(reserva), 400, /Código incorrecto/);
  await rechaza(validar(reserva), 400, /Te queda 1 intento de 5\./);
  await rechaza(validar(reserva), 400, /^Código incorrecto\. El código se bloqueó tras 5 intentos incorrectos/);
  assert.equal(await restantes(reserva), 0);
  // Bloqueado, el código correcto tampoco pasa y el mensaje sigue siendo el del bloqueo.
  await rechaza(validar(reserva, codigo), 409, /^El código se bloqueó tras 5 intentos incorrectos\. Pedí el reinicio a Administración desde la reserva\.$/);

  // Terminada la estadía ya no hay validación tardía: el pago sigue su plazo y los problemas van por reclamo.
  t.mock.timers.setTime(new Date('2099-01-21T15:00:00Z').getTime());
  await rechaza(validar(vencida, codigo), 409, /^La estadía terminó el 20\/01\/2099: el código ya no se puede validar\. Si hubo un problema con el ingreso, abrí un reclamo\.$/);

  t.mock.timers.setTime(new Date('2099-01-16T15:00:00Z').getTime());
  await validar(vencida, codigo);
  await rechaza(validar(vencida, codigo), 409, /El ingreso ya se validó el 16\/01\/2099/);
});

async function codigoBloqueado(datos = {}) {
  const reserva = await reservaParaReclamo(datos, {
    estado: 'EN_REVISION', observacion: 'Código bloqueado después de cinco intentos incorrectos',
  });
  await source.getRepository(Reserva).update(reserva.id, { intentos_codigo: 5 });
  return reserva;
}

const pedirReinicio = (servicio, reserva, idUsuario = 2) => servicio.crear({
  id_reserva: reserva.id, categoria: 'CODIGO_BLOQUEADO', descripcion: 'El huésped me dictó el código y no lo toma',
}, idUsuario);

test('solo el anunciante con el código bloqueado puede pedir el reinicio', async () => {
  const { servicio, avisos } = reclamosConAvisos();
  const sinBloqueo = await reservaParaReclamo({}, { estado: 'RETENIDO' });
  await assert.rejects(pedirReinicio(servicio, sinBloqueo), /no está bloqueado/);

  const bloqueada = await codigoBloqueado();
  await assert.rejects(pedirReinicio(servicio, bloqueada, 1), (error) => error.getStatus() === 403);
  await assert.rejects(servicio.crear({ id_reserva: bloqueada.id, categoria: 'OTRO', descripcion: 'Quiero reclamar como anunciante' }, 2),
    /Solo el Inquilino/);

  const pedido = await pedirReinicio(servicio, bloqueada);
  assert.equal(pedido.estado, 'ABIERTO');
  assert.equal(pedido.categoria, 'CODIGO_BLOQUEADO');
  assert.equal((await liquidacionDe(bloqueada)).observacion,
    'Código bloqueado después de cinco intentos incorrectos · Pedido de reinicio del código en revisión');
  assert.deepEqual(avisos.map(aviso => aviso.asunto), ['Pedido de reinicio del código de alojamiento']);
  await assert.rejects(pedirReinicio(servicio, bloqueada), /ya tiene un reclamo abierto/);
});

test('el admin habilita intentos sin límite de reinicios o confirma el ingreso sin código', async () => {
  const { servicio, avisos } = reclamosConAvisos();
  const reserva = await codigoBloqueado();
  const primero = await pedirReinicio(servicio, reserva);
  await assert.rejects(servicio.resolver(primero.id, { resolucion: 'SIN_DEVOLUCION' }, 3), /pedido de reinicio del código se resuelve/);

  const reiniciado = await servicio.resolver(primero.id, { resolucion: 'REINICIAR_CODIGO' }, 3);
  assert.deepEqual([reiniciado.estado, reiniciado.resolucion], ['RESUELTO_ANUNCIANTE', 'REINICIAR_CODIGO']);
  assert.equal((await reservas.obtenerReserva(reserva.id)).intentos_codigo, 0);
  assert.equal((await liquidacionDe(reserva)).estado, 'RETENIDO');
  assert.equal(avisos.at(-1).asunto, 'Código de alojamiento reiniciado');

  // Vuelve a bloquearse: se puede pedir otro reinicio, y esta vez el admin confirma el ingreso.
  await source.getRepository(Reserva).update(reserva.id, { intentos_codigo: 5 });
  await source.getRepository(Liquidacion).update({ reserva: { id: reserva.id } }, { estado: 'EN_REVISION' });
  const segundo = await pedirReinicio(servicio, reserva);
  const confirmado = await servicio.resolver(segundo.id, { resolucion: 'CONFIRMAR_INGRESO' }, 3);
  assert.deepEqual([confirmado.estado, confirmado.resolucion], ['RESUELTO_ANUNCIANTE', 'CONFIRMAR_INGRESO']);
  assert.equal((await liquidacionDe(reserva)).estado, 'PENDIENTE_PAGO_PROPIETARIO');
  // El ingreso queda validado: la estadía se ve como con el código (En curso / Finalizada).
  const confirmada = await reservas.obtenerReserva(reserva.id);
  assert.ok(confirmada.codigo_validado_en);
  assert.notEqual(reservas.calcularEstadoEstadia(confirmada), 'PENDIENTE_INGRESO');
  assert.notEqual(reservas.calcularEstadoEstadia(confirmada), 'INGRESO_NO_VERIFICADO');
  assert.equal(avisos.at(-1).asunto, 'Ingreso confirmado por la administración');
  assert.equal(await source.getRepository(Reembolso).count(), 0);
  // Con el ingreso confirmado, el código sigue bloqueado pero ya no se puede pedir otro reinicio.
  await assert.rejects(pedirReinicio(servicio, reserva), /ya se validó/);
  assert.equal((await liquidacionDe(reserva)).estado, 'PENDIENTE_PAGO_PROPIETARIO');

  // Las salidas del pedido no se usan en otros reclamos.
  const otra = await reservaParaReclamo({}, { estado: 'RETENIDO' });
  const comun = await reclamoAbierto(otra);
  await assert.rejects(servicio.resolver(comun.id, { resolucion: 'REINICIAR_CODIGO' }, 3), /solo corresponde a un pedido de reinicio/);
});

test('terminada la estadía el código ya no se muestra y el pedido de reinicio no habilita más intentos', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-15T15:00:00Z') });
  const reserva = await codigoBloqueado({ fecha_inicio: '2099-01-10', fecha_fin: '2099-01-20' });
  await source.getRepository(Reserva).update(reserva.id, { codigo_alojamiento: 'K7M4P9Q2', codigo_generado_en: new Date() });
  assert.equal((await reservas.consultarCodigoAlojamiento(reserva.id, 1)).codigo, 'K7M4P9Q2');
  const { servicio } = reclamosConAvisos();
  const pedido = await pedirReinicio(servicio, reserva);

  t.mock.timers.setTime(new Date('2099-01-21T15:00:00Z').getTime());
  await assert.rejects(reservas.consultarCodigoAlojamiento(reserva.id, 1), /estadía cerrada/);
  await assert.rejects(servicio.resolver(pedido.id, { resolucion: 'REINICIAR_CODIGO' }, 3), /La estadía ya terminó/);
  // Confirmar el ingreso sigue disponible: el pago al anunciante se habilita en la fecha habitual.
  const confirmado = await servicio.resolver(pedido.id, { resolucion: 'CONFIRMAR_INGRESO', observacion: 'El huésped estuvo' }, 3);
  assert.equal(confirmado.resolucion, 'CONFIRMAR_INGRESO');
  assert.equal((await liquidacionDe(reserva)).estado, 'PENDIENTE_PAGO_PROPIETARIO');
});

test('rechazar el pedido devuelve el total al inquilino y exige el motivo', async () => {
  const { reserva } = await escenario('2026-01-01');
  await source.getRepository(Liquidacion).save({ reserva, estado: 'EN_REVISION', moneda: 'ARS' });
  await source.getRepository(Reserva).update(reserva.id, { intentos_codigo: 5 });
  const { servicio } = reclamosConAvisos();
  const pedido = await pedirReinicio(servicio, reserva);
  await assert.rejects(servicio.resolver(pedido.id, { resolucion: 'DEVOLUCION_TOTAL' }, 3), /Indicá el motivo/);
  const rechazado = await servicio.resolver(pedido.id, { resolucion: 'DEVOLUCION_TOTAL', observacion: 'El huésped no pudo entrar' }, 3);
  assert.deepEqual([rechazado.estado, rechazado.resolucion, Number(rechazado.importe_reembolso)], ['RESUELTO_INQUILINO', 'DEVOLUCION_TOTAL', 100]);
});

test('el pedido de reinicio se resuelve con una devolución parcial y el resto se le paga al anunciante sin el código', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-15T15:00:00Z') });
  const { reserva } = await escenario();
  await source.getRepository(Liquidacion).save({ reserva, estado: 'EN_REVISION', moneda: 'ARS' });
  await source.getRepository(Reserva).update(reserva.id, { intentos_codigo: 5 });
  const { servicio } = reclamosConAvisos();
  const pedido = await pedirReinicio(servicio, reserva);
  await assert.rejects(servicio.resolver(pedido.id, { resolucion: 'DEVOLUCION_PARCIAL', importe: 40 }, 3), /Indicá el motivo/);
  const resuelto = await servicio.resolver(pedido.id, { resolucion: 'DEVOLUCION_PARCIAL', importe: 40, observacion: 'Entró un día tarde' }, 3);
  assert.deepEqual([resuelto.estado, resuelto.resolucion, Number(resuelto.importe_reembolso)], ['RESUELTO_INQUILINO', 'DEVOLUCION_PARCIAL', 40]);
  // La devolución no confirma el ingreso: queda sin verificar y el resto espera la fecha habitual.
  const actual = await reservas.obtenerReserva(reserva.id);
  assert.deepEqual([actual.estado_liquidacion, actual.codigo_validado_en], ['DEVUELTO_PARCIAL_INQUILINO', null]);

  t.mock.timers.setTime(new Date('2099-01-26T15:00:00Z').getTime());
  const operaciones = operacionesLiquidacion();
  const fila = await filaLiquidacion(operaciones, reserva.id);
  assert.equal(fila.reclamos.length, 1);
  assert.equal(fila.reclamos[0].resolucion, 'DEVOLUCION_PARCIAL');
  assert.equal(fila.reclamos[0].motivo_resolucion, 'Entró un día tarde');
  assert.deepEqual(fila.cancelaciones, []);
  assert.deepEqual([fila.importe_a_liquidar, fila.habilitada_para_pago], [60, true]);
  await operaciones.registrarPagoAnunciante(reserva.id, { referencia: 'trf-resto' }, comprobantePdf(), 3);
  assert.equal((await liquidacionDe(reserva)).estado, 'PAGADO_PROPIETARIO');
  // Ya pagado el resto, las dos partes siguen viendo lo que se le devolvió al inquilino.
  for (const listado of [reservas.listarPorUsuario(1), reservas.listarRecibidasPorAnunciante(2)]) {
    const fila = (await listado).find(item => item.id === reserva.id);
    assert.deepEqual(fila.devolucion_inquilino, { devuelto: 40, pagado: 100, moneda: 'ARS' });
  }
});

test('al vencer el plazo, el código bloqueado sin pedido ni reclamo queda a favor del anunciante', async () => {
  const liquidaciones = new LiquidacionesService(new LiquidacionRepository(source.getRepository(Liquidacion)), catalogosDePrueba());
  const operaciones = new OperacionesLiquidacionService(reembolsos, reservas, liquidaciones, catalogosDePrueba(), {}, reclamos);
  const fechas = { fecha_inicio: '2026-11-10', fecha_fin: '2026-11-16' };
  const bloqueada = await codigoBloqueado(fechas);
  const conPedido = await codigoBloqueado(fechas);
  const otraRevision = await reservaParaReclamo(fechas, { estado: 'EN_REVISION', observacion: 'Pago tardío en revisión' });
  await source.getRepository(Reclamo).save({
    reserva: conPedido, inquilino: { id: 1 }, anunciante: { id: 2 }, categoria: 'CODIGO_BLOQUEADO',
    descripcion: 'Pedido de reinicio abierto', estado: 'ABIERTO',
  });

  await operaciones.avisarLiquidacionesDisponibles(new Date('2026-11-20T12:00:00Z'));
  assert.equal((await liquidacionDe(bloqueada)).estado, 'EN_REVISION');
  await operaciones.avisarLiquidacionesDisponibles(new Date('2026-11-21T12:00:00Z'));
  assert.equal((await liquidacionDe(bloqueada)).estado, 'PENDIENTE_PAGO_PROPIETARIO');
  assert.equal((await liquidacionDe(conPedido)).estado, 'EN_REVISION');
  assert.equal((await liquidacionDe(otraRevision)).estado, 'EN_REVISION');
});

test('el historial del anunciante junta los pagos de todas sus publicaciones, una vez cada uno', async (t) => {
  await db.exec(`INSERT INTO publicacion (id_publicacion,titulo,descripcion,fecha_publicacion,precio,direccion,cantidad_ambientes,superficie,id_anunciante)
    VALUES (900,'Segunda publicación','Integración',CURRENT_DATE,100,'Dirección',1,30,2)`);
  t.after(() => db.exec('DELETE FROM publicacion WHERE id_publicacion = 900'));
  const pagar = async (idPublicacion, referencia) => {
    const reserva = await source.getRepository(Reserva).save({
      monto_pago: 100, estado_pago: 'APROBADO', usuario: { id: 1 }, publicacion: { id: idPublicacion },
      fecha_inicio: '2026-01-01', fecha_fin: '2026-01-05',
    });
    await source.getRepository(Liquidacion).save({
      reserva, estado: 'PAGADO_PROPIETARIO', importe: 100, moneda: 'ARS', referencia, fecha_pago_propietario: new Date(),
    });
    return reserva;
  };
  const primera = await pagar(1, 'transferencia-1');
  const segunda = await pagar(900, 'transferencia-2');
  await source.getRepository(Reserva).save({ monto_pago: 100, estado_pago: 'APROBADO', usuario: { id: 1 }, publicacion: { id: 1 } });
  const liquidaciones = new LiquidacionesService(new LiquidacionRepository(source.getRepository(Liquidacion)), catalogosDePrueba());

  const todos = await liquidaciones.listarPagosDelAnunciante(2);
  assert.deepEqual(todos.map(pago => [pago.reservaId, pago.publicacion, pago.referencia]).sort(), [
    [primera.id, 'Publicación de prueba', 'transferencia-1'],
    [segunda.id, 'Segunda publicación', 'transferencia-2'],
  ]);
  assert.equal(Object.hasOwn(todos[0], 'administrador'), false);
  assert.deepEqual((await liquidaciones.listarPagosDelAnunciante(2, 900)).map(pago => pago.reservaId), [segunda.id]);
  assert.deepEqual(await liquidaciones.listarPagosDelAnunciante(4), []);
});

test('un reclamo no puede sobrescribir una liquidación ya pagada al anunciante', async () => {
  const { reserva } = await escenario('2026-01-01');
  const fecha = new Date();
  const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).format(fecha);
  await source.getRepository(Reserva).update(reserva.id, { fecha_inicio: '2026-01-01', fecha_fin: hoy });
  await source.getRepository(Liquidacion).save({ reserva, estado: 'PAGADO_PROPIETARIO', importe: 100, moneda: 'ARS' });
  await assert.rejects(
    reclamos.crear({ id_reserva: reserva.id, categoria: 'OTRO', descripcion: 'Problema durante la estadía' }, 2),
    /Solo el Inquilino/,
  );
  await assert.rejects(
    reclamos.crear({ id_reserva: reserva.id, categoria: 'OTRO', descripcion: 'Problema durante la estadía' }, 1),
    /liquidación de esta reserva ya fue resuelta/i,
  );
  const liquidacion = await source.getRepository(Liquidacion).findOneByOrFail({ reserva: { id: reserva.id } });
  assert.equal(liquidacion.estado, 'PAGADO_PROPIETARIO');
  assert.equal(Number(liquidacion.importe), 100);
  assert.equal(await source.getRepository(Reclamo).count(), 0);
});

test('se puede reclamar antes del vencimiento y el reclamo congela la liquidación', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-25T02:59:59Z') });
  const { reserva } = await escenario();
  await source.getRepository(Liquidacion).save({ reserva, estado: 'RETENIDO', moneda: 'ARS' });
  await reclamos.crear({ id_reserva: reserva.id, categoria: 'OTRO', descripcion: 'Problema de la estadía' }, 1);
  assert.equal((await source.getRepository(Liquidacion).findOneByOrFail({ reserva: { id: reserva.id } })).estado, 'EN_REVISION');
});

test('el reclamo vence al comienzo del quinto día después del fin de la estadía', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-25T03:00:00Z') });
  const { reserva } = await escenario();
  await source.getRepository(Liquidacion).save({ reserva, estado: 'RETENIDO', moneda: 'ARS' });
  await assert.rejects(reclamos.crear({ id_reserva: reserva.id, categoria: 'OTRO', descripcion: 'Problema de la estadía' }, 1), /plazo para reclamar terminó el 24\/01\/2099/i);
  assert.equal((await source.getRepository(Liquidacion).findOneByOrFail({ reserva: { id: reserva.id } })).estado, 'RETENIDO');
  assert.equal(await source.getRepository(Reclamo).count(), 0);
});

test('un reclamo abierto mantiene la liquidación en revisión incluso después del vencimiento', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-24T15:00:00Z') });
  const { reserva } = await escenario();
  await source.getRepository(Liquidacion).save({ reserva, estado: 'RETENIDO', moneda: 'ARS' });
  await reclamos.crear({ id_reserva: reserva.id, categoria: 'OTRO', descripcion: 'Problema de la estadía' }, 1);
  const liquidaciones = new LiquidacionesService(new LiquidacionRepository(source.getRepository(Liquidacion)), catalogosDePrueba());
  const operaciones = new OperacionesLiquidacionService(reembolsos, reservas, liquidaciones, catalogosDePrueba(), {}, reclamos);
  t.mock.timers.setTime(new Date('2099-01-25T03:00:00Z').getTime());
  await operaciones.avisarLiquidacionesDisponibles(new Date());
  assert.equal((await source.getRepository(Liquidacion).findOneByOrFail({ reserva: { id: reserva.id } })).estado, 'EN_REVISION');
});

test('administración y el vencimiento no liberan una reserva con reclamo abierto', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-24T15:00:00Z') });
  const { reserva } = await escenario();
  await source.getRepository(Liquidacion).save({ reserva, estado: 'RETENIDO', moneda: 'ARS' });
  const reclamo = await reclamos.crear({ id_reserva: reserva.id, categoria: 'OTRO', descripcion: 'Problema de la estadía' }, 1);
  const liquidaciones = new LiquidacionesService(new LiquidacionRepository(source.getRepository(Liquidacion)), catalogosDePrueba());
  const operaciones = new OperacionesLiquidacionService(reembolsos, reservas, liquidaciones, catalogosDePrueba(), {}, reclamos);
  await assert.rejects(operaciones.resolverLiquidacion(reserva.id, { estado: 'RETENIDO' }, 3), /reclamo abierto/i);
  await assert.rejects(operaciones.resolverLiquidacion(reserva.id, { estado: 'PENDIENTE_PAGO_PROPIETARIO' }, 3), /reclamo abierto/i);
  await assert.rejects(operaciones.resolverLiquidacion(reserva.id, { estado: 'DEVUELTO_INQUILINO', observacion: 'Motivo de prueba' }, 3), /reclamo abierto/i);
  await source.getRepository(Liquidacion).update({ reserva: { id: reserva.id } }, { estado: 'RETENIDO' });
  t.mock.timers.setTime(new Date('2099-01-25T03:00:00Z').getTime());
  await operaciones.avisarLiquidacionesDisponibles(new Date());
  assert.equal((await source.getRepository(Liquidacion).findOneByOrFail({ reserva: { id: reserva.id } })).estado, 'RETENIDO');
  await reclamos.resolver(reclamo.id, { resolucion: ResolucionReclamo.SIN_DEVOLUCION }, 3);
  await operaciones.avisarLiquidacionesDisponibles(new Date());
  assert.equal((await source.getRepository(Liquidacion).findOneByOrFail({ reserva: { id: reserva.id } })).estado, 'PENDIENTE_PAGO_PROPIETARIO');
});

test('un segundo reclamo vuelve a poner en revisión la liquidación que esperaba el plazo de pago', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-22T15:00:00Z') });
  const { reserva } = await escenario();
  await source.getRepository(Reserva).update(reserva.id, { codigo_validado_en: new Date('2099-01-10T15:00:00Z') });
  await source.getRepository(Liquidacion).save({ reserva, estado: 'PENDIENTE_PAGO_PROPIETARIO', moneda: 'ARS' });
  const estado = async () => (await source.getRepository(Liquidacion).findOneByOrFail({ reserva: { id: reserva.id } })).estado;

  const primero = await reclamos.crear({ id_reserva: reserva.id, categoria: 'LIMPIEZA', descripcion: 'Primer problema de la estadía' }, 1);
  assert.equal(await estado(), 'EN_REVISION');
  await reclamos.resolver(primero.id, { resolucion: ResolucionReclamo.SIN_DEVOLUCION }, 3);
  assert.equal(await estado(), 'PENDIENTE_PAGO_PROPIETARIO');

  // Mientras el pago espera su fecha, el inquilino todavía puede reclamar otra vez: la liquidación vuelve a congelarse.
  const segundo = await reclamos.crear({ id_reserva: reserva.id, categoria: 'MANTENIMIENTO', descripcion: 'Segundo problema de la estadía' }, 1);
  assert.equal(await estado(), 'EN_REVISION');
  await assert.rejects(reclamos.crear({ id_reserva: reserva.id, categoria: 'OTRO', descripcion: 'Tercer problema al mismo tiempo' }, 1), /ya tiene un reclamo abierto/);
  await reclamos.resolver(segundo.id, { resolucion: ResolucionReclamo.SIN_DEVOLUCION }, 3);
  assert.equal(await estado(), 'PENDIENTE_PAGO_PROPIETARIO');
});

test('el motivo de la resolución queda en el reclamo y lo ven el inquilino y el anunciante', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-22T15:00:00Z') });
  const { reserva } = await escenario();
  await source.getRepository(Reserva).update(reserva.id, { codigo_validado_en: new Date('2099-01-10T15:00:00Z') });
  await source.getRepository(Liquidacion).save({ reserva, estado: 'PENDIENTE_PAGO_PROPIETARIO', moneda: 'ARS' });

  const primero = await reclamos.crear({ id_reserva: reserva.id, categoria: 'LIMPIEZA', descripcion: 'La casa estaba sucia' }, 1);
  const sinDevolucion = await reclamos.resolver(primero.id, { resolucion: ResolucionReclamo.SIN_DEVOLUCION, observacion: '  Las fotos muestran la casa limpia  ' }, 3);
  assert.equal(sinDevolucion.motivo_resolucion, 'Las fotos muestran la casa limpia');

  const segundo = await reclamos.crear({ id_reserva: reserva.id, categoria: 'MANTENIMIENTO', descripcion: 'No había agua caliente' }, 1);
  const conDevolucion = await reclamos.resolver(segundo.id, { resolucion: ResolucionReclamo.DEVOLUCION_PARCIAL, importe: 10, observacion: 'El calefón no funcionó dos días' }, 3);
  assert.equal(conDevolucion.motivo_resolucion, 'El calefón no funcionó dos días');
  for (const idParte of [1, 2]) {
    assert.equal((await reclamos.obtener(segundo.id, idParte, false)).motivo_resolucion, 'El calefón no funcionó dos días');
  }
});

test('la migración del motivo lo toma del reembolso, ignora los textos por defecto y se puede repetir', async () => {
  const { PGlite } = require('@electric-sql/pglite');
  const migracion = readFileSync(path.join(__dirname, '../migrations/20261124-motivo-resolucion-reclamo.sql'), 'utf8');
  const anterior = new PGlite();
  try {
    await anterior.exec(`CREATE TABLE reclamo_reserva (id_reclamo integer PRIMARY KEY, resolucion varchar(40));
      CREATE TABLE reembolso (id_reembolso integer PRIMARY KEY, referencia_interna varchar(80), motivo varchar(500) NOT NULL);
      INSERT INTO reclamo_reserva VALUES (1, 'DEVOLUCION_TOTAL'), (2, 'DEVOLUCION_PARCIAL'), (3, 'SIN_DEVOLUCION'), (4, NULL);
      INSERT INTO reembolso VALUES (1, 'rec:1', 'Reclamo #1: Faltaba el agua caliente'),
        (2, 'rec:2', 'Reclamo #2: resolución favorable al inquilino'), (3, 'rec:4', 'Reclamo #4: Todavía abierto');`);
    await anterior.exec(migracion);
    const motivos = async () => (await anterior.query('SELECT id_reclamo, motivo_resolucion FROM reclamo_reserva ORDER BY 1')).rows
      .map(({ id_reclamo, motivo_resolucion }) => [id_reclamo, motivo_resolucion]);
    assert.deepEqual(await motivos(), [[1, 'Faltaba el agua caliente'], [2, null], [3, null], [4, null]]);
    // Repetirla no pisa un motivo ya guardado.
    await anterior.exec("UPDATE reclamo_reserva SET motivo_resolucion = 'Motivo cargado al resolver' WHERE id_reclamo = 1");
    await anterior.exec(migracion);
    assert.deepEqual(await motivos(), [[1, 'Motivo cargado al resolver'], [2, null], [3, null], [4, null]]);
  } finally {
    await anterior.close();
  }
});

test('la migración marca como de Administración los mensajes de quien no es parte de la reserva y se puede repetir', async () => {
  const { PGlite } = require('@electric-sql/pglite');
  const migracion = readFileSync(path.join(__dirname, '../migrations/20261125-mensajes-reclamo-administracion.sql'), 'utf8');
  const anterior = new PGlite();
  try {
    await anterior.exec(`CREATE TABLE reclamo_reserva (id_reclamo integer PRIMARY KEY, id_inquilino integer NOT NULL, id_anunciante integer);
      CREATE TABLE reclamo_mensaje (id_mensaje_reclamo integer PRIMARY KEY, id_reclamo integer NOT NULL, id_autor integer NOT NULL);
      INSERT INTO reclamo_reserva VALUES (1, 1, 2), (2, 3, NULL);
      INSERT INTO reclamo_mensaje VALUES (1, 1, 1), (2, 1, 2), (3, 1, 3), (4, 2, 3), (5, 2, 4);`);
    await anterior.exec(migracion);
    const marcados = async () => (await anterior.query('SELECT id_mensaje_reclamo, como_administracion FROM reclamo_mensaje ORDER BY 1')).rows
      .map(({ id_mensaje_reclamo, como_administracion }) => [id_mensaje_reclamo, como_administracion]);
    // Las partes conservan su rol aunque su cuenta sea de administrador; quien no es parte escribió desde Administración.
    assert.deepEqual(await marcados(), [[1, false], [2, false], [3, true], [4, false], [5, true]]);
    // Repetirla no desmarca un mensaje que una parte escribió después desde Administración.
    await anterior.exec('UPDATE reclamo_mensaje SET como_administracion = true WHERE id_mensaje_reclamo = 4');
    await anterior.exec(migracion);
    assert.deepEqual(await marcados(), [[1, false], [2, false], [3, true], [4, true], [5, true]]);
  } finally {
    await anterior.close();
  }
});

test('la migración retira las notas internas y su catálogo, conserva los demás mensajes y se puede repetir', async () => {
  const { PGlite } = require('@electric-sql/pglite');
  const migracion = readFileSync(path.join(__dirname, '../migrations/20261126-retirar-notas-internas-reclamo.sql'), 'utf8');
  const anterior = new PGlite();
  try {
    await anterior.exec(`CREATE TYPE reclamo_mensaje_visibilidad_enum AS ENUM ('TODOS', 'ADMIN');
      CREATE TABLE ambito (codigo varchar(40) PRIMARY KEY, nombre varchar(80));
      CREATE TABLE estado (codigo_ambito varchar(40) REFERENCES ambito (codigo), codigo varchar(40), nombre varchar(80), PRIMARY KEY (codigo_ambito, codigo));
      INSERT INTO ambito VALUES ('RECLAMO_VISIBILIDAD', 'RECLAMO VISIBILIDAD'), ('RECLAMO', 'RECLAMO');
      INSERT INTO estado VALUES ('RECLAMO_VISIBILIDAD', 'TODOS', 'TODOS'), ('RECLAMO_VISIBILIDAD', 'ADMIN', 'ADMIN'), ('RECLAMO', 'ABIERTO', 'ABIERTO');
      CREATE TABLE reclamo_mensaje (id_mensaje_reclamo integer PRIMARY KEY, texto varchar(1000), visible_para varchar(40) NOT NULL DEFAULT 'TODOS',
        ambito_visible_para varchar(40) GENERATED ALWAYS AS ('RECLAMO_VISIBILIDAD') STORED,
        CONSTRAINT fk_reclamo_mensaje_visible_para_catalogo FOREIGN KEY (ambito_visible_para, visible_para) REFERENCES estado (codigo_ambito, codigo));
      INSERT INTO reclamo_mensaje (id_mensaje_reclamo, texto, visible_para) VALUES (1, 'Mensaje para todos', 'TODOS'), (2, 'Nota privada', 'ADMIN');`);
    const filas = async (consulta) => (await anterior.query(consulta)).rows.map((fila) => Object.values(fila)[0]);
    const estado = async () => ({
      mensajes: await filas('SELECT texto FROM reclamo_mensaje ORDER BY id_mensaje_reclamo'),
      columnas: await filas("SELECT column_name FROM information_schema.columns WHERE table_name = 'reclamo_mensaje' ORDER BY ordinal_position"),
      catalogo: await filas("SELECT codigo_ambito || '/' || codigo FROM estado ORDER BY 1"),
      ambitos: await filas('SELECT codigo FROM ambito ORDER BY 1'),
      tipos: await filas("SELECT typname FROM pg_type WHERE typname = 'reclamo_mensaje_visibilidad_enum'"),
    });
    const esperado = { mensajes: ['Mensaje para todos'], columnas: ['id_mensaje_reclamo', 'texto'], catalogo: ['RECLAMO/ABIERTO'], ambitos: ['RECLAMO'], tipos: [] };
    await anterior.exec(migracion);
    assert.deepEqual(await estado(), esperado);
    await anterior.exec(migracion);
    assert.deepEqual(await estado(), esperado);
  } finally {
    await anterior.close();
  }
});

test('la migración repara los nombres de archivo leídos como latin1, conserva los bien guardados y se puede repetir', async () => {
  const { PGlite } = require('@electric-sql/pglite');
  const migracion = readFileSync(path.join(__dirname, '../migrations/20261124-nombres-archivos-utf8.sql'), 'utf8');
  // Así quedaban: los bytes UTF-8 del nombre leídos uno por uno como latin1.
  const roto = nombre => Buffer.from(nombre, 'utf8').toString('latin1');
  const anterior = new PGlite();
  try {
    await anterior.exec(`CREATE TABLE reembolso (id_reembolso integer PRIMARY KEY, comprobante_nombre varchar(255));
      CREATE TABLE reclamo_evidencia (id_evidencia integer PRIMARY KEY, nombre_archivo varchar(255) NOT NULL);
      CREATE TABLE liquidacion (id_liquidacion integer PRIMARY KEY, pagos_anunciante jsonb);`);
    await anterior.query('INSERT INTO reembolso VALUES (1, $1), (2, $2), (3, NULL)', [roto('DEPA — Reparto de tareas.pdf'), 'Seña ya bien guardada.pdf']);
    await anterior.query('INSERT INTO reclamo_evidencia VALUES (1, $1), (2, $2)', [roto('Baño sin agua.png'), 'Recibo — correcto.png']);
    await anterior.query('INSERT INTO liquidacion VALUES (1, $1), (2, NULL), (3, $2)', [
      JSON.stringify([{ importe: 10, comprobanteNombre: roto('Señal — banco.pdf') }, { importe: 5, comprobanteNombre: null }, { importe: 1 }]),
      JSON.stringify([]),
    ]);
    const nombres = async () => [
      ...(await anterior.query('SELECT comprobante_nombre AS n FROM reembolso ORDER BY id_reembolso')).rows.map(fila => fila.n),
      ...(await anterior.query('SELECT nombre_archivo AS n FROM reclamo_evidencia ORDER BY id_evidencia')).rows.map(fila => fila.n),
      ...(await anterior.query('SELECT pagos_anunciante AS n FROM liquidacion ORDER BY id_liquidacion')).rows.map(fila => fila.n),
    ];
    const esperado = [
      'DEPA — Reparto de tareas.pdf', 'Seña ya bien guardada.pdf', null,
      'Baño sin agua.png', 'Recibo — correcto.png',
      [{ importe: 10, comprobanteNombre: 'Señal — banco.pdf' }, { importe: 5, comprobanteNombre: null }, { importe: 1 }], null, [],
    ];
    await anterior.exec(migracion);
    assert.deepEqual(await nombres(), esperado);
    await anterior.exec(migracion);
    assert.deepEqual(await nombres(), esperado);
  } finally {
    await anterior.close();
  }
});

function operacionesLiquidacion() {
  const liquidaciones = new LiquidacionesService(new LiquidacionRepository(source.getRepository(Liquidacion)), catalogosDePrueba());
  const { almacenamiento } = almacenamientoDePrueba();
  return new OperacionesLiquidacionService(reembolsos, reservas, liquidaciones, catalogosDePrueba(), { buscarCbuValidado: async () => 'cbu-validado' }, reclamos, undefined, almacenamiento);
}

const filaLiquidacion = async (operaciones, idReserva) =>
  (await operaciones.listarLiquidacionesAdministracion()).find(fila => fila.id === idReserva);

/** Reserva con el ingreso validado y una devolución parcial de 40 sobre 100 por reclamo, ya aprobada. */
async function devolucionParcialPorReclamo(t) {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-22T15:00:00Z') });
  const { reserva } = await escenario();
  await source.getRepository(Reserva).update(reserva.id, { codigo_validado_en: new Date('2099-01-10T15:00:00Z'), porcentaje_comision_depa: 10 });
  await source.getRepository(Liquidacion).save({ reserva, estado: 'PENDIENTE_PAGO_PROPIETARIO', moneda: 'ARS' });
  const reclamo = await reclamos.crear({ id_reserva: reserva.id, categoria: 'LIMPIEZA', descripcion: 'La casa estaba sucia' }, 1);
  await reclamos.resolver(reclamo.id, { resolucion: ResolucionReclamo.DEVOLUCION_PARCIAL, importe: 40, observacion: 'Faltó la limpieza' }, 3);
  return reserva;
}

test('después de devolverle una parte al inquilino por reclamo, el resto se liquida al anunciante', async (t) => {
  const reserva = await devolucionParcialPorReclamo(t);
  const operaciones = operacionesLiquidacion();
  const fila = await filaLiquidacion(operaciones, reserva.id);
  // Con devolución no se cobra comisión (regla vigente); el pago espera la fecha habitual.
  assert.deepEqual(
    [fila.estado_liquidacion, fila.importe_a_liquidar, fila.moneda_liquidacion, fila.importe_comision_depa, fila.importe_neto_anunciante, fila.habilitada_para_pago],
    ['DEVUELTO_PARCIAL_INQUILINO', 60, 'ARS', 0, 60, false]);
  await assert.rejects(operaciones.registrarPagoAnunciante(reserva.id, {}, comprobantePdf(), 3), /se habilita el 25\/01\/2099/);

  t.mock.timers.setTime(new Date('2099-01-26T15:00:00Z').getTime());
  assert.equal((await filaLiquidacion(operaciones, reserva.id)).habilitada_para_pago, true);
  await operaciones.registrarPagoAnunciante(reserva.id, { referencia: 'trf-anunciante' }, comprobantePdf(), 3);
  const liquidacion = await liquidacionDe(reserva);
  assert.deepEqual([liquidacion.estado, Number(liquidacion.importe)], ['PAGADO_PROPIETARIO', 60]);
  assert.equal(await filaLiquidacion(operaciones, reserva.id), undefined);
  await assert.rejects(operaciones.registrarPagoAnunciante(reserva.id, {}, comprobantePdf(), 3), /ya fue resuelta/);
});

const desglosePorReserva = async listado => Object.fromEntries((await listado).map(pago => [pago.reservaId, pago.desglose]));

test('el historial desglosa lo que pagó el inquilino, lo devuelto y lo pagado al anunciante', async (t) => {
  const reserva = await devolucionParcialPorReclamo(t);
  const operaciones = operacionesLiquidacion();
  t.mock.timers.setTime(new Date('2099-01-26T15:00:00Z').getTime());
  await operaciones.registrarPagoAnunciante(reserva.id, { referencia: 'trf-resto' }, comprobantePdf(), 3);
  // Con devolución no hay comisión: lo devuelto y lo pagado suman lo que pagó el inquilino.
  const esperado = { [reserva.id]: { pagoInquilino: 100, devueltoInquilino: 40, comisionDepa: 0, porcentajeComision: null, pagadoAnunciante: 60 } };
  assert.deepEqual(await desglosePorReserva(operaciones.listarPagosRegistrados()), esperado);
  assert.deepEqual(await desglosePorReserva(operaciones.listarPagosDelAnunciante(2)), esperado);
});

test('la comisión del desglose es lo que quedó entre lo cobrado y lo transferido; sin cobro no hay desglose', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-26T15:00:00Z') });
  const { reserva } = await escenario();
  await source.getRepository(Reserva).update(reserva.id, { codigo_validado_en: new Date('2099-01-10T15:00:00Z'), porcentaje_comision_depa: 10 });
  await source.getRepository(Liquidacion).save({ reserva, estado: 'PENDIENTE_PAGO_PROPIETARIO', moneda: 'ARS' });
  // Una liquidación anterior al registro de cobros no tiene de dónde sacar el desglose.
  const historica = await source.getRepository(Reserva).save({ monto_pago: 100, estado_pago: 'APROBADO', usuario: { id: 1 }, publicacion: { id: 1 } });
  await source.getRepository(Liquidacion).save({ reserva: historica, estado: 'PAGADO_PROPIETARIO', importe: 100, moneda: 'ARS', fecha_pago_propietario: new Date() });
  const operaciones = operacionesLiquidacion();
  await operaciones.registrarPagoAnunciante(reserva.id, { referencia: 'trf-comision' }, comprobantePdf(), 3);
  assert.deepEqual(await desglosePorReserva(operaciones.listarPagosRegistrados()), {
    [reserva.id]: { pagoInquilino: 100, devueltoInquilino: 0, comisionDepa: 10, porcentajeComision: 10, pagadoAnunciante: 90 },
    [historica.id]: null,
  });
});

test('devolverle al inquilino lo que quedaba exige motivo y deriva el resto a Reembolsos', async (t) => {
  const reserva = await devolucionParcialPorReclamo(t);
  const operaciones = operacionesLiquidacion();
  await assert.rejects(operaciones.resolverLiquidacion(reserva.id, { estado: 'DEVUELTO_INQUILINO' }, 3), /motivo/);
  await assert.rejects(operaciones.resolverLiquidacion(reserva.id, { estado: 'DEVUELTO_INQUILINO', observacion: '   ' }, 3), /motivo/);

  await operaciones.resolverLiquidacion(reserva.id, { estado: 'DEVUELTO_INQUILINO', observacion: 'El anunciante no respondió' }, 3);
  const ajuste = (await reembolsos.listarPorReserva(reserva.id)).find(item => item.origen === OrigenReembolso.AJUSTE_ADMIN);
  assert.deepEqual([Number(ajuste.importe), ajuste.estado, ajuste.motivo], [60, 'PENDIENTE', 'El anunciante no respondió']);
  // Mientras esa devolución está en curso, la reserva sale de Liquidaciones pendientes.
  assert.equal(await filaLiquidacion(operaciones, reserva.id), undefined);
});

test('en una cancelación sin devolución, lo retenido se puede liquidar inmediatamente', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-09T15:00:00Z') });
  const { reserva } = await escenario('2099-01-10');
  const operaciones = operacionesLiquidacion();
  // Un día antes del ingreso corresponde el 0 %: se cancela sin devolución.
  assert.equal((await confirmarCancelacion(reserva, 1)).estado, 'APROBADA');
  assert.deepEqual(await reembolsos.listarPorReserva(reserva.id), []);
  const fila = await filaLiquidacion(operaciones, reserva.id);
  assert.deepEqual([fila.cancelada, fila.estado_liquidacion, fila.importe_a_liquidar, fila.habilitada_para_pago],
    [true, 'PENDIENTE_PAGO_PROPIETARIO', 100, true]);
  assert.equal(fila.fecha_disponible_pago, '2099-01-09');
  const liquidaciones = new LiquidacionesService(new LiquidacionRepository(source.getRepository(Liquidacion)), catalogosDePrueba());
  assert.ok((await liquidaciones.listarReservasPendientesDeAviso(new Date())).includes(reserva.id));
  // Una cancelada no vuelve a esperar el ingreso.
  await assert.rejects(operaciones.resolverLiquidacion(reserva.id, { estado: 'RETENIDO' }, 3), /circuito de ingreso/);

  await operaciones.registrarPagoAnunciante(reserva.id, { referencia: 'trf-retenido' }, comprobantePdf(), 3);
  const liquidacion = await liquidacionDe(reserva);
  assert.deepEqual([liquidacion.estado, Number(liquidacion.importe)], ['PAGADO_PROPIETARIO', 100]);
});

test('una cancelada que quedó en revisión se puede cerrar para pagarle al anunciante', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-09T15:00:00Z') });
  const { reserva } = await escenario('2099-01-10');
  const operaciones = operacionesLiquidacion();
  await confirmarCancelacion(reserva, 1);
  // Así quedaban las cancelaciones sin devolución antes de este cambio.
  await source.query("UPDATE liquidacion SET estado = 'EN_REVISION' WHERE id_reserva = $1", [reserva.id]);
  t.mock.timers.setTime(new Date('2099-01-26T15:00:00Z').getTime());
  assert.equal((await filaLiquidacion(operaciones, reserva.id)).habilitada_para_pago, false);
  await assert.rejects(operaciones.registrarPagoAnunciante(reserva.id, {}, comprobantePdf(), 3), /todavía no está pendiente/);
  await assert.rejects(operaciones.resolverLiquidacion(reserva.id, { estado: 'RETENIDO' }, 3), /circuito de ingreso/);

  const reabierta = await operaciones.resolverLiquidacion(reserva.id, { estado: 'PENDIENTE_PAGO_PROPIETARIO', observacion: 'Revisión cerrada' }, 3);
  assert.equal(reabierta.estado_liquidacion, 'PENDIENTE_PAGO_PROPIETARIO');
  assert.equal((await filaLiquidacion(operaciones, reserva.id)).habilitada_para_pago, true);
  await operaciones.registrarPagoAnunciante(reserva.id, { referencia: 'trf-revisada' }, comprobantePdf(), 3);
  assert.equal((await liquidacionDe(reserva)).estado, 'PAGADO_PROPIETARIO');
});

test('en una cancelación con devolución parcial, lo que no se devolvió se le liquida al anunciante', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-05T15:00:00Z') });
  const { reserva } = await escenario('2099-01-07');
  const operaciones = operacionesLiquidacion();
  await confirmarCancelacion(reserva, 1);
  assert.equal(await filaLiquidacion(operaciones, reserva.id), undefined);
  await assert.rejects(operaciones.registrarPagoAnunciante(reserva.id, {}, comprobantePdf(), 3), /revisión|pendiente|devolución/i);
  // La devolución de la cancelación se procesa sola: con dinero en cuenta la hace Mercado Pago.
  const [reembolso] = await reembolsos.listarCancelacionesAutomaticasPendientes(0);
  pasarela.consultarPago = async () => ({ id: 'mp-1', status: 'approved', payment_type_id: 'account_money' });
  assert.equal((await reembolsos.ejecutarCancelacionAutomatica(reembolso.id)).estado, 'APROBADO');
  await operacionesReembolso.aplicarReembolsoConfirmado(reembolso.id);
  const devuelto = Number((await reembolsos.buscar(reembolso.id)).importe);
  assert.ok(devuelto > 0 && devuelto < 100, `devolución parcial: ${devuelto}`);

  const fila = await filaLiquidacion(operaciones, reserva.id);
  assert.deepEqual([fila.cancelada, fila.estado_liquidacion, fila.importe_a_liquidar, fila.habilitada_para_pago],
    [true, 'DEVUELTO_PARCIAL_INQUILINO', 100 - devuelto, true]);
  assert.equal(fila.fecha_disponible_pago, '2099-01-05');
  await operaciones.registrarPagoAnunciante(reserva.id, { referencia: 'trf-resto' }, comprobantePdf(), 3);
  const liquidacion = await liquidacionDe(reserva);
  assert.deepEqual([liquidacion.estado, Number(liquidacion.importe)], ['PAGADO_PROPIETARIO', 100 - devuelto]);
});

test('el reporte anterior respeta el plazo y la identidad del inquilino', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-24T15:00:00Z') });
  const { reserva } = await escenario();
  await source.getRepository(Liquidacion).save({ reserva, estado: 'RETENIDO', moneda: 'ARS' });
  await assert.rejects(reservas.reportarProblema(reserva.id, 'Problema', 2), /Solo el inquilino/);
  t.mock.timers.setTime(new Date('2099-01-25T03:00:00Z').getTime());
  await assert.rejects(reservas.reportarProblema(reserva.id, 'Problema', 1), /plazo de reclamos/);
  assert.equal((await source.getRepository(Liquidacion).findOneByOrFail({ reserva: { id: reserva.id } })).estado, 'RETENIDO');
});

test('una estadía sin código vence y permite registrar el pago sin marcar el ingreso como validado', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-25T03:00:00Z') });
  const { reserva } = await escenario();
  await source.getRepository(Liquidacion).save({ reserva, estado: 'RETENIDO', moneda: 'ARS' });
  const liquidaciones = new LiquidacionesService(new LiquidacionRepository(source.getRepository(Liquidacion)), catalogosDePrueba());
  const { almacenamiento, archivos } = almacenamientoDePrueba();
  const operaciones = new OperacionesLiquidacionService(reembolsos, reservas, liquidaciones, catalogosDePrueba(), { buscarCbuValidado: async () => 'cbu-validado' }, reclamos, undefined, almacenamiento);
  await operaciones.avisarLiquidacionesDisponibles(new Date());
  assert.equal((await reservas.obtenerReserva(reserva.id)).estado_liquidacion, 'PENDIENTE_PAGO_PROPIETARIO');
  // El endpoint genérico ya no registra pagos; hace falta el comprobante.
  await assert.rejects(operaciones.resolverLiquidacion(reserva.id, { estado: 'PAGADO_PROPIETARIO' }, 3), { status: 400 });
  await assert.rejects(operaciones.registrarPagoAnunciante(reserva.id, {}, undefined, 3), /Adjuntá el comprobante/);
  await operaciones.registrarPagoAnunciante(reserva.id, { referencia: 'pago-prueba', observacion: 'Banco Nación' }, comprobantePdf('pago.pdf'), 3);
  const actual = await reservas.obtenerReserva(reserva.id);
  assert.equal(actual.estado_liquidacion, 'PAGADO_PROPIETARIO');
  assert.equal(actual.codigo_validado_en, null);
  assert.equal(reservas.prepararRespuesta(actual).estado_estadia, 'INGRESO_NO_VERIFICADO');
  const liquidacion = await source.getRepository(Liquidacion).findOneByOrFail({ reserva: { id: reserva.id } });
  assert.equal(Number(liquidacion.importe), 100);
  assert.equal(liquidacion.referencia, 'pago-prueba');
  // Las relaciones de otros módulos (reclamos, reembolsos) no traen los pagos ni la URL privada.
  assert.equal(liquidacion.pagos_anunciante, undefined);
  const [pago] = await operaciones.listarPagosDelAnunciante(2);
  assert.deepEqual({ indice: pago.indice, comprobante: pago.comprobante, referencia: pago.referencia, observacion: pago.observacion },
    { indice: 0, comprobante: 'pago.pdf', referencia: 'pago-prueba', observacion: 'Banco Nación' });
  assert.equal(JSON.stringify(await operaciones.listarPagosRegistrados()).includes('privado.example'), false);
  // El comprobante lo ven el admin y el anunciante; el inquilino y terceros, no.
  assert.match((await operaciones.urlComprobantePago(reserva.id, 0, { id: 3, rol: 'Administrador' })).url, /comprobantes\/liquidaciones\/\d+\/.+\.pdf\?firmado$/);
  assert.match((await operaciones.urlComprobantePago(reserva.id, 0, { id: 2 })).url, /\?firmado$/);
  for (const actor of [{ id: 1 }, { id: 4 }])
    await assert.rejects(operaciones.urlComprobantePago(reserva.id, 0, actor), { status: 404 });
  await assert.rejects(operaciones.urlComprobantePago(reserva.id, 1, { id: 3, rol: 'Administrador' }), { status: 404 });
  // Un segundo registro se rechaza antes de subir otro archivo.
  await assert.rejects(operaciones.registrarPagoAnunciante(reserva.id, {}, comprobantePdf(), 3), { status: 409 });
  assert.equal(archivos.subidos.length, 1);
  assert.deepEqual(archivos.borrados, []);
});

test('si el pago no queda registrado, el comprobante subido se borra', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-25T03:00:00Z') });
  const { reserva } = await escenario();
  await source.getRepository(Liquidacion).save({ reserva, estado: 'PENDIENTE_PAGO_PROPIETARIO', moneda: 'ARS' });
  const liquidaciones = new LiquidacionesService(new LiquidacionRepository(source.getRepository(Liquidacion)), catalogosDePrueba());
  const { almacenamiento, archivos } = almacenamientoDePrueba();
  // Sin CBU validado el registro falla dentro de la transacción, después de subir el archivo.
  const operaciones = new OperacionesLiquidacionService(reembolsos, reservas, liquidaciones, catalogosDePrueba(), { buscarCbuValidado: async () => null }, reclamos, undefined, almacenamiento);
  await assert.rejects(operaciones.registrarPagoAnunciante(reserva.id, {}, comprobantePdf(), 3), /CBU validado/);
  assert.equal(archivos.subidos.length, 1);
  assert.deepEqual(archivos.borrados, [`https://privado.example/${archivos.subidos[0]}`]);
  assert.equal((await reservas.obtenerReserva(reserva.id)).estado_liquidacion, 'PENDIENTE_PAGO_PROPIETARIO');
});

test('un reclamo en una estadía con ingreso validado bloquea el pago hasta resolverse y vencer el plazo', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-15T15:00:00Z') });
  const { reserva } = await escenario();
  await source.getRepository(Reserva).update(reserva.id, { codigo_alojamiento: '12345678', codigo_generado_en: new Date() });
  await source.getRepository(Liquidacion).save({ reserva, estado: 'RETENIDO', moneda: 'ARS' });
  await reservas.validarCodigoAlojamiento(reserva.id, '12345678', 2);
  const reclamo = await reclamos.crear({ id_reserva: reserva.id, categoria: 'OTRO', descripcion: 'Problema de la estadía' }, 1);
  const liquidaciones = new LiquidacionesService(new LiquidacionRepository(source.getRepository(Liquidacion)), catalogosDePrueba());
  const operaciones = new OperacionesLiquidacionService(reembolsos, reservas, liquidaciones, catalogosDePrueba(), { buscarCbuValidado: async () => 'cbu-validado' }, reclamos, undefined, almacenamientoDePrueba().almacenamiento);
  await assert.rejects(operaciones.registrarPagoAnunciante(reserva.id, {}, comprobantePdf(), 3), /pendiente|revisión/i);
  await reclamos.resolver(reclamo.id, { resolucion: ResolucionReclamo.SIN_DEVOLUCION }, 3);
  await assert.rejects(operaciones.registrarPagoAnunciante(reserva.id, {}, comprobantePdf(), 3), /cinco días/i);
  t.mock.timers.setTime(new Date('2099-01-25T03:00:00Z').getTime());
  await operaciones.registrarPagoAnunciante(reserva.id, { referencia: 'transferencia' }, comprobantePdf(), 3);
  assert.equal((await reservas.obtenerReserva(reserva.id)).estado_liquidacion, 'PAGADO_PROPIETARIO');
});

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
  const { reembolso } = await cancelarConDevolucion(reserva, 1);
  assert.equal(Number(reembolso.importe), 100);
  assert.equal((await source.getRepository(Reserva).findOneByOrFail({ id: reserva.id })).cancelada, false);
  await conciliarDevoluciones();
  const actual = await reservas.obtenerReserva(reserva.id);
  assert.equal(actual.cancelada, true);
  assert.equal(actual.estado_pago, 'REEMBOLSADO');
});

const fechaEnDias = dias => require('../dist/common/utils/fechas').fechaArgentina(new Date(Date.now() + dias * 86400000));
const solicitudActual = id => source.getRepository(SolicitudCancelacion).findOneByOrFail({ id });

for (const caso of [
  { nombre: 'total sobre el pago aunque la reserva tenga un monto menor', dias: 7, actor: 1, reserva: 100, pago: 375.35, porcentaje: 100, esperado: 375.35 },
  { nombre: 'total sobre el pago aunque la reserva tenga un monto mayor', dias: 7, actor: 1, reserva: 1000, pago: 75.35, porcentaje: 100, esperado: 75.35 },
  { nombre: 'parcial sobre el pago registrado', dias: 2, actor: 1, reserva: 100, pago: 75.35, porcentaje: 50, esperado: 37.68 },
  { nombre: 'parcial con redondeo exacto de medio centavo', dias: 2, actor: 1, reserva: 75.35, pago: 75.35, porcentaje: 50, esperado: 37.68 },
  { nombre: 'parcial en el importe máximo admitido', dias: 2, actor: 1, reserva: 99999999.99, pago: 99999999.99, porcentaje: 50, esperado: 50000000 },
  { nombre: 'del anunciante por todo lo efectivamente pagado', dias: 1, actor: 2, reserva: 100, pago: 375.35, porcentaje: 100, esperado: 375.35 },
]) {
  test(`devolución ${caso.nombre}`, async () => {
    const { reserva, pago } = await escenario(fechaEnDias(caso.dias));
    await source.getRepository(Reserva).update(reserva.id, { monto_pago: caso.reserva });
    await source.getRepository(Pago).update(pago.id, { amount: caso.pago });
    const condiciones = await cancelaciones.consultarCondiciones(reserva.id, caso.actor);
    assert.equal(condiciones.devolucion.porcentaje, caso.porcentaje);
    assert.equal(condiciones.devolucion.importe, caso.esperado);
    assert.equal(condiciones.devolucion.moneda, 'ARS');
    const { reembolso } = await cancelarConDevolucion(reserva, caso.actor);
    assert.equal(Number(reembolso.importe), caso.esperado);
    assert.equal(reembolso.moneda, 'ARS');
    const guardado = await source.getRepository(Reembolso).findOneByOrFail({ id: reembolso.id });
    assert.equal(Number(guardado.importe), condiciones.devolucion.importe);
    pasarela.reembolsar = async (idPago, importe, _clave, total) => {
      assert.equal(idPago, pago.payment_id);
      assert.equal(importe, caso.esperado);
      assert.equal(total, caso.esperado === caso.pago);
      return { id: 'devolucion-t41', status: 'approved', amount: importe };
    };
    await conciliarDevoluciones();
    assert.equal(Number((await source.getRepository(Pago).findOneByOrFail({ id: pago.id })).amount_refunded), caso.esperado);
  });
}

test('una publicación en dólares se devuelve en la moneda y el importe del pago, sin otra conversión', async () => {
  const { reserva, pago } = await escenario();
  await source.getRepository(Reserva).update(reserva.id, {
    monto_pago: 50, importe_origen: 50, moneda_origen: 'USD', importe_contratado: 60000, moneda_contratada: 'ARS',
  });
  await source.getRepository(Pago).update(pago.id, { amount: 60000, currency: 'ARS' });
  const condiciones = await cancelaciones.consultarCondiciones(reserva.id, 1);
  assert.deepEqual([condiciones.devolucion.importe, condiciones.devolucion.moneda], [60000, 'ARS']);
  const { reembolso } = await cancelarConDevolucion(reserva, 1);
  assert.equal(Number(reembolso.importe), 60000);
  assert.equal(reembolso.moneda, 'ARS');
});

test('no confirma una devolución que exceda el saldo disponible ni deja una solicitud o devolución duplicada', async () => {
  const { reserva, pago, crearReembolso } = await escenario();
  await source.getRepository(Pago).update(pago.id, { amount: 75.35 });
  await crearReembolso({ origen: OrigenReembolso.AJUSTE_ADMIN, tipo: TipoReembolso.PARCIAL, importe: 40 });
  await assert.rejects(confirmarCancelacion(reserva, 1), /saldo reembolsable/);
  assert.equal(await source.getRepository(SolicitudCancelacion).count(), 0);
  assert.equal(await source.getRepository(Reembolso).count(), 1);
  assert.equal(Number((await source.getRepository(Pago).findOneByOrFail({ id: pago.id })).amount_refunded), 0);
});

for (const caso of [
  { fecha: '2099-01-03', actor: 1, porcentaje: 100, importe: 75.35, moneda: 'ARS' },
  { fecha: '2099-01-08', actor: 1, porcentaje: 50, importe: 37.68, moneda: 'ARS' },
  { fecha: '2099-01-09', actor: 1, porcentaje: 0, importe: 0, moneda: 'ARS' },
  { fecha: '2099-01-09', actor: 2, porcentaje: 100, importe: 75.35, moneda: 'USD' },
]) {
  test(`la cancelación devuelve ${caso.porcentaje} % (${caso.moneda}) según la fecha y el autor`, async (t) => {
    t.mock.timers.enable({ apis: ['Date'], now: new Date(`${caso.fecha}T15:00:00Z`) });
    const { reserva, pago } = await escenario();
    await source.getRepository(Pago).update(pago.id, { amount: 75.35, currency: caso.moneda });
    const { devolucion } = await cancelaciones.consultarCondiciones(reserva.id, caso.actor);
    assert.deepEqual([devolucion.fechaSolicitud, devolucion.porcentaje, devolucion.importe, devolucion.moneda],
      [caso.fecha, caso.porcentaje, caso.importe, caso.moneda]);
    const { solicitud, reembolso } = await cancelarConDevolucion(reserva, caso.actor);
    assert.equal(solicitud.estado, 'APROBADA');
    if (caso.porcentaje === 0) assert.equal(reembolso, null);
    else assert.deepEqual([Number(reembolso.importe), reembolso.moneda], [caso.importe, caso.moneda]);
  });
}

test('sin pago registrado no confirma la cancelación ni reemplaza su importe por cero', async () => {
  const { reserva, pago } = await escenario();
  await source.getRepository(Pago).delete(pago.id);
  const condiciones = await cancelaciones.consultarCondiciones(reserva.id, 1);
  assert.equal(condiciones.devolucion, null);
  assert.match(condiciones.motivoBloqueo, /no tiene un pago registrado/);
  await assert.rejects(cancelaciones.solicitar(reserva.id, { motivo: 'Cambio de planes', aceptaTerminos: true, importeAceptado: 0, monedaAceptada: 'ARS' }, 1), /no tiene un pago registrado/);
  assert.equal(await source.getRepository(SolicitudCancelacion).count(), 0);
  assert.equal(await source.getRepository(Reembolso).count(), 0);
  assert.equal((await reservas.obtenerReserva(reserva.id)).cancelada, false);
});

for (const [fechaSolicitud, fechaAprobacion, porcentaje, dias] of [
  ['2099-01-04T01:00:00Z', '2099-01-05T15:00:00Z', 100, 7],
  ['2099-01-04T03:00:00Z', '2099-01-09T15:00:00Z', 50, 6],
  ['2099-01-08T15:00:00Z', '2099-01-09T15:00:00Z', 50, 2],
]) {
  test(`la devolución conserva el ${porcentaje} % de la cancelación confirmada ${dias} días antes`, async (t) => {
    t.mock.timers.enable({ apis: ['Date'], now: new Date(fechaSolicitud) });
    const { reserva } = await escenario();
    const condiciones = await cancelaciones.consultarCondiciones(reserva.id, 1);
    assert.deepEqual(condiciones.devolucion, {
      fechaSolicitud: fechaSolicitud === '2099-01-04T01:00:00Z' ? '2099-01-03' : fechaSolicitud.slice(0, 10),
      diasAnticipacion: dias, porcentaje, importe: porcentaje, moneda: 'ARS',
    });
    const { solicitud, reembolso } = await cancelarConDevolucion(reserva, 1);
    assert.equal(solicitud.creada_en.toISOString(), fechaSolicitud.replace('Z', '.000Z'));
    assert.equal(Number(reembolso.importe), condiciones.devolucion.importe);
    assert.equal(reembolso.tipo, porcentaje === 100 ? 'TOTAL' : 'PARCIAL');
    // Mientras la devolución sigue en gestión, la consulta posterior conserva el cálculo del día de la cancelación.
    t.mock.timers.setTime(new Date(fechaAprobacion).getTime());
    const enCurso = await cancelaciones.consultarCondiciones(reserva.id, 1);
    assert.deepEqual(enCurso.devolucion, condiciones.devolucion);
  });
}

test('la vista previa usa el actor solicitante y redondea el importe en la moneda del pago', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-08T15:00:00Z') });
  const { reserva, pago } = await escenario();
  await source.getRepository(Reserva).update(reserva.id, { monto_pago: 100.01 });
  await source.getRepository(Pago).update(pago.id, { amount: 100.01 });
  const inquilino = await cancelaciones.consultarCondiciones(reserva.id, 1);
  assert.equal(inquilino.devolucion.importe, 50.01);
  const anunciante = await cancelaciones.consultarCondiciones(reserva.id, 2);
  assert.equal(anunciante.devolucion.porcentaje, 100);
  const { solicitud, reembolso } = await cancelarConDevolucion(reserva, 1);
  assert.equal(Number(reembolso.importe), 50.01);
  const consultaDelAnunciante = await cancelaciones.consultarCondiciones(reserva.id, 2);
  assert.equal(consultaDelAnunciante.solicitud.id, solicitud.id);
  assert.deepEqual(consultaDelAnunciante.devolucion, inquilino.devolucion);
});

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
  assert.equal(condiciones.advertencia, null);
  const dto = await validar({ motivo, aceptaTerminos: true, importeAceptado: 50, monedaAceptada: 'ARS' });
  assert.equal((await cancelaciones.solicitar(reserva.id, dto, 1)).estado, 'APROBADA');
});

test('el inquilino puede solicitar el día anterior con advertencia y sin devolución', async () => {
  const { reserva } = await escenario(fechaEnDias(1));
  const dto = { motivo: 'Cambio de planes', aceptaTerminos: true };
  const condiciones = await cancelaciones.consultarCondiciones(reserva.id, 1);
  assert.equal(condiciones.politica.diasDevolucionParcial, 2);
  assert.equal(condiciones.motivoBloqueo, null);
  assert.match(condiciones.advertencia, /no recibirás devolución.*0 %/);
  assert.equal(condiciones.devolucion.importe, 0);
  assert.equal(condiciones.devolucion.porcentaje, 0);
  const solicitud = await confirmarCancelacion(reserva, 1);
  assert.equal(solicitud.estado, 'APROBADA');
  assert.equal(solicitud.reserva.cancelada, true);
  assert.equal(await source.getRepository(Reembolso).count(), 0);
  const actual = await reservas.obtenerReserva(reserva.id);
  assert.equal(actual.cancelada, true);
  assert.equal(actual.estado_pago, 'APROBADO');
  // Sin devolución, lo retenido es del anunciante.
  assert.equal(actual.estado_liquidacion, 'PENDIENTE_PAGO_PROPIETARIO');
});

test('desde la medianoche argentina del ingreso se bloquea al inquilino aunque no validó el código', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-10T02:59:59Z') });
  const { reserva } = await escenario();
  const antes = await cancelaciones.consultarCondiciones(reserva.id, 1);
  assert.equal(antes.motivoBloqueo, null);
  assert.equal(antes.devolucion.diasAnticipacion, 1);
  assert.equal(antes.devolucion.porcentaje, 0);
  t.mock.timers.setTime(new Date('2099-01-10T03:00:00Z').getTime());
  const desdeIngreso = await cancelaciones.consultarCondiciones(reserva.id, 1);
  assert.match(desdeIngreso.motivoBloqueo, /Desde la fecha de ingreso/);
  assert.equal(desdeIngreso.advertencia, null);
  assert.equal(desdeIngreso.devolucion, null);
  await assert.rejects(confirmarCancelacion(reserva, 1), { status: 400 });
  assert.equal(await source.getRepository(SolicitudCancelacion).count(), 0);
});

for (const dias of [7, 1]) {
  test(`el anunciante solicita ${dias} días antes y recibe el 100 % al confirmarse la devolución`, async () => {
    const { reserva } = await escenario(fechaEnDias(dias));
    const condiciones = await cancelaciones.consultarCondiciones(reserva.id, 2);
    assert.equal(condiciones.motivoBloqueo, null);
    assert.equal(condiciones.devolucion.porcentaje, 100);
    let liberaciones = 0;
    disponibilidad.liberarReserva = async () => { liberaciones += 1; };
    const { reembolso } = await cancelarConDevolucion(reserva, 2, 'Problema en la propiedad');
    assert.equal(reembolso.tipo, 'TOTAL');
    assert.equal(Number(reembolso.importe), 100);
    assert.equal((await reservas.obtenerReserva(reserva.id)).cancelada, false);
    assert.equal(liberaciones, 0);
    await conciliarDevoluciones();
    assert.equal((await reservas.obtenerReserva(reserva.id)).cancelada, true);
    assert.equal(liberaciones, 1);
  });
}

for (const dias of [0, -1, -10]) {
  test(`el anunciante no puede solicitar desde el ingreso (${dias} días) aunque no se haya validado el código`, async () => {
    const { reserva } = await escenario(fechaEnDias(dias));
    if (dias === -10) await source.getRepository(Reserva).update(reserva.id, { fecha_fin: fechaEnDias(-1) });
    const condiciones = await cancelaciones.consultarCondiciones(reserva.id, 2);
    assert.match(condiciones.motivoBloqueo, /fecha de ingreso/);
    assert.equal(condiciones.devolucion, null);
    await assert.rejects(cancelaciones.solicitar(reserva.id, { motivo: 'Problema en la propiedad', aceptaTerminos: true }, 2), { status: 400 });
    assert.equal(await source.getRepository(SolicitudCancelacion).count(), 0);
    assert.equal(await source.getRepository(Reembolso).count(), 0);
  });
}

test('una cancelación del anunciante aprobada antes del ingreso impide validar el código mientras se gestiona la devolución', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-09T15:00:00Z') });
  const { reserva } = await escenario();
  await source.getRepository(Reserva).update(reserva.id, { codigo_alojamiento: '12345678', codigo_generado_en: new Date() });
  await cancelarConDevolucion(reserva, 2, 'Problema en la propiedad');
  t.mock.timers.setTime(new Date('2099-01-10T15:00:00Z').getTime());
  await assert.rejects(reservas.validarCodigoAlojamiento(reserva.id, '12345678', 2), /cancelación aprobada/);
  assert.equal((await reservas.obtenerReserva(reserva.id)).codigo_validado_en, null);
});

test('si falla el calendario al confirmar tarde una devolución aprobada antes del ingreso, se reintenta sin duplicarla', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-09T15:00:00Z') });
  const { reserva } = await escenario();
  const { reembolso } = await cancelarConDevolucion(reserva, 2, 'Problema en la propiedad');
  t.mock.timers.setTime(new Date('2099-01-11T15:00:00Z').getTime());
  let movimientos = 0;
  pasarela.reembolsar = async () => { movimientos += 1; return { id: 'devolucion-anunciante', status: 'approved', amount: 100 }; };
  disponibilidad.liberarReserva = async () => { throw new Error('Fallo de calendario'); };
  pasarela.consultarPago = async (id) => ({ id, status: 'approved', payment_type_id: 'account_money' });
  await reembolsos.ejecutarCancelacionAutomatica(reembolso.id);
  await assert.rejects(operacionesReembolso.aplicarReembolsoConfirmado(reembolso.id), /Fallo de calendario/);
  assert.equal((await reservas.obtenerReserva(reserva.id)).cancelada, false);
  assert.equal((await reembolsos.buscar(reembolso.id)).aplicado_en, null);
  disponibilidad.liberarReserva = async () => {};
  const aplicado = await operacionesReembolso.aplicarReembolsoConfirmado(reembolso.id);
  assert.equal(aplicado.reserva.cancelada, true);
  assert.ok(aplicado.reembolso.aplicado_en);
  assert.equal(movimientos, 1);
});

for (const medio of [null]) {
  test(`deriva a transferencia el reembolso por cancelación con medio ${medio}`, async () => {
    const { reserva, pago } = await escenario(fechaEnDias(7));
    await source.getRepository(Pago).update(pago.id, { payment_method_id: medio });
    const condicionesPago = await cancelaciones.consultarCondiciones(reserva.id, 1);
    assert.equal(condicionesPago.motivoBloqueo, null);
    assert.equal(condicionesPago.admiteReembolso, true);
    assert.equal(condicionesPago.devolucionPorTransferencia, true);
    const { reembolso } = await cancelarConDevolucion(reserva, 1);
    // Sin un medio que admita devolución automática, la conciliación la deriva a transferencia.
    pasarela.consultarPago = async (id) => ({ id, status: 'approved' });
    await operacionesReembolso.conciliar();
    const derivado = await reembolsos.buscar(reembolso.id);
    assert.equal(derivado.transferencia_manual, true);
    assert.equal(derivado.estado, 'PENDIENTE');
    assert.equal(await source.getRepository(Reembolso).count(), 1);
  });
}

// Las tarjetas se simulan o pasan a transferencia: lo prueban las cancelaciones automáticas del comienzo.
for (const medio of ['account_money']) {
  for (const parcial of [false, true]) {
    test(`${medio} devuelve ${parcial ? '37,68 parcialmente' : '100 en total'} por la API de Mercado Pago, una sola vez`, async () => {
      const { reserva, pago } = await escenario(fechaEnDias(parcial ? 2 : 7));
      await source.getRepository(Pago).update(pago.id, { payment_method_id: medio, amount: parcial ? 75.35 : 100 });
      const condiciones = await cancelaciones.consultarCondiciones(reserva.id, 1);
      assert.equal(condiciones.devolucionPorTransferencia, false);
      const importeEsperado = parcial ? 37.68 : 100;
      assert.equal(condiciones.devolucion.importe, importeEsperado);
      const { solicitud, reembolso } = await cancelarConDevolucion(reserva, 1);
      assert.equal(reembolso.transferencia_manual, false);
      assert.equal(reembolso.estado, 'PENDIENTE');
      await assert.rejects(operacionesReembolso.registrarTransferencia(reembolso.id, { referencia: 'no-corresponde' }, comprobantePdf(), 3), /no está habilitado para transferencia/);
      const llamadas = [];
      pasarela.reembolsar = async (...args) => {
        llamadas.push(args);
        return { id: 'devolucion-simulada', status: 'approved', amount: importeEsperado, payment_id: pago.payment_id };
      };
      await conciliarDevoluciones();
      await conciliarDevoluciones();
      assert.deepEqual(llamadas, [[pago.payment_id, importeEsperado, `auto-can:${solicitud.id}`, !parcial]]);
      const aplicado = await reembolsos.buscar(reembolso.id);
      assert.equal(aplicado.estado, 'APROBADO');
      assert.ok(aplicado.aplicado_en);
      assert.equal((await reservas.obtenerReserva(reserva.id)).cancelada, true);
      assert.equal(Number((await source.getRepository(Pago).findOneByOrFail({ id: pago.id })).amount_refunded), importeEsperado);
      assert.equal(await source.getRepository(Reembolso).count(), 1);
    });
  }
}

test('un rechazo definitivo con tarjeta habilita la transferencia sin crear otra devolución', async () => {
  const { reserva, pago, crearReembolso } = await escenario();
  await source.getRepository(Pago).update(pago.id, { payment_method_id: 'visa' });
  const reembolso = await crearReembolso();
  let intentos = 0;
  pasarela.reembolsar = async () => { intentos += 1; return { status: 'rejected' }; };
  const rechazado = await operacionesReembolso.ejecutar(reembolso.id, 3);
  assert.equal(rechazado.reembolso.transferencia_manual, true);
  assert.equal(rechazado.reembolso.estado, 'PENDIENTE');
  assert.equal(Number((await source.getRepository(Pago).findOneByOrFail({ id: pago.id })).amount_refunded), 0);
  assert.equal((await reembolsos.conversar(reembolso.id, { id: 1 }, 0)).abierta, true);
  await operacionesReembolso.registrarTransferencia(reembolso.id, { referencia: 'comprobante-tarjeta' }, comprobantePdf(), 3);
  await assert.rejects(operacionesReembolso.registrarTransferencia(reembolso.id, { referencia: 'comprobante-tarjeta' }, comprobantePdf(), 3), { status: 409 });
  assert.equal(intentos, 1);
  assert.equal(await source.getRepository(Reembolso).count(), 1);
  assert.equal((await reservas.obtenerReserva(reserva.id)).cancelada, true);
});

test('un timeout con tarjeta conserva la vía automática y reintenta con la misma clave', async () => {
  const { pago, crearReembolso } = await escenario();
  await source.getRepository(Pago).update(pago.id, { payment_method_id: 'master' });
  const reembolso = await crearReembolso();
  const claves = [];
  pasarela.reembolsar = async (_id, importe, clave) => {
    claves.push(clave);
    if (claves.length === 1) throw new Error('timeout simulado');
    return { id: 'tarjeta-reintento', status: 'approved', amount: importe, payment_id: pago.payment_id };
  };
  await assert.rejects(operacionesReembolso.ejecutar(reembolso.id, 3), /timeout simulado/);
  const incierto = await reembolsos.buscar(reembolso.id);
  assert.equal(incierto.estado, 'FALLIDO');
  assert.equal(incierto.transferencia_manual, false);
  await assert.rejects(operacionesReembolso.registrarTransferencia(reembolso.id, { referencia: 'no-duplicar' }, comprobantePdf(), 3), /no está habilitado para transferencia/);
  await source.getRepository(Reembolso).update(reembolso.id, { conciliar_en: new Date(Date.now() - 1000) });
  await operacionesReembolso.ejecutar(reembolso.id, 3);
  assert.deepEqual(claves, [reembolso.idempotency_key, reembolso.idempotency_key]);
  assert.equal(Number((await source.getRepository(Pago).findOneByOrFail({ id: pago.id })).amount_refunded), 100);
});

test('una respuesta simulada con otro importe no confirma la devolución de la tarjeta', async () => {
  const { pago, crearReembolso } = await escenario();
  await source.getRepository(Pago).update(pago.id, { payment_method_id: 'visa' });
  const reembolso = await crearReembolso();
  pasarela.reembolsar = async () => ({ id: 'importe-incorrecto', status: 'approved', amount: 99, payment_id: pago.payment_id });
  await assert.rejects(operacionesReembolso.ejecutar(reembolso.id, 3), /no coincide con la solicitud/);
  assert.equal((await reembolsos.buscar(reembolso.id)).estado, 'FALLIDO');
  assert.equal(Number((await source.getRepository(Pago).findOneByOrFail({ id: pago.id })).amount_refunded), 0);
});

test('el complemento del reclamo de una tarjeta devuelve solo el faltante por la API', async () => {
  const { reserva, pago } = await cancelacionConFaltante();
  await source.getRepository(Pago).update(pago.id, { payment_method_id: 'visa' });
  const reclamo = await reclamos.reclamarFaltanteCancelacion(reserva.id, { descripcion: descripcionFaltante }, 1);
  const importes = [];
  pasarela.reembolsar = async (_id, importe) => { importes.push(importe); return { id: 'complemento-tarjeta', status: 'approved', amount: importe }; };
  await reclamos.resolver(reclamo.id, { resolucion: 'DEVOLUCION_TOTAL' }, 3);
  assert.deepEqual(importes, [20]);
  assert.equal(Number((await source.getRepository(Pago).findOneByOrFail({ id: pago.id })).amount_refunded), 50);
  assert.equal((await reclamos.consultarFaltanteCancelacion(reserva.id, 1)).devolucion.faltante, 0);
});

test('la devolución de una cancelación queda identificada por su solicitud', async () => {
  const { reserva } = await escenario();
  const { solicitud, reembolso } = await cancelarConDevolucion(reserva, 1);
  assert.equal(reembolso.idempotency_key, `auto-can:${solicitud.id}`);
  assert.equal(reembolso.origen, OrigenReembolso.CANCELACION);
  const guardada = await solicitudActual(solicitud.id);
  assert.deepEqual([guardada.estado, guardada.motivo, guardada.decidida_en?.toISOString()], ['APROBADA', 'Cambio de planes', guardada.creada_en.toISOString()]);
});

test('un reintento recupera la solicitud aprobada mientras su devolución está activa', async () => {
  const { reserva } = await escenario();
  const { solicitud, reembolso } = await cancelarConDevolucion(reserva, 1);
  const activa = await cancelaciones.consultarActiva(reserva.id, 1);
  assert.equal(activa.id, solicitud.id);
  assert.equal(activa.estado, 'APROBADA');
  assert.equal((await confirmarCancelacion(reserva, 1)).id, solicitud.id);
  assert.equal(await source.getRepository(SolicitudCancelacion).count(), 1);

  await reembolsos.rechazar(reembolso.id, 'Devolución rechazada', 3);
  assert.equal(await cancelaciones.consultarActiva(reserva.id, 1), null);
  assert.notEqual((await confirmarCancelacion(reserva, 1)).id, solicitud.id);
});

test('no confirma la cancelación si otro flujo ya canceló la reserva', async () => {
  for (const fecha of [fechaEnDias(2), '2099-01-10']) {
    const { reserva } = await escenario(fecha);
    const { devolucion } = await cancelaciones.consultarCondiciones(reserva.id, 1);
    await source.getRepository(Reserva).update(reserva.id, { cancelada: true, cancelada_por: 'ADMINISTRADOR' });
    await assert.rejects(cancelaciones.solicitar(reserva.id, { motivo: 'Cambio de planes', aceptaTerminos: true, importeAceptado: devolucion.importe, monedaAceptada: devolucion.moneda }, 1), { status: 409 });
    assert.equal(await source.getRepository(SolicitudCancelacion).count(), 0);
    assert.equal(await source.getRepository(Reembolso).countBy({ reserva: { id: reserva.id } }), 0);
    assert.equal((await source.getRepository(Reserva).findOneByOrFail({ id: reserva.id })).cancelada_por, 'ADMINISTRADOR');
    await db.exec('TRUNCATE reserva RESTART IDENTITY CASCADE');
  }
});

test('el alta bloquea la reserva antes de buscar solicitudes en curso', async () => {
  const { reserva } = await escenario();
  const { devolucion } = await cancelaciones.consultarCondiciones(reserva.id, 1);
  const consultas = [];
  const original = db.query;
  db.query = (sql, parametros) => { consultas.push(sql); return original.call(db, sql, parametros); };
  try {
    await cancelaciones.solicitar(reserva.id, { motivo: 'Cambio de planes', aceptaTerminos: true, importeAceptado: devolucion.importe, monedaAceptada: devolucion.moneda }, 1);
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
      const { reembolso } = await cancelarConDevolucion(reserva, 1);
      assert.equal(Number(reembolso.importe), esperado);
      await db.exec('TRUNCATE reserva RESTART IDENTITY CASCADE');
    }
  } finally {
    await db.exec("DELETE FROM politica_cancelacion WHERE vigente_desde = '2026-11-13'");
  }
});

test('si falla la liberación de fechas se revierte la cancelación y se puede reintentar', async () => {
  const { reserva } = await escenario(fechaEnDias(1));
  disponibilidad.liberarReserva = async () => { throw new Error('fallo simulado del calendario'); };
  await assert.rejects(confirmarCancelacion(reserva, 1), /fallo simulado del calendario/);
  assert.equal(await source.getRepository(SolicitudCancelacion).count(), 0);
  const sinCambios = await reservas.obtenerReserva(reserva.id);
  assert.equal(sinCambios.cancelada, false);
  assert.equal(sinCambios.estado_liquidacion, 'NO_APLICA');
  assert.equal(await source.getRepository(Liquidacion).countBy({ reserva: { id: reserva.id } }), 0);

  let liberadas = 0;
  disponibilidad.liberarReserva = async (idReserva) => { assert.equal(idReserva, reserva.id); liberadas += 1; };
  const { solicitud, reembolso } = await cancelarConDevolucion(reserva, 1);
  assert.equal(reembolso, null);
  assert.equal(liberadas, 1);
  assert.equal((await solicitudActual(solicitud.id)).estado, 'APROBADA');
  const cancelada = await source.getRepository(Reserva).findOneByOrFail({ id: reserva.id });
  assert.equal(cancelada.cancelada, true);
  assert.equal(cancelada.cancelada_por, 'INQUILINO');
  const liquidacion = await source.getRepository(Liquidacion).findOneByOrFail({ reserva: { id: reserva.id } });
  assert.equal(liquidacion.estado, 'PENDIENTE_PAGO_PROPIETARIO');
});

test('si falla la confirmación no queda una solicitud ni una devolución a medias', async (t) => {
  const { reserva } = await escenario();
  const crearSolicitud = reembolsos.crearSolicitud.bind(reembolsos);
  const fallo = t.mock.method(reembolsos, 'crearSolicitud', async (...args) => {
    await crearSolicitud(...args);
    throw new Error('fallo simulado al confirmar');
  });
  await assert.rejects(confirmarCancelacion(reserva, 1), /fallo simulado al confirmar/);
  assert.equal(await source.getRepository(Reembolso).count(), 0);
  assert.equal(await source.getRepository(SolicitudCancelacion).count(), 0);
  fallo.mock.restore();
  const { reembolso } = await cancelarConDevolucion(reserva, 1);
  assert.equal(Number(reembolso.importe), 100);
  assert.equal(await source.getRepository(Reembolso).count(), 1);
});

test('las partes y el admin ven los mismos mensajes del reclamo, y cada mensaje avisa a los demás', async () => {
  const avisos = [];
  reclamos.notificaciones = { avisarCambio: async (...args) => avisos.push(args) };
  const { reserva } = await escenario();
  const reclamo = await source.getRepository(Reclamo).save({
    reserva, inquilino: { id: 1 }, anunciante: { id: 2 }, categoria: 'OTRO', descripcion: 'Reclamo de prueba',
  });
  await source.getRepository(ReclamoMensaje).save({ reclamo, autor: { id: 3 }, texto: 'Mensaje anterior', como_administracion: true });
  await reclamos.enviarMensaje(reclamo.id, { texto: 'Respuesta pública' }, 3, true);
  assert.equal((await reclamos.obtener(reclamo.id, 1, false)).mensajes.length, 2);
  assert.equal((await reclamos.listarMios(2))[0].mensajes.length, 2);
  assert.equal((await reclamos.obtener(reclamo.id, 3, true)).mensajes.length, 2);
  await assert.rejects(reclamos.obtener(reclamo.id, 4, false), /No formás parte/);
  assert.equal(avisos.length, 1);
  assert.deepEqual(avisos[0][1], ['inquilino', 'anunciante']);
  assert.doesNotMatch(avisos[0][3], /Respuesta pública/);
});

test('un admin que es parte de la reserva escribe con su rol desde su chat y como Admin desde Administración', async () => {
  const avisos = [];
  reclamos.notificaciones = { avisarCambio: async (...args) => avisos.push(args) };
  const { reserva } = await escenario();
  // El usuario 3 es administrador y, en este reclamo, también el inquilino.
  const reclamo = await source.getRepository(Reclamo).save({
    reserva, inquilino: { id: 3 }, anunciante: { id: 2 }, categoria: 'OTRO', descripcion: 'Reclamo de prueba',
  });
  const estado = async () => (await source.getRepository(Reclamo).findOneBy({ id: reclamo.id })).estado;
  const comoParte = await reclamos.enviarMensaje(reclamo.id, { texto: 'Escribo como inquilino' }, 3, false);
  // Desde su chat no interviene la administración: el reclamo sigue abierto y se avisa también al admin.
  assert.deepEqual([comoParte.como_administracion, await estado(), avisos[0][1]], [false, 'ABIERTO', ['inquilino', 'anunciante', 'admin']]);
  const comoAdmin = await reclamos.enviarMensaje(reclamo.id, { texto: 'Respondo desde Administración' }, 3, true);
  assert.deepEqual([comoAdmin.como_administracion, await estado()], [true, 'EN_REVISION']);
  assert.deepEqual((await reclamos.obtener(reclamo.id, 2, false)).mensajes.map(({ texto, como_administracion }) => [texto, como_administracion]), [
    ['Escribo como inquilino', false], ['Respondo desde Administración', true],
  ]);
  // Un admin que no es parte no puede usar el chat de las partes.
  await assert.rejects(reclamos.enviarMensaje(reclamo.id, { texto: 'Hola' }, 4, false), /No formás parte/);
});

/** Servicio de reclamos con almacenamiento de prueba, para subir imágenes. */
function reclamosConImagenes() {
  const { almacenamiento, archivos } = almacenamientoDePrueba();
  const servicio = new ReclamosService(
    new ReclamosRepository(source.getRepository(Reclamo), source.getRepository(ReclamoEvidencia), source.getRepository(ReclamoMensaje)),
    reservas, reembolsos, almacenamiento, catalogosDePrueba(), cancelaciones, { avisarCambio: async () => {} }, preparacionImagenes,
  );
  return { servicio, archivos, almacenamiento };
}

async function reclamoDePrueba() {
  const { reserva } = await escenario();
  return source.getRepository(Reclamo).save({
    reserva, inquilino: { id: 1 }, anunciante: { id: 2 }, categoria: 'OTRO', descripcion: 'Reclamo de prueba',
  });
}

test('las imágenes de un mensaje quedan en ese mensaje, con su autor y sin datos de más', async () => {
  const { servicio, archivos } = reclamosConImagenes();
  const reclamo = await reclamoDePrueba();
  const enviado = await servicio.enviarMensaje(reclamo.id, {}, 1, false, [await imagenPng('living.png'), await imagenPng('baño.png')]);
  assert.equal(enviado.texto, '');
  assert.equal(Object.hasOwn(enviado, 'reclamo'), false);
  assert.deepEqual(enviado.evidencias.map(({ nombre_archivo, id_mensaje }) => [nombre_archivo, id_mensaje]),
    [['living.png', enviado.id], ['baño.png', enviado.id]]);
  assert.equal(archivos.subidos.length, 2);
  for (const imagen of enviado.evidencias) {
    assert.match(imagen.url, /\?firmado$/);
    assert.equal(imagen.autor.id, 1);
    assert.ok(imagen.autor.nombre);
  }

  // Las imágenes que se suben al crear el reclamo quedan con la descripción.
  await servicio.subirEvidencias(reclamo.id, 1, false, [await imagenPng('frente.png')]);
  const visto = JSON.parse(JSON.stringify(await servicio.obtener(reclamo.id, 2, false)));
  assert.deepEqual(visto.evidencias.map((imagen) => [imagen.nombre_archivo, imagen.id_mensaje, imagen.autor.id]), [['frente.png', null, 1]]);
  assert.deepEqual(Object.keys(visto.evidencias[0]).sort(), ['autor', 'creado_en', 'id', 'id_mensaje', 'nombre_archivo', 'url']);
  assert.deepEqual(Object.keys(visto.evidencias[0].autor).sort(), ['apellido', 'id', 'nombre', 'rol']);
  assert.deepEqual(Object.keys(visto.mensajes[0].autor).sort(), ['apellido', 'id', 'nombre', 'rol']);
  assert.equal(visto.mensajes[0].evidencias.length, 2);
  assert.deepEqual((await servicio.listarMensajes(reclamo.id, 1, false))[0].evidencias.map((imagen) => imagen.nombre_archivo), ['living.png', 'baño.png']);
  await assert.rejects(servicio.enviarMensaje(reclamo.id, { texto: '   ' }, 1, false), /Escribí un mensaje o adjuntá/);
});

test('hasta 10 imágenes por envío y 30 por reclamo', async () => {
  const { servicio, archivos } = reclamosConImagenes();
  const reclamo = await reclamoDePrueba();
  const imagen = await imagenPng();
  await assert.rejects(servicio.enviarMensaje(reclamo.id, {}, 1, false, Array(11).fill(imagen)), /hasta 10 imágenes por envío/);
  await source.getRepository(ReclamoEvidencia).save(Array.from({ length: 26 }, (_, i) => ({
    reclamo, url: `https://privado.example/anterior-${i}.jpg`, nombre_archivo: `anterior-${i}.jpg`,
  })));
  await assert.rejects(servicio.enviarMensaje(reclamo.id, {}, 2, false, Array(5).fill(imagen)), /podés adjuntar 4 más/);
  assert.equal(archivos.subidos.length, 0);
  // El admin también puede adjuntar imágenes en un mensaje visible para las partes.
  const delAdmin = await servicio.enviarMensaje(reclamo.id, { texto: 'Adjunto el inventario' }, 3, true, Array(4).fill(imagen));
  assert.equal(delAdmin.evidencias.length, 4);
  await assert.rejects(servicio.subirEvidencias(reclamo.id, 1, false, [imagen]), /ya tiene las 30 imágenes permitidas/);
});

test('si el mensaje no se guarda, no queda a medias y se borran las imágenes subidas', async (t) => {
  const { servicio, archivos } = reclamosConImagenes();
  const reclamo = await reclamoDePrueba();
  t.mock.method(ReclamosRepository.prototype, 'guardarEvidencias', async () => { throw new Error('Fallo simulado al guardar'); });
  await assert.rejects(servicio.enviarMensaje(reclamo.id, { texto: 'Con fotos' }, 1, false, [await imagenPng(), await imagenPng()]), /Fallo simulado/);
  assert.equal(archivos.subidos.length, 2);
  assert.deepEqual([...archivos.borrados].sort(), archivos.subidos.map((nombre) => `https://privado.example/${nombre}`).sort());
  assert.equal(await source.getRepository(ReclamoMensaje).countBy({ reclamo: { id: reclamo.id } }), 0);
});

test('un envío en curso conserva la resolución del reclamo que se decidió mientras se subía la imagen', async () => {
  const { servicio, archivos, almacenamiento } = reclamosConImagenes();
  const reclamo = await reclamoDePrueba();
  const subir = almacenamiento.subir.bind(almacenamiento);
  const { promise: subiendo, resolve: avisar } = Promise.withResolvers();
  const { promise: resuelto, resolve: continuar } = Promise.withResolvers();
  almacenamiento.subir = async (...args) => {
    const url = await subir(...args);
    avisar();
    await resuelto;
    return url;
  };
  const mensaje = servicio.enviarMensaje(reclamo.id, { texto: 'Nota en curso' }, 3, true, [await imagenPng()]);
  await subiendo;
  try {
    await servicio.resolver(reclamo.id, { resolucion: 'SIN_DEVOLUCION' }, 3);
  } finally {
    continuar();
  }
  const enviado = await mensaje;
  assert.equal(enviado.evidencias.length, 1);
  assert.equal(archivos.borrados.length, 0);
  assert.equal((await source.getRepository(Reclamo).findOneByOrFail({ id: reclamo.id })).estado, 'RESUELTO_ANUNCIANTE');
});

test('la migración une imágenes y mensajes, conserva las imágenes existentes y se puede repetir', async () => {
  const { PGlite } = require('@electric-sql/pglite');
  const migracion = readFileSync(path.join(__dirname, '../migrations/20261123-imagenes-mensajes-reclamo.sql'), 'utf8');
  const base = new PGlite();
  try {
    await base.exec(`CREATE TABLE reclamo_mensaje (id_mensaje_reclamo integer PRIMARY KEY);
      CREATE TABLE reclamo_evidencia (id_evidencia integer PRIMARY KEY, nombre_archivo varchar(255) NOT NULL);
      INSERT INTO reclamo_mensaje VALUES (1);
      INSERT INTO reclamo_evidencia VALUES (1, 'anterior.jpg');`);
    await base.exec(migracion);
    await base.exec(migracion);
    assert.deepEqual((await base.query('SELECT nombre_archivo, id_mensaje FROM reclamo_evidencia')).rows, [{ nombre_archivo: 'anterior.jpg', id_mensaje: null }]);
    await base.exec("INSERT INTO reclamo_evidencia VALUES (2, 'del-chat.jpg', 1)");
    await assert.rejects(base.exec("INSERT INTO reclamo_evidencia VALUES (3, 'sin-mensaje.jpg', 99)"), /foreign key/);
    await base.exec('DELETE FROM reclamo_mensaje WHERE id_mensaje_reclamo = 1');
    assert.deepEqual((await base.query('SELECT id_mensaje FROM reclamo_evidencia WHERE id_evidencia = 2')).rows, [{ id_mensaje: null }]);
  } finally {
    await base.close();
  }
});

for (const [dias, porcentaje] of [[7, 100], [2, 50], [1, 0]]) {
  test(`cancelar con ${dias} días de anticipación aplica ${porcentaje}% de devolución`, async () => {
    const { reserva } = await escenario(fechaEnDias(dias));
    const { reembolso } = await cancelarConDevolucion(reserva, 1);
    const listado = await reembolsos.listarAdministracion();
    if (porcentaje > 0) {
      assert.equal(Number(reembolso.importe), porcentaje);
      assert.equal(reembolso.estado, 'PENDIENTE');
      assert.equal(listado.length, 1);
      assert.equal(listado[0].id, reembolso.id);
      assert.equal(listado[0].reserva.id, reserva.id);
    } else {
      assert.equal(reembolso, null);
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

function reclamosConAvisos() {
  const avisos = [];
  const servicio = new ReclamosService(
    new ReclamosRepository(source.getRepository(Reclamo), source.getRepository(ReclamoEvidencia), source.getRepository(ReclamoMensaje)),
    reservas, reembolsos, {}, catalogosDePrueba(), cancelaciones,
    { avisarCambio: async (_reserva, destinos, asunto, mensaje) => { avisos.push({ destinos, asunto, mensaje }); } }, preparacionImagenes,
  );
  return { servicio, avisos };
}

async function reclamoAbierto(reserva) {
  return reclamos.crear({ id_reserva: reserva.id, categoria: 'OTRO', descripcion: 'Problema durante la estadía' }, 1);
}

async function reservaParaReclamo(datos = {}, liquidacion = null) {
  const reserva = await source.getRepository(Reserva).save({
    monto_pago: 100, estado_pago: 'APROBADO', usuario: { id: 1 }, publicacion: { id: 1 },
    fecha_inicio: '2026-01-01', fecha_fin: '2099-01-20', ...datos,
  });
  if (liquidacion) await source.getRepository(Liquidacion).save({ reserva, moneda: 'ARS', ...liquidacion });
  return reserva;
}

const liquidacionDe = reserva => source.getRepository(Liquidacion).findOneByOrFail({ reserva: { id: reserva.id } });

test('se puede reclamar durante la estadía sin código, con el código validado o bloqueado', async () => {
  const sinCodigo = await reservaParaReclamo();
  assert.equal((await reclamoAbierto(sinCodigo)).estado, 'ABIERTO');

  const conCodigo = await reservaParaReclamo({ codigo_validado_en: new Date() }, { estado: 'PENDIENTE_PAGO_PROPIETARIO' });
  assert.equal((await reclamoAbierto(conCodigo)).estado, 'ABIERTO');
  assert.equal((await liquidacionDe(conCodigo)).estado, 'EN_REVISION');

  const bloqueado = await reservaParaReclamo({ intentos_codigo: 5 }, {
    estado: 'EN_REVISION', observacion: 'Código bloqueado después de cinco intentos incorrectos',
  });
  const reclamo = await reclamoAbierto(bloqueado);
  assert.equal((await liquidacionDe(bloqueado)).observacion,
    'Código bloqueado después de cinco intentos incorrectos · Reclamo del inquilino en revisión');

  // Resuelto a favor del anunciante, el código vuelve a poder cargarse.
  await reclamos.resolver(reclamo.id, { resolucion: ResolucionReclamo.SIN_DEVOLUCION }, 3);
  const actual = await reservas.obtenerReserva(bloqueado.id);
  assert.equal(actual.intentos_codigo, 0);
  assert.equal(actual.estado_liquidacion, 'RETENIDO');
});

test('el reclamo respeta el período de la estadía hasta el día anterior al pago', async (t) => {
  const reserva = await reservaParaReclamo({ fecha_inicio: '2099-01-10', fecha_fin: '2099-01-20' });
  const vencida = await reservaParaReclamo({ fecha_inicio: '2099-01-10', fecha_fin: '2099-01-20' });
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-09T15:00:00Z') });
  await assert.rejects(reclamoAbierto(reserva), (error) => {
    assert.equal(error.getStatus(), 400);
    assert.match(error.message, /Podés reclamar desde el 10\/01\/2099/);
    return true;
  });
  // Fin 20/01: se puede reclamar hasta el 24/01; el pago se habilita el 25/01.
  t.mock.timers.setTime(new Date('2099-01-24T15:00:00Z').getTime());
  assert.equal((await reclamoAbierto(reserva)).estado, 'ABIERTO');
  t.mock.timers.setTime(new Date('2099-01-25T15:00:00Z').getTime());
  await assert.rejects(reclamoAbierto(vencida), (error) => {
    assert.equal(error.getStatus(), 400);
    assert.match(error.message, /terminó el 24\/01\/2099, antes de que se habilite el pago/);
    return true;
  });
});

test('no se abre un reclamo sobre una liquidación ya pagada y no se pisa su estado', async () => {
  const reserva = await reservaParaReclamo({ codigo_validado_en: new Date() }, { estado: 'PAGADO_PROPIETARIO' });
  await assert.rejects(reclamoAbierto(reserva), (error) => {
    assert.equal(error.getStatus(), 409);
    assert.match(error.message, /ya fue resuelta/);
    return true;
  });
  assert.equal((await liquidacionDe(reserva)).estado, 'PAGADO_PROPIETARIO');
  assert.equal(await source.getRepository(Reclamo).count(), 0);
});

test('la respuesta de la reserva informa el fin del plazo de reclamos', async () => {
  const reserva = await reservaParaReclamo({ fecha_fin: '2099-01-28' });
  const respuesta = reservas.prepararRespuesta(await reservas.obtenerReserva(reserva.id));
  assert.equal(respuesta.fin_plazo_reclamo, '2099-02-01');
  assert.equal(reservas.finPlazoReclamo({ ...reserva, cancelada: true }), null);
});

test('la devolución total por transferencia deja el reclamo resuelto al decidir y el reembolso pendiente', async () => {
  const { reserva, pago } = await escenario('2026-01-01');
  await source.getRepository(Pago).update(pago.id, { payment_method_id: null });
  const { servicio, avisos } = reclamosConAvisos();
  const reclamo = await reclamoAbierto(reserva);

  const resuelto = await servicio.resolver(reclamo.id, { resolucion: ResolucionReclamo.DEVOLUCION_TOTAL, observacion: 'Corresponde devolver todo' }, 3);
  assert.equal(resuelto.estado, 'RESUELTO_INQUILINO');
  assert.equal(resuelto.resolucion, 'DEVOLUCION_TOTAL');
  assert.equal(Number(resuelto.importe_reembolso), 100);
  const [pendiente] = await reembolsos.listarPorReserva(reserva.id);
  assert.deepEqual([pendiente.tipo, Number(pendiente.importe), pendiente.estado], ['TOTAL', 100, 'PENDIENTE']);
  assert.equal((await reservas.obtenerReserva(reserva.id)).estado_pago, 'APROBADO');
  assert.deepEqual(avisos.map(aviso => aviso.asunto), ['Reclamo resuelto con devolución']);
  assert.match(avisos[0].mensaje, /La devolución está en gestión/);

  const decidido = await source.getRepository(Reclamo).findOneOrFail({ where: { id: reclamo.id }, relations: { administrador_resolucion: true } });
  // Otro administrador registra la transferencia.
  await operacionesReembolso.registrarTransferencia(pendiente.id, { referencia: 'trf-inquilino' }, comprobantePdf(), 4);
  const conComprobante = await source.getRepository(Reembolso).findOneOrFail({
    where: { id: pendiente.id }, select: { id: true, comprobante_url: true, comprobante_nombre: true },
  });
  assert.deepEqual([conComprobante.comprobante_nombre, /comprobantes\/reembolsos\/\d+\/.+\.pdf$/.test(conComprobante.comprobante_url)],
    ['transferencia.pdf', true]);
  assert.match((await reembolsos.urlComprobante(pendiente.id, { id: 1 })).url, /\?firmado$/);
  await assert.rejects(reembolsos.urlComprobante(pendiente.id, { id: 2 }), { status: 404 });
  assert.equal((await reservas.obtenerReserva(reserva.id)).estado_pago, 'REEMBOLSADO');
  const final = await source.getRepository(Reclamo).findOneOrFail({ where: { id: reclamo.id }, relations: { administrador_resolucion: true } });
  assert.deepEqual([final.estado, final.resolucion, Number(final.importe_reembolso)], ['RESUELTO_INQUILINO', 'DEVOLUCION_TOTAL', 100]);
  // La transferencia no pisa quién ni cuándo decidió.
  assert.equal(final.administrador_resolucion.id, 3);
  assert.equal(final.resuelto_en.getTime(), decidido.resuelto_en.getTime());
});

test('la devolución total por Mercado Pago devuelve todo lo pagado y resuelve el reclamo', async () => {
  const { reserva, pago } = await escenario('2026-01-01');
  const reclamo = await reclamoAbierto(reserva);
  const resuelto = await reclamos.resolver(reclamo.id, { resolucion: ResolucionReclamo.DEVOLUCION_TOTAL, observacion: 'Corresponde devolver todo' }, 3);
  assert.deepEqual([resuelto.estado, resuelto.resolucion, Number(resuelto.importe_reembolso)], ['RESUELTO_INQUILINO', 'DEVOLUCION_TOTAL', 100]);
  assert.equal(Number((await source.getRepository(Pago).findOneByOrFail({ id: pago.id })).amount_refunded), 100);
  assert.equal((await reservas.obtenerReserva(reserva.id)).estado_pago, 'REEMBOLSADO');
});

test('sin devolución no genera reembolso aunque llegue un importe', async () => {
  const { reserva } = await escenario('2026-01-01');
  const reclamo = await reclamoAbierto(reserva);
  const resuelto = await reclamos.resolver(reclamo.id, { resolucion: ResolucionReclamo.SIN_DEVOLUCION, importe: 50, observacion: 'No corresponde' }, 3);
  assert.deepEqual([resuelto.estado, resuelto.resolucion, resuelto.importe_reembolso], ['RESUELTO_ANUNCIANTE', 'SIN_DEVOLUCION', null]);
  assert.equal(await source.getRepository(Reembolso).countBy({ reserva: { id: reserva.id } }), 0);
});

test('una devolución parcial por todo el saldo se rechaza y pide elegir la total', async () => {
  const { reserva } = await escenario('2026-01-01');
  const reclamo = await reclamoAbierto(reserva);
  for (const importe of [100, 150])
    await assert.rejects(
      reclamos.resolver(reclamo.id, { resolucion: ResolucionReclamo.DEVOLUCION_PARCIAL, importe, observacion: 'Parcial' }, 3),
      /Para devolver todo elegí "Devolución total"/,
    );
  assert.equal((await source.getRepository(Reclamo).findOneByOrFail({ id: reclamo.id })).estado, 'ABIERTO');
  assert.equal(await source.getRepository(Reembolso).countBy({ reserva: { id: reserva.id } }), 0);
});

test('si Mercado Pago falla, el reclamo queda resuelto y la devolución sigue en Reembolsos', async () => {
  const { reserva } = await escenario('2026-01-01');
  const reclamo = await reclamoAbierto(reserva);
  pasarela.reembolsar = async () => { throw new Error('Mercado Pago no responde'); };
  const resuelto = await reclamos.resolver(reclamo.id, { resolucion: ResolucionReclamo.DEVOLUCION_TOTAL, observacion: 'Corresponde devolver todo' }, 3);
  assert.deepEqual([resuelto.estado, Number(resuelto.importe_reembolso)], ['RESUELTO_INQUILINO', 100]);
  const [fallido] = await reembolsos.listarPorReserva(reserva.id);
  assert.equal(fallido.estado, 'FALLIDO');
  await assert.rejects(
    reclamos.resolver(reclamo.id, { resolucion: ResolucionReclamo.DEVOLUCION_TOTAL, observacion: 'Otra vez' }, 3),
    /ya fue resuelto/,
  );
});

test('un reclamo con la devolución pedida antes de este cambio se completa al confirmar la transferencia', async () => {
  const { reserva, pago } = await escenario('2026-01-01');
  await source.getRepository(Pago).update(pago.id, { payment_method_id: 'visa' });
  const reclamo = await reclamoAbierto(reserva);
  const anterior = await reembolsos.crearSolicitud({
    reserva, pago, tipo: TipoReembolso.PARCIAL, origen: OrigenReembolso.RECLAMO, importe: 30,
    motivo: `Reclamo #${reclamo.id}: decisión previa`, idSolicitadoPor: 3,
    idempotencyKey: `rec:${reclamo.id}`, referenciaInterna: `rec:${reclamo.id}`,
  });
  await source.getRepository(Reembolso).update(anterior.id, { transferencia_manual: true });
  await operacionesReembolso.registrarTransferencia(anterior.id, { referencia: 'trf-previa' }, comprobantePdf(), 3);
  const completo = await source.getRepository(Reclamo).findOneByOrFail({ id: reclamo.id });
  assert.deepEqual([completo.estado, completo.resolucion, Number(completo.importe_reembolso)], ['RESUELTO_INQUILINO', 'DEVOLUCION_PARCIAL', 30]);
  assert.ok(completo.resuelto_en);
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

test('recibir un contracargo no cambia el pago, la reserva ni la liquidación', async () => {
  const { OperacionesPagoService } = require('../dist/operaciones-reserva/service/operaciones-pago.service');
  const { reserva, pago } = await escenario();
  const referencia = 'reserva:' + reserva.id;
  await source.getRepository(Pago).update(pago.id, { external_reference: referencia, payment_id: '123' });
  const pagos = new PagosService(new PagosRepository(source.getRepository(Pago)));
  const pagoAntes = await pagos.buscarPorId(pago.id);
  const reservaAntes = await reservas.obtenerReserva(reserva.id);
  const pasarela = {
    validarWebhook: () => {},
    consultarPago: async () => ({
      id: 123, external_reference: referencia, status: 'charged_back', transaction_amount: 100, currency_id: 'ARS',
      refunds: [{ id: 321, payment_id: 123, amount: 100, status: 'approved' }],
    }),
  };
  const operaciones = new OperacionesPagoService({}, pagos, reservas, reembolsos, {}, pasarela,
    catalogosDePrueba(), operacionesReembolso);
  const entrada = { body: { type: 'payment' }, dataId: '123' };

  assert.deepEqual(await operaciones.procesarWebhook(entrada), { received: true });
  assert.deepEqual(await operaciones.procesarWebhook(entrada), { received: true });
  assert.deepEqual(await pagos.buscarPorId(pago.id), pagoAntes);
  assert.deepEqual(await reservas.obtenerReserva(reserva.id), reservaAntes);
  assert.equal(await source.getRepository(Reembolso).count(), 0);
});

test('los reembolsos históricos de contracargos quedan fuera de la conciliación y la aplicación', async () => {
  const { pago, crearReembolso } = await escenario();
  const pendiente = await crearReembolso();
  await source.query(
    "UPDATE reembolso SET estado = 'FALLIDO', origen = 'CONTRACARGO', conciliar_en = now(), primer_intento_en = now() WHERE id_reembolso = $1",
    [pendiente.id],
  );
  let llamadas = 0;
  pasarela.reembolsar = async () => { llamadas++; };
  await reembolsos.reconciliarPendientes();
  await assert.rejects(reembolsos.ejecutar(pendiente.id, 3), /fuera de la aplicación/);
  assert.equal(llamadas, 0);

  await source.query("UPDATE reembolso SET estado = 'APROBADO' WHERE id_reembolso = $1", [pendiente.id]);
  assert.deepEqual(await reembolsos.listarPendientesAplicacion(0), []);
  await assert.rejects(operacionesReembolso.aplicarReembolsoConfirmado(pendiente.id), /fuera de la aplicación/);
  assert.equal(Number((await source.getRepository(Pago).findOneByOrFail({ id: pago.id })).amount_refunded), 0);
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
  const operaciones = new OperacionesPagoService({}, pagos, reservas, reembolsos, {},
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

async function solicitudSinRespuesta(actor = 1) {
  const { fechaArgentina } = require('../dist/common/utils/fechas');
  const caso = await escenario();
  const solicitud = await solicitudHistorica(caso.reserva.id, { motivo: 'Cambio de planes antes del ingreso', aceptaTerminos: true }, actor);
  const hoy = fechaArgentina();
  await source.getRepository(Reserva).update(caso.reserva.id, { fecha_inicio: hoy, fecha_fin: hoy });
  await source.getRepository(SolicitudCancelacion).update(solicitud.id, { creada_en: new Date(Date.now() - 8 * 86400000) });
  return { ...caso, solicitud };
}
const descripcionDemora = 'La falta de respuesta a la cancelación me generó gastos e inconvenientes que solicito revisar.';

/** Reclamo por demora administrativa creado antes de que las cancelaciones fueran automáticas. */
function reclamoDemoraHistorico(caso) {
  return source.getRepository(Reclamo).save({
    reserva: { id: caso.reserva.id }, inquilino: { id: 1 }, anunciante: { id: 2 }, categoria: 'DEMORA_ADMINISTRATIVA',
    solicitud_cancelacion_id: caso.solicitud.id, descripcion: descripcionDemora, estado: 'ABIERTO',
  });
}

test('demora administrativa: ya no se pueden crear reclamos con esta categoría', async () => {
  const caso = await solicitudSinRespuesta();
  for (const actor of [1, 2]) {
    await assert.rejects(reclamos.crear({ id_reserva: caso.reserva.id, categoria: 'DEMORA_ADMINISTRATIVA', descripcion: descripcionDemora }, actor),
      { status: 400, message: /cancelaciones son automáticas/ });
  }
  assert.equal(await source.getRepository(Reclamo).count(), 0);
  assert.equal((await solicitudActual(caso.solicitud.id)).estado, 'PENDIENTE');
});

test('demora administrativa: un reclamo histórico se cierra sin tocar la reserva ni su liquidación', async () => {
  const caso = await solicitudSinRespuesta();
  const reclamo = await reclamoDemoraHistorico(caso);
  const [listado] = await reclamos.listarMios(1);
  assert.deepEqual([listado.categoria, listado.devolucion_cancelacion], ['DEMORA_ADMINISTRATIVA', undefined]);
  const actual = await reservas.obtenerReserva(caso.reserva.id);
  const resuelto = await reclamos.resolver(reclamo.id, { resolucion: 'SIN_DEVOLUCION', observacion: 'Caso revisado y resuelto por administración' }, 3);
  assert.equal(resuelto.resolucion, 'SIN_DEVOLUCION');
  const despues = await reservas.obtenerReserva(caso.reserva.id);
  assert.deepEqual([despues.cancelada, despues.estado_liquidacion], [false, actual.estado_liquidacion]);
  assert.equal(await source.getRepository(Reembolso).count(), 0);
});

test('demora administrativa: migración repetible retira la estructura vacía y conserva solicitudes y categorías', async () => {
  const caso = await solicitudSinRespuesta();
  await db.exec('ALTER TABLE solicitud_cancelacion ADD COLUMN revision_demora jsonb; CREATE TABLE compensacion_demora(id integer PRIMARY KEY);');
  const antes = await solicitudActual(caso.solicitud.id);
  const sql = migracion('20261123-reclamo-demora-administrativa.sql');
  await db.exec(sql);
  await db.exec(sql);
  assert.equal((await solicitudActual(caso.solicitud.id)).motivo, antes.motivo);
  assert.equal((await db.query("SELECT to_regclass('public.compensacion_demora') AS tabla")).rows[0].tabla, null);
  assert.equal((await db.query("SELECT count(*)::int AS total FROM estado WHERE codigo_ambito='RECLAMO_CATEGORIA' AND codigo='DEMORA_ADMINISTRATIVA'")).rows[0].total, 1);
});

test('demora administrativa: la migración se detiene si existen compensaciones y preserva sus registros', async () => {
  await db.exec('CREATE TABLE compensacion_demora(id integer PRIMARY KEY); INSERT INTO compensacion_demora VALUES(1);');
  try {
    await assert.rejects(db.exec(migracion('20261123-reclamo-demora-administrativa.sql')), /compensaciones registradas/);
    assert.equal((await db.query('SELECT count(*)::int AS total FROM compensacion_demora')).rows[0].total, 1);
  } finally { await db.exec('DROP TABLE compensacion_demora'); }
});

test('integración: un reclamo histórico por demora abierto no impide el pago habitual al anunciante', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-01T15:00:00Z') });
  const caso = await solicitudSinRespuesta();
  await source.getRepository(Liquidacion).save({ reserva: caso.reserva, estado: 'RETENIDO', moneda: 'ARS' });
  await reclamoDemoraHistorico(caso);
  const liquidaciones = new LiquidacionesService(new LiquidacionRepository(source.getRepository(Liquidacion)), catalogosDePrueba());
  const operaciones = new OperacionesLiquidacionService(reembolsos, reservas, liquidaciones, catalogosDePrueba(), { buscarCbuValidado: async () => 'cbu-validado' }, reclamos, undefined, almacenamientoDePrueba().almacenamiento);
  t.mock.timers.setTime(new Date('2099-01-06T15:00:00Z').getTime());
  await operaciones.avisarLiquidacionesDisponibles();
  await operaciones.registrarPagoAnunciante(caso.reserva.id, {}, comprobantePdf(), 3);
  assert.equal((await reservas.obtenerReserva(caso.reserva.id)).estado_liquidacion, 'PAGADO_PROPIETARIO');
  assert.equal((await source.getRepository(Reclamo).findOneByOrFail({ reserva: { id: caso.reserva.id } })).estado, 'ABIERTO');
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
  const { OperacionesLiquidacionService } = require('../dist/operaciones-reserva/service/operaciones-liquidacion.service');
  const { CancelacionesModule } = require('../dist/cancelaciones/cancelaciones.module');
  const { ReclamosModule } = require('../dist/reclamos/reclamos.module');
  const { MercadoPagoAdapter } = require('../dist/mercado-pago/proveedor/mercado-pago.adapter');
  const { Estado } = require('../dist/catalogos/entity/estado.entity');
  const { CLIENTE_CORREO } = require('../dist/mail/proveedor/cliente-correo.interface');
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
  const correos = [];
  let fallaAvisoAnunciante = false;
  const modulo = await Test.createTestingModule({ imports: [
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
    TypeOrmModule.forRoot(source.options), AuthModule, OperacionesReservaModule, CancelacionesModule, ReclamosModule,
  ] })
    .overrideProvider(DataSource).useValue(source)
    .overrideProvider(ConfigService).useValue(config)
    .overrideProvider(CLIENTE_CORREO).useValue({ beginSend: async (mensaje) => {
      if (fallaAvisoAnunciante && mensaje.content.subject === 'Liquidación disponible para pago manual' &&
          mensaje.recipients.to[0].address === 'usuario2@example.invalid') {
        throw new Error('Fallo simulado para el anunciante');
      }
      correos.push(mensaje);
      return { pollUntilDone: async () => ({ status: 'Succeeded' }) };
    } })
    .overrideProvider(PROVEEDOR_DOLAR).useValue({ nombre: 'prueba', consultar: async () => ({ venta: 1200, compra: 1180, actualizadaEn: new Date(), proveedor: 'prueba' }) })
    .overrideProvider(AlmacenamientoService).useValue(almacenamientoDePrueba().almacenamiento)
    .compile();
  const app = modulo.createNestApplication({ logger: false });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  try {
    const estados = source.getRepository(Estado);
    const codigoAmbito = 'RECLAMO';
    await estados.delete({ codigoAmbito, codigo: 'CERRADO' });
    await estados.update({ codigoAmbito, codigo: 'ABIERTO' }, { nombre: 'Abierto en el panel' });
    await base.cargarSeed();
    await app.init();
    assert.equal((await estados.findOneByOrFail({ codigoAmbito, codigo: 'CERRADO' })).nombre, 'Cerrado');
    assert.equal((await estados.findOneByOrFail({ codigoAmbito, codigo: 'ABIERTO' })).nombre, 'Abierto en el panel');
    assert.equal(await estados.countBy({ codigoAmbito }), 5);
    const http = app.getHttpServer();
    const token = id => app.get(JwtService).sign({ sub: id });
    const montoAceptado = { importeAceptado: 100, monedaAceptada: 'ARS' };
    const tenant = `Bearer ${token(1)}`, admin = `Bearer ${token(3)}`, ajeno = `Bearer ${token(4)}`;
    const { reserva, pago } = await escenario();
    cobro.external_reference = `reserva:${reserva.id}`;
    await source.getRepository(Pago).update(pago.id, { external_reference: cobro.external_reference, payment_id: '123', status: 'pending' });
    await source.getRepository(Reserva).update(reserva.id, {
      estado_pago: 'PENDIENTE',
      email_confirmacion_inquilino_enviado: true, email_nueva_reserva_anunciante_enviado: true,
    });
    for (const ruta of ['presupuesto', 'checkout', 'reconciliar']) {
      await request(http).post(`/pagos/${ruta}`).send({}).expect(401);
      await request(http).post(`/pagos/${ruta}`).set('Authorization', tenant).send({}).expect(400);
    }
    // El usuario 4 es administrador en este escenario: para una persona ajena se usa una cuenta de inquilino.
    await source.query(`INSERT INTO usuario (id_usuario,nombre,apellido,email,telefono,contrasenia,email_verificado,id_rol)
      VALUES (5,'Persona','Ajena','usuario5@example.invalid','123','hash',true,1) ON CONFLICT DO NOTHING`);
    const ajena = `Bearer ${token(5)}`;
    for (const ruta of ['estado', 'resumen']) {
      const url = `/pagos/reservas/${reserva.id}/${ruta}`;
      await request(http).get(url).expect(401);
      await request(http).get(url).set('Authorization', ajena).expect(403);
      await request(http).get(url).set('Authorization', tenant).expect(200);
    }
    // El admin ve el resumen de cualquier reserva en solo lectura; el estado sigue siendo solo de las partes.
    await request(http).get(`/pagos/reservas/${reserva.id}/estado`).set('Authorization', admin).expect(403);
    const { body: resumenAdmin } = await request(http).get(`/pagos/reservas/${reserva.id}/resumen`).set('Authorization', admin).expect(200);
    assert.deepEqual([resumenAdmin.reserva.id, resumenAdmin.puede_reintentar], [reserva.id, false]);
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
    cobro.status = 'rejected';
    cobro.status_detail = 'cc_rejected_other_reason';
    await webhook('123', `ts=${ts},v1=${hash}`).expect(201, { received: true });
    await webhook('123', `ts=${ts},v1=${hash}`).expect(201, { received: true });
    assert.equal(correos.filter(({ content }) => content.subject === 'Pago no aprobado').length, 1);
    cobro.status = 'approved';
    cobro.status_detail = 'accredited';
    await webhook('123', `ts=${ts},v1=${hash}`).expect(201, { received: true });
    const primeraConfirmacion = await source.getRepository(Reserva).findOneByOrFail({ id: reserva.id });
    assert.equal(primeraConfirmacion.estado_pago, 'APROBADO');
    assert.ok(primeraConfirmacion.codigo_generado_en);
    await webhook('123', `ts=${ts},v1=${hash}`).expect(201, { received: true });
    assert.deepEqual((await source.getRepository(Reserva).findOneByOrFail({ id: reserva.id })).codigo_generado_en, primeraConfirmacion.codigo_generado_en);
    const reconciliar = (autorizacion) => request(http).post('/pagos/reconciliar')
      .set('Authorization', autorizacion).send({ payment_id: '123' });
    cobro.status = 'charged_back';
    const liquidacionAntes = await reservas.obtenerReserva(reserva.id);
    await webhook('123', `ts=${ts},v1=${hash}`).expect(201, { received: true });
    await reconciliar(ajeno).expect(403);
    await reconciliar(tenant).expect(201, {
      reserva_id: reserva.id, estado_pago: 'APROBADO', mercado_pago_status: 'approved', mercado_pago_status_detail: 'accredited',
    });
    assert.deepEqual(await reservas.obtenerReserva(reserva.id), liquidacionAntes);
    assert.equal(await source.getRepository(Reembolso).count(), 0);
    cobro.status = 'approved';
    assert.equal(await source.getRepository(Pago).count(), 1);
    const anunciante = `Bearer ${token(2)}`;
    await source.getRepository(Reserva).update(reserva.id, { usuario_email: 'privado@example.invalid', usuario_telefono: '555002' });
    for (const url of [`/reservas/${reserva.id}`, `/pagos/reservas/${reserva.id}/resumen`, '/reservas/recibidas']) {
      const { body } = await request(http).get(url).set('Authorization', anunciante).expect(200);
      const vista = body.reserva ?? (Array.isArray(body) ? body[0] : body);
      assert.equal(vista.usuario.id, 1);
      assert.equal(vista.usuario_email, null);
      assert.equal(vista.usuario_telefono, null);
      assert.equal(vista.usuario.email, null);
      assert.equal(vista.usuario.telefono, '');
    }
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
    const avisosIngreso = correos.filter(({ content }) => content.subject === 'Ingreso confirmado');
    assert.equal(avisosIngreso.length, 1);
    assert.match(avisosIngreso[0].content.html, /src="cid:logo-depa"/);
    assert.equal(avisosIngreso[0].content.html.includes(acceso.codigo), false);
    const detalle = await request(http).get(`/reservas/${ingreso.id}`).set('Authorization', tenant).expect(200);
    assert.equal(detalle.body.estado_liquidacion, 'PENDIENTE_PAGO_PROPIETARIO');
    const historialAnunciante = '/reservas/liquidaciones/publicacion/1';
    await request(http).get(historialAnunciante).set('Authorization', anunciante).expect(200, []);
    const consultaCbu = `/reservas/${ingreso.id}/liquidacion/cbu`;
    await request(http).get(consultaCbu).set('Authorization', anunciante).expect(403);
    const cbu = '0010000700000000000017';
    await source.query('UPDATE anunciante SET cbu_validado = $1, cuit_cuil = $2 WHERE id_usuario = 2', [cbu, '20-12345678-3']);
    // El pago se registra por multipart con el comprobante.
    const rutaPago = `${rutaLiquidacion}/pago`;
    const pagar = (datos = {}, archivo = 'banco.pdf', actor = admin) => {
      const pedido = request(http).patch(rutaPago).set('Authorization', actor);
      for (const [campo, valor] of Object.entries(datos)) pedido.field(campo, valor);
      return archivo ? pedido.attach('comprobante', Buffer.from('%PDF-1.7 pago'), { filename: archivo, contentType: 'application/pdf' }) : pedido;
    };
    const operacionesLiquidacion = app.get(OperacionesLiquidacionService);
    // A administración le llega con «[Administración]» delante del asunto.
    const correosDeLiquidacion = () => correos.filter(({ content }) => content.subject.endsWith('Liquidación disponible para pago manual'));
    const configurarFin = async (dias) => {
      const fin = new Date(`${hoy}T00:00:00Z`);
      fin.setUTCDate(fin.getUTCDate() - dias);
      const fecha = fin.toISOString().slice(0, 10);
      await source.getRepository(Reserva).update(ingreso.id, {
        fecha_inicio: fecha, fecha_fin: fecha, codigo_validado_en: fin, finalizada: true,
      });
    };
    await configurarFin(4);
    const listaAntes = await request(http).get('/reservas/liquidaciones/administracion').set('Authorization', admin).expect(200);
    const liquidacionEnEspera = listaAntes.body.find(fila => fila.id === ingreso.id);
    assert.equal(liquidacionEnEspera.estado_liquidacion, 'PENDIENTE_PAGO_PROPIETARIO');
    const fechaHabilitacion = new Date(`${hoy}T00:00:00Z`);
    fechaHabilitacion.setUTCDate(fechaHabilitacion.getUTCDate() + 1);
    assert.equal(liquidacionEnEspera.fecha_disponible_pago, fechaHabilitacion.toISOString().slice(0, 10));
    await request(http).get(consultaCbu).set('Authorization', admin).expect(409);
    await pagar({ referencia: 'pago-anticipado' }).expect(409);
    await operacionesLiquidacion.avisarLiquidacionesDisponibles();
    assert.equal(correosDeLiquidacion().length, 0);

    await configurarFin(5);
    const lista = await request(http).get('/reservas/liquidaciones/administracion').set('Authorization', admin).expect(200);
    assert.equal(lista.body.find(fila => fila.id === ingreso.id).estado_liquidacion, 'PENDIENTE_PAGO_PROPIETARIO');
    fallaAvisoAnunciante = true;
    await operacionesLiquidacion.avisarLiquidacionesDisponibles();
    assert.deepEqual(correosDeLiquidacion().map(aviso => aviso.recipients.to[0].address).sort(), ['usuario3@example.invalid', 'usuario4@example.invalid']);
    const repositorioLiquidaciones = source.getRepository(Liquidacion);
    const primerAviso = await repositorioLiquidaciones.findOneByOrFail({ reserva: { id: ingreso.id } });
    assert.ok(primerAviso.aviso_pago_admin_en);
    assert.equal(primerAviso.aviso_pago_anunciante_en, null);
    fallaAvisoAnunciante = false;
    await Promise.all([
      operacionesLiquidacion.avisarLiquidacionesDisponibles(), operacionesLiquidacion.avisarLiquidacionesDisponibles(),
    ]);
    await operacionesLiquidacion.avisarLiquidacionesDisponibles();
    assert.deepEqual(correosDeLiquidacion().map(aviso => aviso.recipients.to[0].address).sort(), ['usuario2@example.invalid', 'usuario3@example.invalid', 'usuario4@example.invalid']);
    await db.exec(migracion('20261121-avisos-liquidacion-disponible.sql'));
    const avisosEnviados = await repositorioLiquidaciones.findOneByOrFail({ reserva: { id: ingreso.id } });
    assert.deepEqual(avisosEnviados.aviso_pago_admin_en, primerAviso.aviso_pago_admin_en);
    assert.ok(avisosEnviados.aviso_pago_anunciante_en);
    await request(http).get(consultaCbu).set('Authorization', admin).expect(200, { cbu, cuit_cuil: '20-12345678-3' });
    // El plazo de reclamos termina el día anterior a que se habilite el pago.
    const { sumarDiasCalendario } = require('../dist/common/utils/fechas');
    const filaPagable = lista.body.find(fila => fila.id === ingreso.id);
    assert.equal(filaPagable.fin_plazo_reclamo, sumarDiasCalendario(filaPagable.fecha_disponible_pago, -1));
    await request(http).patch(rutaLiquidacion).set('Authorization', admin).send({ estado: 'PAGADO_PROPIETARIO', referencia: 'pago-prueba' }).expect(400);
    await pagar({ referencia: 'pago-prueba' }, null).expect(400);
    await pagar({}, 'banco.pdf', tenant).expect(403);
    // El nombre llega en UTF-8, como lo manda el navegador, y se guarda sin romper la «ñ» ni la «—».
    await pagar({ referencia: 'pago-prueba', observacion: 'Transferencia acreditada' }, 'Señal — banco.pdf').expect(200);
    await request(http).get(historialAnunciante).expect(401);
    await request(http).get(historialAnunciante).set('Authorization', tenant).expect(200, []);
    await request(http).get(historialAnunciante).set('Authorization', ajeno).expect(200, []);
    await request(http).get('/reservas/liquidaciones/publicacion/999').set('Authorization', anunciante).expect(200, []);
    const { body: historialPropio } = await request(http).get(historialAnunciante).set('Authorization', anunciante).expect(200);
    const [{ id: idPago, fecha: fechaPago }] = historialPropio;
    assert.ok(idPago);
    assert.ok(Number.isFinite(Date.parse(fechaPago)));
    const historialAdministracion = await request(http).get('/reservas/liquidaciones/administracion/historial')
      .set('Authorization', admin).expect(200);
    assert.ok(historialAdministracion.body.some(item => item.reservaId === ingreso.id));
    assert.deepEqual(historialPropio, [{
      id: idPago, reservaId: ingreso.id, publicacion: 'Publicación de prueba', fecha: fechaPago, importe: 100, moneda: 'ARS',
      referencia: 'pago-prueba', observacion: 'Transferencia acreditada', indice: 0, comprobante: 'Señal — banco.pdf',
      // Esta reserva no tiene un cobro de Mercado Pago registrado.
      desglose: null,
    }]);
    // El enlace firmado del comprobante, solo para el admin y el anunciante; la URL privada no viaja.
    const rutaComprobante = `/reservas/${ingreso.id}/liquidacion/pagos/0/comprobante`;
    await request(http).get(rutaComprobante).expect(401);
    for (const actor of [admin, anunciante]) {
      const { body } = await request(http).get(rutaComprobante).set('Authorization', actor).expect(200);
      assert.match(body.url, /comprobantes\/liquidaciones\/\d+\/.+\.pdf\?firmado$/);
    }
    // El usuario 4 (`ajeno`) es administrador en este escenario; el inquilino no ve el pago al anunciante.
    await request(http).get(rutaComprobante).set('Authorization', tenant).expect(404);
    assert.equal(JSON.stringify(historialAdministracion.body).includes('privado.example'), false);
    // El panel del anunciante muestra el mismo pago, una sola vez, y nadie más lo ve.
    const misPagos = '/reservas/liquidaciones/mias';
    await request(http).get(misPagos).expect(401);
    await request(http).get(misPagos).set('Authorization', tenant).expect(200, []);
    await request(http).get(misPagos).set('Authorization', ajeno).expect(200, []);
    await request(http).get(misPagos).set('Authorization', anunciante).expect(200, historialPropio);
    await pagar({ referencia: 'pago-repetido' }).expect(409);
    assert.equal(correos.filter(({ content }) => content.subject === 'Pago al anunciante registrado').length, 1);
    await source.query(`INSERT INTO fecha (fecha,disponible,id_publicacion,id_reserva)
      VALUES ('2099-01-10',false,1,$1)`, [reserva.id]);
    await request(http).get('/disputas/administracion').set('Authorization', admin).expect(404);
    await request(http).patch('/disputas/1/resolver')
      .set('Authorization', admin).send({ resultado: 'GANADA' }).expect(404);
    await request(http).patch(`/reservas/${reserva.id}/liquidacion`)
      .set('Authorization', admin).send({ estado: 'GANADA' }).expect(400);
    // Ya no hay aprobación administrativa de cancelaciones.
    await request(http).get('/reservas/cancelaciones/administracion').set('Authorization', admin).expect(404);
    await request(http).patch(`/reservas/${reserva.id}/cancelacion/1`).set('Authorization', admin).send({ decision: 'APROBADA' }).expect(404);
    // Las rutas de solicitudes conservan su contrato al pasar al módulo de cancelaciones.
    await request(http).post(`/reservas/${reserva.id}/cancelacion`).send({ motivo: 'Cambio de planes', aceptaTerminos: true, ...montoAceptado }).expect(401);
    await request(http).post(`/reservas/${reserva.id}/cancelacion`)
      .set('Authorization', ajeno).send({ motivo: 'Cambio de planes', aceptaTerminos: true, ...montoAceptado }).expect(403);
    await request(http).post(`/reservas/${reserva.id}/cancelacion`)
      .set('Authorization', tenant).send({ motivo: 'Corto' }).expect(400);
    const sinSolicitud = await request(http).get(`/reservas/${reserva.id}/cancelacion`)
      .set('Authorization', tenant).expect(200);
    assert.equal(sinSolicitud.text, '');
    const rutaCondiciones = `/reservas/${reserva.id}/cancelacion/condiciones`;
    await request(http).get(rutaCondiciones).expect(401);
    await request(http).get(rutaCondiciones).set('Authorization', ajeno).expect(403);
    const { body: condiciones } = await request(http).get(rutaCondiciones).set('Authorization', tenant).expect(200);
    assert.equal(condiciones.motivoBloqueo, null);
    assert.equal(condiciones.politica.diasDevolucionParcial, 2);
    assert.equal(condiciones.devolucion.porcentaje, 100);
    assert.equal(condiciones.devolucion.importe, 100);
    assert.equal(condiciones.devolucion.moneda, 'ARS');
    assert.match(condiciones.devolucion.fechaSolicitud, /^\d{4}-\d{2}-\d{2}$/);
    for (const extra of [{ fechaSolicitud: '2090-01-01' }, { importe: 999 }, { porcentaje: 100 }]) {
      await request(http).post(`/reservas/${reserva.id}/cancelacion`)
        .set('Authorization', tenant).send({ motivo: 'Cambio de planes', aceptaTerminos: true, ...montoAceptado, ...extra }).expect(400);
    }
    await request(http).post(`/reservas/${reserva.id}/cancelacion`)
      .set('Authorization', tenant).send({ motivo: 'Cambio de planes' }).expect(400);
    await request(http).post('/reservas/' + reserva.id + '/cancelacion')
      .set('Authorization', tenant).send({ motivo: 'Cambio de planes', aceptaTerminos: true, ...montoAceptado, importeAceptado: 99 }).expect(409);
    const solicitud = await request(http).post(`/reservas/${reserva.id}/cancelacion`)
      .set('Authorization', tenant).send({ motivo: 'Cambio de planes', aceptaTerminos: true, ...montoAceptado }).expect(201);
    assert.equal(solicitud.body.estado, 'APROBADA');
    assert.equal(Object.hasOwn(solicitud.body, 'ambitoEstado'), false);
    assert.equal(solicitud.body.reserva.id, reserva.id);
    assert.equal(solicitud.body.reserva.estado_estadia, 'CONFIRMADA');
    await request(http).get('/reservas/' + reserva.id + '/cancelacion').set('Authorization', ajeno).expect(403);
    const reenviada = await request(http).post('/reservas/' + reserva.id + '/cancelacion').set('Authorization', tenant)
      .send({ motivo: 'Cambio de planes', aceptaTerminos: true, ...montoAceptado }).expect(201);
    assert.equal(reenviada.body.id, solicitud.body.id);
    const registrada = await source.getRepository(Reembolso).findOneByOrFail({ referencia_interna: 'auto-can:' + solicitud.body.id });
    const rutaReembolso = '/reservas/reembolsos/' + registrada.id + '/ejecutar';
    await request(http).patch(rutaReembolso).send({}).expect(401);
    await request(http).patch(rutaReembolso).set('Authorization', tenant).send({}).expect(403);
    await request(http).patch(rutaReembolso).set('Authorization', admin).send({}).expect(409);
    await app.get(OperacionesReembolsoService).conciliar();
    assert.equal(reembolsar.mock.callCount(), 1);
    const final = await request(http).get(`/reservas/${reserva.id}`).set('Authorization', tenant).expect(200);
    assert.equal(final.body.cancelada, true);
    assert.equal(final.body.estado_pago, 'REEMBOLSADO');
    assert.equal(correos.filter(({ content }) => content.subject === 'Reserva cancelada y devolución registrada').length, 2);
    const [dia] = await source.query("SELECT disponible,id_reserva FROM fecha WHERE fecha='2099-01-10'");
    assert.equal(dia.disponible, true);
    assert.equal(dia.id_reserva, null);

    // Resolver un reclamo por la API: el parcial no puede cubrir todo y la decisión queda registrada.
    const conReclamo = await source.getRepository(Reserva).save({
      monto_pago: 100, estado_pago: 'APROBADO', usuario: { id: 1 }, publicacion: { id: 1 },
      fecha_inicio: '2026-01-01', fecha_fin: '2099-03-20',
    });
    await source.getRepository(Pago).save({
      reserva: conReclamo, amount: 100, currency: 'ARS', status: 'approved', payment_id: 'mp-reclamo-api',
      payment_method_id: null, external_reference: `reserva:${conReclamo.id}`, idempotency_key: 'pago-reclamo-api',
    });
    const { body: abierto } = await request(http).post('/reclamos').set('Authorization', tenant)
      .send({ id_reserva: conReclamo.id, categoria: 'OTRO', descripcion: 'Problema durante la estadía' }).expect(201);
    // El chat acepta imágenes sin texto (multipart) y sigue aceptando solo texto (JSON).
    const rutaMensajes = `/reclamos/${abierto.id}/mensajes`;
    const { body: conImagen } = await request(http).post(rutaMensajes).set('Authorization', tenant)
      .attach('evidencias', (await imagenPng()).buffer, 'pileta.png').expect(201);
    assert.deepEqual([conImagen.texto, conImagen.evidencias.length, Object.hasOwn(conImagen, 'reclamo')], ['', 1, false]);
    await request(http).post(rutaMensajes).set('Authorization', tenant).send({ texto: '   ' }).expect(400);
    assert.deepEqual([conImagen.como_administracion, Object.hasOwn(conImagen, 'visible_para')], [false, false]);
    // El admin responde desde Administración: el chat de las partes es solo para ellas, y la ruta de Administración, solo para el admin.
    await request(http).post(rutaMensajes).set('Authorization', admin).send({ texto: 'Recibido' }).expect(403);
    await request(http).post(`${rutaMensajes}/administracion`).set('Authorization', tenant).send({ texto: 'Recibido' }).expect(403);
    const { body: soloTexto } = await request(http).post(`${rutaMensajes}/administracion`).set('Authorization', admin).send({ texto: 'Recibido' }).expect(201);
    assert.deepEqual([soloTexto.evidencias, soloTexto.como_administracion], [[], true]);
    // Ya no hay notas internas: el campo de visibilidad se rechaza como cualquier dato desconocido.
    await request(http).post(`${rutaMensajes}/administracion`).set('Authorization', admin).send({ texto: 'Nota interna', visible_para: 'ADMIN' }).expect(400);
    // Las lecturas también se separan: el admin lee por Administración y las partes, por su chat, con los mismos mensajes.
    await request(http).get(rutaMensajes).set('Authorization', admin).expect(403);
    await request(http).get(`/reclamos/${abierto.id}`).set('Authorization', admin).expect(403);
    await request(http).get(`${rutaMensajes}/administracion`).set('Authorization', tenant).expect(403);
    const { body: leidosAdmin } = await request(http).get(`${rutaMensajes}/administracion`).set('Authorization', admin).expect(200);
    const { body: leidosParte } = await request(http).get(rutaMensajes).set('Authorization', tenant).expect(200);
    assert.deepEqual([leidosAdmin.map(({ texto }) => texto), leidosParte.map(({ texto }) => texto)], [['', 'Recibido'], ['', 'Recibido']]);
    const rutaResolver = `/reclamos/${abierto.id}/resolver`;
    await request(http).patch(rutaResolver).set('Authorization', tenant)
      .send({ resolucion: 'DEVOLUCION_TOTAL', observacion: 'Pedido del inquilino' }).expect(403);
    await request(http).patch(rutaResolver).set('Authorization', admin)
      .send({ resolucion: 'DEVOLUCION_PARCIAL', observacion: 'Falta el importe' }).expect(400);
    const { body: parcialTotal } = await request(http).patch(rutaResolver).set('Authorization', admin)
      .send({ resolucion: 'DEVOLUCION_PARCIAL', importe: 100, observacion: 'Todo como parcial' }).expect(400);
    assert.match(parcialTotal.message, /Para devolver todo elegí "Devolución total"/);
    const { body: resuelto } = await request(http).patch(rutaResolver).set('Authorization', admin)
      .send({ resolucion: 'DEVOLUCION_TOTAL', observacion: 'Corresponde devolver todo' }).expect(200);
    assert.deepEqual([resuelto.estado, resuelto.resolucion, Number(resuelto.importe_reembolso)], ['RESUELTO_INQUILINO', 'DEVOLUCION_TOTAL', 100]);
    await request(http).patch(rutaResolver).set('Authorization', admin)
      .send({ resolucion: 'SIN_DEVOLUCION', observacion: 'Otra decisión' }).expect(409);
    assert.equal(correos.filter(({ content }) => content.subject === 'Reclamo resuelto con devolución').length, 2);

    // La cancelación del día anterior conserva el pago y no mueve dinero.
    await db.exec('TRUNCATE reserva RESTART IDENTITY CASCADE');
    const { reserva: tardia, pago: pagoTardio } = await escenario(fechaEnDias(1));
    await source.query('INSERT INTO fecha (fecha,disponible,id_publicacion,id_reserva) VALUES ($1,false,1,$2)', [tardia.fecha_inicio, tardia.id]);
    const rutaTardia = `/reservas/${tardia.id}/cancelacion`;
    const consultaTardia = await request(http).get(`${rutaTardia}/condiciones`).set('Authorization', tenant).expect(200);
    assert.equal(consultaTardia.body.motivoBloqueo, null);
    assert.equal(consultaTardia.body.devolucion.importe, 0);
    assert.equal(consultaTardia.body.devolucion.porcentaje, 0);
    assert.match(consultaTardia.body.advertencia, /no recibirás devolución/);
    await request(http).post(rutaTardia).set('Authorization', tenant)
      .send({ motivo: 'Cambio de planes', aceptaTerminos: false }).expect(400);
    const enviadaTardia = await request(http).post(rutaTardia).set('Authorization', tenant)
      .send({ motivo: 'Cambio de planes', aceptaTerminos: true, ...montoAceptado, importeAceptado: 0 }).expect(201);
    assert.equal(enviadaTardia.body.estado, 'APROBADA');
    assert.equal(enviadaTardia.body.reserva.cancelada, true);
    const detalleTardio = await request(http).get(`/reservas/${tardia.id}`).set('Authorization', tenant).expect(200);
    assert.equal(detalleTardio.body.cancelada, true);
    assert.equal(detalleTardio.body.estado_pago, 'APROBADO');
    assert.equal(Number((await source.getRepository(Pago).findOneByOrFail({ id: pagoTardio.id })).amount_refunded), 0);
    assert.equal(await source.getRepository(Reembolso).count(), 0);
    assert.equal(reembolsar.mock.callCount(), 1, 'la cancelación sin devolución no llama a la pasarela');
    const [diaLiberado] = await source.query('SELECT disponible,id_reserva FROM fecha WHERE fecha=$1', [tardia.fecha_inicio]);
    assert.deepEqual(diaLiberado, { disponible: true, id_reserva: null });

    for (const dias of [0, -1]) {
      await db.exec('TRUNCATE reserva RESTART IDENTITY CASCADE');
      const { reserva: iniciada } = await escenario(fechaEnDias(dias));
      const rutaIniciada = `/reservas/${iniciada.id}/cancelacion`;
      const bloqueada = await request(http).get(`${rutaIniciada}/condiciones`).set('Authorization', tenant).expect(200);
      assert.match(bloqueada.body.motivoBloqueo, /Desde la fecha de ingreso/);
      assert.equal(bloqueada.body.devolucion, null);
      const rechazoInicio = await request(http).post(rutaIniciada).set('Authorization', tenant)
        .send({ motivo: 'Cambio de planes', aceptaTerminos: true, ...montoAceptado }).expect(400);
      assert.match(rechazoInicio.body.message, /estadía ya comenzó/);
      assert.equal(await source.getRepository(SolicitudCancelacion).count(), 0);
    }

    // El anunciante solicita y recibe el 100 % solamente antes del ingreso.
    for (const dias of [1]) {
      await db.exec('TRUNCATE reserva RESTART IDENTITY CASCADE');
      const { reserva: delAnunciante, pago: pagoDelAnunciante } = await escenario(fechaEnDias(dias));
      await source.getRepository(Pago).update(pagoDelAnunciante.id, { payment_id: '123' });
      await source.getRepository(Reserva).update(delAnunciante.id, { codigo_alojamiento: '12345678', codigo_generado_en: new Date() });
      await source.query('INSERT INTO fecha (fecha,disponible,id_publicacion,id_reserva) VALUES ($1,false,1,$2)', [delAnunciante.fecha_inicio, delAnunciante.id]);
      const rutaAnunciante = `/reservas/${delAnunciante.id}/cancelacion`;
      await request(http).get(`${rutaAnunciante}/condiciones`).set('Authorization', ajeno).expect(403);
      await request(http).post(rutaAnunciante).set('Authorization', ajeno)
        .send({ motivo: 'Problema en la propiedad', aceptaTerminos: true, ...montoAceptado }).expect(403);
      await request(http).post(rutaAnunciante).set('Authorization', anunciante)
        .send({ motivo: 'Problema en la propiedad', aceptaTerminos: true, ...montoAceptado, actor: 'ANUNCIANTE' }).expect(400);
      const condicionesAnunciante = await request(http).get(`${rutaAnunciante}/condiciones`).set('Authorization', anunciante).expect(200);
      if (dias <= 0) {
        assert.match(condicionesAnunciante.body.motivoBloqueo, /Desde la fecha de ingreso/);
        assert.equal(condicionesAnunciante.body.devolucion, null);
        await request(http).post(rutaAnunciante).set('Authorization', anunciante)
          .send({ motivo: 'Problema en la propiedad', aceptaTerminos: true, ...montoAceptado }).expect(400);
        assert.equal(await source.getRepository(SolicitudCancelacion).count(), 0);
        continue;
      }
      assert.equal(condicionesAnunciante.body.motivoBloqueo, null);
      assert.equal(condicionesAnunciante.body.devolucion.porcentaje, 100);
      assert.equal(condicionesAnunciante.body.devolucion.importe, 100);
      const enviadaAnunciante = await request(http).post(rutaAnunciante).set('Authorization', anunciante)
        .send({ motivo: 'Problema en la propiedad', aceptaTerminos: true, ...montoAceptado }).expect(201);
      assert.equal(enviadaAnunciante.body.solicitante.id, 2);
      const reembolsoAnunciante = await source.getRepository(Reembolso).findOneByOrFail({ referencia_interna: 'auto-can:' + enviadaAnunciante.body.id });
      assert.equal(Number(reembolsoAnunciante.importe), 100);
      assert.equal(reembolsoAnunciante.tipo, 'TOTAL');
      await request(http).patch(`/reservas/${delAnunciante.id}/validar-codigo`).set('Authorization', anunciante)
        .send({ codigo: '12345678' }).expect(409);
      await app.get(OperacionesReembolsoService).conciliar();
      const detalleAnunciante = await request(http).get(`/reservas/${delAnunciante.id}`).set('Authorization', tenant).expect(200);
      assert.equal(detalleAnunciante.body.cancelada, true);
      assert.equal(detalleAnunciante.body.estado_pago, 'REEMBOLSADO');
      const [calendarioAnunciante] = await source.query('SELECT disponible,id_reserva FROM fecha WHERE fecha=$1', [delAnunciante.fecha_inicio]);
      assert.deepEqual(calendarioAnunciante, { disponible: true, id_reserva: null });
    }

    await db.exec('TRUNCATE reserva RESTART IDENTITY CASCADE');
    const { reserva: ingresoValidado } = await escenario(fechaEnDias(1));
    await source.getRepository(Reserva).update(ingresoValidado.id, { codigo_alojamiento: '12345678', codigo_generado_en: new Date() });
    const rutaValidada = `/reservas/${ingresoValidado.id}/cancelacion`;
    await source.getRepository(Reserva).update(ingresoValidado.id, { fecha_inicio: fechaEnDias(0) });
    await request(http).patch(`/reservas/${ingresoValidado.id}/validar-codigo`).set('Authorization', anunciante)
      .send({ codigo: '12345678' }).expect(200);
    await request(http).post(rutaValidada).set('Authorization', anunciante)
      .send({ motivo: 'Segundo pedido de cancelación', aceptaTerminos: true, ...montoAceptado }).expect(400);
    const bloqueadaPorCodigo = await request(http).get(`${rutaValidada}/condiciones`).set('Authorization', anunciante).expect(200);
    assert.match(bloqueadaPorCodigo.body.motivoBloqueo, /fecha de ingreso/);
    assert.equal(bloqueadaPorCodigo.body.devolucion, null);
    assert.equal(await source.getRepository(Reembolso).count(), 0);

    for (const dias of [0, -1]) {
      await db.exec('TRUNCATE reserva RESTART IDENTITY CASCADE');
      const { reserva: fueraDePlazo } = await escenario(fechaEnDias(dias));
      const rutaFueraDePlazo = `/reservas/${fueraDePlazo.id}/cancelacion`;
      const condicionesFueraDePlazo = await request(http).get(`${rutaFueraDePlazo}/condiciones`).set('Authorization', anunciante).expect(200);
      assert.match(condicionesFueraDePlazo.body.motivoBloqueo, /fecha de ingreso/);
      await request(http).post(rutaFueraDePlazo).set('Authorization', anunciante).send({ motivo: 'Problema en la propiedad', aceptaTerminos: true, ...montoAceptado }).expect(400);
      assert.equal(await source.getRepository(SolicitudCancelacion).count(), 0);
    }
    // El contrato HTTP muestra y devuelve el importe del pago, también con centavos.
    for (const [dias, esperado] of [[7, 75.35], [2, 37.68], [1, 0]]) {
      await db.exec('TRUNCATE reserva RESTART IDENTITY CASCADE');
      const { reserva: conCentavos, pago: pagoConCentavos } = await escenario(fechaEnDias(dias));
      await source.getRepository(Pago).update(pagoConCentavos.id, { amount: 75.35, payment_id: '123' });
      const rutaCentavos = `/reservas/${conCentavos.id}/cancelacion`;
      await request(http).get(`${rutaCentavos}/condiciones`).set('Authorization', ajeno).expect(403);
      const prevista = await request(http).get(`${rutaCentavos}/condiciones`).set('Authorization', tenant).expect(200);
      assert.equal(prevista.body.devolucion.importe, esperado);
      assert.equal(prevista.body.devolucion.moneda, 'ARS');
      await request(http).post(rutaCentavos).set('Authorization', tenant)
        .send({ motivo: 'Cambio de planes', aceptaTerminos: true, ...montoAceptado, importe: 1 }).expect(400);
      const enviadaCentavos = await request(http).post(rutaCentavos).set('Authorization', tenant)
        .send({ motivo: 'Cambio de planes', aceptaTerminos: true, ...montoAceptado, importeAceptado: esperado }).expect(201);
      assert.equal(enviadaCentavos.body.estado, 'APROBADA');
      if (esperado > 0) {
        const pendiente = await source.getRepository(Reembolso).findOneByOrFail({ referencia_interna: 'auto-can:' + enviadaCentavos.body.id });
        assert.equal(Number(pendiente.importe), esperado);
        assert.equal(pendiente.moneda, prevista.body.devolucion.moneda);
        reembolsar.mock.mockImplementation(async (paymentId, importe, clave, total) => {
          assert.equal(importe, esperado);
          assert.equal(total, dias === 7);
          return { id: 456, status: 'approved', amount: importe, payment_id: paymentId };
        });
        await app.get(OperacionesReembolsoService).conciliar();
      } else {
        assert.equal(await source.getRepository(Reembolso).count(), 0);
      }
      const pagoFinal = await source.getRepository(Pago).findOneByOrFail({ id: pagoConCentavos.id });
      assert.equal(Number(pagoFinal.amount_refunded), esperado);
    }
    await db.exec('TRUNCATE reserva RESTART IDENTITY CASCADE');
    const faltanteHttp = await cancelacionConFaltante();
    const rutaFaltante = `/reclamos/cancelacion/${faltanteHttp.reserva.id}`;
    await request(http).get(rutaFaltante).expect(401);
    await request(http).get(rutaFaltante).set('Authorization', ajeno).expect(403);
    await request(http).post(rutaFaltante).set('Authorization', `Bearer ${token(2)}`).send({ descripcion: descripcionFaltante }).expect(403);
    const saldoHttp = await request(http).get(rutaFaltante).set('Authorization', tenant).expect(200);
    assert.equal(saldoHttp.body.devolucion.importeReclamable, 20);
    await request(http).post(rutaFaltante).set('Authorization', tenant).send({ descripcion: 'Corta' }).expect(400);
    await request(http).post(rutaFaltante).set('Authorization', tenant).send({ descripcion: ' '.repeat(30) }).expect(400);
    await request(http).post(rutaFaltante).set('Authorization', tenant).send({ descripcion: descripcionFaltante, importe: 999 }).expect(400);
    const creadoFaltante = await request(http).post(rutaFaltante).set('Authorization', tenant).send({ descripcion: descripcionFaltante }).expect(201);
    assert.equal(creadoFaltante.body.devolucion_cancelacion.esperado, 50);
    await request(http).post(rutaFaltante).set('Authorization', tenant).send({ descripcion: descripcionFaltante }).expect(409);
    const listaFaltantes = await request(http).get('/reclamos/administracion').set('Authorization', admin).expect(200);
    assert.equal(listaFaltantes.body[0].devolucion_cancelacion.importeReclamable, 20);
    await request(http).patch(`/reclamos/${creadoFaltante.body.id}/resolver`).set('Authorization', tenant).send({ resolucion: 'DEVOLUCION_TOTAL' }).expect(403);
    const decisionFaltante = await request(http).patch(`/reclamos/${creadoFaltante.body.id}/resolver`).set('Authorization', admin)
      .send({ resolucion: 'DEVOLUCION_TOTAL', observacion: 'Completar únicamente los veinte faltantes.' }).expect(200);
    assert.equal(Number(decisionFaltante.body.importe_reembolso), 20);
    const complementoHttp = await reembolsos.buscarPorOrigen('RECLAMO', `rec:${creadoFaltante.body.id}`);
    assert.equal(Number(complementoHttp.importe), 20);
    assert.equal(await source.getRepository(Reembolso).count(), 2);
    for (const medio of ['visa', 'debvisa']) {
      await db.exec('TRUNCATE reserva RESTART IDENTITY CASCADE');
      const { reserva: conTarjeta, pago: pagoTarjeta } = await escenario(fechaEnDias(2));
      await source.getRepository(Pago).update(pagoTarjeta.id, { payment_method_id: medio, amount: 75.35, payment_id: '123' });
      const rutaTarjeta = `/reservas/${conTarjeta.id}/cancelacion`;
      const condicionesTarjeta = await request(http).get(`${rutaTarjeta}/condiciones`).set('Authorization', tenant).expect(200);
      assert.equal(condicionesTarjeta.body.devolucionPorTransferencia, false);
      assert.equal(condicionesTarjeta.body.devolucion.importe, 37.68);
      ajustes.MP_SIMULAR_REEMBOLSO_TARJETA = 'true';
      cobro.payment_type_id = medio === 'visa' ? 'credit_card' : 'debit_card';
      const enviadaTarjeta = await request(http).post(rutaTarjeta).set('Authorization', tenant)
        .send({ motivo: 'Cambio de planes', aceptaTerminos: true, ...montoAceptado, importeAceptado: 37.68 }).expect(201);
      assert.equal(enviadaTarjeta.body.estado, 'APROBADA');
      const pendiente = await source.getRepository(Reembolso).findOneByOrFail({ referencia_interna: 'auto-can:' + enviadaTarjeta.body.id });
      const intentosAntes = reembolsar.mock.callCount();
      await app.get(OperacionesReembolsoService).conciliar();
      const devueltaTarjeta = await reembolsos.buscar(pendiente.id);
      assert.equal(devueltaTarjeta.estado, 'APROBADO');
      assert.match(devueltaTarjeta.referencia_externa, /^SIMULADO:tarjeta:/);
      assert.ok(devueltaTarjeta.aplicado_en);
      assert.equal(reembolsar.mock.callCount(), intentosAntes);
      const pagoFinalTarjeta = await source.getRepository(Pago).findOneByOrFail({ id: pagoTarjeta.id });
      assert.equal(Number(pagoFinalTarjeta.amount_refunded), 37.68);
      assert.equal((await reservas.obtenerReserva(conTarjeta.id)).cancelada, true);
    }
    await db.exec('TRUNCATE reserva RESTART IDENTITY CASCADE');
    const casoManual = await escenario();
    const fallido = await casoManual.crearReembolso();
    await source.getRepository(Reembolso).update(fallido.id, { estado: 'FALLIDO' });
    t.mock.method(MercadoPagoAdapter.prototype, 'listarReembolsos', async () => []);
    const rutaManual = `/reservas/reembolsos/${fallido.id}/habilitar-transferencia`;
    await request(http).patch(rutaManual).expect(401);
    await request(http).patch(rutaManual).set('Authorization', anunciante).expect(403);
    await request(http).patch(rutaManual).set('Authorization', tenant).expect(403);
    const habilitada = await request(http).patch(rutaManual).set('Authorization', admin).expect(200);
    assert.deepEqual([habilitada.body.estado, habilitada.body.transferencia_manual], ['PENDIENTE', true]);
    const devueltaManual = await request(http).patch(`/reservas/reembolsos/${fallido.id}/transferencia`).set('Authorization', admin)
      .attach('comprobante', comprobantePdf().buffer, 'reembolso.pdf').expect(200);
    assert.equal(devueltaManual.body.reembolso.estado, 'APROBADO');
    await db.exec('TRUNCATE reserva RESTART IDENTITY CASCADE');
    // El reclamo por demora administrativa ya no se ofrece ni se puede crear.
    const { reserva: iniciadaSinDemora } = await escenario(fechaEnDias(-1));
    await request(http).get('/reclamos/demoras/mias').set('Authorization', tenant).expect(404);
    const rechazoDemora = await request(http).post('/reclamos').set('Authorization', tenant)
      .send({ id_reserva: iniciadaSinDemora.id, categoria: 'DEMORA_ADMINISTRATIVA', descripcion: descripcionDemora }).expect(400);
    assert.match(rechazoDemora.body.message, /cancelaciones son automáticas/);
    assert.equal(await source.getRepository(Reclamo).count(), 0);
  } finally { await app.close(); }
});
