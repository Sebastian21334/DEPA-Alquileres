import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, map, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import * as i0 from "@angular/core";
// Estado de la cuenta del usuario logueado: datos personales (GET /usuarios/me)
// y su solicitud de anunciante (GET /anunciantes/mi-solicitud). La navbar lo usa
// para decidir qué accesos mostrar y los guards para proteger rutas de anunciante.
export class PerfilService {
    http = inject(HttpClient);
    auth = inject(AuthService);
    isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    api = environment.apiUrl;
    solicitud = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "solicitud" }] : /* istanbul ignore next */ []));
    /** Datos del usuario logueado, para mostrar su nombre en el header. */
    usuario = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "usuario" }] : /* istanbul ignore next */ []));
    esAnuncianteVerificado = computed(() => this.solicitud()?.estado === 'aprobada', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "esAnuncianteVerificado" }] : /* istanbul ignore next */ []));
    necesitaCbu = computed(() => this.esAnuncianteVerificado() && !this.solicitud()?.cbu_ultimos_digitos, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "necesitaCbu" }] : /* istanbul ignore next */ []));
    cbuEnRevision = computed(() => this.esAnuncianteVerificado() && !!this.solicitud()?.cbu_en_revision, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "cbuEnRevision" }] : /* istanbul ignore next */ []));
    usuarioConsultado = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "usuarioConsultado" }] : /* istanbul ignore next */ []));
    solicitudConsultada = computed(() => this.usuarioConsultado() === (this.auth.currentUser()?.sub ?? null), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "solicitudConsultada" }] : /* istanbul ignore next */ []));
    errorSolicitud = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errorSolicitud" }] : /* istanbul ignore next */ []));
    // Cachea la solicitud por sesión para que navbar + guard no dupliquen el request.
    solicitud$ = null;
    solicitudDeUsuario = null;
    cambiarPausaActividades(pausadas) {
        return this.http.patch(`${this.api}/usuarios/me/actividades`, {
            actividades_pausadas: pausadas,
        }).pipe(tap(({ actividades_pausadas }) => {
            this.solicitud.update(solicitud => solicitud && {
                ...solicitud,
                anunciante: { ...solicitud.anunciante, actividades_pausadas },
            });
            this.solicitud$ = null;
        }));
    }
    getPerfil() {
        return this.http
            .get(`${this.api}/usuarios/me`)
            .pipe(tap((perfil) => this.usuario.set(perfil)));
    }
    /** PATCH /usuarios/:id — el backend solo permite modificar los datos propios. */
    actualizarPerfil(id, dto) {
        return this.http
            .patch(`${this.api}/usuarios/${id}`, dto)
            .pipe(tap((perfil) => this.usuario.set(perfil)));
    }
    solicitarBajaCuenta() {
        return this.http.post(`${this.api}/usuarios/me/baja`, {});
    }
    confirmarBajaCuenta(token) {
        return this.http.post(`${this.api}/usuarios/baja/confirmar`, { token });
    }
    /** POST /usuarios/me/foto (multipart, campo "foto"). */
    subirFoto(archivo) {
        const body = new FormData();
        body.append('foto', archivo);
        return this.http
            .post(`${this.api}/usuarios/me/foto`, body)
            .pipe(tap((perfil) => this.usuario.set(perfil)));
    }
    /** DELETE /usuarios/me/foto */
    eliminarFoto() {
        return this.http
            .delete(`${this.api}/usuarios/me/foto`)
            .pipe(tap((perfil) => this.usuario.set(perfil)));
    }
    /** Devuelve la solicitud de anunciante (null si nunca la pidió). */
    cargarSolicitud(forzar = false) {
        const idUsuario = this.auth.currentUser()?.sub ?? null;
        if (!this.isBrowser || idUsuario === null) {
            this.limpiar();
            return of(null);
        }
        if (!forzar && this.solicitud$ && this.solicitudDeUsuario === idUsuario)
            return this.solicitud$;
        this.solicitudDeUsuario = idUsuario;
        this.errorSolicitud.set(false);
        const consulta = this.http.get(`${this.api}/anunciantes/mi-solicitud`).pipe(tap((solicitud) => {
            if (this.solicitud$ !== consulta || this.auth.currentUser()?.sub !== idUsuario)
                return;
            this.solicitud.set(solicitud);
            this.usuarioConsultado.set(idUsuario);
        }), catchError(() => {
            if (this.solicitud$ === consulta && this.auth.currentUser()?.sub === idUsuario) {
                this.solicitud$ = null;
                this.errorSolicitud.set(true);
            }
            return of(this.usuarioConsultado() === idUsuario ? this.solicitud() : null);
        }), shareReplay(1));
        this.solicitud$ = consulta;
        return consulta;
    }
    esAnunciante() {
        return this.cargarSolicitud().pipe(map((s) => s?.estado === 'aprobada'));
    }
    limpiar() {
        this.solicitud$ = null;
        this.solicitudDeUsuario = null;
        this.usuarioConsultado.set(null);
        this.errorSolicitud.set(false);
        this.solicitud.set(null);
        this.usuario.set(null);
    }
    /** POST /anunciantes/solicitar */
    solicitarAnunciante(dto) {
        return this.http.post(`${this.api}/anunciantes/solicitar`, dto);
    }
    solicitarCambioCbu(cbu) {
        return this.http.patch(`${this.api}/anunciantes/mi-solicitud/cbu`, { cbu, titularidad_declarada: true }).pipe(tap(() => {
            this.solicitud.update(solicitud => solicitud && { ...solicitud, cbu_en_revision: true, motivo_rechazo_cbu: null });
            this.solicitud$ = null;
        }));
    }
    actualizarDatosSolicitud(dto) {
        return this.http.patch(`${this.api}/anunciantes/mi-solicitud/datos`, dto).pipe(tap(() => {
            this.solicitud$ = null;
        }));
    }
    /** POST /anunciantes/mi-solicitud/documentos o /reenviar si la anterior fue rechazada. */
    subirDocumentos(docs, reenvio) {
        const body = new FormData();
        body.append('dni_frente', docs.dni_frente);
        body.append('dni_dorso', docs.dni_dorso);
        body.append('rostro', docs.rostro);
        body.append('verificationToken', docs.verificationToken);
        if (docs.matricula)
            body.append('matricula', docs.matricula);
        if (docs.constancia_cuit)
            body.append('constancia_cuit', docs.constancia_cuit);
        const accion = reenvio ? 'reenviar' : 'documentos';
        return this.http.post(`${this.api}/anunciantes/mi-solicitud/${accion}`, body);
    }
    static ɵfac = function PerfilService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || PerfilService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: PerfilService, factory: PerfilService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PerfilService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
