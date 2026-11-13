import { CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, computed, DestroyRef, ElementRef, inject, Injector, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin, Subscription } from 'rxjs';
import { ToastService } from '../../core/services/toast.service';
import { Publicacion } from '../../shared/models/publicacion.model';
import { CotizacionesAdminComponent } from './cotizaciones-admin.component';
import {
  LucideUsers,
  LucideShieldCheck,
  LucideRefreshCw,
  LucideSearch,
  LucideCheck,
  LucideX,
  LucideCalendarX,
  LucideMessageCircle,
  LucideTriangleAlert,
  LucideChevronRight,
  LucideHouse,
  LucideWallet,
} from '@lucide/angular';
import {
  AdminBloqueo,
  AdminCancellationRequest,
  AdminCatalogItem,
  AdminReembolso,
  AdminSettlement,
  AdminCity,
  AdminProvince,
  AdminService,
  AdminUser,
  CatalogKey,
  VerificationRequest,
} from './admin.service';
import { Reclamo } from '../../shared/services/reservation.service';
import { ClaimHistoryComponent } from '../../shared/components/claim-history/claim-history.component';

interface CatalogSection {
  key: CatalogKey;
  label: string;
  items: AdminCatalogItem[];
}

const ADMIN_NAVIGATION = [
  { label: 'Operaciones', items: [
    { id: 'cancelaciones', label: 'Cancelaciones' },
    { id: 'reclamos', label: 'Reclamos' },
    { id: 'reembolsos', label: 'Reembolsos' },
    { id: 'liquidaciones', label: 'Liquidaciones' },
  ] },
  { label: 'Gestión', items: [
    { id: 'verificaciones', label: 'Verificaciones' },
    { id: 'publicaciones', label: 'Publicaciones' },
    { id: 'usuarios', label: 'Usuarios' },
    { id: 'bloqueos', label: 'Bloqueos y apelaciones' },
  ] },
  { label: 'Configuración', items: [
    { id: 'catalogos', label: 'Catálogos' },
    { id: 'ubicaciones', label: 'Ubicaciones' },
    { id: 'cotizaciones', label: 'Cotizaciones' },
  ] },
] as const;

