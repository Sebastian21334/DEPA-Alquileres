import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  LucideArrowLeftRight,
  LucideChevronDown,
  LucideCoins,
  LucideDoorOpen,
  LucideHouse,
} from '@lucide/angular';
import { SelectorUbicacionComponent } from '../../../../shared/components/selector-ubicacion/selector-ubicacion.component';
import { TipoPropiedad } from '../../../../shared/models/catalogo.model';

@Component({
  selector: 'app-advanced-filters',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SelectorUbicacionComponent,
    LucideHouse,
    LucideCoins,
    LucideDoorOpen,
    LucideArrowLeftRight,
    LucideChevronDown,
  ],
  templateUrl: './advanced-filters.component.html',
  styleUrl: './advanced-filters.component.scss',
})
export class AdvancedFiltersComponent {
  readonly form = input.required<FormGroup>();
  readonly tiposPropiedad = input<TipoPropiedad[]>([]);
  readonly categoria = input<string | null>(null);
  protected readonly ambientes = ['1', '2', '3', '4+'] as const;

  protected seleccionarProvincia(id: number | null): void {
    this.form().patchValue({ idProvincia: id, idsCiudad: [] });
  }

  protected seleccionarCiudad(id: number | null): void {
    this.form().controls['idsCiudad'].setValue(id == null ? [] : [id]);
  }

  protected seleccionarTipoPropiedad(valor: string): void {
    this.form().controls['idsTipoPropiedad'].setValue(valor ? [Number(valor)] : []);
  }

  protected seleccionarAmbientes(valor: string): void {
    this.form().controls['ambientesSeleccionados'].setValue(valor ? [valor] : []);
  }
}
