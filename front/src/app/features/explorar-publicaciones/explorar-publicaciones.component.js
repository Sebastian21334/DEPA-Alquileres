import { Component, DestroyRef, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { LucideMap, LucideSearch } from '@lucide/angular';
import { AdvancedFiltersComponent } from '../home/components/advanced-filters/advanced-filters.component';
import { ListingGridComponent } from '../home/components/listing-grid/listing-grid.component';
import { ListingService } from '../home/listing.service';
import { MapaPublicacionesComponent } from './mapa-publicaciones.component';
import { CatalogoService } from '../../shared/services/catalogo.service';
import { admiteReservasPorFecha, codigoMoneda, } from '../../shared/models/catalogo.model';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
const _c0 = () => [];
const _c1 = () => ({ vista: "mapa", pagina: null });
function ExplorarPublicacionesComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 2)(1, "a", 9);
    i0.ɵɵtext(2, "\u2190 ");
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4, "Volver al inicio");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "div", 10)(6, "div")(7, "p");
    i0.ɵɵtext(8, "Cat\u00E1logo de alquileres");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "h1");
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "span");
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(13, "div", 11)(14, "button", 12);
    i0.ɵɵlistener("click", function ExplorarPublicacionesComponent_Conditional_1_Template_button_click_14_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.seleccionarCategoria(null)); });
    i0.ɵɵtext(15, " Todos ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "button", 13);
    i0.ɵɵlistener("click", function ExplorarPublicacionesComponent_Conditional_1_Template_button_click_16_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.seleccionarCategoria("largo-plazo")); });
    i0.ɵɵtext(17, " Largo plazo ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "button", 14);
    i0.ɵɵlistener("click", function ExplorarPublicacionesComponent_Conditional_1_Template_button_click_18_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.seleccionarCategoria("temporales")); });
    i0.ɵɵtext(19, " Temporales ");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(10);
    i0.ɵɵtextInterpolate(ctx_r1.titulo());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.descripcion());
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("modalidad-btn--active", !ctx_r1.categoria());
    i0.ɵɵattribute("aria-pressed", !ctx_r1.categoria());
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("modalidad-btn--active", ctx_r1.categoria() === "largo-plazo");
    i0.ɵɵattribute("aria-pressed", ctx_r1.categoria() === "largo-plazo");
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("modalidad-btn--active", ctx_r1.categoria() === "temporales");
    i0.ɵɵattribute("aria-pressed", ctx_r1.categoria() === "temporales");
} }
function ExplorarPublicacionesComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h1", 3);
    i0.ɵɵtext(1, "Mapa de alquileres");
    i0.ɵɵelementEnd();
} }
function ExplorarPublicacionesComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 4);
} if (rf & 2) {
    i0.ɵɵnextContext();
    const buscador_r3 = i0.ɵɵreference(10);
    i0.ɵɵproperty("ngTemplateOutlet", buscador_r3);
} }
function ExplorarPublicacionesComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6);
    i0.ɵɵelementContainer(1, 4);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const buscador_r3 = i0.ɵɵreference(10);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngTemplateOutlet", buscador_r3);
} }
function ExplorarPublicacionesComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 7)(1, "button", 12);
    i0.ɵɵlistener("click", function ExplorarPublicacionesComponent_Conditional_6_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.seleccionarCategoria(null)); });
    i0.ɵɵelement(2, "span", 15);
    i0.ɵɵtext(3, "Todos");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 14);
    i0.ɵɵlistener("click", function ExplorarPublicacionesComponent_Conditional_6_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.seleccionarCategoria("temporales")); });
    i0.ɵɵelement(5, "span", 15);
    i0.ɵɵtext(6, "Temporal");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "button", 13);
    i0.ɵɵlistener("click", function ExplorarPublicacionesComponent_Conditional_6_Template_button_click_7_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.seleccionarCategoria("largo-plazo")); });
    i0.ɵɵelement(8, "span", 15);
    i0.ɵɵtext(9, "Largo plazo");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵclassProp("modalidad-btn--active", !ctx_r1.categoria());
    i0.ɵɵattribute("aria-pressed", !ctx_r1.categoria());
    i0.ɵɵadvance(3);
    i0.ɵɵclassProp("modalidad-btn--active", ctx_r1.categoria() === "temporales");
    i0.ɵɵattribute("aria-pressed", ctx_r1.categoria() === "temporales");
    i0.ɵɵadvance(3);
    i0.ɵɵclassProp("modalidad-btn--active", ctx_r1.categoria() === "largo-plazo");
    i0.ɵɵattribute("aria-pressed", ctx_r1.categoria() === "largo-plazo");
} }
function ExplorarPublicacionesComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-mapa-publicaciones", 8);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("filtros", ctx_r1.filtrosMapa());
} }
function ExplorarPublicacionesComponent_Conditional_8_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "nav", 20)(1, "button", 21);
    i0.ɵɵlistener("click", function ExplorarPublicacionesComponent_Conditional_8_Conditional_5_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.irAPagina(ctx_r1.resultado().pagina - 1)); });
    i0.ɵɵtext(2, " Anterior ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "button", 21);
    i0.ɵɵlistener("click", function ExplorarPublicacionesComponent_Conditional_8_Conditional_5_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.irAPagina(ctx_r1.resultado().pagina + 1)); });
    i0.ɵɵtext(6, " Siguiente ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.resultado().pagina === 1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("P\u00E1gina ", ctx_r1.resultado().pagina, " de ", ctx_r1.resultado().totalPaginas);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.resultado().pagina === ctx_r1.resultado().totalPaginas);
} }
function ExplorarPublicacionesComponent_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 16)(1, "a", 17);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 18);
    i0.ɵɵtext(3, " Ver mapa ");
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "app-listing-grid", 19);
    i0.ɵɵlistener("sortChange", function ExplorarPublicacionesComponent_Conditional_8_Template_app_listing_grid_sortChange_4_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.cambiarOrden($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, ExplorarPublicacionesComponent_Conditional_8_Conditional_5_Template, 7, 4, "nav", 20);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction0(9, _c0))("queryParams", i0.ɵɵpureFunction0(10, _c1));
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 19);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("total", ctx_r1.resultado().total)("listings", ctx_r1.resultado().datos)("loading", ctx_r1.cargando())("error", ctx_r1.error())("sortOrder", ctx_r1.orden());
    i0.ɵɵadvance();
    i0.ɵɵconditional(!ctx_r1.cargando() && !ctx_r1.error() && ctx_r1.resultado().totalPaginas > 1 ? 5 : -1);
} }
function ExplorarPublicacionesComponent_ng_template_9_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 22);
    i0.ɵɵlistener("ngSubmit", function ExplorarPublicacionesComponent_ng_template_9_Template_form_ngSubmit_0_listener($event) { i0.ɵɵrestoreView(_r7); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.buscarTexto($event)); });
    i0.ɵɵelementStart(1, "label", 23);
    i0.ɵɵtext(2, "Buscar publicaciones");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 24);
    i0.ɵɵelement(4, "input", 25);
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(5, "button", 26);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(6, "svg", 27);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(7, "span");
    i0.ɵɵtext(8, "Buscar");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("formGroup", ctx_r1.searchForm);
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 19);
} }
export class ExplorarPublicacionesComponent {
    ordenesValidos = [
        'recientes',
        'antiguas',
        'precio-menor',
        'precio-mayor',
        'titulo',
    ];
    api = inject(ListingService);
    catalogos = inject(CatalogoService);
    route = inject(ActivatedRoute);
    router = inject(Router);
    destroyRef = inject(DestroyRef);
    fb = inject(FormBuilder);
    solicitudListado;
    resultado = signal({
        datos: [],
        pagina: 1,
        limite: 12,
        total: 0,
        totalPaginas: 0,
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resultado" }] : /* istanbul ignore next */ []));
    cargando = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cargando" }] : /* istanbul ignore next */ []));
    error = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    categoria = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "categoria" }] : /* istanbul ignore next */ []));
    orden = signal('recientes', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "orden" }] : /* istanbul ignore next */ []));
    vistaMapa = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "vistaMapa" }] : /* istanbul ignore next */ []));
    filtrosMapa = signal({}, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "filtrosMapa" }] : /* istanbul ignore next */ []));
    modalidades = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "modalidades" }] : /* istanbul ignore next */ []));
    tiposPropiedad = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tiposPropiedad" }] : /* istanbul ignore next */ []));
    monedasPrecio = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "monedasPrecio" }] : /* istanbul ignore next */ []));
    busqueda = this.fb.nonNullable.control('');
    searchForm = this.fb.group({
        busqueda: this.busqueda,
    });
    form = this.fb.nonNullable.group({
        idModalidad: null,
        idProvincia: null,
        idsCiudad: [[]],
        idsTipoPropiedad: [[]],
        // Moneda del rango de precio: solo filtra cuando hay un precio cargado.
        idTipoMoneda: null,
        ambientesSeleccionados: [[]],
        precioMin: null,
        precioMax: null,
        superficieMin: null,
    });
    constructor() {
        this.cargarCatalogos();
        this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
            const pagina = Math.max(1, Number(params.get('pagina')) || 1);
            const categoria = params.get('categoria');
            const orden = params.get('orden');
            this.busqueda.setValue(params.get('q') ?? '', { emitEvent: false });
            this.vistaMapa.set(params.get('vista') === 'mapa');
            this.categoria.set(categoria);
            this.orden.set(this.esOrdenValido(orden) ? orden : 'recientes');
            this.sincronizarModalidad(categoria);
            this.cargar(pagina);
        });
        this.form.valueChanges
            .pipe(debounceTime(250), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
            this.buscar();
        });
    }
    seleccionarCategoria(categoria) {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParamsHandling: 'merge',
            queryParams: { categoria, q: this.terminoBusqueda() || null, orden: this.orden(), pagina: 1 },
        });
    }
    buscarTexto(evento) {
        evento?.preventDefault();
        this.router.navigate([], {
            relativeTo: this.route,
            queryParamsHandling: 'merge',
            queryParams: {
                categoria: this.categoria(),
                q: this.terminoBusqueda() || null,
                orden: this.orden(),
                pagina: 1,
            },
        });
    }
    buscar() {
        if (!this.vistaMapa() && this.resultado().pagina !== 1) {
            this.router.navigate([], {
                relativeTo: this.route,
                queryParamsHandling: 'merge',
                queryParams: {
                    categoria: this.categoria(),
                    q: this.terminoBusqueda() || null,
                    orden: this.orden(),
                    pagina: 1,
                },
            });
            return;
        }
        this.cargar(1);
    }
    irAPagina(pagina) {
        if (pagina < 1 || pagina > this.resultado().totalPaginas)
            return;
        this.router.navigate([], {
            relativeTo: this.route,
            queryParamsHandling: 'merge',
            queryParams: {
                categoria: this.categoria(),
                q: this.terminoBusqueda() || null,
                orden: this.orden(),
                pagina,
            },
        });
    }
    cambiarOrden(orden) {
        if (!this.esOrdenValido(orden) || orden === this.orden())
            return;
        this.router.navigate([], {
            relativeTo: this.route,
            queryParamsHandling: 'merge',
            queryParams: {
                categoria: this.categoria(),
                q: this.terminoBusqueda() || null,
                orden,
                pagina: 1,
            },
        });
    }
    titulo() {
        const etiquetas = {
            temporales: 'Alquileres temporales',
            'largo-plazo': 'Alquileres de largo plazo',
            'villa-maria': 'Alquileres en Villa María',
            reservadas: 'Publicaciones más reservadas',
        };
        return this.categoria()
            ? (etiquetas[this.categoria()] ?? 'Publicaciones')
            : 'Todas las publicaciones';
    }
    descripcion() {
        switch (this.categoria()) {
            case 'temporales':
                return 'Encontrá el alojamiento ideal para tu próxima estadía, escapada o viaje.';
            case 'largo-plazo':
                return 'Encontrá tu próximo hogar y el espacio ideal para tu día a día.';
            default:
                return 'Explorá las propiedades disponibles y encontrá el alquiler que se adapte a vos.';
        }
    }
    cargarCatalogos() {
        this.catalogos.getModalidades().subscribe({
            next: (modalidades) => {
                this.modalidades.set(modalidades);
                this.sincronizarModalidad(this.categoria());
            },
            error: (error) => console.error('No se pudieron cargar las modalidades', error),
        });
        this.catalogos
            .getTiposPropiedad()
            .subscribe({ next: (tipos) => this.tiposPropiedad.set(tipos) });
        this.catalogos.getTiposMoneda().subscribe({
            next: (tipos) => {
                const monedas = tipos
                    .map((tipo) => ({ id: tipo.id, codigo: codigoMoneda(tipo) }))
                    .filter((moneda) => moneda.codigo !== null)
                    .sort((a, b) => a.codigo.localeCompare(b.codigo));
                this.monedasPrecio.set(monedas);
                // Pesos de entrada, sin volver a buscar: la moneda todavía no filtra nada.
                if (this.form.controls.idTipoMoneda.value == null) {
                    this.form.controls.idTipoMoneda.setValue(monedas[0]?.id ?? null, { emitEvent: false });
                }
            },
        });
    }
    sincronizarModalidad(categoria) {
        const esTemporal = categoria === 'temporales';
        const esLargoPlazo = categoria === 'largo-plazo';
        const modalidad = this.modalidades().find((item) => esTemporal ? admiteReservasPorFecha(item) : esLargoPlazo && !admiteReservasPorFecha(item));
        const idModalidad = modalidad?.id ?? null;
        if (this.form.controls.idModalidad.value !== idModalidad) {
            this.form.controls.idModalidad.setValue(idModalidad);
        }
    }
    cargar(pagina) {
        this.solicitudListado?.unsubscribe();
        const filtros = this.form.getRawValue();
        const conPrecio = filtros.precioMin != null || filtros.precioMax != null;
        const consulta = {
            categoria: this.categoria() ?? undefined,
            busqueda: this.terminoBusqueda(),
            idProvincia: filtros.idProvincia ?? undefined,
            idsCiudad: filtros.idsCiudad,
            idsTipoPropiedad: filtros.idsTipoPropiedad,
            idsTipoMoneda: conPrecio && filtros.idTipoMoneda != null ? [filtros.idTipoMoneda] : [],
            precioMin: filtros.precioMin,
            precioMax: filtros.precioMax,
            superficieMin: filtros.superficieMin,
            ambientes: filtros.ambientesSeleccionados,
        };
        if (this.vistaMapa()) {
            this.filtrosMapa.set(consulta);
            return;
        }
        this.cargando.set(true);
        this.error.set(null);
        this.solicitudListado = this.api
            .getActivas({ ...consulta, pagina, limite: 12, orden: this.orden() })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (resultado) => {
                this.resultado.set(resultado);
                this.cargando.set(false);
            },
            error: (error) => {
                this.error.set(error.message);
                this.cargando.set(false);
            },
        });
    }
    terminoBusqueda() {
        return this.busqueda.value.trim();
    }
    esOrdenValido(orden) {
        return this.ordenesValidos.includes(orden);
    }
    static ɵfac = function ExplorarPublicacionesComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ExplorarPublicacionesComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ExplorarPublicacionesComponent, selectors: [["app-explorar-publicaciones"]], decls: 11, vars: 13, consts: [["buscador", ""], [1, "explore"], [1, "explore-head"], [1, "sr-only"], [3, "ngTemplateOutlet"], [3, "form", "tiposPropiedad", "monedas", "categoria", "compacto", "busquedaActiva"], ["busqueda-mapa", "", 1, "busqueda-mapa"], ["modalidades-mapa", "", "role", "group", "aria-label", "Modalidad de alquiler", 1, "modalidades", "modalidades--map"], [3, "filtros"], ["routerLink", "/", 1, "explore-head__back"], [1, "explore-head__content"], ["role", "group", "aria-label", "Tipo de alquiler", 1, "modalidades"], ["type", "button", 1, "modalidad-btn", "modalidad-btn--todos", 3, "click"], ["type", "button", 1, "modalidad-btn", "modalidad-btn--primary", 3, "click"], ["type", "button", 1, "modalidad-btn", "modalidad-btn--secondary", 3, "click"], ["aria-hidden", "true", 1, "modalidad-btn__dot"], [1, "explore-view-row"], ["queryParamsHandling", "merge", 1, "explore-view", "explore-view--map", 3, "routerLink", "queryParams"], ["lucideMap", "", "aria-hidden", "true", 3, "size"], [3, "sortChange", "total", "listings", "loading", "error", "sortOrder"], ["aria-label", "Paginaci\u00F3n de publicaciones", 1, "pagination"], ["type", "button", 3, "click", "disabled"], ["role", "search", 1, "catalog-search", 3, "ngSubmit", "formGroup"], ["for", "catalog-search"], [1, "catalog-search__field"], ["id", "catalog-search", "type", "search", "formControlName", "busqueda", "placeholder", "T\u00EDtulo, descripci\u00F3n, ciudad, provincia, modalidad...", "autocomplete", "off"], ["type", "submit"], ["lucideSearch", "", "aria-hidden", "true", 3, "size"]], template: function ExplorarPublicacionesComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "main", 1);
            i0.ɵɵconditionalCreate(1, ExplorarPublicacionesComponent_Conditional_1_Template, 20, 11, "section", 2)(2, ExplorarPublicacionesComponent_Conditional_2_Template, 2, 0, "h1", 3);
            i0.ɵɵconditionalCreate(3, ExplorarPublicacionesComponent_Conditional_3_Template, 1, 1, "ng-container", 4);
            i0.ɵɵelementStart(4, "app-advanced-filters", 5);
            i0.ɵɵconditionalCreate(5, ExplorarPublicacionesComponent_Conditional_5_Template, 2, 1, "div", 6);
            i0.ɵɵconditionalCreate(6, ExplorarPublicacionesComponent_Conditional_6_Template, 10, 9, "div", 7);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(7, ExplorarPublicacionesComponent_Conditional_7_Template, 1, 1, "app-mapa-publicaciones", 8)(8, ExplorarPublicacionesComponent_Conditional_8_Template, 6, 11);
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(9, ExplorarPublicacionesComponent_ng_template_9_Template, 9, 2, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor);
        } if (rf & 2) {
            i0.ɵɵclassProp("explore--map", ctx.vistaMapa());
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.vistaMapa() ? 1 : 2);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(!ctx.vistaMapa() ? 3 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("form", ctx.form)("tiposPropiedad", ctx.tiposPropiedad())("monedas", ctx.monedasPrecio())("categoria", ctx.categoria())("compacto", ctx.vistaMapa())("busquedaActiva", ctx.filtrosMapa().busqueda ?? "");
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.vistaMapa() ? 5 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.vistaMapa() ? 6 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.vistaMapa() ? 7 : 8);
        } }, dependencies: [ReactiveFormsModule, i1.ɵNgNoValidate, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.FormGroupDirective, i1.FormControlName, RouterLink,
            NgTemplateOutlet,
            LucideMap,
            LucideSearch,
            AdvancedFiltersComponent,
            ListingGridComponent,
            MapaPublicacionesComponent], styles: [".explore[_ngcontent-%COMP%] { min-height: calc(100dvh - 70px); padding: 0 0 3rem; background: linear-gradient(180deg, #f5f8fc 0, #f8fafc 360px, #f3f6fa 100%); }\r\n.explore-head[_ngcontent-%COMP%] { max-width: 1216px; margin: 0 auto; padding: 1.6rem 0 1.45rem; }.explore-head__back[_ngcontent-%COMP%] { display: inline-flex; gap: .45rem; color: var(--%NS%color-secondary); font-size: .82rem; font-weight: 800; text-decoration: none; }.explore-head__back[_ngcontent-%COMP%]:hover   span[_ngcontent-%COMP%] { text-decoration: underline; }\r\n.explore-head__content[_ngcontent-%COMP%] { display: flex; align-items: end; justify-content: space-between; gap: 2rem; margin-top: 1.15rem; }.explore-head[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0 0 .35rem; color: var(--%NS%color-primary); font-size: .72rem; font-weight: 900; letter-spacing: .06em; text-transform: uppercase; }.explore-head[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] { margin: 0; color: #101f3d; font-size: clamp(1.8rem, 3.1vw, 2.35rem); font-weight: 850; letter-spacing: -.04em; }.explore-head__content[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] { display: block; margin-top: .38rem; color: #65738a; font-size: .88rem; }\r\n.modalidades[_ngcontent-%COMP%] { display: inline-grid; grid-template-columns: repeat(3, minmax(110px, 1fr)); overflow: hidden; border: 1px solid #d4e0f5; border-radius: 7px; background: #fff; box-shadow: 0 4px 12px rgba(23, 57, 112, .08); }.modalidad-btn[_ngcontent-%COMP%] { min-height: 44px; border: 0; background: #f7f9ff; color: var(--%NS%color-secondary); font: inherit; font-size: .82rem; font-weight: 800; cursor: pointer; transition: background .2s ease, color .2s ease; }.modalidad-btn--primary.modalidad-btn--active[_ngcontent-%COMP%] { background: var(--%NS%color-primary); color: #fff; }.modalidad-btn--secondary.modalidad-btn--active[_ngcontent-%COMP%] { background: var(--%NS%color-secondary); color: #fff; }.modalidad-btn--todos.modalidad-btn--active[_ngcontent-%COMP%] { background: var(--%NS%color-accent); color: #fff; }.modalidad-btn[_ngcontent-%COMP%]:not(.modalidad-btn--active):hover { background: #edf3ff; }\r\n.catalog-search[_ngcontent-%COMP%] { max-width: 760px; margin: 0 auto 1.25rem; padding: 0 1rem; }.catalog-search[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] { display: block; margin: 0 0 .45rem; color: #334155; font-size: .82rem; font-weight: 800; }.catalog-search__field[_ngcontent-%COMP%] { display: flex; overflow: hidden; border: 1px solid #cbd5e1; border-radius: var(--%NS%radius-pill); background: #fff; box-shadow: 0 5px 18px rgba(23, 57, 112, .1); transition: border-color .2s ease, box-shadow .2s ease; }.catalog-search__field[_ngcontent-%COMP%]:focus-within { border-color: var(--%NS%color-secondary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--%NS%color-secondary) 18%, transparent), 0 7px 20px rgba(23, 57, 112, .13); }.catalog-search[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] { flex: 1; min-width: 0; padding: .82rem 1.15rem; border: 0; outline: 0; background: transparent; color: var(--%NS%color-text); font: inherit; }.catalog-search[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { display: inline-flex; align-items: center; justify-content: center; gap: .45rem; min-width: 118px; margin: 4px; padding: 0 1.15rem; border: 0; border-radius: var(--%NS%radius-pill); background: var(--%NS%color-primary); color: #fff; font: inherit; font-size: .88rem; font-weight: 800; cursor: pointer; transition: background .2s ease, transform .2s ease; }.catalog-search[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover { background: var(--%NS%color-primary-dark); transform: translateY(-1px); }\r\n.pagination[_ngcontent-%COMP%] { display: flex; justify-content: center; align-items: center; gap: 1rem; max-width: 1216px; margin: 0 auto; padding: 1rem; color: #506078; font-size: .88rem; font-weight: 700; }.pagination[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { border: 0; border-radius: 7px; padding: .6rem 1rem; background: var(--%NS%color-primary); color: #fff; font: inherit; cursor: pointer; }.pagination[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:disabled { opacity: .45; cursor: not-allowed; }\r\n@media (max-width: 1248px) { .explore-head[_ngcontent-%COMP%] { padding-inline: 1rem; } }\r\n@media (max-width: 680px) { .explore-head__content[_ngcontent-%COMP%] { align-items: flex-start; flex-direction: column; gap: 1.25rem; }.modalidades[_ngcontent-%COMP%] { width: 100%; grid-template-columns: repeat(3, minmax(0, 1fr)); }.modalidad-btn[_ngcontent-%COMP%] { min-height: 48px; } }\r\n@media (max-width: 480px) { .catalog-search[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { min-width: 48px; padding: 0 .8rem; }.catalog-search[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { display: none; } }\r\n.explore-view-row[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  justify-content: flex-end;\r\n  max-width: 1216px;\r\n  margin: .85rem auto 0;\r\n  padding: 0 1rem;\r\n}\r\n.explore-view[_ngcontent-%COMP%] {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  gap: .4rem;\r\n  min-height: 40px;\r\n  padding: .45rem .8rem;\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: var(--%NS%radius-sm);\r\n  background: white;\r\n  color: var(--%NS%color-secondary);\r\n  font-size: .85rem;\r\n  font-weight: 800;\r\n  text-decoration: none;\r\n}\r\n.explore-view--map[_ngcontent-%COMP%] { background: var(--%NS%color-accent); color: var(--%NS%color-text); }\r\n.explore-view[_ngcontent-%COMP%]:hover { filter: brightness(.96); }\r\n.explore-view[_ngcontent-%COMP%]:focus-visible { outline: 2px solid var(--%NS%color-secondary); outline-offset: 2px; }\r\n.explore--map[_ngcontent-%COMP%] { padding: 0; background: white; }\r\n.busqueda-mapa[_ngcontent-%COMP%]   .catalog-search[_ngcontent-%COMP%] { margin: 0; padding: 0; }\r\n.busqueda-mapa[_ngcontent-%COMP%]   .catalog-search__field[_ngcontent-%COMP%] { box-shadow: none; border-radius: var(--%NS%radius-sm); }\r\n.busqueda-mapa[_ngcontent-%COMP%]   .catalog-search[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] { padding: .62rem .75rem; font-size: .85rem; }\r\n.busqueda-mapa[_ngcontent-%COMP%]   .catalog-search[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { min-width: 40px; padding-inline: .7rem; }\r\n.busqueda-mapa[_ngcontent-%COMP%]   .catalog-search[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { display: none; }\r\n\r\n.modalidades--map[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  width: 100%;\r\n  padding: 2px;\r\n  border: 1px solid #d8e0eb;\r\n  border-radius: var(--%NS%radius-sm);\r\n  background: #f4f7fb;\r\n  box-shadow: none;\r\n}\r\n.modalidades--map[_ngcontent-%COMP%]   .modalidad-btn[_ngcontent-%COMP%] {\r\n  flex: 1 0 auto;\r\n  min-height: 38px;\r\n  padding: 0 .65rem;\r\n  border-radius: 6px;\r\n  white-space: nowrap;\r\n  background: transparent;\r\n  color: #172640;\r\n}\r\n.modalidades--map[_ngcontent-%COMP%]   .modalidad-btn--active[_ngcontent-%COMP%], \r\n.modalidades--map[_ngcontent-%COMP%]   .modalidad-btn--%NS%active[_ngcontent-%COMP%]:hover { color: white; }\r\n.modalidades--map[_ngcontent-%COMP%]   .modalidad-btn--todos.modalidad-btn--active[_ngcontent-%COMP%] { background: var(--%NS%color-accent); }\r\n.modalidades--map[_ngcontent-%COMP%]   .modalidad-btn--secondary.modalidad-btn--active[_ngcontent-%COMP%] { background: var(--%NS%color-secondary); }\r\n.modalidades--map[_ngcontent-%COMP%]   .modalidad-btn--primary.modalidad-btn--active[_ngcontent-%COMP%] { background: var(--%NS%color-primary); }\r\n.modalidad-btn__dot[_ngcontent-%COMP%] {\r\n  display: inline-block;\r\n  width: .48rem;\r\n  height: .48rem;\r\n  margin-right: .34rem;\r\n  border-radius: 50%;\r\n  background: var(--%NS%color-secondary);\r\n  vertical-align: .06em;\r\n}\r\n.modalidad-btn--primary[_ngcontent-%COMP%]   .modalidad-btn__dot[_ngcontent-%COMP%] { background: var(--%NS%color-primary); }\r\n.modalidad-btn--todos[_ngcontent-%COMP%]   .modalidad-btn__dot[_ngcontent-%COMP%] { background: var(--%NS%color-accent); }\r\n.modalidad-btn--active[_ngcontent-%COMP%]   .modalidad-btn__dot[_ngcontent-%COMP%] { background: currentColor; }\r\n@media (max-width: 640px) {\r\n  .modalidades--map[_ngcontent-%COMP%]   .modalidad-btn[_ngcontent-%COMP%] { min-height: 32px; padding-inline: .52rem; font-size: .75rem; }\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ExplorarPublicacionesComponent, [{
        type: Component,
        args: [{ selector: 'app-explorar-publicaciones', standalone: true, imports: [
                    ReactiveFormsModule,
                    RouterLink,
                    NgTemplateOutlet,
                    LucideMap,
                    LucideSearch,
                    AdvancedFiltersComponent,
                    ListingGridComponent,
                    MapaPublicacionesComponent,
                ], template: "<main class=\"explore\" [class.explore--map]=\"vistaMapa()\">\r\n  @if (!vistaMapa()) {\r\n    <section class=\"explore-head\">\r\n      <a routerLink=\"/\" class=\"explore-head__back\">\u2190 <span>Volver al inicio</span></a>\r\n      <div class=\"explore-head__content\">\r\n        <div>\r\n          <p>Cat\u00E1logo de alquileres</p>\r\n          <h1>{{ titulo() }}</h1>\r\n          <span>{{ descripcion() }}</span>\r\n        </div>\r\n        <div class=\"modalidades\" role=\"group\" aria-label=\"Tipo de alquiler\">\r\n          <button\r\n            type=\"button\"\r\n            class=\"modalidad-btn modalidad-btn--todos\"\r\n            [class.modalidad-btn--active]=\"!categoria()\"\r\n            [attr.aria-pressed]=\"!categoria()\"\r\n            (click)=\"seleccionarCategoria(null)\"\r\n          >\r\n            Todos\r\n          </button>\r\n          <button\r\n            type=\"button\"\r\n            class=\"modalidad-btn modalidad-btn--primary\"\r\n            [class.modalidad-btn--active]=\"categoria() === 'largo-plazo'\"\r\n            [attr.aria-pressed]=\"categoria() === 'largo-plazo'\"\r\n            (click)=\"seleccionarCategoria('largo-plazo')\"\r\n          >\r\n            Largo plazo\r\n          </button>\r\n          <button\r\n            type=\"button\"\r\n            class=\"modalidad-btn modalidad-btn--secondary\"\r\n            [class.modalidad-btn--active]=\"categoria() === 'temporales'\"\r\n            [attr.aria-pressed]=\"categoria() === 'temporales'\"\r\n            (click)=\"seleccionarCategoria('temporales')\"\r\n          >\r\n            Temporales\r\n          </button>\r\n        </div>\r\n      </div>\r\n    </section>\r\n  } @else {\r\n    <h1 class=\"sr-only\">Mapa de alquileres</h1>\r\n  }\r\n\r\n  @if (!vistaMapa()) {\r\n    <ng-container [ngTemplateOutlet]=\"buscador\" />\r\n  }\r\n  <app-advanced-filters\r\n    [form]=\"form\"\r\n    [tiposPropiedad]=\"tiposPropiedad()\"\r\n    [monedas]=\"monedasPrecio()\"\r\n    [categoria]=\"categoria()\"\r\n    [compacto]=\"vistaMapa()\"\r\n    [busquedaActiva]=\"filtrosMapa().busqueda ?? ''\"\r\n  >\r\n    @if (vistaMapa()) {\r\n      <div busqueda-mapa class=\"busqueda-mapa\"><ng-container [ngTemplateOutlet]=\"buscador\" /></div>\r\n    }\r\n    @if (vistaMapa()) {\r\n      <div modalidades-mapa class=\"modalidades modalidades--map\" role=\"group\" aria-label=\"Modalidad de alquiler\">\r\n        <button type=\"button\" class=\"modalidad-btn modalidad-btn--todos\"\r\n          [class.modalidad-btn--active]=\"!categoria()\"\r\n          [attr.aria-pressed]=\"!categoria()\" (click)=\"seleccionarCategoria(null)\"><span class=\"modalidad-btn__dot\" aria-hidden=\"true\"></span>Todos</button>\r\n        <button type=\"button\" class=\"modalidad-btn modalidad-btn--secondary\"\r\n          [class.modalidad-btn--active]=\"categoria() === 'temporales'\"\r\n          [attr.aria-pressed]=\"categoria() === 'temporales'\" (click)=\"seleccionarCategoria('temporales')\"><span class=\"modalidad-btn__dot\" aria-hidden=\"true\"></span>Temporal</button>\r\n        <button type=\"button\" class=\"modalidad-btn modalidad-btn--primary\"\r\n          [class.modalidad-btn--active]=\"categoria() === 'largo-plazo'\"\r\n          [attr.aria-pressed]=\"categoria() === 'largo-plazo'\" (click)=\"seleccionarCategoria('largo-plazo')\"><span class=\"modalidad-btn__dot\" aria-hidden=\"true\"></span>Largo plazo</button>\r\n      </div>\r\n    }\r\n  </app-advanced-filters>\r\n  @if (vistaMapa()) {\r\n    <app-mapa-publicaciones [filtros]=\"filtrosMapa()\" />\r\n  } @else {\r\n    <div class=\"explore-view-row\">\r\n      <a class=\"explore-view explore-view--map\" [routerLink]=\"[]\"\r\n        [queryParams]=\"{ vista: 'mapa', pagina: null }\" queryParamsHandling=\"merge\">\r\n        <svg lucideMap [size]=\"19\" aria-hidden=\"true\"></svg> Ver mapa\r\n      </a>\r\n    </div>\r\n    <app-listing-grid\r\n      [total]=\"resultado().total\"\r\n      [listings]=\"resultado().datos\"\r\n      [loading]=\"cargando()\"\r\n      [error]=\"error()\"\r\n      [sortOrder]=\"orden()\"\r\n      (sortChange)=\"cambiarOrden($event)\"\r\n    />\r\n    @if (!cargando() && !error() && resultado().totalPaginas > 1) {\r\n      <nav class=\"pagination\" aria-label=\"Paginaci\u00F3n de publicaciones\">\r\n        <button\r\n          type=\"button\"\r\n          (click)=\"irAPagina(resultado().pagina - 1)\"\r\n          [disabled]=\"resultado().pagina === 1\"\r\n        >\r\n          Anterior\r\n        </button>\r\n        <span>P\u00E1gina {{ resultado().pagina }} de {{ resultado().totalPaginas }}</span>\r\n        <button\r\n          type=\"button\"\r\n          (click)=\"irAPagina(resultado().pagina + 1)\"\r\n          [disabled]=\"resultado().pagina === resultado().totalPaginas\"\r\n        >\r\n          Siguiente\r\n        </button>\r\n      </nav>\r\n    }\r\n  }\r\n</main>\r\n\r\n<ng-template #buscador>\r\n  <form class=\"catalog-search\" [formGroup]=\"searchForm\" (ngSubmit)=\"buscarTexto($event)\" role=\"search\">\r\n    <label for=\"catalog-search\">Buscar publicaciones</label>\r\n    <div class=\"catalog-search__field\">\r\n      <input\r\n        id=\"catalog-search\"\r\n        type=\"search\"\r\n        formControlName=\"busqueda\"\r\n        placeholder=\"T\u00EDtulo, descripci\u00F3n, ciudad, provincia, modalidad...\"\r\n        autocomplete=\"off\"\r\n      />\r\n      <button type=\"submit\">\r\n        <svg lucideSearch [size]=\"19\" aria-hidden=\"true\"></svg>\r\n        <span>Buscar</span>\r\n      </button>\r\n    </div>\r\n  </form>\r\n</ng-template>\r\n", styles: [".explore { min-height: calc(100dvh - 70px); padding: 0 0 3rem; background: linear-gradient(180deg, #f5f8fc 0, #f8fafc 360px, #f3f6fa 100%); }\r\n.explore-head { max-width: 1216px; margin: 0 auto; padding: 1.6rem 0 1.45rem; }.explore-head__back { display: inline-flex; gap: .45rem; color: var(--color-secondary); font-size: .82rem; font-weight: 800; text-decoration: none; }.explore-head__back:hover span { text-decoration: underline; }\r\n.explore-head__content { display: flex; align-items: end; justify-content: space-between; gap: 2rem; margin-top: 1.15rem; }.explore-head p { margin: 0 0 .35rem; color: var(--color-primary); font-size: .72rem; font-weight: 900; letter-spacing: .06em; text-transform: uppercase; }.explore-head h1 { margin: 0; color: #101f3d; font-size: clamp(1.8rem, 3.1vw, 2.35rem); font-weight: 850; letter-spacing: -.04em; }.explore-head__content > div > span { display: block; margin-top: .38rem; color: #65738a; font-size: .88rem; }\r\n.modalidades { display: inline-grid; grid-template-columns: repeat(3, minmax(110px, 1fr)); overflow: hidden; border: 1px solid #d4e0f5; border-radius: 7px; background: #fff; box-shadow: 0 4px 12px rgba(23, 57, 112, .08); }.modalidad-btn { min-height: 44px; border: 0; background: #f7f9ff; color: var(--color-secondary); font: inherit; font-size: .82rem; font-weight: 800; cursor: pointer; transition: background .2s ease, color .2s ease; }.modalidad-btn--primary.modalidad-btn--active { background: var(--color-primary); color: #fff; }.modalidad-btn--secondary.modalidad-btn--active { background: var(--color-secondary); color: #fff; }.modalidad-btn--todos.modalidad-btn--active { background: var(--color-accent); color: #fff; }.modalidad-btn:not(.modalidad-btn--active):hover { background: #edf3ff; }\r\n.catalog-search { max-width: 760px; margin: 0 auto 1.25rem; padding: 0 1rem; }.catalog-search label { display: block; margin: 0 0 .45rem; color: #334155; font-size: .82rem; font-weight: 800; }.catalog-search__field { display: flex; overflow: hidden; border: 1px solid #cbd5e1; border-radius: var(--radius-pill); background: #fff; box-shadow: 0 5px 18px rgba(23, 57, 112, .1); transition: border-color .2s ease, box-shadow .2s ease; }.catalog-search__field:focus-within { border-color: var(--color-secondary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-secondary) 18%, transparent), 0 7px 20px rgba(23, 57, 112, .13); }.catalog-search input { flex: 1; min-width: 0; padding: .82rem 1.15rem; border: 0; outline: 0; background: transparent; color: var(--color-text); font: inherit; }.catalog-search button { display: inline-flex; align-items: center; justify-content: center; gap: .45rem; min-width: 118px; margin: 4px; padding: 0 1.15rem; border: 0; border-radius: var(--radius-pill); background: var(--color-primary); color: #fff; font: inherit; font-size: .88rem; font-weight: 800; cursor: pointer; transition: background .2s ease, transform .2s ease; }.catalog-search button:hover { background: var(--color-primary-dark); transform: translateY(-1px); }\r\n.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; max-width: 1216px; margin: 0 auto; padding: 1rem; color: #506078; font-size: .88rem; font-weight: 700; }.pagination button { border: 0; border-radius: 7px; padding: .6rem 1rem; background: var(--color-primary); color: #fff; font: inherit; cursor: pointer; }.pagination button:disabled { opacity: .45; cursor: not-allowed; }\r\n@media (max-width: 1248px) { .explore-head { padding-inline: 1rem; } }\r\n@media (max-width: 680px) { .explore-head__content { align-items: flex-start; flex-direction: column; gap: 1.25rem; }.modalidades { width: 100%; grid-template-columns: repeat(3, minmax(0, 1fr)); }.modalidad-btn { min-height: 48px; } }\r\n@media (max-width: 480px) { .catalog-search button { min-width: 48px; padding: 0 .8rem; }.catalog-search button span { display: none; } }\r\n.explore-view-row {\r\n  display: flex;\r\n  justify-content: flex-end;\r\n  max-width: 1216px;\r\n  margin: .85rem auto 0;\r\n  padding: 0 1rem;\r\n}\r\n.explore-view {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  gap: .4rem;\r\n  min-height: 40px;\r\n  padding: .45rem .8rem;\r\n  border: 1px solid var(--color-border);\r\n  border-radius: var(--radius-sm);\r\n  background: white;\r\n  color: var(--color-secondary);\r\n  font-size: .85rem;\r\n  font-weight: 800;\r\n  text-decoration: none;\r\n}\r\n.explore-view--map { background: var(--color-accent); color: var(--color-text); }\r\n.explore-view:hover { filter: brightness(.96); }\r\n.explore-view:focus-visible { outline: 2px solid var(--color-secondary); outline-offset: 2px; }\r\n.explore--map { padding: 0; background: white; }\r\n.busqueda-mapa .catalog-search { margin: 0; padding: 0; }\r\n.busqueda-mapa .catalog-search__field { box-shadow: none; border-radius: var(--radius-sm); }\r\n.busqueda-mapa .catalog-search input { padding: .62rem .75rem; font-size: .85rem; }\r\n.busqueda-mapa .catalog-search button { min-width: 40px; padding-inline: .7rem; }\r\n.busqueda-mapa .catalog-search button span { display: none; }\r\n\r\n.modalidades--map {\r\n  display: flex;\r\n  width: 100%;\r\n  padding: 2px;\r\n  border: 1px solid #d8e0eb;\r\n  border-radius: var(--radius-sm);\r\n  background: #f4f7fb;\r\n  box-shadow: none;\r\n}\r\n.modalidades--map .modalidad-btn {\r\n  flex: 1 0 auto;\r\n  min-height: 38px;\r\n  padding: 0 .65rem;\r\n  border-radius: 6px;\r\n  white-space: nowrap;\r\n  background: transparent;\r\n  color: #172640;\r\n}\r\n.modalidades--map .modalidad-btn--active,\r\n.modalidades--map .modalidad-btn--active:hover { color: white; }\r\n.modalidades--map .modalidad-btn--todos.modalidad-btn--active { background: var(--color-accent); }\r\n.modalidades--map .modalidad-btn--secondary.modalidad-btn--active { background: var(--color-secondary); }\r\n.modalidades--map .modalidad-btn--primary.modalidad-btn--active { background: var(--color-primary); }\r\n.modalidad-btn__dot {\r\n  display: inline-block;\r\n  width: .48rem;\r\n  height: .48rem;\r\n  margin-right: .34rem;\r\n  border-radius: 50%;\r\n  background: var(--color-secondary);\r\n  vertical-align: .06em;\r\n}\r\n.modalidad-btn--primary .modalidad-btn__dot { background: var(--color-primary); }\r\n.modalidad-btn--todos .modalidad-btn__dot { background: var(--color-accent); }\r\n.modalidad-btn--active .modalidad-btn__dot { background: currentColor; }\r\n@media (max-width: 640px) {\r\n  .modalidades--map .modalidad-btn { min-height: 32px; padding-inline: .52rem; font-size: .75rem; }\r\n}\r\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ExplorarPublicacionesComponent, { className: "ExplorarPublicacionesComponent", filePath: "src/app/features/explorar-publicaciones/explorar-publicaciones.component.ts", lineNumber: 37 }); })();
