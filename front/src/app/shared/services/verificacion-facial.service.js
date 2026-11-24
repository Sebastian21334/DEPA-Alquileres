import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import * as i0 from "@angular/core";
export class VerificacionFacialService {
    http = inject(HttpClient);
    api = `${environment.apiUrl}/anunciantes/verificacion-facial`;
    crearDesafio() {
        return this.http.get(`${this.api}/desafio`);
    }
    cambiarDesafio(challengeToken) {
        return this.http.post(`${this.api}/desafio/cambiar`, { challengeToken });
    }
    validarVitalidad(challengeToken, neutralPhoto, actionPhotos, livePhoto) {
        const body = new FormData();
        body.append('challengeToken', challengeToken);
        body.append('neutralPhoto', neutralPhoto);
        // Cada gesto viaja con dos capturas separadas por pocos milisegundos;
        // el backend acepta la primera que logre validar.
        actionPhotos.forEach((frames, index) => {
            frames.forEach((frame) => body.append(`action${index}`, frame));
        });
        body.append('livePhoto', livePhoto);
        return this.http.post(`${this.api}/validar`, body);
    }
    static ɵfac = function VerificacionFacialService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || VerificacionFacialService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: VerificacionFacialService, factory: VerificacionFacialService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(VerificacionFacialService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
