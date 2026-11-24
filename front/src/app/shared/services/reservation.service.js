import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { cuerpoMensajeReclamo } from '../utils/reclamo-imagenes';
import * as i0 from "@angular/core";
export class ReservationService {
    http = inject(HttpClient);
    baseUrl = `${environment.apiUrl}/reservas`;
    paymentUrl = `${environment.apiUrl}/pagos`;
    quote(payload) {
        return this.http.post(`${this.paymentUrl}/presupuesto`, payload);
    }
    createCheckout(payload) {
        return this.http.post(`${this.paymentUrl}/checkout`, payload);
    }
    reconcilePayment(paymentId) {
        return this.http.post(`${this.paymentUrl}/reconciliar`, { payment_id: paymentId });
    }
    retryCheckout(idReserva) {
        return this.http.post(`${this.paymentUrl}/reservas/${idReserva}/reintentar`, {});
    }
    summary(idReserva) {
        return this.http.get(`${this.paymentUrl}/reservas/${idReserva}/resumen`);
    }
    mine() {
        return this.http.get(`${this.baseUrl}/mis-reservas`);
    }
    received() {
        return this.http.get(`${this.baseUrl}/recibidas`);
    }
    byPublication(idPublicacion) {
        return this.http.get(`${this.baseUrl}/publicacion/${idPublicacion}`);
    }
    /** GET /reservas/:id: una sola reserva, para el inquilino o el anunciante. */
    byId(id) {
        return this.http.get(`${this.baseUrl}/${id}`);
    }
    cancel(id) {
        return this.http.patch(`${this.baseUrl}/${id}/cancelar`, {});
    }
    rescheduleAvailability(id) {
        return this.http.get(`${this.baseUrl}/${id}/fechas-disponibles`);
    }
    reschedule(id, fecha_inicio, fecha_fin) {
        return this.http.patch(`${this.baseUrl}/${id}/fechas`, { fecha_inicio, fecha_fin });
    }
    retryRescheduleNotice(id, idCambio) {
        return this.http.patch(`${this.baseUrl}/${id}/reprogramaciones/${idCambio}/notificar`, {});
    }
    lodgingCode(id) {
        return this.http.get(`${this.baseUrl}/${id}/codigo-alojamiento`);
    }
    validateLodgingCode(id, codigo) {
        return this.http.patch(`${this.baseUrl}/${id}/validar-codigo`, { codigo });
    }
    reportProblem(id, motivo) {
        return this.http.patch(`${this.baseUrl}/${id}/reportar-problema`, { motivo });
    }
    requestCancellation(id, motivo, aceptaTerminos, importeAceptado, monedaAceptada) {
        return this.http.post(`${this.baseUrl}/${id}/cancelacion`, { motivo, aceptaTerminos, importeAceptado, monedaAceptada });
    }
    cancellationConditions(id) {
        return this.http.get(`${this.baseUrl}/${id}/cancelacion/condiciones`);
    }
    refunds(id) {
        return this.http.get(`${this.baseUrl}/${id}/reembolsos`);
    }
    myAdministrativeDelays() {
        return this.http.get(`${environment.apiUrl}/reclamos/demoras/mias`);
    }
    createClaim(payload) {
        return this.http.post(`${environment.apiUrl}/reclamos`, payload);
    }
    cancellationRefundBalance(id) {
        return this.http.get(`${environment.apiUrl}/reclamos/cancelacion/${id}`);
    }
    claimMissingRefund(id, descripcion) {
        return this.http.post(`${environment.apiUrl}/reclamos/cancelacion/${id}`, { descripcion });
    }
    myClaims() {
        return this.http.get(`${environment.apiUrl}/reclamos/mios`);
    }
    uploadClaimEvidence(id, archivos) {
        const datos = new FormData();
        archivos.forEach((archivo) => datos.append('evidencias', archivo));
        return this.http.post(`${environment.apiUrl}/reclamos/${id}/evidencias`, datos);
    }
    claimMessages(id) {
        return this.http.get(`${environment.apiUrl}/reclamos/${id}/mensajes`);
    }
    sendClaimMessage(id, texto, imagenes = []) {
        return this.http.post(`${environment.apiUrl}/reclamos/${id}/mensajes`, cuerpoMensajeReclamo(texto, imagenes));
    }
    static ɵfac = function ReservationService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ReservationService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: ReservationService, factory: ReservationService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ReservationService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
