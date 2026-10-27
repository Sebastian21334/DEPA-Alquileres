import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable, forkJoin, map } from 'rxjs';
import { CatalogoService } from '../services/catalogo.service';
import {
  Modalidad,
  TipoMoneda,
  TipoPropiedad,
  admiteReservasPorFecha,
} from '../models/catalogo.model';
import { Publicacion, PublicacionPayload } from '../models/publicacion.model';
import { NombresUbicacion } from '../components/selector-ubicacion/selector-ubicacion.component';
import { UbicacionConfirmada } from '../components/location-picker/location-picker.component';

type CampoPublicacion = keyof PublicacionFormulario['form']['controls'];

// Formulario de una publicación, único para el alta (CrearPublicacionComponent) y la
// edición (PublicationFormComponent). Cada pantalla lo declara en sus `providers`, así
// que vive lo mismo que el componente. Las validaciones replican los DTO del back
// (crear-publicacion.dto.ts y actualizar-publicacion.dto.ts).
@Injectable()
export class PublicacionFormulario {
  private readonly catalogos = inject(CatalogoService);

  readonly tiposPropiedad = signal<TipoPropiedad[]>([]);
  readonly modalidades = signal<Modalidad[]>([]);
  readonly monedas = signal<TipoMoneda[]>([]);
  readonly provincia = signal<number | null>(null);
  readonly ciudad = signal<number | null>(null);
  readonly nombresUbicacion = signal<NombresUbicacion>({ provincia: '', localidad: '' });
  readonly latitud = signal<number | null>(null);
  readonly longitud = signal<number | null>(null);
  private readonly idModalidad = signal<number | null>(null);

  readonly nombreProvincia = computed(() => this.nombresUbicacion().provincia);
  readonly nombreCiudad = computed(() => this.nombresUbicacion().localidad);
  readonly ubicacionConfirmada = computed(() => this.latitud() !== null && this.longitud() !== null);
  readonly esTemporaria = computed(() =>
    admiteReservasPorFecha(this.modalidades().find((item) => item.id === this.idModalidad())),
  );

  readonly form = inject(FormBuilder).nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(255)]],
    descripcion: ['', [Validators.required, Validators.maxLength(255)]],
    idTipoPropiedad: [null as number | null, Validators.required],
    idModalidad: [null as number | null, Validators.required],
    idTipoMoneda: [null as number | null, Validators.required],
    precio: [null as number | null, [Validators.required, Validators.min(1)]],
    idProvincia: [null as number | null, Validators.required],
    idCiudad: [null as number | null, Validators.required],
    direccion: ['', [Validators.required, Validators.maxLength(255)]],
    cantidad_ambientes: [null as number | null, [Validators.required, Validators.min(1)]],
    superficie: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    const { idModalidad, idProvincia, idCiudad, direccion } = this.form.controls;
    idModalidad.valueChanges.pipe(takeUntilDestroyed()).subscribe((id) => this.idModalidad.set(id));
    idProvincia.valueChanges.pipe(takeUntilDestroyed()).subscribe((id) => {
      this.provincia.set(id);
      idCiudad.setValue(null);
      this.limpiarUbicacion();
    });
    idCiudad.valueChanges.pipe(takeUntilDestroyed()).subscribe((id) => {
      this.ciudad.set(id);
      this.limpiarUbicacion();
    });
    // Cambiar la dirección invalida el punto confirmado en el mapa.
    direccion.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.limpiarUbicacion());
  }

  /** Trae los catálogos que alimentan los selects; cada pantalla decide cómo mostrar el error. */
  cargarCatalogos(): Observable<void> {
    return forkJoin({
      tipos: this.catalogos.getTiposPropiedad(),
      modalidades: this.catalogos.getModalidades(),
      monedas: this.catalogos.getTiposMoneda(),
    }).pipe(
      map(({ tipos, modalidades, monedas }) => {
        this.tiposPropiedad.set(tipos);
        this.modalidades.set(modalidades);
        this.monedas.set(monedas);
      }),
    );
  }

  /** Completa el formulario con una publicación existente (modo edición). */
  cargar(publicacion: Publicacion): void {
    // Sin emitir eventos: si no, el cambio de provincia borraría la ciudad y la ubicación.
    this.form.patchValue(
      {
        titulo: publicacion.titulo,
        descripcion: publicacion.descripcion,
        precio: Number(publicacion.precio),
        direccion: publicacion.direccion,
        cantidad_ambientes: publicacion.cantidad_ambientes,
        superficie: Number(publicacion.superficie),
        idTipoMoneda: publicacion.tipoMoneda?.id ?? null,
        idModalidad: publicacion.modalidad?.id ?? null,
        idProvincia: publicacion.provincia?.id ?? null,
        idCiudad: publicacion.ciudad?.id ?? null,
        idTipoPropiedad: publicacion.tipoPropiedad?.id ?? null,
      },
      { emitEvent: false },
    );
    this.idModalidad.set(publicacion.modalidad?.id ?? null);
    this.provincia.set(publicacion.provincia?.id ?? null);
    this.ciudad.set(publicacion.ciudad?.id ?? null);
    this.latitud.set(publicacion.latitud == null ? null : Number(publicacion.latitud));
    this.longitud.set(publicacion.longitud == null ? null : Number(publicacion.longitud));
  }

  seleccionarProvincia(id: number | null): void {
    this.form.controls.idProvincia.setValue(id);
    this.form.controls.idProvincia.markAsTouched();
  }

  seleccionarLocalidad(id: number | null): void {
    this.form.controls.idCiudad.setValue(id);
  }

  confirmarUbicacion(ubicacion: UbicacionConfirmada): void {
    this.latitud.set(ubicacion.latitud);
    this.longitud.set(ubicacion.longitud);
  }

  invalido(campo: CampoPublicacion): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }

  /** Arma el cuerpo de POST/PATCH /publicaciones. Requiere un formulario válido y la ubicación confirmada. */
  payload(): PublicacionPayload {
    const v = this.form.getRawValue();
    return {
      titulo: v.titulo.trim(),
      descripcion: v.descripcion.trim(),
      precio: Number(v.precio),
      direccion: v.direccion.trim(),
      latitud: this.latitud()!,
      longitud: this.longitud()!,
      cantidad_ambientes: Number(v.cantidad_ambientes),
      superficie: Number(v.superficie),
      idTipoMoneda: Number(v.idTipoMoneda),
      idModalidad: Number(v.idModalidad),
      idProvincia: Number(v.idProvincia),
      idCiudad: Number(v.idCiudad),
      idTipoPropiedad: Number(v.idTipoPropiedad),
    };
  }

  private limpiarUbicacion(): void {
    this.latitud.set(null);
    this.longitud.set(null);
  }
}
