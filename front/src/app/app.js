import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, computed, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { EMPTY, catchError, exhaustMap, filter, map, startWith, timer } from 'rxjs';
import { LucideArrowRight, LucideHouse, LucideLandmark, LucideLockKeyhole } from '@lucide/angular';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ChatDockComponent } from './shared/components/chat-dock/chat-dock.component';
import { AsistenteDepaComponent } from './shared/components/asistente-depa/asistente-depa.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { PerfilService } from './core/services/perfil.service';
import { AuthService } from './core/services/auth.service';
import * as i0 from "@angular/core";
function App_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "header", 0);
    i0.ɵɵelement(1, "img", 6);
    i0.ɵɵelementEnd();
} }
function App_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-navbar");
} }
function App_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 2);
    i0.ɵɵtext(1, "Tu cuenta tiene acceso limitado para resolver operaciones pendientes. ");
    i0.ɵɵelementStart(2, "a", 7);
    i0.ɵɵtext(3, "Consultar o apelar el bloqueo");
    i0.ɵɵelementEnd()();
} }
function App_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 3);
    i0.ɵɵtext(1, "Abriendo tus reservas\u2026");
    i0.ɵɵelementEnd();
} }
function App_Conditional_5_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 8)(1, "p", 9);
    i0.ɵɵtext(2, "No pudimos comprobar el estado de tu cuenta.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 10);
    i0.ɵɵlistener("click", function App_Conditional_5_Conditional_0_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.reintentarPerfil()); });
    i0.ɵɵtext(4, "Reintentar");
    i0.ɵɵelementEnd()();
} }
function App_Conditional_5_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 3);
    i0.ɵɵtext(1, "Cargando tu cuenta\u2026");
    i0.ɵɵelementEnd();
} }
function App_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, App_Conditional_5_Conditional_0_Template, 5, 0, "div", 8)(1, App_Conditional_5_Conditional_1_Template, 2, 0, "p", 3);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r1.perfil.errorSolicitud() ? 0 : 1);
} }
function App_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 4)(1, "div", 11);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 12)(3, "svg", 13);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(5, "svg", 14);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(6, "div", 15)(7, "h1", 16);
    i0.ɵɵtext(8, "Valid\u00E1 tu CBU para continuar");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "p");
    i0.ɵɵtext(10, "Para seguir usando DEPA y recibir tus pagos, necesit\u00E1s cargar un CBU a tu nombre.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "a", 17);
    i0.ɵɵtext(12, " Validar CBU ");
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(13, "svg", 18);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("size", 32);
    i0.ɵɵadvance(8);
    i0.ɵɵproperty("size", 26);
} }
function App_Conditional_7_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 19);
    i0.ɵɵtext(1, "Continuar a DEPA");
    i0.ɵɵelementEnd();
} }
function App_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵelement(1, "router-outlet");
    i0.ɵɵconditionalCreate(2, App_Conditional_7_Conditional_2_Template, 2, 0, "a", 19);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("cbu-formulario", ctx_r1.esPantallaCbu());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.esPantallaCbu() && !ctx_r1.cbuObligatorio() ? 2 : -1);
} }
function App_Conditional_8_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-footer")(1, "app-asistente-depa");
} }
function App_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, App_Conditional_8_Conditional_0_Template, 2, 0);
    i0.ɵɵelement(1, "app-chat-dock");
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵconditional(!ctx_r1.accesoLimitado() ? 0 : -1);
} }
export class App {
    router = inject(Router);
    perfil = inject(PerfilService);
    auth = inject(AuthService);
    isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    ruta = toSignal(this.router.events.pipe(filter((event) => event instanceof NavigationEnd), map((event) => event.urlAfterRedirects), startWith(this.router.url), map((url) => url.split(/[?#]/)[0])), { requireSync: true });
    esPantallaAuth = computed(() => ['/login', '/registro', '/confirmar-baja', '/reactivar-cuenta', '/verificar-cuenta'].includes(this.ruta()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "esPantallaAuth" }] : /* istanbul ignore next */ []));
    esPantallaCbu = computed(() => this.ruta() === '/mi-perfil/validar-cbu', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "esPantallaCbu" }] : /* istanbul ignore next */ []));
    accesoLimitado = computed(() => this.auth.currentUser()?.accesoLimitado === true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "accesoLimitado" }] : /* istanbul ignore next */ []));
    idUsuario = computed(() => this.auth.currentUser()?.sub, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "idUsuario" }] : /* istanbul ignore next */ []));
    rutaPermitida = computed(() => !this.accesoLimitado() ||
        ['/mis-reservas', '/reserva/resultado', '/cuenta-bloqueada', '/login'].includes(this.ruta()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "rutaPermitida" }] : /* istanbul ignore next */ []));
    mostrarAvisoAcceso = computed(() => this.accesoLimitado() && this.rutaPermitida() &&
        !['/cuenta-bloqueada', '/login'].includes(this.ruta()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mostrarAvisoAcceso" }] : /* istanbul ignore next */ []));
    verificarAcceso = computed(() => this.isBrowser && this.auth.isAuthenticated &&
        !this.accesoLimitado() && !this.esPantallaAuth() && this.ruta() !== '/cuenta-bloqueada', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "verificarAcceso" }] : /* istanbul ignore next */ []));
    comprobandoPerfil = computed(() => this.verificarAcceso() && !this.perfil.solicitudConsultada(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "comprobandoPerfil" }] : /* istanbul ignore next */ []));
    cbuObligatorio = computed(() => this.verificarAcceso() &&
        this.perfil.solicitudConsultada() && this.perfil.necesitaCbu() && !this.perfil.cbuEnRevision(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cbuObligatorio" }] : /* istanbul ignore next */ []));
    accesoRestringido = computed(() => this.comprobandoPerfil() || this.cbuObligatorio(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "accesoRestringido" }] : /* istanbul ignore next */ []));
    constructor() {
        effect(onCleanup => {
            const usuario = this.auth.currentUser();
            if (!this.isBrowser)
                return;
            if (!usuario) {
                this.perfil.limpiar();
                return;
            }
            if (usuario.accesoLimitado)
                return;
            const consulta = untracked(() => this.perfil.cargarSolicitud().subscribe());
            onCleanup(() => consulta.unsubscribe());
        });
        effect(onCleanup => {
            if (!this.isBrowser || !this.auth.currentUser() || this.accesoLimitado() || !this.perfil.cbuEnRevision())
                return;
            const actualizacion = timer(30_000, 30_000).pipe(exhaustMap(() => this.perfil.cargarSolicitud(true))).subscribe();
            onCleanup(() => actualizacion.unsubscribe());
        });
        effect(onCleanup => {
            if (!this.isBrowser || !this.idUsuario())
                return;
            const consulta = timer(0, 30_000).pipe(exhaustMap(() => this.auth.consultarSesion().pipe(catchError(() => EMPTY)))).subscribe();
            onCleanup(() => consulta.unsubscribe());
        });
        effect(() => {
            if (this.isBrowser && !this.rutaPermitida()) {
                void this.router.navigate(['/mis-reservas'], { replaceUrl: true });
            }
        });
    }
    reintentarPerfil() {
        this.perfil.cargarSolicitud(true).subscribe();
    }
    static ɵfac = function App_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || App)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: App, selectors: [["app-root"]], decls: 10, vars: 6, consts: [[1, "cbu-header"], [1, "app-content"], [1, "acceso-limitado-aviso"], ["role", "status", 1, "cbu-cargando"], ["aria-labelledby", "cbu-aviso-titulo", 1, "cbu-aviso"], [3, "cbu-formulario"], ["src", "/images/Logo.png", "alt", "DEPA"], ["routerLink", "/cuenta-bloqueada"], [1, "cbu-cargando"], ["role", "alert"], ["type", "button", 1, "btn", "btn--primary", "cbu-accion", 3, "click"], ["aria-hidden", "true", 1, "cbu-ilustracion"], ["lucideLandmark", "", 1, "cbu-banco"], ["lucideHouse", "", 1, "cbu-casa"], ["lucideLockKeyhole", "", 3, "size"], [1, "cbu-aviso-texto"], ["id", "cbu-aviso-titulo"], ["routerLink", "/mi-perfil/validar-cbu", 1, "btn", "btn--primary", "cbu-accion"], ["lucideArrowRight", "", "aria-hidden", "true", 3, "size"], ["routerLink", "/", 1, "btn", "btn--primary", "cbu-accion"]], template: function App_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, App_Conditional_0_Template, 2, 0, "header", 0)(1, App_Conditional_1_Template, 1, 0, "app-navbar");
            i0.ɵɵelementStart(2, "main", 1);
            i0.ɵɵconditionalCreate(3, App_Conditional_3_Template, 4, 0, "p", 2);
            i0.ɵɵconditionalCreate(4, App_Conditional_4_Template, 2, 0, "p", 3)(5, App_Conditional_5_Template, 2, 1)(6, App_Conditional_6_Template, 14, 2, "section", 4)(7, App_Conditional_7_Template, 3, 3, "div", 5);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(8, App_Conditional_8_Template, 2, 1);
            i0.ɵɵelement(9, "app-toast");
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.accesoRestringido() || ctx.esPantallaCbu() ? 0 : !ctx.esPantallaAuth() ? 1 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵclassProp("cbu-fondo", ctx.accesoRestringido() || ctx.esPantallaCbu());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.mostrarAvisoAcceso() ? 3 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.rutaPermitida() ? 4 : ctx.comprobandoPerfil() ? 5 : ctx.cbuObligatorio() && !ctx.esPantallaCbu() ? 6 : 7);
            i0.ɵɵadvance(4);
            i0.ɵɵconditional(!ctx.esPantallaAuth() && !ctx.esPantallaCbu() && !ctx.accesoRestringido() ? 8 : -1);
        } }, dependencies: [RouterOutlet, RouterLink, NavbarComponent, FooterComponent, ChatDockComponent, AsistenteDepaComponent, ToastComponent, LucideArrowRight, LucideHouse, LucideLandmark, LucideLockKeyhole], styles: ["[_nghost-%COMP%] {\r\n  display: flex;\r\n  flex-direction: column;\r\n  min-height: 100dvh;\r\n}\r\n\r\n.app-content[_ngcontent-%COMP%] {\r\n  flex: 1;\r\n}\r\n\r\n.cbu-header[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  place-items: center;\r\n  min-height: 64px;\r\n  background: white;\r\n}\r\n\r\n.cbu-header[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] { width: auto; height: 34px; }\r\n\r\n.acceso-limitado-aviso[_ngcontent-%COMP%] {\r\n  margin: 0;\r\n  padding: .75rem clamp(1rem, 4vw, 3rem);\r\n  background: #fff2d4;\r\n  color: #443100;\r\n}\r\n\r\n.cbu-fondo[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  place-items: center;\r\n  padding: clamp(1rem, 4vw, 3rem);\r\n  background: linear-gradient(110deg, #101b37cf, #101b3777), var(--%NS%auth-bg-image) center / cover no-repeat, #101b37;\r\n}\r\n\r\n.cbu-aviso[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  grid-template-columns: minmax(13rem, 3fr) minmax(0, 5fr);\r\n  width: min(100%, 56rem);\r\n  overflow: hidden;\r\n  border-radius: 1rem;\r\n  background: white;\r\n  color: #102443;\r\n  box-shadow: 0 18px 48px #08122570;\r\n}\r\n\r\n.cbu-ilustracion[_ngcontent-%COMP%] {\r\n  position: relative;\r\n  display: grid;\r\n  place-content: center;\r\n  min-height: 13rem;\r\n  background: radial-gradient(ellipse at bottom, #ffe1ae, #fff4e4 72%);\r\n}\r\n\r\n.cbu-ilustracion[_ngcontent-%COMP%]    > svg[_ngcontent-%COMP%] { grid-area: 1 / 1; width: clamp(5rem, 13vw, 9rem); height: auto; stroke-width: 1.5; }\r\n.cbu-banco[_ngcontent-%COMP%] { color: #074ca8; fill: #a4d4ff; transform: translate(-16%, -14%); }\r\n.cbu-casa[_ngcontent-%COMP%] { color: #bc3c0b; fill: #fff4e4; transform: translate(27%, 22%) scale(.75); }\r\n.cbu-ilustracion[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\r\n  position: absolute;\r\n  bottom: 18%;\r\n  left: 34%;\r\n  display: grid;\r\n  place-items: center;\r\n  padding: .6rem;\r\n  border-radius: .8rem;\r\n  color: #102443;\r\n  background: #ffb526;\r\n}\r\n\r\n.cbu-aviso-texto[_ngcontent-%COMP%] { padding: clamp(1.25rem, 4vw, 2.75rem); }\r\n.cbu-aviso[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] { margin: 0; font-size: clamp(1.6rem, 3.4vw, 2.3rem); line-height: 1.12; }\r\n.cbu-aviso[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 1rem 0 1.6rem; font-size: clamp(1rem, 2vw, 1.25rem); }\r\n.cbu-accion[_ngcontent-%COMP%] { display: flex; justify-content: center; gap: .65rem; width: 100%; min-height: 3.2rem; }\r\n.cbu-formulario[_ngcontent-%COMP%] { display: grid; gap: 1rem; width: min(100%, 38rem); }\r\n.cbu-cargando[_ngcontent-%COMP%] { color: white; }\r\n\r\n@media (max-width: 620px) {\r\n  .cbu-aviso[_ngcontent-%COMP%] { grid-template-columns: 1fr; }\r\n  .cbu-ilustracion[_ngcontent-%COMP%] { min-height: 9rem; }\r\n  .cbu-ilustracion[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { left: calc(50% - 1.65rem); bottom: 12%; }\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(App, [{
        type: Component,
        args: [{ selector: 'app-root', standalone: true, imports: [RouterOutlet, RouterLink, NavbarComponent, FooterComponent, ChatDockComponent, AsistenteDepaComponent, ToastComponent, LucideArrowRight, LucideHouse, LucideLandmark, LucideLockKeyhole], template: "@if (accesoRestringido() || esPantallaCbu()) {\r\n  <header class=\"cbu-header\"><img src=\"/images/Logo.png\" alt=\"DEPA\" /></header>\r\n} @else if (!esPantallaAuth()) {\r\n  <app-navbar />\r\n}\r\n\r\n<main class=\"app-content\" [class.cbu-fondo]=\"accesoRestringido() || esPantallaCbu()\">\r\n  @if (mostrarAvisoAcceso()) {\r\n    <p class=\"acceso-limitado-aviso\">Tu cuenta tiene acceso limitado para resolver operaciones pendientes. <a routerLink=\"/cuenta-bloqueada\">Consultar o apelar el bloqueo</a></p>\r\n  }\r\n  @if (!rutaPermitida()) {\r\n    <p class=\"cbu-cargando\" role=\"status\">Abriendo tus reservas\u2026</p>\r\n  } @else if (comprobandoPerfil()) {\r\n    @if (perfil.errorSolicitud()) {\r\n      <div class=\"cbu-cargando\">\r\n        <p role=\"alert\">No pudimos comprobar el estado de tu cuenta.</p>\r\n        <button type=\"button\" class=\"btn btn--primary cbu-accion\" (click)=\"reintentarPerfil()\">Reintentar</button>\r\n      </div>\r\n    } @else {\r\n      <p class=\"cbu-cargando\" role=\"status\">Cargando tu cuenta\u2026</p>\r\n    }\r\n  } @else if (cbuObligatorio() && !esPantallaCbu()) {\r\n    <section class=\"cbu-aviso\" aria-labelledby=\"cbu-aviso-titulo\">\r\n      <div class=\"cbu-ilustracion\" aria-hidden=\"true\">\r\n        <svg lucideLandmark class=\"cbu-banco\"></svg>\r\n        <svg lucideHouse class=\"cbu-casa\"></svg>\r\n        <span><svg lucideLockKeyhole [size]=\"32\"></svg></span>\r\n      </div>\r\n      <div class=\"cbu-aviso-texto\">\r\n        <h1 id=\"cbu-aviso-titulo\">Valid\u00E1 tu CBU para continuar</h1>\r\n        <p>Para seguir usando DEPA y recibir tus pagos, necesit\u00E1s cargar un CBU a tu nombre.</p>\r\n        <a class=\"btn btn--primary cbu-accion\" routerLink=\"/mi-perfil/validar-cbu\">\r\n          Validar CBU <svg lucideArrowRight [size]=\"26\" aria-hidden=\"true\"></svg>\r\n        </a>\r\n      </div>\r\n    </section>\r\n  } @else {\r\n    <div [class.cbu-formulario]=\"esPantallaCbu()\">\r\n      <router-outlet />\r\n      @if (esPantallaCbu() && !cbuObligatorio()) {\r\n        <a routerLink=\"/\" class=\"btn btn--primary cbu-accion\">Continuar a DEPA</a>\r\n      }\r\n    </div>\r\n  }\r\n</main>\r\n\r\n@if (!esPantallaAuth() && !esPantallaCbu() && !accesoRestringido()) {\r\n  @if (!accesoLimitado()) {\r\n    <app-footer />\r\n    <app-asistente-depa />\r\n  }\r\n  <app-chat-dock />\r\n}\r\n\r\n<app-toast />\r\n", styles: [":host {\r\n  display: flex;\r\n  flex-direction: column;\r\n  min-height: 100dvh;\r\n}\r\n\r\n.app-content {\r\n  flex: 1;\r\n}\r\n\r\n.cbu-header {\r\n  display: grid;\r\n  place-items: center;\r\n  min-height: 64px;\r\n  background: white;\r\n}\r\n\r\n.cbu-header img { width: auto; height: 34px; }\r\n\r\n.acceso-limitado-aviso {\r\n  margin: 0;\r\n  padding: .75rem clamp(1rem, 4vw, 3rem);\r\n  background: #fff2d4;\r\n  color: #443100;\r\n}\r\n\r\n.cbu-fondo {\r\n  display: grid;\r\n  place-items: center;\r\n  padding: clamp(1rem, 4vw, 3rem);\r\n  background: linear-gradient(110deg, #101b37cf, #101b3777), var(--auth-bg-image) center / cover no-repeat, #101b37;\r\n}\r\n\r\n.cbu-aviso {\r\n  display: grid;\r\n  grid-template-columns: minmax(13rem, 3fr) minmax(0, 5fr);\r\n  width: min(100%, 56rem);\r\n  overflow: hidden;\r\n  border-radius: 1rem;\r\n  background: white;\r\n  color: #102443;\r\n  box-shadow: 0 18px 48px #08122570;\r\n}\r\n\r\n.cbu-ilustracion {\r\n  position: relative;\r\n  display: grid;\r\n  place-content: center;\r\n  min-height: 13rem;\r\n  background: radial-gradient(ellipse at bottom, #ffe1ae, #fff4e4 72%);\r\n}\r\n\r\n.cbu-ilustracion > svg { grid-area: 1 / 1; width: clamp(5rem, 13vw, 9rem); height: auto; stroke-width: 1.5; }\r\n.cbu-banco { color: #074ca8; fill: #a4d4ff; transform: translate(-16%, -14%); }\r\n.cbu-casa { color: #bc3c0b; fill: #fff4e4; transform: translate(27%, 22%) scale(.75); }\r\n.cbu-ilustracion span {\r\n  position: absolute;\r\n  bottom: 18%;\r\n  left: 34%;\r\n  display: grid;\r\n  place-items: center;\r\n  padding: .6rem;\r\n  border-radius: .8rem;\r\n  color: #102443;\r\n  background: #ffb526;\r\n}\r\n\r\n.cbu-aviso-texto { padding: clamp(1.25rem, 4vw, 2.75rem); }\r\n.cbu-aviso h1 { margin: 0; font-size: clamp(1.6rem, 3.4vw, 2.3rem); line-height: 1.12; }\r\n.cbu-aviso p { margin: 1rem 0 1.6rem; font-size: clamp(1rem, 2vw, 1.25rem); }\r\n.cbu-accion { display: flex; justify-content: center; gap: .65rem; width: 100%; min-height: 3.2rem; }\r\n.cbu-formulario { display: grid; gap: 1rem; width: min(100%, 38rem); }\r\n.cbu-cargando { color: white; }\r\n\r\n@media (max-width: 620px) {\r\n  .cbu-aviso { grid-template-columns: 1fr; }\r\n  .cbu-ilustracion { min-height: 9rem; }\r\n  .cbu-ilustracion span { left: calc(50% - 1.65rem); bottom: 12%; }\r\n}\r\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(App, { className: "App", filePath: "src/app/app.ts", lineNumber: 22 }); })();
