import { SelectorUbicacionComponent } from '../../shared/components/selector-ubicacion/selector-ubicacion.component';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, map, of, switchMap } from 'rxjs';
import { ApiError } from '../../core/interceptors/api-error';
import { ListingService } from '../home/listing.service';
import {
  AvailabilityService,
  FechaDisponibleAdministracion,
} from '../../shared/services/availability.service';
import { PublicacionFormulario } from '../../shared/forms/publicacion-formulario';
import { AuthService } from '../../core/services/auth.service';
import { AvailabilityCalendarComponent } from '../../shared/components/availability-calendar/availability-calendar.component';
import { RentalDateRange } from '../../shared/utils/rental-dates';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import {
  LocationPickerComponent,
  UbicacionConfirmada,
} from '../../shared/components/location-picker/location-picker.component';

// Edición de una publicación propia (la ruta exige anuncianteGuard). El alta vive en
// CrearPublicacionComponent; los dos comparten PublicacionFormulario.
@Component({
  selector: 'app-publication-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AvailabilityCalendarComponent,
    SpinnerComponent,
    LocationPickerComponent,
    SelectorUbicacionComponent,
  ],
  providers: [PublicacionFormulario],
  templateUrl: './publication-form.component.html',
  styleUrl: './publication-form.component.scss',
})
export class PublicationFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly listings = inject(ListingService);
  private readonly availabilityApi = inject(AvailabilityService);
  private readonly auth = inject(AuthService);
  protected readonly formulario = inject(PublicacionFormulario);
  protected readonly form = this.formulario.form;

  private readonly publicationId = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly availability = signal<FechaDisponibleAdministracion[]>([]);
  protected readonly availabilityStart = signal<string | null>(null);
  protected readonly availabilityEnd = signal<string | null>(null);

  constructor() {
    this.formulario.cargarCatalogos().subscribe({
      error: (err: ApiError) =>
        this.error.set(`No pudimos cargar las opciones del formulario: ${err.message}`),
    });
    this.loadPublication(this.publicationId);
  }

  protected selectAvailabilityDate(range: RentalDateRange): void {
    this.availabilityStart.set(range.start);
    this.availabilityEnd.set(range.end);
  }

  protected toggleAvailability(item: FechaDisponibleAdministracion): void {
    if (item.reserva) {
      this.error.set('Ese día pertenece a una reserva confirmada y no puede modificarse.');
      return;
    }
    this.error.set('');
    this.availabilityApi.setAvailable(item.id, !item.disponible).subscribe({
      next: (updated) =>
        this.availability.update((items) =>
          items.map((current) =>
            current.id === updated.id ? { ...current, disponible: updated.disponible } : current,
          ),
        ),
      error: (err: ApiError) => this.error.set(err.message),
    });
  }

  protected submit(): void {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Revisá los campos obligatorios antes de continuar.');
      return;
    }
    if (!this.formulario.ubicacionConfirmada()) {
      this.error.set('Confirmá la ubicación exacta en el mapa antes de guardar.');
      document
        .getElementById('edit-location-map')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (
      this.formulario.esTemporaria() &&
      !this.availability().length &&
      (!this.availabilityStart() || !this.availabilityEnd())
    ) {
      this.error.set('La publicación temporal debe tener al menos un rango de días disponibles.');
      return;
    }

    this.saving.set(true);
    this.listings
      .update(this.publicationId, this.formulario.payload())
      .pipe(
        switchMap((publication) => {
          const start = this.availabilityStart();
          const end = this.availabilityEnd();
          if (this.formulario.esTemporaria() && start && end) {
            return this.availabilityApi
              .addRange(publication.id, start, end)
              .pipe(map(() => publication));
          }
          return of(publication);
        }),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: (publication) => this.router.navigate(['/publicaciones', publication.id]),
        error: (err: ApiError) => this.error.set(err.message),
      });
  }

  protected confirmLocation(location: UbicacionConfirmada): void {
    this.formulario.confirmarUbicacion(location);
    if (this.error().startsWith('Confirmá la ubicación')) this.error.set('');
  }

  private loadPublication(id: number): void {
    this.listings
      .getById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (item) => {
          if (item.anunciante?.idUsuario !== this.auth.currentUser()?.sub) {
            this.error.set('No tenés permiso para modificar esta publicación.');
            this.form.disable();
            return;
          }
          this.formulario.cargar(item);
          this.availabilityApi.getForAdministration(id).subscribe({
            next: (dates) => this.availability.set(dates),
          });
        },
        error: () => this.error.set('No se pudo cargar la publicación que querés modificar.'),
      });
  }
}
