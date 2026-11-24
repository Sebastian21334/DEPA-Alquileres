import { Component, input } from '@angular/core';
import * as i0 from "@angular/core";
// Spinner reutilizable, sin identidad visual definida (RNF4): usa currentColor
// para heredar el color de texto del contenedor que lo use.
export class SpinnerComponent {
    label = input('Cargando…', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "label" }] : /* istanbul ignore next */ []));
    static ɵfac = function SpinnerComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SpinnerComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SpinnerComponent, selectors: [["app-spinner"]], inputs: { label: [1, "label"] }, decls: 2, vars: 1, consts: [["role", "status", 1, "spinner"], [1, "spinner__circle"]], template: function SpinnerComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "div", 0);
            i0.ɵɵdomElement(1, "span", 1);
            i0.ɵɵdomElementEnd();
        } if (rf & 2) {
            i0.ɵɵattribute("aria-label", ctx.label());
        } }, styles: [".spinner[_ngcontent-%COMP%] {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 1rem;\r\n}\r\n\r\n.spinner__circle[_ngcontent-%COMP%] {\r\n  width: 2rem;\r\n  height: 2rem;\r\n  border-radius: 50%;\r\n  border: 3px solid color-mix(in srgb, currentColor 20%, transparent);\r\n  border-top-color: currentColor;\r\n  animation: _ngcontent-%COMP%_spin 0.8s linear infinite;\r\n}\r\n\r\n@keyframes _ngcontent-%COMP%_spin {\r\n  to {\r\n    transform: rotate(360deg);\r\n  }\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SpinnerComponent, [{
        type: Component,
        args: [{ selector: 'app-spinner', standalone: true, template: "<div class=\"spinner\" role=\"status\" [attr.aria-label]=\"label()\">\r\n  <span class=\"spinner__circle\"></span>\r\n</div>\r\n", styles: [".spinner {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 1rem;\r\n}\r\n\r\n.spinner__circle {\r\n  width: 2rem;\r\n  height: 2rem;\r\n  border-radius: 50%;\r\n  border: 3px solid color-mix(in srgb, currentColor 20%, transparent);\r\n  border-top-color: currentColor;\r\n  animation: spin 0.8s linear infinite;\r\n}\r\n\r\n@keyframes spin {\r\n  to {\r\n    transform: rotate(360deg);\r\n  }\r\n}\r\n"] }]
    }], null, { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(SpinnerComponent, { className: "SpinnerComponent", filePath: "src/app/shared/components/spinner/spinner.component.ts", lineNumber: 11 }); })();
