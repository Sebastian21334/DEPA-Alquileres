import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { debounceTime } from 'rxjs';

import { HeroSearchComponent } from './components/hero-search/hero-search.component';
import { AdvancedFiltersComponent } from './components/advanced-filters/advanced-filters.component';
import { ListingGridComponent } from './components/listing-grid/listing-grid.component';
import { ListingService } from './listing.service';
import { CatalogoService } from '../../shared/services/catalogo.service';
import { Publicacion } from '../../shared/models/publicacion.model';
import { Modalidad, TipoPropiedad } from '../../shared/models/catalogo.model';

// Filtros combinables de búsqueda (RN-22). No es una entidad del DER: es el
// contrato interno del formulario de esta página.
interface FiltrosPublicacion {
  ubicacion: string;
  idModalidad: number | null;
  idTipoPropiedad: number | null;
  precioMin: number | null;
  precioMax: number | null;
  ambientes: number | null;
}

const TAMANIO_PAGINA = 9;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroSearchComponent, AdvancedFiltersComponent, ListingGridComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly listingService = inject(ListingService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  // --- Formulario de búsqueda/filtros, compartido por hero-search y advanced-filters ---
  protected readonly form = this.fb.nonNullable.group({
    ubicacion: '',
    idModalidad: null as number | null,
    idTipoPropiedad: null as number | null,
    precioMin: null as number | null,
    precioMax: null as number | null,
    ambientes: null as number | null,
  });

  // --- Estado de datos (signals, sin NgRx) ---
  private readonly publicaciones = signal<Publicacion[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly tiposPropiedad = signal<TipoPropiedad[]>([]);
  protected readonly modalidades = signal<Modalidad[]>([]);

  private readonly filtros = signal<FiltrosPublicacion>(this.form.getRawValue());
  private readonly visibleCount = signal(TAMANIO_PAGINA);

  // Lista completa filtrada (client-side, ver listing.service.ts) y la página visible.
  protected readonly filtradas = computed(() => this.aplicarFiltros(this.publicaciones(), this.filtros()));
  protected readonly paginadas = computed(() => this.filtradas().slice(0, this.visibleCount()));
  protected readonly hayMas = computed(() => this.visibleCount() < this.filtradas().length);

  constructor() {
    this.cargarPublicaciones();
    this.cargarCatalogos();

    // RNF8: se debounca la entrada de búsqueda para no refiltrar en cada tecla.
    this.form.valueChanges.pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef)).subscribe((valores) => {
      this.filtros.set(valores as FiltrosPublicacion);
      this.visibleCount.set(TAMANIO_PAGINA); // nueva búsqueda: vuelve a la primera "página"
    });
  }

  protected cargarMas(): void {
    this.visibleCount.update((v) => v + TAMANIO_PAGINA);
  }

  private cargarPublicaciones(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.listingService.getActivas().subscribe({
      next: (data) => {
        this.publicaciones.set(data);
        this.cargando.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.cargando.set(false);
      },
    });
  }

  private cargarCatalogos(): void {
    this.catalogoService.getModalidades().subscribe({
      next: (data) => this.modalidades.set(data),
      error: (err) => console.error('No se pudieron cargar las modalidades', err),
    });
    this.catalogoService.getTiposPropiedad().subscribe({
      next: (data) => this.tiposPropiedad.set(data),
      error: (err) => console.error('No se pudieron cargar los tipos de propiedad', err),
    });
  }

  // RN-22: los filtros deben poder combinarse entre sí. Se aplican todos sobre
  // el conjunto de publicaciones activas ya traído (ver nota de contrato de
  // query params pendiente en listing.service.ts).
  private aplicarFiltros(listado: Publicacion[], f: FiltrosPublicacion): Publicacion[] {
    const ubicacion = f.ubicacion.trim().toLowerCase();

    return listado.filter((p) => {
      if (ubicacion) {
        const texto = `${p.ciudad?.nombre ?? ''} ${p.provincia?.nombre ?? ''} ${p.direccion}`.toLowerCase();
        if (!texto.includes(ubicacion)) return false;
      }
      if (f.idModalidad != null && p.modalidad?.id !== f.idModalidad) return false;
      if (f.idTipoPropiedad != null && p.tipoPropiedad?.id !== f.idTipoPropiedad) return false;
      if (f.precioMin != null && p.precio < f.precioMin) return false;
      if (f.precioMax != null && p.precio > f.precioMax) return false;
      if (f.ambientes != null && p.cantidad_ambientes < f.ambientes) return false;
      return true;
    });
  }
}
