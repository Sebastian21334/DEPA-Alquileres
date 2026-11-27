import { Component, computed, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucidePaperclip, LucideSend } from '@lucide/angular';
import { CargaImagenesComponent } from '../carga-imagenes/carga-imagenes.component';

@Component({
  selector: 'app-conversation-composer',
  imports: [FormsModule, LucidePaperclip, LucideSend, CargaImagenesComponent],
  template: `
    @if (mostrarAdjuntos()) {
      <app-carga-imagenes [etiqueta]="adjuntos() === 1 ? 'Imagen para enviar' : 'Imágenes para enviar'" [(archivos)]="imagenes" [maximo]="adjuntos() ?? 0" [deshabilitado]="deshabilitado()" />
    }
    <div class="fila">
      @if (adjuntos() !== null) {
        <button type="button" class="adjuntar" [class.adjuntar--abierto]="mostrarAdjuntos()"
          [disabled]="deshabilitado() || (!adjuntos() && !imagenes().length)" [attr.aria-expanded]="mostrarAdjuntos()"
          [attr.aria-label]="textoAdjuntar()" [title]="textoAdjuntar()" (click)="alternarAdjuntos()">
          <svg lucidePaperclip [size]="19" aria-hidden="true"></svg>
          @if (imagenes().length) { <span class="cuenta" aria-hidden="true">{{ imagenes().length }}</span> }
        </button>
      }
      <textarea [ngModel]="texto()" (ngModelChange)="texto.set($event)" [ngModelOptions]="{ standalone: true }"
        rows="1" [attr.maxlength]="limite()" [disabled]="deshabilitado()"
        [attr.aria-label]="etiqueta()" placeholder="Escribí un mensaje…" (keydown.enter)="porTeclado($event)"></textarea>
      <button type="button" class="enviar" [disabled]="deshabilitado() || !hayContenido()" (click)="enviar.emit()">
        <svg lucideSend [size]="19" aria-hidden="true"></svg> <span>Enviar</span>
      </button>
    </div>
  `,
  styles: `
    :host { display: grid; box-sizing: border-box; width: 100%; min-width: 0; gap: 10px; padding: 12px; border-top: 1px solid #d5deee; background: #fff; container-type: inline-size; }
    .fila { display: flex; min-width: 0; align-items: flex-end; gap: 8px; }
    textarea { flex: 1 1 0; box-sizing: border-box; width: 0; min-width: 0; min-height: 44px; max-height: 140px; resize: vertical; padding: 10px 12px; border: 1px solid #aab9d2; border-radius: 8px; color: #121b36; font: inherit; }
    .fila button { display: inline-flex; gap: 6px; align-items: center; justify-content: center; min-height: 44px; padding: 0 12px; border: 0; border-radius: 8px; font: inherit; font-weight: 700; cursor: pointer; }
    .enviar { background: #1640f5; color: #fff; }
    .fila .adjuntar { position: relative; min-width: 44px; padding: 0 10px; border: 1px solid #aab9d2; background: #fff; color: #1640f5; }
    .fila .adjuntar--abierto { background: #eef2ff; }
    .cuenta { position: absolute; top: -6px; right: -6px; min-width: 18px; padding: 0 4px; border-radius: 9px; background: #1640f5; color: #fff; font-size: .7rem; line-height: 18px; }
    .fila button:disabled { opacity: .55; cursor: default; }
    textarea:focus-visible, .fila button:focus-visible { outline: 2px solid #1640f5; outline-offset: 2px; }
    @container (max-width: 260px) {
      .fila .enviar { flex: none; width: 44px; padding: 0; }
      .enviar span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
    }
  `,
})
export class ConversationComposerComponent {
  readonly texto = model('');
  readonly deshabilitado = input(false);
  readonly limite = input(1000);
  readonly etiqueta = input('Mensaje');
  /** Imágenes elegidas para el próximo mensaje. */
  readonly imagenes = model<File[]>([]);
  /** Cuántas imágenes admite el próximo mensaje; null = este chat no acepta imágenes. */
  readonly adjuntos = input<number | null>(null);
  /** Las apelaciones exigen texto: una imagen sola no alcanza para enviar. */
  readonly textoObligatorio = input(false);
  readonly enviar = output<void>();
  private readonly abierto = signal(false);
  /** Con imágenes elegidas la zona queda a la vista, para que se puedan revisar o quitar antes de enviar. */
  protected readonly mostrarAdjuntos = computed(() => this.abierto() || this.imagenes().length > 0);
  protected readonly hayContenido = computed(() => !!this.texto().trim() || (!this.textoObligatorio() && this.imagenes().length > 0));
  protected readonly textoAdjuntar = computed(() => {
    if (!this.adjuntos() && !this.imagenes().length) return 'Ya no se pueden adjuntar más imágenes';
    return this.mostrarAdjuntos() && !this.imagenes().length ? 'Cerrar adjuntos' : 'Adjuntar imágenes';
  });

  protected alternarAdjuntos(): void {
    if (!this.imagenes().length) this.abierto.update((abierto) => !abierto);
  }

  protected porTeclado(evento: Event): void {
    const tecla = evento as KeyboardEvent;
    if (tecla.shiftKey || tecla.isComposing) return;
    tecla.preventDefault();
    if (!this.deshabilitado() && this.hayContenido()) this.enviar.emit();
  }
}
