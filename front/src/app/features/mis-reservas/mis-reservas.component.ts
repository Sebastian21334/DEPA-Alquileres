import { ConversationComposerComponent } from '../../shared/components/conversation-panel/conversation-composer.component';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { LucideCalendar, LucideCalendarX, LucideInfo, LucideChevronRight, LucideEllipsis, LucideExternalLink, LucideImage, LucideLockKeyhole, LucideTriangleAlert, LucideX } from '@lucide/angular';
import { Component, computed, DestroyRef, ElementRef, inject, linkedSignal, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, forkJoin, of, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ReservationService,
  CondicionesCancelacion,
  Reserva,
  ReprogramacionReserva,
  Reclamo,
} from '../../shared/services/reservation.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { FormsModule } from '@angular/forms';
import { ApiError } from '../../core/interceptors/api-error';
import { activarActualizacionReservas } from '../../shared/utils/reservation-refresh';
import { devolucionRegistrada, estadiaActiva, etiquetasEstadia, puedeConsultarCodigo, puedePedirReinicioCodigo, puedeReprogramar, puedeValidarCodigo } from '../../shared/utils/reservation-state';
import { PerfilService } from '../../core/services/perfil.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ClaimHistoryComponent } from '../../shared/components/claim-history/claim-history.component';
import { ActividadReembolsosService } from '../../core/services/actividad-reembolsos.service';
import { CargaImagenesComponent } from '../../shared/components/carga-imagenes/carga-imagenes.component';
import { imagenesDisponibles, MAX_IMAGENES_POR_ENVIO } from '../../shared/utils/reclamo-imagenes';
import { rolEnReclamo, type RolEnReclamo } from '../../shared/utils/reclamo-rol';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [
    RouterLink, SpinnerComponent, FormsModule, ClaimHistoryComponent, ConversationComposerComponent, CargaImagenesComponent, NgTemplateOutlet, DatePipe,
    LucideCalendar, LucideCalendarX, LucideInfo, LucideChevronRight, LucideEllipsis, LucideExternalLink,
    LucideImage, LucideLockKeyhole, LucideTriangleAlert, LucideX,
  ],
  templateUrl: './mis-reservas.component.html',
  styleUrl: './mis-reservas.component.scss',
})
export class MisReservasComponent {
  private readonly reservasApi = inject(ReservationService);
  protected readonly actividadReembolsos = inject(ActividadReembolsosService);
  private readonly toast = inject(ToastService);
  private readonly perfil = inject(PerfilService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private consultaReservas?: Subscription;
  protected readonly estadiaActiva = estadiaActiva;
  protected readonly puedeReprogramar = puedeReprogramar;
  protected readonly imagenesConError = signal<Record<number, string>>({});
  protected readonly puedeConsultarCodigo = puedeConsultarCodigo;
  protected readonly puedeValidarCodigo = puedeValidarCodigo;
  protected readonly puedePedirReinicioCodigo = puedePedirReinicioCodigo;
  protected readonly accesoLimitado = computed(() => this.auth.currentUser()?.accesoLimitado === true);
  protected readonly esAnunciante = computed(() => this.accesoLimitado()
    ? this.auth.currentUser()?.anuncianteVerificado === true
    : this.perfil.esAnuncianteVerificado());

  protected readonly propias = signal<Reserva[]>([]);
  protected readonly recibidas = signal<Reserva[]>([]);
  protected readonly filtroEstadoRecibidas = signal('todos');
  protected readonly filtroPublicacionRecibidas = signal('');
  protected readonly filtroDesdeRecibidas = signal('');
  protected readonly filtroHastaRecibidas = signal('');
  protected readonly recibidasFiltradas = computed(() => {
    const estado = this.filtroEstadoRecibidas();
    const busqueda = this.filtroPublicacionRecibidas().trim().toLocaleLowerCase('es-AR');
    const desde = this.filtroDesdeRecibidas();
    const hasta = this.filtroHastaRecibidas();
    return this.recibidas().filter(reserva => {
      const categoria = this.categoriaRecibida(reserva);
      const fecha = reserva.fecha_inicio?.slice(0, 10);
      const terminada = !reserva.cancelada && (reserva.finalizada || reserva.estado_estadia === 'FINALIZADA');
      return (estado === 'todos' || categoria === estado || (estado === 'terminada' && terminada)) &&
        (!busqueda || (reserva.publicacion?.titulo ?? '').toLocaleLowerCase('es-AR').includes(busqueda)) &&
        (!desde || (!!fecha && fecha >= desde)) && (!hasta || (!!fecha && fecha <= hasta));
    }).sort((a, b) => {
      const orden = ['codigo', 'liquidacion', 'confirmada', 'terminada', 'historial'];
      const categoriaA = this.categoriaRecibida(a);
      const categoriaB = this.categoriaRecibida(b);
      const prioridad = orden.indexOf(categoriaA) - orden.indexOf(categoriaB);
      const fechaA = categoriaA === 'liquidacion' ? this.fechaHabilitacion(a) : a.fecha_inicio;
      const fechaB = categoriaB === 'liquidacion' ? this.fechaHabilitacion(b) : b.fecha_inicio;
      return prioridad || (fechaA ?? '9999').localeCompare(fechaB ?? '9999') || a.id - b.id;
    });
  });
  protected readonly paginasRecibidas = computed(() => Math.max(1, Math.ceil(this.recibidasFiltradas().length / 10)));
  protected readonly paginaRecibidas = linkedSignal<number, number>({
    source: this.paginasRecibidas,
    computation: (paginas, anterior) => Math.min(anterior?.value ?? 1, paginas),
  });
  protected readonly recibidasPagina = computed(() => {
    const inicio = (this.paginaRecibidas() - 1) * 10;
    return this.recibidasFiltradas().slice(inicio, inicio + 10);
  });
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly ocupada = signal<number | null>(null);
  protected readonly vista = signal<'realizadas' | 'recibidas' | 'reclamos'>('realizadas');
  protected readonly reclamos = signal<Reclamo[]>([]);
  /** T53: subpestaña de Reclamos según el rol en cada uno. */
  protected readonly vistaReclamos = signal<RolEnReclamo>('inquilino');
  protected readonly reclamosComoInquilino = computed(() => this.reclamosConRol('inquilino'));
  protected readonly reclamosComoAnunciante = computed(() => this.reclamosConRol('anunciante'));
  /** Sin subpestañas si no es anunciante, salvo que tenga reclamos de cuando lo era. */
  protected readonly separarReclamos = computed(() => this.esAnunciante() || this.reclamosComoAnunciante().length > 0);
  protected readonly reclamosVisibles = computed(() => {
    if (!this.separarReclamos()) return this.reclamos();
    return this.vistaReclamos() === 'anunciante' ? this.reclamosComoAnunciante() : this.reclamosComoInquilino();
  });
  protected readonly errorHistorial = signal('');
  protected readonly errorAccionReclamo = signal('');
  protected readonly errorReclamo = signal('');
  protected readonly respuestaReclamo = signal<number | null>(null);
  protected readonly enviandoRespuesta = signal(false);
  protected textoRespuesta = '';
  /** T49: imágenes del próximo mensaje del reclamo. */
  protected readonly imagenesRespuesta = signal<File[]>([]);
  protected readonly imagenesDisponibles = imagenesDisponibles;
  protected readonly maxImagenesPorEnvio = MAX_IMAGENES_POR_ENVIO;
  protected readonly codigos = signal<Record<number, string>>({});
  protected codigoIngresado: Record<number, string> = {};
  protected readonly mensaje = signal('');
  private readonly dialogoCancelacion = viewChild.required<ElementRef<HTMLDialogElement>>('dialogoCancelacion');
  private consultaCancelacion?: Subscription;
  private accionCancelacion?: HTMLButtonElement;
  protected readonly reservaACancelar = signal<Reserva | null>(null);
  protected readonly cancelacionComoAnunciante = signal(false);
  protected readonly estadoCancelacion = signal<'consultando' | 'formulario' | 'pendiente' | 'aprobada' | 'error'>('consultando');
  protected readonly motivoCancelacion = signal('');
  protected readonly condicionesCancelacion = signal<CondicionesCancelacion | null>(null);
  protected readonly aceptaTerminosCancelacion = signal(false);
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
    const anunciante = this.accesoLimitado() ? of(this.esAnunciante()) : this.perfil.esAnunciante();
    this.consultaReservas = forkJoin({
      propias: this.reservasApi.mine(),
      recibidas: anunciante.pipe(
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

  protected cambiarFiltroRecibidas(filtro: 'estado' | 'publicacion' | 'desde' | 'hasta', valor: string): void {
    const filtros = { estado: this.filtroEstadoRecibidas, publicacion: this.filtroPublicacionRecibidas,
      desde: this.filtroDesdeRecibidas, hasta: this.filtroHastaRecibidas };
    filtros[filtro].set(valor);
    this.paginaRecibidas.set(1);
  }

  protected categoriaRecibida(reserva: Reserva): string {
    if (reserva.estado_pago === 'APROBADO' && !reserva.cancelada &&
        ['PENDIENTE_PAGO_PROPIETARIO', 'EN_REVISION'].includes(reserva.estado_liquidacion)) return 'liquidacion';
    if (!reserva.cancelada && reserva.estado_pago === 'APROBADO' &&
        ['PENDIENTE_INGRESO', 'INGRESO_NO_VERIFICADO'].includes(reserva.estado_estadia)) return 'codigo';
    if (!reserva.cancelada && !reserva.finalizada && reserva.estado_pago === 'APROBADO' &&
        reserva.estado_estadia === 'CONFIRMADA') return 'confirmada';
    if (!reserva.cancelada && (reserva.finalizada || reserva.estado_estadia === 'FINALIZADA')) return 'terminada';
    return 'historial';
  }

  protected fechaHabilitacion(reserva: Reserva): string | null {
    if (!reserva.fecha_fin || !/^\d{4}-\d{2}-\d{2}$/.test(reserva.fecha_fin)) return null;
    const fecha = new Date(`${reserva.fecha_fin}T00:00:00Z`);
    if (!Number.isFinite(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== reserva.fecha_fin ||
        !reserva.fecha_inicio || reserva.fecha_inicio > reserva.fecha_fin) return null;
    fecha.setUTCDate(fecha.getUTCDate() + 5);
    return fecha.toISOString().slice(0, 10);
  }

  protected diasHastaVencimiento(reserva: Reserva): number | null {
    const fecha = this.fechaHabilitacion(reserva);
    return fecha ? Math.max(0, Math.round((Date.parse(fecha) - Date.parse(this.hoy())) / 86_400_000)) : null;
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

  protected puedeSolicitarCancelacion(reserva: Reserva, recibida = false): boolean {
    return (
      reserva.estado_pago === 'APROBADO' &&
      !reserva.cancelada &&
      !reserva.finalizada &&
      !!reserva.fecha_inicio && reserva.fecha_inicio > this.hoy() &&
      (recibida || ['CONFIRMADA', 'PENDIENTE_INGRESO'].includes(reserva.estado_estadia)) &&
      !reserva.codigo_validado_en &&
      (recibida || reserva.estado_liquidacion !== 'EN_REVISION') &&
      reserva.estado_liquidacion !== 'PAGADO_PROPIETARIO' &&
      reserva.estado_liquidacion !== 'DEVUELTO_INQUILINO' &&
      reserva.estado_liquidacion !== 'DEVUELTO_PARCIAL_INQUILINO'
    );
  }

  protected solicitarCancelacion(reserva: Reserva, accion: HTMLButtonElement, recibida = false): void {
    if (this.ocupada() !== null || !this.puedeSolicitarCancelacion(reserva, recibida)) return;
    this.accionCancelacion = accion;
    this.reservaACancelar.set(reserva);
    this.cancelacionComoAnunciante.set(recibida);
    this.motivoCancelacion.set('');
    this.aceptaTerminosCancelacion.set(false);
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
    this.condicionesCancelacion.set(null);
    this.consultaCancelacion = this.reservasApi.cancellationConditions(reserva.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (condiciones) => {
          this.condicionesCancelacion.set(condiciones);
          const { solicitud } = condiciones;
          this.estadoCancelacion.set(
            solicitud?.estado === 'APROBADA' ? 'aprobada' : solicitud ? 'pendiente' : 'formulario',
          );
        },
        error: (err: ApiError) => {
          this.estadoCancelacion.set('error');
          this.errorCancelacion.set(err.message);
        },
      });
  }

  protected enviarCancelacion(): void {
    const reserva = this.reservaACancelar();
    const motivo = this.motivoCancelacion().trim();
    const condiciones = this.condicionesCancelacion();
    if (!reserva || this.estadoCancelacion() !== 'formulario' || this.enviandoCancelacion() ||
        !condiciones || condiciones.motivoBloqueo || !this.aceptaTerminosCancelacion() ||
        motivo.length < 10 || motivo.length > 500) return;
    if (condiciones.devolucion && condiciones.devolucion.fechaSolicitud !== this.hoy()) {
      this.aceptaTerminosCancelacion.set(false);
      this.consultarCancelacion();
      this.errorCancelacion.set('Cambió el día. Revisá la devolución actualizada y aceptá nuevamente los términos antes de enviar.');
      return;
    }
    this.errorCancelacion.set('');
    this.enviandoCancelacion.set(true);
    this.reservasApi.requestCancellation(reserva.id, motivo, this.aceptaTerminosCancelacion())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.enviandoCancelacion.set(false)),
      )
      .subscribe({
        next: (solicitud) => {
          if (solicitud.estado === 'APROBADA') {
            this.estadoCancelacion.set('aprobada');
          } else {
            this.estadoCancelacion.set('pendiente');
            this.toast.mostrar('La solicitud de cancelación está en revisión.', 'exito');
          }
          this.consultarCancelacion();
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

  /** T34: el mensaje del código se muestra en la tarjeta de esa reserva, junto al campo. */
  protected readonly avisoCodigo = signal<{ id: number; tipo: 'error' | 'exito'; texto: string } | null>(null);

  protected validarCodigo(reserva: Reserva): void {
    if (!puedeValidarCodigo(reserva)) return;
    const codigo = (this.codigoIngresado[reserva.id] ?? '').trim().toUpperCase();
    if (codigo.length !== 8) {
      this.avisoCodigo.set({ id: reserva.id, tipo: 'error', texto: 'El código tiene 8 caracteres. Revisá el que te pasó el huésped.' });
      return;
    }
    this.iniciarOperacion(reserva.id);
    this.avisoCodigo.set(null);
    this.reservasApi.validateLodgingCode(reserva.id, codigo).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (actualizada) => {
        this.codigoIngresado[reserva.id] = '';
        this.reemplazar(actualizada);
        this.avisoCodigo.set({ id: reserva.id, tipo: 'exito', texto: 'Ingreso validado. Le avisamos al huésped por correo.' });
      },
      error: (err: ApiError) => {
        this.avisoCodigo.set({ id: reserva.id, tipo: 'error', texto: err.message });
        // El back guardó el intento: se actualiza la tarjeta para mostrar los intentos o el bloqueo.
        this.reservasApi.byId(reserva.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (actualizada) => this.reemplazar(actualizada),
          error: () => this.ocupada.set(null),
        });
      },
    });
  }

  /** El plazo lo calcula el back (`fin_plazo_reclamo`): el front solo lo compara con hoy. */
  private plazoReclamoAbierto(reserva: Reserva): boolean {
    return !!reserva.fin_plazo_reclamo && this.hoy() <= reserva.fin_plazo_reclamo;
  }

  protected motivoReclamoNoDisponible(reserva: Reserva): string {
    if (!reserva.fecha_inicio || !reserva.fin_plazo_reclamo) return 'La reserva no tiene fechas válidas.';
    if (this.hoy() < reserva.fecha_inicio)
      return `Podés reclamar desde el ${this.fecha(reserva.fecha_inicio)}, cuando empieza la estadía. Antes, usá Solicitar cancelación.`;
    if (!this.plazoReclamoAbierto(reserva))
      return `El plazo para reclamar terminó el ${this.fecha(reserva.fin_plazo_reclamo)}, antes de que se habilite el pago al anunciante.`;
    if (this.tieneReclamoAbierto(reserva)) return 'Ya tenés un reclamo abierto para esta reserva. Seguilo desde la pestaña Reclamos.';
    return '';
  }

  private tieneReclamoAbierto(reserva: Reserva): boolean {
    return this.reclamos().some(reclamo => reclamo.reserva?.id === reserva.id && ['ABIERTO', 'EN_REVISION'].includes(reclamo.estado));
  }

  protected abrirReclamo(reserva: Reserva): void {
    if (this.reclamoEnviando() || this.motivoReclamoNoDisponible(reserva)) return;
    this.reclamoAbierto.set(reserva);
    this.reclamoCategoria.set('OTRO');
    this.reclamoDescripcion.set('');
    this.reclamoArchivos.set([]);
    this.errorReclamo.set('');
  }

  /** T34: por qué el anunciante no puede pedir el reinicio del código; vacío si puede. */
  protected motivoPedidoReinicioNoDisponible(reserva: Reserva): string {
    if (this.tieneReclamoAbierto(reserva))
      return 'Ya hay un pedido o un reclamo abierto para esta reserva. Seguilo desde la pestaña Reclamos.';
    if (!this.plazoReclamoAbierto(reserva))
      return 'Venció el plazo para pedir el reinicio. Si no hubo reclamos, la liquidación queda pendiente de pago a tu favor.';
    return '';
  }

  protected abrirPedidoReinicio(reserva: Reserva): void {
    if (this.reclamoEnviando() || this.motivoPedidoReinicioNoDisponible(reserva)) return;
    this.reclamoAbierto.set(reserva);
    this.reclamoCategoria.set('CODIGO_BLOQUEADO');
    this.reclamoDescripcion.set('');
    this.reclamoArchivos.set([]);
    this.errorReclamo.set('');
  }

  protected cerrarReclamo(): void {
    if (this.reclamoEnviando()) return;
    this.reclamoAbierto.set(null);
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
    this.imagenesRespuesta.set([]);
    this.respuestaReclamo.set(id);
  }

  /** T49: el mensaje puede llevar imágenes; con imágenes, el texto es opcional. */
  protected responderReclamo(reclamo: Reclamo): void {
    const texto = this.textoRespuesta.trim();
    const imagenes = this.imagenesRespuesta();
    if ((!texto && !imagenes.length) || texto.length > 1000 || this.enviandoRespuesta()) return;
    this.errorAccionReclamo.set('');
    this.enviandoRespuesta.set(true);
    this.reservasApi
      .sendClaimMessage(reclamo.id, texto, imagenes)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.enviandoRespuesta.set(false);
          this.respuestaReclamo.set(null);
          this.textoRespuesta = '';
          this.imagenesRespuesta.set([]);
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
    const pedido = this.reclamoCategoria() === 'CODIGO_BLOQUEADO';
    this.reclamoEnviando.set(false);
    this.reclamoAbierto.set(null);
    this.reclamoArchivos.set([]);
    this.mensaje.set(
      advertencia ?? (pedido
        ? 'Pedido enviado. Administración lo va a revisar; podés seguirlo y responder desde esta sección.'
        : 'Reclamo enviado. Podés seguirlo y responder desde esta sección.'),
    );
    this.vista.set('reclamos');
    // El pedido de reinicio del código lo hace el anunciante; el reclamo, el inquilino.
    this.vistaReclamos.set(pedido ? 'anunciante' : 'inquilino');
    this.cargarReservas(true);
  }

  protected readonly devolucionRegistrada = devolucionRegistrada;

  protected estado(reserva: Reserva): string {
    const devolucion = devolucionRegistrada(reserva);
    return reserva.cancelada && devolucion
      ? devolucion.etiqueta
      : etiquetasEstadia[reserva.estado_estadia];
  }

  protected estadoLiquidacion(reserva: Reserva): string {
    const etiquetas: Partial<Record<Reserva['estado_liquidacion'], string>> = {
      NO_APLICA: 'Sin liquidación',
      RETENIDO: 'Dinero retenido hasta el ingreso',
      // Sin ingreso validado (venció el plazo de T36) no se habla de «ingreso confirmado», igual que la etiqueta de la estadía.
      PENDIENTE_PAGO_PROPIETARIO: reserva.codigo_validado_en
        ? 'Ingreso confirmado · pago administrativo pendiente'
        : 'Ingreso no verificado · pago administrativo pendiente',
      EN_REVISION: 'En revisión administrativa',
      PAGADO_PROPIETARIO: 'Pago al propietario registrado',
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

  /** La devolución la sigue el inquilino; el anunciante no gestiona reembolsos. */
  protected esInquilinoDelReclamo(reclamo: Reclamo): boolean {
    return rolEnReclamo(reclamo, this.idUsuario()) === 'inquilino';
  }

  private reclamosConRol(rol: RolEnReclamo): Reclamo[] {
    const idUsuario = this.idUsuario();
    return this.reclamos().filter((reclamo) => rolEnReclamo(reclamo, idUsuario) === rol);
  }

  private idUsuario(): number {
    return Number(this.auth.currentUser()?.sub);
  }

  /** El estado y el chat de la devolución están en el detalle de la reserva. */
  protected verReembolsoReclamo(reclamo: Reclamo): void {
    if (reclamo.reserva?.id) void this.router.navigate(['/reserva/resultado'], { queryParams: { reserva_id: reclamo.reserva.id } });
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
