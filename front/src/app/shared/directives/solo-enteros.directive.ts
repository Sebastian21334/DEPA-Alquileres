import { Directive, HostListener } from '@angular/core';

const TECLAS_DE_CONTROL = new Set([
  'Backspace',
  'Delete',
  'Tab',
  'Enter',
  'Escape',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
]);

/**
 * Restringe un input numérico a dígitos enteros.
 *
 * `type="number"` acepta `e`, `E`, `+`, `-`, `.` y `,`; el validador de Angular
 * los rechaza después, pero el usuario puede escribir notaciones como `1e2` que
 * terminan siendo un entero válido. Esta directiva bloquea la entrada desde el
 * origen y deja el pegado inválido sin modificar el valor.
 */
@Directive({ selector: 'input[appSoloEnteros]', standalone: true })
export class SoloEnterosDirective {
  @HostListener('keydown', ['$event'])
  alPresionarTecla(evento: KeyboardEvent): void {
    // No interferir con atajos (copiar, pegar, seleccionar) ni con IME.
    if (evento.isComposing || evento.ctrlKey || evento.metaKey || evento.altKey) return;
    if (TECLAS_DE_CONTROL.has(evento.key)) return;
    // Las teclas especiales tienen nombres largos; solo se filtran caracteres.
    if (evento.key.length !== 1) return;
    if (!/^\d$/.test(evento.key)) evento.preventDefault();
  }

  @HostListener('paste', ['$event'])
  alPegar(evento: ClipboardEvent): void {
    const texto = evento.clipboardData?.getData('text') ?? '';
    if (!/^\d+$/.test(texto)) evento.preventDefault();
  }

  @HostListener('beforeinput', ['$event'])
  alInsertarTexto(evento: InputEvent): void {
    const texto = evento.data;
    if (texto === null || texto === '') return;
    if (!/^\d+$/.test(texto)) evento.preventDefault();
  }

  @HostListener('drop', ['$event'])
  alSoltarTexto(evento: DragEvent): void {
    const texto = evento.dataTransfer?.getData('text') ?? '';
    if (!/^\d+$/.test(texto)) evento.preventDefault();
  }
}
