import { Component, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { RouterLink } from '@angular/router';
import { ReservationService, Reserva } from '../../shared/services/reservation.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [RouterLink, SpinnerComponent],
  templateUrl: './mis-reservas.component.html',
  styleUrl: './mis-reservas.component.scss',
})
export class MisReservasComponent {
  private readonly reservasApi = inject(ReservationService);

  protected readonly propias = signal<Reserva[]>([]);
  protected readonly recibidas = signal<Reserva[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly ocupada = signal<number | null>(null);

  constructor() {
    forkJoin({ propias: this.reservasApi.mine(), recibidas: this.reservasApi.received() }).subscribe({
      next: ({ propias, recibidas }) => {
        this.propias.set(propias);
        this.recibidas.set(recibidas);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudieron cargar las reservas.');
        this.cargando.set(false);
      },
    });
  }

  protected cancelar(reserva: Reserva): void {
    this.ocupada.set(reserva.id);
    this.reservasApi.cancel(reserva.id).subscribe({
      next: (actualizada) => this.reemplazar(actualizada),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo cancelar la reserva.');
        this.ocupada.set(null);
      },
    });
  }

  protected finalizar(reserva: Reserva): void {
    this.ocupada.set(reserva.id);
    this.reservasApi.finish(reserva.id).subscribe({
      next: (actualizada) => this.reemplazar(actualizada),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo finalizar la reserva.');
        this.ocupada.set(null);
      },
    });
  }

  protected estado(reserva: Reserva): string {
    if (reserva.cancelada) return 'Cancelada';
    return reserva.finalizada ? 'Finalizada' : 'Confirmada';
  }

  protected fecha(valor: string | null): string {
    return valor ? new Date(`${valor.slice(0, 10)}T12:00:00`).toLocaleDateString('es-AR') : '—';
  }

  protected monto(valor: number): string {
    return Number(valor).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
  }

  protected inquilino(reserva: Reserva): string {
    return [reserva.usuario_nombre ?? reserva.usuario?.nombre, reserva.usuario_apellido ?? reserva.usuario?.apellido]
      .filter(Boolean)
      .join(' ') || 'Inquilino eliminado';
  }

  private reemplazar(actualizada: Reserva): void {
    this.propias.update((items) => items.map((item) => item.id === actualizada.id ? { ...item, ...actualizada } : item));
    this.recibidas.update((items) => items.map((item) => item.id === actualizada.id ? { ...item, ...actualizada } : item));
    this.ocupada.set(null);
  }
}
