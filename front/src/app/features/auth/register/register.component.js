import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideEye, LucideEyeOff } from '@lucide/angular';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ApiError } from '../../../core/interceptors/api-error';
import { contraseniasIgualesValidator, MENSAJE_CONTRASENIA_SEGURA, passwordSeguraValidator } from '../../../shared/validators/password.validators';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
function RegisterComponent_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 7)(1, "p");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "a", 8);
    i0.ɵɵtext(4, "Ir a iniciar sesi\u00F3n");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.mensajeExito());
} }
function RegisterComponent_Conditional_11_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 9);
    i0.ɵɵtext(1, "Te enviamos un enlace de recuperaci\u00F3n a ");
    i0.ɵɵelementStart(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(4, ". Revis\u00E1 tu bandeja de entrada y la carpeta de spam.");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const cuenta_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(cuenta_r3.email);
} }
function RegisterComponent_Conditional_11_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 10);
    i0.ɵɵtext(1, "Pod\u00E9s recuperar la cuenta dada de baja de ");
    i0.ɵɵelementStart(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(4, " o crear una cuenta nueva con ese email.");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const cuenta_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(cuenta_r3.email);
} }
function RegisterComponent_Conditional_11_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 12);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.error());
} }
function RegisterComponent_Conditional_11_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 8);
    i0.ɵɵtext(1, "Ir a iniciar sesi\u00F3n");
    i0.ɵɵelementEnd();
} }
function RegisterComponent_Conditional_11_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 14);
    i0.ɵɵlistener("click", function RegisterComponent_Conditional_11_Conditional_5_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.solicitarReactivacion()); });
    i0.ɵɵtext(1, " Recuperar mi cuenta por email ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "button", 15);
    i0.ɵɵlistener("click", function RegisterComponent_Conditional_11_Conditional_5_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.onSubmit(true)); });
    i0.ɵɵtext(3, " Crear una cuenta nueva ");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r0.enviando());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r0.enviando());
} }
function RegisterComponent_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵconditionalCreate(0, RegisterComponent_Conditional_11_Conditional_0_Template, 5, 1, "p", 9)(1, RegisterComponent_Conditional_11_Conditional_1_Template, 5, 1, "p", 10);
    i0.ɵɵelementStart(2, "div", 11);
    i0.ɵɵconditionalCreate(3, RegisterComponent_Conditional_11_Conditional_3_Template, 2, 1, "div", 12);
    i0.ɵɵconditionalCreate(4, RegisterComponent_Conditional_11_Conditional_4_Template, 2, 0, "a", 8)(5, RegisterComponent_Conditional_11_Conditional_5_Template, 4, 2);
    i0.ɵɵelementStart(6, "button", 13);
    i0.ɵɵlistener("click", function RegisterComponent_Conditional_11_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.volverAlFormulario()); });
    i0.ɵɵtext(7, "Volver al formulario");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r0.recuperacionEnviada() ? 0 : 1);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r0.error() ? 3 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.recuperacionEnviada() ? 4 : 5);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r0.enviando());
} }
function RegisterComponent_Conditional_12_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 12);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.error());
} }
function RegisterComponent_Conditional_12_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 21);
    i0.ɵɵtext(1, "Ingres\u00E1 tu nombre con letras y espacios (m\u00EDnimo 2 caracteres).");
    i0.ɵɵelementEnd();
} }
function RegisterComponent_Conditional_12_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 24);
    i0.ɵɵtext(1, "Ingres\u00E1 tu apellido con letras y espacios (m\u00EDnimo 2 caracteres).");
    i0.ɵɵelementEnd();
} }
function RegisterComponent_Conditional_12_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 27);
    i0.ɵɵtext(1, "Ingres\u00E1 un email v\u00E1lido.");
    i0.ɵɵelementEnd();
} }
function RegisterComponent_Conditional_12_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 28);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.errorEmail());
} }
function RegisterComponent_Conditional_12_Conditional_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 31);
    i0.ɵɵtext(1, "Ingres\u00E1 hasta 15 d\u00EDgitos. Pod\u00E9s usar + al inicio y guiones entre n\u00FAmeros.");
    i0.ɵɵelementEnd();
} }
function RegisterComponent_Conditional_12_Conditional_26_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 32);
    i0.ɵɵtext(1, "Por ejemplo, +54-9-351-555-0123.");
    i0.ɵɵelementEnd();
} }
function RegisterComponent_Conditional_12_Conditional_33_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(0, "svg", 37);
} if (rf & 2) {
    i0.ɵɵproperty("size", 18);
} }
function RegisterComponent_Conditional_12_Conditional_34_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(0, "svg", 38);
} if (rf & 2) {
    i0.ɵɵproperty("size", 18);
} }
function RegisterComponent_Conditional_12_Conditional_35_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 39);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.politicaContrasenia, " ");
} }
function RegisterComponent_Conditional_12_Conditional_36_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 40);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.politicaContrasenia);
} }
function RegisterComponent_Conditional_12_Conditional_43_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(0, "svg", 37);
} if (rf & 2) {
    i0.ɵɵproperty("size", 18);
} }
function RegisterComponent_Conditional_12_Conditional_44_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(0, "svg", 38);
} if (rf & 2) {
    i0.ɵɵproperty("size", 18);
} }
function RegisterComponent_Conditional_12_Conditional_45_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 39);
    i0.ɵɵtext(1, "Las contrase\u00F1as no coinciden.");
    i0.ɵɵelementEnd();
} }
function RegisterComponent_Conditional_12_Conditional_54_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 46);
    i0.ɵɵtext(1, "Acept\u00E1 los t\u00E9rminos para crear tu cuenta.");
    i0.ɵɵelementEnd();
} }
function RegisterComponent_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p", 10);
    i0.ɵɵtext(1, "Busc\u00E1 y reserv\u00E1 propiedades en alquiler.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "form", 16);
    i0.ɵɵlistener("ngSubmit", function RegisterComponent_Conditional_12_Template_form_ngSubmit_2_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.onSubmit()); });
    i0.ɵɵconditionalCreate(3, RegisterComponent_Conditional_12_Conditional_3_Template, 2, 1, "div", 12);
    i0.ɵɵelementStart(4, "div", 17)(5, "div", 18)(6, "label", 19);
    i0.ɵɵtext(7, "Nombre");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "input", 20);
    i0.ɵɵlistener("input", function RegisterComponent_Conditional_12_Template_input_input_8_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.filtrarCampo($event, "nombre")); })("compositionend", function RegisterComponent_Conditional_12_Template_input_compositionend_8_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.filtrarCampo($event, "nombre")); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(9, RegisterComponent_Conditional_12_Conditional_9_Template, 2, 0, "span", 21);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "div", 18)(11, "label", 22);
    i0.ɵɵtext(12, "Apellido");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "input", 23);
    i0.ɵɵlistener("input", function RegisterComponent_Conditional_12_Template_input_input_13_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.filtrarCampo($event, "apellido")); })("compositionend", function RegisterComponent_Conditional_12_Template_input_compositionend_13_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.filtrarCampo($event, "apellido")); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(14, RegisterComponent_Conditional_12_Conditional_14_Template, 2, 0, "span", 24);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(15, "div", 18)(16, "label", 25);
    i0.ɵɵtext(17, "Email");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "input", 26);
    i0.ɵɵlistener("input", function RegisterComponent_Conditional_12_Template_input_input_18_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.errorEmail.set(null)); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(19, RegisterComponent_Conditional_12_Conditional_19_Template, 2, 0, "span", 27)(20, RegisterComponent_Conditional_12_Conditional_20_Template, 2, 1, "span", 28);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "div", 18)(22, "label", 29);
    i0.ɵɵtext(23, "Tel\u00E9fono");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "input", 30);
    i0.ɵɵlistener("input", function RegisterComponent_Conditional_12_Template_input_input_24_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.filtrarCampo($event, "telefono")); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(25, RegisterComponent_Conditional_12_Conditional_25_Template, 2, 0, "span", 31)(26, RegisterComponent_Conditional_12_Conditional_26_Template, 2, 0, "span", 32);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "div", 18)(28, "label", 33);
    i0.ɵɵtext(29, "Contrase\u00F1a");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(30, "div", 34);
    i0.ɵɵelement(31, "input", 35);
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(32, "button", 36);
    i0.ɵɵlistener("click", function RegisterComponent_Conditional_12_Template_button_click_32_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.verContrasenia.set(!ctx_r0.verContrasenia())); });
    i0.ɵɵconditionalCreate(33, RegisterComponent_Conditional_12_Conditional_33_Template, 1, 1, ":svg:svg", 37)(34, RegisterComponent_Conditional_12_Conditional_34_Template, 1, 1, ":svg:svg", 38);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(35, RegisterComponent_Conditional_12_Conditional_35_Template, 2, 1, "span", 39)(36, RegisterComponent_Conditional_12_Conditional_36_Template, 2, 1, "span", 40);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(37, "div", 18)(38, "label", 41);
    i0.ɵɵtext(39, "Confirmar contrase\u00F1a");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(40, "div", 34);
    i0.ɵɵelement(41, "input", 42);
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(42, "button", 36);
    i0.ɵɵlistener("click", function RegisterComponent_Conditional_12_Template_button_click_42_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.verConfirmacion.set(!ctx_r0.verConfirmacion())); });
    i0.ɵɵconditionalCreate(43, RegisterComponent_Conditional_12_Conditional_43_Template, 1, 1, ":svg:svg", 37)(44, RegisterComponent_Conditional_12_Conditional_44_Template, 1, 1, ":svg:svg", 38);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(45, RegisterComponent_Conditional_12_Conditional_45_Template, 2, 0, "span", 39);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(46, "div", 43)(47, "label");
    i0.ɵɵelement(48, "input", 44);
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(49, "span");
    i0.ɵɵtext(50, "Le\u00ED y acepto los ");
    i0.ɵɵelementStart(51, "a", 45);
    i0.ɵɵtext(52, "t\u00E9rminos y condiciones de uso");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(53, ".");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(54, RegisterComponent_Conditional_12_Conditional_54_Template, 2, 0, "span", 46);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(55, "button", 47);
    i0.ɵɵtext(56);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(57, "p", 48);
    i0.ɵɵtext(58, "\u00BFYa ten\u00E9s cuenta? ");
    i0.ɵɵelementStart(59, "a", 49);
    i0.ɵɵtext(60, "Inici\u00E1 sesi\u00F3n");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("formGroup", ctx_r0.form);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.error() ? 3 : -1);
    i0.ɵɵadvance(5);
    i0.ɵɵattribute("aria-invalid", ctx_r0.form.controls.nombre.touched && ctx_r0.form.controls.nombre.invalid || null)("aria-describedby", ctx_r0.form.controls.nombre.touched && ctx_r0.form.controls.nombre.invalid ? "nombre-ayuda" : null);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.form.controls.nombre.invalid && ctx_r0.form.controls.nombre.touched ? 9 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵattribute("aria-invalid", ctx_r0.form.controls.apellido.touched && ctx_r0.form.controls.apellido.invalid || null)("aria-describedby", ctx_r0.form.controls.apellido.touched && ctx_r0.form.controls.apellido.invalid ? "apellido-ayuda" : null);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.form.controls.apellido.invalid && ctx_r0.form.controls.apellido.touched ? 14 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("readOnly", ctx_r0.enviando());
    i0.ɵɵattribute("aria-invalid", ctx_r0.form.controls.email.touched && ctx_r0.form.controls.email.invalid || !!ctx_r0.errorEmail() || null);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.form.controls.email.invalid && ctx_r0.form.controls.email.touched ? 19 : ctx_r0.errorEmail() ? 20 : -1);
    i0.ɵɵadvance(5);
    i0.ɵɵattribute("aria-invalid", ctx_r0.form.controls.telefono.touched && ctx_r0.form.controls.telefono.invalid || null);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.form.controls.telefono.invalid && ctx_r0.form.controls.telefono.touched ? 25 : 26);
    i0.ɵɵadvance(6);
    i0.ɵɵproperty("type", ctx_r0.verContrasenia() ? "text" : "password");
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", ctx_r0.verContrasenia() ? "Ocultar contrase\u00F1a" : "Mostrar contrase\u00F1a")("aria-pressed", ctx_r0.verContrasenia());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.verContrasenia() ? 33 : 34);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.form.controls.contrasenia.touched && ctx_r0.form.controls.contrasenia.errors ? 35 : 36);
    i0.ɵɵadvance(6);
    i0.ɵɵproperty("type", ctx_r0.verConfirmacion() ? "text" : "password");
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", ctx_r0.verConfirmacion() ? "Ocultar contrase\u00F1a" : "Mostrar contrase\u00F1a")("aria-pressed", ctx_r0.verConfirmacion());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.verConfirmacion() ? 43 : 44);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.form.errors?.["contraseniasDistintas"] && ctx_r0.form.controls.confirmarContrasenia.touched ? 45 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(6);
    i0.ɵɵconditional(ctx_r0.form.controls.aceptaTerminos.invalid && ctx_r0.form.controls.aceptaTerminos.touched ? 54 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r0.enviando());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.enviando() ? "Creando cuenta\u2026" : "Crear cuenta", " ");
} }
const FORMATO_NOMBRE = /^\p{L}[\p{L}\p{M}]*(?: +\p{L}[\p{L}\p{M}]*)*$/u;
const FORMATO_TELEFONO = /^\+?(?:[0-9]-?){0,14}[0-9]$/;
// RF1 (alta de usuario) + caso de uso "Crear Cuenta" (ID 1 del documento):
// el registro siempre crea un usuario tipo Inquilino (back/src/usuarios/service
// /usuarios.service.ts asigna el rol automáticamente); convertirse en
// Propietario/Inmobiliaria es un flujo aparte (POST /anunciantes/solicitar,
// fuera del alcance de este componente).
//
// Si el correo corresponde a una baja recuperable, el backend pide una
// elección antes de crear una cuenta.
export class RegisterComponent {
    politicaContrasenia = MENSAJE_CONTRASENIA_SEGURA;
    fb = inject(FormBuilder);
    authService = inject(AuthService);
    toast = inject(ToastService);
    enviando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enviando" }] : /* istanbul ignore next */ []));
    error = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    errorEmail = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorEmail" }] : /* istanbul ignore next */ []));
    cuentaRecuperable = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cuentaRecuperable" }] : /* istanbul ignore next */ []));
    mensajeExito = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mensajeExito" }] : /* istanbul ignore next */ []));
    recuperacionEnviada = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "recuperacionEnviada" }] : /* istanbul ignore next */ []));
    verContrasenia = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "verContrasenia" }] : /* istanbul ignore next */ []));
    verConfirmacion = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "verConfirmacion" }] : /* istanbul ignore next */ []));
    form = this.fb.nonNullable.group({
        nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(FORMATO_NOMBRE)]],
        apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(FORMATO_NOMBRE)]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
        telefono: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(FORMATO_TELEFONO)]],
        contrasenia: ['', [Validators.required, passwordSeguraValidator()]],
        confirmarContrasenia: ['', [Validators.required]],
        aceptaTerminos: [false, [Validators.requiredTrue]],
    }, { validators: contraseniasIgualesValidator() });
    filtrarCampo(evento, campo) {
        if (evento.isComposing)
            return;
        const entrada = evento.target;
        const { value, selectionStart, selectionEnd } = entrada;
        const caracteresInvalidos = campo === 'telefono' ? /[^0-9+-]/g : /[^\p{L}\p{M} ]/gu;
        const valor = value.replace(caracteresInvalidos, '');
        if (valor === value)
            return;
        this.form.controls[campo].setValue(valor);
        if (selectionStart !== null && selectionEnd !== null) {
            entrada.setSelectionRange(value.slice(0, selectionStart).replace(caracteresInvalidos, '').length, value.slice(0, selectionEnd).replace(caracteresInvalidos, '').length);
        }
    }
    onSubmit(crearCuentaNueva = false) {
        if (this.enviando() || (this.cuentaRecuperable() && !crearCuentaNueva))
            return;
        const { nombre: nombreIngresado, apellido: apellidoIngresado, email: emailIngresado } = this.form.controls;
        nombreIngresado.setValue(nombreIngresado.value.trim());
        apellidoIngresado.setValue(apellidoIngresado.value.trim());
        emailIngresado.setValue(emailIngresado.value.trim().toLowerCase());
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        const { nombre, apellido, email, telefono, contrasenia, aceptaTerminos } = this.form.getRawValue();
        if (crearCuentaNueva && this.cuentaRecuperable()?.email !== email)
            return;
        this.error.set(null);
        this.errorEmail.set(null);
        this.enviando.set(true);
        this.authService.register({
            nombre, apellido, email, telefono, contrasenia, aceptaTerminos,
            crearCuentaNueva,
        }).subscribe({
            next: (res) => {
                this.enviando.set(false);
                this.cuentaRecuperable.set(null);
                this.mensajeExito.set(res.mensaje);
                this.form.reset();
            },
            error: (err) => {
                this.enviando.set(false);
                if (err instanceof ApiError && err.status === 409) {
                    if (err.codigo === 'CUENTA_RECUPERABLE') {
                        if (err.constanciaReactivacion) {
                            this.cuentaRecuperable.set({ email, constancia: err.constanciaReactivacion });
                        }
                        else {
                            this.error.set('Volvé a cargar el registro para recuperar la cuenta.');
                        }
                        return;
                    }
                    this.volverAlFormulario();
                    this.errorEmail.set('Ese email ya está registrado en otra cuenta. Iniciá sesión o usá otro.');
                    this.toast.mostrar('El email ingresado ya está registrado en otra cuenta.');
                    return;
                }
                this.error.set(err.message);
            },
        });
    }
    solicitarReactivacion() {
        const cuenta = this.cuentaRecuperable();
        if (!cuenta || this.enviando() || this.recuperacionEnviada())
            return;
        this.error.set(null);
        this.enviando.set(true);
        this.authService.solicitarReactivacion(cuenta.email, cuenta.constancia).subscribe({
            next: () => {
                this.recuperacionEnviada.set(true);
                this.enviando.set(false);
            },
            error: (err) => {
                this.error.set(err.message);
                this.enviando.set(false);
            },
        });
    }
    volverAlFormulario() {
        this.cuentaRecuperable.set(null);
        this.recuperacionEnviada.set(false);
        this.error.set(null);
    }
    static ɵfac = function RegisterComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || RegisterComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: RegisterComponent, selectors: [["app-register"]], decls: 13, vars: 3, consts: [[1, "auth"], ["routerLink", "/", "aria-label", "Volver al inicio", 1, "auth__back"], ["lucideArrowLeft", "", 3, "size"], [1, "auth__card"], ["routerLink", "/", "aria-label", "Ir al inicio", 1, "auth__brand"], ["src", "/images/Logo.png", "alt", "DEPA"], [1, "auth__title"], ["role", "status", 1, "auth__success"], ["routerLink", "/login", 1, "btn", "btn--primary"], ["role", "status", 1, "auth__subtitle"], [1, "auth__subtitle"], [1, "auth__form"], ["role", "alert", 1, "auth__error"], ["type", "button", 1, "auth__edit", 3, "click", "disabled"], ["type", "button", 1, "btn", "btn--primary", 3, "click", "disabled"], ["type", "button", 1, "btn", "btn--secondary", 3, "click", "disabled"], ["novalidate", "", 1, "auth__form", 3, "ngSubmit", "formGroup"], [1, "auth__row"], [1, "auth__field"], ["for", "nombre"], ["id", "nombre", "type", "text", "formControlName", "nombre", "autocomplete", "given-name", "maxlength", "100", 3, "input", "compositionend"], ["id", "nombre-ayuda", 1, "auth__hint", "auth__hint--error"], ["for", "apellido"], ["id", "apellido", "type", "text", "formControlName", "apellido", "autocomplete", "family-name", "maxlength", "100", 3, "input", "compositionend"], ["id", "apellido-ayuda", 1, "auth__hint", "auth__hint--error"], ["for", "email"], ["id", "email", "type", "email", "formControlName", "email", "autocomplete", "email", "maxlength", "150", "aria-describedby", "email-ayuda", 3, "input", "readOnly"], ["id", "email-ayuda", 1, "auth__hint", "auth__hint--error"], ["id", "email-ayuda", "role", "alert", 1, "auth__hint", "auth__hint--error"], ["for", "telefono"], ["id", "telefono", "type", "tel", "formControlName", "telefono", "autocomplete", "tel", "maxlength", "20", "aria-describedby", "telefono-ayuda", 3, "input"], ["id", "telefono-ayuda", 1, "auth__hint", "auth__hint--error"], ["id", "telefono-ayuda", 1, "auth__hint"], ["for", "contrasenia"], [1, "password-field"], ["id", "contrasenia", "formControlName", "contrasenia", "autocomplete", "new-password", 3, "type"], ["type", "button", 1, "password-toggle", 3, "click"], ["lucideEyeOff", "", 3, "size"], ["lucideEye", "", 3, "size"], [1, "auth__hint", "auth__hint--error"], [1, "auth__hint"], ["for", "confirmarContrasenia"], ["id", "confirmarContrasenia", "formControlName", "confirmarContrasenia", "autocomplete", "new-password", 3, "type"], [1, "terminos-consentimiento"], ["type", "checkbox", "formControlName", "aceptaTerminos"], ["routerLink", "/terminos/usuarios", "target", "_blank", "rel", "noopener"], ["role", "alert", 1, "auth__hint", "auth__hint--error"], ["type", "submit", 1, "btn", "btn--primary", 3, "disabled"], [1, "auth__switch"], ["routerLink", "/login"]], template: function RegisterComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "a", 1);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(2, "svg", 2);
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(3, "span");
            i0.ɵɵtext(4, "Volver");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(5, "div", 3)(6, "a", 4);
            i0.ɵɵelement(7, "img", 5);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "h1", 6);
            i0.ɵɵtext(9);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(10, RegisterComponent_Conditional_10_Template, 5, 1, "div", 7)(11, RegisterComponent_Conditional_11_Template, 8, 4)(12, RegisterComponent_Conditional_12_Template, 61, 26);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            let tmp_2_0;
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("size", 20);
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate(ctx.recuperacionEnviada() ? "Mail enviado" : ctx.cuentaRecuperable() ? "Eleg\u00ED c\u00F3mo continuar" : "Cre\u00E1 tu cuenta");
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.mensajeExito() ? 10 : (tmp_2_0 = ctx.cuentaRecuperable()) ? 11 : 12, tmp_2_0);
        } }, dependencies: [ReactiveFormsModule, i1.ɵNgNoValidate, i1.DefaultValueAccessor, i1.CheckboxControlValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.MaxLengthValidator, i1.FormGroupDirective, i1.FormControlName, RouterLink, LucideArrowLeft, LucideEye, LucideEyeOff], styles: [".auth[_ngcontent-%COMP%] {\r\n  position: relative;\r\n  min-height: 100dvh;\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n  padding: 2.5rem 1rem 3rem;\r\n  background:\r\n    linear-gradient(180deg, rgba(10, 12, 20, 0.45) 0%, rgba(10, 12, 20, 0.75) 100%),\r\n    var(--%NS%auth-bg-image, none) center / cover no-repeat,\r\n    radial-gradient(circle at 20% 10%, rgba(216, 71, 30, 0.3), transparent 45%),\r\n    radial-gradient(circle at 85% 85%, rgba(14, 70, 161, 0.35), transparent 45%),\r\n    var(--%NS%color-dark);\r\n}\r\n\r\n.auth__back[_ngcontent-%COMP%] {\r\n  position: absolute;\r\n  top: 1.25rem;\r\n  left: 1.25rem;\r\n  z-index: 1;\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 0.45rem;\r\n  min-height: 42px;\r\n  padding: 0 1rem;\r\n  border: 1px solid rgba(255, 255, 255, 0.3);\r\n  border-radius: var(--%NS%radius-pill);\r\n  background: rgba(20, 22, 31, 0.72);\r\n  color: #fff;\r\n  font-size: 0.9rem;\r\n  font-weight: 700;\r\n  text-decoration: none;\r\n  backdrop-filter: blur(8px);\r\n  transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;\r\n}\r\n\r\n.auth__back[_ngcontent-%COMP%]:hover {\r\n  background: rgba(20, 22, 31, 0.92);\r\n  border-color: rgba(255, 255, 255, 0.55);\r\n  transform: translateX(-2px);\r\n}\r\n\r\n.auth__back[_ngcontent-%COMP%]:focus-visible {\r\n  outline: 3px solid color-mix(in srgb, var(--%NS%color-accent) 65%, transparent);\r\n  outline-offset: 3px;\r\n}\r\n\r\n.auth__card[_ngcontent-%COMP%] {\r\n  width: 100%;\r\n  max-width: 440px;\r\n  background: var(--%NS%color-surface);\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: var(--%NS%radius-lg);\r\n  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);\r\n  padding: 2.25rem 2rem;\r\n}\r\n\r\n.auth__brand[_ngcontent-%COMP%] {\r\n  display: block;\r\n  text-decoration: none;\r\n  text-align: center;\r\n  font-size: 1.3rem;\r\n  font-weight: 700;\r\n  letter-spacing: -0.01em;\r\n  color: var(--%NS%color-text);\r\n  margin-bottom: 1.25rem;\r\n}\r\n\r\n.auth__brand[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\r\n  display: block;\r\n  height: 44px;\r\n  width: auto;\r\n  margin: 0 auto;\r\n}\r\n\r\n.auth__title[_ngcontent-%COMP%] {\r\n  margin: 0 0 0.25rem;\r\n  font-size: 1.5rem;\r\n  font-weight: 800;\r\n  color: var(--%NS%color-text);\r\n  text-align: center;\r\n}\r\n\r\n.auth__subtitle[_ngcontent-%COMP%] {\r\n  margin: 0 0 1.75rem;\r\n  color: var(--%NS%color-text-muted);\r\n  font-size: 0.9rem;\r\n  text-align: center;\r\n}\r\n\r\n.auth__form[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 1.1rem;\r\n}\r\n\r\n.auth__row[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  grid-template-columns: 1fr 1fr;\r\n  gap: 1rem;\r\n}\r\n\r\n@media (max-width: 480px) {\r\n  .auth[_ngcontent-%COMP%] {\r\n    align-items: flex-start;\r\n    padding-top: 5.25rem;\r\n  }\r\n\r\n  .auth__back[_ngcontent-%COMP%] {\r\n    top: 1rem;\r\n    left: 1rem;\r\n  }\r\n\r\n  .auth__card[_ngcontent-%COMP%] {\r\n    padding: 1.75rem 1.25rem;\r\n  }\r\n\r\n  .auth__row[_ngcontent-%COMP%] {\r\n    grid-template-columns: 1fr;\r\n  }\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%] {\r\n  min-width: 0;\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 0.4rem;\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\r\n  font-size: 0.85rem;\r\n  font-weight: 600;\r\n  color: var(--%NS%color-text);\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\r\n  min-width: 0;\r\n  width: 100%;\r\n  padding: 0.7rem 0.9rem;\r\n  border-radius: var(--%NS%radius-sm);\r\n  border: 1px solid var(--%NS%color-border);\r\n  font-size: 1rem;\r\n  color: var(--%NS%color-text);\r\n  background: #fff;\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]::placeholder {\r\n  color: #98a2b3;\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus {\r\n  outline: none;\r\n  border-color: var(--%NS%color-primary);\r\n  box-shadow: 0 0 0 3px color-mix(in srgb, var(--%NS%color-primary) 25%, transparent);\r\n}\r\n\r\n.auth__hint[_ngcontent-%COMP%] {\r\n  font-size: 0.78rem;\r\n  color: var(--%NS%color-text-muted);\r\n}\r\n\r\n.auth__hint--error[_ngcontent-%COMP%] {\r\n  color: var(--%NS%color-danger);\r\n}\r\n\r\n.auth__error[_ngcontent-%COMP%] {\r\n  background: #fef2f2;\r\n  border: 1px solid var(--%NS%color-danger);\r\n  color: #b91c1c;\r\n  padding: 0.6rem 0.75rem;\r\n  border-radius: var(--%NS%radius-sm);\r\n  font-size: 0.85rem;\r\n}\r\n\r\n.auth__success[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 0.75rem;\r\n  text-align: center;\r\n  color: var(--%NS%color-text);\r\n}\r\n\r\n.auth__success[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\r\n  margin: 0;\r\n  color: var(--%NS%color-text-muted);\r\n}\r\n\r\n.auth__switch[_ngcontent-%COMP%] {\r\n  margin: 1.5rem 0 0;\r\n  text-align: center;\r\n  font-size: 0.88rem;\r\n  color: var(--%NS%color-text-muted);\r\n}\r\n\r\n.auth__switch[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] {\r\n  color: var(--%NS%color-accent);\r\n  font-weight: 600;\r\n  text-decoration: none;\r\n}\r\n\r\n.auth__switch[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover {\r\n  text-decoration: underline;\r\n}\r\n\r\n.btn[_ngcontent-%COMP%] {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 0.75rem 1.25rem;\r\n  border-radius: var(--%NS%radius-pill);\r\n  border: none;\r\n  font-weight: 700;\r\n  cursor: pointer;\r\n  font-size: 1rem;\r\n}\r\n\r\n.btn--primary[_ngcontent-%COMP%] {\r\n  background: var(--%NS%color-accent);\r\n  color: #1a1200;\r\n  box-shadow: 0 8px 20px color-mix(in srgb, var(--%NS%color-accent) 45%, transparent);\r\n}\r\n\r\n.btn--%NS%primary[_ngcontent-%COMP%]:hover {\r\n  background: color-mix(in srgb, var(--%NS%color-accent) 88%, black);\r\n}\r\n\r\n.btn--secondary[_ngcontent-%COMP%] {\r\n  border: 1px solid var(--%NS%color-border);\r\n  background: var(--%NS%color-surface);\r\n  color: var(--%NS%color-text);\r\n}\r\n\r\n.auth__edit[_ngcontent-%COMP%] {\r\n  align-self: center;\r\n  border: 0;\r\n  padding: 0.25rem;\r\n  color: var(--%NS%color-text);\r\n  background: transparent;\r\n  text-decoration: underline;\r\n  cursor: pointer;\r\n}\r\n\r\n.btn[_ngcontent-%COMP%]:disabled {\r\n  opacity: 0.6;\r\n  cursor: not-allowed;\r\n}\r\n\r\n.password-field[_ngcontent-%COMP%] {\r\n  position: relative;\r\n}\r\n\r\n.password-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\r\n  width: 100%;\r\n  padding-right: 2.75rem;\r\n}\r\n\r\n.password-toggle[_ngcontent-%COMP%] {\r\n  position: absolute;\r\n  top: 50%;\r\n  right: 0.4rem;\r\n  translate: 0 -50%;\r\n  display: grid;\r\n  place-items: center;\r\n  width: 2rem;\r\n  height: 2rem;\r\n  border: 0;\r\n  border-radius: 50%;\r\n  background: transparent;\r\n  color: var(--%NS%color-text-muted);\r\n  cursor: pointer;\r\n}\r\n\r\n.password-toggle[_ngcontent-%COMP%]:hover {\r\n  color: var(--%NS%color-text);\r\n  background: var(--%NS%color-bg);\r\n}\r\n.terminos-consentimiento[_ngcontent-%COMP%] { margin: 1rem 0; font-size: .92rem; line-height: 1.5; }\r\n.terminos-consentimiento[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] { display: flex; align-items: flex-start; gap: .6rem; }\r\n.terminos-consentimiento[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] { flex: 0 0 auto; margin-top: .3rem; }\r\n.terminos-consentimiento[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] { color: #a64f31; text-decoration: underline; }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(RegisterComponent, [{
        type: Component,
        args: [{ selector: 'app-register', standalone: true, imports: [ReactiveFormsModule, RouterLink, LucideArrowLeft, LucideEye, LucideEyeOff], template: "<section class=\"auth\">\r\n  <a routerLink=\"/\" class=\"auth__back\" aria-label=\"Volver al inicio\">\r\n    <svg lucideArrowLeft [size]=\"20\"></svg>\r\n    <span>Volver</span>\r\n  </a>\r\n\r\n  <div class=\"auth__card\">\r\n    <a routerLink=\"/\" class=\"auth__brand\" aria-label=\"Ir al inicio\"><img src=\"/images/Logo.png\" alt=\"DEPA\" /></a>\r\n    <h1 class=\"auth__title\">{{ recuperacionEnviada() ? 'Mail enviado' : cuentaRecuperable() ? 'Eleg\u00ED c\u00F3mo continuar' : 'Cre\u00E1 tu cuenta' }}</h1>\r\n\r\n    @if (mensajeExito()) {\r\n      <div class=\"auth__success\" role=\"status\">\r\n        <p>{{ mensajeExito() }}</p>\r\n        <a routerLink=\"/login\" class=\"btn btn--primary\">Ir a iniciar sesi\u00F3n</a>\r\n      </div>\r\n    } @else if (cuentaRecuperable(); as cuenta) {\r\n      @if (recuperacionEnviada()) {\r\n        <p class=\"auth__subtitle\" role=\"status\">Te enviamos un enlace de recuperaci\u00F3n a <strong>{{ cuenta.email }}</strong>. Revis\u00E1 tu bandeja de entrada y la carpeta de spam.</p>\r\n      } @else {\r\n        <p class=\"auth__subtitle\">Pod\u00E9s recuperar la cuenta dada de baja de <strong>{{ cuenta.email }}</strong> o crear una cuenta nueva con ese email.</p>\r\n      }\r\n      <div class=\"auth__form\">\r\n        @if (error()) {\r\n          <div class=\"auth__error\" role=\"alert\">{{ error() }}</div>\r\n        }\r\n        @if (recuperacionEnviada()) {\r\n          <a routerLink=\"/login\" class=\"btn btn--primary\">Ir a iniciar sesi\u00F3n</a>\r\n        } @else {\r\n          <button type=\"button\" class=\"btn btn--primary\" [disabled]=\"enviando()\" (click)=\"solicitarReactivacion()\">\r\n            Recuperar mi cuenta por email\r\n          </button>\r\n          <button type=\"button\" class=\"btn btn--secondary\" [disabled]=\"enviando()\" (click)=\"onSubmit(true)\">\r\n            Crear una cuenta nueva\r\n          </button>\r\n        }\r\n        <button type=\"button\" class=\"auth__edit\" [disabled]=\"enviando()\" (click)=\"volverAlFormulario()\">Volver al formulario</button>\r\n      </div>\r\n    } @else {\r\n      <p class=\"auth__subtitle\">Busc\u00E1 y reserv\u00E1 propiedades en alquiler.</p>\r\n      <form class=\"auth__form\" [formGroup]=\"form\" (ngSubmit)=\"onSubmit()\" novalidate>\r\n        @if (error()) {\r\n          <div class=\"auth__error\" role=\"alert\">{{ error() }}</div>\r\n        }\r\n\r\n        <div class=\"auth__row\">\r\n          <div class=\"auth__field\">\r\n            <label for=\"nombre\">Nombre</label>\r\n            <input id=\"nombre\" type=\"text\" formControlName=\"nombre\" autocomplete=\"given-name\" maxlength=\"100\"\r\n              (input)=\"filtrarCampo($event, 'nombre')\" (compositionend)=\"filtrarCampo($event, 'nombre')\"\r\n              [attr.aria-invalid]=\"form.controls.nombre.touched && form.controls.nombre.invalid || null\"\r\n              [attr.aria-describedby]=\"form.controls.nombre.touched && form.controls.nombre.invalid ? 'nombre-ayuda' : null\" />\r\n            @if (form.controls.nombre.invalid && form.controls.nombre.touched) {\r\n              <span id=\"nombre-ayuda\" class=\"auth__hint auth__hint--error\">Ingres\u00E1 tu nombre con letras y espacios (m\u00EDnimo 2 caracteres).</span>\r\n            }\r\n          </div>\r\n\r\n          <div class=\"auth__field\">\r\n            <label for=\"apellido\">Apellido</label>\r\n            <input id=\"apellido\" type=\"text\" formControlName=\"apellido\" autocomplete=\"family-name\" maxlength=\"100\"\r\n              (input)=\"filtrarCampo($event, 'apellido')\" (compositionend)=\"filtrarCampo($event, 'apellido')\"\r\n              [attr.aria-invalid]=\"form.controls.apellido.touched && form.controls.apellido.invalid || null\"\r\n              [attr.aria-describedby]=\"form.controls.apellido.touched && form.controls.apellido.invalid ? 'apellido-ayuda' : null\" />\r\n            @if (form.controls.apellido.invalid && form.controls.apellido.touched) {\r\n              <span id=\"apellido-ayuda\" class=\"auth__hint auth__hint--error\">Ingres\u00E1 tu apellido con letras y espacios (m\u00EDnimo 2 caracteres).</span>\r\n            }\r\n          </div>\r\n        </div>\r\n\r\n        <div class=\"auth__field\">\r\n          <label for=\"email\">Email</label>\r\n          <input id=\"email\" type=\"email\" formControlName=\"email\" autocomplete=\"email\" maxlength=\"150\"\r\n            [readOnly]=\"enviando()\" [attr.aria-invalid]=\"(form.controls.email.touched && form.controls.email.invalid) || !!errorEmail() || null\"\r\n            aria-describedby=\"email-ayuda\" (input)=\"errorEmail.set(null)\" />\r\n          @if (form.controls.email.invalid && form.controls.email.touched) {\r\n            <span id=\"email-ayuda\" class=\"auth__hint auth__hint--error\">Ingres\u00E1 un email v\u00E1lido.</span>\r\n          } @else if (errorEmail()) {\r\n            <span id=\"email-ayuda\" class=\"auth__hint auth__hint--error\" role=\"alert\">{{ errorEmail() }}</span>\r\n          }\r\n        </div>\r\n\r\n        <div class=\"auth__field\">\r\n          <label for=\"telefono\">Tel\u00E9fono</label>\r\n          <input id=\"telefono\" type=\"tel\" formControlName=\"telefono\" autocomplete=\"tel\" maxlength=\"20\"\r\n            (input)=\"filtrarCampo($event, 'telefono')\" aria-describedby=\"telefono-ayuda\"\r\n            [attr.aria-invalid]=\"form.controls.telefono.touched && form.controls.telefono.invalid || null\" />\r\n          @if (form.controls.telefono.invalid && form.controls.telefono.touched) {\r\n            <span id=\"telefono-ayuda\" class=\"auth__hint auth__hint--error\">Ingres\u00E1 hasta 15 d\u00EDgitos. Pod\u00E9s usar + al inicio y guiones entre n\u00FAmeros.</span>\r\n          } @else {\r\n            <span id=\"telefono-ayuda\" class=\"auth__hint\">Por ejemplo, +54-9-351-555-0123.</span>\r\n          }\r\n        </div>\r\n\r\n        <div class=\"auth__field\">\r\n          <label for=\"contrasenia\">Contrase\u00F1a</label>\r\n          <div class=\"password-field\">\r\n            <input id=\"contrasenia\" [type]=\"verContrasenia() ? 'text' : 'password'\" formControlName=\"contrasenia\" autocomplete=\"new-password\" />\r\n            <button type=\"button\" class=\"password-toggle\" (click)=\"verContrasenia.set(!verContrasenia())\"\r\n              [attr.aria-label]=\"verContrasenia() ? 'Ocultar contrase\u00F1a' : 'Mostrar contrase\u00F1a'\" [attr.aria-pressed]=\"verContrasenia()\">\r\n              @if (verContrasenia()) { <svg lucideEyeOff [size]=\"18\"></svg> } @else { <svg lucideEye [size]=\"18\"></svg> }\r\n            </button>\r\n          </div>\r\n          @if (form.controls.contrasenia.touched && form.controls.contrasenia.errors) {\r\n            <span class=\"auth__hint auth__hint--error\">\r\n              {{ politicaContrasenia }}\r\n            </span>\r\n          } @else {\r\n            <span class=\"auth__hint\">{{ politicaContrasenia }}</span>\r\n          }\r\n        </div>\r\n\r\n        <div class=\"auth__field\">\r\n          <label for=\"confirmarContrasenia\">Confirmar contrase\u00F1a</label>\r\n          <div class=\"password-field\">\r\n            <input\r\n              id=\"confirmarContrasenia\"\r\n              [type]=\"verConfirmacion() ? 'text' : 'password'\"\r\n              formControlName=\"confirmarContrasenia\"\r\n              autocomplete=\"new-password\"\r\n            />\r\n            <button type=\"button\" class=\"password-toggle\" (click)=\"verConfirmacion.set(!verConfirmacion())\"\r\n              [attr.aria-label]=\"verConfirmacion() ? 'Ocultar contrase\u00F1a' : 'Mostrar contrase\u00F1a'\" [attr.aria-pressed]=\"verConfirmacion()\">\r\n              @if (verConfirmacion()) { <svg lucideEyeOff [size]=\"18\"></svg> } @else { <svg lucideEye [size]=\"18\"></svg> }\r\n            </button>\r\n          </div>\r\n          @if (form.errors?.['contraseniasDistintas'] && form.controls.confirmarContrasenia.touched) {\r\n            <span class=\"auth__hint auth__hint--error\">Las contrase\u00F1as no coinciden.</span>\r\n          }\r\n        </div>\r\n\r\n        <div class=\"terminos-consentimiento\">\r\n          <label><input type=\"checkbox\" formControlName=\"aceptaTerminos\" /> <span>Le\u00ED y acepto los <a routerLink=\"/terminos/usuarios\" target=\"_blank\" rel=\"noopener\">t\u00E9rminos y condiciones de uso</a>.</span></label>\r\n          @if (form.controls.aceptaTerminos.invalid && form.controls.aceptaTerminos.touched) {\r\n            <span class=\"auth__hint auth__hint--error\" role=\"alert\">Acept\u00E1 los t\u00E9rminos para crear tu cuenta.</span>\r\n          }\r\n        </div>\r\n        <button type=\"submit\" class=\"btn btn--primary\" [disabled]=\"enviando()\">\r\n          {{ enviando() ? 'Creando cuenta\u2026' : 'Crear cuenta' }}\r\n        </button>\r\n      </form>\r\n      <p class=\"auth__switch\">\u00BFYa ten\u00E9s cuenta? <a routerLink=\"/login\">Inici\u00E1 sesi\u00F3n</a></p>\r\n    }\r\n  </div>\r\n</section>\r\n", styles: [".auth {\r\n  position: relative;\r\n  min-height: 100dvh;\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n  padding: 2.5rem 1rem 3rem;\r\n  background:\r\n    linear-gradient(180deg, rgba(10, 12, 20, 0.45) 0%, rgba(10, 12, 20, 0.75) 100%),\r\n    var(--auth-bg-image, none) center / cover no-repeat,\r\n    radial-gradient(circle at 20% 10%, rgba(216, 71, 30, 0.3), transparent 45%),\r\n    radial-gradient(circle at 85% 85%, rgba(14, 70, 161, 0.35), transparent 45%),\r\n    var(--color-dark);\r\n}\r\n\r\n.auth__back {\r\n  position: absolute;\r\n  top: 1.25rem;\r\n  left: 1.25rem;\r\n  z-index: 1;\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 0.45rem;\r\n  min-height: 42px;\r\n  padding: 0 1rem;\r\n  border: 1px solid rgba(255, 255, 255, 0.3);\r\n  border-radius: var(--radius-pill);\r\n  background: rgba(20, 22, 31, 0.72);\r\n  color: #fff;\r\n  font-size: 0.9rem;\r\n  font-weight: 700;\r\n  text-decoration: none;\r\n  backdrop-filter: blur(8px);\r\n  transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;\r\n}\r\n\r\n.auth__back:hover {\r\n  background: rgba(20, 22, 31, 0.92);\r\n  border-color: rgba(255, 255, 255, 0.55);\r\n  transform: translateX(-2px);\r\n}\r\n\r\n.auth__back:focus-visible {\r\n  outline: 3px solid color-mix(in srgb, var(--color-accent) 65%, transparent);\r\n  outline-offset: 3px;\r\n}\r\n\r\n.auth__card {\r\n  width: 100%;\r\n  max-width: 440px;\r\n  background: var(--color-surface);\r\n  border: 1px solid var(--color-border);\r\n  border-radius: var(--radius-lg);\r\n  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);\r\n  padding: 2.25rem 2rem;\r\n}\r\n\r\n.auth__brand {\r\n  display: block;\r\n  text-decoration: none;\r\n  text-align: center;\r\n  font-size: 1.3rem;\r\n  font-weight: 700;\r\n  letter-spacing: -0.01em;\r\n  color: var(--color-text);\r\n  margin-bottom: 1.25rem;\r\n}\r\n\r\n.auth__brand img {\r\n  display: block;\r\n  height: 44px;\r\n  width: auto;\r\n  margin: 0 auto;\r\n}\r\n\r\n.auth__title {\r\n  margin: 0 0 0.25rem;\r\n  font-size: 1.5rem;\r\n  font-weight: 800;\r\n  color: var(--color-text);\r\n  text-align: center;\r\n}\r\n\r\n.auth__subtitle {\r\n  margin: 0 0 1.75rem;\r\n  color: var(--color-text-muted);\r\n  font-size: 0.9rem;\r\n  text-align: center;\r\n}\r\n\r\n.auth__form {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 1.1rem;\r\n}\r\n\r\n.auth__row {\r\n  display: grid;\r\n  grid-template-columns: 1fr 1fr;\r\n  gap: 1rem;\r\n}\r\n\r\n@media (max-width: 480px) {\r\n  .auth {\r\n    align-items: flex-start;\r\n    padding-top: 5.25rem;\r\n  }\r\n\r\n  .auth__back {\r\n    top: 1rem;\r\n    left: 1rem;\r\n  }\r\n\r\n  .auth__card {\r\n    padding: 1.75rem 1.25rem;\r\n  }\r\n\r\n  .auth__row {\r\n    grid-template-columns: 1fr;\r\n  }\r\n}\r\n\r\n.auth__field {\r\n  min-width: 0;\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 0.4rem;\r\n}\r\n\r\n.auth__field label {\r\n  font-size: 0.85rem;\r\n  font-weight: 600;\r\n  color: var(--color-text);\r\n}\r\n\r\n.auth__field input {\r\n  min-width: 0;\r\n  width: 100%;\r\n  padding: 0.7rem 0.9rem;\r\n  border-radius: var(--radius-sm);\r\n  border: 1px solid var(--color-border);\r\n  font-size: 1rem;\r\n  color: var(--color-text);\r\n  background: #fff;\r\n}\r\n\r\n.auth__field input::placeholder {\r\n  color: #98a2b3;\r\n}\r\n\r\n.auth__field input:focus {\r\n  outline: none;\r\n  border-color: var(--color-primary);\r\n  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 25%, transparent);\r\n}\r\n\r\n.auth__hint {\r\n  font-size: 0.78rem;\r\n  color: var(--color-text-muted);\r\n}\r\n\r\n.auth__hint--error {\r\n  color: var(--color-danger);\r\n}\r\n\r\n.auth__error {\r\n  background: #fef2f2;\r\n  border: 1px solid var(--color-danger);\r\n  color: #b91c1c;\r\n  padding: 0.6rem 0.75rem;\r\n  border-radius: var(--radius-sm);\r\n  font-size: 0.85rem;\r\n}\r\n\r\n.auth__success {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 0.75rem;\r\n  text-align: center;\r\n  color: var(--color-text);\r\n}\r\n\r\n.auth__success p {\r\n  margin: 0;\r\n  color: var(--color-text-muted);\r\n}\r\n\r\n.auth__switch {\r\n  margin: 1.5rem 0 0;\r\n  text-align: center;\r\n  font-size: 0.88rem;\r\n  color: var(--color-text-muted);\r\n}\r\n\r\n.auth__switch a {\r\n  color: var(--color-accent);\r\n  font-weight: 600;\r\n  text-decoration: none;\r\n}\r\n\r\n.auth__switch a:hover {\r\n  text-decoration: underline;\r\n}\r\n\r\n.btn {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 0.75rem 1.25rem;\r\n  border-radius: var(--radius-pill);\r\n  border: none;\r\n  font-weight: 700;\r\n  cursor: pointer;\r\n  font-size: 1rem;\r\n}\r\n\r\n.btn--primary {\r\n  background: var(--color-accent);\r\n  color: #1a1200;\r\n  box-shadow: 0 8px 20px color-mix(in srgb, var(--color-accent) 45%, transparent);\r\n}\r\n\r\n.btn--primary:hover {\r\n  background: color-mix(in srgb, var(--color-accent) 88%, black);\r\n}\r\n\r\n.btn--secondary {\r\n  border: 1px solid var(--color-border);\r\n  background: var(--color-surface);\r\n  color: var(--color-text);\r\n}\r\n\r\n.auth__edit {\r\n  align-self: center;\r\n  border: 0;\r\n  padding: 0.25rem;\r\n  color: var(--color-text);\r\n  background: transparent;\r\n  text-decoration: underline;\r\n  cursor: pointer;\r\n}\r\n\r\n.btn:disabled {\r\n  opacity: 0.6;\r\n  cursor: not-allowed;\r\n}\r\n\r\n.password-field {\r\n  position: relative;\r\n}\r\n\r\n.password-field input {\r\n  width: 100%;\r\n  padding-right: 2.75rem;\r\n}\r\n\r\n.password-toggle {\r\n  position: absolute;\r\n  top: 50%;\r\n  right: 0.4rem;\r\n  translate: 0 -50%;\r\n  display: grid;\r\n  place-items: center;\r\n  width: 2rem;\r\n  height: 2rem;\r\n  border: 0;\r\n  border-radius: 50%;\r\n  background: transparent;\r\n  color: var(--color-text-muted);\r\n  cursor: pointer;\r\n}\r\n\r\n.password-toggle:hover {\r\n  color: var(--color-text);\r\n  background: var(--color-bg);\r\n}\r\n.terminos-consentimiento { margin: 1rem 0; font-size: .92rem; line-height: 1.5; }\r\n.terminos-consentimiento label { display: flex; align-items: flex-start; gap: .6rem; }\r\n.terminos-consentimiento input { flex: 0 0 auto; margin-top: .3rem; }\r\n.terminos-consentimiento a { color: #a64f31; text-decoration: underline; }\r\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(RegisterComponent, { className: "RegisterComponent", filePath: "src/app/features/auth/register/register.component.ts", lineNumber: 28 }); })();
