import { SelectorUbicacionComponent } from '../../shared/components/selector-ubicacion/selector-ubicacion.component';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { concatMap, from, of, toArray, catchError } from 'rxjs';
import { LucideImagePlus, LucideX } from '@lucide/angular';
import { ApiError } from '../../core/interceptors/api-error';
import { GestionPublicacionesService } from '../../shared/services/gestion-publicaciones.service';
import { AvailabilityService } from '../../shared/services/availability.service';
import { PublicacionFormulario } from '../../shared/forms/publicacion-formulario';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { AvailabilityCalendarComponent } from '../../shared/components/availability-calendar/availability-calendar.component';
import { RentalDateRange } from '../../shared/utils/rental-dates';
import {
  LocationPickerComponent,
  UbicacionConfirmada,
} from '../../shared/components/location-picker/location-picker.component';

const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_IMAGEN = 10 * 1024 * 1024;
const MAX_IMAGENES = 15;

interface ImagenSeleccionada {
  archivo: File;
  preview: string;
}

// Alta de publicación para anunciantes verificados: POST /publicaciones con los
// datos del inmueble y luego POST /imagenes/publicacion/:id por cada foto. Los
// datos del inmueble usan el mismo PublicacionFormulario que la edición.
@Component({
  selector: 'app-crear-publicacion',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    RevealDirective,
    AvailabilityCalendarComponent,
    LocationPickerComponent,
    SelectorUbicacionComponent,
    LucideImagePlus,
    LucideX,
  ],
  providers: [PublicacionFormulario],
  templateUrl: './crear-publicacion.component.html',
  styleUrl: './crear-publicacion.component.scss',
})
export class CrearPublicacionComponent {
  private readonly router = inject(Router);
  private readonly gestion = inject(GestionPublicacionesService);
  private readonly availability = inject(AvailabilityService);
  protected readonly formulario = inject(PublicacionFormulario);
  protected readonly form = this.formulario.form;

  protected readonly disponibilidadInicio = signal<string | null>(null);
  protected readonly disponibilidadFin = signal<string | null>(null);
  protected readonly imagenes = signal<ImagenSeleccionada[]>([]);
  protected readonly avisoImagenes = signal('');
  protected readonly enviando = signal(false);
  protected readonly progreso = signal('');
  protected readonly error = signal('');

