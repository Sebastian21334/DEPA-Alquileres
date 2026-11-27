require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Module } = require('@nestjs/common');
const { NestFactory } = require('@nestjs/core');
const { JwtModule } = require('@nestjs/jwt');
const { PassportModule } = require('@nestjs/passport');
const { PerfilAnunciantePublicoService } = require('../dist/verificacion-anunciante/service/perfil-anunciante-publico.service');
const { VerificacionAnuncianteService } = require('../dist/verificacion-anunciante/service/verificacion-anunciante.service');
const { PruebaVidaService } = require('../dist/verificacion-anunciante/service/prueba-vida.service');
const { VerificacionAnuncianteController } = require('../dist/verificacion-anunciante/controller/verificacion-anunciante.controller');

function escenario({ verificado = true, estado = 'aprobada', razonSocial = 'Inmobiliaria Sur', tipo = 'Inmobiliaria', sinSolicitud = false } = {}) {
  const anunciante = {
    idUsuario: 7,
    verificado,
    numero_contacto: '351 400-0000',
    cantidad_resenas: 3,
    promedio_resenas: '4.50',
    usuario: { nombre: 'Ana', apellido: 'Pérez', foto_url: 'https://example.invalid/foto.jpg' },
    tipoAnunciante: tipo ? { id: 2, nombre: tipo } : null,
  };
  const solicitud = sinSolicitud ? null : { estado, razon_social: razonSocial };
  const anunciantes = {
    buscarPorId: async (id) => (id === 7 ? anunciante : null),
    datosContacto: (actual) => ({ nombre: `${actual.usuario.nombre} ${actual.usuario.apellido}`.trim(), email: 'privado@example.invalid' }),
  };
  const catalogos = { codigoEstado: (_ambito, codigo) => codigo };
  const repo = { buscarSolicitudPorAnunciante: async () => solicitud };
  return { servicio: new PerfilAnunciantePublicoService(anunciantes, catalogos, repo) };
}

test('una inmobiliaria verificada expone su razón social y solo datos públicos', async () => {
  const { servicio } = escenario();
  const perfil = await servicio.buscarPerfilPublico(7);
  assert.deepEqual(perfil, {
    idUsuario: 7,
    nombre_publico: 'Inmobiliaria Sur',
    tipoAnunciante: { id: 2, nombre: 'Inmobiliaria' },
    verificado: true,
    numero_contacto: '351 400-0000',
    foto_url: 'https://example.invalid/foto.jpg',
    cantidad_resenas: 3,
    promedio_resenas: 4.5,
  });
  for (const campo of [
    'cuit_cuil', 'cuit_cuil_historico', 'matricula_profesional', 'colegio_profesional',
    'domicilio_comercial', 'dni_corredor', 'email', 'cbu_validado',
  ]) {
    assert.equal(campo in perfil, false);
  }
});

test('un particular verificado usa nombre y apellido', async () => {
  const { servicio } = escenario({ tipo: 'Particular', razonSocial: null });
  const perfil = await servicio.buscarPerfilPublico(7);
  assert.equal(perfil.nombre_publico, 'Ana Pérez');
  assert.equal(perfil.tipoAnunciante.nombre, 'Particular');
});

test('una solicitud rechazada no filtra la razón social', async () => {
  const { servicio } = escenario({ estado: 'rechazada', razonSocial: 'Inmobiliaria Rechazada' });
  const perfil = await servicio.buscarPerfilPublico(7);
  assert.equal(perfil.nombre_publico, 'Ana Pérez');
});

test('un anunciante verificado sin solicitud usa el nombre de la persona', async () => {
  const { servicio } = escenario({ sinSolicitud: true });
  const perfil = await servicio.buscarPerfilPublico(7);
  assert.equal(perfil.nombre_publico, 'Ana Pérez');
});

test('un anunciante no verificado responde 404', async () => {
  const { servicio } = escenario({ verificado: false });
  await assert.rejects(servicio.buscarPerfilPublico(7), (error) => error.getStatus() === 404);
});

test('un anunciante inexistente responde 404', async () => {
  const { servicio } = escenario();
  await assert.rejects(servicio.buscarPerfilPublico(999), (error) => error.getStatus() === 404);
});

test('el endpoint público no exige autenticación y valida el id', async (t) => {
  const perfil = {
    idUsuario: 7,
    nombre_publico: 'Inmobiliaria Sur',
    tipoAnunciante: { id: 2, nombre: 'Inmobiliaria' },
    verificado: true,
    numero_contacto: '351 400-0000',
    foto_url: null,
  };
  class AplicacionPrueba {}
  Module({
    imports: [
      PassportModule.register({ defaultStrategy: 'jwt' }),
      JwtModule.register({ secret: 'perfil-publico-pruebas' }),
    ],
    controllers: [VerificacionAnuncianteController],
    providers: [
      { provide: VerificacionAnuncianteService, useValue: {} },
      { provide: PruebaVidaService, useValue: {} },
      { provide: PerfilAnunciantePublicoService, useValue: { buscarPerfilPublico: async (id) => (id === 7 ? perfil : null) } },
    ],
  })(AplicacionPrueba);

  const app = await NestFactory.create(AplicacionPrueba, { logger: false, abortOnError: false });
  t.after(() => app.close());
  await app.listen(0, '127.0.0.1');
  const url = await app.getUrl();

  const respuesta = await fetch(`${url}/anunciantes/7/publico`);
  assert.equal(respuesta.status, 200);
  assert.deepEqual(await respuesta.json(), perfil);
  assert.equal(respuesta.headers.get('cache-control'), 'no-store');
  assert.equal((await fetch(`${url}/anunciantes/abc/publico`)).status, 400);
});
