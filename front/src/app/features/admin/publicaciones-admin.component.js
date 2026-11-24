import { isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { LucideCheck, LucideSearch } from '@lucide/angular';
import { ToastService } from '../../core/services/toast.service';
import { AdminService } from './admin.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
const _forTrack0 = ($index, $item) => $item.valor;
const _forTrack1 = ($index, $item) => $item.id;
function PublicacionesAdminComponent_For_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 5);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r1 = ctx.$implicit;
    i0.ɵɵproperty("value", item_r1.valor);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r1.etiqueta);
} }
function PublicacionesAdminComponent_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 9);
    i0.ɵɵtext(1, "Cargando publicaciones\u2026");
    i0.ɵɵelementEnd();
} }
function PublicacionesAdminComponent_Conditional_17_For_14_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const publication_r3 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Motivo: ", publication_r3.motivo_baja_admin);
} }
function PublicacionesAdminComponent_Conditional_17_For_14_Conditional_16_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 25);
    i0.ɵɵlistener("click", function PublicacionesAdminComponent_Conditional_17_For_14_Conditional_16_Conditional_0_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r5); const publication_r3 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.reactivar(publication_r3)); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 26);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const publication_r3 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", ctx_r1.busy() !== null);
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 17);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.busy() === "publication-" + publication_r3.id ? "Reactivando\u2026" : "Reactivar", " ");
} }
function PublicacionesAdminComponent_Conditional_17_For_14_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵconditionalCreate(0, PublicacionesAdminComponent_Conditional_17_For_14_Conditional_16_Conditional_0_Template, 3, 3, "button", 24);
    i0.ɵɵelementStart(1, "button", 14);
    i0.ɵɵlistener("click", function PublicacionesAdminComponent_Conditional_17_For_14_Conditional_16_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r4); const publication_r3 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.openBaja(publication_r3)); });
    i0.ɵɵtext(2, " Actualizar baja / reenviar aviso ");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const publication_r3 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional(!publication_r3.eliminada ? 0 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.busy() !== null);
} }
function PublicacionesAdminComponent_Conditional_17_For_14_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 27);
    i0.ɵɵlistener("click", function PublicacionesAdminComponent_Conditional_17_For_14_Conditional_17_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r6); const publication_r3 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.openBaja(publication_r3)); });
    i0.ɵɵtext(1, " Dar de baja ");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("disabled", ctx_r1.busy() !== null);
} }
function PublicacionesAdminComponent_Conditional_17_For_14_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "tr")(1, "td", 28)(2, "form", 29);
    i0.ɵɵlistener("ngSubmit", function PublicacionesAdminComponent_Conditional_17_For_14_Conditional_18_Template_form_ngSubmit_2_listener() { i0.ɵɵrestoreView(_r7); const publication_r3 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.confirmBaja(publication_r3)); });
    i0.ɵɵelementStart(3, "label", 30);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "textarea", 31);
    i0.ɵɵtwoWayListener("ngModelChange", function PublicacionesAdminComponent_Conditional_17_For_14_Conditional_18_Template_textarea_ngModelChange_5_listener($event) { i0.ɵɵrestoreView(_r7); const ctx_r1 = i0.ɵɵnextContext(3); i0.ɵɵtwoWayBindingSet(ctx_r1.bajaReason, $event) || (ctx_r1.bajaReason = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(6, "p");
    i0.ɵɵtext(7, "El due\u00F1o ver\u00E1 este motivo en Mis publicaciones y recibir\u00E1 un correo. La publicaci\u00F3n se conservar\u00E1 desactivada.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "div")(9, "button", 14);
    i0.ɵɵlistener("click", function PublicacionesAdminComponent_Conditional_17_For_14_Conditional_18_Template_button_click_9_listener() { i0.ɵɵrestoreView(_r7); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.bajaId.set(null)); });
    i0.ɵɵtext(10, "Cancelar");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "button", 32);
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd()()()()();
} if (rf & 2) {
    const publication_r3 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("for", "baja-" + publication_r3.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("Motivo de la baja de \u201C", publication_r3.titulo, "\u201D");
    i0.ɵɵadvance();
    i0.ɵɵproperty("id", "baja-" + publication_r3.id);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.bajaReason);
    i0.ɵɵproperty("disabled", ctx_r1.busy() !== null);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", ctx_r1.busy() !== null);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.busy() !== null || !ctx_r1.bajaReason.trim());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.busy() === "publication-" + publication_r3.id ? "Procesando\u2026" : "Confirmar baja y notificar", " ");
} }
function PublicacionesAdminComponent_Conditional_17_For_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td", 17)(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "small");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "td", 18);
    i0.ɵɵtext(7);
    i0.ɵɵelementStart(8, "small");
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(10, "td", 19)(11, "span", 20);
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(13, PublicacionesAdminComponent_Conditional_17_For_14_Conditional_13_Template, 2, 1, "small");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "td", 21)(15, "div", 22);
    i0.ɵɵconditionalCreate(16, PublicacionesAdminComponent_Conditional_17_For_14_Conditional_16_Template, 3, 2)(17, PublicacionesAdminComponent_Conditional_17_For_14_Conditional_17_Template, 2, 1, "button", 23);
    i0.ɵɵelementEnd()()();
    i0.ɵɵconditionalCreate(18, PublicacionesAdminComponent_Conditional_17_For_14_Conditional_18_Template, 13, 8, "tr");
} if (rf & 2) {
    const publication_r3 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(publication_r3.titulo);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("#", publication_r3.id, " \u00B7 ", publication_r3.direccion);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", publication_r3.anunciante?.usuario?.nombre, " ", publication_r3.anunciante?.usuario?.apellido);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(publication_r3.anunciante?.usuario?.email);
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("status--blocked", !publication_r3.activa);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(publication_r3.motivo_baja_admin ? "Desactivada por un administrador" : publication_r3.activa ? "Activa" : "Inactiva");
    i0.ɵɵadvance();
    i0.ɵɵconditional(publication_r3.motivo_baja_admin ? 13 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(publication_r3.motivo_baja_admin ? 16 : 17);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.bajaId() === publication_r3.id ? 18 : -1);
} }
function PublicacionesAdminComponent_Conditional_17_ForEmpty_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td", 33);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.estado() === "bajas" ? "No hay publicaciones dadas de baja." : "No se encontraron publicaciones.");
} }
function PublicacionesAdminComponent_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 10)(1, "table", 15)(2, "thead")(3, "tr")(4, "th");
    i0.ɵɵtext(5, "Publicaci\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "th");
    i0.ɵɵtext(7, "Anunciante");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "th");
    i0.ɵɵtext(9, "Estado");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "th", 16);
    i0.ɵɵtext(11, "Acciones");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(12, "tbody");
    i0.ɵɵrepeaterCreate(13, PublicacionesAdminComponent_Conditional_17_For_14_Template, 19, 12, null, null, _forTrack1, false, PublicacionesAdminComponent_Conditional_17_ForEmpty_15_Template, 3, 1, "tr");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(13);
    i0.ɵɵrepeater(ctx_r1.publications());
} }
export class PublicacionesAdminComponent {
    api = inject(AdminService);
    toast = inject(ToastService);
    destroyRef = inject(DestroyRef);
    publicationsRequest;
    publications = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "publications" }] : /* istanbul ignore next */ []));
    publicationQuery = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "publicationQuery" }] : /* istanbul ignore next */ []));
    estado = signal('todas', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "estado" }] : /* istanbul ignore next */ []));
    estados = [
        { valor: 'todas', etiqueta: 'Todas' },
        { valor: 'activas', etiqueta: 'Activas' },
        { valor: 'inactivas', etiqueta: 'Inactivas' },
        { valor: 'bajas', etiqueta: 'Dadas de baja' },
    ];
    bajaId = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "bajaId" }] : /* istanbul ignore next */ []));
    bajaReason = '';
    publicationsPage = signal(1, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "publicationsPage" }] : /* istanbul ignore next */ []));
    publicationsTotal = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "publicationsTotal" }] : /* istanbul ignore next */ []));
    publicationsPages = signal(1, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "publicationsPages" }] : /* istanbul ignore next */ []));
    // El panel padre lo usa para su indicador global de carga.
    publicationsLoading = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "publicationsLoading" }] : /* istanbul ignore next */ []));
    busy = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "busy" }] : /* istanbul ignore next */ []));
    constructor() {
        if (isPlatformBrowser(inject(PLATFORM_ID)))
            this.loadPublications(1);
    }
    recargar() {
        this.loadPublications(this.publicationsPage());
    }
    searchPublications(value) {
        this.publicationQuery.set(value);
        this.loadPublications(1);
    }
    cambiarEstado(valor) {
        if (valor === this.estado())
            return;
        this.estado.set(valor);
        this.loadPublications(1);
    }
    loadPublications(page) {
        if (page < 1 || page > this.publicationsPages())
            return;
        this.publicationsRequest?.unsubscribe();
        this.publicationsLoading.set(true);
        this.bajaId.set(null);
        this.publicationsRequest = this.api.listarPublicaciones(page, this.publicationQuery().trim(), this.estado())
            .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (result) => {
                this.publications.set(result.datos);
                this.publicationsPage.set(result.pagina);
                this.publicationsTotal.set(result.total);
                this.publicationsPages.set(result.totalPaginas);
                this.publicationsLoading.set(false);
            },
            error: (error) => {
                this.publications.set([]);
                this.publicationsTotal.set(0);
                this.publicationsPage.set(1);
                this.publicationsPages.set(1);
                this.toast.mostrar(error.message, 'error');
                this.publicationsLoading.set(false);
            },
        });
    }
    openBaja(publication) {
        this.bajaReason = publication.motivo_baja_admin ?? '';
        this.bajaId.set(publication.id);
    }
    reactivar(publicacion) {
        if (this.busy())
            return;
        this.ejecutar(`publication-${publicacion.id}`, this.api.reactivarPublicacion(publicacion.id), () => {
            this.loadPublications(this.publicationsPage());
            this.toast.mostrar('Publicación reactivada. Queda inactiva hasta que el anunciante la active.', 'exito');
        });
    }
    confirmBaja(publication) {
        if (this.busy())
            return;
        const motivo = this.bajaReason.trim();
        if (!motivo || motivo.length > 500)
            return;
        this.ejecutar(`publication-${publication.id}`, this.api.darDeBajaPublicacion(publication.id, motivo), ({ correoEnviado }) => {
            this.loadPublications(this.publicationsPage());
            this.bajaId.set(null);
            if (!correoEnviado) {
                this.toast.mostrar('La publicación fue desactivada, pero no se pudo enviar el correo. Podés reenviar el aviso con «Actualizar baja / reenviar aviso».', 'advertencia');
                return;
            }
            this.toast.mostrar('Publicación desactivada. El motivo quedó guardado en la cuenta del dueño.', 'exito');
        });
    }
    ejecutar(clave, solicitud, exito) {
        this.busy.set(clave);
        solicitud.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (valor) => {
                exito(valor);
                this.busy.set(null);
            },
            error: (error) => {
                this.toast.mostrar(error.message, 'error');
                this.busy.set(null);
            },
        });
    }
    static ɵfac = function PublicacionesAdminComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || PublicacionesAdminComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: PublicacionesAdminComponent, selectors: [["app-publicaciones-admin"]], decls: 26, vars: 11, consts: [[1, "panel", "admin-module"], [1, "panel__title", "panel__title--users"], [1, "publication-filters"], [1, "state-filter"], [3, "ngModelChange", "ngModel"], [3, "value"], [1, "search"], ["lucideSearch", "", 3, "size"], ["type", "search", "aria-label", "Buscar publicaciones", "placeholder", "Buscar por t\u00EDtulo, ID o anunciante", "maxlength", "200", 3, "ngModelChange", "ngModel"], [1, "empty"], [1, "table-wrap"], [1, "pagination"], ["role", "status"], [1, "pagination__actions"], ["type", "button", 1, "button", "button--ghost", 3, "click", "disabled"], ["role", "table", 1, "responsive-table"], [1, "right"], ["data-label", "Publicaci\u00F3n"], ["data-label", "Anunciante"], ["data-label", "Estado"], [1, "status"], ["data-label", "Acciones", 1, "right"], [1, "row-actions"], ["type", "button", 1, "button", "button--danger-outline", 3, "disabled"], ["type", "button", 1, "button", "button--success", 3, "disabled"], ["type", "button", 1, "button", "button--success", 3, "click", "disabled"], ["lucideCheck", "", "aria-hidden", "true", 3, "size"], ["type", "button", 1, "button", "button--danger-outline", 3, "click", "disabled"], ["colspan", "4"], [1, "reject-box", 3, "ngSubmit"], [3, "for"], ["name", "motivoBaja", "required", "", "maxlength", "500", "placeholder", "Explic\u00E1 por qu\u00E9 se desactiva esta publicaci\u00F3n", 3, "ngModelChange", "id", "ngModel", "disabled"], ["type", "submit", 1, "button", "button--danger", 3, "disabled"], ["colspan", "4", 1, "empty"]], template: function PublicacionesAdminComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "div", 1)(2, "div")(3, "h2");
            i0.ɵɵtext(4, "Publicaciones");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "p");
            i0.ɵɵtext(6, "Da de baja publicaciones de cualquier anunciante e informale el motivo por correo.");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(7, "div", 2)(8, "label", 3);
            i0.ɵɵtext(9, "Estado ");
            i0.ɵɵelementStart(10, "select", 4);
            i0.ɵɵlistener("ngModelChange", function PublicacionesAdminComponent_Template_select_ngModelChange_10_listener($event) { return ctx.cambiarEstado($event); });
            i0.ɵɵrepeaterCreate(11, PublicacionesAdminComponent_For_12_Template, 2, 2, "option", 5, _forTrack0);
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(13, "label", 6);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(14, "svg", 7);
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(15, "input", 8);
            i0.ɵɵlistener("ngModelChange", function PublicacionesAdminComponent_Template_input_ngModelChange_15_listener($event) { return ctx.searchPublications($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(16, PublicacionesAdminComponent_Conditional_16_Template, 2, 0, "p", 9)(17, PublicacionesAdminComponent_Conditional_17_Template, 16, 1, "div", 10);
            i0.ɵɵelementStart(18, "nav", 11)(19, "span", 12);
            i0.ɵɵtext(20);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(21, "div", 13)(22, "button", 14);
            i0.ɵɵlistener("click", function PublicacionesAdminComponent_Template_button_click_22_listener() { return ctx.loadPublications(ctx.publicationsPage() - 1); });
            i0.ɵɵtext(23, "Anterior");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(24, "button", 14);
            i0.ɵɵlistener("click", function PublicacionesAdminComponent_Template_button_click_24_listener() { return ctx.loadPublications(ctx.publicationsPage() + 1); });
            i0.ɵɵtext(25, "Siguiente");
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            i0.ɵɵadvance(10);
            i0.ɵɵproperty("ngModel", ctx.estado());
            i0.ɵɵcontrol();
            i0.ɵɵadvance();
            i0.ɵɵrepeater(ctx.estados);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("size", 18);
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngModel", ctx.publicationQuery());
            i0.ɵɵcontrol();
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.publicationsLoading() ? 16 : 17);
            i0.ɵɵadvance(2);
            i0.ɵɵattribute("aria-label", ctx.estado() === "bajas" ? "Paginaci\u00F3n de publicaciones dadas de baja" : "Paginaci\u00F3n de publicaciones");
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate4("", ctx.publicationsTotal(), " ", ctx.estado() === "bajas" ? "publicaciones dadas de baja" : "publicaciones", " \u00B7 P\u00E1gina ", ctx.publicationsPage(), " de ", ctx.publicationsPages());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.publicationsLoading() || ctx.busy() !== null || ctx.publicationsPage() <= 1);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.publicationsLoading() || ctx.busy() !== null || ctx.publicationsPage() >= ctx.publicationsPages());
        } }, dependencies: [FormsModule, i1.ɵNgNoValidate, i1.NgSelectOption, i1.ɵNgSelectMultipleOption, i1.DefaultValueAccessor, i1.SelectControlValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.RequiredValidator, i1.MaxLengthValidator, i1.NgModel, i1.NgForm, LucideCheck, LucideSearch], styles: ["@use './admin-shared';\r\n\r\n[_nghost-%COMP%] {\r\n  display: block;\r\n}\r\n[hidden][_nghost-%COMP%] {\r\n  display: none;\r\n}\r\n\r\n.publication-filters[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  flex-wrap: wrap;\r\n  align-items: center;\r\n  justify-content: flex-end;\r\n  gap: 12px;\r\n}\r\n.state-filter[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  color: #60727c;\r\n  font-size: 0.88rem;\r\n  font-weight: 650;\r\n}\r\n.state-filter[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\r\n  min-width: 150px;\r\n}\r\n.row-actions[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  flex-wrap: wrap;\r\n  justify-content: flex-end;\r\n  gap: 8px;\r\n}\r\n\r\n@media (max-width: 700px) {\r\n  .publication-filters[_ngcontent-%COMP%] {\r\n    align-items: stretch;\r\n    flex-direction: column;\r\n  }\r\n  .state-filter[_ngcontent-%COMP%] {\r\n    align-items: stretch;\r\n    flex-direction: column;\r\n  }\r\n  .state-filter[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\r\n    width: 100%;\r\n  }\r\n  .publication-filters[_ngcontent-%COMP%]   .search[_ngcontent-%COMP%] {\r\n    width: 100%;\r\n    min-width: 0;\r\n  }\r\n  .row-actions[_ngcontent-%COMP%] {\r\n    align-items: stretch;\r\n    flex-direction: column;\r\n  }\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PublicacionesAdminComponent, [{
        type: Component,
        args: [{ selector: 'app-publicaciones-admin', standalone: true, imports: [FormsModule, LucideCheck, LucideSearch], template: "<section class=\"panel admin-module\">\r\n  <div class=\"panel__title panel__title--users\">\r\n    <div>\r\n      <h2>Publicaciones</h2>\r\n      <p>Da de baja publicaciones de cualquier anunciante e informale el motivo por correo.</p>\r\n    </div>\r\n    <div class=\"publication-filters\">\r\n      <label class=\"state-filter\">Estado\r\n        <select [ngModel]=\"estado()\" (ngModelChange)=\"cambiarEstado($event)\">\r\n          @for (item of estados; track item.valor) {\r\n            <option [value]=\"item.valor\">{{ item.etiqueta }}</option>\r\n          }\r\n        </select>\r\n      </label>\r\n      <label class=\"search\">\r\n        <svg lucideSearch [size]=\"18\"></svg>\r\n        <input type=\"search\" aria-label=\"Buscar publicaciones\" placeholder=\"Buscar por t\u00EDtulo, ID o anunciante\"\r\n          [ngModel]=\"publicationQuery()\" (ngModelChange)=\"searchPublications($event)\" maxlength=\"200\" />\r\n      </label>\r\n    </div>\r\n  </div>\r\n  @if (publicationsLoading()) {\r\n    <p class=\"empty\">Cargando publicaciones\u2026</p>\r\n  } @else {\r\n    <div class=\"table-wrap\">\r\n      <table class=\"responsive-table\" role=\"table\">\r\n        <thead><tr><th>Publicaci\u00F3n</th><th>Anunciante</th><th>Estado</th><th class=\"right\">Acciones</th></tr></thead>\r\n        <tbody>\r\n          @for (publication of publications(); track publication.id) {\r\n            <tr>\r\n              <td data-label=\"Publicaci\u00F3n\"><strong>{{ publication.titulo }}</strong><small>#{{ publication.id }} \u00B7 {{ publication.direccion }}</small></td>\r\n              <td data-label=\"Anunciante\">{{ publication.anunciante?.usuario?.nombre }} {{ publication.anunciante?.usuario?.apellido }}<small>{{ publication.anunciante?.usuario?.email }}</small></td>\r\n              <td data-label=\"Estado\"><span class=\"status\" [class.status--blocked]=\"!publication.activa\">{{ publication.motivo_baja_admin ? 'Desactivada por un administrador' : publication.activa ? 'Activa' : 'Inactiva' }}</span>\r\n                @if (publication.motivo_baja_admin) { <small>Motivo: {{ publication.motivo_baja_admin }}</small> }\r\n              </td>\r\n              <td data-label=\"Acciones\" class=\"right\">\r\n                <div class=\"row-actions\">\r\n                  @if (publication.motivo_baja_admin) {\r\n                    @if (!publication.eliminada) {\r\n                      <button type=\"button\" class=\"button button--success\"\r\n                        [disabled]=\"busy() !== null\" (click)=\"reactivar(publication)\">\r\n                        <svg lucideCheck [size]=\"17\" aria-hidden=\"true\"></svg>\r\n                        {{ busy() === 'publication-' + publication.id ? 'Reactivando\u2026' : 'Reactivar' }}\r\n                      </button>\r\n                    }\r\n                    <button type=\"button\" class=\"button button--ghost\"\r\n                      [disabled]=\"busy() !== null\" (click)=\"openBaja(publication)\">\r\n                      Actualizar baja / reenviar aviso\r\n                    </button>\r\n                  } @else {\r\n                    <button type=\"button\" class=\"button button--danger-outline\"\r\n                      [disabled]=\"busy() !== null\" (click)=\"openBaja(publication)\">\r\n                      Dar de baja\r\n                    </button>\r\n                  }\r\n                </div>\r\n              </td>\r\n            </tr>\r\n            @if (bajaId() === publication.id) {\r\n              <tr><td colspan=\"4\">\r\n                <form class=\"reject-box\" (ngSubmit)=\"confirmBaja(publication)\">\r\n                  <label [for]=\"'baja-' + publication.id\">Motivo de la baja de \u201C{{ publication.titulo }}\u201D</label>\r\n                  <textarea [id]=\"'baja-' + publication.id\" name=\"motivoBaja\" [(ngModel)]=\"bajaReason\"\r\n                    required maxlength=\"500\" [disabled]=\"busy() !== null\" placeholder=\"Explic\u00E1 por qu\u00E9 se desactiva esta publicaci\u00F3n\"></textarea>\r\n                  <p>El due\u00F1o ver\u00E1 este motivo en Mis publicaciones y recibir\u00E1 un correo. La publicaci\u00F3n se conservar\u00E1 desactivada.</p>\r\n                  <div>\r\n                    <button type=\"button\" class=\"button button--ghost\" [disabled]=\"busy() !== null\" (click)=\"bajaId.set(null)\">Cancelar</button>\r\n                    <button type=\"submit\" class=\"button button--danger\" [disabled]=\"busy() !== null || !bajaReason.trim()\">\r\n                      {{ busy() === 'publication-' + publication.id ? 'Procesando\u2026' : 'Confirmar baja y notificar' }}\r\n                    </button>\r\n                  </div>\r\n                </form>\r\n              </td></tr>\r\n            }\r\n          } @empty {\r\n            <tr><td colspan=\"4\" class=\"empty\">{{ estado() === 'bajas' ? 'No hay publicaciones dadas de baja.' : 'No se encontraron publicaciones.' }}</td></tr>\r\n          }\r\n        </tbody>\r\n      </table>\r\n    </div>\r\n  }\r\n  <nav class=\"pagination\" [attr.aria-label]=\"estado() === 'bajas' ? 'Paginaci\u00F3n de publicaciones dadas de baja' : 'Paginaci\u00F3n de publicaciones'\">\r\n    <span role=\"status\">{{ publicationsTotal() }} {{ estado() === 'bajas' ? 'publicaciones dadas de baja' : 'publicaciones' }} \u00B7 P\u00E1gina {{ publicationsPage() }} de {{ publicationsPages() }}</span>\r\n    <div class=\"pagination__actions\">\r\n      <button type=\"button\" class=\"button button--ghost\" (click)=\"loadPublications(publicationsPage() - 1)\"\r\n        [disabled]=\"publicationsLoading() || busy() !== null || publicationsPage() <= 1\">Anterior</button>\r\n      <button type=\"button\" class=\"button button--ghost\" (click)=\"loadPublications(publicationsPage() + 1)\"\r\n        [disabled]=\"publicationsLoading() || busy() !== null || publicationsPage() >= publicationsPages()\">Siguiente</button>\r\n    </div>\r\n  </nav>\r\n</section>\r\n", styles: ["@use './admin-shared';\r\n\r\n:host {\r\n  display: block;\r\n}\r\n:host([hidden]) {\r\n  display: none;\r\n}\r\n\r\n.publication-filters {\r\n  display: flex;\r\n  flex-wrap: wrap;\r\n  align-items: center;\r\n  justify-content: flex-end;\r\n  gap: 12px;\r\n}\r\n.state-filter {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  color: #60727c;\r\n  font-size: 0.88rem;\r\n  font-weight: 650;\r\n}\r\n.state-filter select {\r\n  min-width: 150px;\r\n}\r\n.row-actions {\r\n  display: flex;\r\n  flex-wrap: wrap;\r\n  justify-content: flex-end;\r\n  gap: 8px;\r\n}\r\n\r\n@media (max-width: 700px) {\r\n  .publication-filters {\r\n    align-items: stretch;\r\n    flex-direction: column;\r\n  }\r\n  .state-filter {\r\n    align-items: stretch;\r\n    flex-direction: column;\r\n  }\r\n  .state-filter select {\r\n    width: 100%;\r\n  }\r\n  .publication-filters .search {\r\n    width: 100%;\r\n    min-width: 0;\r\n  }\r\n  .row-actions {\r\n    align-items: stretch;\r\n    flex-direction: column;\r\n  }\r\n}\r\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(PublicacionesAdminComponent, { className: "PublicacionesAdminComponent", filePath: "src/app/features/admin/publicaciones-admin.component.ts", lineNumber: 18 }); })();
