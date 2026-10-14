import { jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { DisponibilidadService } from './disponibilidad.service';
import { FECHA_REPOSITORY } from '../repository/fecha.repository.interface';
import { PublicacionesService } from '../../publicaciones/service/publicaciones.service';
import { Publicacion } from '../../publicaciones/entity/publicacion.entity';
import { Anunciante } from '../../anunciantes/entity/anunciante.entity';
import { Fecha } from '../entity/fecha.entity';
import { Reserva } from '../../reservas/entity/reserva.entity';

describe('DisponibilidadService', () => {
  let service: DisponibilidadService;
  const repo = {
    buscarPorId: jest.fn<() => Promise<Fecha | null>>(),
    guardar: jest.fn(),
    eliminar: jest.fn(),
  };
  const publicaciones = { buscarPorId: jest.fn<() => Promise<Publicacion>>() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const publicacion = Object.assign(new Publicacion(), {
      id: 10,
      anunciante: Object.assign(new Anunciante(), { idUsuario: 7 }),
    });
    publicaciones.buscarPorId.mockResolvedValue(publicacion);
    repo.buscarPorId.mockResolvedValue(
      Object.assign(new Fecha(), {
        id: 1,
        publicacion,
        reserva: Object.assign(new Reserva(), { id: 42 }),
      }),
    );
    const module = await Test.createTestingModule({
      providers: [
        DisponibilidadService,
        { provide: FECHA_REPOSITORY, useValue: repo },
        { provide: PublicacionesService, useValue: publicaciones },
      ],
    }).compile();
    service = module.get(DisponibilidadService);
  });

  it('autoriza al dueño resolviendo la publicación desde la fecha', async () => {
    await expect(
      service.validarPropiedad(7, { idFecha: 1 }),
    ).resolves.toBeUndefined();
    expect(publicaciones.buscarPorId).toHaveBeenCalledWith(10);
  });

  it('rechaza operaciones de otro usuario', async () => {
    await expect(
      service.validarPropiedad(99, { idPublicacion: 10 }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rechaza identificadores inválidos antes de consultar la base', async () => {
    await expect(
      service.validarPropiedad(7, { idPublicacion: Number.NaN }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(publicaciones.buscarPorId).not.toHaveBeenCalled();
  });

  it('no libera ni elimina un día asociado a una reserva', async () => {
    await expect(
      service.actualizar(1, { disponible: true }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.eliminar(1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repo.guardar).not.toHaveBeenCalled();
    expect(repo.eliminar).not.toHaveBeenCalled();
  });
});
