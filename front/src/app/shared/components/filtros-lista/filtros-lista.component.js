import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SearchFieldComponent } from '../search-field/search-field.component';
import * as i0 from "@angular/core";
const _c0 = ["*"];
const _forTrack0 = ($index, $item) => $item.nombre;
const _forTrack1 = ($index, $item) => $item.valor;
function FiltrosListaComponent_For_3_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 4);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opcion_r4 = ctx.$implicit;
    const filtro_r2 = i0.ɵɵnextContext().$implicit;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("value", opcion_r4.valor)("selected", opcion_r4.valor === ctx_r2.lista().valor(filtro_r2.nombre));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(opcion_r4.etiqueta);
} }
function FiltrosListaComponent_For_3_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 2)(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "select", 3);
    i0.ɵɵlistener("change", function FiltrosListaComponent_For_3_Template_select_change_3_listener($event) { const filtro_r2 = i0.ɵɵrestoreView(_r1).$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.cambiar(filtro_r2.nombre, $event)); });
    i0.ɵɵrepeaterCreate(4, FiltrosListaComponent_For_3_For_5_Template, 2, 3, "option", 4, _forTrack1);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const filtro_r2 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(filtro_r2.etiqueta);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(filtro_r2.opciones);
} }
/** Buscador y filtros de una lista del panel admin. El contenido extra (por ejemplo, fechas) va al final. */
export class FiltrosListaComponent {
    lista = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "lista" }] : /* istanbul ignore next */ []));
    placeholder = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "placeholder" }] : /* istanbul ignore next */ []));
    etiqueta = input('Buscar', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "etiqueta" }] : /* istanbul ignore next */ []));
    cambiar(nombre, evento) {
        this.lista().filtrar(nombre, evento.target.value);
    }
    static ɵfac = function FiltrosListaComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || FiltrosListaComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: FiltrosListaComponent, selectors: [["app-filtros-lista"]], inputs: { lista: [1, "lista"], placeholder: [1, "placeholder"], etiqueta: [1, "etiqueta"] }, ngContentSelectors: _c0, decls: 5, vars: 3, consts: [["role", "search", 1, "filtros-lista"], [1, "filtros-lista__busqueda", 3, "valueChange", "value", "placeholder", "ariaLabel"], [1, "filtros-lista__filtro"], [3, "change"], [3, "value", "selected"]], template: function FiltrosListaComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵelementStart(0, "div", 0)(1, "app-search-field", 1);
            i0.ɵɵlistener("valueChange", function FiltrosListaComponent_Template_app_search_field_valueChange_1_listener($event) { return ctx.lista().buscar($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵrepeaterCreate(2, FiltrosListaComponent_For_3_Template, 6, 1, "label", 2, _forTrack0);
            i0.ɵɵprojection(4);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵproperty("value", ctx.lista().busqueda())("placeholder", ctx.placeholder())("ariaLabel", ctx.etiqueta());
            i0.ɵɵadvance();
            i0.ɵɵrepeater(ctx.lista().filtros);
        } }, dependencies: [SearchFieldComponent], styles: ["[_nghost-%COMP%] { display: block; }\r\n\r\n.filtros-lista[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  flex-wrap: wrap;\r\n  align-items: end;\r\n  gap: 10px 14px;\r\n}\r\n.filtros-lista__busqueda[_ngcontent-%COMP%] { flex: 1 1 280px; }\r\n\r\n//[_ngcontent-%COMP%]   Los[_ngcontent-%COMP%]   filtros[_ngcontent-%COMP%]   propios[_ngcontent-%COMP%]   y[_ngcontent-%COMP%]   los[_ngcontent-%COMP%]   que[_ngcontent-%COMP%]   se[_ngcontent-%COMP%]   proyectan[_ngcontent-%COMP%]   (por ejemplo, las fechas del historial)[_ngcontent-%COMP%]   comparten[_ngcontent-%COMP%]   estilo.\r\n.filtros-lista[_ngcontent-%COMP%]     {\r\n  .filtros-lista__filtro {\r\n    display: grid;\r\n    gap: 4px;\r\n    color: #60727c;\r\n    font-size: .82rem;\r\n    font-weight: 650;\r\n  }\r\n  .filtros-lista__filtro :is(select, input) {\r\n    min-width: 160px;\r\n    min-height: 42px;\r\n    padding: 8px 10px;\r\n    border: 1px solid #ccd6db;\r\n    border-radius: 9px;\r\n    background: #fff;\r\n    color: var(--%NS%color-text);\r\n    font: inherit;\r\n    font-size: .92rem;\r\n  }\r\n}\r\n\r\n@media (max-width: 560px) {\r\n  .filtros-lista[_ngcontent-%COMP%]     .filtros-lista__filtro { flex: 1 1 100%; }\r\n  .filtros-lista[_ngcontent-%COMP%]     .filtros-lista__filtro :is(select, input) { width: 100%; }\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FiltrosListaComponent, [{
        type: Component,
        args: [{ selector: 'app-filtros-lista', standalone: true, imports: [SearchFieldComponent], changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"filtros-lista\" role=\"search\">\r\n  <app-search-field class=\"filtros-lista__busqueda\" [value]=\"lista().busqueda()\" [placeholder]=\"placeholder()\"\r\n    [ariaLabel]=\"etiqueta()\" (valueChange)=\"lista().buscar($event)\" />\r\n  @for (filtro of lista().filtros; track filtro.nombre) {\r\n    <label class=\"filtros-lista__filtro\">\r\n      <span>{{ filtro.etiqueta }}</span>\r\n      <select (change)=\"cambiar(filtro.nombre, $event)\">\r\n        @for (opcion of filtro.opciones; track opcion.valor) {\r\n          <option [value]=\"opcion.valor\" [selected]=\"opcion.valor === lista().valor(filtro.nombre)\">{{ opcion.etiqueta }}</option>\r\n        }\r\n      </select>\r\n    </label>\r\n  }\r\n  <ng-content />\r\n</div>\r\n", styles: [":host { display: block; }\r\n\r\n.filtros-lista {\r\n  display: flex;\r\n  flex-wrap: wrap;\r\n  align-items: end;\r\n  gap: 10px 14px;\r\n}\r\n.filtros-lista__busqueda { flex: 1 1 280px; }\r\n\r\n// Los filtros propios y los que se proyectan (por ejemplo, las fechas del historial) comparten estilo.\r\n.filtros-lista ::ng-deep {\r\n  .filtros-lista__filtro {\r\n    display: grid;\r\n    gap: 4px;\r\n    color: #60727c;\r\n    font-size: .82rem;\r\n    font-weight: 650;\r\n  }\r\n  .filtros-lista__filtro :is(select, input) {\r\n    min-width: 160px;\r\n    min-height: 42px;\r\n    padding: 8px 10px;\r\n    border: 1px solid #ccd6db;\r\n    border-radius: 9px;\r\n    background: #fff;\r\n    color: var(--color-text);\r\n    font: inherit;\r\n    font-size: .92rem;\r\n  }\r\n}\r\n\r\n@media (max-width: 560px) {\r\n  .filtros-lista ::ng-deep .filtros-lista__filtro { flex: 1 1 100%; }\r\n  .filtros-lista ::ng-deep .filtros-lista__filtro :is(select, input) { width: 100%; }\r\n}\r\n"] }]
    }], null, { lista: [{ type: i0.Input, args: [{ isSignal: true, alias: "lista", required: true }] }], placeholder: [{ type: i0.Input, args: [{ isSignal: true, alias: "placeholder", required: false }] }], etiqueta: [{ type: i0.Input, args: [{ isSignal: true, alias: "etiqueta", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(FiltrosListaComponent, { className: "FiltrosListaComponent", filePath: "src/app/shared/components/filtros-lista/filtros-lista.component.ts", lineNumber: 22 }); })();
