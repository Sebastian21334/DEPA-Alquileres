import { Component, DestroyRef, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, Subscription } from 'rxjs';
import { LucideMap, LucideSearch } from '@lucide/angular';
import { AdvancedFiltersComponent } from '../home/components/advanced-filters/advanced-filters.component';
import { ListingGridComponent } from '../home/components/listing-grid/listing-grid.component';
import { FiltrosPublicaciones, ListingService, OrdenPublicaciones, PaginaPublicaciones } from '../home/listing.service';
import { MapaPublicacionesComponent } from './mapa-publicaciones.component';
import { CatalogoService } from '../../shared/services/catalogo.service';
import {
  Modalidad,
  MonedaPrecio,
  TipoPropiedad,
  admiteReservasPorFecha,
  codigoMoneda,
} from '../../shared/models/catalogo.model';

@Component({
  selector: 'app-explorar-publicaciones',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NgTemplateOutlet,
    LucideMap,
    LucideSearch,
    AdvancedFiltersComponent,
    ListingGridComponent,
    MapaPublicacionesComponent,
  ],
  templateUrl: './explorar-publicaciones.component.html',
  styleUrl: './explorar-publicaciones.component.scss',
})
export class ExplorarPublicacionesComponent {
  private readonly ordenesValidos: OrdenPublicaciones[] = [
    'recientes',
    'antiguas',
    'precio-menor',
    'precio-mayor',
    'titulo',
    'resenas',
  ];
  private readonly api = inject(ListingService);
  private readonly catalogos = inject(CatalogoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private solicitudListado?: Subscription;

  protected readonly resultado = signal<PaginaPublicaciones>({
    datos: [],
    pagina: 1,
    limite: 12,
    total: 0,
    totalPaginas: 0,
  });
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly categoria = signal<string | null>(null);
  protected readonly orden = signal<OrdenPublicaciones>('recientes');
  protected readonly vistaMapa = signal(false);
  protected readonly filtrosMapa = signal<FiltrosPublicaciones>({});
  protected readonly modalidades = signal<Modalidad[]>([]);
  protected readonly tiposPropiedad = signal<TipoPropiedad[]>([]);
  protected readonly monedasPrecio = signal<MonedaPrecio[]>([]);
  protected readonly busqueda = this.fb.nonNullable.control('');
  protected readonly searchForm = this.fb.group({
    busqueda: this.busqueda,
  });
  protected readonly form = this.fb.nonNullable.group({
    idModalidad: null as number | null,
    idProvincia: null as number | null,
    idsCiudad: [[] as number[]],
    idsTipoPropiedad: [[] as number[]],
    // Moneda del rango de precio: solo filtra cuando hay un precio cargado.
    idTipoMoneda: null as number | null,
    ambientesSeleccionados: [[] as string[]],
    precioMin: null as number | null,
    precioMax: null as number | null,
    superficieMin: null as number | null,
  });

  constructor() {
    this.cargarCatalogos();

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const pagina = Math.max(1, Number(params.get('pagina')) || 1);
      const categoria = params.get('categoria');
      const orden = params.get('orden');
      this.busqueda.setValue(params.get('q') ?? '', { emitEvent: false });
      this.vistaMapa.set(params.get('vista') === 'mapa');
      this.categoria.set(categoria);
      this.orden.set(this.esOrdenValido(orden) && (orden !== 'resenas' || categoria === 'temporales') ? orden : 'recientes');
      this.sincronizarModalidad(categoria);
      this.cargar(pagina);
    });

