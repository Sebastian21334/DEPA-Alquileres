import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LucideBadgeCheck, LucideCamera, LucideCalendarDays, LucideClock, LucideExternalLink, LucideHeart, LucideLayers, LucidePencil, LucidePlus, LucideTrash2, } from '@lucide/angular';
import { PerfilService } from '../../core/services/perfil.service';
import { etiquetaRol } from '../../shared/models/perfil.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { CambiarContraseniaComponent } from './cambiar-contrasenia.component';
import { CbuAnuncianteComponent } from '../../shared/components/cbu-anunciante/cbu-anunciante.component';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
const _c0 = a0 => ["/perfil", a0];
function MiPerfilComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 2);
    i0.ɵɵelement(1, "app-spinner");
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3, "Cargando tu perfil\u2026");
    i0.ɵɵelementEnd()();
} }
function MiPerfilComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 2)(1, "h1");
    i0.ɵɵtext(2, "No pudimos cargar tu perfil");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "a", 3);
    i0.ɵɵtext(6, "Volver al inicio");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.error());
} }
function MiPerfilComponent_Conditional_4_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 48);
    i0.ɵɵlistener("click", function MiPerfilComponent_Conditional_4_Conditional_13_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.quitarFoto()); });
    i0.ɵɵtext(1, " Quitar foto ");
    i0.ɵɵelementEnd();
} }
function MiPerfilComponent_Conditional_4_Case_20_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 19);
    i0.ɵɵtext(1, "Actividades pausadas");
    i0.ɵɵelementEnd();
} }
function MiPerfilComponent_Conditional_4_Case_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 49);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 50);
    i0.ɵɵtext(2, " Anunciante verificado");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, MiPerfilComponent_Conditional_4_Case_20_Conditional_3_Template, 2, 0, "span", 19);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 14);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.solicitud()?.anunciante?.actividades_pausadas ? 3 : -1);
} }
function MiPerfilComponent_Conditional_4_Case_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 18);
    i0.ɵɵtext(1, "Verificaci\u00F3n rechazada");
    i0.ɵɵelementEnd();
} }
function MiPerfilComponent_Conditional_4_Case_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 19);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 51);
    i0.ɵɵtext(2, " Verificaci\u00F3n pendiente");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 14);
} }
function MiPerfilComponent_Conditional_4_Case_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 19);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 51);
    i0.ɵɵtext(2, " Verificaci\u00F3n reenviada");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 14);
} }
function MiPerfilComponent_Conditional_4_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 18);
    i0.ɵɵtext(1, "Cuenta bloqueada");
    i0.ɵɵelementEnd();
} }
function MiPerfilComponent_Conditional_4_Conditional_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 20);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 52);
    i0.ɵɵtext(2, " Ver perfil p\u00FAblico ");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const p_r4 = i0.ɵɵnextContext();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(2, _c0, p_r4.id));
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 18);
} }
function MiPerfilComponent_Conditional_4_Conditional_26_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 21);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.errorFoto());
} }
function MiPerfilComponent_Conditional_4_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 23);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 53);
    i0.ɵɵtext(2, " Mis publicaciones");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 25);
} }
function MiPerfilComponent_Conditional_4_Conditional_35_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-cbu-anunciante");
} }
function MiPerfilComponent_Conditional_4_Conditional_41_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 54);
    i0.ɵɵlistener("click", function MiPerfilComponent_Conditional_4_Conditional_41_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.empezarEdicion()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 55);
    i0.ɵɵtext(2, " Editar ");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 15);
} }
function MiPerfilComponent_Conditional_4_Conditional_42_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 33);
    i0.ɵɵtext(1, " Tus datos se actualizaron correctamente. ");
    i0.ɵɵelementEnd();
} }
function MiPerfilComponent_Conditional_4_Conditional_43_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 57);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.errorEdicion());
} }
function MiPerfilComponent_Conditional_4_Conditional_43_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 61);
    i0.ɵɵtext(1, "M\u00EDnimo 2 caracteres.");
    i0.ɵɵelementEnd();
} }
function MiPerfilComponent_Conditional_4_Conditional_43_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 61);
    i0.ɵɵtext(1, "M\u00EDnimo 2 caracteres.");
    i0.ɵɵelementEnd();
} }
function MiPerfilComponent_Conditional_4_Conditional_43_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 61);
    i0.ɵɵtext(1, "Ingres\u00E1 un tel\u00E9fono (m\u00E1ximo 20 caracteres).");
    i0.ɵɵelementEnd();
} }
function MiPerfilComponent_Conditional_4_Conditional_43_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 56);
    i0.ɵɵlistener("ngSubmit", function MiPerfilComponent_Conditional_4_Conditional_43_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r6); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.guardar()); });
    i0.ɵɵconditionalCreate(1, MiPerfilComponent_Conditional_4_Conditional_43_Conditional_1_Template, 2, 1, "div", 57);
    i0.ɵɵelementStart(2, "div", 58)(3, "label", 59);
    i0.ɵɵtext(4, "Nombre");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(5, "input", 60);
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(6, MiPerfilComponent_Conditional_4_Conditional_43_Conditional_6_Template, 2, 0, "span", 61);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "div", 58)(8, "label", 62);
    i0.ɵɵtext(9, "Apellido");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(10, "input", 63);
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(11, MiPerfilComponent_Conditional_4_Conditional_43_Conditional_11_Template, 2, 0, "span", 61);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "div", 58)(13, "label", 64);
    i0.ɵɵtext(14, "Tel\u00E9fono");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(15, "input", 65);
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(16, MiPerfilComponent_Conditional_4_Conditional_43_Conditional_16_Template, 2, 0, "span", 61);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "div", 66)(18, "button", 67);
    i0.ɵɵlistener("click", function MiPerfilComponent_Conditional_4_Conditional_43_Template_button_click_18_listener() { i0.ɵɵrestoreView(_r6); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.cancelarEdicion()); });
    i0.ɵɵtext(19, " Cancelar ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "button", 68);
    i0.ɵɵtext(21);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("formGroup", ctx_r0.form);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.errorEdicion() ? 1 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.invalido("nombre") ? 6 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.invalido("apellido") ? 11 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.invalido("telefono") ? 16 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r0.guardando());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r0.guardando());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.guardando() ? "Guardando\u2026" : "Guardar cambios", " ");
} }
function MiPerfilComponent_Conditional_4_Conditional_44_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2, "Estado de la cuenta");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "dd");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const p_r4 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(p_r4.bloqueado ? "Bloqueada" : !p_r4.activa ? "Inactiva" : "Habilitada");
} }
function MiPerfilComponent_Conditional_4_Conditional_44_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "dl", 35)(1, "div")(2, "dt");
    i0.ɵɵtext(3, "Nombre");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "div")(7, "dt");
    i0.ɵɵtext(8, "Apellido");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "dd");
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "div")(12, "dt");
    i0.ɵɵtext(13, "Correo");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "dd");
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(16, "div")(17, "dt");
    i0.ɵɵtext(18, "Tel\u00E9fono");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "dd");
    i0.ɵɵtext(20);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(21, MiPerfilComponent_Conditional_4_Conditional_44_Conditional_21_Template, 5, 1, "div");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const p_r4 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(p_r4.nombre);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(p_r4.apellido);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(p_r4.email);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(p_r4.telefono || "\u2014");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.solicitud()?.estado !== "aprobada" ? 21 : -1);
} }
function MiPerfilComponent_Conditional_4_Conditional_49_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 38);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 69);
    i0.ɵɵtext(2, " Publicar propiedad ");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 16);
} }
function MiPerfilComponent_Conditional_4_Case_50_Conditional_27_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p", 71);
    i0.ɵɵtext(1, " Pod\u00E9s seguir gestionando tus reservas y solicitar la baja cuando resuelvas tus compromisos pendientes. ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "button", 67);
    i0.ɵɵlistener("click", function MiPerfilComponent_Conditional_4_Case_50_Conditional_27_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r7); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.cambiarPausaActividades(false)); });
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r0.cambiandoPausa());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.cambiandoPausa() ? "Reanudando\u2026" : "Reanudar actividades", " ");
} }
function MiPerfilComponent_Conditional_4_Case_50_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, " Tus publicaciones saldr\u00E1n del cat\u00E1logo y dejar\u00E1n de recibir nuevas reservas. Vas a conservar el acceso a tu cuenta, tus reservas, tus pagos y tu historial. ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "div", 66)(3, "button", 67);
    i0.ɵɵlistener("click", function MiPerfilComponent_Conditional_4_Case_50_Conditional_28_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r8); const ctx_r0 = i0.ɵɵnextContext(3); ctx_r0.confirmarPausa.set(false); return i0.ɵɵresetView(ctx_r0.errorPausa.set("")); });
    i0.ɵɵtext(4, " Volver ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "button", 72);
    i0.ɵɵlistener("click", function MiPerfilComponent_Conditional_4_Case_50_Conditional_28_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r8); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.cambiarPausaActividades(true)); });
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("disabled", ctx_r0.cambiandoPausa());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r0.cambiandoPausa());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.cambiandoPausa() ? "Pausando\u2026" : "Confirmar pausa", " ");
} }
function MiPerfilComponent_Conditional_4_Case_50_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, " Paus\u00E1 las nuevas reservas de todas tus publicaciones mientras termin\u00E1s de atender las que ya ten\u00E9s. ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "button", 73);
    i0.ɵɵlistener("click", function MiPerfilComponent_Conditional_4_Case_50_Conditional_29_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r9); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.confirmarPausa.set(true)); });
    i0.ɵɵtext(3, " Pausar actividades ");
    i0.ɵɵelementEnd();
} }
function MiPerfilComponent_Conditional_4_Case_50_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 57);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.errorPausa());
} }
function MiPerfilComponent_Conditional_4_Case_50_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "dl", 35)(1, "div")(2, "dt");
    i0.ɵɵtext(3, "Tipo de anunciante");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "div")(7, "dt");
    i0.ɵɵtext(8, "CUIT / CUIL");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "dd");
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "div")(12, "dt");
    i0.ɵɵtext(13, "Contacto");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "dd");
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(16, "div")(17, "dt");
    i0.ɵɵtext(18, "Verificado el");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "dd");
    i0.ɵɵtext(20);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(21, "div")(22, "dt");
    i0.ɵɵtext(23, "Estado de la cuenta");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "dd");
    i0.ɵɵtext(25);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(26, "div", 70);
    i0.ɵɵconditionalCreate(27, MiPerfilComponent_Conditional_4_Case_50_Conditional_27_Template, 4, 2)(28, MiPerfilComponent_Conditional_4_Case_50_Conditional_28_Template, 7, 3)(29, MiPerfilComponent_Conditional_4_Case_50_Conditional_29_Template, 4, 0);
    i0.ɵɵconditionalCreate(30, MiPerfilComponent_Conditional_4_Case_50_Conditional_30_Template, 2, 1, "p", 57);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const p_r4 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext();
    const s_r10 = ctx_r0.solicitud();
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(s_r10.anunciante.tipoAnunciante?.nombre ?? "\u2014");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(s_r10.anunciante.cuit_cuil ?? "\u2014");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(s_r10.anunciante.numero_contacto);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.fecha(s_r10.actualizada_en));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(p_r4.bloqueado ? "Bloqueada" : !p_r4.activa ? "Inactiva" : "Habilitada");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(s_r10.anunciante.actividades_pausadas ? 27 : ctx_r0.confirmarPausa() ? 28 : 29);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r0.errorPausa() ? 30 : -1);
} }
function MiPerfilComponent_Conditional_4_Case_51_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "br");
    i0.ɵɵtext(1);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Motivo: ", ctx_r0.solicitud()?.motivo_rechazo, " ");
} }
function MiPerfilComponent_Conditional_4_Case_51_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 74)(1, "strong");
    i0.ɵɵtext(2, "Tu verificaci\u00F3n fue rechazada.");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, MiPerfilComponent_Conditional_4_Case_51_Conditional_3_Template, 2, 1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p");
    i0.ɵɵtext(5, " Correg\u00ED la documentaci\u00F3n y volv\u00E9 a enviarla para que un administrador la revise. ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "div", 66)(7, "a", 75);
    i0.ɵɵtext(8, "Reenviar documentaci\u00F3n");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r0.solicitud()?.motivo_rechazo ? 3 : -1);
} }
function MiPerfilComponent_Conditional_4_Case_52_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, " \u00BFTen\u00E9s propiedades para alquilar? Convertite en anunciante: carg\u00E1 tus datos y tu documentaci\u00F3n de identidad, y una vez aprobada vas a poder publicar. ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "div", 66)(3, "a", 75);
    i0.ɵɵtext(4, "Quiero ser anunciante");
    i0.ɵɵelementEnd()();
} }
function MiPerfilComponent_Conditional_4_Case_53_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 76);
    i0.ɵɵtext(1, " Tu documentaci\u00F3n est\u00E1 en revisi\u00F3n. Te avisamos por email cuando un administrador la apruebe. ");
    i0.ɵɵelementEnd();
} }
function MiPerfilComponent_Conditional_4_Case_53_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 76);
    i0.ɵɵtext(1, " Ya cargaste tus datos. Falta subir la documentaci\u00F3n de identidad para completar la solicitud. ");
    i0.ɵɵelementEnd();
} }
function MiPerfilComponent_Conditional_4_Case_53_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, MiPerfilComponent_Conditional_4_Case_53_Conditional_0_Template, 2, 0, "div", 76)(1, MiPerfilComponent_Conditional_4_Case_53_Conditional_1_Template, 2, 0, "div", 76);
    i0.ɵɵelementStart(2, "div", 66)(3, "a", 75);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional(ctx_r0.solicitud()?.dni_frente_url ? 0 : 1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.solicitud()?.dni_frente_url ? "Ver estado de la solicitud" : "Subir documentaci\u00F3n", " ");
} }
function MiPerfilComponent_Conditional_4_Conditional_63_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 77);
    i0.ɵɵlistener("click", function MiPerfilComponent_Conditional_4_Conditional_63_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r11); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.mostrarConfirmacionBaja.set(true)); });
    i0.ɵɵtext(1, " Solicitar baja ");
    i0.ɵɵelementEnd();
} }
function MiPerfilComponent_Conditional_4_Conditional_64_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " Tus publicaciones dejar\u00E1n de estar disponibles. ");
} }
function MiPerfilComponent_Conditional_4_Conditional_64_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 74);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.errorBaja());
} }
function MiPerfilComponent_Conditional_4_Conditional_64_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 46)(1, "strong");
    i0.ɵɵtext(2, "\u00BFQuer\u00E9s solicitar la baja de tu cuenta?");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4, "Te enviaremos un enlace a tu correo. La baja se aplica cuando la confirmes desde ese enlace.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p");
    i0.ɵɵtext(6, " Perder\u00E1s el acceso a DEPA. ");
    i0.ɵɵconditionalCreate(7, MiPerfilComponent_Conditional_4_Conditional_64_Conditional_7_Template, 1, 0);
    i0.ɵɵtext(8, " Las reservas y pagos registrados se conservar\u00E1n como historial. Si volv\u00E9s a registrarte con el mismo email, podr\u00E1s recuperar esta cuenta o crear una nueva. Si ten\u00E9s reservas, estad\u00EDas, pagos, liquidaciones o reclamos pendientes de resolver, como inquilino o como anunciante, no vas a poder dar de baja la cuenta hasta regularizarlos. Esta acci\u00F3n no cancela ni reembolsa operaciones. ");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(9, MiPerfilComponent_Conditional_4_Conditional_64_Conditional_9_Template, 2, 1, "p", 74);
    i0.ɵɵelementStart(10, "div", 66)(11, "button", 67);
    i0.ɵɵlistener("click", function MiPerfilComponent_Conditional_4_Conditional_64_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r12); const ctx_r0 = i0.ɵɵnextContext(2); ctx_r0.mostrarConfirmacionBaja.set(false); return i0.ɵɵresetView(ctx_r0.errorBaja.set("")); });
    i0.ɵɵtext(12, " Cancelar ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "button", 78);
    i0.ɵɵlistener("click", function MiPerfilComponent_Conditional_4_Conditional_64_Template_button_click_13_listener() { i0.ɵɵrestoreView(_r12); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.solicitarBajaCuenta()); });
    i0.ɵɵtext(14);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(7);
    i0.ɵɵconditional(ctx_r0.solicitud()?.estado === "aprobada" ? 7 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.errorBaja() ? 9 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r0.solicitandoBaja());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r0.solicitandoBaja());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.solicitandoBaja() ? "Enviando\u2026" : "Enviar correo de confirmaci\u00F3n", " ");
} }
function MiPerfilComponent_Conditional_4_Conditional_65_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 47);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.mensajeBaja());
} }
function MiPerfilComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "h1", 4);
    i0.ɵɵtext(1, "Mi perfil");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "article", 5)(3, "header", 6)(4, "div", 7)(5, "label", 8)(6, "input", 9);
    i0.ɵɵlistener("change", function MiPerfilComponent_Conditional_4_Template_input_change_6_listener($event) { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.elegirFoto($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelement(7, "app-avatar", 10);
    i0.ɵɵelementStart(8, "span", 11);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(9, "svg", 12);
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(11, "span", 13);
    i0.ɵɵtext(12, "Cambiar foto de perfil");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(13, MiPerfilComponent_Conditional_4_Conditional_13_Template, 2, 0, "button", 14);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "div", 15)(15, "h2");
    i0.ɵɵtext(16);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "div", 16)(18, "span", 17);
    i0.ɵɵtext(19);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(20, MiPerfilComponent_Conditional_4_Case_20_Template, 4, 2)(21, MiPerfilComponent_Conditional_4_Case_21_Template, 2, 0, "span", 18)(22, MiPerfilComponent_Conditional_4_Case_22_Template, 3, 1, "span", 19)(23, MiPerfilComponent_Conditional_4_Case_23_Template, 3, 1, "span", 19);
    i0.ɵɵconditionalCreate(24, MiPerfilComponent_Conditional_4_Conditional_24_Template, 2, 0, "span", 18);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(25, MiPerfilComponent_Conditional_4_Conditional_25_Template, 3, 4, "a", 20);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(26, MiPerfilComponent_Conditional_4_Conditional_26_Template, 2, 1, "div", 21);
    i0.ɵɵelementStart(27, "nav", 22);
    i0.ɵɵconditionalCreate(28, MiPerfilComponent_Conditional_4_Conditional_28_Template, 3, 1, "a", 23);
    i0.ɵɵelementStart(29, "a", 24);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(30, "svg", 25);
    i0.ɵɵtext(31, " Mis reservas");
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(32, "a", 26);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(33, "svg", 27);
    i0.ɵɵtext(34, " Mis favoritos");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(35, MiPerfilComponent_Conditional_4_Conditional_35_Template, 1, 0, "app-cbu-anunciante");
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(36, "div", 28)(37, "section", 29)(38, "div", 30)(39, "h2", 31);
    i0.ɵɵtext(40, "Datos personales");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(41, MiPerfilComponent_Conditional_4_Conditional_41_Template, 3, 1, "button", 32);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(42, MiPerfilComponent_Conditional_4_Conditional_42_Template, 2, 0, "div", 33);
    i0.ɵɵconditionalCreate(43, MiPerfilComponent_Conditional_4_Conditional_43_Template, 22, 8, "form", 34)(44, MiPerfilComponent_Conditional_4_Conditional_44_Template, 22, 5, "dl", 35);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(45, "section", 36)(46, "div", 30)(47, "h2", 37);
    i0.ɵɵtext(48, "Cuenta de anunciante");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(49, MiPerfilComponent_Conditional_4_Conditional_49_Template, 3, 1, "a", 38);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(50, MiPerfilComponent_Conditional_4_Case_50_Template, 31, 7)(51, MiPerfilComponent_Conditional_4_Case_51_Template, 9, 1)(52, MiPerfilComponent_Conditional_4_Case_52_Template, 5, 0)(53, MiPerfilComponent_Conditional_4_Case_53_Template, 5, 2);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(54, "section", 39)(55, "h2", 40);
    i0.ɵɵtext(56, "Configuraci\u00F3n de la cuenta");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(57, "app-cambiar-contrasenia");
    i0.ɵɵelementStart(58, "section", 41)(59, "div", 42)(60, "h3", 43);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(61, "svg", 44);
    i0.ɵɵtext(62, " Baja de cuenta ");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(63, MiPerfilComponent_Conditional_4_Conditional_63_Template, 2, 0, "button", 45);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(64, MiPerfilComponent_Conditional_4_Conditional_64_Template, 15, 5, "div", 46);
    i0.ɵɵconditionalCreate(65, MiPerfilComponent_Conditional_4_Conditional_65_Template, 2, 1, "p", 47);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    let tmp_12_0;
    let tmp_24_0;
    const p_r4 = ctx;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵclassProp("is-busy", ctx_r0.subiendoFoto());
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r0.subiendoFoto());
    i0.ɵɵadvance();
    i0.ɵɵproperty("foto", p_r4.foto_url)("nombre", ctx_r0.nombreCompleto())("usarDosIniciales", true);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 22);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.subiendoFoto() ? "Subiendo\u2026" : p_r4.foto_url ? "Cambiar" : "Subir foto", " ");
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(p_r4.foto_url && !ctx_r0.subiendoFoto() ? 13 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.nombreCompleto());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.rol());
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_12_0 = ctx_r0.solicitud()?.estado) === "aprobada" ? 20 : tmp_12_0 === "rechazada" ? 21 : tmp_12_0 === "pendiente" ? 22 : tmp_12_0 === "reenviada" ? 23 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(p_r4.bloqueado ? 24 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.solicitud()?.estado === "aprobada" ? 25 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.errorFoto() ? 26 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.solicitud()?.estado === "aprobada" ? 28 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 25);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("size", 25);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.solicitud()?.estado === "aprobada" ? 35 : -1);
    i0.ɵɵadvance(6);
    i0.ɵɵconditional(!ctx_r0.editando() ? 41 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.guardado() ? 42 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.editando() ? 43 : 44);
    i0.ɵɵadvance(6);
    i0.ɵɵconditional(ctx_r0.solicitud()?.estado === "aprobada" && ctx_r0.solicitud()?.cbu_ultimos_digitos ? 49 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_24_0 = ctx_r0.solicitud()?.estado) === "aprobada" ? 50 : tmp_24_0 === "rechazada" ? 51 : tmp_24_0 === undefined ? 52 : 53);
    i0.ɵɵadvance(11);
    i0.ɵɵproperty("size", 20);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!ctx_r0.mostrarConfirmacionBaja() ? 63 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.mostrarConfirmacionBaja() ? 64 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.mensajeBaja() ? 65 : -1);
} }
const TIPOS_FOTO = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_FOTO = 5 * 1024 * 1024;
// Perfil del usuario logueado (se accede desde el avatar del header): datos
// personales editables, tipo de usuario y acceso al alta como anunciante.
export class MiPerfilComponent {
    perfilService = inject(PerfilService);
    fb = inject(FormBuilder);
    perfil = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "perfil" }] : /* istanbul ignore next */ []));
    solicitud = this.perfilService.solicitud;
    cargando = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cargando" }] : /* istanbul ignore next */ []));
    error = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    subiendoFoto = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "subiendoFoto" }] : /* istanbul ignore next */ []));
    errorFoto = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorFoto" }] : /* istanbul ignore next */ []));
    editando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "editando" }] : /* istanbul ignore next */ []));
    guardando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "guardando" }] : /* istanbul ignore next */ []));
    errorEdicion = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorEdicion" }] : /* istanbul ignore next */ []));
    guardado = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "guardado" }] : /* istanbul ignore next */ []));
    mostrarConfirmacionBaja = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mostrarConfirmacionBaja" }] : /* istanbul ignore next */ []));
    solicitandoBaja = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "solicitandoBaja" }] : /* istanbul ignore next */ []));
    mensajeBaja = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mensajeBaja" }] : /* istanbul ignore next */ []));
    errorBaja = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorBaja" }] : /* istanbul ignore next */ []));
    confirmarPausa = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "confirmarPausa" }] : /* istanbul ignore next */ []));
    cambiandoPausa = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cambiandoPausa" }] : /* istanbul ignore next */ []));
    errorPausa = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorPausa" }] : /* istanbul ignore next */ []));
    // Mismas reglas que ActualizarUsuarioDto (back/src/usuarios/dto/actualizar-usuario.dto.ts).
    form = this.fb.nonNullable.group({
        nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
        apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
        telefono: ['', [Validators.required, Validators.maxLength(20)]],
    });
    nombreCompleto = computed(() => {
        const p = this.perfil();
        return p ? `${p.nombre} ${p.apellido}`.trim() : '';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "nombreCompleto" }] : /* istanbul ignore next */ []));
    rol = computed(() => etiquetaRol(this.perfil()?.rol?.nombre), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "rol" }] : /* istanbul ignore next */ []));
    constructor() {
        forkJoin({
            perfil: this.perfilService.getPerfil(),
            solicitud: this.perfilService.cargarSolicitud(true),
        }).subscribe({
            next: ({ perfil }) => {
                this.perfil.set(perfil);
                this.cargando.set(false);
            },
            error: (err) => {
                this.error.set(err.message);
                this.cargando.set(false);
            },
        });
    }
    empezarEdicion() {
        const p = this.perfil();
        if (!p)
            return;
        this.form.reset({ nombre: p.nombre, apellido: p.apellido, telefono: p.telefono ?? '' });
        this.errorEdicion.set('');
        this.guardado.set(false);
        this.editando.set(true);
    }
    cancelarEdicion() {
        this.editando.set(false);
        this.errorEdicion.set('');
    }
    guardar() {
        const p = this.perfil();
        if (!p || this.guardando())
            return;
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        const v = this.form.getRawValue();
        this.guardando.set(true);
        this.errorEdicion.set('');
        this.perfilService
            .actualizarPerfil(p.id, { nombre: v.nombre.trim(), apellido: v.apellido.trim(), telefono: v.telefono.trim() })
            .subscribe({
            next: (actualizado) => {
                this.perfil.set(actualizado);
                this.guardando.set(false);
                this.editando.set(false);
                this.guardado.set(true);
            },
            error: (err) => {
                this.errorEdicion.set(err.message);
                this.guardando.set(false);
            },
        });
    }
    elegirFoto(event) {
        const input = event.target;
        const archivo = input.files?.[0];
        input.value = '';
        if (!archivo)
            return;
        // Mismas reglas que POST /usuarios/me/foto, para avisar antes de subir.
        if (!TIPOS_FOTO.includes(archivo.type)) {
            this.errorFoto.set('La foto tiene que ser una imagen JPG, PNG, WEBP o HEIC.');
            return;
        }
        if (archivo.size > MAX_FOTO) {
            this.errorFoto.set('La foto no puede pesar más de 5 MB.');
            return;
        }
        this.errorFoto.set('');
        this.subiendoFoto.set(true);
        this.perfilService.subirFoto(archivo).subscribe({
            next: (perfil) => {
                this.perfil.set(perfil);
                this.subiendoFoto.set(false);
            },
            error: (err) => {
                this.errorFoto.set(err.message);
                this.subiendoFoto.set(false);
            },
        });
    }
    quitarFoto() {
        this.errorFoto.set('');
        this.subiendoFoto.set(true);
        this.perfilService.eliminarFoto().subscribe({
            next: (perfil) => {
                this.perfil.set(perfil);
                this.subiendoFoto.set(false);
            },
            error: (err) => {
                this.errorFoto.set(err.message);
                this.subiendoFoto.set(false);
            },
        });
    }
    cambiarPausaActividades(pausadas) {
        if (this.cambiandoPausa())
            return;
        this.cambiandoPausa.set(true);
        this.errorPausa.set('');
        this.perfilService.cambiarPausaActividades(pausadas).subscribe({
            next: () => {
                this.confirmarPausa.set(false);
                this.cambiandoPausa.set(false);
            },
            error: (err) => {
                this.errorPausa.set(err.message);
                this.cambiandoPausa.set(false);
            },
        });
    }
    solicitarBajaCuenta() {
        if (this.solicitandoBaja())
            return;
        this.solicitandoBaja.set(true);
        this.errorBaja.set('');
        this.mensajeBaja.set('');
        this.perfilService.solicitarBajaCuenta().subscribe({
            next: ({ mensaje }) => {
                this.mensajeBaja.set(mensaje);
                this.mostrarConfirmacionBaja.set(false);
                this.solicitandoBaja.set(false);
            },
            error: (err) => {
                this.errorBaja.set(err.message);
                this.solicitandoBaja.set(false);
            },
        });
    }
    invalido(campo) {
        const control = this.form.controls[campo];
        return control.invalid && control.touched;
    }
    fecha(valor) {
        return new Date(valor).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
    }
    static ɵfac = function MiPerfilComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || MiPerfilComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: MiPerfilComponent, selectors: [["app-mi-perfil"]], decls: 5, vars: 1, consts: [[1, "acct-page"], [1, "acct-wrap"], [1, "acct-state"], ["routerLink", "/", 1, "acct-btn", "acct-btn--ghost"], [1, "profile-title"], [1, "acct-card", "profile-card"], [1, "profile-hero"], [1, "photo"], ["title", "Cambiar foto de perfil", 1, "photo__picker"], ["type", "file", "accept", "image/jpeg,image/png,image/webp,image/heic,image/heif", 3, "change", "disabled"], [1, "profile-hero__avatar", 3, "foto", "nombre", "usarDosIniciales"], ["aria-hidden", "true", 1, "photo__overlay"], ["lucideCamera", "", 3, "size"], [1, "sr-only"], ["type", "button", 1, "photo__remove"], [1, "profile-hero__info"], [1, "profile-hero__badges"], [1, "acct-badge", "acct-badge--info"], [1, "acct-badge", "acct-badge--error"], [1, "acct-badge", "acct-badge--warn"], [1, "acct-btn", "acct-btn--ghost", "profile-public", 3, "routerLink"], ["role", "alert", 1, "acct-alert", "acct-alert--error", "photo-error"], ["aria-label", "Accesos de Mi perfil", 1, "profile-shortcuts"], ["routerLink", "/mis-publicaciones"], ["routerLink", "/mis-reservas"], ["lucideCalendarDays", "", "aria-hidden", "true", 3, "size"], ["routerLink", "/favoritos"], ["lucideHeart", "", "aria-hidden", "true", 3, "size"], [1, "profile-layout"], ["aria-labelledby", "datos-personales", 1, "profile-section"], [1, "card-head"], ["id", "datos-personales"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", "acct-btn--sm"], ["role", "status", 1, "acct-alert", "acct-alert--success", "spaced"], ["novalidate", "", 1, "edit-form", 3, "formGroup"], [1, "data-list"], ["aria-labelledby", "cuenta-anunciante", 1, "profile-section", "cuenta-anunciante"], ["id", "cuenta-anunciante"], ["routerLink", "/publicaciones/nueva", 1, "acct-btn", "acct-btn--ghost", "acct-btn--sm"], ["aria-labelledby", "configuracion-cuenta", 1, "profile-settings"], ["id", "configuracion-cuenta"], ["aria-labelledby", "titulo-baja-cuenta", 1, "delete-account"], [1, "account-setting-row"], ["id", "titulo-baja-cuenta", 1, "account-setting-label"], ["lucideTrash2", "", "aria-hidden", "true", 3, "size"], ["type", "button", 1, "acct-btn", "acct-btn--danger", "acct-btn--sm"], ["role", "alert", 1, "delete-account__warning"], ["role", "status", 1, "acct-alert", "acct-alert--success"], ["type", "button", 1, "photo__remove", 3, "click"], [1, "acct-badge", "acct-badge--ok"], ["lucideBadgeCheck", "", 3, "size"], ["lucideClock", "", 3, "size"], ["lucideExternalLink", "", "aria-hidden", "true", 3, "size"], ["lucideLayers", "", "aria-hidden", "true", 3, "size"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", "acct-btn--sm", 3, "click"], ["lucidePencil", "", 3, "size"], ["novalidate", "", 1, "edit-form", 3, "ngSubmit", "formGroup"], ["role", "alert", 1, "acct-alert", "acct-alert--error"], [1, "acct-field"], ["for", "nombre"], ["id", "nombre", "formControlName", "nombre", "autocomplete", "given-name", "maxlength", "100"], [1, "acct-hint", "acct-hint--error"], ["for", "apellido"], ["id", "apellido", "formControlName", "apellido", "autocomplete", "family-name", "maxlength", "100"], ["for", "telefono"], ["id", "telefono", "type", "tel", "formControlName", "telefono", "autocomplete", "tel", "maxlength", "20"], [1, "acct-actions"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", 3, "click", "disabled"], ["type", "submit", 1, "acct-btn", "acct-btn--primary", 3, "disabled"], ["lucidePlus", "", "aria-hidden", "true", 3, "size"], [1, "cuenta-anunciante__actividad"], ["role", "status"], ["type", "button", 1, "acct-btn", "acct-btn--primary", 3, "click", "disabled"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", 3, "click"], [1, "acct-alert", "acct-alert--error"], ["routerLink", "/mi-perfil/anunciante", 1, "acct-btn", "acct-btn--primary"], [1, "acct-alert", "acct-alert--info"], ["type", "button", 1, "acct-btn", "acct-btn--danger", "acct-btn--sm", 3, "click"], ["type", "button", 1, "acct-btn", "acct-btn--danger", 3, "click", "disabled"]], template: function MiPerfilComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "div", 1);
            i0.ɵɵconditionalCreate(2, MiPerfilComponent_Conditional_2_Template, 4, 0, "div", 2)(3, MiPerfilComponent_Conditional_3_Template, 7, 1, "div", 2)(4, MiPerfilComponent_Conditional_4_Template, 66, 28);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            let tmp_0_0;
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.cargando() ? 2 : ctx.error() ? 3 : (tmp_0_0 = ctx.perfil()) ? 4 : -1, tmp_0_0);
        } }, dependencies: [ReactiveFormsModule, i1.ɵNgNoValidate, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.MaxLengthValidator, i1.FormGroupDirective, i1.FormControlName, RouterLink,
            SpinnerComponent,
            AvatarComponent,
            CambiarContraseniaComponent,
            CbuAnuncianteComponent,
            LucideBadgeCheck,
            LucideCamera,
            LucideCalendarDays,
            LucideClock,
            LucideExternalLink,
            LucideHeart,
            LucideLayers,
            LucidePencil,
            LucidePlus,
            LucideTrash2], styles: ["@use 'perfil-base';\r\n\r\n.acct-wrap[_ngcontent-%COMP%] { max-width: 72rem; }\r\n\r\n.photo[_ngcontent-%COMP%] { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; flex-shrink: 0; }\r\n.photo__picker[_ngcontent-%COMP%] { position: relative; display: block; border-radius: 50%; cursor: pointer; }\r\n.photo__picker[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] { position: absolute; inset: 0; opacity: 0; cursor: pointer; z-index: 2; }\r\n.photo__picker[_ngcontent-%COMP%]   .profile-hero__avatar[_ngcontent-%COMP%] { box-shadow: 0 0 0 3px #fff, 0 0 0 5px var(--%NS%color-accent); transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }\r\n.photo__picker[_ngcontent-%COMP%]:hover   .profile-hero__avatar[_ngcontent-%COMP%] { transform: scale(1.05); }\r\n.photo__overlay[_ngcontent-%COMP%] {\r\n  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;\r\n  border-radius: 50%; background: rgba(16, 24, 40, 0.55); color: #fff; font-size: 0.72rem; font-weight: 700;\r\n  opacity: 0; transition: opacity 0.2s ease;\r\n}\r\n.photo__picker[_ngcontent-%COMP%]:hover   .photo__overlay[_ngcontent-%COMP%], .photo__picker[_ngcontent-%COMP%]:focus-within   .photo__overlay[_ngcontent-%COMP%], .photo__picker.is-busy[_ngcontent-%COMP%]   .photo__overlay[_ngcontent-%COMP%] { opacity: 1; }\r\n.photo__picker.is-busy[_ngcontent-%COMP%]   .photo__overlay[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { animation: depa-pulse-dot 1s infinite; }\r\n.photo__remove[_ngcontent-%COMP%] { border: 0; background: transparent; color: var(--%NS%color-text-muted); font: inherit; font-size: 0.78rem; cursor: pointer; }\r\n.photo__remove[_ngcontent-%COMP%]:hover { color: var(--%NS%color-danger); text-decoration: underline; }\r\n.sr-only[_ngcontent-%COMP%] { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }\r\n.profile-public[_ngcontent-%COMP%] { margin-left: auto; flex-shrink: 0; }\r\n.photo-error[_ngcontent-%COMP%] { margin-top: 0.75rem; }\r\n\r\n.profile-shortcuts[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  grid-auto-flow: column;\r\n  grid-auto-columns: 1fr;\r\n  align-items: center;\r\n  padding: 0.75rem 0;\r\n  border-bottom: 1px solid var(--%NS%color-border);\r\n}\r\n.profile-shortcuts[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] {\r\n  position: relative;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  gap: 0.75rem;\r\n  min-height: 3.25rem;\r\n  border-radius: 0.5rem;\r\n  padding: 0.4rem 0.75rem;\r\n  color: var(--%NS%color-text);\r\n  font-weight: 700;\r\n  text-align: center;\r\n  text-decoration: none;\r\n}\r\n.profile-shortcuts[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]    + a[_ngcontent-%COMP%]::before {\r\n  content: '';\r\n  position: absolute;\r\n  left: 0;\r\n  height: 1.65rem;\r\n  border-left: 1px solid var(--%NS%color-border);\r\n}\r\n.profile-shortcuts[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { flex: none; color: var(--%NS%color-primary); }\r\n.profile-shortcuts[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover { background: #fff7ef; color: var(--%NS%color-primary-dark); }\r\n.profile-shortcuts[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:focus-visible, .photo__picker[_ngcontent-%COMP%]:focus-within {\r\n  outline: 2px solid var(--%NS%color-primary);\r\n  outline-offset: 3px;\r\n}\r\n\r\n.profile-layout[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);\r\n  padding: 1.4rem 0;\r\n}\r\n.profile-section[_ngcontent-%COMP%] { min-width: 0; padding-inline: 0.2rem 1.35rem; }\r\n.profile-section[_ngcontent-%COMP%]    + .profile-section[_ngcontent-%COMP%] {\r\n  border-left: 1px solid var(--%NS%color-border);\r\n  padding-inline: 1.35rem 0.2rem;\r\n}\r\n\r\n\r\n.spaced[_ngcontent-%COMP%] { margin-bottom: 1rem; }\r\n.profile-section[_ngcontent-%COMP%]    > .acct-alert[_ngcontent-%COMP%]:first-of-type, .edit-form[_ngcontent-%COMP%] { margin-top: 0.75rem; }\r\n.edit-form[_ngcontent-%COMP%] { display: flex; flex-direction: column; gap: 1rem; }\r\n\r\n.cuenta-anunciante[_ngcontent-%COMP%] { display: flex; flex-direction: column; gap: 0.65rem; }\r\n.cuenta-anunciante[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%], .cuenta-anunciante[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; }\r\n.cuenta-anunciante[_ngcontent-%COMP%]   .acct-actions[_ngcontent-%COMP%] { justify-content: flex-start; }\r\n.cuenta-anunciante__actividad[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  justify-items: start;\r\n  gap: 0.65rem;\r\n  padding: 0.85rem;\r\n  background: #fbf7f0;\r\n  border: 1px solid #f1e4d3;\r\n  border-radius: 0.6rem;\r\n  font-size: 0.88rem;\r\n  line-height: 1.45;\r\n}\r\n\r\n.profile-settings[_ngcontent-%COMP%] { border-top: 1px solid var(--%NS%color-border); padding: 1rem 0.2rem 0; }\r\n.profile-settings[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin-bottom: 0.25rem; }\r\n.delete-account[_ngcontent-%COMP%] { border-top: 1px solid var(--%NS%color-border); }\r\n.account-setting-row[_ngcontent-%COMP%], .account-setting-label[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.75rem;\r\n}\r\n.account-setting-row[_ngcontent-%COMP%] { justify-content: space-between; min-height: 3.2rem; padding: 0.5rem 0.35rem; }\r\n.account-setting-label[_ngcontent-%COMP%] { margin: 0; font-size: 1rem; font-weight: 550; }\r\n.account-setting-label[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { color: var(--%NS%color-danger); flex: none; }\r\n.delete-account__warning[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); line-height: 1.5; }\r\n.delete-account__warning[_ngcontent-%COMP%] {\r\n  margin: 0.4rem 0 0.65rem;\r\n  padding: 1rem;\r\n  border: 1px solid #fecaca;\r\n  border-radius: 0.65rem;\r\n  background: #fffafa;\r\n}\r\n.delete-account__warning[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { color: var(--%NS%color-danger); }\r\n.delete-account__warning[_ngcontent-%COMP%]   .acct-actions[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; gap: 0.75rem; }\r\n\r\n@media (max-width: 820px) {\r\n  .profile-layout[_ngcontent-%COMP%] { grid-template-columns: 1fr; gap: 1rem; padding-block: 1rem; }\r\n  .profile-section[_ngcontent-%COMP%], .profile-section[_ngcontent-%COMP%]    + .profile-section[_ngcontent-%COMP%] { padding-inline: 0.2rem; }\r\n  .profile-section[_ngcontent-%COMP%]    + .profile-section[_ngcontent-%COMP%] { border-left: 0; border-top: 1px solid var(--%NS%color-border); padding-top: 1rem; }\r\n}\r\n@media (max-width: 560px) {\r\n  .profile-public[_ngcontent-%COMP%] { margin-left: 0; width: 100%; }\r\n  .profile-shortcuts[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] { min-height: 4rem; flex-direction: column; gap: 0.25rem; font-size: 0.8rem; padding-inline: 0.25rem; }\r\n  .profile-shortcuts[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { width: 20px; height: 20px; }\r\n  .account-setting-row[_ngcontent-%COMP%] { flex-wrap: wrap; }\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MiPerfilComponent, [{
        type: Component,
        args: [{ selector: 'app-mi-perfil', standalone: true, imports: [
                    ReactiveFormsModule,
                    RouterLink,
                    SpinnerComponent,
                    AvatarComponent,
                    CambiarContraseniaComponent,
                    CbuAnuncianteComponent,
                    LucideBadgeCheck,
                    LucideCamera,
                    LucideCalendarDays,
                    LucideClock,
                    LucideExternalLink,
                    LucideHeart,
                    LucideLayers,
                    LucidePencil,
                    LucidePlus,
                    LucideTrash2,
                ], template: "<section class=\"acct-page\">\r\n  <div class=\"acct-wrap\">\r\n    @if (cargando()) {\r\n      <div class=\"acct-state\">\r\n        <app-spinner />\r\n        <p>Cargando tu perfil\u2026</p>\r\n      </div>\r\n    } @else if (error()) {\r\n      <div class=\"acct-state\">\r\n        <h1>No pudimos cargar tu perfil</h1>\r\n        <p>{{ error() }}</p>\r\n        <a routerLink=\"/\" class=\"acct-btn acct-btn--ghost\">Volver al inicio</a>\r\n      </div>\r\n    } @else if (perfil(); as p) {\r\n      <h1 class=\"profile-title\">Mi perfil</h1>\r\n      <article class=\"acct-card profile-card\">\r\n        <header class=\"profile-hero\">\r\n          <div class=\"photo\">\r\n            <label\r\n              class=\"photo__picker\"\r\n              [class.is-busy]=\"subiendoFoto()\"\r\n              title=\"Cambiar foto de perfil\"\r\n            >\r\n              <input\r\n                type=\"file\"\r\n                accept=\"image/jpeg,image/png,image/webp,image/heic,image/heif\"\r\n                [disabled]=\"subiendoFoto()\"\r\n                (change)=\"elegirFoto($event)\"\r\n              />\r\n              <app-avatar\r\n                class=\"profile-hero__avatar\"\r\n                [foto]=\"p.foto_url\"\r\n                [nombre]=\"nombreCompleto()\"\r\n                [usarDosIniciales]=\"true\"\r\n              />\r\n              <span class=\"photo__overlay\" aria-hidden=\"true\">\r\n                <svg lucideCamera [size]=\"22\"></svg>\r\n                {{ subiendoFoto() ? 'Subiendo\u2026' : p.foto_url ? 'Cambiar' : 'Subir foto' }}\r\n              </span>\r\n              <span class=\"sr-only\">Cambiar foto de perfil</span>\r\n            </label>\r\n            @if (p.foto_url && !subiendoFoto()) {\r\n              <button type=\"button\" class=\"photo__remove\" (click)=\"quitarFoto()\">\r\n                Quitar foto\r\n              </button>\r\n            }\r\n          </div>\r\n          <div class=\"profile-hero__info\">\r\n            <h2>{{ nombreCompleto() }}</h2>\r\n            <div class=\"profile-hero__badges\">\r\n              <span class=\"acct-badge acct-badge--info\">{{ rol() }}</span>\r\n              @switch (solicitud()?.estado) {\r\n                @case ('aprobada') {\r\n                  <span class=\"acct-badge acct-badge--ok\"\r\n                    ><svg lucideBadgeCheck [size]=\"14\"></svg> Anunciante verificado</span\r\n                  >\r\n                  @if (solicitud()?.anunciante?.actividades_pausadas) {\r\n                    <span class=\"acct-badge acct-badge--warn\">Actividades pausadas</span>\r\n                  }\r\n                }\r\n                @case ('rechazada') {\r\n                  <span class=\"acct-badge acct-badge--error\">Verificaci\u00F3n rechazada</span>\r\n                }\r\n                @case ('pendiente') {\r\n                  <span class=\"acct-badge acct-badge--warn\"\r\n                    ><svg lucideClock [size]=\"14\"></svg> Verificaci\u00F3n pendiente</span\r\n                  >\r\n                }\r\n                @case ('reenviada') {\r\n                  <span class=\"acct-badge acct-badge--warn\"\r\n                    ><svg lucideClock [size]=\"14\"></svg> Verificaci\u00F3n reenviada</span\r\n                  >\r\n                }\r\n              }\r\n              @if (p.bloqueado) {\r\n                <span class=\"acct-badge acct-badge--error\">Cuenta bloqueada</span>\r\n              }\r\n            </div>\r\n          </div>\r\n          @if (solicitud()?.estado === 'aprobada') {\r\n            <a [routerLink]=\"['/perfil', p.id]\" class=\"acct-btn acct-btn--ghost profile-public\">\r\n              <svg lucideExternalLink [size]=\"18\" aria-hidden=\"true\"></svg> Ver perfil p\u00FAblico\r\n            </a>\r\n          }\r\n        </header>\r\n\r\n        @if (errorFoto()) {\r\n          <div class=\"acct-alert acct-alert--error photo-error\" role=\"alert\">{{ errorFoto() }}</div>\r\n        }\r\n\r\n        <nav class=\"profile-shortcuts\" aria-label=\"Accesos de Mi perfil\">\r\n          @if (solicitud()?.estado === 'aprobada') {\r\n            <a routerLink=\"/mis-publicaciones\"\r\n              ><svg lucideLayers [size]=\"25\" aria-hidden=\"true\"></svg> Mis publicaciones</a\r\n            >\r\n          }\r\n          <a routerLink=\"/mis-reservas\"\r\n            ><svg lucideCalendarDays [size]=\"25\" aria-hidden=\"true\"></svg> Mis reservas</a\r\n          >\r\n          <a routerLink=\"/favoritos\"\r\n            ><svg lucideHeart [size]=\"25\" aria-hidden=\"true\"></svg> Mis favoritos</a\r\n          >\r\n        </nav>\r\n\r\n        @if (solicitud()?.estado === 'aprobada') {\r\n          <app-cbu-anunciante />\r\n        }\r\n\r\n        <div class=\"profile-layout\">\r\n          <section class=\"profile-section\" aria-labelledby=\"datos-personales\">\r\n            <div class=\"card-head\">\r\n              <h2 id=\"datos-personales\">Datos personales</h2>\r\n              @if (!editando()) {\r\n                <button\r\n                  type=\"button\"\r\n                  class=\"acct-btn acct-btn--ghost acct-btn--sm\"\r\n                  (click)=\"empezarEdicion()\"\r\n                >\r\n                  <svg lucidePencil [size]=\"15\"></svg> Editar\r\n                </button>\r\n              }\r\n            </div>\r\n\r\n            @if (guardado()) {\r\n              <div class=\"acct-alert acct-alert--success spaced\" role=\"status\">\r\n                Tus datos se actualizaron correctamente.\r\n              </div>\r\n            }\r\n\r\n            @if (editando()) {\r\n              <form class=\"edit-form\" [formGroup]=\"form\" (ngSubmit)=\"guardar()\" novalidate>\r\n                @if (errorEdicion()) {\r\n                  <div class=\"acct-alert acct-alert--error\" role=\"alert\">{{ errorEdicion() }}</div>\r\n                }\r\n                <div class=\"acct-field\">\r\n                  <label for=\"nombre\">Nombre</label>\r\n                  <input\r\n                    id=\"nombre\"\r\n                    formControlName=\"nombre\"\r\n                    autocomplete=\"given-name\"\r\n                    maxlength=\"100\"\r\n                  />\r\n                  @if (invalido('nombre')) {\r\n                    <span class=\"acct-hint acct-hint--error\">M\u00EDnimo 2 caracteres.</span>\r\n                  }\r\n                </div>\r\n                <div class=\"acct-field\">\r\n                  <label for=\"apellido\">Apellido</label>\r\n                  <input\r\n                    id=\"apellido\"\r\n                    formControlName=\"apellido\"\r\n                    autocomplete=\"family-name\"\r\n                    maxlength=\"100\"\r\n                  />\r\n                  @if (invalido('apellido')) {\r\n                    <span class=\"acct-hint acct-hint--error\">M\u00EDnimo 2 caracteres.</span>\r\n                  }\r\n                </div>\r\n                <div class=\"acct-field\">\r\n                  <label for=\"telefono\">Tel\u00E9fono</label>\r\n                  <input\r\n                    id=\"telefono\"\r\n                    type=\"tel\"\r\n                    formControlName=\"telefono\"\r\n                    autocomplete=\"tel\"\r\n                    maxlength=\"20\"\r\n                  />\r\n                  @if (invalido('telefono')) {\r\n                    <span class=\"acct-hint acct-hint--error\"\r\n                      >Ingres\u00E1 un tel\u00E9fono (m\u00E1ximo 20 caracteres).</span\r\n                    >\r\n                  }\r\n                </div>\r\n                <div class=\"acct-actions\">\r\n                  <button\r\n                    type=\"button\"\r\n                    class=\"acct-btn acct-btn--ghost\"\r\n                    (click)=\"cancelarEdicion()\"\r\n                    [disabled]=\"guardando()\"\r\n                  >\r\n                    Cancelar\r\n                  </button>\r\n                  <button type=\"submit\" class=\"acct-btn acct-btn--primary\" [disabled]=\"guardando()\">\r\n                    {{ guardando() ? 'Guardando\u2026' : 'Guardar cambios' }}\r\n                  </button>\r\n                </div>\r\n              </form>\r\n            } @else {\r\n              <dl class=\"data-list\">\r\n                <div>\r\n                  <dt>Nombre</dt>\r\n                  <dd>{{ p.nombre }}</dd>\r\n                </div>\r\n                <div>\r\n                  <dt>Apellido</dt>\r\n                  <dd>{{ p.apellido }}</dd>\r\n                </div>\r\n                <div>\r\n                  <dt>Correo</dt>\r\n                  <dd>{{ p.email }}</dd>\r\n                </div>\r\n                <div>\r\n                  <dt>Tel\u00E9fono</dt>\r\n                  <dd>{{ p.telefono || '\u2014' }}</dd>\r\n                </div>\r\n                @if (solicitud()?.estado !== 'aprobada') {\r\n                  <div>\r\n                    <dt>Estado de la cuenta</dt>\r\n                    <dd>{{ p.bloqueado ? 'Bloqueada' : !p.activa ? 'Inactiva' : 'Habilitada' }}</dd>\r\n                  </div>\r\n                }\r\n              </dl>\r\n            }\r\n          </section>\r\n\r\n          <section class=\"profile-section cuenta-anunciante\" aria-labelledby=\"cuenta-anunciante\">\r\n            <div class=\"card-head\">\r\n              <h2 id=\"cuenta-anunciante\">Cuenta de anunciante</h2>\r\n              @if (solicitud()?.estado === 'aprobada' && solicitud()?.cbu_ultimos_digitos) {\r\n                <a routerLink=\"/publicaciones/nueva\" class=\"acct-btn acct-btn--ghost acct-btn--sm\">\r\n                  <svg lucidePlus [size]=\"16\" aria-hidden=\"true\"></svg> Publicar propiedad\r\n                </a>\r\n              }\r\n            </div>\r\n            @switch (solicitud()?.estado) {\r\n              @case ('aprobada') {\r\n                @let s = solicitud()!;\r\n                <dl class=\"data-list\">\r\n                  <div>\r\n                    <dt>Tipo de anunciante</dt>\r\n                    <dd>{{ s.anunciante.tipoAnunciante?.nombre ?? '\u2014' }}</dd>\r\n                  </div>\r\n                  <div>\r\n                    <dt>CUIT / CUIL</dt>\r\n                    <dd>{{ s.anunciante.cuit_cuil ?? '\u2014' }}</dd>\r\n                  </div>\r\n                  <div>\r\n                    <dt>Contacto</dt>\r\n                    <dd>{{ s.anunciante.numero_contacto }}</dd>\r\n                  </div>\r\n                  <div>\r\n                    <dt>Verificado el</dt>\r\n                    <dd>{{ fecha(s.actualizada_en) }}</dd>\r\n                  </div>\r\n                  <div>\r\n                    <dt>Estado de la cuenta</dt>\r\n                    <dd>{{ p.bloqueado ? 'Bloqueada' : !p.activa ? 'Inactiva' : 'Habilitada' }}</dd>\r\n                  </div>\r\n                </dl>\r\n                <div class=\"cuenta-anunciante__actividad\">\r\n                  @if (s.anunciante.actividades_pausadas) {\r\n                    <p role=\"status\">\r\n                      Pod\u00E9s seguir gestionando tus reservas y solicitar la baja cuando resuelvas tus\r\n                      compromisos pendientes.\r\n                    </p>\r\n                    <button\r\n                      type=\"button\"\r\n                      class=\"acct-btn acct-btn--ghost\"\r\n                      [disabled]=\"cambiandoPausa()\"\r\n                      (click)=\"cambiarPausaActividades(false)\"\r\n                    >\r\n                      {{ cambiandoPausa() ? 'Reanudando\u2026' : 'Reanudar actividades' }}\r\n                    </button>\r\n                  } @else if (confirmarPausa()) {\r\n                    <p>\r\n                      Tus publicaciones saldr\u00E1n del cat\u00E1logo y dejar\u00E1n de recibir nuevas reservas.\r\n                      Vas a conservar el acceso a tu cuenta, tus reservas, tus pagos y tu historial.\r\n                    </p>\r\n                    <div class=\"acct-actions\">\r\n                      <button\r\n                        type=\"button\"\r\n                        class=\"acct-btn acct-btn--ghost\"\r\n                        [disabled]=\"cambiandoPausa()\"\r\n                        (click)=\"confirmarPausa.set(false); errorPausa.set('')\"\r\n                      >\r\n                        Volver\r\n                      </button>\r\n                      <button\r\n                        type=\"button\"\r\n                        class=\"acct-btn acct-btn--primary\"\r\n                        [disabled]=\"cambiandoPausa()\"\r\n                        (click)=\"cambiarPausaActividades(true)\"\r\n                      >\r\n                        {{ cambiandoPausa() ? 'Pausando\u2026' : 'Confirmar pausa' }}\r\n                      </button>\r\n                    </div>\r\n                  } @else {\r\n                    <p>\r\n                      Paus\u00E1 las nuevas reservas de todas tus publicaciones mientras termin\u00E1s de\r\n                      atender las que ya ten\u00E9s.\r\n                    </p>\r\n                    <button\r\n                      type=\"button\"\r\n                      class=\"acct-btn acct-btn--ghost\"\r\n                      (click)=\"confirmarPausa.set(true)\"\r\n                    >\r\n                      Pausar actividades\r\n                    </button>\r\n                  }\r\n                  @if (errorPausa()) {\r\n                    <p role=\"alert\" class=\"acct-alert acct-alert--error\">{{ errorPausa() }}</p>\r\n                  }\r\n                </div>\r\n              }\r\n              @case ('rechazada') {\r\n                <div class=\"acct-alert acct-alert--error\">\r\n                  <strong>Tu verificaci\u00F3n fue rechazada.</strong>\r\n                  @if (solicitud()?.motivo_rechazo) {\r\n                    <br />Motivo: {{ solicitud()?.motivo_rechazo }}\r\n                  }\r\n                </div>\r\n                <p>\r\n                  Correg\u00ED la documentaci\u00F3n y volv\u00E9 a enviarla para que un administrador la revise.\r\n                </p>\r\n                <div class=\"acct-actions\">\r\n                  <a routerLink=\"/mi-perfil/anunciante\" class=\"acct-btn acct-btn--primary\"\r\n                    >Reenviar documentaci\u00F3n</a\r\n                  >\r\n                </div>\r\n              }\r\n              @case (undefined) {\r\n                <p>\r\n                  \u00BFTen\u00E9s propiedades para alquilar? Convertite en anunciante: carg\u00E1 tus datos y tu\r\n                  documentaci\u00F3n de identidad, y una vez aprobada vas a poder publicar.\r\n                </p>\r\n                <div class=\"acct-actions\">\r\n                  <a routerLink=\"/mi-perfil/anunciante\" class=\"acct-btn acct-btn--primary\"\r\n                    >Quiero ser anunciante</a\r\n                  >\r\n                </div>\r\n              }\r\n              @default {\r\n                @if (solicitud()?.dni_frente_url) {\r\n                  <div class=\"acct-alert acct-alert--info\">\r\n                    Tu documentaci\u00F3n est\u00E1 en revisi\u00F3n. Te avisamos por email cuando un administrador\r\n                    la apruebe.\r\n                  </div>\r\n                } @else {\r\n                  <div class=\"acct-alert acct-alert--info\">\r\n                    Ya cargaste tus datos. Falta subir la documentaci\u00F3n de identidad para completar\r\n                    la solicitud.\r\n                  </div>\r\n                }\r\n                <div class=\"acct-actions\">\r\n                  <a routerLink=\"/mi-perfil/anunciante\" class=\"acct-btn acct-btn--primary\">\r\n                    {{\r\n                      solicitud()?.dni_frente_url\r\n                        ? 'Ver estado de la solicitud'\r\n                        : 'Subir documentaci\u00F3n'\r\n                    }}\r\n                  </a>\r\n                </div>\r\n              }\r\n            }\r\n          </section>\r\n        </div>\r\n        <section class=\"profile-settings\" aria-labelledby=\"configuracion-cuenta\">\r\n          <h2 id=\"configuracion-cuenta\">Configuraci\u00F3n de la cuenta</h2>\r\n          <app-cambiar-contrasenia />\r\n          <section class=\"delete-account\" aria-labelledby=\"titulo-baja-cuenta\">\r\n            <div class=\"account-setting-row\">\r\n              <h3 id=\"titulo-baja-cuenta\" class=\"account-setting-label\">\r\n                <svg lucideTrash2 [size]=\"20\" aria-hidden=\"true\"></svg> Baja de cuenta\r\n              </h3>\r\n              @if (!mostrarConfirmacionBaja()) {\r\n                <button\r\n                  type=\"button\"\r\n                  class=\"acct-btn acct-btn--danger acct-btn--sm\"\r\n                  (click)=\"mostrarConfirmacionBaja.set(true)\"\r\n                >\r\n                  Solicitar baja\r\n                </button>\r\n              }\r\n            </div>\r\n            @if (mostrarConfirmacionBaja()) {\r\n              <div class=\"delete-account__warning\" role=\"alert\">\r\n                <strong>\u00BFQuer\u00E9s solicitar la baja de tu cuenta?</strong>\r\n                <p>Te enviaremos un enlace a tu correo. La baja se aplica cuando la confirmes desde ese enlace.</p>\r\n                <p>\r\n                  Perder\u00E1s el acceso a DEPA.\r\n                  @if (solicitud()?.estado === 'aprobada') {\r\n                    Tus publicaciones dejar\u00E1n de estar disponibles.\r\n                  }\r\n                  Las reservas y pagos registrados se conservar\u00E1n como historial.\r\n                  Si volv\u00E9s a registrarte con el mismo email, podr\u00E1s recuperar esta cuenta o crear una nueva.\r\n                  Si ten\u00E9s reservas, estad\u00EDas, pagos, liquidaciones o reclamos pendientes de\r\n                  resolver, como inquilino o como anunciante, no vas a poder dar de baja la cuenta\r\n                  hasta regularizarlos. Esta acci\u00F3n no cancela ni reembolsa operaciones.\r\n                </p>\r\n                @if (errorBaja()) {\r\n                  <p class=\"acct-alert acct-alert--error\">{{ errorBaja() }}</p>\r\n                }\r\n                <div class=\"acct-actions\">\r\n                  <button\r\n                    type=\"button\"\r\n                    class=\"acct-btn acct-btn--ghost\"\r\n                    [disabled]=\"solicitandoBaja()\"\r\n                    (click)=\"mostrarConfirmacionBaja.set(false); errorBaja.set('')\"\r\n                  >\r\n                    Cancelar\r\n                  </button>\r\n                  <button\r\n                    type=\"button\"\r\n                    class=\"acct-btn acct-btn--danger\"\r\n                    [disabled]=\"solicitandoBaja()\"\r\n                    (click)=\"solicitarBajaCuenta()\"\r\n                  >\r\n                    {{ solicitandoBaja() ? 'Enviando\u2026' : 'Enviar correo de confirmaci\u00F3n' }}\r\n                  </button>\r\n                </div>\r\n              </div>\r\n            }\r\n            @if (mensajeBaja()) {\r\n              <p class=\"acct-alert acct-alert--success\" role=\"status\">{{ mensajeBaja() }}</p>\r\n            }\r\n          </section>\r\n        </section>\r\n      </article>\r\n    }\r\n  </div>\r\n</section>\r\n", styles: ["@use 'perfil-base';\r\n\r\n.acct-wrap { max-width: 72rem; }\r\n/* Foto de perfil editable: al pasar el mouse aparece la c\u00E1mara */\r\n.photo { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; flex-shrink: 0; }\r\n.photo__picker { position: relative; display: block; border-radius: 50%; cursor: pointer; }\r\n.photo__picker input { position: absolute; inset: 0; opacity: 0; cursor: pointer; z-index: 2; }\r\n.photo__picker .profile-hero__avatar { box-shadow: 0 0 0 3px #fff, 0 0 0 5px var(--color-accent); transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }\r\n.photo__picker:hover .profile-hero__avatar { transform: scale(1.05); }\r\n.photo__overlay {\r\n  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;\r\n  border-radius: 50%; background: rgba(16, 24, 40, 0.55); color: #fff; font-size: 0.72rem; font-weight: 700;\r\n  opacity: 0; transition: opacity 0.2s ease;\r\n}\r\n.photo__picker:hover .photo__overlay, .photo__picker:focus-within .photo__overlay, .photo__picker.is-busy .photo__overlay { opacity: 1; }\r\n.photo__picker.is-busy .photo__overlay svg { animation: depa-pulse-dot 1s infinite; }\r\n.photo__remove { border: 0; background: transparent; color: var(--color-text-muted); font: inherit; font-size: 0.78rem; cursor: pointer; }\r\n.photo__remove:hover { color: var(--color-danger); text-decoration: underline; }\r\n.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }\r\n.profile-public { margin-left: auto; flex-shrink: 0; }\r\n.photo-error { margin-top: 0.75rem; }\r\n\r\n.profile-shortcuts {\r\n  display: grid;\r\n  grid-auto-flow: column;\r\n  grid-auto-columns: 1fr;\r\n  align-items: center;\r\n  padding: 0.75rem 0;\r\n  border-bottom: 1px solid var(--color-border);\r\n}\r\n.profile-shortcuts a {\r\n  position: relative;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  gap: 0.75rem;\r\n  min-height: 3.25rem;\r\n  border-radius: 0.5rem;\r\n  padding: 0.4rem 0.75rem;\r\n  color: var(--color-text);\r\n  font-weight: 700;\r\n  text-align: center;\r\n  text-decoration: none;\r\n}\r\n.profile-shortcuts a + a::before {\r\n  content: '';\r\n  position: absolute;\r\n  left: 0;\r\n  height: 1.65rem;\r\n  border-left: 1px solid var(--color-border);\r\n}\r\n.profile-shortcuts a svg { flex: none; color: var(--color-primary); }\r\n.profile-shortcuts a:hover { background: #fff7ef; color: var(--color-primary-dark); }\r\n.profile-shortcuts a:focus-visible, .photo__picker:focus-within {\r\n  outline: 2px solid var(--color-primary);\r\n  outline-offset: 3px;\r\n}\r\n\r\n.profile-layout {\r\n  display: grid;\r\n  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);\r\n  padding: 1.4rem 0;\r\n}\r\n.profile-section { min-width: 0; padding-inline: 0.2rem 1.35rem; }\r\n.profile-section + .profile-section {\r\n  border-left: 1px solid var(--color-border);\r\n  padding-inline: 1.35rem 0.2rem;\r\n}\r\n\r\n\r\n.spaced { margin-bottom: 1rem; }\r\n.profile-section > .acct-alert:first-of-type, .edit-form { margin-top: 0.75rem; }\r\n.edit-form { display: flex; flex-direction: column; gap: 1rem; }\r\n\r\n.cuenta-anunciante { display: flex; flex-direction: column; gap: 0.65rem; }\r\n.cuenta-anunciante h2, .cuenta-anunciante p { margin: 0; }\r\n.cuenta-anunciante .acct-actions { justify-content: flex-start; }\r\n.cuenta-anunciante__actividad {\r\n  display: grid;\r\n  justify-items: start;\r\n  gap: 0.65rem;\r\n  padding: 0.85rem;\r\n  background: #fbf7f0;\r\n  border: 1px solid #f1e4d3;\r\n  border-radius: 0.6rem;\r\n  font-size: 0.88rem;\r\n  line-height: 1.45;\r\n}\r\n\r\n.profile-settings { border-top: 1px solid var(--color-border); padding: 1rem 0.2rem 0; }\r\n.profile-settings h2 { margin-bottom: 0.25rem; }\r\n.delete-account { border-top: 1px solid var(--color-border); }\r\n.account-setting-row, .account-setting-label {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.75rem;\r\n}\r\n.account-setting-row { justify-content: space-between; min-height: 3.2rem; padding: 0.5rem 0.35rem; }\r\n.account-setting-label { margin: 0; font-size: 1rem; font-weight: 550; }\r\n.account-setting-label svg { color: var(--color-danger); flex: none; }\r\n.delete-account__warning p { color: var(--color-text-muted); line-height: 1.5; }\r\n.delete-account__warning {\r\n  margin: 0.4rem 0 0.65rem;\r\n  padding: 1rem;\r\n  border: 1px solid #fecaca;\r\n  border-radius: 0.65rem;\r\n  background: #fffafa;\r\n}\r\n.delete-account__warning strong { color: var(--color-danger); }\r\n.delete-account__warning .acct-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; }\r\n\r\n@media (max-width: 820px) {\r\n  .profile-layout { grid-template-columns: 1fr; gap: 1rem; padding-block: 1rem; }\r\n  .profile-section, .profile-section + .profile-section { padding-inline: 0.2rem; }\r\n  .profile-section + .profile-section { border-left: 0; border-top: 1px solid var(--color-border); padding-top: 1rem; }\r\n}\r\n@media (max-width: 560px) {\r\n  .profile-public { margin-left: 0; width: 100%; }\r\n  .profile-shortcuts a { min-height: 4rem; flex-direction: column; gap: 0.25rem; font-size: 0.8rem; padding-inline: 0.25rem; }\r\n  .profile-shortcuts a svg { width: 20px; height: 20px; }\r\n  .account-setting-row { flex-wrap: wrap; }\r\n}\r\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(MiPerfilComponent, { className: "MiPerfilComponent", filePath: "src/app/features/mi-perfil/mi-perfil.component.ts", lineNumber: 53 }); })();
