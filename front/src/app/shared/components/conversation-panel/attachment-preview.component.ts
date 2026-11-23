import { Component, input, output } from '@angular/core';
import { LucideX } from '@lucide/angular';

@Component({
  selector: 'app-attachment-preview',
  imports: [LucideX],
  template: `
    <div class="preview">
      <img [src]="url()" alt="Vista previa de la imagen adjunta" />
      <div class="details"><strong>{{ nombre() }}</strong><span>Lista para enviar</span></div>
      <button type="button" [disabled]="deshabilitado()" (click)="quitar.emit()" aria-label="Quitar imagen adjunta" title="Quitar imagen">
        <svg lucideX [size]="18" aria-hidden="true"></svg>
      </button>
    </div>
  `,
  styles: `
    :host { display: block; min-width: 0; }
    .preview { display: flex; align-items: center; gap: 12px; min-width: 0; padding: 9px; border: 1px solid #dce5f1; border-radius: 9px; background: #fff; }
    img { flex: none; width: 76px; height: 76px; border-radius: 7px; object-fit: cover; background: #eaf0f8; }
    .details { display: grid; flex: 1; gap: 4px; min-width: 0; }
    strong { overflow: hidden; color: #243247; font-size: .85rem; text-overflow: ellipsis; white-space: nowrap; }
    span { color: #64748b; font-size: .78rem; }
    button { display: grid; flex: none; place-items: center; width: 36px; height: 36px; border: 0; border-radius: 8px; background: #f2f5fa; color: #52627a; cursor: pointer; }
    button:hover:not(:disabled) { background: #ffeceb; color: #b42318; }
    button:disabled { opacity: .55; cursor: not-allowed; }
    button:focus-visible { outline: 2px solid #0755cb; outline-offset: 3px; }
  `,
})
export class AttachmentPreviewComponent {
  readonly url = input.required<string>();
  readonly nombre = input.required<string>();
  readonly deshabilitado = input(false);
  readonly quitar = output<void>();
}
