import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { CotizacionesAdminComponent } from './cotizaciones-admin.component';
import { CotizacionesService, HistorialDolar } from '../../shared/services/cotizaciones.service';

describe('Panel histórico del dólar', () => {
  let fixture: ComponentFixture<CotizacionesAdminComponent>;
  const api = { listar: vi.fn(), verificar: vi.fn() };
  const estado: HistorialDolar = {
    cotizacion: {
      id: 8,
      compra: '1400.000000',
      venta: '1500.000000',
      tipo: 'blue',
      proveedor: 'DolarApi / DolarHoy',
      actualizada_fuente_en: '2026-10-26T20:00:00Z',
      consultada_en: '2026-10-27T12:00:00Z',
    },
    consulta: {
      id: 9,
      realizada_en: '2026-10-27T12:00:00Z',
      exitosa: false,
      error: 'Fuente no disponible',
    },
    items: [],
    consultas: [],
    total: 30,
    pagina: 1,
    por_pagina: 25,
    vigente: false,
    proxima_revision_en: '2026-10-27T12:05:00Z',
    max_antiguedad_fuente_horas: 96,
  };
  beforeEach(async () => {
    vi.resetAllMocks();
    api.listar.mockReturnValue(of({ ...estado, items: [estado.cotizacion!] }));
    api.verificar.mockReturnValue(
      of({
        ...estado,
        vigente: true,
        consulta: { ...estado.consulta!, exitosa: true, error: null },
      }),
    );
    await TestBed.configureTestingModule({
      imports: [CotizacionesAdminComponent],
      providers: [{ provide: CotizacionesService, useValue: api }],
    }).compileComponents();
    fixture = TestBed.createComponent(CotizacionesAdminComponent);
    fixture.detectChanges();
  });
  afterEach(() => fixture.destroy());
  const texto = () => fixture.nativeElement.textContent as string;
  const boton = (nombre: string): HTMLButtonElement =>
    [...fixture.nativeElement.querySelectorAll('button')].find(
      (b: HTMLButtonElement) => b.textContent?.trim() === nombre,
    )!;
  it('distingue la fecha de la fuente, la consulta y el fallo sin presentar el precio viejo como vigente', () => {
    expect(texto()).toContain('pendiente de verificación');
    expect(texto()).toContain('Publicada:');
    expect(texto()).toContain('Consultada por DEPA:');
    expect(texto()).toContain('Fuente no disponible');
    expect(texto()).toContain('96 horas');
    expect(texto()).toContain('DolarApi / DolarHoy');
  });
  it('verifica al backend y actualiza el estado sin consultar directamente al proveedor desde el navegador', async () => {
    boton('Verificar cotización').click();
    await fixture.whenStable();
    expect(api.verificar).toHaveBeenCalledTimes(1);
    expect(texto()).toContain('Disponible para nuevas conversiones');
  });
  it('pagina el historial y permite seguir viendo los datos si falla la nueva consulta', async () => {
    api.listar.mockReturnValue(throwError(() => new Error('Sin conexión')));
    boton('Siguiente').click();
    await fixture.whenStable();
    expect(api.listar).toHaveBeenLastCalledWith('', '', 2);
    expect(texto()).toContain('No se pudo consultar');
    expect(texto()).toContain('DolarApi / DolarHoy');
  });
});
