import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import * as i0 from "@angular/core";
// Operaciones del anunciante verificado sobre sus propias publicaciones e imágenes.
// El backend valida la propiedad con AnuncianteGuard; acá solo se arman los requests.
export class GestionPublicacionesService {
    http = inject(HttpClient);
    api = environment.apiUrl;
    /** GET /publicaciones/anunciante/:id — todas (activas e inactivas). */
    listarMias(idAnunciante) {
        return this.http.get(`${this.api}/publicaciones/anunciante/${idAnunciante}`);
    }
    /** Lista principal del dueño: no eliminadas, paginadas y con búsqueda. */
    listarMiasPaginadas(pagina = 1, limite = 6, q = '') {
        const params = new HttpParams().set('pagina', pagina).set('limite', limite).set('q', q);
        return this.http.get(`${this.api}/publicaciones/mias/paginadas`, { params });
    }
    /** Papelera simple del dueño: sin paginación ni búsqueda. */
    listarPapelera() {
        return this.http.get(`${this.api}/publicaciones/mias/papelera`);
    }
    cambiarActividad(id, activa) {
        return this.http.patch(`${this.api}/publicaciones/${id}`, { activa });
    }
    restaurar(id) {
        return this.http.patch(`${this.api}/publicaciones/${id}/restaurar`, {});
    }
    listarLiquidaciones(idPublicacion) {
        return this.http.get(`${this.api}/reservas/liquidaciones/publicacion/${idPublicacion}`);
    }
    /** Pagos registrados de todas las publicaciones del anunciante autenticado. */
    listarMisLiquidaciones() {
        return this.http.get(`${this.api}/reservas/liquidaciones/mias`);
    }
    /** Enlace firmado del comprobante de un pago al anunciante. */
    urlComprobantePago(pago) {
        return this.http.get(`${this.api}/reservas/${pago.reservaId}/liquidacion/pagos/${pago.indice}/comprobante`);
    }
    /** POST /publicaciones (alineado con back/src/publicaciones/dto/crear-publicacion.dto.ts). */
    crear(dto) {
        return this.http.post(`${this.api}/publicaciones`, dto);
    }
    /** DELETE /publicaciones/:id */
    eliminar(id) {
        return this.http.delete(`${this.api}/publicaciones/${id}`);
    }
    /** POST /imagenes/publicacion/:id (multipart, campo "archivo") */
    subirImagen(idPublicacion, archivo) {
        const body = new FormData();
        body.append('archivo', archivo);
        return this.http.post(`${this.api}/imagenes/publicacion/${idPublicacion}`, body);
    }
    /** La primera imagen del orden completo será la portada. */
    ordenarImagenes(idPublicacion, ids) {
        return this.http.patch(`${this.api}/imagenes/publicacion/${idPublicacion}/orden`, { ids });
    }
    /** DELETE /imagenes/:id */
    eliminarImagen(id) {
        return this.http.delete(`${this.api}/imagenes/${id}`);
    }
    static ɵfac = function GestionPublicacionesService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || GestionPublicacionesService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: GestionPublicacionesService, factory: GestionPublicacionesService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(GestionPublicacionesService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
