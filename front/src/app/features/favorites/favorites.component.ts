import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ListingCardComponent } from '../../shared/components/listing-card/listing-card.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { Publicacion } from '../../shared/models/publicacion.model';
import { FavoritesService } from '../../shared/services/favorites.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RouterLink, ListingCardComponent, SpinnerComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
})
export class FavoritesComponent {
  private readonly favoritesApi = inject(FavoritesService);

  protected readonly favorites = signal<Publicacion[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  constructor() {
    this.favoritesApi.list().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (items) => this.favorites.set(items),
      error: () => this.error.set('No pudimos cargar tus favoritos. Intentá nuevamente.'),
    });
  }

  protected favoriteChanged(id: number, favorite: boolean): void {
    if (!favorite) this.favorites.update((items) => items.filter((item) => item.id !== id));
  }
}
