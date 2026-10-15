import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ReservaResultadoComponent } from './reserva-resultado.component';
import { AuthService } from '../../core/services/auth.service';
import { ChatService } from '../../core/services/chat.service';
import {
  CodigoAlojamiento,
  Reserva,
  ReservationService,
} from '../../shared/services/reservation.service';

describe('Código de ingreso en el resultado de la reserva', () => {
  let fixture: ComponentFixture<ReservaResultadoComponent> | undefined;
  let clipboardOriginal: PropertyDescriptor | undefined;
  const usuario = signal({ sub: 2 });
  const route = { snapshot: { queryParamMap: convertToParamMap({ reserva_id: '37' }) } };
  const api = { summary: vi.fn(), reconcilePayment: vi.fn(), lodgingCode: vi.fn() };
  const copiar = vi.fn();
  const codigo: CodigoAlojamiento = {
    reserva_id: 37,
    codigo: 'B8R2T6X9',
    generado_en: '2026-10-15T12:00:00Z',
    validado_en: null,
    estado_liquidacion: 'RETENIDO',
  };
  const reserva = (cambios: Partial<Reserva> = {}): Reserva =>
    ({
      id: 37,
      estado_pago: 'APROBADO',
      finalizada: false,
      cancelada: false,
      codigo_validado_en: null,
      fecha_inicio: '2026-10-16',
      fecha_fin: '2026-10-18',
      usuario: { id: 2 },
      publicacion: { id: 42, titulo: 'Departamento de prueba' },
      ...cambios,
    }) as Reserva;
  const texto = () => fixture!.nativeElement.textContent as string;
  const boton = (etiqueta: string): HTMLButtonElement =>
    [...fixture!.nativeElement.querySelectorAll('button')].find(
      (elemento: HTMLButtonElement) => elemento.textContent?.trim() === etiqueta,
    )!;

  beforeEach(async () => {
    vi.resetAllMocks();
    usuario.set({ sub: 2 });
    route.snapshot.queryParamMap = convertToParamMap({ reserva_id: '37' });
    api.summary.mockReturnValue(of({ reserva: reserva(), pago: null }));
    api.lodgingCode.mockReturnValue(of(codigo));
    copiar.mockResolvedValue(undefined);
    clipboardOriginal = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: copiar },
    });
    await TestBed.configureTestingModule({
      imports: [ReservaResultadoComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: route },
        { provide: ReservationService, useValue: api },
        { provide: AuthService, useValue: { currentUser: usuario } },
        { provide: ChatService, useValue: {} },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    fixture?.destroy();
    fixture = undefined;
    if (clipboardOriginal) Object.defineProperty(navigator, 'clipboard', clipboardOriginal);
    else Reflect.deleteProperty(navigator, 'clipboard');
  });

  function mostrar(): void {
    fixture = TestBed.createComponent(ReservaResultadoComponent);
    fixture.detectChanges();
  }

  it('consulta automáticamente el código real del inquilino y permite copiarlo', async () => {
    mostrar();
    expect(api.lodgingCode).toHaveBeenCalledExactlyOnceWith(37);
    expect(texto()).toContain(codigo.codigo);
    boton('Copiar código').click();
    await fixture!.whenStable();
    expect(copiar).toHaveBeenCalledExactlyOnceWith(codigo.codigo);
    expect(texto()).toContain('Copiado');
  });

  it.each<Partial<Reserva>>([
    { estado_pago: 'PENDIENTE' },
    { estado_pago: 'RECHAZADO' },
    { estado_pago: 'CANCELADO' },
    { estado_pago: 'REEMBOLSADO' },
    { cancelada: true },
  ])('no consulta ni muestra el código para una reserva no habilitada: %j', (cambios) => {
    api.summary.mockReturnValue(of({ reserva: reserva(cambios), pago: null }));
    mostrar();
    expect(api.lodgingCode).not.toHaveBeenCalled();
    expect(texto()).not.toContain('Tu código de ingreso');
  });

  it('no consulta ni revela el código al propietario u otro usuario', () => {
    usuario.set({ sub: 9 });
    mostrar();
    expect(api.lodgingCode).not.toHaveBeenCalled();
    expect(texto()).not.toContain('Tu código de ingreso');
  });

  it('muestra la carga del código sin bloquear el resumen y descarta la consulta al salir', () => {
    const pendiente = new Subject<CodigoAlojamiento>();
    api.lodgingCode.mockReturnValue(pendiente);
    mostrar();
    expect(texto()).toContain('Reserva confirmada');
    expect(texto()).toContain('Cargando tu código de ingreso');
    expect(pendiente.observed).toBe(true);
    fixture!.destroy();
    fixture = undefined;
    expect(pendiente.observed).toBe(false);
  });

  it('permite reintentar si falla el código sin repetir la consulta del pago', () => {
    api.lodgingCode.mockReturnValueOnce(throwError(() => new Error('Sin conexión')));
    mostrar();
    expect(texto()).toContain('No pudimos cargar tu código');
    expect(texto()).toContain('Reserva confirmada');
    boton('Reintentar').click();
    fixture!.detectChanges();
    expect(api.lodgingCode).toHaveBeenCalledTimes(2);
    expect(api.summary).toHaveBeenCalledTimes(1);
    expect(texto()).toContain(codigo.codigo);
  });

  it('ofrece copiar manualmente cuando el navegador deniega el portapapeles', async () => {
    copiar.mockRejectedValue(new Error('Permiso denegado'));
    mostrar();
    boton('Copiar código').click();
    await fixture!.whenStable();
    expect(texto()).toContain('copiarlo manualmente');
    expect(texto()).toContain(codigo.codigo);
    expect(boton('Copiar código')).toBeDefined();
  });

  it('muestra el estado de un código ya usado sin volver a revelarlo', () => {
    api.summary.mockReturnValue(
      of({
        reserva: reserva({ codigo_validado_en: '2026-10-16T14:00:00Z' }),
        pago: null,
      }),
    );
    mostrar();
    expect(api.lodgingCode).not.toHaveBeenCalled();
    expect(texto()).toContain('ya fue validado por el propietario');
    expect(texto()).not.toContain(codigo.codigo);
  });

  it('no revela un código que se validó entre cargar el resumen y consultar el código', () => {
    api.lodgingCode.mockReturnValue(of({ ...codigo, validado_en: '2026-10-16T14:00:00Z' }));
    mostrar();
    expect(texto()).toContain('ya fue validado por el propietario');
    expect(texto()).not.toContain(codigo.codigo);
  });

  it('espera la conciliación del pago antes de pedir el resumen y el código', () => {
    const conciliacion = new Subject();
    route.snapshot.queryParamMap = convertToParamMap({
      reserva_id: '37',
      payment: 'success',
      payment_id: '123456',
    });
    api.reconcilePayment.mockReturnValue(conciliacion);
    mostrar();
    expect(api.summary).not.toHaveBeenCalled();
    expect(api.lodgingCode).not.toHaveBeenCalled();
    conciliacion.next({});
    fixture!.detectChanges();
    expect(api.summary).toHaveBeenCalledExactlyOnceWith(37);
    expect(api.lodgingCode).toHaveBeenCalledExactlyOnceWith(37);
    expect(texto()).toContain(codigo.codigo);
  });
});
