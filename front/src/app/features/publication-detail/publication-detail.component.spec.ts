import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { NEVER, Subject, of } from 'rxjs';
import { vi } from 'vitest';
import { PublicationDetailComponent } from './publication-detail.component';
import { AuthService } from '../../core/services/auth.service';
import { ChatService } from '../../core/services/chat.service';
import { ListingService } from '../home/listing.service';
import { AvailabilityService, FechaDisponible } from '../../shared/services/availability.service';
import { ReservationService } from '../../shared/services/reservation.service';
import { FavoritesService } from '../../shared/services/favorites.service';

describe('Fechas de la reserva', () => {
  let fixture: ComponentFixture<PublicationDetailComponent>;
  let availability: Subject<FechaDisponible[]>;
  const checkout = vi.fn();
  const day = (iso: string): HTMLButtonElement =>
    fixture.nativeElement.querySelector(`[data-date="${iso}"]`);
  const reserve = (): HTMLButtonElement => fixture.nativeElement.querySelector('[data-reserve]');
  const available = (fecha: string) => ({ fecha, disponible: true });

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 13, 12));
    availability = new Subject();
    checkout.mockReset().mockReturnValue(NEVER);
    await TestBed.configureTestingModule({
      imports: [PublicationDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '42' }) } },
        },
        { provide: Router, useValue: { navigate: vi.fn(), url: '/publicaciones/42' } },
        {
          provide: AuthService,
          useValue: { isAuthenticated: true, currentUser: () => ({ sub: '2' }) },
        },
        { provide: ChatService, useValue: {} },
        { provide: FavoritesService, useValue: { isFavorite: () => false } },
        {
          provide: ListingService,
          useValue: {
            getById: () => of({ id: 42, precio: 25000, modalidad: { nombre: 'Temporario' } }),
            registerView: () => of(undefined),
          },
        },
        { provide: AvailabilityService, useValue: { getByPublication: () => availability } },
        { provide: ReservationService, useValue: { createCheckout: checkout } },
      ],
    })
      .overrideComponent(PublicationDetailComponent, {
        set: {
          template: `
        <app-availability-calendar [dates]="availability()" [loading]="availabilityLoading()"
          [selectedStart]="selectedStart()" [selectedEnd]="selectedEnd()"
          (rangeChange)="selectBookingDate($event)" />
        <p data-total>{{ bookingDays() }} / {{ bookingTotal() }}</p>
        <button data-reserve [disabled]="!bookingDays() || availabilityLoading()" (click)="openPayment()">Reservar</button>
      `,
        },
      })
      .compileComponents();
    fixture = TestBed.createComponent(PublicationDetailComponent);
    fixture.detectChanges();
  });
  afterEach(() => vi.useRealTimers());

  it('habilita una reserva de un día, cobra una tarifa diaria y envía la misma fecha en ambos extremos', () => {
    expect(reserve().disabled).toBe(true);
    availability.next([available('2026-10-15')]);
    availability.complete();
    fixture.detectChanges();
    const single: HTMLButtonElement = [...fixture.nativeElement.querySelectorAll('button')].find(
      (item) => item.textContent?.trim() === 'Un día',
    )!;
    single.click();
    fixture.detectChanges();
    day('2026-10-15').click();
    fixture.detectChanges();
    expect(reserve().disabled).toBe(false);
    expect(fixture.nativeElement.querySelector('[data-total]').textContent).toContain('1 / 25000');
    reserve().click();
    expect(fixture.componentInstance['paymentOpen']()).toBe(true);
    fixture.componentInstance['confirmPayment'](new Event('submit'));
    expect(checkout).toHaveBeenCalledExactlyOnceWith({
      id_publicacion: 42,
      fecha_inicio: '2026-10-15',
      fecha_fin: '2026-10-15',
    });
  });

  it('exige un período completo y actualiza el precio al elegir el último día', () => {
    availability.next([available('2026-10-15'), available('2026-10-16')]);
    availability.complete();
    fixture.detectChanges();
    day('2026-10-15').click();
    fixture.detectChanges();
    expect(reserve().disabled).toBe(true);
    day('2026-10-16').click();
    fixture.detectChanges();
    expect(reserve().disabled).toBe(false);
    expect(fixture.nativeElement.querySelector('[data-total]').textContent).toContain('2 / 50000');
  });
});
