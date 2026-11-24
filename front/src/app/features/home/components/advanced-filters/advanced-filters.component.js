import { NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, HostListener, computed, inject, input, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LucideArrowLeftRight, LucideChevronDown, LucideCoins, LucideDoorOpen, LucideHouse, LucideMapPin, LucideSlidersHorizontal, } from '@lucide/angular';
import { SelectorUbicacionComponent } from '../../../../shared/components/selector-ubicacion/selector-ubicacion.component';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
const _c0 = [[["", "busqueda-mapa", ""]], [["", "modalidades-mapa", ""]]];
const _c1 = ["[busqueda-mapa]", "[modalidades-mapa]"];
const _forTrack0 = ($index, $item) => $item.id;
function AdvancedFiltersComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 5)(1, "details", 7, 4);
    i0.ɵɵlistener("submit", function AdvancedFiltersComponent_Conditional_0_Template_details_submit_1_listener() { i0.ɵɵrestoreView(_r1); const menuUbicacion_r2 = i0.ɵɵreference(2); return i0.ɵɵresetView(menuUbicacion_r2.open = false); });
    i0.ɵɵelementStart(3, "summary", 8);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(4, "svg", 9);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(5, "span");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(7, "svg", 10);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(8, "div", 11);
    i0.ɵɵelementContainer(9, 12);
    i0.ɵɵprojection(10);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "div", 13);
    i0.ɵɵprojection(12, 1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "div", 14);
    i0.ɵɵelementContainer(14, 12);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "details", 15)(16, "summary", 8)(17, "span");
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(19, "svg", 10);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(20, "div", 16);
    i0.ɵɵelementContainer(21, 12);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(22, "details", 17)(23, "summary", 8);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(24, "svg", 18);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(25, "span");
    i0.ɵɵtext(26, "M\u00E1s filtros");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(27, "div", 16);
    i0.ɵɵelementContainer(28, 12);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    const filtroUbicacion_r4 = i0.ɵɵreference(3);
    const filtroTipo_r5 = i0.ɵɵreference(5);
    const filtroPrecio_r6 = i0.ɵɵreference(7);
    const filtrosExtra_r7 = i0.ɵɵreference(9);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("size", 19);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.ubicacionTexto());
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 16);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngTemplateOutlet", filtroUbicacion_r4);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("ngTemplateOutlet", filtroTipo_r5);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r2.form().controls["precioMin"].value != null || ctx_r2.form().controls["precioMax"].value != null ? "Precio aplicado" : "Precio");
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 16);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngTemplateOutlet", filtroPrecio_r6);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("size", 19);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngTemplateOutlet", filtrosExtra_r7);
} }
function AdvancedFiltersComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 19)(1, "div", 20)(2, "span", 21);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(3, "svg", 22);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "div")(5, "h2", 23);
    i0.ɵɵtext(6, "B\u00FAsqueda avanzada");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p");
    i0.ɵɵtext(8, "Filtr\u00E1 por ubicaci\u00F3n, tipo de propiedad, precio y caracter\u00EDsticas");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(9, "div", 24)(10, "div", 25);
    i0.ɵɵelementContainer(11, 12);
    i0.ɵɵelementEnd();
    i0.ɵɵelementContainer(12, 12)(13, 12)(14, 12);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    const filtroUbicacion_r4 = i0.ɵɵreference(3);
    const filtroTipo_r5 = i0.ɵɵreference(5);
    const filtroPrecio_r6 = i0.ɵɵreference(7);
    const filtrosExtra_r7 = i0.ɵɵreference(9);
    i0.ɵɵclassProp("advanced--primary", ctx_r2.categoria() === "largo-plazo")("advanced--secondary", ctx_r2.categoria() === "temporales");
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("size", 48);
    i0.ɵɵadvance(8);
    i0.ɵɵproperty("ngTemplateOutlet", filtroUbicacion_r4);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngTemplateOutlet", filtroTipo_r5);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngTemplateOutlet", filtroPrecio_r6);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngTemplateOutlet", filtrosExtra_r7);
} }
function AdvancedFiltersComponent_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-selector-ubicacion", 26);
    i0.ɵɵlistener("nombresChange", function AdvancedFiltersComponent_ng_template_2_Template_app_selector_ubicacion_nombresChange_0_listener($event) { i0.ɵɵrestoreView(_r8); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.nombres.set($event)); })("provinciaChange", function AdvancedFiltersComponent_ng_template_2_Template_app_selector_ubicacion_provinciaChange_0_listener($event) { i0.ɵɵrestoreView(_r8); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.seleccionarProvincia($event)); })("localidadChange", function AdvancedFiltersComponent_ng_template_2_Template_app_selector_ubicacion_localidadChange_0_listener($event) { i0.ɵɵrestoreView(_r8); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.seleccionarCiudad($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("advanced", !ctx_r2.compacto())("provinciaId", ctx_r2.form().controls["idProvincia"].value)("localidadId", ctx_r2.form().controls["idsCiudad"].value[0] ?? null);
} }
function AdvancedFiltersComponent_ng_template_4_For_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 32);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const tipo_r10 = ctx.$implicit;
    i0.ɵɵproperty("value", tipo_r10.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(tipo_r10.nombre);
} }
function AdvancedFiltersComponent_ng_template_4_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 27)(1, "label", 28);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 22);
    i0.ɵɵtext(3, " Tipo de propiedad ");
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "div", 29)(5, "select", 30);
    i0.ɵɵlistener("change", function AdvancedFiltersComponent_ng_template_4_Template_select_change_5_listener($event) { i0.ɵɵrestoreView(_r9); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.seleccionarTipoPropiedad($event.target.value)); });
    i0.ɵɵelementStart(6, "option", 31);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(8, AdvancedFiltersComponent_ng_template_4_For_9_Template, 2, 2, "option", 32, _forTrack0);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(10, "svg", 10);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 25);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("value", ctx_r2.form().controls["idsTipoPropiedad"].value[0] ?? "");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.compacto() ? "Tipo de propiedad" : "Todas");
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.tiposPropiedad());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 22);
} }
function AdvancedFiltersComponent_ng_template_6_Conditional_4_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 44);
    i0.ɵɵlistener("click", function AdvancedFiltersComponent_ng_template_6_Conditional_4_For_2_Template_button_click_0_listener() { const moneda_r12 = i0.ɵɵrestoreView(_r11).$implicit; const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.seleccionarMoneda(moneda_r12.id)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const moneda_r12 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("advanced__currency-option--active", ctx_r2.form().controls["idTipoMoneda"].value === moneda_r12.id);
    i0.ɵɵattribute("aria-pressed", ctx_r2.form().controls["idTipoMoneda"].value === moneda_r12.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(moneda_r12.codigo);
} }
function AdvancedFiltersComponent_ng_template_6_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 36);
    i0.ɵɵrepeaterCreate(1, AdvancedFiltersComponent_ng_template_6_Conditional_4_For_2_Template, 2, 4, "button", 43, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.monedas());
} }
function AdvancedFiltersComponent_ng_template_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "fieldset", 33)(1, "legend", 34);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 35);
    i0.ɵɵtext(3);
    i0.ɵɵconditionalCreate(4, AdvancedFiltersComponent_ng_template_6_Conditional_4_Template, 3, 0, "span", 36);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(5, "div", 37)(6, "div", 38);
    i0.ɵɵelement(7, "input", 39);
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(8, "span", 40);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(10, "span", 41);
    i0.ɵɵtext(11, "\u2013");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "div", 38);
    i0.ɵɵelement(13, "input", 42);
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(14, "span", 40);
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("formGroup", ctx_r2.form());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 25);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r2.etiquetaPrecio(), " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.monedas().length > 1 ? 4 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵattribute("aria-label", ctx_r2.etiquetaPrecio() + " desde");
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.simboloMoneda());
    i0.ɵɵadvance(4);
    i0.ɵɵattribute("aria-label", ctx_r2.etiquetaPrecio() + " hasta");
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.simboloMoneda());
} }
function AdvancedFiltersComponent_ng_template_8_For_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 32);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ambiente_r14 = ctx.$implicit;
    i0.ɵɵproperty("value", ambiente_r14);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ambiente_r14 === "4+" ? "4 o m\u00E1s" : ambiente_r14);
} }
function AdvancedFiltersComponent_ng_template_8_Template(rf, ctx) { if (rf & 1) {
    const _r13 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 27)(1, "label", 45);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 46);
    i0.ɵɵtext(3, " Ambientes ");
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "div", 29)(5, "select", 47);
    i0.ɵɵlistener("change", function AdvancedFiltersComponent_ng_template_8_Template_select_change_5_listener($event) { i0.ɵɵrestoreView(_r13); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.seleccionarAmbientes($event.target.value)); });
    i0.ɵɵelementStart(6, "option", 31);
    i0.ɵɵtext(7, "Todos");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(8, AdvancedFiltersComponent_ng_template_8_For_9_Template, 2, 2, "option", 32, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(10, "svg", 10);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(11, "div", 48)(12, "label", 49);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(13, "svg", 50);
    i0.ɵɵtext(14, " m\u00B2 m\u00EDnimos ");
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(15, "div", 38);
    i0.ɵɵelement(16, "input", 51);
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(17, "span", 40);
    i0.ɵɵtext(18, "m\u00B2");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 25);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("value", ctx_r2.form().controls["ambientesSeleccionados"].value[0] ?? "");
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.ambientes);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 22);
    i0.ɵɵadvance();
    i0.ɵɵproperty("formGroup", ctx_r2.form());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 25);
    i0.ɵɵadvance(3);
    i0.ɵɵcontrol();
} }
export class AdvancedFiltersComponent {
    elemento = inject((ElementRef));
    form = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "form" }] : /* istanbul ignore next */ []));
    tiposPropiedad = input([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tiposPropiedad" }] : /* istanbul ignore next */ []));
    monedas = input([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "monedas" }] : /* istanbul ignore next */ []));
    categoria = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "categoria" }] : /* istanbul ignore next */ []));
    compacto = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "compacto" }] : /* istanbul ignore next */ []));
    busquedaActiva = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busquedaActiva" }] : /* istanbul ignore next */ []));
    nombres = signal({ localidad: '', provincia: '' }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "nombres" }] : /* istanbul ignore next */ []));
    // Temporal cobra por día y largo plazo por mes; sin modalidad elegida se mezclan ambos.
    etiquetaPrecio = computed(() => {
        switch (this.categoria()) {
            case 'temporales': return 'Precio por día';
            case 'largo-plazo': return 'Precio mensual';
            default: return 'Precio';
        }
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "etiquetaPrecio" }] : /* istanbul ignore next */ []));
    ubicacionTexto = computed(() => [this.nombres().localidad, this.nombres().provincia]
        .filter(Boolean).join(', ') || this.busquedaActiva() || 'Buscar ubicación', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ubicacionTexto" }] : /* istanbul ignore next */ []));
    ambientes = ['1', '2', '3', '4+'];
    cerrarFuera(evento) {
        const menu = this.menuAbierto();
        if (menu && evento.target instanceof Node && !menu.contains(evento.target))
            menu.open = false;
    }
    cerrarConEscape(evento) {
        const menu = this.menuAbierto();
        if (!menu || evento.defaultPrevented)
            return;
        evento.preventDefault();
        menu.open = false;
        menu.querySelector('summary')?.focus();
    }
    menuAbierto() {
        return this.elemento.nativeElement.querySelector('.advanced__menu[open]');
    }
    seleccionarProvincia(id) {
        this.form().patchValue({ idProvincia: id, idsCiudad: [] });
    }
    seleccionarCiudad(id) {
        this.form().controls['idsCiudad'].setValue(id == null ? [] : [id]);
    }
    seleccionarTipoPropiedad(valor) {
        this.form().controls['idsTipoPropiedad'].setValue(valor ? [Number(valor)] : []);
    }
    seleccionarAmbientes(valor) {
        this.form().controls['ambientesSeleccionados'].setValue(valor ? [valor] : []);
    }
    seleccionarMoneda(id) {
        this.form().controls['idTipoMoneda'].setValue(id);
    }
    simboloMoneda() {
        const id = this.form().controls['idTipoMoneda']?.value;
        return this.monedas().find((moneda) => moneda.id === id)?.codigo === 'USD' ? 'US$' : '$';
    }
    static ɵfac = function AdvancedFiltersComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AdvancedFiltersComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AdvancedFiltersComponent, selectors: [["app-advanced-filters"]], hostBindings: function AdvancedFiltersComponent_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("pointerdown", function AdvancedFiltersComponent_pointerdown_HostBindingHandler($event) { return ctx.cerrarFuera($event); }, i0.ɵɵresolveDocument)("keydown.escape", function AdvancedFiltersComponent_keydown_escape_HostBindingHandler($event) { return ctx.cerrarConEscape($event); });
        } }, inputs: { form: [1, "form"], tiposPropiedad: [1, "tiposPropiedad"], monedas: [1, "monedas"], categoria: [1, "categoria"], compacto: [1, "compacto"], busquedaActiva: [1, "busquedaActiva"] }, ngContentSelectors: _c1, decls: 10, vars: 1, consts: [["filtroUbicacion", ""], ["filtroTipo", ""], ["filtroPrecio", ""], ["filtrosExtra", ""], ["menuUbicacion", ""], ["aria-label", "Filtros del mapa", 1, "advanced-toolbar"], ["aria-labelledby", "advanced-title", 1, "advanced", 3, "advanced--primary", "advanced--secondary"], ["name", "filtros-mapa", 1, "advanced__menu", "advanced__menu--location", 3, "submit"], [1, "advanced__trigger"], ["lucideMapPin", "", "aria-hidden", "true", 1, "advanced__pin", 3, "size"], ["lucideChevronDown", "", "aria-hidden", "true", 3, "size"], [1, "advanced__panel", "advanced__panel--location"], [3, "ngTemplateOutlet"], [1, "advanced-toolbar__modes"], [1, "advanced-toolbar__type"], ["name", "filtros-mapa", 1, "advanced__menu", "advanced__menu--price"], [1, "advanced__panel"], ["name", "filtros-mapa", 1, "advanced__menu", "advanced__menu--more"], ["lucideSlidersHorizontal", "", "aria-hidden", "true", 3, "size"], ["aria-labelledby", "advanced-title", 1, "advanced"], [1, "advanced__intro"], [1, "advanced__icon"], ["lucideHouse", "", "aria-hidden", "true", 3, "size"], ["id", "advanced-title"], [1, "advanced__controls"], [1, "advanced__location"], ["idPrefix", "filtro-ubicacion", 3, "nombresChange", "provinciaChange", "localidadChange", "advanced", "provinciaId", "localidadId"], [1, "advanced__field"], ["for", "filtro-tipo-propiedad", 1, "advanced__label"], [1, "advanced__select"], ["id", "filtro-tipo-propiedad", 3, "change", "value"], ["value", ""], [3, "value"], [1, "advanced__field", "advanced__price", 3, "formGroup"], [1, "advanced__label"], ["lucideCoins", "", "aria-hidden", "true", 3, "size"], ["role", "group", "aria-label", "Moneda del precio", 1, "advanced__currency"], [1, "advanced__price-inputs"], [1, "advanced__input"], ["type", "number", "min", "0", "placeholder", "Desde", "formControlName", "precioMin"], ["aria-hidden", "true"], ["aria-hidden", "true", 1, "advanced__separator"], ["type", "number", "min", "0", "placeholder", "Hasta", "formControlName", "precioMax"], ["type", "button", 1, "advanced__currency-option", 3, "advanced__currency-option--active"], ["type", "button", 1, "advanced__currency-option", 3, "click"], ["for", "filtro-ambientes", 1, "advanced__label"], ["lucideDoorOpen", "", "aria-hidden", "true", 3, "size"], ["id", "filtro-ambientes", 3, "change", "value"], [1, "advanced__field", 3, "formGroup"], ["for", "filtro-superficie", 1, "advanced__label"], ["lucideArrowLeftRight", "", "aria-hidden", "true", 3, "size"], ["id", "filtro-superficie", "type", "number", "min", "0", "placeholder", "Ej. 50", "formControlName", "superficieMin"]], template: function AdvancedFiltersComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef(_c0);
            i0.ɵɵconditionalCreate(0, AdvancedFiltersComponent_Conditional_0_Template, 29, 10, "section", 5)(1, AdvancedFiltersComponent_Conditional_1_Template, 15, 9, "section", 6);
            i0.ɵɵtemplate(2, AdvancedFiltersComponent_ng_template_2_Template, 1, 3, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor)(4, AdvancedFiltersComponent_ng_template_4_Template, 11, 4, "ng-template", null, 1, i0.ɵɵtemplateRefExtractor)(6, AdvancedFiltersComponent_ng_template_6_Template, 16, 8, "ng-template", null, 2, i0.ɵɵtemplateRefExtractor)(8, AdvancedFiltersComponent_ng_template_8_Template, 19, 5, "ng-template", null, 3, i0.ɵɵtemplateRefExtractor);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.compacto() ? 0 : 1);
        } }, dependencies: [ReactiveFormsModule, i1.NgSelectOption, i1.ɵNgSelectMultipleOption, i1.DefaultValueAccessor, i1.NumberValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.MinValidator, i1.FormGroupDirective, i1.FormControlName, NgTemplateOutlet,
            SelectorUbicacionComponent,
            LucideHouse,
            LucideCoins,
            LucideDoorOpen,
            LucideArrowLeftRight,
            LucideChevronDown,
            LucideMapPin,
            LucideSlidersHorizontal], styles: ["[_nghost-%COMP%] {\r\n  display: block;\r\n  padding-inline: 1rem;\r\n}\r\n\r\n.advanced[_ngcontent-%COMP%] {\r\n  --%NS%filter-accent: var(--%NS%color-accent);\r\n  max-width: 1216px;\r\n  margin: 0 auto;\r\n  padding: 1.25rem 1.5rem;\r\n  border-radius: 14px;\r\n  background: linear-gradient(\r\n    115deg,\r\n    var(--%NS%filter-accent),\r\n    color-mix(in srgb, var(--%NS%filter-accent) 95%, #000)\r\n  );\r\n  color: #fff;\r\n  box-shadow: 0 6px 18px color-mix(in srgb, var(--%NS%filter-accent) 14%, transparent);\r\n}\r\n\r\n.advanced--primary[_ngcontent-%COMP%] {\r\n  --%NS%filter-accent: var(--%NS%color-primary);\r\n}\r\n\r\n.advanced--secondary[_ngcontent-%COMP%] {\r\n  --%NS%filter-accent: var(--%NS%color-secondary);\r\n}\r\n\r\n.advanced__intro[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.85rem;\r\n  margin-bottom: 1rem;\r\n}\r\n\r\n.advanced__icon[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  flex: 0 0 44px;\r\n  place-items: center;\r\n  height: 44px;\r\n  border-radius: 11px;\r\n  background: #fff;\r\n  color: var(--%NS%filter-accent);\r\n}\r\n\r\n.advanced__icon[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\r\n  width: 28px;\r\n  height: 28px;\r\n}\r\n\r\n.advanced__intro[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\r\n  margin: 0;\r\n  font-size: 1.375rem;\r\n  font-weight: 800;\r\n  line-height: 1.15;\r\n  letter-spacing: -0.025em;\r\n}\r\n\r\n.advanced__intro[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\r\n  margin: 0.2rem 0 0;\r\n  font-size: 0.85rem;\r\n  line-height: 1.4;\r\n}\r\n\r\n.advanced__controls[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  grid-template-columns: repeat(3, minmax(0, 1fr));\r\n  align-items: start;\r\n  gap: 0.85rem 1.25rem;\r\n}\r\n\r\n.advanced__location[_ngcontent-%COMP%] {\r\n  grid-column: span 2;\r\n  min-width: 0;\r\n}\r\n\r\n.advanced__field[_ngcontent-%COMP%] {\r\n  min-width: 0;\r\n  margin: 0;\r\n  padding: 0;\r\n  border: 0;\r\n}\r\n\r\n.advanced__label[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.4rem;\r\n  margin-bottom: 0.35rem;\r\n  padding: 0;\r\n  color: #fff;\r\n  font-size: 0.8rem;\r\n  font-weight: 750;\r\n  line-height: 20px;\r\n}\r\n\r\n.advanced__label[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\r\n  flex-shrink: 0;\r\n  width: 20px;\r\n  height: 20px;\r\n}\r\n\r\n.advanced__select[_ngcontent-%COMP%], \r\n.advanced__input[_ngcontent-%COMP%] {\r\n  position: relative;\r\n  display: flex;\r\n  align-items: center;\r\n  min-width: 0;\r\n  height: 44px;\r\n  border: 1px solid #d0d5dd;\r\n  border-radius: 8px;\r\n  background: #fff;\r\n  color: #101f3d;\r\n}\r\n\r\n.advanced__select[_ngcontent-%COMP%]:focus-within, \r\n.advanced__input[_ngcontent-%COMP%]:focus-within {\r\n  border-color: var(--%NS%color-secondary);\r\n  outline: 3px solid rgb(14 71 161 / 20%);\r\n}\r\n\r\n.advanced__select[_ngcontent-%COMP%]   select[_ngcontent-%COMP%], \r\n.advanced__input[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\r\n  width: 100%;\r\n  min-width: 0;\r\n  height: 100%;\r\n  padding: 0 0.8rem;\r\n  border: 0;\r\n  border-radius: inherit;\r\n  outline: none;\r\n  background: transparent;\r\n  color: inherit;\r\n  font: inherit;\r\n  font-size: 0.9rem;\r\n}\r\n\r\n.advanced__select[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\r\n  appearance: none;\r\n  padding-right: 2.5rem;\r\n  cursor: pointer;\r\n}\r\n\r\n.advanced__select[_ngcontent-%COMP%]    > svg[_ngcontent-%COMP%] {\r\n  position: absolute;\r\n  right: 0.8rem;\r\n  width: 18px;\r\n  height: 18px;\r\n  pointer-events: none;\r\n}\r\n\r\n.advanced__input[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]::placeholder {\r\n  color: #7c879b;\r\n  opacity: 1;\r\n}\r\n\r\n.advanced__input[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] {\r\n  flex-shrink: 0;\r\n  padding-right: 0.8rem;\r\n  color: #7c879b;\r\n  font-size: 0.9rem;\r\n  font-weight: 700;\r\n}\r\n\r\n.advanced__price[_ngcontent-%COMP%]   .advanced__label[_ngcontent-%COMP%] {\r\n  width: 100%;\r\n}\r\n\r\n.advanced__currency[_ngcontent-%COMP%] {\r\n  display: inline-flex;\r\n  margin-left: auto;\r\n  padding: 2px;\r\n  border-radius: 999px;\r\n  background: rgb(255 255 255 / 22%);\r\n}\r\n\r\n.advanced__currency-option[_ngcontent-%COMP%] {\r\n  min-width: 2.6rem;\r\n  padding: 0.05rem 0.55rem;\r\n  border: 0;\r\n  border-radius: 999px;\r\n  background: transparent;\r\n  color: inherit;\r\n  font: inherit;\r\n  font-size: 0.72rem;\r\n  font-weight: 800;\r\n  line-height: 18px;\r\n  cursor: pointer;\r\n}\r\n\r\n.advanced__currency-option--active[_ngcontent-%COMP%] {\r\n  background: #fff;\r\n  color: var(--%NS%filter-accent, var(--%NS%color-secondary));\r\n}\r\n\r\n.advanced__currency-option[_ngcontent-%COMP%]:focus-visible {\r\n  outline: 2px solid #fff;\r\n  outline-offset: 1px;\r\n}\r\n\r\n.advanced__panel[_ngcontent-%COMP%]   .advanced__currency[_ngcontent-%COMP%] {\r\n  background: #eef2f7;\r\n}\r\n\r\n.advanced__panel[_ngcontent-%COMP%]   .advanced__currency-option--active[_ngcontent-%COMP%] {\r\n  background: var(--%NS%color-secondary);\r\n  color: #fff;\r\n}\r\n\r\n.advanced__panel[_ngcontent-%COMP%]   .advanced__currency-option[_ngcontent-%COMP%]:focus-visible {\r\n  outline-color: var(--%NS%color-secondary);\r\n}\r\n\r\n.advanced__price-inputs[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);\r\n  align-items: center;\r\n  gap: 0.5rem;\r\n}\r\n\r\n.advanced__separator[_ngcontent-%COMP%] {\r\n  font-size: 1.15rem;\r\n  font-weight: 700;\r\n}\r\n\r\n.advanced-toolbar[_ngcontent-%COMP%] {\r\n  position: relative;\r\n  z-index: 2;\r\n  display: grid;\r\n  grid-template-columns: minmax(11rem, 1.5fr) auto minmax(8rem, 1fr) minmax(6rem, .7fr) auto;\r\n  align-items: center;\r\n  gap: .65rem;\r\n  max-width: 1168px;\r\n  margin: 0 auto;\r\n  padding: .75rem 0;\r\n  color: var(--%NS%color-text);\r\n}\r\n.advanced-toolbar__modes[_ngcontent-%COMP%] {\r\n  padding-left: .65rem;\r\n  border-left: 1px solid #dbe2ec;\r\n}\r\n.advanced-toolbar__type[_ngcontent-%COMP%]   .advanced__label[_ngcontent-%COMP%] {\r\n  position: absolute;\r\n  width: 1px;\r\n  height: 1px;\r\n  overflow: hidden;\r\n  clip-path: inset(50%);\r\n}\r\n.advanced-toolbar__type[_ngcontent-%COMP%]   .advanced__select[_ngcontent-%COMP%] { height: 44px; }\r\n.advanced__menu[_ngcontent-%COMP%] { min-width: 0; }\r\n.advanced__trigger[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: .42rem;\r\n  height: 44px;\r\n  padding: 0 .72rem;\r\n  border: 1px solid #d0d5dd;\r\n  border-radius: 8px;\r\n  background: white;\r\n  font-size: .86rem;\r\n  font-weight: 650;\r\n  cursor: pointer;\r\n  list-style: none;\r\n}\r\n.advanced__trigger[_ngcontent-%COMP%]::-webkit-details-marker { display: none; }\r\n.advanced__trigger[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\r\n.advanced__trigger[_ngcontent-%COMP%]    > svg[_ngcontent-%COMP%] { flex: none; }\r\n.advanced__pin[_ngcontent-%COMP%] { color: var(--%NS%color-primary); }\r\n.advanced__trigger[_ngcontent-%COMP%]:hover, .advanced__menu[open][_ngcontent-%COMP%]    > .advanced__trigger[_ngcontent-%COMP%] { background: #f3f7fc; border-color: #a8bad6; }\r\n.advanced__trigger[_ngcontent-%COMP%]:focus-visible { outline: 2px solid var(--%NS%color-secondary); outline-offset: 2px; }\r\n.advanced__panel[_ngcontent-%COMP%] {\r\n  position: absolute;\r\n  top: calc(100% - .45rem);\r\n  right: 0;\r\n  z-index: 3;\r\n  display: grid;\r\n  gap: .8rem;\r\n  width: min(20rem, 100%);\r\n  padding: 1rem;\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: var(--%NS%radius-md);\r\n  background: white;\r\n  box-shadow: 0 10px 25px rgb(16 24 40 / 16%);\r\n}\r\n.advanced__panel--location[_ngcontent-%COMP%] { left: 0; right: auto; width: min(25rem, 100%); }\r\n.advanced__menu[_ngcontent-%COMP%]:not([open])    > .advanced__panel[_ngcontent-%COMP%] { display: none; }\r\n.advanced__panel[_ngcontent-%COMP%]   .advanced__label[_ngcontent-%COMP%] { color: var(--%NS%color-text); }\r\n.advanced__menu--price[_ngcontent-%COMP%] { position: relative; }\r\n.advanced__menu--price[_ngcontent-%COMP%]   .advanced__panel[_ngcontent-%COMP%] { top: calc(100% + .35rem); width: 16rem; }\r\n@media (max-width: 930px) {\r\n  .advanced-toolbar[_ngcontent-%COMP%] { grid-template-columns: minmax(0, 1fr) auto auto; gap: .5rem; }\r\n  .advanced-toolbar__modes[_ngcontent-%COMP%] { grid-column: 2 / -1; grid-row: 1; padding-left: 0; border: 0; }\r\n}\r\n@media (max-width: 640px) {\r\n  .advanced-toolbar__modes[_ngcontent-%COMP%] { grid-column: 1 / -1; grid-row: 1; }\r\n  .advanced__menu--location[_ngcontent-%COMP%] { grid-column: 1 / -1; }\r\n  .advanced-toolbar[_ngcontent-%COMP%] { padding: .45rem 0; }\r\n  .advanced__trigger[_ngcontent-%COMP%], .advanced-toolbar__type[_ngcontent-%COMP%]   .advanced__select[_ngcontent-%COMP%] { height: 36px; }\r\n  .advanced__trigger[_ngcontent-%COMP%], .advanced-toolbar__type[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] { font-size: .77rem; }\r\n  .advanced__menu[_ngcontent-%COMP%]:not(.advanced__menu--location)   .advanced__trigger[_ngcontent-%COMP%] { padding-inline: .45rem; }\r\n  .advanced__menu--more[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { width: 15px; }\r\n  .advanced__menu--price[_ngcontent-%COMP%] { position: static; }\r\n  .advanced__menu--price[_ngcontent-%COMP%]   .advanced__panel[_ngcontent-%COMP%] { top: calc(100% - .25rem); width: min(16rem, 100%); }\r\n}\r\n@media (max-width: 900px) {\r\n  .advanced__controls[_ngcontent-%COMP%] {\r\n    grid-template-columns: repeat(2, minmax(0, 1fr));\r\n  }\r\n\r\n  .advanced__price[_ngcontent-%COMP%] {\r\n    grid-column: span 2;\r\n  }\r\n}\r\n\r\n@media (max-width: 600px) {\r\n  .advanced[_ngcontent-%COMP%] {\r\n    padding: 1rem;\r\n  }\r\n\r\n  .advanced__intro[_ngcontent-%COMP%] {\r\n    align-items: flex-start;\r\n    gap: 0.85rem;\r\n    margin-bottom: 1rem;\r\n  }\r\n\r\n  .advanced__controls[_ngcontent-%COMP%] {\r\n    grid-template-columns: minmax(0, 1fr);\r\n    gap: 0.85rem;\r\n  }\r\n\r\n  .advanced__location[_ngcontent-%COMP%], \r\n   .advanced__price[_ngcontent-%COMP%] {\r\n    grid-column: auto;\r\n  }\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AdvancedFiltersComponent, [{
        type: Component,
        args: [{ selector: 'app-advanced-filters', standalone: true, imports: [
                    ReactiveFormsModule,
                    NgTemplateOutlet,
                    SelectorUbicacionComponent,
                    LucideHouse,
                    LucideCoins,
                    LucideDoorOpen,
                    LucideArrowLeftRight,
                    LucideChevronDown,
                    LucideMapPin,
                    LucideSlidersHorizontal,
                ], template: "@if (compacto()) {\r\n  <section class=\"advanced-toolbar\" aria-label=\"Filtros del mapa\">\r\n    <details #menuUbicacion name=\"filtros-mapa\" class=\"advanced__menu advanced__menu--location\"\r\n      (submit)=\"menuUbicacion.open = false\">\r\n      <summary class=\"advanced__trigger\">\r\n        <svg lucideMapPin [size]=\"19\" class=\"advanced__pin\" aria-hidden=\"true\"></svg>\r\n        <span>{{ ubicacionTexto() }}</span>\r\n        <svg lucideChevronDown [size]=\"16\" aria-hidden=\"true\"></svg>\r\n      </summary>\r\n      <div class=\"advanced__panel advanced__panel--location\">\r\n        <ng-container [ngTemplateOutlet]=\"filtroUbicacion\" />\r\n        <ng-content select=\"[busqueda-mapa]\" />\r\n      </div>\r\n    </details>\r\n    <div class=\"advanced-toolbar__modes\"><ng-content select=\"[modalidades-mapa]\" /></div>\r\n    <div class=\"advanced-toolbar__type\">\r\n      <ng-container [ngTemplateOutlet]=\"filtroTipo\" />\r\n    </div>\r\n    <details name=\"filtros-mapa\" class=\"advanced__menu advanced__menu--price\">\r\n      <summary class=\"advanced__trigger\">\r\n        <span>{{ form().controls['precioMin'].value != null || form().controls['precioMax'].value != null ? 'Precio aplicado' : 'Precio' }}</span>\r\n        <svg lucideChevronDown [size]=\"16\" aria-hidden=\"true\"></svg>\r\n      </summary>\r\n      <div class=\"advanced__panel\"><ng-container [ngTemplateOutlet]=\"filtroPrecio\" /></div>\r\n    </details>\r\n    <details name=\"filtros-mapa\" class=\"advanced__menu advanced__menu--more\">\r\n      <summary class=\"advanced__trigger\">\r\n        <svg lucideSlidersHorizontal [size]=\"19\" aria-hidden=\"true\"></svg>\r\n        <span>M\u00E1s filtros</span>\r\n      </summary>\r\n      <div class=\"advanced__panel\"><ng-container [ngTemplateOutlet]=\"filtrosExtra\" /></div>\r\n    </details>\r\n  </section>\r\n} @else {\r\n  <section class=\"advanced\"\r\n    [class.advanced--primary]=\"categoria() === 'largo-plazo'\"\r\n    [class.advanced--secondary]=\"categoria() === 'temporales'\"\r\n    aria-labelledby=\"advanced-title\">\r\n    <div class=\"advanced__intro\">\r\n      <span class=\"advanced__icon\"><svg lucideHouse [size]=\"48\" aria-hidden=\"true\"></svg></span>\r\n      <div>\r\n        <h2 id=\"advanced-title\">B\u00FAsqueda avanzada</h2>\r\n        <p>Filtr\u00E1 por ubicaci\u00F3n, tipo de propiedad, precio y caracter\u00EDsticas</p>\r\n      </div>\r\n    </div>\r\n    <div class=\"advanced__controls\">\r\n      <div class=\"advanced__location\"><ng-container [ngTemplateOutlet]=\"filtroUbicacion\" /></div>\r\n      <ng-container [ngTemplateOutlet]=\"filtroTipo\" />\r\n      <ng-container [ngTemplateOutlet]=\"filtroPrecio\" />\r\n      <ng-container [ngTemplateOutlet]=\"filtrosExtra\" />\r\n    </div>\r\n  </section>\r\n}\r\n\r\n<ng-template #filtroUbicacion>\r\n  <app-selector-ubicacion\r\n    idPrefix=\"filtro-ubicacion\"\r\n    [advanced]=\"!compacto()\"\r\n    [provinciaId]=\"form().controls['idProvincia'].value\"\r\n    [localidadId]=\"form().controls['idsCiudad'].value[0] ?? null\"\r\n    (nombresChange)=\"nombres.set($event)\"\r\n    (provinciaChange)=\"seleccionarProvincia($event)\"\r\n    (localidadChange)=\"seleccionarCiudad($event)\"\r\n  />\r\n</ng-template>\r\n\r\n<ng-template #filtroTipo>\r\n  <div class=\"advanced__field\">\r\n    <label class=\"advanced__label\" for=\"filtro-tipo-propiedad\">\r\n      <svg lucideHouse [size]=\"25\" aria-hidden=\"true\"></svg>\r\n      Tipo de propiedad\r\n    </label>\r\n    <div class=\"advanced__select\">\r\n      <select\r\n        id=\"filtro-tipo-propiedad\"\r\n        [value]=\"form().controls['idsTipoPropiedad'].value[0] ?? ''\"\r\n        (change)=\"seleccionarTipoPropiedad($any($event.target).value)\"\r\n      >\r\n        <option value=\"\">{{ compacto() ? 'Tipo de propiedad' : 'Todas' }}</option>\r\n        @for (tipo of tiposPropiedad(); track tipo.id) {\r\n          <option [value]=\"tipo.id\">{{ tipo.nombre }}</option>\r\n        }\r\n      </select>\r\n      <svg lucideChevronDown [size]=\"22\" aria-hidden=\"true\"></svg>\r\n    </div>\r\n  </div>\r\n</ng-template>\r\n\r\n<ng-template #filtroPrecio>\r\n  <fieldset class=\"advanced__field advanced__price\" [formGroup]=\"form()\">\r\n    <legend class=\"advanced__label\">\r\n      <svg lucideCoins [size]=\"25\" aria-hidden=\"true\"></svg>\r\n      {{ etiquetaPrecio() }}\r\n      @if (monedas().length > 1) {\r\n        <span class=\"advanced__currency\" role=\"group\" aria-label=\"Moneda del precio\">\r\n          @for (moneda of monedas(); track moneda.id) {\r\n            <button\r\n              type=\"button\"\r\n              class=\"advanced__currency-option\"\r\n              [class.advanced__currency-option--active]=\"form().controls['idTipoMoneda'].value === moneda.id\"\r\n              [attr.aria-pressed]=\"form().controls['idTipoMoneda'].value === moneda.id\"\r\n              (click)=\"seleccionarMoneda(moneda.id)\"\r\n            >{{ moneda.codigo }}</button>\r\n          }\r\n        </span>\r\n      }\r\n    </legend>\r\n    <div class=\"advanced__price-inputs\">\r\n      <div class=\"advanced__input\">\r\n        <input\r\n          type=\"number\"\r\n          min=\"0\"\r\n          placeholder=\"Desde\"\r\n          [attr.aria-label]=\"etiquetaPrecio() + ' desde'\"\r\n          formControlName=\"precioMin\"\r\n        />\r\n        <span aria-hidden=\"true\">{{ simboloMoneda() }}</span>\r\n      </div>\r\n      <span class=\"advanced__separator\" aria-hidden=\"true\">\u2013</span>\r\n      <div class=\"advanced__input\">\r\n        <input\r\n          type=\"number\"\r\n          min=\"0\"\r\n          placeholder=\"Hasta\"\r\n          [attr.aria-label]=\"etiquetaPrecio() + ' hasta'\"\r\n          formControlName=\"precioMax\"\r\n        />\r\n        <span aria-hidden=\"true\">{{ simboloMoneda() }}</span>\r\n      </div>\r\n    </div>\r\n  </fieldset>\r\n</ng-template>\r\n\r\n<ng-template #filtrosExtra>\r\n  <div class=\"advanced__field\">\r\n    <label class=\"advanced__label\" for=\"filtro-ambientes\">\r\n      <svg lucideDoorOpen [size]=\"25\" aria-hidden=\"true\"></svg>\r\n      Ambientes\r\n    </label>\r\n    <div class=\"advanced__select\">\r\n      <select\r\n        id=\"filtro-ambientes\"\r\n        [value]=\"form().controls['ambientesSeleccionados'].value[0] ?? ''\"\r\n        (change)=\"seleccionarAmbientes($any($event.target).value)\"\r\n      >\r\n        <option value=\"\">Todos</option>\r\n        @for (ambiente of ambientes; track ambiente) {\r\n          <option [value]=\"ambiente\">{{ ambiente === '4+' ? '4 o m\u00E1s' : ambiente }}</option>\r\n        }\r\n      </select>\r\n      <svg lucideChevronDown [size]=\"22\" aria-hidden=\"true\"></svg>\r\n    </div>\r\n  </div>\r\n\r\n  <div class=\"advanced__field\" [formGroup]=\"form()\">\r\n    <label class=\"advanced__label\" for=\"filtro-superficie\">\r\n      <svg lucideArrowLeftRight [size]=\"25\" aria-hidden=\"true\"></svg>\r\n      m\u00B2 m\u00EDnimos\r\n    </label>\r\n    <div class=\"advanced__input\">\r\n      <input\r\n        id=\"filtro-superficie\"\r\n        type=\"number\"\r\n        min=\"0\"\r\n        placeholder=\"Ej. 50\"\r\n        formControlName=\"superficieMin\"\r\n      />\r\n      <span aria-hidden=\"true\">m\u00B2</span>\r\n    </div>\r\n  </div>\r\n</ng-template>\r\n", styles: [":host {\r\n  display: block;\r\n  padding-inline: 1rem;\r\n}\r\n\r\n.advanced {\r\n  --filter-accent: var(--color-accent);\r\n  max-width: 1216px;\r\n  margin: 0 auto;\r\n  padding: 1.25rem 1.5rem;\r\n  border-radius: 14px;\r\n  background: linear-gradient(\r\n    115deg,\r\n    var(--filter-accent),\r\n    color-mix(in srgb, var(--filter-accent) 95%, #000)\r\n  );\r\n  color: #fff;\r\n  box-shadow: 0 6px 18px color-mix(in srgb, var(--filter-accent) 14%, transparent);\r\n}\r\n\r\n.advanced--primary {\r\n  --filter-accent: var(--color-primary);\r\n}\r\n\r\n.advanced--secondary {\r\n  --filter-accent: var(--color-secondary);\r\n}\r\n\r\n.advanced__intro {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.85rem;\r\n  margin-bottom: 1rem;\r\n}\r\n\r\n.advanced__icon {\r\n  display: grid;\r\n  flex: 0 0 44px;\r\n  place-items: center;\r\n  height: 44px;\r\n  border-radius: 11px;\r\n  background: #fff;\r\n  color: var(--filter-accent);\r\n}\r\n\r\n.advanced__icon svg {\r\n  width: 28px;\r\n  height: 28px;\r\n}\r\n\r\n.advanced__intro h2 {\r\n  margin: 0;\r\n  font-size: 1.375rem;\r\n  font-weight: 800;\r\n  line-height: 1.15;\r\n  letter-spacing: -0.025em;\r\n}\r\n\r\n.advanced__intro p {\r\n  margin: 0.2rem 0 0;\r\n  font-size: 0.85rem;\r\n  line-height: 1.4;\r\n}\r\n\r\n.advanced__controls {\r\n  display: grid;\r\n  grid-template-columns: repeat(3, minmax(0, 1fr));\r\n  align-items: start;\r\n  gap: 0.85rem 1.25rem;\r\n}\r\n\r\n.advanced__location {\r\n  grid-column: span 2;\r\n  min-width: 0;\r\n}\r\n\r\n.advanced__field {\r\n  min-width: 0;\r\n  margin: 0;\r\n  padding: 0;\r\n  border: 0;\r\n}\r\n\r\n.advanced__label {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.4rem;\r\n  margin-bottom: 0.35rem;\r\n  padding: 0;\r\n  color: #fff;\r\n  font-size: 0.8rem;\r\n  font-weight: 750;\r\n  line-height: 20px;\r\n}\r\n\r\n.advanced__label svg {\r\n  flex-shrink: 0;\r\n  width: 20px;\r\n  height: 20px;\r\n}\r\n\r\n.advanced__select,\r\n.advanced__input {\r\n  position: relative;\r\n  display: flex;\r\n  align-items: center;\r\n  min-width: 0;\r\n  height: 44px;\r\n  border: 1px solid #d0d5dd;\r\n  border-radius: 8px;\r\n  background: #fff;\r\n  color: #101f3d;\r\n}\r\n\r\n.advanced__select:focus-within,\r\n.advanced__input:focus-within {\r\n  border-color: var(--color-secondary);\r\n  outline: 3px solid rgb(14 71 161 / 20%);\r\n}\r\n\r\n.advanced__select select,\r\n.advanced__input input {\r\n  width: 100%;\r\n  min-width: 0;\r\n  height: 100%;\r\n  padding: 0 0.8rem;\r\n  border: 0;\r\n  border-radius: inherit;\r\n  outline: none;\r\n  background: transparent;\r\n  color: inherit;\r\n  font: inherit;\r\n  font-size: 0.9rem;\r\n}\r\n\r\n.advanced__select select {\r\n  appearance: none;\r\n  padding-right: 2.5rem;\r\n  cursor: pointer;\r\n}\r\n\r\n.advanced__select > svg {\r\n  position: absolute;\r\n  right: 0.8rem;\r\n  width: 18px;\r\n  height: 18px;\r\n  pointer-events: none;\r\n}\r\n\r\n.advanced__input input::placeholder {\r\n  color: #7c879b;\r\n  opacity: 1;\r\n}\r\n\r\n.advanced__input > span {\r\n  flex-shrink: 0;\r\n  padding-right: 0.8rem;\r\n  color: #7c879b;\r\n  font-size: 0.9rem;\r\n  font-weight: 700;\r\n}\r\n\r\n.advanced__price .advanced__label {\r\n  width: 100%;\r\n}\r\n\r\n.advanced__currency {\r\n  display: inline-flex;\r\n  margin-left: auto;\r\n  padding: 2px;\r\n  border-radius: 999px;\r\n  background: rgb(255 255 255 / 22%);\r\n}\r\n\r\n.advanced__currency-option {\r\n  min-width: 2.6rem;\r\n  padding: 0.05rem 0.55rem;\r\n  border: 0;\r\n  border-radius: 999px;\r\n  background: transparent;\r\n  color: inherit;\r\n  font: inherit;\r\n  font-size: 0.72rem;\r\n  font-weight: 800;\r\n  line-height: 18px;\r\n  cursor: pointer;\r\n}\r\n\r\n.advanced__currency-option--active {\r\n  background: #fff;\r\n  color: var(--filter-accent, var(--color-secondary));\r\n}\r\n\r\n.advanced__currency-option:focus-visible {\r\n  outline: 2px solid #fff;\r\n  outline-offset: 1px;\r\n}\r\n\r\n.advanced__panel .advanced__currency {\r\n  background: #eef2f7;\r\n}\r\n\r\n.advanced__panel .advanced__currency-option--active {\r\n  background: var(--color-secondary);\r\n  color: #fff;\r\n}\r\n\r\n.advanced__panel .advanced__currency-option:focus-visible {\r\n  outline-color: var(--color-secondary);\r\n}\r\n\r\n.advanced__price-inputs {\r\n  display: grid;\r\n  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);\r\n  align-items: center;\r\n  gap: 0.5rem;\r\n}\r\n\r\n.advanced__separator {\r\n  font-size: 1.15rem;\r\n  font-weight: 700;\r\n}\r\n\r\n.advanced-toolbar {\r\n  position: relative;\r\n  z-index: 2;\r\n  display: grid;\r\n  grid-template-columns: minmax(11rem, 1.5fr) auto minmax(8rem, 1fr) minmax(6rem, .7fr) auto;\r\n  align-items: center;\r\n  gap: .65rem;\r\n  max-width: 1168px;\r\n  margin: 0 auto;\r\n  padding: .75rem 0;\r\n  color: var(--color-text);\r\n}\r\n.advanced-toolbar__modes {\r\n  padding-left: .65rem;\r\n  border-left: 1px solid #dbe2ec;\r\n}\r\n.advanced-toolbar__type .advanced__label {\r\n  position: absolute;\r\n  width: 1px;\r\n  height: 1px;\r\n  overflow: hidden;\r\n  clip-path: inset(50%);\r\n}\r\n.advanced-toolbar__type .advanced__select { height: 44px; }\r\n.advanced__menu { min-width: 0; }\r\n.advanced__trigger {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: .42rem;\r\n  height: 44px;\r\n  padding: 0 .72rem;\r\n  border: 1px solid #d0d5dd;\r\n  border-radius: 8px;\r\n  background: white;\r\n  font-size: .86rem;\r\n  font-weight: 650;\r\n  cursor: pointer;\r\n  list-style: none;\r\n}\r\n.advanced__trigger::-webkit-details-marker { display: none; }\r\n.advanced__trigger > span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\r\n.advanced__trigger > svg { flex: none; }\r\n.advanced__pin { color: var(--color-primary); }\r\n.advanced__trigger:hover, .advanced__menu[open] > .advanced__trigger { background: #f3f7fc; border-color: #a8bad6; }\r\n.advanced__trigger:focus-visible { outline: 2px solid var(--color-secondary); outline-offset: 2px; }\r\n.advanced__panel {\r\n  position: absolute;\r\n  top: calc(100% - .45rem);\r\n  right: 0;\r\n  z-index: 3;\r\n  display: grid;\r\n  gap: .8rem;\r\n  width: min(20rem, 100%);\r\n  padding: 1rem;\r\n  border: 1px solid var(--color-border);\r\n  border-radius: var(--radius-md);\r\n  background: white;\r\n  box-shadow: 0 10px 25px rgb(16 24 40 / 16%);\r\n}\r\n.advanced__panel--location { left: 0; right: auto; width: min(25rem, 100%); }\r\n.advanced__menu:not([open]) > .advanced__panel { display: none; }\r\n.advanced__panel .advanced__label { color: var(--color-text); }\r\n.advanced__menu--price { position: relative; }\r\n.advanced__menu--price .advanced__panel { top: calc(100% + .35rem); width: 16rem; }\r\n@media (max-width: 930px) {\r\n  .advanced-toolbar { grid-template-columns: minmax(0, 1fr) auto auto; gap: .5rem; }\r\n  .advanced-toolbar__modes { grid-column: 2 / -1; grid-row: 1; padding-left: 0; border: 0; }\r\n}\r\n@media (max-width: 640px) {\r\n  .advanced-toolbar__modes { grid-column: 1 / -1; grid-row: 1; }\r\n  .advanced__menu--location { grid-column: 1 / -1; }\r\n  .advanced-toolbar { padding: .45rem 0; }\r\n  .advanced__trigger, .advanced-toolbar__type .advanced__select { height: 36px; }\r\n  .advanced__trigger, .advanced-toolbar__type select { font-size: .77rem; }\r\n  .advanced__menu:not(.advanced__menu--location) .advanced__trigger { padding-inline: .45rem; }\r\n  .advanced__menu--more svg { width: 15px; }\r\n  .advanced__menu--price { position: static; }\r\n  .advanced__menu--price .advanced__panel { top: calc(100% - .25rem); width: min(16rem, 100%); }\r\n}\r\n@media (max-width: 900px) {\r\n  .advanced__controls {\r\n    grid-template-columns: repeat(2, minmax(0, 1fr));\r\n  }\r\n\r\n  .advanced__price {\r\n    grid-column: span 2;\r\n  }\r\n}\r\n\r\n@media (max-width: 600px) {\r\n  .advanced {\r\n    padding: 1rem;\r\n  }\r\n\r\n  .advanced__intro {\r\n    align-items: flex-start;\r\n    gap: 0.85rem;\r\n    margin-bottom: 1rem;\r\n  }\r\n\r\n  .advanced__controls {\r\n    grid-template-columns: minmax(0, 1fr);\r\n    gap: 0.85rem;\r\n  }\r\n\r\n  .advanced__location,\r\n  .advanced__price {\r\n    grid-column: auto;\r\n  }\r\n}\r\n"] }]
    }], null, { form: [{ type: i0.Input, args: [{ isSignal: true, alias: "form", required: true }] }], tiposPropiedad: [{ type: i0.Input, args: [{ isSignal: true, alias: "tiposPropiedad", required: false }] }], monedas: [{ type: i0.Input, args: [{ isSignal: true, alias: "monedas", required: false }] }], categoria: [{ type: i0.Input, args: [{ isSignal: true, alias: "categoria", required: false }] }], compacto: [{ type: i0.Input, args: [{ isSignal: true, alias: "compacto", required: false }] }], busquedaActiva: [{ type: i0.Input, args: [{ isSignal: true, alias: "busquedaActiva", required: false }] }], cerrarFuera: [{
            type: HostListener,
            args: ['document:pointerdown', ['$event']]
        }], cerrarConEscape: [{
            type: HostListener,
            args: ['keydown.escape', ['$event']]
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AdvancedFiltersComponent, { className: "AdvancedFiltersComponent", filePath: "src/app/features/home/components/advanced-filters/advanced-filters.component.ts", lineNumber: 34 }); })();
