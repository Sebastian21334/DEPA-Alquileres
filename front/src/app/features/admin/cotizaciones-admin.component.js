import { isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CotizacionesService } from '../../shared/services/cotizaciones.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
const _forTrack0 = ($index, $item) => $item.id;
function CotizacionesAdminComponent_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 3);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.error());
} }
function CotizacionesAdminComponent_Conditional_10_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p")(1, "strong");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const cotizacion_r3 = ctx;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("Venta: ", ctx_r0.importe(cotizacion_r3.venta));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" \u00B7 Compra: ", ctx_r0.importe(cotizacion_r3.compra), " por USD");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("Fuente: ", cotizacion_r3.proveedor, " \u00B7 Publicada: ", ctx_r0.fecha(cotizacion_r3.actualizada_fuente_en));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("Consultada por DEPA: ", ctx_r0.fecha(cotizacion_r3.consultada_en));
} }
function CotizacionesAdminComponent_Conditional_10_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "Todav\u00EDa no se obtuvo una cotizaci\u00F3n v\u00E1lida.");
    i0.ɵɵelementEnd();
} }
function CotizacionesAdminComponent_Conditional_10_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 4);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const estado_r4 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("\u00DAltima consulta fallida: ", estado_r4.consulta.error, " \u00B7 ", ctx_r0.fecha(estado_r4.consulta.realizada_en));
} }
function CotizacionesAdminComponent_Conditional_10_For_39_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "td");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "td");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "td");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "td");
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "td");
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const cotizacion_r5 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("#", cotizacion_r5.id);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.importe(cotizacion_r5.compra));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.importe(cotizacion_r5.venta));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.fecha(cotizacion_r5.actualizada_fuente_en));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.fecha(cotizacion_r5.consultada_en));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(cotizacion_r5.proveedor);
} }
function CotizacionesAdminComponent_Conditional_10_ForEmpty_40_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td", 13);
    i0.ɵɵtext(2, "No hay cotizaciones para estas fechas.");
    i0.ɵɵelementEnd()();
} }
function CotizacionesAdminComponent_Conditional_10_For_52_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const consulta_r6 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", ctx_r0.fecha(consulta_r6.realizada_en), " \u00B7 ", consulta_r6.exitosa ? "Correcta" : consulta_r6.error);
} }
function CotizacionesAdminComponent_Conditional_10_ForEmpty_53_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "No hay consultas registradas.");
    i0.ɵɵelementEnd();
} }
function CotizacionesAdminComponent_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 6)(1, "strong");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, CotizacionesAdminComponent_Conditional_10_Conditional_3_Template, 8, 5)(4, CotizacionesAdminComponent_Conditional_10_Conditional_4_Template, 2, 0, "p");
    i0.ɵɵelementStart(5, "p");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "small");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(9, CotizacionesAdminComponent_Conditional_10_Conditional_9_Template, 2, 2, "p", 4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "form", 7);
    i0.ɵɵlistener("ngSubmit", function CotizacionesAdminComponent_Conditional_10_Template_form_ngSubmit_10_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.cargar()); });
    i0.ɵɵelementStart(11, "label");
    i0.ɵɵtext(12, "Consultado desde ");
    i0.ɵɵelementStart(13, "input", 8);
    i0.ɵɵtwoWayListener("ngModelChange", function CotizacionesAdminComponent_Conditional_10_Template_input_ngModelChange_13_listener($event) { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r0.desde, $event) || (ctx_r0.desde = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "label");
    i0.ɵɵtext(15, "Hasta ");
    i0.ɵɵelementStart(16, "input", 9);
    i0.ɵɵtwoWayListener("ngModelChange", function CotizacionesAdminComponent_Conditional_10_Template_input_ngModelChange_16_listener($event) { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r0.hasta, $event) || (ctx_r0.hasta = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "button", 10);
    i0.ɵɵtext(18, "Filtrar historial");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(19, "div", 11)(20, "table")(21, "caption");
    i0.ɵɵtext(22);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "thead")(24, "tr")(25, "th");
    i0.ɵɵtext(26, "ID");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "th");
    i0.ɵɵtext(28, "Compra");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "th");
    i0.ɵɵtext(30, "Venta utilizada");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(31, "th");
    i0.ɵɵtext(32, "Publicada por la fuente");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "th");
    i0.ɵɵtext(34, "Consultada por DEPA");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "th");
    i0.ɵɵtext(36, "Proveedor");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(37, "tbody");
    i0.ɵɵrepeaterCreate(38, CotizacionesAdminComponent_Conditional_10_For_39_Template, 13, 6, "tr", null, _forTrack0, false, CotizacionesAdminComponent_Conditional_10_ForEmpty_40_Template, 3, 0, "tr");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(41, "nav", 12)(42, "button", 2);
    i0.ɵɵlistener("click", function CotizacionesAdminComponent_Conditional_10_Template_button_click_42_listener() { const estado_r4 = i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.cargar(estado_r4.pagina - 1)); });
    i0.ɵɵtext(43, "Anterior");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(44, "span");
    i0.ɵɵtext(45);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(46, "button", 2);
    i0.ɵɵlistener("click", function CotizacionesAdminComponent_Conditional_10_Template_button_click_46_listener() { const estado_r4 = i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.cargar(estado_r4.pagina + 1)); });
    i0.ɵɵtext(47, "Siguiente");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(48, "details")(49, "summary");
    i0.ɵɵtext(50, "\u00DAltimos intentos de actualizaci\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(51, CotizacionesAdminComponent_Conditional_10_For_52_Template, 2, 2, "p", null, _forTrack0, false, CotizacionesAdminComponent_Conditional_10_ForEmpty_53_Template, 2, 0, "p");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_4_0;
    const estado_r4 = ctx;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("dolar-current--pending", !estado_r4.vigente);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(estado_r4.vigente ? "Disponible para nuevas conversiones" : "Conversi\u00F3n USD \u2192 ARS pendiente de verificaci\u00F3n");
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_4_0 = estado_r4.cotizacion) ? 3 : 4, tmp_4_0);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("Pr\u00F3xima revisi\u00F3n a partir de: ", ctx_r0.fecha(estado_r4.proxima_revision_en), ", cuando el backend est\u00E9 activo.");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("Se verifica al despertar y antes de emitir presupuestos. No se reconstruyen consultas del tiempo en que estuvo dormido. Antig\u00FCedad m\u00E1xima permitida del dato de la fuente: ", estado_r4.max_antiguedad_fuente_horas, " horas.");
    i0.ɵɵadvance();
    i0.ɵɵconditional(estado_r4.consulta && !estado_r4.consulta.exitosa ? 9 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r0.desde);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r0.hasta);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r0.cargando());
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1("Historial de cotizaciones guardadas \u00B7 ", estado_r4.total, " registros");
    i0.ɵɵadvance(16);
    i0.ɵɵrepeater(estado_r4.items);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", ctx_r0.cargando() || estado_r4.pagina <= 1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("P\u00E1gina ", estado_r4.pagina);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r0.cargando() || estado_r4.pagina * estado_r4.por_pagina >= estado_r4.total);
    i0.ɵɵadvance(5);
    i0.ɵɵrepeater(estado_r4.consultas);
} }
function CotizacionesAdminComponent_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 4);
    i0.ɵɵtext(1, "Consultando cotizaciones\u2026");
    i0.ɵɵelementEnd();
} }
export class CotizacionesAdminComponent {
    api = inject(CotizacionesService);
    destroyRef = inject(DestroyRef);
    datos = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "datos" }] : /* istanbul ignore next */ []));
    cargando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cargando" }] : /* istanbul ignore next */ []));
    error = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    desde = '';
    hasta = '';
    constructor() {
        if (isPlatformBrowser(inject(PLATFORM_ID)))
            this.cargar();
    }
    cargar(pagina = 1, verificar = false) {
        if (this.cargando())
            return;
        if (this.desde && this.hasta && this.desde > this.hasta) {
            this.error.set('La fecha desde no puede ser posterior a hasta.');
            return;
        }
        this.cargando.set(true);
        this.error.set('');
        const consulta = verificar
            ? this.api.verificar()
            : this.api.listar(this.desde, this.hasta, pagina);
        consulta.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (datos) => {
                this.datos.set(datos);
                this.cargando.set(false);
                if (verificar) {
                    this.desde = '';
                    this.hasta = '';
                }
            },
            error: (err) => {
                this.error.set(err.message);
                this.cargando.set(false);
            },
        });
    }
    fecha(valor) {
        return valor
            ? new Date(valor).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })
            : 'Sin datos';
    }
    importe(valor) {
        return Number(valor).toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 6,
        });
    }
    static ɵfac = function CotizacionesAdminComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CotizacionesAdminComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CotizacionesAdminComponent, selectors: [["app-cotizaciones-admin"]], decls: 17, vars: 4, consts: [["aria-labelledby", "dolar-title", 1, "dolar-panel"], ["id", "dolar-title"], ["type", "button", 1, "button", "button--light", 3, "click", "disabled"], ["role", "alert", 1, "dolar-error"], ["role", "status"], ["href", "https://dolarapi.com", "target", "_blank", "rel", "noopener noreferrer"], [1, "dolar-current"], [1, "dolar-filters", 3, "ngSubmit"], ["type", "date", "name", "dolarDesde", 3, "ngModelChange", "ngModel"], ["type", "date", "name", "dolarHasta", 3, "ngModelChange", "ngModel"], ["type", "submit", 1, "button", "button--light", 3, "disabled"], [1, "dolar-table"], ["aria-label", "P\u00E1ginas de cotizaciones", 1, "dolar-pagination"], ["colspan", "6"]], template: function CotizacionesAdminComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "header")(2, "div")(3, "h2", 1);
            i0.ɵɵtext(4, "Cotizaci\u00F3n del d\u00F3lar");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "p");
            i0.ɵɵtext(6, "D\u00F3lar blue venta utilizado para convertir reservas de USD a pesos.");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(7, "button", 2);
            i0.ɵɵlistener("click", function CotizacionesAdminComponent_Template_button_click_7_listener() { return ctx.cargar(1, true); });
            i0.ɵɵtext(8, "Verificar cotizaci\u00F3n");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(9, CotizacionesAdminComponent_Conditional_9_Template, 2, 1, "p", 3);
            i0.ɵɵconditionalCreate(10, CotizacionesAdminComponent_Conditional_10_Template, 54, 16);
            i0.ɵɵconditionalCreate(11, CotizacionesAdminComponent_Conditional_11_Template, 2, 0, "p", 4);
            i0.ɵɵelementStart(12, "small");
            i0.ɵɵtext(13, "Datos de ");
            i0.ɵɵelementStart(14, "a", 5);
            i0.ɵɵtext(15, "DolarApi");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(16, ", fuente DolarHoy. Cotizaciones informativas; no garantizan la compra o venta de divisas.");
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            let tmp_2_0;
            i0.ɵɵadvance(7);
            i0.ɵɵproperty("disabled", ctx.cargando());
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.error() ? 9 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_2_0 = ctx.datos()) ? 10 : -1, tmp_2_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.cargando() ? 11 : -1);
        } }, dependencies: [FormsModule, i1.ɵNgNoValidate, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.NgModel, i1.NgForm], styles: [".dolar-panel[_ngcontent-%COMP%] { padding: 1.25rem; margin: 1.5rem 0; border: 1px solid var(--%NS%color-border, #e5e7eb); border-radius: 12px; background: #fff; }\nheader[_ngcontent-%COMP%] { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }\nh2[_ngcontent-%COMP%] { margin: 0; } p[_ngcontent-%COMP%] { margin: .45rem 0; } small[_ngcontent-%COMP%] { color: #667085; line-height: 1.6; }\n.dolar-current[_ngcontent-%COMP%] { padding: 1rem; margin: 1rem 0; border: 1px solid #bbf7d0; background: #f0fdf4; border-radius: 8px; }\n.dolar-current--pending[_ngcontent-%COMP%] { border-color: #fed7aa; background: #fff7ed; }\n.dolar-filters[_ngcontent-%COMP%], .dolar-pagination[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; align-items: end; gap: .75rem; margin: 1rem 0; }\nlabel[_ngcontent-%COMP%] { display: grid; gap: .3rem; font-size: .9rem; } input[_ngcontent-%COMP%] { padding: .5rem; border: 1px solid #d1d5db; border-radius: 6px; }\n.dolar-table[_ngcontent-%COMP%] { overflow-x: auto; } table[_ngcontent-%COMP%] { width: 100%; border-collapse: collapse; font-size: .88rem; }\ncaption[_ngcontent-%COMP%] { text-align: left; padding: .5rem 0; font-weight: 700; } th[_ngcontent-%COMP%], td[_ngcontent-%COMP%] { padding: .75rem; border-bottom: 1px solid #e5e7eb; text-align: left; }\n.dolar-error[_ngcontent-%COMP%] { color: #b91c1c; } details[_ngcontent-%COMP%] { margin: 1rem 0; } summary[_ngcontent-%COMP%] { cursor: pointer; font-weight: 700; }\n.dolar-pagination[_ngcontent-%COMP%] { align-items: center; }\n.button[_ngcontent-%COMP%] { min-height: 40px; padding: .5rem .85rem; border: 1px solid #d1d5db; border-radius: 7px; background: #fff; color: #1f2937; font: inherit; cursor: pointer; }\n.button[_ngcontent-%COMP%]:disabled { opacity: .5; cursor: default; }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CotizacionesAdminComponent, [{
        type: Component,
        args: [{ selector: 'app-cotizaciones-admin', standalone: true, imports: [FormsModule], template: "<section class=\"dolar-panel\" aria-labelledby=\"dolar-title\">\n  <header><div><h2 id=\"dolar-title\">Cotizaci\u00F3n del d\u00F3lar</h2><p>D\u00F3lar blue venta utilizado para convertir reservas de USD a pesos.</p></div>\n    <button type=\"button\" class=\"button button--light\" [disabled]=\"cargando()\" (click)=\"cargar(1, true)\">Verificar cotizaci\u00F3n</button>\n  </header>\n  @if (error()) { <p role=\"alert\" class=\"dolar-error\">{{ error() }}</p> }\n  @if (datos(); as estado) {\n    <div class=\"dolar-current\" [class.dolar-current--pending]=\"!estado.vigente\">\n      <strong>{{ estado.vigente ? 'Disponible para nuevas conversiones' : 'Conversi\u00F3n USD \u2192 ARS pendiente de verificaci\u00F3n' }}</strong>\n      @if (estado.cotizacion; as cotizacion) {\n        <p><strong>Venta: {{ importe(cotizacion.venta) }}</strong> \u00B7 Compra: {{ importe(cotizacion.compra) }} por USD</p>\n        <p>Fuente: {{ cotizacion.proveedor }} \u00B7 Publicada: {{ fecha(cotizacion.actualizada_fuente_en) }}</p>\n        <p>Consultada por DEPA: {{ fecha(cotizacion.consultada_en) }}</p>\n      } @else { <p>Todav\u00EDa no se obtuvo una cotizaci\u00F3n v\u00E1lida.</p> }\n      <p>Pr\u00F3xima revisi\u00F3n a partir de: {{ fecha(estado.proxima_revision_en) }}, cuando el backend est\u00E9 activo.</p>\n      <small>Se verifica al despertar y antes de emitir presupuestos. No se reconstruyen consultas del tiempo en que estuvo dormido.\n        Antig\u00FCedad m\u00E1xima permitida del dato de la fuente: {{ estado.max_antiguedad_fuente_horas }} horas.</small>\n      @if (estado.consulta && !estado.consulta.exitosa) { <p role=\"status\">\u00DAltima consulta fallida: {{ estado.consulta.error }} \u00B7 {{ fecha(estado.consulta.realizada_en) }}</p> }\n    </div>\n    <form class=\"dolar-filters\" (ngSubmit)=\"cargar()\">\n      <label>Consultado desde <input type=\"date\" name=\"dolarDesde\" [(ngModel)]=\"desde\" /></label>\n      <label>Hasta <input type=\"date\" name=\"dolarHasta\" [(ngModel)]=\"hasta\" /></label>\n      <button type=\"submit\" class=\"button button--light\" [disabled]=\"cargando()\">Filtrar historial</button>\n    </form>\n    <div class=\"dolar-table\"><table>\n      <caption>Historial de cotizaciones guardadas \u00B7 {{ estado.total }} registros</caption>\n      <thead><tr><th>ID</th><th>Compra</th><th>Venta utilizada</th><th>Publicada por la fuente</th><th>Consultada por DEPA</th><th>Proveedor</th></tr></thead>\n      <tbody>@for (cotizacion of estado.items; track cotizacion.id) {\n        <tr><td>#{{ cotizacion.id }}</td><td>{{ importe(cotizacion.compra) }}</td><td>{{ importe(cotizacion.venta) }}</td>\n          <td>{{ fecha(cotizacion.actualizada_fuente_en) }}</td><td>{{ fecha(cotizacion.consultada_en) }}</td><td>{{ cotizacion.proveedor }}</td></tr>\n      } @empty { <tr><td colspan=\"6\">No hay cotizaciones para estas fechas.</td></tr> }</tbody>\n    </table></div>\n    <nav aria-label=\"P\u00E1ginas de cotizaciones\" class=\"dolar-pagination\">\n      <button type=\"button\" class=\"button button--light\" [disabled]=\"cargando() || estado.pagina <= 1\" (click)=\"cargar(estado.pagina - 1)\">Anterior</button>\n      <span>P\u00E1gina {{ estado.pagina }}</span>\n      <button type=\"button\" class=\"button button--light\" [disabled]=\"cargando() || estado.pagina * estado.por_pagina >= estado.total\" (click)=\"cargar(estado.pagina + 1)\">Siguiente</button>\n    </nav>\n    <details><summary>\u00DAltimos intentos de actualizaci\u00F3n</summary>\n      @for (consulta of estado.consultas; track consulta.id) {\n        <p>{{ fecha(consulta.realizada_en) }} \u00B7 {{ consulta.exitosa ? 'Correcta' : consulta.error }}</p>\n      } @empty { <p>No hay consultas registradas.</p> }\n    </details>\n  }\n  @if (cargando()) { <p role=\"status\">Consultando cotizaciones\u2026</p> }\n  <small>Datos de <a href=\"https://dolarapi.com\" target=\"_blank\" rel=\"noopener noreferrer\">DolarApi</a>, fuente DolarHoy. Cotizaciones informativas; no garantizan la compra o venta de divisas.</small>\n</section>\n", styles: [".dolar-panel { padding: 1.25rem; margin: 1.5rem 0; border: 1px solid var(--color-border, #e5e7eb); border-radius: 12px; background: #fff; }\nheader { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }\nh2 { margin: 0; } p { margin: .45rem 0; } small { color: #667085; line-height: 1.6; }\n.dolar-current { padding: 1rem; margin: 1rem 0; border: 1px solid #bbf7d0; background: #f0fdf4; border-radius: 8px; }\n.dolar-current--pending { border-color: #fed7aa; background: #fff7ed; }\n.dolar-filters, .dolar-pagination { display: flex; flex-wrap: wrap; align-items: end; gap: .75rem; margin: 1rem 0; }\nlabel { display: grid; gap: .3rem; font-size: .9rem; } input { padding: .5rem; border: 1px solid #d1d5db; border-radius: 6px; }\n.dolar-table { overflow-x: auto; } table { width: 100%; border-collapse: collapse; font-size: .88rem; }\ncaption { text-align: left; padding: .5rem 0; font-weight: 700; } th, td { padding: .75rem; border-bottom: 1px solid #e5e7eb; text-align: left; }\n.dolar-error { color: #b91c1c; } details { margin: 1rem 0; } summary { cursor: pointer; font-weight: 700; }\n.dolar-pagination { align-items: center; }\n.button { min-height: 40px; padding: .5rem .85rem; border: 1px solid #d1d5db; border-radius: 7px; background: #fff; color: #1f2937; font: inherit; cursor: pointer; }\n.button:disabled { opacity: .5; cursor: default; }\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CotizacionesAdminComponent, { className: "CotizacionesAdminComponent", filePath: "src/app/features/admin/cotizaciones-admin.component.ts", lineNumber: 15 }); })();
