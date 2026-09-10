import { Component, EventEmitter, Output, input } from '@angular/core';
import { ListingCardComponent } from '../../../../shared/components/listing-card/listing-card.component';
import { Publicacion } from '../../../../shared/models/publicacion.model';

// Grilla de resultados: estado de carga (skeletons), estado vacío y paginación
// simple ("Cargar más"). El backend actual no pagina server-side, así que
// `listings` ya viene recortado por HomeComponent (ver comentario en
// listing.service.ts sobre el contrato de filtros/paginación pendiente).
@Component({
  selector: 'app-listing-grid',
  standalone: true,
  imports: [ListingCardComponent],
  templateUrl: './listing-grid.component.html',
  styleUrl: './listing-grid.component.scss',
})
export class ListingGridComponent {
  readonly listings = input.required<Publicacion[]>();
  readonly loading = input(false);
  readonly total = input(0);
  readonly error = input<string | null>(null);
  readonly hasMore = input(false);

  @Output() loadMore = new EventEmitter<void>();

  protected readonly skeletons = Array.from({ length: 6 });
}
