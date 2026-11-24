import { Component, HostListener, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { LucideBadgeCheck, LucideBell, LucideCalendarDays, LucideChevronDown, LucideHouse, LucideBookmark, LucideLayoutList, LucideLogIn, LucideLogOut, LucideMap, LucideMessageCircle, LucideSearch, LucideShieldCheck, LucideSquarePlus, LucideTrendingUp, LucideUser, LucideUserPlus, LucideX, } from '@lucide/angular';
import { AuthService } from '../../../core/services/auth.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { ChatService } from '../../../core/services/chat.service';
import { ActividadReembolsosService } from '../../../core/services/actividad-reembolsos.service';
import { etiquetaRol } from '../../models/perfil.model';
import { interlocutor, nombreInterlocutor } from '../../utils/conversaciones';
import { AvatarComponent } from '../avatar/avatar.component';
import { ConversationListComponent } from '../chat-dock/conversation-list.component';
import * as i0 from "@angular/core";
const _c0 = (a0, a1) => ({ reserva_id: a0, reembolso: a1 });
const _c1 = () => ({ exact: true });
const _c2 = () => ({ vista: "mapa" });
const _forTrack0 = ($index, $item) => $item.reembolsoId;
const _forTrack1 = ($index, $item) => $item.idPublicacion + "-" + $item.idOtroUsuario;
function NavbarComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 4);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.nombreVisible());
} }
function NavbarComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 5);
    i0.ɵɵelement(1, "app-avatar", 19);
    i0.ɵɵelementStart(2, "span", 4);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("foto", ctx_r0.perfil.usuario()?.foto_url)("nombre", ctx_r0.nombreVisible());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.nombreVisible());
} }
function NavbarComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 20);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(1, "svg", 21);
    i0.ɵɵelement(2, "path", 22);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "a", 23);
    i0.ɵɵtext(4, "Ingresar");
    i0.ɵɵelementEnd();
} }
function NavbarComponent_Conditional_11_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 27);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.totalNotificaciones());
} }
function NavbarComponent_Conditional_11_Conditional_4_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "a", 33);
    i0.ɵɵlistener("click", function NavbarComponent_Conditional_11_Conditional_4_Conditional_3_Template_a_click_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.cerrarMenu()); });
    i0.ɵɵelementStart(1, "strong");
    i0.ɵɵtext(2, "CBU en revisi\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "small");
    i0.ɵɵtext(4, "Te avisaremos por correo cuando se valide tu CBU.");
    i0.ɵɵelementEnd()();
} }
function NavbarComponent_Conditional_11_Conditional_4_For_5_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "a", 34);
    i0.ɵɵlistener("click", function NavbarComponent_Conditional_11_Conditional_4_For_5_Template_a_click_0_listener() { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.cerrarMenu()); });
    i0.ɵɵelementStart(1, "strong");
    i0.ɵɵtext(2, "Nuevo mensaje de administraci\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "small");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r5 = ctx.$implicit;
    i0.ɵɵproperty("queryParams", i0.ɵɵpureFunction2(3, _c0, item_r5.reservaId, item_r5.reembolsoId));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate2("Reserva #", item_r5.reservaId, " \u00B7 ", item_r5.texto);
} }
function NavbarComponent_Conditional_11_Conditional_4_For_7_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 35);
    i0.ɵɵlistener("click", function NavbarComponent_Conditional_11_Conditional_4_For_7_Template_button_click_0_listener() { const conv_r7 = i0.ɵɵrestoreView(_r6).$implicit; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.abrirChat(conv_r7)); });
    i0.ɵɵelementStart(1, "strong");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "small");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const conv_r7 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", ctx_r0.nombreOtro(conv_r7), " \u00B7 ", conv_r7.cantidadNoLeidos, " sin leer");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", conv_r7.ultimoMensaje.publicacion.titulo, " \u00B7 ", conv_r7.ultimoMensaje.texto);
} }
function NavbarComponent_Conditional_11_Conditional_4_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "Est\u00E1s al d\u00EDa con tus mensajes.");
    i0.ɵɵelementEnd();
} }
function NavbarComponent_Conditional_11_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 28)(1, "h2");
    i0.ɵɵtext(2, "Notificaciones");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, NavbarComponent_Conditional_11_Conditional_4_Conditional_3_Template, 5, 0, "a", 30);
    i0.ɵɵrepeaterCreate(4, NavbarComponent_Conditional_11_Conditional_4_For_5_Template, 5, 6, "a", 31, _forTrack0);
    i0.ɵɵrepeaterCreate(6, NavbarComponent_Conditional_11_Conditional_4_For_7_Template, 5, 4, "button", 32, _forTrack1);
    i0.ɵɵconditionalCreate(8, NavbarComponent_Conditional_11_Conditional_4_Conditional_8_Template, 2, 0, "p");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(!ctx_r0.accesoLimitado() && ctx_r0.perfil.cbuEnRevision() ? 3 : -1);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.actividadReembolsos.notificaciones());
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r0.chatsNoLeidos());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!ctx_r0.totalNotificaciones() ? 8 : -1);
} }
function NavbarComponent_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 24)(1, "button", 25);
    i0.ɵɵlistener("click", function NavbarComponent_Conditional_11_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.alternarNotificaciones()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 26);
    i0.ɵɵconditionalCreate(3, NavbarComponent_Conditional_11_Conditional_3_Template, 2, 1, "span", 27);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, NavbarComponent_Conditional_11_Conditional_4_Template, 9, 2, "section", 28);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(5, "a", 29);
    i0.ɵɵtext(6, "Mis reservas");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-expanded", ctx_r0.notificacionesAbiertas())("aria-label", "Notificaciones pendientes: " + ctx_r0.totalNotificaciones());
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 22);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.totalNotificaciones() ? 3 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.notificacionesAbiertas() ? 4 : -1);
} }
function NavbarComponent_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 9);
    i0.ɵɵtext(1, "\u00BFSos propietario?");
    i0.ɵɵelementEnd();
} }
function NavbarComponent_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 10);
    i0.ɵɵtext(1, "Publicar");
    i0.ɵɵelementEnd();
} }
function NavbarComponent_Conditional_20_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " Anunciante verificado ");
} }
function NavbarComponent_Conditional_20_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.etiquetaRol(ctx_r0.auth.currentUser()?.rol), " ");
} }
function NavbarComponent_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 17);
    i0.ɵɵelement(1, "app-avatar", 19);
    i0.ɵɵelementStart(2, "span", 36)(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "small");
    i0.ɵɵconditionalCreate(6, NavbarComponent_Conditional_20_Conditional_6_Template, 1, 0)(7, NavbarComponent_Conditional_20_Conditional_7_Template, 1, 1);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("foto", ctx_r0.perfil.usuario()?.foto_url)("nombre", ctx_r0.nombreVisible());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.nombreVisible());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.perfil.esAnuncianteVerificado() ? 6 : 7);
} }
function NavbarComponent_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "a", 37);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 38);
    i0.ɵɵtext(3, " Inicio ");
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "li")(5, "a", 39);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(6, "svg", 40);
    i0.ɵɵtext(7, " Explorar publicaciones ");
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(8, "li")(9, "a", 41);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(10, "svg", 42);
    i0.ɵɵtext(11, " Ver mapa ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("routerLinkActiveOptions", i0.ɵɵpureFunction0(9, _c1));
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 20);
    i0.ɵɵadvance(3);
    i0.ɵɵclassProp("is-active", ctx_r0.publicacionesActivas(false));
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 20);
    i0.ɵɵadvance(3);
    i0.ɵɵclassProp("is-active", ctx_r0.publicacionesActivas(true));
    i0.ɵɵproperty("queryParams", i0.ɵɵpureFunction0(10, _c2));
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 20);
} }
function NavbarComponent_Conditional_23_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "a", 52);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 53);
    i0.ɵɵtext(3, " Mi perfil ");
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "li")(5, "a", 54);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(6, "svg", 55);
    i0.ɵɵtext(7, " Mis favoritos ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("routerLinkActiveOptions", i0.ɵɵpureFunction0(3, _c1));
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 20);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("size", 20);
} }
function NavbarComponent_Conditional_23_Conditional_6_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 61);
    i0.ɵɵlistener("click", function NavbarComponent_Conditional_23_Conditional_6_Conditional_5_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r10); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.verMasChats()); });
    i0.ɵɵtext(1, "Ver m\u00E1s");
    i0.ɵɵelementEnd();
} }
function NavbarComponent_Conditional_23_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 46)(1, "label", 56);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 57);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "input", 58);
    i0.ɵɵlistener("input", function NavbarComponent_Conditional_23_Conditional_6_Template_input_input_3_listener($event) { i0.ɵɵrestoreView(_r9); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.buscarChats($event.target.value)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(4, "app-conversation-list", 59);
    i0.ɵɵlistener("seleccionar", function NavbarComponent_Conditional_23_Conditional_6_Template_app_conversation_list_seleccionar_4_listener($event) { i0.ɵɵrestoreView(_r9); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.abrirChat($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, NavbarComponent_Conditional_23_Conditional_6_Conditional_5_Template, 2, 0, "button", 60);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 18);
    i0.ɵɵadvance();
    i0.ɵɵproperty("value", ctx_r0.busquedaChats());
    i0.ɵɵadvance();
    i0.ɵɵproperty("conversaciones", ctx_r0.conversacionesVisibles())("cargando", ctx_r0.cargandoChats())("error", ctx_r0.errorChats())("vacio", ctx_r0.busquedaChats().trim() ? "No encontramos conversaciones para esa b\u00FAsqueda." : ctx_r0.accesoLimitado() ? "Todav\u00EDa no ten\u00E9s conversaciones." : "Todav\u00EDa no ten\u00E9s conversaciones. Escribile a un anunciante desde una publicaci\u00F3n.");
    i0.ɵɵadvance();
    i0.ɵɵconditional(!ctx_r0.cargandoChats() && !ctx_r0.errorChats() && ctx_r0.conversacionesVisibles().length < ctx_r0.conversacionesFiltradas().length ? 5 : -1);
} }
function NavbarComponent_Conditional_23_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "a", 62);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 63);
    i0.ɵɵtext(3, " Consultar o apelar bloqueo ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 20);
} }
function NavbarComponent_Conditional_23_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 64);
    i0.ɵɵtext(1, "Anunciante");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "li")(3, "a", 65);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(4, "svg", 66);
    i0.ɵɵtext(5, " Dashboard ");
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(6, "li")(7, "a", 67);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(8, "svg", 68);
    i0.ɵɵtext(9, " Publicar propiedad ");
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(10, "li")(11, "a", 69);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(12, "svg", 40);
    i0.ɵɵtext(13, " Mis publicaciones ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("size", 20);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("size", 20);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("size", 20);
} }
function NavbarComponent_Conditional_23_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "a", 70);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 71);
    i0.ɵɵtext(3, " Quiero ser anunciante ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 20);
} }
function NavbarComponent_Conditional_23_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "a", 72);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 63);
    i0.ɵɵtext(3, " Panel administrativo ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 20);
} }
function NavbarComponent_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵconditionalCreate(0, NavbarComponent_Conditional_23_Conditional_0_Template, 8, 4);
    i0.ɵɵelementStart(1, "li")(2, "button", 43);
    i0.ɵɵlistener("click", function NavbarComponent_Conditional_23_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r8); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.alternarChats()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(3, "svg", 44);
    i0.ɵɵtext(4, " Mis chats ");
    i0.ɵɵelement(5, "svg", 45);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(6, NavbarComponent_Conditional_23_Conditional_6_Template, 6, 7, "div", 46);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(7, "li")(8, "a", 47);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(9, "svg", 48);
    i0.ɵɵtext(10, " Mis reservas ");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(11, NavbarComponent_Conditional_23_Conditional_11_Template, 4, 1, "li")(12, NavbarComponent_Conditional_23_Conditional_12_Template, 14, 3)(13, NavbarComponent_Conditional_23_Conditional_13_Template, 4, 1, "li");
    i0.ɵɵconditionalCreate(14, NavbarComponent_Conditional_23_Conditional_14_Template, 4, 1, "li");
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(15, "li", 49)(16, "button", 50);
    i0.ɵɵlistener("click", function NavbarComponent_Conditional_23_Template_button_click_16_listener() { i0.ɵɵrestoreView(_r8); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.logout()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(17, "svg", 51);
    i0.ɵɵtext(18, " Cerrar sesi\u00F3n ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵconditional(!ctx_r0.accesoLimitado() ? 0 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵattribute("aria-expanded", ctx_r0.chatsAbiertos());
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 20);
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("is-open", ctx_r0.chatsAbiertos());
    i0.ɵɵproperty("size", 18);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.chatsAbiertos() ? 6 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("size", 20);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.accesoLimitado() ? 11 : ctx_r0.perfil.esAnuncianteVerificado() ? 12 : 13);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r0.auth.isAdmin ? 14 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("size", 20);
} }
function NavbarComponent_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "a", 70);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 71);
    i0.ɵɵtext(3, " \u00BFSos propietario? ");
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "li")(5, "a", 73);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(6, "svg", 74);
    i0.ɵɵtext(7, " Ingresar ");
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(8, "li")(9, "a", 75);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(10, "svg", 76);
    i0.ɵɵtext(11, " Crear cuenta ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 20);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("size", 20);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("size", 20);
} }
// Header del sitio: hamburguesa que abre el panel lateral de navegación, avatar
// (lleva a Mi perfil) o "Ingresar" según haya sesión (RF2), logo y botón "Publicar".
export class NavbarComponent {
    auth = inject(AuthService);
    accesoLimitado = computed(() => this.auth.currentUser()?.accesoLimitado === true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "accesoLimitado" }] : /* istanbul ignore next */ []));
    perfil = inject(PerfilService);
    chat = inject(ChatService);
    actividadReembolsos = inject(ActividadReembolsosService);
    notificacionesAbiertas = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "notificacionesAbiertas" }] : /* istanbul ignore next */ []));
    // Reutiliza la bandeja que ChatService ya consulta para la burbuja del chat.
    chatsNoLeidos = computed(() => this.chat.conversaciones().filter(conv => conv.cantidadNoLeidos > 0), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "chatsNoLeidos" }] : /* istanbul ignore next */ []));
    totalNotificaciones = computed(() => this.chatsNoLeidos().length + this.actividadReembolsos.notificaciones().length + Number(this.perfil.cbuEnRevision()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "totalNotificaciones" }] : /* istanbul ignore next */ []));
    router = inject(Router);
    publicacionesActivas(mapa) {
        const url = this.router.parseUrl(this.router.url);
        return url.root.children['primary']?.segments[0]?.path === 'publicaciones'
            && (url.queryParams['vista'] === 'mapa') === mapa;
    }
    etiquetaRol = etiquetaRol;
    menuAbierto = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "menuAbierto" }] : /* istanbul ignore next */ []));
    chatsAbiertos = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "chatsAbiertos" }] : /* istanbul ignore next */ []));
    cargandoChats = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cargandoChats" }] : /* istanbul ignore next */ []));
    errorChats = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorChats" }] : /* istanbul ignore next */ []));
    busquedaChats = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busquedaChats" }] : /* istanbul ignore next */ []));
    limiteChats = signal(6, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "limiteChats" }] : /* istanbul ignore next */ []));
    conversacionesFiltradas = computed(() => {
        const normalizar = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
        const busqueda = normalizar(this.busquedaChats());
        return this.chat.conversaciones().filter(conversacion => !busqueda || normalizar(nombreInterlocutor(conversacion)).includes(busqueda) ||
            normalizar(conversacion.ultimoMensaje.publicacion.titulo ?? '').includes(busqueda));
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "conversacionesFiltradas" }] : /* istanbul ignore next */ []));
    conversacionesVisibles = computed(() => this.conversacionesFiltradas().slice(0, this.limiteChats()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "conversacionesVisibles" }] : /* istanbul ignore next */ []));
    scrolled = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "scrolled" }] : /* istanbul ignore next */ []));
    /** Nombre visible en el header; mientras carga /usuarios/me se usa el email del JWT. */
    nombreVisible = computed(() => {
        const u = this.perfil.usuario();
        return u ? `${u.nombre} ${u.apellido}`.trim() : (this.auth.currentUser()?.email ?? '');
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "nombreVisible" }] : /* istanbul ignore next */ []));
    onScroll() {
        this.scrolled.set(window.scrollY > 8);
    }
    constructor() {
        const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
        effect(onCleanup => {
            const usuario = this.auth.currentUser();
            if (!isBrowser || !usuario)
                return;
            const consulta = this.perfil.getPerfil().subscribe({ error: () => undefined });
            onCleanup(() => consulta.unsubscribe());
        });
        this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => this.cerrarMenu());
    }
    cerrarMenu() {
        this.menuAbierto.set(false);
        this.chatsAbiertos.set(false);
        this.notificacionesAbiertas.set(false);
    }
    alternarNotificaciones() {
        this.notificacionesAbiertas.update(abiertas => !abiertas);
        if (this.notificacionesAbiertas()) {
            this.actividadReembolsos.actualizar();
            this.chat.actualizar();
        }
    }
    abrirMenu() {
        this.menuAbierto.set(true);
    }
    alternarChats() {
        const abrir = !this.chatsAbiertos();
        this.chatsAbiertos.set(abrir);
        if (!abrir)
            return;
        this.cargandoChats.set(true);
        this.errorChats.set('');
        this.chat.listarConversaciones().subscribe({
            next: (lista) => {
                this.chat.conversaciones.set(lista);
                this.cargandoChats.set(false);
            },
            error: (err) => {
                this.errorChats.set(err.message);
                this.cargandoChats.set(false);
            },
        });
    }
    nombreOtro = nombreInterlocutor;
    buscarChats(valor) {
        this.busquedaChats.set(valor);
        this.limiteChats.set(6);
    }
    verMasChats() {
        this.limiteChats.update(limite => limite + 6);
    }
    abrirChat(conv) {
        this.chat.abrir({
            idPublicacion: conv.idPublicacion,
            idOtroUsuario: conv.idOtroUsuario,
            titulo: conv.ultimoMensaje.publicacion.titulo,
            nombreOtro: nombreInterlocutor(conv),
            fotoOtro: interlocutor(conv).foto_url ?? null,
        });
        this.cerrarMenu();
    }
    logout() {
        this.buscarChats('');
        this.auth.logout();
        this.perfil.limpiar();
        this.chat.cerrarTodos();
        this.cerrarMenu();
        this.router.navigateByUrl('/');
    }
    static ɵfac = function NavbarComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NavbarComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NavbarComponent, selectors: [["app-navbar"]], hostBindings: function NavbarComponent_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("scroll", function NavbarComponent_scroll_HostBindingHandler() { return ctx.onScroll(); }, i0.ɵɵresolveWindow)("keydown.escape", function NavbarComponent_keydown_escape_HostBindingHandler() { return ctx.cerrarMenu(); }, i0.ɵɵresolveDocument);
        } }, decls: 25, vars: 18, consts: [[1, "navbar"], [1, "navbar__inner"], [1, "navbar__start"], ["type", "button", "aria-label", "Abrir men\u00FA", "aria-controls", "menu-lateral", 1, "navbar__menu", 3, "click"], [1, "navbar__link", "navbar__name"], ["routerLink", "/mi-perfil", "title", "Mi perfil", 1, "navbar__user"], [1, "navbar__logo", 3, "routerLink"], ["src", "/images/Logo.png", "alt", "DEPA", 1, "navbar__logo-img"], [1, "navbar__end"], ["routerLink", "/ser-anunciante", 1, "navbar__owner-cta"], ["routerLink", "/publicaciones/nueva", 1, "btn", "btn--primary", "shine"], ["aria-hidden", "true", 1, "drawer-overlay", 3, "click"], ["id", "menu-lateral", "aria-label", "Men\u00FA principal", 1, "drawer"], [1, "drawer__head"], ["src", "/images/Logo.png", "alt", "DEPA", 1, "drawer__logo"], ["type", "button", "aria-label", "Cerrar men\u00FA", 1, "drawer__close", 3, "click"], ["lucideX", "", 3, "size"], ["routerLink", "/mi-perfil", 1, "drawer__user"], [1, "drawer__list"], [1, "navbar__avatar", 3, "foto", "nombre"], ["aria-hidden", "true", 1, "navbar__avatar", "navbar__avatar--placeholder"], ["viewBox", "0 0 24 24", "fill", "currentColor", "width", "20", "height", "20"], ["d", "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"], ["routerLink", "/login", 1, "navbar__link"], [1, "navbar__notifications"], ["type", "button", "aria-controls", "notificaciones-pendientes", 1, "navbar__bell", 3, "click"], ["lucideBell", "", "aria-hidden", "true", 3, "size"], ["aria-hidden", "true", 1, "navbar__bell-count"], ["id", "notificaciones-pendientes", "aria-label", "Notificaciones pendientes", 1, "navbar__notification-panel"], ["routerLink", "/mis-reservas", 1, "navbar__owner-cta"], ["routerLink", "/mi-perfil/validar-cbu"], ["routerLink", "/reserva/resultado", 3, "queryParams"], ["type", "button"], ["routerLink", "/mi-perfil/validar-cbu", 3, "click"], ["routerLink", "/reserva/resultado", 3, "click", "queryParams"], ["type", "button", 3, "click"], [1, "drawer__user-text"], ["routerLink", "/", "routerLinkActive", "is-active", 1, "drawer__item", 3, "routerLinkActiveOptions"], ["lucideHouse", "", 3, "size"], ["routerLink", "/publicaciones", 1, "drawer__item"], ["lucideLayoutList", "", 3, "size"], ["routerLink", "/publicaciones", 1, "drawer__item", 3, "queryParams"], ["lucideMap", "", 3, "size"], ["type", "button", 1, "drawer__item", 3, "click"], ["lucideMessageCircle", "", 3, "size"], ["lucideChevronDown", "", 1, "drawer__chevron", 3, "size"], [1, "drawer__chats"], ["routerLink", "/mis-reservas", "routerLinkActive", "is-active", 1, "drawer__item"], ["lucideCalendarDays", "", 3, "size"], [1, "drawer__bottom"], ["type", "button", 1, "drawer__item", "drawer__item--danger", 3, "click"], ["lucideLogOut", "", 3, "size"], ["routerLink", "/mi-perfil", "routerLinkActive", "is-active", 1, "drawer__item", 3, "routerLinkActiveOptions"], ["lucideUser", "", 3, "size"], ["routerLink", "/favoritos", "routerLinkActive", "is-active", 1, "drawer__item"], ["lucideBookmark", "", 3, "size"], [1, "drawer__chat-search"], ["lucideSearch", "", "aria-hidden", "true", 3, "size"], ["type", "search", "aria-label", "Buscar persona o publicaci\u00F3n", "placeholder", "Buscar persona o publicaci\u00F3n", 3, "input", "value"], [3, "seleccionar", "conversaciones", "cargando", "error", "vacio"], ["type", "button", 1, "drawer__chat-more"], ["type", "button", 1, "drawer__chat-more", 3, "click"], ["routerLink", "/cuenta-bloqueada", "routerLinkActive", "is-active", 1, "drawer__item"], ["lucideShieldCheck", "", 3, "size"], [1, "drawer__section"], ["routerLink", "/dashboard", "routerLinkActive", "is-active", 1, "drawer__item"], ["lucideTrendingUp", "", 3, "size"], ["routerLink", "/publicaciones/nueva", "routerLinkActive", "is-active", 1, "drawer__item"], ["lucideSquarePlus", "", 3, "size"], ["routerLink", "/mis-publicaciones", "routerLinkActive", "is-active", 1, "drawer__item"], ["routerLink", "/ser-anunciante", "routerLinkActive", "is-active", 1, "drawer__item"], ["lucideBadgeCheck", "", 3, "size"], ["routerLink", "/admin", "routerLinkActive", "is-active", 1, "drawer__item"], ["routerLink", "/login", "routerLinkActive", "is-active", 1, "drawer__item"], ["lucideLogIn", "", 3, "size"], ["routerLink", "/registro", "routerLinkActive", "is-active", 1, "drawer__item"], ["lucideUserPlus", "", 3, "size"]], template: function NavbarComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "header", 0)(1, "div", 1)(2, "div", 2)(3, "button", 3);
            i0.ɵɵlistener("click", function NavbarComponent_Template_button_click_3_listener() { return ctx.abrirMenu(); });
            i0.ɵɵtext(4, "\u2630");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(5, NavbarComponent_Conditional_5_Template, 2, 1, "span", 4)(6, NavbarComponent_Conditional_6_Template, 4, 3, "a", 5)(7, NavbarComponent_Conditional_7_Template, 5, 0);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "a", 6);
            i0.ɵɵelement(9, "img", 7);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "div", 8);
            i0.ɵɵconditionalCreate(11, NavbarComponent_Conditional_11_Template, 7, 5)(12, NavbarComponent_Conditional_12_Template, 2, 0, "a", 9);
            i0.ɵɵconditionalCreate(13, NavbarComponent_Conditional_13_Template, 2, 0, "a", 10);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(14, "div", 11);
            i0.ɵɵlistener("click", function NavbarComponent_Template_div_click_14_listener() { return ctx.cerrarMenu(); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(15, "nav", 12)(16, "div", 13);
            i0.ɵɵelement(17, "img", 14);
            i0.ɵɵelementStart(18, "button", 15);
            i0.ɵɵlistener("click", function NavbarComponent_Template_button_click_18_listener() { return ctx.cerrarMenu(); });
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(19, "svg", 16);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(20, NavbarComponent_Conditional_20_Template, 8, 4, "a", 17);
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(21, "ul", 18);
            i0.ɵɵconditionalCreate(22, NavbarComponent_Conditional_22_Template, 12, 11);
            i0.ɵɵconditionalCreate(23, NavbarComponent_Conditional_23_Template, 19, 11)(24, NavbarComponent_Conditional_24_Template, 12, 3);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵclassProp("navbar--scrolled", ctx.scrolled());
            i0.ɵɵadvance(3);
            i0.ɵɵattribute("aria-expanded", ctx.menuAbierto());
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.accesoLimitado() ? 5 : ctx.auth.isAuthenticated ? 6 : 7);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("routerLink", ctx.accesoLimitado() ? "/mis-reservas" : "/");
            i0.ɵɵattribute("aria-label", ctx.accesoLimitado() ? "Ir a mis reservas" : "Ir al inicio");
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.auth.isAuthenticated ? 11 : 12);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(!ctx.accesoLimitado() ? 13 : -1);
            i0.ɵɵadvance();
            i0.ɵɵclassProp("is-open", ctx.menuAbierto());
            i0.ɵɵadvance();
            i0.ɵɵclassProp("is-open", ctx.menuAbierto());
            i0.ɵɵattribute("aria-hidden", !ctx.menuAbierto())("inert", ctx.menuAbierto() ? null : "");
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("size", 22);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.auth.isAuthenticated && !ctx.accesoLimitado() ? 20 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(!ctx.accesoLimitado() ? 22 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.auth.isAuthenticated ? 23 : 24);
        } }, dependencies: [RouterLink,
            RouterLinkActive,
            AvatarComponent,
            ConversationListComponent,
            LucideBadgeCheck,
            LucideBell,
            LucideCalendarDays,
            LucideChevronDown,
            LucideHouse,
            LucideBookmark,
            LucideLayoutList,
            LucideLogIn,
            LucideLogOut,
            LucideMap,
            LucideMessageCircle,
            LucideSearch,
            LucideShieldCheck,
            LucideSquarePlus,
            LucideTrendingUp,
            LucideUser,
            LucideUserPlus,
            LucideX], styles: [".navbar[_ngcontent-%COMP%] {\r\n  position: sticky;\r\n  top: 0;\r\n  z-index: 20;\r\n  background: var(--%NS%color-surface, #fff);\r\n  border-bottom: 1px solid var(--%NS%color-border);\r\n}\r\n\r\n.navbar__inner[_ngcontent-%COMP%] {\r\n  max-width: var(--%NS%max-width-page);\r\n  margin: 0 auto;\r\n  padding: 0.85rem 1rem;\r\n  display: grid;\r\n  grid-template-columns: 1fr auto 1fr;\r\n  align-items: center;\r\n  gap: 1rem;\r\n}\r\n\r\n.navbar__start[_ngcontent-%COMP%] {\r\n  justify-self: start;\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 1rem; \r\n  min-width: 0;\r\n}\r\n\r\n\r\n.navbar__menu[_ngcontent-%COMP%] {\r\n  background: transparent;\r\n  border: none;\r\n  font-size: 2rem;\r\n  font-weight: 800;\r\n  line-height: 1;\r\n  color: var(--%NS%color-primary);\r\n  cursor: pointer;\r\n  padding: 0;\r\n}\r\n\r\n.navbar__link[_ngcontent-%COMP%] {\r\n  background: transparent;\r\n  border: none;\r\n  color: var(--%NS%color-text);\r\n  font-weight: 600;\r\n  font-size: 1rem;\r\n  text-decoration: none;\r\n  cursor: pointer;\r\n}\r\n\r\n.navbar__logo[_ngcontent-%COMP%] {\r\n  justify-self: center;\r\n  display: flex;\r\n  align-items: center;\r\n  text-decoration: none;\r\n}\r\n\r\n\r\n.navbar__logo-img[_ngcontent-%COMP%] {\r\n  height: 40px; \r\n  width: auto;\r\n  display: block;\r\n}\r\n\r\n\r\n.navbar__end[_ngcontent-%COMP%] {\r\n  justify-self: end;\r\n  display: flex;\r\n  flex-direction: row; \r\n  align-items: center; \r\n  gap: 1rem;\r\n  min-width: 0;\r\n}\r\n\r\n\r\n.navbar__owner-cta[_ngcontent-%COMP%] {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  color: var(--%NS%color-secondary);\r\n  font-size: 1rem;\r\n  font-weight: 600;\r\n  text-decoration: none;\r\n  white-space: nowrap;\r\n  cursor: pointer;\r\n  transition: color 0.15s ease;\r\n}\r\n\r\n.navbar__notifications[_ngcontent-%COMP%] { position: relative; }\r\n.navbar__bell[_ngcontent-%COMP%] {\r\n  position: relative;\r\n  display: grid;\r\n  place-items: center;\r\n  width: 40px;\r\n  height: 40px;\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: 50%;\r\n  background: var(--%NS%color-surface, #fff);\r\n  color: var(--%NS%color-text);\r\n  cursor: pointer;\r\n}\r\n.navbar__bell-count[_ngcontent-%COMP%] {\r\n  position: absolute;\r\n  top: -5px;\r\n  right: -5px;\r\n  min-width: 18px;\r\n  padding: 1px 4px;\r\n  border-radius: 20px;\r\n  background: var(--%NS%color-primary);\r\n  color: #fff;\r\n  font-size: .7rem;\r\n}\r\n.navbar__notification-panel[_ngcontent-%COMP%] {\r\n  position: absolute;\r\n  top: calc(100% + 12px);\r\n  right: 0;\r\n  width: min(330px, calc(100vw - 2rem));\r\n  max-height: min(65vh, 420px);\r\n  overflow-y: auto;\r\n  padding: 14px;\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: 14px;\r\n  background: var(--%NS%color-surface, #fff);\r\n  box-shadow: 0 12px 28px #0002;\r\n}\r\n.navbar__notification-panel[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 0 0 10px; font-size: 1rem; }\r\n.navbar__notification-panel[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; font-size: .9rem; }\r\n.navbar__notification-panel[_ngcontent-%COMP%]   a[_ngcontent-%COMP%], \r\n.navbar__notification-panel[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  gap: 4px;\r\n  width: 100%;\r\n  padding: 10px;\r\n  border: 0;\r\n  border-radius: 8px;\r\n  background: transparent;\r\n  text-align: left;\r\n  text-decoration: none;\r\n  color: var(--%NS%color-text);\r\n  cursor: pointer;\r\n  overflow-wrap: anywhere;\r\n}\r\n.navbar__notification-panel[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover, \r\n.navbar__notification-panel[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover { background: #f1f4f5; }\r\n@media (max-width: 720px) {\r\n  .navbar__notifications[_ngcontent-%COMP%] { position: static; }\r\n  .navbar__notification-panel[_ngcontent-%COMP%] { right: 1rem; top: calc(100% + 6px); }\r\n}\r\n\r\n.navbar__owner-cta[_ngcontent-%COMP%]:hover {\r\n  color: var(--%NS%color-primary);\r\n  text-decoration: underline;\r\n  text-underline-offset: 3px;\r\n}\r\n\r\n.navbar__owner-cta[_ngcontent-%COMP%]:focus-visible {\r\n  outline: 3px solid color-mix(in srgb, var(--%NS%color-secondary) 22%, transparent);\r\n  outline-offset: 2px;\r\n}\r\n\r\n\r\n.navbar__avatar[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  place-items: center;\r\n  width: 2.75rem;\r\n  height: 2.75rem;\r\n  border-radius: 50%;\r\n  background: #ffbc59; \r\n  color: var(--%NS%color-primary);\r\n  font-weight: 700;\r\n  text-decoration: none;\r\n  font-size: 1.2rem;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.navbar__avatar--placeholder[_ngcontent-%COMP%] {\r\n  background: #ffbc59;\r\n  color: var(--%NS%color-primary);\r\n}\r\n\r\n\r\n.btn[_ngcontent-%COMP%] {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 0.4rem;\r\n  padding: 0.6rem 1.4rem;\r\n  border-radius: 6px; \r\n  border: 1px solid transparent;\r\n  font-weight: 700;\r\n  font-size: 1rem;\r\n  text-decoration: none;\r\n  cursor: pointer;\r\n  transition: filter 0.15s ease, transform 0.15s ease;\r\n}\r\n\r\n.btn--primary[_ngcontent-%COMP%] {\r\n  background: var(--%NS%color-primary);\r\n  color: #ffffff;\r\n  box-shadow: 0 4px 10px color-mix(in srgb, var(--%NS%color-primary) 40%, transparent);\r\n}\r\n\r\n.btn--%NS%primary[_ngcontent-%COMP%]:hover {\r\n  background: var(--%NS%color-primary-dark);\r\n  transform: translateY(-1px);\r\n}\r\n\r\n\r\n.drawer-overlay[_ngcontent-%COMP%] {\r\n  position: fixed;\r\n  inset: 0;\r\n  z-index: 40;\r\n  background: rgba(16, 24, 40, 0.45);\r\n  opacity: 0;\r\n  visibility: hidden;\r\n  transition: opacity 0.2s ease, visibility 0.2s ease;\r\n}\r\n.drawer-overlay.is-open[_ngcontent-%COMP%] { opacity: 1; visibility: visible; }\r\n\r\n.drawer[_ngcontent-%COMP%] {\r\n  position: fixed;\r\n  inset: 0 auto 0 0;\r\n  z-index: 50;\r\n  width: min(320px, 86vw);\r\n  display: flex;\r\n  flex-direction: column;\r\n  background: var(--%NS%color-surface);\r\n  box-shadow: 8px 0 30px rgba(16, 24, 40, 0.18);\r\n  transform: translateX(-100%);\r\n  transition: transform 0.25s ease;\r\n  overflow-y: auto;\r\n}\r\n.drawer.is-open[_ngcontent-%COMP%] { transform: translateX(0); }\r\n\r\n.drawer__head[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  padding: 1rem 1.1rem;\r\n  border-bottom: 1px solid var(--%NS%color-border);\r\n}\r\n.drawer__logo[_ngcontent-%COMP%] { height: 32px; }\r\n.drawer__close[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  place-items: center;\r\n  border: 0;\r\n  background: transparent;\r\n  color: var(--%NS%color-text-muted);\r\n  cursor: pointer;\r\n}\r\n\r\n.drawer__user[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.75rem;\r\n  padding: 1rem 1.1rem;\r\n  text-decoration: none;\r\n  border-bottom: 1px solid var(--%NS%color-border);\r\n}\r\n.drawer__user-text[_ngcontent-%COMP%] { display: flex; flex-direction: column; min-width: 0; }\r\n.drawer__user-text[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\r\n  overflow: hidden;\r\n  text-overflow: ellipsis;\r\n  white-space: nowrap;\r\n}\r\n.drawer__user-text[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); font-size: 0.8rem; }\r\n\r\n.drawer__list[_ngcontent-%COMP%] { list-style: none; margin: 0; padding: 0.6rem; flex: 1; display: flex; flex-direction: column; }\r\n.drawer__section[_ngcontent-%COMP%] {\r\n  margin: 0.9rem 0.75rem 0.3rem;\r\n  font-size: 0.72rem;\r\n  font-weight: 700;\r\n  letter-spacing: 0.06em;\r\n  text-transform: uppercase;\r\n  color: var(--%NS%color-text-muted);\r\n}\r\n.drawer__bottom[_ngcontent-%COMP%] { margin-top: auto; padding-top: 0.6rem; border-top: 1px solid var(--%NS%color-border); }\r\n\r\n.drawer__item[_ngcontent-%COMP%] {\r\n  width: 100%;\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.8rem;\r\n  padding: 0.75rem;\r\n  border: 0;\r\n  border-radius: var(--%NS%radius-sm);\r\n  background: transparent;\r\n  color: var(--%NS%color-text);\r\n  font-weight: 600;\r\n  text-decoration: none;\r\n  text-align: left;\r\n  cursor: pointer;\r\n}\r\n.drawer__item[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { color: var(--%NS%color-primary); flex-shrink: 0; }\r\n.drawer__item[_ngcontent-%COMP%]:hover, .drawer__item.is-active[_ngcontent-%COMP%] { background: #fff4e5; }\r\n.drawer__item--danger[_ngcontent-%COMP%], .drawer__item--danger[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { color: var(--%NS%color-danger); }\r\n.drawer__chevron[_ngcontent-%COMP%] { margin-left: auto; transition: transform 0.2s ease; }\r\n.drawer__chevron.is-open[_ngcontent-%COMP%] { transform: rotate(180deg); }\r\n\r\n.drawer__chats[_ngcontent-%COMP%] { padding: 0.2rem 0 0.4rem 0.5rem; }\r\n.drawer__chat-search[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.6rem;\r\n  padding: 0 0.75rem;\r\n  margin: 0.25rem 0.25rem 0.55rem 0;\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: var(--%NS%radius-sm);\r\n  color: var(--%NS%color-text-muted);\r\n  background: var(--%NS%color-surface);\r\n}\r\n.drawer__chat-search[_ngcontent-%COMP%]:focus-within { border-color: var(--%NS%color-primary); }\r\n.drawer__chat-search[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { flex-shrink: 0; }\r\n.drawer__chat-search[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\r\n  min-width: 0;\r\n  width: 100%;\r\n  padding: 0.65rem 0;\r\n  border: 0;\r\n  outline: 0;\r\n  background: transparent;\r\n  color: var(--%NS%color-text);\r\n  font: inherit;\r\n  font-size: 0.85rem;\r\n}\r\n.drawer__chat-more[_ngcontent-%COMP%] {\r\n  display: block;\r\n  margin: 0.4rem auto;\r\n  padding: 0.45rem 0.85rem;\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: var(--%NS%radius-sm);\r\n  background: var(--%NS%color-surface);\r\n  color: var(--%NS%color-primary);\r\n  font-weight: 600;\r\n  cursor: pointer;\r\n}\r\n.drawer__chat-more[_ngcontent-%COMP%]:hover { background: #fff4e5; }\r\n.drawer__chat-more[_ngcontent-%COMP%]:focus-visible { outline: 2px solid var(--%NS%color-primary); outline-offset: 2px; }\r\n\r\n@media (max-width: 480px) {\r\n  .navbar__avatar--placeholder[_ngcontent-%COMP%] { display: none; }\r\n  .navbar__start[_ngcontent-%COMP%] { gap: .5rem; }\r\n  .navbar__menu[_ngcontent-%COMP%], .drawer__close[_ngcontent-%COMP%] { min-width: 40px; min-height: 44px; }\r\n  .navbar__menu[_ngcontent-%COMP%] { font-size: 1.7rem; }\r\n  .navbar__link[_ngcontent-%COMP%] { font-size: .85rem; }\r\n  .navbar__owner-cta[_ngcontent-%COMP%] {\r\n    display: none;\r\n  }\r\n\r\n  .navbar__logo-img[_ngcontent-%COMP%] {\r\n    height: 30px;\r\n  }\r\n\r\n  .navbar__link[_ngcontent-%COMP%] {\r\n    font-size: 0.9rem;\r\n    white-space: nowrap;\r\n  }\r\n\r\n  .navbar__inner[_ngcontent-%COMP%] {\r\n    gap: 0.5rem;\r\n    padding: 0.75rem 0.75rem;\r\n  }\r\n\r\n  .btn--primary[_ngcontent-%COMP%] {\r\n    padding: 0.5rem 0.9rem;\r\n    font-size: 0.9rem;\r\n  }\r\n}\r\n@media (max-width: 360px) {\r\n  .navbar__inner[_ngcontent-%COMP%] { gap: .35rem; padding-inline: .5rem; }\r\n  .navbar__logo-img[_ngcontent-%COMP%] { height: 27px; }\r\n  .navbar__end[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%] { min-height: 44px; padding-inline: .65rem; }\r\n  .navbar__start[_ngcontent-%COMP%] { gap: .25rem; }\r\n}\r\n\r\n.navbar[_ngcontent-%COMP%] { transition: box-shadow .3s ease; animation: depa-fade-in .5s ease both; }\r\n.navbar--scrolled[_ngcontent-%COMP%] { box-shadow: 0 6px 20px rgba(16,24,40,.1); }\r\n.navbar__menu[_ngcontent-%COMP%] { transition: transform .25s ease; }\r\n.navbar__menu[_ngcontent-%COMP%]:hover { transform: scale(1.12); }\r\n.navbar__user[_ngcontent-%COMP%] { display: flex; align-items: center; gap: .75rem; min-width: 0; text-decoration: none; }\r\n.navbar__name[_ngcontent-%COMP%] { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 220px; }\r\n.navbar__avatar[_ngcontent-%COMP%] { transition: transform .25s ease, box-shadow .25s ease; }\r\n.navbar__user[_ngcontent-%COMP%]:hover   .navbar__avatar[_ngcontent-%COMP%] { transform: scale(1.08); box-shadow: 0 0 0 4px #ffe0b2; }\r\n.navbar__logo-img[_ngcontent-%COMP%] { transition: transform .3s cubic-bezier(.34,1.56,.64,1); }\r\n.navbar__logo[_ngcontent-%COMP%]:hover   .navbar__logo-img[_ngcontent-%COMP%] { transform: scale(1.06) rotate(-1deg); }\r\n.drawer.is-open[_ngcontent-%COMP%]   .drawer__list[_ngcontent-%COMP%]    > li[_ngcontent-%COMP%] { animation: depa-fade-up .45s cubic-bezier(.22,1,.36,1) both; }\r\n.drawer.is-open[_ngcontent-%COMP%]   .drawer__list[_ngcontent-%COMP%]    > li[_ngcontent-%COMP%]:nth-child(2) { animation-delay: .04s; }\r\n.drawer.is-open[_ngcontent-%COMP%]   .drawer__list[_ngcontent-%COMP%]    > li[_ngcontent-%COMP%]:nth-child(3) { animation-delay: .08s; }\r\n.drawer.is-open[_ngcontent-%COMP%]   .drawer__list[_ngcontent-%COMP%]    > li[_ngcontent-%COMP%]:nth-child(4) { animation-delay: .12s; }\r\n.drawer.is-open[_ngcontent-%COMP%]   .drawer__list[_ngcontent-%COMP%]    > li[_ngcontent-%COMP%]:nth-child(5) { animation-delay: .16s; }\r\n.drawer.is-open[_ngcontent-%COMP%]   .drawer__list[_ngcontent-%COMP%]    > li[_ngcontent-%COMP%]:nth-child(n+6) { animation-delay: .2s; }\r\n.drawer__item[_ngcontent-%COMP%] { transition: background .2s ease, padding-left .2s ease; }\r\n.drawer__item[_ngcontent-%COMP%]:hover { padding-left: 1rem; }\r\n@media (max-width: 640px) { .navbar__name[_ngcontent-%COMP%] { display: none; } }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NavbarComponent, [{
        type: Component,
        args: [{ selector: 'app-navbar', standalone: true, imports: [
                    RouterLink,
                    RouterLinkActive,
                    AvatarComponent,
                    ConversationListComponent,
                    LucideBadgeCheck,
                    LucideBell,
                    LucideCalendarDays,
                    LucideChevronDown,
                    LucideHouse,
                    LucideBookmark,
                    LucideLayoutList,
                    LucideLogIn,
                    LucideLogOut,
                    LucideMap,
                    LucideMessageCircle,
                    LucideSearch,
                    LucideShieldCheck,
                    LucideSquarePlus,
                    LucideTrendingUp,
                    LucideUser,
                    LucideUserPlus,
                    LucideX,
                ], template: "<header class=\"navbar\" [class.navbar--scrolled]=\"scrolled()\">\r\n  <div class=\"navbar__inner\">\r\n    <div class=\"navbar__start\">\r\n      <button\r\n        type=\"button\"\r\n        class=\"navbar__menu\"\r\n        aria-label=\"Abrir men\u00FA\"\r\n        aria-controls=\"menu-lateral\"\r\n        [attr.aria-expanded]=\"menuAbierto()\"\r\n        (click)=\"abrirMenu()\"\r\n      >\u2630</button>\r\n\r\n      @if (accesoLimitado()) {\r\n        <span class=\"navbar__link navbar__name\">{{ nombreVisible() }}</span>\r\n      } @else if (auth.isAuthenticated) {\r\n        <a routerLink=\"/mi-perfil\" class=\"navbar__user\" title=\"Mi perfil\">\r\n          <app-avatar class=\"navbar__avatar\" [foto]=\"perfil.usuario()?.foto_url\" [nombre]=\"nombreVisible()\" />\r\n          <span class=\"navbar__link navbar__name\">{{ nombreVisible() }}</span>\r\n        </a>\r\n      } @else {\r\n        <span class=\"navbar__avatar navbar__avatar--placeholder\" aria-hidden=\"true\">\r\n          <svg viewBox=\"0 0 24 24\" fill=\"currentColor\" width=\"20\" height=\"20\">\r\n            <path d=\"M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z\"/>\r\n          </svg>\r\n        </span>\r\n        <a routerLink=\"/login\" class=\"navbar__link\">Ingresar</a>\r\n      }\r\n    </div>\r\n\r\n    <a [routerLink]=\"accesoLimitado() ? '/mis-reservas' : '/'\" class=\"navbar__logo\" [attr.aria-label]=\"accesoLimitado() ? 'Ir a mis reservas' : 'Ir al inicio'\">\r\n      <img src=\"/images/Logo.png\" alt=\"DEPA\" class=\"navbar__logo-img\">\r\n    </a>\r\n\r\n    <div class=\"navbar__end\">\r\n      @if (auth.isAuthenticated) {\r\n        <div class=\"navbar__notifications\">\r\n          <button type=\"button\" class=\"navbar__bell\" (click)=\"alternarNotificaciones()\"\r\n            [attr.aria-expanded]=\"notificacionesAbiertas()\" aria-controls=\"notificaciones-pendientes\"\r\n            [attr.aria-label]=\"'Notificaciones pendientes: ' + totalNotificaciones()\">\r\n            <svg lucideBell [size]=\"22\" aria-hidden=\"true\"></svg>\r\n            @if (totalNotificaciones()) {\r\n              <span class=\"navbar__bell-count\" aria-hidden=\"true\">{{ totalNotificaciones() }}</span>\r\n            }\r\n          </button>\r\n          @if (notificacionesAbiertas()) {\r\n            <section id=\"notificaciones-pendientes\" class=\"navbar__notification-panel\" aria-label=\"Notificaciones pendientes\">\r\n              <h2>Notificaciones</h2>\r\n              @if (!accesoLimitado() && perfil.cbuEnRevision()) {\r\n                <a routerLink=\"/mi-perfil/validar-cbu\" (click)=\"cerrarMenu()\">\r\n                  <strong>CBU en revisi\u00F3n</strong>\r\n                  <small>Te avisaremos por correo cuando se valide tu CBU.</small>\r\n                </a>\r\n              }\r\n              @for (item of actividadReembolsos.notificaciones(); track item.reembolsoId) {\r\n                <a routerLink=\"/reserva/resultado\" [queryParams]=\"{ reserva_id: item.reservaId, reembolso: item.reembolsoId }\"\r\n                  (click)=\"cerrarMenu()\">\r\n                  <strong>Nuevo mensaje de administraci\u00F3n</strong>\r\n                  <small>Reserva #{{ item.reservaId }} \u00B7 {{ item.texto }}</small>\r\n                </a>\r\n              }\r\n              @for (conv of chatsNoLeidos(); track conv.idPublicacion + '-' + conv.idOtroUsuario) {\r\n                <button type=\"button\" (click)=\"abrirChat(conv)\">\r\n                  <strong>{{ nombreOtro(conv) }} \u00B7 {{ conv.cantidadNoLeidos }} sin leer</strong>\r\n                  <small>{{ conv.ultimoMensaje.publicacion.titulo }} \u00B7 {{ conv.ultimoMensaje.texto }}</small>\r\n                </button>\r\n              }\r\n              @if (!totalNotificaciones()) { <p>Est\u00E1s al d\u00EDa con tus mensajes.</p> }\r\n            </section>\r\n          }\r\n        </div>\r\n        <a routerLink=\"/mis-reservas\" class=\"navbar__owner-cta\">Mis reservas</a>\r\n      } @else {\r\n        <a routerLink=\"/ser-anunciante\" class=\"navbar__owner-cta\">\u00BFSos propietario?</a>\r\n      }\r\n      @if (!accesoLimitado()) {\r\n        <a routerLink=\"/publicaciones/nueva\" class=\"btn btn--primary shine\">Publicar</a>\r\n      }\r\n    </div>\r\n  </div>\r\n</header>\r\n<div class=\"drawer-overlay\" [class.is-open]=\"menuAbierto()\" (click)=\"cerrarMenu()\" aria-hidden=\"true\"></div>\r\n\r\n<nav\r\n  id=\"menu-lateral\"\r\n  class=\"drawer\"\r\n  [class.is-open]=\"menuAbierto()\"\r\n  [attr.aria-hidden]=\"!menuAbierto()\"\r\n  [attr.inert]=\"menuAbierto() ? null : ''\"\r\n  aria-label=\"Men\u00FA principal\"\r\n>\r\n  <div class=\"drawer__head\">\r\n    <img src=\"/images/Logo.png\" alt=\"DEPA\" class=\"drawer__logo\">\r\n    <button type=\"button\" class=\"drawer__close\" aria-label=\"Cerrar men\u00FA\" (click)=\"cerrarMenu()\">\r\n      <svg lucideX [size]=\"22\"></svg>\r\n    </button>\r\n  </div>\r\n\r\n  @if (auth.isAuthenticated && !accesoLimitado()) {\r\n    <a routerLink=\"/mi-perfil\" class=\"drawer__user\">\r\n      <app-avatar class=\"navbar__avatar\" [foto]=\"perfil.usuario()?.foto_url\" [nombre]=\"nombreVisible()\" />\r\n      <span class=\"drawer__user-text\">\r\n        <strong>{{ nombreVisible() }}</strong>\r\n        <small>\r\n          @if (perfil.esAnuncianteVerificado()) { Anunciante verificado } @else { {{ etiquetaRol(auth.currentUser()?.rol) }} }\r\n        </small>\r\n      </span>\r\n    </a>\r\n  }\r\n\r\n  <ul class=\"drawer__list\">\r\n    @if (!accesoLimitado()) {\r\n      <li>\r\n        <a routerLink=\"/\" routerLinkActive=\"is-active\" [routerLinkActiveOptions]=\"{ exact: true }\" class=\"drawer__item\">\r\n          <svg lucideHouse [size]=\"20\"></svg> Inicio\r\n        </a>\r\n      </li>\r\n      <li>\r\n        <a routerLink=\"/publicaciones\" [class.is-active]=\"publicacionesActivas(false)\" class=\"drawer__item\">\r\n          <svg lucideLayoutList [size]=\"20\"></svg> Explorar publicaciones\r\n        </a>\r\n      </li>\r\n      <li>\r\n        <a routerLink=\"/publicaciones\" [queryParams]=\"{ vista: 'mapa' }\"\r\n          [class.is-active]=\"publicacionesActivas(true)\" class=\"drawer__item\">\r\n          <svg lucideMap [size]=\"20\"></svg> Ver mapa\r\n        </a>\r\n      </li>\r\n    }\r\n    @if (auth.isAuthenticated) {\r\n      @if (!accesoLimitado()) {\r\n        <li>\r\n          <a routerLink=\"/mi-perfil\" routerLinkActive=\"is-active\" [routerLinkActiveOptions]=\"{ exact: true }\" class=\"drawer__item\">\r\n            <svg lucideUser [size]=\"20\"></svg> Mi perfil\r\n          </a>\r\n        </li>\r\n        <li>\r\n          <a routerLink=\"/favoritos\" routerLinkActive=\"is-active\" class=\"drawer__item\">\r\n            <svg lucideBookmark [size]=\"20\"></svg> Mis favoritos\r\n          </a>\r\n        </li>\r\n      }\r\n      <li>\r\n        <button type=\"button\" class=\"drawer__item\" [attr.aria-expanded]=\"chatsAbiertos()\" (click)=\"alternarChats()\">\r\n          <svg lucideMessageCircle [size]=\"20\"></svg> Mis chats\r\n          <svg lucideChevronDown [size]=\"18\" class=\"drawer__chevron\" [class.is-open]=\"chatsAbiertos()\"></svg>\r\n        </button>\r\n        @if (chatsAbiertos()) {\r\n          <div class=\"drawer__chats\">\r\n            <label class=\"drawer__chat-search\">\r\n              <svg lucideSearch [size]=\"18\" aria-hidden=\"true\"></svg>\r\n              <input type=\"search\" aria-label=\"Buscar persona o publicaci\u00F3n\" placeholder=\"Buscar persona o publicaci\u00F3n\"\r\n                [value]=\"busquedaChats()\" (input)=\"buscarChats($any($event.target).value)\" />\r\n            </label>\r\n            <app-conversation-list\r\n              [conversaciones]=\"conversacionesVisibles()\"\r\n              [cargando]=\"cargandoChats()\"\r\n              [error]=\"errorChats()\"\r\n              [vacio]=\"busquedaChats().trim() ? 'No encontramos conversaciones para esa b\u00FAsqueda.' : accesoLimitado() ? 'Todav\u00EDa no ten\u00E9s conversaciones.' : 'Todav\u00EDa no ten\u00E9s conversaciones. Escribile a un anunciante desde una publicaci\u00F3n.'\"\r\n              (seleccionar)=\"abrirChat($event)\"\r\n            />\r\n            @if (!cargandoChats() && !errorChats() && conversacionesVisibles().length < conversacionesFiltradas().length) {\r\n              <button type=\"button\" class=\"drawer__chat-more\" (click)=\"verMasChats()\">Ver m\u00E1s</button>\r\n            }\r\n          </div>\r\n        }\r\n      </li>\r\n\r\n      <li>\r\n        <a routerLink=\"/mis-reservas\" routerLinkActive=\"is-active\" class=\"drawer__item\">\r\n          <svg lucideCalendarDays [size]=\"20\"></svg> Mis reservas\r\n        </a>\r\n      </li>\r\n\r\n      @if (accesoLimitado()) {\r\n        <li>\r\n          <a routerLink=\"/cuenta-bloqueada\" routerLinkActive=\"is-active\" class=\"drawer__item\">\r\n            <svg lucideShieldCheck [size]=\"20\"></svg> Consultar o apelar bloqueo\r\n          </a>\r\n        </li>\r\n      } @else if (perfil.esAnuncianteVerificado()) {\r\n        <li class=\"drawer__section\">Anunciante</li>\r\n        <li>\r\n          <a routerLink=\"/dashboard\" routerLinkActive=\"is-active\" class=\"drawer__item\">\r\n            <svg lucideTrendingUp [size]=\"20\"></svg> Dashboard\r\n          </a>\r\n        </li>\r\n        <li>\r\n          <a routerLink=\"/publicaciones/nueva\" routerLinkActive=\"is-active\" class=\"drawer__item\">\r\n            <svg lucideSquarePlus [size]=\"20\"></svg> Publicar propiedad\r\n          </a>\r\n        </li>\r\n        <li>\r\n          <a routerLink=\"/mis-publicaciones\" routerLinkActive=\"is-active\" class=\"drawer__item\">\r\n            <svg lucideLayoutList [size]=\"20\"></svg> Mis publicaciones\r\n          </a>\r\n        </li>\r\n      } @else {\r\n        <li>\r\n          <a routerLink=\"/ser-anunciante\" routerLinkActive=\"is-active\" class=\"drawer__item\">\r\n            <svg lucideBadgeCheck [size]=\"20\"></svg> Quiero ser anunciante\r\n          </a>\r\n        </li>\r\n      }\r\n\r\n      @if (auth.isAdmin) {\r\n        <li>\r\n          <a routerLink=\"/admin\" routerLinkActive=\"is-active\" class=\"drawer__item\">\r\n            <svg lucideShieldCheck [size]=\"20\"></svg> Panel administrativo\r\n          </a>\r\n        </li>\r\n      }\r\n\r\n      <li class=\"drawer__bottom\">\r\n        <button type=\"button\" class=\"drawer__item drawer__item--danger\" (click)=\"logout()\">\r\n          <svg lucideLogOut [size]=\"20\"></svg> Cerrar sesi\u00F3n\r\n        </button>\r\n      </li>\r\n    } @else {\r\n      <li>\r\n        <a routerLink=\"/ser-anunciante\" routerLinkActive=\"is-active\" class=\"drawer__item\">\r\n          <svg lucideBadgeCheck [size]=\"20\"></svg> \u00BFSos propietario?\r\n        </a>\r\n      </li>\r\n      <li>\r\n        <a routerLink=\"/login\" routerLinkActive=\"is-active\" class=\"drawer__item\">\r\n          <svg lucideLogIn [size]=\"20\"></svg> Ingresar\r\n        </a>\r\n      </li>\r\n      <li>\r\n        <a routerLink=\"/registro\" routerLinkActive=\"is-active\" class=\"drawer__item\">\r\n          <svg lucideUserPlus [size]=\"20\"></svg> Crear cuenta\r\n        </a>\r\n      </li>\r\n    }\r\n  </ul>\r\n</nav>\r\n", styles: [".navbar {\r\n  position: sticky;\r\n  top: 0;\r\n  z-index: 20;\r\n  background: var(--color-surface, #fff);\r\n  border-bottom: 1px solid var(--color-border);\r\n}\r\n\r\n.navbar__inner {\r\n  max-width: var(--max-width-page);\r\n  margin: 0 auto;\r\n  padding: 0.85rem 1rem;\r\n  display: grid;\r\n  grid-template-columns: 1fr auto 1fr;\r\n  align-items: center;\r\n  gap: 1rem;\r\n}\r\n\r\n.navbar__start {\r\n  justify-self: start;\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 1rem; /* Un poco m\u00E1s de espacio entre men\u00FA y avatar */\r\n  min-width: 0;\r\n}\r\n\r\n/* Men\u00FA con el rojo de marca y mayor peso visual. */\r\n.navbar__menu {\r\n  background: transparent;\r\n  border: none;\r\n  font-size: 2rem;\r\n  font-weight: 800;\r\n  line-height: 1;\r\n  color: var(--color-primary);\r\n  cursor: pointer;\r\n  padding: 0;\r\n}\r\n\r\n.navbar__link {\r\n  background: transparent;\r\n  border: none;\r\n  color: var(--color-text);\r\n  font-weight: 600;\r\n  font-size: 1rem;\r\n  text-decoration: none;\r\n  cursor: pointer;\r\n}\r\n\r\n.navbar__logo {\r\n  justify-self: center;\r\n  display: flex;\r\n  align-items: center;\r\n  text-decoration: none;\r\n}\r\n\r\n/* Ajuste para la imagen del logo */\r\n.navbar__logo-img {\r\n  height: 40px; \r\n  width: auto;\r\n  display: block;\r\n}\r\n\r\n/* Cambio CLAVE: de columna a fila (row) para alinearlos lado a lado */\r\n.navbar__end {\r\n  justify-self: end;\r\n  display: flex;\r\n  flex-direction: row; \r\n  align-items: center; \r\n  gap: 1rem;\r\n  min-width: 0;\r\n}\r\n\r\n/* Acceso p\u00FAblico a la gu\u00EDa para propietarios e inmobiliarias. */\r\n.navbar__owner-cta {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  color: var(--color-secondary);\r\n  font-size: 1rem;\r\n  font-weight: 600;\r\n  text-decoration: none;\r\n  white-space: nowrap;\r\n  cursor: pointer;\r\n  transition: color 0.15s ease;\r\n}\r\n\r\n.navbar__notifications { position: relative; }\r\n.navbar__bell {\r\n  position: relative;\r\n  display: grid;\r\n  place-items: center;\r\n  width: 40px;\r\n  height: 40px;\r\n  border: 1px solid var(--color-border);\r\n  border-radius: 50%;\r\n  background: var(--color-surface, #fff);\r\n  color: var(--color-text);\r\n  cursor: pointer;\r\n}\r\n.navbar__bell-count {\r\n  position: absolute;\r\n  top: -5px;\r\n  right: -5px;\r\n  min-width: 18px;\r\n  padding: 1px 4px;\r\n  border-radius: 20px;\r\n  background: var(--color-primary);\r\n  color: #fff;\r\n  font-size: .7rem;\r\n}\r\n.navbar__notification-panel {\r\n  position: absolute;\r\n  top: calc(100% + 12px);\r\n  right: 0;\r\n  width: min(330px, calc(100vw - 2rem));\r\n  max-height: min(65vh, 420px);\r\n  overflow-y: auto;\r\n  padding: 14px;\r\n  border: 1px solid var(--color-border);\r\n  border-radius: 14px;\r\n  background: var(--color-surface, #fff);\r\n  box-shadow: 0 12px 28px #0002;\r\n}\r\n.navbar__notification-panel h2 { margin: 0 0 10px; font-size: 1rem; }\r\n.navbar__notification-panel p { margin: 0; font-size: .9rem; }\r\n.navbar__notification-panel a,\r\n.navbar__notification-panel button {\r\n  display: grid;\r\n  gap: 4px;\r\n  width: 100%;\r\n  padding: 10px;\r\n  border: 0;\r\n  border-radius: 8px;\r\n  background: transparent;\r\n  text-align: left;\r\n  text-decoration: none;\r\n  color: var(--color-text);\r\n  cursor: pointer;\r\n  overflow-wrap: anywhere;\r\n}\r\n.navbar__notification-panel a:hover,\r\n.navbar__notification-panel button:hover { background: #f1f4f5; }\r\n@media (max-width: 720px) {\r\n  .navbar__notifications { position: static; }\r\n  .navbar__notification-panel { right: 1rem; top: calc(100% + 6px); }\r\n}\r\n\r\n.navbar__owner-cta:hover {\r\n  color: var(--color-primary);\r\n  text-decoration: underline;\r\n  text-underline-offset: 3px;\r\n}\r\n\r\n.navbar__owner-cta:focus-visible {\r\n  outline: 3px solid color-mix(in srgb, var(--color-secondary) 22%, transparent);\r\n  outline-offset: 2px;\r\n}\r\n\r\n/* Avatar: versi\u00F3n clara de la paleta de marca. */\r\n.navbar__avatar {\r\n  display: grid;\r\n  place-items: center;\r\n  width: 2.75rem;\r\n  height: 2.75rem;\r\n  border-radius: 50%;\r\n  background: #ffbc59; /* Naranja claro */\r\n  color: var(--color-primary);\r\n  font-weight: 700;\r\n  text-decoration: none;\r\n  font-size: 1.2rem;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.navbar__avatar--placeholder {\r\n  background: #ffbc59;\r\n  color: var(--color-primary);\r\n}\r\n\r\n/* CTA principal: rojo exacto del logo DEPA. */\r\n.btn {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 0.4rem;\r\n  padding: 0.6rem 1.4rem;\r\n  border-radius: 6px; /* Borde suave en vez de p\u00EDldora */\r\n  border: 1px solid transparent;\r\n  font-weight: 700;\r\n  font-size: 1rem;\r\n  text-decoration: none;\r\n  cursor: pointer;\r\n  transition: filter 0.15s ease, transform 0.15s ease;\r\n}\r\n\r\n.btn--primary {\r\n  background: var(--color-primary);\r\n  color: #ffffff;\r\n  box-shadow: 0 4px 10px color-mix(in srgb, var(--color-primary) 40%, transparent);\r\n}\r\n\r\n.btn--primary:hover {\r\n  background: var(--color-primary-dark);\r\n  transform: translateY(-1px);\r\n}\r\n\r\n/* Panel lateral (hamburguesa) */\r\n.drawer-overlay {\r\n  position: fixed;\r\n  inset: 0;\r\n  z-index: 40;\r\n  background: rgba(16, 24, 40, 0.45);\r\n  opacity: 0;\r\n  visibility: hidden;\r\n  transition: opacity 0.2s ease, visibility 0.2s ease;\r\n}\r\n.drawer-overlay.is-open { opacity: 1; visibility: visible; }\r\n\r\n.drawer {\r\n  position: fixed;\r\n  inset: 0 auto 0 0;\r\n  z-index: 50;\r\n  width: min(320px, 86vw);\r\n  display: flex;\r\n  flex-direction: column;\r\n  background: var(--color-surface);\r\n  box-shadow: 8px 0 30px rgba(16, 24, 40, 0.18);\r\n  transform: translateX(-100%);\r\n  transition: transform 0.25s ease;\r\n  overflow-y: auto;\r\n}\r\n.drawer.is-open { transform: translateX(0); }\r\n\r\n.drawer__head {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  padding: 1rem 1.1rem;\r\n  border-bottom: 1px solid var(--color-border);\r\n}\r\n.drawer__logo { height: 32px; }\r\n.drawer__close {\r\n  display: grid;\r\n  place-items: center;\r\n  border: 0;\r\n  background: transparent;\r\n  color: var(--color-text-muted);\r\n  cursor: pointer;\r\n}\r\n\r\n.drawer__user {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.75rem;\r\n  padding: 1rem 1.1rem;\r\n  text-decoration: none;\r\n  border-bottom: 1px solid var(--color-border);\r\n}\r\n.drawer__user-text { display: flex; flex-direction: column; min-width: 0; }\r\n.drawer__user-text strong {\r\n  overflow: hidden;\r\n  text-overflow: ellipsis;\r\n  white-space: nowrap;\r\n}\r\n.drawer__user-text small { color: var(--color-text-muted); font-size: 0.8rem; }\r\n\r\n.drawer__list { list-style: none; margin: 0; padding: 0.6rem; flex: 1; display: flex; flex-direction: column; }\r\n.drawer__section {\r\n  margin: 0.9rem 0.75rem 0.3rem;\r\n  font-size: 0.72rem;\r\n  font-weight: 700;\r\n  letter-spacing: 0.06em;\r\n  text-transform: uppercase;\r\n  color: var(--color-text-muted);\r\n}\r\n.drawer__bottom { margin-top: auto; padding-top: 0.6rem; border-top: 1px solid var(--color-border); }\r\n\r\n.drawer__item {\r\n  width: 100%;\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.8rem;\r\n  padding: 0.75rem;\r\n  border: 0;\r\n  border-radius: var(--radius-sm);\r\n  background: transparent;\r\n  color: var(--color-text);\r\n  font-weight: 600;\r\n  text-decoration: none;\r\n  text-align: left;\r\n  cursor: pointer;\r\n}\r\n.drawer__item svg { color: var(--color-primary); flex-shrink: 0; }\r\n.drawer__item:hover, .drawer__item.is-active { background: #fff4e5; }\r\n.drawer__item--danger, .drawer__item--danger svg { color: var(--color-danger); }\r\n.drawer__chevron { margin-left: auto; transition: transform 0.2s ease; }\r\n.drawer__chevron.is-open { transform: rotate(180deg); }\r\n\r\n.drawer__chats { padding: 0.2rem 0 0.4rem 0.5rem; }\r\n.drawer__chat-search {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.6rem;\r\n  padding: 0 0.75rem;\r\n  margin: 0.25rem 0.25rem 0.55rem 0;\r\n  border: 1px solid var(--color-border);\r\n  border-radius: var(--radius-sm);\r\n  color: var(--color-text-muted);\r\n  background: var(--color-surface);\r\n}\r\n.drawer__chat-search:focus-within { border-color: var(--color-primary); }\r\n.drawer__chat-search svg { flex-shrink: 0; }\r\n.drawer__chat-search input {\r\n  min-width: 0;\r\n  width: 100%;\r\n  padding: 0.65rem 0;\r\n  border: 0;\r\n  outline: 0;\r\n  background: transparent;\r\n  color: var(--color-text);\r\n  font: inherit;\r\n  font-size: 0.85rem;\r\n}\r\n.drawer__chat-more {\r\n  display: block;\r\n  margin: 0.4rem auto;\r\n  padding: 0.45rem 0.85rem;\r\n  border: 1px solid var(--color-border);\r\n  border-radius: var(--radius-sm);\r\n  background: var(--color-surface);\r\n  color: var(--color-primary);\r\n  font-weight: 600;\r\n  cursor: pointer;\r\n}\r\n.drawer__chat-more:hover { background: #fff4e5; }\r\n.drawer__chat-more:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }\r\n\r\n@media (max-width: 480px) {\r\n  .navbar__avatar--placeholder { display: none; }\r\n  .navbar__start { gap: .5rem; }\r\n  .navbar__menu, .drawer__close { min-width: 40px; min-height: 44px; }\r\n  .navbar__menu { font-size: 1.7rem; }\r\n  .navbar__link { font-size: .85rem; }\r\n  .navbar__owner-cta {\r\n    display: none;\r\n  }\r\n\r\n  .navbar__logo-img {\r\n    height: 30px;\r\n  }\r\n\r\n  .navbar__link {\r\n    font-size: 0.9rem;\r\n    white-space: nowrap;\r\n  }\r\n\r\n  .navbar__inner {\r\n    gap: 0.5rem;\r\n    padding: 0.75rem 0.75rem;\r\n  }\r\n\r\n  .btn--primary {\r\n    padding: 0.5rem 0.9rem;\r\n    font-size: 0.9rem;\r\n  }\r\n}\r\n@media (max-width: 360px) {\r\n  .navbar__inner { gap: .35rem; padding-inline: .5rem; }\r\n  .navbar__logo-img { height: 27px; }\r\n  .navbar__end .btn { min-height: 44px; padding-inline: .65rem; }\r\n  .navbar__start { gap: .25rem; }\r\n}\r\n/* Detalles y animaciones */\r\n.navbar { transition: box-shadow .3s ease; animation: depa-fade-in .5s ease both; }\r\n.navbar--scrolled { box-shadow: 0 6px 20px rgba(16,24,40,.1); }\r\n.navbar__menu { transition: transform .25s ease; }\r\n.navbar__menu:hover { transform: scale(1.12); }\r\n.navbar__user { display: flex; align-items: center; gap: .75rem; min-width: 0; text-decoration: none; }\r\n.navbar__name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 220px; }\r\n.navbar__avatar { transition: transform .25s ease, box-shadow .25s ease; }\r\n.navbar__user:hover .navbar__avatar { transform: scale(1.08); box-shadow: 0 0 0 4px #ffe0b2; }\r\n.navbar__logo-img { transition: transform .3s cubic-bezier(.34,1.56,.64,1); }\r\n.navbar__logo:hover .navbar__logo-img { transform: scale(1.06) rotate(-1deg); }\r\n.drawer.is-open .drawer__list > li { animation: depa-fade-up .45s cubic-bezier(.22,1,.36,1) both; }\r\n.drawer.is-open .drawer__list > li:nth-child(2) { animation-delay: .04s; }\r\n.drawer.is-open .drawer__list > li:nth-child(3) { animation-delay: .08s; }\r\n.drawer.is-open .drawer__list > li:nth-child(4) { animation-delay: .12s; }\r\n.drawer.is-open .drawer__list > li:nth-child(5) { animation-delay: .16s; }\r\n.drawer.is-open .drawer__list > li:nth-child(n+6) { animation-delay: .2s; }\r\n.drawer__item { transition: background .2s ease, padding-left .2s ease; }\r\n.drawer__item:hover { padding-left: 1rem; }\r\n@media (max-width: 640px) { .navbar__name { display: none; } }\r\n"] }]
    }], () => [], { onScroll: [{
            type: HostListener,
            args: ['window:scroll']
        }], cerrarMenu: [{
            type: HostListener,
            args: ['document:keydown.escape']
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NavbarComponent, { className: "NavbarComponent", filePath: "src/app/shared/components/navbar/navbar.component.ts", lineNumber: 67 }); })();
