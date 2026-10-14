import { Component, EventEmitter, Output, computed, effect, input, signal } from '@angular/core';
import {
  FechaDisponible,
  FechaDisponibleAdministracion,
} from '../../services/availability.service';
import { RentalDateRange, isRentalRangeAvailable, rentalDays } from '../../utils/rental-dates';

export type CalendarMode = 'select' | 'manage' | 'setup';
interface CalendarDay {
  iso: string;
  day: number;
  record: FechaDisponible | null;
  past: boolean;
}

@Component({
  selector: 'app-availability-calendar',
  standalone: true,
  templateUrl: './availability-calendar.component.html',
  styleUrl: './availability-calendar.component.scss',
})
export class AvailabilityCalendarComponent {
  readonly dates = input<FechaDisponible[]>([]);
  readonly mode = input<CalendarMode>('select');
  readonly selectedStart = input<string | null>(null);
  readonly selectedEnd = input<string | null>(null);
  readonly loading = input(false);
  @Output() rangeChange = new EventEmitter<RentalDateRange>();
  @Output() availabilityToggle = new EventEmitter<FechaDisponibleAdministracion>();

  protected readonly today = this.toIso(new Date());
  protected readonly month = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  protected readonly selectionType = signal<'single' | 'range'>('range');
  protected readonly activeField = signal<'start' | 'end'>('start');
  protected readonly hoveredDate = signal<string | null>(null);
  protected readonly error = signal('');
  protected readonly weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
  protected readonly monthValue = computed(() => this.toIso(this.month()).slice(0, 7));
  protected readonly previousDisabled = computed(() => this.monthValue() <= this.today.slice(0, 7));
  protected readonly duration = computed(() =>
    rentalDays(this.selectedStart(), this.selectedEnd()),
  );
  protected readonly instruction = computed(() => {
    if (this.mode() === 'manage')
      return 'Tocá un día disponible para bloquearlo, o uno bloqueado para habilitarlo.';
    if (this.loading()) return 'Cargando días disponibles…';
    if (this.selectionType() === 'single')
      return 'Elegí el día que querés ' + (this.mode() === 'setup' ? 'habilitar.' : 'reservar.');
    if (this.selectedStart() && !this.selectedEnd())
      return 'Ahora elegí el último día. El primer y el último día están incluidos.';
    if (this.selectedEnd())
      return 'Podés cambiar las fechas o borrar la selección para empezar de nuevo.';
    return 'Elegí el primer y el último día del alquiler. Ambos están incluidos.';
  });
  protected readonly days = computed<(CalendarDay | null)[]>(() => {
    const year = this.month().getFullYear();
    const month = this.month().getMonth();
    const firstWeekDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const count = new Date(year, month + 1, 0).getDate();
    const byDate = new Map(this.dates().map((item) => [item.fecha.slice(0, 10), item]));
    const result: (CalendarDay | null)[] = Array.from({ length: firstWeekDay }, () => null);
    for (let day = 1; day <= count; day++) {
      const iso = this.toIso(new Date(year, month, day));
      result.push({ iso, day, record: byDate.get(iso) ?? null, past: iso < this.today });
    }
    return result;
  });
  protected readonly preview = computed(() => {
    const start = this.selectedStart();
    const hover = this.hoveredDate();
    if (!start || !hover || this.selectedEnd() || this.selectionType() === 'single') return null;
    const range = { start: start < hover ? start : hover, end: start < hover ? hover : start };
    return this.canSelectRange(range.start, range.end) ? range : null;
  });
  private positioned = false;

  constructor() {
    effect(() => {
      const start = this.selectedStart();
      const first = this.dates()
        .filter(
          (day) =>
            day.fecha.slice(0, 10) >= this.today &&
            (this.mode() === 'manage' || (day.disponible && !day.reserva)),
        )
        .map((day) => day.fecha.slice(0, 10))
        .sort()[0];
      if (this.positioned || (!start && !first && this.mode() !== 'setup')) return;
      this.positioned = true;
      const target = start ?? first;
      if (target && target >= this.today) {
        const date = this.parseDate(target);
        this.month.set(new Date(date.getFullYear(), date.getMonth(), 1));
      }
    });
  }

