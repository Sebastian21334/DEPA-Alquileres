import { Component, computed, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucidePaperclip, LucideSend } from '@lucide/angular';
import { CargaImagenesComponent } from '../carga-imagenes/carga-imagenes.component';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
const _c0 = () => ({ standalone: true });
function ConversationComposerComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-carga-imagenes", 6);
    i0.ɵɵtwoWayListener("archivosChange", function ConversationComposerComponent_Conditional_0_Template_app_carga_imagenes_archivosChange_0_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r1.imagenes, $event) || (ctx_r1.imagenes = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("etiqueta", ctx_r1.adjuntos() === 1 ? "Imagen para enviar" : "Im\u00E1genes para enviar");
    i0.ɵɵtwoWayProperty("archivos", ctx_r1.imagenes);
    i0.ɵɵproperty("maximo", ctx_r1.adjuntos() ?? 0)("deshabilitado", ctx_r1.deshabilitado());
} }
function ConversationComposerComponent_Conditional_2_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 9);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.imagenes().length);
} }
function ConversationComposerComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 7);
    i0.ɵɵlistener("click", function ConversationComposerComponent_Conditional_2_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.alternarAdjuntos()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 8);
    i0.ɵɵconditionalCreate(2, ConversationComposerComponent_Conditional_2_Conditional_2_Template, 2, 1, "span", 9);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("adjuntar--abierto", ctx_r1.mostrarAdjuntos());
    i0.ɵɵproperty("disabled", ctx_r1.deshabilitado() || !ctx_r1.adjuntos() && !ctx_r1.imagenes().length)("title", ctx_r1.textoAdjuntar());
    i0.ɵɵattribute("aria-expanded", ctx_r1.mostrarAdjuntos())("aria-label", ctx_r1.textoAdjuntar());
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 19);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.imagenes().length ? 2 : -1);
} }
export class ConversationComposerComponent {
    texto = model('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "texto" }] : /* istanbul ignore next */ []));
    deshabilitado = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "deshabilitado" }] : /* istanbul ignore next */ []));
    limite = input(1000, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "limite" }] : /* istanbul ignore next */ []));
    etiqueta = input('Mensaje', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "etiqueta" }] : /* istanbul ignore next */ []));
    /** Imágenes elegidas para el próximo mensaje. */
    imagenes = model([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "imagenes" }] : /* istanbul ignore next */ []));
    /** Cuántas imágenes admite el próximo mensaje; null = este chat no acepta imágenes. */
    adjuntos = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "adjuntos" }] : /* istanbul ignore next */ []));
    /** Las apelaciones exigen texto: una imagen sola no alcanza para enviar. */
    textoObligatorio = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "textoObligatorio" }] : /* istanbul ignore next */ []));
    enviar = output();
    abierto = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "abierto" }] : /* istanbul ignore next */ []));
    /** Con imágenes elegidas la zona queda a la vista, para que se puedan revisar o quitar antes de enviar. */
    mostrarAdjuntos = computed(() => this.abierto() || this.imagenes().length > 0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mostrarAdjuntos" }] : /* istanbul ignore next */ []));
    hayContenido = computed(() => !!this.texto().trim() || (!this.textoObligatorio() && this.imagenes().length > 0), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hayContenido" }] : /* istanbul ignore next */ []));
    textoAdjuntar = computed(() => {
        if (!this.adjuntos() && !this.imagenes().length)
            return 'Ya no se pueden adjuntar más imágenes';
        return this.mostrarAdjuntos() && !this.imagenes().length ? 'Cerrar adjuntos' : 'Adjuntar imágenes';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "textoAdjuntar" }] : /* istanbul ignore next */ []));
    alternarAdjuntos() {
        if (!this.imagenes().length)
            this.abierto.update((abierto) => !abierto);
    }
    porTeclado(evento) {
        const tecla = evento;
        if (tecla.shiftKey || tecla.isComposing)
            return;
        tecla.preventDefault();
        if (!this.deshabilitado() && this.hayContenido())
            this.enviar.emit();
    }
    static ɵfac = function ConversationComposerComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ConversationComposerComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ConversationComposerComponent, selectors: [["app-conversation-composer"]], inputs: { texto: [1, "texto"], deshabilitado: [1, "deshabilitado"], limite: [1, "limite"], etiqueta: [1, "etiqueta"], imagenes: [1, "imagenes"], adjuntos: [1, "adjuntos"], textoObligatorio: [1, "textoObligatorio"] }, outputs: { texto: "textoChange", imagenes: "imagenesChange", enviar: "enviar" }, decls: 7, vars: 10, consts: [[3, "etiqueta", "archivos", "maximo", "deshabilitado"], [1, "fila"], ["type", "button", 1, "adjuntar", 3, "adjuntar--abierto", "disabled", "title"], ["rows", "1", "placeholder", "Escrib\u00ED un mensaje\u2026", 3, "ngModelChange", "keydown.enter", "ngModel", "ngModelOptions", "disabled"], ["type", "button", 1, "enviar", 3, "click", "disabled"], ["lucideSend", "", "aria-hidden", "true", 3, "size"], [3, "archivosChange", "etiqueta", "archivos", "maximo", "deshabilitado"], ["type", "button", 1, "adjuntar", 3, "click", "disabled", "title"], ["lucidePaperclip", "", "aria-hidden", "true", 3, "size"], ["aria-hidden", "true", 1, "cuenta"]], template: function ConversationComposerComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, ConversationComposerComponent_Conditional_0_Template, 1, 4, "app-carga-imagenes", 0);
            i0.ɵɵelementStart(1, "div", 1);
            i0.ɵɵconditionalCreate(2, ConversationComposerComponent_Conditional_2_Template, 3, 8, "button", 2);
            i0.ɵɵelementStart(3, "textarea", 3);
            i0.ɵɵlistener("ngModelChange", function ConversationComposerComponent_Template_textarea_ngModelChange_3_listener($event) { return ctx.texto.set($event); })("keydown.enter", function ConversationComposerComponent_Template_textarea_keydown_enter_3_listener($event) { return ctx.porTeclado($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementStart(4, "button", 4);
            i0.ɵɵlistener("click", function ConversationComposerComponent_Template_button_click_4_listener() { return ctx.enviar.emit(); });
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(5, "svg", 5);
            i0.ɵɵtext(6, " Enviar ");
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.mostrarAdjuntos() ? 0 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.adjuntos() !== null ? 2 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngModel", ctx.texto())("ngModelOptions", i0.ɵɵpureFunction0(9, _c0))("disabled", ctx.deshabilitado());
            i0.ɵɵattribute("maxlength", ctx.limite())("aria-label", ctx.etiqueta());
            i0.ɵɵcontrol();
            i0.ɵɵadvance();
            i0.ɵɵproperty("disabled", ctx.deshabilitado() || !ctx.hayContenido());
            i0.ɵɵadvance();
            i0.ɵɵproperty("size", 19);
        } }, dependencies: [FormsModule, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgModel, LucidePaperclip, LucideSend, CargaImagenesComponent], styles: ["[_nghost-%COMP%] { display: grid; gap: 10px; padding: 12px; border-top: 1px solid #d5deee; background: #fff; }\n    .fila[_ngcontent-%COMP%] { display: flex; align-items: flex-end; gap: 8px; }\n    textarea[_ngcontent-%COMP%] { flex: 1; box-sizing: border-box; min-width: 0; min-height: 44px; max-height: 140px; resize: vertical; padding: 10px 12px; border: 1px solid #aab9d2; border-radius: 8px; color: #121b36; font: inherit; }\n    .fila[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { display: inline-flex; gap: 6px; align-items: center; justify-content: center; min-height: 44px; padding: 0 12px; border: 0; border-radius: 8px; font: inherit; font-weight: 700; cursor: pointer; }\n    .enviar[_ngcontent-%COMP%] { background: #1640f5; color: #fff; }\n    .fila[_ngcontent-%COMP%]   .adjuntar[_ngcontent-%COMP%] { position: relative; min-width: 44px; padding: 0 10px; border: 1px solid #aab9d2; background: #fff; color: #1640f5; }\n    .fila[_ngcontent-%COMP%]   .adjuntar--abierto[_ngcontent-%COMP%] { background: #eef2ff; }\n    .cuenta[_ngcontent-%COMP%] { position: absolute; top: -6px; right: -6px; min-width: 18px; padding: 0 4px; border-radius: 9px; background: #1640f5; color: #fff; font-size: .7rem; line-height: 18px; }\n    .fila[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:disabled { opacity: .55; cursor: default; }\n    textarea[_ngcontent-%COMP%]:focus-visible, .fila[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:focus-visible { outline: 2px solid #1640f5; outline-offset: 2px; }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ConversationComposerComponent, [{
        type: Component,
        args: [{ selector: 'app-conversation-composer', imports: [FormsModule, LucidePaperclip, LucideSend, CargaImagenesComponent], template: `
    @if (mostrarAdjuntos()) {
      <app-carga-imagenes [etiqueta]="adjuntos() === 1 ? 'Imagen para enviar' : 'Imágenes para enviar'" [(archivos)]="imagenes" [maximo]="adjuntos() ?? 0" [deshabilitado]="deshabilitado()" />
    }
    <div class="fila">
      @if (adjuntos() !== null) {
        <button type="button" class="adjuntar" [class.adjuntar--abierto]="mostrarAdjuntos()"
          [disabled]="deshabilitado() || (!adjuntos() && !imagenes().length)" [attr.aria-expanded]="mostrarAdjuntos()"
          [attr.aria-label]="textoAdjuntar()" [title]="textoAdjuntar()" (click)="alternarAdjuntos()">
          <svg lucidePaperclip [size]="19" aria-hidden="true"></svg>
          @if (imagenes().length) { <span class="cuenta" aria-hidden="true">{{ imagenes().length }}</span> }
        </button>
      }
      <textarea [ngModel]="texto()" (ngModelChange)="texto.set($event)" [ngModelOptions]="{ standalone: true }"
        rows="1" [attr.maxlength]="limite()" [disabled]="deshabilitado()"
        [attr.aria-label]="etiqueta()" placeholder="Escribí un mensaje…" (keydown.enter)="porTeclado($event)"></textarea>
      <button type="button" class="enviar" [disabled]="deshabilitado() || !hayContenido()" (click)="enviar.emit()">
        <svg lucideSend [size]="19" aria-hidden="true"></svg> Enviar
      </button>
    </div>
  `, styles: ["\n    :host { display: grid; gap: 10px; padding: 12px; border-top: 1px solid #d5deee; background: #fff; }\n    .fila { display: flex; align-items: flex-end; gap: 8px; }\n    textarea { flex: 1; box-sizing: border-box; min-width: 0; min-height: 44px; max-height: 140px; resize: vertical; padding: 10px 12px; border: 1px solid #aab9d2; border-radius: 8px; color: #121b36; font: inherit; }\n    .fila button { display: inline-flex; gap: 6px; align-items: center; justify-content: center; min-height: 44px; padding: 0 12px; border: 0; border-radius: 8px; font: inherit; font-weight: 700; cursor: pointer; }\n    .enviar { background: #1640f5; color: #fff; }\n    .fila .adjuntar { position: relative; min-width: 44px; padding: 0 10px; border: 1px solid #aab9d2; background: #fff; color: #1640f5; }\n    .fila .adjuntar--abierto { background: #eef2ff; }\n    .cuenta { position: absolute; top: -6px; right: -6px; min-width: 18px; padding: 0 4px; border-radius: 9px; background: #1640f5; color: #fff; font-size: .7rem; line-height: 18px; }\n    .fila button:disabled { opacity: .55; cursor: default; }\n    textarea:focus-visible, .fila button:focus-visible { outline: 2px solid #1640f5; outline-offset: 2px; }\n  "] }]
    }], null, { texto: [{ type: i0.Input, args: [{ isSignal: true, alias: "texto", required: false }] }, { type: i0.Output, args: ["textoChange"] }], deshabilitado: [{ type: i0.Input, args: [{ isSignal: true, alias: "deshabilitado", required: false }] }], limite: [{ type: i0.Input, args: [{ isSignal: true, alias: "limite", required: false }] }], etiqueta: [{ type: i0.Input, args: [{ isSignal: true, alias: "etiqueta", required: false }] }], imagenes: [{ type: i0.Input, args: [{ isSignal: true, alias: "imagenes", required: false }] }, { type: i0.Output, args: ["imagenesChange"] }], adjuntos: [{ type: i0.Input, args: [{ isSignal: true, alias: "adjuntos", required: false }] }], textoObligatorio: [{ type: i0.Input, args: [{ isSignal: true, alias: "textoObligatorio", required: false }] }], enviar: [{ type: i0.Output, args: ["enviar"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ConversationComposerComponent, { className: "ConversationComposerComponent", filePath: "src/app/shared/components/conversation-panel/conversation-composer.component.ts", lineNumber: 43 }); })();
