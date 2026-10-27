import {
  createEnvironmentInjector,
  EnvironmentInjector,
  runInInjectionContext,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { activarActualizacionReservas } from './reservation-refresh';

describe('Actualización periódica de las reservas', () => {
  it('consulta cada minuto visible y descarta el temporizador y los eventos al salir', () => {
    const intervalo = vi.spyOn(window, 'setInterval');
    const limpiar = vi.spyOn(window, 'clearInterval');
    const actualizar = vi.fn();
    const contexto = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    try {
      runInInjectionContext(contexto, () => activarActualizacionReservas(actualizar));
      const llamada = intervalo.mock.calls.find(([, demora]) => demora === 60_000)!;
      expect(llamada).toBeDefined();
      const callback = llamada[0];
      if (typeof callback !== 'function') throw new Error('Falta el callback periódico');
      callback();
      expect(actualizar).toHaveBeenCalledTimes(1);
      vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
      callback();
      expect(actualizar).toHaveBeenCalledTimes(1);
      vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
      document.dispatchEvent(new Event('visibilitychange'));
      expect(actualizar).toHaveBeenCalledTimes(2);
      contexto.destroy();
      expect(limpiar).toHaveBeenCalled();
      window.dispatchEvent(new Event('focus'));
      document.dispatchEvent(new Event('visibilitychange'));
      expect(actualizar).toHaveBeenCalledTimes(2);
    } finally {
      if (!contexto.destroyed) contexto.destroy();
      vi.restoreAllMocks();
    }
  });
});
