import { Component, input, output, signal } from '@angular/core';
import { LucideImagePlus } from '@lucide/angular';
import { MAX_IMAGENES_PUBLICACION, TIPOS_IMAGEN_PUBLICACION } from '../../utils/imagenes-publicacion';

/**
 * Zona para elegir o arrastrar las fotos de una publicación, igual en el alta y en la edición.
 * Solo entrega los archivos: cada pantalla los filtra con `filtrarImagenesPublicacion` y decide cuándo subirlos.
 */
@Component({
  selector: 'app-carga-fotos',
  imports: [LucideImagePlus],
  template: `
    <label class="drop" [class.is-dragging]="arrastrando()" [class.drop--error]="error()" [class.drop--deshabilitada]="deshabilitado()"
      (dragover)="arrastrar($event)" (dragleave)="arrastrando.set(false)" (drop)="soltar($event)">
      <input type="file" multiple [accept]="tipos" [disabled]="deshabilitado()" (change)="elegir($event)" />
      <span class="drop__icon"><svg lucideImagePlus [size]="30" aria-hidden="true"></svg></span>
      <strong>Mostrá lo mejor de tu propiedad</strong>
      <span>Arrastrá tus fotos acá o elegilas desde tu dispositivo.</span>
      <span>JPG, PNG, WEBP o HEIC, hasta 10 MB cada una · máximo {{ maximo }}</span>
      <span class="drop__btn">Seleccionar fotos</span>
    </label>
  `,
  styleUrl: './carga-fotos.component.scss',
})
export class CargaFotosComponent {
  readonly deshabilitado = input(false);
  /** Marca la zona cuando el formulario exige al menos una foto. */
  readonly error = input(false);
  readonly elegidas = output<File[]>();
  protected readonly arrastrando = signal(false);
  protected readonly tipos = TIPOS_IMAGEN_PUBLICACION.join(',');
  protected readonly maximo = MAX_IMAGENES_PUBLICACION;

  protected arrastrar(evento: DragEvent): void {
    evento.preventDefault();
    if (!this.deshabilitado()) this.arrastrando.set(true);
  }

  protected soltar(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrando.set(false);
    if (!this.deshabilitado()) this.emitir(evento.dataTransfer?.files ?? null);
  }

  protected elegir(evento: Event): void {
    const entrada = evento.target as HTMLInputElement;
    this.emitir(entrada.files);
    // Sin limpiar el campo, volver a elegir la misma foto no dispararía el cambio.
    entrada.value = '';
  }

  private emitir(lista: FileList | null): void {
    const archivos = Array.from(lista ?? []);
    if (archivos.length) this.elegidas.emit(archivos);
  }
}
