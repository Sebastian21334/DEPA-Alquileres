import { ConversationPanelComponent } from '../conversation-panel/conversation-panel.component';
import { ConversationComposerComponent } from '../conversation-panel/conversation-composer.component';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, exhaustMap, expand, finalize, merge, timer } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ActividadReembolsosService } from '../../../core/services/actividad-reembolsos.service';
import * as i0 from "@angular/core";
function ReembolsoChatComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 1);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.error());
} }
function ReembolsoChatComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "app-conversation-composer", 4);
    i0.ɵɵtwoWayListener("textoChange", function ReembolsoChatComponent_Conditional_2_Template_app_conversation_composer_textoChange_0_listener($event) { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); i0.ɵɵtwoWayBindingSet(ctx_r0.borrador, $event) || (ctx_r0.borrador = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("enviar", function ReembolsoChatComponent_Conditional_2_Template_app_conversation_composer_enviar_0_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.enviar()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵtwoWayProperty("texto", ctx_r0.borrador);
    i0.ɵɵproperty("deshabilitado", ctx_r0.enviando());
} }
function ReembolsoChatComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 3);
    i0.ɵɵtext(1, "La conversaci\u00F3n est\u00E1 cerrada.");
    i0.ɵɵelementEnd();
} }
export class ReembolsoChatComponent {
    reembolsoId = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "reembolsoId" }] : /* istanbul ignore next */ []));
    vistaInquilino = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "vistaInquilino" }] : /* istanbul ignore next */ []));
    http = inject(HttpClient);
    actividad = inject(ActividadReembolsosService);
    actualizar = new Subject();
    abierta = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "abierta" }] : /* istanbul ignore next */ []));
    mensajes = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mensajes" }] : /* istanbul ignore next */ []));
    hilo = computed(() => this.mensajes().map(mensaje => ({
        id: mensaje.id, autor: mensaje.autor, texto: mensaje.texto, fecha: mensaje.creado_en,
        rol: mensaje.administracion ? 'Administración' : 'Inquilino',
        propio: this.vistaInquilino() && !mensaje.administracion,
    })), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hilo" }] : /* istanbul ignore next */ []));
    error = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "error" }] : /* istanbul ignore next */ []));
    enviando = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "enviando" }] : /* istanbul ignore next */ []));
    borrador = '';
    constructor() {
        effect(onCleanup => {
            const id = this.reembolsoId();
            this.mensajes.set([]);
            this.abierta.set(null);
            this.error.set('');
            const consulta = merge(timer(0, 5000), this.actualizar).pipe(exhaustMap(() => this.leer(id, this.mensajes().at(-1)?.id ?? 0).pipe(expand(pagina => pagina.mensajes.length === 100 ? this.leer(id, pagina.mensajes[99].id) : EMPTY), catchError(() => {
                this.error.set('No se pudo actualizar la conversación.');
                return EMPTY;
            })))).subscribe(pagina => {
                if (!this.enviando())
                    this.error.set('');
                this.abierta.set(pagina.abierta);
                this.mensajes.update(actuales => [...actuales, ...pagina.mensajes]);
                const ultimo = [...pagina.mensajes].reverse().find(mensaje => mensaje.administracion);
                if (this.vistaInquilino() && ultimo)
                    this.actividad.marcarLeido(id, ultimo.id);
            });
            onCleanup(() => consulta.unsubscribe());
        });
    }
    leer(id, despuesDe) {
        return this.http.get(`${environment.apiUrl}/reembolsos/${id}/conversacion`, { params: { despuesDe } });
    }
    destruir = takeUntilDestroyed();
    enviar() {
        const texto = this.borrador.trim();
        if (!texto || this.enviando() || !this.abierta())
            return;
        this.enviando.set(true);
        this.error.set('');
        this.http.post(`${environment.apiUrl}/reembolsos/${this.reembolsoId()}/conversacion`, { texto }).pipe(this.destruir, finalize(() => this.enviando.set(false))).subscribe({
            next: () => {
                this.borrador = '';
                this.actualizar.next();
            },
            error: (error) => this.error.set(error.message),
        });
    }
    static ɵfac = function ReembolsoChatComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ReembolsoChatComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ReembolsoChatComponent, selectors: [["app-reembolso-chat"]], inputs: { reembolsoId: [1, "reembolsoId"], vistaInquilino: [1, "vistaInquilino"] }, decls: 4, vars: 4, consts: [["titulo", "Conversaci\u00F3n de reembolso", "subtitulo", "Coordin\u00E1 la transferencia con Administraci\u00F3n.", 3, "mensajes", "vacio"], ["role", "alert", 1, "aviso"], [3, "texto", "deshabilitado"], [1, "aviso"], [3, "textoChange", "enviar", "texto", "deshabilitado"]], template: function ReembolsoChatComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "app-conversation-panel", 0);
            i0.ɵɵconditionalCreate(1, ReembolsoChatComponent_Conditional_1_Template, 2, 1, "p", 1);
            i0.ɵɵconditionalCreate(2, ReembolsoChatComponent_Conditional_2_Template, 1, 2, "app-conversation-composer", 2)(3, ReembolsoChatComponent_Conditional_3_Template, 2, 0, "p", 3);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵproperty("mensajes", ctx.hilo())("vacio", ctx.abierta() === null ? "Cargando conversaci\u00F3n\u2026" : "Todav\u00EDa no hay mensajes.");
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.error() ? 1 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.abierta() ? 2 : ctx.abierta() === false ? 3 : -1);
        } }, dependencies: [ConversationPanelComponent, ConversationComposerComponent], styles: ["[_nghost-%COMP%] { display: block; } .aviso[_ngcontent-%COMP%] { margin: 0; padding: 12px; color: #52607a; }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ReembolsoChatComponent, [{
        type: Component,
        args: [{ selector: 'app-reembolso-chat', imports: [ConversationPanelComponent, ConversationComposerComponent], changeDetection: ChangeDetectionStrategy.OnPush, template: `
    <app-conversation-panel titulo="Conversación de reembolso" subtitulo="Coordiná la transferencia con Administración."
      [mensajes]="hilo()" [vacio]="abierta() === null ? 'Cargando conversación…' : 'Todavía no hay mensajes.'">
      @if (error()) { <p class="aviso" role="alert">{{ error() }}</p> }
      @if (abierta()) {
        <app-conversation-composer [(texto)]="borrador" [deshabilitado]="enviando()" (enviar)="enviar()" />
      } @else if (abierta() === false) {
        <p class="aviso">La conversación está cerrada.</p>
      }
    </app-conversation-panel>
  `, styles: [":host { display: block; } .aviso { margin: 0; padding: 12px; color: #52607a; }"] }]
    }], () => [], { reembolsoId: [{ type: i0.Input, args: [{ isSignal: true, alias: "reembolsoId", required: true }] }], vistaInquilino: [{ type: i0.Input, args: [{ isSignal: true, alias: "vistaInquilino", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ReembolsoChatComponent, { className: "ReembolsoChatComponent", filePath: "src/app/shared/components/reembolso-chat/reembolso-chat.component.ts", lineNumber: 40 }); })();
