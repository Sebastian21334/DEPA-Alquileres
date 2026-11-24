import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import * as i0 from "@angular/core";
export class AsistenteDepaService {
    // La consulta pública viaja sin el token de sesión.
    http = new HttpClient(inject(HttpBackend));
    consultar(mensajes) {
        return this.http.post(`${environment.apiUrl}/chatbot`, { mensajes }, { timeout: 25_000 });
    }
    static ɵfac = function AsistenteDepaService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AsistenteDepaService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: AsistenteDepaService, factory: AsistenteDepaService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AsistenteDepaService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
