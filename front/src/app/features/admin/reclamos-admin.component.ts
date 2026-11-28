import { Component, DestroyRef, Injector, effect, inject, input, output, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { finalize, type Observable } from 'rxjs';
import { ToastService } from '../../core/services/toast.service';
import { ClaimHistoryComponent } from '../../shared/components/claim-history/claim-history.component';
import { ConversationComposerComponent } from '../../shared/components/conversation-panel/conversation-composer.component';
import { EsqueletoListaComponent } from '../../shared/components/esqueleto-lista/esqueleto-lista.component';
import { FiltrosListaComponent } from '../../shared/components/filtros-lista/filtros-lista.component';
import { PaginadorComponent } from '../../shared/components/paginador/paginador.component';
import type { Reclamo } from '../../shared/services/reservation.service';
import { llevarALaVista } from '../../shared/utils/desplazamiento';
import { formatearMoneda } from '../../shared/utils/formato-numero';
import { ListaFiltrable } from '../../shared/utils/lista-filtrable';
import { imagenesDisponibles } from '../../shared/utils/reclamo-imagenes';
import { reclamoDeLaReserva } from '../../shared/utils/reclamo-rol';
import { AdminService } from './admin.service';
import { FILTROS_RECLAMO, textosReclamo } from './admin-listas';
import type { EnfoqueSeccionAdmin } from './admin-secciones';
import { ConsultaSeccionAdmin } from './consulta-seccion-admin';

@Component({
  selector: 'app-reclamos-admin',
  standalone: true,
  imports: [FormsModule, ClaimHistoryComponent, ConversationComposerComponent, EsqueletoListaComponent, FiltrosListaComponent, PaginadorComponent],
  templateUrl: './reclamos-admin.component.html',
  styleUrl: './reclamos-admin.component.scss',
})
export class ReclamosAdminComponent {
  readonly activa = input.required<boolean>();
  readonly enfoque = input<EnfoqueSeccionAdmin | null>(null);
  readonly verReembolso = output<number>();
  private readonly api = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly consulta = new ConsultaSeccionAdmin<Reclamo[]>([]);
  protected readonly claims = this.consulta.datos;
  readonly cargando = this.consulta.cargando;
  protected readonly errorReclamos = this.consulta.error;
  protected readonly listaReclamos = new ListaFiltrable(this.claims, { porPagina: 5, textos: textosReclamo, filtros: FILTROS_RECLAMO });
  protected readonly reclamoDestacado = signal<number | null>(null);
  protected readonly gestionReclamo = signal<{ id: number; accion: 'mensaje' | 'resolver' } | null>(null);
  protected readonly imagenesReclamo = signal<File[]>([]);
  protected readonly imagenesDisponibles = imagenesDisponibles;
  protected readonly maxReclamosAdmin = 200;
  protected readonly busy = signal<string | null>(null);
  protected textoReclamo = '';
  protected resolucionReclamo: NonNullable<Reclamo['resolucion']> = 'SIN_DEVOLUCION';
  protected importeReclamo: number | null = null;
  protected observacionReclamo = '';
  private ultimoEnfoque: EnfoqueSeccionAdmin | null = null;

  constructor() {
    effect(() => {
      if (this.activa()) untracked(() => this.cargar());
    });
    effect(() => {
      const enfoque = this.enfoque();
      if (!this.activa() || this.cargando() || this.errorReclamos() || !enfoque || enfoque === this.ultimoEnfoque) return;
      this.ultimoEnfoque = enfoque;
      untracked(() => this.mostrarEnfoque(enfoque));
    });
  }

  cargar(): void {
    this.consulta.cargar(this.api.listarReclamos());
  }

  private mostrarEnfoque(enfoque: EnfoqueSeccionAdmin): void {
    if (enfoque.tipo === 'pendientes') {
      this.listaReclamos.limpiar();
      this.listaReclamos.filtrar('estado', 'abiertos');
    }
    const id = enfoque.tipo === 'reserva' ? reclamoDeLaReserva(this.claims(), enfoque.id)?.id
      : enfoque.tipo === 'caso' ? enfoque.id : undefined;
    if (id === undefined) return;
    this.listaReclamos.mostrar((item) => item.id === id);
    if (enfoque.tipo === 'reserva') this.reclamoDestacado.set(id);
    llevarALaVista('admin-reclamos-' + id, this.injector);
  }

  private run<T>(key: string, request: () => Observable<T>, success: (value: T) => void, message: string | null): void {
    if (this.busy()) return;
    this.busy.set(key);
    request().pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.busy.set(null))).subscribe({
      next: (value) => {
        success(value);
        if (message) this.toast.mostrar(message, 'exito');
      },
      error: (error: Error) => this.toast.mostrar(error.message, 'error'),
    });
  }

  protected abrirGestionReclamo(id: number, accion: 'mensaje' | 'resolver'): void {
    if (this.busy()) return;
    this.textoReclamo = '';
    this.imagenesReclamo.set([]);
    const reclamo = this.claims().find(item => item.id === id);
    const pedidoDeCodigo = reclamo?.categoria === 'CODIGO_BLOQUEADO';
    this.resolucionReclamo = !pedidoDeCodigo ? 'SIN_DEVOLUCION'
      : reclamo?.reserva?.estado_estadia === 'PENDIENTE_INGRESO' ? 'REINICIAR_CODIGO' : 'CONFIRMAR_INGRESO';
    this.importeReclamo = null;
    this.observacionReclamo = '';
    this.gestionReclamo.set({ id, accion });
  }

  /** El mensaje puede llevar imágenes; con imágenes, el texto es opcional. */
  protected responderReclamo(reclamo: Reclamo): void {
    const texto = this.textoReclamo.trim();
    const imagenes = this.imagenesReclamo();
    if ((!texto && !imagenes.length) || texto.length > 1000 || this.busy()) return;
    this.run(
      `claim-${reclamo.id}`,
      () => this.api.responderReclamo(reclamo.id, texto, imagenes),
      (mensaje) => {
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
      (resuelto) => {
        this.claims.update((items) => items.map((item) => item.id === reclamo.id ? { ...item, ...resuelto, reserva: item.reserva } : item));
        this.gestionReclamo.set(null);
        this.toast.mostrar(this.avisoResolucion(reclamo, resuelto), 'exito');
        this.cargar();
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

  protected verReembolsoReclamo(reclamo: Reclamo): void {
    this.verReembolso.emit(reclamo.id);
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
    return formatearMoneda(importe, reclamo.devolucion_cancelacion?.moneda || reclamo.reserva?.moneda_contratada);
  }
}
