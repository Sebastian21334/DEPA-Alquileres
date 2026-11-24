import { SelectorUbicacionComponent } from '../../shared/components/selector-ubicacion/selector-ubicacion.component';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { concatMap, finalize, from, map, of, switchMap } from 'rxjs';
import { GestionPublicacionesService } from '../../shared/services/gestion-publicaciones.service';
import { GaleriaImagenesComponent } from '../../shared/components/galeria-imagenes/galeria-imagenes.component';
import { CargaFotosComponent } from '../../shared/components/carga-fotos/carga-fotos.component';
import { moverImagen } from '../../shared/utils/orden-imagenes';
import { filtrarImagenesPublicacion } from '../../shared/utils/imagenes-publicacion';
import { ListingService } from '../home/listing.service';
import { AvailabilityService, } from '../../shared/services/availability.service';
import { PublicacionFormulario } from '../../shared/forms/publicacion-formulario';
import { AuthService } from '../../core/services/auth.service';
import { AvailabilityCalendarComponent } from '../../shared/components/availability-calendar/availability-calendar.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { SoloNumerosDirective } from '../../shared/directives/solo-numeros.directive';
import { LocationPickerComponent, } from '../../shared/components/location-picker/location-picker.component';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
const _forTrack0 = ($index, $item) => $item.id;
function PublicationFormComponent_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 3);
    i0.ɵɵelement(1, "app-spinner");
    i0.ɵɵelementStart(2, "p");
    i0.ɵɵtext(3, "Cargando publicaci\u00F3n\u2026");
    i0.ɵɵelementEnd()();
} }
function PublicationFormComponent_Conditional_11_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1, "Ingres\u00E1 un t\u00EDtulo de 15 a 255 caracteres, con letras o n\u00FAmeros. Solo se admiten espacios, comas, dos puntos y puntos.");
    i0.ɵɵelementEnd();
} }
function PublicationFormComponent_Conditional_11_For_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 16);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r3 = ctx.$implicit;
    i0.ɵɵproperty("ngValue", item_r3.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r3.nombre);
} }
function PublicationFormComponent_Conditional_11_For_36_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 16);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r4 = ctx.$implicit;
    i0.ɵɵproperty("ngValue", item_r4.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r4.nombre);
} }
function PublicationFormComponent_Conditional_11_Conditional_41_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("El precio m\u00E1ximo es ", ctx_r1.formulario.precioMaximoTexto, ".");
} }
function PublicationFormComponent_Conditional_11_Conditional_42_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1, "Ingres\u00E1 como m\u00E1ximo 2 decimales.");
    i0.ɵɵelementEnd();
} }
function PublicationFormComponent_Conditional_11_Conditional_43_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1, "Ingres\u00E1 un precio mayor a 0.");
    i0.ɵɵelementEnd();
} }
function PublicationFormComponent_Conditional_11_For_51_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 16);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r5 = ctx.$implicit;
    i0.ɵɵproperty("ngValue", item_r5.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r5.nombre);
} }
function PublicationFormComponent_Conditional_11_Conditional_71_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("El m\u00E1ximo es ", ctx_r1.formulario.ambientesMaximosTexto, " ambientes.");
} }
function PublicationFormComponent_Conditional_11_Conditional_72_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1, "Ingres\u00E1 una cantidad entera de ambientes.");
    i0.ɵɵelementEnd();
} }
function PublicationFormComponent_Conditional_11_Conditional_73_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1, "M\u00EDnimo 1 ambiente.");
    i0.ɵɵelementEnd();
} }
function PublicationFormComponent_Conditional_11_Conditional_78_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("La superficie m\u00E1xima es ", ctx_r1.formulario.superficieMaximaTexto, " m\u00B2.");
} }
function PublicationFormComponent_Conditional_11_Conditional_79_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1, "Ingres\u00E1 como m\u00E1ximo 2 decimales.");
    i0.ɵɵelementEnd();
} }
function PublicationFormComponent_Conditional_11_Conditional_80_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "small");
    i0.ɵɵtext(1, "Ingres\u00E1 la superficie.");
    i0.ɵɵelementEnd();
} }
function PublicationFormComponent_Conditional_11_Conditional_92_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 34);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.imagesBusy() ? "Procesando fotos\u2026" : "Guardando orden\u2026 Pod\u00E9s seguir acomodando las fotos.");
} }
function PublicationFormComponent_Conditional_11_Conditional_93_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 35);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.imageError());
} }
function PublicationFormComponent_Conditional_11_Conditional_94_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 39)(1, "h3");
    i0.ɵɵtext(2, "Administrar d\u00EDas cargados");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4, "Verde: disponible. Gris: bloqueado manualmente. Rojo: reservado y no editable.");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "app-availability-calendar", 40);
    i0.ɵɵlistener("availabilityToggle", function PublicationFormComponent_Conditional_11_Conditional_94_Conditional_10_Template_app_availability_calendar_availabilityToggle_5_listener($event) { i0.ɵɵrestoreView(_r7); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.toggleAvailability($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("dates", ctx_r1.availability());
} }
function PublicationFormComponent_Conditional_11_Conditional_94_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 31)(1, "div", 7)(2, "span");
    i0.ɵɵtext(3, "4");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div")(5, "h2");
    i0.ɵɵtext(6, "Calendario de disponibilidad");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p");
    i0.ɵɵtext(8, " Agreg\u00E1 d\u00EDas disponibles. M\u00E1s abajo pod\u00E9s bloquear o habilitar los que ya cargaste. ");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(9, "app-availability-calendar", 38);
    i0.ɵɵlistener("rangeChange", function PublicationFormComponent_Conditional_11_Conditional_94_Template_app_availability_calendar_rangeChange_9_listener($event) { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.selectAvailabilityDate($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(10, PublicationFormComponent_Conditional_11_Conditional_94_Conditional_10_Template, 6, 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(9);
    i0.ɵɵproperty("selectedStart", ctx_r1.availabilityStart())("selectedEnd", ctx_r1.availabilityEnd());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.availability().length ? 10 : -1);
} }
function PublicationFormComponent_Conditional_11_Conditional_95_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 35);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.error());
} }
function PublicationFormComponent_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 5);
    i0.ɵɵlistener("ngSubmit", function PublicationFormComponent_Conditional_11_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.submit()); });
    i0.ɵɵelementStart(1, "section", 6)(2, "div", 7)(3, "span");
    i0.ɵɵtext(4, "1");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div")(6, "h2");
    i0.ɵɵtext(7, "Informaci\u00F3n principal");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "p");
    i0.ɵɵtext(9, "As\u00ED se mostrar\u00E1 tu propiedad en los resultados.");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(10, "div", 8)(11, "label", 9);
    i0.ɵɵtext(12, "T\u00EDtulo *");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(13, "input", 10);
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(14, PublicationFormComponent_Conditional_11_Conditional_14_Template, 2, 0, "small");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "div", 8)(16, "label", 11);
    i0.ɵɵtext(17, "Descripci\u00F3n *");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(18, "textarea", 12);
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(19, "small");
    i0.ɵɵtext(20);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(21, "div", 13)(22, "label", 14);
    i0.ɵɵtext(23, "Modalidad *");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "select", 15)(25, "option", 16);
    i0.ɵɵtext(26, "Seleccionar");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(27, PublicationFormComponent_Conditional_11_For_28_Template, 2, 2, "option", 16, _forTrack0);
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "div", 13)(30, "label", 17);
    i0.ɵɵtext(31, "Tipo de propiedad *");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(32, "select", 18)(33, "option", 16);
    i0.ɵɵtext(34, "Seleccionar");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(35, PublicationFormComponent_Conditional_11_For_36_Template, 2, 2, "option", 16, _forTrack0);
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(37, "div", 13)(38, "label", 19);
    i0.ɵɵtext(39);
    i0.ɵɵelementEnd();
    i0.ɵɵelement(40, "input", 20);
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(41, PublicationFormComponent_Conditional_11_Conditional_41_Template, 2, 1, "small")(42, PublicationFormComponent_Conditional_11_Conditional_42_Template, 2, 0, "small")(43, PublicationFormComponent_Conditional_11_Conditional_43_Template, 2, 0, "small");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(44, "div", 13)(45, "label", 21);
    i0.ɵɵtext(46, "Moneda *");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(47, "select", 22)(48, "option", 16);
    i0.ɵɵtext(49, "Seleccionar");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(50, PublicationFormComponent_Conditional_11_For_51_Template, 2, 2, "option", 16, _forTrack0);
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(52, "section", 6)(53, "div", 7)(54, "span");
    i0.ɵɵtext(55, "2");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(56, "div")(57, "h2");
    i0.ɵɵtext(58, "Ubicaci\u00F3n y caracter\u00EDsticas");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(59, "p");
    i0.ɵɵtext(60, "Ingres\u00E1 datos precisos para facilitar la b\u00FAsqueda.");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(61, "div", 8)(62, "label", 23);
    i0.ɵɵtext(63, "Direcci\u00F3n *");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(64, "input", 24);
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(65, "app-selector-ubicacion", 25);
    i0.ɵɵlistener("provinciaChange", function PublicationFormComponent_Conditional_11_Template_app_selector_ubicacion_provinciaChange_65_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.formulario.seleccionarProvincia($event)); })("localidadChange", function PublicationFormComponent_Conditional_11_Template_app_selector_ubicacion_localidadChange_65_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.formulario.seleccionarLocalidad($event)); })("nombresChange", function PublicationFormComponent_Conditional_11_Template_app_selector_ubicacion_nombresChange_65_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.formulario.nombresUbicacion.set($event)); })("touched", function PublicationFormComponent_Conditional_11_Template_app_selector_ubicacion_touched_65_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.form.controls.idCiudad.markAsTouched()); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(66, "app-location-picker", 26);
    i0.ɵɵlistener("locationConfirmed", function PublicationFormComponent_Conditional_11_Template_app_location_picker_locationConfirmed_66_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.confirmLocation($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(67, "div", 13)(68, "label", 27);
    i0.ɵɵtext(69, "Ambientes *");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(70, "input", 28);
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(71, PublicationFormComponent_Conditional_11_Conditional_71_Template, 2, 1, "small")(72, PublicationFormComponent_Conditional_11_Conditional_72_Template, 2, 0, "small")(73, PublicationFormComponent_Conditional_11_Conditional_73_Template, 2, 0, "small");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(74, "div", 13)(75, "label", 29);
    i0.ɵɵtext(76, "Superficie (m\u00B2) *");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(77, "input", 30);
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(78, PublicationFormComponent_Conditional_11_Conditional_78_Template, 2, 1, "small")(79, PublicationFormComponent_Conditional_11_Conditional_79_Template, 2, 0, "small")(80, PublicationFormComponent_Conditional_11_Conditional_80_Template, 2, 0, "small");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(81, "section", 31)(82, "div", 7)(83, "span");
    i0.ɵɵtext(84, "3");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(85, "div")(86, "h2");
    i0.ɵɵtext(87, "Fotos de la propiedad");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(88, "p");
    i0.ɵɵtext(89, "La primera foto es la portada. Los cambios en las fotos se guardan autom\u00E1ticamente.");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(90, "app-carga-fotos", 32);
    i0.ɵɵlistener("elegidas", function PublicationFormComponent_Conditional_11_Template_app_carga_fotos_elegidas_90_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.uploadImages($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(91, "app-galeria-imagenes", 33);
    i0.ɵɵlistener("reordenar", function PublicationFormComponent_Conditional_11_Template_app_galeria_imagenes_reordenar_91_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.reorderImages($event)); })("quitar", function PublicationFormComponent_Conditional_11_Template_app_galeria_imagenes_quitar_91_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.removeImage($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(92, PublicationFormComponent_Conditional_11_Conditional_92_Template, 2, 1, "p", 34);
    i0.ɵɵconditionalCreate(93, PublicationFormComponent_Conditional_11_Conditional_93_Template, 2, 1, "p", 35);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(94, PublicationFormComponent_Conditional_11_Conditional_94_Template, 11, 3, "section", 31);
    i0.ɵɵconditionalCreate(95, PublicationFormComponent_Conditional_11_Conditional_95_Template, 2, 1, "p", 35);
    i0.ɵɵelementStart(96, "footer", 36)(97, "a", 2);
    i0.ɵɵtext(98, "Cancelar");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(99, "button", 37);
    i0.ɵɵtext(100);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("formGroup", ctx_r1.form);
    i0.ɵɵadvance(13);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.formulario.invalido("titulo") ? 14 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", ctx_r1.form.controls.descripcion.value.length, "/5000 caracteres");
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngValue", null);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.formulario.modalidades());
    i0.ɵɵadvance(5);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngValue", null);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.formulario.tiposPropiedad());
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1("Precio ", ctx_r1.formulario.esTemporaria() ? "por d\u00EDa" : "mensual", " *");
    i0.ɵɵadvance();
    i0.ɵɵattribute("max", ctx_r1.formulario.limites.precioMaximo);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.formulario.excedeMaximo("precio") ? 41 : ctx_r1.formulario.excedeDecimales("precio") ? 42 : ctx_r1.formulario.invalido("precio") ? 43 : -1);
    i0.ɵɵadvance(6);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngValue", null);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.formulario.monedas());
    i0.ɵɵadvance(14);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("required", true)("provinciaId", ctx_r1.formulario.provincia())("localidadId", ctx_r1.formulario.ciudad())("disabled", ctx_r1.form.disabled || ctx_r1.saving())("invalidProvincia", ctx_r1.formulario.invalido("idProvincia"))("invalidLocalidad", ctx_r1.formulario.invalido("idCiudad"));
    i0.ɵɵadvance();
    i0.ɵɵproperty("direccion", ctx_r1.form.controls.direccion.value)("ciudad", ctx_r1.formulario.nombreCiudad())("provincia", ctx_r1.formulario.nombreProvincia())("initialLatitude", ctx_r1.formulario.latitud())("initialLongitude", ctx_r1.formulario.longitud());
    i0.ɵɵadvance(4);
    i0.ɵɵattribute("max", ctx_r1.formulario.limites.ambientesMaximos);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.formulario.excedeMaximo("cantidad_ambientes") ? 71 : ctx_r1.formulario.excedeDecimales("cantidad_ambientes") ? 72 : ctx_r1.formulario.invalido("cantidad_ambientes") ? 73 : -1);
    i0.ɵɵadvance(6);
    i0.ɵɵattribute("max", ctx_r1.formulario.limites.superficieMaxima);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.formulario.excedeMaximo("superficie") ? 78 : ctx_r1.formulario.excedeDecimales("superficie") ? 79 : ctx_r1.formulario.invalido("superficie") ? 80 : -1);
    i0.ɵɵadvance(12);
    i0.ɵɵproperty("deshabilitado", ctx_r1.saving() || ctx_r1.imagesBusy() || ctx_r1.imageOrderSaving() || ctx_r1.form.disabled);
    i0.ɵɵadvance();
    i0.ɵɵproperty("fotos", ctx_r1.images())("minimo", 1)("disabled", ctx_r1.saving() || ctx_r1.imagesBusy() || ctx_r1.form.disabled)("quitarDeshabilitado", ctx_r1.imageOrderSaving());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.imagesBusy() || ctx_r1.imageOrderSaving() ? 92 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.imageError() ? 93 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.formulario.esTemporaria() ? 94 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.error() ? 95 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", ctx_r1.saving() || ctx_r1.imagesBusy() || ctx_r1.imageOrderSaving() || ctx_r1.form.disabled);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.saving() ? "Guardando\u2026" : "Guardar cambios", " ");
} }
// Edición de una publicación propia (la ruta exige anuncianteGuard). El alta vive en
// CrearPublicacionComponent; los dos comparten PublicacionFormulario.
export class PublicationFormComponent {
    route = inject(ActivatedRoute);
    router = inject(Router);
    listings = inject(ListingService);
    gestion = inject(GestionPublicacionesService);
    availabilityApi = inject(AvailabilityService);
    auth = inject(AuthService);
    formulario = inject(PublicacionFormulario);
    form = this.formulario.form;
    publicationId = Number(this.route.snapshot.paramMap.get('id'));
    loading = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "loading" }] : /* istanbul ignore next */ []));
    saving = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "saving" }] : /* istanbul ignore next */ []));
    imagesBusy = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "imagesBusy" }] : /* istanbul ignore next */ []));
    imageOrderSaving = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "imageOrderSaving" }] : /* istanbul ignore next */ []));
    images = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "images" }] : /* istanbul ignore next */ []));
    imageError = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "imageError" }] : /* istanbul ignore next */ []));
    error = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    availability = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "availability" }] : /* istanbul ignore next */ []));
    availabilityStart = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "availabilityStart" }] : /* istanbul ignore next */ []));
    availabilityEnd = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "availabilityEnd" }] : /* istanbul ignore next */ []));
    constructor() {
        this.formulario.cargarCatalogos().subscribe({
            error: (err) => this.error.set(`No pudimos cargar las opciones del formulario: ${err.message}`),
        });
        this.loadPublication(this.publicationId);
    }
    selectAvailabilityDate(range) {
        this.availabilityStart.set(range.start);
        this.availabilityEnd.set(range.end);
    }
    toggleAvailability(item) {
        if (item.reserva) {
            this.error.set('Ese día pertenece a una reserva confirmada y no puede modificarse.');
            return;
        }
        this.error.set('');
        this.availabilityApi.setAvailable(item.id, !item.disponible).subscribe({
            next: (updated) => this.availability.update((items) => items.map((current) => current.id === updated.id ? { ...current, disponible: updated.disponible } : current)),
            error: (err) => this.error.set(err.message),
        });
    }
    submit() {
        if (this.saving() || this.imagesBusy() || this.imageOrderSaving() || this.form.disabled)
            return;
        this.error.set('');
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.error.set('Revisá los campos obligatorios antes de continuar.');
            return;
        }
        if (!this.formulario.ubicacionConfirmada()) {
            this.error.set('Confirmá la ubicación exacta en el mapa antes de guardar.');
            document
                .getElementById('edit-location-map')
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        if (this.formulario.esTemporaria() &&
            !this.availability().length &&
            (!this.availabilityStart() || !this.availabilityEnd())) {
            this.error.set('La publicación temporal debe tener al menos un rango de días disponibles.');
            return;
        }
        this.saving.set(true);
        this.listings
            .update(this.publicationId, this.formulario.payload())
            .pipe(switchMap((publication) => {
            const start = this.availabilityStart();
            const end = this.availabilityEnd();
            if (this.formulario.esTemporaria() && start && end) {
                return this.availabilityApi
                    .addRange(publication.id, start, end)
                    .pipe(map(() => publication));
            }
            return of(publication);
        }), finalize(() => this.saving.set(false)))
            .subscribe({
            next: (publication) => this.router.navigate(['/publicaciones', publication.id]),
            error: (err) => this.error.set(err.message),
        });
    }
    confirmLocation(location) {
        this.formulario.confirmarUbicacion(location);
        if (this.error().startsWith('Confirmá la ubicación'))
            this.error.set('');
    }
    reorderImages({ desde, hasta }) {
        if (this.saving() || this.imagesBusy() || this.form.disabled)
            return;
        const anteriores = this.images();
        const imagenes = moverImagen(anteriores, desde, hasta);
        if (imagenes.every((imagen, index) => imagen.id === anteriores[index]?.id))
            return;
        this.images.set(imagenes);
        this.imageError.set('');
        if (this.imageOrderSaving())
            return;
        this.imageOrderSaving.set(true);
        this.saveImageOrder(anteriores);
    }
    saveImageOrder(confirmadas) {
        const ids = this.images().map(imagen => imagen.id);
        // Una sola escritura a la vez; si hubo más movimientos, después se envía el último orden.
        this.gestion.ordenarImagenes(this.publicationId, ids).subscribe({
            next: (ordenadas) => {
                if (this.images().some((imagen, index) => imagen.id !== ids[index])) {
                    this.saveImageOrder(ordenadas);
                    return;
                }
                this.images.set(ordenadas);
                this.imageOrderSaving.set(false);
            },
            error: (err) => {
                this.images.set(confirmadas);
                this.imageOrderSaving.set(false);
                this.imageError.set(`No se pudo guardar el orden. Restauramos el último orden confirmado. ${err.message}`);
            },
        });
    }
    uploadImages(archivos) {
        if (this.saving() || this.imagesBusy() || this.imageOrderSaving() || this.form.disabled)
            return;
        const { aceptadas, aviso } = filtrarImagenesPublicacion(archivos, this.images().length);
        this.imageError.set(aviso);
        if (!aceptadas.length)
            return;
        this.imagesBusy.set(true);
        from(aceptadas).pipe(concatMap((archivo) => this.gestion.subirImagen(this.publicationId, archivo)), finalize(() => this.imagesBusy.set(false))).subscribe({
            next: (imagen) => this.images.update((lista) => [...lista, imagen]),
            error: (err) => this.imageError.set(err.message),
        });
    }
    removeImage(index) {
        if (this.saving() || this.imagesBusy() || this.imageOrderSaving() || this.form.disabled || this.images().length <= 1)
            return;
        const imagen = this.images()[index];
        if (!imagen)
            return;
        this.imagesBusy.set(true);
        this.imageError.set('');
        this.gestion.eliminarImagen(imagen.id).pipe(finalize(() => this.imagesBusy.set(false))).subscribe({
            next: () => this.images.update((lista) => lista.filter((item) => item.id !== imagen.id)),
            error: (err) => this.imageError.set(err.message),
        });
    }
    loadPublication(id) {
        this.listings
            .getById(id)
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
            next: (item) => {
                if (item.anunciante?.idUsuario !== this.auth.currentUser()?.sub) {
                    this.error.set('No tenés permiso para modificar esta publicación.');
                    this.form.disable();
                    return;
                }
                this.formulario.cargar(item);
                this.images.set(item.imagenes ?? []);
                this.availabilityApi.getForAdministration(id).subscribe({
                    next: (dates) => this.availability.set(dates),
                });
            },
            error: () => this.error.set('No se pudo cargar la publicación que querés modificar.'),
        });
    }
    static ɵfac = function PublicationFormComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || PublicationFormComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: PublicationFormComponent, selectors: [["app-publication-form"]], features: [i0.ɵɵProvidersFeature([PublicacionFormulario])], decls: 12, vars: 1, consts: [[1, "publication-page"], [1, "page-heading"], ["routerLink", "/"], [1, "state"], [1, "publication-form", 3, "formGroup"], [1, "publication-form", 3, "ngSubmit", "formGroup"], [1, "form-card"], [1, "card-heading"], [1, "field", "field--full"], ["for", "title"], ["id", "title", "formControlName", "titulo", "maxlength", "255", "placeholder", "Ej. Departamento luminoso en el centro"], ["for", "description"], ["id", "description", "rows", "5", "formControlName", "descripcion", "maxlength", "5000", "placeholder", "Cont\u00E1 qu\u00E9 hace especial a la propiedad"], [1, "field"], ["for", "modality"], ["id", "modality", "formControlName", "idModalidad"], [3, "ngValue"], ["for", "propertyType"], ["id", "propertyType", "formControlName", "idTipoPropiedad"], ["for", "price"], ["id", "price", "type", "number", "min", "1", "step", "0.01", "inputmode", "decimal", "appSoloNumeros", "2", "formControlName", "precio"], ["for", "currency"], ["id", "currency", "formControlName", "idTipoMoneda"], ["for", "address"], ["id", "address", "formControlName", "direccion", "maxlength", "255", "placeholder", "Calle y n\u00FAmero"], ["idPrefix", "editar-ubicacion", 1, "field--full", 3, "provinciaChange", "localidadChange", "nombresChange", "touched", "required", "provinciaId", "localidadId", "disabled", "invalidProvincia", "invalidLocalidad"], ["id", "edit-location-map", 3, "locationConfirmed", "direccion", "ciudad", "provincia", "initialLatitude", "initialLongitude"], ["for", "rooms"], ["id", "rooms", "type", "number", "min", "1", "step", "1", "inputmode", "numeric", "appSoloNumeros", "0", "formControlName", "cantidad_ambientes"], ["for", "surface"], ["id", "surface", "type", "number", "min", "1", "step", "0.01", "inputmode", "decimal", "appSoloNumeros", "2", "formControlName", "superficie"], [1, "form-card", "form-card--calendar"], [3, "elegidas", "deshabilitado"], [3, "reordenar", "quitar", "fotos", "minimo", "disabled", "quitarDeshabilitado"], ["role", "status"], ["role", "alert", 1, "form-error"], [1, "form-actions"], ["type", "submit", 3, "disabled"], ["mode", "setup", 3, "rangeChange", "selectedStart", "selectedEnd"], [1, "manage-heading"], ["mode", "manage", 3, "availabilityToggle", "dates"]], template: function PublicationFormComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "header", 1)(2, "a", 2);
            i0.ɵɵtext(3, "\u2190 Volver");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "span");
            i0.ɵɵtext(5, "Administrar propiedad");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "h1");
            i0.ɵɵtext(7, "Modificar publicaci\u00F3n");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "p");
            i0.ɵɵtext(9, "Complet\u00E1 los datos del inmueble. Los campos marcados son obligatorios.");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(10, PublicationFormComponent_Conditional_10_Template, 4, 0, "div", 3)(11, PublicationFormComponent_Conditional_11_Template, 101, 35, "form", 4);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(10);
            i0.ɵɵconditional(ctx.loading() ? 10 : 11);
        } }, dependencies: [ReactiveFormsModule, i1.ɵNgNoValidate, i1.NgSelectOption, i1.ɵNgSelectMultipleOption, i1.DefaultValueAccessor, i1.NumberValueAccessor, i1.SelectControlValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.MaxLengthValidator, i1.MinValidator, i1.FormGroupDirective, i1.FormControlName, RouterLink,
            SoloNumerosDirective,
            AvailabilityCalendarComponent,
            SpinnerComponent,
            LocationPickerComponent,
            SelectorUbicacionComponent,
            CargaFotosComponent,
            GaleriaImagenesComponent], styles: [".publication-form[_ngcontent-%COMP%], .form-card[_ngcontent-%COMP%], .field[_ngcontent-%COMP%], .card-heading[_ngcontent-%COMP%]    > div[_ngcontent-%COMP%] { min-width: 0; }\r\n.publication-form[_ngcontent-%COMP%] { grid-template-columns: minmax(0, 1fr); }\r\n@media (max-width: 620px) {\r\n  .publication-form[_ngcontent-%COMP%]   .form-card[_ngcontent-%COMP%] { grid-template-columns: minmax(0, 1fr); }\r\n  .field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], .field[_ngcontent-%COMP%]   select[_ngcontent-%COMP%], .field[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] { min-width: 0; font-size: 1rem; }\r\n}\r\n[_nghost-%COMP%] { display: block; }.publication-page[_ngcontent-%COMP%] { min-height: 70vh; padding: 36px 20px 70px; background: #f3f6fa; }.page-heading[_ngcontent-%COMP%], .publication-form[_ngcontent-%COMP%] { width: min(100%, 920px); margin-inline: auto; }.page-heading[_ngcontent-%COMP%] { margin-bottom: 24px; }.page-heading[_ngcontent-%COMP%]    > a[_ngcontent-%COMP%] { color: var(--%NS%color-secondary); text-decoration: none; font-size: .85rem; font-weight: 700; }.page-heading[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] { display: block; margin-top: 24px; color: var(--%NS%color-primary); font-size: .72rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }.page-heading[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] { margin: 5px 0 8px; font-size: clamp(1.8rem, 4vw, 2.6rem); }.page-heading[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; color: var(--%NS%color-text-muted); }\r\n.publication-form[_ngcontent-%COMP%] { display: grid; gap: 20px; }.form-card[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; padding: 26px; border: 1px solid #dfe5ed; border-radius: 14px; background: white; box-shadow: var(--%NS%shadow-card); }.card-heading[_ngcontent-%COMP%] { grid-column: 1 / -1; display: flex; gap: 12px; align-items: flex-start; padding-bottom: 16px; border-bottom: 1px solid var(--%NS%color-border); }.card-heading[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] { display: grid; place-items: center; width: 30px; height: 30px; flex: 0 0 auto; border-radius: 50%; color: white; background: var(--%NS%color-primary); font-weight: 800; }.card-heading[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 0 0 4px; font-size: 1.05rem; }.card-heading[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; color: var(--%NS%color-text-muted); font-size: .82rem; }.field[_ngcontent-%COMP%] { display: grid; gap: 7px; }.field--full[_ngcontent-%COMP%] { grid-column: 1 / -1; }.field[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] { color: #344054; font-size: .8rem; font-weight: 700; }.field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%], .field[_ngcontent-%COMP%]   select[_ngcontent-%COMP%], .field[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] { width: 100%; min-height: 44px; padding: 10px 12px; border: 1px solid #d0d5dd; border-radius: 8px; background: white; color: var(--%NS%color-text); font: inherit; }.field[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] { resize: vertical; }.field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus, .field[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]:focus, .field[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%]:focus { outline: 3px solid rgb(14 70 161 / 13%); border-color: var(--%NS%color-secondary); }.field[_ngcontent-%COMP%]   .ng-invalid.ng-touched[_ngcontent-%COMP%] { border-color: var(--%NS%color-danger); }\r\n.form-card--calendar[_ngcontent-%COMP%] { grid-template-columns: 1fr; }.manage-heading[_ngcontent-%COMP%] { margin-top: 16px; padding-top: 20px; border-top: 1px solid var(--%NS%color-border); }.manage-heading[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] { margin: 0 0 5px; }.manage-heading[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0; color: var(--%NS%color-text-muted); font-size: .82rem; }.form-error[_ngcontent-%COMP%] { margin: 0; padding: 12px 15px; border-radius: 8px; color: #991b1b; background: #fee2e2; }.form-actions[_ngcontent-%COMP%] { display: flex; align-items: center; justify-content: flex-end; gap: 14px; }.form-actions[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); text-decoration: none; font-weight: 700; }.form-actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { min-height: 46px; padding: 0 24px; border: 0; border-radius: 8px; color: white; background: linear-gradient(90deg, var(--%NS%color-primary), var(--%NS%color-accent)); font-weight: 800; cursor: pointer; }.form-actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:disabled { opacity: .6; cursor: wait; }.state[_ngcontent-%COMP%] { min-height: 45vh; display: grid; place-content: center; justify-items: center; color: var(--%NS%color-text-muted); }\r\n@media (max-width: 620px) { .publication-page[_ngcontent-%COMP%] { padding-inline: 14px; }.form-card[_ngcontent-%COMP%] { grid-template-columns: 1fr; padding: 20px 16px; }.field--full[_ngcontent-%COMP%], .card-heading[_ngcontent-%COMP%] { grid-column: auto; }.form-actions[_ngcontent-%COMP%] { align-items: stretch; flex-direction: column-reverse; text-align: center; }.form-actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { width: 100%; } }\r\n.field[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { color: var(--%NS%color-danger); font-size: .78rem; }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PublicationFormComponent, [{
        type: Component,
        args: [{ selector: 'app-publication-form', standalone: true, imports: [
                    ReactiveFormsModule,
                    RouterLink,
                    SoloNumerosDirective,
                    AvailabilityCalendarComponent,
                    SpinnerComponent,
                    LocationPickerComponent,
                    SelectorUbicacionComponent,
                    CargaFotosComponent,
                    GaleriaImagenesComponent,
                ], providers: [PublicacionFormulario], template: "<section class=\"publication-page\">\r\n  <header class=\"page-heading\">\r\n    <a routerLink=\"/\">\u2190 Volver</a>\r\n    <span>Administrar propiedad</span>\r\n    <h1>Modificar publicaci\u00F3n</h1>\r\n    <p>Complet\u00E1 los datos del inmueble. Los campos marcados son obligatorios.</p>\r\n  </header>\r\n\r\n  @if (loading()) {\r\n    <div class=\"state\">\r\n      <app-spinner />\r\n      <p>Cargando publicaci\u00F3n\u2026</p>\r\n    </div>\r\n  } @else {\r\n    <form class=\"publication-form\" [formGroup]=\"form\" (ngSubmit)=\"submit()\">\r\n      <section class=\"form-card\">\r\n        <div class=\"card-heading\">\r\n          <span>1</span>\r\n          <div>\r\n            <h2>Informaci\u00F3n principal</h2>\r\n            <p>As\u00ED se mostrar\u00E1 tu propiedad en los resultados.</p>\r\n          </div>\r\n        </div>\r\n        <div class=\"field field--full\">\r\n          <label for=\"title\">T\u00EDtulo *</label\r\n          ><input\r\n            id=\"title\"\r\n            formControlName=\"titulo\"\r\n            maxlength=\"255\"\r\n            placeholder=\"Ej. Departamento luminoso en el centro\"\r\n          />\r\n          @if (formulario.invalido('titulo')) {\r\n            <small>Ingres\u00E1 un t\u00EDtulo de 15 a 255 caracteres, con letras o n\u00FAmeros. Solo se admiten espacios, comas, dos puntos y puntos.</small>\r\n          }\r\n        </div>\r\n        <div class=\"field field--full\">\r\n          <label for=\"description\">Descripci\u00F3n *</label\r\n          ><textarea\r\n            id=\"description\"\r\n            rows=\"5\"\r\n            formControlName=\"descripcion\"\r\n            maxlength=\"5000\"\r\n            placeholder=\"Cont\u00E1 qu\u00E9 hace especial a la propiedad\"\r\n          ></textarea>\r\n          <small>{{ form.controls.descripcion.value.length }}/5000 caracteres</small>\r\n        </div>\r\n        <div class=\"field\">\r\n          <label for=\"modality\">Modalidad *</label\r\n          ><select id=\"modality\" formControlName=\"idModalidad\">\r\n            <option [ngValue]=\"null\">Seleccionar</option>\r\n            @for (item of formulario.modalidades(); track item.id) {\r\n              <option [ngValue]=\"item.id\">{{ item.nombre }}</option>\r\n            }\r\n          </select>\r\n        </div>\r\n        <div class=\"field\">\r\n          <label for=\"propertyType\">Tipo de propiedad *</label\r\n          ><select id=\"propertyType\" formControlName=\"idTipoPropiedad\">\r\n            <option [ngValue]=\"null\">Seleccionar</option>\r\n            @for (item of formulario.tiposPropiedad(); track item.id) {\r\n              <option [ngValue]=\"item.id\">{{ item.nombre }}</option>\r\n            }\r\n          </select>\r\n        </div>\r\n        <div class=\"field\">\r\n          <label for=\"price\">Precio {{ formulario.esTemporaria() ? 'por d\u00EDa' : 'mensual' }} *</label\r\n          ><input id=\"price\" type=\"number\" min=\"1\" [attr.max]=\"formulario.limites.precioMaximo\" step=\"0.01\" inputmode=\"decimal\" appSoloNumeros=\"2\" formControlName=\"precio\" />\r\n          @if (formulario.excedeMaximo('precio')) {\r\n            <small>El precio m\u00E1ximo es {{ formulario.precioMaximoTexto }}.</small>\r\n          } @else if (formulario.excedeDecimales('precio')) {\r\n            <small>Ingres\u00E1 como m\u00E1ximo 2 decimales.</small>\r\n          } @else if (formulario.invalido('precio')) {\r\n            <small>Ingres\u00E1 un precio mayor a 0.</small>\r\n          }\r\n        </div>\r\n        <div class=\"field\">\r\n          <label for=\"currency\">Moneda *</label\r\n          ><select id=\"currency\" formControlName=\"idTipoMoneda\">\r\n            <option [ngValue]=\"null\">Seleccionar</option>\r\n            @for (item of formulario.monedas(); track item.id) {\r\n              <option [ngValue]=\"item.id\">{{ item.nombre }}</option>\r\n            }\r\n          </select>\r\n        </div>\r\n      </section>\r\n\r\n      <section class=\"form-card\">\r\n        <div class=\"card-heading\">\r\n          <span>2</span>\r\n          <div>\r\n            <h2>Ubicaci\u00F3n y caracter\u00EDsticas</h2>\r\n            <p>Ingres\u00E1 datos precisos para facilitar la b\u00FAsqueda.</p>\r\n          </div>\r\n        </div>\r\n        <div class=\"field field--full\">\r\n          <label for=\"address\">Direcci\u00F3n *</label\r\n          ><input\r\n            id=\"address\"\r\n            formControlName=\"direccion\"\r\n            maxlength=\"255\"\r\n            placeholder=\"Calle y n\u00FAmero\"\r\n          />\r\n        </div>\r\n        <app-selector-ubicacion\r\n          class=\"field--full\"\r\n          idPrefix=\"editar-ubicacion\"\r\n          [required]=\"true\"\r\n          [provinciaId]=\"formulario.provincia()\"\r\n          [localidadId]=\"formulario.ciudad()\"\r\n          [disabled]=\"form.disabled || saving()\"\r\n          [invalidProvincia]=\"formulario.invalido('idProvincia')\"\r\n          [invalidLocalidad]=\"formulario.invalido('idCiudad')\"\r\n          (provinciaChange)=\"formulario.seleccionarProvincia($event)\"\r\n          (localidadChange)=\"formulario.seleccionarLocalidad($event)\"\r\n          (nombresChange)=\"formulario.nombresUbicacion.set($event)\"\r\n          (touched)=\"form.controls.idCiudad.markAsTouched()\"\r\n        />\r\n        <app-location-picker\r\n          id=\"edit-location-map\"\r\n          [direccion]=\"form.controls.direccion.value\"\r\n          [ciudad]=\"formulario.nombreCiudad()\"\r\n          [provincia]=\"formulario.nombreProvincia()\"\r\n          [initialLatitude]=\"formulario.latitud()\"\r\n          [initialLongitude]=\"formulario.longitud()\"\r\n          (locationConfirmed)=\"confirmLocation($event)\"\r\n        />\r\n        <div class=\"field\">\r\n          <label for=\"rooms\">Ambientes *</label\r\n          ><input id=\"rooms\" type=\"number\" min=\"1\" [attr.max]=\"formulario.limites.ambientesMaximos\" step=\"1\" inputmode=\"numeric\" appSoloNumeros=\"0\" formControlName=\"cantidad_ambientes\" />\r\n          @if (formulario.excedeMaximo('cantidad_ambientes')) {\r\n            <small>El m\u00E1ximo es {{ formulario.ambientesMaximosTexto }} ambientes.</small>\r\n          } @else if (formulario.excedeDecimales('cantidad_ambientes')) {\r\n            <small>Ingres\u00E1 una cantidad entera de ambientes.</small>\r\n          } @else if (formulario.invalido('cantidad_ambientes')) {\r\n            <small>M\u00EDnimo 1 ambiente.</small>\r\n          }\r\n        </div>\r\n        <div class=\"field\">\r\n          <label for=\"surface\">Superficie (m\u00B2) *</label\r\n          ><input id=\"surface\" type=\"number\" min=\"1\" [attr.max]=\"formulario.limites.superficieMaxima\" step=\"0.01\" inputmode=\"decimal\" appSoloNumeros=\"2\" formControlName=\"superficie\" />\r\n          @if (formulario.excedeMaximo('superficie')) {\r\n            <small>La superficie m\u00E1xima es {{ formulario.superficieMaximaTexto }} m\u00B2.</small>\r\n          } @else if (formulario.excedeDecimales('superficie')) {\r\n            <small>Ingres\u00E1 como m\u00E1ximo 2 decimales.</small>\r\n          } @else if (formulario.invalido('superficie')) {\r\n            <small>Ingres\u00E1 la superficie.</small>\r\n          }\r\n        </div>\r\n      </section>\r\n\r\n      <section class=\"form-card form-card--calendar\">\r\n        <div class=\"card-heading\">\r\n          <span>3</span>\r\n          <div><h2>Fotos de la propiedad</h2><p>La primera foto es la portada. Los cambios en las fotos se guardan autom\u00E1ticamente.</p></div>\r\n        </div>\r\n        <app-carga-fotos [deshabilitado]=\"saving() || imagesBusy() || imageOrderSaving() || form.disabled\" (elegidas)=\"uploadImages($event)\" />\r\n        <app-galeria-imagenes [fotos]=\"images()\" [minimo]=\"1\"\r\n          [disabled]=\"saving() || imagesBusy() || form.disabled\" [quitarDeshabilitado]=\"imageOrderSaving()\"\r\n          (reordenar)=\"reorderImages($event)\" (quitar)=\"removeImage($event)\" />\r\n        @if (imagesBusy() || imageOrderSaving()) {\r\n          <p role=\"status\">{{ imagesBusy() ? 'Procesando fotos\u2026' : 'Guardando orden\u2026 Pod\u00E9s seguir acomodando las fotos.' }}</p>\r\n        }\r\n        @if (imageError()) { <p class=\"form-error\" role=\"alert\">{{ imageError() }}</p> }\r\n      </section>\r\n\r\n      @if (formulario.esTemporaria()) {\r\n        <section class=\"form-card form-card--calendar\">\r\n          <div class=\"card-heading\">\r\n            <span>4</span>\r\n            <div>\r\n              <h2>Calendario de disponibilidad</h2>\r\n              <p>\r\n                Agreg\u00E1 d\u00EDas disponibles. M\u00E1s abajo pod\u00E9s bloquear o habilitar los que ya cargaste.\r\n              </p>\r\n            </div>\r\n          </div>\r\n          <app-availability-calendar\r\n            mode=\"setup\"\r\n            [selectedStart]=\"availabilityStart()\"\r\n            [selectedEnd]=\"availabilityEnd()\"\r\n            (rangeChange)=\"selectAvailabilityDate($event)\"\r\n          />\r\n          @if (availability().length) {\r\n            <div class=\"manage-heading\">\r\n              <h3>Administrar d\u00EDas cargados</h3>\r\n              <p>Verde: disponible. Gris: bloqueado manualmente. Rojo: reservado y no editable.</p>\r\n            </div>\r\n            <app-availability-calendar\r\n              mode=\"manage\"\r\n              [dates]=\"availability()\"\r\n              (availabilityToggle)=\"toggleAvailability($event)\"\r\n            />\r\n          }\r\n        </section>\r\n      }\r\n\r\n      @if (error()) {\r\n        <p class=\"form-error\" role=\"alert\">{{ error() }}</p>\r\n      }\r\n      <footer class=\"form-actions\">\r\n        <a routerLink=\"/\">Cancelar</a\r\n        ><button type=\"submit\" [disabled]=\"saving() || imagesBusy() || imageOrderSaving() || form.disabled\">\r\n          {{ saving() ? 'Guardando\u2026' : 'Guardar cambios' }}\r\n        </button>\r\n      </footer>\r\n    </form>\r\n  }\r\n</section>\r\n", styles: [".publication-form, .form-card, .field, .card-heading > div { min-width: 0; }\r\n.publication-form { grid-template-columns: minmax(0, 1fr); }\r\n@media (max-width: 620px) {\r\n  .publication-form .form-card { grid-template-columns: minmax(0, 1fr); }\r\n  .field input, .field select, .field textarea { min-width: 0; font-size: 1rem; }\r\n}\r\n:host { display: block; }.publication-page { min-height: 70vh; padding: 36px 20px 70px; background: #f3f6fa; }.page-heading, .publication-form { width: min(100%, 920px); margin-inline: auto; }.page-heading { margin-bottom: 24px; }.page-heading > a { color: var(--color-secondary); text-decoration: none; font-size: .85rem; font-weight: 700; }.page-heading > span { display: block; margin-top: 24px; color: var(--color-primary); font-size: .72rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }.page-heading h1 { margin: 5px 0 8px; font-size: clamp(1.8rem, 4vw, 2.6rem); }.page-heading p { margin: 0; color: var(--color-text-muted); }\r\n.publication-form { display: grid; gap: 20px; }.form-card { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; padding: 26px; border: 1px solid #dfe5ed; border-radius: 14px; background: white; box-shadow: var(--shadow-card); }.card-heading { grid-column: 1 / -1; display: flex; gap: 12px; align-items: flex-start; padding-bottom: 16px; border-bottom: 1px solid var(--color-border); }.card-heading > span { display: grid; place-items: center; width: 30px; height: 30px; flex: 0 0 auto; border-radius: 50%; color: white; background: var(--color-primary); font-weight: 800; }.card-heading h2 { margin: 0 0 4px; font-size: 1.05rem; }.card-heading p { margin: 0; color: var(--color-text-muted); font-size: .82rem; }.field { display: grid; gap: 7px; }.field--full { grid-column: 1 / -1; }.field label { color: #344054; font-size: .8rem; font-weight: 700; }.field input, .field select, .field textarea { width: 100%; min-height: 44px; padding: 10px 12px; border: 1px solid #d0d5dd; border-radius: 8px; background: white; color: var(--color-text); font: inherit; }.field textarea { resize: vertical; }.field input:focus, .field select:focus, .field textarea:focus { outline: 3px solid rgb(14 70 161 / 13%); border-color: var(--color-secondary); }.field .ng-invalid.ng-touched { border-color: var(--color-danger); }\r\n.form-card--calendar { grid-template-columns: 1fr; }.manage-heading { margin-top: 16px; padding-top: 20px; border-top: 1px solid var(--color-border); }.manage-heading h3 { margin: 0 0 5px; }.manage-heading p { margin: 0; color: var(--color-text-muted); font-size: .82rem; }.form-error { margin: 0; padding: 12px 15px; border-radius: 8px; color: #991b1b; background: #fee2e2; }.form-actions { display: flex; align-items: center; justify-content: flex-end; gap: 14px; }.form-actions a { color: var(--color-text-muted); text-decoration: none; font-weight: 700; }.form-actions button { min-height: 46px; padding: 0 24px; border: 0; border-radius: 8px; color: white; background: linear-gradient(90deg, var(--color-primary), var(--color-accent)); font-weight: 800; cursor: pointer; }.form-actions button:disabled { opacity: .6; cursor: wait; }.state { min-height: 45vh; display: grid; place-content: center; justify-items: center; color: var(--color-text-muted); }\r\n@media (max-width: 620px) { .publication-page { padding-inline: 14px; }.form-card { grid-template-columns: 1fr; padding: 20px 16px; }.field--full, .card-heading { grid-column: auto; }.form-actions { align-items: stretch; flex-direction: column-reverse; text-align: center; }.form-actions button { width: 100%; } }\r\n.field small { color: var(--color-danger); font-size: .78rem; }\r\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(PublicationFormComponent, { className: "PublicationFormComponent", filePath: "src/app/features/publication-form/publication-form.component.ts", lineNumber: 49 }); })();
