import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { contraseniasIgualesValidator, MENSAJE_CONTRASENIA_SEGURA, passwordSeguraValidator } from '../../../shared/validators/password.validators';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
function RestablecerContraseniaComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 5);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "a", 6);
    i0.ɵɵtext(3, "Ir a iniciar sesi\u00F3n");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.mensajeExito());
} }
function RestablecerContraseniaComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 7);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "a", 8);
    i0.ɵɵtext(3, "Pedir un nuevo link");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.error());
} }
function RestablecerContraseniaComponent_Conditional_8_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 10);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.error());
} }
function RestablecerContraseniaComponent_Conditional_8_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 14);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.politicaContrasenia, " ");
} }
function RestablecerContraseniaComponent_Conditional_8_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 15);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.politicaContrasenia);
} }
function RestablecerContraseniaComponent_Conditional_8_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 14);
    i0.ɵɵtext(1, "Las contrase\u00F1as no coinciden.");
    i0.ɵɵelementEnd();
} }
function RestablecerContraseniaComponent_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p", 5);
    i0.ɵɵtext(1, "Eleg\u00ED tu nueva contrase\u00F1a.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "form", 9);
    i0.ɵɵlistener("ngSubmit", function RestablecerContraseniaComponent_Conditional_8_Template_form_ngSubmit_2_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.onSubmit()); });
    i0.ɵɵconditionalCreate(3, RestablecerContraseniaComponent_Conditional_8_Conditional_3_Template, 2, 1, "div", 10);
    i0.ɵɵelementStart(4, "div", 11)(5, "label", 12);
    i0.ɵɵtext(6, "Nueva contrase\u00F1a");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(7, "input", 13);
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(8, RestablecerContraseniaComponent_Conditional_8_Conditional_8_Template, 2, 1, "span", 14)(9, RestablecerContraseniaComponent_Conditional_8_Conditional_9_Template, 2, 1, "span", 15);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "div", 11)(11, "label", 16);
    i0.ɵɵtext(12, "Confirmar contrase\u00F1a");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(13, "input", 17);
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(14, RestablecerContraseniaComponent_Conditional_8_Conditional_14_Template, 2, 0, "span", 14);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "button", 18);
    i0.ɵɵtext(16);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("formGroup", ctx_r0.form);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.error() ? 3 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.form.controls.contrasenia.touched && ctx_r0.form.controls.contrasenia.errors ? 8 : 9);
    i0.ɵɵadvance(5);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.form.errors?.["contraseniasDistintas"] && ctx_r0.form.controls.confirmarContrasenia.touched ? 14 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r0.enviando());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.enviando() ? "Guardando\u2026" : "Restablecer contrase\u00F1a", " ");
} }
// Segundo paso de CU62 "Recuperar acceso": consume el link
// que llega por mail (back/src/mail/mail.service.ts#enviarRecuperacion, que
// arma "${frontendUrl}/restablecer-contrasena?token=...") y fija la nueva
// contraseña. OJO: la ruta del link usa "restablecer-contrasena" (sin la
// "i" de "contrasenia") — así la armó el backend, y hay que respetarla tal
// cual en app.routes.ts o el link del mail rompería.
//
// A diferencia de verificar-cuenta.component.ts, acá el POST se dispara
// recién en onSubmit() (clic del usuario), nunca en ngOnInit, así que no
// aplica la misma trampa de SSR/hidratación (ver memoria de proyecto
// "frontend-ssr-post-en-ngoninit"): leer el token de la URL en ngOnInit es
// una simple lectura sin efectos secundarios.
export class RestablecerContraseniaComponent {
    politicaContrasenia = MENSAJE_CONTRASENIA_SEGURA;
    route = inject(ActivatedRoute);
    fb = inject(FormBuilder);
    authService = inject(AuthService);
    enviando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enviando" }] : /* istanbul ignore next */ []));
    error = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    mensajeExito = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mensajeExito" }] : /* istanbul ignore next */ []));
    tokenValido = signal(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tokenValido" }] : /* istanbul ignore next */ []));
    token = null;
    form = this.fb.nonNullable.group({
        contrasenia: ['', [Validators.required, passwordSeguraValidator()]],
        confirmarContrasenia: ['', [Validators.required]],
    }, { validators: contraseniasIgualesValidator() });
    ngOnInit() {
        this.token = this.route.snapshot.queryParamMap.get('token');
        if (!this.token) {
            this.tokenValido.set(false);
            this.error.set('El link de recuperación no es válido: falta el token.');
        }
    }
    onSubmit() {
        if (!this.token || this.form.invalid || this.enviando()) {
            this.form.markAllAsTouched();
            return;
        }
        this.enviando.set(true);
        this.error.set(null);
        const { contrasenia, confirmarContrasenia } = this.form.getRawValue();
        this.authService.restablecerContrasenia(this.token, contrasenia, confirmarContrasenia).subscribe({
            next: (res) => {
                this.enviando.set(false);
                this.mensajeExito.set(res.mensaje);
                this.form.reset();
                this.token = null;
            },
            error: (err) => {
                this.enviando.set(false);
                this.error.set(err.message);
                if (err.message.includes('Token inválido o expirado'))
                    this.tokenValido.set(false);
            },
        });
    }
    static ɵfac = function RestablecerContraseniaComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || RestablecerContraseniaComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: RestablecerContraseniaComponent, selectors: [["app-restablecer-contrasenia"]], decls: 9, vars: 1, consts: [[1, "auth"], [1, "auth__card"], ["routerLink", "/", "aria-label", "Ir al inicio", 1, "auth__brand"], ["src", "/images/Logo.png", "alt", "DEPA"], [1, "auth__title"], [1, "auth__subtitle"], ["routerLink", "/login", 1, "btn", "btn--primary"], [1, "auth__subtitle", "auth__subtitle--error"], ["routerLink", "/recuperar-contrasenia", 1, "btn", "btn--primary"], ["novalidate", "", 1, "auth__form", 3, "ngSubmit", "formGroup"], ["role", "alert", 1, "auth__error"], [1, "auth__field"], ["for", "contrasenia"], ["id", "contrasenia", "type", "password", "formControlName", "contrasenia", "autocomplete", "new-password"], [1, "auth__hint", "auth__hint--error"], [1, "auth__hint"], ["for", "confirmarContrasenia"], ["id", "confirmarContrasenia", "type", "password", "formControlName", "confirmarContrasenia", "autocomplete", "new-password"], ["type", "submit", 1, "btn", "btn--primary", 3, "disabled"]], template: function RestablecerContraseniaComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "div", 1)(2, "a", 2);
            i0.ɵɵelement(3, "img", 3);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "h1", 4);
            i0.ɵɵtext(5, "Restablecer contrase\u00F1a");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(6, RestablecerContraseniaComponent_Conditional_6_Template, 4, 1)(7, RestablecerContraseniaComponent_Conditional_7_Template, 4, 1)(8, RestablecerContraseniaComponent_Conditional_8_Template, 17, 6);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(6);
            i0.ɵɵconditional(ctx.mensajeExito() ? 6 : !ctx.tokenValido() ? 7 : 8);
        } }, dependencies: [ReactiveFormsModule, i1.ɵNgNoValidate, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.FormGroupDirective, i1.FormControlName, RouterLink], styles: [".auth[_ngcontent-%COMP%] {\r\n  min-height: calc(100dvh - 4rem);\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n  padding: 2.5rem 1rem 3rem;\r\n  background:\r\n    linear-gradient(180deg, rgba(10, 12, 20, 0.45) 0%, rgba(10, 12, 20, 0.75) 100%),\r\n    var(--%NS%auth-bg-image, none) center / cover no-repeat,\r\n    radial-gradient(circle at 20% 10%, rgba(216, 71, 30, 0.3), transparent 45%),\r\n    radial-gradient(circle at 85% 85%, rgba(14, 70, 161, 0.35), transparent 45%),\r\n    var(--%NS%color-dark);\r\n}\r\n\r\n.auth--pantalla-completa[_ngcontent-%COMP%] {\r\n  min-height: 100dvh;\r\n  box-sizing: border-box;\r\n  padding: 1rem;\r\n}\r\n\r\n.auth__card[_ngcontent-%COMP%] {\r\n  width: 100%;\r\n  max-width: 420px;\r\n  background: var(--%NS%color-surface);\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: var(--%NS%radius-lg);\r\n  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);\r\n  padding: 2.25rem 2rem;\r\n}\r\n\r\n.auth__brand[_ngcontent-%COMP%] {\r\n  display: block;\r\n  text-decoration: none;\r\n  text-align: center;\r\n  font-size: 1.3rem;\r\n  font-weight: 700;\r\n  letter-spacing: -0.01em;\r\n  color: var(--%NS%color-text);\r\n  margin-bottom: 1.25rem;\r\n}\r\n\r\n.auth__brand[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\r\n  display: block;\r\n  height: 44px;\r\n  width: auto;\r\n  margin: 0 auto;\r\n}\r\n\r\n.auth__title[_ngcontent-%COMP%] {\r\n  margin: 0 0 0.25rem;\r\n  font-size: 1.5rem;\r\n  font-weight: 800;\r\n  color: var(--%NS%color-text);\r\n  text-align: center;\r\n}\r\n\r\n.auth__subtitle[_ngcontent-%COMP%] {\r\n  margin: 0 0 1.75rem;\r\n  color: var(--%NS%color-text-muted);\r\n  font-size: 0.9rem;\r\n  text-align: center;\r\n}\r\n\r\n.auth__subtitle--error[_ngcontent-%COMP%] {\r\n  color: var(--%NS%color-danger);\r\n}\r\n\r\n.auth__form[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 1.1rem;\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 0.4rem;\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\r\n  font-size: 0.85rem;\r\n  font-weight: 600;\r\n  color: var(--%NS%color-text);\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\r\n  padding: 0.7rem 0.9rem;\r\n  border-radius: var(--%NS%radius-sm);\r\n  border: 1px solid var(--%NS%color-border);\r\n  font-size: 0.95rem;\r\n  color: var(--%NS%color-text);\r\n  background: #fff;\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]::placeholder {\r\n  color: #98a2b3;\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus {\r\n  outline: none;\r\n  border-color: var(--%NS%color-primary);\r\n  box-shadow: 0 0 0 3px color-mix(in srgb, var(--%NS%color-primary) 25%, transparent);\r\n}\r\n\r\n.auth__hint[_ngcontent-%COMP%] {\r\n  font-size: 0.78rem;\r\n  color: var(--%NS%color-text-muted);\r\n}\r\n\r\n.auth__hint--error[_ngcontent-%COMP%] {\r\n  color: var(--%NS%color-danger);\r\n}\r\n\r\n.auth__error[_ngcontent-%COMP%] {\r\n  background: #fef2f2;\r\n  border: 1px solid var(--%NS%color-danger);\r\n  color: #b91c1c;\r\n  padding: 0.6rem 0.75rem;\r\n  border-radius: var(--%NS%radius-sm);\r\n  font-size: 0.85rem;\r\n}\r\n\r\n.btn[_ngcontent-%COMP%] {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 0.75rem 1.25rem;\r\n  border-radius: var(--%NS%radius-pill);\r\n  border: none;\r\n  font-weight: 700;\r\n  cursor: pointer;\r\n  font-size: 0.95rem;\r\n  text-decoration: none;\r\n}\r\n\r\n.btn--primary[_ngcontent-%COMP%] {\r\n  background: var(--%NS%color-accent);\r\n  color: #1a1200;\r\n  box-shadow: 0 8px 20px color-mix(in srgb, var(--%NS%color-accent) 45%, transparent);\r\n}\r\n\r\n.btn--%NS%primary[_ngcontent-%COMP%]:hover {\r\n  background: color-mix(in srgb, var(--%NS%color-accent) 88%, black);\r\n}\r\n\r\n.btn[_ngcontent-%COMP%]:disabled {\r\n  opacity: 0.6;\r\n  cursor: not-allowed;\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(RestablecerContraseniaComponent, [{
        type: Component,
        args: [{ selector: 'app-restablecer-contrasenia', standalone: true, imports: [ReactiveFormsModule, RouterLink], template: "<section class=\"auth\">\r\n  <div class=\"auth__card\">\r\n    <a routerLink=\"/\" class=\"auth__brand\" aria-label=\"Ir al inicio\"><img src=\"/images/Logo.png\" alt=\"DEPA\" /></a>\r\n    <h1 class=\"auth__title\">Restablecer contrase\u00F1a</h1>\r\n\r\n    @if (mensajeExito()) {\r\n      <p class=\"auth__subtitle\">{{ mensajeExito() }}</p>\r\n      <a routerLink=\"/login\" class=\"btn btn--primary\">Ir a iniciar sesi\u00F3n</a>\r\n    } @else if (!tokenValido()) {\r\n      <p class=\"auth__subtitle auth__subtitle--error\">{{ error() }}</p>\r\n      <a routerLink=\"/recuperar-contrasenia\" class=\"btn btn--primary\">Pedir un nuevo link</a>\r\n    } @else {\r\n      <p class=\"auth__subtitle\">Eleg\u00ED tu nueva contrase\u00F1a.</p>\r\n\r\n      <form class=\"auth__form\" [formGroup]=\"form\" (ngSubmit)=\"onSubmit()\" novalidate>\r\n        @if (error()) {\r\n          <div class=\"auth__error\" role=\"alert\">{{ error() }}</div>\r\n        }\r\n\r\n        <div class=\"auth__field\">\r\n          <label for=\"contrasenia\">Nueva contrase\u00F1a</label>\r\n          <input id=\"contrasenia\" type=\"password\" formControlName=\"contrasenia\" autocomplete=\"new-password\" />\r\n          @if (form.controls.contrasenia.touched && form.controls.contrasenia.errors) {\r\n            <span class=\"auth__hint auth__hint--error\">\r\n              {{ politicaContrasenia }}\r\n            </span>\r\n          } @else {\r\n            <span class=\"auth__hint\">{{ politicaContrasenia }}</span>\r\n          }\r\n        </div>\r\n\r\n        <div class=\"auth__field\">\r\n          <label for=\"confirmarContrasenia\">Confirmar contrase\u00F1a</label>\r\n          <input\r\n            id=\"confirmarContrasenia\"\r\n            type=\"password\"\r\n            formControlName=\"confirmarContrasenia\"\r\n            autocomplete=\"new-password\"\r\n          />\r\n          @if (form.errors?.['contraseniasDistintas'] && form.controls.confirmarContrasenia.touched) {\r\n            <span class=\"auth__hint auth__hint--error\">Las contrase\u00F1as no coinciden.</span>\r\n          }\r\n        </div>\r\n\r\n        <button type=\"submit\" class=\"btn btn--primary\" [disabled]=\"enviando()\">\r\n          {{ enviando() ? 'Guardando\u2026' : 'Restablecer contrase\u00F1a' }}\r\n        </button>\r\n      </form>\r\n    }\r\n  </div>\r\n</section>\r\n", styles: [".auth {\r\n  min-height: calc(100dvh - 4rem);\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n  padding: 2.5rem 1rem 3rem;\r\n  background:\r\n    linear-gradient(180deg, rgba(10, 12, 20, 0.45) 0%, rgba(10, 12, 20, 0.75) 100%),\r\n    var(--auth-bg-image, none) center / cover no-repeat,\r\n    radial-gradient(circle at 20% 10%, rgba(216, 71, 30, 0.3), transparent 45%),\r\n    radial-gradient(circle at 85% 85%, rgba(14, 70, 161, 0.35), transparent 45%),\r\n    var(--color-dark);\r\n}\r\n\r\n.auth--pantalla-completa {\r\n  min-height: 100dvh;\r\n  box-sizing: border-box;\r\n  padding: 1rem;\r\n}\r\n\r\n.auth__card {\r\n  width: 100%;\r\n  max-width: 420px;\r\n  background: var(--color-surface);\r\n  border: 1px solid var(--color-border);\r\n  border-radius: var(--radius-lg);\r\n  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);\r\n  padding: 2.25rem 2rem;\r\n}\r\n\r\n.auth__brand {\r\n  display: block;\r\n  text-decoration: none;\r\n  text-align: center;\r\n  font-size: 1.3rem;\r\n  font-weight: 700;\r\n  letter-spacing: -0.01em;\r\n  color: var(--color-text);\r\n  margin-bottom: 1.25rem;\r\n}\r\n\r\n.auth__brand img {\r\n  display: block;\r\n  height: 44px;\r\n  width: auto;\r\n  margin: 0 auto;\r\n}\r\n\r\n.auth__title {\r\n  margin: 0 0 0.25rem;\r\n  font-size: 1.5rem;\r\n  font-weight: 800;\r\n  color: var(--color-text);\r\n  text-align: center;\r\n}\r\n\r\n.auth__subtitle {\r\n  margin: 0 0 1.75rem;\r\n  color: var(--color-text-muted);\r\n  font-size: 0.9rem;\r\n  text-align: center;\r\n}\r\n\r\n.auth__subtitle--error {\r\n  color: var(--color-danger);\r\n}\r\n\r\n.auth__form {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 1.1rem;\r\n}\r\n\r\n.auth__field {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 0.4rem;\r\n}\r\n\r\n.auth__field label {\r\n  font-size: 0.85rem;\r\n  font-weight: 600;\r\n  color: var(--color-text);\r\n}\r\n\r\n.auth__field input {\r\n  padding: 0.7rem 0.9rem;\r\n  border-radius: var(--radius-sm);\r\n  border: 1px solid var(--color-border);\r\n  font-size: 0.95rem;\r\n  color: var(--color-text);\r\n  background: #fff;\r\n}\r\n\r\n.auth__field input::placeholder {\r\n  color: #98a2b3;\r\n}\r\n\r\n.auth__field input:focus {\r\n  outline: none;\r\n  border-color: var(--color-primary);\r\n  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 25%, transparent);\r\n}\r\n\r\n.auth__hint {\r\n  font-size: 0.78rem;\r\n  color: var(--color-text-muted);\r\n}\r\n\r\n.auth__hint--error {\r\n  color: var(--color-danger);\r\n}\r\n\r\n.auth__error {\r\n  background: #fef2f2;\r\n  border: 1px solid var(--color-danger);\r\n  color: #b91c1c;\r\n  padding: 0.6rem 0.75rem;\r\n  border-radius: var(--radius-sm);\r\n  font-size: 0.85rem;\r\n}\r\n\r\n.btn {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 0.75rem 1.25rem;\r\n  border-radius: var(--radius-pill);\r\n  border: none;\r\n  font-weight: 700;\r\n  cursor: pointer;\r\n  font-size: 0.95rem;\r\n  text-decoration: none;\r\n}\r\n\r\n.btn--primary {\r\n  background: var(--color-accent);\r\n  color: #1a1200;\r\n  box-shadow: 0 8px 20px color-mix(in srgb, var(--color-accent) 45%, transparent);\r\n}\r\n\r\n.btn--primary:hover {\r\n  background: color-mix(in srgb, var(--color-accent) 88%, black);\r\n}\r\n\r\n.btn:disabled {\r\n  opacity: 0.6;\r\n  cursor: not-allowed;\r\n}\r\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(RestablecerContraseniaComponent, { className: "RestablecerContraseniaComponent", filePath: "src/app/features/auth/restablecer-contrasenia/restablecer-contrasenia.component.ts", lineNumber: 26 }); })();
