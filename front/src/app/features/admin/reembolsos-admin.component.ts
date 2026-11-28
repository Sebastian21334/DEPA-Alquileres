import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, ElementRef, Injector, afterNextRender, computed, effect, inject, input, signal, untracked, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideReceiptText, LucideX } from '@lucide/angular';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { ToastService } from '../../core/services/toast.service';
import { CargaComprobanteComponent } from '../../shared/components/carga-comprobante/carga-comprobante.component';
import { DatoCopiableComponent } from '../../shared/components/dato-copiable/dato-copiable.component';
import { EsqueletoListaComponent } from '../../shared/components/esqueleto-lista/esqueleto-lista.component';
import { FiltrosListaComponent } from '../../shared/components/filtros-lista/filtros-lista.component';
import { PaginadorComponent } from '../../shared/components/paginador/paginador.component';
import { ReembolsoChatComponent } from '../../shared/components/reembolso-chat/reembolso-chat.component';
import { VerComprobanteComponent } from '../../shared/components/ver-comprobante/ver-comprobante.component';
import { ReembolsosService } from '../../shared/services/reembolsos.service';
import { llevarALaVista } from '../../shared/utils/desplazamiento';
import { importeParaCopiar } from '../../shared/utils/formato-numero';
import { ListaFiltrable } from '../../shared/utils/lista-filtrable';
import { ESTADOS_REEMBOLSO, FILTROS_REEMBOLSO, ORIGENES_REEMBOLSO, ordenarReembolsos, reembolsoPendiente, textosReembolso } from './admin-listas';
import { AdminService, type AdminReembolso, type AdminResumenReembolsos } from './admin.service';
import type { EnfoqueSeccionAdmin } from './admin-secciones';
import { ConsultaSeccionAdmin } from './consulta-seccion-admin';

@Component({
  selector: 'app-reembolsos-admin',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, RouterLink, LucideReceiptText, LucideX, CargaComprobanteComponent, DatoCopiableComponent, EsqueletoListaComponent, FiltrosListaComponent, PaginadorComponent, ReembolsoChatComponent, VerComprobanteComponent],
  templateUrl: './reembolsos-admin.component.html',
  styleUrl: './reembolsos-admin.component.scss',
})
export class ReembolsosAdminComponent {
  readonly activa = input.required<boolean>();
  readonly enfoque = input<EnfoqueSeccionAdmin | null>(null);
  private readonly api = inject(AdminService);
  private readonly reembolsos = inject(ReembolsosService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly consulta = new ConsultaSeccionAdmin<{ items: AdminReembolso[]; resumen: AdminResumenReembolsos | null }>({ items: [], resumen: null });
  private readonly dialogoReembolso = viewChild.required<ElementRef<HTMLDialogElement>>('dialogoReembolso');
  protected readonly refunds = computed(() => this.consulta.datos().items);
  readonly cargando = this.consulta.cargando;
  protected readonly errorCarga = this.consulta.error;
  private readonly orderedRefunds = computed(() => ordenarReembolsos(this.refunds()));
  protected readonly listaReembolsos = new ListaFiltrable(this.orderedRefunds, { porPagina: 10, textos: textosReembolso, filtros: FILTROS_REEMBOLSO });
  protected readonly estadosReembolso = ESTADOS_REEMBOLSO;
  protected readonly importeParaCopiar = importeParaCopiar;
  protected readonly origenesReembolso = ORIGENES_REEMBOLSO;
  protected readonly conteoPendientes = computed(() => this.consulta.datos().resumen?.pendientes ?? this.refunds().filter(reembolsoPendiente).length);
  protected readonly conteoFallidos = computed(() => this.consulta.datos().resumen?.fallidos ?? this.refunds().filter(({ estado }) => estado === 'FALLIDO').length);
  protected readonly totalReembolsos = computed(() => this.consulta.datos().resumen?.total ?? this.refunds().length);
  protected readonly reembolsoSeleccionado = signal<AdminReembolso | null>(null);
  protected readonly guardandoReembolso = signal(false);
  protected readonly errorReembolso = signal('');
  protected referenciaReembolso = '';
  private ultimoEnfoque: EnfoqueSeccionAdmin | null = null;

  constructor() {
    effect(() => {
      if (this.activa()) untracked(() => this.cargar());
    });
    effect(() => {
      const enfoque = this.enfoque();
      if (!this.activa() || this.cargando() || this.errorCarga() || !enfoque || enfoque === this.ultimoEnfoque) return;
      this.ultimoEnfoque = enfoque;
      untracked(() => this.mostrarEnfoque(enfoque));
    });
  }

  cargar(): void {
    this.consulta.cargar(forkJoin({
      items: this.api.listarReembolsos(),
      resumen: this.api.resumenReembolsos().pipe(catchError(() => of(null))),
    }));
  }

  private mostrarEnfoque(enfoque: EnfoqueSeccionAdmin): void {
    if (enfoque.tipo === 'pendientes') {
      this.listaReembolsos.limpiar();
      this.listaReembolsos.filtrar('estado', 'pendientes');
    }
    const reembolso = enfoque.tipo === 'caso' ? this.refunds().find(({ id }) => id === enfoque.id)
      : enfoque.tipo === 'reclamo' ? this.refunds().find(({ origen, referencia_interna }) =>
          origen === 'RECLAMO' && referencia_interna === 'rec:' + enfoque.id)
        : undefined;
    if (!reembolso) return;
    this.listaReembolsos.mostrar(({ id }) => id === reembolso.id);
    llevarALaVista('admin-reembolsos-' + reembolso.id, this.injector);
    afterNextRender(() => {
      if (this.activa() && this.enfoque() === enfoque) this.abrirReembolso(reembolso);
    }, { injector: this.injector });
  }

  /** Comprobante elegido para registrar la transferencia del reembolso. */
  protected readonly comprobanteReembolso = signal<File | null>(null);
  protected observacionReembolso = '';
  protected readonly urlComprobanteReembolso = (id: number) => () => this.reembolsos.comprobante(id);

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
    return !reembolso.referencia_interna?.startsWith('auto-can:') &&
      !reembolso.transferencia_manual && reembolso.estado === 'PENDIENTE' && !!reembolso.pago?.payment_id;
  }

