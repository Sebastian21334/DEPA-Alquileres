import { Component, computed, input } from '@angular/core';
import { filasDesglose, type DesglosePago } from '../../utils/desglose-pago';

/** Debajo del neto transferido al anunciante, explica cómo se llega a él desde el ingreso bruto. Lo usan su historial y el del panel admin. */
@Component({
  selector: 'app-desglose-pago',
  template: `
    @if (filas().length) {
      <dl class="desglose" aria-label="Desglose del pago">
        @for (fila of filas(); track fila.etiqueta) {
          <div><dt>{{ fila.etiqueta }}</dt><dd>{{ fila.importe }}</dd></div>
        }
      </dl>
    }
  `,
  styles: `
    :host { display: block; }
    .desglose { display: grid; gap: .15rem; margin: .35rem 0 0; font-size: .85rem; font-weight: 400; }
    .desglose div { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0 .75rem; }
    .desglose dt { color: var(--color-text-muted); }
    .desglose dd { margin: 0; font-variant-numeric: tabular-nums; }
  `,
})
export class DesglosePagoComponent {
  readonly desglose = input.required<DesglosePago>();
  readonly moneda = input<string | null>(null);
  protected readonly filas = computed(() => filasDesglose(this.desglose(), this.moneda()));
}
