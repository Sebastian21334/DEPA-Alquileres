import { NgTemplateOutlet } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Output, ViewChild, computed, inject, signal, } from '@angular/core';
import { FaceLandmarker, FilesetResolver, } from '@mediapipe/tasks-vision';
import { firstValueFrom } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { bocaEnReposo, detectarGesto, evaluarEncuadre, medirAperturaBoca, PosicionEstable } from './vitalidad';
import { VerificacionFacialService, } from '../../../shared/services/verificacion-facial.service';
import * as i0 from "@angular/core";
const _c0 = ["dialog"];
const _c1 = ["video"];
const _c2 = ["overlay"];
const _c3 = ["capture"];
const _c4 = (a0, a1) => ({ $implicit: a0, detectado: a1, overlay: true });
const _c5 = (a0, a1) => ({ $implicit: a0, detectado: a1 });
const _forTrack0 = ($index, $item) => $item.type;
function CapturaIdentidadComponent_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 15);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.paso() === "dni_frente" ? "DNI \u2014 FRENTE" : "DNI \u2014 DORSO");
} }
function CapturaIdentidadComponent_Conditional_34_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 18);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    const rostroGuia_r2 = i0.ɵɵreference(53);
    i0.ɵɵproperty("ngTemplateOutlet", rostroGuia_r2)("ngTemplateOutletContext", i0.ɵɵpureFunction2(2, _c4, ctx_r0.gestoGuia(), ctx_r0.estadoEnVivo() === "detected"));
} }
function CapturaIdentidadComponent_Conditional_35_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 19);
    i0.ɵɵtext(1, "Tu c\u00E1mara \u00B7 vista espejo");
    i0.ɵɵelementEnd();
} }
function CapturaIdentidadComponent_Conditional_36_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 20);
    i0.ɵɵelement(1, "span", 31);
    i0.ɵɵelementStart(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.fase() === "validating" ? "Comprobando tus movimientos\u2026" : "Preparando la c\u00E1mara\u2026");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.fase() === "validating" ? "Ya tomamos las fotos. Pod\u00E9s relajarte." : "Si el navegador te lo pide, permit\u00ED el acceso a la c\u00E1mara.");
} }
function CapturaIdentidadComponent_Conditional_37_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "figure", 21);
    i0.ɵɵelement(1, "img", 32);
    i0.ɵɵelementStart(2, "figcaption");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("src", ctx, i0.ɵɵsanitizeUrl)("alt", "Foto de " + (ctx_r0.paso() === "dni_frente" ? "DNI \u2014 FRENTE" : "DNI \u2014 DORSO") + " para revisar");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", ctx_r0.paso() === "dni_frente" ? "DNI \u2014 FRENTE" : "DNI \u2014 DORSO", ": \u00BFse ve completo, n\u00EDtido y sin reflejos?");
} }
function CapturaIdentidadComponent_Conditional_40_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 23);
    i0.ɵɵtext(1, "Apoy\u00E1 el DNI sobre una superficie lisa. Acerc\u00E1 la c\u00E1mara hasta que el documento entre en el recuadro.");
    i0.ɵɵelementEnd();
} }
function CapturaIdentidadComponent_Conditional_41_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 33)(1, "span", 34);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "div", 35);
    i0.ɵɵelement(6, "span");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p", 36);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("live-feedback--ok", ctx_r0.estadoEnVivo() === "detected")("live-feedback--adjust", ctx_r0.estadoEnVivo() === "adjust");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.estadoEnVivo() === "detected" ? "\u2713" : "\u25C9");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.feedback());
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-valuenow", ctx_r0.progresoGesto());
    i0.ɵɵadvance();
    i0.ɵɵstyleProp("width", ctx_r0.progresoGesto(), "%");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.progresoGesto() > 0 ? "Manten\u00E9 la posici\u00F3n hasta completar la barra" : "La barra avanza cuando la posici\u00F3n es correcta");
} }
function CapturaIdentidadComponent_Conditional_42_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 41);
    i0.ɵɵelementContainer(1, 18);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "h3");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    const rostroGuia_r2 = i0.ɵɵreference(53);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngTemplateOutlet", rostroGuia_r2)("ngTemplateOutletContext", i0.ɵɵpureFunction2(4, _c5, ctx_r0.gestoGuia(), ctx_r0.estadoEnVivo() === "detected"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx.label);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.ayudaGesto());
} }
function CapturaIdentidadComponent_Conditional_42_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h3");
    i0.ɵɵtext(1, "Mir\u00E1 de frente");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3, "Ubic\u00E1 tu cara dentro del \u00F3valo y manten\u00E9 la cabeza derecha. No hace falta tocar ning\u00FAn bot\u00F3n.");
    i0.ɵɵelementEnd();
} }
function CapturaIdentidadComponent_Conditional_42_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h3");
    i0.ɵɵtext(1, "Gesto capturado \u2713");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3, "Volv\u00E9 a mirar al centro. El pr\u00F3ximo movimiento empieza solo.");
    i0.ɵɵelementEnd();
} }
function CapturaIdentidadComponent_Conditional_42_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h3");
    i0.ɵɵtext(1, "Ahora, de frente");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3, "Cerr\u00E1 la boca y mir\u00E1 a la c\u00E1mara. La foto final se toma autom\u00E1ticamente.");
    i0.ɵɵelementEnd();
} }
function CapturaIdentidadComponent_Conditional_42_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h3");
    i0.ɵɵtext(1, "Comprobaci\u00F3n final");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3, "Estamos verificando que las capturas correspondan a la misma persona y que los movimientos sean v\u00E1lidos.");
    i0.ɵɵelementEnd();
} }
function CapturaIdentidadComponent_Conditional_42_For_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const instruction_r3 = ctx.$implicit;
    const ɵ$index_150_r4 = ctx.$index;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("done", ɵ$index_150_r4 < ctx_r0.indiceInstruccion() || ctx_r0.fase() === "recentering" && ɵ$index_150_r4 === ctx_r0.indiceInstruccion() || ctx_r0.fase() === "centering" || ctx_r0.fase() === "capturing" || ctx_r0.fase() === "validating");
    i0.ɵɵattribute("aria-label", instruction_r3.label)("aria-current", ctx_r0.fase() === "actions" && ɵ$index_150_r4 === ctx_r0.indiceInstruccion() ? "step" : null);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ɵ$index_150_r4 < ctx_r0.indiceInstruccion() || ctx_r0.fase() === "recentering" && ɵ$index_150_r4 === ctx_r0.indiceInstruccion() || ctx_r0.fase() === "centering" || ctx_r0.fase() === "capturing" || ctx_r0.fase() === "validating" ? "\u2713" : ɵ$index_150_r4 + 1, " ");
} }
function CapturaIdentidadComponent_Conditional_42_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 39);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Tiempo disponible: ", ctx_r0.tiempoRestante());
} }
function CapturaIdentidadComponent_Conditional_42_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 42);
    i0.ɵɵlistener("click", function CapturaIdentidadComponent_Conditional_42_Conditional_12_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.cambiarGestos()); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r0.cambiandoDesafio() || ctx_r0.procesando());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.cambiandoDesafio() ? "Preparando\u2026" : ctx_r0.fase() === "error" ? "Reintentar prueba de vida" : "Probar otros movimientos");
} }
function CapturaIdentidadComponent_Conditional_42_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "aside", 24)(1, "p", 7);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, CapturaIdentidadComponent_Conditional_42_Conditional_3_Template, 6, 7)(4, CapturaIdentidadComponent_Conditional_42_Conditional_4_Template, 4, 0)(5, CapturaIdentidadComponent_Conditional_42_Conditional_5_Template, 4, 0)(6, CapturaIdentidadComponent_Conditional_42_Conditional_6_Template, 4, 0)(7, CapturaIdentidadComponent_Conditional_42_Conditional_7_Template, 4, 0);
    i0.ɵɵelementStart(8, "ol", 37);
    i0.ɵɵrepeaterCreate(9, CapturaIdentidadComponent_Conditional_42_For_10_Template, 2, 5, "li", 38, _forTrack0);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(11, CapturaIdentidadComponent_Conditional_42_Conditional_11_Template, 2, 1, "p", 39);
    i0.ɵɵconditionalCreate(12, CapturaIdentidadComponent_Conditional_42_Conditional_12_Template, 2, 2, "button", 40);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_7_0;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.fase() === "calibrating" ? "Preparaci\u00F3n" : "Movimiento " + (ctx_r0.indiceInstruccion() + 1) + " de " + ctx_r0.instrucciones().length);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_7_0 = ctx_r0.fase() === "actions" && ctx_r0.instruccionActual()) ? 3 : ctx_r0.fase() === "calibrating" ? 4 : ctx_r0.fase() === "recentering" ? 5 : ctx_r0.fase() === "centering" || ctx_r0.fase() === "capturing" ? 6 : ctx_r0.fase() === "validating" ? 7 : -1, tmp_7_0);
    i0.ɵɵadvance(6);
    i0.ɵɵrepeater(ctx_r0.instrucciones());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.segundosRestantes() > 0 && ctx_r0.fase() !== "complete" ? 11 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.fase() !== "capturing" && ctx_r0.fase() !== "validating" ? 12 : -1);
} }
function CapturaIdentidadComponent_Conditional_43_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 25)(1, "span", 43);
    i0.ɵɵtext(2, "\u2713");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "h3");
    i0.ɵɵtext(4, "Prueba de vida v\u00E1lida");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p");
    i0.ɵɵtext(8, "El DNI y la documentaci\u00F3n ser\u00E1n revisados por un administrador.");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(ctx_r0.mensaje());
} }
function CapturaIdentidadComponent_Conditional_44_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "Pod\u00E9s repetir los movimientos sin volver a fotografiar el DNI.");
    i0.ɵɵelementEnd();
} }
function CapturaIdentidadComponent_Conditional_44_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 45);
    i0.ɵɵlistener("click", function CapturaIdentidadComponent_Conditional_44_Conditional_6_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r6); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.cambiarGestos()); });
    i0.ɵɵtext(1, "Reintentar prueba de vida");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r0.procesando() || ctx_r0.cambiandoDesafio());
} }
function CapturaIdentidadComponent_Conditional_44_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 26)(1, "h3");
    i0.ɵɵtext(2, "No se pudo completar este intento");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, CapturaIdentidadComponent_Conditional_44_Conditional_5_Template, 2, 0, "p");
    i0.ɵɵconditionalCreate(6, CapturaIdentidadComponent_Conditional_44_Conditional_6_Template, 2, 1, "button", 44);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.error());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.paso() === "liveness" ? 5 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.paso() === "liveness" && !ctx_r0.instrucciones().length ? 6 : -1);
} }
function CapturaIdentidadComponent_Conditional_46_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 46);
    i0.ɵɵlistener("click", function CapturaIdentidadComponent_Conditional_46_Conditional_2_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r8); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.cambiarCamara()); });
    i0.ɵɵtext(1, "Cambiar c\u00E1mara");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r0.procesando());
} }
function CapturaIdentidadComponent_Conditional_46_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 45);
    i0.ɵɵlistener("click", function CapturaIdentidadComponent_Conditional_46_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r7); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.capturarDocumento()); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(2, CapturaIdentidadComponent_Conditional_46_Conditional_2_Template, 2, 1, "button", 29);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", !ctx_r0.cameraReady() || ctx_r0.procesando());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.procesando() ? "Capturando\u2026" : ctx_r0.paso() === "dni_frente" ? "Sacar foto del frente" : "Sacar foto del dorso");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.puedeCambiarCamara() ? 2 : -1);
} }
function CapturaIdentidadComponent_Conditional_47_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 45);
    i0.ɵɵlistener("click", function CapturaIdentidadComponent_Conditional_47_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r9); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.confirmarDocumento()); });
    i0.ɵɵtext(1, "Usar esta foto");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "button", 46);
    i0.ɵɵlistener("click", function CapturaIdentidadComponent_Conditional_47_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r9); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.repetirDocumento()); });
    i0.ɵɵtext(3, "Repetir foto");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r0.procesando());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r0.procesando());
} }
function CapturaIdentidadComponent_Conditional_48_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 47);
    i0.ɵɵlistener("click", function CapturaIdentidadComponent_Conditional_48_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r10); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.enviarCapturas()); });
    i0.ɵɵtext(1, "Enviar documentaci\u00F3n");
    i0.ɵɵelementEnd();
} }
function CapturaIdentidadComponent_Conditional_49_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 46);
    i0.ɵɵlistener("click", function CapturaIdentidadComponent_Conditional_49_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r11); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.reiniciar()); });
    i0.ɵɵtext(1, "Volver a empezar");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r0.procesando() || ctx_r0.cambiandoDesafio());
} }
function CapturaIdentidadComponent_ng_template_52_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "svg", 48)(1, "g", 49);
    i0.ɵɵelement(2, "circle", 50);
    i0.ɵɵelementStart(3, "g", 51);
    i0.ɵɵelement(4, "circle", 52)(5, "circle", 53)(6, "path", 54)(7, "ellipse", 55);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const gesto_r12 = ctx.$implicit;
    const detectado_r13 = ctx.detectado;
    const overlay_r14 = ctx.overlay;
    i0.ɵɵclassProp("face-guide--overlay", overlay_r14)("is-detected", detectado_r13);
    i0.ɵɵattribute("data-gesture", gesto_r12);
} }
const HOLD_ACTION_MS = 650;
const HOLD_CENTER_MS = 500;
const HOLD_FINAL_MS = 900;
const HOLD_CALIBRATION_MS = 900;
const CAPTURE_NOTICE_MS = 250;
const FRAMES_POR_ACCION = 2;
const ESPERA_ENTRE_FRAMES_MS = 90;
const puntuarCamaraTrasera = (label) => {
    const nombre = label.toLocaleLowerCase();
    // En varios teléfonos `facingMode: environment` abre la lente ultra gran angular.
    // Priorizamos las etiquetas que identifican la cámara principal/1x y dejamos las
    // lentes especiales al final, sin depender del orden que entrega el navegador.
    if (/ultra[ -]?(wide|gran angular)|0[.,]5\s?x/.test(nombre))
        return -300;
    if (/macro/.test(nombre))
        return -250;
    if (/tele(photo|objetivo)?|\b[2-9](?:[.,]\d+)?\s?x\b/.test(nombre))
        return -200;
    if (/\b1(?:[.,]0)?\s?x\b|main|principal|standard|normal/.test(nombre))
        return 300;
    if (/^(back|rear|environment|trasera|posterior) camera$/.test(nombre))
        return 250;
    if (/wide|gran angular/.test(nombre))
        return 200;
    if (/dual|triple|fusion/.test(nombre))
        return 100;
    return 0;
};
export class CapturaIdentidadComponent {
    dialogRef;
    videoRef;
    overlayRef;
    captureRef;
    pruebaVidaCompletada = new EventEmitter();
    fallo = new EventEmitter();
    reintento = new EventEmitter();
    cerrar = new EventEmitter();
    facialService = inject(VerificacionFacialService);
    destroyRef = inject(DestroyRef);
    paso = signal('dni_frente', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "paso" }] : /* istanbul ignore next */ []));
    fase = signal('idle', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "fase" }] : /* istanbul ignore next */ []));
    cameraReady = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cameraReady" }] : /* istanbul ignore next */ []));
    cameraAspectRatio = signal(4 / 3, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cameraAspectRatio" }] : /* istanbul ignore next */ []));
    procesando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "procesando" }] : /* istanbul ignore next */ []));
    cambiandoDesafio = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cambiandoDesafio" }] : /* istanbul ignore next */ []));
    mensaje = signal('Colocá el frente del DNI dentro del recuadro.', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mensaje" }] : /* istanbul ignore next */ []));
    error = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    frentePreview = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "frentePreview" }] : /* istanbul ignore next */ []));
    dorsoPreview = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "dorsoPreview" }] : /* istanbul ignore next */ []));
    instrucciones = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "instrucciones" }] : /* istanbul ignore next */ []));
    indiceInstruccion = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "indiceInstruccion" }] : /* istanbul ignore next */ []));
    instruccionActual = computed(() => this.instrucciones()[this.indiceInstruccion()] ?? null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "instruccionActual" }] : /* istanbul ignore next */ []));
    segundosRestantes = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "segundosRestantes" }] : /* istanbul ignore next */ []));
    tiempoRestante = computed(() => {
        const total = this.segundosRestantes();
        const minutos = Math.floor(total / 60);
        const segundos = total % 60;
        return `${minutos}:${segundos.toString().padStart(2, '0')}`;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tiempoRestante" }] : /* istanbul ignore next */ []));
    progresoCapturaFinal = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "progresoCapturaFinal" }] : /* istanbul ignore next */ []));
    fotoPendientePreview = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "fotoPendientePreview" }] : /* istanbul ignore next */ []));
    puedeCambiarCamara = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "puedeCambiarCamara" }] : /* istanbul ignore next */ []));
    feedback = signal('Preparando la cámara…', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "feedback" }] : /* istanbul ignore next */ []));
    estadoEnVivo = signal('waiting', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "estadoEnVivo" }] : /* istanbul ignore next */ []));
    progresoGesto = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "progresoGesto" }] : /* istanbul ignore next */ []));
    tituloPaso = computed(() => {
        if (this.paso() === 'dni_frente')
            return 'Fotografiá el frente de tu DNI';
        if (this.paso() === 'dni_dorso')
            return 'Ahora, el dorso de tu DNI';
        if (this.fase() === 'complete')
            return 'Tu prueba de vida es válida';
        if (this.fase() === 'calibrating')
            return 'Primero, mirá de frente';
        if (this.fase() === 'validating')
            return 'Comprobando tu prueba';
        if (this.fase() === 'error')
            return 'Vamos a intentarlo de nuevo';
        if (['centering', 'capturing'].includes(this.fase()))
            return 'Último paso: una foto de frente';
        if (this.fase() === 'recentering')
            return 'Bien, volvé al centro';
        return this.instruccionActual()?.label ?? 'Seguí las indicaciones';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tituloPaso" }] : /* istanbul ignore next */ []));
    ayudaGesto = computed(() => {
        switch (this.instruccionActual()?.type) {
            case 'TURN_LEFT': return 'Girá la nariz apenas hacia tu hombro izquierdo, sin mover el celular.';
            case 'TURN_RIGHT': return 'Girá la nariz apenas hacia tu hombro derecho, sin mover el celular.';
            case 'TILT_HEAD': return 'Inclinala apenas hacia un costado, como si apoyaras una oreja en el hombro.';
            case 'OPEN_MOUTH': return 'Mantené la cabeza de frente y abrí la boca sin exagerar.';
            default: return '';
        }
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ayudaGesto" }] : /* istanbul ignore next */ []));
    /** Posición final que debe imitar el rostro durante la prueba de vida. */
    gestoGuia = computed(() => {
        if (this.fase() !== 'actions')
            return 'FRONTAL';
        return this.instruccionActual()?.type ?? 'FRONTAL';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "gestoGuia" }] : /* istanbul ignore next */ []));
    frente = null;
    dorso = null;
    fotoPendiente = null;
    neutralPhoto = null;
    livePhoto = null;
    actionPhotos = [];
    challengeToken = '';
    challengeExpiraEn = 0;
    temporizadorChallenge = null;
    stream = null;
    cameraSession = 0;
    faceLandmarker = null;
    modeloPendiente = null;
    animationFrameId = null;
    lastVideoTime = -1;
    destroyed = false;
    busyFrame = false;
    neutralPose = null;
    aperturaNeutral = null;
    sumaApertura = 0;
    muestrasApertura = 0;
    calibrationYaw = 0;
    calibrationRoll = 0;
    calibrationCount = 0;
    camarasTraseras = [];
    indiceCamaraTrasera = 0;
    posicionEstable = new PosicionEstable();
    ultimaDeteccion = null;
    ultimaDeteccionEn = 0;
    ultimoAnalisisEn = 0;
    verificationToken = '';
    verificationExpiraEn = 0;
    focoAnterior = null;
    overflowAnterior = '';
    ngAfterViewInit() {
        this.focoAnterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        this.overflowAnterior = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        this.dialogRef.nativeElement.showModal();
        void this.startCamera('environment').catch(() => undefined);
        this.animationFrameId = requestAnimationFrame(this.renderLoop);
    }
    ngOnDestroy() {
        this.destroyed = true;
        this.detenerContador();
        if (this.animationFrameId !== null)
            cancelAnimationFrame(this.animationFrameId);
        this.stopCamera();
        this.faceLandmarker?.close();
        this.revokePreview(this.frentePreview());
        this.revokePreview(this.dorsoPreview());
        this.revokePreview(this.fotoPendientePreview());
        this.dialogRef.nativeElement.close();
        document.body.style.overflow = this.overflowAnterior;
        this.focoAnterior?.focus();
    }
    cancelar(event) {
        event?.preventDefault();
        this.cerrar.emit();
    }
    enviarCapturas() {
        if (this.destroyed || this.fase() !== 'complete' || !this.frente || !this.dorso || !this.livePhoto)
            return;
        if (Date.now() >= this.verificationExpiraEn) {
            this.fase.set('error');
            this.paso.set('liveness');
            this.showError('La prueba venció antes del envío. Repetí solo los movimientos; conservamos las fotos de tu DNI.');
            return;
        }
        this.pruebaVidaCompletada.emit({
            dni_frente: this.frente, dni_dorso: this.dorso, rostro: this.livePhoto,
            verificationToken: this.verificationToken,
        });
    }
    async capturarDocumento() {
        if (!this.cameraReady() || this.procesando() || this.fotoPendiente)
            return;
        this.procesando.set(true);
        this.error.set('');
        try {
            const campo = this.paso();
            const foto = await this.captureFrame(`${campo}-${Date.now()}.jpg`);
            if (this.destroyed)
                return;
            this.fotoPendiente = foto;
            this.setPreview(this.fotoPendientePreview, foto);
            this.mensaje.set(`Revisá que el ${campo === 'dni_frente' ? 'frente' : 'dorso'} se vea completo, nítido y sin reflejos.`);
        }
        catch (error) {
            this.showError(this.errorText(error));
        }
        finally {
            this.procesando.set(false);
        }
    }
    async confirmarDocumento() {
        if (!this.fotoPendiente || this.procesando())
            return;
        const foto = this.fotoPendiente;
        this.limpiarFotoPendiente();
        if (this.paso() === 'dni_frente') {
            this.frente = foto;
            this.setPreview(this.frentePreview, foto);
            this.paso.set('dni_dorso');
            this.mensaje.set('Ahora colocá el dorso del DNI dentro del recuadro.');
            return;
        }
        if (this.paso() === 'dni_dorso') {
            this.dorso = foto;
            this.setPreview(this.dorsoPreview, foto);
            this.procesando.set(true);
            try {
                await this.iniciarPruebaFacial();
            }
            catch (error) {
                if (this.destroyed)
                    return;
                this.fase.set('error');
                this.stopCamera();
                this.showError(this.errorText(error));
            }
            finally {
                this.procesando.set(false);
            }
        }
    }
    repetirDocumento() {
        this.limpiarFotoPendiente();
        this.mensaje.set(this.paso() === 'dni_frente'
            ? 'Colocá el frente del DNI dentro del recuadro.'
            : 'Colocá el dorso del DNI dentro del recuadro.');
    }
    async cambiarCamara() {
        if (this.camarasTraseras.length < 2 || this.procesando())
            return;
        this.indiceCamaraTrasera = (this.indiceCamaraTrasera + 1) % this.camarasTraseras.length;
        this.procesando.set(true);
        try {
            await this.startCamera('environment', this.camarasTraseras[this.indiceCamaraTrasera].deviceId);
        }
        catch {
            // startCamera ya muestra un mensaje accionable.
        }
        finally {
            this.procesando.set(false);
        }
    }
    async cambiarGestos() {
        if (this.busyFrame ||
            this.cambiandoDesafio() ||
            this.procesando() ||
            ['capturing', 'validating', 'complete'].includes(this.fase()))
            return;
        this.cambiandoDesafio.set(true);
        this.fase.set('idle');
        this.error.set('');
        this.reintento.emit();
        try {
            let challenge;
            try {
                challenge = await firstValueFrom((this.challengeToken ? this.facialService.cambiarDesafio(this.challengeToken) :
                    this.facialService.crearDesafio()).pipe(takeUntilDestroyed(this.destroyRef)));
            }
            catch {
                // Si el backend no puede reutilizar el desafío anterior (por ejemplo,
                // porque venció), se pide uno nuevo sin reiniciar las fotos del DNI.
                if (this.destroyed)
                    return;
                challenge = await firstValueFrom(this.facialService.crearDesafio().pipe(takeUntilDestroyed(this.destroyRef)));
            }
            await this.asegurarCamaraYModelo();
            if (this.destroyed)
                return;
            this.aplicarDesafio(challenge);
            this.fase.set('calibrating');
            this.mensaje.set('Mirá de frente. Conservamos las fotos de tu DNI.');
        }
        catch (error) {
            if (this.destroyed)
                return;
            this.fase.set('error');
            this.showError(this.errorText(error));
        }
        finally {
            this.cambiandoDesafio.set(false);
        }
    }
    /**
     * Reinicia todo el flujo, incluidas las fotos del DNI. Para reintentar solo
     * la prueba de vida conservando el DNI se usa "Cambiar gestos".
     */
    async reiniciar() {
        if (this.procesando() || this.cambiandoDesafio() || this.busyFrame)
            return;
        this.procesando.set(true);
        this.reintento.emit();
        this.frente = null;
        this.dorso = null;
        this.limpiarFotoPendiente();
        this.neutralPhoto = null;
        this.livePhoto = null;
        this.actionPhotos = [];
        this.challengeToken = '';
        this.neutralPose = null;
        this.aperturaNeutral = null;
        this.sumaApertura = this.muestrasApertura = 0;
        this.calibrationYaw = 0;
        this.calibrationRoll = 0;
        this.calibrationCount = 0;
        this.posicionEstable.reiniciar();
        this.progresoGesto.set(0);
        this.verificationToken = '';
        this.progresoCapturaFinal.set(0);
        this.indiceInstruccion.set(0);
        this.instrucciones.set([]);
        this.detenerContador();
        this.challengeExpiraEn = 0;
        this.segundosRestantes.set(0);
        this.fase.set('idle');
        this.paso.set('dni_frente');
        this.error.set('');
        this.mensaje.set('Colocá el frente del DNI dentro del recuadro.');
        this.revokePreview(this.frentePreview());
        this.revokePreview(this.dorsoPreview());
        this.frentePreview.set('');
        this.dorsoPreview.set('');
        try {
            await this.startCamera('environment');
        }
        catch { /* startCamera muestra cómo recuperar la cámara. */ }
        finally {
            this.procesando.set(false);
        }
    }
    async iniciarPruebaFacial() {
        this.paso.set('liveness');
        this.fase.set('idle');
        this.mensaje.set('Preparando la prueba de vida…');
        const [challenge] = await Promise.all([
            firstValueFrom(this.facialService.crearDesafio().pipe(takeUntilDestroyed(this.destroyRef))),
            this.initializeFaceLandmarker(),
            this.startCamera('user'),
        ]);
        if (this.destroyed)
            return;
        this.aplicarDesafio(challenge);
        this.fase.set('calibrating');
        this.mensaje.set('Mirá de frente y mantené la cabeza quieta para calibrar.');
    }
    async initializeFaceLandmarker() {
        if (this.faceLandmarker)
            return;
        if (this.modeloPendiente)
            return this.modeloPendiente;
        this.modeloPendiente = this.crearModeloFacial();
        try {
            await this.modeloPendiente;
        }
        finally {
            this.modeloPendiente = null;
        }
    }
    async crearModeloFacial() {
        const vision = await FilesetResolver.forVisionTasks('/assets/wasm');
        let modelo;
        try {
            modelo = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: { modelAssetPath: '/assets/face_landmarker.task', delegate: 'GPU' },
                runningMode: 'VIDEO', numFaces: 2, outputFaceBlendshapes: true,
            });
        }
        catch {
            modelo = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: { modelAssetPath: '/assets/face_landmarker.task', delegate: 'CPU' },
                runningMode: 'VIDEO', numFaces: 2, outputFaceBlendshapes: true,
            });
        }
        if (this.destroyed)
            modelo.close();
        else
            this.faceLandmarker = modelo;
    }
    async startCamera(facingMode, deviceId) {
        if (!navigator.mediaDevices?.getUserMedia)
            throw new Error('Este navegador no permite acceder a la cámara.');
        this.stopCamera();
        const sesion = this.cameraSession;
        this.cameraReady.set(false);
        this.lastVideoTime = -1;
        try {
            const nueva = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: facingMode } }),
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            });
            if (this.destroyed || sesion !== this.cameraSession) {
                nueva.getTracks().forEach(track => track.stop());
                return;
            }
            this.stream = nueva;
            if (facingMode === 'environment' && !deviceId)
                await this.seleccionarCamaraTraseraNormal();
            await this.normalizarZoom();
            if (this.destroyed || sesion !== this.cameraSession)
                return;
            const video = this.videoRef.nativeElement;
            video.srcObject = this.stream;
            await video.play();
            if (this.destroyed || sesion !== this.cameraSession)
                return;
            this.cameraAspectRatio.set(video.videoWidth / video.videoHeight || 4 / 3);
            const actual = this.stream;
            actual?.getVideoTracks()[0]?.addEventListener('ended', () => {
                if (this.destroyed || this.stream !== actual)
                    return;
                if (this.paso() === 'liveness')
                    this.fase.set('error');
                this.stopCamera();
                this.showError('La cámara se desconectó. Volvé a conectarla y reintentá.');
            }, { once: true });
            this.resizeOverlay();
            this.cameraReady.set(true);
        }
        catch (error) {
            const message = error instanceof DOMException && error.name === 'NotAllowedError'
                ? 'Necesitamos permiso de cámara para tomar las fotos en el momento. Habilitalo y volvé a intentar.'
                : `No se pudo iniciar la cámara: ${this.errorText(error)}`;
            this.showError(message);
            throw error;
        }
    }
    async seleccionarCamaraTraseraNormal() {
        if (typeof navigator.mediaDevices.enumerateDevices !== 'function')
            return;
        const devices = await navigator.mediaDevices.enumerateDevices();
        this.camarasTraseras = devices
            .filter(({ kind, label }) => kind === 'videoinput' && /back|rear|environment|trasera|posterior/i.test(label))
            .sort((a, b) => puntuarCamaraTrasera(b.label) - puntuarCamaraTrasera(a.label));
        this.puedeCambiarCamara.set(this.camarasTraseras.length > 1);
        if (this.camarasTraseras.length < 2)
            return;
        const preferida = this.camarasTraseras.find(({ label }) => puntuarCamaraTrasera(label) >= 0);
        const actualId = this.stream?.getVideoTracks()[0]?.getSettings().deviceId;
        if (!preferida || preferida.deviceId === actualId) {
            this.indiceCamaraTrasera = Math.max(0, this.camarasTraseras.findIndex(({ deviceId: id }) => id === actualId));
            return;
        }
        try {
            const reemplazo = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: { deviceId: { exact: preferida.deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } },
            });
            this.stream?.getTracks().forEach((track) => track.stop());
            this.stream = reemplazo;
            this.indiceCamaraTrasera = this.camarasTraseras.findIndex(({ deviceId: id }) => id === preferida.deviceId);
        }
        catch {
            // Algunos navegadores listan las lentes pero no permiten elegirlas por ID.
            // En ese caso se conserva el stream trasero que ya estaba funcionando.
        }
    }
    async normalizarZoom() {
        const track = this.stream?.getVideoTracks()[0];
        if (!track || typeof track.getCapabilities !== 'function')
            return;
        const capabilities = track.getCapabilities();
        if (!capabilities.zoom || capabilities.zoom.min > 1 || capabilities.zoom.max < 1)
            return;
        await track.applyConstraints({ advanced: [{ zoom: 1 }] }).catch(() => undefined);
    }
    stopCamera() {
        this.cameraSession++;
        this.stream?.getTracks().forEach((track) => track.stop());
        this.stream = null;
        this.cameraReady.set(false);
        if (this.videoRef?.nativeElement)
            this.videoRef.nativeElement.srcObject = null;
    }
    renderLoop = () => {
        if (this.destroyed)
            return;
        const video = this.videoRef.nativeElement;
        const canvas = this.overlayRef.nativeElement;
        const context = canvas.getContext('2d');
        if (context && this.cameraReady() && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            this.resizeOverlay();
            if (this.paso() !== 'liveness') {
                context.clearRect(0, 0, canvas.width, canvas.height);
                this.drawDocumentGuide(context);
            }
            else if (this.faceLandmarker && video.currentTime !== this.lastVideoTime &&
                performance.now() - this.ultimoAnalisisEn >= 80) {
                try {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    this.ultimoAnalisisEn = performance.now();
                    const result = this.faceLandmarker.detectForVideo(video, performance.now());
                    this.ultimaDeteccion = result;
                    this.ultimaDeteccionEn = performance.now();
                    this.lastVideoTime = video.currentTime;
                    void this.processLiveness(result).catch((error) => {
                        this.fase.set('error');
                        this.showError(this.errorText(error));
                    });
                }
                catch (error) {
                    this.fase.set('error');
                    this.stopCamera();
                    this.showError(`No se pudo analizar la cámara: ${this.errorText(error)}`);
                }
            }
        }
        if (!this.destroyed)
            this.animationFrameId = requestAnimationFrame(this.renderLoop);
    };
    async processLiveness(result) {
        if (this.destroyed || this.busyFrame || this.cambiandoDesafio() ||
            ['idle', 'error', 'capturing', 'validating', 'complete'].includes(this.fase()))
            return;
        const problema = evaluarEncuadre(result.faceLandmarks);
        const landmarks = result.faceLandmarks[0];
        const blendshapes = result.faceBlendshapes[0];
        const pose = landmarks ? this.calculateHeadPose(landmarks) : null;
        if (problema || !pose || !blendshapes) {
            this.posicionEstable.reiniciar();
            this.calibrationYaw = this.calibrationRoll = this.calibrationCount = 0;
            this.sumaApertura = this.muestrasApertura = 0;
            this.progresoGesto.set(0);
            this.progresoCapturaFinal.set(0);
            this.estadoEnVivo.set('adjust');
            this.feedback.set(problema ?? 'No vemos bien tu cara. Mirá de frente con buena luz.');
            return;
        }
        const scores = new Map(blendshapes.categories.map(({ categoryName, score }) => [categoryName, score]));
        const apertura = medirAperturaBoca(landmarks, this.cameraAspectRatio());
        const ahora = performance.now();
        if (this.fase() === 'calibrating') {
            const quieto = Math.abs(pose.yaw) <= .12 && Math.abs(pose.roll) <= .16 &&
                bocaEnReposo(apertura, null, scores.get('jawOpen') ?? 0) &&
                (!this.calibrationCount || (Math.abs(pose.yaw - this.calibrationYaw / this.calibrationCount) <= .025 &&
                    Math.abs(pose.roll - this.calibrationRoll / this.calibrationCount) <= .06));
            const progreso = this.posicionEstable.progreso(quieto, ahora, HOLD_CALIBRATION_MS);
            this.progresoGesto.set(progreso);
            this.estadoEnVivo.set(quieto ? 'detected' : 'adjust');
            this.feedback.set(quieto ? 'Bien encuadrado. Quedate quieto un momento…' : 'Mirá de frente, con la cabeza derecha y la boca cerrada.');
            if (!quieto || progreso === 0) {
                this.calibrationYaw = this.calibrationRoll = this.calibrationCount = 0;
                this.sumaApertura = this.muestrasApertura = 0;
            }
            if (!quieto)
                return;
            this.calibrationYaw += pose.yaw;
            this.calibrationRoll += pose.roll;
            this.calibrationCount++;
            if (apertura !== null) {
                this.sumaApertura += apertura;
                this.muestrasApertura++;
            }
            if (progreso === 100) {
                this.aperturaNeutral = this.muestrasApertura ? this.sumaApertura / this.muestrasApertura : null;
                this.neutralPose = {
                    yaw: this.calibrationYaw / this.calibrationCount,
                    roll: this.calibrationRoll / this.calibrationCount,
                };
                this.busyFrame = true;
                try {
                    this.neutralPhoto = await this.captureFrame(`neutral-${Date.now()}.jpg`);
                    if (this.destroyed)
                        return;
                    this.posicionEstable.reiniciar();
                    this.progresoGesto.set(0);
                    this.fase.set('actions');
                    this.feedback.set('Ahora hacé el movimiento indicado.');
                    this.estadoEnVivo.set('waiting');
                }
                finally {
                    this.busyFrame = false;
                }
            }
            return;
        }
        if (this.fase() === 'recentering' || this.fase() === 'centering') {
            const final = this.fase() === 'centering';
            const centered = this.isCentered(pose) && bocaEnReposo(apertura, this.aperturaNeutral, scores.get('jawOpen') ?? 0);
            const progreso = this.posicionEstable.progreso(centered, ahora, final ? HOLD_FINAL_MS : HOLD_CENTER_MS);
            this.estadoEnVivo.set(centered ? 'detected' : 'adjust');
            this.feedback.set(centered ? 'Perfecto. Mantené la mirada en la cámara…' : 'Volvé a mirar de frente y cerrá la boca.');
            this.progresoGesto.set(progreso);
            this.progresoCapturaFinal.set(progreso);
            if (progreso === 100) {
                this.posicionEstable.reiniciar();
                if (final)
                    await this.finalizeLiveness();
                else {
                    this.indiceInstruccion.update(index => index + 1);
                    this.progresoGesto.set(0);
                    this.fase.set('actions');
                    this.estadoEnVivo.set('waiting');
                    this.feedback.set('Seguí con el próximo movimiento.');
                }
            }
            return;
        }
        const accion = this.instruccionActual()?.type ?? null;
        const detected = this.isActionDetected(accion, pose, scores, apertura);
        const progreso = this.posicionEstable.progreso(detected, ahora, HOLD_ACTION_MS);
        this.progresoGesto.set(progreso);
        this.estadoEnVivo.set(detected ? 'detected' : 'adjust');
        const yaw = pose.yaw - (this.neutralPose?.yaw ?? 0);
        const contrario = (accion === 'TURN_LEFT' && yaw < -.04) || (accion === 'TURN_RIGHT' && yaw > .04);
        const bocaAbierta = apertura !== null && this.aperturaNeutral !== null &&
            apertura >= .16 && apertura >= this.aperturaNeutral + .06;
        this.feedback.set(detected ? '¡Bien! Gesto detectado. Mantenelo hasta completar la barra.' :
            contrario ? 'Estás girando hacia el otro lado. Seguí la flecha.' :
                accion === 'OPEN_MOUTH' ? (bocaAbierta
                    ? 'Vemos tu boca abierta. Mirá de frente para completar el gesto.'
                    : 'Separá un poco más los labios, como al decir «A».') : this.ayudaGesto());
        if (progreso === 100)
            await this.completeAction();
    }
    evidenciaActualValida(final = false) {
        const result = this.ultimaDeteccion;
        if (!result || performance.now() - this.ultimaDeteccionEn > 400 || evaluarEncuadre(result.faceLandmarks))
            return false;
        const pose = this.calculateHeadPose(result.faceLandmarks[0]);
        const blendshapes = result.faceBlendshapes[0];
        if (!pose || !blendshapes)
            return false;
        const scores = new Map(blendshapes.categories.map(({ categoryName, score }) => [categoryName, score]));
        return final ? this.isCentered(pose) && bocaEnReposo(medirAperturaBoca(result.faceLandmarks[0], this.cameraAspectRatio()), this.aperturaNeutral, scores.get('jawOpen') ?? 0) :
            this.isActionDetected(this.instruccionActual()?.type ?? null, pose, scores, medirAperturaBoca(result.faceLandmarks[0], this.cameraAspectRatio()));
    }
    async completeAction() {
        if (this.busyFrame)
            return;
        this.busyFrame = true;
        this.procesando.set(true);
        try {
            const fotogramas = [];
            for (let frame = 0; frame < FRAMES_POR_ACCION; frame++) {
                if (this.destroyed || !this.evidenciaActualValida()) {
                    this.posicionEstable.reiniciar();
                    this.progresoGesto.set(0);
                    this.estadoEnVivo.set('adjust');
                    this.feedback.set('Mantené el gesto un poco más para tomar una foto clara.');
                    return;
                }
                fotogramas.push(await this.captureFrame(`movimiento-${this.indiceInstruccion() + 1}-${frame + 1}.jpg`));
                if (frame < FRAMES_POR_ACCION - 1) {
                    await new Promise((resolve) => window.setTimeout(resolve, ESPERA_ENTRE_FRAMES_MS));
                }
            }
            if (this.destroyed)
                return;
            this.actionPhotos.push(fotogramas);
            this.posicionEstable.reiniciar();
            this.progresoGesto.set(0);
            this.estadoEnVivo.set('waiting');
            this.feedback.set('Gesto capturado. Volvé a mirar al centro.');
            if (this.indiceInstruccion() === this.instrucciones().length - 1) {
                this.fase.set('centering');
                this.progresoCapturaFinal.set(0);
                this.mensaje.set('Movimientos capturados. Falta la foto final y la comprobación.');
            }
            else {
                this.fase.set('recentering');
                this.mensaje.set('Gesto capturado. Volvé a mirar al centro.');
            }
        }
        finally {
            this.busyFrame = false;
            this.procesando.set(false);
        }
    }
    async finalizeLiveness() {
        if (this.busyFrame || !this.frente || !this.dorso || !this.neutralPhoto)
            return;
        this.busyFrame = true;
        this.fase.set('capturing');
        this.procesando.set(true);
        this.progresoCapturaFinal.set(100);
        this.mensaje.set('¡Perfecto! Vamos a sacar la foto. Mantené la mirada en la cámara…');
        try {
            // Breve aviso visual sin hacer esperar innecesariamente a la persona.
            await new Promise((resolve) => window.setTimeout(resolve, CAPTURE_NOTICE_MS));
            if (this.destroyed)
                return;
            if (!this.evidenciaActualValida(true)) {
                this.fase.set('centering');
                this.posicionEstable.reiniciar();
                this.progresoCapturaFinal.set(0);
                this.feedback.set('Mirá de frente un momento más. La foto se toma automáticamente.');
                return;
            }
            this.livePhoto = await this.captureFrame(`rostro-en-vivo-${Date.now()}.jpg`);
            if (this.destroyed)
                return;
            this.stopCamera();
            this.cameraReady.set(false);
            this.fase.set('validating');
            this.mensaje.set('Foto tomada. Estamos comprobando la prueba de vida…');
            const response = await firstValueFrom(this.facialService.validarVitalidad(this.challengeToken, this.neutralPhoto, this.actionPhotos, this.livePhoto).pipe(takeUntilDestroyed(this.destroyRef)));
            if (this.destroyed)
                return;
            if (response.valid !== true || !response.verificationToken)
                throw new Error('El servidor no confirmó la prueba. Intentá nuevamente.');
            this.verificationToken = response.verificationToken;
            this.verificationExpiraEn = this.expiracionDelToken(response.verificationToken) ?? Date.now() + 5 * 60 * 1000;
            this.fase.set('complete');
            this.paso.set('complete');
            this.estadoEnVivo.set('confirmed');
            this.mensaje.set('El servidor confirmó tu prueba de vida. Ya podés enviar la documentación.');
            this.detenerContador();
            this.segundosRestantes.set(0);
            this.stopCamera();
        }
        catch (error) {
            if (this.destroyed)
                return;
            this.fase.set('error');
            this.showError(this.errorText(error));
            // La cámara queda apagada. Se enciende recién cuando el usuario pulsa
            // "Cambiar gestos", para que el fallo no se confunda con una cámara activa.
            this.stopCamera();
            this.cameraReady.set(false);
        }
        finally {
            this.procesando.set(false);
            this.busyFrame = false;
        }
    }
    aplicarDesafio(challenge) {
        this.challengeToken = challenge.challengeToken;
        this.instrucciones.set(challenge.instructions);
        this.limpiarEstadoVitalidad();
        this.iniciarContador(challenge);
    }
    /** Deja la prueba de vida lista para empezar de cero sin tocar las fotos del DNI. */
    limpiarEstadoVitalidad() {
        this.posicionEstable.reiniciar();
        this.progresoGesto.set(0);
        this.estadoEnVivo.set('waiting');
        this.feedback.set('Mirá de frente para comenzar.');
        this.ultimaDeteccion = null;
        this.verificationToken = '';
        this.neutralPhoto = null;
        this.livePhoto = null;
        this.actionPhotos = [];
        this.neutralPose = null;
        this.aperturaNeutral = null;
        this.sumaApertura = this.muestrasApertura = 0;
        this.calibrationYaw = 0;
        this.calibrationRoll = 0;
        this.calibrationCount = 0;
        this.progresoCapturaFinal.set(0);
        this.indiceInstruccion.set(0);
    }
    async asegurarCamaraYModelo() {
        if (!this.faceLandmarker)
            await this.initializeFaceLandmarker();
        if (!this.cameraReady())
            await this.startCamera('user');
    }
    iniciarContador(challenge) {
        this.detenerContador();
        this.challengeExpiraEn =
            this.expiracionDelToken(challenge.challengeToken) ??
                Date.now() + challenge.expiresInSeconds * 1000;
        this.actualizarContador();
        this.temporizadorChallenge = window.setInterval(() => this.actualizarContador(), 1000);
    }
    actualizarContador() {
        const restantes = Math.max(0, Math.ceil((this.challengeExpiraEn - Date.now()) / 1000));
        this.segundosRestantes.set(restantes);
        if (restantes <= 0) {
            this.detenerContador();
            if (!['complete', 'validating', 'capturing', 'idle', 'error'].includes(this.fase())) {
                this.fase.set('error');
                this.stopCamera();
                this.showError('Se terminó el tiempo de la prueba. Reintentá los movimientos; las fotos del DNI se conservan.');
            }
        }
    }
    detenerContador() {
        if (this.temporizadorChallenge !== null) {
            window.clearInterval(this.temporizadorChallenge);
            this.temporizadorChallenge = null;
        }
    }
    /** Lee el `exp` del JWT del desafío para mostrar el tiempo real restante. */
    expiracionDelToken(token) {
        try {
            const payload = token.split('.')[1];
            if (!payload)
                return null;
            const normalizado = payload.replace(/-/g, '+').replace(/_/g, '/');
            const conPadding = normalizado.padEnd(Math.ceil(normalizado.length / 4) * 4, '=');
            const json = JSON.parse(atob(conPadding));
            return typeof json.exp === 'number' ? json.exp * 1000 : null;
        }
        catch {
            return null;
        }
    }
    isActionDetected(action, pose, scores, apertura = null) {
        return detectarGesto(action, pose, this.neutralPose, scores.get('jawOpen') ?? 0, apertura, this.aperturaNeutral);
    }
    isCentered(pose) {
        return !!this.neutralPose &&
            Math.abs(pose.yaw - this.neutralPose.yaw) <= 0.045 &&
            Math.abs(pose.roll - this.neutralPose.roll) <= 0.1;
    }
    calculateHeadPose(landmarks) {
        const nose = landmarks[1];
        const leftSide = landmarks[234];
        const rightSide = landmarks[454];
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];
        if (!nose || !leftSide || !rightSide || !leftEye || !rightEye)
            return null;
        const width = Math.abs(rightSide.x - leftSide.x);
        if (width < 0.01)
            return null;
        return {
            yaw: (nose.x - (leftSide.x + rightSide.x) / 2) / width,
            roll: Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x),
        };
    }
    drawDocumentGuide(context) {
        const { width, height } = context.canvas;
        const boxWidth = width * 0.72;
        const boxHeight = boxWidth / 1.586;
        context.strokeStyle = '#ff9800';
        context.lineWidth = Math.max(4, width / 150);
        context.setLineDash([14, 9]);
        context.strokeRect((width - boxWidth) / 2, (height - boxHeight) / 2, boxWidth, boxHeight);
        context.setLineDash([]);
    }
    resizeOverlay() {
        const video = this.videoRef.nativeElement;
        const canvas = this.overlayRef.nativeElement;
        if (video.videoWidth && (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight)) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }
    }
    async captureFrame(name) {
        const video = this.videoRef.nativeElement;
        const canvas = this.captureRef.nativeElement;
        if (!video.videoWidth || !video.videoHeight)
            throw new Error('La cámara todavía no está lista.');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (!context)
            throw new Error('No se pudo capturar la imagen.');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
        if (!blob)
            throw new Error('No se pudo generar la foto.');
        return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
    }
    setPreview(target, file) {
        this.revokePreview(target());
        target.set(URL.createObjectURL(file));
    }
    revokePreview(url) {
        if (url)
            URL.revokeObjectURL(url);
    }
    limpiarFotoPendiente() {
        this.fotoPendiente = null;
        this.revokePreview(this.fotoPendientePreview());
        this.fotoPendientePreview.set('');
    }
    showError(message) {
        if (this.destroyed)
            return;
        this.error.set(message);
        this.mensaje.set('No se pudo completar la verificación.');
        this.fallo.emit(message);
    }
    errorText(error) {
        return error instanceof Error ? error.message : String(error);
    }
    static ɵfac = function CapturaIdentidadComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CapturaIdentidadComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CapturaIdentidadComponent, selectors: [["app-captura-identidad"]], viewQuery: function CapturaIdentidadComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuery(_c0, 7)(_c1, 7)(_c2, 7)(_c3, 7);
        } if (rf & 2) {
            let _t;
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.dialogRef = _t.first);
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.videoRef = _t.first);
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.overlayRef = _t.first);
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.captureRef = _t.first);
        } }, outputs: { pruebaVidaCompletada: "pruebaVidaCompletada", fallo: "fallo", reintento: "reintento", cerrar: "cerrar" }, decls: 54, vars: 36, consts: [["dialog", ""], ["video", ""], ["overlay", ""], ["capture", ""], ["rostroGuia", ""], ["aria-labelledby", "identity-title", "aria-describedby", "identity-description", 1, "identity-dialog", 3, "cancel"], [1, "dialog-header"], [1, "eyebrow"], ["id", "identity-title"], ["id", "identity-description"], ["type", "button", "aria-label", "Cerrar verificaci\u00F3n y apagar la c\u00E1mara", "autofocus", "", 1, "close-dialog", 3, "click"], ["aria-label", "Pasos de la captura", 1, "capture-progress"], [1, "dialog-body"], [1, "capture-layout"], [1, "camera-column"], [1, "document-step"], [1, "camera-shell", 3, "hidden"], ["autoplay", "", "muted", "", "playsinline", ""], [3, "ngTemplateOutlet", "ngTemplateOutletContext"], [1, "camera-label"], ["role", "status", 1, "camera-placeholder"], [1, "photo-review"], ["hidden", ""], [1, "document-hint"], [1, "gesture-panel"], ["role", "status", 1, "result", "result--success"], ["role", "alert", 1, "result", "result--error"], [1, "capture-actions"], ["type", "button", 1, "acct-btn", "acct-btn--primary"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", 3, "disabled"], ["type", "button", 1, "text-button", 3, "click"], ["aria-hidden", "true", 1, "spinner"], [3, "src", "alt"], ["role", "status", "aria-live", "polite", 1, "live-feedback"], ["aria-hidden", "true"], ["role", "progressbar", "aria-label", "Tiempo manteniendo la posici\u00F3n", "aria-valuemin", "0", "aria-valuemax", "100", 1, "capture-meter"], [1, "meter-label"], [1, "challenge-list"], [3, "done"], [1, "challenge-timer"], ["type", "button", 1, "text-button", 3, "disabled"], ["aria-hidden", "true", 1, "gesture-visual"], ["type", "button", 1, "text-button", 3, "click", "disabled"], ["aria-hidden", "true", 1, "result-icon"], ["type", "button", 1, "acct-btn", "acct-btn--primary", 3, "disabled"], ["type", "button", 1, "acct-btn", "acct-btn--primary", 3, "click", "disabled"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", 3, "click", "disabled"], ["type", "button", 1, "acct-btn", "acct-btn--primary", 3, "click"], ["viewBox", "0 0 120 150", "aria-hidden", "true", "focusable", "false", 1, "face-guide"], [1, "face-guide__head"], ["cx", "60", "cy", "72", "r", "44", 1, "face-guide__head-shape"], [1, "face-guide__features"], ["cx", "46", "cy", "62", "r", "4.5", 1, "face-guide__eye", "face-guide__eye--left"], ["cx", "74", "cy", "62", "r", "4.5", 1, "face-guide__eye", "face-guide__eye--right"], ["d", "M44 92 q16 12 32 0", 1, "face-guide__mouth"], ["cx", "60", "cy", "94", "rx", "11", "ry", "9", 1, "face-guide__mouth-open"]], template: function CapturaIdentidadComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "dialog", 5, 0);
            i0.ɵɵlistener("cancel", function CapturaIdentidadComponent_Template_dialog_cancel_0_listener($event) { return ctx.cancelar($event); });
            i0.ɵɵelementStart(2, "header", 6)(3, "div")(4, "p", 7);
            i0.ɵɵtext(5, "Verificaci\u00F3n de identidad");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "h2", 8);
            i0.ɵɵtext(7);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "p", 9);
            i0.ɵɵtext(9, "Segu\u00ED un paso a la vez. Te vamos indicando c\u00F3mo hacerlo.");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(10, "button", 10);
            i0.ɵɵlistener("click", function CapturaIdentidadComponent_Template_button_click_10_listener() { return ctx.cancelar(); });
            i0.ɵɵtext(11, "\u00D7");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(12, "ol", 11)(13, "li")(14, "span");
            i0.ɵɵtext(15);
            i0.ɵɵelementEnd();
            i0.ɵɵtext(16, " DNI frente");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(17, "li")(18, "span");
            i0.ɵɵtext(19);
            i0.ɵɵelementEnd();
            i0.ɵɵtext(20, " DNI dorso");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(21, "li")(22, "span");
            i0.ɵɵtext(23);
            i0.ɵɵelementEnd();
            i0.ɵɵtext(24, " Prueba de vida");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(25, "div", 12)(26, "div", 13)(27, "div", 14);
            i0.ɵɵconditionalCreate(28, CapturaIdentidadComponent_Conditional_28_Template, 2, 1, "p", 15);
            i0.ɵɵelementStart(29, "div", 16);
            i0.ɵɵelement(30, "video", 17, 1)(32, "canvas", null, 2);
            i0.ɵɵconditionalCreate(34, CapturaIdentidadComponent_Conditional_34_Template, 1, 5, "ng-container", 18);
            i0.ɵɵconditionalCreate(35, CapturaIdentidadComponent_Conditional_35_Template, 2, 0, "span", 19);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(36, CapturaIdentidadComponent_Conditional_36_Template, 6, 2, "div", 20);
            i0.ɵɵconditionalCreate(37, CapturaIdentidadComponent_Conditional_37_Template, 4, 3, "figure", 21);
            i0.ɵɵelement(38, "canvas", 22, 3);
            i0.ɵɵconditionalCreate(40, CapturaIdentidadComponent_Conditional_40_Template, 2, 0, "p", 23);
            i0.ɵɵconditionalCreate(41, CapturaIdentidadComponent_Conditional_41_Template, 9, 10);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(42, CapturaIdentidadComponent_Conditional_42_Template, 13, 4, "aside", 24);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(43, CapturaIdentidadComponent_Conditional_43_Template, 9, 1, "div", 25);
            i0.ɵɵconditionalCreate(44, CapturaIdentidadComponent_Conditional_44_Template, 7, 3, "div", 26);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(45, "footer", 27);
            i0.ɵɵconditionalCreate(46, CapturaIdentidadComponent_Conditional_46_Template, 3, 3);
            i0.ɵɵconditionalCreate(47, CapturaIdentidadComponent_Conditional_47_Template, 4, 2);
            i0.ɵɵconditionalCreate(48, CapturaIdentidadComponent_Conditional_48_Template, 2, 0, "button", 28);
            i0.ɵɵconditionalCreate(49, CapturaIdentidadComponent_Conditional_49_Template, 2, 1, "button", 29);
            i0.ɵɵelementStart(50, "button", 30);
            i0.ɵɵlistener("click", function CapturaIdentidadComponent_Template_button_click_50_listener() { return ctx.cancelar(); });
            i0.ɵɵtext(51, "Continuar m\u00E1s tarde");
            i0.ɵɵelementEnd()()();
            i0.ɵɵtemplate(52, CapturaIdentidadComponent_ng_template_52_Template, 8, 5, "ng-template", null, 4, i0.ɵɵtemplateRefExtractor);
        } if (rf & 2) {
            let tmp_24_0;
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate(ctx.tituloPaso());
            i0.ɵɵadvance(6);
            i0.ɵɵclassProp("done", ctx.frentePreview());
            i0.ɵɵattribute("aria-current", ctx.paso() === "dni_frente" ? "step" : null);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.frentePreview() ? "\u2713" : "1");
            i0.ɵɵadvance(2);
            i0.ɵɵclassProp("done", ctx.dorsoPreview());
            i0.ɵɵattribute("aria-current", ctx.paso() === "dni_dorso" ? "step" : null);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.dorsoPreview() ? "\u2713" : "2");
            i0.ɵɵadvance(2);
            i0.ɵɵclassProp("done", ctx.fase() === "complete");
            i0.ɵɵattribute("aria-current", ctx.paso() === "liveness" ? "step" : null);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.fase() === "complete" ? "\u2713" : "3");
            i0.ɵɵadvance(3);
            i0.ɵɵclassProp("capture-layout--face", ctx.paso() === "liveness");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.paso() === "dni_frente" || ctx.paso() === "dni_dorso" ? 28 : -1);
            i0.ɵɵadvance();
            i0.ɵɵstyleProp("aspect-ratio", ctx.cameraAspectRatio())("--%NS%camera-ratio", ctx.cameraAspectRatio());
            i0.ɵɵproperty("hidden", ctx.paso() === "complete" || !!ctx.fotoPendientePreview() || !ctx.cameraReady());
            i0.ɵɵadvance();
            i0.ɵɵclassProp("mirrored", ctx.paso() === "liveness");
            i0.ɵɵadvance(4);
            i0.ɵɵconditional(ctx.paso() === "liveness" && ctx.cameraReady() && ctx.fase() !== "validating" && ctx.fase() !== "complete" && ctx.fase() !== "error" ? 34 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.paso() === "liveness" ? 35 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.cameraReady() && !ctx.fotoPendientePreview() && ctx.fase() !== "complete" && ctx.fase() !== "error" ? 36 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_24_0 = ctx.fotoPendientePreview()) ? 37 : -1, tmp_24_0);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.paso() === "dni_frente" || ctx.paso() === "dni_dorso" ? 40 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.paso() === "liveness" && ctx.cameraReady() && ctx.fase() !== "error" ? 41 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.paso() === "liveness" && ctx.instrucciones().length ? 42 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.fase() === "complete" ? 43 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.error() ? 44 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional((ctx.paso() === "dni_frente" || ctx.paso() === "dni_dorso") && !ctx.fotoPendientePreview() ? 46 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.fotoPendientePreview() ? 47 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.fase() === "complete" ? 48 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.fase() !== "complete" ? 49 : -1);
        } }, dependencies: [NgTemplateOutlet], styles: ["[_nghost-%COMP%] { display: contents; }\r\n.identity-dialog[_ngcontent-%COMP%] { position: fixed; inset: 0; margin: auto; width: min(960px, calc(100vw - 40px)); height: min(660px, calc(100dvh - 40px)); max-width: none; max-height: calc(100dvh - 40px); padding: 0; border: 0; border-radius: 20px; background: #fff; color: #102a3a; box-shadow: 0 24px 90px #0005; overflow: hidden; overscroll-behavior: contain; }\r\n.identity-dialog[open][_ngcontent-%COMP%] { display: grid; grid-template-rows: auto auto minmax(0, 1fr) auto; }\r\n.identity-dialog[_ngcontent-%COMP%]::backdrop { background: #101828b8; backdrop-filter: blur(5px); }\r\n.dialog-header[_ngcontent-%COMP%] { display: flex; justify-content: space-between; align-items: start; gap: 16px; padding: 18px 22px 12px; }\r\nh2[_ngcontent-%COMP%] { margin: 4px 0 8px; font-size: clamp(1.3rem, 3vw, 1.8rem); line-height: 1.2; }\r\n.dialog-header[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]:last-child { margin: 0; color: #667085; font-size: .9rem; }\r\n.eyebrow[_ngcontent-%COMP%] { margin: 0; color: #b54708; font-size: .7rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }\r\n.close-dialog[_ngcontent-%COMP%] { flex-shrink: 0; display: grid; place-items: center; width: 40px; height: 40px; border: 1px solid #e4e7ec; border-radius: 50%; color: #344054; background: #f9fafb; font-size: 1.6rem; cursor: pointer; }\r\n.capture-progress[_ngcontent-%COMP%] { display: flex; list-style: none; gap: 12px; padding: 0 22px 12px; margin: 0; border-bottom: 1px solid #eaecf0; }\r\n.capture-progress[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 7px; color: #667085; font-size: .8rem; }\r\n.capture-progress[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { display: grid; place-items: center; width: 25px; height: 25px; border-radius: 50%; background: #f2f4f7; font-weight: 800; }\r\n.capture-progress[_ngcontent-%COMP%]   li[aria-current][_ngcontent-%COMP%] { color: #b54708; font-weight: 800; }\r\n.capture-progress[_ngcontent-%COMP%]   li[aria-current][_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { background: #fff4e5; }\r\n.capture-progress[_ngcontent-%COMP%]   .done[_ngcontent-%COMP%] { color: #15803d; }\r\n.capture-progress[_ngcontent-%COMP%]   .done[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { background: #dcfce7; }\r\n.dialog-body[_ngcontent-%COMP%] { min-height: 0; overflow: auto; padding: 16px 22px; overscroll-behavior: contain; }\r\n.capture-layout[_ngcontent-%COMP%] { display: grid; gap: 18px; }\r\n.capture-layout--face[_ngcontent-%COMP%] { grid-template-columns: minmax(0, 1.7fr) minmax(230px, 1fr); align-items: start; }\r\n.camera-column[_ngcontent-%COMP%] { min-width: 0; }\r\n.camera-shell[_ngcontent-%COMP%] { position: relative; width: min(100%, 660px, calc(36dvh * var(--%NS%camera-ratio, 1.3333))); margin-inline: auto; overflow: hidden; border-radius: 14px; background: #101820; aspect-ratio: 4 / 3; }\r\n.camera-shell[hidden][_ngcontent-%COMP%] { display: none; }\r\n.camera-shell[_ngcontent-%COMP%]   video[_ngcontent-%COMP%] { display: block; width: 100%; height: 100%; object-fit: contain; }\r\n.camera-shell[_ngcontent-%COMP%]   video.mirrored[_ngcontent-%COMP%] { transform: scaleX(-1); }\r\n.camera-shell[_ngcontent-%COMP%]   canvas[_ngcontent-%COMP%] { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }\r\n.camera-label[_ngcontent-%COMP%] { position: absolute; bottom: 9px; left: 12px; padding: 4px 8px; border-radius: 5px; background: #101828b8; color: white; font-size: .7rem; }\r\n.camera-placeholder[_ngcontent-%COMP%] { min-height: 200px; display: grid; place-content: center; justify-items: center; gap: 12px; padding: 24px; border-radius: 14px; background: #f2f4f7; text-align: center; }\r\n.camera-placeholder[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; max-width: 360px; color: #667085; }\r\n.spinner[_ngcontent-%COMP%] { width: 34px; height: 34px; border: 3px solid #d0d5dd; border-top-color: #e14414; border-radius: 50%; animation: _ngcontent-%COMP%_spin .8s linear infinite; }\r\n@keyframes _ngcontent-%COMP%_spin { to { transform: rotate(360deg); } }\r\n.photo-review[_ngcontent-%COMP%] { margin: 0; border-radius: 14px; overflow: hidden; background: #101820; }\r\n.photo-review[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] { display: block; width: 100%; max-height: 45dvh; object-fit: contain; }\r\n.photo-review[_ngcontent-%COMP%]   figcaption[_ngcontent-%COMP%] { padding: 12px; background: #fff4e5; color: #92400e; text-align: center; font-weight: 700; }\r\n.document-step[_ngcontent-%COMP%] { margin: 0 0 8px; color: #b54708; text-align: center; font-size: .78rem; font-weight: 800; letter-spacing: .08em; }\r\n.document-hint[_ngcontent-%COMP%] { margin: 12px 0 0; text-align: center; font-size: .9rem; line-height: 1.5; color: #667085; }\r\n.live-feedback[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 10px; min-height: 62px; margin-top: 12px; padding: 12px; border: 1px solid #d0d5dd; border-radius: 10px; background: #f9fafb; }\r\n.live-feedback[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; font-size: .88rem; font-weight: 700; line-height: 1.4; }\r\n.live-feedback--ok[_ngcontent-%COMP%] { color: #166534; background: #f0fdf4; border-color: #86efac; }\r\n.live-feedback--adjust[_ngcontent-%COMP%] { color: #92400e; background: #fffbeb; border-color: #fcd34d; }\r\n.capture-meter[_ngcontent-%COMP%] { height: 7px; overflow: hidden; margin-top: 12px; border-radius: 999px; background: #e4e7ec; }\r\n.capture-meter[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { display: block; height: 100%; background: #16a34a; transition: width 100ms linear; }\r\n.meter-label[_ngcontent-%COMP%] { margin: 6px 0 0; color: #667085; font-size: .73rem; }\r\n.gesture-panel[_ngcontent-%COMP%] { padding: 18px; border: 1px solid #eaecf0; border-radius: 14px; background: #fafbfc; }\r\n.gesture-panel[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] { margin: 10px 0 8px; font-size: 1.05rem; }\r\n.gesture-panel[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { line-height: 1.45; font-size: .85rem; }\r\n.gesture-visual[_ngcontent-%COMP%] { display: flex; justify-content: center; padding: .35rem 0; color: #c2410c; }\r\n.gesture-visual[_ngcontent-%COMP%]   .face-guide[_ngcontent-%COMP%] { width: 108px; height: auto; }\r\n\r\n.face-guide[_ngcontent-%COMP%] { display: block; color: #ff9800; opacity: .78; }\r\n.face-guide.is-detected[_ngcontent-%COMP%] { color: #22c55e; opacity: .92; }\r\n.face-guide__head-shape[_ngcontent-%COMP%], \r\n.face-guide__mouth[_ngcontent-%COMP%], \r\n.face-guide__mouth-open[_ngcontent-%COMP%] { fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }\r\n.face-guide__eye[_ngcontent-%COMP%] { fill: currentColor; stroke: none; }\r\n.face-guide__head[_ngcontent-%COMP%] { transform-box: fill-box; transform-origin: center; transition: transform .2s ease; }\r\n.face-guide__features[_ngcontent-%COMP%] { transform-box: fill-box; transform-origin: center; transition: transform .2s ease; }\r\n.face-guide__mouth-open[_ngcontent-%COMP%] { display: none; }\r\n.face-guide[data-gesture=\"TURN_LEFT\"][_ngcontent-%COMP%]   .face-guide__features[_ngcontent-%COMP%] { transform: translateX(-8px); }\r\n.face-guide[data-gesture=\"TURN_RIGHT\"][_ngcontent-%COMP%]   .face-guide__features[_ngcontent-%COMP%] { transform: translateX(8px); }\r\n.face-guide[data-gesture=\"TURN_LEFT\"][_ngcontent-%COMP%]   .face-guide__eye--right[_ngcontent-%COMP%] { opacity: .4; }\r\n.face-guide[data-gesture=\"TURN_RIGHT\"][_ngcontent-%COMP%]   .face-guide__eye--left[_ngcontent-%COMP%] { opacity: .4; }\r\n.face-guide[data-gesture=\"TILT_HEAD\"][_ngcontent-%COMP%]   .face-guide__head[_ngcontent-%COMP%] { transform: rotate(10deg); }\r\n.face-guide[data-gesture=\"OPEN_MOUTH\"][_ngcontent-%COMP%]   .face-guide__mouth[_ngcontent-%COMP%] { display: none; }\r\n.face-guide[data-gesture=\"OPEN_MOUTH\"][_ngcontent-%COMP%]   .face-guide__mouth-open[_ngcontent-%COMP%] { display: block; }\r\n.face-guide--overlay[_ngcontent-%COMP%] {\r\n  position: absolute;\r\n  left: 50%;\r\n  top: 53%;\r\n  width: 46%;\r\n  height: auto;\r\n  aspect-ratio: 4 / 5;\r\n  transform: translate(-50%, -50%);\r\n  pointer-events: none;\r\n  z-index: 1;\r\n  opacity: .58;\r\n}\r\n.face-guide--overlay.is-detected[_ngcontent-%COMP%] { opacity: .85; }\r\n.challenge-list[_ngcontent-%COMP%] { display: flex; gap: 8px; list-style: none; margin: 14px 0; padding: 0; color: #667085; font-size: .8rem; }\r\n.challenge-list[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; background: #eaecf0; }\r\n.challenge-list[_ngcontent-%COMP%]   li[aria-current][_ngcontent-%COMP%] { color: #9a3412; background: #ffedd5; font-weight: 800; }\r\n.challenge-list[_ngcontent-%COMP%]   .done[_ngcontent-%COMP%] { color: #15803d; background: #dcfce7; }\r\n.explanation[_ngcontent-%COMP%] { color: #667085; }\r\n.challenge-timer[_ngcontent-%COMP%] { color: #667085; }\r\n.text-button[_ngcontent-%COMP%] { border: 0; background: transparent; color: #344054; font: inherit; font-size: .85rem; text-decoration: underline; cursor: pointer; }\r\n.text-button[_ngcontent-%COMP%]:disabled { opacity: .5; cursor: wait; }\r\n.result[_ngcontent-%COMP%] { padding: 20px; border: 1px solid; border-radius: 14px; }\r\n.result[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] { margin: 0 0 8px; }\r\n.result[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 8px 0 0; line-height: 1.5; }\r\n.result--success[_ngcontent-%COMP%] { text-align: center; background: #f0fdf4; border-color: #86efac; color: #166534; }\r\n.result-icon[_ngcontent-%COMP%] { display: grid; place-items: center; width: 60px; height: 60px; margin: 0 auto 14px; border-radius: 50%; background: #16a34a; color: white; font-size: 2rem; }\r\n.result--error[_ngcontent-%COMP%] { margin-top: 18px; background: #fef2f2; border-color: #fecaca; color: #991b1b; }\r\n.capture-actions[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; justify-content: end; gap: 10px; padding: 14px 22px; border-top: 1px solid #eaecf0; background: white; }\r\nbutton[_ngcontent-%COMP%]:focus-visible { outline: 3px solid #175cd3; outline-offset: 3px; }\r\n@media (max-width: 700px) { .identity-dialog[_ngcontent-%COMP%] { width: calc(100vw - 16px); max-height: calc(100dvh - 16px); border-radius: 14px; }.dialog-header[_ngcontent-%COMP%] { padding: 18px 16px 14px; }.dialog-body[_ngcontent-%COMP%] { padding: 16px; }.capture-progress[_ngcontent-%COMP%] { padding: 0 16px 14px; gap: 8px; justify-content: space-between; }.capture-progress[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] { font-size: .7rem; }.capture-progress[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { width: 21px; height: 21px; }.capture-layout--face[_ngcontent-%COMP%] { grid-template-columns: 1fr; }.gesture-panel[_ngcontent-%COMP%] { padding: 14px; }.gesture-visual[_ngcontent-%COMP%]   .face-guide[_ngcontent-%COMP%] { width: 88px; }.capture-actions[_ngcontent-%COMP%] { padding: 14px 16px; justify-content: center; }.capture-actions[_ngcontent-%COMP%]   .acct-btn[_ngcontent-%COMP%] { flex: 1; } }\r\n@media (prefers-reduced-motion: reduce) { .spinner[_ngcontent-%COMP%] { animation-duration: 2s; }.capture-meter[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { transition: none; } }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CapturaIdentidadComponent, [{
        type: Component,
        args: [{ selector: 'app-captura-identidad', standalone: true, imports: [NgTemplateOutlet], template: "<dialog #dialog class=\"identity-dialog\" aria-labelledby=\"identity-title\" aria-describedby=\"identity-description\" (cancel)=\"cancelar($event)\">\r\n  <header class=\"dialog-header\">\r\n    <div>\r\n      <p class=\"eyebrow\">Verificaci\u00F3n de identidad</p>\r\n      <h2 id=\"identity-title\">{{ tituloPaso() }}</h2>\r\n      <p id=\"identity-description\">Segu\u00ED un paso a la vez. Te vamos indicando c\u00F3mo hacerlo.</p>\r\n    </div>\r\n    <button type=\"button\" class=\"close-dialog\" aria-label=\"Cerrar verificaci\u00F3n y apagar la c\u00E1mara\" (click)=\"cancelar()\" autofocus>\u00D7</button>\r\n  </header>\r\n  <ol class=\"capture-progress\" aria-label=\"Pasos de la captura\">\r\n    <li [class.done]=\"frentePreview()\" [attr.aria-current]=\"paso() === 'dni_frente' ? 'step' : null\"><span>{{ frentePreview() ? '\u2713' : '1' }}</span> DNI frente</li>\r\n    <li [class.done]=\"dorsoPreview()\" [attr.aria-current]=\"paso() === 'dni_dorso' ? 'step' : null\"><span>{{ dorsoPreview() ? '\u2713' : '2' }}</span> DNI dorso</li>\r\n    <li [class.done]=\"fase() === 'complete'\" [attr.aria-current]=\"paso() === 'liveness' ? 'step' : null\"><span>{{ fase() === 'complete' ? '\u2713' : '3' }}</span> Prueba de vida</li>\r\n  </ol>\r\n  <div class=\"dialog-body\">\r\n    <div class=\"capture-layout\" [class.capture-layout--face]=\"paso() === 'liveness'\">\r\n      <div class=\"camera-column\">\r\n        @if (paso() === 'dni_frente' || paso() === 'dni_dorso') {\r\n          <p class=\"document-step\">{{ paso() === 'dni_frente' ? 'DNI \u2014 FRENTE' : 'DNI \u2014 DORSO' }}</p>\r\n        }\r\n        <div class=\"camera-shell\" [hidden]=\"paso() === 'complete' || !!fotoPendientePreview() || !cameraReady()\" [style.aspect-ratio]=\"cameraAspectRatio()\" [style.--camera-ratio]=\"cameraAspectRatio()\">\r\n          <video #video autoplay muted playsinline [class.mirrored]=\"paso() === 'liveness'\"></video>\r\n          <canvas #overlay></canvas>\r\n          @if (paso() === 'liveness' && cameraReady() && fase() !== 'validating' && fase() !== 'complete' && fase() !== 'error') {\r\n            <ng-container [ngTemplateOutlet]=\"rostroGuia\" [ngTemplateOutletContext]=\"{ $implicit: gestoGuia(), detectado: estadoEnVivo() === 'detected', overlay: true }\" />\r\n          }\r\n          @if (paso() === 'liveness') { <span class=\"camera-label\">Tu c\u00E1mara \u00B7 vista espejo</span> }\r\n        </div>\r\n        @if (!cameraReady() && !fotoPendientePreview() && fase() !== 'complete' && fase() !== 'error') {\r\n          <div class=\"camera-placeholder\" role=\"status\">\r\n            <span class=\"spinner\" aria-hidden=\"true\"></span>\r\n            <strong>{{ fase() === 'validating' ? 'Comprobando tus movimientos\u2026' : 'Preparando la c\u00E1mara\u2026' }}</strong>\r\n            <p>{{ fase() === 'validating' ? 'Ya tomamos las fotos. Pod\u00E9s relajarte.' : 'Si el navegador te lo pide, permit\u00ED el acceso a la c\u00E1mara.' }}</p>\r\n          </div>\r\n        }\r\n        @if (fotoPendientePreview(); as preview) {\r\n          <figure class=\"photo-review\">\r\n            <img [src]=\"preview\" [alt]=\"'Foto de ' + (paso() === 'dni_frente' ? 'DNI \u2014 FRENTE' : 'DNI \u2014 DORSO') + ' para revisar'\" />\r\n            <figcaption>{{ paso() === 'dni_frente' ? 'DNI \u2014 FRENTE' : 'DNI \u2014 DORSO' }}: \u00BFse ve completo, n\u00EDtido y sin reflejos?</figcaption>\r\n          </figure>\r\n        }\r\n        <canvas #capture hidden></canvas>\r\n        @if (paso() === 'dni_frente' || paso() === 'dni_dorso') {\r\n          <p class=\"document-hint\">Apoy\u00E1 el DNI sobre una superficie lisa. Acerc\u00E1 la c\u00E1mara hasta que el documento entre en el recuadro.</p>\r\n        }\r\n        @if (paso() === 'liveness' && cameraReady() && fase() !== 'error') {\r\n          <div class=\"live-feedback\" [class.live-feedback--ok]=\"estadoEnVivo() === 'detected'\" [class.live-feedback--adjust]=\"estadoEnVivo() === 'adjust'\" role=\"status\" aria-live=\"polite\">\r\n            <span aria-hidden=\"true\">{{ estadoEnVivo() === 'detected' ? '\u2713' : '\u25C9' }}</span><p>{{ feedback() }}</p>\r\n          </div>\r\n          <div class=\"capture-meter\" role=\"progressbar\" aria-label=\"Tiempo manteniendo la posici\u00F3n\" aria-valuemin=\"0\" aria-valuemax=\"100\" [attr.aria-valuenow]=\"progresoGesto()\">\r\n            <span [style.width.%]=\"progresoGesto()\"></span>\r\n          </div>\r\n          <p class=\"meter-label\">{{ progresoGesto() > 0 ? 'Manten\u00E9 la posici\u00F3n hasta completar la barra' : 'La barra avanza cuando la posici\u00F3n es correcta' }}</p>\r\n        }\r\n      </div>\r\n      @if (paso() === 'liveness' && instrucciones().length) {\r\n        <aside class=\"gesture-panel\">\r\n          <p class=\"eyebrow\">{{ fase() === 'calibrating' ? 'Preparaci\u00F3n' : 'Movimiento ' + (indiceInstruccion() + 1) + ' de ' + instrucciones().length }}</p>\r\n          @if (fase() === 'actions' && instruccionActual(); as instruction) {\r\n            <div class=\"gesture-visual\" aria-hidden=\"true\">\r\n              <ng-container [ngTemplateOutlet]=\"rostroGuia\" [ngTemplateOutletContext]=\"{ $implicit: gestoGuia(), detectado: estadoEnVivo() === 'detected' }\" />\r\n            </div>\r\n            <h3>{{ instruction.label }}</h3><p>{{ ayudaGesto() }}</p>\r\n          } @else if (fase() === 'calibrating') {\r\n            <h3>Mir\u00E1 de frente</h3><p>Ubic\u00E1 tu cara dentro del \u00F3valo y manten\u00E9 la cabeza derecha. No hace falta tocar ning\u00FAn bot\u00F3n.</p>\r\n          } @else if (fase() === 'recentering') {\r\n            <h3>Gesto capturado \u2713</h3><p>Volv\u00E9 a mirar al centro. El pr\u00F3ximo movimiento empieza solo.</p>\r\n          } @else if (fase() === 'centering' || fase() === 'capturing') {\r\n            <h3>Ahora, de frente</h3><p>Cerr\u00E1 la boca y mir\u00E1 a la c\u00E1mara. La foto final se toma autom\u00E1ticamente.</p>\r\n          } @else if (fase() === 'validating') {\r\n            <h3>Comprobaci\u00F3n final</h3><p>Estamos verificando que las capturas correspondan a la misma persona y que los movimientos sean v\u00E1lidos.</p>\r\n          }\r\n          <ol class=\"challenge-list\">\r\n            @for (instruction of instrucciones(); track instruction.type; let index = $index) {\r\n              <li [class.done]=\"index < indiceInstruccion() || (fase() === 'recentering' && index === indiceInstruccion()) || fase() === 'centering' || fase() === 'capturing' || fase() === 'validating'\" [attr.aria-label]=\"instruction.label\" [attr.aria-current]=\"fase() === 'actions' && index === indiceInstruccion() ? 'step' : null\">\r\n                {{ index < indiceInstruccion() || (fase() === 'recentering' && index === indiceInstruccion()) || fase() === 'centering' || fase() === 'capturing' || fase() === 'validating' ? '\u2713' : index + 1 }}\r\n              </li>\r\n            }\r\n          </ol>\r\n          @if (segundosRestantes() > 0 && fase() !== 'complete') { <p class=\"challenge-timer\">Tiempo disponible: {{ tiempoRestante() }}</p> }\r\n          @if (fase() !== 'capturing' && fase() !== 'validating') {\r\n            <button type=\"button\" class=\"text-button\" (click)=\"cambiarGestos()\" [disabled]=\"cambiandoDesafio() || procesando()\">{{ cambiandoDesafio() ? 'Preparando\u2026' : fase() === 'error' ? 'Reintentar prueba de vida' : 'Probar otros movimientos' }}</button>\r\n          }\r\n        </aside>\r\n      }\r\n    </div>\r\n    @if (fase() === 'complete') {\r\n      <div class=\"result result--success\" role=\"status\"><span class=\"result-icon\" aria-hidden=\"true\">\u2713</span><h3>Prueba de vida v\u00E1lida</h3><p>{{ mensaje() }}</p><p>El DNI y la documentaci\u00F3n ser\u00E1n revisados por un administrador.</p></div>\r\n    }\r\n    @if (error()) {\r\n      <div class=\"result result--error\" role=\"alert\"><h3>No se pudo completar este intento</h3><p>{{ error() }}</p>\r\n        @if (paso() === 'liveness') { <p>Pod\u00E9s repetir los movimientos sin volver a fotografiar el DNI.</p> }\r\n        @if (paso() === 'liveness' && !instrucciones().length) { <button type=\"button\" class=\"acct-btn acct-btn--primary\" (click)=\"cambiarGestos()\" [disabled]=\"procesando() || cambiandoDesafio()\">Reintentar prueba de vida</button> }\r\n      </div>\r\n    }\r\n  </div>\r\n  <footer class=\"capture-actions\">\r\n    @if ((paso() === 'dni_frente' || paso() === 'dni_dorso') && !fotoPendientePreview()) {\r\n      <button type=\"button\" class=\"acct-btn acct-btn--primary\" (click)=\"capturarDocumento()\" [disabled]=\"!cameraReady() || procesando()\">{{ procesando() ? 'Capturando\u2026' : paso() === 'dni_frente' ? 'Sacar foto del frente' : 'Sacar foto del dorso' }}</button>\r\n      @if (puedeCambiarCamara()) { <button type=\"button\" class=\"acct-btn acct-btn--ghost\" (click)=\"cambiarCamara()\" [disabled]=\"procesando()\">Cambiar c\u00E1mara</button> }\r\n    }\r\n    @if (fotoPendientePreview()) {\r\n      <button type=\"button\" class=\"acct-btn acct-btn--primary\" (click)=\"confirmarDocumento()\" [disabled]=\"procesando()\">Usar esta foto</button>\r\n      <button type=\"button\" class=\"acct-btn acct-btn--ghost\" (click)=\"repetirDocumento()\" [disabled]=\"procesando()\">Repetir foto</button>\r\n    }\r\n    @if (fase() === 'complete') { <button type=\"button\" class=\"acct-btn acct-btn--primary\" (click)=\"enviarCapturas()\">Enviar documentaci\u00F3n</button> }\r\n    @if (fase() !== 'complete') { <button type=\"button\" class=\"acct-btn acct-btn--ghost\" (click)=\"reiniciar()\" [disabled]=\"procesando() || cambiandoDesafio()\">Volver a empezar</button> }\r\n    <button type=\"button\" class=\"text-button\" (click)=\"cancelar()\">Continuar m\u00E1s tarde</button>\r\n  </footer>\r\n</dialog>\r\n\r\n<ng-template #rostroGuia let-gesto let-detectado=\"detectado\" let-overlay=\"overlay\">\r\n  <svg class=\"face-guide\" [class.face-guide--overlay]=\"overlay\" [class.is-detected]=\"detectado\" [attr.data-gesture]=\"gesto\" viewBox=\"0 0 120 150\" aria-hidden=\"true\" focusable=\"false\">\r\n    <g class=\"face-guide__head\">\r\n      <circle class=\"face-guide__head-shape\" cx=\"60\" cy=\"72\" r=\"44\" />\r\n      <g class=\"face-guide__features\">\r\n        <circle class=\"face-guide__eye face-guide__eye--left\" cx=\"46\" cy=\"62\" r=\"4.5\" />\r\n        <circle class=\"face-guide__eye face-guide__eye--right\" cx=\"74\" cy=\"62\" r=\"4.5\" />\r\n        <path class=\"face-guide__mouth\" d=\"M44 92 q16 12 32 0\" />\r\n        <ellipse class=\"face-guide__mouth-open\" cx=\"60\" cy=\"94\" rx=\"11\" ry=\"9\" />\r\n      </g>\r\n    </g>\r\n  </svg>\r\n</ng-template>\r\n", styles: [":host { display: contents; }\r\n.identity-dialog { position: fixed; inset: 0; margin: auto; width: min(960px, calc(100vw - 40px)); height: min(660px, calc(100dvh - 40px)); max-width: none; max-height: calc(100dvh - 40px); padding: 0; border: 0; border-radius: 20px; background: #fff; color: #102a3a; box-shadow: 0 24px 90px #0005; overflow: hidden; overscroll-behavior: contain; }\r\n.identity-dialog[open] { display: grid; grid-template-rows: auto auto minmax(0, 1fr) auto; }\r\n.identity-dialog::backdrop { background: #101828b8; backdrop-filter: blur(5px); }\r\n.dialog-header { display: flex; justify-content: space-between; align-items: start; gap: 16px; padding: 18px 22px 12px; }\r\nh2 { margin: 4px 0 8px; font-size: clamp(1.3rem, 3vw, 1.8rem); line-height: 1.2; }\r\n.dialog-header p:last-child { margin: 0; color: #667085; font-size: .9rem; }\r\n.eyebrow { margin: 0; color: #b54708; font-size: .7rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }\r\n.close-dialog { flex-shrink: 0; display: grid; place-items: center; width: 40px; height: 40px; border: 1px solid #e4e7ec; border-radius: 50%; color: #344054; background: #f9fafb; font-size: 1.6rem; cursor: pointer; }\r\n.capture-progress { display: flex; list-style: none; gap: 12px; padding: 0 22px 12px; margin: 0; border-bottom: 1px solid #eaecf0; }\r\n.capture-progress li { display: flex; align-items: center; gap: 7px; color: #667085; font-size: .8rem; }\r\n.capture-progress span { display: grid; place-items: center; width: 25px; height: 25px; border-radius: 50%; background: #f2f4f7; font-weight: 800; }\r\n.capture-progress li[aria-current] { color: #b54708; font-weight: 800; }\r\n.capture-progress li[aria-current] span { background: #fff4e5; }\r\n.capture-progress .done { color: #15803d; }\r\n.capture-progress .done span { background: #dcfce7; }\r\n.dialog-body { min-height: 0; overflow: auto; padding: 16px 22px; overscroll-behavior: contain; }\r\n.capture-layout { display: grid; gap: 18px; }\r\n.capture-layout--face { grid-template-columns: minmax(0, 1.7fr) minmax(230px, 1fr); align-items: start; }\r\n.camera-column { min-width: 0; }\r\n.camera-shell { position: relative; width: min(100%, 660px, calc(36dvh * var(--camera-ratio, 1.3333))); margin-inline: auto; overflow: hidden; border-radius: 14px; background: #101820; aspect-ratio: 4 / 3; }\r\n.camera-shell[hidden] { display: none; }\r\n.camera-shell video { display: block; width: 100%; height: 100%; object-fit: contain; }\r\n.camera-shell video.mirrored { transform: scaleX(-1); }\r\n.camera-shell canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }\r\n.camera-label { position: absolute; bottom: 9px; left: 12px; padding: 4px 8px; border-radius: 5px; background: #101828b8; color: white; font-size: .7rem; }\r\n.camera-placeholder { min-height: 200px; display: grid; place-content: center; justify-items: center; gap: 12px; padding: 24px; border-radius: 14px; background: #f2f4f7; text-align: center; }\r\n.camera-placeholder p { margin: 0; max-width: 360px; color: #667085; }\r\n.spinner { width: 34px; height: 34px; border: 3px solid #d0d5dd; border-top-color: #e14414; border-radius: 50%; animation: spin .8s linear infinite; }\r\n@keyframes spin { to { transform: rotate(360deg); } }\r\n.photo-review { margin: 0; border-radius: 14px; overflow: hidden; background: #101820; }\r\n.photo-review img { display: block; width: 100%; max-height: 45dvh; object-fit: contain; }\r\n.photo-review figcaption { padding: 12px; background: #fff4e5; color: #92400e; text-align: center; font-weight: 700; }\r\n.document-step { margin: 0 0 8px; color: #b54708; text-align: center; font-size: .78rem; font-weight: 800; letter-spacing: .08em; }\r\n.document-hint { margin: 12px 0 0; text-align: center; font-size: .9rem; line-height: 1.5; color: #667085; }\r\n.live-feedback { display: flex; align-items: center; gap: 10px; min-height: 62px; margin-top: 12px; padding: 12px; border: 1px solid #d0d5dd; border-radius: 10px; background: #f9fafb; }\r\n.live-feedback p { margin: 0; font-size: .88rem; font-weight: 700; line-height: 1.4; }\r\n.live-feedback--ok { color: #166534; background: #f0fdf4; border-color: #86efac; }\r\n.live-feedback--adjust { color: #92400e; background: #fffbeb; border-color: #fcd34d; }\r\n.capture-meter { height: 7px; overflow: hidden; margin-top: 12px; border-radius: 999px; background: #e4e7ec; }\r\n.capture-meter span { display: block; height: 100%; background: #16a34a; transition: width 100ms linear; }\r\n.meter-label { margin: 6px 0 0; color: #667085; font-size: .73rem; }\r\n.gesture-panel { padding: 18px; border: 1px solid #eaecf0; border-radius: 14px; background: #fafbfc; }\r\n.gesture-panel h3 { margin: 10px 0 8px; font-size: 1.05rem; }\r\n.gesture-panel p { line-height: 1.45; font-size: .85rem; }\r\n.gesture-visual { display: flex; justify-content: center; padding: .35rem 0; color: #c2410c; }\r\n.gesture-visual .face-guide { width: 108px; height: auto; }\r\n\r\n.face-guide { display: block; color: #ff9800; opacity: .78; }\r\n.face-guide.is-detected { color: #22c55e; opacity: .92; }\r\n.face-guide__head-shape,\r\n.face-guide__mouth,\r\n.face-guide__mouth-open { fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }\r\n.face-guide__eye { fill: currentColor; stroke: none; }\r\n.face-guide__head { transform-box: fill-box; transform-origin: center; transition: transform .2s ease; }\r\n.face-guide__features { transform-box: fill-box; transform-origin: center; transition: transform .2s ease; }\r\n.face-guide__mouth-open { display: none; }\r\n.face-guide[data-gesture=\"TURN_LEFT\"] .face-guide__features { transform: translateX(-8px); }\r\n.face-guide[data-gesture=\"TURN_RIGHT\"] .face-guide__features { transform: translateX(8px); }\r\n.face-guide[data-gesture=\"TURN_LEFT\"] .face-guide__eye--right { opacity: .4; }\r\n.face-guide[data-gesture=\"TURN_RIGHT\"] .face-guide__eye--left { opacity: .4; }\r\n.face-guide[data-gesture=\"TILT_HEAD\"] .face-guide__head { transform: rotate(10deg); }\r\n.face-guide[data-gesture=\"OPEN_MOUTH\"] .face-guide__mouth { display: none; }\r\n.face-guide[data-gesture=\"OPEN_MOUTH\"] .face-guide__mouth-open { display: block; }\r\n.face-guide--overlay {\r\n  position: absolute;\r\n  left: 50%;\r\n  top: 53%;\r\n  width: 46%;\r\n  height: auto;\r\n  aspect-ratio: 4 / 5;\r\n  transform: translate(-50%, -50%);\r\n  pointer-events: none;\r\n  z-index: 1;\r\n  opacity: .58;\r\n}\r\n.face-guide--overlay.is-detected { opacity: .85; }\r\n.challenge-list { display: flex; gap: 8px; list-style: none; margin: 14px 0; padding: 0; color: #667085; font-size: .8rem; }\r\n.challenge-list li { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; background: #eaecf0; }\r\n.challenge-list li[aria-current] { color: #9a3412; background: #ffedd5; font-weight: 800; }\r\n.challenge-list .done { color: #15803d; background: #dcfce7; }\r\n.explanation { color: #667085; }\r\n.challenge-timer { color: #667085; }\r\n.text-button { border: 0; background: transparent; color: #344054; font: inherit; font-size: .85rem; text-decoration: underline; cursor: pointer; }\r\n.text-button:disabled { opacity: .5; cursor: wait; }\r\n.result { padding: 20px; border: 1px solid; border-radius: 14px; }\r\n.result h3 { margin: 0 0 8px; }\r\n.result p { margin: 8px 0 0; line-height: 1.5; }\r\n.result--success { text-align: center; background: #f0fdf4; border-color: #86efac; color: #166534; }\r\n.result-icon { display: grid; place-items: center; width: 60px; height: 60px; margin: 0 auto 14px; border-radius: 50%; background: #16a34a; color: white; font-size: 2rem; }\r\n.result--error { margin-top: 18px; background: #fef2f2; border-color: #fecaca; color: #991b1b; }\r\n.capture-actions { display: flex; flex-wrap: wrap; justify-content: end; gap: 10px; padding: 14px 22px; border-top: 1px solid #eaecf0; background: white; }\r\nbutton:focus-visible { outline: 3px solid #175cd3; outline-offset: 3px; }\r\n@media (max-width: 700px) { .identity-dialog { width: calc(100vw - 16px); max-height: calc(100dvh - 16px); border-radius: 14px; }.dialog-header { padding: 18px 16px 14px; }.dialog-body { padding: 16px; }.capture-progress { padding: 0 16px 14px; gap: 8px; justify-content: space-between; }.capture-progress li { font-size: .7rem; }.capture-progress span { width: 21px; height: 21px; }.capture-layout--face { grid-template-columns: 1fr; }.gesture-panel { padding: 14px; }.gesture-visual .face-guide { width: 88px; }.capture-actions { padding: 14px 16px; justify-content: center; }.capture-actions .acct-btn { flex: 1; } }\r\n@media (prefers-reduced-motion: reduce) { .spinner { animation-duration: 2s; }.capture-meter span { transition: none; } }\r\n"] }]
    }], null, { dialogRef: [{
            type: ViewChild,
            args: ['dialog', { static: true }]
        }], videoRef: [{
            type: ViewChild,
            args: ['video', { static: true }]
        }], overlayRef: [{
            type: ViewChild,
            args: ['overlay', { static: true }]
        }], captureRef: [{
            type: ViewChild,
            args: ['capture', { static: true }]
        }], pruebaVidaCompletada: [{
            type: Output
        }], fallo: [{
            type: Output
        }], reintento: [{
            type: Output
        }], cerrar: [{
            type: Output
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CapturaIdentidadComponent, { className: "CapturaIdentidadComponent", filePath: "src/app/features/solicitud-anunciante/captura-identidad/captura-identidad.component.ts", lineNumber: 85 }); })();
