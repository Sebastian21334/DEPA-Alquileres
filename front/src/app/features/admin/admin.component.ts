import { CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { Component, computed, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';
import { Publicacion } from '../../shared/models/publicacion.model';
import { CotizacionesAdminComponent } from './cotizaciones-admin.component';
import {
  LucideUsers,
  LucideShieldCheck,
  LucideRefreshCw,
  LucideSearch,
  LucideCheck,
  LucideX,
} from '@lucide/angular';
import {
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

interface CatalogSection {
  key: CatalogKey;
  label: string;
  items: AdminCatalogItem[];
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CotizacionesAdminComponent,
    CurrencyPipe,
    DatePipe,
    FormsModule,
    LucideUsers,
    LucideShieldCheck,
    LucideRefreshCw,
    LucideSearch,
    LucideCheck,
    LucideX,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  private readonly api = inject(AdminService);
  private readonly destroyRef = inject(DestroyRef);
  private publicationsRequest?: Subscription;
  private usersRequest?: Subscription;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  protected readonly users = signal<AdminUser[]>([]);
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
  protected readonly cancellations = signal<AdminCancellationRequest[]>([]);
  protected readonly refunds = signal<AdminReembolso[]>([]);
  protected readonly otherLoading = signal(true);
  protected readonly loading = computed(() =>
    this.otherLoading() || this.publicationsLoading() || this.usersLoading(),
  );
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
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
    this.error.set(null);
    this.loadPublications(this.publicationsPage());
    this.loadUsers(this.usersPage());
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
        this.error.set(e.message);
        done();
      },
    });
    this.api.listarLiquidaciones().subscribe({
      next: (v) => {
        this.settlements.set(v);
        done();
      },
      error: (e: Error) => {
        this.error.set(e.message);
        done();
      },
    });
    this.api.listarReclamos().subscribe({
      next: (v) => {
        this.claims.set(v);
        done();
      },
      error: (e: Error) => {
        this.error.set(e.message);
        done();
      },
    });
    this.api.listarSolicitudesCancelacion().subscribe({
      next: (v) => {
        this.cancellations.set(v);
        done();
      },
      error: (e: Error) => {
        this.error.set(e.message);
        done();
      },
    });
    this.api.listarReembolsos().subscribe({
      next: (v) => {
        this.refunds.set(v);
        done();
      },
      error: (e: Error) => {
        this.error.set(e.message);
        done();
      },
    });
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
    this.error.set(null);
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
          this.error.set(e.message);
          this.publicationsLoading.set(false);
        },
      });
  }

  protected loadUsers(page: number): void {
    if (page < 1 || page > this.usersPages()) return;
    this.usersRequest?.unsubscribe();
    this.usersLoading.set(true);
    this.error.set(null);
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
          this.error.set(e.message);
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
          this.error.set(
            'La publicación fue desactivada, pero no se pudo enviar el correo. Podés repetir la baja para reintentar el aviso.',
          );
        }
      },
      'Publicación desactivada. El motivo quedó guardado en la cuenta del dueño.',
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

  protected verEvidencia(
    reclamo: Reclamo,
    evidencia: { id: number; nombre_archivo: string },
  ): void {
    this.api.urlEvidenciaReclamo(reclamo.id, evidencia.id).subscribe({
      next: ({ url }) => window.open(url, '_blank', 'noopener'),
      error: (e: Error) => this.error.set(e.message),
    });
  }

  protected aprobarCancelacion(solicitud: AdminCancellationRequest): void {
    const observacion = window.prompt('Observación de la aprobación (opcional):')?.trim();
    this.run(
      `cancellation-${solicitud.id}`,
      () =>
        this.api.resolverSolicitudCancelacion(
          solicitud.reserva?.id ?? 0,
          solicitud.id,
          'APROBADA',
          observacion,
        ),
      (value) => {
        this.cancellations.update((items) =>
          items.filter((item) => item.id !== solicitud.id),
        );
        const resultado = value as {
          reembolso: { id: number; importe: number; moneda: string } | null;
        };
        if (!resultado.reembolso) {
          this.notice.set('Cancelación aprobada sin devolución.');
          return;
        }
        const referencia = window
          .prompt('Referencia o comprobante de la devolución:')
          ?.trim();
        if (!referencia) {
          this.notice.set(
            'Cancelación aprobada. La devolución quedó pendiente de registrar.',
          );
          return;
        }
        this.api.registrarReembolso(resultado.reembolso.id, referencia).subscribe({
          next: () => this.notice.set('Cancelación y devolución registradas.'),
          error: (e: Error) => this.error.set(e.message),
        });
      },
      'Solicitud de cancelación aprobada.',
    );
  }

  protected registrarReembolsoPendiente(reembolso: AdminReembolso): void {
    const referencia = window
      .prompt('Referencia o comprobante de la devolución:')
      ?.trim();
    if (!referencia) return;
    this.run(
      `refund-${reembolso.id}`,
      () => this.api.registrarReembolso(reembolso.id, referencia),
      () =>
        this.refunds.update((items) =>
          items.filter((item) => item.id !== reembolso.id),
        ),
      'Reembolso registrado y aplicado a la reserva.',
    );
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

  protected responderReclamo(reclamo: Reclamo): void {
    const texto = window.prompt('Mensaje para el Inquilino y el Anunciante:')?.trim();
    if (!texto) return;
    this.run(
      `claim-${reclamo.id}`,
      () => this.api.responderReclamo(reclamo.id, texto),
      () => undefined,
      'Mensaje enviado al hilo del reclamo.',
    );
  }

  protected resolverReclamoReserva(
    reclamo: Reclamo,
    resolucion: 'SIN_DEVOLUCION' | 'DEVOLUCION_TOTAL' | 'DEVOLUCION_PARCIAL',
  ): void {
    let importe: number | undefined;
    if (resolucion === 'DEVOLUCION_PARCIAL') {
      const valor = window.prompt('Importe parcial a devolver:')?.trim();
      importe = Number(valor);
      if (!Number.isFinite(importe) || importe <= 0) {
        this.error.set('Indicá un importe parcial válido.');
        return;
      }
    }
    const referencia = window.prompt('Referencia o comprobante (obligatorio para devoluciones manuales):')?.trim();
    const observacion = window.prompt('Conclusión de la revisión:')?.trim();
    this.run(
      `claim-${reclamo.id}`,
      () =>
        this.api.resolverReclamo(
          reclamo.id,
          resolucion,
          importe,
          referencia,
          observacion,
        ),
      () => this.claims.update((items) => items.filter((item) => item.id !== reclamo.id)),
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

  private resolverSettlement(
    settlement: AdminSettlement,
    estado: 'PAGADO_PROPIETARIO' | 'DEVUELTO_INQUILINO',
    referencia: string,
    observacion: string,
  ): void {
    this.run(
      `settlement-${settlement.id}`,
      () => this.api.resolverLiquidacion(settlement.id, estado, referencia, observacion),
      () => this.settlements.update((items) => items.filter((item) => item.id !== settlement.id)),
      estado === 'PAGADO_PROPIETARIO' ? 'Pago manual registrado.' : 'Devolución manual registrada.',
    );
  }
  protected toggleUser(user: AdminUser): void {
    const bloquear = !user.bloqueado;
    // El motivo viaja al backend y se incluye en el correo de bloqueo. Cancelar
    // el cuadro evita cambiar el estado por accidente.
    const motivo = bloquear
      ? window.prompt(`Motivo del bloqueo para ${user.nombre} ${user.apellido}. Sus publicaciones dejarán de estar disponibles y no admitirán contacto ni nuevas reservas. Las reservas anteriores, reclamos y liquidaciones se conservan y se gestionan por separado:`)
      : undefined;
    if (bloquear && motivo === null) return;
    this.run(
      `user-${user.id}`,
      () => this.api.cambiarBloqueo(user.id, bloquear, motivo ?? undefined),
      () =>
        this.users.update((v) =>
          v.map((u) => (u.id === user.id ? { ...u, bloqueado: bloquear } : u)),
        ),
      'Estado del usuario actualizado.',
    );
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
  private run(
    key: string,
    request: () => any,
    success: (value: unknown) => void,
    message: string,
    failure?: () => void,
  ): void {
    this.busy.set(key);
    this.error.set(null);
    this.notice.set(null);
    request().subscribe({
      next: (v: unknown) => {
        success(v);
        this.notice.set(message);
        this.busy.set(null);
      },
      error: (e: Error) => {
        failure?.();
        this.error.set(e.message);
        this.busy.set(null);
      },
    });
  }

  protected loadCatalogs(): void {
    const sections = this.catalogs();
    forkJoin(sections.map((s) => this.api.listarCatalogo(s.key))).subscribe({
      next: (values) => this.catalogs.set(sections.map((s, i) => ({ ...s, items: values[i] }))),
      error: (e: Error) => this.error.set(e.message),
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
      error: (e: Error) => this.error.set(e.message),
    });
  }
  protected selectProvince(id: number): void {
    this.selectedProvince.set(id);
    this.api.listarCiudades(id).subscribe({
      next: (v) => this.cities.set(v),
      error: (e: Error) => this.error.set(e.message),
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
