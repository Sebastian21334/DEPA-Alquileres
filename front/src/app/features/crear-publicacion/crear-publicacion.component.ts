import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { concatMap, forkJoin, from, of, toArray, catchError } from 'rxjs';
import { LucideImagePlus, LucideX } from '@lucide/angular';
import { CatalogoService } from '../../shared/services/catalogo.service';
import { UbicacionService } from '../../shared/services/ubicacion.service';
import { GestionPublicacionesService } from '../../shared/services/gestion-publicaciones.service';
import { Modalidad, TipoMoneda, TipoPropiedad } from '../../shared/models/catalogo.model';
import { Ciudad, Provincia } from '../../shared/models/ubicacion.model';
import { RevealDirective } from '../../shared/directives/reveal.directive';

const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_IMAGEN = 10 * 1024 * 1024;
const MAX_IMAGENES = 15;

interface ImagenSeleccionada {
  archivo: File;
  preview: string;
}

// Alta de publicación para anunciantes verificados: POST /publicaciones con los
// datos del inmueble y luego POST /imagenes/publicacion/:id por cada foto.
@Component({
  selector: 'app-crear-publicacion',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, RevealDirective, LucideImagePlus, LucideX],
  templateUrl: './crear-publicacion.component.html',
  styleUrl: './crear-publicacion.component.scss',
})
export class CrearPublicacionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly catalogos = inject(CatalogoService);
  private readonly ubicacion = inject(UbicacionService);
  private readonly gestion = inject(GestionPublicacionesService);

  protected readonly tiposPropiedad = signal<TipoPropiedad[]>([]);
  protected readonly modalidades = signal<Modalidad[]>([]);
  protected readonly monedas = signal<TipoMoneda[]>([]);
  protected readonly provincias = signal<Provincia[]>([]);
  protected readonly ciudades = signal<Ciudad[]>([]);
  protected readonly cargandoCiudades = signal(true);
  private readonly provinciaElegida = signal(0);

  /** Opciones del select de ciudad: agrupadas por provincia, o solo las de la provincia elegida. */
  protected readonly gruposCiudades = computed(() => {
    const idProvincia = this.provinciaElegida();
    return this.provincias()
      .filter((p) => !idProvincia || p.id === idProvincia)
      .map((provincia) => ({
        provincia,
        ciudades: this.ciudades().filter((c) => c.provincia?.id === provincia.id),
      }))
      .filter((g) => g.ciudades.length);
  });
  protected readonly provinciaSinCiudades = computed(
    () => !!this.provinciaElegida() && !this.cargandoCiudades() && !this.gruposCiudades().length,
  );
  protected readonly imagenes = signal<ImagenSeleccionada[]>([]);
  protected readonly avisoImagenes = signal('');
  protected readonly enviando = signal(false);
  protected readonly progreso = signal('');
  protected readonly error = signal('');

  protected readonly form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(255)]],
    descripcion: ['', [Validators.required, Validators.maxLength(255)]],
    idTipoPropiedad: [0, Validators.min(1)],
    idModalidad: [0, Validators.min(1)],
    idTipoMoneda: [0, Validators.min(1)],
    precio: [null as number | null, [Validators.required, Validators.min(1)]],
    idProvincia: [0, Validators.min(1)],
    idCiudad: [0, Validators.min(1)],
    direccion: ['', [Validators.required, Validators.maxLength(255)]],
    cantidad_ambientes: [null as number | null, [Validators.required, Validators.min(1)]],
    superficie: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    forkJoin({
      tipos: this.catalogos.getTiposPropiedad(),
      modalidades: this.catalogos.getModalidades(),
      monedas: this.catalogos.getTiposMoneda(),
      provincias: this.ubicacion.getProvincias(),
    }).subscribe({
      next: ({ tipos, modalidades, monedas, provincias }) => {
        this.tiposPropiedad.set(tipos);
        this.modalidades.set(modalidades);
        this.monedas.set(monedas);
        this.provincias.set(provincias);
      },
      error: (err: Error) => this.error.set(`No pudimos cargar las opciones del formulario: ${err.message}`),
    });

    // Se traen todas las ciudades de una vez (con su provincia) en lugar de pedirlas
    // al cambiar de provincia: así el select de ciudad nunca queda bloqueado ni
    // expuesto a respuestas que llegan fuera de orden.
    this.ubicacion.getTodasCiudades().subscribe({
      next: (ciudades) => this.ciudades.set(ciudades),
      error: () => this.cargandoCiudades.set(false),
      // Sin provincias el observable completa sin emitir, por eso se corta la carga acá.
      complete: () => this.cargandoCiudades.set(false),
    });

    const { idProvincia, idCiudad } = this.form.controls;
    idProvincia.valueChanges.pipe(takeUntilDestroyed()).subscribe((id) => {
      this.provinciaElegida.set(id);
      // Si la ciudad elegida no pertenece a la nueva provincia, se limpia.
      const ciudad = this.ciudades().find((c) => c.id === idCiudad.value);
      if (ciudad && ciudad.provincia?.id !== id) idCiudad.setValue(0);
    });
    idCiudad.valueChanges.pipe(takeUntilDestroyed()).subscribe((id) => {
      // Elegir una ciudad completa sola la provincia.
      const provincia = this.ciudades().find((c) => c.id === id)?.provincia?.id;
      if (provincia && provincia !== idProvincia.value) idProvincia.setValue(provincia);
    });

    inject(DestroyRef).onDestroy(() => this.imagenes().forEach((img) => URL.revokeObjectURL(img.preview)));
  }

  protected invalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
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
    if (descartadas) avisos.push(`${descartadas} archivo(s) descartado(s): solo imágenes JPG, PNG, WEBP o HEIC de hasta 10 MB.`);
    if (total.length > MAX_IMAGENES) avisos.push(`Máximo ${MAX_IMAGENES} imágenes por publicación.`);
    this.avisoImagenes.set(avisos.join(' '));
  }

  protected quitarImagen(index: number): void {
    const img = this.imagenes()[index];
    URL.revokeObjectURL(img.preview);
    this.imagenes.update((lista) => lista.filter((_, i) => i !== index));
  }

  protected publicar(): void {
    if (this.enviando()) return;
    // Regla de negocio: no se puede publicar sin al menos una imagen.
    const sinFotos = this.imagenes().length === 0;
    this.faltanFotos.set(sinFotos);
    if (this.form.invalid || sinFotos) {
      this.form.markAllAsTouched();
      this.error.set(
        sinFotos && this.form.valid
          ? 'Agregá al menos una foto de la propiedad para poder publicarla.'
          : 'Revisá los campos marcados.',
      );
      if (sinFotos) document.getElementById('fotos')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    this.enviando.set(true);
    this.error.set('');
    this.progreso.set('Creando publicación…');

    const v = this.form.getRawValue();
    const dto = {
      ...v,
      titulo: v.titulo.trim(),
      descripcion: v.descripcion.trim(),
      direccion: v.direccion.trim(),
      precio: Number(v.precio),
      cantidad_ambientes: Number(v.cantidad_ambientes),
      superficie: Number(v.superficie),
    };

    const imagenes = this.imagenes();
    this.gestion
      .crear(dto)
      .pipe(
        // Las fotos se suben de a una para no saturar al backend (Sharp + Azure).
        concatMap((publicacion) =>
          from(imagenes).pipe(
            concatMap((img, i) => {
              this.progreso.set(`Subiendo imagen ${i + 1} de ${imagenes.length}…`);
              return this.gestion.subirImagen(publicacion.id, img.archivo).pipe(
                catchError(() => of(null)),
              );
            }),
            toArray(),
            concatMap((subidas) => of({ publicacion, fallidas: subidas.filter((s) => s === null).length })),
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
        error: (err: Error) => {
          this.enviando.set(false);
          this.progreso.set('');
          this.error.set(err.message);
        },
      });
  }
}
