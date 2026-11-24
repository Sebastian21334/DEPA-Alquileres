import { Component, input, output } from '@angular/core';
import { AvatarComponent } from '../avatar/avatar.component';
import { interlocutor, nombreInterlocutor } from '../../utils/conversaciones';
import * as i0 from "@angular/core";
const _forTrack0 = ($index, $item) => $item.idPublicacion + "-" + $item.idOtroUsuario;
function ConversationListComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 0);
    i0.ɵɵtext(1, "Cargando chats\u2026");
    i0.ɵɵelementEnd();
} }
function ConversationListComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 1);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.error());
} }
function ConversationListComponent_Conditional_2_For_2_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 8);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const conversacion_r3 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵattribute("aria-label", conversacion_r3.cantidadNoLeidos + " mensajes sin leer");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(conversacion_r3.cantidadNoLeidos);
} }
function ConversationListComponent_Conditional_2_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 4);
    i0.ɵɵlistener("click", function ConversationListComponent_Conditional_2_For_2_Template_button_click_0_listener() { const conversacion_r3 = i0.ɵɵrestoreView(_r2).$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.seleccionar.emit(conversacion_r3)); });
    i0.ɵɵelement(1, "app-avatar", 5);
    i0.ɵɵelementStart(2, "span", 6)(3, "strong");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "small", 7);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "small");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(9, ConversationListComponent_Conditional_2_For_2_Conditional_9_Template, 2, 2, "span", 8);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const conversacion_r3 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("foto", ctx_r0.interlocutor(conversacion_r3).foto_url)("nombre", ctx_r0.nombreInterlocutor(conversacion_r3));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.nombreInterlocutor(conversacion_r3));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(conversacion_r3.ultimoMensaje.publicacion.titulo);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(conversacion_r3.ultimoMensaje.texto);
    i0.ɵɵadvance();
    i0.ɵɵconditional(conversacion_r3.cantidadNoLeidos ? 9 : -1);
} }
function ConversationListComponent_Conditional_2_ForEmpty_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 0);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.vacio());
} }
function ConversationListComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 2);
    i0.ɵɵrepeaterCreate(1, ConversationListComponent_Conditional_2_For_2_Template, 10, 6, "button", 3, _forTrack0, false, ConversationListComponent_Conditional_2_ForEmpty_3_Template, 2, 1, "p", 0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.conversaciones());
} }
export class ConversationListComponent {
    conversaciones = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "conversaciones" }] : /* istanbul ignore next */ []));
    cargando = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cargando" }] : /* istanbul ignore next */ []));
    error = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    vacio = input('Todavía no tenés conversaciones.', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "vacio" }] : /* istanbul ignore next */ []));
    seleccionar = output();
    interlocutor = interlocutor;
    nombreInterlocutor = nombreInterlocutor;
    static ɵfac = function ConversationListComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ConversationListComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ConversationListComponent, selectors: [["app-conversation-list"]], inputs: { conversaciones: [1, "conversaciones"], cargando: [1, "cargando"], error: [1, "error"], vacio: [1, "vacio"] }, outputs: { seleccionar: "seleccionar" }, decls: 3, vars: 1, consts: [[1, "lista__estado"], ["role", "alert", 1, "lista__estado", "lista__estado--error"], [1, "lista"], ["type", "button", 1, "conversacion"], ["type", "button", 1, "conversacion", 3, "click"], [1, "conversacion__avatar", 3, "foto", "nombre"], [1, "conversacion__texto"], [1, "conversacion__titulo"], [1, "conversacion__unread"]], template: function ConversationListComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, ConversationListComponent_Conditional_0_Template, 2, 0, "p", 0)(1, ConversationListComponent_Conditional_1_Template, 2, 1, "p", 1)(2, ConversationListComponent_Conditional_2_Template, 4, 1, "div", 2);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.cargando() ? 0 : ctx.error() ? 1 : 2);
        } }, dependencies: [AvatarComponent], styles: ["[_nghost-%COMP%] { display: block; min-width: 0; }\n    .lista[_ngcontent-%COMP%] { display: flex; flex-direction: column; gap: 2px; }\n    .lista__estado[_ngcontent-%COMP%] { margin: 0.4rem 0.6rem; color: var(--%NS%color-text-muted); font-size: 0.82rem; line-height: 1.4; }\n    .lista__estado--error[_ngcontent-%COMP%] { color: var(--%NS%color-danger); }\n    .conversacion[_ngcontent-%COMP%] { display: flex; width: 100%; align-items: center; gap: 0.6rem; padding: 0.55rem; border: 0; border-radius: var(--%NS%radius-sm); background: transparent; color: var(--%NS%color-text); text-align: left; cursor: pointer; }\n    .conversacion[_ngcontent-%COMP%]:hover { background: var(--%NS%color-bg); }\n    .conversacion[_ngcontent-%COMP%]:focus-visible { outline: 2px solid var(--%NS%color-primary); outline-offset: 2px; }\n    .conversacion__avatar[_ngcontent-%COMP%] { display: grid; place-items: center; width: 2.2rem; height: 2.2rem; flex-shrink: 0; border-radius: 50%; background: #ffbc59; color: var(--%NS%color-primary); font-weight: 700; }\n    .conversacion__texto[_ngcontent-%COMP%] { display: flex; min-width: 0; flex: 1; flex-direction: column; }\n    .conversacion__texto[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%], .conversacion__texto[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n    .conversacion__titulo[_ngcontent-%COMP%] { color: var(--%NS%color-primary); font-weight: 600; }\n    .conversacion__texto[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { color: var(--%NS%color-text-muted); font-size: 0.8rem; }\n    .conversacion__unread[_ngcontent-%COMP%] { display: grid; place-items: center; min-width: 1.35rem; height: 1.35rem; margin-left: auto; padding: 0 0.3rem; border-radius: 999px; background: var(--%NS%color-accent); color: #fff; font-size: 0.7rem; font-weight: 800; }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ConversationListComponent, [{
        type: Component,
        args: [{ selector: 'app-conversation-list', standalone: true, imports: [AvatarComponent], template: `
    @if (cargando()) {
      <p class="lista__estado">Cargando chats…</p>
    } @else if (error()) {
      <p class="lista__estado lista__estado--error" role="alert">{{ error() }}</p>
    } @else {
      <div class="lista">
        @for (conversacion of conversaciones(); track conversacion.idPublicacion + '-' + conversacion.idOtroUsuario) {
          <button type="button" class="conversacion" (click)="seleccionar.emit(conversacion)">
            <app-avatar class="conversacion__avatar" [foto]="interlocutor(conversacion).foto_url" [nombre]="nombreInterlocutor(conversacion)" />
            <span class="conversacion__texto">
              <strong>{{ nombreInterlocutor(conversacion) }}</strong>
              <small class="conversacion__titulo">{{ conversacion.ultimoMensaje.publicacion.titulo }}</small>
              <small>{{ conversacion.ultimoMensaje.texto }}</small>
            </span>
            @if (conversacion.cantidadNoLeidos) {
              <span class="conversacion__unread" [attr.aria-label]="conversacion.cantidadNoLeidos + ' mensajes sin leer'">{{ conversacion.cantidadNoLeidos }}</span>
            }
          </button>
        } @empty {
          <p class="lista__estado">{{ vacio() }}</p>
        }
      </div>
    }
  `, styles: ["\n    :host { display: block; min-width: 0; }\n    .lista { display: flex; flex-direction: column; gap: 2px; }\n    .lista__estado { margin: 0.4rem 0.6rem; color: var(--color-text-muted); font-size: 0.82rem; line-height: 1.4; }\n    .lista__estado--error { color: var(--color-danger); }\n    .conversacion { display: flex; width: 100%; align-items: center; gap: 0.6rem; padding: 0.55rem; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--color-text); text-align: left; cursor: pointer; }\n    .conversacion:hover { background: var(--color-bg); }\n    .conversacion:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }\n    .conversacion__avatar { display: grid; place-items: center; width: 2.2rem; height: 2.2rem; flex-shrink: 0; border-radius: 50%; background: #ffbc59; color: var(--color-primary); font-weight: 700; }\n    .conversacion__texto { display: flex; min-width: 0; flex: 1; flex-direction: column; }\n    .conversacion__texto strong, .conversacion__texto small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n    .conversacion__titulo { color: var(--color-primary); font-weight: 600; }\n    .conversacion__texto small { color: var(--color-text-muted); font-size: 0.8rem; }\n    .conversacion__unread { display: grid; place-items: center; min-width: 1.35rem; height: 1.35rem; margin-left: auto; padding: 0 0.3rem; border-radius: 999px; background: var(--color-accent); color: #fff; font-size: 0.7rem; font-weight: 800; }\n  "] }]
    }], null, { conversaciones: [{ type: i0.Input, args: [{ isSignal: true, alias: "conversaciones", required: true }] }], cargando: [{ type: i0.Input, args: [{ isSignal: true, alias: "cargando", required: false }] }], error: [{ type: i0.Input, args: [{ isSignal: true, alias: "error", required: false }] }], vacio: [{ type: i0.Input, args: [{ isSignal: true, alias: "vacio", required: false }] }], seleccionar: [{ type: i0.Output, args: ["seleccionar"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ConversationListComponent, { className: "ConversationListComponent", filePath: "src/app/shared/components/chat-dock/conversation-list.component.ts", lineNumber: 51 }); })();
