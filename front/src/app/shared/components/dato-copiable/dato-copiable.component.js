import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { LucideCheck, LucideCopy } from '@lucide/angular';
import * as i0 from "@angular/core";
function DatoCopiableComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(0, "svg", 4);
    i0.ɵɵtext(1, " Copiado ");
} if (rf & 2) {
    i0.ɵɵproperty("size", 15);
} }
function DatoCopiableComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(0, "svg", 5);
    i0.ɵɵtext(1, " Copiar ");
} if (rf & 2) {
    i0.ɵɵproperty("size", 15);
} }
function DatoCopiableComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 3);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.error());
} }
/**
 * Un dato que el admin tiene que pasar a su banco (CBU, importe) con un botón para copiarlo.
 * Se muestra `valor`, formateado para leerlo; se copia `copia` (por ejemplo, sin espacios).
 */
export class DatoCopiableComponent {
    valor = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "valor" }] : /* istanbul ignore next */ []));
    /** Texto que va al portapapeles; si falta, se copia `valor`. */
    copia = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "copia" }] : /* istanbul ignore next */ []));
    /** Nombre del dato para lectores de pantalla: «Copiar CBU». */
    descripcion = input('dato', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "descripcion" }] : /* istanbul ignore next */ []));
    monoespaciado = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "monoespaciado" }] : /* istanbul ignore next */ []));
    copiado = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "copiado" }] : /* istanbul ignore next */ []));
    error = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    temporizador;
    constructor() {
        inject(DestroyRef).onDestroy(() => clearTimeout(this.temporizador));
    }
    async copiar() {
        this.error.set('');
        clearTimeout(this.temporizador);
        try {
            await navigator.clipboard.writeText(this.copia() ?? this.valor());
            this.copiado.set(true);
            this.temporizador = setTimeout(() => this.copiado.set(false), 2000);
        }
        catch {
            this.copiado.set(false);
            this.error.set('No se pudo copiar. Seleccioná el dato y copialo a mano.');
        }
    }
    static ɵfac = function DatoCopiableComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DatoCopiableComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: DatoCopiableComponent, selectors: [["app-dato-copiable"]], inputs: { valor: [1, "valor"], copia: [1, "copia"], descripcion: [1, "descripcion"], monoespaciado: [1, "monoespaciado"] }, decls: 8, vars: 7, consts: [[1, "dato__valor"], ["type", "button", 1, "dato__copiar", 3, "click"], ["role", "status", 1, "dato__aviso"], ["role", "alert", 1, "dato__error"], ["lucideCheck", "", "aria-hidden", "true", 3, "size"], ["lucideCopy", "", "aria-hidden", "true", 3, "size"]], template: function DatoCopiableComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "span", 0);
            i0.ɵɵtext(1);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(2, "button", 1);
            i0.ɵɵlistener("click", function DatoCopiableComponent_Template_button_click_2_listener() { return ctx.copiar(); });
            i0.ɵɵconditionalCreate(3, DatoCopiableComponent_Conditional_3_Template, 2, 1)(4, DatoCopiableComponent_Conditional_4_Template, 2, 1);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "span", 2);
            i0.ɵɵtext(6);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(7, DatoCopiableComponent_Conditional_7_Template, 2, 1, "span", 3);
        } if (rf & 2) {
            i0.ɵɵclassProp("dato__valor--mono", ctx.monoespaciado());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(ctx.valor());
            i0.ɵɵadvance();
            i0.ɵɵattribute("aria-label", "Copiar " + ctx.descripcion());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.copiado() ? 3 : 4);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.copiado() ? ctx.descripcion() + " copiado" : "");
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.error() ? 7 : -1);
        } }, dependencies: [LucideCheck, LucideCopy], styles: ["[_nghost-%COMP%] { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; min-width: 0; }\n    .dato__valor[_ngcontent-%COMP%] { overflow-wrap: anywhere; }\n    .dato__valor--mono[_ngcontent-%COMP%] { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 1.05rem; letter-spacing: .02em; }\n    .dato__copiar[_ngcontent-%COMP%] {\n      display: inline-flex; align-items: center; gap: .3rem; padding: .25rem .6rem;\n      border: 1px solid #b9c6cf; border-radius: .45rem; background: #fff; color: #172b45;\n      font: inherit; font-size: .82rem; font-weight: 650; cursor: pointer;\n    }\n    .dato__copiar[_ngcontent-%COMP%]:hover { border-color: #146c43; color: #146c43; }\n    .dato__copiar[_ngcontent-%COMP%]:focus-visible { outline: 2px solid #146c43; outline-offset: 2px; }\n    .dato__aviso[_ngcontent-%COMP%] { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }\n    .dato__error[_ngcontent-%COMP%] { flex-basis: 100%; color: #8a1c13; font-size: .82rem; }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DatoCopiableComponent, [{
        type: Component,
        args: [{ selector: 'app-dato-copiable', imports: [LucideCheck, LucideCopy], template: `
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
  `, styles: ["\n    :host { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; min-width: 0; }\n    .dato__valor { overflow-wrap: anywhere; }\n    .dato__valor--mono { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 1.05rem; letter-spacing: .02em; }\n    .dato__copiar {\n      display: inline-flex; align-items: center; gap: .3rem; padding: .25rem .6rem;\n      border: 1px solid #b9c6cf; border-radius: .45rem; background: #fff; color: #172b45;\n      font: inherit; font-size: .82rem; font-weight: 650; cursor: pointer;\n    }\n    .dato__copiar:hover { border-color: #146c43; color: #146c43; }\n    .dato__copiar:focus-visible { outline: 2px solid #146c43; outline-offset: 2px; }\n    .dato__aviso { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }\n    .dato__error { flex-basis: 100%; color: #8a1c13; font-size: .82rem; }\n  "] }]
    }], () => [], { valor: [{ type: i0.Input, args: [{ isSignal: true, alias: "valor", required: true }] }], copia: [{ type: i0.Input, args: [{ isSignal: true, alias: "copia", required: false }] }], descripcion: [{ type: i0.Input, args: [{ isSignal: true, alias: "descripcion", required: false }] }], monoespaciado: [{ type: i0.Input, args: [{ isSignal: true, alias: "monoespaciado", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(DatoCopiableComponent, { className: "DatoCopiableComponent", filePath: "src/app/shared/components/dato-copiable/dato-copiable.component.ts", lineNumber: 38 }); })();
