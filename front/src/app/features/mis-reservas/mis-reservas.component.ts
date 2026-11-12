import { NgTemplateOutlet } from '@angular/common';
import { LucideCalendar, LucideCalendarX, LucideInfo, LucideChevronRight, LucideEllipsis, LucideExternalLink, LucideImage, LucideLockKeyhole, LucideTriangleAlert, LucideX } from '@lucide/angular';
import { Component, computed, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, forkJoin, of, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ReservationService,
  Reserva,
  ReprogramacionReserva,
  Reclamo,
} from '../../shared/services/reservation.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { FormsModule } from '@angular/forms';
import { ApiError } from '../../core/interceptors/api-error';
import { activarActualizacionReservas } from '../../shared/utils/reservation-refresh';
import { estadiaActiva, etiquetasEstadia, puedeConsultarCodigo, puedeReprogramar } from '../../shared/utils/reservation-state';
import { PerfilService } from '../../core/services/perfil.service';
import { ToastService } from '../../core/services/toast.service';
import { ClaimHistoryComponent } from '../../shared/components/claim-history/claim-history.component';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [
    RouterLink, SpinnerComponent, FormsModule, ClaimHistoryComponent, NgTemplateOutlet,
    LucideCalendar, LucideCalendarX, LucideInfo, LucideChevronRight, LucideEllipsis, LucideExternalLink,
    LucideImage, LucideLockKeyhole, LucideTriangleAlert, LucideX,
  ],
  templateUrl: './mis-reservas.component.html',
  styleUrl: './mis-reservas.component.scss',
})
export class MisReservasComponent {
  private readonly reservasApi = inject(ReservationService);
  private readonly toast = inject(ToastService);
  private readonly perfil = inject(PerfilService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private consultaReservas?: Subscription;
  protected readonly estadiaActiva = estadiaActiva;
  protected readonly puedeReprogramar = puedeReprogramar;
  protected readonly imagenesConError = signal<Record<number, string>>({});
  protected readonly puedeConsultarCodigo = puedeConsultarCodigo;
  protected readonly esAnunciante = this.perfil.esAnuncianteVerificado;

  protected readonly propias = signal<Reserva[]>([]);
  protected readonly recibidas = signal<Reserva[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly ocupada = signal<number | null>(null);
  protected readonly vista = signal<'realizadas' | 'recibidas' | 'reclamos'>('realizadas');
  protected readonly reclamos = signal<Reclamo[]>([]);
  protected readonly errorHistorial = signal('');
  protected readonly errorAccionReclamo = signal('');
  protected readonly errorReclamo = signal('');
  protected readonly respuestaReclamo = signal<number | null>(null);
  protected readonly enviandoRespuesta = signal(false);
  protected readonly subiendoEvidencia = signal<number | null>(null);
  protected textoRespuesta = '';
  protected readonly codigos = signal<Record<number, string>>({});
  protected codigoIngresado: Record<number, string> = {};
  protected readonly mensaje = signal('');
  private readonly dialogoCancelacion = viewChild.required<ElementRef<HTMLDialogElement>>('dialogoCancelacion');
  private consultaCancelacion?: Subscription;
  private accionCancelacion?: HTMLButtonElement;
  protected readonly reservaACancelar = signal<Reserva | null>(null);
  protected readonly estadoCancelacion = signal<'consultando' | 'formulario' | 'pendiente' | 'error'>('consultando');
  protected readonly motivoCancelacion = signal('');
  protected readonly errorCancelacion = signal('');
  protected readonly enviandoCancelacion = signal(false);

  protected readonly reclamoAbierto = signal<Reserva | null>(null);
  protected readonly reclamoCategoria = signal<Reclamo['categoria']>('OTRO');
  protected readonly reclamoDescripcion = signal('');
  protected readonly reclamoArchivos = signal<File[]>([]);
  protected readonly reclamoEnviando = signal(false);
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
      recibidas: this.perfil.esAnunciante().pipe(
        switchMap((esAnunciante) => esAnunciante ? this.reservasApi.received() : of<Reserva[]>([])),
      ),
      reclamos: this.reservasApi.myClaims().pipe(catchError((err: ApiError) => {
        this.errorHistorial.set(err.message);
        return of(null);
      })),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ propias, recibidas, reclamos }) => {
        this.propias.set(propias);
        this.recibidas.set(recibidas);
        if (reclamos) {
          this.reclamos.set(reclamos);
          this.errorHistorial.set('');
        }
        this.codigos.update((codigos) => Object.fromEntries(
          Object.entries(codigos).filter(([id]) => propias.some((r) => r.id === +id && puedeConsultarCodigo(r))),
        ));
        this.cargando.set(false);
      },
      error: (err: ApiError) => {
        if (silenciosa) return;
        this.error.set(err.message);
        this.cargando.set(false);
      },
    });
  }

  protected hoy(): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date());
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

  protected solicitarCancelacion(reserva: Reserva, accion: HTMLButtonElement): void {
    if (this.ocupada() !== null || !this.puedeSolicitarCancelacion(reserva)) return;
    this.accionCancelacion = accion;
    this.reservaACancelar.set(reserva);
    this.motivoCancelacion.set('');
    this.estadoCancelacion.set('consultando');
    this.errorCancelacion.set('');
    this.dialogoCancelacion().nativeElement.showModal();
    this.consultarCancelacion();
  }

  protected consultarCancelacion(): void {
    const reserva = this.reservaACancelar();
    if (!reserva) return;
    this.estadoCancelacion.set('consultando');
    this.errorCancelacion.set('');
    this.consultaCancelacion?.unsubscribe();
    this.consultaCancelacion = this.reservasApi.cancellationRequest(reserva.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pendiente) => this.estadoCancelacion.set(pendiente ? 'pendiente' : 'formulario'),
        error: (err: ApiError) => {
          this.estadoCancelacion.set('error');
          this.errorCancelacion.set(err.message);
        },
      });
  }

  protected enviarCancelacion(): void {
    const reserva = this.reservaACancelar();
    const motivo = this.motivoCancelacion().trim();
    if (!reserva || this.estadoCancelacion() !== 'formulario' || this.enviandoCancelacion() ||
        motivo.length < 10 || motivo.length > 500) return;
    this.errorCancelacion.set('');
    this.enviandoCancelacion.set(true);
    this.reservasApi.requestCancellation(reserva.id, motivo)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.enviandoCancelacion.set(false)),
      )
      .subscribe({
        next: () => {
          this.estadoCancelacion.set('pendiente');
          this.toast.mostrar('Solicitud de cancelación enviada. Está en revisión.', 'exito');
        },
        error: (err: ApiError) => this.errorCancelacion.set(err.message),
      });
  }

  protected cerrarCancelacion(evento?: Event): void {
    evento?.preventDefault();
    if (this.enviandoCancelacion()) return;
    this.consultaCancelacion?.unsubscribe();
    this.dialogoCancelacion().nativeElement.close();
  }

  protected limpiarCancelacion(): void {
    this.reservaACancelar.set(null);
    this.accionCancelacion?.focus();
    this.accionCancelacion = undefined;
  }

  protected fechasCancelacion(reserva: Reserva): string {
    if (!reserva.fecha_inicio || !reserva.fecha_fin) return 'Fechas sin informar';
    const inicio = new Date(reserva.fecha_inicio);
    const fin = new Date(reserva.fecha_fin);
    return new Intl.DateTimeFormat('es-AR', { dateStyle: 'long', timeZone: 'UTC' })
      .formatRange(inicio, fin);
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

  protected motivoReclamoNoDisponible(reserva: Reserva): string {
    const hoy = this.hoy();
    if (!reserva.fecha_inicio || !reserva.fecha_fin) return 'La reserva no tiene fechas válidas.';
    if (hoy < reserva.fecha_inicio) return 'Podés reclamar desde el inicio de la estadía. Antes, usá Solicitar cancelación.';
    const plazo = Date.parse(reserva.fecha_fin) + 7 * 86_400_000;
    return Date.parse(hoy) > plazo ? 'El plazo para reclamar terminó siete días después de la estadía.' : '';
  }

  protected abrirReclamo(reserva: Reserva): void {
    if (this.reclamoEnviando() || this.motivoReclamoNoDisponible(reserva)) return;
    this.reclamoAbierto.set(reserva);
    this.reclamoCategoria.set('OTRO');
    this.reclamoDescripcion.set('');
    this.reclamoArchivos.set([]);
    this.errorReclamo.set('');
  }

  protected cerrarReclamo(): void {
    if (this.reclamoEnviando()) return;
    this.reclamoAbierto.set(null);
  }

  protected seleccionarArchivos(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivos = Array.from(input.files ?? []);
    const error = this.validarEvidencias(archivos, 5);
    if (error) input.value = '';
    this.errorReclamo.set(error);
    this.reclamoArchivos.set(error ? [] : archivos);
  }

  private validarEvidencias(archivos: File[], disponibles: number): string {
    if (archivos.length > disponibles) return 'Cada reclamo admite hasta cinco imágenes.';
    if (archivos.some((archivo) => !['image/jpeg', 'image/png'].includes(archivo.type))) {
      return 'Solo se admiten imágenes JPEG o PNG.';
    }
    if (archivos.some((archivo) => archivo.size > 5 * 1024 * 1024)) {
      return 'Cada imagen puede pesar hasta 5 MB.';
    }
    return '';
  }

  protected enviarReclamo(): void {
    const reserva = this.reclamoAbierto();
    if (!reserva || this.reclamoEnviando()) return;
    const descripcion = this.reclamoDescripcion().trim();
    if (descripcion.length < 20 || descripcion.length > 1000) {
      this.errorReclamo.set('La descripción debe tener entre 20 y 1000 caracteres.');
      return;
    }
    this.reclamoEnviando.set(true);
    this.errorReclamo.set('');
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
                this.finalizarReclamo(`El reclamo #${reclamo.id} se registró. La carga de imágenes quedó incompleta: ${err.message}`);
              },
            });
        },
        error: (err: ApiError) => {
          this.errorReclamo.set(err.message);
          this.reclamoEnviando.set(false);
        },
      });
  }

  protected abrirRespuestaReclamo(id: number): void {
    this.errorAccionReclamo.set('');
    this.textoRespuesta = '';
    this.respuestaReclamo.set(id);
  }

  protected adjuntarEvidencias(reclamo: Reclamo, event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivos = Array.from(input.files ?? []);
    input.value = '';
    if (!archivos.length || this.subiendoEvidencia() !== null) return;
    const error = this.validarEvidencias(archivos, 5 - (reclamo.evidencias?.length ?? 0));
    if (error) {
      this.errorAccionReclamo.set(error);
      return;
    }
    this.errorAccionReclamo.set('');
    this.subiendoEvidencia.set(reclamo.id);
    this.reservasApi.uploadClaimEvidence(reclamo.id, archivos).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.subiendoEvidencia.set(null);
        this.mensaje.set('Imágenes adjuntadas al reclamo.');
        this.cargarReservas(true);
      },
      error: (err: ApiError) => {
        this.subiendoEvidencia.set(null);
        this.errorAccionReclamo.set(err.message);
        this.cargarReservas(true);
      },
    });
  }

  protected verEvidenciaReclamo(id: number, evidencia: number): void {
    this.reservasApi.claimEvidenceUrl(id, evidencia).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ url }) => window.open(url, '_blank', 'noopener'),
      error: (err: ApiError) => this.errorAccionReclamo.set(err.message),
    });
  }

  protected responderReclamo(reclamo: Reclamo): void {
    const texto = this.textoRespuesta.trim();
    if (!texto || texto.length > 1000 || this.enviandoRespuesta()) return;
    this.errorAccionReclamo.set('');
    this.enviandoRespuesta.set(true);
    this.reservasApi
      .sendClaimMessage(reclamo.id, texto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.enviandoRespuesta.set(false);
          this.respuestaReclamo.set(null);
          this.textoRespuesta = '';
          this.mensaje.set('Mensaje enviado al hilo del reclamo.');
          this.cargarReservas(true);
        },
        error: (err: ApiError) => {
          this.enviandoRespuesta.set(false);
          this.errorAccionReclamo.set(err.message);
        },
      });
  }

  private finalizarReclamo(advertencia?: string): void {
    this.reclamoEnviando.set(false);
    this.reclamoAbierto.set(null);
    this.reclamoArchivos.set([]);
    this.mensaje.set(
      advertencia ?? 'Reclamo enviado. Podés seguirlo y responder desde esta sección.',
    );
    this.vista.set('reclamos');
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

  protected fechaTarjeta(valor: string | null): string {
    return valor
      ? new Date(`${valor.slice(0, 10)}T12:00:00`).toLocaleDateString('es-AR', {
          day: 'numeric', month: 'short', year: 'numeric',
        })
      : '—';
  }

  protected registrarErrorImagen(id: number, url: string): void {
    this.imagenesConError.update((imagenes) => ({ ...imagenes, [id]: url }));
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
