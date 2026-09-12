import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Publicacion } from '../../models/publicacion.model';
import {
  LucideArrowRight,
  LucideBadgeCheck,
  LucideBookmark,
  LucideLayoutGrid,
  LucideMapPin,
  LucideRuler,
} from '@lucide/angular';

// Tarjeta reutilizable de una publicación (prototipo "Card"): foto con badge de
// modalidad y "Dueño Verificado", título + ubicación, columna de características
// (ambientes y m², que son las que existen en la entidad) y precio con botón "Ver".
@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [RouterLink, LucideArrowRight, LucideBadgeCheck, LucideBookmark, LucideLayoutGrid, LucideMapPin, LucideRuler],
  templateUrl: './listing-card.component.html',
  styleUrl: './listing-card.component.scss',
})
export class ListingCardComponent {
  readonly publicacion = input.required<Publicacion>();

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

  protected get ubicacion(): string {
    const p = this.publicacion();
    return [p.ciudad?.nombre, p.provincia?.nombre].filter(Boolean).join(', ');
  }
}
