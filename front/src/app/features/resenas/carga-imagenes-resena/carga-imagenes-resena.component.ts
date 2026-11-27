import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { LucideUpload } from '@lucide/angular';
import {
  ACEPTAR_IMAGENES_RESENA,
  MAX_BYTES_IMAGEN_RESENA,
  MAX_IMAGENES_RESENA,
} from '../resenas.constantes';

export interface ImagenCargaResena {
  id: number;
  url: string;
  nombre: string;
  tamano: number | null;
  existente: boolean;
  marcada: boolean;
}

let siguienteId = 0;

/**
 * Zona de imágenes de una reseña con el mismo lenguaje visual que el
 * comprobante de "Registrar pago al anunciante": zona punteada, archivo
 * elegido y botón Quitar.
 */
@Component({
  selector: 'app-carga-imagenes-resena',
  standalone: true,
  imports: [LucideUpload],
  templateUrl: './carga-imagenes-resena.component.html',
  styleUrl: './carga-imagenes-resena.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CargaImagenesResenaComponent {
  readonly imagenes = input<ImagenCargaResena[]>([]);
  readonly max = input(MAX_IMAGENES_RESENA);
  readonly deshabilitado = input(false);

  readonly agregar = output<File[]>();
  readonly quitar = output<number>();

  protected readonly id = `resenas-imagenes-${++siguienteId}`;
  protected readonly aceptar = ACEPTAR_IMAGENES_RESENA;
  protected readonly maximoMb = MAX_BYTES_IMAGEN_RESENA / (1024 * 1024);
  protected readonly arrastrando = signal(false);
  protected readonly puedeAgregar = computed(() =>
    !this.deshabilitado() &&
    this.imagenes().filter((imagen) => !imagen.marcada).length < this.max(),
  );

  protected elegir(evento: Event): void {
    const entrada = evento.target as HTMLInputElement;
    const archivos = Array.from(entrada.files ?? []);
    entrada.value = '';
    if (archivos.length) this.agregar.emit(archivos);
  }

  protected arrastrar(evento: DragEvent): void {
    if (this.deshabilitado()) return;
    evento.preventDefault();
    this.arrastrando.set(true);
  }

  protected soltar(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrando.set(false);
    if (this.deshabilitado() || !this.puedeAgregar()) return;
    const archivos = Array.from(evento.dataTransfer?.files ?? []);
    if (archivos.length) this.agregar.emit(archivos);
  }

  protected tamano(bytes: number): string {
    return bytes < 1024 * 1024
      ? `${Math.max(1, Math.round(bytes / 1024))} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
}
