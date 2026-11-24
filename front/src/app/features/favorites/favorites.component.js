import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ListingCardComponent } from '../../shared/components/listing-card/listing-card.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { FavoritesService } from '../../shared/services/favorites.service';
import * as i0 from "@angular/core";
const _forTrack0 = ($index, $item) => $item.id;
function FavoritesComponent_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 3);
    i0.ɵɵelement(1, "app-spinner");
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3, "Cargando tus favoritos\u2026");
    i0.ɵɵelementEnd()();
} }
function FavoritesComponent_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 4)(1, "h2");
    i0.ɵɵtext(2, "No pudimos cargar la secci\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.error());
} }
function FavoritesComponent_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 5)(1, "span", 6);
    i0.ɵɵtext(2, "\u2661");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "h2");
    i0.ɵɵtext(4, "Todav\u00EDa no guardaste publicaciones");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p");
    i0.ɵɵtext(6, "Us\u00E1 el marcador de cada propiedad para armar tu lista de favoritos.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "a", 7);
    i0.ɵɵtext(8, "Explorar publicaciones");
    i0.ɵɵelementEnd()();
} }
function FavoritesComponent_Conditional_12_For_4_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-listing-card", 11);
    i0.ɵɵlistener("favoriteChange", function FavoritesComponent_Conditional_12_For_4_Template_app_listing_card_favoriteChange_0_listener($event) { const item_r3 = i0.ɵɵrestoreView(_r2).$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.favoriteChanged(item_r3.id, $event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r3 = ctx.$implicit;
    i0.ɵɵproperty("publicacion", item_r3);
} }
function FavoritesComponent_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 8);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "div", 9);
    i0.ɵɵrepeaterCreate(3, FavoritesComponent_Conditional_12_For_4_Template, 1, 1, "app-listing-card", 10, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", ctx_r0.favorites().length, " ", ctx_r0.favorites().length === 1 ? "propiedad guardada" : "propiedades guardadas");
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r0.favorites());
} }
export class FavoritesComponent {
    favoritesApi = inject(FavoritesService);
    favorites = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "favorites" }] : /* istanbul ignore next */ []));
    loading = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "loading" }] : /* istanbul ignore next */ []));
    error = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    constructor() {
        this.favoritesApi.list().pipe(finalize(() => this.loading.set(false))).subscribe({
            next: (items) => this.favorites.set(items),
            error: () => this.error.set('No pudimos cargar tus favoritos. Intentá nuevamente.'),
        });
    }
    favoriteChanged(id, favorite) {
        if (!favorite)
            this.favorites.update((items) => items.filter((item) => item.id !== id));
    }
    static ɵfac = function FavoritesComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || FavoritesComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: FavoritesComponent, selectors: [["app-favorites"]], decls: 13, vars: 1, consts: [[1, "favorites-page"], [1, "favorites-wrap"], [1, "favorites-header"], [1, "favorites-state"], [1, "favorites-state", "favorites-state--error"], [1, "favorites-state", "favorites-state--empty"], ["aria-hidden", "true", 1, "empty-bookmark"], ["routerLink", "/publicaciones"], [1, "favorites-summary"], [1, "favorites-grid"], [3, "publicacion"], [3, "favoriteChange", "publicacion"]], template: function FavoritesComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "div", 1)(2, "header", 2)(3, "span");
            i0.ɵɵtext(4, "Tu selecci\u00F3n");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "h1");
            i0.ɵɵtext(6, "Mis favoritos");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "p");
            i0.ɵɵtext(8, "Guard\u00E1 las propiedades que te interesan para encontrarlas r\u00E1pidamente m\u00E1s tarde.");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(9, FavoritesComponent_Conditional_9_Template, 4, 0, "div", 3)(10, FavoritesComponent_Conditional_10_Template, 5, 1, "div", 4)(11, FavoritesComponent_Conditional_11_Template, 9, 0, "div", 5)(12, FavoritesComponent_Conditional_12_Template, 5, 2);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(9);
            i0.ɵɵconditional(ctx.loading() ? 9 : ctx.error() ? 10 : !ctx.favorites().length ? 11 : 12);
        } }, dependencies: [RouterLink, ListingCardComponent, SpinnerComponent], styles: ["[_nghost-%COMP%] { display: block; min-height: 70vh; }\r\n.favorites-page[_ngcontent-%COMP%] { min-height: 70vh; padding: 3rem 1.25rem 4.5rem; background: #f5f7fb; }\r\n.favorites-wrap[_ngcontent-%COMP%] { width: min(1180px, 100%); margin: 0 auto; }\r\n.favorites-header[_ngcontent-%COMP%] { padding-bottom: 1.6rem; border-bottom: 1px solid var(--%NS%color-border); }\r\n.favorites-header[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] { color: var(--%NS%color-secondary); font-size: .75rem; font-weight: 850; letter-spacing: .1em; text-transform: uppercase; }\r\n.favorites-header[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] { margin: .35rem 0 .45rem; color: #101f3a; font-size: clamp(2rem, 4vw, 3rem); letter-spacing: -.035em; }\r\n.favorites-header[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { max-width: 620px; margin: 0; color: var(--%NS%color-text-muted); line-height: 1.6; }\r\n.favorites-summary[_ngcontent-%COMP%] { margin: 1.5rem 0 1rem; color: #53627a; font-size: .86rem; font-weight: 750; }\r\n.favorites-grid[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.35rem; }\r\n.favorites-state[_ngcontent-%COMP%] { display: grid; min-height: 330px; place-items: center; align-content: center; padding: 2rem; text-align: center; color: var(--%NS%color-text-muted); }\r\n.favorites-state[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: .6rem 0 .25rem; color: #172640; }\r\n.favorites-state[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; }\r\n.favorites-state[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] { margin-top: 1.25rem; padding: .75rem 1rem; border-radius: 8px; background: var(--%NS%color-primary); color: white; font-weight: 800; text-decoration: none; }\r\n.favorites-state--error[_ngcontent-%COMP%] { color: var(--%NS%color-secondary); }\r\n.empty-bookmark[_ngcontent-%COMP%] { display: grid; width: 4rem; height: 4rem; place-items: center; border-radius: 50%; background: #fff0ed; color: var(--%NS%color-secondary); font-size: 2.25rem; }\r\n@media (max-width: 900px) { .favorites-grid[_ngcontent-%COMP%] { grid-template-columns: repeat(2, minmax(0, 1fr)); } }\r\n@media (max-width: 580px) { .favorites-page[_ngcontent-%COMP%] { padding: 2rem 1rem 3rem; } .favorites-grid[_ngcontent-%COMP%] { grid-template-columns: 1fr; } }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FavoritesComponent, [{
        type: Component,
        args: [{ selector: 'app-favorites', standalone: true, imports: [RouterLink, ListingCardComponent, SpinnerComponent], template: "<section class=\"favorites-page\">\r\n  <div class=\"favorites-wrap\">\r\n    <header class=\"favorites-header\">\r\n      <span>Tu selecci\u00F3n</span>\r\n      <h1>Mis favoritos</h1>\r\n      <p>Guard\u00E1 las propiedades que te interesan para encontrarlas r\u00E1pidamente m\u00E1s tarde.</p>\r\n    </header>\r\n\r\n    @if (loading()) {\r\n      <div class=\"favorites-state\"><app-spinner /><p>Cargando tus favoritos\u2026</p></div>\r\n    } @else if (error()) {\r\n      <div class=\"favorites-state favorites-state--error\"><h2>No pudimos cargar la secci\u00F3n</h2><p>{{ error() }}</p></div>\r\n    } @else if (!favorites().length) {\r\n      <div class=\"favorites-state favorites-state--empty\">\r\n        <span class=\"empty-bookmark\" aria-hidden=\"true\">\u2661</span>\r\n        <h2>Todav\u00EDa no guardaste publicaciones</h2>\r\n        <p>Us\u00E1 el marcador de cada propiedad para armar tu lista de favoritos.</p>\r\n        <a routerLink=\"/publicaciones\">Explorar publicaciones</a>\r\n      </div>\r\n    } @else {\r\n      <div class=\"favorites-summary\">{{ favorites().length }} {{ favorites().length === 1 ? 'propiedad guardada' : 'propiedades guardadas' }}</div>\r\n      <div class=\"favorites-grid\">\r\n        @for (item of favorites(); track item.id) {\r\n          <app-listing-card [publicacion]=\"item\" (favoriteChange)=\"favoriteChanged(item.id, $event)\" />\r\n        }\r\n      </div>\r\n    }\r\n  </div>\r\n</section>\r\n", styles: [":host { display: block; min-height: 70vh; }\r\n.favorites-page { min-height: 70vh; padding: 3rem 1.25rem 4.5rem; background: #f5f7fb; }\r\n.favorites-wrap { width: min(1180px, 100%); margin: 0 auto; }\r\n.favorites-header { padding-bottom: 1.6rem; border-bottom: 1px solid var(--color-border); }\r\n.favorites-header > span { color: var(--color-secondary); font-size: .75rem; font-weight: 850; letter-spacing: .1em; text-transform: uppercase; }\r\n.favorites-header h1 { margin: .35rem 0 .45rem; color: #101f3a; font-size: clamp(2rem, 4vw, 3rem); letter-spacing: -.035em; }\r\n.favorites-header p { max-width: 620px; margin: 0; color: var(--color-text-muted); line-height: 1.6; }\r\n.favorites-summary { margin: 1.5rem 0 1rem; color: #53627a; font-size: .86rem; font-weight: 750; }\r\n.favorites-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.35rem; }\r\n.favorites-state { display: grid; min-height: 330px; place-items: center; align-content: center; padding: 2rem; text-align: center; color: var(--color-text-muted); }\r\n.favorites-state h2 { margin: .6rem 0 .25rem; color: #172640; }\r\n.favorites-state p { margin: 0; }\r\n.favorites-state a { margin-top: 1.25rem; padding: .75rem 1rem; border-radius: 8px; background: var(--color-primary); color: white; font-weight: 800; text-decoration: none; }\r\n.favorites-state--error { color: var(--color-secondary); }\r\n.empty-bookmark { display: grid; width: 4rem; height: 4rem; place-items: center; border-radius: 50%; background: #fff0ed; color: var(--color-secondary); font-size: 2.25rem; }\r\n@media (max-width: 900px) { .favorites-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }\r\n@media (max-width: 580px) { .favorites-page { padding: 2rem 1rem 3rem; } .favorites-grid { grid-template-columns: 1fr; } }\r\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(FavoritesComponent, { className: "FavoritesComponent", filePath: "src/app/features/favorites/favorites.component.ts", lineNumber: 16 }); })();
