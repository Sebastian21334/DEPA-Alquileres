import { ConversationPanelComponent, mensajesApelacion } from '../../shared/components/conversation-panel/conversation-panel.component';
import { AttachmentPreviewComponent } from '../../shared/components/conversation-panel/attachment-preview.component';
import { ConversationComposerComponent } from '../../shared/components/conversation-panel/conversation-composer.component';
import { CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, computed, DestroyRef, ElementRef, inject, Injector, linkedSignal, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, forkJoin, Subscription, timer } from 'rxjs';
import { ADMIN_NAVIGATION, AdminSection, seccionAdmin } from './admin-secciones';
import { ToastService } from '../../core/services/toast.service';
import { CotizacionesAdminComponent } from './cotizaciones-admin.component';
import { PublicacionesAdminComponent } from './publicaciones-admin.component';
import {
  LucideUsers,
  LucideShieldCheck,
  LucideRefreshCw,
  LucideSearch,
  LucideCheck,
  LucideX,
  LucideCalendarX,
  LucideMessageCircle,
  LucideChevronRight,
  LucideHouse,
  LucideWallet,
  LucideUserRound,
  LucideCalendarDays,
  LucideClock3,
  LucidePaperclip,
  LucideSend,
  LucideReceiptText,
  LucideLockKeyhole,
  LucideInfo,
  LucideLayers3,
} from '@lucide/angular';
import {
  AdminBloqueo,
  AdminCancellationRequest,
  AdminCatalogItem,
  AdminReembolso,
  AdminResumenReembolsos,
  AdminPagoLiquidacion,
  AdminSettlement,
  AdminCity,
  AdminProvince,
  AdminService,
  AdminUser,
  CatalogKey,
  VerificationRequest,
} from './admin.service';
import { Reclamo } from '../../shared/services/reservation.service';
import { imagenesDisponibles } from '../../shared/utils/reclamo-imagenes';
import { ClaimHistoryComponent } from '../../shared/components/claim-history/claim-history.component';
import { ReembolsoChatComponent } from '../../shared/components/reembolso-chat/reembolso-chat.component';
import { CargaComprobanteComponent } from '../../shared/components/carga-comprobante/carga-comprobante.component';
import { VerComprobanteComponent } from '../../shared/components/ver-comprobante/ver-comprobante.component';
import { DatoCopiableComponent } from '../../shared/components/dato-copiable/dato-copiable.component';
import { formatearCbu, formatearCuit, tipoCuentaBancaria } from '../../shared/utils/cuenta-bancaria';

interface CatalogSection {
  key: CatalogKey;
  label: string;
  items: AdminCatalogItem[];
}

const REEMBOLSOS_POR_PAGINA = 10;
const ORDEN_ESTADO_REEMBOLSO: Record<AdminReembolso['estado'], number> = {
  PENDIENTE: 0,
  EN_PROCESO: 0,
  FALLIDO: 0,
  APROBADO: 1,
  RECHAZADO: 2,
  CANCELADO: 2,
};

