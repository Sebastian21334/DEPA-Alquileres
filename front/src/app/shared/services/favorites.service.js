import { HttpClient } from '@angular/common/http';
import { Injectable, effect, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import * as i0 from "@angular/core";
export class FavoritesService {
    http = inject(HttpClient);
    auth = inject(AuthService);
    baseUrl = `${environment.apiUrl}/favoritos`;
    ids = signal(new Set(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ids" }] : /* istanbul ignore next */ []));
    loadedForUser = null;
    constructor() {
        effect(() => {
            const idUsuario = this.auth.currentUser()?.sub ?? null;
            if (idUsuario === null) {
                this.loadedForUser = null;
                this.ids.set(new Set());
                return;
            }
            if (this.loadedForUser === idUsuario)
                return;
            this.loadedForUser = idUsuario;
            this.list().subscribe({ error: () => this.ids.set(new Set()) });
        });
    }
    isFavorite(idPublicacion) {
        return this.ids().has(idPublicacion);
    }
    list() {
        return this.http.get(this.baseUrl).pipe(tap((items) => this.ids.set(new Set(items.map((item) => item.id)))));
    }
    toggle(idPublicacion) {
        const favorito = this.isFavorite(idPublicacion);
        const request = favorito
            ? this.http.delete(`${this.baseUrl}/${idPublicacion}`)
            : this.http.post(`${this.baseUrl}/${idPublicacion}`, {});
        return request.pipe(tap((result) => {
            const next = new Set(this.ids());
            result.favorito ? next.add(idPublicacion) : next.delete(idPublicacion);
            this.ids.set(next);
        }));
    }
    static ɵfac = function FavoritesService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || FavoritesService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: FavoritesService, factory: FavoritesService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FavoritesService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [], null); })();
