import { Component, DestroyRef, HostListener, computed, inject, signal, viewChild, } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { catchError, finalize, of } from 'rxjs';
import { LucideBadgeCheck, LucideBookmark, LucideBuilding2, LucideChevronLeft, LucideChevronRight, LucideClock, LucideExternalLink, LucideHouse, LucideLayoutList, LucideMail, LucideMapPin, LucideRuler, } from '@lucide/angular';
import { AuthService } from '../../core/services/auth.service';
import { ChatService } from '../../core/services/chat.service';
import { ListingService } from '../home/listing.service';
import { admiteReservasPorFecha } from '../../shared/models/catalogo.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { VolverDirective } from '../../shared/directives/volver.directive';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { AvailabilityCalendarComponent } from '../../shared/components/availability-calendar/availability-calendar.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DIAS_MINIMOS_REPROGRAMACION, isRentalRangeAvailable, rentalDays, } from '../../shared/utils/rental-dates';
import { AvailabilityService } from '../../shared/services/availability.service';
import { ReservationService } from '../../shared/services/reservation.service';
import { FavoritesService } from '../../shared/services/favorites.service';
import { AnunciantePublicoService } from '../../shared/services/anunciante-publico.service';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { puedeValidarCodigo } from '../../shared/utils/reservation-state';
import { esInmobiliaria } from '../../shared/utils/anunciante';
import { PaymentSummaryComponent } from './payment-summary/payment-summary.component';
import * as i0 from "@angular/core";
const _c0 = ["confirmacionWhatsapp"];
const _c1 = a0 => [a0];
const _c2 = () => [];
const _c3 = a0 => ["/publicaciones", a0, "editar"];
const _c4 = a0 => ["/perfil", a0];
const _forTrack0 = ($index, $item) => $item.id;
function PublicationDetailComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 3);
    i0.ɵɵtext(1, "\u2190 Volver");
    i0.ɵɵelementEnd();
} }
function PublicationDetailComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 4);
    i0.ɵɵelement(1, "app-spinner");
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3, "Cargando publicaci\u00F3n\u2026");
    i0.ɵɵelementEnd()();
} }
function PublicationDetailComponent_Conditional_3_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 6);
    i0.ɵɵtext(1, "Volver a las publicaciones");
    i0.ɵɵelementEnd();
} }
function PublicationDetailComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 5)(1, "h1");
    i0.ɵɵtext(2, "Publicaci\u00F3n no disponible");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, PublicationDetailComponent_Conditional_3_Conditional_5_Template, 2, 0, "a", 6);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.error());
    i0.ɵɵadvance();
    i0.ɵɵconditional(!ctx_r0.administracion ? 5 : -1);
} }
function PublicationDetailComponent_Conditional_4_Conditional_0_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "Se mantendr\u00E1 visible hasta que se cumpla tu reserva. No admite nuevas reservas ni contactos.");
    i0.ɵɵelementEnd();
} }
function PublicationDetailComponent_Conditional_4_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 7)(1, "strong");
    i0.ɵɵtext(2, "Esta publicaci\u00F3n ha sido eliminada.");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, PublicationDetailComponent_Conditional_4_Conditional_0_Conditional_3_Template, 2, 0, "p");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(!ctx_r0.administracion ? 3 : -1);
} }
function PublicationDetailComponent_Conditional_4_For_4_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 40);
    i0.ɵɵlistener("click", function PublicationDetailComponent_Conditional_4_For_4_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.openImagePreview()); });
    i0.ɵɵelement(1, "img", 41);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const image_r4 = ctx.$implicit;
    const item_r5 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵattribute("aria-label", "Ampliar imagen de " + item_r5.titulo);
    i0.ɵɵadvance();
    i0.ɵɵclassMap("gallery__img gallery__img--" + ctx_r0.direction());
    i0.ɵɵproperty("src", image_r4.url, i0.ɵɵsanitizeUrl)("alt", item_r5.titulo);
} }
function PublicationDetailComponent_Conditional_4_ForEmpty_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 11);
    i0.ɵɵtext(1, "Sin im\u00E1genes disponibles");
    i0.ɵɵelementEnd();
} }
function PublicationDetailComponent_Conditional_4_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 42);
    i0.ɵɵlistener("click", function PublicationDetailComponent_Conditional_4_Conditional_6_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r6); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.previousImage()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 43);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(2, "button", 44);
    i0.ɵɵlistener("click", function PublicationDetailComponent_Conditional_4_Conditional_6_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r6); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.nextImage()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(3, "svg", 45);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "span", 46);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 24);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 24);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", ctx_r0.selectedImage() + 1, " / ", ctx_r0.images().length);
} }
function PublicationDetailComponent_Conditional_4_Conditional_7_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 48);
    i0.ɵɵlistener("click", function PublicationDetailComponent_Conditional_4_Conditional_7_For_2_Template_button_click_0_listener() { const ɵ$index_67_r8 = i0.ɵɵrestoreView(_r7).$index; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.selectImage(ɵ$index_67_r8)); });
    i0.ɵɵelement(1, "img", 49);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const image_r9 = ctx.$implicit;
    const ɵ$index_67_r8 = ctx.$index;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵstyleProp("animation-delay", ɵ$index_67_r8 * 60 + "ms");
    i0.ɵɵclassProp("is-active", ctx_r0.selectedImage() === ɵ$index_67_r8);
    i0.ɵɵattribute("aria-label", "Ver imagen " + (ɵ$index_67_r8 + 1));
    i0.ɵɵadvance();
    i0.ɵɵproperty("src", image_r9.url, i0.ɵɵsanitizeUrl);
} }
function PublicationDetailComponent_Conditional_4_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 12);
    i0.ɵɵrepeaterCreate(1, PublicationDetailComponent_Conditional_4_Conditional_7_For_2_Template, 2, 6, "button", 47, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.images());
} }
function PublicationDetailComponent_Conditional_4_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 50);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r5 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("badge--temp", ctx_r0.esTemporaria());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r5.modalidad?.nombre);
} }
function PublicationDetailComponent_Conditional_4_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 17);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 51);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 14);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.verifiedLabel());
} }
function PublicationDetailComponent_Conditional_4_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 18);
    i0.ɵɵtext(1, "\u270E Modificar publicaci\u00F3n");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r5 = i0.ɵɵnextContext();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(1, _c3, item_r5.id));
} }
function PublicationDetailComponent_Conditional_4_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 52);
    i0.ɵɵlistener("click", function PublicationDetailComponent_Conditional_4_Conditional_24_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r10); const item_r5 = i0.ɵɵnextContext(); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.toggleFavorite(item_r5)); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 53);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("is-active", ctx_r0.isFavorite());
    i0.ɵɵproperty("disabled", ctx_r0.savingFavorite());
    i0.ɵɵattribute("aria-pressed", ctx_r0.isFavorite());
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 19);
    i0.ɵɵattribute("fill", ctx_r0.isFavorite() ? "currentColor" : "none");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.isFavorite() ? "Guardada" : "Guardar");
} }
function PublicationDetailComponent_Conditional_4_Conditional_25_Conditional_3_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 56);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const resultado_r11 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(resultado_r11.mensaje);
} }
function PublicationDetailComponent_Conditional_4_Conditional_25_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, PublicationDetailComponent_Conditional_4_Conditional_25_Conditional_3_Conditional_0_Template, 2, 1, "p", 56);
} if (rf & 2) {
    i0.ɵɵconditional(!ctx.error ? 0 : -1);
} }
function PublicationDetailComponent_Conditional_4_Conditional_25_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p", 57);
    i0.ɵɵtext(1, "No pudimos cargar las reservas pendientes de ingreso.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "button", 58);
    i0.ɵɵlistener("click", function PublicationDetailComponent_Conditional_4_Conditional_25_Conditional_4_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r12); const item_r5 = i0.ɵɵnextContext(2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.cargarIngresos(item_r5.id)); });
    i0.ɵɵtext(3, "Reintentar");
    i0.ɵɵelementEnd();
} }
function PublicationDetailComponent_Conditional_4_Conditional_25_Conditional_5_For_1_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const reserva_r14 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵtextInterpolate2(" \u00B7 ", reserva_r14.usuario_nombre ?? reserva_r14.usuario?.nombre, " ", reserva_r14.usuario_apellido ?? reserva_r14.usuario?.apellido, " ");
} }
function PublicationDetailComponent_Conditional_4_Conditional_25_Conditional_5_For_1_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const reserva_r14 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext(4);
    i0.ɵɵtextInterpolate2(" \u00B7 ", ctx_r0.formatDate(reserva_r14.fecha_inicio), " al ", ctx_r0.formatDate(reserva_r14.fecha_fin), " ");
} }
function PublicationDetailComponent_Conditional_4_Conditional_25_Conditional_5_For_1_Conditional_13_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 57);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const resultado_r16 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(resultado_r16.mensaje);
} }
function PublicationDetailComponent_Conditional_4_Conditional_25_Conditional_5_For_1_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, PublicationDetailComponent_Conditional_4_Conditional_25_Conditional_5_For_1_Conditional_13_Conditional_0_Template, 2, 1, "p", 57);
} if (rf & 2) {
    const resultado_r16 = ctx;
    const reserva_r14 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵconditional(resultado_r16.error && resultado_r16.reservaId === reserva_r14.id ? 0 : -1);
} }
function PublicationDetailComponent_Conditional_4_Conditional_25_Conditional_5_For_1_Template(rf, ctx) { if (rf & 1) {
    const _r13 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 59);
    i0.ɵɵlistener("submit", function PublicationDetailComponent_Conditional_4_Conditional_25_Conditional_5_For_1_Template_form_submit_0_listener($event) { const reserva_r14 = i0.ɵɵrestoreView(_r13).$implicit; const codigo_r15 = i0.ɵɵreference(10); const ctx_r0 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r0.validarIngreso($event, reserva_r14, codigo_r15.value)); });
    i0.ɵɵelementStart(1, "p")(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, PublicationDetailComponent_Conditional_4_Conditional_25_Conditional_5_For_1_Conditional_4_Template, 1, 2);
    i0.ɵɵconditionalCreate(5, PublicationDetailComponent_Conditional_4_Conditional_25_Conditional_5_For_1_Conditional_5_Template, 1, 2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "label", 60);
    i0.ɵɵtext(7, "C\u00F3digo entregado por el inquilino");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "div", 61);
    i0.ɵɵelement(9, "input", 62, 1);
    i0.ɵɵelementStart(11, "button", 63);
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(13, PublicationDetailComponent_Conditional_4_Conditional_25_Conditional_5_For_1_Conditional_13_Template, 1, 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_25_0;
    const reserva_r14 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("Reserva #", reserva_r14.id);
    i0.ɵɵadvance();
    i0.ɵɵconditional(reserva_r14.usuario_nombre || reserva_r14.usuario?.nombre ? 4 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(reserva_r14.fecha_inicio && reserva_r14.fecha_fin ? 5 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("for", "ingreso-" + reserva_r14.id);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("id", "ingreso-" + reserva_r14.id)("readonly", ctx_r0.validandoIngreso() === reserva_r14.id);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r0.validandoIngreso() !== null);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.validandoIngreso() === reserva_r14.id ? "Validando\u2026" : "Validar c\u00F3digo", " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_25_0 = ctx_r0.resultadoIngreso()) ? 13 : -1, tmp_25_0);
} }
function PublicationDetailComponent_Conditional_4_Conditional_25_Conditional_5_ForEmpty_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "No hay reservas pendientes de ingreso para esta publicaci\u00F3n.");
    i0.ɵɵelementEnd();
} }
function PublicationDetailComponent_Conditional_4_Conditional_25_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, PublicationDetailComponent_Conditional_4_Conditional_25_Conditional_5_For_1_Template, 14, 9, "form", null, _forTrack0, false, PublicationDetailComponent_Conditional_4_Conditional_25_Conditional_5_ForEmpty_2_Template, 2, 0, "p");
} if (rf & 2) {
    i0.ɵɵrepeater(ctx);
} }
function PublicationDetailComponent_Conditional_4_Conditional_25_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 55);
    i0.ɵɵtext(1, "Cargando reservas\u2026");
    i0.ɵɵelementEnd();
} }
function PublicationDetailComponent_Conditional_4_Conditional_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 24)(1, "h2", 54);
    i0.ɵɵtext(2, "Validar ingreso");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, PublicationDetailComponent_Conditional_4_Conditional_25_Conditional_3_Template, 1, 1);
    i0.ɵɵconditionalCreate(4, PublicationDetailComponent_Conditional_4_Conditional_25_Conditional_4_Template, 4, 0)(5, PublicationDetailComponent_Conditional_4_Conditional_25_Conditional_5_Template, 3, 1)(6, PublicationDetailComponent_Conditional_4_Conditional_25_Conditional_6_Template, 2, 0, "p", 55);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_4_0;
    let tmp_5_0;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional((tmp_4_0 = ctx_r0.resultadoIngreso()) ? 3 : -1, tmp_4_0);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.errorIngresos() ? 4 : (tmp_5_0 = ctx_r0.ingresosPendientes()) ? 5 : 6, tmp_5_0);
} }
function PublicationDetailComponent_Conditional_4_Conditional_44_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "span");
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 64);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "small");
    i0.ɵɵtext(6, "Tipo de propiedad");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r5 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 20);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r5.tipoPropiedad?.nombre);
} }
function PublicationDetailComponent_Conditional_4_Conditional_45_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "span");
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 65);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "small");
    i0.ɵɵtext(6, "Modalidad de alquiler");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r5 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 20);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r5.modalidad?.nombre);
} }
function PublicationDetailComponent_Conditional_4_Conditional_51_Template(rf, ctx) { if (rf & 1) {
    const _r17 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 66);
    i0.ɵɵlistener("click", function PublicationDetailComponent_Conditional_4_Conditional_51_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r17); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.descripcionExpandida.set(!ctx_r0.descripcionExpandida())); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵattribute("aria-expanded", ctx_r0.descripcionExpandida());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.descripcionExpandida() ? "Ver menos" : "Ver m\u00E1s", " ");
} }
function PublicationDetailComponent_Conditional_4_Conditional_52_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 32)(1, "div", 67)(2, "div")(3, "span", 68);
    i0.ɵɵtext(4, "Ubicaci\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "h2");
    i0.ɵɵtext(6, "Conoc\u00E9 la zona");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p");
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(8, "svg", 21);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(10, "a", 69);
    i0.ɵɵtext(11, " Abrir en Google Maps ");
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(12, "svg", 70);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(13, "div", 71);
    i0.ɵɵelement(14, "iframe", 72)(15, "a", 73);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r5 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(8);
    i0.ɵɵproperty("size", 17);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.location(item_r5));
    i0.ɵɵadvance();
    i0.ɵɵproperty("href", ctx_r0.mapUrl(), i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 16);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("src", ctx, i0.ɵɵsanitizeResourceUrl)("title", "Mapa de " + ctx_r0.location(item_r5));
    i0.ɵɵadvance();
    i0.ɵɵproperty("href", ctx_r0.mapUrl(), i0.ɵɵsanitizeUrl);
    i0.ɵɵattribute("aria-label", "Abrir la ubicaci\u00F3n de " + item_r5.titulo + " en Google Maps");
} }
function PublicationDetailComponent_Conditional_4_Conditional_53_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 75);
    i0.ɵɵtext(1, "Reserva no disponible");
    i0.ɵɵelementEnd();
} }
function PublicationDetailComponent_Conditional_4_Conditional_53_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 33)(1, "h2", 74);
    i0.ɵɵtext(2, "Actividades pausadas");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4, "Este anunciante paus\u00F3 sus actividades. Por el momento, no acepta nuevas reservas.");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, PublicationDetailComponent_Conditional_4_Conditional_53_Conditional_5_Template, 2, 0, "button", 75);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(5);
    i0.ɵɵconditional(ctx_r0.esTemporaria() ? 5 : -1);
} }
function PublicationDetailComponent_Conditional_4_Conditional_54_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 80);
    i0.ɵɵtext(1, "El anunciante todav\u00EDa no carg\u00F3 d\u00EDas disponibles para esta propiedad.");
    i0.ɵɵelementEnd();
} }
function PublicationDetailComponent_Conditional_4_Conditional_54_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 92)(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "div", 93)(6, "strong");
    i0.ɵɵtext(7, "Total");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "strong");
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r5 = i0.ɵɵnextContext(2);
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", ctx_r0.bookingDays(), " ", ctx_r0.bookingDays() === 1 ? "d\u00EDa" : "d\u00EDas");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", item_r5.tipoMoneda?.nombre ?? "$", " ", ctx_r0.formatAmount(ctx_r0.bookingTotal()));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate2("", item_r5.tipoMoneda?.nombre ?? "$", " ", ctx_r0.formatAmount(ctx_r0.bookingTotal()));
} }
function PublicationDetailComponent_Conditional_4_Conditional_54_Conditional_34_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 86);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.bookingError());
} }
function PublicationDetailComponent_Conditional_4_Conditional_54_Conditional_35_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 87);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.bookingSuccess());
} }
function PublicationDetailComponent_Conditional_4_Conditional_54_Conditional_37_Template(rf, ctx) { if (rf & 1) {
    const _r19 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "a", 94);
    i0.ɵɵlistener("click", function PublicationDetailComponent_Conditional_4_Conditional_54_Conditional_37_Template_a_click_0_listener($event) { const whatsapp_r20 = i0.ɵɵrestoreView(_r19); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.confirmarWhatsapp($event, whatsapp_r20)); });
    i0.ɵɵtext(1, "Contactar por WhatsApp");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵproperty("href", ctx, i0.ɵɵsanitizeUrl);
} }
function PublicationDetailComponent_Conditional_4_Conditional_54_Conditional_38_Template(rf, ctx) { if (rf & 1) {
    const _r21 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 58);
    i0.ɵɵlistener("click", function PublicationDetailComponent_Conditional_4_Conditional_54_Conditional_38_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r21); const item_r5 = i0.ɵɵnextContext(2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.chatear(item_r5)); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 95);
    i0.ɵɵtext(2, " Enviar mensaje");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 18);
} }
function PublicationDetailComponent_Conditional_4_Conditional_54_Template(rf, ctx) { if (rf & 1) {
    const _r18 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 34)(1, "div", 76)(2, "div", 77)(3, "div")(4, "span");
    i0.ɵɵtext(5, "Disponibilidad");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "h2");
    i0.ɵɵtext(7, "Eleg\u00ED las fechas de tu alquiler");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(8, "app-availability-calendar", 78);
    i0.ɵɵlistener("rangeChange", function PublicationDetailComponent_Conditional_4_Conditional_54_Template_app_availability_calendar_rangeChange_8_listener($event) { i0.ɵɵrestoreView(_r18); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.selectBookingDate($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "p", 79);
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(11, PublicationDetailComponent_Conditional_4_Conditional_54_Conditional_11_Template, 2, 0, "p", 80);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "aside", 81)(13, "div", 82)(14, "strong");
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "span");
    i0.ɵɵtext(17, "por d\u00EDa");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(18, "div", 83)(19, "div")(20, "span");
    i0.ɵɵtext(21, "Primer d\u00EDa");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "strong");
    i0.ɵɵtext(23);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(24, "div")(25, "span");
    i0.ɵɵtext(26, "\u00DAltimo d\u00EDa");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "strong");
    i0.ɵɵtext(28);
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(29, PublicationDetailComponent_Conditional_4_Conditional_54_Conditional_29_Template, 10, 6);
    i0.ɵɵelementStart(30, "button", 84);
    i0.ɵɵlistener("click", function PublicationDetailComponent_Conditional_4_Conditional_54_Template_button_click_30_listener() { i0.ɵɵrestoreView(_r18); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.openPayment()); });
    i0.ɵɵtext(31);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(32, "small", 85);
    i0.ɵɵtext(33, "El pago se realiza de forma segura en Mercado Pago.");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(34, PublicationDetailComponent_Conditional_4_Conditional_54_Conditional_34_Template, 2, 1, "p", 86);
    i0.ɵɵconditionalCreate(35, PublicationDetailComponent_Conditional_4_Conditional_54_Conditional_35_Template, 2, 1, "p", 87);
    i0.ɵɵelementStart(36, "div", 88);
    i0.ɵɵconditionalCreate(37, PublicationDetailComponent_Conditional_4_Conditional_54_Conditional_37_Template, 2, 1, "a", 89);
    i0.ɵɵconditionalCreate(38, PublicationDetailComponent_Conditional_4_Conditional_54_Conditional_38_Template, 3, 1, "button", 90);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(39, "small", 91);
    i0.ɵɵtext(40, "Si continu\u00E1s por WhatsApp, la conversaci\u00F3n ocurre fuera de DEPA y no podremos intervenir ante inconvenientes.");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    let tmp_18_0;
    const item_r5 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(8);
    i0.ɵɵproperty("dates", ctx_r0.availability())("loading", ctx_r0.availabilityLoading())("selectedStart", ctx_r0.selectedStart())("selectedEnd", ctx_r0.selectedEnd());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("La reprogramaci\u00F3n de fechas solo estar\u00E1 disponible con ", ctx_r0.diasMinimosReprogramacion, " d\u00EDas o m\u00E1s de antelaci\u00F3n al inicio de la reserva.");
    i0.ɵɵadvance();
    i0.ɵɵconditional(!ctx_r0.availabilityLoading() && !ctx_r0.availability().length && !ctx_r0.bookingError() ? 11 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.price(item_r5));
    i0.ɵɵadvance(8);
    i0.ɵɵtextInterpolate(ctx_r0.formatDate(ctx_r0.selectedStart()));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.formatDate(ctx_r0.selectedEnd()));
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.bookingDays() ? 29 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r0.esMiPublicacion() || !ctx_r0.bookingDays() || ctx_r0.availabilityLoading());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.esMiPublicacion() ? "No pod\u00E9s reservar tu publicaci\u00F3n" : ctx_r0.bookingDays() ? "Reservar " + ctx_r0.bookingDays() + (ctx_r0.bookingDays() === 1 ? " d\u00EDa" : " d\u00EDas") : "Eleg\u00ED las fechas para reservar");
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r0.bookingError() ? 34 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.bookingSuccess() ? 35 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_18_0 = ctx_r0.whatsappUrl(item_r5)) ? 37 : -1, tmp_18_0);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!ctx_r0.esMiPublicacion() ? 38 : -1);
} }
function PublicationDetailComponent_Conditional_4_Conditional_55_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    const _r22 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "a", 103);
    i0.ɵɵlistener("click", function PublicationDetailComponent_Conditional_4_Conditional_55_Conditional_9_Template_a_click_0_listener($event) { const whatsapp_r23 = i0.ɵɵrestoreView(_r22); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.confirmarWhatsapp($event, whatsapp_r23)); });
    i0.ɵɵtext(1, "Contactar por WhatsApp");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵproperty("href", ctx, i0.ɵɵsanitizeUrl);
} }
function PublicationDetailComponent_Conditional_4_Conditional_55_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 100);
    i0.ɵɵtext(1, "Contactar por WhatsApp");
    i0.ɵɵelementEnd();
} }
function PublicationDetailComponent_Conditional_4_Conditional_55_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 101);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 104);
    i0.ɵɵtext(2, " Administrar publicaci\u00F3n");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r5 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(2, _c3, item_r5.id));
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 18);
} }
function PublicationDetailComponent_Conditional_4_Conditional_55_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    const _r24 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 105);
    i0.ɵɵlistener("click", function PublicationDetailComponent_Conditional_4_Conditional_55_Conditional_12_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r24); const item_r5 = i0.ɵɵnextContext(2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.chatear(item_r5)); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 95);
    i0.ɵɵtext(2, " Enviar Mensaje");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 18);
} }
function PublicationDetailComponent_Conditional_4_Conditional_55_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 35)(1, "div", 96)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementStart(4, "span", 97);
    i0.ɵɵtext(5, " / mes");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "span");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 98);
    i0.ɵɵconditionalCreate(9, PublicationDetailComponent_Conditional_4_Conditional_55_Conditional_9_Template, 2, 1, "a", 99)(10, PublicationDetailComponent_Conditional_4_Conditional_55_Conditional_10_Template, 2, 0, "span", 100);
    i0.ɵɵconditionalCreate(11, PublicationDetailComponent_Conditional_4_Conditional_55_Conditional_11_Template, 3, 4, "a", 101)(12, PublicationDetailComponent_Conditional_4_Conditional_55_Conditional_12_Template, 3, 1, "button", 102);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "small", 91);
    i0.ɵɵtext(14, "Si continu\u00E1s por WhatsApp, la conversaci\u00F3n ocurre fuera de DEPA y no podremos intervenir ante inconvenientes.");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_6_0;
    const item_r5 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.price(item_r5));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1("Alquiler ", item_r5.modalidad?.nombre ?? "");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_6_0 = ctx_r0.whatsappUrl(item_r5)) ? 9 : 10, tmp_6_0);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.esMiPublicacion() ? 11 : 12);
} }
function PublicationDetailComponent_Conditional_4_Conditional_56_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 17);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 51);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 13);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.verifiedLabel());
} }
function PublicationDetailComponent_Conditional_4_Conditional_56_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 21);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r5 = i0.ɵɵnextContext(2);
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 14);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.city(item_r5));
} }
function PublicationDetailComponent_Conditional_4_Conditional_56_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 36)(1, "div", 106);
    i0.ɵɵelement(2, "app-avatar", 107);
    i0.ɵɵelementStart(3, "div")(4, "h2");
    i0.ɵɵtext(5);
    i0.ɵɵconditionalCreate(6, PublicationDetailComponent_Conditional_4_Conditional_56_Conditional_6_Template, 3, 2, "span", 17);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(7, PublicationDetailComponent_Conditional_4_Conditional_56_Conditional_7_Template, 3, 2, "p");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "dl", 108)(9, "div")(10, "dt");
    i0.ɵɵtext(11, "Tipo de anunciante");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "dd");
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(14, "div")(15, "dt");
    i0.ɵɵtext(16, "Publicaciones activas");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "dd");
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(19, "a", 109);
    i0.ɵɵtext(20, "Ver perfil completo");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const advertiser_r25 = ctx;
    const item_r5 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("foto", ctx_r0.perfilAnunciante()?.foto_url ?? advertiser_r25.usuario?.foto_url)("nombre", ctx_r0.advertiserName());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("", ctx_r0.advertiserName(), " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(advertiser_r25.verificado ? 6 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.city(item_r5) ? 7 : -1);
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(ctx_r0.advertiserTypeName());
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.activeCount() === null ? "\u2014" : ctx_r0.activeCount() + (ctx_r0.activeCount() === 1 ? " publicaci\u00F3n activa" : " publicaciones activas"));
    i0.ɵɵadvance();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(8, _c4, advertiser_r25.idUsuario));
} }
function PublicationDetailComponent_Conditional_4_Conditional_57_Template(rf, ctx) { if (rf & 1) {
    const _r26 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-payment-summary", 110);
    i0.ɵɵlistener("cerrar", function PublicationDetailComponent_Conditional_4_Conditional_57_Template_app_payment_summary_cerrar_0_listener() { i0.ɵɵrestoreView(_r26); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.closePayment()); })("recotizar", function PublicationDetailComponent_Conditional_4_Conditional_57_Template_app_payment_summary_recotizar_0_listener() { i0.ɵɵrestoreView(_r26); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.cotizarPago()); })("continuar", function PublicationDetailComponent_Conditional_4_Conditional_57_Template_app_payment_summary_continuar_0_listener($event) { i0.ɵɵrestoreView(_r26); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.confirmPayment($event)); })("aceptarConversion", function PublicationDetailComponent_Conditional_4_Conditional_57_Template_app_payment_summary_aceptarConversion_0_listener($event) { i0.ɵɵrestoreView(_r26); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.aceptaConversion.set($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r5 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("publicacion", item_r5)("anunciante", ctx_r0.advertiserName())("ubicacion", ctx_r0.location(item_r5))("inicio", ctx_r0.selectedStart())("fin", ctx_r0.selectedEnd())("presupuesto", ctx_r0.presupuesto())("cotizando", ctx_r0.cotizando())("procesando", ctx_r0.processingPayment())("vencido", ctx_r0.presupuestoVencido())("conversionAceptada", ctx_r0.aceptaConversion())("error", ctx_r0.bookingError());
} }
function PublicationDetailComponent_Conditional_4_Conditional_58_Template(rf, ctx) { if (rf & 1) {
    const _r27 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 111);
    i0.ɵɵlistener("click", function PublicationDetailComponent_Conditional_4_Conditional_58_Template_div_click_0_listener() { i0.ɵɵrestoreView(_r27); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.closeImagePreview()); });
    i0.ɵɵelementStart(1, "section", 112);
    i0.ɵɵlistener("click", function PublicationDetailComponent_Conditional_4_Conditional_58_Template_section_click_1_listener($event) { return $event.stopPropagation(); });
    i0.ɵɵelementStart(2, "button", 113);
    i0.ɵɵlistener("click", function PublicationDetailComponent_Conditional_4_Conditional_58_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r27); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.closeImagePreview()); });
    i0.ɵɵtext(3, "\u00D7");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(4, "img", 41);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r5 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("src", ctx.url, i0.ɵɵsanitizeUrl)("alt", item_r5.titulo);
} }
function PublicationDetailComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵconditionalCreate(0, PublicationDetailComponent_Conditional_4_Conditional_0_Template, 4, 1, "div", 7);
    i0.ɵɵelementStart(1, "div", 8)(2, "div", 9);
    i0.ɵɵrepeaterCreate(3, PublicationDetailComponent_Conditional_4_For_4_Template, 2, 5, "button", 10, _forTrack0, false, PublicationDetailComponent_Conditional_4_ForEmpty_5_Template, 2, 0, "div", 11);
    i0.ɵɵconditionalCreate(6, PublicationDetailComponent_Conditional_4_Conditional_6_Template, 6, 4);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(7, PublicationDetailComponent_Conditional_4_Conditional_7_Template, 3, 0, "div", 12);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "div", 13)(9, "div", 14)(10, "div", 15);
    i0.ɵɵconditionalCreate(11, PublicationDetailComponent_Conditional_4_Conditional_11_Template, 2, 3, "span", 16);
    i0.ɵɵconditionalCreate(12, PublicationDetailComponent_Conditional_4_Conditional_12_Template, 3, 2, "span", 17);
    i0.ɵɵconditionalCreate(13, PublicationDetailComponent_Conditional_4_Conditional_13_Template, 2, 3, "a", 18);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "h1");
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "div", 19)(17, "div")(18, "p", 20);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(19, "svg", 21);
    i0.ɵɵtext(20);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(21, "p", 22);
    i0.ɵɵtext(22);
    i0.ɵɵpipe(23, "relativeTime");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(24, PublicationDetailComponent_Conditional_4_Conditional_24_Template, 3, 7, "button", 23);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(25, PublicationDetailComponent_Conditional_4_Conditional_25_Template, 7, 2, "section", 24);
    i0.ɵɵelementStart(26, "section", 25)(27, "h2");
    i0.ɵɵtext(28, "Caracter\u00EDsticas principales");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "div", 26)(30, "div")(31, "span");
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(32, "svg", 27);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(33, "strong");
    i0.ɵɵtext(34);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "small");
    i0.ɵɵtext(36, "Ambientes");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(37, "div")(38, "span");
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(39, "svg", 28);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(40, "strong");
    i0.ɵɵtext(41);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(42, "small");
    i0.ɵɵtext(43, "Superficie total");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(44, PublicationDetailComponent_Conditional_4_Conditional_44_Template, 7, 2, "div");
    i0.ɵɵconditionalCreate(45, PublicationDetailComponent_Conditional_4_Conditional_45_Template, 7, 2, "div");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(46, "section", 29)(47, "h2");
    i0.ɵɵtext(48, "Descripci\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(49, "p", 30);
    i0.ɵɵtext(50);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(51, PublicationDetailComponent_Conditional_4_Conditional_51_Template, 2, 2, "button", 31);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(52, PublicationDetailComponent_Conditional_4_Conditional_52_Template, 16, 8, "section", 32);
    i0.ɵɵconditionalCreate(53, PublicationDetailComponent_Conditional_4_Conditional_53_Template, 6, 1, "section", 33);
    i0.ɵɵconditionalCreate(54, PublicationDetailComponent_Conditional_4_Conditional_54_Template, 41, 16, "section", 34)(55, PublicationDetailComponent_Conditional_4_Conditional_55_Template, 15, 4, "section", 35);
    i0.ɵɵconditionalCreate(56, PublicationDetailComponent_Conditional_4_Conditional_56_Template, 21, 10, "section", 36);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(57, PublicationDetailComponent_Conditional_4_Conditional_57_Template, 1, 11, "app-payment-summary", 37);
    i0.ɵɵconditionalCreate(58, PublicationDetailComponent_Conditional_4_Conditional_58_Template, 5, 2, "div", 38);
    i0.ɵɵelementStart(59, "app-confirm-dialog", 39, 0);
    i0.ɵɵlistener("confirmar", function PublicationDetailComponent_Conditional_4_Template_app_confirm_dialog_confirmar_59_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.abrirWhatsappConfirmado()); })("cancelar", function PublicationDetailComponent_Conditional_4_Template_app_confirm_dialog_cancelar_59_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.cerrarConfirmacionWhatsapp()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_24_0;
    let tmp_27_0;
    let tmp_29_0;
    const item_r5 = ctx;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵconditional(item_r5.eliminada ? 0 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r0.currentImage() ? i0.ɵɵpureFunction1(29, _c1, ctx_r0.currentImage()) : i0.ɵɵpureFunction0(31, _c2));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r0.images().length > 1 ? 6 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.images().length > 1 ? 7 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(item_r5.modalidad?.nombre ? 11 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(item_r5.anunciante?.verificado ? 12 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!ctx_r0.administracion && ctx_r0.esMiPublicacion() && !item_r5.eliminada ? 13 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r5.titulo);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("size", 16);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.location(item_r5));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(23, 27, item_r5.fecha_publicacion));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!ctx_r0.administracion && !ctx_r0.esMiPublicacion() && !item_r5.eliminada ? 24 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!ctx_r0.administracion && ctx_r0.esMiPublicacion() && ctx_r0.esTemporaria() && !item_r5.eliminada ? 25 : -1);
    i0.ɵɵadvance(7);
    i0.ɵɵproperty("size", 20);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", item_r5.cantidad_ambientes, " Ambientes");
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("size", 20);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", item_r5.superficie, " m\u00B2");
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(item_r5.tipoPropiedad?.nombre ? 44 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(item_r5.modalidad?.nombre ? 45 : -1);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.descripcionExpandida() ? item_r5.descripcion : ctx_r0.descripcionCorta());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.descripcionTieneMas() ? 51 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_24_0 = ctx_r0.mapEmbedUrl()) ? 52 : -1, tmp_24_0);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!ctx_r0.administracion && !item_r5.eliminada && item_r5.anunciante?.actividades_pausadas ? 53 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!ctx_r0.administracion && ctx_r0.esTemporaria() && !item_r5.eliminada && !item_r5.anunciante?.actividades_pausadas ? 54 : !ctx_r0.administracion && !ctx_r0.esTemporaria() && !item_r5.eliminada ? 55 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_27_0 = item_r5.anunciante) ? 56 : -1, tmp_27_0);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.paymentOpen() && !item_r5.eliminada ? 57 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_29_0 = ctx_r0.imagePreviewOpen() && ctx_r0.currentImage()) ? 58 : -1, tmp_29_0);
} }
export class PublicationDetailComponent {
    route = inject(ActivatedRoute);
    listings = inject(ListingService);
    router = inject(Router);
    auth = inject(AuthService);
    chat = inject(ChatService);
    availabilityApi = inject(AvailabilityService);
    reservations = inject(ReservationService);
    favorites = inject(FavoritesService);
    anunciantesPublicos = inject(AnunciantePublicoService);
    sanitizer = inject(DomSanitizer);
    destroyRef = inject(DestroyRef);
    consultaPresupuesto;
    confirmacionWhatsapp = viewChild.required('confirmacionWhatsapp', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "confirmacionWhatsapp" }] : /* istanbul ignore next */ []));
    publication = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "publication" }] : /* istanbul ignore next */ []));
    descripcionExpandida = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "descripcionExpandida" }] : /* istanbul ignore next */ []));
    descripcionCorta = computed(() => {
        const descripcion = this.publication()?.descripcion ?? '';
        const primerasLineas = descripcion.split('\n').slice(0, 5).join('\n');
        const resumen = Array.from(primerasLineas).slice(0, 300).join('').trimEnd();
        return resumen.length < descripcion.trimEnd().length ? `${resumen}…` : descripcion;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "descripcionCorta" }] : /* istanbul ignore next */ []));
    descripcionTieneMas = computed(() => this.descripcionCorta() !== (this.publication()?.descripcion ?? ''), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "descripcionTieneMas" }] : /* istanbul ignore next */ []));
    perfilAnunciante = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "perfilAnunciante" }] : /* istanbul ignore next */ []));
    loading = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "loading" }] : /* istanbul ignore next */ []));
    error = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    selectedImage = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedImage" }] : /* istanbul ignore next */ []));
    direction = signal('next', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "direction" }] : /* istanbul ignore next */ []));
    imagePreviewOpen = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "imagePreviewOpen" }] : /* istanbul ignore next */ []));
    activeCount = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "activeCount" }] : /* istanbul ignore next */ []));
    availability = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "availability" }] : /* istanbul ignore next */ []));
    availabilityLoading = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "availabilityLoading" }] : /* istanbul ignore next */ []));
    selectedStart = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedStart" }] : /* istanbul ignore next */ []));
    selectedEnd = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedEnd" }] : /* istanbul ignore next */ []));
    bookingError = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "bookingError" }] : /* istanbul ignore next */ []));
    bookingSuccess = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "bookingSuccess" }] : /* istanbul ignore next */ []));
    paymentOpen = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "paymentOpen" }] : /* istanbul ignore next */ []));
    processingPayment = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "processingPayment" }] : /* istanbul ignore next */ []));
    presupuesto = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "presupuesto" }] : /* istanbul ignore next */ []));
    cotizando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cotizando" }] : /* istanbul ignore next */ []));
    aceptaConversion = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "aceptaConversion" }] : /* istanbul ignore next */ []));
    savingFavorite = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "savingFavorite" }] : /* istanbul ignore next */ []));
    ingresosPendientes = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ingresosPendientes" }] : /* istanbul ignore next */ []));
    errorIngresos = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorIngresos" }] : /* istanbul ignore next */ []));
    validandoIngreso = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "validandoIngreso" }] : /* istanbul ignore next */ []));
    resultadoIngreso = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resultadoIngreso" }] : /* istanbul ignore next */ []));
    whatsappPendiente = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "whatsappPendiente" }] : /* istanbul ignore next */ []));
    images = computed(() => this.publication()?.imagenes ?? [], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "images" }] : /* istanbul ignore next */ []));
    currentImage = computed(() => this.images()[this.selectedImage()] ?? null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "currentImage" }] : /* istanbul ignore next */ []));
    esMiPublicacion = computed(() => {
        const anunciante = this.publication()?.anunciante;
        return (anunciante?.usuario?.id ?? anunciante?.idUsuario) === Number(this.auth.currentUser()?.sub);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "esMiPublicacion" }] : /* istanbul ignore next */ []));
    isFavorite = computed(() => {
        const id = this.publication()?.id;
        return id ? this.favorites.isFavorite(id) : false;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "isFavorite" }] : /* istanbul ignore next */ []));
    esTemporaria = computed(() => admiteReservasPorFecha(this.publication()?.modalidad), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "esTemporaria" }] : /* istanbul ignore next */ []));
    diasMinimosReprogramacion = DIAS_MINIMOS_REPROGRAMACION;
    advertiserName = computed(() => {
        const nombrePublico = this.perfilAnunciante()?.nombre_publico?.trim();
        if (nombrePublico)
            return nombrePublico;
        const user = this.publication()?.anunciante?.usuario;
        return user ? `${user.nombre} ${user.apellido}`.trim() : 'Anunciante';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "advertiserName" }] : /* istanbul ignore next */ []));
    advertiserTypeName = computed(() => this.perfilAnunciante()?.tipoAnunciante?.nombre ??
        this.publication()?.anunciante?.tipoAnunciante?.nombre ??
        'Anunciante', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "advertiserTypeName" }] : /* istanbul ignore next */ []));
    verifiedLabel = computed(() => esInmobiliaria(this.perfilAnunciante()?.tipoAnunciante ?? this.publication()?.anunciante?.tipoAnunciante)
        ? 'Inmobiliaria verificada'
        : 'Dueño Verificado', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "verifiedLabel" }] : /* istanbul ignore next */ []));
    bookingDays = computed(() => rentalDays(this.selectedStart(), this.selectedEnd()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "bookingDays" }] : /* istanbul ignore next */ []));
    bookingTotal = computed(() => this.bookingDays() * Number(this.publication()?.precio ?? 0), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "bookingTotal" }] : /* istanbul ignore next */ []));
    mapUrl = computed(() => {
        const item = this.publication();
        if (!item)
            return '';
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.mapQuery(item))}`;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mapUrl" }] : /* istanbul ignore next */ []));
    mapEmbedUrl = computed(() => {
        const item = this.publication();
        if (!item)
            return null;
        const query = encodeURIComponent(this.mapQuery(item));
        return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.google.com/maps?q=${query}&output=embed`);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mapEmbedUrl" }] : /* istanbul ignore next */ []));
    administracion = this.route.snapshot.data['administracion'] === true;
    constructor() {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (!Number.isInteger(id) || id < 1) {
            this.error.set('La publicación solicitada no es válida.');
            this.loading.set(false);
            return;
        }
        const publicacion = this.administracion ? this.listings.getByIdForAdmin(id) : this.listings.getById(id);
        publicacion
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
            next: (publication) => {
                this.publication.set(publication);
                if (!this.administracion)
                    this.registerView(publication);
                const idAnunciante = publication.anunciante?.idUsuario;
                if (idAnunciante) {
                    this.anunciantesPublicos.getPublicProfile(idAnunciante).pipe(catchError(() => of(null)), takeUntilDestroyed(this.destroyRef)).subscribe((perfil) => this.perfilAnunciante.set(perfil));
                    this.listings.getByAdvertiser(idAnunciante).subscribe({
                        next: (items) => this.activeCount.set(items.length),
                    });
                }
                if (!this.administracion && this.esTemporaria() && !publication.eliminada && !publication.anunciante?.actividades_pausadas) {
                    this.loadAvailability(publication.id);
                }
                if (!this.administracion && this.esMiPublicacion() && this.esTemporaria() && !publication.eliminada) {
                    this.cargarIngresos(publication.id);
                }
            },
            error: () => this.error.set(this.administracion
                ? 'No pudimos cargar la publicación de la reserva.'
                : 'Esta publicación no está disponible para consultas ni nuevas reservas. Si ya tenés una reserva, podés consultarla en Mis reservas y acudir a soporte.'),
        });
    }
    cargarIngresos(idPublicacion) {
        this.errorIngresos.set(false);
        this.ingresosPendientes.set(null);
        this.reservations.byPublication(idPublicacion).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: reservas => this.ingresosPendientes.set(reservas.filter(puedeValidarCodigo)),
            error: () => this.errorIngresos.set(true),
        });
    }
    validarIngreso(evento, reserva, valor) {
        evento.preventDefault();
        if (this.validandoIngreso() !== null || !puedeValidarCodigo(reserva))
            return;
        const codigo = valor.trim().toUpperCase();
        if (codigo.length !== 8) {
            this.resultadoIngreso.set({ reservaId: reserva.id, error: true, mensaje: 'El código debe tener ocho caracteres.' });
            return;
        }
        this.resultadoIngreso.set(null);
        this.validandoIngreso.set(reserva.id);
        this.reservations.validateLodgingCode(reserva.id, codigo).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.validandoIngreso.set(null))).subscribe({
            next: () => {
                this.ingresosPendientes.update(reservas => reservas?.filter(item => item.id !== reserva.id) ?? null);
                this.resultadoIngreso.set({ reservaId: reserva.id, error: false, mensaje: `Ingreso de la reserva #${reserva.id} validado.` });
            },
            error: (err) => this.resultadoIngreso.set({ reservaId: reserva.id, error: true, mensaje: err.message }),
        });
    }
    registerView(publication) {
        if (publication.eliminada)
            return;
        const ownerId = publication.anunciante?.usuario?.id ?? publication.anunciante?.idUsuario;
        if (ownerId === Number(this.auth.currentUser()?.sub))
            return;
        const key = `depa:viewed:${publication.id}`;
        try {
            if (sessionStorage.getItem(key))
                return;
            sessionStorage.setItem(key, '1');
        }
        catch {
            // El contador sigue funcionando aunque el navegador bloquee sessionStorage.
        }
        this.listings.registerView(publication.id).subscribe({ error: () => undefined });
    }
    previousImage() {
        const total = this.images().length;
        if (total < 2)
            return;
        this.direction.set('prev');
        this.selectedImage.update((index) => (index - 1 + total) % total);
    }
    nextImage() {
        const total = this.images().length;
        if (total < 2)
            return;
        this.direction.set('next');
        this.selectedImage.update((index) => (index + 1) % total);
    }
    selectImage(index) {
        this.direction.set(index < this.selectedImage() ? 'prev' : 'next');
        this.selectedImage.set(index);
    }
    closeImagePreview() {
        this.imagePreviewOpen.set(false);
    }
    openImagePreview() {
        if (this.currentImage())
            this.imagePreviewOpen.set(true);
    }
    chatear(item) {
        if (item.eliminada)
            return;
        const usuario = item.anunciante?.usuario;
        if (!usuario)
            return;
        if (!this.auth.isAuthenticated) {
            this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
            return;
        }
        this.chat.abrir({
            idPublicacion: item.id,
            idOtroUsuario: usuario.id,
            titulo: item.titulo,
            nombreOtro: this.advertiserName(),
            fotoOtro: usuario.foto_url ?? null,
        });
    }
    toggleFavorite(item) {
        if (item.eliminada || this.savingFavorite())
            return;
        if (!this.auth.isAuthenticated) {
            this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
            return;
        }
        this.savingFavorite.set(true);
        this.favorites
            .toggle(item.id)
            .pipe(finalize(() => this.savingFavorite.set(false)))
            .subscribe();
    }
    price(item) {
        const amount = Number(item.precio).toLocaleString('es-AR', { maximumFractionDigits: 0 });
        return `${item.tipoMoneda?.nombre ?? '$'} ${amount}`;
    }
    location(item) {
        return [item.direccion, item.ciudad?.nombre, item.provincia?.nombre].filter(Boolean).join(', ');
    }
    mapQuery(item) {
        const latitud = Number(item.latitud);
        const longitud = Number(item.longitud);
        return item.latitud != null &&
            item.longitud != null &&
            Number.isFinite(latitud) &&
            Number.isFinite(longitud)
            ? `${latitud},${longitud}`
            : this.location(item);
    }
    city(item) {
        return [item.ciudad?.nombre, item.provincia?.nombre].filter(Boolean).join(', ');
    }
    whatsappUrl(item) {
        if (item.eliminada)
            return null;
        const phone = item.anunciante?.numero_contacto || item.anunciante?.usuario?.telefono;
        const digits = phone?.replace(/\D/g, '');
        return digits
            ? `https://wa.me/${digits}?text=${encodeURIComponent(`Hola, consulto por ${item.titulo}`)}`
            : null;
    }
    selectBookingDate(range) {
        this.bookingError.set('');
        this.bookingSuccess.set('');
        this.selectedStart.set(range.start);
        this.selectedEnd.set(range.end);
    }
    openPayment() {
        const publicacion = this.publication();
        if (!publicacion || publicacion.eliminada || publicacion.anunciante?.actividades_pausadas)
            return;
        this.bookingError.set('');
        if (!this.auth.isAuthenticated) {
            this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
            return;
        }
        const start = this.selectedStart();
        const end = this.selectedEnd();
        if (!start || !end) {
            this.bookingError.set('Elegí un día o un período completo para continuar.');
            return;
        }
        if (!isRentalRangeAvailable(start, end, this.availability())) {
            this.bookingError.set('Los días elegidos ya no están disponibles. Elegí otras fechas.');
            return;
        }
        this.paymentOpen.set(true);
        this.cotizarPago();
    }
    closePayment() {
        if (this.processingPayment())
            return;
        this.consultaPresupuesto?.unsubscribe();
        this.paymentOpen.set(false);
        this.presupuesto.set(null);
        this.cotizando.set(false);
        this.aceptaConversion.set(false);
    }
    cotizarPago() {
        const item = this.publication(), inicio = this.selectedStart(), fin = this.selectedEnd();
        if (!item || item.eliminada || !inicio || !fin || this.processingPayment())
            return;
        this.consultaPresupuesto?.unsubscribe();
        this.presupuesto.set(null);
        this.aceptaConversion.set(false);
        this.cotizando.set(true);
        this.bookingError.set('');
        this.consultaPresupuesto = this.reservations
            .quote({ id_publicacion: item.id, fecha_inicio: inicio, fecha_fin: fin })
            .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.cotizando.set(false)))
            .subscribe({
            next: (presupuesto) => this.presupuesto.set(presupuesto),
            error: (err) => this.bookingError.set(err.message),
        });
    }
    presupuestoVencido() {
        return !this.presupuesto() || Date.now() >= new Date(this.presupuesto().vence_en).getTime();
    }
    confirmPayment(event) {
        event.preventDefault();
        const item = this.publication();
        const start = this.selectedStart();
        const end = this.selectedEnd();
        if (!item || item.eliminada || !start || !end || this.processingPayment())
            return;
        const presupuesto = this.presupuesto();
        if (!presupuesto || this.cotizando())
            return;
        if (this.presupuestoVencido()) {
            this.bookingError.set('El presupuesto venció. Volvé a cotizar antes de pagar.');
            return;
        }
        if (presupuesto.moneda_origen === 'USD' && !this.aceptaConversion()) {
            this.bookingError.set('Aceptá la cotización y el total en pesos antes de continuar.');
            return;
        }
        this.processingPayment.set(true);
        this.bookingError.set('');
        this.reservations
            .createCheckout({
            id_publicacion: item.id,
            fecha_inicio: start,
            fecha_fin: end,
            presupuesto_token: presupuesto.token,
        })
            .pipe(finalize(() => this.processingPayment.set(false)))
            .subscribe({
            next: (checkout) => {
                try {
                    sessionStorage.setItem('depa:ultima-reserva', String(checkout.reserva_id));
                }
                catch {
                    // El retorno también incluye external_reference; sessionStorage es solo respaldo.
                }
                window.location.assign(checkout.checkout_url);
            },
            error: (err) => {
                if (err.status === 409) {
                    this.presupuesto.set(null);
                    this.aceptaConversion.set(false);
                }
                this.bookingError.set(err.message);
                this.loadAvailability(item.id);
            },
        });
    }
    formatDate(value) {
        if (!value)
            return 'Elegir fecha';
        return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(this.parseDate(value));
    }
    formatAmount(value) {
        return value.toLocaleString('es-AR', { maximumFractionDigits: 0 });
    }
    confirmarWhatsapp(event, url) {
        event.preventDefault();
        this.whatsappPendiente.set(url);
        const disparador = event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
        this.confirmacionWhatsapp().abrir(disparador);
    }
    abrirWhatsappConfirmado() {
        const url = this.whatsappPendiente();
        if (!url)
            return;
        window.open(url, '_blank', 'noopener,noreferrer');
        this.cerrarConfirmacionWhatsapp();
    }
    cerrarConfirmacionWhatsapp() {
        this.confirmacionWhatsapp().cerrar();
        this.whatsappPendiente.set(null);
    }
    loadAvailability(idPublication) {
        this.availabilityLoading.set(true);
        this.availabilityApi
            .getByPublication(idPublication)
            .pipe(finalize(() => this.availabilityLoading.set(false)))
            .subscribe({
            next: (items) => {
                this.availability.set(items);
                const start = this.selectedStart();
                const end = this.selectedEnd();
                if (start && (!end || !isRentalRangeAvailable(start, end, items))) {
                    this.selectedStart.set(null);
                    this.selectedEnd.set(null);
                }
            },
            error: () => {
                this.availability.set([]);
                this.selectedStart.set(null);
                this.selectedEnd.set(null);
                this.bookingError.set('No pudimos cargar la disponibilidad de esta propiedad. Volvé a intentar en unos instantes.');
            },
        });
    }
    parseDate(value) {
        return new Date(`${value.slice(0, 10)}T12:00:00`);
    }
    static ɵfac = function PublicationDetailComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || PublicationDetailComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: PublicationDetailComponent, selectors: [["app-publication-detail"]], viewQuery: function PublicationDetailComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.confirmacionWhatsapp, _c0, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, hostBindings: function PublicationDetailComponent_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("keydown.arrowleft", function PublicationDetailComponent_keydown_arrowleft_HostBindingHandler() { return ctx.previousImage(); }, i0.ɵɵresolveDocument)("keydown.arrowright", function PublicationDetailComponent_keydown_arrowright_HostBindingHandler() { return ctx.nextImage(); }, i0.ɵɵresolveDocument)("keydown.escape", function PublicationDetailComponent_keydown_escape_HostBindingHandler() { return ctx.closeImagePreview(); }, i0.ɵɵresolveDocument);
        } }, decls: 5, vars: 2, consts: [["confirmacionWhatsapp", ""], ["codigo", ""], ["aria-live", "polite", 1, "detail-shell"], ["appVolver", "/admin", "fragmentoVolver", "reclamos"], [1, "state"], [1, "state", "state--error"], ["routerLink", "/"], ["role", "status", 1, "deleted-notice"], [1, "gallery"], [1, "gallery__main"], ["type", "button", 1, "gallery__preview"], [1, "gallery__empty"], [1, "gallery__thumbs"], [1, "content"], [1, "intro"], [1, "badges"], [1, "badge", 3, "badge--temp"], [1, "badge", "badge--verified"], [1, "edit-link", 3, "routerLink"], [1, "intro__meta"], [1, "location"], ["lucideMapPin", "", 3, "size"], [1, "published-date"], ["type", "button", 1, "favorite-button", 3, "is-active", "disabled"], ["aria-labelledby", "ingresos-heading", 1, "booking-card", "ingresos-card"], ["appReveal", "", 1, "features"], [1, "features__grid"], ["lucideHouse", "", 3, "size"], ["lucideRuler", "", 3, "size"], ["appReveal", "", 1, "description"], ["id", "descripcion-publicacion"], ["type", "button", "aria-controls", "descripcion-publicacion", 1, "description__toggle"], ["appReveal", "", 1, "map-section"], ["aria-labelledby", "actividades-pausadas", 1, "booking-card"], ["appReveal", "", 1, "booking-layout"], ["appReveal", "zoom", 1, "price-panel"], ["appReveal", "", 1, "advertiser-card"], [3, "publicacion", "anunciante", "ubicacion", "inicio", "fin", "presupuesto", "cotizando", "procesando", "vencido", "conversionAceptada", "error"], [1, "image-modal-backdrop"], ["identificador", "whatsapp-confirm", "titulo", "Continuar por WhatsApp", "mensaje", "Vas a continuar la conversaci\u00F3n por WhatsApp. DEPA no podr\u00E1 revisar esos mensajes ni ayudarte con acuerdos realizados fuera de la plataforma.", "textoConfirmar", "Continuar por WhatsApp", "textoCancelar", "Volver a DEPA", "tono", "advertencia", 3, "confirmar", "cancelar"], ["type", "button", 1, "gallery__preview", 3, "click"], [3, "src", "alt"], ["type", "button", "aria-label", "Imagen anterior", 1, "gallery__arrow", "gallery__arrow--left", 3, "click"], ["lucideChevronLeft", "", 3, "size"], ["type", "button", "aria-label", "Imagen siguiente", 1, "gallery__arrow", "gallery__arrow--right", 3, "click"], ["lucideChevronRight", "", 3, "size"], [1, "gallery__count"], ["type", "button", 3, "is-active", "animation-delay"], ["type", "button", 3, "click"], ["alt", "", "loading", "lazy", 3, "src"], [1, "badge"], ["lucideBadgeCheck", "", 3, "size"], ["type", "button", 1, "favorite-button", 3, "click", "disabled"], ["lucideBookmark", "", 3, "size"], ["id", "ingresos-heading"], ["role", "status"], ["role", "status", 1, "booking-message", "booking-message--success"], ["role", "alert", 1, "booking-message", "booking-message--error"], ["type", "button", 1, "button", "button--secondary", 3, "click"], [3, "submit"], [3, "for"], [1, "ingresos-card__campo"], ["type", "text", "maxlength", "8", "autocomplete", "off", "autocapitalize", "characters", "spellcheck", "false", "required", "", 3, "id", "readonly"], ["type", "submit", 1, "button", "button--secondary", 3, "disabled"], ["lucideBuilding2", "", 3, "size"], ["lucideClock", "", 3, "size"], ["type", "button", "aria-controls", "descripcion-publicacion", 1, "description__toggle", 3, "click"], [1, "map-section__heading"], [1, "map-section__eyebrow"], ["target", "_blank", "rel", "noopener noreferrer", 1, "map-section__external", 3, "href"], ["lucideExternalLink", "", 3, "size"], [1, "map-section__map"], ["loading", "lazy", "referrerpolicy", "no-referrer-when-downgrade", 3, "src", "title"], ["target", "_blank", "rel", "noopener noreferrer", 1, "map-section__overlay", 3, "href"], ["id", "actividades-pausadas"], ["type", "button", "disabled", "", 1, "button", "button--reserve"], [1, "booking-calendar"], [1, "section-heading"], [3, "rangeChange", "dates", "loading", "selectedStart", "selectedEnd"], [1, "calendar-note"], [1, "calendar-empty"], [1, "booking-card"], [1, "booking-card__price"], [1, "date-summary"], ["type", "button", 1, "button", "button--reserve", "shine", 3, "click", "disabled"], [1, "simulation-note"], [1, "booking-message", "booking-message--error"], [1, "booking-message", "booking-message--success"], [1, "booking-actions"], ["target", "_blank", "rel", "noopener noreferrer", 1, "button", "button--whatsapp", "button--outline", 3, "href"], ["type", "button", 1, "button", "button--secondary"], [1, "external-warning"], [1, "total-row"], [1, "total-row", "total-row--strong"], ["target", "_blank", "rel", "noopener noreferrer", 1, "button", "button--whatsapp", "button--outline", 3, "click", "href"], ["lucideMail", "", 3, "size"], [1, "price-panel__amount"], [1, "price-panel__unit"], [1, "actions"], ["target", "_blank", "rel", "noopener noreferrer", 1, "button", "button--whatsapp", "shine", 3, "href"], ["aria-disabled", "true", 1, "button", "button--whatsapp", "is-disabled"], [1, "button", "button--primary", "shine", 3, "routerLink"], ["type", "button", 1, "button", "button--primary", "shine"], ["target", "_blank", "rel", "noopener noreferrer", 1, "button", "button--whatsapp", "shine", 3, "click", "href"], ["lucideLayoutList", "", 3, "size"], ["type", "button", 1, "button", "button--primary", "shine", 3, "click"], [1, "advertiser-card__head"], [1, "avatar", 3, "foto", "nombre"], [1, "advertiser-card__stats"], [1, "button", "button--primary", "button--block", "shine", 3, "routerLink"], [3, "cerrar", "recotizar", "continuar", "aceptarConversion", "publicacion", "anunciante", "ubicacion", "inicio", "fin", "presupuesto", "cotizando", "procesando", "vencido", "conversionAceptada", "error"], [1, "image-modal-backdrop", 3, "click"], ["role", "dialog", "aria-modal", "true", "aria-label", "Imagen ampliada", 1, "image-modal", 3, "click"], ["type", "button", "aria-label", "Cerrar imagen ampliada", 1, "image-modal__close", 3, "click"]], template: function PublicationDetailComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 2);
            i0.ɵɵconditionalCreate(1, PublicationDetailComponent_Conditional_1_Template, 2, 0, "a", 3);
            i0.ɵɵconditionalCreate(2, PublicationDetailComponent_Conditional_2_Template, 4, 0, "div", 4)(3, PublicationDetailComponent_Conditional_3_Template, 6, 2, "div", 5)(4, PublicationDetailComponent_Conditional_4_Template, 61, 32);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_1_0;
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.administracion ? 1 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.loading() ? 2 : ctx.error() ? 3 : (tmp_1_0 = ctx.publication()) ? 4 : -1, tmp_1_0);
        } }, dependencies: [RouterLink,
            SpinnerComponent,
            RevealDirective,
            VolverDirective,
            AvatarComponent,
            AvailabilityCalendarComponent,
            ConfirmDialogComponent,
            PaymentSummaryComponent,
            LucideBadgeCheck,
            LucideBookmark,
            LucideBuilding2,
            LucideChevronLeft,
            LucideChevronRight,
            LucideClock,
            LucideExternalLink,
            LucideHouse,
            LucideLayoutList,
            LucideMail,
            LucideMapPin,
            LucideRuler,
            RelativeTimePipe], styles: ["[_nghost-%COMP%] { display: block; }\r\n.detail-shell[_ngcontent-%COMP%] { min-height: 65vh; background: var(--%NS%color-surface); }\r\n.state[_ngcontent-%COMP%] { min-height: 55vh; display: grid; place-content: center; justify-items: center; color: var(--%NS%color-text-muted); }\r\n.state--error[_ngcontent-%COMP%] { text-align: center; }\r\n.state--error[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] { color: var(--%NS%color-primary); font-weight: 700; }\r\n.deleted-notice[_ngcontent-%COMP%] { max-width: 1132px; margin: 0 auto; padding: 20px 24px; border-left: 4px solid #b45309; background: #fff7e6; color: #713f12; line-height: 1.5; }\r\n.deleted-notice[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 4px 0 0; }\r\n\r\n.gallery[_ngcontent-%COMP%] { max-width: 1180px; margin: 0 auto; padding: 18px 24px 0; animation: depa-fade-in .6s ease both; }\r\n.gallery__main[_ngcontent-%COMP%] { position: relative; height: clamp(250px, 34vw, 460px); overflow: hidden; border-radius: 14px; background: #e7e8eb; }\r\n.gallery__preview[_ngcontent-%COMP%] { display: block; width: 100%; height: 100%; padding: 0; border: 0; background: transparent; cursor: zoom-in; }\r\n.gallery__img[_ngcontent-%COMP%] { width: 100%; height: 100%; object-fit: cover; display: block; animation: _ngcontent-%COMP%_slide-next .6s cubic-bezier(.22,1,.36,1) both; }\r\n.gallery__img--prev[_ngcontent-%COMP%] { animation-name: _ngcontent-%COMP%_slide-prev; }\r\n@keyframes _ngcontent-%COMP%_slide-next { from { opacity: 0; transform: translateX(6%) scale(1.04); } to { opacity: 1; transform: none; } }\r\n@keyframes _ngcontent-%COMP%_slide-prev { from { opacity: 0; transform: translateX(-6%) scale(1.04); } to { opacity: 1; transform: none; } }\r\n.gallery__empty[_ngcontent-%COMP%] { height: 100%; display: grid; place-items: center; color: var(--%NS%color-text-muted); }\r\n.gallery__arrow[_ngcontent-%COMP%] { position: absolute; top: 50%; translate: 0 -50%; display: grid; place-items: center; width: 44px; height: 44px; border: 0; border-radius: 50%; color: #fff; background: rgba(17, 17, 17, .55); cursor: pointer; backdrop-filter: blur(4px); transition: background .2s ease, transform .25s cubic-bezier(.34,1.56,.64,1); }\r\n.gallery__arrow[_ngcontent-%COMP%]:hover { background: rgba(17, 17, 17, .8); transform: scale(1.12); }\r\n.gallery__arrow--left[_ngcontent-%COMP%] { left: 18px; }\r\n.gallery__arrow--right[_ngcontent-%COMP%] { right: 18px; }\r\n.gallery__count[_ngcontent-%COMP%] { position: absolute; left: 18px; bottom: 16px; padding: 5px 12px; border-radius: 999px; color: #fff; background: rgba(17,17,17,.7); font-size: .8rem; font-weight: 600; }\r\n.gallery__thumbs[_ngcontent-%COMP%] { display: flex; gap: 10px; padding: 12px 16px 0; overflow-x: auto; }\r\n.gallery__thumbs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { width: 152px; height: 86px; flex: 0 0 auto; padding: 0; border: 3px solid transparent; border-radius: 9px; overflow: hidden; background: none; cursor: pointer; opacity: .75; animation: depa-fade-up .5s ease both; transition: opacity .2s ease, border-color .2s ease, transform .2s ease; }\r\n.gallery__thumbs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover { opacity: 1; transform: translateY(-3px); }\r\n.gallery__thumbs[_ngcontent-%COMP%]   button.is-active[_ngcontent-%COMP%] { border-color: var(--%NS%color-accent); opacity: 1; }\r\n.gallery__thumbs[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] { width: 100%; height: 100%; object-fit: cover; }\r\n\r\n.content[_ngcontent-%COMP%] { max-width: var(--%NS%max-width-page); margin: 0 auto; padding: 26px 24px 56px; }\r\n.intro[_ngcontent-%COMP%] { animation: depa-fade-up .7s .15s cubic-bezier(.22,1,.36,1) both; }\r\n.intro[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] { margin: 12px 0 6px; font-size: clamp(1.65rem, 3vw, 2.55rem); font-weight: 800; letter-spacing: -.02em; }\r\n.location[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 6px; margin: 0; color: var(--%NS%color-text-muted); }\r\n.location[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%], .advertiser-card[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { color: var(--%NS%color-accent); flex-shrink: 0; }\r\n.intro__meta[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }\r\n.published-date[_ngcontent-%COMP%] { margin: .35rem 0 0 22px; color: #7a879b; font-size: .78rem; }\r\n.favorite-button[_ngcontent-%COMP%] { display: inline-flex; align-items: center; gap: .45rem; padding: .65rem .85rem; border: 1px solid #d8dee8; border-radius: 9px; background: #fff; color: #253550; font: inherit; font-size: .82rem; font-weight: 800; cursor: pointer; }\r\n.favorite-button[_ngcontent-%COMP%]:hover, .favorite-button.is-active[_ngcontent-%COMP%] { border-color: var(--%NS%color-secondary); background: #fff0ed; color: var(--%NS%color-secondary); }\r\n.badges[_ngcontent-%COMP%] { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }\r\n.badge[_ngcontent-%COMP%] { display: inline-flex; align-items: center; gap: 4px; padding: 5px 11px; border-radius: 999px; background: var(--%NS%color-primary); color: #fff; font-size: .75rem; font-weight: 700; animation: depa-pop .5s .3s ease both; }\r\n.badge--temp[_ngcontent-%COMP%] { background: var(--%NS%color-secondary); }\r\n.badge--verified[_ngcontent-%COMP%] { background: var(--%NS%color-secondary-light); color: var(--%NS%color-secondary); animation-delay: .4s; }\r\n.edit-link[_ngcontent-%COMP%] { margin-left: auto; padding: 6px 11px; border-radius: 8px; color: var(--%NS%color-secondary); background: var(--%NS%color-secondary-light); text-decoration: none; font-size: .78rem; font-weight: 700; }\r\nh2[_ngcontent-%COMP%] { margin: 0 0 14px; font-size: 1.05rem; font-weight: 800; }\r\n.features[_ngcontent-%COMP%], .description[_ngcontent-%COMP%], .map-section[_ngcontent-%COMP%] { padding: 28px 0; border-top: 1px solid var(--%NS%color-border); }\r\n.features[_ngcontent-%COMP%] { margin-top: 26px; }\r\n.features__grid[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }\r\n.features__grid[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] { display: grid; grid-template-columns: auto 1fr; column-gap: 12px; align-items: center; padding: 14px; border: 1px solid var(--%NS%color-border); border-radius: 10px; transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; }\r\n.features__grid[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%]:hover { transform: translateY(-4px); border-color: #ffd08a; box-shadow: 0 10px 22px rgba(16,24,40,.08); }\r\n.features__grid[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { grid-row: 1 / 3; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 10px; background: #fff4e5; color: var(--%NS%color-accent); transition: transform .35s cubic-bezier(.34,1.56,.64,1); }\r\n.features__grid[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%]:hover   span[_ngcontent-%COMP%] { transform: rotate(-10deg) scale(1.1); }\r\n.features__grid[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { font-size: .92rem; }\r\n.features__grid[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); }\r\n.description[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; color: #475467; line-height: 1.75; white-space: pre-line; overflow-wrap: anywhere; }\r\n.description__toggle[_ngcontent-%COMP%] { margin-top: 10px; padding: 0; border: 0; background: transparent; color: var(--%NS%color-primary); font: inherit; font-weight: 700; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }\r\n\r\n.map-section__heading[_ngcontent-%COMP%] { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 16px; }\r\n.map-section__heading[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 4px 0 7px; font-size: 1.25rem; }\r\n.map-section__eyebrow[_ngcontent-%COMP%] { color: var(--%NS%color-primary); font-size: .75rem; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; }\r\n.map-section__heading[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 7px; margin: 0; color: var(--%NS%color-text-muted); font-size: .9rem; }\r\n.map-section__heading[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { flex-shrink: 0; color: var(--%NS%color-accent); }\r\n.map-section__external[_ngcontent-%COMP%] { display: inline-flex; align-items: center; gap: 7px; flex-shrink: 0; padding: 9px 12px; border: 1px solid #d8dee8; border-radius: 9px; color: var(--%NS%color-primary); background: #fff; font-size: .82rem; font-weight: 800; text-decoration: none; transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease; }\r\n.map-section__external[_ngcontent-%COMP%]:hover { border-color: var(--%NS%color-accent); box-shadow: 0 7px 18px rgba(16,24,40,.09); transform: translateY(-2px); }\r\n.map-section__map[_ngcontent-%COMP%] { position: relative; height: clamp(260px, 34vw, 390px); overflow: hidden; border: 1px solid var(--%NS%color-border); border-radius: 14px; background: #e9edf2; box-shadow: 0 10px 30px rgba(16,24,40,.08); }\r\n.map-section__map[_ngcontent-%COMP%]   iframe[_ngcontent-%COMP%] { display: block; width: 100%; height: 100%; border: 0; pointer-events: none; }\r\n.map-section__overlay[_ngcontent-%COMP%] { position: absolute; inset: 0; cursor: pointer; }\r\n.map-section__overlay[_ngcontent-%COMP%]:focus-visible { outline: 3px solid var(--%NS%color-accent); outline-offset: -4px; }\r\n\r\n.price-panel[_ngcontent-%COMP%] { display: flex; flex-direction: column; gap: 18px; padding: 22px; border: 1px solid var(--%NS%color-border); border-radius: 14px; background: var(--%NS%color-bg); }\r\n.price-panel__amount[_ngcontent-%COMP%] { display: flex; flex-direction: column; }\r\n.price-panel__amount[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 800; letter-spacing: -.02em; }\r\n.price-panel__unit[_ngcontent-%COMP%] { font-size: .75em; }\r\n.price-panel__amount[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); font-size: .9rem; }\r\n.actions[_ngcontent-%COMP%] { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }\r\n.button[_ngcontent-%COMP%] { display: inline-flex; justify-content: center; align-items: center; gap: 8px; min-height: 48px; padding: 0 22px; border: 0; border-radius: 8px; color: #fff; font: inherit; font-weight: 700; text-decoration: none; cursor: pointer; transition: transform .2s ease, box-shadow .25s ease, filter .2s ease; }\r\n.button[_ngcontent-%COMP%]:hover:not(:disabled) { transform: translateY(-3px); filter: brightness(1.05); }\r\n.button[_ngcontent-%COMP%]:disabled { opacity: .6; cursor: not-allowed; }\r\n.button--primary[_ngcontent-%COMP%] { background: var(--%NS%color-accent); box-shadow: 0 6px 16px rgba(255,152,0,.35); }\r\n.button--secondary[_ngcontent-%COMP%] { background: var(--%NS%color-secondary); }\r\n.button--whatsapp[_ngcontent-%COMP%] { background: #25d366; box-shadow: 0 6px 16px rgba(37,211,102,.35); }\r\n.button--whatsapp.is-disabled[_ngcontent-%COMP%] { opacity: .6; cursor: not-allowed; transform: none; }\r\n.external-warning[_ngcontent-%COMP%] { display: block; margin-top: .7rem; color: var(--%NS%color-text-muted); font-size: .76rem; line-height: 1.45; }\r\n.button--block[_ngcontent-%COMP%] { width: 100%; }\r\n\r\n.booking-layout[_ngcontent-%COMP%] { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(300px, .75fr); gap: 24px; align-items: start; padding: 28px 0; border-top: 1px solid var(--%NS%color-border); }\r\n.section-heading[_ngcontent-%COMP%] { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 14px; }\r\n.section-heading[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { color: var(--%NS%color-primary); font-size: .75rem; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; }\r\n.section-heading[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 4px 0 0; font-size: 1.25rem; }\r\n.section-heading[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { max-width: 280px; margin: 0; color: var(--%NS%color-text-muted); font-size: .8rem; }\r\n.calendar-empty[_ngcontent-%COMP%] { margin: 10px 0 0; padding: 10px 12px; border-radius: 7px; color: #854d0e; background: #fef9c3; font-size: .8rem; }\r\n.calendar-note[_ngcontent-%COMP%] { margin: 10px 0 0; color: var(--%NS%color-text-muted); font-size: .78rem; line-height: 1.4; }\r\n.booking-card[_ngcontent-%COMP%] { position: sticky; top: 20px; padding: 22px; border: 1px solid #d8dee8; border-radius: 14px; background: #fff; box-shadow: var(--%NS%shadow-card); }\r\n.booking-card__price[_ngcontent-%COMP%] { display: flex; align-items: baseline; gap: 7px; margin-bottom: 18px; }\r\n.booking-card__price[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { font-size: 1.7rem; }\r\n.booking-card__price[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); }\r\n.date-summary[_ngcontent-%COMP%] { display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 16px; border: 1px solid var(--%NS%color-border); border-radius: 9px; overflow: hidden; }\r\n.date-summary[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] { display: grid; gap: 4px; padding: 11px; }\r\n.date-summary[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]    + div[_ngcontent-%COMP%] { border-left: 1px solid var(--%NS%color-border); }\r\n.date-summary[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); font-size: .68rem; font-weight: 700; text-transform: uppercase; }\r\n.date-summary[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { font-size: .78rem; }\r\n.total-row[_ngcontent-%COMP%] { display: flex; justify-content: space-between; gap: 10px; padding: 8px 0; color: var(--%NS%color-text-muted); font-size: .85rem; }\r\n.total-row--strong[_ngcontent-%COMP%] { margin: 5px 0 15px; padding-top: 13px; border-top: 1px solid var(--%NS%color-border); color: var(--%NS%color-text); font-size: 1rem; }\r\n.button--reserve[_ngcontent-%COMP%] { width: 100%; background: linear-gradient(90deg, var(--%NS%color-primary), var(--%NS%color-accent)); }\r\n.button--%NS%reserve[_ngcontent-%COMP%]:disabled { background: #e4e7ec; color: #475467; box-shadow: none; cursor: default; }\r\n.booking-calendar[_ngcontent-%COMP%] { min-width: 0; }\r\n.simulation-note[_ngcontent-%COMP%] { display: block; margin-top: 9px; color: var(--%NS%color-text-muted); text-align: center; }\r\n.booking-message[_ngcontent-%COMP%] { padding: 10px; border-radius: 7px; font-size: .82rem; line-height: 1.4; }\r\n.booking-message--error[_ngcontent-%COMP%] { color: #991b1b; background: #fee2e2; }\r\n.booking-message--success[_ngcontent-%COMP%] { color: #166534; background: #dcfce7; }\r\n.booking-actions[_ngcontent-%COMP%] { display: grid; gap: 10px; margin-top: 14px; }\r\n.button--outline[_ngcontent-%COMP%] { border: 1px solid #25d366; color: #168a42; background: #fff; box-shadow: none; }\r\n\r\n.image-modal-backdrop[_ngcontent-%COMP%] { position: fixed; z-index: 1100; inset: 0; display: flex; align-items: center; justify-content: center; padding: 28px; background: rgb(11 24 40 / 88%); }\r\n.image-modal[_ngcontent-%COMP%] { position: relative; display: flex; align-items: center; justify-content: center; width: min(100%, 1280px); height: min(820px, calc(100dvh - 56px)); min-width: 0; min-height: 0; }\r\n.image-modal[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] { display: block; max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 10px; box-shadow: 0 24px 70px rgb(0 0 0 / 40%); }\r\n.image-modal__close[_ngcontent-%COMP%] { position: absolute; z-index: 1; top: -12px; right: -12px; display: grid; place-items: center; width: 38px; height: 38px; border: 0; border-radius: 50%; color: #1d2939; background: #fff; font-size: 1.7rem; line-height: 1; cursor: pointer; box-shadow: 0 4px 16px rgb(0 0 0 / 25%); }\r\n\r\n.advertiser-card[_ngcontent-%COMP%] { margin-top: 30px; padding: 22px; border: 1px solid var(--%NS%color-border); border-radius: 14px; background: var(--%NS%color-bg); }\r\n.advertiser-card__head[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 16px; }\r\n.avatar[_ngcontent-%COMP%] { display: grid; place-items: center; width: 64px; height: 64px; flex-shrink: 0; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 0 2px var(--%NS%color-accent); background: linear-gradient(135deg, var(--%NS%color-accent), var(--%NS%color-primary)); color: #fff; font-size: 1.6rem; font-weight: 800; transition: transform .4s cubic-bezier(.34,1.56,.64,1); }\r\n.advertiser-card[_ngcontent-%COMP%]:hover   .avatar[_ngcontent-%COMP%] { transform: scale(1.08) rotate(-4deg); }\r\n.advertiser-card[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin: 0 0 4px; font-size: 1.2rem; }\r\n.advertiser-card[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]   .badge[_ngcontent-%COMP%] { animation: none; }\r\n.advertiser-card[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 5px; margin: 0; color: var(--%NS%color-text-muted); font-size: .9rem; }\r\n.advertiser-card__stats[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 20px 0; padding-top: 16px; border-top: 1px solid var(--%NS%color-border); }\r\n.advertiser-card__stats[_ngcontent-%COMP%]   dt[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); font-size: .8rem; }\r\n.advertiser-card__stats[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%] { margin: 2px 0 0; font-weight: 700; }\r\n\r\n@media (max-width: 760px) {\r\n  .features__grid[_ngcontent-%COMP%] { grid-template-columns: repeat(2, 1fr); }\r\n  .actions[_ngcontent-%COMP%] { grid-template-columns: 1fr; }\r\n  .booking-layout[_ngcontent-%COMP%] { grid-template-columns: 1fr; }\r\n  .booking-card[_ngcontent-%COMP%] { position: static; }\r\n  .section-heading[_ngcontent-%COMP%] { align-items: flex-start; flex-direction: column; }\r\n  .section-heading[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { max-width: none; }\r\n  .map-section__heading[_ngcontent-%COMP%] { align-items: flex-start; flex-direction: column; gap: 14px; }\r\n  .edit-link[_ngcontent-%COMP%] { margin-left: 0; }\r\n}\r\n@media (max-width: 480px) {\r\n  .content[_ngcontent-%COMP%] { padding-inline: 16px; }\r\n  .gallery[_ngcontent-%COMP%] { padding: 12px 16px 0; }\r\n  .gallery__main[_ngcontent-%COMP%] { height: 240px; border-radius: 10px; }\r\n  .image-modal-backdrop[_ngcontent-%COMP%] { padding: 18px; }\r\n  .image-modal[_ngcontent-%COMP%] { height: min(820px, calc(100dvh - 36px)); }\r\n  .image-modal__close[_ngcontent-%COMP%] { top: -8px; right: -4px; }\r\n  .features__grid[_ngcontent-%COMP%], .advertiser-card__stats[_ngcontent-%COMP%] { grid-template-columns: 1fr; }\r\n}\r\n.ingresos-card[_ngcontent-%COMP%] { position: static; }\r\n.ingresos-card[_ngcontent-%COMP%]   form[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  gap: 0.45rem;\r\n  padding-top: 0.75rem;\r\n  border-top: 1px solid var(--%NS%color-border);\r\n}\r\n\r\n.ingresos-card[_ngcontent-%COMP%]   form[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; }\r\n.ingresos-card__campo[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; gap: 0.5rem; }\r\n.ingresos-card__campo[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\r\n  width: 12ch;\r\n  padding: 0.5rem 0.7rem;\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: var(--%NS%radius-sm);\r\n  font: inherit;\r\n  text-transform: uppercase;\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PublicationDetailComponent, [{
        type: Component,
        args: [{ selector: 'app-publication-detail', standalone: true, imports: [
                    RouterLink,
                    SpinnerComponent,
                    RevealDirective,
                    VolverDirective,
                    AvatarComponent,
                    AvailabilityCalendarComponent,
                    ConfirmDialogComponent,
                    PaymentSummaryComponent,
                    RelativeTimePipe,
                    LucideBadgeCheck,
                    LucideBookmark,
                    LucideBuilding2,
                    LucideChevronLeft,
                    LucideChevronRight,
                    LucideClock,
                    LucideExternalLink,
                    LucideHouse,
                    LucideLayoutList,
                    LucideMail,
                    LucideMapPin,
                    LucideRuler,
                ], template: "<section class=\"detail-shell\" aria-live=\"polite\">\r\n  @if (administracion) {\r\n    <a appVolver=\"/admin\" fragmentoVolver=\"reclamos\">\u2190 Volver</a>\r\n  }\r\n  @if (loading()) {\r\n    <div class=\"state\"><app-spinner /><p>Cargando publicaci\u00F3n\u2026</p></div>\r\n  } @else if (error()) {\r\n    <div class=\"state state--error\">\r\n      <h1>Publicaci\u00F3n no disponible</h1>\r\n      <p>{{ error() }}</p>\r\n      @if (!administracion) { <a routerLink=\"/\">Volver a las publicaciones</a> }\r\n    </div>\r\n  } @else if (publication(); as item) {\r\n    @if (item.eliminada) {\r\n      <div class=\"deleted-notice\" role=\"status\">\r\n        <strong>Esta publicaci\u00F3n ha sido eliminada.</strong>\r\n        @if (!administracion) {\r\n          <p>Se mantendr\u00E1 visible hasta que se cumpla tu reserva. No admite nuevas reservas ni contactos.</p>\r\n        }\r\n      </div>\r\n    }\r\n    <div class=\"gallery\">\r\n      <div class=\"gallery__main\">\r\n        @for (image of currentImage() ? [currentImage()!] : []; track image.id) {\r\n          <button type=\"button\" class=\"gallery__preview\" (click)=\"openImagePreview()\" [attr.aria-label]=\"'Ampliar imagen de ' + item.titulo\">\r\n            <img [src]=\"image.url\" [alt]=\"item.titulo\" [class]=\"'gallery__img gallery__img--' + direction()\" />\r\n          </button>\r\n        } @empty {\r\n          <div class=\"gallery__empty\">Sin im\u00E1genes disponibles</div>\r\n        }\r\n        @if (images().length > 1) {\r\n          <button class=\"gallery__arrow gallery__arrow--left\" type=\"button\" (click)=\"previousImage()\" aria-label=\"Imagen anterior\"><svg lucideChevronLeft [size]=\"24\"></svg></button>\r\n          <button class=\"gallery__arrow gallery__arrow--right\" type=\"button\" (click)=\"nextImage()\" aria-label=\"Imagen siguiente\"><svg lucideChevronRight [size]=\"24\"></svg></button>\r\n          <span class=\"gallery__count\">{{ selectedImage() + 1 }} / {{ images().length }}</span>\r\n        }\r\n      </div>\r\n      @if (images().length > 1) {\r\n        <div class=\"gallery__thumbs\">\r\n          @for (image of images(); track image.id; let index = $index) {\r\n            <button type=\"button\" [class.is-active]=\"selectedImage() === index\" (click)=\"selectImage(index)\" [attr.aria-label]=\"'Ver imagen ' + (index + 1)\" [style.animation-delay]=\"index * 60 + 'ms'\">\r\n              <img [src]=\"image.url\" alt=\"\" loading=\"lazy\" />\r\n            </button>\r\n          }\r\n        </div>\r\n      }\r\n    </div>\r\n\r\n    <div class=\"content\">\r\n      <div class=\"intro\">\r\n        <div class=\"badges\">\r\n          @if (item.modalidad?.nombre) {\r\n            <span class=\"badge\" [class.badge--temp]=\"esTemporaria()\">{{ item.modalidad?.nombre }}</span>\r\n          }\r\n          @if (item.anunciante?.verificado) {\r\n            <span class=\"badge badge--verified\"><svg lucideBadgeCheck [size]=\"14\"></svg> {{ verifiedLabel() }}</span>\r\n          }\r\n          @if (!administracion && esMiPublicacion() && !item.eliminada) {\r\n            <a class=\"edit-link\" [routerLink]=\"['/publicaciones', item.id, 'editar']\">\u270E Modificar publicaci\u00F3n</a>\r\n          }\r\n        </div>\r\n        <h1>{{ item.titulo }}</h1>\r\n        <div class=\"intro__meta\">\r\n          <div>\r\n            <p class=\"location\"><svg lucideMapPin [size]=\"16\"></svg> {{ location(item) }}</p>\r\n            <p class=\"published-date\">{{ item.fecha_publicacion | relativeTime }}</p>\r\n          </div>\r\n          @if (!administracion && !esMiPublicacion() && !item.eliminada) {\r\n            <button\r\n              type=\"button\"\r\n              class=\"favorite-button\"\r\n              [class.is-active]=\"isFavorite()\"\r\n              [disabled]=\"savingFavorite()\"\r\n              [attr.aria-pressed]=\"isFavorite()\"\r\n              (click)=\"toggleFavorite(item)\"\r\n            ><svg lucideBookmark [size]=\"19\" [attr.fill]=\"isFavorite() ? 'currentColor' : 'none'\"></svg>{{ isFavorite() ? 'Guardada' : 'Guardar' }}</button>\r\n          }\r\n        </div>\r\n      </div>\r\n\r\n      @if (!administracion && esMiPublicacion() && esTemporaria() && !item.eliminada) {\r\n        <section class=\"booking-card ingresos-card\" aria-labelledby=\"ingresos-heading\">\r\n          <h2 id=\"ingresos-heading\">Validar ingreso</h2>\r\n          @if (resultadoIngreso(); as resultado) {\r\n            @if (!resultado.error) {\r\n              <p class=\"booking-message booking-message--success\" role=\"status\">{{ resultado.mensaje }}</p>\r\n            }\r\n          }\r\n          @if (errorIngresos()) {\r\n            <p class=\"booking-message booking-message--error\" role=\"alert\">No pudimos cargar las reservas pendientes de ingreso.</p>\r\n            <button type=\"button\" class=\"button button--secondary\" (click)=\"cargarIngresos(item.id)\">Reintentar</button>\r\n          } @else if (ingresosPendientes(); as ingresos) {\r\n            @for (reserva of ingresos; track reserva.id) {\r\n              <form (submit)=\"validarIngreso($event, reserva, codigo.value)\">\r\n                <p>\r\n                  <strong>Reserva #{{ reserva.id }}</strong>\r\n                  @if (reserva.usuario_nombre || reserva.usuario?.nombre) {\r\n                    \u00B7 {{ reserva.usuario_nombre ?? reserva.usuario?.nombre }} {{ reserva.usuario_apellido ?? reserva.usuario?.apellido }}\r\n                  }\r\n                  @if (reserva.fecha_inicio && reserva.fecha_fin) {\r\n                    \u00B7 {{ formatDate(reserva.fecha_inicio) }} al {{ formatDate(reserva.fecha_fin) }}\r\n                  }\r\n                </p>\r\n                <label [for]=\"'ingreso-' + reserva.id\">C\u00F3digo entregado por el inquilino</label>\r\n                <div class=\"ingresos-card__campo\">\r\n                  <input #codigo [id]=\"'ingreso-' + reserva.id\" type=\"text\" maxlength=\"8\"\r\n                    autocomplete=\"off\" autocapitalize=\"characters\" spellcheck=\"false\" required\r\n                    [readonly]=\"validandoIngreso() === reserva.id\" />\r\n                  <button type=\"submit\" class=\"button button--secondary\" [disabled]=\"validandoIngreso() !== null\">\r\n                    {{ validandoIngreso() === reserva.id ? 'Validando\u2026' : 'Validar c\u00F3digo' }}\r\n                  </button>\r\n                </div>\r\n                @if (resultadoIngreso(); as resultado) {\r\n                  @if (resultado.error && resultado.reservaId === reserva.id) {\r\n                    <p class=\"booking-message booking-message--error\" role=\"alert\">{{ resultado.mensaje }}</p>\r\n                  }\r\n                }\r\n              </form>\r\n            } @empty {\r\n              <p>No hay reservas pendientes de ingreso para esta publicaci\u00F3n.</p>\r\n            }\r\n          } @else {\r\n            <p role=\"status\">Cargando reservas\u2026</p>\r\n          }\r\n        </section>\r\n      }\r\n\r\n      <section class=\"features\" appReveal>\r\n        <h2>Caracter\u00EDsticas principales</h2>\r\n        <div class=\"features__grid\">\r\n          <div><span><svg lucideHouse [size]=\"20\"></svg></span><strong>{{ item.cantidad_ambientes }} Ambientes</strong><small>Ambientes</small></div>\r\n          <div><span><svg lucideRuler [size]=\"20\"></svg></span><strong>{{ item.superficie }} m\u00B2</strong><small>Superficie total</small></div>\r\n          @if (item.tipoPropiedad?.nombre) {\r\n            <div><span><svg lucideBuilding2 [size]=\"20\"></svg></span><strong>{{ item.tipoPropiedad?.nombre }}</strong><small>Tipo de propiedad</small></div>\r\n          }\r\n          @if (item.modalidad?.nombre) {\r\n            <div><span><svg lucideClock [size]=\"20\"></svg></span><strong>{{ item.modalidad?.nombre }}</strong><small>Modalidad de alquiler</small></div>\r\n          }\r\n        </div>\r\n      </section>\r\n\r\n      <section class=\"description\" appReveal>\r\n        <h2>Descripci\u00F3n</h2>\r\n        <p id=\"descripcion-publicacion\">{{ descripcionExpandida() ? item.descripcion : descripcionCorta() }}</p>\r\n        @if (descripcionTieneMas()) {\r\n          <button type=\"button\" class=\"description__toggle\" aria-controls=\"descripcion-publicacion\"\r\n            [attr.aria-expanded]=\"descripcionExpandida()\" (click)=\"descripcionExpandida.set(!descripcionExpandida())\">\r\n            {{ descripcionExpandida() ? 'Ver menos' : 'Ver m\u00E1s' }}\r\n          </button>\r\n        }\r\n      </section>\r\n\r\n      @if (mapEmbedUrl(); as mapSource) {\r\n        <section class=\"map-section\" appReveal>\r\n          <div class=\"map-section__heading\">\r\n            <div>\r\n              <span class=\"map-section__eyebrow\">Ubicaci\u00F3n</span>\r\n              <h2>Conoc\u00E9 la zona</h2>\r\n              <p><svg lucideMapPin [size]=\"17\"></svg>{{ location(item) }}</p>\r\n            </div>\r\n            <a class=\"map-section__external\" [href]=\"mapUrl()\" target=\"_blank\" rel=\"noopener noreferrer\">\r\n              Abrir en Google Maps <svg lucideExternalLink [size]=\"16\"></svg>\r\n            </a>\r\n          </div>\r\n          <div class=\"map-section__map\">\r\n            <iframe\r\n              [src]=\"mapSource\"\r\n              [title]=\"'Mapa de ' + location(item)\"\r\n              loading=\"lazy\"\r\n              referrerpolicy=\"no-referrer-when-downgrade\"\r\n            ></iframe>\r\n            <a\r\n              class=\"map-section__overlay\"\r\n              [href]=\"mapUrl()\"\r\n              target=\"_blank\"\r\n              rel=\"noopener noreferrer\"\r\n              [attr.aria-label]=\"'Abrir la ubicaci\u00F3n de ' + item.titulo + ' en Google Maps'\"\r\n            ></a>\r\n          </div>\r\n        </section>\r\n      }\r\n\r\n      @if (!administracion && !item.eliminada && item.anunciante?.actividades_pausadas) {\r\n        <section class=\"booking-card\" aria-labelledby=\"actividades-pausadas\">\r\n          <h2 id=\"actividades-pausadas\">Actividades pausadas</h2>\r\n          <p>Este anunciante paus\u00F3 sus actividades. Por el momento, no acepta nuevas reservas.</p>\r\n          @if (esTemporaria()) {\r\n            <button type=\"button\" class=\"button button--reserve\" disabled>Reserva no disponible</button>\r\n          }\r\n        </section>\r\n      }\r\n\r\n      @if (!administracion && esTemporaria() && !item.eliminada && !item.anunciante?.actividades_pausadas) {\r\n        <section class=\"booking-layout\" appReveal>\r\n          <div class=\"booking-calendar\">\r\n            <div class=\"section-heading\"><div><span>Disponibilidad</span><h2>Eleg\u00ED las fechas de tu alquiler</h2></div></div>\r\n            <app-availability-calendar [dates]=\"availability()\" [loading]=\"availabilityLoading()\" [selectedStart]=\"selectedStart()\" [selectedEnd]=\"selectedEnd()\" (rangeChange)=\"selectBookingDate($event)\" />\r\n            <p class=\"calendar-note\">La reprogramaci\u00F3n de fechas solo estar\u00E1 disponible con {{ diasMinimosReprogramacion }} d\u00EDas o m\u00E1s de antelaci\u00F3n al inicio de la reserva.</p>\r\n            @if (!availabilityLoading() && !availability().length && !bookingError()) { <p class=\"calendar-empty\">El anunciante todav\u00EDa no carg\u00F3 d\u00EDas disponibles para esta propiedad.</p> }\r\n          </div>\r\n          <aside class=\"booking-card\">\r\n            <div class=\"booking-card__price\"><strong>{{ price(item) }}</strong><span>por d\u00EDa</span></div>\r\n            <div class=\"date-summary\">\r\n              <div><span>Primer d\u00EDa</span><strong>{{ formatDate(selectedStart()) }}</strong></div>\r\n              <div><span>\u00DAltimo d\u00EDa</span><strong>{{ formatDate(selectedEnd()) }}</strong></div>\r\n            </div>\r\n            @if (bookingDays()) {\r\n              <div class=\"total-row\"><span>{{ bookingDays() }} {{ bookingDays() === 1 ? 'd\u00EDa' : 'd\u00EDas' }}</span><span>{{ item.tipoMoneda?.nombre ?? '$' }} {{ formatAmount(bookingTotal()) }}</span></div>\r\n              <div class=\"total-row total-row--strong\"><strong>Total</strong><strong>{{ item.tipoMoneda?.nombre ?? '$' }} {{ formatAmount(bookingTotal()) }}</strong></div>\r\n            }\r\n            <button type=\"button\" class=\"button button--reserve shine\" (click)=\"openPayment()\" [disabled]=\"esMiPublicacion() || !bookingDays() || availabilityLoading()\">{{ esMiPublicacion() ? 'No pod\u00E9s reservar tu publicaci\u00F3n' : bookingDays() ? 'Reservar ' + bookingDays() + (bookingDays() === 1 ? ' d\u00EDa' : ' d\u00EDas') : 'Eleg\u00ED las fechas para reservar' }}</button>\r\n            <small class=\"simulation-note\">El pago se realiza de forma segura en Mercado Pago.</small>\r\n            @if (bookingError()) { <p class=\"booking-message booking-message--error\">{{ bookingError() }}</p> }\r\n            @if (bookingSuccess()) { <p class=\"booking-message booking-message--success\">{{ bookingSuccess() }}</p> }\r\n            <div class=\"booking-actions\">\r\n              @if (whatsappUrl(item); as whatsapp) {\r\n                <a class=\"button button--whatsapp button--outline\" [href]=\"whatsapp\" target=\"_blank\" rel=\"noopener noreferrer\" (click)=\"confirmarWhatsapp($event, whatsapp)\">Contactar por WhatsApp</a>\r\n              }\r\n              @if (!esMiPublicacion()) {\r\n                <button type=\"button\" class=\"button button--secondary\" (click)=\"chatear(item)\"><svg lucideMail [size]=\"18\"></svg> Enviar mensaje</button>\r\n              }\r\n            </div>\r\n            <small class=\"external-warning\">Si continu\u00E1s por WhatsApp, la conversaci\u00F3n ocurre fuera de DEPA y no podremos intervenir ante inconvenientes.</small>\r\n          </aside>\r\n        </section>\r\n      } @else if (!administracion && !esTemporaria() && !item.eliminada) {\r\n        <section class=\"price-panel\" appReveal=\"zoom\">\r\n          <div class=\"price-panel__amount\">\r\n            <strong>{{ price(item) }}<span class=\"price-panel__unit\"> / mes</span></strong>\r\n            <span>Alquiler {{ item.modalidad?.nombre ?? '' }}</span>\r\n          </div>\r\n          <div class=\"actions\">\r\n            @if (whatsappUrl(item); as whatsapp) {\r\n              <a class=\"button button--whatsapp shine\" [href]=\"whatsapp\" target=\"_blank\" rel=\"noopener noreferrer\" (click)=\"confirmarWhatsapp($event, whatsapp)\">Contactar por WhatsApp</a>\r\n            } @else {\r\n              <span class=\"button button--whatsapp is-disabled\" aria-disabled=\"true\">Contactar por WhatsApp</span>\r\n            }\r\n            @if (esMiPublicacion()) {\r\n              <a class=\"button button--primary shine\" [routerLink]=\"['/publicaciones', item.id, 'editar']\"><svg lucideLayoutList [size]=\"18\"></svg> Administrar publicaci\u00F3n</a>\r\n            } @else {\r\n              <button type=\"button\" class=\"button button--primary shine\" (click)=\"chatear(item)\"><svg lucideMail [size]=\"18\"></svg> Enviar Mensaje</button>\r\n            }\r\n          </div>\r\n          <small class=\"external-warning\">Si continu\u00E1s por WhatsApp, la conversaci\u00F3n ocurre fuera de DEPA y no podremos intervenir ante inconvenientes.</small>\r\n        </section>\r\n      }\r\n\r\n      @if (item.anunciante; as advertiser) {\r\n        <section class=\"advertiser-card\" appReveal>\r\n          <div class=\"advertiser-card__head\">\r\n            <app-avatar class=\"avatar\" [foto]=\"perfilAnunciante()?.foto_url ?? advertiser.usuario?.foto_url\" [nombre]=\"advertiserName()\" />\r\n            <div>\r\n              <h2>{{ advertiserName() }} @if (advertiser.verificado) { <span class=\"badge badge--verified\"><svg lucideBadgeCheck [size]=\"13\"></svg> {{ verifiedLabel() }}</span> }</h2>\r\n              @if (city(item)) { <p><svg lucideMapPin [size]=\"14\"></svg> {{ city(item) }}</p> }\r\n            </div>\r\n          </div>\r\n          <dl class=\"advertiser-card__stats\">\r\n            <div><dt>Tipo de anunciante</dt><dd>{{ advertiserTypeName() }}</dd></div>\r\n            <div><dt>Publicaciones activas</dt><dd>{{ activeCount() === null ? '\u2014' : activeCount() + (activeCount() === 1 ? ' publicaci\u00F3n activa' : ' publicaciones activas') }}</dd></div>\r\n          </dl>\r\n          <a class=\"button button--primary button--block shine\" [routerLink]=\"['/perfil', advertiser.idUsuario]\">Ver perfil completo</a>\r\n        </section>\r\n      }\r\n    </div>\r\n\r\n    @if (paymentOpen() && !item.eliminada) {\r\n      <app-payment-summary [publicacion]=\"item\" [anunciante]=\"advertiserName()\" [ubicacion]=\"location(item)\"\r\n        [inicio]=\"selectedStart()\" [fin]=\"selectedEnd()\" [presupuesto]=\"presupuesto()\"\r\n        [cotizando]=\"cotizando()\" [procesando]=\"processingPayment()\" [vencido]=\"presupuestoVencido()\"\r\n        [conversionAceptada]=\"aceptaConversion()\" [error]=\"bookingError()\"\r\n        (cerrar)=\"closePayment()\" (recotizar)=\"cotizarPago()\" (continuar)=\"confirmPayment($event)\"\r\n        (aceptarConversion)=\"aceptaConversion.set($event)\" />\r\n    }\r\n\r\n    @if (imagePreviewOpen() && currentImage(); as image) {\r\n      <div class=\"image-modal-backdrop\" (click)=\"closeImagePreview()\">\r\n        <section class=\"image-modal\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Imagen ampliada\" (click)=\"$event.stopPropagation()\">\r\n          <button class=\"image-modal__close\" type=\"button\" (click)=\"closeImagePreview()\" aria-label=\"Cerrar imagen ampliada\">\u00D7</button>\r\n          <img [src]=\"image.url\" [alt]=\"item.titulo\" />\r\n        </section>\r\n      </div>\r\n    }\r\n\r\n    <app-confirm-dialog\r\n      #confirmacionWhatsapp\r\n      identificador=\"whatsapp-confirm\"\r\n      titulo=\"Continuar por WhatsApp\"\r\n      mensaje=\"Vas a continuar la conversaci\u00F3n por WhatsApp. DEPA no podr\u00E1 revisar esos mensajes ni ayudarte con acuerdos realizados fuera de la plataforma.\"\r\n      textoConfirmar=\"Continuar por WhatsApp\"\r\n      textoCancelar=\"Volver a DEPA\"\r\n      tono=\"advertencia\"\r\n      (confirmar)=\"abrirWhatsappConfirmado()\"\r\n      (cancelar)=\"cerrarConfirmacionWhatsapp()\" />\r\n  }\r\n</section>\r\n", styles: [":host { display: block; }\r\n.detail-shell { min-height: 65vh; background: var(--color-surface); }\r\n.state { min-height: 55vh; display: grid; place-content: center; justify-items: center; color: var(--color-text-muted); }\r\n.state--error { text-align: center; }\r\n.state--error a { color: var(--color-primary); font-weight: 700; }\r\n.deleted-notice { max-width: 1132px; margin: 0 auto; padding: 20px 24px; border-left: 4px solid #b45309; background: #fff7e6; color: #713f12; line-height: 1.5; }\r\n.deleted-notice p { margin: 4px 0 0; }\r\n\r\n.gallery { max-width: 1180px; margin: 0 auto; padding: 18px 24px 0; animation: depa-fade-in .6s ease both; }\r\n.gallery__main { position: relative; height: clamp(250px, 34vw, 460px); overflow: hidden; border-radius: 14px; background: #e7e8eb; }\r\n.gallery__preview { display: block; width: 100%; height: 100%; padding: 0; border: 0; background: transparent; cursor: zoom-in; }\r\n.gallery__img { width: 100%; height: 100%; object-fit: cover; display: block; animation: slide-next .6s cubic-bezier(.22,1,.36,1) both; }\r\n.gallery__img--prev { animation-name: slide-prev; }\r\n@keyframes slide-next { from { opacity: 0; transform: translateX(6%) scale(1.04); } to { opacity: 1; transform: none; } }\r\n@keyframes slide-prev { from { opacity: 0; transform: translateX(-6%) scale(1.04); } to { opacity: 1; transform: none; } }\r\n.gallery__empty { height: 100%; display: grid; place-items: center; color: var(--color-text-muted); }\r\n.gallery__arrow { position: absolute; top: 50%; translate: 0 -50%; display: grid; place-items: center; width: 44px; height: 44px; border: 0; border-radius: 50%; color: #fff; background: rgba(17, 17, 17, .55); cursor: pointer; backdrop-filter: blur(4px); transition: background .2s ease, transform .25s cubic-bezier(.34,1.56,.64,1); }\r\n.gallery__arrow:hover { background: rgba(17, 17, 17, .8); transform: scale(1.12); }\r\n.gallery__arrow--left { left: 18px; }\r\n.gallery__arrow--right { right: 18px; }\r\n.gallery__count { position: absolute; left: 18px; bottom: 16px; padding: 5px 12px; border-radius: 999px; color: #fff; background: rgba(17,17,17,.7); font-size: .8rem; font-weight: 600; }\r\n.gallery__thumbs { display: flex; gap: 10px; padding: 12px 16px 0; overflow-x: auto; }\r\n.gallery__thumbs button { width: 152px; height: 86px; flex: 0 0 auto; padding: 0; border: 3px solid transparent; border-radius: 9px; overflow: hidden; background: none; cursor: pointer; opacity: .75; animation: depa-fade-up .5s ease both; transition: opacity .2s ease, border-color .2s ease, transform .2s ease; }\r\n.gallery__thumbs button:hover { opacity: 1; transform: translateY(-3px); }\r\n.gallery__thumbs button.is-active { border-color: var(--color-accent); opacity: 1; }\r\n.gallery__thumbs img { width: 100%; height: 100%; object-fit: cover; }\r\n\r\n.content { max-width: var(--max-width-page); margin: 0 auto; padding: 26px 24px 56px; }\r\n.intro { animation: depa-fade-up .7s .15s cubic-bezier(.22,1,.36,1) both; }\r\n.intro h1 { margin: 12px 0 6px; font-size: clamp(1.65rem, 3vw, 2.55rem); font-weight: 800; letter-spacing: -.02em; }\r\n.location { display: flex; align-items: center; gap: 6px; margin: 0; color: var(--color-text-muted); }\r\n.location svg, .advertiser-card p svg { color: var(--color-accent); flex-shrink: 0; }\r\n.intro__meta { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }\r\n.published-date { margin: .35rem 0 0 22px; color: #7a879b; font-size: .78rem; }\r\n.favorite-button { display: inline-flex; align-items: center; gap: .45rem; padding: .65rem .85rem; border: 1px solid #d8dee8; border-radius: 9px; background: #fff; color: #253550; font: inherit; font-size: .82rem; font-weight: 800; cursor: pointer; }\r\n.favorite-button:hover, .favorite-button.is-active { border-color: var(--color-secondary); background: #fff0ed; color: var(--color-secondary); }\r\n.badges { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }\r\n.badge { display: inline-flex; align-items: center; gap: 4px; padding: 5px 11px; border-radius: 999px; background: var(--color-primary); color: #fff; font-size: .75rem; font-weight: 700; animation: depa-pop .5s .3s ease both; }\r\n.badge--temp { background: var(--color-secondary); }\r\n.badge--verified { background: var(--color-secondary-light); color: var(--color-secondary); animation-delay: .4s; }\r\n.edit-link { margin-left: auto; padding: 6px 11px; border-radius: 8px; color: var(--color-secondary); background: var(--color-secondary-light); text-decoration: none; font-size: .78rem; font-weight: 700; }\r\nh2 { margin: 0 0 14px; font-size: 1.05rem; font-weight: 800; }\r\n.features, .description, .map-section { padding: 28px 0; border-top: 1px solid var(--color-border); }\r\n.features { margin-top: 26px; }\r\n.features__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }\r\n.features__grid > div { display: grid; grid-template-columns: auto 1fr; column-gap: 12px; align-items: center; padding: 14px; border: 1px solid var(--color-border); border-radius: 10px; transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; }\r\n.features__grid > div:hover { transform: translateY(-4px); border-color: #ffd08a; box-shadow: 0 10px 22px rgba(16,24,40,.08); }\r\n.features__grid span { grid-row: 1 / 3; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 10px; background: #fff4e5; color: var(--color-accent); transition: transform .35s cubic-bezier(.34,1.56,.64,1); }\r\n.features__grid > div:hover span { transform: rotate(-10deg) scale(1.1); }\r\n.features__grid strong { font-size: .92rem; }\r\n.features__grid small { color: var(--color-text-muted); }\r\n.description p { margin: 0; color: #475467; line-height: 1.75; white-space: pre-line; overflow-wrap: anywhere; }\r\n.description__toggle { margin-top: 10px; padding: 0; border: 0; background: transparent; color: var(--color-primary); font: inherit; font-weight: 700; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }\r\n\r\n.map-section__heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 16px; }\r\n.map-section__heading h2 { margin: 4px 0 7px; font-size: 1.25rem; }\r\n.map-section__eyebrow { color: var(--color-primary); font-size: .75rem; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; }\r\n.map-section__heading p { display: flex; align-items: center; gap: 7px; margin: 0; color: var(--color-text-muted); font-size: .9rem; }\r\n.map-section__heading p svg { flex-shrink: 0; color: var(--color-accent); }\r\n.map-section__external { display: inline-flex; align-items: center; gap: 7px; flex-shrink: 0; padding: 9px 12px; border: 1px solid #d8dee8; border-radius: 9px; color: var(--color-primary); background: #fff; font-size: .82rem; font-weight: 800; text-decoration: none; transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease; }\r\n.map-section__external:hover { border-color: var(--color-accent); box-shadow: 0 7px 18px rgba(16,24,40,.09); transform: translateY(-2px); }\r\n.map-section__map { position: relative; height: clamp(260px, 34vw, 390px); overflow: hidden; border: 1px solid var(--color-border); border-radius: 14px; background: #e9edf2; box-shadow: 0 10px 30px rgba(16,24,40,.08); }\r\n.map-section__map iframe { display: block; width: 100%; height: 100%; border: 0; pointer-events: none; }\r\n.map-section__overlay { position: absolute; inset: 0; cursor: pointer; }\r\n.map-section__overlay:focus-visible { outline: 3px solid var(--color-accent); outline-offset: -4px; }\r\n\r\n.price-panel { display: flex; flex-direction: column; gap: 18px; padding: 22px; border: 1px solid var(--color-border); border-radius: 14px; background: var(--color-bg); }\r\n.price-panel__amount { display: flex; flex-direction: column; }\r\n.price-panel__amount strong { font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 800; letter-spacing: -.02em; }\r\n.price-panel__unit { font-size: .75em; }\r\n.price-panel__amount > span { color: var(--color-text-muted); font-size: .9rem; }\r\n.actions { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }\r\n.button { display: inline-flex; justify-content: center; align-items: center; gap: 8px; min-height: 48px; padding: 0 22px; border: 0; border-radius: 8px; color: #fff; font: inherit; font-weight: 700; text-decoration: none; cursor: pointer; transition: transform .2s ease, box-shadow .25s ease, filter .2s ease; }\r\n.button:hover:not(:disabled) { transform: translateY(-3px); filter: brightness(1.05); }\r\n.button:disabled { opacity: .6; cursor: not-allowed; }\r\n.button--primary { background: var(--color-accent); box-shadow: 0 6px 16px rgba(255,152,0,.35); }\r\n.button--secondary { background: var(--color-secondary); }\r\n.button--whatsapp { background: #25d366; box-shadow: 0 6px 16px rgba(37,211,102,.35); }\r\n.button--whatsapp.is-disabled { opacity: .6; cursor: not-allowed; transform: none; }\r\n.external-warning { display: block; margin-top: .7rem; color: var(--color-text-muted); font-size: .76rem; line-height: 1.45; }\r\n.button--block { width: 100%; }\r\n\r\n.booking-layout { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(300px, .75fr); gap: 24px; align-items: start; padding: 28px 0; border-top: 1px solid var(--color-border); }\r\n.section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 14px; }\r\n.section-heading span { color: var(--color-primary); font-size: .75rem; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; }\r\n.section-heading h2 { margin: 4px 0 0; font-size: 1.25rem; }\r\n.section-heading p { max-width: 280px; margin: 0; color: var(--color-text-muted); font-size: .8rem; }\r\n.calendar-empty { margin: 10px 0 0; padding: 10px 12px; border-radius: 7px; color: #854d0e; background: #fef9c3; font-size: .8rem; }\r\n.calendar-note { margin: 10px 0 0; color: var(--color-text-muted); font-size: .78rem; line-height: 1.4; }\r\n.booking-card { position: sticky; top: 20px; padding: 22px; border: 1px solid #d8dee8; border-radius: 14px; background: #fff; box-shadow: var(--shadow-card); }\r\n.booking-card__price { display: flex; align-items: baseline; gap: 7px; margin-bottom: 18px; }\r\n.booking-card__price strong { font-size: 1.7rem; }\r\n.booking-card__price span { color: var(--color-text-muted); }\r\n.date-summary { display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 16px; border: 1px solid var(--color-border); border-radius: 9px; overflow: hidden; }\r\n.date-summary div { display: grid; gap: 4px; padding: 11px; }\r\n.date-summary div + div { border-left: 1px solid var(--color-border); }\r\n.date-summary span { color: var(--color-text-muted); font-size: .68rem; font-weight: 700; text-transform: uppercase; }\r\n.date-summary strong { font-size: .78rem; }\r\n.total-row { display: flex; justify-content: space-between; gap: 10px; padding: 8px 0; color: var(--color-text-muted); font-size: .85rem; }\r\n.total-row--strong { margin: 5px 0 15px; padding-top: 13px; border-top: 1px solid var(--color-border); color: var(--color-text); font-size: 1rem; }\r\n.button--reserve { width: 100%; background: linear-gradient(90deg, var(--color-primary), var(--color-accent)); }\r\n.button--reserve:disabled { background: #e4e7ec; color: #475467; box-shadow: none; cursor: default; }\r\n.booking-calendar { min-width: 0; }\r\n.simulation-note { display: block; margin-top: 9px; color: var(--color-text-muted); text-align: center; }\r\n.booking-message { padding: 10px; border-radius: 7px; font-size: .82rem; line-height: 1.4; }\r\n.booking-message--error { color: #991b1b; background: #fee2e2; }\r\n.booking-message--success { color: #166534; background: #dcfce7; }\r\n.booking-actions { display: grid; gap: 10px; margin-top: 14px; }\r\n.button--outline { border: 1px solid #25d366; color: #168a42; background: #fff; box-shadow: none; }\r\n\r\n.image-modal-backdrop { position: fixed; z-index: 1100; inset: 0; display: flex; align-items: center; justify-content: center; padding: 28px; background: rgb(11 24 40 / 88%); }\r\n.image-modal { position: relative; display: flex; align-items: center; justify-content: center; width: min(100%, 1280px); height: min(820px, calc(100dvh - 56px)); min-width: 0; min-height: 0; }\r\n.image-modal img { display: block; max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 10px; box-shadow: 0 24px 70px rgb(0 0 0 / 40%); }\r\n.image-modal__close { position: absolute; z-index: 1; top: -12px; right: -12px; display: grid; place-items: center; width: 38px; height: 38px; border: 0; border-radius: 50%; color: #1d2939; background: #fff; font-size: 1.7rem; line-height: 1; cursor: pointer; box-shadow: 0 4px 16px rgb(0 0 0 / 25%); }\r\n\r\n.advertiser-card { margin-top: 30px; padding: 22px; border: 1px solid var(--color-border); border-radius: 14px; background: var(--color-bg); }\r\n.advertiser-card__head { display: flex; align-items: center; gap: 16px; }\r\n.avatar { display: grid; place-items: center; width: 64px; height: 64px; flex-shrink: 0; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 0 2px var(--color-accent); background: linear-gradient(135deg, var(--color-accent), var(--color-primary)); color: #fff; font-size: 1.6rem; font-weight: 800; transition: transform .4s cubic-bezier(.34,1.56,.64,1); }\r\n.advertiser-card:hover .avatar { transform: scale(1.08) rotate(-4deg); }\r\n.advertiser-card h2 { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin: 0 0 4px; font-size: 1.2rem; }\r\n.advertiser-card h2 .badge { animation: none; }\r\n.advertiser-card p { display: flex; align-items: center; gap: 5px; margin: 0; color: var(--color-text-muted); font-size: .9rem; }\r\n.advertiser-card__stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 20px 0; padding-top: 16px; border-top: 1px solid var(--color-border); }\r\n.advertiser-card__stats dt { color: var(--color-text-muted); font-size: .8rem; }\r\n.advertiser-card__stats dd { margin: 2px 0 0; font-weight: 700; }\r\n\r\n@media (max-width: 760px) {\r\n  .features__grid { grid-template-columns: repeat(2, 1fr); }\r\n  .actions { grid-template-columns: 1fr; }\r\n  .booking-layout { grid-template-columns: 1fr; }\r\n  .booking-card { position: static; }\r\n  .section-heading { align-items: flex-start; flex-direction: column; }\r\n  .section-heading p { max-width: none; }\r\n  .map-section__heading { align-items: flex-start; flex-direction: column; gap: 14px; }\r\n  .edit-link { margin-left: 0; }\r\n}\r\n@media (max-width: 480px) {\r\n  .content { padding-inline: 16px; }\r\n  .gallery { padding: 12px 16px 0; }\r\n  .gallery__main { height: 240px; border-radius: 10px; }\r\n  .image-modal-backdrop { padding: 18px; }\r\n  .image-modal { height: min(820px, calc(100dvh - 36px)); }\r\n  .image-modal__close { top: -8px; right: -4px; }\r\n  .features__grid, .advertiser-card__stats { grid-template-columns: 1fr; }\r\n}\r\n.ingresos-card { position: static; }\r\n.ingresos-card form {\r\n  display: grid;\r\n  gap: 0.45rem;\r\n  padding-top: 0.75rem;\r\n  border-top: 1px solid var(--color-border);\r\n}\r\n\r\n.ingresos-card form p { margin: 0; }\r\n.ingresos-card__campo { display: flex; flex-wrap: wrap; gap: 0.5rem; }\r\n.ingresos-card__campo input {\r\n  width: 12ch;\r\n  padding: 0.5rem 0.7rem;\r\n  border: 1px solid var(--color-border);\r\n  border-radius: var(--radius-sm);\r\n  font: inherit;\r\n  text-transform: uppercase;\r\n}\r\n"] }]
    }], () => [], { confirmacionWhatsapp: [{ type: i0.ViewChild, args: ['confirmacionWhatsapp', { isSignal: true }] }], previousImage: [{
            type: HostListener,
            args: ['document:keydown.arrowleft']
        }], nextImage: [{
            type: HostListener,
            args: ['document:keydown.arrowright']
        }], closeImagePreview: [{
            type: HostListener,
            args: ['document:keydown.escape']
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(PublicationDetailComponent, { className: "PublicationDetailComponent", filePath: "src/app/features/publication-detail/publication-detail.component.ts", lineNumber: 85 }); })();
