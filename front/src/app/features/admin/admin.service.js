import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { cuerpoMensajeReclamo } from '../../shared/utils/reclamo-imagenes';
import * as i0 from "@angular/core";
export const ESTADOS_PUBLICACION_ADMINISTRACION = ['todas', 'activas', 'inactivas', 'bajas'];
export class AdminService {
    http = inject(HttpClient);
    api = environment.apiUrl;
    listarPublicaciones(pagina = 1, q = '', estado = 'todas') {
        const params = new HttpParams().set('pagina', pagina).set('limite', 10).set('q', q).set('estado', estado);
        return this.http.get(`${this.api}/publicaciones/administracion`, { params });
    }
    darDeBajaPublicacion(id, motivo) {
        return this.http.patch(`${this.api}/publicaciones/administracion/${id}/baja`, { motivo });
    }
    reactivarPublicacion(id) {
        return this.http.patch(`${this.api}/publicaciones/administracion/${id}/reactivar`, {});
    }
    obtenerPerfilUsuario(id) {
        return this.http.get(`${this.api}/usuarios/administracion/${id}`);
    }
    listarUsuarios(pagina = 1, q = '') {
        const params = new HttpParams().set('pagina', pagina).set('limite', 10).set('q', q);
        return this.http.get(`${this.api}/usuarios/administracion`, { params });
    }
    listarPendientes() {
        return this.http.get(`${this.api}/anunciantes/pendientes`);
    }
    listarLiquidaciones() {
        return this.http.get(`${this.api}/reservas/liquidaciones/administracion`);
    }
    consultarCbuParaPago(id) {
        return this.http.get(`${this.api}/reservas/${id}/liquidacion/cbu`);
    }
    listarHistorialLiquidaciones() {
        return this.http.get(`${this.api}/reservas/liquidaciones/administracion/historial`);
    }
    resolverLiquidacion(id, estado, referencia, observacion) {
        return this.http.patch(`${this.api}/reservas/${id}/liquidacion`, {
            estado,
            referencia,
            observacion,
        });
    }
    listarReembolsos() {
        return this.http.get(`${this.api}/reembolsos/administracion`);
    }
    resumenReembolsos() {
        return this.http.get(`${this.api}/reembolsos/administracion/resumen`);
    }
    listarSolicitudesCancelacion() {
        return this.http.get(`${this.api}/reservas/cancelaciones/administracion`);
    }
    resolverSolicitudCancelacion(idReserva, idSolicitud, decision, observacion) {
        return this.http.patch(`${this.api}/reservas/${idReserva}/cancelacion/${idSolicitud}`, {
            decision,
            observacion,
        });
    }
    solicitarReembolso(id) {
        return this.http.patch(`${this.api}/reservas/reembolsos/${id}/ejecutar`, {});
    }
    conciliarReembolso(id, referencia) {
        return this.http.patch(`${this.api}/reservas/reembolsos/${id}/conciliar`, { referencia });
    }
    habilitarTransferenciaReembolso(id) {
        return this.http.patch(`${this.api}/reservas/reembolsos/${id}/habilitar-transferencia`, {});
    }
    /** Multipart con el comprobante obligatorio y la referencia opcional. */
    registrarTransferenciaReembolso(id, comprobante, datos = {}) {
        return this.http.patch(`${this.api}/reservas/reembolsos/${id}/transferencia`, this.formularioTransferencia(comprobante, datos));
    }
    /** El pago al anunciante se registra con el comprobante de la transferencia. */
    registrarPagoAnunciante(idReserva, comprobante, datos = {}) {
        return this.http.patch(`${this.api}/reservas/${idReserva}/liquidacion/pago`, this.formularioTransferencia(comprobante, datos));
    }
    urlComprobantePago(idReserva, indice) {
        return this.http.get(`${this.api}/reservas/${idReserva}/liquidacion/pagos/${indice}/comprobante`);
    }
    formularioTransferencia(comprobante, { referencia, observacion }) {
        const formulario = new FormData();
        formulario.append('comprobante', comprobante);
        if (referencia)
            formulario.append('referencia', referencia);
        if (observacion)
            formulario.append('observacion', observacion);
        return formulario;
    }
    urlComprobanteReembolso(id) {
        return this.http.get(`${this.api}/reembolsos/${id}/comprobante`);
    }
    listarReclamos() {
        return this.http.get(`${this.api}/reclamos/administracion`);
    }
    responderReclamo(id, texto, imagenes = []) {
        return this.http.post(`${this.api}/reclamos/${id}/mensajes`, cuerpoMensajeReclamo(texto, imagenes));
    }
    resolverReclamo(id, resolucion, importe, observacion) {
        return this.http.patch(`${this.api}/reclamos/${id}/resolver`, {
            resolucion,
            importe,
            observacion,
        });
    }
    cambiarBloqueo(id, bloquear, motivo) {
        return this.http.patch(`${this.api}/usuarios/${id}/${bloquear ? 'bloquear' : 'habilitar'}`, { motivo });
    }
    listarBloqueados() {
        return this.http.get(`${this.api}/usuarios/administracion/bloqueados`);
    }
    listarHistorialBloqueos() {
        return this.http.get(`${this.api}/usuarios/administracion/historial-bloqueos`);
    }
    responderApelacion(id, bloqueoId, texto, imagen) {
        const datos = new FormData();
        datos.append('bloqueoId', bloqueoId);
        datos.append('texto', texto);
        if (imagen)
            datos.append('imagen', imagen);
        return this.http.post(`${this.api}/usuarios/${id}/bloqueo/mensajes`, datos);
    }
    aprobar(id, numero_revision, revisar_cbu, titular_cbu_confirmado) {
        return this.http.patch(`${this.api}/anunciantes/${id}/aprobar`, { numero_revision, revisar_cbu, titular_cbu_confirmado });
    }
    rechazar(id, body) {
        return this.http.delete(`${this.api}/anunciantes/${id}/rechazar`, { body });
    }
    listarCatalogo(key) {
        return this.http.get(`${this.api}/catalogos/${key}`);
    }
    obtenerComisionDepa() {
        return this.http.get(`${this.api}/catalogos/comision-depa`);
    }
    actualizarComisionDepa(porcentaje) {
        return this.http.put(`${this.api}/catalogos/comision-depa`, { porcentaje });
    }
    listarProvincias() {
        return this.http.get(`${this.api}/ubicacion/provincias`);
    }
    listarCiudades(id) {
        return this.http.get(`${this.api}/ubicacion/provincias/${id}/ciudades`);
    }
    static ɵfac = function AdminService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AdminService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: AdminService, factory: AdminService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AdminService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
