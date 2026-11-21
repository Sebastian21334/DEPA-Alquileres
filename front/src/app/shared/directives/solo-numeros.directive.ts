import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  numberAttribute,
} from '@angular/core';

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
 * Restringe un input numérico a dígitos y, opcionalmente, decimales.
 *
 *   <input appSoloNumeros="0">  // enteros
 *   <input appSoloNumeros="2">  // hasta dos decimales
 *
 * `type="number"` acepta `e`, `E`, `+`, `-`, `.` y `,`; el validador de Angular
 * los rechaza después, pero el usuario puede escribir notaciones como `1e2` que
 * terminan siendo un número válido. Esta directiva bloquea la entrada desde el
 * origen y deja el pegado inválido sin modificar el valor.
 */
@Directive({ selector: 'input[appSoloNumeros]', standalone: true })
export class SoloNumerosDirective {
  /** Cantidad máxima de decimales. 0 equivale a solo enteros. */
  readonly appSoloNumeros = input(0, { transform: numberAttribute });

  private readonly input = inject(ElementRef) as ElementRef<HTMLInputElement>;

  @HostListener('keydown', ['$event'])
  alPresionarTecla(evento: KeyboardEvent): void {
    // No interferir con atajos (copiar, pegar, seleccionar) ni con IME.
    if (evento.isComposing || evento.ctrlKey || evento.metaKey || evento.altKey) return;
    if (TECLAS_DE_CONTROL.has(evento.key)) return;
    // Las teclas especiales tienen nombres largos; solo se filtran caracteres.
    if (evento.key.length !== 1) return;

    const decimales = this.appSoloNumeros();
    const valor = this.input.nativeElement.value;

    if (/^\d$/.test(evento.key)) {
      if (decimales === 0 || !/[.,]/.test(valor)) return;
      const fraccion = valor.split(/[.,]/)[1] ?? '';
      if (fraccion.length < decimales) return;
    }

    if (decimales > 0 && /^[.,]$/.test(evento.key) && !/[.,]/.test(valor)) return;

    evento.preventDefault();
  }

  @HostListener('paste', ['$event'])
  alPegar(evento: ClipboardEvent): void {
    const texto = evento.clipboardData?.getData('text') ?? '';
    if (!this.esTextoValido(texto)) evento.preventDefault();
  }

  @HostListener('beforeinput', ['$event'])
  alInsertarTexto(evento: InputEvent): void {
    const texto = evento.data;
    if (texto === null || texto === '') return;

    // En type="number" selectionStart suele ser null; se usa el final del valor.
    const input = this.input.nativeElement;
    const inicio = input.selectionStart ?? input.value.length;
    const fin = input.selectionEnd ?? inicio;
    const resultado = `${input.value.slice(0, inicio)}${texto}${input.value.slice(fin)}`;

    if (!this.esTextoValido(resultado)) evento.preventDefault();
  }

  @HostListener('drop', ['$event'])
  alSoltarTexto(evento: DragEvent): void {
    const texto = evento.dataTransfer?.getData('text') ?? '';
    if (!this.esTextoValido(texto)) evento.preventDefault();
  }

  private esTextoValido(texto: string): boolean {
    const decimales = this.appSoloNumeros();
    const patron =
      decimales > 0
        ? new RegExp(`^\\d+([.,]\\d{0,${decimales}})?$`)
        : /^\d+$/;
    return patron.test(texto);
  }
}
