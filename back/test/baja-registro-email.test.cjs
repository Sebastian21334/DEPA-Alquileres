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
const { CORREO_REPOSITORY } = require('../dist/mail/repository/correo.repository.interface');
const { CLIENTE_CORREO } = require('../dist/mail/proveedor/cliente-correo.interface');
const { Usuario } = require('../dist/usuarios/entity/usuario.entity');
const { Rol } = require('../dist/catalogos/entity/rol.entity');
const { Reserva } = require('../dist/reservas/entity/reserva.entity');
const { Pago } = require('../dist/pagos/entity/pago.entity');
const { Anunciante } = require('../dist/anunciantes/entity/anunciante.entity');

let base, source, app, admin, fallaEnvioBaja, fallaEnvioReactivacion;
const enviados = [];
const frontendPublicado = 'https://depa.example.com';
const frontendLocal = 'http://localhost:4200';
const accionesCorreo = {
  '/verificar-cuenta': 'verificacion',
  '/confirmar-baja': 'baja',
  '/reactivar-cuenta': 'reactivacion',
};
const datos = {
  nombre: 'Inquilino', apellido: 'Prueba', telefono: '3515550123',
  email: 'cuenta@example.com', contrasenia: 'ContraseniaDePrueba123!',
  aceptaTerminos: true,
};
const servidor = () => app.getHttpServer();
const usuarios = () => source.getRepository(Usuario);
const tokenCorreo = () => enviados.at(-1).token;
const registro = cambios => request(servidor()).post('/auth/register').send({ ...datos, ...cambios });
const registrar = () => registro().expect(201);
const verificar = token => request(servidor()).post('/auth/verificar-cuenta').send({ token });
const solicitarBaja = sesion => request(servidor()).post('/usuarios/me/baja').set('Authorization', `Bearer ${sesion}`);
const confirmarBaja = token => request(servidor()).post('/usuarios/baja/confirmar').send({ token });
const solicitarReactivacion = (email = datos.email, constanciaReactivacion) =>
  request(servidor()).post('/auth/reactivar-cuenta/solicitar').send({ email, constanciaReactivacion });
const confirmarReactivacion = (token, contrasenia = datos.contrasenia) =>
  request(servidor()).post('/auth/reactivar-cuenta/confirmar').send({ token, contrasenia });
const login = () => request(servidor()).post('/auth/login')
  .send({ email: datos.email, contrasenia: datos.contrasenia });

