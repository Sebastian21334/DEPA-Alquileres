import { ConversationComposerComponent } from '../../shared/components/conversation-panel/conversation-composer.component';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { LucideCalendar, LucideCalendarX, LucideInfo, LucideChevronRight, LucideEllipsis, LucideExternalLink, LucideImage, LucideLockKeyhole, LucideTriangleAlert, LucideX } from '@lucide/angular';
import { Component, computed, DestroyRef, inject, linkedSignal, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, forkJoin, of, switchMap } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReservationService, } from '../../shared/services/reservation.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { FormsModule } from '@angular/forms';
import { activarActualizacionReservas } from '../../shared/utils/reservation-refresh';
import { devolucionRegistrada, estadiaActiva, etiquetasEstadia, puedeConsultarCodigo, puedePedirReinicioCodigo, puedeReprogramar, puedeValidarCodigo } from '../../shared/utils/reservation-state';
import { PerfilService } from '../../core/services/perfil.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ClaimHistoryComponent } from '../../shared/components/claim-history/claim-history.component';
import { ActividadReembolsosService } from '../../core/services/actividad-reembolsos.service';
import { CargaImagenesComponent } from '../../shared/components/carga-imagenes/carga-imagenes.component';
import { imagenesDisponibles, MAX_IMAGENES_POR_ENVIO } from '../../shared/utils/reclamo-imagenes';
import { rolEnReclamo } from '../../shared/utils/reclamo-rol';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
const _c0 = ["dialogoDemora"];
const _c1 = ["dialogoCancelacion"];
const _c2 = ["dialogoFaltante"];
const _c3 = a0 => ({ $implicit: a0, recibida: false });
const _c4 = a0 => ({ $implicit: a0 });
const _c5 = a0 => ({ $implicit: a0, recibida: true });
const _c6 = a0 => ["/publicaciones", a0];
const _c7 = a0 => ({ reserva_id: a0, reprogramar: 1 });
const _forTrack0 = ($index, $item) => $item.solicitudId;
const _forTrack1 = ($index, $item) => $item.id;
function MisReservasComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "Gestion\u00E1 las estad\u00EDas que reservaste y las que recibiste en tus propiedades.");
    i0.ɵɵelementEnd();
} }
function MisReservasComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "Gestion\u00E1 las estad\u00EDas que reservaste.");
    i0.ɵɵelementEnd();
} }
function MisReservasComponent_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 10);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.errorDemorasAdministrativas());
} }
function MisReservasComponent_Conditional_9_For_4_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "Ya hay un reclamo abierto para esta reserva.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "button", 30);
    i0.ɵɵlistener("click", function MisReservasComponent_Conditional_9_For_4_Conditional_5_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.vista.set("reclamos")); });
    i0.ɵɵtext(3, "Ver reclamos");
    i0.ɵɵelementEnd();
} }
function MisReservasComponent_Conditional_9_For_4_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 31);
    i0.ɵɵlistener("click", function MisReservasComponent_Conditional_9_For_4_Conditional_6_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r3); const item_r4 = i0.ɵɵnextContext().$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.abrirDemora(item_r4)); });
    i0.ɵɵtext(1, "Reclamar por demora administrativa");
    i0.ɵɵelementEnd();
} }
function MisReservasComponent_Conditional_9_For_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "article", 28)(1, "h3");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4, "Tu solicitud de cancelaci\u00F3n no fue respondida antes de la fecha de ingreso y se considera rechazada. La reserva sigue en curso.");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, MisReservasComponent_Conditional_9_For_4_Conditional_5_Template, 4, 0)(6, MisReservasComponent_Conditional_9_For_4_Conditional_6_Template, 2, 0, "button", 29);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r4 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("Reserva #", item_r4.reservaId, " \u00B7 ", item_r4.titulo);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(item_r4.reclamoAbierto ? 5 : 6);
} }
function MisReservasComponent_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 11)(1, "h2", 27);
    i0.ɵɵtext(2, "Solicitudes sin respuesta antes del ingreso");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(3, MisReservasComponent_Conditional_9_For_4_Template, 7, 3, "article", 28, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r0.demorasAdministrativas());
} }
function MisReservasComponent_Conditional_14_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 10);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.errorDemora());
} }
function MisReservasComponent_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3, "Contanos qu\u00E9 inconvenientes te gener\u00F3 la falta de respuesta a tu solicitud. Administraci\u00F3n revisar\u00E1 el caso. Enviar el reclamo no cancela la reserva ni genera autom\u00E1ticamente un reembolso.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "form", 32);
    i0.ɵɵlistener("ngSubmit", function MisReservasComponent_Conditional_14_Template_form_ngSubmit_4_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.enviarDemora()); });
    i0.ɵɵelementStart(5, "label", 33);
    i0.ɵɵtext(6, "Descripci\u00F3n de los inconvenientes");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "textarea", 34);
    i0.ɵɵtwoWayListener("ngModelChange", function MisReservasComponent_Conditional_14_Template_textarea_ngModelChange_7_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r0.descripcionDemora, $event) || (ctx_r0.descripcionDemora = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(8, "small");
    i0.ɵɵtext(9, "Entre 20 y 1000 caracteres. Podr\u00E1s adjuntar evidencias y seguir el caso desde Reclamos.");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(10, MisReservasComponent_Conditional_14_Conditional_10_Template, 2, 1, "p", 10);
    i0.ɵɵelementStart(11, "div", 35)(12, "button", 36);
    i0.ɵɵlistener("click", function MisReservasComponent_Conditional_14_Template_button_click_12_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.cerrarDemora()); });
    i0.ɵɵtext(13, "Volver");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "button", 37);
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const item_r6 = ctx;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("Reserva #", item_r6.reservaId, " \u00B7 ", item_r6.titulo);
    i0.ɵɵadvance(3);
    i0.ɵɵattribute("aria-busy", ctx_r0.enviandoDemora());
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r0.descripcionDemora);
    i0.ɵɵproperty("disabled", ctx_r0.enviandoDemora());
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r0.errorDemora() ? 10 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r0.enviandoDemora());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r0.enviandoDemora() || ctx_r0.descripcionDemora.trim().length < 20);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.enviandoDemora() ? "Enviando\u2026" : "Enviar reclamo");
} }
function MisReservasComponent_Conditional_23_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "img", 47);
    i0.ɵɵlistener("error", function MisReservasComponent_Conditional_23_Conditional_2_Template_img_error_0_listener() { i0.ɵɵrestoreView(_r8); const reserva_r9 = i0.ɵɵnextContext(); const portada_r10 = i0.ɵɵreadContextLet(1); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.registrarErrorImagen(reserva_r9.id, portada_r10)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const portada_r10 = i0.ɵɵreadContextLet(1);
    i0.ɵɵproperty("src", portada_r10, i0.ɵɵsanitizeUrl);
} }
function MisReservasComponent_Conditional_23_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 40);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 48);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 28);
} }
function MisReservasComponent_Conditional_23_Conditional_11_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const devolucion_r11 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate2(" ", devolucion_r11.diasAnticipacion, " ", devolucion_r11.diasAnticipacion === 1 ? "d\u00EDa" : "d\u00EDas", " antes del ingreso. ");
} }
function MisReservasComponent_Conditional_23_Conditional_11_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " La fecha de ingreso es hoy. ");
} }
function MisReservasComponent_Conditional_23_Conditional_11_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " La fecha de ingreso ya pas\u00F3. ");
} }
function MisReservasComponent_Conditional_23_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 49)(1, "strong");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "date");
    i0.ɵɵconditionalCreate(6, MisReservasComponent_Conditional_23_Conditional_11_Conditional_6_Template, 1, 2)(7, MisReservasComponent_Conditional_23_Conditional_11_Conditional_7_Template, 1, 0)(8, MisReservasComponent_Conditional_23_Conditional_11_Conditional_8_Template, 1, 0);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const devolucion_r11 = ctx;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("cancellation-refund--warning", devolucion_r11.porcentaje === 0);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate4("Importe de devoluci\u00F3n", ctx_r0.cancelacionComoAnunciante() ? " al inquilino" : "", ": ", devolucion_r11.moneda, " ", ctx_r0.monto(devolucion_r11.importe, devolucion_r11.moneda), " (", devolucion_r11.porcentaje, " %)");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("Calculada con la fecha de ", ctx_r0.condicionesCancelacion()?.solicitud ? "tu solicitud" : "hoy", ": ", i0.ɵɵpipeBind3(5, 9, devolucion_r11.fechaSolicitud, "dd/MM/yyyy", "UTC"), ". ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(devolucion_r11.diasAnticipacion > 0 ? 6 : devolucion_r11.diasAnticipacion === 0 ? 7 : 8);
} }
function MisReservasComponent_Conditional_23_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 42);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 50);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 22);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx);
} }
function MisReservasComponent_Conditional_23_Conditional_13_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 51);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext(2);
    const bloqueo_r13 = i0.ɵɵreadContextLet(10);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(bloqueo_r13);
} }
function MisReservasComponent_Conditional_23_Conditional_13_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "Si el pago fue con tarjeta, la devoluci\u00F3n ser\u00E1 simulada y no se transferir\u00E1 dinero.");
    i0.ɵɵelementEnd();
} }
function MisReservasComponent_Conditional_23_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵconditionalCreate(0, MisReservasComponent_Conditional_23_Conditional_13_Conditional_0_Template, 2, 1, "p", 51);
    i0.ɵɵelementStart(1, "label", 52);
    i0.ɵɵtext(2, "Motivo de la cancelaci\u00F3n ");
    i0.ɵɵelementStart(3, "span", 53);
    i0.ɵɵtext(4, "*");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "textarea", 54);
    i0.ɵɵlistener("ngModelChange", function MisReservasComponent_Conditional_23_Conditional_13_Template_textarea_ngModelChange_5_listener($event) { i0.ɵɵrestoreView(_r12); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.motivoCancelacion.set($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(6, "small", 55);
    i0.ɵɵtext(7, "Entre 10 y 500 caracteres.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "div", 56);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(9, "svg", 57);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(10, "p");
    i0.ɵɵtext(11, "La cancelaci\u00F3n se aprueba autom\u00E1ticamente. Si corresponde una devoluci\u00F3n, la reserva se cancela cuando se confirma.");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(12, MisReservasComponent_Conditional_23_Conditional_13_Conditional_12_Template, 2, 0, "p");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const bloqueo_r13 = i0.ɵɵreadContextLet(10);
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵconditional(bloqueo_r13 ? 0 : -1);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("ngModel", ctx_r0.motivoCancelacion())("disabled", ctx_r0.enviandoCancelacion() || !!bloqueo_r13);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("size", 22);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r0.condicionesCancelacion()?.simulacionTarjetaHabilitada && (ctx_r0.condicionesCancelacion()?.devolucion?.importe ?? 0) > 0 ? 12 : -1);
} }
function MisReservasComponent_Conditional_23_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 43);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 57);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3, "Hay una solicitud de cancelaci\u00F3n para esta reserva. Est\u00E1 en revisi\u00F3n.");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 22);
} }
function MisReservasComponent_Conditional_23_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 43);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 57);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const reserva_r9 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 22);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(reserva_r9.cancelada ? "La reserva qued\u00F3 cancelada." : "La cancelaci\u00F3n fue aceptada. La devoluci\u00F3n est\u00E1 en gesti\u00F3n.");
} }
function MisReservasComponent_Conditional_23_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 22);
    i0.ɵɵtext(1, "Consultando el estado de la solicitud\u2026");
    i0.ɵɵelementEnd();
} }
function MisReservasComponent_Conditional_23_Conditional_17_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    const _r14 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 59)(1, "input", 60);
    i0.ɵɵlistener("ngModelChange", function MisReservasComponent_Conditional_23_Conditional_17_Conditional_14_Template_input_ngModelChange_1_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.aceptaTerminosCancelacion.set($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext(2);
    const bloqueo_r13 = i0.ɵɵreadContextLet(10);
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngModel", ctx_r0.aceptaTerminosCancelacion())("disabled", ctx_r0.enviandoCancelacion() || !!bloqueo_r13);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.condicionesCancelacion()?.advertencia ? "Acepto los t\u00E9rminos y entiendo que no recibir\u00E9 una devoluci\u00F3n" : "Acepto los t\u00E9rminos y el importe de devoluci\u00F3n indicado", " ");
} }
function MisReservasComponent_Conditional_23_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "details", 58)(1, "summary");
    i0.ɵɵtext(2, "T\u00E9rminos y condiciones de cancelaci\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "ul")(4, "li");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "li");
    i0.ɵɵtext(7, "Las devoluciones con dinero en cuenta se gestionan por Mercado Pago.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "li");
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "li");
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "li");
    i0.ɵɵtext(13, "El anunciante puede solicitar la cancelaci\u00F3n hasta el d\u00EDa anterior al ingreso, inclusive, con devoluci\u00F3n del 100 % al inquilino.");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(14, MisReservasComponent_Conditional_23_Conditional_17_Conditional_14_Template, 3, 3, "label", 59);
} if (rf & 2) {
    const politica_r15 = ctx;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1("Como inquilino pod\u00E9s solicitar la cancelaci\u00F3n en cualquier momento antes de la fecha de ingreso, incluso el d\u00EDa anterior. Si faltan menos de ", politica_r15.diasDevolucionParcial, " d\u00EDas, no hay devoluci\u00F3n. Desde la fecha de ingreso no se permite cancelar; pod\u00E9s abrir un reclamo. Se cuentan d\u00EDas calendario de Argentina.");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate2("Si solicita el inquilino, se devuelve el ", politica_r15.porcentajeTotal, " % del importe pagado cuando faltan ", politica_r15.diasDevolucionTotal, " d\u00EDas o m\u00E1s al enviar la solicitud.");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate5("Si al solicitar faltan al menos ", politica_r15.diasDevolucionParcial, " d\u00EDas y menos de ", politica_r15.diasDevolucionTotal, ", se devuelve el ", politica_r15.porcentajeParcial, " %. Si faltan menos de ", politica_r15.diasDevolucionParcial, " d\u00EDas, corresponde el ", politica_r15.porcentajeFueraDePlazo, " %.");
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r0.estadoCancelacion() === "formulario" ? 14 : -1);
} }
function MisReservasComponent_Conditional_23_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 10);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.errorCancelacion());
} }
function MisReservasComponent_Conditional_23_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 45);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const bloqueo_r13 = i0.ɵɵreadContextLet(10);
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r0.enviandoCancelacion() || !!bloqueo_r13 || !ctx_r0.aceptaTerminosCancelacion() || ctx_r0.motivoCancelacion().trim().length < 10);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.enviandoCancelacion() ? "Procesando\u2026" : "Confirmar cancelaci\u00F3n", " ");
} }
function MisReservasComponent_Conditional_23_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    const _r16 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 61);
    i0.ɵɵlistener("click", function MisReservasComponent_Conditional_23_Conditional_23_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r16); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.consultarCancelacion()); });
    i0.ɵɵtext(1, "Reintentar");
    i0.ɵɵelementEnd();
} }
function MisReservasComponent_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 38);
    i0.ɵɵdeclareLet(1);
    i0.ɵɵconditionalCreate(2, MisReservasComponent_Conditional_23_Conditional_2_Template, 1, 1, "img", 39)(3, MisReservasComponent_Conditional_23_Conditional_3_Template, 2, 1, "div", 40);
    i0.ɵɵelementStart(4, "div")(5, "strong");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(9, "form", 32);
    i0.ɵɵlistener("ngSubmit", function MisReservasComponent_Conditional_23_Template_form_ngSubmit_9_listener() { i0.ɵɵrestoreView(_r7); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.enviarCancelacion()); });
    i0.ɵɵdeclareLet(10);
    i0.ɵɵconditionalCreate(11, MisReservasComponent_Conditional_23_Conditional_11_Template, 9, 13, "div", 41);
    i0.ɵɵconditionalCreate(12, MisReservasComponent_Conditional_23_Conditional_12_Template, 4, 2, "div", 42);
    i0.ɵɵconditionalCreate(13, MisReservasComponent_Conditional_23_Conditional_13_Template, 13, 5)(14, MisReservasComponent_Conditional_23_Conditional_14_Template, 4, 1, "div", 43)(15, MisReservasComponent_Conditional_23_Conditional_15_Template, 4, 2, "div", 43)(16, MisReservasComponent_Conditional_23_Conditional_16_Template, 2, 0, "p", 22);
    i0.ɵɵconditionalCreate(17, MisReservasComponent_Conditional_23_Conditional_17_Template, 15, 9);
    i0.ɵɵconditionalCreate(18, MisReservasComponent_Conditional_23_Conditional_18_Template, 2, 1, "p", 10);
    i0.ɵɵelementStart(19, "div", 35)(20, "button", 44);
    i0.ɵɵlistener("click", function MisReservasComponent_Conditional_23_Template_button_click_20_listener() { i0.ɵɵrestoreView(_r7); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.cerrarCancelacion()); });
    i0.ɵɵtext(21, "Volver");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(22, MisReservasComponent_Conditional_23_Conditional_22_Template, 2, 2, "button", 45)(23, MisReservasComponent_Conditional_23_Conditional_23_Template, 2, 0, "button", 46);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_13_0;
    let tmp_14_0;
    let tmp_16_0;
    const reserva_r9 = ctx;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    const portada_r17 = i0.ɵɵstoreLet(reserva_r9.publicacion?.imagenes?.[0]?.url);
    i0.ɵɵadvance();
    i0.ɵɵconditional(portada_r17 && ctx_r0.imagenesConError()[reserva_r9.id] !== portada_r17 ? 2 : 3);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(reserva_r9.publicacion?.titulo || "Publicaci\u00F3n no disponible");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("Reserva #", reserva_r9.id, " \u00B7 ", ctx_r0.fechasCancelacion(reserva_r9));
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-busy", ctx_r0.enviandoCancelacion());
    i0.ɵɵadvance();
    i0.ɵɵstoreLet(ctx_r0.condicionesCancelacion()?.motivoBloqueo);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_13_0 = ctx_r0.condicionesCancelacion()?.devolucion) ? 11 : -1, tmp_13_0);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_14_0 = ctx_r0.condicionesCancelacion()?.advertencia) ? 12 : -1, tmp_14_0);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.estadoCancelacion() === "formulario" ? 13 : ctx_r0.estadoCancelacion() === "pendiente" ? 14 : ctx_r0.estadoCancelacion() === "aprobada" ? 15 : ctx_r0.estadoCancelacion() === "consultando" ? 16 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵconditional((tmp_16_0 = ctx_r0.condicionesCancelacion()?.politica) ? 17 : -1, tmp_16_0);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.errorCancelacion() ? 18 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r0.enviandoCancelacion());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.estadoCancelacion() === "formulario" ? 22 : ctx_r0.estadoCancelacion() === "error" ? 23 : -1);
} }
function MisReservasComponent_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 22);
    i0.ɵɵtext(1, "Consultando la devoluci\u00F3n\u2026");
    i0.ɵɵelementEnd();
} }
function MisReservasComponent_Conditional_31_Conditional_0_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 22);
    i0.ɵɵtext(1, "Ya ten\u00E9s un reclamo abierto para esta reserva. Pod\u00E9s seguirlo en la pesta\u00F1a Reclamos.");
    i0.ɵɵelementEnd();
} }
function MisReservasComponent_Conditional_31_Conditional_0_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    const _r18 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 64);
    i0.ɵɵlistener("ngSubmit", function MisReservasComponent_Conditional_31_Conditional_0_Conditional_15_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r18); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.enviarFaltante()); });
    i0.ɵɵelementStart(1, "label", 65);
    i0.ɵɵtext(2, "Contanos qu\u00E9 falta recibir");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "textarea", 66);
    i0.ɵɵtwoWayListener("ngModelChange", function MisReservasComponent_Conditional_31_Conditional_0_Conditional_15_Template_textarea_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r18); const ctx_r0 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r0.descripcionFaltante, $event) || (ctx_r0.descripcionFaltante = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(4, "small", 67);
    i0.ɵɵtext(5, "Entre 20 y 1000 caracteres. Administraci\u00F3n revisar\u00E1 el reclamo antes de devolver la diferencia.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "button", 68);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵattribute("aria-busy", ctx_r0.enviandoFaltante());
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r0.descripcionFaltante);
    i0.ɵɵproperty("disabled", ctx_r0.enviandoFaltante());
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("disabled", ctx_r0.enviandoFaltante() || ctx_r0.descripcionFaltante.trim().length < 20);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.enviandoFaltante() ? "Enviando\u2026" : "Enviar reclamo por el faltante");
} }
function MisReservasComponent_Conditional_31_Conditional_0_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 22);
    i0.ɵɵtext(1, "La diferencia ya est\u00E1 en gesti\u00F3n. Pod\u00E9s seguir la devoluci\u00F3n desde el detalle de la reserva.");
    i0.ɵɵelementEnd();
} }
function MisReservasComponent_Conditional_31_Conditional_0_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 22);
    i0.ɵɵtext(1, "No falta dinero seg\u00FAn la pol\u00EDtica de cancelaci\u00F3n. La parte retenida no constituye un faltante.");
    i0.ɵɵelementEnd();
} }
function MisReservasComponent_Conditional_31_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 62)(1, "p");
    i0.ɵɵtext(2);
    i0.ɵɵelementStart(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "p");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "p");
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "p")(12, "strong");
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(14, MisReservasComponent_Conditional_31_Conditional_0_Conditional_14_Template, 2, 0, "p", 22)(15, MisReservasComponent_Conditional_31_Conditional_0_Conditional_15_Template, 8, 5, "form", 63)(16, MisReservasComponent_Conditional_31_Conditional_0_Conditional_16_Template, 2, 0, "p", 22)(17, MisReservasComponent_Conditional_31_Conditional_0_Conditional_17_Template, 2, 0, "p", 22);
} if (rf & 2) {
    const devolucion_r19 = ctx;
    const saldo_r20 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("Correspond\u00EDa devolver (", devolucion_r19.porcentaje, " %): ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", devolucion_r19.moneda, " ", ctx_r0.monto(devolucion_r19.esperado, devolucion_r19.moneda));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("Ya devuelto: ", devolucion_r19.moneda, " ", ctx_r0.monto(devolucion_r19.devuelto, devolucion_r19.moneda));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("En gesti\u00F3n: ", devolucion_r19.moneda, " ", ctx_r0.monto(devolucion_r19.enGestion, devolucion_r19.moneda));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("Falta recibir: ", devolucion_r19.moneda, " ", ctx_r0.monto(devolucion_r19.faltante, devolucion_r19.moneda));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("Disponible para reclamar: ", devolucion_r19.moneda, " ", ctx_r0.monto(devolucion_r19.importeReclamable, devolucion_r19.moneda));
    i0.ɵɵadvance();
    i0.ɵɵconditional(saldo_r20.reclamoAbierto ? 14 : devolucion_r19.importeReclamable > 0 ? 15 : devolucion_r19.faltante > 0 ? 16 : 17);
} }
function MisReservasComponent_Conditional_31_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "No hay una cancelaci\u00F3n aprobada con devoluci\u00F3n para esta reserva.");
    i0.ɵɵelementEnd();
} }
function MisReservasComponent_Conditional_31_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, MisReservasComponent_Conditional_31_Conditional_0_Template, 18, 12)(1, MisReservasComponent_Conditional_31_Conditional_1_Template, 2, 0, "p");
} if (rf & 2) {
    let tmp_7_0;
    i0.ɵɵconditional((tmp_7_0 = ctx.devolucion) ? 0 : 1, tmp_7_0);
} }
function MisReservasComponent_Conditional_32_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 10);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.errorFaltante());
} }
function MisReservasComponent_Conditional_35_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 24);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.mensaje());
} }
function MisReservasComponent_Conditional_36_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 25);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.error());
} }
function MisReservasComponent_Conditional_37_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 26);
    i0.ɵɵelement(1, "app-spinner");
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3, "Cargando reservas\u2026");
    i0.ɵɵelementEnd()();
} }
function MisReservasComponent_Conditional_38_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r22 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 70);
    i0.ɵɵlistener("click", function MisReservasComponent_Conditional_38_Conditional_5_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r22); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.vista.set("recibidas")); });
    i0.ɵɵtext(1, " Reservas recibidas ");
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("is-active", ctx_r0.vista() === "recibidas");
    i0.ɵɵattribute("aria-selected", ctx_r0.vista() === "recibidas");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.recibidas().length);
} }
function MisReservasComponent_Conditional_38_Conditional_10_For_2_ng_container_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function MisReservasComponent_Conditional_38_Conditional_10_For_2_Conditional_2_ng_container_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function MisReservasComponent_Conditional_38_Conditional_10_For_2_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtemplate(0, MisReservasComponent_Conditional_38_Conditional_10_For_2_Conditional_2_ng_container_0_Template, 1, 0, "ng-container", 75);
} if (rf & 2) {
    const reserva_r23 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵnextContext(3);
    const formularioReclamo_r24 = i0.ɵɵreference(42);
    i0.ɵɵproperty("ngTemplateOutlet", formularioReclamo_r24)("ngTemplateOutletContext", i0.ɵɵpureFunction1(2, _c4, reserva_r23));
} }
function MisReservasComponent_Conditional_38_Conditional_10_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "article", 73);
    i0.ɵɵtemplate(1, MisReservasComponent_Conditional_38_Conditional_10_For_2_ng_container_1_Template, 1, 0, "ng-container", 75);
    i0.ɵɵconditionalCreate(2, MisReservasComponent_Conditional_38_Conditional_10_For_2_Conditional_2_Template, 1, 4, "ng-container");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const reserva_r23 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    const tarjetaReserva_r25 = i0.ɵɵreference(40);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngTemplateOutlet", tarjetaReserva_r25)("ngTemplateOutletContext", i0.ɵɵpureFunction1(3, _c3, reserva_r23));
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.reclamoAbierto()?.id === reserva_r23.id ? 2 : -1);
} }
function MisReservasComponent_Conditional_38_Conditional_10_ForEmpty_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 74);
    i0.ɵɵtext(1, "Todav\u00EDa no realizaste reservas.");
    i0.ɵɵelementEnd();
} }
function MisReservasComponent_Conditional_38_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 72);
    i0.ɵɵrepeaterCreate(1, MisReservasComponent_Conditional_38_Conditional_10_For_2_Template, 3, 5, "article", 73, _forTrack1, false, MisReservasComponent_Conditional_38_Conditional_10_ForEmpty_3_Template, 2, 0, "div", 74);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.propias());
} }
function MisReservasComponent_Conditional_38_Conditional_11_For_27_ng_container_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function MisReservasComponent_Conditional_38_Conditional_11_For_27_Conditional_2_ng_container_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function MisReservasComponent_Conditional_38_Conditional_11_For_27_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtemplate(0, MisReservasComponent_Conditional_38_Conditional_11_For_27_Conditional_2_ng_container_0_Template, 1, 0, "ng-container", 75);
} if (rf & 2) {
    const reserva_r27 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵnextContext(3);
    const formularioReclamo_r24 = i0.ɵɵreference(42);
    i0.ɵɵproperty("ngTemplateOutlet", formularioReclamo_r24)("ngTemplateOutletContext", i0.ɵɵpureFunction1(2, _c4, reserva_r27));
} }
function MisReservasComponent_Conditional_38_Conditional_11_For_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "article", 73);
    i0.ɵɵtemplate(1, MisReservasComponent_Conditional_38_Conditional_11_For_27_ng_container_1_Template, 1, 0, "ng-container", 75);
    i0.ɵɵconditionalCreate(2, MisReservasComponent_Conditional_38_Conditional_11_For_27_Conditional_2_Template, 1, 4, "ng-container");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const reserva_r27 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    const tarjetaReserva_r25 = i0.ɵɵreference(40);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngTemplateOutlet", tarjetaReserva_r25)("ngTemplateOutletContext", i0.ɵɵpureFunction1(3, _c5, reserva_r27));
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.reclamoAbierto()?.id === reserva_r27.id ? 2 : -1);
} }
function MisReservasComponent_Conditional_38_Conditional_11_ForEmpty_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 74);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.recibidas().length ? "No hay reservas que coincidan con los filtros." : "No recibiste reservas todav\u00EDa.");
} }
function MisReservasComponent_Conditional_38_Conditional_11_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    const _r28 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "nav", 86)(1, "span", 22);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div")(4, "button", 36);
    i0.ɵɵlistener("click", function MisReservasComponent_Conditional_38_Conditional_11_Conditional_29_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r28); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.paginaRecibidas.set(ctx_r0.paginaRecibidas() - 1)); });
    i0.ɵɵtext(5, "Anterior");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "button", 36);
    i0.ɵɵlistener("click", function MisReservasComponent_Conditional_38_Conditional_11_Conditional_29_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r28); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.paginaRecibidas.set(ctx_r0.paginaRecibidas() + 1)); });
    i0.ɵɵtext(7, "Siguiente");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate3("", ctx_r0.recibidasFiltradas().length, " reservas \u00B7 P\u00E1gina ", ctx_r0.paginaRecibidas(), " de ", ctx_r0.paginasRecibidas());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r0.paginaRecibidas() <= 1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r0.paginaRecibidas() >= ctx_r0.paginasRecibidas());
} }
function MisReservasComponent_Conditional_38_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    const _r26 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 72)(1, "div", 76)(2, "label");
    i0.ɵɵtext(3, "Estado ");
    i0.ɵɵelementStart(4, "select", 77);
    i0.ɵɵlistener("ngModelChange", function MisReservasComponent_Conditional_38_Conditional_11_Template_select_ngModelChange_4_listener($event) { i0.ɵɵrestoreView(_r26); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.cambiarFiltroRecibidas("estado", $event)); });
    i0.ɵɵelementStart(5, "option", 78);
    i0.ɵɵtext(6, "Todos");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "option", 79);
    i0.ɵɵtext(8, "Ingreso pendiente");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "option", 80);
    i0.ɵɵtext(10, "Liquidaci\u00F3n pendiente o en revisi\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "option", 81);
    i0.ɵɵtext(12, "Confirmadas");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "option", 82);
    i0.ɵɵtext(14, "Terminadas");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "option", 83);
    i0.ɵɵtext(16, "Canceladas y otras");
    i0.ɵɵelementEnd()();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "label");
    i0.ɵɵtext(18, "Publicaci\u00F3n ");
    i0.ɵɵelementStart(19, "input", 84);
    i0.ɵɵlistener("ngModelChange", function MisReservasComponent_Conditional_38_Conditional_11_Template_input_ngModelChange_19_listener($event) { i0.ɵɵrestoreView(_r26); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.cambiarFiltroRecibidas("publicacion", $event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "label");
    i0.ɵɵtext(21, "Ingreso desde ");
    i0.ɵɵelementStart(22, "input", 85);
    i0.ɵɵlistener("ngModelChange", function MisReservasComponent_Conditional_38_Conditional_11_Template_input_ngModelChange_22_listener($event) { i0.ɵɵrestoreView(_r26); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.cambiarFiltroRecibidas("desde", $event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "label");
    i0.ɵɵtext(24, "Ingreso hasta ");
    i0.ɵɵelementStart(25, "input", 85);
    i0.ɵɵlistener("ngModelChange", function MisReservasComponent_Conditional_38_Conditional_11_Template_input_ngModelChange_25_listener($event) { i0.ɵɵrestoreView(_r26); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.cambiarFiltroRecibidas("hasta", $event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd()();
    i0.ɵɵrepeaterCreate(26, MisReservasComponent_Conditional_38_Conditional_11_For_27_Template, 3, 5, "article", 73, _forTrack1, false, MisReservasComponent_Conditional_38_Conditional_11_ForEmpty_28_Template, 2, 1, "div", 74);
    i0.ɵɵconditionalCreate(29, MisReservasComponent_Conditional_38_Conditional_11_Conditional_29_Template, 8, 5, "nav", 86);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngModel", ctx_r0.filtroEstadoRecibidas());
    i0.ɵɵcontrol();
    i0.ɵɵadvance(15);
    i0.ɵɵproperty("ngModel", ctx_r0.filtroPublicacionRecibidas());
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngModel", ctx_r0.filtroDesdeRecibidas());
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngModel", ctx_r0.filtroHastaRecibidas());
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.recibidasPagina());
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r0.paginasRecibidas() > 1 ? 29 : -1);
} }
function MisReservasComponent_Conditional_38_Conditional_12_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 88);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.errorHistorial());
} }
function MisReservasComponent_Conditional_38_Conditional_12_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 88);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.errorAccionReclamo());
} }
function MisReservasComponent_Conditional_38_Conditional_12_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r29 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 89)(1, "button", 70);
    i0.ɵɵlistener("click", function MisReservasComponent_Conditional_38_Conditional_12_Conditional_8_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r29); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.vistaReclamos.set("inquilino")); });
    i0.ɵɵtext(2, " Como inquilino ");
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "button", 70);
    i0.ɵɵlistener("click", function MisReservasComponent_Conditional_38_Conditional_12_Conditional_8_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r29); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.vistaReclamos.set("anunciante")); });
    i0.ɵɵtext(6, " Como anunciante ");
    i0.ɵɵelementStart(7, "span");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵclassProp("is-active", ctx_r0.vistaReclamos() === "inquilino");
    i0.ɵɵattribute("aria-selected", ctx_r0.vistaReclamos() === "inquilino");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.reclamosComoInquilino().length);
    i0.ɵɵadvance();
    i0.ɵɵclassProp("is-active", ctx_r0.vistaReclamos() === "anunciante");
    i0.ɵɵattribute("aria-selected", ctx_r0.vistaReclamos() === "anunciante");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.reclamosComoAnunciante().length);
} }
function MisReservasComponent_Conditional_38_Conditional_12_For_10_Conditional_2_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r32 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-conversation-composer", 93);
    i0.ɵɵtwoWayListener("textoChange", function MisReservasComponent_Conditional_38_Conditional_12_For_10_Conditional_2_Conditional_0_Template_app_conversation_composer_textoChange_0_listener($event) { i0.ɵɵrestoreView(_r32); const ctx_r0 = i0.ɵɵnextContext(5); i0.ɵɵtwoWayBindingSet(ctx_r0.textoRespuesta, $event) || (ctx_r0.textoRespuesta = $event); return i0.ɵɵresetView($event); })("imagenesChange", function MisReservasComponent_Conditional_38_Conditional_12_For_10_Conditional_2_Conditional_0_Template_app_conversation_composer_imagenesChange_0_listener($event) { i0.ɵɵrestoreView(_r32); const ctx_r0 = i0.ɵɵnextContext(5); i0.ɵɵtwoWayBindingSet(ctx_r0.imagenesRespuesta, $event) || (ctx_r0.imagenesRespuesta = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("enviar", function MisReservasComponent_Conditional_38_Conditional_12_For_10_Conditional_2_Conditional_0_Template_app_conversation_composer_enviar_0_listener() { i0.ɵɵrestoreView(_r32); const reclamo_r31 = i0.ɵɵnextContext(2).$implicit; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.responderReclamo(reclamo_r31)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(1, "button", 94);
    i0.ɵɵlistener("click", function MisReservasComponent_Conditional_38_Conditional_12_For_10_Conditional_2_Conditional_0_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r32); const ctx_r0 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r0.respuestaReclamo.set(null)); });
    i0.ɵɵtext(2, "Cancelar");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const reclamo_r31 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵtwoWayProperty("texto", ctx_r0.textoRespuesta)("imagenes", ctx_r0.imagenesRespuesta);
    i0.ɵɵproperty("adjuntos", ctx_r0.imagenesDisponibles(reclamo_r31))("deshabilitado", ctx_r0.enviandoRespuesta());
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r0.enviandoRespuesta());
} }
function MisReservasComponent_Conditional_38_Conditional_12_For_10_Conditional_2_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r33 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 94);
    i0.ɵɵlistener("click", function MisReservasComponent_Conditional_38_Conditional_12_For_10_Conditional_2_Conditional_1_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r33); const reclamo_r31 = i0.ɵɵnextContext(2).$implicit; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.abrirRespuestaReclamo(reclamo_r31.id)); });
    i0.ɵɵtext(1, "Escribir un mensaje");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(5);
    i0.ɵɵproperty("disabled", ctx_r0.enviandoRespuesta());
} }
function MisReservasComponent_Conditional_38_Conditional_12_For_10_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, MisReservasComponent_Conditional_38_Conditional_12_For_10_Conditional_2_Conditional_0_Template, 3, 5)(1, MisReservasComponent_Conditional_38_Conditional_12_For_10_Conditional_2_Conditional_1_Template, 2, 1, "button", 92);
} if (rf & 2) {
    const reclamo_r31 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵconditional(ctx_r0.respuestaReclamo() === reclamo_r31.id ? 0 : 1);
} }
function MisReservasComponent_Conditional_38_Conditional_12_For_10_Template(rf, ctx) { if (rf & 1) {
    const _r30 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "article", 90)(1, "app-claim-history", 91);
    i0.ɵɵlistener("verReembolso", function MisReservasComponent_Conditional_38_Conditional_12_For_10_Template_app_claim_history_verReembolso_1_listener() { const reclamo_r31 = i0.ɵɵrestoreView(_r30).$implicit; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.verReembolsoReclamo(reclamo_r31)); });
    i0.ɵɵconditionalCreate(2, MisReservasComponent_Conditional_38_Conditional_12_For_10_Conditional_2_Template, 2, 1);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const reclamo_r31 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("reclamo", reclamo_r31)("mostrarVerReembolso", ctx_r0.esInquilinoDelReclamo(reclamo_r31));
    i0.ɵɵadvance();
    i0.ɵɵconditional(reclamo_r31.estado !== "CERRADO" ? 2 : -1);
} }
function MisReservasComponent_Conditional_38_Conditional_12_ForEmpty_11_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 74);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.separarReclamos() ? "No ten\u00E9s reclamos como " + ctx_r0.vistaReclamos() + "." : "No ten\u00E9s reclamos registrados.");
} }
function MisReservasComponent_Conditional_38_Conditional_12_ForEmpty_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, MisReservasComponent_Conditional_38_Conditional_12_ForEmpty_11_Conditional_0_Template, 2, 1, "div", 74);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵconditional(!ctx_r0.errorHistorial() ? 0 : -1);
} }
function MisReservasComponent_Conditional_38_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 72)(1, "div", 87)(2, "h2");
    i0.ɵɵtext(3, "Reclamos");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p");
    i0.ɵɵtext(5, "Seguimiento de los reclamos en los que particip\u00E1s como Inquilino o Anunciante.");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(6, MisReservasComponent_Conditional_38_Conditional_12_Conditional_6_Template, 2, 1, "p", 88);
    i0.ɵɵconditionalCreate(7, MisReservasComponent_Conditional_38_Conditional_12_Conditional_7_Template, 2, 1, "p", 88);
    i0.ɵɵconditionalCreate(8, MisReservasComponent_Conditional_38_Conditional_12_Conditional_8_Template, 9, 8, "div", 89);
    i0.ɵɵrepeaterCreate(9, MisReservasComponent_Conditional_38_Conditional_12_For_10_Template, 3, 3, "article", 90, _forTrack1, false, MisReservasComponent_Conditional_38_Conditional_12_ForEmpty_11_Template, 1, 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(6);
    i0.ɵɵconditional(ctx_r0.errorHistorial() ? 6 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.errorAccionReclamo() ? 7 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.separarReclamos() ? 8 : -1);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.reclamosVisibles());
} }
function MisReservasComponent_Conditional_38_Template(rf, ctx) { if (rf & 1) {
    const _r21 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 69)(1, "button", 70);
    i0.ɵɵlistener("click", function MisReservasComponent_Conditional_38_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r21); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.vista.set("realizadas")); });
    i0.ɵɵtext(2, " Reservas realizadas ");
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(5, MisReservasComponent_Conditional_38_Conditional_5_Template, 4, 4, "button", 71);
    i0.ɵɵelementStart(6, "button", 70);
    i0.ɵɵlistener("click", function MisReservasComponent_Conditional_38_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r21); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.vista.set("reclamos")); });
    i0.ɵɵtext(7, " Reclamos ");
    i0.ɵɵelementStart(8, "span");
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(10, MisReservasComponent_Conditional_38_Conditional_10_Template, 4, 1, "section", 72)(11, MisReservasComponent_Conditional_38_Conditional_11_Template, 30, 6, "section", 72)(12, MisReservasComponent_Conditional_38_Conditional_12_Template, 12, 4, "section", 72);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵclassProp("is-active", ctx_r0.vista() === "realizadas");
    i0.ɵɵattribute("aria-selected", ctx_r0.vista() === "realizadas");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.propias().length);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.esAnunciante() ? 5 : -1);
    i0.ɵɵadvance();
    i0.ɵɵclassProp("is-active", ctx_r0.vista() === "reclamos");
    i0.ɵɵattribute("aria-selected", ctx_r0.vista() === "reclamos");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.reclamos().length);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.vista() === "realizadas" ? 10 : ctx_r0.vista() === "recibidas" && ctx_r0.esAnunciante() ? 11 : 12);
} }
function MisReservasComponent_ng_template_39_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r34 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "img", 112);
    i0.ɵɵlistener("error", function MisReservasComponent_ng_template_39_Conditional_7_Template_img_error_0_listener() { i0.ɵɵrestoreView(_r34); const reserva_r35 = i0.ɵɵnextContext().$implicit; const portada_r36 = i0.ɵɵreadContextLet(0); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.registrarErrorImagen(reserva_r35.id, portada_r36)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const portada_r36 = i0.ɵɵreadContextLet(0);
    i0.ɵɵproperty("src", portada_r36, i0.ɵɵsanitizeUrl);
} }
function MisReservasComponent_ng_template_39_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(0, "svg", 48);
} if (rf & 2) {
    i0.ɵɵproperty("size", 32);
} }
function MisReservasComponent_ng_template_39_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 103);
    i0.ɵɵtext(1, "Tu devoluci\u00F3n est\u00E1 en gesti\u00F3n. Pod\u00E9s seguirla desde el detalle.");
    i0.ɵɵelementEnd();
} }
function MisReservasComponent_ng_template_39_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 103);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx.mensaje);
} }
function MisReservasComponent_ng_template_39_Conditional_30_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(0, "svg", 113);
} if (rf & 2) {
    i0.ɵɵproperty("size", 15);
} }
function MisReservasComponent_ng_template_39_Conditional_30_Conditional_3_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 103);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const fechaPago_r37 = ctx;
    const ctx_r0 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", fechaPago_r37 > ctx_r0.hoy() ? "Pago disponible desde el " : "Pago habilitado desde el ", "", ctx_r0.fechaTarjeta(fechaPago_r37), ".");
} }
function MisReservasComponent_ng_template_39_Conditional_30_Conditional_3_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 103);
    i0.ɵɵtext(1, "Fecha de pago pendiente de revisi\u00F3n.");
    i0.ɵɵelementEnd();
} }
function MisReservasComponent_ng_template_39_Conditional_30_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, MisReservasComponent_ng_template_39_Conditional_30_Conditional_3_Conditional_0_Template, 2, 2, "p", 103)(1, MisReservasComponent_ng_template_39_Conditional_30_Conditional_3_Conditional_1_Template, 2, 0, "p", 103);
} if (rf & 2) {
    let tmp_17_0;
    const reserva_r35 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵconditional((tmp_17_0 = ctx_r0.fechaHabilitacion(reserva_r35)) ? 0 : 1, tmp_17_0);
} }
function MisReservasComponent_ng_template_39_Conditional_30_Conditional_4_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 103);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const dias_r38 = i0.ɵɵreadContextLet(0);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("En ", dias_r38, " ", dias_r38 === 1 ? "d\u00EDa" : "d\u00EDas", " la liquidaci\u00F3n quedar\u00E1 pendiente de pago a tu favor.");
} }
function MisReservasComponent_ng_template_39_Conditional_30_Conditional_4_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 103);
    i0.ɵɵtext(1, "El plazo venci\u00F3. La liquidaci\u00F3n est\u00E1 pendiente de procesamiento a tu favor.");
    i0.ɵɵelementEnd();
} }
function MisReservasComponent_ng_template_39_Conditional_30_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdeclareLet(0);
    i0.ɵɵconditionalCreate(1, MisReservasComponent_ng_template_39_Conditional_30_Conditional_4_Conditional_1_Template, 2, 2, "p", 103)(2, MisReservasComponent_ng_template_39_Conditional_30_Conditional_4_Conditional_2_Template, 2, 0, "p", 103);
} if (rf & 2) {
    const reserva_r35 = i0.ɵɵnextContext(2).$implicit;
    const dias_r39 = i0.ɵɵstoreLet(i0.ɵɵnextContext().diasHastaVencimiento(reserva_r35));
    i0.ɵɵadvance();
    i0.ɵɵconditional(dias_r39 !== null && dias_r39 > 0 ? 1 : dias_r39 === 0 ? 2 : -1);
} }
function MisReservasComponent_ng_template_39_Conditional_30_Conditional_5_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 103);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const reserva_r35 = i0.ɵɵnextContext(3).$implicit;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Pago registrado el ", ctx_r0.fechaTarjeta(reserva_r35.fecha_resolucion_liquidacion), ".");
} }
function MisReservasComponent_ng_template_39_Conditional_30_Conditional_5_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 103);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const reserva_r35 = i0.ɵɵnextContext(3).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Referencia de pago: ", reserva_r35.referencia_liquidacion);
} }
function MisReservasComponent_ng_template_39_Conditional_30_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, MisReservasComponent_ng_template_39_Conditional_30_Conditional_5_Conditional_0_Template, 2, 1, "p", 103);
    i0.ɵɵconditionalCreate(1, MisReservasComponent_ng_template_39_Conditional_30_Conditional_5_Conditional_1_Template, 2, 1, "p", 103);
} if (rf & 2) {
    const reserva_r35 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵconditional(reserva_r35.fecha_resolucion_liquidacion ? 0 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(reserva_r35.referencia_liquidacion ? 1 : -1);
} }
function MisReservasComponent_ng_template_39_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 103);
    i0.ɵɵconditionalCreate(1, MisReservasComponent_ng_template_39_Conditional_30_Conditional_1_Template, 1, 1, ":svg:svg", 113);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, MisReservasComponent_ng_template_39_Conditional_30_Conditional_3_Template, 2, 1);
    i0.ɵɵconditionalCreate(4, MisReservasComponent_ng_template_39_Conditional_30_Conditional_4_Template, 3, 2);
    i0.ɵɵconditionalCreate(5, MisReservasComponent_ng_template_39_Conditional_30_Conditional_5_Template, 2, 2);
} if (rf & 2) {
    const reserva_r35 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵconditional(reserva_r35.estado_liquidacion === "RETENIDO" ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.estadoLiquidacion(reserva_r35), " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(reserva_r35.estado_liquidacion === "PENDIENTE_PAGO_PROPIETARIO" ? 3 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(reserva_r35.estado_estadia === "INGRESO_NO_VERIFICADO" && reserva_r35.estado_liquidacion === "RETENIDO" ? 4 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(reserva_r35.estado_liquidacion === "PAGADO_PROPIETARIO" ? 5 : -1);
} }
function MisReservasComponent_ng_template_39_Conditional_37_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "details", 106)(1, "summary");
    i0.ɵɵtext(2, "Ver cotizaci\u00F3n ");
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(3, "svg", 114);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "p");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const dolar_r40 = ctx;
    const reserva_r35 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("size", 15);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate3("Publicado en ", ctx_r0.monto(reserva_r35.importe_origen ?? 0, reserva_r35.moneda_origen), ". D\u00F3lar blue venta a ", ctx_r0.monto(+dolar_r40.venta, "ARS", 6), " por USD \u00B7 Cotizaci\u00F3n #", dolar_r40.id, ".");
} }
function MisReservasComponent_ng_template_39_Conditional_39_Template(rf, ctx) { if (rf & 1) {
    const _r41 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 36);
    i0.ɵɵlistener("click", function MisReservasComponent_ng_template_39_Conditional_39_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r41); const reserva_r35 = i0.ɵɵnextContext().$implicit; const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.verCodigo(reserva_r35)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const reserva_r35 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r0.ocupada() !== null);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.codigos()[reserva_r35.id] ? "Volver a mostrar c\u00F3digo" : "Ver c\u00F3digo de ingreso");
} }
function MisReservasComponent_ng_template_39_Conditional_42_Template(rf, ctx) { if (rf & 1) {
    const _r42 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 30);
    i0.ɵɵlistener("click", function MisReservasComponent_ng_template_39_Conditional_42_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r42); const reserva_r35 = i0.ɵɵnextContext().$implicit; const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.abrirFaltante(reserva_r35)); });
    i0.ɵɵtext(1, "Reclamar reembolso faltante");
    i0.ɵɵelementEnd();
} }
function MisReservasComponent_ng_template_39_Conditional_43_Conditional_5_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r43 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "a", 121);
    i0.ɵɵlistener("click", function MisReservasComponent_ng_template_39_Conditional_43_Conditional_5_Conditional_0_Template_a_click_0_listener() { i0.ɵɵrestoreView(_r43); i0.ɵɵnextContext(2); const menu_r44 = i0.ɵɵreference(4); return i0.ɵɵresetView(menu_r44.hidePopover()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 122);
    i0.ɵɵtext(2, "Ver publicaci\u00F3n");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const reserva_r35 = i0.ɵɵnextContext(3).$implicit;
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(2, _c6, reserva_r35.publicacion.id));
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 16);
} }
function MisReservasComponent_ng_template_39_Conditional_43_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, MisReservasComponent_ng_template_39_Conditional_43_Conditional_5_Conditional_0_Template, 3, 4, "a", 120);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵconditional(!ctx_r0.accesoLimitado() ? 0 : -1);
} }
function MisReservasComponent_ng_template_39_Conditional_43_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    const _r45 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "a", 123);
    i0.ɵɵlistener("click", function MisReservasComponent_ng_template_39_Conditional_43_Conditional_6_Template_a_click_0_listener() { i0.ɵɵrestoreView(_r45); i0.ɵɵnextContext(); const menu_r44 = i0.ɵɵreference(4); return i0.ɵɵresetView(menu_r44.hidePopover()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 124);
    i0.ɵɵtext(2, "Cambiar fechas");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const reserva_r35 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵproperty("queryParams", i0.ɵɵpureFunction1(2, _c7, reserva_r35.id));
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 16);
} }
function MisReservasComponent_ng_template_39_Conditional_43_Conditional_7_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 125);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 50);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 16);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx);
} }
function MisReservasComponent_ng_template_39_Conditional_43_Conditional_7_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r46 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 127);
    i0.ɵɵlistener("click", function MisReservasComponent_ng_template_39_Conditional_43_Conditional_7_Conditional_1_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r46); i0.ɵɵnextContext(2); const menu_r44 = i0.ɵɵreference(4); const reserva_r35 = i0.ɵɵnextContext().$implicit; const ctx_r0 = i0.ɵɵnextContext(); menu_r44.hidePopover(); return i0.ɵɵresetView(ctx_r0.abrirReclamo(reserva_r35)); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 50);
    i0.ɵɵtext(2, "Reportar un problema");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("disabled", ctx_r0.reclamoEnviando());
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 16);
} }
function MisReservasComponent_ng_template_39_Conditional_43_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, MisReservasComponent_ng_template_39_Conditional_43_Conditional_7_Conditional_0_Template, 3, 2, "p", 125)(1, MisReservasComponent_ng_template_39_Conditional_43_Conditional_7_Conditional_1_Template, 3, 2, "button", 126);
} if (rf & 2) {
    let tmp_19_0;
    const reserva_r35 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵconditional((tmp_19_0 = ctx_r0.motivoReclamoNoDisponible(reserva_r35)) ? 0 : 1, tmp_19_0);
} }
function MisReservasComponent_ng_template_39_Conditional_43_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r47 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 128);
    i0.ɵɵlistener("click", function MisReservasComponent_ng_template_39_Conditional_43_Conditional_8_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r47); i0.ɵɵnextContext(); const accionesReserva_r48 = i0.ɵɵreference(1); const menu_r44 = i0.ɵɵreference(4); const ctx_r48 = i0.ɵɵnextContext(); const reserva_r35 = ctx_r48.$implicit; const recibida_r50 = ctx_r48.recibida; const solicitarBaja_r51 = i0.ɵɵreadContextLet(4); const ctx_r0 = i0.ɵɵnextContext(); menu_r44.hidePopover(); return i0.ɵɵresetView(solicitarBaja_r51 ? ctx_r0.solicitarCancelacion(reserva_r35, accionesReserva_r48, recibida_r50) : ctx_r0.cancelar(reserva_r35)); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 16);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext(2);
    const solicitarBaja_r51 = i0.ɵɵreadContextLet(4);
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r0.ocupada() !== null);
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 16);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(solicitarBaja_r51 ? "Solicitar cancelaci\u00F3n" : "Cancelar reserva");
} }
function MisReservasComponent_ng_template_39_Conditional_43_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 115, 5);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 116);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "div", 117, 6);
    i0.ɵɵconditionalCreate(5, MisReservasComponent_ng_template_39_Conditional_43_Conditional_5_Template, 1, 1);
    i0.ɵɵconditionalCreate(6, MisReservasComponent_ng_template_39_Conditional_43_Conditional_6_Template, 3, 4, "a", 118);
    i0.ɵɵconditionalCreate(7, MisReservasComponent_ng_template_39_Conditional_43_Conditional_7_Template, 2, 1);
    i0.ɵɵconditionalCreate(8, MisReservasComponent_ng_template_39_Conditional_43_Conditional_8_Template, 3, 3, "button", 119);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const reserva_r35 = i0.ɵɵnextContext().$implicit;
    const puedeReportar_r52 = i0.ɵɵreadContextLet(1);
    const cancelarDirecto_r53 = i0.ɵɵreadContextLet(2);
    const cambiarFechas_r54 = i0.ɵɵreadContextLet(3);
    const solicitarBaja_r51 = i0.ɵɵreadContextLet(4);
    const menuId_r55 = i0.ɵɵreadContextLet(5);
    i0.ɵɵattribute("popovertarget", menuId_r55)("aria-label", "M\u00E1s acciones para la reserva " + reserva_r35.id);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 19);
    i0.ɵɵadvance();
    i0.ɵɵproperty("id", menuId_r55);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(reserva_r35.publicacion ? 5 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(cambiarFechas_r54 ? 6 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(puedeReportar_r52 ? 7 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(solicitarBaja_r51 || cancelarDirecto_r53 ? 8 : -1);
} }
function MisReservasComponent_ng_template_39_Conditional_44_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p")(1, "strong");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3, " \u00B7 Contacto por el chat de DEPA");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const reserva_r35 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.inquilino(reserva_r35));
} }
function MisReservasComponent_ng_template_39_Conditional_44_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 129);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const recibida_r50 = i0.ɵɵnextContext(2).recibida;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(recibida_r50 ? "Valid\u00E1 el c\u00F3digo que te entregue el hu\u00E9sped al ingresar." : "El propietario todav\u00EDa no valid\u00F3 el c\u00F3digo de alojamiento.");
} }
function MisReservasComponent_ng_template_39_Conditional_44_Conditional_3_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const reserva_r35 = i0.ɵɵnextContext(3).$implicit;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(" Si tuviste un problema con el ingreso, pod\u00E9s reportarlo hasta el ", ctx_r0.fecha(reserva_r35.fin_plazo_reclamo), " desde \u00ABReportar un problema\u00BB. ");
} }
function MisReservasComponent_ng_template_39_Conditional_44_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 129);
    i0.ɵɵtext(1, "La estad\u00EDa termin\u00F3 sin un c\u00F3digo de ingreso validado. ");
    i0.ɵɵconditionalCreate(2, MisReservasComponent_ng_template_39_Conditional_44_Conditional_3_Conditional_2_Template, 1, 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r48 = i0.ɵɵnextContext(2);
    const reserva_r35 = ctx_r48.$implicit;
    const recibida_r50 = ctx_r48.recibida;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!recibida_r50 && reserva_r35.fin_plazo_reclamo && ctx_r0.hoy() <= reserva_r35.fin_plazo_reclamo ? 2 : -1);
} }
function MisReservasComponent_ng_template_39_Conditional_44_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 130)(1, "strong");
    i0.ɵɵtext(2, "\u00DAltimo cambio de fechas");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const cambio_r56 = ctx;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate2("Antes: ", ctx_r0.fecha(cambio_r56.fecha_inicio_anterior), " - ", ctx_r0.fecha(cambio_r56.fecha_fin_anterior));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("Ahora: ", ctx_r0.fecha(cambio_r56.fecha_inicio_nueva), " - ", ctx_r0.fecha(cambio_r56.fecha_fin_nueva));
} }
function MisReservasComponent_ng_template_39_Conditional_44_For_6_Template(rf, ctx) { if (rf & 1) {
    const _r57 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 131)(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 94);
    i0.ɵɵlistener("click", function MisReservasComponent_ng_template_39_Conditional_44_For_6_Template_button_click_3_listener() { const cambio_r58 = i0.ɵɵrestoreView(_r57).$implicit; const reserva_r35 = i0.ɵɵnextContext(2).$implicit; const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.reintentarAviso(reserva_r35, cambio_r58)); });
    i0.ɵɵtext(4, "Reintentar aviso");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const cambio_r58 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("Correo al anunciante pendiente: cambio al ", ctx_r0.fecha(cambio_r58.fecha_inicio_nueva), ".");
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r0.ocupada() !== null);
} }
function MisReservasComponent_ng_template_39_Conditional_44_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 132)(1, "small");
    i0.ɵɵtext(2, "C\u00F3digo personal de ingreso");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span");
    i0.ɵɵtext(6, "No lo compartas hasta estar f\u00EDsicamente en la propiedad.");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx);
} }
function MisReservasComponent_ng_template_39_Conditional_44_Conditional_9_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 141);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext(2);
    const aviso_r60 = i0.ɵɵreadContextLet(8);
    i0.ɵɵclassProp("code-entry__aviso--error", aviso_r60.tipo === "error");
    i0.ɵɵattribute("role", aviso_r60.tipo === "error" ? "alert" : "status");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(aviso_r60.texto);
} }
function MisReservasComponent_ng_template_39_Conditional_44_Conditional_9_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 140);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const restantes_r61 = i0.ɵɵreadContextLet(0);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Te ", restantes_r61 === 1 ? "queda 1 intento" : "quedan " + restantes_r61 + " intentos", " antes de que el c\u00F3digo se bloquee.");
} }
function MisReservasComponent_ng_template_39_Conditional_44_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    const _r59 = i0.ɵɵgetCurrentView();
    i0.ɵɵdeclareLet(0);
    i0.ɵɵelementStart(1, "form", 135);
    i0.ɵɵlistener("ngSubmit", function MisReservasComponent_ng_template_39_Conditional_44_Conditional_9_Template_form_ngSubmit_1_listener() { i0.ɵɵrestoreView(_r59); const reserva_r35 = i0.ɵɵnextContext(2).$implicit; const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.validarCodigo(reserva_r35)); });
    i0.ɵɵelementStart(2, "label", 136);
    i0.ɵɵtext(3, "C\u00F3digo entregado por el inquilino");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div")(5, "input", 137);
    i0.ɵɵtwoWayListener("ngModelChange", function MisReservasComponent_ng_template_39_Conditional_44_Conditional_9_Template_input_ngModelChange_5_listener($event) { i0.ɵɵrestoreView(_r59); const reserva_r35 = i0.ɵɵnextContext(2).$implicit; const ctx_r0 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r0.codigoIngresado[reserva_r35.id], $event) || (ctx_r0.codigoIngresado[reserva_r35.id] = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(6, "button", 138);
    i0.ɵɵtext(7, "Validar ingreso");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 139);
    i0.ɵɵconditionalCreate(9, MisReservasComponent_ng_template_39_Conditional_44_Conditional_9_Conditional_9_Template, 2, 4, "p", 134)(10, MisReservasComponent_ng_template_39_Conditional_44_Conditional_9_Conditional_10_Template, 2, 1, "p", 140);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const aviso_r60 = i0.ɵɵreadContextLet(8);
    const reserva_r35 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext();
    const restantes_r62 = i0.ɵɵstoreLet(reserva_r35.intentos_codigo_restantes);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("for", "code-" + reserva_r35.id);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("id", "code-" + reserva_r35.id)("name", "code-" + reserva_r35.id);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r0.codigoIngresado[reserva_r35.id]);
    i0.ɵɵattribute("aria-invalid", aviso_r60?.tipo === "error")("aria-describedby", "code-feedback-" + reserva_r35.id);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r0.ocupada() !== null);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", "code-feedback-" + reserva_r35.id);
    i0.ɵɵadvance();
    i0.ɵɵconditional(aviso_r60 ? 9 : restantes_r62 !== undefined && reserva_r35.intentos_codigo > 0 ? 10 : -1);
} }
function MisReservasComponent_ng_template_39_Conditional_44_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 141);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const aviso_r60 = i0.ɵɵreadContextLet(8);
    i0.ɵɵclassProp("code-entry__aviso--error", aviso_r60.tipo === "error");
    i0.ɵɵattribute("role", aviso_r60.tipo === "error" ? "alert" : "status");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(aviso_r60.texto);
} }
function MisReservasComponent_ng_template_39_Conditional_44_Conditional_11_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 140);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx);
} }
function MisReservasComponent_ng_template_39_Conditional_44_Conditional_11_Conditional_1_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 142);
    i0.ɵɵtext(1, "El c\u00F3digo se bloque\u00F3 por demasiados intentos incorrectos.");
    i0.ɵɵelementEnd();
} }
function MisReservasComponent_ng_template_39_Conditional_44_Conditional_11_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r63 = i0.ɵɵgetCurrentView();
    i0.ɵɵconditionalCreate(0, MisReservasComponent_ng_template_39_Conditional_44_Conditional_11_Conditional_1_Conditional_0_Template, 2, 0, "p", 142);
    i0.ɵɵelementStart(1, "button", 143);
    i0.ɵɵlistener("click", function MisReservasComponent_ng_template_39_Conditional_44_Conditional_11_Conditional_1_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r63); const reserva_r35 = i0.ɵɵnextContext(3).$implicit; const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.abrirPedidoReinicio(reserva_r35)); });
    i0.ɵɵtext(2, "Pedir reinicio a Administraci\u00F3n");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext(2);
    const aviso_r60 = i0.ɵɵreadContextLet(8);
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional(!aviso_r60 ? 0 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r0.reclamoEnviando());
} }
function MisReservasComponent_ng_template_39_Conditional_44_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, MisReservasComponent_ng_template_39_Conditional_44_Conditional_11_Conditional_0_Template, 2, 1, "p", 140)(1, MisReservasComponent_ng_template_39_Conditional_44_Conditional_11_Conditional_1_Template, 3, 2);
} if (rf & 2) {
    let tmp_18_0;
    const reserva_r35 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵconditional((tmp_18_0 = ctx_r0.motivoPedidoReinicioNoDisponible(reserva_r35)) ? 0 : 1, tmp_18_0);
} }
function MisReservasComponent_ng_template_39_Conditional_44_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 111);
    i0.ɵɵconditionalCreate(1, MisReservasComponent_ng_template_39_Conditional_44_Conditional_1_Template, 4, 1, "p");
    i0.ɵɵconditionalCreate(2, MisReservasComponent_ng_template_39_Conditional_44_Conditional_2_Template, 2, 1, "p", 129);
    i0.ɵɵconditionalCreate(3, MisReservasComponent_ng_template_39_Conditional_44_Conditional_3_Template, 3, 1, "p", 129);
    i0.ɵɵconditionalCreate(4, MisReservasComponent_ng_template_39_Conditional_44_Conditional_4_Template, 7, 4, "div", 130);
    i0.ɵɵrepeaterCreate(5, MisReservasComponent_ng_template_39_Conditional_44_For_6_Template, 5, 2, "div", 131, _forTrack1);
    i0.ɵɵconditionalCreate(7, MisReservasComponent_ng_template_39_Conditional_44_Conditional_7_Template, 7, 1, "div", 132);
    i0.ɵɵdeclareLet(8);
    i0.ɵɵconditionalCreate(9, MisReservasComponent_ng_template_39_Conditional_44_Conditional_9_Template, 11, 10, "form", 133)(10, MisReservasComponent_ng_template_39_Conditional_44_Conditional_10_Template, 2, 4, "p", 134);
    i0.ɵɵconditionalCreate(11, MisReservasComponent_ng_template_39_Conditional_44_Conditional_11_Template, 2, 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_19_0;
    let tmp_21_0;
    const ctx_r48 = i0.ɵɵnextContext();
    const reserva_r35 = ctx_r48.$implicit;
    const recibida_r50 = ctx_r48.recibida;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵconditional(recibida_r50 ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(reserva_r35.estado_estadia === "PENDIENTE_INGRESO" && (!recibida_r50 || ctx_r0.puedeValidarCodigo(reserva_r35)) ? 2 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(reserva_r35.estado_estadia === "INGRESO_NO_VERIFICADO" ? 3 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_19_0 = ctx_r0.ultimoCambio(reserva_r35)) ? 4 : -1, tmp_19_0);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.avisosPendientes(reserva_r35));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_21_0 = !recibida_r50 && ctx_r0.puedeConsultarCodigo(reserva_r35) && ctx_r0.codigos()[reserva_r35.id]) ? 7 : -1, tmp_21_0);
    i0.ɵɵadvance();
    const aviso_r64 = i0.ɵɵstoreLet(ctx_r0.avisoCodigo()?.id === reserva_r35.id ? ctx_r0.avisoCodigo() : null);
    i0.ɵɵadvance();
    i0.ɵɵconditional(recibida_r50 && ctx_r0.puedeValidarCodigo(reserva_r35) ? 9 : recibida_r50 && aviso_r64 ? 10 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(recibida_r50 && ctx_r0.puedePedirReinicioCodigo(reserva_r35) ? 11 : -1);
} }
function MisReservasComponent_ng_template_39_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdeclareLet(0)(1)(2)(3)(4)(5);
    i0.ɵɵelementStart(6, "div", 95);
    i0.ɵɵconditionalCreate(7, MisReservasComponent_ng_template_39_Conditional_7_Template, 1, 1, "img", 96)(8, MisReservasComponent_ng_template_39_Conditional_8_Template, 1, 1, ":svg:svg", 48);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "div", 97)(10, "div", 98)(11, "div", 99)(12, "div", 100)(13, "h2");
    i0.ɵɵtext(14);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "span", 101);
    i0.ɵɵtext(16);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(17, "dl", 102)(18, "div")(19, "dt");
    i0.ɵɵtext(20, "Ingreso");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "dd");
    i0.ɵɵtext(22);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(23, "div")(24, "dt");
    i0.ɵɵtext(25, "Salida");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(26, "dd");
    i0.ɵɵtext(27);
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(28, MisReservasComponent_ng_template_39_Conditional_28_Template, 2, 0, "p", 103)(29, MisReservasComponent_ng_template_39_Conditional_29_Template, 2, 1, "p", 103)(30, MisReservasComponent_ng_template_39_Conditional_30_Template, 6, 5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(31, "div", 104)(32, "span");
    i0.ɵɵtext(33, "Total de la reserva");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(34, "strong");
    i0.ɵɵtext(35);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(36, "div", 105);
    i0.ɵɵconditionalCreate(37, MisReservasComponent_ng_template_39_Conditional_37_Template, 6, 4, "details", 106);
    i0.ɵɵelementStart(38, "div", 107);
    i0.ɵɵconditionalCreate(39, MisReservasComponent_ng_template_39_Conditional_39_Template, 2, 2, "button", 108);
    i0.ɵɵelementStart(40, "a", 109);
    i0.ɵɵtext(41);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(42, MisReservasComponent_ng_template_39_Conditional_42_Template, 2, 0, "button", 110);
    i0.ɵɵconditionalCreate(43, MisReservasComponent_ng_template_39_Conditional_43_Template, 9, 8);
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(44, MisReservasComponent_ng_template_39_Conditional_44_Template, 12, 8, "div", 111);
} if (rf & 2) {
    let tmp_22_0;
    let tmp_24_0;
    const reserva_r35 = ctx.$implicit;
    const recibida_r50 = ctx.recibida;
    const ctx_r0 = i0.ɵɵnextContext();
    const devolucionPendiente_r65 = !recibida_r50 && ctx_r0.actividadReembolsos.pendientes().has(reserva_r35.id);
    const portada_r66 = i0.ɵɵstoreLet(reserva_r35.publicacion?.imagenes?.[0]?.url);
    i0.ɵɵadvance();
    const puedeReportar_r67 = i0.ɵɵstoreLet(!recibida_r50 && !reserva_r35.cancelada && reserva_r35.estado_pago === "APROBADO" && reserva_r35.estado_liquidacion !== "PAGADO_PROPIETARIO" && reserva_r35.estado_liquidacion !== "DEVUELTO_INQUILINO" && reserva_r35.estado_liquidacion !== "DEVUELTO_PARCIAL_INQUILINO");
    i0.ɵɵadvance();
    const cancelarDirecto_r68 = i0.ɵɵstoreLet(!recibida_r50 && !reserva_r35.cancelada && !reserva_r35.finalizada && reserva_r35.estado_pago === "PENDIENTE");
    i0.ɵɵadvance();
    const cambiarFechas_r69 = i0.ɵɵstoreLet(!recibida_r50 && !devolucionPendiente_r65 && ctx_r0.puedeReprogramar(reserva_r35));
    i0.ɵɵadvance();
    const solicitarBaja_r70 = i0.ɵɵstoreLet(ctx_r0.puedeSolicitarCancelacion(reserva_r35, recibida_r50));
    i0.ɵɵadvance();
    i0.ɵɵstoreLet("acciones-reserva-" + reserva_r35.id);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(portada_r66 && ctx_r0.imagenesConError()[reserva_r35.id] !== portada_r66 ? 7 : 8);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate(reserva_r35.publicacion?.titulo || "Publicaci\u00F3n no disponible");
    i0.ɵɵadvance();
    i0.ɵɵclassProp("acct-badge--error", !devolucionPendiente_r65 && (reserva_r35.cancelada || reserva_r35.estado_estadia === "INGRESO_NO_VERIFICADO"))("acct-badge--ok", !devolucionPendiente_r65 && ctx_r0.estadiaActiva(reserva_r35));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(devolucionPendiente_r65 ? "Devoluci\u00F3n pendiente" : ctx_r0.estado(reserva_r35));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(ctx_r0.fechaTarjeta(reserva_r35.fecha_inicio));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.fechaTarjeta(reserva_r35.fecha_fin));
    i0.ɵɵadvance();
    i0.ɵɵconditional(devolucionPendiente_r65 ? 28 : (tmp_22_0 = (!recibida_r50 || reserva_r35.estado_liquidacion !== "PAGADO_PROPIETARIO") && ctx_r0.devolucionRegistrada(reserva_r35)) ? 29 : recibida_r50 && reserva_r35.estado_pago === "APROBADO" ? 30 : -1, tmp_22_0);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate(ctx_r0.monto(reserva_r35.importe_contratado ?? reserva_r35.monto_pago, reserva_r35.moneda_contratada));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_24_0 = reserva_r35.cotizacion_dolar) ? 37 : -1, tmp_24_0);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!recibida_r50 && !devolucionPendiente_r65 && ctx_r0.puedeConsultarCodigo(reserva_r35) ? 39 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("queryParams", ctx_r0.detalleReserva(reserva_r35));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(recibida_r50 ? "Ver detalle y contactar" : "Ver detalle");
    i0.ɵɵadvance();
    i0.ɵɵconditional(!recibida_r50 && (reserva_r35.cancelada || devolucionPendiente_r65) ? 42 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(reserva_r35.publicacion || cambiarFechas_r69 || puedeReportar_r67 || solicitarBaja_r70 || cancelarDirecto_r68 ? 43 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(reserva_r35.estado_estadia === "PENDIENTE_INGRESO" || reserva_r35.estado_estadia === "INGRESO_NO_VERIFICADO" || ctx_r0.ultimoCambio(reserva_r35) || ctx_r0.avisosPendientes(reserva_r35).length || recibida_r50 || ctx_r0.puedeConsultarCodigo(reserva_r35) && ctx_r0.codigos()[reserva_r35.id] ? 44 : -1);
} }
function MisReservasComponent_ng_template_41_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r72 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 136);
    i0.ɵɵtext(1, "\u00BFQu\u00E9 tipo de problema tuviste? ");
    i0.ɵɵelementStart(2, "select", 147);
    i0.ɵɵlistener("ngModelChange", function MisReservasComponent_ng_template_41_Conditional_5_Template_select_ngModelChange_2_listener($event) { i0.ɵɵrestoreView(_r72); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.reclamoCategoria.set($event)); });
    i0.ɵɵelementStart(3, "option", 148);
    i0.ɵɵtext(4, "Limpieza");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "option", 149);
    i0.ɵɵtext(6, "Mantenimiento");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "option", 150);
    i0.ɵɵtext(8, "Ingreso");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "option", 151);
    i0.ɵɵtext(10, "La propiedad no coincide");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "option", 152);
    i0.ɵɵtext(12, "Otro");
    i0.ɵɵelementEnd()();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const reserva_r73 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("for", i0.ɵɵinterpolate1("categoria-reclamo-", reserva_r73.id));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", i0.ɵɵinterpolate1("categoria-reclamo-", reserva_r73.id))("ngModel", ctx_r0.reclamoCategoria())("disabled", ctx_r0.reclamoEnviando());
    i0.ɵɵcontrol();
} }
function MisReservasComponent_ng_template_41_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 88);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.errorReclamo());
} }
function MisReservasComponent_ng_template_41_Template(rf, ctx) { if (rf & 1) {
    const _r71 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 64);
    i0.ɵɵlistener("ngSubmit", function MisReservasComponent_ng_template_41_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r71); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.enviarReclamo()); });
    i0.ɵɵelementStart(1, "h4");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p", 129);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, MisReservasComponent_ng_template_41_Conditional_5_Template, 13, 6, "label", 136);
    i0.ɵɵelementStart(6, "label", 136);
    i0.ɵɵtext(7, "Contanos qu\u00E9 pas\u00F3 ");
    i0.ɵɵelementStart(8, "textarea", 144);
    i0.ɵɵlistener("ngModelChange", function MisReservasComponent_ng_template_41_Template_textarea_ngModelChange_8_listener($event) { i0.ɵɵrestoreView(_r71); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.reclamoDescripcion.set($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(9, "small", 139);
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "app-carga-imagenes", 145);
    i0.ɵɵtwoWayListener("archivosChange", function MisReservasComponent_ng_template_41_Template_app_carga_imagenes_archivosChange_11_listener($event) { i0.ɵɵrestoreView(_r71); const ctx_r0 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r0.reclamoArchivos, $event) || (ctx_r0.reclamoArchivos = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(12, MisReservasComponent_ng_template_41_Conditional_12_Template, 2, 1, "p", 88);
    i0.ɵɵelementStart(13, "div", 146)(14, "button", 138);
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "button", 94);
    i0.ɵɵlistener("click", function MisReservasComponent_ng_template_41_Template_button_click_16_listener() { i0.ɵɵrestoreView(_r71); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.cerrarReclamo()); });
    i0.ɵɵtext(17, "Cerrar");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const reserva_r73 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext();
    const pedido_r74 = ctx_r0.reclamoCategoria() === "CODIGO_BLOQUEADO";
    i0.ɵɵattribute("aria-busy", ctx_r0.reclamoEnviando());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", pedido_r74 ? "Pedir el reinicio del c\u00F3digo de la reserva #" : "Reportar un problema en la reserva #", "", reserva_r73.id);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(pedido_r74 ? "Contale a Administraci\u00F3n qu\u00E9 pas\u00F3 con el c\u00F3digo. El hu\u00E9sped tambi\u00E9n ve el pedido y lo pod\u00E9s seguir desde la pesta\u00F1a Reclamos." : "La liquidaci\u00F3n quedar\u00E1 en revisi\u00F3n.");
    i0.ɵɵadvance();
    i0.ɵɵconditional(!pedido_r74 ? 5 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("for", i0.ɵɵinterpolate1("descripcion-reclamo-", reserva_r73.id));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", i0.ɵɵinterpolate1("descripcion-reclamo-", reserva_r73.id));
    i0.ɵɵariaProperty("aria-describedby", i0.ɵɵinterpolate1("ayuda-descripcion-", reserva_r73.id));
    i0.ɵɵproperty("placeholder", pedido_r74 ? "Por ejemplo: el hu\u00E9sped me dict\u00F3 el c\u00F3digo y no lo toma." : "Describ\u00ED qu\u00E9 pas\u00F3, cu\u00E1ndo ocurri\u00F3 y c\u00F3mo afect\u00F3 tu estad\u00EDa.")("ngModel", ctx_r0.reclamoDescripcion())("disabled", ctx_r0.reclamoEnviando());
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("id", i0.ɵɵinterpolate1("ayuda-descripcion-", reserva_r73.id));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("M\u00EDnimo 20 caracteres \u00B7 ", ctx_r0.reclamoDescripcion().length, "/1000");
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("archivos", ctx_r0.reclamoArchivos);
    i0.ɵɵproperty("maximo", ctx_r0.maxImagenesPorEnvio)("deshabilitado", ctx_r0.reclamoEnviando());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.errorReclamo() ? 12 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r0.reclamoEnviando());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.reclamoEnviando() ? "Enviando\u2026" : pedido_r74 ? "Enviar pedido" : "Enviar reclamo", " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r0.reclamoEnviando());
} }
export class MisReservasComponent {
    reservasApi = inject(ReservationService);
    actividadReembolsos = inject(ActividadReembolsosService);
    toast = inject(ToastService);
    perfil = inject(PerfilService);
    auth = inject(AuthService);
    route = inject(ActivatedRoute);
    router = inject(Router);
    destroyRef = inject(DestroyRef);
    consultaReservas;
    estadiaActiva = estadiaActiva;
    puedeReprogramar = puedeReprogramar;
    imagenesConError = signal({}, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "imagenesConError" }] : /* istanbul ignore next */ []));
    puedeConsultarCodigo = puedeConsultarCodigo;
    puedeValidarCodigo = puedeValidarCodigo;
    puedePedirReinicioCodigo = puedePedirReinicioCodigo;
    accesoLimitado = computed(() => this.auth.currentUser()?.accesoLimitado === true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "accesoLimitado" }] : /* istanbul ignore next */ []));
    esAnunciante = computed(() => this.accesoLimitado()
        ? this.auth.currentUser()?.anuncianteVerificado === true
        : this.perfil.esAnuncianteVerificado(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "esAnunciante" }] : /* istanbul ignore next */ []));
    demorasAdministrativas = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "demorasAdministrativas" }] : /* istanbul ignore next */ []));
    errorDemorasAdministrativas = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorDemorasAdministrativas" }] : /* istanbul ignore next */ []));
    dialogoDemora = viewChild.required('dialogoDemora', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "dialogoDemora" }] : /* istanbul ignore next */ []));
    demoraSeleccionada = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "demoraSeleccionada" }] : /* istanbul ignore next */ []));
    enviandoDemora = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enviandoDemora" }] : /* istanbul ignore next */ []));
    errorDemora = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorDemora" }] : /* istanbul ignore next */ []));
    descripcionDemora = '';
    abrirDemora(item) {
        if (item.reclamoAbierto || this.enviandoDemora())
            return;
        this.demoraSeleccionada.set(item);
        this.descripcionDemora = '';
        this.errorDemora.set('');
        this.dialogoDemora().nativeElement.showModal();
    }
    cerrarDemora(evento) {
        evento?.preventDefault();
        if (this.enviandoDemora())
            return;
        this.dialogoDemora().nativeElement.close();
        this.demoraSeleccionada.set(null);
    }
    enviarDemora() {
        const item = this.demoraSeleccionada();
        const descripcion = this.descripcionDemora.trim();
        if (!item || this.enviandoDemora() || descripcion.length < 20 || descripcion.length > 1000)
            return;
        this.enviandoDemora.set(true);
        this.errorDemora.set('');
        this.reservasApi.createClaim({ id_reserva: item.reservaId, categoria: 'DEMORA_ADMINISTRATIVA', descripcion }).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.enviandoDemora.set(false))).subscribe({
            next: (reclamo) => {
                this.enviandoDemora.set(false);
                this.cerrarDemora();
                this.finalizarReclamo(reclamo, 'Reclamo por demora administrativa enviado. La reserva sigue en curso; administración revisará los inconvenientes informados.');
            },
            error: (error) => this.errorDemora.set(error.message),
        });
    }
    propias = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "propias" }] : /* istanbul ignore next */ []));
    recibidas = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "recibidas" }] : /* istanbul ignore next */ []));
    filtroEstadoRecibidas = signal('todos', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "filtroEstadoRecibidas" }] : /* istanbul ignore next */ []));
    filtroPublicacionRecibidas = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "filtroPublicacionRecibidas" }] : /* istanbul ignore next */ []));
    filtroDesdeRecibidas = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "filtroDesdeRecibidas" }] : /* istanbul ignore next */ []));
    filtroHastaRecibidas = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "filtroHastaRecibidas" }] : /* istanbul ignore next */ []));
    recibidasFiltradas = computed(() => {
        const estado = this.filtroEstadoRecibidas();
        const busqueda = this.filtroPublicacionRecibidas().trim().toLocaleLowerCase('es-AR');
        const desde = this.filtroDesdeRecibidas();
        const hasta = this.filtroHastaRecibidas();
        return this.recibidas().filter(reserva => {
            const categoria = this.categoriaRecibida(reserva);
            const fecha = reserva.fecha_inicio?.slice(0, 10);
            const terminada = !reserva.cancelada && (reserva.finalizada || reserva.estado_estadia === 'FINALIZADA');
            return (estado === 'todos' || categoria === estado || (estado === 'terminada' && terminada)) &&
                (!busqueda || (reserva.publicacion?.titulo ?? '').toLocaleLowerCase('es-AR').includes(busqueda)) &&
                (!desde || (!!fecha && fecha >= desde)) && (!hasta || (!!fecha && fecha <= hasta));
        }).sort((a, b) => {
            const orden = ['codigo', 'liquidacion', 'confirmada', 'terminada', 'historial'];
            const categoriaA = this.categoriaRecibida(a);
            const categoriaB = this.categoriaRecibida(b);
            const prioridad = orden.indexOf(categoriaA) - orden.indexOf(categoriaB);
            const fechaA = categoriaA === 'liquidacion' ? this.fechaHabilitacion(a) : a.fecha_inicio;
            const fechaB = categoriaB === 'liquidacion' ? this.fechaHabilitacion(b) : b.fecha_inicio;
            return prioridad || (fechaA ?? '9999').localeCompare(fechaB ?? '9999') || a.id - b.id;
        });
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "recibidasFiltradas" }] : /* istanbul ignore next */ []));
    paginasRecibidas = computed(() => Math.max(1, Math.ceil(this.recibidasFiltradas().length / 10)), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "paginasRecibidas" }] : /* istanbul ignore next */ []));
    paginaRecibidas = linkedSignal({ ...(ngDevMode ? { debugName: "paginaRecibidas" } : /* istanbul ignore next */ {}), source: this.paginasRecibidas,
        computation: (paginas, anterior) => Math.min(anterior?.value ?? 1, paginas) });
    recibidasPagina = computed(() => {
        const inicio = (this.paginaRecibidas() - 1) * 10;
        return this.recibidasFiltradas().slice(inicio, inicio + 10);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "recibidasPagina" }] : /* istanbul ignore next */ []));
    cargando = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cargando" }] : /* istanbul ignore next */ []));
    error = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    ocupada = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ocupada" }] : /* istanbul ignore next */ []));
    vista = signal('realizadas', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "vista" }] : /* istanbul ignore next */ []));
    reclamos = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reclamos" }] : /* istanbul ignore next */ []));
    /** Subpestaña de Reclamos según el rol en cada uno. */
    vistaReclamos = signal('inquilino', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "vistaReclamos" }] : /* istanbul ignore next */ []));
    reclamosComoInquilino = computed(() => this.reclamosConRol('inquilino'), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reclamosComoInquilino" }] : /* istanbul ignore next */ []));
    reclamosComoAnunciante = computed(() => this.reclamosConRol('anunciante'), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reclamosComoAnunciante" }] : /* istanbul ignore next */ []));
    /** Sin subpestañas si no es anunciante, salvo que tenga reclamos de cuando lo era. */
    separarReclamos = computed(() => this.esAnunciante() || this.reclamosComoAnunciante().length > 0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "separarReclamos" }] : /* istanbul ignore next */ []));
    reclamosVisibles = computed(() => {
        if (!this.separarReclamos())
            return this.reclamos();
        return this.vistaReclamos() === 'anunciante' ? this.reclamosComoAnunciante() : this.reclamosComoInquilino();
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reclamosVisibles" }] : /* istanbul ignore next */ []));
    errorHistorial = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorHistorial" }] : /* istanbul ignore next */ []));
    errorAccionReclamo = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorAccionReclamo" }] : /* istanbul ignore next */ []));
    errorReclamo = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorReclamo" }] : /* istanbul ignore next */ []));
    respuestaReclamo = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "respuestaReclamo" }] : /* istanbul ignore next */ []));
    enviandoRespuesta = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enviandoRespuesta" }] : /* istanbul ignore next */ []));
    textoRespuesta = '';
    /** Imágenes del próximo mensaje del reclamo. */
    imagenesRespuesta = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "imagenesRespuesta" }] : /* istanbul ignore next */ []));
    imagenesDisponibles = imagenesDisponibles;
    maxImagenesPorEnvio = MAX_IMAGENES_POR_ENVIO;
    codigos = signal({}, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "codigos" }] : /* istanbul ignore next */ []));
    codigoIngresado = {};
    mensaje = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mensaje" }] : /* istanbul ignore next */ []));
    dialogoCancelacion = viewChild.required('dialogoCancelacion', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "dialogoCancelacion" }] : /* istanbul ignore next */ []));
    consultaCancelacion;
    accionCancelacion;
    reservaACancelar = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reservaACancelar" }] : /* istanbul ignore next */ []));
    cancelacionComoAnunciante = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cancelacionComoAnunciante" }] : /* istanbul ignore next */ []));
    estadoCancelacion = signal('consultando', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "estadoCancelacion" }] : /* istanbul ignore next */ []));
    motivoCancelacion = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "motivoCancelacion" }] : /* istanbul ignore next */ []));
    condicionesCancelacion = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "condicionesCancelacion" }] : /* istanbul ignore next */ []));
    aceptaTerminosCancelacion = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "aceptaTerminosCancelacion" }] : /* istanbul ignore next */ []));
    errorCancelacion = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorCancelacion" }] : /* istanbul ignore next */ []));
    enviandoCancelacion = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enviandoCancelacion" }] : /* istanbul ignore next */ []));
    reclamoAbierto = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reclamoAbierto" }] : /* istanbul ignore next */ []));
    reclamoCategoria = signal('OTRO', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reclamoCategoria" }] : /* istanbul ignore next */ []));
    reclamoDescripcion = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reclamoDescripcion" }] : /* istanbul ignore next */ []));
    reclamoArchivos = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reclamoArchivos" }] : /* istanbul ignore next */ []));
    reclamoEnviando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reclamoEnviando" }] : /* istanbul ignore next */ []));
    dialogoFaltante = viewChild.required('dialogoFaltante', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "dialogoFaltante" }] : /* istanbul ignore next */ []));
    consultaFaltante;
    reservaFaltante = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reservaFaltante" }] : /* istanbul ignore next */ []));
    saldoFaltante = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "saldoFaltante" }] : /* istanbul ignore next */ []));
    cargandoFaltante = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cargandoFaltante" }] : /* istanbul ignore next */ []));
    enviandoFaltante = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enviandoFaltante" }] : /* istanbul ignore next */ []));
    errorFaltante = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorFaltante" }] : /* istanbul ignore next */ []));
    descripcionFaltante = '';
    abrirFaltante(reserva) {
        this.consultaFaltante?.unsubscribe();
        this.reservaFaltante.set(reserva);
        this.saldoFaltante.set(null);
        this.descripcionFaltante = '';
        this.errorFaltante.set('');
        this.cargandoFaltante.set(true);
        this.dialogoFaltante().nativeElement.showModal();
        this.consultaFaltante = this.reservasApi.cancellationRefundBalance(reserva.id).pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: saldo => { this.saldoFaltante.set(saldo); this.cargandoFaltante.set(false); },
            error: (error) => { this.errorFaltante.set(error.message); this.cargandoFaltante.set(false); },
        });
    }
    cerrarFaltante(evento) {
        evento?.preventDefault();
        if (this.enviandoFaltante())
            return;
        this.consultaFaltante?.unsubscribe();
        this.dialogoFaltante().nativeElement.close();
        this.reservaFaltante.set(null);
    }
    enviarFaltante() {
        const reserva = this.reservaFaltante();
        const saldo = this.saldoFaltante();
        const descripcion = this.descripcionFaltante.trim();
        if (!reserva || !saldo?.devolucion?.importeReclamable || saldo.reclamoAbierto || this.enviandoFaltante())
            return;
        if (descripcion.length < 20 || descripcion.length > 1000) {
            this.errorFaltante.set('La descripción debe tener entre 20 y 1000 caracteres.');
            return;
        }
        this.enviandoFaltante.set(true);
        this.errorFaltante.set('');
        this.reservasApi.claimMissingRefund(reserva.id, descripcion).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.enviandoFaltante.set(false)))
            .subscribe({
            next: (reclamo) => {
                this.enviandoFaltante.set(false);
                this.cerrarFaltante();
                this.finalizarReclamo(reclamo, 'Reclamo por el faltante enviado. Administración revisará la diferencia.');
            },
            error: (error) => this.errorFaltante.set(error.message),
        });
    }
    constructor() {
        const paymentResult = this.route.snapshot.queryParamMap.get('payment');
        if (paymentResult) {
            const queryParams = Object.fromEntries(this.route.snapshot.queryParamMap.keys.map((key) => [
                key,
                this.route.snapshot.queryParamMap.get(key),
            ]));
            this.router.navigate(['/reserva/resultado'], { queryParams, replaceUrl: true });
            return;
        }
        this.cargarReservas();
        activarActualizacionReservas(() => {
            if (this.ocupada() === null)
                this.cargarReservas(true);
        });
    }
    cargarReservas(silenciosa = false) {
        this.consultaReservas?.unsubscribe();
        const anunciante = this.accesoLimitado() ? of(this.esAnunciante()) : this.perfil.esAnunciante();
        this.consultaReservas = forkJoin({
            demoras: this.reservasApi.myAdministrativeDelays().pipe(catchError((error) => {
                this.errorDemorasAdministrativas.set(error.message);
                return of(null);
            })),
            propias: this.reservasApi.mine(),
            recibidas: anunciante.pipe(switchMap((esAnunciante) => esAnunciante ? this.reservasApi.received() : of([]))),
            reclamos: this.reservasApi.myClaims().pipe(catchError((err) => {
                this.errorHistorial.set(err.message);
                return of(null);
            })),
        }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: ({ propias, recibidas, reclamos, demoras }) => {
                if (demoras) {
                    this.demorasAdministrativas.set(demoras);
                    this.errorDemorasAdministrativas.set('');
                }
                this.propias.set(propias);
                this.recibidas.set(recibidas);
                if (reclamos) {
                    this.reclamos.set(reclamos);
                    this.errorHistorial.set('');
                }
                this.codigos.update((codigos) => Object.fromEntries(Object.entries(codigos).filter(([id]) => propias.some((r) => r.id === +id && puedeConsultarCodigo(r)))));
                this.cargando.set(false);
            },
            error: (err) => {
                if (silenciosa)
                    return;
                this.error.set(err.message);
                this.cargando.set(false);
            },
        });
    }
    hoy() {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit',
        }).format(new Date());
    }
    cambiarFiltroRecibidas(filtro, valor) {
        const filtros = { estado: this.filtroEstadoRecibidas, publicacion: this.filtroPublicacionRecibidas,
            desde: this.filtroDesdeRecibidas, hasta: this.filtroHastaRecibidas };
        filtros[filtro].set(valor);
        this.paginaRecibidas.set(1);
    }
    categoriaRecibida(reserva) {
        if (reserva.estado_pago === 'APROBADO' && !reserva.cancelada &&
            ['PENDIENTE_PAGO_PROPIETARIO', 'EN_REVISION'].includes(reserva.estado_liquidacion))
            return 'liquidacion';
        if (!reserva.cancelada && reserva.estado_pago === 'APROBADO' &&
            ['PENDIENTE_INGRESO', 'INGRESO_NO_VERIFICADO'].includes(reserva.estado_estadia))
            return 'codigo';
        if (!reserva.cancelada && !reserva.finalizada && reserva.estado_pago === 'APROBADO' &&
            reserva.estado_estadia === 'CONFIRMADA')
            return 'confirmada';
        if (!reserva.cancelada && (reserva.finalizada || reserva.estado_estadia === 'FINALIZADA'))
            return 'terminada';
        return 'historial';
    }
    fechaHabilitacion(reserva) {
        if (!reserva.fecha_fin || !/^\d{4}-\d{2}-\d{2}$/.test(reserva.fecha_fin))
            return null;
        const fecha = new Date(`${reserva.fecha_fin}T00:00:00Z`);
        if (!Number.isFinite(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== reserva.fecha_fin ||
            !reserva.fecha_inicio || reserva.fecha_inicio > reserva.fecha_fin)
            return null;
        fecha.setUTCDate(fecha.getUTCDate() + 5);
        return fecha.toISOString().slice(0, 10);
    }
    diasHastaVencimiento(reserva) {
        const fecha = this.fechaHabilitacion(reserva);
        return fecha ? Math.max(0, Math.round((Date.parse(fecha) - Date.parse(this.hoy())) / 86_400_000)) : null;
    }
    ultimoCambio(reserva) {
        return [...(reserva.reprogramaciones ?? [])].sort((a, b) => b.id - a.id)[0];
    }
    avisosPendientes(reserva) {
        return (reserva.reprogramaciones ?? []).filter((cambio) => !cambio.notificada_en);
    }
    reintentarAviso(reserva, cambio) {
        if (this.ocupada() !== null)
            return;
        this.error.set('');
        this.mensaje.set('');
        this.iniciarOperacion(reserva.id);
        this.reservasApi
            .retryRescheduleNotice(reserva.id, cambio.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (actualizada) => {
                this.reemplazar(actualizada);
                const enviado = actualizada.reprogramaciones?.find((c) => c.id === cambio.id)?.notificada_en;
                this.mensaje.set(enviado
                    ? 'Aviso enviado al anunciante por correo.'
                    : 'El correo sigue pendiente. Intentá nuevamente más tarde.');
            },
            error: (err) => {
                this.error.set(err.message);
                this.ocupada.set(null);
            },
        });
    }
    cancelar(reserva) {
        this.iniciarOperacion(reserva.id);
        this.reservasApi.cancel(reserva.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (actualizada) => this.reemplazar(actualizada),
            error: (err) => {
                this.error.set(err.message);
                this.ocupada.set(null);
            },
        });
    }
    puedeSolicitarCancelacion(reserva, recibida = false) {
        return (reserva.estado_pago === 'APROBADO' &&
            !reserva.cancelada &&
            !reserva.finalizada &&
            !!reserva.fecha_inicio && reserva.fecha_inicio > this.hoy() &&
            (recibida || ['CONFIRMADA', 'PENDIENTE_INGRESO'].includes(reserva.estado_estadia)) &&
            !reserva.codigo_validado_en &&
            (recibida || reserva.estado_liquidacion !== 'EN_REVISION') &&
            reserva.estado_liquidacion !== 'PAGADO_PROPIETARIO' &&
            reserva.estado_liquidacion !== 'DEVUELTO_INQUILINO' &&
            reserva.estado_liquidacion !== 'DEVUELTO_PARCIAL_INQUILINO');
    }
    solicitarCancelacion(reserva, accion, recibida = false) {
        if (this.ocupada() !== null || !this.puedeSolicitarCancelacion(reserva, recibida))
            return;
        this.accionCancelacion = accion;
        this.reservaACancelar.set(reserva);
        this.cancelacionComoAnunciante.set(recibida);
        this.motivoCancelacion.set('');
        this.aceptaTerminosCancelacion.set(false);
        this.estadoCancelacion.set('consultando');
        this.errorCancelacion.set('');
        this.dialogoCancelacion().nativeElement.showModal();
        this.consultarCancelacion();
    }
    consultarCancelacion() {
        const reserva = this.reservaACancelar();
        if (!reserva)
            return;
        this.estadoCancelacion.set('consultando');
        this.errorCancelacion.set('');
        this.consultaCancelacion?.unsubscribe();
        this.condicionesCancelacion.set(null);
        this.consultaCancelacion = this.reservasApi.cancellationConditions(reserva.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (condiciones) => {
                this.condicionesCancelacion.set(condiciones);
                const { solicitud } = condiciones;
                this.estadoCancelacion.set(solicitud?.estado === 'APROBADA' ? 'aprobada' : solicitud ? 'pendiente' : 'formulario');
            },
            error: (err) => {
                this.estadoCancelacion.set('error');
                this.errorCancelacion.set(err.message);
            },
        });
    }
    enviarCancelacion() {
        const reserva = this.reservaACancelar();
        const motivo = this.motivoCancelacion().trim();
        const condiciones = this.condicionesCancelacion();
        if (!reserva || this.estadoCancelacion() !== 'formulario' || this.enviandoCancelacion() ||
            !condiciones || !condiciones.devolucion || condiciones.motivoBloqueo || !this.aceptaTerminosCancelacion() ||
            motivo.length < 10 || motivo.length > 500)
            return;
        if (condiciones.devolucion && condiciones.devolucion.fechaSolicitud !== this.hoy()) {
            this.aceptaTerminosCancelacion.set(false);
            this.consultarCancelacion();
            this.errorCancelacion.set('Cambió el día. Revisá la devolución actualizada y aceptá nuevamente los términos antes de enviar.');
            return;
        }
        this.errorCancelacion.set('');
        this.enviandoCancelacion.set(true);
        this.reservasApi.requestCancellation(reserva.id, motivo, this.aceptaTerminosCancelacion(), condiciones.devolucion.importe, condiciones.devolucion.moneda)
            .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.enviandoCancelacion.set(false)))
            .subscribe({
            next: (solicitud) => {
                if (solicitud.estado === 'APROBADA') {
                    this.estadoCancelacion.set('aprobada');
                    this.reservaACancelar.set(solicitud.reserva);
                    this.cargarReservas(true);
                    this.toast.mostrar(solicitud.reserva.cancelada ? 'La reserva quedó cancelada.' : 'La cancelación fue aceptada.', 'exito');
                }
                else {
                    this.estadoCancelacion.set('pendiente');
                    this.toast.mostrar('La solicitud de cancelación está en revisión.', 'exito');
                }
            },
            error: (err) => {
                if (err.status === 409) {
                    this.aceptaTerminosCancelacion.set(false);
                    this.consultarCancelacion();
                }
                this.errorCancelacion.set(err.message);
            },
        });
    }
    cerrarCancelacion(evento) {
        evento?.preventDefault();
        if (this.enviandoCancelacion())
            return;
        this.consultaCancelacion?.unsubscribe();
        this.dialogoCancelacion().nativeElement.close();
    }
    limpiarCancelacion() {
        this.reservaACancelar.set(null);
        this.accionCancelacion?.focus();
        this.accionCancelacion = undefined;
    }
    fechasCancelacion(reserva) {
        if (!reserva.fecha_inicio || !reserva.fecha_fin)
            return 'Fechas sin informar';
        const inicio = new Date(reserva.fecha_inicio);
        const fin = new Date(reserva.fecha_fin);
        return new Intl.DateTimeFormat('es-AR', { dateStyle: 'long', timeZone: 'UTC' })
            .formatRange(inicio, fin);
    }
    verCodigo(reserva) {
        if (!puedeConsultarCodigo(reserva))
            return;
        this.iniciarOperacion(reserva.id);
        this.error.set('');
        this.reservasApi.lodgingCode(reserva.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (resultado) => {
                this.codigos.update((actuales) => ({ ...actuales, [reserva.id]: resultado.codigo }));
                this.ocupada.set(null);
            },
            error: (err) => {
                this.error.set(err.message);
                this.ocupada.set(null);
            },
        });
    }
    /** El mensaje del código se muestra en la tarjeta de esa reserva, junto al campo. */
    avisoCodigo = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "avisoCodigo" }] : /* istanbul ignore next */ []));
    validarCodigo(reserva) {
        if (!puedeValidarCodigo(reserva))
            return;
        const codigo = (this.codigoIngresado[reserva.id] ?? '').trim().toUpperCase();
        if (codigo.length !== 8) {
            this.avisoCodigo.set({ id: reserva.id, tipo: 'error', texto: 'El código tiene 8 caracteres. Revisá el que te pasó el huésped.' });
            return;
        }
        this.iniciarOperacion(reserva.id);
        this.avisoCodigo.set(null);
        this.reservasApi.validateLodgingCode(reserva.id, codigo).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (actualizada) => {
                this.codigoIngresado[reserva.id] = '';
                this.reemplazar(actualizada);
                this.avisoCodigo.set({ id: reserva.id, tipo: 'exito', texto: 'Ingreso validado. Le avisamos al huésped por correo.' });
            },
            error: (err) => {
                this.avisoCodigo.set({ id: reserva.id, tipo: 'error', texto: err.message });
                // El back guardó el intento: se actualiza la tarjeta para mostrar los intentos o el bloqueo.
                this.reservasApi.byId(reserva.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                    next: (actualizada) => this.reemplazar(actualizada),
                    error: () => this.ocupada.set(null),
                });
            },
        });
    }
    /** El plazo lo calcula el back (`fin_plazo_reclamo`): el front solo lo compara con hoy. */
    plazoReclamoAbierto(reserva) {
        return !!reserva.fin_plazo_reclamo && this.hoy() <= reserva.fin_plazo_reclamo;
    }
    motivoReclamoNoDisponible(reserva) {
        if (!reserva.fecha_inicio || !reserva.fin_plazo_reclamo)
            return 'La reserva no tiene fechas válidas.';
        if (this.hoy() < reserva.fecha_inicio)
            return `Podés reclamar desde el ${this.fecha(reserva.fecha_inicio)}, cuando empieza la estadía. Antes, usá Solicitar cancelación.`;
        if (!this.plazoReclamoAbierto(reserva))
            return `El plazo para reclamar terminó el ${this.fecha(reserva.fin_plazo_reclamo)}, antes de que se habilite el pago al anunciante.`;
        if (this.tieneReclamoAbierto(reserva))
            return 'Ya tenés un reclamo abierto para esta reserva. Seguilo desde la pestaña Reclamos.';
        return '';
    }
    tieneReclamoAbierto(reserva) {
        return this.reclamos().some(reclamo => reclamo.reserva?.id === reserva.id && ['ABIERTO', 'EN_REVISION'].includes(reclamo.estado));
    }
    abrirReclamo(reserva) {
        if (this.reclamoEnviando() || this.motivoReclamoNoDisponible(reserva))
            return;
        this.reclamoAbierto.set(reserva);
        this.reclamoCategoria.set('OTRO');
        this.reclamoDescripcion.set('');
        this.reclamoArchivos.set([]);
        this.errorReclamo.set('');
    }
    /** Por qué el anunciante no puede pedir el reinicio del código; vacío si puede. */
    motivoPedidoReinicioNoDisponible(reserva) {
        if (this.tieneReclamoAbierto(reserva))
            return 'Ya hay un pedido o un reclamo abierto para esta reserva. Seguilo desde la pestaña Reclamos.';
        if (!this.plazoReclamoAbierto(reserva))
            return 'Venció el plazo para pedir el reinicio. Si no hubo reclamos, la liquidación queda pendiente de pago a tu favor.';
        return '';
    }
    abrirPedidoReinicio(reserva) {
        if (this.reclamoEnviando() || this.motivoPedidoReinicioNoDisponible(reserva))
            return;
        this.reclamoAbierto.set(reserva);
        this.reclamoCategoria.set('CODIGO_BLOQUEADO');
        this.reclamoDescripcion.set('');
        this.reclamoArchivos.set([]);
        this.errorReclamo.set('');
    }
    cerrarReclamo() {
        if (this.reclamoEnviando())
            return;
        this.reclamoAbierto.set(null);
    }
    enviarReclamo() {
        const reserva = this.reclamoAbierto();
        if (!reserva || this.reclamoEnviando())
            return;
        const descripcion = this.reclamoDescripcion().trim();
        if (descripcion.length < 20 || descripcion.length > 1000) {
            this.errorReclamo.set('La descripción debe tener entre 20 y 1000 caracteres.');
            return;
        }
        this.reclamoEnviando.set(true);
        this.errorReclamo.set('');
        this.reservasApi
            .createClaim({
            id_reserva: reserva.id,
            categoria: this.reclamoCategoria(),
            descripcion,
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (reclamo) => {
                const archivos = this.reclamoArchivos();
                if (!archivos.length) {
                    this.finalizarReclamo(reclamo);
                    return;
                }
                this.reservasApi
                    .uploadClaimEvidence(reclamo.id, archivos)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe({
                    next: () => this.finalizarReclamo(reclamo),
                    error: (err) => {
                        this.finalizarReclamo(reclamo, `El reclamo #${reclamo.id} se registró. La carga de imágenes quedó incompleta: ${err.message}`);
                    },
                });
            },
            error: (err) => {
                this.errorReclamo.set(err.message);
                this.reclamoEnviando.set(false);
            },
        });
    }
    abrirRespuestaReclamo(id) {
        this.errorAccionReclamo.set('');
        this.textoRespuesta = '';
        this.imagenesRespuesta.set([]);
        this.respuestaReclamo.set(id);
    }
    /** El mensaje puede llevar imágenes; con imágenes, el texto es opcional. */
    responderReclamo(reclamo) {
        const texto = this.textoRespuesta.trim();
        const imagenes = this.imagenesRespuesta();
        if ((!texto && !imagenes.length) || texto.length > 1000 || this.enviandoRespuesta())
            return;
        this.errorAccionReclamo.set('');
        this.enviandoRespuesta.set(true);
        this.reservasApi
            .sendClaimMessage(reclamo.id, texto, imagenes)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: () => {
                this.enviandoRespuesta.set(false);
                this.respuestaReclamo.set(null);
                this.textoRespuesta = '';
                this.imagenesRespuesta.set([]);
                this.mensaje.set('Mensaje enviado al hilo del reclamo.');
                this.cargarReservas(true);
            },
            error: (err) => {
                this.enviandoRespuesta.set(false);
                this.errorAccionReclamo.set(err.message);
            },
        });
    }
    finalizarReclamo(reclamo, advertencia) {
        const pedido = reclamo.categoria === 'CODIGO_BLOQUEADO';
        this.reclamoEnviando.set(false);
        this.reclamoAbierto.set(null);
        this.reclamoArchivos.set([]);
        this.mensaje.set(advertencia ?? (pedido
            ? 'Pedido enviado. Administración lo va a revisar; podés seguirlo y responder desde esta sección.'
            : 'Reclamo enviado. Podés seguirlo y responder desde esta sección.'));
        this.vista.set('reclamos');
        // La demora puede reclamarla cualquiera de las partes; se muestra el rol del reclamo creado.
        this.vistaReclamos.set(rolEnReclamo(reclamo, this.idUsuario()) ?? (pedido ? 'anunciante' : 'inquilino'));
        this.cargarReservas(true);
    }
    devolucionRegistrada = devolucionRegistrada;
    estado(reserva) {
        const devolucion = devolucionRegistrada(reserva);
        return reserva.cancelada && devolucion
            ? devolucion.etiqueta
            : etiquetasEstadia[reserva.estado_estadia];
    }
    estadoLiquidacion(reserva) {
        // Una cancelación sin devolución no tuvo ingreso: lo retenido se le liquida al anunciante.
        if (reserva.cancelada && reserva.estado_liquidacion === 'PENDIENTE_PAGO_PROPIETARIO')
            return 'Cancelada sin devolución · pago administrativo al anunciante pendiente';
        const etiquetas = {
            NO_APLICA: 'Sin liquidación',
            RETENIDO: 'Dinero retenido hasta el ingreso',
            // Sin ingreso validado (venció el plazo de pago) no se habla de «ingreso confirmado», igual que la etiqueta de la estadía.
            PENDIENTE_PAGO_PROPIETARIO: reserva.codigo_validado_en
                ? 'Ingreso confirmado · pago administrativo pendiente'
                : 'Ingreso no verificado · pago administrativo pendiente',
            EN_REVISION: 'En revisión administrativa',
            PAGADO_PROPIETARIO: 'Pago al propietario registrado',
            DEVUELTO_INQUILINO: 'Devuelto al inquilino',
            DEVUELTO_PARCIAL_INQUILINO: 'Devolución parcial al inquilino · resto pendiente de pago al anunciante',
        };
        return etiquetas[reserva.estado_liquidacion] ?? 'Estado no disponible';
    }
    fecha(valor) {
        return valor ? new Date(`${valor.slice(0, 10)}T12:00:00`).toLocaleDateString('es-AR') : '—';
    }
    fechaTarjeta(valor) {
        return valor
            ? new Date(`${valor.slice(0, 10)}T12:00:00`).toLocaleDateString('es-AR', {
                day: 'numeric', month: 'short', year: 'numeric',
            })
            : '—';
    }
    registrarErrorImagen(id, url) {
        this.imagenesConError.update((imagenes) => ({ ...imagenes, [id]: url }));
    }
    monto(valor, moneda, decimales = 2) {
        return Number(valor).toLocaleString('es-AR', {
            style: 'currency',
            currency: moneda ?? 'ARS',
            maximumFractionDigits: decimales,
        });
    }
    inquilino(reserva) {
        return ([
            reserva.usuario_nombre ?? reserva.usuario?.nombre,
            reserva.usuario_apellido ?? reserva.usuario?.apellido,
        ]
            .filter(Boolean)
            .join(' ') || 'Inquilino eliminado');
    }
    detalleReserva(reserva) {
        return { reserva_id: reserva.id };
    }
    /** La devolución la sigue el inquilino; el anunciante no gestiona reembolsos. */
    esInquilinoDelReclamo(reclamo) {
        return rolEnReclamo(reclamo, this.idUsuario()) === 'inquilino';
    }
    reclamosConRol(rol) {
        const idUsuario = this.idUsuario();
        return this.reclamos().filter((reclamo) => rolEnReclamo(reclamo, idUsuario) === rol);
    }
    idUsuario() {
        return Number(this.auth.currentUser()?.sub);
    }
    /** El estado y el chat de la devolución están en el detalle de la reserva. */
    verReembolsoReclamo(reclamo) {
        if (reclamo.reserva?.id)
            void this.router.navigate(['/reserva/resultado'], { queryParams: { reserva_id: reclamo.reserva.id } });
    }
    iniciarOperacion(id) {
        // Una consulta anterior a la escritura no debe restaurar datos desactualizados.
        this.consultaReservas?.unsubscribe();
        this.ocupada.set(id);
    }
    reemplazar(actualizada) {
        this.propias.update((items) => items.map((item) => (item.id === actualizada.id ? { ...item, ...actualizada } : item)));
        this.recibidas.update((items) => items.map((item) => (item.id === actualizada.id ? { ...item, ...actualizada } : item)));
        this.ocupada.set(null);
    }
    static ɵfac = function MisReservasComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || MisReservasComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: MisReservasComponent, selectors: [["app-mis-reservas"]], viewQuery: function MisReservasComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.dialogoDemora, _c0, 5)(ctx.dialogoCancelacion, _c1, 5)(ctx.dialogoFaltante, _c2, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance(3);
        } }, decls: 43, vars: 16, consts: [["dialogoDemora", ""], ["dialogoCancelacion", ""], ["dialogoFaltante", ""], ["tarjetaReserva", ""], ["formularioReclamo", ""], ["accionesReserva", ""], ["menu", ""], [1, "acct-page"], [1, "acct-wrap"], [1, "acct-heading"], ["role", "alert", 1, "cancellation-error"], ["aria-labelledby", "administrative-delays-title", 1, "administrative-delays"], ["aria-labelledby", "administrative-delay-title", 1, "cancellation-dialog", 3, "cancel"], ["id", "administrative-delay-title"], ["aria-labelledby", "cancel-title", 1, "cancellation-dialog", 3, "cancel", "close"], ["type", "button", "aria-label", "Cerrar", "autofocus", "", 1, "cancellation-close", 3, "click", "disabled"], ["lucideX", "", "aria-hidden", "true", 3, "size"], [1, "cancellation-icon"], ["lucideCalendarX", "", "aria-hidden", "true", 3, "size"], ["id", "cancel-title"], ["aria-labelledby", "faltante-titulo", 1, "cancellation-dialog", 3, "cancel"], ["id", "faltante-titulo"], ["role", "status"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", 3, "click", "disabled"], ["role", "status", 1, "acct-alert", "acct-alert--info"], ["role", "alert", 1, "acct-alert", "acct-alert--error"], [1, "acct-state"], ["id", "administrative-delays-title"], [1, "administrative-delay"], ["type", "button", 1, "booking-button", "booking-button--primary"], ["type", "button", 1, "booking-button", 3, "click"], ["type", "button", 1, "booking-button", "booking-button--primary", 3, "click"], [3, "ngSubmit"], ["for", "descripcion-demora"], ["id", "descripcion-demora", "name", "descripcionDemora", "rows", "5", "required", "", "minlength", "20", "maxlength", "1000", "autofocus", "", 3, "ngModelChange", "ngModel", "disabled"], [1, "cancellation-actions"], ["type", "button", 1, "booking-button", 3, "click", "disabled"], ["type", "submit", 1, "booking-button", "booking-button--primary", 3, "disabled"], [1, "cancellation-reservation"], ["alt", "", 3, "src"], [1, "cancellation-placeholder"], ["role", "status", 1, "cancellation-refund", 3, "cancellation-refund--warning"], ["role", "status", 1, "cancellation-warning"], ["role", "status", 1, "cancellation-info"], ["type", "button", 1, "acct-btn", "cancellation-back", 3, "click", "disabled"], ["type", "submit", 1, "acct-btn", "cancellation-submit", 3, "disabled"], ["type", "button", 1, "acct-btn", "cancellation-submit"], ["alt", "", 3, "error", "src"], ["lucideImage", "", "aria-hidden", "true", 3, "size"], ["role", "status", 1, "cancellation-refund"], ["lucideTriangleAlert", "", "aria-hidden", "true", 3, "size"], ["role", "status", 1, "cancellation-error"], ["for", "motivo-cancelacion"], ["aria-hidden", "true"], ["id", "motivo-cancelacion", "name", "motivoCancelacion", "rows", "4", "required", "", "minlength", "10", "maxlength", "500", "aria-describedby", "motivo-cancelacion-ayuda", "placeholder", "Contanos por qu\u00E9 necesit\u00E1s cancelar.", 3, "ngModelChange", "ngModel", "disabled"], ["id", "motivo-cancelacion-ayuda"], [1, "cancellation-info"], ["lucideInfo", "", "aria-hidden", "true", 3, "size"], [1, "cancellation-terms"], [1, "cancellation-accept"], ["type", "checkbox", "name", "aceptaTerminosCancelacion", "required", "", 3, "ngModelChange", "ngModel", "disabled"], ["type", "button", 1, "acct-btn", "cancellation-submit", 3, "click"], [1, "cancellation-refund"], [1, "claim-form"], [1, "claim-form", 3, "ngSubmit"], ["for", "faltante-descripcion"], ["id", "faltante-descripcion", "name", "descripcionFaltante", "rows", "4", "required", "", "minlength", "20", "maxlength", "1000", "aria-describedby", "faltante-ayuda", 3, "ngModelChange", "ngModel", "disabled"], ["id", "faltante-ayuda"], ["type", "submit", 1, "acct-btn", "acct-btn--primary", 3, "disabled"], ["role", "tablist", "aria-label", "Tipo de reservas", 1, "reservation-tabs"], ["type", "button", "role", "tab", 3, "click"], ["type", "button", "role", "tab", 3, "is-active"], ["role", "tabpanel", 1, "reservation-section"], [1, "acct-card", "booking-card"], [1, "acct-card", "empty"], [4, "ngTemplateOutlet", "ngTemplateOutletContext"], [1, "reservation-filters"], [3, "ngModelChange", "ngModel"], ["value", "todos"], ["value", "codigo"], ["value", "liquidacion"], ["value", "confirmada"], ["value", "terminada"], ["value", "historial"], ["type", "search", "placeholder", "Buscar publicaci\u00F3n", 3, "ngModelChange", "ngModel"], ["type", "date", 3, "ngModelChange", "ngModel"], ["aria-label", "Paginaci\u00F3n de reservas recibidas", 1, "reservation-pagination"], [1, "section-heading"], ["role", "alert", 1, "claim-error"], ["role", "tablist", "aria-label", "Rol en los reclamos", 1, "reservation-tabs", "reservation-tabs--sub"], [1, "acct-card", "reservation", "claim-card"], [3, "verReembolso", "reclamo", "mostrarVerReembolso"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", "acct-btn--sm", 3, "disabled"], ["etiqueta", "Mensaje para el reclamo", 3, "textoChange", "imagenesChange", "enviar", "texto", "imagenes", "adjuntos", "deshabilitado"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", "acct-btn--sm", 3, "click", "disabled"], [1, "booking-card__cover"], ["alt", "", "loading", "lazy", "decoding", "async", 3, "src"], [1, "booking-card__main"], [1, "booking-card__overview"], [1, "booking-card__info"], [1, "booking-card__heading"], [1, "acct-badge"], [1, "booking-card__dates"], [1, "booking-card__settlement"], [1, "booking-card__total"], [1, "booking-card__footer"], [1, "booking-quote"], [1, "booking-card__actions"], ["type", "button", 1, "booking-button", 3, "disabled"], ["routerLink", "/reserva/resultado", 1, "booking-button", "booking-button--primary", 3, "queryParams"], ["type", "button", 1, "booking-button"], [1, "booking-card__extras"], ["alt", "", "loading", "lazy", "decoding", "async", 3, "error", "src"], ["lucideLockKeyhole", "", "aria-hidden", "true", 3, "size"], ["lucideChevronRight", "", "aria-hidden", "true", 3, "size"], ["type", "button", 1, "booking-button", "booking-button--more"], ["lucideEllipsis", "", "aria-hidden", "true", 3, "size"], ["popover", "", 1, "booking-menu", 3, "id"], ["routerLink", "/reserva/resultado", 3, "queryParams"], ["type", "button", 1, "booking-menu__danger", 3, "disabled"], [3, "routerLink"], [3, "click", "routerLink"], ["lucideExternalLink", "", "aria-hidden", "true", 3, "size"], ["routerLink", "/reserva/resultado", 3, "click", "queryParams"], ["lucideCalendar", "", "aria-hidden", "true", 3, "size"], [1, "booking-menu__hint"], ["type", "button", 3, "disabled"], ["type", "button", 3, "click", "disabled"], ["type", "button", 1, "booking-menu__danger", 3, "click", "disabled"], [1, "muted"], [1, "reschedule-history"], ["role", "status", 1, "reschedule-notice"], ["role", "status", 1, "lodging-code"], [1, "code-entry"], [1, "code-entry__aviso", 3, "code-entry__aviso--error"], [1, "code-entry", 3, "ngSubmit"], [3, "for"], ["maxlength", "8", "autocomplete", "off", "placeholder", "Ej.: K7M4P9Q2", 3, "ngModelChange", "id", "name", "ngModel"], ["type", "submit", 1, "acct-btn", "acct-btn--primary", "acct-btn--sm", 3, "disabled"], [3, "id"], [1, "code-entry__hint"], [1, "code-entry__aviso"], [1, "code-entry__aviso", "code-entry__aviso--error"], ["type", "button", 1, "acct-btn", "acct-btn--primary", "acct-btn--sm", "code-entry__pedido", 3, "click", "disabled"], ["name", "descripcionReclamo", "rows", "4", "minlength", "20", "maxlength", "1000", "required", "", 3, "ngModelChange", "id", "placeholder", "aria-describedby", "ngModel", "disabled"], [3, "archivosChange", "archivos", "maximo", "deshabilitado"], [1, "reschedule-form__actions"], ["name", "categoriaReclamo", 3, "ngModelChange", "id", "ngModel", "disabled"], ["value", "LIMPIEZA"], ["value", "MANTENIMIENTO"], ["value", "INGRESO"], ["value", "DESCRIPCION"], ["value", "OTRO"]], template: function MisReservasComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 7)(1, "div", 8)(2, "div", 9)(3, "div")(4, "h1");
            i0.ɵɵtext(5, "Mis reservas");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(6, MisReservasComponent_Conditional_6_Template, 2, 0, "p")(7, MisReservasComponent_Conditional_7_Template, 2, 0, "p");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(8, MisReservasComponent_Conditional_8_Template, 2, 1, "p", 10);
            i0.ɵɵconditionalCreate(9, MisReservasComponent_Conditional_9_Template, 5, 0, "section", 11);
            i0.ɵɵelementStart(10, "dialog", 12, 0);
            i0.ɵɵlistener("cancel", function MisReservasComponent_Template_dialog_cancel_10_listener($event) { return ctx.cerrarDemora($event); });
            i0.ɵɵelementStart(12, "h2", 13);
            i0.ɵɵtext(13, "Reclamar por demora administrativa");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(14, MisReservasComponent_Conditional_14_Template, 16, 9);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(15, "dialog", 14, 1);
            i0.ɵɵlistener("cancel", function MisReservasComponent_Template_dialog_cancel_15_listener($event) { return ctx.cerrarCancelacion($event); })("close", function MisReservasComponent_Template_dialog_close_15_listener() { return ctx.limpiarCancelacion(); });
            i0.ɵɵelementStart(17, "button", 15);
            i0.ɵɵlistener("click", function MisReservasComponent_Template_button_click_17_listener() { return ctx.cerrarCancelacion(); });
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(18, "svg", 16);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(19, "div", 17);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(20, "svg", 18);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(21, "h2", 19);
            i0.ɵɵtext(22, "Cancelar reserva");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(23, MisReservasComponent_Conditional_23_Template, 24, 14);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(24, "dialog", 20, 2);
            i0.ɵɵlistener("cancel", function MisReservasComponent_Template_dialog_cancel_24_listener($event) { return ctx.cerrarFaltante($event); });
            i0.ɵɵelementStart(26, "h2", 21);
            i0.ɵɵtext(27, "Reclamar reembolso faltante");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(28, "p");
            i0.ɵɵtext(29);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(30, MisReservasComponent_Conditional_30_Template, 2, 0, "p", 22);
            i0.ɵɵconditionalCreate(31, MisReservasComponent_Conditional_31_Template, 2, 1);
            i0.ɵɵconditionalCreate(32, MisReservasComponent_Conditional_32_Template, 2, 1, "p", 10);
            i0.ɵɵelementStart(33, "button", 23);
            i0.ɵɵlistener("click", function MisReservasComponent_Template_button_click_33_listener() { return ctx.cerrarFaltante(); });
            i0.ɵɵtext(34, "Volver");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(35, MisReservasComponent_Conditional_35_Template, 2, 1, "div", 24);
            i0.ɵɵconditionalCreate(36, MisReservasComponent_Conditional_36_Template, 2, 1, "div", 25);
            i0.ɵɵconditionalCreate(37, MisReservasComponent_Conditional_37_Template, 4, 0, "div", 26)(38, MisReservasComponent_Conditional_38_Template, 13, 10);
            i0.ɵɵelementEnd()();
            i0.ɵɵtemplate(39, MisReservasComponent_ng_template_39_Template, 45, 24, "ng-template", null, 3, i0.ɵɵtemplateRefExtractor)(41, MisReservasComponent_ng_template_41_Template, 18, 24, "ng-template", null, 4, i0.ɵɵtemplateRefExtractor);
        } if (rf & 2) {
            let tmp_8_0;
            let tmp_12_0;
            let tmp_15_0;
            i0.ɵɵadvance(6);
            i0.ɵɵconditional(ctx.esAnunciante() ? 6 : 7);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.errorDemorasAdministrativas() ? 8 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.demorasAdministrativas().length ? 9 : -1);
            i0.ɵɵadvance(5);
            i0.ɵɵconditional((tmp_8_0 = ctx.demoraSeleccionada()) ? 14 : -1, tmp_8_0);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", ctx.enviandoCancelacion());
            i0.ɵɵadvance();
            i0.ɵɵproperty("size", 22);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("size", 34);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional((tmp_12_0 = ctx.reservaACancelar()) ? 23 : -1, tmp_12_0);
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate1("Reserva #", ctx.reservaFaltante()?.id, ". Revis\u00E1 cu\u00E1nto corresponde por la cancelaci\u00F3n y cu\u00E1nto ya se devolvi\u00F3.");
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.cargandoFaltante() ? 30 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_15_0 = ctx.saldoFaltante()) ? 31 : -1, tmp_15_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.errorFaltante() ? 32 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("disabled", ctx.enviandoFaltante());
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.mensaje() ? 35 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.error() ? 36 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.cargando() ? 37 : 38);
        } }, dependencies: [RouterLink, SpinnerComponent, FormsModule, i1.ɵNgNoValidate, i1.NgSelectOption, i1.ɵNgSelectMultipleOption, i1.DefaultValueAccessor, i1.CheckboxControlValueAccessor, i1.SelectControlValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.RequiredValidator, i1.MinLengthValidator, i1.MaxLengthValidator, i1.CheckboxRequiredValidator, i1.NgModel, i1.NgForm, ClaimHistoryComponent, ConversationComposerComponent, CargaImagenesComponent, NgTemplateOutlet,
            LucideCalendar, LucideCalendarX, LucideInfo, LucideChevronRight, LucideEllipsis, LucideExternalLink,
            LucideImage, LucideLockKeyhole, LucideTriangleAlert, LucideX,
            DatePipe], styles: ["@use '../../shared/components/claim-history/claim-form';\r\n\r\n\r\n.reservation-tabs[_ngcontent-%COMP%] { display: flex; gap: .5rem; padding: .35rem; border: 1px solid var(--%NS%color-border); border-radius: 10px; background: #fff; }\r\n.reservation-tabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { display: inline-flex; flex: 1; align-items: center; justify-content: center; gap: .5rem; min-height: 44px; padding: .55rem 1rem; border: 0; border-radius: 7px; background: transparent; color: var(--%NS%color-text-muted); font-weight: 800; cursor: pointer; }\r\n.reservation-tabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover { background: var(--%NS%color-bg); color: var(--%NS%color-text); }\r\n.reservation-tabs[_ngcontent-%COMP%]   button.is-active[_ngcontent-%COMP%] { background: var(--%NS%color-secondary); color: #fff; box-shadow: 0 3px 9px color-mix(in srgb, var(--%NS%color-secondary), transparent 70%); }\r\n.reservation-tabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { display: grid; min-width: 1.45rem; height: 1.45rem; place-items: center; padding: 0 .35rem; border-radius: 999px; background: rgba(255,255,255,.2); font-size: .74rem; }\r\n.reservation-tabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:focus-visible { outline: 3px solid color-mix(in srgb, var(--%NS%color-secondary), transparent 70%); outline-offset: 2px; }\r\n.reservation-tabs--sub[_ngcontent-%COMP%] { margin-bottom: 1rem; }\r\n\r\n.reservation-section[_ngcontent-%COMP%] { margin-top: .25rem; }\r\n.reservation-filters[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; gap: .75rem; margin-bottom: 1rem; }\r\n.reservation-filters[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] { display: grid; gap: .3rem; flex: 1 1 150px; color: var(--%NS%color-text-muted); font-size: .85rem; font-weight: 700; }\r\n.reservation-filters[_ngcontent-%COMP%]   :is(input[_ngcontent-%COMP%], select[_ngcontent-%COMP%]) { width: 100%; min-height: 42px; padding: .5rem; border: 1px solid var(--%NS%color-border); border-radius: 7px; background: #fff; color: var(--%NS%color-text); font: inherit; }\r\n.reservation-pagination[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: .75rem; margin: 1rem 0; }\r\n.reservation-pagination[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] { display: flex; gap: .5rem; }\r\n.section-heading[_ngcontent-%COMP%] { margin-bottom: .85rem; }\r\n.section-heading[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 0; font-size: 1.15rem; }\r\n.section-heading[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: .2rem 0 0; color: var(--%NS%color-text-muted); font-size: .9rem; }\r\n.reservation[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: .75rem; }\r\n.reschedule-form__actions[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: .85rem; }\r\n.reschedule-history[_ngcontent-%COMP%] { display: grid; gap: .15rem; margin: .5rem 0; padding: .65rem .8rem; border-left: 3px solid var(--%NS%color-primary); background: #fffaf2; font-size: .85rem; }\r\n.reschedule-notice[_ngcontent-%COMP%] { display: flex; align-items: center; flex-wrap: wrap; gap: .5rem; margin: .5rem 0; color: #744210; font-size: .85rem; }\r\n.reservation[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] { margin: .5rem 0 .25rem; font-size: 1.05rem; }\r\n.reservation[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: .2rem 0; }\r\n.muted[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); font-size: .9rem; }\r\n.empty[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); }\r\n.settlement-state[_ngcontent-%COMP%] { color: var(--%NS%color-primary); font-size: .88rem; font-weight: 750; }\r\n.lodging-code[_ngcontent-%COMP%] { display: grid; width: fit-content; gap: .2rem; margin-top: .75rem; padding: .8rem 1rem; border: 1px dashed var(--%NS%color-primary); border-radius: 9px; background: #fffaf2; }\r\n.lodging-code[_ngcontent-%COMP%]   small[_ngcontent-%COMP%], .lodging-code[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); }\r\n.lodging-code[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { color: var(--%NS%color-primary); font-size: 1.6rem; letter-spacing: .18em; }\r\n.lodging-code[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { max-width: 360px; font-size: .78rem; }\r\n.code-entry[_ngcontent-%COMP%] { display: grid; gap: .35rem; margin-top: .75rem; }\r\n.code-entry[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] { font-size: .82rem; font-weight: 750; }\r\n.code-entry[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] { display: flex; gap: .5rem; flex-wrap: wrap; }\r\n.code-entry[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] { width: 170px; padding: .65rem .75rem; border: 1px solid var(--%NS%color-border); border-radius: 7px; text-transform: uppercase; font-weight: 800; letter-spacing: .12em; }\r\n.code-entry[_ngcontent-%COMP%]   input[aria-invalid=\"true\"][_ngcontent-%COMP%] { border-color: #b42318; }\r\n.code-entry__hint[_ngcontent-%COMP%], .code-entry__aviso[_ngcontent-%COMP%] { margin: .35rem 0 0; font-size: .85rem; }\r\n.code-entry__hint[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); }\r\n.code-entry__aviso[_ngcontent-%COMP%] { padding: .5rem .7rem; border-radius: 7px; background: #e9f7ef; color: #1d5e3b; font-weight: 650; }\r\n.code-entry__aviso--error[_ngcontent-%COMP%] { background: #fdecea; color: #8a1c13; }\r\n.code-entry__pedido[_ngcontent-%COMP%] { justify-self: start; margin-top: .5rem; }\r\n\r\n@media (max-width: 600px) {\r\n    .reservation-tabs[_ngcontent-%COMP%] { flex-direction: column; }\r\n  .reservation[_ngcontent-%COMP%] { align-items: flex-start; flex-direction: column; }\r\n}\r\n\r\n.booking-card[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  grid-template-columns: clamp(145px, 24%, 215px) minmax(0, 1fr);\r\n  column-gap: 1.25rem;\r\n  row-gap: .85rem;\r\n  margin-bottom: 1rem;\r\n  padding: .85rem;\r\n  border-radius: .85rem;\r\n}\r\n.booking-card__cover[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  place-items: center;\r\n  position: relative;\r\n  min-height: 138px;\r\n  border-radius: .55rem;\r\n  overflow: hidden;\r\n  background: #edf0f2;\r\n  color: #657583;\r\n}\r\n.booking-card__cover[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }\r\n.booking-card__main[_ngcontent-%COMP%] { display: grid; grid-template-rows: 1fr auto; min-width: 0; }\r\n.booking-card__overview[_ngcontent-%COMP%] { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); align-items: stretch; padding-bottom: .65rem; }\r\n.booking-card__info[_ngcontent-%COMP%] { min-width: 0; padding-right: 1rem; }\r\n.booking-card__heading[_ngcontent-%COMP%] { display: flex; align-items: center; flex-wrap: wrap; gap: .4rem .85rem; margin-bottom: .65rem; }\r\n.booking-card__heading[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 0; color: var(--%NS%color-text); font-size: clamp(1.15rem, 2.25vw, 1.55rem); line-height: 1.15; letter-spacing: -.025em; }\r\n.booking-card__heading[_ngcontent-%COMP%]   .acct-badge--ok[_ngcontent-%COMP%] { background: #cef1d6; color: #155e28; }\r\n.booking-card__dates[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; max-width: 20rem; margin: 0; }\r\n.booking-card__dates[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%]    + div[_ngcontent-%COMP%] { padding-inline-start: .85rem; border-inline-start: 1px solid var(--%NS%color-border); }\r\n.booking-card__dates[_ngcontent-%COMP%]   dt[_ngcontent-%COMP%], .booking-card__total[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { color: #4d5561; font-size: .82rem; }\r\n.booking-card__dates[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%] { margin: .1rem 0 0; font-size: .98rem; font-weight: 800; }\r\n.booking-card__settlement[_ngcontent-%COMP%] { display: flex; align-items: center; gap: .35rem; margin: .5rem 0 0; color: #4d5561; font-size: .81rem; }\r\n.booking-card__settlement[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { flex: none; color: #a9530c; }\r\n.booking-card__total[_ngcontent-%COMP%] { display: grid; align-content: start; gap: .25rem; border-inline-start: 1px solid var(--%NS%color-border); padding: .7rem 0 0 1.25rem; }\r\n.booking-card__total[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { font-size: clamp(1.2rem, 2.5vw, 1.75rem); font-weight: 850; line-height: 1.12; letter-spacing: -.025em; }\r\n.booking-card__footer[_ngcontent-%COMP%] { display: flex; align-items: start; justify-content: space-between; gap: .65rem; padding-top: .55rem; border-top: 1px solid var(--%NS%color-border); }\r\n.booking-card__actions[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: .45rem; margin-inline-start: auto; }\r\n.booking-button[_ngcontent-%COMP%] { display: inline-flex; justify-content: center; align-items: center; min-height: 36px; padding: .35rem .85rem; border: 1px solid #a6aeb9; border-radius: .5rem; background: #fff; color: var(--%NS%color-text); font-size: .8rem; font-weight: 650; text-decoration: none; cursor: pointer; }\r\n.booking-button[_ngcontent-%COMP%]:hover { background: #f3f5f7; }\r\n.booking-button--primary[_ngcontent-%COMP%] { background: #b93819; border-color: #b93819; color: #fff; padding-inline: 1.1rem; }\r\n.booking-button--%NS%primary[_ngcontent-%COMP%]:hover { background: #9e2e15; }\r\n.booking-button--more[_ngcontent-%COMP%] { width: 40px; padding: .2rem; }\r\n.booking-button[_ngcontent-%COMP%]:disabled, .booking-menu[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:disabled { opacity: .55; cursor: default; }\r\n.booking-quote[_ngcontent-%COMP%] { min-width: 0; max-width: 15rem; color: #3d4856; font-size: .8rem; }\r\n.booking-quote[_ngcontent-%COMP%]   summary[_ngcontent-%COMP%] { display: flex; align-items: center; gap: .2rem; min-height: 36px; width: fit-content; cursor: pointer; list-style: none; }\r\n.booking-quote[_ngcontent-%COMP%]   summary[_ngcontent-%COMP%]::-webkit-details-marker { display: none; }\r\n.booking-quote[open][_ngcontent-%COMP%]   summary[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { transform: rotate(90deg); }\r\n.booking-quote[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: .2rem 0 0; }\r\n.booking-menu[_ngcontent-%COMP%] {\r\n  width: min(15rem, calc(100vw - 2rem));\r\n  max-height: calc(100dvh - 2rem);\r\n  margin: auto;\r\n  padding: .4rem;\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: .65rem;\r\n  background: #fff;\r\n  box-shadow: 0 8px 24px #18253526;\r\n  color: var(--%NS%color-text);\r\n}\r\n@supports (position-area: block-end span-inline-start) {\r\n  .booking-menu[_ngcontent-%COMP%] {\r\n    inset: auto;\r\n    margin: .35rem 0;\r\n    position-area: block-end span-inline-start;\r\n    position-try-fallbacks: flip-block;\r\n  }\r\n}\r\n.booking-menu[_ngcontent-%COMP%]   :is(a[_ngcontent-%COMP%], button[_ngcontent-%COMP%]), .booking-menu__hint[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: .55rem;\r\n  width: 100%;\r\n  min-height: 36px;\r\n  padding: .45rem .6rem;\r\n  border: 0;\r\n  border-radius: .35rem;\r\n  background: transparent;\r\n  color: inherit;\r\n  font: inherit;\r\n  font-size: .83rem;\r\n  text-align: start;\r\n  text-decoration: none;\r\n}\r\n.booking-menu[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { flex: none; }\r\n.booking-menu[_ngcontent-%COMP%]   :is(a[_ngcontent-%COMP%], button[_ngcontent-%COMP%]) { cursor: pointer; }\r\n.booking-menu[_ngcontent-%COMP%]   [_ngcontent-%COMP%]:is(a, button):hover { background: #f3f5f7; }\r\n.booking-menu[_ngcontent-%COMP%]   .booking-menu__danger[_ngcontent-%COMP%] { margin-top: .2rem; border-top: 1px solid var(--%NS%color-border); color: #ae261d; }\r\n.booking-menu[_ngcontent-%COMP%]   .booking-menu__hint[_ngcontent-%COMP%] { align-items: flex-start; margin: 0; color: #526475; }\r\n.booking-card[_ngcontent-%COMP%]   [_ngcontent-%COMP%]:is(a, button, summary):focus-visible { outline: 2px solid #275f80; outline-offset: 2px; }\r\n.booking-card[_ngcontent-%COMP%]    > :is(.booking-card__extras[_ngcontent-%COMP%], .claim-form[_ngcontent-%COMP%]) { grid-column: 1 / -1; }\r\n.booking-card__extras[_ngcontent-%COMP%] { border-top: 1px solid var(--%NS%color-border); padding-top: .6rem; }\r\n.booking-card__extras[_ngcontent-%COMP%]    > p[_ngcontent-%COMP%] { margin: .2rem 0; }\r\n\r\n@media (max-width: 680px) {\r\n  .booking-card[_ngcontent-%COMP%] { grid-template-columns: 1fr; gap: .75rem; }\r\n  .booking-card__cover[_ngcontent-%COMP%] { min-height: 0; aspect-ratio: 2.45; }\r\n  .booking-card__info[_ngcontent-%COMP%] { padding-right: .55rem; }\r\n  .booking-card__total[_ngcontent-%COMP%] { padding: .15rem 0 0 .65rem; }\r\n  .booking-card__footer[_ngcontent-%COMP%] { flex-wrap: wrap; }\r\n}\r\n@media (max-width: 390px) {\r\n  .booking-card__overview[_ngcontent-%COMP%] { grid-template-columns: 1fr; gap: .6rem; }\r\n  .booking-card__total[_ngcontent-%COMP%] { padding: .55rem 0 0; border-inline-start: 0; border-top: 1px solid var(--%NS%color-border); }\r\n  .booking-card__actions[_ngcontent-%COMP%] { justify-content: flex-start; margin-inline-start: 0; }\r\n}\r\n\r\n.cancellation-dialog[_ngcontent-%COMP%] {\r\n  position: fixed;\r\n  inset: 0;\r\n  margin: auto;\r\n  box-sizing: border-box;\r\n  width: min(38rem, calc(100% - 2rem));\r\n  max-height: calc(100dvh - 2rem);\r\n  padding: clamp(1rem, 4vw, 1.75rem);\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: 18px;\r\n  background: white;\r\n  color: var(--%NS%color-text);\r\n  box-shadow: 0 20px 48px #0f172a40;\r\n}\r\n.cancellation-dialog[_ngcontent-%COMP%]::backdrop { background: #10182880; }\r\n.cancellation-dialog[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: .45rem 0 1.35rem; font-size: clamp(1.55rem, 4vw, 2.15rem); }\r\n.cancellation-close[_ngcontent-%COMP%] {\r\n  position: absolute; top: .85rem; right: .85rem; display: grid; place-items: center;\r\n  width: 42px; height: 42px; border: 0; border-radius: 8px;\r\n  background: transparent; color: var(--%NS%color-text); cursor: pointer;\r\n}\r\n.cancellation-close[_ngcontent-%COMP%]:hover:not(:disabled) { background: #f2f4f7; }\r\n.cancellation-icon[_ngcontent-%COMP%] { display: grid; place-items: center; width: 4.15rem; height: 4.15rem; border-radius: 14px; background: #f8e2db; color: #ac3618; }\r\n.cancellation-reservation[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 1rem; padding: .8rem; margin-bottom: 1.25rem; border-radius: 12px; background: #f1f2f4; }\r\n.cancellation-reservation[_ngcontent-%COMP%]   img[_ngcontent-%COMP%], .cancellation-placeholder[_ngcontent-%COMP%] { flex: none; width: clamp(72px, 22vw, 165px); aspect-ratio: 5 / 3; object-fit: cover; border-radius: 9px; }\r\n.cancellation-placeholder[_ngcontent-%COMP%] { display: grid; place-items: center; background: #e4e7ec; color: var(--%NS%color-text-muted); }\r\n.cancellation-reservation[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { font-size: 1.1rem; overflow-wrap: anywhere; }\r\n.cancellation-reservation[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: .3rem 0 0; color: var(--%NS%color-text-muted); }\r\n.cancellation-dialog[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] { display: block; margin-bottom: .5rem; font-weight: 750; }\r\n.cancellation-dialog[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], .cancellation-error[_ngcontent-%COMP%] { color: #a52e17; }\r\n.cancellation-dialog[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] { box-sizing: border-box; width: 100%; padding: .7rem .8rem; border: 1px solid #9da6b5; border-radius: 9px; font: inherit; color: inherit; resize: vertical; }\r\n.cancellation-dialog[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); }\r\n.cancellation-refund[_ngcontent-%COMP%] { margin-bottom: 1.2rem; padding: 1rem; border: 1px solid #b9d7c0; border-radius: 10px; background: #edf7ef; color: #174d2a; overflow-wrap: anywhere; }\r\n.cancellation-refund[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { font-size: 1.1rem; }\r\n.cancellation-refund[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: .5rem 0 0; font-size: .9rem; }\r\n.cancellation-refund--warning[_ngcontent-%COMP%], .cancellation-warning[_ngcontent-%COMP%] { border: 1px solid #e0b961; background: #fff6df; color: #684000; }\r\n.cancellation-warning[_ngcontent-%COMP%] { display: flex; align-items: flex-start; gap: .7rem; padding: .8rem 1rem; margin-bottom: 1rem; border-radius: 10px; }\r\n.cancellation-warning[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { flex: none; }\r\n.cancellation-warning[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; }\r\n.cancellation-info[_ngcontent-%COMP%] { display: flex; align-items: center; gap: .8rem; padding: .8rem 1rem; margin-top: 1rem; border-radius: 10px; background: #e1efff; color: #123664; }\r\n.cancellation-info[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { flex: none; }\r\n.cancellation-info[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; }\r\n.cancellation-terms[_ngcontent-%COMP%] { margin: 1rem 0; }\r\n.cancellation-terms[_ngcontent-%COMP%]   summary[_ngcontent-%COMP%] { color: #123664; cursor: pointer; font-weight: 700; text-decoration: underline; }\r\n.cancellation-terms[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%] { list-style: disc; padding-inline-start: 1.5rem; margin-top: .6rem; }\r\n.cancellation-terms[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]    + li[_ngcontent-%COMP%] { margin-top: .4rem; }\r\n.cancellation-dialog[_ngcontent-%COMP%]   .cancellation-accept[_ngcontent-%COMP%] { display: flex; align-items: baseline; gap: .55rem; }\r\n.cancellation-accept[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] { appearance: auto; }\r\n.cancellation-actions[_ngcontent-%COMP%] { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: .75rem; margin-top: 1.3rem; }\r\n.cancellation-back[_ngcontent-%COMP%] { background: white; color: #a52e17; border: 1px solid #b83d22; }\r\n.cancellation-submit[_ngcontent-%COMP%] { background: #ae3619; color: white; border: 1px solid #ae3619; }\r\n\r\n.administrative-delays[_ngcontent-%COMP%] { margin-bottom: 1.5rem; h2 { font-size: 1.1rem; margin-bottom: 1rem; } }\r\n.administrative-delay[_ngcontent-%COMP%] { padding: 1.2rem; margin-bottom: 1rem; border: 1px solid #e5c4a7; border-left: 4px solid #b96222; border-radius: 10px; background: #fffaf5; h3 { font-size: 1rem; margin: 0 0 .6rem; } p { line-height: 1.6; margin-bottom: 1rem; } }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MisReservasComponent, [{
        type: Component,
        args: [{ selector: 'app-mis-reservas', standalone: true, imports: [
                    RouterLink, SpinnerComponent, FormsModule, ClaimHistoryComponent, ConversationComposerComponent, CargaImagenesComponent, NgTemplateOutlet, DatePipe,
                    LucideCalendar, LucideCalendarX, LucideInfo, LucideChevronRight, LucideEllipsis, LucideExternalLink,
                    LucideImage, LucideLockKeyhole, LucideTriangleAlert, LucideX,
                ], template: "<section class=\"acct-page\">\r\n  <div class=\"acct-wrap\">\r\n    <div class=\"acct-heading\">\r\n      <div>\r\n        <h1>Mis reservas</h1>\r\n        @if (esAnunciante()) {\r\n          <p>Gestion\u00E1 las estad\u00EDas que reservaste y las que recibiste en tus propiedades.</p>\r\n        } @else {\r\n          <p>Gestion\u00E1 las estad\u00EDas que reservaste.</p>\r\n        }\r\n      </div>\r\n    </div>\r\n\r\n    @if (errorDemorasAdministrativas()) { <p class=\"cancellation-error\" role=\"alert\">{{ errorDemorasAdministrativas() }}</p> }\r\n    @if (demorasAdministrativas().length) {\r\n      <section class=\"administrative-delays\" aria-labelledby=\"administrative-delays-title\">\r\n        <h2 id=\"administrative-delays-title\">Solicitudes sin respuesta antes del ingreso</h2>\r\n        @for (item of demorasAdministrativas(); track item.solicitudId) {\r\n          <article class=\"administrative-delay\">\r\n            <h3>Reserva #{{ item.reservaId }} \u00B7 {{ item.titulo }}</h3>\r\n            <p>Tu solicitud de cancelaci\u00F3n no fue respondida antes de la fecha de ingreso y se considera rechazada. La reserva sigue en curso.</p>\r\n            @if (item.reclamoAbierto) {\r\n              <p>Ya hay un reclamo abierto para esta reserva.</p>\r\n              <button type=\"button\" class=\"booking-button\" (click)=\"vista.set('reclamos')\">Ver reclamos</button>\r\n            } @else {\r\n              <button type=\"button\" class=\"booking-button booking-button--primary\" (click)=\"abrirDemora(item)\">Reclamar por demora administrativa</button>\r\n            }\r\n          </article>\r\n        }\r\n      </section>\r\n    }\r\n    <dialog #dialogoDemora class=\"cancellation-dialog\" aria-labelledby=\"administrative-delay-title\" (cancel)=\"cerrarDemora($event)\">\r\n      <h2 id=\"administrative-delay-title\">Reclamar por demora administrativa</h2>\r\n      @if (demoraSeleccionada(); as item) {\r\n        <p>Reserva #{{ item.reservaId }} \u00B7 {{ item.titulo }}</p>\r\n        <p>Contanos qu\u00E9 inconvenientes te gener\u00F3 la falta de respuesta a tu solicitud. Administraci\u00F3n revisar\u00E1 el caso. Enviar el reclamo no cancela la reserva ni genera autom\u00E1ticamente un reembolso.</p>\r\n        <form (ngSubmit)=\"enviarDemora()\" [attr.aria-busy]=\"enviandoDemora()\">\r\n          <label for=\"descripcion-demora\">Descripci\u00F3n de los inconvenientes</label>\r\n          <textarea id=\"descripcion-demora\" name=\"descripcionDemora\" [(ngModel)]=\"descripcionDemora\" rows=\"5\" required minlength=\"20\" maxlength=\"1000\" [disabled]=\"enviandoDemora()\" autofocus></textarea>\r\n          <small>Entre 20 y 1000 caracteres. Podr\u00E1s adjuntar evidencias y seguir el caso desde Reclamos.</small>\r\n          @if (errorDemora()) { <p class=\"cancellation-error\" role=\"alert\">{{ errorDemora() }}</p> }\r\n          <div class=\"cancellation-actions\">\r\n            <button type=\"button\" class=\"booking-button\" [disabled]=\"enviandoDemora()\" (click)=\"cerrarDemora()\">Volver</button>\r\n            <button type=\"submit\" class=\"booking-button booking-button--primary\" [disabled]=\"enviandoDemora() || descripcionDemora.trim().length < 20\">{{ enviandoDemora() ? 'Enviando\u2026' : 'Enviar reclamo' }}</button>\r\n          </div>\r\n        </form>\r\n      }\r\n    </dialog>\r\n\r\n    <dialog #dialogoCancelacion class=\"cancellation-dialog\" aria-labelledby=\"cancel-title\"\r\n      (cancel)=\"cerrarCancelacion($event)\" (close)=\"limpiarCancelacion()\">\r\n      <button type=\"button\" class=\"cancellation-close\" aria-label=\"Cerrar\" autofocus\r\n        [disabled]=\"enviandoCancelacion()\" (click)=\"cerrarCancelacion()\">\r\n        <svg lucideX [size]=\"22\" aria-hidden=\"true\"></svg>\r\n      </button>\r\n      <div class=\"cancellation-icon\"><svg lucideCalendarX [size]=\"34\" aria-hidden=\"true\"></svg></div>\r\n      <h2 id=\"cancel-title\">Cancelar reserva</h2>\r\n      @if (reservaACancelar(); as reserva) {\r\n        <div class=\"cancellation-reservation\">\r\n          @let portada = reserva.publicacion?.imagenes?.[0]?.url;\r\n          @if (portada && imagenesConError()[reserva.id] !== portada) {\r\n            <img [src]=\"portada\" alt=\"\" (error)=\"registrarErrorImagen(reserva.id, portada)\" />\r\n          } @else {\r\n            <div class=\"cancellation-placeholder\"><svg lucideImage [size]=\"28\" aria-hidden=\"true\"></svg></div>\r\n          }\r\n          <div>\r\n            <strong>{{ reserva.publicacion?.titulo || 'Publicaci\u00F3n no disponible' }}</strong>\r\n            <p>Reserva #{{ reserva.id }} \u00B7 {{ fechasCancelacion(reserva) }}</p>\r\n          </div>\r\n        </div>\r\n        <form (ngSubmit)=\"enviarCancelacion()\" [attr.aria-busy]=\"enviandoCancelacion()\">\r\n          @let bloqueo = condicionesCancelacion()?.motivoBloqueo;\r\n          @if (condicionesCancelacion()?.devolucion; as devolucion) {\r\n            <div class=\"cancellation-refund\" [class.cancellation-refund--warning]=\"devolucion.porcentaje === 0\" role=\"status\">\r\n              <strong>Importe de devoluci\u00F3n{{ cancelacionComoAnunciante() ? ' al inquilino' : '' }}: {{ devolucion.moneda }} {{ monto(devolucion.importe, devolucion.moneda) }} ({{ devolucion.porcentaje }} %)</strong>\r\n              <p>Calculada con la fecha de {{ condicionesCancelacion()?.solicitud ? 'tu solicitud' : 'hoy' }}:\r\n                {{ devolucion.fechaSolicitud | date:'dd/MM/yyyy':'UTC' }}.\r\n                @if (devolucion.diasAnticipacion > 0) {\r\n                  {{ devolucion.diasAnticipacion }} {{ devolucion.diasAnticipacion === 1 ? 'd\u00EDa' : 'd\u00EDas' }} antes del ingreso.\r\n                } @else if (devolucion.diasAnticipacion === 0) {\r\n                  La fecha de ingreso es hoy.\r\n                } @else {\r\n                  La fecha de ingreso ya pas\u00F3.\r\n                }\r\n              </p>\r\n            </div>\r\n          }\r\n          @if (condicionesCancelacion()?.advertencia; as advertencia) {\r\n            <div class=\"cancellation-warning\" role=\"status\">\r\n              <svg lucideTriangleAlert [size]=\"22\" aria-hidden=\"true\"></svg>\r\n              <p>{{ advertencia }}</p>\r\n            </div>\r\n          }\r\n          @if (estadoCancelacion() === 'formulario') {\r\n            @if (bloqueo) {\r\n              <p class=\"cancellation-error\" role=\"status\">{{ bloqueo }}</p>\r\n            }\r\n            <label for=\"motivo-cancelacion\">Motivo de la cancelaci\u00F3n <span aria-hidden=\"true\">*</span></label>\r\n            <textarea id=\"motivo-cancelacion\" name=\"motivoCancelacion\" rows=\"4\" required minlength=\"10\" maxlength=\"500\"\r\n              aria-describedby=\"motivo-cancelacion-ayuda\"\r\n              placeholder=\"Contanos por qu\u00E9 necesit\u00E1s cancelar.\"\r\n              [ngModel]=\"motivoCancelacion()\" (ngModelChange)=\"motivoCancelacion.set($event)\"\r\n              [disabled]=\"enviandoCancelacion() || !!bloqueo\"></textarea>\r\n            <small id=\"motivo-cancelacion-ayuda\">Entre 10 y 500 caracteres.</small>\r\n            <div class=\"cancellation-info\">\r\n              <svg lucideInfo [size]=\"22\" aria-hidden=\"true\"></svg>\r\n              <p>La cancelaci\u00F3n se aprueba autom\u00E1ticamente. Si corresponde una devoluci\u00F3n, la reserva se cancela cuando se confirma.</p>\r\n              @if (condicionesCancelacion()?.simulacionTarjetaHabilitada && (condicionesCancelacion()?.devolucion?.importe ?? 0) > 0) {\r\n                <p>Si el pago fue con tarjeta, la devoluci\u00F3n ser\u00E1 simulada y no se transferir\u00E1 dinero.</p>\r\n              }\r\n            </div>\r\n          } @else if (estadoCancelacion() === 'pendiente') {\r\n            <div class=\"cancellation-info\" role=\"status\">\r\n              <svg lucideInfo [size]=\"22\" aria-hidden=\"true\"></svg>\r\n              <p>Hay una solicitud de cancelaci\u00F3n para esta reserva. Est\u00E1 en revisi\u00F3n.</p>\r\n            </div>\r\n          } @else if (estadoCancelacion() === 'aprobada') {\r\n            <div class=\"cancellation-info\" role=\"status\">\r\n              <svg lucideInfo [size]=\"22\" aria-hidden=\"true\"></svg>\r\n              <p>{{ reserva.cancelada ? 'La reserva qued\u00F3 cancelada.' : 'La cancelaci\u00F3n fue aceptada. La devoluci\u00F3n est\u00E1 en gesti\u00F3n.' }}</p>\r\n            </div>\r\n          } @else if (estadoCancelacion() === 'consultando') {\r\n            <p role=\"status\">Consultando el estado de la solicitud\u2026</p>\r\n          }\r\n          @if (condicionesCancelacion()?.politica; as politica) {\r\n            <details class=\"cancellation-terms\">\r\n              <summary>T\u00E9rminos y condiciones de cancelaci\u00F3n</summary>\r\n              <ul>\r\n                <li>Como inquilino pod\u00E9s solicitar la cancelaci\u00F3n en cualquier momento antes de la fecha de ingreso, incluso el d\u00EDa anterior. Si faltan menos de {{ politica.diasDevolucionParcial }} d\u00EDas, no hay devoluci\u00F3n. Desde la fecha de ingreso no se permite cancelar; pod\u00E9s abrir un reclamo. Se cuentan d\u00EDas calendario de Argentina.</li>\r\n                <li>Las devoluciones con dinero en cuenta se gestionan por Mercado Pago.</li>\r\n                <li>Si solicita el inquilino, se devuelve el {{ politica.porcentajeTotal }} % del importe pagado cuando faltan {{ politica.diasDevolucionTotal }} d\u00EDas o m\u00E1s al enviar la solicitud.</li>\r\n                <li>Si al solicitar faltan al menos {{ politica.diasDevolucionParcial }} d\u00EDas y menos de {{ politica.diasDevolucionTotal }}, se devuelve el {{ politica.porcentajeParcial }} %. Si faltan menos de {{ politica.diasDevolucionParcial }} d\u00EDas, corresponde el {{ politica.porcentajeFueraDePlazo }} %.</li>\r\n                <li>El anunciante puede solicitar la cancelaci\u00F3n hasta el d\u00EDa anterior al ingreso, inclusive, con devoluci\u00F3n del 100 % al inquilino.</li>\r\n              </ul>\r\n            </details>\r\n            @if (estadoCancelacion() === 'formulario') {\r\n              <label class=\"cancellation-accept\">\r\n                <input type=\"checkbox\" name=\"aceptaTerminosCancelacion\" required\r\n                  [ngModel]=\"aceptaTerminosCancelacion()\" (ngModelChange)=\"aceptaTerminosCancelacion.set($event)\"\r\n                  [disabled]=\"enviandoCancelacion() || !!bloqueo\" />\r\n                {{ condicionesCancelacion()?.advertencia ? 'Acepto los t\u00E9rminos y entiendo que no recibir\u00E9 una devoluci\u00F3n' : 'Acepto los t\u00E9rminos y el importe de devoluci\u00F3n indicado' }}\r\n              </label>\r\n            }\r\n          }\r\n          @if (errorCancelacion()) { <p class=\"cancellation-error\" role=\"alert\">{{ errorCancelacion() }}</p> }\r\n          <div class=\"cancellation-actions\">\r\n            <button type=\"button\" class=\"acct-btn cancellation-back\" [disabled]=\"enviandoCancelacion()\" (click)=\"cerrarCancelacion()\">Volver</button>\r\n            @if (estadoCancelacion() === 'formulario') {\r\n              <button type=\"submit\" class=\"acct-btn cancellation-submit\" [disabled]=\"enviandoCancelacion() || !!bloqueo || !aceptaTerminosCancelacion() || motivoCancelacion().trim().length < 10\">\r\n                {{ enviandoCancelacion() ? 'Procesando\u2026' : 'Confirmar cancelaci\u00F3n' }}\r\n              </button>\r\n            } @else if (estadoCancelacion() === 'error') {\r\n              <button type=\"button\" class=\"acct-btn cancellation-submit\" (click)=\"consultarCancelacion()\">Reintentar</button>\r\n            }\r\n          </div>\r\n        </form>\r\n      }\r\n    </dialog>\r\n\r\n    <dialog #dialogoFaltante class=\"cancellation-dialog\" aria-labelledby=\"faltante-titulo\" (cancel)=\"cerrarFaltante($event)\">\r\n      <h2 id=\"faltante-titulo\">Reclamar reembolso faltante</h2>\r\n      <p>Reserva #{{ reservaFaltante()?.id }}. Revis\u00E1 cu\u00E1nto corresponde por la cancelaci\u00F3n y cu\u00E1nto ya se devolvi\u00F3.</p>\r\n      @if (cargandoFaltante()) { <p role=\"status\">Consultando la devoluci\u00F3n\u2026</p> }\r\n      @if (saldoFaltante(); as saldo) {\r\n        @if (saldo.devolucion; as devolucion) {\r\n          <div class=\"cancellation-refund\">\r\n            <p>Correspond\u00EDa devolver ({{ devolucion.porcentaje }} %): <strong>{{ devolucion.moneda }} {{ monto(devolucion.esperado, devolucion.moneda) }}</strong></p>\r\n            <p>Ya devuelto: {{ devolucion.moneda }} {{ monto(devolucion.devuelto, devolucion.moneda) }}</p>\r\n            <p>En gesti\u00F3n: {{ devolucion.moneda }} {{ monto(devolucion.enGestion, devolucion.moneda) }}</p>\r\n            <p>Falta recibir: {{ devolucion.moneda }} {{ monto(devolucion.faltante, devolucion.moneda) }}</p>\r\n            <p><strong>Disponible para reclamar: {{ devolucion.moneda }} {{ monto(devolucion.importeReclamable, devolucion.moneda) }}</strong></p>\r\n          </div>\r\n          @if (saldo.reclamoAbierto) {\r\n            <p role=\"status\">Ya ten\u00E9s un reclamo abierto para esta reserva. Pod\u00E9s seguirlo en la pesta\u00F1a Reclamos.</p>\r\n          } @else if (devolucion.importeReclamable > 0) {\r\n            <form class=\"claim-form\" (ngSubmit)=\"enviarFaltante()\" [attr.aria-busy]=\"enviandoFaltante()\">\r\n              <label for=\"faltante-descripcion\">Contanos qu\u00E9 falta recibir</label>\r\n              <textarea id=\"faltante-descripcion\" name=\"descripcionFaltante\" [(ngModel)]=\"descripcionFaltante\" rows=\"4\" required\r\n                minlength=\"20\" maxlength=\"1000\" [disabled]=\"enviandoFaltante()\" aria-describedby=\"faltante-ayuda\"></textarea>\r\n              <small id=\"faltante-ayuda\">Entre 20 y 1000 caracteres. Administraci\u00F3n revisar\u00E1 el reclamo antes de devolver la diferencia.</small>\r\n              <button type=\"submit\" class=\"acct-btn acct-btn--primary\" [disabled]=\"enviandoFaltante() || descripcionFaltante.trim().length < 20\">{{ enviandoFaltante() ? 'Enviando\u2026' : 'Enviar reclamo por el faltante' }}</button>\r\n            </form>\r\n          } @else if (devolucion.faltante > 0) {\r\n            <p role=\"status\">La diferencia ya est\u00E1 en gesti\u00F3n. Pod\u00E9s seguir la devoluci\u00F3n desde el detalle de la reserva.</p>\r\n          } @else {\r\n            <p role=\"status\">No falta dinero seg\u00FAn la pol\u00EDtica de cancelaci\u00F3n. La parte retenida no constituye un faltante.</p>\r\n          }\r\n        } @else { <p>No hay una cancelaci\u00F3n aprobada con devoluci\u00F3n para esta reserva.</p> }\r\n      }\r\n      @if (errorFaltante()) { <p class=\"cancellation-error\" role=\"alert\">{{ errorFaltante() }}</p> }\r\n      <button type=\"button\" class=\"acct-btn acct-btn--ghost\" [disabled]=\"enviandoFaltante()\" (click)=\"cerrarFaltante()\">Volver</button>\r\n    </dialog>\r\n\r\n    @if (mensaje()) { <div class=\"acct-alert acct-alert--info\" role=\"status\">{{ mensaje() }}</div> }\r\n    @if (error()) { <div class=\"acct-alert acct-alert--error\" role=\"alert\">{{ error() }}</div> }\r\n    @if (cargando()) {\r\n      <div class=\"acct-state\"><app-spinner /><p>Cargando reservas\u2026</p></div>\r\n    } @else {\r\n      <div class=\"reservation-tabs\" role=\"tablist\" aria-label=\"Tipo de reservas\">\r\n        <button type=\"button\" role=\"tab\" [attr.aria-selected]=\"vista() === 'realizadas'\" [class.is-active]=\"vista() === 'realizadas'\" (click)=\"vista.set('realizadas')\">\r\n          Reservas realizadas <span>{{ propias().length }}</span>\r\n        </button>\r\n        @if (esAnunciante()) {\r\n          <button type=\"button\" role=\"tab\" [attr.aria-selected]=\"vista() === 'recibidas'\" [class.is-active]=\"vista() === 'recibidas'\" (click)=\"vista.set('recibidas')\">\r\n            Reservas recibidas <span>{{ recibidas().length }}</span>\r\n          </button>\r\n        }\r\n        <button type=\"button\" role=\"tab\" [attr.aria-selected]=\"vista() === 'reclamos'\" [class.is-active]=\"vista() === 'reclamos'\" (click)=\"vista.set('reclamos')\">\r\n          Reclamos <span>{{ reclamos().length }}</span>\r\n        </button>\r\n      </div>\r\n\r\n      @if (vista() === 'realizadas') {\r\n        <section class=\"reservation-section\" role=\"tabpanel\">\r\n          @for (reserva of propias(); track reserva.id) {\r\n            <article class=\"acct-card booking-card\">\r\n              <ng-container *ngTemplateOutlet=\"tarjetaReserva; context: { $implicit: reserva, recibida: false }\" />\r\n              @if (reclamoAbierto()?.id === reserva.id) {\r\n                <ng-container *ngTemplateOutlet=\"formularioReclamo; context: { $implicit: reserva }\" />\r\n              }\r\n            </article>\r\n          } @empty {\r\n            <div class=\"acct-card empty\">Todav\u00EDa no realizaste reservas.</div>\r\n          }\r\n        </section>\r\n      } @else if (vista() === 'recibidas' && esAnunciante()) {\r\n        <section class=\"reservation-section\" role=\"tabpanel\">\r\n          <div class=\"reservation-filters\">\r\n            <label>Estado\r\n              <select [ngModel]=\"filtroEstadoRecibidas()\" (ngModelChange)=\"cambiarFiltroRecibidas('estado', $event)\">\r\n                <option value=\"todos\">Todos</option>\r\n                <option value=\"codigo\">Ingreso pendiente</option>\r\n                <option value=\"liquidacion\">Liquidaci\u00F3n pendiente o en revisi\u00F3n</option>\r\n                <option value=\"confirmada\">Confirmadas</option>\r\n                <option value=\"terminada\">Terminadas</option>\r\n                <option value=\"historial\">Canceladas y otras</option>\r\n              </select>\r\n            </label>\r\n            <label>Publicaci\u00F3n\r\n              <input type=\"search\" placeholder=\"Buscar publicaci\u00F3n\" [ngModel]=\"filtroPublicacionRecibidas()\" (ngModelChange)=\"cambiarFiltroRecibidas('publicacion', $event)\" />\r\n            </label>\r\n            <label>Ingreso desde <input type=\"date\" [ngModel]=\"filtroDesdeRecibidas()\" (ngModelChange)=\"cambiarFiltroRecibidas('desde', $event)\" /></label>\r\n            <label>Ingreso hasta <input type=\"date\" [ngModel]=\"filtroHastaRecibidas()\" (ngModelChange)=\"cambiarFiltroRecibidas('hasta', $event)\" /></label>\r\n          </div>\r\n          @for (reserva of recibidasPagina(); track reserva.id) {\r\n            <article class=\"acct-card booking-card\">\r\n              <ng-container *ngTemplateOutlet=\"tarjetaReserva; context: { $implicit: reserva, recibida: true }\" />\r\n              @if (reclamoAbierto()?.id === reserva.id) {\r\n                <ng-container *ngTemplateOutlet=\"formularioReclamo; context: { $implicit: reserva }\" />\r\n              }\r\n            </article>\r\n          } @empty {\r\n            <div class=\"acct-card empty\">{{ recibidas().length ? 'No hay reservas que coincidan con los filtros.' : 'No recibiste reservas todav\u00EDa.' }}</div>\r\n          }\r\n          @if (paginasRecibidas() > 1) {\r\n            <nav class=\"reservation-pagination\" aria-label=\"Paginaci\u00F3n de reservas recibidas\">\r\n              <span role=\"status\">{{ recibidasFiltradas().length }} reservas \u00B7 P\u00E1gina {{ paginaRecibidas() }} de {{ paginasRecibidas() }}</span>\r\n              <div>\r\n                <button type=\"button\" class=\"booking-button\" [disabled]=\"paginaRecibidas() <= 1\" (click)=\"paginaRecibidas.set(paginaRecibidas() - 1)\">Anterior</button>\r\n                <button type=\"button\" class=\"booking-button\" [disabled]=\"paginaRecibidas() >= paginasRecibidas()\" (click)=\"paginaRecibidas.set(paginaRecibidas() + 1)\">Siguiente</button>\r\n              </div>\r\n            </nav>\r\n          }\r\n        </section>\r\n      } @else {\r\n        <section class=\"reservation-section\" role=\"tabpanel\">\r\n          <div class=\"section-heading\">\r\n            <h2>Reclamos</h2>\r\n            <p>Seguimiento de los reclamos en los que particip\u00E1s como Inquilino o Anunciante.</p>\r\n          </div>\r\n          @if (errorHistorial()) { <p class=\"claim-error\" role=\"alert\">{{ errorHistorial() }}</p> }\r\n          @if (errorAccionReclamo()) { <p class=\"claim-error\" role=\"alert\">{{ errorAccionReclamo() }}</p> }\r\n          <!-- Los reclamos como inquilino y como anunciante van separados; sin subpesta\u00F1as si no es anunciante. -->\r\n          @if (separarReclamos()) {\r\n            <div class=\"reservation-tabs reservation-tabs--sub\" role=\"tablist\" aria-label=\"Rol en los reclamos\">\r\n              <button type=\"button\" role=\"tab\" [attr.aria-selected]=\"vistaReclamos() === 'inquilino'\" [class.is-active]=\"vistaReclamos() === 'inquilino'\" (click)=\"vistaReclamos.set('inquilino')\">\r\n                Como inquilino <span>{{ reclamosComoInquilino().length }}</span>\r\n              </button>\r\n              <button type=\"button\" role=\"tab\" [attr.aria-selected]=\"vistaReclamos() === 'anunciante'\" [class.is-active]=\"vistaReclamos() === 'anunciante'\" (click)=\"vistaReclamos.set('anunciante')\">\r\n                Como anunciante <span>{{ reclamosComoAnunciante().length }}</span>\r\n              </button>\r\n            </div>\r\n          }\r\n          @for (reclamo of reclamosVisibles(); track reclamo.id) {\r\n            <article class=\"acct-card reservation claim-card\">\r\n              <app-claim-history [reclamo]=\"reclamo\" [mostrarVerReembolso]=\"esInquilinoDelReclamo(reclamo)\"\r\n                (verReembolso)=\"verReembolsoReclamo(reclamo)\">\r\n                @if (reclamo.estado !== 'CERRADO') {\r\n                  @if (respuestaReclamo() === reclamo.id) {\r\n                    <app-conversation-composer [(texto)]=\"textoRespuesta\" [(imagenes)]=\"imagenesRespuesta\" [adjuntos]=\"imagenesDisponibles(reclamo)\"\r\n                      etiqueta=\"Mensaje para el reclamo\" [deshabilitado]=\"enviandoRespuesta()\" (enviar)=\"responderReclamo(reclamo)\" />\r\n                    <button type=\"button\" class=\"acct-btn acct-btn--ghost acct-btn--sm\" (click)=\"respuestaReclamo.set(null)\"\r\n                      [disabled]=\"enviandoRespuesta()\">Cancelar</button>\r\n                  } @else {\r\n                    <button type=\"button\" class=\"acct-btn acct-btn--ghost acct-btn--sm\" (click)=\"abrirRespuestaReclamo(reclamo.id)\"\r\n                      [disabled]=\"enviandoRespuesta()\">Escribir un mensaje</button>\r\n                  }\r\n                }\r\n              </app-claim-history>\r\n            </article>\r\n          } @empty {\r\n            @if (!errorHistorial()) {\r\n              <div class=\"acct-card empty\">{{ separarReclamos() ? 'No ten\u00E9s reclamos como ' + vistaReclamos() + '.' : 'No ten\u00E9s reclamos registrados.' }}</div>\r\n            }\r\n          }\r\n        </section>\r\n      }\r\n    }\r\n  </div>\r\n</section>\r\n\r\n\r\n<ng-template #tarjetaReserva let-reserva let-recibida=\"recibida\">\r\n  @let devolucionPendiente = !recibida && actividadReembolsos.pendientes().has(reserva.id);\r\n  @let portada = reserva.publicacion?.imagenes?.[0]?.url;\r\n  @let puedeReportar = !recibida && !reserva.cancelada && reserva.estado_pago === 'APROBADO'\r\n    && reserva.estado_liquidacion !== 'PAGADO_PROPIETARIO' && reserva.estado_liquidacion !== 'DEVUELTO_INQUILINO'\r\n    && reserva.estado_liquidacion !== 'DEVUELTO_PARCIAL_INQUILINO';\r\n  @let cancelarDirecto = !recibida && !reserva.cancelada && !reserva.finalizada && reserva.estado_pago === 'PENDIENTE';\r\n  @let cambiarFechas = !recibida && !devolucionPendiente && puedeReprogramar(reserva);\r\n  @let solicitarBaja = puedeSolicitarCancelacion(reserva, recibida);\r\n  @let menuId = 'acciones-reserva-' + reserva.id;\r\n  <div class=\"booking-card__cover\">\r\n    @if (portada && imagenesConError()[reserva.id] !== portada) {\r\n      <img [src]=\"portada\" alt=\"\" loading=\"lazy\" decoding=\"async\" (error)=\"registrarErrorImagen(reserva.id, portada)\" />\r\n    } @else {\r\n      <svg lucideImage [size]=\"32\" aria-hidden=\"true\"></svg>\r\n    }\r\n  </div>\r\n  <div class=\"booking-card__main\">\r\n    <div class=\"booking-card__overview\">\r\n      <div class=\"booking-card__info\">\r\n        <div class=\"booking-card__heading\">\r\n          <h2>{{ reserva.publicacion?.titulo || 'Publicaci\u00F3n no disponible' }}</h2>\r\n          <span class=\"acct-badge\" [class.acct-badge--error]=\"!devolucionPendiente && (reserva.cancelada || reserva.estado_estadia === 'INGRESO_NO_VERIFICADO')\" [class.acct-badge--ok]=\"!devolucionPendiente && estadiaActiva(reserva)\">{{ devolucionPendiente ? 'Devoluci\u00F3n pendiente' : estado(reserva) }}</span>\r\n        </div>\r\n        <dl class=\"booking-card__dates\">\r\n          <div><dt>Ingreso</dt><dd>{{ fechaTarjeta(reserva.fecha_inicio) }}</dd></div>\r\n          <div><dt>Salida</dt><dd>{{ fechaTarjeta(reserva.fecha_fin) }}</dd></div>\r\n        </dl>\r\n        @if (devolucionPendiente) {\r\n          <p class=\"booking-card__settlement\">Tu devoluci\u00F3n est\u00E1 en gesti\u00F3n. Pod\u00E9s seguirla desde el detalle.</p>\r\n        } @else if ((!recibida || reserva.estado_liquidacion !== 'PAGADO_PROPIETARIO') && devolucionRegistrada(reserva); as devolucion) {\r\n          <!-- Ya pagado el resto, al anunciante le sirve m\u00E1s ver su pago que la devoluci\u00F3n. -->\r\n          <p class=\"booking-card__settlement\">{{ devolucion.mensaje }}</p>\r\n        } @else if (recibida && reserva.estado_pago === 'APROBADO') {\r\n          <p class=\"booking-card__settlement\">\r\n            @if (reserva.estado_liquidacion === 'RETENIDO') { <svg lucideLockKeyhole [size]=\"15\" aria-hidden=\"true\"></svg> }\r\n            {{ estadoLiquidacion(reserva) }}\r\n          </p>\r\n          @if (reserva.estado_liquidacion === 'PENDIENTE_PAGO_PROPIETARIO') {\r\n            @if (fechaHabilitacion(reserva); as fechaPago) {\r\n              <p class=\"booking-card__settlement\">{{ fechaPago > hoy() ? 'Pago disponible desde el ' : 'Pago habilitado desde el ' }}{{ fechaTarjeta(fechaPago) }}.</p>\r\n            } @else {\r\n              <p class=\"booking-card__settlement\">Fecha de pago pendiente de revisi\u00F3n.</p>\r\n            }\r\n          }\r\n          @if (reserva.estado_estadia === 'INGRESO_NO_VERIFICADO' && reserva.estado_liquidacion === 'RETENIDO') {\r\n            @let dias = diasHastaVencimiento(reserva);\r\n            @if (dias !== null && dias > 0) {\r\n              <p class=\"booking-card__settlement\">En {{ dias }} {{ dias === 1 ? 'd\u00EDa' : 'd\u00EDas' }} la liquidaci\u00F3n quedar\u00E1 pendiente de pago a tu favor.</p>\r\n            } @else if (dias === 0) {\r\n              <p class=\"booking-card__settlement\">El plazo venci\u00F3. La liquidaci\u00F3n est\u00E1 pendiente de procesamiento a tu favor.</p>\r\n            }\r\n          }\r\n          @if (reserva.estado_liquidacion === 'PAGADO_PROPIETARIO') {\r\n            @if (reserva.fecha_resolucion_liquidacion) {\r\n              <p class=\"booking-card__settlement\">Pago registrado el {{ fechaTarjeta(reserva.fecha_resolucion_liquidacion) }}.</p>\r\n            }\r\n            @if (reserva.referencia_liquidacion) {\r\n              <p class=\"booking-card__settlement\">Referencia de pago: {{ reserva.referencia_liquidacion }}</p>\r\n            }\r\n          }\r\n        }\r\n      </div>\r\n      <div class=\"booking-card__total\">\r\n        <span>Total de la reserva</span>\r\n        <strong>{{ monto(reserva.importe_contratado ?? reserva.monto_pago, reserva.moneda_contratada) }}</strong>\r\n      </div>\r\n    </div>\r\n    <div class=\"booking-card__footer\">\r\n      @if (reserva.cotizacion_dolar; as dolar) {\r\n        <details class=\"booking-quote\">\r\n          <summary>Ver cotizaci\u00F3n <svg lucideChevronRight [size]=\"15\" aria-hidden=\"true\"></svg></summary>\r\n          <p>Publicado en {{ monto(reserva.importe_origen ?? 0, reserva.moneda_origen) }}. D\u00F3lar blue venta a {{ monto(+dolar.venta, 'ARS', 6) }} por USD \u00B7 Cotizaci\u00F3n #{{ dolar.id }}.</p>\r\n        </details>\r\n      }\r\n      <div class=\"booking-card__actions\">\r\n        @if (!recibida && !devolucionPendiente && puedeConsultarCodigo(reserva)) {\r\n          <button type=\"button\" class=\"booking-button\" [disabled]=\"ocupada() !== null\" (click)=\"verCodigo(reserva)\">{{ codigos()[reserva.id] ? 'Volver a mostrar c\u00F3digo' : 'Ver c\u00F3digo de ingreso' }}</button>\r\n        }\r\n        <a class=\"booking-button booking-button--primary\" routerLink=\"/reserva/resultado\" [queryParams]=\"detalleReserva(reserva)\">{{ recibida ? 'Ver detalle y contactar' : 'Ver detalle' }}</a>\r\n        @if (!recibida && (reserva.cancelada || devolucionPendiente)) {\r\n          <button type=\"button\" class=\"booking-button\" (click)=\"abrirFaltante(reserva)\">Reclamar reembolso faltante</button>\r\n        }\r\n        @if (reserva.publicacion || cambiarFechas || puedeReportar || solicitarBaja || cancelarDirecto) {\r\n          <button type=\"button\" class=\"booking-button booking-button--more\" #accionesReserva [attr.popovertarget]=\"menuId\" [attr.aria-label]=\"'M\u00E1s acciones para la reserva ' + reserva.id\">\r\n            <svg lucideEllipsis [size]=\"19\" aria-hidden=\"true\"></svg>\r\n          </button>\r\n          <div class=\"booking-menu\" [id]=\"menuId\" popover #menu>\r\n            @if (reserva.publicacion) {\r\n              @if (!accesoLimitado()) {\r\n                <a [routerLink]=\"['/publicaciones', reserva.publicacion.id]\" (click)=\"menu.hidePopover()\"><svg lucideExternalLink [size]=\"16\" aria-hidden=\"true\"></svg>Ver publicaci\u00F3n</a>\r\n              }\r\n            }\r\n            @if (cambiarFechas) {\r\n              <a routerLink=\"/reserva/resultado\" [queryParams]=\"{ reserva_id: reserva.id, reprogramar: 1 }\" (click)=\"menu.hidePopover()\"><svg lucideCalendar [size]=\"16\" aria-hidden=\"true\"></svg>Cambiar fechas</a>\r\n            }\r\n            @if (puedeReportar) {\r\n              @if (motivoReclamoNoDisponible(reserva); as motivo) {\r\n                <p class=\"booking-menu__hint\"><svg lucideTriangleAlert [size]=\"16\" aria-hidden=\"true\"></svg>{{ motivo }}</p>\r\n              } @else {\r\n                <button type=\"button\" [disabled]=\"reclamoEnviando()\" (click)=\"menu.hidePopover(); abrirReclamo(reserva)\"><svg lucideTriangleAlert [size]=\"16\" aria-hidden=\"true\"></svg>Reportar un problema</button>\r\n              }\r\n            }\r\n            @if (solicitarBaja || cancelarDirecto) {\r\n              <button type=\"button\" class=\"booking-menu__danger\" [disabled]=\"ocupada() !== null\" (click)=\"menu.hidePopover(); solicitarBaja ? solicitarCancelacion(reserva, accionesReserva, recibida) : cancelar(reserva)\"><svg lucideX [size]=\"16\" aria-hidden=\"true\"></svg>{{ solicitarBaja ? 'Solicitar cancelaci\u00F3n' : 'Cancelar reserva' }}</button>\r\n            }\r\n          </div>\r\n        }\r\n      </div>\r\n    </div>\r\n  </div>\r\n  @if (reserva.estado_estadia === 'PENDIENTE_INGRESO' || reserva.estado_estadia === 'INGRESO_NO_VERIFICADO' || ultimoCambio(reserva) || avisosPendientes(reserva).length || recibida || (puedeConsultarCodigo(reserva) && codigos()[reserva.id])) {\r\n    <div class=\"booking-card__extras\">\r\n      @if (recibida) {\r\n        <p><strong>{{ inquilino(reserva) }}</strong> \u00B7 Contacto por el chat de DEPA</p>\r\n      }\r\n      <!-- Al anunciante solo se le pide el c\u00F3digo mientras lo pueda cargar (sin bloqueo ni decisi\u00F3n sobre el pago). -->\r\n      @if (reserva.estado_estadia === 'PENDIENTE_INGRESO' && (!recibida || puedeValidarCodigo(reserva))) {\r\n        <p class=\"muted\">{{ recibida ? 'Valid\u00E1 el c\u00F3digo que te entregue el hu\u00E9sped al ingresar.' : 'El propietario todav\u00EDa no valid\u00F3 el c\u00F3digo de alojamiento.' }}</p>\r\n      }\r\n      @if (reserva.estado_estadia === 'INGRESO_NO_VERIFICADO') {\r\n        <p class=\"muted\">La estad\u00EDa termin\u00F3 sin un c\u00F3digo de ingreso validado.\r\n          @if (!recibida && reserva.fin_plazo_reclamo && hoy() <= reserva.fin_plazo_reclamo) { Si tuviste un problema con el ingreso, pod\u00E9s reportarlo hasta el {{ fecha(reserva.fin_plazo_reclamo) }} desde \u00ABReportar un problema\u00BB. }\r\n        </p>\r\n      }\r\n      @if (ultimoCambio(reserva); as cambio) {\r\n        <div class=\"reschedule-history\">\r\n          <strong>\u00DAltimo cambio de fechas</strong>\r\n          <span>Antes: {{ fecha(cambio.fecha_inicio_anterior) }} - {{ fecha(cambio.fecha_fin_anterior) }}</span>\r\n          <span>Ahora: {{ fecha(cambio.fecha_inicio_nueva) }} - {{ fecha(cambio.fecha_fin_nueva) }}</span>\r\n        </div>\r\n      }\r\n      @for (cambio of avisosPendientes(reserva); track cambio.id) {\r\n        <div class=\"reschedule-notice\" role=\"status\">\r\n          <span>Correo al anunciante pendiente: cambio al {{ fecha(cambio.fecha_inicio_nueva) }}.</span>\r\n          <button type=\"button\" class=\"acct-btn acct-btn--ghost acct-btn--sm\" [disabled]=\"ocupada() !== null\" (click)=\"reintentarAviso(reserva, cambio)\">Reintentar aviso</button>\r\n        </div>\r\n      }\r\n      @if (!recibida && puedeConsultarCodigo(reserva) && codigos()[reserva.id]; as codigo) {\r\n        <div class=\"lodging-code\" role=\"status\">\r\n          <small>C\u00F3digo personal de ingreso</small><strong>{{ codigo }}</strong>\r\n          <span>No lo compartas hasta estar f\u00EDsicamente en la propiedad.</span>\r\n        </div>\r\n      }\r\n      @let aviso = avisoCodigo()?.id === reserva.id ? avisoCodigo() : null;\r\n      @if (recibida && puedeValidarCodigo(reserva)) {\r\n        @let restantes = reserva.intentos_codigo_restantes;\r\n        <form class=\"code-entry\" (ngSubmit)=\"validarCodigo(reserva)\">\r\n          <label [for]=\"'code-' + reserva.id\">C\u00F3digo entregado por el inquilino</label>\r\n          <div>\r\n            <input [id]=\"'code-' + reserva.id\" [name]=\"'code-' + reserva.id\" [(ngModel)]=\"codigoIngresado[reserva.id]\" maxlength=\"8\" autocomplete=\"off\" placeholder=\"Ej.: K7M4P9Q2\"\r\n              [attr.aria-invalid]=\"aviso?.tipo === 'error'\" [attr.aria-describedby]=\"'code-feedback-' + reserva.id\" />\r\n            <button type=\"submit\" class=\"acct-btn acct-btn--primary acct-btn--sm\" [disabled]=\"ocupada() !== null\">Validar ingreso</button>\r\n          </div>\r\n          <div [id]=\"'code-feedback-' + reserva.id\">\r\n            @if (aviso) {\r\n              <p class=\"code-entry__aviso\" [class.code-entry__aviso--error]=\"aviso.tipo === 'error'\" [attr.role]=\"aviso.tipo === 'error' ? 'alert' : 'status'\">{{ aviso.texto }}</p>\r\n            } @else if (restantes !== undefined && reserva.intentos_codigo > 0) {\r\n              <p class=\"code-entry__hint\">Te {{ restantes === 1 ? 'queda 1 intento' : 'quedan ' + restantes + ' intentos' }} antes de que el c\u00F3digo se bloquee.</p>\r\n            }\r\n          </div>\r\n        </form>\r\n      } @else if (recibida && aviso) {\r\n        <!-- Despu\u00E9s de validar o de bloquear, el campo desaparece y el aviso queda en la tarjeta. -->\r\n        <p class=\"code-entry__aviso\" [class.code-entry__aviso--error]=\"aviso.tipo === 'error'\" [attr.role]=\"aviso.tipo === 'error' ? 'alert' : 'status'\">{{ aviso.texto }}</p>\r\n      }\r\n      @if (recibida && puedePedirReinicioCodigo(reserva)) {\r\n        <!-- Con el c\u00F3digo bloqueado, el anunciante le pide el reinicio a Administraci\u00F3n. -->\r\n        @if (motivoPedidoReinicioNoDisponible(reserva); as motivo) {\r\n          <p class=\"code-entry__hint\">{{ motivo }}</p>\r\n        } @else {\r\n          @if (!aviso) {\r\n            <p class=\"code-entry__aviso code-entry__aviso--error\">El c\u00F3digo se bloque\u00F3 por demasiados intentos incorrectos.</p>\r\n          }\r\n          <button type=\"button\" class=\"acct-btn acct-btn--primary acct-btn--sm code-entry__pedido\" [disabled]=\"reclamoEnviando()\"\r\n            (click)=\"abrirPedidoReinicio(reserva)\">Pedir reinicio a Administraci\u00F3n</button>\r\n        }\r\n      }\r\n    </div>\r\n  }\r\n</ng-template>\r\n\r\n<!-- Formulario de reclamo: lo usan el inquilino (problema en la reserva) y el anunciante (pedido de reinicio del c\u00F3digo). -->\r\n<ng-template #formularioReclamo let-reserva>\r\n  @let pedido = reclamoCategoria() === 'CODIGO_BLOQUEADO';\r\n  <form class=\"claim-form\" (ngSubmit)=\"enviarReclamo()\" [attr.aria-busy]=\"reclamoEnviando()\">\r\n    <h4>{{ pedido ? 'Pedir el reinicio del c\u00F3digo de la reserva #' : 'Reportar un problema en la reserva #' }}{{ reserva.id }}</h4>\r\n    <p class=\"muted\">{{ pedido\r\n      ? 'Contale a Administraci\u00F3n qu\u00E9 pas\u00F3 con el c\u00F3digo. El hu\u00E9sped tambi\u00E9n ve el pedido y lo pod\u00E9s seguir desde la pesta\u00F1a Reclamos.'\r\n      : 'La liquidaci\u00F3n quedar\u00E1 en revisi\u00F3n.' }}</p>\r\n    @if (!pedido) {\r\n      <label for=\"categoria-reclamo-{{ reserva.id }}\">\u00BFQu\u00E9 tipo de problema tuviste?\r\n        <select\r\n          id=\"categoria-reclamo-{{ reserva.id }}\"\r\n          name=\"categoriaReclamo\"\r\n          [ngModel]=\"reclamoCategoria()\"\r\n          (ngModelChange)=\"reclamoCategoria.set($event)\"\r\n          [disabled]=\"reclamoEnviando()\"\r\n        >\r\n          <option value=\"LIMPIEZA\">Limpieza</option>\r\n          <option value=\"MANTENIMIENTO\">Mantenimiento</option>\r\n          <option value=\"INGRESO\">Ingreso</option>\r\n          <option value=\"DESCRIPCION\">La propiedad no coincide</option>\r\n          <option value=\"OTRO\">Otro</option>\r\n        </select>\r\n      </label>\r\n    }\r\n    <label for=\"descripcion-reclamo-{{ reserva.id }}\">Contanos qu\u00E9 pas\u00F3\r\n      <textarea\r\n        id=\"descripcion-reclamo-{{ reserva.id }}\"\r\n        name=\"descripcionReclamo\"\r\n        [placeholder]=\"pedido ? 'Por ejemplo: el hu\u00E9sped me dict\u00F3 el c\u00F3digo y no lo toma.' : 'Describ\u00ED qu\u00E9 pas\u00F3, cu\u00E1ndo ocurri\u00F3 y c\u00F3mo afect\u00F3 tu estad\u00EDa.'\"\r\n        aria-describedby=\"ayuda-descripcion-{{ reserva.id }}\"\r\n        rows=\"4\"\r\n        minlength=\"20\"\r\n        maxlength=\"1000\"\r\n        required\r\n        [ngModel]=\"reclamoDescripcion()\"\r\n        (ngModelChange)=\"reclamoDescripcion.set($event)\"\r\n        [disabled]=\"reclamoEnviando()\"\r\n      ></textarea>\r\n      <small id=\"ayuda-descripcion-{{ reserva.id }}\">M\u00EDnimo 20 caracteres \u00B7 {{ reclamoDescripcion().length }}/1000</small>\r\n    </label>\r\n    <app-carga-imagenes [(archivos)]=\"reclamoArchivos\" [maximo]=\"maxImagenesPorEnvio\" [deshabilitado]=\"reclamoEnviando()\" />\r\n    @if (errorReclamo()) { <p class=\"claim-error\" role=\"alert\">{{ errorReclamo() }}</p> }\r\n    <div class=\"reschedule-form__actions\">\r\n      <button type=\"submit\" class=\"acct-btn acct-btn--primary acct-btn--sm\" [disabled]=\"reclamoEnviando()\">\r\n        {{ reclamoEnviando() ? 'Enviando\u2026' : pedido ? 'Enviar pedido' : 'Enviar reclamo' }}\r\n      </button>\r\n      <button type=\"button\" class=\"acct-btn acct-btn--ghost acct-btn--sm\" [disabled]=\"reclamoEnviando()\" (click)=\"cerrarReclamo()\">Cerrar</button>\r\n    </div>\r\n  </form>\r\n</ng-template>\r\n", styles: ["@use '../../shared/components/claim-history/claim-form';\r\n\r\n\r\n.reservation-tabs { display: flex; gap: .5rem; padding: .35rem; border: 1px solid var(--color-border); border-radius: 10px; background: #fff; }\r\n.reservation-tabs button { display: inline-flex; flex: 1; align-items: center; justify-content: center; gap: .5rem; min-height: 44px; padding: .55rem 1rem; border: 0; border-radius: 7px; background: transparent; color: var(--color-text-muted); font-weight: 800; cursor: pointer; }\r\n.reservation-tabs button:hover { background: var(--color-bg); color: var(--color-text); }\r\n.reservation-tabs button.is-active { background: var(--color-secondary); color: #fff; box-shadow: 0 3px 9px color-mix(in srgb, var(--color-secondary), transparent 70%); }\r\n.reservation-tabs button span { display: grid; min-width: 1.45rem; height: 1.45rem; place-items: center; padding: 0 .35rem; border-radius: 999px; background: rgba(255,255,255,.2); font-size: .74rem; }\r\n.reservation-tabs button:focus-visible { outline: 3px solid color-mix(in srgb, var(--color-secondary), transparent 70%); outline-offset: 2px; }\r\n.reservation-tabs--sub { margin-bottom: 1rem; }\r\n\r\n.reservation-section { margin-top: .25rem; }\r\n.reservation-filters { display: flex; flex-wrap: wrap; gap: .75rem; margin-bottom: 1rem; }\r\n.reservation-filters label { display: grid; gap: .3rem; flex: 1 1 150px; color: var(--color-text-muted); font-size: .85rem; font-weight: 700; }\r\n.reservation-filters :is(input, select) { width: 100%; min-height: 42px; padding: .5rem; border: 1px solid var(--color-border); border-radius: 7px; background: #fff; color: var(--color-text); font: inherit; }\r\n.reservation-pagination { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: .75rem; margin: 1rem 0; }\r\n.reservation-pagination div { display: flex; gap: .5rem; }\r\n.section-heading { margin-bottom: .85rem; }\r\n.section-heading h2 { margin: 0; font-size: 1.15rem; }\r\n.section-heading p { margin: .2rem 0 0; color: var(--color-text-muted); font-size: .9rem; }\r\n.reservation { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: .75rem; }\r\n.reschedule-form__actions { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: .85rem; }\r\n.reschedule-history { display: grid; gap: .15rem; margin: .5rem 0; padding: .65rem .8rem; border-left: 3px solid var(--color-primary); background: #fffaf2; font-size: .85rem; }\r\n.reschedule-notice { display: flex; align-items: center; flex-wrap: wrap; gap: .5rem; margin: .5rem 0; color: #744210; font-size: .85rem; }\r\n.reservation h3 { margin: .5rem 0 .25rem; font-size: 1.05rem; }\r\n.reservation p { margin: .2rem 0; }\r\n.muted { color: var(--color-text-muted); font-size: .9rem; }\r\n.empty { color: var(--color-text-muted); }\r\n.settlement-state { color: var(--color-primary); font-size: .88rem; font-weight: 750; }\r\n.lodging-code { display: grid; width: fit-content; gap: .2rem; margin-top: .75rem; padding: .8rem 1rem; border: 1px dashed var(--color-primary); border-radius: 9px; background: #fffaf2; }\r\n.lodging-code small, .lodging-code span { color: var(--color-text-muted); }\r\n.lodging-code strong { color: var(--color-primary); font-size: 1.6rem; letter-spacing: .18em; }\r\n.lodging-code span { max-width: 360px; font-size: .78rem; }\r\n.code-entry { display: grid; gap: .35rem; margin-top: .75rem; }\r\n.code-entry label { font-size: .82rem; font-weight: 750; }\r\n.code-entry > div { display: flex; gap: .5rem; flex-wrap: wrap; }\r\n.code-entry input { width: 170px; padding: .65rem .75rem; border: 1px solid var(--color-border); border-radius: 7px; text-transform: uppercase; font-weight: 800; letter-spacing: .12em; }\r\n.code-entry input[aria-invalid=\"true\"] { border-color: #b42318; }\r\n.code-entry__hint, .code-entry__aviso { margin: .35rem 0 0; font-size: .85rem; }\r\n.code-entry__hint { color: var(--color-text-muted); }\r\n.code-entry__aviso { padding: .5rem .7rem; border-radius: 7px; background: #e9f7ef; color: #1d5e3b; font-weight: 650; }\r\n.code-entry__aviso--error { background: #fdecea; color: #8a1c13; }\r\n.code-entry__pedido { justify-self: start; margin-top: .5rem; }\r\n\r\n@media (max-width: 600px) {\r\n    .reservation-tabs { flex-direction: column; }\r\n  .reservation { align-items: flex-start; flex-direction: column; }\r\n}\r\n\r\n.booking-card {\r\n  display: grid;\r\n  grid-template-columns: clamp(145px, 24%, 215px) minmax(0, 1fr);\r\n  column-gap: 1.25rem;\r\n  row-gap: .85rem;\r\n  margin-bottom: 1rem;\r\n  padding: .85rem;\r\n  border-radius: .85rem;\r\n}\r\n.booking-card__cover {\r\n  display: grid;\r\n  place-items: center;\r\n  position: relative;\r\n  min-height: 138px;\r\n  border-radius: .55rem;\r\n  overflow: hidden;\r\n  background: #edf0f2;\r\n  color: #657583;\r\n}\r\n.booking-card__cover img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }\r\n.booking-card__main { display: grid; grid-template-rows: 1fr auto; min-width: 0; }\r\n.booking-card__overview { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); align-items: stretch; padding-bottom: .65rem; }\r\n.booking-card__info { min-width: 0; padding-right: 1rem; }\r\n.booking-card__heading { display: flex; align-items: center; flex-wrap: wrap; gap: .4rem .85rem; margin-bottom: .65rem; }\r\n.booking-card__heading h2 { margin: 0; color: var(--color-text); font-size: clamp(1.15rem, 2.25vw, 1.55rem); line-height: 1.15; letter-spacing: -.025em; }\r\n.booking-card__heading .acct-badge--ok { background: #cef1d6; color: #155e28; }\r\n.booking-card__dates { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; max-width: 20rem; margin: 0; }\r\n.booking-card__dates > div + div { padding-inline-start: .85rem; border-inline-start: 1px solid var(--color-border); }\r\n.booking-card__dates dt, .booking-card__total span { color: #4d5561; font-size: .82rem; }\r\n.booking-card__dates dd { margin: .1rem 0 0; font-size: .98rem; font-weight: 800; }\r\n.booking-card__settlement { display: flex; align-items: center; gap: .35rem; margin: .5rem 0 0; color: #4d5561; font-size: .81rem; }\r\n.booking-card__settlement svg { flex: none; color: #a9530c; }\r\n.booking-card__total { display: grid; align-content: start; gap: .25rem; border-inline-start: 1px solid var(--color-border); padding: .7rem 0 0 1.25rem; }\r\n.booking-card__total strong { font-size: clamp(1.2rem, 2.5vw, 1.75rem); font-weight: 850; line-height: 1.12; letter-spacing: -.025em; }\r\n.booking-card__footer { display: flex; align-items: start; justify-content: space-between; gap: .65rem; padding-top: .55rem; border-top: 1px solid var(--color-border); }\r\n.booking-card__actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: .45rem; margin-inline-start: auto; }\r\n.booking-button { display: inline-flex; justify-content: center; align-items: center; min-height: 36px; padding: .35rem .85rem; border: 1px solid #a6aeb9; border-radius: .5rem; background: #fff; color: var(--color-text); font-size: .8rem; font-weight: 650; text-decoration: none; cursor: pointer; }\r\n.booking-button:hover { background: #f3f5f7; }\r\n.booking-button--primary { background: #b93819; border-color: #b93819; color: #fff; padding-inline: 1.1rem; }\r\n.booking-button--primary:hover { background: #9e2e15; }\r\n.booking-button--more { width: 40px; padding: .2rem; }\r\n.booking-button:disabled, .booking-menu button:disabled { opacity: .55; cursor: default; }\r\n.booking-quote { min-width: 0; max-width: 15rem; color: #3d4856; font-size: .8rem; }\r\n.booking-quote summary { display: flex; align-items: center; gap: .2rem; min-height: 36px; width: fit-content; cursor: pointer; list-style: none; }\r\n.booking-quote summary::-webkit-details-marker { display: none; }\r\n.booking-quote[open] summary svg { transform: rotate(90deg); }\r\n.booking-quote p { margin: .2rem 0 0; }\r\n.booking-menu {\r\n  width: min(15rem, calc(100vw - 2rem));\r\n  max-height: calc(100dvh - 2rem);\r\n  margin: auto;\r\n  padding: .4rem;\r\n  border: 1px solid var(--color-border);\r\n  border-radius: .65rem;\r\n  background: #fff;\r\n  box-shadow: 0 8px 24px #18253526;\r\n  color: var(--color-text);\r\n}\r\n@supports (position-area: block-end span-inline-start) {\r\n  .booking-menu {\r\n    inset: auto;\r\n    margin: .35rem 0;\r\n    position-area: block-end span-inline-start;\r\n    position-try-fallbacks: flip-block;\r\n  }\r\n}\r\n.booking-menu :is(a, button), .booking-menu__hint {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: .55rem;\r\n  width: 100%;\r\n  min-height: 36px;\r\n  padding: .45rem .6rem;\r\n  border: 0;\r\n  border-radius: .35rem;\r\n  background: transparent;\r\n  color: inherit;\r\n  font: inherit;\r\n  font-size: .83rem;\r\n  text-align: start;\r\n  text-decoration: none;\r\n}\r\n.booking-menu svg { flex: none; }\r\n.booking-menu :is(a, button) { cursor: pointer; }\r\n.booking-menu :is(a, button):hover { background: #f3f5f7; }\r\n.booking-menu .booking-menu__danger { margin-top: .2rem; border-top: 1px solid var(--color-border); color: #ae261d; }\r\n.booking-menu .booking-menu__hint { align-items: flex-start; margin: 0; color: #526475; }\r\n.booking-card :is(a, button, summary):focus-visible { outline: 2px solid #275f80; outline-offset: 2px; }\r\n.booking-card > :is(.booking-card__extras, .claim-form) { grid-column: 1 / -1; }\r\n.booking-card__extras { border-top: 1px solid var(--color-border); padding-top: .6rem; }\r\n.booking-card__extras > p { margin: .2rem 0; }\r\n\r\n@media (max-width: 680px) {\r\n  .booking-card { grid-template-columns: 1fr; gap: .75rem; }\r\n  .booking-card__cover { min-height: 0; aspect-ratio: 2.45; }\r\n  .booking-card__info { padding-right: .55rem; }\r\n  .booking-card__total { padding: .15rem 0 0 .65rem; }\r\n  .booking-card__footer { flex-wrap: wrap; }\r\n}\r\n@media (max-width: 390px) {\r\n  .booking-card__overview { grid-template-columns: 1fr; gap: .6rem; }\r\n  .booking-card__total { padding: .55rem 0 0; border-inline-start: 0; border-top: 1px solid var(--color-border); }\r\n  .booking-card__actions { justify-content: flex-start; margin-inline-start: 0; }\r\n}\r\n\r\n.cancellation-dialog {\r\n  position: fixed;\r\n  inset: 0;\r\n  margin: auto;\r\n  box-sizing: border-box;\r\n  width: min(38rem, calc(100% - 2rem));\r\n  max-height: calc(100dvh - 2rem);\r\n  padding: clamp(1rem, 4vw, 1.75rem);\r\n  border: 1px solid var(--color-border);\r\n  border-radius: 18px;\r\n  background: white;\r\n  color: var(--color-text);\r\n  box-shadow: 0 20px 48px #0f172a40;\r\n}\r\n.cancellation-dialog::backdrop { background: #10182880; }\r\n.cancellation-dialog h2 { margin: .45rem 0 1.35rem; font-size: clamp(1.55rem, 4vw, 2.15rem); }\r\n.cancellation-close {\r\n  position: absolute; top: .85rem; right: .85rem; display: grid; place-items: center;\r\n  width: 42px; height: 42px; border: 0; border-radius: 8px;\r\n  background: transparent; color: var(--color-text); cursor: pointer;\r\n}\r\n.cancellation-close:hover:not(:disabled) { background: #f2f4f7; }\r\n.cancellation-icon { display: grid; place-items: center; width: 4.15rem; height: 4.15rem; border-radius: 14px; background: #f8e2db; color: #ac3618; }\r\n.cancellation-reservation { display: flex; align-items: center; gap: 1rem; padding: .8rem; margin-bottom: 1.25rem; border-radius: 12px; background: #f1f2f4; }\r\n.cancellation-reservation img, .cancellation-placeholder { flex: none; width: clamp(72px, 22vw, 165px); aspect-ratio: 5 / 3; object-fit: cover; border-radius: 9px; }\r\n.cancellation-placeholder { display: grid; place-items: center; background: #e4e7ec; color: var(--color-text-muted); }\r\n.cancellation-reservation strong { font-size: 1.1rem; overflow-wrap: anywhere; }\r\n.cancellation-reservation p { margin: .3rem 0 0; color: var(--color-text-muted); }\r\n.cancellation-dialog label { display: block; margin-bottom: .5rem; font-weight: 750; }\r\n.cancellation-dialog label span, .cancellation-error { color: #a52e17; }\r\n.cancellation-dialog textarea { box-sizing: border-box; width: 100%; padding: .7rem .8rem; border: 1px solid #9da6b5; border-radius: 9px; font: inherit; color: inherit; resize: vertical; }\r\n.cancellation-dialog small { color: var(--color-text-muted); }\r\n.cancellation-refund { margin-bottom: 1.2rem; padding: 1rem; border: 1px solid #b9d7c0; border-radius: 10px; background: #edf7ef; color: #174d2a; overflow-wrap: anywhere; }\r\n.cancellation-refund strong { font-size: 1.1rem; }\r\n.cancellation-refund p { margin: .5rem 0 0; font-size: .9rem; }\r\n.cancellation-refund--warning, .cancellation-warning { border: 1px solid #e0b961; background: #fff6df; color: #684000; }\r\n.cancellation-warning { display: flex; align-items: flex-start; gap: .7rem; padding: .8rem 1rem; margin-bottom: 1rem; border-radius: 10px; }\r\n.cancellation-warning svg { flex: none; }\r\n.cancellation-warning p { margin: 0; }\r\n.cancellation-info { display: flex; align-items: center; gap: .8rem; padding: .8rem 1rem; margin-top: 1rem; border-radius: 10px; background: #e1efff; color: #123664; }\r\n.cancellation-info svg { flex: none; }\r\n.cancellation-info p { margin: 0; }\r\n.cancellation-terms { margin: 1rem 0; }\r\n.cancellation-terms summary { color: #123664; cursor: pointer; font-weight: 700; text-decoration: underline; }\r\n.cancellation-terms ul { list-style: disc; padding-inline-start: 1.5rem; margin-top: .6rem; }\r\n.cancellation-terms li + li { margin-top: .4rem; }\r\n.cancellation-dialog .cancellation-accept { display: flex; align-items: baseline; gap: .55rem; }\r\n.cancellation-accept input { appearance: auto; }\r\n.cancellation-actions { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: .75rem; margin-top: 1.3rem; }\r\n.cancellation-back { background: white; color: #a52e17; border: 1px solid #b83d22; }\r\n.cancellation-submit { background: #ae3619; color: white; border: 1px solid #ae3619; }\r\n\r\n.administrative-delays { margin-bottom: 1.5rem; h2 { font-size: 1.1rem; margin-bottom: 1rem; } }\r\n.administrative-delay { padding: 1.2rem; margin-bottom: 1rem; border: 1px solid #e5c4a7; border-left: 4px solid #b96222; border-radius: 10px; background: #fffaf5; h3 { font-size: 1rem; margin: 0 0 .6rem; } p { line-height: 1.6; margin-bottom: 1rem; } }\r\n"] }]
    }], () => [], { dialogoDemora: [{ type: i0.ViewChild, args: ['dialogoDemora', { isSignal: true }] }], dialogoCancelacion: [{ type: i0.ViewChild, args: ['dialogoCancelacion', { isSignal: true }] }], dialogoFaltante: [{ type: i0.ViewChild, args: ['dialogoFaltante', { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(MisReservasComponent, { className: "MisReservasComponent", filePath: "src/app/features/mis-reservas/mis-reservas.component.ts", lineNumber: 42 }); })();
