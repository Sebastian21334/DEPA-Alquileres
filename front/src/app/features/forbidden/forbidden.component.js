import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideHouse, LucideShieldX } from '@lucide/angular';
import * as i0 from "@angular/core";
export class ForbiddenComponent {
    location = inject(Location);
    volver() {
        this.location.back();
    }
    static ɵfac = function ForbiddenComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ForbiddenComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ForbiddenComponent, selectors: [["app-forbidden"]], decls: 17, vars: 3, consts: [[1, "forbidden"], ["aria-labelledby", "forbidden-title", 1, "forbidden__card"], ["aria-hidden", "true", 1, "forbidden__icon"], ["lucideShieldX", "", 3, "size"], [1, "forbidden__code"], ["id", "forbidden-title"], [1, "forbidden__message"], [1, "forbidden__actions"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", 3, "click"], ["lucideArrowLeft", "", 3, "size"], ["routerLink", "/", 1, "acct-btn", "acct-btn--primary"], ["lucideHouse", "", 3, "size"]], template: function ForbiddenComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "main", 0)(1, "section", 1)(2, "div", 2);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(3, "svg", 3);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(4, "p", 4);
            i0.ɵɵtext(5, "Error 403");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "h1", 5);
            i0.ɵɵtext(7, "Acceso denegado");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "p", 6);
            i0.ɵɵtext(9, " Tu cuenta inici\u00F3 sesi\u00F3n correctamente, pero no tiene permisos para acceder al panel administrativo. ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "div", 7)(11, "button", 8);
            i0.ɵɵlistener("click", function ForbiddenComponent_Template_button_click_11_listener() { return ctx.volver(); });
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(12, "svg", 9);
            i0.ɵɵtext(13, " Volver ");
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(14, "a", 10);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(15, "svg", 11);
            i0.ɵɵtext(16, " Ir al inicio ");
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("size", 42);
            i0.ɵɵadvance(9);
            i0.ɵɵproperty("size", 18);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("size", 18);
        } }, dependencies: [RouterLink, LucideArrowLeft, LucideHouse, LucideShieldX], styles: [".forbidden[_ngcontent-%COMP%] {\n  min-height: calc(100dvh - 70px);\n  display: grid;\n  place-items: center;\n  padding: 2rem 1rem 4rem;\n  background:\n    radial-gradient(circle at 50% 15%, color-mix(in srgb, var(--%NS%color-danger) 10%, transparent), transparent 38%),\n    var(--%NS%color-bg);\n}\n\n.forbidden__card[_ngcontent-%COMP%] {\n  width: min(100%, 560px);\n  padding: clamp(2rem, 6vw, 3.5rem);\n  border: 1px solid var(--%NS%color-border);\n  border-radius: var(--%NS%radius-lg);\n  background: var(--%NS%color-surface);\n  box-shadow: var(--%NS%shadow-card-hover);\n  text-align: center;\n}\n\n.forbidden__icon[_ngcontent-%COMP%] {\n  display: grid;\n  place-items: center;\n  width: 76px;\n  height: 76px;\n  margin: 0 auto 1.25rem;\n  border-radius: 50%;\n  color: var(--%NS%color-danger);\n  background: #fef2f2;\n}\n\n.forbidden__code[_ngcontent-%COMP%] {\n  margin: 0 0 0.4rem;\n  color: var(--%NS%color-danger);\n  font-size: 0.82rem;\n  font-weight: 800;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n}\n\n.forbidden[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--%NS%color-text);\n  font-size: clamp(1.75rem, 5vw, 2.4rem);\n}\n\n.forbidden__message[_ngcontent-%COMP%] {\n  max-width: 440px;\n  margin: 1rem auto 0;\n  color: var(--%NS%color-text-muted);\n  line-height: 1.6;\n}\n\n.forbidden__actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  gap: 0.75rem;\n  margin-top: 2rem;\n}\n\n@media (max-width: 480px) {\n  .forbidden__actions[_ngcontent-%COMP%] {\n    flex-direction: column-reverse;\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ForbiddenComponent, [{
        type: Component,
        args: [{ selector: 'app-forbidden', standalone: true, imports: [RouterLink, LucideArrowLeft, LucideHouse, LucideShieldX], template: "<main class=\"forbidden\">\n  <section class=\"forbidden__card\" aria-labelledby=\"forbidden-title\">\n    <div class=\"forbidden__icon\" aria-hidden=\"true\">\n      <svg lucideShieldX [size]=\"42\"></svg>\n    </div>\n    <p class=\"forbidden__code\">Error 403</p>\n    <h1 id=\"forbidden-title\">Acceso denegado</h1>\n    <p class=\"forbidden__message\">\n      Tu cuenta inici\u00F3 sesi\u00F3n correctamente, pero no tiene permisos para acceder al panel administrativo.\n    </p>\n    <div class=\"forbidden__actions\">\n      <button type=\"button\" class=\"acct-btn acct-btn--ghost\" (click)=\"volver()\">\n        <svg lucideArrowLeft [size]=\"18\"></svg>\n        Volver\n      </button>\n      <a routerLink=\"/\" class=\"acct-btn acct-btn--primary\">\n        <svg lucideHouse [size]=\"18\"></svg>\n        Ir al inicio\n      </a>\n    </div>\n  </section>\n</main>\n", styles: [".forbidden {\n  min-height: calc(100dvh - 70px);\n  display: grid;\n  place-items: center;\n  padding: 2rem 1rem 4rem;\n  background:\n    radial-gradient(circle at 50% 15%, color-mix(in srgb, var(--color-danger) 10%, transparent), transparent 38%),\n    var(--color-bg);\n}\n\n.forbidden__card {\n  width: min(100%, 560px);\n  padding: clamp(2rem, 6vw, 3.5rem);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-lg);\n  background: var(--color-surface);\n  box-shadow: var(--shadow-card-hover);\n  text-align: center;\n}\n\n.forbidden__icon {\n  display: grid;\n  place-items: center;\n  width: 76px;\n  height: 76px;\n  margin: 0 auto 1.25rem;\n  border-radius: 50%;\n  color: var(--color-danger);\n  background: #fef2f2;\n}\n\n.forbidden__code {\n  margin: 0 0 0.4rem;\n  color: var(--color-danger);\n  font-size: 0.82rem;\n  font-weight: 800;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n}\n\n.forbidden h1 {\n  margin: 0;\n  color: var(--color-text);\n  font-size: clamp(1.75rem, 5vw, 2.4rem);\n}\n\n.forbidden__message {\n  max-width: 440px;\n  margin: 1rem auto 0;\n  color: var(--color-text-muted);\n  line-height: 1.6;\n}\n\n.forbidden__actions {\n  display: flex;\n  justify-content: center;\n  gap: 0.75rem;\n  margin-top: 2rem;\n}\n\n@media (max-width: 480px) {\n  .forbidden__actions {\n    flex-direction: column-reverse;\n  }\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ForbiddenComponent, { className: "ForbiddenComponent", filePath: "src/app/features/forbidden/forbidden.component.ts", lineNumber: 13 }); })();
