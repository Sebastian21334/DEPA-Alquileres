import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { activarActualizacionReservas } from '../../shared/utils/reservation-refresh';
import { estadiaActiva } from '../../shared/utils/reservation-state';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { GestionPublicacionesService } from '../../shared/services/gestion-publicaciones.service';
import { ReservationService } from '../../shared/services/reservation.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { HistorialLiquidacionesComponent } from '../../shared/components/historial-liquidaciones/historial-liquidaciones.component';
import { PaginadorComponent } from '../../shared/components/paginador/paginador.component';
import { SearchFieldComponent } from '../../shared/components/search-field/search-field.component';
import { normalizarTexto } from '../../shared/utils/texto';
import * as i0 from "@angular/core";
const _c0 = a0 => ["/publicaciones", a0];
const _forTrack0 = ($index, $item) => $item.key;
const _forTrack1 = ($index, $item) => $item.day;
const _forTrack2 = ($index, $item) => $item.publicacion.id;
function DashboardComponent_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 7);
    i0.ɵɵelement(1, "app-spinner");
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3, "Preparando tus m\u00E9tricas\u2026");
    i0.ɵɵelementEnd()();
} }
function DashboardComponent_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 8);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.error());
} }
function DashboardComponent_Conditional_17_For_64_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(0, "circle", 29)(1, "title");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const month_r3 = ctx.$implicit;
    const ɵ$index_146_r4 = ctx.$index;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵattribute("cx", 20 + ɵ$index_146_r4 * 112)("cy", ctx_r0.linePoints().split(" ")[ɵ$index_146_r4].split(",")[1]);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", month_r3.label, ": ", ctx_r0.moneda(month_r3.ingresos));
} }
function DashboardComponent_Conditional_17_For_67_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span")(1, "strong");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "small");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const month_r5 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(month_r5.label);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", month_r5.reservas, " res.");
} }
function DashboardComponent_Conditional_17_For_77_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 33)(1, "strong");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵelement(4, "i");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "small");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const day_r6 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(day_r6.value);
    i0.ɵɵadvance(2);
    i0.ɵɵstyleProp("height", ctx_r0.alturaBarra(day_r6.value), "%");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(day_r6.label);
} }
function DashboardComponent_Conditional_17_For_102_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 52);
} if (rf & 2) {
    const item_r7 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("src", ctx, i0.ɵɵsanitizeUrl)("alt", item_r7.publicacion.titulo);
} }
function DashboardComponent_Conditional_17_For_102_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 53);
    i0.ɵɵtext(1, "\u2302");
    i0.ɵɵelementEnd();
} }
function DashboardComponent_Conditional_17_For_102_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 41)(1, "div", 51);
    i0.ɵɵconditionalCreate(2, DashboardComponent_Conditional_17_For_102_Conditional_2_Template, 1, 2, "img", 52)(3, DashboardComponent_Conditional_17_For_102_Conditional_3_Template, 2, 0, "span", 53);
    i0.ɵɵelementStart(4, "div")(5, "strong");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "small");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(9, "span", 54);
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "span", 55);
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "strong", 56);
    i0.ɵɵtext(14);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "a", 57);
    i0.ɵɵtext(16, "\u2197");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_11_0;
    const item_r7 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_11_0 = item_r7.publicacion.imagenes?.[0]?.url) ? 2 : 3, tmp_11_0);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(item_r7.publicacion.titulo);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r7.publicacion.activa ? "Activa" : "Inactiva");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.numero(item_r7.visualizaciones));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r7.reservas);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.moneda(item_r7.ingresos));
    i0.ɵɵadvance();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(7, _c0, item_r7.publicacion.id));
} }
function DashboardComponent_Conditional_17_ForEmpty_103_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 42);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.busquedaRendimiento().trim() ? "No encontramos publicaciones para esa b\u00FAsqueda." : "Todav\u00EDa no hay publicaciones para analizar.");
} }
function DashboardComponent_Conditional_17_Conditional_104_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-paginador", 58);
    i0.ɵɵlistener("paginaCambia", function DashboardComponent_Conditional_17_Conditional_104_Template_app_paginador_paginaCambia_0_listener($event) { i0.ɵɵrestoreView(_r8); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.paginaRendimiento.set($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("pagina", ctx_r0.paginaRendimientoActual())("paginas", ctx_r0.paginasRendimiento())("total", ctx_r0.rendimientoFiltrado().length);
} }
function DashboardComponent_Conditional_17_Conditional_120_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small", 46);
    i0.ɵɵtext(1, "La m\u00E9trica comenzar\u00E1 a calcularse cuando tus anuncios reciban visitas.");
    i0.ɵɵelementEnd();
} }
function DashboardComponent_Conditional_17_Conditional_128_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p", 8);
    i0.ɵɵtext(1, "No pudimos cargar el historial de liquidaciones.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "button", 59);
    i0.ɵɵlistener("click", function DashboardComponent_Conditional_17_Conditional_128_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r9); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.cargarPagos()); });
    i0.ɵɵtext(3, "Reintentar");
    i0.ɵɵelementEnd();
} }
function DashboardComponent_Conditional_17_Conditional_129_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-historial-liquidaciones", 49);
} if (rf & 2) {
    i0.ɵɵproperty("pagos", ctx)("mostrarPublicacion", true)("limite", 5);
} }
function DashboardComponent_Conditional_17_Conditional_130_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 50);
    i0.ɵɵtext(1, "Cargando liquidaciones\u2026");
    i0.ɵɵelementEnd();
} }
function DashboardComponent_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 9)(1, "article", 10)(2, "span", 11);
    i0.ɵɵtext(3, "\u25C9");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div")(5, "small");
    i0.ɵɵtext(6, "Visualizaciones");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "strong");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "p");
    i0.ɵɵtext(10, "Aperturas de tus publicaciones");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(11, "article", 10)(12, "span", 12);
    i0.ɵɵtext(13, "\u2302");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "div")(15, "small");
    i0.ɵɵtext(16, "Publicaciones activas");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "strong");
    i0.ɵɵtext(18);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "p");
    i0.ɵɵtext(20);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(21, "article", 10)(22, "span", 13);
    i0.ɵɵtext(23, "\u2713");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "div")(25, "small");
    i0.ɵɵtext(26, "Reservas recibidas");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "strong");
    i0.ɵɵtext(28);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "p");
    i0.ɵɵtext(30);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(31, "article", 10)(32, "span", 14);
    i0.ɵɵtext(33, "$");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(34, "div")(35, "small");
    i0.ɵɵtext(36, "Ingresos por reservas");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(37, "strong");
    i0.ɵɵtext(38);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(39, "p");
    i0.ɵɵtext(40, "Sin contar cancelaciones");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(41, "div", 15)(42, "article", 16)(43, "div", 17)(44, "div")(45, "span");
    i0.ɵɵtext(46, "Evoluci\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(47, "h2");
    i0.ɵɵtext(48, "Ingresos de los \u00FAltimos 6 meses");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(49, "strong");
    i0.ɵɵtext(50);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(51, "div", 18);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(52, "svg", 19)(53, "defs")(54, "linearGradient", 20);
    i0.ɵɵelement(55, "stop", 21)(56, "stop", 22);
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(57, "line", 23)(58, "line", 24)(59, "line", 25)(60, "line", 26)(61, "path", 27)(62, "polyline", 28);
    i0.ɵɵrepeaterCreate(63, DashboardComponent_Conditional_17_For_64_Template, 3, 4, ":svg:circle", 29, _forTrack0);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(65, "div", 30);
    i0.ɵɵrepeaterCreate(66, DashboardComponent_Conditional_17_For_67_Template, 5, 2, "span", null, _forTrack0);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(68, "article", 31)(69, "div", 17)(70, "div")(71, "span");
    i0.ɵɵtext(72, "Actividad");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(73, "h2");
    i0.ɵɵtext(74, "Reservas por d\u00EDa");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(75, "div", 32);
    i0.ɵɵrepeaterCreate(76, DashboardComponent_Conditional_17_For_77_Template, 7, 4, "div", 33, _forTrack1);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(78, "div", 34)(79, "article", 35)(80, "div", 17)(81, "div")(82, "span");
    i0.ɵɵtext(83, "Rendimiento");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(84, "h2");
    i0.ɵɵtext(85, "Rendimiento por publicaci\u00F3n");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(86, "a", 36);
    i0.ɵɵtext(87, "Ver todas \u2192");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(88, "div", 37)(89, "app-search-field", 38);
    i0.ɵɵlistener("valueChange", function DashboardComponent_Conditional_17_Template_app_search_field_valueChange_89_listener($event) { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.buscarRendimiento($event)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(90, "div", 39)(91, "div", 40)(92, "span");
    i0.ɵɵtext(93, "Publicaci\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(94, "span");
    i0.ɵɵtext(95, "Vistas");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(96, "span");
    i0.ɵɵtext(97, "Reservas");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(98, "span");
    i0.ɵɵtext(99, "Ingresos");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(100, "span");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(101, DashboardComponent_Conditional_17_For_102_Template, 17, 9, "div", 41, _forTrack2, false, DashboardComponent_Conditional_17_ForEmpty_103_Template, 2, 1, "div", 42);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(104, DashboardComponent_Conditional_17_Conditional_104_Template, 1, 3, "app-paginador", 43);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(105, "article", 44)(106, "div", 17)(107, "div")(108, "span");
    i0.ɵɵtext(109, "Conversi\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(110, "h2");
    i0.ɵɵtext(111, "Vistas que reservan");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(112, "div", 45)(113, "div")(114, "strong");
    i0.ɵɵtext(115);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(116, "small");
    i0.ɵɵtext(117, "conversi\u00F3n");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(118, "p");
    i0.ɵɵtext(119, "Relaci\u00F3n entre las visualizaciones registradas y las reservas confirmadas.");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(120, DashboardComponent_Conditional_17_Conditional_120_Template, 2, 0, "small", 46);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(121, "article", 47)(122, "div", 17)(123, "div")(124, "span");
    i0.ɵɵtext(125, "Liquidaciones");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(126, "h2", 48);
    i0.ɵɵtext(127, "Historial de liquidaciones");
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(128, DashboardComponent_Conditional_17_Conditional_128_Template, 4, 0)(129, DashboardComponent_Conditional_17_Conditional_129_Template, 1, 3, "app-historial-liquidaciones", 49)(130, DashboardComponent_Conditional_17_Conditional_130_Template, 2, 0, "p", 50);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_19_0;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(8);
    i0.ɵɵtextInterpolate(ctx_r0.numero(ctx_r0.totalVisualizaciones()));
    i0.ɵɵadvance(10);
    i0.ɵɵtextInterpolate(ctx_r0.publicacionesActivas());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("de ", ctx_r0.publicaciones().length, " en total");
    i0.ɵɵadvance(8);
    i0.ɵɵtextInterpolate(ctx_r0.reservasValidas().length);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", ctx_r0.pendientes(), " pendientes o en curso");
    i0.ɵɵadvance(8);
    i0.ɵɵtextInterpolate(ctx_r0.moneda(ctx_r0.ingresos()));
    i0.ɵɵadvance(12);
    i0.ɵɵtextInterpolate(ctx_r0.moneda(ctx_r0.ingresos()));
    i0.ɵɵadvance(11);
    i0.ɵɵattribute("d", ctx_r0.areaPath());
    i0.ɵɵadvance();
    i0.ɵɵattribute("points", ctx_r0.linePoints());
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.serieMensual());
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r0.serieMensual());
    i0.ɵɵadvance(10);
    i0.ɵɵrepeater(ctx_r0.actividadSemanal());
    i0.ɵɵadvance(13);
    i0.ɵɵproperty("value", ctx_r0.busquedaRendimiento());
    i0.ɵɵadvance(12);
    i0.ɵɵrepeater(ctx_r0.rendimiento());
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r0.rendimientoFiltrado().length > 0 ? 104 : -1);
    i0.ɵɵadvance(8);
    i0.ɵɵstyleProp("--%NS%conversion", ctx_r0.conversion() + "%");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.porcentaje(ctx_r0.conversion()));
    i0.ɵɵadvance(5);
    i0.ɵɵconditional(!ctx_r0.totalVisualizaciones() ? 120 : -1);
    i0.ɵɵadvance(8);
    i0.ɵɵconditional(ctx_r0.errorPagos() ? 128 : (tmp_19_0 = ctx_r0.pagos()) ? 129 : 130, tmp_19_0);
} }
export class DashboardComponent {
    auth = inject(AuthService);
    publicacionesApi = inject(GestionPublicacionesService);
    reservasApi = inject(ReservationService);
    destroyRef = inject(DestroyRef);
    consultaReservas;
    publicaciones = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "publicaciones" }] : /* istanbul ignore next */ []));
    reservas = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reservas" }] : /* istanbul ignore next */ []));
    cargando = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cargando" }] : /* istanbul ignore next */ []));
    error = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    /** Historial de pagos de todas las publicaciones; null mientras carga. */
    pagos = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pagos" }] : /* istanbul ignore next */ []));
    errorPagos = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorPagos" }] : /* istanbul ignore next */ []));
    reservasValidas = computed(() => this.reservas().filter((reserva) => !reserva.cancelada), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reservasValidas" }] : /* istanbul ignore next */ []));
    totalVisualizaciones = computed(() => this.publicaciones().reduce((total, publicacion) => total + Number(publicacion.visualizaciones ?? 0), 0), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "totalVisualizaciones" }] : /* istanbul ignore next */ []));
    publicacionesActivas = computed(() => this.publicaciones().filter((item) => item.activa).length, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "publicacionesActivas" }] : /* istanbul ignore next */ []));
    ingresos = computed(() => this.reservasValidas().reduce((total, reserva) => total + Number(reserva.monto_pago ?? 0), 0), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ingresos" }] : /* istanbul ignore next */ []));
    pendientes = computed(() => this.reservasValidas().filter(estadiaActiva).length, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pendientes" }] : /* istanbul ignore next */ []));
    conversion = computed(() => {
        const vistas = this.totalVisualizaciones();
        return vistas ? Math.min(100, (this.reservasValidas().length / vistas) * 100) : 0;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "conversion" }] : /* istanbul ignore next */ []));
    serieMensual = computed(() => {
        const now = new Date();
        const months = Array.from({ length: 6 }, (_, index) => {
            const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
            return {
                key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
                label: new Intl.DateTimeFormat('es-AR', { month: 'short' }).format(date).replace('.', ''),
                ingresos: 0,
                reservas: 0,
            };
        });
        const byMonth = new Map(months.map((month) => [month.key, month]));
        for (const reserva of this.reservasValidas()) {
            if (!reserva.fecha_pago)
                continue;
            const month = byMonth.get(reserva.fecha_pago.slice(0, 7));
            if (!month)
                continue;
            month.reservas += 1;
            month.ingresos += Number(reserva.monto_pago ?? 0);
        }
        return months;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "serieMensual" }] : /* istanbul ignore next */ []));
    linePoints = computed(() => {
        const max = Math.max(...this.serieMensual().map((item) => item.ingresos), 1);
        return this.serieMensual()
            .map((item, index) => `${20 + index * 112},${190 - (item.ingresos / max) * 150}`)
            .join(' ');
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "linePoints" }] : /* istanbul ignore next */ []));
    areaPath = computed(() => `M20 190 L${this.linePoints().replaceAll(' ', ' L')} L580 190 Z`, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "areaPath" }] : /* istanbul ignore next */ []));
    actividadSemanal = computed(() => {
        const days = [
            { label: 'Lun', day: 1, value: 0 }, { label: 'Mar', day: 2, value: 0 },
            { label: 'Mié', day: 3, value: 0 }, { label: 'Jue', day: 4, value: 0 },
            { label: 'Vie', day: 5, value: 0 }, { label: 'Sáb', day: 6, value: 0 },
            { label: 'Dom', day: 0, value: 0 },
        ];
        for (const reserva of this.reservasValidas()) {
            const value = reserva.fecha_inicio ?? reserva.fecha_pago;
            if (!value)
                continue;
            const day = new Date(`${value.slice(0, 10)}T12:00:00`).getDay();
            const target = days.find((item) => item.day === day);
            if (target)
                target.value += 1;
        }
        return days;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "actividadSemanal" }] : /* istanbul ignore next */ []));
    maxActividad = computed(() => Math.max(...this.actividadSemanal().map((item) => item.value), 1), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "maxActividad" }] : /* istanbul ignore next */ []));
    rendimientoCompleto = computed(() => {
        const aggregates = new Map();
        for (const reserva of this.reservasValidas()) {
            const id = reserva.publicacion?.id;
            if (!id)
                continue;
            const current = aggregates.get(id) ?? { reservas: 0, ingresos: 0 };
            current.reservas += 1;
            current.ingresos += Number(reserva.monto_pago ?? 0);
            aggregates.set(id, current);
        }
        return this.publicaciones()
            .map((publicacion) => ({
            publicacion,
            visualizaciones: Number(publicacion.visualizaciones ?? 0),
            reservas: aggregates.get(publicacion.id)?.reservas ?? 0,
            ingresos: aggregates.get(publicacion.id)?.ingresos ?? 0,
        }))
            .sort((a, b) => b.visualizaciones - a.visualizaciones || b.reservas - a.reservas);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "rendimientoCompleto" }] : /* istanbul ignore next */ []));
    busquedaRendimiento = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busquedaRendimiento" }] : /* istanbul ignore next */ []));
    paginaRendimiento = signal(1, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "paginaRendimiento" }] : /* istanbul ignore next */ []));
    rendimientoFiltrado = computed(() => {
        const terminos = normalizarTexto(this.busquedaRendimiento()).trim().split(/\s+/).filter(Boolean);
        if (!terminos.length)
            return this.rendimientoCompleto();
        return this.rendimientoCompleto().filter(({ publicacion }) => {
            const texto = normalizarTexto(publicacion.titulo);
            return terminos.every((termino) => texto.includes(termino));
        });
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "rendimientoFiltrado" }] : /* istanbul ignore next */ []));
    paginasRendimiento = computed(() => Math.max(1, Math.ceil(this.rendimientoFiltrado().length / 5)), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "paginasRendimiento" }] : /* istanbul ignore next */ []));
    paginaRendimientoActual = computed(() => Math.min(this.paginaRendimiento(), this.paginasRendimiento()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "paginaRendimientoActual" }] : /* istanbul ignore next */ []));
    rendimiento = computed(() => {
        const pagina = this.paginaRendimientoActual();
        return this.rendimientoFiltrado().slice((pagina - 1) * 5, pagina * 5);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "rendimiento" }] : /* istanbul ignore next */ []));
    constructor() {
        activarActualizacionReservas(() => {
            if (this.cargando())
                return;
            this.consultaReservas?.unsubscribe();
            this.consultaReservas = this.reservasApi.received().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                next: (reservas) => this.reservas.set(reservas),
                error: () => { },
            });
        });
        const id = Number(this.auth.currentUser()?.sub);
        forkJoin({
            publicaciones: this.publicacionesApi.listarMias(id),
            reservas: this.reservasApi.received(),
        }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: ({ publicaciones, reservas }) => {
                this.publicaciones.set(publicaciones);
                this.reservas.set(reservas);
                this.cargando.set(false);
            },
            error: (error) => {
                this.error.set(error.message);
                this.cargando.set(false);
            },
        });
        this.cargarPagos();
    }
    /** Va aparte del resto del panel: si falla, el panel se sigue mostrando. */
    cargarPagos() {
        this.pagos.set(null);
        this.errorPagos.set(false);
        this.publicacionesApi.listarMisLiquidaciones().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (pagos) => this.pagos.set(pagos),
            error: () => this.errorPagos.set(true),
        });
    }
    moneda(value) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
        }).format(value);
    }
    numero(value) {
        return new Intl.NumberFormat('es-AR').format(value);
    }
    porcentaje(value) {
        return `${value.toLocaleString('es-AR', { maximumFractionDigits: 1 })}%`;
    }
    alturaBarra(value) {
        return value ? Math.max(14, (value / this.maxActividad()) * 100) : 8;
    }
    buscarRendimiento(texto) {
        this.busquedaRendimiento.set(texto);
        this.paginaRendimiento.set(1);
    }
    static ɵfac = function DashboardComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DashboardComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: DashboardComponent, selectors: [["app-dashboard"]], decls: 18, vars: 1, consts: [[1, "dashboard-page"], [1, "dashboard-wrap"], [1, "dashboard-heading"], [1, "dashboard-eyebrow"], [1, "dashboard-heading__actions"], ["routerLink", "/mis-publicaciones", 1, "acct-btn", "acct-btn--ghost"], ["routerLink", "/publicaciones/nueva", 1, "acct-btn", "acct-btn--primary"], [1, "dashboard-state"], ["role", "alert", 1, "acct-alert", "acct-alert--error"], [1, "kpi-grid"], [1, "kpi-card"], ["aria-hidden", "true", 1, "kpi-card__icon", "kpi-card__icon--orange"], ["aria-hidden", "true", 1, "kpi-card__icon", "kpi-card__icon--blue"], ["aria-hidden", "true", 1, "kpi-card__icon", "kpi-card__icon--green"], ["aria-hidden", "true", 1, "kpi-card__icon", "kpi-card__icon--yellow"], [1, "dashboard-grid", "dashboard-grid--main"], [1, "dashboard-card", "revenue-card"], [1, "card-heading"], ["role", "img", "aria-label", "Gr\u00E1fico de ingresos mensuales", 1, "chart"], ["viewBox", "0 0 600 220", "preserveAspectRatio", "none"], ["id", "dashboard-area", "x1", "0", "x2", "0", "y1", "0", "y2", "1"], ["offset", "0", "stop-color", "#d94217", "stop-opacity", ".22"], ["offset", "1", "stop-color", "#d94217", "stop-opacity", "0"], ["x1", "20", "y1", "40", "x2", "580", "y2", "40", 1, "chart__grid"], ["x1", "20", "y1", "90", "x2", "580", "y2", "90", 1, "chart__grid"], ["x1", "20", "y1", "140", "x2", "580", "y2", "140", 1, "chart__grid"], ["x1", "20", "y1", "190", "x2", "580", "y2", "190", 1, "chart__grid"], ["fill", "url(#dashboard-area)"], [1, "chart__line"], ["r", "5", 1, "chart__dot"], [1, "chart__labels"], [1, "dashboard-card", "activity-card"], ["aria-label", "Distribuci\u00F3n semanal de reservas", 1, "bars"], [1, "bar"], [1, "dashboard-grid", "dashboard-grid--bottom"], [1, "dashboard-card", "performance-card"], ["routerLink", "/mis-publicaciones"], [1, "performance-search"], ["placeholder", "Buscar por t\u00EDtulo", "ariaLabel", "Buscar publicaci\u00F3n", 3, "valueChange", "value"], [1, "performance-table"], [1, "performance-table__head"], [1, "performance-row"], [1, "performance-empty"], ["etiqueta", "publicaciones", "ariaLabel", "Paginaci\u00F3n de publicaciones del dashboard", 3, "pagina", "paginas", "total"], [1, "dashboard-card", "conversion-card"], [1, "conversion-ring"], [1, "conversion-card__hint"], ["aria-labelledby", "historial-liquidaciones", 1, "dashboard-card", "settlements-card"], ["id", "historial-liquidaciones"], ["vacio", "Todav\u00EDa no hay pagos registrados. Aparecen ac\u00E1 cuando Administraci\u00F3n registra la transferencia.", 3, "pagos", "mostrarPublicacion", "limite"], ["role", "status"], [1, "property-cell"], [3, "src", "alt"], [1, "property-cell__empty"], ["data-label", "Vistas"], ["data-label", "Reservas"], ["data-label", "Ingresos"], ["aria-label", "Ver publicaci\u00F3n", 3, "routerLink"], ["etiqueta", "publicaciones", "ariaLabel", "Paginaci\u00F3n de publicaciones del dashboard", 3, "paginaCambia", "pagina", "paginas", "total"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", "acct-btn--sm", 3, "click"]], template: function DashboardComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "div", 1)(2, "header", 2)(3, "div")(4, "span", 3);
            i0.ɵɵtext(5, "Panel del anunciante");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "h1");
            i0.ɵɵtext(7, "Resumen de tu actividad");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "p");
            i0.ɵɵtext(9, "Conoc\u00E9 el rendimiento de tus publicaciones y reservas.");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(10, "div", 4)(11, "a", 5);
            i0.ɵɵtext(12, "Administrar publicaciones");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(13, "a", 6);
            i0.ɵɵtext(14, "+ Nueva publicaci\u00F3n");
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(15, DashboardComponent_Conditional_15_Template, 4, 0, "div", 7)(16, DashboardComponent_Conditional_16_Template, 2, 1, "div", 8)(17, DashboardComponent_Conditional_17_Template, 131, 17);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(15);
            i0.ɵɵconditional(ctx.cargando() ? 15 : ctx.error() ? 16 : 17);
        } }, dependencies: [RouterLink, SpinnerComponent, PaginadorComponent, SearchFieldComponent, HistorialLiquidacionesComponent], styles: [".dashboard-page[_ngcontent-%COMP%] { min-height: calc(100dvh - 70px); padding: 2rem 1rem 4rem; background: var(--%NS%color-bg); }\r\n.dashboard-wrap[_ngcontent-%COMP%] { max-width: var(--%NS%max-width-page); margin: 0 auto; display: grid; gap: 1.25rem; }\r\n.dashboard-heading[_ngcontent-%COMP%] { display: flex; align-items: flex-end; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap; }\r\n.dashboard-heading[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] { margin: 0.15rem 0 0; font-size: clamp(1.65rem, 3vw, 2.35rem); letter-spacing: -.035em; }\r\n.dashboard-heading[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: .35rem 0 0; color: var(--%NS%color-text-muted); }\r\n.dashboard-eyebrow[_ngcontent-%COMP%] { color: var(--%NS%color-primary); font-size: .75rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }\r\n.dashboard-heading__actions[_ngcontent-%COMP%] { display: flex; gap: .65rem; flex-wrap: wrap; }\r\n.dashboard-state[_ngcontent-%COMP%] { min-height: 320px; display: grid; place-content: center; justify-items: center; color: var(--%NS%color-text-muted); }\r\n\r\n.kpi-grid[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; }\r\n.kpi-card[_ngcontent-%COMP%], .dashboard-card[_ngcontent-%COMP%] { background: #fff; border: 1px solid var(--%NS%color-border); border-radius: var(--%NS%radius-md); box-shadow: var(--%NS%shadow-card); }\r\n.kpi-card[_ngcontent-%COMP%] { min-width: 0; padding: 1.1rem; display: flex; align-items: flex-start; gap: .85rem; }\r\n.kpi-card__icon[_ngcontent-%COMP%] { flex: 0 0 42px; height: 42px; display: grid; place-items: center; border-radius: 12px; font-size: 1.2rem; font-weight: 900; }\r\n.kpi-card__icon--orange[_ngcontent-%COMP%] { background: var(--%NS%color-primary-light); color: var(--%NS%color-primary); }\r\n.kpi-card__icon--blue[_ngcontent-%COMP%] { background: var(--%NS%color-secondary-light); color: var(--%NS%color-secondary); }\r\n.kpi-card__icon--green[_ngcontent-%COMP%] { background: #dcfce7; color: #15803d; }\r\n.kpi-card__icon--yellow[_ngcontent-%COMP%] { background: #fff4d6; color: #b45309; }\r\n.kpi-card[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] { min-width: 0; }\r\n.kpi-card[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { display: block; color: var(--%NS%color-text-muted); font-weight: 700; }\r\n.kpi-card[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { display: block; margin-top: .25rem; overflow: hidden; font-size: clamp(1.35rem, 2.3vw, 1.85rem); letter-spacing: -.03em; text-overflow: ellipsis; }\r\n.kpi-card[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: .2rem 0 0; color: var(--%NS%color-text-muted); font-size: .77rem; }\r\n\r\n.dashboard-grid[_ngcontent-%COMP%] { display: grid; gap: 1rem; }\r\n.dashboard-grid--main[_ngcontent-%COMP%] { grid-template-columns: minmax(0, 2fr) minmax(250px, .85fr); }\r\n.dashboard-grid--bottom[_ngcontent-%COMP%] { grid-template-columns: minmax(0, 2fr) minmax(270px, .85fr); }\r\n.dashboard-card[_ngcontent-%COMP%] { padding: 1.25rem; min-width: 0; }\r\n.settlements-card[_ngcontent-%COMP%] { display: grid; gap: .75rem; }\r\n.card-heading[_ngcontent-%COMP%] { min-height: 45px; display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }\r\n.card-heading[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); font-size: .72rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }\r\n.card-heading[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: .2rem 0 0; font-size: 1rem; }\r\n.card-heading[_ngcontent-%COMP%]    > strong[_ngcontent-%COMP%] { font-size: 1.05rem; color: var(--%NS%color-primary); }\r\n.card-heading[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] { color: var(--%NS%color-primary); font-size: .82rem; font-weight: 800; text-decoration: none; white-space: nowrap; }\r\n\r\n.chart[_ngcontent-%COMP%] { margin-top: .85rem; }\r\n.chart[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { display: block; width: 100%; height: 225px; overflow: visible; }\r\n.chart__grid[_ngcontent-%COMP%] { stroke: #e8eaee; stroke-width: 1; stroke-dasharray: 4 5; }\r\n.chart__line[_ngcontent-%COMP%] { fill: none; stroke: var(--%NS%color-primary); stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }\r\n.chart__dot[_ngcontent-%COMP%] { fill: #fff; stroke: var(--%NS%color-primary); stroke-width: 3; vector-effect: non-scaling-stroke; }\r\n.chart__labels[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(6, 1fr); margin: -.1rem .25rem 0; text-align: center; }\r\n.chart__labels[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%], .chart__labels[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { display: block; }\r\n.chart__labels[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { font-size: .75rem; text-transform: capitalize; }\r\n.chart__labels[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { margin-top: .15rem; color: var(--%NS%color-text-muted); font-size: .66rem; }\r\n\r\n.activity-card[_ngcontent-%COMP%] { display: flex; flex-direction: column; }\r\n.bars[_ngcontent-%COMP%] { flex: 1; min-height: 245px; display: grid; grid-template-columns: repeat(7, 1fr); align-items: end; gap: .45rem; padding-top: 1.25rem; }\r\n.bar[_ngcontent-%COMP%] { height: 100%; display: grid; grid-template-rows: 20px 1fr 20px; align-items: end; justify-items: center; gap: .4rem; }\r\n.bar[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { font-size: .72rem; }\r\n.bar[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] { width: 100%; height: 100%; display: flex; align-items: end; overflow: hidden; border-radius: 999px; background: #f1f2f4; }\r\n.bar[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] { display: block; width: 100%; min-height: 8%; border-radius: 999px; background: linear-gradient(180deg, var(--%NS%color-secondary), #3478db); transition: height .4s ease; }\r\n.bar[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); font-size: .68rem; }\r\n\r\n.performance-search[_ngcontent-%COMP%] { margin-top: .75rem; }\r\n.performance-table[_ngcontent-%COMP%] { margin-top: .75rem; }\r\n.performance-table__head[_ngcontent-%COMP%], .performance-row[_ngcontent-%COMP%] { display: grid; grid-template-columns: minmax(220px, 1.6fr) .55fr .55fr .8fr 30px; gap: .75rem; align-items: center; }\r\n.performance-table__head[_ngcontent-%COMP%] { padding: .55rem .65rem; color: var(--%NS%color-text-muted); font-size: .68rem; font-weight: 800; text-transform: uppercase; }\r\n.performance-row[_ngcontent-%COMP%] { min-height: 68px; padding: .6rem .65rem; border-top: 1px solid var(--%NS%color-border); font-size: .85rem; }\r\n.property-cell[_ngcontent-%COMP%] { min-width: 0; display: flex; align-items: center; gap: .7rem; }\r\n.property-cell[_ngcontent-%COMP%]   img[_ngcontent-%COMP%], .property-cell__empty[_ngcontent-%COMP%] { flex: 0 0 52px; width: 52px; height: 42px; border-radius: 8px; object-fit: cover; }\r\n.property-cell__empty[_ngcontent-%COMP%] { display: grid; place-items: center; background: var(--%NS%color-bg); color: var(--%NS%color-text-muted); }\r\n.property-cell[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] { min-width: 0; }\r\n.property-cell[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%], .property-cell[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { display: block; }\r\n.property-cell[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\r\n.property-cell[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { margin-top: .15rem; color: var(--%NS%color-success); font-size: .7rem; }\r\n.performance-row[_ngcontent-%COMP%]    > a[_ngcontent-%COMP%] { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: var(--%NS%color-primary-light); color: var(--%NS%color-primary); font-weight: 900; text-decoration: none; }\r\n.performance-empty[_ngcontent-%COMP%] { padding: 2.5rem 1rem; border-top: 1px solid var(--%NS%color-border); color: var(--%NS%color-text-muted); text-align: center; }\r\n\r\n.conversion-card[_ngcontent-%COMP%] { display: flex; flex-direction: column; align-items: center; text-align: center; }\r\n.conversion-card[_ngcontent-%COMP%]   .card-heading[_ngcontent-%COMP%] { width: 100%; text-align: left; }\r\n.conversion-ring[_ngcontent-%COMP%] { --%NS%conversion: 0%; position: relative; width: 178px; aspect-ratio: 1; margin: 1.25rem auto; display: grid; place-items: center; border-radius: 50%; background: conic-gradient(var(--%NS%color-primary) var(--%NS%conversion), #eceef1 0); }\r\n.conversion-ring[_ngcontent-%COMP%]::before { content: ''; position: absolute; inset: 18px; border-radius: 50%; background: #fff; }\r\n.conversion-ring[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] { position: relative; z-index: 1; }\r\n.conversion-ring[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%], .conversion-ring[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { display: block; }\r\n.conversion-ring[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { font-size: 2rem; letter-spacing: -.04em; }\r\n.conversion-ring[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); }\r\n.conversion-card[_ngcontent-%COMP%]    > p[_ngcontent-%COMP%] { margin: 0; color: var(--%NS%color-text-muted); font-size: .85rem; line-height: 1.5; }\r\n.conversion-card__hint[_ngcontent-%COMP%] { display: block; margin-top: .75rem; color: #b45309; }\r\n\r\n@media (max-width: 960px) {\r\n  .kpi-grid[_ngcontent-%COMP%] { grid-template-columns: repeat(2, minmax(0, 1fr)); }\r\n  .dashboard-grid--main[_ngcontent-%COMP%], .dashboard-grid--bottom[_ngcontent-%COMP%] { grid-template-columns: 1fr; }\r\n  .activity-card[_ngcontent-%COMP%] { min-height: 330px; }\r\n}\r\n@media (max-width: 640px) {\r\n  .dashboard-page[_ngcontent-%COMP%] { padding: 1.25rem .75rem 3rem; }\r\n  .dashboard-heading[_ngcontent-%COMP%], .dashboard-heading__actions[_ngcontent-%COMP%] { align-items: stretch; }\r\n  .dashboard-heading__actions[_ngcontent-%COMP%], .dashboard-heading__actions[_ngcontent-%COMP%]    > *[_ngcontent-%COMP%] { width: 100%; }\r\n  .kpi-grid[_ngcontent-%COMP%] { grid-template-columns: 1fr; }\r\n  .dashboard-card[_ngcontent-%COMP%] { padding: 1rem; }\r\n  .performance-table__head[_ngcontent-%COMP%] { display: none; }\r\n  .performance-row[_ngcontent-%COMP%] { grid-template-columns: 1fr auto; gap: .55rem; padding: .85rem 0; }\r\n  .property-cell[_ngcontent-%COMP%] { grid-column: 1 / -1; }\r\n  .performance-row[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%], .performance-row[_ngcontent-%COMP%]    > strong[_ngcontent-%COMP%] { font-size: .78rem; }\r\n  .performance-row[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%]::before, .performance-row[_ngcontent-%COMP%]    > strong[_ngcontent-%COMP%]::before { content: attr(data-label) ': '; color: var(--%NS%color-text-muted); font-weight: 500; }\r\n  .performance-row[_ngcontent-%COMP%]    > a[_ngcontent-%COMP%] { grid-column: 2; grid-row: 2 / span 2; }\r\n  .chart[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { height: 190px; }\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DashboardComponent, [{
        type: Component,
        args: [{ selector: 'app-dashboard', standalone: true, imports: [RouterLink, SpinnerComponent, PaginadorComponent, SearchFieldComponent, HistorialLiquidacionesComponent], template: "<section class=\"dashboard-page\">\r\n  <div class=\"dashboard-wrap\">\r\n    <header class=\"dashboard-heading\">\r\n      <div>\r\n        <span class=\"dashboard-eyebrow\">Panel del anunciante</span>\r\n        <h1>Resumen de tu actividad</h1>\r\n        <p>Conoc\u00E9 el rendimiento de tus publicaciones y reservas.</p>\r\n      </div>\r\n      <div class=\"dashboard-heading__actions\">\r\n        <a routerLink=\"/mis-publicaciones\" class=\"acct-btn acct-btn--ghost\">Administrar publicaciones</a>\r\n        <a routerLink=\"/publicaciones/nueva\" class=\"acct-btn acct-btn--primary\">+ Nueva publicaci\u00F3n</a>\r\n      </div>\r\n    </header>\r\n\r\n    @if (cargando()) {\r\n      <div class=\"dashboard-state\"><app-spinner /><p>Preparando tus m\u00E9tricas\u2026</p></div>\r\n    } @else if (error()) {\r\n      <div class=\"acct-alert acct-alert--error\" role=\"alert\">{{ error() }}</div>\r\n    } @else {\r\n      <div class=\"kpi-grid\">\r\n        <article class=\"kpi-card\">\r\n          <span class=\"kpi-card__icon kpi-card__icon--orange\" aria-hidden=\"true\">\u25C9</span>\r\n          <div><small>Visualizaciones</small><strong>{{ numero(totalVisualizaciones()) }}</strong><p>Aperturas de tus publicaciones</p></div>\r\n        </article>\r\n        <article class=\"kpi-card\">\r\n          <span class=\"kpi-card__icon kpi-card__icon--blue\" aria-hidden=\"true\">\u2302</span>\r\n          <div><small>Publicaciones activas</small><strong>{{ publicacionesActivas() }}</strong><p>de {{ publicaciones().length }} en total</p></div>\r\n        </article>\r\n        <article class=\"kpi-card\">\r\n          <span class=\"kpi-card__icon kpi-card__icon--green\" aria-hidden=\"true\">\u2713</span>\r\n          <div><small>Reservas recibidas</small><strong>{{ reservasValidas().length }}</strong><p>{{ pendientes() }} pendientes o en curso</p></div>\r\n        </article>\r\n        <article class=\"kpi-card\">\r\n          <span class=\"kpi-card__icon kpi-card__icon--yellow\" aria-hidden=\"true\">$</span>\r\n          <div><small>Ingresos por reservas</small><strong>{{ moneda(ingresos()) }}</strong><p>Sin contar cancelaciones</p></div>\r\n        </article>\r\n      </div>\r\n\r\n      <div class=\"dashboard-grid dashboard-grid--main\">\r\n        <article class=\"dashboard-card revenue-card\">\r\n          <div class=\"card-heading\">\r\n            <div><span>Evoluci\u00F3n</span><h2>Ingresos de los \u00FAltimos 6 meses</h2></div>\r\n            <strong>{{ moneda(ingresos()) }}</strong>\r\n          </div>\r\n          <div class=\"chart\" role=\"img\" aria-label=\"Gr\u00E1fico de ingresos mensuales\">\r\n            <svg viewBox=\"0 0 600 220\" preserveAspectRatio=\"none\">\r\n              <defs>\r\n                <linearGradient id=\"dashboard-area\" x1=\"0\" x2=\"0\" y1=\"0\" y2=\"1\">\r\n                  <stop offset=\"0\" stop-color=\"#d94217\" stop-opacity=\".22\" />\r\n                  <stop offset=\"1\" stop-color=\"#d94217\" stop-opacity=\"0\" />\r\n                </linearGradient>\r\n              </defs>\r\n              <line x1=\"20\" y1=\"40\" x2=\"580\" y2=\"40\" class=\"chart__grid\" />\r\n              <line x1=\"20\" y1=\"90\" x2=\"580\" y2=\"90\" class=\"chart__grid\" />\r\n              <line x1=\"20\" y1=\"140\" x2=\"580\" y2=\"140\" class=\"chart__grid\" />\r\n              <line x1=\"20\" y1=\"190\" x2=\"580\" y2=\"190\" class=\"chart__grid\" />\r\n              <path [attr.d]=\"areaPath()\" fill=\"url(#dashboard-area)\" />\r\n              <polyline [attr.points]=\"linePoints()\" class=\"chart__line\" />\r\n              @for (month of serieMensual(); track month.key; let index = $index) {\r\n                <circle [attr.cx]=\"20 + index * 112\" [attr.cy]=\"linePoints().split(' ')[index].split(',')[1]\" r=\"5\" class=\"chart__dot\"><title>{{ month.label }}: {{ moneda(month.ingresos) }}</title></circle>\r\n              }\r\n            </svg>\r\n            <div class=\"chart__labels\">\r\n              @for (month of serieMensual(); track month.key) {\r\n                <span><strong>{{ month.label }}</strong><small>{{ month.reservas }} res.</small></span>\r\n              }\r\n            </div>\r\n          </div>\r\n        </article>\r\n\r\n        <article class=\"dashboard-card activity-card\">\r\n          <div class=\"card-heading\"><div><span>Actividad</span><h2>Reservas por d\u00EDa</h2></div></div>\r\n          <div class=\"bars\" aria-label=\"Distribuci\u00F3n semanal de reservas\">\r\n            @for (day of actividadSemanal(); track day.day) {\r\n              <div class=\"bar\">\r\n                <strong>{{ day.value }}</strong>\r\n                <span><i [style.height.%]=\"alturaBarra(day.value)\"></i></span>\r\n                <small>{{ day.label }}</small>\r\n              </div>\r\n            }\r\n          </div>\r\n        </article>\r\n      </div>\r\n\r\n      <div class=\"dashboard-grid dashboard-grid--bottom\">\r\n        <article class=\"dashboard-card performance-card\">\r\n          <div class=\"card-heading\">\r\n            <div><span>Rendimiento</span><h2>Rendimiento por publicaci\u00F3n</h2></div>\r\n            <a routerLink=\"/mis-publicaciones\">Ver todas \u2192</a>\r\n          </div>\r\n          <div class=\"performance-search\">\r\n            <app-search-field\r\n              [value]=\"busquedaRendimiento()\"\r\n              placeholder=\"Buscar por t\u00EDtulo\"\r\n              ariaLabel=\"Buscar publicaci\u00F3n\"\r\n              (valueChange)=\"buscarRendimiento($event)\"\r\n            />\r\n          </div>\r\n          <div class=\"performance-table\">\r\n            <div class=\"performance-table__head\"><span>Publicaci\u00F3n</span><span>Vistas</span><span>Reservas</span><span>Ingresos</span><span></span></div>\r\n            @for (item of rendimiento(); track item.publicacion.id) {\r\n              <div class=\"performance-row\">\r\n                <div class=\"property-cell\">\r\n                  @if (item.publicacion.imagenes?.[0]?.url; as image) { <img [src]=\"image\" [alt]=\"item.publicacion.titulo\" /> }\r\n                  @else { <span class=\"property-cell__empty\">\u2302</span> }\r\n                  <div><strong>{{ item.publicacion.titulo }}</strong><small>{{ item.publicacion.activa ? 'Activa' : 'Inactiva' }}</small></div>\r\n                </div>\r\n                <span data-label=\"Vistas\">{{ numero(item.visualizaciones) }}</span>\r\n                <span data-label=\"Reservas\">{{ item.reservas }}</span>\r\n                <strong data-label=\"Ingresos\">{{ moneda(item.ingresos) }}</strong>\r\n                <a [routerLink]=\"['/publicaciones', item.publicacion.id]\" aria-label=\"Ver publicaci\u00F3n\">\u2197</a>\r\n              </div>\r\n            } @empty {\r\n              <div class=\"performance-empty\">{{ busquedaRendimiento().trim() ? 'No encontramos publicaciones para esa b\u00FAsqueda.' : 'Todav\u00EDa no hay publicaciones para analizar.' }}</div>\r\n            }\r\n          </div>\r\n          @if (rendimientoFiltrado().length > 0) {\r\n            <app-paginador\r\n              [pagina]=\"paginaRendimientoActual()\"\r\n              [paginas]=\"paginasRendimiento()\"\r\n              [total]=\"rendimientoFiltrado().length\"\r\n              etiqueta=\"publicaciones\"\r\n              ariaLabel=\"Paginaci\u00F3n de publicaciones del dashboard\"\r\n              (paginaCambia)=\"paginaRendimiento.set($event)\"\r\n            />\r\n          }\r\n        </article>\r\n\r\n        <article class=\"dashboard-card conversion-card\">\r\n          <div class=\"card-heading\"><div><span>Conversi\u00F3n</span><h2>Vistas que reservan</h2></div></div>\r\n          <div class=\"conversion-ring\" [style.--conversion]=\"conversion() + '%'\">\r\n            <div><strong>{{ porcentaje(conversion()) }}</strong><small>conversi\u00F3n</small></div>\r\n          </div>\r\n          <p>Relaci\u00F3n entre las visualizaciones registradas y las reservas confirmadas.</p>\r\n          @if (!totalVisualizaciones()) {\r\n            <small class=\"conversion-card__hint\">La m\u00E9trica comenzar\u00E1 a calcularse cuando tus anuncios reciban visitas.</small>\r\n          }\r\n        </article>\r\n      </div>\r\n\r\n      <article class=\"dashboard-card settlements-card\" aria-labelledby=\"historial-liquidaciones\">\r\n        <div class=\"card-heading\">\r\n          <div><span>Liquidaciones</span><h2 id=\"historial-liquidaciones\">Historial de liquidaciones</h2></div>\r\n        </div>\r\n        @if (errorPagos()) {\r\n          <p class=\"acct-alert acct-alert--error\" role=\"alert\">No pudimos cargar el historial de liquidaciones.</p>\r\n          <button type=\"button\" class=\"acct-btn acct-btn--ghost acct-btn--sm\" (click)=\"cargarPagos()\">Reintentar</button>\r\n        } @else if (pagos(); as lista) {\r\n          <app-historial-liquidaciones [pagos]=\"lista\" [mostrarPublicacion]=\"true\" [limite]=\"5\"\r\n            vacio=\"Todav\u00EDa no hay pagos registrados. Aparecen ac\u00E1 cuando Administraci\u00F3n registra la transferencia.\" />\r\n        } @else {\r\n          <p role=\"status\">Cargando liquidaciones\u2026</p>\r\n        }\r\n      </article>\r\n    }\r\n  </div>\r\n</section>\r\n", styles: [".dashboard-page { min-height: calc(100dvh - 70px); padding: 2rem 1rem 4rem; background: var(--color-bg); }\r\n.dashboard-wrap { max-width: var(--max-width-page); margin: 0 auto; display: grid; gap: 1.25rem; }\r\n.dashboard-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap; }\r\n.dashboard-heading h1 { margin: 0.15rem 0 0; font-size: clamp(1.65rem, 3vw, 2.35rem); letter-spacing: -.035em; }\r\n.dashboard-heading p { margin: .35rem 0 0; color: var(--color-text-muted); }\r\n.dashboard-eyebrow { color: var(--color-primary); font-size: .75rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }\r\n.dashboard-heading__actions { display: flex; gap: .65rem; flex-wrap: wrap; }\r\n.dashboard-state { min-height: 320px; display: grid; place-content: center; justify-items: center; color: var(--color-text-muted); }\r\n\r\n.kpi-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; }\r\n.kpi-card, .dashboard-card { background: #fff; border: 1px solid var(--color-border); border-radius: var(--radius-md); box-shadow: var(--shadow-card); }\r\n.kpi-card { min-width: 0; padding: 1.1rem; display: flex; align-items: flex-start; gap: .85rem; }\r\n.kpi-card__icon { flex: 0 0 42px; height: 42px; display: grid; place-items: center; border-radius: 12px; font-size: 1.2rem; font-weight: 900; }\r\n.kpi-card__icon--orange { background: var(--color-primary-light); color: var(--color-primary); }\r\n.kpi-card__icon--blue { background: var(--color-secondary-light); color: var(--color-secondary); }\r\n.kpi-card__icon--green { background: #dcfce7; color: #15803d; }\r\n.kpi-card__icon--yellow { background: #fff4d6; color: #b45309; }\r\n.kpi-card div { min-width: 0; }\r\n.kpi-card small { display: block; color: var(--color-text-muted); font-weight: 700; }\r\n.kpi-card strong { display: block; margin-top: .25rem; overflow: hidden; font-size: clamp(1.35rem, 2.3vw, 1.85rem); letter-spacing: -.03em; text-overflow: ellipsis; }\r\n.kpi-card p { margin: .2rem 0 0; color: var(--color-text-muted); font-size: .77rem; }\r\n\r\n.dashboard-grid { display: grid; gap: 1rem; }\r\n.dashboard-grid--main { grid-template-columns: minmax(0, 2fr) minmax(250px, .85fr); }\r\n.dashboard-grid--bottom { grid-template-columns: minmax(0, 2fr) minmax(270px, .85fr); }\r\n.dashboard-card { padding: 1.25rem; min-width: 0; }\r\n.settlements-card { display: grid; gap: .75rem; }\r\n.card-heading { min-height: 45px; display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }\r\n.card-heading span { color: var(--color-text-muted); font-size: .72rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }\r\n.card-heading h2 { margin: .2rem 0 0; font-size: 1rem; }\r\n.card-heading > strong { font-size: 1.05rem; color: var(--color-primary); }\r\n.card-heading a { color: var(--color-primary); font-size: .82rem; font-weight: 800; text-decoration: none; white-space: nowrap; }\r\n\r\n.chart { margin-top: .85rem; }\r\n.chart svg { display: block; width: 100%; height: 225px; overflow: visible; }\r\n.chart__grid { stroke: #e8eaee; stroke-width: 1; stroke-dasharray: 4 5; }\r\n.chart__line { fill: none; stroke: var(--color-primary); stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }\r\n.chart__dot { fill: #fff; stroke: var(--color-primary); stroke-width: 3; vector-effect: non-scaling-stroke; }\r\n.chart__labels { display: grid; grid-template-columns: repeat(6, 1fr); margin: -.1rem .25rem 0; text-align: center; }\r\n.chart__labels strong, .chart__labels small { display: block; }\r\n.chart__labels strong { font-size: .75rem; text-transform: capitalize; }\r\n.chart__labels small { margin-top: .15rem; color: var(--color-text-muted); font-size: .66rem; }\r\n\r\n.activity-card { display: flex; flex-direction: column; }\r\n.bars { flex: 1; min-height: 245px; display: grid; grid-template-columns: repeat(7, 1fr); align-items: end; gap: .45rem; padding-top: 1.25rem; }\r\n.bar { height: 100%; display: grid; grid-template-rows: 20px 1fr 20px; align-items: end; justify-items: center; gap: .4rem; }\r\n.bar strong { font-size: .72rem; }\r\n.bar > span { width: 100%; height: 100%; display: flex; align-items: end; overflow: hidden; border-radius: 999px; background: #f1f2f4; }\r\n.bar i { display: block; width: 100%; min-height: 8%; border-radius: 999px; background: linear-gradient(180deg, var(--color-secondary), #3478db); transition: height .4s ease; }\r\n.bar small { color: var(--color-text-muted); font-size: .68rem; }\r\n\r\n.performance-search { margin-top: .75rem; }\r\n.performance-table { margin-top: .75rem; }\r\n.performance-table__head, .performance-row { display: grid; grid-template-columns: minmax(220px, 1.6fr) .55fr .55fr .8fr 30px; gap: .75rem; align-items: center; }\r\n.performance-table__head { padding: .55rem .65rem; color: var(--color-text-muted); font-size: .68rem; font-weight: 800; text-transform: uppercase; }\r\n.performance-row { min-height: 68px; padding: .6rem .65rem; border-top: 1px solid var(--color-border); font-size: .85rem; }\r\n.property-cell { min-width: 0; display: flex; align-items: center; gap: .7rem; }\r\n.property-cell img, .property-cell__empty { flex: 0 0 52px; width: 52px; height: 42px; border-radius: 8px; object-fit: cover; }\r\n.property-cell__empty { display: grid; place-items: center; background: var(--color-bg); color: var(--color-text-muted); }\r\n.property-cell div { min-width: 0; }\r\n.property-cell strong, .property-cell small { display: block; }\r\n.property-cell strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\r\n.property-cell small { margin-top: .15rem; color: var(--color-success); font-size: .7rem; }\r\n.performance-row > a { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: var(--color-primary-light); color: var(--color-primary); font-weight: 900; text-decoration: none; }\r\n.performance-empty { padding: 2.5rem 1rem; border-top: 1px solid var(--color-border); color: var(--color-text-muted); text-align: center; }\r\n\r\n.conversion-card { display: flex; flex-direction: column; align-items: center; text-align: center; }\r\n.conversion-card .card-heading { width: 100%; text-align: left; }\r\n.conversion-ring { --conversion: 0%; position: relative; width: 178px; aspect-ratio: 1; margin: 1.25rem auto; display: grid; place-items: center; border-radius: 50%; background: conic-gradient(var(--color-primary) var(--conversion), #eceef1 0); }\r\n.conversion-ring::before { content: ''; position: absolute; inset: 18px; border-radius: 50%; background: #fff; }\r\n.conversion-ring div { position: relative; z-index: 1; }\r\n.conversion-ring strong, .conversion-ring small { display: block; }\r\n.conversion-ring strong { font-size: 2rem; letter-spacing: -.04em; }\r\n.conversion-ring small { color: var(--color-text-muted); }\r\n.conversion-card > p { margin: 0; color: var(--color-text-muted); font-size: .85rem; line-height: 1.5; }\r\n.conversion-card__hint { display: block; margin-top: .75rem; color: #b45309; }\r\n\r\n@media (max-width: 960px) {\r\n  .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }\r\n  .dashboard-grid--main, .dashboard-grid--bottom { grid-template-columns: 1fr; }\r\n  .activity-card { min-height: 330px; }\r\n}\r\n@media (max-width: 640px) {\r\n  .dashboard-page { padding: 1.25rem .75rem 3rem; }\r\n  .dashboard-heading, .dashboard-heading__actions { align-items: stretch; }\r\n  .dashboard-heading__actions, .dashboard-heading__actions > * { width: 100%; }\r\n  .kpi-grid { grid-template-columns: 1fr; }\r\n  .dashboard-card { padding: 1rem; }\r\n  .performance-table__head { display: none; }\r\n  .performance-row { grid-template-columns: 1fr auto; gap: .55rem; padding: .85rem 0; }\r\n  .property-cell { grid-column: 1 / -1; }\r\n  .performance-row > span, .performance-row > strong { font-size: .78rem; }\r\n  .performance-row > span::before, .performance-row > strong::before { content: attr(data-label) ': '; color: var(--color-text-muted); font-weight: 500; }\r\n  .performance-row > a { grid-column: 2; grid-row: 2 / span 2; }\r\n  .chart svg { height: 190px; }\r\n}\r\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(DashboardComponent, { className: "DashboardComponent", filePath: "src/app/features/dashboard/dashboard.component.ts", lineNumber: 39 }); })();
