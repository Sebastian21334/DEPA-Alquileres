import { Component, computed, inject, input, signal } from '@angular/core';
import { GestionPublicacionesService } from '../../services/gestion-publicaciones.service';
import { VerComprobanteComponent } from '../ver-comprobante/ver-comprobante.component';
import { DesglosePagoComponent } from '../desglose-pago/desglose-pago.component';
import { formatearImporteConMoneda } from '../../utils/formato-numero';
import * as i0 from "@angular/core";
const _forTrack0 = ($index, $item) => $item.id;
function HistorialLiquidacionesComponent_Conditional_0_For_2_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 4);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const pago_r1 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(pago_r1.publicacion);
} }
function HistorialLiquidacionesComponent_Conditional_0_For_2_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const pago_r1 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵtextInterpolate1(" \u00B7 ", ctx_r1.fecha(pago_r1.fecha), " ");
} }
function HistorialLiquidacionesComponent_Conditional_0_For_2_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "app-desglose-pago", 5);
} if (rf & 2) {
    const pago_r1 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("desglose", ctx)("moneda", pago_r1.moneda);
} }
function HistorialLiquidacionesComponent_Conditional_0_For_2_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 6)(1, "strong");
    i0.ɵɵtext(2, "Comprobante:");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(3, "app-ver-comprobante", 8);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const pago_r1 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("obtenerUrl", ctx_r1.urlComprobante(pago_r1))("etiqueta", "Ver " + pago_r1.comprobante);
} }
function HistorialLiquidacionesComponent_Conditional_0_For_2_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p")(1, "strong");
    i0.ɵɵtext(2, "N\u00FAmero de operaci\u00F3n:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const pago_r1 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", pago_r1.referencia);
} }
function HistorialLiquidacionesComponent_Conditional_0_For_2_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 7)(1, "strong");
    i0.ɵɵtext(2, "Observaci\u00F3n del pago:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const pago_r1 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", pago_r1.observacion);
} }
function HistorialLiquidacionesComponent_Conditional_0_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "header")(2, "strong");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 3);
    i0.ɵɵtext(5, "Pago registrado");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(6, HistorialLiquidacionesComponent_Conditional_0_For_2_Conditional_6_Template, 2, 1, "p", 4);
    i0.ɵɵelementStart(7, "p");
    i0.ɵɵtext(8);
    i0.ɵɵconditionalCreate(9, HistorialLiquidacionesComponent_Conditional_0_For_2_Conditional_9_Template, 1, 1);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(10, HistorialLiquidacionesComponent_Conditional_0_For_2_Conditional_10_Template, 1, 2, "app-desglose-pago", 5);
    i0.ɵɵconditionalCreate(11, HistorialLiquidacionesComponent_Conditional_0_For_2_Conditional_11_Template, 4, 2, "p", 6);
    i0.ɵɵconditionalCreate(12, HistorialLiquidacionesComponent_Conditional_0_For_2_Conditional_12_Template, 4, 1, "p");
    i0.ɵɵconditionalCreate(13, HistorialLiquidacionesComponent_Conditional_0_For_2_Conditional_13_Template, 4, 1, "p", 7);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_15_0;
    const pago_r1 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.importe(pago_r1));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.mostrarPublicacion() && pago_r1.publicacion ? 6 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("Reserva #", pago_r1.reservaId, " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(pago_r1.fecha ? 9 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_15_0 = pago_r1.desglose) ? 10 : -1, tmp_15_0);
    i0.ɵɵadvance();
    i0.ɵɵconditional(pago_r1.comprobante ? 11 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(pago_r1.referencia ? 12 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(pago_r1.observacion ? 13 : -1);
} }
function HistorialLiquidacionesComponent_Conditional_0_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 9);
    i0.ɵɵlistener("click", function HistorialLiquidacionesComponent_Conditional_0_Conditional_3_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.verTodos.set(!ctx_r1.verTodos())); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵattribute("aria-expanded", ctx_r1.verTodos());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.verTodos() ? "Ver menos" : "Ver todos (" + ctx_r1.pagos().length + ")", " ");
} }
function HistorialLiquidacionesComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 1);
    i0.ɵɵrepeaterCreate(1, HistorialLiquidacionesComponent_Conditional_0_For_2_Template, 14, 8, "li", null, _forTrack0);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, HistorialLiquidacionesComponent_Conditional_0_Conditional_3_Template, 2, 2, "button", 2);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.visibles());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.ocultos() > 0 || ctx_r1.verTodos() ? 3 : -1);
} }
function HistorialLiquidacionesComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 0);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.vacio());
} }
/**
 * Lista de pagos registrados al anunciante. La usan Mis publicaciones,
 * por publicación, y el panel del anunciante, con todas sus publicaciones.
 */
