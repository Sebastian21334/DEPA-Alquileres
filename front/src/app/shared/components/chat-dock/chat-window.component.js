import { ConversationPanelComponent } from '../conversation-panel/conversation-panel.component';
import { ConversationComposerComponent } from '../conversation-panel/conversation-composer.component';
import { Component, PLATFORM_ID, computed, inject, input, signal, } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { EMPTY, Subject, catchError, switchMap, timer } from 'rxjs';
import { LucideMinus, LucideX } from '@lucide/angular';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService } from '../../../core/services/chat.service';
import { AvatarComponent } from '../avatar/avatar.component';
import * as i0 from "@angular/core";
const _c0 = a0 => ["/publicaciones", a0];
function ChatWindowComponent_Conditional_13_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 11);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.error());
} }
function ChatWindowComponent_Conditional_13_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 12);
    i0.ɵɵtext(1, "Esta publicaci\u00F3n ha sido eliminada y no admite contactos. El historial se conserva.");
    i0.ɵɵelementEnd();
} }
function ChatWindowComponent_Conditional_13_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 12);
    i0.ɵɵtext(1, "Contacto suspendido. Para reservas anteriores, contact\u00E1 a soporte.");
    i0.ɵɵelementEnd();
} }
function ChatWindowComponent_Conditional_13_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-conversation-composer", 14);
    i0.ɵɵtwoWayListener("textoChange", function ChatWindowComponent_Conditional_13_Conditional_6_Template_app_conversation_composer_textoChange_0_listener($event) { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r0.texto, $event) || (ctx_r0.texto = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("enviar", function ChatWindowComponent_Conditional_13_Conditional_6_Template_app_conversation_composer_enviar_0_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.enviar()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵtwoWayProperty("texto", ctx_r0.texto);
    i0.ɵɵproperty("limite", 250)("deshabilitado", ctx_r0.enviando());
} }
function ChatWindowComponent_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 9);
    i0.ɵɵtext(1, "Ver publicaci\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "app-conversation-panel", 10);
    i0.ɵɵconditionalCreate(3, ChatWindowComponent_Conditional_13_Conditional_3_Template, 2, 1, "p", 11);
    i0.ɵɵconditionalCreate(4, ChatWindowComponent_Conditional_13_Conditional_4_Template, 2, 0, "p", 12)(5, ChatWindowComponent_Conditional_13_Conditional_5_Template, 2, 0, "p", 12)(6, ChatWindowComponent_Conditional_13_Conditional_6_Template, 1, 3, "app-conversation-composer", 13);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(5, _c0, ctx_r0.chat().idPublicacion));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("mensajes", ctx_r0.hilo())("vacio", ctx_r0.cargando() ? "Cargando conversaci\u00F3n\u2026" : "Escrib\u00ED tu consulta a " + ctx_r0.chat().nombreOtro + ".");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.error() ? 3 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.publicacionEliminada() ? 4 : ctx_r0.contactoSuspendido() ? 5 : 6);
} }
// El backend no tiene websockets: se consulta la conversación cada pocos segundos
// mientras la ventana está abierta (y enseguida después de enviar).
const INTERVALO_MS = 5000;
export class ChatWindowComponent {
    chat = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "chat" }] : /* istanbul ignore next */ []));
    chatService = inject(ChatService);
    auth = inject(AuthService);
    refrescar$ = new Subject();
    mensajes = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mensajes" }] : /* istanbul ignore next */ []));
    cargando = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cargando" }] : /* istanbul ignore next */ []));
    enviando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enviando" }] : /* istanbul ignore next */ []));
    error = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    texto = '';
    miId = computed(() => Number(this.auth.currentUser()?.sub), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "miId" }] : /* istanbul ignore next */ []));
    publicacionEliminada = computed(() => this.mensajes()[0]?.publicacion.eliminada === true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "publicacionEliminada" }] : /* istanbul ignore next */ []));
    // El back informa la suspensión al listar la conversación; un mensaje recién enviado implica que el contacto sigue activo.
    contactoSuspendido = computed(() => this.publicacionEliminada() || this.mensajes()[0]?.contactoSuspendido === true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "contactoSuspendido" }] : /* istanbul ignore next */ []));
    constructor() {
        if (isPlatformBrowser(inject(PLATFORM_ID))) {
            this.refrescar$
                .pipe(switchMap(() => timer(0, INTERVALO_MS)), switchMap(() => this.chatService.listarMensajes(this.chat().idPublicacion, this.chat().idOtroUsuario).pipe(
            // Un fallo puntual no debe cortar el polling de la ventana.
            catchError((err) => {
                this.error.set(err.message);
                this.cargando.set(false);
                return EMPTY;
            }))), takeUntilDestroyed())
                .subscribe((mensajes) => {
                this.mensajes.set(mensajes);
                this.cargando.set(false);
                if (!this.enviando())
                    this.error.set('');
                if (mensajes.some((m) => m.destinoUsuario.id === this.miId() && !m.leido)) {
                    this.chatService.marcarComoLeidos(this.chat().idPublicacion, this.chat().idOtroUsuario).subscribe({
                        next: () => {
                            this.refrescar$.next();
                            // La burbuja y la campana dejan de contar estos mensajes sin esperar el próximo sondeo.
                            this.chatService.actualizar();
                        },
                    });
                }
            });
        }
    }
    ngOnInit() {
        // Recién acá el input `chat` está disponible; en SSR no hay suscriptores.
        this.refrescar$.next();
    }
    enviar() {
        const texto = this.texto.trim();
        if (!texto || this.enviando() || this.contactoSuspendido())
            return;
        this.enviando.set(true);
        this.error.set('');
        const { idPublicacion, idOtroUsuario } = this.chat();
        this.chatService.enviar(idPublicacion, idOtroUsuario, texto).subscribe({
            next: () => {
                this.texto = '';
                this.enviando.set(false);
                this.refrescar$.next();
            },
            error: (err) => {
                this.error.set(err.message);
                this.enviando.set(false);
            },
        });
    }
    hilo = computed(() => this.mensajes().map(mensaje => {
        const autor = mensaje.origenUsuario;
        const propio = autor.id === this.miId();
        return {
            id: mensaje.id, autor: [autor.nombre, autor.apellido].filter(Boolean).join(' ') || 'Usuario',
            foto: autor.foto_url, texto: mensaje.texto, fecha: mensaje.fecha, propio,
            leido: propio ? mensaje.leido : undefined,
        };
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hilo" }] : /* istanbul ignore next */ []));
    static ɵfac = function ChatWindowComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ChatWindowComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ChatWindowComponent, selectors: [["app-chat-window"]], inputs: { chat: [1, "chat"] }, decls: 14, vars: 10, consts: [[1, "chat"], [1, "chat__head", 3, "click"], [1, "chat__avatar"], [1, "chat__avatar-img", 3, "foto", "nombre"], [1, "chat__title"], ["type", "button", "aria-label", "Minimizar", 3, "click"], ["lucideMinus", "", 3, "size"], ["type", "button", "aria-label", "Cerrar chat", 3, "click"], ["lucideX", "", 3, "size"], [1, "chat__link", 3, "routerLink"], [3, "mensajes", "vacio"], ["role", "alert", 1, "chat__error"], ["role", "status", 1, "chat__error"], [3, "texto", "limite", "deshabilitado"], [3, "textoChange", "enviar", "texto", "limite", "deshabilitado"]], template: function ChatWindowComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "header", 1);
            i0.ɵɵlistener("click", function ChatWindowComponent_Template_header_click_1_listener() { return ctx.chatService.alternarMinimizado(ctx.chat()); });
            i0.ɵɵelementStart(2, "span", 2);
            i0.ɵɵelement(3, "app-avatar", 3);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "span", 4)(5, "strong");
            i0.ɵɵtext(6);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "small");
            i0.ɵɵtext(8);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(9, "button", 5);
            i0.ɵɵlistener("click", function ChatWindowComponent_Template_button_click_9_listener($event) { $event.stopPropagation(); return ctx.chatService.alternarMinimizado(ctx.chat()); });
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(10, "svg", 6);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(11, "button", 7);
            i0.ɵɵlistener("click", function ChatWindowComponent_Template_button_click_11_listener($event) { $event.stopPropagation(); return ctx.chatService.cerrar(ctx.chat()); });
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(12, "svg", 8);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(13, ChatWindowComponent_Conditional_13_Template, 7, 7);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵclassProp("is-min", ctx.chat().minimizado);
            i0.ɵɵattribute("aria-label", "Chat con " + ctx.chat().nombreOtro);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("foto", ctx.chat().fotoOtro)("nombre", ctx.chat().nombreOtro);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.chat().nombreOtro);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.chat().titulo);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("size", 18);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("size", 18);
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.chat().minimizado ? 13 : -1);
        } }, dependencies: [RouterLink, AvatarComponent, LucideMinus, LucideX, ConversationPanelComponent, ConversationComposerComponent], styles: ["[_nghost-%COMP%] { display: block; }\r\n\r\n.chat[_ngcontent-%COMP%] {\r\n  width: 330px;\r\n  height: 450px;\r\n  display: flex;\r\n  flex-direction: column;\r\n  background: #fff;\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: 16px 16px 0 0;\r\n  box-shadow: 0 16px 40px rgba(16, 24, 40, 0.22);\r\n  overflow: hidden;\r\n  transform-origin: bottom right;\r\n  animation: _ngcontent-%COMP%_chat-open 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;\r\n  transition: height 0.35s cubic-bezier(0.22, 1, 0.36, 1);\r\n}\r\n.chat.is-min[_ngcontent-%COMP%] { height: 60px; }\r\n@keyframes _ngcontent-%COMP%_chat-open {\r\n  from { opacity: 0; transform: translateY(40px) scale(0.9); }\r\n  to { opacity: 1; transform: none; }\r\n}\r\n\r\n.chat__head[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.6rem;\r\n  min-height: 60px;\r\n  padding: 0.55rem 0.6rem 0.55rem 0.85rem;\r\n  border-bottom: 1px solid var(--%NS%color-border);\r\n  color: var(--%NS%color-text);\r\n  cursor: pointer;\r\n}\r\n.chat__head[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  place-items: center;\r\n  width: 30px;\r\n  height: 30px;\r\n  border: 0;\r\n  border-radius: 50%;\r\n  background: transparent;\r\n  color: var(--%NS%color-text-muted);\r\n  cursor: pointer;\r\n  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;\r\n}\r\n.chat__head[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover { background: var(--%NS%color-bg); color: var(--%NS%color-text); transform: scale(1.1); }\r\n.chat__avatar[_ngcontent-%COMP%] {\r\n  position: relative;\r\n  display: grid;\r\n  place-items: center;\r\n  width: 36px;\r\n  height: 36px;\r\n  flex-shrink: 0;\r\n  border-radius: 50%;\r\n  background: #ffbc59;\r\n  color: var(--%NS%color-primary);\r\n  font-weight: 700;\r\n}\r\n.chat__avatar-img[_ngcontent-%COMP%] { width: 100%; height: 100%; border-radius: 50%; }\r\n.chat__title[_ngcontent-%COMP%] { display: flex; flex-direction: column; min-width: 0; flex: 1; line-height: 1.25; }\r\n.chat__title[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { font-size: 0.98rem; font-weight: 800; }\r\n.chat__title[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%], .chat__title[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\r\n.chat__title[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] { font-size: 0.75rem; color: var(--%NS%color-text-muted); }\r\n\r\n.chat__link[_ngcontent-%COMP%] {\r\n  padding: 0.4rem 0.9rem;\r\n  font-size: 0.76rem;\r\n  font-weight: 700;\r\n  color: var(--%NS%color-accent);\r\n  text-decoration: none;\r\n  border-bottom: 1px solid var(--%NS%color-border);\r\n}\r\n.chat__link[_ngcontent-%COMP%]:hover { text-decoration: underline; }\r\n\r\napp-conversation-panel[_ngcontent-%COMP%] { flex: 1; border: 0; border-radius: 0; --%NS%conversation-height: none; }\r\n.chat__error[_ngcontent-%COMP%] { margin: 0; padding: 0.35rem 0.9rem; font-size: 0.76rem; color: var(--%NS%color-danger); }\r\n\r\n@media (max-width: 480px) {\r\n  .chat[_ngcontent-%COMP%] { width: 100%; height: 60dvh; }\r\n  .chat__head[_ngcontent-%COMP%] { gap: .35rem; padding-inline: .5rem; }\r\n  .chat__head[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { width: 40px; height: 44px; flex-shrink: 0; }\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ChatWindowComponent, [{
        type: Component,
        args: [{ selector: 'app-chat-window', standalone: true, imports: [RouterLink, AvatarComponent, LucideMinus, LucideX, ConversationPanelComponent, ConversationComposerComponent], template: "<section class=\"chat\" [class.is-min]=\"chat().minimizado\" [attr.aria-label]=\"'Chat con ' + chat().nombreOtro\">\r\n  <header class=\"chat__head\" (click)=\"chatService.alternarMinimizado(chat())\">\r\n    <span class=\"chat__avatar\"><app-avatar class=\"chat__avatar-img\" [foto]=\"chat().fotoOtro\" [nombre]=\"chat().nombreOtro\" /></span>\r\n    <span class=\"chat__title\">\r\n      <strong>{{ chat().nombreOtro }}</strong>\r\n      <small>{{ chat().titulo }}</small>\r\n    </span>\r\n    <button type=\"button\" aria-label=\"Minimizar\" (click)=\"$event.stopPropagation(); chatService.alternarMinimizado(chat())\">\r\n      <svg lucideMinus [size]=\"18\"></svg>\r\n    </button>\r\n    <button type=\"button\" aria-label=\"Cerrar chat\" (click)=\"$event.stopPropagation(); chatService.cerrar(chat())\">\r\n      <svg lucideX [size]=\"18\"></svg>\r\n    </button>\r\n  </header>\r\n\r\n  @if (!chat().minimizado) {\r\n    <a class=\"chat__link\" [routerLink]=\"['/publicaciones', chat().idPublicacion]\">Ver publicaci\u00F3n</a>\r\n\r\n    <app-conversation-panel [mensajes]=\"hilo()\"\r\n      [vacio]=\"cargando() ? 'Cargando conversaci\u00F3n\u2026' : 'Escrib\u00ED tu consulta a ' + chat().nombreOtro + '.'\">\r\n      @if (error()) { <p class=\"chat__error\" role=\"alert\">{{ error() }}</p> }\r\n      @if (publicacionEliminada()) {\r\n        <p class=\"chat__error\" role=\"status\">Esta publicaci\u00F3n ha sido eliminada y no admite contactos. El historial se conserva.</p>\r\n      } @else if (contactoSuspendido()) {\r\n        <p class=\"chat__error\" role=\"status\">Contacto suspendido. Para reservas anteriores, contact\u00E1 a soporte.</p>\r\n      } @else {\r\n        <app-conversation-composer [(texto)]=\"texto\" [limite]=\"250\" [deshabilitado]=\"enviando()\" (enviar)=\"enviar()\" />\r\n      }\r\n    </app-conversation-panel>\r\n  }\r\n</section>\r\n", styles: [":host { display: block; }\r\n\r\n.chat {\r\n  width: 330px;\r\n  height: 450px;\r\n  display: flex;\r\n  flex-direction: column;\r\n  background: #fff;\r\n  border: 1px solid var(--color-border);\r\n  border-radius: 16px 16px 0 0;\r\n  box-shadow: 0 16px 40px rgba(16, 24, 40, 0.22);\r\n  overflow: hidden;\r\n  transform-origin: bottom right;\r\n  animation: chat-open 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;\r\n  transition: height 0.35s cubic-bezier(0.22, 1, 0.36, 1);\r\n}\r\n.chat.is-min { height: 60px; }\r\n@keyframes chat-open {\r\n  from { opacity: 0; transform: translateY(40px) scale(0.9); }\r\n  to { opacity: 1; transform: none; }\r\n}\r\n\r\n.chat__head {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 0.6rem;\r\n  min-height: 60px;\r\n  padding: 0.55rem 0.6rem 0.55rem 0.85rem;\r\n  border-bottom: 1px solid var(--color-border);\r\n  color: var(--color-text);\r\n  cursor: pointer;\r\n}\r\n.chat__head button {\r\n  display: grid;\r\n  place-items: center;\r\n  width: 30px;\r\n  height: 30px;\r\n  border: 0;\r\n  border-radius: 50%;\r\n  background: transparent;\r\n  color: var(--color-text-muted);\r\n  cursor: pointer;\r\n  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;\r\n}\r\n.chat__head button:hover { background: var(--color-bg); color: var(--color-text); transform: scale(1.1); }\r\n.chat__avatar {\r\n  position: relative;\r\n  display: grid;\r\n  place-items: center;\r\n  width: 36px;\r\n  height: 36px;\r\n  flex-shrink: 0;\r\n  border-radius: 50%;\r\n  background: #ffbc59;\r\n  color: var(--color-primary);\r\n  font-weight: 700;\r\n}\r\n.chat__avatar-img { width: 100%; height: 100%; border-radius: 50%; }\r\n.chat__title { display: flex; flex-direction: column; min-width: 0; flex: 1; line-height: 1.25; }\r\n.chat__title strong { font-size: 0.98rem; font-weight: 800; }\r\n.chat__title strong, .chat__title small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\r\n.chat__title small { font-size: 0.75rem; color: var(--color-text-muted); }\r\n\r\n.chat__link {\r\n  padding: 0.4rem 0.9rem;\r\n  font-size: 0.76rem;\r\n  font-weight: 700;\r\n  color: var(--color-accent);\r\n  text-decoration: none;\r\n  border-bottom: 1px solid var(--color-border);\r\n}\r\n.chat__link:hover { text-decoration: underline; }\r\n\r\napp-conversation-panel { flex: 1; border: 0; border-radius: 0; --conversation-height: none; }\r\n.chat__error { margin: 0; padding: 0.35rem 0.9rem; font-size: 0.76rem; color: var(--color-danger); }\r\n\r\n@media (max-width: 480px) {\r\n  .chat { width: 100%; height: 60dvh; }\r\n  .chat__head { gap: .35rem; padding-inline: .5rem; }\r\n  .chat__head button { width: 40px; height: 44px; flex-shrink: 0; }\r\n}\r\n"] }]
    }], () => [], { chat: [{ type: i0.Input, args: [{ isSignal: true, alias: "chat", required: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ChatWindowComponent, { className: "ChatWindowComponent", filePath: "src/app/shared/components/chat-dock/chat-window.component.ts", lineNumber: 33 }); })();
