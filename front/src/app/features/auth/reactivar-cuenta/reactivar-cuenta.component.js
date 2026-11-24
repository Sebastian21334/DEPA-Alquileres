import { Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiError } from '../../../core/interceptors/api-error';
import * as i0 from "@angular/core";
function ReactivarCuentaComponent_Conditional_6_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 7);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.error());
} }
function ReactivarCuentaComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p", 5);
    i0.ɵɵtext(1, "Confirm\u00E1 el alta para volver a usar tu cuenta. Despu\u00E9s podr\u00E1s iniciar sesi\u00F3n o recuperar tu contrase\u00F1a.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "div", 6);
    i0.ɵɵconditionalCreate(3, ReactivarCuentaComponent_Conditional_6_Conditional_3_Template, 2, 1, "p", 7);
    i0.ɵɵelementStart(4, "button", 8);
    i0.ɵɵlistener("click", function ReactivarCuentaComponent_Conditional_6_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.confirmar()); });
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.error() ? 3 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.enviando());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.enviando() ? "Confirmando\u2026" : "Confirmar alta", " ");
} }
function ReactivarCuentaComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 9);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "a", 10);
    i0.ɵɵtext(3, "Volver al registro");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.error());
} }
export class ReactivarCuentaComponent {
    auth = inject(AuthService);
    location = inject(Location);
    router = inject(Router);
    token = inject(ActivatedRoute).snapshot.fragment ?? '';
    enlaceValido = signal(/^[a-f0-9]{64}$/.test(this.token), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enlaceValido" }] : /* istanbul ignore next */ []));
    enviando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enviando" }] : /* istanbul ignore next */ []));
    error = signal(this.enlaceValido() ? '' : 'Abrí el enlace de recuperación que recibiste por email.', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    confirmar() {
        if (this.enviando() || !this.enlaceValido())
            return;
        this.enviando.set(true);
        this.error.set('');
        this.auth.confirmarReactivacion(this.token).subscribe({
            next: () => {
                this.location.replaceState('/reactivar-cuenta');
                void this.router.navigate(['/login'], { queryParams: { cuentaReactivada: '1' }, replaceUrl: true });
            },
            error: (err) => {
                this.error.set(err.message);
                if (err instanceof ApiError && (err.codigo === 'ENLACE_REACTIVACION_INVALIDO' || err.status === 409))
                    this.enlaceValido.set(false);
                this.enviando.set(false);
            },
        });
    }
    static ɵfac = function ReactivarCuentaComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ReactivarCuentaComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ReactivarCuentaComponent, selectors: [["app-reactivar-cuenta"]], decls: 8, vars: 1, consts: [[1, "auth", "auth--pantalla-completa"], [1, "auth__card"], ["routerLink", "/", "aria-label", "Ir al inicio", 1, "auth__brand"], ["src", "/images/Logo.png", "alt", "DEPA"], [1, "auth__title"], [1, "auth__subtitle"], [1, "auth__form"], ["role", "alert", 1, "auth__error"], ["type", "button", 1, "btn", "btn--primary", 3, "click", "disabled"], ["role", "alert", 1, "auth__subtitle", "auth__subtitle--error"], ["routerLink", "/registro", 1, "btn", "btn--primary"]], template: function ReactivarCuentaComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "section", 0)(1, "div", 1)(2, "a", 2);
            i0.ɵɵelement(3, "img", 3);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(4, "h1", 4);
            i0.ɵɵtext(5, "Recuper\u00E1 tu cuenta");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(6, ReactivarCuentaComponent_Conditional_6_Template, 6, 3)(7, ReactivarCuentaComponent_Conditional_7_Template, 4, 1);
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵadvance(6);
            i0.ɵɵconditional(ctx.enlaceValido() ? 6 : 7);
        } }, dependencies: [RouterLink], styles: [".auth[_ngcontent-%COMP%] {\r\n  min-height: calc(100dvh - 4rem);\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n  padding: 2.5rem 1rem 3rem;\r\n  background:\r\n    linear-gradient(180deg, rgba(10, 12, 20, 0.45) 0%, rgba(10, 12, 20, 0.75) 100%),\r\n    var(--%NS%auth-bg-image, none) center / cover no-repeat,\r\n    radial-gradient(circle at 20% 10%, rgba(216, 71, 30, 0.3), transparent 45%),\r\n    radial-gradient(circle at 85% 85%, rgba(14, 70, 161, 0.35), transparent 45%),\r\n    var(--%NS%color-dark);\r\n}\r\n\r\n.auth--pantalla-completa[_ngcontent-%COMP%] {\r\n  min-height: 100dvh;\r\n  box-sizing: border-box;\r\n  padding: 1rem;\r\n}\r\n\r\n.auth__card[_ngcontent-%COMP%] {\r\n  width: 100%;\r\n  max-width: 420px;\r\n  background: var(--%NS%color-surface);\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: var(--%NS%radius-lg);\r\n  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);\r\n  padding: 2.25rem 2rem;\r\n}\r\n\r\n.auth__brand[_ngcontent-%COMP%] {\r\n  display: block;\r\n  text-decoration: none;\r\n  text-align: center;\r\n  font-size: 1.3rem;\r\n  font-weight: 700;\r\n  letter-spacing: -0.01em;\r\n  color: var(--%NS%color-text);\r\n  margin-bottom: 1.25rem;\r\n}\r\n\r\n.auth__brand[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] {\r\n  display: block;\r\n  height: 44px;\r\n  width: auto;\r\n  margin: 0 auto;\r\n}\r\n\r\n.auth__title[_ngcontent-%COMP%] {\r\n  margin: 0 0 0.25rem;\r\n  font-size: 1.5rem;\r\n  font-weight: 800;\r\n  color: var(--%NS%color-text);\r\n  text-align: center;\r\n}\r\n\r\n.auth__subtitle[_ngcontent-%COMP%] {\r\n  margin: 0 0 1.75rem;\r\n  color: var(--%NS%color-text-muted);\r\n  font-size: 0.9rem;\r\n  text-align: center;\r\n}\r\n\r\n.auth__subtitle--error[_ngcontent-%COMP%] {\r\n  color: var(--%NS%color-danger);\r\n}\r\n\r\n.auth__form[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 1.1rem;\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 0.4rem;\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%]   label[_ngcontent-%COMP%] {\r\n  font-size: 0.85rem;\r\n  font-weight: 600;\r\n  color: var(--%NS%color-text);\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\r\n  padding: 0.7rem 0.9rem;\r\n  border-radius: var(--%NS%radius-sm);\r\n  border: 1px solid var(--%NS%color-border);\r\n  font-size: 0.95rem;\r\n  color: var(--%NS%color-text);\r\n  background: #fff;\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]::placeholder {\r\n  color: #98a2b3;\r\n}\r\n\r\n.auth__field[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus {\r\n  outline: none;\r\n  border-color: var(--%NS%color-primary);\r\n  box-shadow: 0 0 0 3px color-mix(in srgb, var(--%NS%color-primary) 25%, transparent);\r\n}\r\n\r\n.auth__hint[_ngcontent-%COMP%] {\r\n  font-size: 0.78rem;\r\n  color: var(--%NS%color-text-muted);\r\n}\r\n\r\n.auth__hint--error[_ngcontent-%COMP%] {\r\n  color: var(--%NS%color-danger);\r\n}\r\n\r\n.auth__error[_ngcontent-%COMP%] {\r\n  background: #fef2f2;\r\n  border: 1px solid var(--%NS%color-danger);\r\n  color: #b91c1c;\r\n  padding: 0.6rem 0.75rem;\r\n  border-radius: var(--%NS%radius-sm);\r\n  font-size: 0.85rem;\r\n}\r\n\r\n.btn[_ngcontent-%COMP%] {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 0.75rem 1.25rem;\r\n  border-radius: var(--%NS%radius-pill);\r\n  border: none;\r\n  font-weight: 700;\r\n  cursor: pointer;\r\n  font-size: 0.95rem;\r\n  text-decoration: none;\r\n}\r\n\r\n.btn--primary[_ngcontent-%COMP%] {\r\n  background: var(--%NS%color-accent);\r\n  color: #1a1200;\r\n  box-shadow: 0 8px 20px color-mix(in srgb, var(--%NS%color-accent) 45%, transparent);\r\n}\r\n\r\n.btn--%NS%primary[_ngcontent-%COMP%]:hover {\r\n  background: color-mix(in srgb, var(--%NS%color-accent) 88%, black);\r\n}\r\n\r\n.btn[_ngcontent-%COMP%]:disabled {\r\n  opacity: 0.6;\r\n  cursor: not-allowed;\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ReactivarCuentaComponent, [{
        type: Component,
        args: [{ selector: 'app-reactivar-cuenta', imports: [RouterLink], template: `
    <section class="auth auth--pantalla-completa">
      <div class="auth__card">
        <a routerLink="/" class="auth__brand" aria-label="Ir al inicio"><img src="/images/Logo.png" alt="DEPA" /></a>
        <h1 class="auth__title">Recuperá tu cuenta</h1>
        @if (enlaceValido()) {
          <p class="auth__subtitle">Confirmá el alta para volver a usar tu cuenta. Después podrás iniciar sesión o recuperar tu contraseña.</p>
          <div class="auth__form">
            @if (error()) { <p class="auth__error" role="alert">{{ error() }}</p> }
            <button type="button" class="btn btn--primary" [disabled]="enviando()" (click)="confirmar()">
              {{ enviando() ? 'Confirmando…' : 'Confirmar alta' }}
            </button>
          </div>
        } @else {
          <p class="auth__subtitle auth__subtitle--error" role="alert">{{ error() }}</p>
          <a routerLink="/registro" class="btn btn--primary">Volver al registro</a>
        }
      </div>
    </section>
  `, styles: [".auth {\r\n  min-height: calc(100dvh - 4rem);\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n  padding: 2.5rem 1rem 3rem;\r\n  background:\r\n    linear-gradient(180deg, rgba(10, 12, 20, 0.45) 0%, rgba(10, 12, 20, 0.75) 100%),\r\n    var(--auth-bg-image, none) center / cover no-repeat,\r\n    radial-gradient(circle at 20% 10%, rgba(216, 71, 30, 0.3), transparent 45%),\r\n    radial-gradient(circle at 85% 85%, rgba(14, 70, 161, 0.35), transparent 45%),\r\n    var(--color-dark);\r\n}\r\n\r\n.auth--pantalla-completa {\r\n  min-height: 100dvh;\r\n  box-sizing: border-box;\r\n  padding: 1rem;\r\n}\r\n\r\n.auth__card {\r\n  width: 100%;\r\n  max-width: 420px;\r\n  background: var(--color-surface);\r\n  border: 1px solid var(--color-border);\r\n  border-radius: var(--radius-lg);\r\n  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);\r\n  padding: 2.25rem 2rem;\r\n}\r\n\r\n.auth__brand {\r\n  display: block;\r\n  text-decoration: none;\r\n  text-align: center;\r\n  font-size: 1.3rem;\r\n  font-weight: 700;\r\n  letter-spacing: -0.01em;\r\n  color: var(--color-text);\r\n  margin-bottom: 1.25rem;\r\n}\r\n\r\n.auth__brand img {\r\n  display: block;\r\n  height: 44px;\r\n  width: auto;\r\n  margin: 0 auto;\r\n}\r\n\r\n.auth__title {\r\n  margin: 0 0 0.25rem;\r\n  font-size: 1.5rem;\r\n  font-weight: 800;\r\n  color: var(--color-text);\r\n  text-align: center;\r\n}\r\n\r\n.auth__subtitle {\r\n  margin: 0 0 1.75rem;\r\n  color: var(--color-text-muted);\r\n  font-size: 0.9rem;\r\n  text-align: center;\r\n}\r\n\r\n.auth__subtitle--error {\r\n  color: var(--color-danger);\r\n}\r\n\r\n.auth__form {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 1.1rem;\r\n}\r\n\r\n.auth__field {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 0.4rem;\r\n}\r\n\r\n.auth__field label {\r\n  font-size: 0.85rem;\r\n  font-weight: 600;\r\n  color: var(--color-text);\r\n}\r\n\r\n.auth__field input {\r\n  padding: 0.7rem 0.9rem;\r\n  border-radius: var(--radius-sm);\r\n  border: 1px solid var(--color-border);\r\n  font-size: 0.95rem;\r\n  color: var(--color-text);\r\n  background: #fff;\r\n}\r\n\r\n.auth__field input::placeholder {\r\n  color: #98a2b3;\r\n}\r\n\r\n.auth__field input:focus {\r\n  outline: none;\r\n  border-color: var(--color-primary);\r\n  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 25%, transparent);\r\n}\r\n\r\n.auth__hint {\r\n  font-size: 0.78rem;\r\n  color: var(--color-text-muted);\r\n}\r\n\r\n.auth__hint--error {\r\n  color: var(--color-danger);\r\n}\r\n\r\n.auth__error {\r\n  background: #fef2f2;\r\n  border: 1px solid var(--color-danger);\r\n  color: #b91c1c;\r\n  padding: 0.6rem 0.75rem;\r\n  border-radius: var(--radius-sm);\r\n  font-size: 0.85rem;\r\n}\r\n\r\n.btn {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  padding: 0.75rem 1.25rem;\r\n  border-radius: var(--radius-pill);\r\n  border: none;\r\n  font-weight: 700;\r\n  cursor: pointer;\r\n  font-size: 0.95rem;\r\n  text-decoration: none;\r\n}\r\n\r\n.btn--primary {\r\n  background: var(--color-accent);\r\n  color: #1a1200;\r\n  box-shadow: 0 8px 20px color-mix(in srgb, var(--color-accent) 45%, transparent);\r\n}\r\n\r\n.btn--primary:hover {\r\n  background: color-mix(in srgb, var(--color-accent) 88%, black);\r\n}\r\n\r\n.btn:disabled {\r\n  opacity: 0.6;\r\n  cursor: not-allowed;\r\n}\r\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ReactivarCuentaComponent, { className: "ReactivarCuentaComponent", filePath: "src/app/features/auth/reactivar-cuenta/reactivar-cuenta.component.ts", lineNumber: 32 }); })();
