import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService } from '../../../core/services/chat.service';
import { PerfilService } from '../../../core/services/perfil.service';
import * as i0 from "@angular/core";
function ConfirmarBajaComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 5);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.mensaje());
} }
function ConfirmarBajaComponent_Conditional_7_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 9);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.error());
} }
function ConfirmarBajaComponent_Conditional_7_Conditional_1_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, " Tus publicaciones dejar\u00E1n de estar disponibles. ");
} }
function ConfirmarBajaComponent_Conditional_7_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 10);
    i0.ɵɵtext(1, " Al confirmar, perder\u00E1s el acceso a tu cuenta. ");
    i0.ɵɵconditionalCreate(2, ConfirmarBajaComponent_Conditional_7_Conditional_1_Conditional_2_Template, 1, 0);
    i0.ɵɵtext(3, " Tus datos e historial se conservar\u00E1n. Si volv\u00E9s a registrarte con el mismo email, podr\u00E1s recuperar esta cuenta o crear una nueva. ");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.esAnunciante ? 2 : -1);
} }
function ConfirmarBajaComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, ConfirmarBajaComponent_Conditional_7_Conditional_0_Template, 2, 1, "p", 9);
    i0.ɵɵconditionalCreate(1, ConfirmarBajaComponent_Conditional_7_Conditional_1_Template, 4, 1, "p", 10);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r0.error() ? 0 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.token ? 1 : -1);
} }
function ConfirmarBajaComponent_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 11);
    i0.ɵɵlistener("click", function ConfirmarBajaComponent_Conditional_9_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.confirmar()); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r0.enviando());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.enviando() ? "Confirmando\u2026" : "Confirmar baja de cuenta", " ");
} }
export class ConfirmarBajaComponent {
    perfil = inject(PerfilService);
    auth = inject(AuthService);
    chat = inject(ChatService);
    location = inject(Location);
    token = inject(ActivatedRoute).snapshot.fragment;
    esAnunciante = this.leerTipoDeCuenta();
    enviando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enviando" }] : /* istanbul ignore next */ []));
    mensaje = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mensaje" }] : /* istanbul ignore next */ []));
    error = signal(this.token ? '' : 'Abrí el enlace que te enviamos por correo para confirmar la baja.', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    leerTipoDeCuenta() {
        const contenido = this.token?.split('.')[1];
        if (!contenido)
            return false;
        try {
            // Este dato solo elige el texto. El backend verifica y autoriza la baja.
            const payload = JSON.parse(atob(contenido.replace(/-/g, '+').replace(/_/g, '/')));
            return payload?.esAnunciante === true;
        }
        catch {
            return false;
        }
    }
    confirmar() {
        if (!this.token || this.enviando() || this.mensaje())
            return;
        this.enviando.set(true);
        this.error.set('');
        this.perfil.confirmarBajaCuenta(this.token).subscribe({
            next: ({ mensaje, usuarioId }) => {
                this.location.replaceState('/confirmar-baja');
                if (this.auth.currentUser()?.sub === usuarioId) {
                    this.auth.logout();
                    this.perfil.limpiar();
                    this.chat.cerrarTodos();
                }
                this.mensaje.set(mensaje);
                this.enviando.set(false);
            },
            error: (err) => {
                this.error.set(err.message);
                this.enviando.set(false);
            },
        });
    }
    static ɵfac = function ConfirmarBajaComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ConfirmarBajaComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ConfirmarBajaComponent, selectors: [["app-confirmar-baja"]], decls: 12, vars: 6, consts: [[1, "auth", "auth--pantalla-completa"], [1, "auth__card"], ["routerLink", "/", "aria-label", "Ir al inicio", 1, "auth__brand"], ["src", "/images/Logo.png", "alt", "DEPA"], [1, "auth__title"], ["role", "status", 1, "auth__subtitle"], [1, "confirmar-baja__acciones"], ["type", "button", 1, "btn", "btn--primary", "confirmar-baja__confirmar", 3, "disabled"], ["routerLink", "/"], ["role", "alert", 1, "auth__error"], [1, "auth__subtitle"], ["type", "button", 1, "btn", "btn--primary", "confirmar-baja__confirmar", 3, "click", "disabled"]], template: function ConfirmarBajaComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "div", 1)(2, "a", 2);
            i0.ɵɵelement(3, "img", 3);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "h1", 4);
            i0.ɵɵtext(5, "Confirmar baja de cuenta");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(6, ConfirmarBajaComponent_Conditional_6_Template, 2, 1, "p", 5)(7, ConfirmarBajaComponent_Conditional_7_Template, 2, 2);
            i0.ɵɵelementStart(8, "div", 6);
            i0.ɵɵconditionalCreate(9, ConfirmarBajaComponent_Conditional_9_Template, 2, 2, "button", 7);
            i0.ɵɵelementStart(10, "a", 8);
            i0.ɵɵtext(11, "Volver al inicio");
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            i0.ɵɵadvance(6);
            i0.ɵɵconditional(ctx.mensaje() ? 6 : 7);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.token && !ctx.mensaje() ? 9 : -1);
            i0.ɵɵadvance();
            i0.ɵɵclassProp("btn", ctx.mensaje())("btn--primary", ctx.mensaje());
        } }, dependencies: [RouterLink], styles: [".auth[_ngcontent-%COMP%] {\r\n  min-height: calc(100dvh - 4rem);\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n  padding: 2.5rem 1rem 3rem;\r\n  background:\r\n    linear-gradient(180deg, rgba(10, 12, 20, 0.45) 0%, rgba(10, 12, 20, 0.75) 100%),\r\n    var(--%NS%auth-bg-image, none) center / cover no-repeat,\r\n    radial-gradient(circle at 20% 10%, rgba(216, 71, 30, 0.3), transparent 45%),\r\n    radial-gradient(circle at 85% 85%, rgba(14, 70, 161, 0.35), transparent 45%),\r\n    var(--%NS%color-dark);\r\n}\r\n\r\n.auth--pantalla-completa[_ngcontent-%COMP%] {\r\n  min-height: 100dvh;\r\n  box-sizing: border-box;\r\n  padding: 1rem;\r\n}\r\n\r\n.auth__card[_ngcontent-%COMP%] {\r\n  width: 100%;\r\n  max-width: 420px;\r\n  background: var(--%NS%color-surface);\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: var(--%NS%radius-lg);\r\n  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);\r\n  padding: 2.25rem 2rem;\r\n}\r\n\r\n.auth__brand[_ngcontent-%COMP%] {\r\n  display: block;\r\n  text-decoration: none;\r\n  text-align: center;\r\n  font-size: 1.3rem;\r\n  font-weight: 700;\r\n  letter-spacing: -0.01em;\r\n  color: var(--%NS%color-text);\r\n  margin-bottom: 1.25rem;\r\n}\r\n\r\n.auth__brand[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\r\n  display: block;\r\n  height: 44px;\r\n  width: auto;\r\n  margin: 0 auto;\r\n}\r\n\r\n.auth__title[_ngcontent-%COMP%] {\r\n  margin: 0 0 0.25rem;\r\n  font-size: 1.5rem;\r\n  font-weight: 800;\r\n  color: var(--%NS%color-text);\r\n  text-align: center;\r\n}\r\n\r\n.auth__subtitle[_ngcontent-%COMP%] {\r\n  margin: 0 0 1.75rem;\r\n  color: var(--%NS%color-text-muted);\r\n  font-size: 0.9rem;\r\n  text-align: center;\r\n}\r\n\r\n.auth__subtitle--error[_ngcontent-%COMP%] {\r\n  color: var(--%NS%color-danger);\r\n}\r\n\r\n.auth__form[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 1.1rem;\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 0.4rem;\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\r\n  font-size: 0.85rem;\r\n  font-weight: 600;\r\n  color: var(--%NS%color-text);\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\r\n  padding: 0.7rem 0.9rem;\r\n  border-radius: var(--%NS%radius-sm);\r\n  border: 1px solid var(--%NS%color-border);\r\n  font-size: 0.95rem;\r\n  color: var(--%NS%color-text);\r\n  background: #fff;\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]::placeholder {\r\n  color: #98a2b3;\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus {\r\n  outline: none;\r\n  border-color: var(--%NS%color-primary);\r\n  box-shadow: 0 0 0 3px color-mix(in srgb, var(--%NS%color-primary) 25%, transparent);\r\n}\r\n\r\n.auth__hint[_ngcontent-%COMP%] {\r\n  font-size: 0.78rem;\r\n  color: var(--%NS%color-text-muted);\r\n}\r\n\r\n.auth__hint--error[_ngcontent-%COMP%] {\r\n  color: var(--%NS%color-danger);\r\n}\r\n\r\n.auth__error[_ngcontent-%COMP%] {\r\n  background: #fef2f2;\r\n  border: 1px solid var(--%NS%color-danger);\r\n  color: #b91c1c;\r\n  padding: 0.6rem 0.75rem;\r\n  border-radius: var(--%NS%radius-sm);\r\n  font-size: 0.85rem;\r\n}\r\n\r\n.btn[_ngcontent-%COMP%] {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 0.75rem 1.25rem;\r\n  border-radius: var(--%NS%radius-pill);\r\n  border: none;\r\n  font-weight: 700;\r\n  cursor: pointer;\r\n  font-size: 0.95rem;\r\n  text-decoration: none;\r\n}\r\n\r\n.btn--primary[_ngcontent-%COMP%] {\r\n  background: var(--%NS%color-accent);\r\n  color: #1a1200;\r\n  box-shadow: 0 8px 20px color-mix(in srgb, var(--%NS%color-accent) 45%, transparent);\r\n}\r\n\r\n.btn--%NS%primary[_ngcontent-%COMP%]:hover {\r\n  background: color-mix(in srgb, var(--%NS%color-accent) 88%, black);\r\n}\r\n\r\n.btn[_ngcontent-%COMP%]:disabled {\r\n  opacity: 0.6;\r\n  cursor: not-allowed;\r\n}", ".confirmar-baja__acciones[_ngcontent-%COMP%] {\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      gap: 0.85rem;\n      text-align: center;\n    }\n\n    .confirmar-baja__confirmar[_ngcontent-%COMP%] {\n      min-inline-size: min(13.5rem, 100%);\n    }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ConfirmarBajaComponent, [{
        type: Component,
        args: [{ selector: 'app-confirmar-baja', imports: [RouterLink], template: `
    <section class="auth auth--pantalla-completa">
      <div class="auth__card">
        <a routerLink="/" class="auth__brand" aria-label="Ir al inicio">
          <img src="/images/Logo.png" alt="DEPA" />
        </a>
        <h1 class="auth__title">Confirmar baja de cuenta</h1>
        @if (mensaje()) {
          <p class="auth__subtitle" role="status">{{ mensaje() }}</p>
        } @else {
          @if (error()) {
            <p class="auth__error" role="alert">{{ error() }}</p>
          }
          @if (token) {
            <p class="auth__subtitle">
              Al confirmar, perderás el acceso a tu cuenta.
              @if (esAnunciante) {
                Tus publicaciones dejarán de estar disponibles.
              }
              Tus datos e historial se conservarán. Si volvés a registrarte con el mismo email,
              podrás recuperar esta cuenta o crear una nueva.
            </p>
          }
        }
        <div class="confirmar-baja__acciones">
          @if (token && !mensaje()) {
            <button type="button" class="btn btn--primary confirmar-baja__confirmar" [disabled]="enviando()" (click)="confirmar()">
              {{ enviando() ? 'Confirmando…' : 'Confirmar baja de cuenta' }}
            </button>
          }
          <a routerLink="/" [class.btn]="mensaje()" [class.btn--primary]="mensaje()">Volver al inicio</a>
        </div>
      </div>
    </section>
  `, styles: [".auth {\r\n  min-height: calc(100dvh - 4rem);\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n  padding: 2.5rem 1rem 3rem;\r\n  background:\r\n    linear-gradient(180deg, rgba(10, 12, 20, 0.45) 0%, rgba(10, 12, 20, 0.75) 100%),\r\n    var(--auth-bg-image, none) center / cover no-repeat,\r\n    radial-gradient(circle at 20% 10%, rgba(216, 71, 30, 0.3), transparent 45%),\r\n    radial-gradient(circle at 85% 85%, rgba(14, 70, 161, 0.35), transparent 45%),\r\n    var(--color-dark);\r\n}\r\n\r\n.auth--pantalla-completa {\r\n  min-height: 100dvh;\r\n  box-sizing: border-box;\r\n  padding: 1rem;\r\n}\r\n\r\n.auth__card {\r\n  width: 100%;\r\n  max-width: 420px;\r\n  background: var(--color-surface);\r\n  border: 1px solid var(--color-border);\r\n  border-radius: var(--radius-lg);\r\n  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);\r\n  padding: 2.25rem 2rem;\r\n}\r\n\r\n.auth__brand {\r\n  display: block;\r\n  text-decoration: none;\r\n  text-align: center;\r\n  font-size: 1.3rem;\r\n  font-weight: 700;\r\n  letter-spacing: -0.01em;\r\n  color: var(--color-text);\r\n  margin-bottom: 1.25rem;\r\n}\r\n\r\n.auth__brand img {\r\n  display: block;\r\n  height: 44px;\r\n  width: auto;\r\n  margin: 0 auto;\r\n}\r\n\r\n.auth__title {\r\n  margin: 0 0 0.25rem;\r\n  font-size: 1.5rem;\r\n  font-weight: 800;\r\n  color: var(--color-text);\r\n  text-align: center;\r\n}\r\n\r\n.auth__subtitle {\r\n  margin: 0 0 1.75rem;\r\n  color: var(--color-text-muted);\r\n  font-size: 0.9rem;\r\n  text-align: center;\r\n}\r\n\r\n.auth__subtitle--error {\r\n  color: var(--color-danger);\r\n}\r\n\r\n.auth__form {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 1.1rem;\r\n}\r\n\r\n.auth__field {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 0.4rem;\r\n}\r\n\r\n.auth__field label {\r\n  font-size: 0.85rem;\r\n  font-weight: 600;\r\n  color: var(--color-text);\r\n}\r\n\r\n.auth__field input {\r\n  padding: 0.7rem 0.9rem;\r\n  border-radius: var(--radius-sm);\r\n  border: 1px solid var(--color-border);\r\n  font-size: 0.95rem;\r\n  color: var(--color-text);\r\n  background: #fff;\r\n}\r\n\r\n.auth__field input::placeholder {\r\n  color: #98a2b3;\r\n}\r\n\r\n.auth__field input:focus {\r\n  outline: none;\r\n  border-color: var(--color-primary);\r\n  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 25%, transparent);\r\n}\r\n\r\n.auth__hint {\r\n  font-size: 0.78rem;\r\n  color: var(--color-text-muted);\r\n}\r\n\r\n.auth__hint--error {\r\n  color: var(--color-danger);\r\n}\r\n\r\n.auth__error {\r\n  background: #fef2f2;\r\n  border: 1px solid var(--color-danger);\r\n  color: #b91c1c;\r\n  padding: 0.6rem 0.75rem;\r\n  border-radius: var(--radius-sm);\r\n  font-size: 0.85rem;\r\n}\r\n\r\n.btn {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 0.75rem 1.25rem;\r\n  border-radius: var(--radius-pill);\r\n  border: none;\r\n  font-weight: 700;\r\n  cursor: pointer;\r\n  font-size: 0.95rem;\r\n  text-decoration: none;\r\n}\r\n\r\n.btn--primary {\r\n  background: var(--color-accent);\r\n  color: #1a1200;\r\n  box-shadow: 0 8px 20px color-mix(in srgb, var(--color-accent) 45%, transparent);\r\n}\r\n\r\n.btn--primary:hover {\r\n  background: color-mix(in srgb, var(--color-accent) 88%, black);\r\n}\r\n\r\n.btn:disabled {\r\n  opacity: 0.6;\r\n  cursor: not-allowed;\r\n}\r\n", "\n    .confirmar-baja__acciones {\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      gap: 0.85rem;\n      text-align: center;\n    }\n\n    .confirmar-baja__confirmar {\n      min-inline-size: min(13.5rem, 100%);\n    }\n  "] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ConfirmarBajaComponent, { className: "ConfirmarBajaComponent", filePath: "src/app/features/auth/confirmar-baja/confirmar-baja.component.ts", lineNumber: 61 }); })();
