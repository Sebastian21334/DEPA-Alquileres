import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
function RecuperarContraseniaComponent_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6)(1, "p");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "a", 7);
    i0.ɵɵtext(4, "Volver a iniciar sesi\u00F3n");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.mensajeExito());
} }
function RecuperarContraseniaComponent_Conditional_9_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 9);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.error());
} }
function RecuperarContraseniaComponent_Conditional_9_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 13);
    i0.ɵɵtext(1, "Ingres\u00E1 un email v\u00E1lido.");
    i0.ɵɵelementEnd();
} }
function RecuperarContraseniaComponent_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 8);
    i0.ɵɵlistener("ngSubmit", function RecuperarContraseniaComponent_Conditional_9_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.onSubmit()); });
    i0.ɵɵconditionalCreate(1, RecuperarContraseniaComponent_Conditional_9_Conditional_1_Template, 2, 1, "div", 9);
    i0.ɵɵelementStart(2, "div", 10)(3, "label", 11);
    i0.ɵɵtext(4, "Email");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(5, "input", 12);
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(6, RecuperarContraseniaComponent_Conditional_9_Conditional_6_Template, 2, 0, "span", 13);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "button", 14);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "p", 15)(10, "a", 16);
    i0.ɵɵtext(11, "Volver a iniciar sesi\u00F3n");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("formGroup", ctx_r0.form);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.error() ? 1 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.form.controls.email.invalid && ctx_r0.form.controls.email.touched ? 6 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r0.enviando());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.enviando() ? "Enviando\u2026" : "Enviar link de recuperaci\u00F3n", " ");
} }
// CU62 "Recuperar acceso" — primer paso: pedir el link de
// restablecimiento (back/src/auth/service/auth.service.ts#solicitarRecuperacion).
// El backend responde siempre el mismo mensaje neutro exista o no la cuenta
// (RN anti-enumeración de emails), así que acá no hay estado de "error de
// negocio": ante cualquier envío válido se muestra el mismo aviso.
export class RecuperarContraseniaComponent {
    fb = inject(FormBuilder);
    authService = inject(AuthService);
    enviando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enviando" }] : /* istanbul ignore next */ []));
    error = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    mensajeExito = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mensajeExito" }] : /* istanbul ignore next */ []));
    form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
    });
    onSubmit() {
        if (this.form.invalid || this.enviando()) {
            this.form.markAllAsTouched();
            return;
        }
        this.enviando.set(true);
        this.error.set(null);
        const email = this.form.getRawValue().email.trim().toLowerCase();
        this.authService.solicitarRecuperacion(email).subscribe({
            next: (res) => {
                this.enviando.set(false);
                this.mensajeExito.set(res.mensaje);
            },
            error: (err) => {
                this.enviando.set(false);
                this.error.set(err.message);
            },
        });
    }
    static ɵfac = function RecuperarContraseniaComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || RecuperarContraseniaComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: RecuperarContraseniaComponent, selectors: [["app-recuperar-contrasenia"]], decls: 10, vars: 1, consts: [[1, "auth"], [1, "auth__card"], ["routerLink", "/", "aria-label", "Ir al inicio", 1, "auth__brand"], ["src", "/images/Logo.png", "alt", "DEPA"], [1, "auth__title"], [1, "auth__subtitle"], ["role", "status", 1, "auth__success"], ["routerLink", "/login", 1, "btn", "btn--primary"], ["novalidate", "", 1, "auth__form", 3, "ngSubmit", "formGroup"], ["role", "alert", 1, "auth__error"], [1, "auth__field"], ["for", "email"], ["id", "email", "type", "email", "formControlName", "email", "autocomplete", "email"], [1, "auth__hint", "auth__hint--error"], ["type", "submit", 1, "btn", "btn--primary", 3, "disabled"], [1, "auth__switch"], ["routerLink", "/login"]], template: function RecuperarContraseniaComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "div", 1)(2, "a", 2);
            i0.ɵɵelement(3, "img", 3);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "h1", 4);
            i0.ɵɵtext(5, "Recuperar acceso");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "p", 5);
            i0.ɵɵtext(7, "Ingres\u00E1 tu email para solicitar un enlace de recuperaci\u00F3n. El enlace vence en 2 horas.");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(8, RecuperarContraseniaComponent_Conditional_8_Template, 5, 1, "div", 6)(9, RecuperarContraseniaComponent_Conditional_9_Template, 12, 5);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(8);
            i0.ɵɵconditional(ctx.mensajeExito() ? 8 : 9);
        } }, dependencies: [ReactiveFormsModule, i1.ɵNgNoValidate, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.FormGroupDirective, i1.FormControlName, RouterLink], styles: [".auth[_ngcontent-%COMP%] {\r\n  min-height: calc(100dvh - 4rem);\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n  padding: 2.5rem 1rem 3rem;\r\n  background:\r\n    linear-gradient(180deg, rgba(10, 12, 20, 0.45) 0%, rgba(10, 12, 20, 0.75) 100%),\r\n    var(--%NS%auth-bg-image, none) center / cover no-repeat,\r\n    radial-gradient(circle at 20% 10%, rgba(216, 71, 30, 0.3), transparent 45%),\r\n    radial-gradient(circle at 85% 85%, rgba(14, 70, 161, 0.35), transparent 45%),\r\n    var(--%NS%color-dark);\r\n}\r\n\r\n.auth__card[_ngcontent-%COMP%] {\r\n  width: 100%;\r\n  max-width: 420px;\r\n  background: var(--%NS%color-surface);\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: var(--%NS%radius-lg);\r\n  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);\r\n  padding: 2.25rem 2rem;\r\n}\r\n\r\n.auth__brand[_ngcontent-%COMP%] {\r\n  display: block;\r\n  text-decoration: none;\r\n  text-align: center;\r\n  font-size: 1.3rem;\r\n  font-weight: 700;\r\n  letter-spacing: -0.01em;\r\n  color: var(--%NS%color-text);\r\n  margin-bottom: 1.25rem;\r\n}\r\n\r\n.auth__brand[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\r\n  display: block;\r\n  height: 44px;\r\n  width: auto;\r\n  margin: 0 auto;\r\n}\r\n\r\n.auth__title[_ngcontent-%COMP%] {\r\n  margin: 0 0 0.25rem;\r\n  font-size: 1.5rem;\r\n  font-weight: 800;\r\n  color: var(--%NS%color-text);\r\n  text-align: center;\r\n}\r\n\r\n.auth__subtitle[_ngcontent-%COMP%] {\r\n  margin: 0 0 1.75rem;\r\n  color: var(--%NS%color-text-muted);\r\n  font-size: 0.9rem;\r\n  text-align: center;\r\n}\r\n\r\n.auth__form[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 1.1rem;\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 0.4rem;\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\r\n  font-size: 0.85rem;\r\n  font-weight: 600;\r\n  color: var(--%NS%color-text);\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\r\n  padding: 0.7rem 0.9rem;\r\n  border-radius: var(--%NS%radius-sm);\r\n  border: 1px solid var(--%NS%color-border);\r\n  font-size: 0.95rem;\r\n  color: var(--%NS%color-text);\r\n  background: #fff;\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]::placeholder {\r\n  color: #98a2b3;\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus {\r\n  outline: none;\r\n  border-color: var(--%NS%color-primary);\r\n  box-shadow: 0 0 0 3px color-mix(in srgb, var(--%NS%color-primary) 25%, transparent);\r\n}\r\n\r\n.auth__hint[_ngcontent-%COMP%] {\r\n  font-size: 0.78rem;\r\n  color: var(--%NS%color-text-muted);\r\n}\r\n\r\n.auth__hint--error[_ngcontent-%COMP%] {\r\n  color: var(--%NS%color-danger);\r\n}\r\n\r\n.auth__error[_ngcontent-%COMP%] {\r\n  background: #fef2f2;\r\n  border: 1px solid var(--%NS%color-danger);\r\n  color: #b91c1c;\r\n  padding: 0.6rem 0.75rem;\r\n  border-radius: var(--%NS%radius-sm);\r\n  font-size: 0.85rem;\r\n}\r\n\r\n.auth__success[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 0.75rem;\r\n  text-align: center;\r\n  color: var(--%NS%color-text);\r\n}\r\n\r\n.auth__success[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\r\n  margin: 0;\r\n  color: var(--%NS%color-text-muted);\r\n}\r\n\r\n.auth__switch[_ngcontent-%COMP%] {\r\n  margin: 1.5rem 0 0;\r\n  text-align: center;\r\n  font-size: 0.88rem;\r\n  color: var(--%NS%color-text-muted);\r\n}\r\n\r\n.auth__switch[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] {\r\n  color: var(--%NS%color-accent);\r\n  font-weight: 600;\r\n  text-decoration: none;\r\n}\r\n\r\n.auth__switch[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover {\r\n  text-decoration: underline;\r\n}\r\n\r\n.btn[_ngcontent-%COMP%] {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 0.75rem 1.25rem;\r\n  border-radius: var(--%NS%radius-pill);\r\n  border: none;\r\n  font-weight: 700;\r\n  cursor: pointer;\r\n  font-size: 0.95rem;\r\n}\r\n\r\n.btn--primary[_ngcontent-%COMP%] {\r\n  background: var(--%NS%color-accent);\r\n  color: #1a1200;\r\n  box-shadow: 0 8px 20px color-mix(in srgb, var(--%NS%color-accent) 45%, transparent);\r\n}\r\n\r\n.btn--%NS%primary[_ngcontent-%COMP%]:hover {\r\n  background: color-mix(in srgb, var(--%NS%color-accent) 88%, black);\r\n}\r\n\r\n.btn[_ngcontent-%COMP%]:disabled {\r\n  opacity: 0.6;\r\n  cursor: not-allowed;\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(RecuperarContraseniaComponent, [{
        type: Component,
        args: [{ selector: 'app-recuperar-contrasenia', standalone: true, imports: [ReactiveFormsModule, RouterLink], template: "<section class=\"auth\">\r\n  <div class=\"auth__card\">\r\n    <a routerLink=\"/\" class=\"auth__brand\" aria-label=\"Ir al inicio\"><img src=\"/images/Logo.png\" alt=\"DEPA\" /></a>\r\n    <h1 class=\"auth__title\">Recuperar acceso</h1>\r\n    <p class=\"auth__subtitle\">Ingres\u00E1 tu email para solicitar un enlace de recuperaci\u00F3n. El enlace vence en 2 horas.</p>\r\n\r\n    @if (mensajeExito()) {\r\n      <div class=\"auth__success\" role=\"status\">\r\n        <p>{{ mensajeExito() }}</p>\r\n        <a routerLink=\"/login\" class=\"btn btn--primary\">Volver a iniciar sesi\u00F3n</a>\r\n      </div>\r\n    } @else {\r\n      <form class=\"auth__form\" [formGroup]=\"form\" (ngSubmit)=\"onSubmit()\" novalidate>\r\n        @if (error()) {\r\n          <div class=\"auth__error\" role=\"alert\">{{ error() }}</div>\r\n        }\r\n\r\n        <div class=\"auth__field\">\r\n          <label for=\"email\">Email</label>\r\n          <input id=\"email\" type=\"email\" formControlName=\"email\" autocomplete=\"email\" />\r\n          @if (form.controls.email.invalid && form.controls.email.touched) {\r\n            <span class=\"auth__hint auth__hint--error\">Ingres\u00E1 un email v\u00E1lido.</span>\r\n          }\r\n        </div>\r\n\r\n        <button type=\"submit\" class=\"btn btn--primary\" [disabled]=\"enviando()\">\r\n          {{ enviando() ? 'Enviando\u2026' : 'Enviar link de recuperaci\u00F3n' }}\r\n        </button>\r\n      </form>\r\n\r\n      <p class=\"auth__switch\"><a routerLink=\"/login\">Volver a iniciar sesi\u00F3n</a></p>\r\n    }\r\n  </div>\r\n</section>\r\n", styles: [".auth {\r\n  min-height: calc(100dvh - 4rem);\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n  padding: 2.5rem 1rem 3rem;\r\n  background:\r\n    linear-gradient(180deg, rgba(10, 12, 20, 0.45) 0%, rgba(10, 12, 20, 0.75) 100%),\r\n    var(--auth-bg-image, none) center / cover no-repeat,\r\n    radial-gradient(circle at 20% 10%, rgba(216, 71, 30, 0.3), transparent 45%),\r\n    radial-gradient(circle at 85% 85%, rgba(14, 70, 161, 0.35), transparent 45%),\r\n    var(--color-dark);\r\n}\r\n\r\n.auth__card {\r\n  width: 100%;\r\n  max-width: 420px;\r\n  background: var(--color-surface);\r\n  border: 1px solid var(--color-border);\r\n  border-radius: var(--radius-lg);\r\n  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);\r\n  padding: 2.25rem 2rem;\r\n}\r\n\r\n.auth__brand {\r\n  display: block;\r\n  text-decoration: none;\r\n  text-align: center;\r\n  font-size: 1.3rem;\r\n  font-weight: 700;\r\n  letter-spacing: -0.01em;\r\n  color: var(--color-text);\r\n  margin-bottom: 1.25rem;\r\n}\r\n\r\n.auth__brand img {\r\n  display: block;\r\n  height: 44px;\r\n  width: auto;\r\n  margin: 0 auto;\r\n}\r\n\r\n.auth__title {\r\n  margin: 0 0 0.25rem;\r\n  font-size: 1.5rem;\r\n  font-weight: 800;\r\n  color: var(--color-text);\r\n  text-align: center;\r\n}\r\n\r\n.auth__subtitle {\r\n  margin: 0 0 1.75rem;\r\n  color: var(--color-text-muted);\r\n  font-size: 0.9rem;\r\n  text-align: center;\r\n}\r\n\r\n.auth__form {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 1.1rem;\r\n}\r\n\r\n.auth__field {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 0.4rem;\r\n}\r\n\r\n.auth__field label {\r\n  font-size: 0.85rem;\r\n  font-weight: 600;\r\n  color: var(--color-text);\r\n}\r\n\r\n.auth__field input {\r\n  padding: 0.7rem 0.9rem;\r\n  border-radius: var(--radius-sm);\r\n  border: 1px solid var(--color-border);\r\n  font-size: 0.95rem;\r\n  color: var(--color-text);\r\n  background: #fff;\r\n}\r\n\r\n.auth__field input::placeholder {\r\n  color: #98a2b3;\r\n}\r\n\r\n.auth__field input:focus {\r\n  outline: none;\r\n  border-color: var(--color-primary);\r\n  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 25%, transparent);\r\n}\r\n\r\n.auth__hint {\r\n  font-size: 0.78rem;\r\n  color: var(--color-text-muted);\r\n}\r\n\r\n.auth__hint--error {\r\n  color: var(--color-danger);\r\n}\r\n\r\n.auth__error {\r\n  background: #fef2f2;\r\n  border: 1px solid var(--color-danger);\r\n  color: #b91c1c;\r\n  padding: 0.6rem 0.75rem;\r\n  border-radius: var(--radius-sm);\r\n  font-size: 0.85rem;\r\n}\r\n\r\n.auth__success {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 0.75rem;\r\n  text-align: center;\r\n  color: var(--color-text);\r\n}\r\n\r\n.auth__success p {\r\n  margin: 0;\r\n  color: var(--color-text-muted);\r\n}\r\n\r\n.auth__switch {\r\n  margin: 1.5rem 0 0;\r\n  text-align: center;\r\n  font-size: 0.88rem;\r\n  color: var(--color-text-muted);\r\n}\r\n\r\n.auth__switch a {\r\n  color: var(--color-accent);\r\n  font-weight: 600;\r\n  text-decoration: none;\r\n}\r\n\r\n.auth__switch a:hover {\r\n  text-decoration: underline;\r\n}\r\n\r\n.btn {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 0.75rem 1.25rem;\r\n  border-radius: var(--radius-pill);\r\n  border: none;\r\n  font-weight: 700;\r\n  cursor: pointer;\r\n  font-size: 0.95rem;\r\n}\r\n\r\n.btn--primary {\r\n  background: var(--color-accent);\r\n  color: #1a1200;\r\n  box-shadow: 0 8px 20px color-mix(in srgb, var(--color-accent) 45%, transparent);\r\n}\r\n\r\n.btn--primary:hover {\r\n  background: color-mix(in srgb, var(--color-accent) 88%, black);\r\n}\r\n\r\n.btn:disabled {\r\n  opacity: 0.6;\r\n  cursor: not-allowed;\r\n}\r\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(RecuperarContraseniaComponent, { className: "RecuperarContraseniaComponent", filePath: "src/app/features/auth/recuperar-contrasenia/recuperar-contrasenia.component.ts", lineNumber: 18 }); })();
