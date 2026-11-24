import { Component, computed, input } from '@angular/core';
import { filasDesglose } from '../../utils/desglose-pago';
import * as i0 from "@angular/core";
const _forTrack0 = ($index, $item) => $item.etiqueta;
function DesglosePagoComponent_Conditional_0_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(3, "dd");
    i0.ɵɵtext(4);
    i0.ɵɵdomElementEnd()();
} if (rf & 2) {
    const fila_r1 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(fila_r1.etiqueta);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(fila_r1.importe);
} }
function DesglosePagoComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "dl", 0);
    i0.ɵɵrepeaterCreate(1, DesglosePagoComponent_Conditional_0_For_2_Template, 5, 2, "div", null, _forTrack0);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.filas());
} }
/** Debajo del importe pagado al anunciante, explica la diferencia con lo que pagó el inquilino. Lo usan su historial y el del panel admin. */
export class DesglosePagoComponent {
    desglose = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "desglose" }] : /* istanbul ignore next */ []));
    moneda = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "moneda" }] : /* istanbul ignore next */ []));
    filas = computed(() => filasDesglose(this.desglose(), this.moneda()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "filas" }] : /* istanbul ignore next */ []));
    static ɵfac = function DesglosePagoComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DesglosePagoComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: DesglosePagoComponent, selectors: [["app-desglose-pago"]], inputs: { desglose: [1, "desglose"], moneda: [1, "moneda"] }, decls: 1, vars: 1, consts: [["aria-label", "Desglose del pago", 1, "desglose"]], template: function DesglosePagoComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, DesglosePagoComponent_Conditional_0_Template, 3, 0, "dl", 0);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.filas().length ? 0 : -1);
        } }, styles: ["[_nghost-%COMP%] { display: block; }\n    .desglose[_ngcontent-%COMP%] { display: grid; gap: .15rem; margin: .35rem 0 0; font-size: .85rem; font-weight: 400; }\n    .desglose[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0 .75rem; }\n    .desglose[_ngcontent-%COMP%]   dt[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); }\n    .desglose[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%] { margin: 0; font-variant-numeric: tabular-nums; }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DesglosePagoComponent, [{
        type: Component,
        args: [{ selector: 'app-desglose-pago', template: `
    @if (filas().length) {
      <dl class="desglose" aria-label="Desglose del pago">
        @for (fila of filas(); track fila.etiqueta) {
          <div><dt>{{ fila.etiqueta }}</dt><dd>{{ fila.importe }}</dd></div>
        }
      </dl>
    }
  `, styles: ["\n    :host { display: block; }\n    .desglose { display: grid; gap: .15rem; margin: .35rem 0 0; font-size: .85rem; font-weight: 400; }\n    .desglose div { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0 .75rem; }\n    .desglose dt { color: var(--color-text-muted); }\n    .desglose dd { margin: 0; font-variant-numeric: tabular-nums; }\n  "] }]
    }], null, { desglose: [{ type: i0.Input, args: [{ isSignal: true, alias: "desglose", required: true }] }], moneda: [{ type: i0.Input, args: [{ isSignal: true, alias: "moneda", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(DesglosePagoComponent, { className: "DesglosePagoComponent", filePath: "src/app/shared/components/desglose-pago/desglose-pago.component.ts", lineNumber: 24 }); })();
