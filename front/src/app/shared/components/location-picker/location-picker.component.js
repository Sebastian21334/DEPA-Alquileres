import { Component, PLATFORM_ID, ViewChild, effect, inject, input, output, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { finalize } from 'rxjs';
import { UbicacionService } from '../../services/ubicacion.service';
import { crearCapaMapaBase } from '../../utils/mapa-base';
import * as i0 from "@angular/core";
const _c0 = ["map"];
const _forTrack0 = ($index, $item) => $item.latitud + "," + $item.longitud;
function LocationPickerComponent_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "p", 4);
    i0.ɵɵtext(1);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.error());
} }
function LocationPickerComponent_Conditional_10_For_4_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "button", 12);
    i0.ɵɵdomListener("click", function LocationPickerComponent_Conditional_10_For_4_Template_button_click_0_listener() { const result_r3 = i0.ɵɵrestoreView(_r2).$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.selectResult(result_r3)); });
    i0.ɵɵtext(1);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const result_r3 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(result_r3.nombre);
} }
function LocationPickerComponent_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 5)(1, "span");
    i0.ɵɵtext(2, "\u00BFCu\u00E1l corresponde?");
    i0.ɵɵdomElementEnd();
    i0.ɵɵrepeaterCreate(3, LocationPickerComponent_Conditional_10_For_4_Template, 2, 1, "button", 11, _forTrack0);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r0.results());
} }
function LocationPickerComponent_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "p", 8);
    i0.ɵɵtext(1, "No pudimos cargar el mapa. Recarg\u00E1 la p\u00E1gina e intent\u00E1 nuevamente.");
    i0.ɵɵdomElementEnd();
} }
function LocationPickerComponent_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "small");
    i0.ɵɵtext(1, "Resultado encontrado");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.selectedName());
} }
function LocationPickerComponent_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "span");
    i0.ɵɵtext(1, "Busc\u00E1 la direcci\u00F3n o toc\u00E1 el mapa para colocar el pin.");
    i0.ɵɵdomElementEnd();
} }
export class LocationPickerComponent {
    ubicaciones = inject(UbicacionService);
    platformId = inject(PLATFORM_ID);
    leaflet = null;
    map = null;
    marker = null;
    pendingInitial = null;
    lastSearchContext = '';
    mapElement;
    direccion = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "direccion" }] : /* istanbul ignore next */ []));
    ciudad = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ciudad" }] : /* istanbul ignore next */ []));
    provincia = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "provincia" }] : /* istanbul ignore next */ []));
    initialLatitude = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "initialLatitude" }] : /* istanbul ignore next */ []));
    initialLongitude = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "initialLongitude" }] : /* istanbul ignore next */ []));
    locationConfirmed = output();
    searching = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "searching" }] : /* istanbul ignore next */ []));
    error = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    results = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "results" }] : /* istanbul ignore next */ []));
    selectedName = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedName" }] : /* istanbul ignore next */ []));
    candidate = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "candidate" }] : /* istanbul ignore next */ []));
    confirmed = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "confirmed" }] : /* istanbul ignore next */ []));
    mapLoadError = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mapLoadError" }] : /* istanbul ignore next */ []));
    constructor() {
        effect(() => {
            const latitudeInput = this.initialLatitude();
            const longitudeInput = this.initialLongitude();
            if (latitudeInput === null || longitudeInput === null) {
                if (this.confirmed())
                    this.resetCandidate();
                return;
            }
            const latitud = Number(latitudeInput);
            const longitud = Number(longitudeInput);
            if (!Number.isFinite(latitud) || !Number.isFinite(longitud))
                return;
            this.pendingInitial = { latitud, longitud };
            this.confirmed.set(true);
            if (this.map)
                this.placeMarker(latitud, longitud, 17);
        });
        effect(() => {
            const context = `${this.direccion()}|${this.ciudad()}|${this.provincia()}`;
            if (this.lastSearchContext && context !== this.lastSearchContext && this.candidate() && !this.confirmed()) {
                this.resetCandidate();
            }
            this.lastSearchContext = context;
        });
    }
    async ngAfterViewInit() {
        if (!isPlatformBrowser(this.platformId) || !this.mapElement)
            return;
        try {
            const imported = await import('leaflet');
            const moduleWithDefault = imported;
            this.leaflet = moduleWithDefault.default ?? imported;
            const L = this.leaflet;
            this.map = L.map(this.mapElement.nativeElement, { center: [-32.5, -63.5], zoom: 5 });
            crearCapaMapaBase(L).addTo(this.map);
            this.map.on('click', (event) => this.choosePoint(event.latlng.lat, event.latlng.lng));
            if (this.pendingInitial) {
                this.placeMarker(this.pendingInitial.latitud, this.pendingInitial.longitud, 17);
            }
            setTimeout(() => this.map?.invalidateSize(), 0);
        }
        catch {
            this.mapLoadError.set(true);
        }
    }
    ngOnDestroy() {
        this.map?.remove();
    }
    search() {
        const direccion = this.direccion().trim();
        const ciudad = this.ciudad().trim();
        const provincia = this.provincia().trim();
        this.error.set('');
        this.results.set([]);
        if (!direccion || !ciudad || !provincia) {
            this.error.set('Completá provincia, ciudad y dirección antes de buscar.');
            return;
        }
        this.searching.set(true);
        this.ubicaciones.buscarDireccion(direccion, ciudad, provincia)
            .pipe(finalize(() => this.searching.set(false)))
            .subscribe({
            next: (results) => {
                this.results.set(results);
                if (!results.length) {
                    this.error.set('No encontramos esa dirección. Probá con el nombre completo de la calle y luego marcá el punto en el mapa.');
                    return;
                }
                this.selectResult(results[0]);
            },
            error: (err) => this.error.set(err.message),
        });
    }
    selectResult(result) {
        this.selectedName.set(result.nombre);
        this.choosePoint(result.latitud, result.longitud, 17);
    }
    confirm() {
        const point = this.candidate();
        if (!point)
            return;
        this.confirmed.set(true);
        this.locationConfirmed.emit(point);
    }
    choosePoint(latitud, longitud, zoom) {
        this.candidate.set({ latitud, longitud });
        this.confirmed.set(false);
        this.placeMarker(latitud, longitud, zoom);
    }
    placeMarker(latitud, longitud, zoom) {
        if (!this.map || !this.leaflet)
            return;
        if (!this.marker) {
            const icon = this.leaflet.divIcon({
                className: 'depa-map-marker',
                html: '<span aria-hidden="true"></span>',
                iconSize: [38, 48],
                iconAnchor: [19, 45],
            });
            this.marker = this.leaflet.marker([latitud, longitud], { draggable: true, icon }).addTo(this.map);
            this.marker.on('dragend', () => {
                const position = this.marker.getLatLng();
                this.candidate.set({ latitud: position.lat, longitud: position.lng });
                this.confirmed.set(false);
            });
        }
        else {
            this.marker.setLatLng([latitud, longitud]);
        }
        this.map.setView([latitud, longitud], zoom ?? Math.max(this.map.getZoom(), 15));
    }
    resetCandidate() {
        this.pendingInitial = null;
        this.candidate.set(null);
        this.confirmed.set(false);
        this.selectedName.set('');
        this.results.set([]);
        if (this.map && this.marker)
            this.map.removeLayer(this.marker);
        this.marker = null;
    }
    static ɵfac = function LocationPickerComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || LocationPickerComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: LocationPickerComponent, selectors: [["app-location-picker"]], viewQuery: function LocationPickerComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuery(_c0, 5);
        } if (rf & 2) {
            let _t;
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.mapElement = _t.first);
        } }, inputs: { direccion: [1, "direccion"], ciudad: [1, "ciudad"], provincia: [1, "provincia"], initialLatitude: [1, "initialLatitude"], initialLongitude: [1, "initialLongitude"] }, outputs: { locationConfirmed: "locationConfirmed" }, decls: 21, vars: 8, consts: [["map", ""], [1, "picker"], [1, "picker__intro"], ["type", "button", 3, "click", "disabled"], ["role", "alert", 1, "picker__message", "picker__message--error"], ["aria-label", "Resultados encontrados", 1, "picker__results"], [1, "picker__map-wrap"], ["aria-label", "Mapa para confirmar la ubicaci\u00F3n", 1, "picker__map"], [1, "picker__map-error"], [1, "picker__footer"], ["type", "button", 1, "picker__confirm", 3, "click", "disabled"], ["type", "button"], ["type", "button", 3, "click"]], template: function LocationPickerComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "div", 1)(1, "div", 2)(2, "div")(3, "strong");
            i0.ɵɵtext(4, "Confirm\u00E1 la ubicaci\u00F3n exacta");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(5, "p");
            i0.ɵɵtext(6, "Busc\u00E1 la direcci\u00F3n y, si hace falta, mov\u00E9 el pin o toc\u00E1 otro punto del mapa.");
            i0.ɵɵdomElementEnd()();
            i0.ɵɵdomElementStart(7, "button", 3);
            i0.ɵɵdomListener("click", function LocationPickerComponent_Template_button_click_7_listener() { return ctx.search(); });
            i0.ɵɵtext(8);
            i0.ɵɵdomElementEnd()();
            i0.ɵɵconditionalCreate(9, LocationPickerComponent_Conditional_9_Template, 2, 1, "p", 4);
            i0.ɵɵconditionalCreate(10, LocationPickerComponent_Conditional_10_Template, 5, 0, "div", 5);
            i0.ɵɵdomElementStart(11, "div", 6);
            i0.ɵɵdomElement(12, "div", 7, 0);
            i0.ɵɵconditionalCreate(14, LocationPickerComponent_Conditional_14_Template, 2, 0, "p", 8);
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(15, "div", 9)(16, "div");
            i0.ɵɵconditionalCreate(17, LocationPickerComponent_Conditional_17_Template, 4, 1)(18, LocationPickerComponent_Conditional_18_Template, 2, 0, "span");
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(19, "button", 10);
            i0.ɵɵdomListener("click", function LocationPickerComponent_Template_button_click_19_listener() { return ctx.confirm(); });
            i0.ɵɵtext(20);
            i0.ɵɵdomElementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance(7);
            i0.ɵɵdomProperty("disabled", ctx.searching());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.searching() ? "Buscando\u2026" : "Buscar direcci\u00F3n", " ");
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.error() ? 9 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.results().length > 1 ? 10 : -1);
            i0.ɵɵadvance(4);
            i0.ɵɵconditional(ctx.mapLoadError() ? 14 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.selectedName() ? 17 : 18);
            i0.ɵɵadvance(2);
            i0.ɵɵdomProperty("disabled", !ctx.candidate() || ctx.confirmed());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.confirmed() ? "\u2713 Ubicaci\u00F3n confirmada" : "Confirmar este punto", " ");
        } }, styles: ["[_nghost-%COMP%] { display: block; grid-column: 1 / -1; }\r\n.picker[_ngcontent-%COMP%] { overflow: hidden; border: 1px solid #d7dee8; border-radius: 12px; background: #fff; }\r\n.picker__intro[_ngcontent-%COMP%], .picker__footer[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 16px; }\r\n.picker__intro[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { display: block; font-size: .92rem; }\r\n.picker__intro[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 3px 0 0; color: var(--%NS%color-text-muted); font-size: .8rem; }\r\n.picker[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { border: 0; font: inherit; font-weight: 800; cursor: pointer; }\r\n.picker__intro[_ngcontent-%COMP%]    > button[_ngcontent-%COMP%] { flex-shrink: 0; padding: 9px 13px; border-radius: 8px; color: #fff; background: var(--%NS%color-secondary); }\r\n.picker[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:disabled { opacity: .6; cursor: not-allowed; }\r\n.picker__map-wrap[_ngcontent-%COMP%] { position: relative; border-block: 1px solid #d7dee8; background: #e7ebef; }\r\n.picker__map[_ngcontent-%COMP%] { z-index: 0; height: 310px; }\r\n.picker__map-error[_ngcontent-%COMP%] { position: absolute; z-index: 1; inset: 0; display: grid; place-items: center; margin: 0; padding: 24px; color: #991b1b; background: #fee2e2; text-align: center; font-size: .85rem; }\r\n.picker__results[_ngcontent-%COMP%] { display: grid; gap: 6px; padding: 12px 16px; border-top: 1px solid #edf0f4; background: #f8fafc; }\r\n.picker__results[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] { color: #475467; font-size: .75rem; font-weight: 800; }\r\n.picker__results[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { padding: 8px 10px; border: 1px solid #d7dee8; border-radius: 7px; background: #fff; color: #344054; text-align: left; font-size: .78rem; font-weight: 600; }\r\n.picker__results[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover { border-color: var(--%NS%color-accent); }\r\n.picker__message[_ngcontent-%COMP%] { margin: 0; padding: 10px 16px; font-size: .8rem; }\r\n.picker__message--error[_ngcontent-%COMP%] { color: #991b1b; background: #fee2e2; }\r\n.picker__footer[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] { display: grid; gap: 3px; min-width: 0; color: var(--%NS%color-text-muted); font-size: .78rem; }\r\n.picker__footer[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { color: var(--%NS%color-success); font-weight: 800; }\r\n.picker__footer[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { overflow: hidden; text-overflow: ellipsis; }\r\n.picker__confirm[_ngcontent-%COMP%] { flex-shrink: 0; min-height: 40px; padding: 0 14px; border-radius: 8px; color: #fff; background: var(--%NS%color-primary); }\r\n.picker__confirm[_ngcontent-%COMP%]:disabled { color: #166534; background: #dcfce7; }\r\n[_nghost-%COMP%]     .depa-map-marker span { position: relative; display: block; width: 34px; height: 34px; border: 4px solid #fff; border-radius: 50% 50% 50% 0; background: var(--%NS%color-primary); box-shadow: 0 4px 12px rgb(16 24 40 / 35%); transform: rotate(-45deg); }\r\n[_nghost-%COMP%]     .depa-map-marker span::after { content: ''; position: absolute; inset: 8px; border-radius: 50%; background: #fff; }\r\n@media (max-width: 620px) {\r\n  .picker__intro[_ngcontent-%COMP%], .picker__footer[_ngcontent-%COMP%] { align-items: stretch; flex-direction: column; }\r\n  .picker__intro[_ngcontent-%COMP%]    > button[_ngcontent-%COMP%], .picker__confirm[_ngcontent-%COMP%] { width: 100%; }\r\n  .picker__map[_ngcontent-%COMP%] { height: 280px; }\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(LocationPickerComponent, [{
        type: Component,
        args: [{ selector: 'app-location-picker', standalone: true, template: "<div class=\"picker\">\r\n  <div class=\"picker__intro\">\r\n    <div>\r\n      <strong>Confirm\u00E1 la ubicaci\u00F3n exacta</strong>\r\n      <p>Busc\u00E1 la direcci\u00F3n y, si hace falta, mov\u00E9 el pin o toc\u00E1 otro punto del mapa.</p>\r\n    </div>\r\n    <button type=\"button\" (click)=\"search()\" [disabled]=\"searching()\">\r\n      {{ searching() ? 'Buscando\u2026' : 'Buscar direcci\u00F3n' }}\r\n    </button>\r\n  </div>\r\n\r\n  @if (error()) { <p class=\"picker__message picker__message--error\" role=\"alert\">{{ error() }}</p> }\r\n\r\n  @if (results().length > 1) {\r\n    <div class=\"picker__results\" aria-label=\"Resultados encontrados\">\r\n      <span>\u00BFCu\u00E1l corresponde?</span>\r\n      @for (result of results(); track result.latitud + ',' + result.longitud) {\r\n        <button type=\"button\" (click)=\"selectResult(result)\">{{ result.nombre }}</button>\r\n      }\r\n    </div>\r\n  }\r\n\r\n  <div class=\"picker__map-wrap\">\r\n    <div #map class=\"picker__map\" aria-label=\"Mapa para confirmar la ubicaci\u00F3n\"></div>\r\n    @if (mapLoadError()) {\r\n      <p class=\"picker__map-error\">No pudimos cargar el mapa. Recarg\u00E1 la p\u00E1gina e intent\u00E1 nuevamente.</p>\r\n    }\r\n  </div>\r\n\r\n  <div class=\"picker__footer\">\r\n    <div>\r\n      @if (selectedName()) { <small>Resultado encontrado</small><span>{{ selectedName() }}</span> }\r\n      @else { <span>Busc\u00E1 la direcci\u00F3n o toc\u00E1 el mapa para colocar el pin.</span> }\r\n    </div>\r\n    <button type=\"button\" class=\"picker__confirm\" (click)=\"confirm()\" [disabled]=\"!candidate() || confirmed()\">\r\n      {{ confirmed() ? '\u2713 Ubicaci\u00F3n confirmada' : 'Confirmar este punto' }}\r\n    </button>\r\n  </div>\r\n</div>\r\n", styles: [":host { display: block; grid-column: 1 / -1; }\r\n.picker { overflow: hidden; border: 1px solid #d7dee8; border-radius: 12px; background: #fff; }\r\n.picker__intro, .picker__footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 16px; }\r\n.picker__intro strong { display: block; font-size: .92rem; }\r\n.picker__intro p { margin: 3px 0 0; color: var(--color-text-muted); font-size: .8rem; }\r\n.picker button { border: 0; font: inherit; font-weight: 800; cursor: pointer; }\r\n.picker__intro > button { flex-shrink: 0; padding: 9px 13px; border-radius: 8px; color: #fff; background: var(--color-secondary); }\r\n.picker button:disabled { opacity: .6; cursor: not-allowed; }\r\n.picker__map-wrap { position: relative; border-block: 1px solid #d7dee8; background: #e7ebef; }\r\n.picker__map { z-index: 0; height: 310px; }\r\n.picker__map-error { position: absolute; z-index: 1; inset: 0; display: grid; place-items: center; margin: 0; padding: 24px; color: #991b1b; background: #fee2e2; text-align: center; font-size: .85rem; }\r\n.picker__results { display: grid; gap: 6px; padding: 12px 16px; border-top: 1px solid #edf0f4; background: #f8fafc; }\r\n.picker__results > span { color: #475467; font-size: .75rem; font-weight: 800; }\r\n.picker__results button { padding: 8px 10px; border: 1px solid #d7dee8; border-radius: 7px; background: #fff; color: #344054; text-align: left; font-size: .78rem; font-weight: 600; }\r\n.picker__results button:hover { border-color: var(--color-accent); }\r\n.picker__message { margin: 0; padding: 10px 16px; font-size: .8rem; }\r\n.picker__message--error { color: #991b1b; background: #fee2e2; }\r\n.picker__footer > div { display: grid; gap: 3px; min-width: 0; color: var(--color-text-muted); font-size: .78rem; }\r\n.picker__footer small { color: var(--color-success); font-weight: 800; }\r\n.picker__footer span { overflow: hidden; text-overflow: ellipsis; }\r\n.picker__confirm { flex-shrink: 0; min-height: 40px; padding: 0 14px; border-radius: 8px; color: #fff; background: var(--color-primary); }\r\n.picker__confirm:disabled { color: #166534; background: #dcfce7; }\r\n:host ::ng-deep .depa-map-marker span { position: relative; display: block; width: 34px; height: 34px; border: 4px solid #fff; border-radius: 50% 50% 50% 0; background: var(--color-primary); box-shadow: 0 4px 12px rgb(16 24 40 / 35%); transform: rotate(-45deg); }\r\n:host ::ng-deep .depa-map-marker span::after { content: ''; position: absolute; inset: 8px; border-radius: 50%; background: #fff; }\r\n@media (max-width: 620px) {\r\n  .picker__intro, .picker__footer { align-items: stretch; flex-direction: column; }\r\n  .picker__intro > button, .picker__confirm { width: 100%; }\r\n  .picker__map { height: 280px; }\r\n}\r\n"] }]
    }], () => [], { mapElement: [{
            type: ViewChild,
            args: ['map']
        }], direccion: [{ type: i0.Input, args: [{ isSignal: true, alias: "direccion", required: false }] }], ciudad: [{ type: i0.Input, args: [{ isSignal: true, alias: "ciudad", required: false }] }], provincia: [{ type: i0.Input, args: [{ isSignal: true, alias: "provincia", required: false }] }], initialLatitude: [{ type: i0.Input, args: [{ isSignal: true, alias: "initialLatitude", required: false }] }], initialLongitude: [{ type: i0.Input, args: [{ isSignal: true, alias: "initialLongitude", required: false }] }], locationConfirmed: [{ type: i0.Output, args: ["locationConfirmed"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(LocationPickerComponent, { className: "LocationPickerComponent", filePath: "src/app/shared/components/location-picker/location-picker.component.ts", lineNumber: 20 }); })();
