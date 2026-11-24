import { Directive, ElementRef, HostListener, inject, input, numberAttribute, } from '@angular/core';
import * as i0 from "@angular/core";
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
export class SoloNumerosDirective {
    /** Cantidad máxima de decimales. 0 equivale a solo enteros. */
    appSoloNumeros = input(0, { ...(ngDevMode ? { debugName: "appSoloNumeros" } : /* istanbul ignore next */ {}), transform: numberAttribute });
    input = inject(ElementRef);
    alPresionarTecla(evento) {
        // No interferir con atajos (copiar, pegar, seleccionar) ni con IME.
        if (evento.isComposing || evento.ctrlKey || evento.metaKey || evento.altKey)
            return;
        if (TECLAS_DE_CONTROL.has(evento.key))
            return;
        // Las teclas especiales tienen nombres largos; solo se filtran caracteres.
        if (evento.key.length !== 1)
            return;
        const decimales = this.appSoloNumeros();
        const valor = this.input.nativeElement.value;
        if (/^\d$/.test(evento.key)) {
            if (decimales === 0 || !/[.,]/.test(valor))
                return;
            const fraccion = valor.split(/[.,]/)[1] ?? '';
            if (fraccion.length < decimales)
                return;
        }
        if (decimales > 0 && /^[.,]$/.test(evento.key) && !/[.,]/.test(valor))
            return;
        evento.preventDefault();
    }
    alPegar(evento) {
        const texto = evento.clipboardData?.getData('text') ?? '';
        if (!this.esTextoValido(texto))
            evento.preventDefault();
    }
    alInsertarTexto(evento) {
        const texto = evento.data;
        if (texto === null || texto === '')
            return;
        // En type="number" selectionStart suele ser null; se usa el final del valor.
        const input = this.input.nativeElement;
        const inicio = input.selectionStart ?? input.value.length;
        const fin = input.selectionEnd ?? inicio;
        const resultado = `${input.value.slice(0, inicio)}${texto}${input.value.slice(fin)}`;
        if (!this.esTextoValido(resultado))
            evento.preventDefault();
    }
    alSoltarTexto(evento) {
        const texto = evento.dataTransfer?.getData('text') ?? '';
        if (!this.esTextoValido(texto))
            evento.preventDefault();
    }
    esTextoValido(texto) {
        const decimales = this.appSoloNumeros();
        const patron = decimales > 0
            ? new RegExp(`^\\d+([.,]\\d{0,${decimales}})?$`)
            : /^\d+$/;
        return patron.test(texto);
    }
    static ɵfac = function SoloNumerosDirective_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SoloNumerosDirective)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: SoloNumerosDirective, selectors: [["input", "appSoloNumeros", ""]], hostBindings: function SoloNumerosDirective_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("keydown", function SoloNumerosDirective_keydown_HostBindingHandler($event) { return ctx.alPresionarTecla($event); })("paste", function SoloNumerosDirective_paste_HostBindingHandler($event) { return ctx.alPegar($event); })("beforeinput", function SoloNumerosDirective_beforeinput_HostBindingHandler($event) { return ctx.alInsertarTexto($event); })("drop", function SoloNumerosDirective_drop_HostBindingHandler($event) { return ctx.alSoltarTexto($event); });
        } }, inputs: { appSoloNumeros: [1, "appSoloNumeros"] } });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SoloNumerosDirective, [{
        type: Directive,
        args: [{ selector: 'input[appSoloNumeros]', standalone: true }]
    }], null, { appSoloNumeros: [{ type: i0.Input, args: [{ isSignal: true, alias: "appSoloNumeros", required: false }] }], alPresionarTecla: [{
            type: HostListener,
            args: ['keydown', ['$event']]
        }], alPegar: [{
            type: HostListener,
            args: ['paste', ['$event']]
        }], alInsertarTexto: [{
            type: HostListener,
            args: ['beforeinput', ['$event']]
        }], alSoltarTexto: [{
            type: HostListener,
            args: ['drop', ['$event']]
        }] }); })();
