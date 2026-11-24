import { ConversationPanelComponent, mensajesApelacion } from '../../shared/components/conversation-panel/conversation-panel.component';
import { ConversationComposerComponent } from '../../shared/components/conversation-panel/conversation-composer.component';
import { CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, computed, DestroyRef, ElementRef, inject, Injector, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, EMPTY, finalize, forkJoin, merge, tap, timer } from 'rxjs';
import { ADMIN_NAVIGATION, seccionAdmin } from './admin-secciones';
import { ToastService } from '../../core/services/toast.service';
import { CotizacionesAdminComponent } from './cotizaciones-admin.component';
import { PublicacionesAdminComponent } from './publicaciones-admin.component';
import { LucideUsers, LucideShieldCheck, LucideRefreshCw, LucideSearch, LucideCheck, LucideX, LucideCalendarX, LucideMessageCircle, LucideChevronRight, LucideHouse, LucideWallet, LucideUserRound, LucideCalendarDays, LucideClock3, LucideReceiptText, LucideLockKeyhole, LucideInfo, LucideLayers3, LucideCircleDollarSign, LucideGavel, } from '@lucide/angular';
import { AdminService, } from './admin.service';
import { imagenesDisponibles } from '../../shared/utils/reclamo-imagenes';
import { ClaimHistoryComponent } from '../../shared/components/claim-history/claim-history.component';
import { ReembolsoChatComponent } from '../../shared/components/reembolso-chat/reembolso-chat.component';
import { CargaComprobanteComponent } from '../../shared/components/carga-comprobante/carga-comprobante.component';
import { VerComprobanteComponent } from '../../shared/components/ver-comprobante/ver-comprobante.component';
import { DatoCopiableComponent } from '../../shared/components/dato-copiable/dato-copiable.component';
import { formatearCbu, formatearCuit, tipoCuentaBancaria } from '../../shared/utils/cuenta-bancaria';
import { FiltrosListaComponent } from '../../shared/components/filtros-lista/filtros-lista.component';
import { PaginadorComponent } from '../../shared/components/paginador/paginador.component';
import { ListaFiltrable } from '../../shared/utils/lista-filtrable';
import { fechaArgentina } from '../../shared/utils/rental-dates';
import { DesglosePagoComponent } from '../../shared/components/desglose-pago/desglose-pago.component';
import { formatearImporteConMoneda } from '../../shared/utils/formato-numero';
import { apelacionSinResponder, diasEsperaLiquidacion, etiquetaLiquidacion, FILTROS_BLOQUEO, FILTROS_CANCELACION, FILTROS_LIQUIDACION, FILTROS_RECLAMO, FILTROS_REEMBOLSO, FILTROS_VERIFICACION, nombreInquilino, ORIGENES_REEMBOLSO, pagoHabilitado, pendienteParaAnunciante, reclamoAbierto, reembolsoPendiente, textosBloqueo, textosCancelacion, textosLiquidacion, textosPagoLiquidacion, textosReclamo, textosReembolso, textosVerificacion, tieneApelacion, tieneDevolucion, } from './admin-listas';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
const _c0 = ["dialogoResolucion"];
const _c1 = ["bloqueoDialog"];
const _c2 = ["dialogoAprobacion"];
const _c3 = ["dialogoReembolso"];
const _c4 = ["dialogoPagoAnunciante"];
const _c5 = a0 => ["/admin/reservas", a0];
const _c6 = () => ({ desde: "liquidaciones" });
const _c7 = () => ({ desde: "cancelaciones" });
const _c8 = () => ({ desde: "reembolsos" });
const _c9 = () => ({ desde: "historial-liquidaciones" });
const _forTrack0 = ($index, $item) => $item.label;
const _forTrack1 = ($index, $item) => $item.id;
const _forTrack2 = ($index, $item) => $item.key;
const _forTrack3 = ($index, $item) => $item.section + "-" + $item.id;
const _forTrack4 = ($index, $item) => $item.detalle.id;
const _forTrack5 = ($index, $item) => $item.usuario.id + "-" + $item.detalle.id;
function AdminComponent_For_11_For_4_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 11);
    i0.ɵɵlistener("click", function AdminComponent_For_11_For_4_Template_button_click_0_listener() { const item_r3 = i0.ɵɵrestoreView(_r2).$implicit; const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.openSection(item_r3.id)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r3 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵattribute("aria-current", ctx_r3.activeSection() === item_r3.id ? "page" : null);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", item_r3.label, " ");
} }
function AdminComponent_For_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 13)(1, "h2");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(3, AdminComponent_For_11_For_4_Template, 2, 2, "button", 105, _forTrack1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const group_r5 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(group_r5.label);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(group_r5.items);
} }
function AdminComponent_For_18_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 106);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r6 = ctx.$implicit;
    i0.ɵɵproperty("value", item_r6.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r6.label);
} }
function AdminComponent_For_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "optgroup", 17);
    i0.ɵɵrepeaterCreate(1, AdminComponent_For_18_For_2_Template, 2, 2, "option", 106, _forTrack1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const group_r7 = ctx.$implicit;
    i0.ɵɵproperty("label", group_r7.label);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(group_r7.items);
} }
function AdminComponent_Conditional_62_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 41);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.bloqueoError());
} }
function AdminComponent_Conditional_68_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 41);
    i0.ɵɵtext(1, "No se pudieron actualizar todos los datos del resumen. Pod\u00E9s volver a intentar con Actualizar.");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_68_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 122);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_68_Conditional_2_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r9); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.abrirDesdeContador("cancelaciones")); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 123);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3, "Cancelaciones pendientes");
    i0.ɵɵelementStart(4, "strong");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 29);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r3.otherLoading() ? "\u2026" : ctx_r3.cancellations().length);
} }
function AdminComponent_Conditional_68_Conditional_37_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 90);
    i0.ɵɵtext(1, "Cargando pendientes\u2026");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_68_Conditional_38_For_12_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "tr")(1, "td");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "td")(4, "span", 127);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "td")(7, "button", 128);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_68_Conditional_38_For_12_Template_button_click_7_listener() { const item_r11 = i0.ɵɵrestoreView(_r10).$implicit; const ctx_r3 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r3.openSection(item_r11.section, item_r11.id)); });
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const item_r11 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r11.label);
    i0.ɵɵadvance(2);
    i0.ɵɵattribute("data-tone", item_r11.tone);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r11.status);
    i0.ɵɵadvance(2);
    i0.ɵɵattribute("aria-label", item_r11.action + " " + item_r11.label);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r11.action);
} }
function AdminComponent_Conditional_68_Conditional_38_Conditional_13_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 128);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_68_Conditional_38_Conditional_13_Conditional_3_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r12); const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.verMasPendientes()); });
    i0.ɵɵtext(1, "Ver m\u00E1s");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_68_Conditional_38_Conditional_13_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r13 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 128);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_68_Conditional_38_Conditional_13_Conditional_4_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r13); const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.verMenosPendientes()); });
    i0.ɵɵtext(1, "Ver menos");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_68_Conditional_38_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 126)(1, "span", 90);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, AdminComponent_Conditional_68_Conditional_38_Conditional_13_Conditional_3_Template, 2, 0, "button", 129);
    i0.ɵɵconditionalCreate(4, AdminComponent_Conditional_68_Conditional_38_Conditional_13_Conditional_4_Template, 2, 0, "button", 129);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("Mostrando ", ctx_r3.pendientesMostrados().length, " de ", ctx_r3.pendingCases().length);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.pendingCases().length > ctx_r3.pendientesVisibles() ? 3 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.pendientesVisibles() > ctx_r3.pendientesIniciales ? 4 : -1);
} }
function AdminComponent_Conditional_68_Conditional_38_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 124)(1, "table")(2, "thead")(3, "tr")(4, "th", 125);
    i0.ɵɵtext(5, "Caso");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "th", 125);
    i0.ɵɵtext(7, "Estado");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "th", 125);
    i0.ɵɵtext(9, "Acci\u00F3n");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(10, "tbody");
    i0.ɵɵrepeaterCreate(11, AdminComponent_Conditional_68_Conditional_38_For_12_Template, 9, 5, "tr", null, _forTrack3);
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(13, AdminComponent_Conditional_68_Conditional_38_Conditional_13_Template, 5, 4, "div", 126);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(11);
    i0.ɵɵrepeater(ctx_r3.pendientesMostrados());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r3.pendingCases().length > ctx_r3.pendientesIniciales ? 13 : -1);
} }
function AdminComponent_Conditional_68_Conditional_39_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.summaryError() ? "No hay casos disponibles para mostrar." : "No hay pendientes de atenci\u00F3n.");
} }
function AdminComponent_Conditional_68_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵconditionalCreate(0, AdminComponent_Conditional_68_Conditional_0_Template, 2, 0, "p", 41);
    i0.ɵɵelementStart(1, "div", 107);
    i0.ɵɵconditionalCreate(2, AdminComponent_Conditional_68_Conditional_2_Template, 6, 2, "button", 108);
    i0.ɵɵelementStart(3, "button", 109);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_68_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r8); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.abrirDesdeContador("reclamos")); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(4, "svg", 110);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(5, "span");
    i0.ɵɵtext(6, "Reclamos abiertos");
    i0.ɵɵelementStart(7, "strong");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(9, "button", 111);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_68_Template_button_click_9_listener() { i0.ɵɵrestoreView(_r8); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.abrirDesdeContador("reembolsos")); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(10, "svg", 112);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(11, "span");
    i0.ɵɵtext(12, "Reembolsos pendientes");
    i0.ɵɵelementStart(13, "strong");
    i0.ɵɵtext(14);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(15, "button", 109);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_68_Template_button_click_15_listener() { i0.ɵɵrestoreView(_r8); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.abrirDesdeContador("verificaciones")); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(16, "svg", 113);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(17, "span");
    i0.ɵɵtext(18, "Verificaciones pendientes");
    i0.ɵɵelementStart(19, "strong");
    i0.ɵɵtext(20);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(21, "button", 114);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_68_Template_button_click_21_listener() { i0.ɵɵrestoreView(_r8); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.abrirDesdeContador("liquidaciones")); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(22, "svg", 115);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(23, "span");
    i0.ɵɵtext(24, "Liquidaciones a pagar");
    i0.ɵɵelementStart(25, "strong");
    i0.ɵɵtext(26);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(27, "button", 116);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_68_Template_button_click_27_listener() { i0.ɵɵrestoreView(_r8); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.abrirDesdeContador("bloqueos")); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(28, "svg", 117);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(29, "span");
    i0.ɵɵtext(30, "Apelaciones a responder");
    i0.ɵɵelementStart(31, "strong");
    i0.ɵɵtext(32);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(33, "div", 118)(34, "section", 119)(35, "h2");
    i0.ɵɵtext(36, "Pendientes de atenci\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(37, AdminComponent_Conditional_68_Conditional_37_Template, 2, 0, "p", 90)(38, AdminComponent_Conditional_68_Conditional_38_Template, 14, 1)(39, AdminComponent_Conditional_68_Conditional_39_Template, 2, 1, "p");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(40, "section", 120)(41, "h2");
    i0.ɵɵtext(42, "Accesos r\u00E1pidos");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(43, "button", 11);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_68_Template_button_click_43_listener() { i0.ɵɵrestoreView(_r8); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.openSection("publicaciones")); });
    i0.ɵɵtext(44, "Gestionar publicaciones ");
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(45, "svg", 121);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(46, "button", 11);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_68_Template_button_click_46_listener() { i0.ɵɵrestoreView(_r8); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.openSection("bloqueos")); });
    i0.ɵɵtext(47, "Revisar apelaciones ");
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(48, "svg", 121);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(49, "button", 11);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_68_Template_button_click_49_listener() { i0.ɵɵrestoreView(_r8); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.openSection("cotizaciones")); });
    i0.ɵɵtext(50, "Actualizar cotizaci\u00F3n ");
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(51, "svg", 121);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r3.summaryError() ? 0 : -1);
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-busy", ctx_r3.otherLoading());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.cancellations().length ? 2 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 29);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r3.otherLoading() ? "\u2026" : ctx_r3.openClaims().length);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 29);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r3.otherLoading() ? "\u2026" : ctx_r3.conteoPendientes());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 29);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r3.otherLoading() ? "\u2026" : ctx_r3.requests().length);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 29);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r3.otherLoading() ? "\u2026" : ctx_r3.liquidacionesAPagar().length);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 29);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r3.bloqueadosCargando() ? "\u2026" : ctx_r3.apelacionesAResponder().length);
    i0.ɵɵadvance(5);
    i0.ɵɵconditional(ctx_r3.otherLoading() ? 37 : ctx_r3.pendingCases().length ? 38 : 39);
    i0.ɵɵadvance(8);
    i0.ɵɵproperty("size", 18);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("size", 18);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("size", 18);
} }
function AdminComponent_Conditional_80_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 49);
    i0.ɵɵtext(1, "Cargando liquidaciones\u2026");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_81_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 49);
    i0.ɵɵtext(1, "No hay liquidaciones ni reclamos pendientes.");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_82_For_3_Conditional_4_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 134);
    i0.ɵɵtext(1, "Fecha de habilitaci\u00F3n pendiente de revisi\u00F3n.");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_82_For_3_Conditional_4_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 134);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const dias_r16 = i0.ɵɵreadContextLet(0);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Lapso de espera \u00B7 ", dias_r16 === 1 ? "Falta 1 d\u00EDa" : "Faltan " + dias_r16 + " d\u00EDas", " para habilitar el pago.");
} }
function AdminComponent_Conditional_82_For_3_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdeclareLet(0);
    i0.ɵɵconditionalCreate(1, AdminComponent_Conditional_82_For_3_Conditional_4_Conditional_1_Template, 2, 0, "p", 134)(2, AdminComponent_Conditional_82_For_3_Conditional_4_Conditional_2_Template, 2, 1, "p", 134);
} if (rf & 2) {
    const settlement_r17 = i0.ɵɵnextContext().$implicit;
    const dias_r18 = i0.ɵɵstoreLet(i0.ɵɵnextContext(2).diasEsperaLiquidacion(settlement_r17));
    i0.ɵɵadvance();
    i0.ɵɵconditional(dias_r18 === null ? 1 : dias_r18 > 0 ? 2 : -1);
} }
function AdminComponent_Conditional_82_For_3_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p")(1, "strong");
    i0.ɵɵtext(2, "Pag\u00F3 el inquilino:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const settlement_r17 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", ctx_r3.montoPagado(settlement_r17));
} }
function AdminComponent_Conditional_82_For_3_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " Sin comisi\u00F3n asignada (reserva anterior) ");
} }
function AdminComponent_Conditional_82_For_3_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "currency");
} if (rf & 2) {
    const settlement_r17 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵtextInterpolate2(" ", settlement_r17.porcentaje_comision_depa, " % \u00B7 ", i0.ɵɵpipeBind4(1, 2, settlement_r17.importe_comision_depa, "ARS", "symbol", "1.2-2"), " ");
} }
function AdminComponent_Conditional_82_For_3_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const dolar_r19 = ctx;
    const settlement_r17 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate3("Precio original: ", settlement_r17.moneda_origen, " ", settlement_r17.importe_origen, " \u00B7 D\u00F3lar blue venta: ARS ", dolar_r19.venta, " por USD.");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate4("Cotizaci\u00F3n #", dolar_r19.id, " \u00B7 ", dolar_r19.proveedor, " \u00B7 Publicada: ", dolar_r19.actualizada_fuente_en, " \u00B7 Aceptada: ", settlement_r17.cotizacion_aceptada_en, ".");
} }
function AdminComponent_Conditional_82_For_3_Conditional_31_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 134);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const settlement_r17 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(settlement_r17.observacion_liquidacion);
} }
function AdminComponent_Conditional_82_For_3_Conditional_35_Template(rf, ctx) { if (rf & 1) {
    const _r20 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 139);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_82_For_3_Conditional_35_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r20); const settlement_r17 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.abrirResolucionLiquidacion(settlement_r17, false)); });
    i0.ɵɵtext(1, "Cerrar revisi\u00F3n del pago");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_82_For_3_Conditional_38_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r21 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 142);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_82_For_3_Conditional_38_Conditional_1_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r21); const settlement_r17 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.abrirPagoAnunciante(settlement_r17)); });
    i0.ɵɵtext(1, "Registrar pago al anunciante");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_82_For_3_Conditional_38_Conditional_2_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " No se puede registrar el pago: la fecha de habilitaci\u00F3n est\u00E1 pendiente de revisi\u00F3n. ");
} }
function AdminComponent_Conditional_82_For_3_Conditional_38_Conditional_2_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    i0.ɵɵnextContext(2);
    const diasPago_r22 = i0.ɵɵreadContextLet(0);
    i0.ɵɵtextInterpolate1(" No se puede registrar el pago todav\u00EDa. ", diasPago_r22 === 1 ? "Falta 1 d\u00EDa" : "Faltan " + diasPago_r22 + " d\u00EDas", " para habilitarlo. ");
} }
function AdminComponent_Conditional_82_For_3_Conditional_38_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 141)(1, "button", 143);
    i0.ɵɵtext(2, "Registrar pago al anunciante");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 144);
    i0.ɵɵconditionalCreate(4, AdminComponent_Conditional_82_For_3_Conditional_38_Conditional_2_Conditional_4_Template, 1, 0)(5, AdminComponent_Conditional_82_For_3_Conditional_38_Conditional_2_Conditional_5_Template, 1, 1);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const diasPago_r22 = i0.ɵɵreadContextLet(0);
    const settlement_r17 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵattribute("aria-describedby", "payment-wait-" + settlement_r17.id);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("id", "payment-wait-" + settlement_r17.id);
    i0.ɵɵadvance();
    i0.ɵɵconditional(diasPago_r22 === null ? 4 : 5);
} }
function AdminComponent_Conditional_82_For_3_Conditional_38_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdeclareLet(0);
    i0.ɵɵconditionalCreate(1, AdminComponent_Conditional_82_For_3_Conditional_38_Conditional_1_Template, 2, 0, "button", 140)(2, AdminComponent_Conditional_82_For_3_Conditional_38_Conditional_2_Template, 6, 3, "span", 141);
} if (rf & 2) {
    const settlement_r17 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵstoreLet(ctx_r3.diasEsperaLiquidacion(settlement_r17));
    i0.ɵɵadvance();
    i0.ɵɵconditional(settlement_r17.habilitada_para_pago ? 1 : 2);
} }
function AdminComponent_Conditional_82_For_3_Template(rf, ctx) { if (rf & 1) {
    const _r15 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "article", 131)(1, "div")(2, "span", 133);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, AdminComponent_Conditional_82_For_3_Conditional_4_Template, 3, 2);
    i0.ɵɵelementStart(5, "h3");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p")(8, "strong");
    i0.ɵɵtext(9, "Inquilino:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "p")(12, "strong");
    i0.ɵɵtext(13, "Anunciante:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(14);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(15, AdminComponent_Conditional_82_For_3_Conditional_15_Template, 4, 1, "p");
    i0.ɵɵelementStart(16, "p")(17, "strong");
    i0.ɵɵtext(18, "A liquidar al anunciante:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(19);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "p")(21, "strong");
    i0.ɵɵtext(22, "Comisi\u00F3n DEPA:");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(23, AdminComponent_Conditional_82_For_3_Conditional_23_Template, 1, 0)(24, AdminComponent_Conditional_82_For_3_Conditional_24_Template, 2, 7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "p")(26, "strong");
    i0.ɵɵtext(27, "Neto al anunciante:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(28);
    i0.ɵɵpipe(29, "currency");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(30, AdminComponent_Conditional_82_For_3_Conditional_30_Template, 4, 7);
    i0.ɵɵconditionalCreate(31, AdminComponent_Conditional_82_For_3_Conditional_31_Template, 2, 1, "p", 134);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(32, "div", 135)(33, "a", 136);
    i0.ɵɵtext(34, "Ver reserva");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(35, AdminComponent_Conditional_82_For_3_Conditional_35_Template, 2, 0, "button", 137);
    i0.ɵɵelementStart(36, "button", 138);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_82_For_3_Template_button_click_36_listener() { const settlement_r17 = i0.ɵɵrestoreView(_r15).$implicit; const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.abrirResolucionLiquidacion(settlement_r17, true)); });
    i0.ɵɵtext(37, "Devolver al inquilino");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(38, AdminComponent_Conditional_82_For_3_Conditional_38_Template, 3, 2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_27_0;
    const settlement_r17 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("id", "admin-liquidaciones-" + settlement_r17.id);
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("status--blocked", settlement_r17.estado_liquidacion === "EN_REVISION");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.etiquetaLiquidacion(settlement_r17), " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(settlement_r17.estado_liquidacion !== "EN_REVISION" ? 4 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("Reserva #", settlement_r17.id, " \u00B7 ", settlement_r17.publicacion?.titulo ?? "Publicaci\u00F3n eliminada");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", ctx_r3.nombreInquilino(settlement_r17));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate2(" ", settlement_r17.publicacion?.anunciante?.usuario?.nombre, " ", settlement_r17.publicacion?.anunciante?.usuario?.apellido);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.tieneDevolucion(settlement_r17) ? 15 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", ctx_r3.montoLiquidacion(settlement_r17));
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(settlement_r17.porcentaje_comision_depa == null ? 23 : 24);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind4(29, 20, settlement_r17.importe_neto_anunciante, "ARS", "symbol", "1.2-2"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_27_0 = settlement_r17.cotizacion_dolar) ? 30 : -1, tmp_27_0);
    i0.ɵɵadvance();
    i0.ɵɵconditional(settlement_r17.observacion_liquidacion ? 31 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(25, _c5, settlement_r17.id))("queryParams", i0.ɵɵpureFunction0(27, _c6));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(settlement_r17.estado_liquidacion === "EN_REVISION" ? 35 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r3.pendienteParaAnunciante(settlement_r17) ? 38 : -1);
} }
function AdminComponent_Conditional_82_ForEmpty_4_Template(rf, ctx) { if (rf & 1) {
    const _r14 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p", 49);
    i0.ɵɵtext(1, "No hay liquidaciones que coincidan. ");
    i0.ɵɵelementStart(2, "button", 145);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_82_ForEmpty_4_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r14); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.listaLiquidaciones.limpiar()); });
    i0.ɵɵtext(3, "Limpiar filtros");
    i0.ɵɵelementEnd()();
} }
function AdminComponent_Conditional_82_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r23 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-paginador", 146);
    i0.ɵɵlistener("paginaCambia", function AdminComponent_Conditional_82_Conditional_5_Template_app_paginador_paginaCambia_0_listener($event) { i0.ɵɵrestoreView(_r23); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.listaLiquidaciones.irAPagina($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("pagina", ctx_r3.listaLiquidaciones.pagina())("paginas", ctx_r3.listaLiquidaciones.paginas())("total", ctx_r3.listaLiquidaciones.filtrados().length);
} }
function AdminComponent_Conditional_82_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-filtros-lista", 130);
    i0.ɵɵelementStart(1, "div", 79);
    i0.ɵɵrepeaterCreate(2, AdminComponent_Conditional_82_For_3_Template, 39, 28, "article", 131, _forTrack1, false, AdminComponent_Conditional_82_ForEmpty_4_Template, 4, 0, "p", 49);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, AdminComponent_Conditional_82_Conditional_5_Template, 1, 3, "app-paginador", 132);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("lista", ctx_r3.listaLiquidaciones);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r3.listaLiquidaciones.visibles());
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r3.listaLiquidaciones.filtrados().length ? 5 : -1);
} }
function AdminComponent_Conditional_92_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 49);
    i0.ɵɵtext(1, "No hay solicitudes pendientes.");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_93_For_3_Conditional_23_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 134);
    i0.ɵɵtext(1, "La cancelaci\u00F3n se aprobar\u00E1 sin devoluci\u00F3n.");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_93_For_3_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 153)(1, "strong");
    i0.ɵɵtext(2, "Monto a devolver al inquilino:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "currency");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, AdminComponent_Conditional_93_For_3_Conditional_23_Conditional_5_Template, 2, 0, "p", 134);
} if (rf & 2) {
    const devolucion_r26 = ctx;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2(" ", i0.ɵɵpipeBind4(4, 3, devolucion_r26.importe, devolucion_r26.moneda, "code", "1.2-2"), " (", devolucion_r26.porcentaje, " %)");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(devolucion_r26.porcentaje === 0 ? 5 : -1);
} }
function AdminComponent_Conditional_93_For_3_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 150);
    i0.ɵɵtext(1, "No se puede calcular la devoluci\u00F3n: falta el pago registrado.");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_93_For_3_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 136);
    i0.ɵɵtext(1, "Ver reserva");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(2, _c5, ctx))("queryParams", i0.ɵɵpureFunction0(4, _c7));
} }
function AdminComponent_Conditional_93_For_3_Template(rf, ctx) { if (rf & 1) {
    const _r25 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "article", 131)(1, "div")(2, "span", 149);
    i0.ɵɵtext(3, "Pendiente");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "h3");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p")(7, "strong");
    i0.ɵɵtext(8, "Inquilino:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "p")(11, "strong");
    i0.ɵɵtext(12, "Publicaci\u00F3n:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "p")(15, "strong");
    i0.ɵɵtext(16, "Fechas:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(17);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "p")(19, "strong");
    i0.ɵɵtext(20, "Total de la reserva:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(21);
    i0.ɵɵpipe(22, "currency");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(23, AdminComponent_Conditional_93_For_3_Conditional_23_Template, 6, 8)(24, AdminComponent_Conditional_93_For_3_Conditional_24_Template, 2, 0, "p", 150);
    i0.ɵɵelementStart(25, "p", 134);
    i0.ɵɵtext(26);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(27, "div", 135);
    i0.ɵɵconditionalCreate(28, AdminComponent_Conditional_93_For_3_Conditional_28_Template, 2, 5, "a", 136);
    i0.ɵɵelementStart(29, "button", 151);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_93_For_3_Template_button_click_29_listener() { const solicitud_r27 = i0.ɵɵrestoreView(_r25).$implicit; const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.abrirAprobacionCancelacion(solicitud_r27)); });
    i0.ɵɵtext(30, "Aprobar");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(31, "button", 152);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_93_For_3_Template_button_click_31_listener() { const solicitud_r27 = i0.ɵɵrestoreView(_r25).$implicit; const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.rechazarCancelacion(solicitud_r27)); });
    i0.ɵɵtext(32, "Rechazar");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    let tmp_22_0;
    let tmp_24_0;
    const solicitud_r27 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("id", "admin-cancelaciones-" + solicitud_r27.id);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate2("Solicitud #", solicitud_r27.id, " \u00B7 Reserva #", solicitud_r27.reserva?.id ?? "\u2014");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate2(" ", solicitud_r27.reserva?.usuario?.nombre, " ", solicitud_r27.reserva?.usuario?.apellido);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", solicitud_r27.reserva?.publicacion?.titulo ?? "\u2014");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate2(" ", solicitud_r27.reserva?.fecha_inicio, " \u2014 ", solicitud_r27.reserva?.fecha_fin);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(22, 14, solicitud_r27.reserva?.monto_pago, solicitud_r27.reserva?.moneda_contratada ?? "ARS"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_22_0 = solicitud_r27.devolucion) ? 23 : 24, tmp_22_0);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(solicitud_r27.motivo);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_24_0 = solicitud_r27.reserva?.id) ? 28 : -1, tmp_24_0);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", !solicitud_r27.devolucion || ctx_r3.busy() === "cancellation-" + solicitud_r27.id);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r3.busy() === "cancellation-" + solicitud_r27.id);
} }
function AdminComponent_Conditional_93_ForEmpty_4_Template(rf, ctx) { if (rf & 1) {
    const _r24 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p", 49);
    i0.ɵɵtext(1, "No hay solicitudes que coincidan. ");
    i0.ɵɵelementStart(2, "button", 145);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_93_ForEmpty_4_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r24); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.listaCancelaciones.limpiar()); });
    i0.ɵɵtext(3, "Limpiar filtros");
    i0.ɵɵelementEnd()();
} }
function AdminComponent_Conditional_93_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r28 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-paginador", 154);
    i0.ɵɵlistener("paginaCambia", function AdminComponent_Conditional_93_Conditional_5_Template_app_paginador_paginaCambia_0_listener($event) { i0.ɵɵrestoreView(_r28); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.listaCancelaciones.irAPagina($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("pagina", ctx_r3.listaCancelaciones.pagina())("paginas", ctx_r3.listaCancelaciones.paginas())("total", ctx_r3.listaCancelaciones.filtrados().length);
} }
function AdminComponent_Conditional_93_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-filtros-lista", 147);
    i0.ɵɵelementStart(1, "div", 79);
    i0.ɵɵrepeaterCreate(2, AdminComponent_Conditional_93_For_3_Template, 33, 17, "article", 131, _forTrack1, false, AdminComponent_Conditional_93_ForEmpty_4_Template, 4, 0, "p", 49);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, AdminComponent_Conditional_93_Conditional_5_Template, 1, 3, "app-paginador", 148);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("lista", ctx_r3.listaCancelaciones);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r3.listaCancelaciones.visibles());
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r3.listaCancelaciones.filtrados().length ? 5 : -1);
} }
function AdminComponent_Conditional_103_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 50);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Hay ", ctx_r3.conteoFallidos(), " reembolso(s) fallido(s) que requieren acci\u00F3n manual.");
} }
function AdminComponent_Conditional_104_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 51);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("Mostrando los \u00FAltimos ", ctx_r3.refunds().length, " de ", ctx_r3.totalReembolsos(), ".");
} }
function AdminComponent_Conditional_105_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 49);
    i0.ɵɵtext(1, "No hay reembolsos registrados.");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_106_For_3_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 63);
    i0.ɵɵtext(1, "Creado el ");
    i0.ɵɵelementStart(2, "time");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "date");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const reembolso_r31 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵattribute("datetime", reembolso_r31.creado_en);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind3(4, 2, reembolso_r31.creado_en, "dd/MM/yyyy HH:mm", "-0300"));
} }
function AdminComponent_Conditional_106_For_3_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "Transferencia bancaria pendiente \u00B7 Chat disponible");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_106_For_3_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 136);
    i0.ɵɵtext(1, "Ver reserva");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(2, _c5, ctx))("queryParams", i0.ɵɵpureFunction0(4, _c8));
} }
function AdminComponent_Conditional_106_For_3_Template(rf, ctx) { if (rf & 1) {
    const _r30 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "article", 131)(1, "div")(2, "span", 133);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "h3");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p")(7, "strong");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "currency");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "p", 63);
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(13, AdminComponent_Conditional_106_For_3_Conditional_13_Template, 5, 6, "p", 63);
    i0.ɵɵconditionalCreate(14, AdminComponent_Conditional_106_For_3_Conditional_14_Template, 2, 0, "p");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "div", 135);
    i0.ɵɵconditionalCreate(16, AdminComponent_Conditional_106_For_3_Conditional_16_Template, 2, 5, "a", 136);
    i0.ɵɵelementStart(17, "button", 139);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_106_For_3_Template_button_click_17_listener() { const reembolso_r31 = i0.ɵɵrestoreView(_r30).$implicit; const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.abrirReembolso(reembolso_r31)); });
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    let tmp_25_0;
    const reembolso_r31 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("id", "admin-reembolsos-" + reembolso_r31.id);
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("status--blocked", reembolso_r31.estado === "PENDIENTE" || reembolso_r31.estado === "FALLIDO");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", reembolso_r31.referencia_externa?.startsWith("SIMULADO:tarjeta:") ? "Simulado" : ctx_r3.estadosReembolso[reembolso_r31.estado], " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("Reembolso #", reembolso_r31.id, " \u00B7 Reserva #", reembolso_r31.reserva?.id ?? "\u2014");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(reembolso_r31.tipo);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" \u00B7 ", i0.ɵɵpipeBind2(10, 14, reembolso_r31.importe, reembolso_r31.moneda));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("", ctx_r3.origenesReembolso[reembolso_r31.origen] || reembolso_r31.origen, " \u00B7 ", reembolso_r31.motivo);
    i0.ɵɵadvance();
    i0.ɵɵconditional(reembolso_r31.creado_en ? 13 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.puedeRegistrarTransferencia(reembolso_r31) ? 14 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_25_0 = reembolso_r31.reserva?.id) ? 16 : -1, tmp_25_0);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r3.puedeRegistrarTransferencia(reembolso_r31) ? "Ver detalle y chat" : "Ver detalle", " ");
} }
function AdminComponent_Conditional_106_ForEmpty_4_Template(rf, ctx) { if (rf & 1) {
    const _r29 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p", 49);
    i0.ɵɵtext(1, "No hay reembolsos que coincidan. ");
    i0.ɵɵelementStart(2, "button", 145);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_106_ForEmpty_4_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r29); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.listaReembolsos.limpiar()); });
    i0.ɵɵtext(3, "Limpiar filtros");
    i0.ɵɵelementEnd()();
} }
function AdminComponent_Conditional_106_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r32 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-paginador", 157);
    i0.ɵɵlistener("paginaCambia", function AdminComponent_Conditional_106_Conditional_5_Template_app_paginador_paginaCambia_0_listener($event) { i0.ɵɵrestoreView(_r32); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.listaReembolsos.irAPagina($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("pagina", ctx_r3.listaReembolsos.pagina())("paginas", ctx_r3.listaReembolsos.paginas())("total", ctx_r3.listaReembolsos.filtrados().length);
} }
function AdminComponent_Conditional_106_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-filtros-lista", 155);
    i0.ɵɵelementStart(1, "div", 79);
    i0.ɵɵrepeaterCreate(2, AdminComponent_Conditional_106_For_3_Template, 19, 17, "article", 131, _forTrack1, false, AdminComponent_Conditional_106_ForEmpty_4_Template, 4, 0, "p", 49);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, AdminComponent_Conditional_106_Conditional_5_Template, 1, 3, "app-paginador", 156);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("lista", ctx_r3.listaReembolsos);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r3.listaReembolsos.visibles());
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r3.listaReembolsos.filtrados().length ? 5 : -1);
} }
function AdminComponent_Conditional_108_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 52);
    i0.ɵɵtext(1, "Cargando historial de liquidaciones.");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_109_Template(rf, ctx) { if (rf & 1) {
    const _r33 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p", 75);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "button", 139);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_109_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r33); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.cargarHistorialLiquidaciones()); });
    i0.ɵɵtext(3, "Reintentar");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.historialError());
} }
function AdminComponent_Conditional_110_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 49);
    i0.ɵɵtext(1, "Todav\u00EDa no hay pagos a anunciantes registrados.");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_111_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r35 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p", 49);
    i0.ɵɵtext(1, "No hay pagos que coincidan. ");
    i0.ɵɵelementStart(2, "button", 145);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_111_Conditional_7_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r35); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.limpiarHistorialLiquidaciones()); });
    i0.ɵɵtext(3, "Limpiar filtros");
    i0.ɵɵelementEnd()();
} }
function AdminComponent_Conditional_111_Conditional_8_For_20_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 177);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 178);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "date");
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "span", 179);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(5, "svg", 180);
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "date");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const pago_r37 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 16);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind3(3, 4, pago_r37.fecha, "dd/MM/yyyy", "-0300"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("size", 16);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind3(7, 8, pago_r37.fecha, "HH:mm", "-0300"));
} }
function AdminComponent_Conditional_111_Conditional_8_For_20_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " Sin fecha ");
} }
function AdminComponent_Conditional_111_Conditional_8_For_20_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-desglose-pago", 172);
} if (rf & 2) {
    const pago_r37 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("desglose", ctx)("moneda", pago_r37.moneda);
} }
function AdminComponent_Conditional_111_Conditional_8_For_20_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-ver-comprobante", 174);
} if (rf & 2) {
    const pago_r37 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("obtenerUrl", ctx_r3.urlComprobantePago(pago_r37))("etiqueta", "Ver " + pago_r37.comprobante);
} }
function AdminComponent_Conditional_111_Conditional_8_For_20_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 134);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const pago_r37 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(pago_r37.observacion);
} }
function AdminComponent_Conditional_111_Conditional_8_For_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td", 166);
    i0.ɵɵconditionalCreate(2, AdminComponent_Conditional_111_Conditional_8_For_20_Conditional_2_Template, 8, 12)(3, AdminComponent_Conditional_111_Conditional_8_For_20_Conditional_3_Template, 1, 0);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "td", 167)(5, "a", 168);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "span", 169);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "td", 170);
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "td", 171);
    i0.ɵɵtext(12);
    i0.ɵɵconditionalCreate(13, AdminComponent_Conditional_111_Conditional_8_For_20_Conditional_13_Template, 1, 2, "app-desglose-pago", 172);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "td", 173);
    i0.ɵɵconditionalCreate(15, AdminComponent_Conditional_111_Conditional_8_For_20_Conditional_15_Template, 1, 2, "app-ver-comprobante", 174);
    i0.ɵɵelementStart(16, "p", 175);
    i0.ɵɵtext(17);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(18, AdminComponent_Conditional_111_Conditional_8_For_20_Conditional_18_Template, 2, 1, "p", 134);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "td", 176);
    i0.ɵɵtext(20);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_25_0;
    const pago_r37 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(pago_r37.fecha ? 2 : 3);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(13, _c5, pago_r37.reservaId))("queryParams", i0.ɵɵpureFunction0(15, _c9));
    i0.ɵɵattribute("aria-label", "Ver reserva #" + pago_r37.reservaId);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("#", pago_r37.reservaId);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(pago_r37.publicacion || "Publicaci\u00F3n no disponible");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(pago_r37.anunciante || "Sin datos");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", pago_r37.importe === null ? "Sin importe" : ctx_r3.importeConMoneda(pago_r37.importe, pago_r37.moneda), " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_25_0 = pago_r37.desglose) ? 13 : -1, tmp_25_0);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(pago_r37.comprobante ? 15 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(pago_r37.referencia ? "N.\u00BA de operaci\u00F3n: " + pago_r37.referencia : "Sin n\u00FAmero de operaci\u00F3n");
    i0.ɵɵadvance();
    i0.ɵɵconditional(pago_r37.observacion ? 18 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(pago_r37.administrador || "Sin datos");
} }
function AdminComponent_Conditional_111_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r36 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 162)(1, "table", 163)(2, "caption", 164);
    i0.ɵɵtext(3, "Pagos registrados a anunciantes");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "thead")(5, "tr")(6, "th", 125);
    i0.ɵɵtext(7, "Fecha de registro");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "th", 125);
    i0.ɵɵtext(9, "Reserva");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "th", 125);
    i0.ɵɵtext(11, "Anunciante");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "th", 125);
    i0.ɵɵtext(13, "Importe");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "th", 125);
    i0.ɵɵtext(15, "Comprobante y observaci\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "th", 125);
    i0.ɵɵtext(17, "Registrado por");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(18, "tbody");
    i0.ɵɵrepeaterCreate(19, AdminComponent_Conditional_111_Conditional_8_For_20_Template, 21, 16, "tr", null, _forTrack1);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(21, "app-paginador", 165);
    i0.ɵɵlistener("paginaCambia", function AdminComponent_Conditional_111_Conditional_8_Template_app_paginador_paginaCambia_21_listener($event) { i0.ɵɵrestoreView(_r36); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.listaHistorialLiquidaciones.irAPagina($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(19);
    i0.ɵɵrepeater(ctx_r3.listaHistorialLiquidaciones.visibles());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("pagina", ctx_r3.listaHistorialLiquidaciones.pagina())("paginas", ctx_r3.listaHistorialLiquidaciones.paginas())("total", ctx_r3.listaHistorialLiquidaciones.filtrados().length);
} }
function AdminComponent_Conditional_111_Template(rf, ctx) { if (rf & 1) {
    const _r34 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-filtros-lista", 158)(1, "label", 159);
    i0.ɵɵtext(2, "Desde ");
    i0.ɵɵelementStart(3, "input", 160);
    i0.ɵɵlistener("change", function AdminComponent_Conditional_111_Template_input_change_3_listener($event) { i0.ɵɵrestoreView(_r34); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.filtrarHistorialLiquidaciones("desde", $event.target.value)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(4, "label", 159);
    i0.ɵɵtext(5, "Hasta ");
    i0.ɵɵelementStart(6, "input", 161);
    i0.ɵɵlistener("change", function AdminComponent_Conditional_111_Template_input_change_6_listener($event) { i0.ɵɵrestoreView(_r34); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.filtrarHistorialLiquidaciones("hasta", $event.target.value)); });
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(7, AdminComponent_Conditional_111_Conditional_7_Template, 4, 0, "p", 49)(8, AdminComponent_Conditional_111_Conditional_8_Template, 22, 3);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("lista", ctx_r3.listaHistorialLiquidaciones);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("value", ctx_r3.historialDesde())("max", ctx_r3.historialHasta() || null);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("value", ctx_r3.historialHasta())("min", ctx_r3.historialDesde() || null);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!ctx_r3.listaHistorialLiquidaciones.filtrados().length ? 7 : 8);
} }
function AdminComponent_Conditional_115_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const decision_r39 = i0.ɵɵnextContext();
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(" Lo que queda del pago (", ctx_r3.montoLiquidacion(decision_r39.reserva), ") se derivar\u00E1 a Reembolsos para devolv\u00E9rselo al inquilino seg\u00FAn el medio de pago. El anunciante no recibir\u00E1 ese importe. ");
} }
function AdminComponent_Conditional_115_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const decision_r39 = i0.ɵɵnextContext();
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(" La reserva quedar\u00E1 pendiente de pago al anunciante por ", ctx_r3.montoLiquidacion(decision_r39.reserva), ". ");
} }
function AdminComponent_Conditional_115_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " El pago seguir\u00E1 retenido hasta que se valide el c\u00F3digo de alojamiento. ");
} }
function AdminComponent_Conditional_115_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 75);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.resolucionError());
} }
function AdminComponent_Conditional_115_Template(rf, ctx) { if (rf & 1) {
    const _r38 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "h2", 181);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "p", 59);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 182);
    i0.ɵɵconditionalCreate(5, AdminComponent_Conditional_115_Conditional_5_Template, 1, 1)(6, AdminComponent_Conditional_115_Conditional_6_Template, 1, 1)(7, AdminComponent_Conditional_115_Conditional_7_Template, 1, 0);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "label", 183);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "textarea", 184);
    i0.ɵɵtwoWayListener("ngModelChange", function AdminComponent_Conditional_115_Template_textarea_ngModelChange_10_listener($event) { i0.ɵɵrestoreView(_r38); const ctx_r3 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r3.motivoResolucion, $event) || (ctx_r3.motivoResolucion = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(11, AdminComponent_Conditional_115_Conditional_11_Template, 2, 1, "p", 75);
    i0.ɵɵelementStart(12, "div", 42)(13, "button", 43);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_115_Template_button_click_13_listener() { i0.ɵɵrestoreView(_r38); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.cerrarResolucionLiquidacion()); });
    i0.ɵɵtext(14, "Volver");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "button", 185);
    i0.ɵɵtext(16);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const decision_r39 = ctx;
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(decision_r39.devolver ? "Devolver el pago al inquilino" : "Cerrar revisi\u00F3n del pago");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("Reserva #", decision_r39.reserva.id, " \u00B7 ", decision_r39.reserva.publicacion?.titulo ?? "Publicaci\u00F3n no disponible");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(decision_r39.devolver ? 5 : ctx_r3.estadoAlCerrarRevision(decision_r39.reserva) === "PENDIENTE_PAGO_PROPIETARIO" ? 6 : 7);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(decision_r39.devolver ? "Motivo de la devoluci\u00F3n" : "Conclusi\u00F3n de la revisi\u00F3n");
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.motivoResolucion);
    i0.ɵɵproperty("disabled", ctx_r3.resolucionCargando());
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.resolucionError() ? 11 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r3.resolucionCargando());
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("button--danger-outline", decision_r39.devolver)("button--success", !decision_r39.devolver);
    i0.ɵɵproperty("disabled", ctx_r3.resolucionCargando() || !ctx_r3.motivoResolucion.trim());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.resolucionCargando() ? "Guardando\u2026" : decision_r39.devolver ? "Pasar a Reembolsos" : "Guardar conclusi\u00F3n", " ");
} }
function AdminComponent_Conditional_125_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 59);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r40 = ctx;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("Reserva #", item_r40.id, " \u00B7 ", item_r40.publicacion?.titulo ?? "Publicaci\u00F3n eliminada");
} }
function AdminComponent_Conditional_126_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 182);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r41 = i0.ɵɵnextContext();
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("El inquilino pag\u00F3 ", ctx_r3.montoPagado(item_r41), "; ya se le devolvi\u00F3 la diferencia.");
} }
function AdminComponent_Conditional_126_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " Sin comisi\u00F3n asignada (reserva anterior) ");
} }
function AdminComponent_Conditional_126_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "currency");
} if (rf & 2) {
    const item_r41 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate2(" ", item_r41.porcentaje_comision_depa, " % \u00B7 ", i0.ɵɵpipeBind4(1, 2, item_r41.importe_comision_depa, "ARS", "symbol", "1.2-2"), " ");
} }
function AdminComponent_Conditional_126_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 90);
    i0.ɵɵtext(1, "Consultando el CBU validado\u2026");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_126_Conditional_21_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵtextInterpolate1(" \u00B7 CUIT/CUIL ", ctx_r3.formatearCuit(ctx), " ");
} }
function AdminComponent_Conditional_126_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 193);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵelement(2, "app-dato-copiable", 194);
    i0.ɵɵelementStart(3, "p", 195)(4, "strong");
    i0.ɵɵtext(5, "Titular:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(6);
    i0.ɵɵconditionalCreate(7, AdminComponent_Conditional_126_Conditional_21_Conditional_7_Template, 1, 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_15_0;
    const cbu_r42 = ctx;
    const item_r41 = i0.ɵɵnextContext();
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("", ctx_r3.tipoCuentaBancaria(cbu_r42), " validado");
    i0.ɵɵadvance();
    i0.ɵɵproperty("valor", ctx_r3.formatearCbu(cbu_r42))("copia", cbu_r42)("descripcion", ctx_r3.tipoCuentaBancaria(cbu_r42))("monoespaciado", true);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate2(" ", item_r41.publicacion?.anunciante?.usuario?.nombre, " ", item_r41.publicacion?.anunciante?.usuario?.apellido);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_15_0 = ctx_r3.cuitParaPago()) ? 7 : -1, tmp_15_0);
} }
function AdminComponent_Conditional_126_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 67);
    i0.ɵɵtext(1, "El anunciante necesita un CBU validado para recibir el pago.");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_126_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 186)(1, "p", 187)(2, "strong");
    i0.ɵɵtext(3, "Importe a liquidar");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(6, AdminComponent_Conditional_126_Conditional_6_Template, 2, 1, "p", 182);
    i0.ɵɵelementStart(7, "p", 188)(8, "strong");
    i0.ɵɵtext(9, "Comisi\u00F3n DEPA:");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(10, AdminComponent_Conditional_126_Conditional_10_Template, 1, 0)(11, AdminComponent_Conditional_126_Conditional_11_Template, 2, 7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "div", 189)(13, "strong");
    i0.ɵɵtext(14, "Importe a transferir");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(15, "app-dato-copiable", 190);
    i0.ɵɵpipe(16, "currency");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(17, "section", 191)(18, "h3", 192);
    i0.ɵɵtext(19, "Datos para transferir");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(20, AdminComponent_Conditional_126_Conditional_20_Template, 2, 0, "p", 90)(21, AdminComponent_Conditional_126_Conditional_21_Template, 8, 8)(22, AdminComponent_Conditional_126_Conditional_22_Template, 2, 0, "p", 67);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_12_0;
    const item_r41 = ctx;
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r3.montoLiquidacion(item_r41));
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.tieneDevolucion(item_r41) ? 6 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(item_r41.porcentaje_comision_depa == null ? 10 : 11);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("valor", i0.ɵɵpipeBind4(16, 6, item_r41.importe_neto_anunciante, "ARS", "symbol", "1.2-2") ?? "")("copia", ctx_r3.importeParaCopiar(item_r41.importe_neto_anunciante));
    i0.ɵɵadvance(5);
    i0.ɵɵconditional(ctx_r3.consultandoCbuParaPago() ? 20 : (tmp_12_0 = ctx_r3.cbuParaPago()) ? 21 : !ctx_r3.errorPagoAnunciante() ? 22 : -1, tmp_12_0);
} }
function AdminComponent_Conditional_140_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 67);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.errorPagoAnunciante());
} }
function AdminComponent_Conditional_153_Conditional_2_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "La reserva se cancelar\u00E1 sin devoluci\u00F3n al inquilino.");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_153_Conditional_2_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "Al confirmar se generar\u00E1 una devoluci\u00F3n pendiente de gesti\u00F3n en Reembolsos.");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_153_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 196)(1, "p");
    i0.ɵɵtext(2, "Monto a devolver al inquilino");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "currency");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p");
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "date");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(9, AdminComponent_Conditional_153_Conditional_2_Conditional_9_Template, 2, 0, "p")(10, AdminComponent_Conditional_153_Conditional_2_Conditional_10_Template, 2, 0, "p");
} if (rf & 2) {
    const devolucion_r43 = ctx;
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind4(5, 4, devolucion_r43.importe, devolucion_r43.moneda, "code", "1.2-2"), " (", devolucion_r43.porcentaje, " %)");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("Calculado a la fecha de solicitud: ", i0.ɵɵpipeBind3(8, 9, devolucion_r43.fechaSolicitud, "dd/MM/yyyy", "UTC"), ".");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(devolucion_r43.porcentaje === 0 ? 9 : 10);
} }
function AdminComponent_Conditional_153_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 59);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(2, AdminComponent_Conditional_153_Conditional_2_Template, 11, 13);
} if (rf & 2) {
    let tmp_8_0;
    const solicitud_r44 = ctx;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("Solicitud #", solicitud_r44.id, " \u00B7 Reserva #", solicitud_r44.reserva?.id ?? "-");
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_8_0 = solicitud_r44.devolucion) ? 2 : -1, tmp_8_0);
} }
function AdminComponent_Conditional_161_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 75);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.errorAprobacion());
} }
function AdminComponent_Conditional_169_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-dato-copiable", 203);
    i0.ɵɵpipe(1, "currency");
} if (rf & 2) {
    const item_r46 = i0.ɵɵnextContext();
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("valor", i0.ɵɵpipeBind2(1, 2, item_r46.importe, item_r46.moneda) ?? "")("copia", ctx_r3.importeParaCopiar(item_r46.importe));
} }
function AdminComponent_Conditional_169_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "strong", 204);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "currency");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r46 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, item_r46.importe, item_r46.moneda));
} }
function AdminComponent_Conditional_169_Conditional_41_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2, "Estad\u00EDa");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "dd");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "date");
    i0.ɵɵpipe(6, "date");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r46 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate2("", i0.ɵɵpipeBind3(5, 2, item_r46.reserva?.fecha_inicio, "dd/MM/yyyy", "UTC"), " \u2013 ", i0.ɵɵpipeBind3(6, 6, item_r46.reserva?.fecha_fin, "dd/MM/yyyy", "UTC"));
} }
function AdminComponent_Conditional_169_Conditional_42_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2, "Pago original");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "dd");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const pago_r47 = ctx;
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(pago_r47.payment_id ? "Mercado Pago #" + pago_r47.payment_id : "Pago #" + pago_r47.id);
} }
function AdminComponent_Conditional_169_Conditional_43_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2, "Devoluci\u00F3n de prueba");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "dd");
    i0.ɵɵtext(4, "Simulada. No se transfiri\u00F3 dinero.");
    i0.ɵɵelementEnd()();
} }
function AdminComponent_Conditional_169_Conditional_44_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "dd");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r46 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r46.transferencia_manual ? "N\u00FAmero de operaci\u00F3n" : "Referencia de devoluci\u00F3n");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r46.referencia_externa);
} }
function AdminComponent_Conditional_169_Conditional_45_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2, "Comprobante");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "dd");
    i0.ɵɵelement(4, "app-ver-comprobante", 174);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r46 = i0.ɵɵnextContext();
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("obtenerUrl", ctx_r3.urlComprobanteReembolso(item_r46.id))("etiqueta", "Ver " + item_r46.comprobante_nombre);
} }
function AdminComponent_Conditional_169_Conditional_46_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2, "Resuelto");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "dd");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "date");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r46 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(5, 1, item_r46.resuelto_en, "dd/MM/yyyy, HH:mm"));
} }
function AdminComponent_Conditional_169_Conditional_47_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2, "Registrado por");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "dd");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const administrador_r48 = ctx;
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate2("", administrador_r48.nombre, " ", administrador_r48.apellido);
} }
function AdminComponent_Conditional_169_Conditional_48_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2, "Aplicado a la reserva");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "dd");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "date");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r46 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(5, 1, item_r46.aplicado_en, "dd/MM/yyyy, HH:mm"));
} }
function AdminComponent_Conditional_169_Conditional_54_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 206)(1, "dt");
    i0.ɵɵtext(2, "Observaci\u00F3n de la transferencia");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "dd");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r46 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(item_r46.observacion_transferencia);
} }
function AdminComponent_Conditional_169_Conditional_55_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 182);
    i0.ɵɵtext(1, "Reembolso hist\u00F3rico pendiente de revisi\u00F3n administrativa.");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_169_Conditional_56_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 182);
    i0.ɵɵtext(1, "El reembolso est\u00E1 aprobado y pendiente de aplicar a la reserva.");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_169_Conditional_57_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 207);
    i0.ɵɵtext(1, "Pedile al inquilino su CBU o alias por el chat, transfer\u00ED el importe y adjunt\u00E1 el comprobante. El inquilino va a poder ver el comprobante, el n\u00FAmero de operaci\u00F3n y la observaci\u00F3n.");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_169_Conditional_58_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "details", 208)(1, "summary");
    i0.ɵɵtext(2, "Conversaci\u00F3n con el inquilino");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(3, "app-reembolso-chat", 210);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r46 = i0.ɵɵnextContext();
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("open", ctx_r3.puedeRegistrarTransferencia(item_r46));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("reembolsoId", item_r46.id);
} }
function AdminComponent_Conditional_169_Conditional_59_Template(rf, ctx) { if (rf & 1) {
    const _r49 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-carga-comprobante", 61);
    i0.ɵɵtwoWayListener("archivoChange", function AdminComponent_Conditional_169_Conditional_59_Template_app_carga_comprobante_archivoChange_0_listener($event) { i0.ɵɵrestoreView(_r49); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.comprobanteReembolso, $event) || (ctx_r3.comprobanteReembolso = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(1, "label", 211);
    i0.ɵɵtext(2, "N\u00FAmero de operaci\u00F3n ");
    i0.ɵɵelementStart(3, "span", 63);
    i0.ɵɵtext(4, "(opcional)");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "input", 212);
    i0.ɵɵtwoWayListener("ngModelChange", function AdminComponent_Conditional_169_Conditional_59_Template_input_ngModelChange_5_listener($event) { i0.ɵɵrestoreView(_r49); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.referenciaReembolso, $event) || (ctx_r3.referenciaReembolso = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(6, "label", 213);
    i0.ɵɵtext(7, "Observaci\u00F3n ");
    i0.ɵɵelementStart(8, "span", 63);
    i0.ɵɵtext(9, "(opcional)");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(10, "textarea", 214);
    i0.ɵɵtwoWayListener("ngModelChange", function AdminComponent_Conditional_169_Conditional_59_Template_textarea_ngModelChange_10_listener($event) { i0.ɵɵrestoreView(_r49); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.observacionReembolso, $event) || (ctx_r3.observacionReembolso = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵtwoWayProperty("archivo", ctx_r3.comprobanteReembolso);
    i0.ɵɵproperty("deshabilitado", ctx_r3.guardandoReembolso());
    i0.ɵɵadvance(5);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.referenciaReembolso);
    i0.ɵɵproperty("disabled", ctx_r3.guardandoReembolso());
    i0.ɵɵcontrol();
    i0.ɵɵadvance(5);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.observacionReembolso);
    i0.ɵɵproperty("disabled", ctx_r3.guardandoReembolso());
    i0.ɵɵcontrol();
} }
function AdminComponent_Conditional_169_Conditional_60_Template(rf, ctx) { if (rf & 1) {
    const _r50 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 215);
    i0.ɵɵtext(1, "ID del reembolso en Mercado Pago");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "input", 216);
    i0.ɵɵtwoWayListener("ngModelChange", function AdminComponent_Conditional_169_Conditional_60_Template_input_ngModelChange_2_listener($event) { i0.ɵɵrestoreView(_r50); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.referenciaReembolso, $event) || (ctx_r3.referenciaReembolso = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(3, "p", 182);
    i0.ɵɵtext(4, "Se verifica una devoluci\u00F3n ya realizada en Mercado Pago.");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.referenciaReembolso);
    i0.ɵɵproperty("disabled", ctx_r3.guardandoReembolso());
    i0.ɵɵcontrol();
} }
function AdminComponent_Conditional_169_Conditional_61_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 182);
    i0.ɵɵtext(1, "Al confirmar, se solicitar\u00E1 la devoluci\u00F3n a Mercado Pago por el importe indicado.");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_169_Conditional_62_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 182);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r46 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r46.referencia_interna?.startsWith("auto-can:") ? "La devoluci\u00F3n est\u00E1 en gesti\u00F3n autom\u00E1tica." : "El pago original no tiene un identificador de Mercado Pago.");
} }
function AdminComponent_Conditional_169_Conditional_63_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 182);
    i0.ɵɵtext(1, "Para devolver por transferencia, DEPA verifica en Mercado Pago que no haya una devoluci\u00F3n pendiente o sin conciliar.");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_169_Conditional_64_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 75);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.errorReembolso());
} }
function AdminComponent_Conditional_169_Conditional_68_Template(rf, ctx) { if (rf & 1) {
    const _r51 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 43);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_169_Conditional_68_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r51); const item_r46 = i0.ɵɵnextContext(); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.habilitarTransferenciaReembolso(item_r46)); });
    i0.ɵɵtext(1, "Habilitar transferencia");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r3.guardandoReembolso());
} }
function AdminComponent_Conditional_169_Conditional_69_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 68);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r46 = i0.ɵɵnextContext();
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r3.guardandoReembolso() || !ctx_r3.referenciaReembolsoValida(item_r46));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.guardandoReembolso() ? "Procesando\u2026" : ctx_r3.puedeRegistrarTransferencia(item_r46) ? "Registrar transferencia" : ctx_r3.puedeConciliarReembolso(item_r46) ? "Conciliar devoluci\u00F3n" : "Solicitar devoluci\u00F3n", " ");
} }
function AdminComponent_Conditional_169_Template(rf, ctx) { if (rf & 1) {
    const _r45 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 28);
    i0.ɵɵlistener("ngSubmit", function AdminComponent_Conditional_169_Template_form_ngSubmit_0_listener() { const item_r46 = i0.ɵɵrestoreView(_r45); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.procesarReembolso(item_r46)); });
    i0.ɵɵelementStart(1, "header", 197)(2, "div", 55)(3, "div", 56);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(4, "svg", 198);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(5, "div")(6, "h2", 199);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "p", 59);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(10, "button", 200);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_169_Template_button_click_10_listener() { i0.ɵɵrestoreView(_r45); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.cerrarReembolso()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(11, "svg", 201);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(12, "div", 202)(13, "span");
    i0.ɵɵtext(14);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(15, AdminComponent_Conditional_169_Conditional_15_Template, 2, 5, "app-dato-copiable", 203)(16, AdminComponent_Conditional_169_Conditional_16_Template, 3, 4, "strong", 204);
    i0.ɵɵelementStart(17, "span", 133);
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(19, "dl", 205)(20, "div")(21, "dt");
    i0.ɵɵtext(22, "Publicaci\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "dd");
    i0.ɵɵtext(24);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(25, "div")(26, "dt");
    i0.ɵɵtext(27, "Inquilino");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(28, "dd");
    i0.ɵɵtext(29);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(30, "div")(31, "dt");
    i0.ɵɵtext(32, "Origen");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "dd");
    i0.ɵɵtext(34);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(35, "div")(36, "dt");
    i0.ɵɵtext(37, "Creado");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(38, "dd");
    i0.ɵɵtext(39);
    i0.ɵɵpipe(40, "date");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(41, AdminComponent_Conditional_169_Conditional_41_Template, 7, 10, "div");
    i0.ɵɵconditionalCreate(42, AdminComponent_Conditional_169_Conditional_42_Template, 5, 1, "div");
    i0.ɵɵconditionalCreate(43, AdminComponent_Conditional_169_Conditional_43_Template, 5, 0, "div")(44, AdminComponent_Conditional_169_Conditional_44_Template, 5, 2, "div");
    i0.ɵɵconditionalCreate(45, AdminComponent_Conditional_169_Conditional_45_Template, 5, 2, "div");
    i0.ɵɵconditionalCreate(46, AdminComponent_Conditional_169_Conditional_46_Template, 6, 4, "div");
    i0.ɵɵconditionalCreate(47, AdminComponent_Conditional_169_Conditional_47_Template, 5, 2, "div");
    i0.ɵɵconditionalCreate(48, AdminComponent_Conditional_169_Conditional_48_Template, 6, 4, "div");
    i0.ɵɵelementStart(49, "div", 206)(50, "dt");
    i0.ɵɵtext(51, "Motivo");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(52, "dd");
    i0.ɵɵtext(53);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(54, AdminComponent_Conditional_169_Conditional_54_Template, 5, 1, "div", 206);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(55, AdminComponent_Conditional_169_Conditional_55_Template, 2, 0, "p", 182)(56, AdminComponent_Conditional_169_Conditional_56_Template, 2, 0, "p", 182);
    i0.ɵɵconditionalCreate(57, AdminComponent_Conditional_169_Conditional_57_Template, 2, 0, "p", 207);
    i0.ɵɵconditionalCreate(58, AdminComponent_Conditional_169_Conditional_58_Template, 4, 2, "details", 208);
    i0.ɵɵconditionalCreate(59, AdminComponent_Conditional_169_Conditional_59_Template, 11, 6)(60, AdminComponent_Conditional_169_Conditional_60_Template, 5, 2)(61, AdminComponent_Conditional_169_Conditional_61_Template, 2, 0, "p", 182)(62, AdminComponent_Conditional_169_Conditional_62_Template, 2, 1, "p", 182);
    i0.ɵɵconditionalCreate(63, AdminComponent_Conditional_169_Conditional_63_Template, 2, 0, "p", 182);
    i0.ɵɵconditionalCreate(64, AdminComponent_Conditional_169_Conditional_64_Template, 2, 1, "p", 75);
    i0.ɵɵelementStart(65, "div", 42)(66, "button", 43);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_169_Template_button_click_66_listener() { i0.ɵɵrestoreView(_r45); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.cerrarReembolso()); });
    i0.ɵɵtext(67, "Volver");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(68, AdminComponent_Conditional_169_Conditional_68_Template, 2, 1, "button", 209);
    i0.ɵɵconditionalCreate(69, AdminComponent_Conditional_169_Conditional_69_Template, 2, 2, "button", 68);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_22_0;
    let tmp_26_0;
    const item_r46 = ctx;
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵattribute("aria-busy", ctx_r3.guardandoReembolso());
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("size", 26);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r3.puedeRegistrarTransferencia(item_r46) ? "Registrar transferencia del reembolso" : "Detalle del reembolso");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("Reembolso #", item_r46.id, " \u00B7 Reserva #", item_r46.reserva?.id ?? "\u2014");
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r3.guardandoReembolso());
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 20);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(item_r46.tipo === "TOTAL" ? "Devoluci\u00F3n total" : item_r46.tipo === "PARCIAL" ? "Devoluci\u00F3n parcial" : "Contracargo");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.puedeRegistrarTransferencia(item_r46) ? 15 : 16);
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("status--blocked", item_r46.estado === "PENDIENTE" || ctx_r3.puedeConciliarReembolso(item_r46));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.estadosReembolso[item_r46.estado]);
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(item_r46.reserva?.publicacion?.titulo || "Sin datos");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate2("", item_r46.reserva?.usuario?.nombre || "Sin datos", " ", item_r46.reserva?.usuario?.apellido);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r3.origenesReembolso[item_r46.origen] || item_r46.origen);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(40, 35, item_r46.creado_en, "dd/MM/yyyy, HH:mm"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(item_r46.reserva?.fecha_inicio && item_r46.reserva?.fecha_fin ? 41 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_22_0 = item_r46.pago) ? 42 : -1, tmp_22_0);
    i0.ɵɵadvance();
    i0.ɵɵconditional(item_r46.referencia_externa?.startsWith("SIMULADO:tarjeta:") ? 43 : item_r46.referencia_externa ? 44 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(item_r46.comprobante_nombre ? 45 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(item_r46.resuelto_en ? 46 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_26_0 = item_r46.resuelto_por) ? 47 : -1, tmp_26_0);
    i0.ɵɵadvance();
    i0.ɵɵconditional(item_r46.aplicado_en ? 48 : -1);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(item_r46.motivo);
    i0.ɵɵadvance();
    i0.ɵɵconditional(item_r46.observacion_transferencia ? 54 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(item_r46.revision_aplicacion ? 55 : item_r46.estado === "APROBADO" && !item_r46.aplicado_en ? 56 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r3.puedeRegistrarTransferencia(item_r46) ? 57 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(item_r46.transferencia_manual ? 58 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.puedeRegistrarTransferencia(item_r46) ? 59 : ctx_r3.puedeConciliarReembolso(item_r46) ? 60 : ctx_r3.puedeSolicitarReembolso(item_r46) ? 61 : item_r46.estado === "PENDIENTE" ? 62 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(ctx_r3.puedeHabilitarTransferencia(item_r46) ? 63 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.errorReembolso() ? 64 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r3.guardandoReembolso());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r3.puedeHabilitarTransferencia(item_r46) ? 68 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.puedeRegistrarTransferencia(item_r46) || ctx_r3.puedeSolicitarReembolso(item_r46) || ctx_r3.puedeConciliarReembolso(item_r46) ? 69 : -1);
} }
function AdminComponent_Conditional_179_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 41);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.errorReclamos());
} }
function AdminComponent_Conditional_180_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 49);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.loading() ? "Cargando reclamos\u2026" : "No hay reclamos registrados.");
} }
function AdminComponent_Conditional_181_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 51);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Se muestran los ", ctx_r3.maxReclamosAdmin, " reclamos m\u00E1s recientes.");
} }
function AdminComponent_Conditional_181_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, AdminComponent_Conditional_181_Conditional_0_Template, 2, 1, "p", 51);
    i0.ɵɵelement(1, "app-filtros-lista", 217);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r3.claims().length >= ctx_r3.maxReclamosAdmin ? 0 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("lista", ctx_r3.listaReclamos);
} }
function AdminComponent_For_184_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r55 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-conversation-composer", 219);
    i0.ɵɵtwoWayListener("textoChange", function AdminComponent_For_184_Conditional_2_Template_app_conversation_composer_textoChange_0_listener($event) { i0.ɵɵrestoreView(_r55); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.textoReclamo, $event) || (ctx_r3.textoReclamo = $event); return i0.ɵɵresetView($event); })("imagenesChange", function AdminComponent_For_184_Conditional_2_Template_app_conversation_composer_imagenesChange_0_listener($event) { i0.ɵɵrestoreView(_r55); const ctx_r3 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r3.imagenesReclamo, $event) || (ctx_r3.imagenesReclamo = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("enviar", function AdminComponent_For_184_Conditional_2_Template_app_conversation_composer_enviar_0_listener() { i0.ɵɵrestoreView(_r55); const claim_r54 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.responderReclamo(claim_r54)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(1, "button", 43);
    i0.ɵɵlistener("click", function AdminComponent_For_184_Conditional_2_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r55); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.gestionReclamo.set(null)); });
    i0.ɵɵtext(2, "Cancelar");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const claim_r54 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵtwoWayProperty("texto", ctx_r3.textoReclamo)("imagenes", ctx_r3.imagenesReclamo);
    i0.ɵɵproperty("adjuntos", ctx_r3.imagenesDisponibles(claim_r54))("deshabilitado", !!ctx_r3.busy());
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", !!ctx_r3.busy());
} }
function AdminComponent_For_184_Conditional_3_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r57 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 221);
    i0.ɵɵlistener("click", function AdminComponent_For_184_Conditional_3_Conditional_3_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r57); const claim_r54 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.abrirGestionReclamo(claim_r54.id, "resolver")); });
    i0.ɵɵtext(1, "Resolver reclamo");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("disabled", !!ctx_r3.busy());
} }
function AdminComponent_For_184_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r56 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 135)(1, "button", 43);
    i0.ɵɵlistener("click", function AdminComponent_For_184_Conditional_3_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r56); const claim_r54 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.abrirGestionReclamo(claim_r54.id, "mensaje")); });
    i0.ɵɵtext(2, "Escribir mensaje");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, AdminComponent_For_184_Conditional_3_Conditional_3_Template, 2, 1, "button", 220);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const claim_r54 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", !!ctx_r3.busy());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(claim_r54.estado === "ABIERTO" || claim_r54.estado === "EN_REVISION" ? 3 : -1);
} }
function AdminComponent_For_184_Conditional_4_Conditional_0_Conditional_4_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 228);
    i0.ɵɵtext(1, "Habilitar 5 intentos m\u00E1s");
    i0.ɵɵelementEnd();
} }
function AdminComponent_For_184_Conditional_4_Conditional_0_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, AdminComponent_For_184_Conditional_4_Conditional_0_Conditional_4_Conditional_0_Template, 2, 0, "option", 228);
    i0.ɵɵelementStart(1, "option", 229);
    i0.ɵɵtext(2, "Confirmar el ingreso sin c\u00F3digo (a favor del anunciante)");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "option", 230);
    i0.ɵɵtext(4, "Devolver una parte al inquilino");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "option", 231);
    i0.ɵɵtext(6, "Devolver el 100 % al inquilino");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const claim_r54 = i0.ɵɵnextContext(3).$implicit;
    i0.ɵɵconditional(claim_r54.reserva?.estado_estadia === "PENDIENTE_INGRESO" ? 0 : -1);
} }
function AdminComponent_For_184_Conditional_4_Conditional_0_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 232);
    i0.ɵɵtext(1, "Sin devoluci\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "option", 230);
    i0.ɵɵtext(3, "Devoluci\u00F3n parcial");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "option", 231);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const claim_r54 = i0.ɵɵnextContext(3).$implicit;
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(claim_r54.solicitud_cancelacion_id && claim_r54.categoria !== "DEMORA_ADMINISTRATIVA" ? "Completar faltante" : "Devoluci\u00F3n total");
} }
function AdminComponent_For_184_Conditional_4_Conditional_0_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 182);
    i0.ɵɵtext(1, "El pago al anunciante se habilita en la fecha habitual, a los 5 d\u00EDas del fin de la estad\u00EDa.");
    i0.ɵɵelementEnd();
} }
function AdminComponent_For_184_Conditional_4_Conditional_0_Conditional_7_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 182);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const claim_r54 = i0.ɵɵnextContext(4).$implicit;
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", claim_r54.solicitud_cancelacion_id && claim_r54.categoria !== "DEMORA_ADMINISTRATIVA" ? "Faltante disponible:" : "Pag\u00F3 el inquilino", " ", ctx_r3.montoReclamo(claim_r54, ctx), ". La devoluci\u00F3n parcial tiene que ser menor.");
} }
function AdminComponent_For_184_Conditional_4_Conditional_0_Conditional_7_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 182);
    i0.ɵɵtext(1, "El ingreso sigue sin verificar. El resto se le paga al anunciante en la fecha habitual, a los 5 d\u00EDas del fin de la estad\u00EDa.");
    i0.ɵɵelementEnd();
} }
function AdminComponent_For_184_Conditional_4_Conditional_0_Conditional_7_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 75);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const claim_r54 = i0.ɵɵnextContext(4).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Para devolver todo eleg\u00ED \u00AB", claim_r54.solicitud_cancelacion_id && claim_r54.categoria !== "DEMORA_ADMINISTRATIVA" ? "Completar faltante" : "Devoluci\u00F3n total", "\u00BB.");
} }
function AdminComponent_For_184_Conditional_4_Conditional_0_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r59 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label");
    i0.ɵɵtext(1);
    i0.ɵɵelementStart(2, "input", 233);
    i0.ɵɵtwoWayListener("ngModelChange", function AdminComponent_For_184_Conditional_4_Conditional_0_Conditional_7_Template_input_ngModelChange_2_listener($event) { i0.ɵɵrestoreView(_r59); const ctx_r3 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r3.importeReclamo, $event) || (ctx_r3.importeReclamo = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, AdminComponent_For_184_Conditional_4_Conditional_0_Conditional_7_Conditional_3_Template, 2, 2, "p", 182);
    i0.ɵɵconditionalCreate(4, AdminComponent_For_184_Conditional_4_Conditional_0_Conditional_7_Conditional_4_Template, 2, 0, "p", 182);
    i0.ɵɵconditionalCreate(5, AdminComponent_For_184_Conditional_4_Conditional_0_Conditional_7_Conditional_5_Template, 2, 1, "p", 75);
} if (rf & 2) {
    let tmp_25_0;
    const claim_r54 = i0.ɵɵnextContext(3).$implicit;
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Importe a devolver (", claim_r54.devolucion_cancelacion?.moneda || claim_r54.reserva?.moneda_contratada || "ARS", ") ");
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.importeReclamo);
    i0.ɵɵproperty("disabled", !!ctx_r3.busy());
    i0.ɵɵattribute("max", ctx_r3.totalPagadoReclamo(claim_r54))("aria-invalid", ctx_r3.parcialCubreElTotal(claim_r54));
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_25_0 = ctx_r3.totalPagadoReclamo(claim_r54)) ? 3 : -1, tmp_25_0);
    i0.ɵɵadvance();
    i0.ɵɵconditional(claim_r54.categoria === "CODIGO_BLOQUEADO" ? 4 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.parcialCubreElTotal(claim_r54) ? 5 : -1);
} }
function AdminComponent_For_184_Conditional_4_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r58 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 223);
    i0.ɵɵlistener("ngSubmit", function AdminComponent_For_184_Conditional_4_Conditional_0_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r58); const claim_r54 = i0.ɵɵnextContext(2).$implicit; const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.resolverReclamoReserva(claim_r54)); });
    i0.ɵɵelementStart(1, "label");
    i0.ɵɵtext(2, "Resultado de la revisi\u00F3n ");
    i0.ɵɵelementStart(3, "select", 224);
    i0.ɵɵtwoWayListener("ngModelChange", function AdminComponent_For_184_Conditional_4_Conditional_0_Template_select_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r58); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.resolucionReclamo, $event) || (ctx_r3.resolucionReclamo = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵconditionalCreate(4, AdminComponent_For_184_Conditional_4_Conditional_0_Conditional_4_Template, 7, 1)(5, AdminComponent_For_184_Conditional_4_Conditional_0_Conditional_5_Template, 6, 1);
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(6, AdminComponent_For_184_Conditional_4_Conditional_0_Conditional_6_Template, 2, 0, "p", 182);
    i0.ɵɵconditionalCreate(7, AdminComponent_For_184_Conditional_4_Conditional_0_Conditional_7_Template, 6, 8);
    i0.ɵɵelementStart(8, "label");
    i0.ɵɵtext(9, "Motivo de la resoluci\u00F3n ");
    i0.ɵɵelementStart(10, "textarea", 225);
    i0.ɵɵtwoWayListener("ngModelChange", function AdminComponent_For_184_Conditional_4_Conditional_0_Template_textarea_ngModelChange_10_listener($event) { i0.ɵɵrestoreView(_r58); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.observacionReclamo, $event) || (ctx_r3.observacionReclamo = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "p", 226);
    i0.ɵɵtext(12, "Lo ven el inquilino y el anunciante.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "div", 135)(14, "button", 43);
    i0.ɵɵlistener("click", function AdminComponent_For_184_Conditional_4_Conditional_0_Template_button_click_14_listener() { i0.ɵɵrestoreView(_r58); const ctx_r3 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r3.gestionReclamo.set(null)); });
    i0.ɵɵtext(15, "Cancelar");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "button", 227);
    i0.ɵɵtext(17, "Confirmar resoluci\u00F3n");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const claim_r54 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.resolucionReclamo);
    i0.ɵɵproperty("disabled", !!ctx_r3.busy());
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(claim_r54.categoria === "CODIGO_BLOQUEADO" ? 4 : 5);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(claim_r54.categoria === "CODIGO_BLOQUEADO" && ctx_r3.resolucionReclamo === "CONFIRMAR_INGRESO" ? 6 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.resolucionReclamo === "DEVOLUCION_PARCIAL" ? 7 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.observacionReclamo);
    i0.ɵɵproperty("disabled", !!ctx_r3.busy());
    i0.ɵɵcontrol();
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", !!ctx_r3.busy());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !!ctx_r3.busy() || !ctx_r3.observacionReclamo.trim() || ctx_r3.resolucionReclamo === "DEVOLUCION_PARCIAL" && (!(ctx_r3.importeReclamo && ctx_r3.importeReclamo > 0) || ctx_r3.parcialCubreElTotal(claim_r54)));
} }
function AdminComponent_For_184_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, AdminComponent_For_184_Conditional_4_Conditional_0_Template, 18, 9, "form", 222);
} if (rf & 2) {
    const gestion_r60 = ctx;
    const claim_r54 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵconditional(gestion_r60.id === claim_r54.id && gestion_r60.accion === "resolver" ? 0 : -1);
} }
function AdminComponent_For_184_Template(rf, ctx) { if (rf & 1) {
    const _r53 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "article", 80)(1, "app-claim-history", 218);
    i0.ɵɵlistener("verReembolso", function AdminComponent_For_184_Template_app_claim_history_verReembolso_1_listener() { const claim_r54 = i0.ɵɵrestoreView(_r53).$implicit; const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.verReembolsoReclamo(claim_r54)); });
    i0.ɵɵconditionalCreate(2, AdminComponent_For_184_Conditional_2_Template, 3, 5);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, AdminComponent_For_184_Conditional_3_Template, 4, 2, "div", 135);
    i0.ɵɵconditionalCreate(4, AdminComponent_For_184_Conditional_4_Template, 1, 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_22_0;
    const claim_r54 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("id", "admin-reclamos-" + claim_r54.id);
    i0.ɵɵadvance();
    i0.ɵɵproperty("reclamo", claim_r54)("administracion", true)("mostrarVerReembolso", true)("actualizar", ctx_r3.activeSection() === "reclamos");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.gestionReclamo()?.id === claim_r54.id && ctx_r3.gestionReclamo()?.accion === "mensaje" ? 2 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(claim_r54.estado !== "CERRADO" ? 3 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_22_0 = ctx_r3.gestionReclamo()) ? 4 : -1, tmp_22_0);
} }
function AdminComponent_ForEmpty_185_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r52 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p", 49);
    i0.ɵɵtext(1, "No hay reclamos que coincidan. ");
    i0.ɵɵelementStart(2, "button", 145);
    i0.ɵɵlistener("click", function AdminComponent_ForEmpty_185_Conditional_0_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r52); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.listaReclamos.limpiar()); });
    i0.ɵɵtext(3, "Limpiar filtros");
    i0.ɵɵelementEnd()();
} }
function AdminComponent_ForEmpty_185_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, AdminComponent_ForEmpty_185_Conditional_0_Template, 4, 0, "p", 49);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r3.claims().length ? 0 : -1);
} }
function AdminComponent_Conditional_186_Template(rf, ctx) { if (rf & 1) {
    const _r61 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-paginador", 234);
    i0.ɵɵlistener("paginaCambia", function AdminComponent_Conditional_186_Template_app_paginador_paginaCambia_0_listener($event) { i0.ɵɵrestoreView(_r61); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.listaReclamos.irAPagina($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("pagina", ctx_r3.listaReclamos.pagina())("paginas", ctx_r3.listaReclamos.paginas())("total", ctx_r3.listaReclamos.filtrados().length);
} }
function AdminComponent_Conditional_196_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 49);
    i0.ɵɵtext(1, "Cargando solicitudes\u2026");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_197_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 49);
    i0.ɵɵtext(1, "No hay solicitudes pendientes.");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_198_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r62 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p", 49);
    i0.ɵɵtext(1, "No hay solicitudes que coincidan. ");
    i0.ɵɵelementStart(2, "button", 145);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_198_Conditional_1_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r62); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.listaVerificaciones.limpiar()); });
    i0.ɵɵtext(3, "Limpiar filtros");
    i0.ɵɵelementEnd()();
} }
function AdminComponent_Conditional_198_For_4_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2, "Prueba de vida");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "dd");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const request_r63 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(request_r63.prueba_vida_validada_en ? "Completada" : "Requiere una nueva captura");
} }
function AdminComponent_Conditional_198_For_4_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "dt");
    i0.ɵɵtext(2, "CBU a revisar");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "dd")(4, "code");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const request_r63 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(request_r63.cbu_pendiente);
} }
function AdminComponent_Conditional_198_For_4_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    const _r64 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label")(1, "input", 245, 5);
    i0.ɵɵlistener("change", function AdminComponent_Conditional_198_For_4_Conditional_22_Template_input_change_1_listener() { i0.ɵɵrestoreView(_r64); const titular_r65 = i0.ɵɵreference(2); const request_r63 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.titularCbuConfirmado = titular_r65.checked ? request_r63.id : null); });
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3, " Verifiqu\u00E9 en el banco que el CBU pertenece al mismo titular de la cuenta en DEPA. ");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const request_r63 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("checked", ctx_r3.titularCbuConfirmado === request_r63.id);
} }
function AdminComponent_Conditional_198_For_4_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h4");
    i0.ɵɵtext(1, "Inmobiliaria y corredor responsable");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "dl")(3, "div")(4, "dt");
    i0.ɵɵtext(5, "Nombre o raz\u00F3n social");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "dd");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div")(9, "dt");
    i0.ɵɵtext(10, "Matr\u00EDcula del corredor responsable");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "dd");
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(13, "div")(14, "dt");
    i0.ɵɵtext(15, "Colegio profesional y jurisdicci\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "dd");
    i0.ɵɵtext(17);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(18, "div")(19, "dt");
    i0.ɵɵtext(20, "Domicilio comercial");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "dd");
    i0.ɵɵtext(22);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(23, "div")(24, "dt");
    i0.ɵɵtext(25, "DNI del corredor responsable");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(26, "dd");
    i0.ɵɵtext(27);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(28, "p");
    i0.ɵɵtext(29, "Compar\u00E1 el DNI y la captura del titular de la cuenta. Revis\u00E1 matr\u00EDcula, colegio/jurisdicci\u00F3n, domicilio comercial y constancia de CUIT antes de aprobar.");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const request_r63 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate(request_r63.razon_social || "Sin informar");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(request_r63.matricula_profesional || "Sin informar");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(request_r63.colegio_profesional || "Sin informar");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(request_r63.domicilio_comercial || "Sin informar");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(request_r63.dni_corredor || "Sin informar");
} }
function AdminComponent_Conditional_198_For_4_Conditional_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 242);
    i0.ɵɵelement(1, "img", 246);
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3, "DNI frente");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const request_r63 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("href", request_r63.dni_frente_url, i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance();
    i0.ɵɵproperty("src", request_r63.dni_frente_url, i0.ɵɵsanitizeUrl);
} }
function AdminComponent_Conditional_198_For_4_Conditional_26_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 242);
    i0.ɵɵelement(1, "img", 247);
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3, "DNI dorso");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const request_r63 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("href", request_r63.dni_dorso_url, i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance();
    i0.ɵɵproperty("src", request_r63.dni_dorso_url, i0.ɵɵsanitizeUrl);
} }
function AdminComponent_Conditional_198_For_4_Conditional_27_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "video", 248);
} if (rf & 2) {
    const request_r63 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵproperty("src", request_r63.rostro_url, i0.ɵɵsanitizeUrl);
} }
function AdminComponent_Conditional_198_For_4_Conditional_27_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 249);
} if (rf & 2) {
    const request_r63 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵproperty("src", request_r63.rostro_url, i0.ɵɵsanitizeUrl);
} }
function AdminComponent_Conditional_198_For_4_Conditional_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 242);
    i0.ɵɵconditionalCreate(1, AdminComponent_Conditional_198_For_4_Conditional_27_Conditional_1_Template, 1, 1, "video", 248)(2, AdminComponent_Conditional_198_For_4_Conditional_27_Conditional_2_Template, 1, 1, "img", 249);
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4, "Rostro");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const request_r63 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("href", request_r63.rostro_url, i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.esVideo(request_r63.rostro_url) ? 1 : 2);
} }
function AdminComponent_Conditional_198_For_4_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 243);
    i0.ɵɵtext(1, "Ver constancia de matr\u00EDcula");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const request_r63 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("href", request_r63.matricula_url, i0.ɵɵsanitizeUrl);
} }
function AdminComponent_Conditional_198_For_4_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 243);
    i0.ɵɵtext(1, "Ver constancia de CUIT");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const request_r63 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("href", request_r63.constancia_cuit_url, i0.ɵɵsanitizeUrl);
} }
function AdminComponent_Conditional_198_For_4_Conditional_30_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r67 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label")(1, "input", 253);
    i0.ɵɵtwoWayListener("ngModelChange", function AdminComponent_Conditional_198_For_4_Conditional_30_Conditional_1_Template_input_ngModelChange_1_listener($event) { i0.ɵɵrestoreView(_r67); const ctx_r3 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r3.rechazarIdentidad, $event) || (ctx_r3.rechazarIdentidad = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵtext(2, " Rechazar prueba de vida y documentaci\u00F3n de identidad");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.rechazarIdentidad);
    i0.ɵɵcontrol();
} }
function AdminComponent_Conditional_198_For_4_Conditional_30_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r68 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label")(1, "input", 253);
    i0.ɵɵtwoWayListener("ngModelChange", function AdminComponent_Conditional_198_For_4_Conditional_30_Conditional_2_Template_input_ngModelChange_1_listener($event) { i0.ɵɵrestoreView(_r68); const ctx_r3 = i0.ɵɵnextContext(4); i0.ɵɵtwoWayBindingSet(ctx_r3.rechazarCbu, $event) || (ctx_r3.rechazarCbu = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵtext(2, " Rechazar CBU");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.rechazarCbu);
    i0.ɵɵcontrol();
} }
function AdminComponent_Conditional_198_For_4_Conditional_30_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "Se aprobar\u00E1 la parte que dejes sin marcar.");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_198_For_4_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    const _r66 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 244);
    i0.ɵɵconditionalCreate(1, AdminComponent_Conditional_198_For_4_Conditional_30_Conditional_1_Template, 3, 1, "label");
    i0.ɵɵconditionalCreate(2, AdminComponent_Conditional_198_For_4_Conditional_30_Conditional_2_Template, 3, 1, "label");
    i0.ɵɵconditionalCreate(3, AdminComponent_Conditional_198_For_4_Conditional_30_Conditional_3_Template, 2, 0, "p");
    i0.ɵɵelementStart(4, "label", 250);
    i0.ɵɵtext(5, "Motivo del rechazo");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "textarea", 251);
    i0.ɵɵtwoWayListener("ngModelChange", function AdminComponent_Conditional_198_For_4_Conditional_30_Template_textarea_ngModelChange_6_listener($event) { i0.ɵɵrestoreView(_r66); const ctx_r3 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r3.rejectReason, $event) || (ctx_r3.rejectReason = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(7, "div")(8, "button", 139);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_198_For_4_Conditional_30_Template_button_click_8_listener() { i0.ɵɵrestoreView(_r66); const ctx_r3 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r3.cancelReject()); });
    i0.ɵɵtext(9, " Cancelar");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "button", 252);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_198_For_4_Conditional_30_Template_button_click_10_listener() { i0.ɵɵrestoreView(_r66); const request_r63 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.confirmReject(request_r63)); });
    i0.ɵɵtext(11, " Confirmar rechazo ");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const request_r63 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵconditional(request_r63.revisar_identidad ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(request_r63.cbu_pendiente ? 2 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(request_r63.revisar_identidad && request_r63.cbu_pendiente ? 3 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("for", "reason-" + request_r63.id);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", "reason-" + request_r63.id);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.rejectReason);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", ctx_r3.rejectReason.trim().length < 5 || !ctx_r3.rechazarIdentidad && !ctx_r3.rechazarCbu || !ctx_r3.puedeResolverVerificacion(request_r63, ctx_r3.rechazarIdentidad, ctx_r3.rechazarCbu));
} }
function AdminComponent_Conditional_198_For_4_Conditional_31_Template(rf, ctx) { if (rf & 1) {
    const _r69 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 135)(1, "button", 138);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_198_For_4_Conditional_31_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r69); const request_r63 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.openReject(request_r63)); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 254);
    i0.ɵɵtext(3, " Rechazar");
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "button", 151);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_198_For_4_Conditional_31_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r69); const request_r63 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.approve(request_r63)); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(5, "svg", 70);
    i0.ɵɵtext(6, " Aprobar ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const request_r63 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 17);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !ctx_r3.puedeResolverVerificacion(request_r63, false, false));
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 17);
} }
function AdminComponent_Conditional_198_For_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "article", 237)(1, "div", 239)(2, "span", 240);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div")(5, "h3");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(9, "dl")(10, "div")(11, "dt");
    i0.ɵɵtext(12, "CUIT/CUIL");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "dd");
    i0.ɵɵtext(14);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(15, "div")(16, "dt");
    i0.ɵɵtext(17, "Revisi\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "dd");
    i0.ɵɵtext(19);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(20, AdminComponent_Conditional_198_For_4_Conditional_20_Template, 5, 1, "div");
    i0.ɵɵconditionalCreate(21, AdminComponent_Conditional_198_For_4_Conditional_21_Template, 6, 1, "div");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(22, AdminComponent_Conditional_198_For_4_Conditional_22_Template, 4, 1, "label");
    i0.ɵɵconditionalCreate(23, AdminComponent_Conditional_198_For_4_Conditional_23_Template, 30, 5);
    i0.ɵɵelementStart(24, "div", 241);
    i0.ɵɵconditionalCreate(25, AdminComponent_Conditional_198_For_4_Conditional_25_Template, 4, 2, "a", 242);
    i0.ɵɵconditionalCreate(26, AdminComponent_Conditional_198_For_4_Conditional_26_Template, 4, 2, "a", 242);
    i0.ɵɵconditionalCreate(27, AdminComponent_Conditional_198_For_4_Conditional_27_Template, 5, 2, "a", 242);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(28, AdminComponent_Conditional_198_For_4_Conditional_28_Template, 2, 1, "a", 243);
    i0.ɵɵconditionalCreate(29, AdminComponent_Conditional_198_For_4_Conditional_29_Template, 2, 1, "a", 243);
    i0.ɵɵconditionalCreate(30, AdminComponent_Conditional_198_For_4_Conditional_30_Template, 12, 7, "div", 244)(31, AdminComponent_Conditional_198_For_4_Conditional_31_Template, 7, 3, "div", 135);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const request_r63 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("id", "admin-verificaciones-" + request_r63.id);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate((request_r63.anunciante.usuario?.nombre || "A").charAt(0));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2(" ", request_r63.anunciante.usuario?.nombre || "Anunciante", " ", request_r63.anunciante.usuario?.apellido, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(request_r63.anunciante.usuario?.email || request_r63.anunciante.numero_contacto);
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(request_r63.anunciante.cuit_cuil || "Sin informar");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1("#", request_r63.numero_revision);
    i0.ɵɵadvance();
    i0.ɵɵconditional(request_r63.revisar_identidad ? 20 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(request_r63.cbu_pendiente ? 21 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(request_r63.cbu_pendiente ? 22 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(request_r63.revisar_identidad && (request_r63.razon_social || request_r63.matricula_profesional) ? 23 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(request_r63.dni_frente_url ? 25 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(request_r63.dni_dorso_url ? 26 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(request_r63.rostro_url ? 27 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(request_r63.matricula_url ? 28 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(request_r63.constancia_cuit_url ? 29 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.rejectId() === request_r63.id ? 30 : 31);
} }
function AdminComponent_Conditional_198_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r70 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-paginador", 255);
    i0.ɵɵlistener("paginaCambia", function AdminComponent_Conditional_198_Conditional_5_Template_app_paginador_paginaCambia_0_listener($event) { i0.ɵɵrestoreView(_r70); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.listaVerificaciones.irAPagina($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("pagina", ctx_r3.listaVerificaciones.pagina())("paginas", ctx_r3.listaVerificaciones.paginas())("total", ctx_r3.listaVerificaciones.filtrados().length);
} }
function AdminComponent_Conditional_198_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-filtros-lista", 235);
    i0.ɵɵconditionalCreate(1, AdminComponent_Conditional_198_Conditional_1_Template, 4, 0, "p", 49);
    i0.ɵɵelementStart(2, "div", 236);
    i0.ɵɵrepeaterCreate(3, AdminComponent_Conditional_198_For_4_Template, 32, 17, "article", 237, _forTrack1);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, AdminComponent_Conditional_198_Conditional_5_Template, 1, 3, "app-paginador", 238);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵproperty("lista", ctx_r3.listaVerificaciones);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!ctx_r3.listaVerificaciones.filtrados().length ? 1 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r3.listaVerificaciones.visibles());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r3.listaVerificaciones.filtrados().length ? 5 : -1);
} }
function AdminComponent_Conditional_206_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("", ctx_r3.registeredUsers(), " usuarios registrados");
} }
function AdminComponent_Conditional_225_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td", 256);
    i0.ɵɵtext(2, "Cargando usuarios\u2026");
    i0.ɵɵelementEnd()();
} }
function AdminComponent_Conditional_226_For_1_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const user_r71 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("CUIT/CUIL ", ctx, "", user_r71.cuit_cuil ? "" : " (hist\u00F3rico)");
} }
function AdminComponent_Conditional_226_For_1_Conditional_14_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "date");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const user_r71 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, user_r71.fecha_baja, "dd/MM/yyyy"));
} }
function AdminComponent_Conditional_226_For_1_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 263);
    i0.ɵɵtext(1, "Dada de baja");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(2, AdminComponent_Conditional_226_For_1_Conditional_14_Conditional_2_Template, 3, 4, "small");
} if (rf & 2) {
    const user_r71 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(user_r71.fecha_baja ? 2 : -1);
} }
function AdminComponent_Conditional_226_For_1_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 149);
    i0.ɵɵtext(1, "Bloqueada");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_226_For_1_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 133);
    i0.ɵɵtext(1, "Activa");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_226_For_1_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    const _r72 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 264);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_226_For_1_Conditional_18_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r72); const user_r71 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.toggleUser(user_r71)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const user_r71 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r3.busy() === "user-" + user_r71.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", user_r71.bloqueado ? "Habilitar" : "Bloquear", " ");
} }
function AdminComponent_Conditional_226_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td", 257)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "small");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "td", 258);
    i0.ɵɵtext(7);
    i0.ɵɵelementStart(8, "small");
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(10, AdminComponent_Conditional_226_For_1_Conditional_10_Template, 2, 2, "small");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "td", 259);
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "td", 260);
    i0.ɵɵconditionalCreate(14, AdminComponent_Conditional_226_For_1_Conditional_14_Template, 3, 1)(15, AdminComponent_Conditional_226_For_1_Conditional_15_Template, 2, 0, "span", 149)(16, AdminComponent_Conditional_226_For_1_Conditional_16_Template, 2, 0, "span", 133);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "td", 261);
    i0.ɵɵconditionalCreate(18, AdminComponent_Conditional_226_For_1_Conditional_18_Template, 2, 2, "button", 262);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_20_0;
    const user_r71 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("", user_r71.nombre, " ", user_r71.apellido);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(user_r71.email_verificado ? "Email verificado" : "Email pendiente");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", user_r71.email ?? user_r71.email_historico);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(user_r71.telefono);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_20_0 = user_r71.cuit_cuil ?? user_r71.cuit_cuil_historico) ? 10 : -1, tmp_20_0);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(user_r71.rol?.nombre ?? "Sin rol");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!user_r71.activa ? 14 : user_r71.bloqueado ? 15 : 16);
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(user_r71.activa ? 18 : -1);
} }
function AdminComponent_Conditional_226_ForEmpty_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td", 256);
    i0.ɵɵtext(2, "No se encontraron usuarios.");
    i0.ɵɵelementEnd()();
} }
function AdminComponent_Conditional_226_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, AdminComponent_Conditional_226_For_1_Template, 19, 9, "tr", null, _forTrack1, false, AdminComponent_Conditional_226_ForEmpty_2_Template, 3, 0, "tr");
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵrepeater(ctx_r3.users());
} }
function AdminComponent_Conditional_247_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 41);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.bloqueadosError());
} }
function AdminComponent_Conditional_247_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 52);
    i0.ɵɵtext(1, "Cargando usuarios bloqueados\u2026");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_247_Conditional_2_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-filtros-lista", 265);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("lista", ctx_r3.listaBloqueos);
} }
function AdminComponent_Conditional_247_Conditional_2_For_3_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(0, "svg", 110);
    i0.ɵɵtext(1);
} if (rf & 2) {
    const bloqueo_r75 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("size", 15);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.apelacionSinResponder(bloqueo_r75.detalle) ? "Apelaci\u00F3n en curso" : "Respondida", " ");
} }
function AdminComponent_Conditional_247_Conditional_2_For_3_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(0, "svg", 180);
    i0.ɵɵtext(1, " Sin apelaci\u00F3n ");
} if (rf & 2) {
    i0.ɵɵproperty("size", 15);
} }
function AdminComponent_Conditional_247_Conditional_2_For_3_Conditional_34_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 276);
    i0.ɵɵtext(1, "Acceso limitado a operaciones pendientes y apelaci\u00F3n.");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_247_Conditional_2_For_3_Conditional_35_Template(rf, ctx) { if (rf & 1) {
    const _r76 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-conversation-panel", 277)(1, "app-conversation-composer", 278);
    i0.ɵɵlistener("textoChange", function AdminComponent_Conditional_247_Conditional_2_For_3_Conditional_35_Template_app_conversation_composer_textoChange_1_listener($event) { i0.ɵɵrestoreView(_r76); const bloqueo_r75 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r3.respuestasApelacion[bloqueo_r75.detalle.id] = $event); })("imagenesChange", function AdminComponent_Conditional_247_Conditional_2_For_3_Conditional_35_Template_app_conversation_composer_imagenesChange_1_listener($event) { i0.ɵɵrestoreView(_r76); const bloqueo_r75 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r3.imagenesApelacion[bloqueo_r75.detalle.id] = $event); })("enviar", function AdminComponent_Conditional_247_Conditional_2_For_3_Conditional_35_Template_app_conversation_composer_enviar_1_listener() { i0.ɵɵrestoreView(_r76); const bloqueo_r75 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r3.responderApelacion(bloqueo_r75)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "button", 43);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_247_Conditional_2_For_3_Conditional_35_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r76); const bloqueo_r75 = i0.ɵɵnextContext().$implicit; const ctx_r3 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r3.cancelarRespuesta(bloqueo_r75)); });
    i0.ɵɵtext(3, "Cancelar");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const bloqueo_r75 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("permitirAmpliar", true)("mensajes", ctx_r3.mensajesApelacion(bloqueo_r75.detalle, bloqueo_r75.usuario.nombre + " " + bloqueo_r75.usuario.apellido, false));
    i0.ɵɵadvance();
    i0.ɵɵproperty("texto", ctx_r3.respuestasApelacion[bloqueo_r75.detalle.id] ?? "")("imagenes", ctx_r3.imagenesApelacion[bloqueo_r75.detalle.id] ?? ctx_r3.sinImagenes)("adjuntos", 1)("textoObligatorio", true)("limite", 2000)("deshabilitado", !!ctx_r3.busy());
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", !!ctx_r3.busy());
} }
function AdminComponent_Conditional_247_Conditional_2_For_3_Template(rf, ctx) { if (rf & 1) {
    const _r74 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "article", 267)(1, "header", 269)(2, "span", 270);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(3, "svg", 271);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "div", 272)(5, "h3");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "span", 273);
    i0.ɵɵconditionalCreate(10, AdminComponent_Conditional_247_Conditional_2_For_3_Conditional_10_Template, 2, 2)(11, AdminComponent_Conditional_247_Conditional_2_For_3_Conditional_11_Template, 2, 1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "button", 274);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_247_Conditional_2_For_3_Template_button_click_12_listener() { const bloqueo_r75 = i0.ɵɵrestoreView(_r74).$implicit; const ctx_r3 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r3.desbloquearDesdeApelaciones(bloqueo_r75)); });
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "div", 275)(15, "div");
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(16, "svg", 271);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(17, "p")(18, "strong");
    i0.ɵɵtext(19, "Bloqueado por");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(20);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(21, "div");
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(22, "svg", 178);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(23, "p")(24, "strong");
    i0.ɵɵtext(25, "Fecha del bloqueo");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(26);
    i0.ɵɵpipe(27, "date");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(28, "div");
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(29, "svg", 110);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(30, "p")(31, "strong");
    i0.ɵɵtext(32, "Motivo");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(33);
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(34, AdminComponent_Conditional_247_Conditional_2_For_3_Conditional_34_Template, 2, 0, "p", 276);
    i0.ɵɵconditionalCreate(35, AdminComponent_Conditional_247_Conditional_2_For_3_Conditional_35_Template, 4, 9, "app-conversation-panel", 277);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const bloqueo_r75 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("id", "admin-bloqueos-" + bloqueo_r75.usuario.id);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("size", 24);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("", bloqueo_r75.usuario.nombre, " ", bloqueo_r75.usuario.apellido);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(bloqueo_r75.usuario.email);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r3.tieneApelacion(bloqueo_r75.detalle) ? 10 : 11);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !!ctx_r3.busy());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r3.busy() === "user-" + bloqueo_r75.usuario.id ? "Desbloqueando..." : "Desbloquear usuario", " ");
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("size", 20);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(bloqueo_r75.administrador ? bloqueo_r75.administrador.nombre + " " + bloqueo_r75.administrador.apellido : "Sin registro");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 20);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(bloqueo_r75.detalle.fecha ? i0.ɵɵpipeBind2(27, 16, bloqueo_r75.detalle.fecha, "dd/MM/yyyy") : "Sin registro");
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("size", 20);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(bloqueo_r75.detalle.motivo || "Sin registro");
    i0.ɵɵadvance();
    i0.ɵɵconditional(bloqueo_r75.detalle.accesoLimitado ? 34 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(bloqueo_r75.detalle.apelacion ? 35 : -1);
} }
function AdminComponent_Conditional_247_Conditional_2_ForEmpty_4_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r73 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p", 49);
    i0.ɵɵtext(1, "No hay bloqueos que coincidan. ");
    i0.ɵɵelementStart(2, "button", 145);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_247_Conditional_2_ForEmpty_4_Conditional_0_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r73); const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.listaBloqueos.limpiar()); });
    i0.ɵɵtext(3, "Limpiar filtros");
    i0.ɵɵelementEnd()();
} }
function AdminComponent_Conditional_247_Conditional_2_ForEmpty_4_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 49);
    i0.ɵɵtext(1, "No hay usuarios bloqueados.");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_247_Conditional_2_ForEmpty_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, AdminComponent_Conditional_247_Conditional_2_ForEmpty_4_Conditional_0_Template, 4, 0, "p", 49)(1, AdminComponent_Conditional_247_Conditional_2_ForEmpty_4_Conditional_1_Template, 2, 0, "p", 49);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵconditional(ctx_r3.bloqueados().length ? 0 : !ctx_r3.bloqueadosError() ? 1 : -1);
} }
function AdminComponent_Conditional_247_Conditional_2_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r77 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-paginador", 279);
    i0.ɵɵlistener("paginaCambia", function AdminComponent_Conditional_247_Conditional_2_Conditional_5_Template_app_paginador_paginaCambia_0_listener($event) { i0.ɵɵrestoreView(_r77); const ctx_r3 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r3.listaBloqueos.irAPagina($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("pagina", ctx_r3.listaBloqueos.pagina())("paginas", ctx_r3.listaBloqueos.paginas())("total", ctx_r3.listaBloqueos.filtrados().length);
} }
function AdminComponent_Conditional_247_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, AdminComponent_Conditional_247_Conditional_2_Conditional_0_Template, 1, 1, "app-filtros-lista", 265);
    i0.ɵɵelementStart(1, "div", 266);
    i0.ɵɵrepeaterCreate(2, AdminComponent_Conditional_247_Conditional_2_For_3_Template, 36, 19, "article", 267, _forTrack4, false, AdminComponent_Conditional_247_Conditional_2_ForEmpty_4_Template, 2, 1);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, AdminComponent_Conditional_247_Conditional_2_Conditional_5_Template, 1, 3, "app-paginador", 268);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional(ctx_r3.bloqueados().length ? 0 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r3.listaBloqueos.visibles());
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r3.listaBloqueos.filtrados().length ? 5 : -1);
} }
function AdminComponent_Conditional_247_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, AdminComponent_Conditional_247_Conditional_0_Template, 2, 1, "p", 41);
    i0.ɵɵconditionalCreate(1, AdminComponent_Conditional_247_Conditional_1_Template, 2, 0, "p", 52)(2, AdminComponent_Conditional_247_Conditional_2_Template, 6, 3);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r3.bloqueadosError() ? 0 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.bloqueadosCargando() ? 1 : 2);
} }
function AdminComponent_Conditional_248_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 41);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.historialBloqueosError());
} }
function AdminComponent_Conditional_248_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 52);
    i0.ɵɵtext(1, "Cargando historial de bloqueos...");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_248_Conditional_2_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-filtros-lista", 280);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("lista", ctx_r3.listaHistorialBloqueos);
} }
function AdminComponent_Conditional_248_Conditional_2_For_3_Conditional_34_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-conversation-panel", 277);
} if (rf & 2) {
    const bloqueo_r79 = i0.ɵɵnextContext().$implicit;
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("permitirAmpliar", true)("mensajes", ctx_r3.mensajesApelacion(bloqueo_r79.detalle, bloqueo_r79.usuario.nombre + " " + bloqueo_r79.usuario.apellido, false));
} }
function AdminComponent_Conditional_248_Conditional_2_For_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "article", 281)(1, "header", 269)(2, "span", 270);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(3, "svg", 271);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "div", 272)(5, "h3");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "span", 283);
    i0.ɵɵtext(10, "Desbloqueado");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "div", 275)(12, "div");
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(13, "svg", 271);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(14, "p")(15, "strong");
    i0.ɵɵtext(16, "Bloqueado por");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(17);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(18, "div");
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(19, "svg", 178);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(20, "p")(21, "strong");
    i0.ɵɵtext(22, "Fecha del bloqueo");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(23);
    i0.ɵɵpipe(24, "date");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(25, "div");
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(26, "svg", 110);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(27, "p")(28, "strong");
    i0.ɵɵtext(29, "Motivo");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(30);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(31, "p", 284);
    i0.ɵɵtext(32);
    i0.ɵɵpipe(33, "date");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(34, AdminComponent_Conditional_248_Conditional_2_For_3_Conditional_34_Template, 1, 2, "app-conversation-panel", 277);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const bloqueo_r79 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("size", 24);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("", bloqueo_r79.usuario.nombre, " ", bloqueo_r79.usuario.apellido);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(bloqueo_r79.usuario.email);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("size", 20);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(bloqueo_r79.administrador ? bloqueo_r79.administrador.nombre + " " + bloqueo_r79.administrador.apellido : "Sin registro");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 20);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(bloqueo_r79.detalle.fecha ? i0.ɵɵpipeBind2(24, 12, bloqueo_r79.detalle.fecha, "dd/MM/yyyy") : "Sin registro");
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("size", 20);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(bloqueo_r79.detalle.motivo || "Sin registro");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("Desbloqueado: ", bloqueo_r79.detalle.fechaDesbloqueo ? i0.ɵɵpipeBind2(33, 15, bloqueo_r79.detalle.fechaDesbloqueo, "dd/MM/yyyy HH:mm") : "fecha no registrada");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(bloqueo_r79.detalle.apelacion ? 34 : -1);
} }
function AdminComponent_Conditional_248_Conditional_2_ForEmpty_4_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r78 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p", 49);
    i0.ɵɵtext(1, "No hay bloqueos que coincidan. ");
    i0.ɵɵelementStart(2, "button", 145);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_248_Conditional_2_ForEmpty_4_Conditional_0_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r78); const ctx_r3 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r3.listaHistorialBloqueos.limpiar()); });
    i0.ɵɵtext(3, "Limpiar filtros");
    i0.ɵɵelementEnd()();
} }
function AdminComponent_Conditional_248_Conditional_2_ForEmpty_4_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 49);
    i0.ɵɵtext(1, "No hay bloqueos anteriores registrados.");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_248_Conditional_2_ForEmpty_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, AdminComponent_Conditional_248_Conditional_2_ForEmpty_4_Conditional_0_Template, 4, 0, "p", 49)(1, AdminComponent_Conditional_248_Conditional_2_ForEmpty_4_Conditional_1_Template, 2, 0, "p", 49);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵconditional(ctx_r3.historialBloqueos().length ? 0 : !ctx_r3.historialBloqueosError() ? 1 : -1);
} }
function AdminComponent_Conditional_248_Conditional_2_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r80 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-paginador", 285);
    i0.ɵɵlistener("paginaCambia", function AdminComponent_Conditional_248_Conditional_2_Conditional_5_Template_app_paginador_paginaCambia_0_listener($event) { i0.ɵɵrestoreView(_r80); const ctx_r3 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r3.listaHistorialBloqueos.irAPagina($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("pagina", ctx_r3.listaHistorialBloqueos.pagina())("paginas", ctx_r3.listaHistorialBloqueos.paginas())("total", ctx_r3.listaHistorialBloqueos.filtrados().length);
} }
function AdminComponent_Conditional_248_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, AdminComponent_Conditional_248_Conditional_2_Conditional_0_Template, 1, 1, "app-filtros-lista", 280);
    i0.ɵɵelementStart(1, "div", 266);
    i0.ɵɵrepeaterCreate(2, AdminComponent_Conditional_248_Conditional_2_For_3_Template, 35, 18, "article", 281, _forTrack5, false, AdminComponent_Conditional_248_Conditional_2_ForEmpty_4_Template, 2, 1);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, AdminComponent_Conditional_248_Conditional_2_Conditional_5_Template, 1, 3, "app-paginador", 282);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional(ctx_r3.historialBloqueos().length ? 0 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r3.listaHistorialBloqueos.visibles());
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r3.listaHistorialBloqueos.filtrados().length ? 5 : -1);
} }
function AdminComponent_Conditional_248_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, AdminComponent_Conditional_248_Conditional_0_Template, 2, 1, "p", 41);
    i0.ɵɵconditionalCreate(1, AdminComponent_Conditional_248_Conditional_1_Template, 2, 0, "p", 52)(2, AdminComponent_Conditional_248_Conditional_2_Template, 6, 3);
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r3.historialBloqueosError() ? 0 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r3.historialBloqueosCargando() ? 1 : 2);
} }
function AdminComponent_Conditional_250_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 90);
    i0.ɵɵtext(1, "Cargando comisi\u00F3n\u2026");
    i0.ɵɵelementEnd();
} }
function AdminComponent_Conditional_251_Template(rf, ctx) { if (rf & 1) {
    const _r81 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p", 41);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "button", 139);
    i0.ɵɵlistener("click", function AdminComponent_Conditional_251_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r81); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.cargarComision()); });
    i0.ɵɵtext(3, "Reintentar");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("No se pudo cargar la comisi\u00F3n: ", ctx_r3.comisionError());
} }
function AdminComponent_Conditional_252_Template(rf, ctx) { if (rf & 1) {
    const _r82 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 97)(1, "div", 286)(2, "div", 287);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(3, "svg", 288);
    i0.ɵɵelement(4, "path", 289)(5, "path", 290);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(6, "span");
    i0.ɵɵtext(7, "Porcentaje actual");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "strong");
    i0.ɵɵtext(9);
    i0.ɵɵelementStart(10, "span");
    i0.ɵɵtext(11, " %");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(12, "form", 291);
    i0.ɵɵlistener("ngSubmit", function AdminComponent_Conditional_252_Template_form_ngSubmit_12_listener() { i0.ɵɵrestoreView(_r82); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.guardarComision()); });
    i0.ɵɵelementStart(13, "h2")(14, "span", 292);
    i0.ɵɵtext(15, "%");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(16, " Cambiar comisi\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "p", 293)(18, "span", 294);
    i0.ɵɵtext(19, "\u24D8");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(20, " El porcentaje se aplica a nuevas reservas y no modifica las anteriores.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "label", 295);
    i0.ɵɵtext(22, "Nuevo porcentaje");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "div", 296)(24, "input", 297);
    i0.ɵɵtwoWayListener("ngModelChange", function AdminComponent_Conditional_252_Template_input_ngModelChange_24_listener($event) { i0.ɵɵrestoreView(_r82); const ctx_r3 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r3.comisionNueva, $event) || (ctx_r3.comisionNueva = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(25, "span", 294);
    i0.ɵɵtext(26, "%");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(27, "button", 298);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(28, "svg", 299);
    i0.ɵɵelement(29, "path", 300)(30, "path", 301);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(31, "Guardar comisi\u00F3n");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(9);
    i0.ɵɵtextInterpolate(ctx_r3.comisionActual);
    i0.ɵɵadvance(15);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r3.comisionNueva);
    i0.ɵɵcontrol();
} }
function AdminComponent_For_262_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r83 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r83.nombre);
} }
function AdminComponent_For_262_ForEmpty_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 104);
    i0.ɵɵtext(1, "Sin elementos");
    i0.ɵɵelementEnd();
} }
function AdminComponent_For_262_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "article", 100)(1, "h3");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "ul", 102);
    i0.ɵɵrepeaterCreate(4, AdminComponent_For_262_For_5_Template, 3, 1, "li", null, _forTrack1, false, AdminComponent_For_262_ForEmpty_6_Template, 2, 0, "li", 104);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const section_r84 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(section_r84.label);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(section_r84.items);
} }
function AdminComponent_For_276_Template(rf, ctx) { if (rf & 1) {
    const _r85 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li")(1, "button", 302);
    i0.ɵɵlistener("click", function AdminComponent_For_276_Template_button_click_1_listener() { const item_r86 = i0.ɵɵrestoreView(_r85).$implicit; const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.selectProvince(item_r86.id)); });
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r86 = ctx.$implicit;
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("selected", ctx_r3.selectedProvince() === item_r86.id);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r86.nombre);
} }
function AdminComponent_ForEmpty_277_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 104);
    i0.ɵɵtext(1, "Sin provincias");
    i0.ɵɵelementEnd();
} }
function AdminComponent_For_283_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r87 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r87.nombre);
} }
function AdminComponent_ForEmpty_284_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 104);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.selectedProvince() ? "Sin ciudades" : "Seleccion\u00E1 una provincia");
} }
/** Pendientes del resumen: se muestran 5 y cada «Ver más» suma 10. */
const PENDIENTES_INICIALES = 5;
const PENDIENTES_POR_VEZ = 10;
const ORDEN_ESTADO_REEMBOLSO = {
    PENDIENTE: 0,
    EN_PROCESO: 0,
    FALLIDO: 0,
    APROBADO: 1,
    RECHAZADO: 2,
    CANCELADO: 2,
};
const SECTION_DESCRIPTIONS = {
    resumen: 'Consultá los casos que requieren atención y accedé a cada operación.',
    cancelaciones: 'Revisá las solicitudes para cancelar reservas y decidí si corresponde aprobarlas.',
    reclamos: 'Consultá los problemas reportados sobre reservas, su evidencia y el historial del caso.',
    reembolsos: 'Gestioná y seguí las devoluciones de dinero a los inquilinos.',
    liquidaciones: 'Registrá transferencias realizadas a anunciantes y revisá las reservas con el pago retenido.',
    'historial-liquidaciones': 'Consultá los pagos ya registrados a anunciantes, con su importe, fecha y referencia.',
    verificaciones: 'Revisá las solicitudes de verificación de identidad.',
    publicaciones: 'Consultá y moderá los alojamientos publicados.',
    usuarios: 'Buscá cuentas y consultá su rol y estado.',
    bloqueos: 'Consultá las cuentas bloqueadas, sus motivos y las apelaciones.',
    catalogos: 'Consultá las opciones que usa el sistema. Se cargan por seed o migración.',
    ubicaciones: 'Consultá las provincias y ciudades disponibles. Se cargan por seed o migración.',
    cotizaciones: 'Consultá y administrá las cotizaciones que usa el sistema para convertir importes.',
    comision: 'Configurá la comisión aplicable a nuevas reservas.',
};
export class AdminComponent {
    comisionActual = null;
    comisionNueva = null;
    comisionCargando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "comisionCargando" }] : /* istanbul ignore next */ []));
    comisionError = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "comisionError" }] : /* istanbul ignore next */ []));
    injector = inject(Injector);
    host = inject(ElementRef);
    router = inject(Router);
    route = inject(ActivatedRoute);
    navigation = computed(() => ADMIN_NAVIGATION.map(group => ({
        ...group, items: group.items.filter(item => item.id !== 'cancelaciones' || this.cancellations().length > 0),
    })), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "navigation" }] : /* istanbul ignore next */ []));
    activeSection = signal('resumen', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "activeSection" }] : /* istanbul ignore next */ []));
    sectionDescription = computed(() => SECTION_DESCRIPTIONS[this.activeSection()], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "sectionDescription" }] : /* istanbul ignore next */ []));
    historialLiquidaciones = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "historialLiquidaciones" }] : /* istanbul ignore next */ []));
    historialCargando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "historialCargando" }] : /* istanbul ignore next */ []));
    historialError = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "historialError" }] : /* istanbul ignore next */ []));
    historialRequest;
    dialogoResolucion = viewChild.required('dialogoResolucion', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "dialogoResolucion" }] : /* istanbul ignore next */ []));
    resolucionLiquidacion = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolucionLiquidacion" }] : /* istanbul ignore next */ []));
    resolucionCargando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolucionCargando" }] : /* istanbul ignore next */ []));
    resolucionError = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolucionError" }] : /* istanbul ignore next */ []));
    motivoResolucion = '';
    sectionLabel = computed(() => ADMIN_NAVIGATION.flatMap(({ items }) => [...items]).find(({ id }) => id === this.activeSection())?.label ?? 'Resumen', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "sectionLabel" }] : /* istanbul ignore next */ []));
    api = inject(AdminService);
    toast = inject(ToastService);
    destroyRef = inject(DestroyRef);
    cargaResumen;
    publicacionesAdmin = viewChild(PublicacionesAdminComponent, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "publicacionesAdmin" }] : /* istanbul ignore next */ []));
    usersRequest;
    bloqueadosRequest;
    actualizandoBloqueados = false;
    bloqueoDialog = viewChild.required('bloqueoDialog', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "bloqueoDialog" }] : /* istanbul ignore next */ []));
    isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    users = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "users" }] : /* istanbul ignore next */ []));
    bloqueados = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "bloqueados" }] : /* istanbul ignore next */ []));
    bloqueosOrdenados = computed(() => [...this.bloqueados()].sort((a, b) => {
        const prioridad = (bloqueo) => apelacionSinResponder(bloqueo.detalle) ? 0 : tieneApelacion(bloqueo.detalle) ? 1 : 2;
        return prioridad(a) - prioridad(b) || (b.detalle.fecha ?? '').localeCompare(a.detalle.fecha ?? '');
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "bloqueosOrdenados" }] : /* istanbul ignore next */ []));
    vistaBloqueos = signal('actuales', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "vistaBloqueos" }] : /* istanbul ignore next */ []));
    historialBloqueos = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "historialBloqueos" }] : /* istanbul ignore next */ []));
    historialBloqueosCargando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "historialBloqueosCargando" }] : /* istanbul ignore next */ []));
    historialBloqueosError = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "historialBloqueosError" }] : /* istanbul ignore next */ []));
    bloqueadosCargando = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "bloqueadosCargando" }] : /* istanbul ignore next */ []));
    bloqueadosError = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "bloqueadosError" }] : /* istanbul ignore next */ []));
    usuarioPorBloquear = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "usuarioPorBloquear" }] : /* istanbul ignore next */ []));
    bloqueando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "bloqueando" }] : /* istanbul ignore next */ []));
    bloqueoError = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "bloqueoError" }] : /* istanbul ignore next */ []));
    motivoBloqueo = '';
    respuestasApelacion = {};
    imagenesApelacion = {};
    /** Valor estable para las apelaciones sin imágenes elegidas. */
    sinImagenes = [];
    usersPage = signal(1, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "usersPage" }] : /* istanbul ignore next */ []));
    usersTotal = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "usersTotal" }] : /* istanbul ignore next */ []));
    usersPages = signal(1, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "usersPages" }] : /* istanbul ignore next */ []));
    usersLoading = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "usersLoading" }] : /* istanbul ignore next */ []));
    registeredUsers = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "registeredUsers" }] : /* istanbul ignore next */ []));
    requests = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "requests" }] : /* istanbul ignore next */ []));
    settlements = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "settlements" }] : /* istanbul ignore next */ []));
    liquidacionesOrdenadas = computed(() => [...this.settlements()].sort((a, b) => {
        const prioridad = (item) => {
            if (item.estado_liquidacion !== 'PENDIENTE_PAGO_PROPIETARIO')
                return 3;
            const dias = this.diasEsperaLiquidacion(item);
            return dias === 0 ? 0 : dias === null ? 2 : 1;
        };
        return prioridad(a) - prioridad(b);
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "liquidacionesOrdenadas" }] : /* istanbul ignore next */ []));
    claims = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "claims" }] : /* istanbul ignore next */ []));
    errorReclamos = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorReclamos" }] : /* istanbul ignore next */ []));
    gestionReclamo = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "gestionReclamo" }] : /* istanbul ignore next */ []));
    textoReclamo = '';
    /** Imágenes del próximo mensaje del reclamo. */
    imagenesReclamo = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "imagenesReclamo" }] : /* istanbul ignore next */ []));
    imagenesDisponibles = imagenesDisponibles;
    resolucionReclamo = 'SIN_DEVOLUCION';
    importeReclamo = null;
    observacionReclamo = '';
    cancellations = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cancellations" }] : /* istanbul ignore next */ []));
    dialogoAprobacion = viewChild.required('dialogoAprobacion', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "dialogoAprobacion" }] : /* istanbul ignore next */ []));
    solicitudPorAprobar = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "solicitudPorAprobar" }] : /* istanbul ignore next */ []));
    aprobandoCancelacion = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "aprobandoCancelacion" }] : /* istanbul ignore next */ []));
    errorAprobacion = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorAprobacion" }] : /* istanbul ignore next */ []));
    observacionAprobacion = '';
    refunds = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "refunds" }] : /* istanbul ignore next */ []));
    orderedRefunds = computed(() => [...this.refunds()].sort((a, b) => ORDEN_ESTADO_REEMBOLSO[a.estado] - ORDEN_ESTADO_REEMBOLSO[b.estado] ||
        Date.parse(b.creado_en) - Date.parse(a.creado_en) ||
        b.id - a.id), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "orderedRefunds" }] : /* istanbul ignore next */ []));
    dialogoReembolso = viewChild.required('dialogoReembolso', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "dialogoReembolso" }] : /* istanbul ignore next */ []));
    reembolsoSeleccionado = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reembolsoSeleccionado" }] : /* istanbul ignore next */ []));
    guardandoReembolso = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "guardandoReembolso" }] : /* istanbul ignore next */ []));
    errorReembolso = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorReembolso" }] : /* istanbul ignore next */ []));
    referenciaReembolso = '';
    dialogoPagoAnunciante = viewChild.required('dialogoPagoAnunciante', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "dialogoPagoAnunciante" }] : /* istanbul ignore next */ []));
    pagoAnuncianteSeleccionado = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pagoAnuncianteSeleccionado" }] : /* istanbul ignore next */ []));
    registrandoPagoAnunciante = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "registrandoPagoAnunciante" }] : /* istanbul ignore next */ []));
    errorPagoAnunciante = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorPagoAnunciante" }] : /* istanbul ignore next */ []));
    cbuParaPago = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cbuParaPago" }] : /* istanbul ignore next */ []));
    /** CUIT/CUIL del anunciante, para confirmar el destinatario en el banco. */
    cuitParaPago = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cuitParaPago" }] : /* istanbul ignore next */ []));
    consultandoCbuParaPago = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "consultandoCbuParaPago" }] : /* istanbul ignore next */ []));
    consultaCbuParaPago;
    referenciaPagoAnunciante = '';
    observacionPagoAnunciante = '';
    /** Comprobante obligatorio del pago al anunciante. */
    comprobantePago = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "comprobantePago" }] : /* istanbul ignore next */ []));
    formatearCbu = formatearCbu;
    formatearCuit = formatearCuit;
    tipoCuentaBancaria = tipoCuentaBancaria;
    urlComprobantePago = (pago) => () => this.api.urlComprobantePago(pago.reservaId, pago.indice);
    /** Importe para pegar en el home banking, con coma decimal y sin separador de miles. */
    importeParaCopiar(importe) {
        return Number(importe ?? 0).toFixed(2).replace('.', ',');
    }
    estadosReembolso = {
        PENDIENTE: 'Pendiente', EN_PROCESO: 'En proceso', APROBADO: 'Aprobado',
        RECHAZADO: 'Rechazado', FALLIDO: 'Fallido', CANCELADO: 'Cancelado',
    };
    origenesReembolso = ORIGENES_REEMBOLSO;
    otherLoading = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "otherLoading" }] : /* istanbul ignore next */ []));
    summaryError = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "summaryError" }] : /* istanbul ignore next */ []));
    openClaims = computed(() => this.claims().filter(reclamoAbierto), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "openClaims" }] : /* istanbul ignore next */ []));
    resumenReembolsos = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resumenReembolsos" }] : /* istanbul ignore next */ []));
    pendingRefunds = computed(() => this.orderedRefunds().filter(reembolsoPendiente), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pendingRefunds" }] : /* istanbul ignore next */ []));
    liquidacionesAPagar = computed(() => this.settlements().filter(pagoHabilitado), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "liquidacionesAPagar" }] : /* istanbul ignore next */ []));
    apelacionesAResponder = computed(() => this.bloqueados().filter(({ detalle }) => apelacionSinResponder(detalle)), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "apelacionesAResponder" }] : /* istanbul ignore next */ []));
    failedRefunds = computed(() => this.refunds().filter(({ estado }) => estado === 'FALLIDO'), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "failedRefunds" }] : /* istanbul ignore next */ []));
    conteoPendientes = computed(() => this.resumenReembolsos()?.pendientes ?? this.pendingRefunds().length, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "conteoPendientes" }] : /* istanbul ignore next */ []));
    conteoFallidos = computed(() => this.resumenReembolsos()?.fallidos ?? this.failedRefunds().length, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "conteoFallidos" }] : /* istanbul ignore next */ []));
    totalReembolsos = computed(() => this.resumenReembolsos()?.total ?? this.refunds().length, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "totalReembolsos" }] : /* istanbul ignore next */ []));
    /** Todos los casos que esperan una acción, del más antiguo al más nuevo. */
    pendingCases = computed(() => [
        ...this.cancellations().map((item) => ({
            section: 'cancelaciones', id: item.id, fecha: item.creada_en,
            label: item.reserva ? `Cancelación · Reserva #${item.reserva.id}` : `Cancelación #${item.id}`,
            status: 'Pendiente', tone: 'pending', action: 'Revisar',
        })),
        ...this.openClaims().map((item) => ({
            section: 'reclamos', id: item.id, fecha: item.creado_en,
            label: item.reserva ? `Reclamo · Reserva #${item.reserva.id}` : `Reclamo #${item.id}`,
            status: item.estado === 'EN_REVISION' ? 'En revisión' : 'Abierto', tone: 'review', action: 'Abrir',
        })),
        ...this.pendingRefunds().map((item) => ({
            section: 'reembolsos', id: item.id, fecha: item.creado_en,
            label: item.reserva ? `Reembolso · Reserva #${item.reserva.id}` : `Reembolso #${item.id}`,
            status: this.estadosReembolso[item.estado],
            tone: 'refund', action: 'Ver detalle',
        })),
        ...this.requests().map((item) => ({
            section: 'verificaciones', id: item.id, fecha: item.actualizada_en,
            label: `Verificación · Solicitud #${item.id}`,
            status: 'Pendiente', tone: 'pending', action: 'Revisar',
        })),
        ...this.liquidacionesAPagar().map((item) => ({
            section: 'liquidaciones', id: item.id, fecha: item.fecha_disponible_pago,
            label: `Liquidación · Reserva #${item.id}`,
            status: 'Pago habilitado', tone: 'payment', action: 'Registrar pago',
        })),
        ...this.apelacionesAResponder().map((item) => ({
            section: 'bloqueos', id: item.usuario.id, fecha: item.detalle.mensajes?.at(-1)?.fecha ?? item.detalle.apelacion?.fecha,
            label: `Apelación · ${item.usuario.nombre} ${item.usuario.apellido}`,
            status: 'Sin responder', tone: 'appeal', action: 'Responder',
        })),
    ].sort((a, b) => this.antiguedad(a.fecha) - this.antiguedad(b.fecha)), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pendingCases" }] : /* istanbul ignore next */ []));
    pendientesVisibles = signal(PENDIENTES_INICIALES, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pendientesVisibles" }] : /* istanbul ignore next */ []));
    pendientesMostrados = computed(() => this.pendingCases().slice(0, this.pendientesVisibles()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pendientesMostrados" }] : /* istanbul ignore next */ []));
    pendientesIniciales = PENDIENTES_INICIALES;
    /** Mismo tope que ReclamosRepository.listarAdministracion en el back. */
    maxReclamosAdmin = 200;
    // Búsqueda, filtros y paginación de cada lista (definidos en admin-listas.ts).
    listaCancelaciones = new ListaFiltrable(this.cancellations, { porPagina: 10, textos: textosCancelacion, filtros: FILTROS_CANCELACION });
    listaReclamos = new ListaFiltrable(this.claims, { porPagina: 5, textos: textosReclamo, filtros: FILTROS_RECLAMO });
    listaReembolsos = new ListaFiltrable(this.orderedRefunds, { porPagina: 10, textos: textosReembolso, filtros: FILTROS_REEMBOLSO });
    listaLiquidaciones = new ListaFiltrable(this.liquidacionesOrdenadas, { porPagina: 10, textos: textosLiquidacion, filtros: FILTROS_LIQUIDACION });
    listaVerificaciones = new ListaFiltrable(this.requests, { porPagina: 10, textos: textosVerificacion, filtros: FILTROS_VERIFICACION });
    listaBloqueos = new ListaFiltrable(this.bloqueosOrdenados, { porPagina: 5, textos: textosBloqueo, filtros: FILTROS_BLOQUEO });
    listaHistorialBloqueos = new ListaFiltrable(this.historialBloqueos, { porPagina: 5, textos: textosBloqueo, filtros: FILTROS_BLOQUEO });
    /** El historial de liquidaciones además se filtra por el día (en Argentina) en que se registró el pago. */
    historialDesde = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "historialDesde" }] : /* istanbul ignore next */ []));
    historialHasta = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "historialHasta" }] : /* istanbul ignore next */ []));
    historialEnRango = computed(() => {
        const desde = this.historialDesde(), hasta = this.historialHasta();
        if (!desde && !hasta)
            return this.historialLiquidaciones();
        return this.historialLiquidaciones().filter(({ fecha }) => {
            const dia = fecha ? fechaArgentina(fecha) : null;
            return !!dia && (!desde || dia >= desde) && (!hasta || dia <= hasta);
        });
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "historialEnRango" }] : /* istanbul ignore next */ []));
    listaHistorialLiquidaciones = new ListaFiltrable(this.historialEnRango, { porPagina: 10, textos: textosPagoLiquidacion });
    loading = computed(() => this.otherLoading() || this.usersLoading() || (this.publicacionesAdmin()?.publicationsLoading() ?? true), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "loading" }] : /* istanbul ignore next */ []));
    query = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "query" }] : /* istanbul ignore next */ []));
    busy = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    rejectId = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "rejectId" }] : /* istanbul ignore next */ []));
    catalogs = signal([
        { key: 'tipos-anunciante', label: 'Tipos de anunciante', items: [] },
        { key: 'tipos-propiedad', label: 'Tipos de propiedad', items: [] },
        { key: 'modalidades', label: 'Modalidades', items: [] },
        { key: 'tipos-moneda', label: 'Monedas', items: [] },
    ], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "catalogs" }] : /* istanbul ignore next */ []));
    provinces = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "provinces" }] : /* istanbul ignore next */ []));
    cities = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cities" }] : /* istanbul ignore next */ []));
    selectedProvince = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedProvince" }] : /* istanbul ignore next */ []));
    rejectReason = '';
    rechazarIdentidad = false;
    rechazarCbu = false;
    titularCbuConfirmado = null;
    constructor() {
        if (this.isBrowser) {
            this.reload();
            this.loadCatalogs();
            this.loadProvinces();
            // Abre la sección que indica la URL, por ejemplo al volver del detalle de una reserva.
            this.route.fragment.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((fragmento) => {
                const seccion = seccionAdmin(fragmento);
                if (seccion && seccion !== this.activeSection())
                    this.openSection(seccion);
            });
            timer(15_000, 15_000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
                if (this.activeSection() !== 'bloqueos' || this.busy() || this.bloqueadosCargando() || this.actualizandoBloqueados)
                    return;
                const vista = this.vistaBloqueos();
                this.actualizandoBloqueados = true;
                const consulta = vista === 'historial' ? this.api.listarHistorialBloqueos() : this.api.listarBloqueados();
                consulta.pipe(takeUntilDestroyed(this.destroyRef), finalize(() => { this.actualizandoBloqueados = false; })).subscribe({
                    next: usuarios => {
                        if (this.busy() || this.vistaBloqueos() !== vista)
                            return;
                        if (vista === 'historial')
                            this.historialBloqueos.set(this.ordenarHistorialBloqueos(usuarios));
                        else
                            this.bloqueados.set(usuarios);
                    },
                    error: () => { },
                });
            });
        }
    }
    reload() {
        if (this.activeSection() === 'historial-liquidaciones')
            this.cargarHistorialLiquidaciones();
        if (this.activeSection() === 'comision')
            this.cargarComision();
        this.cargaResumen?.unsubscribe();
        this.otherLoading.set(true);
        this.summaryError.set(false);
        this.publicacionesAdmin()?.recargar();
        this.loadUsers(this.usersPage());
        this.cargarBloqueados();
        this.cargaResumen = merge(this.cargarDatoResumen(this.api.listarPendientes(), (valor) => this.requests.set(valor)), this.cargarDatoResumen(this.api.listarLiquidaciones(), (valor) => this.settlements.set(valor), (error) => this.toast.mostrar(error.message, 'error')), this.cargarDatoResumen(this.api.listarReclamos(), (valor) => {
            this.claims.set(valor);
            this.errorReclamos.set('');
        }, (error) => {
            this.summaryError.set(true);
            this.errorReclamos.set(error.message);
        }), this.cargarDatoResumen(this.api.listarSolicitudesCancelacion(), (valor) => this.cancellations.set(valor)), this.cargarDatoResumen(this.api.listarReembolsos(), (valor) => this.refunds.set(valor)), this.cargarDatoResumen(this.api.resumenReembolsos(), (valor) => this.resumenReembolsos.set(valor), (error) => {
            this.resumenReembolsos.set(null);
            this.mostrarErrorResumen(error);
        })).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.otherLoading.set(false))).subscribe();
    }
    cargarDatoResumen(peticion, aplicar, informar = (error) => this.mostrarErrorResumen(error)) {
        return peticion.pipe(tap(aplicar), catchError((error) => {
            informar(error);
            return EMPTY;
        }));
    }
    mostrarErrorResumen(error) {
        this.summaryError.set(true);
        this.toast.mostrar(error.message, 'error');
    }
    openSection(section, caseId) {
        this.activeSection.set(section);
        // La sección queda en la URL, así «Volver» desde el detalle de una reserva (o un perfil) vuelve a ella.
        if (this.route.snapshot.fragment !== (section === 'resumen' ? null : section))
            void this.router.navigate([], { relativeTo: this.route, fragment: section === 'resumen' ? undefined : section, replaceUrl: true });
        if (section === 'comision')
            this.cargarComision();
        if (section === 'historial-liquidaciones')
            this.cargarHistorialLiquidaciones();
        if (caseId !== undefined)
            this.mostrarCaso(section, caseId);
        afterNextRender(() => {
            if (this.activeSection() !== section)
                return;
            const heading = this.host.nativeElement.querySelector('#admin-section-title');
            const target = caseId === undefined
                ? heading
                : this.host.nativeElement.querySelector(`#admin-${section}-${caseId}`) ?? heading;
            target?.focus({ preventScroll: true });
            target?.scrollIntoView({ block: 'start' });
            if (section === 'reembolsos' && caseId !== undefined) {
                const refund = this.refunds().find(({ id }) => id === caseId);
                if (refund)
                    this.abrirReembolso(refund);
            }
            if (section === 'liquidaciones' && caseId !== undefined) {
                const liquidacion = this.liquidacionesAPagar().find(({ id }) => id === caseId);
                if (liquidacion)
                    this.abrirPagoAnunciante(liquidacion);
            }
        }, { injector: this.injector });
    }
    /** Lleva a la página del caso; si la búsqueda o los filtros lo ocultan, los limpia. */
    mostrarCaso(section, id) {
        if (section === 'cancelaciones')
            this.listaCancelaciones.mostrar((item) => item.id === id);
        else if (section === 'reclamos')
            this.listaReclamos.mostrar((item) => item.id === id);
        else if (section === 'reembolsos')
            this.listaReembolsos.mostrar((item) => item.id === id);
        else if (section === 'liquidaciones')
            this.listaLiquidaciones.mostrar((item) => item.id === id);
        else if (section === 'verificaciones')
            this.listaVerificaciones.mostrar((item) => item.id === id);
        else if (section === 'bloqueos') {
            this.vistaBloqueos.set('actuales');
            this.listaBloqueos.mostrar((item) => item.usuario.id === id);
        }
    }
    /** Cada contador abre su lista mostrando exactamente los casos que cuenta. */
    abrirDesdeContador(section) {
        if (section === 'cancelaciones')
            this.listaCancelaciones.limpiar();
        else if (section === 'verificaciones')
            this.listaVerificaciones.limpiar();
        else if (section === 'reclamos')
            this.aplicarFiltro(this.listaReclamos, 'estado', 'abiertos');
        else if (section === 'reembolsos')
            this.aplicarFiltro(this.listaReembolsos, 'estado', 'pendientes');
        else if (section === 'liquidaciones')
            this.aplicarFiltro(this.listaLiquidaciones, 'situacion', 'habilitado');
        else {
            this.vistaBloqueos.set('actuales');
            this.aplicarFiltro(this.listaBloqueos, 'apelacion', 'en-curso');
        }
        this.openSection(section);
    }
    aplicarFiltro(lista, nombre, valor) {
        lista.limpiar();
        lista.filtrar(nombre, valor);
    }
    verMasPendientes() {
        this.pendientesVisibles.update((cantidad) => cantidad + PENDIENTES_POR_VEZ);
    }
    verMenosPendientes() {
        this.pendientesVisibles.set(PENDIENTES_INICIALES);
    }
    /** Los casos sin fecha van al final. */
    antiguedad(fecha) {
        const marca = Date.parse(fecha ?? '');
        return Number.isFinite(marca) ? marca : Number.POSITIVE_INFINITY;
    }
    filtrarHistorialLiquidaciones(campo, valor) {
        (campo === 'desde' ? this.historialDesde : this.historialHasta).set(valor);
        this.listaHistorialLiquidaciones.irAPagina(1);
    }
    limpiarHistorialLiquidaciones() {
        this.historialDesde.set('');
        this.historialHasta.set('');
        this.listaHistorialLiquidaciones.limpiar();
    }
    searchUsers(value) {
        this.query.set(value);
        this.loadUsers(1);
    }
    loadUsers(page) {
        if (page < 1 || page > this.usersPages())
            return;
        this.usersRequest?.unsubscribe();
        this.usersLoading.set(true);
        this.usersRequest = this.api.listarUsuarios(page, this.query().trim())
            .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (result) => {
                this.users.set(result.datos);
                this.usersPage.set(result.pagina);
                this.usersTotal.set(result.total);
                this.usersPages.set(result.totalPaginas);
                this.registeredUsers.set(result.totalRegistros);
                this.usersLoading.set(false);
            },
            error: (e) => {
                this.users.set([]);
                this.usersTotal.set(0);
                this.usersPage.set(1);
                this.usersPages.set(1);
                this.toast.mostrar(e.message, 'error');
                this.usersLoading.set(false);
            },
        });
    }
    abrirPagoAnunciante(settlement) {
        if (!settlement.habilitada_para_pago)
            return;
        this.pagoAnuncianteSeleccionado.set(settlement);
        this.referenciaPagoAnunciante = '';
        this.observacionPagoAnunciante = '';
        this.comprobantePago.set(null);
        this.errorPagoAnunciante.set('');
        this.cbuParaPago.set(null);
        this.cuitParaPago.set(null);
        this.consultaCbuParaPago?.unsubscribe();
        this.consultandoCbuParaPago.set(true);
        this.dialogoPagoAnunciante().nativeElement.showModal();
        this.consultaCbuParaPago = this.api.consultarCbuParaPago(settlement.id).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.consultandoCbuParaPago.set(false))).subscribe({
            next: ({ cbu, cuit_cuil }) => {
                this.cbuParaPago.set(cbu);
                this.cuitParaPago.set(cuit_cuil);
            },
            error: (error) => this.errorPagoAnunciante.set(error.message),
        });
    }
    cerrarPagoAnunciante(evento) {
        evento?.preventDefault();
        if (this.registrandoPagoAnunciante())
            return;
        this.dialogoPagoAnunciante().nativeElement.close();
        this.consultaCbuParaPago?.unsubscribe();
        this.cbuParaPago.set(null);
        this.cuitParaPago.set(null);
        this.comprobantePago.set(null);
        this.pagoAnuncianteSeleccionado.set(null);
    }
    confirmarPagoAnunciante() {
        const settlement = this.pagoAnuncianteSeleccionado();
        const comprobante = this.comprobantePago();
        const referencia = this.referenciaPagoAnunciante.trim();
        const observacion = this.observacionPagoAnunciante.trim();
        if (!settlement?.habilitada_para_pago || !this.cbuParaPago() || !comprobante ||
            this.registrandoPagoAnunciante() || referencia.length > 150 || observacion.length > 500)
            return;
        this.errorPagoAnunciante.set('');
        this.registrandoPagoAnunciante.set(true);
        this.api.registrarPagoAnunciante(settlement.id, comprobante, {
            referencia,
            observacion: observacion || 'Transferencia manual al propietario registrada',
        }).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.registrandoPagoAnunciante.set(false))).subscribe({
            next: () => {
                this.registrandoPagoAnunciante.set(false);
                this.cerrarPagoAnunciante();
                this.settlements.update((items) => items.filter((item) => item.id !== settlement.id));
                this.toast.mostrar('Pago registrado en el historial de liquidaciones.', 'exito');
            },
            error: (error) => this.errorPagoAnunciante.set(error.message),
        });
    }
    diasEsperaLiquidacion = diasEsperaLiquidacion;
    etiquetaLiquidacion = etiquetaLiquidacion;
    pendienteParaAnunciante = pendienteParaAnunciante;
    tieneDevolucion = tieneDevolucion;
    cargarHistorialLiquidaciones() {
        this.historialRequest?.unsubscribe();
        this.historialCargando.set(true);
        this.historialError.set('');
        this.historialRequest = this.api.listarHistorialLiquidaciones().pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.historialCargando.set(false))).subscribe({
            next: (pagos) => this.historialLiquidaciones.set(pagos),
            error: (error) => this.historialError.set(error.message),
        });
    }
    abrirResolucionLiquidacion(reserva, devolver) {
        this.resolucionLiquidacion.set({ reserva, devolver });
        this.motivoResolucion = '';
        this.resolucionError.set('');
        this.dialogoResolucion().nativeElement.showModal();
    }
    cerrarResolucionLiquidacion(evento) {
        evento?.preventDefault();
        if (this.resolucionCargando())
            return;
        this.dialogoResolucion().nativeElement.close();
        this.resolucionLiquidacion.set(null);
    }
    confirmarResolucionLiquidacion() {
        const resolucion = this.resolucionLiquidacion();
        const motivo = this.motivoResolucion.trim();
        // Tanto devolver al inquilino como cerrar la revisión exigen dejar el motivo.
        if (!resolucion || !motivo || motivo.length > 500 || this.resolucionCargando())
            return;
        const { reserva, devolver } = resolucion;
        const estado = devolver ? 'DEVUELTO_INQUILINO' : this.estadoAlCerrarRevision(reserva);
        this.resolucionError.set('');
        this.resolucionCargando.set(true);
        this.api.resolverLiquidacion(reserva.id, estado, undefined, motivo).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.resolucionCargando.set(false))).subscribe({
            next: () => {
                this.resolucionCargando.set(false);
                this.cerrarResolucionLiquidacion();
                this.settlements.update(items => items.filter(item => item.id !== reserva.id));
                // Si sigue pendiente para el anunciante, el back recalcula el importe y si ya se puede pagar.
                if (estado === 'PENDIENTE_PAGO_PROPIETARIO')
                    this.api.listarLiquidaciones().pipe(takeUntilDestroyed(this.destroyRef))
                        .subscribe({ next: (valor) => this.settlements.set(valor), error: () => undefined });
                this.toast.mostrar(devolver ? 'Caso enviado a Reembolsos.' : 'Revisión de liquidación cerrada.', 'exito');
                if (devolver) {
                    this.reload();
                    this.openSection('reembolsos');
                }
            },
            error: (error) => this.resolucionError.set(error.message),
        });
    }
    abrirAprobacionCancelacion(solicitud) {
        if (!solicitud.devolucion)
            return;
        this.solicitudPorAprobar.set(solicitud);
        this.observacionAprobacion = '';
        this.errorAprobacion.set('');
        this.dialogoAprobacion().nativeElement.showModal();
    }
    cerrarAprobacionCancelacion(evento) {
        evento?.preventDefault();
        if (this.aprobandoCancelacion())
            return;
        this.dialogoAprobacion().nativeElement.close();
        this.solicitudPorAprobar.set(null);
    }
    confirmarAprobacionCancelacion() {
        const solicitud = this.solicitudPorAprobar();
        const observacion = this.observacionAprobacion.trim();
        if (!solicitud?.devolucion || this.aprobandoCancelacion() || observacion.length > 500)
            return;
        this.errorAprobacion.set('');
        this.aprobandoCancelacion.set(true);
        this.api.resolverSolicitudCancelacion(solicitud.reserva?.id ?? 0, solicitud.id, 'APROBADA', observacion || undefined)
            .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.aprobandoCancelacion.set(false)))
            .subscribe({
            next: ({ reembolso }) => {
                this.aprobandoCancelacion.set(false);
                this.cerrarAprobacionCancelacion();
                this.cancellations.update((items) => items.filter((item) => item.id !== solicitud.id));
                if (!reembolso) {
                    this.toast.mostrar('Cancelación aprobada sin devolución.', 'exito');
                    return;
                }
                this.refunds.update((items) => [reembolso, ...items.filter((item) => item.id !== reembolso.id)]);
                this.toast.mostrar('Cancelación aprobada. La devolución quedó pendiente en Reembolsos.', 'exito');
                this.openSection('reembolsos', reembolso.id);
            },
            error: (error) => this.errorAprobacion.set(error.message),
        });
    }
    /** Comprobante elegido para registrar la transferencia del reembolso. */
    comprobanteReembolso = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "comprobanteReembolso" }] : /* istanbul ignore next */ []));
    observacionReembolso = '';
    urlComprobanteReembolso = (id) => () => this.api.urlComprobanteReembolso(id);
    abrirReembolso(reembolso) {
        this.reembolsoSeleccionado.set(reembolso);
        this.referenciaReembolso = '';
        this.observacionReembolso = '';
        this.comprobanteReembolso.set(null);
        this.errorReembolso.set('');
        this.dialogoReembolso().nativeElement.showModal();
    }
    cerrarReembolso(evento) {
        evento?.preventDefault();
        if (!this.guardandoReembolso())
            this.dialogoReembolso().nativeElement.close();
    }
    puedeSolicitarReembolso(reembolso) {
        return !reembolso.referencia_interna?.startsWith('auto-can:') &&
            !reembolso.transferencia_manual && reembolso.estado === 'PENDIENTE' && !!reembolso.pago?.payment_id;
    }
    puedeConciliarReembolso(reembolso) {
        return !reembolso.transferencia_manual && !!reembolso.pago?.payment_id && (reembolso.estado === 'FALLIDO' || reembolso.estado === 'EN_PROCESO');
    }
    puedeHabilitarTransferencia(reembolso) {
        return reembolso.estado === 'FALLIDO' && !reembolso.transferencia_manual && reembolso.origen !== 'CONTRACARGO';
    }
    habilitarTransferenciaReembolso(reembolso) {
        if (!this.puedeHabilitarTransferencia(reembolso) || this.guardandoReembolso())
            return;
        this.errorReembolso.set('');
        this.guardandoReembolso.set(true);
        this.api.habilitarTransferenciaReembolso(reembolso.id)
            .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.guardandoReembolso.set(false)))
            .subscribe({
            next: (actualizado) => {
                this.reembolsoSeleccionado.set(actualizado);
                this.referenciaReembolso = '';
                this.toast.mostrar('Transferencia habilitada. Coordiná la devolución desde el chat.', 'exito');
                this.reload();
            },
            error: (error) => this.errorReembolso.set(error.message),
        });
    }
    puedeRegistrarTransferencia(reembolso) {
        return !!reembolso.transferencia_manual && reembolso.estado === 'PENDIENTE';
    }
    /** Mismo formato que el desglose que va debajo, para que no se mezclen «ARS4.00» y «ARS 4,00». */
    importeConMoneda = formatearImporteConMoneda;
    referenciaReembolsoValida(reembolso) {
        const referencia = this.referenciaReembolso.trim();
        // El comprobante es obligatorio; la referencia y la observación, opcionales.
        if (this.puedeRegistrarTransferencia(reembolso))
            return !!this.comprobanteReembolso() && referencia.length <= 150 && this.observacionReembolso.trim().length <= 500;
        if (this.puedeConciliarReembolso(reembolso))
            return /^\d{1,100}$/.test(referencia);
        return this.puedeSolicitarReembolso(reembolso);
    }
    procesarReembolso(reembolso) {
        const referencia = this.referenciaReembolso.trim();
        if (this.guardandoReembolso() || !this.referenciaReembolsoValida(reembolso))
            return;
        this.errorReembolso.set('');
        this.guardandoReembolso.set(true);
        const comprobante = this.comprobanteReembolso();
        const operacion = this.puedeRegistrarTransferencia(reembolso) && comprobante
            ? this.api.registrarTransferenciaReembolso(reembolso.id, comprobante, { referencia, observacion: this.observacionReembolso.trim() })
            : this.puedeConciliarReembolso(reembolso)
                ? this.api.conciliarReembolso(reembolso.id, referencia)
                : this.api.solicitarReembolso(reembolso.id);
        operacion
            .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.guardandoReembolso.set(false)))
            .subscribe({
            next: ({ reembolso: actualizado }) => {
                if (actualizado.estado !== 'APROBADO') {
                    this.reembolsoSeleccionado.set(actualizado);
                    this.referenciaReembolso = '';
                    this.toast.mostrar(actualizado.transferencia_manual
                        ? 'Mercado Pago rechazó el reembolso. Continuá por el chat de transferencia.'
                        : 'La devolución quedó en seguimiento en Mercado Pago.', 'advertencia');
                    this.reload();
                    return;
                }
                this.dialogoReembolso().nativeElement.close();
                this.toast.mostrar('Reembolso confirmado y aplicado a la reserva.', 'exito');
                this.reload();
            },
            error: (e) => {
                this.errorReembolso.set(e.message);
                this.api.listarReembolsos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                    next: (items) => {
                        this.refunds.set(items);
                        const vigente = items.find((item) => item.id === reembolso.id);
                        if (vigente && this.reembolsoSeleccionado()?.id === vigente.id) {
                            this.reembolsoSeleccionado.set(vigente);
                        }
                    },
                    error: () => { },
                });
            },
        });
    }
    rechazarCancelacion(solicitud) {
        const observacion = window.prompt('Motivo del rechazo:')?.trim();
        if (!observacion)
            return;
        this.run(`cancellation-${solicitud.id}`, () => this.api.resolverSolicitudCancelacion(solicitud.reserva?.id ?? 0, solicitud.id, 'RECHAZADA', observacion), () => this.cancellations.update((items) => items.filter((item) => item.id !== solicitud.id)), 'Solicitud de cancelación rechazada.');
    }
    abrirGestionReclamo(id, accion) {
        if (this.busy())
            return;
        this.textoReclamo = '';
        this.imagenesReclamo.set([]);
        const reclamo = this.claims().find(item => item.id === id);
        const pedidoDeCodigo = reclamo?.categoria === 'CODIGO_BLOQUEADO';
        this.resolucionReclamo = !pedidoDeCodigo ? 'SIN_DEVOLUCION'
            : reclamo?.reserva?.estado_estadia === 'PENDIENTE_INGRESO' ? 'REINICIAR_CODIGO' : 'CONFIRMAR_INGRESO';
        this.importeReclamo = null;
        this.observacionReclamo = '';
        this.gestionReclamo.set({ id, accion });
    }
    /** El mensaje puede llevar imágenes; con imágenes, el texto es opcional. */
    responderReclamo(reclamo) {
        const texto = this.textoReclamo.trim();
        const imagenes = this.imagenesReclamo();
        if ((!texto && !imagenes.length) || texto.length > 1000 || this.busy())
            return;
        this.run(`claim-${reclamo.id}`, () => this.api.responderReclamo(reclamo.id, texto, imagenes), (value) => {
            const mensaje = value;
            this.claims.update((items) => items.map((item) => item.id === reclamo.id ? {
                ...item,
                estado: item.estado === 'ABIERTO' ? 'EN_REVISION' : item.estado,
                mensajes: [...(item.mensajes ?? []).filter((previo) => previo.id !== mensaje.id), mensaje],
            } : item));
            this.imagenesReclamo.set([]);
            this.gestionReclamo.set(null);
        }, 'Mensaje enviado al hilo del reclamo.');
    }
    resolverReclamoReserva(reclamo) {
        if (this.busy())
            return;
        const resolucion = this.resolucionReclamo;
        const importe = resolucion === 'DEVOLUCION_PARCIAL' ? this.importeReclamo : undefined;
        const observacion = this.observacionReclamo.trim();
        if (!observacion || observacion.length > 500)
            return;
        if (resolucion === 'DEVOLUCION_PARCIAL' && (importe == null || !Number.isFinite(importe) || importe <= 0)) {
            this.toast.mostrar('Indicá un importe parcial válido.', 'error');
            return;
        }
        if (resolucion === 'DEVOLUCION_PARCIAL' && this.parcialCubreElTotal(reclamo)) {
            this.toast.mostrar((reclamo.solicitud_cancelacion_id && reclamo.categoria !== 'DEMORA_ADMINISTRATIVA')
                ? 'La devolución parcial debe ser menor al faltante. Para completarlo elegí «Completar faltante».'
                : 'La devolución parcial tiene que ser menor que lo que pagó el inquilino. Para devolver todo elegí «Devolución total».', 'error');
            return;
        }
        this.run(`claim-${reclamo.id}`, () => this.api.resolverReclamo(reclamo.id, resolucion, importe ?? undefined, observacion), (value) => {
            const resuelto = value;
            this.claims.update((items) => items.map((item) => item.id === reclamo.id ? { ...item, ...resuelto, reserva: item.reserva } : item));
            this.gestionReclamo.set(null);
            this.toast.mostrar(this.avisoResolucion(reclamo, resuelto), 'exito');
            this.reload();
        }, null);
    }
    avisoResolucion(reclamo, resuelto) {
        if ((reclamo.solicitud_cancelacion_id && reclamo.categoria !== 'DEMORA_ADMINISTRATIVA'))
            return resuelto.resolucion === 'SIN_DEVOLUCION'
                ? 'Reclamo cerrado sin devolución adicional.'
                : `Reclamo resuelto con devolución del faltante de ${this.montoReclamo(reclamo, resuelto.importe_reembolso ?? 0)}. La devolución sigue en Reembolsos.`;
        if (resuelto.resolucion === 'SIN_DEVOLUCION')
            return 'Reclamo resuelto a favor del anunciante, sin devolución.';
        if (resuelto.resolucion === 'REINICIAR_CODIGO')
            return 'Pedido resuelto: el anunciante ya puede volver a cargar el código.';
        if (resuelto.resolucion === 'CONFIRMAR_INGRESO')
            return 'Pedido resuelto: el ingreso quedó confirmado y la liquidación pasa a pendiente de pago.';
        const tipo = resuelto.resolucion === 'DEVOLUCION_TOTAL' ? 'total' : 'parcial';
        const importe = resuelto.importe_reembolso ? ` de ${this.montoReclamo(reclamo, resuelto.importe_reembolso)}` : '';
        return `Reclamo resuelto con devolución ${tipo}${importe}. La devolución sigue en Reembolsos.`;
    }
    /** Lleva al reembolso del reclamo; si ya no está en la lista, abre la sección igual. */
    verReembolsoReclamo(reclamo) {
        const reembolso = this.refunds().find((item) => item.origen === 'RECLAMO' && item.referencia_interna === `rec:${reclamo.id}`);
        this.openSection('reembolsos', reembolso?.id);
    }
    /** Lo que pagó el inquilino; el back controla el saldo exacto descontando devoluciones previas. */
    totalPagadoReclamo(reclamo) {
        if (reclamo.devolucion_cancelacion)
            return reclamo.devolucion_cancelacion.importeReclamable;
        const total = Number(reclamo.reserva?.monto_pago);
        return Number.isFinite(total) && total > 0 ? total : null;
    }
    /** Un parcial por todo lo pagado es una devolución total: se pide elegir esa opción. */
    parcialCubreElTotal(reclamo) {
        const total = this.totalPagadoReclamo(reclamo);
        return total != null && this.importeReclamo != null && Number(this.importeReclamo) >= total - 0.009;
    }
    montoReclamo(reclamo, importe) {
        return Number(importe).toLocaleString('es-AR', { style: 'currency', currency: reclamo.devolucion_cancelacion?.moneda || reclamo.reserva?.moneda_contratada || 'ARS' });
    }
    nombreInquilino = nombreInquilino;
    tieneApelacion = tieneApelacion;
    apelacionSinResponder = apelacionSinResponder;
    /** Lo que se le liquida al anunciante: lo pagado menos lo que ya se le devolvió al inquilino. */
    montoLiquidacion(settlement) {
        return this.formatearImporte(settlement.importe_a_liquidar, settlement.moneda_liquidacion);
    }
    montoPagado(settlement) {
        return this.formatearImporte(settlement.monto_pago, settlement.moneda_liquidacion);
    }
    /** Al cerrar la revisión, una cancelada o con el ingreso validado queda para pagarle al anunciante. */
    estadoAlCerrarRevision(reserva) {
        return reserva.codigo_validado_en || reserva.cancelada ? 'PENDIENTE_PAGO_PROPIETARIO' : 'RETENIDO';
    }
    formatearImporte(importe, moneda) {
        return Number(importe).toLocaleString('es-AR', { style: 'currency', currency: moneda || 'ARS' });
    }
    guardarComision() {
        const porcentaje = this.comisionNueva;
        if (porcentaje == null || !Number.isFinite(porcentaje) || porcentaje < 0 || porcentaje > 100 || Math.abs(Math.round(porcentaje * 100) - porcentaje * 100) > 1e-8) {
            this.toast.mostrar('Ingresá un porcentaje entre 0 y 100 con hasta dos decimales.', 'error');
            return;
        }
        this.api.actualizarComisionDepa(porcentaje).subscribe({ next: (resultado) => { this.comisionActual = resultado.porcentaje; this.toast.mostrar('Comisión actualizada para nuevas reservas.', 'exito'); }, error: (e) => this.toast.mostrar(e.message, 'error') });
    }
    cargarComision() {
        this.comisionCargando.set(true);
        this.comisionError.set('');
        this.api.obtenerComisionDepa().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: ({ porcentaje }) => {
                this.comisionActual = porcentaje;
                this.comisionNueva = porcentaje;
                this.comisionCargando.set(false);
            },
            error: (error) => {
                this.comisionActual = null;
                this.comisionCargando.set(false);
                this.comisionError.set(error.message || 'No se pudo consultar la comisión.');
            },
        });
    }
    cargarBloqueados() {
        this.bloqueadosRequest?.unsubscribe();
        this.bloqueadosCargando.set(true);
        this.bloqueadosError.set('');
        this.bloqueadosRequest = this.api.listarBloqueados().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (usuarios) => {
                this.bloqueados.set(usuarios);
                this.bloqueadosCargando.set(false);
            },
            error: (error) => {
                this.bloqueadosError.set(error.message);
                this.bloqueadosCargando.set(false);
            },
        });
    }
    cambiarVistaBloqueos(vista) {
        this.vistaBloqueos.set(vista);
        if (vista === 'historial')
            this.cargarHistorialBloqueos();
    }
    cargarHistorialBloqueos() {
        this.historialBloqueosCargando.set(true);
        this.historialBloqueosError.set('');
        this.api.listarHistorialBloqueos().pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.historialBloqueosCargando.set(false))).subscribe({
            next: registros => this.historialBloqueos.set(this.ordenarHistorialBloqueos(registros)),
            error: (error) => this.historialBloqueosError.set(error.message),
        });
    }
    ordenarHistorialBloqueos(registros) {
        return [...registros].sort((a, b) => (b.detalle.fechaDesbloqueo ?? b.detalle.fecha ?? '').localeCompare(a.detalle.fechaDesbloqueo ?? a.detalle.fecha ?? ''));
    }
    toggleUser(user) {
        if (!user.bloqueado) {
            this.usuarioPorBloquear.set(user);
            this.motivoBloqueo = '';
            this.bloqueoError.set('');
            this.bloqueoDialog().nativeElement.showModal();
            return;
        }
        this.run(`user-${user.id}`, () => this.api.cambiarBloqueo(user.id, false), () => this.actualizarBloqueoUsuario(user.id, false), 'Usuario habilitado.');
    }
    cerrarBloqueo(event) {
        event?.preventDefault();
        if (this.bloqueando())
            return;
        this.bloqueoDialog().nativeElement.close();
        this.usuarioPorBloquear.set(null);
    }
    confirmarBloqueo() {
        const usuario = this.usuarioPorBloquear();
        const motivo = this.motivoBloqueo.trim();
        if (!usuario || !motivo || motivo.length > 500 || this.bloqueando())
            return;
        this.bloqueando.set(true);
        this.bloqueoError.set('');
        this.api.cambiarBloqueo(usuario.id, true, motivo).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: ({ accesoLimitado }) => {
                this.bloqueando.set(false);
                this.cerrarBloqueo();
                this.actualizarBloqueoUsuario(usuario.id, true);
                this.toast.mostrar(accesoLimitado ? 'Usuario bloqueado con acceso a operaciones pendientes.' : 'Usuario bloqueado.', 'exito');
            },
            error: (error) => {
                this.bloqueando.set(false);
                this.bloqueoError.set(error.message);
            },
        });
    }
    actualizarBloqueoUsuario(id, bloqueado) {
        this.users.update((usuarios) => usuarios.map((usuario) => usuario.id === id ? { ...usuario, bloqueado } : usuario));
        this.cargarBloqueados();
    }
    mensajesApelacion = mensajesApelacion;
    cancelarRespuesta(bloqueo) {
        this.respuestasApelacion[bloqueo.detalle.id] = '';
        this.imagenesApelacion[bloqueo.detalle.id] = [];
        this.bloqueadosError.set('');
    }
    desbloquearDesdeApelaciones(bloqueo) {
        if (this.busy())
            return;
        this.run(`user-${bloqueo.usuario.id}`, () => this.api.cambiarBloqueo(bloqueo.usuario.id, false), () => {
            this.cancelarRespuesta(bloqueo);
            this.actualizarBloqueoUsuario(bloqueo.usuario.id, false);
        }, 'Usuario habilitado.');
    }
    responderApelacion(bloqueo) {
        const texto = (this.respuestasApelacion[bloqueo.detalle.id] ?? '').trim();
        if (!texto || texto.length > 2000 || this.busy())
            return;
        this.busy.set(`apelacion-${bloqueo.detalle.id}`);
        this.bloqueadosError.set('');
        this.api.responderApelacion(bloqueo.usuario.id, bloqueo.detalle.id, texto, this.imagenesApelacion[bloqueo.detalle.id]?.[0])
            .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => {
                this.busy.set(null);
                this.cancelarRespuesta(bloqueo);
                this.cargarBloqueados();
            },
            error: (error) => {
                this.busy.set(null);
                this.bloqueadosError.set(error.message);
            },
        });
    }
    approve(request) {
        if (!this.puedeResolverVerificacion(request, false, false))
            return;
        const id = request.anunciante.idUsuario;
        this.run(`request-${id}`, () => this.api.aprobar(id, request.numero_revision, !!request.cbu_pendiente, this.titularCbuConfirmado === request.id), () => {
            this.titularCbuConfirmado = null;
            this.requests.update((v) => v.filter((r) => r.id !== request.id));
        }, 'Solicitud aprobada.');
    }
    openReject(request) {
        this.rejectReason = '';
        this.rechazarIdentidad = request.revisar_identidad && !request.cbu_pendiente;
        this.rechazarCbu = !!request.cbu_pendiente && !request.revisar_identidad;
        this.rejectId.set(request.id);
    }
    cancelReject() {
        this.rejectId.set(null);
        this.rejectReason = '';
    }
    confirmReject(request) {
        const motivo = this.rejectReason.trim();
        if (motivo.length < 5 || (!this.rechazarIdentidad && !this.rechazarCbu) ||
            !this.puedeResolverVerificacion(request, this.rechazarIdentidad, this.rechazarCbu))
            return;
        const id = request.anunciante.idUsuario;
        this.run(`request-${id}`, () => this.api.rechazar(id, {
            motivo,
            numero_revision: request.numero_revision,
            revisar_cbu: !!request.cbu_pendiente,
            titular_cbu_confirmado: this.titularCbuConfirmado === request.id,
            rechazar_identidad: this.rechazarIdentidad,
            rechazar_cbu: this.rechazarCbu,
        }), () => {
            this.titularCbuConfirmado = null;
            this.requests.update((v) => v.filter((r) => r.id !== request.id));
            this.cancelReject();
        }, 'Solicitud rechazada.');
    }
    puedeResolverVerificacion(request, rechazaIdentidad, rechazaCbu) {
        return this.busy() !== 'request-' + request.anunciante.idUsuario &&
            (!request.revisar_identidad || rechazaIdentidad || !!request.prueba_vida_validada_en) &&
            (!request.cbu_pendiente || rechazaCbu || this.titularCbuConfirmado === request.id);
    }
    esVideo(url) {
        return /\.(mp4|webm|mov)(?:\?|$)/i.test(url);
    }
    run(key, request, success, message, failure) {
        this.busy.set(key);
        request().subscribe({
            next: (v) => {
                success(v);
                if (message)
                    this.toast.mostrar(message, 'exito');
                this.busy.set(null);
            },
            error: (e) => {
                failure?.();
                this.toast.mostrar(e.message, 'error');
                this.busy.set(null);
            },
        });
    }
    loadCatalogs() {
        const sections = this.catalogs();
        forkJoin(sections.map((s) => this.api.listarCatalogo(s.key))).subscribe({
            next: (values) => this.catalogs.set(sections.map((s, i) => ({ ...s, items: values[i] }))),
            error: (e) => this.toast.mostrar(e.message, 'error'),
        });
    }
    loadProvinces() {
        this.api.listarProvincias().subscribe({
            next: (v) => {
                this.provinces.set(v);
            },
            error: (e) => this.toast.mostrar(e.message, 'error'),
        });
    }
    selectProvince(id) {
        this.selectedProvince.set(id);
        this.api.listarCiudades(id).subscribe({
            next: (v) => this.cities.set(v),
            error: (e) => this.toast.mostrar(e.message, 'error'),
        });
    }
    static ɵfac = function AdminComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AdminComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AdminComponent, selectors: [["app-admin"]], viewQuery: function AdminComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.dialogoResolucion, _c0, 5)(ctx.publicacionesAdmin, PublicacionesAdminComponent, 5)(ctx.bloqueoDialog, _c1, 5)(ctx.dialogoAprobacion, _c2, 5)(ctx.dialogoReembolso, _c3, 5)(ctx.dialogoPagoAnunciante, _c4, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance(6);
        } }, decls: 285, vars: 94, consts: [["bloqueoDialog", ""], ["dialogoResolucion", ""], ["dialogoPagoAnunciante", ""], ["dialogoAprobacion", ""], ["dialogoReembolso", ""], ["titular", ""], ["aria-label", "Panel administrativo", 1, "admin"], [1, "admin-sidebar"], ["routerLink", "/", "title", "Ir al inicio", 1, "admin-brand"], ["src", "/images/Logo.png", "alt", "DEPA"], ["aria-label", "Secciones del panel", 1, "admin-nav"], ["type", "button", 3, "click"], ["lucideHouse", "", "aria-hidden", "true", 3, "size"], [1, "admin-nav-group"], [1, "admin-section-picker"], [3, "ngModelChange", "ngModel"], ["value", "resumen"], [3, "label"], [1, "admin-workspace"], [1, "admin-topbar"], ["lucideUsers", "", "aria-hidden", "true", 3, "size"], [1, "admin-content"], [1, "admin__header"], ["id", "admin-section-title", "tabindex", "-1"], [1, "admin-section-description"], ["type", "button", 1, "button", "dashboard-button", 3, "click", "disabled"], ["lucideRefreshCw", "", "aria-hidden", "true", 3, "size"], ["aria-labelledby", "block-dialog-title", 1, "block-dialog", 3, "cancel"], [1, "block-form", 3, "ngSubmit"], [1, "block-form__header"], ["aria-hidden", "true", 1, "block-form__icon"], ["lucideLockKeyhole", "", 3, "size"], [1, "block-form__title"], ["id", "block-dialog-title"], [1, "block-form__notice", "block-form__notice--info"], ["aria-hidden", "true", 1, "block-form__notice-icon"], ["lucideInfo", "", 3, "size"], [1, "block-form__notice", "block-form__notice--warning"], ["lucideLayers3", "", 3, "size"], ["for", "block-reason"], ["id", "block-reason", "name", "motivoBloqueo", "placeholder", "Explic\u00E1 por qu\u00E9 se bloquea esta cuenta", "rows", "5", "maxlength", "500", "required", "", "autofocus", "", 3, "ngModelChange", "ngModel"], ["role", "alert", 1, "alert", "alert--error"], [1, "block-actions"], ["type", "button", 1, "button", "button--ghost", 3, "click", "disabled"], ["type", "submit", 1, "button", "button--danger-outline", 3, "disabled"], [3, "hidden"], [1, "panel", "admin-module", 3, "hidden"], [1, "panel__title"], [1, "counter"], [1, "empty"], ["role", "alert", 1, "refund-action"], ["role", "status", 1, "refund-note"], ["role", "status", 1, "empty"], ["aria-labelledby", "settlement-decision-title", 1, "block-dialog", "refund-dialog", "cancellation-approval-dialog", 3, "cancel"], ["aria-labelledby", "advertiser-payment-title", 1, "block-dialog", "refund-dialog", "cancellation-approval-dialog", "advertiser-payment-dialog", 3, "cancel"], [1, "advertiser-payment__header"], ["aria-hidden", "true", 1, "cancellation-approval-icon"], ["lucideWallet", "", 3, "size"], ["id", "advertiser-payment-title"], [1, "refund-meta"], ["id", "advertiser-payment-help", 1, "refund-help"], [3, "archivoChange", "archivo", "deshabilitado"], ["for", "advertiser-payment-reference"], [1, "muted"], ["id", "advertiser-payment-reference", "name", "referenciaPagoAnunciante", "maxlength", "150", "aria-describedby", "advertiser-payment-help", 3, "ngModelChange", "ngModel", "disabled"], ["for", "advertiser-payment-note"], ["id", "advertiser-payment-note", "name", "observacionPagoAnunciante", "rows", "3", "maxlength", "500", 3, "ngModelChange", "ngModel", "disabled"], ["role", "alert", 1, "refund-error", "advertiser-payment__alert"], ["type", "submit", 1, "button", "button--success", 3, "disabled"], ["aria-labelledby", "cancellation-approval-title", 1, "block-dialog", "cancellation-approval-dialog", 3, "cancel"], ["lucideCheck", "", 3, "size"], ["id", "cancellation-approval-title"], ["for", "cancellation-approval-note"], ["id", "cancellation-approval-note", "name", "observacionAprobacion", "rows", "4", "maxlength", "500", "placeholder", "Agreg\u00E1 una observaci\u00F3n si corresponde", "aria-describedby", "cancellation-approval-note-help", "autofocus", "", 3, "ngModelChange", "ngModel", "disabled"], ["id", "cancellation-approval-note-help", 1, "muted"], ["role", "alert", 1, "refund-error"], ["aria-labelledby", "refund-title", 1, "block-dialog", "refund-dialog", 3, "cancel", "close"], [1, "block-form"], ["id", "reclamos", 1, "panel", "admin-module", 3, "hidden"], [1, "settlement-list"], ["tabindex", "-1", 1, "settlement-card", "claim-card", 3, "id"], ["etiqueta", "reclamos", "ariaLabel", "Paginaci\u00F3n de reclamos", 1, "admin-paginador", 3, "pagina", "paginas", "total"], [1, "panel__title", "panel__title--users"], [1, "search"], ["lucideSearch", "", 3, "size"], ["type", "search", "aria-label", "Buscar usuarios", "maxlength", "200", "placeholder", "Buscar por nombre, email o CUIT/CUIL", 3, "ngModelChange", "ngModel"], [1, "table-wrap"], ["role", "table", 1, "responsive-table"], [1, "right"], ["aria-label", "Paginaci\u00F3n de usuarios", 1, "pagination"], ["role", "status"], [1, "pagination__actions"], ["aria-labelledby", "blocked-users-title", 1, "panel", "admin-module", "appeals-panel", 3, "hidden"], [1, "panel__title", "appeals-panel__title"], ["id", "blocked-users-title"], ["aria-label", "Vistas de bloqueos", 1, "appeals-tabs"], ["aria-label", "Configuraci\u00F3n de comisi\u00F3n", 1, "commission-section", "admin-module", 3, "hidden"], [1, "commission-grid"], [1, "panel", "management", "admin-module", 3, "hidden"], [1, "catalog-grid"], [1, "catalog-card"], [1, "location-grid"], [1, "crud-list"], [3, "selected"], [1, "empty-row"], ["type", "button"], [3, "value"], [1, "dashboard-metrics"], ["type", "button", 1, "dashboard-metric", "metric-cancellation"], ["type", "button", 1, "dashboard-metric", 3, "click"], ["lucideMessageCircle", "", "aria-hidden", "true", 3, "size"], ["type", "button", 1, "dashboard-metric", "metric-refund", 3, "click"], ["lucideWallet", "", "aria-hidden", "true", 3, "size"], ["lucideShieldCheck", "", "aria-hidden", "true", 3, "size"], ["type", "button", 1, "dashboard-metric", "metric-settlement", 3, "click"], ["lucideCircleDollarSign", "", "aria-hidden", "true", 3, "size"], ["type", "button", 1, "dashboard-metric", "metric-appeal", 3, "click"], ["lucideGavel", "", "aria-hidden", "true", 3, "size"], [1, "dashboard-columns"], [1, "dashboard-card"], [1, "dashboard-card", "dashboard-shortcuts"], ["lucideChevronRight", "", "aria-hidden", "true", 3, "size"], ["type", "button", 1, "dashboard-metric", "metric-cancellation", 3, "click"], ["lucideCalendarX", "", "aria-hidden", "true", 3, "size"], [1, "dashboard-table"], ["scope", "col"], [1, "dashboard-more"], [1, "dashboard-status"], ["type", "button", 1, "button", "dashboard-button", 3, "click"], ["type", "button", 1, "button", "dashboard-button"], ["etiqueta", "Buscar liquidaciones", "placeholder", "Buscar por reserva, publicaci\u00F3n, inquilino o anunciante", 1, "admin-filtros", 3, "lista"], ["tabindex", "-1", 1, "settlement-card", 3, "id"], ["etiqueta", "liquidaciones", "ariaLabel", "Paginaci\u00F3n de liquidaciones", 1, "admin-paginador", 3, "pagina", "paginas", "total"], [1, "status"], [1, "settlement-note"], [1, "actions"], [1, "button", "button--ghost", 3, "routerLink", "queryParams"], ["type", "button", 1, "button", "button--ghost"], ["type", "button", 1, "button", "button--danger-outline", 3, "click"], ["type", "button", 1, "button", "button--ghost", 3, "click"], ["type", "button", 1, "button", "button--success"], ["tabindex", "0", 1, "settlement-payment-unavailable"], ["type", "button", 1, "button", "button--success", 3, "click"], ["type", "button", "disabled", "", 1, "button", "button--success"], ["role", "tooltip", 1, "settlement-payment-unavailable__tooltip", 3, "id"], ["type", "button", 1, "link-button", 3, "click"], ["etiqueta", "liquidaciones", "ariaLabel", "Paginaci\u00F3n de liquidaciones", 1, "admin-paginador", 3, "paginaCambia", "pagina", "paginas", "total"], ["etiqueta", "Buscar solicitudes de cancelaci\u00F3n", "placeholder", "Buscar por solicitud, reserva, inquilino, publicaci\u00F3n o motivo", 1, "admin-filtros", 3, "lista"], ["etiqueta", "solicitudes", "ariaLabel", "Paginaci\u00F3n de solicitudes de cancelaci\u00F3n", 1, "admin-paginador", 3, "pagina", "paginas", "total"], [1, "status", "status--blocked"], [1, "refund-error"], ["type", "button", 1, "button", "button--success", 3, "click", "disabled"], ["type", "button", 1, "button", "button--danger-outline", 3, "click", "disabled"], [1, "cancellation-refund"], ["etiqueta", "solicitudes", "ariaLabel", "Paginaci\u00F3n de solicitudes de cancelaci\u00F3n", 1, "admin-paginador", 3, "paginaCambia", "pagina", "paginas", "total"], ["etiqueta", "Buscar reembolsos", "placeholder", "Buscar por reembolso, reserva, publicaci\u00F3n, inquilino, motivo u operaci\u00F3n", 1, "admin-filtros", 3, "lista"], ["etiqueta", "reembolsos", "ariaLabel", "Paginaci\u00F3n de reembolsos", 1, "admin-paginador", 3, "pagina", "paginas", "total"], ["etiqueta", "reembolsos", "ariaLabel", "Paginaci\u00F3n de reembolsos", 1, "admin-paginador", 3, "paginaCambia", "pagina", "paginas", "total"], ["etiqueta", "Buscar pagos registrados", "placeholder", "Buscar por reserva, publicaci\u00F3n, anunciante, operaci\u00F3n o administrador", 1, "admin-filtros", 3, "lista"], [1, "filtros-lista__filtro"], ["type", "date", 3, "change", "value", "max"], ["type", "date", 3, "change", "value", "min"], [1, "table-wrap", "settlement-history"], [1, "settlement-history__table"], [1, "settlement-history-caption"], ["etiqueta", "pagos", "ariaLabel", "Paginaci\u00F3n del historial de liquidaciones", 1, "admin-paginador", 3, "paginaCambia", "pagina", "paginas", "total"], ["data-label", "Fecha de registro"], ["data-label", "Reserva"], [1, "settlement-history__reservation", 3, "routerLink", "queryParams"], [1, "settlement-history__publication"], ["data-label", "Anunciante"], ["data-label", "Importe", 1, "settlement-history__amount"], [3, "desglose", "moneda"], ["data-label", "Comprobante y observaci\u00F3n"], [3, "obtenerUrl", "etiqueta"], [1, "settlement-history__reference"], ["data-label", "Registrado por"], [1, "settlement-history__date"], ["lucideCalendarDays", "", "aria-hidden", "true", 3, "size"], [1, "settlement-history__date", "settlement-history__time"], ["lucideClock3", "", "aria-hidden", "true", 3, "size"], ["id", "settlement-decision-title"], [1, "refund-help"], ["for", "settlement-decision-note"], ["id", "settlement-decision-note", "name", "motivoResolucion", "rows", "4", "maxlength", "500", "required", "", "autofocus", "", 3, "ngModelChange", "ngModel", "disabled"], ["type", "submit", 1, "button", 3, "disabled"], [1, "advertiser-payment__summary"], [1, "advertiser-payment__row"], [1, "advertiser-payment__commission"], [1, "advertiser-payment__row", "advertiser-payment__net"], ["descripcion", "importe a transferir", 3, "valor", "copia"], ["aria-labelledby", "advertiser-transfer-title", 1, "transfer-data"], ["id", "advertiser-transfer-title"], [1, "transfer-data__label"], [3, "valor", "copia", "descripcion", "monoespaciado"], [1, "transfer-data__owner"], [1, "cancellation-refund", "cancellation-refund--summary"], [1, "refund-heading"], ["lucideReceiptText", "", 3, "size"], ["id", "refund-title"], ["type", "button", "aria-label", "Cerrar", 1, "button", "button--ghost", 3, "click", "disabled"], ["lucideX", "", "aria-hidden", "true", 3, "size"], [1, "refund-amount"], ["descripcion", "importe a devolver", 1, "refund-amount__value", 3, "valor", "copia"], [1, "refund-amount__value"], [1, "refund-data"], [1, "refund-reason"], ["id", "refund-transfer-help", 1, "refund-help", "refund-help--accent"], [1, "refund-chat", 3, "open"], ["type", "button", 1, "button", "button--ghost", 3, "disabled"], [3, "reembolsoId"], ["for", "refund-bank-reference"], ["id", "refund-bank-reference", "name", "referenciaReembolso", "maxlength", "150", "aria-describedby", "refund-transfer-help", 3, "ngModelChange", "ngModel", "disabled"], ["for", "refund-transfer-note"], ["id", "refund-transfer-note", "name", "observacionReembolso", "rows", "3", "maxlength", "500", 3, "ngModelChange", "ngModel", "disabled"], ["for", "refund-external-id"], ["id", "refund-external-id", "name", "referenciaReembolso", "required", "", "maxlength", "100", "inputmode", "numeric", "pattern", "[0-9]+", 3, "ngModelChange", "ngModel", "disabled"], ["etiqueta", "Buscar reclamos", "placeholder", "Buscar por reclamo, reserva, publicaci\u00F3n, inquilino, anunciante o descripci\u00F3n", 1, "admin-filtros", 3, "lista"], [3, "verReembolso", "reclamo", "administracion", "mostrarVerReembolso", "actualizar"], ["etiqueta", "Mensaje para el inquilino y el anunciante", 3, "textoChange", "imagenesChange", "enviar", "texto", "imagenes", "adjuntos", "deshabilitado"], ["type", "button", 1, "button", "button--resolve-claim", 3, "disabled"], ["type", "button", 1, "button", "button--resolve-claim", 3, "click", "disabled"], [1, "claim-form"], [1, "claim-form", 3, "ngSubmit"], ["name", "resolucionReclamo", 3, "ngModelChange", "ngModel", "disabled"], ["name", "observacionReclamo", "rows", "3", "maxlength", "500", "required", "", "aria-describedby", "motivo-resolucion-ayuda", 3, "ngModelChange", "ngModel", "disabled"], ["id", "motivo-resolucion-ayuda", 1, "refund-help"], ["type", "submit", 1, "button", "button--light", 3, "disabled"], ["value", "REINICIAR_CODIGO"], ["value", "CONFIRMAR_INGRESO"], ["value", "DEVOLUCION_PARCIAL"], ["value", "DEVOLUCION_TOTAL"], ["value", "SIN_DEVOLUCION"], ["type", "number", "name", "importeReclamo", "min", "0.01", "step", "0.01", "required", "", 3, "ngModelChange", "ngModel", "disabled"], ["etiqueta", "reclamos", "ariaLabel", "Paginaci\u00F3n de reclamos", 1, "admin-paginador", 3, "paginaCambia", "pagina", "paginas", "total"], ["etiqueta", "Buscar solicitudes de verificaci\u00F3n", "placeholder", "Buscar por nombre, email, CUIT/CUIL, raz\u00F3n social o solicitud", 1, "admin-filtros", 3, "lista"], [1, "requests"], ["tabindex", "-1", 1, "request", 3, "id"], ["etiqueta", "solicitudes", "ariaLabel", "Paginaci\u00F3n de solicitudes de verificaci\u00F3n", 1, "admin-paginador", 3, "pagina", "paginas", "total"], [1, "request__identity"], [1, "avatar"], [1, "documents"], ["target", "_blank", "rel", "noopener", 1, "document-preview", 3, "href"], ["target", "_blank", "rel", "noopener", 3, "href"], [1, "reject-box"], ["type", "checkbox", 3, "change", "checked"], ["alt", "Vista previa DNI frente", 3, "src"], ["alt", "Vista previa DNI dorso", 3, "src"], ["muted", "", 3, "src"], ["alt", "Vista previa del rostro", 3, "src"], [3, "for"], ["maxlength", "500", "placeholder", "Explic\u00E1 qu\u00E9 documentaci\u00F3n debe corregir", 3, "ngModelChange", "id", "ngModel"], ["type", "button", 1, "button", "button--danger", 3, "click", "disabled"], ["type", "checkbox", 3, "ngModelChange", "ngModel"], ["lucideX", "", 3, "size"], ["etiqueta", "solicitudes", "ariaLabel", "Paginaci\u00F3n de solicitudes de verificaci\u00F3n", 1, "admin-paginador", 3, "paginaCambia", "pagina", "paginas", "total"], ["colspan", "5", 1, "empty"], ["data-label", "Usuario"], ["data-label", "Contacto"], ["data-label", "Rol"], ["data-label", "Estado"], ["data-label", "Acciones", 1, "right"], ["type", "button", 1, "link-button", 3, "disabled"], [1, "status", "status--deleted"], ["type", "button", 1, "link-button", 3, "click", "disabled"], ["etiqueta", "Buscar bloqueos actuales", "placeholder", "Buscar por nombre, email, motivo o administrador", 1, "admin-filtros", 3, "lista"], [1, "blocked-users"], ["tabindex", "-1", 1, "blocked-user", 3, "id"], ["etiqueta", "bloqueos", "ariaLabel", "Paginaci\u00F3n de bloqueos actuales", 1, "admin-paginador", 3, "pagina", "paginas", "total"], [1, "blocked-user__header"], [1, "blocked-user__avatar"], ["lucideUserRound", "", "aria-hidden", "true", 3, "size"], [1, "blocked-user__identity"], [1, "blocked-user__status"], ["type", "button", 1, "blocked-user__unblock", 3, "click", "disabled"], [1, "blocked-user__details"], [1, "blocked-user__notice"], ["titulo", "Apelaci\u00F3n del bloqueo", 1, "blocked-user__conversation", 3, "permitirAmpliar", "mensajes"], ["etiqueta", "Respuesta de Administraci\u00F3n", 3, "textoChange", "imagenesChange", "enviar", "texto", "imagenes", "adjuntos", "textoObligatorio", "limite", "deshabilitado"], ["etiqueta", "bloqueos", "ariaLabel", "Paginaci\u00F3n de bloqueos actuales", 1, "admin-paginador", 3, "paginaCambia", "pagina", "paginas", "total"], ["etiqueta", "Buscar en el historial de bloqueos", "placeholder", "Buscar por nombre, email, motivo o administrador", 1, "admin-filtros", 3, "lista"], [1, "blocked-user"], ["etiqueta", "bloqueos", "ariaLabel", "Paginaci\u00F3n del historial de bloqueos", 1, "admin-paginador", 3, "pagina", "paginas", "total"], [1, "blocked-user__status", "blocked-user__status--closed"], [1, "blocked-user__history-date"], ["etiqueta", "bloqueos", "ariaLabel", "Paginaci\u00F3n del historial de bloqueos", 1, "admin-paginador", 3, "paginaCambia", "pagina", "paginas", "total"], [1, "commission-current"], ["aria-hidden", "true", 1, "commission-current__icon"], ["viewBox", "0 0 24 24", "fill", "none", "stroke", "currentColor", "stroke-width", "1.8", "stroke-linecap", "round", "stroke-linejoin", "round"], ["d", "m12 2 10 5-10 5L2 7l10-5Z"], ["d", "m2 12 10 5 10-5M2 17l10 5 10-5"], [1, "commission-form", 3, "ngSubmit"], ["aria-hidden", "true", 1, "commission-form__icon"], [1, "commission-info"], ["aria-hidden", "true"], ["for", "comision-depa"], [1, "commission-input"], ["id", "comision-depa", "type", "number", "name", "comision", "min", "0", "max", "100", "step", "0.01", "required", "", 3, "ngModelChange", "ngModel"], ["type", "submit", 1, "commission-save"], ["viewBox", "0 0 24 24", "fill", "none", "stroke", "currentColor", "stroke-width", "1.8", "stroke-linecap", "round", "stroke-linejoin", "round", "aria-hidden", "true"], ["d", "M4 3h14l3 3v15H3V3h1Z"], ["d", "M7 3v6h10V3M7 21v-8h10v8"], ["type", "button", 1, "location-name", 3, "click"]], template: function AdminComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "section", 6)(1, "aside", 7)(2, "a", 8);
            i0.ɵɵelement(3, "img", 9);
            i0.ɵɵelementStart(4, "span");
            i0.ɵɵtext(5, "Alquileres");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(6, "nav", 10)(7, "button", 11);
            i0.ɵɵlistener("click", function AdminComponent_Template_button_click_7_listener() { return ctx.openSection("resumen"); });
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(8, "svg", 12);
            i0.ɵɵtext(9, " Resumen ");
            i0.ɵɵelementEnd();
            i0.ɵɵrepeaterCreate(10, AdminComponent_For_11_Template, 5, 1, "div", 13, _forTrack0);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(12, "label", 14);
            i0.ɵɵtext(13, " Secci\u00F3n ");
            i0.ɵɵelementStart(14, "select", 15);
            i0.ɵɵlistener("ngModelChange", function AdminComponent_Template_select_ngModelChange_14_listener($event) { return ctx.openSection($event); });
            i0.ɵɵelementStart(15, "option", 16);
            i0.ɵɵtext(16, "Resumen");
            i0.ɵɵelementEnd();
            i0.ɵɵrepeaterCreate(17, AdminComponent_For_18_Template, 3, 1, "optgroup", 17, _forTrack0);
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(19, "div", 18)(20, "div", 19)(21, "p");
            i0.ɵɵtext(22, "Panel admin / ");
            i0.ɵɵelementStart(23, "strong");
            i0.ɵɵtext(24);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(25, "span");
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(26, "svg", 20);
            i0.ɵɵtext(27, " Administrador");
            i0.ɵɵelementEnd()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(28, "div", 21)(29, "header", 22)(30, "div")(31, "h1", 23);
            i0.ɵɵtext(32);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(33, "p", 24);
            i0.ɵɵtext(34);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(35, "button", 25);
            i0.ɵɵlistener("click", function AdminComponent_Template_button_click_35_listener() { return ctx.reload(); });
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(36, "svg", 26);
            i0.ɵɵtext(37, " Actualizar ");
            i0.ɵɵelementEnd()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(38, "dialog", 27, 0);
            i0.ɵɵlistener("cancel", function AdminComponent_Template_dialog_cancel_38_listener($event) { return ctx.cerrarBloqueo($event); });
            i0.ɵɵelementStart(40, "form", 28);
            i0.ɵɵlistener("ngSubmit", function AdminComponent_Template_form_ngSubmit_40_listener() { return ctx.confirmarBloqueo(); });
            i0.ɵɵelementStart(41, "header", 29)(42, "span", 30);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(43, "svg", 31);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(44, "div", 32)(45, "h2", 33);
            i0.ɵɵtext(46, "Bloquear usuario");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(47, "p");
            i0.ɵɵtext(48);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(49, "div", 34)(50, "span", 35);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(51, "svg", 36);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(52, "p");
            i0.ɵɵtext(53, "El usuario ver\u00E1 este motivo al intentar iniciar sesi\u00F3n y podr\u00E1 apelar el bloqueo.");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(54, "div", 37)(55, "span", 35);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(56, "svg", 38);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(57, "p");
            i0.ɵɵtext(58, "Si tiene operaciones pendientes, solo podr\u00E1 entrar para resolverlas y apelar. Al terminarlas, se aplicar\u00E1 el bloqueo total.");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(59, "label", 39);
            i0.ɵɵtext(60, "Motivo del bloqueo");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(61, "textarea", 40);
            i0.ɵɵtwoWayListener("ngModelChange", function AdminComponent_Template_textarea_ngModelChange_61_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.motivoBloqueo, $event) || (ctx.motivoBloqueo = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵconditionalCreate(62, AdminComponent_Conditional_62_Template, 2, 1, "p", 41);
            i0.ɵɵelementStart(63, "div", 42)(64, "button", 43);
            i0.ɵɵlistener("click", function AdminComponent_Template_button_click_64_listener() { return ctx.cerrarBloqueo(); });
            i0.ɵɵtext(65, "Cancelar");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(66, "button", 44);
            i0.ɵɵtext(67);
            i0.ɵɵelementEnd()()()();
            i0.ɵɵconditionalCreate(68, AdminComponent_Conditional_68_Template, 52, 17);
            i0.ɵɵelement(69, "app-cotizaciones-admin", 45)(70, "app-publicaciones-admin", 45);
            i0.ɵɵelementStart(71, "section", 46)(72, "div", 47)(73, "div")(74, "h2");
            i0.ɵɵtext(75, "Reservas por liquidar");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(76, "p");
            i0.ɵɵtext(77, "Registr\u00E1 el pago al anunciante de lo que no se le devolvi\u00F3 al inquilino, cuando la liquidaci\u00F3n est\u00E9 habilitada. Las devoluciones en curso se resuelven antes en Reembolsos.");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(78, "span", 48);
            i0.ɵɵtext(79);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(80, AdminComponent_Conditional_80_Template, 2, 0, "p", 49)(81, AdminComponent_Conditional_81_Template, 2, 0, "p", 49)(82, AdminComponent_Conditional_82_Template, 6, 3);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(83, "section", 46)(84, "div", 47)(85, "div")(86, "h2");
            i0.ɵɵtext(87, "Solicitudes de cancelaci\u00F3n");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(88, "p");
            i0.ɵɵtext(89, "Reservas pagadas antes del inicio que esperan decisi\u00F3n administrativa.");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(90, "span", 48);
            i0.ɵɵtext(91);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(92, AdminComponent_Conditional_92_Template, 2, 0, "p", 49)(93, AdminComponent_Conditional_93_Template, 6, 3);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(94, "section", 46)(95, "div", 47)(96, "div")(97, "h2");
            i0.ɵɵtext(98, "Reembolsos");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(99, "p");
            i0.ɵɵtext(100, "Devoluciones creadas por cancelaciones o reclamos.");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(101, "span", 48);
            i0.ɵɵtext(102);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(103, AdminComponent_Conditional_103_Template, 2, 1, "p", 50);
            i0.ɵɵconditionalCreate(104, AdminComponent_Conditional_104_Template, 2, 2, "p", 51);
            i0.ɵɵconditionalCreate(105, AdminComponent_Conditional_105_Template, 2, 0, "p", 49)(106, AdminComponent_Conditional_106_Template, 6, 3);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(107, "section", 46);
            i0.ɵɵconditionalCreate(108, AdminComponent_Conditional_108_Template, 2, 0, "p", 52)(109, AdminComponent_Conditional_109_Template, 4, 1)(110, AdminComponent_Conditional_110_Template, 2, 0, "p", 49)(111, AdminComponent_Conditional_111_Template, 9, 6);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(112, "dialog", 53, 1);
            i0.ɵɵlistener("cancel", function AdminComponent_Template_dialog_cancel_112_listener($event) { return ctx.cerrarResolucionLiquidacion($event); });
            i0.ɵɵelementStart(114, "form", 28);
            i0.ɵɵlistener("ngSubmit", function AdminComponent_Template_form_ngSubmit_114_listener() { return ctx.confirmarResolucionLiquidacion(); });
            i0.ɵɵconditionalCreate(115, AdminComponent_Conditional_115_Template, 17, 15);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(116, "dialog", 54, 2);
            i0.ɵɵlistener("cancel", function AdminComponent_Template_dialog_cancel_116_listener($event) { return ctx.cerrarPagoAnunciante($event); });
            i0.ɵɵelementStart(118, "form", 28);
            i0.ɵɵlistener("ngSubmit", function AdminComponent_Template_form_ngSubmit_118_listener() { return ctx.confirmarPagoAnunciante(); });
            i0.ɵɵelementStart(119, "div", 55)(120, "div", 56);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(121, "svg", 57);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(122, "div")(123, "h2", 58);
            i0.ɵɵtext(124, "Registrar pago al anunciante");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(125, AdminComponent_Conditional_125_Template, 2, 2, "p", 59);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(126, AdminComponent_Conditional_126_Template, 23, 11);
            i0.ɵɵelementStart(127, "p", 60);
            i0.ɵɵtext(128, "Transfer\u00ED el importe y adjunt\u00E1 el comprobante. El anunciante va a poder ver el comprobante, el n\u00FAmero de operaci\u00F3n y la observaci\u00F3n en su historial de pagos.");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(129, "app-carga-comprobante", 61);
            i0.ɵɵtwoWayListener("archivoChange", function AdminComponent_Template_app_carga_comprobante_archivoChange_129_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.comprobantePago, $event) || (ctx.comprobantePago = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(130, "label", 62);
            i0.ɵɵtext(131, "N\u00FAmero de operaci\u00F3n ");
            i0.ɵɵelementStart(132, "span", 63);
            i0.ɵɵtext(133, "(opcional)");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(134, "input", 64);
            i0.ɵɵtwoWayListener("ngModelChange", function AdminComponent_Template_input_ngModelChange_134_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.referenciaPagoAnunciante, $event) || (ctx.referenciaPagoAnunciante = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementStart(135, "label", 65);
            i0.ɵɵtext(136, "Observaci\u00F3n ");
            i0.ɵɵelementStart(137, "span", 63);
            i0.ɵɵtext(138, "(opcional)");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(139, "textarea", 66);
            i0.ɵɵtwoWayListener("ngModelChange", function AdminComponent_Template_textarea_ngModelChange_139_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.observacionPagoAnunciante, $event) || (ctx.observacionPagoAnunciante = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵconditionalCreate(140, AdminComponent_Conditional_140_Template, 2, 1, "p", 67);
            i0.ɵɵelementStart(141, "div", 42)(142, "button", 43);
            i0.ɵɵlistener("click", function AdminComponent_Template_button_click_142_listener() { return ctx.cerrarPagoAnunciante(); });
            i0.ɵɵtext(143, "Volver");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(144, "button", 68);
            i0.ɵɵtext(145);
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(146, "dialog", 69, 3);
            i0.ɵɵlistener("cancel", function AdminComponent_Template_dialog_cancel_146_listener($event) { return ctx.cerrarAprobacionCancelacion($event); });
            i0.ɵɵelementStart(148, "form", 28);
            i0.ɵɵlistener("ngSubmit", function AdminComponent_Template_form_ngSubmit_148_listener() { return ctx.confirmarAprobacionCancelacion(); });
            i0.ɵɵelementStart(149, "div", 56);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(150, "svg", 70);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(151, "h2", 71);
            i0.ɵɵtext(152, "Aprobar cancelaci\u00F3n");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(153, AdminComponent_Conditional_153_Template, 3, 3);
            i0.ɵɵelementStart(154, "label", 72);
            i0.ɵɵtext(155, "Observaci\u00F3n de la aprobaci\u00F3n ");
            i0.ɵɵelementStart(156, "span", 63);
            i0.ɵɵtext(157, "(opcional)");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(158, "textarea", 73);
            i0.ɵɵtwoWayListener("ngModelChange", function AdminComponent_Template_textarea_ngModelChange_158_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.observacionAprobacion, $event) || (ctx.observacionAprobacion = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementStart(159, "small", 74);
            i0.ɵɵtext(160, "Hasta 500 caracteres.");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(161, AdminComponent_Conditional_161_Template, 2, 1, "p", 75);
            i0.ɵɵelementStart(162, "div", 42)(163, "button", 43);
            i0.ɵɵlistener("click", function AdminComponent_Template_button_click_163_listener() { return ctx.cerrarAprobacionCancelacion(); });
            i0.ɵɵtext(164, "Volver");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(165, "button", 68);
            i0.ɵɵtext(166);
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(167, "dialog", 76, 4);
            i0.ɵɵlistener("cancel", function AdminComponent_Template_dialog_cancel_167_listener($event) { return ctx.cerrarReembolso($event); })("close", function AdminComponent_Template_dialog_close_167_listener() { return ctx.reembolsoSeleccionado.set(null); });
            i0.ɵɵconditionalCreate(169, AdminComponent_Conditional_169_Template, 70, 38, "form", 77);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(170, "section", 78)(171, "div", 47)(172, "div")(173, "h2");
            i0.ɵɵtext(174, "Reclamos de reservas");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(175, "p");
            i0.ɵɵtext(176, "Evidencia, mensajes con las partes y resoluci\u00F3n administrativa.");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(177, "span", 48);
            i0.ɵɵtext(178);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(179, AdminComponent_Conditional_179_Template, 2, 1, "p", 41);
            i0.ɵɵconditionalCreate(180, AdminComponent_Conditional_180_Template, 2, 1, "p", 49)(181, AdminComponent_Conditional_181_Template, 2, 2);
            i0.ɵɵelementStart(182, "div", 79);
            i0.ɵɵrepeaterCreate(183, AdminComponent_For_184_Template, 5, 8, "article", 80, _forTrack1, false, AdminComponent_ForEmpty_185_Template, 1, 1);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(186, AdminComponent_Conditional_186_Template, 1, 3, "app-paginador", 81);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(187, "section", 46)(188, "div", 47)(189, "div")(190, "h2");
            i0.ɵɵtext(191, "Solicitudes de verificaci\u00F3n");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(192, "p");
            i0.ɵɵtext(193, "Identidad y cuentas bancarias pendientes de revisi\u00F3n.");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(194, "span", 48);
            i0.ɵɵtext(195);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(196, AdminComponent_Conditional_196_Template, 2, 0, "p", 49)(197, AdminComponent_Conditional_197_Template, 2, 0, "p", 49)(198, AdminComponent_Conditional_198_Template, 6, 3);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(199, "section", 46)(200, "div", 82)(201, "div")(202, "h2");
            i0.ɵɵtext(203, "Usuarios");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(204, "p");
            i0.ɵɵtext(205, "Administr\u00E1 el acceso y los roles del sistema.");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(206, AdminComponent_Conditional_206_Template, 2, 1, "p");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(207, "label", 83);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(208, "svg", 84);
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(209, "input", 85);
            i0.ɵɵlistener("ngModelChange", function AdminComponent_Template_input_ngModelChange_209_listener($event) { return ctx.searchUsers($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(210, "div", 86)(211, "table", 87)(212, "thead")(213, "tr")(214, "th");
            i0.ɵɵtext(215, "Usuario");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(216, "th");
            i0.ɵɵtext(217, "Contacto");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(218, "th");
            i0.ɵɵtext(219, "Rol");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(220, "th");
            i0.ɵɵtext(221, "Estado");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(222, "th", 88);
            i0.ɵɵtext(223, "Acciones");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(224, "tbody");
            i0.ɵɵconditionalCreate(225, AdminComponent_Conditional_225_Template, 3, 0, "tr")(226, AdminComponent_Conditional_226_Template, 3, 1);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(227, "nav", 89)(228, "span", 90);
            i0.ɵɵtext(229);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(230, "div", 91)(231, "button", 43);
            i0.ɵɵlistener("click", function AdminComponent_Template_button_click_231_listener() { return ctx.loadUsers(ctx.usersPage() - 1); });
            i0.ɵɵtext(232, "Anterior");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(233, "button", 43);
            i0.ɵɵlistener("click", function AdminComponent_Template_button_click_233_listener() { return ctx.loadUsers(ctx.usersPage() + 1); });
            i0.ɵɵtext(234, "Siguiente");
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(235, "section", 92)(236, "div", 93)(237, "div")(238, "h2", 94);
            i0.ɵɵtext(239, "Usuarios bloqueados");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(240, "p");
            i0.ɵɵtext(241, "Consult\u00E1 los bloqueos vigentes y respond\u00E9 las apelaciones.");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(242, "nav", 95)(243, "button", 11);
            i0.ɵɵlistener("click", function AdminComponent_Template_button_click_243_listener() { return ctx.cambiarVistaBloqueos("actuales"); });
            i0.ɵɵtext(244, "Bloqueos actuales");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(245, "button", 11);
            i0.ɵɵlistener("click", function AdminComponent_Template_button_click_245_listener() { return ctx.cambiarVistaBloqueos("historial"); });
            i0.ɵɵtext(246, "Historial");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(247, AdminComponent_Conditional_247_Template, 3, 2)(248, AdminComponent_Conditional_248_Template, 3, 2);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(249, "section", 96);
            i0.ɵɵconditionalCreate(250, AdminComponent_Conditional_250_Template, 2, 0, "p", 90)(251, AdminComponent_Conditional_251_Template, 4, 1)(252, AdminComponent_Conditional_252_Template, 32, 2, "div", 97);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(253, "section", 98)(254, "div", 47)(255, "div")(256, "h2");
            i0.ɵɵtext(257, "Cat\u00E1logos");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(258, "p");
            i0.ɵɵtext(259, "Consulta de las opciones del sistema. Se cargan por seed o migraci\u00F3n.");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(260, "div", 99);
            i0.ɵɵrepeaterCreate(261, AdminComponent_For_262_Template, 7, 2, "article", 100, _forTrack2);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(263, "section", 98)(264, "div", 47)(265, "div")(266, "h2");
            i0.ɵɵtext(267, "Ubicaciones");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(268, "p");
            i0.ɵɵtext(269, "Consulta de provincias y ciudades cargadas por seed o migraci\u00F3n.");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(270, "div", 101)(271, "article", 100)(272, "h3");
            i0.ɵɵtext(273, "Provincias");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(274, "ul", 102);
            i0.ɵɵrepeaterCreate(275, AdminComponent_For_276_Template, 3, 3, "li", 103, _forTrack1, false, AdminComponent_ForEmpty_277_Template, 2, 0, "li", 104);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(278, "article", 100)(279, "h3");
            i0.ɵɵtext(280, "Ciudades");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(281, "ul", 102);
            i0.ɵɵrepeaterCreate(282, AdminComponent_For_283_Template, 3, 1, "li", null, _forTrack1, false, AdminComponent_ForEmpty_284_Template, 2, 1, "li", 104);
            i0.ɵɵelementEnd()()()()()()();
        } if (rf & 2) {
            let tmp_44_0;
            let tmp_47_0;
            let tmp_48_0;
            let tmp_63_0;
            let tmp_71_0;
            i0.ɵɵadvance(7);
            i0.ɵɵattribute("aria-current", ctx.activeSection() === "resumen" ? "page" : null);
            i0.ɵɵadvance();
            i0.ɵɵproperty("size", 19);
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.navigation());
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("ngModel", ctx.activeSection());
            i0.ɵɵcontrol();
            i0.ɵɵadvance(3);
            i0.ɵɵrepeater(ctx.navigation());
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate(ctx.sectionLabel());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("size", 18);
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(ctx.activeSection() === "resumen" ? "Panel de control" : ctx.sectionLabel());
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.sectionDescription());
            i0.ɵɵadvance();
            i0.ɵɵproperty("disabled", ctx.loading() || ctx.historialCargando());
            i0.ɵɵadvance();
            i0.ɵɵproperty("size", 17);
            i0.ɵɵadvance(7);
            i0.ɵɵproperty("size", 24);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate2("", ctx.usuarioPorBloquear()?.nombre, " ", ctx.usuarioPorBloquear()?.apellido);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("size", 20);
            i0.ɵɵadvance(5);
            i0.ɵɵproperty("size", 20);
            i0.ɵɵadvance(5);
            i0.ɵɵtwoWayProperty("ngModel", ctx.motivoBloqueo);
            i0.ɵɵcontrol();
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.bloqueoError() ? 62 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.bloqueando());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.bloqueando() || !ctx.motivoBloqueo.trim());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.bloqueando() ? "Bloqueando\u2026" : "Confirmar bloqueo", " ");
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.activeSection() === "resumen" ? 68 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("hidden", ctx.activeSection() !== "cotizaciones");
            i0.ɵɵadvance();
            i0.ɵɵproperty("hidden", ctx.activeSection() !== "publicaciones");
            i0.ɵɵadvance();
            i0.ɵɵproperty("hidden", ctx.activeSection() !== "liquidaciones");
            i0.ɵɵadvance(8);
            i0.ɵɵtextInterpolate(ctx.settlements().length);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.otherLoading() ? 80 : !ctx.settlements().length ? 81 : 82);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("hidden", ctx.activeSection() !== "cancelaciones");
            i0.ɵɵadvance(8);
            i0.ɵɵtextInterpolate(ctx.cancellations().length);
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.cancellations().length ? 92 : 93);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("hidden", ctx.activeSection() !== "reembolsos");
            i0.ɵɵadvance(8);
            i0.ɵɵtextInterpolate1("", ctx.conteoPendientes(), " pendientes");
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.conteoFallidos() > 0 ? 103 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.totalReembolsos() > ctx.refunds().length ? 104 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.refunds().length ? 105 : 106);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("hidden", ctx.activeSection() !== "historial-liquidaciones");
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.historialCargando() ? 108 : ctx.historialError() ? 109 : !ctx.historialLiquidaciones().length ? 110 : 111);
            i0.ɵɵadvance(6);
            i0.ɵɵattribute("aria-busy", ctx.resolucionCargando());
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_44_0 = ctx.resolucionLiquidacion()) ? 115 : -1, tmp_44_0);
            i0.ɵɵadvance(3);
            i0.ɵɵattribute("aria-busy", ctx.registrandoPagoAnunciante());
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("size", 26);
            i0.ɵɵadvance(4);
            i0.ɵɵconditional((tmp_47_0 = ctx.pagoAnuncianteSeleccionado()) ? 125 : -1, tmp_47_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_48_0 = ctx.pagoAnuncianteSeleccionado()) ? 126 : -1, tmp_48_0);
            i0.ɵɵadvance(3);
            i0.ɵɵtwoWayProperty("archivo", ctx.comprobantePago);
            i0.ɵɵproperty("deshabilitado", ctx.registrandoPagoAnunciante());
            i0.ɵɵadvance(5);
            i0.ɵɵtwoWayProperty("ngModel", ctx.referenciaPagoAnunciante);
            i0.ɵɵproperty("disabled", ctx.registrandoPagoAnunciante());
            i0.ɵɵcontrol();
            i0.ɵɵadvance(5);
            i0.ɵɵtwoWayProperty("ngModel", ctx.observacionPagoAnunciante);
            i0.ɵɵproperty("disabled", ctx.registrandoPagoAnunciante());
            i0.ɵɵcontrol();
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.errorPagoAnunciante() ? 140 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.registrandoPagoAnunciante());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.registrandoPagoAnunciante() || !ctx.cbuParaPago() || !ctx.comprobantePago());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.registrandoPagoAnunciante() ? "Registrando\u2026" : "Registrar pago", " ");
            i0.ɵɵadvance(3);
            i0.ɵɵattribute("aria-busy", ctx.aprobandoCancelacion());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("size", 26);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional((tmp_63_0 = ctx.solicitudPorAprobar()) ? 153 : -1, tmp_63_0);
            i0.ɵɵadvance(5);
            i0.ɵɵtwoWayProperty("ngModel", ctx.observacionAprobacion);
            i0.ɵɵproperty("disabled", ctx.aprobandoCancelacion());
            i0.ɵɵcontrol();
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.errorAprobacion() ? 161 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.aprobandoCancelacion());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.aprobandoCancelacion() || !ctx.solicitudPorAprobar()?.devolucion);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.aprobandoCancelacion() ? "Aprobando\u2026" : "Confirmar aprobaci\u00F3n", " ");
            i0.ɵɵadvance(3);
            i0.ɵɵconditional((tmp_71_0 = ctx.reembolsoSeleccionado()) ? 169 : -1, tmp_71_0);
            i0.ɵɵadvance();
            i0.ɵɵproperty("hidden", ctx.activeSection() !== "reclamos");
            i0.ɵɵadvance(8);
            i0.ɵɵtextInterpolate(ctx.claims().length);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.errorReclamos() ? 179 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.claims().length && !ctx.errorReclamos() ? 180 : ctx.claims().length ? 181 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵrepeater(ctx.listaReclamos.visibles());
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.listaReclamos.filtrados().length ? 186 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("hidden", ctx.activeSection() !== "verificaciones");
            i0.ɵɵadvance(8);
            i0.ɵɵtextInterpolate(ctx.requests().length);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.otherLoading() ? 196 : !ctx.requests().length ? 197 : 198);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("hidden", ctx.activeSection() !== "usuarios");
            i0.ɵɵadvance(7);
            i0.ɵɵconditional(!ctx.usersLoading() ? 206 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("size", 18);
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngModel", ctx.query());
            i0.ɵɵcontrol();
            i0.ɵɵadvance(16);
            i0.ɵɵconditional(ctx.usersLoading() ? 225 : 226);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate3("", ctx.usersTotal(), " usuarios \u00B7 P\u00E1gina ", ctx.usersPage(), " de ", ctx.usersPages());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.usersLoading() || ctx.busy() !== null || ctx.usersPage() <= 1);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.usersLoading() || ctx.busy() !== null || ctx.usersPage() >= ctx.usersPages());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("hidden", ctx.activeSection() !== "bloqueos");
            i0.ɵɵadvance(8);
            i0.ɵɵclassProp("active", ctx.vistaBloqueos() === "actuales");
            i0.ɵɵattribute("aria-pressed", ctx.vistaBloqueos() === "actuales");
            i0.ɵɵadvance(2);
            i0.ɵɵclassProp("active", ctx.vistaBloqueos() === "historial");
            i0.ɵɵattribute("aria-pressed", ctx.vistaBloqueos() === "historial");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.vistaBloqueos() === "actuales" ? 247 : 248);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("hidden", ctx.activeSection() !== "comision");
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.comisionCargando() ? 250 : ctx.comisionError() ? 251 : ctx.comisionActual !== null ? 252 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("hidden", ctx.activeSection() !== "catalogos");
            i0.ɵɵadvance(8);
            i0.ɵɵrepeater(ctx.catalogs());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("hidden", ctx.activeSection() !== "ubicaciones");
            i0.ɵɵadvance(12);
            i0.ɵɵrepeater(ctx.provinces());
            i0.ɵɵadvance(7);
            i0.ɵɵrepeater(ctx.cities());
        } }, dependencies: [CotizacionesAdminComponent,
            PublicacionesAdminComponent,
            ClaimHistoryComponent,
            ConversationComposerComponent,
            ConversationPanelComponent,
            ReembolsoChatComponent,
            CargaComprobanteComponent,
            VerComprobanteComponent,
            DesglosePagoComponent,
            DatoCopiableComponent,
            FiltrosListaComponent,
            PaginadorComponent,
            FormsModule, i1.ɵNgNoValidate, i1.NgSelectOption, i1.ɵNgSelectMultipleOption, i1.DefaultValueAccessor, i1.NumberValueAccessor, i1.CheckboxControlValueAccessor, i1.SelectControlValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.RequiredValidator, i1.MaxLengthValidator, i1.PatternValidator, i1.MinValidator, i1.MaxValidator, i1.NgModel, i1.NgForm, RouterLink,
            LucideUsers,
            LucideShieldCheck,
            LucideRefreshCw,
            LucideSearch,
            LucideCheck,
            LucideX,
            LucideLockKeyhole,
            LucideInfo,
            LucideLayers3,
            LucideCalendarX,
            LucideMessageCircle,
            LucideChevronRight,
            LucideHouse,
            LucideWallet,
            LucideUserRound,
            LucideCalendarDays,
            LucideClock3,
            LucideReceiptText,
            LucideCircleDollarSign,
            LucideGavel,
            CurrencyPipe,
            DatePipe], styles: ["@use '../../shared/components/claim-history/claim-form';\r\n@use './admin-shared';\r\n\r\n[_nghost-%COMP%] {\r\n  display: block;\r\n  background: #f4f6f8;\r\n  color: #102a3a;\r\n  min-height: calc(100dvh - 70px);\r\n}\r\n\r\n.block-dialog[_ngcontent-%COMP%] {\r\n  position: fixed;\r\n  inset: 0;\r\n  box-sizing: border-box;\r\n  width: min(520px, calc(100% - 32px));\r\n  max-height: calc(100dvh - 32px);\r\n  margin: auto;\r\n  padding: 24px;\r\n  border: 1px solid #dfe6ea;\r\n  border-radius: 14px;\r\n  background: #fff;\r\n  color: inherit;\r\n  box-shadow: 0 18px 45px rgb(15 23 42 / 25%);\r\n}\r\n.block-dialog[_ngcontent-%COMP%]::backdrop { background: rgb(16 42 58 / 55%); }\r\n.block-form[_ngcontent-%COMP%] { display: grid; gap: 12px; color: #172b4b; }\r\n.block-form[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%], .block-form[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], .blocked-user[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%], .blocked-user[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; }\r\n.block-form__header[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 14px; margin-bottom: 4px; }\r\n.block-form__icon[_ngcontent-%COMP%] { display: grid; flex: none; place-items: center; width: 46px; height: 46px; border-radius: 10px; background: #fff0e6; color: #f47720; }\r\n.block-form__title[_ngcontent-%COMP%] { min-width: 0; padding-left: 13px; border-left: 2px solid #f47720; }\r\n.block-form__title[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { color: #142743; font-size: 1.25rem; font-weight: 800; line-height: 1.2; }\r\n.block-form__title[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin-top: 4px; color: #49617d; font-size: .85rem; overflow-wrap: anywhere; }\r\n.block-form__notice[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 11px; padding: 10px 11px; border-radius: 9px; font-size: .85rem; line-height: 1.35; }\r\n.block-form__notice--info[_ngcontent-%COMP%] { background: #f0f4fa; }\r\n.block-form__notice--warning[_ngcontent-%COMP%] { background: #fff5ed; }\r\n.block-form__notice-icon[_ngcontent-%COMP%] { display: grid; flex: none; place-items: center; width: 34px; height: 34px; border-radius: 7px; }\r\n.block-form__notice--info[_ngcontent-%COMP%]   .block-form__notice-icon[_ngcontent-%COMP%] { background: #e0eaf8; color: #24538a; }\r\n.block-form__notice--warning[_ngcontent-%COMP%]   .block-form__notice-icon[_ngcontent-%COMP%] { background: #ffeadb; color: #f47720; }\r\n.block-form__notice[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { padding-left: 11px; border-left: 2px solid #a9c8ef; }\r\n.block-form__notice--warning[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { border-left-color: #ff9a55; }\r\n.block-form[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] { margin-top: 3px; font-weight: 700; font-size: .9rem; }\r\n.block-form[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] { box-sizing: border-box; width: 100%; min-height: 110px; padding: 10px 12px; border: 1px solid #d7e0e9; border-radius: 8px; color: #172b4b; font: inherit; font-size: .9rem; resize: vertical; }\r\n.block-form[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]::placeholder { color: #8a9aab; }\r\n.block-form[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]:focus-visible { outline: 2px solid #5686e4; outline-offset: 2px; }\r\n.block-actions[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }\r\n.block-actions[_ngcontent-%COMP%]   .button--ghost[_ngcontent-%COMP%] { background: #e9edf2; color: #253d5a; border: 1px solid transparent; }\r\n.block-actions[_ngcontent-%COMP%]   .button--danger-outline[_ngcontent-%COMP%] { background: #fff5f4; color: #b83232; border: 1px solid #ed9b96; }\r\n.cancellation-approval-dialog[_ngcontent-%COMP%] {\r\n  position: fixed;\r\n  inset: 0;\r\n  box-sizing: border-box;\r\n  padding: clamp(16px, 4vw, 24px);\r\n  box-shadow: 0 20px 48px #0f172a40;\r\n}\r\n.cancellation-approval-icon[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  place-items: center;\r\n  width: 48px;\r\n  height: 48px;\r\n  border-radius: 12px;\r\n  background: #e6f6ee;\r\n  color: #146c43;\r\n}\r\n.cancellation-approval-dialog[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { font-size: 1.35rem; font-weight: 700; }\r\n.cancellation-refund[_ngcontent-%COMP%] { color: #146c43; overflow-wrap: anywhere; }\r\n.cancellation-refund--summary[_ngcontent-%COMP%] { padding: 12px; border-radius: 8px; background: #e6f6ee; }\r\n.cancellation-refund--summary[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { display: block; margin-block: 4px; font-size: 1.25rem; }\r\n.cancellation-approval-dialog[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]:focus-visible { outline: 2px solid #146c43; outline-offset: 2px; }\r\n.advertiser-payment-dialog[_ngcontent-%COMP%] {\r\n  width: min(540px, calc(100% - 32px));\r\n  border-top: 4px solid var(--%NS%color-primary, #f47818);\r\n  color: #172b45;\r\n}\r\n.advertiser-payment__header[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 16px; margin-bottom: 4px; }\r\n.advertiser-payment__header[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%]:last-child { min-width: 0; padding-left: 16px; border-left: 1px solid #dce3e8; }\r\n.advertiser-payment__header[_ngcontent-%COMP%]   .cancellation-approval-icon[_ngcontent-%COMP%] { flex: none; }\r\n.advertiser-payment__header[_ngcontent-%COMP%]   .refund-meta[_ngcontent-%COMP%] { margin-top: 4px; font-size: .9rem; overflow-wrap: anywhere; }\r\n.advertiser-payment__summary[_ngcontent-%COMP%] { padding: 4px; border: 1px solid #dfe5e8; border-radius: 9px; background: #f4f6f8; }\r\n.advertiser-payment__row[_ngcontent-%COMP%] { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; padding: 8px 10px; }\r\n.advertiser-payment__row[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], .advertiser-payment__row[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%]:last-child { text-align: right; }\r\n.advertiser-payment__commission[_ngcontent-%COMP%] { padding: 8px 10px; border-top: 1px solid #e0e6e9; color: #52636c; font-size: .88rem; }\r\n.advertiser-payment__commission[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { color: #172b45; }\r\n.advertiser-payment__net[_ngcontent-%COMP%] { border-radius: 7px; background: #e1f3e7; color: #146c43; font-size: 1.05rem; }\r\n.advertiser-payment-dialog[_ngcontent-%COMP%]   .refund-help[_ngcontent-%COMP%] { padding-left: 12px; border-left: 3px solid var(--%NS%color-primary, #f47818); font-size: .88rem; line-height: 1.45; }\r\n.advertiser-payment__alert[_ngcontent-%COMP%] { padding: 10px 12px; border-radius: 8px; background: #ffeded; font-size: .9rem; font-weight: 650; }\r\n.advertiser-payment__net[_ngcontent-%COMP%]   app-dato-copiable[_ngcontent-%COMP%] { justify-content: flex-end; font-weight: 700; }\r\n\r\n.transfer-data[_ngcontent-%COMP%] { display: grid; gap: 6px; padding: 10px 12px; border: 1px solid #b7dcc5; border-radius: 8px; background: #f3faf6; }\r\n.transfer-data[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] { margin: 0; color: #146c43; font-size: .95rem; }\r\n.transfer-data[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; }\r\n.transfer-data__label[_ngcontent-%COMP%] { color: #52636c; font-size: .82rem; }\r\n.transfer-data__owner[_ngcontent-%COMP%] { color: #172b45; font-size: .88rem; overflow-wrap: anywhere; }\r\n.advertiser-payment-dialog[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] { margin-bottom: -7px; font-size: .9rem; }\r\n.advertiser-payment-dialog[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], .advertiser-payment-dialog[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] { box-sizing: border-box; width: 100%; padding: 10px 12px; border: 1px solid #cbd5dc; border-radius: 8px; background: #fff; color: #172b45; font: inherit; }\r\n.advertiser-payment-dialog[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus-visible, .advertiser-payment-dialog[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]:focus-visible { outline: 2px solid #146c43; outline-offset: 2px; }\r\n.advertiser-payment-dialog[_ngcontent-%COMP%]   .block-actions[_ngcontent-%COMP%] { margin-top: 4px; }\r\n@media (max-width: 480px) {\r\n  .advertiser-payment__header[_ngcontent-%COMP%] { align-items: flex-start; gap: 10px; }\r\n  .advertiser-payment__header[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%]:last-child { padding-left: 10px; }\r\n  .advertiser-payment-dialog[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { font-size: 1.15rem; }\r\n  .advertiser-payment__row[_ngcontent-%COMP%] { flex-wrap: wrap; }\r\n  .advertiser-payment-dialog[_ngcontent-%COMP%]   .block-actions[_ngcontent-%COMP%]   .button[_ngcontent-%COMP%] { flex: 1; }\r\n}\r\n.appeals-panel[_ngcontent-%COMP%] { color: #122441; }\r\n.appeals-panel__title[_ngcontent-%COMP%] { position: relative; padding-left: 32px; }\r\n.appeals-panel__title[_ngcontent-%COMP%]::before { position: absolute; left: 20px; top: 24px; width: 4px; height: 26px; border-radius: 4px; background: #ff8900; content: ''; }\r\n.appeals-tabs[_ngcontent-%COMP%] { display: flex; gap: 6px; padding: 12px 16px 0; }\r\n.appeals-tabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { padding: 9px 14px; border: 0; border-radius: 7px; background: #f1f4f9; color: #52617a; font: inherit; font-size: .84rem; font-weight: 700; cursor: pointer; }\r\n.appeals-tabs[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%] { background: #e7efff; color: #174ac4; }\r\n.appeals-tabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:focus-visible { outline: 2px solid #5276ff; outline-offset: 2px; }\r\n.blocked-users[_ngcontent-%COMP%] { display: grid; gap: 14px; padding: 16px; }\r\n.blocked-user[_ngcontent-%COMP%] { min-width: 0; overflow: hidden; border: 1px solid #d7e0ee; border-radius: 10px; background: #fff; }\r\n.blocked-user[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; overflow-wrap: anywhere; }\r\n.blocked-user__header[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 16px; padding: 14px 18px; background: #f3f6fb; }\r\n.blocked-user__avatar[_ngcontent-%COMP%] { display: grid; flex: none; place-items: center; width: 48px; height: 48px; border-radius: 50%; background: #ffe9dc; color: #153154; }\r\n.blocked-user__identity[_ngcontent-%COMP%] { min-width: 0; flex: 1; padding-left: 16px; border-left: 1px solid #c6d2e2; }\r\n.blocked-user__identity[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] { margin: 0; font-size: 1rem; line-height: 1.25; overflow-wrap: anywhere; }\r\n.blocked-user__identity[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin-top: 3px; font-size: .82rem; }\r\n.blocked-user__status[_ngcontent-%COMP%] { display: inline-flex; flex: none; align-items: center; gap: 6px; padding: 5px 10px; border: 1px solid #ffe0ba; border-radius: 99px; background: #fff3df; color: #ed7100; font-size: .78rem; font-weight: 700; }\r\n.blocked-user__status--closed[_ngcontent-%COMP%] { border-color: #cbe9d6; background: #eaf8ef; color: #28734b; }\r\n.blocked-user__history-date[_ngcontent-%COMP%] { margin: 0 18px 14px !important; color: #687991; font-size: .82rem; }\r\n.blocked-user__details[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0; padding: 18px; }\r\n.blocked-user__details[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 12px; min-width: 0; padding: 0 18px; }\r\n.blocked-user__details[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%]:first-child { padding-left: 0; }\r\n.blocked-user__details[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%]    + div[_ngcontent-%COMP%] { border-left: 1px solid #d6dfed; }\r\n.blocked-user__details[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { flex: none; color: #78889e; }\r\n.blocked-user__details[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { font-size: .88rem; white-space: pre-wrap; }\r\n.blocked-user__details[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { display: block; margin-bottom: 4px; color: #687991; font-size: .66rem; font-weight: 700; text-transform: uppercase; }\r\n.blocked-user__notice[_ngcontent-%COMP%] { margin: 0 18px !important; padding: 12px 0; border-top: 1px solid #e8edf4; color: #687991; font-size: .82rem; }\r\n.blocked-user__conversation[_ngcontent-%COMP%] { margin: 0 14px 14px; --%NS%conversation-height: 230px; }\r\n.blocked-user__unblock[_ngcontent-%COMP%] { flex: none; padding: 9px 12px; border: 1px solid #b9d8c7; border-radius: 8px; background: #edf9f1; color: #17683c; font: inherit; font-size: .82rem; font-weight: 700; cursor: pointer; }\r\n.blocked-user__unblock[_ngcontent-%COMP%]:hover:not(:disabled) { background: #dbf3e3; }\r\n.blocked-user__unblock[_ngcontent-%COMP%]:disabled { opacity: .55; cursor: default; }\r\n.blocked-user__unblock[_ngcontent-%COMP%]:focus-visible { outline: 2px solid #17683c; outline-offset: 2px; }\r\n@media (max-width: 620px) {\r\n  .blocked-user__header[_ngcontent-%COMP%] { flex-wrap: wrap; gap: 10px; }\r\n  .blocked-user__identity[_ngcontent-%COMP%] { padding-left: 10px; }\r\n  .blocked-user__status[_ngcontent-%COMP%] { margin-left: 58px; }\r\n  .blocked-user__details[_ngcontent-%COMP%] { grid-template-columns: 1fr; gap: 14px; }\r\n  .blocked-user__details[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] { padding: 0; }\r\n  .blocked-user__details[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%]    + div[_ngcontent-%COMP%] { border-left: 0; }\r\n}\r\n\r\n.management[_ngcontent-%COMP%] {\r\n  overflow: visible;\r\n}\r\n//[_ngcontent-%COMP%]   Se[_ngcontent-%COMP%]   mantiene[_ngcontent-%COMP%]   el[_ngcontent-%COMP%]   recorte[_ngcontent-%COMP%]   que[_ngcontent-%COMP%]   antes[_ngcontent-%COMP%]   aplicaba[_ngcontent-%COMP%]   .panel[_ngcontent-%COMP%]   por[_ngcontent-%COMP%]   orden[_ngcontent-%COMP%]   de[_ngcontent-%COMP%]   cascada.\r\n.panel.management[_ngcontent-%COMP%] {\r\n  overflow: hidden;\r\n}\r\n.catalog-grid[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  grid-template-columns: repeat(3, minmax(0, 1fr));\r\n  gap: 18px;\r\n  padding: 22px;\r\n}\r\n.location-grid[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  grid-template-columns: 1fr 1fr;\r\n  gap: 18px;\r\n  padding: 22px;\r\n}\r\n.catalog-card[_ngcontent-%COMP%] {\r\n  min-width: 0;\r\n  padding: 18px;\r\n  border: 1px solid #dfe6ea;\r\n  border-radius: 12px;\r\n  background: #fff;\r\n}\r\n.catalog-card[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\r\n  margin: 0 0 14px;\r\n  font-size: 1rem;\r\n}\r\n.button--primary[_ngcontent-%COMP%] {\r\n  background: #e14414;\r\n  color: white;\r\n}\r\n.crud-list[_ngcontent-%COMP%] {\r\n  max-height: 260px;\r\n  overflow: auto;\r\n  list-style: none;\r\n  margin: 0;\r\n  padding: 0;\r\n  border-top: 1px solid #edf0f2;\r\n}\r\n.crud-list[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  min-height: 45px;\r\n  padding: 8px 3px;\r\n  border-bottom: 1px solid #edf0f2;\r\n  font-size: 0.88rem;\r\n}\r\n.crud-list[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%]:first-child {\r\n  min-width: 0;\r\n  overflow-wrap: anywhere;\r\n}\r\n.location-name[_ngcontent-%COMP%] {\r\n  min-width: 0;\r\n  padding: 0;\r\n  overflow-wrap: anywhere;\r\n  border: 0;\r\n  background: transparent;\r\n  color: #102a3a;\r\n  font: inherit;\r\n  text-align: left;\r\n  cursor: pointer;\r\n}\r\n.crud-list[_ngcontent-%COMP%]   .selected[_ngcontent-%COMP%] {\r\n  margin: 0 -3px;\r\n  padding-inline: 8px;\r\n  border-radius: 7px;\r\n  background: #edf3ff;\r\n}\r\n.empty-row[_ngcontent-%COMP%] {\r\n  justify-content: center;\r\n  color: #71818a;\r\n}\r\n@media (max-width: 1000px) {\r\n  .catalog-grid[_ngcontent-%COMP%] {\r\n    grid-template-columns: repeat(2, minmax(0, 1fr));\r\n  }\r\n}\r\n@media (max-width: 700px) {\r\n  .catalog-grid[_ngcontent-%COMP%], \r\n   .location-grid[_ngcontent-%COMP%] {\r\n    grid-template-columns: 1fr;\r\n    padding: 14px;\r\n  }\r\n}\r\n.link-button[_ngcontent-%COMP%]:disabled {\r\n  opacity: 0.5;\r\n  cursor: wait;\r\n}\r\n.button--light[_ngcontent-%COMP%] {\r\n  background: white;\r\n  color: #102a3a;\r\n}\r\n.counter[_ngcontent-%COMP%] {\r\n  padding: 5px 11px;\r\n  border-radius: 99px;\r\n  color: #a12d0b;\r\n  background: #fff0e9;\r\n  font-weight: 800;\r\n}\r\n.requests[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\r\n  gap: 18px;\r\n  padding: 22px;\r\n}\r\n.request[_ngcontent-%COMP%] {\r\n  padding: 18px;\r\n  border: 1px solid #dfe6ea;\r\n  border-radius: 12px;\r\n}\r\n.request__identity[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 12px;\r\n}\r\n.avatar[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  place-items: center;\r\n  width: 42px;\r\n  height: 42px;\r\n  border-radius: 50%;\r\n  background: #fff0e9;\r\n  color: #d84011;\r\n  font-weight: 850;\r\n}\r\n.request[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\r\n  margin: 0;\r\n  font-size: 1rem;\r\n}\r\n.request[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\r\n  margin: 4px 0 0;\r\n  color: #71818a;\r\n  font-size: 0.85rem;\r\n}\r\ndl[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  grid-template-columns: 1fr 1fr;\r\n  gap: 8px;\r\n  margin: 18px 0;\r\n}\r\ndl[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] {\r\n  padding: 9px;\r\n  border-radius: 8px;\r\n  background: #f5f7f8;\r\n}\r\ndt[_ngcontent-%COMP%] {\r\n  color: #71818a;\r\n  font-size: 0.72rem;\r\n  text-transform: uppercase;\r\n}\r\ndd[_ngcontent-%COMP%] {\r\n  margin: 3px 0 0;\r\n  font-weight: 700;\r\n}\r\n.documents[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  flex-wrap: wrap;\r\n  gap: 8px;\r\n}\r\n.documents[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] {\r\n  padding: 7px 10px;\r\n  border-radius: 7px;\r\n  color: #124aa6;\r\n  background: #edf3ff;\r\n  font-size: 0.8rem;\r\n  font-weight: 700;\r\n  text-decoration: none;\r\n}\r\n.documents[_ngcontent-%COMP%]   .document-preview[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 7px;\r\n  padding: 4px 8px 4px 4px;\r\n}\r\n.document-preview[_ngcontent-%COMP%]   img[_ngcontent-%COMP%], \r\n.document-preview[_ngcontent-%COMP%]   video[_ngcontent-%COMP%] {\r\n  width: 54px;\r\n  height: 42px;\r\n  object-fit: cover;\r\n  border-radius: 5px;\r\n  background: #dfe6ea;\r\n}\r\n.actions[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  justify-content: end;\r\n  gap: 9px;\r\n  margin-top: 18px;\r\n}\r\n.settlement-history-caption[_ngcontent-%COMP%] {\r\n  text-align: left;\r\n}\r\n.settlement-history[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\r\n  vertical-align: top;\r\n  overflow-wrap: anywhere;\r\n}\r\n.settlement-history[_ngcontent-%COMP%] {\r\n  padding: 0 12px 12px;\r\n  color: #142441;\r\n}\r\n.settlement-history-caption[_ngcontent-%COMP%] {\r\n  padding: 20px 8px;\r\n  font-size: 1.05rem;\r\n  font-weight: 750;\r\n}\r\n.settlement-history__table[_ngcontent-%COMP%] { table-layout: fixed; }\r\n.settlement-history__table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\r\n  padding: 12px 10px;\r\n  background: #edf2f7;\r\n  color: #62738d;\r\n  font-size: .68rem;\r\n  letter-spacing: 0;\r\n}\r\n.settlement-history__table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]:first-child { width: 13%; border-radius: 8px 0 0 8px; }\r\n.settlement-history__table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]:nth-child(2) { width: 18%; }\r\n.settlement-history__table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]:nth-child(3) { width: 14%; }\r\n.settlement-history__table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]:nth-child(4) { width: 13%; }\r\n.settlement-history__table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]:nth-child(5) { width: 26%; }\r\n.settlement-history__table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]:last-child { width: 16%; border-radius: 0 8px 8px 0; }\r\n.settlement-history__table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] { padding: 16px 10px; font-size: .82rem; line-height: 1.35; }\r\n.settlement-history__table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:last-child   td[_ngcontent-%COMP%] { border-bottom: 0; }\r\n.settlement-history__date[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 7px; white-space: nowrap; }\r\n.settlement-history__date[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { flex: none; color: #8295ae; }\r\n.settlement-history__time[_ngcontent-%COMP%] { margin-top: 5px; color: #74849a; }\r\n.settlement-history__reservation[_ngcontent-%COMP%] { display: inline-block; padding: 3px 8px; border-radius: 6px; background: #fff0e3; color: #f17800; font-size: .9rem; font-weight: 750; }\r\n.settlement-history__publication[_ngcontent-%COMP%] { display: block; margin-top: 5px; }\r\n.settlement-history__amount[_ngcontent-%COMP%] { font-weight: 750; white-space: nowrap; }\r\n.settlement-history[_ngcontent-%COMP%]   .settlement-note[_ngcontent-%COMP%] { margin: 5px 0 0; padding: 6px 9px; background: #fff2df; white-space: pre-wrap; }\r\n@media (max-width: 800px) {\r\n  .settlement-history__table[_ngcontent-%COMP%], .settlement-history__table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%], .settlement-history__table[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%], .settlement-history__table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] { display: block; width: 100%; }\r\n  .settlement-history__table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%] { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }\r\n  .settlement-history__table[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%] { padding: 14px 8px; border-bottom: 1px solid #edf0f2; }\r\n  .settlement-history__table[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:last-child { border-bottom: 0; }\r\n  .settlement-history__table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] { padding: 6px 0; border: 0; }\r\n  .settlement-history__table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]::before { content: attr(data-label); display: block; margin-bottom: 4px; color: #62738d; font-size: .68rem; font-weight: 700; text-transform: uppercase; }\r\n}\r\n.link-button[_ngcontent-%COMP%] {\r\n  border: 0;\r\n  background: transparent;\r\n  color: #b12d19;\r\n  font-weight: 750;\r\n  cursor: pointer;\r\n}\r\n\r\n@media (max-width: 700px) {\r\n  .responsive-table[_ngcontent-%COMP%]   .link-button[_ngcontent-%COMP%] { min-height: 44px; padding-inline: 12px; }\r\n  .request[_ngcontent-%COMP%], .settlement-card[_ngcontent-%COMP%], .catalog-card[_ngcontent-%COMP%] { overflow-wrap: anywhere; }\r\n  .requests[_ngcontent-%COMP%] { grid-template-columns: minmax(0, 1fr); }\r\n}\r\n//[_ngcontent-%COMP%]   Barra[_ngcontent-%COMP%]   de[_ngcontent-%COMP%]   b\u00FAsqueda[_ngcontent-%COMP%]   y[_ngcontent-%COMP%]   filtros[_ngcontent-%COMP%], y[_ngcontent-%COMP%]   paginador[_ngcontent-%COMP%]   de[_ngcontent-%COMP%]   cada[_ngcontent-%COMP%]   lista.\r\n.admin-filtros[_ngcontent-%COMP%] { padding: 18px 24px 0; }\r\n.admin-paginador[_ngcontent-%COMP%] { display: block; padding: 0 24px 24px; }\r\n@media (max-width: 700px) {\r\n  .admin-filtros[_ngcontent-%COMP%] { padding: 14px 14px 0; }\r\n  .admin-paginador[_ngcontent-%COMP%] { padding: 0 14px 14px; }\r\n}\r\n.settlement-list[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  gap: 14px;\r\n  padding: 20px 24px 24px;\r\n}\r\n.refund-action[_ngcontent-%COMP%] {\r\n  margin: 0 24px;\r\n  padding: 10px 14px;\r\n  border-radius: 9px;\r\n  color: #9e2020;\r\n  background: #ffeded;\r\n  font-size: 0.88rem;\r\n  font-weight: 700;\r\n}\r\n.refund-note[_ngcontent-%COMP%] {\r\n  margin: 0 24px;\r\n  color: #71818a;\r\n  font-size: 0.85rem;\r\n}\r\n.settlement-card[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: 20px;\r\n  padding: 18px;\r\n  border: 1px solid #e3e9ec;\r\n  border-radius: 10px;\r\n  background: #fff;\r\n}\r\n.settlement-card[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] { margin: 10px 0 7px; }\r\n.settlement-card[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 4px 0; color: #52636c; }\r\n.settlement-card[_ngcontent-%COMP%]   .actions[_ngcontent-%COMP%] { display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }\r\n.settlement-payment-unavailable[_ngcontent-%COMP%] { position: relative; display: inline-flex; cursor: not-allowed; }\r\n.settlement-payment-unavailable[_ngcontent-%COMP%]    > button[_ngcontent-%COMP%]:disabled { pointer-events: none; cursor: not-allowed; }\r\n.settlement-payment-unavailable[_ngcontent-%COMP%]:focus-visible { outline: 2px solid var(--%NS%color-secondary); outline-offset: 3px; border-radius: 9px; }\r\n.settlement-payment-unavailable__tooltip[_ngcontent-%COMP%] { position: absolute; z-index: 2; right: 0; bottom: calc(100% + 8px); width: max-content; max-width: min(280px, 75vw); padding: 9px 12px; border-radius: 8px; background: #172b45; color: #fff; font-size: .8rem; line-height: 1.4; text-align: left; box-shadow: 0 4px 12px #102a3a33; visibility: hidden; opacity: 0; pointer-events: none; }\r\n.settlement-payment-unavailable[_ngcontent-%COMP%]:hover   .settlement-payment-unavailable__tooltip[_ngcontent-%COMP%], .settlement-payment-unavailable[_ngcontent-%COMP%]:focus   .settlement-payment-unavailable__tooltip[_ngcontent-%COMP%] { visibility: visible; opacity: 1; }\r\n.claim-card[_ngcontent-%COMP%] {\r\n  border-color: #dce4ef;\r\n  color: #101d36;\r\n}\r\n.claim-card[_ngcontent-%COMP%]    > .actions[_ngcontent-%COMP%] { margin-top: 0; }\r\n.claim-card[_ngcontent-%COMP%]   .button--ghost[_ngcontent-%COMP%] { border: 1px solid #10233f; color: #10233f; }\r\n.button--resolve-claim[_ngcontent-%COMP%] { background: #081b38; color: #fff; }\r\n.settlement-note[_ngcontent-%COMP%] { max-width: 700px; padding: 9px 11px; border-radius: 7px; background: #fff7e8; }.alert[_ngcontent-%COMP%] {\r\n  margin: 18px 0;\r\n  padding: 12px 16px;\r\n  border-radius: 9px;\r\n}\r\n.alert--error[_ngcontent-%COMP%] {\r\n  color: #9e2020;\r\n  background: #ffeded;\r\n}\r\n@media (max-width: 700px) {\r\n  .requests[_ngcontent-%COMP%] {\r\n    grid-template-columns: 1fr;\r\n    padding: 14px;\r\n  }\r\n  .settlement-card[_ngcontent-%COMP%] { align-items: stretch; flex-direction: column; }\r\n  .settlement-card[_ngcontent-%COMP%]   .actions[_ngcontent-%COMP%] { justify-content: stretch; }\r\n  .settlement-card[_ngcontent-%COMP%]   .actions[_ngcontent-%COMP%]   .button[_ngcontent-%COMP%] { flex: 1; }\r\n  .settlement-payment-unavailable[_ngcontent-%COMP%] { flex: 1; }\r\n}\r\n\r\n.refund-dialog[_ngcontent-%COMP%] { box-sizing: border-box; width: min(640px, calc(100% - 32px)); overflow-wrap: anywhere; }\r\n.refund-heading[_ngcontent-%COMP%] { display: flex; justify-content: space-between; align-items: flex-start; gap: .75rem; }\r\n.refund-meta[_ngcontent-%COMP%], .refund-data[_ngcontent-%COMP%]   dt[_ngcontent-%COMP%], .refund-help[_ngcontent-%COMP%] { color: #52636c; }\r\n.refund-amount[_ngcontent-%COMP%] { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; padding: .85rem; border-radius: 10px; background: #edf5f1; }\r\n.refund-amount__value[_ngcontent-%COMP%] { font-size: 1.25rem; font-weight: 700; }\r\n.refund-amount[_ngcontent-%COMP%]   .status[_ngcontent-%COMP%] { margin-left: auto; }\r\n\r\n.refund-dialog[_ngcontent-%COMP%]   .block-form[_ngcontent-%COMP%] { gap: 12px; }\r\n.refund-heading[_ngcontent-%COMP%]   .advertiser-payment__header[_ngcontent-%COMP%] { margin-bottom: 0; }\r\n.refund-help--accent[_ngcontent-%COMP%] { margin: 0; padding-left: 12px; border-left: 3px solid var(--%NS%color-primary, #f47818); font-size: .88rem; line-height: 1.45; }\r\n.refund-chat[_ngcontent-%COMP%] { border: 1px solid #dfe5e8; border-radius: 8px; padding: 0 12px; }\r\n.refund-chat[open][_ngcontent-%COMP%] { padding-bottom: 12px; }\r\n.refund-chat[_ngcontent-%COMP%]   summary[_ngcontent-%COMP%] { padding: 10px 0; color: #172b45; font-weight: 650; cursor: pointer; }\r\n.refund-dialog[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]   .muted[_ngcontent-%COMP%] { font-weight: 400; }\r\n.settlement-history__reference[_ngcontent-%COMP%] { margin: 4px 0 0; }\r\n.refund-data[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .65rem 1rem; margin: 0; }\r\n.refund-data[_ngcontent-%COMP%]   dt[_ngcontent-%COMP%] { font-size: .85rem; }\r\n.refund-data[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%] { margin: .2rem 0 0; font-weight: 650; }\r\n.refund-reason[_ngcontent-%COMP%] { grid-column: 1 / -1; padding: .75rem; border-radius: 8px; background: #f4f6f8; }\r\n.refund-reason[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%] { white-space: pre-wrap; }\r\n.refund-dialog[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], .refund-dialog[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] { box-sizing: border-box; width: 100%; padding: .65rem .75rem; border: 1px solid #9baab4; border-radius: 8px; font: inherit; }\r\n.refund-error[_ngcontent-%COMP%] { color: #a12525; }", ".admin[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  grid-template-columns: 246px minmax(0, 1fr);\r\n  max-width: 1640px;\r\n  margin: auto;\r\n  min-height: calc(100dvh - 70px);\r\n  background: var(--%NS%color-bg);\r\n}\r\n.admin-sidebar[_ngcontent-%COMP%] {\r\n  background: #fff;\r\n  border-inline-end: 1px solid var(--%NS%color-border);\r\n  padding: 24px 14px;\r\n}\r\n.admin-brand[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  gap: 3px;\r\n  justify-items: start;\r\n  padding: 0 12px 20px;\r\n  font-weight: 750;\r\n  font-size: 1.15rem;\r\n  color: inherit;\r\n  text-decoration: none;\r\n  border-radius: 8px;\r\n}\r\n.admin-brand[_ngcontent-%COMP%]:focus-visible { outline: 2px solid var(--%NS%color-primary); outline-offset: 4px; }\r\n.admin-brand[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] { width: 128px; height: auto; }\r\n.admin-nav[_ngcontent-%COMP%] { display: grid; gap: 10px; }\r\n.admin-nav-group[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  gap: 2px;\r\n  padding-top: 10px;\r\n  border-top: 1px solid var(--%NS%color-border);\r\n}\r\n.admin-nav-group[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\r\n  margin: 0;\r\n  padding: 0 12px 4px;\r\n  color: var(--%NS%color-text-muted);\r\n  font-size: .82rem;\r\n  font-weight: 750;\r\n}\r\n.admin-nav[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  gap: 10px;\r\n  align-items: center;\r\n  min-height: 40px;\r\n  padding: 8px 12px;\r\n  border-radius: 8px;\r\n  text-align: start;\r\n  cursor: pointer;\r\n}\r\n.admin-nav[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover { background: var(--%NS%color-bg); }\r\n.admin-nav[_ngcontent-%COMP%]   button[aria-current][_ngcontent-%COMP%] {\r\n  background: var(--%NS%color-primary-light);\r\n  color: var(--%NS%color-primary-dark);\r\n  font-weight: 750;\r\n}\r\n.admin-section-picker[_ngcontent-%COMP%] { display: none; }\r\n.admin-workspace[_ngcontent-%COMP%] { min-width: 0; }\r\n.admin-topbar[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  justify-content: space-between;\r\n  align-items: center;\r\n  gap: 12px;\r\n  min-height: 58px;\r\n  padding: 10px clamp(16px, 2.5vw, 32px);\r\n  border-bottom: 1px solid var(--%NS%color-border);\r\n  background: #fff;\r\n  color: var(--%NS%color-text-muted);\r\n  font-size: .9rem;\r\n}\r\n.admin-topbar[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; }\r\n.admin-topbar[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { color: #102a3a; }\r\n.admin-topbar[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 8px; }\r\n.admin-content[_ngcontent-%COMP%] { padding: 28px clamp(16px, 2.5vw, 32px) 48px; }\r\n.admin[_ngcontent-%COMP%]   [hidden][_ngcontent-%COMP%] { display: none; }\r\n#admin-section-title[_ngcontent-%COMP%], .admin-module[_ngcontent-%COMP%]   article[id][_ngcontent-%COMP%] { scroll-margin-top: 88px; }\r\n.admin-module[_ngcontent-%COMP%]   article[id][_ngcontent-%COMP%]:focus { outline: 2px solid var(--%NS%color-secondary); outline-offset: 2px; }\r\n.admin[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:focus-visible, .admin-section-picker[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]:focus-visible {\r\n  outline: 2px solid var(--%NS%color-secondary);\r\n  outline-offset: 2px;\r\n}\r\n.admin__header[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  justify-content: space-between;\r\n  align-items: center;\r\n  gap: 16px;\r\n  margin-bottom: 20px;\r\n}\r\n.admin__header[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\r\n  margin: 0;\r\n  font-size: clamp(1.65rem, 3.2vw, 2.9rem);\r\n  font-weight: 800;\r\n  letter-spacing: -.035em;\r\n}\r\n\r\n.admin-section-description[_ngcontent-%COMP%] {\r\n  margin: 6px 0 0;\r\n  color: #526773;\r\n  line-height: 1.5;\r\n}\r\n\r\n.dashboard-button[_ngcontent-%COMP%] {\r\n  border: 1px solid var(--%NS%color-secondary);\r\n  background: #fff;\r\n  color: var(--%NS%color-secondary);\r\n}\r\n.dashboard-button[_ngcontent-%COMP%]:hover:not(:disabled) { background: var(--%NS%color-secondary-light); }\r\n.dashboard-metrics[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  grid-template-columns: repeat(4, minmax(0, 1fr));\r\n  gap: 14px;\r\n  margin: 20px 0;\r\n}\r\n.dashboard-metric[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: start;\r\n  gap: 12px;\r\n  padding: 18px;\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: 14px;\r\n  background: #fff;\r\n  color: var(--%NS%color-secondary);\r\n  text-align: start;\r\n  cursor: pointer;\r\n}\r\n.dashboard-metric[_ngcontent-%COMP%]:hover, .dashboard-shortcuts[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover { border-color: var(--%NS%color-secondary); }\r\n.dashboard-metric[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { flex-shrink: 0; }\r\n.dashboard-metric[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { color: #102a3a; font-weight: 700; line-height: 1.25; }\r\n.dashboard-metric[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { display: block; margin-top: 7px; font-size: 2rem; color: var(--%NS%color-secondary); }\r\n.metric-cancellation[_ngcontent-%COMP%], .metric-cancellation[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { color: var(--%NS%color-primary-dark); }\r\n.metric-refund[_ngcontent-%COMP%], .metric-refund[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { color: #9a5300; }\r\n.metric-settlement[_ngcontent-%COMP%], .metric-settlement[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { color: #146c43; }\r\n.metric-appeal[_ngcontent-%COMP%], .metric-appeal[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { color: #6b3fa0; }\r\n.dashboard-columns[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  grid-template-columns: minmax(0, 1.8fr) minmax(0, 1fr);\r\n  align-items: start;\r\n  gap: 16px;\r\n}\r\n.dashboard-card[_ngcontent-%COMP%] {\r\n  min-width: 0;\r\n  padding: 18px;\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: 14px;\r\n  background: #fff;\r\n}\r\n.dashboard-card[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 0 0 14px; font-size: 1.25rem; font-weight: 800; }\r\n.dashboard-card[_ngcontent-%COMP%]    > p[_ngcontent-%COMP%] { margin: 0; color: var(--%NS%color-text-muted); }\r\n.dashboard-table[_ngcontent-%COMP%] { overflow-x: auto; }\r\n.dashboard-table[_ngcontent-%COMP%]   :is(th[_ngcontent-%COMP%], td[_ngcontent-%COMP%]) { padding: 9px 10px; white-space: nowrap; }\r\n.dashboard-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:last-child   td[_ngcontent-%COMP%] { border-bottom: 0; }\r\n.dashboard-table[_ngcontent-%COMP%]   .button[_ngcontent-%COMP%] { padding: 6px 10px; }\r\n.dashboard-status[_ngcontent-%COMP%] {\r\n  display: inline-block;\r\n  padding: 4px 8px;\r\n  border-radius: 7px;\r\n  background: var(--%NS%color-primary-light);\r\n  color: var(--%NS%color-primary-dark);\r\n  font-size: .84rem;\r\n  font-weight: 750;\r\n}\r\n.dashboard-status[data-tone='review'][_ngcontent-%COMP%] { background: var(--%NS%color-secondary-light); color: var(--%NS%color-secondary-dark); }\r\n.dashboard-status[data-tone='refund'][_ngcontent-%COMP%] { background: #fff2da; color: #784200; }\r\n.dashboard-status[data-tone='payment'][_ngcontent-%COMP%] { background: #e6f6ee; color: #146c43; }\r\n.dashboard-status[data-tone='appeal'][_ngcontent-%COMP%] { background: #f1eafa; color: #5b3289; }\r\n.dashboard-more[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 12px; color: var(--%NS%color-text-muted); font-size: .88rem; }\r\n.dashboard-more[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { margin-right: auto; }\r\n.dashboard-shortcuts[_ngcontent-%COMP%] { display: grid; gap: 9px; }\r\n.dashboard-shortcuts[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin-bottom: 5px; }\r\n.dashboard-shortcuts[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  justify-content: space-between;\r\n  align-items: center;\r\n  gap: 12px;\r\n  min-height: 48px;\r\n  padding: 10px 12px;\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: 9px;\r\n  font-weight: 700;\r\n  text-align: start;\r\n  cursor: pointer;\r\n}\r\n.dashboard-shortcuts[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { flex-shrink: 0; color: var(--%NS%color-secondary); }\r\n\r\n@media (max-width: 1260px) {\r\n  .dashboard-columns[_ngcontent-%COMP%] { grid-template-columns: minmax(0, 1fr); }\r\n  .dashboard-metrics[_ngcontent-%COMP%] { grid-template-columns: repeat(2, minmax(0, 1fr)); }\r\n}\r\n@media (max-width: 900px) {\r\n  .admin[_ngcontent-%COMP%] { grid-template-columns: minmax(0, 1fr); }\r\n  .admin-sidebar[_ngcontent-%COMP%] {\r\n    display: flex;\r\n    justify-content: space-between;\r\n    align-items: center;\r\n    flex-wrap: wrap;\r\n    gap: 12px;\r\n    border-inline-end: 0;\r\n    border-bottom: 1px solid var(--%NS%color-border);\r\n    padding: 12px 16px;\r\n  }\r\n  .admin-brand[_ngcontent-%COMP%] { padding: 0; font-size: .9rem; }\r\n  .admin-brand[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] { width: 94px; }\r\n  .admin-nav[_ngcontent-%COMP%] { display: none; }\r\n  .admin-section-picker[_ngcontent-%COMP%] { display: grid; gap: 3px; font-size: .8rem; font-weight: 700; }\r\n  .admin-section-picker[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] { border: 1px solid var(--%NS%color-border); border-radius: 8px; padding: 7px; }\r\n}\r\n@media (max-width: 700px) {\r\n  .admin__header[_ngcontent-%COMP%] {\r\n    flex-wrap: wrap;\r\n  }\r\n  .dashboard-metric[_ngcontent-%COMP%] { gap: 7px; padding: 12px; flex-direction: column; }\r\n  .dashboard-metric[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { width: 22px; height: 22px; }\r\n  .dashboard-metric[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { overflow-wrap: anywhere; }\r\n}\r\n\r\n.commission-grid[_ngcontent-%COMP%] { display: grid; grid-template-columns: minmax(190px, 0.48fr) minmax(0, 1fr); gap: 24px; }\r\n.commission-current[_ngcontent-%COMP%], .commission-form[_ngcontent-%COMP%] { background: #fff; border: 1px solid #e7ebf0; border-radius: 12px; box-shadow: 0 5px 18px rgba(17, 39, 61, .07); }\r\n.commission-current[_ngcontent-%COMP%] { position: relative; min-height: 250px; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; color: #536373; font-weight: 600; }\r\n.commission-current[_ngcontent-%COMP%]::after { content: ''; position: absolute; height: 48px; left: -10%; right: -10%; bottom: -20px; border-radius: 50% 50% 0 0; background: #fff0e8; transform: rotate(-4deg); }\r\n.commission-current__icon[_ngcontent-%COMP%] { display: grid; place-items: center; width: 52px; height: 52px; margin-bottom: 14px; border-radius: 13px; color: #ed4b0b; background: #ffede4; }\r\n.commission-current__icon[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { width: 29px; height: 29px; }\r\n.commission-current[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { color: #08263f; font-size: clamp(38px, 4vw, 55px); line-height: 1.2; }\r\n.commission-form[_ngcontent-%COMP%] { padding: 24px; }\r\n.commission-form[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 14px; margin: 0 0 16px; font-size: 20px; color: #0b2840; }\r\n.commission-form__icon[_ngcontent-%COMP%] { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 8px; background: #e5f2ff; color: #1467b5; font-size: 19px; }\r\n.commission-info[_ngcontent-%COMP%] { display: flex; gap: 10px; margin: 0 0 20px; padding: 12px 15px; border-radius: 8px; background: #e8f3ff; color: #16538d; font-size: 14px; }\r\n.commission-info[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { color: #1775c7; font-weight: 700; }\r\n.commission-form[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] { display: block; margin-bottom: 7px; color: #445466; font-size: 14px; font-weight: 650; }\r\n.commission-input[_ngcontent-%COMP%] { display: flex; overflow: hidden; border: 1px solid #cbd4de; border-radius: 8px; }\r\n.commission-input[_ngcontent-%COMP%]:focus-within { outline: 2px solid #327bc1; outline-offset: 2px; }\r\n.commission-input[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] { min-width: 0; width: 100%; border: 0; outline: 0; padding: 10px 14px; color: #102d47; font: inherit; }\r\n.commission-input[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] { display: grid; place-items: center; min-width: 45px; background: #f1f3f5; color: #4e5c69; font-weight: 650; }\r\n.commission-save[_ngcontent-%COMP%] { display: inline-flex; align-items: center; gap: 10px; margin-top: 22px; padding: 12px 20px; border: 0; border-radius: 9px; background: #ee4a09; color: #fff; font: inherit; font-weight: 700; cursor: pointer; }\r\n.commission-save[_ngcontent-%COMP%]:hover { background: #d64106; }\r\n.commission-save[_ngcontent-%COMP%]:focus-visible { outline: 3px solid #1467b5; outline-offset: 3px; }\r\n.commission-save[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { width: 18px; height: 18px; }\r\n@media (max-width: 650px) { .commission-grid[_ngcontent-%COMP%] { grid-template-columns: 1fr; gap: 14px; } .commission-current[_ngcontent-%COMP%] { min-height: 185px; } .commission-form[_ngcontent-%COMP%] { padding: 20px; } }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AdminComponent, [{
        type: Component,
        args: [{ selector: 'app-admin', standalone: true, imports: [
                    CotizacionesAdminComponent,
                    PublicacionesAdminComponent,
                    ClaimHistoryComponent,
                    ConversationComposerComponent,
                    ConversationPanelComponent,
                    ReembolsoChatComponent,
                    CargaComprobanteComponent,
                    VerComprobanteComponent,
                    DesglosePagoComponent,
                    DatoCopiableComponent,
                    FiltrosListaComponent,
                    PaginadorComponent,
                    CurrencyPipe,
                    DatePipe,
                    FormsModule,
                    RouterLink,
                    LucideUsers,
                    LucideShieldCheck,
                    LucideRefreshCw,
                    LucideSearch,
                    LucideCheck,
                    LucideX,
                    LucideLockKeyhole,
                    LucideInfo,
                    LucideLayers3,
                    LucideCalendarX,
                    LucideMessageCircle,
                    LucideChevronRight,
                    LucideHouse,
                    LucideWallet,
                    LucideUserRound,
                    LucideCalendarDays,
                    LucideClock3,
                    LucideReceiptText,
                    LucideCircleDollarSign,
                    LucideGavel,
                ], template: "<section class=\"admin\" aria-label=\"Panel administrativo\">\r\n  <aside class=\"admin-sidebar\">\r\n    <!-- El logo lleva al inicio del sitio. -->\r\n    <a class=\"admin-brand\" routerLink=\"/\" title=\"Ir al inicio\"><img src=\"/images/Logo.png\" alt=\"DEPA\" /><span>Alquileres</span></a>\r\n    <nav class=\"admin-nav\" aria-label=\"Secciones del panel\">\r\n      <button type=\"button\" [attr.aria-current]=\"activeSection() === 'resumen' ? 'page' : null\" (click)=\"openSection('resumen')\">\r\n        <svg lucideHouse [size]=\"19\" aria-hidden=\"true\"></svg> Resumen\r\n      </button>\r\n      @for (group of navigation(); track group.label) {\r\n        <div class=\"admin-nav-group\">\r\n          <h2>{{ group.label }}</h2>\r\n          @for (item of group.items; track item.id) {\r\n            <button type=\"button\" [attr.aria-current]=\"activeSection() === item.id ? 'page' : null\" (click)=\"openSection(item.id)\">\r\n              {{ item.label }}\r\n            </button>\r\n          }\r\n        </div>\r\n      }\r\n    </nav>\r\n    <label class=\"admin-section-picker\">\r\n      Secci\u00F3n\r\n      <select [ngModel]=\"activeSection()\" (ngModelChange)=\"openSection($event)\">\r\n        <option value=\"resumen\">Resumen</option>\r\n        @for (group of navigation(); track group.label) {\r\n          <optgroup [label]=\"group.label\">\r\n            @for (item of group.items; track item.id) {\r\n              <option [value]=\"item.id\">{{ item.label }}</option>\r\n            }\r\n          </optgroup>\r\n        }\r\n      </select>\r\n    </label>\r\n  </aside>\r\n  <div class=\"admin-workspace\">\r\n    <div class=\"admin-topbar\">\r\n      <p>Panel admin / <strong>{{ sectionLabel() }}</strong></p>\r\n      <span><svg lucideUsers [size]=\"18\" aria-hidden=\"true\"></svg> Administrador</span>\r\n    </div>\r\n    <div class=\"admin-content\">\r\n      <header class=\"admin__header\">\r\n        <div>\r\n          <h1 id=\"admin-section-title\" tabindex=\"-1\">{{ activeSection() === 'resumen' ? 'Panel de control' : sectionLabel() }}</h1>\r\n          <p class=\"admin-section-description\">{{ sectionDescription() }}</p>\r\n        </div>\r\n        <button class=\"button dashboard-button\" type=\"button\" (click)=\"reload()\" [disabled]=\"loading() || historialCargando()\">\r\n          <svg lucideRefreshCw [size]=\"17\" aria-hidden=\"true\"></svg> Actualizar\r\n        </button>\r\n      </header>\r\n\r\n  <dialog #bloqueoDialog class=\"block-dialog\" aria-labelledby=\"block-dialog-title\" (cancel)=\"cerrarBloqueo($event)\">\r\n      <form class=\"block-form\" (ngSubmit)=\"confirmarBloqueo()\">\r\n        <header class=\"block-form__header\">\r\n          <span class=\"block-form__icon\" aria-hidden=\"true\"><svg lucideLockKeyhole [size]=\"24\"></svg></span>\r\n          <div class=\"block-form__title\">\r\n            <h2 id=\"block-dialog-title\">Bloquear usuario</h2>\r\n            <p>{{ usuarioPorBloquear()?.nombre }} {{ usuarioPorBloquear()?.apellido }}</p>\r\n          </div>\r\n        </header>\r\n        <div class=\"block-form__notice block-form__notice--info\">\r\n          <span class=\"block-form__notice-icon\" aria-hidden=\"true\"><svg lucideInfo [size]=\"20\"></svg></span>\r\n          <p>El usuario ver\u00E1 este motivo al intentar iniciar sesi\u00F3n y podr\u00E1 apelar el bloqueo.</p>\r\n        </div>\r\n        <div class=\"block-form__notice block-form__notice--warning\">\r\n          <span class=\"block-form__notice-icon\" aria-hidden=\"true\"><svg lucideLayers3 [size]=\"20\"></svg></span>\r\n          <p>Si tiene operaciones pendientes, solo podr\u00E1 entrar para resolverlas y apelar. Al terminarlas, se aplicar\u00E1 el bloqueo total.</p>\r\n        </div>\r\n        <label for=\"block-reason\">Motivo del bloqueo</label>\r\n        <textarea id=\"block-reason\" name=\"motivoBloqueo\" [(ngModel)]=\"motivoBloqueo\"\r\n          placeholder=\"Explic\u00E1 por qu\u00E9 se bloquea esta cuenta\" rows=\"5\" maxlength=\"500\" required autofocus></textarea>\r\n        @if (bloqueoError()) { <p class=\"alert alert--error\" role=\"alert\">{{ bloqueoError() }}</p> }\r\n        <div class=\"block-actions\">\r\n          <button type=\"button\" class=\"button button--ghost\" (click)=\"cerrarBloqueo()\" [disabled]=\"bloqueando()\">Cancelar</button>\r\n          <button type=\"submit\" class=\"button button--danger-outline\" [disabled]=\"bloqueando() || !motivoBloqueo.trim()\">\r\n            {{ bloqueando() ? 'Bloqueando\u2026' : 'Confirmar bloqueo' }}\r\n          </button>\r\n        </div>\r\n      </form>\r\n  </dialog>\r\n\r\n  @if (activeSection() === 'resumen') {\r\n    @if (summaryError()) {\r\n      <p class=\"alert alert--error\" role=\"alert\">No se pudieron actualizar todos los datos del resumen. Pod\u00E9s volver a intentar con Actualizar.</p>\r\n    }\r\n    <div class=\"dashboard-metrics\" [attr.aria-busy]=\"otherLoading()\">\r\n      @if (cancellations().length) {\r\n      <button type=\"button\" class=\"dashboard-metric metric-cancellation\" (click)=\"abrirDesdeContador('cancelaciones')\">\r\n        <svg lucideCalendarX [size]=\"29\" aria-hidden=\"true\"></svg>\r\n        <span>Cancelaciones pendientes<strong>{{ otherLoading() ? '\u2026' : cancellations().length }}</strong></span>\r\n      </button>\r\n      }\r\n      <button type=\"button\" class=\"dashboard-metric\" (click)=\"abrirDesdeContador('reclamos')\">\r\n        <svg lucideMessageCircle [size]=\"29\" aria-hidden=\"true\"></svg>\r\n        <span>Reclamos abiertos<strong>{{ otherLoading() ? '\u2026' : openClaims().length }}</strong></span>\r\n      </button>\r\n      <button type=\"button\" class=\"dashboard-metric metric-refund\" (click)=\"abrirDesdeContador('reembolsos')\">\r\n        <svg lucideWallet [size]=\"29\" aria-hidden=\"true\"></svg>\r\n        <span>Reembolsos pendientes<strong>{{ otherLoading() ? '\u2026' : conteoPendientes() }}</strong></span>\r\n      </button>\r\n      <button type=\"button\" class=\"dashboard-metric\" (click)=\"abrirDesdeContador('verificaciones')\">\r\n        <svg lucideShieldCheck [size]=\"29\" aria-hidden=\"true\"></svg>\r\n        <span>Verificaciones pendientes<strong>{{ otherLoading() ? '\u2026' : requests().length }}</strong></span>\r\n      </button>\r\n      <button type=\"button\" class=\"dashboard-metric metric-settlement\" (click)=\"abrirDesdeContador('liquidaciones')\">\r\n        <svg lucideCircleDollarSign [size]=\"29\" aria-hidden=\"true\"></svg>\r\n        <span>Liquidaciones a pagar<strong>{{ otherLoading() ? '\u2026' : liquidacionesAPagar().length }}</strong></span>\r\n      </button>\r\n      <button type=\"button\" class=\"dashboard-metric metric-appeal\" (click)=\"abrirDesdeContador('bloqueos')\">\r\n        <svg lucideGavel [size]=\"29\" aria-hidden=\"true\"></svg>\r\n        <span>Apelaciones a responder<strong>{{ bloqueadosCargando() ? '\u2026' : apelacionesAResponder().length }}</strong></span>\r\n      </button>\r\n    </div>\r\n    <div class=\"dashboard-columns\">\r\n      <section class=\"dashboard-card\">\r\n        <h2>Pendientes de atenci\u00F3n</h2>\r\n        @if (otherLoading()) {\r\n          <p role=\"status\">Cargando pendientes\u2026</p>\r\n        } @else if (pendingCases().length) {\r\n          <div class=\"dashboard-table\">\r\n            <table>\r\n              <thead><tr><th scope=\"col\">Caso</th><th scope=\"col\">Estado</th><th scope=\"col\">Acci\u00F3n</th></tr></thead>\r\n              <tbody>\r\n                @for (item of pendientesMostrados(); track item.section + '-' + item.id) {\r\n                  <tr>\r\n                    <td>{{ item.label }}</td>\r\n                    <td><span class=\"dashboard-status\" [attr.data-tone]=\"item.tone\">{{ item.status }}</span></td>\r\n                    <td><button type=\"button\" class=\"button dashboard-button\" [attr.aria-label]=\"item.action + ' ' + item.label\" (click)=\"openSection(item.section, item.id)\">{{ item.action }}</button></td>\r\n                  </tr>\r\n                }\r\n              </tbody>\r\n            </table>\r\n          </div>\r\n          @if (pendingCases().length > pendientesIniciales) {\r\n            <div class=\"dashboard-more\">\r\n              <span role=\"status\">Mostrando {{ pendientesMostrados().length }} de {{ pendingCases().length }}</span>\r\n              @if (pendingCases().length > pendientesVisibles()) {\r\n                <button type=\"button\" class=\"button dashboard-button\" (click)=\"verMasPendientes()\">Ver m\u00E1s</button>\r\n              }\r\n              @if (pendientesVisibles() > pendientesIniciales) {\r\n                <button type=\"button\" class=\"button dashboard-button\" (click)=\"verMenosPendientes()\">Ver menos</button>\r\n              }\r\n            </div>\r\n          }\r\n        } @else {\r\n          <p>{{ summaryError() ? 'No hay casos disponibles para mostrar.' : 'No hay pendientes de atenci\u00F3n.' }}</p>\r\n        }\r\n      </section>\r\n      <section class=\"dashboard-card dashboard-shortcuts\">\r\n        <h2>Accesos r\u00E1pidos</h2>\r\n        <button type=\"button\" (click)=\"openSection('publicaciones')\">Gestionar publicaciones <svg lucideChevronRight [size]=\"18\" aria-hidden=\"true\"></svg></button>\r\n        <button type=\"button\" (click)=\"openSection('bloqueos')\">Revisar apelaciones <svg lucideChevronRight [size]=\"18\" aria-hidden=\"true\"></svg></button>\r\n        <button type=\"button\" (click)=\"openSection('cotizaciones')\">Actualizar cotizaci\u00F3n <svg lucideChevronRight [size]=\"18\" aria-hidden=\"true\"></svg></button>\r\n      </section>\r\n    </div>\r\n  }\r\n\r\n  <app-cotizaciones-admin [hidden]=\"activeSection() !== 'cotizaciones'\" />\r\n\r\n  <app-publicaciones-admin [hidden]=\"activeSection() !== 'publicaciones'\" />\r\n\r\n  <section class=\"panel admin-module\" [hidden]=\"activeSection() !== 'liquidaciones'\">\r\n    <div class=\"panel__title\">\r\n      <div>\r\n        <h2>Reservas por liquidar</h2>\r\n        <p>Registr\u00E1 el pago al anunciante de lo que no se le devolvi\u00F3 al inquilino, cuando la liquidaci\u00F3n est\u00E9 habilitada. Las devoluciones en curso se resuelven antes en Reembolsos.</p>\r\n      </div>\r\n      <span class=\"counter\">{{ settlements().length }}</span>\r\n    </div>\r\n    @if (otherLoading()) {\r\n      <p class=\"empty\">Cargando liquidaciones\u2026</p>\r\n    } @else if (!settlements().length) {\r\n      <p class=\"empty\">No hay liquidaciones ni reclamos pendientes.</p>\r\n    } @else {\r\n      <app-filtros-lista class=\"admin-filtros\" [lista]=\"listaLiquidaciones\" etiqueta=\"Buscar liquidaciones\"\r\n        placeholder=\"Buscar por reserva, publicaci\u00F3n, inquilino o anunciante\" />\r\n      <div class=\"settlement-list\">\r\n        @for (settlement of listaLiquidaciones.visibles(); track settlement.id) {\r\n          <article class=\"settlement-card\" [id]=\"'admin-liquidaciones-' + settlement.id\" tabindex=\"-1\">\r\n            <div>\r\n              <span class=\"status\" [class.status--blocked]=\"settlement.estado_liquidacion === 'EN_REVISION'\">\r\n                {{ etiquetaLiquidacion(settlement) }}\r\n              </span>\r\n              @if (settlement.estado_liquidacion !== 'EN_REVISION') {\r\n                @let dias = diasEsperaLiquidacion(settlement);\r\n                @if (dias === null) {\r\n                  <p class=\"settlement-note\">Fecha de habilitaci\u00F3n pendiente de revisi\u00F3n.</p>\r\n                } @else if (dias > 0) {\r\n                  <p class=\"settlement-note\">Lapso de espera \u00B7 {{ dias === 1 ? 'Falta 1 d\u00EDa' : 'Faltan ' + dias + ' d\u00EDas' }} para habilitar el pago.</p>\r\n                }\r\n              }\r\n              <h3>Reserva #{{ settlement.id }} \u00B7 {{ settlement.publicacion?.titulo ?? 'Publicaci\u00F3n eliminada' }}</h3>\r\n              <p><strong>Inquilino:</strong> {{ nombreInquilino(settlement) }}</p>\r\n              <p><strong>Anunciante:</strong> {{ settlement.publicacion?.anunciante?.usuario?.nombre }} {{ settlement.publicacion?.anunciante?.usuario?.apellido }}</p>\r\n              @if (tieneDevolucion(settlement)) {\r\n                <p><strong>Pag\u00F3 el inquilino:</strong> {{ montoPagado(settlement) }}</p>\r\n              }\r\n              <p><strong>A liquidar al anunciante:</strong> {{ montoLiquidacion(settlement) }}</p>\r\n              <p><strong>Comisi\u00F3n DEPA:</strong> @if (settlement.porcentaje_comision_depa == null) { Sin comisi\u00F3n asignada (reserva anterior) } @else { {{ settlement.porcentaje_comision_depa }} % \u00B7 {{ settlement.importe_comision_depa | currency:'ARS':'symbol':'1.2-2' }} }</p>\r\n              <p><strong>Neto al anunciante:</strong> {{ settlement.importe_neto_anunciante | currency:'ARS':'symbol':'1.2-2' }}</p>\r\n              @if (settlement.cotizacion_dolar; as dolar) {\r\n                <p>Precio original: {{ settlement.moneda_origen }} {{ settlement.importe_origen }} \u00B7 D\u00F3lar blue venta: ARS {{ dolar.venta }} por USD.</p>\r\n                <p>Cotizaci\u00F3n #{{ dolar.id }} \u00B7 {{ dolar.proveedor }} \u00B7 Publicada: {{ dolar.actualizada_fuente_en }} \u00B7 Aceptada: {{ settlement.cotizacion_aceptada_en }}.</p>\r\n              }\r\n              @if (settlement.observacion_liquidacion) {\r\n                <p class=\"settlement-note\">{{ settlement.observacion_liquidacion }}</p>\r\n              }\r\n            </div>\r\n            <div class=\"actions\">\r\n              <a class=\"button button--ghost\" [routerLink]=\"['/admin/reservas', settlement.id]\" [queryParams]=\"{ desde: 'liquidaciones' }\">Ver reserva</a>\r\n              @if (settlement.estado_liquidacion === 'EN_REVISION') {\r\n                <button type=\"button\" class=\"button button--ghost\" (click)=\"abrirResolucionLiquidacion(settlement, false)\">Cerrar revisi\u00F3n del pago</button>\r\n              }\r\n              <button type=\"button\" class=\"button button--danger-outline\" (click)=\"abrirResolucionLiquidacion(settlement, true)\">Devolver al inquilino</button>\r\n              @if (pendienteParaAnunciante(settlement)) {\r\n                @let diasPago = diasEsperaLiquidacion(settlement);\r\n                @if (settlement.habilitada_para_pago) {\r\n                  <button type=\"button\" class=\"button button--success\" (click)=\"abrirPagoAnunciante(settlement)\">Registrar pago al anunciante</button>\r\n                } @else {\r\n                  <span class=\"settlement-payment-unavailable\" tabindex=\"0\" [attr.aria-describedby]=\"'payment-wait-' + settlement.id\">\r\n                    <button type=\"button\" class=\"button button--success\" disabled>Registrar pago al anunciante</button>\r\n                    <span class=\"settlement-payment-unavailable__tooltip\" role=\"tooltip\" [id]=\"'payment-wait-' + settlement.id\">\r\n                      @if (diasPago === null) {\r\n                        No se puede registrar el pago: la fecha de habilitaci\u00F3n est\u00E1 pendiente de revisi\u00F3n.\r\n                      } @else {\r\n                        No se puede registrar el pago todav\u00EDa. {{ diasPago === 1 ? 'Falta 1 d\u00EDa' : 'Faltan ' + diasPago + ' d\u00EDas' }} para habilitarlo.\r\n                      }\r\n                    </span>\r\n                  </span>\r\n                }\r\n              }\r\n            </div>\r\n          </article>\r\n        } @empty {\r\n          <p class=\"empty\">No hay liquidaciones que coincidan. <button type=\"button\" class=\"link-button\" (click)=\"listaLiquidaciones.limpiar()\">Limpiar filtros</button></p>\r\n        }\r\n      </div>\r\n      @if (listaLiquidaciones.filtrados().length) {\r\n        <app-paginador class=\"admin-paginador\" [pagina]=\"listaLiquidaciones.pagina()\" [paginas]=\"listaLiquidaciones.paginas()\"\r\n          [total]=\"listaLiquidaciones.filtrados().length\" etiqueta=\"liquidaciones\" ariaLabel=\"Paginaci\u00F3n de liquidaciones\"\r\n          (paginaCambia)=\"listaLiquidaciones.irAPagina($event)\" />\r\n      }\r\n    }\r\n  </section>\r\n\r\n  <section class=\"panel admin-module\" [hidden]=\"activeSection() !== 'cancelaciones'\">\r\n    <div class=\"panel__title\">\r\n      <div>\r\n        <h2>Solicitudes de cancelaci\u00F3n</h2>\r\n        <p>Reservas pagadas antes del inicio que esperan decisi\u00F3n administrativa.</p>\r\n      </div>\r\n      <span class=\"counter\">{{ cancellations().length }}</span>\r\n    </div>\r\n    @if (!cancellations().length) {\r\n      <p class=\"empty\">No hay solicitudes pendientes.</p>\r\n    } @else {\r\n      <app-filtros-lista class=\"admin-filtros\" [lista]=\"listaCancelaciones\" etiqueta=\"Buscar solicitudes de cancelaci\u00F3n\"\r\n        placeholder=\"Buscar por solicitud, reserva, inquilino, publicaci\u00F3n o motivo\" />\r\n      <div class=\"settlement-list\">\r\n        @for (solicitud of listaCancelaciones.visibles(); track solicitud.id) {\r\n          <article class=\"settlement-card\" [id]=\"'admin-cancelaciones-' + solicitud.id\" tabindex=\"-1\">\r\n            <div>\r\n              <span class=\"status status--blocked\">Pendiente</span>\r\n              <h3>Solicitud #{{ solicitud.id }} \u00B7 Reserva #{{ solicitud.reserva?.id ?? '\u2014' }}</h3>\r\n              <p><strong>Inquilino:</strong> {{ solicitud.reserva?.usuario?.nombre }} {{ solicitud.reserva?.usuario?.apellido }}</p>\r\n              <p><strong>Publicaci\u00F3n:</strong> {{ solicitud.reserva?.publicacion?.titulo ?? '\u2014' }}</p>\r\n              <p><strong>Fechas:</strong> {{ solicitud.reserva?.fecha_inicio }} \u2014 {{ solicitud.reserva?.fecha_fin }}</p>\r\n              <p><strong>Total de la reserva:</strong> {{ solicitud.reserva?.monto_pago | currency: (solicitud.reserva?.moneda_contratada ?? 'ARS') }}</p>\r\n              @if (solicitud.devolucion; as devolucion) {\r\n                <p class=\"cancellation-refund\"><strong>Monto a devolver al inquilino:</strong> {{ devolucion.importe | currency: devolucion.moneda : 'code' : '1.2-2' }} ({{ devolucion.porcentaje }} %)</p>\r\n                @if (devolucion.porcentaje === 0) { <p class=\"settlement-note\">La cancelaci\u00F3n se aprobar\u00E1 sin devoluci\u00F3n.</p> }\r\n              } @else {\r\n                <p class=\"refund-error\">No se puede calcular la devoluci\u00F3n: falta el pago registrado.</p>\r\n              }\r\n              <p class=\"settlement-note\">{{ solicitud.motivo }}</p>\r\n            </div>\r\n            <div class=\"actions\">\r\n              @if (solicitud.reserva?.id; as idReserva) {\r\n                <a class=\"button button--ghost\" [routerLink]=\"['/admin/reservas', idReserva]\" [queryParams]=\"{ desde: 'cancelaciones' }\">Ver reserva</a>\r\n              }\r\n              <button type=\"button\" class=\"button button--success\" [disabled]=\"!solicitud.devolucion || busy() === 'cancellation-' + solicitud.id\" (click)=\"abrirAprobacionCancelacion(solicitud)\">Aprobar</button>\r\n              <button type=\"button\" class=\"button button--danger-outline\" [disabled]=\"busy() === 'cancellation-' + solicitud.id\" (click)=\"rechazarCancelacion(solicitud)\">Rechazar</button>\r\n            </div>\r\n          </article>\r\n        } @empty {\r\n          <p class=\"empty\">No hay solicitudes que coincidan. <button type=\"button\" class=\"link-button\" (click)=\"listaCancelaciones.limpiar()\">Limpiar filtros</button></p>\r\n        }\r\n      </div>\r\n      @if (listaCancelaciones.filtrados().length) {\r\n        <app-paginador class=\"admin-paginador\" [pagina]=\"listaCancelaciones.pagina()\" [paginas]=\"listaCancelaciones.paginas()\"\r\n          [total]=\"listaCancelaciones.filtrados().length\" etiqueta=\"solicitudes\" ariaLabel=\"Paginaci\u00F3n de solicitudes de cancelaci\u00F3n\"\r\n          (paginaCambia)=\"listaCancelaciones.irAPagina($event)\" />\r\n      }\r\n    }\r\n  </section>\r\n\r\n  <section class=\"panel admin-module\" [hidden]=\"activeSection() !== 'reembolsos'\">\r\n    <div class=\"panel__title\">\r\n      <div>\r\n        <h2>Reembolsos</h2>\r\n        <p>Devoluciones creadas por cancelaciones o reclamos.</p>\r\n      </div>\r\n      <span class=\"counter\">{{ conteoPendientes() }} pendientes</span>\r\n    </div>\r\n    @if (conteoFallidos() > 0) {\r\n      <p class=\"refund-action\" role=\"alert\">Hay {{ conteoFallidos() }} reembolso(s) fallido(s) que requieren acci\u00F3n manual.</p>\r\n    }\r\n    @if (totalReembolsos() > refunds().length) {\r\n      <p class=\"refund-note\" role=\"status\">Mostrando los \u00FAltimos {{ refunds().length }} de {{ totalReembolsos() }}.</p>\r\n    }\r\n    @if (!refunds().length) {\r\n      <p class=\"empty\">No hay reembolsos registrados.</p>\r\n    } @else {\r\n      <app-filtros-lista class=\"admin-filtros\" [lista]=\"listaReembolsos\" etiqueta=\"Buscar reembolsos\"\r\n        placeholder=\"Buscar por reembolso, reserva, publicaci\u00F3n, inquilino, motivo u operaci\u00F3n\" />\r\n      <div class=\"settlement-list\">\r\n        @for (reembolso of listaReembolsos.visibles(); track reembolso.id) {\r\n          <article class=\"settlement-card\" [id]=\"'admin-reembolsos-' + reembolso.id\" tabindex=\"-1\">\r\n            <div>\r\n              <span class=\"status\" [class.status--blocked]=\"reembolso.estado === 'PENDIENTE' || reembolso.estado === 'FALLIDO'\">\r\n                {{ reembolso.referencia_externa?.startsWith('SIMULADO:tarjeta:') ? 'Simulado' : estadosReembolso[reembolso.estado] }}\r\n              </span>\r\n              <h3>Reembolso #{{ reembolso.id }} \u00B7 Reserva #{{ reembolso.reserva?.id ?? '\u2014' }}</h3>\r\n              <p><strong>{{ reembolso.tipo }}</strong> \u00B7 {{ reembolso.importe | currency: reembolso.moneda }}</p>\r\n              <p class=\"muted\">{{ origenesReembolso[reembolso.origen] || reembolso.origen }} \u00B7 {{ reembolso.motivo }}</p>\r\n              @if (reembolso.creado_en) {\r\n                <p class=\"muted\">Creado el <time [attr.datetime]=\"reembolso.creado_en\">{{ reembolso.creado_en | date:'dd/MM/yyyy HH:mm':'-0300' }}</time></p>\r\n              }\r\n              @if (puedeRegistrarTransferencia(reembolso)) {\r\n                <p>Transferencia bancaria pendiente \u00B7 Chat disponible</p>\r\n              }\r\n            </div>\r\n            <div class=\"actions\">\r\n              @if (reembolso.reserva?.id; as idReserva) {\r\n                <a class=\"button button--ghost\" [routerLink]=\"['/admin/reservas', idReserva]\" [queryParams]=\"{ desde: 'reembolsos' }\">Ver reserva</a>\r\n              }\r\n              <button type=\"button\" class=\"button button--ghost\" (click)=\"abrirReembolso(reembolso)\">\r\n                {{ puedeRegistrarTransferencia(reembolso) ? 'Ver detalle y chat' : 'Ver detalle' }}\r\n              </button>\r\n            </div>\r\n          </article>\r\n        } @empty {\r\n          <p class=\"empty\">No hay reembolsos que coincidan. <button type=\"button\" class=\"link-button\" (click)=\"listaReembolsos.limpiar()\">Limpiar filtros</button></p>\r\n        }\r\n      </div>\r\n      @if (listaReembolsos.filtrados().length) {\r\n        <app-paginador class=\"admin-paginador\" [pagina]=\"listaReembolsos.pagina()\" [paginas]=\"listaReembolsos.paginas()\"\r\n          [total]=\"listaReembolsos.filtrados().length\" etiqueta=\"reembolsos\" ariaLabel=\"Paginaci\u00F3n de reembolsos\"\r\n          (paginaCambia)=\"listaReembolsos.irAPagina($event)\" />\r\n      }\r\n    }\r\n  </section>\r\n\r\n  <section class=\"panel admin-module\" [hidden]=\"activeSection() !== 'historial-liquidaciones'\">\r\n    @if (historialCargando()) {\r\n      <p class=\"empty\" role=\"status\">Cargando historial de liquidaciones.</p>\r\n    } @else if (historialError()) {\r\n      <p class=\"refund-error\" role=\"alert\">{{ historialError() }}</p>\r\n      <button type=\"button\" class=\"button button--ghost\" (click)=\"cargarHistorialLiquidaciones()\">Reintentar</button>\r\n    } @else if (!historialLiquidaciones().length) {\r\n      <p class=\"empty\">Todav\u00EDa no hay pagos a anunciantes registrados.</p>\r\n    } @else {\r\n      <app-filtros-lista class=\"admin-filtros\" [lista]=\"listaHistorialLiquidaciones\" etiqueta=\"Buscar pagos registrados\"\r\n        placeholder=\"Buscar por reserva, publicaci\u00F3n, anunciante, operaci\u00F3n o administrador\">\r\n        <label class=\"filtros-lista__filtro\">Desde\r\n          <input type=\"date\" [value]=\"historialDesde()\" [max]=\"historialHasta() || null\"\r\n            (change)=\"filtrarHistorialLiquidaciones('desde', $any($event.target).value)\" />\r\n        </label>\r\n        <label class=\"filtros-lista__filtro\">Hasta\r\n          <input type=\"date\" [value]=\"historialHasta()\" [min]=\"historialDesde() || null\"\r\n            (change)=\"filtrarHistorialLiquidaciones('hasta', $any($event.target).value)\" />\r\n        </label>\r\n      </app-filtros-lista>\r\n      @if (!listaHistorialLiquidaciones.filtrados().length) {\r\n        <p class=\"empty\">No hay pagos que coincidan. <button type=\"button\" class=\"link-button\" (click)=\"limpiarHistorialLiquidaciones()\">Limpiar filtros</button></p>\r\n      } @else {\r\n      <div class=\"table-wrap settlement-history\">\r\n        <table class=\"settlement-history__table\">\r\n          <caption class=\"settlement-history-caption\">Pagos registrados a anunciantes</caption>\r\n          <thead>\r\n            <tr><th scope=\"col\">Fecha de registro</th><th scope=\"col\">Reserva</th><th scope=\"col\">Anunciante</th><th scope=\"col\">Importe</th><th scope=\"col\">Comprobante y observaci\u00F3n</th><th scope=\"col\">Registrado por</th></tr>\r\n          </thead>\r\n          <tbody>\r\n            @for (pago of listaHistorialLiquidaciones.visibles(); track pago.id) {\r\n              <tr>\r\n                <td data-label=\"Fecha de registro\">\r\n                  @if (pago.fecha) {\r\n                    <span class=\"settlement-history__date\"><svg lucideCalendarDays [size]=\"16\" aria-hidden=\"true\"></svg>{{ pago.fecha | date:'dd/MM/yyyy':'-0300' }}</span>\r\n                    <span class=\"settlement-history__date settlement-history__time\"><svg lucideClock3 [size]=\"16\" aria-hidden=\"true\"></svg>{{ pago.fecha | date:'HH:mm':'-0300' }}</span>\r\n                  } @else { Sin fecha }\r\n                </td>\r\n                <td data-label=\"Reserva\"><a class=\"settlement-history__reservation\" [routerLink]=\"['/admin/reservas', pago.reservaId]\" [queryParams]=\"{ desde: 'historial-liquidaciones' }\" [attr.aria-label]=\"'Ver reserva #' + pago.reservaId\">#{{ pago.reservaId }}</a><span class=\"settlement-history__publication\">{{ pago.publicacion || 'Publicaci\u00F3n no disponible' }}</span></td>\r\n                <td data-label=\"Anunciante\">{{ pago.anunciante || 'Sin datos' }}</td>\r\n                <td data-label=\"Importe\" class=\"settlement-history__amount\">\r\n                  {{ pago.importe === null ? 'Sin importe' : importeConMoneda(pago.importe, pago.moneda) }}\r\n                  @if (pago.desglose; as desglose) { <app-desglose-pago [desglose]=\"desglose\" [moneda]=\"pago.moneda\" /> }\r\n                </td>\r\n                <td data-label=\"Comprobante y observaci\u00F3n\">\r\n                  @if (pago.comprobante) {\r\n                    <app-ver-comprobante [obtenerUrl]=\"urlComprobantePago(pago)\" [etiqueta]=\"'Ver ' + pago.comprobante\" />\r\n                  }\r\n                  <p class=\"settlement-history__reference\">{{ pago.referencia ? 'N.\u00BA de operaci\u00F3n: ' + pago.referencia : 'Sin n\u00FAmero de operaci\u00F3n' }}</p>\r\n                  @if (pago.observacion) { <p class=\"settlement-note\">{{ pago.observacion }}</p> }\r\n                </td>\r\n                <td data-label=\"Registrado por\">{{ pago.administrador || 'Sin datos' }}</td>\r\n              </tr>\r\n            }\r\n          </tbody>\r\n        </table>\r\n      </div>\r\n      <app-paginador class=\"admin-paginador\" [pagina]=\"listaHistorialLiquidaciones.pagina()\" [paginas]=\"listaHistorialLiquidaciones.paginas()\"\r\n        [total]=\"listaHistorialLiquidaciones.filtrados().length\" etiqueta=\"pagos\" ariaLabel=\"Paginaci\u00F3n del historial de liquidaciones\"\r\n        (paginaCambia)=\"listaHistorialLiquidaciones.irAPagina($event)\" />\r\n      }\r\n    }\r\n  </section>\r\n\r\n  <dialog #dialogoResolucion class=\"block-dialog refund-dialog cancellation-approval-dialog\" aria-labelledby=\"settlement-decision-title\"\r\n    (cancel)=\"cerrarResolucionLiquidacion($event)\">\r\n    <form class=\"block-form\" (ngSubmit)=\"confirmarResolucionLiquidacion()\" [attr.aria-busy]=\"resolucionCargando()\">\r\n      @if (resolucionLiquidacion(); as decision) {\r\n        <h2 id=\"settlement-decision-title\">{{ decision.devolver ? 'Devolver el pago al inquilino' : 'Cerrar revisi\u00F3n del pago' }}</h2>\r\n        <p class=\"refund-meta\">Reserva #{{ decision.reserva.id }} \u00B7 {{ decision.reserva.publicacion?.titulo ?? 'Publicaci\u00F3n no disponible' }}</p>\r\n        <p class=\"refund-help\">\r\n          @if (decision.devolver) {\r\n            Lo que queda del pago ({{ montoLiquidacion(decision.reserva) }}) se derivar\u00E1 a Reembolsos para devolv\u00E9rselo\r\n            al inquilino seg\u00FAn el medio de pago. El anunciante no recibir\u00E1 ese importe.\r\n          } @else if (estadoAlCerrarRevision(decision.reserva) === 'PENDIENTE_PAGO_PROPIETARIO') {\r\n            La reserva quedar\u00E1 pendiente de pago al anunciante por {{ montoLiquidacion(decision.reserva) }}.\r\n          } @else {\r\n            El pago seguir\u00E1 retenido hasta que se valide el c\u00F3digo de alojamiento.\r\n          }\r\n        </p>\r\n        <label for=\"settlement-decision-note\">{{ decision.devolver ? 'Motivo de la devoluci\u00F3n' : 'Conclusi\u00F3n de la revisi\u00F3n' }}</label>\r\n        <textarea id=\"settlement-decision-note\" name=\"motivoResolucion\" [(ngModel)]=\"motivoResolucion\"\r\n          rows=\"4\" maxlength=\"500\" required [disabled]=\"resolucionCargando()\" autofocus></textarea>\r\n        @if (resolucionError()) { <p class=\"refund-error\" role=\"alert\">{{ resolucionError() }}</p> }\r\n        <div class=\"block-actions\">\r\n          <button type=\"button\" class=\"button button--ghost\" [disabled]=\"resolucionCargando()\" (click)=\"cerrarResolucionLiquidacion()\">Volver</button>\r\n          <button type=\"submit\" class=\"button\" [class.button--danger-outline]=\"decision.devolver\" [class.button--success]=\"!decision.devolver\"\r\n            [disabled]=\"resolucionCargando() || !motivoResolucion.trim()\">\r\n            {{ resolucionCargando() ? 'Guardando\u2026' : decision.devolver ? 'Pasar a Reembolsos' : 'Guardar conclusi\u00F3n' }}\r\n          </button>\r\n        </div>\r\n      }\r\n    </form>\r\n  </dialog>\r\n\r\n  <dialog #dialogoPagoAnunciante class=\"block-dialog refund-dialog cancellation-approval-dialog advertiser-payment-dialog\" aria-labelledby=\"advertiser-payment-title\"\r\n    (cancel)=\"cerrarPagoAnunciante($event)\">\r\n    <form class=\"block-form\" (ngSubmit)=\"confirmarPagoAnunciante()\" [attr.aria-busy]=\"registrandoPagoAnunciante()\">\r\n      <div class=\"advertiser-payment__header\">\r\n        <div class=\"cancellation-approval-icon\" aria-hidden=\"true\"><svg lucideWallet [size]=\"26\"></svg></div>\r\n        <div>\r\n          <h2 id=\"advertiser-payment-title\">Registrar pago al anunciante</h2>\r\n          @if (pagoAnuncianteSeleccionado(); as item) {\r\n            <p class=\"refund-meta\">Reserva #{{ item.id }} \u00B7 {{ item.publicacion?.titulo ?? 'Publicaci\u00F3n eliminada' }}</p>\r\n          }\r\n        </div>\r\n      </div>\r\n      @if (pagoAnuncianteSeleccionado(); as item) {\r\n        <div class=\"advertiser-payment__summary\">\r\n          <p class=\"advertiser-payment__row\"><strong>Importe a liquidar</strong><span>{{ montoLiquidacion(item) }}</span></p>\r\n          @if (tieneDevolucion(item)) {\r\n            <p class=\"refund-help\">El inquilino pag\u00F3 {{ montoPagado(item) }}; ya se le devolvi\u00F3 la diferencia.</p>\r\n          }\r\n          <p class=\"advertiser-payment__commission\"><strong>Comisi\u00F3n DEPA:</strong> @if (item.porcentaje_comision_depa == null) { Sin comisi\u00F3n asignada (reserva anterior) } @else { {{ item.porcentaje_comision_depa }} % \u00B7 {{ item.importe_comision_depa | currency:'ARS':'symbol':'1.2-2' }} }</p>\r\n          <div class=\"advertiser-payment__row advertiser-payment__net\">\r\n            <strong>Importe a transferir</strong>\r\n            <app-dato-copiable [valor]=\"(item.importe_neto_anunciante | currency:'ARS':'symbol':'1.2-2') ?? ''\"\r\n              [copia]=\"importeParaCopiar(item.importe_neto_anunciante)\" descripcion=\"importe a transferir\" />\r\n          </div>\r\n        </div>\r\n        <section class=\"transfer-data\" aria-labelledby=\"advertiser-transfer-title\">\r\n          <h3 id=\"advertiser-transfer-title\">Datos para transferir</h3>\r\n          @if (consultandoCbuParaPago()) {\r\n            <p role=\"status\">Consultando el CBU validado\u2026</p>\r\n          } @else if (cbuParaPago(); as cbu) {\r\n            <p class=\"transfer-data__label\">{{ tipoCuentaBancaria(cbu) }} validado</p>\r\n            <app-dato-copiable [valor]=\"formatearCbu(cbu)\" [copia]=\"cbu\" [descripcion]=\"tipoCuentaBancaria(cbu)\" [monoespaciado]=\"true\" />\r\n            <p class=\"transfer-data__owner\"><strong>Titular:</strong> {{ item.publicacion?.anunciante?.usuario?.nombre }} {{ item.publicacion?.anunciante?.usuario?.apellido }}@if (cuitParaPago(); as cuit) { \u00B7 CUIT/CUIL {{ formatearCuit(cuit) }} }</p>\r\n          } @else if (!errorPagoAnunciante()) {\r\n            <p class=\"refund-error advertiser-payment__alert\" role=\"alert\">El anunciante necesita un CBU validado para recibir el pago.</p>\r\n          }\r\n        </section>\r\n      }\r\n      <p class=\"refund-help\" id=\"advertiser-payment-help\">Transfer\u00ED el importe y adjunt\u00E1 el comprobante. El anunciante va a poder ver el comprobante, el n\u00FAmero de operaci\u00F3n y la observaci\u00F3n en su historial de pagos.</p>\r\n      <app-carga-comprobante [(archivo)]=\"comprobantePago\" [deshabilitado]=\"registrandoPagoAnunciante()\" />\r\n      <label for=\"advertiser-payment-reference\">N\u00FAmero de operaci\u00F3n <span class=\"muted\">(opcional)</span></label>\r\n      <input id=\"advertiser-payment-reference\" name=\"referenciaPagoAnunciante\" [(ngModel)]=\"referenciaPagoAnunciante\"\r\n        maxlength=\"150\" aria-describedby=\"advertiser-payment-help\" [disabled]=\"registrandoPagoAnunciante()\" />\r\n      <label for=\"advertiser-payment-note\">Observaci\u00F3n <span class=\"muted\">(opcional)</span></label>\r\n      <textarea id=\"advertiser-payment-note\" name=\"observacionPagoAnunciante\" [(ngModel)]=\"observacionPagoAnunciante\"\r\n        rows=\"3\" maxlength=\"500\" [disabled]=\"registrandoPagoAnunciante()\"></textarea>\r\n      @if (errorPagoAnunciante()) { <p class=\"refund-error advertiser-payment__alert\" role=\"alert\">{{ errorPagoAnunciante() }}</p> }\r\n      <div class=\"block-actions\">\r\n        <button type=\"button\" class=\"button button--ghost\" [disabled]=\"registrandoPagoAnunciante()\" (click)=\"cerrarPagoAnunciante()\">Volver</button>\r\n        <button type=\"submit\" class=\"button button--success\" [disabled]=\"registrandoPagoAnunciante() || !cbuParaPago() || !comprobantePago()\">\r\n          {{ registrandoPagoAnunciante() ? 'Registrando\u2026' : 'Registrar pago' }}\r\n        </button>\r\n      </div>\r\n    </form>\r\n  </dialog>\r\n\r\n  <dialog #dialogoAprobacion class=\"block-dialog cancellation-approval-dialog\" aria-labelledby=\"cancellation-approval-title\"\r\n    (cancel)=\"cerrarAprobacionCancelacion($event)\">\r\n    <form class=\"block-form\" (ngSubmit)=\"confirmarAprobacionCancelacion()\" [attr.aria-busy]=\"aprobandoCancelacion()\">\r\n      <div class=\"cancellation-approval-icon\" aria-hidden=\"true\"><svg lucideCheck [size]=\"26\"></svg></div>\r\n      <h2 id=\"cancellation-approval-title\">Aprobar cancelaci\u00F3n</h2>\r\n      @if (solicitudPorAprobar(); as solicitud) {\r\n        <p class=\"refund-meta\">Solicitud #{{ solicitud.id }} \u00B7 Reserva #{{ solicitud.reserva?.id ?? '-' }}</p>\r\n        @if (solicitud.devolucion; as devolucion) {\r\n          <div class=\"cancellation-refund cancellation-refund--summary\">\r\n            <p>Monto a devolver al inquilino</p>\r\n            <strong>{{ devolucion.importe | currency: devolucion.moneda : 'code' : '1.2-2' }} ({{ devolucion.porcentaje }} %)</strong>\r\n            <p>Calculado a la fecha de solicitud: {{ devolucion.fechaSolicitud | date: 'dd/MM/yyyy' : 'UTC' }}.</p>\r\n          </div>\r\n          @if (devolucion.porcentaje === 0) {\r\n            <p>La reserva se cancelar\u00E1 sin devoluci\u00F3n al inquilino.</p>\r\n          } @else {\r\n            <p>Al confirmar se generar\u00E1 una devoluci\u00F3n pendiente de gesti\u00F3n en Reembolsos.</p>\r\n          }\r\n        }\r\n      }\r\n      <label for=\"cancellation-approval-note\">Observaci\u00F3n de la aprobaci\u00F3n <span class=\"muted\">(opcional)</span></label>\r\n      <textarea id=\"cancellation-approval-note\" name=\"observacionAprobacion\" [(ngModel)]=\"observacionAprobacion\"\r\n        rows=\"4\" maxlength=\"500\" placeholder=\"Agreg\u00E1 una observaci\u00F3n si corresponde\"\r\n        aria-describedby=\"cancellation-approval-note-help\" [disabled]=\"aprobandoCancelacion()\" autofocus></textarea>\r\n      <small id=\"cancellation-approval-note-help\" class=\"muted\">Hasta 500 caracteres.</small>\r\n      @if (errorAprobacion()) { <p class=\"refund-error\" role=\"alert\">{{ errorAprobacion() }}</p> }\r\n      <div class=\"block-actions\">\r\n        <button type=\"button\" class=\"button button--ghost\" [disabled]=\"aprobandoCancelacion()\" (click)=\"cerrarAprobacionCancelacion()\">Volver</button>\r\n        <button type=\"submit\" class=\"button button--success\" [disabled]=\"aprobandoCancelacion() || !solicitudPorAprobar()?.devolucion\">\r\n          {{ aprobandoCancelacion() ? 'Aprobando\u2026' : 'Confirmar aprobaci\u00F3n' }}\r\n        </button>\r\n      </div>\r\n    </form>\r\n  </dialog>\r\n\r\n  <dialog #dialogoReembolso class=\"block-dialog refund-dialog\" aria-labelledby=\"refund-title\"\r\n    (cancel)=\"cerrarReembolso($event)\" (close)=\"reembolsoSeleccionado.set(null)\">\r\n    @if (reembolsoSeleccionado(); as item) {\r\n      <form class=\"block-form\" (ngSubmit)=\"procesarReembolso(item)\" [attr.aria-busy]=\"guardandoReembolso()\">\r\n        <header class=\"refund-heading\">\r\n          <div class=\"advertiser-payment__header\">\r\n            <div class=\"cancellation-approval-icon\" aria-hidden=\"true\"><svg lucideReceiptText [size]=\"26\"></svg></div>\r\n            <div>\r\n              <h2 id=\"refund-title\">{{ puedeRegistrarTransferencia(item) ? 'Registrar transferencia del reembolso' : 'Detalle del reembolso' }}</h2>\r\n              <p class=\"refund-meta\">Reembolso #{{ item.id }} \u00B7 Reserva #{{ item.reserva?.id ?? '\u2014' }}</p>\r\n            </div>\r\n          </div>\r\n          <button type=\"button\" class=\"button button--ghost\" aria-label=\"Cerrar\"\r\n            [disabled]=\"guardandoReembolso()\" (click)=\"cerrarReembolso()\"><svg lucideX [size]=\"20\" aria-hidden=\"true\"></svg></button>\r\n        </header>\r\n        <div class=\"refund-amount\">\r\n          <span>{{ item.tipo === 'TOTAL' ? 'Devoluci\u00F3n total' : item.tipo === 'PARCIAL' ? 'Devoluci\u00F3n parcial' : 'Contracargo' }}</span>\r\n          @if (puedeRegistrarTransferencia(item)) {\r\n            <app-dato-copiable class=\"refund-amount__value\" [valor]=\"(item.importe | currency: item.moneda) ?? ''\"\r\n              [copia]=\"importeParaCopiar(item.importe)\" descripcion=\"importe a devolver\" />\r\n          } @else {\r\n            <strong class=\"refund-amount__value\">{{ item.importe | currency: item.moneda }}</strong>\r\n          }\r\n          <span class=\"status\" [class.status--blocked]=\"item.estado === 'PENDIENTE' || puedeConciliarReembolso(item)\">{{ estadosReembolso[item.estado] }}</span>\r\n        </div>\r\n        <dl class=\"refund-data\">\r\n          <div><dt>Publicaci\u00F3n</dt><dd>{{ item.reserva?.publicacion?.titulo || 'Sin datos' }}</dd></div>\r\n          <div><dt>Inquilino</dt><dd>{{ item.reserva?.usuario?.nombre || 'Sin datos' }} {{ item.reserva?.usuario?.apellido }}</dd></div>\r\n          <div><dt>Origen</dt><dd>{{ origenesReembolso[item.origen] || item.origen }}</dd></div>\r\n          <div><dt>Creado</dt><dd>{{ item.creado_en | date:'dd/MM/yyyy, HH:mm' }}</dd></div>\r\n          @if (item.reserva?.fecha_inicio && item.reserva?.fecha_fin) {\r\n            <div><dt>Estad\u00EDa</dt><dd>{{ item.reserva?.fecha_inicio | date:'dd/MM/yyyy':'UTC' }} \u2013 {{ item.reserva?.fecha_fin | date:'dd/MM/yyyy':'UTC' }}</dd></div>\r\n          }\r\n          @if (item.pago; as pago) {\r\n            <div><dt>Pago original</dt><dd>{{ pago.payment_id ? 'Mercado Pago #' + pago.payment_id : 'Pago #' + pago.id }}</dd></div>\r\n          }\r\n          @if (item.referencia_externa?.startsWith('SIMULADO:tarjeta:')) {\r\n            <div><dt>Devoluci\u00F3n de prueba</dt><dd>Simulada. No se transfiri\u00F3 dinero.</dd></div>\r\n          } @else if (item.referencia_externa) {\r\n            <div><dt>{{ item.transferencia_manual ? 'N\u00FAmero de operaci\u00F3n' : 'Referencia de devoluci\u00F3n' }}</dt><dd>{{ item.referencia_externa }}</dd></div>\r\n          }\r\n          @if (item.comprobante_nombre) {\r\n            <div><dt>Comprobante</dt><dd><app-ver-comprobante [obtenerUrl]=\"urlComprobanteReembolso(item.id)\" [etiqueta]=\"'Ver ' + item.comprobante_nombre\" /></dd></div>\r\n          }\r\n          @if (item.resuelto_en) {\r\n            <div><dt>Resuelto</dt><dd>{{ item.resuelto_en | date:'dd/MM/yyyy, HH:mm' }}</dd></div>\r\n          }\r\n          @if (item.resuelto_por; as administrador) {\r\n            <div><dt>Registrado por</dt><dd>{{ administrador.nombre }} {{ administrador.apellido }}</dd></div>\r\n          }\r\n          @if (item.aplicado_en) {\r\n            <div><dt>Aplicado a la reserva</dt><dd>{{ item.aplicado_en | date:'dd/MM/yyyy, HH:mm' }}</dd></div>\r\n          }\r\n          <div class=\"refund-reason\"><dt>Motivo</dt><dd>{{ item.motivo }}</dd></div>\r\n          @if (item.observacion_transferencia) {\r\n            <div class=\"refund-reason\"><dt>Observaci\u00F3n de la transferencia</dt><dd>{{ item.observacion_transferencia }}</dd></div>\r\n          }\r\n        </dl>\r\n        @if (item.revision_aplicacion) {\r\n          <p class=\"refund-help\">Reembolso hist\u00F3rico pendiente de revisi\u00F3n administrativa.</p>\r\n        } @else if (item.estado === 'APROBADO' && !item.aplicado_en) {\r\n          <p class=\"refund-help\">El reembolso est\u00E1 aprobado y pendiente de aplicar a la reserva.</p>\r\n        }\r\n        @if (puedeRegistrarTransferencia(item)) {\r\n          <p class=\"refund-help refund-help--accent\" id=\"refund-transfer-help\">Pedile al inquilino su CBU o alias por el chat, transfer\u00ED el importe y adjunt\u00E1 el comprobante. El inquilino va a poder ver el comprobante, el n\u00FAmero de operaci\u00F3n y la observaci\u00F3n.</p>\r\n        }\r\n        @if (item.transferencia_manual) {\r\n          <details class=\"refund-chat\" [open]=\"puedeRegistrarTransferencia(item)\">\r\n            <summary>Conversaci\u00F3n con el inquilino</summary>\r\n            <app-reembolso-chat [reembolsoId]=\"item.id\" />\r\n          </details>\r\n        }\r\n        @if (puedeRegistrarTransferencia(item)) {\r\n          <app-carga-comprobante [(archivo)]=\"comprobanteReembolso\" [deshabilitado]=\"guardandoReembolso()\" />\r\n          <label for=\"refund-bank-reference\">N\u00FAmero de operaci\u00F3n <span class=\"muted\">(opcional)</span></label>\r\n          <input id=\"refund-bank-reference\" name=\"referenciaReembolso\" [(ngModel)]=\"referenciaReembolso\"\r\n            maxlength=\"150\" aria-describedby=\"refund-transfer-help\" [disabled]=\"guardandoReembolso()\" />\r\n          <label for=\"refund-transfer-note\">Observaci\u00F3n <span class=\"muted\">(opcional)</span></label>\r\n          <textarea id=\"refund-transfer-note\" name=\"observacionReembolso\" [(ngModel)]=\"observacionReembolso\"\r\n            rows=\"3\" maxlength=\"500\" [disabled]=\"guardandoReembolso()\"></textarea>\r\n        } @else if (puedeConciliarReembolso(item)) {\r\n          <label for=\"refund-external-id\">ID del reembolso en Mercado Pago</label>\r\n          <input id=\"refund-external-id\" name=\"referenciaReembolso\" [(ngModel)]=\"referenciaReembolso\"\r\n            required maxlength=\"100\" inputmode=\"numeric\" pattern=\"[0-9]+\" [disabled]=\"guardandoReembolso()\" />\r\n          <p class=\"refund-help\">Se verifica una devoluci\u00F3n ya realizada en Mercado Pago.</p>\r\n        } @else if (puedeSolicitarReembolso(item)) {\r\n          <p class=\"refund-help\">Al confirmar, se solicitar\u00E1 la devoluci\u00F3n a Mercado Pago por el importe indicado.</p>\r\n        } @else if (item.estado === 'PENDIENTE') {\r\n          <p class=\"refund-help\">{{ item.referencia_interna?.startsWith('auto-can:') ? 'La devoluci\u00F3n est\u00E1 en gesti\u00F3n autom\u00E1tica.' : 'El pago original no tiene un identificador de Mercado Pago.' }}</p>\r\n        }\r\n        @if (puedeHabilitarTransferencia(item)) {\r\n          <p class=\"refund-help\">Para devolver por transferencia, DEPA verifica en Mercado Pago que no haya una devoluci\u00F3n pendiente o sin conciliar.</p>\r\n        }\r\n        @if (errorReembolso()) { <p class=\"refund-error\" role=\"alert\">{{ errorReembolso() }}</p> }\r\n        <div class=\"block-actions\">\r\n          <button type=\"button\" class=\"button button--ghost\" [disabled]=\"guardandoReembolso()\" (click)=\"cerrarReembolso()\">Volver</button>\r\n          @if (puedeHabilitarTransferencia(item)) {\r\n            <button type=\"button\" class=\"button button--ghost\" [disabled]=\"guardandoReembolso()\" (click)=\"habilitarTransferenciaReembolso(item)\">Habilitar transferencia</button>\r\n          }\r\n          @if (puedeRegistrarTransferencia(item) || puedeSolicitarReembolso(item) || puedeConciliarReembolso(item)) {\r\n            <button type=\"submit\" class=\"button button--success\"\r\n              [disabled]=\"guardandoReembolso() || !referenciaReembolsoValida(item)\">\r\n              {{ guardandoReembolso() ? 'Procesando\u2026' : puedeRegistrarTransferencia(item) ? 'Registrar transferencia' : puedeConciliarReembolso(item) ? 'Conciliar devoluci\u00F3n' : 'Solicitar devoluci\u00F3n' }}\r\n            </button>\r\n          }\r\n        </div>\r\n      </form>\r\n    }\r\n  </dialog>\r\n\r\n  <section class=\"panel admin-module\" id=\"reclamos\" [hidden]=\"activeSection() !== 'reclamos'\">\r\n    <div class=\"panel__title\">\r\n      <div>\r\n        <h2>Reclamos de reservas</h2>\r\n        <p>Evidencia, mensajes con las partes y resoluci\u00F3n administrativa.</p>\r\n      </div>\r\n      <span class=\"counter\">{{ claims().length }}</span>\r\n    </div>\r\n    @if (errorReclamos()) {\r\n      <p class=\"alert alert--error\" role=\"alert\">{{ errorReclamos() }}</p>\r\n    }\r\n    @if (!claims().length && !errorReclamos()) {\r\n      <p class=\"empty\">{{ loading() ? 'Cargando reclamos\u2026' : 'No hay reclamos registrados.' }}</p>\r\n    } @else if (claims().length) {\r\n      @if (claims().length >= maxReclamosAdmin) {\r\n        <p class=\"refund-note\" role=\"status\">Se muestran los {{ maxReclamosAdmin }} reclamos m\u00E1s recientes.</p>\r\n      }\r\n      <app-filtros-lista class=\"admin-filtros\" [lista]=\"listaReclamos\" etiqueta=\"Buscar reclamos\"\r\n        placeholder=\"Buscar por reclamo, reserva, publicaci\u00F3n, inquilino, anunciante o descripci\u00F3n\" />\r\n    }\r\n    <div class=\"settlement-list\">\r\n      @for (claim of listaReclamos.visibles(); track claim.id) {\r\n        <article class=\"settlement-card claim-card\" [id]=\"'admin-reclamos-' + claim.id\" tabindex=\"-1\">\r\n          <app-claim-history [reclamo]=\"claim\" [administracion]=\"true\" [mostrarVerReembolso]=\"true\"\r\n            [actualizar]=\"activeSection() === 'reclamos'\"\r\n            (verReembolso)=\"verReembolsoReclamo(claim)\">\r\n            @if (gestionReclamo()?.id === claim.id && gestionReclamo()?.accion === 'mensaje') {\r\n              <app-conversation-composer [(texto)]=\"textoReclamo\" [(imagenes)]=\"imagenesReclamo\" [adjuntos]=\"imagenesDisponibles(claim)\"\r\n                etiqueta=\"Mensaje para el inquilino y el anunciante\" [deshabilitado]=\"!!busy()\" (enviar)=\"responderReclamo(claim)\" />\r\n              <button type=\"button\" class=\"button button--ghost\" [disabled]=\"!!busy()\" (click)=\"gestionReclamo.set(null)\">Cancelar</button>\r\n            }\r\n          </app-claim-history>\r\n          @if (claim.estado !== 'CERRADO') {\r\n            <div class=\"actions\">\r\n              <button type=\"button\" class=\"button button--ghost\" [disabled]=\"!!busy()\" (click)=\"abrirGestionReclamo(claim.id, 'mensaje')\">Escribir mensaje</button>\r\n              @if (claim.estado === 'ABIERTO' || claim.estado === 'EN_REVISION') {\r\n                <button type=\"button\" class=\"button button--resolve-claim\" [disabled]=\"!!busy()\" (click)=\"abrirGestionReclamo(claim.id, 'resolver')\">Resolver reclamo</button>\r\n              }\r\n            </div>\r\n          }\r\n          @if (gestionReclamo(); as gestion) {\r\n            @if (gestion.id === claim.id && gestion.accion === 'resolver') {\r\n              <form class=\"claim-form\" (ngSubmit)=\"resolverReclamoReserva(claim)\">\r\n                <label>Resultado de la revisi\u00F3n\r\n                  <select name=\"resolucionReclamo\" [(ngModel)]=\"resolucionReclamo\" [disabled]=\"!!busy()\">\r\n                    @if (claim.categoria === 'CODIGO_BLOQUEADO') {\r\n                      <!-- El pedido de reinicio del c\u00F3digo tiene sus propias salidas; terminada la estad\u00EDa ya no se carga el c\u00F3digo. -->\r\n                      @if (claim.reserva?.estado_estadia === 'PENDIENTE_INGRESO') {\r\n                        <option value=\"REINICIAR_CODIGO\">Habilitar 5 intentos m\u00E1s</option>\r\n                      }\r\n                      <option value=\"CONFIRMAR_INGRESO\">Confirmar el ingreso sin c\u00F3digo (a favor del anunciante)</option>\r\n                      <option value=\"DEVOLUCION_PARCIAL\">Devolver una parte al inquilino</option>\r\n                      <option value=\"DEVOLUCION_TOTAL\">Devolver el 100 % al inquilino</option>\r\n                    } @else {\r\n                      <option value=\"SIN_DEVOLUCION\">Sin devoluci\u00F3n</option>\r\n                      <option value=\"DEVOLUCION_PARCIAL\">Devoluci\u00F3n parcial</option>\r\n                      <option value=\"DEVOLUCION_TOTAL\">{{ (claim.solicitud_cancelacion_id && claim.categoria !== 'DEMORA_ADMINISTRATIVA') ? 'Completar faltante' : 'Devoluci\u00F3n total' }}</option>\r\n                    }\r\n                  </select>\r\n                </label>\r\n                @if (claim.categoria === 'CODIGO_BLOQUEADO' && resolucionReclamo === 'CONFIRMAR_INGRESO') {\r\n                  <p class=\"refund-help\">El pago al anunciante se habilita en la fecha habitual, a los 5 d\u00EDas del fin de la estad\u00EDa.</p>\r\n                }\r\n                @if (resolucionReclamo === 'DEVOLUCION_PARCIAL') {\r\n                  <label>Importe a devolver ({{ claim.devolucion_cancelacion?.moneda || claim.reserva?.moneda_contratada || 'ARS' }})\r\n                    <input type=\"number\" name=\"importeReclamo\" [(ngModel)]=\"importeReclamo\" min=\"0.01\" step=\"0.01\" required\r\n                      [attr.max]=\"totalPagadoReclamo(claim)\" [attr.aria-invalid]=\"parcialCubreElTotal(claim)\" [disabled]=\"!!busy()\" />\r\n                  </label>\r\n                  @if (totalPagadoReclamo(claim); as total) {\r\n                    <p class=\"refund-help\">{{ (claim.solicitud_cancelacion_id && claim.categoria !== 'DEMORA_ADMINISTRATIVA') ? 'Faltante disponible:' : 'Pag\u00F3 el inquilino' }} {{ montoReclamo(claim, total) }}. La devoluci\u00F3n parcial tiene que ser menor.</p>\r\n                  }\r\n                  @if (claim.categoria === 'CODIGO_BLOQUEADO') {\r\n                    <p class=\"refund-help\">El ingreso sigue sin verificar. El resto se le paga al anunciante en la fecha habitual, a los 5 d\u00EDas del fin de la estad\u00EDa.</p>\r\n                  }\r\n                  @if (parcialCubreElTotal(claim)) {\r\n                    <p class=\"refund-error\" role=\"alert\">Para devolver todo eleg\u00ED \u00AB{{ (claim.solicitud_cancelacion_id && claim.categoria !== 'DEMORA_ADMINISTRATIVA') ? 'Completar faltante' : 'Devoluci\u00F3n total' }}\u00BB.</p>\r\n                  }\r\n                }\r\n                <label>Motivo de la resoluci\u00F3n\r\n                  <textarea name=\"observacionReclamo\" [(ngModel)]=\"observacionReclamo\" rows=\"3\" maxlength=\"500\" required\r\n                    aria-describedby=\"motivo-resolucion-ayuda\" [disabled]=\"!!busy()\"></textarea>\r\n                </label>\r\n                <p id=\"motivo-resolucion-ayuda\" class=\"refund-help\">Lo ven el inquilino y el anunciante.</p>\r\n                <div class=\"actions\">\r\n                  <button type=\"button\" class=\"button button--ghost\" [disabled]=\"!!busy()\" (click)=\"gestionReclamo.set(null)\">Cancelar</button>\r\n                  <button type=\"submit\" class=\"button button--light\" [disabled]=\"!!busy() || !observacionReclamo.trim() || (resolucionReclamo === 'DEVOLUCION_PARCIAL' && (!(importeReclamo && importeReclamo > 0) || parcialCubreElTotal(claim)))\">Confirmar resoluci\u00F3n</button>\r\n                </div>\r\n              </form>\r\n            }\r\n          }\r\n        </article>\r\n      } @empty {\r\n        @if (claims().length) {\r\n          <p class=\"empty\">No hay reclamos que coincidan. <button type=\"button\" class=\"link-button\" (click)=\"listaReclamos.limpiar()\">Limpiar filtros</button></p>\r\n        }\r\n      }\r\n    </div>\r\n    @if (listaReclamos.filtrados().length) {\r\n      <app-paginador class=\"admin-paginador\" [pagina]=\"listaReclamos.pagina()\" [paginas]=\"listaReclamos.paginas()\"\r\n        [total]=\"listaReclamos.filtrados().length\" etiqueta=\"reclamos\" ariaLabel=\"Paginaci\u00F3n de reclamos\"\r\n        (paginaCambia)=\"listaReclamos.irAPagina($event)\" />\r\n    }\r\n  </section>\r\n\r\n  <section class=\"panel admin-module\" [hidden]=\"activeSection() !== 'verificaciones'\">\r\n    <div class=\"panel__title\">\r\n      <div>\r\n        <h2>Solicitudes de verificaci\u00F3n</h2>\r\n        <p>Identidad y cuentas bancarias pendientes de revisi\u00F3n.</p>\r\n      </div>\r\n      <span class=\"counter\">{{ requests().length }}</span>\r\n    </div>\r\n    @if (otherLoading()) {\r\n      <p class=\"empty\">Cargando solicitudes\u2026</p>\r\n    } @else if (!requests().length) {\r\n      <p class=\"empty\">No hay solicitudes pendientes.</p>\r\n    } @else {\r\n      <app-filtros-lista class=\"admin-filtros\" [lista]=\"listaVerificaciones\" etiqueta=\"Buscar solicitudes de verificaci\u00F3n\"\r\n        placeholder=\"Buscar por nombre, email, CUIT/CUIL, raz\u00F3n social o solicitud\" />\r\n      @if (!listaVerificaciones.filtrados().length) {\r\n        <p class=\"empty\">No hay solicitudes que coincidan. <button type=\"button\" class=\"link-button\" (click)=\"listaVerificaciones.limpiar()\">Limpiar filtros</button></p>\r\n      }\r\n      <div class=\"requests\">\r\n        @for (request of listaVerificaciones.visibles(); track request.id) {\r\n          <article class=\"request\" [id]=\"'admin-verificaciones-' + request.id\" tabindex=\"-1\">\r\n            <div class=\"request__identity\">\r\n              <span class=\"avatar\">{{\r\n                (request.anunciante.usuario?.nombre || 'A').charAt(0)\r\n              }}</span>\r\n              <div>\r\n                <h3>\r\n                  {{ request.anunciante.usuario?.nombre || 'Anunciante' }}\r\n                  {{ request.anunciante.usuario?.apellido }}\r\n                </h3>\r\n                <p>{{ request.anunciante.usuario?.email || request.anunciante.numero_contacto }}</p>\r\n              </div>\r\n            </div>\r\n            <dl>\r\n              <div>\r\n                <dt>CUIT/CUIL</dt>\r\n                <dd>{{ request.anunciante.cuit_cuil || 'Sin informar' }}</dd>\r\n              </div>\r\n              <div>\r\n                <dt>Revisi\u00F3n</dt>\r\n                <dd>#{{ request.numero_revision }}</dd>\r\n              </div>\r\n              @if (request.revisar_identidad) {\r\n                <div>\r\n                  <dt>Prueba de vida</dt>\r\n                  <dd>{{ request.prueba_vida_validada_en ? 'Completada' : 'Requiere una nueva captura' }}</dd>\r\n                </div>\r\n              }\r\n              @if (request.cbu_pendiente) {\r\n                <div><dt>CBU a revisar</dt><dd><code>{{ request.cbu_pendiente }}</code></dd></div>\r\n              }\r\n            </dl>\r\n            @if (request.cbu_pendiente) {\r\n              <label>\r\n                <input #titular type=\"checkbox\" [checked]=\"titularCbuConfirmado === request.id\"\r\n                  (change)=\"titularCbuConfirmado = titular.checked ? request.id : null\" />\r\n                Verifiqu\u00E9 en el banco que el CBU pertenece al mismo titular de la cuenta en DEPA.\r\n              </label>\r\n            }\r\n            @if (request.revisar_identidad && (request.razon_social || request.matricula_profesional)) {\r\n              <h4>Inmobiliaria y corredor responsable</h4>\r\n              <dl>\r\n                <div><dt>Nombre o raz\u00F3n social</dt><dd>{{ request.razon_social || 'Sin informar' }}</dd></div>\r\n                <div><dt>Matr\u00EDcula del corredor responsable</dt><dd>{{ request.matricula_profesional || 'Sin informar' }}</dd></div>\r\n                <div><dt>Colegio profesional y jurisdicci\u00F3n</dt><dd>{{ request.colegio_profesional || 'Sin informar' }}</dd></div>\r\n                <div><dt>Domicilio comercial</dt><dd>{{ request.domicilio_comercial || 'Sin informar' }}</dd></div>\r\n                <div><dt>DNI del corredor responsable</dt><dd>{{ request.dni_corredor || 'Sin informar' }}</dd></div>\r\n              </dl>\r\n              <p>Compar\u00E1 el DNI y la captura del titular de la cuenta. Revis\u00E1 matr\u00EDcula, colegio/jurisdicci\u00F3n, domicilio comercial y constancia de CUIT antes de aprobar.</p>\r\n            }\r\n            <div class=\"documents\">\r\n              @if (request.dni_frente_url) {\r\n                <a class=\"document-preview\" [href]=\"request.dni_frente_url\" target=\"_blank\" rel=\"noopener\">\r\n                  <img [src]=\"request.dni_frente_url\" alt=\"Vista previa DNI frente\" />\r\n                  <span>DNI frente</span>\r\n                </a>\r\n              }\r\n              @if (request.dni_dorso_url) {\r\n                <a class=\"document-preview\" [href]=\"request.dni_dorso_url\" target=\"_blank\" rel=\"noopener\">\r\n                  <img [src]=\"request.dni_dorso_url\" alt=\"Vista previa DNI dorso\" />\r\n                  <span>DNI dorso</span>\r\n                </a>\r\n              }\r\n              @if (request.rostro_url) {\r\n                <a class=\"document-preview\" [href]=\"request.rostro_url\" target=\"_blank\" rel=\"noopener\">\r\n                  @if (esVideo(request.rostro_url)) {\r\n                    <video [src]=\"request.rostro_url\" muted></video>\r\n                  } @else {\r\n                    <img [src]=\"request.rostro_url\" alt=\"Vista previa del rostro\" />\r\n                  }\r\n                  <span>Rostro</span>\r\n                </a>\r\n              }\r\n            </div>\r\n            @if (request.matricula_url) { <a [href]=\"request.matricula_url\" target=\"_blank\" rel=\"noopener\">Ver constancia de matr\u00EDcula</a> }\r\n            @if (request.constancia_cuit_url) { <a [href]=\"request.constancia_cuit_url\" target=\"_blank\" rel=\"noopener\">Ver constancia de CUIT</a> }\r\n            @if (rejectId() === request.id) {\r\n              <div class=\"reject-box\">\r\n                @if (request.revisar_identidad) {\r\n                  <label><input type=\"checkbox\" [(ngModel)]=\"rechazarIdentidad\" /> Rechazar prueba de vida y documentaci\u00F3n de identidad</label>\r\n                }\r\n                @if (request.cbu_pendiente) {\r\n                  <label><input type=\"checkbox\" [(ngModel)]=\"rechazarCbu\" /> Rechazar CBU</label>\r\n                }\r\n                @if (request.revisar_identidad && request.cbu_pendiente) {\r\n                  <p>Se aprobar\u00E1 la parte que dejes sin marcar.</p>\r\n                }\r\n                <label [for]=\"'reason-' + request.id\">Motivo del rechazo</label\r\n                ><textarea\r\n                  [id]=\"'reason-' + request.id\"\r\n                  [(ngModel)]=\"rejectReason\"\r\n                  maxlength=\"500\"\r\n                  placeholder=\"Explic\u00E1 qu\u00E9 documentaci\u00F3n debe corregir\"\r\n                ></textarea>\r\n                <div>\r\n                  <button type=\"button\" class=\"button button--ghost\" (click)=\"cancelReject()\">\r\n                    Cancelar</button\r\n                  ><button\r\n                    type=\"button\"\r\n                    class=\"button button--danger\"\r\n                    (click)=\"confirmReject(request)\"\r\n                    [disabled]=\"rejectReason.trim().length < 5 || (!rechazarIdentidad && !rechazarCbu) || !puedeResolverVerificacion(request, rechazarIdentidad, rechazarCbu)\"\r\n                  >\r\n                    Confirmar rechazo\r\n                  </button>\r\n                </div>\r\n              </div>\r\n            } @else {\r\n              <div class=\"actions\">\r\n                <button\r\n                  type=\"button\"\r\n                  class=\"button button--danger-outline\"\r\n                  (click)=\"openReject(request)\"\r\n                >\r\n                  <svg lucideX [size]=\"17\"></svg> Rechazar</button\r\n                ><button\r\n                  type=\"button\"\r\n                  class=\"button button--success\"\r\n                  (click)=\"approve(request)\"\r\n                  [disabled]=\"!puedeResolverVerificacion(request, false, false)\"\r\n                >\r\n                  <svg lucideCheck [size]=\"17\"></svg> Aprobar\r\n                </button>\r\n              </div>\r\n            }\r\n          </article>\r\n        }\r\n      </div>\r\n      @if (listaVerificaciones.filtrados().length) {\r\n        <app-paginador class=\"admin-paginador\" [pagina]=\"listaVerificaciones.pagina()\" [paginas]=\"listaVerificaciones.paginas()\"\r\n          [total]=\"listaVerificaciones.filtrados().length\" etiqueta=\"solicitudes\" ariaLabel=\"Paginaci\u00F3n de solicitudes de verificaci\u00F3n\"\r\n          (paginaCambia)=\"listaVerificaciones.irAPagina($event)\" />\r\n      }\r\n    }\r\n  </section>\r\n\r\n  <section class=\"panel admin-module\" [hidden]=\"activeSection() !== 'usuarios'\">\r\n    <div class=\"panel__title panel__title--users\">\r\n      <div>\r\n        <h2>Usuarios</h2>\r\n        <p>Administr\u00E1 el acceso y los roles del sistema.</p>\r\n        @if (!usersLoading()) {\r\n          <p>{{ registeredUsers() }} usuarios registrados</p>\r\n        }\r\n      </div>\r\n      <label class=\"search\"\r\n        ><svg lucideSearch [size]=\"18\"></svg\r\n        ><input\r\n          type=\"search\"\r\n          aria-label=\"Buscar usuarios\"\r\n          maxlength=\"200\"\r\n          placeholder=\"Buscar por nombre, email o CUIT/CUIL\"\r\n          [ngModel]=\"query()\"\r\n          (ngModelChange)=\"searchUsers($event)\"\r\n      /></label>\r\n    </div>\r\n    <div class=\"table-wrap\">\r\n      <table class=\"responsive-table\" role=\"table\">\r\n        <thead>\r\n          <tr>\r\n            <th>Usuario</th>\r\n            <th>Contacto</th>\r\n            <th>Rol</th>\r\n            <th>Estado</th>\r\n            <th class=\"right\">Acciones</th>\r\n          </tr>\r\n        </thead>\r\n        <tbody>\r\n          @if (usersLoading()) {\r\n            <tr><td colspan=\"5\" class=\"empty\">Cargando usuarios\u2026</td></tr>\r\n          } @else {\r\n          @for (user of users(); track user.id) {\r\n            <tr>\r\n              <td data-label=\"Usuario\">\r\n                <strong>{{ user.nombre }} {{ user.apellido }}</strong\r\n                ><small>{{ user.email_verificado ? 'Email verificado' : 'Email pendiente' }}</small>\r\n              </td>\r\n              <td data-label=\"Contacto\">\r\n                <!-- RN-37: una cuenta dada de baja conserva su email y CUIT/CUIL como hist\u00F3ricos. -->\r\n                {{ user.email ?? user.email_historico }}<small>{{ user.telefono }}</small>\r\n                @if (user.cuit_cuil ?? user.cuit_cuil_historico; as cuit) {\r\n                  <small>CUIT/CUIL {{ cuit }}{{ user.cuit_cuil ? '' : ' (hist\u00F3rico)' }}</small>\r\n                }\r\n              </td>\r\n              <td data-label=\"Rol\">{{ user.rol?.nombre ?? 'Sin rol' }}</td>\r\n              <td data-label=\"Estado\">\r\n                @if (!user.activa) {\r\n                  <span class=\"status status--deleted\">Dada de baja</span>\r\n                  @if (user.fecha_baja) {\r\n                    <small>{{ user.fecha_baja | date: 'dd/MM/yyyy' }}</small>\r\n                  }\r\n                } @else if (user.bloqueado) {\r\n                  <span class=\"status status--blocked\">Bloqueada</span>\r\n                } @else {\r\n                  <span class=\"status\">Activa</span>\r\n                }\r\n              </td>\r\n              <td data-label=\"Acciones\" class=\"right\">\r\n                <!-- La baja es definitiva: bloquear o habilitar no aplica. -->\r\n                @if (user.activa) {\r\n                  <button\r\n                    type=\"button\"\r\n                    class=\"link-button\"\r\n                    (click)=\"toggleUser(user)\"\r\n                    [disabled]=\"busy() === 'user-' + user.id\"\r\n                  >\r\n                    {{ user.bloqueado ? 'Habilitar' : 'Bloquear' }}\r\n                  </button>\r\n                }\r\n              </td>\r\n            </tr>\r\n          } @empty {\r\n            <tr>\r\n              <td colspan=\"5\" class=\"empty\">No se encontraron usuarios.</td>\r\n            </tr>\r\n          }\r\n          }\r\n        </tbody>\r\n      </table>\r\n    </div>\r\n    <nav class=\"pagination\" aria-label=\"Paginaci\u00F3n de usuarios\">\r\n      <span role=\"status\">{{ usersTotal() }} usuarios \u00B7 P\u00E1gina {{ usersPage() }} de {{ usersPages() }}</span>\r\n      <div class=\"pagination__actions\">\r\n        <button type=\"button\" class=\"button button--ghost\" (click)=\"loadUsers(usersPage() - 1)\"\r\n          [disabled]=\"usersLoading() || busy() !== null || usersPage() <= 1\">Anterior</button>\r\n        <button type=\"button\" class=\"button button--ghost\" (click)=\"loadUsers(usersPage() + 1)\"\r\n          [disabled]=\"usersLoading() || busy() !== null || usersPage() >= usersPages()\">Siguiente</button>\r\n      </div>\r\n    </nav>\r\n  </section>\r\n  <section class=\"panel admin-module appeals-panel\" aria-labelledby=\"blocked-users-title\" [hidden]=\"activeSection() !== 'bloqueos'\">\r\n    <div class=\"panel__title appeals-panel__title\">\r\n      <div>\r\n        <h2 id=\"blocked-users-title\">Usuarios bloqueados</h2>\r\n        <p>Consult\u00E1 los bloqueos vigentes y respond\u00E9 las apelaciones.</p>\r\n      </div>\r\n    </div>\r\n    <nav class=\"appeals-tabs\" aria-label=\"Vistas de bloqueos\">\r\n      <button type=\"button\" [class.active]=\"vistaBloqueos() === 'actuales'\" [attr.aria-pressed]=\"vistaBloqueos() === 'actuales'\" (click)=\"cambiarVistaBloqueos('actuales')\">Bloqueos actuales</button>\r\n      <button type=\"button\" [class.active]=\"vistaBloqueos() === 'historial'\" [attr.aria-pressed]=\"vistaBloqueos() === 'historial'\" (click)=\"cambiarVistaBloqueos('historial')\">Historial</button>\r\n    </nav>\r\n    @if (vistaBloqueos() === 'actuales') {\r\n    @if (bloqueadosError()) {\r\n      <p class=\"alert alert--error\" role=\"alert\">{{ bloqueadosError() }}</p>\r\n    }\r\n    @if (bloqueadosCargando()) {\r\n      <p class=\"empty\" role=\"status\">Cargando usuarios bloqueados\u2026</p>\r\n    } @else {\r\n      @if (bloqueados().length) {\r\n        <app-filtros-lista class=\"admin-filtros\" [lista]=\"listaBloqueos\" etiqueta=\"Buscar bloqueos actuales\"\r\n          placeholder=\"Buscar por nombre, email, motivo o administrador\" />\r\n      }\r\n      <div class=\"blocked-users\">\r\n        @for (bloqueo of listaBloqueos.visibles(); track bloqueo.detalle.id) {\r\n          <article class=\"blocked-user\" [id]=\"'admin-bloqueos-' + bloqueo.usuario.id\" tabindex=\"-1\">\r\n            <header class=\"blocked-user__header\">\r\n              <span class=\"blocked-user__avatar\"><svg lucideUserRound [size]=\"24\" aria-hidden=\"true\"></svg></span>\r\n              <div class=\"blocked-user__identity\">\r\n                <h3>{{ bloqueo.usuario.nombre }} {{ bloqueo.usuario.apellido }}</h3>\r\n                <p>{{ bloqueo.usuario.email }}</p>\r\n              </div>\r\n              <span class=\"blocked-user__status\">\r\n                @if (tieneApelacion(bloqueo.detalle)) {\r\n                  <svg lucideMessageCircle [size]=\"15\" aria-hidden=\"true\"></svg> {{ apelacionSinResponder(bloqueo.detalle) ? 'Apelaci\u00F3n en curso' : 'Respondida' }}\r\n                } @else {\r\n                  <svg lucideClock3 [size]=\"15\" aria-hidden=\"true\"></svg> Sin apelaci\u00F3n\r\n                }\r\n              </span>\r\n              <button type=\"button\" class=\"blocked-user__unblock\" [disabled]=\"!!busy()\" (click)=\"desbloquearDesdeApelaciones(bloqueo)\">\r\n                {{ busy() === 'user-' + bloqueo.usuario.id ? 'Desbloqueando...' : 'Desbloquear usuario' }}\r\n              </button>\r\n            </header>\r\n            <div class=\"blocked-user__details\">\r\n              <div><svg lucideUserRound [size]=\"20\" aria-hidden=\"true\"></svg><p><strong>Bloqueado por</strong>{{ bloqueo.administrador ? bloqueo.administrador.nombre + ' ' + bloqueo.administrador.apellido : 'Sin registro' }}</p></div>\r\n              <div><svg lucideCalendarDays [size]=\"20\" aria-hidden=\"true\"></svg><p><strong>Fecha del bloqueo</strong>{{ bloqueo.detalle.fecha ? (bloqueo.detalle.fecha | date: 'dd/MM/yyyy') : 'Sin registro' }}</p></div>\r\n              <div><svg lucideMessageCircle [size]=\"20\" aria-hidden=\"true\"></svg><p><strong>Motivo</strong>{{ bloqueo.detalle.motivo || 'Sin registro' }}</p></div>\r\n            </div>\r\n            @if (bloqueo.detalle.accesoLimitado) {\r\n              <p class=\"blocked-user__notice\">Acceso limitado a operaciones pendientes y apelaci\u00F3n.</p>\r\n            }\r\n            @if (bloqueo.detalle.apelacion) {\r\n              <app-conversation-panel class=\"blocked-user__conversation\" titulo=\"Apelaci\u00F3n del bloqueo\" [permitirAmpliar]=\"true\"\r\n                [mensajes]=\"mensajesApelacion(bloqueo.detalle, bloqueo.usuario.nombre + ' ' + bloqueo.usuario.apellido, false)\">\r\n                  <app-conversation-composer [texto]=\"respuestasApelacion[bloqueo.detalle.id] ?? ''\" (textoChange)=\"respuestasApelacion[bloqueo.detalle.id] = $event\"\r\n                    [imagenes]=\"imagenesApelacion[bloqueo.detalle.id] ?? sinImagenes\" (imagenesChange)=\"imagenesApelacion[bloqueo.detalle.id] = $event\"\r\n                    [adjuntos]=\"1\" [textoObligatorio]=\"true\" [limite]=\"2000\" etiqueta=\"Respuesta de Administraci\u00F3n\"\r\n                    [deshabilitado]=\"!!busy()\" (enviar)=\"responderApelacion(bloqueo)\" />\r\n                  <button type=\"button\" class=\"button button--ghost\" [disabled]=\"!!busy()\" (click)=\"cancelarRespuesta(bloqueo)\">Cancelar</button>\r\n              </app-conversation-panel>\r\n            }\r\n          </article>\r\n        } @empty {\r\n          @if (bloqueados().length) {\r\n            <p class=\"empty\">No hay bloqueos que coincidan. <button type=\"button\" class=\"link-button\" (click)=\"listaBloqueos.limpiar()\">Limpiar filtros</button></p>\r\n          } @else if (!bloqueadosError()) {\r\n            <p class=\"empty\">No hay usuarios bloqueados.</p>\r\n          }\r\n        }\r\n      </div>\r\n      @if (listaBloqueos.filtrados().length) {\r\n        <app-paginador class=\"admin-paginador\" [pagina]=\"listaBloqueos.pagina()\" [paginas]=\"listaBloqueos.paginas()\"\r\n          [total]=\"listaBloqueos.filtrados().length\" etiqueta=\"bloqueos\" ariaLabel=\"Paginaci\u00F3n de bloqueos actuales\"\r\n          (paginaCambia)=\"listaBloqueos.irAPagina($event)\" />\r\n      }\r\n    }\r\n    } @else {\r\n      @if (historialBloqueosError()) { <p class=\"alert alert--error\" role=\"alert\">{{ historialBloqueosError() }}</p> }\r\n      @if (historialBloqueosCargando()) {\r\n        <p class=\"empty\" role=\"status\">Cargando historial de bloqueos...</p>\r\n      } @else {\r\n        @if (historialBloqueos().length) {\r\n          <app-filtros-lista class=\"admin-filtros\" [lista]=\"listaHistorialBloqueos\" etiqueta=\"Buscar en el historial de bloqueos\"\r\n            placeholder=\"Buscar por nombre, email, motivo o administrador\" />\r\n        }\r\n        <div class=\"blocked-users\">\r\n          @for (bloqueo of listaHistorialBloqueos.visibles(); track bloqueo.usuario.id + '-' + bloqueo.detalle.id) {\r\n            <article class=\"blocked-user\">\r\n              <header class=\"blocked-user__header\">\r\n                <span class=\"blocked-user__avatar\"><svg lucideUserRound [size]=\"24\" aria-hidden=\"true\"></svg></span>\r\n                <div class=\"blocked-user__identity\"><h3>{{ bloqueo.usuario.nombre }} {{ bloqueo.usuario.apellido }}</h3><p>{{ bloqueo.usuario.email }}</p></div>\r\n                <span class=\"blocked-user__status blocked-user__status--closed\">Desbloqueado</span>\r\n              </header>\r\n              <div class=\"blocked-user__details\">\r\n                <div><svg lucideUserRound [size]=\"20\" aria-hidden=\"true\"></svg><p><strong>Bloqueado por</strong>{{ bloqueo.administrador ? bloqueo.administrador.nombre + ' ' + bloqueo.administrador.apellido : 'Sin registro' }}</p></div>\r\n                <div><svg lucideCalendarDays [size]=\"20\" aria-hidden=\"true\"></svg><p><strong>Fecha del bloqueo</strong>{{ bloqueo.detalle.fecha ? (bloqueo.detalle.fecha | date: 'dd/MM/yyyy') : 'Sin registro' }}</p></div>\r\n                <div><svg lucideMessageCircle [size]=\"20\" aria-hidden=\"true\"></svg><p><strong>Motivo</strong>{{ bloqueo.detalle.motivo || 'Sin registro' }}</p></div>\r\n              </div>\r\n              <p class=\"blocked-user__history-date\">Desbloqueado: {{ bloqueo.detalle.fechaDesbloqueo ? (bloqueo.detalle.fechaDesbloqueo | date: 'dd/MM/yyyy HH:mm') : 'fecha no registrada' }}</p>\r\n              @if (bloqueo.detalle.apelacion) {\r\n                <app-conversation-panel class=\"blocked-user__conversation\" titulo=\"Apelaci\u00F3n del bloqueo\" [permitirAmpliar]=\"true\" [mensajes]=\"mensajesApelacion(bloqueo.detalle, bloqueo.usuario.nombre + ' ' + bloqueo.usuario.apellido, false)\" />\r\n              }\r\n            </article>\r\n          } @empty {\r\n            @if (historialBloqueos().length) {\r\n              <p class=\"empty\">No hay bloqueos que coincidan. <button type=\"button\" class=\"link-button\" (click)=\"listaHistorialBloqueos.limpiar()\">Limpiar filtros</button></p>\r\n            } @else if (!historialBloqueosError()) {\r\n              <p class=\"empty\">No hay bloqueos anteriores registrados.</p>\r\n            }\r\n          }\r\n        </div>\r\n        @if (listaHistorialBloqueos.filtrados().length) {\r\n          <app-paginador class=\"admin-paginador\" [pagina]=\"listaHistorialBloqueos.pagina()\" [paginas]=\"listaHistorialBloqueos.paginas()\"\r\n            [total]=\"listaHistorialBloqueos.filtrados().length\" etiqueta=\"bloqueos\" ariaLabel=\"Paginaci\u00F3n del historial de bloqueos\"\r\n            (paginaCambia)=\"listaHistorialBloqueos.irAPagina($event)\" />\r\n        }\r\n      }\r\n    }\r\n  </section>\r\n\r\n  <section class=\"commission-section admin-module\" [hidden]=\"activeSection() !== 'comision'\" aria-label=\"Configuraci\u00F3n de comisi\u00F3n\">\r\n    @if (comisionCargando()) {\r\n      <p role=\"status\">Cargando comisi\u00F3n\u2026</p>\r\n    } @else if (comisionError()) {\r\n      <p class=\"alert alert--error\" role=\"alert\">No se pudo cargar la comisi\u00F3n: {{ comisionError() }}</p>\r\n      <button type=\"button\" class=\"button button--ghost\" (click)=\"cargarComision()\">Reintentar</button>\r\n    } @else if (comisionActual !== null) {\r\n      <div class=\"commission-grid\">\r\n        <div class=\"commission-current\">\r\n          <div class=\"commission-current__icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m12 2 10 5-10 5L2 7l10-5Z\"/><path d=\"m2 12 10 5 10-5M2 17l10 5 10-5\"/></svg></div>\r\n          <span>Porcentaje actual</span>\r\n          <strong>{{ comisionActual }}<span> %</span></strong>\r\n        </div>\r\n        <form class=\"commission-form\" (ngSubmit)=\"guardarComision()\">\r\n          <h2><span class=\"commission-form__icon\" aria-hidden=\"true\">%</span> Cambiar comisi\u00F3n</h2>\r\n          <p class=\"commission-info\"><span aria-hidden=\"true\">\u24D8</span> El porcentaje se aplica a nuevas reservas y no modifica las anteriores.</p>\r\n          <label for=\"comision-depa\">Nuevo porcentaje</label>\r\n          <div class=\"commission-input\"><input id=\"comision-depa\" type=\"number\" name=\"comision\" min=\"0\" max=\"100\" step=\"0.01\" [(ngModel)]=\"comisionNueva\" required /><span aria-hidden=\"true\">%</span></div>\r\n          <button class=\"commission-save\" type=\"submit\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 3h14l3 3v15H3V3h1Z\"/><path d=\"M7 3v6h10V3M7 21v-8h10v8\"/></svg>Guardar comisi\u00F3n</button>\r\n        </form>\r\n      </div>\r\n    }\r\n  </section>\r\n  <section class=\"panel management admin-module\" [hidden]=\"activeSection() !== 'catalogos'\">\r\n    <div class=\"panel__title\">\r\n      <div>\r\n        <h2>Cat\u00E1logos</h2>\r\n        <p>Consulta de las opciones del sistema. Se cargan por seed o migraci\u00F3n.</p>\r\n      </div>\r\n    </div>\r\n    <div class=\"catalog-grid\">\r\n      @for (section of catalogs(); track section.key) {\r\n        <article class=\"catalog-card\">\r\n          <h3>{{ section.label }}</h3>\r\n          <ul class=\"crud-list\">\r\n            @for (item of section.items; track item.id) {\r\n              <li><span>{{ item.nombre }}</span></li>\r\n            } @empty {\r\n              <li class=\"empty-row\">Sin elementos</li>\r\n            }\r\n          </ul>\r\n        </article>\r\n      }\r\n    </div>\r\n  </section>\r\n\r\n  <section class=\"panel management admin-module\" [hidden]=\"activeSection() !== 'ubicaciones'\">\r\n    <div class=\"panel__title\">\r\n      <div>\r\n        <h2>Ubicaciones</h2>\r\n        <p>Consulta de provincias y ciudades cargadas por seed o migraci\u00F3n.</p>\r\n      </div>\r\n    </div>\r\n    <div class=\"location-grid\">\r\n      <article class=\"catalog-card\">\r\n        <h3>Provincias</h3>\r\n        <ul class=\"crud-list\">\r\n          @for (item of provinces(); track item.id) {\r\n            <li [class.selected]=\"selectedProvince() === item.id\">\r\n              <button class=\"location-name\" type=\"button\" (click)=\"selectProvince(item.id)\">{{ item.nombre }}</button>\r\n            </li>\r\n          } @empty {\r\n            <li class=\"empty-row\">Sin provincias</li>\r\n          }\r\n        </ul>\r\n      </article>\r\n      <article class=\"catalog-card\">\r\n        <h3>Ciudades</h3>\r\n        <ul class=\"crud-list\">\r\n          @for (item of cities(); track item.id) {\r\n            <li><span>{{ item.nombre }}</span></li>\r\n          } @empty {\r\n            <li class=\"empty-row\">{{ selectedProvince() ? 'Sin ciudades' : 'Seleccion\u00E1 una provincia' }}</li>\r\n          }\r\n        </ul>\r\n      </article>\r\n    </div>\r\n  </section>\r\n    </div>\r\n  </div>\r\n</section>\r\n", styles: ["@use '../../shared/components/claim-history/claim-form';\r\n@use './admin-shared';\r\n\r\n:host {\r\n  display: block;\r\n  background: #f4f6f8;\r\n  color: #102a3a;\r\n  min-height: calc(100dvh - 70px);\r\n}\r\n\r\n.block-dialog {\r\n  position: fixed;\r\n  inset: 0;\r\n  box-sizing: border-box;\r\n  width: min(520px, calc(100% - 32px));\r\n  max-height: calc(100dvh - 32px);\r\n  margin: auto;\r\n  padding: 24px;\r\n  border: 1px solid #dfe6ea;\r\n  border-radius: 14px;\r\n  background: #fff;\r\n  color: inherit;\r\n  box-shadow: 0 18px 45px rgb(15 23 42 / 25%);\r\n}\r\n.block-dialog::backdrop { background: rgb(16 42 58 / 55%); }\r\n.block-form { display: grid; gap: 12px; color: #172b4b; }\r\n.block-form h2, .block-form p, .blocked-user h3, .blocked-user p { margin: 0; }\r\n.block-form__header { display: flex; align-items: center; gap: 14px; margin-bottom: 4px; }\r\n.block-form__icon { display: grid; flex: none; place-items: center; width: 46px; height: 46px; border-radius: 10px; background: #fff0e6; color: #f47720; }\r\n.block-form__title { min-width: 0; padding-left: 13px; border-left: 2px solid #f47720; }\r\n.block-form__title h2 { color: #142743; font-size: 1.25rem; font-weight: 800; line-height: 1.2; }\r\n.block-form__title p { margin-top: 4px; color: #49617d; font-size: .85rem; overflow-wrap: anywhere; }\r\n.block-form__notice { display: flex; align-items: center; gap: 11px; padding: 10px 11px; border-radius: 9px; font-size: .85rem; line-height: 1.35; }\r\n.block-form__notice--info { background: #f0f4fa; }\r\n.block-form__notice--warning { background: #fff5ed; }\r\n.block-form__notice-icon { display: grid; flex: none; place-items: center; width: 34px; height: 34px; border-radius: 7px; }\r\n.block-form__notice--info .block-form__notice-icon { background: #e0eaf8; color: #24538a; }\r\n.block-form__notice--warning .block-form__notice-icon { background: #ffeadb; color: #f47720; }\r\n.block-form__notice p { padding-left: 11px; border-left: 2px solid #a9c8ef; }\r\n.block-form__notice--warning p { border-left-color: #ff9a55; }\r\n.block-form label { margin-top: 3px; font-weight: 700; font-size: .9rem; }\r\n.block-form textarea { box-sizing: border-box; width: 100%; min-height: 110px; padding: 10px 12px; border: 1px solid #d7e0e9; border-radius: 8px; color: #172b4b; font: inherit; font-size: .9rem; resize: vertical; }\r\n.block-form textarea::placeholder { color: #8a9aab; }\r\n.block-form textarea:focus-visible { outline: 2px solid #5686e4; outline-offset: 2px; }\r\n.block-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }\r\n.block-actions .button--ghost { background: #e9edf2; color: #253d5a; border: 1px solid transparent; }\r\n.block-actions .button--danger-outline { background: #fff5f4; color: #b83232; border: 1px solid #ed9b96; }\r\n.cancellation-approval-dialog {\r\n  position: fixed;\r\n  inset: 0;\r\n  box-sizing: border-box;\r\n  padding: clamp(16px, 4vw, 24px);\r\n  box-shadow: 0 20px 48px #0f172a40;\r\n}\r\n.cancellation-approval-icon {\r\n  display: grid;\r\n  place-items: center;\r\n  width: 48px;\r\n  height: 48px;\r\n  border-radius: 12px;\r\n  background: #e6f6ee;\r\n  color: #146c43;\r\n}\r\n.cancellation-approval-dialog h2 { font-size: 1.35rem; font-weight: 700; }\r\n.cancellation-refund { color: #146c43; overflow-wrap: anywhere; }\r\n.cancellation-refund--summary { padding: 12px; border-radius: 8px; background: #e6f6ee; }\r\n.cancellation-refund--summary strong { display: block; margin-block: 4px; font-size: 1.25rem; }\r\n.cancellation-approval-dialog textarea:focus-visible { outline: 2px solid #146c43; outline-offset: 2px; }\r\n.advertiser-payment-dialog {\r\n  width: min(540px, calc(100% - 32px));\r\n  border-top: 4px solid var(--color-primary, #f47818);\r\n  color: #172b45;\r\n}\r\n.advertiser-payment__header { display: flex; align-items: center; gap: 16px; margin-bottom: 4px; }\r\n.advertiser-payment__header > div:last-child { min-width: 0; padding-left: 16px; border-left: 1px solid #dce3e8; }\r\n.advertiser-payment__header .cancellation-approval-icon { flex: none; }\r\n.advertiser-payment__header .refund-meta { margin-top: 4px; font-size: .9rem; overflow-wrap: anywhere; }\r\n.advertiser-payment__summary { padding: 4px; border: 1px solid #dfe5e8; border-radius: 9px; background: #f4f6f8; }\r\n.advertiser-payment__row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; padding: 8px 10px; }\r\n.advertiser-payment__row span, .advertiser-payment__row strong:last-child { text-align: right; }\r\n.advertiser-payment__commission { padding: 8px 10px; border-top: 1px solid #e0e6e9; color: #52636c; font-size: .88rem; }\r\n.advertiser-payment__commission strong { color: #172b45; }\r\n.advertiser-payment__net { border-radius: 7px; background: #e1f3e7; color: #146c43; font-size: 1.05rem; }\r\n.advertiser-payment-dialog .refund-help { padding-left: 12px; border-left: 3px solid var(--color-primary, #f47818); font-size: .88rem; line-height: 1.45; }\r\n.advertiser-payment__alert { padding: 10px 12px; border-radius: 8px; background: #ffeded; font-size: .9rem; font-weight: 650; }\r\n.advertiser-payment__net app-dato-copiable { justify-content: flex-end; font-weight: 700; }\r\n/* Datos para transferir al anunciante, con el CBU en bloques y bot\u00F3n de copiar. */\r\n.transfer-data { display: grid; gap: 6px; padding: 10px 12px; border: 1px solid #b7dcc5; border-radius: 8px; background: #f3faf6; }\r\n.transfer-data h3 { margin: 0; color: #146c43; font-size: .95rem; }\r\n.transfer-data p { margin: 0; }\r\n.transfer-data__label { color: #52636c; font-size: .82rem; }\r\n.transfer-data__owner { color: #172b45; font-size: .88rem; overflow-wrap: anywhere; }\r\n.advertiser-payment-dialog label { margin-bottom: -7px; font-size: .9rem; }\r\n.advertiser-payment-dialog input, .advertiser-payment-dialog textarea { box-sizing: border-box; width: 100%; padding: 10px 12px; border: 1px solid #cbd5dc; border-radius: 8px; background: #fff; color: #172b45; font: inherit; }\r\n.advertiser-payment-dialog input:focus-visible, .advertiser-payment-dialog textarea:focus-visible { outline: 2px solid #146c43; outline-offset: 2px; }\r\n.advertiser-payment-dialog .block-actions { margin-top: 4px; }\r\n@media (max-width: 480px) {\r\n  .advertiser-payment__header { align-items: flex-start; gap: 10px; }\r\n  .advertiser-payment__header > div:last-child { padding-left: 10px; }\r\n  .advertiser-payment-dialog h2 { font-size: 1.15rem; }\r\n  .advertiser-payment__row { flex-wrap: wrap; }\r\n  .advertiser-payment-dialog .block-actions .button { flex: 1; }\r\n}\r\n.appeals-panel { color: #122441; }\r\n.appeals-panel__title { position: relative; padding-left: 32px; }\r\n.appeals-panel__title::before { position: absolute; left: 20px; top: 24px; width: 4px; height: 26px; border-radius: 4px; background: #ff8900; content: ''; }\r\n.appeals-tabs { display: flex; gap: 6px; padding: 12px 16px 0; }\r\n.appeals-tabs button { padding: 9px 14px; border: 0; border-radius: 7px; background: #f1f4f9; color: #52617a; font: inherit; font-size: .84rem; font-weight: 700; cursor: pointer; }\r\n.appeals-tabs button.active { background: #e7efff; color: #174ac4; }\r\n.appeals-tabs button:focus-visible { outline: 2px solid #5276ff; outline-offset: 2px; }\r\n.blocked-users { display: grid; gap: 14px; padding: 16px; }\r\n.blocked-user { min-width: 0; overflow: hidden; border: 1px solid #d7e0ee; border-radius: 10px; background: #fff; }\r\n.blocked-user p { margin: 0; overflow-wrap: anywhere; }\r\n.blocked-user__header { display: flex; align-items: center; gap: 16px; padding: 14px 18px; background: #f3f6fb; }\r\n.blocked-user__avatar { display: grid; flex: none; place-items: center; width: 48px; height: 48px; border-radius: 50%; background: #ffe9dc; color: #153154; }\r\n.blocked-user__identity { min-width: 0; flex: 1; padding-left: 16px; border-left: 1px solid #c6d2e2; }\r\n.blocked-user__identity h3 { margin: 0; font-size: 1rem; line-height: 1.25; overflow-wrap: anywhere; }\r\n.blocked-user__identity p { margin-top: 3px; font-size: .82rem; }\r\n.blocked-user__status { display: inline-flex; flex: none; align-items: center; gap: 6px; padding: 5px 10px; border: 1px solid #ffe0ba; border-radius: 99px; background: #fff3df; color: #ed7100; font-size: .78rem; font-weight: 700; }\r\n.blocked-user__status--closed { border-color: #cbe9d6; background: #eaf8ef; color: #28734b; }\r\n.blocked-user__history-date { margin: 0 18px 14px !important; color: #687991; font-size: .82rem; }\r\n.blocked-user__details { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0; padding: 18px; }\r\n.blocked-user__details > div { display: flex; align-items: center; gap: 12px; min-width: 0; padding: 0 18px; }\r\n.blocked-user__details > div:first-child { padding-left: 0; }\r\n.blocked-user__details > div + div { border-left: 1px solid #d6dfed; }\r\n.blocked-user__details svg { flex: none; color: #78889e; }\r\n.blocked-user__details p { font-size: .88rem; white-space: pre-wrap; }\r\n.blocked-user__details strong { display: block; margin-bottom: 4px; color: #687991; font-size: .66rem; font-weight: 700; text-transform: uppercase; }\r\n.blocked-user__notice { margin: 0 18px !important; padding: 12px 0; border-top: 1px solid #e8edf4; color: #687991; font-size: .82rem; }\r\n.blocked-user__conversation { margin: 0 14px 14px; --conversation-height: 230px; }\r\n.blocked-user__unblock { flex: none; padding: 9px 12px; border: 1px solid #b9d8c7; border-radius: 8px; background: #edf9f1; color: #17683c; font: inherit; font-size: .82rem; font-weight: 700; cursor: pointer; }\r\n.blocked-user__unblock:hover:not(:disabled) { background: #dbf3e3; }\r\n.blocked-user__unblock:disabled { opacity: .55; cursor: default; }\r\n.blocked-user__unblock:focus-visible { outline: 2px solid #17683c; outline-offset: 2px; }\r\n@media (max-width: 620px) {\r\n  .blocked-user__header { flex-wrap: wrap; gap: 10px; }\r\n  .blocked-user__identity { padding-left: 10px; }\r\n  .blocked-user__status { margin-left: 58px; }\r\n  .blocked-user__details { grid-template-columns: 1fr; gap: 14px; }\r\n  .blocked-user__details > div { padding: 0; }\r\n  .blocked-user__details > div + div { border-left: 0; }\r\n}\r\n\r\n.management {\r\n  overflow: visible;\r\n}\r\n// Se mantiene el recorte que antes aplicaba .panel por orden de cascada.\r\n.panel.management {\r\n  overflow: hidden;\r\n}\r\n.catalog-grid {\r\n  display: grid;\r\n  grid-template-columns: repeat(3, minmax(0, 1fr));\r\n  gap: 18px;\r\n  padding: 22px;\r\n}\r\n.location-grid {\r\n  display: grid;\r\n  grid-template-columns: 1fr 1fr;\r\n  gap: 18px;\r\n  padding: 22px;\r\n}\r\n.catalog-card {\r\n  min-width: 0;\r\n  padding: 18px;\r\n  border: 1px solid #dfe6ea;\r\n  border-radius: 12px;\r\n  background: #fff;\r\n}\r\n.catalog-card h3 {\r\n  margin: 0 0 14px;\r\n  font-size: 1rem;\r\n}\r\n.button--primary {\r\n  background: #e14414;\r\n  color: white;\r\n}\r\n.crud-list {\r\n  max-height: 260px;\r\n  overflow: auto;\r\n  list-style: none;\r\n  margin: 0;\r\n  padding: 0;\r\n  border-top: 1px solid #edf0f2;\r\n}\r\n.crud-list li {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  min-height: 45px;\r\n  padding: 8px 3px;\r\n  border-bottom: 1px solid #edf0f2;\r\n  font-size: 0.88rem;\r\n}\r\n.crud-list li > span:first-child {\r\n  min-width: 0;\r\n  overflow-wrap: anywhere;\r\n}\r\n.location-name {\r\n  min-width: 0;\r\n  padding: 0;\r\n  overflow-wrap: anywhere;\r\n  border: 0;\r\n  background: transparent;\r\n  color: #102a3a;\r\n  font: inherit;\r\n  text-align: left;\r\n  cursor: pointer;\r\n}\r\n.crud-list .selected {\r\n  margin: 0 -3px;\r\n  padding-inline: 8px;\r\n  border-radius: 7px;\r\n  background: #edf3ff;\r\n}\r\n.empty-row {\r\n  justify-content: center;\r\n  color: #71818a;\r\n}\r\n@media (max-width: 1000px) {\r\n  .catalog-grid {\r\n    grid-template-columns: repeat(2, minmax(0, 1fr));\r\n  }\r\n}\r\n@media (max-width: 700px) {\r\n  .catalog-grid,\r\n  .location-grid {\r\n    grid-template-columns: 1fr;\r\n    padding: 14px;\r\n  }\r\n}\r\n.link-button:disabled {\r\n  opacity: 0.5;\r\n  cursor: wait;\r\n}\r\n.button--light {\r\n  background: white;\r\n  color: #102a3a;\r\n}\r\n.counter {\r\n  padding: 5px 11px;\r\n  border-radius: 99px;\r\n  color: #a12d0b;\r\n  background: #fff0e9;\r\n  font-weight: 800;\r\n}\r\n.requests {\r\n  display: grid;\r\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\r\n  gap: 18px;\r\n  padding: 22px;\r\n}\r\n.request {\r\n  padding: 18px;\r\n  border: 1px solid #dfe6ea;\r\n  border-radius: 12px;\r\n}\r\n.request__identity {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 12px;\r\n}\r\n.avatar {\r\n  display: grid;\r\n  place-items: center;\r\n  width: 42px;\r\n  height: 42px;\r\n  border-radius: 50%;\r\n  background: #fff0e9;\r\n  color: #d84011;\r\n  font-weight: 850;\r\n}\r\n.request h3 {\r\n  margin: 0;\r\n  font-size: 1rem;\r\n}\r\n.request p {\r\n  margin: 4px 0 0;\r\n  color: #71818a;\r\n  font-size: 0.85rem;\r\n}\r\ndl {\r\n  display: grid;\r\n  grid-template-columns: 1fr 1fr;\r\n  gap: 8px;\r\n  margin: 18px 0;\r\n}\r\ndl div {\r\n  padding: 9px;\r\n  border-radius: 8px;\r\n  background: #f5f7f8;\r\n}\r\ndt {\r\n  color: #71818a;\r\n  font-size: 0.72rem;\r\n  text-transform: uppercase;\r\n}\r\ndd {\r\n  margin: 3px 0 0;\r\n  font-weight: 700;\r\n}\r\n.documents {\r\n  display: flex;\r\n  flex-wrap: wrap;\r\n  gap: 8px;\r\n}\r\n.documents a {\r\n  padding: 7px 10px;\r\n  border-radius: 7px;\r\n  color: #124aa6;\r\n  background: #edf3ff;\r\n  font-size: 0.8rem;\r\n  font-weight: 700;\r\n  text-decoration: none;\r\n}\r\n.documents .document-preview {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 7px;\r\n  padding: 4px 8px 4px 4px;\r\n}\r\n.document-preview img,\r\n.document-preview video {\r\n  width: 54px;\r\n  height: 42px;\r\n  object-fit: cover;\r\n  border-radius: 5px;\r\n  background: #dfe6ea;\r\n}\r\n.actions {\r\n  display: flex;\r\n  justify-content: end;\r\n  gap: 9px;\r\n  margin-top: 18px;\r\n}\r\n.settlement-history-caption {\r\n  text-align: left;\r\n}\r\n.settlement-history td {\r\n  vertical-align: top;\r\n  overflow-wrap: anywhere;\r\n}\r\n.settlement-history {\r\n  padding: 0 12px 12px;\r\n  color: #142441;\r\n}\r\n.settlement-history-caption {\r\n  padding: 20px 8px;\r\n  font-size: 1.05rem;\r\n  font-weight: 750;\r\n}\r\n.settlement-history__table { table-layout: fixed; }\r\n.settlement-history__table th {\r\n  padding: 12px 10px;\r\n  background: #edf2f7;\r\n  color: #62738d;\r\n  font-size: .68rem;\r\n  letter-spacing: 0;\r\n}\r\n.settlement-history__table th:first-child { width: 13%; border-radius: 8px 0 0 8px; }\r\n.settlement-history__table th:nth-child(2) { width: 18%; }\r\n.settlement-history__table th:nth-child(3) { width: 14%; }\r\n.settlement-history__table th:nth-child(4) { width: 13%; }\r\n.settlement-history__table th:nth-child(5) { width: 26%; }\r\n.settlement-history__table th:last-child { width: 16%; border-radius: 0 8px 8px 0; }\r\n.settlement-history__table td { padding: 16px 10px; font-size: .82rem; line-height: 1.35; }\r\n.settlement-history__table tbody tr:last-child td { border-bottom: 0; }\r\n.settlement-history__date { display: flex; align-items: center; gap: 7px; white-space: nowrap; }\r\n.settlement-history__date svg { flex: none; color: #8295ae; }\r\n.settlement-history__time { margin-top: 5px; color: #74849a; }\r\n.settlement-history__reservation { display: inline-block; padding: 3px 8px; border-radius: 6px; background: #fff0e3; color: #f17800; font-size: .9rem; font-weight: 750; }\r\n.settlement-history__publication { display: block; margin-top: 5px; }\r\n.settlement-history__amount { font-weight: 750; white-space: nowrap; }\r\n.settlement-history .settlement-note { margin: 5px 0 0; padding: 6px 9px; background: #fff2df; white-space: pre-wrap; }\r\n@media (max-width: 800px) {\r\n  .settlement-history__table, .settlement-history__table tbody, .settlement-history__table tr, .settlement-history__table td { display: block; width: 100%; }\r\n  .settlement-history__table thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }\r\n  .settlement-history__table tr { padding: 14px 8px; border-bottom: 1px solid #edf0f2; }\r\n  .settlement-history__table tr:last-child { border-bottom: 0; }\r\n  .settlement-history__table td { padding: 6px 0; border: 0; }\r\n  .settlement-history__table td::before { content: attr(data-label); display: block; margin-bottom: 4px; color: #62738d; font-size: .68rem; font-weight: 700; text-transform: uppercase; }\r\n}\r\n.link-button {\r\n  border: 0;\r\n  background: transparent;\r\n  color: #b12d19;\r\n  font-weight: 750;\r\n  cursor: pointer;\r\n}\r\n\r\n@media (max-width: 700px) {\r\n  .responsive-table .link-button { min-height: 44px; padding-inline: 12px; }\r\n  .request, .settlement-card, .catalog-card { overflow-wrap: anywhere; }\r\n  .requests { grid-template-columns: minmax(0, 1fr); }\r\n}\r\n// Barra de b\u00FAsqueda y filtros, y paginador de cada lista.\r\n.admin-filtros { padding: 18px 24px 0; }\r\n.admin-paginador { display: block; padding: 0 24px 24px; }\r\n@media (max-width: 700px) {\r\n  .admin-filtros { padding: 14px 14px 0; }\r\n  .admin-paginador { padding: 0 14px 14px; }\r\n}\r\n.settlement-list {\r\n  display: grid;\r\n  gap: 14px;\r\n  padding: 20px 24px 24px;\r\n}\r\n.refund-action {\r\n  margin: 0 24px;\r\n  padding: 10px 14px;\r\n  border-radius: 9px;\r\n  color: #9e2020;\r\n  background: #ffeded;\r\n  font-size: 0.88rem;\r\n  font-weight: 700;\r\n}\r\n.refund-note {\r\n  margin: 0 24px;\r\n  color: #71818a;\r\n  font-size: 0.85rem;\r\n}\r\n.settlement-card {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: 20px;\r\n  padding: 18px;\r\n  border: 1px solid #e3e9ec;\r\n  border-radius: 10px;\r\n  background: #fff;\r\n}\r\n.settlement-card h3 { margin: 10px 0 7px; }\r\n.settlement-card p { margin: 4px 0; color: #52636c; }\r\n.settlement-card .actions { display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }\r\n.settlement-payment-unavailable { position: relative; display: inline-flex; cursor: not-allowed; }\r\n.settlement-payment-unavailable > button:disabled { pointer-events: none; cursor: not-allowed; }\r\n.settlement-payment-unavailable:focus-visible { outline: 2px solid var(--color-secondary); outline-offset: 3px; border-radius: 9px; }\r\n.settlement-payment-unavailable__tooltip { position: absolute; z-index: 2; right: 0; bottom: calc(100% + 8px); width: max-content; max-width: min(280px, 75vw); padding: 9px 12px; border-radius: 8px; background: #172b45; color: #fff; font-size: .8rem; line-height: 1.4; text-align: left; box-shadow: 0 4px 12px #102a3a33; visibility: hidden; opacity: 0; pointer-events: none; }\r\n.settlement-payment-unavailable:hover .settlement-payment-unavailable__tooltip, .settlement-payment-unavailable:focus .settlement-payment-unavailable__tooltip { visibility: visible; opacity: 1; }\r\n.claim-card {\r\n  border-color: #dce4ef;\r\n  color: #101d36;\r\n}\r\n.claim-card > .actions { margin-top: 0; }\r\n.claim-card .button--ghost { border: 1px solid #10233f; color: #10233f; }\r\n.button--resolve-claim { background: #081b38; color: #fff; }\r\n.settlement-note { max-width: 700px; padding: 9px 11px; border-radius: 7px; background: #fff7e8; }.alert {\r\n  margin: 18px 0;\r\n  padding: 12px 16px;\r\n  border-radius: 9px;\r\n}\r\n.alert--error {\r\n  color: #9e2020;\r\n  background: #ffeded;\r\n}\r\n@media (max-width: 700px) {\r\n  .requests {\r\n    grid-template-columns: 1fr;\r\n    padding: 14px;\r\n  }\r\n  .settlement-card { align-items: stretch; flex-direction: column; }\r\n  .settlement-card .actions { justify-content: stretch; }\r\n  .settlement-card .actions .button { flex: 1; }\r\n  .settlement-payment-unavailable { flex: 1; }\r\n}\r\n\r\n.refund-dialog { box-sizing: border-box; width: min(640px, calc(100% - 32px)); overflow-wrap: anywhere; }\r\n.refund-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: .75rem; }\r\n.refund-meta, .refund-data dt, .refund-help { color: #52636c; }\r\n.refund-amount { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; padding: .85rem; border-radius: 10px; background: #edf5f1; }\r\n.refund-amount__value { font-size: 1.25rem; font-weight: 700; }\r\n.refund-amount .status { margin-left: auto; }\r\n/* El detalle del reembolso sigue la estructura del pago al anunciante. */\r\n.refund-dialog .block-form { gap: 12px; }\r\n.refund-heading .advertiser-payment__header { margin-bottom: 0; }\r\n.refund-help--accent { margin: 0; padding-left: 12px; border-left: 3px solid var(--color-primary, #f47818); font-size: .88rem; line-height: 1.45; }\r\n.refund-chat { border: 1px solid #dfe5e8; border-radius: 8px; padding: 0 12px; }\r\n.refund-chat[open] { padding-bottom: 12px; }\r\n.refund-chat summary { padding: 10px 0; color: #172b45; font-weight: 650; cursor: pointer; }\r\n.refund-dialog label .muted { font-weight: 400; }\r\n.settlement-history__reference { margin: 4px 0 0; }\r\n.refund-data { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .65rem 1rem; margin: 0; }\r\n.refund-data dt { font-size: .85rem; }\r\n.refund-data dd { margin: .2rem 0 0; font-weight: 650; }\r\n.refund-reason { grid-column: 1 / -1; padding: .75rem; border-radius: 8px; background: #f4f6f8; }\r\n.refund-reason dd { white-space: pre-wrap; }\r\n.refund-dialog input, .refund-dialog textarea { box-sizing: border-box; width: 100%; padding: .65rem .75rem; border: 1px solid #9baab4; border-radius: 8px; font: inherit; }\r\n.refund-error { color: #a12525; }\r\n", ".admin {\r\n  display: grid;\r\n  grid-template-columns: 246px minmax(0, 1fr);\r\n  max-width: 1640px;\r\n  margin: auto;\r\n  min-height: calc(100dvh - 70px);\r\n  background: var(--color-bg);\r\n}\r\n.admin-sidebar {\r\n  background: #fff;\r\n  border-inline-end: 1px solid var(--color-border);\r\n  padding: 24px 14px;\r\n}\r\n.admin-brand {\r\n  display: grid;\r\n  gap: 3px;\r\n  justify-items: start;\r\n  padding: 0 12px 20px;\r\n  font-weight: 750;\r\n  font-size: 1.15rem;\r\n  color: inherit;\r\n  text-decoration: none;\r\n  border-radius: 8px;\r\n}\r\n.admin-brand:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 4px; }\r\n.admin-brand img { width: 128px; height: auto; }\r\n.admin-nav { display: grid; gap: 10px; }\r\n.admin-nav-group {\r\n  display: grid;\r\n  gap: 2px;\r\n  padding-top: 10px;\r\n  border-top: 1px solid var(--color-border);\r\n}\r\n.admin-nav-group h2 {\r\n  margin: 0;\r\n  padding: 0 12px 4px;\r\n  color: var(--color-text-muted);\r\n  font-size: .82rem;\r\n  font-weight: 750;\r\n}\r\n.admin-nav button {\r\n  display: flex;\r\n  gap: 10px;\r\n  align-items: center;\r\n  min-height: 40px;\r\n  padding: 8px 12px;\r\n  border-radius: 8px;\r\n  text-align: start;\r\n  cursor: pointer;\r\n}\r\n.admin-nav button:hover { background: var(--color-bg); }\r\n.admin-nav button[aria-current] {\r\n  background: var(--color-primary-light);\r\n  color: var(--color-primary-dark);\r\n  font-weight: 750;\r\n}\r\n.admin-section-picker { display: none; }\r\n.admin-workspace { min-width: 0; }\r\n.admin-topbar {\r\n  display: flex;\r\n  justify-content: space-between;\r\n  align-items: center;\r\n  gap: 12px;\r\n  min-height: 58px;\r\n  padding: 10px clamp(16px, 2.5vw, 32px);\r\n  border-bottom: 1px solid var(--color-border);\r\n  background: #fff;\r\n  color: var(--color-text-muted);\r\n  font-size: .9rem;\r\n}\r\n.admin-topbar p { margin: 0; }\r\n.admin-topbar strong { color: #102a3a; }\r\n.admin-topbar span { display: flex; align-items: center; gap: 8px; }\r\n.admin-content { padding: 28px clamp(16px, 2.5vw, 32px) 48px; }\r\n.admin [hidden] { display: none; }\r\n#admin-section-title, .admin-module article[id] { scroll-margin-top: 88px; }\r\n.admin-module article[id]:focus { outline: 2px solid var(--color-secondary); outline-offset: 2px; }\r\n.admin button:focus-visible, .admin-section-picker select:focus-visible {\r\n  outline: 2px solid var(--color-secondary);\r\n  outline-offset: 2px;\r\n}\r\n.admin__header {\r\n  display: flex;\r\n  justify-content: space-between;\r\n  align-items: center;\r\n  gap: 16px;\r\n  margin-bottom: 20px;\r\n}\r\n.admin__header h1 {\r\n  margin: 0;\r\n  font-size: clamp(1.65rem, 3.2vw, 2.9rem);\r\n  font-weight: 800;\r\n  letter-spacing: -.035em;\r\n}\r\n\r\n.admin-section-description {\r\n  margin: 6px 0 0;\r\n  color: #526773;\r\n  line-height: 1.5;\r\n}\r\n\r\n.dashboard-button {\r\n  border: 1px solid var(--color-secondary);\r\n  background: #fff;\r\n  color: var(--color-secondary);\r\n}\r\n.dashboard-button:hover:not(:disabled) { background: var(--color-secondary-light); }\r\n.dashboard-metrics {\r\n  display: grid;\r\n  grid-template-columns: repeat(4, minmax(0, 1fr));\r\n  gap: 14px;\r\n  margin: 20px 0;\r\n}\r\n.dashboard-metric {\r\n  display: flex;\r\n  align-items: start;\r\n  gap: 12px;\r\n  padding: 18px;\r\n  border: 1px solid var(--color-border);\r\n  border-radius: 14px;\r\n  background: #fff;\r\n  color: var(--color-secondary);\r\n  text-align: start;\r\n  cursor: pointer;\r\n}\r\n.dashboard-metric:hover, .dashboard-shortcuts button:hover { border-color: var(--color-secondary); }\r\n.dashboard-metric svg { flex-shrink: 0; }\r\n.dashboard-metric span { color: #102a3a; font-weight: 700; line-height: 1.25; }\r\n.dashboard-metric strong { display: block; margin-top: 7px; font-size: 2rem; color: var(--color-secondary); }\r\n.metric-cancellation, .metric-cancellation strong { color: var(--color-primary-dark); }\r\n.metric-refund, .metric-refund strong { color: #9a5300; }\r\n.metric-settlement, .metric-settlement strong { color: #146c43; }\r\n.metric-appeal, .metric-appeal strong { color: #6b3fa0; }\r\n.dashboard-columns {\r\n  display: grid;\r\n  grid-template-columns: minmax(0, 1.8fr) minmax(0, 1fr);\r\n  align-items: start;\r\n  gap: 16px;\r\n}\r\n.dashboard-card {\r\n  min-width: 0;\r\n  padding: 18px;\r\n  border: 1px solid var(--color-border);\r\n  border-radius: 14px;\r\n  background: #fff;\r\n}\r\n.dashboard-card h2 { margin: 0 0 14px; font-size: 1.25rem; font-weight: 800; }\r\n.dashboard-card > p { margin: 0; color: var(--color-text-muted); }\r\n.dashboard-table { overflow-x: auto; }\r\n.dashboard-table :is(th, td) { padding: 9px 10px; white-space: nowrap; }\r\n.dashboard-table tbody tr:last-child td { border-bottom: 0; }\r\n.dashboard-table .button { padding: 6px 10px; }\r\n.dashboard-status {\r\n  display: inline-block;\r\n  padding: 4px 8px;\r\n  border-radius: 7px;\r\n  background: var(--color-primary-light);\r\n  color: var(--color-primary-dark);\r\n  font-size: .84rem;\r\n  font-weight: 750;\r\n}\r\n.dashboard-status[data-tone='review'] { background: var(--color-secondary-light); color: var(--color-secondary-dark); }\r\n.dashboard-status[data-tone='refund'] { background: #fff2da; color: #784200; }\r\n.dashboard-status[data-tone='payment'] { background: #e6f6ee; color: #146c43; }\r\n.dashboard-status[data-tone='appeal'] { background: #f1eafa; color: #5b3289; }\r\n.dashboard-more { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 12px; color: var(--color-text-muted); font-size: .88rem; }\r\n.dashboard-more span { margin-right: auto; }\r\n.dashboard-shortcuts { display: grid; gap: 9px; }\r\n.dashboard-shortcuts h2 { margin-bottom: 5px; }\r\n.dashboard-shortcuts button {\r\n  display: flex;\r\n  justify-content: space-between;\r\n  align-items: center;\r\n  gap: 12px;\r\n  min-height: 48px;\r\n  padding: 10px 12px;\r\n  border: 1px solid var(--color-border);\r\n  border-radius: 9px;\r\n  font-weight: 700;\r\n  text-align: start;\r\n  cursor: pointer;\r\n}\r\n.dashboard-shortcuts svg { flex-shrink: 0; color: var(--color-secondary); }\r\n\r\n@media (max-width: 1260px) {\r\n  .dashboard-columns { grid-template-columns: minmax(0, 1fr); }\r\n  .dashboard-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }\r\n}\r\n@media (max-width: 900px) {\r\n  .admin { grid-template-columns: minmax(0, 1fr); }\r\n  .admin-sidebar {\r\n    display: flex;\r\n    justify-content: space-between;\r\n    align-items: center;\r\n    flex-wrap: wrap;\r\n    gap: 12px;\r\n    border-inline-end: 0;\r\n    border-bottom: 1px solid var(--color-border);\r\n    padding: 12px 16px;\r\n  }\r\n  .admin-brand { padding: 0; font-size: .9rem; }\r\n  .admin-brand img { width: 94px; }\r\n  .admin-nav { display: none; }\r\n  .admin-section-picker { display: grid; gap: 3px; font-size: .8rem; font-weight: 700; }\r\n  .admin-section-picker select { border: 1px solid var(--color-border); border-radius: 8px; padding: 7px; }\r\n}\r\n@media (max-width: 700px) {\r\n  .admin__header {\r\n    flex-wrap: wrap;\r\n  }\r\n  .dashboard-metric { gap: 7px; padding: 12px; flex-direction: column; }\r\n  .dashboard-metric svg { width: 22px; height: 22px; }\r\n  .dashboard-metric span { overflow-wrap: anywhere; }\r\n}\r\n\r\n.commission-grid { display: grid; grid-template-columns: minmax(190px, 0.48fr) minmax(0, 1fr); gap: 24px; }\r\n.commission-current, .commission-form { background: #fff; border: 1px solid #e7ebf0; border-radius: 12px; box-shadow: 0 5px 18px rgba(17, 39, 61, .07); }\r\n.commission-current { position: relative; min-height: 250px; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; color: #536373; font-weight: 600; }\r\n.commission-current::after { content: ''; position: absolute; height: 48px; left: -10%; right: -10%; bottom: -20px; border-radius: 50% 50% 0 0; background: #fff0e8; transform: rotate(-4deg); }\r\n.commission-current__icon { display: grid; place-items: center; width: 52px; height: 52px; margin-bottom: 14px; border-radius: 13px; color: #ed4b0b; background: #ffede4; }\r\n.commission-current__icon svg { width: 29px; height: 29px; }\r\n.commission-current strong { color: #08263f; font-size: clamp(38px, 4vw, 55px); line-height: 1.2; }\r\n.commission-form { padding: 24px; }\r\n.commission-form h2 { display: flex; align-items: center; gap: 14px; margin: 0 0 16px; font-size: 20px; color: #0b2840; }\r\n.commission-form__icon { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 8px; background: #e5f2ff; color: #1467b5; font-size: 19px; }\r\n.commission-info { display: flex; gap: 10px; margin: 0 0 20px; padding: 12px 15px; border-radius: 8px; background: #e8f3ff; color: #16538d; font-size: 14px; }\r\n.commission-info span { color: #1775c7; font-weight: 700; }\r\n.commission-form label { display: block; margin-bottom: 7px; color: #445466; font-size: 14px; font-weight: 650; }\r\n.commission-input { display: flex; overflow: hidden; border: 1px solid #cbd4de; border-radius: 8px; }\r\n.commission-input:focus-within { outline: 2px solid #327bc1; outline-offset: 2px; }\r\n.commission-input input { min-width: 0; width: 100%; border: 0; outline: 0; padding: 10px 14px; color: #102d47; font: inherit; }\r\n.commission-input > span { display: grid; place-items: center; min-width: 45px; background: #f1f3f5; color: #4e5c69; font-weight: 650; }\r\n.commission-save { display: inline-flex; align-items: center; gap: 10px; margin-top: 22px; padding: 12px 20px; border: 0; border-radius: 9px; background: #ee4a09; color: #fff; font: inherit; font-weight: 700; cursor: pointer; }\r\n.commission-save:hover { background: #d64106; }\r\n.commission-save:focus-visible { outline: 3px solid #1467b5; outline-offset: 3px; }\r\n.commission-save svg { width: 18px; height: 18px; }\r\n@media (max-width: 650px) { .commission-grid { grid-template-columns: 1fr; gap: 14px; } .commission-current { min-height: 185px; } .commission-form { padding: 20px; } }\r\n"] }]
    }], () => [], { dialogoResolucion: [{ type: i0.ViewChild, args: ['dialogoResolucion', { isSignal: true }] }], publicacionesAdmin: [{ type: i0.ViewChild, args: [i0.forwardRef(() => PublicacionesAdminComponent), { isSignal: true }] }], bloqueoDialog: [{ type: i0.ViewChild, args: ['bloqueoDialog', { isSignal: true }] }], dialogoAprobacion: [{ type: i0.ViewChild, args: ['dialogoAprobacion', { isSignal: true }] }], dialogoReembolso: [{ type: i0.ViewChild, args: ['dialogoReembolso', { isSignal: true }] }], dialogoPagoAnunciante: [{ type: i0.ViewChild, args: ['dialogoPagoAnunciante', { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AdminComponent, { className: "AdminComponent", filePath: "src/app/features/admin/admin.component.ts", lineNumber: 150 }); })();
