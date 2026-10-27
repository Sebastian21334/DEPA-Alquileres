import { jest } from '@jest/globals';
import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CotizacionesController } from '../src/cotizaciones/controller/cotizaciones.controller';
import { CotizacionesService } from '../src/cotizaciones/service/cotizaciones.service';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';

describe('Acceso al historial del dólar', () => {
  let app: INestApplication;
  const administracion = jest.fn<CotizacionesService['administracion']>();
  const actualizar = jest.fn<CotizacionesService['actualizarSiCorresponde']>();
  beforeAll(async () => {
    const modulo = await Test.createTestingModule({
      controllers: [CotizacionesController],
      providers: [
        {
          provide: CotizacionesService,
          useValue: { administracion, actualizarSiCorresponde: actualizar },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate(contexto: ExecutionContext) {
          const req = contexto.switchToHttp().getRequest();
          const rol = req.headers['x-test-rol'];
          if (!rol) throw new UnauthorizedException();
          req.user = { id: 7, rol };
          return true;
        },
      })
      .compile();
    app = modulo.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });
  beforeEach(() => {
    jest.resetAllMocks();
    administracion.mockResolvedValue({
      cotizacion: null,
      consulta: null,
      items: [],
      total: 0,
      consultas: [],
      pagina: 1,
      por_pagina: 25,
      vigente: false,
      proxima_revision_en: null,
      max_antiguedad_fuente_horas: 96,
    });
    actualizar.mockResolvedValue({ cotizacion: null, consulta: null });
  });
  afterAll(async () => app.close());
  it.each(['Usuario', 'Anunciante'])(
    'impide consultar o actualizar al rol %s',
    async (rol) => {
      await request(app.getHttpServer())
        .get('/cotizaciones/administracion')
        .set('x-test-rol', rol)
        .expect(403);
      await request(app.getHttpServer())
        .post('/cotizaciones/administracion/verificar')
        .set('x-test-rol', rol)
        .expect(403);
      expect(administracion).not.toHaveBeenCalled();
      expect(actualizar).not.toHaveBeenCalled();
    },
  );
  it('exige autenticación', async () => {
    await request(app.getHttpServer())
      .get('/cotizaciones/administracion')
      .expect(401);
  });
  it('autoriza al administrador y convierte filtros de fechas de Argentina y paginación', async () => {
    await request(app.getHttpServer())
      .get(
        '/cotizaciones/administracion?desde=2026-10-01&hasta=2026-10-02&pagina=2',
      )
      .set('x-test-rol', 'Administrador')
      .expect(200);
    expect(administracion).toHaveBeenCalledWith(
      new Date('2026-10-01T03:00:00Z'),
      new Date('2026-10-03T03:00:00Z'),
      2,
    );
    await request(app.getHttpServer())
      .post('/cotizaciones/administracion/verificar')
      .set('x-test-rol', 'Administrador')
      .expect(201);
    expect(actualizar).toHaveBeenCalledTimes(1);
  });
  it.each([
    'pagina=0',
    'pagina=1.5',
    'desde=2026-02-30',
    'desde=2026-10-03&hasta=2026-10-01',
    'extra=1',
  ])('rechaza filtros inválidos: %s', async (consulta) => {
    await request(app.getHttpServer())
      .get(`/cotizaciones/administracion?${consulta}`)
      .set('x-test-rol', 'Administrador')
      .expect(400);
    expect(administracion).not.toHaveBeenCalled();
  });
});
