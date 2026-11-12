import { Component, DestroyRef, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ApiError } from '../../core/interceptors/api-error';
import { AvailabilityCalendarComponent } from '../../shared/components/availability-calendar/availability-calendar.component';
import type { FechaDisponible } from '../../shared/services/availability.service';
import { Reserva, ReservationService } from '../../shared/services/reservation.service';
import { isRentalRangeAvailable, rentalDays, RentalDateRange } from '../../shared/utils/rental-dates';
import { activarActualizacionReservas } from '../../shared/utils/reservation-refresh';

@Component({
  selector: 'app-reserva-reprogramacion',
  imports: [AvailabilityCalendarComponent],
  templateUrl: './reserva-reprogramacion.component.html',
  styleUrl: './reserva-reprogramacion.component.scss',
})
export class ReservaReprogramacionComponent implements OnInit {
  private readonly api = inject(ReservationService);
  private readonly destroyRef = inject(DestroyRef);
  readonly reserva = input.required<Reserva>();
  readonly cancelar = output<void>();
  readonly guardada = output<Reserva>();
  protected readonly dias = computed(() => rentalDays(this.reserva().fecha_inicio, this.reserva().fecha_fin));
  protected readonly fechas = signal<FechaDisponible[]>([]);
  protected readonly seleccion = signal<RentalDateRange>({ start: null, end: null });
  protected readonly consultando = signal(false);
  protected readonly actualizado = signal<Date | null>(null);
  protected readonly errorDisponibilidad = signal('');
  protected readonly guardando = signal(false);
  private readonly formatoFecha = new Intl.DateTimeFormat('es-AR', { dateStyle: 'long', timeZone: 'UTC' });
  protected readonly horaActualizada = computed(() => this.actualizado()?.toLocaleTimeString('es-AR'));
  protected readonly total = computed(() => {
    const reserva = this.reserva();
    return Number(reserva.importe_contratado ?? reserva.monto_pago).toLocaleString('es-AR', {
      style: 'currency', currency: reserva.moneda_contratada ?? 'ARS',
    });
  });
  protected readonly errorCambio = signal('');
  protected readonly rangoDisponible = computed(() => {
    const { start, end } = this.seleccion();
    return !!start && !!end && start !== this.reserva().fecha_inicio &&
      isRentalRangeAvailable(start, end, this.fechas());
  });

  constructor() {
    activarActualizacionReservas(() => this.consultar(), 15_000);
  }

  ngOnInit(): void {
    this.consultar();
  }

  protected consultar(): void {
    if (this.consultando() || this.guardando()) return;
    this.consultando.set(true);
    this.api.rescheduleAvailability(this.reserva().id).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.consultando.set(false)),
    ).subscribe({
      next: (fechas) => {
        this.fechas.set(fechas);
        this.errorDisponibilidad.set('');
        this.actualizado.set(new Date());
      },
      error: (error: ApiError) => {
        this.errorDisponibilidad.set(error.message || 'No pudimos consultar las fechas disponibles.');
      },
    });
  }

  protected fecha(valor: string | null): string {
    return valor ? this.formatoFecha.format(new Date(valor)) : '';
  }

  protected elegir(rango: RentalDateRange): void {
    this.errorCambio.set('');
    this.seleccion.set(rango);
  }

  protected confirmar(): void {
    const { start, end } = this.seleccion();
    if (!start || !end || !this.rangoDisponible() || this.consultando() ||
        this.errorDisponibilidad() || this.guardando()) return;
    this.errorCambio.set('');
    this.guardando.set(true);
    this.api.reschedule(this.reserva().id, start, end).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.guardando.set(false)),
    ).subscribe({
      next: (reserva) => this.guardada.emit(reserva),
      error: (error: ApiError) => {
        this.errorCambio.set(error.message);
        if (error.status === 409) {
          this.guardando.set(false);
          this.consultar();
        }
      },
    });
  }
}
