import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import {
  LucideBadgeCheck,
  LucideBuilding2,
  LucideChevronLeft,
  LucideChevronRight,
  LucideClock,
  LucideHouse,
  LucideLayoutList,
  LucideMail,
  LucideMapPin,
  LucideRuler,
} from '@lucide/angular';
import { AuthService } from '../../core/services/auth.service';
import { ChatService } from '../../core/services/chat.service';
import { ListingService } from '../home/listing.service';
import { Publicacion } from '../../shared/models/publicacion.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-publication-detail',
  standalone: true,
  imports: [
    RouterLink,
    SpinnerComponent,
    RevealDirective,
    AvatarComponent,
    LucideBadgeCheck,
    LucideBuilding2,
    LucideChevronLeft,
    LucideChevronRight,
    LucideClock,
    LucideHouse,
    LucideLayoutList,
    LucideMail,
    LucideMapPin,
    LucideRuler,
  ],
  templateUrl: './publication-detail.component.html',
  styleUrl: './publication-detail.component.scss',
})
export class PublicationDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly listings = inject(ListingService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly chat = inject(ChatService);

  protected readonly publication = signal<Publicacion | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly selectedImage = signal(0);
  /** Dirección del último cambio de foto, para animar la entrada desde ese lado. */
  protected readonly direction = signal<'next' | 'prev'>('next');
  protected readonly activeCount = signal<number | null>(null);

  protected readonly images = computed(() => this.publication()?.imagenes ?? []);
  protected readonly currentImage = computed(() => this.images()[this.selectedImage()] ?? null);
  // El backend no permite escribirse a uno mismo: el dueño no ve "Enviar Mensaje".
  protected readonly esMiPublicacion = computed(
    () => this.publication()?.anunciante?.usuario?.id === Number(this.auth.currentUser()?.sub),
  );
  protected readonly esTemporaria = computed(
    () => this.publication()?.modalidad?.nombre.toLowerCase().includes('tempor') ?? false,
  );
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
      next: (publication) => {
        this.publication.set(publication);
        const idAnunciante = publication.anunciante?.idUsuario;
        if (idAnunciante) {
          this.listings.getByAdvertiser(idAnunciante).subscribe({
            next: (items) => this.activeCount.set(items.length),
          });
        }
      },
      error: () => this.error.set('No pudimos encontrar esta publicación.'),
    });
  }

  @HostListener('document:keydown.arrowleft')
  protected previousImage(): void {
    const total = this.images().length;
    if (total < 2) return;
    this.direction.set('prev');
    this.selectedImage.update((index) => (index - 1 + total) % total);
  }

  @HostListener('document:keydown.arrowright')
  protected nextImage(): void {
    const total = this.images().length;
    if (total < 2) return;
    this.direction.set('next');
    this.selectedImage.update((index) => (index + 1) % total);
  }

  protected selectImage(index: number): void {
    this.direction.set(index < this.selectedImage() ? 'prev' : 'next');
    this.selectedImage.set(index);
  }

  /** Abre la ventanita de chat con el anunciante (exige sesión, igual que POST /mensajes). */
  protected chatear(item: Publicacion): void {
    const usuario = item.anunciante?.usuario;
    if (!usuario) return;
    if (!this.auth.isAuthenticated) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.chat.abrir({
      idPublicacion: item.id,
      idOtroUsuario: usuario.id,
      titulo: item.titulo,
      nombreOtro: this.advertiserName(),
      fotoOtro: usuario.foto_url ?? null,
    });
  }

  protected price(item: Publicacion): string {
    const amount = Number(item.precio).toLocaleString('es-AR', { maximumFractionDigits: 0 });
    return `${item.tipoMoneda?.nombre ?? '$'} ${amount}`;
  }

  protected location(item: Publicacion): string {
    return [item.direccion, item.ciudad?.nombre, item.provincia?.nombre].filter(Boolean).join(', ');
  }

  protected city(item: Publicacion): string {
    return [item.ciudad?.nombre, item.provincia?.nombre].filter(Boolean).join(', ');
  }

  protected whatsappUrl(item: Publicacion): string | null {
    const phone = item.anunciante?.numero_contacto || item.anunciante?.usuario?.telefono;
    const digits = phone?.replace(/\D/g, '');
    return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(`Hola, consulto por ${item.titulo}`)}` : null;
  }
}
