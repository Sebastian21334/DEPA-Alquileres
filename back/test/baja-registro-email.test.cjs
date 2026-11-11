require('reflect-metadata');
const assert = require('node:assert/strict');
const { test, before, beforeEach, after } = require('node:test');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { Test } = require('@nestjs/testing');
const { ConfigModule, ConfigService } = require('@nestjs/config');
const { TypeOrmModule } = require('@nestjs/typeorm');
const { DataSource } = require('typeorm');
const { JwtService } = require('@nestjs/jwt');
const { ValidationPipe } = require('@nestjs/common');
const request = require('supertest');
const { crearPostgresPruebas } = require('./soporte/postgres-pruebas.cjs');
const { AuthModule } = require('../dist/auth/auth.module');
const { MAIL_SERVICE } = require('../dist/mail/mail.interface');
const { CLIENTE_CORREO } = require('../dist/mail/repository/cliente-correo.interface');
const { Usuario } = require('../dist/usuarios/entity/usuario.entity');
const { Rol } = require('../dist/catalogos/entity/rol.entity');
const { Reserva } = require('../dist/reservas/entity/reserva.entity');
const { Pago } = require('../dist/pagos/entity/pago.entity');

let base, source, app, admin;
const enviados = [];
const datos = {
  nombre: 'Inquilino', apellido: 'Prueba', telefono: '3515550123',
  email: 'cuenta@example.com', contrasenia: 'ContraseniaDePrueba123!',
};
const servidor = () => app.getHttpServer();
const usuarios = () => source.getRepository(Usuario);
const tokenCorreo = () => enviados.at(-1).token;
const registrar = () => request(servidor()).post('/auth/register').send(datos).expect(201);
const verificar = token => request(servidor()).post('/auth/verificar-cuenta').send({ token });
const login = () => request(servidor()).post('/auth/login')
  .send({ email: datos.email, contrasenia: datos.contrasenia });

before(async () => {
  base = await crearPostgresPruebas();
  source = base.source;
  await base.cargarSeed();
  const ajustes = {
    JWT_SECRET: 'secreto-exclusivo-pruebas-baja-registro',
    FRONTEND_URLS: 'http://localhost:4200', ACS_SENDER_ADDRESS: 'prueba@example.com',
  };
  const config = {
    get: clave => ajustes[clave],
    getOrThrow: clave => {
      if (!ajustes[clave]) throw new Error(`Configuración de prueba ausente: ${clave}`);
      return ajustes[clave];
    },
  };
  const modulo = await Test.createTestingModule({ imports: [
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
    TypeOrmModule.forRoot(source.options), AuthModule,
  ] })
    .overrideProvider(DataSource).useValue(source)
    .overrideProvider(ConfigService).useValue(config)
    .overrideProvider(CLIENTE_CORREO).useValue({})
    .overrideProvider(MAIL_SERVICE).useValue({
      enviarVerificacion: async (email, token) => enviados.push({ email, token }),
    })
    .compile();
  app = modulo.createNestApplication({ logger: false });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.init();
});

beforeEach(async () => {
  await source.query('TRUNCATE usuario RESTART IDENTITY CASCADE');
  enviados.length = 0;
  const rolAdministrador = await source.getRepository(Rol).findOneByOrFail({ nombre: 'Administrador' });
  admin = await usuarios().save({
    nombre: 'Admin', apellido: 'Prueba', email: 'admin@example.com',
    telefono: '123', contrasenia: 'no-utilizada-en-estas-pruebas',
    rol: rolAdministrador, email_verificado: true,
  });
});

after(async () => {
  try { if (app) await app.close(); }
  finally { if (base) await base.cerrar(); }
});

