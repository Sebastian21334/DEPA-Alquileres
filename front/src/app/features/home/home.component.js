import { Component, inject, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { HeroSearchComponent } from './components/hero-search/hero-search.component';
import { ListingCardComponent } from '../../shared/components/listing-card/listing-card.component';
import { CatalogoService } from '../../shared/services/catalogo.service';
import { ListingService } from './listing.service';
import * as i0 from "@angular/core";
const _c0 = a0 => ({ categoria: a0 });
const _c1 = () => ({});
const _forTrack0 = ($index, $item) => $item.titulo;
const _forTrack1 = ($index, $item) => $item.id;
function HomeComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 1);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.error());
} }
function HomeComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 2);
    i0.ɵɵtext(1, "Cargando publicaciones\u2026");
    i0.ɵɵelementEnd();
} }
function HomeComponent_Conditional_3_For_2_For_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-listing-card", 8);
} if (rf & 2) {
    const publicacion_r2 = ctx.$implicit;
    i0.ɵɵproperty("publicacion", publicacion_r2)("miniaturaInicio", true);
} }
function HomeComponent_Conditional_3_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 4)(1, "div", 5)(2, "h2");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "a", 6);
    i0.ɵɵtext(5, "Ver m\u00E1s");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "div", 7);
    i0.ɵɵrepeaterCreate(7, HomeComponent_Conditional_3_For_2_For_8_Template, 1, 2, "app-listing-card", 8, _forTrack1);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const seccion_r3 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(seccion_r3.titulo);
    i0.ɵɵadvance();
    i0.ɵɵproperty("queryParams", seccion_r3.categoria ? i0.ɵɵpureFunction1(2, _c0, seccion_r3.categoria) : i0.ɵɵpureFunction0(4, _c1));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(seccion_r3.publicaciones);
} }
function HomeComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 3);
    i0.ɵɵrepeaterCreate(1, HomeComponent_Conditional_3_For_2_Template, 9, 5, "section", 4, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.secciones());
} }
export class HomeComponent {
    listingService = inject(ListingService);
    catalogoService = inject(CatalogoService);
    fb = inject(FormBuilder);
    cargando = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cargando" }] : /* istanbul ignore next */ []));
    error = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    secciones = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "secciones" }] : /* istanbul ignore next */ []));
    modalidades = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "modalidades" }] : /* istanbul ignore next */ []));
    form = this.fb.nonNullable.group({
        busqueda: '',
    });
    constructor() {
        this.catalogoService.getModalidades().subscribe({
            next: (modalidades) => this.modalidades.set(modalidades),
            error: (error) => console.error('No se pudieron cargar las modalidades', error),
        });
        // Cada petición está limitada a cuatro registros: el inicio nunca descarga el catálogo completo.
        forkJoin({
            recientes: this.listingService.getActivas({ limite: 4, categoria: 'recientes' }),
            temporales: this.listingService.getActivas({ limite: 4, categoria: 'temporales' }),
            largoPlazo: this.listingService.getActivas({ limite: 4, categoria: 'largo-plazo' }),
            villaMaria: this.listingService.getActivas({ limite: 4, categoria: 'villa-maria' }),
            reservadas: this.listingService.getActivas({ limite: 4, categoria: 'reservadas' }),
        }).subscribe({
            next: (r) => {
                this.secciones.set([
                    { titulo: 'Recién publicadas', publicaciones: r.recientes.datos },
                    { titulo: 'Alquileres temporales', categoria: 'temporales', publicaciones: r.temporales.datos },
                    { titulo: 'Para quedarte más tiempo', categoria: 'largo-plazo', publicaciones: r.largoPlazo.datos },
                    { titulo: 'Alquileres en Villa María', categoria: 'villa-maria', publicaciones: r.villaMaria.datos },
                    { titulo: 'Las más reservadas', categoria: 'reservadas', publicaciones: r.reservadas.datos },
                ].filter((seccion) => seccion.publicaciones.length));
                this.cargando.set(false);
            },
            error: (err) => { this.error.set(err.message); this.cargando.set(false); },
        });
    }
    static ɵfac = function HomeComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HomeComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HomeComponent, selectors: [["app-home"]], decls: 4, vars: 3, consts: [[3, "form", "modalidades"], [1, "home-state", "home-state--error"], [1, "home-state"], ["aria-label", "Publicaciones destacadas", 1, "featured"], [1, "featured__section"], [1, "featured__section-heading"], ["routerLink", "/publicaciones", 3, "queryParams"], [1, "featured__grid"], [3, "publicacion", "miniaturaInicio"]], template: function HomeComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "app-hero-search", 0);
            i0.ɵɵconditionalCreate(1, HomeComponent_Conditional_1_Template, 2, 1, "p", 1)(2, HomeComponent_Conditional_2_Template, 2, 0, "p", 2)(3, HomeComponent_Conditional_3_Template, 3, 0, "section", 3);
        } if (rf & 2) {
            i0.ɵɵproperty("form", ctx.form)("modalidades", ctx.modalidades());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.error() ? 1 : ctx.cargando() ? 2 : 3);
        } }, dependencies: [RouterLink, HeroSearchComponent, ListingCardComponent], styles: ["[_nghost-%COMP%] {\r\n  display: block;\r\n  --%NS%color-primary: #d94217;\r\n  --%NS%color-primary-dark: #b53613;\r\n  --%NS%color-secondary: #124aa6;\r\n  --%NS%color-accent: #ff9702;\r\n  --%NS%color-text: #0b2435;\r\n  --%NS%color-bg: #303030;\r\n}\r\n\r\n.home-state[_ngcontent-%COMP%] { padding: 2rem 1rem; text-align: center; }.home-state--error[_ngcontent-%COMP%] { color: var(--%NS%color-danger); }\r\n\r\n.featured[_ngcontent-%COMP%] {\r\n  max-width: var(--%NS%max-width-page, 1200px);\r\n  margin: 0 auto;\r\n  padding: 2.75rem 1rem 1rem;\r\n}\r\n\r\n.featured__heading[_ngcontent-%COMP%] { margin-bottom: 2rem; }\r\n.featured__heading[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%], .featured__section[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] { margin: 0; color: var(--%NS%color-text); }\r\n.featured__heading[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { font-size: clamp(1.65rem, 3vw, 2.2rem); }\r\n.featured__eyebrow[_ngcontent-%COMP%] { margin: 0 0 .35rem; color: var(--%NS%color-primary); font-weight: 800; font-size: .8rem; letter-spacing: .08em; text-transform: uppercase; }\r\n.featured__section[_ngcontent-%COMP%] { margin-top: 2.25rem; }\r\n.featured__section-heading[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }.featured__section-heading[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] { color: var(--%NS%color-secondary); font-weight: 800; text-decoration: none; }.featured__section-heading[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover { text-decoration: underline; }\r\n.featured__section[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { font-size: 1.3rem; }\r\n.featured__grid[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; }\r\n\r\n@media (max-width: 1050px) { .featured__grid[_ngcontent-%COMP%] { grid-template-columns: repeat(2, minmax(0, 1fr)); } }\r\n@media (max-width: 580px) { .featured[_ngcontent-%COMP%] { padding-top: 2rem; } .featured__grid[_ngcontent-%COMP%] { display: flex; overflow-x: auto; padding-bottom: .5rem; } .featured__grid[_ngcontent-%COMP%]   app-listing-card[_ngcontent-%COMP%] { min-width: 280px; } }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HomeComponent, [{
        type: Component,
        args: [{ selector: 'app-home', standalone: true, imports: [RouterLink, HeroSearchComponent, ListingCardComponent], template: "<app-hero-search [form]=\"form\" [modalidades]=\"modalidades()\" />\n@if (error()) { <p class=\"home-state home-state--error\">{{ error() }}</p> } @else if (cargando()) { <p class=\"home-state\">Cargando publicaciones\u2026</p> } @else { <section class=\"featured\" aria-label=\"Publicaciones destacadas\">@for (seccion of secciones(); track seccion.titulo) { <section class=\"featured__section\"><div class=\"featured__section-heading\"><h2>{{ seccion.titulo }}</h2><a routerLink=\"/publicaciones\" [queryParams]=\"seccion.categoria ? { categoria: seccion.categoria } : {}\">Ver m\u00E1s</a></div><div class=\"featured__grid\">@for (publicacion of seccion.publicaciones; track publicacion.id) { <app-listing-card [publicacion]=\"publicacion\" [miniaturaInicio]=\"true\" /> }</div></section> }</section> }\n", styles: [":host {\r\n  display: block;\r\n  --color-primary: #d94217;\r\n  --color-primary-dark: #b53613;\r\n  --color-secondary: #124aa6;\r\n  --color-accent: #ff9702;\r\n  --color-text: #0b2435;\r\n  --color-bg: #303030;\r\n}\r\n\r\n.home-state { padding: 2rem 1rem; text-align: center; }.home-state--error { color: var(--color-danger); }\r\n\r\n.featured {\r\n  max-width: var(--max-width-page, 1200px);\r\n  margin: 0 auto;\r\n  padding: 2.75rem 1rem 1rem;\r\n}\r\n\r\n.featured__heading { margin-bottom: 2rem; }\r\n.featured__heading h2, .featured__section h3 { margin: 0; color: var(--color-text); }\r\n.featured__heading h2 { font-size: clamp(1.65rem, 3vw, 2.2rem); }\r\n.featured__eyebrow { margin: 0 0 .35rem; color: var(--color-primary); font-weight: 800; font-size: .8rem; letter-spacing: .08em; text-transform: uppercase; }\r\n.featured__section { margin-top: 2.25rem; }\r\n.featured__section-heading { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }.featured__section-heading a { color: var(--color-secondary); font-weight: 800; text-decoration: none; }.featured__section-heading a:hover { text-decoration: underline; }\r\n.featured__section h2 { font-size: 1.3rem; }\r\n.featured__grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; }\r\n\r\n@media (max-width: 1050px) { .featured__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }\r\n@media (max-width: 580px) { .featured { padding-top: 2rem; } .featured__grid { display: flex; overflow-x: auto; padding-bottom: .5rem; } .featured__grid app-listing-card { min-width: 280px; } }\r\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HomeComponent, { className: "HomeComponent", filePath: "src/app/features/home/home.component.ts", lineNumber: 15 }); })();
