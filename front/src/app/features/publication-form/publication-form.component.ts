import { EsqueletoListaComponent } from '../../shared/components/esqueleto-lista/esqueleto-lista.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { SelectorUbicacionComponent } from '../../shared/components/selector-ubicacion/selector-ubicacion.component';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { concatMap, finalize, from, map, of, switchMap } from 'rxjs';
import { GestionPublicacionesService } from '../../shared/services/gestion-publicaciones.service';
import { Imagen } from '../../shared/models/imagen.model';
import { GaleriaImagenesComponent } from '../../shared/components/galeria-imagenes/galeria-imagenes.component';
import { CargaFotosComponent } from '../../shared/components/carga-fotos/carga-fotos.component';
import { moverImagen } from '../../shared/utils/orden-imagenes';
import { filtrarImagenesPublicacion } from '../../shared/utils/imagenes-publicacion';
import { ApiError } from '../../core/interceptors/api-error';
import { ListingService } from '../publicaciones/listing.service';
import {
  AvailabilityService,
  FechaDisponibleAdministracion,
} from '../../shared/services/availability.service';
import { PublicacionFormulario } from '../../shared/forms/publicacion-formulario';
import { AuthService } from '../../core/services/auth.service';
import { AvailabilityCalendarComponent } from '../../shared/components/availability-calendar/availability-calendar.component';
import { RentalDateRange } from '../../shared/utils/rental-dates';
import { SoloNumerosDirective } from '../../shared/directives/solo-numeros.directive';
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
    SoloNumerosDirective,
    AvailabilityCalendarComponent,
    EsqueletoListaComponent,
    RevealDirective,
    LocationPickerComponent,
    SelectorUbicacionComponent,
    CargaFotosComponent,
    GaleriaImagenesComponent,
  ],
  providers: [PublicacionFormulario],
  templateUrl: './publication-form.component.html',
  styleUrl: './publication-form.component.scss',
})
export class PublicationFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly listings = inject(ListingService);
  private readonly gestion = inject(GestionPublicacionesService);
  private readonly availabilityApi = inject(AvailabilityService);
  private readonly auth = inject(AuthService);
  protected readonly formulario = inject(PublicacionFormulario);
  protected readonly form = this.formulario.form;

  private readonly publicationId = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly imagesBusy = signal(false);
  protected readonly imageOrderSaving = signal(false);
  protected readonly images = signal<Imagen[]>([]);
  protected readonly imageError = signal('');
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
    if (this.saving() || this.imagesBusy() || this.imageOrderSaving() || this.form.disabled) return;
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

  protected reorderImages({ desde, hasta }: { desde: number; hasta: number }): void {
    if (this.saving() || this.imagesBusy() || this.form.disabled) return;
    const anteriores = this.images();
    const imagenes = moverImagen(anteriores, desde, hasta);
    if (imagenes.every((imagen, index) => imagen.id === anteriores[index]?.id)) return;
    this.images.set(imagenes);
    this.imageError.set('');
    if (this.imageOrderSaving()) return;
    this.imageOrderSaving.set(true);
    this.saveImageOrder(anteriores);
  }

  private saveImageOrder(confirmadas: Imagen[]): void {
    const ids = this.images().map(imagen => imagen.id);
    // Una sola escritura a la vez; si hubo más movimientos, después se envía el último orden.
    this.gestion.ordenarImagenes(this.publicationId, ids).subscribe({
      next: (ordenadas) => {
        if (this.images().some((imagen, index) => imagen.id !== ids[index])) {
          this.saveImageOrder(ordenadas);
          return;
        }
        this.images.set(ordenadas);
        this.imageOrderSaving.set(false);
      },
      error: (err: ApiError) => {
        this.images.set(confirmadas);
        this.imageOrderSaving.set(false);
        this.imageError.set(`No se pudo guardar el orden. Restauramos el último orden confirmado. ${err.message}`);
      },
    });
  }

  protected uploadImages(archivos: File[]): void {
    if (this.saving() || this.imagesBusy() || this.imageOrderSaving() || this.form.disabled) return;
    const { aceptadas, aviso } = filtrarImagenesPublicacion(archivos, this.images().length);
    this.imageError.set(aviso);
    if (!aceptadas.length) return;
    this.imagesBusy.set(true);
    from(aceptadas).pipe(
      concatMap((archivo) => this.gestion.subirImagen(this.publicationId, archivo)),
      finalize(() => this.imagesBusy.set(false)),
    ).subscribe({
      next: (imagen) => this.images.update((lista) => [...lista, imagen]),
      error: (err: ApiError) => this.imageError.set(err.message),
    });
  }

  protected removeImage(index: number): void {
    if (this.saving() || this.imagesBusy() || this.imageOrderSaving() || this.form.disabled || this.images().length <= 1) return;
    const imagen = this.images()[index];
    if (!imagen) return;
    this.imagesBusy.set(true);
    this.imageError.set('');
    this.gestion.eliminarImagen(imagen.id).pipe(
      finalize(() => this.imagesBusy.set(false)),
    ).subscribe({
      next: () => this.images.update((lista) => lista.filter((item) => item.id !== imagen.id)),
      error: (err: ApiError) => this.imageError.set(err.message),
    });
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
          this.images.set(item.imagenes ?? []);
          this.availabilityApi.getForAdministration(id).subscribe({
            next: (dates) => this.availability.set(dates),
          });
        },
        error: () => this.error.set('No se pudo cargar la publicación que querés modificar.'),
      });
  }
}
