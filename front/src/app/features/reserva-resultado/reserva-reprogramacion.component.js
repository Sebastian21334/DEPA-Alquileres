import { Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { AvailabilityCalendarComponent } from '../../shared/components/availability-calendar/availability-calendar.component';
import { ReservationService } from '../../shared/services/reservation.service';
import { DIAS_MINIMOS_REPROGRAMACION, fechaHoyArgentina, isRentalRangeAvailable, rentalDays, sumarDias, } from '../../shared/utils/rental-dates';
import { activarActualizacionReservas } from '../../shared/utils/reservation-refresh';
import * as i0 from "@angular/core";
function ReservaReprogramacionComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 2);
    i0.ɵɵtext(1);
    i0.ɵɵelementStart(2, "button", 16);
    i0.ɵɵlistener("click", function ReservaReprogramacionComponent_Conditional_5_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.consultar()); });
    i0.ɵɵtext(3, "Reintentar");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.errorDisponibilidad(), " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.consultando());
} }
function ReservaReprogramacionComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 3);
    i0.ɵɵelement(1, "span", 17);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("Disponibilidad actualizada a las ", ctx);
} }
function ReservaReprogramacionComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 4);
    i0.ɵɵtext(1, "Consultando disponibilidad\u2026");
    i0.ɵɵelementEnd();
} }
function ReservaReprogramacionComponent_Conditional_39_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 12);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.errorCambio());
} }
function ReservaReprogramacionComponent_Conditional_40_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 12);
    i0.ɵɵtext(1, "Ese per\u00EDodo ya no est\u00E1 disponible. Eleg\u00ED otro ingreso.");
    i0.ɵɵelementEnd();
} }
export class ReservaReprogramacionComponent {
    api = inject(ReservationService);
    destroyRef = inject(DestroyRef);
    reserva = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reserva" }] : /* istanbul ignore next */ []));
    cancelar = output();
    guardada = output();
    dias = computed(() => rentalDays(this.reserva().fecha_inicio, this.reserva().fecha_fin), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "dias" }] : /* istanbul ignore next */ []));
    fechas = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "fechas" }] : /* istanbul ignore next */ []));
    seleccion = signal({ start: null, end: null }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "seleccion" }] : /* istanbul ignore next */ []));
    consultando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "consultando" }] : /* istanbul ignore next */ []));
    actualizado = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "actualizado" }] : /* istanbul ignore next */ []));
    errorDisponibilidad = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorDisponibilidad" }] : /* istanbul ignore next */ []));
    guardando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "guardando" }] : /* istanbul ignore next */ []));
    formatoFecha = new Intl.DateTimeFormat('es-AR', { dateStyle: 'long', timeZone: 'UTC' });
    horaActualizada = computed(() => this.actualizado()?.toLocaleTimeString('es-AR'), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "horaActualizada" }] : /* istanbul ignore next */ []));
    total = computed(() => {
        const reserva = this.reserva();
        return Number(reserva.importe_contratado ?? reserva.monto_pago).toLocaleString('es-AR', {
            style: 'currency', currency: reserva.moneda_contratada ?? 'ARS',
        });
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "total" }] : /* istanbul ignore next */ []));
    errorCambio = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorCambio" }] : /* istanbul ignore next */ []));
    rangoDisponible = computed(() => {
        const { start, end } = this.seleccion();
        return !!start && !!end && start !== this.reserva().fecha_inicio &&
            isRentalRangeAvailable(start, end, this.fechas());
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "rangoDisponible" }] : /* istanbul ignore next */ []));
    constructor() {
        activarActualizacionReservas(() => this.consultar(), 15_000);
    }
    ngOnInit() {
        this.consultar();
    }
    consultar() {
        if (this.consultando() || this.guardando())
            return;
        this.consultando.set(true);
        this.api.rescheduleAvailability(this.reserva().id).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.consultando.set(false))).subscribe({
            next: (fechas) => {
                this.fechas.set(fechas);
                this.errorDisponibilidad.set('');
                this.actualizado.set(new Date());
            },
            error: (error) => {
                this.errorDisponibilidad.set(error.message || 'No pudimos consultar las fechas disponibles.');
            },
        });
    }
    fecha(valor) {
        return valor ? this.formatoFecha.format(new Date(valor)) : '';
    }
    fechaMinima() {
        return sumarDias(fechaHoyArgentina(), DIAS_MINIMOS_REPROGRAMACION);
    }
    elegir(rango) {
        this.errorCambio.set('');
        this.seleccion.set(rango);
    }
    confirmar() {
        const { start, end } = this.seleccion();
        if (!start || !end || !this.rangoDisponible() || this.consultando() ||
            this.errorDisponibilidad() || this.guardando())
            return;
        this.errorCambio.set('');
        this.guardando.set(true);
        this.api.reschedule(this.reserva().id, start, end).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.guardando.set(false))).subscribe({
            next: (reserva) => this.guardada.emit(reserva),
            error: (error) => {
                this.errorCambio.set(error.message);
                if (error.status === 409) {
                    this.guardando.set(false);
                    this.consultar();
                }
            },
        });
    }
    static ɵfac = function ReservaReprogramacionComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ReservaReprogramacionComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ReservaReprogramacionComponent, selectors: [["app-reserva-reprogramacion"]], inputs: { reserva: [1, "reserva"] }, outputs: { cancelar: "cancelar", guardada: "guardada" }, decls: 46, vars: 20, consts: [["aria-labelledby", "reschedule-title", 1, "reschedule"], ["id", "reschedule-title"], ["role", "alert", 1, "availability"], [1, "availability"], ["role", "status", 1, "availability"], [1, "reschedule__grid"], ["mode", "reschedule", 3, "rangeChange", "dates", "fixedDays", "currentStart", "minStart", "selectedStart", "selectedEnd", "loading", "locked"], ["aria-labelledby", "change-summary-title", 1, "change-summary"], ["id", "change-summary-title"], ["aria-live", "polite"], [1, "change-summary__current"], [1, "change-summary__total"], ["role", "alert", 1, "change-summary__error"], [1, "change-summary__actions"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", 3, "click", "disabled"], ["type", "button", 1, "acct-btn", "confirm-change", 3, "click", "disabled"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", "acct-btn--sm", 3, "click", "disabled"], ["aria-hidden", "true", 1, "availability__dot"]], template: function ReservaReprogramacionComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "h2", 1);
            i0.ɵɵtext(2, "Reprogramar reserva");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "p");
            i0.ɵɵtext(4, "Eleg\u00ED un nuevo ingreso. La salida se calcula autom\u00E1ticamente.");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(5, ReservaReprogramacionComponent_Conditional_5_Template, 4, 2, "div", 2)(6, ReservaReprogramacionComponent_Conditional_6_Template, 3, 1, "p", 3)(7, ReservaReprogramacionComponent_Conditional_7_Template, 2, 0, "p", 4);
            i0.ɵɵelementStart(8, "div", 5)(9, "app-availability-calendar", 6);
            i0.ɵɵlistener("rangeChange", function ReservaReprogramacionComponent_Template_app_availability_calendar_rangeChange_9_listener($event) { return ctx.elegir($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "section", 7)(11, "h3", 8);
            i0.ɵɵtext(12, "Resumen del cambio");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(13, "dl", 9)(14, "div", 10)(15, "dt");
            i0.ɵɵtext(16, "Fechas actuales");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(17, "dd");
            i0.ɵɵtext(18);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(19, "div")(20, "dt");
            i0.ɵɵtext(21, "Nuevo ingreso");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(22, "dd");
            i0.ɵɵtext(23);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(24, "div")(25, "dt");
            i0.ɵɵtext(26, "Nueva salida");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(27, "dd");
            i0.ɵɵtext(28);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(29, "div", 11)(30, "dt");
            i0.ɵɵtext(31, "Total de la reserva");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(32, "dd");
            i0.ɵɵtext(33);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(34, "p");
            i0.ɵɵtext(35, "Se mantiene la duraci\u00F3n de ");
            i0.ɵɵelementStart(36, "strong");
            i0.ɵɵtext(37);
            i0.ɵɵelementEnd();
            i0.ɵɵtext(38, " y el total pagado.");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(39, ReservaReprogramacionComponent_Conditional_39_Template, 2, 1, "p", 12)(40, ReservaReprogramacionComponent_Conditional_40_Template, 2, 0, "p", 12);
            i0.ɵɵelementStart(41, "div", 13)(42, "button", 14);
            i0.ɵɵlistener("click", function ReservaReprogramacionComponent_Template_button_click_42_listener() { return ctx.cancelar.emit(); });
            i0.ɵɵtext(43, "Cancelar");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(44, "button", 15);
            i0.ɵɵlistener("click", function ReservaReprogramacionComponent_Template_button_click_44_listener() { return ctx.confirmar(); });
            i0.ɵɵtext(45);
            i0.ɵɵelementEnd()()()()();
        } if (rf & 2) {
            let tmp_0_0;
            i0.ɵɵadvance(5);
            i0.ɵɵconditional(ctx.errorDisponibilidad() ? 5 : (tmp_0_0 = ctx.horaActualizada()) ? 6 : 7, tmp_0_0);
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("dates", ctx.fechas())("fixedDays", ctx.dias())("currentStart", ctx.reserva().fecha_inicio)("minStart", ctx.fechaMinima())("selectedStart", ctx.seleccion().start)("selectedEnd", ctx.seleccion().end)("loading", !ctx.actualizado() && ctx.consultando())("locked", ctx.guardando() || !!ctx.errorDisponibilidad());
            i0.ɵɵadvance(9);
            i0.ɵɵtextInterpolate2("", ctx.fecha(ctx.reserva().fecha_inicio), " \u2013 ", ctx.fecha(ctx.reserva().fecha_fin));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(ctx.fecha(ctx.seleccion().start) || "Eleg\u00ED una fecha");
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(ctx.fecha(ctx.seleccion().end) || "\u2014");
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(ctx.total());
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate2("", ctx.dias(), " ", ctx.dias() === 1 ? "d\u00EDa" : "d\u00EDas");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.errorCambio() ? 39 : ctx.seleccion().start && !ctx.rangoDisponible() && !ctx.errorDisponibilidad() ? 40 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", ctx.guardando());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", !ctx.rangoDisponible() || ctx.consultando() || ctx.guardando() || !!ctx.errorDisponibilidad());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.guardando() ? "Guardando\u2026" : "Confirmar reprogramaci\u00F3n", " ");
        } }, dependencies: [AvailabilityCalendarComponent], styles: [".reschedule[_ngcontent-%COMP%] { padding: 1.15rem; border: 1px solid var(--%NS%color-border); border-radius: 14px; background: #fff; }\nh2[_ngcontent-%COMP%], h3[_ngcontent-%COMP%], p[_ngcontent-%COMP%] { margin: 0; }\n.reschedule[_ngcontent-%COMP%]    > p[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); margin-top: .3rem; }\n.availability[_ngcontent-%COMP%] { display: flex; align-items: center; gap: .5rem; margin: .8rem 0; font-size: .9rem; }\n.reschedule[_ngcontent-%COMP%]    > .availability[_ngcontent-%COMP%] { margin-top: .8rem; }\n.availability__dot[_ngcontent-%COMP%] { flex: none; width: .65rem; height: .65rem; border-radius: 50%; background: #28884c; }\n.reschedule__grid[_ngcontent-%COMP%] { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 1rem; }\n.change-summary[_ngcontent-%COMP%] { display: flex; flex-direction: column; padding: 1rem; border-radius: 12px; background: #f0f2f6; }\ndl[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); margin: .65rem 0; gap: .6rem; }\ndt[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); font-size: .88rem; }\ndd[_ngcontent-%COMP%] { margin: .2rem 0 0; font-weight: 750; }\n.change-summary__current[_ngcontent-%COMP%], .change-summary__total[_ngcontent-%COMP%] { grid-column: 1 / -1; }\n.change-summary__current[_ngcontent-%COMP%] { border-bottom: 1px solid var(--%NS%color-border); padding-bottom: .55rem; }\n.change-summary__total[_ngcontent-%COMP%] { border-top: 1px solid var(--%NS%color-border); padding-top: .55rem; }\n.change-summary__total[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%] { font-size: 1.55rem; }\n.change-summary__actions[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: auto; padding-top: 1rem; }\n.confirm-change[_ngcontent-%COMP%] { flex: 1 1 auto; background: #ae391c; color: white; text-align: center; }\n.change-summary__error[_ngcontent-%COMP%] { color: #9d251e; margin-top: .5rem; }\n@media (max-width: 760px) { .reschedule__grid[_ngcontent-%COMP%] { grid-template-columns: minmax(0, 1fr); } }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ReservaReprogramacionComponent, [{
        type: Component,
        args: [{ selector: 'app-reserva-reprogramacion', imports: [AvailabilityCalendarComponent], template: "<section class=\"reschedule\" aria-labelledby=\"reschedule-title\">\r\n  <h2 id=\"reschedule-title\">Reprogramar reserva</h2>\r\n  <p>Eleg\u00ED un nuevo ingreso. La salida se calcula autom\u00E1ticamente.</p>\r\n  @if (errorDisponibilidad()) {\r\n    <div class=\"availability\" role=\"alert\">\r\n      {{ errorDisponibilidad() }}\r\n      <button type=\"button\" class=\"acct-btn acct-btn--ghost acct-btn--sm\" [disabled]=\"consultando()\" (click)=\"consultar()\">Reintentar</button>\r\n    </div>\r\n  } @else if (horaActualizada(); as hora) {\r\n    <p class=\"availability\"><span class=\"availability__dot\" aria-hidden=\"true\"></span>Disponibilidad actualizada a las {{ hora }}</p>\r\n  } @else {\r\n    <p class=\"availability\" role=\"status\">Consultando disponibilidad\u2026</p>\r\n  }\r\n\r\n  <div class=\"reschedule__grid\">\r\n    <app-availability-calendar\r\n      mode=\"reschedule\" [dates]=\"fechas()\" [fixedDays]=\"dias()\" [currentStart]=\"reserva().fecha_inicio\"\r\n      [minStart]=\"fechaMinima()\" [selectedStart]=\"seleccion().start\" [selectedEnd]=\"seleccion().end\"\r\n      [loading]=\"!actualizado() && consultando()\" [locked]=\"guardando() || !!errorDisponibilidad()\"\r\n      (rangeChange)=\"elegir($event)\"\r\n    />\r\n    <section class=\"change-summary\" aria-labelledby=\"change-summary-title\">\r\n      <h3 id=\"change-summary-title\">Resumen del cambio</h3>\r\n      <dl aria-live=\"polite\">\r\n        <div class=\"change-summary__current\">\r\n          <dt>Fechas actuales</dt>\r\n          <dd>{{ fecha(reserva().fecha_inicio) }} \u2013 {{ fecha(reserva().fecha_fin) }}</dd>\r\n        </div>\r\n        <div><dt>Nuevo ingreso</dt><dd>{{ fecha(seleccion().start) || 'Eleg\u00ED una fecha' }}</dd></div>\r\n        <div><dt>Nueva salida</dt><dd>{{ fecha(seleccion().end) || '\u2014' }}</dd></div>\r\n        <div class=\"change-summary__total\">\r\n          <dt>Total de la reserva</dt>\r\n          <dd>{{ total() }}</dd>\r\n        </div>\r\n      </dl>\r\n      <p>Se mantiene la duraci\u00F3n de <strong>{{ dias() }} {{ dias() === 1 ? 'd\u00EDa' : 'd\u00EDas' }}</strong> y el total pagado.</p>\r\n      @if (errorCambio()) {\r\n        <p class=\"change-summary__error\" role=\"alert\">{{ errorCambio() }}</p>\r\n      } @else if (seleccion().start && !rangoDisponible() && !errorDisponibilidad()) {\r\n        <p class=\"change-summary__error\" role=\"alert\">Ese per\u00EDodo ya no est\u00E1 disponible. Eleg\u00ED otro ingreso.</p>\r\n      }\r\n      <div class=\"change-summary__actions\">\r\n        <button type=\"button\" class=\"acct-btn acct-btn--ghost\" [disabled]=\"guardando()\" (click)=\"cancelar.emit()\">Cancelar</button>\r\n        <button type=\"button\" class=\"acct-btn confirm-change\" [disabled]=\"!rangoDisponible() || consultando() || guardando() || !!errorDisponibilidad()\" (click)=\"confirmar()\">\r\n          {{ guardando() ? 'Guardando\u2026' : 'Confirmar reprogramaci\u00F3n' }}\r\n        </button>\r\n      </div>\r\n    </section>\r\n  </div>\r\n</section>\r\n", styles: [".reschedule { padding: 1.15rem; border: 1px solid var(--color-border); border-radius: 14px; background: #fff; }\nh2, h3, p { margin: 0; }\n.reschedule > p { color: var(--color-text-muted); margin-top: .3rem; }\n.availability { display: flex; align-items: center; gap: .5rem; margin: .8rem 0; font-size: .9rem; }\n.reschedule > .availability { margin-top: .8rem; }\n.availability__dot { flex: none; width: .65rem; height: .65rem; border-radius: 50%; background: #28884c; }\n.reschedule__grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 1rem; }\n.change-summary { display: flex; flex-direction: column; padding: 1rem; border-radius: 12px; background: #f0f2f6; }\ndl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); margin: .65rem 0; gap: .6rem; }\ndt { color: var(--color-text-muted); font-size: .88rem; }\ndd { margin: .2rem 0 0; font-weight: 750; }\n.change-summary__current, .change-summary__total { grid-column: 1 / -1; }\n.change-summary__current { border-bottom: 1px solid var(--color-border); padding-bottom: .55rem; }\n.change-summary__total { border-top: 1px solid var(--color-border); padding-top: .55rem; }\n.change-summary__total dd { font-size: 1.55rem; }\n.change-summary__actions { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: auto; padding-top: 1rem; }\n.confirm-change { flex: 1 1 auto; background: #ae391c; color: white; text-align: center; }\n.change-summary__error { color: #9d251e; margin-top: .5rem; }\n@media (max-width: 760px) { .reschedule__grid { grid-template-columns: minmax(0, 1fr); } }\n"] }]
    }], () => [], { reserva: [{ type: i0.Input, args: [{ isSignal: true, alias: "reserva", required: true }] }], cancelar: [{ type: i0.Output, args: ["cancelar"] }], guardada: [{ type: i0.Output, args: ["guardada"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ReservaReprogramacionComponent, { className: "ReservaReprogramacionComponent", filePath: "src/app/features/reserva-resultado/reserva-reprogramacion.component.ts", lineNumber: 24 }); })();
