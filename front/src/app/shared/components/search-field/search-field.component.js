import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideSearch } from '@lucide/angular';
import * as i0 from "@angular/core";
export class SearchFieldComponent {
    value = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    placeholder = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "placeholder" }] : /* istanbul ignore next */ []));
    ariaLabel = input('Buscar', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ariaLabel" }] : /* istanbul ignore next */ []));
    maxlength = input(200, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "maxlength" }] : /* istanbul ignore next */ []));
    deshabilitado = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "deshabilitado" }] : /* istanbul ignore next */ []));
    valueChange = output();
    static ɵfac = function SearchFieldComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SearchFieldComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SearchFieldComponent, selectors: [["app-search-field"]], inputs: { value: [1, "value"], placeholder: [1, "placeholder"], ariaLabel: [1, "ariaLabel"], maxlength: [1, "maxlength"], deshabilitado: [1, "deshabilitado"] }, outputs: { valueChange: "valueChange" }, decls: 4, vars: 6, consts: [["campo", ""], [1, "search"], ["lucideSearch", "", "aria-hidden", "true", 3, "size"], ["type", "search", 3, "input", "value", "disabled"]], template: function SearchFieldComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "label", 1);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(1, "svg", 2);
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(2, "input", 3, 0);
            i0.ɵɵlistener("input", function SearchFieldComponent_Template_input_input_2_listener() { i0.ɵɵrestoreView(_r1); const campo_r2 = i0.ɵɵreference(3); return i0.ɵɵresetView(ctx.valueChange.emit(campo_r2.value)); });
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵproperty("size", 18);
            i0.ɵɵadvance();
            i0.ɵɵproperty("value", ctx.value())("disabled", ctx.deshabilitado());
            i0.ɵɵattribute("placeholder", ctx.placeholder())("aria-label", ctx.ariaLabel())("maxlength", ctx.maxlength());
        } }, dependencies: [LucideSearch], styles: ["[_nghost-%COMP%] { display: block; }\r\n\r\n.search[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  min-width: min(330px, 100%);\r\n  padding: 9px 12px;\r\n  border: 1px solid #ccd6db;\r\n  border-radius: 9px;\r\n  background: #fff;\r\n}\r\n.search[_ngcontent-%COMP%]:focus-within {\r\n  border-color: var(--%NS%color-primary);\r\n  box-shadow: 0 0 0 2px color-mix(in srgb, var(--%NS%color-primary) 18%, transparent);\r\n}\r\n.search[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\r\n  width: 100%;\r\n  min-width: 0;\r\n  border: 0;\r\n  outline: 0;\r\n  background: transparent;\r\n  font: inherit;\r\n}\r\n\r\n@media (max-width: 560px) {\r\n  .search[_ngcontent-%COMP%] { min-width: 100%; }\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SearchFieldComponent, [{
        type: Component,
        args: [{ selector: 'app-search-field', standalone: true, imports: [LucideSearch], changeDetection: ChangeDetectionStrategy.OnPush, template: "<label class=\"search\">\r\n  <svg lucideSearch [size]=\"18\" aria-hidden=\"true\"></svg>\r\n  <input #campo type=\"search\" [value]=\"value()\" [attr.placeholder]=\"placeholder()\" [attr.aria-label]=\"ariaLabel()\"\r\n    [attr.maxlength]=\"maxlength()\" [disabled]=\"deshabilitado()\" (input)=\"valueChange.emit(campo.value)\" />\r\n</label>\r\n", styles: [":host { display: block; }\r\n\r\n.search {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  min-width: min(330px, 100%);\r\n  padding: 9px 12px;\r\n  border: 1px solid #ccd6db;\r\n  border-radius: 9px;\r\n  background: #fff;\r\n}\r\n.search:focus-within {\r\n  border-color: var(--color-primary);\r\n  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 18%, transparent);\r\n}\r\n.search input {\r\n  width: 100%;\r\n  min-width: 0;\r\n  border: 0;\r\n  outline: 0;\r\n  background: transparent;\r\n  font: inherit;\r\n}\r\n\r\n@media (max-width: 560px) {\r\n  .search { min-width: 100%; }\r\n}\r\n"] }]
    }], null, { value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }], placeholder: [{ type: i0.Input, args: [{ isSignal: true, alias: "placeholder", required: false }] }], ariaLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "ariaLabel", required: false }] }], maxlength: [{ type: i0.Input, args: [{ isSignal: true, alias: "maxlength", required: false }] }], deshabilitado: [{ type: i0.Input, args: [{ isSignal: true, alias: "deshabilitado", required: false }] }], valueChange: [{ type: i0.Output, args: ["valueChange"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(SearchFieldComponent, { className: "SearchFieldComponent", filePath: "src/app/shared/components/search-field/search-field.component.ts", lineNumber: 12 }); })();
