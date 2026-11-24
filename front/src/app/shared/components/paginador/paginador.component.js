import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import * as i0 from "@angular/core";
function PaginadorComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate2(" ", ctx_r0.total(), " ", ctx_r0.etiqueta(), " \u00B7 ");
} }
export class PaginadorComponent {
    pagina = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pagina" }] : /* istanbul ignore next */ []));
    paginas = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "paginas" }] : /* istanbul ignore next */ []));
    total = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "total" }] : /* istanbul ignore next */ []));
    etiqueta = input('publicaciones', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "etiqueta" }] : /* istanbul ignore next */ []));
    ariaLabel = input('Paginación', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ariaLabel" }] : /* istanbul ignore next */ []));
    deshabilitado = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "deshabilitado" }] : /* istanbul ignore next */ []));
    paginaCambia = output();
    paginasEfectivas = computed(() => Math.max(1, this.paginas()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "paginasEfectivas" }] : /* istanbul ignore next */ []));
    paginaEfectiva = computed(() => Math.min(Math.max(1, this.pagina()), this.paginasEfectivas()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "paginaEfectiva" }] : /* istanbul ignore next */ []));
    ir(pagina) {
        if (this.deshabilitado() || pagina < 1 || pagina > this.paginasEfectivas() || pagina === this.paginaEfectiva())
            return;
        this.paginaCambia.emit(pagina);
    }
    static ɵfac = function PaginadorComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || PaginadorComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: PaginadorComponent, selectors: [["app-paginador"]], inputs: { pagina: [1, "pagina"], paginas: [1, "paginas"], total: [1, "total"], etiqueta: [1, "etiqueta"], ariaLabel: [1, "ariaLabel"], deshabilitado: [1, "deshabilitado"] }, outputs: { paginaCambia: "paginaCambia" }, decls: 9, vars: 6, consts: [[1, "pagination"], ["role", "status"], [1, "pagination__actions"], ["type", "button", 3, "click", "disabled"]], template: function PaginadorComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "nav", 0)(1, "span", 1);
            i0.ɵɵconditionalCreate(2, PaginadorComponent_Conditional_2_Template, 1, 2);
            i0.ɵɵtext(3);
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(4, "div", 2)(5, "button", 3);
            i0.ɵɵdomListener("click", function PaginadorComponent_Template_button_click_5_listener() { return ctx.ir(ctx.paginaEfectiva() - 1); });
            i0.ɵɵtext(6, "Anterior");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(7, "button", 3);
            i0.ɵɵdomListener("click", function PaginadorComponent_Template_button_click_7_listener() { return ctx.ir(ctx.paginaEfectiva() + 1); });
            i0.ɵɵtext(8, "Siguiente");
            i0.ɵɵdomElementEnd()()();
        } if (rf & 2) {
            i0.ɵɵattribute("aria-label", ctx.ariaLabel());
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.total() !== null ? 2 : -1);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate2(" P\u00E1gina ", ctx.paginaEfectiva(), " de ", ctx.paginasEfectivas(), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵdomProperty("disabled", ctx.deshabilitado() || ctx.paginaEfectiva() <= 1);
            i0.ɵɵadvance(2);
            i0.ɵɵdomProperty("disabled", ctx.deshabilitado() || ctx.paginaEfectiva() >= ctx.paginasEfectivas());
        } }, styles: ["[_nghost-%COMP%] { display: block; }\r\n\r\n.pagination[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  flex-wrap: wrap;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: .75rem;\r\n  margin-top: 1.5rem;\r\n  color: var(--%NS%color-text-muted);\r\n  font-size: .88rem;\r\n}\r\n.pagination__actions[_ngcontent-%COMP%] { display: flex; gap: .5rem; }\r\n.pagination[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\r\n  min-height: 40px;\r\n  padding: .5rem 1rem;\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: 7px;\r\n  background: #fff;\r\n  color: var(--%NS%color-text);\r\n  font: inherit;\r\n  font-weight: 600;\r\n  cursor: pointer;\r\n}\r\n.pagination[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover:not(:disabled) { background: var(--%NS%color-bg); }\r\n.pagination[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:disabled { opacity: .5; cursor: not-allowed; }\r\n.pagination[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:focus-visible { outline: 3px solid var(--%NS%color-accent); outline-offset: 2px; }\r\n\r\n@media (max-width: 560px) {\r\n  .pagination[_ngcontent-%COMP%] { flex-direction: column; align-items: stretch; }\r\n  .pagination__actions[_ngcontent-%COMP%] { width: 100%; }\r\n  .pagination[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { flex: 1; min-height: 44px; }\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PaginadorComponent, [{
        type: Component,
        args: [{ selector: 'app-paginador', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, template: "<nav class=\"pagination\" [attr.aria-label]=\"ariaLabel()\">\r\n  <span role=\"status\">\r\n    @if (total() !== null) { {{ total() }} {{ etiqueta() }} \u00B7 }\r\n    P\u00E1gina {{ paginaEfectiva() }} de {{ paginasEfectivas() }}\r\n  </span>\r\n  <div class=\"pagination__actions\">\r\n    <button type=\"button\" (click)=\"ir(paginaEfectiva() - 1)\" [disabled]=\"deshabilitado() || paginaEfectiva() <= 1\">Anterior</button>\r\n    <button type=\"button\" (click)=\"ir(paginaEfectiva() + 1)\" [disabled]=\"deshabilitado() || paginaEfectiva() >= paginasEfectivas()\">Siguiente</button>\r\n  </div>\r\n</nav>\r\n", styles: [":host { display: block; }\r\n\r\n.pagination {\r\n  display: flex;\r\n  flex-wrap: wrap;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: .75rem;\r\n  margin-top: 1.5rem;\r\n  color: var(--color-text-muted);\r\n  font-size: .88rem;\r\n}\r\n.pagination__actions { display: flex; gap: .5rem; }\r\n.pagination button {\r\n  min-height: 40px;\r\n  padding: .5rem 1rem;\r\n  border: 1px solid var(--color-border);\r\n  border-radius: 7px;\r\n  background: #fff;\r\n  color: var(--color-text);\r\n  font: inherit;\r\n  font-weight: 600;\r\n  cursor: pointer;\r\n}\r\n.pagination button:hover:not(:disabled) { background: var(--color-bg); }\r\n.pagination button:disabled { opacity: .5; cursor: not-allowed; }\r\n.pagination button:focus-visible { outline: 3px solid var(--color-accent); outline-offset: 2px; }\r\n\r\n@media (max-width: 560px) {\r\n  .pagination { flex-direction: column; align-items: stretch; }\r\n  .pagination__actions { width: 100%; }\r\n  .pagination button { flex: 1; min-height: 44px; }\r\n}\r\n"] }]
    }], null, { pagina: [{ type: i0.Input, args: [{ isSignal: true, alias: "pagina", required: true }] }], paginas: [{ type: i0.Input, args: [{ isSignal: true, alias: "paginas", required: true }] }], total: [{ type: i0.Input, args: [{ isSignal: true, alias: "total", required: false }] }], etiqueta: [{ type: i0.Input, args: [{ isSignal: true, alias: "etiqueta", required: false }] }], ariaLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "ariaLabel", required: false }] }], deshabilitado: [{ type: i0.Input, args: [{ isSignal: true, alias: "deshabilitado", required: false }] }], paginaCambia: [{ type: i0.Output, args: ["paginaCambia"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(PaginadorComponent, { className: "PaginadorComponent", filePath: "src/app/shared/components/paginador/paginador.component.ts", lineNumber: 10 }); })();
