import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-paginador',
  standalone: true,
  templateUrl: './paginador.component.html',
  styleUrl: './paginador.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginadorComponent {
  readonly pagina = input.required<number>();
  readonly paginas = input.required<number>();
  readonly total = input<number | null>(null);
  readonly etiqueta = input('publicaciones');
  readonly ariaLabel = input('Paginación');
  readonly deshabilitado = input(false);
  readonly paginaCambia = output<number>();

  protected readonly paginasEfectivas = computed(() => Math.max(1, this.paginas()));
  protected readonly paginaEfectiva = computed(() => Math.min(Math.max(1, this.pagina()), this.paginasEfectivas()));

  protected ir(pagina: number): void {
    if (this.deshabilitado() || pagina < 1 || pagina > this.paginasEfectivas() || pagina === this.paginaEfectiva()) return;
    this.paginaCambia.emit(pagina);
  }
}
