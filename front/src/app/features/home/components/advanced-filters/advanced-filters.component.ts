import { Component, input, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TipoPropiedad } from '../../../../shared/models/catalogo.model';

// Filtros combinables (RN-22): tipo de propiedad, precio (min/max) y cantidad
// de ambientes. Colapsado por defecto, como el desplegable "Búsqueda avanzada"
// del prototipo. Comparte el mismo FormGroup que hero-search: cada control
// escribe directo sobre los controles del formulario padre.
@Component({
  selector: 'app-advanced-filters',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './advanced-filters.component.html',
  styleUrl: './advanced-filters.component.scss',
})
export class AdvancedFiltersComponent {
  readonly form = input.required<FormGroup>();
  readonly tiposPropiedad = input<TipoPropiedad[]>([]);

  protected readonly abierto = signal(false);

  protected toggle(): void {
    this.abierto.update((v) => !v);
  }

  protected limpiar(): void {
    this.form().patchValue({
      idTipoPropiedad: null,
      precioMin: null,
      precioMax: null,
      ambientes: null,
    });
  }
}
