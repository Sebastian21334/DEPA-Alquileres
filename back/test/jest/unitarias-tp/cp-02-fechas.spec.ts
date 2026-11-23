import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import type { EntityManager } from 'typeorm';
import { ReservasService, type CondicionesCobro } from '../../../src/reservas/service/reservas.service';
import { Reserva } from '../../../src/reservas/entity/reserva.entity';
import {
  RESERVA_REPOSITORY,
  type IReservaRepository,
} from '../../../src/reservas/repository/reserva.repository.interface';
import { DisponibilidadService } from '../../../src/disponibilidad/service/disponibilidad.service';
import { UsuariosService } from '../../../src/usuarios/service/usuarios.service';
import { PublicacionesService } from '../../../src/publicaciones/service/publicaciones.service';
import { Publicacion } from '../../../src/publicaciones/entity/publicacion.entity';
import { Usuario } from '../../../src/usuarios/entity/usuario.entity';
import { ReservaNotificacionesService } from '../../../src/reservas/service/reserva-notificaciones.service';
import { ReembolsosService } from '../../../src/reembolsos/service/reembolsos.service';
import { ReservaEstadoService } from '../../../src/reservas-consulta/service/reserva-estado.service';
import { LiquidacionesService } from '../../../src/liquidaciones/service/liquidaciones.service';
import { CatalogosService } from '../../../src/catalogos/service/catalogos.service';

describe('CP-02 · Fechas de reserva · PDF Pruebas Unitarias - TP', () => {
  let modulo: TestingModule;
  let service: ReservasService;
  const transaccion = {} as EntityManager;
  const repo = {
    crear: jest.fn((datos: Partial<Reserva>) => Object.assign(new Reserva(), datos)),
    guardar: jest.fn(async (reserva: Reserva) => Object.assign(reserva, { id: 99 })),
    buscarPendientesVencidas: jest.fn(async (): Promise<Reserva[]> => []),
    conTransaccion: jest.fn(),
  };
  const disponibilidad = {
    verificarDisponibilidad: jest.fn(async () => true),
    marcarComoReservadas: jest.fn(async () => undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    // Mantiene diciembre de 2026 en el futuro y el presupuesto vigente en cualquier ejecución.
    jest.useFakeTimers({ now: new Date('2026-11-13T15:00:00.000Z') });
    const publicacion = Object.assign(new Publicacion(), {
      id: 42,
      activa: true,
      eliminada: false,
      precio: 100,
      tipoMoneda: { nombre: 'ARS' },
    });
    const usuario = Object.assign(new Usuario(), {
      id: 7, nombre: 'Santiago', apellido: 'Gomez',
      email: 'inquilino@example.com', telefono: '3534000000',
    });
    repo.conTransaccion.mockImplementation(async (
      operacion: (repositorio: IReservaRepository, manager: EntityManager) => Promise<Reserva>,
    ) => operacion(repo as unknown as IReservaRepository, transaccion));

    // Se registran las diez dependencias reales del constructor de esta copia; no se inicia AppModule.
    modulo = await Test.createTestingModule({ providers: [
      ReservasService,
      { provide: ConfigService, useValue: { get: jest.fn(() => 'ARS') } },
      { provide: RESERVA_REPOSITORY, useValue: repo },
      { provide: DisponibilidadService, useValue: disponibilidad },
      { provide: UsuariosService, useValue: {
        buscarPorId: jest.fn(async () => usuario),
        validarCuentaParaNuevaReserva: jest.fn(async () => undefined),
      } },
      { provide: PublicacionesService, useValue: {
        buscarPorId: jest.fn(async () => publicacion),
        cuentaAnuncianteHabilitada: jest.fn(() => true),
        perteneceA: jest.fn(() => false),
        admiteReservaPorFecha: jest.fn(() => true),
        bloquearParaModificacion: jest.fn(async () => undefined),
        buscarCondicionesDeReserva: jest.fn(async () => publicacion),
      } },
      { provide: ReservaNotificacionesService, useValue: {} },
      { provide: ReembolsosService, useValue: {} },
      { provide: ReservaEstadoService, useValue: {
        prepararRespuesta: jest.fn((reserva: Reserva) => reserva),
      } },
      { provide: LiquidacionesService, useValue: {
        sincronizarDesdeReserva: jest.fn(async () => undefined),
      } },
      { provide: CatalogosService, useValue: {
        codigoEstado: jest.fn((_ambito: string, codigo: string) => codigo),
        obtenerComision: jest.fn(async () => 10),
      } },
    ] }).compile();
    service = modulo.get(ReservasService);
  });

  afterEach(async () => {
    try { await modulo?.close(); } finally { jest.useRealTimers(); }
  });

  test.each([
    ['PU-05', '2026-12-10', '2026-12-15', true, '600.00', 'Partición válida'],
    ['PU-06', '2026-12-15', '2026-12-10', false, '100.00', 'Partición inválida'],
    // Se respeta literalmente "Aceptado" del PDF. Contradice su texto "salida posterior".
    // El backend actual admite el mismo día y lo cobra como un día inclusivo.
    ['PU-07', '2026-12-10', '2026-12-10', true, '100.00', 'Valor límite'],
  ] as const)('%s · %s al %s · aceptado=%s · presupuesto=%s · %s', async (
    _id, fecha_inicio, fecha_fin, aceptado, total, _tecnica,
  ) => {
    // Arrange: presupuesto válido, publicación habilitada, usuario ajeno y calendario libre.
    const dto = { id_publicacion: 42, fecha_inicio, fecha_fin };
    const condiciones: CondicionesCobro = {
      precio_unitario_origen: '100.00', moneda_origen: 'ARS',
      total_origen: total, total_cobro: total, cotizacion_id: null,
      emitida_en: '2026-11-13T14:59:00.000Z',
      vence_en: '2026-11-13T15:15:00.000Z',
    };

    // Act: no se simula crearPendiente ni se reemplaza su validación de fechas.
    const resultado = service.crearPendiente(dto, 7, condiciones);

    // Assert
    if (aceptado) {
      await expect(resultado).resolves.toMatchObject({ id: 99, fecha_inicio, fecha_fin });
      expect(repo.guardar).toHaveBeenCalledTimes(1);
      expect(disponibilidad.verificarDisponibilidad).toHaveBeenCalledWith(
        42, new Date(fecha_inicio), new Date(fecha_fin), transaccion,
      );
      expect(disponibilidad.marcarComoReservadas).toHaveBeenCalledWith(
        42, new Date(fecha_inicio), new Date(fecha_fin), 99, transaccion,
      );
    } else {
      await expect(resultado).rejects.toBeInstanceOf(BadRequestException);
      await expect(resultado).rejects.toThrow('La fecha de inicio no puede ser posterior a la de fin');
      expect(repo.conTransaccion).not.toHaveBeenCalled();
      expect(repo.guardar).not.toHaveBeenCalled();
      expect(disponibilidad.verificarDisponibilidad).not.toHaveBeenCalled();
      expect(disponibilidad.marcarComoReservadas).not.toHaveBeenCalled();
    }
  });
});
