import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import * as i0 from "@angular/core";
function VerComprobanteComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "span", 1);
    i0.ɵɵtext(1);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.error());
} }
/**
 * Abre el comprobante privado con el enlace firmado que devuelve el back
 * (dura 15 minutos y solo se entrega a las partes y al admin).
 */
export class VerComprobanteComponent {
    /** Cada pantalla indica cómo pedir el enlace firmado de su comprobante. */
    obtenerUrl = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "obtenerUrl" }] : /* istanbul ignore next */ []));
    etiqueta = input('Ver comprobante', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "etiqueta" }] : /* istanbul ignore next */ []));
    abriendo = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "abriendo" }] : /* istanbul ignore next */ []));
    error = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    destroyRef = inject(DestroyRef);
    abrir() {
        if (this.abriendo())
            return;
        this.abriendo.set(true);
        this.error.set('');
        this.obtenerUrl()().pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.abriendo.set(false))).subscribe({
            next: ({ url }) => window.open(url, '_blank', 'noopener'),
            error: (error) => this.error.set(error.message || 'No se pudo abrir el comprobante.'),
        });
    }
    static ɵfac = function VerComprobanteComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || VerComprobanteComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: VerComprobanteComponent, selectors: [["app-ver-comprobante"]], inputs: { obtenerUrl: [1, "obtenerUrl"], etiqueta: [1, "etiqueta"] }, decls: 3, vars: 3, consts: [["type", "button", 1, "ver", 3, "click", "disabled"], ["role", "alert", 1, "ver__error"]], template: function VerComprobanteComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "button", 0);
            i0.ɵɵdomListener("click", function VerComprobanteComponent_Template_button_click_0_listener() { return ctx.abrir(); });
            i0.ɵɵtext(1);
            i0.ɵɵdomElementEnd();
            i0.ɵɵconditionalCreate(2, VerComprobanteComponent_Conditional_2_Template, 2, 1, "span", 1);
        } if (rf & 2) {
            i0.ɵɵdomProperty("disabled", ctx.abriendo());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.abriendo() ? "Abriendo\u2026" : ctx.etiqueta(), " ");
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.error() ? 2 : -1);
        } }, styles: ["[_nghost-%COMP%] { display: inline-flex; flex-wrap: wrap; align-items: center; gap: .5rem; }\n    .ver[_ngcontent-%COMP%] { padding: .35rem .7rem; border: 1px solid #1d4ed8; border-radius: .45rem; background: #fff; color: #1d4ed8; font-weight: 700; cursor: pointer; }\n    .ver[_ngcontent-%COMP%]:disabled { opacity: .6; cursor: progress; }\n    .ver__error[_ngcontent-%COMP%] { color: #8a1c13; font-size: .85rem; }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(VerComprobanteComponent, [{
        type: Component,
        args: [{ selector: 'app-ver-comprobante', template: `
    <button type="button" class="ver" [disabled]="abriendo()" (click)="abrir()">
      {{ abriendo() ? 'Abriendo…' : etiqueta() }}
    </button>
    @if (error()) { <span class="ver__error" role="alert">{{ error() }}</span> }
  `, styles: ["\n    :host { display: inline-flex; flex-wrap: wrap; align-items: center; gap: .5rem; }\n    .ver { padding: .35rem .7rem; border: 1px solid #1d4ed8; border-radius: .45rem; background: #fff; color: #1d4ed8; font-weight: 700; cursor: pointer; }\n    .ver:disabled { opacity: .6; cursor: progress; }\n    .ver__error { color: #8a1c13; font-size: .85rem; }\n  "] }]
    }], null, { obtenerUrl: [{ type: i0.Input, args: [{ isSignal: true, alias: "obtenerUrl", required: true }] }], etiqueta: [{ type: i0.Input, args: [{ isSignal: true, alias: "etiqueta", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(VerComprobanteComponent, { className: "VerComprobanteComponent", filePath: "src/app/shared/components/ver-comprobante/ver-comprobante.component.ts", lineNumber: 24 }); })();
