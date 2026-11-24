import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { RevealDirective } from '../../directives/reveal.directive';
import * as i0 from "@angular/core";
const _c0 = () => ({ categoria: "largo-plazo" });
const _c1 = () => ({ categoria: "temporales" });
function FooterComponent_Conditional_24_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 13);
    i0.ɵɵtext(1, "Quiero ser anunciante");
    i0.ɵɵelementEnd();
} }
function FooterComponent_Conditional_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 12);
    i0.ɵɵtext(1, "Mi perfil");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(2, FooterComponent_Conditional_24_Conditional_2_Template, 2, 0, "a", 13);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.perfil.solicitudConsultada() && !ctx_r0.perfil.esAnuncianteVerificado() ? 2 : -1);
} }
function FooterComponent_Conditional_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 14);
    i0.ɵɵtext(1, "Iniciar sesi\u00F3n");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "a", 15);
    i0.ɵɵtext(3, "Crear cuenta");
    i0.ɵɵelementEnd();
} }
export class FooterComponent {
    auth = inject(AuthService);
    perfil = inject(PerfilService);
    anio = new Date().getFullYear();
    static ɵfac = function FooterComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || FooterComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: FooterComponent, selectors: [["app-footer"]], decls: 34, vars: 6, consts: [[1, "footer"], ["appReveal", "", 1, "footer__inner"], [1, "footer__brand"], ["routerLink", "/", "aria-label", "Ir al inicio"], ["src", "/images/Logo.png", "alt", "DEPA", 1, "footer__logo"], ["aria-label", "Enlaces del sitio", 1, "footer__cols"], ["routerLink", "/publicaciones", 3, "queryParams"], ["routerLink", "/publicaciones/nueva"], ["routerLink", "/terminos/usuarios"], ["routerLink", "/terminos/anunciantes"], [1, "footer__bottom"], ["aria-label", "amor", 1, "footer__heart"], ["routerLink", "/mi-perfil"], ["routerLink", "/mi-perfil/anunciante"], ["routerLink", "/login"], ["routerLink", "/registro"]], template: function FooterComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "footer", 0)(1, "div", 1)(2, "div", 2)(3, "a", 3);
            i0.ɵɵelement(4, "img", 4);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "p");
            i0.ɵɵtext(6, " Encontr\u00E1 tu pr\u00F3ximo hogar de forma simple, r\u00E1pida y confiable. Conectando due\u00F1os y profesionales en toda la regi\u00F3n. ");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(7, "nav", 5)(8, "div")(9, "h3");
            i0.ɵɵtext(10, "Buscar");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(11, "a", 6);
            i0.ɵɵtext(12, "Alquiler Largo Plazo");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(13, "a", 6);
            i0.ɵɵtext(14, "Alquiler Temporario");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(15, "a", 7);
            i0.ɵɵtext(16, "Publicar propiedad");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(17, "div")(18, "h3");
            i0.ɵɵtext(19, "Tu cuenta");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(20, "a", 8);
            i0.ɵɵtext(21, "T\u00E9rminos de uso");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(22, "a", 9);
            i0.ɵɵtext(23, "T\u00E9rminos para anunciantes");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(24, FooterComponent_Conditional_24_Template, 3, 1)(25, FooterComponent_Conditional_25_Template, 4, 0);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(26, "div", 10)(27, "p");
            i0.ɵɵtext(28);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(29, "p");
            i0.ɵɵtext(30, "Hecho con ");
            i0.ɵɵelementStart(31, "span", 11);
            i0.ɵɵtext(32, "\u2665");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(33, " en la UTN FRVM");
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance(11);
            i0.ɵɵproperty("queryParams", i0.ɵɵpureFunction0(4, _c0));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("queryParams", i0.ɵɵpureFunction0(5, _c1));
            i0.ɵɵadvance(11);
            i0.ɵɵconditional(ctx.auth.isAuthenticated ? 24 : 25);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1("\u00A9 ", ctx.anio, " DEPA. Todos los derechos reservados.");
        } }, dependencies: [RouterLink, RevealDirective], styles: [".footer[_ngcontent-%COMP%] {\r\n  background: #fff;\r\n  border-top: 1px solid var(--%NS%color-border);\r\n  color: var(--%NS%color-text);\r\n}\r\n\r\n.footer__inner[_ngcontent-%COMP%] {\r\n  max-width: var(--%NS%max-width-page);\r\n  margin: 0 auto;\r\n  padding: 2.75rem 1.25rem 2rem;\r\n  display: flex;\r\n  justify-content: space-between;\r\n  gap: 2rem;\r\n  flex-wrap: wrap;\r\n}\r\n\r\n.footer__brand[_ngcontent-%COMP%] {\r\n  max-width: 340px;\r\n}\r\n.footer__logo[_ngcontent-%COMP%] {\r\n  height: 48px;\r\n  width: auto;\r\n  display: block;\r\n  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);\r\n}\r\n.footer__logo[_ngcontent-%COMP%]:hover {\r\n  transform: scale(1.06) rotate(-2deg);\r\n}\r\n.footer__brand[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\r\n  margin: 1rem 0 0;\r\n  font-size: 0.9rem;\r\n  line-height: 1.6;\r\n  color: #344054;\r\n}\r\n\r\n.footer__cols[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  gap: 4rem;\r\n}\r\n.footer__cols[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 0.55rem;\r\n}\r\n.footer__cols[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%] {\r\n  margin: 0 0 0.25rem;\r\n  font-size: 0.95rem;\r\n  font-weight: 800;\r\n}\r\n.footer__cols[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] {\r\n  position: relative;\r\n  width: fit-content;\r\n  font-size: 0.88rem;\r\n  color: #475467;\r\n  text-decoration: none;\r\n  transition: color 0.2s ease, transform 0.2s ease;\r\n}\r\n\r\n.footer__cols[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]::after {\r\n  content: '';\r\n  position: absolute;\r\n  left: 0;\r\n  bottom: -2px;\r\n  width: 100%;\r\n  height: 2px;\r\n  background: var(--%NS%color-accent);\r\n  transform: scaleX(0);\r\n  transform-origin: left;\r\n  transition: transform 0.3s ease;\r\n}\r\n.footer__cols[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover {\r\n  color: var(--%NS%color-text);\r\n  transform: translateX(3px);\r\n}\r\n.footer__cols[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover::after {\r\n  transform: scaleX(1);\r\n}\r\n\r\n.footer__bottom[_ngcontent-%COMP%] {\r\n  max-width: var(--%NS%max-width-page);\r\n  margin: 0 auto;\r\n  padding: 1.1rem 1.25rem 1.5rem;\r\n  display: flex;\r\n  justify-content: space-between;\r\n  gap: 1rem;\r\n  flex-wrap: wrap;\r\n  border-top: 1px solid var(--%NS%color-border);\r\n  font-size: 0.8rem;\r\n  color: var(--%NS%color-text-muted);\r\n}\r\n.footer__bottom[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\r\n  margin: 0;\r\n}\r\n.footer__heart[_ngcontent-%COMP%] {\r\n  display: inline-block;\r\n  color: var(--%NS%color-primary);\r\n  animation: _ngcontent-%COMP%_heartbeat 1.6s ease-in-out infinite;\r\n}\r\n@keyframes _ngcontent-%COMP%_heartbeat {\r\n  0%, 60%, 100% { transform: scale(1); }\r\n  20% { transform: scale(1.3); }\r\n  40% { transform: scale(0.95); }\r\n}\r\n\r\n@media (max-width: 600px) {\r\n  .footer__cols[_ngcontent-%COMP%] {\r\n    gap: 2.5rem;\r\n  }\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FooterComponent, [{
        type: Component,
        args: [{ selector: 'app-footer', standalone: true, imports: [RouterLink, RevealDirective], template: "<footer class=\"footer\">\r\n  <div class=\"footer__inner\" appReveal>\r\n    <div class=\"footer__brand\">\r\n      <a routerLink=\"/\" aria-label=\"Ir al inicio\"><img src=\"/images/Logo.png\" alt=\"DEPA\" class=\"footer__logo\" /></a>\r\n      <p>\r\n        Encontr\u00E1 tu pr\u00F3ximo hogar de forma simple, r\u00E1pida y confiable. Conectando due\u00F1os y\r\n        profesionales en toda la regi\u00F3n.\r\n      </p>\r\n    </div>\r\n\r\n    <nav class=\"footer__cols\" aria-label=\"Enlaces del sitio\">\r\n      <div>\r\n        <h3>Buscar</h3>\r\n        <a routerLink=\"/publicaciones\" [queryParams]=\"{ categoria: 'largo-plazo' }\">Alquiler Largo Plazo</a>\r\n        <a routerLink=\"/publicaciones\" [queryParams]=\"{ categoria: 'temporales' }\">Alquiler Temporario</a>\r\n        <a routerLink=\"/publicaciones/nueva\">Publicar propiedad</a>\r\n      </div>\r\n      <div>\r\n        <h3>Tu cuenta</h3>\r\n        <a routerLink=\"/terminos/usuarios\">T\u00E9rminos de uso</a>\r\n        <a routerLink=\"/terminos/anunciantes\">T\u00E9rminos para anunciantes</a>\r\n        @if (auth.isAuthenticated) {\r\n          <a routerLink=\"/mi-perfil\">Mi perfil</a>\r\n          @if (perfil.solicitudConsultada() && !perfil.esAnuncianteVerificado()) {\r\n            <a routerLink=\"/mi-perfil/anunciante\">Quiero ser anunciante</a>\r\n          }\r\n        } @else {\r\n          <a routerLink=\"/login\">Iniciar sesi\u00F3n</a>\r\n          <a routerLink=\"/registro\">Crear cuenta</a>\r\n        }\r\n      </div>\r\n    </nav>\r\n  </div>\r\n\r\n  <div class=\"footer__bottom\">\r\n    <p>\u00A9 {{ anio }} DEPA. Todos los derechos reservados.</p>\r\n    <p>Hecho con <span class=\"footer__heart\" aria-label=\"amor\">\u2665</span> en la UTN FRVM</p>\r\n  </div>\r\n</footer>\r\n", styles: [".footer {\r\n  background: #fff;\r\n  border-top: 1px solid var(--color-border);\r\n  color: var(--color-text);\r\n}\r\n\r\n.footer__inner {\r\n  max-width: var(--max-width-page);\r\n  margin: 0 auto;\r\n  padding: 2.75rem 1.25rem 2rem;\r\n  display: flex;\r\n  justify-content: space-between;\r\n  gap: 2rem;\r\n  flex-wrap: wrap;\r\n}\r\n\r\n.footer__brand {\r\n  max-width: 340px;\r\n}\r\n.footer__logo {\r\n  height: 48px;\r\n  width: auto;\r\n  display: block;\r\n  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);\r\n}\r\n.footer__logo:hover {\r\n  transform: scale(1.06) rotate(-2deg);\r\n}\r\n.footer__brand p {\r\n  margin: 1rem 0 0;\r\n  font-size: 0.9rem;\r\n  line-height: 1.6;\r\n  color: #344054;\r\n}\r\n\r\n.footer__cols {\r\n  display: flex;\r\n  gap: 4rem;\r\n}\r\n.footer__cols div {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 0.55rem;\r\n}\r\n.footer__cols h3 {\r\n  margin: 0 0 0.25rem;\r\n  font-size: 0.95rem;\r\n  font-weight: 800;\r\n}\r\n.footer__cols a {\r\n  position: relative;\r\n  width: fit-content;\r\n  font-size: 0.88rem;\r\n  color: #475467;\r\n  text-decoration: none;\r\n  transition: color 0.2s ease, transform 0.2s ease;\r\n}\r\n/* Subrayado naranja que crece al pasar el mouse */\r\n.footer__cols a::after {\r\n  content: '';\r\n  position: absolute;\r\n  left: 0;\r\n  bottom: -2px;\r\n  width: 100%;\r\n  height: 2px;\r\n  background: var(--color-accent);\r\n  transform: scaleX(0);\r\n  transform-origin: left;\r\n  transition: transform 0.3s ease;\r\n}\r\n.footer__cols a:hover {\r\n  color: var(--color-text);\r\n  transform: translateX(3px);\r\n}\r\n.footer__cols a:hover::after {\r\n  transform: scaleX(1);\r\n}\r\n\r\n.footer__bottom {\r\n  max-width: var(--max-width-page);\r\n  margin: 0 auto;\r\n  padding: 1.1rem 1.25rem 1.5rem;\r\n  display: flex;\r\n  justify-content: space-between;\r\n  gap: 1rem;\r\n  flex-wrap: wrap;\r\n  border-top: 1px solid var(--color-border);\r\n  font-size: 0.8rem;\r\n  color: var(--color-text-muted);\r\n}\r\n.footer__bottom p {\r\n  margin: 0;\r\n}\r\n.footer__heart {\r\n  display: inline-block;\r\n  color: var(--color-primary);\r\n  animation: heartbeat 1.6s ease-in-out infinite;\r\n}\r\n@keyframes heartbeat {\r\n  0%, 60%, 100% { transform: scale(1); }\r\n  20% { transform: scale(1.3); }\r\n  40% { transform: scale(0.95); }\r\n}\r\n\r\n@media (max-width: 600px) {\r\n  .footer__cols {\r\n    gap: 2.5rem;\r\n  }\r\n}\r\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(FooterComponent, { className: "FooterComponent", filePath: "src/app/shared/components/footer/footer.component.ts", lineNumber: 14 }); })();
