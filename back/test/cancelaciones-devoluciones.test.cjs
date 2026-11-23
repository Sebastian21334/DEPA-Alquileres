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
const { ReembolsosRepository } = require('../dist/reembolsos/repository/reembolsos.repository');
const { ReservasService } = require('../dist/reservas/service/reservas.service');
const { OperacionesReembolsoService } = require('../dist/operaciones-reserva/service/operaciones-reembolso.service');
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
    estadoReserva, catalogosDePrueba(), almacenamientoDePrueba(),
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
    reservas, reembolsos, {}, catalogosDePrueba(),
  );
  operacionesReembolso = new OperacionesReembolsoService(reembolsos, reservas, reclamos);
});

after(async () => {
  if (base) await base.cerrar();
});

// T44: almacenamiento privado de prueba para los comprobantes de transferencia.
function almacenamientoDePrueba() {
  return new AlmacenamientoService({
    subir: async (_contenedor, nombre) => `https://privado.example/${nombre}`,
    firmarArchivo: async (_contenedor, url) => `${url}?firmado`,
    eliminarArchivo: async () => {},
  });
}

const comprobantePdf = () => {
  const buffer = Buffer.from('%PDF-1.7 comprobante de prueba');
  return { buffer, size: buffer.length, originalname: 'transferencia.pdf', mimetype: 'application/pdf' };
};

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

