import { Component, DestroyRef, HostListener, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { finalize, Subscription } from 'rxjs';
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
import {
  RentalDateRange,
  isRentalRangeAvailable,
  rentalDays,
} from '../../shared/utils/rental-dates';
import { AvailabilityService, FechaDisponible } from '../../shared/services/availability.service';
import { PresupuestoReserva, ReservationService } from '../../shared/services/reservation.service';
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
  private readonly favorites = inject(FavoritesService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);
  private consultaPresupuesto?: Subscription;

  protected readonly publication = signal<Publicacion | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly selectedImage = signal(0);
  protected readonly direction = signal<'next' | 'prev'>('next');
  protected readonly imagePreviewOpen = signal(false);
  protected readonly activeCount = signal<number | null>(null);
  protected readonly availability = signal<FechaDisponible[]>([]);
  protected readonly availabilityLoading = signal(false);
  protected readonly selectedStart = signal<string | null>(null);
  protected readonly selectedEnd = signal<string | null>(null);
  protected readonly bookingError = signal('');
  protected readonly bookingSuccess = signal('');
  protected readonly paymentOpen = signal(false);
  protected readonly processingPayment = signal(false);
  protected readonly presupuesto = signal<PresupuestoReserva | null>(null);
  protected readonly cotizando = signal(false);
  protected readonly aceptaConversion = signal(false);
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
  protected readonly esTemporaria = computed(() => {
    const modalidad = this.publication()?.modalidad;
    return (
      modalidad?.permite_reservas_por_fecha ??
      modalidad?.nombre.toLowerCase().includes('tempor') ??
      false
    );
  });
  protected readonly advertiserName = computed(() => {
    const user = this.publication()?.anunciante?.usuario;
    return user ? `${user.nombre} ${user.apellido}`.trim() : 'Anunciante';
  });
  protected readonly bookingDays = computed(() =>
    rentalDays(this.selectedStart(), this.selectedEnd()),
  );
  protected readonly bookingTotal = computed(
    () => this.bookingDays() * Number(this.publication()?.precio ?? 0),
  );
  protected readonly mapUrl = computed(() => {
    const item = this.publication();
    if (!item) return '';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.mapQuery(item))}`;
  });
  protected readonly mapEmbedUrl = computed<SafeResourceUrl | null>(() => {
    const item = this.publication();
    if (!item) return null;
    const query = encodeURIComponent(this.mapQuery(item));
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.google.com/maps?q=${query}&output=embed`,
    );
  });

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id < 1) {
      this.error.set('La publicación solicitada no es válida.');
      this.loading.set(false);
      return;
    }
    this.listings
      .getById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (publication) => {
          this.publication.set(publication);
          this.registerView(publication);
          const idAnunciante = publication.anunciante?.idUsuario;
          if (idAnunciante) {
            this.listings.getByAdvertiser(idAnunciante).subscribe({
              next: (items) => this.activeCount.set(items.length),
            });
          }
          if (this.esTemporaria()) {
            this.loadAvailability(publication.id);
          }
        },
        error: () => this.error.set('No pudimos encontrar esta publicación.'),
      });
  }

  private registerView(publication: Publicacion): void {
    const ownerId = publication.anunciante?.usuario?.id ?? publication.anunciante?.idUsuario;
    if (ownerId === Number(this.auth.currentUser()?.sub)) return;
    const key = `depa:viewed:${publication.id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      // El contador sigue funcionando aunque el navegador bloquee sessionStorage.
    }
    this.listings.registerView(publication.id).subscribe({ error: () => undefined });
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
    this.favorites
      .toggle(item.id)
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
    return item.latitud != null &&
      item.longitud != null &&
      Number.isFinite(latitud) &&
      Number.isFinite(longitud)
      ? `${latitud},${longitud}`
      : this.location(item);
  }

  protected city(item: Publicacion): string {
    return [item.ciudad?.nombre, item.provincia?.nombre].filter(Boolean).join(', ');
  }

  protected whatsappUrl(item: Publicacion): string | null {
    const phone = item.anunciante?.numero_contacto || item.anunciante?.usuario?.telefono;
    const digits = phone?.replace(/\D/g, '');
    return digits
      ? `https://wa.me/${digits}?text=${encodeURIComponent(`Hola, consulto por ${item.titulo}`)}`
      : null;
  }

  protected selectBookingDate(range: RentalDateRange): void {
    this.bookingError.set('');
    this.bookingSuccess.set('');
    this.selectedStart.set(range.start);
    this.selectedEnd.set(range.end);
  }

  protected openPayment(): void {
    this.bookingError.set('');
    if (!this.auth.isAuthenticated) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    const start = this.selectedStart();
    const end = this.selectedEnd();
    if (!start || !end) {
      this.bookingError.set('Elegí un día o un período completo para continuar.');
      return;
    }
    if (!isRentalRangeAvailable(start, end, this.availability())) {
      this.bookingError.set('Los días elegidos ya no están disponibles. Elegí otras fechas.');
      return;
    }
    this.paymentOpen.set(true);
    this.cotizarPago();
  }

  protected closePayment(): void {
    if (this.processingPayment()) return;
    this.consultaPresupuesto?.unsubscribe();
    this.paymentOpen.set(false);
    this.presupuesto.set(null);
    this.cotizando.set(false);
    this.aceptaConversion.set(false);
  }

  protected cotizarPago(): void {
    const item = this.publication(),
      inicio = this.selectedStart(),
      fin = this.selectedEnd();
    if (!item || !inicio || !fin || this.processingPayment()) return;
    this.consultaPresupuesto?.unsubscribe();
    this.presupuesto.set(null);
    this.aceptaConversion.set(false);
    this.cotizando.set(true);
    this.bookingError.set('');
    this.consultaPresupuesto = this.reservations
      .quote({ id_publicacion: item.id, fecha_inicio: inicio, fecha_fin: fin })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cotizando.set(false)),
      )
      .subscribe({
        next: (presupuesto) => this.presupuesto.set(presupuesto),
        error: (err) =>
          this.bookingError.set(
            err?.error?.message ?? 'No pudimos cotizar la reserva. Intentá nuevamente.',
          ),
      });
  }
  protected presupuestoVencido(): boolean {
    return !this.presupuesto() || Date.now() >= new Date(this.presupuesto()!.vence_en).getTime();
  }
  protected aceptarConversion(evento: Event): void {
    this.aceptaConversion.set(evento.target instanceof HTMLInputElement && evento.target.checked);
  }
  protected formatCurrency(valor: string | number, moneda: string, decimales = 2): string {
    return Number(valor).toLocaleString('es-AR', {
      style: 'currency',
      currency: moneda,
      maximumFractionDigits: decimales,
    });
  }
  protected fechaCotizacion(valor: string): string {
    return new Date(valor).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
  }

  protected confirmPayment(event: Event): void {
    event.preventDefault();
    const item = this.publication();
    const start = this.selectedStart();
    const end = this.selectedEnd();
    if (!item || !start || !end || this.processingPayment()) return;

    const presupuesto = this.presupuesto();
    if (!presupuesto || this.cotizando()) return;
    if (this.presupuestoVencido()) {
      this.bookingError.set('El presupuesto venció. Volvé a cotizar antes de pagar.');
      return;
    }
    if (presupuesto.moneda_origen === 'USD' && !this.aceptaConversion()) {
      this.bookingError.set('Aceptá la cotización y el total en pesos antes de continuar.');
      return;
    }
    this.processingPayment.set(true);
    this.bookingError.set('');
    this.reservations
      .createCheckout({
        id_publicacion: item.id,
        fecha_inicio: start,
        fecha_fin: end,
        presupuesto_token: presupuesto.token,
      })
      .pipe(finalize(() => this.processingPayment.set(false)))
      .subscribe({
        next: (checkout) => {
          try {
            sessionStorage.setItem('depa:ultima-reserva', String(checkout.reserva_id));
          } catch {
            // El retorno también incluye external_reference; sessionStorage es solo respaldo.
          }
          window.location.assign(checkout.checkout_url);
        },
        error: (err) => {
          if (err.status === 409) {
            this.presupuesto.set(null);
            this.aceptaConversion.set(false);
          }
          this.bookingError.set(
            err?.error?.message ?? 'No se pudo iniciar el pago con Mercado Pago.',
          );
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

  protected confirmarWhatsapp(event: Event): void {
    const continuar = window.confirm(
      'Vas a continuar la conversación por WhatsApp. DEPA no podrá revisar esos mensajes ni ayudarte con acuerdos realizados fuera de la plataforma. ¿Querés continuar?',
    );
    if (!continuar) event.preventDefault();
  }

  private loadAvailability(idPublication: number): void {
    this.availabilityLoading.set(true);
    this.availabilityApi
      .getByPublication(idPublication)
      .pipe(finalize(() => this.availabilityLoading.set(false)))
      .subscribe({
        next: (items) => {
          this.availability.set(items);
          const start = this.selectedStart();
          const end = this.selectedEnd();
          if (start && (!end || !isRentalRangeAvailable(start, end, items))) {
            this.selectedStart.set(null);
            this.selectedEnd.set(null);
          }
        },
        error: () => {
          this.availability.set([]);
          this.selectedStart.set(null);
          this.selectedEnd.set(null);
          this.bookingError.set(
            'No pudimos cargar la disponibilidad de esta propiedad. Volvé a intentar en unos instantes.',
          );
        },
      });
  }

  private parseDate(value: string): Date {
    return new Date(`${value.slice(0, 10)}T12:00:00`);
  }
}
