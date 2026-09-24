import { Component, EventEmitter, Output, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Publicacion } from '../../models/publicacion.model';
import {
  LucideArrowRight,
  LucideBadgeCheck,
  LucideBed,
  LucideBookmark,
  LucideHouse,
  LucideMapPin,
  LucideRuler,
} from '@lucide/angular';
import { AuthService } from '../../../core/services/auth.service';
import { FavoritesService } from '../../services/favorites.service';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';

// Tarjeta reutilizable de una publicación (prototipo "Card"): foto con badge de
// modalidad y tipo de anunciante, título + ubicación, columna de características
// (ambientes y m², que son las que existen en la entidad) y precio con botón "Ver".
@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [RouterLink, RelativeTimePipe, LucideArrowRight, LucideBadgeCheck, LucideBed, LucideBookmark, LucideHouse, LucideMapPin, LucideRuler],
  templateUrl: './listing-card.component.html',
  styleUrl: './listing-card.component.scss',
})
export class ListingCardComponent {
  private readonly auth = inject(AuthService);
  private readonly favorites = inject(FavoritesService);
  private readonly router = inject(Router);

  readonly publicacion = input.required<Publicacion>();
  @Output() readonly favoriteChange = new EventEmitter<boolean>();
  protected readonly savingFavorite = signal(false);

  protected get isFavorite(): boolean {
    return this.favorites.isFavorite(this.publicacion().id);
  }

  protected toggleFavorite(): void {
    if (this.savingFavorite()) return;
    if (!this.auth.isAuthenticated) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.savingFavorite.set(true);
    this.favorites.toggle(this.publicacion().id)
      .pipe(finalize(() => this.savingFavorite.set(false)))
      .subscribe({ next: (result) => this.favoriteChange.emit(result.favorito) });
  }

  protected get precioFormateado(): string {
    return Number(this.publicacion().precio).toLocaleString('es-AR', { maximumFractionDigits: 0 });
  }

  protected get superficie(): string {
    return Number(this.publicacion().superficie).toLocaleString('es-AR', { maximumFractionDigits: 0 });
  }

  protected get esTemporaria(): boolean {
    return this.publicacion().modalidad?.nombre.toLowerCase().includes('tempor') ?? false;
  }

  protected get imagenPrincipal(): string | null {
    return this.publicacion().imagenes?.[0]?.url ?? null;
  }

  protected get verificado(): boolean {
    return this.publicacion().anunciante?.verificado ?? false;
  }

  protected get tipoAnuncianteTexto(): string {
    return this.publicacion().anunciante?.tipoAnunciante?.nombre ?? 'Anunciante';
  }

  protected get ubicacion(): string {
    const p = this.publicacion();
    return [p.ciudad?.nombre, p.provincia?.nombre].filter(Boolean).join(', ');
  }

  protected get ambientesTexto(): string {
    const cantidad = this.publicacion().cantidad_ambientes;
    return `${cantidad} ${cantidad === 1 ? 'ambiente' : 'ambientes'}`;
  }

  protected get tipoPropiedadTexto(): string {
    return this.publicacion().tipoPropiedad?.nombre ?? 'Estadía temporal';
  }
}
