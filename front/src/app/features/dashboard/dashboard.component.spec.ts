import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../core/services/auth.service';
import { GestionPublicacionesService } from '../../shared/services/gestion-publicaciones.service';
import { Reserva, ReservationService } from '../../shared/services/reservation.service';

describe('Reservas vigentes en el panel del anunciante', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  const api = { received: vi.fn() };
  const reserva = (id: number, estado: Reserva['estado_estadia']) =>
    ({
      id,
      estado_estadia: estado,
      estado_pago: 'APROBADO',
      cancelada: false,
      finalizada: false,
      monto_pago: 100,
    }) as Reserva;

  beforeEach(async () => {
    vi.resetAllMocks();
    api.received.mockReturnValue(
      of([
        reserva(1, 'CONFIRMADA'),
        reserva(2, 'PENDIENTE_INGRESO'),
        reserva(3, 'EN_CURSO'),
        reserva(4, 'FINALIZADA'),
        reserva(5, 'INGRESO_NO_VERIFICADO'),
      ]),
    );
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { currentUser: () => ({ sub: 3 }) } },
        { provide: GestionPublicacionesService, useValue: { listarMias: () => of([]) } },
        { provide: ReservationService, useValue: api },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
  });
  afterEach(() => fixture.destroy());

  it('excluye las estadías terminadas del contador vigente y conserva el historial de pagos', () => {
    const tarjeta = fixture.nativeElement.querySelectorAll('.kpi-card')[2] as HTMLElement;
    expect(tarjeta.textContent).toContain('3 pendientes o en curso');
    expect(tarjeta.querySelector('strong')!.textContent).toBe('5');
  });

  it('actualiza los contadores al recuperar el foco', async () => {
    api.received.mockReturnValue(of([reserva(1, 'INGRESO_NO_VERIFICADO')]));
    window.dispatchEvent(new Event('focus'));
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('0 pendientes o en curso');
  });
});
