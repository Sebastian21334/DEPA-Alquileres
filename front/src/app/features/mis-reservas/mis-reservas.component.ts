import { Component, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReservationService, Reserva } from '../../shared/services/reservation.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [RouterLink, SpinnerComponent, FormsModule],
  templateUrl: './mis-reservas.component.html',
  styleUrl: './mis-reservas.component.scss',
})
export class MisReservasComponent {
  private readonly reservasApi = inject(ReservationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly propias = signal<Reserva[]>([]);
  protected readonly recibidas = signal<Reserva[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly ocupada = signal<number | null>(null);
  protected readonly vista = signal<'realizadas' | 'recibidas'>('realizadas');
  protected readonly codigos = signal<Record<number, string>>({});
  protected codigoIngresado: Record<number, string> = {};

  constructor() {
    const paymentResult = this.route.snapshot.queryParamMap.get('payment');
    if (paymentResult) {
      const queryParams = Object.fromEntries(
        this.route.snapshot.queryParamMap.keys.map((key) => [key, this.route.snapshot.queryParamMap.get(key)]),
      );
      this.router.navigate(['/reserva/resultado'], { queryParams, replaceUrl: true });
      return;
    }

    this.cargarReservas();
  }

  private cargarReservas(): void {
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

  protected verCodigo(reserva: Reserva): void {
    this.ocupada.set(reserva.id);
    this.error.set('');
    this.reservasApi.lodgingCode(reserva.id).subscribe({
      next: (resultado) => {
        this.codigos.update((actuales) => ({ ...actuales, [reserva.id]: resultado.codigo }));
        this.ocupada.set(null);
      },
      error: (err) => {
        this.error.set(err.message ?? 'No se pudo consultar el código.');
        this.ocupada.set(null);
      },
    });
  }

  protected validarCodigo(reserva: Reserva): void {
    const codigo = (this.codigoIngresado[reserva.id] ?? '').trim().toUpperCase();
    if (codigo.length !== 8) {
      this.error.set('El código debe tener ocho caracteres.');
      return;
    }
    this.ocupada.set(reserva.id);
    this.error.set('');
    this.reservasApi.validateLodgingCode(reserva.id, codigo).subscribe({
      next: (actualizada) => {
        this.codigoIngresado[reserva.id] = '';
        this.reemplazar(actualizada);
      },
      error: (err) => {
        this.error.set(err.message ?? 'No se pudo validar el código.');
        this.ocupada.set(null);
      },
    });
  }

  protected reportarProblema(reserva: Reserva): void {
    const motivo = window.prompt('Contanos qué ocurrió. La liquidación quedará en revisión administrativa:')?.trim();
    if (!motivo) return;
    if (motivo.length < 10) {
      this.error.set('El motivo debe tener al menos diez caracteres.');
      return;
    }
    this.ocupada.set(reserva.id);
    this.error.set('');
    this.reservasApi.reportProblem(reserva.id, motivo).subscribe({
      next: (actualizada) => this.reemplazar(actualizada),
      error: (err) => {
        this.error.set(err.message ?? 'No se pudo registrar el reclamo.');
        this.ocupada.set(null);
      },
    });
  }

  protected estado(reserva: Reserva): string {
    if (reserva.cancelada) return 'Cancelada';
    if (reserva.estado_pago === 'PENDIENTE') return 'Pendiente de pago';
    if (reserva.estado_pago === 'REEMBOLSADO') return 'Reembolsada';
    if (reserva.estado_pago === 'RECHAZADO') return 'Pago rechazado';
    return reserva.finalizada ? 'Finalizada' : 'Confirmada';
  }

  protected estadoLiquidacion(reserva: Reserva): string {
    const etiquetas: Record<Reserva['estado_liquidacion'], string> = {
      NO_APLICA: 'Sin liquidación',
      RETENIDO: 'Dinero retenido hasta el ingreso',
      PENDIENTE_PAGO_PROPIETARIO: 'Ingreso confirmado · pago administrativo pendiente',
      EN_REVISION: 'En revisión administrativa',
      PAGADO_PROPIETARIO: 'Pago al propietario registrado',
      DEVUELTO_INQUILINO: 'Devolución al inquilino registrada',
    };
    return etiquetas[reserva.estado_liquidacion] ?? 'Estado no disponible';
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

  protected activas(reservas: Reserva[]): number {
    return reservas.filter((reserva) =>
      !reserva.cancelada && !reserva.finalizada && reserva.estado_pago === 'APROBADO',
    ).length;
  }

  protected detalleReserva(reserva: Reserva): { reserva_id: number } {
    return { reserva_id: reserva.id };
  }

  private reemplazar(actualizada: Reserva): void {
    this.propias.update((items) => items.map((item) => item.id === actualizada.id ? { ...item, ...actualizada } : item));
    this.recibidas.update((items) => items.map((item) => item.id === actualizada.id ? { ...item, ...actualizada } : item));
    this.ocupada.set(null);
  }
}
