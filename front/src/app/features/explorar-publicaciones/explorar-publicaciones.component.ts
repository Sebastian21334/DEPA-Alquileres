import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ListingGridComponent } from '../home/components/listing-grid/listing-grid.component';
import { ListingService, PaginaPublicaciones } from '../home/listing.service';

@Component({ selector: 'app-explorar-publicaciones', standalone: true, imports: [RouterLink, ListingGridComponent], templateUrl: './explorar-publicaciones.component.html', styleUrl: './explorar-publicaciones.component.scss' })
export class ExplorarPublicacionesComponent {
  private readonly api = inject(ListingService); private readonly route = inject(ActivatedRoute); private readonly router = inject(Router); private readonly destroyRef = inject(DestroyRef);
  protected readonly resultado = signal<PaginaPublicaciones>({ datos: [], pagina: 1, limite: 12, total: 0, totalPaginas: 0 });
  protected readonly cargando = signal(true); protected readonly error = signal<string | null>(null); protected readonly categoria = signal<string | null>(null);
  constructor() { this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((p) => { const pagina = Math.max(1, Number(p.get('pagina')) || 1); const categoria = p.get('categoria'); this.categoria.set(categoria); this.cargar(pagina, categoria); }); }
  protected irAPagina(pagina: number): void { if (pagina < 1 || pagina > this.resultado().totalPaginas) return; this.router.navigate([], { relativeTo: this.route, queryParams: { categoria: this.categoria(), pagina }, queryParamsHandling: 'merge' }); }
  protected titulo(): string { const etiquetas: Record<string, string> = { temporales: 'Alquileres temporales', 'largo-plazo': 'Alquileres de largo plazo', 'villa-maria': 'Alquileres en Villa María', reservadas: 'Publicaciones más reservadas' }; return this.categoria() ? (etiquetas[this.categoria()!] ?? 'Publicaciones') : 'Todas las publicaciones'; }
  private cargar(pagina: number, categoria: string | null): void { this.cargando.set(true); this.error.set(null); this.api.getActivas({ pagina, limite: 12, categoria: categoria ?? undefined }).subscribe({ next: (r) => { this.resultado.set(r); this.cargando.set(false); }, error: (e: Error) => { this.error.set(e.message); this.cargando.set(false); } }); }
}
