import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Modalidad, admiteReservasPorFecha } from '../../../../shared/models/catalogo.model';
import { LucideSearch } from '@lucide/angular';

// Hero de la Home: título + selector de modalidad de alquiler (mapea a la
// entidad Modalidad, se piden al backend en vez de hardcodear "Largo Plazo" /
// "Temporario" para no inventar valores que no vengan del catálogo real) +
// barra de búsqueda libre sobre los datos públicos de las publicaciones.
@Component({
  selector: 'app-hero-search',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideSearch],
  templateUrl: './hero-search.component.html',
  styleUrl: './hero-search.component.scss',
})
export class HeroSearchComponent {
  private readonly router = inject(Router);
  readonly form = input.required<FormGroup>();
  readonly modalidades = input<Modalidad[]>([]);

  protected readonly modalidadesOrdenadas = computed(() =>
    [...this.modalidades()].sort(
      (a, b) => Number(admiteReservasPorFecha(a)) - Number(admiteReservasPorFecha(b)),
    ),
  );

  protected readonly esTemporaria = admiteReservasPorFecha;

  protected categoriaDe(modalidad: Modalidad): 'temporales' | 'largo-plazo' {
    return admiteReservasPorFecha(modalidad) ? 'temporales' : 'largo-plazo';
  }

  protected onSubmit(): void {
    const q = String(this.form().controls['busqueda']?.value ?? '').trim();
    this.router.navigate(['/publicaciones'], {
      queryParams: q ? { q } : undefined,
    });
  }
}
