import { SelectorUbicacionComponent } from '../../shared/components/selector-ubicacion/selector-ubicacion.component';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { concatMap, from, of, toArray, catchError } from 'rxjs';
import { GaleriaImagenesComponent } from '../../shared/components/galeria-imagenes/galeria-imagenes.component';
import { CargaFotosComponent } from '../../shared/components/carga-fotos/carga-fotos.component';
import { moverImagen } from '../../shared/utils/orden-imagenes';
import { filtrarImagenesPublicacion } from '../../shared/utils/imagenes-publicacion';
import { GestionPublicacionesService } from '../../shared/services/gestion-publicaciones.service';
import { AvailabilityService } from '../../shared/services/availability.service';
import { PublicacionFormulario } from '../../shared/forms/publicacion-formulario';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { SoloNumerosDirective } from '../../shared/directives/solo-numeros.directive';
import { AvailabilityCalendarComponent } from '../../shared/components/availability-calendar/availability-calendar.component';
import { LocationPickerComponent, } from '../../shared/components/location-picker/location-picker.component';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
const _forTrack0 = ($index, $item) => $item.id;
function CrearPublicacionComponent_For_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 15);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const m_r1 = ctx.$implicit;
    i0.ɵɵproperty("ngValue", m_r1.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(m_r1.nombre);
} }
function CrearPublicacionComponent_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 16);
    i0.ɵɵtext(1, "Eleg\u00ED el tipo de alquiler.");
    i0.ɵɵelementEnd();
} }
function CrearPublicacionComponent_For_38_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 15);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const t_r2 = ctx.$implicit;
    i0.ɵɵproperty("ngValue", t_r2.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(t_r2.nombre);
} }
function CrearPublicacionComponent_Conditional_39_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 16);
    i0.ɵɵtext(1, "Eleg\u00ED el tipo de propiedad.");
    i0.ɵɵelementEnd();
} }
function CrearPublicacionComponent_Conditional_44_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 16);
    i0.ɵɵtext(1, "Ingres\u00E1 un t\u00EDtulo de 15 a 255 caracteres, con letras o n\u00FAmeros. Solo se admiten espacios, comas, dos puntos y puntos.");
    i0.ɵɵelementEnd();
} }
function CrearPublicacionComponent_Conditional_62_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 16);
    i0.ɵɵtext(1, "Ingres\u00E1 la direcci\u00F3n.");
    i0.ɵɵelementEnd();
} }
function CrearPublicacionComponent_Conditional_74_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 16);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("El m\u00E1ximo es ", ctx_r2.formulario.ambientesMaximosTexto, " ambientes.");
} }
function CrearPublicacionComponent_Conditional_75_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 16);
    i0.ɵɵtext(1, "Ingres\u00E1 una cantidad entera de ambientes.");
    i0.ɵɵelementEnd();
} }
function CrearPublicacionComponent_Conditional_76_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 16);
    i0.ɵɵtext(1, "M\u00EDnimo 1 ambiente.");
    i0.ɵɵelementEnd();
} }
function CrearPublicacionComponent_Conditional_81_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 16);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("La superficie m\u00E1xima es ", ctx_r2.formulario.superficieMaximaTexto, " m\u00B2.");
} }
function CrearPublicacionComponent_Conditional_82_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 16);
    i0.ɵɵtext(1, "Ingres\u00E1 como m\u00E1ximo 2 decimales.");
    i0.ɵɵelementEnd();
} }
function CrearPublicacionComponent_Conditional_83_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 16);
    i0.ɵɵtext(1, "Ingres\u00E1 la superficie.");
    i0.ɵɵelementEnd();
} }
function CrearPublicacionComponent_Conditional_90_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-galeria-imagenes", 50);
    i0.ɵɵlistener("reordenar", function CrearPublicacionComponent_Conditional_90_Template_app_galeria_imagenes_reordenar_0_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.ordenarImagenes($event)); })("quitar", function CrearPublicacionComponent_Conditional_90_Template_app_galeria_imagenes_quitar_0_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.quitarImagen($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("fotos", ctx_r2.imagenes())("disabled", ctx_r2.enviando());
} }
function CrearPublicacionComponent_Conditional_91_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 37);
    i0.ɵɵtext(1, " Ten\u00E9s que agregar al menos una foto para publicar la propiedad. ");
    i0.ɵɵelementEnd();
} }
function CrearPublicacionComponent_Conditional_94_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 16);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.avisoImagenes());
} }
function CrearPublicacionComponent_For_108_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 15);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const m_r5 = ctx.$implicit;
    i0.ɵɵproperty("ngValue", m_r5.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(m_r5.nombre);
} }
function CrearPublicacionComponent_Conditional_109_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 16);
    i0.ɵɵtext(1, "Eleg\u00ED la moneda.");
    i0.ɵɵelementEnd();
} }
function CrearPublicacionComponent_Conditional_114_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 16);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("El precio m\u00E1ximo es ", ctx_r2.formulario.precioMaximoTexto, ".");
} }
function CrearPublicacionComponent_Conditional_115_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 16);
    i0.ɵɵtext(1, "Ingres\u00E1 como m\u00E1ximo 2 decimales.");
    i0.ɵɵelementEnd();
} }
function CrearPublicacionComponent_Conditional_116_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 16);
    i0.ɵɵtext(1, "Ingres\u00E1 un precio mayor a 0.");
    i0.ɵɵelementEnd();
} }
function CrearPublicacionComponent_Conditional_117_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 42)(1, "h2")(2, "span", 9);
    i0.ɵɵtext(3, "06");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(4, " D\u00EDas disponibles *");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 51);
    i0.ɵɵtext(6, " Habilit\u00E1 un d\u00EDa o un per\u00EDodo para recibir reservas. Despu\u00E9s vas a poder bloquear d\u00EDas puntuales desde \u201CModificar publicaci\u00F3n\u201D. ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "app-availability-calendar", 52);
    i0.ɵɵlistener("rangeChange", function CrearPublicacionComponent_Conditional_117_Template_app_availability_calendar_rangeChange_7_listener($event) { i0.ɵɵrestoreView(_r6); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.seleccionarDisponibilidad($event)); });
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(7);
    i0.ɵɵproperty("selectedStart", ctx_r2.disponibilidadInicio())("selectedEnd", ctx_r2.disponibilidadFin());
} }
function CrearPublicacionComponent_Conditional_120_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 44);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.error());
} }
function CrearPublicacionComponent_Conditional_122_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 46);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.progreso());
} }
// Alta de publicación para anunciantes verificados: POST /publicaciones con los
// datos del inmueble y luego POST /imagenes/publicacion/:id por cada foto. Los
// datos del inmueble usan el mismo PublicacionFormulario que la edición.
export class CrearPublicacionComponent {
    router = inject(Router);
    gestion = inject(GestionPublicacionesService);
    availability = inject(AvailabilityService);
    formulario = inject(PublicacionFormulario);
    form = this.formulario.form;
    disponibilidadInicio = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "disponibilidadInicio" }] : /* istanbul ignore next */ []));
    disponibilidadFin = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "disponibilidadFin" }] : /* istanbul ignore next */ []));
    imagenes = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "imagenes" }] : /* istanbul ignore next */ []));
    avisoImagenes = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "avisoImagenes" }] : /* istanbul ignore next */ []));
    enviando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enviando" }] : /* istanbul ignore next */ []));
    progreso = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "progreso" }] : /* istanbul ignore next */ []));
    error = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    constructor() {
        this.formulario.cargarCatalogos().subscribe({
            error: (err) => this.error.set(`No pudimos cargar las opciones del formulario: ${err.message}`),
        });
        this.form.controls.idModalidad.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
            if (!this.formulario.esTemporaria()) {
                this.disponibilidadInicio.set(null);
                this.disponibilidadFin.set(null);
            }
        });
        inject(DestroyRef).onDestroy(() => this.imagenes().forEach((img) => URL.revokeObjectURL(img.url)));
    }
    faltanFotos = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "faltanFotos" }] : /* istanbul ignore next */ []));
    agregarImagenes(archivos) {
        if (this.enviando())
            return;
        const { aceptadas, aviso } = filtrarImagenesPublicacion(archivos, this.imagenes().length);
        this.imagenes.update((lista) => [...lista, ...aceptadas.map((archivo) => ({ archivo, url: URL.createObjectURL(archivo) }))]);
        if (this.imagenes().length) {
            this.faltanFotos.set(false);
            if (this.error().startsWith('Agregá al menos una foto'))
                this.error.set('');
        }
        this.avisoImagenes.set(aviso);
    }
    quitarImagen(index) {
        if (this.enviando())
            return;
        const img = this.imagenes()[index];
        URL.revokeObjectURL(img.url);
        this.imagenes.update((lista) => lista.filter((_, i) => i !== index));
    }
    ordenarImagenes(cambio) {
        if (this.enviando())
            return;
        this.imagenes.update((lista) => moverImagen(lista, cambio.desde, cambio.hasta));
    }
    seleccionarDisponibilidad(range) {
        this.disponibilidadInicio.set(range.start);
        this.disponibilidadFin.set(range.end);
        if (this.error().startsWith('Elegí el período'))
            this.error.set('');
    }
    confirmarUbicacion(ubicacion) {
        this.formulario.confirmarUbicacion(ubicacion);
        if (this.error().startsWith('Confirmá la ubicación'))
            this.error.set('');
    }
    publicar() {
        if (this.enviando())
            return;
        const esTemporaria = this.formulario.esTemporaria();
        // Regla de negocio: no se puede publicar sin al menos una imagen.
        const sinFotos = this.imagenes().length === 0;
        this.faltanFotos.set(sinFotos);
        const sinDisponibilidad = esTemporaria && (!this.disponibilidadInicio() || !this.disponibilidadFin());
        const sinUbicacion = !this.formulario.ubicacionConfirmada();
        if (this.form.invalid || sinFotos || sinDisponibilidad || sinUbicacion) {
            this.form.markAllAsTouched();
            this.error.set(sinUbicacion && this.form.valid && !sinFotos && !sinDisponibilidad
                ? 'Confirmá la ubicación exacta en el mapa antes de publicar.'
                : sinDisponibilidad && this.form.valid && !sinFotos
                    ? 'Elegí el período de días disponibles para el alquiler temporal.'
                    : sinFotos && this.form.valid
                        ? 'Agregá al menos una foto de la propiedad para poder publicarla.'
                        : 'Revisá los campos marcados.');
            const destino = sinUbicacion
                ? 'ubicacion-mapa'
                : sinDisponibilidad
                    ? 'disponibilidad'
                    : sinFotos
                        ? 'fotos'
                        : null;
            if (destino)
                document.getElementById(destino)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        this.enviando.set(true);
        this.error.set('');
        this.progreso.set('Creando publicación…');
        const imagenes = this.imagenes();
        this.gestion
            .crear(this.formulario.payload())
            .pipe(
        // Las fotos se suben de a una para no saturar al backend (Sharp + Azure).
        concatMap((publicacion) => (esTemporaria
            ? (this.progreso.set('Guardando días disponibles…'),
                this.availability.addRange(publicacion.id, this.disponibilidadInicio(), this.disponibilidadFin()))
            : of([])).pipe(concatMap(() => from(imagenes).pipe(concatMap((img, i) => {
            this.progreso.set(`Subiendo imagen ${i + 1} de ${imagenes.length}…`);
            return this.gestion
                .subirImagen(publicacion.id, img.archivo)
                .pipe(catchError(() => of(null)));
        }), toArray(), concatMap((subidas) => of({ publicacion, fallidas: subidas.filter((s) => s === null).length })))))))
            .subscribe({
            next: ({ publicacion, fallidas }) => {
                this.enviando.set(false);
                if (fallidas) {
                    // La publicación ya existe: se lleva al anunciante a administrarla para reintentar.
                    const ninguna = fallidas === imagenes.length;
                    this.router.navigate(['/mis-publicaciones'], {
                        queryParams: {
                            aviso: ninguna
                                ? `No se pudo subir ninguna foto de "${publicacion.titulo}", así que todavía no está publicada. Agregale al menos una imagen para activarla.`
                                : `${fallidas} imagen(es) no se pudieron subir a "${publicacion.titulo}".`,
                        },
                    });
                }
                else {
                    this.router.navigate(['/publicaciones', publicacion.id]);
                }
            },
            error: (err) => {
                this.enviando.set(false);
                this.progreso.set('');
                this.error.set(err.message);
            },
        });
    }
    static ɵfac = function CrearPublicacionComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CrearPublicacionComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CrearPublicacionComponent, selectors: [["app-crear-publicacion"]], features: [i0.ɵɵProvidersFeature([PublicacionFormulario])], decls: 148, vars: 42, consts: [[1, "create"], [1, "create__wrap"], ["aria-label", "Ruta de navegaci\u00F3n", 1, "crumbs"], ["routerLink", "/"], ["aria-current", "page"], [1, "create__head"], [1, "create__layout"], ["novalidate", "", 1, "create__form", 3, "ngSubmit", "formGroup"], ["appReveal", "", 1, "step"], [1, "step__num"], [1, "acct-grid"], [1, "acct-field"], ["for", "modalidad"], ["id", "modalidad", "formControlName", "idModalidad"], ["disabled", "", 3, "ngValue"], [3, "ngValue"], [1, "acct-hint", "acct-hint--error"], ["for", "tipo"], ["id", "tipo", "formControlName", "idTipoPropiedad"], [1, "acct-field", "acct-span"], ["for", "titulo"], ["id", "titulo", "formControlName", "titulo", "maxlength", "255", "placeholder", "Ej.: Departamento luminoso con balc\u00F3n en el centro"], ["for", "descripcion"], ["id", "descripcion", "formControlName", "descripcion", "maxlength", "5000", "placeholder", "Describ\u00ED los ambientes, el estado de la propiedad y qu\u00E9 la hace especial."], [1, "acct-hint"], ["id", "ubicacion-mapa", "appReveal", "", 1, "step"], ["idPrefix", "crear-ubicacion", 1, "acct-span", 3, "provinciaChange", "localidadChange", "nombresChange", "touched", "required", "provinciaId", "localidadId", "disabled", "invalidProvincia", "invalidLocalidad"], ["for", "direccion"], ["id", "direccion", "formControlName", "direccion", "maxlength", "255", "placeholder", "Ej.: Jos\u00E9 Ingenieros 123"], [3, "locationConfirmed", "direccion", "ciudad", "provincia", "initialLatitude", "initialLongitude"], ["for", "ambientes"], ["id", "ambientes", "type", "number", "min", "1", "step", "1", "inputmode", "numeric", "appSoloNumeros", "0", "formControlName", "cantidad_ambientes", "placeholder", "Ej.: 2"], ["for", "superficie"], ["id", "superficie", "type", "number", "min", "1", "step", "0.01", "inputmode", "decimal", "appSoloNumeros", "2", "formControlName", "superficie", "placeholder", "Ej.: 45"], ["id", "fotos", "appReveal", "", 1, "step"], [3, "elegidas", "deshabilitado", "error"], [3, "fotos", "disabled"], ["role", "alert", 1, "acct-hint", "acct-hint--error"], ["for", "moneda"], ["id", "moneda", "formControlName", "idTipoMoneda"], ["for", "precio"], ["id", "precio", "type", "number", "min", "1", "step", "0.01", "inputmode", "decimal", "appSoloNumeros", "2", "formControlName", "precio", "placeholder", "Ej.: 350000"], ["id", "disponibilidad", "appReveal", "", 1, "step"], [1, "create__note"], ["role", "alert", 1, "acct-alert", "acct-alert--error"], [1, "acct-actions"], [1, "progress"], ["routerLink", "/mis-publicaciones", 1, "acct-btn", "acct-btn--ghost"], ["type", "submit", 1, "acct-btn", "acct-btn--primary", "shine", 3, "disabled"], ["appReveal", "right", 1, "tips", 3, "revealDelay"], [3, "reordenar", "quitar", "fotos", "disabled"], [1, "availability-help"], ["mode", "setup", 3, "rangeChange", "selectedStart", "selectedEnd"]], template: function CrearPublicacionComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "div", 1)(2, "nav", 2)(3, "a", 3);
            i0.ɵɵtext(4, "Inicio");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "span");
            i0.ɵɵtext(6, "/");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "span", 4);
            i0.ɵɵtext(8, "Crear publicaci\u00F3n");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(9, "header", 5)(10, "h1");
            i0.ɵɵtext(11, "Public\u00E1 tu pr\u00F3ximo gran encuentro");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(12, "p");
            i0.ɵɵtext(13, "Contanos c\u00F3mo es tu propiedad y conect\u00E1 con quienes est\u00E1n buscando su pr\u00F3ximo hogar.");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(14, "div", 6)(15, "form", 7);
            i0.ɵɵlistener("ngSubmit", function CrearPublicacionComponent_Template_form_ngSubmit_15_listener() { return ctx.publicar(); });
            i0.ɵɵelementStart(16, "section", 8)(17, "h2")(18, "span", 9);
            i0.ɵɵtext(19, "01");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(20, " Datos de la publicaci\u00F3n");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(21, "div", 10)(22, "div", 11)(23, "label", 12);
            i0.ɵɵtext(24, "Tipo de alquiler *");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(25, "select", 13)(26, "option", 14);
            i0.ɵɵtext(27, "Seleccion\u00E1 una opci\u00F3n");
            i0.ɵɵelementEnd();
            i0.ɵɵrepeaterCreate(28, CrearPublicacionComponent_For_29_Template, 2, 2, "option", 15, _forTrack0);
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵconditionalCreate(30, CrearPublicacionComponent_Conditional_30_Template, 2, 0, "span", 16);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(31, "div", 11)(32, "label", 17);
            i0.ɵɵtext(33, "Tipo de propiedad *");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(34, "select", 18)(35, "option", 14);
            i0.ɵɵtext(36, "Seleccion\u00E1 una opci\u00F3n");
            i0.ɵɵelementEnd();
            i0.ɵɵrepeaterCreate(37, CrearPublicacionComponent_For_38_Template, 2, 2, "option", 15, _forTrack0);
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵconditionalCreate(39, CrearPublicacionComponent_Conditional_39_Template, 2, 0, "span", 16);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(40, "div", 19)(41, "label", 20);
            i0.ɵɵtext(42, "T\u00EDtulo de la publicaci\u00F3n *");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(43, "input", 21);
            i0.ɵɵcontrolCreate();
            i0.ɵɵconditionalCreate(44, CrearPublicacionComponent_Conditional_44_Template, 2, 0, "span", 16);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(45, "div", 19)(46, "label", 22);
            i0.ɵɵtext(47, "Descripci\u00F3n *");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(48, "textarea", 23);
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementStart(49, "span", 24);
            i0.ɵɵtext(50);
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(51, "section", 25)(52, "h2")(53, "span", 9);
            i0.ɵɵtext(54, "02");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(55, " Ubicaci\u00F3n");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(56, "div", 10)(57, "app-selector-ubicacion", 26);
            i0.ɵɵlistener("provinciaChange", function CrearPublicacionComponent_Template_app_selector_ubicacion_provinciaChange_57_listener($event) { return ctx.formulario.seleccionarProvincia($event); })("localidadChange", function CrearPublicacionComponent_Template_app_selector_ubicacion_localidadChange_57_listener($event) { return ctx.formulario.seleccionarLocalidad($event); })("nombresChange", function CrearPublicacionComponent_Template_app_selector_ubicacion_nombresChange_57_listener($event) { return ctx.formulario.nombresUbicacion.set($event); })("touched", function CrearPublicacionComponent_Template_app_selector_ubicacion_touched_57_listener() { return ctx.form.controls.idCiudad.markAsTouched(); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(58, "div", 19)(59, "label", 27);
            i0.ɵɵtext(60, "Calle y n\u00FAmero *");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(61, "input", 28);
            i0.ɵɵcontrolCreate();
            i0.ɵɵconditionalCreate(62, CrearPublicacionComponent_Conditional_62_Template, 2, 0, "span", 16);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(63, "app-location-picker", 29);
            i0.ɵɵlistener("locationConfirmed", function CrearPublicacionComponent_Template_app_location_picker_locationConfirmed_63_listener($event) { return ctx.confirmarUbicacion($event); });
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(64, "section", 8)(65, "h2")(66, "span", 9);
            i0.ɵɵtext(67, "03");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(68, " Caracter\u00EDsticas");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(69, "div", 10)(70, "div", 11)(71, "label", 30);
            i0.ɵɵtext(72, "Ambientes *");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(73, "input", 31);
            i0.ɵɵcontrolCreate();
            i0.ɵɵconditionalCreate(74, CrearPublicacionComponent_Conditional_74_Template, 2, 1, "span", 16)(75, CrearPublicacionComponent_Conditional_75_Template, 2, 0, "span", 16)(76, CrearPublicacionComponent_Conditional_76_Template, 2, 0, "span", 16);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(77, "div", 11)(78, "label", 32);
            i0.ɵɵtext(79, "Superficie total (m\u00B2) *");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(80, "input", 33);
            i0.ɵɵcontrolCreate();
            i0.ɵɵconditionalCreate(81, CrearPublicacionComponent_Conditional_81_Template, 2, 1, "span", 16)(82, CrearPublicacionComponent_Conditional_82_Template, 2, 0, "span", 16)(83, CrearPublicacionComponent_Conditional_83_Template, 2, 0, "span", 16);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(84, "section", 34)(85, "h2")(86, "span", 9);
            i0.ɵɵtext(87, "04");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(88, " Fotos de la propiedad *");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(89, "app-carga-fotos", 35);
            i0.ɵɵlistener("elegidas", function CrearPublicacionComponent_Template_app_carga_fotos_elegidas_89_listener($event) { return ctx.agregarImagenes($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(90, CrearPublicacionComponent_Conditional_90_Template, 1, 2, "app-galeria-imagenes", 36);
            i0.ɵɵconditionalCreate(91, CrearPublicacionComponent_Conditional_91_Template, 2, 0, "p", 37);
            i0.ɵɵelementStart(92, "p", 24);
            i0.ɵɵtext(93, " Es obligatorio subir al menos una. Pod\u00E9s cambiar la portada y el orden antes de publicar. Us\u00E1 im\u00E1genes claras de los ambientes y la fachada. ");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(94, CrearPublicacionComponent_Conditional_94_Template, 2, 1, "p", 16);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(95, "section", 8)(96, "h2")(97, "span", 9);
            i0.ɵɵtext(98, "05");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(99, " Precio y condiciones");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(100, "div", 10)(101, "div", 11)(102, "label", 38);
            i0.ɵɵtext(103, "Moneda *");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(104, "select", 39)(105, "option", 14);
            i0.ɵɵtext(106, "Seleccion\u00E1");
            i0.ɵɵelementEnd();
            i0.ɵɵrepeaterCreate(107, CrearPublicacionComponent_For_108_Template, 2, 2, "option", 15, _forTrack0);
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵconditionalCreate(109, CrearPublicacionComponent_Conditional_109_Template, 2, 0, "span", 16);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(110, "div", 11)(111, "label", 40);
            i0.ɵɵtext(112, "Precio del alquiler *");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(113, "input", 41);
            i0.ɵɵcontrolCreate();
            i0.ɵɵconditionalCreate(114, CrearPublicacionComponent_Conditional_114_Template, 2, 1, "span", 16)(115, CrearPublicacionComponent_Conditional_115_Template, 2, 0, "span", 16)(116, CrearPublicacionComponent_Conditional_116_Template, 2, 0, "span", 16);
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(117, CrearPublicacionComponent_Conditional_117_Template, 8, 2, "section", 42);
            i0.ɵɵelementStart(118, "p", 43);
            i0.ɵɵtext(119, " Antes de publicar, revis\u00E1 que los datos y las fotos sean correctos. ");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(120, CrearPublicacionComponent_Conditional_120_Template, 2, 1, "div", 44);
            i0.ɵɵelementStart(121, "div", 45);
            i0.ɵɵconditionalCreate(122, CrearPublicacionComponent_Conditional_122_Template, 2, 1, "span", 46);
            i0.ɵɵelementStart(123, "a", 47);
            i0.ɵɵtext(124, "Cancelar");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(125, "button", 48);
            i0.ɵɵtext(126);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(127, "aside", 49)(128, "h2");
            i0.ɵɵtext(129, "Una buena publicaci\u00F3n empieza ac\u00E1");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(130, "p");
            i0.ɵɵtext(131, "Complet\u00E1 los datos con claridad para recibir consultas que se ajusten a tu propiedad.");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(132, "ol")(133, "li")(134, "strong");
            i0.ɵɵtext(135, "Cont\u00E1 qu\u00E9 la hace especial");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(136, "span");
            i0.ɵɵtext(137, "Sum\u00E1 un t\u00EDtulo concreto y una descripci\u00F3n de sus ambientes.");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(138, "li")(139, "strong");
            i0.ɵɵtext(140, "Cuid\u00E1 las fotos");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(141, "span");
            i0.ɵɵtext(142, "Eleg\u00ED una portada luminosa y evit\u00E1 im\u00E1genes borrosas.");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(143, "li")(144, "strong");
            i0.ɵɵtext(145, "Aclar\u00E1 las condiciones");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(146, "span");
            i0.ɵɵtext(147, "Detall\u00E1 el precio y la moneda. Los campos con * son obligatorios.");
            i0.ɵɵelementEnd()()()()()()();
        } if (rf & 2) {
            i0.ɵɵadvance(15);
            i0.ɵɵproperty("formGroup", ctx.form);
            i0.ɵɵadvance(10);
            i0.ɵɵcontrol();
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngValue", null);
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.formulario.modalidades());
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.formulario.invalido("idModalidad") ? 30 : -1);
            i0.ɵɵadvance(4);
            i0.ɵɵcontrol();
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngValue", null);
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.formulario.tiposPropiedad());
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.formulario.invalido("idTipoPropiedad") ? 39 : -1);
            i0.ɵɵadvance(4);
            i0.ɵɵcontrol();
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.formulario.invalido("titulo") ? 44 : -1);
            i0.ɵɵadvance(4);
            i0.ɵɵcontrol();
            i0.ɵɵadvance();
            i0.ɵɵclassProp("acct-hint--error", ctx.formulario.invalido("descripcion"));
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.formulario.invalido("descripcion") ? "Ingres\u00E1 una descripci\u00F3n." : ctx.form.controls.descripcion.value.length + "/5000 caracteres", " ");
            i0.ɵɵadvance(7);
            i0.ɵɵproperty("required", true)("provinciaId", ctx.formulario.provincia())("localidadId", ctx.formulario.ciudad())("disabled", ctx.enviando())("invalidProvincia", ctx.formulario.invalido("idProvincia"))("invalidLocalidad", ctx.formulario.invalido("idCiudad"));
            i0.ɵɵadvance(4);
            i0.ɵɵcontrol();
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.formulario.invalido("direccion") ? 62 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("direccion", ctx.form.controls.direccion.value)("ciudad", ctx.formulario.nombreCiudad())("provincia", ctx.formulario.nombreProvincia())("initialLatitude", ctx.formulario.latitud())("initialLongitude", ctx.formulario.longitud());
            i0.ɵɵadvance(10);
            i0.ɵɵattribute("max", ctx.formulario.limites.ambientesMaximos);
            i0.ɵɵcontrol();
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.formulario.excedeMaximo("cantidad_ambientes") ? 74 : ctx.formulario.excedeDecimales("cantidad_ambientes") ? 75 : ctx.formulario.invalido("cantidad_ambientes") ? 76 : -1);
            i0.ɵɵadvance(6);
            i0.ɵɵattribute("max", ctx.formulario.limites.superficieMaxima);
            i0.ɵɵcontrol();
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.formulario.excedeMaximo("superficie") ? 81 : ctx.formulario.excedeDecimales("superficie") ? 82 : ctx.formulario.invalido("superficie") ? 83 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵclassProp("step--error", ctx.faltanFotos());
            i0.ɵɵadvance(5);
            i0.ɵɵproperty("deshabilitado", ctx.enviando())("error", ctx.faltanFotos());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.imagenes().length ? 90 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.faltanFotos() ? 91 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.avisoImagenes() ? 94 : -1);
            i0.ɵɵadvance(10);
            i0.ɵɵcontrol();
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngValue", null);
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.formulario.monedas());
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.formulario.invalido("idTipoMoneda") ? 109 : -1);
            i0.ɵɵadvance(4);
            i0.ɵɵattribute("max", ctx.formulario.limites.precioMaximo);
            i0.ɵɵcontrol();
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.formulario.excedeMaximo("precio") ? 114 : ctx.formulario.excedeDecimales("precio") ? 115 : ctx.formulario.invalido("precio") ? 116 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.formulario.esTemporaria() ? 117 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.error() ? 120 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.enviando() ? 122 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", ctx.enviando());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.enviando() ? "Publicando\u2026" : "Publicar propiedad", " ");
            i0.ɵɵadvance();
            i0.ɵɵproperty("revealDelay", 150);
        } }, dependencies: [ReactiveFormsModule, i1.ɵNgNoValidate, i1.NgSelectOption, i1.ɵNgSelectMultipleOption, i1.DefaultValueAccessor, i1.NumberValueAccessor, i1.SelectControlValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.MaxLengthValidator, i1.MinValidator, i1.FormGroupDirective, i1.FormControlName, RouterLink,
            RevealDirective,
            SoloNumerosDirective,
            AvailabilityCalendarComponent,
            LocationPickerComponent,
            SelectorUbicacionComponent,
            CargaFotosComponent,
            GaleriaImagenesComponent], styles: [".create[_ngcontent-%COMP%] { padding: 1.5rem 1rem 3.5rem; background: #fff; }\r\n.create__wrap[_ngcontent-%COMP%] { max-width: 1100px; margin: 0 auto; }\r\n\r\n.crumbs[_ngcontent-%COMP%] { font-size: 0.82rem; color: var(--%NS%color-text-muted); animation: depa-fade-in 0.5s ease both; }\r\n.crumbs[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); text-decoration: none; }\r\n.crumbs[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover { color: var(--%NS%color-accent); }\r\n.crumbs[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { margin: 0 0.25rem; }\r\n\r\n.create__head[_ngcontent-%COMP%] { margin: 1.25rem 0 1.75rem; animation: depa-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }\r\n.create__head[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] { margin: 0; font-size: clamp(1.6rem, 3.2vw, 2.3rem); font-weight: 800; letter-spacing: -0.02em; }\r\n.create__head[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0.6rem 0 0; color: #475467; }\r\n\r\n.create__layout[_ngcontent-%COMP%] { display: grid; grid-template-columns: minmax(0, 1fr) 290px; gap: 1.5rem; align-items: start; }\r\n.create__form[_ngcontent-%COMP%] { display: flex; flex-direction: column; gap: 1.1rem; }\r\n\r\n\r\n.step[_ngcontent-%COMP%] {\r\n  padding: 1.35rem 1.4rem 1.5rem;\r\n  border: 1px solid #d0d5dd;\r\n  border-radius: 12px;\r\n  background: #fff;\r\n  transition: border-color 0.25s ease, box-shadow 0.25s ease;\r\n}\r\n.step[_ngcontent-%COMP%]:focus-within { border-color: #ffb547; box-shadow: 0 10px 28px rgba(255, 152, 0, 0.14); }\r\n.step--error[_ngcontent-%COMP%] { border-color: var(--%NS%color-danger); animation: _ngcontent-%COMP%_shake 0.45s ease; }\r\n@keyframes _ngcontent-%COMP%_shake { 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }\r\n.step[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 0.6rem; margin: 0 0 1.1rem; font-size: 1.1rem; font-weight: 800; }\r\n.step__num[_ngcontent-%COMP%] {\r\n  display: grid; place-items: center; width: 2.1rem; height: 2.1rem; border-radius: 9px;\r\n  background: #fff4e5; color: var(--%NS%color-accent); font-size: 0.9rem; font-weight: 800;\r\n  transition: background 0.3s ease, color 0.3s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);\r\n}\r\n.step[_ngcontent-%COMP%]:focus-within   .step__num[_ngcontent-%COMP%] { background: var(--%NS%color-accent); color: #fff; transform: rotate(-8deg) scale(1.08); }\r\n\r\napp-galeria-imagenes[_ngcontent-%COMP%] { margin-top: 16px; }\r\n.step[_ngcontent-%COMP%]    > .acct-hint[_ngcontent-%COMP%] { display: block; margin-top: 0.6rem; }\r\n\r\n.availability-help[_ngcontent-%COMP%] {\r\n  margin: -0.35rem 0 1rem;\r\n  color: #475467;\r\n  font-size: 0.9rem;\r\n  line-height: 1.5;\r\n}\r\n\r\n.create__note[_ngcontent-%COMP%] { margin: 0.25rem 0 0; font-size: 0.85rem; color: var(--%NS%color-text-muted); }\r\n.progress[_ngcontent-%COMP%] { align-self: center; margin-right: auto; font-size: 0.88rem; color: var(--%NS%color-text-muted); }\r\n\r\n\r\n.tips[_ngcontent-%COMP%] { position: sticky; top: 96px; padding: 1.3rem; border-radius: 12px; background: #fff4e5; }\r\n.tips[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 0 0 0.5rem; font-size: 1.05rem; font-weight: 800; }\r\n.tips[_ngcontent-%COMP%]    > p[_ngcontent-%COMP%] { margin: 0 0 1rem; font-size: 0.86rem; color: #475467; line-height: 1.5; }\r\n.tips[_ngcontent-%COMP%]   ol[_ngcontent-%COMP%] { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.9rem; counter-reset: tip; }\r\n.tips[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] { counter-increment: tip; display: grid; gap: 0.15rem; font-size: 0.84rem; }\r\n.tips[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%]::before { content: '0' counter(tip) '  '; color: var(--%NS%color-accent); white-space: pre; }\r\n.tips[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { color: #475467; line-height: 1.45; }\r\n\r\n@media (max-width: 900px) {\r\n  .create__layout[_ngcontent-%COMP%] { grid-template-columns: 1fr; }\r\n  .tips[_ngcontent-%COMP%] { position: static; order: -1; }\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CrearPublicacionComponent, [{
        type: Component,
        args: [{ selector: 'app-crear-publicacion', standalone: true, imports: [
                    ReactiveFormsModule,
                    RouterLink,
                    RevealDirective,
                    SoloNumerosDirective,
                    AvailabilityCalendarComponent,
                    LocationPickerComponent,
                    SelectorUbicacionComponent,
                    CargaFotosComponent,
                    GaleriaImagenesComponent,
                ], providers: [PublicacionFormulario], template: "<section class=\"create\">\r\n  <div class=\"create__wrap\">\r\n    <nav class=\"crumbs\" aria-label=\"Ruta de navegaci\u00F3n\">\r\n      <a routerLink=\"/\">Inicio</a> <span>/</span> <span aria-current=\"page\">Crear publicaci\u00F3n</span>\r\n    </nav>\r\n    <header class=\"create__head\">\r\n      <h1>Public\u00E1 tu pr\u00F3ximo gran encuentro</h1>\r\n      <p>Contanos c\u00F3mo es tu propiedad y conect\u00E1 con quienes est\u00E1n buscando su pr\u00F3ximo hogar.</p>\r\n    </header>\r\n\r\n    <div class=\"create__layout\">\r\n      <form class=\"create__form\" [formGroup]=\"form\" (ngSubmit)=\"publicar()\" novalidate>\r\n        <!-- 01 -->\r\n        <section class=\"step\" appReveal>\r\n          <h2><span class=\"step__num\">01</span> Datos de la publicaci\u00F3n</h2>\r\n          <div class=\"acct-grid\">\r\n            <div class=\"acct-field\">\r\n              <label for=\"modalidad\">Tipo de alquiler *</label>\r\n              <select id=\"modalidad\" formControlName=\"idModalidad\">\r\n                <option [ngValue]=\"null\" disabled>Seleccion\u00E1 una opci\u00F3n</option>\r\n                @for (m of formulario.modalidades(); track m.id) {\r\n                  <option [ngValue]=\"m.id\">{{ m.nombre }}</option>\r\n                }\r\n              </select>\r\n              @if (formulario.invalido('idModalidad')) {\r\n                <span class=\"acct-hint acct-hint--error\">Eleg\u00ED el tipo de alquiler.</span>\r\n              }\r\n            </div>\r\n            <div class=\"acct-field\">\r\n              <label for=\"tipo\">Tipo de propiedad *</label>\r\n              <select id=\"tipo\" formControlName=\"idTipoPropiedad\">\r\n                <option [ngValue]=\"null\" disabled>Seleccion\u00E1 una opci\u00F3n</option>\r\n                @for (t of formulario.tiposPropiedad(); track t.id) {\r\n                  <option [ngValue]=\"t.id\">{{ t.nombre }}</option>\r\n                }\r\n              </select>\r\n              @if (formulario.invalido('idTipoPropiedad')) {\r\n                <span class=\"acct-hint acct-hint--error\">Eleg\u00ED el tipo de propiedad.</span>\r\n              }\r\n            </div>\r\n            <div class=\"acct-field acct-span\">\r\n              <label for=\"titulo\">T\u00EDtulo de la publicaci\u00F3n *</label>\r\n              <input\r\n                id=\"titulo\"\r\n                formControlName=\"titulo\"\r\n                maxlength=\"255\"\r\n                placeholder=\"Ej.: Departamento luminoso con balc\u00F3n en el centro\"\r\n              />\r\n              @if (formulario.invalido('titulo')) {\r\n                <span class=\"acct-hint acct-hint--error\">Ingres\u00E1 un t\u00EDtulo de 15 a 255 caracteres, con letras o n\u00FAmeros. Solo se admiten espacios, comas, dos puntos y puntos.</span>\r\n              }\r\n            </div>\r\n            <div class=\"acct-field acct-span\">\r\n              <label for=\"descripcion\">Descripci\u00F3n *</label>\r\n              <textarea\r\n                id=\"descripcion\"\r\n                formControlName=\"descripcion\"\r\n                maxlength=\"5000\"\r\n                placeholder=\"Describ\u00ED los ambientes, el estado de la propiedad y qu\u00E9 la hace especial.\"\r\n              ></textarea>\r\n              <span class=\"acct-hint\" [class.acct-hint--error]=\"formulario.invalido('descripcion')\">\r\n                {{\r\n                  formulario.invalido('descripcion')\r\n                    ? 'Ingres\u00E1 una descripci\u00F3n.'\r\n                    : form.controls.descripcion.value.length + '/5000 caracteres'\r\n                }}\r\n              </span>\r\n            </div>\r\n          </div>\r\n        </section>\r\n\r\n        <!-- 02 -->\r\n        <section class=\"step\" id=\"ubicacion-mapa\" appReveal>\r\n          <h2><span class=\"step__num\">02</span> Ubicaci\u00F3n</h2>\r\n          <div class=\"acct-grid\">\r\n            <app-selector-ubicacion\r\n              class=\"acct-span\"\r\n              idPrefix=\"crear-ubicacion\"\r\n              [required]=\"true\"\r\n              [provinciaId]=\"formulario.provincia()\"\r\n              [localidadId]=\"formulario.ciudad()\"\r\n              [disabled]=\"enviando()\"\r\n              [invalidProvincia]=\"formulario.invalido('idProvincia')\"\r\n              [invalidLocalidad]=\"formulario.invalido('idCiudad')\"\r\n              (provinciaChange)=\"formulario.seleccionarProvincia($event)\"\r\n              (localidadChange)=\"formulario.seleccionarLocalidad($event)\"\r\n              (nombresChange)=\"formulario.nombresUbicacion.set($event)\"\r\n              (touched)=\"form.controls.idCiudad.markAsTouched()\"\r\n            />\r\n            <div class=\"acct-field acct-span\">\r\n              <label for=\"direccion\">Calle y n\u00FAmero *</label>\r\n              <input\r\n                id=\"direccion\"\r\n                formControlName=\"direccion\"\r\n                maxlength=\"255\"\r\n                placeholder=\"Ej.: Jos\u00E9 Ingenieros 123\"\r\n              />\r\n              @if (formulario.invalido('direccion')) {\r\n                <span class=\"acct-hint acct-hint--error\">Ingres\u00E1 la direcci\u00F3n.</span>\r\n              }\r\n            </div>\r\n            <app-location-picker\r\n              [direccion]=\"form.controls.direccion.value\"\r\n              [ciudad]=\"formulario.nombreCiudad()\"\r\n              [provincia]=\"formulario.nombreProvincia()\"\r\n              [initialLatitude]=\"formulario.latitud()\"\r\n              [initialLongitude]=\"formulario.longitud()\"\r\n              (locationConfirmed)=\"confirmarUbicacion($event)\"\r\n            />\r\n          </div>\r\n        </section>\r\n\r\n        <!-- 03 -->\r\n        <section class=\"step\" appReveal>\r\n          <h2><span class=\"step__num\">03</span> Caracter\u00EDsticas</h2>\r\n          <div class=\"acct-grid\">\r\n            <div class=\"acct-field\">\r\n              <label for=\"ambientes\">Ambientes *</label>\r\n              <input\r\n                id=\"ambientes\"\r\n                type=\"number\"\r\n                min=\"1\"\r\n                [attr.max]=\"formulario.limites.ambientesMaximos\"\r\n                step=\"1\"\r\n                inputmode=\"numeric\"\r\n                appSoloNumeros=\"0\"\r\n                formControlName=\"cantidad_ambientes\"\r\n                placeholder=\"Ej.: 2\"\r\n              />\r\n              @if (formulario.excedeMaximo('cantidad_ambientes')) {\r\n                <span class=\"acct-hint acct-hint--error\">El m\u00E1ximo es {{ formulario.ambientesMaximosTexto }} ambientes.</span>\r\n              } @else if (formulario.excedeDecimales('cantidad_ambientes')) {\r\n                <span class=\"acct-hint acct-hint--error\">Ingres\u00E1 una cantidad entera de ambientes.</span>\r\n              } @else if (formulario.invalido('cantidad_ambientes')) {\r\n                <span class=\"acct-hint acct-hint--error\">M\u00EDnimo 1 ambiente.</span>\r\n              }\r\n            </div>\r\n            <div class=\"acct-field\">\r\n              <label for=\"superficie\">Superficie total (m\u00B2) *</label>\r\n              <input\r\n                id=\"superficie\"\r\n                type=\"number\"\r\n                min=\"1\"\r\n                [attr.max]=\"formulario.limites.superficieMaxima\"\r\n                step=\"0.01\"\r\n                inputmode=\"decimal\"\r\n                appSoloNumeros=\"2\"\r\n                formControlName=\"superficie\"\r\n                placeholder=\"Ej.: 45\"\r\n              />\r\n              @if (formulario.excedeMaximo('superficie')) {\r\n                <span class=\"acct-hint acct-hint--error\">La superficie m\u00E1xima es {{ formulario.superficieMaximaTexto }} m\u00B2.</span>\r\n              } @else if (formulario.excedeDecimales('superficie')) {\r\n                <span class=\"acct-hint acct-hint--error\">Ingres\u00E1 como m\u00E1ximo 2 decimales.</span>\r\n              } @else if (formulario.invalido('superficie')) {\r\n                <span class=\"acct-hint acct-hint--error\">Ingres\u00E1 la superficie.</span>\r\n              }\r\n            </div>\r\n          </div>\r\n        </section>\r\n\r\n        <!-- 04 -->\r\n        <section class=\"step\" id=\"fotos\" appReveal [class.step--error]=\"faltanFotos()\">\r\n          <h2><span class=\"step__num\">04</span> Fotos de la propiedad *</h2>\r\n          <app-carga-fotos [deshabilitado]=\"enviando()\" [error]=\"faltanFotos()\" (elegidas)=\"agregarImagenes($event)\" />\r\n\r\n          @if (imagenes().length) {\r\n            <app-galeria-imagenes [fotos]=\"imagenes()\" [disabled]=\"enviando()\"\r\n              (reordenar)=\"ordenarImagenes($event)\" (quitar)=\"quitarImagen($event)\" />\r\n          }\r\n          @if (faltanFotos()) {\r\n            <p class=\"acct-hint acct-hint--error\" role=\"alert\">\r\n              Ten\u00E9s que agregar al menos una foto para publicar la propiedad.\r\n            </p>\r\n          }\r\n          <p class=\"acct-hint\">\r\n            Es obligatorio subir al menos una. Pod\u00E9s cambiar la portada y el orden antes de publicar. Us\u00E1 im\u00E1genes claras\r\n            de los ambientes y la fachada.\r\n          </p>\r\n          @if (avisoImagenes()) {\r\n            <p class=\"acct-hint acct-hint--error\">{{ avisoImagenes() }}</p>\r\n          }\r\n        </section>\r\n\r\n        <!-- 05 -->\r\n        <section class=\"step\" appReveal>\r\n          <h2><span class=\"step__num\">05</span> Precio y condiciones</h2>\r\n          <div class=\"acct-grid\">\r\n            <div class=\"acct-field\">\r\n              <label for=\"moneda\">Moneda *</label>\r\n              <select id=\"moneda\" formControlName=\"idTipoMoneda\">\r\n                <option [ngValue]=\"null\" disabled>Seleccion\u00E1</option>\r\n                @for (m of formulario.monedas(); track m.id) {\r\n                  <option [ngValue]=\"m.id\">{{ m.nombre }}</option>\r\n                }\r\n              </select>\r\n              @if (formulario.invalido('idTipoMoneda')) {\r\n                <span class=\"acct-hint acct-hint--error\">Eleg\u00ED la moneda.</span>\r\n              }\r\n            </div>\r\n            <div class=\"acct-field\">\r\n              <label for=\"precio\">Precio del alquiler *</label>\r\n              <input\r\n                id=\"precio\"\r\n                type=\"number\"\r\n                min=\"1\"\r\n                [attr.max]=\"formulario.limites.precioMaximo\"\r\n                step=\"0.01\"\r\n                inputmode=\"decimal\"\r\n                appSoloNumeros=\"2\"\r\n                formControlName=\"precio\"\r\n                placeholder=\"Ej.: 350000\"\r\n              />\r\n              @if (formulario.excedeMaximo('precio')) {\r\n                <span class=\"acct-hint acct-hint--error\">El precio m\u00E1ximo es {{ formulario.precioMaximoTexto }}.</span>\r\n              } @else if (formulario.excedeDecimales('precio')) {\r\n                <span class=\"acct-hint acct-hint--error\">Ingres\u00E1 como m\u00E1ximo 2 decimales.</span>\r\n              } @else if (formulario.invalido('precio')) {\r\n                <span class=\"acct-hint acct-hint--error\">Ingres\u00E1 un precio mayor a 0.</span>\r\n              }\r\n            </div>\r\n          </div>\r\n        </section>\r\n\r\n        @if (formulario.esTemporaria()) {\r\n          <section class=\"step\" id=\"disponibilidad\" appReveal>\r\n            <h2><span class=\"step__num\">06</span> D\u00EDas disponibles *</h2>\r\n            <p class=\"availability-help\">\r\n              Habilit\u00E1 un d\u00EDa o un per\u00EDodo para recibir reservas. Despu\u00E9s vas a poder\r\n              bloquear d\u00EDas puntuales desde \u201CModificar publicaci\u00F3n\u201D.\r\n            </p>\r\n            <app-availability-calendar\r\n              mode=\"setup\"\r\n              [selectedStart]=\"disponibilidadInicio()\"\r\n              [selectedEnd]=\"disponibilidadFin()\"\r\n              (rangeChange)=\"seleccionarDisponibilidad($event)\"\r\n            />\r\n          </section>\r\n        }\r\n\r\n        <p class=\"create__note\">\r\n          Antes de publicar, revis\u00E1 que los datos y las fotos sean correctos.\r\n        </p>\r\n        @if (error()) {\r\n          <div class=\"acct-alert acct-alert--error\" role=\"alert\">{{ error() }}</div>\r\n        }\r\n\r\n        <div class=\"acct-actions\">\r\n          @if (enviando()) {\r\n            <span class=\"progress\">{{ progreso() }}</span>\r\n          }\r\n          <a routerLink=\"/mis-publicaciones\" class=\"acct-btn acct-btn--ghost\">Cancelar</a>\r\n          <button type=\"submit\" class=\"acct-btn acct-btn--primary shine\" [disabled]=\"enviando()\">\r\n            {{ enviando() ? 'Publicando\u2026' : 'Publicar propiedad' }}\r\n          </button>\r\n        </div>\r\n      </form>\r\n\r\n      <aside class=\"tips\" appReveal=\"right\" [revealDelay]=\"150\">\r\n        <h2>Una buena publicaci\u00F3n empieza ac\u00E1</h2>\r\n        <p>Complet\u00E1 los datos con claridad para recibir consultas que se ajusten a tu propiedad.</p>\r\n        <ol>\r\n          <li>\r\n            <strong>Cont\u00E1 qu\u00E9 la hace especial</strong\r\n            ><span>Sum\u00E1 un t\u00EDtulo concreto y una descripci\u00F3n de sus ambientes.</span>\r\n          </li>\r\n          <li>\r\n            <strong>Cuid\u00E1 las fotos</strong\r\n            ><span>Eleg\u00ED una portada luminosa y evit\u00E1 im\u00E1genes borrosas.</span>\r\n          </li>\r\n          <li>\r\n            <strong>Aclar\u00E1 las condiciones</strong\r\n            ><span>Detall\u00E1 el precio y la moneda. Los campos con * son obligatorios.</span>\r\n          </li>\r\n        </ol>\r\n      </aside>\r\n    </div>\r\n  </div>\r\n</section>\r\n", styles: [".create { padding: 1.5rem 1rem 3.5rem; background: #fff; }\r\n.create__wrap { max-width: 1100px; margin: 0 auto; }\r\n\r\n.crumbs { font-size: 0.82rem; color: var(--color-text-muted); animation: depa-fade-in 0.5s ease both; }\r\n.crumbs a { color: var(--color-text-muted); text-decoration: none; }\r\n.crumbs a:hover { color: var(--color-accent); }\r\n.crumbs span { margin: 0 0.25rem; }\r\n\r\n.create__head { margin: 1.25rem 0 1.75rem; animation: depa-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }\r\n.create__head h1 { margin: 0; font-size: clamp(1.6rem, 3.2vw, 2.3rem); font-weight: 800; letter-spacing: -0.02em; }\r\n.create__head p { margin: 0.6rem 0 0; color: #475467; }\r\n\r\n.create__layout { display: grid; grid-template-columns: minmax(0, 1fr) 290px; gap: 1.5rem; align-items: start; }\r\n.create__form { display: flex; flex-direction: column; gap: 1.1rem; }\r\n\r\n/* Secciones numeradas */\r\n.step {\r\n  padding: 1.35rem 1.4rem 1.5rem;\r\n  border: 1px solid #d0d5dd;\r\n  border-radius: 12px;\r\n  background: #fff;\r\n  transition: border-color 0.25s ease, box-shadow 0.25s ease;\r\n}\r\n.step:focus-within { border-color: #ffb547; box-shadow: 0 10px 28px rgba(255, 152, 0, 0.14); }\r\n.step--error { border-color: var(--color-danger); animation: shake 0.45s ease; }\r\n@keyframes shake { 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }\r\n.step h2 { display: flex; align-items: center; gap: 0.6rem; margin: 0 0 1.1rem; font-size: 1.1rem; font-weight: 800; }\r\n.step__num {\r\n  display: grid; place-items: center; width: 2.1rem; height: 2.1rem; border-radius: 9px;\r\n  background: #fff4e5; color: var(--color-accent); font-size: 0.9rem; font-weight: 800;\r\n  transition: background 0.3s ease, color 0.3s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);\r\n}\r\n.step:focus-within .step__num { background: var(--color-accent); color: #fff; transform: rotate(-8deg) scale(1.08); }\r\n\r\napp-galeria-imagenes { margin-top: 16px; }\r\n.step > .acct-hint { display: block; margin-top: 0.6rem; }\r\n\r\n.availability-help {\r\n  margin: -0.35rem 0 1rem;\r\n  color: #475467;\r\n  font-size: 0.9rem;\r\n  line-height: 1.5;\r\n}\r\n\r\n.create__note { margin: 0.25rem 0 0; font-size: 0.85rem; color: var(--color-text-muted); }\r\n.progress { align-self: center; margin-right: auto; font-size: 0.88rem; color: var(--color-text-muted); }\r\n\r\n/* Tarjeta lateral de consejos */\r\n.tips { position: sticky; top: 96px; padding: 1.3rem; border-radius: 12px; background: #fff4e5; }\r\n.tips h2 { margin: 0 0 0.5rem; font-size: 1.05rem; font-weight: 800; }\r\n.tips > p { margin: 0 0 1rem; font-size: 0.86rem; color: #475467; line-height: 1.5; }\r\n.tips ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.9rem; counter-reset: tip; }\r\n.tips li { counter-increment: tip; display: grid; gap: 0.15rem; font-size: 0.84rem; }\r\n.tips li strong::before { content: '0' counter(tip) '  '; color: var(--color-accent); white-space: pre; }\r\n.tips li span { color: #475467; line-height: 1.45; }\r\n\r\n@media (max-width: 900px) {\r\n  .create__layout { grid-template-columns: 1fr; }\r\n  .tips { position: static; order: -1; }\r\n}\r\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CrearPublicacionComponent, { className: "CrearPublicacionComponent", filePath: "src/app/features/crear-publicacion/crear-publicacion.component.ts", lineNumber: 50 }); })();
