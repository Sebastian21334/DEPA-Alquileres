import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import * as i0 from "@angular/core";
export class AnunciantePublicoService {
    http = inject(HttpClient);
    api = environment.apiUrl;
    getPublicProfile(id) {
        return this.http.get(`${this.api}/anunciantes/${id}/publico`);
    }
    static ɵfac = function AnunciantePublicoService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AnunciantePublicoService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: AnunciantePublicoService, factory: AnunciantePublicoService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AnunciantePublicoService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
