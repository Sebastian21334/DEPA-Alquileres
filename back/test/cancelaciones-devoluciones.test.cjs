require('reflect-metadata');
const assert = require('node:assert/strict');
const { test, before, beforeEach, after } = require('node:test');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { DataSource } = require('typeorm');
const { crearPostgresPruebas } = require('./soporte/postgres-pruebas.cjs');
const { Reserva } = require('../dist/reservas/entity/reserva.entity');
const { EstadoPagoReserva, EstadoReembolso } = require('../dist/catalogos/estados');
const { Pago } = require('../dist/pagos/entity/pago.entity');
const { PagosRegistroService } = require('../dist/pagos/service/pagos-registro.service');
const { PagosRepository } = require('../dist/pagos/repository/pagos.repository');
const { Reembolso, OrigenReembolso, TipoReembolso } = require('../dist/reembolsos/entity/reembolso.entity');
const { ReembolsosService } = require('../dist/reembolsos/service/reembolsos.service');
const { ReembolsosRepository } = require('../dist/reembolsos/repository/reembolsos.repository');
const { ReservasService } = require('../dist/reservas/service/reservas.service');
const { ReservaRepository } = require('../dist/reservas/repository/reserva.repository');
const { ReservaEstadoService } = require('../dist/reservas-consulta/service/reserva-estado.service');
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
let reembolsos, reservas, reclamos, pasarela, automatico;

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
});

beforeEach(async () => {
  await db.exec('TRUNCATE reserva RESTART IDENTITY CASCADE');
  automatico = false;
  pasarela = { reembolsar: async () => ({ id: 'mp-refund-1', status: 'approved' }) };
  const estadoReserva = new ReservaEstadoService(new PublicacionesService({}, new CatalogosService()));
  reembolsos = new ReembolsosService(
    new ReembolsosRepository(source.getRepository(Reembolso)),
    pasarela, { get: () => String(automatico) },
    new PagosRegistroService(new PagosRepository(source.getRepository(Pago))),
    estadoReserva,
  );
  const repositorio = new ReservaRepository(source.getRepository(Reserva));
  reservas = new ReservasService({}, repositorio,
    { liberarReserva: async () => {} }, {}, {}, {}, reembolsos, estadoReserva);
  reclamos = new ReclamosService(
    new ReclamosRepository(source.getRepository(Reclamo), source.getRepository(ReclamoEvidencia),
      source.getRepository(ReclamoMensaje)),
    reservas, reembolsos, {},
  );
});

after(async () => {
  if (base) await base.cerrar();
});

