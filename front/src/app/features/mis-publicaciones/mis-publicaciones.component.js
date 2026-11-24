import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LucideEye, LucideMapPin, LucidePencil, LucideSquarePlus, LucideTrash2, LucideX } from '@lucide/angular';
import { GestionPublicacionesService } from '../../shared/services/gestion-publicaciones.service';
import { admiteReservasPorFecha } from '../../shared/models/catalogo.model';
import { HistorialLiquidacionesComponent } from '../../shared/components/historial-liquidaciones/historial-liquidaciones.component';
import { PaginadorComponent } from '../../shared/components/paginador/paginador.component';
import { SearchFieldComponent } from '../../shared/components/search-field/search-field.component';
import * as i0 from "@angular/core";
const _c0 = a0 => ["/publicaciones", a0, "editar"];
const _c1 = a0 => ["/publicaciones", a0];
const _forTrack0 = ($index, $item) => $item.id;
function MisPublicacionesComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", ctx_r0.totalPublicaciones(), " en total \u00B7 ", ctx_r0.activas(), " activas");
} }
function MisPublicacionesComponent_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 7);
    i0.ɵɵtext(1);
    i0.ɵɵelementStart(2, "button", 11);
    i0.ɵɵlistener("click", function MisPublicacionesComponent_Conditional_12_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.aviso.set("")); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(3, "svg", 12);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.aviso(), " Pod\u00E9s volver a cargarlas desde Editar, en \u00ABFotos de la propiedad\u00BB. ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 16);
} }
function MisPublicacionesComponent_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 8);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.resultado());
} }
function MisPublicacionesComponent_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 9);
    i0.ɵɵtext(1, "Cargando publicaciones\u2026");
    i0.ɵɵelementEnd();
} }
function MisPublicacionesComponent_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 10);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.error());
} }
function MisPublicacionesComponent_Conditional_16_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 9);
    i0.ɵɵtext(1, "Cargando publicaciones\u2026");
    i0.ɵɵelementEnd();
} }
function MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 23);
} if (rf & 2) {
    const pub_r4 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("src", pub_r4.imagenes[0].url, i0.ɵɵsanitizeUrl)("alt", pub_r4.titulo);
} }
function MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1, "Sin fotos");
    i0.ɵɵelementEnd();
} }
function MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 26);
    i0.ɵɵtext(1, "Desactivada por un administrador");
    i0.ɵɵelementEnd();
} }
function MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 27);
    i0.ɵɵtext(1, "Activa");
    i0.ɵɵelementEnd();
} }
function MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 28);
    i0.ɵɵtext(1, "No publicada \u00B7 falta una imagen");
    i0.ɵɵelementEnd();
} }
function MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 29);
    i0.ɵɵtext(1, "Inactiva");
    i0.ɵɵelementEnd();
} }
function MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 30);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const pub_r4 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(pub_r4.modalidad?.nombre);
} }
function MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 31)(1, "strong");
    i0.ɵɵtext(2, "Motivo de la baja:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const pub_r4 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", pub_r4.motivo_baja_admin);
} }
function MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const pub_r4 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵtextInterpolate1(" \u00B7 ", pub_r4.tipoPropiedad?.nombre, " ");
} }
function MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_37_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "span", 42)(1, "span");
    i0.ɵɵtext(2, "\u00BFEliminar? Se mover\u00E1 a la Papelera y dejar\u00E1 de aparecer en el feed. Pod\u00E9s restaurarla desde all\u00ED.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 46);
    i0.ɵɵlistener("click", function MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_37_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r5); const pub_r4 = i0.ɵɵnextContext().$implicit; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.eliminar(pub_r4)); });
    i0.ɵɵtext(4, "Mover a Papelera");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "button", 47);
    i0.ɵɵlistener("click", function MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_37_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r0.confirmandoBorrado.set(null)); });
    i0.ɵɵtext(6, "Cancelar");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("disabled", ctx_r0.ocupada() !== null);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r0.ocupada() !== null);
} }
function MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_38_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 46);
    i0.ɵɵlistener("click", function MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_38_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r6); const pub_r4 = i0.ɵɵnextContext().$implicit; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.confirmandoBorrado.set(pub_r4.id)); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 48);
    i0.ɵɵtext(2, " Eliminar ");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("disabled", ctx_r0.ocupada() !== null);
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 16);
} }
function MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_39_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 44);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.errorFila()?.mensaje);
} }
function MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_40_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p", 10);
    i0.ɵɵtext(1, "No pudimos cargar las liquidaciones.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "button", 41);
    i0.ɵɵlistener("click", function MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_40_Conditional_3_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r7); const pub_r4 = i0.ɵɵnextContext(2).$implicit; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.cargarLiquidaciones(pub_r4.id)); });
    i0.ɵɵtext(3, "Reintentar");
    i0.ɵɵelementEnd();
} }
function MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_40_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-historial-liquidaciones", 50);
} if (rf & 2) {
    i0.ɵɵproperty("pagos", ctx);
} }
function MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_40_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 51);
    i0.ɵɵtext(1, "Cargando liquidaciones\u2026");
    i0.ɵɵelementEnd();
} }
function MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_40_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 45)(1, "h3", 49);
    i0.ɵɵtext(2, "Liquidaciones de esta publicaci\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_40_Conditional_3_Template, 4, 0)(4, MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_40_Conditional_4_Template, 1, 1, "app-historial-liquidaciones", 50)(5, MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_40_Conditional_5_Template, 2, 0, "p", 51);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_15_0;
    const pub_r4 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵattribute("aria-labelledby", "liquidaciones-" + pub_r4.id);
    i0.ɵɵadvance();
    i0.ɵɵproperty("id", "liquidaciones-" + pub_r4.id);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.errorLiquidaciones() ? 3 : (tmp_15_0 = ctx_r0.liquidaciones()) ? 4 : 5, tmp_15_0);
} }
function MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "article", 20)(1, "div", 21)(2, "div", 22);
    i0.ɵɵconditionalCreate(3, MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_3_Template, 1, 2, "img", 23)(4, MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_4_Template, 2, 0, "span");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 24)(6, "div", 25);
    i0.ɵɵconditionalCreate(7, MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_7_Template, 2, 0, "span", 26)(8, MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_8_Template, 2, 0, "span", 27)(9, MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_9_Template, 2, 0, "span", 28)(10, MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_10_Template, 2, 0, "span", 29);
    i0.ɵɵelementStart(11, "small");
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(13, MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_13_Template, 2, 1, "span", 30);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "h2");
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(16, MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_16_Template, 4, 1, "p", 31);
    i0.ɵɵelementStart(17, "p", 32);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(18, "svg", 33);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(19, "span");
    i0.ɵɵtext(20);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(21, "p", 34)(22, "strong");
    i0.ɵɵtext(23);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(24);
    i0.ɵɵconditionalCreate(25, MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_25_Template, 1, 1);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(26, "div", 35)(27, "a", 36);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(28, "svg", 37);
    i0.ɵɵtext(29, " Editar ");
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(30, "button", 38);
    i0.ɵɵlistener("click", function MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Template_button_click_30_listener() { const pub_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.alternarActividad(pub_r4)); });
    i0.ɵɵtext(31);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(32, "a", 39);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(33, "svg", 40);
    i0.ɵɵtext(34, " Ver ");
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(35, "button", 41);
    i0.ɵɵlistener("click", function MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Template_button_click_35_listener() { const pub_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.alternarLiquidaciones(pub_r4.id)); });
    i0.ɵɵtext(36, " Liquidaciones ");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(37, MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_37_Template, 7, 2, "span", 42)(38, MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_38_Template, 3, 2, "button", 43);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(39, MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_39_Template, 2, 1, "div", 44);
    i0.ɵɵconditionalCreate(40, MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Conditional_40_Template, 6, 3, "section", 45);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const pub_r4 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("item--temp", ctx_r0.esTemporaria(pub_r4.modalidad))("is-busy", ctx_r0.ocupada() === pub_r4.id);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(pub_r4.imagenes?.length ? 3 : 4);
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(pub_r4.motivo_baja_admin ? 7 : pub_r4.activa ? 8 : !pub_r4.imagenes?.length ? 9 : 10);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1("Publicada el ", ctx_r0.fecha(pub_r4.fecha_publicacion));
    i0.ɵɵadvance();
    i0.ɵɵconditional(pub_r4.modalidad?.nombre ? 13 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(pub_r4.titulo);
    i0.ɵɵadvance();
    i0.ɵɵconditional(pub_r4.motivo_baja_admin ? 16 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 14);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.ubicacion(pub_r4));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.precio(pub_r4));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(" \u00B7 ", pub_r4.cantidad_ambientes, " amb. \u00B7 ", pub_r4.superficie, " m\u00B2 ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(pub_r4.tipoPropiedad?.nombre ? 25 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(27, _c0, pub_r4.id));
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 16);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r0.ocupada() !== null || !pub_r4.activa && (!!pub_r4.motivo_baja_admin || !pub_r4.imagenes?.length))("title", pub_r4.motivo_baja_admin ? "La baja administrativa impide activar esta publicaci\u00F3n" : !pub_r4.imagenes?.length ? "Agreg\u00E1 al menos una imagen para activar" : "");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", pub_r4.activa ? "Desactivar" : "Activar", " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(29, _c1, pub_r4.id));
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 16);
    i0.ɵɵadvance(2);
    i0.ɵɵattribute("aria-expanded", ctx_r0.liquidacionesAbiertas() === pub_r4.id);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.confirmandoBorrado() === pub_r4.id ? 37 : 38);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.errorFila()?.id === pub_r4.id ? 39 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.liquidacionesAbiertas() === pub_r4.id ? 40 : -1);
} }
function MisPublicacionesComponent_Conditional_16_Conditional_1_ForEmpty_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 18)(1, "h2");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "a", 5);
    i0.ɵɵtext(6, "Nueva publicaci\u00F3n");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.busqueda() ? "No encontramos publicaciones" : "No ten\u00E9s publicaciones en esta secci\u00F3n");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.busqueda() ? "Prob\u00E1 con otro t\u00E9rmino o limpi\u00E1 la b\u00FAsqueda." : "Las publicaciones que crees o restaures aparecer\u00E1n ac\u00E1.");
} }
function MisPublicacionesComponent_Conditional_16_Conditional_1_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-paginador", 52);
    i0.ɵɵlistener("paginaCambia", function MisPublicacionesComponent_Conditional_16_Conditional_1_Conditional_3_Template_app_paginador_paginaCambia_0_listener($event) { i0.ɵɵrestoreView(_r8); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.cargarPublicaciones($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("pagina", ctx_r0.paginaPublicaciones())("paginas", ctx_r0.paginasPublicaciones())("total", ctx_r0.totalPublicaciones())("deshabilitado", ctx_r0.cargandoPublicaciones() || ctx_r0.ocupada() !== null);
} }
function MisPublicacionesComponent_Conditional_16_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, MisPublicacionesComponent_Conditional_16_Conditional_1_For_1_Template, 41, 31, "article", 17, _forTrack0, false, MisPublicacionesComponent_Conditional_16_Conditional_1_ForEmpty_2_Template, 7, 2, "div", 18);
    i0.ɵɵconditionalCreate(3, MisPublicacionesComponent_Conditional_16_Conditional_1_Conditional_3_Template, 1, 4, "app-paginador", 19);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵrepeater(ctx_r0.publicaciones());
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r0.totalPublicaciones() > 0 ? 3 : -1);
} }
function MisPublicacionesComponent_Conditional_16_For_10_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 23);
} if (rf & 2) {
    const pub_r10 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("src", pub_r10.imagenes[0].url, i0.ɵɵsanitizeUrl)("alt", pub_r10.titulo);
} }
function MisPublicacionesComponent_Conditional_16_For_10_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1, "Sin fotos");
    i0.ɵɵelementEnd();
} }
function MisPublicacionesComponent_Conditional_16_For_10_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 30);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const pub_r10 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(pub_r10.modalidad?.nombre);
} }
function MisPublicacionesComponent_Conditional_16_For_10_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 31)(1, "strong");
    i0.ɵɵtext(2, "Motivo de la baja:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const pub_r10 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", pub_r10.motivo_baja_admin);
} }
function MisPublicacionesComponent_Conditional_16_For_10_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 44);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.errorFila()?.mensaje);
} }
function MisPublicacionesComponent_Conditional_16_For_10_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "article", 20)(1, "div", 21)(2, "div", 22);
    i0.ɵɵconditionalCreate(3, MisPublicacionesComponent_Conditional_16_For_10_Conditional_3_Template, 1, 2, "img", 23)(4, MisPublicacionesComponent_Conditional_16_For_10_Conditional_4_Template, 2, 0, "span");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 24)(6, "div", 25)(7, "span", 29);
    i0.ɵɵtext(8, "En la Papelera");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(9, MisPublicacionesComponent_Conditional_16_For_10_Conditional_9_Template, 2, 1, "span", 30);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "h3");
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "p", 32);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(13, "svg", 33);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(14, "span");
    i0.ɵɵtext(15);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(16, "p", 34)(17, "strong");
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(19);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(20, MisPublicacionesComponent_Conditional_16_For_10_Conditional_20_Template, 4, 1, "p", 31);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "div", 35)(22, "button", 47);
    i0.ɵɵlistener("click", function MisPublicacionesComponent_Conditional_16_For_10_Template_button_click_22_listener() { const pub_r10 = i0.ɵɵrestoreView(_r9).$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.restaurar(pub_r10)); });
    i0.ɵɵtext(23);
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(24, MisPublicacionesComponent_Conditional_16_For_10_Conditional_24_Template, 2, 1, "div", 44);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const pub_r10 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("item--temp", ctx_r0.esTemporaria(pub_r10.modalidad))("is-busy", ctx_r0.ocupada() === pub_r10.id);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(pub_r10.imagenes?.length ? 3 : 4);
    i0.ɵɵadvance(6);
    i0.ɵɵconditional(pub_r10.modalidad?.nombre ? 9 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(pub_r10.titulo);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 14);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.ubicacion(pub_r10));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.precio(pub_r10));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(" \u00B7 ", pub_r10.cantidad_ambientes, " amb. \u00B7 ", pub_r10.superficie, " m\u00B2");
    i0.ɵɵadvance();
    i0.ɵɵconditional(pub_r10.motivo_baja_admin ? 20 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r0.ocupada() !== null);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.ocupada() === pub_r10.id ? "Restaurando\u2026" : "Restaurar", " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.errorFila()?.id === pub_r10.id ? 24 : -1);
} }
function MisPublicacionesComponent_Conditional_16_ForEmpty_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 18)(1, "p");
    i0.ɵɵtext(2, "La Papelera est\u00E1 vac\u00EDa.");
    i0.ɵɵelementEnd()();
} }
function MisPublicacionesComponent_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, MisPublicacionesComponent_Conditional_16_Conditional_0_Template, 2, 0, "p", 9)(1, MisPublicacionesComponent_Conditional_16_Conditional_1_Template, 4, 2);
    i0.ɵɵelementStart(2, "section", 13)(3, "div", 14)(4, "h2", 15);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(5, "svg", 16);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(7, "p");
    i0.ɵɵtext(8, "Las publicaciones eliminadas se conservan ac\u00E1. Al restaurarlas, vuelven a Mis publicaciones como inactivas.");
    i0.ɵɵelementEnd()();
    i0.ɵɵrepeaterCreate(9, MisPublicacionesComponent_Conditional_16_For_10_Template, 25, 16, "article", 17, _forTrack0, false, MisPublicacionesComponent_Conditional_16_ForEmpty_11_Template, 3, 0, "div", 18);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r0.cargandoPublicaciones() ? 0 : 1);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("size", 22);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" Papelera (", ctx_r0.papelera().length, ")");
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r0.papelera());
} }
// Panel del anunciante verificado para administrar sus publicaciones: ver,
// activar, desactivar, mover a la papelera y restaurar. Las imágenes se gestionan en Editar.
export class MisPublicacionesComponent {
    gestion = inject(GestionPublicacionesService);
    destroyRef = inject(DestroyRef);
    solicitudLiquidaciones;
    solicitudPublicaciones;
    limite = 6;
    publicaciones = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "publicaciones" }] : /* istanbul ignore next */ []));
    papelera = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "papelera" }] : /* istanbul ignore next */ []));
    busqueda = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busqueda" }] : /* istanbul ignore next */ []));
    paginaPublicaciones = signal(1, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "paginaPublicaciones" }] : /* istanbul ignore next */ []));
    totalPublicaciones = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "totalPublicaciones" }] : /* istanbul ignore next */ []));
    paginasPublicaciones = signal(1, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "paginasPublicaciones" }] : /* istanbul ignore next */ []));
    activas = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "activas" }] : /* istanbul ignore next */ []));
    esTemporaria = admiteReservasPorFecha;
    cargando = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cargando" }] : /* istanbul ignore next */ []));
    cargandoPublicaciones = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cargandoPublicaciones" }] : /* istanbul ignore next */ []));
    error = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    aviso = signal(inject(ActivatedRoute).snapshot.queryParamMap.get('aviso') ?? '', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "aviso" }] : /* istanbul ignore next */ []));
    resultado = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resultado" }] : /* istanbul ignore next */ []));
    liquidacionesAbiertas = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "liquidacionesAbiertas" }] : /* istanbul ignore next */ []));
    liquidaciones = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "liquidaciones" }] : /* istanbul ignore next */ []));
    errorLiquidaciones = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorLiquidaciones" }] : /* istanbul ignore next */ []));
    confirmandoBorrado = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "confirmandoBorrado" }] : /* istanbul ignore next */ []));
    ocupada = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ocupada" }] : /* istanbul ignore next */ []));
    errorFila = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorFila" }] : /* istanbul ignore next */ []));
    constructor() {
        this.cargar();
    }
    cargar() {
        this.cargando.set(true);
        this.error.set('');
        forkJoin({
            publicaciones: this.gestion.listarMiasPaginadas(this.paginaPublicaciones(), this.limite, this.busqueda()),
            papelera: this.gestion.listarPapelera(),
        }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: ({ publicaciones, papelera }) => {
                this.aplicarPaginaPublicaciones(publicaciones);
                this.papelera.set(papelera);
                this.cargando.set(false);
            },
            error: (err) => {
                this.error.set(err.message);
                this.cargando.set(false);
            },
        });
    }
    aplicarPaginaPublicaciones(pagina) {
        this.publicaciones.set(pagina.datos);
        this.paginaPublicaciones.set(pagina.pagina);
        this.totalPublicaciones.set(pagina.total);
        this.paginasPublicaciones.set(pagina.totalPaginas);
        this.activas.set(pagina.activas);
    }
    cargarPublicaciones(page) {
        if (page < 1 || page > this.paginasPublicaciones())
            return;
        this.solicitudPublicaciones?.unsubscribe();
        this.cargandoPublicaciones.set(true);
        this.error.set('');
        this.solicitudPublicaciones = this.gestion.listarMiasPaginadas(page, this.limite, this.busqueda())
            .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (pagina) => {
                this.aplicarPaginaPublicaciones(pagina);
                this.cargandoPublicaciones.set(false);
            },
            error: (err) => {
                this.error.set(err.message);
                this.cargandoPublicaciones.set(false);
            },
        });
    }
    buscar(texto) {
        this.busqueda.set(texto.trim());
        this.paginaPublicaciones.set(1);
        this.cargarPublicaciones(1);
    }
    alternarLiquidaciones(id) {
        if (this.liquidacionesAbiertas() === id) {
            this.solicitudLiquidaciones?.unsubscribe();
            this.liquidacionesAbiertas.set(null);
            return;
        }
        this.liquidacionesAbiertas.set(id);
        this.cargarLiquidaciones(id);
    }
    cargarLiquidaciones(id) {
        this.solicitudLiquidaciones?.unsubscribe();
        this.liquidaciones.set(null);
        this.errorLiquidaciones.set(false);
        this.solicitudLiquidaciones = this.gestion.listarLiquidaciones(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: pagos => this.liquidaciones.set(pagos),
            error: () => this.errorLiquidaciones.set(true),
        });
    }
    eliminar(pub) {
        if (this.ocupada() !== null)
            return;
        this.ocupada.set(pub.id);
        this.errorFila.set(null);
        this.resultado.set('');
        this.gestion.eliminar(pub.id).subscribe({
            next: () => {
                this.confirmandoBorrado.set(null);
                this.resultado.set('La publicación se movió a la Papelera. Podés restaurarla desde allí.');
                this.ocupada.set(null);
                this.cargar();
            },
            error: (err) => this.fallo(pub.id, err),
        });
    }
    restaurar(pub) {
        if (this.ocupada() !== null)
            return;
        this.ocupada.set(pub.id);
        this.errorFila.set(null);
        this.resultado.set('');
        this.gestion.restaurar(pub.id).subscribe({
            next: () => {
                this.resultado.set('La publicación volvió a Mis publicaciones como inactiva.');
                this.ocupada.set(null);
                this.cargar();
            },
            error: (err) => this.fallo(pub.id, err),
        });
    }
    alternarActividad(pub) {
        if (this.ocupada() !== null)
            return;
        this.ocupada.set(pub.id);
        this.errorFila.set(null);
        this.resultado.set('');
        this.gestion.cambiarActividad(pub.id, !pub.activa).subscribe({
            next: (actualizada) => {
                this.resultado.set(actualizada.activa ? 'Publicación activada.' : 'Publicación desactivada. Ya no aparece en el feed.');
                this.ocupada.set(null);
                this.cargarPublicaciones(this.paginaPublicaciones());
            },
            error: (err) => this.fallo(pub.id, err),
        });
    }
    precio(p) {
        return `${p.tipoMoneda?.nombre ?? '$'} ${Number(p.precio).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
    }
    ubicacion(p) {
        return [p.direccion, p.ciudad?.nombre, p.provincia?.nombre].filter(Boolean).join(', ');
    }
    fecha(valor) {
        return new Date(valor).toLocaleDateString('es-AR', { timeZone: 'UTC' });
    }
    actualizar(id, cambio) {
        this.publicaciones.update((lista) => lista.map((p) => (p.id === id ? cambio(p) : p)));
        this.papelera.update((lista) => lista.map((p) => (p.id === id ? cambio(p) : p)));
    }
    fallo(id, err) {
        this.errorFila.set({ id, mensaje: err.message });
        this.ocupada.set(null);
    }
    static ɵfac = function MisPublicacionesComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || MisPublicacionesComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: MisPublicacionesComponent, selectors: [["app-mis-publicaciones"]], decls: 17, vars: 6, consts: [[1, "acct-page"], [1, "acct-wrap"], [1, "acct-heading"], [1, "acct-heading__tools"], ["placeholder", "Buscar por t\u00EDtulo, direcci\u00F3n, ciudad o ID", "ariaLabel", "Buscar en mis publicaciones", 3, "valueChange", "value"], ["routerLink", "/publicaciones/nueva", 1, "acct-btn", "acct-btn--general"], ["lucideSquarePlus", "", 3, "size"], ["role", "status", 1, "acct-alert", "acct-alert--info", "notice"], ["role", "status", 1, "acct-alert", "acct-alert--info"], [1, "empty"], ["role", "alert", 1, "acct-alert", "acct-alert--error"], ["type", "button", "aria-label", "Cerrar aviso", 3, "click"], ["lucideX", "", 3, "size"], ["aria-labelledby", "papelera-titulo", 1, "trash"], [1, "trash__heading"], ["id", "papelera-titulo"], ["lucideTrash2", "", "aria-hidden", "true", 3, "size"], [1, "acct-card", "item", 3, "item--temp", "is-busy"], [1, "acct-card", "acct-state"], ["etiqueta", "publicaciones", "ariaLabel", "Paginaci\u00F3n de mis publicaciones", 3, "pagina", "paginas", "total", "deshabilitado"], [1, "acct-card", "item"], [1, "item__main"], [1, "item__thumb"], [3, "src", "alt"], [1, "item__info"], [1, "item__badges"], [1, "acct-badge", "acct-badge--warn"], [1, "acct-badge", "acct-badge--ok"], ["title", "Una publicaci\u00F3n necesita al menos una imagen para mostrarse", 1, "acct-badge", "acct-badge--warn"], [1, "acct-badge"], [1, "acct-badge", "item__modality"], [1, "acct-alert", "acct-alert--error"], [1, "item__location"], ["lucideMapPin", "", "aria-hidden", "true", 3, "size"], [1, "item__specs"], [1, "item__actions"], [1, "acct-btn", "acct-btn--general", "acct-btn--sm", 3, "routerLink"], ["lucidePencil", "", "aria-hidden", "true", 3, "size"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", "acct-btn--sm", 3, "click", "disabled", "title"], [1, "acct-btn", "acct-btn--ghost", "acct-btn--sm", 3, "routerLink"], ["lucideEye", "", 3, "size"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", "acct-btn--sm", 3, "click"], [1, "confirm"], ["type", "button", 1, "acct-btn", "acct-btn--danger", "acct-btn--sm", 3, "disabled"], ["role", "alert", 1, "acct-alert", "acct-alert--error", "item__error"], [1, "item__liquidaciones"], ["type", "button", 1, "acct-btn", "acct-btn--danger", "acct-btn--sm", 3, "click", "disabled"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", "acct-btn--sm", 3, "click", "disabled"], ["lucideTrash2", "", 3, "size"], [3, "id"], ["vacio", "Todav\u00EDa no hay pagos registrados para esta publicaci\u00F3n.", 3, "pagos"], ["role", "status"], ["etiqueta", "publicaciones", "ariaLabel", "Paginaci\u00F3n de mis publicaciones", 3, "paginaCambia", "pagina", "paginas", "total", "deshabilitado"]], template: function MisPublicacionesComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "div", 1)(2, "div", 2)(3, "div")(4, "h1");
            i0.ɵɵtext(5, "Mis publicaciones");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(6, MisPublicacionesComponent_Conditional_6_Template, 2, 2, "p");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "div", 3)(8, "app-search-field", 4);
            i0.ɵɵlistener("valueChange", function MisPublicacionesComponent_Template_app_search_field_valueChange_8_listener($event) { return ctx.buscar($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "a", 5);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(10, "svg", 6);
            i0.ɵɵtext(11, " Nueva publicaci\u00F3n ");
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(12, MisPublicacionesComponent_Conditional_12_Template, 4, 2, "div", 7);
            i0.ɵɵconditionalCreate(13, MisPublicacionesComponent_Conditional_13_Template, 2, 1, "div", 8);
            i0.ɵɵconditionalCreate(14, MisPublicacionesComponent_Conditional_14_Template, 2, 0, "p", 9)(15, MisPublicacionesComponent_Conditional_15_Template, 2, 1, "div", 10)(16, MisPublicacionesComponent_Conditional_16_Template, 12, 4);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(6);
            i0.ɵɵconditional(!ctx.cargando() && !ctx.error() ? 6 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("value", ctx.busqueda());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("size", 18);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.aviso() ? 12 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.resultado() ? 13 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.cargando() ? 14 : ctx.error() ? 15 : 16);
        } }, dependencies: [RouterLink, HistorialLiquidacionesComponent, PaginadorComponent, SearchFieldComponent, LucideEye, LucideMapPin, LucidePencil, LucideSquarePlus, LucideTrash2, LucideX], styles: [".acct-btn[_ngcontent-%COMP%] { box-shadow: 0 4px 9px rgb(16 24 40 / 14%); }\r\n.acct-btn--general[_ngcontent-%COMP%] { background: var(--%NS%color-accent); color: var(--%NS%color-text); box-shadow: 0 4px 9px color-mix(in srgb, var(--%NS%color-accent), transparent 65%); }\r\n.acct-btn--%NS%general[_ngcontent-%COMP%]:hover { filter: brightness(1.08); transform: translateY(-1px); }\r\n\r\n.notice[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 0.75rem; }\r\n.notice[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { margin-left: auto; display: grid; border: 0; background: transparent; color: inherit; cursor: pointer; }\r\n\r\n.acct-heading__tools[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }\r\n.empty[_ngcontent-%COMP%] { padding: 28px; text-align: center; color: var(--%NS%color-text-muted); }\r\n\r\n@media (max-width: 640px) {\r\n  .acct-heading__tools[_ngcontent-%COMP%] { width: 100%; }\r\n  .acct-heading__tools[_ngcontent-%COMP%]   app-search-field[_ngcontent-%COMP%], \r\n   .acct-heading__tools[_ngcontent-%COMP%]   .acct-btn[_ngcontent-%COMP%] { flex: 1 1 100%; }\r\n}\r\n\r\n.item[_ngcontent-%COMP%] {\r\n  --%NS%publication-tone: var(--%NS%color-primary);\r\n  padding: 1rem;\r\n  transition: opacity 0.15s ease;\r\n}\r\n.item--temp[_ngcontent-%COMP%] { --%NS%publication-tone: #124aa6; }\r\n.item.is-busy[_ngcontent-%COMP%] { opacity: 0.75; }\r\n.item__main[_ngcontent-%COMP%] { display: grid; grid-template-columns: 170px minmax(0, 1fr); column-gap: 1.1rem; row-gap: .65rem; align-items: start; }\r\n\r\n.item__thumb[_ngcontent-%COMP%] {\r\n  grid-column: 1;\r\n  grid-row: 1 / span 2;\r\n  align-self: start;\r\n  aspect-ratio: 4 / 3;\r\n  border-radius: var(--%NS%radius-sm);\r\n  overflow: hidden;\r\n  background: var(--%NS%color-bg);\r\n  display: grid;\r\n  place-items: center;\r\n  color: var(--%NS%color-text-muted);\r\n  font-size: 0.8rem;\r\n}\r\n.item__thumb[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] { width: 100%; height: 100%; object-fit: cover; display: block; }\r\n\r\n.item__info[_ngcontent-%COMP%] { grid-column: 2; min-width: 0; }\r\n.item__info[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%], .item__info[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] { margin: 0.35rem 0 0.2rem; font-size: 1.1rem; }\r\n.item__badges[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; }\r\n.item__badges[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); font-size: 0.78rem; }\r\n.item__modality[_ngcontent-%COMP%] { margin-left: auto; padding: .43rem .7rem; border-radius: 999px; background: var(--%NS%publication-tone); color: #fff; font-size: .72rem; font-weight: 800; box-shadow: 0 3px 7px #0003; }\r\n.item__location[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 0.3rem; margin: 0; color: var(--%NS%color-text-muted); font-size: 0.88rem; }\r\n.item__location[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { color: var(--%NS%color-accent); flex-shrink: 0; }\r\n.item__location[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { min-width: 0; overflow-wrap: anywhere; }\r\n.item__specs[_ngcontent-%COMP%] { margin: 0.35rem 0 0; font-size: 0.9rem; }\r\n\r\n.item__actions[_ngcontent-%COMP%] { grid-column: 2; display: flex; flex-wrap: wrap; align-items: center; gap: 0.45rem; }\r\n.confirm[_ngcontent-%COMP%] { flex: 1 1 100%; display: flex; flex-wrap: wrap; align-items: center; gap: 0.35rem; font-size: 0.85rem; font-weight: 600; }\r\n.confirm[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] { flex-basis: 100%; }\r\n.item__error[_ngcontent-%COMP%] { margin-top: 0.75rem; }\r\n\r\n.trash[_ngcontent-%COMP%] { display: flex; flex-direction: column; gap: 1.25rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--%NS%color-border); }\r\n.trash__heading[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 0.5rem; margin: 0; font-size: 1.3rem; }\r\n.trash__heading[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0.5rem 0 0; color: var(--%NS%color-text-muted); }\r\n\r\n.item__liquidaciones[_ngcontent-%COMP%] {\r\n  margin-top: 1rem;\r\n  padding-top: 1rem;\r\n  border-top: 1px solid var(--%NS%color-border);\r\n}\r\n.item__liquidaciones[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] { margin: 0 0 0.75rem; font-size: 1rem; }\r\n\r\n@media (max-width: 640px) {\r\n  .item[_ngcontent-%COMP%] { padding: .9rem; }\r\n  .item__main[_ngcontent-%COMP%] { grid-template-columns: 110px minmax(0, 1fr); column-gap: .85rem; row-gap: .85rem; }\r\n  .item__badges[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { order: 1; flex-basis: 100%; }\r\n  .item__thumb[_ngcontent-%COMP%] { grid-row: 1; }\r\n  .item__actions[_ngcontent-%COMP%] { grid-column: 1 / -1; }\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MisPublicacionesComponent, [{
        type: Component,
        args: [{ selector: 'app-mis-publicaciones', standalone: true, imports: [RouterLink, HistorialLiquidacionesComponent, PaginadorComponent, SearchFieldComponent, LucideEye, LucideMapPin, LucidePencil, LucideSquarePlus, LucideTrash2, LucideX], template: "<section class=\"acct-page\">\r\n  <div class=\"acct-wrap\">\r\n    <div class=\"acct-heading\">\r\n      <div>\r\n        <h1>Mis publicaciones</h1>\r\n        @if (!cargando() && !error()) {\r\n          <p>{{ totalPublicaciones() }} en total \u00B7 {{ activas() }} activas</p>\r\n        }\r\n      </div>\r\n      <div class=\"acct-heading__tools\">\r\n        <app-search-field\r\n          [value]=\"busqueda()\"\r\n          placeholder=\"Buscar por t\u00EDtulo, direcci\u00F3n, ciudad o ID\"\r\n          ariaLabel=\"Buscar en mis publicaciones\"\r\n          (valueChange)=\"buscar($event)\"\r\n        />\r\n        <a routerLink=\"/publicaciones/nueva\" class=\"acct-btn acct-btn--general\">\r\n          <svg lucideSquarePlus [size]=\"18\"></svg> Nueva publicaci\u00F3n\r\n        </a>\r\n      </div>\r\n    </div>\r\n\r\n    @if (aviso()) {\r\n      <div class=\"acct-alert acct-alert--info notice\" role=\"status\">\r\n        {{ aviso() }} Pod\u00E9s volver a cargarlas desde Editar, en \u00ABFotos de la propiedad\u00BB.\r\n        <button type=\"button\" aria-label=\"Cerrar aviso\" (click)=\"aviso.set('')\"><svg lucideX [size]=\"16\"></svg></button>\r\n      </div>\r\n    }\r\n\r\n    @if (resultado()) {\r\n      <div class=\"acct-alert acct-alert--info\" role=\"status\">{{ resultado() }}</div>\r\n    }\r\n\r\n    @if (cargando()) {\r\n      <p class=\"empty\">Cargando publicaciones\u2026</p>\r\n    } @else if (error()) {\r\n      <div class=\"acct-alert acct-alert--error\" role=\"alert\">{{ error() }}</div>\r\n    } @else {\r\n      @if (cargandoPublicaciones()) {\r\n        <p class=\"empty\">Cargando publicaciones\u2026</p>\r\n      } @else {\r\n      @for (pub of publicaciones(); track pub.id) {\r\n        <article class=\"acct-card item\" [class.item--temp]=\"esTemporaria(pub.modalidad)\" [class.is-busy]=\"ocupada() === pub.id\">\r\n          <div class=\"item__main\">\r\n            <div class=\"item__thumb\">\r\n              @if (pub.imagenes?.length) {\r\n                <img [src]=\"pub.imagenes![0].url\" [alt]=\"pub.titulo\" />\r\n              } @else {\r\n                <span>Sin fotos</span>\r\n              }\r\n            </div>\r\n\r\n            <div class=\"item__info\">\r\n              <div class=\"item__badges\">\r\n                @if (pub.motivo_baja_admin) {\r\n                  <span class=\"acct-badge acct-badge--warn\">Desactivada por un administrador</span>\r\n                } @else if (pub.activa) {\r\n                  <span class=\"acct-badge acct-badge--ok\">Activa</span>\r\n                } @else if (!pub.imagenes?.length) {\r\n                  <span class=\"acct-badge acct-badge--warn\" title=\"Una publicaci\u00F3n necesita al menos una imagen para mostrarse\">No publicada \u00B7 falta una imagen</span>\r\n                } @else {\r\n                  <span class=\"acct-badge\">Inactiva</span>\r\n                }\r\n                <small>Publicada el {{ fecha(pub.fecha_publicacion) }}</small>\r\n                @if (pub.modalidad?.nombre) { <span class=\"acct-badge item__modality\">{{ pub.modalidad?.nombre }}</span> }\r\n              </div>\r\n              <h2>{{ pub.titulo }}</h2>\r\n              @if (pub.motivo_baja_admin) {\r\n                <p class=\"acct-alert acct-alert--error\"><strong>Motivo de la baja:</strong> {{ pub.motivo_baja_admin }}</p>\r\n              }\r\n              <p class=\"item__location\"><svg lucideMapPin [size]=\"14\" aria-hidden=\"true\"></svg><span>{{ ubicacion(pub) }}</span></p>\r\n              <p class=\"item__specs\">\r\n                <strong>{{ precio(pub) }}</strong> \u00B7 {{ pub.cantidad_ambientes }} amb. \u00B7 {{ pub.superficie }} m\u00B2\r\n                @if (pub.tipoPropiedad?.nombre) { \u00B7 {{ pub.tipoPropiedad?.nombre }} }\r\n              </p>\r\n            </div>\r\n\r\n            <div class=\"item__actions\">\r\n              <a class=\"acct-btn acct-btn--general acct-btn--sm\" [routerLink]=\"['/publicaciones', pub.id, 'editar']\">\r\n                <svg lucidePencil [size]=\"16\" aria-hidden=\"true\"></svg> Editar\r\n              </a>\r\n              <button type=\"button\" class=\"acct-btn acct-btn--ghost acct-btn--sm\"\r\n                [disabled]=\"ocupada() !== null || (!pub.activa && (!!pub.motivo_baja_admin || !pub.imagenes?.length))\"\r\n                [title]=\"pub.motivo_baja_admin ? 'La baja administrativa impide activar esta publicaci\u00F3n' : (!pub.imagenes?.length ? 'Agreg\u00E1 al menos una imagen para activar' : '')\"\r\n                (click)=\"alternarActividad(pub)\">\r\n                {{ pub.activa ? 'Desactivar' : 'Activar' }}\r\n              </button>\r\n              <a class=\"acct-btn acct-btn--ghost acct-btn--sm\" [routerLink]=\"['/publicaciones', pub.id]\">\r\n                <svg lucideEye [size]=\"16\"></svg> Ver\r\n              </a>\r\n              <button type=\"button\" class=\"acct-btn acct-btn--ghost acct-btn--sm\" (click)=\"alternarLiquidaciones(pub.id)\"\r\n                [attr.aria-expanded]=\"liquidacionesAbiertas() === pub.id\">\r\n                Liquidaciones\r\n              </button>\r\n              @if (confirmandoBorrado() === pub.id) {\r\n                <span class=\"confirm\">\r\n                  <span>\u00BFEliminar? Se mover\u00E1 a la Papelera y dejar\u00E1 de aparecer en el feed. Pod\u00E9s restaurarla desde all\u00ED.</span>\r\n                  <button type=\"button\" class=\"acct-btn acct-btn--danger acct-btn--sm\" [disabled]=\"ocupada() !== null\" (click)=\"eliminar(pub)\">Mover a Papelera</button>\r\n                  <button type=\"button\" class=\"acct-btn acct-btn--ghost acct-btn--sm\" [disabled]=\"ocupada() !== null\" (click)=\"confirmandoBorrado.set(null)\">Cancelar</button>\r\n                </span>\r\n              } @else {\r\n                <button type=\"button\" class=\"acct-btn acct-btn--danger acct-btn--sm\" [disabled]=\"ocupada() !== null\" (click)=\"confirmandoBorrado.set(pub.id)\">\r\n                  <svg lucideTrash2 [size]=\"16\"></svg> Eliminar\r\n                </button>\r\n              }\r\n            </div>\r\n          </div>\r\n\r\n          @if (errorFila()?.id === pub.id) {\r\n            <div class=\"acct-alert acct-alert--error item__error\" role=\"alert\">{{ errorFila()?.mensaje }}</div>\r\n          }\r\n\r\n          @if (liquidacionesAbiertas() === pub.id) {\r\n            <section class=\"item__liquidaciones\" [attr.aria-labelledby]=\"'liquidaciones-' + pub.id\">\r\n              <h3 [id]=\"'liquidaciones-' + pub.id\">Liquidaciones de esta publicaci\u00F3n</h3>\r\n              @if (errorLiquidaciones()) {\r\n                <p class=\"acct-alert acct-alert--error\" role=\"alert\">No pudimos cargar las liquidaciones.</p>\r\n                <button type=\"button\" class=\"acct-btn acct-btn--ghost acct-btn--sm\" (click)=\"cargarLiquidaciones(pub.id)\">Reintentar</button>\r\n              } @else if (liquidaciones(); as pagos) {\r\n                <app-historial-liquidaciones [pagos]=\"pagos\" vacio=\"Todav\u00EDa no hay pagos registrados para esta publicaci\u00F3n.\" />\r\n              } @else {\r\n                <p role=\"status\">Cargando liquidaciones\u2026</p>\r\n              }\r\n            </section>\r\n          }\r\n        </article>\r\n      } @empty {\r\n        <div class=\"acct-card acct-state\">\r\n          <h2>{{ busqueda() ? 'No encontramos publicaciones' : 'No ten\u00E9s publicaciones en esta secci\u00F3n' }}</h2>\r\n          <p>{{ busqueda() ? 'Prob\u00E1 con otro t\u00E9rmino o limpi\u00E1 la b\u00FAsqueda.' : 'Las publicaciones que crees o restaures aparecer\u00E1n ac\u00E1.' }}</p>\r\n          <a routerLink=\"/publicaciones/nueva\" class=\"acct-btn acct-btn--general\">Nueva publicaci\u00F3n</a>\r\n        </div>\r\n      }\r\n\r\n      @if (totalPublicaciones() > 0) {\r\n        <app-paginador\r\n          [pagina]=\"paginaPublicaciones()\"\r\n          [paginas]=\"paginasPublicaciones()\"\r\n          [total]=\"totalPublicaciones()\"\r\n          etiqueta=\"publicaciones\"\r\n          ariaLabel=\"Paginaci\u00F3n de mis publicaciones\"\r\n          [deshabilitado]=\"cargandoPublicaciones() || ocupada() !== null\"\r\n          (paginaCambia)=\"cargarPublicaciones($event)\"\r\n        />\r\n      }\r\n      }\r\n\r\n      <section class=\"trash\" aria-labelledby=\"papelera-titulo\">\r\n        <div class=\"trash__heading\">\r\n          <h2 id=\"papelera-titulo\"><svg lucideTrash2 [size]=\"22\" aria-hidden=\"true\"></svg> Papelera ({{ papelera().length }})</h2>\r\n          <p>Las publicaciones eliminadas se conservan ac\u00E1. Al restaurarlas, vuelven a Mis publicaciones como inactivas.</p>\r\n        </div>\r\n        @for (pub of papelera(); track pub.id) {\r\n          <article class=\"acct-card item\" [class.item--temp]=\"esTemporaria(pub.modalidad)\" [class.is-busy]=\"ocupada() === pub.id\">\r\n            <div class=\"item__main\">\r\n              <div class=\"item__thumb\">\r\n                @if (pub.imagenes?.length) {\r\n                  <img [src]=\"pub.imagenes![0].url\" [alt]=\"pub.titulo\" />\r\n                } @else {\r\n                  <span>Sin fotos</span>\r\n                }\r\n              </div>\r\n              <div class=\"item__info\">\r\n                <div class=\"item__badges\">\r\n                  <span class=\"acct-badge\">En la Papelera</span>\r\n                  @if (pub.modalidad?.nombre) { <span class=\"acct-badge item__modality\">{{ pub.modalidad?.nombre }}</span> }\r\n                </div>\r\n                <h3>{{ pub.titulo }}</h3>\r\n                <p class=\"item__location\"><svg lucideMapPin [size]=\"14\" aria-hidden=\"true\"></svg><span>{{ ubicacion(pub) }}</span></p>\r\n                <p class=\"item__specs\"><strong>{{ precio(pub) }}</strong> \u00B7 {{ pub.cantidad_ambientes }} amb. \u00B7 {{ pub.superficie }} m\u00B2</p>\r\n                @if (pub.motivo_baja_admin) {\r\n                  <p class=\"acct-alert acct-alert--error\"><strong>Motivo de la baja:</strong> {{ pub.motivo_baja_admin }}</p>\r\n                }\r\n              </div>\r\n              <div class=\"item__actions\">\r\n                <button type=\"button\" class=\"acct-btn acct-btn--ghost acct-btn--sm\" [disabled]=\"ocupada() !== null\" (click)=\"restaurar(pub)\">\r\n                  {{ ocupada() === pub.id ? 'Restaurando\u2026' : 'Restaurar' }}\r\n                </button>\r\n              </div>\r\n            </div>\r\n            @if (errorFila()?.id === pub.id) {\r\n              <div class=\"acct-alert acct-alert--error item__error\" role=\"alert\">{{ errorFila()?.mensaje }}</div>\r\n            }\r\n          </article>\r\n        } @empty {\r\n          <div class=\"acct-card acct-state\"><p>La Papelera est\u00E1 vac\u00EDa.</p></div>\r\n        }\r\n      </section>\r\n    }\r\n  </div>\r\n</section>\r\n", styles: [".acct-btn { box-shadow: 0 4px 9px rgb(16 24 40 / 14%); }\r\n.acct-btn--general { background: var(--color-accent); color: var(--color-text); box-shadow: 0 4px 9px color-mix(in srgb, var(--color-accent), transparent 65%); }\r\n.acct-btn--general:hover { filter: brightness(1.08); transform: translateY(-1px); }\r\n\r\n.notice { display: flex; align-items: center; gap: 0.75rem; }\r\n.notice button { margin-left: auto; display: grid; border: 0; background: transparent; color: inherit; cursor: pointer; }\r\n\r\n.acct-heading__tools { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }\r\n.empty { padding: 28px; text-align: center; color: var(--color-text-muted); }\r\n\r\n@media (max-width: 640px) {\r\n  .acct-heading__tools { width: 100%; }\r\n  .acct-heading__tools app-search-field,\r\n  .acct-heading__tools .acct-btn { flex: 1 1 100%; }\r\n}\r\n\r\n.item {\r\n  --publication-tone: var(--color-primary);\r\n  padding: 1rem;\r\n  transition: opacity 0.15s ease;\r\n}\r\n.item--temp { --publication-tone: #124aa6; }\r\n.item.is-busy { opacity: 0.75; }\r\n.item__main { display: grid; grid-template-columns: 170px minmax(0, 1fr); column-gap: 1.1rem; row-gap: .65rem; align-items: start; }\r\n\r\n.item__thumb {\r\n  grid-column: 1;\r\n  grid-row: 1 / span 2;\r\n  align-self: start;\r\n  aspect-ratio: 4 / 3;\r\n  border-radius: var(--radius-sm);\r\n  overflow: hidden;\r\n  background: var(--color-bg);\r\n  display: grid;\r\n  place-items: center;\r\n  color: var(--color-text-muted);\r\n  font-size: 0.8rem;\r\n}\r\n.item__thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }\r\n\r\n.item__info { grid-column: 2; min-width: 0; }\r\n.item__info h2, .item__info h3 { margin: 0.35rem 0 0.2rem; font-size: 1.1rem; }\r\n.item__badges { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; }\r\n.item__badges small { color: var(--color-text-muted); font-size: 0.78rem; }\r\n.item__modality { margin-left: auto; padding: .43rem .7rem; border-radius: 999px; background: var(--publication-tone); color: #fff; font-size: .72rem; font-weight: 800; box-shadow: 0 3px 7px #0003; }\r\n.item__location { display: flex; align-items: center; gap: 0.3rem; margin: 0; color: var(--color-text-muted); font-size: 0.88rem; }\r\n.item__location svg { color: var(--color-accent); flex-shrink: 0; }\r\n.item__location span { min-width: 0; overflow-wrap: anywhere; }\r\n.item__specs { margin: 0.35rem 0 0; font-size: 0.9rem; }\r\n\r\n.item__actions { grid-column: 2; display: flex; flex-wrap: wrap; align-items: center; gap: 0.45rem; }\r\n.confirm { flex: 1 1 100%; display: flex; flex-wrap: wrap; align-items: center; gap: 0.35rem; font-size: 0.85rem; font-weight: 600; }\r\n.confirm > span { flex-basis: 100%; }\r\n.item__error { margin-top: 0.75rem; }\r\n\r\n.trash { display: flex; flex-direction: column; gap: 1.25rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--color-border); }\r\n.trash__heading h2 { display: flex; align-items: center; gap: 0.5rem; margin: 0; font-size: 1.3rem; }\r\n.trash__heading p { margin: 0.5rem 0 0; color: var(--color-text-muted); }\r\n\r\n.item__liquidaciones {\r\n  margin-top: 1rem;\r\n  padding-top: 1rem;\r\n  border-top: 1px solid var(--color-border);\r\n}\r\n.item__liquidaciones h3 { margin: 0 0 0.75rem; font-size: 1rem; }\r\n\r\n@media (max-width: 640px) {\r\n  .item { padding: .9rem; }\r\n  .item__main { grid-template-columns: 110px minmax(0, 1fr); column-gap: .85rem; row-gap: .85rem; }\r\n  .item__badges small { order: 1; flex-basis: 100%; }\r\n  .item__thumb { grid-row: 1; }\r\n  .item__actions { grid-column: 1 / -1; }\r\n}\r\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(MisPublicacionesComponent, { className: "MisPublicacionesComponent", filePath: "src/app/features/mis-publicaciones/mis-publicaciones.component.ts", lineNumber: 22 }); })();
