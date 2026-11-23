import { Component, input, model, signal } from '@angular/core';

/** Mismo límite que el back (T04). */
export const MAX_BYTES_COMPROBANTE = 5 * 1024 * 1024;
const TIPOS = ['application/pdf', 'image/jpeg', 'image/png'];
const EXTENSIONES = /\.(pdf|jpe?g|png)$/i;
let siguienteId = 0;

/**
 * T04: elige el comprobante de una transferencia (PDF, JPG o PNG de hasta 5 MB).
 * Valida antes de subir; el back vuelve a validar el contenido real del archivo.
 */
@Component({
  selector: 'app-carga-comprobante',
  template: `
    <label class="carga" [for]="id">
      <span class="carga__etiqueta">{{ etiqueta() }}@if (requerido()) { <span aria-hidden="true"> *</span> }</span>
      <input #entrada [id]="id" type="file" accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"
        [disabled]="deshabilitado()" [attr.aria-describedby]="id + '-ayuda'" [attr.aria-invalid]="!!error()"
        (change)="elegir(entrada)" />
    </label>
    <p class="carga__ayuda" [id]="id + '-ayuda'">PDF, JPG o PNG de hasta 5 MB.</p>
    @if (archivo(); as elegido) {
      <div class="carga__elegido">
        <span>{{ elegido.name }} · {{ tamano(elegido.size) }}</span>
        <button type="button" [disabled]="deshabilitado()" (click)="quitar(entrada)">Quitar</button>
      </div>
    }
    @if (error()) { <p class="carga__error" role="alert">{{ error() }}</p> }
  `,
  styles: `
    :host { display: grid; gap: .35rem; }
    .carga { display: grid; gap: .35rem; }
    .carga__etiqueta { font-weight: 700; }
    .carga__ayuda { margin: 0; color: #52607a; font-size: .82rem; }
    .carga__elegido { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; overflow-wrap: anywhere; font-size: .9rem; }
    .carga__elegido button { padding: .25rem .6rem; border: 1px solid #c8d2e0; border-radius: .4rem; background: #fff; cursor: pointer; }
    .carga__error { margin: 0; color: #8a1c13; font-size: .85rem; font-weight: 650; }
  `,
})
export class CargaComprobanteComponent {
  readonly archivo = model<File | null>(null);
  readonly etiqueta = input('Comprobante de la transferencia');
  readonly requerido = input(true);
  readonly deshabilitado = input(false);
  protected readonly error = signal('');
  protected readonly id = `comprobante-${++siguienteId}`;

  protected elegir(entrada: HTMLInputElement): void {
    const elegido = entrada.files?.[0] ?? null;
    this.error.set('');
    if (!elegido) {
      this.archivo.set(null);
      return;
    }
    if (!TIPOS.includes(elegido.type) && !EXTENSIONES.test(elegido.name)) {
      this.rechazar(entrada, 'El comprobante tiene que ser un PDF, JPG o PNG.');
      return;
    }
    if (elegido.size > MAX_BYTES_COMPROBANTE) {
      this.rechazar(entrada, 'El comprobante puede pesar hasta 5 MB.');
      return;
    }
    this.archivo.set(elegido);
  }

  protected quitar(entrada: HTMLInputElement): void {
    entrada.value = '';
    this.archivo.set(null);
    this.error.set('');
  }

  protected tamano(bytes: number): string {
    return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  private rechazar(entrada: HTMLInputElement, mensaje: string): void {
    entrada.value = '';
    this.archivo.set(null);
    this.error.set(mensaje);
  }
}
