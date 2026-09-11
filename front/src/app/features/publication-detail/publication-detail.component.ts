import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ListingService } from '../home/listing.service';
import { Publicacion } from '../../shared/models/publicacion.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-publication-detail',
  standalone: true,
  imports: [RouterLink, SpinnerComponent],
  templateUrl: './publication-detail.component.html',
  styleUrl: './publication-detail.component.scss',
})
export class PublicationDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly listings = inject(ListingService);
  protected readonly publication = signal<Publicacion | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly selectedImage = signal(0);
  protected readonly images = computed(() => this.publication()?.imagenes ?? []);
  protected readonly advertiserName = computed(() => {
    const user = this.publication()?.anunciante?.usuario;
    return user ? `${user.nombre} ${user.apellido}`.trim() : 'Anunciante';
  });

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id < 1) {
      this.error.set('La publicación solicitada no es válida.');
      this.loading.set(false);
      return;
    }
    this.listings.getById(id).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (publication) => this.publication.set(publication),
      error: () => this.error.set('No pudimos encontrar esta publicación.'),
    });
  }

  protected selectImage(index: number): void { this.selectedImage.set(index); }
  protected previousImage(): void {
    const total = this.images().length;
    if (total) this.selectedImage.update((index) => (index - 1 + total) % total);
  }
  protected nextImage(): void {
    const total = this.images().length;
    if (total) this.selectedImage.update((index) => (index + 1) % total);
  }
  protected price(item: Publicacion): string {
    const amount = Number(item.precio).toLocaleString('es-AR', { maximumFractionDigits: 0 });
    return `${item.tipoMoneda?.nombre ?? '$'} ${amount}`;
  }
  protected location(item: Publicacion): string {
    return [item.direccion, item.ciudad?.nombre, item.provincia?.nombre].filter(Boolean).join(', ');
  }
  protected whatsappUrl(item: Publicacion): string | null {
    const phone = item.anunciante?.numero_contacto || item.anunciante?.usuario?.telefono;
    const digits = phone?.replace(/\D/g, '');
    return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(`Hola, consulto por ${item.titulo}`)}` : null;
  }
  protected emailUrl(item: Publicacion): string | null {
    const email = item.anunciante?.usuario?.email;
    return email ? `mailto:${email}?subject=${encodeURIComponent(`Consulta por ${item.titulo}`)}` : null;
  }
}
