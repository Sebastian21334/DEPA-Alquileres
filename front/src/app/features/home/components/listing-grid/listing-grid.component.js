import { Component, EventEmitter, Output, input } from '@angular/core';
import { ListingCardComponent } from '../../../../shared/components/listing-card/listing-card.component';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';
import * as i0 from "@angular/core";
const _c0 = a0 => [a0];
const _forTrack0 = ($index, $item) => $item.id;
function ListingGridComponent_Conditional_1_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h2", 6)(1, "span", 14);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const t_r2 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(t_r2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", t_r2 === 1 ? "Propiedad encontrada" : "Propiedades encontradas", " ");
} }
function ListingGridComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 1);
    i0.ɵɵrepeaterCreate(1, ListingGridComponent_Conditional_1_For_2_Template, 4, 2, "h2", 6, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementStart(3, "label", 7)(4, "span");
    i0.ɵɵtext(5, "Ordenar por");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "select", 8);
    i0.ɵɵlistener("change", function ListingGridComponent_Conditional_1_Template_select_change_6_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.sortChange.emit($event.target.value)); });
    i0.ɵɵelementStart(7, "option", 9);
    i0.ɵɵtext(8, "M\u00E1s recientes");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "option", 10);
    i0.ɵɵtext(10, "M\u00E1s antiguas");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "option", 11);
    i0.ɵɵtext(12, "Menor precio");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "option", 12);
    i0.ɵɵtext(14, "Mayor precio");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "option", 13);
    i0.ɵɵtext(16, "Nombre (A-Z)");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(i0.ɵɵpureFunction1(1, _c0, ctx_r2.total()));
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("value", ctx_r2.sortOrder());
} }
function ListingGridComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 3)(1, "p");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.error());
} }
function ListingGridComponent_Conditional_4_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "div", 15);
} }
function ListingGridComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 4);
    i0.ɵɵrepeaterCreate(1, ListingGridComponent_Conditional_4_For_2_Template, 1, 0, "div", 15, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.skeletons);
} }
function ListingGridComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 5)(1, "p", 16);
    i0.ɵɵtext(2, "No encontramos publicaciones");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4, "Prob\u00E1 ajustar la ubicaci\u00F3n o los filtros de b\u00FAsqueda.");
    i0.ɵɵelementEnd()();
} }
function ListingGridComponent_Conditional_6_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-listing-card", 18);
} if (rf & 2) {
    const p_r4 = ctx.$implicit;
    const ɵ$index_61_r5 = ctx.$index;
    i0.ɵɵproperty("publicacion", p_r4)("revealDelay", ɵ$index_61_r5 % 4 * 90);
} }
function ListingGridComponent_Conditional_6_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 19)(1, "button", 20);
    i0.ɵɵlistener("click", function ListingGridComponent_Conditional_6_Conditional_3_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r6); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.loadMore.emit()); });
    i0.ɵɵtext(2, " Cargar m\u00E1s ");
    i0.ɵɵelementEnd()();
} }
function ListingGridComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 17);
    i0.ɵɵrepeaterCreate(1, ListingGridComponent_Conditional_6_For_2_Template, 1, 2, "app-listing-card", 18, _forTrack0);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, ListingGridComponent_Conditional_6_Conditional_3_Template, 3, 0, "div", 19);
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.listings());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.hasMore() ? 3 : -1);
} }
// Grilla de resultados: estado de carga (skeletons), estado vacío y paginación
// simple ("Cargar más"). El backend actual no pagina server-side, así que
// `listings` ya viene recortado por HomeComponent (ver comentario en
// listing.service.ts sobre el contrato de filtros/paginación pendiente).
export class ListingGridComponent {
    listings = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "listings" }] : /* istanbul ignore next */ []));
    loading = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "loading" }] : /* istanbul ignore next */ []));
    total = input(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "total" }] : /* istanbul ignore next */ []));
    error = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    hasMore = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hasMore" }] : /* istanbul ignore next */ []));
    sortOrder = input('recientes', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "sortOrder" }] : /* istanbul ignore next */ []));
    loadMore = new EventEmitter();
    sortChange = new EventEmitter();
    skeletons = Array.from({ length: 6 });
    static ɵfac = function ListingGridComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ListingGridComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ListingGridComponent, selectors: [["app-listing-grid"]], inputs: { listings: [1, "listings"], loading: [1, "loading"], total: [1, "total"], error: [1, "error"], hasMore: [1, "hasMore"], sortOrder: [1, "sortOrder"] }, outputs: { loadMore: "loadMore", sortChange: "sortChange" }, decls: 7, vars: 2, consts: [["id", "resultados", 1, "results"], [1, "results__toolbar"], [1, "results__inner"], [1, "results__state", "results__state--error"], ["aria-busy", "true", 1, "results__grid"], ["appReveal", "zoom", 1, "results__state"], ["aria-live", "polite", 1, "results__count"], [1, "results__sort"], [3, "change", "value"], ["value", "recientes"], ["value", "antiguas"], ["value", "precio-menor"], ["value", "precio-mayor"], ["value", "titulo"], [1, "results__number"], [1, "skeleton-card"], [1, "results__state-title"], [1, "results__grid"], ["appReveal", "zoom", 3, "publicacion", "revealDelay"], [1, "results__load-more"], ["type", "button", 1, "btn", "btn--outline", "shine", 3, "click"]], template: function ListingGridComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0);
            i0.ɵɵconditionalCreate(1, ListingGridComponent_Conditional_1_Template, 17, 3, "div", 1);
            i0.ɵɵelementStart(2, "div", 2);
            i0.ɵɵconditionalCreate(3, ListingGridComponent_Conditional_3_Template, 3, 1, "div", 3)(4, ListingGridComponent_Conditional_4_Template, 3, 0, "div", 4)(5, ListingGridComponent_Conditional_5_Template, 5, 0, "div", 5)(6, ListingGridComponent_Conditional_6_Template, 4, 1);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.loading() && !ctx.error() ? 1 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.error() ? 3 : ctx.loading() ? 4 : ctx.listings().length === 0 ? 5 : 6);
        } }, dependencies: [ListingCardComponent, RevealDirective], styles: [".results[_ngcontent-%COMP%] {\n  padding: 0 0 3.5rem;\n  background: transparent;\n}\n\r\n.results__inner[_ngcontent-%COMP%] {\r\n  max-width: 1216px;\n  padding: 18px 0 0;\n  margin: 0 auto;\r\n}\r\n\r\n.results__grid[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  grid-template-columns: repeat(4, minmax(0, 1fr));\r\n  gap: 18px;\n}\r\n\r\n.results__state[_ngcontent-%COMP%] {\r\n  text-align: center;\r\n  padding: 3rem 1rem;\r\n  color: #526273;\r\n}\r\n\r\n.results__state--error[_ngcontent-%COMP%] {\r\n  color: var(--%NS%color-danger);\r\n}\r\n\r\n.results__state-title[_ngcontent-%COMP%] {\r\n  font-weight: 700;\r\n  font-size: 1.1rem;\r\n  color: var(--%NS%color-text);\r\n  margin-bottom: 0.25rem;\r\n}\r\n\r\n.results__load-more[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  justify-content: center;\r\n  margin-top: 2.5rem;\r\n}\r\n\r\n.btn--outline[_ngcontent-%COMP%] {\r\n  padding: 0.65rem 1.75rem;\r\n  border-radius: var(--%NS%radius-pill);\r\n  border: 1px solid var(--%NS%color-border);\r\n  background: var(--%NS%color-surface);\r\n  color: var(--%NS%color-text);\r\n  font-weight: 700;\r\n  cursor: pointer;\r\n}\r\n\r\n.btn--%NS%outline[_ngcontent-%COMP%]:hover {\r\n  background: var(--%NS%color-primary);\r\n  border-color: var(--%NS%color-primary);\r\n  color: var(--%NS%color-primary-contrast);\r\n}\r\n\r\n.skeleton-card[_ngcontent-%COMP%] {\r\n  aspect-ratio: 3 / 4;\r\n  border-radius: var(--%NS%radius-md);\r\n  background: linear-gradient(\r\n    100deg,\r\n    var(--%NS%color-border) 30%,\r\n    #f0f1f3 50%,\r\n    var(--%NS%color-border) 70%\r\n  );\r\n  background-size: 200% 100%;\r\n  animation: _ngcontent-%COMP%_shimmer 1.4s ease-in-out infinite;\r\n}\r\n\r\n@keyframes _ngcontent-%COMP%_shimmer {\r\n  from {\r\n    background-position: 150% 0;\r\n  }\r\n  to {\r\n    background-position: -50% 0;\r\n  }\r\n}\r\n.results__toolbar[_ngcontent-%COMP%] {\n  max-width: 1216px;\n  margin: 0 auto;\n  padding: 17px 0 4px;\n  border-radius: 0;\n  background: transparent;\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: 1rem;\r\n  box-shadow: none;\n}\r\n\r\n.results__count[_ngcontent-%COMP%] {\r\n  margin: 0;\r\n  color: #172541;\n  font-size: clamp(1.1rem, 2.2vw, 1.875rem);\r\n  font-weight: 500;\n}\r\n\r\n.results__sort[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.6rem;\r\n  color: #526273;\r\n  font-size: 0.9rem;\r\n  font-weight: 600;\r\n  white-space: nowrap;\r\n}\r\n\r\n.results__sort[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\r\n  appearance: auto;\r\n  padding: 0.55rem 0.75rem;\r\n  border: 1px solid #d4dce6;\r\n  border-radius: 0.5rem;\r\n  background: #fff;\r\n  color: var(--%NS%color-text);\r\n  font: inherit;\r\n  cursor: pointer;\r\n}\r\n\r\n.results__sort[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]:focus-visible {\r\n  outline: 3px solid rgb(18 74 166 / 20%);\r\n  outline-offset: 2px;\r\n  border-color: var(--%NS%color-secondary);\r\n}\r\n@media (max-width: 1100px) {\r\n  .results__grid[_ngcontent-%COMP%] {\r\n    grid-template-columns: repeat(3, minmax(0, 1fr));\r\n  }\r\n}\r\n@media (max-width: 850px) {\r\n  .results__grid[_ngcontent-%COMP%] {\r\n    grid-template-columns: repeat(2, minmax(0, 1fr));\r\n  }\r\n}\r\n@media (max-width: 540px) {\n  .results__grid[_ngcontent-%COMP%] {\r\n    grid-template-columns: minmax(0, 1fr);\r\n  }\r\n  .results__inner[_ngcontent-%COMP%] {\r\n    padding: 18px 1rem 0;\n  }\r\n  .results__toolbar[_ngcontent-%COMP%] {\r\n    align-items: flex-start;\r\n    flex-direction: column;\r\n    padding: 16px 1rem 4px;\n  }\r\n  .results__sort[_ngcontent-%COMP%] {\r\n    width: 100%;\r\n    justify-content: space-between;\r\n  }\r\n}\r\n@media (prefers-reduced-motion: reduce) {\r\n  .skeleton-card[_ngcontent-%COMP%] {\r\n    animation: none;\r\n  }\r\n}\r\n\r\n\r\n.results__count[_ngcontent-%COMP%] {\r\n  animation: _ngcontent-%COMP%_count-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;\r\n}\r\n.results__number[_ngcontent-%COMP%] {\r\n  display: inline-block;\r\n  font-weight: 800;\r\n  color: var(--%NS%color-accent);\r\n  animation: depa-pop 0.6s 0.1s ease both;\r\n}\r\n@keyframes _ngcontent-%COMP%_count-in {\r\n  from { opacity: 0; transform: translateY(-12px); }\r\n  to { opacity: 1; transform: none; }\r\n}\r\n.btn--outline[_ngcontent-%COMP%] {\r\n  transition: background 0.25s ease, color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;\r\n}\r\n.btn--%NS%outline[_ngcontent-%COMP%]:hover {\r\n  transform: translateY(-3px);\r\n  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.35);\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ListingGridComponent, [{
        type: Component,
        args: [{ selector: 'app-listing-grid', standalone: true, imports: [ListingCardComponent, RevealDirective], template: "<section class=\"results\" id=\"resultados\">\r\n  @if (!loading() && !error()) {\r\n    <div class=\"results__toolbar\">\r\n      @for (t of [total()]; track t) {\r\n        <h2 class=\"results__count\" aria-live=\"polite\">\r\n          <span class=\"results__number\">{{ t }}</span>\r\n          {{ t === 1 ? 'Propiedad encontrada' : 'Propiedades encontradas' }}\r\n        </h2>\r\n      }\r\n\r\n      <label class=\"results__sort\">\r\n        <span>Ordenar por</span>\r\n        <select [value]=\"sortOrder()\" (change)=\"sortChange.emit($any($event.target).value)\">\r\n          <option value=\"recientes\">M\u00E1s recientes</option>\r\n          <option value=\"antiguas\">M\u00E1s antiguas</option>\r\n          <option value=\"precio-menor\">Menor precio</option>\r\n          <option value=\"precio-mayor\">Mayor precio</option>\r\n          <option value=\"titulo\">Nombre (A-Z)</option>\r\n        </select>\r\n      </label>\r\n    </div>\r\n  }\r\n  <div class=\"results__inner\">\r\n    @if (error()) {\r\n      <div class=\"results__state results__state--error\">\r\n        <p>{{ error() }}</p>\r\n      </div>\r\n    } @else if (loading()) {\r\n      <div class=\"results__grid\" aria-busy=\"true\">\r\n        @for (s of skeletons; track $index) {\r\n          <div class=\"skeleton-card\"></div>\r\n        }\r\n      </div>\r\n    } @else if (listings().length === 0) {\r\n      <div class=\"results__state\" appReveal=\"zoom\">\r\n        <p class=\"results__state-title\">No encontramos publicaciones</p>\r\n        <p>Prob\u00E1 ajustar la ubicaci\u00F3n o los filtros de b\u00FAsqueda.</p>\r\n      </div>\r\n    } @else {\r\n      <div class=\"results__grid\">\r\n        @for (p of listings(); track p.id; let i = $index) {\r\n          <app-listing-card [publicacion]=\"p\" appReveal=\"zoom\" [revealDelay]=\"(i % 4) * 90\" />\r\n        }\r\n      </div>\r\n\r\n      @if (hasMore()) {\r\n        <div class=\"results__load-more\">\r\n          <button type=\"button\" class=\"btn btn--outline shine\" (click)=\"loadMore.emit()\">\r\n            Cargar m\u00E1s\r\n          </button>\r\n        </div>\r\n      }\r\n    }\r\n  </div>\r\n</section>\r\n", styles: [".results {\n  padding: 0 0 3.5rem;\n  background: transparent;\n}\n\r\n.results__inner {\r\n  max-width: 1216px;\n  padding: 18px 0 0;\n  margin: 0 auto;\r\n}\r\n\r\n.results__grid {\r\n  display: grid;\r\n  grid-template-columns: repeat(4, minmax(0, 1fr));\r\n  gap: 18px;\n}\r\n\r\n.results__state {\r\n  text-align: center;\r\n  padding: 3rem 1rem;\r\n  color: #526273;\r\n}\r\n\r\n.results__state--error {\r\n  color: var(--color-danger);\r\n}\r\n\r\n.results__state-title {\r\n  font-weight: 700;\r\n  font-size: 1.1rem;\r\n  color: var(--color-text);\r\n  margin-bottom: 0.25rem;\r\n}\r\n\r\n.results__load-more {\r\n  display: flex;\r\n  justify-content: center;\r\n  margin-top: 2.5rem;\r\n}\r\n\r\n.btn--outline {\r\n  padding: 0.65rem 1.75rem;\r\n  border-radius: var(--radius-pill);\r\n  border: 1px solid var(--color-border);\r\n  background: var(--color-surface);\r\n  color: var(--color-text);\r\n  font-weight: 700;\r\n  cursor: pointer;\r\n}\r\n\r\n.btn--outline:hover {\r\n  background: var(--color-primary);\r\n  border-color: var(--color-primary);\r\n  color: var(--color-primary-contrast);\r\n}\r\n\r\n.skeleton-card {\r\n  aspect-ratio: 3 / 4;\r\n  border-radius: var(--radius-md);\r\n  background: linear-gradient(\r\n    100deg,\r\n    var(--color-border) 30%,\r\n    #f0f1f3 50%,\r\n    var(--color-border) 70%\r\n  );\r\n  background-size: 200% 100%;\r\n  animation: shimmer 1.4s ease-in-out infinite;\r\n}\r\n\r\n@keyframes shimmer {\r\n  from {\r\n    background-position: 150% 0;\r\n  }\r\n  to {\r\n    background-position: -50% 0;\r\n  }\r\n}\r\n.results__toolbar {\n  max-width: 1216px;\n  margin: 0 auto;\n  padding: 17px 0 4px;\n  border-radius: 0;\n  background: transparent;\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: 1rem;\r\n  box-shadow: none;\n}\r\n\r\n.results__count {\r\n  margin: 0;\r\n  color: #172541;\n  font-size: clamp(1.1rem, 2.2vw, 1.875rem);\r\n  font-weight: 500;\n}\r\n\r\n.results__sort {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.6rem;\r\n  color: #526273;\r\n  font-size: 0.9rem;\r\n  font-weight: 600;\r\n  white-space: nowrap;\r\n}\r\n\r\n.results__sort select {\r\n  appearance: auto;\r\n  padding: 0.55rem 0.75rem;\r\n  border: 1px solid #d4dce6;\r\n  border-radius: 0.5rem;\r\n  background: #fff;\r\n  color: var(--color-text);\r\n  font: inherit;\r\n  cursor: pointer;\r\n}\r\n\r\n.results__sort select:focus-visible {\r\n  outline: 3px solid rgb(18 74 166 / 20%);\r\n  outline-offset: 2px;\r\n  border-color: var(--color-secondary);\r\n}\r\n@media (max-width: 1100px) {\r\n  .results__grid {\r\n    grid-template-columns: repeat(3, minmax(0, 1fr));\r\n  }\r\n}\r\n@media (max-width: 850px) {\r\n  .results__grid {\r\n    grid-template-columns: repeat(2, minmax(0, 1fr));\r\n  }\r\n}\r\n@media (max-width: 540px) {\n  .results__grid {\r\n    grid-template-columns: minmax(0, 1fr);\r\n  }\r\n  .results__inner {\r\n    padding: 18px 1rem 0;\n  }\r\n  .results__toolbar {\r\n    align-items: flex-start;\r\n    flex-direction: column;\r\n    padding: 16px 1rem 4px;\n  }\r\n  .results__sort {\r\n    width: 100%;\r\n    justify-content: space-between;\r\n  }\r\n}\r\n@media (prefers-reduced-motion: reduce) {\r\n  .skeleton-card {\r\n    animation: none;\r\n  }\r\n}\r\n\r\n/* ---------- Animaciones ---------- */\r\n.results__count {\r\n  animation: count-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;\r\n}\r\n.results__number {\r\n  display: inline-block;\r\n  font-weight: 800;\r\n  color: var(--color-accent);\r\n  animation: depa-pop 0.6s 0.1s ease both;\r\n}\r\n@keyframes count-in {\r\n  from { opacity: 0; transform: translateY(-12px); }\r\n  to { opacity: 1; transform: none; }\r\n}\r\n.btn--outline {\r\n  transition: background 0.25s ease, color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;\r\n}\r\n.btn--outline:hover {\r\n  transform: translateY(-3px);\r\n  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.35);\r\n}\r\n"] }]
    }], null, { listings: [{ type: i0.Input, args: [{ isSignal: true, alias: "listings", required: true }] }], loading: [{ type: i0.Input, args: [{ isSignal: true, alias: "loading", required: false }] }], total: [{ type: i0.Input, args: [{ isSignal: true, alias: "total", required: false }] }], error: [{ type: i0.Input, args: [{ isSignal: true, alias: "error", required: false }] }], hasMore: [{ type: i0.Input, args: [{ isSignal: true, alias: "hasMore", required: false }] }], sortOrder: [{ type: i0.Input, args: [{ isSignal: true, alias: "sortOrder", required: false }] }], loadMore: [{
            type: Output
        }], sortChange: [{
            type: Output
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ListingGridComponent, { className: "ListingGridComponent", filePath: "src/app/features/home/components/listing-grid/listing-grid.component.ts", lineNumber: 17 }); })();