export class HistorialLiquidacionesComponent {
    /** Pagos ordenados del más reciente al más antiguo, como los devuelve el back. */
    pagos = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pagos" }] : /* istanbul ignore next */ []));
    mostrarPublicacion = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mostrarPublicacion" }] : /* istanbul ignore next */ []));
    /** Cantidad visible antes de «Ver todos»; sin límite muestra todos. */
    limite = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "limite" }] : /* istanbul ignore next */ []));
    vacio = input('Todavía no hay pagos registrados.', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "vacio" }] : /* istanbul ignore next */ []));
    verTodos = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "verTodos" }] : /* istanbul ignore next */ []));
    visibles = computed(() => {
        const limite = this.limite();
        return limite === null || this.verTodos() ? this.pagos() : this.pagos().slice(0, limite);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "visibles" }] : /* istanbul ignore next */ []));
    ocultos = computed(() => this.pagos().length - this.visibles().length, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ocultos" }] : /* istanbul ignore next */ []));
    publicaciones = inject(GestionPublicacionesService);
    urlComprobante = (pago) => () => this.publicaciones.urlComprobantePago(pago);
    importe(pago) {
        return pago.importe === null ? 'Importe sin registrar' : formatearImporteConMoneda(pago.importe, pago.moneda);
    }
    fecha(valor) {
        return new Date(valor).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
    }
    static ɵfac = function HistorialLiquidacionesComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || HistorialLiquidacionesComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: HistorialLiquidacionesComponent, selectors: [["app-historial-liquidaciones"]], inputs: { pagos: [1, "pagos"], mostrarPublicacion: [1, "mostrarPublicacion"], limite: [1, "limite"], vacio: [1, "vacio"] }, decls: 2, vars: 1, consts: [["role", "status"], [1, "liquidaciones-lista"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", "acct-btn--sm"], [1, "acct-badge", "acct-badge--ok"], [1, "liquidacion-publicacion"], [1, "liquidacion-desglose", 3, "desglose", "moneda"], [1, "liquidacion-comprobante"], [1, "liquidacion-observacion"], [3, "obtenerUrl", "etiqueta"], ["type", "button", 1, "acct-btn", "acct-btn--ghost", "acct-btn--sm", 3, "click"]], template: function HistorialLiquidacionesComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, HistorialLiquidacionesComponent_Conditional_0_Template, 4, 1)(1, HistorialLiquidacionesComponent_Conditional_1_Template, 2, 1, "p", 0);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.pagos().length ? 0 : 1);
        } }, dependencies: [VerComprobanteComponent, DesglosePagoComponent], styles: ["[_nghost-%COMP%] { display: grid; gap: .75rem; justify-items: start; }\n    .liquidaciones-lista[_ngcontent-%COMP%] { display: grid; gap: .6rem; width: 100%; padding: 0; margin: 0; list-style: none; }\n    .liquidaciones-lista[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] {\n      padding: .75rem;\n      border: 1px solid var(--%NS%color-border);\n      border-radius: var(--%NS%radius-sm);\n      overflow-wrap: anywhere;\n    }\n    .liquidaciones-lista[_ngcontent-%COMP%]   header[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }\n    .liquidaciones-lista[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], [_nghost-%COMP%]    > p[_ngcontent-%COMP%] { margin: .35rem 0 0; font-size: .9rem; }\n    .liquidacion-publicacion[_ngcontent-%COMP%] { font-weight: 700; }\n    .liquidacion-observacion[_ngcontent-%COMP%] { white-space: pre-wrap; }\n    .liquidacion-comprobante[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; align-items: center; gap: .4rem; }\n    .liquidacion-desglose[_ngcontent-%COMP%] { max-width: 22rem; }"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HistorialLiquidacionesComponent, [{
        type: Component,
        args: [{ selector: 'app-historial-liquidaciones', imports: [VerComprobanteComponent, DesglosePagoComponent], template: `
    @if (pagos().length) {
      <ul class="liquidaciones-lista">
        @for (pago of visibles(); track pago.id) {
          <li>
            <header>
              <strong>{{ importe(pago) }}</strong>
              <span class="acct-badge acct-badge--ok">Pago registrado</span>
            </header>
            @if (mostrarPublicacion() && pago.publicacion) {
              <p class="liquidacion-publicacion">{{ pago.publicacion }}</p>
            }
            <p>Reserva #{{ pago.reservaId }} @if (pago.fecha) { · {{ fecha(pago.fecha) }} }</p>
            @if (pago.desglose; as desglose) {
              <app-desglose-pago class="liquidacion-desglose" [desglose]="desglose" [moneda]="pago.moneda" />
            }
            @if (pago.comprobante) {
              <p class="liquidacion-comprobante"><strong>Comprobante:</strong> <app-ver-comprobante [obtenerUrl]="urlComprobante(pago)" [etiqueta]="'Ver ' + pago.comprobante" /></p>
            }
            @if (pago.referencia) {
              <p><strong>Número de operación:</strong> {{ pago.referencia }}</p>
            }
            @if (pago.observacion) {
              <p class="liquidacion-observacion"><strong>Observación del pago:</strong> {{ pago.observacion }}</p>
            }
          </li>
        }
      </ul>
      @if (ocultos() > 0 || verTodos()) {
        <button type="button" class="acct-btn acct-btn--ghost acct-btn--sm" (click)="verTodos.set(!verTodos())"
          [attr.aria-expanded]="verTodos()">
          {{ verTodos() ? 'Ver menos' : 'Ver todos (' + pagos().length + ')' }}
        </button>
      }
    } @else {
      <p role="status">{{ vacio() }}</p>
    }
  `, styles: ["\n    :host { display: grid; gap: .75rem; justify-items: start; }\n    .liquidaciones-lista { display: grid; gap: .6rem; width: 100%; padding: 0; margin: 0; list-style: none; }\n    .liquidaciones-lista li {\n      padding: .75rem;\n      border: 1px solid var(--color-border);\n      border-radius: var(--radius-sm);\n      overflow-wrap: anywhere;\n    }\n    .liquidaciones-lista header { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }\n    .liquidaciones-lista p, :host > p { margin: .35rem 0 0; font-size: .9rem; }\n    .liquidacion-publicacion { font-weight: 700; }\n    .liquidacion-observacion { white-space: pre-wrap; }\n    .liquidacion-comprobante { display: flex; flex-wrap: wrap; align-items: center; gap: .4rem; }\n    .liquidacion-desglose { max-width: 22rem; }\n  "] }]
    }], null, { pagos: [{ type: i0.Input, args: [{ isSignal: true, alias: "pagos", required: true }] }], mostrarPublicacion: [{ type: i0.Input, args: [{ isSignal: true, alias: "mostrarPublicacion", required: false }] }], limite: [{ type: i0.Input, args: [{ isSignal: true, alias: "limite", required: false }] }], vacio: [{ type: i0.Input, args: [{ isSignal: true, alias: "vacio", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(HistorialLiquidacionesComponent, { className: "HistorialLiquidacionesComponent", filePath: "src/app/shared/components/historial-liquidaciones/historial-liquidaciones.component.ts", lineNumber: 69 }); })();
