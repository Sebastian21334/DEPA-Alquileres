import { Component, DestroyRef, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, finalize, of, switchMap } from 'rxjs';
import { LucideBadgeCheck, LucideBuilding2, LucideMapPin, LucideSearch } from '@lucide/angular';
import { ListingService } from '../home/listing.service';
import { Publicacion } from '../../shared/models/publicacion.model';
import { AnunciantePublico } from '../../shared/models/anunciante.model';
import { AnunciantePublicoService } from '../../shared/services/anunciante-publico.service';
import { esInmobiliaria } from '../../shared/utils/anunciante';
import { ListingCardComponent } from '../../shared/components/listing-card/listing-card.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

/** T28: ciudades que se ven antes de «Ver más». */
const CIUDADES_VISIBLES = 5;

function normalizeSearchText(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('es-AR');
}

@Component({
  selector: 'app-advertiser-profile',
  standalone: true,
  imports: [RouterLink, ListingCardComponent, SpinnerComponent, RevealDirective, AvatarComponent, LucideBadgeCheck, LucideBuilding2, LucideMapPin, LucideSearch],
  templateUrl: './advertiser-profile.component.html',
  styleUrl: './advertiser-profile.component.scss',
})
export class AdvertiserProfileComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly listings = inject(ListingService);
  private readonly profiles = inject(AnunciantePublicoService);
  private readonly publicationsHeading = viewChild<ElementRef<HTMLElement>>('publicationsHeading');
  private readonly requestedPage = signal(1);
  protected readonly pageSize = 6;
  protected readonly publications = signal<Publicacion[]>([]);
  protected readonly perfil = signal<AnunciantePublico | null>(null);
  protected readonly publicationsError = signal(false);
  protected readonly searchText = signal('');
  protected readonly matchingPublications = computed(() => {
    const query = normalizeSearchText(this.searchText()).trim();
    if (!query) return this.publications();

    const terms = query.split(/\s+/);
    return this.publications().filter(({ titulo, descripcion }) => {
      const text = normalizeSearchText(`${titulo} ${descripcion ?? ''}`);
      return terms.every((term) => text.includes(term));
    });
  });
  protected readonly totalPages = computed(() => Math.ceil(this.matchingPublications().length / this.pageSize));
  protected readonly page = computed(() => Math.min(this.requestedPage(), this.totalPages() || 1));
  protected readonly firstPublication = computed(() => (this.page() - 1) * this.pageSize + 1);
  protected readonly lastPublication = computed(() => Math.min(this.page() * this.pageSize, this.matchingPublications().length));
  protected readonly visiblePublications = computed(() =>
    this.matchingPublications().slice((this.page() - 1) * this.pageSize, this.page() * this.pageSize),
  );
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly name = computed(() => this.perfil()?.nombre_publico?.trim() || 'Anunciante');
  protected readonly verifiedLabel = computed(() =>
    esInmobiliaria(this.perfil()?.tipoAnunciante) ? 'Inmobiliaria verificada' : 'Dueño Verificado',
  );
  /** T28: ciudades donde publica, sin repetir; primero las que tienen más publicaciones y, si empatan, alfabético. */
  protected readonly ciudades = computed(() => {
    const cantidades = new Map<string, number>();
    for (const item of this.publications()) {
      const ciudad = [item.ciudad?.nombre, item.provincia?.nombre].filter(Boolean).join(', ');
      if (ciudad) cantidades.set(ciudad, (cantidades.get(ciudad) ?? 0) + 1);
    }
    return [...cantidades]
      .sort(([ciudadA, cantidadA], [ciudadB, cantidadB]) => cantidadB - cantidadA || ciudadA.localeCompare(ciudadB, 'es'))
      .map(([ciudad]) => ciudad);
  });
  protected readonly verTodasLasCiudades = signal(false);
  protected readonly ciudadesVisibles = computed(() =>
    this.verTodasLasCiudades() ? this.ciudades() : this.ciudades().slice(0, CIUDADES_VISIBLES));
  protected readonly ciudadesOcultas = computed(() => Math.max(0, this.ciudades().length - CIUDADES_VISIBLES));

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id < 1) {
      this.error.set('El perfil solicitado no es válido.');
      this.loading.set(false);
      return;
    }
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const page = Number(params.get('pagina'));
      this.requestedPage.set(Number.isSafeInteger(page) && page > 0 ? page : 1);
    });
    this.profiles.getPublicProfile(id).pipe(
      switchMap((perfil) => {
        this.perfil.set(perfil);
        return this.listings.getByAdvertiser(id).pipe(
          catchError(() => {
            this.publicationsError.set(true);
            return of([]);
          }),
        );
      }),
      finalize(() => this.loading.set(false)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (items) => this.publications.set(items),
      error: () => this.error.set('No pudimos cargar este perfil.'),
    });
  }

  protected updateSearch(text: string): void {
    this.searchText.set(text);
    if (this.requestedPage() === 1) return;

    this.requestedPage.set(1);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pagina: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected goToPage(page: number): void {
    if (!Number.isInteger(page) || page < 1 || page > this.totalPages() || page === this.page()) return;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pagina: page === 1 ? null : page },
      queryParamsHandling: 'merge',
    }).then((navigated) => {
      if (navigated) this.publicationsHeading()?.nativeElement.scrollIntoView({ block: 'start' });
    });
  }
}
