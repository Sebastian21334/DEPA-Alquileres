import { jest } from '@jest/globals';
import { ExecutionContext, INestApplication, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PublicacionesController } from '../src/publicaciones/controller/publicaciones.controller';
import { PublicacionesService } from '../src/publicaciones/service/publicaciones.service';
import { PUBLICACIONES_REPOSITORY } from '../src/publicaciones/repository/publicaciones.repository.interface';
import { CatalogosService } from '../src/catalogos/service/catalogos.service';
import { UbicacionService } from '../src/ubicacion/service/ubicacion.service';
import { MAIL_SERVICE, IMailService } from '../src/mail/mail.interface';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { AnuncianteGuard } from '../src/common/guards/anunciante.guard';
import { Publicacion } from '../src/publicaciones/entity/publicacion.entity';
import { Anunciante } from '../src/anunciantes/entity/anunciante.entity';
import { Usuario } from '../src/usuarios/entity/usuario.entity';

describe('Baja administrativa de publicaciones', () => {
  let app: INestApplication;
  let service: PublicacionesService;
  let publicacion: Publicacion;
  const repo = {
    buscarPorId: jest.fn<(id: number) => Promise<Publicacion | null>>(),
    buscarTodas: jest.fn<() => Promise<Publicacion[]>>(),
    darDeBaja: jest.fn<(id: number, motivo: string) => Promise<void>>(),
    marcarActiva: jest.fn(),
    guardar: jest.fn(),
    eliminar: jest.fn(),
  };
  const enviarBajaPublicacion = jest.fn<IMailService['enviarBajaPublicacion']>();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [PublicacionesController],
      providers: [
        PublicacionesService,
        { provide: PUBLICACIONES_REPOSITORY, useValue: repo },
        { provide: CatalogosService, useValue: {} },
        { provide: UbicacionService, useValue: {} },
        { provide: MAIL_SERVICE, useValue: { enviarBajaPublicacion } },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({
        canActivate(ctx: ExecutionContext) {
          const req = ctx.switchToHttp().getRequest();
          const rol = req.headers['x-test-rol'];
          if (!rol) throw new UnauthorizedException();
          req.user = { id: 99, rol };
          return true;
        },
      })
      .overrideGuard(AnuncianteGuard).useValue({ canActivate: () => true })
      .compile();
    service = module.get(PublicacionesService);
    app = module.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    publicacion = Object.assign(new Publicacion(), {
      id: 10, titulo: 'Casa', activa: true, motivo_baja_admin: null,
      anunciante: Object.assign(new Anunciante(), {
        idUsuario: 7, usuario: Object.assign(new Usuario(), { email: 'dueno@gmail.com' }),
      }),
    });
    repo.buscarPorId.mockResolvedValue(publicacion);
    repo.buscarTodas.mockResolvedValue([publicacion]);
    repo.darDeBaja.mockResolvedValue(undefined);
    enviarBajaPublicacion.mockResolvedValue(undefined);
  });

  afterAll(async () => { await app.close(); });

  it('permite a un administrador sin perfil anunciante dar de baja una publicación ajena y notifica al dueño', async () => {
    const result = await request(app.getHttpServer())
      .patch('/publicaciones/administracion/10/baja')
      .set('x-test-rol', 'Administrador').send({ motivo: '  Datos incorrectos  ' }).expect(200);
    expect(result.body).toMatchObject({ correoEnviado: true, publicacion: {
      id: 10, activa: false, motivo_baja_admin: 'Datos incorrectos',
    } });
    expect(repo.darDeBaja).toHaveBeenCalledWith(10, 'Datos incorrectos');
    expect(repo.eliminar).not.toHaveBeenCalled();
    expect(enviarBajaPublicacion).toHaveBeenCalledWith('dueno@gmail.com', 'Casa', 'Datos incorrectos');
  });

  it.each(['Usuario', 'Anunciante'])('rechaza la baja y el listado administrativo para el rol %s', async (rol) => {
    await request(app.getHttpServer()).patch('/publicaciones/administracion/10/baja')
      .set('x-test-rol', rol).send({ motivo: 'Motivo' }).expect(403);
    await request(app.getHttpServer()).get('/publicaciones/administracion')
      .set('x-test-rol', rol).expect(403);
    expect(repo.darDeBaja).not.toHaveBeenCalled();
  });

  it('exige autenticación', async () => {
    await request(app.getHttpServer()).patch('/publicaciones/administracion/10/baja')
      .send({ motivo: 'Motivo' }).expect(401);
  });

  it.each([{}, { motivo: '   ' }, { motivo: 'a'.repeat(501) }, { motivo: 'Motivo', activa: true }])(
    'rechaza un motivo inválido o campos adicionales: %j', async (body) => {
      await request(app.getHttpServer()).patch('/publicaciones/administracion/10/baja')
        .set('x-test-rol', 'Administrador').send(body).expect(400);
      expect(repo.darDeBaja).not.toHaveBeenCalled();
    },
  );

  it('devuelve 404 si no existe y no envía correo', async () => {
    repo.buscarPorId.mockResolvedValue(null);
    await request(app.getHttpServer()).patch('/publicaciones/administracion/10/baja')
      .set('x-test-rol', 'Administrador').send({ motivo: 'Motivo' }).expect(404);
    expect(enviarBajaPublicacion).not.toHaveBeenCalled();
  });

  it('conserva la baja e informa el fallo del correo', async () => {
    enviarBajaPublicacion.mockRejectedValue(new Error('Correo no disponible'));
    const result = await service.darDeBajaAdministracion(10, 'Motivo');
    expect(result.correoEnviado).toBe(false);
    expect(repo.darDeBaja).toHaveBeenCalledWith(10, 'Motivo');
    expect(result.publicacion.activa).toBe(false);
  });

  it('incluye las publicaciones desactivadas en la administración', async () => {
    publicacion.activa = false;
    const result = await request(app.getHttpServer()).get('/publicaciones/administracion')
      .set('x-test-rol', 'Administrador').expect(200);
    expect(result.body[0].activa).toBe(false);
  });

  it('impide reactivar una baja administrativa al editar o agregar fotos', async () => {
    publicacion.activa = false;
    publicacion.motivo_baja_admin = 'Motivo';
    await service.activar(publicacion);
    expect(repo.marcarActiva).not.toHaveBeenCalled();
    await expect(service.actualizar(10, { idUsuario: 7 } as Anunciante, { activa: true }))
      .rejects.toThrow('desactivada por un administrador');
    expect(repo.guardar).not.toHaveBeenCalled();
  });
});
