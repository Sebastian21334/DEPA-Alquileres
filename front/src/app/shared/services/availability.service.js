import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import * as i0 from "@angular/core";
export class AvailabilityService {
    http = inject(HttpClient);
    baseUrl = `${environment.apiUrl}/disponibilidad`;
    getByPublication(idPublicacion) {
        return this.http.get(`${this.baseUrl}/publicacion/${idPublicacion}`);
    }
    getForAdministration(idPublicacion) {
        return this.http.get(`${this.baseUrl}/publicacion/${idPublicacion}/administracion`);
    }
    addRange(idPublicacion, start, end) {
        return this.http.post(this.baseUrl, {
            id_publicacion: idPublicacion,
            fecha_inicio: start,
            fecha_fin: end,
        });
    }
    setAvailable(id, disponible) {
        return this.http.patch(`${this.baseUrl}/${id}`, { disponible });
    }
    static ɵfac = function AvailabilityService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AvailabilityService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: AvailabilityService, factory: AvailabilityService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AvailabilityService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