  constructor() {
    this.formulario.cargarCatalogos().subscribe({
      error: (err: ApiError) =>
        this.error.set(`No pudimos cargar las opciones del formulario: ${err.message}`),
    });

    this.form.controls.idModalidad.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      if (!this.formulario.esTemporaria()) {
        this.disponibilidadInicio.set(null);
        this.disponibilidadFin.set(null);
      }
    });

    inject(DestroyRef).onDestroy(() =>
      this.imagenes().forEach((img) => URL.revokeObjectURL(img.preview)),
    );
  }

  protected readonly arrastrando = signal(false);
  protected readonly faltanFotos = signal(false);

  protected agregarDesdeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.agregarImagenes(input.files);
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando.set(true);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando.set(false);
    this.agregarImagenes(event.dataTransfer?.files ?? null);
  }

  private agregarImagenes(files: FileList | null): void {
    const nuevas: ImagenSeleccionada[] = [];
    let descartadas = 0;

    for (const archivo of Array.from(files ?? [])) {
      if (!TIPOS_IMAGEN.includes(archivo.type) || archivo.size > MAX_IMAGEN) {
        descartadas++;
        continue;
      }
      nuevas.push({ archivo, preview: URL.createObjectURL(archivo) });
    }

    const total = [...this.imagenes(), ...nuevas];
    total.slice(MAX_IMAGENES).forEach((img) => URL.revokeObjectURL(img.preview));
    this.imagenes.set(total.slice(0, MAX_IMAGENES));
    if (this.imagenes().length) {
      this.faltanFotos.set(false);
      if (this.error().startsWith('Agregá al menos una foto')) this.error.set('');
    }

    const avisos = [];
    if (descartadas)
      avisos.push(
        `${descartadas} archivo(s) descartado(s): solo imágenes JPG, PNG, WEBP o HEIC de hasta 10 MB.`,
      );
    if (total.length > MAX_IMAGENES)
      avisos.push(`Máximo ${MAX_IMAGENES} imágenes por publicación.`);
    this.avisoImagenes.set(avisos.join(' '));
  }

  protected quitarImagen(index: number): void {
    const img = this.imagenes()[index];
    URL.revokeObjectURL(img.preview);
    this.imagenes.update((lista) => lista.filter((_, i) => i !== index));
  }

  protected seleccionarDisponibilidad(range: RentalDateRange): void {
    this.disponibilidadInicio.set(range.start);
    this.disponibilidadFin.set(range.end);
    if (this.error().startsWith('Elegí el período')) this.error.set('');
  }

  protected confirmarUbicacion(ubicacion: UbicacionConfirmada): void {
    this.formulario.confirmarUbicacion(ubicacion);
    if (this.error().startsWith('Confirmá la ubicación')) this.error.set('');
  }

  protected publicar(): void {
    if (this.enviando()) return;
    const esTemporaria = this.formulario.esTemporaria();
    // Regla de negocio: no se puede publicar sin al menos una imagen.
    const sinFotos = this.imagenes().length === 0;
    this.faltanFotos.set(sinFotos);
    const sinDisponibilidad =
      esTemporaria && (!this.disponibilidadInicio() || !this.disponibilidadFin());
    const sinUbicacion = !this.formulario.ubicacionConfirmada();
    if (this.form.invalid || sinFotos || sinDisponibilidad || sinUbicacion) {
      this.form.markAllAsTouched();
      this.error.set(
        sinUbicacion && this.form.valid && !sinFotos && !sinDisponibilidad
          ? 'Confirmá la ubicación exacta en el mapa antes de publicar.'
          : sinDisponibilidad && this.form.valid && !sinFotos
            ? 'Elegí el período de días disponibles para el alquiler temporal.'
            : sinFotos && this.form.valid
              ? 'Agregá al menos una foto de la propiedad para poder publicarla.'
              : 'Revisá los campos marcados.',
      );
      const destino = sinUbicacion
        ? 'ubicacion-mapa'
        : sinDisponibilidad
          ? 'disponibilidad'
          : sinFotos
            ? 'fotos'
            : null;
      if (destino)
        document.getElementById(destino)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    this.enviando.set(true);
    this.error.set('');
    this.progreso.set('Creando publicación…');

    const imagenes = this.imagenes();
    this.gestion
      .crear(this.formulario.payload())
      .pipe(
        // Las fotos se suben de a una para no saturar al backend (Sharp + Azure).
        concatMap((publicacion) =>
          (esTemporaria
            ? (this.progreso.set('Guardando días disponibles…'),
              this.availability.addRange(
                publicacion.id,
                this.disponibilidadInicio()!,
                this.disponibilidadFin()!,
              ))
            : of([])
          ).pipe(
            concatMap(() =>
              from(imagenes).pipe(
                concatMap((img, i) => {
                  this.progreso.set(`Subiendo imagen ${i + 1} de ${imagenes.length}…`);
                  return this.gestion
                    .subirImagen(publicacion.id, img.archivo)
                    .pipe(catchError(() => of(null)));
                }),
                toArray(),
                concatMap((subidas) =>
                  of({ publicacion, fallidas: subidas.filter((s) => s === null).length }),
                ),
              ),
            ),
          ),
        ),
      )
      .subscribe({
        next: ({ publicacion, fallidas }) => {
          this.enviando.set(false);
          if (fallidas) {
            // La publicación ya existe: se lleva al anunciante a administrarla para reintentar.
            const ninguna = fallidas === imagenes.length;
            this.router.navigate(['/mis-publicaciones'], {
              queryParams: {
                aviso: ninguna
                  ? `No se pudo subir ninguna foto de "${publicacion.titulo}", así que todavía no está publicada. Agregale al menos una imagen para activarla.`
                  : `${fallidas} imagen(es) no se pudieron subir a "${publicacion.titulo}".`,
              },
            });
          } else {
            this.router.navigate(['/publicaciones', publicacion.id]);
          }
        },
        error: (err: ApiError) => {
          this.enviando.set(false);
          this.progreso.set('');
          this.error.set(err.message);
        },
      });
  }
}