test('T47-Extra: el código bloqueado con la estadía terminada llega al pago del anunciante', async (t) => {
  // Estadía del 10 al 20/01/2099: el pago se habilita el 25/01.
  const { reserva } = await escenario();
  await source.getRepository(Reserva).update(reserva.id, { codigo_alojamiento: 'K7M4P9Q2', codigo_generado_en: new Date() });
  await source.getRepository(Liquidacion).save({ reserva, estado: 'RETENIDO', moneda: 'ARS' });
  const liquidaciones = new LiquidacionesService(new LiquidacionRepository(source.getRepository(Liquidacion)), catalogosDePrueba());
  const operaciones = new OperacionesLiquidacionService(
    reembolsos, reservas, liquidaciones, catalogosDePrueba(), { buscarCbuValidado: async () => '0010000700000000000017' }, reclamos,
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
  await assert.rejects(operaciones.resolverLiquidacion(reserva.id, { estado: 'PAGADO_PROPIETARIO', referencia: 'pago-anticipado' }, 3),
    (error) => error.getStatus() === 409);

  // 4. Al vencer el plazo, T36 lo deja pendiente de pago a favor del anunciante y el admin paga sin código.
  t.mock.timers.setTime(new Date('2099-01-25T15:00:00Z').getTime());
  await operaciones.avisarLiquidacionesDisponibles();
  assert.equal((await liquidacion()).estado, 'PENDIENTE_PAGO_PROPIETARIO');
  await operaciones.resolverLiquidacion(reserva.id, { estado: 'PAGADO_PROPIETARIO', referencia: 'transferencia-1' }, 3);
  const pagada = await liquidacion();
  assert.equal(pagada.estado, 'PAGADO_PROPIETARIO');
  assert.equal(Number(pagada.importe), 100);
  assert.equal((await actual()).codigo_validado_en, null);
});

test('T34: cada caso del código de alojamiento tiene su mensaje y la reserva informa los intentos restantes', async (t) => {
  // Estadía del 10 al 20/01/2099: el código se puede cargar hasta el 24/01.
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

  t.mock.timers.setTime(new Date('2099-01-25T15:00:00Z').getTime());
  await rechaza(validar(vencida, codigo), 409, /El plazo para validar el código terminó el 24\/01\/2099/);

  t.mock.timers.setTime(new Date('2099-01-24T15:00:00Z').getTime());
  await validar(vencida, codigo);
  await rechaza(validar(vencida, codigo), 409, /El ingreso ya se validó el 24\/01\/2099/);
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

test('T34: solo el anunciante con el código bloqueado puede pedir el reinicio', async () => {
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

test('T34: el admin habilita intentos sin límite de reinicios o confirma el ingreso sin código', async () => {
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
  assert.equal((await reservas.obtenerReserva(reserva.id)).codigo_validado_en, null);
  assert.equal(avisos.at(-1).asunto, 'Ingreso confirmado por la administración');
  assert.equal(await source.getRepository(Reembolso).count(), 0);

  // Las salidas del pedido no se usan en otros reclamos.
  const otra = await reservaParaReclamo({}, { estado: 'RETENIDO' });
  const comun = await reclamoAbierto(otra);
  await assert.rejects(servicio.resolver(comun.id, { resolucion: 'REINICIAR_CODIGO' }, 3), /solo corresponde a un pedido de reinicio/);
});

test('T34: rechazar el pedido devuelve el total al inquilino y exige el motivo', async () => {
  const { reserva } = await escenario('2026-01-01');
  await source.getRepository(Liquidacion).save({ reserva, estado: 'EN_REVISION', moneda: 'ARS' });
  await source.getRepository(Reserva).update(reserva.id, { intentos_codigo: 5 });
  const { servicio } = reclamosConAvisos();
  const pedido = await pedirReinicio(servicio, reserva);
  await assert.rejects(servicio.resolver(pedido.id, { resolucion: 'DEVOLUCION_TOTAL' }, 3), /Indicá el motivo/);
  const rechazado = await servicio.resolver(pedido.id, { resolucion: 'DEVOLUCION_TOTAL', observacion: 'El huésped no pudo entrar' }, 3);
  assert.deepEqual([rechazado.estado, rechazado.resolucion, Number(rechazado.importe_reembolso)], ['RESUELTO_INQUILINO', 'DEVOLUCION_TOTAL', 100]);
});

test('T34: T36 deja a favor del anunciante el código bloqueado sin pedido ni reclamo', async () => {
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

test('T55: el historial del anunciante junta los pagos de todas sus publicaciones, una vez cada uno', async (t) => {
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
  await assert.rejects(operaciones.resolverLiquidacion(reserva.id, { estado: 'DEVUELTO_INQUILINO' }, 3), /reclamo abierto/i);
  await source.getRepository(Liquidacion).update({ reserva: { id: reserva.id } }, { estado: 'RETENIDO' });
  t.mock.timers.setTime(new Date('2099-01-25T03:00:00Z').getTime());
  await operaciones.avisarLiquidacionesDisponibles(new Date());
  assert.equal((await source.getRepository(Liquidacion).findOneByOrFail({ reserva: { id: reserva.id } })).estado, 'RETENIDO');
  await reclamos.resolver(reclamo.id, { resolucion: ResolucionReclamo.SIN_DEVOLUCION }, 3);
  await operaciones.avisarLiquidacionesDisponibles(new Date());
  assert.equal((await source.getRepository(Liquidacion).findOneByOrFail({ reserva: { id: reserva.id } })).estado, 'PENDIENTE_PAGO_PROPIETARIO');
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
  const operaciones = new OperacionesLiquidacionService(reembolsos, reservas, liquidaciones, catalogosDePrueba(), { buscarCbuValidado: async () => 'cbu-validado' }, reclamos);
  await operaciones.avisarLiquidacionesDisponibles(new Date());
  assert.equal((await reservas.obtenerReserva(reserva.id)).estado_liquidacion, 'PENDIENTE_PAGO_PROPIETARIO');
  await operaciones.resolverLiquidacion(reserva.id, { estado: 'PAGADO_PROPIETARIO', referencia: 'pago-prueba' }, 3);
  const actual = await reservas.obtenerReserva(reserva.id);
  assert.equal(actual.estado_liquidacion, 'PAGADO_PROPIETARIO');
  assert.equal(actual.codigo_validado_en, null);
  assert.equal(reservas.prepararRespuesta(actual).estado_estadia, 'INGRESO_NO_VERIFICADO');
  const liquidacion = await source.getRepository(Liquidacion).findOneByOrFail({ reserva: { id: reserva.id } });
  assert.equal(Number(liquidacion.importe), 100);
  assert.equal(liquidacion.referencia, 'pago-prueba');
});

test('un reclamo en una estadía con ingreso validado bloquea el pago hasta resolverse y vencer el plazo', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-15T15:00:00Z') });
  const { reserva } = await escenario();
  await source.getRepository(Reserva).update(reserva.id, { codigo_alojamiento: '12345678', codigo_generado_en: new Date() });
  await source.getRepository(Liquidacion).save({ reserva, estado: 'RETENIDO', moneda: 'ARS' });
  await reservas.validarCodigoAlojamiento(reserva.id, '12345678', 2);
  const reclamo = await reclamos.crear({ id_reserva: reserva.id, categoria: 'OTRO', descripcion: 'Problema de la estadía' }, 1);
  const liquidaciones = new LiquidacionesService(new LiquidacionRepository(source.getRepository(Liquidacion)), catalogosDePrueba());
  const operaciones = new OperacionesLiquidacionService(reembolsos, reservas, liquidaciones, catalogosDePrueba(), { buscarCbuValidado: async () => 'cbu-validado' }, reclamos);
  await assert.rejects(operaciones.resolverLiquidacion(reserva.id, { estado: 'PAGADO_PROPIETARIO' }, 3), /pendiente|revisión/i);
  await reclamos.resolver(reclamo.id, { resolucion: ResolucionReclamo.SIN_DEVOLUCION }, 3);
  await assert.rejects(operaciones.resolverLiquidacion(reserva.id, { estado: 'PAGADO_PROPIETARIO' }, 3), /cinco días/i);
  t.mock.timers.setTime(new Date('2099-01-25T03:00:00Z').getTime());
  await operaciones.resolverLiquidacion(reserva.id, { estado: 'PAGADO_PROPIETARIO', referencia: 'transferencia' }, 3);
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

for (const [fechaSolicitud, fechaAprobacion, porcentaje, dias] of [
  ['2099-01-04T01:00:00Z', '2099-01-05T15:00:00Z', 100, 7],
  ['2099-01-04T03:00:00Z', '2099-01-09T15:00:00Z', 50, 6],
  ['2099-01-08T15:00:00Z', '2099-01-09T15:00:00Z', 50, 2],
]) {
  test(`la devolución conserva el ${porcentaje} % solicitado ${dias} días antes aunque se apruebe después`, async (t) => {
    t.mock.timers.enable({ apis: ['Date'], now: new Date(fechaSolicitud) });
    const { reserva } = await escenario();
    const condiciones = await cancelaciones.consultarCondiciones(reserva.id, 1);
    assert.deepEqual(condiciones.devolucion, {
      fechaSolicitud: fechaSolicitud === '2099-01-04T01:00:00Z' ? '2099-01-03' : fechaSolicitud.slice(0, 10),
      diasAnticipacion: dias, porcentaje, importe: porcentaje, moneda: 'ARS',
    });
    const solicitud = await cancelaciones.solicitar(reserva.id, { motivo: 'Cambio de planes', aceptaTerminos: true }, 1);
    assert.equal(solicitud.creada_en.toISOString(), fechaSolicitud.replace('Z', '.000Z'));
    t.mock.timers.setTime(new Date(fechaAprobacion).getTime());
    const pendiente = await cancelaciones.consultarCondiciones(reserva.id, 1);
    assert.deepEqual(pendiente.devolucion, condiciones.devolucion);
    const resultado = await cancelaciones.resolver(reserva.id, solicitud.id, { decision: 'APROBADA' }, 3);
    assert.equal(Number(resultado.reembolso.importe), condiciones.devolucion.importe);
    assert.equal(resultado.reembolso.tipo, porcentaje === 100 ? 'TOTAL' : 'PARCIAL');
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
  const solicitud = await cancelaciones.solicitar(reserva.id, { motivo: 'Cambio de planes', aceptaTerminos: true }, 1);
  const consultaDelAnunciante = await cancelaciones.consultarCondiciones(reserva.id, 2);
  assert.equal(consultaDelAnunciante.solicitud.id, solicitud.id);
  assert.deepEqual(consultaDelAnunciante.devolucion, inquilino.devolucion);
  const aprobada = await cancelaciones.resolver(reserva.id, solicitud.id, { decision: 'APROBADA' }, 3);
  assert.equal(Number(aprobada.reembolso.importe), 50.01);
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
  const dto = await validar({ motivo, aceptaTerminos: true });
  assert.equal((await cancelaciones.solicitar(reserva.id, dto, 1)).estado, 'PENDIENTE');
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
  const solicitud = await cancelaciones.solicitar(reserva.id, dto, 1);
  assert.equal(solicitud.estado, 'PENDIENTE');
  const resultado = await cancelaciones.resolver(reserva.id, solicitud.id, { decision: 'APROBADA' }, 3);
  assert.equal(resultado.reembolso, null);
  assert.equal(await source.getRepository(Reembolso).count(), 0);
  const actual = await reservas.obtenerReserva(reserva.id);
  assert.equal(actual.cancelada, true);
  assert.equal(actual.estado_pago, 'APROBADO');
  assert.equal(actual.estado_liquidacion, 'EN_REVISION');
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
  await assert.rejects(cancelaciones.solicitar(reserva.id, { motivo: 'Cambio de planes', aceptaTerminos: true }, 1), { status: 400 });
  assert.equal(await source.getRepository(SolicitudCancelacion).count(), 0);
});

for (const dias of [7, 1]) {
  test(`el anunciante puede cancelar con ingreso en ${dias} días y devuelve el 100 % antes de validar el código`, async () => {
    const { reserva } = await escenario(fechaEnDias(dias));
    await source.getRepository(Reserva).update(reserva.id, { codigo_alojamiento: '12345678', codigo_generado_en: new Date() });
    const condiciones = await cancelaciones.consultarCondiciones(reserva.id, 2);
    assert.equal(condiciones.motivoBloqueo, null);
    assert.equal(condiciones.advertencia, null);
    assert.equal(condiciones.devolucion.porcentaje, 100);
    assert.equal(condiciones.devolucion.importe, 100);
    let liberaciones = 0;
    disponibilidad.liberarReserva = async () => { liberaciones += 1; };
    const solicitud = await cancelaciones.solicitar(reserva.id, { motivo: 'Problema en la propiedad', aceptaTerminos: true }, 2);
    const resultado = await cancelaciones.resolver(reserva.id, solicitud.id, { decision: 'APROBADA' }, 3);
    assert.equal(resultado.solicitud.estado, 'APROBADA');
    assert.equal(Number(resultado.reembolso.importe), 100);
    assert.equal(resultado.reembolso.tipo, 'TOTAL');
    assert.equal((await reservas.obtenerReserva(reserva.id)).cancelada, false);
    await operacionesReembolso.ejecutar(resultado.reembolso.id, 3);
    const actual = await reservas.obtenerReserva(reserva.id);
    assert.equal(actual.cancelada, true);
    assert.equal(actual.estado_pago, 'REEMBOLSADO');
    assert.equal(liberaciones, 1, 'también se libera el calendario después de la fecha de ingreso');
  });
}

for (const dias of [0, -1]) {
  test(`el anunciante no puede cancelar con el ingreso previsto hace ${-dias} días`, async () => {
    const { reserva } = await escenario(fechaEnDias(dias));
    const condiciones = await cancelaciones.consultarCondiciones(reserva.id, 2);
    assert.match(condiciones.motivoBloqueo, /Desde la fecha de ingreso/);
    await assert.rejects(cancelaciones.solicitar(reserva.id, { motivo: 'No se concretó el ingreso', aceptaTerminos: true }, 2), { status: 400 });
    assert.equal(await source.getRepository(SolicitudCancelacion).count(), 0);
  });
}

test('el anunciante no puede cancelar una vez finalizada la estadía sin código', async () => {
  const { reserva } = await escenario(fechaEnDias(-10));
  await source.getRepository(Reserva).update(reserva.id, { fecha_fin: fechaEnDias(-1) });
  assert.equal((await reservas.buscarPorId(reserva.id, 2)).estado_estadia, 'INGRESO_NO_VERIFICADO');
  await assert.rejects(cancelaciones.solicitar(reserva.id, { motivo: 'No se concretó el ingreso', aceptaTerminos: true }, 2), { status: 400 });
  assert.equal(await source.getRepository(SolicitudCancelacion).count(), 0);
});

test('una solicitud del anunciante pendiente vence al llegar la fecha de ingreso', async (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2099-01-09T15:00:00Z') });
  const { reserva } = await escenario();
  const solicitud = await cancelaciones.solicitar(reserva.id, { motivo: 'Problema en la propiedad', aceptaTerminos: true }, 2);
  t.mock.timers.setTime(new Date('2099-01-11T15:00:00Z').getTime());
  await assert.rejects(cancelaciones.resolver(reserva.id, solicitud.id, { decision: 'APROBADA' }, 3), /estadía comenzó.*quedó vencida/);
  assert.equal((await solicitudActual(solicitud.id)).estado, 'VENCIDA');
  assert.equal(await source.getRepository(Reembolso).count(), 0);
});

test('el código validado impide nuevas solicitudes del anunciante y vence una pendiente', async () => {
  const { reserva } = await escenario(fechaEnDias(1));
  const solicitud = await cancelaciones.solicitar(reserva.id, { motivo: 'Problema en la propiedad', aceptaTerminos: true }, 2);
  await source.getRepository(Reserva).update(reserva.id, { fecha_inicio: fechaEnDias(0) });
  await source.getRepository(Reserva).update(reserva.id, { codigo_alojamiento: '12345678', codigo_generado_en: new Date() });
  await reservas.validarCodigoAlojamiento(reserva.id, '12345678', 2);
  const condiciones = await cancelaciones.consultarCondiciones(reserva.id, 2);
  assert.match(condiciones.motivoBloqueo, /Desde la fecha de ingreso/);
  await assert.rejects(cancelaciones.resolver(reserva.id, solicitud.id, { decision: 'APROBADA' }, 3), /código de ingreso fue validado.*quedó vencida/);
  assert.equal((await solicitudActual(solicitud.id)).estado, 'VENCIDA');
  await assert.rejects(cancelaciones.solicitar(reserva.id, { motivo: 'Segundo pedido de cancelación', aceptaTerminos: true }, 2), { status: 400 });
  assert.equal(await source.getRepository(Reembolso).count(), 0);
  assert.equal((await reservas.obtenerReserva(reserva.id)).cancelada, false);
});

test('una cancelación del anunciante aprobada impide validar el código mientras se gestiona el reembolso', async () => {
  const { reserva } = await escenario(fechaEnDias(1));
  await source.getRepository(Reserva).update(reserva.id, { codigo_alojamiento: '12345678', codigo_generado_en: new Date() });
  const solicitud = await cancelaciones.solicitar(reserva.id, { motivo: 'Problema en la propiedad', aceptaTerminos: true }, 2);
  await cancelaciones.resolver(reserva.id, solicitud.id, { decision: 'APROBADA' }, 3);
  await source.getRepository(Reserva).update(reserva.id, { fecha_inicio: fechaEnDias(0) });
  await assert.rejects(reservas.validarCodigoAlojamiento(reserva.id, '12345678', 2), /cancelación aprobada/);
  assert.equal((await reservas.obtenerReserva(reserva.id)).codigo_validado_en, null);
});

test('si falla liberar el calendario después del ingreso, se reintenta sin duplicar la devolución del anunciante', async () => {
  const { reserva } = await escenario(fechaEnDias(1));
  const solicitud = await cancelaciones.solicitar(reserva.id, { motivo: 'Problema en la propiedad', aceptaTerminos: true }, 2);
  const { reembolso } = await cancelaciones.resolver(reserva.id, solicitud.id, { decision: 'APROBADA' }, 3);
  await source.getRepository(Reserva).update(reserva.id, { fecha_inicio: fechaEnDias(-1) });
  let movimientos = 0;
  pasarela.reembolsar = async () => { movimientos += 1; return { id: 'devolucion-anunciante', status: 'approved', amount: 100 }; };
  disponibilidad.liberarReserva = async () => { throw new Error('Fallo de calendario después del ingreso'); };
  await assert.rejects(operacionesReembolso.ejecutar(reembolso.id, 3), /Fallo de calendario/);
  assert.equal((await reservas.obtenerReserva(reserva.id)).cancelada, false);
  assert.equal((await reembolsos.buscar(reembolso.id)).aplicado_en, null);
  disponibilidad.liberarReserva = async () => {};
  const aplicado = await operacionesReembolso.aplicarReembolsoConfirmado(reembolso.id);
  assert.equal(aplicado.reserva.cancelada, true);
  assert.ok(aplicado.reembolso.aplicado_en);
  assert.equal(movimientos, 1);
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
  const { reserva } = await escenario(fechaEnDias(1));
  const solicitud = await cancelaciones.solicitar(reserva.id, { motivo: 'Cambio de planes', aceptaTerminos: true }, 1);
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
  assert.equal(liquidacion.estado, 'EN_REVISION');
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
  const avisos = [];
  reclamos.notificaciones = { avisarCambio: async (...args) => avisos.push(args) };
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
  await reclamos.enviarMensaje(reclamo.id, { texto: 'Otra nota privada', visible_para: 'ADMIN' }, 3, true);
  assert.equal(avisos.length, 0);
  await reclamos.enviarMensaje(reclamo.id, { texto: 'Respuesta pública' }, 3, true);
  assert.equal(avisos.length, 1);
  assert.deepEqual(avisos[0][1], ['inquilino', 'anunciante']);
  assert.doesNotMatch(avisos[0][3], /Respuesta pública/);
});

for (const [dias, porcentaje] of [[7, 100], [2, 50], [1, 0]]) {
  test(`cancelar con ${dias} días de anticipación aplica ${porcentaje}% de devolución`, async () => {
    const { reserva } = await escenario(fechaEnDias(dias));
    const solicitud = await cancelaciones.solicitar(reserva.id, { motivo: 'Cambio de planes', aceptaTerminos: true }, 1);
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

function reclamosConAvisos() {
  const avisos = [];
  const servicio = new ReclamosService(
    new ReclamosRepository(source.getRepository(Reclamo), source.getRepository(ReclamoEvidencia), source.getRepository(ReclamoMensaje)),
    reservas, reembolsos, {}, catalogosDePrueba(),
    { avisarCambio: async (_reserva, destinos, asunto, mensaje) => { avisos.push({ destinos, asunto, mensaje }); } },
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

test('T47: se puede reclamar durante la estadía sin código, con el código validado o bloqueado', async () => {
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

test('T47: el reclamo respeta el período de la estadía hasta el día anterior al pago (T35)', async (t) => {
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

test('T47: no se abre un reclamo sobre una liquidación ya pagada y no se pisa su estado', async () => {
  const reserva = await reservaParaReclamo({ codigo_validado_en: new Date() }, { estado: 'PAGADO_PROPIETARIO' });
  await assert.rejects(reclamoAbierto(reserva), (error) => {
    assert.equal(error.getStatus(), 409);
    assert.match(error.message, /ya fue resuelta/);
    return true;
  });
  assert.equal((await liquidacionDe(reserva)).estado, 'PAGADO_PROPIETARIO');
  assert.equal(await source.getRepository(Reclamo).count(), 0);
});

test('T47: la respuesta de la reserva informa el fin del plazo de reclamos', async () => {
  const reserva = await reservaParaReclamo({ fecha_fin: '2099-01-28' });
  const respuesta = reservas.prepararRespuesta(await reservas.obtenerReserva(reserva.id));
  assert.equal(respuesta.fin_plazo_reclamo, '2099-02-01');
  assert.equal(reservas.finPlazoReclamo({ ...reserva, cancelada: true }), null);
});

test('la devolución total por transferencia deja el reclamo resuelto al decidir y el reembolso pendiente', async () => {
  const { reserva, pago } = await escenario('2026-01-01');
  await source.getRepository(Pago).update(pago.id, { payment_method_id: 'visa' });
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
  await operacionesReembolso.registrarTransferencia(pendiente.id, 'trf-inquilino', comprobantePdf(), 4);
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
  await operacionesReembolso.registrarTransferencia(anterior.id, 'trf-previa', comprobantePdf(), 3);
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
    .overrideProvider(PROVEEDOR_DOLAR).useValue({ consultar: async () => ({ venta: 1200, compra: 1180, actualizadaEn: new Date(), proveedor: 'prueba' }) })
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
    await source.query('UPDATE anunciante SET cbu_validado = $1 WHERE id_usuario = 2', [cbu]);
    const operacionesLiquidacion = app.get(OperacionesLiquidacionService);
    const correosDeLiquidacion = () => correos.filter(({ content }) => content.subject === 'Liquidación disponible para pago manual');
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
    await request(http).patch(rutaLiquidacion).set('Authorization', admin)
      .send({ estado: 'PAGADO_PROPIETARIO', referencia: 'pago-anticipado' }).expect(409);
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
    await request(http).get(consultaCbu).set('Authorization', admin).expect(200, { cbu });
    // T47: el plazo de reclamos termina el día anterior a que se habilite el pago (T35).
    const { sumarDiasCalendario } = require('../dist/common/utils/fechas');
    const filaPagable = lista.body.find(fila => fila.id === ingreso.id);
    assert.equal(filaPagable.fin_plazo_reclamo, sumarDiasCalendario(filaPagable.fecha_disponible_pago, -1));
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
    const historialAdministracion = await request(http).get('/reservas/liquidaciones/administracion/historial')
      .set('Authorization', admin).expect(200);
    assert.ok(historialAdministracion.body.some(item => item.reservaId === ingreso.id));
    assert.deepEqual(historialPropio, [{
      id: idPago, reservaId: ingreso.id, publicacion: 'Publicación de prueba', fecha: fechaPago, importe: 100, moneda: 'ARS',
      referencia: 'pago-prueba', observacion: 'Transferencia acreditada',
    }]);
    // T55: el panel del anunciante muestra el mismo pago, una sola vez, y nadie más lo ve.
    const misPagos = '/reservas/liquidaciones/mias';
    await request(http).get(misPagos).expect(401);
    await request(http).get(misPagos).set('Authorization', tenant).expect(200, []);
    await request(http).get(misPagos).set('Authorization', ajeno).expect(200, []);
    await request(http).get(misPagos).set('Authorization', anunciante).expect(200, historialPropio);
    await request(http).patch(rutaLiquidacion).set('Authorization', admin).send({ estado: 'PAGADO_PROPIETARIO', referencia: 'pago-repetido' }).expect(409);
    assert.equal(correos.filter(({ content }) => content.subject === 'Pago al anunciante registrado').length, 1);
    await source.query(`INSERT INTO fecha (fecha,disponible,id_publicacion,id_reserva)
      VALUES ('2099-01-10',false,1,$1)`, [reserva.id]);
    await request(http).get('/disputas/administracion').set('Authorization', admin).expect(404);
    await request(http).patch('/disputas/1/resolver')
      .set('Authorization', admin).send({ resultado: 'GANADA' }).expect(404);
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
        .set('Authorization', tenant).send({ motivo: 'Cambio de planes', aceptaTerminos: true, ...extra }).expect(400);
    }
    await request(http).post(`/reservas/${reserva.id}/cancelacion`)
      .set('Authorization', tenant).send({ motivo: 'Cambio de planes' }).expect(400);
    const solicitud = await request(http).post(`/reservas/${reserva.id}/cancelacion`)
      .set('Authorization', tenant).send({ motivo: 'Cambio de planes', aceptaTerminos: true }).expect(201);
    assert.equal(solicitud.body.estado, 'PENDIENTE');
    assert.equal(Object.hasOwn(solicitud.body, 'ambitoEstado'), false);
    assert.equal(solicitud.body.reserva.id, reserva.id);
    assert.equal(solicitud.body.reserva.estado_estadia, 'CONFIRMADA');
    const enviadas = await request(http).get(rutaCondiciones).set('Authorization', tenant).expect(200);
    assert.deepEqual(enviadas.body.devolucion, condiciones.devolucion);
    const avisosCancelacion = () => correos.filter(({ content }) => content.subject === 'Nueva solicitud de cancelación')
      .map(({ recipients }) => recipients.to[0].address).sort();
    const admins = ['usuario3@example.invalid', 'usuario4@example.invalid'];
    assert.deepEqual(avisosCancelacion(), admins);
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
    assert.deepEqual(avisosCancelacion(), admins);
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
      payment_method_id: 'visa', external_reference: `reserva:${conReclamo.id}`, idempotency_key: 'pago-reclamo-api',
    });
    const { body: abierto } = await request(http).post('/reclamos').set('Authorization', tenant)
      .send({ id_reserva: conReclamo.id, categoria: 'OTRO', descripcion: 'Problema durante la estadía' }).expect(201);
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

    // T38: la cancelación del día anterior conserva el pago y no mueve dinero.
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
      .send({ motivo: 'Cambio de planes', aceptaTerminos: true }).expect(201);
    const resueltaTardia = await request(http).patch(`${rutaTardia}/${enviadaTardia.body.id}`).set('Authorization', admin)
      .send({ decision: 'APROBADA' }).expect(200);
    assert.equal(resueltaTardia.body.reembolso, null);
    assert.equal(resueltaTardia.body.solicitud.estado, 'APROBADA');
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
        .send({ motivo: 'Cambio de planes', aceptaTerminos: true }).expect(400);
      assert.match(rechazoInicio.body.message, /estadía ya comenzó/);
      assert.equal(await source.getRepository(SolicitudCancelacion).count(), 0);
    }

    // T39: el anunciante devuelve el total si solicita cancelar antes del ingreso.
    for (const dias of [7, 1, 0, -1]) {
      await db.exec('TRUNCATE reserva RESTART IDENTITY CASCADE');
      const { reserva: delAnunciante, pago: pagoDelAnunciante } = await escenario(fechaEnDias(dias));
      await source.getRepository(Pago).update(pagoDelAnunciante.id, { payment_id: '123' });
      await source.getRepository(Reserva).update(delAnunciante.id, { codigo_alojamiento: '12345678', codigo_generado_en: new Date() });
      await source.query('INSERT INTO fecha (fecha,disponible,id_publicacion,id_reserva) VALUES ($1,false,1,$2)', [delAnunciante.fecha_inicio, delAnunciante.id]);
      const rutaAnunciante = `/reservas/${delAnunciante.id}/cancelacion`;
      await request(http).get(`${rutaAnunciante}/condiciones`).set('Authorization', ajeno).expect(403);
      await request(http).post(rutaAnunciante).set('Authorization', ajeno)
        .send({ motivo: 'Problema en la propiedad', aceptaTerminos: true }).expect(403);
      await request(http).post(rutaAnunciante).set('Authorization', anunciante)
        .send({ motivo: 'Problema en la propiedad', aceptaTerminos: true, actor: 'ANUNCIANTE' }).expect(400);
      const condicionesAnunciante = await request(http).get(`${rutaAnunciante}/condiciones`).set('Authorization', anunciante).expect(200);
      if (dias <= 0) {
        assert.match(condicionesAnunciante.body.motivoBloqueo, /Desde la fecha de ingreso/);
        assert.equal(condicionesAnunciante.body.devolucion, null);
        await request(http).post(rutaAnunciante).set('Authorization', anunciante)
          .send({ motivo: 'Problema en la propiedad', aceptaTerminos: true }).expect(400);
        assert.equal(await source.getRepository(SolicitudCancelacion).count(), 0);
        continue;
      }
      assert.equal(condicionesAnunciante.body.motivoBloqueo, null);
      assert.equal(condicionesAnunciante.body.devolucion.porcentaje, 100);
      assert.equal(condicionesAnunciante.body.devolucion.importe, 100);
      const enviadaAnunciante = await request(http).post(rutaAnunciante).set('Authorization', anunciante)
        .send({ motivo: 'Problema en la propiedad', aceptaTerminos: true }).expect(201);
      assert.equal(enviadaAnunciante.body.solicitante.id, 2);
      const resueltaAnunciante = await request(http).patch(`${rutaAnunciante}/${enviadaAnunciante.body.id}`).set('Authorization', admin)
        .send({ decision: 'APROBADA' }).expect(200);
      assert.equal(Number(resueltaAnunciante.body.reembolso.importe), 100);
      assert.equal(resueltaAnunciante.body.reembolso.tipo, 'TOTAL');
      await request(http).patch(`/reservas/${delAnunciante.id}/validar-codigo`).set('Authorization', anunciante)
        .send({ codigo: '12345678' }).expect(409);
      await request(http).patch(`/reservas/reembolsos/${resueltaAnunciante.body.reembolso.id}/ejecutar`).set('Authorization', admin).send({}).expect(200);
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
    const solicitudAntesDelCodigo = await request(http).post(rutaValidada).set('Authorization', anunciante)
      .send({ motivo: 'Problema en la propiedad', aceptaTerminos: true }).expect(201);
    await source.getRepository(Reserva).update(ingresoValidado.id, { fecha_inicio: fechaEnDias(0) });
    await request(http).patch(`/reservas/${ingresoValidado.id}/validar-codigo`).set('Authorization', anunciante)
      .send({ codigo: '12345678' }).expect(200);
    const vencidaPorCodigo = await request(http).patch(`${rutaValidada}/${solicitudAntesDelCodigo.body.id}`).set('Authorization', admin)
      .send({ decision: 'APROBADA' }).expect(409);
    assert.match(vencidaPorCodigo.body.message, /código de ingreso fue validado/);
    assert.equal((await solicitudActual(solicitudAntesDelCodigo.body.id)).estado, 'VENCIDA');
    await request(http).post(rutaValidada).set('Authorization', anunciante)
      .send({ motivo: 'Segundo pedido de cancelación', aceptaTerminos: true }).expect(400);
    const bloqueadaPorCodigo = await request(http).get(`${rutaValidada}/condiciones`).set('Authorization', anunciante).expect(200);
    assert.match(bloqueadaPorCodigo.body.motivoBloqueo, /Desde la fecha de ingreso/);
    assert.equal(bloqueadaPorCodigo.body.devolucion, null);
    assert.equal(await source.getRepository(Reembolso).count(), 0);
  } finally { await app.close(); }
});
