import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';
import { SelectorUbicacionComponent } from './selector-ubicacion.component';
import { UbicacionService } from '../../services/ubicacion.service';
import { Ciudad } from '../../models/ubicacion.model';

describe('SelectorUbicacionComponent', () => {
  let fixture: ComponentFixture<SelectorUbicacionComponent>;
  let solicitudes: Map<number, Subject<Ciudad[]>>;
  const api = {
    getProvincias: vi.fn(),
    getCiudadesPorProvincia: vi.fn(),
  };
  const cordoba = [
    { id: 1, nombre: 'Villa María' },
    { id: 2, nombre: 'Villa Nueva' },
  ];
  const input = (): HTMLInputElement => fixture.nativeElement.querySelector('input');
  const provincia = (): HTMLSelectElement => fixture.nativeElement.querySelector('select');
  const opciones = (): HTMLElement[] => [
    ...fixture.nativeElement.querySelectorAll('[role="option"]'),
  ];

  beforeEach(async () => {
    solicitudes = new Map();
    vi.resetAllMocks();
    api.getProvincias.mockReturnValue(
      of([
        { id: 14, nombre: 'Córdoba' },
        { id: 30, nombre: 'Entre Ríos' },
      ]),
    );
    api.getCiudadesPorProvincia.mockImplementation((id: number) => {
      const solicitud = new Subject<Ciudad[]>();
      solicitudes.set(id, solicitud);
      return solicitud;
    });
    await TestBed.configureTestingModule({
      imports: [SelectorUbicacionComponent],
      providers: [{ provide: UbicacionService, useValue: api }],
    }).compileComponents();
    fixture = TestBed.createComponent(SelectorUbicacionComponent);
    fixture.componentRef.setInput('idPrefix', 'prueba-ubicacion');
    fixture.componentInstance.provinciaChange.subscribe((id) =>
      fixture.componentRef.setInput('provinciaId', id),
    );
    fixture.componentInstance.localidadChange.subscribe((id) =>
      fixture.componentRef.setInput('localidadId', id),
    );
    fixture.detectChanges();
  });

  function elegirProvincia(id: number): void {
    provincia().value = String(id);
    provincia().dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  function escribir(texto: string): void {
    input().value = texto;
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  it('espera la provincia antes de pedir o permitir buscar localidades', () => {
    expect(api.getCiudadesPorProvincia).not.toHaveBeenCalled();
    expect(input().disabled).toBe(true);
    elegirProvincia(14);
    expect(api.getCiudadesPorProvincia).toHaveBeenCalledExactlyOnceWith(14);
    expect(input().disabled).toBe(true);
    solicitudes.get(14)!.next(cordoba);
    fixture.detectChanges();
    expect(input().disabled).toBe(false);
  });

  it('busca sin distinguir tildes ni mayúsculas y permite seleccionar con teclado', () => {
    elegirProvincia(14);
    solicitudes.get(14)!.next(cordoba);
    fixture.detectChanges();
    escribir('VILLA MARIA');
    expect(opciones().map((item) => item.textContent?.trim())).toEqual(['Villa María']);
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.localidadId()).toBe(1);
    expect(input().value).toBe('Villa María');
    expect(opciones()).toHaveLength(0);
  });

  it('limpia la selección anterior al cambiar de provincia e ignora respuestas viejas', () => {
    elegirProvincia(14);
    const anterior = solicitudes.get(14)!;
    anterior.next(cordoba);
    fixture.componentRef.setInput('localidadId', 1);
    fixture.detectChanges();
    elegirProvincia(30);
    expect(fixture.componentInstance.localidadId()).toBeNull();
    solicitudes.get(30)!.next([{ id: 3, nombre: 'La Paz' }]);
    anterior.next(cordoba);
    fixture.detectChanges();
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect(opciones().map((item) => item.textContent?.trim())).toEqual(['La Paz']);
    expect(anterior.observed).toBe(false);
  });

  it('mantiene el texto al corregir una localidad elegida y no acepta texto libre como selección', () => {
    elegirProvincia(14);
    solicitudes.get(14)!.next(cordoba);
    fixture.componentRef.setInput('localidadId', 1);
    fixture.detectChanges();
    escribir('Villa Nueva');
    expect(fixture.componentInstance.localidadId()).toBeNull();
    expect(input().value).toBe('Villa Nueva');
    opciones()[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.localidadId()).toBe(2);
  });

  it('restaura la localidad de una publicación cuando llegan sus opciones', () => {
    fixture.componentRef.setInput('provinciaId', 14);
    fixture.componentRef.setInput('localidadId', 1);
    fixture.detectChanges();
    solicitudes.get(14)!.next(cordoba);
    fixture.detectChanges();
    expect(input().value).toBe('Villa María');
    expect(fixture.componentInstance.localidadId()).toBe(1);
  });

  it('limita las opciones visibles aunque la provincia tenga miles de localidades', () => {
    elegirProvincia(14);
    solicitudes
      .get(14)!
      .next(Array.from({ length: 2000 }, (_, i) => ({ id: i + 1, nombre: `Localidad ${i}` })));
    fixture.detectChanges();
    escribir('Localidad');
    expect(opciones()).toHaveLength(40);
    expect(fixture.nativeElement.textContent).toContain('acotar las 2000 localidades');
    escribir('No existe');
    expect(opciones()).toHaveLength(0);
    expect(fixture.nativeElement.textContent).toContain('No encontramos localidades');
  });

  it('permite reintentar una carga fallida', () => {
    api.getCiudadesPorProvincia
      .mockReturnValueOnce(throwError(() => new Error('Sin conexión')))
      .mockReturnValueOnce(of(cordoba));
    elegirProvincia(14);
    expect(fixture.nativeElement.textContent).toContain('No pudimos cargar las localidades');
    const reintentar: HTMLButtonElement =
      fixture.nativeElement.querySelector('.location-hint button');
    reintentar.click();
    fixture.detectChanges();
    expect(input().disabled).toBe(false);
    escribir('Villa María');
    expect(opciones()).toHaveLength(1);
  });
});
