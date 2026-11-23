import { Component, input, model, signal } from '@angular/core';
import { LucideFileText, LucideUpload } from '@lucide/angular';

/** Mismo límite que el back (T04). */
export const MAX_BYTES_COMPROBANTE = 5 * 1024 * 1024;
const TIPOS = ['application/pdf', 'image/jpeg', 'image/png'];
const EXTENSIONES = /\.(pdf|jpe?g|png)$/i;
let siguienteId = 0;

/**
 * T04: elige el comprobante de una transferencia (PDF, JPG o PNG de hasta 5 MB).
 * Valida antes de subir; el back vuelve a validar el contenido real del archivo.
 * T56: es la misma zona, con el mismo texto, en el reembolso y en el pago al anunciante.
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
        <span class="carga__accion" [id]="id + '-accion'">Elegí o arrastrá el comprobante</span>
        <span class="carga__ayuda" [id]="id + '-ayuda'">PDF, JPG o PNG de hasta 5 MB</span>
      </label>
    }
    @if (error()) { <p class="carga__error" role="alert">{{ error() }}</p> }
  `,
  styles: `
    :host { display: grid; gap: .4rem; }
    .carga__etiqueta { font-weight: 700; }
    .carga__zona {
      position: relative; display: grid; justify-items: center; gap: .2rem; padding: .9rem .75rem;
      border: 1.5px dashed #9baab4; border-radius: .6rem; background: #f8fafb; color: #172b45;
      text-align: center; cursor: pointer;
    }
    .carga__zona:hover, .carga__zona--arrastrando { border-color: #146c43; background: #eef8f2; }
    .carga__zona:focus-within { outline: 2px solid #146c43; outline-offset: 2px; }
    .carga__zona--deshabilitada { opacity: .6; cursor: not-allowed; }
    .carga__entrada { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
    .carga__accion { font-weight: 650; }
    .carga__ayuda { color: #52607a; font-size: .82rem; }
    .carga__elegido {
      display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; padding: .6rem .75rem;
      border: 1px solid #b7dcc5; border-radius: .6rem; background: #eef8f2; overflow-wrap: anywhere; font-size: .9rem;
    }
    .carga__elegido span { flex: 1; min-width: 0; }
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
      this.rechazar(entrada, 'El comprobante tiene que ser un PDF, JPG o PNG.');
      return;
    }
    if (elegido.size > MAX_BYTES_COMPROBANTE) {
      this.rechazar(entrada, 'El comprobante puede pesar hasta 5 MB.');
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
