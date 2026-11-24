import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideLockKeyhole } from '@lucide/angular';
import { AuthService } from '../../core/services/auth.service';
import { contraseniasIgualesValidator, MENSAJE_CONTRASENIA_SEGURA, passwordSeguraValidator, } from '../../shared/validators/password.validators';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
function CambiarContraseniaComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 7);
    i0.ɵɵlistener("click", function CambiarContraseniaComponent_Conditional_5_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.abrir()); });
    i0.ɵɵtext(1, " Cambiar contrase\u00F1a ");
    i0.ɵɵelementEnd();
} }
function CambiarContraseniaComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 5);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.mensaje());
} }
function CambiarContraseniaComponent_Conditional_7_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 10);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.error());
} }
function CambiarContraseniaComponent_Conditional_7_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 14);
    i0.ɵɵtext(1, "Ingres\u00E1 tu contrase\u00F1a actual.");
    i0.ɵɵelementEnd();
} }
function CambiarContraseniaComponent_Conditional_7_Conditional_19_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 14);
    i0.ɵɵtext(1, "Confirm\u00E1 tu nueva contrase\u00F1a.");
    i0.ɵɵelementEnd();
} }
function CambiarContraseniaComponent_Conditional_7_Conditional_19_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 14);
    i0.ɵɵtext(1, "Las contrase\u00F1as no coinciden.");
    i0.ɵɵelementEnd();
} }
function CambiarContraseniaComponent_Conditional_7_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, CambiarContraseniaComponent_Conditional_7_Conditional_19_Conditional_0_Template, 2, 0, "span", 14)(1, CambiarContraseniaComponent_Conditional_7_Conditional_19_Conditional_1_Template, 2, 0, "span", 14);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional(ctx_r1.form.controls.confirmarContrasenia.invalid ? 0 : ctx_r1.form.hasError("contraseniasDistintas") ? 1 : -1);
} }
function CambiarContraseniaComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 8);
    i0.ɵɵlistener("ngSubmit", function CambiarContraseniaComponent_Conditional_7_Template_form_ngSubmit_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.guardar()); });
    i0.ɵɵelementStart(1, "p", 9);
    i0.ɵɵtext(2, " Ingres\u00E1 tu contrase\u00F1a actual y eleg\u00ED una nueva. Te enviaremos un aviso por correo. ");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, CambiarContraseniaComponent_Conditional_7_Conditional_3_Template, 2, 1, "div", 10);
    i0.ɵɵelementStart(4, "div", 11)(5, "label", 12);
    i0.ɵɵtext(6, "Contrase\u00F1a actual");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(7, "input", 13);
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(8, CambiarContraseniaComponent_Conditional_7_Conditional_8_Template, 2, 0, "span", 14);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "div", 11)(10, "label", 15);
    i0.ɵɵtext(11, "Nueva contrase\u00F1a");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(12, "input", 16);
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(13, "span", 17);
    i0.ɵɵtext(14);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(15, "div", 11)(16, "label", 18);
    i0.ɵɵtext(17, "Confirmar nueva contrase\u00F1a");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(18, "input", 19);
    i0.ɵɵcontrolCreate();
    i0.ɵɵconditionalCreate(19, CambiarContraseniaComponent_Conditional_7_Conditional_19_Template, 2, 1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "div", 20)(21, "button", 21);
    i0.ɵɵlistener("click", function CambiarContraseniaComponent_Conditional_7_Template_button_click_21_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.cerrar()); });
    i0.ɵɵtext(22, " Cancelar ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "button", 22);
    i0.ɵɵtext(24);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("formGroup", ctx_r1.form);
    i0.ɵɵattribute("aria-busy", ctx_r1.guardando());
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.error() ? 3 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.form.controls.contraseniaActual.touched && ctx_r1.form.controls.contraseniaActual.invalid ? 8 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵclassProp("acct-hint--error", ctx_r1.form.controls.contrasenia.touched && ctx_r1.form.controls.contrasenia.invalid);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.politica);
    i0.ɵɵadvance(4);
    i0.ɵɵcontrol();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.form.controls.confirmarContrasenia.touched ? 19 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.guardando());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.guardando());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.guardando() ? "Guardando\u2026" : "Guardar nueva contrase\u00F1a", " ");
} }
export class CambiarContraseniaComponent {
    auth = inject(AuthService);
    fb = inject(FormBuilder);
    abierto = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "abierto" }] : /* istanbul ignore next */ []));
    guardando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "guardando" }] : /* istanbul ignore next */ []));
    error = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    mensaje = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mensaje" }] : /* istanbul ignore next */ []));
    politica = MENSAJE_CONTRASENIA_SEGURA;
    form = this.fb.nonNullable.group({
        contraseniaActual: ['', Validators.required],
        contrasenia: ['', [Validators.required, passwordSeguraValidator()]],
        confirmarContrasenia: ['', Validators.required],
    }, { validators: contraseniasIgualesValidator() });
    abrir() {
        this.form.reset();
        this.error.set('');
        this.mensaje.set('');
        this.abierto.set(true);
    }
    cerrar() {
        if (this.guardando())
            return;
        this.form.reset();
        this.error.set('');
        this.abierto.set(false);
    }
    guardar() {
        if (this.guardando())
            return;
        this.error.set('');
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        const { contraseniaActual, contrasenia, confirmarContrasenia } = this.form.getRawValue();
        if (contraseniaActual === contrasenia) {
            this.error.set('La nueva contraseña debe ser distinta de la actual.');
            return;
        }
        this.guardando.set(true);
        this.auth.cambiarContrasenia(contraseniaActual, contrasenia, confirmarContrasenia).subscribe({
            next: (res) => {
                this.guardando.set(false);
                this.form.reset();
                this.abierto.set(false);
                this.mensaje.set(res.mensaje);
            },
            error: (err) => {
                this.guardando.set(false);
                this.error.set(err.message);
            },
        });
    }
    static ɵfac = function CambiarContraseniaComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CambiarContraseniaComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CambiarContraseniaComponent, selectors: [["app-cambiar-contrasenia"]], decls: 8, vars: 4, consts: [["aria-labelledby", "seguridad-cuenta"], [1, "account-setting-row"], ["id", "seguridad-cuenta", 1, "account-setting-label"], ["lucideLockKeyhole", "", "aria-hidden", "true", 3, "size"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", "acct-btn--sm"], ["role", "status", 1, "acct-alert", "acct-alert--success"], ["novalidate", "", 3, "formGroup"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", "acct-btn--sm", 3, "click"], ["novalidate", "", 3, "ngSubmit", "formGroup"], [1, "security-description"], ["role", "alert", 1, "acct-alert", "acct-alert--error"], [1, "acct-field"], ["for", "contrasenia-actual"], ["id", "contrasenia-actual", "type", "password", "formControlName", "contraseniaActual", "autocomplete", "current-password"], [1, "acct-hint", "acct-hint--error"], ["for", "contrasenia-nueva"], ["id", "contrasenia-nueva", "type", "password", "formControlName", "contrasenia", "autocomplete", "new-password", "aria-describedby", "politica-contrasenia"], ["id", "politica-contrasenia", 1, "acct-hint"], ["for", "confirmar-nueva-contrasenia"], ["id", "confirmar-nueva-contrasenia", "type", "password", "formControlName", "confirmarContrasenia", "autocomplete", "new-password"], [1, "acct-actions"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", 3, "click", "disabled"], ["type", "submit", 1, "acct-btn", "acct-btn--primary", 3, "disabled"]], template: function CambiarContraseniaComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "div", 1)(2, "h3", 2);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(3, "svg", 3);
            i0.ɵɵtext(4, " Contrase\u00F1a ");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(5, CambiarContraseniaComponent_Conditional_5_Template, 2, 0, "button", 4);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(6, CambiarContraseniaComponent_Conditional_6_Template, 2, 1, "div", 5);
            i0.ɵɵconditionalCreate(7, CambiarContraseniaComponent_Conditional_7_Template, 25, 11, "form", 6);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("size", 20);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(!ctx.abierto() ? 5 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.mensaje() ? 6 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.abierto() ? 7 : -1);
        } }, dependencies: [ReactiveFormsModule, i1.ɵNgNoValidate, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.FormGroupDirective, i1.FormControlName, LucideLockKeyhole], styles: ["[_nghost-%COMP%] { display: block; }\n    .account-setting-row[_ngcontent-%COMP%], .account-setting-label[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 0.75rem; }\n    .account-setting-row[_ngcontent-%COMP%] { justify-content: space-between; flex-wrap: wrap; min-height: 3.2rem; padding: 0.5rem 0.35rem; }\n    .account-setting-label[_ngcontent-%COMP%] { margin: 0; font-size: 1rem; font-weight: 550; }\n    .account-setting-label[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { flex: none; }\n    .security-description[_ngcontent-%COMP%] { margin: 0; color: var(--%NS%color-text-muted); line-height: 1.5; }\n    form[_ngcontent-%COMP%] { display: flex; flex-direction: column; gap: 1rem; max-width: 34rem; padding: 0.5rem 0 1.25rem; }\n    .acct-alert--success[_ngcontent-%COMP%] { margin-bottom: 0.75rem; }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CambiarContraseniaComponent, [{
        type: Component,
        args: [{ selector: 'app-cambiar-contrasenia', standalone: true, imports: [ReactiveFormsModule, LucideLockKeyhole], template: "<section aria-labelledby=\"seguridad-cuenta\">\n  <div class=\"account-setting-row\">\n    <h3 id=\"seguridad-cuenta\" class=\"account-setting-label\">\n      <svg lucideLockKeyhole [size]=\"20\" aria-hidden=\"true\"></svg> Contrase\u00F1a\n    </h3>\n    @if (!abierto()) {\n      <button type=\"button\" class=\"acct-btn acct-btn--ghost acct-btn--sm\" (click)=\"abrir()\">\n        Cambiar contrase\u00F1a\n      </button>\n    }\n  </div>\n  @if (mensaje()) {\n    <div class=\"acct-alert acct-alert--success\" role=\"status\">{{ mensaje() }}</div>\n  }\n  @if (abierto()) {\n    <form [formGroup]=\"form\" (ngSubmit)=\"guardar()\" [attr.aria-busy]=\"guardando()\" novalidate>\n      <p class=\"security-description\">\n        Ingres\u00E1 tu contrase\u00F1a actual y eleg\u00ED una nueva. Te enviaremos un aviso por correo.\n      </p>\n      @if (error()) {\n        <div class=\"acct-alert acct-alert--error\" role=\"alert\">{{ error() }}</div>\n      }\n      <div class=\"acct-field\">\n        <label for=\"contrasenia-actual\">Contrase\u00F1a actual</label>\n        <input\n          id=\"contrasenia-actual\"\n          type=\"password\"\n          formControlName=\"contraseniaActual\"\n          autocomplete=\"current-password\"\n        />\n        @if (form.controls.contraseniaActual.touched && form.controls.contraseniaActual.invalid) {\n          <span class=\"acct-hint acct-hint--error\">Ingres\u00E1 tu contrase\u00F1a actual.</span>\n        }\n      </div>\n      <div class=\"acct-field\">\n        <label for=\"contrasenia-nueva\">Nueva contrase\u00F1a</label>\n        <input\n          id=\"contrasenia-nueva\"\n          type=\"password\"\n          formControlName=\"contrasenia\"\n          autocomplete=\"new-password\"\n          aria-describedby=\"politica-contrasenia\"\n        />\n        <span\n          id=\"politica-contrasenia\"\n          class=\"acct-hint\"\n          [class.acct-hint--error]=\"\n            form.controls.contrasenia.touched && form.controls.contrasenia.invalid\n          \"\n          >{{ politica }}</span\n        >\n      </div>\n      <div class=\"acct-field\">\n        <label for=\"confirmar-nueva-contrasenia\">Confirmar nueva contrase\u00F1a</label>\n        <input\n          id=\"confirmar-nueva-contrasenia\"\n          type=\"password\"\n          formControlName=\"confirmarContrasenia\"\n          autocomplete=\"new-password\"\n        />\n        @if (form.controls.confirmarContrasenia.touched) {\n          @if (form.controls.confirmarContrasenia.invalid) {\n            <span class=\"acct-hint acct-hint--error\">Confirm\u00E1 tu nueva contrase\u00F1a.</span>\n          } @else if (form.hasError('contraseniasDistintas')) {\n            <span class=\"acct-hint acct-hint--error\">Las contrase\u00F1as no coinciden.</span>\n          }\n        }\n      </div>\n      <div class=\"acct-actions\">\n        <button\n          type=\"button\"\n          class=\"acct-btn acct-btn--ghost\"\n          [disabled]=\"guardando()\"\n          (click)=\"cerrar()\"\n        >\n          Cancelar\n        </button>\n        <button type=\"submit\" class=\"acct-btn acct-btn--primary\" [disabled]=\"guardando()\">\n          {{ guardando() ? 'Guardando\u2026' : 'Guardar nueva contrase\u00F1a' }}\n        </button>\n      </div>\n    </form>\n  }\n</section>\n", styles: ["\n    :host { display: block; }\n    .account-setting-row, .account-setting-label { display: flex; align-items: center; gap: 0.75rem; }\n    .account-setting-row { justify-content: space-between; flex-wrap: wrap; min-height: 3.2rem; padding: 0.5rem 0.35rem; }\n    .account-setting-label { margin: 0; font-size: 1rem; font-weight: 550; }\n    .account-setting-label svg { flex: none; }\n    .security-description { margin: 0; color: var(--color-text-muted); line-height: 1.5; }\n    form { display: flex; flex-direction: column; gap: 1rem; max-width: 34rem; padding: 0.5rem 0 1.25rem; }\n    .acct-alert--success { margin-bottom: 0.75rem; }\n  "] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CambiarContraseniaComponent, { className: "CambiarContraseniaComponent", filePath: "src/app/features/mi-perfil/cambiar-contrasenia.component.ts", lineNumber: 27 }); })();
