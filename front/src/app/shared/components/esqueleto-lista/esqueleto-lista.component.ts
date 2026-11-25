import { Component, computed, input } from '@angular/core';

/**
 * Lugar reservado con brillo mientras carga una lista. Reemplaza al texto
 * «Cargando…»: el lector de pantalla sigue anunciando la etiqueta.
 *
 *   <app-esqueleto-lista etiqueta="Cargando reclamos…" />
 *   <app-esqueleto-lista [tarjetas]="true" [cantidad]="3" />
 */
@Component({
  selector: 'app-esqueleto-lista',
  standalone: true,
  template: `
    <div class="esqueleto-lista" role="status">
      <span class="sr-only">{{ etiqueta() }}</span>
      @for (fila of filas(); track $index) {
        <span class="esqueleto" [class.esqueleto-lista__tarjeta]="tarjetas()" [class.esqueleto-lista__fila]="!tarjetas()" aria-hidden="true"></span>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .esqueleto-lista { display: grid; gap: .75rem; padding: 1rem; }
    .esqueleto-lista__fila { display: block; height: 1.15rem; }
    .esqueleto-lista__fila:nth-child(3n + 2) { width: 88%; }
    .esqueleto-lista__fila:nth-child(3n + 3) { width: 70%; }
    .esqueleto-lista__tarjeta { display: block; height: 7.5rem; border-radius: var(--radius-md); }
  `,
})
export class EsqueletoListaComponent {
  /** Cantidad de filas o tarjetas de ejemplo. */
  readonly cantidad = input(3);
  /** Tarjetas altas (listas de tarjetas) en lugar de filas de texto. */
  readonly tarjetas = input(false);
  readonly etiqueta = input('Cargando…');
  protected readonly filas = computed(() => Array.from({ length: this.cantidad() }));
}
