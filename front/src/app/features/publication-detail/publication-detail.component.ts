import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { finalize } from 'rxjs';
import {
  LucideBadgeCheck,
  LucideBookmark,
  LucideBuilding2,
  LucideChevronLeft,
  LucideChevronRight,
  LucideClock,
  LucideExternalLink,
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
import { AvailabilityCalendarComponent } from '../../shared/components/availability-calendar/availability-calendar.component';
import { AvailabilityService, FechaDisponible } from '../../shared/services/availability.service';
import { ReservationService } from '../../shared/services/reservation.service';
import { CatalogoService } from '../../shared/services/catalogo.service';
import { MetodoPago } from '../../shared/models/catalogo.model';
import { FavoritesService } from '../../shared/services/favorites.service';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';

@Component({
  selector: 'app-publication-detail',
  standalone: true,
  imports: [
    RouterLink,
    SpinnerComponent,
    RevealDirective,
    AvatarComponent,
    AvailabilityCalendarComponent,
    RelativeTimePipe,
    LucideBadgeCheck,
    LucideBookmark,
    LucideBuilding2,
    LucideChevronLeft,
    LucideChevronRight,
    LucideClock,
    LucideExternalLink,
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
  private readonly availabilityApi = inject(AvailabilityService);
  private readonly reservations = inject(ReservationService);
  private readonly catalogs = inject(CatalogoService);
  private readonly favorites = inject(FavoritesService);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly publication = signal<Publicacion | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly selectedImage = signal(0);
  protected readonly direction = signal<'next' | 'prev'>('next');
  protected readonly imagePreviewOpen = signal(false);
  protected readonly activeCount = signal<number | null>(null);
  protected readonly availability = signal<FechaDisponible[]>([]);
  protected readonly selectedStart = signal<string | null>(null);
  protected readonly selectedEnd = signal<string | null>(null);
  protected readonly bookingError = signal('');
  protected readonly bookingSuccess = signal('');
  protected readonly paymentOpen = signal(false);
  protected readonly paymentMethods = signal<MetodoPago[]>([]);
  protected readonly paymentMethodId = signal<number | null>(null);
  protected readonly processingPayment = signal(false);
  protected readonly savingFavorite = signal(false);

  protected readonly images = computed(() => this.publication()?.imagenes ?? []);
  protected readonly currentImage = computed(() => this.images()[this.selectedImage()] ?? null);
  protected readonly esMiPublicacion = computed(
    () => this.publication()?.anunciante?.usuario?.id === Number(this.auth.currentUser()?.sub),
  );
  protected readonly isFavorite = computed(() => {
    const id = this.publication()?.id;
    return id ? this.favorites.isFavorite(id) : false;
  });
  protected readonly esTemporaria = computed(
    () => {
      const modalidad = this.publication()?.modalidad;
      return modalidad?.permite_reservas_por_fecha ?? modalidad?.nombre.toLowerCase().includes('tempor') ?? false;
    },
  );
  protected readonly advertiserName = computed(() => {
    const user = this.publication()?.anunciante?.usuario;
    return user ? `${user.nombre} ${user.apellido}`.trim() : 'Anunciante';
  });
  protected readonly bookingDays = computed(() => {
    const start = this.selectedStart();
    const end = this.selectedEnd();
    if (!start || !end) return 0;
    return Math.floor((this.parseDate(end).getTime() - this.parseDate(start).getTime()) / 86400000) + 1;
  });
  protected readonly bookingTotal = computed(
    () => this.bookingDays() * Number(this.publication()?.precio ?? 0),
  );
  protected readonly isCardPayment = computed(() => {
    const selected = this.paymentMethods().find((item) => item.id === this.paymentMethodId());
    return /d[eé]bito|cr[eé]dito|tarjeta/i.test(selected?.nombre ?? '');
  });
  protected readonly mapUrl = computed(() => {
    const item = this.publication();
    if (!item) return '';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.mapQuery(item))}`;
  });
  protected readonly mapEmbedUrl = computed<SafeResourceUrl | null>(() => {
    const item = this.publication();
    if (!item) return null;
    const query = encodeURIComponent(this.mapQuery(item));
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.google.com/maps?q=${query}&output=embed`);
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
        if (this.esTemporaria()) {
          this.loadAvailability(publication.id);
          this.catalogs.getMetodosPago().subscribe({
            next: (items) => {
              this.paymentMethods.set(items);
              const card = items.find((item) => /d[eé]bito|cr[eé]dito|tarjeta/i.test(item.nombre));
              this.paymentMethodId.set(card?.id ?? items[0]?.id ?? null);
            },
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

  @HostListener('document:keydown.escape')
  protected closeImagePreview(): void {
    this.imagePreviewOpen.set(false);
  }

  protected openImagePreview(): void {
    if (this.currentImage()) this.imagePreviewOpen.set(true);
  }

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

  protected toggleFavorite(item: Publicacion): void {
    if (this.savingFavorite()) return;
    if (!this.auth.isAuthenticated) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.savingFavorite.set(true);
    this.favorites.toggle(item.id)
      .pipe(finalize(() => this.savingFavorite.set(false)))
      .subscribe();
  }

  protected price(item: Publicacion): string {
    const amount = Number(item.precio).toLocaleString('es-AR', { maximumFractionDigits: 0 });
    return `${item.tipoMoneda?.nombre ?? '$'} ${amount}`;
  }

  protected location(item: Publicacion): string {
    return [item.direccion, item.ciudad?.nombre, item.provincia?.nombre].filter(Boolean).join(', ');
  }

  private mapQuery(item: Publicacion): string {
    const latitud = Number(item.latitud);
    const longitud = Number(item.longitud);
    return item.latitud != null && item.longitud != null && Number.isFinite(latitud) && Number.isFinite(longitud)
      ? `${latitud},${longitud}`
      : this.location(item);
  }

  protected city(item: Publicacion): string {
    return [item.ciudad?.nombre, item.provincia?.nombre].filter(Boolean).join(', ');
  }

  protected whatsappUrl(item: Publicacion): string | null {
    const phone = item.anunciante?.numero_contacto || item.anunciante?.usuario?.telefono;
    const digits = phone?.replace(/\D/g, '');
    return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(`Hola, consulto por ${item.titulo}`)}` : null;
  }

  protected selectBookingDate(date: string): void {
    this.bookingError.set('');
    this.bookingSuccess.set('');
    const start = this.selectedStart();
    if (!start || this.selectedEnd() || date <= start) {
      this.selectedStart.set(date);
      this.selectedEnd.set(null);
      return;
    }
    if (!this.isRangeAvailable(start, date)) {
      this.bookingError.set('El rango incluye uno o más días no disponibles. Elegí otro período.');
      this.selectedStart.set(date);
      this.selectedEnd.set(null);
      return;
    }
    this.selectedEnd.set(date);
  }

  protected openPayment(): void {
    this.bookingError.set('');
    if (!this.auth.isAuthenticated) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    if (!this.selectedStart() || !this.selectedEnd()) {
      this.bookingError.set('Elegí la fecha de ingreso y la fecha de salida para continuar.');
      return;
    }
    if (!this.paymentMethodId()) {
      this.bookingError.set('No hay un medio de pago disponible para simular la reserva.');
      return;
    }
    this.paymentOpen.set(true);
  }

  protected closePayment(): void {
    if (!this.processingPayment()) this.paymentOpen.set(false);
  }

  protected choosePaymentMethod(value: string): void {
    this.paymentMethodId.set(Number(value));
  }

  protected confirmPayment(event: Event): void {
    event.preventDefault();
    const item = this.publication();
    const start = this.selectedStart();
    const end = this.selectedEnd();
    const method = this.paymentMethodId();
    if (!item || !start || !end || !method || this.processingPayment()) return;

    this.processingPayment.set(true);
    this.bookingError.set('');
    this.reservations.create({
      id_publicacion: item.id,
      id_metodo_pago: method,
      fecha_inicio: start,
      fecha_fin: end,
    }).pipe(finalize(() => this.processingPayment.set(false))).subscribe({
      next: (reservation) => {
        this.paymentOpen.set(false);
        this.bookingSuccess.set(`Reserva #${reservation.id} confirmada. El pago fue simulado y no se realizó ningún cargo.`);
        this.selectedStart.set(null);
        this.selectedEnd.set(null);
        this.loadAvailability(item.id);
      },
      error: (err) => {
        this.paymentOpen.set(false);
        this.bookingError.set(err?.error?.message ?? 'No se pudo completar la reserva simulada.');
        this.loadAvailability(item.id);
      },
    });
  }

  protected formatDate(value: string | null): string {
    if (!value) return 'Elegir fecha';
    return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(this.parseDate(value));
  }

  protected formatAmount(value: number): string {
    return value.toLocaleString('es-AR', { maximumFractionDigits: 0 });
  }

  private loadAvailability(idPublication: number): void {
    this.availabilityApi.getByPublication(idPublication).subscribe({
      next: (items) => this.availability.set(items),
      error: () => this.bookingError.set('No pudimos cargar la disponibilidad de esta propiedad.'),
    });
  }

  private isRangeAvailable(start: string, end: string): boolean {
    const available = new Set(
      this.availability().filter((item) => item.disponible).map((item) => item.fecha.slice(0, 10)),
    );
    const cursor = this.parseDate(start);
    const last = this.parseDate(end);
    while (cursor <= last) {
      if (!available.has(this.toIso(cursor))) return false;
      cursor.setDate(cursor.getDate() + 1);
    }
    return true;
  }

  private parseDate(value: string): Date {
    return new Date(`${value.slice(0, 10)}T12:00:00`);
  }

  private toIso(value: Date): string {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  }
}
