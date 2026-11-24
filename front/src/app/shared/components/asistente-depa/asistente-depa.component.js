import { HttpErrorResponse } from '@angular/common/http';
import { afterNextRender, Component, DestroyRef, inject, Injector, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideArrowUpRight, LucideSend, LucideSparkles, LucideX } from '@lucide/angular';
import { AsistenteDepaService } from '../../../core/services/asistente-depa.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
const _c0 = ["entrada"];
const _c1 = ["historial"];
const _c2 = ["lanzador"];
const _c3 = a0 => ["/publicaciones", a0];
const _forTrack0 = ($index, $item) => $item.id;
function AsistenteDepaComponent_Conditional_0_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p", 19);
    i0.ɵɵtext(1, "\u00A1Hola! Pod\u00E9s pedirme que busque un alquiler o preguntarme c\u00F3mo funciona DEPA.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "div", 20)(3, "button", 21);
    i0.ɵɵlistener("click", function AsistenteDepaComponent_Conditional_0_Conditional_14_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.enviar("Busco un alquiler temporario en Villa Mar\u00EDa")); });
    i0.ɵɵtext(4, "Buscar un temporario");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "button", 21);
    i0.ɵɵlistener("click", function AsistenteDepaComponent_Conditional_0_Conditional_14_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.enviar("\u00BFC\u00F3mo hago para reservar?")); });
    i0.ɵɵtext(6, "\u00BFC\u00F3mo hago para reservar?");
    i0.ɵɵelementEnd()();
} }
function AsistenteDepaComponent_Conditional_0_For_16_For_5_For_2_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "strong");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const fragmento_r4 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(fragmento_r4.texto);
} }
function AsistenteDepaComponent_Conditional_0_For_16_For_5_For_2_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const fragmento_r4 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵtextInterpolate1(" ", fragmento_r4.texto, " ");
} }
function AsistenteDepaComponent_Conditional_0_For_16_For_5_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, AsistenteDepaComponent_Conditional_0_For_16_For_5_For_2_Conditional_0_Template, 2, 1, "strong")(1, AsistenteDepaComponent_Conditional_0_For_16_For_5_For_2_Conditional_1_Template, 1, 1);
} if (rf & 2) {
    const fragmento_r4 = ctx.$implicit;
    i0.ɵɵconditional(fragmento_r4.destacado ? 0 : 1);
} }
function AsistenteDepaComponent_Conditional_0_For_16_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 27);
    i0.ɵɵrepeaterCreate(1, AsistenteDepaComponent_Conditional_0_For_16_For_5_For_2_Template, 2, 1, null, null, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const bloque_r5 = ctx.$implicit;
    i0.ɵɵclassProp("mensaje__linea--lista", bloque_r5.tipo === "lista")("mensaje__linea--titulo", bloque_r5.tipo === "titulo")("mensaje__linea--vacia", !bloque_r5.fragmentos.length);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(bloque_r5.fragmentos);
} }
function AsistenteDepaComponent_Conditional_0_For_16_For_7_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "a", 28);
    i0.ɵɵlistener("click", function AsistenteDepaComponent_Conditional_0_For_16_For_7_Template_a_click_0_listener() { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.cerrar(false)); });
    i0.ɵɵelementStart(1, "span", 29)(2, "span", 30);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "strong");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "span", 31);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(10, "svg", 32);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const publicacion_r7 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("resultado--temporal", ctx_r1.tipoModalidad(publicacion_r7.modalidad) === "temporal")("resultado--largo", ctx_r1.tipoModalidad(publicacion_r7.modalidad) === "largo");
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(12, _c3, publicacion_r7.id));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(publicacion_r7.modalidad);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(publicacion_r7.titulo);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", publicacion_r7.ciudad, " \u00B7 ", publicacion_r7.ambientes, " amb.");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", ctx_r1.importe.format(publicacion_r7.precio), " ", publicacion_r7.moneda);
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 17);
} }
function AsistenteDepaComponent_Conditional_0_For_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 22);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "div", 23)(3, "div", 24);
    i0.ɵɵrepeaterCreate(4, AsistenteDepaComponent_Conditional_0_For_16_For_5_Template, 3, 6, "div", 25, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(6, AsistenteDepaComponent_Conditional_0_For_16_For_7_Template, 11, 14, "a", 26, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const intercambio_r8 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(intercambio_r8.pregunta);
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(intercambio_r8.bloques);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(intercambio_r8.publicaciones);
} }
function AsistenteDepaComponent_Conditional_0_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 22);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "div", 33);
    i0.ɵɵelement(3, "span")(4, "span")(5, "span");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.consultaEnCurso());
} }
function AsistenteDepaComponent_Conditional_0_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 14);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.error());
} }
function AsistenteDepaComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 5);
    i0.ɵɵlistener("keydown.escape", function AsistenteDepaComponent_Conditional_0_Template_section_keydown_escape_0_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); ctx_r1.cerrar(); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵelementStart(1, "header", 6)(2, "div", 7)(3, "span", 8);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(4, "svg", 9);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(5, "div")(6, "h2", 10);
    i0.ɵɵtext(7, "depa");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "p");
    i0.ɵɵtext(9, "Asistente de DEPA");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(10, "button", 11);
    i0.ɵɵlistener("click", function AsistenteDepaComponent_Conditional_0_Template_button_click_10_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.cerrar()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(11, "svg", 12);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(12, "div", 13, 0);
    i0.ɵɵconditionalCreate(14, AsistenteDepaComponent_Conditional_0_Conditional_14_Template, 7, 0);
    i0.ɵɵrepeaterCreate(15, AsistenteDepaComponent_Conditional_0_For_16_Template, 8, 1, null, null, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵconditionalCreate(17, AsistenteDepaComponent_Conditional_0_Conditional_17_Template, 6, 1);
    i0.ɵɵconditionalCreate(18, AsistenteDepaComponent_Conditional_0_Conditional_18_Template, 2, 1, "p", 14);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "form", 15);
    i0.ɵɵlistener("ngSubmit", function AsistenteDepaComponent_Conditional_0_Template_form_ngSubmit_19_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.enviar()); });
    i0.ɵɵelementStart(20, "textarea", 16, 1);
    i0.ɵɵtwoWayListener("ngModelChange", function AsistenteDepaComponent_Conditional_0_Template_textarea_ngModelChange_20_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r1.borrador, $event) || (ctx_r1.borrador = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("keydown.enter", function AsistenteDepaComponent_Conditional_0_Template_textarea_keydown_enter_20_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.manejarEnter($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(22, "button", 17);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(23, "svg", 18);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("size", 19);
    i0.ɵɵadvance(7);
    i0.ɵɵproperty("size", 22);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(!ctx_r1.intercambios().length && !ctx_r1.consultaEnCurso() && !ctx_r1.error() ? 14 : -1);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.intercambios());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.consultaEnCurso() ? 17 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.error() ? 18 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("maxlength", ctx_r1.limiteMensaje)("readOnly", !!ctx_r1.consultaEnCurso());
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.borrador);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !ctx_r1.borrador.trim() || !!ctx_r1.consultaEnCurso());
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 19);
} }
function AsistenteDepaComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 34, 2);
    i0.ɵɵlistener("click", function AsistenteDepaComponent_Conditional_1_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.abrir()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 9);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4, "Preguntale a depa");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 21);
} }
export class AsistenteDepaComponent {
    servicio = inject(AsistenteDepaService);
    destroyRef = inject(DestroyRef);
    injector = inject(Injector);
    entrada = viewChild('entrada', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "entrada" }] : /* istanbul ignore next */ []));
    historial = viewChild('historial', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "historial" }] : /* istanbul ignore next */ []));
    lanzador = viewChild('lanzador', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "lanzador" }] : /* istanbul ignore next */ []));
    abierto = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "abierto" }] : /* istanbul ignore next */ []));
    intercambios = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "intercambios" }] : /* istanbul ignore next */ []));
    consultaEnCurso = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "consultaEnCurso" }] : /* istanbul ignore next */ []));
    error = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    limiteMensaje = 500;
    importe = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
    borrador = '';
    abrir() {
        this.abierto.set(true);
        afterNextRender(() => {
            this.entrada()?.nativeElement.focus();
            this.desplazarHistorial();
        }, { injector: this.injector });
    }
    cerrar(devolverFoco = true) {
        this.abierto.set(false);
        if (devolverFoco) {
            afterNextRender(() => this.lanzador()?.nativeElement.focus(), { injector: this.injector });
        }
    }
    manejarEnter(evento) {
        if (!(evento instanceof KeyboardEvent) || evento.shiftKey || evento.isComposing)
            return;
        evento.preventDefault();
        this.enviar();
    }
    enviar(texto = this.borrador) {
        const pregunta = texto.trim();
        if (!pregunta || pregunta.length > this.limiteMensaje || this.consultaEnCurso())
            return;
        const mensajes = this.intercambios().slice(-4).flatMap((intercambio) => [
            { rol: 'user', contenido: intercambio.pregunta },
            { rol: 'assistant', contenido: Array.from(intercambio.respuesta).slice(0, this.limiteMensaje).join('') },
        ]);
        mensajes.push({ rol: 'user', contenido: pregunta });
        this.borrador = '';
        this.error.set('');
        this.consultaEnCurso.set(pregunta);
        this.programarDesplazamiento();
        this.servicio.consultar(mensajes).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (respuesta) => {
                const seguirConversacion = this.estaCercaDelFinal();
                this.intercambios.update((actuales) => [...actuales, {
                        pregunta, ...respuesta, bloques: this.formatearRespuesta(respuesta.respuesta),
                    }]);
                this.consultaEnCurso.set('');
                if (seguirConversacion)
                    this.mostrarInicioRespuesta();
            },
            error: (error) => {
                this.consultaEnCurso.set('');
                this.borrador = pregunta;
                this.error.set(error instanceof HttpErrorResponse && error.status === 429
                    ? 'Hiciste varias consultas seguidas. Probá de nuevo en un minuto.'
                    : 'No pudimos responderte en este momento. Probá de nuevo en unos instantes.');
                this.programarDesplazamiento();
            },
        });
    }
    programarDesplazamiento() {
        afterNextRender(() => this.desplazarHistorial(true), { injector: this.injector });
    }
    desplazarHistorial(suave = false) {
        const panel = this.historial()?.nativeElement;
        if (panel)
            panel.scrollTo({ top: panel.scrollHeight, behavior: suave ? 'smooth' : 'auto' });
    }
    estaCercaDelFinal() {
        const panel = this.historial()?.nativeElement;
        return !panel || panel.scrollHeight - panel.scrollTop - panel.clientHeight < 100;
    }
    mostrarInicioRespuesta() {
        afterNextRender(() => {
            const panel = this.historial()?.nativeElement;
            const respuesta = panel?.querySelector('.asistente__respuesta:last-of-type');
            if (!panel || !respuesta)
                return;
            const top = panel.scrollTop + respuesta.getBoundingClientRect().top - panel.getBoundingClientRect().top - 12;
            panel.scrollTo({ top, behavior: 'smooth' });
        }, { injector: this.injector });
    }
    formatearRespuesta(respuesta) {
        return respuesta.split(/\r?\n/).map((linea) => {
            const titulo = /^\s*#{1,6}\s+/.test(linea);
            const lista = /^\s*[-*+]\s+/.test(linea);
            const contenido = linea.replace(/^\s*(?:#{1,6}\s+|[-*+]\s+)/, '');
            const fragmentos = contenido.split(/(\*\*[^*]+\*\*|__[^_]+__)/g).filter(Boolean).map((texto) => {
                const destacado = /^(?:\*\*.+\*\*|__.+__)$/.test(texto);
                return { texto: destacado ? texto.slice(2, -2) : texto, destacado };
            });
            return { tipo: titulo ? 'titulo' : lista ? 'lista' : 'texto', fragmentos };
        });
    }
    tipoModalidad(modalidad) {
        const nombre = modalidad.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        return nombre.includes('tempor') ? 'temporal' : nombre.includes('largo') ? 'largo' : null;
    }
    static ɵfac = function AsistenteDepaComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AsistenteDepaComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AsistenteDepaComponent, selectors: [["app-asistente-depa"]], viewQuery: function AsistenteDepaComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.entrada, _c0, 5)(ctx.historial, _c1, 5)(ctx.lanzador, _c2, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance(3);
        } }, decls: 2, vars: 1, consts: [["historial", ""], ["entrada", ""], ["lanzador", ""], ["aria-labelledby", "asistente-depa-titulo", 1, "asistente"], ["type", "button", "aria-label", "Abrir el asistente depa", 1, "asistente__lanzador"], ["aria-labelledby", "asistente-depa-titulo", 1, "asistente", 3, "keydown.escape"], [1, "asistente__encabezado"], [1, "asistente__marca"], [1, "asistente__icono"], ["lucideSparkles", "", "aria-hidden", "true", 3, "size"], ["id", "asistente-depa-titulo"], ["type", "button", "aria-label", "Cerrar asistente", 1, "asistente__cerrar", 3, "click"], ["lucideX", "", "aria-hidden", "true", 3, "size"], ["role", "log", "aria-label", "Conversaci\u00F3n con depa", 1, "asistente__historial"], ["role", "alert", 1, "asistente__error"], [1, "asistente__formulario", 3, "ngSubmit"], ["name", "consulta", "rows", "2", "aria-label", "Tu consulta para depa", "placeholder", "Escrib\u00ED tu consulta\u2026", 3, "ngModelChange", "keydown.enter", "maxlength", "readOnly", "ngModel"], ["type", "submit", "aria-label", "Enviar consulta", 3, "disabled"], ["lucideSend", "", "aria-hidden", "true", 3, "size"], [1, "mensaje"], [1, "asistente__sugerencias"], ["type", "button", 3, "click"], [1, "mensaje", "mensaje--propio"], [1, "asistente__respuesta"], [1, "mensaje", "mensaje--respuesta"], [1, "mensaje__linea", 3, "mensaje__linea--lista", "mensaje__linea--titulo", "mensaje__linea--vacia"], [1, "resultado", 3, "resultado--temporal", "resultado--largo", "routerLink"], [1, "mensaje__linea"], [1, "resultado", 3, "click", "routerLink"], [1, "resultado__detalle"], [1, "resultado__modalidad"], [1, "resultado__precio"], ["lucideArrowUpRight", "", "aria-hidden", "true", 3, "size"], ["role", "status", "aria-label", "depa est\u00E1 respondiendo", 1, "mensaje", "asistente__escribiendo"], ["type", "button", "aria-label", "Abrir el asistente depa", 1, "asistente__lanzador", 3, "click"]], template: function AsistenteDepaComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, AsistenteDepaComponent_Conditional_0_Template, 24, 10, "section", 3)(1, AsistenteDepaComponent_Conditional_1_Template, 5, 1, "button", 4);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.abierto() ? 0 : 1);
        } }, dependencies: [FormsModule, i1.ɵNgNoValidate, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.MaxLengthValidator, i1.NgModel, i1.NgForm, RouterLink, LucideArrowUpRight, LucideSend, LucideSparkles, LucideX], styles: [".asistente[_ngcontent-%COMP%], \n.asistente__lanzador[_ngcontent-%COMP%] {\n  position: fixed;\n  z-index: 29;\n  inset-inline-start: max(1rem, env(safe-area-inset-left));\n  bottom: max(1rem, env(safe-area-inset-bottom));\n}\n\nbutton[_ngcontent-%COMP%], \na[_ngcontent-%COMP%] {\n  touch-action: manipulation;\n}\n\nbutton[_ngcontent-%COMP%]:focus-visible, \na[_ngcontent-%COMP%]:focus-visible, \ntextarea[_ngcontent-%COMP%]:focus-visible {\n  outline: 2px solid var(--%NS%color-secondary);\n  outline-offset: 2px;\n}\n\n.asistente__lanzador[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  overflow: hidden;\n  min-height: 3.2rem;\n  padding: .55rem .9rem;\n  border: 1px solid #f1a62d;\n  border-radius: var(--%NS%radius-pill);\n  background: #ffbf55;\n  color: #30210c;\n  box-shadow: 0 5px 20px #10182824;\n  font-weight: 750;\n  transition: background-color .25s ease;\n}\n\n.asistente__lanzador[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { flex: none; }\n\n.asistente__lanzador[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  max-width: 0;\n  margin-inline-start: 0;\n  opacity: 0;\n  overflow: hidden;\n  white-space: nowrap;\n  transition: max-width .3s ease, margin .3s ease, opacity .2s ease;\n}\n\n.asistente__lanzador[_ngcontent-%COMP%]:hover, \n.asistente__lanzador[_ngcontent-%COMP%]:focus-visible { background: #ffd081; }\n\n.asistente__lanzador[_ngcontent-%COMP%]:hover   span[_ngcontent-%COMP%], \n.asistente__lanzador[_ngcontent-%COMP%]:focus-visible   span[_ngcontent-%COMP%] {\n  max-width: 12rem;\n  margin-inline-start: .55rem;\n  opacity: 1;\n}\n\n.asistente__lanzador[_ngcontent-%COMP%]::after {\n  content: '';\n  position: absolute;\n  inset: 0;\n  pointer-events: none;\n  background: linear-gradient(110deg, transparent 35%, #ffffff75 50%, transparent 65%);\n  transform: translateX(-150%);\n  animation: _ngcontent-%COMP%_asistente-reflejo 4s ease-in-out infinite;\n}\n\n@keyframes _ngcontent-%COMP%_asistente-reflejo {\n  0%, 65% { transform: translateX(-150%); }\n  90%, 100% { transform: translateX(150%); }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .asistente__lanzador[_ngcontent-%COMP%], \n   .asistente__lanzador[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { transition: none; }\n  .asistente__lanzador[_ngcontent-%COMP%]::after { animation: none; }\n}\n\n.asistente[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-rows: auto minmax(0, 1fr) auto;\n  width: min(25rem, calc(100vw - 2rem));\n  height: min(35rem, calc(100dvh - 5rem));\n  border: 1px solid var(--%NS%color-border);\n  border-radius: var(--%NS%radius-lg);\n  background: var(--%NS%color-surface);\n  box-shadow: 0 15px 48px #10182829;\n  overflow: hidden;\n}\n\n.asistente__encabezado[_ngcontent-%COMP%], \n.asistente__marca[_ngcontent-%COMP%], \n.asistente__formulario[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n}\n\n.asistente__encabezado[_ngcontent-%COMP%] {\n  justify-content: space-between;\n  padding: .65rem .8rem .65rem 1rem;\n  color: white;\n  background: var(--%NS%color-secondary-dark);\n}\n\n.asistente__marca[_ngcontent-%COMP%] { gap: .65rem; }\n.asistente__marca[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 0; font-size: 1.25rem; font-weight: 800; line-height: 1.1; }\n.asistente__marca[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: .12rem 0 0; font-size: .78rem; color: #e8eefb; }\n\n.asistente__icono[_ngcontent-%COMP%], \n.asistente__cerrar[_ngcontent-%COMP%], \n.asistente__formulario[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  display: grid;\n  place-items: center;\n  flex: none;\n  width: 2.75rem;\n  height: 2.75rem;\n  border-radius: var(--%NS%radius-md);\n}\n\n.asistente__icono[_ngcontent-%COMP%] { background: #ffbf55; color: #30210c; }\n.asistente__cerrar[_ngcontent-%COMP%]:hover { background: #ffffff26; }\n.asistente__cerrar[_ngcontent-%COMP%]:focus-visible { outline-color: #ffbf55; }\n\n.asistente__historial[_ngcontent-%COMP%] {\n  overflow: auto;\n  overscroll-behavior: contain;\n  padding: 1rem;\n}\n\n.mensaje[_ngcontent-%COMP%], \n.asistente__respuesta[_ngcontent-%COMP%] { overflow-wrap: anywhere; }\n.mensaje[_ngcontent-%COMP%] {\n  width: fit-content;\n  max-width: 94%;\n  margin: 0 0 .65rem;\n  padding: .65rem .8rem;\n  border-radius: var(--%NS%radius-md);\n  background: var(--%NS%color-bg);\n  color: var(--%NS%color-text);\n  white-space: pre-wrap;\n  font-size: .92rem;\n}\n\n.mensaje--propio[_ngcontent-%COMP%] { margin-inline-start: auto; background: var(--%NS%color-secondary-light); }\n.asistente__respuesta[_ngcontent-%COMP%] {\n  margin-bottom: .8rem;\n  transform-origin: 1.4rem 0;\n  animation: _ngcontent-%COMP%_respuesta-aparecer .3s ease-out both;\n}\n.mensaje--respuesta[_ngcontent-%COMP%] { white-space: normal; line-height: 1.5; }\n.mensaje__linea[_ngcontent-%COMP%] { white-space: pre-wrap; }\n.mensaje__linea--vacia[_ngcontent-%COMP%] { height: .7em; }\n.mensaje__linea--titulo[_ngcontent-%COMP%] { font-weight: 750; margin-block: .3rem; }\n.mensaje__linea--lista[_ngcontent-%COMP%] { position: relative; padding-inline-start: 1rem; }\n.mensaje__linea--%NS%lista[_ngcontent-%COMP%]::before { content: '\u2022'; position: absolute; inset-inline-start: .15rem; }\n.asistente__escribiendo[_ngcontent-%COMP%] { display: flex; align-items: center; gap: .3rem; min-height: 2.5rem; }\n.asistente__escribiendo[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  width: .4rem;\n  height: .4rem;\n  border-radius: 50%;\n  background: var(--%NS%color-text-muted);\n  animation: _ngcontent-%COMP%_punto-escribiendo 1.2s ease-in-out infinite;\n}\n.asistente__escribiendo[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]:nth-child(2) { animation-delay: .16s; }\n.asistente__escribiendo[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]:nth-child(3) { animation-delay: .32s; }\n@keyframes _ngcontent-%COMP%_punto-escribiendo {\n  0%, 60%, 100% { opacity: .4; transform: translateY(0); }\n  30% { opacity: 1; transform: translateY(-.25rem); }\n}\n@keyframes _ngcontent-%COMP%_respuesta-aparecer {\n  from { opacity: 0; transform: translateY(.35rem) scale(.97); }\n  to { opacity: 1; transform: translateY(0) scale(1); }\n}\n.asistente__sugerencias[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; gap: .4rem; }\n.asistente__sugerencias[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  padding: .45rem .7rem;\n  border: 1px solid var(--%NS%color-border);\n  border-radius: var(--%NS%radius-pill);\n  color: var(--%NS%color-secondary-dark);\n  font-size: .8rem;\n  font-weight: 650;\n}\n\n.resultado[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  gap: .55rem;\n  margin: .35rem 0;\n  padding: .55rem .7rem;\n  border: 1px solid var(--%NS%color-border);\n  border-radius: var(--%NS%radius-md);\n  color: var(--%NS%color-secondary-dark);\n  font-size: .875rem;\n}\n\n.resultado[_ngcontent-%COMP%]:hover, \n.asistente__sugerencias[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover { background: var(--%NS%color-secondary-light); }\n.resultado[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { flex: none; }\n.resultado--temporal[_ngcontent-%COMP%] { border-inline-start: 3px solid var(--%NS%color-secondary); }\n.resultado--largo[_ngcontent-%COMP%] { border-inline-start: 3px solid var(--%NS%color-primary); }\n.resultado__detalle[_ngcontent-%COMP%] { display: grid; gap: .2rem; }\n.resultado__detalle[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); font-size: .8rem; }\n.resultado__detalle[_ngcontent-%COMP%]   .resultado__modalidad[_ngcontent-%COMP%] {\n  width: fit-content;\n  padding: .15rem .5rem;\n  border-radius: var(--%NS%radius-pill);\n  background: var(--%NS%color-bg);\n  font-size: .7rem;\n  font-weight: 750;\n}\n.resultado--temporal[_ngcontent-%COMP%]   .resultado__modalidad[_ngcontent-%COMP%] { background: var(--%NS%color-secondary-light); color: var(--%NS%color-secondary-dark); }\n.resultado--largo[_ngcontent-%COMP%]   .resultado__modalidad[_ngcontent-%COMP%] { background: var(--%NS%color-primary-light); color: var(--%NS%color-primary-dark); }\n.resultado__detalle[_ngcontent-%COMP%]   .resultado__precio[_ngcontent-%COMP%] { color: var(--%NS%color-text); font-weight: 750; }\n.asistente__estado[_ngcontent-%COMP%], \n.asistente__error[_ngcontent-%COMP%] { margin: .5rem 0; font-size: .85rem; }\n.asistente__estado[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); }\n.asistente__error[_ngcontent-%COMP%] { color: var(--%NS%color-primary-dark); }\n\n.asistente__formulario[_ngcontent-%COMP%] {\n  gap: .55rem;\n  padding: .7rem;\n  border-top: 1px solid var(--%NS%color-border);\n}\n\n.asistente__formulario[_ngcontent-%COMP%]   textarea[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n  resize: none;\n  padding: .48rem .65rem;\n  border: 1px solid var(--%NS%color-border);\n  border-radius: var(--%NS%radius-sm);\n  font-size: 1rem;\n}\n\n.asistente__formulario[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { background: var(--%NS%color-secondary); color: white; }\n.asistente__formulario[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:disabled { opacity: .45; cursor: default; }\n\n@media (max-width: 520px) {\n  .asistente[_ngcontent-%COMP%] { z-index: 35; }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .asistente__respuesta[_ngcontent-%COMP%], .asistente__escribiendo[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { animation: none; }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AsistenteDepaComponent, [{
        type: Component,
        args: [{ selector: 'app-asistente-depa', imports: [FormsModule, RouterLink, LucideArrowUpRight, LucideSend, LucideSparkles, LucideX], template: "@if (abierto()) {\n  <section class=\"asistente\" aria-labelledby=\"asistente-depa-titulo\" (keydown.escape)=\"cerrar(); $event.stopPropagation()\">\n    <header class=\"asistente__encabezado\">\n      <div class=\"asistente__marca\">\n        <span class=\"asistente__icono\"><svg lucideSparkles [size]=\"19\" aria-hidden=\"true\"></svg></span>\n        <div>\n          <h2 id=\"asistente-depa-titulo\">depa</h2>\n          <p>Asistente de DEPA</p>\n        </div>\n      </div>\n      <button type=\"button\" class=\"asistente__cerrar\" aria-label=\"Cerrar asistente\" (click)=\"cerrar()\">\n        <svg lucideX [size]=\"22\" aria-hidden=\"true\"></svg>\n      </button>\n    </header>\n\n    <div #historial class=\"asistente__historial\" role=\"log\" aria-label=\"Conversaci\u00F3n con depa\">\n      @if (!intercambios().length && !consultaEnCurso() && !error()) {\n        <p class=\"mensaje\">\u00A1Hola! Pod\u00E9s pedirme que busque un alquiler o preguntarme c\u00F3mo funciona DEPA.</p>\n        <div class=\"asistente__sugerencias\">\n          <button type=\"button\" (click)=\"enviar('Busco un alquiler temporario en Villa Mar\u00EDa')\">Buscar un temporario</button>\n          <button type=\"button\" (click)=\"enviar('\u00BFC\u00F3mo hago para reservar?')\">\u00BFC\u00F3mo hago para reservar?</button>\n        </div>\n      }\n\n      @for (intercambio of intercambios(); track $index) {\n        <p class=\"mensaje mensaje--propio\">{{ intercambio.pregunta }}</p>\n        <div class=\"asistente__respuesta\">\n          <div class=\"mensaje mensaje--respuesta\">\n            @for (bloque of intercambio.bloques; track $index) {\n              <div class=\"mensaje__linea\" [class.mensaje__linea--lista]=\"bloque.tipo === 'lista'\"\n                [class.mensaje__linea--titulo]=\"bloque.tipo === 'titulo'\"\n                [class.mensaje__linea--vacia]=\"!bloque.fragmentos.length\">\n                @for (fragmento of bloque.fragmentos; track $index) {\n                  @if (fragmento.destacado) { <strong>{{ fragmento.texto }}</strong> }\n                  @else { {{ fragmento.texto }} }\n                }\n              </div>\n            }\n          </div>\n          @for (publicacion of intercambio.publicaciones; track publicacion.id) {\n            <a class=\"resultado\" [class.resultado--temporal]=\"tipoModalidad(publicacion.modalidad) === 'temporal'\"\n              [class.resultado--largo]=\"tipoModalidad(publicacion.modalidad) === 'largo'\"\n              [routerLink]=\"['/publicaciones', publicacion.id]\" (click)=\"cerrar(false)\">\n              <span class=\"resultado__detalle\">\n                <span class=\"resultado__modalidad\">{{ publicacion.modalidad }}</span>\n                <strong>{{ publicacion.titulo }}</strong>\n                <span>{{ publicacion.ciudad }} \u00B7 {{ publicacion.ambientes }} amb.</span>\n                <span class=\"resultado__precio\">{{ importe.format(publicacion.precio) }} {{ publicacion.moneda }}</span>\n              </span>\n              <svg lucideArrowUpRight [size]=\"17\" aria-hidden=\"true\"></svg>\n            </a>\n          }\n        </div>\n      }\n      @if (consultaEnCurso()) {\n        <p class=\"mensaje mensaje--propio\">{{ consultaEnCurso() }}</p>\n        <div class=\"mensaje asistente__escribiendo\" role=\"status\" aria-label=\"depa est\u00E1 respondiendo\">\n          <span></span><span></span><span></span>\n        </div>\n      }\n      @if (error()) {\n        <p class=\"asistente__error\" role=\"alert\">{{ error() }}</p>\n      }\n    </div>\n\n    <form class=\"asistente__formulario\" (ngSubmit)=\"enviar()\">\n      <textarea #entrada name=\"consulta\" rows=\"2\" aria-label=\"Tu consulta para depa\"\n        placeholder=\"Escrib\u00ED tu consulta\u2026\" [maxlength]=\"limiteMensaje\" [readOnly]=\"!!consultaEnCurso()\"\n        [(ngModel)]=\"borrador\" (keydown.enter)=\"manejarEnter($event)\"></textarea>\n      <button type=\"submit\" aria-label=\"Enviar consulta\" [disabled]=\"!borrador.trim() || !!consultaEnCurso()\">\n        <svg lucideSend [size]=\"19\" aria-hidden=\"true\"></svg>\n      </button>\n    </form>\n  </section>\n} @else {\n  <button #lanzador type=\"button\" class=\"asistente__lanzador\" aria-label=\"Abrir el asistente depa\" (click)=\"abrir()\">\n    <svg lucideSparkles [size]=\"21\" aria-hidden=\"true\"></svg>\n    <span>Preguntale a depa</span>\n  </button>\n}\n", styles: [".asistente,\n.asistente__lanzador {\n  position: fixed;\n  z-index: 29;\n  inset-inline-start: max(1rem, env(safe-area-inset-left));\n  bottom: max(1rem, env(safe-area-inset-bottom));\n}\n\nbutton,\na {\n  touch-action: manipulation;\n}\n\nbutton:focus-visible,\na:focus-visible,\ntextarea:focus-visible {\n  outline: 2px solid var(--color-secondary);\n  outline-offset: 2px;\n}\n\n.asistente__lanzador {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  overflow: hidden;\n  min-height: 3.2rem;\n  padding: .55rem .9rem;\n  border: 1px solid #f1a62d;\n  border-radius: var(--radius-pill);\n  background: #ffbf55;\n  color: #30210c;\n  box-shadow: 0 5px 20px #10182824;\n  font-weight: 750;\n  transition: background-color .25s ease;\n}\n\n.asistente__lanzador svg { flex: none; }\n\n.asistente__lanzador span {\n  max-width: 0;\n  margin-inline-start: 0;\n  opacity: 0;\n  overflow: hidden;\n  white-space: nowrap;\n  transition: max-width .3s ease, margin .3s ease, opacity .2s ease;\n}\n\n.asistente__lanzador:hover,\n.asistente__lanzador:focus-visible { background: #ffd081; }\n\n.asistente__lanzador:hover span,\n.asistente__lanzador:focus-visible span {\n  max-width: 12rem;\n  margin-inline-start: .55rem;\n  opacity: 1;\n}\n\n.asistente__lanzador::after {\n  content: '';\n  position: absolute;\n  inset: 0;\n  pointer-events: none;\n  background: linear-gradient(110deg, transparent 35%, #ffffff75 50%, transparent 65%);\n  transform: translateX(-150%);\n  animation: asistente-reflejo 4s ease-in-out infinite;\n}\n\n@keyframes asistente-reflejo {\n  0%, 65% { transform: translateX(-150%); }\n  90%, 100% { transform: translateX(150%); }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .asistente__lanzador,\n  .asistente__lanzador span { transition: none; }\n  .asistente__lanzador::after { animation: none; }\n}\n\n.asistente {\n  display: grid;\n  grid-template-rows: auto minmax(0, 1fr) auto;\n  width: min(25rem, calc(100vw - 2rem));\n  height: min(35rem, calc(100dvh - 5rem));\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-lg);\n  background: var(--color-surface);\n  box-shadow: 0 15px 48px #10182829;\n  overflow: hidden;\n}\n\n.asistente__encabezado,\n.asistente__marca,\n.asistente__formulario {\n  display: flex;\n  align-items: center;\n}\n\n.asistente__encabezado {\n  justify-content: space-between;\n  padding: .65rem .8rem .65rem 1rem;\n  color: white;\n  background: var(--color-secondary-dark);\n}\n\n.asistente__marca { gap: .65rem; }\n.asistente__marca h2 { margin: 0; font-size: 1.25rem; font-weight: 800; line-height: 1.1; }\n.asistente__marca p { margin: .12rem 0 0; font-size: .78rem; color: #e8eefb; }\n\n.asistente__icono,\n.asistente__cerrar,\n.asistente__formulario button {\n  display: grid;\n  place-items: center;\n  flex: none;\n  width: 2.75rem;\n  height: 2.75rem;\n  border-radius: var(--radius-md);\n}\n\n.asistente__icono { background: #ffbf55; color: #30210c; }\n.asistente__cerrar:hover { background: #ffffff26; }\n.asistente__cerrar:focus-visible { outline-color: #ffbf55; }\n\n.asistente__historial {\n  overflow: auto;\n  overscroll-behavior: contain;\n  padding: 1rem;\n}\n\n.mensaje,\n.asistente__respuesta { overflow-wrap: anywhere; }\n.mensaje {\n  width: fit-content;\n  max-width: 94%;\n  margin: 0 0 .65rem;\n  padding: .65rem .8rem;\n  border-radius: var(--radius-md);\n  background: var(--color-bg);\n  color: var(--color-text);\n  white-space: pre-wrap;\n  font-size: .92rem;\n}\n\n.mensaje--propio { margin-inline-start: auto; background: var(--color-secondary-light); }\n.asistente__respuesta {\n  margin-bottom: .8rem;\n  transform-origin: 1.4rem 0;\n  animation: respuesta-aparecer .3s ease-out both;\n}\n.mensaje--respuesta { white-space: normal; line-height: 1.5; }\n.mensaje__linea { white-space: pre-wrap; }\n.mensaje__linea--vacia { height: .7em; }\n.mensaje__linea--titulo { font-weight: 750; margin-block: .3rem; }\n.mensaje__linea--lista { position: relative; padding-inline-start: 1rem; }\n.mensaje__linea--lista::before { content: '\u2022'; position: absolute; inset-inline-start: .15rem; }\n.asistente__escribiendo { display: flex; align-items: center; gap: .3rem; min-height: 2.5rem; }\n.asistente__escribiendo span {\n  width: .4rem;\n  height: .4rem;\n  border-radius: 50%;\n  background: var(--color-text-muted);\n  animation: punto-escribiendo 1.2s ease-in-out infinite;\n}\n.asistente__escribiendo span:nth-child(2) { animation-delay: .16s; }\n.asistente__escribiendo span:nth-child(3) { animation-delay: .32s; }\n@keyframes punto-escribiendo {\n  0%, 60%, 100% { opacity: .4; transform: translateY(0); }\n  30% { opacity: 1; transform: translateY(-.25rem); }\n}\n@keyframes respuesta-aparecer {\n  from { opacity: 0; transform: translateY(.35rem) scale(.97); }\n  to { opacity: 1; transform: translateY(0) scale(1); }\n}\n.asistente__sugerencias { display: flex; flex-wrap: wrap; gap: .4rem; }\n.asistente__sugerencias button {\n  padding: .45rem .7rem;\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-pill);\n  color: var(--color-secondary-dark);\n  font-size: .8rem;\n  font-weight: 650;\n}\n\n.resultado {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  gap: .55rem;\n  margin: .35rem 0;\n  padding: .55rem .7rem;\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-md);\n  color: var(--color-secondary-dark);\n  font-size: .875rem;\n}\n\n.resultado:hover,\n.asistente__sugerencias button:hover { background: var(--color-secondary-light); }\n.resultado svg { flex: none; }\n.resultado--temporal { border-inline-start: 3px solid var(--color-secondary); }\n.resultado--largo { border-inline-start: 3px solid var(--color-primary); }\n.resultado__detalle { display: grid; gap: .2rem; }\n.resultado__detalle > span { color: var(--color-text-muted); font-size: .8rem; }\n.resultado__detalle .resultado__modalidad {\n  width: fit-content;\n  padding: .15rem .5rem;\n  border-radius: var(--radius-pill);\n  background: var(--color-bg);\n  font-size: .7rem;\n  font-weight: 750;\n}\n.resultado--temporal .resultado__modalidad { background: var(--color-secondary-light); color: var(--color-secondary-dark); }\n.resultado--largo .resultado__modalidad { background: var(--color-primary-light); color: var(--color-primary-dark); }\n.resultado__detalle .resultado__precio { color: var(--color-text); font-weight: 750; }\n.asistente__estado,\n.asistente__error { margin: .5rem 0; font-size: .85rem; }\n.asistente__estado { color: var(--color-text-muted); }\n.asistente__error { color: var(--color-primary-dark); }\n\n.asistente__formulario {\n  gap: .55rem;\n  padding: .7rem;\n  border-top: 1px solid var(--color-border);\n}\n\n.asistente__formulario textarea {\n  flex: 1;\n  min-width: 0;\n  resize: none;\n  padding: .48rem .65rem;\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-sm);\n  font-size: 1rem;\n}\n\n.asistente__formulario button { background: var(--color-secondary); color: white; }\n.asistente__formulario button:disabled { opacity: .45; cursor: default; }\n\n@media (max-width: 520px) {\n  .asistente { z-index: 35; }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .asistente__respuesta, .asistente__escribiendo span { animation: none; }\n}\n"] }]
    }], null, { entrada: [{ type: i0.ViewChild, args: ['entrada', { isSignal: true }] }], historial: [{ type: i0.ViewChild, args: ['historial', { isSignal: true }] }], lanzador: [{ type: i0.ViewChild, args: ['lanzador', { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AsistenteDepaComponent, { className: "AsistenteDepaComponent", filePath: "src/app/shared/components/asistente-depa/asistente-depa.component.ts", lineNumber: 23 }); })();
