import { CurrencyPipe } from '@angular/common';
import { rentalDays, isRentalRangeAvailable } from '../../shared/utils/rental-dates';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, of, Subscription } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ReservationService,
  Reserva,
  ReprogramacionReserva,
  Reclamo,
} from '../../shared/services/reservation.service';
import { AvailabilityService, FechaDisponible } from '../../shared/services/availability.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { FormsModule } from '@angular/forms';
import { ApiError } from '../../core/interceptors/api-error';
import { activarActualizacionReservas } from '../../shared/utils/reservation-refresh';
import { estadiaActiva, etiquetasEstadia, puedeConsultarCodigo } from '../../shared/utils/reservation-state';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [RouterLink, SpinnerComponent, FormsModule, CurrencyPipe],
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
  private consultaReservas?: Subscription;
  protected readonly estadiaActiva = estadiaActiva;
  protected readonly puedeConsultarCodigo = puedeConsultarCodigo;

  protected readonly propias = signal<Reserva[]>([]);
  protected readonly recibidas = signal<Reserva[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly ocupada = signal<number | null>(null);
  protected readonly vista = signal<'realizadas' | 'recibidas' | 'reclamos'>('realizadas');
  protected readonly reclamos = signal<Reclamo[]>([]);
  protected readonly codigos = signal<Record<number, string>>({});
  protected codigoIngresado: Record<number, string> = {};
  protected readonly mensaje = signal('');
  protected readonly editando = signal<Reserva | null>(null);
  protected readonly reclamoAbierto = signal<Reserva | null>(null);
  protected readonly reclamoCategoria = signal<Reclamo['categoria']>('OTRO');
  protected readonly reclamoDescripcion = signal('');
  protected readonly reclamoArchivos = signal<File[]>([]);
  protected readonly reclamoEnviando = signal(false);
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
    activarActualizacionReservas(() => {
      if (this.ocupada() === null) this.cargarReservas(true);
    });
  }

  private cargarReservas(silenciosa = false): void {
    this.consultaReservas?.unsubscribe();
    this.consultaReservas = forkJoin({
      propias: this.reservasApi.mine(),
      recibidas: this.reservasApi.received(),
      reclamos: this.reservasApi.myClaims().pipe(catchError(() => of([]))),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ propias, recibidas, reclamos }) => {
        this.propias.set(propias);
        this.recibidas.set(recibidas);
        this.reclamos.set(reclamos);
        this.codigos.update((codigos) => Object.fromEntries(
          Object.entries(codigos).filter(([id]) => propias.some((r) => r.id === +id && puedeConsultarCodigo(r))),
        ));
        const editada = this.editando();
        if (editada) {
          const vigente = propias.find((r) => r.id === editada.id);
          if (!vigente || !this.puedeReprogramar(vigente)) this.cerrarReprogramacion();
        }
        this.cargando.set(false);
      },
      error: (err: ApiError) => {
        if (silenciosa) return;
        this.error.set(err.message);
        this.cargando.set(false);
      },
    });
  }

  protected puedeReprogramar(reserva: Reserva): boolean {
    return (
      !reserva.cancelada &&
      !reserva.finalizada &&
      reserva.estado_estadia === 'CONFIRMADA' &&
      !reserva.codigo_validado_en &&
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
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date());
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
      !reserva || !this.puedeReprogramar(reserva) ||
      !this.rangoDisponible() ||
      this.inicioNuevo() === reserva.fecha_inicio ||
      this.ocupada() !== null
    )
      return;
    this.error.set('');
    this.mensaje.set('');
    this.iniciarOperacion(reserva.id);
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
        error: (err: ApiError) => {
          this.error.set(err.message);
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
    this.iniciarOperacion(reserva.id);
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
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.ocupada.set(null);
        },
      });
  }

  protected cancelar(reserva: Reserva): void {
    this.iniciarOperacion(reserva.id);
    this.reservasApi.cancel(reserva.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (actualizada) => this.reemplazar(actualizada),
      error: (err: ApiError) => {
        this.error.set(err.message);
        this.ocupada.set(null);
      },
    });
  }

  protected puedeSolicitarCancelacion(reserva: Reserva): boolean {
    return (
      reserva.estado_pago === 'APROBADO' &&
      !reserva.cancelada &&
      !reserva.finalizada &&
      reserva.estado_estadia === 'CONFIRMADA' &&
      !reserva.codigo_validado_en &&
      reserva.estado_liquidacion !== 'EN_REVISION' &&
      reserva.estado_liquidacion !== 'PAGADO_PROPIETARIO' &&
      reserva.estado_liquidacion !== 'DEVUELTO_INQUILINO' &&
      reserva.estado_liquidacion !== 'DEVUELTO_PARCIAL_INQUILINO'
    );
  }

  protected solicitarCancelacion(reserva: Reserva): void {
    const motivo = window
      .prompt(
        'Motivo de la cancelación. La solicitud será revisada por un administrador:',
      )
      ?.trim();
    if (!motivo) return;
    if (motivo.length < 10) {
      this.error.set('El motivo debe tener al menos diez caracteres.');
      return;
    }
    this.iniciarOperacion(reserva.id);
    this.error.set('');
    this.reservasApi
      .requestCancellation(reserva.id, motivo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.mensaje.set(
            'Solicitud de cancelación enviada. Un administrador revisará la devolución.',
          );
          this.ocupada.set(null);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.ocupada.set(null);
        },
      });
  }

  protected verCodigo(reserva: Reserva): void {
    if (!puedeConsultarCodigo(reserva)) return;
    this.iniciarOperacion(reserva.id);
    this.error.set('');
    this.reservasApi.lodgingCode(reserva.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (resultado) => {
        this.codigos.update((actuales) => ({ ...actuales, [reserva.id]: resultado.codigo }));
        this.ocupada.set(null);
      },
      error: (err: ApiError) => {
        this.error.set(err.message);
        this.ocupada.set(null);
      },
    });
  }

  protected validarCodigo(reserva: Reserva): void {
    if (reserva.estado_estadia !== 'PENDIENTE_INGRESO') return;
    const codigo = (this.codigoIngresado[reserva.id] ?? '').trim().toUpperCase();
    if (codigo.length !== 8) {
      this.error.set('El código debe tener ocho caracteres.');
      return;
    }
    this.iniciarOperacion(reserva.id);
    this.error.set('');
    this.reservasApi.validateLodgingCode(reserva.id, codigo).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (actualizada) => {
        this.codigoIngresado[reserva.id] = '';
        this.reemplazar(actualizada);
      },
      error: (err: ApiError) => {
        this.error.set(err.message);
        this.ocupada.set(null);
      },
    });
  }

  protected abrirReclamo(reserva: Reserva): void {
    this.reclamoAbierto.set(reserva);
    this.reclamoCategoria.set('OTRO');
    this.reclamoDescripcion.set('');
    this.reclamoArchivos.set([]);
    this.error.set('');
  }

  protected cerrarReclamo(): void {
    if (this.reclamoEnviando()) return;
    this.reclamoAbierto.set(null);
  }

  protected seleccionarArchivos(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivos = Array.from(input.files ?? []);
    if (archivos.some((archivo) => !['image/jpeg', 'image/png'].includes(archivo.type))) {
      this.error.set('Solo se admiten imágenes JPEG o PNG.');
      input.value = '';
      return;
    }
    if (archivos.some((archivo) => archivo.size > 5 * 1024 * 1024)) {
      this.error.set('Cada imagen puede pesar hasta 5 MB.');
      input.value = '';
      return;
    }
    if (archivos.length > 5) {
      this.error.set('Podés adjuntar hasta 5 imágenes.');
      input.value = '';
      return;
    }
    this.error.set('');
    this.reclamoArchivos.set(archivos);
  }

  protected enviarReclamo(): void {
    const reserva = this.reclamoAbierto();
    if (!reserva || this.reclamoEnviando()) return;
    const descripcion = this.reclamoDescripcion().trim();
    if (descripcion.length < 20) {
      this.error.set('La descripción debe tener al menos veinte caracteres.');
      return;
    }
    this.reclamoEnviando.set(true);
    this.error.set('');
    this.reservasApi
      .createClaim({
        id_reserva: reserva.id,
        categoria: this.reclamoCategoria(),
        descripcion,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (reclamo) => {
          const archivos = this.reclamoArchivos();
          if (!archivos.length) {
            this.finalizarReclamo();
            return;
          }
          this.reservasApi
            .uploadClaimEvidence(reclamo.id, archivos)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => this.finalizarReclamo(),
              error: (err: ApiError) => {
                this.error.set(
                  `El reclamo se creó, pero no se pudieron subir las imágenes: ${err.message}`,
                );
                this.reclamoEnviando.set(false);
              },
            });
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.reclamoEnviando.set(false);
        },
      });
  }

  protected responderReclamo(reclamo: Reclamo): void {
    const texto = window.prompt('Mensaje para el hilo del reclamo:')?.trim();
    if (!texto) return;
    this.error.set('');
    this.reservasApi
      .sendClaimMessage(reclamo.id, texto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.mensaje.set('Mensaje enviado al hilo del reclamo.');
          this.cargarReservas(true);
        },
        error: (err: ApiError) => this.error.set(err.message),
      });
  }

  private finalizarReclamo(): void {
    this.reclamoEnviando.set(false);
    this.reclamoAbierto.set(null);
    this.reclamoArchivos.set([]);
    this.mensaje.set(
      'Reclamo enviado. Un administrador puede contactarte por el hilo del reclamo.',
    );
    this.cargarReservas(true);
  }

  protected estado(reserva: Reserva): string {
    return etiquetasEstadia[reserva.estado_estadia];
  }

  protected estadoLiquidacion(reserva: Reserva): string {
    const etiquetas: Record<Reserva['estado_liquidacion'], string> = {
      NO_APLICA: 'Sin liquidación',
      RETENIDO: 'Dinero retenido hasta el ingreso',
      PENDIENTE_PAGO_PROPIETARIO: 'Ingreso confirmado · pago administrativo pendiente',
      EN_REVISION: 'En revisión administrativa',
      PAGADO_PROPIETARIO: 'Pago al propietario registrado',
      DEVUELTO_INQUILINO: 'Devolución al inquilino registrada',
      DEVUELTO_PARCIAL_INQUILINO: 'Devolución parcial al inquilino registrada',
    };
    return etiquetas[reserva.estado_liquidacion] ?? 'Estado no disponible';
  }

  protected fecha(valor: string | null): string {
    return valor ? new Date(`${valor.slice(0, 10)}T12:00:00`).toLocaleDateString('es-AR') : '—';
  }

  protected monto(valor: number, moneda?: string | null, decimales = 2): string {
    return Number(valor).toLocaleString('es-AR', {
      style: 'currency',
      currency: moneda ?? 'ARS',
      maximumFractionDigits: decimales,
    });
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
    return reservas.filter(estadiaActiva).length;
  }

  protected detalleReserva(reserva: Reserva): { reserva_id: number } {
    return { reserva_id: reserva.id };
  }

  private iniciarOperacion(id: number): void {
    // Una consulta anterior a la escritura no debe restaurar datos desactualizados.
    this.consultaReservas?.unsubscribe();
    this.ocupada.set(id);
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
