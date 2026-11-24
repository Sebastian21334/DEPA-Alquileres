import { Location } from '@angular/common';
import { computed, Directive, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import * as i0 from "@angular/core";
/**
 * Enlace «Volver» a la pantalla anterior de DEPA, como la flecha del navegador.
 * Si se entró directo (enlace pegado o recarga), lleva a la ruta de respaldo.
 * Uso: `<a appVolver="/admin" fragmentoVolver="reclamos">← Volver</a>`.
 */
export class VolverDirective {
    /** Ruta de respaldo. */
    appVolver = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "appVolver" }] : /* istanbul ignore next */ []));
    fragmentoVolver = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "fragmentoVolver" }] : /* istanbul ignore next */ []));
    router = inject(Router);
    location = inject(Location);
    destino = computed(() => this.router.createUrlTree([this.appVolver()], { fragment: this.fragmentoVolver() }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "destino" }] : /* istanbul ignore next */ []));
    href = computed(() => this.router.serializeUrl(this.destino()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "href" }] : /* istanbul ignore next */ []));
    volver(evento) {
        // Con Ctrl, Shift, Alt o la rueda, el respaldo se abre en otra pestaña como cualquier enlace.
        if (evento.button !== 0 || evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey)
            return;
        evento.preventDefault();
        if (this.router.lastSuccessfulNavigation()?.previousNavigation)
            this.location.back();
        else
            void this.router.navigateByUrl(this.destino());
    }
    static ɵfac = function VolverDirective_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || VolverDirective)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: VolverDirective, selectors: [["a", "appVolver", ""]], hostVars: 1, hostBindings: function VolverDirective_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("click", function VolverDirective_click_HostBindingHandler($event) { return ctx.volver($event); });
        } if (rf & 2) {
            i0.ɵɵattribute("href", ctx.href(), i0.ɵɵsanitizeUrlOrResourceUrl);
        } }, inputs: { appVolver: [1, "appVolver"], fragmentoVolver: [1, "fragmentoVolver"] } });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(VolverDirective, [{
        type: Directive,
        args: [{
                selector: 'a[appVolver]',
                host: { '[attr.href]': 'href()', '(click)': 'volver($event)' },
            }]
    }], null, { appVolver: [{ type: i0.Input, args: [{ isSignal: true, alias: "appVolver", required: true }] }], fragmentoVolver: [{ type: i0.Input, args: [{ isSignal: true, alias: "fragmentoVolver", required: false }] }] }); })();
