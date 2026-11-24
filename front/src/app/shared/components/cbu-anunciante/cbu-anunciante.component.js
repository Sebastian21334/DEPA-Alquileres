import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { PerfilService } from '../../../core/services/perfil.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
function CbuAnuncianteComponent_Conditional_0_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "CBU validado terminado en ");
    i0.ɵɵelementStart(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(4, ".");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const datos_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(datos_r1.cbu_ultimos_digitos);
} }
function CbuAnuncianteComponent_Conditional_0_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 2)(1, "strong");
    i0.ɵɵtext(2, "CBU rechazado.");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const datos_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", datos_r1.motivo_rechazo_cbu);
} }
function CbuAnuncianteComponent_Conditional_0_Conditional_5_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " CBU cargado. Termin\u00E1 la verificaci\u00F3n de identidad para enviarlo a revisi\u00F3n. ");
} }
function CbuAnuncianteComponent_Conditional_0_Conditional_5_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " El CBU est\u00E1 pendiente de revisi\u00F3n por un administrador. ");
} }
function CbuAnuncianteComponent_Conditional_0_Conditional_5_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1, "El CBU validado sigue vigente mientras se revisa el cambio.");
    i0.ɵɵelementEnd();
} }
function CbuAnuncianteComponent_Conditional_0_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 5);
    i0.ɵɵconditionalCreate(1, CbuAnuncianteComponent_Conditional_0_Conditional_5_Conditional_1_Template, 1, 0)(2, CbuAnuncianteComponent_Conditional_0_Conditional_5_Conditional_2_Template, 1, 0);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, CbuAnuncianteComponent_Conditional_0_Conditional_5_Conditional_3_Template, 2, 0, "p");
} if (rf & 2) {
    const datos_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵconditional(datos_r1.estado === "borrador" || datos_r1.estado === "rechazada" ? 1 : 2);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(datos_r1.cbu_ultimos_digitos ? 3 : -1);
} }
function CbuAnuncianteComponent_Conditional_0_Conditional_6_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 11);
    i0.ɵɵtext(1, "Ingres\u00E1 un CBU de 22 d\u00EDgitos.");
    i0.ɵɵelementEnd();
} }
function CbuAnuncianteComponent_Conditional_0_Conditional_6_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 11);
    i0.ɵɵtext(1, "Confirm\u00E1 que sos titular de la cuenta bancaria.");
    i0.ɵɵelementEnd();
} }
function CbuAnuncianteComponent_Conditional_0_Conditional_6_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 2);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.error());
} }
function CbuAnuncianteComponent_Conditional_0_Conditional_6_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 16);
    i0.ɵɵlistener("click", function CbuAnuncianteComponent_Conditional_0_Conditional_6_Conditional_14_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(3); ctx_r2.cbu.reset(); ctx_r2.titularidad.reset(); ctx_r2.error.set(""); return i0.ɵɵresetView(ctx_r2.editando.set(false)); });
    i0.ɵɵtext(1, "Cancelar");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("disabled", ctx_r2.enviando());
} }
function CbuAnuncianteComponent_Conditional_0_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 6);
    i0.ɵɵlistener("submit", function CbuAnuncianteComponent_Conditional_0_Conditional_6_Template_form_submit_0_listener($event) { i0.ɵɵrestoreView(_r2); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.guardar($event)); });
    i0.ɵɵelementStart(1, "div", 7)(2, "label", 8);
    i0.ɵɵtext(3, "CBU de la cuenta bancaria");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(4, "input", 9);
    i0.ɵɵcontrolCreate();
    i0.ɵɵelementStart(5, "small", 10);
    i0.ɵɵtext(6, "Ingres\u00E1 los 22 d\u00EDgitos. La cuenta bancaria debe estar obligatoriamente a nombre del titular de tu cuenta en DEPA. Un administrador verificar\u00E1 la titularidad antes de aprobar el CBU.");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(7, CbuAnuncianteComponent_Conditional_0_Conditional_6_Conditional_7_Template, 2, 0, "span", 11);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "label");
    i0.ɵɵelement(9, "input", 12);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtext(10, " Confirmo que la cuenta bancaria est\u00E1 a mi nombre.");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(11, CbuAnuncianteComponent_Conditional_0_Conditional_6_Conditional_11_Template, 2, 0, "span", 11);
    i0.ɵɵconditionalCreate(12, CbuAnuncianteComponent_Conditional_0_Conditional_6_Conditional_12_Template, 2, 1, "p", 2);
    i0.ɵɵelementStart(13, "div", 13);
    i0.ɵɵconditionalCreate(14, CbuAnuncianteComponent_Conditional_0_Conditional_6_Conditional_14_Template, 2, 1, "button", 14);
    i0.ɵɵelementStart(15, "button", 15);
    i0.ɵɵtext(16, "Enviar CBU para revisi\u00F3n");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const datos_r1 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("formControl", ctx_r2.cbu)("readonly", ctx_r2.enviando());
    i0.ɵɵcontrol();
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r2.cbu.touched && ctx_r2.cbu.invalid ? 7 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("formControl", ctx_r2.titularidad);
    i0.ɵɵcontrol();
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r2.titularidad.touched && ctx_r2.titularidad.invalid ? 11 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.error() ? 12 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(datos_r1.cbu_ultimos_digitos ? 14 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r2.enviando());
} }
function CbuAnuncianteComponent_Conditional_0_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 17);
    i0.ɵɵlistener("click", function CbuAnuncianteComponent_Conditional_0_Conditional_7_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r5); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.editando.set(true)); });
    i0.ɵɵtext(1, "Cambiar CBU");
    i0.ɵɵelementEnd();
} }
function CbuAnuncianteComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 0)(1, "h2", 1);
    i0.ɵɵtext(2, "CBU para cobrar");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, CbuAnuncianteComponent_Conditional_0_Conditional_3_Template, 5, 1, "p");
    i0.ɵɵconditionalCreate(4, CbuAnuncianteComponent_Conditional_0_Conditional_4_Template, 4, 1, "p", 2);
    i0.ɵɵconditionalCreate(5, CbuAnuncianteComponent_Conditional_0_Conditional_5_Template, 4, 2)(6, CbuAnuncianteComponent_Conditional_0_Conditional_6_Template, 17, 8, "form", 3)(7, CbuAnuncianteComponent_Conditional_0_Conditional_7_Template, 2, 0, "button", 4);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const datos_r1 = ctx;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(datos_r1.cbu_ultimos_digitos ? 3 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(datos_r1.motivo_rechazo_cbu ? 4 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(datos_r1.cbu_en_revision ? 5 : !datos_r1.cbu_ultimos_digitos || ctx_r2.editando() ? 6 : 7);
} }
export class CbuAnuncianteComponent {
    perfil = inject(PerfilService);
    destroyRef = inject(DestroyRef);
    solicitud = this.perfil.solicitud;
    editando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "editando" }] : /* istanbul ignore next */ []));
    enviando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enviando" }] : /* istanbul ignore next */ []));
    error = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    cbu = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{22}$/)] });
    titularidad = new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue });
    guardar(evento) {
        evento.preventDefault();
        if (this.enviando() || this.cbu.invalid || this.titularidad.invalid) {
            this.cbu.markAsTouched();
            this.titularidad.markAsTouched();
            return;
        }
        this.error.set('');
        this.enviando.set(true);
        this.perfil.solicitarCambioCbu(this.cbu.value).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.enviando.set(false))).subscribe({
            next: () => {
                this.cbu.reset();
                this.titularidad.reset();
                this.editando.set(false);
            },
            error: (error) => this.error.set(error.message),
        });
    }
    static ɵfac = function CbuAnuncianteComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CbuAnuncianteComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CbuAnuncianteComponent, selectors: [["app-cbu-anunciante"]], decls: 1, vars: 1, consts: [["aria-labelledby", "cbu-anunciante-titulo", 1, "acct-card"], ["id", "cbu-anunciante-titulo"], ["role", "alert", 1, "acct-alert", "acct-alert--error"], ["novalidate", ""], ["type", "button", 1, "acct-btn", "acct-btn--ghost"], ["role", "status", 1, "acct-alert", "acct-alert--info"], ["novalidate", "", 3, "submit"], [1, "acct-field"], ["for", "cbu-anunciante"], ["id", "cbu-anunciante", "inputmode", "numeric", "maxlength", "22", "autocomplete", "off", "aria-describedby", "cbu-anunciante-ayuda", 3, "formControl", "readonly"], ["id", "cbu-anunciante-ayuda"], [1, "acct-hint", "acct-hint--error"], ["type", "checkbox", 3, "formControl"], [1, "acct-actions"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", 3, "disabled"], ["type", "submit", 1, "acct-btn", "acct-btn--primary", 3, "disabled"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", 3, "click", "disabled"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", 3, "click"]], template: function CbuAnuncianteComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, CbuAnuncianteComponent_Conditional_0_Template, 8, 3, "section", 0);
        } if (rf & 2) {
            let tmp_0_0;
            i0.ɵɵconditional((tmp_0_0 = ctx.solicitud()) ? 0 : -1, tmp_0_0);
        } }, dependencies: [ReactiveFormsModule, i1.ɵNgNoValidate, i1.DefaultValueAccessor, i1.CheckboxControlValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.MaxLengthValidator, i1.FormControlDirective], styles: ["[_nghost-%COMP%] { display: block; } form[_ngcontent-%COMP%] { display: grid; gap: .75rem; }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CbuAnuncianteComponent, [{
        type: Component,
        args: [{ selector: 'app-cbu-anunciante', imports: [ReactiveFormsModule], template: "@if (solicitud(); as datos) {\r\n  <section class=\"acct-card\" aria-labelledby=\"cbu-anunciante-titulo\">\r\n    <h2 id=\"cbu-anunciante-titulo\">CBU para cobrar</h2>\r\n    @if (datos.cbu_ultimos_digitos) {\r\n      <p>CBU validado terminado en <strong>{{ datos.cbu_ultimos_digitos }}</strong>.</p>\r\n    }\r\n    @if (datos.motivo_rechazo_cbu) {\r\n      <p class=\"acct-alert acct-alert--error\" role=\"alert\"><strong>CBU rechazado.</strong> {{ datos.motivo_rechazo_cbu }}</p>\r\n    }\r\n    @if (datos.cbu_en_revision) {\r\n      <p class=\"acct-alert acct-alert--info\" role=\"status\">\r\n        @if (datos.estado === 'borrador' || datos.estado === 'rechazada') {\r\n          CBU cargado. Termin\u00E1 la verificaci\u00F3n de identidad para enviarlo a revisi\u00F3n.\r\n        } @else {\r\n          El CBU est\u00E1 pendiente de revisi\u00F3n por un administrador.\r\n        }\r\n      </p>\r\n      @if (datos.cbu_ultimos_digitos) {\r\n        <p>El CBU validado sigue vigente mientras se revisa el cambio.</p>\r\n      }\r\n    } @else if (!datos.cbu_ultimos_digitos || editando()) {\r\n      <form (submit)=\"guardar($event)\" novalidate>\r\n        <div class=\"acct-field\">\r\n          <label for=\"cbu-anunciante\">CBU de la cuenta bancaria</label>\r\n          <input id=\"cbu-anunciante\" [formControl]=\"cbu\" inputmode=\"numeric\" maxlength=\"22\"\r\n            autocomplete=\"off\" aria-describedby=\"cbu-anunciante-ayuda\" [readonly]=\"enviando()\" />\r\n          <small id=\"cbu-anunciante-ayuda\">Ingres\u00E1 los 22 d\u00EDgitos. La cuenta bancaria debe estar obligatoriamente a nombre del titular de tu cuenta en DEPA. Un administrador verificar\u00E1 la titularidad antes de aprobar el CBU.</small>\r\n          @if (cbu.touched && cbu.invalid) {\r\n            <span class=\"acct-hint acct-hint--error\">Ingres\u00E1 un CBU de 22 d\u00EDgitos.</span>\r\n          }\r\n        </div>\r\n        <label><input type=\"checkbox\" [formControl]=\"titularidad\" /> Confirmo que la cuenta bancaria est\u00E1 a mi nombre.</label>\r\n        @if (titularidad.touched && titularidad.invalid) {\r\n          <span class=\"acct-hint acct-hint--error\">Confirm\u00E1 que sos titular de la cuenta bancaria.</span>\r\n        }\r\n        @if (error()) { <p class=\"acct-alert acct-alert--error\" role=\"alert\">{{ error() }}</p> }\r\n        <div class=\"acct-actions\">\r\n          @if (datos.cbu_ultimos_digitos) {\r\n            <button type=\"button\" class=\"acct-btn acct-btn--ghost\" [disabled]=\"enviando()\" (click)=\"cbu.reset(); titularidad.reset(); error.set(''); editando.set(false)\">Cancelar</button>\r\n          }\r\n          <button type=\"submit\" class=\"acct-btn acct-btn--primary\" [disabled]=\"enviando()\">Enviar CBU para revisi\u00F3n</button>\r\n        </div>\r\n      </form>\r\n    } @else {\r\n      <button type=\"button\" class=\"acct-btn acct-btn--ghost\" (click)=\"editando.set(true)\">Cambiar CBU</button>\r\n    }\r\n  </section>\r\n}\r\n", styles: [":host { display: block; } form { display: grid; gap: .75rem; }"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CbuAnuncianteComponent, { className: "CbuAnuncianteComponent", filePath: "src/app/shared/components/cbu-anunciante/cbu-anunciante.component.ts", lineNumber: 13 }); })();
