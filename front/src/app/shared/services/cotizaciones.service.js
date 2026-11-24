import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import * as i0 from "@angular/core";
export class CotizacionesService {
    http = inject(HttpClient);
    url = `${environment.apiUrl}/cotizaciones/administracion`;
    listar(desde = '', hasta = '', pagina = 1) {
        let params = new HttpParams().set('pagina', pagina);
        if (desde)
            params = params.set('desde', desde);
        if (hasta)
            params = params.set('hasta', hasta);
        return this.http.get(this.url, { params });
    }
    verificar() {
        return this.http.post(`${this.url}/verificar`, {});
    }
    static ɵfac = function CotizacionesService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CotizacionesService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: CotizacionesService, factory: CotizacionesService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CotizacionesService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
