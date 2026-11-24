import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideEye, LucideEyeOff, LucideMail } from '@lucide/angular';
import { AuthService } from '../../../core/services/auth.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
function LoginComponent_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 9);
    i0.ɵɵtext(1, "Tu cuenta est\u00E1 activa. Inici\u00E1 sesi\u00F3n o recuper\u00E1 tu contrase\u00F1a si no la record\u00E1s.");
    i0.ɵɵelementEnd();
} }
function LoginComponent_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 10)(1, "span", 26);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 27);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(3, "div", 28)(4, "strong");
    i0.ɵɵtext(5, "Verific\u00E1 tu email");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p");
    i0.ɵɵtext(7, "Para iniciar sesi\u00F3n, primero verific\u00E1 tu correo.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "button", 29);
    i0.ɵɵlistener("click", function LoginComponent_Conditional_14_Template_button_click_8_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.reenviarVerificacion()); });
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 24);
    i0.ɵɵadvance(6);
    i0.ɵɵproperty("disabled", ctx_r1.reenviandoVerificacion());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.reenviandoVerificacion() ? "Enviando\u2026" : "Reenviar email de verificaci\u00F3n", " ");
} }
function LoginComponent_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 11);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.error());
} }
function LoginComponent_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 9);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.verificacionReenviada());
} }
function LoginComponent_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 15);
    i0.ɵɵtext(1, "Ingres\u00E1 un email v\u00E1lido.");
    i0.ɵɵelementEnd();
} }
function LoginComponent_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(0, "svg", 20);
} if (rf & 2) {
    i0.ɵɵproperty("size", 18);
} }
function LoginComponent_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(0, "svg", 21);
} if (rf & 2) {
    i0.ɵɵproperty("size", 18);
} }
function LoginComponent_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 15);
    i0.ɵɵtext(1, "Ingres\u00E1 tu contrase\u00F1a.");
    i0.ɵɵelementEnd();
} }
const MENSAJE_EMAIL_NO_VERIFICADO = 'Tenés que verificar tu email antes de iniciar sesión';
export class LoginComponent {
    mensajeEmailNoVerificado = MENSAJE_EMAIL_NO_VERIFICADO;
    fb = inject(FormBuilder);
    authService = inject(AuthService);
    router = inject(Router);
    route = inject(ActivatedRoute);
    enviando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enviando" }] : /* istanbul ignore next */ []));
    error = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    puedeReenviarVerificacion = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "puedeReenviarVerificacion" }] : /* istanbul ignore next */ []));
    reenviandoVerificacion = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reenviandoVerificacion" }] : /* istanbul ignore next */ []));
    verificacionReenviada = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "verificacionReenviada" }] : /* istanbul ignore next */ []));
    verContrasenia = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "verContrasenia" }] : /* istanbul ignore next */ []));
    cuentaReactivada = this.route.snapshot.queryParamMap.get('cuentaReactivada') === '1';
    form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        contrasenia: ['', [Validators.required]],
    });
    constructor() {
        if (this.route.snapshot.queryParamMap.get('sesionExpirada') === '1') {
            this.error.set('Tu sesión venció. Ingresá nuevamente para continuar.');
        }
        if (this.route.snapshot.queryParamMap.get('bloqueoTotal') === '1') {
            this.error.set('Finalizó el acceso a tus operaciones pendientes. Ingresá para consultar o apelar el bloqueo.');
        }
    }
    onSubmit() {
        if (this.form.invalid || this.enviando()) {
            this.form.markAllAsTouched();
            return;
        }
        this.enviando.set(true);
        this.error.set(null);
        this.puedeReenviarVerificacion.set(false);
        this.verificacionReenviada.set(null);
        const { email, contrasenia } = this.form.getRawValue();
        this.authService.login({ email: email.trim().toLowerCase(), contrasenia }).subscribe({
            next: () => {
                this.enviando.set(false);
                const destino = this.route.snapshot.queryParamMap.get('returnUrl');
                if (this.authService.currentUser()?.accesoLimitado) {
                    const ruta = destino?.split(/[?#]/)[0];
                    const seguirReserva = ruta === '/mis-reservas' || ruta === '/reserva/resultado';
                    void this.router.navigateByUrl(seguirReserva && destino ? destino : '/mis-reservas');
                    return;
                }
                this.router.navigateByUrl(destino?.startsWith('/') ? destino : '/');
            },
            error: (err) => {
                this.enviando.set(false);
                if (err.codigo === 'USUARIO_BLOQUEADO' && err.tokenBloqueo) {
                    this.authService.logout();
                    this.authService.tokenBloqueo = err.tokenBloqueo;
                    this.form.controls.contrasenia.reset();
                    void this.router.navigate(['/cuenta-bloqueada']);
                    return;
                }
                const sinVerificar = err.codigo === 'EMAIL_NO_VERIFICADO' || err.message === MENSAJE_EMAIL_NO_VERIFICADO;
                this.puedeReenviarVerificacion.set(sinVerificar);
                this.error.set(sinVerificar ? MENSAJE_EMAIL_NO_VERIFICADO : err.message);
            },
        });
    }
    reenviarVerificacion() {
        if (this.reenviandoVerificacion() || this.form.controls.email.invalid || !this.form.controls.contrasenia.value) {
            this.form.controls.email.markAsTouched();
            this.form.controls.contrasenia.markAsTouched();
            return;
        }
        const { email, contrasenia } = this.form.getRawValue();
        this.reenviandoVerificacion.set(true);
        this.authService.reenviarVerificacion({ email: email.trim().toLowerCase(), contrasenia }).subscribe({
            next: ({ mensaje }) => {
                this.reenviandoVerificacion.set(false);
                this.error.set(null);
                this.puedeReenviarVerificacion.set(false);
                this.verificacionReenviada.set(mensaje);
            },
            error: (err) => {
                this.reenviandoVerificacion.set(false);
                this.error.set(err.message);
            },
        });
    }
    static ɵfac = function LoginComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || LoginComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: LoginComponent, selectors: [["app-login"]], decls: 39, vars: 14, consts: [[1, "auth"], ["routerLink", "/", "aria-label", "Volver al inicio", 1, "auth__back"], ["lucideArrowLeft", "", 3, "size"], [1, "auth__card"], ["routerLink", "/", "aria-label", "Ir al inicio", 1, "auth__brand"], ["src", "/images/Logo.png", "alt", "DEPA"], [1, "auth__title"], [1, "auth__subtitle"], ["novalidate", "", 1, "auth__form", 3, "ngSubmit", "formGroup"], ["role", "status", 1, "auth__success"], ["role", "alert", 1, "auth__verification"], ["role", "alert", 1, "auth__error"], [1, "auth__field"], ["for", "email"], ["id", "email", "type", "email", "formControlName", "email", "autocomplete", "email"], [1, "auth__hint", "auth__hint--error"], ["for", "contrasenia"], [1, "password-field"], ["id", "contrasenia", "formControlName", "contrasenia", "autocomplete", "current-password", 3, "type"], ["type", "button", 1, "password-toggle", 3, "click"], ["lucideEyeOff", "", 3, "size"], ["lucideEye", "", 3, "size"], ["routerLink", "/recuperar-contrasenia", 1, "auth__forgot"], ["type", "submit", 1, "btn", "btn--primary", 3, "disabled"], [1, "auth__switch"], ["routerLink", "/registro"], ["aria-hidden", "true", 1, "auth__verification-icon"], ["lucideMail", "", 3, "size"], [1, "auth__verification-content"], ["type", "button", 1, "auth__resend", 3, "click", "disabled"]], template: function LoginComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "a", 1);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(2, "svg", 2);
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(3, "span");
            i0.ɵɵtext(4, "Volver");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(5, "div", 3)(6, "a", 4);
            i0.ɵɵelement(7, "img", 5);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "h1", 6);
            i0.ɵɵtext(9, "Inici\u00E1 sesi\u00F3n");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "p", 7);
            i0.ɵɵtext(11, "Ingres\u00E1 con tu email y contrase\u00F1a.");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(12, "form", 8);
            i0.ɵɵlistener("ngSubmit", function LoginComponent_Template_form_ngSubmit_12_listener() { return ctx.onSubmit(); });
            i0.ɵɵconditionalCreate(13, LoginComponent_Conditional_13_Template, 2, 0, "div", 9);
            i0.ɵɵconditionalCreate(14, LoginComponent_Conditional_14_Template, 10, 3, "div", 10);
            i0.ɵɵconditionalCreate(15, LoginComponent_Conditional_15_Template, 2, 1, "div", 11);
            i0.ɵɵconditionalCreate(16, LoginComponent_Conditional_16_Template, 2, 1, "div", 9);
            i0.ɵɵelementStart(17, "div", 12)(18, "label", 13);
            i0.ɵɵtext(19, "Email");
            i0.ɵɵelementEnd();
            i0.ɵɵelement(20, "input", 14);
            i0.ɵɵcontrolCreate();
            i0.ɵɵconditionalCreate(21, LoginComponent_Conditional_21_Template, 2, 0, "span", 15);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(22, "div", 12)(23, "label", 16);
            i0.ɵɵtext(24, "Contrase\u00F1a");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(25, "div", 17);
            i0.ɵɵelement(26, "input", 18);
            i0.ɵɵcontrolCreate();
            i0.ɵɵelementStart(27, "button", 19);
            i0.ɵɵlistener("click", function LoginComponent_Template_button_click_27_listener() { return ctx.verContrasenia.set(!ctx.verContrasenia()); });
            i0.ɵɵconditionalCreate(28, LoginComponent_Conditional_28_Template, 1, 1, ":svg:svg", 20)(29, LoginComponent_Conditional_29_Template, 1, 1, ":svg:svg", 21);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(30, LoginComponent_Conditional_30_Template, 2, 0, "span", 15);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(31, "a", 22);
            i0.ɵɵtext(32, "\u00BFOlvidaste tu contrase\u00F1a?");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(33, "button", 23);
            i0.ɵɵtext(34);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(35, "p", 24);
            i0.ɵɵtext(36, "\u00BFNo ten\u00E9s cuenta? ");
            i0.ɵɵelementStart(37, "a", 25);
            i0.ɵɵtext(38, "Cre\u00E1 una");
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("size", 20);
            i0.ɵɵadvance(10);
            i0.ɵɵproperty("formGroup", ctx.form);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.cuentaReactivada ? 13 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.puedeReenviarVerificacion() ? 14 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.error() && (!ctx.puedeReenviarVerificacion() || ctx.error() !== ctx.mensajeEmailNoVerificado) ? 15 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.verificacionReenviada() ? 16 : -1);
            i0.ɵɵadvance(4);
            i0.ɵɵcontrol();
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.form.controls.email.invalid && ctx.form.controls.email.touched ? 21 : -1);
            i0.ɵɵadvance(5);
            i0.ɵɵproperty("type", ctx.verContrasenia() ? "text" : "password");
            i0.ɵɵcontrol();
            i0.ɵɵadvance();
            i0.ɵɵattribute("aria-label", ctx.verContrasenia() ? "Ocultar contrase\u00F1a" : "Mostrar contrase\u00F1a")("aria-pressed", ctx.verContrasenia());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.verContrasenia() ? 28 : 29);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.form.controls.contrasenia.invalid && ctx.form.controls.contrasenia.touched ? 30 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("disabled", ctx.enviando());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.enviando() ? "Ingresando\u2026" : "Ingresar", " ");
        } }, dependencies: [ReactiveFormsModule, i1.ɵNgNoValidate, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.FormGroupDirective, i1.FormControlName, RouterLink, LucideArrowLeft, LucideEye, LucideEyeOff, LucideMail], styles: [".auth[_ngcontent-%COMP%] {\r\n  position: relative;\r\n  min-height: 100dvh;\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n  padding: 2.5rem 1rem 3rem;\r\n  background:\r\n    linear-gradient(180deg, rgba(10, 12, 20, 0.45) 0%, rgba(10, 12, 20, 0.75) 100%),\r\n    var(--%NS%auth-bg-image, none) center / cover no-repeat,\r\n    radial-gradient(circle at 20% 10%, rgba(216, 71, 30, 0.3), transparent 45%),\r\n    radial-gradient(circle at 85% 85%, rgba(14, 70, 161, 0.35), transparent 45%),\r\n    var(--%NS%color-dark);\r\n}\r\n\r\n.auth__card[_ngcontent-%COMP%] {\r\n  width: 100%;\r\n  max-width: 400px;\r\n  background: var(--%NS%color-surface);\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: var(--%NS%radius-lg);\r\n  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);\r\n  padding: 2.25rem 2rem;\r\n}\r\n\r\n.auth__brand[_ngcontent-%COMP%] {\r\n  display: block;\r\n  text-decoration: none;\r\n  text-align: center;\r\n  font-size: 1.3rem;\r\n  font-weight: 700;\r\n  letter-spacing: -0.01em;\r\n  color: var(--%NS%color-text);\r\n  margin-bottom: 1.25rem;\r\n}\r\n\r\n.auth__brand[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\r\n  display: block;\r\n  height: 44px;\r\n  width: auto;\r\n  margin: 0 auto;\r\n}\r\n\r\n.auth__title[_ngcontent-%COMP%] {\r\n  margin: 0 0 0.25rem;\r\n  font-size: 1.5rem;\r\n  font-weight: 800;\r\n  color: var(--%NS%color-text);\r\n  text-align: center;\r\n}\r\n\r\n.auth__subtitle[_ngcontent-%COMP%] {\r\n  margin: 0 0 1.75rem;\r\n  color: var(--%NS%color-text-muted);\r\n  font-size: 0.9rem;\r\n  text-align: center;\r\n}\r\n\r\n.auth__form[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 1.1rem;\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%] {\r\n  min-width: 0;\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 0.4rem;\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\r\n  font-size: 0.85rem;\r\n  font-weight: 600;\r\n  color: var(--%NS%color-text);\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\r\n  min-width: 0;\r\n  width: 100%;\r\n  padding: 0.7rem 0.9rem;\r\n  border-radius: var(--%NS%radius-sm);\r\n  border: 1px solid var(--%NS%color-border);\r\n  font-size: 1rem;\r\n  color: var(--%NS%color-text);\r\n  background: #fff;\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]::placeholder {\r\n  color: #98a2b3;\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus {\r\n  outline: none;\r\n  border-color: var(--%NS%color-primary);\r\n  box-shadow: 0 0 0 3px color-mix(in srgb, var(--%NS%color-primary) 25%, transparent);\r\n}\r\n\r\n.auth__hint[_ngcontent-%COMP%] {\r\n  font-size: 0.78rem;\r\n  color: var(--%NS%color-text-muted);\r\n}\r\n\r\n.auth__hint--error[_ngcontent-%COMP%] {\r\n  color: var(--%NS%color-danger);\r\n}\r\n\r\n.auth__forgot[_ngcontent-%COMP%] {\r\n  align-self: flex-end;\r\n  margin-top: -0.5rem;\r\n  font-size: 0.82rem;\r\n  color: var(--%NS%color-accent);\r\n  text-decoration: none;\r\n}\r\n\r\n.auth__forgot[_ngcontent-%COMP%]:hover {\r\n  text-decoration: underline;\r\n}\r\n\r\n.auth__error[_ngcontent-%COMP%] {\r\n  background: #fef2f2;\r\n  border: 1px solid var(--%NS%color-danger);\r\n  color: #b91c1c;\r\n  padding: 0.6rem 0.75rem;\r\n  border-radius: var(--%NS%radius-sm);\r\n  font-size: 0.85rem;\r\n}\r\n\r\n.auth__back[_ngcontent-%COMP%] {\r\n  position: absolute;\r\n  top: 1.25rem;\r\n  left: 1.25rem;\r\n  z-index: 1;\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 0.45rem;\r\n  min-height: 42px;\r\n  padding: 0 1rem;\r\n  border: 1px solid rgba(255, 255, 255, 0.3);\r\n  border-radius: var(--%NS%radius-pill);\r\n  background: rgba(20, 22, 31, 0.72);\r\n  color: #fff;\r\n  font-size: 0.9rem;\r\n  font-weight: 700;\r\n  text-decoration: none;\r\n  backdrop-filter: blur(8px);\r\n  transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;\r\n}\r\n\r\n.auth__back[_ngcontent-%COMP%]:hover {\r\n  background: rgba(20, 22, 31, 0.92);\r\n  border-color: rgba(255, 255, 255, 0.55);\r\n  transform: translateX(-2px);\r\n}\r\n\r\n.auth__back[_ngcontent-%COMP%]:focus-visible {\r\n  outline: 3px solid color-mix(in srgb, var(--%NS%color-accent) 65%, transparent);\r\n  outline-offset: 3px;\r\n}\r\n\r\n.auth__success[_ngcontent-%COMP%] {\r\n  background: #ecfdf3;\r\n  border: 1px solid #86efac;\r\n  color: #166534;\r\n  padding: 0.6rem 0.75rem;\r\n  border-radius: var(--%NS%radius-sm);\r\n  font-size: 0.85rem;\r\n}\r\n\r\n.auth__verification[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  align-items: flex-start;\r\n  gap: 0.75rem;\r\n  padding: 0.8rem;\r\n  border: 1px solid #ffc998;\r\n  border-radius: 0.65rem;\r\n  background: #fff4e9;\r\n}\r\n\r\n.auth__verification-icon[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  flex: 0 0 38px;\r\n  width: 38px;\r\n  height: 38px;\r\n  place-items: center;\r\n  border-radius: 0.55rem;\r\n  color: #ff8900;\r\n  background: #ffe8d2;\r\n}\r\n\r\n.auth__verification-content[_ngcontent-%COMP%] {\r\n  min-width: 0;\r\n}\r\n\r\n.auth__verification-content[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\r\n  display: block;\r\n  color: var(--%NS%color-text);\r\n  font-size: 1rem;\r\n  line-height: 1.25;\r\n}\r\n\r\n.auth__verification-content[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\r\n  margin: 0.25rem 0;\r\n  color: var(--%NS%color-text-muted);\r\n  font-size: 0.85rem;\r\n  line-height: 1.4;\r\n}\r\n\r\n.auth__resend[_ngcontent-%COMP%] {\r\n  display: inline;\r\n  padding: 0;\r\n  border: 0;\r\n  background: transparent;\r\n  color: var(--%NS%color-accent);\r\n  font: inherit;\r\n  font-size: 0.85rem;\r\n  font-weight: 700;\r\n  line-height: 1.4;\r\n  text-align: left;\r\n  cursor: pointer;\r\n}\r\n\r\n.auth__resend[_ngcontent-%COMP%]:hover { text-decoration: underline; }\r\n.auth__resend[_ngcontent-%COMP%]:focus-visible { outline: 2px solid var(--%NS%color-accent); outline-offset: 3px; }\r\n.auth__resend[_ngcontent-%COMP%]:disabled { opacity: 0.6; cursor: not-allowed; }\r\n\r\n.auth__switch[_ngcontent-%COMP%] {\r\n  margin: 1.5rem 0 0;\r\n  text-align: center;\r\n  font-size: 0.88rem;\r\n  color: var(--%NS%color-text-muted);\r\n}\r\n\r\n.auth__switch[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] {\r\n  color: var(--%NS%color-accent);\r\n  font-weight: 600;\r\n  text-decoration: none;\r\n}\r\n\r\n.auth__switch[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover {\r\n  text-decoration: underline;\r\n}\r\n\r\n.btn[_ngcontent-%COMP%] {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 0.75rem 1.25rem;\r\n  border-radius: var(--%NS%radius-pill);\r\n  border: none;\r\n  font-weight: 700;\r\n  cursor: pointer;\r\n  font-size: 1rem;\r\n}\r\n\r\n.btn--primary[_ngcontent-%COMP%] {\r\n  background: var(--%NS%color-accent);\r\n  color: #1a1200;\r\n  box-shadow: 0 8px 20px color-mix(in srgb, var(--%NS%color-accent) 45%, transparent);\r\n}\r\n\r\n.btn--%NS%primary[_ngcontent-%COMP%]:hover {\r\n  background: color-mix(in srgb, var(--%NS%color-accent) 88%, black);\r\n}\r\n\r\n.btn[_ngcontent-%COMP%]:disabled {\r\n  opacity: 0.6;\r\n  cursor: not-allowed;\r\n}\r\n\r\n.password-field[_ngcontent-%COMP%] {\r\n  position: relative;\r\n}\r\n\r\n.password-field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\r\n  width: 100%;\r\n  padding-right: 2.75rem;\r\n}\r\n\r\n.password-toggle[_ngcontent-%COMP%] {\r\n  position: absolute;\r\n  top: 50%;\r\n  right: 0.4rem;\r\n  translate: 0 -50%;\r\n  display: grid;\r\n  place-items: center;\r\n  width: 2rem;\r\n  height: 2rem;\r\n  border: 0;\r\n  border-radius: 50%;\r\n  background: transparent;\r\n  color: var(--%NS%color-text-muted);\r\n  cursor: pointer;\r\n}\r\n\r\n.password-toggle[_ngcontent-%COMP%]:hover {\r\n  color: var(--%NS%color-text);\r\n  background: var(--%NS%color-bg);\r\n}\r\n\r\n@media (max-width: 480px) {\r\n  .auth[_ngcontent-%COMP%] {\r\n    align-items: flex-start;\r\n    padding-top: 5.25rem;\r\n  }\r\n\r\n  .auth__back[_ngcontent-%COMP%] {\r\n    top: 1rem;\r\n    left: 1rem;\r\n  }\r\n\r\n  .auth__card[_ngcontent-%COMP%] {\r\n    padding: 1.75rem 1.25rem;\r\n  }\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(LoginComponent, [{
        type: Component,
        args: [{ selector: 'app-login', standalone: true, imports: [ReactiveFormsModule, RouterLink, LucideArrowLeft, LucideEye, LucideEyeOff, LucideMail], template: "<section class=\"auth\">\r\n  <a routerLink=\"/\" class=\"auth__back\" aria-label=\"Volver al inicio\">\r\n    <svg lucideArrowLeft [size]=\"20\"></svg>\r\n    <span>Volver</span>\r\n  </a>\r\n\r\n  <div class=\"auth__card\">\r\n    <a routerLink=\"/\" class=\"auth__brand\" aria-label=\"Ir al inicio\"><img src=\"/images/Logo.png\" alt=\"DEPA\" /></a>\r\n    <h1 class=\"auth__title\">Inici\u00E1 sesi\u00F3n</h1>\r\n    <p class=\"auth__subtitle\">Ingres\u00E1 con tu email y contrase\u00F1a.</p>\r\n\r\n    <form class=\"auth__form\" [formGroup]=\"form\" (ngSubmit)=\"onSubmit()\" novalidate>\r\n      @if (cuentaReactivada) {\r\n        <div class=\"auth__success\" role=\"status\">Tu cuenta est\u00E1 activa. Inici\u00E1 sesi\u00F3n o recuper\u00E1 tu contrase\u00F1a si no la record\u00E1s.</div>\r\n      }\r\n      @if (puedeReenviarVerificacion()) {\r\n        <div class=\"auth__verification\" role=\"alert\">\r\n          <span class=\"auth__verification-icon\" aria-hidden=\"true\"><svg lucideMail [size]=\"24\"></svg></span>\r\n          <div class=\"auth__verification-content\">\r\n            <strong>Verific\u00E1 tu email</strong>\r\n            <p>Para iniciar sesi\u00F3n, primero verific\u00E1 tu correo.</p>\r\n            <button type=\"button\" class=\"auth__resend\" (click)=\"reenviarVerificacion()\" [disabled]=\"reenviandoVerificacion()\">\r\n              {{ reenviandoVerificacion() ? 'Enviando\u2026' : 'Reenviar email de verificaci\u00F3n' }}\r\n            </button>\r\n          </div>\r\n        </div>\r\n      }\r\n      @if (error() && (!puedeReenviarVerificacion() || error() !== mensajeEmailNoVerificado)) {\r\n        <div class=\"auth__error\" role=\"alert\">{{ error() }}</div>\r\n      }\r\n\r\n      @if (verificacionReenviada()) {\r\n        <div class=\"auth__success\" role=\"status\">{{ verificacionReenviada() }}</div>\r\n      }\r\n\r\n      <div class=\"auth__field\">\r\n        <label for=\"email\">Email</label>\r\n        <input id=\"email\" type=\"email\" formControlName=\"email\" autocomplete=\"email\" />\r\n        @if (form.controls.email.invalid && form.controls.email.touched) {\r\n          <span class=\"auth__hint auth__hint--error\">Ingres\u00E1 un email v\u00E1lido.</span>\r\n        }\r\n      </div>\r\n\r\n      <div class=\"auth__field\">\r\n        <label for=\"contrasenia\">Contrase\u00F1a</label>\r\n        <div class=\"password-field\">\r\n          <input id=\"contrasenia\" [type]=\"verContrasenia() ? 'text' : 'password'\" formControlName=\"contrasenia\" autocomplete=\"current-password\" />\r\n          <button type=\"button\" class=\"password-toggle\" (click)=\"verContrasenia.set(!verContrasenia())\"\r\n            [attr.aria-label]=\"verContrasenia() ? 'Ocultar contrase\u00F1a' : 'Mostrar contrase\u00F1a'\" [attr.aria-pressed]=\"verContrasenia()\">\r\n            @if (verContrasenia()) { <svg lucideEyeOff [size]=\"18\"></svg> } @else { <svg lucideEye [size]=\"18\"></svg> }\r\n          </button>\r\n        </div>\r\n        @if (form.controls.contrasenia.invalid && form.controls.contrasenia.touched) {\r\n          <span class=\"auth__hint auth__hint--error\">Ingres\u00E1 tu contrase\u00F1a.</span>\r\n        }\r\n      </div>\r\n\r\n      <a routerLink=\"/recuperar-contrasenia\" class=\"auth__forgot\">\u00BFOlvidaste tu contrase\u00F1a?</a>\r\n\r\n      <button type=\"submit\" class=\"btn btn--primary\" [disabled]=\"enviando()\">\r\n        {{ enviando() ? 'Ingresando\u2026' : 'Ingresar' }}\r\n      </button>\r\n    </form>\r\n\r\n    <p class=\"auth__switch\">\u00BFNo ten\u00E9s cuenta? <a routerLink=\"/registro\">Cre\u00E1 una</a></p>\r\n  </div>\r\n</section>\r\n", styles: [".auth {\r\n  position: relative;\r\n  min-height: 100dvh;\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n  padding: 2.5rem 1rem 3rem;\r\n  background:\r\n    linear-gradient(180deg, rgba(10, 12, 20, 0.45) 0%, rgba(10, 12, 20, 0.75) 100%),\r\n    var(--auth-bg-image, none) center / cover no-repeat,\r\n    radial-gradient(circle at 20% 10%, rgba(216, 71, 30, 0.3), transparent 45%),\r\n    radial-gradient(circle at 85% 85%, rgba(14, 70, 161, 0.35), transparent 45%),\r\n    var(--color-dark);\r\n}\r\n\r\n.auth__card {\r\n  width: 100%;\r\n  max-width: 400px;\r\n  background: var(--color-surface);\r\n  border: 1px solid var(--color-border);\r\n  border-radius: var(--radius-lg);\r\n  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);\r\n  padding: 2.25rem 2rem;\r\n}\r\n\r\n.auth__brand {\r\n  display: block;\r\n  text-decoration: none;\r\n  text-align: center;\r\n  font-size: 1.3rem;\r\n  font-weight: 700;\r\n  letter-spacing: -0.01em;\r\n  color: var(--color-text);\r\n  margin-bottom: 1.25rem;\r\n}\r\n\r\n.auth__brand img {\r\n  display: block;\r\n  height: 44px;\r\n  width: auto;\r\n  margin: 0 auto;\r\n}\r\n\r\n.auth__title {\r\n  margin: 0 0 0.25rem;\r\n  font-size: 1.5rem;\r\n  font-weight: 800;\r\n  color: var(--color-text);\r\n  text-align: center;\r\n}\r\n\r\n.auth__subtitle {\r\n  margin: 0 0 1.75rem;\r\n  color: var(--color-text-muted);\r\n  font-size: 0.9rem;\r\n  text-align: center;\r\n}\r\n\r\n.auth__form {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 1.1rem;\r\n}\r\n\r\n.auth__field {\r\n  min-width: 0;\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 0.4rem;\r\n}\r\n\r\n.auth__field label {\r\n  font-size: 0.85rem;\r\n  font-weight: 600;\r\n  color: var(--color-text);\r\n}\r\n\r\n.auth__field input {\r\n  min-width: 0;\r\n  width: 100%;\r\n  padding: 0.7rem 0.9rem;\r\n  border-radius: var(--radius-sm);\r\n  border: 1px solid var(--color-border);\r\n  font-size: 1rem;\r\n  color: var(--color-text);\r\n  background: #fff;\r\n}\r\n\r\n.auth__field input::placeholder {\r\n  color: #98a2b3;\r\n}\r\n\r\n.auth__field input:focus {\r\n  outline: none;\r\n  border-color: var(--color-primary);\r\n  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 25%, transparent);\r\n}\r\n\r\n.auth__hint {\r\n  font-size: 0.78rem;\r\n  color: var(--color-text-muted);\r\n}\r\n\r\n.auth__hint--error {\r\n  color: var(--color-danger);\r\n}\r\n\r\n.auth__forgot {\r\n  align-self: flex-end;\r\n  margin-top: -0.5rem;\r\n  font-size: 0.82rem;\r\n  color: var(--color-accent);\r\n  text-decoration: none;\r\n}\r\n\r\n.auth__forgot:hover {\r\n  text-decoration: underline;\r\n}\r\n\r\n.auth__error {\r\n  background: #fef2f2;\r\n  border: 1px solid var(--color-danger);\r\n  color: #b91c1c;\r\n  padding: 0.6rem 0.75rem;\r\n  border-radius: var(--radius-sm);\r\n  font-size: 0.85rem;\r\n}\r\n\r\n.auth__back {\r\n  position: absolute;\r\n  top: 1.25rem;\r\n  left: 1.25rem;\r\n  z-index: 1;\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 0.45rem;\r\n  min-height: 42px;\r\n  padding: 0 1rem;\r\n  border: 1px solid rgba(255, 255, 255, 0.3);\r\n  border-radius: var(--radius-pill);\r\n  background: rgba(20, 22, 31, 0.72);\r\n  color: #fff;\r\n  font-size: 0.9rem;\r\n  font-weight: 700;\r\n  text-decoration: none;\r\n  backdrop-filter: blur(8px);\r\n  transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;\r\n}\r\n\r\n.auth__back:hover {\r\n  background: rgba(20, 22, 31, 0.92);\r\n  border-color: rgba(255, 255, 255, 0.55);\r\n  transform: translateX(-2px);\r\n}\r\n\r\n.auth__back:focus-visible {\r\n  outline: 3px solid color-mix(in srgb, var(--color-accent) 65%, transparent);\r\n  outline-offset: 3px;\r\n}\r\n\r\n.auth__success {\r\n  background: #ecfdf3;\r\n  border: 1px solid #86efac;\r\n  color: #166534;\r\n  padding: 0.6rem 0.75rem;\r\n  border-radius: var(--radius-sm);\r\n  font-size: 0.85rem;\r\n}\r\n\r\n.auth__verification {\r\n  display: flex;\r\n  align-items: flex-start;\r\n  gap: 0.75rem;\r\n  padding: 0.8rem;\r\n  border: 1px solid #ffc998;\r\n  border-radius: 0.65rem;\r\n  background: #fff4e9;\r\n}\r\n\r\n.auth__verification-icon {\r\n  display: grid;\r\n  flex: 0 0 38px;\r\n  width: 38px;\r\n  height: 38px;\r\n  place-items: center;\r\n  border-radius: 0.55rem;\r\n  color: #ff8900;\r\n  background: #ffe8d2;\r\n}\r\n\r\n.auth__verification-content {\r\n  min-width: 0;\r\n}\r\n\r\n.auth__verification-content strong {\r\n  display: block;\r\n  color: var(--color-text);\r\n  font-size: 1rem;\r\n  line-height: 1.25;\r\n}\r\n\r\n.auth__verification-content p {\r\n  margin: 0.25rem 0;\r\n  color: var(--color-text-muted);\r\n  font-size: 0.85rem;\r\n  line-height: 1.4;\r\n}\r\n\r\n.auth__resend {\r\n  display: inline;\r\n  padding: 0;\r\n  border: 0;\r\n  background: transparent;\r\n  color: var(--color-accent);\r\n  font: inherit;\r\n  font-size: 0.85rem;\r\n  font-weight: 700;\r\n  line-height: 1.4;\r\n  text-align: left;\r\n  cursor: pointer;\r\n}\r\n\r\n.auth__resend:hover { text-decoration: underline; }\r\n.auth__resend:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 3px; }\r\n.auth__resend:disabled { opacity: 0.6; cursor: not-allowed; }\r\n\r\n.auth__switch {\r\n  margin: 1.5rem 0 0;\r\n  text-align: center;\r\n  font-size: 0.88rem;\r\n  color: var(--color-text-muted);\r\n}\r\n\r\n.auth__switch a {\r\n  color: var(--color-accent);\r\n  font-weight: 600;\r\n  text-decoration: none;\r\n}\r\n\r\n.auth__switch a:hover {\r\n  text-decoration: underline;\r\n}\r\n\r\n.btn {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 0.75rem 1.25rem;\r\n  border-radius: var(--radius-pill);\r\n  border: none;\r\n  font-weight: 700;\r\n  cursor: pointer;\r\n  font-size: 1rem;\r\n}\r\n\r\n.btn--primary {\r\n  background: var(--color-accent);\r\n  color: #1a1200;\r\n  box-shadow: 0 8px 20px color-mix(in srgb, var(--color-accent) 45%, transparent);\r\n}\r\n\r\n.btn--primary:hover {\r\n  background: color-mix(in srgb, var(--color-accent) 88%, black);\r\n}\r\n\r\n.btn:disabled {\r\n  opacity: 0.6;\r\n  cursor: not-allowed;\r\n}\r\n\r\n.password-field {\r\n  position: relative;\r\n}\r\n\r\n.password-field input {\r\n  width: 100%;\r\n  padding-right: 2.75rem;\r\n}\r\n\r\n.password-toggle {\r\n  position: absolute;\r\n  top: 50%;\r\n  right: 0.4rem;\r\n  translate: 0 -50%;\r\n  display: grid;\r\n  place-items: center;\r\n  width: 2rem;\r\n  height: 2rem;\r\n  border: 0;\r\n  border-radius: 50%;\r\n  background: transparent;\r\n  color: var(--color-text-muted);\r\n  cursor: pointer;\r\n}\r\n\r\n.password-toggle:hover {\r\n  color: var(--color-text);\r\n  background: var(--color-bg);\r\n}\r\n\r\n@media (max-width: 480px) {\r\n  .auth {\r\n    align-items: flex-start;\r\n    padding-top: 5.25rem;\r\n  }\r\n\r\n  .auth__back {\r\n    top: 1rem;\r\n    left: 1rem;\r\n  }\r\n\r\n  .auth__card {\r\n    padding: 1.75rem 1.25rem;\r\n  }\r\n}\r\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(LoginComponent, { className: "LoginComponent", filePath: "src/app/features/auth/login/login.component.ts", lineNumber: 17 }); })();