  protected setSelectionType(type: 'single' | 'range'): void {
    if (this.selectionType() === type) return;
    this.selectionType.set(type);
    this.error.set('');
    this.hoveredDate.set(null);
    const start = this.selectedStart();
    this.activeField.set(type === 'range' && start ? 'end' : 'start');
    this.rangeChange.emit({ start, end: type === 'single' ? start : null });
  }

  protected clear(): void {
    this.error.set('');
    this.hoveredDate.set(null);
    this.activeField.set('start');
    this.rangeChange.emit({ start: null, end: null });
  }

  protected editField(field: 'start' | 'end'): void {
    this.activeField.set(field);
    const date = field === 'start' ? this.selectedStart() : this.selectedEnd();
    if (date) {
      const value = this.parseDate(date);
      this.month.set(new Date(value.getFullYear(), value.getMonth(), 1));
    }
  }

  protected previousMonth(): void {
    if (!this.previousDisabled())
      this.month.update((v) => new Date(v.getFullYear(), v.getMonth() - 1, 1));
  }

  protected nextMonth(): void {
    this.month.update((v) => new Date(v.getFullYear(), v.getMonth() + 1, 1));
  }

  protected goToMonth(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (!/^\d{4}-\d{2}$/.test(value) || value < this.today.slice(0, 7)) {
      input.value = this.monthValue();
      return;
    }
    const [year, month] = value.split('-').map(Number);
    this.month.set(new Date(year, month - 1, 1));
  }

  protected select(day: CalendarDay): void {
    if (this.isDisabled(day)) return;
    if (this.mode() === 'manage') {
      this.availabilityToggle.emit(day.record as FechaDisponibleAdministracion);
      return;
    }
    this.error.set('');
    this.hoveredDate.set(null);
    if (this.selectionType() === 'single') {
      this.rangeChange.emit({ start: day.iso, end: day.iso });
      return;
    }
    const anchor = this.selectedStart();
    if (!anchor || this.activeField() === 'start') {
      this.rangeChange.emit({ start: day.iso, end: null });
      this.activeField.set('end');
      return;
    }
    const start = anchor < day.iso ? anchor : day.iso;
    const end = anchor < day.iso ? day.iso : anchor;
    if (!this.canSelectRange(start, end)) {
      this.error.set(
        'Ese período incluye días no disponibles. Elegí un período continuo de días disponibles.',
      );
      return;
    }
    this.rangeChange.emit({ start, end });
    this.activeField.set('start');
  }

  protected isDisabled(day: CalendarDay): boolean {
    if (day.past || this.loading()) return true;
    if (this.mode() === 'setup') return false;
    if (this.mode() === 'manage')
      return (
        !(day.record as Partial<FechaDisponibleAdministracion> | null)?.id || !!day.record?.reserva
      );
    return !day.record?.disponible || !!day.record.reserva;
  }

  protected isInRange(iso: string): boolean {
    const start = this.selectedStart();
    const end = this.selectedEnd();
    return !!start && !!end && iso >= start && iso <= end;
  }

  protected isPreview(iso: string): boolean {
    const range = this.preview();
    return !!range && iso >= range.start && iso <= range.end;
  }

  protected formatDate(iso: string | null): string {
    return iso
      ? new Intl.DateTimeFormat('es-AR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }).format(this.parseDate(iso))
      : 'Elegir fecha';
  }

  protected dayLabel(day: CalendarDay): string {
    const date = new Intl.DateTimeFormat('es-AR', { dateStyle: 'full' }).format(
      this.parseDate(day.iso),
    );
    const status = day.past
      ? 'pasado'
      : day.record?.reserva
        ? 'reservado'
        : this.isDisabled(day)
          ? 'no disponible'
          : 'disponible';
    return `${date}, ${status}`;
  }

  private canSelectRange(start: string, end: string): boolean {
    return this.mode() === 'setup' || isRentalRangeAvailable(start, end, this.dates());
  }

  private parseDate(value: string): Date {
    return new Date(`${value}T12:00:00`);
  }

  private toIso(value: Date): string {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  }
}
