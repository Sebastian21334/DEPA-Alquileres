import { Component, input, model, signal } from '@angular/core';
import { LucideFileText, LucideUpload } from '@lucide/angular';
import * as i0 from "@angular/core";
function CargaComprobanteComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 2);
    i0.ɵɵtext(1, " *");
    i0.ɵɵelementEnd();
} }
function CargaComprobanteComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 3);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 6);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 7);
    i0.ɵɵlistener("click", function CargaComprobanteComponent_Conditional_3_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.quitar()); });
    i0.ɵɵtext(5, "Quitar");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const elegido_r3 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 18);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", elegido_r3.name, " \u00B7 ", ctx_r1.tamano(elegido_r3.size));
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.deshabilitado());
} }
function CargaComprobanteComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 8);
    i0.ɵɵlistener("dragover", function CargaComprobanteComponent_Conditional_4_Template_label_dragover_0_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.arrastrar($event)); })("dragleave", function CargaComprobanteComponent_Conditional_4_Template_label_dragleave_0_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.arrastrando.set(false)); })("drop", function CargaComprobanteComponent_Conditional_4_Template_label_drop_0_listener($event) { i0.ɵɵrestoreView(_r4); const entrada_r5 = i0.ɵɵreference(2); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.soltar($event, entrada_r5)); });
    i0.ɵɵelementStart(1, "input", 9, 0);
    i0.ɵɵlistener("change", function CargaComprobanteComponent_Conditional_4_Template_input_change_1_listener() { i0.ɵɵrestoreView(_r4); const entrada_r5 = i0.ɵɵreference(2); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.elegir(entrada_r5.files?.[0] ?? null, entrada_r5)); });
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(3, "svg", 10);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "span", 11);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span", 12);
    i0.ɵɵtext(7, "PDF, JPG o PNG de hasta 5 MB");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("carga__zona--arrastrando", ctx_r1.arrastrando())("carga__zona--deshabilitada", ctx_r1.deshabilitado());
    i0.ɵɵadvance();
    i0.ɵɵproperty("id", ctx_r1.id)("disabled", ctx_r1.deshabilitado());
    i0.ɵɵattribute("aria-labelledby", ctx_r1.id + "-etiqueta " + ctx_r1.id + "-accion")("aria-describedby", ctx_r1.id + "-ayuda")("aria-invalid", !!ctx_r1.error());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 20);
    i0.ɵɵadvance();
    i0.ɵɵproperty("id", ctx_r1.id + "-accion");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.accion());
    i0.ɵɵadvance();
    i0.ɵɵproperty("id", ctx_r1.id + "-ayuda");
} }
function CargaComprobanteComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 5);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.error());
} }
/** Mismo límite que el back. */
export const MAX_BYTES_COMPROBANTE = 5 * 1024 * 1024;
const TIPOS = ['application/pdf', 'image/jpeg', 'image/png'];
const EXTENSIONES = /\.(pdf|jpe?g|png)$/i;
let siguienteId = 0;
/**
 * Elige el comprobante de una transferencia (PDF, JPG o PNG de hasta 5 MB).
 * Valida antes de subir; el back vuelve a validar el contenido real del archivo.
 * Es la misma zona, con el mismo texto, en el reembolso y en el pago al anunciante.
 * También la usan las constancias de la solicitud de inmobiliaria (mismos tipos y tamaño).
 */
