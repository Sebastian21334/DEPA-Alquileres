import { ChangeDetectionStrategy, Component, input, type Signal } from '@angular/core';
import { SearchFieldComponent } from '../search-field/search-field.component';

/** Lo que necesita la barra de una ListaFiltrable, sin depender del tipo de sus ítems. */
export interface ControlesLista {
  readonly busqueda: Signal<string>;
  readonly filtros: readonly { nombre: string; etiqueta: string; opciones: readonly { valor: string; etiqueta: string }[] }[];
  valor(nombre: string): string;
  buscar(texto: string): void;
  filtrar(nombre: string, valor: string): void;
}

/** Buscador y filtros de una lista del panel admin. El contenido extra (por ejemplo, fechas) va al final. */
@Component({
  selector: 'app-filtros-lista',
  standalone: true,
  imports: [SearchFieldComponent],
  templateUrl: './filtros-lista.component.html',
  styleUrl: './filtros-lista.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltrosListaComponent {
  readonly lista = input.required<ControlesLista>();
  readonly placeholder = input('');
  readonly etiqueta = input('Buscar');

  protected cambiar(nombre: string, evento: Event): void {
    this.lista().filtrar(nombre, (evento.target as HTMLSelectElement).value);
  }
}
