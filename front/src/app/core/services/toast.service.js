import { Injectable, signal } from '@angular/core';
import * as i0 from "@angular/core";
export class ToastService {
    aviso = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "aviso" }] : /* istanbul ignore next */ []));
    timer = null;
    mostrar(mensaje, tipo = 'info') {
        this.aviso.set({ mensaje, tipo });
        if (this.timer)
            clearTimeout(this.timer);
        this.timer = setTimeout(() => this.cerrar(), tipo === 'error' || tipo === 'advertencia' ? 9000 : 6000);
    }
    cerrar() {
        this.aviso.set(null);
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }
    static ɵfac = function ToastService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ToastService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: ToastService, factory: ToastService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ToastService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
