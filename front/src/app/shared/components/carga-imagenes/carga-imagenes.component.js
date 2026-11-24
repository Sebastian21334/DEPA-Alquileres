import { Component, DestroyRef, computed, effect, inject, input, model, signal } from '@angular/core';
import { LucideImagePlus } from '@lucide/angular';
import { GaleriaImagenesComponent } from '../galeria-imagenes/galeria-imagenes.component';
import * as i0 from "@angular/core";
function CargaImagenesComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 2);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(" \u00B7 ", ctx_r1.archivos().length, " de ", ctx_r1.maximo());
} }
function CargaImagenesComponent_Conditional_11_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const aviso_r4 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(aviso_r4);
} }
function CargaImagenesComponent_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 8);
    i0.ɵɵrepeaterCreate(1, CargaImagenesComponent_Conditional_11_For_2_Template, 2, 1, "li", null, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.avisos());
} }
function CargaImagenesComponent_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-galeria-imagenes", 10);
    i0.ɵɵlistener("quitar", function CargaImagenesComponent_Conditional_12_Template_app_galeria_imagenes_quitar_0_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.quitar($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("fotos", ctx_r1.fotos())("ordenable", false)("disabled", ctx_r1.deshabilitado());
} }
const FORMATOS = { 'image/jpeg': 'JPEG', 'image/png': 'PNG', 'image/webp': 'WEBP', 'image/heic': 'HEIC', 'image/heif': 'HEIF' };
let siguienteId = 0;
/**
 * Elige imágenes para un formulario o un mensaje: reclamos, pedido de reinicio del código y apelaciones de bloqueo.
 * Descarta solo las que no cumplen y avisa cuáles; las elegidas se ven con la galería de publicaciones, sin portada ni orden.
 * El máximo, los tipos y el tamaño son parámetros: el back vuelve a validar y cada uso puede ampliar el límite.
 */
