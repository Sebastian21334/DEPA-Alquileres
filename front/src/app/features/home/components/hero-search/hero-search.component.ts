import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Modalidad } from '../../../../shared/models/catalogo.model';
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
      (a, b) => Number(this.esTemporaria(a.nombre)) - Number(this.esTemporaria(b.nombre)),
    ),
  );

  protected esTemporaria(nombre: string): boolean {
    return nombre.toLowerCase().includes('tempor');
  }

  protected categoriaDe(nombre: string): 'temporales' | 'largo-plazo' {
    return this.esTemporaria(nombre) ? 'temporales' : 'largo-plazo';
  }

  protected onSubmit(): void {
    const q = String(this.form().controls['busqueda']?.value ?? '').trim();
    this.router.navigate(['/publicaciones'], {
      queryParams: q ? { q } : undefined,
    });
  }
}