for (const via of ['propia', 'administrativa']) {
  for (const conHistorial of [false, true]) {
    test(`baja ${via}, ${conHistorial ? 'con reservas terminadas' : 'sin reservas'}: conserva historial y permite registro, verificación y login con el mismo mail`, async () => {
      await registrar();
      const primerToken = tokenCorreo();
      await verificar(primerToken).expect(201);
      const anterior = await usuarios().findOneByOrFail({ email: datos.email });
      assert.equal((await usuarios().findOne({ where: { id: anterior.id }, relations: { rol: true } })).rol.nombre, 'Inquilino');
      const sesionAnterior = (await login().expect(201)).body.access_token;
      await usuarios().update(anterior.id, {
        token_recuperacion: 'recuperacion-cuenta-anterior',
        token_recuperacion_expira: new Date(Date.now() + 3600000),
      });

      let reserva;
      if (conHistorial) {
        reserva = await source.getRepository(Reserva).save({
          usuario: anterior, monto_pago: 100, estado_pago: 'APROBADO',
          finalizada: true, fecha_inicio: '2000-01-01', fecha_fin: '2000-01-03',
          estado_liquidacion: 'PAGADO_PROPIETARIO', codigo_validado_en: new Date('2000-01-01'),
        });
        await source.getRepository(Pago).save({
          reserva, status: 'approved', amount: 100, currency: 'ARS',
          external_reference: 'reserva-historica', payment_id: 'pago-historico',
          idempotency_key: 'pago-historico',
        });
      }

      const tokenBaja = via === 'propia' ? sesionAnterior : app.get(JwtService).sign({ sub: admin.id });
      await request(servidor()).delete(via === 'propia' ? '/usuarios/me' : `/usuarios/${anterior.id}`)
        .set('Authorization', `Bearer ${tokenBaja}`).expect(200);

      const baja = await usuarios().createQueryBuilder('u')
        .addSelect(['u.token_verificacion', 'u.token_recuperacion', 'u.token_recuperacion_expira'])
        .where('u.id = :id', { id: anterior.id }).getOneOrFail();
      assert.equal(baja.activa, false);
      assert.equal(baja.email, null);
      assert.equal(baja.email_historico, datos.email);
      assert.ok(baja.fecha_baja);
      assert.equal(baja.token_verificacion, null);
      assert.equal(baja.token_recuperacion, null);
      assert.equal(baja.token_recuperacion_expira, null);
      await request(servidor()).get('/usuarios/me').set('Authorization', `Bearer ${sesionAnterior}`).expect(401);

      // Incluso con el JWT anterior adjunto, el registro público debe funcionar.
      await request(servidor()).post('/auth/register').set('Authorization', `Bearer ${sesionAnterior}`).send(datos).expect(201);
      const nuevoToken = tokenCorreo();
      assert.notEqual(nuevoToken, primerToken);
      const nueva = await usuarios().findOneByOrFail({ email: datos.email });
      assert.notEqual(nueva.id, anterior.id);
      assert.equal(nueva.activa, true);
      assert.equal(nueva.email_verificado, false);
      await verificar(primerToken).expect(400);
      assert.equal((await usuarios().findOneByOrFail({ id: nueva.id })).email_verificado, false);
      await verificar(nuevoToken).expect(201);
      await verificar(nuevoToken).expect(400); // El enlace se consume una sola vez.
      const sesionNueva = (await login().expect(201)).body.access_token;
      const perfil = await request(servidor()).get('/usuarios/me').set('Authorization', `Bearer ${sesionNueva}`).expect(200);
      assert.equal(perfil.body.id, nueva.id);
      await request(servidor()).get('/usuarios/me').set('Authorization', `Bearer ${sesionAnterior}`).expect(401);
      assert.equal(await usuarios().count(), 3); // Admin + cuenta histórica + cuenta nueva.
      if (reserva) {
        const historica = await source.getRepository(Reserva).findOneOrFail({ where: { id: reserva.id }, relations: { usuario: true } });
        assert.equal(historica.usuario.id, anterior.id);
        assert.equal(await source.getRepository(Reserva).countBy({ usuario: { id: nueva.id } }), 0);
      }
    });
  }
}

test('un enlace sin consumir de una cuenta dada de baja no verifica la nueva cuenta con el mismo mail', async () => {
  await registrar();
  const tokenAnterior = tokenCorreo();
  const anterior = await usuarios().findOneByOrFail({ email: datos.email });
  await request(servidor()).delete(`/usuarios/${anterior.id}`)
    .set('Authorization', `Bearer ${app.get(JwtService).sign({ sub: admin.id })}`).expect(200);
  await registrar();
  const tokenNuevo = tokenCorreo();
  await verificar(tokenAnterior).expect(400);
  assert.equal((await usuarios().findOneByOrFail({ email: datos.email })).email_verificado, false);
  await verificar(tokenNuevo).expect(201);
  await login().expect(201);
});

test('la migración libera también el mail de cuentas dadas de baja antes de este cambio', async () => {
  const historica = await usuarios().save({ ...datos, activa: false, rol: { id: 2 } });
  await base.db.exec(readFileSync(path.join(__dirname, '../migrations/20261104-cuit-email-historicos.sql'), 'utf8'));
  const migrada = await usuarios().findOneByOrFail({ id: historica.id });
  assert.equal(migrada.email, null);
  assert.equal(migrada.email_historico, datos.email);
  await registrar();
  await verificar(tokenCorreo()).expect(201);
  await login().expect(201);
});
