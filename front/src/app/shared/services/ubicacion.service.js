import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import * as i0 from "@angular/core";
export class UbicacionService {
    http = inject(HttpClient);
    baseUrl = `${environment.apiUrl}/ubicacion`;
    /** GET /ubicacion/provincias */
    getProvincias() {
        return this.http.get(`${this.baseUrl}/provincias`);
    }
    /** GET /ubicacion/provincias/:id/ciudades */
    getCiudadesPorProvincia(idProvincia) {
        return this.http.get(`${this.baseUrl}/provincias/${idProvincia}/ciudades`);
    }
    /** Búsqueda puntual; el usuario la inicia con el botón del selector de mapa. */
    buscarDireccion(direccion, ciudad, provincia) {
        return this.http.get(`${this.baseUrl}/buscar-direccion`, {
            params: { direccion, ciudad, provincia },
        });
    }
    static ɵfac = function UbicacionService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || UbicacionService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: UbicacionService, factory: UbicacionService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(UbicacionService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
