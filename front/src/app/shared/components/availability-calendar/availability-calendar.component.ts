import { Component, EventEmitter, Output, computed, input, signal } from '@angular/core';
import { FechaDisponible } from '../../services/availability.service';

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

  @Output() dateSelected = new EventEmitter<string>();
  @Output() availabilityToggle = new EventEmitter<FechaDisponible>();

  private readonly today = this.toIso(new Date());
  protected readonly month = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  protected readonly weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
  protected readonly monthLabel = computed(() =>
    new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(this.month()),
  );
  protected readonly days = computed<(CalendarDay | null)[]>(() => {
    const year = this.month().getFullYear();
    const month = this.month().getMonth();
    const firstWeekDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const count = new Date(year, month + 1, 0).getDate();
    const byDate = new Map(this.dates().map((item) => [this.normalize(item.fecha), item]));
    const result: (CalendarDay | null)[] = Array.from({ length: firstWeekDay }, () => null);

    for (let day = 1; day <= count; day += 1) {
      const iso = this.toIso(new Date(year, month, day));
      result.push({ iso, day, record: byDate.get(iso) ?? null, past: iso < this.today });
    }
    return result;
  });

  protected previousMonth(): void {
    this.month.update((value) => new Date(value.getFullYear(), value.getMonth() - 1, 1));
  }

  protected nextMonth(): void {
    this.month.update((value) => new Date(value.getFullYear(), value.getMonth() + 1, 1));
  }

  protected select(day: CalendarDay): void {
    if (day.past) return;
    if (this.mode() === 'manage') {
      if (day.record) this.availabilityToggle.emit(day.record);
      return;
    }
    if (this.mode() === 'select' && !day.record?.disponible) return;
    this.dateSelected.emit(day.iso);
  }

  protected isDisabled(day: CalendarDay): boolean {
    if (day.past) return true;
    if (this.mode() === 'setup') return false;
    if (this.mode() === 'manage') return !day.record || !!day.record.reserva;
    return !day.record?.disponible;
  }

  protected isInRange(iso: string): boolean {
    const start = this.selectedStart();
    const end = this.selectedEnd();
    return !!start && !!end && iso >= start && iso <= end;
  }

  protected isBooked(day: CalendarDay): boolean {
    return !!day.record?.reserva;
  }

  private normalize(value: string): string {
    return value.slice(0, 10);
  }

  private toIso(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