export class CargaImagenesComponent {
    archivos = model([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "archivos" }] : /* istanbul ignore next */ []));
    etiqueta = input('Imágenes (opcional)', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "etiqueta" }] : /* istanbul ignore next */ []));
    maximo = input(5, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "maximo" }] : /* istanbul ignore next */ []));
    tipos = input(['image/jpeg', 'image/png'], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tipos" }] : /* istanbul ignore next */ []));
    maxBytes = input(5 * 1024 * 1024, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "maxBytes" }] : /* istanbul ignore next */ []));
    deshabilitado = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "deshabilitado" }] : /* istanbul ignore next */ []));
    avisos = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "avisos" }] : /* istanbul ignore next */ []));
    arrastrando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "arrastrando" }] : /* istanbul ignore next */ []));
    id = `carga-imagenes-${++siguienteId}`;
    vistasPrevias = new Map();
    formatos = computed(() => {
        const nombres = this.tipos().map((tipo) => FORMATOS[tipo] ?? tipo);
        return nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} o ${nombres.at(-1)}` : nombres.join('');
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "formatos" }] : /* istanbul ignore next */ []));
    tamano = computed(() => `${Math.round(this.maxBytes() / 1024 / 1024)} MB`, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tamano" }] : /* istanbul ignore next */ []));
    /** Con una sola imagen (apelaciones o el último lugar de un reclamo) los textos van en singular. */
    unaSola = computed(() => this.maximo() === 1, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "unaSola" }] : /* istanbul ignore next */ []));
    completa = computed(() => this.archivos().length >= this.maximo(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "completa" }] : /* istanbul ignore next */ []));
    accion = computed(() => {
        if (this.completa())
            return this.unaSola() ? 'Ya elegiste la imagen' : `Llegaste al máximo de ${this.maximo()} imágenes`;
        return this.unaSola() ? 'Elegí o arrastrá la imagen' : 'Elegí o arrastrá las imágenes';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "accion" }] : /* istanbul ignore next */ []));
    ayuda = computed(() => {
        if (this.completa())
            return this.unaSola() ? 'Quitala para elegir otra.' : 'Quitá alguna para elegir otra.';
        return this.unaSola() ? `${this.formatos()}, hasta ${this.tamano()}` : `${this.formatos()}, hasta ${this.tamano()} cada una, máximo ${this.maximo()}`;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ayuda" }] : /* istanbul ignore next */ []));
    bloqueada = computed(() => this.deshabilitado() || this.completa(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "bloqueada" }] : /* istanbul ignore next */ []));
    fotos = computed(() => this.archivos().map((archivo) => ({ url: this.vistaPrevia(archivo), nombre: archivo.name })), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "fotos" }] : /* istanbul ignore next */ []));
    constructor() {
        // Libera las vistas previas de las imágenes que dejaron de estar elegidas («Quitar» o el formulario se vació).
        effect(() => {
            const vigentes = new Set(this.archivos());
            for (const [archivo, url] of this.vistasPrevias) {
                if (vigentes.has(archivo))
                    continue;
                URL.revokeObjectURL(url);
                this.vistasPrevias.delete(archivo);
            }
        });
        inject(DestroyRef).onDestroy(() => this.vistasPrevias.forEach((url) => URL.revokeObjectURL(url)));
    }
    arrastrar(evento) {
        evento.preventDefault();
        // Con la zona completa no se acepta el archivo, pero tampoco se deja que el navegador lo abra y se pierda el formulario.
        if (this.bloqueada()) {
            if (evento.dataTransfer)
                evento.dataTransfer.dropEffect = 'none';
            return;
        }
        this.arrastrando.set(true);
    }
    soltar(evento, entrada) {
        evento.preventDefault();
        this.arrastrando.set(false);
        this.agregar(evento.dataTransfer?.files ?? null, entrada);
    }
    agregar(lista, entrada) {
        const elegidas = Array.from(lista ?? []);
        // Sin limpiar el campo, volver a elegir la misma imagen después de quitarla no dispararía el cambio.
        entrada.value = '';
        if (this.bloqueada() || !elegidas.length)
            return;
        const aceptadas = [...this.archivos()];
        const avisos = [];
        const sobrantes = [];
        for (const archivo of elegidas) {
            if (!this.tipos().includes(archivo.type))
                avisos.push(`«${archivo.name}» no es una imagen ${this.formatos()}.`);
            else if (archivo.size > this.maxBytes())
                avisos.push(`«${archivo.name}» pesa más de ${this.tamano()}.`);
            else if (aceptadas.some((otra) => mismaImagen(otra, archivo)))
                avisos.push(`«${archivo.name}» ya está elegida.`);
            else if (aceptadas.length >= this.maximo())
                sobrantes.push(`«${archivo.name}»`);
            else
                aceptadas.push(archivo);
        }
        if (sobrantes.length)
            avisos.push(this.unaSola()
                ? `Podés adjuntar una sola imagen; no se agregó: ${sobrantes.join(', ')}.`
                : `Podés adjuntar hasta ${this.maximo()} imágenes; no se agregaron: ${sobrantes.join(', ')}.`);
        this.avisos.set(avisos);
        if (aceptadas.length !== this.archivos().length)
            this.archivos.set(aceptadas);
    }
    quitar(indice) {
        if (this.deshabilitado())
            return;
        this.avisos.set([]);
        this.archivos.update((lista) => lista.filter((_, i) => i !== indice));
    }
    vistaPrevia(archivo) {
        let url = this.vistasPrevias.get(archivo);
        if (!url) {
            url = URL.createObjectURL(archivo);
            this.vistasPrevias.set(archivo, url);
        }
        return url;
    }
    static ɵfac = function CargaImagenesComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CargaImagenesComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CargaImagenesComponent, selectors: [["app-carga-imagenes"]], inputs: { archivos: [1, "archivos"], etiqueta: [1, "etiqueta"], maximo: [1, "maximo"], tipos: [1, "tipos"], maxBytes: [1, "maxBytes"], deshabilitado: [1, "deshabilitado"] }, outputs: { archivos: "archivosChange" }, decls: 13, vars: 20, consts: [["entrada", ""], [1, "carga__etiqueta", 3, "id"], [1, "carga__cuenta"], [1, "carga__zona", 3, "dragover", "dragleave", "drop"], ["type", "file", 1, "carga__entrada", 3, "change", "id", "multiple", "accept", "disabled"], ["lucideImagePlus", "", "aria-hidden", "true", 3, "size"], [1, "carga__accion", 3, "id"], [1, "carga__ayuda", 3, "id"], ["role", "alert", 1, "carga__error", "carga__avisos"], [3, "fotos", "ordenable", "disabled"], [3, "quitar", "fotos", "ordenable", "disabled"]], template: function CargaImagenesComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "span", 1);
            i0.ɵɵtext(1);
            i0.ɵɵconditionalCreate(2, CargaImagenesComponent_Conditional_2_Template, 2, 2, "span", 2);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "label", 3);
            i0.ɵɵlistener("dragover", function CargaImagenesComponent_Template_label_dragover_3_listener($event) { return ctx.arrastrar($event); })("dragleave", function CargaImagenesComponent_Template_label_dragleave_3_listener() { return ctx.arrastrando.set(false); })("drop", function CargaImagenesComponent_Template_label_drop_3_listener($event) { i0.ɵɵrestoreView(_r1); const entrada_r3 = i0.ɵɵreference(5); return i0.ɵɵresetView(ctx.soltar($event, entrada_r3)); });
            i0.ɵɵelementStart(4, "input", 4, 0);
            i0.ɵɵlistener("change", function CargaImagenesComponent_Template_input_change_4_listener() { i0.ɵɵrestoreView(_r1); const entrada_r3 = i0.ɵɵreference(5); return i0.ɵɵresetView(ctx.agregar(entrada_r3.files, entrada_r3)); });
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(6, "svg", 5);
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(7, "span", 6);
            i0.ɵɵtext(8);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "span", 7);
            i0.ɵɵtext(10);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(11, CargaImagenesComponent_Conditional_11_Template, 3, 0, "ul", 8);
            i0.ɵɵconditionalCreate(12, CargaImagenesComponent_Conditional_12_Template, 1, 3, "app-galeria-imagenes", 9);
        } if (rf & 2) {
            i0.ɵɵproperty("id", ctx.id + "-etiqueta");
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(ctx.etiqueta());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.archivos().length ? 2 : -1);
            i0.ɵɵadvance();
            i0.ɵɵclassProp("carga__zona--arrastrando", ctx.arrastrando())("carga__zona--deshabilitada", ctx.bloqueada());
            i0.ɵɵadvance();
            i0.ɵɵproperty("id", ctx.id)("multiple", !ctx.unaSola())("accept", ctx.tipos().join(","))("disabled", ctx.bloqueada());
            i0.ɵɵattribute("aria-labelledby", ctx.id + "-etiqueta " + ctx.id + "-accion")("aria-describedby", ctx.id + "-ayuda");
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("size", 20);
            i0.ɵɵadvance();
            i0.ɵɵproperty("id", ctx.id + "-accion");
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(ctx.accion());
            i0.ɵɵadvance();
            i0.ɵɵproperty("id", ctx.id + "-ayuda");
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(ctx.ayuda());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.avisos().length ? 11 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.fotos().length ? 12 : -1);
        } }, dependencies: [GaleriaImagenesComponent, LucideImagePlus], styles: ["@use '../carga-comprobante/zona-carga';\r\n\r\n[_nghost-%COMP%] { display: grid; gap: .45rem; min-width: 0; }\r\n.carga__cuenta[_ngcontent-%COMP%] { color: #52607a; font-weight: 600; }\r\n.carga__avisos[_ngcontent-%COMP%] { display: grid; gap: .2rem; padding-inline-start: 1.1rem; overflow-wrap: anywhere; }\r\napp-galeria-imagenes[_ngcontent-%COMP%] { margin-top: .2rem; }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CargaImagenesComponent, [{
        type: Component,
        args: [{ selector: 'app-carga-imagenes', imports: [GaleriaImagenesComponent, LucideImagePlus], template: `
    <span class="carga__etiqueta" [id]="id + '-etiqueta'">{{ etiqueta() }}@if (archivos().length) { <span class="carga__cuenta"> · {{ archivos().length }} de {{ maximo() }}</span> }</span>
    <label class="carga__zona" [class.carga__zona--arrastrando]="arrastrando()" [class.carga__zona--deshabilitada]="bloqueada()"
      (dragover)="arrastrar($event)" (dragleave)="arrastrando.set(false)" (drop)="soltar($event, entrada)">
      <input #entrada class="carga__entrada" [id]="id" type="file" [multiple]="!unaSola()" [accept]="tipos().join(',')" [disabled]="bloqueada()"
        [attr.aria-labelledby]="id + '-etiqueta ' + id + '-accion'" [attr.aria-describedby]="id + '-ayuda'"
        (change)="agregar(entrada.files, entrada)" />
      <svg lucideImagePlus [size]="20" aria-hidden="true"></svg>
      <span class="carga__accion" [id]="id + '-accion'">{{ accion() }}</span>
      <span class="carga__ayuda" [id]="id + '-ayuda'">{{ ayuda() }}</span>
    </label>
    @if (avisos().length) {
      <ul class="carga__error carga__avisos" role="alert">
        @for (aviso of avisos(); track $index) { <li>{{ aviso }}</li> }
      </ul>
    }
    @if (fotos().length) {
      <app-galeria-imagenes [fotos]="fotos()" [ordenable]="false" [disabled]="deshabilitado()" (quitar)="quitar($event)" />
    }
  `, styles: ["@use '../carga-comprobante/zona-carga';\r\n\r\n:host { display: grid; gap: .45rem; min-width: 0; }\r\n.carga__cuenta { color: #52607a; font-weight: 600; }\r\n.carga__avisos { display: grid; gap: .2rem; padding-inline-start: 1.1rem; overflow-wrap: anywhere; }\r\napp-galeria-imagenes { margin-top: .2rem; }\r\n"] }]
    }], () => [], { archivos: [{ type: i0.Input, args: [{ isSignal: true, alias: "archivos", required: false }] }, { type: i0.Output, args: ["archivosChange"] }], etiqueta: [{ type: i0.Input, args: [{ isSignal: true, alias: "etiqueta", required: false }] }], maximo: [{ type: i0.Input, args: [{ isSignal: true, alias: "maximo", required: false }] }], tipos: [{ type: i0.Input, args: [{ isSignal: true, alias: "tipos", required: false }] }], maxBytes: [{ type: i0.Input, args: [{ isSignal: true, alias: "maxBytes", required: false }] }], deshabilitado: [{ type: i0.Input, args: [{ isSignal: true, alias: "deshabilitado", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CargaImagenesComponent, { className: "CargaImagenesComponent", filePath: "src/app/shared/components/carga-imagenes/carga-imagenes.component.ts", lineNumber: 38 }); })();
function mismaImagen(a, b) {
    return a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
}
