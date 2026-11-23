require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { Test } = require('@nestjs/testing');
const { ValidationPipe } = require('@nestjs/common');
const { AuthController } = require('../dist/auth/controller/auth.controller');
const { AuthService } = require('../dist/auth/service/auth.service');
const { VerificacionAnuncianteController } = require('../dist/verificacion-anunciante/controller/verificacion-anunciante.controller');
const { VerificacionAnuncianteService } = require('../dist/verificacion-anunciante/service/verificacion-anunciante.service');
const { PruebaVidaService } = require('../dist/verificacion-anunciante/service/prueba-vida.service');
const { PerfilAnunciantePublicoService } = require('../dist/verificacion-anunciante/service/perfil-anunciante-publico.service');
const { JwtAuthGuard } = require('../dist/seguridad/guards/jwt-auth.guard');

test('los dos registros requieren aceptación expresa por HTTP', async () => {
  let registros = 0;
  let solicitudes = 0;
  const module = await Test.createTestingModule({
    controllers: [AuthController, VerificacionAnuncianteController],
    providers: [
      { provide: AuthService, useValue: { register: () => { registros++; return { mensaje: 'ok' }; } } },
      { provide: VerificacionAnuncianteService, useValue: { solicitarAlta: () => { solicitudes++; return { mensaje: 'ok' }; } } },
      { provide: PruebaVidaService, useValue: {} },
      { provide: PerfilAnunciantePublicoService, useValue: {} },
    ],
  }).overrideGuard(JwtAuthGuard).useValue({ canActivate: (context) => { context.switchToHttp().getRequest().user = { id: 1 }; return true; } }).compile();
  const app = module.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  await app.init();
  try {
    const casos = [
      ['/auth/register', { nombre: 'Juan', apellido: 'Perez', email: 'juan@example.com', telefono: '3511234567', contrasenia: 'ClaveSegura123!' }],
      ['/anunciantes/solicitar', { cuit: '20123456789', numero_contacto: '3511234567', cbu: '1234567890123456789012', titularidad_declarada: true, idTipoAnunciante: 1 }],
    ];
    for (const [url, datos] of casos) {
      for (const aceptacion of [undefined, false, 'true', 1]) {
        const respuesta = await request(app.getHttpServer()).post(url).send({ ...datos, aceptaTerminos: aceptacion });
        assert.equal(respuesta.status, 400);
        assert.ok(respuesta.body.message.some((mensaje) => mensaje.includes('términos')));
      }
      const respuesta = await request(app.getHttpServer()).post(url).send({ ...datos, aceptaTerminos: true });
      assert.equal(respuesta.status, 201);
      assert.deepEqual(respuesta.body, { mensaje: 'ok' });
    }
    assert.equal(registros, 1);
    assert.equal(solicitudes, 1);
  } finally {
    await app.close();
  }
});
