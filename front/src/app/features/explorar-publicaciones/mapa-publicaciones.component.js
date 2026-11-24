import { isPlatformBrowser } from '@angular/common';
import { Component, Injector, PLATFORM_ID, ViewChild, afterNextRender, computed, effect, inject, input, signal, untracked, } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideHouse, LucideList, LucidePanelLeftClose, LucideX } from '@lucide/angular';
import { ListingService, } from '../home/listing.service';
import { ListingCardComponent } from '../../shared/components/listing-card/listing-card.component';
import { crearCapaMapaBase } from '../../shared/utils/mapa-base';
import * as i0 from "@angular/core";
const _c0 = ["contenedor"];
const _c1 = ["botonListado"];
const _c2 = ["botonCerrarListado"];
const _c3 = () => [];
const _c4 = () => ({ vista: null, pagina: null });
const _forTrack0 = ($index, $item) => $item.id;
function MapaPublicacionesComponent_Conditional_1_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " Buscando publicaciones\u2026 ");
} }
function MapaPublicacionesComponent_Conditional_1_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " No pudimos cargar los resultados. ");
} }
function MapaPublicacionesComponent_Conditional_1_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵtextInterpolate2(" ", ctx_r1.cantidad(), " ", ctx_r1.cantidad() === 1 ? "publicaci\u00F3n" : "publicaciones", " ");
} }
function MapaPublicacionesComponent_Conditional_1_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 26);
    i0.ɵɵlistener("click", function MapaPublicacionesComponent_Conditional_1_Conditional_13_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.reintentar()); });
    i0.ɵɵtext(1, "Reintentar");
    i0.ɵɵelementEnd();
} }
function MapaPublicacionesComponent_Conditional_1_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 23);
    i0.ɵɵtext(1, "No encontramos publicaciones con ubicaci\u00F3n para esta b\u00FAsqueda.");
    i0.ɵɵelementEnd();
} }
function MapaPublicacionesComponent_Conditional_1_For_17_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 30);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const punto_r5 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(punto_r5.ciudad);
} }
function MapaPublicacionesComponent_Conditional_1_For_17_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 33);
} if (rf & 2) {
    const punto_r5 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("src", punto_r5.portada, i0.ɵɵsanitizeUrl);
} }
function MapaPublicacionesComponent_Conditional_1_For_17_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(0, "svg", 34);
} if (rf & 2) {
    i0.ɵɵproperty("size", 24);
} }
function MapaPublicacionesComponent_Conditional_1_For_17_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li")(1, "button", 27);
    i0.ɵɵlistener("click", function MapaPublicacionesComponent_Conditional_1_For_17_Template_button_click_1_listener() { const punto_r5 = i0.ɵɵrestoreView(_r4).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.seleccionarDesdeListado(punto_r5)); });
    i0.ɵɵelementStart(2, "span", 28)(3, "span", 29);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "strong");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(7, MapaPublicacionesComponent_Conditional_1_For_17_Conditional_7_Template, 2, 1, "span", 30);
    i0.ɵɵelementStart(8, "span", 31);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(10, "span", 32);
    i0.ɵɵconditionalCreate(11, MapaPublicacionesComponent_Conditional_1_For_17_Conditional_11_Template, 1, 1, "img", 33)(12, MapaPublicacionesComponent_Conditional_1_For_17_Conditional_12_Template, 1, 1, ":svg:svg", 34);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const punto_r5 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-pressed", ctx_r1.seleccionado() === punto_r5.id);
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("mapa-listado__modalidad--temporal", punto_r5.temporal);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", punto_r5.temporal ? "Temporal" : "Largo plazo", " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(punto_r5.titulo);
    i0.ɵɵadvance();
    i0.ɵɵconditional(punto_r5.ciudad ? 7 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.textoPrecio(punto_r5));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(punto_r5.portada ? 11 : 12);
} }
function MapaPublicacionesComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "aside", 16);
    i0.ɵɵlistener("keydown.escape", function MapaPublicacionesComponent_Conditional_1_Template_aside_keydown_escape_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.alternarListado()); });
    i0.ɵɵelementStart(1, "header", 17)(2, "div")(3, "h2", 18);
    i0.ɵɵtext(4, "Alquileres en el mapa");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 13);
    i0.ɵɵconditionalCreate(6, MapaPublicacionesComponent_Conditional_1_Conditional_6_Template, 1, 0)(7, MapaPublicacionesComponent_Conditional_1_Conditional_7_Template, 1, 0)(8, MapaPublicacionesComponent_Conditional_1_Conditional_8_Template, 1, 2);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "button", 19, 2);
    i0.ɵɵlistener("click", function MapaPublicacionesComponent_Conditional_1_Template_button_click_9_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.alternarListado()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(11, "svg", 20);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(12, "div", 21);
    i0.ɵɵconditionalCreate(13, MapaPublicacionesComponent_Conditional_1_Conditional_13_Template, 2, 0, "button", 22)(14, MapaPublicacionesComponent_Conditional_1_Conditional_14_Template, 2, 0, "p", 23);
    i0.ɵɵelementStart(15, "ul", 24);
    i0.ɵɵrepeaterCreate(16, MapaPublicacionesComponent_Conditional_1_For_17_Template, 13, 8, "li", null, _forTrack0);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(18, "a", 25);
    i0.ɵɵtext(19, "Abrir cat\u00E1logo completo");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(6);
    i0.ɵɵconditional(ctx_r1.cargando() ? 6 : ctx_r1.error() ? 7 : 8);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("size", 19);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.error() ? 13 : !ctx_r1.cargando() && !ctx_r1.cantidad() ? 14 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r1.puntos());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction0(5, _c3))("queryParams", i0.ɵɵpureFunction0(6, _c4));
} }
function MapaPublicacionesComponent_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 14);
    i0.ɵɵtext(1, "No pudimos abrir el mapa. Pod\u00E9s seguir desde el listado.");
    i0.ɵɵelementEnd();
} }
function MapaPublicacionesComponent_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p", 14);
    i0.ɵɵtext(1, "No pudimos cargar las publicaciones. ");
    i0.ɵɵelementStart(2, "button", 35);
    i0.ɵɵlistener("click", function MapaPublicacionesComponent_Conditional_19_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.reintentar()); });
    i0.ɵɵtext(3, "Reintentar");
    i0.ɵɵelementEnd()();
} }
function MapaPublicacionesComponent_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 14);
    i0.ɵɵtext(1, "Buscando publicaciones\u2026");
    i0.ɵɵelementEnd();
} }
function MapaPublicacionesComponent_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 14);
    i0.ɵɵtext(1, "El fondo del mapa no est\u00E1 disponible por el momento.");
    i0.ɵɵelementEnd();
} }
function MapaPublicacionesComponent_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 14);
    i0.ɵɵtext(1, "No hay publicaciones con ubicaci\u00F3n para esta b\u00FAsqueda.");
    i0.ɵɵelementEnd();
} }
function MapaPublicacionesComponent_Conditional_23_Conditional_3_For_4_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li")(1, "button", 35);
    i0.ɵɵlistener("click", function MapaPublicacionesComponent_Conditional_23_Conditional_3_For_4_Template_button_click_1_listener() { const punto_r9 = i0.ɵɵrestoreView(_r8).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.seleccionar(punto_r9)); });
    i0.ɵɵtext(2);
    i0.ɵɵelementStart(3, "small");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const punto_r9 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", punto_r9.titulo, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.textoPrecio(punto_r9));
} }
function MapaPublicacionesComponent_Conditional_23_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 41);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "ul", 42);
    i0.ɵɵrepeaterCreate(3, MapaPublicacionesComponent_Conditional_23_Conditional_3_For_4_Template, 5, 2, "li", null, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("", ctx_r1.grupo().length, " publicaciones en este punto");
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.grupo());
} }
function MapaPublicacionesComponent_Conditional_23_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-listing-card", 39);
} if (rf & 2) {
    i0.ɵɵproperty("publicacion", ctx)("vistaMapa", true);
} }
function MapaPublicacionesComponent_Conditional_23_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 40);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.errorDetalle() ? "Esta publicaci\u00F3n ya no est\u00E1 disponible o no pudimos cargarla." : "Cargando vista previa\u2026");
} }
function MapaPublicacionesComponent_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "aside", 36);
    i0.ɵɵlistener("keydown.escape", function MapaPublicacionesComponent_Conditional_23_Template_aside_keydown_escape_0_listener() { i0.ɵɵrestoreView(_r7); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.cerrarDetalle()); });
    i0.ɵɵelementStart(1, "button", 37);
    i0.ɵɵlistener("click", function MapaPublicacionesComponent_Conditional_23_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r7); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.cerrarDetalle()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 38);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, MapaPublicacionesComponent_Conditional_23_Conditional_3_Template, 5, 1)(4, MapaPublicacionesComponent_Conditional_23_Conditional_4_Template, 1, 2, "app-listing-card", 39)(5, MapaPublicacionesComponent_Conditional_23_Conditional_5_Template, 2, 1, "p", 40);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_4_0;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 18);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.grupo().length ? 3 : (tmp_4_0 = ctx_r1.detalle()) ? 4 : 5, tmp_4_0);
} }
const VILLA_MARIA = [-32.41, -63.24];
const TAMANO_GRUPO = 105;
const MAX_PINES_DESPLEGADOS = 6;
const SEPARACION_VERTICAL = 56;
const SEPARACION_HORIZONTAL = 220;
const precio = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
export class MapaPublicacionesComponent {
    api = inject(ListingService);
    plataforma = inject(PLATFORM_ID);
    injector = inject(Injector);
    listo = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "listo" }] : /* istanbul ignore next */ []));
    reintento = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reintento" }] : /* istanbul ignore next */ []));
    seleccionado = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "seleccionado" }] : /* istanbul ignore next */ []));
    puntos = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "puntos" }] : /* istanbul ignore next */ []));
    leaflet;
    mapa;
    marcadores;
    grupoExpandido = [];
    observador;
    destruido = false;
    contextoAnterior;
    faltaCentrar = true;
    contenedor;
    botonListado;
    botonCerrarListado;
    filtros = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "filtros" }] : /* istanbul ignore next */ []));
    listadoAbierto = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "listadoAbierto" }] : /* istanbul ignore next */ []));
    cargando = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cargando" }] : /* istanbul ignore next */ []));
    error = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    errorMapa = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorMapa" }] : /* istanbul ignore next */ []));
    errorFondo = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorFondo" }] : /* istanbul ignore next */ []));
    cantidad = computed(() => this.puntos().length, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cantidad" }] : /* istanbul ignore next */ []));
    detalleAbierto = computed(() => this.seleccionado() !== null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "detalleAbierto" }] : /* istanbul ignore next */ []));
    detalle = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "detalle" }] : /* istanbul ignore next */ []));
    errorDetalle = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorDetalle" }] : /* istanbul ignore next */ []));
    grupo = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "grupo" }] : /* istanbul ignore next */ []));
    constructor() {
        effect((limpiar) => {
            if (!this.listo())
                return;
            const filtros = this.filtros();
            this.reintento();
            // Cambiar ciudad, provincia o búsqueda abre su ámbito completo.
            const contexto = JSON.stringify([filtros.idProvincia, filtros.idsCiudad, filtros.busqueda]);
            if (contexto !== this.contextoAnterior) {
                this.contextoAnterior = contexto;
                this.faltaCentrar = true;
            }
            this.grupoExpandido = [];
            this.limpiarSeleccion();
            this.cargando.set(true);
            this.error.set(false);
            this.puntos.set([]);
            this.marcadores?.clearLayers();
            const peticion = this.api.getMapa(filtros).subscribe({
                next: (puntos) => {
                    this.puntos.set(puntos);
                    if (this.faltaCentrar && puntos.length) {
                        this.faltaCentrar = false;
                        this.mapa?.fitBounds(puntos.map(({ latitud, longitud }) => [latitud, longitud]), {
                            padding: [60, 60], maxZoom: 14, animate: false,
                        });
                    }
                    this.dibujarPines();
                    this.cargando.set(false);
                },
                error: () => {
                    this.error.set(true);
                    this.cargando.set(false);
                },
            });
            limpiar(() => peticion.unsubscribe());
        });
        effect((limpiar) => {
            const id = this.seleccionado();
            this.detalle.set(null);
            this.errorDetalle.set(false);
            if (id === null)
                return;
            const peticion = this.api.getById(id).subscribe({
                next: (publicacion) => this.detalle.set(publicacion),
                error: () => this.errorDetalle.set(true),
            });
            limpiar(() => peticion.unsubscribe());
        });
    }
    async ngAfterViewInit() {
        if (!isPlatformBrowser(this.plataforma))
            return;
        try {
            const modulo = await import('leaflet');
            if (this.destruido)
                return;
            const L = modulo.default ?? modulo;
            this.leaflet = L;
            const elemento = this.contenedor.nativeElement;
            const mapa = L.map(elemento, {
                center: VILLA_MARIA,
                zoom: 12,
                minZoom: 4,
                maxZoom: 19,
                maxBounds: [[-85, -180], [85, 180]],
                zoomControl: false,
                scrollWheelZoom: true,
            });
            this.mapa = mapa;
            L.control.zoom({ position: 'bottomright', zoomInTitle: 'Acercar', zoomOutTitle: 'Alejar' }).addTo(mapa);
            crearCapaMapaBase(L)
                .on('tileerror', () => this.errorFondo.set(true))
                .on('tileload', () => this.errorFondo.set(false))
                .addTo(mapa);
            this.marcadores = L.featureGroup().addTo(mapa);
            mapa.on('moveend', () => this.dibujarPines());
            mapa.on('click', () => this.cerrarGrupo());
            this.observador = new ResizeObserver(() => mapa.invalidateSize({ debounceMoveend: true }));
            this.observador.observe(elemento);
            this.listo.set(true);
        }
        catch {
            this.mapa?.remove();
            this.mapa = undefined;
            this.errorMapa.set(true);
            this.listo.set(true);
        }
    }
    ngOnDestroy() {
        this.destruido = true;
        this.observador?.disconnect();
        this.mapa?.remove();
    }
    reintentar() {
        this.reintento.update((valor) => valor + 1);
    }
    seleccionar(punto) {
        if (!this.grupoExpandido.some(({ id }) => id === punto.id))
            this.grupoExpandido = [];
        this.seleccionado.set(punto.id);
        this.grupo.set([]);
        this.dibujarPines(punto.id);
    }
    alternarListado() {
        const abrir = !this.listadoAbierto();
        this.listadoAbierto.set(abrir);
        afterNextRender(() => {
            const destino = abrir ? this.botonCerrarListado : this.botonListado;
            destino?.nativeElement.focus({ preventScroll: true });
        }, { injector: this.injector });
    }
    seleccionarDesdeListado(punto) {
        const mapa = this.mapa;
        if (mapa)
            mapa.setView([punto.latitud, punto.longitud], Math.max(mapa.getZoom(), 15));
        this.seleccionar(punto);
        if (window.matchMedia('(max-width: 680px)').matches)
            this.alternarListado();
    }
    cerrarDetalle() {
        this.limpiarSeleccion();
        this.dibujarPines();
    }
    limpiarSeleccion() {
        this.seleccionado.set(null);
        this.grupo.set([]);
    }
    cerrarGrupo() {
        if (!this.grupoExpandido.length && this.seleccionado() === null && !this.grupo().length)
            return;
        this.grupoExpandido = [];
        this.cerrarDetalle();
    }
    textoPrecio(punto) {
        const importe = precio.format(punto.precio);
        const moneda = punto.moneda?.match(/\b(?:ARS|USD)\b/i)?.[0] ?? punto.moneda ?? '$';
        return `${moneda} ${importe} / ${punto.temporal ? 'día' : 'mes'}`;
    }
    dibujarPines(idFoco) {
        const mapa = this.mapa;
        const capa = this.marcadores;
        const leaflet = this.leaflet;
        if (!mapa || !capa || !leaflet)
            return;
        const elemento = mapa.getContainer();
        const foco = elemento.ownerDocument.activeElement;
        const conservarFoco = foco instanceof HTMLElement && foco.classList.contains('depa-pin') && elemento.contains(foco);
        const seleccionado = untracked(this.seleccionado);
        capa.clearLayers();
        const grupos = this.agruparPines(mapa);
        const grupoSeleccionado = grupos.find((grupo) => grupo.some(({ id }) => id === seleccionado));
        const expandido = this.grupoExpandido.length ? this.grupoExpandido : grupoSeleccionado ?? [];
        const idsExpandidos = new Set(expandido.map(({ id }) => id));
        for (const grupo of grupos) {
            const pendientes = grupo.filter(({ id }) => !idsExpandidos.has(id));
            if (pendientes.length)
                this.agregarMarcador(pendientes, leaflet, capa);
        }
        if (expandido.length)
            this.dibujarGrupoExpandido(expandido, seleccionado, mapa, leaflet, capa);
        if (conservarFoco) {
            const nuevoFoco = idFoco ?? (foco.hasAttribute('data-publicacion') ? Number(foco.dataset['publicacion']) : null);
            if (nuevoFoco !== null) {
                elemento.querySelector(`[data-publicacion="${nuevoFoco}"]`)?.focus({ preventScroll: true });
            }
        }
    }
    agruparPines(mapa) {
        const grupos = new Map();
        const limites = mapa.getBounds().pad(.25);
        for (const punto of this.puntos()) {
            if (!limites.contains([punto.latitud, punto.longitud]))
                continue;
            const posicion = mapa.project([punto.latitud, punto.longitud]);
            const celda = `${Math.floor(posicion.x / TAMANO_GRUPO)}:${Math.floor(posicion.y / 56)}`;
            const grupo = grupos.get(celda);
            if (grupo)
                grupo.push(punto);
            else
                grupos.set(celda, [punto]);
        }
        return [...grupos.values()];
    }
    dibujarGrupoExpandido(grupo, seleccionado, mapa, L, capa) {
        const [primero] = grupo;
        if (grupo.length === 1) {
            this.agregarMarcador(grupo, L, capa, undefined, seleccionado);
            return;
        }
        // La separación se mide en píxeles; los inmuebles conservan sus coordenadas.
        const centro = mapa.project([primero.latitud, primero.longitud]);
        if (grupo.length > MAX_PINES_DESPLEGADOS) {
            const elegido = grupo.find(({ id }) => id === seleccionado);
            const restantes = grupo.filter(({ id }) => id !== seleccionado);
            this.agregarMarcador(restantes, L, capa);
            if (elegido) {
                const posicion = mapa.unproject(centro.subtract([0, SEPARACION_VERTICAL]));
                this.agregarPinDesplazado(elegido, posicion, seleccionado, L, capa);
            }
            return;
        }
        const columnas = grupo.length > 2 && mapa.getSize().x >= 460 ? 2 : 1;
        const filas = Math.ceil(grupo.length / columnas);
        grupo.forEach((punto, indice) => {
            const fila = Math.floor(indice / columnas);
            const cantidadFila = Math.min(columnas, grupo.length - fila * columnas);
            const x = (indice % columnas - (cantidadFila - 1) / 2) * SEPARACION_HORIZONTAL;
            const y = (fila - (filas - 1) / 2) * SEPARACION_VERTICAL + 17;
            const posicion = mapa.unproject(centro.add([x, y]));
            this.agregarPinDesplazado(punto, posicion, seleccionado, L, capa);
        });
    }
    agregarPinDesplazado(punto, posicion, seleccionado, L, capa) {
        L.polyline([[punto.latitud, punto.longitud], posicion], {
            color: '#526580', opacity: .68, weight: 2, interactive: false,
        }).addTo(capa);
        this.agregarMarcador([punto], L, capa, posicion, seleccionado);
    }
    agregarMarcador(grupo, L, capa, posicion, seleccionado = null) {
        const punto = grupo[0];
        const agrupado = grupo.length > 1;
        const activo = !agrupado && punto.id === seleccionado;
        const etiqueta = agrupado ? String(grupo.length) : this.textoPrecio(punto);
        const descripcion = agrupado
            ? `${grupo.length} publicaciones`
            : `${punto.titulo}, ${punto.temporal ? 'temporal' : 'largo plazo'}, ${etiqueta}`;
        const contenido = document.createElement('span');
        contenido.textContent = etiqueta;
        const clase = agrupado ? 'grupo' : punto.temporal ? 'temporal' : 'largo';
        const icon = L.divIcon({
            html: contenido,
            className: `depa-pin depa-pin--${clase}${activo ? ' depa-pin--seleccionado' : ''}`,
            iconSize: [0, 0],
        });
        const marcador = L.marker(posicion ?? [punto.latitud, punto.longitud], {
            icon, title: descripcion, zIndexOffset: activo ? 1000 : 0,
        });
        marcador
            .on('click', () => {
            if (agrupado)
                this.abrirGrupo(grupo);
            else
                this.seleccionar(punto);
        })
            .addTo(capa);
        const elemento = marcador.getElement();
        elemento?.setAttribute('aria-label', activo ? `${descripcion}, seleccionada` : descripcion);
        if (activo)
            elemento?.setAttribute('aria-current', 'true');
        if (!agrupado && elemento)
            elemento.dataset['publicacion'] = String(punto.id);
    }
    abrirGrupo(grupo) {
        const mapa = this.mapa;
        if (!mapa)
            return;
        this.limpiarSeleccion();
        this.grupoExpandido = [];
        const [primero] = grupo;
        const mismaUbicacion = grupo.every((punto) => punto.latitud === primero.latitud && punto.longitud === primero.longitud);
        if (!mismaUbicacion && mapa.getZoom() < mapa.getMaxZoom() && this.leaflet) {
            const limites = this.leaflet.latLngBounds(grupo.map(({ latitud, longitud }) => [latitud, longitud]));
            const margen = this.leaflet.point(150, 150);
            const zoom = Math.max(mapa.getZoom() + 1, mapa.getBoundsZoom(limites, false, margen));
            mapa.setView(limites.getCenter(), zoom);
            return;
        }
        if (grupo.length > MAX_PINES_DESPLEGADOS)
            this.grupo.set(grupo);
        else
            this.grupoExpandido = grupo;
        this.dibujarPines(primero.id);
        mapa.panTo([primero.latitud, primero.longitud]);
    }
    static ɵfac = function MapaPublicacionesComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || MapaPublicacionesComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: MapaPublicacionesComponent, selectors: [["app-mapa-publicaciones"]], viewQuery: function MapaPublicacionesComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuery(_c0, 5)(_c1, 5)(_c2, 5);
        } if (rf & 2) {
            let _t;
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.contenedor = _t.first);
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.botonListado = _t.first);
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.botonCerrarListado = _t.first);
        } }, inputs: { filtros: [1, "filtros"] }, decls: 24, vars: 9, consts: [["contenedor", ""], ["botonListado", ""], ["botonCerrarListado", ""], [1, "mapa-disposicion"], ["id", "listado-mapa", "aria-labelledby", "resultados-mapa-titulo", 1, "mapa-listado"], ["aria-label", "Mapa de publicaciones", 1, "mapa"], ["aria-label", "Mapa interactivo de alquileres", 1, "mapa__lienzo"], ["aria-label", "Referencias del mapa", 1, "mapa__leyenda"], [1, "mapa__punto", "mapa__punto--temporal"], [1, "mapa__punto", "mapa__punto--largo"], ["type", "button", 1, "mapa__listado", 3, "click"], ["lucideList", "", "aria-hidden", "true", 3, "size"], [1, "mapa__acciones"], ["aria-live", "polite"], [1, "mapa__estado"], ["aria-label", "Publicaciones seleccionadas", 1, "mapa__vista"], ["id", "listado-mapa", "aria-labelledby", "resultados-mapa-titulo", 1, "mapa-listado", 3, "keydown.escape"], [1, "mapa-listado__cabecera"], ["id", "resultados-mapa-titulo"], ["type", "button", "aria-label", "Ocultar listado", 1, "mapa-listado__cerrar", 3, "click"], ["lucidePanelLeftClose", "", "aria-hidden", "true", 3, "size"], [1, "mapa-listado__contenido"], ["type", "button", 1, "mapa-listado__enlace"], [1, "mapa-listado__vacio"], [1, "mapa-listado__resultados"], ["queryParamsHandling", "merge", 1, "mapa-listado__enlace", "mapa-listado__catalogo", 3, "routerLink", "queryParams"], ["type", "button", 1, "mapa-listado__enlace", 3, "click"], ["type", "button", 1, "mapa-listado__resultado", 3, "click"], [1, "mapa-listado__datos"], [1, "mapa-listado__modalidad"], [1, "mapa-listado__ciudad"], [1, "mapa-listado__precio"], [1, "mapa-listado__foto"], ["alt", "", "loading", "lazy", "decoding", "async", "width", "88", "height", "84", 3, "src"], ["lucideHouse", "", "aria-hidden", "true", 3, "size"], ["type", "button", 3, "click"], ["aria-label", "Publicaciones seleccionadas", 1, "mapa__vista", 3, "keydown.escape"], ["type", "button", "aria-label", "Cerrar vista previa", 1, "mapa__cerrar", 3, "click"], ["lucideX", "", "aria-hidden", "true", 3, "size"], [3, "publicacion", "vistaMapa"], ["role", "status", 1, "mapa__mensaje"], [1, "mapa__mensaje"], [1, "mapa__grupo"]], template: function MapaPublicacionesComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 3);
            i0.ɵɵconditionalCreate(1, MapaPublicacionesComponent_Conditional_1_Template, 20, 7, "aside", 4);
            i0.ɵɵelementStart(2, "section", 5);
            i0.ɵɵelement(3, "div", 6, 0);
            i0.ɵɵelementStart(5, "div", 7)(6, "span");
            i0.ɵɵelement(7, "span", 8);
            i0.ɵɵtext(8, " Temporal");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "span");
            i0.ɵɵelement(10, "span", 9);
            i0.ɵɵtext(11, " Largo plazo");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(12, "button", 10, 1);
            i0.ɵɵlistener("click", function MapaPublicacionesComponent_Template_button_click_12_listener() { return ctx.alternarListado(); });
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(14, "svg", 11);
            i0.ɵɵtext(15);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(16, "div", 12)(17, "div", 13);
            i0.ɵɵconditionalCreate(18, MapaPublicacionesComponent_Conditional_18_Template, 2, 0, "p", 14)(19, MapaPublicacionesComponent_Conditional_19_Template, 4, 0, "p", 14)(20, MapaPublicacionesComponent_Conditional_20_Template, 2, 0, "p", 14)(21, MapaPublicacionesComponent_Conditional_21_Template, 2, 0, "p", 14)(22, MapaPublicacionesComponent_Conditional_22_Template, 2, 0, "p", 14);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(23, MapaPublicacionesComponent_Conditional_23_Template, 6, 2, "aside", 15);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵclassProp("mapa-disposicion--listado", ctx.listadoAbierto());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.listadoAbierto() ? 1 : -1);
            i0.ɵɵadvance(11);
            i0.ɵɵattribute("aria-expanded", ctx.listadoAbierto())("aria-controls", ctx.listadoAbierto() ? "listado-mapa" : null);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("size", 19);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.listadoAbierto() ? "Ocultar listado" : "Ver listado", " ");
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.errorMapa() ? 18 : ctx.error() ? 19 : ctx.cargando() ? 20 : ctx.errorFondo() ? 21 : !ctx.cantidad() ? 22 : -1);
            i0.ɵɵadvance(5);
            i0.ɵɵconditional(ctx.detalleAbierto() || ctx.grupo().length ? 23 : -1);
        } }, dependencies: [RouterLink, ListingCardComponent, LucideHouse, LucideList, LucidePanelLeftClose, LucideX], styles: ["[_nghost-%COMP%] { display: block; }\n.mapa-disposicion[_ngcontent-%COMP%] {\n  position: relative;\n  display: grid;\n  grid-template-columns: minmax(0, 1fr);\n  height: max(360px, calc(100dvh - 144px));\n  border-top: 1px solid var(--%NS%color-border);\n}\n.mapa-disposicion--listado[_ngcontent-%COMP%] { grid-template-columns: clamp(290px, 28vw, 390px) minmax(0, 1fr); }\n.mapa[_ngcontent-%COMP%] {\n  position: relative;\n  min-width: 0;\n  min-height: 0;\n  isolation: isolate;\n  overflow: hidden;\n  overscroll-behavior: contain;\n}\n.mapa__lienzo[_ngcontent-%COMP%] { z-index: 0; height: 100%; background: #e9efec; }\n.mapa__listado[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 1rem;\n  right: 1rem;\n  display: flex;\n  align-items: center;\n  gap: .45rem;\n  min-height: 39px;\n  padding: .4rem .7rem;\n  border: 1px solid var(--%NS%color-border);\n  border-radius: var(--%NS%radius-sm);\n  background: white;\n  color: var(--%NS%color-text);\n  box-shadow: 0 5px 20px rgb(16 24 40 / 16%);\n  font-size: .8rem;\n  font-weight: 800;\n  cursor: pointer;\n}\n.mapa__listado[_ngcontent-%COMP%]:hover { background: #f4f7fc; }\n.mapa-listado[_ngcontent-%COMP%] {\n  z-index: 1;\n  display: flex;\n  flex-direction: column;\n  min-height: 0;\n  min-width: 0;\n  background: white;\n  border-right: 1px solid #dce5ed;\n  box-shadow: 3px 0 16px rgb(16 24 40 / 10%);\n}\n.mapa-listado__cabecera[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: .55rem;\n  padding: 1rem 1.12rem .85rem;\n  border-bottom: 1px solid var(--%NS%color-border);\n}\n.mapa-listado__cabecera[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 0; font-size: 1.12rem; font-weight: 850; letter-spacing: -.025em; }\n.mapa-listado__cabecera[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: .2rem 0 0; color: var(--%NS%color-text-muted); font-size: .82rem; }\n.mapa-listado__cerrar[_ngcontent-%COMP%] {\n  display: grid;\n  flex: none;\n  place-items: center;\n  width: 35px;\n  height: 35px;\n  border: 1px solid var(--%NS%color-border);\n  border-radius: var(--%NS%radius-sm);\n  color: var(--%NS%color-secondary);\n  cursor: pointer;\n}\n.mapa-listado__contenido[_ngcontent-%COMP%] {\n  flex: 1;\n  min-height: 0;\n  overflow: auto;\n  overscroll-behavior: contain;\n  scrollbar-gutter: stable;\n  padding: .7rem .65rem .6rem .85rem;\n}\n.mapa-listado__resultados[_ngcontent-%COMP%] { display: grid; gap: .55rem; margin: 0; padding: 0; list-style: none; }\n.mapa-listado__resultado[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto;\n  align-items: center;\n  gap: .6rem;\n  width: 100%;\n  padding: .65rem;\n  border: 1px solid #e0e7ef;\n  border-radius: 12px;\n  background: white;\n  color: var(--%NS%color-text);\n  text-align: left;\n  cursor: pointer;\n}\n.mapa-listado__resultado[_ngcontent-%COMP%]:hover, .mapa-listado__resultado[aria-pressed=\"true\"][_ngcontent-%COMP%] { background: #f2f7ff; border-color: #a4bde5; }\n.mapa-listado__datos[_ngcontent-%COMP%] { display: grid; justify-items: start; gap: .18rem; min-width: 0; }\n.mapa-listado__datos[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  display: -webkit-box;\n  -webkit-box-orient: vertical;\n  -webkit-line-clamp: 2;\n  overflow: hidden;\n  overflow-wrap: anywhere;\n  font-size: .9rem;\n  line-height: 1.24;\n}\n.mapa-listado__modalidad[_ngcontent-%COMP%] {\n  padding: .14rem .45rem;\n  border-radius: var(--%NS%radius-pill);\n  background: var(--%NS%color-primary-light);\n  color: var(--%NS%color-primary-dark);\n  font-size: .66rem;\n  font-weight: 850;\n}\n.mapa-listado__modalidad--temporal[_ngcontent-%COMP%] { background: var(--%NS%color-secondary-light); color: var(--%NS%color-secondary-dark); }\n.mapa-listado__ciudad[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); font-size: .75rem; }\n.mapa-listado__precio[_ngcontent-%COMP%] { margin-top: .2rem; font-size: .86rem; font-weight: 850; }\n.mapa-listado__foto[_ngcontent-%COMP%] {\n  display: grid;\n  place-items: center;\n  width: clamp(64px, 7vw, 88px);\n  height: 80px;\n  overflow: hidden;\n  border-radius: var(--%NS%radius-sm);\n  background: #edf3f9;\n  color: var(--%NS%color-secondary);\n}\n.mapa-listado__foto[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] { width: 100%; height: 100%; object-fit: cover; }\n.mapa-listado__enlace[_ngcontent-%COMP%] { color: var(--%NS%color-secondary); font-size: .8rem; font-weight: 800; cursor: pointer; }\n.mapa-listado__catalogo[_ngcontent-%COMP%] { padding: .85rem 1.12rem; border-top: 1px solid var(--%NS%color-border); text-decoration: none; }\n.mapa-listado__catalogo[_ngcontent-%COMP%]:hover { text-decoration: underline; }\n.mapa-listado__vacio[_ngcontent-%COMP%] { padding: .2rem .3rem; color: var(--%NS%color-text-muted); font-size: .86rem; }\n.mapa-listado[_ngcontent-%COMP%]   [_ngcontent-%COMP%]:focus-visible { outline: 2px solid var(--%NS%color-secondary); outline-offset: -2px; }\n.mapa__leyenda[_ngcontent-%COMP%], .mapa__estado[_ngcontent-%COMP%], .mapa__vista[_ngcontent-%COMP%] {\n  border: 1px solid var(--%NS%color-border);\n  background: white;\n  color: var(--%NS%color-text);\n  box-shadow: 0 5px 20px rgb(16 24 40 / 16%);\n}\n.mapa__leyenda[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 1rem;\n  left: 1rem;\n  display: flex;\n  flex-wrap: wrap;\n  gap: .5rem 1rem;\n  padding: .6rem .7rem;\n  border-radius: var(--%NS%radius-sm);\n  font-size: .78rem;\n  font-weight: 750;\n}\n.mapa__leyenda[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] { display: inline-flex; align-items: center; gap: .32rem; }\n.mapa__punto[_ngcontent-%COMP%] { width: .65rem; height: .65rem; border-radius: 50%; }\n.mapa__punto--temporal[_ngcontent-%COMP%] { background: var(--%NS%color-secondary); }\n.mapa__punto--largo[_ngcontent-%COMP%] { background: var(--%NS%color-primary); }\n.mapa__acciones[_ngcontent-%COMP%] {\n  position: absolute;\n  bottom: 2rem;\n  left: 50%;\n  display: grid;\n  justify-items: center;\n  gap: .4rem;\n  width: min(460px, calc(100% - 6rem));\n  transform: translateX(-50%);\n  pointer-events: none;\n}\n.mapa__estado[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { pointer-events: auto; }\n.mapa__estado[_ngcontent-%COMP%] { margin: 0; padding: .45rem .65rem; border-radius: var(--%NS%radius-sm); text-align: center; font-size: .78rem; }\n.mapa__estado[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { color: var(--%NS%color-secondary); font-weight: 750; text-decoration: underline; cursor: pointer; }\n.mapa__vista[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 4.3rem;\n  right: 1rem;\n  width: min(400px, calc(100% - 2rem));\n  border-radius: var(--%NS%radius-md);\n  overflow: hidden;\n}\n.mapa__cerrar[_ngcontent-%COMP%] {\n  position: absolute;\n  z-index: 1;\n  top: .4rem;\n  right: .4rem;\n  display: grid;\n  place-items: center;\n  width: 2rem;\n  height: 2rem;\n  border-radius: 50%;\n  background: #f3f6fa;\n  cursor: pointer;\n}\n.mapa__mensaje[_ngcontent-%COMP%] { margin: .75rem 2.6rem .75rem .8rem; font-size: .9rem; font-weight: 750; }\n.mapa__grupo[_ngcontent-%COMP%] { max-height: 11rem; overflow: auto; overscroll-behavior: contain; padding: 0 .8rem .8rem; margin: 0; list-style: none; }\n.mapa__grupo[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { width: 100%; padding: .5rem; border-top: 1px solid var(--%NS%color-border); text-align: left; cursor: pointer; }\n.mapa__grupo[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { display: block; color: var(--%NS%color-text-muted); }\n.mapa[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:focus-visible { outline: 2px solid var(--%NS%color-secondary); outline-offset: 2px; }\n\n@media (max-width: 930px) {\n  .mapa-disposicion[_ngcontent-%COMP%] { height: max(360px, calc(100dvh - 193px)); }\n}\n@media (max-width: 680px) {\n  .mapa-disposicion--listado[_ngcontent-%COMP%] { grid-template-columns: minmax(0, 1fr); }\n  .mapa-listado[_ngcontent-%COMP%] { position: absolute; inset: 0 auto 0 0; width: min(84%, 340px); }\n}\n@media (max-width: 640px) {\n  .mapa-disposicion[_ngcontent-%COMP%] { height: max(340px, calc(100dvh - 208px)); }\n}\n@media (max-width: 480px) {\n  .mapa__listado[_ngcontent-%COMP%] { top: .65rem; right: .6rem; min-height: 35px; padding: .35rem .5rem; font-size: .72rem; }\n  .mapa__leyenda[_ngcontent-%COMP%] { top: .65rem; left: .6rem; max-width: calc(100% - 8.6rem); gap: .12rem .5rem; padding: .45rem; font-size: .7rem; }\n  .mapa__vista[_ngcontent-%COMP%] { top: 4rem; right: .6rem; width: calc(100% - 1.2rem); }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MapaPublicacionesComponent, [{
        type: Component,
        args: [{ selector: 'app-mapa-publicaciones', imports: [RouterLink, ListingCardComponent, LucideHouse, LucideList, LucidePanelLeftClose, LucideX], template: "<div class=\"mapa-disposicion\" [class.mapa-disposicion--listado]=\"listadoAbierto()\">\n  @if (listadoAbierto()) {\n    <aside id=\"listado-mapa\" class=\"mapa-listado\" aria-labelledby=\"resultados-mapa-titulo\"\n      (keydown.escape)=\"alternarListado()\">\n      <header class=\"mapa-listado__cabecera\">\n        <div>\n          <h2 id=\"resultados-mapa-titulo\">Alquileres en el mapa</h2>\n          <p aria-live=\"polite\">\n            @if (cargando()) { Buscando publicaciones\u2026 }\n            @else if (error()) { No pudimos cargar los resultados. }\n            @else { {{ cantidad() }} {{ cantidad() === 1 ? 'publicaci\u00F3n' : 'publicaciones' }} }\n          </p>\n        </div>\n        <button #botonCerrarListado type=\"button\" class=\"mapa-listado__cerrar\" aria-label=\"Ocultar listado\"\n          (click)=\"alternarListado()\">\n          <svg lucidePanelLeftClose [size]=\"19\" aria-hidden=\"true\"></svg>\n        </button>\n      </header>\n      <div class=\"mapa-listado__contenido\">\n        @if (error()) {\n          <button type=\"button\" class=\"mapa-listado__enlace\" (click)=\"reintentar()\">Reintentar</button>\n        } @else if (!cargando() && !cantidad()) {\n          <p class=\"mapa-listado__vacio\">No encontramos publicaciones con ubicaci\u00F3n para esta b\u00FAsqueda.</p>\n        }\n        <ul class=\"mapa-listado__resultados\">\n          @for (punto of puntos(); track punto.id) {\n            <li>\n              <button type=\"button\" class=\"mapa-listado__resultado\"\n                [attr.aria-pressed]=\"seleccionado() === punto.id\" (click)=\"seleccionarDesdeListado(punto)\">\n                <span class=\"mapa-listado__datos\">\n                  <span class=\"mapa-listado__modalidad\" [class.mapa-listado__modalidad--temporal]=\"punto.temporal\">\n                    {{ punto.temporal ? 'Temporal' : 'Largo plazo' }}\n                  </span>\n                  <strong>{{ punto.titulo }}</strong>\n                  @if (punto.ciudad) { <span class=\"mapa-listado__ciudad\">{{ punto.ciudad }}</span> }\n                  <span class=\"mapa-listado__precio\">{{ textoPrecio(punto) }}</span>\n                </span>\n                <span class=\"mapa-listado__foto\">\n                  @if (punto.portada) {\n                    <img [src]=\"punto.portada\" alt=\"\" loading=\"lazy\" decoding=\"async\" width=\"88\" height=\"84\" />\n                  } @else {\n                    <svg lucideHouse [size]=\"24\" aria-hidden=\"true\"></svg>\n                  }\n                </span>\n              </button>\n            </li>\n          }\n        </ul>\n      </div>\n      <a class=\"mapa-listado__enlace mapa-listado__catalogo\" [routerLink]=\"[]\"\n        [queryParams]=\"{ vista: null, pagina: null }\" queryParamsHandling=\"merge\">Abrir cat\u00E1logo completo</a>\n    </aside>\n  }\n\n  <section class=\"mapa\" aria-label=\"Mapa de publicaciones\">\n    <div #contenedor class=\"mapa__lienzo\" aria-label=\"Mapa interactivo de alquileres\"></div>\n\n    <div class=\"mapa__leyenda\" aria-label=\"Referencias del mapa\">\n      <span><span class=\"mapa__punto mapa__punto--temporal\"></span> Temporal</span>\n      <span><span class=\"mapa__punto mapa__punto--largo\"></span> Largo plazo</span>\n    </div>\n    <button #botonListado type=\"button\" class=\"mapa__listado\" (click)=\"alternarListado()\"\n      [attr.aria-expanded]=\"listadoAbierto()\" [attr.aria-controls]=\"listadoAbierto() ? 'listado-mapa' : null\">\n      <svg lucideList [size]=\"19\" aria-hidden=\"true\"></svg>\n      {{ listadoAbierto() ? 'Ocultar listado' : 'Ver listado' }}\n    </button>\n\n    <div class=\"mapa__acciones\">\n      <div aria-live=\"polite\">\n        @if (errorMapa()) {\n          <p class=\"mapa__estado\">No pudimos abrir el mapa. Pod\u00E9s seguir desde el listado.</p>\n        } @else if (error()) {\n          <p class=\"mapa__estado\">No pudimos cargar las publicaciones. <button type=\"button\" (click)=\"reintentar()\">Reintentar</button></p>\n        } @else if (cargando()) {\n          <p class=\"mapa__estado\">Buscando publicaciones\u2026</p>\n        } @else if (errorFondo()) {\n          <p class=\"mapa__estado\">El fondo del mapa no est\u00E1 disponible por el momento.</p>\n        } @else if (!cantidad()) {\n          <p class=\"mapa__estado\">No hay publicaciones con ubicaci\u00F3n para esta b\u00FAsqueda.</p>\n        }\n      </div>\n    </div>\n\n    @if (detalleAbierto() || grupo().length) {\n      <aside class=\"mapa__vista\" aria-label=\"Publicaciones seleccionadas\" (keydown.escape)=\"cerrarDetalle()\">\n        <button class=\"mapa__cerrar\" type=\"button\" (click)=\"cerrarDetalle()\" aria-label=\"Cerrar vista previa\">\n          <svg lucideX [size]=\"18\" aria-hidden=\"true\"></svg>\n        </button>\n        @if (grupo().length) {\n          <p class=\"mapa__mensaje\">{{ grupo().length }} publicaciones en este punto</p>\n          <ul class=\"mapa__grupo\">\n            @for (punto of grupo(); track punto.id) {\n              <li><button type=\"button\" (click)=\"seleccionar(punto)\">\n                {{ punto.titulo }} <small>{{ textoPrecio(punto) }}</small>\n              </button></li>\n            }\n          </ul>\n        } @else if (detalle(); as publicacion) {\n          <app-listing-card [publicacion]=\"publicacion\" [vistaMapa]=\"true\" />\n        } @else {\n          <p class=\"mapa__mensaje\" role=\"status\">{{ errorDetalle() ? 'Esta publicaci\u00F3n ya no est\u00E1 disponible o no pudimos cargarla.' : 'Cargando vista previa\u2026' }}</p>\n        }\n      </aside>\n    }\n  </section>\n</div>\n", styles: [":host { display: block; }\n.mapa-disposicion {\n  position: relative;\n  display: grid;\n  grid-template-columns: minmax(0, 1fr);\n  height: max(360px, calc(100dvh - 144px));\n  border-top: 1px solid var(--color-border);\n}\n.mapa-disposicion--listado { grid-template-columns: clamp(290px, 28vw, 390px) minmax(0, 1fr); }\n.mapa {\n  position: relative;\n  min-width: 0;\n  min-height: 0;\n  isolation: isolate;\n  overflow: hidden;\n  overscroll-behavior: contain;\n}\n.mapa__lienzo { z-index: 0; height: 100%; background: #e9efec; }\n.mapa__listado {\n  position: absolute;\n  top: 1rem;\n  right: 1rem;\n  display: flex;\n  align-items: center;\n  gap: .45rem;\n  min-height: 39px;\n  padding: .4rem .7rem;\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-sm);\n  background: white;\n  color: var(--color-text);\n  box-shadow: 0 5px 20px rgb(16 24 40 / 16%);\n  font-size: .8rem;\n  font-weight: 800;\n  cursor: pointer;\n}\n.mapa__listado:hover { background: #f4f7fc; }\n.mapa-listado {\n  z-index: 1;\n  display: flex;\n  flex-direction: column;\n  min-height: 0;\n  min-width: 0;\n  background: white;\n  border-right: 1px solid #dce5ed;\n  box-shadow: 3px 0 16px rgb(16 24 40 / 10%);\n}\n.mapa-listado__cabecera {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: .55rem;\n  padding: 1rem 1.12rem .85rem;\n  border-bottom: 1px solid var(--color-border);\n}\n.mapa-listado__cabecera h2 { margin: 0; font-size: 1.12rem; font-weight: 850; letter-spacing: -.025em; }\n.mapa-listado__cabecera p { margin: .2rem 0 0; color: var(--color-text-muted); font-size: .82rem; }\n.mapa-listado__cerrar {\n  display: grid;\n  flex: none;\n  place-items: center;\n  width: 35px;\n  height: 35px;\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-sm);\n  color: var(--color-secondary);\n  cursor: pointer;\n}\n.mapa-listado__contenido {\n  flex: 1;\n  min-height: 0;\n  overflow: auto;\n  overscroll-behavior: contain;\n  scrollbar-gutter: stable;\n  padding: .7rem .65rem .6rem .85rem;\n}\n.mapa-listado__resultados { display: grid; gap: .55rem; margin: 0; padding: 0; list-style: none; }\n.mapa-listado__resultado {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto;\n  align-items: center;\n  gap: .6rem;\n  width: 100%;\n  padding: .65rem;\n  border: 1px solid #e0e7ef;\n  border-radius: 12px;\n  background: white;\n  color: var(--color-text);\n  text-align: left;\n  cursor: pointer;\n}\n.mapa-listado__resultado:hover, .mapa-listado__resultado[aria-pressed=\"true\"] { background: #f2f7ff; border-color: #a4bde5; }\n.mapa-listado__datos { display: grid; justify-items: start; gap: .18rem; min-width: 0; }\n.mapa-listado__datos strong {\n  display: -webkit-box;\n  -webkit-box-orient: vertical;\n  -webkit-line-clamp: 2;\n  overflow: hidden;\n  overflow-wrap: anywhere;\n  font-size: .9rem;\n  line-height: 1.24;\n}\n.mapa-listado__modalidad {\n  padding: .14rem .45rem;\n  border-radius: var(--radius-pill);\n  background: var(--color-primary-light);\n  color: var(--color-primary-dark);\n  font-size: .66rem;\n  font-weight: 850;\n}\n.mapa-listado__modalidad--temporal { background: var(--color-secondary-light); color: var(--color-secondary-dark); }\n.mapa-listado__ciudad { color: var(--color-text-muted); font-size: .75rem; }\n.mapa-listado__precio { margin-top: .2rem; font-size: .86rem; font-weight: 850; }\n.mapa-listado__foto {\n  display: grid;\n  place-items: center;\n  width: clamp(64px, 7vw, 88px);\n  height: 80px;\n  overflow: hidden;\n  border-radius: var(--radius-sm);\n  background: #edf3f9;\n  color: var(--color-secondary);\n}\n.mapa-listado__foto img { width: 100%; height: 100%; object-fit: cover; }\n.mapa-listado__enlace { color: var(--color-secondary); font-size: .8rem; font-weight: 800; cursor: pointer; }\n.mapa-listado__catalogo { padding: .85rem 1.12rem; border-top: 1px solid var(--color-border); text-decoration: none; }\n.mapa-listado__catalogo:hover { text-decoration: underline; }\n.mapa-listado__vacio { padding: .2rem .3rem; color: var(--color-text-muted); font-size: .86rem; }\n.mapa-listado :focus-visible { outline: 2px solid var(--color-secondary); outline-offset: -2px; }\n.mapa__leyenda, .mapa__estado, .mapa__vista {\n  border: 1px solid var(--color-border);\n  background: white;\n  color: var(--color-text);\n  box-shadow: 0 5px 20px rgb(16 24 40 / 16%);\n}\n.mapa__leyenda {\n  position: absolute;\n  top: 1rem;\n  left: 1rem;\n  display: flex;\n  flex-wrap: wrap;\n  gap: .5rem 1rem;\n  padding: .6rem .7rem;\n  border-radius: var(--radius-sm);\n  font-size: .78rem;\n  font-weight: 750;\n}\n.mapa__leyenda > span { display: inline-flex; align-items: center; gap: .32rem; }\n.mapa__punto { width: .65rem; height: .65rem; border-radius: 50%; }\n.mapa__punto--temporal { background: var(--color-secondary); }\n.mapa__punto--largo { background: var(--color-primary); }\n.mapa__acciones {\n  position: absolute;\n  bottom: 2rem;\n  left: 50%;\n  display: grid;\n  justify-items: center;\n  gap: .4rem;\n  width: min(460px, calc(100% - 6rem));\n  transform: translateX(-50%);\n  pointer-events: none;\n}\n.mapa__estado button { pointer-events: auto; }\n.mapa__estado { margin: 0; padding: .45rem .65rem; border-radius: var(--radius-sm); text-align: center; font-size: .78rem; }\n.mapa__estado button { color: var(--color-secondary); font-weight: 750; text-decoration: underline; cursor: pointer; }\n.mapa__vista {\n  position: absolute;\n  top: 4.3rem;\n  right: 1rem;\n  width: min(400px, calc(100% - 2rem));\n  border-radius: var(--radius-md);\n  overflow: hidden;\n}\n.mapa__cerrar {\n  position: absolute;\n  z-index: 1;\n  top: .4rem;\n  right: .4rem;\n  display: grid;\n  place-items: center;\n  width: 2rem;\n  height: 2rem;\n  border-radius: 50%;\n  background: #f3f6fa;\n  cursor: pointer;\n}\n.mapa__mensaje { margin: .75rem 2.6rem .75rem .8rem; font-size: .9rem; font-weight: 750; }\n.mapa__grupo { max-height: 11rem; overflow: auto; overscroll-behavior: contain; padding: 0 .8rem .8rem; margin: 0; list-style: none; }\n.mapa__grupo button { width: 100%; padding: .5rem; border-top: 1px solid var(--color-border); text-align: left; cursor: pointer; }\n.mapa__grupo small { display: block; color: var(--color-text-muted); }\n.mapa button:focus-visible { outline: 2px solid var(--color-secondary); outline-offset: 2px; }\n\n@media (max-width: 930px) {\n  .mapa-disposicion { height: max(360px, calc(100dvh - 193px)); }\n}\n@media (max-width: 680px) {\n  .mapa-disposicion--listado { grid-template-columns: minmax(0, 1fr); }\n  .mapa-listado { position: absolute; inset: 0 auto 0 0; width: min(84%, 340px); }\n}\n@media (max-width: 640px) {\n  .mapa-disposicion { height: max(340px, calc(100dvh - 208px)); }\n}\n@media (max-width: 480px) {\n  .mapa__listado { top: .65rem; right: .6rem; min-height: 35px; padding: .35rem .5rem; font-size: .72rem; }\n  .mapa__leyenda { top: .65rem; left: .6rem; max-width: calc(100% - 8.6rem); gap: .12rem .5rem; padding: .45rem; font-size: .7rem; }\n  .mapa__vista { top: 4rem; right: .6rem; width: calc(100% - 1.2rem); }\n}\n"] }]
    }], () => [], { contenedor: [{
            type: ViewChild,
            args: ['contenedor']
        }], botonListado: [{
            type: ViewChild,
            args: ['botonListado']
        }], botonCerrarListado: [{
            type: ViewChild,
            args: ['botonCerrarListado']
        }], filtros: [{ type: i0.Input, args: [{ isSignal: true, alias: "filtros", required: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(MapaPublicacionesComponent, { className: "MapaPublicacionesComponent", filePath: "src/app/features/explorar-publicaciones/mapa-publicaciones.component.ts", lineNumber: 29 }); })();
