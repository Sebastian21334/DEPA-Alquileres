import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';
import { MisReservasComponent } from './mis-reservas.component';
import { ApiError } from '../../core/interceptors/api-error';
import {
  Reserva,
  ReservationService,
  ReprogramacionReserva,
} from '../../shared/services/reservation.service';
import { AvailabilityService, FechaDisponible } from '../../shared/services/availability.service';

describe('Reprogramación desde Mis reservas', () => {
  let fixture: ComponentFixture<MisReservasComponent>;
  const api = {
    mine: vi.fn(),
    received: vi.fn(),
    reschedule: vi.fn(),
    retryRescheduleNotice: vi.fn(),
  };
  const calendario = { getByPublication: vi.fn() };
  const cambio: ReprogramacionReserva = {
    id: 9,
    fecha_inicio_anterior: '2100-01-01',
    fecha_fin_anterior: '2100-01-03',
    fecha_inicio_nueva: '2100-01-02',
    fecha_fin_nueva: '2100-01-04',
    creada_en: '2026-10-27T12:00:00Z',
    notificada_en: null,
  };
  const reserva = (datos: Partial<Reserva> = {}): Reserva =>
    ({
      id: 37,
      cancelada: false,
      finalizada: false,
      estado_pago: 'APROBADO',
      estado_liquidacion: 'RETENIDO',
      fecha_inicio: '2100-01-01',
      fecha_fin: '2100-01-03',
      monto_pago: 300,
      importe_contratado: 300,
      precio_unitario_contratado: 100,
      moneda_contratada: 'ARS',
      publicacion: { id: 42, titulo: 'Departamento de prueba' },
      reprogramaciones: [],
      ...datos,
    }) as Reserva;
  const actualizada = (notificada = true) =>
    reserva({
      fecha_inicio: cambio.fecha_inicio_nueva,
      fecha_fin: cambio.fecha_fin_nueva,
      reprogramaciones: [{ ...cambio, notificada_en: notificada ? cambio.creada_en : null }],
    });
  const fechas: FechaDisponible[] = Array.from({ length: 12 }, (_, i) => ({
    fecha: `2100-01-${String(i + 1).padStart(2, '0')}`,
    disponible: i >= 3,
  }));
  const texto = () => fixture.nativeElement.textContent as string;
  const boton = (nombre: string): HTMLButtonElement | undefined =>
    [...fixture.nativeElement.querySelectorAll('button')].find(
      (b: HTMLButtonElement) => b.textContent?.trim() === nombre,
    );

  beforeEach(async () => {
    vi.resetAllMocks();
    api.mine.mockReturnValue(of([reserva()]));
    api.received.mockReturnValue(of([]));
    api.reschedule.mockReturnValue(of(actualizada()));
    api.retryRescheduleNotice.mockReturnValue(of(actualizada()));
    calendario.getByPublication.mockReturnValue(of(fechas));
    await TestBed.configureTestingModule({
      imports: [MisReservasComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({}) } },
        },
        { provide: ReservationService, useValue: api },
        { provide: AvailabilityService, useValue: calendario },
      ],
    }).compileComponents();
  });
  afterEach(() => fixture?.destroy());
  function mostrar() {
    fixture = TestBed.createComponent(MisReservasComponent);
    fixture.detectChanges();
  }
  async function cambiarInicio(dia = '2100-01-02') {
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type=date]');
    input.value = dia;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('calcula la salida, permite conservar días propios y confirma sin cambiar duración ni importe', async () => {
    mostrar();
    boton('Cambiar fechas')!.click();
    fixture.detectChanges();
    expect(calendario.getByPublication).toHaveBeenCalledExactlyOnceWith(42);
    expect(boton('Confirmar reprogramación')!.disabled).toBe(true);
    await cambiarInicio();
    expect(texto()).toContain('4/1/2100');
    expect(texto()).toContain('3 días');
    expect(boton('Confirmar reprogramación')!.disabled).toBe(false);
    boton('Confirmar reprogramación')!.click();
    await fixture.whenStable();
    expect(api.reschedule).toHaveBeenCalledExactlyOnceWith(37, '2100-01-02', '2100-01-04');
    expect(fixture.nativeElement.querySelector('.reschedule-form')).toBeNull();
    expect(texto()).toContain('Avisamos al anunciante por correo');
    expect(texto()).toContain('Último cambio de fechas');
  });

  it.each<Partial<Reserva>>([
    { estado_pago: 'PENDIENTE' },
    { cancelada: true },
    { finalizada: true },
    { publicacion: null },
  ])('no ofrece cambiar fechas en una reserva inhabilitada: %j', (datos) => {
    api.mine.mockReturnValue(of([reserva(datos)]));
    mostrar();
    expect(boton('Cambiar fechas')).toBeUndefined();
  });

  it('deshabilita la confirmación si falta un día del nuevo rango', async () => {
    calendario.getByPublication.mockReturnValue(of(fechas.filter((f) => f.fecha !== '2100-01-06')));
    mostrar();
    boton('Cambiar fechas')!.click();
    fixture.detectChanges();
    await cambiarInicio('2100-01-05');
    expect(boton('Confirmar reprogramación')!.disabled).toBe(true);
    expect(texto()).toContain('El rango elegido no está disponible');
    expect(api.reschedule).not.toHaveBeenCalled();
  });

  it('mantiene el formulario y refresca la disponibilidad ante un conflicto del servidor', async () => {
    api.reschedule.mockReturnValue(
      throwError(() => new ApiError(409, 'Las fechas fueron ocupadas')),
    );
    mostrar();
    boton('Cambiar fechas')!.click();
    fixture.detectChanges();
    await cambiarInicio();
    boton('Confirmar reprogramación')!.click();
    await fixture.whenStable();
    expect(texto()).toContain('Las fechas fueron ocupadas');
    expect(fixture.nativeElement.querySelector('.reschedule-form')).not.toBeNull();
    expect(calendario.getByPublication).toHaveBeenCalledTimes(2);
  });

  it('informa el correo pendiente sin revertir el cambio y permite reintentar solo el aviso', async () => {
    api.reschedule.mockReturnValue(of(actualizada(false)));
    mostrar();
    boton('Cambiar fechas')!.click();
    fixture.detectChanges();
    await cambiarInicio();
    boton('Confirmar reprogramación')!.click();
    await fixture.whenStable();
    expect(texto()).toContain('El correo al anunciante sigue pendiente');
    boton('Reintentar aviso')!.click();
    await fixture.whenStable();
    expect(api.retryRescheduleNotice).toHaveBeenCalledExactlyOnceWith(37, 9);
    expect(api.reschedule).toHaveBeenCalledTimes(1);
    expect(boton('Reintentar aviso')).toBeUndefined();
    expect(texto()).toContain('Aviso enviado al anunciante');
  });

  it('muestra al anunciante el antes y después y los avisos pendientes al volver a cargar', async () => {
    api.mine.mockReturnValue(of([]));
    api.received.mockReturnValue(of([actualizada(false)]));
    mostrar();
    const tab: HTMLButtonElement = fixture.nativeElement.querySelectorAll('[role=tab]')[1];
    tab.click();
    await fixture.whenStable();
    expect(texto()).toContain('Último cambio de fechas');
    expect(texto()).toContain('Antes: 1/1/2100');
    expect(texto()).toContain('Ahora: 2/1/2100');
    expect(boton('Cambiar fechas')).toBeUndefined();
    expect(boton('Reintentar aviso')).toBeDefined();
  });

  it('permite reintentar la carga del calendario y descarta la consulta al cerrar', async () => {
    calendario.getByPublication.mockReturnValueOnce(throwError(() => new Error('Sin conexión')));
    const pendiente = new Subject<FechaDisponible[]>();
    calendario.getByPublication.mockReturnValueOnce(pendiente);
    mostrar();
    boton('Cambiar fechas')!.click();
    fixture.detectChanges();
    expect(texto()).toContain('No pudimos consultar las fechas');
    boton('Reintentar disponibilidad')!.click();
    fixture.detectChanges();
    expect(pendiente.observed).toBe(true);
    boton('Cerrar')!.click();
    await fixture.whenStable();
    expect(pendiente.observed).toBe(false);
  });
});
