import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, input, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LucideCalendarDays, LucideClock3 } from '@lucide/angular';
import { finalize, Subscription } from 'rxjs';
import { DesglosePagoComponent } from '../../shared/components/desglose-pago/desglose-pago.component';
import { FiltrosListaComponent } from '../../shared/components/filtros-lista/filtros-lista.component';
import { PaginadorComponent } from '../../shared/components/paginador/paginador.component';
import { VerComprobanteComponent } from '../../shared/components/ver-comprobante/ver-comprobante.component';
import { formatearImporteConMoneda } from '../../shared/utils/formato-numero';
import { ListaFiltrable } from '../../shared/utils/lista-filtrable';
import { fechaArgentina } from '../../shared/utils/rental-dates';
import { textosPagoLiquidacion } from './admin-listas';
import { AdminPagoLiquidacion, AdminService } from './admin.service';

/** Pagos ya registrados a anunciantes. Se consulta cada vez que se abre la sección. */
@Component({
  selector: 'app-historial-liquidaciones-admin',
  standalone: true,
  imports: [DatePipe, RouterLink, FiltrosListaComponent, PaginadorComponent, DesglosePagoComponent, VerComprobanteComponent, LucideCalendarDays, LucideClock3],
  templateUrl: './historial-liquidaciones-admin.component.html',
  styleUrl: './historial-liquidaciones-admin.component.scss',
})
export class HistorialLiquidacionesAdminComponent {
  private readonly api = inject(AdminService);
  private readonly destroyRef = inject(DestroyRef);
  /** Si la sección está a la vista: se abre desde el menú o directamente con `/admin#historial-liquidaciones`. */
  readonly activa = input(false);
  protected readonly pagos = signal<AdminPagoLiquidacion[]>([]);
  readonly cargando = signal(false);
  protected readonly error = signal('');
  private consulta?: Subscription;
  /** Además de la búsqueda, se filtra por el día (en Argentina) en que se registró el pago. */
  protected readonly desde = signal('');
  protected readonly hasta = signal('');
  private readonly enRango = computed(() => {
    const desde = this.desde(), hasta = this.hasta();
    if (!desde && !hasta) return this.pagos();
    return this.pagos().filter(({ fecha }) => {
      const dia = fecha ? fechaArgentina(fecha) : null;
      return !!dia && (!desde || dia >= desde) && (!hasta || dia <= hasta);
    });
  });
  protected readonly lista = new ListaFiltrable(this.enRango, { porPagina: 10, textos: textosPagoLiquidacion });
  protected readonly importeConMoneda = formatearImporteConMoneda;
  protected readonly urlComprobante = (pago: AdminPagoLiquidacion) => () => this.api.urlComprobantePago(pago.reservaId, pago.indice);

  constructor() {
    effect(() => {
      if (this.activa()) untracked(() => this.cargar());
    });
  }

  cargar(): void {
    this.consulta?.unsubscribe();
    this.cargando.set(true);
    this.error.set('');
    this.consulta = this.api.listarHistorialLiquidaciones().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.cargando.set(false)),
    ).subscribe({
      next: (pagos) => this.pagos.set(pagos),
      error: (error: Error) => this.error.set(error.message),
    });
  }

  protected filtrar(campo: 'desde' | 'hasta', valor: string): void {
    (campo === 'desde' ? this.desde : this.hasta).set(valor);
    this.lista.irAPagina(1);
  }

  protected limpiar(): void {
    this.desde.set('');
    this.hasta.set('');
    this.lista.limpiar();
  }
}
