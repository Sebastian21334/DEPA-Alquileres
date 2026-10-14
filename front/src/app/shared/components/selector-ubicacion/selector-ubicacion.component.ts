import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Ciudad, Provincia } from '../../models/ubicacion.model';
import { UbicacionService } from '../../services/ubicacion.service';

export interface NombresUbicacion {
  provincia: string;
  localidad: string;
}

const normalizar = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-AR')
    .trim();
const MAX_SUGERENCIAS = 40;

@Component({
  selector: 'app-selector-ubicacion',
  standalone: true,
  templateUrl: './selector-ubicacion.component.html',
  styleUrl: './selector-ubicacion.component.scss',
})
export class SelectorUbicacionComponent {
  private readonly ubicaciones = inject(UbicacionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elemento = inject(ElementRef<HTMLElement>);
  private readonly reintento = signal(0);

  readonly idPrefix = input.required<string>();
  readonly provinciaId = input<number | null>(null);
  readonly localidadId = input<number | null>(null);
  readonly required = input(false);
  readonly disabled = input(false);
  readonly invalidProvincia = input(false);
  readonly invalidLocalidad = input(false);
  readonly compact = input(false);
  readonly provinciaChange = output<number | null>();
  readonly localidadChange = output<number | null>();
  readonly nombresChange = output<NombresUbicacion>();
  readonly touched = output<void>();

  protected readonly provincias = signal<Provincia[]>([]);
  protected readonly localidades = signal<Ciudad[]>([]);
  protected readonly cargandoProvincias = signal(false);
  protected readonly cargandoLocalidades = signal(false);
  protected readonly errorProvincias = signal('');
  protected readonly errorLocalidades = signal('');
  protected readonly abierto = signal(false);
  protected readonly texto = signal<string | null>(null);
  protected readonly indiceActivo = signal(-1);
  protected readonly nombreElegido = computed(
    () => this.localidades().find((item) => item.id === this.localidadId())?.nombre ?? '',
  );
  protected readonly valorInput = computed(() => this.texto() ?? this.nombreElegido());
  protected readonly bloqueado = computed(
    () =>
      this.disabled() ||
      !this.provinciaId() ||
      this.cargandoLocalidades() ||
      !!this.errorLocalidades(),
  );
  protected readonly coincidencias = computed(() => {
    const palabras = normalizar(this.texto() ?? '')
      .split(/\s+/)
      .filter(Boolean);
    return this.localidades().filter((item) =>
      palabras.every((palabra) => normalizar(item.nombre).includes(palabra)),
    );
  });
  protected readonly sugerencias = computed(() => this.coincidencias().slice(0, MAX_SUGERENCIAS));
  protected readonly placeholder = computed(() => {
    if (!this.provinciaId()) return 'Primero elegí una provincia';
    if (this.cargandoLocalidades()) return 'Cargando localidades…';
    return 'Escribí el nombre de la localidad';
  });

  constructor() {
    this.cargarProvincias();
    effect((onCleanup) => {
      const idProvincia = this.provinciaId();
      this.reintento();
      this.localidades.set([]);
      this.texto.set(null);
      this.abierto.set(false);
      this.indiceActivo.set(-1);
      this.errorLocalidades.set('');
      this.cargandoLocalidades.set(!!idProvincia);
      if (!idProvincia) return;
      const sub = this.ubicaciones.getCiudadesPorProvincia(idProvincia).subscribe({
        next: (localidades) => {
          this.localidades.set(
            [...localidades].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
          );
          this.cargandoLocalidades.set(false);
        },
        error: () => {
          this.errorLocalidades.set('No pudimos cargar las localidades.');
          this.cargandoLocalidades.set(false);
        },
      });
      onCleanup(() => sub.unsubscribe());
    });
    effect(() => {
      this.nombresChange.emit({
        provincia: this.provincias().find((item) => item.id === this.provinciaId())?.nombre ?? '',
        localidad: this.nombreElegido(),
      });
    });
  }

  protected cargarProvincias(): void {
    this.cargandoProvincias.set(true);
    this.errorProvincias.set('');
    this.ubicaciones
      .getProvincias()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (provincias) => {
          this.provincias.set(
            [...provincias].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
          );
          this.cargandoProvincias.set(false);
        },
        error: () => {
          this.errorProvincias.set('No pudimos cargar las provincias.');
          this.cargandoProvincias.set(false);
        },
      });
  }

  protected cambiarProvincia(event: Event): void {
    this.texto.set(null);
    this.provinciaChange.emit(Number((event.target as HTMLSelectElement).value) || null);
    this.localidadChange.emit(null);
  }

  protected escribir(event: Event): void {
    this.texto.set((event.target as HTMLInputElement).value);
    this.abierto.set(true);
    this.indiceActivo.set(-1);
    if (this.localidadId()) this.localidadChange.emit(null);
  }

  protected elegir(localidad: Ciudad): void {
    this.texto.set(null);
    this.abierto.set(false);
    this.indiceActivo.set(-1);
    this.localidadChange.emit(localidad.id);
    this.touched.emit();
  }

  protected limpiar(input: HTMLInputElement): void {
    this.texto.set('');
    this.localidadChange.emit(null);
    this.indiceActivo.set(-1);
    this.abierto.set(true);
    input.focus();
  }

  protected cerrar(): void {
    this.abierto.set(false);
    this.indiceActivo.set(-1);
    this.touched.emit();
  }

  protected teclado(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.cerrar();
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.abierto.set(true);
      const cantidad = this.sugerencias().length;
      if (!cantidad) return;
      const actual = this.indiceActivo();
      const siguiente =
        event.key === 'ArrowDown'
          ? (actual + 1) % cantidad
          : actual <= 0
            ? cantidad - 1
            : actual - 1;
      this.indiceActivo.set(siguiente);
      // El input conserva el foco; la lista desplaza la opción activa.
      requestAnimationFrame(() =>
        this.elemento.nativeElement
          .querySelector('[data-active="true"]')
          ?.scrollIntoView?.({ block: 'nearest' }),
      );
    } else if (event.key === 'Enter' && this.abierto()) {
      event.preventDefault();
      const opcion = this.sugerencias()[Math.max(0, this.indiceActivo())];
      if (opcion) this.elegir(opcion);
    }
  }

  protected reintentarLocalidades(): void {
    this.reintento.update((valor) => valor + 1);
  }
}
