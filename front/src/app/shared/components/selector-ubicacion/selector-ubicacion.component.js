import { Component, DestroyRef, ElementRef, HostListener, computed, effect, inject, input, output, signal, } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideBuilding2, LucideChevronDown, LucideMapPin, LucideSearch } from '@lucide/angular';
import { UbicacionService } from '../../services/ubicacion.service';
import * as i0 from "@angular/core";
const _forTrack0 = ($index, $item) => $item.id;
function SelectorUbicacionComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(0, "svg", 4);
} if (rf & 2) {
    i0.ɵɵproperty("size", 25);
} }
function SelectorUbicacionComponent_Conditional_5_Conditional_5_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li", 21);
    i0.ɵɵlistener("mousedown", function SelectorUbicacionComponent_Conditional_5_Conditional_5_For_2_Template_li_mousedown_0_listener($event) { return $event.preventDefault(); })("click", function SelectorUbicacionComponent_Conditional_5_Conditional_5_For_2_Template_li_click_0_listener() { const opcion_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.elegirProvincia(opcion_r4.id)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const opcion_r4 = ctx.$implicit;
    const ɵ$index_24_r5 = ctx.$index;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("id", ctx_r1.idPrefix() + "-provincia-opcion-" + ɵ$index_24_r5);
    i0.ɵɵattribute("aria-selected", opcion_r4.id === ctx_r1.provinciaId())("data-active", ɵ$index_24_r5 === ctx_r1.indiceProvinciaActivo());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", opcion_r4.nombre, " ");
} }
function SelectorUbicacionComponent_Conditional_5_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 19);
    i0.ɵɵrepeaterCreate(1, SelectorUbicacionComponent_Conditional_5_Conditional_5_For_2_Template, 2, 4, "li", 20, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("id", ctx_r1.idPrefix() + "-provincias");
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.opcionesProvincia());
} }
function SelectorUbicacionComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 5)(1, "button", 17);
    i0.ɵɵlistener("click", function SelectorUbicacionComponent_Conditional_5_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.alternarProvincias()); })("keydown", function SelectorUbicacionComponent_Conditional_5_Template_button_keydown_1_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.tecladoProvincia($event)); });
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(4, "svg", 18);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, SelectorUbicacionComponent_Conditional_5_Conditional_5_Template, 3, 1, "ul", 19);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("id", ctx_r1.idPrefix() + "-provincia")("disabled", ctx_r1.disabled() || ctx_r1.cargandoProvincias());
    i0.ɵɵattribute("aria-invalid", ctx_r1.invalidProvincia())("aria-required", ctx_r1.required())("aria-expanded", ctx_r1.provinciaAbierta())("aria-controls", ctx_r1.idPrefix() + "-provincias")("aria-activedescendant", ctx_r1.provinciaAbierta() && ctx_r1.indiceProvinciaActivo() >= 0 ? ctx_r1.idPrefix() + "-provincia-opcion-" + ctx_r1.indiceProvinciaActivo() : null);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.provinciaSeleccionada()?.nombre ?? (ctx_r1.cargandoProvincias() ? "Cargando provincias\u2026" : ctx_r1.required() ? "Seleccion\u00E1 una provincia" : "Todas las provincias"), " ");
    i0.ɵɵadvance();
    i0.ɵɵclassProp("location-select__chevron--open", ctx_r1.provinciaAbierta());
    i0.ɵɵproperty("size", 22);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.provinciaAbierta() ? 5 : -1);
} }
function SelectorUbicacionComponent_Conditional_6_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 24);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const provincia_r7 = ctx.$implicit;
    i0.ɵɵproperty("value", provincia_r7.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(provincia_r7.nombre);
} }
function SelectorUbicacionComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 6)(1, "select", 22);
    i0.ɵɵlistener("change", function SelectorUbicacionComponent_Conditional_6_Template_select_change_1_listener($event) { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.cambiarProvincia($event)); });
    i0.ɵɵelementStart(2, "option", 23);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(4, SelectorUbicacionComponent_Conditional_6_For_5_Template, 2, 2, "option", 24, _forTrack0);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("id", ctx_r1.idPrefix() + "-provincia")("value", ctx_r1.provinciaId() ?? "")("disabled", ctx_r1.disabled() || ctx_r1.cargandoProvincias());
    i0.ɵɵattribute("aria-invalid", ctx_r1.invalidProvincia())("aria-required", ctx_r1.required());
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.required());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.cargandoProvincias() ? "Cargando provincias\u2026" : ctx_r1.required() ? "Seleccion\u00E1 una provincia" : "Todas las provincias", " ");
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.provincias());
} }
function SelectorUbicacionComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "span", 7);
    i0.ɵɵtext(1);
    i0.ɵɵelementStart(2, "button", 25);
    i0.ɵɵlistener("click", function SelectorUbicacionComponent_Conditional_7_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r8); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.cargarProvincias()); });
    i0.ɵɵtext(3, "Reintentar");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("", ctx_r1.errorProvincias(), " ");
} }
function SelectorUbicacionComponent_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 8);
    i0.ɵɵtext(1, "Eleg\u00ED una provincia.");
    i0.ɵɵelementEnd();
} }
function SelectorUbicacionComponent_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(0, "svg", 9);
} if (rf & 2) {
    i0.ɵɵproperty("size", 25);
} }
function SelectorUbicacionComponent_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(0, "svg", 12);
} if (rf & 2) {
    i0.ɵɵproperty("size", 25);
} }
function SelectorUbicacionComponent_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 26);
    i0.ɵɵlistener("mousedown", function SelectorUbicacionComponent_Conditional_18_Template_button_mousedown_0_listener($event) { return $event.preventDefault(); })("click", function SelectorUbicacionComponent_Conditional_18_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(); const localidadInput_r10 = i0.ɵɵreference(17); return i0.ɵɵresetView(ctx_r1.limpiar(localidadInput_r10)); });
    i0.ɵɵtext(1, " \u00D7 ");
    i0.ɵɵelementEnd();
} }
function SelectorUbicacionComponent_Conditional_19_For_3_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li", 21);
    i0.ɵɵlistener("mousedown", function SelectorUbicacionComponent_Conditional_19_For_3_Template_li_mousedown_0_listener($event) { return $event.preventDefault(); })("click", function SelectorUbicacionComponent_Conditional_19_For_3_Template_li_click_0_listener() { const localidad_r12 = i0.ɵɵrestoreView(_r11).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.elegir(localidad_r12)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const localidad_r12 = ctx.$implicit;
    const ɵ$index_77_r13 = ctx.$index;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("id", ctx_r1.idPrefix() + "-opcion-" + ɵ$index_77_r13);
    i0.ɵɵattribute("aria-selected", localidad_r12.id === ctx_r1.localidadId())("data-active", ɵ$index_77_r13 === ctx_r1.indiceActivo());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", localidad_r12.nombre, " ");
} }
function SelectorUbicacionComponent_Conditional_19_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 28);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.localidades().length ? "No encontramos localidades con ese nombre." : "No hay localidades cargadas en esta provincia.", " ");
} }
function SelectorUbicacionComponent_Conditional_19_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 28);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Escrib\u00ED para acotar las ", ctx_r1.coincidencias().length, " localidades.");
} }
function SelectorUbicacionComponent_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 15)(1, "ul", 27);
    i0.ɵɵrepeaterCreate(2, SelectorUbicacionComponent_Conditional_19_For_3_Template, 2, 4, "li", 20, _forTrack0);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, SelectorUbicacionComponent_Conditional_19_Conditional_4_Template, 2, 1, "p", 28)(5, SelectorUbicacionComponent_Conditional_19_Conditional_5_Template, 2, 1, "p", 28);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("id", ctx_r1.idPrefix() + "-opciones");
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.sugerencias());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!ctx_r1.sugerencias().length ? 4 : ctx_r1.coincidencias().length > ctx_r1.sugerencias().length ? 5 : -1);
} }
function SelectorUbicacionComponent_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    const _r14 = i0.ɵɵgetCurrentView();
    i0.ɵɵtext(0);
    i0.ɵɵelementStart(1, "button", 25);
    i0.ɵɵlistener("click", function SelectorUbicacionComponent_Conditional_21_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.reintentarLocalidades()); });
    i0.ɵɵtext(2, "Reintentar");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.errorLocalidades(), " ");
} }
function SelectorUbicacionComponent_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " Eleg\u00ED una localidad de las sugerencias. ");
} }
function SelectorUbicacionComponent_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " Seleccion\u00E1 una sugerencia para elegir la localidad. ");
} }
function SelectorUbicacionComponent_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " Todas las localidades de la provincia. ");
} }
function SelectorUbicacionComponent_Conditional_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " Escrib\u00ED y seleccion\u00E1 una sugerencia. ");
} }
const normalizar = (texto) => texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-AR')
    .trim();
