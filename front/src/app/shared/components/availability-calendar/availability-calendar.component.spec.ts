import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AvailabilityCalendarComponent } from './availability-calendar.component';
import { FechaDisponibleAdministracion } from '../../services/availability.service';

describe('AvailabilityCalendarComponent', () => {
  let fixture: ComponentFixture<AvailabilityCalendarComponent>;
  const available = (fecha: string) => ({ fecha, disponible: true });
  const day = (iso: string): HTMLButtonElement =>
    fixture.nativeElement.querySelector(`[data-date="${iso}"]`);
  const button = (text: string): HTMLButtonElement =>
    [...fixture.nativeElement.querySelectorAll('button')].find(
      (item) => item.textContent?.trim() === text,
    )!;
  const selection = () => ({
    start: fixture.componentInstance.selectedStart(),
    end: fixture.componentInstance.selectedEnd(),
  });
  function click(iso: string): void {
    day(iso).click();
    fixture.detectChanges();
  }
  function setupMode(): void {
    fixture.componentRef.setInput('mode', 'setup');
    fixture.detectChanges();
  }

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 13, 12));
    await TestBed.configureTestingModule({
      imports: [AvailabilityCalendarComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(AvailabilityCalendarComponent);
    fixture.componentInstance.rangeChange.subscribe(({ start, end }) => {
      fixture.componentRef.setInput('selectedStart', start);
      fixture.componentRef.setInput('selectedEnd', end);
    });
    fixture.detectChanges();
  });
  afterEach(() => vi.useRealTimers());

  it('permite habilitar un solo día con un clic y muestra la duración', () => {
    setupMode();
    button('Un día').click();
    fixture.detectChanges();
    click('2026-10-15');
    expect(selection()).toEqual({ start: '2026-10-15', end: '2026-10-15' });
    expect(fixture.nativeElement.textContent).toContain('1 día seleccionado');
    expect(day('2026-10-15').getAttribute('aria-pressed')).toBe('true');
  });

  it('permite reservar un día disponible en modo un día', () => {
    fixture.componentRef.setInput('dates', [available('2026-10-16')]);
    fixture.detectChanges();
    button('Un día').click();
    fixture.detectChanges();
    click('2026-10-16');
    expect(selection()).toEqual({ start: '2026-10-16', end: '2026-10-16' });
  });

  it('acepta la misma fecha como primer y último día, y ofrece usar solo el inicio', () => {
    setupMode();
    click('2026-10-14');
    click('2026-10-14');
    expect(selection()).toEqual({ start: '2026-10-14', end: '2026-10-14' });
    click('2026-10-18');
    button('Usar solo este día').click();
    fixture.detectChanges();
    expect(selection()).toEqual({ start: '2026-10-18', end: '2026-10-18' });
  });

  it('ordena las fechas al elegir un final anterior y cuenta ambos extremos', () => {
    setupMode();
    click('2026-10-20');
    click('2026-10-18');
    expect(selection()).toEqual({ start: '2026-10-18', end: '2026-10-20' });
    expect(fixture.nativeElement.textContent).toContain('3 días seleccionados');
  });

  it('conserva el inicio y explica el error si el rango atraviesa un día sin disponibilidad', () => {
    fixture.componentRef.setInput('dates', [available('2026-10-15'), available('2026-10-17')]);
    fixture.detectChanges();
    click('2026-10-15');
    click('2026-10-17');
    expect(selection()).toEqual({ start: '2026-10-15', end: null });
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'días no disponibles',
    );
    expect(day('2026-10-16').disabled).toBe(true);
  });

  it('no deja seleccionar días pasados ni reservados, aunque figuren disponibles', () => {
    fixture.componentRef.setInput('dates', [
      available('2026-10-12'),
      { ...available('2026-10-15'), reserva: { id: 9 } },
    ]);
    fixture.detectChanges();
    expect(day('2026-10-12').disabled).toBe(true);
    expect(day('2026-10-15').disabled).toBe(true);
    click('2026-10-15');
    expect(selection()).toEqual({ start: null, end: null });
  });

  it('permite completar rangos entre meses y borrar las fechas', () => {
    setupMode();
    click('2026-10-31');
    fixture.nativeElement.querySelector('[aria-label="Mes siguiente"]').click();
    fixture.detectChanges();
    click('2026-11-02');
    expect(selection()).toEqual({ start: '2026-10-31', end: '2026-11-02' });
    expect(fixture.nativeElement.textContent).toContain('3 días seleccionados');
    button('Borrar fechas').click();
    fixture.detectChanges();
    expect(selection()).toEqual({ start: null, end: null });
  });

  it('abre el primer mes con disponibilidad cuando la carga termina y bloquea días mientras carga', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('section').getAttribute('aria-busy')).toBe('true');
    fixture.componentRef.setInput('dates', [available('2027-02-01')]);
    fixture.detectChanges();
    expect(day('2027-02-01').disabled).toBe(true);
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
    expect(day('2027-02-01').disabled).toBe(false);
  });

  it('mantiene la administración de días bloqueados y protege los reservados', () => {
    const blocked: FechaDisponibleAdministracion = {
      id: 1,
      fecha: '2026-10-16',
      disponible: false,
      reserva: null,
    };
    fixture.componentRef.setInput('mode', 'manage');
    fixture.componentRef.setInput('dates', [
      blocked,
      { ...available('2026-10-17'), id: 2, reserva: { id: 5 } },
    ]);
    const toggle = vi.fn();
    fixture.componentInstance.availabilityToggle.subscribe(toggle);
    fixture.detectChanges();
    click('2026-10-16');
    expect(toggle).toHaveBeenCalledExactlyOnceWith(blocked);
    expect(day('2026-10-17').disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('.calendar__switch')).toBeNull();
  });

  it('salta directamente a otro mes y rechaza meses pasados o vacíos', () => {
    setupMode();
    const month: HTMLInputElement = fixture.nativeElement.querySelector('input[type="month"]');
    month.value = '2027-04';
    month.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(day('2027-04-01')).not.toBeNull();
    month.value = '2026-09';
    month.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(month.value).toBe('2027-04');
    expect(day('2027-04-01')).not.toBeNull();
    month.value = '';
    month.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(month.value).toBe('2027-04');
  });
});
