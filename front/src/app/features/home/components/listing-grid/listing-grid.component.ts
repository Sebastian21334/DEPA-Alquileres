import { Component, EventEmitter, Output, input } from '@angular/core';
import { ListingCardComponent } from '../../../../shared/components/listing-card/listing-card.component';
import { Publicacion } from '../../../../shared/models/publicacion.model';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

// Grilla de resultados: indicador de carga, estado vacío y paginación
// simple ("Cargar más"). El backend actual no pagina server-side, así que
// `listings` ya viene recortado por HomeComponent (ver comentario en
// listing.service.ts sobre el contrato de filtros/paginación pendiente).
@Component({
  selector: 'app-listing-grid',
  standalone: true,
  imports: [ListingCardComponent, RevealDirective, SpinnerComponent],
  templateUrl: './listing-grid.component.html',
  styleUrl: './listing-grid.component.scss',
})
export class ListingGridComponent {
  readonly listings = input.required<Publicacion[]>();
  readonly loading = input(false);
  readonly total = input(0);
  readonly error = input<string | null>(null);
  readonly hasMore = input(false);
  readonly sortOrder = input('recientes');
  readonly permitirOrdenResenas = input(false);

  @Output() loadMore = new EventEmitter<void>();
  @Output() sortChange = new EventEmitter<string>();

}
