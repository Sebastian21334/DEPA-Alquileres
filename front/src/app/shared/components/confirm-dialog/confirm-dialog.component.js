import { ChangeDetectionStrategy, Component, computed, input, output, viewChild, } from '@angular/core';
import { LucideTriangleAlert, LucideX } from '@lucide/angular';
import * as i0 from "@angular/core";
const _c0 = ["dialogo"];
export class ConfirmDialogComponent {
    titulo = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "titulo" }] : /* istanbul ignore next */ []));
    mensaje = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mensaje" }] : /* istanbul ignore next */ []));
    textoConfirmar = input('Confirmar', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "textoConfirmar" }] : /* istanbul ignore next */ []));
    textoCancelar = input('Cancelar', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "textoCancelar" }] : /* istanbul ignore next */ []));
    tono = input('advertencia', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tono" }] : /* istanbul ignore next */ []));
    procesando = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "procesando" }] : /* istanbul ignore next */ []));
    identificador = input('confirm-dialog', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "identificador" }] : /* istanbul ignore next */ []));
    confirmar = output();
    cancelar = output();
    tituloId = computed(() => `${this.identificador()}-titulo`, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tituloId" }] : /* istanbul ignore next */ []));
    mensajeId = computed(() => `${this.identificador()}-mensaje`, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mensajeId" }] : /* istanbul ignore next */ []));
    dialogo = viewChild.required('dialogo', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "dialogo" }] : /* istanbul ignore next */ []));
    focoAnterior = null;
    abrir(disparador) {
        const dialogo = this.dialogo().nativeElement;
        if (dialogo.open)
            return;
        this.focoAnterior =
            disparador ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
        dialogo.showModal();
    }
    cerrar() {
        const dialogo = this.dialogo().nativeElement;
        if (!dialogo.open) {
            this.focoAnterior = null;
            return;
        }
        dialogo.close();
    }
    solicitarConfirmacion() {
        if (this.procesando())
            return;
        this.confirmar.emit();
    }
    solicitarCancelacion() {
        if (this.procesando())
            return;
        this.cancelar.emit();
    }
    alCancelar(event) {
        event.preventDefault();
        this.solicitarCancelacion();
    }
    alClicDialogo(event) {
        if (event.target !== this.dialogo().nativeElement)
            return;
        this.solicitarCancelacion();
    }
    alCerrar() {
        this.focoAnterior?.focus();
        this.focoAnterior = null;
    }
    static ɵfac = function ConfirmDialogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ConfirmDialogComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ConfirmDialogComponent, selectors: [["app-confirm-dialog"]], viewQuery: function ConfirmDialogComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.dialogo, _c0, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, inputs: { titulo: [1, "titulo"], mensaje: [1, "mensaje"], textoConfirmar: [1, "textoConfirmar"], textoCancelar: [1, "textoCancelar"], tono: [1, "tono"], procesando: [1, "procesando"], identificador: [1, "identificador"] }, outputs: { confirmar: "confirmar", cancelar: "cancelar" }, decls: 15, vars: 15, consts: [["dialogo", ""], ["aria-modal", "true", 1, "confirm-dialog", 3, "cancel", "close", "click"], ["type", "button", "aria-label", "Cerrar", 1, "confirm-dialog__close", 3, "click", "disabled"], ["lucideX", "", "aria-hidden", "true", 3, "size"], ["aria-hidden", "true", 1, "confirm-dialog__icon"], ["lucideTriangleAlert", "", 3, "size"], [3, "id"], [1, "confirm-dialog__actions"], ["type", "button", "autofocus", "", 1, "acct-btn", "acct-btn--ghost", 3, "click", "disabled"], ["type", "button", 1, "acct-btn", "confirm-dialog__confirm", 3, "click", "disabled"]], template: function ConfirmDialogComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "dialog", 1, 0);
            i0.ɵɵlistener("cancel", function ConfirmDialogComponent_Template_dialog_cancel_0_listener($event) { return ctx.alCancelar($event); })("close", function ConfirmDialogComponent_Template_dialog_close_0_listener() { return ctx.alCerrar(); })("click", function ConfirmDialogComponent_Template_dialog_click_0_listener($event) { return ctx.alClicDialogo($event); });
            i0.ɵɵelementStart(2, "button", 2);
            i0.ɵɵlistener("click", function ConfirmDialogComponent_Template_button_click_2_listener() { return ctx.solicitarCancelacion(); });
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(3, "svg", 3);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(4, "div", 4);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(5, "svg", 5);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(6, "h2", 6);
            i0.ɵɵtext(7);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "p", 6);
            i0.ɵɵtext(9);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "div", 7)(11, "button", 8);
            i0.ɵɵlistener("click", function ConfirmDialogComponent_Template_button_click_11_listener() { return ctx.solicitarCancelacion(); });
            i0.ɵɵtext(12);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(13, "button", 9);
            i0.ɵɵlistener("click", function ConfirmDialogComponent_Template_button_click_13_listener() { return ctx.solicitarConfirmacion(); });
            i0.ɵɵtext(14);
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵclassProp("confirm-dialog--peligro", ctx.tono() === "peligro");
            i0.ɵɵattribute("aria-labelledby", ctx.tituloId())("aria-describedby", ctx.mensajeId());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.procesando());
            i0.ɵɵadvance();
            i0.ɵɵproperty("size", 20);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("size", 28);
            i0.ɵɵadvance();
            i0.ɵɵproperty("id", ctx.tituloId());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(ctx.titulo());
            i0.ɵɵadvance();
            i0.ɵɵproperty("id", ctx.mensajeId());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(ctx.mensaje());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", ctx.procesando());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.textoCancelar(), " ");
            i0.ɵɵadvance();
            i0.ɵɵproperty("disabled", ctx.procesando());
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", ctx.procesando() ? "Procesando\u2026" : ctx.textoConfirmar(), " ");
        } }, dependencies: [LucideTriangleAlert, LucideX], styles: ["[_nghost-%COMP%] {\r\n  display: contents;\r\n}\r\n\r\n.confirm-dialog[_ngcontent-%COMP%] {\r\n  position: fixed;\r\n  inset: 0;\r\n  width: min(32rem, calc(100% - 2rem));\r\n  max-height: calc(100dvh - 2rem);\r\n  margin: auto;\r\n  padding: clamp(1.25rem, 4vw, 1.75rem);\r\n  border: 1px solid var(--%NS%color-border);\r\n  border-radius: 18px;\r\n  background: #fff;\r\n  color: var(--%NS%color-text);\r\n  box-shadow: 0 20px 48px #0f172a40;\r\n  overflow: auto;\r\n  overflow-wrap: anywhere;\r\n}\r\n.confirm-dialog[_ngcontent-%COMP%]::backdrop {\r\n  background: #10182880;\r\n}\r\n.confirm-dialog__close[_ngcontent-%COMP%] {\r\n  position: absolute;\r\n  top: 0.85rem;\r\n  right: 0.85rem;\r\n  display: grid;\r\n  place-items: center;\r\n  width: 42px;\r\n  height: 42px;\r\n  border: 0;\r\n  border-radius: 8px;\r\n  background: transparent;\r\n  color: var(--%NS%color-text);\r\n  cursor: pointer;\r\n}\r\n.confirm-dialog__close[_ngcontent-%COMP%]:hover:not(:disabled) {\r\n  background: #f2f4f7;\r\n}\r\n.confirm-dialog__close[_ngcontent-%COMP%]:focus-visible {\r\n  outline: 2px solid var(--%NS%color-primary);\r\n  outline-offset: 2px;\r\n}\r\n.confirm-dialog__icon[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  place-items: center;\r\n  width: 52px;\r\n  height: 52px;\r\n  border-radius: 14px;\r\n  background: #fff7e8;\r\n  color: #a35a00;\r\n}\r\n.confirm-dialog--peligro[_ngcontent-%COMP%]   .confirm-dialog__icon[_ngcontent-%COMP%] {\r\n  background: #ffeded;\r\n  color: #b91c1c;\r\n}\r\n.confirm-dialog[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%] {\r\n  margin: 0.9rem 0 0.45rem;\r\n  padding-right: 2rem;\r\n  font-size: clamp(1.25rem, 3vw, 1.5rem);\r\n  line-height: 1.2;\r\n}\r\n.confirm-dialog[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\r\n  margin: 0;\r\n  color: var(--%NS%color-text-muted);\r\n  line-height: 1.55;\r\n}\r\n.confirm-dialog__actions[_ngcontent-%COMP%] {\r\n  display: flex;\r\n  justify-content: flex-end;\r\n  flex-wrap: wrap;\r\n  gap: 0.75rem;\r\n  margin-top: 1.5rem;\r\n}\r\n.confirm-dialog__confirm[_ngcontent-%COMP%] {\r\n  background: #17324a;\r\n  color: #fff;\r\n}\r\n.confirm-dialog__confirm[_ngcontent-%COMP%]:hover:not(:disabled) {\r\n  background: #0f2537;\r\n}\r\n.confirm-dialog--peligro[_ngcontent-%COMP%]   .confirm-dialog__confirm[_ngcontent-%COMP%] {\r\n  background: var(--%NS%color-danger);\r\n}\r\n.confirm-dialog--peligro[_ngcontent-%COMP%]   .confirm-dialog__confirm[_ngcontent-%COMP%]:hover:not(:disabled) {\r\n  background: #b91c1c;\r\n}\r\n.confirm-dialog[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:focus-visible {\r\n  outline: 2px solid var(--%NS%color-primary);\r\n  outline-offset: 2px;\r\n}\r\n@media (max-width: 480px) {\r\n  .confirm-dialog__actions[_ngcontent-%COMP%] {\r\n    flex-direction: column;\r\n  }\r\n  .confirm-dialog__actions[_ngcontent-%COMP%]   .acct-btn[_ngcontent-%COMP%] {\r\n    width: 100%;\r\n  }\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ConfirmDialogComponent, [{
        type: Component,
        args: [{ selector: 'app-confirm-dialog', standalone: true, imports: [LucideTriangleAlert, LucideX], changeDetection: ChangeDetectionStrategy.OnPush, template: "<dialog\r\n  #dialogo\r\n  class=\"confirm-dialog\"\r\n  [class.confirm-dialog--peligro]=\"tono() === 'peligro'\"\r\n  aria-modal=\"true\"\r\n  [attr.aria-labelledby]=\"tituloId()\"\r\n  [attr.aria-describedby]=\"mensajeId()\"\r\n  (cancel)=\"alCancelar($event)\"\r\n  (close)=\"alCerrar()\"\r\n  (click)=\"alClicDialogo($event)\"\r\n>\r\n  <button\r\n    type=\"button\"\r\n    class=\"confirm-dialog__close\"\r\n    aria-label=\"Cerrar\"\r\n    [disabled]=\"procesando()\"\r\n    (click)=\"solicitarCancelacion()\"\r\n  >\r\n    <svg lucideX [size]=\"20\" aria-hidden=\"true\"></svg>\r\n  </button>\r\n  <div class=\"confirm-dialog__icon\" aria-hidden=\"true\">\r\n    <svg lucideTriangleAlert [size]=\"28\"></svg>\r\n  </div>\r\n  <h2 [id]=\"tituloId()\">{{ titulo() }}</h2>\r\n  <p [id]=\"mensajeId()\">{{ mensaje() }}</p>\r\n  <div class=\"confirm-dialog__actions\">\r\n    <button\r\n      type=\"button\"\r\n      class=\"acct-btn acct-btn--ghost\"\r\n      [disabled]=\"procesando()\"\r\n      (click)=\"solicitarCancelacion()\"\r\n      autofocus\r\n    >\r\n      {{ textoCancelar() }}\r\n    </button>\r\n    <button\r\n      type=\"button\"\r\n      class=\"acct-btn confirm-dialog__confirm\"\r\n      [disabled]=\"procesando()\"\r\n      (click)=\"solicitarConfirmacion()\"\r\n    >\r\n      {{ procesando() ? 'Procesando\u2026' : textoConfirmar() }}\r\n    </button>\r\n  </div>\r\n</dialog>\r\n", styles: [":host {\r\n  display: contents;\r\n}\r\n\r\n.confirm-dialog {\r\n  position: fixed;\r\n  inset: 0;\r\n  width: min(32rem, calc(100% - 2rem));\r\n  max-height: calc(100dvh - 2rem);\r\n  margin: auto;\r\n  padding: clamp(1.25rem, 4vw, 1.75rem);\r\n  border: 1px solid var(--color-border);\r\n  border-radius: 18px;\r\n  background: #fff;\r\n  color: var(--color-text);\r\n  box-shadow: 0 20px 48px #0f172a40;\r\n  overflow: auto;\r\n  overflow-wrap: anywhere;\r\n}\r\n.confirm-dialog::backdrop {\r\n  background: #10182880;\r\n}\r\n.confirm-dialog__close {\r\n  position: absolute;\r\n  top: 0.85rem;\r\n  right: 0.85rem;\r\n  display: grid;\r\n  place-items: center;\r\n  width: 42px;\r\n  height: 42px;\r\n  border: 0;\r\n  border-radius: 8px;\r\n  background: transparent;\r\n  color: var(--color-text);\r\n  cursor: pointer;\r\n}\r\n.confirm-dialog__close:hover:not(:disabled) {\r\n  background: #f2f4f7;\r\n}\r\n.confirm-dialog__close:focus-visible {\r\n  outline: 2px solid var(--color-primary);\r\n  outline-offset: 2px;\r\n}\r\n.confirm-dialog__icon {\r\n  display: grid;\r\n  place-items: center;\r\n  width: 52px;\r\n  height: 52px;\r\n  border-radius: 14px;\r\n  background: #fff7e8;\r\n  color: #a35a00;\r\n}\r\n.confirm-dialog--peligro .confirm-dialog__icon {\r\n  background: #ffeded;\r\n  color: #b91c1c;\r\n}\r\n.confirm-dialog h2 {\r\n  margin: 0.9rem 0 0.45rem;\r\n  padding-right: 2rem;\r\n  font-size: clamp(1.25rem, 3vw, 1.5rem);\r\n  line-height: 1.2;\r\n}\r\n.confirm-dialog p {\r\n  margin: 0;\r\n  color: var(--color-text-muted);\r\n  line-height: 1.55;\r\n}\r\n.confirm-dialog__actions {\r\n  display: flex;\r\n  justify-content: flex-end;\r\n  flex-wrap: wrap;\r\n  gap: 0.75rem;\r\n  margin-top: 1.5rem;\r\n}\r\n.confirm-dialog__confirm {\r\n  background: #17324a;\r\n  color: #fff;\r\n}\r\n.confirm-dialog__confirm:hover:not(:disabled) {\r\n  background: #0f2537;\r\n}\r\n.confirm-dialog--peligro .confirm-dialog__confirm {\r\n  background: var(--color-danger);\r\n}\r\n.confirm-dialog--peligro .confirm-dialog__confirm:hover:not(:disabled) {\r\n  background: #b91c1c;\r\n}\r\n.confirm-dialog button:focus-visible {\r\n  outline: 2px solid var(--color-primary);\r\n  outline-offset: 2px;\r\n}\r\n@media (max-width: 480px) {\r\n  .confirm-dialog__actions {\r\n    flex-direction: column;\r\n  }\r\n  .confirm-dialog__actions .acct-btn {\r\n    width: 100%;\r\n  }\r\n}\r\n"] }]
    }], null, { titulo: [{ type: i0.Input, args: [{ isSignal: true, alias: "titulo", required: true }] }], mensaje: [{ type: i0.Input, args: [{ isSignal: true, alias: "mensaje", required: true }] }], textoConfirmar: [{ type: i0.Input, args: [{ isSignal: true, alias: "textoConfirmar", required: false }] }], textoCancelar: [{ type: i0.Input, args: [{ isSignal: true, alias: "textoCancelar", required: false }] }], tono: [{ type: i0.Input, args: [{ isSignal: true, alias: "tono", required: false }] }], procesando: [{ type: i0.Input, args: [{ isSignal: true, alias: "procesando", required: false }] }], identificador: [{ type: i0.Input, args: [{ isSignal: true, alias: "identificador", required: false }] }], confirmar: [{ type: i0.Output, args: ["confirmar"] }], cancelar: [{ type: i0.Output, args: ["cancelar"] }], dialogo: [{ type: i0.ViewChild, args: ['dialogo', { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ConfirmDialogComponent, { className: "ConfirmDialogComponent", filePath: "src/app/shared/components/confirm-dialog/confirm-dialog.component.ts", lineNumber: 22 }); })();
