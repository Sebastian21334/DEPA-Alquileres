import { ConversationPanelComponent, mensajesApelacion } from '../../../shared/components/conversation-panel/conversation-panel.component';
import { CargaImagenesComponent } from '../../../shared/components/carga-imagenes/carga-imagenes.component';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideCalendar, LucideLockKeyhole, LucideMessageCircle, LucideSend } from '@lucide/angular';
import { AuthService } from '../../../core/services/auth.service';
import { finalize, timer } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
function CuentaBloqueadaComponent_Conditional_8_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 15);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 21);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3, "Registrado el ");
    i0.ɵɵelementStart(4, "time");
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "date");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    i0.ɵɵnextContext(2);
    const detalle_r2 = i0.ɵɵreadContextLet(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 18);
    i0.ɵɵadvance(3);
    i0.ɵɵattribute("datetime", detalle_r2.fecha);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(6, 3, detalle_r2.fecha, "dd/MM/yyyy"));
} }
function CuentaBloqueadaComponent_Conditional_8_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h2", 22);
    i0.ɵɵtext(1, "Apelaci\u00F3n del bloqueo");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "p", 23);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(3, "svg", 24);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelement(5, "app-conversation-panel", 25);
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    const detalle_r2 = i0.ɵɵreadContextLet(2);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("size", 23);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", detalle_r2.respuesta ? "Administraci\u00F3n respondi\u00F3 tu apelaci\u00F3n." : "Tu apelaci\u00F3n est\u00E1 pendiente de respuesta.", " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("mensajes", ctx_r2.mensajesApelacion(detalle_r2, "Vos", true));
} }
function CuentaBloqueadaComponent_Conditional_8_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 26)(1, "h2", 22);
    i0.ɵɵtext(2, "Apelar el bloqueo");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4, "Contanos por qu\u00E9 quer\u00E9s que revisemos tu cuenta.");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "p", 27);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(6, "svg", 24);
    i0.ɵɵtext(7, " Todav\u00EDa no enviaste una apelaci\u00F3n. ");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance(6);
    i0.ɵɵproperty("size", 23);
} }
function CuentaBloqueadaComponent_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "section", 13)(1, "h2", 14);
    i0.ɵɵtext(2, "Motivo del bloqueo");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, CuentaBloqueadaComponent_Conditional_8_Conditional_5_Template, 7, 6, "p", 15);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "section", 16);
    i0.ɵɵconditionalCreate(7, CuentaBloqueadaComponent_Conditional_8_Conditional_7_Template, 6, 3)(8, CuentaBloqueadaComponent_Conditional_8_Conditional_8_Template, 8, 1);
    i0.ɵɵelementStart(9, "form", 17);
    i0.ɵɵlistener("ngSubmit", function CuentaBloqueadaComponent_Conditional_8_Template_form_ngSubmit_9_listener() { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.apelar()); });
    i0.ɵɵelementStart(10, "label", 18);
    i0.ɵɵtext(11, "Tu mensaje");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "textarea", 19);
    i0.ɵɵtwoWayListener("ngModelChange", function CuentaBloqueadaComponent_Conditional_8_Template_textarea_ngModelChange_12_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r2.texto, $event) || (ctx_r2.texto = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("keydown.enter", function CuentaBloqueadaComponent_Conditional_8_Template_textarea_keydown_enter_12_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.apelarConEnter($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(13, "app-carga-imagenes", 20);
    i0.ɵɵtwoWayListener("archivosChange", function CuentaBloqueadaComponent_Conditional_8_Template_app_carga_imagenes_archivosChange_13_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r2.imagenes, $event) || (ctx_r2.imagenes = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    const detalle_r2 = i0.ɵɵreadContextLet(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(detalle_r2.motivo || "El motivo de este bloqueo no est\u00E1 registrado.");
    i0.ɵɵadvance();
    i0.ɵɵconditional(detalle_r2.fecha ? 5 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(detalle_r2.apelacion ? 7 : 8);
    i0.ɵɵadvance(2);
    i0.ɵɵattribute("aria-busy", ctx_r2.ocupado());
    i0.ɵɵadvance(3);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r2.texto);
    i0.ɵɵproperty("disabled", ctx_r2.ocupado());
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵproperty("maximo", 1);
    i0.ɵɵtwoWayProperty("archivos", ctx_r2.imagenes);
    i0.ɵɵproperty("deshabilitado", ctx_r2.ocupado());
} }
function CuentaBloqueadaComponent_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 6);
    i0.ɵɵtext(1, "Cargando el detalle del bloqueo\u2026");
    i0.ɵɵelementEnd();
} }
function CuentaBloqueadaComponent_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 28);
    i0.ɵɵlistener("click", function CuentaBloqueadaComponent_Conditional_10_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.consultar()); });
    i0.ɵɵtext(1, "Reintentar");
    i0.ɵɵelementEnd();
} }
function CuentaBloqueadaComponent_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "Ingres\u00E1 con tu correo y contrase\u00F1a para consultar el motivo o apelar.");
    i0.ɵɵelementEnd();
} }
function CuentaBloqueadaComponent_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 8);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.error());
} }
function CuentaBloqueadaComponent_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 12);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 29);
    i0.ɵɵtext(2, " Enviar apelaci\u00F3n ");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", !ctx_r2.puedeApelar);
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 22);
} }
export class CuentaBloqueadaComponent {
    auth = inject(AuthService);
    destroyRef = inject(DestroyRef);
    bloqueo = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "bloqueo" }] : /* istanbul ignore next */ []));
    error = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    ocupado = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ocupado" }] : /* istanbul ignore next */ []));
    accesoLimitado = computed(() => this.auth.currentUser()?.accesoLimitado === true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "accesoLimitado" }] : /* istanbul ignore next */ []));
    accesoVigente = signal(Boolean(this.auth.tokenBloqueo) || this.accesoLimitado(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "accesoVigente" }] : /* istanbul ignore next */ []));
    texto = '';
    /** El back admite una imagen por mensaje; `app-carga-imagenes` la valida. */
    imagenes = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "imagenes" }] : /* istanbul ignore next */ []));
    version = 0;
    actualizando = false;
    mensajesApelacion = mensajesApelacion;
    get puedeApelar() {
        const detalle = this.bloqueo();
        const texto = this.texto.trim();
        return !!detalle && this.accesoVigente() && !this.ocupado() &&
            texto.length > 0 && texto.length <= 2000;
    }
    constructor() {
        if (this.accesoVigente())
            this.consultar();
        if (isPlatformBrowser(inject(PLATFORM_ID)))
            timer(15_000, 15_000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.actualizarSilencioso());
    }
    actualizarSilencioso() {
        if (!this.accesoVigente() || this.ocupado() || this.actualizando)
            return;
        const version = this.version;
        this.actualizando = true;
        this.auth.consultarBloqueo(this.auth.tokenBloqueo).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => { this.actualizando = false; })).subscribe({
            next: bloqueo => { if (version === this.version && !this.ocupado())
                this.bloqueo.set(bloqueo); },
            error: (error) => {
                if (version === this.version && !this.ocupado() && (error.status === 401 || error.status === 403))
                    this.mostrarError(error);
            },
        });
    }
    consultar() {
        const token = this.auth.tokenBloqueo;
        if (!this.accesoVigente() || this.ocupado())
            return;
        this.ocupado.set(true);
        this.error.set('');
        this.auth.consultarBloqueo(token).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (bloqueo) => {
                this.bloqueo.set(bloqueo);
                this.ocupado.set(false);
            },
            error: (error) => this.mostrarError(error),
        });
    }
    apelar() {
        if (!this.puedeApelar)
            return;
        const token = this.auth.tokenBloqueo;
        const texto = this.texto.trim();
        this.version++;
        this.ocupado.set(true);
        this.error.set('');
        this.auth.apelarBloqueo(token, texto, this.imagenes()[0] ?? null).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (bloqueo) => {
                this.bloqueo.set(bloqueo);
                this.texto = '';
                this.imagenes.set([]);
                this.ocupado.set(false);
            },
            error: (error) => this.mostrarError(error),
        });
    }
    apelarConEnter(evento) {
        const tecla = evento;
        if (tecla.shiftKey || tecla.isComposing)
            return;
        tecla.preventDefault();
        this.apelar();
    }
    mostrarError(error) {
        this.ocupado.set(false);
        this.error.set(error.message);
        if (error.status === 401 || error.status === 403) {
            this.auth.tokenBloqueo = null;
            this.accesoVigente.set(false);
            this.bloqueo.set(null);
        }
    }
    static ɵfac = function CuentaBloqueadaComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CuentaBloqueadaComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CuentaBloqueadaComponent, selectors: [["app-cuenta-bloqueada"]], decls: 18, vars: 9, consts: [[1, "blocked-page"], ["aria-labelledby", "blocked-title", 1, "blocked-card"], [1, "blocked-header"], ["aria-hidden", "true", 1, "blocked-icon"], ["lucideLockKeyhole", "", 3, "size"], ["id", "blocked-title"], ["role", "status"], ["type", "button", 1, "retry-button"], ["role", "alert", 1, "blocked-error"], [1, "blocked-actions"], [1, "back-link", 3, "routerLink"], ["lucideArrowLeft", "", "aria-hidden", "true", 3, "size"], ["type", "submit", "form", "blocked-appeal-form", 1, "submit-appeal", 3, "disabled"], ["aria-labelledby", "blocked-reason-title", 1, "blocked-reason"], ["id", "blocked-reason-title"], [1, "blocked-date"], ["aria-labelledby", "appeal-title", 1, "appeal"], ["id", "blocked-appeal-form", 3, "ngSubmit"], ["for", "appeal-message"], ["id", "appeal-message", "name", "mensaje", "rows", "4", "maxlength", "2000", "required", "", "placeholder", "Escrib\u00ED un mensaje\u2026", 3, "ngModelChange", "keydown.enter", "ngModel", "disabled"], ["etiqueta", "Imagen (opcional)", 1, "appeal-attachment", 3, "archivosChange", "maximo", "archivos", "deshabilitado"], ["lucideCalendar", "", "aria-hidden", "true", 3, "size"], ["id", "appeal-title"], ["role", "status", 1, "appeal-status"], ["lucideMessageCircle", "", "aria-hidden", "true", 3, "size"], [3, "mensajes"], [1, "appeal-heading"], [1, "appeal-status"], ["type", "button", 1, "retry-button", 3, "click"], ["lucideSend", "", "aria-hidden", "true", 3, "size"]], template: function CuentaBloqueadaComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "section", 1);
            i0.ɵɵdeclareLet(2);
            i0.ɵɵelementStart(3, "header", 2)(4, "span", 3);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(5, "svg", 4);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(6, "h1", 5);
            i0.ɵɵtext(7);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(8, CuentaBloqueadaComponent_Conditional_8_Template, 14, 9)(9, CuentaBloqueadaComponent_Conditional_9_Template, 2, 0, "p", 6)(10, CuentaBloqueadaComponent_Conditional_10_Template, 2, 0, "button", 7)(11, CuentaBloqueadaComponent_Conditional_11_Template, 2, 0, "p");
            i0.ɵɵconditionalCreate(12, CuentaBloqueadaComponent_Conditional_12_Template, 2, 1, "p", 8);
            i0.ɵɵelementStart(13, "footer", 9)(14, "a", 10);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(15, "svg", 11);
            i0.ɵɵtext(16);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(17, CuentaBloqueadaComponent_Conditional_17_Template, 3, 2, "button", 12);
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            const detalle_r5 = i0.ɵɵstoreLet(ctx.bloqueo());
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("size", 30);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.accesoLimitado() ? "Tu cuenta tiene acceso limitado" : "Tu cuenta est\u00E1 bloqueada");
            i0.ɵɵadvance();
            i0.ɵɵconditional(detalle_r5 ? 8 : ctx.ocupado() ? 9 : ctx.accesoVigente() ? 10 : !ctx.error() ? 11 : -1);
            i0.ɵɵadvance(4);
            i0.ɵɵconditional(ctx.error() ? 12 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("routerLink", ctx.accesoLimitado() ? "/mis-reservas" : "/login");
            i0.ɵɵadvance();
            i0.ɵɵproperty("size", 21);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.accesoLimitado() ? "Volver a mis reservas" : "Volver al inicio de sesi\u00F3n", " ");
            i0.ɵɵadvance();
            i0.ɵɵconditional(detalle_r5 ? 17 : -1);
        } }, dependencies: [FormsModule, i1.ɵNgNoValidate, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.RequiredValidator, i1.MaxLengthValidator, i1.NgModel, i1.NgForm, RouterLink, ConversationPanelComponent, CargaImagenesComponent, LucideArrowLeft, LucideCalendar,
            LucideLockKeyhole, LucideMessageCircle, LucideSend,
            DatePipe], styles: [".blocked-page[_ngcontent-%COMP%] {\r\n  min-height: 70vh;\r\n  padding: clamp(24px, 4vw, 48px) clamp(14px, 3.35vw, 28px);\r\n  background: radial-gradient(ellipse at top, #eaf0f6, #f2f5f9 75%);\r\n  color: #0d1525;\r\n}\r\n\r\n.blocked-card[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  gap: 22px;\r\n  width: min(100%, 676px);\r\n  margin-inline: auto;\r\n  padding: clamp(18px, 4.2vw, 30px);\r\n  background: #fff;\r\n  border: 1px solid #cbd5e3;\r\n  border-radius: 22px;\r\n}\r\n\r\nh1[_ngcontent-%COMP%], h2[_ngcontent-%COMP%], p[_ngcontent-%COMP%] {\r\n  margin: 0;\r\n}\r\n\r\n.blocked-header[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  justify-items: start;\r\n  gap: 10px;\r\n}\r\n\r\n.blocked-icon[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  place-items: center;\r\n  width: 56px;\r\n  height: 56px;\r\n  border-radius: 14px;\r\n  background: #ffe3d3;\r\n}\r\n\r\nh1[_ngcontent-%COMP%] {\r\n  font-size: clamp(1.65rem, 5vw, 2.25rem);\r\n  font-weight: 800;\r\n  line-height: 1.12;\r\n  letter-spacing: -0.035em;\r\n}\r\n\r\n.blocked-reason[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  gap: 7px;\r\n  padding: 14px 17px 16px;\r\n  background: #fdf5e7;\r\n  border: 1px solid #f0d5aa;\r\n  border-radius: 10px;\r\n}\r\n\r\n.blocked-reason[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\r\n  font-size: 1.25rem;\r\n  font-weight: 800;\r\n}\r\n\r\n.blocked-reason[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\r\n  overflow-wrap: anywhere;\r\n  white-space: pre-wrap;\r\n}\r\n\r\n.blocked-date[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 10px;\r\n  color: #4f5c6b;\r\n  font-size: 0.925rem;\r\n}\r\n\r\n.blocked-date[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%], .appeal-status[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\r\n  flex: none;\r\n}\r\n\r\n.appeal[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  gap: 15px;\r\n  min-width: 0;\r\n}\r\n\r\n.appeal[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\r\n  font-size: clamp(1.4rem, 4vw, 1.9rem);\r\n  font-weight: 800;\r\n  line-height: 1.15;\r\n  letter-spacing: -0.025em;\r\n}\r\n\r\n.appeal-heading[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\r\n  margin-top: 4px;\r\n  color: #474f60;\r\n}\r\n\r\n.appeal-status[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 13px;\r\n  padding: 10px 16px;\r\n  border-radius: 8px;\r\n  background: #e4eefc;\r\n  color: #243247;\r\n}\r\n\r\n.appeal-status[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] {\r\n  color: #15458e;\r\n}\r\n\r\nform[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  gap: 8px;\r\n}\r\n\r\nlabel[_ngcontent-%COMP%] {\r\n  font-weight: 750;\r\n}\r\n\r\ntextarea[_ngcontent-%COMP%] {\r\n  display: block;\r\n  width: 100%;\r\n  min-height: 106px;\r\n  padding: 10px 14px;\r\n  border: 1px solid #9aa9c1;\r\n  border-radius: 8px;\r\n  background: #fff;\r\n  color: inherit;\r\n  font: inherit;\r\n  resize: vertical;\r\n}\r\n\r\ntextarea[_ngcontent-%COMP%]::placeholder {\r\n  color: #59667d;\r\n}\r\n\r\n.appeal-attachment[_ngcontent-%COMP%] {\r\n  margin-top: 6px;\r\n}\r\n\r\n.blocked-actions[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  flex-wrap: wrap;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: 12px 20px;\r\n}\r\n\r\n.back-link[_ngcontent-%COMP%], .submit-appeal[_ngcontent-%COMP%] {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 10px;\r\n  min-height: 44px;\r\n}\r\n\r\n.back-link[_ngcontent-%COMP%], .retry-button[_ngcontent-%COMP%] {\r\n  color: #0b3d91;\r\n  font-weight: 650;\r\n}\r\n\r\n.back-link[_ngcontent-%COMP%] {\r\n  text-decoration: none;\r\n}\r\n\r\n.back-link[_ngcontent-%COMP%]:hover, .retry-button[_ngcontent-%COMP%]:hover {\r\n  text-decoration: underline;\r\n}\r\n\r\n.retry-button[_ngcontent-%COMP%] {\r\n  justify-self: start;\r\n  padding: 4px 0;\r\n  border: 0;\r\n  background: transparent;\r\n  font: inherit;\r\n  cursor: pointer;\r\n}\r\n\r\n.submit-appeal[_ngcontent-%COMP%] {\r\n  justify-content: center;\r\n  padding: 9px 24px;\r\n  border: 1px solid transparent;\r\n  border-radius: 8px;\r\n  background: #064fce;\r\n  color: #fff;\r\n  font: inherit;\r\n  font-weight: 750;\r\n  cursor: pointer;\r\n}\r\n\r\n.submit-appeal[_ngcontent-%COMP%]:hover:not(:disabled) {\r\n  background: #0641a9;\r\n}\r\n\r\n.submit-appeal[_ngcontent-%COMP%]:disabled {\r\n  background: #426cae;\r\n  cursor: default;\r\n}\r\n\r\n.retry-button[_ngcontent-%COMP%]:disabled {\r\n  cursor: default;\r\n  opacity: 0.7;\r\n}\r\n\r\n[_ngcontent-%COMP%]:is(a, button, textarea):focus-visible {\r\n  outline: 2px solid #0755cb;\r\n  outline-offset: 3px;\r\n}\r\n\r\n.blocked-error[_ngcontent-%COMP%] {\r\n  padding: 10px 14px;\r\n  border-radius: 8px;\r\n  background: #fff0ed;\r\n  color: #9a2720;\r\n  overflow-wrap: anywhere;\r\n}\r\n\r\n@media (max-width: 480px) {\r\n  .blocked-card[_ngcontent-%COMP%] {\r\n    gap: 18px;\r\n    border-radius: 16px;\r\n  }\r\n\r\n  .blocked-actions[_ngcontent-%COMP%] {\r\n    flex-direction: column;\r\n    align-items: stretch;\r\n  }\r\n\r\n  .back-link[_ngcontent-%COMP%] {\r\n    min-height: 36px;\r\n  }\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CuentaBloqueadaComponent, [{
        type: Component,
        args: [{ selector: 'app-cuenta-bloqueada', imports: [DatePipe, FormsModule, RouterLink, ConversationPanelComponent, CargaImagenesComponent, LucideArrowLeft, LucideCalendar,
                    LucideLockKeyhole, LucideMessageCircle, LucideSend], template: "<div class=\"blocked-page\">\r\n  <section class=\"blocked-card\" aria-labelledby=\"blocked-title\">\r\n    @let detalle = bloqueo();\r\n\r\n    <header class=\"blocked-header\">\r\n      <span class=\"blocked-icon\" aria-hidden=\"true\">\r\n        <svg lucideLockKeyhole [size]=\"30\"></svg>\r\n      </span>\r\n      <h1 id=\"blocked-title\">{{ accesoLimitado() ? 'Tu cuenta tiene acceso limitado' : 'Tu cuenta est\u00E1 bloqueada' }}</h1>\r\n    </header>\r\n\r\n    @if (detalle) {\r\n      <section class=\"blocked-reason\" aria-labelledby=\"blocked-reason-title\">\r\n        <h2 id=\"blocked-reason-title\">Motivo del bloqueo</h2>\r\n        <p>{{ detalle.motivo || 'El motivo de este bloqueo no est\u00E1 registrado.' }}</p>\r\n        @if (detalle.fecha) {\r\n          <p class=\"blocked-date\">\r\n            <svg lucideCalendar [size]=\"18\" aria-hidden=\"true\"></svg>\r\n            <span>Registrado el <time [attr.datetime]=\"detalle.fecha\">{{ detalle.fecha | date: 'dd/MM/yyyy' }}</time></span>\r\n          </p>\r\n        }\r\n      </section>\r\n\r\n      <section class=\"appeal\" aria-labelledby=\"appeal-title\">\r\n        @if (detalle.apelacion) {\r\n          <h2 id=\"appeal-title\">Apelaci\u00F3n del bloqueo</h2>\r\n          <p class=\"appeal-status\" role=\"status\">\r\n            <svg lucideMessageCircle [size]=\"23\" aria-hidden=\"true\"></svg>\r\n            {{ detalle.respuesta ? 'Administraci\u00F3n respondi\u00F3 tu apelaci\u00F3n.' : 'Tu apelaci\u00F3n est\u00E1 pendiente de respuesta.' }}\r\n          </p>\r\n          <app-conversation-panel [mensajes]=\"mensajesApelacion(detalle, 'Vos', true)\" />\r\n        } @else {\r\n          <div class=\"appeal-heading\">\r\n            <h2 id=\"appeal-title\">Apelar el bloqueo</h2>\r\n            <p>Contanos por qu\u00E9 quer\u00E9s que revisemos tu cuenta.</p>\r\n          </div>\r\n          <p class=\"appeal-status\">\r\n            <svg lucideMessageCircle [size]=\"23\" aria-hidden=\"true\"></svg>\r\n            Todav\u00EDa no enviaste una apelaci\u00F3n.\r\n          </p>\r\n        }\r\n        <form id=\"blocked-appeal-form\" [attr.aria-busy]=\"ocupado()\" (ngSubmit)=\"apelar()\">\r\n          <label for=\"appeal-message\">Tu mensaje</label>\r\n          <textarea id=\"appeal-message\" name=\"mensaje\" [(ngModel)]=\"texto\" rows=\"4\" maxlength=\"2000\"\r\n            required [disabled]=\"ocupado()\" placeholder=\"Escrib\u00ED un mensaje\u2026\"\r\n            (keydown.enter)=\"apelarConEnter($event)\"></textarea>\r\n          <app-carga-imagenes class=\"appeal-attachment\" etiqueta=\"Imagen (opcional)\" [maximo]=\"1\" [(archivos)]=\"imagenes\" [deshabilitado]=\"ocupado()\" />\r\n        </form>\r\n      </section>\r\n    } @else if (ocupado()) {\r\n      <p role=\"status\">Cargando el detalle del bloqueo\u2026</p>\r\n    } @else if (accesoVigente()) {\r\n      <button type=\"button\" class=\"retry-button\" (click)=\"consultar()\">Reintentar</button>\r\n    } @else if (!error()) {\r\n      <p>Ingres\u00E1 con tu correo y contrase\u00F1a para consultar el motivo o apelar.</p>\r\n    }\r\n\r\n    @if (error()) {\r\n      <p class=\"blocked-error\" role=\"alert\">{{ error() }}</p>\r\n    }\r\n\r\n    <footer class=\"blocked-actions\">\r\n      <a class=\"back-link\" [routerLink]=\"accesoLimitado() ? '/mis-reservas' : '/login'\">\r\n        <svg lucideArrowLeft [size]=\"21\" aria-hidden=\"true\"></svg>\r\n        {{ accesoLimitado() ? 'Volver a mis reservas' : 'Volver al inicio de sesi\u00F3n' }}\r\n      </a>\r\n      @if (detalle) {\r\n        <button class=\"submit-appeal\" type=\"submit\" form=\"blocked-appeal-form\" [disabled]=\"!puedeApelar\">\r\n          <svg lucideSend [size]=\"22\" aria-hidden=\"true\"></svg>\r\n          Enviar apelaci\u00F3n\r\n        </button>\r\n      }\r\n    </footer>\r\n  </section>\r\n</div>\r\n", styles: [".blocked-page {\r\n  min-height: 70vh;\r\n  padding: clamp(24px, 4vw, 48px) clamp(14px, 3.35vw, 28px);\r\n  background: radial-gradient(ellipse at top, #eaf0f6, #f2f5f9 75%);\r\n  color: #0d1525;\r\n}\r\n\r\n.blocked-card {\r\n  display: grid;\r\n  gap: 22px;\r\n  width: min(100%, 676px);\r\n  margin-inline: auto;\r\n  padding: clamp(18px, 4.2vw, 30px);\r\n  background: #fff;\r\n  border: 1px solid #cbd5e3;\r\n  border-radius: 22px;\r\n}\r\n\r\nh1, h2, p {\r\n  margin: 0;\r\n}\r\n\r\n.blocked-header {\r\n  display: grid;\r\n  justify-items: start;\r\n  gap: 10px;\r\n}\r\n\r\n.blocked-icon {\r\n  display: grid;\r\n  place-items: center;\r\n  width: 56px;\r\n  height: 56px;\r\n  border-radius: 14px;\r\n  background: #ffe3d3;\r\n}\r\n\r\nh1 {\r\n  font-size: clamp(1.65rem, 5vw, 2.25rem);\r\n  font-weight: 800;\r\n  line-height: 1.12;\r\n  letter-spacing: -0.035em;\r\n}\r\n\r\n.blocked-reason {\r\n  display: grid;\r\n  gap: 7px;\r\n  padding: 14px 17px 16px;\r\n  background: #fdf5e7;\r\n  border: 1px solid #f0d5aa;\r\n  border-radius: 10px;\r\n}\r\n\r\n.blocked-reason h2 {\r\n  font-size: 1.25rem;\r\n  font-weight: 800;\r\n}\r\n\r\n.blocked-reason p {\r\n  overflow-wrap: anywhere;\r\n  white-space: pre-wrap;\r\n}\r\n\r\n.blocked-date {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 10px;\r\n  color: #4f5c6b;\r\n  font-size: 0.925rem;\r\n}\r\n\r\n.blocked-date svg, .appeal-status svg {\r\n  flex: none;\r\n}\r\n\r\n.appeal {\r\n  display: grid;\r\n  gap: 15px;\r\n  min-width: 0;\r\n}\r\n\r\n.appeal h2 {\r\n  font-size: clamp(1.4rem, 4vw, 1.9rem);\r\n  font-weight: 800;\r\n  line-height: 1.15;\r\n  letter-spacing: -0.025em;\r\n}\r\n\r\n.appeal-heading p {\r\n  margin-top: 4px;\r\n  color: #474f60;\r\n}\r\n\r\n.appeal-status {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 13px;\r\n  padding: 10px 16px;\r\n  border-radius: 8px;\r\n  background: #e4eefc;\r\n  color: #243247;\r\n}\r\n\r\n.appeal-status svg {\r\n  color: #15458e;\r\n}\r\n\r\nform {\r\n  display: grid;\r\n  gap: 8px;\r\n}\r\n\r\nlabel {\r\n  font-weight: 750;\r\n}\r\n\r\ntextarea {\r\n  display: block;\r\n  width: 100%;\r\n  min-height: 106px;\r\n  padding: 10px 14px;\r\n  border: 1px solid #9aa9c1;\r\n  border-radius: 8px;\r\n  background: #fff;\r\n  color: inherit;\r\n  font: inherit;\r\n  resize: vertical;\r\n}\r\n\r\ntextarea::placeholder {\r\n  color: #59667d;\r\n}\r\n\r\n.appeal-attachment {\r\n  margin-top: 6px;\r\n}\r\n\r\n.blocked-actions {\r\n  display: flex;\r\n  flex-wrap: wrap;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: 12px 20px;\r\n}\r\n\r\n.back-link, .submit-appeal {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 10px;\r\n  min-height: 44px;\r\n}\r\n\r\n.back-link, .retry-button {\r\n  color: #0b3d91;\r\n  font-weight: 650;\r\n}\r\n\r\n.back-link {\r\n  text-decoration: none;\r\n}\r\n\r\n.back-link:hover, .retry-button:hover {\r\n  text-decoration: underline;\r\n}\r\n\r\n.retry-button {\r\n  justify-self: start;\r\n  padding: 4px 0;\r\n  border: 0;\r\n  background: transparent;\r\n  font: inherit;\r\n  cursor: pointer;\r\n}\r\n\r\n.submit-appeal {\r\n  justify-content: center;\r\n  padding: 9px 24px;\r\n  border: 1px solid transparent;\r\n  border-radius: 8px;\r\n  background: #064fce;\r\n  color: #fff;\r\n  font: inherit;\r\n  font-weight: 750;\r\n  cursor: pointer;\r\n}\r\n\r\n.submit-appeal:hover:not(:disabled) {\r\n  background: #0641a9;\r\n}\r\n\r\n.submit-appeal:disabled {\r\n  background: #426cae;\r\n  cursor: default;\r\n}\r\n\r\n.retry-button:disabled {\r\n  cursor: default;\r\n  opacity: 0.7;\r\n}\r\n\r\n:is(a, button, textarea):focus-visible {\r\n  outline: 2px solid #0755cb;\r\n  outline-offset: 3px;\r\n}\r\n\r\n.blocked-error {\r\n  padding: 10px 14px;\r\n  border-radius: 8px;\r\n  background: #fff0ed;\r\n  color: #9a2720;\r\n  overflow-wrap: anywhere;\r\n}\r\n\r\n@media (max-width: 480px) {\r\n  .blocked-card {\r\n    gap: 18px;\r\n    border-radius: 16px;\r\n  }\r\n\r\n  .blocked-actions {\r\n    flex-direction: column;\r\n    align-items: stretch;\r\n  }\r\n\r\n  .back-link {\r\n    min-height: 36px;\r\n  }\r\n}\r\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CuentaBloqueadaComponent, { className: "CuentaBloqueadaComponent", filePath: "src/app/features/auth/cuenta-bloqueada/cuenta-bloqueada.component.ts", lineNumber: 20 }); })();
