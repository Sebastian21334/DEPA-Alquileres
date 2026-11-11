import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import type { Reclamo, ReclamoEvidencia } from '../../services/reservation.service';

@Component({
  selector: 'app-claim-history',
  imports: [CurrencyPipe, DatePipe],
  template: `
    @let item = reclamo();
    <header>
      <div>
        <p class="meta">Reclamo #{{ item.id }} · Reserva #{{ item.reserva?.id ?? '—' }}</p>
        <h3>{{ item.reserva?.publicacion?.titulo || categorias[item.categoria] }}</h3>
      </div>
      <span class="status" [class.status--resolved]="item.resuelto_en || item.estado === 'CERRADO'">
        {{ estados[item.estado] }}
      </span>
    </header>
    <p class="meta">{{ categorias[item.categoria] }} · {{ item.creado_en | date:'dd/MM/yyyy, HH:mm' }}</p>
    <p class="body">{{ item.descripcion }}</p>
    @if (item.evidencias?.length) {
      <div class="attachments" aria-label="Imágenes adjuntas">
        @for (archivo of item.evidencias; track archivo.id) {
          <button type="button" (click)="verArchivo.emit(archivo)">{{ archivo.nombre_archivo }}</button>
        }
      </div>
    }
    <details>
      <summary>Historial de mensajes ({{ mensajes().length }})</summary>
      <ol>
        @for (mensaje of mensajes(); track mensaje.id) {
          <li>
            <strong>{{ mensaje.autor?.nombre || 'Usuario' }} {{ mensaje.autor?.apellido }}</strong>
            <span class="meta"> · {{ mensaje.creado_en | date:'dd/MM/yyyy, HH:mm' }}</span>
            @if (mensaje.visible_para === 'ADMIN') { <span class="meta"> · Nota interna</span> }
            <p class="body">{{ mensaje.texto }}</p>
          </li>
        } @empty {
          <li class="meta">Todavía no hay mensajes.</li>
        }
      </ol>
    </details>
    @if (item.resolucion) {
      <div class="resolution">
        <strong>{{ resoluciones[item.resolucion] }}</strong>
        @if (item.importe_reembolso) { · {{ item.importe_reembolso | currency:'ARS' }} }
        @if (item.resuelto_en) { <p class="meta">{{ item.resuelto_en | date:'dd/MM/yyyy, HH:mm' }}</p> }
      </div>
    }
  `,
  styles: `
    :host { display: grid; gap: .6rem; min-width: 0; }
    header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: .6rem; }
    h3, p { margin: 0; }
    h3 { font-size: 1.1rem; font-weight: 700; overflow-wrap: anywhere; }
    .meta { color: #526475; font-size: .84rem; }
    .status { background: #fff1d8; color: #74470a; padding: .25rem .65rem; border-radius: 1rem; font-size: .8rem; font-weight: 700; }
    .status--resolved, .resolution { background: #edf6f2; color: #205c46; }
    .body { white-space: pre-wrap; overflow-wrap: anywhere; }
    .attachments { display: flex; flex-wrap: wrap; gap: .45rem; }
    .attachments button { max-width: 100%; overflow-wrap: anywhere; padding: .4rem .65rem; border: 1px solid #d9e3ea; border-radius: .45rem; background: #fff; color: #204b66; cursor: pointer; }
    details, .resolution { padding: .75rem; border-radius: .6rem; }
    details { background: #f4f7fa; }
    summary { cursor: pointer; font-weight: 650; }
    ol { display: grid; gap: .5rem; list-style: none; padding: 0; margin: .6rem 0 0; }
    li { background: #fff; padding: .65rem; border-radius: .45rem; }
  `,
})
export class ClaimHistoryComponent {
  readonly reclamo = input.required<Reclamo>();
  readonly verArchivo = output<ReclamoEvidencia>();
  protected readonly mensajes = computed(() => [...(this.reclamo().mensajes ?? [])].sort((a, b) => a.id - b.id));
  protected readonly categorias = {
    LIMPIEZA: 'Limpieza', MANTENIMIENTO: 'Mantenimiento', INGRESO: 'Problemas de ingreso',
    DESCRIPCION: 'La propiedad no coincide', OTRO: 'Otro motivo',
  };
  protected readonly estados = {
    ABIERTO: 'Recibido', EN_REVISION: 'En revisión', RESUELTO_INQUILINO: 'Resuelto',
    RESUELTO_ANUNCIANTE: 'Resuelto', CERRADO: 'Cerrado',
  };
  protected readonly resoluciones = {
    SIN_DEVOLUCION: 'Cerrado sin devolución', DEVOLUCION_TOTAL: 'Devolución total',
    DEVOLUCION_PARCIAL: 'Devolución parcial',
  };
}
