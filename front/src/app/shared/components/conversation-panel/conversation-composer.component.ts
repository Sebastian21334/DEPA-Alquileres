import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideSend } from '@lucide/angular';

@Component({
  selector: 'app-conversation-composer',
  imports: [FormsModule, LucideSend],
  template: `
    <textarea [ngModel]="texto()" (ngModelChange)="texto.set($event)" [ngModelOptions]="{ standalone: true }"
      rows="1" [attr.maxlength]="limite()" [disabled]="deshabilitado()"
      [attr.aria-label]="etiqueta()" placeholder="Escribí un mensaje…" (keydown.enter)="porTeclado($event)"></textarea>
    <button type="button" [disabled]="deshabilitado() || !texto().trim()" (click)="enviar.emit()">
      <svg lucideSend [size]="19" aria-hidden="true"></svg> Enviar
    </button>
  `,
  styles: `
    :host { display: flex; align-items: flex-end; gap: 8px; padding: 12px; border-top: 1px solid #d5deee; background: #fff; }
    :host textarea { flex: 1; box-sizing: border-box; min-width: 0; min-height: 44px; max-height: 140px; resize: vertical; padding: 10px 12px; border: 1px solid #aab9d2; border-radius: 8px; color: #121b36; font: inherit; }
    :host button { display: inline-flex; gap: 6px; align-items: center; justify-content: center; min-height: 44px; padding: 0 12px; border: 0; border-radius: 8px; background: #1640f5; color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
    :host button:disabled { opacity: .55; cursor: default; }
    :host textarea:focus-visible, :host button:focus-visible { outline: 2px solid #1640f5; outline-offset: 2px; }
  `,
})
export class ConversationComposerComponent {
  readonly texto = model('');
  readonly deshabilitado = input(false);
  readonly limite = input(1000);
  readonly etiqueta = input('Mensaje');
  readonly enviar = output<void>();

  protected porTeclado(evento: Event): void {
    const tecla = evento as KeyboardEvent;
    if (tecla.shiftKey || tecla.isComposing) return;
    tecla.preventDefault();
    if (!this.deshabilitado() && this.texto().trim()) this.enviar.emit();
  }
}
