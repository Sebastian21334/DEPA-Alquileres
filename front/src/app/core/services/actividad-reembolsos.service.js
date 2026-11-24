import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PLATFORM_ID, computed, effect, inject, Injectable, signal } from '@angular/core';
import { EMPTY, catchError, exhaustMap, merge, Subject, timer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import * as i0 from "@angular/core";
export class ActividadReembolsosService {
    http = inject(HttpClient);
    auth = inject(AuthService);
    navegador = isPlatformBrowser(inject(PLATFORM_ID));
    usuario = computed(() => this.auth.currentUser()?.sub, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "usuario" }] : /* istanbul ignore next */ []));
    actividad = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "actividad" }] : /* istanbul ignore next */ []));
    lecturas = signal({}, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "lecturas" }] : /* istanbul ignore next */ []));
    refresco = new Subject();
    pendientes = computed(() => new Set(this.actividad().filter(item => item.pendiente).map(item => item.reservaId)), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pendientes" }] : /* istanbul ignore next */ []));
    notificaciones = computed(() => this.actividad().filter(item => item.mensajeId !== null && item.mensajeId > (this.lecturas()[item.reembolsoId] ?? 0)), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "notificaciones" }] : /* istanbul ignore next */ []));
    constructor() {
        effect(onCleanup => {
            const usuario = this.usuario();
            this.actividad.set([]);
            this.lecturas.set({});
            if (!this.navegador || usuario == null)
                return;
            try {
                this.lecturas.set(JSON.parse(localStorage.getItem(this.clave(usuario)) ?? '{}') ?? {});
            }
            catch { /* La lectura funciona en memoria si el navegador bloquea el almacenamiento. */ }
            const consulta = merge(timer(0, 15000), this.refresco).pipe(exhaustMap(() => this.http.get(`${environment.apiUrl}/reembolsos/actividad`).pipe(catchError(() => EMPTY)))).subscribe(items => this.actividad.set(items));
            onCleanup(() => consulta.unsubscribe());
        });
    }
    actualizar() {
        this.refresco.next();
    }
    marcarLeido(reembolsoId, mensajeId) {
        const usuario = this.usuario();
        if (!this.navegador || usuario == null || mensajeId <= (this.lecturas()[reembolsoId] ?? 0))
            return;
        this.lecturas.update(actuales => ({ ...actuales, [reembolsoId]: mensajeId }));
        try {
            localStorage.setItem(this.clave(usuario), JSON.stringify(this.lecturas()));
        }
        catch { /* La lectura sigue registrada durante la sesión. */ }
    }
    clave(usuario) {
        return `depa:lecturas-reembolso:${usuario}`;
    }
    static ɵfac = function ActividadReembolsosService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ActividadReembolsosService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: ActividadReembolsosService, factory: ActividadReembolsosService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ActividadReembolsosService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [], null); })();
