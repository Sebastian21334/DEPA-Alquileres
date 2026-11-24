import { Component, DestroyRef, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, finalize, of, switchMap } from 'rxjs';
import { LucideBadgeCheck, LucideBuilding2, LucideMapPin, LucideSearch } from '@lucide/angular';
import { ListingService } from '../home/listing.service';
import { AnunciantePublicoService } from '../../shared/services/anunciante-publico.service';
import { esInmobiliaria } from '../../shared/utils/anunciante';
import { ListingCardComponent } from '../../shared/components/listing-card/listing-card.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import * as i0 from "@angular/core";
const _c0 = ["publicationsHeading"];
const _forTrack0 = ($index, $item) => $item.id;
function AdvertiserProfileComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 3);
    i0.ɵɵelement(1, "app-spinner");
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3, "Cargando perfil\u2026");
    i0.ɵɵelementEnd()();
} }
function AdvertiserProfileComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 3)(1, "h1");
    i0.ɵɵtext(2, "Perfil no disponible");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "a", 5);
    i0.ɵɵtext(6, "Volver al inicio");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.error());
} }
function AdvertiserProfileComponent_Conditional_3_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 8);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 15);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 13);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.verifiedLabel());
} }
function AdvertiserProfileComponent_Conditional_3_Conditional_11_For_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ciudad_r2 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ciudad_r2);
} }
function AdvertiserProfileComponent_Conditional_3_Conditional_11_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 20);
    i0.ɵɵlistener("click", function AdvertiserProfileComponent_Conditional_3_Conditional_11_Conditional_7_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.verTodasLasCiudades.set(!ctx_r0.verTodasLasCiudades())); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵattribute("aria-expanded", ctx_r0.verTodasLasCiudades());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.verTodasLasCiudades() ? "Ver menos" : "Ver " + ctx_r0.ciudadesOcultas() + " m\u00E1s", " ");
} }
function AdvertiserProfileComponent_Conditional_3_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 11)(1, "h2", 16);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 17);
    i0.ɵɵtext(3, " Ciudades donde publica");
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "ul", 18);
    i0.ɵɵrepeaterCreate(5, AdvertiserProfileComponent_Conditional_3_Conditional_11_For_6_Template, 2, 1, "li", null, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(7, AdvertiserProfileComponent_Conditional_3_Conditional_11_Conditional_7_Template, 2, 2, "button", 19);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 16);
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r0.ciudadesVisibles());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.ciudadesOcultas() ? 7 : -1);
} }
function AdvertiserProfileComponent_Conditional_3_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1, "Tel\u00E9fono");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const owner_r4 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(owner_r4.numero_contacto);
} }
function AdvertiserProfileComponent_Conditional_3_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 14);
    i0.ɵɵtext(1, "No pudimos cargar las publicaciones de este anunciante.");
    i0.ɵɵelementEnd();
} }
function AdvertiserProfileComponent_Conditional_3_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 14);
    i0.ɵɵtext(1, "Este anunciante no tiene publicaciones activas.");
    i0.ɵɵelementEnd();
} }
function AdvertiserProfileComponent_Conditional_3_Conditional_31_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " No encontramos publicaciones que coincidan con tu b\u00FAsqueda. ");
} }
function AdvertiserProfileComponent_Conditional_3_Conditional_31_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵtextInterpolate3(" Mostrando ", ctx_r0.firstPublication(), "-", ctx_r0.lastPublication(), " de ", ctx_r0.matchingPublications().length, " publicaciones ");
} }
function AdvertiserProfileComponent_Conditional_3_Conditional_31_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵtextInterpolate2(" ", ctx_r0.matchingPublications().length, " ", ctx_r0.matchingPublications().length === 1 ? "publicaci\u00F3n" : "publicaciones", " ");
} }
function AdvertiserProfileComponent_Conditional_3_Conditional_31_For_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-listing-card", 28);
} if (rf & 2) {
    const item_r7 = ctx.$implicit;
    const ɵ$index_127_r8 = ctx.$index;
    i0.ɵɵproperty("publicacion", item_r7)("revealDelay", ɵ$index_127_r8 % 3 * 100);
} }
function AdvertiserProfileComponent_Conditional_3_Conditional_31_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "nav", 29)(1, "button", 30);
    i0.ɵɵlistener("click", function AdvertiserProfileComponent_Conditional_3_Conditional_31_Conditional_14_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r9); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.goToPage(ctx_r0.page() - 1)); });
    i0.ɵɵtext(2, "Anterior");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "button", 30);
    i0.ɵɵlistener("click", function AdvertiserProfileComponent_Conditional_3_Conditional_31_Conditional_14_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r9); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.goToPage(ctx_r0.page() + 1)); });
    i0.ɵɵtext(6, "Siguiente");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r0.page() === 1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("P\u00E1gina ", ctx_r0.page(), " de ", ctx_r0.totalPages());
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r0.page() === ctx_r0.totalPages());
} }
function AdvertiserProfileComponent_Conditional_3_Conditional_31_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 21)(1, "label", 22);
    i0.ɵɵtext(2, "Buscar publicaciones");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 23);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(4, "svg", 24);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(5, "input", 25, 1);
    i0.ɵɵlistener("input", function AdvertiserProfileComponent_Conditional_3_Conditional_31_Template_input_input_5_listener() { i0.ɵɵrestoreView(_r5); const searchInput_r6 = i0.ɵɵreference(6); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.updateSearch(searchInput_r6.value)); });
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(7, "p", 26);
    i0.ɵɵconditionalCreate(8, AdvertiserProfileComponent_Conditional_3_Conditional_31_Conditional_8_Template, 1, 0)(9, AdvertiserProfileComponent_Conditional_3_Conditional_31_Conditional_9_Template, 1, 3)(10, AdvertiserProfileComponent_Conditional_3_Conditional_31_Conditional_10_Template, 1, 2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "div", 27);
    i0.ɵɵrepeaterCreate(12, AdvertiserProfileComponent_Conditional_3_Conditional_31_For_13_Template, 1, 2, "app-listing-card", 28, _forTrack0);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(14, AdvertiserProfileComponent_Conditional_3_Conditional_31_Conditional_14_Template, 7, 4, "nav", 29);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("size", 18);
    i0.ɵɵadvance();
    i0.ɵɵproperty("value", ctx_r0.searchText());
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(!ctx_r0.matchingPublications().length ? 8 : ctx_r0.totalPages() > 1 ? 9 : 10);
    i0.ɵɵadvance(4);
    i0.ɵɵrepeater(ctx_r0.visiblePublications());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.totalPages() > 1 ? 14 : -1);
} }
function AdvertiserProfileComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 4)(1, "aside")(2, "section", 6);
    i0.ɵɵelement(3, "app-avatar", 7);
    i0.ɵɵelementStart(4, "h1");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(6, AdvertiserProfileComponent_Conditional_3_Conditional_6_Template, 3, 2, "span", 8);
    i0.ɵɵelementStart(7, "ul", 9)(8, "li");
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(9, "svg", 10);
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(11, AdvertiserProfileComponent_Conditional_3_Conditional_11_Template, 8, 2, "div", 11);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(12, "section", 12)(13, "h2");
    i0.ɵɵtext(14, "Datos p\u00FAblicos");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(15, AdvertiserProfileComponent_Conditional_3_Conditional_15_Template, 4, 1);
    i0.ɵɵelementStart(16, "span");
    i0.ɵɵtext(17, "Propiedades publicadas");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "p");
    i0.ɵɵtext(19);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "span");
    i0.ɵɵtext(21, "Tipo de anunciante");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "p");
    i0.ɵɵtext(23);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(24, "main")(25, "div", 13, 0)(27, "h2");
    i0.ɵɵtext(28);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(29, AdvertiserProfileComponent_Conditional_3_Conditional_29_Template, 2, 0, "p", 14)(30, AdvertiserProfileComponent_Conditional_3_Conditional_30_Template, 2, 0, "p", 14)(31, AdvertiserProfileComponent_Conditional_3_Conditional_31_Template, 15, 4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const owner_r4 = ctx;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("foto", owner_r4.foto_url)("nombre", ctx_r0.name());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.name());
    i0.ɵɵadvance();
    i0.ɵɵconditional(owner_r4.verificado ? 6 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("size", 16);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", owner_r4.tipoAnunciante?.nombre ?? "Anunciante");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.ciudades().length ? 11 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("revealDelay", 120);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(owner_r4.numero_contacto ? 15 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate2("", ctx_r0.publications().length, " ", ctx_r0.publications().length === 1 ? "activa" : "activas");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(owner_r4.tipoAnunciante?.nombre ?? "Anunciante");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1("Publicaciones de ", ctx_r0.name());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.publicationsError() ? 29 : !ctx_r0.publications().length ? 30 : 31);
} }
/** Ciudades que se ven antes de «Ver más». */
const CIUDADES_VISIBLES = 5;
function normalizeSearchText(value) {
    return value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('es-AR');
}
export class AdvertiserProfileComponent {
    route = inject(ActivatedRoute);
    router = inject(Router);
    destroyRef = inject(DestroyRef);
    listings = inject(ListingService);
    profiles = inject(AnunciantePublicoService);
    publicationsHeading = viewChild('publicationsHeading', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "publicationsHeading" }] : /* istanbul ignore next */ []));
    requestedPage = signal(1, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "requestedPage" }] : /* istanbul ignore next */ []));
    pageSize = 6;
    publications = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "publications" }] : /* istanbul ignore next */ []));
    perfil = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "perfil" }] : /* istanbul ignore next */ []));
    publicationsError = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "publicationsError" }] : /* istanbul ignore next */ []));
    searchText = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "searchText" }] : /* istanbul ignore next */ []));
    matchingPublications = computed(() => {
        const query = normalizeSearchText(this.searchText()).trim();
        if (!query)
            return this.publications();
        const terms = query.split(/\s+/);
        return this.publications().filter(({ titulo, descripcion }) => {
            const text = normalizeSearchText(`${titulo} ${descripcion ?? ''}`);
            return terms.every((term) => text.includes(term));
        });
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "matchingPublications" }] : /* istanbul ignore next */ []));
    totalPages = computed(() => Math.ceil(this.matchingPublications().length / this.pageSize), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "totalPages" }] : /* istanbul ignore next */ []));
    page = computed(() => Math.min(this.requestedPage(), this.totalPages() || 1), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "page" }] : /* istanbul ignore next */ []));
    firstPublication = computed(() => (this.page() - 1) * this.pageSize + 1, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "firstPublication" }] : /* istanbul ignore next */ []));
    lastPublication = computed(() => Math.min(this.page() * this.pageSize, this.matchingPublications().length), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "lastPublication" }] : /* istanbul ignore next */ []));
    visiblePublications = computed(() => this.matchingPublications().slice((this.page() - 1) * this.pageSize, this.page() * this.pageSize), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "visiblePublications" }] : /* istanbul ignore next */ []));
    loading = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "loading" }] : /* istanbul ignore next */ []));
    error = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    name = computed(() => this.perfil()?.nombre_publico?.trim() || 'Anunciante', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "name" }] : /* istanbul ignore next */ []));
    verifiedLabel = computed(() => esInmobiliaria(this.perfil()?.tipoAnunciante) ? 'Inmobiliaria verificada' : 'Dueño Verificado', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "verifiedLabel" }] : /* istanbul ignore next */ []));
    /** Ciudades donde publica, sin repetir; primero las que tienen más publicaciones y, si empatan, alfabético. */
    ciudades = computed(() => {
        const cantidades = new Map();
        for (const item of this.publications()) {
            const ciudad = [item.ciudad?.nombre, item.provincia?.nombre].filter(Boolean).join(', ');
            if (ciudad)
                cantidades.set(ciudad, (cantidades.get(ciudad) ?? 0) + 1);
        }
        return [...cantidades]
            .sort(([ciudadA, cantidadA], [ciudadB, cantidadB]) => cantidadB - cantidadA || ciudadA.localeCompare(ciudadB, 'es'))
            .map(([ciudad]) => ciudad);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ciudades" }] : /* istanbul ignore next */ []));
    verTodasLasCiudades = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "verTodasLasCiudades" }] : /* istanbul ignore next */ []));
    ciudadesVisibles = computed(() => this.verTodasLasCiudades() ? this.ciudades() : this.ciudades().slice(0, CIUDADES_VISIBLES), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ciudadesVisibles" }] : /* istanbul ignore next */ []));
    ciudadesOcultas = computed(() => Math.max(0, this.ciudades().length - CIUDADES_VISIBLES), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ciudadesOcultas" }] : /* istanbul ignore next */ []));
    constructor() {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (!Number.isInteger(id) || id < 1) {
            this.error.set('El perfil solicitado no es válido.');
            this.loading.set(false);
            return;
        }
        this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
            const page = Number(params.get('pagina'));
            this.requestedPage.set(Number.isSafeInteger(page) && page > 0 ? page : 1);
        });
        this.profiles.getPublicProfile(id).pipe(switchMap((perfil) => {
            this.perfil.set(perfil);
            return this.listings.getByAdvertiser(id).pipe(catchError(() => {
                this.publicationsError.set(true);
                return of([]);
            }));
        }), finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (items) => this.publications.set(items),
            error: () => this.error.set('No pudimos cargar este perfil.'),
        });
    }
    updateSearch(text) {
        this.searchText.set(text);
        if (this.requestedPage() === 1)
            return;
        this.requestedPage.set(1);
        void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { pagina: null },
            queryParamsHandling: 'merge',
            replaceUrl: true,
        });
    }
    goToPage(page) {
        if (!Number.isInteger(page) || page < 1 || page > this.totalPages() || page === this.page())
            return;
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { pagina: page === 1 ? null : page },
            queryParamsHandling: 'merge',
        }).then((navigated) => {
            if (navigated)
                this.publicationsHeading()?.nativeElement.scrollIntoView({ block: 'start' });
        });
    }
    static ɵfac = function AdvertiserProfileComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AdvertiserProfileComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AdvertiserProfileComponent, selectors: [["app-advertiser-profile"]], viewQuery: function AdvertiserProfileComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.publicationsHeading, _c0, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, decls: 4, vars: 1, consts: [["publicationsHeading", ""], ["searchInput", ""], ["aria-live", "polite", 1, "profile-shell"], [1, "state"], [1, "profile-layout"], ["routerLink", "/"], ["appReveal", "left", 1, "owner-card"], [1, "avatar", 3, "foto", "nombre"], [1, "verified"], [1, "owner-card__meta"], ["lucideBuilding2", "", 3, "size"], [1, "owner-cities"], ["appReveal", "left", 1, "public-data", 3, "revealDelay"], ["appReveal", "right", 1, "heading"], ["role", "status", 1, "publications-empty"], ["lucideBadgeCheck", "", 3, "size"], ["id", "owner-cities-title"], ["lucideMapPin", "", "aria-hidden", "true", 3, "size"], ["id", "owner-cities-list", "aria-labelledby", "owner-cities-title", 1, "owner-cities__list"], ["type", "button", "aria-controls", "owner-cities-list", 1, "owner-cities__more"], ["type", "button", "aria-controls", "owner-cities-list", 1, "owner-cities__more", 3, "click"], ["role", "search", "aria-label", "Publicaciones del anunciante", 1, "publication-search"], ["for", "advertiser-publication-search"], [1, "publication-search__field"], ["lucideSearch", "", "aria-hidden", "true", 3, "size"], ["id", "advertiser-publication-search", "type", "search", "placeholder", "Busc\u00E1 por t\u00EDtulo o descripci\u00F3n", 3, "input", "value"], ["role", "status", 1, "listings-range"], [1, "listings"], ["appReveal", "zoom", 3, "publicacion", "revealDelay"], ["aria-label", "Paginaci\u00F3n de publicaciones del anunciante", 1, "pagination"], ["type", "button", 3, "click", "disabled"]], template: function AdvertiserProfileComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 2);
            i0.ɵɵconditionalCreate(1, AdvertiserProfileComponent_Conditional_1_Template, 4, 0, "div", 3)(2, AdvertiserProfileComponent_Conditional_2_Template, 7, 1, "div", 3)(3, AdvertiserProfileComponent_Conditional_3_Template, 32, 14, "div", 4);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_0_0;
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.loading() ? 1 : ctx.error() ? 2 : (tmp_0_0 = ctx.perfil()) ? 3 : -1, tmp_0_0);
        } }, dependencies: [RouterLink, ListingCardComponent, SpinnerComponent, RevealDirective, AvatarComponent, LucideBadgeCheck, LucideBuilding2, LucideMapPin, LucideSearch], styles: ["[_nghost-%COMP%] { display: block; }\r\n.profile-shell[_ngcontent-%COMP%] { min-height: 70vh; padding: 40px 24px 70px; background: var(--%NS%color-bg); }\r\n.profile-layout[_ngcontent-%COMP%] { max-width: var(--%NS%max-width-page); margin: 0 auto; display: grid; grid-template-columns: 285px 1fr; gap: 30px; align-items: start; }\r\naside[_ngcontent-%COMP%] { display: grid; gap: 18px; position: sticky; top: 96px; }\r\n\r\n.owner-card[_ngcontent-%COMP%], .public-data[_ngcontent-%COMP%] { padding: 24px; border: 1px solid var(--%NS%color-border); border-radius: 14px; background: #fff; box-shadow: var(--%NS%shadow-card); }\r\n.owner-card[_ngcontent-%COMP%] { text-align: center; }\r\n.avatar[_ngcontent-%COMP%] {\r\n  display: grid; place-items: center; width: 96px; height: 96px; margin: 0 auto 14px; border: 4px solid #fff; border-radius: 50%;\r\n  box-shadow: 0 0 0 3px var(--%NS%color-accent); color: #fff; background: linear-gradient(135deg, var(--%NS%color-secondary), var(--%NS%color-primary));\r\n  font-size: 2.2rem; font-weight: 800; animation: depa-pop .6s .2s ease both; transition: transform .4s cubic-bezier(.34,1.56,.64,1);\r\n}\r\n.owner-card[_ngcontent-%COMP%]:hover   .avatar[_ngcontent-%COMP%] { transform: scale(1.06) rotate(-5deg); }\r\n.owner-card[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] { margin: 0 0 8px; font-size: 1.4rem; font-weight: 800; }\r\n.verified[_ngcontent-%COMP%] { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 999px; color: var(--%NS%color-secondary); background: var(--%NS%color-secondary-light); font-size: .74rem; font-weight: 700; }\r\n.owner-card__meta[_ngcontent-%COMP%] { list-style: none; margin: 18px 0 0; padding: 16px 0 0; border-top: 1px solid var(--%NS%color-border); display: grid; gap: 10px; text-align: left; }\r\n.owner-card__meta[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 8px; color: #475467; font-size: .88rem; }\r\n.owner-card__meta[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { color: var(--%NS%color-accent); flex-shrink: 0; }\r\n.owner-cities[_ngcontent-%COMP%] { margin-top: 14px; text-align: left; }\r\n.owner-cities[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 8px; margin: 0 0 10px; color: #475467; font-size: .88rem; font-weight: 700; }\r\n.owner-cities[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { color: var(--%NS%color-accent); flex-shrink: 0; }\r\n.owner-cities__list[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; }\r\n.owner-cities__list[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] { padding: 4px 10px; border: 1px solid var(--%NS%color-border); border-radius: 999px; background: var(--%NS%color-bg); color: #344054; font-size: .78rem; font-weight: 600; overflow-wrap: anywhere; }\r\n.owner-cities__more[_ngcontent-%COMP%] { margin-top: 10px; padding: 0; border: 0; background: none; color: var(--%NS%color-secondary); font: inherit; font-size: .84rem; font-weight: 700; cursor: pointer; }\r\n.owner-cities__more[_ngcontent-%COMP%]:hover { text-decoration: underline; }\r\n.owner-cities__more[_ngcontent-%COMP%]:focus-visible { outline: 2px solid var(--%NS%color-secondary); outline-offset: 3px; border-radius: 4px; }\r\n\r\n.public-data[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 0 0 6px; font-size: 1.02rem; font-weight: 800; }\r\n.public-data[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { display: block; margin-top: 14px; color: var(--%NS%color-text-muted); font-size: .74rem; }\r\n.public-data[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], .public-data[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] { display: block; margin: 3px 0 0; font-size: .88rem; font-weight: 600; overflow-wrap: anywhere; }\r\n.public-data[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] { color: var(--%NS%color-secondary); text-decoration: none; }\r\n.public-data[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover { text-decoration: underline; }\r\n\r\n.heading[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 20px; scroll-margin-top: 96px; }\r\n.heading[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 0; font-size: 1.7rem; font-weight: 800; letter-spacing: -.02em; }\r\n.publication-search[_ngcontent-%COMP%] { display: grid; gap: 6px; max-width: 440px; margin-bottom: 16px; }\r\n.publication-search[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] { font-size: .88rem; font-weight: 700; }\r\n.publication-search__field[_ngcontent-%COMP%] { position: relative; }\r\n.publication-search__field[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { position: absolute; inset-inline-start: 14px; top: 50%; transform: translateY(-50%); color: var(--%NS%color-text-muted); pointer-events: none; }\r\n.publication-search[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] { width: 100%; min-height: 44px; padding: 8px 12px 8px 42px; border: 1px solid var(--%NS%color-border); border-radius: 8px; background: #fff; color: inherit; font: inherit; }\r\n.publication-search[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus-visible { outline: 2px solid var(--%NS%color-primary); outline-offset: 2px; }\r\n.listings[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }\r\n.listings-range[_ngcontent-%COMP%] { margin: 0 0 1rem; color: var(--%NS%color-text-muted); font-size: .88rem; }\r\n.publications-empty[_ngcontent-%COMP%] { margin: 0; padding: 2rem 1.25rem; border: 1px dashed var(--%NS%color-border); border-radius: 12px; background: #fff; color: var(--%NS%color-text-muted); text-align: center; }\r\n.pagination[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: .75rem; margin-top: 1.5rem; color: #506078; font-size: .88rem; font-weight: 700; }\r\n.pagination[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { min-height: 44px; padding: .6rem 1rem; border: 0; border-radius: 7px; background: var(--%NS%color-primary); color: #fff; font: inherit; cursor: pointer; }\r\n.pagination[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover:not(:disabled) { background: var(--%NS%color-primary-dark); }\r\n.pagination[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:disabled { opacity: .45; cursor: not-allowed; }\r\n.pagination[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:focus-visible { outline: 3px solid var(--%NS%color-accent); outline-offset: 3px; }\r\n\r\n.state[_ngcontent-%COMP%] { min-height: 55vh; display: grid; place-content: center; justify-items: center; text-align: center; color: var(--%NS%color-text-muted); }\r\n.state[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] { color: var(--%NS%color-primary); font-weight: 700; }\r\n\r\n@media (max-width: 1080px) { .listings[_ngcontent-%COMP%] { grid-template-columns: repeat(2, minmax(0, 1fr)); } }\r\n@media (max-width: 820px) {\r\n  .profile-shell[_ngcontent-%COMP%] { padding-inline: 16px; }\r\n  .profile-layout[_ngcontent-%COMP%] { grid-template-columns: 1fr; }\r\n  aside[_ngcontent-%COMP%] { position: static; }\r\n  .heading[_ngcontent-%COMP%] { align-items: flex-start; flex-direction: column; }\r\n}\r\n@media (max-width: 560px) { .listings[_ngcontent-%COMP%] { grid-template-columns: 1fr; } }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AdvertiserProfileComponent, [{
        type: Component,
        args: [{ selector: 'app-advertiser-profile', standalone: true, imports: [RouterLink, ListingCardComponent, SpinnerComponent, RevealDirective, AvatarComponent, LucideBadgeCheck, LucideBuilding2, LucideMapPin, LucideSearch], template: "<section class=\"profile-shell\" aria-live=\"polite\">\r\n  @if (loading()) {\r\n    <div class=\"state\"><app-spinner /><p>Cargando perfil\u2026</p></div>\r\n  } @else if (error()) {\r\n    <div class=\"state\"><h1>Perfil no disponible</h1><p>{{ error() }}</p><a routerLink=\"/\">Volver al inicio</a></div>\r\n  } @else if (perfil(); as owner) {\r\n    <div class=\"profile-layout\">\r\n      <aside>\r\n        <section class=\"owner-card\" appReveal=\"left\">\r\n          <app-avatar class=\"avatar\" [foto]=\"owner.foto_url\" [nombre]=\"name()\" />\r\n          <h1>{{ name() }}</h1>\r\n          @if (owner.verificado) {\r\n            <span class=\"verified\"><svg lucideBadgeCheck [size]=\"13\"></svg> {{ verifiedLabel() }}</span>\r\n          }\r\n          <ul class=\"owner-card__meta\">\r\n            <li><svg lucideBuilding2 [size]=\"16\"></svg> {{ owner.tipoAnunciante?.nombre ?? 'Anunciante' }}</li>\r\n          </ul>\r\n          <!-- Ciudades como chips, con l\u00EDmite y \u00ABVer m\u00E1s\u00BB. -->\r\n          @if (ciudades().length) {\r\n            <div class=\"owner-cities\">\r\n              <h2 id=\"owner-cities-title\"><svg lucideMapPin [size]=\"16\" aria-hidden=\"true\"></svg> Ciudades donde publica</h2>\r\n              <ul id=\"owner-cities-list\" class=\"owner-cities__list\" aria-labelledby=\"owner-cities-title\">\r\n                @for (ciudad of ciudadesVisibles(); track ciudad) { <li>{{ ciudad }}</li> }\r\n              </ul>\r\n              @if (ciudadesOcultas()) {\r\n                <button type=\"button\" class=\"owner-cities__more\" aria-controls=\"owner-cities-list\"\r\n                  [attr.aria-expanded]=\"verTodasLasCiudades()\" (click)=\"verTodasLasCiudades.set(!verTodasLasCiudades())\">\r\n                  {{ verTodasLasCiudades() ? 'Ver menos' : 'Ver ' + ciudadesOcultas() + ' m\u00E1s' }}\r\n                </button>\r\n              }\r\n            </div>\r\n          }\r\n        </section>\r\n\r\n        <section class=\"public-data\" appReveal=\"left\" [revealDelay]=\"120\">\r\n          <h2>Datos p\u00FAblicos</h2>\r\n          @if (owner.numero_contacto) { <span>Tel\u00E9fono</span><p>{{ owner.numero_contacto }}</p> }\r\n          <span>Propiedades publicadas</span>\r\n          <p>{{ publications().length }} {{ publications().length === 1 ? 'activa' : 'activas' }}</p>\r\n          <span>Tipo de anunciante</span><p>{{ owner.tipoAnunciante?.nombre ?? 'Anunciante' }}</p>\r\n        </section>\r\n      </aside>\r\n\r\n      <main>\r\n        <div class=\"heading\" #publicationsHeading appReveal=\"right\">\r\n          <h2>Publicaciones de {{ name() }}</h2>\r\n        </div>\r\n        @if (publicationsError()) {\r\n          <p class=\"publications-empty\" role=\"status\">No pudimos cargar las publicaciones de este anunciante.</p>\r\n        } @else if (!publications().length) {\r\n          <p class=\"publications-empty\" role=\"status\">Este anunciante no tiene publicaciones activas.</p>\r\n        } @else {\r\n          <div class=\"publication-search\" role=\"search\" aria-label=\"Publicaciones del anunciante\">\r\n            <label for=\"advertiser-publication-search\">Buscar publicaciones</label>\r\n            <div class=\"publication-search__field\">\r\n              <svg lucideSearch [size]=\"18\" aria-hidden=\"true\"></svg>\r\n              <input #searchInput id=\"advertiser-publication-search\" type=\"search\" placeholder=\"Busc\u00E1 por t\u00EDtulo o descripci\u00F3n\"\r\n                [value]=\"searchText()\" (input)=\"updateSearch(searchInput.value)\" />\r\n            </div>\r\n          </div>\r\n          <p class=\"listings-range\" role=\"status\">\r\n            @if (!matchingPublications().length) {\r\n              No encontramos publicaciones que coincidan con tu b\u00FAsqueda.\r\n            } @else if (totalPages() > 1) {\r\n              Mostrando {{ firstPublication() }}-{{ lastPublication() }} de {{ matchingPublications().length }} publicaciones\r\n            } @else {\r\n              {{ matchingPublications().length }} {{ matchingPublications().length === 1 ? 'publicaci\u00F3n' : 'publicaciones' }}\r\n            }\r\n          </p>\r\n          <div class=\"listings\">\r\n            @for (item of visiblePublications(); track item.id; let i = $index) {\r\n              <app-listing-card [publicacion]=\"item\" appReveal=\"zoom\" [revealDelay]=\"(i % 3) * 100\" />\r\n            }\r\n          </div>\r\n          @if (totalPages() > 1) {\r\n            <nav class=\"pagination\" aria-label=\"Paginaci\u00F3n de publicaciones del anunciante\">\r\n              <button type=\"button\" (click)=\"goToPage(page() - 1)\" [disabled]=\"page() === 1\">Anterior</button>\r\n              <span>P\u00E1gina {{ page() }} de {{ totalPages() }}</span>\r\n              <button type=\"button\" (click)=\"goToPage(page() + 1)\" [disabled]=\"page() === totalPages()\">Siguiente</button>\r\n            </nav>\r\n          }\r\n        }\r\n      </main>\r\n    </div>\r\n  }\r\n</section>\r\n", styles: [":host { display: block; }\r\n.profile-shell { min-height: 70vh; padding: 40px 24px 70px; background: var(--color-bg); }\r\n.profile-layout { max-width: var(--max-width-page); margin: 0 auto; display: grid; grid-template-columns: 285px 1fr; gap: 30px; align-items: start; }\r\naside { display: grid; gap: 18px; position: sticky; top: 96px; }\r\n\r\n.owner-card, .public-data { padding: 24px; border: 1px solid var(--color-border); border-radius: 14px; background: #fff; box-shadow: var(--shadow-card); }\r\n.owner-card { text-align: center; }\r\n.avatar {\r\n  display: grid; place-items: center; width: 96px; height: 96px; margin: 0 auto 14px; border: 4px solid #fff; border-radius: 50%;\r\n  box-shadow: 0 0 0 3px var(--color-accent); color: #fff; background: linear-gradient(135deg, var(--color-secondary), var(--color-primary));\r\n  font-size: 2.2rem; font-weight: 800; animation: depa-pop .6s .2s ease both; transition: transform .4s cubic-bezier(.34,1.56,.64,1);\r\n}\r\n.owner-card:hover .avatar { transform: scale(1.06) rotate(-5deg); }\r\n.owner-card h1 { margin: 0 0 8px; font-size: 1.4rem; font-weight: 800; }\r\n.verified { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 999px; color: var(--color-secondary); background: var(--color-secondary-light); font-size: .74rem; font-weight: 700; }\r\n.owner-card__meta { list-style: none; margin: 18px 0 0; padding: 16px 0 0; border-top: 1px solid var(--color-border); display: grid; gap: 10px; text-align: left; }\r\n.owner-card__meta li { display: flex; align-items: center; gap: 8px; color: #475467; font-size: .88rem; }\r\n.owner-card__meta svg { color: var(--color-accent); flex-shrink: 0; }\r\n.owner-cities { margin-top: 14px; text-align: left; }\r\n.owner-cities h2 { display: flex; align-items: center; gap: 8px; margin: 0 0 10px; color: #475467; font-size: .88rem; font-weight: 700; }\r\n.owner-cities h2 svg { color: var(--color-accent); flex-shrink: 0; }\r\n.owner-cities__list { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; }\r\n.owner-cities__list li { padding: 4px 10px; border: 1px solid var(--color-border); border-radius: 999px; background: var(--color-bg); color: #344054; font-size: .78rem; font-weight: 600; overflow-wrap: anywhere; }\r\n.owner-cities__more { margin-top: 10px; padding: 0; border: 0; background: none; color: var(--color-secondary); font: inherit; font-size: .84rem; font-weight: 700; cursor: pointer; }\r\n.owner-cities__more:hover { text-decoration: underline; }\r\n.owner-cities__more:focus-visible { outline: 2px solid var(--color-secondary); outline-offset: 3px; border-radius: 4px; }\r\n\r\n.public-data h2 { margin: 0 0 6px; font-size: 1.02rem; font-weight: 800; }\r\n.public-data span { display: block; margin-top: 14px; color: var(--color-text-muted); font-size: .74rem; }\r\n.public-data p, .public-data a { display: block; margin: 3px 0 0; font-size: .88rem; font-weight: 600; overflow-wrap: anywhere; }\r\n.public-data a { color: var(--color-secondary); text-decoration: none; }\r\n.public-data a:hover { text-decoration: underline; }\r\n\r\n.heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 20px; scroll-margin-top: 96px; }\r\n.heading h2 { margin: 0; font-size: 1.7rem; font-weight: 800; letter-spacing: -.02em; }\r\n.publication-search { display: grid; gap: 6px; max-width: 440px; margin-bottom: 16px; }\r\n.publication-search label { font-size: .88rem; font-weight: 700; }\r\n.publication-search__field { position: relative; }\r\n.publication-search__field svg { position: absolute; inset-inline-start: 14px; top: 50%; transform: translateY(-50%); color: var(--color-text-muted); pointer-events: none; }\r\n.publication-search input { width: 100%; min-height: 44px; padding: 8px 12px 8px 42px; border: 1px solid var(--color-border); border-radius: 8px; background: #fff; color: inherit; font: inherit; }\r\n.publication-search input:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }\r\n.listings { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }\r\n.listings-range { margin: 0 0 1rem; color: var(--color-text-muted); font-size: .88rem; }\r\n.publications-empty { margin: 0; padding: 2rem 1.25rem; border: 1px dashed var(--color-border); border-radius: 12px; background: #fff; color: var(--color-text-muted); text-align: center; }\r\n.pagination { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: .75rem; margin-top: 1.5rem; color: #506078; font-size: .88rem; font-weight: 700; }\r\n.pagination button { min-height: 44px; padding: .6rem 1rem; border: 0; border-radius: 7px; background: var(--color-primary); color: #fff; font: inherit; cursor: pointer; }\r\n.pagination button:hover:not(:disabled) { background: var(--color-primary-dark); }\r\n.pagination button:disabled { opacity: .45; cursor: not-allowed; }\r\n.pagination button:focus-visible { outline: 3px solid var(--color-accent); outline-offset: 3px; }\r\n\r\n.state { min-height: 55vh; display: grid; place-content: center; justify-items: center; text-align: center; color: var(--color-text-muted); }\r\n.state a { color: var(--color-primary); font-weight: 700; }\r\n\r\n@media (max-width: 1080px) { .listings { grid-template-columns: repeat(2, minmax(0, 1fr)); } }\r\n@media (max-width: 820px) {\r\n  .profile-shell { padding-inline: 16px; }\r\n  .profile-layout { grid-template-columns: 1fr; }\r\n  aside { position: static; }\r\n  .heading { align-items: flex-start; flex-direction: column; }\r\n}\r\n@media (max-width: 560px) { .listings { grid-template-columns: 1fr; } }\r\n"] }]
    }], () => [], { publicationsHeading: [{ type: i0.ViewChild, args: ['publicationsHeading', { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AdvertiserProfileComponent, { className: "AdvertiserProfileComponent", filePath: "src/app/features/advertiser-profile/advertiser-profile.component.ts", lineNumber: 30 }); })();
