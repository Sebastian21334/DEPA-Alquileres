import { Component, DestroyRef, ElementRef, HostListener, afterNextRender, inject, input, output } from '@angular/core';
import { LucideHandshake, LucideLockKeyhole, LucideX } from '@lucide/angular';
import * as i0 from "@angular/core";
function PaymentSummaryComponent_Conditional_35_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 15);
    i0.ɵɵtext(1, "Verificando precio y cotizaci\u00F3n\u2026");
    i0.ɵɵelementEnd();
} }
function PaymentSummaryComponent_Conditional_36_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 21)(1, "h3", 24);
    i0.ɵɵtext(2, "Conversi\u00F3n de d\u00F3lares a pesos");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4, " D\u00F3lar blue venta: ");
    i0.ɵɵelementStart(5, "strong");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "details")(8, "summary");
    i0.ɵɵtext(9, "Ver fuente y fechas de la cotizaci\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "p");
    i0.ɵɵtext(11);
    i0.ɵɵelementStart(12, "a", 25);
    i0.ɵɵtext(13, "DolarApi / DolarHoy");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(14, ". ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "p");
    i0.ɵɵtext(16);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "p");
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(19, "label", 26)(20, "input", 27);
    i0.ɵɵlistener("change", function PaymentSummaryComponent_Conditional_36_Conditional_21_Template_input_change_20_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.cambiarConversion($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "span");
    i0.ɵɵtext(22);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const dolar_r3 = ctx;
    const precio_r4 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate1("", ctx_r1.importe(dolar_r3.venta, "ARS", 6), " por USD");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" Fuente: ", dolar_r3.proveedor, " \u00B7 ");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1("Publicada: ", ctx_r1.fechaHora(dolar_r3.actualizada_fuente_en), ".");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("Consultada: ", ctx_r1.fechaHora(dolar_r3.consultada_en), ".");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r1.conversionAceptada())("disabled", ctx_r1.procesando());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("Acepto esta cotizaci\u00F3n y pagar ", ctx_r1.importe(precio_r4.total_cobro, precio_r4.moneda_cobro), " en pesos.");
} }
function PaymentSummaryComponent_Conditional_36_Conditional_36_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 16);
    i0.ɵɵtext(1, " El presupuesto venci\u00F3. Volv\u00E9 a cotizar para continuar. ");
    i0.ɵɵelementEnd();
} }
function PaymentSummaryComponent_Conditional_36_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "dl", 20)(1, "div")(2, "dt");
    i0.ɵɵtext(3, "Duraci\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "div")(7, "dt");
    i0.ɵɵtext(8, "Moneda de publicaci\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "dd");
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "div")(12, "dt");
    i0.ɵɵtext(13, "Precio por d\u00EDa");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "dd");
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(16, "div")(17, "dt");
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "dd");
    i0.ɵɵtext(20);
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(21, PaymentSummaryComponent_Conditional_36_Conditional_21_Template, 23, 7, "section", 21);
    i0.ɵɵelementStart(22, "div", 22)(23, "span");
    i0.ɵɵtext(24, "Total a pagar ");
    i0.ɵɵelementStart(25, "small");
    i0.ɵɵtext(26, "Pesos argentinos (ARS)");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(27, "strong");
    i0.ɵɵtext(28);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(29, "details", 23)(30, "summary");
    i0.ɵɵtext(31);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(32, "p");
    i0.ɵɵtext(33);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(34, "p");
    i0.ɵɵtext(35, "Al continuar, las fechas quedar\u00E1n reservadas hasta ese vencimiento.");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(36, PaymentSummaryComponent_Conditional_36_Conditional_36_Template, 2, 0, "p", 16);
} if (rf & 2) {
    let tmp_7_0;
    const precio_r4 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate2(" ", precio_r4.cantidad_dias, " ", precio_r4.cantidad_dias === 1 ? "d\u00EDa" : "d\u00EDas", " ");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(precio_r4.moneda_origen);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r1.importe(precio_r4.precio_unitario_origen, precio_r4.moneda_origen));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2(" Subtotal \u00B7 ", precio_r4.cantidad_dias, " ", precio_r4.cantidad_dias === 1 ? "d\u00EDa" : "d\u00EDas", " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.importe(precio_r4.total_origen, precio_r4.moneda_origen));
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_7_0 = precio_r4.cotizacion) ? 21 : -1, tmp_7_0);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate(ctx_r1.importe(precio_r4.total_cobro, precio_r4.moneda_cobro));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("V\u00E1lido hasta ", ctx_r1.fechaHora(precio_r4.vence_en));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("Presupuesto emitido: ", ctx_r1.fechaHora(precio_r4.emitida_en), ".");
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.vencido() ? 36 : -1);
} }
function PaymentSummaryComponent_Conditional_37_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 16);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.error());
} }
function PaymentSummaryComponent_Conditional_39_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 28);
    i0.ɵɵelement(1, "img", 29);
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(4, "p", 30);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(5, "svg", 31);
    i0.ɵɵtext(6, " Pag\u00E1 de forma segura ");
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(7, "p", 32);
    i0.ɵɵtext(8, " Eleg\u00EDs el medio de pago e ingres\u00E1s los datos en Mercado Pago. DEPA no almacena los datos de tu tarjeta. ");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r1.procesando() || ctx_r1.cotizando() || ctx_r1.vencido() || ctx.moneda_origen === "USD" && !ctx_r1.conversionAceptada());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.procesando() ? "Conectando\u2026" : "Pagar con Mercado Pago");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 14);
} }
export class PaymentSummaryComponent {
    publicacion = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "publicacion" }] : /* istanbul ignore next */ []));
    anunciante = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "anunciante" }] : /* istanbul ignore next */ []));
    ubicacion = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ubicacion" }] : /* istanbul ignore next */ []));
    inicio = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "inicio" }] : /* istanbul ignore next */ []));
    fin = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "fin" }] : /* istanbul ignore next */ []));
    presupuesto = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "presupuesto" }] : /* istanbul ignore next */ []));
    cotizando = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cotizando" }] : /* istanbul ignore next */ []));
    procesando = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "procesando" }] : /* istanbul ignore next */ []));
    vencido = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "vencido" }] : /* istanbul ignore next */ []));
    conversionAceptada = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "conversionAceptada" }] : /* istanbul ignore next */ []));
    error = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    cerrar = output();
    recotizar = output();
    continuar = output();
    aceptarConversion = output();
    elemento = inject(ElementRef);
    constructor() {
        let focoAnterior = null;
        afterNextRender(() => {
            focoAnterior = this.elemento.nativeElement.ownerDocument.activeElement;
            this.elemento.nativeElement.querySelector('.close')?.focus();
        });
        inject(DestroyRef).onDestroy(() => {
            if (focoAnterior?.isConnected)
                focoAnterior.focus();
        });
    }
    mantenerFoco(evento) {
        if (evento.key !== 'Tab')
            return;
        const controles = Array.from(this.elemento.nativeElement.querySelectorAll('button:not(:disabled), input:not(:disabled), a[href], summary')).filter(control => control.getClientRects().length > 0);
        const primero = controles[0], ultimo = controles[controles.length - 1];
        const activo = this.elemento.nativeElement.ownerDocument.activeElement;
        if (evento.shiftKey && activo === primero) {
            evento.preventDefault();
            ultimo?.focus();
        }
        else if (!evento.shiftKey && activo === ultimo) {
            evento.preventDefault();
            primero?.focus();
        }
    }
    cerrarModal() {
        if (!this.procesando())
            this.cerrar.emit();
    }
    cambiarConversion(evento) {
        this.aceptarConversion.emit(evento.target instanceof HTMLInputElement && evento.target.checked);
    }
    importe(valor, moneda, decimales = 2) {
        return Number(valor).toLocaleString('es-AR', { style: 'currency', currency: moneda, maximumFractionDigits: decimales });
    }
    fecha(valor) {
        return valor ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(new Date(`${valor.slice(0, 10)}T12:00:00`)) : 'Sin seleccionar';
    }
    fechaHora(valor) {
        return new Date(valor).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
    }
    static ɵfac = function PaymentSummaryComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || PaymentSummaryComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: PaymentSummaryComponent, selectors: [["app-payment-summary"]], hostBindings: function PaymentSummaryComponent_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("keydown", function PaymentSummaryComponent_keydown_HostBindingHandler($event) { return ctx.mantenerFoco($event); })("keydown.escape", function PaymentSummaryComponent_keydown_escape_HostBindingHandler() { return ctx.cerrarModal(); }, i0.ɵɵresolveDocument);
        } }, inputs: { publicacion: [1, "publicacion"], anunciante: [1, "anunciante"], ubicacion: [1, "ubicacion"], inicio: [1, "inicio"], fin: [1, "fin"], presupuesto: [1, "presupuesto"], cotizando: [1, "cotizando"], procesando: [1, "procesando"], vencido: [1, "vencido"], conversionAceptada: [1, "conversionAceptada"], error: [1, "error"] }, outputs: { cerrar: "cerrar", recotizar: "recotizar", continuar: "continuar", aceptarConversion: "aceptarConversion" }, decls: 43, vars: 14, consts: [[1, "backdrop", 3, "click"], ["role", "dialog", "aria-modal", "true", "aria-labelledby", "payment-title", "aria-describedby", "payment-intro", 1, "summary", 3, "click"], [1, "summary__head"], [1, "eyebrow"], ["id", "payment-title"], ["id", "payment-intro"], ["type", "button", "aria-label", "Cerrar resumen", 1, "close", 3, "click", "disabled"], ["lucideX", "", "aria-hidden", "true", 3, "size"], [3, "submit"], [1, "transaction"], [1, "stay"], ["aria-labelledby", "payment-property", 1, "property"], ["id", "payment-property"], [1, "dates"], [1, "breakdown"], ["role", "status", 1, "notice"], ["role", "alert", 1, "notice", "notice--error"], [1, "actions"], [1, "secondary"], ["type", "button", 3, "click", "disabled"], [1, "amounts"], ["aria-labelledby", "payment-conversion", 1, "conversion"], [1, "total"], [1, "validity"], ["id", "payment-conversion"], ["href", "https://dolarapi.com", "target", "_blank", "rel", "noopener noreferrer"], [1, "accept"], ["type", "checkbox", 3, "change", "checked", "disabled"], ["type", "submit", 1, "mercado-pago", 3, "disabled"], ["src", "/images/mercado-pago.png", "alt", "", "aria-hidden", "true", 1, "mercado-pago__logo"], [1, "secure"], ["lucideLockKeyhole", "", "aria-hidden", "true", 3, "size"], [1, "redirect"]], template: function PaymentSummaryComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵlistener("click", function PaymentSummaryComponent_Template_div_click_0_listener() { return ctx.cerrarModal(); });
            i0.ɵɵelementStart(1, "section", 1);
            i0.ɵɵlistener("click", function PaymentSummaryComponent_Template_section_click_1_listener($event) { return $event.stopPropagation(); });
            i0.ɵɵelementStart(2, "header", 2)(3, "span", 3);
            i0.ɵɵtext(4, "Resumen de la transacci\u00F3n");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "h2", 4);
            i0.ɵɵtext(6, "Revis\u00E1 tu reserva");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "p", 5);
            i0.ɵɵtext(8, "Comprob\u00E1 los datos antes de continuar a Mercado Pago.");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "button", 6);
            i0.ɵɵlistener("click", function PaymentSummaryComponent_Template_button_click_9_listener() { return ctx.cerrarModal(); });
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(10, "svg", 7);
            i0.ɵɵelementEnd()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(11, "form", 8);
            i0.ɵɵlistener("submit", function PaymentSummaryComponent_Template_form_submit_11_listener($event) { return ctx.continuar.emit($event); });
            i0.ɵɵelementStart(12, "div", 9)(13, "div", 10)(14, "section", 11)(15, "h3", 12);
            i0.ɵɵtext(16);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(17, "p");
            i0.ɵɵtext(18);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(19, "p")(20, "span");
            i0.ɵɵtext(21, "Anunciante:");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(22);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(23, "dl", 13)(24, "div")(25, "dt");
            i0.ɵɵtext(26, "Primer d\u00EDa");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(27, "dd");
            i0.ɵɵtext(28);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(29, "div")(30, "dt");
            i0.ɵɵtext(31, "\u00DAltimo d\u00EDa incluido");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(32, "dd");
            i0.ɵɵtext(33);
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(34, "div", 14);
            i0.ɵɵconditionalCreate(35, PaymentSummaryComponent_Conditional_35_Template, 2, 0, "p", 15);
            i0.ɵɵconditionalCreate(36, PaymentSummaryComponent_Conditional_36_Template, 37, 12);
            i0.ɵɵconditionalCreate(37, PaymentSummaryComponent_Conditional_37_Template, 2, 1, "p", 16);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(38, "div", 17);
            i0.ɵɵconditionalCreate(39, PaymentSummaryComponent_Conditional_39_Template, 9, 3);
            i0.ɵɵelementStart(40, "div", 18)(41, "button", 19);
            i0.ɵɵlistener("click", function PaymentSummaryComponent_Template_button_click_41_listener() { return ctx.recotizar.emit(); });
            i0.ɵɵtext(42);
            i0.ɵɵelementEnd()()()()()();
        } if (rf & 2) {
            let tmp_9_0;
            let tmp_11_0;
            i0.ɵɵadvance(9);
            i0.ɵɵproperty("disabled", ctx.procesando());
            i0.ɵɵadvance();
            i0.ɵɵproperty("size", 21);
            i0.ɵɵadvance();
            i0.ɵɵattribute("aria-busy", ctx.cotizando() || ctx.procesando());
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(ctx.publicacion().titulo);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.ubicacion());
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", ctx.anunciante());
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(ctx.fecha(ctx.inicio()));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(ctx.fecha(ctx.fin()));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.cotizando() ? 35 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_9_0 = ctx.presupuesto()) ? 36 : -1, tmp_9_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.error() ? 37 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional((tmp_11_0 = ctx.presupuesto()) ? 39 : -1, tmp_11_0);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.procesando() || ctx.cotizando());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.cotizando() ? "Cotizando\u2026" : "Volver a cotizar", " ");
        } }, dependencies: [LucideLockKeyhole, LucideX], styles: [".backdrop[_ngcontent-%COMP%] { position: fixed; z-index: 1000; inset: 0; display: grid; place-items: center; padding: 20px; background: rgb(11 24 40 / 70%); }\r\n.summary[_ngcontent-%COMP%] { width: min(100%, 840px); max-height: calc(100dvh - 40px); overflow-y: auto; border-radius: 18px; background: #fff; color: var(--%NS%color-text); box-shadow: 0 24px 70px #0005; overflow-wrap: anywhere; }\r\n.summary__head[_ngcontent-%COMP%] { position: sticky; top: 0; z-index: 1; background: #fff; padding: 22px 60px 18px 24px; border-bottom: 1px solid var(--%NS%color-border); }\r\n.eyebrow[_ngcontent-%COMP%] { color: var(--%NS%color-secondary); font-size: .7rem; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }\r\nh2[_ngcontent-%COMP%] { margin: 5px 0; font-size: 1.5rem; font-weight: 800; }\r\nh3[_ngcontent-%COMP%], p[_ngcontent-%COMP%], dl[_ngcontent-%COMP%] { margin: 0; }\r\nh3[_ngcontent-%COMP%] { font-size: .95rem; font-weight: 750; }\r\n.summary__head[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], .property[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], dt[_ngcontent-%COMP%], .validity[_ngcontent-%COMP%], .redirect[_ngcontent-%COMP%], .secure[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); font-size: .82rem; line-height: 1.5; }\r\nbutton[_ngcontent-%COMP%] { font: inherit; cursor: pointer; }\r\nbutton[_ngcontent-%COMP%]:disabled { cursor: default; opacity: .6; }\r\nbutton[_ngcontent-%COMP%]:focus-visible, summary[_ngcontent-%COMP%]:focus-visible, input[_ngcontent-%COMP%]:focus-visible, a[_ngcontent-%COMP%]:focus-visible { outline: 3px solid var(--%NS%color-secondary); outline-offset: 3px; }\r\n.close[_ngcontent-%COMP%] { position: absolute; top: 18px; right: 18px; display: grid; place-items: center; width: 34px; height: 34px; padding: 0; border: 0; border-radius: 50%; background: #f1f3f6; color: var(--%NS%color-text-muted); }\r\nform[_ngcontent-%COMP%] { display: grid; gap: 16px; padding: 20px 24px 22px; }\r\n.transaction[_ngcontent-%COMP%] { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 20px; }\r\n.stay[_ngcontent-%COMP%], .breakdown[_ngcontent-%COMP%] { display: grid; align-content: start; gap: 14px; min-width: 0; }\r\n.property[_ngcontent-%COMP%] { padding: 14px; border: 1px solid var(--%NS%color-border); border-radius: 10px; background: #f8fafc; }\r\n.property[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin-top: 4px; }\r\n.dates[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }\r\n.dates[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] { padding: 10px 12px; border-radius: 9px; background: #f5f7fb; }\r\ndd[_ngcontent-%COMP%] { margin: 3px 0 0; font-size: .9rem; font-weight: 750; }\r\n.amounts[_ngcontent-%COMP%] { display: grid; gap: 9px; }\r\n.amounts[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; }\r\n.amounts[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%] { margin: 0; text-align: right; }\r\n.conversion[_ngcontent-%COMP%] { padding: 13px; border: 1px solid #fbd4a1; border-radius: 10px; background: #fff8ef; font-size: .8rem; line-height: 1.5; }\r\n.conversion[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], .validity[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin-top: 6px; }\r\n.conversion[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] { margin-bottom: 5px; }\r\nsummary[_ngcontent-%COMP%] { cursor: pointer; font-weight: 650; }\r\n.conversion[_ngcontent-%COMP%]   details[_ngcontent-%COMP%] { margin-top: 7px; }\r\n.conversion[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] { color: var(--%NS%color-secondary); text-decoration: underline; }\r\n.accept[_ngcontent-%COMP%] { display: flex; align-items: flex-start; gap: 9px; margin-top: 12px; font-weight: 650; }\r\n.accept[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] { flex: 0 0 auto; width: 18px; height: 18px; margin-top: 3px; accent-color: var(--%NS%color-secondary); }\r\n.total[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px 16px; padding: 15px; border: 1px solid #ccecf7; border-radius: 10px; background: #eef9fd; font-weight: 750; }\r\n.total[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { display: block; margin-top: 3px; color: #526273; font-size: .74rem; font-weight: 500; }\r\n.total[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { max-width: 100%; color: #007eb5; font-size: clamp(1.4rem, 4vw, 1.8rem); }\r\n.notice[_ngcontent-%COMP%] { padding: 12px; border-radius: 8px; background: #eff6ff; font-size: .85rem; }\r\n.notice--error[_ngcontent-%COMP%] { color: #991b1b; background: #fee2e2; }\r\n.actions[_ngcontent-%COMP%] { display: grid; gap: 8px; padding-top: 4px; }\r\n.mercado-pago[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; min-height: 56px; padding: 12px 16px; border: 0; border-radius: 9px; background: #009ee3; color: #fff; font-size: 1.05rem; font-weight: 750; line-height: 1.3; box-shadow: 0 4px 10px #009ee333; transition: background .15s, transform .15s; }\r\n.mercado-pago[_ngcontent-%COMP%]:hover:not(:disabled) { background: #008bc8; transform: translateY(-1px); }\r\n.mercado-pago[_ngcontent-%COMP%]:disabled { background: #e4e7ec; color: #526273; opacity: 1; box-shadow: none; }\r\n.mercado-pago__logo[_ngcontent-%COMP%] { width: 40px;height: 30px;object-fit: contain;flex-shrink: 0;}\r\n.secure[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: center; gap: 5px; font-weight: 700; }\r\n.redirect[_ngcontent-%COMP%] { text-align: center; font-size: .75rem; }\r\n.secondary[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; margin-top: 8px; padding-top: 12px; border-top: 1px solid var(--%NS%color-border); }\r\n.secondary[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { padding: 7px 0; border: 0; background: transparent; color: var(--%NS%color-secondary); font-size: .82rem; font-weight: 700; }\r\n@media (max-width: 480px) { .backdrop[_ngcontent-%COMP%] { padding: 12px; } .summary[_ngcontent-%COMP%] { max-height: calc(100dvh - 24px); } .summary__head[_ngcontent-%COMP%] { padding: 18px 52px 15px 18px; } form[_ngcontent-%COMP%] { padding: 16px 18px 18px; gap: 13px; } .close[_ngcontent-%COMP%] { right: 12px; top: 14px; } h2[_ngcontent-%COMP%] { font-size: 1.3rem; } .dates[_ngcontent-%COMP%] { gap: 8px; } .dates[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] { padding: 9px; } .mercado-pago[_ngcontent-%COMP%] { gap: 8px; padding-inline: 12px; font-size: .95rem; } }\r\n@media (max-width: 640px) { .transaction[_ngcontent-%COMP%] { grid-template-columns: minmax(0, 1fr); gap: 16px; } }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PaymentSummaryComponent, [{
        type: Component,
        args: [{ selector: 'app-payment-summary', standalone: true, imports: [LucideHandshake, LucideLockKeyhole, LucideX], template: "<div class=\"backdrop\" (click)=\"cerrarModal()\">\r\n  <section\r\n    class=\"summary\"\r\n    role=\"dialog\"\r\n    aria-modal=\"true\"\r\n    aria-labelledby=\"payment-title\"\r\n    aria-describedby=\"payment-intro\"\r\n    (click)=\"$event.stopPropagation()\"\r\n  >\r\n    <header class=\"summary__head\">\r\n      <span class=\"eyebrow\">Resumen de la transacci\u00F3n</span>\r\n      <h2 id=\"payment-title\">Revis\u00E1 tu reserva</h2>\r\n      <p id=\"payment-intro\">Comprob\u00E1 los datos antes de continuar a Mercado Pago.</p>\r\n      <button\r\n        class=\"close\"\r\n        type=\"button\"\r\n        aria-label=\"Cerrar resumen\"\r\n        [disabled]=\"procesando()\"\r\n        (click)=\"cerrarModal()\"\r\n      >\r\n        <svg lucideX [size]=\"21\" aria-hidden=\"true\"></svg>\r\n      </button>\r\n    </header>\r\n    <form (submit)=\"continuar.emit($event)\" [attr.aria-busy]=\"cotizando() || procesando()\">\r\n      <div class=\"transaction\">\r\n        <div class=\"stay\">\r\n          <section class=\"property\" aria-labelledby=\"payment-property\">\r\n            <h3 id=\"payment-property\">{{ publicacion().titulo }}</h3>\r\n            <p>{{ ubicacion() }}</p>\r\n            <p><span>Anunciante:</span> {{ anunciante() }}</p>\r\n          </section>\r\n          <dl class=\"dates\">\r\n            <div>\r\n              <dt>Primer d\u00EDa</dt>\r\n              <dd>{{ fecha(inicio()) }}</dd>\r\n            </div>\r\n            <div>\r\n              <dt>\u00DAltimo d\u00EDa incluido</dt>\r\n              <dd>{{ fecha(fin()) }}</dd>\r\n            </div>\r\n          </dl>\r\n        </div>\r\n        <div class=\"breakdown\">\r\n          @if (cotizando()) {\r\n            <p class=\"notice\" role=\"status\">Verificando precio y cotizaci\u00F3n\u2026</p>\r\n          }\r\n          @if (presupuesto(); as precio) {\r\n            <dl class=\"amounts\">\r\n              <div>\r\n                <dt>Duraci\u00F3n</dt>\r\n                <dd>\r\n                  {{ precio.cantidad_dias }} {{ precio.cantidad_dias === 1 ? 'd\u00EDa' : 'd\u00EDas' }}\r\n                </dd>\r\n              </div>\r\n              <div>\r\n                <dt>Moneda de publicaci\u00F3n</dt>\r\n                <dd>{{ precio.moneda_origen }}</dd>\r\n              </div>\r\n              <div>\r\n                <dt>Precio por d\u00EDa</dt>\r\n                <dd>{{ importe(precio.precio_unitario_origen, precio.moneda_origen) }}</dd>\r\n              </div>\r\n              <div>\r\n                <dt>\r\n                  Subtotal \u00B7 {{ precio.cantidad_dias }}\r\n                  {{ precio.cantidad_dias === 1 ? 'd\u00EDa' : 'd\u00EDas' }}\r\n                </dt>\r\n                <dd>{{ importe(precio.total_origen, precio.moneda_origen) }}</dd>\r\n              </div>\r\n            </dl>\r\n            @if (precio.cotizacion; as dolar) {\r\n              <section class=\"conversion\" aria-labelledby=\"payment-conversion\">\r\n                <h3 id=\"payment-conversion\">Conversi\u00F3n de d\u00F3lares a pesos</h3>\r\n                <p>\r\n                  D\u00F3lar blue venta: <strong>{{ importe(dolar.venta, 'ARS', 6) }} por USD</strong>\r\n                </p>\r\n                <details>\r\n                  <summary>Ver fuente y fechas de la cotizaci\u00F3n</summary>\r\n                  <p>\r\n                    Fuente: {{ dolar.proveedor }} \u00B7\r\n                    <a href=\"https://dolarapi.com\" target=\"_blank\" rel=\"noopener noreferrer\"\r\n                      >DolarApi / DolarHoy</a\r\n                    >.\r\n                  </p>\r\n                  <p>Publicada: {{ fechaHora(dolar.actualizada_fuente_en) }}.</p>\r\n                  <p>Consultada: {{ fechaHora(dolar.consultada_en) }}.</p>\r\n                </details>\r\n                <label class=\"accept\"\r\n                  ><input\r\n                    type=\"checkbox\"\r\n                    [checked]=\"conversionAceptada()\"\r\n                    (change)=\"cambiarConversion($event)\"\r\n                    [disabled]=\"procesando()\"\r\n                  /><span\r\n                    >Acepto esta cotizaci\u00F3n y pagar\r\n                    {{ importe(precio.total_cobro, precio.moneda_cobro) }} en pesos.</span\r\n                  ></label\r\n                >\r\n              </section>\r\n            }\r\n            <div class=\"total\">\r\n              <span>Total a pagar <small>Pesos argentinos (ARS)</small></span\r\n              ><strong>{{ importe(precio.total_cobro, precio.moneda_cobro) }}</strong>\r\n            </div>\r\n            <details class=\"validity\">\r\n              <summary>V\u00E1lido hasta {{ fechaHora(precio.vence_en) }}</summary>\r\n              <p>Presupuesto emitido: {{ fechaHora(precio.emitida_en) }}.</p>\r\n              <p>Al continuar, las fechas quedar\u00E1n reservadas hasta ese vencimiento.</p>\r\n            </details>\r\n            @if (vencido()) {\r\n              <p class=\"notice notice--error\" role=\"alert\">\r\n                El presupuesto venci\u00F3. Volv\u00E9 a cotizar para continuar.\r\n              </p>\r\n            }\r\n          }\r\n          @if (error()) {\r\n            <p class=\"notice notice--error\" role=\"alert\">{{ error() }}</p>\r\n          }\r\n        </div>\r\n      </div>\r\n      <div class=\"actions\">\r\n        @if (presupuesto(); as precio) {\r\n          <button\r\n            class=\"mercado-pago\"\r\n            type=\"submit\"\r\n            [disabled]=\"\r\n              procesando() ||\r\n              cotizando() ||\r\n              vencido() ||\r\n              (precio.moneda_origen === 'USD' && !conversionAceptada())\r\n            \"\r\n          >\r\n            <img\r\n              class=\"mercado-pago__logo\"\r\n              src=\"/images/mercado-pago.png\"\r\n              alt=\"\"\r\n              aria-hidden=\"true\"\r\n            />\r\n            <span>{{ procesando() ? 'Conectando\u2026' : 'Pagar con Mercado Pago' }}</span>\r\n          </button>\r\n          <p class=\"secure\">\r\n            <svg lucideLockKeyhole [size]=\"14\" aria-hidden=\"true\"></svg> Pag\u00E1 de forma segura\r\n          </p>\r\n          <p class=\"redirect\">\r\n            Eleg\u00EDs el medio de pago e ingres\u00E1s los datos en Mercado Pago. DEPA no almacena los datos\r\n            de tu tarjeta.\r\n          </p>\r\n        }\r\n        <div class=\"secondary\">\r\n          <button type=\"button\" (click)=\"recotizar.emit()\" [disabled]=\"procesando() || cotizando()\">\r\n            {{ cotizando() ? 'Cotizando\u2026' : 'Volver a cotizar' }}\r\n          </button>\r\n        </div>\r\n      </div>\r\n    </form>\r\n  </section>\r\n</div>\r\n", styles: [".backdrop { position: fixed; z-index: 1000; inset: 0; display: grid; place-items: center; padding: 20px; background: rgb(11 24 40 / 70%); }\r\n.summary { width: min(100%, 840px); max-height: calc(100dvh - 40px); overflow-y: auto; border-radius: 18px; background: #fff; color: var(--color-text); box-shadow: 0 24px 70px #0005; overflow-wrap: anywhere; }\r\n.summary__head { position: sticky; top: 0; z-index: 1; background: #fff; padding: 22px 60px 18px 24px; border-bottom: 1px solid var(--color-border); }\r\n.eyebrow { color: var(--color-secondary); font-size: .7rem; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }\r\nh2 { margin: 5px 0; font-size: 1.5rem; font-weight: 800; }\r\nh3, p, dl { margin: 0; }\r\nh3 { font-size: .95rem; font-weight: 750; }\r\n.summary__head p, .property p, dt, .validity, .redirect, .secure { color: var(--color-text-muted); font-size: .82rem; line-height: 1.5; }\r\nbutton { font: inherit; cursor: pointer; }\r\nbutton:disabled { cursor: default; opacity: .6; }\r\nbutton:focus-visible, summary:focus-visible, input:focus-visible, a:focus-visible { outline: 3px solid var(--color-secondary); outline-offset: 3px; }\r\n.close { position: absolute; top: 18px; right: 18px; display: grid; place-items: center; width: 34px; height: 34px; padding: 0; border: 0; border-radius: 50%; background: #f1f3f6; color: var(--color-text-muted); }\r\nform { display: grid; gap: 16px; padding: 20px 24px 22px; }\r\n.transaction { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 20px; }\r\n.stay, .breakdown { display: grid; align-content: start; gap: 14px; min-width: 0; }\r\n.property { padding: 14px; border: 1px solid var(--color-border); border-radius: 10px; background: #f8fafc; }\r\n.property p { margin-top: 4px; }\r\n.dates { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }\r\n.dates div { padding: 10px 12px; border-radius: 9px; background: #f5f7fb; }\r\ndd { margin: 3px 0 0; font-size: .9rem; font-weight: 750; }\r\n.amounts { display: grid; gap: 9px; }\r\n.amounts div { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; }\r\n.amounts dd { margin: 0; text-align: right; }\r\n.conversion { padding: 13px; border: 1px solid #fbd4a1; border-radius: 10px; background: #fff8ef; font-size: .8rem; line-height: 1.5; }\r\n.conversion p, .validity p { margin-top: 6px; }\r\n.conversion h3 { margin-bottom: 5px; }\r\nsummary { cursor: pointer; font-weight: 650; }\r\n.conversion details { margin-top: 7px; }\r\n.conversion a { color: var(--color-secondary); text-decoration: underline; }\r\n.accept { display: flex; align-items: flex-start; gap: 9px; margin-top: 12px; font-weight: 650; }\r\n.accept input { flex: 0 0 auto; width: 18px; height: 18px; margin-top: 3px; accent-color: var(--color-secondary); }\r\n.total { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px 16px; padding: 15px; border: 1px solid #ccecf7; border-radius: 10px; background: #eef9fd; font-weight: 750; }\r\n.total small { display: block; margin-top: 3px; color: #526273; font-size: .74rem; font-weight: 500; }\r\n.total strong { max-width: 100%; color: #007eb5; font-size: clamp(1.4rem, 4vw, 1.8rem); }\r\n.notice { padding: 12px; border-radius: 8px; background: #eff6ff; font-size: .85rem; }\r\n.notice--error { color: #991b1b; background: #fee2e2; }\r\n.actions { display: grid; gap: 8px; padding-top: 4px; }\r\n.mercado-pago { display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; min-height: 56px; padding: 12px 16px; border: 0; border-radius: 9px; background: #009ee3; color: #fff; font-size: 1.05rem; font-weight: 750; line-height: 1.3; box-shadow: 0 4px 10px #009ee333; transition: background .15s, transform .15s; }\r\n.mercado-pago:hover:not(:disabled) { background: #008bc8; transform: translateY(-1px); }\r\n.mercado-pago:disabled { background: #e4e7ec; color: #526273; opacity: 1; box-shadow: none; }\r\n.mercado-pago__logo { width: 40px;height: 30px;object-fit: contain;flex-shrink: 0;}\r\n.secure { display: flex; align-items: center; justify-content: center; gap: 5px; font-weight: 700; }\r\n.redirect { text-align: center; font-size: .75rem; }\r\n.secondary { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; margin-top: 8px; padding-top: 12px; border-top: 1px solid var(--color-border); }\r\n.secondary button { padding: 7px 0; border: 0; background: transparent; color: var(--color-secondary); font-size: .82rem; font-weight: 700; }\r\n@media (max-width: 480px) { .backdrop { padding: 12px; } .summary { max-height: calc(100dvh - 24px); } .summary__head { padding: 18px 52px 15px 18px; } form { padding: 16px 18px 18px; gap: 13px; } .close { right: 12px; top: 14px; } h2 { font-size: 1.3rem; } .dates { gap: 8px; } .dates div { padding: 9px; } .mercado-pago { gap: 8px; padding-inline: 12px; font-size: .95rem; } }\r\n@media (max-width: 640px) { .transaction { grid-template-columns: minmax(0, 1fr); gap: 16px; } }\r\n"] }]
    }], () => [], { publicacion: [{ type: i0.Input, args: [{ isSignal: true, alias: "publicacion", required: true }] }], anunciante: [{ type: i0.Input, args: [{ isSignal: true, alias: "anunciante", required: true }] }], ubicacion: [{ type: i0.Input, args: [{ isSignal: true, alias: "ubicacion", required: true }] }], inicio: [{ type: i0.Input, args: [{ isSignal: true, alias: "inicio", required: false }] }], fin: [{ type: i0.Input, args: [{ isSignal: true, alias: "fin", required: false }] }], presupuesto: [{ type: i0.Input, args: [{ isSignal: true, alias: "presupuesto", required: false }] }], cotizando: [{ type: i0.Input, args: [{ isSignal: true, alias: "cotizando", required: false }] }], procesando: [{ type: i0.Input, args: [{ isSignal: true, alias: "procesando", required: false }] }], vencido: [{ type: i0.Input, args: [{ isSignal: true, alias: "vencido", required: false }] }], conversionAceptada: [{ type: i0.Input, args: [{ isSignal: true, alias: "conversionAceptada", required: false }] }], error: [{ type: i0.Input, args: [{ isSignal: true, alias: "error", required: false }] }], cerrar: [{ type: i0.Output, args: ["cerrar"] }], recotizar: [{ type: i0.Output, args: ["recotizar"] }], continuar: [{ type: i0.Output, args: ["continuar"] }], aceptarConversion: [{ type: i0.Output, args: ["aceptarConversion"] }], mantenerFoco: [{
            type: HostListener,
            args: ['keydown', ['$event']]
        }], cerrarModal: [{
            type: HostListener,
            args: ['document:keydown.escape']
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(PaymentSummaryComponent, { className: "PaymentSummaryComponent", filePath: "src/app/features/publication-detail/payment-summary/payment-summary.component.ts", lineNumber: 13 }); })();
