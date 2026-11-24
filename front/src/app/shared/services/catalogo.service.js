import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import * as i0 from "@angular/core";
// Consume el módulo `catalogos` del backend (back/src/catalogos). Son lecturas
// públicas (sin JWT) usadas para poblar selectores de filtros.
export class CatalogoService {
    http = inject(HttpClient);
    baseUrl = `${environment.apiUrl}/catalogos`;
    /** GET /catalogos/tipos-propiedad */
    getTiposPropiedad() {
        return this.http.get(`${this.baseUrl}/tipos-propiedad`);
    }
    /** GET /catalogos/modalidades */
    getModalidades() {
        return this.http.get(`${this.baseUrl}/modalidades`);
    }
    /** GET /catalogos/tipos-anunciante */
    getTiposAnunciante() {
        return this.http.get(`${this.baseUrl}/tipos-anunciante`);
    }
    /** GET /catalogos/tipos-moneda */
    getTiposMoneda() {
        return this.http.get(`${this.baseUrl}/tipos-moneda`);
    }
    static ɵfac = function CatalogoService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CatalogoService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: CatalogoService, factory: CatalogoService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CatalogoService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