const MAX_SUGERENCIAS = 40;
export class SelectorUbicacionComponent {
    ubicaciones = inject(UbicacionService);
    destroyRef = inject(DestroyRef);
    elemento = inject((ElementRef));
    reintento = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reintento" }] : /* istanbul ignore next */ []));
    idPrefix = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "idPrefix" }] : /* istanbul ignore next */ []));
    provinciaId = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "provinciaId" }] : /* istanbul ignore next */ []));
    localidadId = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "localidadId" }] : /* istanbul ignore next */ []));
    required = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "required" }] : /* istanbul ignore next */ []));
    disabled = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "disabled" }] : /* istanbul ignore next */ []));
    invalidProvincia = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "invalidProvincia" }] : /* istanbul ignore next */ []));
    invalidLocalidad = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "invalidLocalidad" }] : /* istanbul ignore next */ []));
    compact = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "compact" }] : /* istanbul ignore next */ []));
    advanced = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "advanced" }] : /* istanbul ignore next */ []));
    provinciaChange = output();
    localidadChange = output();
    nombresChange = output();
    touched = output();
    provincias = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "provincias" }] : /* istanbul ignore next */ []));
    localidades = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "localidades" }] : /* istanbul ignore next */ []));
    cargandoProvincias = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cargandoProvincias" }] : /* istanbul ignore next */ []));
    cargandoLocalidades = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cargandoLocalidades" }] : /* istanbul ignore next */ []));
    errorProvincias = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorProvincias" }] : /* istanbul ignore next */ []));
    errorLocalidades = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorLocalidades" }] : /* istanbul ignore next */ []));
    abierto = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "abierto" }] : /* istanbul ignore next */ []));
    texto = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "texto" }] : /* istanbul ignore next */ []));
    indiceActivo = signal(-1, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "indiceActivo" }] : /* istanbul ignore next */ []));
    provinciaAbierta = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "provinciaAbierta" }] : /* istanbul ignore next */ []));
    indiceProvinciaActivo = signal(-1, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "indiceProvinciaActivo" }] : /* istanbul ignore next */ []));
    provinciaSeleccionada = computed(() => this.provincias().find((item) => item.id === this.provinciaId()) ?? null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "provinciaSeleccionada" }] : /* istanbul ignore next */ []));
    opcionesProvincia = computed(() => {
        const provincias = this.provincias().map((item) => ({
            id: item.id,
            nombre: item.nombre,
        }));
        return this.required()
            ? provincias
            : [{ id: null, nombre: 'Todas las provincias' }, ...provincias];
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "opcionesProvincia" }] : /* istanbul ignore next */ []));
    nombreElegido = computed(() => this.localidades().find((item) => item.id === this.localidadId())?.nombre ?? '', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "nombreElegido" }] : /* istanbul ignore next */ []));
    valorInput = computed(() => this.texto() ?? this.nombreElegido(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "valorInput" }] : /* istanbul ignore next */ []));
    bloqueado = computed(() => this.disabled() ||
        !this.provinciaId() ||
        this.cargandoLocalidades() ||
        !!this.errorLocalidades(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "bloqueado" }] : /* istanbul ignore next */ []));
    coincidencias = computed(() => {
        const palabras = normalizar(this.texto() ?? '')
            .split(/\s+/)
            .filter(Boolean);
        return this.localidades().filter((item) => palabras.every((palabra) => normalizar(item.nombre).includes(palabra)));
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "coincidencias" }] : /* istanbul ignore next */ []));
    sugerencias = computed(() => this.coincidencias().slice(0, MAX_SUGERENCIAS), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "sugerencias" }] : /* istanbul ignore next */ []));
    placeholder = computed(() => {
        if (!this.provinciaId())
            return 'Primero elegí una provincia';
        if (this.cargandoLocalidades())
            return 'Cargando localidades…';
        return 'Escribí el nombre de la localidad';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "placeholder" }] : /* istanbul ignore next */ []));
    constructor() {
        this.cargarProvincias();
        effect((onCleanup) => {
            const idProvincia = this.provinciaId();
            this.reintento();
            this.localidades.set([]);
            this.texto.set(null);
            this.abierto.set(false);
            this.indiceActivo.set(-1);
            this.errorLocalidades.set('');
            this.cargandoLocalidades.set(!!idProvincia);
            if (!idProvincia)
                return;
            const sub = this.ubicaciones.getCiudadesPorProvincia(idProvincia).subscribe({
                next: (localidades) => {
                    this.localidades.set([...localidades].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));
                    this.cargandoLocalidades.set(false);
                },
                error: () => {
                    this.errorLocalidades.set('No pudimos cargar las localidades.');
                    this.cargandoLocalidades.set(false);
                },
            });
            onCleanup(() => sub.unsubscribe());
        });
        effect(() => {
            this.nombresChange.emit({
                provincia: this.provincias().find((item) => item.id === this.provinciaId())?.nombre ?? '',
                localidad: this.nombreElegido(),
            });
        });
    }
    cargarProvincias() {
        this.cargandoProvincias.set(true);
        this.errorProvincias.set('');
        this.ubicaciones
            .getProvincias()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (provincias) => {
                this.provincias.set([...provincias].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));
                this.cargandoProvincias.set(false);
            },
            error: () => {
                this.errorProvincias.set('No pudimos cargar las provincias.');
                this.cargandoProvincias.set(false);
            },
        });
    }
    cambiarProvincia(event) {
        this.texto.set(null);
        this.provinciaChange.emit(Number(event.target.value) || null);
        this.localidadChange.emit(null);
    }
    alternarProvincias() {
        if (this.disabled() || this.cargandoProvincias())
            return;
        if (this.provinciaAbierta()) {
            this.cerrarProvincias();
            return;
        }
        this.abrirProvincias();
    }
    elegirProvincia(id) {
        this.cerrarProvincias();
        if (id === this.provinciaId())
            return;
        this.provinciaChange.emit(id);
        this.localidadChange.emit(null);
    }
    cerrarProvincias() {
        this.provinciaAbierta.set(false);
        this.indiceProvinciaActivo.set(-1);
    }
    alPresionarFuera(evento) {
        if (!this.provinciaAbierta())
            return;
        const contenedor = this.elemento.nativeElement.querySelector('.location-select--custom');
        if (contenedor && !contenedor.contains(evento.target))
            this.cerrarProvincias();
    }
    tecladoProvincia(event) {
        const abierta = this.provinciaAbierta();
        if (event.key === 'Tab') {
            this.cerrarProvincias();
            return;
        }
        if (event.key === 'Escape') {
            if (!abierta)
                return;
            event.preventDefault();
            this.cerrarProvincias();
            return;
        }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (!abierta) {
                this.abrirProvincias();
                return;
            }
            this.moverProvincia(event.key === 'ArrowDown' ? 1 : -1);
            return;
        }
        if (event.key === 'Home' || event.key === 'End') {
            if (!abierta)
                return;
            event.preventDefault();
            const opciones = this.opcionesProvincia();
            if (!opciones.length)
                return;
            this.indiceProvinciaActivo.set(event.key === 'Home' ? 0 : opciones.length - 1);
            this.desplazarProvinciaActiva();
            return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (!abierta) {
                this.abrirProvincias();
                return;
            }
            const opcion = this.opcionesProvincia()[this.indiceProvinciaActivo()];
            if (opcion)
                this.elegirProvincia(opcion.id);
        }
    }
    escribir(event) {
        this.texto.set(event.target.value);
        this.abierto.set(true);
        this.indiceActivo.set(-1);
        if (this.localidadId())
            this.localidadChange.emit(null);
    }
    elegir(localidad) {
        this.texto.set(null);
        this.abierto.set(false);
        this.indiceActivo.set(-1);
        this.localidadChange.emit(localidad.id);
        this.touched.emit();
    }
    limpiar(input) {
        this.texto.set('');
        this.localidadChange.emit(null);
        this.indiceActivo.set(-1);
        this.abierto.set(true);
        input.focus();
    }
    cerrar() {
        this.abierto.set(false);
        this.indiceActivo.set(-1);
        this.touched.emit();
    }
    teclado(event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            this.cerrar();
            return;
        }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            this.abierto.set(true);
            const cantidad = this.sugerencias().length;
            if (!cantidad)
                return;
            const actual = this.indiceActivo();
            const siguiente = event.key === 'ArrowDown'
                ? (actual + 1) % cantidad
                : actual <= 0
                    ? cantidad - 1
                    : actual - 1;
            this.indiceActivo.set(siguiente);
            // El input conserva el foco; la lista desplaza la opción activa.
            requestAnimationFrame(() => this.elemento.nativeElement
                .querySelector('[data-active="true"]')
                ?.scrollIntoView?.({ block: 'nearest' }));
        }
        else if (event.key === 'Enter' && this.abierto()) {
            event.preventDefault();
            const opcion = this.sugerencias()[Math.max(0, this.indiceActivo())];
            if (opcion)
                this.elegir(opcion);
        }
    }
    reintentarLocalidades() {
        this.reintento.update((valor) => valor + 1);
    }
    abrirProvincias() {
        if (this.disabled() || this.cargandoProvincias())
            return;
        const opciones = this.opcionesProvincia();
        const actual = opciones.findIndex((opcion) => opcion.id === this.provinciaId());
        this.provinciaAbierta.set(true);
        this.indiceProvinciaActivo.set(actual >= 0 ? actual : opciones.length ? 0 : -1);
        this.desplazarProvinciaActiva();
    }
    moverProvincia(delta) {
        const opciones = this.opcionesProvincia();
        if (!opciones.length)
            return;
        const actual = this.indiceProvinciaActivo();
        const siguiente = actual < 0
            ? delta > 0
                ? 0
                : opciones.length - 1
            : (actual + delta + opciones.length) % opciones.length;
        this.indiceProvinciaActivo.set(siguiente);
        this.desplazarProvinciaActiva();
    }
    desplazarProvinciaActiva() {
        requestAnimationFrame(() => this.elemento.nativeElement
            .querySelector('.location-select__dropdown [data-active="true"]')
            ?.scrollIntoView?.({ block: 'nearest' }));
    }
    static ɵfac = function SelectorUbicacionComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SelectorUbicacionComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SelectorUbicacionComponent, selectors: [["app-selector-ubicacion"]], hostBindings: function SelectorUbicacionComponent_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("pointerdown", function SelectorUbicacionComponent_pointerdown_HostBindingHandler($event) { return ctx.alPresionarFuera($event); }, i0.ɵɵresolveDocument);
        } }, inputs: { idPrefix: [1, "idPrefix"], provinciaId: [1, "provinciaId"], localidadId: [1, "localidadId"], required: [1, "required"], disabled: [1, "disabled"], invalidProvincia: [1, "invalidProvincia"], invalidLocalidad: [1, "invalidLocalidad"], compact: [1, "compact"], advanced: [1, "advanced"] }, outputs: { provinciaChange: "provinciaChange", localidadChange: "localidadChange", nombresChange: "nombresChange", touched: "touched" }, decls: 26, vars: 32, consts: [["localidadInput", ""], [1, "location-fields"], [1, "location-field"], [3, "for"], ["lucideMapPin", "", "aria-hidden", "true", 3, "size"], [1, "location-select", "location-select--custom"], [1, "location-select"], ["role", "alert", 1, "location-error"], [1, "location-error"], ["lucideBuilding2", "", "aria-hidden", "true", 3, "size"], [1, "combobox"], [1, "combobox__input"], ["lucideSearch", "", "aria-hidden", "true", 1, "combobox__search", 3, "size"], ["type", "text", "role", "combobox", "autocomplete", "off", "aria-autocomplete", "list", "aria-haspopup", "listbox", 3, "input", "focus", "blur", "keydown", "id", "value", "placeholder", "disabled"], ["type", "button", "aria-label", "Limpiar localidad", 1, "combobox__clear"], [1, "combobox__dropdown"], ["aria-live", "polite", 1, "location-hint", 3, "id"], ["type", "button", "aria-haspopup", "listbox", 1, "location-select__trigger", 3, "click", "keydown", "id", "disabled"], ["lucideChevronDown", "", "aria-hidden", "true", 3, "size"], ["role", "listbox", "aria-label", "Provincias", 1, "location-select__dropdown", 3, "id"], ["role", "option", 3, "id"], ["role", "option", 3, "mousedown", "click", "id"], [3, "change", "id", "value", "disabled"], ["value", "", 3, "disabled"], [3, "value"], ["type", "button", 3, "click"], ["type", "button", "aria-label", "Limpiar localidad", 1, "combobox__clear", 3, "mousedown", "click"], ["role", "listbox", "aria-label", "Localidades", 3, "id"], ["role", "status"]], template: function SelectorUbicacionComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 1)(1, "div", 2)(2, "label", 3);
            i0.ɵɵconditionalCreate(3, SelectorUbicacionComponent_Conditional_3_Template, 1, 1, ":svg:svg", 4);
            i0.ɵɵtext(4);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(5, SelectorUbicacionComponent_Conditional_5_Template, 6, 12, "div", 5)(6, SelectorUbicacionComponent_Conditional_6_Template, 6, 7, "div", 6);
            i0.ɵɵconditionalCreate(7, SelectorUbicacionComponent_Conditional_7_Template, 4, 1, "span", 7)(8, SelectorUbicacionComponent_Conditional_8_Template, 2, 0, "span", 8);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "div", 2)(10, "label", 3);
            i0.ɵɵconditionalCreate(11, SelectorUbicacionComponent_Conditional_11_Template, 1, 1, ":svg:svg", 9);
            i0.ɵɵtext(12);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(13, "div", 10)(14, "div", 11);
            i0.ɵɵconditionalCreate(15, SelectorUbicacionComponent_Conditional_15_Template, 1, 1, ":svg:svg", 12);
            i0.ɵɵelementStart(16, "input", 13, 0);
            i0.ɵɵlistener("input", function SelectorUbicacionComponent_Template_input_input_16_listener($event) { return ctx.escribir($event); })("focus", function SelectorUbicacionComponent_Template_input_focus_16_listener() { return ctx.abierto.set(true); })("blur", function SelectorUbicacionComponent_Template_input_blur_16_listener() { return ctx.cerrar(); })("keydown", function SelectorUbicacionComponent_Template_input_keydown_16_listener($event) { return ctx.teclado($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(18, SelectorUbicacionComponent_Conditional_18_Template, 2, 0, "button", 14);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(19, SelectorUbicacionComponent_Conditional_19_Template, 6, 2, "div", 15);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(20, "span", 16);
            i0.ɵɵconditionalCreate(21, SelectorUbicacionComponent_Conditional_21_Template, 3, 1)(22, SelectorUbicacionComponent_Conditional_22_Template, 1, 0)(23, SelectorUbicacionComponent_Conditional_23_Template, 1, 0)(24, SelectorUbicacionComponent_Conditional_24_Template, 1, 0)(25, SelectorUbicacionComponent_Conditional_25_Template, 1, 0);
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵclassProp("location-fields--compact", ctx.compact())("location-fields--advanced", ctx.advanced());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("for", ctx.idPrefix() + "-provincia");
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.advanced() ? 3 : -1);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" Provincia", ctx.required() ? " *" : "", " ");
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.advanced() ? 5 : 6);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.errorProvincias() ? 7 : ctx.invalidProvincia() ? 8 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("for", ctx.idPrefix() + "-localidad");
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.advanced() ? 11 : -1);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" Localidad", ctx.required() ? " *" : "", " ");
            i0.ɵɵadvance(2);
            i0.ɵɵclassProp("combobox__input--invalid", ctx.invalidLocalidad());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.advanced() ? 15 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("id", ctx.idPrefix() + "-localidad")("value", ctx.valorInput())("placeholder", ctx.placeholder())("disabled", ctx.bloqueado());
            i0.ɵɵattribute("aria-expanded", ctx.abierto())("aria-controls", ctx.idPrefix() + "-opciones")("aria-describedby", ctx.idPrefix() + "-ayuda")("aria-invalid", ctx.invalidLocalidad())("aria-required", ctx.required())("aria-busy", ctx.cargandoLocalidades())("aria-activedescendant", ctx.abierto() && ctx.indiceActivo() >= 0 ? ctx.idPrefix() + "-opcion-" + ctx.indiceActivo() : null);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.valorInput() && !ctx.bloqueado() ? 18 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.abierto() && !ctx.bloqueado() ? 19 : -1);
            i0.ɵɵadvance();
            i0.ɵɵclassProp("location-error", ctx.invalidLocalidad() || !!ctx.errorLocalidades());
            i0.ɵɵproperty("id", ctx.idPrefix() + "-ayuda");
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.errorLocalidades() ? 21 : ctx.invalidLocalidad() ? 22 : ctx.provinciaId() && !ctx.localidadId() && ctx.texto()?.trim() ? 23 : ctx.provinciaId() && !ctx.localidadId() && !ctx.required() && !ctx.cargandoLocalidades() ? 24 : ctx.provinciaId() && !ctx.localidadId() && !ctx.cargandoLocalidades() ? 25 : -1);
        } }, dependencies: [LucideBuilding2, LucideChevronDown, LucideMapPin, LucideSearch], styles: ["[_nghost-%COMP%] {\r\n  display: block;\r\n  min-width: 0;\r\n}\r\n.location-fields[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  grid-template-columns: repeat(2, minmax(0, 1fr));\r\n  gap: 18px;\r\n}\r\n.location-field[_ngcontent-%COMP%] {\r\n  min-width: 0;\r\n}\r\nlabel[_ngcontent-%COMP%] {\r\n  display: block;\r\n  margin-bottom: 7px;\r\n  color: #344054;\r\n  font-size: 0.8rem;\r\n  font-weight: 700;\r\n}\r\nselect[_ngcontent-%COMP%], \r\n.combobox__input[_ngcontent-%COMP%] {\r\n  width: 100%;\r\n  min-height: 44px;\r\n  border: 1px solid #d0d5dd;\r\n  border-radius: 8px;\r\n  background: white;\r\n  color: var(--%NS%color-text, #101828);\r\n  font: inherit;\r\n}\r\nselect[_ngcontent-%COMP%] {\r\n  padding: 10px 12px;\r\n}\r\nselect[_ngcontent-%COMP%]:focus, \r\n.combobox__input[_ngcontent-%COMP%]:focus-within {\r\n  outline: 3px solid rgb(14 70 161 / 13%);\r\n  border-color: var(--%NS%color-secondary, #0e47a1);\r\n}\r\nselect[aria-invalid='true'][_ngcontent-%COMP%], \r\n.combobox__input--invalid[_ngcontent-%COMP%] {\r\n  border-color: var(--%NS%color-danger, #dc2626);\r\n}\r\nselect[_ngcontent-%COMP%]:disabled, \r\n.combobox__input[_ngcontent-%COMP%]:has(input:disabled) {\r\n  background: #f8fafc;\r\n  color: #667085;\r\n  cursor: not-allowed;\r\n}\r\n.combobox[_ngcontent-%COMP%] {\r\n  position: relative;\r\n}\r\n.combobox__input[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n}\r\n.combobox__input[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\r\n  width: 100%;\r\n  min-width: 0;\r\n  padding: 10px 12px;\r\n  border: 0;\r\n  outline: none;\r\n  background: transparent;\r\n  color: inherit;\r\n  font: inherit;\r\n}\r\n.combobox__input[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]::placeholder {\r\n  color: #667085;\r\n  font-size: 0.82rem;\r\n}\r\n.combobox__clear[_ngcontent-%COMP%] {\r\n  flex: 0 0 auto;\r\n  width: 36px;\r\n  height: 36px;\r\n  margin-right: 3px;\r\n  border: 0;\r\n  border-radius: 6px;\r\n  background: transparent;\r\n  color: #475467;\r\n  font-size: 1.3rem;\r\n  cursor: pointer;\r\n}\r\n.combobox__clear[_ngcontent-%COMP%]:hover {\r\n  background: #f1f5f9;\r\n}\r\n.combobox__clear[_ngcontent-%COMP%]:focus-visible {\r\n  outline: 2px solid var(--%NS%color-secondary, #0e47a1);\r\n}\r\n.combobox__dropdown[_ngcontent-%COMP%] {\r\n  position: absolute;\r\n  z-index: 50;\r\n  top: calc(100% + 5px);\r\n  left: 0;\r\n  right: 0;\r\n  overflow: hidden;\r\n  border: 1px solid #d0d5dd;\r\n  border-radius: 8px;\r\n  background: white;\r\n  box-shadow: 0 10px 28px rgb(16 24 40 / 15%);\r\n}\r\nul[_ngcontent-%COMP%] {\r\n  max-height: 240px;\r\n  margin: 0;\r\n  padding: 5px;\r\n  overflow-y: auto;\r\n  list-style: none;\r\n}\r\nli[_ngcontent-%COMP%] {\r\n  padding: 10px;\r\n  border-radius: 5px;\r\n  color: #101828;\r\n  font-size: 0.88rem;\r\n  overflow-wrap: anywhere;\r\n  cursor: pointer;\r\n}\r\nli[_ngcontent-%COMP%]:hover, \r\nli[data-active='true'][_ngcontent-%COMP%] {\r\n  background: #eef4ff;\r\n}\r\nli[aria-selected='true'][_ngcontent-%COMP%] {\r\n  color: #0e47a1;\r\n  font-weight: 700;\r\n}\r\n.combobox__dropdown[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\r\n  margin: 0;\r\n  padding: 10px 12px;\r\n  border-top: 1px solid #eef2f6;\r\n  color: #667085;\r\n  font-size: 0.76rem;\r\n}\r\n.location-hint[_ngcontent-%COMP%], \r\n.location-error[_ngcontent-%COMP%] {\r\n  display: block;\r\n  margin-top: 5px;\r\n  color: #667085;\r\n  font-size: 0.75rem;\r\n}\r\n.location-error[_ngcontent-%COMP%] {\r\n  color: var(--%NS%color-danger, #dc2626);\r\n}\r\n.location-hint[_ngcontent-%COMP%]   button[_ngcontent-%COMP%], \r\n.location-error[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\r\n  padding: 0;\r\n  border: 0;\r\n  background: none;\r\n  color: var(--%NS%color-secondary, #0e47a1);\r\n  font: inherit;\r\n  text-decoration: underline;\r\n  cursor: pointer;\r\n}\r\n.location-fields--compact[_ngcontent-%COMP%] {\r\n  gap: 12px;\r\n}\r\n.location-fields--compact[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\r\n  font-size: 0.67rem;\r\n}\r\n.location-fields--compact[_ngcontent-%COMP%]   select[_ngcontent-%COMP%], \r\n.location-fields--compact[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\r\n  font-size: 0.81rem;\r\n}\r\n@media (max-width: 600px) {\r\n  .location-fields[_ngcontent-%COMP%] {\r\n    grid-template-columns: 1fr;\r\n    gap: 12px;\r\n  }\r\n}\r\n\r\n.location-fields--advanced[_ngcontent-%COMP%] {\r\n  gap: 1.25rem;\r\n\r\n  label {\r\n    display: flex;\r\n    align-items: center;\r\n    gap: 0.4rem;\r\n    margin-bottom: 0.35rem;\r\n    color: #fff;\r\n    font-size: 0.8rem;\r\n    font-weight: 750;\r\n    line-height: 20px;\r\n  }\r\n\r\n  label svg {\r\n    flex-shrink: 0;\r\n    width: 20px;\r\n    height: 20px;\r\n  }\r\n\r\n  .location-select {\r\n    position: relative;\r\n  }\r\n\r\n  .location-select > svg {\r\n    position: absolute;\r\n    top: 50%;\r\n    right: 0.8rem;\r\n    width: 18px;\r\n    height: 18px;\r\n    transform: translateY(-50%);\r\n    color: #101f3d;\r\n    pointer-events: none;\r\n  }\r\n\r\n  select,\r\n  .combobox__input {\r\n    height: 44px;\r\n    border-radius: 8px;\r\n    color: #101f3d;\r\n    font-size: 0.9rem;\r\n  }\r\n\r\n  select {\r\n    appearance: none;\r\n    padding: 0 2.5rem 0 0.8rem;\r\n  }\r\n\r\n  .combobox__search {\r\n    flex-shrink: 0;\r\n    margin-left: 0.8rem;\r\n    width: 20px;\r\n    height: 20px;\r\n    color: #7c879b;\r\n  }\r\n\r\n  .combobox__input input {\r\n    padding: 0.6rem 0.8rem;\r\n  }\r\n\r\n  .combobox__input input::placeholder {\r\n    color: #7c879b;\r\n    font-size: 0.85rem;\r\n    opacity: 1;\r\n  }\r\n\r\n  .location-hint {\r\n    color: #fff;\r\n  }\r\n\r\n  .location-hint:empty {\r\n    display: none;\r\n  }\r\n\r\n  .location-error {\r\n    padding: 0.35rem 0.5rem;\r\n    border-radius: 5px;\r\n    background: #fff;\r\n    color: #b42318;\r\n  }\r\n\r\n  @media (max-width: 600px) {\r\n    gap: 0.85rem;\r\n  }\r\n}\r\n\r\n.location-select__trigger[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  width: 100%;\r\n  height: 44px;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: 0.5rem;\r\n  padding: 0 0.8rem;\r\n  border: 1px solid #d0d5dd;\r\n  border-radius: 8px;\r\n  background: #fff;\r\n  color: #101f3d;\r\n  font: inherit;\r\n  font-size: 0.9rem;\r\n  text-align: left;\r\n  cursor: pointer;\r\n}\r\n\r\n.location-select__trigger[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\r\n  min-width: 0;\r\n  overflow: hidden;\r\n  text-overflow: ellipsis;\r\n  white-space: nowrap;\r\n}\r\n\r\n.location-select__trigger[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\r\n  flex: 0 0 auto;\r\n  width: 18px;\r\n  height: 18px;\r\n  transition: transform 0.2s ease;\r\n}\r\n\r\n.location-select__trigger[_ngcontent-%COMP%]:focus-visible {\r\n  outline: 3px solid rgb(14 70 161 / 13%);\r\n  border-color: var(--%NS%color-secondary, #0e47a1);\r\n}\r\n\r\n.location-select__trigger[_ngcontent-%COMP%]:disabled {\r\n  background: #f8fafc;\r\n  color: #667085;\r\n  cursor: not-allowed;\r\n}\r\n\r\n.location-select__chevron--open[_ngcontent-%COMP%] {\r\n  transform: rotate(180deg);\r\n}\r\n\r\n.location-select__dropdown[_ngcontent-%COMP%] {\r\n  position: absolute;\r\n  z-index: 60;\r\n  top: calc(100% + 5px);\r\n  right: 0;\r\n  left: 0;\r\n  max-height: 240px;\r\n  margin: 0;\r\n  padding: 5px;\r\n  overflow-y: auto;\r\n  border: 1px solid #d0d5dd;\r\n  border-radius: 8px;\r\n  background: #fff;\r\n  box-shadow: 0 10px 28px rgb(16 24 40 / 15%);\r\n  list-style: none;\r\n}\r\n\r\n.location-select__dropdown[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] {\r\n  padding: 10px;\r\n  border-radius: 5px;\r\n  color: #101828;\r\n  font-size: 0.88rem;\r\n  overflow-wrap: anywhere;\r\n  cursor: pointer;\r\n}\r\n\r\n.location-select__dropdown[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]:hover, \r\n.location-select__dropdown[_ngcontent-%COMP%]   li[data-active='true'][_ngcontent-%COMP%] {\r\n  background: #eef4ff;\r\n}\r\n\r\n.location-select__dropdown[_ngcontent-%COMP%]   li[aria-selected='true'][_ngcontent-%COMP%] {\r\n  color: #0e47a1;\r\n  font-weight: 700;\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SelectorUbicacionComponent, [{
        type: Component,
        args: [{ selector: 'app-selector-ubicacion', standalone: true, imports: [LucideBuilding2, LucideChevronDown, LucideMapPin, LucideSearch], template: "<div\r\n  class=\"location-fields\"\r\n  [class.location-fields--compact]=\"compact()\"\r\n  [class.location-fields--advanced]=\"advanced()\"\r\n>\r\n  <div class=\"location-field\">\r\n    <label [for]=\"idPrefix() + '-provincia'\">\r\n      @if (advanced()) {\r\n        <svg lucideMapPin [size]=\"25\" aria-hidden=\"true\"></svg>\r\n      }\r\n      Provincia{{ required() ? ' *' : '' }}\r\n    </label>\r\n    @if (advanced()) {\r\n      <div class=\"location-select location-select--custom\">\r\n        <button\r\n          type=\"button\"\r\n          class=\"location-select__trigger\"\r\n          [id]=\"idPrefix() + '-provincia'\"\r\n          [disabled]=\"disabled() || cargandoProvincias()\"\r\n          [attr.aria-invalid]=\"invalidProvincia()\"\r\n          [attr.aria-required]=\"required()\"\r\n          [attr.aria-expanded]=\"provinciaAbierta()\"\r\n          aria-haspopup=\"listbox\"\r\n          [attr.aria-controls]=\"idPrefix() + '-provincias'\"\r\n          [attr.aria-activedescendant]=\"\r\n            provinciaAbierta() && indiceProvinciaActivo() >= 0\r\n              ? idPrefix() + '-provincia-opcion-' + indiceProvinciaActivo()\r\n              : null\r\n          \"\r\n          (click)=\"alternarProvincias()\"\r\n          (keydown)=\"tecladoProvincia($event)\"\r\n        >\r\n          <span>\r\n            {{\r\n              provinciaSeleccionada()?.nombre ??\r\n                (cargandoProvincias()\r\n                  ? 'Cargando provincias\u2026'\r\n                  : required()\r\n                    ? 'Seleccion\u00E1 una provincia'\r\n                    : 'Todas las provincias')\r\n            }}\r\n          </span>\r\n          <svg\r\n            lucideChevronDown\r\n            [size]=\"22\"\r\n            aria-hidden=\"true\"\r\n            [class.location-select__chevron--open]=\"provinciaAbierta()\"\r\n          ></svg>\r\n        </button>\r\n        @if (provinciaAbierta()) {\r\n          <ul\r\n            class=\"location-select__dropdown\"\r\n            role=\"listbox\"\r\n            [id]=\"idPrefix() + '-provincias'\"\r\n            aria-label=\"Provincias\"\r\n          >\r\n            @for (opcion of opcionesProvincia(); track opcion.id; let i = $index) {\r\n              <li\r\n                role=\"option\"\r\n                [id]=\"idPrefix() + '-provincia-opcion-' + i\"\r\n                [attr.aria-selected]=\"opcion.id === provinciaId()\"\r\n                [attr.data-active]=\"i === indiceProvinciaActivo()\"\r\n                (mousedown)=\"$event.preventDefault()\"\r\n                (click)=\"elegirProvincia(opcion.id)\"\r\n              >\r\n                {{ opcion.nombre }}\r\n              </li>\r\n            }\r\n          </ul>\r\n        }\r\n      </div>\r\n    } @else {\r\n      <div class=\"location-select\">\r\n        <select\r\n          [id]=\"idPrefix() + '-provincia'\"\r\n          [value]=\"provinciaId() ?? ''\"\r\n          [disabled]=\"disabled() || cargandoProvincias()\"\r\n          [attr.aria-invalid]=\"invalidProvincia()\"\r\n          [attr.aria-required]=\"required()\"\r\n          (change)=\"cambiarProvincia($event)\"\r\n        >\r\n          <option value=\"\" [disabled]=\"required()\">\r\n            {{\r\n              cargandoProvincias()\r\n                ? 'Cargando provincias\u2026'\r\n                : required()\r\n                  ? 'Seleccion\u00E1 una provincia'\r\n                  : 'Todas las provincias'\r\n            }}\r\n          </option>\r\n          @for (provincia of provincias(); track provincia.id) {\r\n            <option [value]=\"provincia.id\">{{ provincia.nombre }}</option>\r\n          }\r\n        </select>\r\n      </div>\r\n    }\r\n    @if (errorProvincias()) {\r\n      <span class=\"location-error\" role=\"alert\"\r\n        >{{ errorProvincias() }}\r\n        <button type=\"button\" (click)=\"cargarProvincias()\">Reintentar</button></span\r\n      >\r\n    } @else if (invalidProvincia()) {\r\n      <span class=\"location-error\">Eleg\u00ED una provincia.</span>\r\n    }\r\n  </div>\r\n\r\n  <div class=\"location-field\">\r\n    <label [for]=\"idPrefix() + '-localidad'\">\r\n      @if (advanced()) {\r\n        <svg lucideBuilding2 [size]=\"25\" aria-hidden=\"true\"></svg>\r\n      }\r\n      Localidad{{ required() ? ' *' : '' }}\r\n    </label>\r\n    <div class=\"combobox\">\r\n      <div class=\"combobox__input\" [class.combobox__input--invalid]=\"invalidLocalidad()\">\r\n        @if (advanced()) {\r\n          <svg class=\"combobox__search\" lucideSearch [size]=\"25\" aria-hidden=\"true\"></svg>\r\n        }\r\n        <input\r\n          #localidadInput\r\n          type=\"text\"\r\n          role=\"combobox\"\r\n          autocomplete=\"off\"\r\n          [id]=\"idPrefix() + '-localidad'\"\r\n          [value]=\"valorInput()\"\r\n          [placeholder]=\"placeholder()\"\r\n          [disabled]=\"bloqueado()\"\r\n          [attr.aria-expanded]=\"abierto()\"\r\n          aria-autocomplete=\"list\"\r\n          aria-haspopup=\"listbox\"\r\n          [attr.aria-controls]=\"idPrefix() + '-opciones'\"\r\n          [attr.aria-describedby]=\"idPrefix() + '-ayuda'\"\r\n          [attr.aria-invalid]=\"invalidLocalidad()\"\r\n          [attr.aria-required]=\"required()\"\r\n          [attr.aria-busy]=\"cargandoLocalidades()\"\r\n          [attr.aria-activedescendant]=\"\r\n            abierto() && indiceActivo() >= 0 ? idPrefix() + '-opcion-' + indiceActivo() : null\r\n          \"\r\n          (input)=\"escribir($event)\"\r\n          (focus)=\"abierto.set(true)\"\r\n          (blur)=\"cerrar()\"\r\n          (keydown)=\"teclado($event)\"\r\n        />\r\n        @if (valorInput() && !bloqueado()) {\r\n          <button\r\n            type=\"button\"\r\n            class=\"combobox__clear\"\r\n            aria-label=\"Limpiar localidad\"\r\n            (mousedown)=\"$event.preventDefault()\"\r\n            (click)=\"limpiar(localidadInput)\"\r\n          >\r\n            \u00D7\r\n          </button>\r\n        }\r\n      </div>\r\n      @if (abierto() && !bloqueado()) {\r\n        <div class=\"combobox__dropdown\">\r\n          <ul role=\"listbox\" [id]=\"idPrefix() + '-opciones'\" aria-label=\"Localidades\">\r\n            @for (localidad of sugerencias(); track localidad.id; let indice = $index) {\r\n              <li\r\n                role=\"option\"\r\n                [id]=\"idPrefix() + '-opcion-' + indice\"\r\n                [attr.aria-selected]=\"localidad.id === localidadId()\"\r\n                [attr.data-active]=\"indice === indiceActivo()\"\r\n                (mousedown)=\"$event.preventDefault()\"\r\n                (click)=\"elegir(localidad)\"\r\n              >\r\n                {{ localidad.nombre }}\r\n              </li>\r\n            }\r\n          </ul>\r\n          @if (!sugerencias().length) {\r\n            <p role=\"status\">\r\n              {{\r\n                localidades().length\r\n                  ? 'No encontramos localidades con ese nombre.'\r\n                  : 'No hay localidades cargadas en esta provincia.'\r\n              }}\r\n            </p>\r\n          } @else if (coincidencias().length > sugerencias().length) {\r\n            <p role=\"status\">Escrib\u00ED para acotar las {{ coincidencias().length }} localidades.</p>\r\n          }\r\n        </div>\r\n      }\r\n    </div>\r\n    <span\r\n      class=\"location-hint\"\r\n      [id]=\"idPrefix() + '-ayuda'\"\r\n      [class.location-error]=\"invalidLocalidad() || !!errorLocalidades()\"\r\n      aria-live=\"polite\"\r\n    >\r\n      @if (errorLocalidades()) {\r\n        {{ errorLocalidades() }}\r\n        <button type=\"button\" (click)=\"reintentarLocalidades()\">Reintentar</button>\r\n      } @else if (invalidLocalidad()) {\r\n        Eleg\u00ED una localidad de las sugerencias.\r\n      } @else if (provinciaId() && !localidadId() && texto()?.trim()) {\r\n        Seleccion\u00E1 una sugerencia para elegir la localidad.\r\n      } @else if (provinciaId() && !localidadId() && !required() && !cargandoLocalidades()) {\r\n        Todas las localidades de la provincia.\r\n      } @else if (provinciaId() && !localidadId() && !cargandoLocalidades()) {\r\n        Escrib\u00ED y seleccion\u00E1 una sugerencia.\r\n      }\r\n    </span>\r\n  </div>\r\n</div>\r\n", styles: [":host {\r\n  display: block;\r\n  min-width: 0;\r\n}\r\n.location-fields {\r\n  display: grid;\r\n  grid-template-columns: repeat(2, minmax(0, 1fr));\r\n  gap: 18px;\r\n}\r\n.location-field {\r\n  min-width: 0;\r\n}\r\nlabel {\r\n  display: block;\r\n  margin-bottom: 7px;\r\n  color: #344054;\r\n  font-size: 0.8rem;\r\n  font-weight: 700;\r\n}\r\nselect,\r\n.combobox__input {\r\n  width: 100%;\r\n  min-height: 44px;\r\n  border: 1px solid #d0d5dd;\r\n  border-radius: 8px;\r\n  background: white;\r\n  color: var(--color-text, #101828);\r\n  font: inherit;\r\n}\r\nselect {\r\n  padding: 10px 12px;\r\n}\r\nselect:focus,\r\n.combobox__input:focus-within {\r\n  outline: 3px solid rgb(14 70 161 / 13%);\r\n  border-color: var(--color-secondary, #0e47a1);\r\n}\r\nselect[aria-invalid='true'],\r\n.combobox__input--invalid {\r\n  border-color: var(--color-danger, #dc2626);\r\n}\r\nselect:disabled,\r\n.combobox__input:has(input:disabled) {\r\n  background: #f8fafc;\r\n  color: #667085;\r\n  cursor: not-allowed;\r\n}\r\n.combobox {\r\n  position: relative;\r\n}\r\n.combobox__input {\r\n  display: flex;\r\n  align-items: center;\r\n}\r\n.combobox__input input {\r\n  width: 100%;\r\n  min-width: 0;\r\n  padding: 10px 12px;\r\n  border: 0;\r\n  outline: none;\r\n  background: transparent;\r\n  color: inherit;\r\n  font: inherit;\r\n}\r\n.combobox__input input::placeholder {\r\n  color: #667085;\r\n  font-size: 0.82rem;\r\n}\r\n.combobox__clear {\r\n  flex: 0 0 auto;\r\n  width: 36px;\r\n  height: 36px;\r\n  margin-right: 3px;\r\n  border: 0;\r\n  border-radius: 6px;\r\n  background: transparent;\r\n  color: #475467;\r\n  font-size: 1.3rem;\r\n  cursor: pointer;\r\n}\r\n.combobox__clear:hover {\r\n  background: #f1f5f9;\r\n}\r\n.combobox__clear:focus-visible {\r\n  outline: 2px solid var(--color-secondary, #0e47a1);\r\n}\r\n.combobox__dropdown {\r\n  position: absolute;\r\n  z-index: 50;\r\n  top: calc(100% + 5px);\r\n  left: 0;\r\n  right: 0;\r\n  overflow: hidden;\r\n  border: 1px solid #d0d5dd;\r\n  border-radius: 8px;\r\n  background: white;\r\n  box-shadow: 0 10px 28px rgb(16 24 40 / 15%);\r\n}\r\nul {\r\n  max-height: 240px;\r\n  margin: 0;\r\n  padding: 5px;\r\n  overflow-y: auto;\r\n  list-style: none;\r\n}\r\nli {\r\n  padding: 10px;\r\n  border-radius: 5px;\r\n  color: #101828;\r\n  font-size: 0.88rem;\r\n  overflow-wrap: anywhere;\r\n  cursor: pointer;\r\n}\r\nli:hover,\r\nli[data-active='true'] {\r\n  background: #eef4ff;\r\n}\r\nli[aria-selected='true'] {\r\n  color: #0e47a1;\r\n  font-weight: 700;\r\n}\r\n.combobox__dropdown p {\r\n  margin: 0;\r\n  padding: 10px 12px;\r\n  border-top: 1px solid #eef2f6;\r\n  color: #667085;\r\n  font-size: 0.76rem;\r\n}\r\n.location-hint,\r\n.location-error {\r\n  display: block;\r\n  margin-top: 5px;\r\n  color: #667085;\r\n  font-size: 0.75rem;\r\n}\r\n.location-error {\r\n  color: var(--color-danger, #dc2626);\r\n}\r\n.location-hint button,\r\n.location-error button {\r\n  padding: 0;\r\n  border: 0;\r\n  background: none;\r\n  color: var(--color-secondary, #0e47a1);\r\n  font: inherit;\r\n  text-decoration: underline;\r\n  cursor: pointer;\r\n}\r\n.location-fields--compact {\r\n  gap: 12px;\r\n}\r\n.location-fields--compact label {\r\n  font-size: 0.67rem;\r\n}\r\n.location-fields--compact select,\r\n.location-fields--compact input {\r\n  font-size: 0.81rem;\r\n}\r\n@media (max-width: 600px) {\r\n  .location-fields {\r\n    grid-template-columns: 1fr;\r\n    gap: 12px;\r\n  }\r\n}\r\n\r\n.location-fields--advanced {\r\n  gap: 1.25rem;\r\n\r\n  label {\r\n    display: flex;\r\n    align-items: center;\r\n    gap: 0.4rem;\r\n    margin-bottom: 0.35rem;\r\n    color: #fff;\r\n    font-size: 0.8rem;\r\n    font-weight: 750;\r\n    line-height: 20px;\r\n  }\r\n\r\n  label svg {\r\n    flex-shrink: 0;\r\n    width: 20px;\r\n    height: 20px;\r\n  }\r\n\r\n  .location-select {\r\n    position: relative;\r\n  }\r\n\r\n  .location-select > svg {\r\n    position: absolute;\r\n    top: 50%;\r\n    right: 0.8rem;\r\n    width: 18px;\r\n    height: 18px;\r\n    transform: translateY(-50%);\r\n    color: #101f3d;\r\n    pointer-events: none;\r\n  }\r\n\r\n  select,\r\n  .combobox__input {\r\n    height: 44px;\r\n    border-radius: 8px;\r\n    color: #101f3d;\r\n    font-size: 0.9rem;\r\n  }\r\n\r\n  select {\r\n    appearance: none;\r\n    padding: 0 2.5rem 0 0.8rem;\r\n  }\r\n\r\n  .combobox__search {\r\n    flex-shrink: 0;\r\n    margin-left: 0.8rem;\r\n    width: 20px;\r\n    height: 20px;\r\n    color: #7c879b;\r\n  }\r\n\r\n  .combobox__input input {\r\n    padding: 0.6rem 0.8rem;\r\n  }\r\n\r\n  .combobox__input input::placeholder {\r\n    color: #7c879b;\r\n    font-size: 0.85rem;\r\n    opacity: 1;\r\n  }\r\n\r\n  .location-hint {\r\n    color: #fff;\r\n  }\r\n\r\n  .location-hint:empty {\r\n    display: none;\r\n  }\r\n\r\n  .location-error {\r\n    padding: 0.35rem 0.5rem;\r\n    border-radius: 5px;\r\n    background: #fff;\r\n    color: #b42318;\r\n  }\r\n\r\n  @media (max-width: 600px) {\r\n    gap: 0.85rem;\r\n  }\r\n}\r\n\r\n.location-select__trigger {\r\n  display: flex;\r\n  width: 100%;\r\n  height: 44px;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: 0.5rem;\r\n  padding: 0 0.8rem;\r\n  border: 1px solid #d0d5dd;\r\n  border-radius: 8px;\r\n  background: #fff;\r\n  color: #101f3d;\r\n  font: inherit;\r\n  font-size: 0.9rem;\r\n  text-align: left;\r\n  cursor: pointer;\r\n}\r\n\r\n.location-select__trigger span {\r\n  min-width: 0;\r\n  overflow: hidden;\r\n  text-overflow: ellipsis;\r\n  white-space: nowrap;\r\n}\r\n\r\n.location-select__trigger svg {\r\n  flex: 0 0 auto;\r\n  width: 18px;\r\n  height: 18px;\r\n  transition: transform 0.2s ease;\r\n}\r\n\r\n.location-select__trigger:focus-visible {\r\n  outline: 3px solid rgb(14 70 161 / 13%);\r\n  border-color: var(--color-secondary, #0e47a1);\r\n}\r\n\r\n.location-select__trigger:disabled {\r\n  background: #f8fafc;\r\n  color: #667085;\r\n  cursor: not-allowed;\r\n}\r\n\r\n.location-select__chevron--open {\r\n  transform: rotate(180deg);\r\n}\r\n\r\n.location-select__dropdown {\r\n  position: absolute;\r\n  z-index: 60;\r\n  top: calc(100% + 5px);\r\n  right: 0;\r\n  left: 0;\r\n  max-height: 240px;\r\n  margin: 0;\r\n  padding: 5px;\r\n  overflow-y: auto;\r\n  border: 1px solid #d0d5dd;\r\n  border-radius: 8px;\r\n  background: #fff;\r\n  box-shadow: 0 10px 28px rgb(16 24 40 / 15%);\r\n  list-style: none;\r\n}\r\n\r\n.location-select__dropdown li {\r\n  padding: 10px;\r\n  border-radius: 5px;\r\n  color: #101828;\r\n  font-size: 0.88rem;\r\n  overflow-wrap: anywhere;\r\n  cursor: pointer;\r\n}\r\n\r\n.location-select__dropdown li:hover,\r\n.location-select__dropdown li[data-active='true'] {\r\n  background: #eef4ff;\r\n}\r\n\r\n.location-select__dropdown li[aria-selected='true'] {\r\n  color: #0e47a1;\r\n  font-weight: 700;\r\n}\r\n"] }]
    }], () => [], { idPrefix: [{ type: i0.Input, args: [{ isSignal: true, alias: "idPrefix", required: true }] }], provinciaId: [{ type: i0.Input, args: [{ isSignal: true, alias: "provinciaId", required: false }] }], localidadId: [{ type: i0.Input, args: [{ isSignal: true, alias: "localidadId", required: false }] }], required: [{ type: i0.Input, args: [{ isSignal: true, alias: "required", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], invalidProvincia: [{ type: i0.Input, args: [{ isSignal: true, alias: "invalidProvincia", required: false }] }], invalidLocalidad: [{ type: i0.Input, args: [{ isSignal: true, alias: "invalidLocalidad", required: false }] }], compact: [{ type: i0.Input, args: [{ isSignal: true, alias: "compact", required: false }] }], advanced: [{ type: i0.Input, args: [{ isSignal: true, alias: "advanced", required: false }] }], provinciaChange: [{ type: i0.Output, args: ["provinciaChange"] }], localidadChange: [{ type: i0.Output, args: ["localidadChange"] }], nombresChange: [{ type: i0.Output, args: ["nombresChange"] }], touched: [{ type: i0.Output, args: ["touched"] }], alPresionarFuera: [{
            type: HostListener,
            args: ['document:pointerdown', ['$event']]
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(SelectorUbicacionComponent, { className: "SelectorUbicacionComponent", filePath: "src/app/shared/components/selector-ubicacion/selector-ubicacion.component.ts", lineNumber: 43 }); })();
