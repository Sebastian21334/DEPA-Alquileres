import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import * as i0 from "@angular/core";
const TOKEN_KEY = 'auth_token';
// Implementa RF2 (autenticación) y el alta de usuarios de RF1: registro, login,
// consumo del link de verificación de email y logout. Toda la persistencia de
// sesión es un JWT de corta duración guardado en localStorage (ver RNF3/diseño:
// "JWT de corta duración junto con un mecanismo de refresh token" — el backend
// todavía no expone el refresh token, así que por ahora solo se maneja el
// access_token; cuando el backend lo agregue, este service es el único lugar
// a tocar).
export class AuthService {
    http = inject(HttpClient);
    platformId = inject(PLATFORM_ID);
    isBrowser = isPlatformBrowser(this.platformId);
    baseUrl = `${environment.apiUrl}/auth`;
    tokenBloqueo = null;
    // Signal de solo-lectura que expone el usuario autenticado (o null).
    currentUser = signal(this.leerPayloadInicial(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "currentUser" }] : /* istanbul ignore next */ []));
    get isAuthenticated() {
        return this.currentUser() !== null;
    }
    get token() {
        return this.isBrowser ? localStorage.getItem(TOKEN_KEY) : null;
    }
    get isAdmin() {
        const usuario = this.currentUser();
        return !!usuario && !usuario.accesoLimitado && usuario.rol === 'Administrador';
    }
    actualizarEstadoSesion(estado) {
        this.currentUser.update((usuario) => {
            if (!usuario)
                return usuario;
            const rol = estado.rol === undefined ? usuario.rol : estado.rol ?? undefined;
            if (Boolean(usuario.accesoLimitado) === estado.accesoLimitado &&
                Boolean(usuario.anuncianteVerificado) === estado.anuncianteVerificado && usuario.rol === rol)
                return usuario;
            return { ...usuario, ...estado, rol };
        });
    }
    consultarSesion() {
        return this.http.get(`${this.baseUrl}/sesion`)
            .pipe(tap((estado) => this.actualizarEstadoSesion(estado)));
    }
    /** Registra la cuenta y envía el correo de verificación. */
    register(dto) {
        return this.http.post(`${this.baseUrl}/register`, dto);
    }
    solicitarReactivacion(email, constanciaReactivacion) {
        return this.http.post(`${this.baseUrl}/reactivar-cuenta/solicitar`, { email, constanciaReactivacion });
    }
    confirmarReactivacion(token) {
        return this.http.post(`${this.baseUrl}/reactivar-cuenta/confirmar`, { token });
    }
    /** POST /auth/verificar-cuenta — consume el token del link recibido por mail. */
    verificarCuenta(token) {
        return this.http.post(`${this.baseUrl}/verificar-cuenta`, { token });
    }
    /**
     * POST /auth/recuperar-contrasenia — pide el mail con el link de
     * restablecimiento. El backend siempre devuelve el mismo mensaje neutro
     * exista o no la cuenta (evita que alguien pueda usar este endpoint para
     * confirmar qué emails están registrados), así que no hay un "caso de
     * error" propio de negocio acá, solo errores de red/validación.
     */
    solicitarRecuperacion(email) {
        return this.http.post(`${this.baseUrl}/recuperar-contrasenia`, { email });
    }
    /** POST /auth/restablecer-contrasenia — consume el token del link y fija la nueva contraseña. */
    restablecerContrasenia(token, nuevaContrasenia, confirmarContrasenia) {
        return this.http.post(`${this.baseUrl}/restablecer-contrasenia`, {
            token,
            nuevaContrasenia,
            confirmarContrasenia,
        });
    }
    cambiarContrasenia(contraseniaActual, nuevaContrasenia, confirmarContrasenia) {
        return this.http.patch(`${this.baseUrl}/cambiar-contrasenia`, {
            contraseniaActual,
            nuevaContrasenia,
            confirmarContrasenia,
        });
    }
    /** POST /auth/login — valida credenciales y guarda el JWT devuelto. */
    login(dto) {
        this.tokenBloqueo = null;
        return this.http
            .post(`${this.baseUrl}/login`, dto)
            .pipe(tap((res) => this.guardarSesion(res.access_token)));
    }
    consultarBloqueo(token) {
        return token
            ? this.http.post(`${this.baseUrl}/bloqueo/consultar`, { token })
            : this.http.get(`${this.baseUrl}/bloqueo/actual`);
    }
    apelarBloqueo(token, texto, imagen) {
        const datos = new FormData();
        datos.append('texto', texto);
        if (token)
            datos.append('token', token);
        if (imagen)
            datos.append('imagen', imagen);
        return this.http.post(`${this.baseUrl}/bloqueo/${token ? 'mensajes' : 'actual/mensajes'}`, datos);
    }
    /** POST /auth/reenviar-verificacion — solicita un nuevo mail para una cuenta pendiente. */
    reenviarVerificacion(dto) {
        return this.http.post(`${this.baseUrl}/reenviar-verificacion`, dto);
    }
    /** Cierra la sesión activa (borra el token y limpia el estado en memoria). */
    logout() {
        this.tokenBloqueo = null;
        if (this.isBrowser)
            localStorage.removeItem(TOKEN_KEY);
        this.currentUser.set(null);
    }
    guardarSesion(token) {
        if (this.isBrowser)
            localStorage.setItem(TOKEN_KEY, token);
        this.currentUser.set(this.decodificar(token));
    }
    leerPayloadInicial() {
        if (!this.isBrowser)
            return null; // en SSR no hay localStorage
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token)
            return null;
        const payload = this.decodificar(token);
        if (!payload || this.expirado(payload)) {
            localStorage.removeItem(TOKEN_KEY);
            return null;
        }
        return payload;
    }
    decodificar(token) {
        try {
            const [, payloadBase64] = token.split('.');
            const json = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
            return JSON.parse(json);
        }
        catch {
            return null;
        }
    }
    expirado(payload) {
        return !payload.exp || Date.now() >= payload.exp * 1000;
    }
    static ɵfac = function AuthService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AuthService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: AuthService, factory: AuthService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AuthService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
