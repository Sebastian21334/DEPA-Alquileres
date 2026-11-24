import { Component, DestroyRef, afterRenderEffect, inject, input, output, signal, viewChildren } from '@angular/core';
import { moverImagen } from '../../utils/orden-imagenes';
import * as i0 from "@angular/core";
const _c0 = ["tarjetaFoto"];
const _c1 = ["espacioFoto"];
const _forTrack0 = ($index, $item) => $item.url;
function GaleriaImagenesComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "p", 2);
    i0.ɵɵtext(1, "Eleg\u00ED una portada y orden\u00E1 las fotos arrastr\u00E1ndolas o usando las flechas.");
    i0.ɵɵdomElementEnd();
} }
function GaleriaImagenesComponent_For_3_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "span", 9);
    i0.ɵɵtext(1);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ɵ$index_7_r3 = i0.ɵɵnextContext().$index;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ɵ$index_7_r3 === 0 ? "Portada" : "Foto " + (ɵ$index_7_r3 + 1));
} }
function GaleriaImagenesComponent_For_3_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "button", 10);
    i0.ɵɵdomListener("click", function GaleriaImagenesComponent_For_3_Conditional_8_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r4); const ɵ$index_7_r3 = i0.ɵɵnextContext().$index; const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.mover(ɵ$index_7_r3, 0)); });
    i0.ɵɵtext(1);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(2, "div", 11)(3, "button", 12);
    i0.ɵɵdomListener("click", function GaleriaImagenesComponent_For_3_Conditional_8_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r4); const ɵ$index_7_r3 = i0.ɵɵnextContext().$index; const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.mover(ɵ$index_7_r3, ɵ$index_7_r3 - 1)); });
    i0.ɵɵtext(4, "\u2190");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(5, "button", 12);
    i0.ɵɵdomListener("click", function GaleriaImagenesComponent_For_3_Conditional_8_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r4); const ɵ$index_7_r3 = i0.ɵɵnextContext().$index; const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.mover(ɵ$index_7_r3, ɵ$index_7_r3 + 1)); });
    i0.ɵɵtext(6, "\u2192");
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(7, "button", 13);
    i0.ɵɵdomListener("click", function GaleriaImagenesComponent_For_3_Conditional_8_Template_button_click_7_listener() { i0.ɵɵrestoreView(_r4); const ɵ$index_7_r3 = i0.ɵɵnextContext().$index; const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.quitar.emit(ɵ$index_7_r3)); });
    i0.ɵɵtext(8, "Quitar");
    i0.ɵɵdomElementEnd()();
} if (rf & 2) {
    const ɵ$index_7_r3 = i0.ɵɵnextContext().$index;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵdomProperty("disabled", ctx_r0.disabled() || ɵ$index_7_r3 === 0);
    i0.ɵɵattribute("aria-label", "Elegir foto " + (ɵ$index_7_r3 + 1) + " como portada");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ɵ$index_7_r3 === 0 ? "Portada elegida" : "Elegir portada");
    i0.ɵɵadvance(2);
    i0.ɵɵdomProperty("disabled", ctx_r0.disabled() || ɵ$index_7_r3 === 0);
    i0.ɵɵattribute("aria-label", "Mover foto " + (ɵ$index_7_r3 + 1) + " antes");
    i0.ɵɵadvance(2);
    i0.ɵɵdomProperty("disabled", ctx_r0.disabled() || ɵ$index_7_r3 === ctx_r0.fotos().length - 1);
    i0.ɵɵattribute("aria-label", "Mover foto " + (ɵ$index_7_r3 + 1) + " despu\u00E9s");
    i0.ɵɵadvance(2);
    i0.ɵɵdomProperty("disabled", ctx_r0.disabled() || ctx_r0.quitarDeshabilitado() || ctx_r0.fotos().length <= ctx_r0.minimo());
    i0.ɵɵattribute("aria-label", "Quitar foto " + (ɵ$index_7_r3 + 1));
} }
function GaleriaImagenesComponent_For_3_Conditional_9_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "span", 14);
    i0.ɵɵtext(1);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const foto_r6 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵdomProperty("title", foto_r6.nombre);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(foto_r6.nombre);
} }
function GaleriaImagenesComponent_For_3_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵconditionalCreate(0, GaleriaImagenesComponent_For_3_Conditional_9_Conditional_0_Template, 2, 2, "span", 14);
    i0.ɵɵdomElementStart(1, "button", 13);
    i0.ɵɵdomListener("click", function GaleriaImagenesComponent_For_3_Conditional_9_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r5); const ɵ$index_7_r3 = i0.ɵɵnextContext().$index; const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.quitar.emit(ɵ$index_7_r3)); });
    i0.ɵɵtext(2, "Quitar");
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r6 = i0.ɵɵnextContext();
    const foto_r6 = ctx_r6.$implicit;
    const ɵ$index_7_r3 = ctx_r6.$index;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵconditional(foto_r6.nombre ? 0 : -1);
    i0.ɵɵadvance();
    i0.ɵɵdomProperty("disabled", ctx_r0.disabled() || ctx_r0.quitarDeshabilitado() || ctx_r0.fotos().length <= ctx_r0.minimo());
    i0.ɵɵattribute("aria-label", "Quitar " + ctx_r0.textoAlternativo(foto_r6, ɵ$index_7_r3));
} }
function GaleriaImagenesComponent_For_3_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "div", 5, 0);
    i0.ɵɵdomListener("dragover", function GaleriaImagenesComponent_For_3_Template_div_dragover_0_listener($event) { const ɵ$index_7_r3 = i0.ɵɵrestoreView(_r2).$index; const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.permitir($event, ɵ$index_7_r3)); })("drop", function GaleriaImagenesComponent_For_3_Template_div_drop_0_listener($event) { const ɵ$index_7_r3 = i0.ɵɵrestoreView(_r2).$index; const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.soltar($event, ɵ$index_7_r3)); });
    i0.ɵɵdomElementStart(2, "figure", 6, 1);
    i0.ɵɵdomListener("dragstart", function GaleriaImagenesComponent_For_3_Template_figure_dragstart_2_listener($event) { const ɵ$index_7_r3 = i0.ɵɵrestoreView(_r2).$index; const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.iniciar($event, ɵ$index_7_r3)); })("dragend", function GaleriaImagenesComponent_For_3_Template_figure_dragend_2_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.finalizar()); });
    i0.ɵɵdomElementStart(4, "div", 7);
    i0.ɵɵdomElement(5, "img", 8);
    i0.ɵɵconditionalCreate(6, GaleriaImagenesComponent_For_3_Conditional_6_Template, 2, 1, "span", 9);
    i0.ɵɵdomElementEnd();
    i0.ɵɵdomElementStart(7, "figcaption");
    i0.ɵɵconditionalCreate(8, GaleriaImagenesComponent_For_3_Conditional_8_Template, 9, 9)(9, GaleriaImagenesComponent_For_3_Conditional_9_Template, 3, 3);
    i0.ɵɵdomElementEnd()()();
} if (rf & 2) {
    const foto_r6 = ctx.$implicit;
    const ɵ$index_7_r3 = ctx.$index;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("photo--cover", ctx_r0.ordenable() && ɵ$index_7_r3 === 0)("photo--dragging", ctx_r0.ordenable() && ctx_r0.arrastrada() === ɵ$index_7_r3)("photo--target", ctx_r0.ordenable() && ctx_r0.arrastrada() === ɵ$index_7_r3 && ctx_r0.destino() !== null);
    i0.ɵɵdomProperty("draggable", ctx_r0.ordenable() && !ctx_r0.disabled());
    i0.ɵɵadvance(3);
    i0.ɵɵdomProperty("src", foto_r6.url, i0.ɵɵsanitizeUrl)("alt", ctx_r0.textoAlternativo(foto_r6, ɵ$index_7_r3));
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.ordenable() ? 6 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.ordenable() ? 8 : 9);
} }
function GaleriaImagenesComponent_ForEmpty_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdomElementStart(0, "p", 2);
    i0.ɵɵtext(1);
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.ordenable() ? "Todav\u00EDa no hay fotos cargadas." : "Todav\u00EDa no elegiste im\u00E1genes.");
} }
export class GaleriaImagenesComponent {
    fotos = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "fotos" }] : /* istanbul ignore next */ []));
    disabled = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "disabled" }] : /* istanbul ignore next */ []));
    minimo = input(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "minimo" }] : /* istanbul ignore next */ []));
    quitarDeshabilitado = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "quitarDeshabilitado" }] : /* istanbul ignore next */ []));
    /** En false (adjuntos de un formulario) no hay portada ni orden; solo la miniatura, el nombre y «Quitar». */
    ordenable = input(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ordenable" }] : /* istanbul ignore next */ []));
    reordenar = output();
    quitar = output();
    arrastrada = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "arrastrada" }] : /* istanbul ignore next */ []));
    destino = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "destino" }] : /* istanbul ignore next */ []));
    tarjetas = viewChildren('tarjetaFoto', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tarjetas" }] : /* istanbul ignore next */ []));
    espacios = viewChildren('espacioFoto', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "espacios" }] : /* istanbul ignore next */ []));
    posiciones = new Map();
    animaciones = new Set();
    constructor() {
        afterRenderEffect(() => {
            const fotos = this.fotos();
            const tarjetas = this.tarjetas();
            if (!this.ordenable()) {
                this.cancelarAnimaciones();
                this.posiciones.clear();
                return;
            }
            const espacios = this.espacios().map(espacio => espacio.nativeElement.getBoundingClientRect());
            const desde = this.arrastrada(), hasta = this.destino();
            const vistaPrevia = desde !== null && hasta !== null;
            const orden = vistaPrevia ? moverImagen(fotos, desde, hasta) : fotos;
            const destinos = new Map(orden.map((foto, index) => [foto.url, espacios[index]]));
            this.cancelarAnimaciones();
            const reducirMovimiento = tarjetas[0]?.nativeElement.ownerDocument.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? true;
            tarjetas.forEach((tarjeta, index) => {
                const url = fotos[index]?.url;
                const base = espacios[index], destino = url ? destinos.get(url) : undefined;
                const anterior = (url ? this.posiciones.get(url) : undefined) ?? base;
                if (!base || !destino || !anterior)
                    return;
                const x = anterior.left - base.left, y = anterior.top - base.top;
                const finalX = destino.left - base.left, finalY = destino.top - base.top;
                if (Math.abs(x) < 1 && Math.abs(y) < 1 && Math.abs(finalX) < 1 && Math.abs(finalY) < 1)
                    return;
                const animacion = tarjeta.nativeElement.animate([
                    { transform: `translate(${x}px, ${y}px)` },
                    { transform: `translate(${finalX}px, ${finalY}px)` },
                ], { duration: reducirMovimiento ? 0 : 240, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: vistaPrevia ? 'both' : 'none' });
                this.animaciones.add(animacion);
                if (!vistaPrevia) {
                    void animacion.finished.then(() => this.animaciones.delete(animacion), () => this.animaciones.delete(animacion));
                }
            });
            this.posiciones = new Map([...destinos].filter((entrada) => !!entrada[1]));
        });
        inject(DestroyRef).onDestroy(() => this.cancelarAnimaciones());
    }
    textoAlternativo(foto, index) {
        if (!this.ordenable())
            return foto.nombre ?? `imagen ${index + 1}`;
        return `Foto ${index + 1}${index === 0 ? ', portada' : ''}`;
    }
    iniciar(event, index) {
        if (this.disabled() || !this.ordenable()) {
            event.preventDefault();
            return;
        }
        this.posiciones = this.capturarPosiciones();
        this.arrastrada.set(index);
        this.destino.set(null);
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', String(index));
        }
    }
    permitir(event, index) {
        if (this.disabled() || !this.ordenable() || this.arrastrada() === null)
            return;
        event.preventDefault();
        const hasta = this.indiceDestino(event, index);
        const destino = hasta === this.arrastrada() ? null : hasta;
        if (this.destino() !== destino) {
            this.posiciones = this.capturarPosiciones();
            this.destino.set(destino);
        }
        if (event.dataTransfer)
            event.dataTransfer.dropEffect = 'move';
    }
    finalizar() {
        if (this.arrastrada() === null)
            return;
        this.posiciones = this.capturarPosiciones();
        this.arrastrada.set(null);
        this.destino.set(null);
    }
    soltar(event, index) {
        event.preventDefault();
        event.stopPropagation();
        const desde = this.arrastrada();
        const hasta = this.indiceDestino(event, index);
        this.finalizar();
        if (desde !== null)
            this.mover(desde, hasta);
    }
    indiceDestino(event, fallback) {
        // Los espacios permanecen fijos mientras las tarjetas se desplazan por encima.
        const index = this.espacios().findIndex(espacio => {
            const rect = espacio.nativeElement.getBoundingClientRect();
            return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
        });
        return index < 0 ? fallback : index;
    }
    mover(desde, hasta) {
        if (this.disabled() || !this.ordenable() || desde === hasta)
            return;
        this.posiciones = this.capturarPosiciones();
        this.reordenar.emit({ desde, hasta });
    }
    capturarPosiciones() {
        const posiciones = new Map();
        this.tarjetas().forEach((tarjeta, index) => {
            const url = this.fotos()[index]?.url;
            if (url)
                posiciones.set(url, tarjeta.nativeElement.getBoundingClientRect());
        });
        return posiciones;
    }
    cancelarAnimaciones() {
        this.animaciones.forEach(animacion => animacion.cancel());
        this.animaciones.clear();
    }
    static ɵfac = function GaleriaImagenesComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || GaleriaImagenesComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: GaleriaImagenesComponent, selectors: [["app-galeria-imagenes"]], viewQuery: function GaleriaImagenesComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.tarjetas, _c0, 5)(ctx.espacios, _c1, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance(2);
        } }, inputs: { fotos: [1, "fotos"], disabled: [1, "disabled"], minimo: [1, "minimo"], quitarDeshabilitado: [1, "quitarDeshabilitado"], ordenable: [1, "ordenable"] }, outputs: { reordenar: "reordenar", quitar: "quitar" }, decls: 5, vars: 5, consts: [["espacioFoto", ""], ["tarjetaFoto", ""], [1, "help"], ["role", "list", 1, "photos"], ["role", "listitem", 1, "photo-slot"], ["role", "listitem", 1, "photo-slot", 3, "dragover", "drop"], [1, "photo", 3, "dragstart", "dragend", "draggable"], [1, "preview"], ["draggable", "false", 3, "src", "alt"], [1, "badge"], ["type", "button", 1, "cover", 3, "click", "disabled"], [1, "actions"], ["type", "button", 3, "click", "disabled"], ["type", "button", 1, "remove", 3, "click", "disabled"], [1, "name", 3, "title"]], template: function GaleriaImagenesComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, GaleriaImagenesComponent_Conditional_0_Template, 2, 0, "p", 2);
            i0.ɵɵdomElementStart(1, "div", 3);
            i0.ɵɵrepeaterCreate(2, GaleriaImagenesComponent_For_3_Template, 10, 11, "div", 4, _forTrack0, false, GaleriaImagenesComponent_ForEmpty_4_Template, 2, 1, "p", 2);
            i0.ɵɵdomElementEnd();
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.ordenable() ? 0 : -1);
            i0.ɵɵadvance();
            i0.ɵɵclassProp("photos--compacta", !ctx.ordenable());
            i0.ɵɵattribute("aria-label", ctx.ordenable() ? "Fotos de la publicaci\u00F3n, en orden" : "Im\u00E1genes elegidas");
            i0.ɵɵadvance();
            i0.ɵɵrepeater(ctx.fotos());
        } }, styles: ["[_nghost-%COMP%] { display: block; min-width: 0; }\r\n.help[_ngcontent-%COMP%] { margin: 0 0 14px; color: var(--%NS%color-text-muted, #667085); font-size: .85rem; }\r\n.photos[_ngcontent-%COMP%] { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 14px; }\r\n.photo-slot[_ngcontent-%COMP%] { min-width: 0; }\r\n.photo[_ngcontent-%COMP%] { position: relative; height: 100%; box-sizing: border-box; margin: 0; transition: opacity .18s ease, border-color .18s ease, box-shadow .18s ease; overflow: hidden; border: 1px solid #dfe5ed; border-radius: 10px; background: white; }\r\n.photo[draggable='true'][_ngcontent-%COMP%] { cursor: grab; }\r\n.photo--cover[_ngcontent-%COMP%] { border-color: var(--%NS%color-primary, #e14414); }\r\n.photo--dragging[_ngcontent-%COMP%] { opacity: .5; z-index: 2; }\r\n.photo--target[_ngcontent-%COMP%] { border-color: var(--%NS%color-secondary, #124aa6); box-shadow: 0 0 0 2px var(--%NS%color-secondary, #124aa6); }\r\n.photo--target[_ngcontent-%COMP%]   .preview[_ngcontent-%COMP%]::after { content: 'Soltar aqu\u00ED'; position: absolute; inset: 0; display: grid; place-items: center; background: #0e47a166; color: #fff; font-weight: 800; text-shadow: 0 1px 3px #0008; pointer-events: none; }\r\n.preview[_ngcontent-%COMP%] { position: relative; }\r\nimg[_ngcontent-%COMP%] { display: block; width: 100%; height: 140px; object-fit: cover; }\r\n.badge[_ngcontent-%COMP%] { position: absolute; left: 8px; top: 8px; padding: 4px 8px; border-radius: 5px; background: #102a3ae8; color: white; font-size: .75rem; font-weight: 700; }\r\n.photo--cover[_ngcontent-%COMP%]   .badge[_ngcontent-%COMP%] { background: var(--%NS%color-primary, #e14414); }\r\nfigcaption[_ngcontent-%COMP%] { display: grid; gap: 8px; padding: 10px; }\r\nbutton[_ngcontent-%COMP%] { min-height: 36px; border: 1px solid #d0d5dd; border-radius: 6px; background: white; color: #344054; font: inherit; font-size: .8rem; cursor: pointer; }\r\nbutton[_ngcontent-%COMP%]:focus-visible { outline: 3px solid var(--%NS%color-secondary, #12529b); outline-offset: 2px; }\r\nbutton[_ngcontent-%COMP%]:disabled { opacity: .5; cursor: not-allowed; }\r\n.cover[_ngcontent-%COMP%] { font-weight: 700; }\r\n.actions[_ngcontent-%COMP%] { display: flex; gap: 6px; }\r\n.actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { flex: 1; }\r\n.actions[_ngcontent-%COMP%]   .remove[_ngcontent-%COMP%] { flex: 2; color: #b42318; }\r\n.remove[_ngcontent-%COMP%] { color: #b42318; }\r\n.name[_ngcontent-%COMP%] { overflow: hidden; color: #344054; font-size: .8rem; text-overflow: ellipsis; white-space: nowrap; }\r\n.photos--compacta[_ngcontent-%COMP%] { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; }\r\n.photos--compacta[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] { height: 105px; }\r\n@media (max-width: 420px) {\r\n  .photos[_ngcontent-%COMP%] { grid-template-columns: 1fr; }\r\n  img[_ngcontent-%COMP%] { height: 190px; }\r\n  .photos--compacta[_ngcontent-%COMP%] { grid-template-columns: repeat(2, minmax(0, 1fr)); }\r\n}\r\n\r\n@media (prefers-reduced-motion: reduce) { .photo[_ngcontent-%COMP%] { transition: none; } }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(GaleriaImagenesComponent, [{
        type: Component,
        args: [{ selector: 'app-galeria-imagenes', standalone: true, template: "@if (ordenable()) {\r\n  <p class=\"help\">Eleg\u00ED una portada y orden\u00E1 las fotos arrastr\u00E1ndolas o usando las flechas.</p>\r\n}\r\n<div class=\"photos\" [class.photos--compacta]=\"!ordenable()\" role=\"list\"\r\n  [attr.aria-label]=\"ordenable() ? 'Fotos de la publicaci\u00F3n, en orden' : 'Im\u00E1genes elegidas'\">\r\n  @for (foto of fotos(); track foto.url; let i = $index) {\r\n    <div #espacioFoto class=\"photo-slot\" role=\"listitem\" (dragover)=\"permitir($event, i)\" (drop)=\"soltar($event, i)\">\r\n      <figure #tarjetaFoto class=\"photo\" [class.photo--cover]=\"ordenable() && i === 0\"\r\n        [class.photo--dragging]=\"ordenable() && arrastrada() === i\" [class.photo--target]=\"ordenable() && arrastrada() === i && destino() !== null\" [draggable]=\"ordenable() && !disabled()\"\r\n        (dragstart)=\"iniciar($event, i)\" (dragend)=\"finalizar()\">\r\n        <div class=\"preview\">\r\n          <img [src]=\"foto.url\" [alt]=\"textoAlternativo(foto, i)\" draggable=\"false\" />\r\n          @if (ordenable()) { <span class=\"badge\">{{ i === 0 ? 'Portada' : 'Foto ' + (i + 1) }}</span> }\r\n        </div>\r\n        <figcaption>\r\n          @if (ordenable()) {\r\n            <button type=\"button\" class=\"cover\" [disabled]=\"disabled() || i === 0\"\r\n              [attr.aria-label]=\"'Elegir foto ' + (i + 1) + ' como portada'\"\r\n              (click)=\"mover(i, 0)\">{{ i === 0 ? 'Portada elegida' : 'Elegir portada' }}</button>\r\n            <div class=\"actions\">\r\n              <button type=\"button\" [disabled]=\"disabled() || i === 0\"\r\n                [attr.aria-label]=\"'Mover foto ' + (i + 1) + ' antes'\"\r\n                (click)=\"mover(i, i - 1)\">\u2190</button>\r\n              <button type=\"button\" [disabled]=\"disabled() || i === fotos().length - 1\"\r\n                [attr.aria-label]=\"'Mover foto ' + (i + 1) + ' despu\u00E9s'\"\r\n                (click)=\"mover(i, i + 1)\">\u2192</button>\r\n              <button type=\"button\" class=\"remove\" [disabled]=\"disabled() || quitarDeshabilitado() || fotos().length <= minimo()\"\r\n                [attr.aria-label]=\"'Quitar foto ' + (i + 1)\" (click)=\"quitar.emit(i)\">Quitar</button>\r\n            </div>\r\n          } @else {\r\n            @if (foto.nombre) { <span class=\"name\" [title]=\"foto.nombre\">{{ foto.nombre }}</span> }\r\n            <button type=\"button\" class=\"remove\" [disabled]=\"disabled() || quitarDeshabilitado() || fotos().length <= minimo()\"\r\n              [attr.aria-label]=\"'Quitar ' + textoAlternativo(foto, i)\" (click)=\"quitar.emit(i)\">Quitar</button>\r\n          }\r\n        </figcaption>\r\n      </figure>\r\n    </div>\r\n  } @empty {\r\n    <p class=\"help\">{{ ordenable() ? 'Todav\u00EDa no hay fotos cargadas.' : 'Todav\u00EDa no elegiste im\u00E1genes.' }}</p>\r\n  }\r\n</div>\r\n", styles: [":host { display: block; min-width: 0; }\r\n.help { margin: 0 0 14px; color: var(--color-text-muted, #667085); font-size: .85rem; }\r\n.photos { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 14px; }\r\n.photo-slot { min-width: 0; }\r\n.photo { position: relative; height: 100%; box-sizing: border-box; margin: 0; transition: opacity .18s ease, border-color .18s ease, box-shadow .18s ease; overflow: hidden; border: 1px solid #dfe5ed; border-radius: 10px; background: white; }\r\n.photo[draggable='true'] { cursor: grab; }\r\n.photo--cover { border-color: var(--color-primary, #e14414); }\r\n.photo--dragging { opacity: .5; z-index: 2; }\r\n.photo--target { border-color: var(--color-secondary, #124aa6); box-shadow: 0 0 0 2px var(--color-secondary, #124aa6); }\r\n.photo--target .preview::after { content: 'Soltar aqu\u00ED'; position: absolute; inset: 0; display: grid; place-items: center; background: #0e47a166; color: #fff; font-weight: 800; text-shadow: 0 1px 3px #0008; pointer-events: none; }\r\n.preview { position: relative; }\r\nimg { display: block; width: 100%; height: 140px; object-fit: cover; }\r\n.badge { position: absolute; left: 8px; top: 8px; padding: 4px 8px; border-radius: 5px; background: #102a3ae8; color: white; font-size: .75rem; font-weight: 700; }\r\n.photo--cover .badge { background: var(--color-primary, #e14414); }\r\nfigcaption { display: grid; gap: 8px; padding: 10px; }\r\nbutton { min-height: 36px; border: 1px solid #d0d5dd; border-radius: 6px; background: white; color: #344054; font: inherit; font-size: .8rem; cursor: pointer; }\r\nbutton:focus-visible { outline: 3px solid var(--color-secondary, #12529b); outline-offset: 2px; }\r\nbutton:disabled { opacity: .5; cursor: not-allowed; }\r\n.cover { font-weight: 700; }\r\n.actions { display: flex; gap: 6px; }\r\n.actions button { flex: 1; }\r\n.actions .remove { flex: 2; color: #b42318; }\r\n.remove { color: #b42318; }\r\n.name { overflow: hidden; color: #344054; font-size: .8rem; text-overflow: ellipsis; white-space: nowrap; }\r\n.photos--compacta { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; }\r\n.photos--compacta img { height: 105px; }\r\n@media (max-width: 420px) {\r\n  .photos { grid-template-columns: 1fr; }\r\n  img { height: 190px; }\r\n  .photos--compacta { grid-template-columns: repeat(2, minmax(0, 1fr)); }\r\n}\r\n\r\n@media (prefers-reduced-motion: reduce) { .photo { transition: none; } }\r\n"] }]
    }], () => [], { fotos: [{ type: i0.Input, args: [{ isSignal: true, alias: "fotos", required: true }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], minimo: [{ type: i0.Input, args: [{ isSignal: true, alias: "minimo", required: false }] }], quitarDeshabilitado: [{ type: i0.Input, args: [{ isSignal: true, alias: "quitarDeshabilitado", required: false }] }], ordenable: [{ type: i0.Input, args: [{ isSignal: true, alias: "ordenable", required: false }] }], reordenar: [{ type: i0.Output, args: ["reordenar"] }], quitar: [{ type: i0.Output, args: ["quitar"] }], tarjetas: [{ type: i0.ViewChildren, args: ['tarjetaFoto', { isSignal: true }] }], espacios: [{ type: i0.ViewChildren, args: ['espacioFoto', { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(GaleriaImagenesComponent, { className: "GaleriaImagenesComponent", filePath: "src/app/shared/components/galeria-imagenes/galeria-imagenes.component.ts", lineNumber: 12 }); })();
