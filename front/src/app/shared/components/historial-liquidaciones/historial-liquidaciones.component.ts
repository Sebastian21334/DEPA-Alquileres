import { Component, computed, input, signal } from '@angular/core';
import type { PagoPublicacion } from '../../services/gestion-publicaciones.service';

/**
 * Lista de pagos registrados al anunciante (T55). La usan Mis publicaciones,
 * por publicación, y el panel del anunciante, con todas sus publicaciones.
 */
@Component({
  selector: 'app-historial-liquidaciones',
  template: `
    @if (pagos().length) {
      <ul class="liquidaciones-lista">
        @for (pago of visibles(); track pago.id) {
          <li>
            <header>
              <strong>{{ importe(pago) }}</strong>
              <span class="acct-badge acct-badge--ok">Pago registrado</span>
            </header>
            @if (mostrarPublicacion() && pago.publicacion) {
              <p class="liquidacion-publicacion">{{ pago.publicacion }}</p>
            }
            <p>Reserva #{{ pago.reservaId }} @if (pago.fecha) { · {{ fecha(pago.fecha) }} }</p>
            @if (pago.referencia) {
              <p><strong>Referencia o número de comprobante:</strong> {{ pago.referencia }}</p>
            }
            @if (pago.observacion) {
              <p class="liquidacion-observacion"><strong>Observación del pago:</strong> {{ pago.observacion }}</p>
            }
          </li>
        }
      </ul>
      @if (ocultos() > 0 || verTodos()) {
        <button type="button" class="acct-btn acct-btn--ghost acct-btn--sm" (click)="verTodos.set(!verTodos())"
          [attr.aria-expanded]="verTodos()">
          {{ verTodos() ? 'Ver menos' : 'Ver todos (' + pagos().length + ')' }}
        </button>
      }
    } @else {
      <p role="status">{{ vacio() }}</p>
    }
  `,
  styles: `
    :host { display: grid; gap: .75rem; justify-items: start; }
    .liquidaciones-lista { display: grid; gap: .6rem; width: 100%; padding: 0; margin: 0; list-style: none; }
    .liquidaciones-lista li {
      padding: .75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      overflow-wrap: anywhere;
    }
    .liquidaciones-lista header { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
    .liquidaciones-lista p, :host > p { margin: .35rem 0 0; font-size: .9rem; }
    .liquidacion-publicacion { font-weight: 700; }
    .liquidacion-observacion { white-space: pre-wrap; }
  `,
})
export class HistorialLiquidacionesComponent {
  /** Pagos ordenados del más reciente al más antiguo, como los devuelve el back. */
  readonly pagos = input.required<PagoPublicacion[]>();
  readonly mostrarPublicacion = input(false);
  /** Cantidad visible antes de «Ver todos»; sin límite muestra todos. */
  readonly limite = input<number | null>(null);
  readonly vacio = input('Todavía no hay pagos registrados.');

  protected readonly verTodos = signal(false);
  protected readonly visibles = computed(() => {
    const limite = this.limite();
    return limite === null || this.verTodos() ? this.pagos() : this.pagos().slice(0, limite);
  });
  protected readonly ocultos = computed(() => this.pagos().length - this.visibles().length);

  protected importe(pago: PagoPublicacion): string {
    if (pago.importe === null) return 'Importe sin registrar';
    const importe = pago.importe.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return [pago.moneda, importe].filter(Boolean).join(' ');
  }

  protected fecha(valor: string): string {
    return new Date(valor).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
  }
}