  protected puedeConciliarReembolso(reembolso: AdminReembolso): boolean {
    return !reembolso.transferencia_manual && !!reembolso.pago?.payment_id && (reembolso.estado === 'FALLIDO' || reembolso.estado === 'EN_PROCESO');
  }

  protected puedeHabilitarTransferencia(reembolso: AdminReembolso): boolean {
    return reembolso.estado === 'FALLIDO' && !reembolso.transferencia_manual && reembolso.origen !== 'CONTRACARGO';
  }

  protected habilitarTransferenciaReembolso(reembolso: AdminReembolso): void {
    if (!this.puedeHabilitarTransferencia(reembolso) || this.guardandoReembolso()) return;
    this.errorReembolso.set('');
    this.guardandoReembolso.set(true);
    this.api.habilitarTransferenciaReembolso(reembolso.id)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.guardandoReembolso.set(false)))
      .subscribe({
        next: (actualizado) => {
          this.reembolsoSeleccionado.set(actualizado);
          this.referenciaReembolso = '';
          this.toast.mostrar('Transferencia habilitada. Coordiná la devolución desde el chat.', 'exito');
          this.cargar();
        },
        error: (error: Error) => this.errorReembolso.set(error.message),
      });
  }

  protected puedeRegistrarTransferencia(reembolso: AdminReembolso): boolean {
    return !!reembolso.transferencia_manual && reembolso.estado === 'PENDIENTE';
  }

  protected referenciaReembolsoValida(reembolso: AdminReembolso): boolean {
    const referencia = this.referenciaReembolso.trim();
    // El comprobante es obligatorio; la referencia y la observación, opcionales.
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
            this.cargar();
            return;
          }
          this.dialogoReembolso().nativeElement.close();
          this.toast.mostrar('Reembolso confirmado y aplicado a la reserva.', 'exito');
          this.cargar();
        },
        error: (e: Error) => {
          this.errorReembolso.set(e.message);
          this.api.listarReembolsos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (items) => {
              this.consulta.datos.update((datos) => ({ ...datos, items }));
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
}