const SECTION_DESCRIPTIONS: Record<AdminSection, string> = {
  resumen: 'Consultá los casos que requieren atención y accedé a cada operación.',
  cancelaciones: 'Revisá las solicitudes para cancelar reservas y decidí si corresponde aprobarlas.',
  reclamos: 'Consultá los problemas reportados sobre reservas, su evidencia y el historial del caso.',
  reembolsos: 'Gestioná y seguí las devoluciones de dinero a los inquilinos.',
  liquidaciones: 'Registrá transferencias realizadas a anunciantes y revisá las reservas con el pago retenido.',
  'historial-liquidaciones': 'Consultá los pagos ya registrados a anunciantes, con su importe, fecha y referencia.',
  verificaciones: 'Revisá las solicitudes de verificación de identidad.',
  publicaciones: 'Consultá y moderá los alojamientos publicados.',
  usuarios: 'Buscá cuentas y consultá su rol y estado.',
  bloqueos: 'Consultá las cuentas bloqueadas, sus motivos y las apelaciones.',
  catalogos: 'Consultá las opciones que usa el sistema. Se cargan por seed o migración.',
  ubicaciones: 'Consultá las provincias y ciudades disponibles. Se cargan por seed o migración.',
  cotizaciones: 'Consultá y administrá las cotizaciones que usa el sistema para convertir importes.',
  comision: 'Configurá la comisión aplicable a nuevas reservas.',
};

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CotizacionesAdminComponent,
    PublicacionesAdminComponent,
    ClaimHistoryComponent,
    ConversationComposerComponent,
    ConversationPanelComponent,
    AttachmentPreviewComponent,
    ReembolsoChatComponent,
    CargaComprobanteComponent,
    VerComprobanteComponent,
    DatoCopiableComponent,
    CurrencyPipe,
    DatePipe,
    FormsModule,
    RouterLink,
    LucideUsers,
    LucideShieldCheck,
    LucideRefreshCw,
    LucideSearch,
    LucideCheck,
    LucideX,
    LucideLockKeyhole,
    LucideInfo,
    LucideLayers3,
    LucideCalendarX,
    LucideMessageCircle,
    LucideChevronRight,
    LucideHouse,
    LucideWallet,
    LucideUserRound,
    LucideCalendarDays,
    LucideClock3,
    LucidePaperclip,
    LucideSend,
    LucideReceiptText,
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss', './admin-dashboard.scss'],
})
export class AdminComponent {
  protected comisionActual: number | null = null;
  protected comisionNueva: number | null = null;
  protected readonly comisionCargando = signal(false);
  protected readonly comisionError = signal('');
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly navigation = ADMIN_NAVIGATION;
  protected readonly activeSection = signal<AdminSection>('resumen');
  protected readonly sectionDescription = computed(() => SECTION_DESCRIPTIONS[this.activeSection()]);
  protected readonly historialLiquidaciones = signal<AdminPagoLiquidacion[]>([]);
  protected readonly historialCargando = signal(false);
  protected readonly historialError = signal('');
  private historialRequest?: Subscription;
  private readonly dialogoResolucion = viewChild.required<ElementRef<HTMLDialogElement>>('dialogoResolucion');
  protected readonly resolucionLiquidacion = signal<{ reserva: AdminSettlement; devolver: boolean } | null>(null);
  protected readonly resolucionCargando = signal(false);
  protected readonly resolucionError = signal('');
  protected motivoResolucion = '';
  protected readonly sectionLabel = computed(() =>
    this.navigation.flatMap(({ items }) => [...items]).find(({ id }) => id === this.activeSection())?.label ?? 'Resumen',
  );
  private readonly api = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly publicacionesAdmin = viewChild(PublicacionesAdminComponent);
  private usersRequest?: Subscription;
  private bloqueadosRequest?: Subscription;
  private actualizandoBloqueados = false;
  private readonly bloqueoDialog = viewChild.required<ElementRef<HTMLDialogElement>>('bloqueoDialog');
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  protected readonly users = signal<AdminUser[]>([]);
  protected readonly bloqueados = signal<AdminBloqueo[]>([]);
  protected readonly bloqueosOrdenados = computed(() => [...this.bloqueados()].sort((a, b) => {
    const prioridad = (bloqueo: AdminBloqueo) => bloqueo.detalle.apelacion && !bloqueo.detalle.respuesta ? 0 : bloqueo.detalle.apelacion ? 1 : 2;
    return prioridad(a) - prioridad(b) || (b.detalle.fecha ?? '').localeCompare(a.detalle.fecha ?? '');
  }));
  protected readonly vistaBloqueos = signal<'actuales' | 'historial'>('actuales');
  protected readonly historialBloqueos = signal<AdminBloqueo[]>([]);
  protected readonly historialBloqueosCargando = signal(false);
  protected readonly historialBloqueosError = signal('');
  protected readonly bloqueadosCargando = signal(true);
  protected readonly bloqueadosError = signal('');
  protected readonly usuarioPorBloquear = signal<AdminUser | null>(null);
  protected readonly bloqueando = signal(false);
  protected readonly bloqueoError = signal('');
  protected motivoBloqueo = '';
  protected respuestasApelacion: Record<string, string> = {};
  protected imagenesApelacion: Record<string, File | null> = {};
  protected vistasPreviasApelacion: Record<string, string | null> = {};
  protected readonly usersPage = signal(1);
  protected readonly usersTotal = signal(0);
  protected readonly usersPages = signal(1);
  protected readonly usersLoading = signal(true);
  protected readonly registeredUsers = signal(0);
  protected readonly requests = signal<VerificationRequest[]>([]);
  protected readonly settlements = signal<AdminSettlement[]>([]);
  protected readonly liquidacionesOrdenadas = computed(() => [...this.settlements()].sort((a, b) => {
    const prioridad = (item: AdminSettlement): number => {
      if (item.estado_liquidacion !== 'PENDIENTE_PAGO_PROPIETARIO') return 3;
      const dias = this.diasEsperaLiquidacion(item);
      return dias === 0 ? 0 : dias === null ? 2 : 1;
    };
    return prioridad(a) - prioridad(b);
  }));
  protected readonly claims = signal<Reclamo[]>([]);
  protected readonly errorReclamos = signal('');
  protected readonly gestionReclamo = signal<{ id: number; accion: 'mensaje' | 'resolver' } | null>(null);
  protected textoReclamo = '';
  /** T49: imágenes del próximo mensaje del reclamo. */
  protected readonly imagenesReclamo = signal<File[]>([]);
  protected readonly imagenesDisponibles = imagenesDisponibles;
  protected resolucionReclamo: NonNullable<Reclamo['resolucion']> = 'SIN_DEVOLUCION';
  protected importeReclamo: number | null = null;
  protected observacionReclamo = '';
  protected readonly cancellations = signal<AdminCancellationRequest[]>([]);
  private readonly dialogoAprobacion = viewChild.required<ElementRef<HTMLDialogElement>>('dialogoAprobacion');
  protected readonly solicitudPorAprobar = signal<AdminCancellationRequest | null>(null);
  protected readonly aprobandoCancelacion = signal(false);
  protected readonly errorAprobacion = signal('');
  protected observacionAprobacion = '';
  protected readonly refunds = signal<AdminReembolso[]>([]);
  private readonly orderedRefunds = computed(() => [...this.refunds()].sort((a, b) =>
    ORDEN_ESTADO_REEMBOLSO[a.estado] - ORDEN_ESTADO_REEMBOLSO[b.estado] ||
    Date.parse(b.creado_en) - Date.parse(a.creado_en) ||
    b.id - a.id,
  ));
  protected readonly refundsPages = computed(() => Math.max(1, Math.ceil(this.refunds().length / REEMBOLSOS_POR_PAGINA)));
  protected readonly refundsPage = linkedSignal<number, number>({
    source: this.refundsPages,
    computation: (paginas, anterior) => Math.min(anterior?.value ?? 1, paginas),
  });
  protected readonly refundsPageItems = computed(() => {
    const inicio = (this.refundsPage() - 1) * REEMBOLSOS_POR_PAGINA;
    return this.orderedRefunds().slice(inicio, inicio + REEMBOLSOS_POR_PAGINA);
  });
  private readonly dialogoReembolso = viewChild.required<ElementRef<HTMLDialogElement>>('dialogoReembolso');
  protected readonly reembolsoSeleccionado = signal<AdminReembolso | null>(null);
  protected readonly guardandoReembolso = signal(false);
  protected readonly errorReembolso = signal('');
  protected referenciaReembolso = '';
  private readonly dialogoPagoAnunciante = viewChild.required<ElementRef<HTMLDialogElement>>('dialogoPagoAnunciante');
  protected readonly pagoAnuncianteSeleccionado = signal<AdminSettlement | null>(null);
  protected readonly registrandoPagoAnunciante = signal(false);
  protected readonly errorPagoAnunciante = signal('');
  protected readonly cbuParaPago = signal<string | null>(null);
  /** T56: CUIT/CUIL del anunciante, para confirmar el destinatario en el banco. */
  protected readonly cuitParaPago = signal<string | null>(null);
  protected readonly consultandoCbuParaPago = signal(false);
  private consultaCbuParaPago?: Subscription;
  protected referenciaPagoAnunciante = '';
  protected observacionPagoAnunciante = '';
  /** T56: comprobante obligatorio del pago al anunciante. */
  protected readonly comprobantePago = signal<File | null>(null);
  protected readonly formatearCbu = formatearCbu;
  protected readonly formatearCuit = formatearCuit;
  protected readonly tipoCuentaBancaria = tipoCuentaBancaria;
  protected readonly urlComprobantePago = (pago: AdminPagoLiquidacion) => () => this.api.urlComprobantePago(pago.reservaId, pago.indice);

