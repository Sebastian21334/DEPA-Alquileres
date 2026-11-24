import { ConversationPanelComponent } from '../conversation-panel/conversation-panel.component';
import { AuthService } from '../../../core/services/auth.service';
import { CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { Component, computed, effect, inject, input, output, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EMPTY, catchError, exhaustMap, timer } from 'rxjs';
import { ReservationService } from '../../services/reservation.service';
import { puedeValidarCodigo } from '../../utils/reservation-state';
import { rolEnReclamo } from '../../utils/reclamo-rol';
import { CATEGORIAS_RECLAMO, etiquetaCategoriaReclamo } from '../../utils/reclamo-categorias';
import * as i0 from "@angular/core";
const _c0 = ["*"];
const _c1 = a0 => ["/admin/reservas", a0];
const _c2 = () => ["/reserva/resultado"];
const _c3 = () => ({ desde: "reclamos" });
const _c4 = a0 => ({ reserva_id: a0 });
const _c5 = a0 => ["/admin/usuarios", a0];
const _c6 = a0 => ["/admin/publicaciones", a0];
const _forTrack0 = ($index, $item) => $item.rol;
const _forTrack1 = ($index, $item) => $item.id;
function ClaimHistoryComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 1);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Sos el ", ctx);
} }
function ClaimHistoryComponent_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 4);
    i0.ɵɵtext(1, "Ver reserva");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const idReserva_r1 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("routerLink", ctx_r1.administracion() ? i0.ɵɵpureFunction1(2, _c1, idReserva_r1) : i0.ɵɵpureFunction0(4, _c2))("queryParams", ctx_r1.administracion() ? i0.ɵɵpureFunction0(5, _c3) : i0.ɵɵpureFunction1(6, _c4, idReserva_r1));
} }
function ClaimHistoryComponent_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 5)(1, "p");
    i0.ɵɵtext(2, "Correspond\u00EDa devolver: ");
    i0.ɵɵelementStart(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "currency");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p");
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "currency");
    i0.ɵɵpipe(10, "currency");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "p");
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "currency");
    i0.ɵɵelementStart(14, "strong");
    i0.ɵɵtext(15);
    i0.ɵɵpipe(16, "currency");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const saldo_r3 = ctx;
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind3(5, 6, saldo_r3.esperado, saldo_r3.moneda, "code"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" (", saldo_r3.porcentaje, " %)");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("Ya devuelto: ", i0.ɵɵpipeBind3(9, 10, saldo_r3.devuelto, saldo_r3.moneda, "code"), " \u00B7 En gesti\u00F3n: ", i0.ɵɵpipeBind3(10, 14, saldo_r3.enGestion, saldo_r3.moneda, "code"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1("Falta recibir: ", i0.ɵɵpipeBind3(13, 18, saldo_r3.faltante, saldo_r3.moneda, "code"), " \u00B7 Disponible para completar: ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind3(16, 22, saldo_r3.importeReclamable, saldo_r3.moneda, "code"));
} }
function ClaimHistoryComponent_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 0);
    i0.ɵɵtext(1, "Importe de la reserva: ");
    i0.ɵɵelementStart(2, "strong", 12);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "currency");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const item_r4 = i0.ɵɵreadContextLet(0);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(4, 1, ctx, item_r4.reserva?.moneda_contratada || "ARS"));
} }
function ClaimHistoryComponent_Conditional_17_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext(2);
    const item_r4 = i0.ɵɵreadContextLet(0);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r4.resolucion === "REINICIAR_CODIGO" ? "A favor del anunciante: la administraci\u00F3n habilit\u00F3 nuevos intentos para cargar el c\u00F3digo." : item_r4.solicitud_cancelacion_id && item_r4.categoria !== "DEMORA_ADMINISTRATIVA" ? "No se aprob\u00F3 una devoluci\u00F3n adicional." : "A favor del anunciante: sin devoluci\u00F3n al inquilino.");
} }
function ClaimHistoryComponent_Conditional_17_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "A favor del anunciante: la administraci\u00F3n confirm\u00F3 el ingreso sin el c\u00F3digo. El pago sigue los plazos habituales.");
    i0.ɵɵelementEnd();
} }
function ClaimHistoryComponent_Conditional_17_Conditional_5_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "currency");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext(3);
    const item_r4 = i0.ɵɵreadContextLet(0);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" de ", i0.ɵɵpipeBind2(2, 1, item_r4.importe_reembolso, item_r4.devolucion_cancelacion?.moneda || item_r4.reserva?.moneda_contratada || "ARS"));
} }
function ClaimHistoryComponent_Conditional_17_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵconditionalCreate(2, ClaimHistoryComponent_Conditional_17_Conditional_5_Conditional_2_Template, 3, 4, "span");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    const item_r4 = i0.ɵɵreadContextLet(0);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" A favor del inquilino: ", item_r4.solicitud_cancelacion_id && item_r4.categoria !== "DEMORA_ADMINISTRATIVA" ? "devoluci\u00F3n del faltante" : ctx_r1.resoluciones[item_r4.resolucion].toLowerCase(), " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(item_r4.importe_reembolso ? 2 : -1);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(". ", ctx_r1.administracion() ? "La devoluci\u00F3n se gestiona en Reembolsos." : "La devoluci\u00F3n se sigue desde el detalle de la reserva.", " ");
} }
function ClaimHistoryComponent_Conditional_17_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 14)(1, "strong");
    i0.ɵɵtext(2, "Motivo de la resoluci\u00F3n:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext(2);
    const item_r4 = i0.ɵɵreadContextLet(0);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", item_r4.motivo_resolucion);
} }
function ClaimHistoryComponent_Conditional_17_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "El anunciante ya puede volver a ingresar el c\u00F3digo de alojamiento.");
    i0.ɵɵelementEnd();
} }
function ClaimHistoryComponent_Conditional_17_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 0);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "date");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext(2);
    const item_r4 = i0.ɵɵreadContextLet(0);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Resuelto el ", i0.ɵɵpipeBind2(2, 1, item_r4.resuelto_en, "dd/MM/yyyy, HH:mm"));
} }
function ClaimHistoryComponent_Conditional_17_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 16);
    i0.ɵɵlistener("click", function ClaimHistoryComponent_Conditional_17_Conditional_9_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(2); const item_r4 = i0.ɵɵreadContextLet(0); return i0.ɵɵresetView(ctx_r1.verReembolso.emit(item_r4)); });
    i0.ɵɵtext(1, "Ver reembolso");
    i0.ɵɵelementEnd();
} }
function ClaimHistoryComponent_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6)(1, "p", 13);
    i0.ɵɵtext(2, "Reclamo resuelto");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, ClaimHistoryComponent_Conditional_17_Conditional_3_Template, 2, 1, "p")(4, ClaimHistoryComponent_Conditional_17_Conditional_4_Template, 2, 0, "p")(5, ClaimHistoryComponent_Conditional_17_Conditional_5_Template, 4, 3, "p");
    i0.ɵɵconditionalCreate(6, ClaimHistoryComponent_Conditional_17_Conditional_6_Template, 4, 1, "p", 14);
    i0.ɵɵconditionalCreate(7, ClaimHistoryComponent_Conditional_17_Conditional_7_Template, 2, 0, "p");
    i0.ɵɵconditionalCreate(8, ClaimHistoryComponent_Conditional_17_Conditional_8_Template, 3, 4, "p", 0);
    i0.ɵɵconditionalCreate(9, ClaimHistoryComponent_Conditional_17_Conditional_9_Template, 2, 0, "button", 15);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    const item_r4 = i0.ɵɵreadContextLet(0);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(item_r4.resolucion === "SIN_DEVOLUCION" || item_r4.resolucion === "REINICIAR_CODIGO" ? 3 : item_r4.resolucion === "CONFIRMAR_INGRESO" ? 4 : 5);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(item_r4.motivo_resolucion ? 6 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((item_r4.resolucion === "SIN_DEVOLUCION" || item_r4.resolucion === "REINICIAR_CODIGO") && item_r4.reserva && ctx_r1.puedeValidarCodigo(item_r4.reserva) ? 7 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(item_r4.resuelto_en ? 8 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.mostrarVerReembolso() && (item_r4.resolucion === "DEVOLUCION_TOTAL" || item_r4.resolucion === "DEVOLUCION_PARCIAL") ? 9 : -1);
} }
function ClaimHistoryComponent_Conditional_18_For_2_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 20);
    i0.ɵɵtext(1, " Ver perfil ");
    i0.ɵɵelementStart(2, "span", 22);
    i0.ɵɵtext(3, "\u2192");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const usuario_r6 = ctx;
    const parte_r7 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(2, _c5, usuario_r6.id));
    i0.ɵɵattribute("aria-label", "Ver perfil de " + (ctx_r1.nombreCompleto(usuario_r6) || parte_r7.rol));
} }
function ClaimHistoryComponent_Conditional_18_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 17)(1, "span", 21);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div")(4, "p", 0);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p", 19);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(8, ClaimHistoryComponent_Conditional_18_For_2_Conditional_8_Template, 4, 4, "a", 20);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_16_0;
    const parte_r7 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵclassProp("initials--tenant", parte_r7.rol === "Inquilino");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.iniciales(parte_r7.usuario), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(parte_r7.rol);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.nombreCompleto(parte_r7.usuario) || "Sin datos");
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_16_0 = parte_r7.usuario) ? 8 : -1, tmp_16_0);
} }
function ClaimHistoryComponent_Conditional_18_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "img", 23);
    i0.ɵɵlistener("error", function ClaimHistoryComponent_Conditional_18_Conditional_4_Template_img_error_0_listener($event) { i0.ɵɵrestoreView(_r8); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.ocultarPortada($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵproperty("src", ctx, i0.ɵɵsanitizeUrl);
} }
function ClaimHistoryComponent_Conditional_18_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 20);
    i0.ɵɵtext(1, "Ver publicaci\u00F3n ");
    i0.ɵɵelementStart(2, "span", 22);
    i0.ɵɵtext(3, "\u2192");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(1, _c6, ctx));
} }
function ClaimHistoryComponent_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 7);
    i0.ɵɵrepeaterCreate(1, ClaimHistoryComponent_Conditional_18_For_2_Template, 9, 6, "div", 17, _forTrack0);
    i0.ɵɵelementStart(3, "div", 17);
    i0.ɵɵconditionalCreate(4, ClaimHistoryComponent_Conditional_18_Conditional_4_Template, 1, 1, "img", 18);
    i0.ɵɵelementStart(5, "div")(6, "p", 0);
    i0.ɵɵtext(7, "Publicaci\u00F3n de la reserva");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "p", 19);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(10, ClaimHistoryComponent_Conditional_18_Conditional_10_Template, 4, 3, "a", 20);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    let tmp_3_0;
    let tmp_5_0;
    const ctx_r1 = i0.ɵɵnextContext();
    const item_r4 = i0.ɵɵreadContextLet(0);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.participantes());
    i0.ɵɵadvance(3);
    i0.ɵɵconditional((tmp_3_0 = item_r4.reserva?.publicacion?.imagenes?.[0]?.url) ? 4 : -1, tmp_3_0);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(item_r4.reserva?.publicacion?.titulo || "Sin datos");
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_5_0 = item_r4.reserva?.publicacion?.id) ? 10 : -1, tmp_5_0);
} }
function ClaimHistoryComponent_Conditional_24_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "a", 24);
    i0.ɵɵelement(2, "img", 25);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const imagen_r9 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("href", ctx_r1.urlImagen(imagen_r9), i0.ɵɵsanitizeUrl)("title", imagen_r9.nombre_archivo);
    i0.ɵɵattribute("aria-label", "Abrir " + imagen_r9.nombre_archivo);
    i0.ɵɵadvance();
    i0.ɵɵproperty("src", ctx_r1.urlImagen(imagen_r9), i0.ɵɵsanitizeUrl)("alt", imagen_r9.nombre_archivo);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("Subida por ", ctx_r1.autorImagen(imagen_r9));
} }
function ClaimHistoryComponent_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 10);
    i0.ɵɵrepeaterCreate(1, ClaimHistoryComponent_Conditional_24_For_2_Template, 5, 6, "li", null, _forTrack1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const item_r4 = i0.ɵɵreadContextLet(0);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(item_r4.evidencias);
} }
/** Mismo ritmo que los chats de mensajes y de reembolsos. */
const INTERVALO_CHAT_MS = 5000;
/** Los enlaces de las imágenes vencen a los 15 minutos; se renuevan antes. */
const RENOVAR_ENLACE_MS = 10 * 60 * 1000;
export class ClaimHistoryComponent {
    reclamo = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reclamo" }] : /* istanbul ignore next */ []));
    administracion = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "administracion" }] : /* istanbul ignore next */ []));
    /** Cada pantalla decide a dónde lleva el reembolso; este componente solo lo ofrece si hubo devolución. */
    mostrarVerReembolso = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mostrarVerReembolso" }] : /* istanbul ignore next */ []));
    verReembolso = output();
    /** El admin la apaga mientras la sección Reclamos está oculta, para no consultar en segundo plano. */
    actualizar = input(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "actualizar" }] : /* istanbul ignore next */ []));
    puedeValidarCodigo = puedeValidarCodigo;
    /** En Mis reservas, el rol de quien mira el reclamo; el admin no lo necesita. */
    rolPropio = computed(() => {
        if (this.administracion())
            return '';
        return rolEnReclamo(this.reclamo(), Number(this.auth.currentUser()?.sub)) ?? '';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "rolPropio" }] : /* istanbul ignore next */ []));
    participantes = computed(() => [
        { rol: 'Anunciante', usuario: this.reclamo().anunciante },
        { rol: 'Inquilino', usuario: this.reclamo().inquilino },
    ], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "participantes" }] : /* istanbul ignore next */ []));
    nombreCompleto(usuario) {
        return [usuario?.nombre, usuario?.apellido].filter(Boolean).join(' ').trim();
    }
    iniciales(usuario) {
        return [usuario?.nombre, usuario?.apellido].map((nombre) => nombre?.trim().charAt(0)).join('').toUpperCase() || '?';
    }
    rolDe(autor) {
        if (!autor)
            return '';
        if (autor.rol?.nombre === 'Administrador')
            return 'Admin';
        if (autor.id === this.reclamo().inquilino?.id)
            return 'Inquilino';
        if (autor.id === this.reclamo().anunciante?.id)
            return 'Anunciante';
        return '';
    }
    /** Cada imagen dice quién la subió. */
    autorImagen(imagen) {
        const rol = this.rolDe(imagen.autor);
        return [this.nombreCompleto(imagen.autor) || 'un usuario', rol].filter(Boolean).join(' · ');
    }
    /**
     * El chat se consulta cada 5 segundos y cada respuesta trae un enlace firmado nuevo. Se conserva el primero
     * para no volver a descargar las miniaturas y se cambia por el más reciente antes de que venza (15 minutos).
     */
    urlImagen(imagen) {
        const guardada = this.urlsImagenes.get(imagen.id);
        if (guardada && Date.now() - guardada.desde < RENOVAR_ENLACE_MS)
            return guardada.url;
        this.urlsImagenes.set(imagen.id, { url: imagen.url, desde: Date.now() });
        return imagen.url;
    }
    ocultarPortada(evento) {
        evento.target.hidden = true;
    }
    urlsImagenes = new Map();
    auth = inject(AuthService);
    reservas = inject(ReservationService);
    esNavegador = isPlatformBrowser(inject(PLATFORM_ID));
    idReclamo = computed(() => this.reclamo().id, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "idReclamo" }] : /* istanbul ignore next */ []));
    abierto = computed(() => ['ABIERTO', 'EN_REVISION'].includes(this.reclamo().estado), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "abierto" }] : /* istanbul ignore next */ []));
    /** Mensajes traídos por la consulta periódica; se combinan con los que llegaron en el listado. */
    mensajesRecibidos = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mensajesRecibidos" }] : /* istanbul ignore next */ []));
    idConsultado;
    constructor() {
        // El hilo de un reclamo abierto se actualiza solo, como los chats de mensajes y reembolsos.
        effect(onCleanup => {
            const id = this.idReclamo();
            if (id !== this.idConsultado) {
                this.idConsultado = id;
                this.mensajesRecibidos.set([]);
            }
            if (!this.esNavegador || !this.abierto() || !this.actualizar())
                return;
            const consulta = timer(INTERVALO_CHAT_MS, INTERVALO_CHAT_MS).pipe(
            // Un fallo puntual no corta la actualización: se reintenta en el próximo intervalo.
            exhaustMap(() => this.reservas.claimMessages(id).pipe(catchError(() => EMPTY)))).subscribe(mensajes => this.mensajesRecibidos.set(mensajes));
            onCleanup(() => consulta.unsubscribe());
        });
    }
    mensajes = computed(() => [
        ...new Map([...(this.reclamo().mensajes ?? []), ...this.mensajesRecibidos()].map(mensaje => [mensaje.id, mensaje])).values(),
    ]
        .sort((a, b) => a.id - b.id)
        .map(mensaje => ({
        id: mensaje.id, autor: this.nombreCompleto(mensaje.autor) || 'Usuario',
        texto: mensaje.texto, fecha: mensaje.creado_en,
        rol: this.rolDe(mensaje.autor), interno: mensaje.visible_para === 'ADMIN',
        propio: mensaje.autor?.id === Number(this.auth.currentUser()?.sub),
        imagenes: (mensaje.evidencias ?? []).map((imagen) => ({ url: this.urlImagen(imagen), nombre: imagen.nombre_archivo })),
    })), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mensajes" }] : /* istanbul ignore next */ []));
    categorias = CATEGORIAS_RECLAMO;
    etiquetaCategoria = etiquetaCategoriaReclamo;
    estados = {
        ABIERTO: 'Recibido', EN_REVISION: 'En revisión', RESUELTO_INQUILINO: 'Resuelto',
        RESUELTO_ANUNCIANTE: 'Resuelto', CERRADO: 'Cerrado',
    };
    resoluciones = {
        SIN_DEVOLUCION: 'Cerrado sin devolución', DEVOLUCION_TOTAL: 'Devolución total',
        DEVOLUCION_PARCIAL: 'Devolución parcial', REINICIAR_CODIGO: 'Nuevos intentos del código',
        CONFIRMAR_INGRESO: 'Ingreso confirmado sin código',
    };
    static ɵfac = function ClaimHistoryComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ClaimHistoryComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ClaimHistoryComponent, selectors: [["app-claim-history"]], hostVars: 2, hostBindings: function ClaimHistoryComponent_HostBindings(rf, ctx) { if (rf & 2) {
            i0.ɵɵclassProp("administracion", ctx.administracion());
        } }, inputs: { reclamo: [1, "reclamo"], administracion: [1, "administracion"], mostrarVerReembolso: [1, "mostrarVerReembolso"], actualizar: [1, "actualizar"] }, outputs: { verReembolso: "verReembolso" }, ngContentSelectors: _c0, decls: 27, vars: 21, consts: [[1, "meta"], [1, "rol"], [1, "header-actions"], [1, "status"], [1, "ver-reserva", 3, "routerLink", "queryParams"], [1, "resolution"], ["role", "status", 1, "resolution"], [1, "claim-context"], [1, "claim-description"], [1, "body"], ["aria-label", "Im\u00E1genes del reclamo", 1, "imagenes-reclamo"], ["titulo", "Conversaci\u00F3n del reclamo", 3, "mensajes"], [1, "amount"], [1, "resolution__title"], [1, "resolution__motivo"], ["type", "button", 1, "resolution__action"], ["type", "button", 1, "resolution__action", 3, "click"], [1, "context-card"], ["alt", "", "loading", "lazy", 1, "listing-cover", 3, "src"], [1, "context-name"], [3, "routerLink"], ["aria-hidden", "true", 1, "initials"], ["aria-hidden", "true"], ["alt", "", "loading", "lazy", 1, "listing-cover", 3, "error", "src"], ["target", "_blank", "rel", "noopener noreferrer", 3, "href", "title"], ["loading", "lazy", 3, "src", "alt"]], template: function ClaimHistoryComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵdeclareLet(0);
            i0.ɵɵelementStart(1, "header")(2, "div")(3, "p", 0);
            i0.ɵɵtext(4);
            i0.ɵɵconditionalCreate(5, ClaimHistoryComponent_Conditional_5_Template, 2, 1, "span", 1);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "h3");
            i0.ɵɵtext(7);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(8, "div", 2)(9, "span", 3);
            i0.ɵɵtext(10);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(11, ClaimHistoryComponent_Conditional_11_Template, 2, 8, "a", 4);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(12, "p", 0);
            i0.ɵɵtext(13);
            i0.ɵɵpipe(14, "date");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(15, ClaimHistoryComponent_Conditional_15_Template, 17, 26, "div", 5);
            i0.ɵɵconditionalCreate(16, ClaimHistoryComponent_Conditional_16_Template, 5, 4, "p", 0);
            i0.ɵɵconditionalCreate(17, ClaimHistoryComponent_Conditional_17_Template, 10, 5, "div", 6);
            i0.ɵɵconditionalCreate(18, ClaimHistoryComponent_Conditional_18_Template, 11, 3, "div", 7);
            i0.ɵɵelementStart(19, "div", 8)(20, "h4");
            i0.ɵɵtext(21, "Motivo del reclamo");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(22, "p", 9);
            i0.ɵɵtext(23);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(24, ClaimHistoryComponent_Conditional_24_Template, 3, 0, "ul", 10);
            i0.ɵɵelementStart(25, "app-conversation-panel", 11);
            i0.ɵɵprojection(26);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_2_0;
            let tmp_6_0;
            let tmp_8_0;
            let tmp_9_0;
            const item_r10 = i0.ɵɵstoreLet(ctx.reclamo());
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate2("Reclamo #", item_r10.id, " \u00B7 Reserva #", item_r10.reserva?.id ?? "\u2014", " ");
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_2_0 = ctx.rolPropio()) ? 5 : -1, tmp_2_0);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(item_r10.reserva?.publicacion?.titulo || ctx.categorias[item_r10.categoria]);
            i0.ɵɵadvance(2);
            i0.ɵɵclassProp("status--resolved", item_r10.resuelto_en || item_r10.estado === "CERRADO");
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.estados[item_r10.estado], " ");
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_6_0 = item_r10.reserva?.id) ? 11 : -1, tmp_6_0);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate2("", ctx.etiquetaCategoria(item_r10), " \u00B7", i0.ɵɵpipeBind2(14, 18, item_r10.creado_en, "dd/MM/yyyy, HH:mm"));
            i0.ɵɵadvance(2);
            i0.ɵɵconditional((tmp_8_0 = item_r10.devolucion_cancelacion) ? 15 : -1, tmp_8_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_9_0 = item_r10.reserva?.monto_pago) ? 16 : -1, tmp_9_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional(item_r10.resolucion ? 17 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.administracion() ? 18 : -1);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(item_r10.descripcion);
            i0.ɵɵadvance();
            i0.ɵɵconditional(item_r10.evidencias?.length ? 24 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("mensajes", ctx.mensajes());
        } }, dependencies: [RouterLink, ConversationPanelComponent, CurrencyPipe, DatePipe], styles: ["[_nghost-%COMP%] { display: grid; gap: .6rem; min-width: 0; }\n    header[_ngcontent-%COMP%] { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: .6rem; }\n    h3[_ngcontent-%COMP%], p[_ngcontent-%COMP%] { margin: 0; }\n    h3[_ngcontent-%COMP%] { font-size: 1.1rem; font-weight: 700; overflow-wrap: anywhere; }\n    .meta[_ngcontent-%COMP%] { color: #526475; font-size: .84rem; }\n    .amount[_ngcontent-%COMP%] { color: #101d36; }\n    .status[_ngcontent-%COMP%] { background: #fff1d8; color: #74470a; padding: .25rem .65rem; border-radius: 1rem; font-size: .8rem; font-weight: 700; }\n    .header-actions[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }\n    .rol[_ngcontent-%COMP%] { display: inline-block; margin-inline-start: .35rem; padding: .1rem .5rem; border-radius: 1rem; background: #e8eeff; color: #1d3b8f; font-size: .78rem; font-weight: 700; }\n    .ver-reserva[_ngcontent-%COMP%] { padding: .3rem .7rem; border: 1px solid #10233f; border-radius: .45rem; color: #10233f; font-size: .82rem; font-weight: 700; text-decoration: none; }\n    .ver-reserva[_ngcontent-%COMP%]:hover, .ver-reserva[_ngcontent-%COMP%]:focus-visible { background: #10233f; color: #fff; }\n    .status--resolved[_ngcontent-%COMP%], .resolution[_ngcontent-%COMP%] { background: #edf6f2; color: #205c46; }\n    .body[_ngcontent-%COMP%] { white-space: pre-wrap; overflow-wrap: anywhere; }\n    .imagenes-reclamo[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; gap: .6rem; margin: 0; padding: 0; list-style: none; }\n    .imagenes-reclamo[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] { display: grid; gap: .25rem; width: 7.5rem; color: #526475; font-size: .78rem; overflow-wrap: anywhere; }\n    .imagenes-reclamo[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] { display: block; border-radius: .5rem; }\n    .imagenes-reclamo[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:focus-visible { outline: 2px solid #1640f5; outline-offset: 2px; }\n    .imagenes-reclamo[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] { display: block; width: 100%; aspect-ratio: 1; border-radius: .5rem; object-fit: cover; background: #e3eaff; }\n    .resolution[_ngcontent-%COMP%] { display: grid; gap: .3rem; justify-items: start; padding: .75rem .9rem; border-radius: .6rem; border: 1px solid #b9dccb; }\n    .resolution__title[_ngcontent-%COMP%] { font-weight: 800; }\n    .resolution__motivo[_ngcontent-%COMP%] { white-space: pre-wrap; overflow-wrap: anywhere; }\n    .resolution__action[_ngcontent-%COMP%] {\n      margin-top: .25rem; padding: .45rem .8rem; border: 1px solid #205c46; border-radius: .45rem;\n      background: #fff; color: #205c46; font-weight: 700; cursor: pointer;\n    }\n    .resolution__action[_ngcontent-%COMP%]:hover, .resolution__action[_ngcontent-%COMP%]:focus-visible { background: #205c46; color: #fff; }\n    .administracion[_nghost-%COMP%] { color: #101d36; gap: .75rem; }\n    .administracion[_nghost-%COMP%]   h3[_ngcontent-%COMP%] { margin-top: .2rem; font-size: 1.45rem; }\n    .context-card[_ngcontent-%COMP%], .claim-description[_ngcontent-%COMP%]   .body[_ngcontent-%COMP%] {\n      border: 1px solid #dce4ef;\n      border-radius: .65rem;\n    }\n    .claim-context[_ngcontent-%COMP%] {\n      display: grid;\n      grid-template-columns: repeat(3, minmax(0, 1fr));\n      gap: .75rem;\n      margin-block: .25rem;\n    }\n    .context-card[_ngcontent-%COMP%] {\n      display: flex;\n      align-items: center;\n      gap: .85rem;\n      padding: .9rem;\n      min-width: 0;\n      overflow-wrap: anywhere;\n    }\n    .context-name[_ngcontent-%COMP%] { margin-block: .2rem; font-weight: 750; }\n    .context-card[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] { color: #124db9; font-weight: 650; }\n    .initials[_ngcontent-%COMP%] {\n      flex: none;\n      display: grid;\n      place-items: center;\n      width: 3.2rem;\n      height: 3.2rem;\n      border-radius: 50%;\n      background: #d4dfff;\n      color: #172f6b;\n      font-weight: 800;\n    }\n    .initials--tenant[_ngcontent-%COMP%] { background: #e9dcfa; color: #422668; }\n    .listing-cover[_ngcontent-%COMP%] { width: clamp(3.5rem, 7vw, 7rem); aspect-ratio: 3 / 2; object-fit: cover; border-radius: .5rem; }\n    .claim-description[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%] { margin: 0 0 .35rem; }\n    .claim-description[_ngcontent-%COMP%]   .body[_ngcontent-%COMP%] { padding: .6rem .8rem; background: #f6f8fb; }\n    @media (max-width: 900px) {\n      .claim-context[_ngcontent-%COMP%] { grid-template-columns: 1fr; }\n    }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ClaimHistoryComponent, [{
        type: Component,
        args: [{ selector: 'app-claim-history', imports: [CurrencyPipe, DatePipe, RouterLink, ConversationPanelComponent], host: { '[class.administracion]': 'administracion()' }, template: `
    @let item = reclamo();
    <header>
      <div>
        <p class="meta">Reclamo #{{ item.id }} · Reserva #{{ item.reserva?.id ?? '—' }}
          @if (rolPropio(); as rol) { <span class="rol">Sos el {{ rol }}</span> }
        </p>
        <h3>{{ item.reserva?.publicacion?.titulo || categorias[item.categoria] }}</h3>
      </div>
      <div class="header-actions">
        <span class="status" [class.status--resolved]="item.resuelto_en || item.estado === 'CERRADO'">
          {{ estados[item.estado] }}
        </span>
        <!-- El admin va al detalle de su panel; las partes, al resumen de la reserva. -->
        @if (item.reserva?.id; as idReserva) {
          <a class="ver-reserva" [routerLink]="administracion() ? ['/admin/reservas', idReserva] : ['/reserva/resultado']"
            [queryParams]="administracion() ? { desde: 'reclamos' } : { reserva_id: idReserva }">Ver reserva</a>
        }
      </div>
    </header>
    <p class="meta">{{ etiquetaCategoria(item) }} ·{{ item.creado_en | date:'dd/MM/yyyy, HH:mm' }}</p>
    @if (item.devolucion_cancelacion; as saldo) {
      <div class="resolution">
        <p>Correspondía devolver: <strong>{{ saldo.esperado | currency:saldo.moneda:'code' }}</strong> ({{ saldo.porcentaje }} %)</p>
        <p>Ya devuelto: {{ saldo.devuelto | currency:saldo.moneda:'code' }} · En gestión: {{ saldo.enGestion | currency:saldo.moneda:'code' }}</p>
        <p>Falta recibir: {{ saldo.faltante | currency:saldo.moneda:'code' }} · Disponible para completar: <strong>{{ saldo.importeReclamable | currency:saldo.moneda:'code' }}</strong></p>
      </div>
    }
    @if (item.reserva?.monto_pago; as monto) {
      <p class="meta">Importe de la reserva: <strong class="amount">{{ monto | currency:(item.reserva?.moneda_contratada || 'ARS') }}</strong></p>
    }
    @if (item.resolucion) {
      <div class="resolution" role="status">
        <p class="resolution__title">Reclamo resuelto</p>
        @if (item.resolucion === 'SIN_DEVOLUCION' || item.resolucion === 'REINICIAR_CODIGO') {
          <p>{{ item.resolucion === 'REINICIAR_CODIGO'
            ? 'A favor del anunciante: la administración habilitó nuevos intentos para cargar el código.'
            : (item.solicitud_cancelacion_id && item.categoria !== 'DEMORA_ADMINISTRATIVA')
              ? 'No se aprobó una devolución adicional.'
              : 'A favor del anunciante: sin devolución al inquilino.' }}</p>
        } @else if (item.resolucion === 'CONFIRMAR_INGRESO') {
          <p>A favor del anunciante: la administración confirmó el ingreso sin el código. El pago sigue los plazos habituales.</p>
        } @else {
          <p>
            A favor del inquilino: {{ (item.solicitud_cancelacion_id && item.categoria !== 'DEMORA_ADMINISTRATIVA') ? 'devolución del faltante' : resoluciones[item.resolucion].toLowerCase() }}
            @if (item.importe_reembolso) {<span> de {{ item.importe_reembolso | currency:(item.devolucion_cancelacion?.moneda || item.reserva?.moneda_contratada || 'ARS') }}</span>}.
            {{ administracion() ? 'La devolución se gestiona en Reembolsos.' : 'La devolución se sigue desde el detalle de la reserva.' }}
          </p>
        }
        @if (item.motivo_resolucion) {
          <p class="resolution__motivo"><strong>Motivo de la resolución:</strong> {{ item.motivo_resolucion }}</p>
        }
        <!-- Misma regla que el campo del código: solo mientras el anunciante puede cargarlo. -->
        @if ((item.resolucion === 'SIN_DEVOLUCION' || item.resolucion === 'REINICIAR_CODIGO') && item.reserva && puedeValidarCodigo(item.reserva)) {
          <p>El anunciante ya puede volver a ingresar el código de alojamiento.</p>
        }
        @if (item.resuelto_en) { <p class="meta">Resuelto el {{ item.resuelto_en | date:'dd/MM/yyyy, HH:mm' }}</p> }
        @if (mostrarVerReembolso() && (item.resolucion === 'DEVOLUCION_TOTAL' || item.resolucion === 'DEVOLUCION_PARCIAL')) {
          <button type="button" class="resolution__action" (click)="verReembolso.emit(item)">Ver reembolso</button>
        }
      </div>
    }
    @if (administracion()) {
      <div class="claim-context">
        @for (parte of participantes(); track parte.rol) {
          <div class="context-card">
            <span class="initials" [class.initials--tenant]="parte.rol === 'Inquilino'" aria-hidden="true">
              {{ iniciales(parte.usuario) }}
            </span>
            <div>
              <p class="meta">{{ parte.rol }}</p>
              <p class="context-name">{{ nombreCompleto(parte.usuario) || 'Sin datos' }}</p>
              @if (parte.usuario; as usuario) {
                <a [routerLink]="['/admin/usuarios', usuario.id]"
                   [attr.aria-label]="'Ver perfil de ' + (nombreCompleto(usuario) || parte.rol)">
                  Ver perfil <span aria-hidden="true">→</span>
                </a>
              }
            </div>
          </div>
        }
        <div class="context-card">
          @if (item.reserva?.publicacion?.imagenes?.[0]?.url; as portada) {
            <img class="listing-cover" [src]="portada" alt="" loading="lazy" (error)="ocultarPortada($event)" />
          }
          <div>
            <p class="meta">Publicación de la reserva</p>
            <p class="context-name">{{ item.reserva?.publicacion?.titulo || 'Sin datos' }}</p>
            @if (item.reserva?.publicacion?.id; as id) {
              <a [routerLink]="['/admin/publicaciones', id]">Ver publicación <span aria-hidden="true">→</span></a>
            }
          </div>
        </div>
      </div>
    }
    <div class="claim-description">
      <h4>Motivo del reclamo</h4>
      <p class="body">{{ item.descripcion }}</p>
    </div>
    @if (item.evidencias?.length) {
      <!-- Imágenes de la descripción (las que se subieron al crear el reclamo), cada una con su autor. -->
      <ul class="imagenes-reclamo" aria-label="Imágenes del reclamo">
        @for (imagen of item.evidencias; track imagen.id) {
          <li>
            <a [href]="urlImagen(imagen)" target="_blank" rel="noopener noreferrer" [attr.aria-label]="'Abrir ' + imagen.nombre_archivo" [title]="imagen.nombre_archivo">
              <img [src]="urlImagen(imagen)" [alt]="imagen.nombre_archivo" loading="lazy" />
            </a>
            <span>Subida por {{ autorImagen(imagen) }}</span>
          </li>
        }
      </ul>
    }
    <app-conversation-panel titulo="Conversación del reclamo" [mensajes]="mensajes()">
      <ng-content />
    </app-conversation-panel>
  `, styles: ["\n    :host { display: grid; gap: .6rem; min-width: 0; }\n    header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: .6rem; }\n    h3, p { margin: 0; }\n    h3 { font-size: 1.1rem; font-weight: 700; overflow-wrap: anywhere; }\n    .meta { color: #526475; font-size: .84rem; }\n    .amount { color: #101d36; }\n    .status { background: #fff1d8; color: #74470a; padding: .25rem .65rem; border-radius: 1rem; font-size: .8rem; font-weight: 700; }\n    .header-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }\n    .rol { display: inline-block; margin-inline-start: .35rem; padding: .1rem .5rem; border-radius: 1rem; background: #e8eeff; color: #1d3b8f; font-size: .78rem; font-weight: 700; }\n    .ver-reserva { padding: .3rem .7rem; border: 1px solid #10233f; border-radius: .45rem; color: #10233f; font-size: .82rem; font-weight: 700; text-decoration: none; }\n    .ver-reserva:hover, .ver-reserva:focus-visible { background: #10233f; color: #fff; }\n    .status--resolved, .resolution { background: #edf6f2; color: #205c46; }\n    .body { white-space: pre-wrap; overflow-wrap: anywhere; }\n    .imagenes-reclamo { display: flex; flex-wrap: wrap; gap: .6rem; margin: 0; padding: 0; list-style: none; }\n    .imagenes-reclamo li { display: grid; gap: .25rem; width: 7.5rem; color: #526475; font-size: .78rem; overflow-wrap: anywhere; }\n    .imagenes-reclamo a { display: block; border-radius: .5rem; }\n    .imagenes-reclamo a:focus-visible { outline: 2px solid #1640f5; outline-offset: 2px; }\n    .imagenes-reclamo img { display: block; width: 100%; aspect-ratio: 1; border-radius: .5rem; object-fit: cover; background: #e3eaff; }\n    .resolution { display: grid; gap: .3rem; justify-items: start; padding: .75rem .9rem; border-radius: .6rem; border: 1px solid #b9dccb; }\n    .resolution__title { font-weight: 800; }\n    .resolution__motivo { white-space: pre-wrap; overflow-wrap: anywhere; }\n    .resolution__action {\n      margin-top: .25rem; padding: .45rem .8rem; border: 1px solid #205c46; border-radius: .45rem;\n      background: #fff; color: #205c46; font-weight: 700; cursor: pointer;\n    }\n    .resolution__action:hover, .resolution__action:focus-visible { background: #205c46; color: #fff; }\n    :host(.administracion) { color: #101d36; gap: .75rem; }\n    :host(.administracion) h3 { margin-top: .2rem; font-size: 1.45rem; }\n    .context-card, .claim-description .body {\n      border: 1px solid #dce4ef;\n      border-radius: .65rem;\n    }\n    .claim-context {\n      display: grid;\n      grid-template-columns: repeat(3, minmax(0, 1fr));\n      gap: .75rem;\n      margin-block: .25rem;\n    }\n    .context-card {\n      display: flex;\n      align-items: center;\n      gap: .85rem;\n      padding: .9rem;\n      min-width: 0;\n      overflow-wrap: anywhere;\n    }\n    .context-name { margin-block: .2rem; font-weight: 750; }\n    .context-card a { color: #124db9; font-weight: 650; }\n    .initials {\n      flex: none;\n      display: grid;\n      place-items: center;\n      width: 3.2rem;\n      height: 3.2rem;\n      border-radius: 50%;\n      background: #d4dfff;\n      color: #172f6b;\n      font-weight: 800;\n    }\n    .initials--tenant { background: #e9dcfa; color: #422668; }\n    .listing-cover { width: clamp(3.5rem, 7vw, 7rem); aspect-ratio: 3 / 2; object-fit: cover; border-radius: .5rem; }\n    .claim-description h4 { margin: 0 0 .35rem; }\n    .claim-description .body { padding: .6rem .8rem; background: #f6f8fb; }\n    @media (max-width: 900px) {\n      .claim-context { grid-template-columns: 1fr; }\n    }\n  "] }]
    }], () => [], { reclamo: [{ type: i0.Input, args: [{ isSignal: true, alias: "reclamo", required: true }] }], administracion: [{ type: i0.Input, args: [{ isSignal: true, alias: "administracion", required: false }] }], mostrarVerReembolso: [{ type: i0.Input, args: [{ isSignal: true, alias: "mostrarVerReembolso", required: false }] }], verReembolso: [{ type: i0.Output, args: ["verReembolso"] }], actualizar: [{ type: i0.Input, args: [{ isSignal: true, alias: "actualizar", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ClaimHistoryComponent, { className: "ClaimHistoryComponent", filePath: "src/app/shared/components/claim-history/claim-history.component.ts", lineNumber: 207 }); })();
