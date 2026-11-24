import { Component, inject } from '@angular/core';
import { LucideCircleAlert, LucideCheck, LucideX } from '@lucide/angular';
import { ToastService } from '../../../core/services/toast.service';
import * as i0 from "@angular/core";
function ToastComponent_Conditional_0_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(0, "svg", 2);
} if (rf & 2) {
    i0.ɵɵproperty("size", 20);
} }
function ToastComponent_Conditional_0_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(0, "svg", 3);
} if (rf & 2) {
    i0.ɵɵproperty("size", 20);
} }
function ToastComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div")(1, "span", 1);
    i0.ɵɵconditionalCreate(2, ToastComponent_Conditional_0_Conditional_2_Template, 1, 1, ":svg:svg", 2)(3, ToastComponent_Conditional_0_Conditional_3_Template, 1, 1, ":svg:svg", 3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 4);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "button", 5);
    i0.ɵɵlistener("click", function ToastComponent_Conditional_0_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.toast.cerrar()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(7, "svg", 6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const aviso_r3 = ctx;
    i0.ɵɵclassMap("toast toast--" + aviso_r3.tipo);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(aviso_r3.tipo === "exito" ? 2 : 3);
    i0.ɵɵadvance(2);
    i0.ɵɵattribute("role", aviso_r3.tipo === "error" ? "alert" : "status");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", aviso_r3.mensaje, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 18);
} }
export class ToastComponent {
    toast = inject(ToastService);
    static ɵfac = function ToastComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ToastComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ToastComponent, selectors: [["app-toast"]], decls: 1, vars: 1, consts: [[3, "class"], ["aria-hidden", "true", 1, "toast__icon"], ["lucideCheck", "", 3, "size"], ["lucideCircleAlert", "", 3, "size"], [1, "toast__message"], ["type", "button", "aria-label", "Cerrar aviso", 3, "click"], ["lucideX", "", "aria-hidden", "true", 3, "size"]], template: function ToastComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, ToastComponent_Conditional_0_Template, 8, 6, "div", 0);
        } if (rf & 2) {
            let tmp_0_0;
            i0.ɵɵconditional((tmp_0_0 = ctx.toast.aviso()) ? 0 : -1, tmp_0_0);
        } }, dependencies: [LucideCircleAlert, LucideCheck, LucideX], styles: [".toast[_ngcontent-%COMP%] {\n      position: fixed;\n      right: max(1rem, env(safe-area-inset-right));\n      bottom: max(1rem, env(safe-area-inset-bottom));\n      z-index: 100;\n      display: flex;\n      width: min(26rem, calc(100vw - 2rem));\n      align-items: center;\n      gap: .75rem;\n      padding: .75rem;\n      border: 1px solid #dbe5e9;\n      border-inline-start: 4px solid var(--%NS%toast-accent);\n      border-radius: 12px;\n      background: #fff;\n      color: #172a34;\n      font-size: .9rem;\n      font-weight: 600;\n      line-height: 1.4;\n      box-shadow: 0 12px 32px rgba(16, 24, 40, .18);\n      animation: _ngcontent-%COMP%_toast-in .3s ease both;\n      --%NS%toast-accent: #285879;\n      --%NS%toast-tint: #eaf3fa;\n    }\n    .toast--exito[_ngcontent-%COMP%] { --%NS%toast-accent: #126347; --%NS%toast-tint: #e6f6ed; }\n    .toast--error[_ngcontent-%COMP%] { --%NS%toast-accent: #9e2020; --%NS%toast-tint: #ffeded; }\n    .toast--advertencia[_ngcontent-%COMP%] { --%NS%toast-accent: #855009; --%NS%toast-tint: #fff3dc; }\n    .toast__icon[_ngcontent-%COMP%] {\n      display: grid;\n      place-items: center;\n      flex: 0 0 2.25rem;\n      height: 2.25rem;\n      border-radius: 50%;\n      background: var(--%NS%toast-tint);\n      color: var(--%NS%toast-accent);\n    }\n    .toast__message[_ngcontent-%COMP%] { flex: 1; min-width: 0; overflow-wrap: anywhere; }\n    .toast[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n      display: grid;\n      place-items: center;\n      flex: 0 0 2.75rem;\n      height: 2.75rem;\n      border: 0;\n      border-radius: 8px;\n      background: transparent;\n      color: #41535e;\n      cursor: pointer;\n    }\n    .toast[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover { background: #eef3f5; }\n    .toast[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:focus-visible { outline: 2px solid var(--%NS%toast-accent); outline-offset: 2px; }\n    @keyframes _ngcontent-%COMP%_toast-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }\n    @media (prefers-reduced-motion: reduce) { .toast[_ngcontent-%COMP%] { animation: none; } }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ToastComponent, [{
        type: Component,
        args: [{ selector: 'app-toast', standalone: true, imports: [LucideCircleAlert, LucideCheck, LucideX], template: `
    @if (toast.aviso(); as aviso) {
      <div [class]="'toast toast--' + aviso.tipo">
        <span class="toast__icon" aria-hidden="true">
          @if (aviso.tipo === 'exito') {
            <svg lucideCheck [size]="20"></svg>
          } @else {
            <svg lucideCircleAlert [size]="20"></svg>
          }
        </span>
        <span class="toast__message" [attr.role]="aviso.tipo === 'error' ? 'alert' : 'status'">
          {{ aviso.mensaje }}
        </span>
        <button type="button" aria-label="Cerrar aviso" (click)="toast.cerrar()">
          <svg lucideX [size]="18" aria-hidden="true"></svg>
        </button>
      </div>
    }
  `, styles: ["\n    .toast {\n      position: fixed;\n      right: max(1rem, env(safe-area-inset-right));\n      bottom: max(1rem, env(safe-area-inset-bottom));\n      z-index: 100;\n      display: flex;\n      width: min(26rem, calc(100vw - 2rem));\n      align-items: center;\n      gap: .75rem;\n      padding: .75rem;\n      border: 1px solid #dbe5e9;\n      border-inline-start: 4px solid var(--toast-accent);\n      border-radius: 12px;\n      background: #fff;\n      color: #172a34;\n      font-size: .9rem;\n      font-weight: 600;\n      line-height: 1.4;\n      box-shadow: 0 12px 32px rgba(16, 24, 40, .18);\n      animation: toast-in .3s ease both;\n      --toast-accent: #285879;\n      --toast-tint: #eaf3fa;\n    }\n    .toast--exito { --toast-accent: #126347; --toast-tint: #e6f6ed; }\n    .toast--error { --toast-accent: #9e2020; --toast-tint: #ffeded; }\n    .toast--advertencia { --toast-accent: #855009; --toast-tint: #fff3dc; }\n    .toast__icon {\n      display: grid;\n      place-items: center;\n      flex: 0 0 2.25rem;\n      height: 2.25rem;\n      border-radius: 50%;\n      background: var(--toast-tint);\n      color: var(--toast-accent);\n    }\n    .toast__message { flex: 1; min-width: 0; overflow-wrap: anywhere; }\n    .toast button {\n      display: grid;\n      place-items: center;\n      flex: 0 0 2.75rem;\n      height: 2.75rem;\n      border: 0;\n      border-radius: 8px;\n      background: transparent;\n      color: #41535e;\n      cursor: pointer;\n    }\n    .toast button:hover { background: #eef3f5; }\n    .toast button:focus-visible { outline: 2px solid var(--toast-accent); outline-offset: 2px; }\n    @keyframes toast-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }\n    @media (prefers-reduced-motion: reduce) { .toast { animation: none; } }\n  "] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ToastComponent, { className: "ToastComponent", filePath: "src/app/shared/components/toast/toast.component.ts", lineNumber: 82 }); })();
