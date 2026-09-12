import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  private readonly listings = inject(ListingService);
  protected readonly publications = signal<Publicacion[]>([]);
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
    this.listings.getByAdvertiser(id).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (items) => {
        this.publications.set(items);
        if (!items.length) this.error.set('Este anunciante no tiene publicaciones activas.');
      },
      error: () => this.error.set('No pudimos cargar este perfil.'),
    });
  }
}
