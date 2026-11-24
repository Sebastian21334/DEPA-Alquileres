import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, type Observable } from 'rxjs';

/**
 * Abre el comprobante privado con el enlace firmado que devuelve el back
 * (dura 15 minutos y solo se entrega a las partes y al admin).
 */
@Component({
  selector: 'app-ver-comprobante',
  template: `
    <button type="button" class="ver" [disabled]="abriendo()" (click)="abrir()">
      {{ abriendo() ? 'Abriendo…' : etiqueta() }}
    </button>
    @if (error()) { <span class="ver__error" role="alert">{{ error() }}</span> }
  `,
  styles: `
    :host { display: inline-flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
    .ver { padding: .35rem .7rem; border: 1px solid #1d4ed8; border-radius: .45rem; background: #fff; color: #1d4ed8; font-weight: 700; cursor: pointer; }
    .ver:disabled { opacity: .6; cursor: progress; }
    .ver__error { color: #8a1c13; font-size: .85rem; }
  `,
})
export class VerComprobanteComponent {
  /** Cada pantalla indica cómo pedir el enlace firmado de su comprobante. */
  readonly obtenerUrl = input.required<() => Observable<{ url: string }>>();
  readonly etiqueta = input('Ver comprobante');
  protected readonly abriendo = signal(false);
  protected readonly error = signal('');
  private readonly destroyRef = inject(DestroyRef);

  protected abrir(): void {
    if (this.abriendo()) return;
    this.abriendo.set(true);
    this.error.set('');
    this.obtenerUrl()().pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.abriendo.set(false))).subscribe({
      next: ({ url }) => window.open(url, '_blank', 'noopener'),
      error: (error: Error) => this.error.set(error.message || 'No se pudo abrir el comprobante.'),
    });
  }
}
