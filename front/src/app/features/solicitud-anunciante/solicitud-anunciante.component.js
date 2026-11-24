import { NgTemplateOutlet } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideBadgeCheck, LucideClock } from '@lucide/angular';
import { PerfilService } from '../../core/services/perfil.service';
import { ToastService } from '../../core/services/toast.service';
import { ApiError } from '../../core/interceptors/api-error';
import { CatalogoService } from '../../shared/services/catalogo.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { CbuAnuncianteComponent } from '../../shared/components/cbu-anunciante/cbu-anunciante.component';
import { CargaComprobanteComponent } from '../../shared/components/carga-comprobante/carga-comprobante.component';
import { CapturaIdentidadComponent, } from './captura-identidad/captura-identidad.component';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
const _forTrack0 = ($index, $item) => $item.id;
function SolicitudAnuncianteComponent_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 5);
    i0.ɵɵelement(1, "app-spinner");
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3, "Cargando tu solicitud\u2026");
    i0.ɵɵelementEnd()();
} }
function SolicitudAnuncianteComponent_Conditional_10_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 8);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.exito());
} }
function SolicitudAnuncianteComponent_Conditional_10_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 9);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.error());
} }
function SolicitudAnuncianteComponent_Conditional_10_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-cbu-anunciante");
} }
function SolicitudAnuncianteComponent_Conditional_10_Case_17_For_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 23);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const t_r4 = ctx.$implicit;
    i0.ɵɵproperty("ngValue", t_r4.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(t_r4.nombre);
} }
function SolicitudAnuncianteComponent_Conditional_10_Case_17_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 24);
    i0.ɵɵtext(1, "Eleg\u00ED si sos propietario, inmobiliaria, etc.");
    i0.ɵɵelementEnd();
} }
function SolicitudAnuncianteComponent_Conditional_10_Case_17_Conditional_26_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 24);
    i0.ɵɵtext(1, "Ingres\u00E1 un CUIT/CUIL v\u00E1lido (11 d\u00EDgitos).");
    i0.ɵɵelementEnd();
} }
function SolicitudAnuncianteComponent_Conditional_10_Case_17_Conditional_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 28);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.errorCuit());
} }
function SolicitudAnuncianteComponent_Conditional_10_Case_17_Conditional_32_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 24);
    i0.ɵɵtext(1, "Ingres\u00E1 un tel\u00E9fono (m\u00E1ximo 20 caracteres).");
    i0.ɵɵelementEnd();
} }
function SolicitudAnuncianteComponent_Conditional_10_Case_17_Conditional_33_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 31)(1, "div", 15)(2, "h3", 34);
    i0.ɵɵtext(3, "Datos de la inmobiliaria");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p");
    i0.ɵɵtext(5, "La persona titular de la cuenta debe ser el corredor responsable.");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementContainer(6, 35);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext(3);
    const datosEmpresa_r5 = i0.ɵɵreference(12);
    i0.ɵɵadvance(6);
    i0.ɵɵproperty("ngTemplateOutlet", datosEmpresa_r5);
} }
function SolicitudAnuncianteComponent_Conditional_10_Case_17_Conditional_34_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 24);
    i0.ɵɵtext(1, "Ingres\u00E1 un CBU de 22 d\u00EDgitos.");
    i0.ɵɵelementEnd();
} }
function SolicitudAnuncianteComponent_Conditional_10_Case_17_Conditional_34_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 43);
    i0.ɵɵtext(1, "Confirm\u00E1 que sos titular de la cuenta bancaria.");
    i0.ɵɵelementEnd();
} }
function SolicitudAnuncianteComponent_Conditional_10_Case_17_Conditional_34_Conditional_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 28);
    i0.ɵɵtext(1, "Acept\u00E1 los t\u00E9rminos para continuar.");
    i0.ɵɵelementEnd();
} }
function SolicitudAnuncianteComponent_Conditional_10_Case_17_Conditional_34_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 36)(1, "div", 15)(2, "h3", 37);
    i0.ɵɵtext(3, "Cuenta bancaria para cobrar");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p");
    i0.ɵɵtext(5, "Usamos estos datos para transferirte los cobros de tus alquileres.");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "div", 18)(7, "div", 19)(8, "label", 38);
    i0.ɵɵtext(9, "CBU de la cuenta bancaria");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(10, "input", 39);
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(11, "small", 40);
    i0.ɵɵtext(12, "Es obligatorio que la cuenta bancaria est\u00E9 a nombre del mismo titular de la cuenta en DEPA. Un administrador verificar\u00E1 la titularidad del CBU antes de que puedas usarlo para cobrar.");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(13, SolicitudAnuncianteComponent_Conditional_10_Case_17_Conditional_34_Conditional_13_Template, 2, 0, "span", 24);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "label", 41);
    i0.ɵɵelement(15, "input", 42);
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(16, "span");
    i0.ɵɵtext(17, "Confirmo que la cuenta bancaria est\u00E1 a mi nombre.");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(18, SolicitudAnuncianteComponent_Conditional_10_Case_17_Conditional_34_Conditional_18_Template, 2, 0, "span", 43);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(19, "div", 44)(20, "label");
    i0.ɵɵelement(21, "input", 45);
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(22, "span");
    i0.ɵɵtext(23, "Le\u00ED y acepto los ");
    i0.ɵɵelementStart(24, "a", 46);
    i0.ɵɵtext(25, "t\u00E9rminos y condiciones para anunciantes");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(26, ".");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(27, SolicitudAnuncianteComponent_Conditional_10_Case_17_Conditional_34_Conditional_27_Template, 2, 0, "span", 28);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(10);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.form.controls.cbu.invalid && ctx_r1.form.controls.cbu.touched ? 13 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.form.controls.titularidad_declarada.invalid && ctx_r1.form.controls.titularidad_declarada.touched ? 18 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(6);
    i0.ɵɵconditional(ctx_r1.form.controls.aceptaTerminos.invalid && ctx_r1.form.controls.aceptaTerminos.touched ? 27 : -1);
} }
function SolicitudAnuncianteComponent_Conditional_10_Case_17_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 14);
    i0.ɵɵlistener("ngSubmit", function SolicitudAnuncianteComponent_Conditional_10_Case_17_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.enviarDatos()); });
    i0.ɵɵelementStart(1, "header", 15)(2, "h2");
    i0.ɵɵtext(3, "Datos del anunciante");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p");
    i0.ɵɵtext(5, "Estos datos identifican tu cuenta y permiten que un administrador valide tu perfil.");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "section", 16)(7, "div", 15)(8, "h3", 17);
    i0.ɵɵtext(9, "Datos personales y de contacto");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "p");
    i0.ɵɵtext(11, "El CUIT/CUIL debe pertenecer al titular de la cuenta.");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "div", 18)(13, "div", 19)(14, "label", 20);
    i0.ɵɵtext(15, "Tipo de anunciante");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "select", 21)(17, "option", 22);
    i0.ɵɵtext(18, "Seleccion\u00E1 una opci\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(19, SolicitudAnuncianteComponent_Conditional_10_Case_17_For_20_Template, 2, 2, "option", 23, _forTrack0);
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(21, SolicitudAnuncianteComponent_Conditional_10_Case_17_Conditional_21_Template, 2, 0, "span", 24);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "div", 25)(23, "label", 26);
    i0.ɵɵtext(24);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "input", 27);
    i0.ɵɵlistener("input", function SolicitudAnuncianteComponent_Conditional_10_Case_17_Template_input_input_25_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.errorCuit.set("")); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(26, SolicitudAnuncianteComponent_Conditional_10_Case_17_Conditional_26_Template, 2, 0, "span", 24)(27, SolicitudAnuncianteComponent_Conditional_10_Case_17_Conditional_27_Template, 2, 1, "span", 28);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(28, "div", 25)(29, "label", 29);
    i0.ɵɵtext(30, "N\u00FAmero de contacto");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(31, "input", 30);
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(32, SolicitudAnuncianteComponent_Conditional_10_Case_17_Conditional_32_Template, 2, 0, "span", 24);
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(33, SolicitudAnuncianteComponent_Conditional_10_Case_17_Conditional_33_Template, 7, 1, "section", 31);
    i0.ɵɵconditionalCreate(34, SolicitudAnuncianteComponent_Conditional_10_Case_17_Conditional_34_Template, 28, 3);
    i0.ɵɵelementStart(35, "div", 32)(36, "button", 33);
    i0.ɵɵtext(37);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("formGroup", ctx_r1.form);
    i0.ɵɵadvance(16);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngValue", 0);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.tipos());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.form.controls.idTipoAnunciante.invalid && ctx_r1.form.controls.idTipoAnunciante.touched ? 21 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.esInmobiliaria() ? "CUIT de la inmobiliaria" : "CUIT / CUIL personal");
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-invalid", !!ctx_r1.errorCuit() || null);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.form.controls.cuit.invalid && ctx_r1.form.controls.cuit.touched ? 26 : ctx_r1.errorCuit() ? 27 : -1);
    i0.ɵɵadvance(5);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.form.controls.numero_contacto.invalid && ctx_r1.form.controls.numero_contacto.touched ? 32 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.esInmobiliaria() ? 33 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!ctx_r1.solicitud() ? 34 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.enviando());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.enviando() ? "Guardando\u2026" : "Continuar", " ");
} }
function SolicitudAnuncianteComponent_Conditional_10_Case_18_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 54);
    i0.ɵɵlistener("click", function SolicitudAnuncianteComponent_Conditional_10_Case_18_Conditional_7_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.irAPaso("datos")); });
    i0.ɵɵtext(1, "\u2190 Volver a datos");
    i0.ɵɵelementEnd();
} }
function SolicitudAnuncianteComponent_Conditional_10_Case_18_Conditional_8_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "br");
    i0.ɵɵtext(1);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Motivo: ", ctx_r1.solicitud()?.motivo_rechazo, " ");
} }
function SolicitudAnuncianteComponent_Conditional_10_Case_18_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 9)(1, "strong");
    i0.ɵɵtext(2, "La verificaci\u00F3n de identidad fue rechazada.");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, SolicitudAnuncianteComponent_Conditional_10_Case_18_Conditional_8_Conditional_3_Template, 2, 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.solicitud()?.motivo_rechazo ? 3 : -1);
} }
function SolicitudAnuncianteComponent_Conditional_10_Case_18_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 50)(1, "div", 15)(2, "h3", 55);
    i0.ɵɵtext(3, "Datos de la inmobiliaria y del corredor");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p");
    i0.ɵɵtext(5, "Revis\u00E1 que coincidan con la documentaci\u00F3n que vas a adjuntar.");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "dl", 56)(7, "div")(8, "dt");
    i0.ɵɵtext(9, "Nombre o raz\u00F3n social");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "dd");
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "div")(13, "dt");
    i0.ɵɵtext(14, "Matr\u00EDcula del corredor");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "dd");
    i0.ɵɵtext(16);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(17, "div")(18, "dt");
    i0.ɵɵtext(19, "Colegio profesional");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "dd");
    i0.ɵɵtext(21);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(22, "div")(23, "dt");
    i0.ɵɵtext(24, "Domicilio comercial");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "dd");
    i0.ɵɵtext(26);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(27, "div")(28, "dt");
    i0.ɵɵtext(29, "DNI del corredor");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(30, "dd");
    i0.ɵɵtext(31);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(32, "div", 18)(33, "app-carga-comprobante", 57);
    i0.ɵɵtwoWayListener("archivoChange", function SolicitudAnuncianteComponent_Conditional_10_Case_18_Conditional_11_Template_app_carga_comprobante_archivoChange_33_listener($event) { i0.ɵɵrestoreView(_r7); const ctx_r1 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r1.matricula, $event) || (ctx_r1.matricula = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(34, "app-carga-comprobante", 58);
    i0.ɵɵtwoWayListener("archivoChange", function SolicitudAnuncianteComponent_Conditional_10_Case_18_Conditional_11_Template_app_carga_comprobante_archivoChange_34_listener($event) { i0.ɵɵrestoreView(_r7); const ctx_r1 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r1.constanciaCuit, $event) || (ctx_r1.constanciaCuit = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(11);
    i0.ɵɵtextInterpolate(ctx_r1.solicitud()?.razon_social || "\u2014");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r1.solicitud()?.matricula_profesional || "\u2014");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r1.solicitud()?.colegio_profesional || "\u2014");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r1.solicitud()?.domicilio_comercial || "\u2014");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r1.solicitud()?.dni_corredor || "\u2014");
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("archivo", ctx_r1.matricula);
    i0.ɵɵproperty("deshabilitado", ctx_r1.enviando());
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("archivo", ctx_r1.constanciaCuit);
    i0.ɵɵproperty("deshabilitado", ctx_r1.enviando());
} }
function SolicitudAnuncianteComponent_Conditional_10_Case_18_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 5);
    i0.ɵɵelement(1, "app-spinner");
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3, "Enviando la documentaci\u00F3n para revisi\u00F3n\u2026");
    i0.ɵɵelementEnd()();
} }
function SolicitudAnuncianteComponent_Conditional_10_Case_18_Conditional_19_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 63);
    i0.ɵɵlistener("click", function SolicitudAnuncianteComponent_Conditional_10_Case_18_Conditional_19_Conditional_4_Template_button_click_0_listener() { const pendientes_r10 = i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.enviarDocumentos(pendientes_r10)); });
    i0.ɵɵtext(1, "Reintentar env\u00EDo de documentaci\u00F3n");
    i0.ɵɵelementEnd();
} }
function SolicitudAnuncianteComponent_Conditional_10_Case_18_Conditional_19_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-captura-identidad", 64);
    i0.ɵɵlistener("pruebaVidaCompletada", function SolicitudAnuncianteComponent_Conditional_10_Case_18_Conditional_19_Conditional_7_Template_app_captura_identidad_pruebaVidaCompletada_0_listener($event) { i0.ɵɵrestoreView(_r11); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.enviarDocumentos($event)); })("cerrar", function SolicitudAnuncianteComponent_Conditional_10_Case_18_Conditional_19_Conditional_7_Template_app_captura_identidad_cerrar_0_listener() { i0.ɵɵrestoreView(_r11); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.capturaAbierta.set(false)); })("reintento", function SolicitudAnuncianteComponent_Conditional_10_Case_18_Conditional_19_Conditional_7_Template_app_captura_identidad_reintento_0_listener() { i0.ɵɵrestoreView(_r11); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.limpiarErrorCaptura()); });
    i0.ɵɵelementEnd();
} }
function SolicitudAnuncianteComponent_Conditional_10_Case_18_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 59)(1, "p");
    i0.ɵɵtext(2, "Vamos a fotografiar ambas caras del DNI y guiarte con movimientos sencillos. La c\u00E1mara se abre en una ventana centrada y vas a ver las indicaciones y el resultado en el momento.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 60);
    i0.ɵɵconditionalCreate(4, SolicitudAnuncianteComponent_Conditional_10_Case_18_Conditional_19_Conditional_4_Template, 2, 0, "button", 61);
    i0.ɵɵelementStart(5, "button", 62);
    i0.ɵɵlistener("click", function SolicitudAnuncianteComponent_Conditional_10_Case_18_Conditional_19_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r8); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.abrirCaptura()); });
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(7, SolicitudAnuncianteComponent_Conditional_10_Case_18_Conditional_19_Conditional_7_Template, 1, 0, "app-captura-identidad");
} if (rf & 2) {
    let tmp_4_0;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(4);
    i0.ɵɵconditional((tmp_4_0 = ctx_r1.documentosPendientes()) ? 4 : -1, tmp_4_0);
    i0.ɵɵadvance();
    i0.ɵɵclassProp("acct-btn--primary", !ctx_r1.documentosPendientes())("acct-btn--ghost", !!ctx_r1.documentosPendientes());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.documentosPendientes() ? "Hacer una nueva captura" : "Comenzar verificaci\u00F3n");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.capturaAbierta() ? 7 : -1);
} }
function SolicitudAnuncianteComponent_Conditional_10_Case_18_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 53);
    i0.ɵɵtext(1, "Complet\u00E1 los datos y adjunt\u00E1 ambas constancias para comenzar la captura.");
    i0.ɵɵelementEnd();
} }
function SolicitudAnuncianteComponent_Conditional_10_Case_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 11)(1, "header", 47)(2, "div", 15)(3, "h2");
    i0.ɵɵtext(4, "Documentaci\u00F3n de identidad");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p");
    i0.ɵɵtext(6, "Primero vas a fotografiar el frente y el dorso del DNI. Despu\u00E9s te guiamos con una prueba breve de movimientos y una foto de frente.");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(7, SolicitudAnuncianteComponent_Conditional_10_Case_18_Conditional_7_Template, 2, 0, "button", 48);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(8, SolicitudAnuncianteComponent_Conditional_10_Case_18_Conditional_8_Template, 4, 1, "div", 9);
    i0.ɵɵelementStart(9, "div", 49);
    i0.ɵɵtext(10, " Los documentos se conservan de forma privada hasta que se revise la identidad. Si esa verificaci\u00F3n se rechaza, vas a tener que enviar nuevas capturas. ");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(11, SolicitudAnuncianteComponent_Conditional_10_Case_18_Conditional_11_Template, 35, 9, "section", 50);
    i0.ɵɵelementStart(12, "section", 51)(13, "div", 15)(14, "h3", 52);
    i0.ɵɵtext(15, "Verificaci\u00F3n de identidad");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "p");
    i0.ɵɵtext(17, "Ten\u00E9 el DNI a mano, busc\u00E1 buena luz y ubic\u00E1te donde est\u00E9s solo.");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(18, SolicitudAnuncianteComponent_Conditional_10_Case_18_Conditional_18_Template, 4, 0, "div", 5)(19, SolicitudAnuncianteComponent_Conditional_10_Case_18_Conditional_19_Template, 8, 7)(20, SolicitudAnuncianteComponent_Conditional_10_Case_18_Conditional_20_Template, 2, 0, "p", 53);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(7);
    i0.ɵɵconditional(ctx_r1.solicitud() && ctx_r1.puedeEditarDatos() ? 7 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.solicitud()?.estado === "rechazada" ? 8 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.esInmobiliaria() ? 11 : -1);
    i0.ɵɵadvance(7);
    i0.ɵɵconditional(ctx_r1.enviando() ? 18 : !ctx_r1.esInmobiliaria() || ctx_r1.matricula() && ctx_r1.constanciaCuit() ? 19 : 20);
} }
function SolicitudAnuncianteComponent_Conditional_10_Case_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 12)(1, "span", 65);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 66);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "h2");
    i0.ɵɵtext(4, "Tu solicitud est\u00E1 en revisi\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p");
    i0.ɵɵtext(6, "Recibimos tus datos y documentaci\u00F3n. Te vamos a avisar por email cuando un administrador la revise.");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 34);
} }
function SolicitudAnuncianteComponent_Conditional_10_Case_20_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 70);
    i0.ɵɵtext(1, "Publicar propiedad");
    i0.ɵɵelementEnd();
} }
function SolicitudAnuncianteComponent_Conditional_10_Case_20_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "Necesit\u00E1s un CBU aprobado para publicar propiedades y cobrar.");
    i0.ɵɵelementEnd();
} }
function SolicitudAnuncianteComponent_Conditional_10_Case_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 12)(1, "span", 67);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 68);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "h2");
    i0.ɵɵtext(4, "Identidad aprobada");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 60)(6, "a", 69);
    i0.ɵɵtext(7, "Mis publicaciones");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(8, SolicitudAnuncianteComponent_Conditional_10_Case_20_Conditional_8_Template, 2, 0, "a", 70)(9, SolicitudAnuncianteComponent_Conditional_10_Case_20_Conditional_9_Template, 2, 0, "p");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 34);
    i0.ɵɵadvance(6);
    i0.ɵɵconditional(ctx_r1.solicitud()?.cbu_ultimos_digitos ? 8 : 9);
} }
function SolicitudAnuncianteComponent_Conditional_10_Conditional_21_For_5_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const r_r12 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Identidad ", r_r12.identidad_aprobada ? "aprobada" : "rechazada", ".");
} }
function SolicitudAnuncianteComponent_Conditional_10_Conditional_21_For_5_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const r_r12 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("CBU ", r_r12.cbu_aprobado ? "aprobado" : "rechazado", ".");
} }
function SolicitudAnuncianteComponent_Conditional_10_Conditional_21_For_5_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const r_r12 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(r_r12.motivo);
} }
function SolicitudAnuncianteComponent_Conditional_10_Conditional_21_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "span", 72);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div")(4, "strong");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(6);
    i0.ɵɵconditionalCreate(7, SolicitudAnuncianteComponent_Conditional_10_Conditional_21_For_5_Conditional_7_Template, 2, 1, "p");
    i0.ɵɵconditionalCreate(8, SolicitudAnuncianteComponent_Conditional_10_Conditional_21_For_5_Conditional_8_Template, 2, 1, "p");
    i0.ɵɵconditionalCreate(9, SolicitudAnuncianteComponent_Conditional_10_Conditional_21_For_5_Conditional_9_Template, 2, 1, "p");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const r_r12 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵclassProp("acct-badge--ok", r_r12.estado === "aprobada")("acct-badge--error", r_r12.estado === "rechazada");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", r_r12.estado, " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("Revisi\u00F3n #", r_r12.numero_revision);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" \u00B7 ", ctx_r1.fecha(r_r12.creada_en), " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(r_r12.identidad_aprobada != null ? 7 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(r_r12.cbu_aprobado != null ? 8 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(r_r12.motivo ? 9 : -1);
} }
function SolicitudAnuncianteComponent_Conditional_10_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 13)(1, "h2");
    i0.ɵɵtext(2, "Historial de revisiones");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "ul", 71);
    i0.ɵɵrepeaterCreate(4, SolicitudAnuncianteComponent_Conditional_10_Conditional_21_For_5_Template, 10, 10, "li", null, _forTrack0);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵrepeater(ctx_r1.solicitud().revisiones);
} }
function SolicitudAnuncianteComponent_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "ol", 6)(1, "li")(2, "button", 7);
    i0.ɵɵlistener("click", function SolicitudAnuncianteComponent_Conditional_10_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.irAPaso("datos")); });
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4, "1");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(5, " Datos ");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "li")(7, "span");
    i0.ɵɵtext(8, "2");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(9, " Documentaci\u00F3n ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "li")(11, "span");
    i0.ɵɵtext(12, "3");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(13, " Revisi\u00F3n ");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(14, SolicitudAnuncianteComponent_Conditional_10_Conditional_14_Template, 2, 1, "div", 8);
    i0.ɵɵconditionalCreate(15, SolicitudAnuncianteComponent_Conditional_10_Conditional_15_Template, 2, 1, "div", 9);
    i0.ɵɵconditionalCreate(16, SolicitudAnuncianteComponent_Conditional_10_Conditional_16_Template, 1, 0, "app-cbu-anunciante");
    i0.ɵɵconditionalCreate(17, SolicitudAnuncianteComponent_Conditional_10_Case_17_Template, 38, 11, "form", 10)(18, SolicitudAnuncianteComponent_Conditional_10_Case_18_Template, 21, 4, "section", 11)(19, SolicitudAnuncianteComponent_Conditional_10_Case_19_Template, 7, 1, "div", 12)(20, SolicitudAnuncianteComponent_Conditional_10_Case_20_Template, 10, 2, "div", 12);
    i0.ɵɵconditionalCreate(21, SolicitudAnuncianteComponent_Conditional_10_Conditional_21_Template, 6, 0, "section", 13);
} if (rf & 2) {
    let tmp_15_0;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵclassProp("is-done", ctx_r1.paso() !== "datos")("is-current", ctx_r1.paso() === "datos");
    i0.ɵɵattribute("aria-current", ctx_r1.paso() === "datos" ? "step" : null);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", !ctx_r1.puedeEditarDatos());
    i0.ɵɵadvance(4);
    i0.ɵɵclassProp("is-done", ctx_r1.paso() === "revision" || ctx_r1.paso() === "aprobada")("is-current", ctx_r1.paso() === "documentos");
    i0.ɵɵattribute("aria-current", ctx_r1.paso() === "documentos" ? "step" : null);
    i0.ɵɵadvance(4);
    i0.ɵɵclassProp("is-done", ctx_r1.paso() === "aprobada")("is-current", ctx_r1.paso() === "revision");
    i0.ɵɵattribute("aria-current", ctx_r1.paso() === "revision" ? "step" : null);
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(ctx_r1.exito() ? 14 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.error() ? 15 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.solicitud() ? 16 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_15_0 = ctx_r1.paso()) === "datos" ? 17 : tmp_15_0 === "documentos" ? 18 : tmp_15_0 === "revision" ? 19 : tmp_15_0 === "aprobada" ? 20 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(ctx_r1.solicitud()?.revisiones?.length ? 21 : -1);
} }
function SolicitudAnuncianteComponent_ng_template_11_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 24);
    i0.ɵɵtext(1, "Complet\u00E1 este dato.");
    i0.ɵɵelementEnd();
} }
function SolicitudAnuncianteComponent_ng_template_11_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 24);
    i0.ɵɵtext(1, "Complet\u00E1 este dato.");
    i0.ɵɵelementEnd();
} }
function SolicitudAnuncianteComponent_ng_template_11_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 24);
    i0.ɵɵtext(1, "Complet\u00E1 este dato.");
    i0.ɵɵelementEnd();
} }
function SolicitudAnuncianteComponent_ng_template_11_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 24);
    i0.ɵɵtext(1, "Complet\u00E1 este dato.");
    i0.ɵɵelementEnd();
} }
function SolicitudAnuncianteComponent_ng_template_11_Conditional_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 24);
    i0.ɵɵtext(1, "Complet\u00E1 este dato con 7 u 8 d\u00EDgitos.");
    i0.ɵɵelementEnd();
} }
function SolicitudAnuncianteComponent_ng_template_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 73)(1, "div", 25)(2, "label", 74);
    i0.ɵɵtext(3, "Nombre o raz\u00F3n social");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(4, "input", 75);
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(5, SolicitudAnuncianteComponent_ng_template_11_Conditional_5_Template, 2, 0, "span", 24);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "div", 25)(7, "label", 76);
    i0.ɵɵtext(8, "Matr\u00EDcula del corredor responsable");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(9, "input", 77);
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(10, SolicitudAnuncianteComponent_ng_template_11_Conditional_10_Template, 2, 0, "span", 24);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "div", 25)(12, "label", 78);
    i0.ɵɵtext(13, "Colegio profesional y jurisdicci\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(14, "input", 79);
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(15, SolicitudAnuncianteComponent_ng_template_11_Conditional_15_Template, 2, 0, "span", 24);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "div", 25)(17, "label", 80);
    i0.ɵɵtext(18, "Domicilio comercial");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(19, "input", 81);
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(20, SolicitudAnuncianteComponent_ng_template_11_Conditional_20_Template, 2, 0, "span", 24);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "div", 25)(22, "label", 82);
    i0.ɵɵtext(23, "DNI del corredor responsable");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(24, "input", 83);
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(25, SolicitudAnuncianteComponent_ng_template_11_Conditional_25_Template, 2, 0, "span", 24);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("formGroup", ctx_r1.empresaForm);
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.empresaForm.controls.razon_social.invalid && ctx_r1.empresaForm.controls.razon_social.touched ? 5 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.empresaForm.controls.matricula_profesional.invalid && ctx_r1.empresaForm.controls.matricula_profesional.touched ? 10 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.empresaForm.controls.colegio_profesional.invalid && ctx_r1.empresaForm.controls.colegio_profesional.touched ? 15 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.empresaForm.controls.domicilio_comercial.invalid && ctx_r1.empresaForm.controls.domicilio_comercial.touched ? 20 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.empresaForm.controls.dni_corredor.invalid && ctx_r1.empresaForm.controls.dni_corredor.touched ? 25 : -1);
} }
// Alta como anunciante en dos pasos, alineada con back/src/anunciantes:
// 1) POST /anunciantes/solicitar (tipo, CUIT/CUIL, contacto)
// 2) POST /anunciantes/mi-solicitud/documentos (o /reenviar si fue rechazada)
// y luego queda esperando la revisión de un administrador.
export class SolicitudAnuncianteComponent {
    fb = inject(FormBuilder);
    perfilService = inject(PerfilService);
    catalogos = inject(CatalogoService);
    toast = inject(ToastService);
    solicitud = this.perfilService.solicitud;
    tipos = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tipos" }] : /* istanbul ignore next */ []));
    cargando = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cargando" }] : /* istanbul ignore next */ []));
    enviando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enviando" }] : /* istanbul ignore next */ []));
    error = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    /** RN-37: el CUIT/CUIL ya pertenece a otra cuenta vigente (409 del backend). */
    errorCuit = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorCuit" }] : /* istanbul ignore next */ []));
    exito = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "exito" }] : /* istanbul ignore next */ []));
    capturaAbierta = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "capturaAbierta" }] : /* istanbul ignore next */ []));
    documentosPendientes = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "documentosPendientes" }] : /* istanbul ignore next */ []));
    /** Paso derivado del estado persistido en el backend. */
    pasoBase = computed(() => {
        const s = this.solicitud();
        if (!s)
            return 'datos';
        if (s.estado === 'aprobada')
            return 'aprobada';
        if (s.estado === 'rechazada' || !s.dni_frente_url || !s.dni_dorso_url || !s.rostro_url)
            return 'documentos';
        return 'revision';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pasoBase" }] : /* istanbul ignore next */ []));
    /** Permite volver a Datos mientras la solicitud todavía se puede corregir. */
    pasoManual = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pasoManual" }] : /* istanbul ignore next */ []));
    paso = computed(() => this.pasoManual() ?? this.pasoBase(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "paso" }] : /* istanbul ignore next */ []));
    puedeEditarDatos = computed(() => {
        const s = this.solicitud();
        return !s || s.estado === 'borrador' || s.estado === 'rechazada';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "puedeEditarDatos" }] : /* istanbul ignore next */ []));
    form = this.fb.nonNullable.group({
        idTipoAnunciante: [0, [Validators.required, Validators.min(1)]],
        cuit: ['', [Validators.required, Validators.pattern(/^\d{2}-?\d{8}-?\d$/), Validators.maxLength(15)]],
        cbu: ['', [Validators.required, Validators.pattern(/^\d{22}$/)]],
        titularidad_declarada: [false, Validators.requiredTrue],
        aceptaTerminos: [false, Validators.requiredTrue],
        numero_contacto: ['', [Validators.required, Validators.maxLength(20)]],
    });
    empresaForm = this.fb.nonNullable.group({
        razon_social: ['', [Validators.required, Validators.maxLength(150)]],
        matricula_profesional: ['', [Validators.required, Validators.maxLength(50)]],
        colegio_profesional: ['', [Validators.required, Validators.maxLength(150)]],
        domicilio_comercial: ['', [Validators.required, Validators.maxLength(255)]],
        dni_corredor: ['', [Validators.required, Validators.maxLength(15), Validators.pattern(/^\d{7,8}$/)]],
    });
    tipoFormulario = toSignal(this.form.controls.idTipoAnunciante.valueChanges, { initialValue: 0 });
    tipoSolicitud = computed(() => this.solicitud()?.anunciante.tipoAnunciante?.id ?? 0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tipoSolicitud" }] : /* istanbul ignore next */ []));
    tipoSeleccionado = computed(() => this.tipoFormulario() || this.tipoSolicitud(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tipoSeleccionado" }] : /* istanbul ignore next */ []));
    esInmobiliaria = computed(() => {
        const tipo = this.tipos().find((item) => item.id === this.tipoSeleccionado());
        return /inmobiliaria|institucional/i.test(tipo?.nombre ?? '');
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "esInmobiliaria" }] : /* istanbul ignore next */ []));
    /** Las elige `app-carga-comprobante`, que valida PDF, JPG o PNG de hasta 5 MB y muestra el error junto al campo. */
    matricula = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "matricula" }] : /* istanbul ignore next */ []));
    constanciaCuit = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "constanciaCuit" }] : /* istanbul ignore next */ []));
    constructor() {
        effect(() => {
            const solicitud = this.solicitud();
            if (solicitud) {
                this.form.patchValue({
                    idTipoAnunciante: solicitud.anunciante.tipoAnunciante?.id ?? 0,
                    cuit: solicitud.anunciante.cuit_cuil ?? '',
                    numero_contacto: solicitud.anunciante.numero_contacto ?? '',
                }, { emitEvent: false });
                this.empresaForm.patchValue({
                    razon_social: solicitud.razon_social ?? '',
                    matricula_profesional: solicitud.matricula_profesional ?? '',
                    colegio_profesional: solicitud.colegio_profesional ?? '',
                    domicilio_comercial: solicitud.domicilio_comercial ?? '',
                    dni_corredor: solicitud.dni_corredor ?? '',
                }, { emitEvent: false });
            }
            if (!solicitud || !this.puedeEditarDatos())
                this.pasoManual.set(null);
        });
        this.catalogos.getTiposAnunciante().subscribe({ next: (t) => this.tipos.set(t) });
        this.recargar();
    }
    recargar() {
        this.perfilService.cargarSolicitud(true).subscribe(() => this.cargando.set(false));
    }
    irAPaso(paso) {
        if (paso === 'datos' && !this.puedeEditarDatos())
            return;
        if (paso === 'documentos' && !this.solicitud())
            return;
        this.pasoManual.set(paso);
    }
    enviarDatos() {
        const existente = !!this.solicitud();
        const datosValidos = existente
            ? this.form.controls.idTipoAnunciante.valid &&
                this.form.controls.cuit.valid &&
                this.form.controls.numero_contacto.valid
            : this.form.valid;
        if (!datosValidos || this.enviando() || (this.esInmobiliaria() && this.empresaForm.invalid)) {
            this.empresaForm.markAllAsTouched();
            if (existente) {
                this.form.controls.idTipoAnunciante.markAsTouched();
                this.form.controls.cuit.markAsTouched();
                this.form.controls.numero_contacto.markAsTouched();
            }
            else {
                this.form.markAllAsTouched();
            }
            return;
        }
        this.enviando.set(true);
        this.error.set('');
        this.errorCuit.set('');
        const valor = this.form.getRawValue();
        const datos = {
            idTipoAnunciante: valor.idTipoAnunciante,
            cuit: valor.cuit.trim(),
            numero_contacto: valor.numero_contacto.trim(),
            ...(this.esInmobiliaria() ? this.empresaForm.getRawValue() : {}),
        };
        const peticion = existente
            ? this.perfilService.actualizarDatosSolicitud(datos)
            : this.perfilService.solicitarAnunciante({
                ...datos,
                cbu: valor.cbu,
                titularidad_declarada: valor.titularidad_declarada,
                aceptaTerminos: valor.aceptaTerminos,
            });
        peticion.subscribe({
            next: () => {
                if (!existente) {
                    this.form.controls.cbu.reset();
                    this.form.controls.titularidad_declarada.reset();
                }
                this.enviando.set(false);
                this.pasoManual.set(null);
                this.recargar();
            },
            error: (err) => {
                this.enviando.set(false);
                if (err instanceof ApiError && err.status === 409 && /CUIT\/CUIL/.test(err.message)) {
                    this.errorCuit.set(err.message);
                    this.toast.mostrar('El CUIT/CUIL ingresado ya está registrado en otra cuenta.');
                    return;
                }
                this.error.set(err.message);
            },
        });
    }
    enviarDocumentos(documentos) {
        if (this.enviando())
            return;
        this.documentosPendientes.set(documentos);
        this.capturaAbierta.set(false);
        this.enviando.set(true);
        this.error.set('');
        const reenvio = this.solicitud()?.estado === 'rechazada';
        if (this.esInmobiliaria() && (!this.matricula() || !this.constanciaCuit())) {
            this.enviando.set(false);
            this.error.set('Adjuntá matrícula y constancia de CUIT para continuar.');
            return;
        }
        this.perfilService.subirDocumentos({
            ...documentos,
            ...(this.esInmobiliaria() ? { matricula: this.matricula(), constancia_cuit: this.constanciaCuit() } : {}),
        }, reenvio).subscribe({
            next: () => {
                this.documentosPendientes.set(null);
                this.enviando.set(false);
                this.pasoManual.set(null);
                this.exito.set('Prueba de vida completada y documentación enviada. Un administrador revisará tu solicitud.');
                this.recargar();
            },
            error: (err) => {
                this.enviando.set(false);
                this.error.set(err.message);
            },
        });
    }
    mostrarErrorCaptura(mensaje) {
        this.error.set(mensaje);
    }
    limpiarErrorCaptura() {
        this.error.set('');
    }
    abrirCaptura() {
        this.documentosPendientes.set(null);
        this.error.set('');
        this.capturaAbierta.set(true);
    }
    fecha(valor) {
        return new Date(valor).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' });
    }
    static ɵfac = function SolicitudAnuncianteComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SolicitudAnuncianteComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SolicitudAnuncianteComponent, selectors: [["app-solicitud-anunciante"]], decls: 13, vars: 2, consts: [["datosEmpresa", ""], [1, "acct-page", "solicitud-page"], [1, "acct-wrap", "acct-wrap--narrow"], [1, "acct-card", "solicitud-heading"], ["routerLink", "/mi-perfil", 1, "acct-btn", "acct-btn--ghost", "acct-btn--sm"], [1, "acct-state"], ["aria-label", "Pasos de la verificaci\u00F3n", 1, "steps"], ["type", "button", 1, "step-link", 3, "click", "disabled"], ["role", "status", 1, "acct-alert", "acct-alert--success"], ["role", "alert", 1, "acct-alert", "acct-alert--error"], ["novalidate", "", 1, "acct-card", "form-card", 3, "formGroup"], [1, "acct-card", "form-card"], [1, "acct-card", "status"], [1, "acct-card"], ["novalidate", "", 1, "acct-card", "form-card", 3, "ngSubmit", "formGroup"], [1, "form-section__head"], ["aria-labelledby", "datos-personales", 1, "form-section"], ["id", "datos-personales"], [1, "acct-grid"], [1, "acct-field", "acct-span"], ["for", "tipo"], ["id", "tipo", "formControlName", "idTipoAnunciante"], ["disabled", "", 3, "ngValue"], [3, "ngValue"], [1, "acct-hint", "acct-hint--error"], [1, "acct-field"], ["for", "cuit"], ["id", "cuit", "formControlName", "cuit", "inputmode", "numeric", "placeholder", "20-12345678-9", 3, "input"], ["role", "alert", 1, "acct-hint", "acct-hint--error"], ["for", "contacto"], ["id", "contacto", "type", "tel", "formControlName", "numero_contacto", "placeholder", "+54 353 400-0000"], ["aria-labelledby", "datos-inmobiliaria", 1, "form-section"], [1, "acct-actions", "form-actions"], ["type", "submit", 1, "acct-btn", "acct-btn--primary", 3, "disabled"], ["id", "datos-inmobiliaria"], [3, "ngTemplateOutlet"], ["aria-labelledby", "cuenta-bancaria", 1, "form-section"], ["id", "cuenta-bancaria"], ["for", "alta-cbu"], ["id", "alta-cbu", "formControlName", "cbu", "inputmode", "numeric", "maxlength", "22", "autocomplete", "off", "aria-describedby", "alta-cbu-ayuda"], ["id", "alta-cbu-ayuda", 1, "acct-hint"], ["for", "alta-titularidad", 1, "check-field", "acct-span"], ["id", "alta-titularidad", "type", "checkbox", "formControlName", "titularidad_declarada"], [1, "acct-hint", "acct-hint--error", "acct-span"], [1, "terminos-consentimiento"], ["type", "checkbox", "formControlName", "aceptaTerminos"], ["routerLink", "/terminos/anunciantes", "target", "_blank", "rel", "noopener"], [1, "docs-header"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", "acct-btn--sm"], [1, "acct-alert", "acct-alert--info"], ["aria-labelledby", "docs-inmobiliaria", 1, "form-section"], ["aria-labelledby", "verificacion-identidad", 1, "form-section"], ["id", "verificacion-identidad"], [1, "acct-hint"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", "acct-btn--sm", 3, "click"], ["id", "docs-inmobiliaria"], [1, "company-summary"], ["etiqueta", "Constancia de matr\u00EDcula profesional", "accion", "Eleg\u00ED o arrastr\u00E1 la constancia", 3, "archivoChange", "archivo", "deshabilitado"], ["etiqueta", "Constancia de CUIT de la inmobiliaria", "accion", "Eleg\u00ED o arrastr\u00E1 la constancia", 3, "archivoChange", "archivo", "deshabilitado"], [1, "identity-start"], [1, "acct-actions"], ["type", "button", 1, "acct-btn", "acct-btn--primary"], ["type", "button", 1, "acct-btn", 3, "click"], ["type", "button", 1, "acct-btn", "acct-btn--primary", 3, "click"], [3, "pruebaVidaCompletada", "cerrar", "reintento"], [1, "status__icon", "status__icon--wait"], ["lucideClock", "", 3, "size"], [1, "status__icon"], ["lucideBadgeCheck", "", 3, "size"], ["routerLink", "/mis-publicaciones", 1, "acct-btn", "acct-btn--ghost"], ["routerLink", "/publicaciones/nueva", 1, "acct-btn", "acct-btn--primary"], [1, "history"], [1, "acct-badge"], [1, "acct-grid", 3, "formGroup"], ["for", "empresa-razon_social"], ["id", "empresa-razon_social", "formControlName", "razon_social", "maxlength", "150"], ["for", "empresa-matricula_profesional"], ["id", "empresa-matricula_profesional", "formControlName", "matricula_profesional", "maxlength", "50"], ["for", "empresa-colegio_profesional"], ["id", "empresa-colegio_profesional", "formControlName", "colegio_profesional", "maxlength", "150"], ["for", "empresa-domicilio_comercial"], ["id", "empresa-domicilio_comercial", "formControlName", "domicilio_comercial", "maxlength", "255"], ["for", "empresa-dni_corredor"], ["id", "empresa-dni_corredor", "formControlName", "dni_corredor", "maxlength", "15"]], template: function SolicitudAnuncianteComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 1)(1, "div", 2)(2, "header", 3)(3, "h1");
            i0.ɵɵtext(4);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "p");
            i0.ɵɵtext(6, "Verificamos tu identidad para que quienes buscan alquiler conf\u00EDen en tus publicaciones.");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "a", 4);
            i0.ɵɵtext(8, "Volver a mi perfil");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(9, SolicitudAnuncianteComponent_Conditional_9_Template, 4, 0, "div", 5)(10, SolicitudAnuncianteComponent_Conditional_10_Template, 22, 21);
            i0.ɵɵelementEnd()();
            i0.ɵɵtemplate(11, SolicitudAnuncianteComponent_ng_template_11_Template, 26, 6, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor);
        } if (rf & 2) {
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(ctx.paso() === "aprobada" ? "Datos de anunciante" : "Convertite en anunciante");
            i0.ɵɵadvance(5);
            i0.ɵɵconditional(ctx.cargando() ? 9 : 10);
        } }, dependencies: [NgTemplateOutlet, ReactiveFormsModule, i1.ɵNgNoValidate, i1.NgSelectOption, i1.ɵNgSelectMultipleOption, i1.DefaultValueAccessor, i1.CheckboxControlValueAccessor, i1.SelectControlValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.MaxLengthValidator, i1.FormGroupDirective, i1.FormControlName, RouterLink, SpinnerComponent, CapturaIdentidadComponent, CbuAnuncianteComponent, CargaComprobanteComponent, LucideBadgeCheck, LucideClock], styles: ["\r\n.acct-page.solicitud-page[_ngcontent-%COMP%] {\r\n  background:\r\n    linear-gradient(180deg, rgba(10, 12, 20, 0.45) 0%, rgba(10, 12, 20, 0.75) 100%),\r\n    var(--%NS%auth-bg-image, none) center / cover no-repeat,\r\n    radial-gradient(circle at 20% 10%, rgba(216, 71, 30, 0.3), transparent 45%),\r\n    radial-gradient(circle at 85% 85%, rgba(14, 70, 161, 0.35), transparent 45%),\r\n    var(--%NS%color-dark);\r\n}\r\n.solicitud-heading[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  flex-direction: column;\r\n  align-items: center;\r\n  text-align: center;\r\n}\r\n.solicitud-heading[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] { margin: 0; font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 800; }\r\n.solicitud-heading[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { max-width: 36rem; margin: 0.4rem 0 0; font-weight: 700; }\r\n.solicitud-heading[_ngcontent-%COMP%]   .acct-btn[_ngcontent-%COMP%] { margin-top: 1rem; }\r\n.solicitud-page[_ngcontent-%COMP%]   .acct-state[_ngcontent-%COMP%] { color: rgba(255, 255, 255, 0.8); }\r\n\r\n.steps[_ngcontent-%COMP%] {\r\n  list-style: none;\r\n  margin: 0;\r\n  padding: 0;\r\n  display: grid;\r\n  grid-template-columns: repeat(3, 1fr);\r\n  gap: 0.5rem;\r\n}\r\n.steps[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.55rem;\r\n  padding: 0.7rem 0.9rem;\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: var(--%NS%radius-sm);\r\n  background: var(--%NS%color-surface);\r\n  color: var(--%NS%color-text-muted);\r\n  font-weight: 600;\r\n  font-size: 0.9rem;\r\n}\r\n.steps[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  place-items: center;\r\n  width: 26px;\r\n  height: 26px;\r\n  flex-shrink: 0;\r\n  border-radius: 50%;\r\n  background: var(--%NS%color-bg);\r\n  font-size: 0.8rem;\r\n}\r\n.steps[_ngcontent-%COMP%]   li.is-current[_ngcontent-%COMP%] { border-color: var(--%NS%color-accent); color: var(--%NS%color-text); }\r\n.steps[_ngcontent-%COMP%]   li.is-current[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { background: var(--%NS%color-accent); color: #fff; }\r\n.steps[_ngcontent-%COMP%]   li.is-done[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { background: #dcfce7; color: #15803d; }\r\n.steps[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]:has(button) { padding: 0; }\r\n.step-link[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  width: 100%;\r\n  align-items: center;\r\n  gap: 0.55rem;\r\n  padding: 0.7rem 0.9rem;\r\n  border: 0;\r\n  background: none;\r\n  color: inherit;\r\n  font: inherit;\r\n  text-align: left;\r\n  cursor: pointer;\r\n}\r\n.step-link[_ngcontent-%COMP%]:disabled { cursor: default; }\r\n.step-link[_ngcontent-%COMP%]:focus-visible {\r\n  outline: 2px solid var(--%NS%color-primary);\r\n  outline-offset: 2px;\r\n  border-radius: var(--%NS%radius-sm);\r\n}\r\n\r\n.form-card[_ngcontent-%COMP%] { display: flex; flex-direction: column; gap: 1.25rem; }\r\n.form-section[_ngcontent-%COMP%] { display: flex; flex-direction: column; gap: 0.9rem; min-width: 0; }\r\n.form-section[_ngcontent-%COMP%]    + .form-section[_ngcontent-%COMP%] { padding-top: 1.25rem; border-top: 1px solid var(--%NS%color-border); }\r\n.form-section__head[_ngcontent-%COMP%] { display: flex; flex-direction: column; gap: 0.3rem; min-width: 0; }\r\n.form-section__head[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%], \r\n.form-section__head[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] { margin: 0; }\r\n.form-section__head[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] { font-size: 1rem; font-weight: 700; }\r\n.form-section__head[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; color: var(--%NS%color-text-muted); font-size: 0.9rem; line-height: 1.55; }\r\n\r\n.docs-header[_ngcontent-%COMP%] { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }\r\n.docs-header[_ngcontent-%COMP%]   .form-section__head[_ngcontent-%COMP%] { flex: 1; }\r\n\r\n.company-summary[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  grid-template-columns: repeat(2, minmax(0, 1fr));\r\n  gap: 0.75rem 1rem;\r\n  margin: 0;\r\n  padding: 1rem;\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: var(--%NS%radius-sm);\r\n  background: var(--%NS%color-bg);\r\n}\r\n.company-summary[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] { min-width: 0; }\r\n.company-summary[_ngcontent-%COMP%]   dt[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.02em; text-transform: uppercase; }\r\n.company-summary[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%] { margin: 0.15rem 0 0; font-weight: 650; overflow-wrap: anywhere; }\r\n\r\n.check-field[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: flex-start;\r\n  gap: 0.6rem;\r\n  cursor: pointer;\r\n  font-size: 0.9rem;\r\n  line-height: 1.5;\r\n}\r\n.check-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\r\n  width: 1.05rem;\r\n  height: 1.05rem;\r\n  margin: 0.15rem 0 0;\r\n  flex: 0 0 auto;\r\n  accent-color: var(--%NS%color-primary);\r\n}\r\n\r\n.identity-start[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 0.9rem;\r\n  padding: 1rem;\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: var(--%NS%radius-sm);\r\n  background: var(--%NS%color-bg);\r\n}\r\n.identity-start[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; color: var(--%NS%color-text-muted); line-height: 1.55; }\r\n.identity-start[_ngcontent-%COMP%]   .acct-actions[_ngcontent-%COMP%] { justify-content: flex-start; }\r\n\r\n.form-actions[_ngcontent-%COMP%] { margin-top: 0; padding-top: 1.25rem; border-top: 1px solid var(--%NS%color-border); }\r\n\r\n.status[_ngcontent-%COMP%] { display: flex; flex-direction: column; align-items: center; gap: 0.6rem; text-align: center; }\r\n.status[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%], .status[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; }\r\n.status[_ngcontent-%COMP%]   .acct-actions[_ngcontent-%COMP%] { justify-content: center; margin-top: 0.5rem; }\r\n.status__icon[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  place-items: center;\r\n  width: 70px;\r\n  height: 70px;\r\n  border-radius: 50%;\r\n  background: #dcfce7;\r\n  color: #15803d;\r\n}\r\n.status__icon--wait[_ngcontent-%COMP%] { background: #fff4e5; color: var(--%NS%color-accent); }\r\n\r\n.history[_ngcontent-%COMP%] { list-style: none; margin: 0; padding: 0; }\r\n.history[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: flex-start;\r\n  gap: 0.75rem;\r\n  padding: 0.7rem 0;\r\n  border-bottom: 1px solid var(--%NS%color-border);\r\n  font-size: 0.9rem;\r\n}\r\n.history[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]:last-child { border-bottom: 0; }\r\n.history[_ngcontent-%COMP%]   .acct-badge[_ngcontent-%COMP%] { text-transform: capitalize; min-width: 84px; justify-content: center; }\r\n.history[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0.25rem 0 0; color: var(--%NS%color-text-muted); }\r\n\r\n@media (max-width: 640px) {\r\n  .steps[_ngcontent-%COMP%] { gap: 0.35rem; }\r\n  .steps[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] {\r\n    flex-direction: column;\r\n    justify-content: center;\r\n    gap: 0.25rem;\r\n    padding: 0.55rem 0.3rem;\r\n    font-size: 0.72rem;\r\n    line-height: 1.2;\r\n    text-align: center;\r\n  }\r\n  .steps[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]:has(button) { padding: 0; }\r\n  .step-link[_ngcontent-%COMP%] {\r\n    flex-direction: column;\r\n    justify-content: center;\r\n    gap: 0.25rem;\r\n    padding: 0.55rem 0.3rem;\r\n    text-align: center;\r\n  }\r\n  .steps[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { width: 24px; height: 24px; font-size: 0.75rem; }\r\n  .company-summary[_ngcontent-%COMP%] { grid-template-columns: 1fr; }\r\n  .docs-header[_ngcontent-%COMP%] { flex-direction: column; align-items: stretch; }\r\n  .docs-header[_ngcontent-%COMP%]   .acct-btn[_ngcontent-%COMP%] { align-self: flex-start; }\r\n  .identity-start[_ngcontent-%COMP%] { padding: 0.85rem; }\r\n}\r\n.terminos-consentimiento[_ngcontent-%COMP%] { margin: 1rem 0; font-size: .92rem; line-height: 1.5; }\r\n.terminos-consentimiento[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] { display: flex; align-items: flex-start; gap: .6rem; }\r\n.terminos-consentimiento[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] { flex: 0 0 auto; margin-top: .3rem; }\r\n.terminos-consentimiento[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] { color: #a64f31; text-decoration: underline; }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SolicitudAnuncianteComponent, [{
        type: Component,
        args: [{ selector: 'app-solicitud-anunciante', standalone: true, imports: [NgTemplateOutlet, ReactiveFormsModule, RouterLink, SpinnerComponent, CapturaIdentidadComponent, CbuAnuncianteComponent, CargaComprobanteComponent, LucideBadgeCheck, LucideClock], template: "<section class=\"acct-page solicitud-page\">\r\n  <div class=\"acct-wrap acct-wrap--narrow\">\r\n    <header class=\"acct-card solicitud-heading\">\r\n      <h1>{{ paso() === 'aprobada' ? 'Datos de anunciante' : 'Convertite en anunciante' }}</h1>\r\n      <p>Verificamos tu identidad para que quienes buscan alquiler conf\u00EDen en tus publicaciones.</p>\r\n      <a routerLink=\"/mi-perfil\" class=\"acct-btn acct-btn--ghost acct-btn--sm\">Volver a mi perfil</a>\r\n    </header>\r\n\r\n    @if (cargando()) {\r\n      <div class=\"acct-state\"><app-spinner /><p>Cargando tu solicitud\u2026</p></div>\r\n    } @else {\r\n      <ol class=\"steps\" aria-label=\"Pasos de la verificaci\u00F3n\">\r\n        <li [class.is-done]=\"paso() !== 'datos'\" [class.is-current]=\"paso() === 'datos'\" [attr.aria-current]=\"paso() === 'datos' ? 'step' : null\">\r\n          <button type=\"button\" class=\"step-link\" [disabled]=\"!puedeEditarDatos()\" (click)=\"irAPaso('datos')\">\r\n            <span>1</span> Datos\r\n          </button>\r\n        </li>\r\n        <li [class.is-done]=\"paso() === 'revision' || paso() === 'aprobada'\" [class.is-current]=\"paso() === 'documentos'\" [attr.aria-current]=\"paso() === 'documentos' ? 'step' : null\">\r\n          <span>2</span> Documentaci\u00F3n\r\n        </li>\r\n        <li [class.is-done]=\"paso() === 'aprobada'\" [class.is-current]=\"paso() === 'revision'\" [attr.aria-current]=\"paso() === 'revision' ? 'step' : null\">\r\n          <span>3</span> Revisi\u00F3n\r\n        </li>\r\n      </ol>\r\n\r\n      @if (exito()) { <div class=\"acct-alert acct-alert--success\" role=\"status\">{{ exito() }}</div> }\r\n      @if (error()) { <div class=\"acct-alert acct-alert--error\" role=\"alert\">{{ error() }}</div> }\r\n\r\n      @if (solicitud()) { <app-cbu-anunciante /> }\r\n\r\n      @switch (paso()) {\r\n        @case ('datos') {\r\n          <form class=\"acct-card form-card\" [formGroup]=\"form\" (ngSubmit)=\"enviarDatos()\" novalidate>\r\n            <header class=\"form-section__head\">\r\n              <h2>Datos del anunciante</h2>\r\n              <p>Estos datos identifican tu cuenta y permiten que un administrador valide tu perfil.</p>\r\n            </header>\r\n\r\n            <section class=\"form-section\" aria-labelledby=\"datos-personales\">\r\n              <div class=\"form-section__head\">\r\n                <h3 id=\"datos-personales\">Datos personales y de contacto</h3>\r\n                <p>El CUIT/CUIL debe pertenecer al titular de la cuenta.</p>\r\n              </div>\r\n              <div class=\"acct-grid\">\r\n                <div class=\"acct-field acct-span\">\r\n                  <label for=\"tipo\">Tipo de anunciante</label>\r\n                  <select id=\"tipo\" formControlName=\"idTipoAnunciante\">\r\n                    <option [ngValue]=\"0\" disabled>Seleccion\u00E1 una opci\u00F3n</option>\r\n                    @for (t of tipos(); track t.id) { <option [ngValue]=\"t.id\">{{ t.nombre }}</option> }\r\n                  </select>\r\n                  @if (form.controls.idTipoAnunciante.invalid && form.controls.idTipoAnunciante.touched) {\r\n                    <span class=\"acct-hint acct-hint--error\">Eleg\u00ED si sos propietario, inmobiliaria, etc.</span>\r\n                  }\r\n                </div>\r\n                <div class=\"acct-field\">\r\n                  <label for=\"cuit\">{{ esInmobiliaria() ? 'CUIT de la inmobiliaria' : 'CUIT / CUIL personal' }}</label>\r\n                  <input id=\"cuit\" formControlName=\"cuit\" inputmode=\"numeric\" placeholder=\"20-12345678-9\"\r\n                    [attr.aria-invalid]=\"!!errorCuit() || null\" (input)=\"errorCuit.set('')\" />\r\n                  @if (form.controls.cuit.invalid && form.controls.cuit.touched) {\r\n                    <span class=\"acct-hint acct-hint--error\">Ingres\u00E1 un CUIT/CUIL v\u00E1lido (11 d\u00EDgitos).</span>\r\n                  } @else if (errorCuit()) {\r\n                    <span class=\"acct-hint acct-hint--error\" role=\"alert\">{{ errorCuit() }}</span>\r\n                  }\r\n                </div>\r\n                <div class=\"acct-field\">\r\n                  <label for=\"contacto\">N\u00FAmero de contacto</label>\r\n                  <input id=\"contacto\" type=\"tel\" formControlName=\"numero_contacto\" placeholder=\"+54 353 400-0000\" />\r\n                  @if (form.controls.numero_contacto.invalid && form.controls.numero_contacto.touched) {\r\n                    <span class=\"acct-hint acct-hint--error\">Ingres\u00E1 un tel\u00E9fono (m\u00E1ximo 20 caracteres).</span>\r\n                  }\r\n                </div>\r\n              </div>\r\n            </section>\r\n\r\n            @if (esInmobiliaria()) {\r\n              <section class=\"form-section\" aria-labelledby=\"datos-inmobiliaria\">\r\n                <div class=\"form-section__head\">\r\n                  <h3 id=\"datos-inmobiliaria\">Datos de la inmobiliaria</h3>\r\n                  <p>La persona titular de la cuenta debe ser el corredor responsable.</p>\r\n                </div>\r\n                <ng-container [ngTemplateOutlet]=\"datosEmpresa\" />\r\n              </section>\r\n            }\r\n\r\n            @if (!solicitud()) {\r\n              <section class=\"form-section\" aria-labelledby=\"cuenta-bancaria\">\r\n                <div class=\"form-section__head\">\r\n                  <h3 id=\"cuenta-bancaria\">Cuenta bancaria para cobrar</h3>\r\n                  <p>Usamos estos datos para transferirte los cobros de tus alquileres.</p>\r\n                </div>\r\n                <div class=\"acct-grid\">\r\n                  <div class=\"acct-field acct-span\">\r\n                    <label for=\"alta-cbu\">CBU de la cuenta bancaria</label>\r\n                    <input id=\"alta-cbu\" formControlName=\"cbu\" inputmode=\"numeric\" maxlength=\"22\" autocomplete=\"off\" aria-describedby=\"alta-cbu-ayuda\" />\r\n                    <small id=\"alta-cbu-ayuda\" class=\"acct-hint\">Es obligatorio que la cuenta bancaria est\u00E9 a nombre del mismo titular de la cuenta en DEPA. Un administrador verificar\u00E1 la titularidad del CBU antes de que puedas usarlo para cobrar.</small>\r\n                    @if (form.controls.cbu.invalid && form.controls.cbu.touched) {\r\n                      <span class=\"acct-hint acct-hint--error\">Ingres\u00E1 un CBU de 22 d\u00EDgitos.</span>\r\n                    }\r\n                  </div>\r\n                  <label class=\"check-field acct-span\" for=\"alta-titularidad\">\r\n                    <input id=\"alta-titularidad\" type=\"checkbox\" formControlName=\"titularidad_declarada\" />\r\n                    <span>Confirmo que la cuenta bancaria est\u00E1 a mi nombre.</span>\r\n                  </label>\r\n                  @if (form.controls.titularidad_declarada.invalid && form.controls.titularidad_declarada.touched) {\r\n                    <span class=\"acct-hint acct-hint--error acct-span\">Confirm\u00E1 que sos titular de la cuenta bancaria.</span>\r\n                  }\r\n                </div>\r\n              </section>\r\n\r\n              <div class=\"terminos-consentimiento\">\r\n                <label><input type=\"checkbox\" formControlName=\"aceptaTerminos\" /> <span>Le\u00ED y acepto los <a routerLink=\"/terminos/anunciantes\" target=\"_blank\" rel=\"noopener\">t\u00E9rminos y condiciones para anunciantes</a>.</span></label>\r\n                @if (form.controls.aceptaTerminos.invalid && form.controls.aceptaTerminos.touched) {\r\n                  <span class=\"acct-hint acct-hint--error\" role=\"alert\">Acept\u00E1 los t\u00E9rminos para continuar.</span>\r\n                }\r\n              </div>\r\n            }\r\n            <div class=\"acct-actions form-actions\">\r\n              <button type=\"submit\" class=\"acct-btn acct-btn--primary\" [disabled]=\"enviando()\">\r\n                {{ enviando() ? 'Guardando\u2026' : 'Continuar' }}\r\n              </button>\r\n            </div>\r\n          </form>\r\n        }\r\n\r\n        @case ('documentos') {\r\n          <section class=\"acct-card form-card\">\r\n            <header class=\"docs-header\">\r\n              <div class=\"form-section__head\">\r\n                <h2>Documentaci\u00F3n de identidad</h2>\r\n                <p>Primero vas a fotografiar el frente y el dorso del DNI. Despu\u00E9s te guiamos con una prueba breve de movimientos y una foto de frente.</p>\r\n              </div>\r\n              @if (solicitud() && puedeEditarDatos()) {\r\n                <button type=\"button\" class=\"acct-btn acct-btn--ghost acct-btn--sm\" (click)=\"irAPaso('datos')\">\u2190 Volver a datos</button>\r\n              }\r\n            </header>\r\n\r\n            @if (solicitud()?.estado === 'rechazada') {\r\n              <div class=\"acct-alert acct-alert--error\" role=\"alert\">\r\n                <strong>La verificaci\u00F3n de identidad fue rechazada.</strong>\r\n                @if (solicitud()?.motivo_rechazo) { <br />Motivo: {{ solicitud()?.motivo_rechazo }} }\r\n              </div>\r\n            }\r\n\r\n            <div class=\"acct-alert acct-alert--info\">\r\n              Los documentos se conservan de forma privada hasta que se revise la identidad. Si esa verificaci\u00F3n se rechaza, vas a tener que enviar nuevas capturas.\r\n            </div>\r\n\r\n            @if (esInmobiliaria()) {\r\n              <section class=\"form-section\" aria-labelledby=\"docs-inmobiliaria\">\r\n                <div class=\"form-section__head\">\r\n                  <h3 id=\"docs-inmobiliaria\">Datos de la inmobiliaria y del corredor</h3>\r\n                  <p>Revis\u00E1 que coincidan con la documentaci\u00F3n que vas a adjuntar.</p>\r\n                </div>\r\n                <dl class=\"company-summary\">\r\n                  <div><dt>Nombre o raz\u00F3n social</dt><dd>{{ solicitud()?.razon_social || '\u2014' }}</dd></div>\r\n                  <div><dt>Matr\u00EDcula del corredor</dt><dd>{{ solicitud()?.matricula_profesional || '\u2014' }}</dd></div>\r\n                  <div><dt>Colegio profesional</dt><dd>{{ solicitud()?.colegio_profesional || '\u2014' }}</dd></div>\r\n                  <div><dt>Domicilio comercial</dt><dd>{{ solicitud()?.domicilio_comercial || '\u2014' }}</dd></div>\r\n                  <div><dt>DNI del corredor</dt><dd>{{ solicitud()?.dni_corredor || '\u2014' }}</dd></div>\r\n                </dl>\r\n                <div class=\"acct-grid\">\r\n                  <app-carga-comprobante etiqueta=\"Constancia de matr\u00EDcula profesional\" accion=\"Eleg\u00ED o arrastr\u00E1 la constancia\" [(archivo)]=\"matricula\" [deshabilitado]=\"enviando()\" />\r\n                  <app-carga-comprobante etiqueta=\"Constancia de CUIT de la inmobiliaria\" accion=\"Eleg\u00ED o arrastr\u00E1 la constancia\" [(archivo)]=\"constanciaCuit\" [deshabilitado]=\"enviando()\" />\r\n                </div>\r\n              </section>\r\n            }\r\n\r\n            <section class=\"form-section\" aria-labelledby=\"verificacion-identidad\">\r\n              <div class=\"form-section__head\">\r\n                <h3 id=\"verificacion-identidad\">Verificaci\u00F3n de identidad</h3>\r\n                <p>Ten\u00E9 el DNI a mano, busc\u00E1 buena luz y ubic\u00E1te donde est\u00E9s solo.</p>\r\n              </div>\r\n\r\n              @if (enviando()) {\r\n                <div class=\"acct-state\"><app-spinner /><p>Enviando la documentaci\u00F3n para revisi\u00F3n\u2026</p></div>\r\n              } @else if (!esInmobiliaria() || (matricula() && constanciaCuit())) {\r\n                <div class=\"identity-start\">\r\n                  <p>Vamos a fotografiar ambas caras del DNI y guiarte con movimientos sencillos. La c\u00E1mara se abre en una ventana centrada y vas a ver las indicaciones y el resultado en el momento.</p>\r\n                  <div class=\"acct-actions\">\r\n                    @if (documentosPendientes(); as pendientes) {\r\n                      <button type=\"button\" class=\"acct-btn acct-btn--primary\" (click)=\"enviarDocumentos(pendientes)\">Reintentar env\u00EDo de documentaci\u00F3n</button>\r\n                    }\r\n                    <button type=\"button\" class=\"acct-btn\" [class.acct-btn--primary]=\"!documentosPendientes()\" [class.acct-btn--ghost]=\"!!documentosPendientes()\" (click)=\"abrirCaptura()\">{{ documentosPendientes() ? 'Hacer una nueva captura' : 'Comenzar verificaci\u00F3n' }}</button>\r\n                  </div>\r\n                </div>\r\n                @if (capturaAbierta()) {\r\n                  <app-captura-identidad\r\n                    (pruebaVidaCompletada)=\"enviarDocumentos($event)\"\r\n                    (cerrar)=\"capturaAbierta.set(false)\"\r\n                    (reintento)=\"limpiarErrorCaptura()\"\r\n                  />\r\n                }\r\n              } @else {\r\n                <p class=\"acct-hint\">Complet\u00E1 los datos y adjunt\u00E1 ambas constancias para comenzar la captura.</p>\r\n              }\r\n            </section>\r\n          </section>\r\n        }\r\n\r\n        @case ('revision') {\r\n          <div class=\"acct-card status\">\r\n            <span class=\"status__icon status__icon--wait\"><svg lucideClock [size]=\"34\"></svg></span>\r\n            <h2>Tu solicitud est\u00E1 en revisi\u00F3n</h2>\r\n            <p>Recibimos tus datos y documentaci\u00F3n. Te vamos a avisar por email cuando un administrador la revise.</p>\r\n          </div>\r\n        }\r\n\r\n        @case ('aprobada') {\r\n          <div class=\"acct-card status\">\r\n            <span class=\"status__icon\"><svg lucideBadgeCheck [size]=\"34\"></svg></span>\r\n            <h2>Identidad aprobada</h2>\r\n            <div class=\"acct-actions\">\r\n              <a routerLink=\"/mis-publicaciones\" class=\"acct-btn acct-btn--ghost\">Mis publicaciones</a>\r\n              @if (solicitud()?.cbu_ultimos_digitos) {\r\n                <a routerLink=\"/publicaciones/nueva\" class=\"acct-btn acct-btn--primary\">Publicar propiedad</a>\r\n              } @else {\r\n                <p>Necesit\u00E1s un CBU aprobado para publicar propiedades y cobrar.</p>\r\n              }\r\n            </div>\r\n          </div>\r\n        }\r\n      }\r\n\r\n      @if (solicitud()?.revisiones?.length) {\r\n        <section class=\"acct-card\">\r\n          <h2>Historial de revisiones</h2>\r\n          <ul class=\"history\">\r\n            @for (r of solicitud()!.revisiones; track r.id) {\r\n              <li>\r\n                <span class=\"acct-badge\" [class.acct-badge--ok]=\"r.estado === 'aprobada'\" [class.acct-badge--error]=\"r.estado === 'rechazada'\">\r\n                  {{ r.estado }}\r\n                </span>\r\n                <div>\r\n                  <strong>Revisi\u00F3n #{{ r.numero_revision }}</strong> \u00B7 {{ fecha(r.creada_en) }}\r\n                  @if (r.identidad_aprobada != null) { <p>Identidad {{ r.identidad_aprobada ? 'aprobada' : 'rechazada' }}.</p> }\r\n                  @if (r.cbu_aprobado != null) { <p>CBU {{ r.cbu_aprobado ? 'aprobado' : 'rechazado' }}.</p> }\r\n                  @if (r.motivo) { <p>{{ r.motivo }}</p> }\r\n                </div>\r\n              </li>\r\n            }\r\n          </ul>\r\n        </section>\r\n      }\r\n    }\r\n  </div>\r\n</section>\r\n<ng-template #datosEmpresa>\r\n  <div [formGroup]=\"empresaForm\" class=\"acct-grid\">\r\n    <div class=\"acct-field\">\r\n      <label for=\"empresa-razon_social\">Nombre o raz\u00F3n social</label>\r\n      <input id=\"empresa-razon_social\" formControlName=\"razon_social\" maxlength=\"150\" />\r\n      @if (empresaForm.controls.razon_social.invalid && empresaForm.controls.razon_social.touched) {\r\n        <span class=\"acct-hint acct-hint--error\">Complet\u00E1 este dato.</span>\r\n      }\r\n    </div>\r\n    <div class=\"acct-field\">\r\n      <label for=\"empresa-matricula_profesional\">Matr\u00EDcula del corredor responsable</label>\r\n      <input id=\"empresa-matricula_profesional\" formControlName=\"matricula_profesional\" maxlength=\"50\" />\r\n      @if (empresaForm.controls.matricula_profesional.invalid && empresaForm.controls.matricula_profesional.touched) {\r\n        <span class=\"acct-hint acct-hint--error\">Complet\u00E1 este dato.</span>\r\n      }\r\n    </div>\r\n    <div class=\"acct-field\">\r\n      <label for=\"empresa-colegio_profesional\">Colegio profesional y jurisdicci\u00F3n</label>\r\n      <input id=\"empresa-colegio_profesional\" formControlName=\"colegio_profesional\" maxlength=\"150\" />\r\n      @if (empresaForm.controls.colegio_profesional.invalid && empresaForm.controls.colegio_profesional.touched) {\r\n        <span class=\"acct-hint acct-hint--error\">Complet\u00E1 este dato.</span>\r\n      }\r\n    </div>\r\n    <div class=\"acct-field\">\r\n      <label for=\"empresa-domicilio_comercial\">Domicilio comercial</label>\r\n      <input id=\"empresa-domicilio_comercial\" formControlName=\"domicilio_comercial\" maxlength=\"255\" />\r\n      @if (empresaForm.controls.domicilio_comercial.invalid && empresaForm.controls.domicilio_comercial.touched) {\r\n        <span class=\"acct-hint acct-hint--error\">Complet\u00E1 este dato.</span>\r\n      }\r\n    </div>\r\n    <div class=\"acct-field\">\r\n      <label for=\"empresa-dni_corredor\">DNI del corredor responsable</label>\r\n      <input id=\"empresa-dni_corredor\" formControlName=\"dni_corredor\" maxlength=\"15\" />\r\n      @if (empresaForm.controls.dni_corredor.invalid && empresaForm.controls.dni_corredor.touched) {\r\n        <span class=\"acct-hint acct-hint--error\">Complet\u00E1 este dato con 7 u 8 d\u00EDgitos.</span>\r\n      }\r\n    </div>\r\n  </div>\r\n</ng-template>\r\n", styles: ["/* Mismo fondo que el acceso, para que el alta se sienta parte del ingreso. */\r\n.acct-page.solicitud-page {\r\n  background:\r\n    linear-gradient(180deg, rgba(10, 12, 20, 0.45) 0%, rgba(10, 12, 20, 0.75) 100%),\r\n    var(--auth-bg-image, none) center / cover no-repeat,\r\n    radial-gradient(circle at 20% 10%, rgba(216, 71, 30, 0.3), transparent 45%),\r\n    radial-gradient(circle at 85% 85%, rgba(14, 70, 161, 0.35), transparent 45%),\r\n    var(--color-dark);\r\n}\r\n.solicitud-heading {\r\n  display: flex;\r\n  flex-direction: column;\r\n  align-items: center;\r\n  text-align: center;\r\n}\r\n.solicitud-heading h1 { margin: 0; font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 800; }\r\n.solicitud-heading p { max-width: 36rem; margin: 0.4rem 0 0; font-weight: 700; }\r\n.solicitud-heading .acct-btn { margin-top: 1rem; }\r\n.solicitud-page .acct-state { color: rgba(255, 255, 255, 0.8); }\r\n\r\n.steps {\r\n  list-style: none;\r\n  margin: 0;\r\n  padding: 0;\r\n  display: grid;\r\n  grid-template-columns: repeat(3, 1fr);\r\n  gap: 0.5rem;\r\n}\r\n.steps li {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.55rem;\r\n  padding: 0.7rem 0.9rem;\r\n  border: 1px solid var(--color-border);\r\n  border-radius: var(--radius-sm);\r\n  background: var(--color-surface);\r\n  color: var(--color-text-muted);\r\n  font-weight: 600;\r\n  font-size: 0.9rem;\r\n}\r\n.steps span {\r\n  display: grid;\r\n  place-items: center;\r\n  width: 26px;\r\n  height: 26px;\r\n  flex-shrink: 0;\r\n  border-radius: 50%;\r\n  background: var(--color-bg);\r\n  font-size: 0.8rem;\r\n}\r\n.steps li.is-current { border-color: var(--color-accent); color: var(--color-text); }\r\n.steps li.is-current span { background: var(--color-accent); color: #fff; }\r\n.steps li.is-done span { background: #dcfce7; color: #15803d; }\r\n.steps li:has(button) { padding: 0; }\r\n.step-link {\r\n  display: flex;\r\n  width: 100%;\r\n  align-items: center;\r\n  gap: 0.55rem;\r\n  padding: 0.7rem 0.9rem;\r\n  border: 0;\r\n  background: none;\r\n  color: inherit;\r\n  font: inherit;\r\n  text-align: left;\r\n  cursor: pointer;\r\n}\r\n.step-link:disabled { cursor: default; }\r\n.step-link:focus-visible {\r\n  outline: 2px solid var(--color-primary);\r\n  outline-offset: 2px;\r\n  border-radius: var(--radius-sm);\r\n}\r\n\r\n.form-card { display: flex; flex-direction: column; gap: 1.25rem; }\r\n.form-section { display: flex; flex-direction: column; gap: 0.9rem; min-width: 0; }\r\n.form-section + .form-section { padding-top: 1.25rem; border-top: 1px solid var(--color-border); }\r\n.form-section__head { display: flex; flex-direction: column; gap: 0.3rem; min-width: 0; }\r\n.form-section__head h2,\r\n.form-section__head h3 { margin: 0; }\r\n.form-section__head h3 { font-size: 1rem; font-weight: 700; }\r\n.form-section__head p { margin: 0; color: var(--color-text-muted); font-size: 0.9rem; line-height: 1.55; }\r\n\r\n.docs-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }\r\n.docs-header .form-section__head { flex: 1; }\r\n\r\n.company-summary {\r\n  display: grid;\r\n  grid-template-columns: repeat(2, minmax(0, 1fr));\r\n  gap: 0.75rem 1rem;\r\n  margin: 0;\r\n  padding: 1rem;\r\n  border: 1px solid var(--color-border);\r\n  border-radius: var(--radius-sm);\r\n  background: var(--color-bg);\r\n}\r\n.company-summary div { min-width: 0; }\r\n.company-summary dt { color: var(--color-text-muted); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.02em; text-transform: uppercase; }\r\n.company-summary dd { margin: 0.15rem 0 0; font-weight: 650; overflow-wrap: anywhere; }\r\n\r\n.check-field {\r\n  display: flex;\r\n  align-items: flex-start;\r\n  gap: 0.6rem;\r\n  cursor: pointer;\r\n  font-size: 0.9rem;\r\n  line-height: 1.5;\r\n}\r\n.check-field input {\r\n  width: 1.05rem;\r\n  height: 1.05rem;\r\n  margin: 0.15rem 0 0;\r\n  flex: 0 0 auto;\r\n  accent-color: var(--color-primary);\r\n}\r\n\r\n.identity-start {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 0.9rem;\r\n  padding: 1rem;\r\n  border: 1px solid var(--color-border);\r\n  border-radius: var(--radius-sm);\r\n  background: var(--color-bg);\r\n}\r\n.identity-start p { margin: 0; color: var(--color-text-muted); line-height: 1.55; }\r\n.identity-start .acct-actions { justify-content: flex-start; }\r\n\r\n.form-actions { margin-top: 0; padding-top: 1.25rem; border-top: 1px solid var(--color-border); }\r\n\r\n.status { display: flex; flex-direction: column; align-items: center; gap: 0.6rem; text-align: center; }\r\n.status h2, .status p { margin: 0; }\r\n.status .acct-actions { justify-content: center; margin-top: 0.5rem; }\r\n.status__icon {\r\n  display: grid;\r\n  place-items: center;\r\n  width: 70px;\r\n  height: 70px;\r\n  border-radius: 50%;\r\n  background: #dcfce7;\r\n  color: #15803d;\r\n}\r\n.status__icon--wait { background: #fff4e5; color: var(--color-accent); }\r\n\r\n.history { list-style: none; margin: 0; padding: 0; }\r\n.history li {\r\n  display: flex;\r\n  align-items: flex-start;\r\n  gap: 0.75rem;\r\n  padding: 0.7rem 0;\r\n  border-bottom: 1px solid var(--color-border);\r\n  font-size: 0.9rem;\r\n}\r\n.history li:last-child { border-bottom: 0; }\r\n.history .acct-badge { text-transform: capitalize; min-width: 84px; justify-content: center; }\r\n.history p { margin: 0.25rem 0 0; color: var(--color-text-muted); }\r\n\r\n@media (max-width: 640px) {\r\n  .steps { gap: 0.35rem; }\r\n  .steps li {\r\n    flex-direction: column;\r\n    justify-content: center;\r\n    gap: 0.25rem;\r\n    padding: 0.55rem 0.3rem;\r\n    font-size: 0.72rem;\r\n    line-height: 1.2;\r\n    text-align: center;\r\n  }\r\n  .steps li:has(button) { padding: 0; }\r\n  .step-link {\r\n    flex-direction: column;\r\n    justify-content: center;\r\n    gap: 0.25rem;\r\n    padding: 0.55rem 0.3rem;\r\n    text-align: center;\r\n  }\r\n  .steps span { width: 24px; height: 24px; font-size: 0.75rem; }\r\n  .company-summary { grid-template-columns: 1fr; }\r\n  .docs-header { flex-direction: column; align-items: stretch; }\r\n  .docs-header .acct-btn { align-self: flex-start; }\r\n  .identity-start { padding: 0.85rem; }\r\n}\r\n.terminos-consentimiento { margin: 1rem 0; font-size: .92rem; line-height: 1.5; }\r\n.terminos-consentimiento label { display: flex; align-items: flex-start; gap: .6rem; }\r\n.terminos-consentimiento input { flex: 0 0 auto; margin-top: .3rem; }\r\n.terminos-consentimiento a { color: #a64f31; text-decoration: underline; }\r\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(SolicitudAnuncianteComponent, { className: "SolicitudAnuncianteComponent", filePath: "src/app/features/solicitud-anunciante/solicitud-anunciante.component.ts", lineNumber: 31 }); })();
