import { Component, DestroyRef, Injector, effect, inject, input, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { LucideCheck, LucideX } from '@lucide/angular';
import { finalize, type Observable } from 'rxjs';
import { ToastService } from '../../core/services/toast.service';
import { EsqueletoListaComponent } from '../../shared/components/esqueleto-lista/esqueleto-lista.component';
import { FiltrosListaComponent } from '../../shared/components/filtros-lista/filtros-lista.component';
import { PaginadorComponent } from '../../shared/components/paginador/paginador.component';
import { llevarALaVista } from '../../shared/utils/desplazamiento';
import { ListaFiltrable } from '../../shared/utils/lista-filtrable';
import { FILTROS_VERIFICACION, textosVerificacion } from './admin-listas';
import { AdminService, type VerificationRequest } from './admin.service';
import type { EnfoqueSeccionAdmin } from './admin-secciones';
import { ConsultaSeccionAdmin } from './consulta-seccion-admin';

@Component({
  selector: 'app-verificaciones-admin',
  standalone: true,
  imports: [FormsModule, LucideCheck, LucideX, EsqueletoListaComponent, FiltrosListaComponent, PaginadorComponent],
  templateUrl: './verificaciones-admin.component.html',
  styleUrl: './verificaciones-admin.component.scss',
})
export class VerificacionesAdminComponent {
  readonly activa = input.required<boolean>();
  readonly enfoque = input<EnfoqueSeccionAdmin | null>(null);
  private readonly api = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly consulta = new ConsultaSeccionAdmin<VerificationRequest[]>([]);
  protected readonly requests = this.consulta.datos;
  readonly cargando = this.consulta.cargando;
  protected readonly errorCarga = this.consulta.error;
  protected readonly listaVerificaciones = new ListaFiltrable(this.requests, { porPagina: 10, textos: textosVerificacion, filtros: FILTROS_VERIFICACION });
  protected readonly busy = signal<string | null>(null);
  protected readonly rejectId = signal<number | null>(null);
  protected rejectReason = '';
  protected rechazarIdentidad = false;
  protected rechazarCbu = false;
  protected titularCbuConfirmado: number | null = null;
  private ultimoEnfoque: EnfoqueSeccionAdmin | null = null;

  constructor() {
    effect(() => {
      if (this.activa()) untracked(() => this.cargar());
    });
    effect(() => {
      const enfoque = this.enfoque();
      if (!this.activa() || this.cargando() || this.errorCarga() || !enfoque || enfoque === this.ultimoEnfoque) return;
      this.ultimoEnfoque = enfoque;
      untracked(() => {
        if (enfoque.tipo === 'pendientes') this.listaVerificaciones.limpiar();
        if (enfoque.tipo === 'caso') {
          this.listaVerificaciones.mostrar((item) => item.id === enfoque.id);
          llevarALaVista('admin-verificaciones-' + enfoque.id, this.injector);
        }
      });
    });
  }

  cargar(): void {
    this.consulta.cargar(this.api.listarPendientes());
  }

  private run(key: string, request: () => Observable<unknown>, success: () => void, message: string): void {
    if (this.busy()) return;
    this.busy.set(key);
    request().pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.busy.set(null))).subscribe({
      next: () => {
        success();
        this.toast.mostrar(message, 'exito');
      },
      error: (error: Error) => this.toast.mostrar(error.message, 'error'),
    });
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
}
