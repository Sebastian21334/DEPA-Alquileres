import { Component, computed, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Modalidad } from '../../../../shared/models/catalogo.model';
import { LucideMapPin, LucideSearch } from '@lucide/angular';

// Hero de la Home: título + selector de modalidad de alquiler (mapea a la
// entidad Modalidad, se piden al backend en vez de hardcodear "Largo Plazo" /
// "Temporario" para no inventar valores que no vengan del catálogo real) +
// barra de búsqueda por ubicación (RN-22). El filtrado real ocurre en
// HomeComponent, escuchando los cambios del FormGroup que se recibe acá.
@Component({
  selector: 'app-hero-search',
  standalone: true,
  imports: [ReactiveFormsModule, LucideMapPin, LucideSearch],
  templateUrl: './hero-search.component.html',
  styleUrl: './hero-search.component.scss',
})
export class HeroSearchComponent {
  readonly form = input.required<FormGroup>();
  readonly modalidades = input<Modalidad[]>([]);

  protected readonly modalidadesOrdenadas = computed(() =>
    [...this.modalidades()].sort(
      (a, b) => Number(this.esTemporaria(a.nombre)) - Number(this.esTemporaria(b.nombre)),
    ),
  );

  protected esTemporaria(nombre: string): boolean {
    return nombre.toLowerCase().includes('tempor');
  }

  protected toggleModalidad(id: number): void {
    const control = this.form().controls['idModalidad'];
    // Un segundo click sobre la misma modalidad la deselecciona (vuelve a "todas").
    control.setValue(control.value === id ? null : id);
  }

  protected onSubmit(): void {
    // El filtrado es reactivo (valueChanges + debounce en HomeComponent); este
    // submit solo evita el reload de página al presionar Enter/el botón.
  }
}
