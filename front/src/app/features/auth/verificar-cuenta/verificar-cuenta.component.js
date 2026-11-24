import { Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import * as i0 from "@angular/core";
function VerificarCuentaComponent_Case_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h1", 4);
    i0.ɵɵtext(1, "Verificando tu cuenta\u2026");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "p", 5);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.mensaje());
} }
function VerificarCuentaComponent_Case_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h1", 4);
    i0.ɵɵtext(1, "\u00A1Cuenta verificada!");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "p", 5);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "a", 6);
    i0.ɵɵtext(5, "Ir a iniciar sesi\u00F3n");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.mensaje());
} }
function VerificarCuentaComponent_Case_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h1", 4);
    i0.ɵɵtext(1, "No pudimos verificar tu cuenta");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "p", 7);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "a", 6);
    i0.ɵɵtext(5, "Ir a iniciar sesi\u00F3n");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.mensaje());
} }
// Consume el link que el backend envía por mail al registrarse (ver
// back/src/mail/mail.service.ts#enviarVerificacion, que arma
// "${frontendUrl}/verificar-cuenta?token=...") y completa RN-2/el caso de
// uso "Crear Usuario": sin esta pantalla, el link del mail no tendría a
// dónde apuntar y ninguna cuenta nueva podría iniciar sesión (RF2 exige
// email_verificado = true).
//
// OJO con SSR: la app tiene hidratación habilitada
// (app.config.ts#provideClientHydration) y explícitamente excluye los POST
// del transfer-cache (withHttpTransferCacheOptions({ includePostRequests:
// false })). Si este POST se disparara en ngOnInit sin más, se ejecutaría
// dos veces: una en el servidor durante el render SSR (consumiendo el
// token, éxito invisible para el usuario) y otra en el navegador al
// hidratar — la segunda siempre falla porque el token es de un solo uso
// (back/src/usuarios/service/usuarios.service.ts#verificarCuenta), así que
// todo usuario real vería "Token inválido" aunque su cuenta sí haya
// quedado verificada. Por eso se guarda con isPlatformBrowser: la
// verificación real solo se dispara una vez, del lado del cliente.
export class VerificarCuentaComponent {
    route = inject(ActivatedRoute);
    authService = inject(AuthService);
    platformId = inject(PLATFORM_ID);
    estado = signal('verificando', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "estado" }] : /* istanbul ignore next */ []));
    mensaje = signal('Verificando tu cuenta…', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mensaje" }] : /* istanbul ignore next */ []));
    ngOnInit() {
        if (!isPlatformBrowser(this.platformId))
            return; // evita duplicar el POST durante el render SSR
        const token = this.route.snapshot.queryParamMap.get('token');
        if (!token) {
            this.estado.set('error');
            this.mensaje.set('El link de verificación no es válido: falta el token.');
            return;
        }
        this.authService.verificarCuenta(token).subscribe({
            next: (res) => {
                this.estado.set('exito');
                this.mensaje.set(res.mensaje);
            },
            error: (err) => {
                this.estado.set('error');
                this.mensaje.set(err.message);
            },
        });
    }
    static ɵfac = function VerificarCuentaComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || VerificarCuentaComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: VerificarCuentaComponent, selectors: [["app-verificar-cuenta"]], decls: 7, vars: 1, consts: [[1, "auth"], [1, "auth__card"], ["routerLink", "/", "aria-label", "Ir al inicio", 1, "auth__brand"], ["src", "/images/Logo.png", "alt", "DEPA"], [1, "auth__title"], [1, "auth__subtitle"], ["routerLink", "/login", 1, "btn", "btn--primary"], [1, "auth__subtitle", "auth__subtitle--error"]], template: function VerificarCuentaComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "div", 1)(2, "a", 2);
            i0.ɵɵelement(3, "img", 3);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(4, VerificarCuentaComponent_Case_4_Template, 4, 1)(5, VerificarCuentaComponent_Case_5_Template, 6, 1)(6, VerificarCuentaComponent_Case_6_Template, 6, 1);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            let tmp_0_0;
            i0.ɵɵadvance(4);
            i0.ɵɵconditional((tmp_0_0 = ctx.estado()) === "verificando" ? 4 : tmp_0_0 === "exito" ? 5 : tmp_0_0 === "error" ? 6 : -1);
        } }, dependencies: [RouterLink], styles: [".auth[_ngcontent-%COMP%] {\r\n  min-height: 100dvh;\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n  padding: 2.5rem 1rem 3rem;\r\n  background:\r\n    linear-gradient(180deg, rgba(10, 12, 20, 0.45) 0%, rgba(10, 12, 20, 0.75) 100%),\r\n    var(--%NS%auth-bg-image, none) center / cover no-repeat,\r\n    radial-gradient(circle at 20% 10%, rgba(216, 71, 30, 0.3), transparent 45%),\r\n    radial-gradient(circle at 85% 85%, rgba(14, 70, 161, 0.35), transparent 45%),\r\n    var(--%NS%color-dark);\r\n}\r\n\r\n.auth__card[_ngcontent-%COMP%] {\r\n  width: 100%;\r\n  max-width: 440px;\r\n  background: var(--%NS%color-surface);\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: var(--%NS%radius-lg);\r\n  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);\r\n  padding: 2.25rem 2rem;\r\n  text-align: center;\r\n  display: flex;\r\n  flex-direction: column;\r\n  align-items: center;\r\n  gap: 1rem;\r\n}\r\n\r\n.auth__brand[_ngcontent-%COMP%] {\r\n  display: block;\r\n  text-decoration: none;\r\n  font-size: 1.3rem;\r\n  font-weight: 700;\r\n  letter-spacing: -0.01em;\r\n  color: var(--%NS%color-text);\r\n}\r\n\r\n.auth__brand[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\r\n  display: block;\r\n  height: 44px;\r\n  width: auto;\r\n  margin: 0 auto;\r\n}\r\n\r\n.auth__title[_ngcontent-%COMP%] {\r\n  margin: 0;\r\n  font-size: 1.4rem;\r\n  font-weight: 800;\r\n  color: var(--%NS%color-text);\r\n}\r\n\r\n.auth__subtitle[_ngcontent-%COMP%] {\r\n  margin: 0;\r\n  color: var(--%NS%color-text-muted);\r\n  font-size: 0.95rem;\r\n}\r\n\r\n.auth__subtitle--error[_ngcontent-%COMP%] {\r\n  color: var(--%NS%color-danger);\r\n}\r\n\r\n.btn[_ngcontent-%COMP%] {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 0.75rem 1.25rem;\r\n  border-radius: var(--%NS%radius-pill);\r\n  border: none;\r\n  font-weight: 700;\r\n  cursor: pointer;\r\n  font-size: 0.95rem;\r\n  text-decoration: none;\r\n}\r\n\r\n.btn--primary[_ngcontent-%COMP%] {\r\n  background: var(--%NS%color-accent);\r\n  color: #1a1200;\r\n  box-shadow: 0 8px 20px color-mix(in srgb, var(--%NS%color-accent) 45%, transparent);\r\n}\r\n\r\n.btn--%NS%primary[_ngcontent-%COMP%]:hover {\r\n  background: color-mix(in srgb, var(--%NS%color-accent) 88%, black);\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(VerificarCuentaComponent, [{
        type: Component,
        args: [{ selector: 'app-verificar-cuenta', standalone: true, imports: [RouterLink], template: "<section class=\"auth\">\r\n  <div class=\"auth__card\">\r\n    <a routerLink=\"/\" class=\"auth__brand\" aria-label=\"Ir al inicio\"><img src=\"/images/Logo.png\" alt=\"DEPA\" /></a>\r\n    @switch (estado()) {\r\n      @case ('verificando') {\r\n        <h1 class=\"auth__title\">Verificando tu cuenta\u2026</h1>\r\n        <p class=\"auth__subtitle\">{{ mensaje() }}</p>\r\n      }\r\n      @case ('exito') {\r\n        <h1 class=\"auth__title\">\u00A1Cuenta verificada!</h1>\r\n        <p class=\"auth__subtitle\">{{ mensaje() }}</p>\r\n        <a routerLink=\"/login\" class=\"btn btn--primary\">Ir a iniciar sesi\u00F3n</a>\r\n      }\r\n      @case ('error') {\r\n        <h1 class=\"auth__title\">No pudimos verificar tu cuenta</h1>\r\n        <p class=\"auth__subtitle auth__subtitle--error\">{{ mensaje() }}</p>\r\n        <a routerLink=\"/login\" class=\"btn btn--primary\">Ir a iniciar sesi\u00F3n</a>\r\n      }\r\n    }\r\n  </div>\r\n</section>\r\n", styles: [".auth {\r\n  min-height: 100dvh;\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n  padding: 2.5rem 1rem 3rem;\r\n  background:\r\n    linear-gradient(180deg, rgba(10, 12, 20, 0.45) 0%, rgba(10, 12, 20, 0.75) 100%),\r\n    var(--auth-bg-image, none) center / cover no-repeat,\r\n    radial-gradient(circle at 20% 10%, rgba(216, 71, 30, 0.3), transparent 45%),\r\n    radial-gradient(circle at 85% 85%, rgba(14, 70, 161, 0.35), transparent 45%),\r\n    var(--color-dark);\r\n}\r\n\r\n.auth__card {\r\n  width: 100%;\r\n  max-width: 440px;\r\n  background: var(--color-surface);\r\n  border: 1px solid var(--color-border);\r\n  border-radius: var(--radius-lg);\r\n  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);\r\n  padding: 2.25rem 2rem;\r\n  text-align: center;\r\n  display: flex;\r\n  flex-direction: column;\r\n  align-items: center;\r\n  gap: 1rem;\r\n}\r\n\r\n.auth__brand {\r\n  display: block;\r\n  text-decoration: none;\r\n  font-size: 1.3rem;\r\n  font-weight: 700;\r\n  letter-spacing: -0.01em;\r\n  color: var(--color-text);\r\n}\r\n\r\n.auth__brand img {\r\n  display: block;\r\n  height: 44px;\r\n  width: auto;\r\n  margin: 0 auto;\r\n}\r\n\r\n.auth__title {\r\n  margin: 0;\r\n  font-size: 1.4rem;\r\n  font-weight: 800;\r\n  color: var(--color-text);\r\n}\r\n\r\n.auth__subtitle {\r\n  margin: 0;\r\n  color: var(--color-text-muted);\r\n  font-size: 0.95rem;\r\n}\r\n\r\n.auth__subtitle--error {\r\n  color: var(--color-danger);\r\n}\r\n\r\n.btn {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 0.75rem 1.25rem;\r\n  border-radius: var(--radius-pill);\r\n  border: none;\r\n  font-weight: 700;\r\n  cursor: pointer;\r\n  font-size: 0.95rem;\r\n  text-decoration: none;\r\n}\r\n\r\n.btn--primary {\r\n  background: var(--color-accent);\r\n  color: #1a1200;\r\n  box-shadow: 0 8px 20px color-mix(in srgb, var(--color-accent) 45%, transparent);\r\n}\r\n\r\n.btn--primary:hover {\r\n  background: color-mix(in srgb, var(--color-accent) 88%, black);\r\n}\r\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(VerificarCuentaComponent, { className: "VerificarCuentaComponent", filePath: "src/app/features/auth/verificar-cuenta/verificar-cuenta.component.ts", lineNumber: 33 }); })();