    this.form.valueChanges
      .pipe(debounceTime(250), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.buscar();
      });
  }

  protected seleccionarCategoria(categoria: 'temporales' | 'largo-plazo' | null): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      queryParams: { categoria, q: this.terminoBusqueda() || null, orden: categoria !== 'temporales' && this.orden() === 'resenas' ? 'recientes' : this.orden(), pagina: 1 },
    });
  }

  protected buscarTexto(evento?: Event): void {
    evento?.preventDefault();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      queryParams: {
        categoria: this.categoria(),
        q: this.terminoBusqueda() || null,
        orden: this.orden(),
        pagina: 1,
      },
    });
  }

  protected buscar(): void {
    if (!this.vistaMapa() && this.resultado().pagina !== 1) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParamsHandling: 'merge',
        queryParams: {
          categoria: this.categoria(),
          q: this.terminoBusqueda() || null,
          orden: this.orden(),
          pagina: 1,
        },
      });
      return;
    }
    this.cargar(1);
  }

  protected irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.resultado().totalPaginas) return;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      queryParams: {
        categoria: this.categoria(),
        q: this.terminoBusqueda() || null,
        orden: this.orden(),
        pagina,
      },
    });
  }

  protected cambiarOrden(orden: string): void {
    if (!this.esOrdenValido(orden) || orden === this.orden()) return;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      queryParams: {
        categoria: this.categoria(),
        q: this.terminoBusqueda() || null,
        orden,
        pagina: 1,
      },
    });
  }

  protected titulo(): string {
    const etiquetas: Record<string, string> = {
      temporales: 'Alquileres temporales',
      'largo-plazo': 'Alquileres de largo plazo',
      'villa-maria': 'Alquileres en Villa María',
      reservadas: 'Publicaciones más reservadas',
    };
    return this.categoria()
      ? (etiquetas[this.categoria()!] ?? 'Publicaciones')
      : 'Todas las publicaciones';
  }

  protected descripcion(): string {
    switch (this.categoria()) {
      case 'temporales':
        return 'Encontrá el alojamiento ideal para tu próxima estadía, escapada o viaje.';
      case 'largo-plazo':
        return 'Encontrá tu próximo hogar y el espacio ideal para tu día a día.';
      default:
        return 'Explorá las propiedades disponibles y encontrá el alquiler que se adapte a vos.';
    }
  }

  private cargarCatalogos(): void {
    this.catalogos.getModalidades().subscribe({
      next: (modalidades) => {
        this.modalidades.set(modalidades);
        this.sincronizarModalidad(this.categoria());
      },
      error: (error) => console.error('No se pudieron cargar las modalidades', error),
    });
    this.catalogos
      .getTiposPropiedad()
      .subscribe({ next: (tipos) => this.tiposPropiedad.set(tipos) });
    this.catalogos.getTiposMoneda().subscribe({
      next: (tipos) => {
        const monedas = tipos
          .map((tipo) => ({ id: tipo.id, codigo: codigoMoneda(tipo) }))
          .filter((moneda): moneda is MonedaPrecio => moneda.codigo !== null)
          .sort((a, b) => a.codigo.localeCompare(b.codigo));
        this.monedasPrecio.set(monedas);
        // Pesos de entrada, sin volver a buscar: la moneda todavía no filtra nada.
        if (this.form.controls.idTipoMoneda.value == null) {
          this.form.controls.idTipoMoneda.setValue(monedas[0]?.id ?? null, { emitEvent: false });
        }
      },
    });
  }

  private sincronizarModalidad(categoria: string | null): void {
    const esTemporal = categoria === 'temporales';
    const esLargoPlazo = categoria === 'largo-plazo';
    const modalidad = this.modalidades().find((item) =>
      esTemporal ? admiteReservasPorFecha(item) : esLargoPlazo && !admiteReservasPorFecha(item),
    );
    const idModalidad = modalidad?.id ?? null;
    if (this.form.controls.idModalidad.value !== idModalidad) {
      this.form.controls.idModalidad.setValue(idModalidad);
    }
  }

  private cargar(pagina: number): void {
    this.solicitudListado?.unsubscribe();
    const filtros = this.form.getRawValue();
    const conPrecio = filtros.precioMin != null || filtros.precioMax != null;
    const consulta: FiltrosPublicaciones = {
      categoria: this.categoria() ?? undefined,
      busqueda: this.terminoBusqueda(),
      idProvincia: filtros.idProvincia ?? undefined,
      idsCiudad: filtros.idsCiudad,
      idsTipoPropiedad: filtros.idsTipoPropiedad,
      idsTipoMoneda: conPrecio && filtros.idTipoMoneda != null ? [filtros.idTipoMoneda] : [],
      precioMin: filtros.precioMin,
      precioMax: filtros.precioMax,
      superficieMin: filtros.superficieMin,
      ambientes: filtros.ambientesSeleccionados,
    };
    if (this.vistaMapa()) {
      this.filtrosMapa.set(consulta);
      return;
    }
    this.cargando.set(true);
    this.error.set(null);
    this.solicitudListado = this.api
      .getActivas({ ...consulta, pagina, limite: 12, orden: this.orden() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resultado) => {
          this.resultado.set(resultado);
          this.cargando.set(false);
        },
        error: (error: Error) => {
          this.error.set(error.message);
          this.cargando.set(false);
        },
      });
  }

  private terminoBusqueda(): string {
    return this.busqueda.value.trim();
  }

  private esOrdenValido(orden: string | null): orden is OrdenPublicaciones {
    return this.ordenesValidos.includes(orden as OrdenPublicaciones);
  }
}
