import { rentalDays, isRentalRangeAvailable } from '../../shared/utils/rental-dates';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, Subscription } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ReservationService,
  Reserva,
  ReprogramacionReserva,
} from '../../shared/services/reservation.service';
import { AvailabilityService, FechaDisponible } from '../../shared/services/availability.service';
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
  private readonly calendarioApi = inject(AvailabilityService);
  private readonly destroyRef = inject(DestroyRef);
  private consultaCalendario?: Subscription;

  protected readonly propias = signal<Reserva[]>([]);
  protected readonly recibidas = signal<Reserva[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly ocupada = signal<number | null>(null);
  protected readonly vista = signal<'realizadas' | 'recibidas'>('realizadas');
  protected readonly codigos = signal<Record<number, string>>({});
  protected codigoIngresado: Record<number, string> = {};
  protected readonly mensaje = signal('');
  protected readonly editando = signal<Reserva | null>(null);
  protected readonly inicioNuevo = signal('');
  protected readonly calendario = signal<FechaDisponible[]>([]);
  protected readonly cargandoCalendario = signal(false);
  protected readonly errorCalendario = signal('');
  protected readonly finNuevo = computed(() => {
    const inicio = this.inicioNuevo();
    const reserva = this.editando();
    if (!reserva || !/^\d{4}-\d{2}-\d{2}$/.test(inicio)) return '';
    const fecha = new Date(`${inicio}T00:00:00Z`);
    if (!Number.isFinite(fecha.getTime())) return '';
    fecha.setUTCDate(fecha.getUTCDate() + this.dias(reserva) - 1);
    return fecha.toISOString().slice(0, 10);
  });
  protected readonly rangoDisponible = computed(() => {
    const reserva = this.editando();
    const inicio = this.inicioNuevo();
    const fin = this.finNuevo();
    if (
      !reserva ||
      !fin ||
      inicio < this.hoy() ||
      this.cargandoCalendario() ||
      this.errorCalendario()
    )
      return false;
    const fechas = this.calendario().map((f) => {
      const dia = f.fecha.slice(0, 10);
      return dia >= reserva.fecha_inicio! && dia <= reserva.fecha_fin!
        ? { ...f, disponible: true, reserva: null }
        : f;
    });
    return isRentalRangeAvailable(inicio, fin, fechas);
  });

  constructor() {
    const paymentResult = this.route.snapshot.queryParamMap.get('payment');
    if (paymentResult) {
      const queryParams = Object.fromEntries(
        this.route.snapshot.queryParamMap.keys.map((key) => [
          key,
          this.route.snapshot.queryParamMap.get(key),
        ]),
      );
      this.router.navigate(['/reserva/resultado'], { queryParams, replaceUrl: true });
      return;
    }

    this.cargarReservas();
  }

  private cargarReservas(): void {
    forkJoin({
      propias: this.reservasApi.mine(),
      recibidas: this.reservasApi.received(),
    }).subscribe({
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

  protected puedeReprogramar(reserva: Reserva): boolean {
    return (
      !reserva.cancelada &&
      !reserva.finalizada &&
      reserva.estado_pago === 'APROBADO' &&
      !!reserva.publicacion &&
      !!reserva.fecha_inicio &&
      !!reserva.fecha_fin &&
      this.dias(reserva) > 0
    );
  }

  protected dias(reserva: Reserva): number {
    return rentalDays(reserva.fecha_inicio, reserva.fecha_fin);
  }

  protected hoy(): string {
    const fecha = new Date();
    return [
      fecha.getFullYear(),
      String(fecha.getMonth() + 1).padStart(2, '0'),
      String(fecha.getDate()).padStart(2, '0'),
    ].join('-');
  }

  protected abrirReprogramacion(reserva: Reserva): void {
    if (!this.puedeReprogramar(reserva) || this.ocupada() !== null) return;
    this.error.set('');
    this.mensaje.set('');
    this.editando.set(reserva);
    this.inicioNuevo.set(reserva.fecha_inicio!);
    this.cargarCalendario(reserva);
  }

  protected cargarCalendario(reserva: Reserva): void {
    this.consultaCalendario?.unsubscribe();
    this.calendario.set([]);
    this.errorCalendario.set('');
    this.cargandoCalendario.set(true);
    this.consultaCalendario = this.calendarioApi
      .getByPublication(reserva.publicacion!.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (fechas) => {
          this.calendario.set(fechas);
          this.cargandoCalendario.set(false);
        },
        error: () => {
          this.errorCalendario.set('No pudimos consultar las fechas disponibles.');
          this.cargandoCalendario.set(false);
        },
      });
  }

  protected cerrarReprogramacion(): void {
    if (this.ocupada() !== null) return;
    this.consultaCalendario?.unsubscribe();
    this.editando.set(null);
  }

  protected confirmarReprogramacion(): void {
    const reserva = this.editando();
    if (
      !reserva ||
      !this.rangoDisponible() ||
      this.inicioNuevo() === reserva.fecha_inicio ||
      this.ocupada() !== null
    )
      return;
    this.error.set('');
    this.mensaje.set('');
    this.ocupada.set(reserva.id);
    this.reservasApi
      .reschedule(reserva.id, this.inicioNuevo(), this.finNuevo())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (actualizada) => {
          this.reemplazar(actualizada);
          this.cerrarReprogramacion();
          this.mensaje.set(
            this.avisosPendientes(actualizada).length
              ? 'Fechas actualizadas. El correo al anunciante sigue pendiente; podés reintentar el aviso.'
              : 'Fechas actualizadas. Avisamos al anunciante por correo. Se conserva el total pagado.',
          );
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'No se pudo reprogramar la reserva.');
          this.ocupada.set(null);
          if (err.status === 409) this.cargarCalendario(reserva);
        },
      });
  }

  protected ultimoCambio(reserva: Reserva): ReprogramacionReserva | undefined {
    return [...(reserva.reprogramaciones ?? [])].sort((a, b) => b.id - a.id)[0];
  }

  protected avisosPendientes(reserva: Reserva): ReprogramacionReserva[] {
    return (reserva.reprogramaciones ?? []).filter((cambio) => !cambio.notificada_en);
  }

  protected reintentarAviso(reserva: Reserva, cambio: ReprogramacionReserva): void {
    if (this.ocupada() !== null) return;
    this.error.set('');
    this.mensaje.set('');
    this.ocupada.set(reserva.id);
    this.reservasApi
      .retryRescheduleNotice(reserva.id, cambio.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (actualizada) => {
          this.reemplazar(actualizada);
          const enviado = actualizada.reprogramaciones?.find(
            (c) => c.id === cambio.id,
          )?.notificada_en;
          this.mensaje.set(
            enviado
              ? 'Aviso enviado al anunciante por correo.'
              : 'El correo sigue pendiente. Intentá nuevamente más tarde.',
          );
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'No se pudo reintentar el aviso.');
          this.ocupada.set(null);
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
    const motivo = window
      .prompt('Contanos qué ocurrió. La liquidación quedará en revisión administrativa:')
      ?.trim();
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

  protected monto(valor: number, moneda?: string | null): string {
    return Number(valor).toLocaleString('es-AR', { style: 'currency', currency: moneda ?? 'ARS' });
  }

  protected inquilino(reserva: Reserva): string {
    return (
      [
        reserva.usuario_nombre ?? reserva.usuario?.nombre,
        reserva.usuario_apellido ?? reserva.usuario?.apellido,
      ]
        .filter(Boolean)
        .join(' ') || 'Inquilino eliminado'
    );
  }

  protected activas(reservas: Reserva[]): number {
    return reservas.filter(
      (reserva) => !reserva.cancelada && !reserva.finalizada && reserva.estado_pago === 'APROBADO',
    ).length;
  }

  protected detalleReserva(reserva: Reserva): { reserva_id: number } {
    return { reserva_id: reserva.id };
  }

  private reemplazar(actualizada: Reserva): void {
    this.propias.update((items) =>
      items.map((item) => (item.id === actualizada.id ? { ...item, ...actualizada } : item)),
    );
    this.recibidas.update((items) =>
      items.map((item) => (item.id === actualizada.id ? { ...item, ...actualizada } : item)),
    );
    this.ocupada.set(null);
  }
}
