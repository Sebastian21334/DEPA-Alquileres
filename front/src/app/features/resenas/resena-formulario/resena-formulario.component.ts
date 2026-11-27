import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideX } from '@lucide/angular';
import { ToastService } from '../../../core/services/toast.service';
import { CargaImagenesResenaComponent, type ImagenCargaResena } from '../carga-imagenes-resena/carga-imagenes-resena.component';
import { EstrellasComponent } from '../estrellas/estrellas.component';
import {
  MAX_CARACTERES_COMENTARIO,
  MAX_IMAGENES_RESENA,
} from '../resenas.constantes';
import type { CrearResenaPayload, Resena } from '../resenas.model';

@Component({
  selector: 'app-resena-formulario',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    EstrellasComponent,
    CargaImagenesResenaComponent,
    LucideX,
  ],
  templateUrl: './resena-formulario.component.html',
  styleUrl: './resena-formulario.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResenaFormularioComponent {
  readonly miResena = input<Resena | null>(null);
  readonly editando = input(false);
  readonly enviando = input(false);
  readonly imagenes = input<ImagenCargaResena[]>([]);

  readonly guardar = output<CrearResenaPayload>();
  readonly cancelar = output<void>();
  readonly agregarArchivos = output<File[]>();
  readonly quitarImagen = output<number>();

  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly MAX_CARACTERES = MAX_CARACTERES_COMENTARIO;
  protected readonly MAX_IMAGENES = MAX_IMAGENES_RESENA;
  protected readonly comentarioActual = signal('');

  protected readonly formulario = this.fb.nonNullable.group({
    puntaje: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    comentario: ['', [Validators.required, Validators.maxLength(MAX_CARACTERES_COMENTARIO)]],
  });

  protected readonly etiquetaGuardar = computed(() =>
    this.enviando()
      ? 'Guardando…'
      : this.editando()
        ? 'Guardar cambios'
        : 'Publicar reseña',
  );

  constructor() {
    effect(() => {
      const resena = this.miResena();
      if (!this.editando() || !resena) return;
      this.formulario.setValue({
        puntaje: resena.puntaje,
        comentario: resena.comentario,
      });
    });
    this.formulario.controls.comentario.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((valor) => this.comentarioActual.set(valor ?? ''));
    this.comentarioActual.set(this.formulario.controls.comentario.value);
  }

  protected seleccionarPuntaje(puntaje: number): void {
    this.formulario.controls.puntaje.setValue(puntaje);
    this.formulario.controls.puntaje.markAsTouched();
  }

  protected enviar(): void {
    this.formulario.markAllAsTouched();
    const puntaje = this.formulario.controls.puntaje.value ?? 0;
    const comentario = this.formulario.controls.comentario.value.trim();
    if (puntaje < 1 || puntaje > 5) {
      this.toast.mostrar('Elegí una calificación de 1 a 5 estrellas.', 'advertencia');
      return;
    }
    if (!comentario) {
      this.toast.mostrar('Escribí un comentario para publicar la reseña.', 'advertencia');
      return;
    }
    if (comentario.length > MAX_CARACTERES_COMENTARIO) {
      this.toast.mostrar(`El comentario puede tener hasta ${MAX_CARACTERES_COMENTARIO} caracteres.`, 'advertencia');
      return;
    }
    if (this.formulario.invalid || this.enviando()) return;
    this.guardar.emit({ puntaje, comentario });
  }
}