before(async () => {
  base = await crearPostgresPruebas();
  source = base.source;
  await base.cargarSeed();
  const ajustes = {
    JWT_SECRET: 'secreto-exclusivo-pruebas-baja-registro',
    FRONTEND_URLS: `${frontendPublicado}, ${frontendLocal}`, ACS_SENDER_ADDRESS: 'prueba@example.com',
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
    .overrideProvider(CORREO_REPOSITORY).useValue({
      enviar: async ({ destinatario, html }) => {
        const enlace = [...html.matchAll(/href="([^"]+)"/g)]
          .map(([, href]) => new URL(href))
          .find((url) => Object.hasOwn(accionesCorreo, url.pathname));
        assert.ok(enlace, 'El correo debe incluir un enlace de cuenta');
        const tipo = accionesCorreo[enlace.pathname];
        if (tipo === 'baja' && fallaEnvioBaja) throw new Error('Correo no disponible');
        if (tipo === 'reactivacion' && fallaEnvioReactivacion) throw new Error('Correo no disponible');
        const token = enlace.searchParams.get('token') ?? decodeURIComponent(enlace.hash.slice(1));
        enviados.push({ email: destinatario, token, tipo, origen: enlace.origin });
      },
    })
    .compile();
  app = modulo.createNestApplication({ logger: false });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.init();
});

beforeEach(async () => {
  await source.query('TRUNCATE usuario RESTART IDENTITY CASCADE');
  enviados.length = 0;
  fallaEnvioBaja = false;
  fallaEnvioReactivacion = false;
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

test('el registro rechaza nombres o teléfonos inválidos antes de crear la cuenta', async () => {
  for (const cambios of [
    { nombre: 'José2' },
    { apellido: 'Muñoz_Ávila' },
    { nombre: '   ' },
    { telefono: '+54-351-ABC' },
    { telefono: '54+351-555' },
    { telefono: '351--555' },
    { telefono: '+1234567890123456' },
    { telefono: '+1-2-3-456-789-012345' },
  ]) {
    const respuesta = await registro(cambios).expect(400);
    const campo = Object.keys(cambios)[0];
    assert.ok(respuesta.body.message.some(mensaje => mensaje.toLowerCase().includes(
      campo === 'telefono' ? 'teléfono' : campo,
    )));
  }
  assert.equal(await usuarios().findOneBy({ email: datos.email }), null);
  assert.equal(enviados.length, 0);
});

test('el registro acepta nombres con acentos y un teléfono con 15 dígitos y 20 caracteres', async () => {
  const datosValidos = { nombre: 'José María', apellido: 'Muñoz de Ávila', telefono: '+12-345-678-901-2345' };
  await registro(datosValidos).expect(201);
  const cuenta = await usuarios().findOneByOrFail({ email: datos.email });
  assert.equal(cuenta.nombre, datosValidos.nombre);
  assert.equal(cuenta.apellido, datosValidos.apellido);
  assert.equal(cuenta.telefono, datosValidos.telefono);
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

      if (via === 'propia') {
        await request(servidor()).delete('/usuarios/me').set('Authorization', `Bearer ${sesionAnterior}`).expect(403);
        await solicitarBaja(sesionAnterior).expect(201);
        assert.equal(enviados.at(-1).email, datos.email);
        const enlace = tokenCorreo();
        assert.equal(app.get(JwtService).decode(enlace).esAnunciante, false);
        await request(servidor()).get('/usuarios/me').set('Authorization', `Bearer ${enlace}`).expect(401);
        await request(servidor()).get('/usuarios/me').set('Authorization', `Bearer ${sesionAnterior}`).expect(200);
        await request(servidor()).get('/usuarios/baja/confirmar').expect(404);
        await confirmarBaja(sesionAnterior).expect(400);
        assert.equal((await usuarios().findOneByOrFail({ id: anterior.id })).activa, true);
        await confirmarBaja(enlace).expect(201);
        await confirmarBaja(enlace).expect(400);
      } else {
        const sesionAdmin = app.get(JwtService).sign({ sub: admin.id });
        await request(servidor()).delete(`/usuarios/${anterior.id}`)
          .set('Authorization', `Bearer ${sesionAdmin}`).expect(200);
      }

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

      const esBajaPropia = via === 'propia';
      if (esBajaPropia) {
        const cantidadCorreos = enviados.length;
        const oferta = await registro().expect(409);
        assert.equal(oferta.body.codigo, 'CUENTA_RECUPERABLE');
        assert.equal(enviados.length, cantidadCorreos);
        assert.equal(await usuarios().count(), 2);
        await solicitarReactivacion().expect(200);
        assert.equal(enviados.at(-1).tipo, 'reactivacion');
      } else {
        const cantidadCorreos = enviados.length;
        await solicitarReactivacion().expect(200);
        assert.equal(enviados.length, cantidadCorreos);
      }
      const enlaceReactivacion = esBajaPropia ? tokenCorreo() : null;
      // Incluso con el JWT anterior adjunto, el registro público debe funcionar.
      await registro(esBajaPropia ? { crearCuentaNueva: true } : undefined)
        .set('Authorization', `Bearer ${sesionAnterior}`).expect(201);
      if (enlaceReactivacion) await confirmarReactivacion(enlaceReactivacion).expect(409);
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

test('el enlace distingue a un anunciante verificado aunque tenga rol de administrador', async () => {
  await source.query('INSERT INTO anunciante (id_usuario, numero_contacto, verificado) VALUES ($1, $2, true)', [admin.id, '123']);
  await solicitarBaja(app.get(JwtService).sign({ sub: admin.id })).expect(201);
  assert.equal(app.get(JwtService).decode(tokenCorreo()).esAnunciante, true);
});

test('el enlace de baja vence y pierde vigencia al cambiar la contraseña', async () => {
  await registrar();
  await verificar(tokenCorreo()).expect(201);
  const usuario = await usuarios().findOneByOrFail({ email: datos.email });
  const sesion = (await login().expect(201)).body.access_token;
  await request(servidor()).post('/usuarios/me/baja').expect(401);
  await solicitarBaja(sesion).expect(201);
  const enlace = tokenCorreo();
  const jwt = app.get(JwtService);
  const { usuarioId, huella, aud } = jwt.decode(enlace);
  const vencido = jwt.sign({ usuarioId, huella }, { audience: aud, expiresIn: -1 });
  await confirmarBaja(vencido).expect(400);
  await usuarios().update(usuario.id, { contrasenia: 'hash-distinto-para-invalidar-el-enlace' });
  await confirmarBaja(enlace).expect(400);
  assert.equal((await usuarios().findOneByOrFail({ id: usuario.id })).activa, true);
});

test('si falla el correo o aparecen operaciones pendientes, la cuenta sigue activa', async () => {
  await registrar();
  await verificar(tokenCorreo()).expect(201);
  const usuario = await usuarios().findOneByOrFail({ email: datos.email });
  const sesion = (await login().expect(201)).body.access_token;
  fallaEnvioBaja = true;
  await solicitarBaja(sesion).expect(503);
  assert.equal((await usuarios().findOneByOrFail({ id: usuario.id })).activa, true);

  fallaEnvioBaja = false;
  await solicitarBaja(sesion).expect(201);
  const enlace = tokenCorreo();
  await source.getRepository(Reserva).save({
    usuario, monto_pago: 100, estado_pago: 'PENDIENTE',
    fecha_inicio: '2099-01-01', fecha_fin: '2099-01-02',
  });
  await confirmarBaja(enlace).expect(409);
  assert.equal((await usuarios().findOneByOrFail({ id: usuario.id })).activa, true);
});

test('la migración libera también el mail de cuentas dadas de baja antes de este cambio', async () => {
  const historica = await usuarios().save({ ...datos, activa: false, rol: { id: 2 } });
  await base.db.exec(readFileSync(path.join(__dirname, '../migrations/20261104-cuit-email-historicos.sql'), 'utf8'));
  const migrada = await usuarios().findOneByOrFail({ id: historica.id });
  assert.equal(migrada.email, null);
  assert.equal(migrada.email_historico, datos.email);
  const migracion = readFileSync(path.join(__dirname, '../migrations/20261120-reactivacion-cuenta.sql'), 'utf8');
  await base.db.exec('DROP INDEX idx_usuario_baja_recuperable; ALTER TABLE usuario DROP COLUMN baja_recuperable, DROP COLUMN version_sesion');
  await base.db.exec(migracion);
  await base.db.exec(migracion);
  const cantidadCorreos = enviados.length;
  const legado = await solicitarReactivacion().expect(200);
  const inexistente = await solicitarReactivacion('inexistente@example.com').expect(200);
  assert.deepEqual(legado.body, inexistente.body);
  assert.equal(enviados.length, cantidadCorreos);
  await registrar();
  await verificar(tokenCorreo()).expect(201);
  await login().expect(201);
});

test('los enlaces vuelven al frontend local y la recuperación conserva la cuenta y revoca sesiones viejas', async () => {
  await registro().set('Origin', frontendLocal).expect(201);
  assert.equal(enviados.at(-1).origen, frontendLocal);
  await request(servidor()).post('/auth/reenviar-verificacion').set('Origin', frontendLocal)
    .send({ email: datos.email, contrasenia: datos.contrasenia }).expect(201);
  assert.equal(enviados.at(-1).origen, frontendLocal);
  await verificar(tokenCorreo()).expect(201);
  const original = await usuarios().findOneByOrFail({ email: datos.email });
  const sesion = (await login().expect(201)).body.access_token;
  const reserva = await source.getRepository(Reserva).save({
    usuario: original, monto_pago: 100, estado_pago: 'APROBADO',
    finalizada: true, fecha_inicio: '2000-01-01', fecha_fin: '2000-01-03',
  });
  await solicitarBaja(sesion).set('Origin', frontendLocal).expect(201);
  assert.equal(enviados.at(-1).origen, frontendLocal);
  const enlaceBaja = tokenCorreo();
  await confirmarBaja(enlaceBaja).expect(201);
  await login().expect(401);
  const oferta = await registro().set('Origin', frontendLocal).expect(409);
  assert.equal(oferta.body.codigo, 'CUENTA_RECUPERABLE');
  const { constanciaReactivacion } = oferta.body;
  assert.equal(typeof constanciaReactivacion, 'string');

  await registro({ crearCuentaNueva: 'true' }).expect(400);
  await solicitarReactivacion('email-invalido').expect(400);
  await solicitarReactivacion(datos.email, sesion).expect(400);
  await solicitarReactivacion('otro@example.com', constanciaReactivacion).expect(400);
  const vencida = app.get(JwtService).sign({ correoReactivacion: datos.email }, {
    audience: 'depa:solicitar-reactivacion', expiresIn: -1,
  });
  await solicitarReactivacion(datos.email, vencida).expect(400);
  fallaEnvioReactivacion = true;
  const cantidadCorreos = enviados.length;
  const neutral = await solicitarReactivacion().expect(200);
  const inexistente = await solicitarReactivacion('inexistente@example.com').expect(200);
  assert.deepEqual(neutral.body, inexistente.body);
  const fallido = await solicitarReactivacion(datos.email, constanciaReactivacion).set('Origin', frontendLocal).expect(503);
  assert.match(fallido.body.message, /No pudimos enviar el mail de recuperación/);
  assert.equal(enviados.length, cantidadCorreos);
  fallaEnvioReactivacion = false;
  await solicitarReactivacion(datos.email.toUpperCase()).set('Origin', 'https://depa.example.com.invalid').expect(200);
  const primerEnlace = tokenCorreo();
  assert.equal(enviados.at(-1).email, datos.email);
  assert.equal(enviados.at(-1).origen, frontendPublicado);
  await usuarios().update(original.id, { token_recuperacion_expira: new Date(0) });
  await confirmarReactivacion(primerEnlace).expect(400);

  const envio = await solicitarReactivacion(datos.email, constanciaReactivacion).set('Origin', frontendLocal).expect(200);
  assert.equal(envio.body.mensaje, 'Mail enviado');
  assert.equal(enviados.at(-1).origen, frontendLocal);
  const enlace = tokenCorreo();
  assert.notEqual(enlace, primerEnlace);
  await confirmarReactivacion(primerEnlace).expect(400);
  await request(servidor()).post('/auth/restablecer-contrasenia').send({
    token: enlace, nuevaContrasenia: datos.contrasenia, confirmarContrasenia: datos.contrasenia,
  }).expect(400);
  await confirmarReactivacion(enlace, 'OtraClave123!').expect(403);
  assert.equal((await usuarios().findOneByOrFail({ id: original.id })).activa, false);
  const respuesta = await confirmarReactivacion(enlace).expect(200);
  assert.match(respuesta.body.mensaje, /Recuperaste tu cuenta/);
  await confirmarReactivacion(enlace).expect(400);
  await solicitarReactivacion(datos.email, constanciaReactivacion).expect(409);
  await confirmarBaja(enlaceBaja).expect(400);

  const recuperada = await usuarios().findOneByOrFail({ email: datos.email });
  assert.equal(recuperada.id, original.id);
  assert.equal(recuperada.fecha_baja, null);
  assert.equal(recuperada.email_historico, datos.email);
  assert.equal(await usuarios().count(), 2);
  await source.getRepository(Reserva).findOneByOrFail({ id: reserva.id, usuario: { id: original.id } });
  await request(servidor()).get('/usuarios/me').set('Authorization', `Bearer ${sesion}`).expect(401);
  const sesionNueva = (await login().expect(201)).body.access_token;
  const perfil = await request(servidor()).get('/usuarios/me')
    .set('Authorization', `Bearer ${sesionNueva}`).expect(200);
  assert.equal(perfil.body.id, original.id);
});

test('un CUIT/CUIL ocupado revierte la recuperación y permite reintentar con el mismo enlace', async () => {
  await registrar();
  await verificar(tokenCorreo()).expect(201);
  const original = await usuarios().findOneByOrFail({ email: datos.email });
  const anunciantes = source.getRepository(Anunciante);
  const cuit = '20-12345678-9';
  await anunciantes.save({ idUsuario: original.id, numero_contacto: '123', cuit_cuil: cuit, verificado: true });
  const sesion = (await login().expect(201)).body.access_token;
  await solicitarBaja(sesion).expect(201);
  await confirmarBaja(tokenCorreo()).expect(201);
  await anunciantes.save({ idUsuario: admin.id, numero_contacto: '123', cuit_cuil: '20123456789' });
  await solicitarReactivacion().expect(200);
  const enlace = tokenCorreo();

  const conflicto = await confirmarReactivacion(enlace).expect(409);
  assert.match(conflicto.body.message, /CUIT\/CUIL/);
  const historica = await usuarios().findOneByOrFail({ id: original.id });
  assert.equal(historica.activa, false);
  assert.equal(historica.email, null);
  assert.equal((await anunciantes.findOneByOrFail({ idUsuario: original.id })).cuit_cuil, null);

  await anunciantes.update(admin.id, { cuit_cuil: null });
  await confirmarReactivacion(enlace).expect(200);
  const anunciante = await anunciantes.findOneByOrFail({ idUsuario: original.id });
  assert.equal(anunciante.cuit_cuil, cuit);
  assert.equal(anunciante.cuit_cuil_historico, cuit);
  assert.equal(anunciante.verificado, true);
});
