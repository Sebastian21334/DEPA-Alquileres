import { DatePipe } from '@angular/common';
import { afterRenderEffect, Component, computed, input, signal, viewChild } from '@angular/core';
import { LucideMessageCircle } from '@lucide/angular';
import { AvatarComponent } from '../avatar/avatar.component';
import * as i0 from "@angular/core";
const _c0 = ["hilo"];
const _c1 = ["*"];
const _forTrack0 = ($index, $item) => $item.dia;
const _forTrack1 = ($index, $item) => $item.id;
function ConversationPanelComponent_Conditional_0_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.subtitulo());
} }
function ConversationPanelComponent_Conditional_0_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 5);
    i0.ɵɵlistener("click", function ConversationPanelComponent_Conditional_0_Conditional_6_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.ampliado.set(!ctx_r0.ampliado())); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵattribute("aria-expanded", ctx_r0.ampliado());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.ampliado() ? "Reducir chat" : "Ampliar chat");
} }
function ConversationPanelComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "header");
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 3);
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(2, "div")(3, "h4");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, ConversationPanelComponent_Conditional_0_Conditional_5_Template, 2, 1, "p");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(6, ConversationPanelComponent_Conditional_0_Conditional_6_Template, 2, 2, "button", 4);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 26);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.titulo());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.subtitulo() ? 5 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.permitirAmpliar() ? 6 : -1);
} }
function ConversationPanelComponent_For_4_For_4_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const mensaje_r3 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("\u00B7 ", mensaje_r3.rol);
} }
function ConversationPanelComponent_For_4_For_4_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 11);
    i0.ɵɵtext(1, "Nota interna");
    i0.ɵɵelementEnd();
} }
function ConversationPanelComponent_For_4_For_4_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 16);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const mensaje_r3 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵclassProp("interna", mensaje_r3.interno);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(mensaje_r3.texto);
} }
function ConversationPanelComponent_For_4_For_4_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 13);
    i0.ɵɵelement(1, "img", 17);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const mensaje_r3 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("href", mensaje_r3.imagen, i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance();
    i0.ɵɵproperty("src", mensaje_r3.imagen, i0.ɵɵsanitizeUrl);
} }
function ConversationPanelComponent_For_4_For_4_Conditional_10_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 18);
    i0.ɵɵelement(1, "img", 19);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const imagen_r4 = ctx.$implicit;
    i0.ɵɵproperty("href", imagen_r4.url, i0.ɵɵsanitizeUrl)("title", imagen_r4.nombre);
    i0.ɵɵattribute("aria-label", "Abrir " + imagen_r4.nombre);
    i0.ɵɵadvance();
    i0.ɵɵproperty("src", imagen_r4.url, i0.ɵɵsanitizeUrl)("alt", imagen_r4.nombre);
} }
function ConversationPanelComponent_For_4_For_4_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 14);
    i0.ɵɵrepeaterCreate(1, ConversationPanelComponent_For_4_For_4_Conditional_10_For_2_Template, 2, 5, "a", 18, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const mensaje_r3 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵattribute("aria-label", "Im\u00E1genes de " + mensaje_r3.autor);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(mensaje_r3.imagenes);
} }
function ConversationPanelComponent_For_4_For_4_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const mensaje_r3 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵattribute("aria-label", mensaje_r3.leido ? "Le\u00EDdo" : "Enviado");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(mensaje_r3.leido ? "\u2713\u2713" : "\u2713");
} }
function ConversationPanelComponent_For_4_For_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "article");
    i0.ɵɵelement(1, "app-avatar", 8);
    i0.ɵɵelementStart(2, "div", 9)(3, "div", 10)(4, "strong");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(6, ConversationPanelComponent_For_4_For_4_Conditional_6_Template, 2, 1, "span");
    i0.ɵɵconditionalCreate(7, ConversationPanelComponent_For_4_For_4_Conditional_7_Template, 2, 0, "span", 11);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(8, ConversationPanelComponent_For_4_For_4_Conditional_8_Template, 2, 3, "p", 12);
    i0.ɵɵconditionalCreate(9, ConversationPanelComponent_For_4_For_4_Conditional_9_Template, 2, 2, "a", 13);
    i0.ɵɵconditionalCreate(10, ConversationPanelComponent_For_4_For_4_Conditional_10_Template, 3, 1, "div", 14);
    i0.ɵɵelementStart(11, "div", 15)(12, "time");
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "date");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(15, ConversationPanelComponent_For_4_For_4_Conditional_15_Template, 2, 2, "span");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const mensaje_r3 = ctx.$implicit;
    i0.ɵɵclassProp("propio", mensaje_r3.propio);
    i0.ɵɵadvance();
    i0.ɵɵproperty("nombre", mensaje_r3.autor)("foto", mensaje_r3.foto ?? null)("usarDosIniciales", true);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(mensaje_r3.autor);
    i0.ɵɵadvance();
    i0.ɵɵconditional(mensaje_r3.rol ? 6 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(mensaje_r3.interno ? 7 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(mensaje_r3.texto ? 8 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(mensaje_r3.imagen ? 9 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(mensaje_r3.imagenes?.length ? 10 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵattribute("datetime", mensaje_r3.fecha);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(14, 14, mensaje_r3.fecha, "HH:mm"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(mensaje_r3.leido !== undefined ? 15 : -1);
} }
function ConversationPanelComponent_For_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6)(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
    i0.ɵɵrepeaterCreate(3, ConversationPanelComponent_For_4_For_4_Template, 16, 17, "article", 7, _forTrack1);
} if (rf & 2) {
    const grupo_r5 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(grupo_r5.etiqueta);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(grupo_r5.mensajes);
} }
function ConversationPanelComponent_ForEmpty_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 2);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.vacio());
} }
export function mensajesApelacion(detalle, autor, propia) {
    if (detalle.mensajes)
        return detalle.mensajes.map(mensaje => ({
            ...mensaje, autor: mensaje.autor === 'usuario' ? autor : 'Administración',
            propio: mensaje.autor === 'usuario' ? propia : !propia,
        }));
    const mensajes = [];
    if (detalle.apelacion)
        mensajes.push({ id: 'apelacion', autor, propio: propia, ...detalle.apelacion });
    if (detalle.respuesta)
        mensajes.push({ id: 'respuesta', autor: 'Administración', ...detalle.respuesta });
    return mensajes;
}
export class ConversationPanelComponent {
    titulo = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "titulo" }] : /* istanbul ignore next */ []));
    subtitulo = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "subtitulo" }] : /* istanbul ignore next */ []));
    mensajes = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mensajes" }] : /* istanbul ignore next */ []));
    vacio = input('Todavía no hay mensajes.', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "vacio" }] : /* istanbul ignore next */ []));
    permitirAmpliar = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "permitirAmpliar" }] : /* istanbul ignore next */ []));
    ampliado = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ampliado" }] : /* istanbul ignore next */ []));
    hilo = viewChild.required('hilo', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hilo" }] : /* istanbul ignore next */ []));
    fecha = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long' });
    grupos = computed(() => {
        const grupos = new Map();
        for (const mensaje of this.mensajes()) {
            const fecha = new Date(mensaje.fecha);
            const dia = fecha.toDateString();
            const grupo = grupos.get(dia);
            if (grupo)
                grupo.mensajes.push(mensaje);
            else
                grupos.set(dia, { dia, etiqueta: Number.isNaN(+fecha) ? 'Sin fecha' : this.fecha.format(fecha), mensajes: [mensaje] });
        }
        return [...grupos.values()];
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "grupos" }] : /* istanbul ignore next */ []));
    ultimoId;
    constructor() {
        afterRenderEffect(() => {
            const ultimo = this.mensajes().at(-1)?.id;
            const hilo = this.hilo().nativeElement;
            if (ultimo !== this.ultimoId)
                hilo.scrollTop = hilo.scrollHeight;
            this.ultimoId = ultimo;
        });
    }
    static ɵfac = function ConversationPanelComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ConversationPanelComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ConversationPanelComponent, selectors: [["app-conversation-panel"]], viewQuery: function ConversationPanelComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.hilo, _c0, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, inputs: { titulo: [1, "titulo"], subtitulo: [1, "subtitulo"], mensajes: [1, "mensajes"], vacio: [1, "vacio"], permitirAmpliar: [1, "permitirAmpliar"] }, ngContentSelectors: _c1, decls: 7, vars: 4, consts: [["hilo", ""], ["role", "log", "aria-label", "Mensajes", "tabindex", "0", 1, "hilo"], [1, "vacio"], ["lucideMessageCircle", "", "aria-hidden", "true", 3, "size"], ["type", "button", 1, "ampliar"], ["type", "button", 1, "ampliar", 3, "click"], [1, "fecha"], [3, "propio"], ["aria-hidden", "true", 1, "avatar", 3, "nombre", "foto", "usarDosIniciales"], [1, "mensaje"], [1, "autor"], [1, "nota"], [1, "burbuja", 3, "interna"], ["target", "_blank", "rel", "noopener noreferrer", "aria-label", "Abrir imagen adjunta", 1, "imagen", 3, "href"], ["role", "group", 1, "imagenes"], [1, "hora"], [1, "burbuja"], ["alt", "Imagen adjunta", "loading", "lazy", 3, "src"], ["target", "_blank", "rel", "noopener noreferrer", 3, "href", "title"], ["loading", "lazy", 3, "src", "alt"]], template: function ConversationPanelComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef();
            i0.ɵɵconditionalCreate(0, ConversationPanelComponent_Conditional_0_Template, 7, 4, "header");
            i0.ɵɵelementStart(1, "div", 1, 0);
            i0.ɵɵrepeaterCreate(3, ConversationPanelComponent_For_4_Template, 5, 1, null, null, _forTrack0, false, ConversationPanelComponent_ForEmpty_5_Template, 2, 1, "p", 2);
            i0.ɵɵelementEnd();
            i0.ɵɵprojection(6);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.titulo() ? 0 : -1);
            i0.ɵɵadvance();
            i0.ɵɵclassProp("hilo--ampliado", ctx.ampliado());
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.grupos());
        } }, dependencies: [AvatarComponent, LucideMessageCircle, DatePipe], styles: ["[_nghost-%COMP%] { display: flex; flex-direction: column; min-width: 0; min-height: 0; overflow: hidden; border: 1px solid #d5deee; border-radius: 12px; background: #fff; color: #121b36; }\n    header[_ngcontent-%COMP%] { display: flex; align-items: flex-start; gap: 12px; padding: 15px 20px; border-bottom: 1px solid #d5deee; }\n    header[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { color: #1648f5; flex: none; }\n    .ampliar[_ngcontent-%COMP%] { margin-left: auto; padding: 6px 10px; border: 1px solid #d5deee; border-radius: 7px; background: #f6f8ff; color: #1648c5; font: inherit; font-size: .82rem; font-weight: 700; cursor: pointer; }\n    .ampliar[_ngcontent-%COMP%]:focus-visible { outline: 2px solid #1648f5; outline-offset: 2px; }\n    h4[_ngcontent-%COMP%], header[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], .burbuja[_ngcontent-%COMP%] { margin: 0; }\n    h4[_ngcontent-%COMP%] { font-size: 1rem; }\n    header[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin-top: 3px; font-size: .88rem; color: #52607a; }\n    .hilo[_ngcontent-%COMP%] { flex: 1 1 auto; min-height: 110px; max-height: var(--%NS%conversation-height, 330px); overflow-y: auto; padding: 14px clamp(10px, 3vw, 24px); background: #f3f6fc; }\n    .hilo--ampliado[_ngcontent-%COMP%] { min-height: min(60vh, 600px); max-height: min(60vh, 600px); }\n    .fecha[_ngcontent-%COMP%] { display: flex; align-items: center; gap: 12px; margin: 4px 0 14px; color: #52607a; font-size: .8rem; }\n    .fecha[_ngcontent-%COMP%]::before, .fecha[_ngcontent-%COMP%]::after { content: ''; height: 1px; background: #d2dbea; flex: 1; }\n    article[_ngcontent-%COMP%] { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 12px; }\n    article.propio[_ngcontent-%COMP%] { flex-direction: row-reverse; text-align: right; }\n    .avatar[_ngcontent-%COMP%] { display: grid; place-items: center; width: 2.25rem; height: 2.25rem; flex: none; border-radius: 50%; background: #d3e1fb; color: #173a9e; font-size: .83rem; font-weight: 750; }\n    .mensaje[_ngcontent-%COMP%] { min-width: 0; max-width: 85%; }\n    .autor[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; margin-bottom: 5px; font-size: .79rem; }\n    .propio[_ngcontent-%COMP%]   .autor[_ngcontent-%COMP%] { justify-content: flex-end; }\n    .autor[_ngcontent-%COMP%]   span[_ngcontent-%COMP%], .hora[_ngcontent-%COMP%] { color: #52607a; }\n    .autor[_ngcontent-%COMP%]   .nota[_ngcontent-%COMP%] { padding: 2px 5px; border-radius: 4px; background: #fff0cb; color: #694500; }\n    .burbuja[_ngcontent-%COMP%] { display: inline-block; padding: 8px 11px; border-radius: 6px 11px 11px; background: #dbe8ff; text-align: left; white-space: pre-wrap; overflow-wrap: anywhere; font-size: .92rem; }\n    .propio[_ngcontent-%COMP%]   .burbuja[_ngcontent-%COMP%] { border-radius: 11px 6px 11px 11px; background: #e3eaff; }\n    .burbuja.interna[_ngcontent-%COMP%] { background: #fff0cb; }\n    .imagen[_ngcontent-%COMP%] { display: block; margin-top: 6px; }\n    .imagen[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] { display: block; max-width: min(100%, 240px); max-height: 220px; border-radius: 8px; object-fit: contain; }\n    .imagenes[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }\n    .propio[_ngcontent-%COMP%]   .imagenes[_ngcontent-%COMP%] { justify-content: flex-end; }\n    .imagenes[_ngcontent-%COMP%]   a[_ngcontent-%COMP%] { display: block; border-radius: 8px; }\n    .imagenes[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:focus-visible { outline: 2px solid #1640f5; outline-offset: 2px; }\n    .imagenes[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] { display: block; width: 96px; height: 96px; border-radius: 8px; object-fit: cover; background: #e3eaff; }\n    .hora[_ngcontent-%COMP%] { margin-top: 4px; font-size: .72rem; }\n    .hora[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] { margin-inline-start: 4px; }\n    .vacio[_ngcontent-%COMP%] { margin: 16px 0; color: #52607a; font-size: .88rem; text-align: center; }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ConversationPanelComponent, [{
        type: Component,
        args: [{ selector: 'app-conversation-panel', imports: [AvatarComponent, DatePipe, LucideMessageCircle], template: `
    @if (titulo()) {
      <header><svg lucideMessageCircle [size]="26" aria-hidden="true"></svg>
        <div><h4>{{ titulo() }}</h4>@if (subtitulo()) { <p>{{ subtitulo() }}</p> }</div>
        @if (permitirAmpliar()) {
          <button class="ampliar" type="button" [attr.aria-expanded]="ampliado()" (click)="ampliado.set(!ampliado())">{{ ampliado() ? 'Reducir chat' : 'Ampliar chat' }}</button>
        }
      </header>
    }
    <div class="hilo" [class.hilo--ampliado]="ampliado()" #hilo role="log" aria-label="Mensajes" tabindex="0">
      @for (grupo of grupos(); track grupo.dia) {
        <div class="fecha"><span>{{ grupo.etiqueta }}</span></div>
        @for (mensaje of grupo.mensajes; track mensaje.id) {
          <article [class.propio]="mensaje.propio">
            <app-avatar class="avatar" [nombre]="mensaje.autor" [foto]="mensaje.foto ?? null" [usarDosIniciales]="true" aria-hidden="true" />
            <div class="mensaje">
              <div class="autor"><strong>{{ mensaje.autor }}</strong>
                @if (mensaje.rol) { <span>· {{ mensaje.rol }}</span> }
                @if (mensaje.interno) { <span class="nota">Nota interna</span> }
              </div>
              @if (mensaje.texto) { <p class="burbuja" [class.interna]="mensaje.interno">{{ mensaje.texto }}</p> }
              @if (mensaje.imagen) {
                <a class="imagen" [href]="mensaje.imagen" target="_blank" rel="noopener noreferrer" aria-label="Abrir imagen adjunta">
                  <img [src]="mensaje.imagen" alt="Imagen adjunta" loading="lazy" />
                </a>
              }
              @if (mensaje.imagenes?.length) {
                <div class="imagenes" role="group" [attr.aria-label]="'Imágenes de ' + mensaje.autor">
                  @for (imagen of mensaje.imagenes; track $index) {
                    <a [href]="imagen.url" target="_blank" rel="noopener noreferrer" [attr.aria-label]="'Abrir ' + imagen.nombre" [title]="imagen.nombre">
                      <img [src]="imagen.url" [alt]="imagen.nombre" loading="lazy" />
                    </a>
                  }
                </div>
              }
              <div class="hora"><time [attr.datetime]="mensaje.fecha">{{ mensaje.fecha | date:'HH:mm' }}</time>
                @if (mensaje.leido !== undefined) {
                  <span [attr.aria-label]="mensaje.leido ? 'Leído' : 'Enviado'">{{ mensaje.leido ? '✓✓' : '✓' }}</span>
                }
              </div>
            </div>
          </article>
        }
      } @empty {
        <p class="vacio">{{ vacio() }}</p>
      }
    </div>
    <ng-content />
  `, styles: ["\n    :host { display: flex; flex-direction: column; min-width: 0; min-height: 0; overflow: hidden; border: 1px solid #d5deee; border-radius: 12px; background: #fff; color: #121b36; }\n    header { display: flex; align-items: flex-start; gap: 12px; padding: 15px 20px; border-bottom: 1px solid #d5deee; }\n    header svg { color: #1648f5; flex: none; }\n    .ampliar { margin-left: auto; padding: 6px 10px; border: 1px solid #d5deee; border-radius: 7px; background: #f6f8ff; color: #1648c5; font: inherit; font-size: .82rem; font-weight: 700; cursor: pointer; }\n    .ampliar:focus-visible { outline: 2px solid #1648f5; outline-offset: 2px; }\n    h4, header p, .burbuja { margin: 0; }\n    h4 { font-size: 1rem; }\n    header p { margin-top: 3px; font-size: .88rem; color: #52607a; }\n    .hilo { flex: 1 1 auto; min-height: 110px; max-height: var(--conversation-height, 330px); overflow-y: auto; padding: 14px clamp(10px, 3vw, 24px); background: #f3f6fc; }\n    .hilo--ampliado { min-height: min(60vh, 600px); max-height: min(60vh, 600px); }\n    .fecha { display: flex; align-items: center; gap: 12px; margin: 4px 0 14px; color: #52607a; font-size: .8rem; }\n    .fecha::before, .fecha::after { content: ''; height: 1px; background: #d2dbea; flex: 1; }\n    article { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 12px; }\n    article.propio { flex-direction: row-reverse; text-align: right; }\n    .avatar { display: grid; place-items: center; width: 2.25rem; height: 2.25rem; flex: none; border-radius: 50%; background: #d3e1fb; color: #173a9e; font-size: .83rem; font-weight: 750; }\n    .mensaje { min-width: 0; max-width: 85%; }\n    .autor { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; margin-bottom: 5px; font-size: .79rem; }\n    .propio .autor { justify-content: flex-end; }\n    .autor span, .hora { color: #52607a; }\n    .autor .nota { padding: 2px 5px; border-radius: 4px; background: #fff0cb; color: #694500; }\n    .burbuja { display: inline-block; padding: 8px 11px; border-radius: 6px 11px 11px; background: #dbe8ff; text-align: left; white-space: pre-wrap; overflow-wrap: anywhere; font-size: .92rem; }\n    .propio .burbuja { border-radius: 11px 6px 11px 11px; background: #e3eaff; }\n    .burbuja.interna { background: #fff0cb; }\n    .imagen { display: block; margin-top: 6px; }\n    .imagen img { display: block; max-width: min(100%, 240px); max-height: 220px; border-radius: 8px; object-fit: contain; }\n    .imagenes { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }\n    .propio .imagenes { justify-content: flex-end; }\n    .imagenes a { display: block; border-radius: 8px; }\n    .imagenes a:focus-visible { outline: 2px solid #1640f5; outline-offset: 2px; }\n    .imagenes img { display: block; width: 96px; height: 96px; border-radius: 8px; object-fit: cover; background: #e3eaff; }\n    .hora { margin-top: 4px; font-size: .72rem; }\n    .hora span { margin-inline-start: 4px; }\n    .vacio { margin: 16px 0; color: #52607a; font-size: .88rem; text-align: center; }\n  "] }]
    }], () => [], { titulo: [{ type: i0.Input, args: [{ isSignal: true, alias: "titulo", required: false }] }], subtitulo: [{ type: i0.Input, args: [{ isSignal: true, alias: "subtitulo", required: false }] }], mensajes: [{ type: i0.Input, args: [{ isSignal: true, alias: "mensajes", required: true }] }], vacio: [{ type: i0.Input, args: [{ isSignal: true, alias: "vacio", required: false }] }], permitirAmpliar: [{ type: i0.Input, args: [{ isSignal: true, alias: "permitirAmpliar", required: false }] }], hilo: [{ type: i0.ViewChild, args: ['hilo', { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ConversationPanelComponent, { className: "ConversationPanelComponent", filePath: "src/app/shared/components/conversation-panel/conversation-panel.component.ts", lineNumber: 124 }); })();
