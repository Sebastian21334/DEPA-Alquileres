import { Component, DestroyRef, HostListener, inject, signal, viewChild, } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideMessageCircle, LucideX } from '@lucide/angular';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService } from '../../../core/services/chat.service';
import { interlocutor, nombreInterlocutor } from '../../utils/conversaciones';
import { ChatWindowComponent } from './chat-window.component';
import { ConversationListComponent } from './conversation-list.component';
import * as i0 from "@angular/core";
const _c0 = ["listaPanel"];
const _c1 = ["burbuja"];
const _forTrack0 = ($index, $item) => $item.idPublicacion + "-" + $item.idOtroUsuario;
function ChatDockComponent_Conditional_0_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-chat-window", 3);
} if (rf & 2) {
    const chat_r2 = ctx.$implicit;
    i0.ɵɵproperty("chat", chat_r2);
} }
function ChatDockComponent_Conditional_0_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 4, 1)(2, "header", 11)(3, "div")(4, "h2", 12);
    i0.ɵɵtext(5, "Mensajes");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "button", 13);
    i0.ɵɵlistener("click", function ChatDockComponent_Conditional_0_Conditional_3_Template_button_click_8_listener() { i0.ɵɵrestoreView(_r3); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.cerrarLista()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(9, "svg", 14);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(10, "app-conversation-list", 15);
    i0.ɵɵlistener("seleccionar", function ChatDockComponent_Conditional_0_Conditional_3_Template_app_conversation_list_seleccionar_10_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.abrirConversacion($event)); });
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate1("", ctx_r3.totalNoLeidos(), " sin leer");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 20);
    i0.ɵɵadvance();
    i0.ɵɵproperty("conversaciones", ctx_r3.conversaciones())("cargando", ctx_r3.cargandoLista())("error", ctx_r3.errorLista());
} }
function ChatDockComponent_Conditional_0_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 8);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r3.totalNoLeidos());
} }
function ChatDockComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 2);
    i0.ɵɵrepeaterCreate(1, ChatDockComponent_Conditional_0_For_2_Template, 1, 1, "app-chat-window", 3, _forTrack0);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, ChatDockComponent_Conditional_0_Conditional_3_Template, 11, 5, "section", 4);
    i0.ɵɵelementStart(4, "button", 5, 0);
    i0.ɵɵlistener("click", function ChatDockComponent_Conditional_0_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r1); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.alternarLista()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(6, "svg", 6);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(7, "span", 7);
    i0.ɵɵtext(8, "Chats");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(9, ChatDockComponent_Conditional_0_Conditional_9_Template, 2, 1, "span", 8);
    i0.ɵɵelementStart(10, "span", 9);
    i0.ɵɵtext(11, "Ver m\u00E1s");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "span", 10);
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r3.chatService.abiertos());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r3.listaAbierta() ? 3 : -1);
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-expanded", ctx_r3.listaAbierta())("aria-label", "Ver m\u00E1s chats. " + ctx_r3.totalNoLeidos() + " mensajes sin leer");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 22);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r3.totalNoLeidos() ? 9 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1("", ctx_r3.totalNoLeidos(), " mensajes sin leer");
} }
export class ChatDockComponent {
    auth = inject(AuthService);
    chatService = inject(ChatService);
    destroyRef = inject(DestroyRef);
    totalNoLeidos = this.chatService.mensajesNoLeidos;
    listaAbierta = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "listaAbierta" }] : /* istanbul ignore next */ []));
    conversaciones = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "conversaciones" }] : /* istanbul ignore next */ []));
    cargandoLista = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cargandoLista" }] : /* istanbul ignore next */ []));
    errorLista = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorLista" }] : /* istanbul ignore next */ []));
    listaPanel = viewChild('listaPanel', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "listaPanel" }] : /* istanbul ignore next */ []));
    burbuja = viewChild('burbuja', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "burbuja" }] : /* istanbul ignore next */ []));
    alternarLista() {
        const abrir = !this.listaAbierta();
        this.listaAbierta.set(abrir);
        if (!abrir) {
            this.burbuja()?.nativeElement.focus();
            return;
        }
        this.cargarConversaciones();
        setTimeout(() => this.listaPanel()?.nativeElement.focus());
    }
    cerrarLista() {
        if (!this.listaAbierta())
            return;
        this.listaAbierta.set(false);
        this.burbuja()?.nativeElement.focus();
    }
    alPresionarEscape() {
        this.cerrarLista();
    }
    abrirConversacion(conversacion) {
        const otro = interlocutor(conversacion);
        this.chatService.abrir({
            idPublicacion: conversacion.idPublicacion,
            idOtroUsuario: conversacion.idOtroUsuario,
            titulo: conversacion.ultimoMensaje.publicacion.titulo,
            nombreOtro: nombreInterlocutor(conversacion),
            fotoOtro: otro.foto_url ?? null,
        });
        this.listaAbierta.set(false);
        this.burbuja()?.nativeElement.focus();
    }
    cargarConversaciones() {
        this.cargandoLista.set(true);
        this.errorLista.set('');
        this.chatService.listarConversaciones().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (conversaciones) => {
                this.conversaciones.set(conversaciones);
                this.cargandoLista.set(false);
            },
            error: (error) => {
                this.errorLista.set(error.message);
                this.cargandoLista.set(false);
            },
        });
    }
    static ɵfac = function ChatDockComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ChatDockComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ChatDockComponent, selectors: [["app-chat-dock"]], viewQuery: function ChatDockComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.listaPanel, _c0, 5)(ctx.burbuja, _c1, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance(2);
        } }, hostBindings: function ChatDockComponent_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("keydown.escape", function ChatDockComponent_keydown_escape_HostBindingHandler() { return ctx.alPresionarEscape(); }, i0.ɵɵresolveDocument);
        } }, decls: 1, vars: 1, consts: [["burbuja", ""], ["listaPanel", ""], [1, "dock"], [3, "chat"], ["id", "chat-inbox", "role", "dialog", "aria-modal", "false", "aria-labelledby", "chat-inbox-title", "tabindex", "-1", 1, "chat-inbox"], ["type", "button", "aria-controls", "chat-inbox", 1, "chat-bubble", 3, "click"], ["lucideMessageCircle", "", "aria-hidden", "true", 3, "size"], [1, "chat-bubble__label"], ["aria-hidden", "true", 1, "chat-bubble__count"], [1, "chat-bubble__more"], ["aria-live", "polite", 1, "sr-only"], [1, "chat-inbox__head"], ["id", "chat-inbox-title"], ["type", "button", "aria-label", "Cerrar chats", 1, "chat-inbox__close", 3, "click"], ["lucideX", "", "aria-hidden", "true", 3, "size"], [3, "seleccionar", "conversaciones", "cargando", "error"]], template: function ChatDockComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, ChatDockComponent_Conditional_0_Template, 14, 6);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.auth.isAuthenticated ? 0 : -1);
        } }, dependencies: [ChatWindowComponent, ConversationListComponent, LucideMessageCircle, LucideX], styles: [".dock[_ngcontent-%COMP%] {\n      position: fixed;\n      right: 1rem;\n      bottom: 5.5rem;\n      z-index: 30;\n      display: flex;\n      flex-direction: row-reverse;\n      align-items: flex-end;\n      gap: 0.75rem;\n      pointer-events: none;\n    }\n    .dock[_ngcontent-%COMP%]    > *[_ngcontent-%COMP%] { pointer-events: auto; }\n\n    .chat-bubble[_ngcontent-%COMP%] {\n      position: fixed;\n      right: 1rem;\n      bottom: 1rem;\n      z-index: 32;\n      display: inline-flex;\n      align-items: center;\n      gap: 0.5rem;\n      min-height: 48px;\n      padding: 0.55rem 0.9rem;\n      border: 1px solid color-mix(in srgb, var(--%NS%color-primary) 75%, black);\n      border-radius: var(--%NS%radius-pill);\n      background: var(--%NS%color-primary);\n      color: #fff;\n      box-shadow: 0 10px 26px rgba(16, 24, 40, 0.28);\n      font: inherit;\n      font-weight: 800;\n      cursor: pointer;\n      transition: transform 0.15s ease, background 0.15s ease;\n    }\n    .chat-bubble[_ngcontent-%COMP%]:hover { background: var(--%NS%color-primary-dark); transform: translateY(-1px); }\n    .chat-bubble[_ngcontent-%COMP%]:focus-visible { outline: 3px solid color-mix(in srgb, var(--%NS%color-accent) 70%, transparent); outline-offset: 3px; }\n    .chat-bubble__label[_ngcontent-%COMP%] { font-size: 0.88rem; }\n    .chat-bubble__more[_ngcontent-%COMP%] { padding-left: 0.5rem; border-left: 1px solid rgba(255, 255, 255, 0.35); font-size: 0.72rem; font-weight: 700; opacity: 0.9; }\n    .chat-bubble__count[_ngcontent-%COMP%] {\n      display: grid;\n      place-items: center;\n      min-width: 1.4rem;\n      height: 1.4rem;\n      padding: 0 0.3rem;\n      border-radius: 999px;\n      background: var(--%NS%color-accent);\n      color: #1a1200;\n      font-size: 0.72rem;\n    }\n\n    .chat-inbox[_ngcontent-%COMP%] {\n      position: fixed;\n      right: 1rem;\n      bottom: 5.5rem;\n      z-index: 34;\n      display: flex;\n      width: min(360px, calc(100vw - 2rem));\n      max-height: min(60dvh, 520px);\n      flex-direction: column;\n      overflow: hidden;\n      border: 1px solid var(--%NS%color-border);\n      border-radius: 16px;\n      background: #fff;\n      box-shadow: 0 20px 50px rgba(16, 24, 40, 0.25);\n    }\n    .chat-inbox[_ngcontent-%COMP%]:focus { outline: none; }\n    .chat-inbox__head[_ngcontent-%COMP%] { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding: 0.9rem 1rem 0.7rem; border-bottom: 1px solid var(--%NS%color-border); }\n    .chat-inbox__head[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] { margin: 0; font-size: 1rem; font-weight: 800; }\n    .chat-inbox__head[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0.15rem 0 0; color: var(--%NS%color-text-muted); font-size: 0.78rem; }\n    .chat-inbox__close[_ngcontent-%COMP%] { display: grid; place-items: center; width: 36px; height: 36px; flex-shrink: 0; border: 0; border-radius: 50%; background: transparent; color: var(--%NS%color-text-muted); cursor: pointer; }\n    .chat-inbox__close[_ngcontent-%COMP%]:hover { background: var(--%NS%color-bg); color: var(--%NS%color-text); }\n    .chat-inbox[_ngcontent-%COMP%]   app-conversation-list[_ngcontent-%COMP%] { min-height: 0; overflow: auto; padding: 0.4rem; }\n    .sr-only[_ngcontent-%COMP%] { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }\n\n    @media (max-width: 760px) {\n      .dock[_ngcontent-%COMP%] { right: 0.5rem; bottom: 5.5rem; }\n      .dock[_ngcontent-%COMP%]    > *[_ngcontent-%COMP%]:not(:first-child) { display: none; }\n    }\n    @media (max-width: 480px) {\n      .dock[_ngcontent-%COMP%] { left: 0.5rem; bottom: 5.5rem; }\n      .dock[_ngcontent-%COMP%]    > *[_ngcontent-%COMP%] { width: 100%; min-width: 0; }\n      .chat-bubble[_ngcontent-%COMP%] { right: 0.75rem; bottom: 0.75rem; }\n      .chat-inbox[_ngcontent-%COMP%] { right: 0.5rem; bottom: 5.25rem; width: calc(100vw - 1rem); max-height: 58dvh; }\n    }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ChatDockComponent, [{
        type: Component,
        args: [{ selector: 'app-chat-dock', standalone: true, imports: [ChatWindowComponent, ConversationListComponent, LucideMessageCircle, LucideX], template: `
    @if (auth.isAuthenticated) {
      <div class="dock">
        @for (chat of chatService.abiertos(); track chat.idPublicacion + '-' + chat.idOtroUsuario) {
          <app-chat-window [chat]="chat" />
        }
      </div>

      @if (listaAbierta()) {
        <section
          #listaPanel
          id="chat-inbox"
          class="chat-inbox"
          role="dialog"
          aria-modal="false"
          aria-labelledby="chat-inbox-title"
          tabindex="-1"
        >
          <header class="chat-inbox__head">
            <div>
              <h2 id="chat-inbox-title">Mensajes</h2>
              <p>{{ totalNoLeidos() }} sin leer</p>
            </div>
            <button type="button" class="chat-inbox__close" aria-label="Cerrar chats" (click)="cerrarLista()">
              <svg lucideX [size]="20" aria-hidden="true"></svg>
            </button>
          </header>
          <app-conversation-list
            [conversaciones]="conversaciones()"
            [cargando]="cargandoLista()"
            [error]="errorLista()"
            (seleccionar)="abrirConversacion($event)"
          />
        </section>
      }

      <button
        #burbuja
        type="button"
        class="chat-bubble"
        aria-controls="chat-inbox"
        [attr.aria-expanded]="listaAbierta()"
        [attr.aria-label]="'Ver más chats. ' + totalNoLeidos() + ' mensajes sin leer'"
        (click)="alternarLista()"
      >
        <svg lucideMessageCircle [size]="22" aria-hidden="true"></svg>
        <span class="chat-bubble__label">Chats</span>
        @if (totalNoLeidos()) {
          <span class="chat-bubble__count" aria-hidden="true">{{ totalNoLeidos() }}</span>
        }
        <span class="chat-bubble__more">Ver más</span>
      </button>
      <span class="sr-only" aria-live="polite">{{ totalNoLeidos() }} mensajes sin leer</span>
    }
  `, styles: ["\n    .dock {\n      position: fixed;\n      right: 1rem;\n      bottom: 5.5rem;\n      z-index: 30;\n      display: flex;\n      flex-direction: row-reverse;\n      align-items: flex-end;\n      gap: 0.75rem;\n      pointer-events: none;\n    }\n    .dock > * { pointer-events: auto; }\n\n    .chat-bubble {\n      position: fixed;\n      right: 1rem;\n      bottom: 1rem;\n      z-index: 32;\n      display: inline-flex;\n      align-items: center;\n      gap: 0.5rem;\n      min-height: 48px;\n      padding: 0.55rem 0.9rem;\n      border: 1px solid color-mix(in srgb, var(--color-primary) 75%, black);\n      border-radius: var(--radius-pill);\n      background: var(--color-primary);\n      color: #fff;\n      box-shadow: 0 10px 26px rgba(16, 24, 40, 0.28);\n      font: inherit;\n      font-weight: 800;\n      cursor: pointer;\n      transition: transform 0.15s ease, background 0.15s ease;\n    }\n    .chat-bubble:hover { background: var(--color-primary-dark); transform: translateY(-1px); }\n    .chat-bubble:focus-visible { outline: 3px solid color-mix(in srgb, var(--color-accent) 70%, transparent); outline-offset: 3px; }\n    .chat-bubble__label { font-size: 0.88rem; }\n    .chat-bubble__more { padding-left: 0.5rem; border-left: 1px solid rgba(255, 255, 255, 0.35); font-size: 0.72rem; font-weight: 700; opacity: 0.9; }\n    .chat-bubble__count {\n      display: grid;\n      place-items: center;\n      min-width: 1.4rem;\n      height: 1.4rem;\n      padding: 0 0.3rem;\n      border-radius: 999px;\n      background: var(--color-accent);\n      color: #1a1200;\n      font-size: 0.72rem;\n    }\n\n    .chat-inbox {\n      position: fixed;\n      right: 1rem;\n      bottom: 5.5rem;\n      z-index: 34;\n      display: flex;\n      width: min(360px, calc(100vw - 2rem));\n      max-height: min(60dvh, 520px);\n      flex-direction: column;\n      overflow: hidden;\n      border: 1px solid var(--color-border);\n      border-radius: 16px;\n      background: #fff;\n      box-shadow: 0 20px 50px rgba(16, 24, 40, 0.25);\n    }\n    .chat-inbox:focus { outline: none; }\n    .chat-inbox__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding: 0.9rem 1rem 0.7rem; border-bottom: 1px solid var(--color-border); }\n    .chat-inbox__head h2 { margin: 0; font-size: 1rem; font-weight: 800; }\n    .chat-inbox__head p { margin: 0.15rem 0 0; color: var(--color-text-muted); font-size: 0.78rem; }\n    .chat-inbox__close { display: grid; place-items: center; width: 36px; height: 36px; flex-shrink: 0; border: 0; border-radius: 50%; background: transparent; color: var(--color-text-muted); cursor: pointer; }\n    .chat-inbox__close:hover { background: var(--color-bg); color: var(--color-text); }\n    .chat-inbox app-conversation-list { min-height: 0; overflow: auto; padding: 0.4rem; }\n    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }\n\n    @media (max-width: 760px) {\n      .dock { right: 0.5rem; bottom: 5.5rem; }\n      .dock > *:not(:first-child) { display: none; }\n    }\n    @media (max-width: 480px) {\n      .dock { left: 0.5rem; bottom: 5.5rem; }\n      .dock > * { width: 100%; min-width: 0; }\n      .chat-bubble { right: 0.75rem; bottom: 0.75rem; }\n      .chat-inbox { right: 0.5rem; bottom: 5.25rem; width: calc(100vw - 1rem); max-height: 58dvh; }\n    }\n  "] }]
    }], null, { listaPanel: [{ type: i0.ViewChild, args: ['listaPanel', { isSignal: true }] }], burbuja: [{ type: i0.ViewChild, args: ['burbuja', { isSignal: true }] }], alPresionarEscape: [{
            type: HostListener,
            args: ['document:keydown.escape']
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ChatDockComponent, { className: "ChatDockComponent", filePath: "src/app/shared/components/chat-dock/chat-dock.component.ts", lineNumber: 164 }); })();
