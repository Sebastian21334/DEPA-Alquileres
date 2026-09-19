import { Component, inject, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { HeroSearchComponent } from './components/hero-search/hero-search.component';
import { ListingCardComponent } from '../../shared/components/listing-card/listing-card.component';
import { CatalogoService } from '../../shared/services/catalogo.service';
import { Modalidad } from '../../shared/models/catalogo.model';
import { Publicacion } from '../../shared/models/publicacion.model';
import { ListingService } from './listing.service';

interface SeccionInicio { titulo: string; categoria?: string; publicaciones: Publicacion[]; }

@Component({ selector: 'app-home', standalone: true, imports: [RouterLink, HeroSearchComponent, ListingCardComponent], templateUrl: './home.component.html', styleUrl: './home.component.scss' })
export class HomeComponent {
  private readonly listingService = inject(ListingService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly fb = inject(FormBuilder);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly secciones = signal<SeccionInicio[]>([]);
  protected readonly modalidades = signal<Modalidad[]>([]);
  protected readonly form = this.fb.nonNullable.group({
    busqueda: '',
  });

  constructor() {
    this.catalogoService.getModalidades().subscribe({
      next: (modalidades) => this.modalidades.set(modalidades),
      error: (error) => console.error('No se pudieron cargar las modalidades', error),
    });

    // Cada petición está limitada a cuatro registros: el inicio nunca descarga el catálogo completo.
    forkJoin({
      recientes: this.listingService.getActivas({ limite: 4, categoria: 'recientes' }),
      temporales: this.listingService.getActivas({ limite: 4, categoria: 'temporales' }),
      largoPlazo: this.listingService.getActivas({ limite: 4, categoria: 'largo-plazo' }),
      villaMaria: this.listingService.getActivas({ limite: 4, categoria: 'villa-maria' }),
      reservadas: this.listingService.getActivas({ limite: 4, categoria: 'reservadas' }),
    }).subscribe({
      next: (r) => {
        this.secciones.set([
          { titulo: 'Recién publicadas', publicaciones: r.recientes.datos },
          { titulo: 'Alquileres temporales', categoria: 'temporales', publicaciones: r.temporales.datos },
          { titulo: 'Para quedarte más tiempo', categoria: 'largo-plazo', publicaciones: r.largoPlazo.datos },
          { titulo: 'Alquileres en Villa María', categoria: 'villa-maria', publicaciones: r.villaMaria.datos },
          { titulo: 'Las más reservadas', categoria: 'reservadas', publicaciones: r.reservadas.datos },
        ].filter((seccion) => seccion.publicaciones.length));
        this.cargando.set(false);
      },
      error: (err: Error) => { this.error.set(err.message); this.cargando.set(false); },
    });
  }
}
