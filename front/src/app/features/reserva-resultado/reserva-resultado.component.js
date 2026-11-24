import { Component, computed, effect, inject, signal } from '@angular/core';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, exhaustMap, timer } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ReembolsoChatComponent } from '../../shared/components/reembolso-chat/reembolso-chat.component';
import { VerComprobanteComponent } from '../../shared/components/ver-comprobante/ver-comprobante.component';
import { ActividadReembolsosService } from '../../core/services/actividad-reembolsos.service';
import { activarActualizacionReservas } from '../../shared/utils/reservation-refresh';
import { devolucionRegistrada, etiquetasEstadia, puedeConsultarCodigo, puedeReprogramar } from '../../shared/utils/reservation-state';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideCalendar, LucideCheck, LucideChevronDown, LucideCopy, LucideKeyRound, LucideLandmark } from '@lucide/angular';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { ReservaReprogramacionComponent } from './reserva-reprogramacion.component';
import { etiquetaSeccionAdmin, seccionAdmin } from '../admin/admin-secciones';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { ReservationService, } from '../../shared/services/reservation.service';
import * as i0 from "@angular/core";
const _c0 = (a0, a1) => [a0, a1];
const _c1 = a0 => ["/admin/usuarios", a0];
const _forTrack0 = ($index, $item) => $item.id;
const _forTrack1 = ($index, $item) => $item.rol;
function ReservaResultadoComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 2);
    i0.ɵɵelement(1, "app-spinner");
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.administracion ? "Cargando la reserva\u2026" : "Estamos verificando tu reserva\u2026");
} }
function ReservaResultadoComponent_Conditional_3_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 6);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("fragment", ctx_r0.seccionOrigen ?? undefined);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.textoVolver);
} }
function ReservaResultadoComponent_Conditional_3_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 7);
    i0.ɵɵtext(1, "Ir a Mis reservas");
    i0.ɵɵelementEnd();
} }
function ReservaResultadoComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 3)(1, "span", 5);
    i0.ɵɵtext(2, "!");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "h1");
    i0.ɵɵtext(4, "No pudimos mostrar la reserva");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(7, ReservaResultadoComponent_Conditional_3_Conditional_7_Template, 2, 2, "a", 6)(8, ReservaResultadoComponent_Conditional_3_Conditional_8_Template, 2, 0, "a", 7);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(ctx_r0.error());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.administracion ? 7 : 8);
} }
function ReservaResultadoComponent_Conditional_4_Conditional_0_For_2_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " \u00B7 Transferencia registrada ");
} }
function ReservaResultadoComponent_Conditional_4_Conditional_0_For_2_Conditional_14_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 35);
    i0.ɵɵtext(1, "Devoluci\u00F3n simulada. No se transfiri\u00F3 dinero.");
    i0.ɵɵelementEnd();
} }
function ReservaResultadoComponent_Conditional_4_Conditional_0_For_2_Conditional_14_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 35);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const reembolso_r3 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("N\u00FAmero de operaci\u00F3n: ", reembolso_r3.referencia_externa);
} }
function ReservaResultadoComponent_Conditional_4_Conditional_0_For_2_Conditional_14_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 36);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const reembolso_r3 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Observaci\u00F3n: ", reembolso_r3.observacion_transferencia);
} }
function ReservaResultadoComponent_Conditional_4_Conditional_0_For_2_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 33);
    i0.ɵɵtext(1, "Comprobante de la transferencia: ");
    i0.ɵɵelement(2, "app-ver-comprobante", 34);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, ReservaResultadoComponent_Conditional_4_Conditional_0_For_2_Conditional_14_Conditional_3_Template, 2, 0, "p", 35)(4, ReservaResultadoComponent_Conditional_4_Conditional_0_For_2_Conditional_14_Conditional_4_Template, 2, 1, "p", 35);
    i0.ɵɵconditionalCreate(5, ReservaResultadoComponent_Conditional_4_Conditional_0_For_2_Conditional_14_Conditional_5_Template, 2, 1, "p", 36);
} if (rf & 2) {
    const reembolso_r3 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("obtenerUrl", ctx_r0.urlComprobanteReembolso(reembolso_r3.id))("etiqueta", "Ver " + reembolso_r3.comprobante_nombre);
    i0.ɵɵadvance();
    i0.ɵɵconditional(reembolso_r3.referencia_externa?.startsWith("SIMULADO:tarjeta:") ? 3 : reembolso_r3.referencia_externa ? 4 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(reembolso_r3.observacion_transferencia ? 5 : -1);
} }
function ReservaResultadoComponent_Conditional_4_Conditional_0_For_2_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-reembolso-chat", 32);
} if (rf & 2) {
    const reembolso_r3 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("reembolsoId", reembolso_r3.id)("vistaInquilino", true);
} }
function ReservaResultadoComponent_Conditional_4_Conditional_0_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "header", 27)(1, "span", 28);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 29);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "div")(4, "h2");
    i0.ɵɵtext(5, "Reembolsos por transferencia");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p");
    i0.ɵɵtext(7);
    i0.ɵɵconditionalCreate(8, ReservaResultadoComponent_Conditional_4_Conditional_0_For_2_Conditional_8_Template, 1, 0);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "strong");
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "button", 30);
    i0.ɵɵlistener("click", function ReservaResultadoComponent_Conditional_4_Conditional_0_For_2_Template_button_click_11_listener() { const reembolso_r3 = i0.ɵɵrestoreView(_r2).$implicit; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.conversacionAbierta.set(ctx_r0.conversacionAbierta() === reembolso_r3.id ? null : reembolso_r3.id)); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(12, "svg", 31);
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(14, ReservaResultadoComponent_Conditional_4_Conditional_0_For_2_Conditional_14_Template, 6, 4);
    i0.ɵɵconditionalCreate(15, ReservaResultadoComponent_Conditional_4_Conditional_0_For_2_Conditional_15_Template, 1, 2, "app-reembolso-chat", 32);
} if (rf & 2) {
    const reembolso_r3 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 26);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1("Reembolso #", reembolso_r3.id, " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(reembolso_r3.estado === "APROBADO" ? 8 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.monto(reembolso_r3.importe, reembolso_r3.moneda));
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-expanded", ctx_r0.conversacionAbierta() === reembolso_r3.id);
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 18);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.conversacionAbierta() === reembolso_r3.id ? "Ocultar conversaci\u00F3n" : "Ver conversaci\u00F3n", " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(reembolso_r3.comprobante_nombre ? 14 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.conversacionAbierta() === reembolso_r3.id ? 15 : -1);
} }
function ReservaResultadoComponent_Conditional_4_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 8);
    i0.ɵɵrepeaterCreate(1, ReservaResultadoComponent_Conditional_4_Conditional_0_For_2_Template, 16, 9, null, null, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.conversacionesReembolso());
} }
function ReservaResultadoComponent_Conditional_4_Conditional_1_Conditional_14_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "img", 49);
    i0.ɵɵlistener("error", function ReservaResultadoComponent_Conditional_4_Conditional_1_Conditional_14_Conditional_0_Template_img_error_0_listener() { i0.ɵɵrestoreView(_r5); const portada_r6 = i0.ɵɵnextContext(); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.imagenFallida.set(portada_r6)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const portada_r6 = i0.ɵɵnextContext();
    i0.ɵɵproperty("src", portada_r6, i0.ɵɵsanitizeUrl);
} }
function ReservaResultadoComponent_Conditional_4_Conditional_1_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, ReservaResultadoComponent_Conditional_4_Conditional_1_Conditional_14_Conditional_0_Template, 1, 1, "img", 48);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵconditional(ctx_r0.imagenFallida() !== ctx ? 0 : -1);
} }
function ReservaResultadoComponent_Conditional_4_Conditional_1_Conditional_36_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-reserva-reprogramacion", 50);
    i0.ɵɵlistener("cancelar", function ReservaResultadoComponent_Conditional_4_Conditional_1_Conditional_36_Template_app_reserva_reprogramacion_cancelar_0_listener() { i0.ɵɵrestoreView(_r7); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.reprogramando.set(false)); })("guardada", function ReservaResultadoComponent_Conditional_4_Conditional_1_Conditional_36_Template_app_reserva_reprogramacion_guardada_0_listener($event) { i0.ɵɵrestoreView(_r7); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.guardarReprogramacion($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r8 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("reserva", item_r8);
} }
function ReservaResultadoComponent_Conditional_4_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "nav", 37)(1, "a", 38);
    i0.ɵɵtext(2, "Mis reservas");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 39);
    i0.ɵɵtext(4, "/");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "header", 40)(8, "h1");
    i0.ɵɵtext(9, "Detalle de la reserva");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "button", 41);
    i0.ɵɵlistener("click", function ReservaResultadoComponent_Conditional_4_Conditional_1_Template_button_click_10_listener() { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.abrirReprogramacion()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(11, "svg", 42);
    i0.ɵɵtext(12, " Cambiar fechas ");
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(13, "section", 43);
    i0.ɵɵconditionalCreate(14, ReservaResultadoComponent_Conditional_4_Conditional_1_Conditional_14_Template, 1, 1);
    i0.ɵɵelementStart(15, "div", 44)(16, "h2");
    i0.ɵɵtext(17);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "span", 45);
    i0.ɵɵtext(19, "Confirmada");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "dl")(21, "div")(22, "dt");
    i0.ɵɵtext(23, "Ingreso");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "dd");
    i0.ɵɵtext(25);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(26, "div")(27, "dt");
    i0.ɵɵtext(28, "Salida");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "dd");
    i0.ɵɵtext(30);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(31, "div", 46)(32, "span");
    i0.ɵɵtext(33, "Total");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(34, "strong");
    i0.ɵɵtext(35);
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(36, ReservaResultadoComponent_Conditional_4_Conditional_1_Conditional_36_Template, 1, 1, "app-reserva-reprogramacion", 47);
} if (rf & 2) {
    let tmp_8_0;
    const item_r8 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate1("Reserva #", item_r8.id);
    i0.ɵɵadvance(4);
    i0.ɵɵattribute("aria-expanded", ctx_r0.reprogramando());
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 18);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional((tmp_8_0 = item_r8.publicacion?.imagenes?.[0]?.url) ? 14 : -1, tmp_8_0);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(item_r8.publicacion?.titulo);
    i0.ɵɵadvance(8);
    i0.ɵɵtextInterpolate(ctx_r0.fecha(item_r8.fecha_inicio));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.fecha(item_r8.fecha_fin));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.monto(item_r8.importe_contratado ?? item_r8.monto_pago, item_r8.moneda_contratada ?? "ARS"));
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.reprogramando() ? 36 : -1);
} }
function ReservaResultadoComponent_Conditional_4_Conditional_2_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 56);
    i0.ɵɵlistener("click", function ReservaResultadoComponent_Conditional_4_Conditional_2_Conditional_10_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r9); const item_r8 = i0.ɵɵnextContext(2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.reintentarPago(item_r8.id)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("disabled", ctx_r0.reintentandoPago());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.reintentandoPago() ? "Abriendo Mercado Pago\u2026" : "Volver a Mercado Pago", " ");
} }
function ReservaResultadoComponent_Conditional_4_Conditional_2_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 54);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("fragment", ctx_r0.seccionOrigen ?? undefined);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("\u2190 ", ctx_r0.textoVolver);
} }
function ReservaResultadoComponent_Conditional_4_Conditional_2_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 55);
    i0.ɵɵtext(1, "Ver todas mis reservas");
    i0.ɵɵelementEnd();
} }
function ReservaResultadoComponent_Conditional_4_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "header", 51)(1, "div", 5);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div")(4, "span", 52);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "h1");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "p");
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(10, ReservaResultadoComponent_Conditional_4_Conditional_2_Conditional_10_Template, 2, 2, "button", 53);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(11, ReservaResultadoComponent_Conditional_4_Conditional_2_Conditional_11_Template, 2, 2, "a", 54)(12, ReservaResultadoComponent_Conditional_4_Conditional_2_Conditional_12_Template, 2, 0, "a", 55);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r8 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("is-approved", !ctx_r0.devolucionPendiente() && item_r8.estado_pago === "APROBADO" && !item_r8.cancelada)("is-pending", ctx_r0.devolucionPendiente() || item_r8.estado_pago === "PENDIENTE" || item_r8.cancelada && item_r8.estado_pago === "APROBADO" && item_r8.estado_liquidacion === "EN_REVISION");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.devolucionPendiente() || item_r8.estado_pago === "PENDIENTE" ? "\u2026" : item_r8.estado_pago === "APROBADO" && !item_r8.cancelada ? "\u2713" : "!", " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("Reserva #", item_r8.id);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.tituloEstado(item_r8));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.descripcionEstado(item_r8));
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.resumen()?.puede_reintentar ? 10 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.administracion ? 11 : 12);
} }
function ReservaResultadoComponent_Conditional_4_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 10);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.errorVerificacion());
} }
function ReservaResultadoComponent_Conditional_4_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 11);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.avisoReprogramacion());
} }
function ReservaResultadoComponent_Conditional_4_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 17);
    i0.ɵɵtext(1, "Ver publicaci\u00F3n");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r8 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction2(1, _c0, ctx_r0.administracion ? "/admin/publicaciones" : "/publicaciones", item_r8.publicacion.id));
} }
function ReservaResultadoComponent_Conditional_4_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 18)(1, "div")(2, "span");
    i0.ɵɵtext(3, "Ingreso");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "strong");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "small");
    i0.ɵɵtext(7, "Primer d\u00EDa de la estad\u00EDa");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div")(9, "span");
    i0.ɵɵtext(10, "Salida");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "strong");
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "small");
    i0.ɵɵtext(14, "\u00DAltimo d\u00EDa incluido");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const item_r8 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.fecha(item_r8.fecha_inicio));
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate(ctx_r0.fecha(item_r8.fecha_fin));
} }
function ReservaResultadoComponent_Conditional_4_Conditional_19_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "Mostr\u00E1selo al propietario al llegar al alojamiento.");
    i0.ɵɵelementEnd();
} }
function ReservaResultadoComponent_Conditional_4_Conditional_19_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 60);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 64);
    i0.ɵɵtext(2, " Este c\u00F3digo ya fue validado por el propietario. ");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 18);
} }
function ReservaResultadoComponent_Conditional_4_Conditional_19_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 61);
    i0.ɵɵtext(1, "La estad\u00EDa ya finaliz\u00F3.");
    i0.ɵɵelementEnd();
} }
function ReservaResultadoComponent_Conditional_4_Conditional_19_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 62);
    i0.ɵɵtext(1, "Cargando tu c\u00F3digo de ingreso\u2026");
    i0.ɵɵelementEnd();
} }
function ReservaResultadoComponent_Conditional_4_Conditional_19_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 63)(1, "p", 65);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 66);
    i0.ɵɵlistener("click", function ReservaResultadoComponent_Conditional_4_Conditional_19_Conditional_10_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r10); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.reintentarCodigo()); });
    i0.ɵɵtext(4, " Reintentar ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.errorCodigo());
} }
function ReservaResultadoComponent_Conditional_4_Conditional_19_Conditional_11_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(0, "svg", 64);
} if (rf & 2) {
    i0.ɵɵproperty("size", 18);
} }
function ReservaResultadoComponent_Conditional_4_Conditional_19_Conditional_11_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(0, "svg", 70);
} if (rf & 2) {
    i0.ɵɵproperty("size", 18);
} }
function ReservaResultadoComponent_Conditional_4_Conditional_19_Conditional_11_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 72);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.errorCopiar());
} }
function ReservaResultadoComponent_Conditional_4_Conditional_19_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 67)(1, "strong", 68);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 69);
    i0.ɵɵlistener("click", function ReservaResultadoComponent_Conditional_4_Conditional_19_Conditional_11_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r11); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.copiarCodigo()); });
    i0.ɵɵconditionalCreate(4, ReservaResultadoComponent_Conditional_4_Conditional_19_Conditional_11_Conditional_4_Template, 1, 1, ":svg:svg", 64)(5, ReservaResultadoComponent_Conditional_4_Conditional_19_Conditional_11_Conditional_5_Template, 1, 1, ":svg:svg", 70);
    i0.ɵɵelementStart(6, "span", 71);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(8, ReservaResultadoComponent_Conditional_4_Conditional_19_Conditional_11_Conditional_8_Template, 2, 1, "p", 72);
    i0.ɵɵelementStart(9, "p", 61);
    i0.ɵɵtext(10, " Tambi\u00E9n lo encontr\u00E1s en ");
    i0.ɵɵelementStart(11, "a", 38);
    i0.ɵɵtext(12, "Mis reservas");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(13, ". ");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx.codigo);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.copiado() ? 4 : 5);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.copiado() ? "Copiado" : "Copiar c\u00F3digo");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.errorCopiar() ? 8 : -1);
} }
function ReservaResultadoComponent_Conditional_4_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 19)(1, "div", 57);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 58);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "div")(4, "h3", 59);
    i0.ɵɵtext(5, "Tu c\u00F3digo de ingreso");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(6, ReservaResultadoComponent_Conditional_4_Conditional_19_Conditional_6_Template, 2, 0, "p");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(7, ReservaResultadoComponent_Conditional_4_Conditional_19_Conditional_7_Template, 3, 1, "p", 60)(8, ReservaResultadoComponent_Conditional_4_Conditional_19_Conditional_8_Template, 2, 0, "p", 61)(9, ReservaResultadoComponent_Conditional_4_Conditional_19_Conditional_9_Template, 2, 0, "p", 62)(10, ReservaResultadoComponent_Conditional_4_Conditional_19_Conditional_10_Template, 5, 1, "div", 63)(11, ReservaResultadoComponent_Conditional_4_Conditional_19_Conditional_11_Template, 14, 4);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_7_0;
    const item_r8 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 32);
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(!ctx_r0.codigoValidado() && !item_r8.finalizada ? 6 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.codigoValidado() ? 7 : item_r8.finalizada ? 8 : ctx_r0.cargandoCodigo() ? 9 : ctx_r0.errorCodigo() ? 10 : (tmp_7_0 = ctx_r0.codigo()) ? 11 : -1, tmp_7_0);
} }
function ReservaResultadoComponent_Conditional_4_Conditional_33_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2, "Devoluci\u00F3n simulada");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "dd");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const devolucion_r12 = i0.ɵɵnextContext();
    i0.ɵɵnextContext();
    const monedaPago_r13 = i0.ɵɵreadContextLet(26);
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.monto(devolucion_r12.simulado, monedaPago_r13));
} }
function ReservaResultadoComponent_Conditional_4_Conditional_33_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2, "Total reembolsado");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "dd");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(5, ReservaResultadoComponent_Conditional_4_Conditional_33_Conditional_5_Template, 5, 1, "div");
    i0.ɵɵelementStart(6, "div")(7, "dt");
    i0.ɵɵtext(8, "Total sin devolver");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "dd", 73);
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const devolucion_r12 = ctx;
    i0.ɵɵnextContext();
    const monedaPago_r13 = i0.ɵɵreadContextLet(26);
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.monto(devolucion_r12.reembolsado, monedaPago_r13));
    i0.ɵɵadvance();
    i0.ɵɵconditional(devolucion_r12.simulado > 0 ? 5 : -1);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.monto(devolucion_r12.sinDevolver, monedaPago_r13));
} }
function ReservaResultadoComponent_Conditional_4_Conditional_49_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 22)(1, "dt");
    i0.ɵɵtext(2, "CUIT/CUIL del anunciante");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "dd");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx);
} }
function ReservaResultadoComponent_Conditional_4_Conditional_50_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 23)(1, "p");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "small");
    i0.ɵɵtext(10, "El cobro y la liquidaci\u00F3n se realizan en pesos con la conversi\u00F3n aceptada.");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const dolar_r14 = ctx;
    const item_r8 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("Publicado: ", ctx_r0.monto(item_r8.importe_origen ?? 0, item_r8.moneda_origen ?? "USD"), ".");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("Cambio aceptado: d\u00F3lar blue venta ", ctx_r0.monto(+dolar_r14.venta, "ARS", 6), " por USD.");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("Fuente: ", dolar_r14.proveedor, " \u00B7 Publicada ", ctx_r0.fechaHora(dolar_r14.actualizada_fuente_en), ".");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("Consultada ", ctx_r0.fechaHora(dolar_r14.consultada_en), " \u00B7 Aceptada ", ctx_r0.fechaHora(item_r8.cotizacion_aceptada_en), ".");
} }
function ReservaResultadoComponent_Conditional_4_Conditional_53_For_2_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 17);
    i0.ɵɵtext(1, "Ver perfil");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const parte_r15 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(1, _c1, parte_r15.id));
} }
function ReservaResultadoComponent_Conditional_4_Conditional_53_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "span", 52);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "h2");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(7, ReservaResultadoComponent_Conditional_4_Conditional_53_For_2_Conditional_7_Template, 2, 3, "a", 17);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const parte_r15 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(parte_r15.rol);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(parte_r15.nombre);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", parte_r15.email, " \u00B7 ", parte_r15.telefono);
    i0.ɵɵadvance();
    i0.ɵɵconditional(parte_r15.id ? 7 : -1);
} }
function ReservaResultadoComponent_Conditional_4_Conditional_53_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 25);
    i0.ɵɵrepeaterCreate(1, ReservaResultadoComponent_Conditional_4_Conditional_53_For_2_Template, 8, 5, "div", null, _forTrack1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.partes());
} }
function ReservaResultadoComponent_Conditional_4_Conditional_54_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "Esta cuenta fue dada de baja. Para otras gestiones, contact\u00E1 a soporte.");
    i0.ɵɵelementEnd();
} }
function ReservaResultadoComponent_Conditional_4_Conditional_54_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "Pod\u00E9s comunicarte con la otra persona por el chat de DEPA.");
    i0.ɵɵelementEnd();
} }
function ReservaResultadoComponent_Conditional_4_Conditional_54_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", ctx_r0.emailContacto(), " \u00B7 ", ctx_r0.telefonoContacto());
} }
function ReservaResultadoComponent_Conditional_4_Conditional_54_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    const _r17 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 77);
    i0.ɵɵlistener("click", function ReservaResultadoComponent_Conditional_4_Conditional_54_Conditional_12_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r17); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.abrirConfirmacionWhatsapp()); });
    i0.ɵɵtext(1, " Continuar por WhatsApp ");
    i0.ɵɵelementEnd();
} }
function ReservaResultadoComponent_Conditional_4_Conditional_54_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 76)(1, "strong");
    i0.ɵɵtext(2, "Te recomendamos conversar dentro de DEPA.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4, "Si continu\u00E1s por WhatsApp, la conversaci\u00F3n ocurre fuera de la plataforma. DEPA no podr\u00E1 revisar esos mensajes ni ayudarte con acuerdos o inconvenientes surgidos all\u00ED.");
    i0.ɵɵelementEnd()();
} }
function ReservaResultadoComponent_Conditional_4_Conditional_54_Template(rf, ctx) { if (rf & 1) {
    const _r16 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 26)(1, "div")(2, "span", 52);
    i0.ɵɵtext(3, "Comunicaci\u00F3n de la reserva");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "h2");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(6, ReservaResultadoComponent_Conditional_4_Conditional_54_Conditional_6_Template, 2, 0, "p")(7, ReservaResultadoComponent_Conditional_4_Conditional_54_Conditional_7_Template, 2, 0, "p")(8, ReservaResultadoComponent_Conditional_4_Conditional_54_Conditional_8_Template, 2, 2, "p");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "div", 74)(10, "button", 56);
    i0.ɵɵlistener("click", function ReservaResultadoComponent_Conditional_4_Conditional_54_Template_button_click_10_listener() { i0.ɵɵrestoreView(_r16); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.abrirChat()); });
    i0.ɵɵtext(11, " Mensaje por DEPA ");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(12, ReservaResultadoComponent_Conditional_4_Conditional_54_Conditional_12_Template, 2, 0, "button", 75);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(13, ReservaResultadoComponent_Conditional_4_Conditional_54_Conditional_13_Template, 5, 0, "div", 76);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1("Contact\u00E1 a ", ctx_r0.nombreContacto());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.contactoSuspendido() ? 6 : !ctx_r0.esInquilino() || ctx_r0.accesoLimitado() ? 7 : 8);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", !ctx_r0.contactoDisponible());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.whatsappUrl() ? 12 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.whatsappUrl() ? 13 : -1);
} }
function ReservaResultadoComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, ReservaResultadoComponent_Conditional_4_Conditional_0_Template, 3, 0, "section", 8);
    i0.ɵɵconditionalCreate(1, ReservaResultadoComponent_Conditional_4_Conditional_1_Template, 37, 9)(2, ReservaResultadoComponent_Conditional_4_Conditional_2_Template, 13, 10, "header", 9);
    i0.ɵɵconditionalCreate(3, ReservaResultadoComponent_Conditional_4_Conditional_3_Template, 2, 1, "p", 10);
    i0.ɵɵconditionalCreate(4, ReservaResultadoComponent_Conditional_4_Conditional_4_Template, 2, 1, "p", 11);
    i0.ɵɵelementStart(5, "div", 12)(6, "section", 13)(7, "div", 14)(8, "span");
    i0.ɵɵtext(9, "Datos de la estad\u00EDa");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "strong");
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "h2");
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "div", 15)(15, "p", 16);
    i0.ɵɵtext(16);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(17, ReservaResultadoComponent_Conditional_4_Conditional_17_Template, 2, 4, "a", 17);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(18, ReservaResultadoComponent_Conditional_4_Conditional_18_Template, 15, 2, "div", 18);
    i0.ɵɵconditionalCreate(19, ReservaResultadoComponent_Conditional_4_Conditional_19_Template, 12, 3, "section", 19);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "aside", 20)(21, "div", 14)(22, "span");
    i0.ɵɵtext(23, "Datos del pago");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "strong", 21);
    i0.ɵɵtext(25);
    i0.ɵɵelementEnd()();
    i0.ɵɵdeclareLet(26);
    i0.ɵɵelementStart(27, "dl")(28, "div")(29, "dt");
    i0.ɵɵtext(30);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(31, "dd");
    i0.ɵɵtext(32);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(33, ReservaResultadoComponent_Conditional_4_Conditional_33_Template, 11, 3);
    i0.ɵɵelementStart(34, "div")(35, "dt");
    i0.ɵɵtext(36, "Medio");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(37, "dd");
    i0.ɵɵtext(38);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(39, "div")(40, "dt");
    i0.ɵɵtext(41, "Operaci\u00F3n del pago");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(42, "dd");
    i0.ɵɵtext(43);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(44, "div")(45, "dt");
    i0.ɵɵtext(46, "Fecha del pago");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(47, "dd");
    i0.ɵɵtext(48);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(49, ReservaResultadoComponent_Conditional_4_Conditional_49_Template, 5, 1, "div", 22);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(50, ReservaResultadoComponent_Conditional_4_Conditional_50_Template, 11, 6, "div", 23);
    i0.ɵɵelementStart(51, "p", 24);
    i0.ɵɵtext(52, " El estado fue verificado directamente con Mercado Pago. DEPA no almacena los datos de tu tarjeta. ");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(53, ReservaResultadoComponent_Conditional_4_Conditional_53_Template, 3, 0, "section", 25)(54, ReservaResultadoComponent_Conditional_4_Conditional_54_Template, 14, 5, "section", 26);
} if (rf & 2) {
    let tmp_18_0;
    let tmp_22_0;
    let tmp_23_0;
    const item_r8 = ctx;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r0.esInquilino() && ctx_r0.conversacionesReembolso().length ? 0 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.puedeCambiarFechas() ? 1 : 2);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.errorVerificacion() && item_r8.estado_pago !== "APROBADO" ? 3 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.avisoReprogramacion() ? 4 : -1);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate2("", ctx_r0.cantidadDias(item_r8), " ", ctx_r0.cantidadDias(item_r8) === 1 ? "d\u00EDa" : "d\u00EDas");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r8.publicacion?.titulo ?? "Publicaci\u00F3n no disponible");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.direccion(item_r8));
    i0.ɵɵadvance();
    i0.ɵɵconditional(item_r8.publicacion ? 17 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!ctx_r0.puedeCambiarFechas() ? 18 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.mostrarCodigo() ? 19 : -1);
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(ctx_r0.estadoPagoMercado(item_r8));
    const datosPago_r18 = ctx_r0.pago();
    i0.ɵɵadvance();
    const monedaPago_r19 = i0.ɵɵstoreLet(datosPago_r18?.currency ?? item_r8.moneda_contratada ?? "ARS");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(datosPago_r18?.approved_at || datosPago_r18?.status === "approved" || datosPago_r18?.devolucion ? "Total pagado" : "Importe de la reserva");
    i0.ɵɵadvance();
    i0.ɵɵclassProp("total", !datosPago_r18?.devolucion);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.monto(datosPago_r18?.amount ?? item_r8.monto_pago, monedaPago_r19), " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_18_0 = datosPago_r18?.devolucion) ? 33 : -1, tmp_18_0);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.medioPago());
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.pago()?.payment_id ?? "Pendiente de asignaci\u00F3n");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.fechaHora(ctx_r0.pago()?.approved_at ?? ctx_r0.pago()?.created_at));
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_22_0 = ctx_r0.cuitAnunciante()) ? 49 : -1, tmp_22_0);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_23_0 = item_r8.cotizacion_dolar) ? 50 : -1, tmp_23_0);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r0.administracion ? 53 : item_r8.estado_pago === "APROBADO" ? 54 : -1);
} }
function ReservaResultadoComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r20 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 78);
    i0.ɵɵlistener("click", function ReservaResultadoComponent_Conditional_5_Template_div_click_0_listener() { i0.ɵɵrestoreView(_r20); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.confirmarSalida.set(false)); });
    i0.ɵɵelementStart(1, "section", 79);
    i0.ɵɵlistener("click", function ReservaResultadoComponent_Conditional_5_Template_section_click_1_listener($event) { return $event.stopPropagation(); });
    i0.ɵɵelementStart(2, "span", 80);
    i0.ɵɵtext(3, "\u2197");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "h2", 81);
    i0.ɵɵtext(5, "Vas a salir de DEPA");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p");
    i0.ɵɵtext(7, " La conversaci\u00F3n continuar\u00E1 en WhatsApp. DEPA no podr\u00E1 acceder a esos mensajes ni intervenir si surge un problema. ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "div", 82)(9, "button", 83);
    i0.ɵɵlistener("click", function ReservaResultadoComponent_Conditional_5_Template_button_click_9_listener() { i0.ɵɵrestoreView(_r20); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.confirmarSalida.set(false)); });
    i0.ɵɵtext(10, " Quedarme en DEPA ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "button", 77);
    i0.ɵɵlistener("click", function ReservaResultadoComponent_Conditional_5_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r20); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.continuarWhatsapp()); });
    i0.ɵɵtext(12, " Abrir WhatsApp ");
    i0.ɵɵelementEnd()()()();
} }
export class ReservaResultadoComponent {
    route = inject(ActivatedRoute);
    reservasApi = inject(ReservationService);
    auth = inject(AuthService);
    chat = inject(ChatService);
    destroyRef = inject(DestroyRef);
    http = inject(HttpClient);
    actividadReembolsos = inject(ActividadReembolsosService);
    conversacionesReembolso = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "conversacionesReembolso" }] : /* istanbul ignore next */ []));
    /** Enlace firmado del comprobante de la transferencia del reembolso. */
    urlComprobanteReembolso = (id) => () => this.http.get(`${environment.apiUrl}/reembolsos/${id}/comprobante`);
    conversacionAbierta = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "conversacionAbierta" }] : /* istanbul ignore next */ []));
    consultaResumen;
    cargando = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cargando" }] : /* istanbul ignore next */ []));
    error = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    errorVerificacion = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorVerificacion" }] : /* istanbul ignore next */ []));
    reintentandoPago = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reintentandoPago" }] : /* istanbul ignore next */ []));
    resumen = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resumen" }] : /* istanbul ignore next */ []));
    confirmarSalida = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "confirmarSalida" }] : /* istanbul ignore next */ []));
    codigo = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "codigo" }] : /* istanbul ignore next */ []));
    cargandoCodigo = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cargandoCodigo" }] : /* istanbul ignore next */ []));
    errorCodigo = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorCodigo" }] : /* istanbul ignore next */ []));
    copiado = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "copiado" }] : /* istanbul ignore next */ []));
    errorCopiar = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorCopiar" }] : /* istanbul ignore next */ []));
    reintentoCodigo = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reintentoCodigo" }] : /* istanbul ignore next */ []));
    imagenFallida = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "imagenFallida" }] : /* istanbul ignore next */ []));
    reprogramando = signal(this.route.snapshot.queryParamMap.get('reprogramar') === '1', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reprogramando" }] : /* istanbul ignore next */ []));
    avisoReprogramacion = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "avisoReprogramacion" }] : /* istanbul ignore next */ []));
    /**
     * El admin entra desde su panel (`/admin/reservas/:id`) y ve la reserva en solo lectura: sin código
     * de ingreso, contacto, cambio de fechas ni reintento de pago, y con las dos partes enlazadas a su perfil.
     */
    administracion = this.route.snapshot.data['administracion'] === true;
    /** Sección del panel de la que vino el admin, para volver a ella. */
    seccionOrigen = this.administracion ? seccionAdmin(this.route.snapshot.queryParamMap.get('desde')) : null;
    textoVolver = this.seccionOrigen ? `Volver a ${etiquetaSeccionAdmin(this.seccionOrigen)}` : 'Volver al panel';
    reserva = computed(() => this.resumen()?.reserva ?? null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reserva" }] : /* istanbul ignore next */ []));
    accesoLimitado = computed(() => this.auth.currentUser()?.accesoLimitado === true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "accesoLimitado" }] : /* istanbul ignore next */ []));
    pago = computed(() => this.resumen()?.pago ?? null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pago" }] : /* istanbul ignore next */ []));
    esInquilino = computed(() => this.reserva()?.usuario?.id === Number(this.auth.currentUser()?.sub), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "esInquilino" }] : /* istanbul ignore next */ []));
    reservaConversacionId = computed(() => this.esInquilino() ? this.reserva()?.id : undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reservaConversacionId" }] : /* istanbul ignore next */ []));
    devolucionPendiente = computed(() => {
        const id = this.reservaConversacionId();
        return id !== undefined && this.actividadReembolsos.pendientes().has(id);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "devolucionPendiente" }] : /* istanbul ignore next */ []));
    puedeCambiarFechas = computed(() => {
        const reserva = this.reserva();
        return !!reserva && this.esInquilino() && !this.devolucionPendiente() && puedeReprogramar(reserva);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "puedeCambiarFechas" }] : /* istanbul ignore next */ []));
    mostrarCodigo = computed(() => {
        const reserva = this.reserva();
        return this.esInquilino() && !this.devolucionPendiente() && !!reserva &&
            (puedeConsultarCodigo(reserva) || reserva.estado_estadia === 'EN_CURSO');
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mostrarCodigo" }] : /* istanbul ignore next */ []));
    codigoValidado = computed(() => Boolean(this.reserva()?.codigo_validado_en || this.codigo()?.validado_en), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "codigoValidado" }] : /* istanbul ignore next */ []));
    contactoSuspendido = computed(() => {
        const reserva = this.reserva();
        const otro = this.esInquilino()
            ? reserva?.publicacion?.anunciante?.usuario : reserva?.usuario;
        return otro?.activa === false;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "contactoSuspendido" }] : /* istanbul ignore next */ []));
    contactoDisponible = computed(() => {
        const reserva = this.reserva();
        return (!this.contactoSuspendido() &&
            reserva?.estado_pago === 'APROBADO' && !reserva.cancelada && Boolean(this.otroUsuarioId()));
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "contactoDisponible" }] : /* istanbul ignore next */ []));
    whatsappUrl = computed(() => {
        const reserva = this.reserva();
        if (!reserva || !this.esInquilino() || this.accesoLimitado() || this.contactoSuspendido())
            return null;
        const telefono = reserva.publicacion?.anunciante?.numero_contacto ??
            reserva.publicacion?.anunciante?.usuario?.telefono;
        const digits = telefono?.replace(/\D/g, '');
        if (!digits)
            return null;
        const mensaje = `Hola, te contacto por la reserva #${reserva.id} de ${reserva.publicacion?.titulo ?? 'la propiedad'}.`;
        return `https://wa.me/${digits}?text=${encodeURIComponent(mensaje)}`;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "whatsappUrl" }] : /* istanbul ignore next */ []));
    constructor() {
        effect(onCleanup => {
            const id = this.reservaConversacionId();
            if (!id)
                return;
            const consulta = timer(0, 10000).pipe(exhaustMap(() => this.http.get(`${environment.apiUrl}/reembolsos/reserva/${id}/conversaciones`).pipe(catchError(() => EMPTY)))).subscribe(conversaciones => this.conversacionesReembolso.set(conversaciones));
            onCleanup(() => {
                consulta.unsubscribe();
                this.conversacionesReembolso.set([]);
            });
        });
        effect((onCleanup) => {
            const reserva = this.reserva();
            const mostrarCodigo = this.mostrarCodigo();
            this.reintentoCodigo();
            this.codigo.set(null);
            this.errorCodigo.set('');
            this.errorCopiar.set('');
            this.copiado.set(false);
            this.cargandoCodigo.set(false);
            if (!mostrarCodigo || !reserva || reserva.codigo_validado_en || reserva.finalizada)
                return;
            this.cargandoCodigo.set(true);
            const solicitud = this.reservasApi.lodgingCode(reserva.id).subscribe({
                next: (codigo) => {
                    this.codigo.set(codigo);
                    this.cargandoCodigo.set(false);
                },
                error: () => {
                    this.errorCodigo.set('No pudimos cargar tu código de ingreso. Intentá nuevamente.');
                    this.cargandoCodigo.set(false);
                },
            });
            onCleanup(() => solicitud.unsubscribe());
        });
        const idReserva = this.obtenerIdReserva();
        if (!idReserva) {
            this.error.set('No pudimos identificar la reserva asociada al pago.');
            this.cargando.set(false);
            return;
        }
        let reservaActual = idReserva;
        this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
            const chatId = Number(params.get('reembolso'));
            this.conversacionAbierta.set(chatId > 0 ? chatId : null);
            const nueva = this.obtenerIdReserva();
            if (nueva && nueva !== reservaActual) {
                reservaActual = nueva;
                this.resumen.set(null);
                this.cargando.set(true);
                this.reprogramando.set(params.get('reprogramar') === '1');
                this.cargarResumen(nueva);
            }
        });
        const paymentResult = this.route.snapshot.queryParamMap.get('payment');
        activarActualizacionReservas(() => {
            if (!this.cargando() && !(this.reprogramando() && this.puedeCambiarFechas())) {
                this.cargarResumen(reservaActual, true);
            }
        });
        const paymentId = this.route.snapshot.queryParamMap.get('payment_id') ??
            this.route.snapshot.queryParamMap.get('collection_id');
        if (paymentResult && paymentId && /^\d+$/.test(paymentId)) {
            this.reservasApi.reconcilePayment(paymentId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                next: () => this.cargarResumen(idReserva),
                error: () => {
                    this.errorVerificacion.set('No pudimos verificar el pago al volver de Mercado Pago. Volvé a cargar esta página para reintentar la verificación.');
                    this.cargarResumen(idReserva);
                },
            });
            return;
        }
        this.cargarResumen(idReserva);
    }
    reintentarPago(idReserva) {
        if (this.reintentandoPago())
            return;
        this.reintentandoPago.set(true);
        this.errorVerificacion.set('');
        this.reservasApi.retryCheckout(idReserva).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: ({ checkout_url }) => window.location.assign(checkout_url),
            error: () => {
                this.reintentandoPago.set(false);
                this.errorVerificacion.set('No pudimos volver a abrir el pago. Revisá el estado de la reserva e intentá nuevamente si sigue disponible.');
                this.cargarResumen(idReserva, true);
            },
        });
    }
    abrirReprogramacion() {
        if (!this.puedeCambiarFechas() || this.reprogramando())
            return;
        this.consultaResumen?.unsubscribe();
        this.avisoReprogramacion.set('');
        this.reprogramando.set(true);
    }
    guardarReprogramacion(actualizada) {
        this.consultaResumen?.unsubscribe();
        this.resumen.update((resumen) => resumen ? { ...resumen, reserva: actualizada } : null);
        this.reprogramando.set(false);
        const cambios = actualizada.reprogramaciones ?? [];
        const ultimo = cambios.reduce((mayor, cambio) => !mayor || cambio.id > mayor.id ? cambio : mayor, undefined);
        this.avisoReprogramacion.set(ultimo && !ultimo.notificada_en
            ? 'Fechas actualizadas. El aviso al anunciante está pendiente. Podés reintentarlo en Mis reservas.'
            : 'Fechas actualizadas. Se mantuvieron la duración y el total pagado.');
    }
    reintentarCodigo() {
        this.reintentoCodigo.update((intento) => intento + 1);
    }
    async copiarCodigo() {
        const codigo = this.codigo()?.codigo;
        if (!codigo || !this.mostrarCodigo() || this.codigoValidado())
            return;
        this.errorCopiar.set('');
        this.copiado.set(false);
        try {
            await navigator.clipboard.writeText(codigo);
            this.copiado.set(true);
        }
        catch {
            this.errorCopiar.set('No pudimos copiarlo. Podés seleccionar el código y copiarlo manualmente.');
        }
    }
    abrirChat() {
        const reserva = this.reserva();
        const idOtroUsuario = this.otroUsuarioId();
        if (!reserva?.publicacion || !idOtroUsuario || !this.contactoDisponible())
            return;
        this.chat.abrir({
            idPublicacion: reserva.publicacion.id,
            idOtroUsuario,
            titulo: reserva.publicacion.titulo,
            nombreOtro: this.nombreContacto(),
            fotoOtro: this.esInquilino()
                ? (reserva.publicacion.anunciante?.usuario?.foto_url ?? null)
                : (reserva.usuario?.foto_url ?? null),
        });
    }
    abrirConfirmacionWhatsapp() {
        if (this.whatsappUrl())
            this.confirmarSalida.set(true);
    }
    continuarWhatsapp() {
        const url = this.whatsappUrl();
        if (url)
            window.open(url, '_blank', 'noopener,noreferrer');
        this.confirmarSalida.set(false);
    }
    nombreContacto() {
        return this.reserva() ? this.parte(this.ladoContacto()).nombre : 'Contacto';
    }
    emailContacto() {
        return this.reserva() ? this.parte(this.ladoContacto()).email : 'No informado';
    }
    telefonoContacto() {
        return this.reserva() ? this.parte(this.ladoContacto()).telefono : 'No informado';
    }
    /** El admin ve a las dos partes, cada una con enlace a su perfil. */
    partes = computed(() => this.reserva()
        ? [{ rol: 'Inquilino', ...this.parte('inquilino') }, { rol: 'Anunciante', ...this.parte('anunciante') }]
        : [], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "partes" }] : /* istanbul ignore next */ []));
    /** La otra parte de la reserva: el inquilino contacta al anunciante y viceversa. */
    ladoContacto() {
        return this.esInquilino() ? 'anunciante' : 'inquilino';
    }
    /** Datos de una de las partes. RN-37: si el anunciante se dio de baja, se muestra el email que tenía (histórico). */
    parte(lado) {
        const reserva = this.reserva();
        if (lado === 'anunciante') {
            const anunciante = reserva?.publicacion?.anunciante;
            const usuario = anunciante?.usuario;
            return {
                id: usuario?.id ?? null,
                nombre: usuario ? `${usuario.nombre} ${usuario.apellido}`.trim() : 'Anfitrión',
                email: usuario?.email ?? usuario?.email_historico ?? 'No informado',
                telefono: anunciante?.numero_contacto ?? usuario?.telefono ?? 'No informado',
            };
        }
        return {
            id: reserva?.usuario?.id ?? null,
            nombre: [reserva?.usuario_nombre ?? reserva?.usuario?.nombre, reserva?.usuario_apellido ?? reserva?.usuario?.apellido]
                .filter(Boolean).join(' ') || 'Huésped',
            email: reserva?.usuario_email ?? reserva?.usuario?.email ?? 'No informado',
            telefono: reserva?.usuario_telefono ?? reserva?.usuario?.telefono ?? 'No informado',
        };
    }
    /**
     * CUIT/CUIL del anunciante para el comprobante del Inquilino (y para el admin). Si el anunciante
     * se dio de baja, el histórico lo sigue identificando (RN-37).
     */
    cuitAnunciante() {
        const anunciante = this.reserva()?.publicacion?.anunciante;
        if (!(this.esInquilino() || this.administracion) || !anunciante)
            return null;
        return anunciante.cuit_cuil ?? anunciante.cuit_cuil_historico ?? null;
    }
    tituloEstado(reserva) {
        if (this.devolucionPendiente())
            return 'Devolución pendiente';
        const devolucion = devolucionRegistrada(reserva);
        if (reserva.cancelada && devolucion)
            return devolucion.etiqueta;
        if (reserva.cancelada && reserva.estado_pago === 'APROBADO' && reserva.estado_liquidacion === 'EN_REVISION')
            return 'Pago acreditado, reserva en revisión';
        if (reserva.estado_estadia === 'CONFIRMADA')
            return 'Reserva confirmada';
        return etiquetasEstadia[reserva.estado_estadia];
    }
    descripcionEstado(reserva) {
        if (this.devolucionPendiente())
            return 'Tu devolución está en gestión. Si se realiza por transferencia, podés coordinarla en la conversación con administración.';
        const devolucion = devolucionRegistrada(reserva);
        if (devolucion)
            return devolucion.mensaje;
        if (reserva.estado_pago === 'PENDIENTE' && this.resumen()?.puede_reintentar)
            return this.pago()?.status === 'rejected' || this.pago()?.status === 'cancelled'
                ? 'El intento de pago no se completó. Podés volver a Mercado Pago mientras las fechas sigan reservadas.'
                : 'Podés completar el pago en Mercado Pago mientras las fechas sigan reservadas.';
        if (reserva.cancelada && reserva.estado_pago === 'APROBADO' && reserva.estado_liquidacion === 'EN_REVISION')
            return 'Recibimos el pago. La estadía no quedó confirmada y el equipo debe revisar la operación.';
        const descripciones = {
            PENDIENTE_INGRESO: 'La estadía comenzó. El propietario todavía no validó el código de alojamiento.',
            EN_CURSO: 'El ingreso fue validado y la estadía está en curso.',
            FINALIZADA: 'La estadía finalizó. Podés consultar sus datos y el comprobante del pago.',
            INGRESO_NO_VERIFICADO: 'El período de la estadía terminó sin un código de ingreso validado. Podés reportar un problema si necesitás revisión.',
            FECHAS_A_REVISAR: 'Esta reserva no tiene un período válido registrado. Contactá a soporte para revisarla.',
            CANCELADA: 'La reserva fue cancelada.',
            EN_DISPUTA: 'Mercado Pago abrió un contracargo. La liquidación queda congelada hasta que se resuelva.',
        };
        const descripcion = descripciones[reserva.estado_estadia];
        if (descripcion)
            return descripcion;
        if (reserva.estado_pago === 'APROBADO')
            return 'El pago fue acreditado y las fechas quedaron reservadas.';
        if (reserva.estado_pago === 'PENDIENTE')
            return 'Mercado Pago todavía está procesando la operación. Podés volver a consultar esta pantalla.';
        if (reserva.estado_pago === 'REEMBOLSADO')
            return 'Mercado Pago informó la devolución de la operación.';
        return 'Las fechas no quedaron confirmadas. Revisá el estado del pago antes de volver a intentarlo.';
    }
    estadoPagoMercado(reserva) {
        const pago = this.pago();
        const status = pago?.status;
        if (pago?.devolucion && status !== 'charged_back') {
            const { reembolsado, simulado, sinDevolver } = pago.devolucion;
            if (reembolsado > 0)
                return sinDevolver === 0 ? 'Reembolsado' : 'Reembolsado parcialmente';
            if (simulado > 0)
                return 'Devolución simulada';
        }
        if (status === 'approved' && reserva.estado_liquidacion === 'DEVUELTO_PARCIAL_INQUILINO')
            return 'Reembolsado parcialmente';
        const labels = {
            approved: 'Acreditado',
            pending: 'Pendiente',
            in_process: 'En revisión',
            rejected: 'Rechazado',
            cancelled: 'Cancelado',
            refunded: 'Reembolsado',
            charged_back: 'Contracargo',
        };
        return status ? (labels[status] ?? status) : 'Sin información';
    }
    medioPago() {
        const medio = this.pago()?.payment_method_id;
        if (!medio)
            return 'Mercado Pago';
        const labels = {
            visa: 'Visa',
            master: 'Mastercard',
            amex: 'American Express',
            debvisa: 'Visa Débito',
            debmaster: 'Mastercard Débito',
            account_money: 'Dinero en cuenta',
        };
        return labels[medio] ?? medio;
    }
    direccion(reserva) {
        return ([
            reserva.publicacion?.direccion,
            reserva.publicacion?.ciudad?.nombre,
            reserva.publicacion?.provincia?.nombre,
        ]
            .filter(Boolean)
            .join(', ') || 'Ubicación no informada');
    }
    cantidadDias(reserva) {
        if (!reserva.fecha_inicio || !reserva.fecha_fin)
            return 0;
        return (Math.floor((this.fechaLocal(reserva.fecha_fin).getTime() -
            this.fechaLocal(reserva.fecha_inicio).getTime()) /
            86400000) + 1);
    }
    fecha(valor) {
        return valor
            ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(this.fechaLocal(valor))
            : '—';
    }
    fechaHora(valor) {
        return valor
            ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(valor))
            : '—';
    }
    monto(valor, moneda = 'ARS', decimales = 2) {
        return Number(valor ?? 0).toLocaleString('es-AR', {
            style: 'currency',
            currency: moneda,
            maximumFractionDigits: decimales,
        });
    }
    cargarResumen(idReserva, silenciosa = false) {
        this.consultaResumen?.unsubscribe();
        this.consultaResumen = this.reservasApi.summary(idReserva).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (resumen) => {
                this.resumen.set(resumen);
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
    obtenerIdReserva() {
        if (this.administracion) {
            const id = Number(this.route.snapshot.paramMap.get('id'));
            return Number.isInteger(id) && id > 0 ? id : null;
        }
        const directo = Number(this.route.snapshot.queryParamMap.get('reserva_id'));
        if (Number.isInteger(directo) && directo > 0)
            return directo;
        const referencia = this.route.snapshot.queryParamMap.get('external_reference');
        const desdeReferencia = Number(referencia?.startsWith('reserva:') ? referencia.slice(8) : NaN);
        if (Number.isInteger(desdeReferencia) && desdeReferencia > 0)
            return desdeReferencia;
        try {
            const guardado = Number(sessionStorage.getItem('depa:ultima-reserva'));
            return Number.isInteger(guardado) && guardado > 0 ? guardado : null;
        }
        catch {
            return null;
        }
    }
    otroUsuarioId() {
        const reserva = this.reserva();
        if (!reserva)
            return null;
        return this.esInquilino()
            ? (reserva.publicacion?.anunciante?.usuario?.id ?? null)
            : (reserva.usuario?.id ?? null);
    }
    fechaLocal(valor) {
        return new Date(`${valor.slice(0, 10)}T12:00:00`);
    }
    static ɵfac = function ReservaResultadoComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ReservaResultadoComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ReservaResultadoComponent, selectors: [["app-reserva-resultado"]], decls: 6, vars: 2, consts: [[1, "receipt-page"], [1, "receipt-wrap"], [1, "receipt-state"], [1, "receipt-card", "receipt-error"], [1, "modal-backdrop"], [1, "status-icon"], ["routerLink", "/admin", 1, "acct-btn", "acct-btn--primary", 3, "fragment"], ["routerLink", "/mis-reservas", 1, "acct-btn", "acct-btn--primary"], ["aria-label", "Transferencias de reembolsos", 1, "receipt-card", "refund-threads"], [1, "receipt-hero", 3, "is-approved", "is-pending"], ["role", "alert", 1, "receipt-card", "reservation-notice"], ["role", "status", 1, "receipt-card", "reservation-notice"], [1, "receipt-grid"], [1, "receipt-card", "stay-card"], [1, "section-title"], [1, "stay-location"], [1, "address"], [1, "text-link", 3, "routerLink"], [1, "date-grid"], ["aria-labelledby", "entry-code-title", 1, "entry-code"], [1, "receipt-card", "payment-card"], [1, "payment-status"], [1, "payment-card__tax-id"], [1, "conversion-detail"], [1, "secure-note"], ["aria-label", "Partes de la reserva", 1, "receipt-card", "admin-parties"], [1, "receipt-card", "contact-card"], [1, "refund-threads__head"], [1, "refund-threads__icon"], ["lucideLandmark", "", "aria-hidden", "true", 3, "size"], ["type", "button", 1, "acct-btn", 3, "click"], ["lucideChevronDown", "", "aria-hidden", "true", 3, "size"], [3, "reembolsoId", "vistaInquilino"], [1, "refund-threads__receipt"], [3, "obtenerUrl", "etiqueta"], [1, "refund-threads__detail"], [1, "refund-threads__detail", "refund-threads__note"], ["aria-label", "Ubicaci\u00F3n", 1, "reservation-breadcrumb"], ["routerLink", "/mis-reservas"], ["aria-hidden", "true"], [1, "reservation-heading"], ["type", "button", 1, "acct-btn", "change-dates", 3, "click"], ["lucideCalendar", "", "aria-hidden", "true", 3, "size"], [1, "receipt-card", "reservation-summary"], [1, "reservation-summary__stay"], [1, "reservation-confirmed"], [1, "reservation-summary__total"], [3, "reserva"], ["alt", "", 3, "src"], ["alt", "", 3, "error", "src"], [3, "cancelar", "guardada", "reserva"], [1, "receipt-hero"], [1, "eyebrow"], ["type", "button", 1, "acct-btn", "acct-btn--primary", 3, "disabled"], ["routerLink", "/admin", 1, "acct-btn", "acct-btn--ghost", 3, "fragment"], ["routerLink", "/mis-reservas", 1, "acct-btn", "acct-btn--ghost"], ["type", "button", 1, "acct-btn", "acct-btn--primary", 3, "click", "disabled"], [1, "entry-code__heading"], ["lucideKeyRound", "", "aria-hidden", "true", 3, "size"], ["id", "entry-code-title"], ["role", "status", 1, "entry-code__validated"], [1, "entry-code__note"], ["role", "status", 1, "entry-code__note"], [1, "entry-code__error"], ["lucideCheck", "", "aria-hidden", "true", 3, "size"], ["role", "alert"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", "acct-btn--sm", 3, "click"], [1, "entry-code__value"], ["aria-label", "C\u00F3digo de ingreso", 1, "entry-code__text"], ["type", "button", 1, "acct-btn", "acct-btn--primary", 3, "click"], ["lucideCopy", "", "aria-hidden", "true", 3, "size"], ["aria-live", "polite"], ["role", "alert", 1, "entry-code__copy-error"], [1, "total"], [1, "contact-actions"], ["type", "button", 1, "acct-btn", "whatsapp-btn"], [1, "safety-notice"], ["type", "button", 1, "acct-btn", "whatsapp-btn", 3, "click"], [1, "modal-backdrop", 3, "click"], ["role", "dialog", "aria-modal", "true", "aria-labelledby", "exit-title", 1, "exit-modal", 3, "click"], [1, "exit-icon"], ["id", "exit-title"], [1, "exit-actions"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", 3, "click"]], template: function ReservaResultadoComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "main", 0)(1, "div", 1);
            i0.ɵɵconditionalCreate(2, ReservaResultadoComponent_Conditional_2_Template, 4, 1, "div", 2)(3, ReservaResultadoComponent_Conditional_3_Template, 9, 2, "section", 3)(4, ReservaResultadoComponent_Conditional_4_Template, 55, 24);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(5, ReservaResultadoComponent_Conditional_5_Template, 13, 0, "div", 4);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_0_0;
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.cargando() ? 2 : ctx.error() ? 3 : (tmp_0_0 = ctx.reserva()) ? 4 : -1, tmp_0_0);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.confirmarSalida() ? 5 : -1);
        } }, dependencies: [RouterLink, SpinnerComponent, LucideKeyRound, LucideCopy, LucideCheck, LucideCalendar, LucideChevronDown, LucideLandmark, ReservaReprogramacionComponent, ReembolsoChatComponent, VerComprobanteComponent], styles: [".receipt-page[_ngcontent-%COMP%] {\r\n  min-height: calc(100dvh - 70px);\r\n  padding: 2rem 1rem 4rem;\r\n  background: linear-gradient(180deg, #f8fafc 0, #f5f6f8 45%);\r\n}\r\n.receipt-wrap[_ngcontent-%COMP%] {\r\n  grid-template-columns: minmax(0, 1fr);\r\n  max-width: 1040px;\r\n  margin: 0 auto;\r\n  display: grid;\r\n  gap: 1.2rem;\r\n}\r\n.receipt-state[_ngcontent-%COMP%] {\r\n  min-height: 55vh;\r\n  display: grid;\r\n  place-content: center;\r\n  justify-items: center;\r\n  gap: 0.8rem;\r\n  color: var(--%NS%color-text-muted);\r\n}\r\n.receipt-card[_ngcontent-%COMP%], \r\n.receipt-hero[_ngcontent-%COMP%] {\r\n  min-width: 0;\r\n  overflow-wrap: anywhere;\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: 18px;\r\n  background: #fff;\r\n  box-shadow: var(--%NS%shadow-card);\r\n}\r\n.receipt-hero[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  grid-template-columns: auto 1fr auto;\r\n  align-items: center;\r\n  gap: 1.2rem;\r\n  padding: 1.6rem;\r\n  border-top: 5px solid var(--%NS%color-primary);\r\n}\r\n.receipt-hero.is-approved[_ngcontent-%COMP%] {\r\n  border-top-color: var(--%NS%color-success);\r\n  background: linear-gradient(135deg, #fff 65%, #f0fdf4);\r\n}\r\n.receipt-hero.is-pending[_ngcontent-%COMP%] {\r\n  border-top-color: var(--%NS%color-accent);\r\n  background: linear-gradient(135deg, #fff 65%, #fff8eb);\r\n}\r\n.status-icon[_ngcontent-%COMP%] {\r\n  width: 54px;\r\n  height: 54px;\r\n  display: grid;\r\n  place-items: center;\r\n  border-radius: 50%;\r\n  background: var(--%NS%color-primary-light);\r\n  color: var(--%NS%color-primary);\r\n  font-size: 1.6rem;\r\n  font-weight: 900;\r\n}\r\n.is-approved[_ngcontent-%COMP%]   .status-icon[_ngcontent-%COMP%] {\r\n  background: #dcfce7;\r\n  color: #15803d;\r\n}\r\n.is-pending[_ngcontent-%COMP%]   .status-icon[_ngcontent-%COMP%] {\r\n  background: #ffedd5;\r\n  color: #c2410c;\r\n}\r\n.eyebrow[_ngcontent-%COMP%] {\r\n  display: block;\r\n  margin-bottom: 0.3rem;\r\n  color: var(--%NS%color-text-muted);\r\n  font-size: 0.76rem;\r\n  font-weight: 800;\r\n  letter-spacing: 0.08em;\r\n  text-transform: uppercase;\r\n}\r\n.receipt-hero[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%], \r\n.contact-card[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\r\n  margin: 0;\r\n}\r\n.receipt-hero[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], \r\n.contact-card[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\r\n  margin: 0.35rem 0 0;\r\n  color: var(--%NS%color-text-muted);\r\n}\r\n.receipt-grid[_ngcontent-%COMP%] {\r\n  min-width: 0;\r\n  display: grid;\r\n  grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.75fr);\r\n  gap: 1.2rem;\r\n}\r\n.receipt-card[_ngcontent-%COMP%] {\r\n  padding: 1.5rem;\r\n}\r\n.section-title[_ngcontent-%COMP%] {\r\n  flex-wrap: wrap;\r\n  display: flex;\r\n  justify-content: space-between;\r\n  gap: 1rem;\r\n  align-items: center;\r\n  margin-bottom: 1rem;\r\n  color: var(--%NS%color-text-muted);\r\n  font-size: 0.8rem;\r\n  font-weight: 700;\r\n  text-transform: uppercase;\r\n  letter-spacing: 0.05em;\r\n}\r\n.section-title[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\r\n  color: var(--%NS%color-secondary);\r\n}\r\n.stay-card[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\r\n  margin: 0 0 0.3rem;\r\n  font-size: 1.35rem;\r\n}\r\n.address[_ngcontent-%COMP%] {\r\n  margin: 0;\r\n  color: var(--%NS%color-text-muted);\r\n}\r\n.stay-location[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  flex-wrap: wrap;\r\n  align-items: baseline;\r\n  gap: 0.3rem 0.75rem;\r\n}\r\n.stay-location[_ngcontent-%COMP%]   .text-link[_ngcontent-%COMP%] {\r\n  white-space: nowrap;\r\n  font-size: 0.9rem;\r\n}\r\n.entry-code[_ngcontent-%COMP%] {\r\n  margin-top: 1rem;\r\n  padding: 1.2rem;\r\n  border: 1px solid #fdba74;\r\n  border-radius: 12px;\r\n  background: #fff7ed;\r\n}\r\n.entry-code__heading[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.8rem;\r\n}\r\n.entry-code__heading[_ngcontent-%COMP%]    > svg[_ngcontent-%COMP%] {\r\n  flex-shrink: 0;\r\n  color: #f58a00;\r\n}\r\n.entry-code__heading[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\r\n  margin: 0;\r\n  color: var(--%NS%color-text);\r\n  font-size: 1.05rem;\r\n  font-weight: 800;\r\n}\r\n.entry-code__heading[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\r\n  margin: 0.2rem 0 0;\r\n  color: var(--%NS%color-text-muted);\r\n  font-size: 0.85rem;\r\n  line-height: 1.45;\r\n}\r\n.entry-code__value[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  flex-wrap: wrap;\r\n  gap: 0.75rem;\r\n  margin-top: 0.8rem;\r\n}\r\n.entry-code__text[_ngcontent-%COMP%] {\r\n  min-width: 0;\r\n  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r\n  font-size: clamp(1.65rem, 3vw, 2.3rem);\r\n  line-height: 1.25;\r\n  letter-spacing: 0.1em;\r\n  color: #101828;\r\n  user-select: all;\r\n}\r\n.entry-code__value[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\r\n  flex-shrink: 0;\r\n}\r\n.entry-code__note[_ngcontent-%COMP%] {\r\n  margin: 0.6rem 0 0;\r\n  color: var(--%NS%color-text-muted);\r\n  font-size: 0.8rem;\r\n  line-height: 1.45;\r\n}\r\n.entry-code__note[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] {\r\n  color: var(--%NS%color-secondary);\r\n  text-decoration: underline;\r\n  text-underline-offset: 2px;\r\n}\r\n.entry-code__validated[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.4rem;\r\n  margin: 0.8rem 0 0;\r\n  color: #15803d;\r\n  font-size: 0.85rem;\r\n}\r\n.entry-code__validated[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\r\n  flex-shrink: 0;\r\n}\r\n.entry-code__error[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  flex-wrap: wrap;\r\n  align-items: center;\r\n  gap: 0.6rem;\r\n  margin-top: 0.6rem;\r\n}\r\n.entry-code__error[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], \r\n.entry-code__copy-error[_ngcontent-%COMP%] {\r\n  margin: 0;\r\n  color: #b42318;\r\n  font-size: 0.8rem;\r\n  line-height: 1.45;\r\n}\r\n.entry-code__copy-error[_ngcontent-%COMP%] {\r\n  margin-top: 0.6rem;\r\n}\r\n.date-grid[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  grid-template-columns: 1fr 1fr;\r\n  gap: 1rem;\r\n  margin: 1.4rem 0;\r\n}\r\n.date-grid[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  gap: 0.25rem;\r\n  padding: 1rem;\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: 12px;\r\n}\r\n.date-grid[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], \r\n.date-grid[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] {\r\n  color: var(--%NS%color-text-muted);\r\n  font-size: 0.78rem;\r\n}\r\n.date-grid[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\r\n  font-size: 0.95rem;\r\n}\r\n.text-link[_ngcontent-%COMP%] {\r\n  color: var(--%NS%color-secondary);\r\n  font-weight: 700;\r\n  text-decoration: none;\r\n}\r\n.payment-card[_ngcontent-%COMP%]   dl[_ngcontent-%COMP%] {\r\n  margin: 0;\r\n}\r\n.payment-card[_ngcontent-%COMP%]   dl[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: flex-start;\r\n  justify-content: space-between;\r\n  gap: 1rem;\r\n  padding: 0.75rem 0;\r\n  border-bottom: 1px solid var(--%NS%color-border);\r\n}\r\n.payment-card[_ngcontent-%COMP%]   dt[_ngcontent-%COMP%] {\r\n  color: var(--%NS%color-text-muted);\r\n}\r\n.payment-card[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%] {\r\n  margin: 0;\r\n  max-width: 60%;\r\n  text-align: right;\r\n  font-weight: 700;\r\n  overflow-wrap: anywhere;\r\n}\r\n.payment-card[_ngcontent-%COMP%]   dl[_ngcontent-%COMP%]   .payment-card__tax-id[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  grid-template-columns: minmax(0, 1fr) max-content;\r\n}\r\n.payment-card__tax-id[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%] {\r\n  max-width: none;\r\n  white-space: nowrap;\r\n}\r\n.payment-card[_ngcontent-%COMP%]   .total[_ngcontent-%COMP%] {\r\n  color: var(--%NS%color-primary);\r\n  font-size: 1.2rem;\r\n}\r\n.payment-status[_ngcontent-%COMP%] {\r\n  padding: 0.25rem 0.55rem;\r\n  border-radius: 999px;\r\n  background: #dcfce7;\r\n  color: #15803d !important;\r\n}\r\n.secure-note[_ngcontent-%COMP%] {\r\n  margin: 1rem 0 0;\r\n  padding: 0.8rem;\r\n  border-radius: 9px;\r\n  background: #f8fafc;\r\n  color: var(--%NS%color-text-muted);\r\n  font-size: 0.78rem;\r\n  line-height: 1.45;\r\n}\r\n.contact-card[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  grid-template-columns: 1fr auto;\r\n  align-items: center;\r\n  gap: 1.2rem;\r\n}\r\n\r\n.admin-parties[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));\r\n  gap: 1.2rem;\r\n}\r\n.admin-parties[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] { min-width: 0; overflow-wrap: anywhere; }\r\n.admin-parties[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 0; }\r\n.admin-parties[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0.35rem 0; color: var(--%NS%color-text-muted); }\r\n.contact-actions[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  gap: 0.7rem;\r\n  flex-wrap: wrap;\r\n  justify-content: flex-end;\r\n}\r\n.whatsapp-btn[_ngcontent-%COMP%] {\r\n  background: #128c4b;\r\n  color: #fff;\r\n}\r\n.whatsapp-btn[_ngcontent-%COMP%]:hover:not(:disabled) {\r\n  background: #0b713b;\r\n  transform: translateY(-1px);\r\n}\r\n.safety-notice[_ngcontent-%COMP%] {\r\n  grid-column: 1 / -1;\r\n  display: grid;\r\n  gap: 0.2rem;\r\n  padding: 1rem;\r\n  border-radius: 10px;\r\n  border: 1px solid #fed7aa;\r\n  background: #fff7ed;\r\n  color: #9a3412;\r\n  font-size: 0.83rem;\r\n  line-height: 1.45;\r\n}\r\n.receipt-error[_ngcontent-%COMP%] {\r\n  max-width: 620px;\r\n  margin: 8vh auto;\r\n  text-align: center;\r\n}\r\n.receipt-error[_ngcontent-%COMP%]   .status-icon[_ngcontent-%COMP%] {\r\n  margin: 0 auto;\r\n}\r\n.receipt-error[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\r\n  margin: 1rem 0 0.5rem;\r\n}\r\n.receipt-error[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\r\n  color: var(--%NS%color-text-muted);\r\n}\r\n.modal-backdrop[_ngcontent-%COMP%] {\r\n  position: fixed;\r\n  inset: 0;\r\n  z-index: 100;\r\n  display: grid;\r\n  place-items: center;\r\n  padding: 1rem;\r\n  background: rgba(15, 23, 42, 0.58);\r\n  backdrop-filter: blur(3px);\r\n}\r\n.exit-modal[_ngcontent-%COMP%] {\r\n  width: min(100%, 480px);\r\n  padding: 1.7rem;\r\n  border-radius: 18px;\r\n  background: #fff;\r\n  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.28);\r\n  text-align: center;\r\n}\r\n.exit-icon[_ngcontent-%COMP%] {\r\n  width: 54px;\r\n  height: 54px;\r\n  display: grid;\r\n  place-items: center;\r\n  margin: 0 auto 0.9rem;\r\n  border-radius: 50%;\r\n  background: #dcfce7;\r\n  color: #128c4b;\r\n  font-size: 1.5rem;\r\n  font-weight: 900;\r\n}\r\n.exit-modal[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\r\n  margin: 0;\r\n}\r\n.exit-modal[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\r\n  color: var(--%NS%color-text-muted);\r\n  line-height: 1.55;\r\n}\r\n.exit-actions[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  justify-content: center;\r\n  gap: 0.7rem;\r\n  margin-top: 1.2rem;\r\n  flex-wrap: wrap;\r\n}\r\n\r\n@media (max-width: 760px) {\r\n  .receipt-hero[_ngcontent-%COMP%] {\r\n    grid-template-columns: auto 1fr;\r\n  }\r\n  .receipt-hero[_ngcontent-%COMP%]    > a[_ngcontent-%COMP%] {\r\n    grid-column: 1 / -1;\r\n  }\r\n  .receipt-grid[_ngcontent-%COMP%] {\r\n    grid-template-columns: minmax(0, 1fr);\r\n  }\r\n  .contact-card[_ngcontent-%COMP%] {\r\n    grid-template-columns: 1fr;\r\n  }\r\n  .contact-actions[_ngcontent-%COMP%] {\r\n    justify-content: flex-start;\r\n  }\r\n}\r\n\r\n@media (max-width: 480px) {\r\n  .receipt-page[_ngcontent-%COMP%] {\r\n    padding: 1rem 0.7rem 3rem;\r\n  }\r\n  .receipt-hero[_ngcontent-%COMP%], \r\n   .receipt-card[_ngcontent-%COMP%] {\r\n    padding: 1.15rem;\r\n  }\r\n  .receipt-hero[_ngcontent-%COMP%] {\r\n    grid-template-columns: minmax(0, 1fr);\r\n  }\r\n  .date-grid[_ngcontent-%COMP%] {\r\n    grid-template-columns: 1fr;\r\n  }\r\n  .entry-code[_ngcontent-%COMP%] {\r\n    padding: 1rem;\r\n  }\r\n  .entry-code__value[_ngcontent-%COMP%] {\r\n    align-items: stretch;\r\n    flex-direction: column;\r\n  }\r\n  .contact-actions[_ngcontent-%COMP%]    > *[_ngcontent-%COMP%], \r\n   .exit-actions[_ngcontent-%COMP%]    > *[_ngcontent-%COMP%] {\r\n    width: 100%;\r\n  }\r\n}\r\n.conversion-detail[_ngcontent-%COMP%] { padding: .8rem; margin-top: 1rem; border: 1px solid #fed7aa; border-radius: 8px; background: #fff7ed; font-size: .85rem; overflow-wrap: anywhere; }\r\n\r\n.reservation-breadcrumb[_ngcontent-%COMP%], .reservation-heading[_ngcontent-%COMP%] { display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; }\r\n.reservation-heading[_ngcontent-%COMP%] { justify-content: space-between; }\r\n.reservation-heading[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%], .reservation-summary[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 0; }\r\n.change-dates[_ngcontent-%COMP%] { border: 1px solid #ae391c; color: #9d3218; background: #fff; }\r\n.reservation-summary[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 1rem; padding: .85rem; flex-wrap: wrap; }\r\n.reservation-summary[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] { width: clamp(120px, 20vw, 220px); aspect-ratio: 2 / 1; object-fit: cover; border-radius: 10px; }\r\n.reservation-summary__stay[_ngcontent-%COMP%] { flex: 1 1 260px; }\r\n.reservation-summary[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%], .reservation-confirmed[_ngcontent-%COMP%] { display: inline-block; margin-right: .6rem; }\r\n.reservation-confirmed[_ngcontent-%COMP%] { border-radius: 20px; padding: .2rem .55rem; background: #dcfce7; color: #166534; font-weight: 700; font-size: .8rem; }\r\n.reservation-summary[_ngcontent-%COMP%]   dl[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; gap: .5rem 1.6rem; margin: .65rem 0 0; }\r\n.reservation-summary[_ngcontent-%COMP%]   dt[_ngcontent-%COMP%], .reservation-summary__total[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); font-size: .88rem; }\r\n.reservation-summary[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%] { margin: .2rem 0 0; font-weight: 750; }\r\n.reservation-summary__total[_ngcontent-%COMP%] { display: grid; padding: .4rem 1rem; }\r\n.reservation-summary__total[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { font-size: 1.5rem; }\r\n.reservation-notice[_ngcontent-%COMP%] { margin: 0; padding: .85rem 1rem; }\r\n@media (max-width: 550px) {\r\n  .reservation-summary[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] { width: 100%; aspect-ratio: 3 / 1; }\r\n  .reservation-summary__total[_ngcontent-%COMP%] { padding-inline: 0; }\r\n}\r\n.refund-threads[_ngcontent-%COMP%] { display: grid; gap: 14px; }\r\n.refund-threads__head[_ngcontent-%COMP%] { display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto; align-items: center; gap: 12px; color: #121b36; }\r\n.refund-threads__head[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%], .refund-threads__head[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; }\r\n.refund-threads__receipt[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 10px 0 0; color: #52607a; }\r\n.refund-threads__detail[_ngcontent-%COMP%] { margin: 6px 0 0; color: #52607a; overflow-wrap: anywhere; }\r\n.refund-threads__note[_ngcontent-%COMP%] { white-space: pre-wrap; }\r\n.refund-threads__head[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { font-size: clamp(1rem, 2.2vw, 1.3rem); }\r\n.refund-threads__head[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { color: #52607a; }\r\n.refund-threads__head[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { border-inline-start: 1px solid #d5deee; padding-inline: 12px; font-size: 1.2rem; }\r\n.refund-threads__icon[_ngcontent-%COMP%] { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 10px; color: #1648f5; background: #dbe8ff; }\r\n.refund-threads__head[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: center; gap: 5px; }\r\n.refund-threads__head[_ngcontent-%COMP%]   button[aria-expanded='true'][_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { transform: rotate(180deg); }\r\n@media (max-width: 640px) {\r\n  .refund-threads__head[_ngcontent-%COMP%] { grid-template-columns: auto minmax(0, 1fr); }\r\n  .refund-threads__head[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { border: 0; padding: 0; white-space: nowrap; }\r\n  .refund-threads__head[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { justify-self: end; }\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ReservaResultadoComponent, [{
        type: Component,
        args: [{ selector: 'app-reserva-resultado', standalone: true, imports: [RouterLink, SpinnerComponent, LucideKeyRound, LucideCopy, LucideCheck, LucideCalendar, LucideChevronDown, LucideLandmark, ReservaReprogramacionComponent, ReembolsoChatComponent, VerComprobanteComponent], template: "<main class=\"receipt-page\">\r\n  <div class=\"receipt-wrap\">\r\n    @if (cargando()) {\r\n      <div class=\"receipt-state\">\r\n        <app-spinner />\r\n        <p>{{ administracion ? 'Cargando la reserva\u2026' : 'Estamos verificando tu reserva\u2026' }}</p>\r\n      </div>\r\n    } @else if (error()) {\r\n      <section class=\"receipt-card receipt-error\">\r\n        <span class=\"status-icon\">!</span>\r\n        <h1>No pudimos mostrar la reserva</h1>\r\n        <p>{{ error() }}</p>\r\n        @if (administracion) {\r\n          <a class=\"acct-btn acct-btn--primary\" routerLink=\"/admin\" [fragment]=\"seccionOrigen ?? undefined\">{{ textoVolver }}</a>\r\n        } @else {\r\n          <a class=\"acct-btn acct-btn--primary\" routerLink=\"/mis-reservas\">Ir a Mis reservas</a>\r\n        }\r\n      </section>\r\n    } @else if (reserva(); as item) {\r\n      @if (esInquilino() && conversacionesReembolso().length) {\r\n        <section class=\"receipt-card refund-threads\" aria-label=\"Transferencias de reembolsos\">\r\n          @for (reembolso of conversacionesReembolso(); track reembolso.id) {\r\n            <header class=\"refund-threads__head\">\r\n              <span class=\"refund-threads__icon\"><svg lucideLandmark [size]=\"26\" aria-hidden=\"true\"></svg></span>\r\n              <div>\r\n                <h2>Reembolsos por transferencia</h2>\r\n                <p>Reembolso #{{ reembolso.id }} @if (reembolso.estado === 'APROBADO') { \u00B7 Transferencia registrada }</p>\r\n              </div>\r\n              <strong>{{ monto(reembolso.importe, reembolso.moneda) }}</strong>\r\n              <button type=\"button\" class=\"acct-btn\" [attr.aria-expanded]=\"conversacionAbierta() === reembolso.id\"\r\n                (click)=\"conversacionAbierta.set(conversacionAbierta() === reembolso.id ? null : reembolso.id)\">\r\n                <svg lucideChevronDown [size]=\"18\" aria-hidden=\"true\"></svg>\r\n                {{ conversacionAbierta() === reembolso.id ? 'Ocultar conversaci\u00F3n' : 'Ver conversaci\u00F3n' }}\r\n              </button>\r\n            </header>\r\n            @if (reembolso.comprobante_nombre) {\r\n              <!-- El inquilino ve el comprobante de la transferencia que recibi\u00F3. -->\r\n              <p class=\"refund-threads__receipt\">Comprobante de la transferencia:\r\n                <app-ver-comprobante [obtenerUrl]=\"urlComprobanteReembolso(reembolso.id)\" [etiqueta]=\"'Ver ' + reembolso.comprobante_nombre\" />\r\n              </p>\r\n              <!-- El n\u00FAmero de operaci\u00F3n y la observaci\u00F3n que carg\u00F3 el admin con el comprobante. -->\r\n              @if (reembolso.referencia_externa?.startsWith('SIMULADO:tarjeta:')) {\r\n                <p class=\"refund-threads__detail\">Devoluci\u00F3n simulada. No se transfiri\u00F3 dinero.</p>\r\n              } @else if (reembolso.referencia_externa) {\r\n                <p class=\"refund-threads__detail\">N\u00FAmero de operaci\u00F3n: {{ reembolso.referencia_externa }}</p>\r\n              }\r\n              @if (reembolso.observacion_transferencia) {\r\n                <p class=\"refund-threads__detail refund-threads__note\">Observaci\u00F3n: {{ reembolso.observacion_transferencia }}</p>\r\n              }\r\n            }\r\n            @if (conversacionAbierta() === reembolso.id) {\r\n              <app-reembolso-chat [reembolsoId]=\"reembolso.id\" [vistaInquilino]=\"true\" />\r\n            }\r\n          }\r\n        </section>\r\n      }\r\n      @if (puedeCambiarFechas()) {\r\n        <nav class=\"reservation-breadcrumb\" aria-label=\"Ubicaci\u00F3n\">\r\n          <a routerLink=\"/mis-reservas\">Mis reservas</a><span aria-hidden=\"true\">/</span><span>Reserva #{{ item.id }}</span>\r\n        </nav>\r\n        <header class=\"reservation-heading\">\r\n          <h1>Detalle de la reserva</h1>\r\n          <button type=\"button\" class=\"acct-btn change-dates\" [attr.aria-expanded]=\"reprogramando()\" (click)=\"abrirReprogramacion()\">\r\n            <svg lucideCalendar [size]=\"18\" aria-hidden=\"true\"></svg> Cambiar fechas\r\n          </button>\r\n        </header>\r\n        <section class=\"receipt-card reservation-summary\">\r\n          @if (item.publicacion?.imagenes?.[0]?.url; as portada) {\r\n            @if (imagenFallida() !== portada) {\r\n              <img [src]=\"portada\" alt=\"\" (error)=\"imagenFallida.set(portada)\" />\r\n            }\r\n          }\r\n          <div class=\"reservation-summary__stay\">\r\n            <h2>{{ item.publicacion?.titulo }}</h2><span class=\"reservation-confirmed\">Confirmada</span>\r\n            <dl>\r\n              <div><dt>Ingreso</dt><dd>{{ fecha(item.fecha_inicio) }}</dd></div>\r\n              <div><dt>Salida</dt><dd>{{ fecha(item.fecha_fin) }}</dd></div>\r\n            </dl>\r\n          </div>\r\n          <div class=\"reservation-summary__total\">\r\n            <span>Total</span>\r\n            <strong>{{ monto(item.importe_contratado ?? item.monto_pago, item.moneda_contratada ?? 'ARS') }}</strong>\r\n          </div>\r\n        </section>\r\n        @if (reprogramando()) {\r\n          <app-reserva-reprogramacion [reserva]=\"item\" (cancelar)=\"reprogramando.set(false)\" (guardada)=\"guardarReprogramacion($event)\" />\r\n        }\r\n      } @else {\r\n      <header\r\n        class=\"receipt-hero\"\r\n        [class.is-approved]=\"!devolucionPendiente() && item.estado_pago === 'APROBADO' && !item.cancelada\"\r\n        [class.is-pending]=\"devolucionPendiente() || item.estado_pago === 'PENDIENTE' || (item.cancelada && item.estado_pago === 'APROBADO' && item.estado_liquidacion === 'EN_REVISION')\"\r\n      >\r\n        <div class=\"status-icon\">\r\n          {{ devolucionPendiente() || item.estado_pago === 'PENDIENTE' ? '\u2026' : item.estado_pago === 'APROBADO' && !item.cancelada ? '\u2713' : '!' }}\r\n        </div>\r\n        <div>\r\n          <span class=\"eyebrow\">Reserva #{{ item.id }}</span>\r\n          <h1>{{ tituloEstado(item) }}</h1>\r\n          <p>{{ descripcionEstado(item) }}</p>\r\n          @if (resumen()?.puede_reintentar) {\r\n            <button type=\"button\" class=\"acct-btn acct-btn--primary\" [disabled]=\"reintentandoPago()\" (click)=\"reintentarPago(item.id)\">\r\n              {{ reintentandoPago() ? 'Abriendo Mercado Pago\u2026' : 'Volver a Mercado Pago' }}\r\n            </button>\r\n          }\r\n        </div>\r\n        @if (administracion) {\r\n          <a class=\"acct-btn acct-btn--ghost\" routerLink=\"/admin\" [fragment]=\"seccionOrigen ?? undefined\">\u2190 {{ textoVolver }}</a>\r\n        } @else {\r\n          <a class=\"acct-btn acct-btn--ghost\" routerLink=\"/mis-reservas\">Ver todas mis reservas</a>\r\n        }\r\n      </header>\r\n      }\r\n      @if (errorVerificacion() && item.estado_pago !== 'APROBADO') {\r\n        <p class=\"receipt-card reservation-notice\" role=\"alert\">{{ errorVerificacion() }}</p>\r\n      }\r\n      @if (avisoReprogramacion()) {\r\n        <p class=\"receipt-card reservation-notice\" role=\"status\">{{ avisoReprogramacion() }}</p>\r\n      }\r\n\r\n      <div class=\"receipt-grid\">\r\n        <section class=\"receipt-card stay-card\">\r\n          <div class=\"section-title\">\r\n            <span>Datos de la estad\u00EDa</span\r\n            ><strong\r\n              >{{ cantidadDias(item) }} {{ cantidadDias(item) === 1 ? 'd\u00EDa' : 'd\u00EDas' }}</strong\r\n            >\r\n          </div>\r\n          <h2>{{ item.publicacion?.titulo ?? 'Publicaci\u00F3n no disponible' }}</h2>\r\n          <div class=\"stay-location\">\r\n            <p class=\"address\">{{ direccion(item) }}</p>\r\n            @if (item.publicacion) {\r\n              <a class=\"text-link\" [routerLink]=\"[administracion ? '/admin/publicaciones' : '/publicaciones', item.publicacion.id]\"\r\n                >Ver publicaci\u00F3n</a\r\n              >\r\n            }\r\n          </div>\r\n          @if (!puedeCambiarFechas()) {\r\n          <div class=\"date-grid\">\r\n            <div>\r\n              <span>Ingreso</span><strong>{{ fecha(item.fecha_inicio) }}</strong\r\n              ><small>Primer d\u00EDa de la estad\u00EDa</small>\r\n            </div>\r\n            <div>\r\n              <span>Salida</span><strong>{{ fecha(item.fecha_fin) }}</strong\r\n              ><small>\u00DAltimo d\u00EDa incluido</small>\r\n            </div>\r\n          </div>\r\n          }\r\n          @if (mostrarCodigo()) {\r\n            <section class=\"entry-code\" aria-labelledby=\"entry-code-title\">\r\n              <div class=\"entry-code__heading\">\r\n                <svg lucideKeyRound [size]=\"32\" aria-hidden=\"true\"></svg>\r\n                <div>\r\n                  <h3 id=\"entry-code-title\">Tu c\u00F3digo de ingreso</h3>\r\n                  @if (!codigoValidado() && !item.finalizada) {\r\n                    <p>Mostr\u00E1selo al propietario al llegar al alojamiento.</p>\r\n                  }\r\n                </div>\r\n              </div>\r\n              @if (codigoValidado()) {\r\n                <p class=\"entry-code__validated\" role=\"status\">\r\n                  <svg lucideCheck [size]=\"18\" aria-hidden=\"true\"></svg>\r\n                  Este c\u00F3digo ya fue validado por el propietario.\r\n                </p>\r\n              } @else if (item.finalizada) {\r\n                <p class=\"entry-code__note\">La estad\u00EDa ya finaliz\u00F3.</p>\r\n              } @else if (cargandoCodigo()) {\r\n                <p class=\"entry-code__note\" role=\"status\">Cargando tu c\u00F3digo de ingreso\u2026</p>\r\n              } @else if (errorCodigo()) {\r\n                <div class=\"entry-code__error\">\r\n                  <p role=\"alert\">{{ errorCodigo() }}</p>\r\n                  <button\r\n                    type=\"button\"\r\n                    class=\"acct-btn acct-btn--ghost acct-btn--sm\"\r\n                    (click)=\"reintentarCodigo()\"\r\n                  >\r\n                    Reintentar\r\n                  </button>\r\n                </div>\r\n              } @else if (codigo(); as ingreso) {\r\n                <div class=\"entry-code__value\">\r\n                  <strong class=\"entry-code__text\" aria-label=\"C\u00F3digo de ingreso\">{{\r\n                    ingreso.codigo\r\n                  }}</strong>\r\n                  <button type=\"button\" class=\"acct-btn acct-btn--primary\" (click)=\"copiarCodigo()\">\r\n                    @if (copiado()) {\r\n                      <svg lucideCheck [size]=\"18\" aria-hidden=\"true\"></svg>\r\n                    } @else {\r\n                      <svg lucideCopy [size]=\"18\" aria-hidden=\"true\"></svg>\r\n                    }\r\n                    <span aria-live=\"polite\">{{ copiado() ? 'Copiado' : 'Copiar c\u00F3digo' }}</span>\r\n                  </button>\r\n                </div>\r\n                @if (errorCopiar()) {\r\n                  <p class=\"entry-code__copy-error\" role=\"alert\">{{ errorCopiar() }}</p>\r\n                }\r\n                <p class=\"entry-code__note\">\r\n                  Tambi\u00E9n lo encontr\u00E1s en <a routerLink=\"/mis-reservas\">Mis reservas</a>.\r\n                </p>\r\n              }\r\n            </section>\r\n          }\r\n        </section>\r\n\r\n        <aside class=\"receipt-card payment-card\">\r\n          <div class=\"section-title\">\r\n            <span>Datos del pago</span\r\n            ><strong class=\"payment-status\">{{ estadoPagoMercado(item) }}</strong>\r\n          </div>\r\n          @let datosPago = pago();\r\n          @let monedaPago = datosPago?.currency ?? item.moneda_contratada ?? 'ARS';\r\n          <dl>\r\n            <div>\r\n              <dt>{{ datosPago?.approved_at || datosPago?.status === 'approved' || datosPago?.devolucion ? 'Total pagado' : 'Importe de la reserva' }}</dt>\r\n              <dd [class.total]=\"!datosPago?.devolucion\">\r\n                {{ monto(datosPago?.amount ?? item.monto_pago, monedaPago) }}\r\n              </dd>\r\n            </div>\r\n            @if (datosPago?.devolucion; as devolucion) {\r\n              <div>\r\n                <dt>Total reembolsado</dt>\r\n                <dd>{{ monto(devolucion.reembolsado, monedaPago) }}</dd>\r\n              </div>\r\n              @if (devolucion.simulado > 0) {\r\n                <div>\r\n                  <dt>Devoluci\u00F3n simulada</dt>\r\n                  <dd>{{ monto(devolucion.simulado, monedaPago) }}</dd>\r\n                </div>\r\n              }\r\n              <div>\r\n                <dt>Total sin devolver</dt>\r\n                <dd class=\"total\">{{ monto(devolucion.sinDevolver, monedaPago) }}</dd>\r\n              </div>\r\n            }\r\n            <div>\r\n              <dt>Medio</dt>\r\n              <dd>{{ medioPago() }}</dd>\r\n            </div>\r\n            <div>\r\n              <dt>Operaci\u00F3n del pago</dt>\r\n              <dd>{{ pago()?.payment_id ?? 'Pendiente de asignaci\u00F3n' }}</dd>\r\n            </div>\r\n            <div>\r\n              <dt>Fecha del pago</dt>\r\n              <dd>{{ fechaHora(pago()?.approved_at ?? pago()?.created_at) }}</dd>\r\n            </div>\r\n            @if (cuitAnunciante(); as cuit) {\r\n              <div class=\"payment-card__tax-id\">\r\n                <dt>CUIT/CUIL del anunciante</dt>\r\n                <dd>{{ cuit }}</dd>\r\n              </div>\r\n            }\r\n          </dl>\r\n          @if (item.cotizacion_dolar; as dolar) {\r\n            <div class=\"conversion-detail\">\r\n              <p>Publicado: {{ monto(item.importe_origen ?? 0, item.moneda_origen ?? 'USD') }}.</p>\r\n              <p>Cambio aceptado: d\u00F3lar blue venta {{ monto(+dolar.venta, 'ARS', 6) }} por USD.</p>\r\n              <p>Fuente: {{ dolar.proveedor }} \u00B7 Publicada {{ fechaHora(dolar.actualizada_fuente_en) }}.</p>\r\n              <p>Consultada {{ fechaHora(dolar.consultada_en) }} \u00B7 Aceptada {{ fechaHora(item.cotizacion_aceptada_en) }}.</p>\r\n              <small>El cobro y la liquidaci\u00F3n se realizan en pesos con la conversi\u00F3n aceptada.</small>\r\n            </div>\r\n          }\r\n          <p class=\"secure-note\">\r\n            El estado fue verificado directamente con Mercado Pago. DEPA no almacena los datos de tu\r\n            tarjeta.\r\n          </p>\r\n        </aside>\r\n      </div>\r\n\r\n      @if (administracion) {\r\n        <!-- El admin ve a las dos partes de la reserva, con enlace a su perfil. -->\r\n        <section class=\"receipt-card admin-parties\" aria-label=\"Partes de la reserva\">\r\n          @for (parte of partes(); track parte.rol) {\r\n            <div>\r\n              <span class=\"eyebrow\">{{ parte.rol }}</span>\r\n              <h2>{{ parte.nombre }}</h2>\r\n              <p>{{ parte.email }} \u00B7 {{ parte.telefono }}</p>\r\n              @if (parte.id) { <a class=\"text-link\" [routerLink]=\"['/admin/usuarios', parte.id]\">Ver perfil</a> }\r\n            </div>\r\n          }\r\n        </section>\r\n      } @else if (item.estado_pago === 'APROBADO') {\r\n        <section class=\"receipt-card contact-card\">\r\n          <div>\r\n            <span class=\"eyebrow\">Comunicaci\u00F3n de la reserva</span>\r\n            <h2>Contact\u00E1 a {{ nombreContacto() }}</h2>\r\n            @if (contactoSuspendido()) {\r\n              <p>Esta cuenta fue dada de baja. Para otras gestiones, contact\u00E1 a soporte.</p>\r\n            } @else if (!esInquilino() || accesoLimitado()) {\r\n              <p>Pod\u00E9s comunicarte con la otra persona por el chat de DEPA.</p>\r\n            } @else {\r\n              <p>{{ emailContacto() }} \u00B7 {{ telefonoContacto() }}</p>\r\n            }\r\n          </div>\r\n          <div class=\"contact-actions\">\r\n            <button\r\n              type=\"button\"\r\n              class=\"acct-btn acct-btn--primary\"\r\n              [disabled]=\"!contactoDisponible()\"\r\n              (click)=\"abrirChat()\"\r\n            >\r\n              Mensaje por DEPA\r\n            </button>\r\n            @if (whatsappUrl()) {\r\n            <button\r\n              type=\"button\"\r\n              class=\"acct-btn whatsapp-btn\"\r\n              (click)=\"abrirConfirmacionWhatsapp()\"\r\n            >\r\n              Continuar por WhatsApp\r\n            </button>\r\n            }\r\n          </div>\r\n          @if (whatsappUrl()) {\r\n          <div class=\"safety-notice\">\r\n            <strong>Te recomendamos conversar dentro de DEPA.</strong>\r\n            <span\r\n              >Si continu\u00E1s por WhatsApp, la conversaci\u00F3n ocurre fuera de la plataforma. DEPA no\r\n              podr\u00E1 revisar esos mensajes ni ayudarte con acuerdos o inconvenientes surgidos\r\n              all\u00ED.</span\r\n            >\r\n          </div>\r\n          }\r\n        </section>\r\n      }\r\n    }\r\n  </div>\r\n\r\n  @if (confirmarSalida()) {\r\n    <div class=\"modal-backdrop\" (click)=\"confirmarSalida.set(false)\">\r\n      <section\r\n        class=\"exit-modal\"\r\n        role=\"dialog\"\r\n        aria-modal=\"true\"\r\n        aria-labelledby=\"exit-title\"\r\n        (click)=\"$event.stopPropagation()\"\r\n      >\r\n        <span class=\"exit-icon\">\u2197</span>\r\n        <h2 id=\"exit-title\">Vas a salir de DEPA</h2>\r\n        <p>\r\n          La conversaci\u00F3n continuar\u00E1 en WhatsApp. DEPA no podr\u00E1 acceder a esos mensajes ni\r\n          intervenir si surge un problema.\r\n        </p>\r\n        <div class=\"exit-actions\">\r\n          <button\r\n            type=\"button\"\r\n            class=\"acct-btn acct-btn--ghost\"\r\n            (click)=\"confirmarSalida.set(false)\"\r\n          >\r\n            Quedarme en DEPA\r\n          </button>\r\n          <button type=\"button\" class=\"acct-btn whatsapp-btn\" (click)=\"continuarWhatsapp()\">\r\n            Abrir WhatsApp\r\n          </button>\r\n        </div>\r\n      </section>\r\n    </div>\r\n  }\r\n</main>\r\n", styles: [".receipt-page {\r\n  min-height: calc(100dvh - 70px);\r\n  padding: 2rem 1rem 4rem;\r\n  background: linear-gradient(180deg, #f8fafc 0, #f5f6f8 45%);\r\n}\r\n.receipt-wrap {\r\n  grid-template-columns: minmax(0, 1fr);\r\n  max-width: 1040px;\r\n  margin: 0 auto;\r\n  display: grid;\r\n  gap: 1.2rem;\r\n}\r\n.receipt-state {\r\n  min-height: 55vh;\r\n  display: grid;\r\n  place-content: center;\r\n  justify-items: center;\r\n  gap: 0.8rem;\r\n  color: var(--color-text-muted);\r\n}\r\n.receipt-card,\r\n.receipt-hero {\r\n  min-width: 0;\r\n  overflow-wrap: anywhere;\r\n  border: 1px solid var(--color-border);\r\n  border-radius: 18px;\r\n  background: #fff;\r\n  box-shadow: var(--shadow-card);\r\n}\r\n.receipt-hero {\r\n  display: grid;\r\n  grid-template-columns: auto 1fr auto;\r\n  align-items: center;\r\n  gap: 1.2rem;\r\n  padding: 1.6rem;\r\n  border-top: 5px solid var(--color-primary);\r\n}\r\n.receipt-hero.is-approved {\r\n  border-top-color: var(--color-success);\r\n  background: linear-gradient(135deg, #fff 65%, #f0fdf4);\r\n}\r\n.receipt-hero.is-pending {\r\n  border-top-color: var(--color-accent);\r\n  background: linear-gradient(135deg, #fff 65%, #fff8eb);\r\n}\r\n.status-icon {\r\n  width: 54px;\r\n  height: 54px;\r\n  display: grid;\r\n  place-items: center;\r\n  border-radius: 50%;\r\n  background: var(--color-primary-light);\r\n  color: var(--color-primary);\r\n  font-size: 1.6rem;\r\n  font-weight: 900;\r\n}\r\n.is-approved .status-icon {\r\n  background: #dcfce7;\r\n  color: #15803d;\r\n}\r\n.is-pending .status-icon {\r\n  background: #ffedd5;\r\n  color: #c2410c;\r\n}\r\n.eyebrow {\r\n  display: block;\r\n  margin-bottom: 0.3rem;\r\n  color: var(--color-text-muted);\r\n  font-size: 0.76rem;\r\n  font-weight: 800;\r\n  letter-spacing: 0.08em;\r\n  text-transform: uppercase;\r\n}\r\n.receipt-hero h1,\r\n.contact-card h2 {\r\n  margin: 0;\r\n}\r\n.receipt-hero p,\r\n.contact-card p {\r\n  margin: 0.35rem 0 0;\r\n  color: var(--color-text-muted);\r\n}\r\n.receipt-grid {\r\n  min-width: 0;\r\n  display: grid;\r\n  grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.75fr);\r\n  gap: 1.2rem;\r\n}\r\n.receipt-card {\r\n  padding: 1.5rem;\r\n}\r\n.section-title {\r\n  flex-wrap: wrap;\r\n  display: flex;\r\n  justify-content: space-between;\r\n  gap: 1rem;\r\n  align-items: center;\r\n  margin-bottom: 1rem;\r\n  color: var(--color-text-muted);\r\n  font-size: 0.8rem;\r\n  font-weight: 700;\r\n  text-transform: uppercase;\r\n  letter-spacing: 0.05em;\r\n}\r\n.section-title strong {\r\n  color: var(--color-secondary);\r\n}\r\n.stay-card h2 {\r\n  margin: 0 0 0.3rem;\r\n  font-size: 1.35rem;\r\n}\r\n.address {\r\n  margin: 0;\r\n  color: var(--color-text-muted);\r\n}\r\n.stay-location {\r\n  display: flex;\r\n  flex-wrap: wrap;\r\n  align-items: baseline;\r\n  gap: 0.3rem 0.75rem;\r\n}\r\n.stay-location .text-link {\r\n  white-space: nowrap;\r\n  font-size: 0.9rem;\r\n}\r\n.entry-code {\r\n  margin-top: 1rem;\r\n  padding: 1.2rem;\r\n  border: 1px solid #fdba74;\r\n  border-radius: 12px;\r\n  background: #fff7ed;\r\n}\r\n.entry-code__heading {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.8rem;\r\n}\r\n.entry-code__heading > svg {\r\n  flex-shrink: 0;\r\n  color: #f58a00;\r\n}\r\n.entry-code__heading h3 {\r\n  margin: 0;\r\n  color: var(--color-text);\r\n  font-size: 1.05rem;\r\n  font-weight: 800;\r\n}\r\n.entry-code__heading p {\r\n  margin: 0.2rem 0 0;\r\n  color: var(--color-text-muted);\r\n  font-size: 0.85rem;\r\n  line-height: 1.45;\r\n}\r\n.entry-code__value {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  flex-wrap: wrap;\r\n  gap: 0.75rem;\r\n  margin-top: 0.8rem;\r\n}\r\n.entry-code__text {\r\n  min-width: 0;\r\n  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r\n  font-size: clamp(1.65rem, 3vw, 2.3rem);\r\n  line-height: 1.25;\r\n  letter-spacing: 0.1em;\r\n  color: #101828;\r\n  user-select: all;\r\n}\r\n.entry-code__value button {\r\n  flex-shrink: 0;\r\n}\r\n.entry-code__note {\r\n  margin: 0.6rem 0 0;\r\n  color: var(--color-text-muted);\r\n  font-size: 0.8rem;\r\n  line-height: 1.45;\r\n}\r\n.entry-code__note a {\r\n  color: var(--color-secondary);\r\n  text-decoration: underline;\r\n  text-underline-offset: 2px;\r\n}\r\n.entry-code__validated {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.4rem;\r\n  margin: 0.8rem 0 0;\r\n  color: #15803d;\r\n  font-size: 0.85rem;\r\n}\r\n.entry-code__validated svg {\r\n  flex-shrink: 0;\r\n}\r\n.entry-code__error {\r\n  display: flex;\r\n  flex-wrap: wrap;\r\n  align-items: center;\r\n  gap: 0.6rem;\r\n  margin-top: 0.6rem;\r\n}\r\n.entry-code__error p,\r\n.entry-code__copy-error {\r\n  margin: 0;\r\n  color: #b42318;\r\n  font-size: 0.8rem;\r\n  line-height: 1.45;\r\n}\r\n.entry-code__copy-error {\r\n  margin-top: 0.6rem;\r\n}\r\n.date-grid {\r\n  display: grid;\r\n  grid-template-columns: 1fr 1fr;\r\n  gap: 1rem;\r\n  margin: 1.4rem 0;\r\n}\r\n.date-grid > div {\r\n  display: grid;\r\n  gap: 0.25rem;\r\n  padding: 1rem;\r\n  border: 1px solid var(--color-border);\r\n  border-radius: 12px;\r\n}\r\n.date-grid span,\r\n.date-grid small {\r\n  color: var(--color-text-muted);\r\n  font-size: 0.78rem;\r\n}\r\n.date-grid strong {\r\n  font-size: 0.95rem;\r\n}\r\n.text-link {\r\n  color: var(--color-secondary);\r\n  font-weight: 700;\r\n  text-decoration: none;\r\n}\r\n.payment-card dl {\r\n  margin: 0;\r\n}\r\n.payment-card dl div {\r\n  display: flex;\r\n  align-items: flex-start;\r\n  justify-content: space-between;\r\n  gap: 1rem;\r\n  padding: 0.75rem 0;\r\n  border-bottom: 1px solid var(--color-border);\r\n}\r\n.payment-card dt {\r\n  color: var(--color-text-muted);\r\n}\r\n.payment-card dd {\r\n  margin: 0;\r\n  max-width: 60%;\r\n  text-align: right;\r\n  font-weight: 700;\r\n  overflow-wrap: anywhere;\r\n}\r\n.payment-card dl .payment-card__tax-id {\r\n  display: grid;\r\n  grid-template-columns: minmax(0, 1fr) max-content;\r\n}\r\n.payment-card__tax-id dd {\r\n  max-width: none;\r\n  white-space: nowrap;\r\n}\r\n.payment-card .total {\r\n  color: var(--color-primary);\r\n  font-size: 1.2rem;\r\n}\r\n.payment-status {\r\n  padding: 0.25rem 0.55rem;\r\n  border-radius: 999px;\r\n  background: #dcfce7;\r\n  color: #15803d !important;\r\n}\r\n.secure-note {\r\n  margin: 1rem 0 0;\r\n  padding: 0.8rem;\r\n  border-radius: 9px;\r\n  background: #f8fafc;\r\n  color: var(--color-text-muted);\r\n  font-size: 0.78rem;\r\n  line-height: 1.45;\r\n}\r\n.contact-card {\r\n  display: grid;\r\n  grid-template-columns: 1fr auto;\r\n  align-items: center;\r\n  gap: 1.2rem;\r\n}\r\n/* Partes de la reserva en la vista del admin. */\r\n.admin-parties {\r\n  display: grid;\r\n  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));\r\n  gap: 1.2rem;\r\n}\r\n.admin-parties > div { min-width: 0; overflow-wrap: anywhere; }\r\n.admin-parties h2 { margin: 0; }\r\n.admin-parties p { margin: 0.35rem 0; color: var(--color-text-muted); }\r\n.contact-actions {\r\n  display: flex;\r\n  gap: 0.7rem;\r\n  flex-wrap: wrap;\r\n  justify-content: flex-end;\r\n}\r\n.whatsapp-btn {\r\n  background: #128c4b;\r\n  color: #fff;\r\n}\r\n.whatsapp-btn:hover:not(:disabled) {\r\n  background: #0b713b;\r\n  transform: translateY(-1px);\r\n}\r\n.safety-notice {\r\n  grid-column: 1 / -1;\r\n  display: grid;\r\n  gap: 0.2rem;\r\n  padding: 1rem;\r\n  border-radius: 10px;\r\n  border: 1px solid #fed7aa;\r\n  background: #fff7ed;\r\n  color: #9a3412;\r\n  font-size: 0.83rem;\r\n  line-height: 1.45;\r\n}\r\n.receipt-error {\r\n  max-width: 620px;\r\n  margin: 8vh auto;\r\n  text-align: center;\r\n}\r\n.receipt-error .status-icon {\r\n  margin: 0 auto;\r\n}\r\n.receipt-error h1 {\r\n  margin: 1rem 0 0.5rem;\r\n}\r\n.receipt-error p {\r\n  color: var(--color-text-muted);\r\n}\r\n.modal-backdrop {\r\n  position: fixed;\r\n  inset: 0;\r\n  z-index: 100;\r\n  display: grid;\r\n  place-items: center;\r\n  padding: 1rem;\r\n  background: rgba(15, 23, 42, 0.58);\r\n  backdrop-filter: blur(3px);\r\n}\r\n.exit-modal {\r\n  width: min(100%, 480px);\r\n  padding: 1.7rem;\r\n  border-radius: 18px;\r\n  background: #fff;\r\n  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.28);\r\n  text-align: center;\r\n}\r\n.exit-icon {\r\n  width: 54px;\r\n  height: 54px;\r\n  display: grid;\r\n  place-items: center;\r\n  margin: 0 auto 0.9rem;\r\n  border-radius: 50%;\r\n  background: #dcfce7;\r\n  color: #128c4b;\r\n  font-size: 1.5rem;\r\n  font-weight: 900;\r\n}\r\n.exit-modal h2 {\r\n  margin: 0;\r\n}\r\n.exit-modal p {\r\n  color: var(--color-text-muted);\r\n  line-height: 1.55;\r\n}\r\n.exit-actions {\r\n  display: flex;\r\n  justify-content: center;\r\n  gap: 0.7rem;\r\n  margin-top: 1.2rem;\r\n  flex-wrap: wrap;\r\n}\r\n\r\n@media (max-width: 760px) {\r\n  .receipt-hero {\r\n    grid-template-columns: auto 1fr;\r\n  }\r\n  .receipt-hero > a {\r\n    grid-column: 1 / -1;\r\n  }\r\n  .receipt-grid {\r\n    grid-template-columns: minmax(0, 1fr);\r\n  }\r\n  .contact-card {\r\n    grid-template-columns: 1fr;\r\n  }\r\n  .contact-actions {\r\n    justify-content: flex-start;\r\n  }\r\n}\r\n\r\n@media (max-width: 480px) {\r\n  .receipt-page {\r\n    padding: 1rem 0.7rem 3rem;\r\n  }\r\n  .receipt-hero,\r\n  .receipt-card {\r\n    padding: 1.15rem;\r\n  }\r\n  .receipt-hero {\r\n    grid-template-columns: minmax(0, 1fr);\r\n  }\r\n  .date-grid {\r\n    grid-template-columns: 1fr;\r\n  }\r\n  .entry-code {\r\n    padding: 1rem;\r\n  }\r\n  .entry-code__value {\r\n    align-items: stretch;\r\n    flex-direction: column;\r\n  }\r\n  .contact-actions > *,\r\n  .exit-actions > * {\r\n    width: 100%;\r\n  }\r\n}\r\n.conversion-detail { padding: .8rem; margin-top: 1rem; border: 1px solid #fed7aa; border-radius: 8px; background: #fff7ed; font-size: .85rem; overflow-wrap: anywhere; }\r\n\r\n.reservation-breadcrumb, .reservation-heading { display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; }\r\n.reservation-heading { justify-content: space-between; }\r\n.reservation-heading h1, .reservation-summary h2 { margin: 0; }\r\n.change-dates { border: 1px solid #ae391c; color: #9d3218; background: #fff; }\r\n.reservation-summary { display: flex; align-items: center; gap: 1rem; padding: .85rem; flex-wrap: wrap; }\r\n.reservation-summary img { width: clamp(120px, 20vw, 220px); aspect-ratio: 2 / 1; object-fit: cover; border-radius: 10px; }\r\n.reservation-summary__stay { flex: 1 1 260px; }\r\n.reservation-summary h2, .reservation-confirmed { display: inline-block; margin-right: .6rem; }\r\n.reservation-confirmed { border-radius: 20px; padding: .2rem .55rem; background: #dcfce7; color: #166534; font-weight: 700; font-size: .8rem; }\r\n.reservation-summary dl { display: flex; flex-wrap: wrap; gap: .5rem 1.6rem; margin: .65rem 0 0; }\r\n.reservation-summary dt, .reservation-summary__total span { color: var(--color-text-muted); font-size: .88rem; }\r\n.reservation-summary dd { margin: .2rem 0 0; font-weight: 750; }\r\n.reservation-summary__total { display: grid; padding: .4rem 1rem; }\r\n.reservation-summary__total strong { font-size: 1.5rem; }\r\n.reservation-notice { margin: 0; padding: .85rem 1rem; }\r\n@media (max-width: 550px) {\r\n  .reservation-summary img { width: 100%; aspect-ratio: 3 / 1; }\r\n  .reservation-summary__total { padding-inline: 0; }\r\n}\r\n.refund-threads { display: grid; gap: 14px; }\r\n.refund-threads__head { display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto; align-items: center; gap: 12px; color: #121b36; }\r\n.refund-threads__head h2, .refund-threads__head p { margin: 0; }\r\n.refund-threads__receipt { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 10px 0 0; color: #52607a; }\r\n.refund-threads__detail { margin: 6px 0 0; color: #52607a; overflow-wrap: anywhere; }\r\n.refund-threads__note { white-space: pre-wrap; }\r\n.refund-threads__head h2 { font-size: clamp(1rem, 2.2vw, 1.3rem); }\r\n.refund-threads__head p { color: #52607a; }\r\n.refund-threads__head strong { border-inline-start: 1px solid #d5deee; padding-inline: 12px; font-size: 1.2rem; }\r\n.refund-threads__icon { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 10px; color: #1648f5; background: #dbe8ff; }\r\n.refund-threads__head button { display: flex; align-items: center; justify-content: center; gap: 5px; }\r\n.refund-threads__head button[aria-expanded='true'] svg { transform: rotate(180deg); }\r\n@media (max-width: 640px) {\r\n  .refund-threads__head { grid-template-columns: auto minmax(0, 1fr); }\r\n  .refund-threads__head strong { border: 0; padding: 0; white-space: nowrap; }\r\n  .refund-threads__head button { justify-self: end; }\r\n}\r\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ReservaResultadoComponent, { className: "ReservaResultadoComponent", filePath: "src/app/features/reserva-resultado/reserva-resultado.component.ts", lineNumber: 34 }); })();
