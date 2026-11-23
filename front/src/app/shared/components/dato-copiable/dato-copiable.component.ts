import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { LucideCheck, LucideCopy } from '@lucide/angular';

/**
 * T56: un dato que el admin tiene que pasar a su banco (CBU, importe) con un botón para copiarlo.
 * Se muestra `valor`, formateado para leerlo; se copia `copia` (por ejemplo, sin espacios).
 */
@Component({
  selector: 'app-dato-copiable',
  imports: [LucideCheck, LucideCopy],
  template: `
    <span class="dato__valor" [class.dato__valor--mono]="monoespaciado()">{{ valor() }}</span>
    <button type="button" class="dato__copiar" [attr.aria-label]="'Copiar ' + descripcion()" (click)="copiar()">
      @if (copiado()) {
        <svg lucideCheck [size]="15" aria-hidden="true"></svg> Copiado
      } @else {
        <svg lucideCopy [size]="15" aria-hidden="true"></svg> Copiar
      }
    </button>
    <span class="dato__aviso" role="status">{{ copiado() ? descripcion() + ' copiado' : '' }}</span>
    @if (error()) { <span class="dato__error" role="alert">{{ error() }}</span> }
  `,
  styles: `
    :host { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; min-width: 0; }
    .dato__valor { overflow-wrap: anywhere; }
    .dato__valor--mono { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 1.05rem; letter-spacing: .02em; }
    .dato__copiar {
      display: inline-flex; align-items: center; gap: .3rem; padding: .25rem .6rem;
      border: 1px solid #b9c6cf; border-radius: .45rem; background: #fff; color: #172b45;
      font: inherit; font-size: .82rem; font-weight: 650; cursor: pointer;
    }
    .dato__copiar:hover { border-color: #146c43; color: #146c43; }
    .dato__copiar:focus-visible { outline: 2px solid #146c43; outline-offset: 2px; }
    .dato__aviso { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
    .dato__error { flex-basis: 100%; color: #8a1c13; font-size: .82rem; }
  `,
})
export class DatoCopiableComponent {
  readonly valor = input.required<string>();
  /** Texto que va al portapapeles; si falta, se copia `valor`. */
  readonly copia = input<string | null>(null);
  /** Nombre del dato para lectores de pantalla: «Copiar CBU». */
  readonly descripcion = input('dato');
  readonly monoespaciado = input(false);

  protected readonly copiado = signal(false);
  protected readonly error = signal('');
  private temporizador?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.temporizador));
  }

  protected async copiar(): Promise<void> {
    this.error.set('');
    clearTimeout(this.temporizador);
    try {
      await navigator.clipboard.writeText(this.copia() ?? this.valor());
      this.copiado.set(true);
      this.temporizador = setTimeout(() => this.copiado.set(false), 2000);
    } catch {
      this.copiado.set(false);
      this.error.set('No se pudo copiar. Seleccioná el dato y copialo a mano.');
    }
  }
}
