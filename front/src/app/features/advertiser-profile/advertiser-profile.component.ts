import { Component, DestroyRef, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LucideBadgeCheck, LucideBuilding2, LucideMapPin } from '@lucide/angular';
import { ListingService } from '../home/listing.service';
import { Publicacion } from '../../shared/models/publicacion.model';
import { ListingCardComponent } from '../../shared/components/listing-card/listing-card.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-advertiser-profile',
  standalone: true,
  imports: [RouterLink, ListingCardComponent, SpinnerComponent, RevealDirective, AvatarComponent, LucideBadgeCheck, LucideBuilding2, LucideMapPin],
  templateUrl: './advertiser-profile.component.html',
  styleUrl: './advertiser-profile.component.scss',
})
export class AdvertiserProfileComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly listings = inject(ListingService);
  private readonly publicationsHeading = viewChild<ElementRef<HTMLElement>>('publicationsHeading');
  private readonly requestedPage = signal(1);
  protected readonly pageSize = 6;
  protected readonly publications = signal<Publicacion[]>([]);
  protected readonly totalPages = computed(() => Math.ceil(this.publications().length / this.pageSize));
  protected readonly page = computed(() => Math.min(this.requestedPage(), this.totalPages() || 1));
  protected readonly firstPublication = computed(() => (this.page() - 1) * this.pageSize + 1);
  protected readonly lastPublication = computed(() => Math.min(this.page() * this.pageSize, this.publications().length));
  protected readonly visiblePublications = computed(() =>
    this.publications().slice((this.page() - 1) * this.pageSize, this.page() * this.pageSize),
  );
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly advertiser = computed(() => this.publications()[0]?.anunciante ?? null);
  protected readonly name = computed(() => {
    const user = this.advertiser()?.usuario;
    return user ? `${user.nombre} ${user.apellido}`.trim() : 'Anunciante';
  });
  protected readonly locations = computed(() =>
    Array.from(
      new Set(
        this.publications()
          .map((item) => [item.ciudad?.nombre, item.provincia?.nombre].filter(Boolean).join(', '))
          .filter(Boolean),
      ),
    ).join(' · '),
  );

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
    this.listings.getByAdvertiser(id).pipe(
      finalize(() => this.loading.set(false)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (items) => {
        this.publications.set(items);
        if (!items.length) this.error.set('Este anunciante no tiene publicaciones activas.');
      },
      error: () => this.error.set('No pudimos cargar este perfil.'),
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