  /** T56: importe para pegar en el home banking, con coma decimal y sin separador de miles. */
  protected importeParaCopiar(importe: number | string | null | undefined): string {
    return Number(importe ?? 0).toFixed(2).replace('.', ',');
  }
  protected readonly estadosReembolso = {
    PENDIENTE: 'Pendiente', EN_PROCESO: 'En proceso', APROBADO: 'Aprobado',
    RECHAZADO: 'Rechazado', FALLIDO: 'Fallido', CANCELADO: 'Cancelado',
  };
  protected readonly origenesReembolso: Record<string, string> = {
    CANCELACION: 'Cancelación', RECLAMO: 'Reclamo', CONTRACARGO: 'Contracargo',
    PAGO_TARDIO: 'Pago tardío', AJUSTE_ADMIN: 'Ajuste administrativo',
  };
  protected readonly otherLoading = signal(true);
  protected readonly summaryError = signal(false);
  protected readonly openClaims = computed(() =>
    this.claims().filter(({ estado }) => estado === 'ABIERTO' || estado === 'EN_REVISION'),
  );
  protected readonly resumenReembolsos = signal<AdminResumenReembolsos | null>(null);
  protected readonly pendingRefunds = computed(() => this.orderedRefunds().filter(({ estado }) =>
    estado === 'PENDIENTE' || estado === 'EN_PROCESO',
  ));
  protected readonly failedRefunds = computed(() => this.refunds().filter(({ estado }) =>
    estado === 'FALLIDO',
  ));
  protected readonly conteoPendientes = computed(() =>
    this.resumenReembolsos()?.pendientes ?? this.pendingRefunds().length,
  );
  protected readonly conteoFallidos = computed(() =>
    this.resumenReembolsos()?.fallidos ?? this.failedRefunds().length,
  );
  protected readonly totalReembolsos = computed(() =>
    this.resumenReembolsos()?.total ?? this.refunds().length,
  );
  protected readonly pendingCases = computed(() => [
    ...this.cancellations().slice(0, 2).map((item) => ({
      section: 'cancelaciones' as const, id: item.id,
      label: item.reserva ? `Cancelación · Reserva #${item.reserva.id}` : `Cancelación #${item.id}`,
      status: 'Pendiente', tone: 'pending', action: 'Revisar',
    })),
    ...this.openClaims().slice(0, 2).map((item) => ({
      section: 'reclamos' as const, id: item.id,
      label: item.reserva ? `Reclamo · Reserva #${item.reserva.id}` : `Reclamo #${item.id}`,
      status: item.estado === 'EN_REVISION' ? 'En revisión' : 'Abierto', tone: 'review', action: 'Abrir',
    })),
    ...this.pendingRefunds().slice(0, 2).map((item) => ({
      section: 'reembolsos' as const, id: item.id,
      label: item.reserva ? `Reembolso · Reserva #${item.reserva.id}` : `Reembolso #${item.id}`,
      status: this.estadosReembolso[item.estado],
      tone: 'refund', action: 'Ver detalle',
    })),
    ...this.requests().slice(0, 2).map((item) => ({
      section: 'verificaciones' as const, id: item.id,
      label: `Verificación · Solicitud #${item.id}`,
      status: 'Pendiente', tone: 'pending', action: 'Revisar',
    })),
  ]);
  protected readonly loading = computed(() =>
    this.otherLoading() || this.usersLoading() || (this.publicacionesAdmin()?.publicationsLoading() ?? true),
  );
  protected readonly query = signal('');
  protected readonly busy = signal<string | null>(null);
  protected readonly rejectId = signal<number | null>(null);
  protected readonly catalogs = signal<CatalogSection[]>([
    { key: 'tipos-anunciante', label: 'Tipos de anunciante', items: [] },
    { key: 'tipos-propiedad', label: 'Tipos de propiedad', items: [] },
    { key: 'modalidades', label: 'Modalidades', items: [] },
    { key: 'tipos-moneda', label: 'Monedas', items: [] },
  ]);
  protected readonly provinces = signal<AdminProvince[]>([]);
  protected readonly cities = signal<AdminCity[]>([]);
  protected readonly selectedProvince = signal<number | null>(null);
  protected rejectReason = '';
  protected rechazarIdentidad = false;
  protected rechazarCbu = false;
  protected titularCbuConfirmado: number | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      for (const url of Object.values(this.vistasPreviasApelacion)) if (url) URL.revokeObjectURL(url);
    });
    if (this.isBrowser) {
      this.reload();
      this.loadCatalogs();
      this.loadProvinces();
      // T53: abre la sección que indica la URL, por ejemplo al volver del detalle de una reserva.
      this.route.fragment.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((fragmento) => {
        const seccion = seccionAdmin(fragmento);
        if (seccion && seccion !== this.activeSection()) this.openSection(seccion);
      });
      timer(15_000, 15_000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        if (this.activeSection() !== 'bloqueos' || this.busy() || this.bloqueadosCargando() || this.actualizandoBloqueados) return;
        const vista = this.vistaBloqueos();
        this.actualizandoBloqueados = true;
        const consulta = vista === 'historial' ? this.api.listarHistorialBloqueos() : this.api.listarBloqueados();
        consulta.pipe(takeUntilDestroyed(this.destroyRef), finalize(() => { this.actualizandoBloqueados = false; })).subscribe({
          next: usuarios => {
            if (this.busy() || this.vistaBloqueos() !== vista) return;
            if (vista === 'historial') this.historialBloqueos.set(this.ordenarHistorialBloqueos(usuarios));
            else this.bloqueados.set(usuarios);
          },
          error: () => {},
        });
      });
    }
  }
  protected reload(): void {
    if (this.activeSection() === 'historial-liquidaciones') this.cargarHistorialLiquidaciones();
    if (this.activeSection() === 'comision') this.cargarComision();
    this.otherLoading.set(true);
    this.summaryError.set(false);
    this.publicacionesAdmin()?.recargar();
    this.loadUsers(this.usersPage());
    this.cargarBloqueados();
    let pending = 6;
    const done = () => {
      if (--pending === 0) this.otherLoading.set(false);
    };
    this.api.listarPendientes().subscribe({
      next: (v) => {
        this.requests.set(v);
        done();
      },
      error: (e: Error) => {
        this.summaryError.set(true);
        this.toast.mostrar(e.message, 'error');
        done();
      },
    });
    this.api.listarLiquidaciones().subscribe({
      next: (v) => {
        this.settlements.set(v);
        done();
      },
      error: (e: Error) => {
        this.toast.mostrar(e.message, 'error');
        done();
      },
    });
    this.api.listarReclamos().subscribe({
      next: (v) => {
        this.claims.set(v);
        this.errorReclamos.set('');
        done();
      },
      error: (e: Error) => {
        this.summaryError.set(true);
        this.errorReclamos.set(e.message);
        done();
      },
    });
    this.api.listarSolicitudesCancelacion().subscribe({
      next: (v) => {
        this.cancellations.set(v);
        done();
      },
      error: (e: Error) => {
        this.summaryError.set(true);
        this.toast.mostrar(e.message, 'error');
        done();
      },
    });
    this.api.listarReembolsos().subscribe({
      next: (v) => {
        this.refunds.set(v);
        done();
      },
      error: (e: Error) => {
        this.summaryError.set(true);
        this.toast.mostrar(e.message, 'error');
        done();
      },
    });
    this.api.resumenReembolsos().subscribe({
      next: (v) => {
        this.resumenReembolsos.set(v);
        done();
      },
      error: (e: Error) => {
        this.resumenReembolsos.set(null);
        this.summaryError.set(true);
        this.toast.mostrar(e.message, 'error');
        done();
      },
    });
  }

  protected openSection(section: AdminSection, caseId?: number): void {
    this.activeSection.set(section);
    // T53: la sección queda en la URL, así «Volver» desde el detalle de una reserva (o un perfil) vuelve a ella.
    if (this.route.snapshot.fragment !== (section === 'resumen' ? null : section))
      void this.router.navigate([], { relativeTo: this.route, fragment: section === 'resumen' ? undefined : section, replaceUrl: true });
    if (section === 'comision') this.cargarComision();
    if (section === 'historial-liquidaciones') this.cargarHistorialLiquidaciones();
    if (section === 'reembolsos' && caseId !== undefined) {
      const indice = this.orderedRefunds().findIndex(({ id }) => id === caseId);
      if (indice >= 0) this.refundsPage.set(Math.floor(indice / REEMBOLSOS_POR_PAGINA) + 1);
    }
    afterNextRender(() => {
      if (this.activeSection() !== section) return;
      const heading = this.host.nativeElement.querySelector<HTMLElement>('#admin-section-title');
      const target = caseId === undefined
        ? heading
        : this.host.nativeElement.querySelector<HTMLElement>(`#admin-${section}-${caseId}`) ?? heading;
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: 'start' });
      if (section === 'reembolsos' && caseId !== undefined) {
        const refund = this.refunds().find(({ id }) => id === caseId);
        if (refund) this.abrirReembolso(refund);
      }
    }, { injector: this.injector });
  }

  protected searchUsers(value: string): void {
    this.query.set(value);
    this.loadUsers(1);
  }

  protected loadUsers(page: number): void {
    if (page < 1 || page > this.usersPages()) return;
    this.usersRequest?.unsubscribe();
    this.usersLoading.set(true);
    this.usersRequest = this.api.listarUsuarios(page, this.query().trim())
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (result) => {
          this.users.set(result.datos);
          this.usersPage.set(result.pagina);
          this.usersTotal.set(result.total);
          this.usersPages.set(result.totalPaginas);
          this.registeredUsers.set(result.totalRegistros);
          this.usersLoading.set(false);
        },
        error: (e: Error) => {
          this.users.set([]);
          this.usersTotal.set(0);
          this.usersPage.set(1);
          this.usersPages.set(1);
          this.toast.mostrar(e.message, 'error');
          this.usersLoading.set(false);
        },
      });
  }

  protected abrirPagoAnunciante(settlement: AdminSettlement): void {
    if (this.diasEsperaLiquidacion(settlement) !== 0 || settlement.estado_liquidacion === 'EN_REVISION') return;
    this.pagoAnuncianteSeleccionado.set(settlement);
    this.referenciaPagoAnunciante = '';
    this.observacionPagoAnunciante = '';
    this.comprobantePago.set(null);
    this.errorPagoAnunciante.set('');
    this.cbuParaPago.set(null);
    this.cuitParaPago.set(null);
    this.consultaCbuParaPago?.unsubscribe();
    this.consultandoCbuParaPago.set(true);
    this.dialogoPagoAnunciante().nativeElement.showModal();
    this.consultaCbuParaPago = this.api.consultarCbuParaPago(settlement.id).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.consultandoCbuParaPago.set(false)),
    ).subscribe({
      next: ({ cbu, cuit_cuil }) => {
        this.cbuParaPago.set(cbu);
        this.cuitParaPago.set(cuit_cuil);
      },
      error: (error: Error) => this.errorPagoAnunciante.set(error.message),
    });
  }

  protected cerrarPagoAnunciante(evento?: Event): void {
    evento?.preventDefault();
    if (this.registrandoPagoAnunciante()) return;
    this.dialogoPagoAnunciante().nativeElement.close();
    this.consultaCbuParaPago?.unsubscribe();
    this.cbuParaPago.set(null);
    this.cuitParaPago.set(null);
    this.comprobantePago.set(null);
    this.pagoAnuncianteSeleccionado.set(null);
  }

  protected confirmarPagoAnunciante(): void {
    const settlement = this.pagoAnuncianteSeleccionado();
    const comprobante = this.comprobantePago();
    const referencia = this.referenciaPagoAnunciante.trim();
    const observacion = this.observacionPagoAnunciante.trim();
    if (!settlement || settlement.estado_liquidacion !== 'PENDIENTE_PAGO_PROPIETARIO' || !this.cbuParaPago() || !comprobante ||
        this.diasEsperaLiquidacion(settlement) !== 0 ||
        this.registrandoPagoAnunciante() || referencia.length > 150 || observacion.length > 500) return;

    this.errorPagoAnunciante.set('');
    this.registrandoPagoAnunciante.set(true);
    this.api.registrarPagoAnunciante(settlement.id, comprobante, {
      referencia,
      observacion: observacion || 'Transferencia manual al propietario registrada',
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.registrandoPagoAnunciante.set(false)),
    ).subscribe({
      next: () => {
        this.registrandoPagoAnunciante.set(false);
        this.cerrarPagoAnunciante();
        this.settlements.update((items) => items.filter((item) => item.id !== settlement.id));
        this.toast.mostrar('Pago registrado en el historial de liquidaciones.', 'exito');
      },
      error: (error: Error) => this.errorPagoAnunciante.set(error.message),
    });
  }

  protected diasEsperaLiquidacion(settlement: AdminSettlement): number | null {
    const fecha = settlement.fecha_disponible_pago;
    if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return null;
    const fechaPago = Date.parse(`${fecha}T00:00:00Z`);
    if (!Number.isFinite(fechaPago) || new Date(fechaPago).toISOString().slice(0, 10) !== fecha) return null;
    const hoy = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date());
    return Math.max(0, Math.round((fechaPago - Date.parse(`${hoy}T00:00:00Z`)) / 86_400_000));
  }

  protected cargarHistorialLiquidaciones(): void {
    this.historialRequest?.unsubscribe();
    this.historialCargando.set(true);
    this.historialError.set('');
    this.historialRequest = this.api.listarHistorialLiquidaciones().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.historialCargando.set(false)),
    ).subscribe({
      next: (pagos) => this.historialLiquidaciones.set(pagos),
      error: (error: Error) => this.historialError.set(error.message),
    });
  }

  protected abrirResolucionLiquidacion(reserva: AdminSettlement, devolver: boolean): void {
    this.resolucionLiquidacion.set({ reserva, devolver });
    this.motivoResolucion = '';
    this.resolucionError.set('');
    this.dialogoResolucion().nativeElement.showModal();
  }

  protected cerrarResolucionLiquidacion(evento?: Event): void {
    evento?.preventDefault();
    if (this.resolucionCargando()) return;
    this.dialogoResolucion().nativeElement.close();
    this.resolucionLiquidacion.set(null);
  }

  protected confirmarResolucionLiquidacion(): void {
    const resolucion = this.resolucionLiquidacion();
    const motivo = this.motivoResolucion.trim();
    if (!resolucion || (!resolucion.devolver && !motivo) || motivo.length > 500 || this.resolucionCargando()) return;
    const { reserva, devolver } = resolucion;
    const estado = devolver ? 'DEVUELTO_INQUILINO'
      : reserva.codigo_validado_en ? 'PENDIENTE_PAGO_PROPIETARIO' : 'RETENIDO';
    this.resolucionError.set('');
    this.resolucionCargando.set(true);
    this.api.resolverLiquidacion(reserva.id, estado, undefined, motivo || 'Devolución solicitada desde liquidaciones.').pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.resolucionCargando.set(false)),
    ).subscribe({
      next: (actualizada) => {
        this.resolucionCargando.set(false);
        this.cerrarResolucionLiquidacion();
        this.settlements.update(items => estado === 'PENDIENTE_PAGO_PROPIETARIO'
          ? items.map(item => item.id === reserva.id ? { ...item, ...actualizada } : item)
          : items.filter(item => item.id !== reserva.id));
        this.toast.mostrar(devolver ? 'Caso enviado a Reembolsos.' : 'Revisión de liquidación cerrada.', 'exito');
        if (devolver) {
          this.reload();
          this.openSection('reembolsos');
        }
      },
      error: (error: Error) => this.resolucionError.set(error.message),
    });
  }

  protected abrirAprobacionCancelacion(solicitud: AdminCancellationRequest): void {
    if (!solicitud.devolucion) return;
    this.solicitudPorAprobar.set(solicitud);
    this.observacionAprobacion = '';
    this.errorAprobacion.set('');
    this.dialogoAprobacion().nativeElement.showModal();
  }

  protected cerrarAprobacionCancelacion(evento?: Event): void {
    evento?.preventDefault();
    if (this.aprobandoCancelacion()) return;
    this.dialogoAprobacion().nativeElement.close();
    this.solicitudPorAprobar.set(null);
  }

  protected confirmarAprobacionCancelacion(): void {
    const solicitud = this.solicitudPorAprobar();
    const observacion = this.observacionAprobacion.trim();
    if (!solicitud?.devolucion || this.aprobandoCancelacion() || observacion.length > 500) return;

    this.errorAprobacion.set('');
    this.aprobandoCancelacion.set(true);
    this.api.resolverSolicitudCancelacion(solicitud.reserva?.id ?? 0, solicitud.id, 'APROBADA', observacion || undefined)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.aprobandoCancelacion.set(false)))
      .subscribe({
        next: ({ reembolso }) => {
          this.aprobandoCancelacion.set(false);
          this.cerrarAprobacionCancelacion();
          this.cancellations.update((items) => items.filter((item) => item.id !== solicitud.id));
          if (!reembolso) {
            this.toast.mostrar('Cancelación aprobada sin devolución.', 'exito');
            return;
          }
          this.refunds.update((items) => [reembolso, ...items.filter((item) => item.id !== reembolso.id)]);
          this.toast.mostrar('Cancelación aprobada. La devolución quedó pendiente en Reembolsos.', 'exito');
          this.openSection('reembolsos', reembolso.id);
        },
        error: (error: Error) => this.errorAprobacion.set(error.message),
      });
  }

  /** T44: comprobante elegido para registrar la transferencia del reembolso. */
  protected readonly comprobanteReembolso = signal<File | null>(null);
  protected observacionReembolso = '';
  protected readonly urlComprobanteReembolso = (id: number) => () => this.api.urlComprobanteReembolso(id);

  protected abrirReembolso(reembolso: AdminReembolso): void {
    this.reembolsoSeleccionado.set(reembolso);
    this.referenciaReembolso = '';
    this.observacionReembolso = '';
    this.comprobanteReembolso.set(null);
    this.errorReembolso.set('');
    this.dialogoReembolso().nativeElement.showModal();
  }

  protected cerrarReembolso(evento?: Event): void {
    evento?.preventDefault();
    if (!this.guardandoReembolso()) this.dialogoReembolso().nativeElement.close();
  }

  protected puedeSolicitarReembolso(reembolso: AdminReembolso): boolean {
    return !reembolso.transferencia_manual && reembolso.estado === 'PENDIENTE' && !!reembolso.pago?.payment_id;
  }

  protected puedeConciliarReembolso(reembolso: AdminReembolso): boolean {
    return !reembolso.transferencia_manual && !!reembolso.pago?.payment_id && (reembolso.estado === 'FALLIDO' || reembolso.estado === 'EN_PROCESO');
  }

  protected puedeRegistrarTransferencia(reembolso: AdminReembolso): boolean {
    return !!reembolso.transferencia_manual && reembolso.estado === 'PENDIENTE';
  }

  protected referenciaReembolsoValida(reembolso: AdminReembolso): boolean {
    const referencia = this.referenciaReembolso.trim();
    // T44: el comprobante es obligatorio; la referencia y la observación, opcionales.
    if (this.puedeRegistrarTransferencia(reembolso))
      return !!this.comprobanteReembolso() && referencia.length <= 150 && this.observacionReembolso.trim().length <= 500;
    if (this.puedeConciliarReembolso(reembolso)) return /^\d{1,100}$/.test(referencia);
    return this.puedeSolicitarReembolso(reembolso);
  }

  protected procesarReembolso(reembolso: AdminReembolso): void {
    const referencia = this.referenciaReembolso.trim();
    if (this.guardandoReembolso() || !this.referenciaReembolsoValida(reembolso)) return;

    this.errorReembolso.set('');
    this.guardandoReembolso.set(true);
    const comprobante = this.comprobanteReembolso();
    const operacion = this.puedeRegistrarTransferencia(reembolso) && comprobante
      ? this.api.registrarTransferenciaReembolso(reembolso.id, comprobante, { referencia, observacion: this.observacionReembolso.trim() })
      : this.puedeConciliarReembolso(reembolso)
      ? this.api.conciliarReembolso(reembolso.id, referencia)
      : this.api.solicitarReembolso(reembolso.id);
    operacion
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.guardandoReembolso.set(false)))
      .subscribe({
        next: ({ reembolso: actualizado }) => {
          if (actualizado.estado !== 'APROBADO') {
            this.reembolsoSeleccionado.set(actualizado);
            this.referenciaReembolso = '';
            this.toast.mostrar(actualizado.transferencia_manual
              ? 'Mercado Pago rechazó el reembolso. Continuá por el chat de transferencia.'
              : 'La devolución quedó en seguimiento en Mercado Pago.', 'advertencia');
            this.reload();
            return;
          }
          this.dialogoReembolso().nativeElement.close();
          this.toast.mostrar('Reembolso confirmado y aplicado a la reserva.', 'exito');
          this.reload();
        },
        error: (e: Error) => {
          this.errorReembolso.set(e.message);
          this.api.listarReembolsos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (items) => {
              this.refunds.set(items);
              const vigente = items.find((item) => item.id === reembolso.id);
              if (vigente && this.reembolsoSeleccionado()?.id === vigente.id) {
                this.reembolsoSeleccionado.set(vigente);
              }
            },
            error: () => {},
          });
        },
      });
  }

  protected rechazarCancelacion(solicitud: AdminCancellationRequest): void {
    const observacion = window.prompt('Motivo del rechazo:')?.trim();
    if (!observacion) return;
    this.run(
      `cancellation-${solicitud.id}`,
      () =>
        this.api.resolverSolicitudCancelacion(
          solicitud.reserva?.id ?? 0,
          solicitud.id,
          'RECHAZADA',
          observacion,
        ),
      () =>
        this.cancellations.update((items) =>
          items.filter((item) => item.id !== solicitud.id),
        ),
      'Solicitud de cancelación rechazada.',
    );
  }

  protected abrirGestionReclamo(id: number, accion: 'mensaje' | 'resolver'): void {
    if (this.busy()) return;
    this.textoReclamo = '';
    this.imagenesReclamo.set([]);
    const pedidoDeCodigo = this.claims().find(reclamo => reclamo.id === id)?.categoria === 'CODIGO_BLOQUEADO';
    this.resolucionReclamo = pedidoDeCodigo ? 'REINICIAR_CODIGO' : 'SIN_DEVOLUCION';
    this.importeReclamo = null;
    this.observacionReclamo = '';
    this.gestionReclamo.set({ id, accion });
  }

  /** T49: el mensaje puede llevar imágenes; con imágenes, el texto es opcional. */
  protected responderReclamo(reclamo: Reclamo): void {
    const texto = this.textoReclamo.trim();
    const imagenes = this.imagenesReclamo();
    if ((!texto && !imagenes.length) || texto.length > 1000 || this.busy()) return;
    this.run(
      `claim-${reclamo.id}`,
      () => this.api.responderReclamo(reclamo.id, texto, imagenes),
      (value) => {
        const mensaje = value as NonNullable<Reclamo['mensajes']>[number];
        this.claims.update((items) => items.map((item) => item.id === reclamo.id ? {
          ...item,
          estado: item.estado === 'ABIERTO' ? 'EN_REVISION' : item.estado,
          mensajes: [...(item.mensajes ?? []).filter((previo) => previo.id !== mensaje.id), mensaje],
        } : item));
        this.imagenesReclamo.set([]);
        this.gestionReclamo.set(null);
      },
      'Mensaje enviado al hilo del reclamo.',
    );
  }

  protected resolverReclamoReserva(reclamo: Reclamo): void {
    if (this.busy()) return;
    const resolucion = this.resolucionReclamo;
    const importe = resolucion === 'DEVOLUCION_PARCIAL' ? this.importeReclamo : undefined;
    const observacion = this.observacionReclamo.trim();
    if (!observacion || observacion.length > 500) return;
    if (resolucion === 'DEVOLUCION_PARCIAL' && (importe == null || !Number.isFinite(importe) || importe <= 0)) {
      this.toast.mostrar('Indicá un importe parcial válido.', 'error');
      return;
    }
    if (resolucion === 'DEVOLUCION_PARCIAL' && this.parcialCubreElTotal(reclamo)) {
      this.toast.mostrar((reclamo.solicitud_cancelacion_id && reclamo.categoria !== 'DEMORA_ADMINISTRATIVA')
        ? 'La devolución parcial debe ser menor al faltante. Para completarlo elegí «Completar faltante».'
        : 'La devolución parcial tiene que ser menor que lo que pagó el inquilino. Para devolver todo elegí «Devolución total».', 'error');
      return;
    }
    this.run(
      `claim-${reclamo.id}`,
      () => this.api.resolverReclamo(reclamo.id, resolucion, importe ?? undefined, observacion),
      (value) => {
        const resuelto = value as Reclamo;
        this.claims.update((items) => items.map((item) => item.id === reclamo.id ? { ...item, ...resuelto, reserva: item.reserva } : item));
        this.gestionReclamo.set(null);
        this.toast.mostrar(this.avisoResolucion(reclamo, resuelto), 'exito');
        this.reload();
      },
      null,
    );
  }

  private avisoResolucion(reclamo: Reclamo, resuelto: Reclamo): string {
    if ((reclamo.solicitud_cancelacion_id && reclamo.categoria !== 'DEMORA_ADMINISTRATIVA')) return resuelto.resolucion === 'SIN_DEVOLUCION'
      ? 'Reclamo cerrado sin devolución adicional.'
      : `Reclamo resuelto con devolución del faltante de ${this.montoReclamo(reclamo, resuelto.importe_reembolso ?? 0)}. La devolución sigue en Reembolsos.`;
    if (resuelto.resolucion === 'SIN_DEVOLUCION') return 'Reclamo resuelto a favor del anunciante, sin devolución.';
    if (resuelto.resolucion === 'REINICIAR_CODIGO') return 'Pedido resuelto: el anunciante ya puede volver a cargar el código.';
    if (resuelto.resolucion === 'CONFIRMAR_INGRESO') return 'Pedido resuelto: el ingreso quedó confirmado y la liquidación pasa a pendiente de pago.';
    const tipo = resuelto.resolucion === 'DEVOLUCION_TOTAL' ? 'total' : 'parcial';
    const importe = resuelto.importe_reembolso ? ` de ${this.montoReclamo(reclamo, resuelto.importe_reembolso)}` : '';
    return `Reclamo resuelto con devolución ${tipo}${importe}. La devolución sigue en Reembolsos.`;
  }

  /** Lleva al reembolso del reclamo; si ya no está en la lista, abre la sección igual. */
  protected verReembolsoReclamo(reclamo: Reclamo): void {
    const reembolso = this.refunds().find((item) =>
      item.origen === 'RECLAMO' && item.referencia_interna === `rec:${reclamo.id}`);
    this.openSection('reembolsos', reembolso?.id);
  }

  /** Lo que pagó el inquilino; el back controla el saldo exacto descontando devoluciones previas. */
  protected totalPagadoReclamo(reclamo: Reclamo): number | null {
    if (reclamo.devolucion_cancelacion) return reclamo.devolucion_cancelacion.importeReclamable;
    const total = Number(reclamo.reserva?.monto_pago);
    return Number.isFinite(total) && total > 0 ? total : null;
  }

  /** Un parcial por todo lo pagado es una devolución total: se pide elegir esa opción. */
  protected parcialCubreElTotal(reclamo: Reclamo): boolean {
    const total = this.totalPagadoReclamo(reclamo);
    return total != null && this.importeReclamo != null && Number(this.importeReclamo) >= total - 0.009;
  }

  protected montoReclamo(reclamo: Reclamo, importe: number): string {
    return Number(importe).toLocaleString('es-AR', { style: 'currency', currency: reclamo.devolucion_cancelacion?.moneda || reclamo.reserva?.moneda_contratada || 'ARS' });
  }

  protected nombreInquilino(settlement: AdminSettlement): string {
    return (
      [
        settlement.usuario_nombre ?? settlement.usuario?.nombre,
        settlement.usuario_apellido ?? settlement.usuario?.apellido,
      ]
        .filter(Boolean)
        .join(' ') || 'Inquilino eliminado'
    );
  }

  protected montoLiquidacion(settlement: AdminSettlement): string {
    return Number(settlement.monto_pago).toLocaleString('es-AR', {
      style: 'currency',
      currency: settlement.moneda_contratada ?? 'ARS',
    });
  }

  protected guardarComision(): void {
    const porcentaje = this.comisionNueva;
    if (porcentaje == null || !Number.isFinite(porcentaje) || porcentaje < 0 || porcentaje > 100 || Math.abs(Math.round(porcentaje * 100) - porcentaje * 100) > 1e-8) {
      this.toast.mostrar('Ingresá un porcentaje entre 0 y 100 con hasta dos decimales.', 'error');
      return;
    }
    this.api.actualizarComisionDepa(porcentaje).subscribe({ next: (resultado) => { this.comisionActual = resultado.porcentaje; this.toast.mostrar('Comisión actualizada para nuevas reservas.', 'exito'); }, error: (e: Error) => this.toast.mostrar(e.message, 'error') });
  }

  protected cargarComision(): void {
    this.comisionCargando.set(true);
    this.comisionError.set('');
    this.api.obtenerComisionDepa().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ porcentaje }) => {
        this.comisionActual = porcentaje;
        this.comisionNueva = porcentaje;
        this.comisionCargando.set(false);
      },
      error: (error: Error) => {
        this.comisionActual = null;
        this.comisionCargando.set(false);
        this.comisionError.set(error.message || 'No se pudo consultar la comisión.');
      },
    });
  }

  protected cargarBloqueados(): void {
    this.bloqueadosRequest?.unsubscribe();
    this.bloqueadosCargando.set(true);
    this.bloqueadosError.set('');
    this.bloqueadosRequest = this.api.listarBloqueados().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (usuarios) => {
        this.bloqueados.set(usuarios);
        this.bloqueadosCargando.set(false);
      },
      error: (error: Error) => {
        this.bloqueadosError.set(error.message);
        this.bloqueadosCargando.set(false);
      },
    });
  }

  protected cambiarVistaBloqueos(vista: 'actuales' | 'historial'): void {
    this.vistaBloqueos.set(vista);
    if (vista === 'historial') this.cargarHistorialBloqueos();
  }

  private cargarHistorialBloqueos(): void {
    this.historialBloqueosCargando.set(true);
    this.historialBloqueosError.set('');
    this.api.listarHistorialBloqueos().pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.historialBloqueosCargando.set(false))).subscribe({
      next: registros => this.historialBloqueos.set(this.ordenarHistorialBloqueos(registros)),
      error: (error: Error) => this.historialBloqueosError.set(error.message),
    });
  }

  private ordenarHistorialBloqueos(registros: AdminBloqueo[]): AdminBloqueo[] {
    return [...registros].sort((a, b) => (b.detalle.fechaDesbloqueo ?? b.detalle.fecha ?? '').localeCompare(a.detalle.fechaDesbloqueo ?? a.detalle.fecha ?? ''));
  }

  protected toggleUser(user: AdminUser): void {
    if (!user.bloqueado) {
      this.usuarioPorBloquear.set(user);
      this.motivoBloqueo = '';
      this.bloqueoError.set('');
      this.bloqueoDialog().nativeElement.showModal();
      return;
    }
    this.run(
      `user-${user.id}`,
      () => this.api.cambiarBloqueo(user.id, false),
      () => this.actualizarBloqueoUsuario(user.id, false),
      'Usuario habilitado.',
    );
  }

  protected cerrarBloqueo(event?: Event): void {
    event?.preventDefault();
    if (this.bloqueando()) return;
    this.bloqueoDialog().nativeElement.close();
    this.usuarioPorBloquear.set(null);
  }

  protected confirmarBloqueo(): void {
    const usuario = this.usuarioPorBloquear();
    const motivo = this.motivoBloqueo.trim();
    if (!usuario || !motivo || motivo.length > 500 || this.bloqueando()) return;
    this.bloqueando.set(true);
    this.bloqueoError.set('');
    this.api.cambiarBloqueo(usuario.id, true, motivo).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ accesoLimitado }) => {
        this.bloqueando.set(false);
        this.cerrarBloqueo();
        this.actualizarBloqueoUsuario(usuario.id, true);
        this.toast.mostrar(accesoLimitado ? 'Usuario bloqueado con acceso a operaciones pendientes.' : 'Usuario bloqueado.', 'exito');
      },
      error: (error: Error) => {
        this.bloqueando.set(false);
        this.bloqueoError.set(error.message);
      },
    });
  }

  private actualizarBloqueoUsuario(id: number, bloqueado: boolean): void {
    this.users.update((usuarios) => usuarios.map((usuario) => usuario.id === id ? { ...usuario, bloqueado } : usuario));
    this.cargarBloqueados();
  }

  protected readonly mensajesApelacion = mensajesApelacion;

  protected cancelarRespuesta(bloqueo: AdminBloqueo): void {
    this.respuestasApelacion[bloqueo.detalle.id] = '';
    this.quitarImagenApelacion(bloqueo);
    this.bloqueadosError.set('');
  }

  protected desbloquearDesdeApelaciones(bloqueo: AdminBloqueo): void {
    if (this.busy()) return;
    this.run(`user-${bloqueo.usuario.id}`, () => this.api.cambiarBloqueo(bloqueo.usuario.id, false), () => {
      this.cancelarRespuesta(bloqueo);
      this.actualizarBloqueoUsuario(bloqueo.usuario.id, false);
    }, 'Usuario habilitado.');
  }

  protected responderApelacion(bloqueo: AdminBloqueo): void {
    const texto = (this.respuestasApelacion[bloqueo.detalle.id] ?? '').trim();
    if (!texto || texto.length > 2000 || this.busy()) return;
    this.busy.set(`apelacion-${bloqueo.detalle.id}`);
    this.bloqueadosError.set('');
    this.api.responderApelacion(bloqueo.usuario.id, bloqueo.detalle.id, texto, this.imagenesApelacion[bloqueo.detalle.id])
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.busy.set(null);
          this.cancelarRespuesta(bloqueo);
          this.cargarBloqueados();
        },
        error: (error: Error) => {
          this.busy.set(null);
          this.bloqueadosError.set(error.message);
        },
      });
  }
  protected enviarApelacionConEnter(evento: Event, bloqueo: AdminBloqueo): void {
    const tecla = evento as KeyboardEvent;
    if (tecla.shiftKey || tecla.isComposing) return;
    tecla.preventDefault();
    this.responderApelacion(bloqueo);
  }

  protected seleccionarImagenApelacion(evento: Event, bloqueo: AdminBloqueo): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (!archivo) return;
    if (!['image/jpeg', 'image/png'].includes(archivo.type) || archivo.size > 5 * 1024 * 1024) {
      this.bloqueadosError.set('Elegí una imagen JPEG o PNG de hasta 5 MB.');
      return;
    }
    this.bloqueadosError.set('');
    this.quitarImagenApelacion(bloqueo);
    this.imagenesApelacion[bloqueo.detalle.id] = archivo;
    this.vistasPreviasApelacion[bloqueo.detalle.id] = URL.createObjectURL(archivo);
  }

  protected quitarImagenApelacion(bloqueo: AdminBloqueo): void {
    const id = bloqueo.detalle.id;
    const url = this.vistasPreviasApelacion[id];
    if (url) URL.revokeObjectURL(url);
    this.vistasPreviasApelacion[id] = null;
    this.imagenesApelacion[id] = null;
  }

  protected approve(request: VerificationRequest): void {
    if (!this.puedeResolverVerificacion(request, false, false)) return;
    const id = request.anunciante.idUsuario;
    this.run(
      `request-${id}`,
      () => this.api.aprobar(id, request.numero_revision, !!request.cbu_pendiente, this.titularCbuConfirmado === request.id),
      () => {
        this.titularCbuConfirmado = null;
        this.requests.update((v) => v.filter((r) => r.id !== request.id));
      },
      'Solicitud aprobada.',
    );
  }
  protected openReject(request: VerificationRequest): void {
    this.rejectReason = '';
    this.rechazarIdentidad = request.revisar_identidad && !request.cbu_pendiente;
    this.rechazarCbu = !!request.cbu_pendiente && !request.revisar_identidad;
    this.rejectId.set(request.id);
  }
  protected cancelReject(): void {
    this.rejectId.set(null);
    this.rejectReason = '';
  }
  protected confirmReject(request: VerificationRequest): void {
    const motivo = this.rejectReason.trim();
    if (motivo.length < 5 || (!this.rechazarIdentidad && !this.rechazarCbu) ||
      !this.puedeResolverVerificacion(request, this.rechazarIdentidad, this.rechazarCbu)) return;
    const id = request.anunciante.idUsuario;
    this.run(
      `request-${id}`,
      () => this.api.rechazar(id, {
        motivo,
        numero_revision: request.numero_revision,
        revisar_cbu: !!request.cbu_pendiente,
        titular_cbu_confirmado: this.titularCbuConfirmado === request.id,
        rechazar_identidad: this.rechazarIdentidad,
        rechazar_cbu: this.rechazarCbu,
      }),
      () => {
        this.titularCbuConfirmado = null;
        this.requests.update((v) => v.filter((r) => r.id !== request.id));
        this.cancelReject();
      },
      'Solicitud rechazada.',
    );
  }
  protected puedeResolverVerificacion(request: VerificationRequest, rechazaIdentidad: boolean, rechazaCbu: boolean): boolean {
    return this.busy() !== 'request-' + request.anunciante.idUsuario &&
      (!request.revisar_identidad || rechazaIdentidad || !!request.prueba_vida_validada_en) &&
      (!request.cbu_pendiente || rechazaCbu || this.titularCbuConfirmado === request.id);
  }
  protected esVideo(url: string): boolean {
    return /\.(mp4|webm|mov)(?:\?|$)/i.test(url);
  }
  private run(key: string, request: () => any, success: (value: unknown) => void, message: string | null, failure?: () => void): void {
    this.busy.set(key);
    request().subscribe({
      next: (v: unknown) => {
        success(v);
        if (message) this.toast.mostrar(message, 'exito');
        this.busy.set(null);
      },
      error: (e: Error) => {
        failure?.();
        this.toast.mostrar(e.message, 'error');
        this.busy.set(null);
      },
    });
  }

  protected loadCatalogs(): void {
    const sections = this.catalogs();
    forkJoin(sections.map((s) => this.api.listarCatalogo(s.key))).subscribe({
      next: (values) => this.catalogs.set(sections.map((s, i) => ({ ...s, items: values[i] }))),
      error: (e: Error) => this.toast.mostrar(e.message, 'error'),
    });
  }
  protected loadProvinces(): void {
    this.api.listarProvincias().subscribe({
      next: (v) => {
        this.provinces.set(v);
      },
      error: (e: Error) => this.toast.mostrar(e.message, 'error'),
    });
  }
  protected selectProvince(id: number): void {
    this.selectedProvince.set(id);
    this.api.listarCiudades(id).subscribe({
      next: (v) => this.cities.set(v),
      error: (e: Error) => this.toast.mostrar(e.message, 'error'),
    });
  }
}
