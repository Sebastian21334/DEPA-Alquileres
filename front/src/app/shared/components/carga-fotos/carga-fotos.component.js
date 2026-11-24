import { Component, input, output, signal } from '@angular/core';
import { LucideImagePlus } from '@lucide/angular';
import { MAX_IMAGENES_PUBLICACION, TIPOS_IMAGEN_PUBLICACION } from '../../utils/imagenes-publicacion';
import * as i0 from "@angular/core";
/**
 * Zona para elegir o arrastrar las fotos de una publicación, igual en el alta y en la edición.
 * Solo entrega los archivos: cada pantalla los filtra con `filtrarImagenesPublicacion` y decide cuándo subirlos.
 */
export class CargaFotosComponent {
    deshabilitado = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "deshabilitado" }] : /* istanbul ignore next */ []));
    /** Marca la zona cuando el formulario exige al menos una foto. */
    error = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    elegidas = output();
    arrastrando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "arrastrando" }] : /* istanbul ignore next */ []));
    tipos = TIPOS_IMAGEN_PUBLICACION.join(',');
    maximo = MAX_IMAGENES_PUBLICACION;
    arrastrar(evento) {
        evento.preventDefault();
        if (!this.deshabilitado())
            this.arrastrando.set(true);
    }
    soltar(evento) {
        evento.preventDefault();
        this.arrastrando.set(false);
        if (!this.deshabilitado())
            this.emitir(evento.dataTransfer?.files ?? null);
    }
    elegir(evento) {
        const entrada = evento.target;
        this.emitir(entrada.files);
        // Sin limpiar el campo, volver a elegir la misma foto no dispararía el cambio.
        entrada.value = '';
    }
    emitir(lista) {
        const archivos = Array.from(lista ?? []);
        if (archivos.length)
            this.elegidas.emit(archivos);
    }
    static ɵfac = function CargaFotosComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CargaFotosComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CargaFotosComponent, selectors: [["app-carga-fotos"]], inputs: { deshabilitado: [1, "deshabilitado"], error: [1, "error"] }, outputs: { elegidas: "elegidas" }, decls: 12, vars: 10, consts: [[1, "drop", 3, "dragover", "dragleave", "drop"], ["type", "file", "multiple", "", 3, "change", "accept", "disabled"], [1, "drop__icon"], ["lucideImagePlus", "", "aria-hidden", "true", 3, "size"], [1, "drop__btn"]], template: function CargaFotosComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "label", 0);
            i0.ɵɵlistener("dragover", function CargaFotosComponent_Template_label_dragover_0_listener($event) { return ctx.arrastrar($event); })("dragleave", function CargaFotosComponent_Template_label_dragleave_0_listener() { return ctx.arrastrando.set(false); })("drop", function CargaFotosComponent_Template_label_drop_0_listener($event) { return ctx.soltar($event); });
            i0.ɵɵelementStart(1, "input", 1);
            i0.ɵɵlistener("change", function CargaFotosComponent_Template_input_change_1_listener($event) { return ctx.elegir($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(2, "span", 2);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(3, "svg", 3);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(4, "strong");
            i0.ɵɵtext(5, "Mostr\u00E1 lo mejor de tu propiedad");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "span");
            i0.ɵɵtext(7, "Arrastr\u00E1 tus fotos ac\u00E1 o elegilas desde tu dispositivo.");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(8, "span");
            i0.ɵɵtext(9);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "span", 4);
            i0.ɵɵtext(11, "Seleccionar fotos");
            i0.ɵɵelementEnd()();
        } if (rf & 2) {
            i0.ɵɵclassProp("is-dragging", ctx.arrastrando())("drop--error", ctx.error())("drop--deshabilitada", ctx.deshabilitado());
            i0.ɵɵadvance();
            i0.ɵɵproperty("accept", ctx.tipos)("disabled", ctx.deshabilitado());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("size", 30);
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate1("JPG, PNG, WEBP o HEIC, hasta 10 MB cada una \u00B7 m\u00E1ximo ", ctx.maximo);
        } }, dependencies: [LucideImagePlus], styles: ["//   Zona   de   fotos   con   arrastrar   y   soltar   (alta y edici\u00F3n de publicaciones).\r\n[_nghost-%COMP%] { display: block; }\r\n.drop[_ngcontent-%COMP%] {\r\n  position: relative;\r\n  display: flex; flex-direction: column; align-items: center; gap: 0.35rem;\r\n  padding: 2rem 1rem; border: 2px dashed #d0d5dd; border-radius: 12px; background: #f9fafb;\r\n  text-align: center; cursor: pointer;\r\n  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;\r\n}\r\n.drop[_ngcontent-%COMP%]:hover, .drop[_ngcontent-%COMP%]:focus-within { border-color: var(--%NS%color-accent); background: #fffaf2; }\r\n.drop.is-dragging[_ngcontent-%COMP%] { border-color: var(--%NS%color-accent); background: #fff4e5; transform: scale(1.02); }\r\n.drop--error[_ngcontent-%COMP%] { border-color: var(--%NS%color-danger); background: #fef2f2; }\r\n.drop--deshabilitada[_ngcontent-%COMP%], .drop--%NS%deshabilitada[_ngcontent-%COMP%]:hover { border-color: #d0d5dd; background: #f9fafb; opacity: .6; cursor: not-allowed; }\r\n.drop[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] { position: absolute; inset: 0; opacity: 0; cursor: pointer; }\r\n.drop--deshabilitada[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] { cursor: not-allowed; }\r\n.drop[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { font-size: 1.05rem; }\r\n.drop[_ngcontent-%COMP%]    > span[_ngcontent-%COMP%] { font-size: 0.88rem; color: var(--%NS%color-text-muted); }\r\n.drop__icon[_ngcontent-%COMP%] { color: var(--%NS%color-accent); transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }\r\n.drop[_ngcontent-%COMP%]:hover   .drop__icon[_ngcontent-%COMP%], .drop.is-dragging[_ngcontent-%COMP%]   .drop__icon[_ngcontent-%COMP%] { transform: translateY(-5px) scale(1.12); }\r\n.drop--%NS%deshabilitada[_ngcontent-%COMP%]:hover   .drop__icon[_ngcontent-%COMP%] { transform: none; }\r\n.drop[_ngcontent-%COMP%]   .drop__btn[_ngcontent-%COMP%] {\r\n  margin-top: 0.5rem; padding: 0.5rem 1.1rem; border: 1px solid #344054; border-radius: 7px;\r\n  background: #fff; color: var(--%NS%color-text); font-weight: 700;\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CargaFotosComponent, [{
        type: Component,
        args: [{ selector: 'app-carga-fotos', imports: [LucideImagePlus], template: `
    <label class="drop" [class.is-dragging]="arrastrando()" [class.drop--error]="error()" [class.drop--deshabilitada]="deshabilitado()"
      (dragover)="arrastrar($event)" (dragleave)="arrastrando.set(false)" (drop)="soltar($event)">
      <input type="file" multiple [accept]="tipos" [disabled]="deshabilitado()" (change)="elegir($event)" />
      <span class="drop__icon"><svg lucideImagePlus [size]="30" aria-hidden="true"></svg></span>
      <strong>Mostrá lo mejor de tu propiedad</strong>
      <span>Arrastrá tus fotos acá o elegilas desde tu dispositivo.</span>
      <span>JPG, PNG, WEBP o HEIC, hasta 10 MB cada una · máximo {{ maximo }}</span>
      <span class="drop__btn">Seleccionar fotos</span>
    </label>
  `, styles: ["// Zona de fotos con arrastrar y soltar (alta y edici\u00F3n de publicaciones).\r\n:host { display: block; }\r\n.drop {\r\n  position: relative;\r\n  display: flex; flex-direction: column; align-items: center; gap: 0.35rem;\r\n  padding: 2rem 1rem; border: 2px dashed #d0d5dd; border-radius: 12px; background: #f9fafb;\r\n  text-align: center; cursor: pointer;\r\n  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;\r\n}\r\n.drop:hover, .drop:focus-within { border-color: var(--color-accent); background: #fffaf2; }\r\n.drop.is-dragging { border-color: var(--color-accent); background: #fff4e5; transform: scale(1.02); }\r\n.drop--error { border-color: var(--color-danger); background: #fef2f2; }\r\n.drop--deshabilitada, .drop--deshabilitada:hover { border-color: #d0d5dd; background: #f9fafb; opacity: .6; cursor: not-allowed; }\r\n.drop input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }\r\n.drop--deshabilitada input { cursor: not-allowed; }\r\n.drop strong { font-size: 1.05rem; }\r\n.drop > span { font-size: 0.88rem; color: var(--color-text-muted); }\r\n.drop__icon { color: var(--color-accent); transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }\r\n.drop:hover .drop__icon, .drop.is-dragging .drop__icon { transform: translateY(-5px) scale(1.12); }\r\n.drop--deshabilitada:hover .drop__icon { transform: none; }\r\n.drop .drop__btn {\r\n  margin-top: 0.5rem; padding: 0.5rem 1.1rem; border: 1px solid #344054; border-radius: 7px;\r\n  background: #fff; color: var(--color-text); font-weight: 700;\r\n}\r\n"] }]
    }], null, { deshabilitado: [{ type: i0.Input, args: [{ isSignal: true, alias: "deshabilitado", required: false }] }], error: [{ type: i0.Input, args: [{ isSignal: true, alias: "error", required: false }] }], elegidas: [{ type: i0.Output, args: ["elegidas"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CargaFotosComponent, { className: "CargaFotosComponent", filePath: "src/app/shared/components/carga-fotos/carga-fotos.component.ts", lineNumber: 25 }); })();
