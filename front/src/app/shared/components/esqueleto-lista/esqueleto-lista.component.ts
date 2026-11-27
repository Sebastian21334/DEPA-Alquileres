import { Component, input } from '@angular/core';
import { SpinnerComponent } from '../spinner/spinner.component';

/**
 * Indicador DEPA para las listas. Conserva el contrato del antiguo esqueleto
 * para que todas las pantallas compartan la misma animación de carga.
 *
 *   <app-esqueleto-lista etiqueta="Cargando reclamos…" />
 *   <app-esqueleto-lista [tarjetas]="true" [cantidad]="3" />
 */
@Component({
  selector: 'app-esqueleto-lista',
  standalone: true,
  imports: [SpinnerComponent],
  template: `
    <div class="esqueleto-lista" [class.esqueleto-lista--tarjetas]="tarjetas()" aria-busy="true">
      <app-spinner [label]="etiqueta()" />
      <p aria-hidden="true">{{ etiqueta() }}</p>
    </div>
  `,
  styles: `
    :host { display: block; }
    .esqueleto-lista { display: grid; justify-items: center; align-content: center; min-height: 8rem; padding: 1rem; text-align: center; color: var(--color-text-muted); }
    .esqueleto-lista--tarjetas { min-height: 12rem; }
    p { margin: .5rem 0 0; }
  `,
})
export class EsqueletoListaComponent {
  /** Se conserva por compatibilidad con las pantallas existentes. */
  readonly cantidad = input(3);
  /** Reserva espacio para la carga de listas de tarjetas. */
  readonly tarjetas = input(false);
  readonly etiqueta = input('Cargando…');
}