async function escenario(fechaInicio = '2099-01-10') {
  const reserva = await source.getRepository(Reserva).save({
    monto_pago: 100, estado_pago: EstadoPagoReserva.APROBADO,
    usuario: { id: 1 }, publicacion: { id: 1 }, fecha_inicio: fechaInicio, fecha_fin: '2099-01-20',
  });
  const pago = await source.getRepository(Pago).save({
    reserva, amount: 100, currency: 'ARS', status: 'approved',
    payment_id: 'mp-1', external_reference: 'reserva-prueba', idempotency_key: 'clave-pago-prueba',
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
  assert.equal((await reembolsos.registrarManual(reembolso.id, 'comprobante-1', 3)).estado, EstadoReembolso.APROBADO);
  await reembolsos.registrarManual(reembolso.id, 'comprobante-1', 3);
  const actual = await source.getRepository(Pago).findOneByOrFail({ id: pago.id });
  assert.equal(Number(actual.amount_refunded), 100);
  assert.equal(actual.status, 'refunded');
});

test('el reembolso automático usa el identificador del pago relacionado', async () => {
  const { crearReembolso } = await escenario();
  const reembolso = await crearReembolso();
  automatico = true;
  pasarela.reembolsar = async (id, importe) => {
    assert.equal(id, 'mp-1'); assert.equal(importe, 100);
    return { id: 'mp-refund-1', status: 'approved' };
  };
  assert.equal((await reembolsos.ejecutar(reembolso.id, 3)).estado, EstadoReembolso.APROBADO);
});

test('un reembolso externo pendiente no se registra como dinero devuelto', async () => {
  const { pago, crearReembolso } = await escenario();
  const reembolso = await crearReembolso();
  automatico = true;
  pasarela.reembolsar = async () => ({ id: 'mp-pendiente', status: 'pending' });
  await reembolsos.ejecutar(reembolso.id, 3);
  const actual = await reembolsos.buscar(reembolso.id);
  assert.equal(actual.estado, EstadoReembolso.EN_PROCESO);
  assert.equal(actual.id_externo, 'mp-pendiente');
  assert.equal(Number((await source.getRepository(Pago).findOneByOrFail({ id: pago.id })).amount_refunded), 0);
});

test('no aplica a la reserva un reembolso que todavía no fue confirmado', async () => {
  const { reserva, crearReembolso } = await escenario();
  const reembolso = await crearReembolso();
  await assert.rejects(reservas.aplicarReembolsoConfirmado(reembolso.id), /confirmado|aprobado/i);
  assert.equal((await source.getRepository(Reserva).findOneByOrFail({ id: reserva.id })).estado_pago, 'APROBADO');
});

test('la operación administrativa no informa éxito con una devolución externa pendiente', async () => {
  const { crearReembolso } = await escenario();
  const reembolso = await crearReembolso();
  automatico = true;
  pasarela.reembolsar = async () => ({ id: 'mp-pendiente', status: 'pending' });
  await assert.rejects(reembolsos.registrarOejecutar(reembolso.id, undefined, 3), /no fue confirmado/i);
  assert.equal((await reembolsos.buscar(reembolso.id)).estado, EstadoReembolso.EN_PROCESO);
});

test('la cancelación aprobada conserva la reserva hasta confirmar la devolución', async () => {
  const { reserva } = await escenario();
  const solicitud = await reservas.solicitarCancelacion(reserva.id, { motivo: 'Cambio de planes' }, 1);
  const resultado = await reservas.resolverSolicitudCancelacion(reserva.id, solicitud.id, { decision: 'APROBADA' }, 3);
  assert.equal(Number(resultado.reembolso.importe), 100);
  assert.equal((await source.getRepository(Reserva).findOneByOrFail({ id: reserva.id })).cancelada, false);
  await reservas.registrarReembolsoManual(resultado.reembolso.id, 'comprobante-cancelacion', 3);
  const actual = await source.getRepository(Reserva).findOneByOrFail({ id: reserva.id });
  assert.equal(actual.cancelada, true);
  assert.equal(actual.estado_pago, 'REEMBOLSADO');
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

test('resolver un reclamo manual exige comprobante antes de crear el reembolso', async () => {
  const { reserva } = await escenario('2026-01-01');
  const reclamo = await source.getRepository(Reclamo).save({
    reserva, inquilino: { id: 1 }, anunciante: { id: 2 }, categoria: 'OTRO', descripcion: 'Reclamo de prueba',
  });
  await assert.rejects(reclamos.resolver(reclamo.id, { resolucion: ResolucionReclamo.DEVOLUCION_TOTAL }, 3), /referencia|comprobante/i);
  assert.equal(await source.getRepository(Reembolso).count(), 0);
});

test('resolver una liquidación manual exige comprobante antes de crear el reembolso', async () => {
  const { ReservaLiquidacionesService } = require('../dist/reservas/service/reserva-liquidaciones.service');
  const { reserva } = await escenario();
  const repositorio = new ReservaRepository(source.getRepository(Reserva));
  const liquidaciones = new ReservaLiquidacionesService(
    repositorio, {}, reembolsos, reservas,
  );
  await assert.rejects(liquidaciones.resolverLiquidacion(reserva.id, { estado: 'DEVUELTO_INQUILINO' }, 3), /referencia|comprobante/i);
  assert.equal(await source.getRepository(Reembolso).count(), 0);
});

for (const [dias, porcentaje] of [[7, 100], [2, 50], [1, 0]]) {
  test(`cancelar con ${dias} días de anticipación aplica ${porcentaje}% de devolución`, async () => {
    const { fechaArgentina } = require('../dist/common/utils/fechas');
    const { reserva } = await escenario(fechaArgentina(new Date(Date.now() + dias * 86400000)));
    const solicitud = await reservas.solicitarCancelacion(reserva.id, { motivo: 'Cambio de planes' }, 1);
    const resultado = await reservas.resolverSolicitudCancelacion(reserva.id, solicitud.id, { decision: 'APROBADA' }, 3);
    if (porcentaje > 0) assert.equal(Number(resultado.reembolso.importe), porcentaje);
    else {
      assert.equal(resultado.reembolso, null);
      assert.equal((await source.getRepository(Reserva).findOneByOrFail({ id: reserva.id })).cancelada, true);
    }
  });
}

test('resolver un reclamo con devolución parcial conserva la estadía y registra el importe', async () => {
  const { reserva, pago } = await escenario('2026-01-01');
  const reclamo = await reclamos.crear({ id_reserva: reserva.id, categoria: 'OTRO', descripcion: 'Problema durante la estadía' }, 1);
  const resultado = await reclamos.resolver(reclamo.id, {
    resolucion: ResolucionReclamo.DEVOLUCION_PARCIAL, importe: 40, referencia: 'comprobante-reclamo',
  }, 3);
  assert.equal(resultado.estado, 'RESUELTO_INQUILINO');
  assert.equal(Number((await source.getRepository(Pago).findOneByOrFail({ id: pago.id })).amount_refunded), 40);
  const actual = await source.getRepository(Reserva).findOneByOrFail({ id: reserva.id });
  assert.equal(actual.estado_pago, 'APROBADO');
  assert.equal(actual.cancelada, false);
  assert.equal(actual.estado_liquidacion, 'DEVUELTO_PARCIAL_INQUILINO');
});

for (const resultado of ['GANADA', 'PERDIDA']) {
  test(`el contracargo ${resultado} integra la disputa, el pago y la reserva sin duplicaciones`, async () => {
    const { Disputa } = require('../dist/disputas/entity/disputa.entity');
    const { DisputasService } = require('../dist/disputas/service/disputas.service');
    const { DisputasRepository } = require('../dist/disputas/repository/disputas.repository');
    const { PagosRepository } = require('../dist/pagos/repository/pagos.repository');
    const { CatalogosService } = require('../dist/catalogos/service/catalogos.service');
    const { Estado } = require('../dist/catalogos/entity/estado.entity');
    const { reserva, pago } = await escenario();
    const estados = source.getRepository(Estado);
    const catalogos = new CatalogosService({
      buscarEstadoPorCodigo: (codigoAmbito, codigo) => estados.findOneBy({ codigoAmbito, codigo }),
    });
    const disputasRepo = new DisputasRepository(source.getRepository(Disputa));
    const pagos = new PagosRegistroService(new PagosRepository(source.getRepository(Pago)));
    const disputas = new DisputasService(disputasRepo, pagos, reembolsos, reservas, catalogos);
    const datos = { idReserva: reserva.id, idPago: pago.id, chargebackId: 'contracargo-prueba', importe: 100 };
    const disputa = await disputas.registrarContracargo(datos);
    assert.equal(disputa.estado.codigo, 'ABIERTA');
    await disputas.registrarContracargo(datos);
    assert.equal(await source.getRepository(Disputa).count(), 1);
    assert.equal((await source.getRepository(Reserva).findOneByOrFail({ id: reserva.id })).estado_pago, 'CONTRACARGO');
    assert.equal((await disputas.listarAdministracion())[0].estado, 'ABIERTA');
    assert.equal((await disputas.resolver(disputa.id, { resultado }, 3)).estado, resultado);
    assert.equal((await disputasRepo.buscarPorId(disputa.id)).estado.codigo, resultado);
    const actual = await source.getRepository(Reserva).findOneByOrFail({ id: reserva.id });
    assert.equal(actual.estado_pago, resultado === 'GANADA' ? 'APROBADO' : 'REEMBOLSADO');
    assert.equal(actual.cancelada, resultado === 'PERDIDA');
    assert.equal(Number((await source.getRepository(Pago).findOneByOrFail({ id: pago.id })).amount_refunded), resultado === 'GANADA' ? 0 : 100);
  });
}

test('la API integra módulos, permisos, cancelación y devolución manual', async () => {
  const { Test } = require('@nestjs/testing');
  const { ConfigModule, ConfigService } = require('@nestjs/config');
  const { TypeOrmModule } = require('@nestjs/typeorm');
  const { JwtService } = require('@nestjs/jwt');
  const { ValidationPipe } = require('@nestjs/common');
  const request = require('supertest');
  const { AuthModule } = require('../dist/auth/auth.module');
  const { PagosModule } = require('../dist/pagos/pagos.module');
  const { ReclamosModule } = require('../dist/reclamos/reclamos.module');
  const { DisputasService } = require('../dist/disputas/service/disputas.service');
  const { Estado } = require('../dist/catalogos/entity/estado.entity');
  const { CLIENTE_CORREO } = require('../dist/mail/repository/cliente-correo.interface');
  const { PROVEEDOR_DOLAR } = require('../dist/cotizaciones/proveedor/proveedor-dolar.interface');
  const ajustes = { JWT_SECRET: 'secreto-exclusivo-pruebas-integracion', FRONTEND_URLS: 'http://localhost:4200', ACS_SENDER_ADDRESS: 'pruebas@example.invalid' };
  const config = { get: clave => ajustes[clave], getOrThrow: clave => {
    if (!ajustes[clave]) throw new Error(`Configuración de prueba ausente: ${clave}`);
    return ajustes[clave];
  } };
  const modulo = await Test.createTestingModule({ imports: [
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
    TypeOrmModule.forRoot(source.options), AuthModule, PagosModule, ReclamosModule,
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
    const tenant = `Bearer ${token(1)}`, admin = `Bearer ${token(3)}`;
    const { reserva, pago } = await escenario();
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
    const solicitud = await request(http).post(`/reservas/${reserva.id}/cancelacion`)
      .set('Authorization', tenant).send({ motivo: 'Cambio de planes' }).expect(201);
    assert.equal(solicitud.body.estado, 'PENDIENTE');
    assert.equal(Object.hasOwn(solicitud.body, 'ambitoEstado'), false);
    const resultado = await request(http).patch(`/reservas/${reserva.id}/cancelacion/${solicitud.body.id}`)
      .set('Authorization', admin).send({ decision: 'APROBADA' }).expect(200);
    assert.equal((await source.query('SELECT disponible FROM fecha WHERE id_reserva=$1', [reserva.id]))[0].disponible, false);
    await request(http).patch(`/reservas/reembolsos/${resultado.body.reembolso.id}/manual`)
      .set('Authorization', admin).send({ referencia: 'comprobante-api' }).expect(200);
    const final = await request(http).get(`/reservas/${reserva.id}`).set('Authorization', tenant).expect(200);
    assert.equal(final.body.cancelada, true);
    assert.equal(final.body.estado_pago, 'REEMBOLSADO');
    const [dia] = await source.query("SELECT disponible,id_reserva FROM fecha WHERE fecha='2099-01-10'");
    assert.equal(dia.disponible, true);
    assert.equal(dia.id_reserva, null);
  } finally { await app.close(); }
});