export class CargaComprobanteComponent {
    archivo = model(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "archivo" }] : /* istanbul ignore next */ []));
    etiqueta = input('Comprobante de la transferencia', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "etiqueta" }] : /* istanbul ignore next */ []));
    /** La solicitud de inmobiliaria usa la misma zona para sus constancias. */
    accion = input('Elegí o arrastrá el comprobante', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "accion" }] : /* istanbul ignore next */ []));
    requerido = input(true, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "requerido" }] : /* istanbul ignore next */ []));
    deshabilitado = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "deshabilitado" }] : /* istanbul ignore next */ []));
    error = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    arrastrando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "arrastrando" }] : /* istanbul ignore next */ []));
    id = `comprobante-${++siguienteId}`;
    arrastrar(evento) {
        if (this.deshabilitado())
            return;
        evento.preventDefault();
        this.arrastrando.set(true);
    }
    soltar(evento, entrada) {
        evento.preventDefault();
        this.arrastrando.set(false);
        if (this.deshabilitado())
            return;
        this.elegir(evento.dataTransfer?.files?.[0] ?? null, entrada);
    }
    elegir(elegido, entrada) {
        this.error.set('');
        if (!elegido) {
            this.archivo.set(null);
            return;
        }
        if (!TIPOS.includes(elegido.type) && !EXTENSIONES.test(elegido.name)) {
            this.rechazar(entrada, 'El archivo tiene que ser un PDF, JPG o PNG.');
            return;
        }
        if (elegido.size > MAX_BYTES_COMPROBANTE) {
            this.rechazar(entrada, 'El archivo puede pesar hasta 5 MB.');
            return;
        }
        this.archivo.set(elegido);
    }
    quitar() {
        this.archivo.set(null);
        this.error.set('');
    }
    tamano(bytes) {
        return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    }
    rechazar(entrada, mensaje) {
        // Sin limpiar el campo, volver a elegir el mismo archivo no dispararía el cambio.
        entrada.value = '';
        this.archivo.set(null);
        this.error.set(mensaje);
    }
    static ɵfac = function CargaComprobanteComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CargaComprobanteComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CargaComprobanteComponent, selectors: [["app-carga-comprobante"]], inputs: { archivo: [1, "archivo"], etiqueta: [1, "etiqueta"], accion: [1, "accion"], requerido: [1, "requerido"], deshabilitado: [1, "deshabilitado"] }, outputs: { archivo: "archivoChange" }, decls: 6, vars: 5, consts: [["entrada", ""], [1, "carga__etiqueta", 3, "id"], ["aria-hidden", "true"], [1, "carga__elegido"], [1, "carga__zona", 3, "carga__zona--arrastrando", "carga__zona--deshabilitada"], ["role", "alert", 1, "carga__error"], ["lucideFileText", "", "aria-hidden", "true", 3, "size"], ["type", "button", 3, "click", "disabled"], [1, "carga__zona", 3, "dragover", "dragleave", "drop"], ["type", "file", "accept", "application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png", 1, "carga__entrada", 3, "change", "id", "disabled"], ["lucideUpload", "", "aria-hidden", "true", 3, "size"], [1, "carga__accion", 3, "id"], [1, "carga__ayuda", 3, "id"]], template: function CargaComprobanteComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "span", 1);
            i0.ɵɵtext(1);
            i0.ɵɵconditionalCreate(2, CargaComprobanteComponent_Conditional_2_Template, 2, 0, "span", 2);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(3, CargaComprobanteComponent_Conditional_3_Template, 6, 4, "div", 3)(4, CargaComprobanteComponent_Conditional_4_Template, 8, 13, "label", 4);
            i0.ɵɵconditionalCreate(5, CargaComprobanteComponent_Conditional_5_Template, 2, 1, "p", 5);
        } if (rf & 2) {
            let tmp_3_0;
            i0.ɵɵproperty("id", ctx.id + "-etiqueta");
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(ctx.etiqueta());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.requerido() ? 2 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_3_0 = ctx.archivo()) ? 3 : 4, tmp_3_0);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.error() ? 5 : -1);
        } }, dependencies: [LucideFileText, LucideUpload], styles: ["@use 'zona-carga';\r\n\r\n[_nghost-%COMP%] { display: grid; gap: .4rem; }\r\n.carga__elegido[_ngcontent-%COMP%] {\r\n  display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; padding: .6rem .75rem;\r\n  border: 1px solid #b7dcc5; border-radius: .6rem; background: #eef8f2; overflow-wrap: anywhere; font-size: .9rem;\r\n}\r\n.carga__elegido[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { flex: 1; min-width: 0; }\r\n.carga__elegido[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] { padding: .25rem .6rem; border: 1px solid #c8d2e0; border-radius: .4rem; background: #fff; cursor: pointer; }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CargaComprobanteComponent, [{
        type: Component,
        args: [{ selector: 'app-carga-comprobante', imports: [LucideFileText, LucideUpload], template: `
    <span class="carga__etiqueta" [id]="id + '-etiqueta'">{{ etiqueta() }}@if (requerido()) { <span aria-hidden="true"> *</span> }</span>
    @if (archivo(); as elegido) {
      <div class="carga__elegido">
        <svg lucideFileText [size]="18" aria-hidden="true"></svg>
        <span>{{ elegido.name }} · {{ tamano(elegido.size) }}</span>
        <button type="button" [disabled]="deshabilitado()" (click)="quitar()">Quitar</button>
      </div>
    } @else {
      <label class="carga__zona" [class.carga__zona--arrastrando]="arrastrando()" [class.carga__zona--deshabilitada]="deshabilitado()"
        (dragover)="arrastrar($event)" (dragleave)="arrastrando.set(false)" (drop)="soltar($event, entrada)">
        <input #entrada class="carga__entrada" [id]="id" type="file" accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"
          [disabled]="deshabilitado()" [attr.aria-labelledby]="id + '-etiqueta ' + id + '-accion'"
          [attr.aria-describedby]="id + '-ayuda'" [attr.aria-invalid]="!!error()"
          (change)="elegir(entrada.files?.[0] ?? null, entrada)" />
        <svg lucideUpload [size]="20" aria-hidden="true"></svg>
        <span class="carga__accion" [id]="id + '-accion'">{{ accion() }}</span>
        <span class="carga__ayuda" [id]="id + '-ayuda'">PDF, JPG o PNG de hasta 5 MB</span>
      </label>
    }
    @if (error()) { <p class="carga__error" role="alert">{{ error() }}</p> }
  `, styles: ["@use 'zona-carga';\r\n\r\n:host { display: grid; gap: .4rem; }\r\n.carga__elegido {\r\n  display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; padding: .6rem .75rem;\r\n  border: 1px solid #b7dcc5; border-radius: .6rem; background: #eef8f2; overflow-wrap: anywhere; font-size: .9rem;\r\n}\r\n.carga__elegido span { flex: 1; min-width: 0; }\r\n.carga__elegido button { padding: .25rem .6rem; border: 1px solid #c8d2e0; border-radius: .4rem; background: #fff; cursor: pointer; }\r\n"] }]
    }], null, { archivo: [{ type: i0.Input, args: [{ isSignal: true, alias: "archivo", required: false }] }, { type: i0.Output, args: ["archivoChange"] }], etiqueta: [{ type: i0.Input, args: [{ isSignal: true, alias: "etiqueta", required: false }] }], accion: [{ type: i0.Input, args: [{ isSignal: true, alias: "accion", required: false }] }], requerido: [{ type: i0.Input, args: [{ isSignal: true, alias: "requerido", required: false }] }], deshabilitado: [{ type: i0.Input, args: [{ isSignal: true, alias: "deshabilitado", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CargaComprobanteComponent, { className: "CargaComprobanteComponent", filePath: "src/app/shared/components/carga-comprobante/carga-comprobante.component.ts", lineNumber: 43 }); })();
