import { Component, computed, input, linkedSignal } from '@angular/core';
import * as i0 from "@angular/core";
function AvatarComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "img", 1);
    i0.ɵɵdomListener("error", function AvatarComponent_Conditional_0_Template_img_error_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.fallo.set(true)); });
    i0.ɵɵdomElementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵdomProperty("src", ctx_r1.foto(), i0.ɵɵsanitizeUrl)("alt", "Foto de " + ctx_r1.nombre());
} }
function AvatarComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.inicial(), " ");
} }
/**
 * Avatar de usuario: muestra la foto de perfil si existe y, si no hay foto o no
 * carga, la inicial del nombre. El tamaño, color y borde los define quien lo usa
 * (la clase que se le pone al <app-avatar>), así mantiene el estilo de cada pantalla.
 */
export class AvatarComponent {
    foto = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "foto" }] : /* istanbul ignore next */ []));
    nombre = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "nombre" }] : /* istanbul ignore next */ []));
    usarDosIniciales = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "usarDosIniciales" }] : /* istanbul ignore next */ []));
    // Se reinicia cuando cambia la foto, para reintentar con una URL nueva.
    fallo = linkedSignal({ ...(ngDevMode ? { debugName: "fallo" } : /* istanbul ignore next */ {}), source: this.foto, computation: () => false });
    inicial = computed(() => {
        const partes = (this.nombre()?.trim() || '?').split(/\s+/);
        if (!this.usarDosIniciales() || partes.length === 1)
            return partes[0].charAt(0).toUpperCase();
        return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "inicial" }] : /* istanbul ignore next */ []));
    static ɵfac = function AvatarComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AvatarComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AvatarComponent, selectors: [["app-avatar"]], inputs: { foto: [1, "foto"], nombre: [1, "nombre"], usarDosIniciales: [1, "usarDosIniciales"] }, decls: 2, vars: 1, consts: [[3, "src", "alt"], [3, "error", "src", "alt"]], template: function AvatarComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, AvatarComponent_Conditional_0_Template, 1, 2, "img", 0)(1, AvatarComponent_Conditional_1_Template, 1, 1);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.foto() && !ctx.fallo() ? 0 : 1);
        } }, styles: ["[_nghost-%COMP%] { display: grid; place-items: center; overflow: hidden; }\n    img[_ngcontent-%COMP%] { width: 100%; height: 100%; object-fit: cover; display: block; animation: depa-fade-in 0.4s ease both; }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AvatarComponent, [{
        type: Component,
        args: [{ selector: 'app-avatar', standalone: true, template: `
    @if (foto() && !fallo()) {
      <img [src]="foto()" [alt]="'Foto de ' + nombre()" (error)="fallo.set(true)" />
    } @else {
      {{ inicial() }}
    }
  `, styles: ["\n    :host { display: grid; place-items: center; overflow: hidden; }\n    img { width: 100%; height: 100%; object-fit: cover; display: block; animation: depa-fade-in 0.4s ease both; }\n  "] }]
    }], null, { foto: [{ type: i0.Input, args: [{ isSignal: true, alias: "foto", required: false }] }], nombre: [{ type: i0.Input, args: [{ isSignal: true, alias: "nombre", required: false }] }], usarDosIniciales: [{ type: i0.Input, args: [{ isSignal: true, alias: "usarDosIniciales", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AvatarComponent, { className: "AvatarComponent", filePath: "src/app/shared/components/avatar/avatar.component.ts", lineNumber: 23 }); })();
