import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { LucideSearch } from '@lucide/angular';
import { AdvancedFiltersComponent } from '../home/components/advanced-filters/advanced-filters.component';
import { ListingGridComponent } from '../home/components/listing-grid/listing-grid.component';
import { ListingService, PaginaPublicaciones } from '../home/listing.service';
import { CatalogoService } from '../../shared/services/catalogo.service';
import { UbicacionService } from '../../shared/services/ubicacion.service';
import { Modalidad, TipoMoneda, TipoPropiedad } from '../../shared/models/catalogo.model';
import { Ciudad } from '../../shared/models/ubicacion.model';

@Component({ selector: 'app-explorar-publicaciones', standalone: true, imports: [ReactiveFormsModule, RouterLink, LucideSearch, AdvancedFiltersComponent, ListingGridComponent], templateUrl: './explorar-publicaciones.component.html', styleUrl: './explorar-publicaciones.component.scss' })
export class ExplorarPublicacionesComponent {
  private readonly api = inject(ListingService);
  private readonly catalogos = inject(CatalogoService);
  private readonly ubicacion = inject(UbicacionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  protected readonly resultado = signal<PaginaPublicaciones>({ datos: [], pagina: 1, limite: 12, total: 0, totalPaginas: 0 });
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly categoria = signal<string | null>(null);
  protected readonly modalidades = signal<Modalidad[]>([]);
  protected readonly tiposPropiedad = signal<TipoPropiedad[]>([]);
  protected readonly monedas = signal<TipoMoneda[]>([]);
  protected readonly ciudades = signal<Ciudad[]>([]);
  protected readonly busqueda = this.fb.nonNullable.control('');
  protected readonly form = this.fb.nonNullable.group({
    idModalidad: null as number | null,
    idsCiudad: [[] as number[]],
    idsTipoPropiedad: [[] as number[]],
    idsTipoMoneda: [[] as number[]],
    ambientesSeleccionados: [[] as string[]],
    precioMin: null as number | null,
    precioMax: null as number | null,
  });

  constructor() {
    this.cargarCatalogos();

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const pagina = Math.max(1, Number(params.get('pagina')) || 1);
      const categoria = params.get('categoria');
      this.busqueda.setValue(params.get('q') ?? '', { emitEvent: false });
      this.categoria.set(categoria);
      this.sincronizarModalidad(categoria);
      this.cargar(pagina);
    });

    this.form.valueChanges.pipe(debounceTime(250), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { categoria: this.categoria(), q: this.terminoBusqueda() || null, pagina: 1 },
      });
    });
  }

  protected seleccionarCategoria(categoria: 'temporales' | 'largo-plazo'): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { categoria, q: this.terminoBusqueda() || null, pagina: 1 },
    });
  }

  protected buscarTexto(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { categoria: this.categoria(), q: this.terminoBusqueda() || null, pagina: 1 },
    });
  }

  protected buscar(): void {
    if (this.resultado().pagina !== 1) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { categoria: this.categoria(), q: this.terminoBusqueda() || null, pagina: 1 },
      });
      return;
    }
    this.cargar(1);
  }

  protected irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.resultado().totalPaginas) return;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { categoria: this.categoria(), q: this.terminoBusqueda() || null, pagina },
    });
  }

  protected titulo(): string {
    const etiquetas: Record<string, string> = {
      temporales: 'Alquileres temporales',
      'largo-plazo': 'Alquileres de largo plazo',
      'villa-maria': 'Alquileres en Villa María',
      reservadas: 'Publicaciones más reservadas',
    };
    return this.categoria() ? (etiquetas[this.categoria()!] ?? 'Publicaciones') : 'Todas las publicaciones';
  }

  private cargarCatalogos(): void {
    this.catalogos.getModalidades().subscribe({
      next: (modalidades) => {
        this.modalidades.set(modalidades);
        this.sincronizarModalidad(this.categoria());
      },
      error: (error) => console.error('No se pudieron cargar las modalidades', error),
    });
    this.catalogos.getTiposPropiedad().subscribe({ next: (tipos) => this.tiposPropiedad.set(tipos) });
    this.catalogos.getTiposMoneda().subscribe({ next: (monedas) => this.monedas.set(monedas) });
    this.ubicacion.getTodasCiudades().subscribe({ next: (ciudades) => this.ciudades.set(ciudades) });
  }

  private sincronizarModalidad(categoria: string | null): void {
    const esTemporal = categoria === 'temporales';
    const esLargoPlazo = categoria === 'largo-plazo';
    const modalidad = this.modalidades().find((item) =>
      esTemporal ? item.nombre.toLowerCase().includes('tempor') : esLargoPlazo && !item.nombre.toLowerCase().includes('tempor'),
    );
    const idModalidad = modalidad?.id ?? null;
    if (this.form.controls.idModalidad.value !== idModalidad) {
      this.form.controls.idModalidad.setValue(idModalidad);
    }
  }

  private cargar(pagina: number): void {
    const filtros = this.form.getRawValue();
    this.cargando.set(true);
    this.error.set(null);
    this.api.getActivas({
      pagina,
      limite: 12,
      categoria: this.categoria() ?? undefined,
      busqueda: this.terminoBusqueda(),
      idsCiudad: filtros.idsCiudad,
      idsTipoPropiedad: filtros.idsTipoPropiedad,
      idsTipoMoneda: filtros.idsTipoMoneda,
      precioMin: filtros.precioMin,
      precioMax: filtros.precioMax,
      ambientes: filtros.ambientesSeleccionados,
    }).subscribe({
      next: (resultado) => { this.resultado.set(resultado); this.cargando.set(false); },
      error: (error: Error) => { this.error.set(error.message); this.cargando.set(false); },
    });
  }

  private terminoBusqueda(): string {
    return this.busqueda.value.trim();
  }
}
