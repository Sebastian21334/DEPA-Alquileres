import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { DisponibilidadService } from '../../../src/disponibilidad/service/disponibilidad.service';
import { Fecha } from '../../../src/disponibilidad/entity/fecha.entity';
import { Publicacion } from '../../../src/publicaciones/entity/publicacion.entity';
import { Reserva } from '../../../src/reservas/entity/reserva.entity';
import { PublicacionesService } from '../../../src/publicaciones/service/publicaciones.service';
import { FECHA_REPOSITORY } from '../../../src/disponibilidad/repository/fecha.repository.interface';

// El título CP-04 del PDF repite "correo electrónico" por error.
describe('CP-04 · Superposición de reservas · PDF Pruebas Unitarias - TP', () => {
  let modulo: TestingModule;
  let service: DisponibilidadService;
  const buscarPorRango = jest.fn<Promise<Fecha[]>, [number, Date, Date]>();
  const enTransaccion = jest.fn();
  const publicacion = Object.assign(new Publicacion(), { id: 42 });
  const reservaExistente = Object.assign(new Reserva(), { id: 77 });

  beforeEach(async () => {
    buscarPorRango.mockReset();
    enTransaccion.mockReset();
    // Datos independientes del resultado esperado: calendario completo de diciembre.
    // Reserva existente del 10 al 15 INCLUSIVE. El día 16 está libre.
    const calendario = Array.from({ length: 31 }, (_, i) => {
      const dia = i + 1;
      const ocupado = dia >= 10 && dia <= 15;
      return Object.assign(new Fecha(), {
        id: dia,
        fecha: `2026-12-${String(dia).padStart(2, '0')}`,
        disponible: !ocupado,
        reserva: ocupado ? reservaExistente : null,
        publicacion,
      });
    });
    // Solo simula la lectura inclusiva de FechaRepository.buscarPorRango (SQL BETWEEN).
    // La decisión de disponibilidad la toma el servicio real.
    buscarPorRango.mockImplementation(async (id, inicio, fin) => calendario.filter(
      (fila) => fila.publicacion.id === id
        && fila.fecha >= inicio.toISOString().slice(0, 10)
        && fila.fecha <= fin.toISOString().slice(0, 10),
    ));
    modulo = await Test.createTestingModule({ providers: [
      DisponibilidadService,
      { provide: FECHA_REPOSITORY, useValue: { buscarPorRango, enTransaccion } },
      { provide: PublicacionesService, useValue: {} },
    ] }).compile();
    service = modulo.get(DisponibilidadService);
  });

  afterEach(async () => { await modulo?.close(); });

  test.each([
    ['PU-13', '2026-12-20', '2026-12-23', true, 'Partición válida'],
    ['PU-14', '2026-12-12', '2026-12-13', false, 'Partición inválida'],
    ['PU-15', '2026-12-16', '2026-12-20', true, 'Valor límite'],
    ['PU-16', '2026-12-15', '2026-12-20', false, 'Valor límite'],
  ] as const)('%s · %s al %s · disponible=%s · %s', async (_id, desde, hasta, esperado, _tecnica) => {
    // Arrange
    const inicio = new Date(`${desde}T00:00:00.000Z`);
    const fin = new Date(`${hasta}T00:00:00.000Z`);

    // Act
    const resultado = await service.verificarDisponibilidad(42, inicio, fin);

    // Assert
    expect(resultado).toBe(esperado);
    expect(buscarPorRango).toHaveBeenCalledTimes(1);
    expect(buscarPorRango).toHaveBeenCalledWith(42, inicio, fin);
    expect(enTransaccion).not.toHaveBeenCalled();
  });
});
