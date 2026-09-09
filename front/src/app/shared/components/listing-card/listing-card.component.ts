import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Publicacion } from '../../models/publicacion.model';

// Tarjeta reutilizable de una publicación. No está atada al estilo visual del
// prototipo, solo a su contenido: imagen principal, indicador de "Publicación",
// indicador de "Dueño verificado" (si anunciante.verificado), título, ubicación,
// ambientes/m², precio y botón "Ver publicación" -> /publicaciones/:id.
@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  templateUrl: './listing-card.component.html',
  styleUrl: './listing-card.component.scss',
})
export class ListingCardComponent {
  readonly publicacion = input.required<Publicacion>();

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
