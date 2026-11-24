import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { EMPTY, Subject, catchError, exhaustMap, merge, timer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import * as i0 from "@angular/core";
const MAX_VENTANAS = 3;
// Consume el módulo `mensajes` del backend y mantiene las ventanitas de chat
// abiertas (tipo Facebook) abajo a la derecha, compartidas por toda la app.
export class ChatService {
    http = inject(HttpClient);
    auth = inject(AuthService);
    navegador = isPlatformBrowser(inject(PLATFORM_ID));
    baseUrl = `${environment.apiUrl}/mensajes`;
    refresco = new Subject();
    abiertos = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "abiertos" }] : /* istanbul ignore next */ []));
    /** Bandeja del usuario, compartida por la burbuja del chat y la campana de notificaciones. */
    conversaciones = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "conversaciones" }] : /* istanbul ignore next */ []));
    mensajesNoLeidos = computed(() => this.conversaciones().reduce((total, conversacion) => total + conversacion.cantidadNoLeidos, 0), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mensajesNoLeidos" }] : /* istanbul ignore next */ []));
    constructor() {
        // Un solo sondeo por pestaña: antes la burbuja y la campana pedían la bandeja cada una por su lado.
        effect(onCleanup => {
            const usuario = this.auth.currentUser()?.sub;
            this.conversaciones.set([]);
            if (!this.navegador || usuario == null)
                return;
            const consulta = merge(timer(0, 5000), this.refresco).pipe(exhaustMap(() => this.listarConversaciones().pipe(catchError(() => EMPTY)))).subscribe(lista => this.conversaciones.set(lista));
            onCleanup(() => consulta.unsubscribe());
        });
    }
    /** Pide la bandeja ya, sin esperar el próximo sondeo. */
    actualizar() {
        this.refresco.next();
    }
    /** GET /mensajes — una fila por conversación, con el último mensaje. */
    listarConversaciones() {
        return this.http.get(this.baseUrl);
    }
    /** GET /mensajes/publicacion/:idPublicacion/usuario/:idOtroUsuario */
    listarMensajes(idPublicacion, idOtroUsuario) {
        return this.http.get(`${this.baseUrl}/publicacion/${idPublicacion}/usuario/${idOtroUsuario}`);
    }
    /** POST /mensajes */
    enviar(idPublicacion, idDestino, texto) {
        return this.http.post(this.baseUrl, {
            id_publicacion: idPublicacion,
            id_destino_usuario: idDestino,
            texto,
        });
    }
    marcarComoLeidos(idPublicacion, idOtroUsuario) {
        return this.http.patch(`${this.baseUrl}/publicacion/${idPublicacion}/usuario/${idOtroUsuario}/leer`, {});
    }
    abrir(chat) {
        this.abiertos.update((lista) => {
            const resto = lista.filter((c) => !this.esMismo(c, chat));
            // El más reciente queda primero (a la derecha) y se descarta el más viejo.
            return [{ ...chat, minimizado: false }, ...resto].slice(0, MAX_VENTANAS);
        });
    }
    cerrar(chat) {
        this.abiertos.update((lista) => lista.filter((c) => !this.esMismo(c, chat)));
    }
    alternarMinimizado(chat) {
        this.abiertos.update((lista) => lista.map((c) => (this.esMismo(c, chat) ? { ...c, minimizado: !c.minimizado } : c)));
    }
    cerrarTodos() {
        this.abiertos.set([]);
        this.conversaciones.set([]);
    }
    esMismo(a, b) {
        return a.idPublicacion === b.idPublicacion && a.idOtroUsuario === b.idOtroUsuario;
    }
    static ɵfac = function ChatService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ChatService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: ChatService, factory: ChatService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ChatService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [], null); })();
