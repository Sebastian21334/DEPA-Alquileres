import { Component, EventEmitter, Output, computed, effect, input, signal } from '@angular/core';
import { availableRentalStarts, fechaHoyArgentina, isRentalRangeAvailable, rentalDays, rentalEnd } from '../../utils/rental-dates';
import * as i0 from "@angular/core";
function AvailabilityCalendarComponent_Conditional_1_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "button", 21);
    i0.ɵɵdomListener("click", function AvailabilityCalendarComponent_Conditional_1_Conditional_14_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.editField("end")); });
    i0.ɵɵdomElementStart(1, "span");
    i0.ɵɵtext(2, "\u00DAltimo d\u00EDa");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵdomElementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("is-active", ctx_r1.activeField() === "end");
    i0.ɵɵdomProperty("disabled", !ctx_r1.selectedStart());
    i0.ɵɵattribute("aria-pressed", ctx_r1.activeField() === "end");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r1.formatDate(ctx_r1.selectedEnd()));
} }
function AvailabilityCalendarComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "div", 14)(1, "div", 15)(2, "button", 16);
    i0.ɵɵdomListener("click", function AvailabilityCalendarComponent_Conditional_1_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.setSelectionType("single")); });
    i0.ɵɵtext(3, " Un d\u00EDa ");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(4, "button", 16);
    i0.ɵɵdomListener("click", function AvailabilityCalendarComponent_Conditional_1_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.setSelectionType("range")); });
    i0.ɵɵtext(5, " Varios d\u00EDas ");
    i0.ɵɵdomElementEnd()();
    i0.ɵɵdomElementStart(6, "button", 17);
    i0.ɵɵdomListener("click", function AvailabilityCalendarComponent_Conditional_1_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.clear()); });
    i0.ɵɵtext(7, " Borrar fechas ");
    i0.ɵɵdomElementEnd()();
    i0.ɵɵdomElementStart(8, "div", 18)(9, "button", 19);
    i0.ɵɵdomListener("click", function AvailabilityCalendarComponent_Conditional_1_Template_button_click_9_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.editField("start")); });
    i0.ɵɵdomElementStart(10, "span");
    i0.ɵɵtext(11);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(12, "strong");
    i0.ɵɵtext(13);
    i0.ɵɵdomElementEnd()();
    i0.ɵɵconditionalCreate(14, AvailabilityCalendarComponent_Conditional_1_Conditional_14_Template, 5, 5, "button", 20);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵattribute("aria-pressed", ctx_r1.selectionType() === "single");
    i0.ɵɵadvance(2);
    i0.ɵɵattribute("aria-pressed", ctx_r1.selectionType() === "range");
    i0.ɵɵadvance(2);
    i0.ɵɵdomProperty("disabled", !ctx_r1.selectedStart());
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("calendar__dates--single", ctx_r1.selectionType() === "single");
    i0.ɵɵadvance();
    i0.ɵɵclassProp("is-active", ctx_r1.activeField() === "start" || ctx_r1.selectionType() === "single");
    i0.ɵɵattribute("aria-pressed", ctx_r1.activeField() === "start");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.selectionType() === "single" ? "D\u00EDa del alquiler" : "Primer d\u00EDa");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.formatDate(ctx_r1.selectedStart()));
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.selectionType() === "range" ? 14 : -1);
} }
function AvailabilityCalendarComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "p", 1);
    i0.ɵɵtext(1);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.instruction());
} }
function AvailabilityCalendarComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "strong", 4);
    i0.ɵɵtext(1);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.monthLabel());
} }
function AvailabilityCalendarComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "label", 5)(1, "span");
    i0.ɵɵtext(2, "Mes y a\u00F1o");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(3, "input", 22);
    i0.ɵɵdomListener("change", function AvailabilityCalendarComponent_Conditional_7_Template_input_change_3_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.goToMonth($event)); });
    i0.ɵɵdomElementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵdomProperty("min", ctx_r1.today.slice(0, 7))("value", ctx_r1.monthValue());
} }
function AvailabilityCalendarComponent_For_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const name_r5 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(name_r5);
} }
function AvailabilityCalendarComponent_For_15_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "button", 25);
    i0.ɵɵdomListener("mouseenter", function AvailabilityCalendarComponent_For_15_Conditional_0_Template_button_mouseenter_0_listener() { i0.ɵɵrestoreView(_r6); const day_r7 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.hoveredDate.set(day_r7.iso)); })("focus", function AvailabilityCalendarComponent_For_15_Conditional_0_Template_button_focus_0_listener() { i0.ɵɵrestoreView(_r6); const day_r7 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.hoveredDate.set(day_r7.iso)); })("blur", function AvailabilityCalendarComponent_For_15_Conditional_0_Template_button_blur_0_listener() { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.hoveredDate.set(null)); })("click", function AvailabilityCalendarComponent_For_15_Conditional_0_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r6); const day_r7 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.select(day_r7)); });
    i0.ɵɵtext(1);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const day_r7 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("is-available", ctx_r1.mode() === "setup" || day_r7.record?.disponible)("is-unavailable", !day_r7.past && ctx_r1.mode() !== "setup" && !day_r7.record?.disponible)("is-booked", !!day_r7.record?.reserva)("is-range", ctx_r1.mode() !== "manage" && ctx_r1.isInRange(day_r7.iso))("is-start", ctx_r1.mode() === "reschedule" && ctx_r1.selectedStart() === day_r7.iso)("is-preview", ctx_r1.isPreview(day_r7.iso))("is-edge", ctx_r1.mode() !== "manage" && (ctx_r1.selectedStart() === day_r7.iso || ctx_r1.selectedEnd() === day_r7.iso));
    i0.ɵɵdomProperty("disabled", ctx_r1.isDisabled(day_r7));
    i0.ɵɵattribute("aria-pressed", ctx_r1.mode() === "manage" ? !!day_r7.record?.disponible : ctx_r1.isInRange(day_r7.iso) || ctx_r1.selectedStart() === day_r7.iso)("aria-current", day_r7.iso === ctx_r1.today ? "date" : null)("aria-label", ctx_r1.dayLabel(day_r7))("data-date", day_r7.iso);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", day_r7.day, " ");
} }
function AvailabilityCalendarComponent_For_15_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElement(0, "span", 24);
} }
function AvailabilityCalendarComponent_For_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, AvailabilityCalendarComponent_For_15_Conditional_0_Template, 2, 20, "button", 23)(1, AvailabilityCalendarComponent_For_15_Conditional_1_Template, 1, 0, "span", 24);
} if (rf & 2) {
    const day_r7 = ctx.$implicit;
    i0.ɵɵconditional(day_r7 ? 0 : 1);
} }
function AvailabilityCalendarComponent_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "span");
    i0.ɵɵdomElement(1, "i", 26);
    i0.ɵɵtext(2);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.mode() === "manage" ? "Bloqueado" : "No disponible");
} }
function AvailabilityCalendarComponent_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "span");
    i0.ɵɵdomElement(1, "i", 27);
    i0.ɵɵtext(2, "Reservado");
    i0.ɵɵdomElementEnd();
} }
function AvailabilityCalendarComponent_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "span");
    i0.ɵɵdomElement(1, "i", 28);
    i0.ɵɵtext(2, "Tu selecci\u00F3n");
    i0.ɵɵdomElementEnd();
} }
function AvailabilityCalendarComponent_Conditional_24_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "strong");
    i0.ɵɵtext(1);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2("", ctx_r1.duration(), " ", ctx_r1.duration() === 1 ? "d\u00EDa seleccionado" : "d\u00EDas seleccionados");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.mode() === "setup" ? "Se habilitar\u00E1n estos d\u00EDas al guardar." : "El primer y el \u00FAltimo d\u00EDa est\u00E1n incluidos.");
} }
function AvailabilityCalendarComponent_Conditional_24_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "span");
    i0.ɵɵtext(1, "Falta elegir el \u00FAltimo d\u00EDa.");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(2, "button", 29);
    i0.ɵɵdomListener("click", function AvailabilityCalendarComponent_Conditional_24_Conditional_2_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r8); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.setSelectionType("single")); });
    i0.ɵɵtext(3, " Usar solo este d\u00EDa ");
    i0.ɵɵdomElementEnd();
} }
function AvailabilityCalendarComponent_Conditional_24_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.mode() === "setup" ? "Defin\u00ED cu\u00E1ndo estar\u00E1 disponible tu propiedad." : "Seleccion\u00E1 tus fechas para ver el total.");
} }
function AvailabilityCalendarComponent_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "div", 12);
    i0.ɵɵconditionalCreate(1, AvailabilityCalendarComponent_Conditional_24_Conditional_1_Template, 4, 3)(2, AvailabilityCalendarComponent_Conditional_24_Conditional_2_Template, 4, 0)(3, AvailabilityCalendarComponent_Conditional_24_Conditional_3_Template, 2, 1, "span");
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.duration() ? 1 : ctx_r1.selectedStart() ? 2 : 3);
} }
function AvailabilityCalendarComponent_Conditional_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "p", 13);
    i0.ɵɵtext(1);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.error());
} }
export class AvailabilityCalendarComponent {
    dates = input([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "dates" }] : /* istanbul ignore next */ []));
    mode = input('select', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mode" }] : /* istanbul ignore next */ []));
    selectedStart = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedStart" }] : /* istanbul ignore next */ []));
    selectedEnd = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedEnd" }] : /* istanbul ignore next */ []));
    loading = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "loading" }] : /* istanbul ignore next */ []));
    fixedDays = input(1, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "fixedDays" }] : /* istanbul ignore next */ []));
    currentStart = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "currentStart" }] : /* istanbul ignore next */ []));
    minStart = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "minStart" }] : /* istanbul ignore next */ []));
    locked = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "locked" }] : /* istanbul ignore next */ []));
    rangeChange = new EventEmitter();
    availabilityToggle = new EventEmitter();
    get today() {
        return this.mode() === 'reschedule' ? fechaHoyArgentina() : this.toIso(new Date());
    }
    month = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "month" }] : /* istanbul ignore next */ []));
    selectionType = signal('range', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectionType" }] : /* istanbul ignore next */ []));
    activeField = signal('start', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "activeField" }] : /* istanbul ignore next */ []));
    hoveredDate = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hoveredDate" }] : /* istanbul ignore next */ []));
    error = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
    monthValue = computed(() => this.toIso(this.month()).slice(0, 7), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "monthValue" }] : /* istanbul ignore next */ []));
    previousDisabled = computed(() => this.monthValue() <= this.today.slice(0, 7), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "previousDisabled" }] : /* istanbul ignore next */ []));
    duration = computed(() => rentalDays(this.selectedStart(), this.selectedEnd()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "duration" }] : /* istanbul ignore next */ []));
    instruction = computed(() => {
        if (this.mode() === 'manage')
            return 'Tocá un día disponible para bloquearlo, o uno bloqueado para habilitarlo.';
        if (this.loading())
            return 'Cargando días disponibles…';
        if (this.selectionType() === 'single')
            return 'Elegí el día que querés ' + (this.mode() === 'setup' ? 'habilitar.' : 'reservar.');
        if (this.selectedStart() && !this.selectedEnd())
            return 'Ahora elegí el último día. El primer y el último día están incluidos.';
        if (this.selectedEnd())
            return 'Podés cambiar las fechas o borrar la selección para empezar de nuevo.';
        return 'Elegí el primer y el último día del alquiler. Ambos están incluidos.';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "instruction" }] : /* istanbul ignore next */ []));
    days = computed(() => {
        const year = this.month().getFullYear();
        const month = this.month().getMonth();
        const firstWeekDay = (new Date(year, month, 1).getDay() + 6) % 7;
        const count = new Date(year, month + 1, 0).getDate();
        const byDate = new Map(this.dates().map((item) => [item.fecha.slice(0, 10), item]));
        const result = Array.from({ length: firstWeekDay }, () => null);
        for (let day = 1; day <= count; day++) {
            const iso = this.toIso(new Date(year, month, day));
            result.push({ iso, day, record: byDate.get(iso) ?? null, past: iso < this.today });
        }
        return result;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "days" }] : /* istanbul ignore next */ []));
    monthLabel = computed(() => new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(this.month()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "monthLabel" }] : /* istanbul ignore next */ []));
    fixedStarts = computed(() => {
        const starts = availableRentalStarts(this.dates(), this.fixedDays());
        const minStart = this.minStart();
        return minStart ? new Set([...starts].filter((start) => start >= minStart)) : starts;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "fixedStarts" }] : /* istanbul ignore next */ []));
    preview = computed(() => {
        const start = this.selectedStart();
        const hover = this.hoveredDate();
        if (this.mode() === 'reschedule' || !start || !hover || this.selectedEnd() || this.selectionType() === 'single')
            return null;
        const range = { start: start < hover ? start : hover, end: start < hover ? hover : start };
        return this.canSelectRange(range.start, range.end) ? range : null;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "preview" }] : /* istanbul ignore next */ []));
    positioned = false;
    constructor() {
        effect(() => {
            const start = this.selectedStart() ?? this.currentStart();
            const minimo = this.minStart() ?? this.today;
            const first = this.dates()
                .filter((day) => day.fecha.slice(0, 10) >= minimo &&
                (this.mode() === 'manage' || (day.disponible && !day.reserva)))
                .map((day) => day.fecha.slice(0, 10))
                .sort()[0];
            if (this.positioned || (!start && !first && this.mode() !== 'setup'))
                return;
            this.positioned = true;
            const target = start ?? first;
            if (target && target >= minimo) {
                const date = this.parseDate(target);
                this.month.set(new Date(date.getFullYear(), date.getMonth(), 1));
            }
        });
    }
    setSelectionType(type) {
        if (this.selectionType() === type)
            return;
        this.selectionType.set(type);
        this.error.set('');
        this.hoveredDate.set(null);
        const start = this.selectedStart();
        this.activeField.set(type === 'range' && start ? 'end' : 'start');
        this.rangeChange.emit({ start, end: type === 'single' ? start : null });
    }
    clear() {
        this.error.set('');
        this.hoveredDate.set(null);
        this.activeField.set('start');
        this.rangeChange.emit({ start: null, end: null });
    }
    editField(field) {
        this.activeField.set(field);
        const date = field === 'start' ? this.selectedStart() : this.selectedEnd();
        if (date) {
            const value = this.parseDate(date);
            this.month.set(new Date(value.getFullYear(), value.getMonth(), 1));
        }
    }
    previousMonth() {
        if (!this.previousDisabled())
            this.month.update((v) => new Date(v.getFullYear(), v.getMonth() - 1, 1));
    }
    nextMonth() {
        this.month.update((v) => new Date(v.getFullYear(), v.getMonth() + 1, 1));
    }
    goToMonth(event) {
        const input = event.target;
        const value = input.value;
        if (!/^\d{4}-\d{2}$/.test(value) || value < this.today.slice(0, 7)) {
            input.value = this.monthValue();
            return;
        }
        const [year, month] = value.split('-').map(Number);
        this.month.set(new Date(year, month - 1, 1));
    }
    select(day) {
        if (this.isDisabled(day))
            return;
        if (this.mode() === 'manage') {
            this.availabilityToggle.emit(day.record);
            return;
        }
        this.error.set('');
        this.hoveredDate.set(null);
        if (this.mode() === 'reschedule') {
            this.rangeChange.emit({ start: day.iso, end: rentalEnd(day.iso, this.fixedDays()) });
            return;
        }
        if (this.selectionType() === 'single') {
            this.rangeChange.emit({ start: day.iso, end: day.iso });
            return;
        }
        const anchor = this.selectedStart();
        if (!anchor || this.activeField() === 'start') {
            this.rangeChange.emit({ start: day.iso, end: null });
            this.activeField.set('end');
            return;
        }
        const start = anchor < day.iso ? anchor : day.iso;
        const end = anchor < day.iso ? day.iso : anchor;
        if (!this.canSelectRange(start, end)) {
            this.error.set('Ese período incluye días no disponibles. Elegí un período continuo de días disponibles.');
            return;
        }
        this.rangeChange.emit({ start, end });
        this.activeField.set('start');
    }
    isDisabled(day) {
        if (day.past || this.loading() || this.locked())
            return true;
        if (this.mode() === 'reschedule')
            return day.iso === this.currentStart() || !this.fixedStarts().has(day.iso);
        if (this.mode() === 'setup')
            return false;
        if (this.mode() === 'manage')
            return (!day.record?.id || !!day.record?.reserva);
        return !day.record?.disponible || !!day.record.reserva;
    }
    isInRange(iso) {
        const start = this.selectedStart();
        const end = this.selectedEnd();
        return !!start && !!end && iso >= start && iso <= end;
    }
    isPreview(iso) {
        const range = this.preview();
        return !!range && iso >= range.start && iso <= range.end;
    }
    formatDate(iso) {
        return iso
            ? new Intl.DateTimeFormat('es-AR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            }).format(this.parseDate(iso))
            : 'Elegir fecha';
    }
    dayLabel(day) {
        const date = new Intl.DateTimeFormat('es-AR', { dateStyle: 'full' }).format(this.parseDate(day.iso));
        const status = day.past
            ? 'pasado'
            : day.record?.reserva
                ? 'reservado'
                : this.isDisabled(day)
                    ? 'no disponible'
                    : 'disponible';
        return `${date}, ${status}`;
    }
    canSelectRange(start, end) {
        return this.mode() === 'setup' || isRentalRangeAvailable(start, end, this.dates());
    }
    parseDate(value) {
        return new Date(`${value}T12:00:00`);
    }
    toIso(value) {
        return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
    }
    static ɵfac = function AvailabilityCalendarComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AvailabilityCalendarComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AvailabilityCalendarComponent, selectors: [["app-availability-calendar"]], inputs: { dates: [1, "dates"], mode: [1, "mode"], selectedStart: [1, "selectedStart"], selectedEnd: [1, "selectedEnd"], loading: [1, "loading"], fixedDays: [1, "fixedDays"], currentStart: [1, "currentStart"], minStart: [1, "minStart"], locked: [1, "locked"] }, outputs: { rangeChange: "rangeChange", availabilityToggle: "availabilityToggle" }, decls: 26, vars: 11, consts: [["aria-label", "Calendario de disponibilidad", 1, "calendar"], ["aria-live", "polite", 1, "calendar__help"], [1, "calendar__header"], ["type", "button", "aria-label", "Mes anterior", 1, "calendar__nav", 3, "click", "disabled"], ["aria-live", "polite", 1, "calendar__month-label"], [1, "calendar__month"], ["type", "button", "aria-label", "Mes siguiente", 1, "calendar__nav", 3, "click"], ["aria-hidden", "true", 1, "calendar__weekdays"], [1, "calendar__grid", 3, "mouseleave"], [1, "calendar__footer"], [1, "calendar__legend"], [1, "legend-available"], ["aria-live", "polite", 1, "calendar__summary"], ["role", "alert", 1, "calendar__error"], [1, "calendar__toolbar"], ["role", "group", "aria-label", "Duraci\u00F3n del alquiler", 1, "calendar__switch"], ["type", "button", 3, "click"], ["type", "button", 1, "calendar__clear", 3, "click", "disabled"], [1, "calendar__dates"], ["type", "button", 1, "calendar__field", 3, "click"], ["type", "button", 1, "calendar__field", 3, "is-active", "disabled"], ["type", "button", 1, "calendar__field", 3, "click", "disabled"], ["type", "month", "aria-label", "Ir a un mes", 3, "change", "min", "value"], ["type", "button", 1, "calendar__day", 3, "disabled", "is-available", "is-unavailable", "is-booked", "is-range", "is-start", "is-preview", "is-edge"], ["aria-hidden", "true"], ["type", "button", 1, "calendar__day", 3, "mouseenter", "focus", "blur", "click", "disabled"], [1, "legend-blocked"], [1, "legend-booked"], [1, "legend-selected"], ["type", "button", 1, "calendar__clear", 3, "click"]], template: function AvailabilityCalendarComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵdomElementStart(0, "section", 0);
            i0.ɵɵconditionalCreate(1, AvailabilityCalendarComponent_Conditional_1_Template, 15, 11);
            i0.ɵɵconditionalCreate(2, AvailabilityCalendarComponent_Conditional_2_Template, 2, 1, "p", 1);
            i0.ɵɵdomElementStart(3, "header", 2)(4, "button", 3);
            i0.ɵɵdomListener("click", function AvailabilityCalendarComponent_Template_button_click_4_listener() { return ctx.previousMonth(); });
            i0.ɵɵtext(5, " \u2039 ");
            i0.ɵɵdomElementEnd();
            i0.ɵɵconditionalCreate(6, AvailabilityCalendarComponent_Conditional_6_Template, 2, 1, "strong", 4)(7, AvailabilityCalendarComponent_Conditional_7_Template, 4, 2, "label", 5);
            i0.ɵɵdomElementStart(8, "button", 6);
            i0.ɵɵdomListener("click", function AvailabilityCalendarComponent_Template_button_click_8_listener() { return ctx.nextMonth(); });
            i0.ɵɵtext(9, " \u203A ");
            i0.ɵɵdomElementEnd()();
            i0.ɵɵdomElementStart(10, "div", 7);
            i0.ɵɵrepeaterCreate(11, AvailabilityCalendarComponent_For_12_Template, 2, 1, "span", null, i0.ɵɵrepeaterTrackByIdentity);
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(13, "div", 8);
            i0.ɵɵdomListener("mouseleave", function AvailabilityCalendarComponent_Template_div_mouseleave_13_listener() { return ctx.hoveredDate.set(null); });
            i0.ɵɵrepeaterCreate(14, AvailabilityCalendarComponent_For_15_Template, 2, 1, null, null, i0.ɵɵrepeaterTrackByIndex);
            i0.ɵɵdomElementEnd();
            i0.ɵɵdomElementStart(16, "footer", 9)(17, "div", 10)(18, "span");
            i0.ɵɵdomElement(19, "i", 11);
            i0.ɵɵtext(20, "Disponible");
            i0.ɵɵdomElementEnd();
            i0.ɵɵconditionalCreate(21, AvailabilityCalendarComponent_Conditional_21_Template, 3, 1, "span");
            i0.ɵɵconditionalCreate(22, AvailabilityCalendarComponent_Conditional_22_Template, 3, 0, "span")(23, AvailabilityCalendarComponent_Conditional_23_Template, 3, 0, "span");
            i0.ɵɵdomElementEnd();
            i0.ɵɵconditionalCreate(24, AvailabilityCalendarComponent_Conditional_24_Template, 4, 1, "div", 12);
            i0.ɵɵdomElementEnd();
            i0.ɵɵconditionalCreate(25, AvailabilityCalendarComponent_Conditional_25_Template, 2, 1, "p", 13);
            i0.ɵɵdomElementEnd();
        } if (rf & 2) {
            i0.ɵɵclassProp("calendar--reschedule", ctx.mode() === "reschedule");
            i0.ɵɵattribute("aria-busy", ctx.loading());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.mode() === "select" || ctx.mode() === "setup" ? 1 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.mode() !== "reschedule" ? 2 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵdomProperty("disabled", ctx.previousDisabled());
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.mode() === "reschedule" ? 6 : 7);
            i0.ɵɵadvance(5);
            i0.ɵɵrepeater(ctx.weekDays);
            i0.ɵɵadvance(3);
            i0.ɵɵrepeater(ctx.days());
            i0.ɵɵadvance(7);
            i0.ɵɵconditional(ctx.mode() !== "setup" ? 21 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.mode() === "manage" ? 22 : 23);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.mode() === "select" || ctx.mode() === "setup" ? 24 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.error() ? 25 : -1);
        } }, styles: ["[_nghost-%COMP%] {\n  display: block;\n  min-width: 0;\n}\n.calendar[_ngcontent-%COMP%] {\n  padding: 24px;\n  border: 1px solid var(--%NS%color-border);\n  border-radius: 18px;\n  background: var(--%NS%color-surface);\n  color: var(--%NS%color-text);\n}\nbutton[_ngcontent-%COMP%], \ninput[_ngcontent-%COMP%] {\n  font: inherit;\n}\nbutton[_ngcontent-%COMP%] {\n  cursor: pointer;\n}\nbutton[_ngcontent-%COMP%]:focus-visible, \ninput[_ngcontent-%COMP%]:focus-visible {\n  outline: 3px solid var(--%NS%color-secondary);\n  outline-offset: 3px;\n}\nbutton[_ngcontent-%COMP%]:disabled {\n  cursor: default;\n}\n.calendar__toolbar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  margin-bottom: 18px;\n}\n.calendar__switch[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 4px;\n  padding: 4px;\n  background: #f2f4f7;\n  border-radius: 12px;\n}\n.calendar__switch[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  min-height: 40px;\n  padding: 8px 16px;\n  border: 0;\n  border-radius: 9px;\n  background: transparent;\n  color: #475467;\n  font-size: 0.86rem;\n  font-weight: 700;\n}\n.calendar__switch[_ngcontent-%COMP%]   button[aria-pressed='true'][_ngcontent-%COMP%] {\n  background: white;\n  color: var(--%NS%color-secondary);\n  box-shadow: 0 1px 4px #1018281a;\n}\n.calendar__clear[_ngcontent-%COMP%] {\n  min-height: 40px;\n  border: 0;\n  padding: 4px;\n  background: transparent;\n  color: var(--%NS%color-secondary);\n  font-size: 0.8rem;\n  font-weight: 700;\n  text-decoration: underline;\n  text-underline-offset: 3px;\n}\n.calendar__clear[_ngcontent-%COMP%]:disabled {\n  color: #98a2b3;\n  text-decoration: none;\n}\n.calendar__dates[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 10px;\n}\n.calendar__dates--single[_ngcontent-%COMP%] {\n  grid-template-columns: 1fr;\n}\n.calendar__field[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 6px;\n  min-width: 0;\n  padding: 13px 16px;\n  text-align: left;\n  border: 1px solid var(--%NS%color-border);\n  border-radius: 12px;\n  background: white;\n}\n.calendar__field[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  color: #475467;\n  font-size: 0.75rem;\n  font-weight: 600;\n}\n.calendar__field[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  color: var(--%NS%color-text);\n  font-size: 0.95rem;\n}\n.calendar__field.is-active[_ngcontent-%COMP%] {\n  border-color: var(--%NS%color-secondary);\n  background: #f7f9ff;\n  box-shadow: 0 0 0 1px var(--%NS%color-secondary);\n}\n.calendar__field[_ngcontent-%COMP%]:disabled   strong[_ngcontent-%COMP%] {\n  color: var(--%NS%color-text-muted);\n  font-weight: 500;\n}\n.calendar__help[_ngcontent-%COMP%] {\n  min-height: 40px;\n  margin: 14px 0 18px;\n  color: #475467;\n  font-size: 0.84rem;\n  line-height: 1.5;\n}\n.calendar__header[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 44px 1fr 44px;\n  align-items: center;\n  gap: 8px;\n  margin-bottom: 20px;\n}\n.calendar__nav[_ngcontent-%COMP%] {\n  width: 44px;\n  height: 44px;\n  border: 1px solid var(--%NS%color-border);\n  border-radius: 50%;\n  background: white;\n  color: var(--%NS%color-text);\n  font-size: 1.8rem;\n  line-height: 1;\n}\n.calendar__nav[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background: var(--%NS%color-secondary-light);\n  border-color: var(--%NS%color-secondary);\n}\n.calendar__nav[_ngcontent-%COMP%]:disabled {\n  color: #c2c8d0;\n}\n.calendar__month[_ngcontent-%COMP%] {\n  display: grid;\n  justify-items: center;\n  min-width: 0;\n  gap: 3px;\n}\n.calendar__month[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  color: var(--%NS%color-text-muted);\n  font-size: 0.74rem;\n}\n.calendar__month[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  width: 100%;\n  max-width: 210px;\n  min-width: 0;\n  min-height: 40px;\n  padding: 6px;\n  border: 1px solid var(--%NS%color-border);\n  border-radius: 8px;\n  color: var(--%NS%color-text);\n  background: white;\n  font-size: 0.9rem;\n  font-weight: 700;\n  cursor: pointer;\n}\n.calendar__weekdays[_ngcontent-%COMP%], \n.calendar__grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(7, minmax(0, 1fr));\n  gap: 6px;\n}\n.calendar__weekdays[_ngcontent-%COMP%] {\n  margin-bottom: 10px;\n  color: var(--%NS%color-text-muted);\n  font-size: 0.75rem;\n  font-weight: 600;\n  text-align: center;\n}\n.calendar__day[_ngcontent-%COMP%] {\n  position: relative;\n  min-width: 0;\n  min-height: 44px;\n  height: clamp(44px, 6vw, 54px);\n  padding: 0;\n  border: 1px solid transparent;\n  border-radius: 10px;\n  background: transparent;\n  color: #98a2b3;\n  font-size: 0.9rem;\n  font-weight: 600;\n}\n.calendar__day.is-available[_ngcontent-%COMP%]:not(:disabled) {\n  background: #f0f9f4;\n  color: #246543;\n}\n.calendar__day[aria-current='date'][_ngcontent-%COMP%]::after {\n  content: '';\n  position: absolute;\n  bottom: 5px;\n  left: calc(50% - 2px);\n  width: 4px;\n  height: 4px;\n  border-radius: 50%;\n  background: currentColor;\n}\n.calendar__day.is-unavailable[_ngcontent-%COMP%] {\n  color: #98a2b3;\n  background: #f2f4f7;\n  text-decoration: line-through;\n}\n.calendar__day.is-booked[_ngcontent-%COMP%] {\n  background: #fff1f0;\n  color: #b93832;\n  text-decoration: line-through;\n}\n.calendar__day.is-range[_ngcontent-%COMP%]:not(:disabled), \n.calendar__day.is-preview[_ngcontent-%COMP%]:not(:disabled) {\n  background: var(--%NS%color-secondary-light);\n  color: var(--%NS%color-secondary);\n  border-radius: 5px;\n}\n.calendar__day.is-preview[_ngcontent-%COMP%]:not(:disabled) {\n  border-color: #9aafe0;\n  border-style: dashed;\n}\n.calendar__day.is-edge[_ngcontent-%COMP%]:not(:disabled) {\n  background: var(--%NS%color-secondary);\n  color: white;\n  border-radius: 10px;\n}\n.calendar__day[_ngcontent-%COMP%]:hover:not(:disabled) {\n  border-color: var(--%NS%color-secondary);\n  box-shadow: 0 0 0 1px var(--%NS%color-secondary);\n}\n.calendar__footer[_ngcontent-%COMP%] {\n  margin-top: 20px;\n  padding-top: 16px;\n  border-top: 1px solid var(--%NS%color-border);\n}\n.calendar__legend[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 10px 16px;\n  color: #475467;\n  font-size: 0.72rem;\n}\n.calendar__legend[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n}\n.calendar__legend[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  width: 10px;\n  height: 10px;\n  border-radius: 3px;\n}\n.legend-available[_ngcontent-%COMP%] {\n  background: #d5eddf;\n  border: 1px solid #a5ceb6;\n}\n.legend-blocked[_ngcontent-%COMP%] {\n  background: #e4e7ec;\n}\n.legend-booked[_ngcontent-%COMP%] {\n  background: #ffc9c5;\n}\n.legend-selected[_ngcontent-%COMP%] {\n  background: var(--%NS%color-secondary);\n}\n.calendar__summary[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 5px 12px;\n  margin-top: 16px;\n  color: #475467;\n  font-size: 0.8rem;\n  line-height: 1.5;\n}\n.calendar__summary[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  color: var(--%NS%color-secondary);\n}\n.calendar__error[_ngcontent-%COMP%] {\n  margin: 14px 0 0;\n  padding: 12px;\n  border-radius: 10px;\n  background: #fff1f0;\n  color: #a92323;\n  font-size: 0.84rem;\n  line-height: 1.5;\n}\n@media (max-width: 480px) {\n  .calendar[_ngcontent-%COMP%] {\n    padding: 16px 12px;\n    border-radius: 14px;\n  }\n  .calendar__toolbar[_ngcontent-%COMP%] {\n    gap: 8px;\n  }\n  .calendar__switch[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n    padding-inline: 10px;\n    font-size: 0.8rem;\n  }\n  .calendar__clear[_ngcontent-%COMP%] {\n    font-size: 0.74rem;\n  }\n  .calendar__field[_ngcontent-%COMP%] {\n    padding: 12px 10px;\n  }\n  .calendar__field[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n    font-size: 0.84rem;\n  }\n  .calendar__grid[_ngcontent-%COMP%], \n   .calendar__weekdays[_ngcontent-%COMP%] {\n    gap: 3px;\n  }\n  .calendar__day[_ngcontent-%COMP%] {\n    font-size: 0.82rem;\n  }\n  .calendar__help[_ngcontent-%COMP%] {\n    min-height: 60px;\n  }\n}\n\n.calendar--reschedule[_ngcontent-%COMP%] {\n  .calendar__month-label { text-align: center; text-transform: capitalize; }\n  .calendar__day:disabled { background: #edf0f4; color: #626d80; opacity: 1; }\n  .calendar__day.is-available:not(:disabled):not(.is-range) { background: #e6f9e8; color: #1e602e; }\n  .calendar__day.is-range { background: #fff0e8; color: #7e2914; }\n  .calendar__day.is-edge[aria-pressed='true'] { border: 1px solid #ae391c; }\n  .calendar__day.is-start { background: #ae391c; color: #fff; }\n  .legend-selected { background: #ae391c; }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AvailabilityCalendarComponent, [{
        type: Component,
        args: [{ selector: 'app-availability-calendar', standalone: true, template: "<section class=\"calendar\" [class.calendar--reschedule]=\"mode() === 'reschedule'\" aria-label=\"Calendario de disponibilidad\" [attr.aria-busy]=\"loading()\">\n  @if (mode() === 'select' || mode() === 'setup') {\n    <div class=\"calendar__toolbar\">\n      <div class=\"calendar__switch\" role=\"group\" aria-label=\"Duraci\u00F3n del alquiler\">\n        <button\n          type=\"button\"\n          [attr.aria-pressed]=\"selectionType() === 'single'\"\n          (click)=\"setSelectionType('single')\"\n        >\n          Un d\u00EDa\n        </button>\n        <button\n          type=\"button\"\n          [attr.aria-pressed]=\"selectionType() === 'range'\"\n          (click)=\"setSelectionType('range')\"\n        >\n          Varios d\u00EDas\n        </button>\n      </div>\n      <button class=\"calendar__clear\" type=\"button\" [disabled]=\"!selectedStart()\" (click)=\"clear()\">\n        Borrar fechas\n      </button>\n    </div>\n    <div class=\"calendar__dates\" [class.calendar__dates--single]=\"selectionType() === 'single'\">\n      <button\n        class=\"calendar__field\"\n        type=\"button\"\n        [class.is-active]=\"activeField() === 'start' || selectionType() === 'single'\"\n        (click)=\"editField('start')\"\n        [attr.aria-pressed]=\"activeField() === 'start'\"\n      >\n        <span>{{ selectionType() === 'single' ? 'D\u00EDa del alquiler' : 'Primer d\u00EDa' }}</span>\n        <strong>{{ formatDate(selectedStart()) }}</strong>\n      </button>\n      @if (selectionType() === 'range') {\n        <button\n          class=\"calendar__field\"\n          type=\"button\"\n          [class.is-active]=\"activeField() === 'end'\"\n          (click)=\"editField('end')\"\n          [attr.aria-pressed]=\"activeField() === 'end'\"\n          [disabled]=\"!selectedStart()\"\n        >\n          <span>\u00DAltimo d\u00EDa</span><strong>{{ formatDate(selectedEnd()) }}</strong>\n        </button>\n      }\n    </div>\n  }\n  @if (mode() !== 'reschedule') {\n    <p class=\"calendar__help\" aria-live=\"polite\">{{ instruction() }}</p>\n  }\n  <header class=\"calendar__header\">\n    <button\n      class=\"calendar__nav\"\n      type=\"button\"\n      (click)=\"previousMonth()\"\n      [disabled]=\"previousDisabled()\"\n      aria-label=\"Mes anterior\"\n    >\n      \u2039\n    </button>\n    @if (mode() === 'reschedule') {\n      <strong class=\"calendar__month-label\" aria-live=\"polite\">{{ monthLabel() }}</strong>\n    } @else {\n      <label class=\"calendar__month\">\n        <span>Mes y a\u00F1o</span>\n        <input\n          type=\"month\"\n          aria-label=\"Ir a un mes\"\n          [min]=\"today.slice(0, 7)\"\n          [value]=\"monthValue()\"\n          (change)=\"goToMonth($event)\"\n        />\n      </label>\n    }\n    <button class=\"calendar__nav\" type=\"button\" (click)=\"nextMonth()\" aria-label=\"Mes siguiente\">\n      \u203A\n    </button>\n  </header>\n  <div class=\"calendar__weekdays\" aria-hidden=\"true\">\n    @for (name of weekDays; track name) {\n      <span>{{ name }}</span>\n    }\n  </div>\n  <div class=\"calendar__grid\" (mouseleave)=\"hoveredDate.set(null)\">\n    @for (day of days(); track $index) {\n      @if (day) {\n        <button\n          class=\"calendar__day\"\n          type=\"button\"\n          [disabled]=\"isDisabled(day)\"\n          [class.is-available]=\"mode() === 'setup' || day.record?.disponible\"\n          [class.is-unavailable]=\"!day.past && mode() !== 'setup' && !day.record?.disponible\"\n          [class.is-booked]=\"!!day.record?.reserva\"\n          [class.is-range]=\"mode() !== 'manage' && isInRange(day.iso)\"\n          [class.is-start]=\"mode() === 'reschedule' && selectedStart() === day.iso\"\n          [class.is-preview]=\"isPreview(day.iso)\"\n          [class.is-edge]=\"\n            mode() !== 'manage' && (selectedStart() === day.iso || selectedEnd() === day.iso)\n          \"\n          [attr.aria-pressed]=\"\n            mode() === 'manage'\n              ? !!day.record?.disponible\n              : isInRange(day.iso) || selectedStart() === day.iso\n          \"\n          [attr.aria-current]=\"day.iso === today ? 'date' : null\"\n          [attr.aria-label]=\"dayLabel(day)\"\n          [attr.data-date]=\"day.iso\"\n          (mouseenter)=\"hoveredDate.set(day.iso)\"\n          (focus)=\"hoveredDate.set(day.iso)\"\n          (blur)=\"hoveredDate.set(null)\"\n          (click)=\"select(day)\"\n        >\n          {{ day.day }}\n        </button>\n      } @else {\n        <span aria-hidden=\"true\"></span>\n      }\n    }\n  </div>\n  <footer class=\"calendar__footer\">\n    <div class=\"calendar__legend\">\n      <span><i class=\"legend-available\"></i>Disponible</span>\n      @if (mode() !== 'setup') {\n        <span\n          ><i class=\"legend-blocked\"></i\n          >{{ mode() === 'manage' ? 'Bloqueado' : 'No disponible' }}</span\n        >\n      }\n      @if (mode() === 'manage') {\n        <span><i class=\"legend-booked\"></i>Reservado</span>\n      } @else {\n        <span><i class=\"legend-selected\"></i>Tu selecci\u00F3n</span>\n      }\n    </div>\n    @if (mode() === 'select' || mode() === 'setup') {\n      <div class=\"calendar__summary\" aria-live=\"polite\">\n        @if (duration()) {\n          <strong\n            >{{ duration() }}\n            {{ duration() === 1 ? 'd\u00EDa seleccionado' : 'd\u00EDas seleccionados' }}</strong\n          >\n          <span>{{\n            mode() === 'setup'\n              ? 'Se habilitar\u00E1n estos d\u00EDas al guardar.'\n              : 'El primer y el \u00FAltimo d\u00EDa est\u00E1n incluidos.'\n          }}</span>\n        } @else if (selectedStart()) {\n          <span>Falta elegir el \u00FAltimo d\u00EDa.</span>\n          <button class=\"calendar__clear\" type=\"button\" (click)=\"setSelectionType('single')\">\n            Usar solo este d\u00EDa\n          </button>\n        } @else {\n          <span>{{\n            mode() === 'setup'\n              ? 'Defin\u00ED cu\u00E1ndo estar\u00E1 disponible tu propiedad.'\n              : 'Seleccion\u00E1 tus fechas para ver el total.'\n          }}</span>\n        }\n      </div>\n    }\n  </footer>\n  @if (error()) {\n    <p class=\"calendar__error\" role=\"alert\">{{ error() }}</p>\n  }\n</section>\n", styles: [":host {\n  display: block;\n  min-width: 0;\n}\n.calendar {\n  padding: 24px;\n  border: 1px solid var(--color-border);\n  border-radius: 18px;\n  background: var(--color-surface);\n  color: var(--color-text);\n}\nbutton,\ninput {\n  font: inherit;\n}\nbutton {\n  cursor: pointer;\n}\nbutton:focus-visible,\ninput:focus-visible {\n  outline: 3px solid var(--color-secondary);\n  outline-offset: 3px;\n}\nbutton:disabled {\n  cursor: default;\n}\n.calendar__toolbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  margin-bottom: 18px;\n}\n.calendar__switch {\n  display: flex;\n  gap: 4px;\n  padding: 4px;\n  background: #f2f4f7;\n  border-radius: 12px;\n}\n.calendar__switch button {\n  min-height: 40px;\n  padding: 8px 16px;\n  border: 0;\n  border-radius: 9px;\n  background: transparent;\n  color: #475467;\n  font-size: 0.86rem;\n  font-weight: 700;\n}\n.calendar__switch button[aria-pressed='true'] {\n  background: white;\n  color: var(--color-secondary);\n  box-shadow: 0 1px 4px #1018281a;\n}\n.calendar__clear {\n  min-height: 40px;\n  border: 0;\n  padding: 4px;\n  background: transparent;\n  color: var(--color-secondary);\n  font-size: 0.8rem;\n  font-weight: 700;\n  text-decoration: underline;\n  text-underline-offset: 3px;\n}\n.calendar__clear:disabled {\n  color: #98a2b3;\n  text-decoration: none;\n}\n.calendar__dates {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 10px;\n}\n.calendar__dates--single {\n  grid-template-columns: 1fr;\n}\n.calendar__field {\n  display: grid;\n  gap: 6px;\n  min-width: 0;\n  padding: 13px 16px;\n  text-align: left;\n  border: 1px solid var(--color-border);\n  border-radius: 12px;\n  background: white;\n}\n.calendar__field span {\n  color: #475467;\n  font-size: 0.75rem;\n  font-weight: 600;\n}\n.calendar__field strong {\n  color: var(--color-text);\n  font-size: 0.95rem;\n}\n.calendar__field.is-active {\n  border-color: var(--color-secondary);\n  background: #f7f9ff;\n  box-shadow: 0 0 0 1px var(--color-secondary);\n}\n.calendar__field:disabled strong {\n  color: var(--color-text-muted);\n  font-weight: 500;\n}\n.calendar__help {\n  min-height: 40px;\n  margin: 14px 0 18px;\n  color: #475467;\n  font-size: 0.84rem;\n  line-height: 1.5;\n}\n.calendar__header {\n  display: grid;\n  grid-template-columns: 44px 1fr 44px;\n  align-items: center;\n  gap: 8px;\n  margin-bottom: 20px;\n}\n.calendar__nav {\n  width: 44px;\n  height: 44px;\n  border: 1px solid var(--color-border);\n  border-radius: 50%;\n  background: white;\n  color: var(--color-text);\n  font-size: 1.8rem;\n  line-height: 1;\n}\n.calendar__nav:hover:not(:disabled) {\n  background: var(--color-secondary-light);\n  border-color: var(--color-secondary);\n}\n.calendar__nav:disabled {\n  color: #c2c8d0;\n}\n.calendar__month {\n  display: grid;\n  justify-items: center;\n  min-width: 0;\n  gap: 3px;\n}\n.calendar__month span {\n  color: var(--color-text-muted);\n  font-size: 0.74rem;\n}\n.calendar__month input {\n  width: 100%;\n  max-width: 210px;\n  min-width: 0;\n  min-height: 40px;\n  padding: 6px;\n  border: 1px solid var(--color-border);\n  border-radius: 8px;\n  color: var(--color-text);\n  background: white;\n  font-size: 0.9rem;\n  font-weight: 700;\n  cursor: pointer;\n}\n.calendar__weekdays,\n.calendar__grid {\n  display: grid;\n  grid-template-columns: repeat(7, minmax(0, 1fr));\n  gap: 6px;\n}\n.calendar__weekdays {\n  margin-bottom: 10px;\n  color: var(--color-text-muted);\n  font-size: 0.75rem;\n  font-weight: 600;\n  text-align: center;\n}\n.calendar__day {\n  position: relative;\n  min-width: 0;\n  min-height: 44px;\n  height: clamp(44px, 6vw, 54px);\n  padding: 0;\n  border: 1px solid transparent;\n  border-radius: 10px;\n  background: transparent;\n  color: #98a2b3;\n  font-size: 0.9rem;\n  font-weight: 600;\n}\n.calendar__day.is-available:not(:disabled) {\n  background: #f0f9f4;\n  color: #246543;\n}\n.calendar__day[aria-current='date']::after {\n  content: '';\n  position: absolute;\n  bottom: 5px;\n  left: calc(50% - 2px);\n  width: 4px;\n  height: 4px;\n  border-radius: 50%;\n  background: currentColor;\n}\n.calendar__day.is-unavailable {\n  color: #98a2b3;\n  background: #f2f4f7;\n  text-decoration: line-through;\n}\n.calendar__day.is-booked {\n  background: #fff1f0;\n  color: #b93832;\n  text-decoration: line-through;\n}\n.calendar__day.is-range:not(:disabled),\n.calendar__day.is-preview:not(:disabled) {\n  background: var(--color-secondary-light);\n  color: var(--color-secondary);\n  border-radius: 5px;\n}\n.calendar__day.is-preview:not(:disabled) {\n  border-color: #9aafe0;\n  border-style: dashed;\n}\n.calendar__day.is-edge:not(:disabled) {\n  background: var(--color-secondary);\n  color: white;\n  border-radius: 10px;\n}\n.calendar__day:hover:not(:disabled) {\n  border-color: var(--color-secondary);\n  box-shadow: 0 0 0 1px var(--color-secondary);\n}\n.calendar__footer {\n  margin-top: 20px;\n  padding-top: 16px;\n  border-top: 1px solid var(--color-border);\n}\n.calendar__legend {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 10px 16px;\n  color: #475467;\n  font-size: 0.72rem;\n}\n.calendar__legend span {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n}\n.calendar__legend i {\n  width: 10px;\n  height: 10px;\n  border-radius: 3px;\n}\n.legend-available {\n  background: #d5eddf;\n  border: 1px solid #a5ceb6;\n}\n.legend-blocked {\n  background: #e4e7ec;\n}\n.legend-booked {\n  background: #ffc9c5;\n}\n.legend-selected {\n  background: var(--color-secondary);\n}\n.calendar__summary {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 5px 12px;\n  margin-top: 16px;\n  color: #475467;\n  font-size: 0.8rem;\n  line-height: 1.5;\n}\n.calendar__summary strong {\n  color: var(--color-secondary);\n}\n.calendar__error {\n  margin: 14px 0 0;\n  padding: 12px;\n  border-radius: 10px;\n  background: #fff1f0;\n  color: #a92323;\n  font-size: 0.84rem;\n  line-height: 1.5;\n}\n@media (max-width: 480px) {\n  .calendar {\n    padding: 16px 12px;\n    border-radius: 14px;\n  }\n  .calendar__toolbar {\n    gap: 8px;\n  }\n  .calendar__switch button {\n    padding-inline: 10px;\n    font-size: 0.8rem;\n  }\n  .calendar__clear {\n    font-size: 0.74rem;\n  }\n  .calendar__field {\n    padding: 12px 10px;\n  }\n  .calendar__field strong {\n    font-size: 0.84rem;\n  }\n  .calendar__grid,\n  .calendar__weekdays {\n    gap: 3px;\n  }\n  .calendar__day {\n    font-size: 0.82rem;\n  }\n  .calendar__help {\n    min-height: 60px;\n  }\n}\n\n.calendar--reschedule {\n  .calendar__month-label { text-align: center; text-transform: capitalize; }\n  .calendar__day:disabled { background: #edf0f4; color: #626d80; opacity: 1; }\n  .calendar__day.is-available:not(:disabled):not(.is-range) { background: #e6f9e8; color: #1e602e; }\n  .calendar__day.is-range { background: #fff0e8; color: #7e2914; }\n  .calendar__day.is-edge[aria-pressed='true'] { border: 1px solid #ae391c; }\n  .calendar__day.is-start { background: #ae391c; color: #fff; }\n  .legend-selected { background: #ae391c; }\n}\n"] }]
    }], () => [], { dates: [{ type: i0.Input, args: [{ isSignal: true, alias: "dates", required: false }] }], mode: [{ type: i0.Input, args: [{ isSignal: true, alias: "mode", required: false }] }], selectedStart: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectedStart", required: false }] }], selectedEnd: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectedEnd", required: false }] }], loading: [{ type: i0.Input, args: [{ isSignal: true, alias: "loading", required: false }] }], fixedDays: [{ type: i0.Input, args: [{ isSignal: true, alias: "fixedDays", required: false }] }], currentStart: [{ type: i0.Input, args: [{ isSignal: true, alias: "currentStart", required: false }] }], minStart: [{ type: i0.Input, args: [{ isSignal: true, alias: "minStart", required: false }] }], locked: [{ type: i0.Input, args: [{ isSignal: true, alias: "locked", required: false }] }], rangeChange: [{
            type: Output
        }], availabilityToggle: [{
            type: Output
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AvailabilityCalendarComponent, { className: "AvailabilityCalendarComponent", filePath: "src/app/shared/components/availability-calendar/availability-calendar.component.ts", lineNumber: 22 }); })();