type AdminSection = 'resumen' | typeof ADMIN_NAVIGATION[number]['items'][number]['id'];

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CotizacionesAdminComponent,
    ClaimHistoryComponent,
    CurrencyPipe,
    DatePipe,
    FormsModule,
    LucideUsers,
    LucideShieldCheck,
    LucideRefreshCw,
    LucideSearch,
    LucideCheck,
    LucideX,
    LucideCalendarX,
    LucideMessageCircle,
    LucideTriangleAlert,
    LucideChevronRight,
    LucideHouse,
    LucideWallet,
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss', './admin-dashboard.scss'],
})
export class AdminComponent {
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly navigation = ADMIN_NAVIGATION;
  protected readonly activeSection = signal<AdminSection>('resumen');
  protected readonly sectionLabel = computed(() =>
    this.navigation.flatMap(({ items }) => [...items]).find(({ id }) => id === this.activeSection())?.label ?? 'Resumen',
  );
  private readonly api = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private publicationsRequest?: Subscription;
  private usersRequest?: Subscription;
  private bloqueadosRequest?: Subscription;
  private readonly bloqueoDialog = viewChild.required<ElementRef<HTMLDialogElement>>('bloqueoDialog');
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  protected readonly users = signal<AdminUser[]>([]);
  protected readonly bloqueados = signal<AdminBloqueo[]>([]);
  protected readonly bloqueadosCargando = signal(true);
  protected readonly bloqueadosError = signal('');
  protected readonly usuarioPorBloquear = signal<AdminUser | null>(null);
  protected readonly bloqueando = signal(false);
  protected readonly bloqueoError = signal('');
  protected motivoBloqueo = '';
  protected readonly apelacionSeleccionada = signal<string | null>(null);
  protected respuestaApelacion = '';
  protected readonly publications = signal<Publicacion[]>([]);
  protected readonly publicationQuery = signal('');
  protected readonly bajaId = signal<number | null>(null);
  protected bajaReason = '';
  protected readonly publicationsPage = signal(1);
  protected readonly publicationsTotal = signal(0);
  protected readonly publicationsPages = signal(1);
  protected readonly publicationsLoading = signal(true);
  protected readonly usersPage = signal(1);
  protected readonly usersTotal = signal(0);
  protected readonly usersPages = signal(1);
  protected readonly usersLoading = signal(true);
  protected readonly registeredUsers = signal(0);
  protected readonly requests = signal<VerificationRequest[]>([]);
  protected readonly settlements = signal<AdminSettlement[]>([]);
  protected readonly claims = signal<Reclamo[]>([]);
  protected readonly errorReclamos = signal('');
  protected readonly gestionReclamo = signal<{ id: number; accion: 'mensaje' | 'resolver' } | null>(null);
  protected textoReclamo = '';
  protected resolucionReclamo: NonNullable<Reclamo['resolucion']> = 'SIN_DEVOLUCION';
  protected importeReclamo: number | null = null;
  protected referenciaReclamo = '';
  protected observacionReclamo = '';
  protected readonly cancellations = signal<AdminCancellationRequest[]>([]);
  private readonly dialogoAprobacion = viewChild.required<ElementRef<HTMLDialogElement>>('dialogoAprobacion');
  protected readonly solicitudPorAprobar = signal<AdminCancellationRequest | null>(null);
  protected readonly aprobandoCancelacion = signal(false);
  protected readonly errorAprobacion = signal('');
  protected observacionAprobacion = '';
  protected readonly refunds = signal<AdminReembolso[]>([]);
  private readonly dialogoReembolso = viewChild.required<ElementRef<HTMLDialogElement>>('dialogoReembolso');
  protected readonly reembolsoSeleccionado = signal<AdminReembolso | null>(null);
  protected readonly guardandoReembolso = signal(false);
  protected readonly errorReembolso = signal('');
  protected referenciaReembolso = '';
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
  protected readonly pendingRefunds = computed(() => this.refunds().filter(({ estado }) =>
    estado === 'PENDIENTE' || estado === 'EN_PROCESO' || estado === 'FALLIDO',
  ));
  protected readonly manualRefunds = computed(() =>
    this.pendingRefunds().filter((item) => !item.ejecucion_automatica && this.puedeRegistrarReembolso(item)),
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
      status: this.manualRefunds().includes(item) ? 'Registro manual' : this.estadosReembolso[item.estado],
      tone: 'refund', action: 'Ver detalle',
    })),
    ...this.requests().slice(0, 2).map((item) => ({
      section: 'verificaciones' as const, id: item.id,
      label: `Verificación · Solicitud #${item.id}`,
      status: 'Pendiente', tone: 'pending', action: 'Revisar',
    })),
  ]);
  protected readonly loading = computed(() =>
    this.otherLoading() || this.publicationsLoading() || this.usersLoading(),
  );
  protected readonly query = signal('');
  protected readonly busy = signal<string | null>(null);
  protected readonly rejectId = signal<number | null>(null);
  protected readonly catalogs = signal<CatalogSection[]>([
    { key: 'roles', label: 'Roles', items: [] },
    { key: 'tipos-anunciante', label: 'Tipos de anunciante', items: [] },
    { key: 'tipos-propiedad', label: 'Tipos de propiedad', items: [] },
    { key: 'modalidades', label: 'Modalidades', items: [] },
    { key: 'tipos-moneda', label: 'Monedas', items: [] },
  ]);
  protected readonly provinces = signal<AdminProvince[]>([]);
  protected readonly cities = signal<AdminCity[]>([]);
  protected readonly selectedProvince = signal<number | null>(null);
  protected editing = '';
  protected draft = '';
  protected newValues: Record<string, string> = {};
  protected rejectReason = '';
  // Opciones del select de rol: salen del catálogo de roles de la BD, así que
  // crear o renombrar un rol en la sección Catálogos se refleja al instante.
  protected readonly roles = computed(
    () => this.catalogs().find((s) => s.key === 'roles')?.items ?? [],
  );

  constructor() {
    if (this.isBrowser) {
      this.reload();
      this.loadCatalogs();
      this.loadProvinces();
    }
  }
  protected reload(): void {
    this.otherLoading.set(true);
    this.summaryError.set(false);
    this.loadPublications(this.publicationsPage());
    this.loadUsers(this.usersPage());
    this.cargarBloqueados();
    let pending = 5;
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
  }

  protected openSection(section: AdminSection, caseId?: number): void {
    this.activeSection.set(section);
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

  protected searchPublications(value: string): void {
    this.publicationQuery.set(value);
    this.loadPublications(1);
  }

  protected searchUsers(value: string): void {
    this.query.set(value);
    this.loadUsers(1);
  }

  protected loadPublications(page: number): void {
    if (page < 1 || page > this.publicationsPages()) return;
    this.publicationsRequest?.unsubscribe();
    this.publicationsLoading.set(true);
    this.bajaId.set(null);
    this.publicationsRequest = this.api.listarPublicaciones(page, this.publicationQuery().trim())
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (result) => {
          this.publications.set(result.datos);
          this.publicationsPage.set(result.pagina);
          this.publicationsTotal.set(result.total);
          this.publicationsPages.set(result.totalPaginas);
          this.publicationsLoading.set(false);
        },
        error: (e: Error) => {
          this.publications.set([]);
          this.publicationsTotal.set(0);
          this.publicationsPage.set(1);
          this.publicationsPages.set(1);
          this.toast.mostrar(e.message, 'error');
          this.publicationsLoading.set(false);
        },
      });
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

  protected openBaja(publication: Publicacion): void {
    this.bajaReason = publication.motivo_baja_admin ?? '';
    this.bajaId.set(publication.id);
  }

  protected confirmBaja(publication: Publicacion): void {
    if (this.busy()) return;
    const motivo = this.bajaReason.trim();
    if (!motivo || motivo.length > 500) return;
    this.run(
      `publication-${publication.id}`,
      () => this.api.darDeBajaPublicacion(publication.id, motivo),
      (value) => {
        const result = value as { publicacion: Publicacion; correoEnviado: boolean };
        this.publications.update((items) =>
          items.map((item) => (item.id === publication.id ? result.publicacion : item)),
        );
        this.bajaId.set(null);
        if (!result.correoEnviado) {
          this.toast.mostrar(
            'La publicación fue desactivada, pero no se pudo enviar el correo. Podés repetir la baja para reintentar el aviso.',
            'advertencia',
          );
          return;
        }
        this.toast.mostrar('Publicación desactivada. El motivo quedó guardado en la cuenta del dueño.', 'exito');
      },
      null,
    );
  }

  protected registrarPago(settlement: AdminSettlement): void {
    const referencia = window
      .prompt('Referencia o comprobante de la transferencia manual:')
      ?.trim();
    if (referencia === undefined) return;
    this.resolverSettlement(
      settlement,
      'PAGADO_PROPIETARIO',
      referencia,
      'Transferencia manual al propietario registrada',
    );
  }

  protected registrarDevolucion(settlement: AdminSettlement): void {
    const referencia = window
      .prompt('Referencia o comprobante de la devolución manual al inquilino:')
      ?.trim();
    if (referencia === undefined) return;
    this.resolverSettlement(
      settlement,
      'DEVUELTO_INQUILINO',
      referencia,
      'Devolución manual al inquilino registrada',
    );
  }

  protected resolverReclamo(settlement: AdminSettlement): void {
    const observacion = window.prompt('Conclusión de la revisión administrativa:')?.trim();
    if (!observacion) return;
    const siguiente = settlement.codigo_validado_en ? 'PENDIENTE_PAGO_PROPIETARIO' : 'RETENIDO';
    this.run(
      `settlement-${settlement.id}`,
      () => this.api.resolverLiquidacion(settlement.id, siguiente, undefined, observacion),
      () => this.settlements.update((items) => items.filter((item) => item.id !== settlement.id)),
      'Reclamo resuelto. La reserva volvió a su circuito normal.',
    );
  }

  protected verEvidencia(reclamo: Reclamo, evidencia: { id: number; nombre_archivo: string }): void {
    this.api.urlEvidenciaReclamo(reclamo.id, evidencia.id).subscribe({
      next: ({ url }) => window.open(url, '_blank', 'noopener'),
      error: (e: Error) => this.toast.mostrar(e.message, 'error'),
    });
  }

  protected abrirAprobacionCancelacion(solicitud: AdminCancellationRequest): void {
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
    if (!solicitud || this.aprobandoCancelacion() || observacion.length > 500) return;

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
          this.toast.mostrar('Cancelación aprobada. La devolución quedó pendiente de registrar.', 'exito');
          this.reload();
        },
        error: (error: Error) => this.errorAprobacion.set(error.message),
      });
  }

  protected abrirReembolso(reembolso: AdminReembolso): void {
    this.reembolsoSeleccionado.set(reembolso);
    this.referenciaReembolso = '';
    this.errorReembolso.set('');
    this.dialogoReembolso().nativeElement.showModal();
  }

  protected cerrarReembolso(evento?: Event): void {
    evento?.preventDefault();
    if (!this.guardandoReembolso()) this.dialogoReembolso().nativeElement.close();
  }

  protected puedeRegistrarReembolso(reembolso: AdminReembolso): boolean {
    return reembolso.estado === 'PENDIENTE' || reembolso.estado === 'FALLIDO' ||
      (reembolso.estado === 'EN_PROCESO' && !reembolso.ejecucion_automatica);
  }

  protected registrarReembolsoPendiente(reembolso: AdminReembolso): void {
    const referencia = this.referenciaReembolso.trim();
    if (this.guardandoReembolso() || !this.puedeRegistrarReembolso(reembolso) ||
        (!reembolso.ejecucion_automatica && (!referencia || referencia.length > 150))) return;

    this.errorReembolso.set('');
    this.guardandoReembolso.set(true);
    this.api.registrarReembolso(reembolso.id, reembolso.ejecucion_automatica ? undefined : referencia)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.guardandoReembolso.set(false)))
      .subscribe({
        next: () => {
          this.dialogoReembolso().nativeElement.close();
          this.toast.mostrar('Reembolso registrado y aplicado a la reserva.', 'exito');
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
    this.resolucionReclamo = 'SIN_DEVOLUCION';
    this.importeReclamo = null;
    this.referenciaReclamo = '';
    this.observacionReclamo = '';
    this.gestionReclamo.set({ id, accion });
  }

  protected responderReclamo(reclamo: Reclamo): void {
    const texto = this.textoReclamo.trim();
    if (!texto || texto.length > 1000 || this.busy()) return;
    this.run(
      `claim-${reclamo.id}`,
      () => this.api.responderReclamo(reclamo.id, texto),
      (value) => {
        const mensaje = value as NonNullable<Reclamo['mensajes']>[number];
        this.claims.update((items) => items.map((item) => item.id === reclamo.id ? {
          ...item,
          estado: item.estado === 'ABIERTO' ? 'EN_REVISION' : item.estado,
          mensajes: [...(item.mensajes ?? []).filter((previo) => previo.id !== mensaje.id), mensaje],
        } : item));
        this.gestionReclamo.set(null);
      },
      'Mensaje enviado al hilo del reclamo.',
    );
  }

  protected resolverReclamoReserva(reclamo: Reclamo): void {
    if (this.busy()) return;
    const resolucion = this.resolucionReclamo;
    const importe = resolucion === 'DEVOLUCION_PARCIAL' ? this.importeReclamo : undefined;
    const referencia = resolucion === 'SIN_DEVOLUCION' ? undefined : this.referenciaReclamo.trim() || undefined;
    const observacion = this.observacionReclamo.trim();
    if (!observacion || observacion.length > 500) return;
    if (resolucion === 'DEVOLUCION_PARCIAL' && (importe == null || !Number.isFinite(importe) || importe <= 0)) {
      this.toast.mostrar('Indicá un importe parcial válido.', 'error');
      return;
    }
    this.run(
      `claim-${reclamo.id}`,
      () => this.api.resolverReclamo(reclamo.id, resolucion, importe ?? undefined, referencia, observacion),
      (value) => {
        const resuelto = value as Reclamo;
        this.claims.update((items) => items.map((item) => item.id === reclamo.id ? { ...item, ...resuelto, reserva: item.reserva } : item));
        this.gestionReclamo.set(null);
        this.reload();
      },
      'Reclamo resuelto.',
    );
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

  private resolverSettlement(settlement: AdminSettlement, estado: 'PAGADO_PROPIETARIO' | 'DEVUELTO_INQUILINO', referencia: string, observacion: string): void {
    this.run(
      `settlement-${settlement.id}`,
      () => this.api.resolverLiquidacion(settlement.id, estado, referencia, observacion),
      () => this.settlements.update((items) => items.filter((item) => item.id !== settlement.id)),
      estado === 'PAGADO_PROPIETARIO' ? 'Pago manual registrado.' : 'Devolución manual registrada.',
    );
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
      next: () => {
        this.bloqueando.set(false);
        this.cerrarBloqueo();
        this.actualizarBloqueoUsuario(usuario.id, true);
        this.toast.mostrar('Usuario bloqueado.', 'exito');
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

  protected abrirRespuesta(bloqueo: AdminBloqueo): void {
    this.respuestaApelacion = '';
    this.bloqueadosError.set('');
    this.apelacionSeleccionada.set(bloqueo.detalle.id);
  }

  protected responderApelacion(bloqueo: AdminBloqueo): void {
    const texto = this.respuestaApelacion.trim();
    if (!texto || texto.length > 2000 || this.busy()) return;
    this.busy.set(`apelacion-${bloqueo.detalle.id}`);
    this.bloqueadosError.set('');
    this.api.responderApelacion(bloqueo.usuario.id, bloqueo.detalle.id, texto)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.busy.set(null);
          this.apelacionSeleccionada.set(null);
          this.cargarBloqueados();
        },
        error: (error: Error) => {
          this.busy.set(null);
          this.bloqueadosError.set(error.message);
        },
      });
  }
  protected changeRole(user: AdminUser, select: HTMLSelectElement): void {
    const role = select.value;
    if (role === user.rol?.nombre) return;
    this.run(
      `user-${user.id}`,
      () => this.api.cambiarRol(user.id, role),
      (updated) =>
        this.users.update((v) => v.map((u) => (u.id === user.id ? (updated as AdminUser) : u))),
      'Rol actualizado.',
      // Si el backend lo rechaza, el select vuelve a mostrar el rol que realmente tiene.
      () => (select.value = user.rol?.nombre ?? ''),
    );
  }
  protected approve(request: VerificationRequest): void {
    const id = request.anunciante.idUsuario;
    this.run(
      `request-${id}`,
      () => this.api.aprobar(id, request.numero_revision),
      () => this.requests.update((v) => v.filter((r) => r.id !== request.id)),
      'Solicitud aprobada.',
    );
  }
  protected openReject(request: VerificationRequest): void {
    this.rejectReason = '';
    this.rejectId.set(request.id);
  }
  protected cancelReject(): void {
    this.rejectId.set(null);
    this.rejectReason = '';
  }
  protected confirmReject(request: VerificationRequest): void {
    const motivo = this.rejectReason.trim();
    if (!motivo) return;
    const id = request.anunciante.idUsuario;
    this.run(
      `request-${id}`,
      () => this.api.rechazar(id, motivo, request.numero_revision),
      () => {
        this.requests.update((v) => v.filter((r) => r.id !== request.id));
        this.cancelReject();
      },
      'Solicitud rechazada.',
    );
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
  protected addCatalog(s: CatalogSection): void {
    const n = (this.newValues[s.key] || '').trim();
    if (!n) return;
    this.run(
      `catalog-${s.key}`,
      () => this.api.crearCatalogo(s.key, n),
      (v) => {
        this.setCatalog(s.key, [...s.items, v as AdminCatalogItem]);
        this.newValues[s.key] = '';
      },
      `${s.label}: elemento creado.`,
    );
  }
  protected edit(key: string, item: AdminCatalogItem): void {
    this.editing = `${key}-${item.id}`;
    this.draft = item.nombre;
  }
  protected cancelEdit(): void {
    this.editing = '';
    this.draft = '';
  }
  protected saveCatalog(s: CatalogSection, item: AdminCatalogItem): void {
    const n = this.draft.trim();
    if (!n) return;
    this.run(
      `catalog-${s.key}`,
      () => this.api.actualizarCatalogo(s.key, item.id, n),
      (v) => {
        this.setCatalog(
          s.key,
          s.items.map((x) => (x.id === item.id ? (v as AdminCatalogItem) : x)),
        );
        this.cancelEdit();
      },
      `${s.label}: elemento actualizado.`,
    );
  }
  protected deleteCatalog(s: CatalogSection, item: AdminCatalogItem): void {
    if (!confirm(`¿Eliminar “${item.nombre}”?`)) return;
    this.run(
      `catalog-${s.key}`,
      () => this.api.eliminarCatalogo(s.key, item.id),
      () =>
        this.setCatalog(
          s.key,
          s.items.filter((x) => x.id !== item.id),
        ),
      `${s.label}: elemento eliminado.`,
    );
  }
  private setCatalog(key: CatalogKey, items: AdminCatalogItem[]): void {
    this.catalogs.update((v) => v.map((s) => (s.key === key ? { ...s, items } : s)));
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
  protected addProvince(): void {
    const n = (this.newValues['province'] || '').trim();
    if (!n) return;
    this.run(
      'province',
      () => this.api.crearProvincia(n),
      (v) => {
        this.provinces.update((x) => [...x, v as AdminProvince]);
        this.newValues['province'] = '';
      },
      'Provincia creada.',
    );
  }
  protected saveProvince(item: AdminProvince): void {
    const n = this.draft.trim();
    if (!n) return;
    this.run(
      'province',
      () => this.api.actualizarProvincia(item.id, n),
      (v) => {
        this.provinces.update((x) => x.map((p) => (p.id === item.id ? (v as AdminProvince) : p)));
        this.cancelEdit();
      },
      'Provincia actualizada.',
    );
  }
  protected deleteProvince(item: AdminProvince): void {
    if (!confirm(`¿Eliminar “${item.nombre}”?`)) return;
    this.run(
      'province',
      () => this.api.eliminarProvincia(item.id),
      () => {
        this.provinces.update((x) => x.filter((p) => p.id !== item.id));
        if (this.selectedProvince() === item.id) {
          this.selectedProvince.set(null);
          this.cities.set([]);
        }
      },
      'Provincia eliminada.',
    );
  }
  protected addCity(): void {
    const id = this.selectedProvince(),
      n = (this.newValues['city'] || '').trim();
    if (!id || !n) return;
    this.run(
      'city',
      () => this.api.crearCiudad(n, id),
      (v) => {
        this.cities.update((x) => [...x, v as AdminCity]);
        this.newValues['city'] = '';
      },
      'Ciudad creada.',
    );
  }
  protected saveCity(item: AdminCity): void {
    const id = this.selectedProvince(),
      n = this.draft.trim();
    if (!id || !n) return;
    this.run(
      'city',
      () => this.api.actualizarCiudad(item.id, n, id),
      (v) => {
        this.cities.update((x) => x.map((c) => (c.id === item.id ? (v as AdminCity) : c)));
        this.cancelEdit();
      },
      'Ciudad actualizada.',
    );
  }
  protected deleteCity(item: AdminCity): void {
    if (!confirm(`¿Eliminar “${item.nombre}”?`)) return;
    this.run(
      'city',
      () => this.api.eliminarCiudad(item.id),
      () => this.cities.update((x) => x.filter((c) => c.id !== item.id)),
      'Ciudad eliminada.',
    );
  }
}
