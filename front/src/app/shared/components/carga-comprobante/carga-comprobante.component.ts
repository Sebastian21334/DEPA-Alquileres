import { Component, input, model, signal } from '@angular/core';
import { LucideFileText, LucideUpload } from '@lucide/angular';

/** Mismo límite que el back. */
export const MAX_BYTES_COMPROBANTE = 5 * 1024 * 1024;
const TIPOS = ['application/pdf', 'image/jpeg', 'image/png'];
const EXTENSIONES = /\.(pdf|jpe?g|png)$/i;
let siguienteId = 0;

/**
 * Elige el comprobante de una transferencia (PDF, JPG o PNG de hasta 5 MB).
 * Valida antes de subir; el back vuelve a validar el contenido real del archivo.
 * Es la misma zona, con el mismo texto, en el reembolso y en el pago al anunciante.
 * También la usan las constancias de la solicitud de inmobiliaria (mismos tipos y tamaño).
 */
@Component({
  selector: 'app-carga-comprobante',
  imports: [LucideFileText, LucideUpload],
  template: `
    <span class="carga__etiqueta" [id]="id + '-etiqueta'">{{ etiqueta() }}@if (requerido()) { <span aria-hidden="true"> *</span> }</span>
    @if (archivo(); as elegido) {
      <div class="carga__elegido">
        <svg lucideFileText [size]="18" aria-hidden="true"></svg>
        <span>{{ elegido.name }} · {{ tamano(elegido.size) }}</span>
        <button type="button" [disabled]="deshabilitado()" (click)="quitar()">Quitar</button>
      </div>
    } @else {
      <label class="carga__zona" [class.carga__zona--arrastrando]="arrastrando()" [class.carga__zona--deshabilitada]="deshabilitado()"
        (dragover)="arrastrar($event)" (dragleave)="arrastrando.set(false)" (drop)="soltar($event, entrada)">
        <input #entrada class="carga__entrada" [id]="id" type="file" accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"
          [disabled]="deshabilitado()" [attr.aria-labelledby]="id + '-etiqueta ' + id + '-accion'"
          [attr.aria-describedby]="id + '-ayuda'" [attr.aria-invalid]="!!error()"
          (change)="elegir(entrada.files?.[0] ?? null, entrada)" />
        <svg lucideUpload [size]="20" aria-hidden="true"></svg>
        <span class="carga__accion" [id]="id + '-accion'">{{ accion() }}</span>
        <span class="carga__ayuda" [id]="id + '-ayuda'">PDF, JPG o PNG de hasta 5 MB</span>
      </label>
    }
    @if (error()) { <p class="carga__error" role="alert">{{ error() }}</p> }
  `,
  styleUrl: './carga-comprobante.component.scss',
})
export class CargaComprobanteComponent {
  readonly archivo = model<File | null>(null);
  readonly etiqueta = input('Comprobante de la transferencia');
  /** La solicitud de inmobiliaria usa la misma zona para sus constancias. */
  readonly accion = input('Elegí o arrastrá el comprobante');
  readonly requerido = input(true);
  readonly deshabilitado = input(false);
  protected readonly error = signal('');
  protected readonly arrastrando = signal(false);
  protected readonly id = `comprobante-${++siguienteId}`;

  protected arrastrar(evento: DragEvent): void {
    if (this.deshabilitado()) return;
    evento.preventDefault();
    this.arrastrando.set(true);
  }

  protected soltar(evento: DragEvent, entrada: HTMLInputElement): void {
    evento.preventDefault();
    this.arrastrando.set(false);
    if (this.deshabilitado()) return;
    this.elegir(evento.dataTransfer?.files?.[0] ?? null, entrada);
  }

  protected elegir(elegido: File | null, entrada: HTMLInputElement): void {
    this.error.set('');
    if (!elegido) {
      this.archivo.set(null);
      return;
    }
    if (!TIPOS.includes(elegido.type) && !EXTENSIONES.test(elegido.name)) {
      this.rechazar(entrada, 'El archivo tiene que ser un PDF, JPG o PNG.');
      return;
    }
    if (elegido.size > MAX_BYTES_COMPROBANTE) {
      this.rechazar(entrada, 'El archivo puede pesar hasta 5 MB.');
      return;
    }
    this.archivo.set(elegido);
  }

  protected quitar(): void {
    this.archivo.set(null);
    this.error.set('');
  }

  protected tamano(bytes: number): string {
    return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  private rechazar(entrada: HTMLInputElement, mensaje: string): void {
    // Sin limpiar el campo, volver a elegir el mismo archivo no dispararía el cambio.
    entrada.value = '';
    this.archivo.set(null);
    this.error.set(mensaje);
  }
}
