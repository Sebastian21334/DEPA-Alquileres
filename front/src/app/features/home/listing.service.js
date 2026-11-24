import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EMPTY, expand, reduce } from 'rxjs';
import { environment } from '../../../environments/environment';
import * as i0 from "@angular/core";
/**
 * Consume el módulo `publicaciones` del backend (back/src/publicaciones).
 *
 * Endpoint usado por esta página: GET /publicaciones (método `listarActivas`).
 * Devuelve únicamente publicaciones con `activa = true` (RN-10 / RN-21), con las
 * relaciones necesarias para la tarjeta (imágenes, anunciante, catálogos, ubicación).
 *
 * Los filtros y la búsqueda textual se resuelven en el backend para conservar
 * la paginación correcta sin descargar el catálogo completo.
 */
export class ListingService {
    http = inject(HttpClient);
    baseUrl = `${environment.apiUrl}/publicaciones`;
    getActivas(opciones = {}) {
        let params = this.parametrosFiltros(opciones);
        if (opciones.pagina)
            params = params.set('pagina', opciones.pagina);
        if (opciones.limite)
            params = params.set('limite', opciones.limite);
        if (opciones.orden)
            params = params.set('orden', opciones.orden);
        return this.http.get(this.baseUrl, { params });
    }
    getMapa(filtros) {
        const params = this.parametrosFiltros(filtros);
        const pedirPagina = (antesDe) => this.http.get(`${this.baseUrl}/mapa`, {
            params: antesDe === undefined ? params : params.set('antesDe', antesDe),
        });
        return pedirPagina().pipe(expand(({ siguienteId }) => siguienteId == null ? EMPTY : pedirPagina(siguienteId)), reduce((puntos, pagina) => puntos.concat(pagina.puntos), []));
    }
    parametrosFiltros(opciones) {
        let params = new HttpParams();
        if (opciones.categoria)
            params = params.set('categoria', opciones.categoria);
        if (opciones.busqueda?.trim())
            params = params.set('q', opciones.busqueda.trim());
        if (opciones.idProvincia)
            params = params.set('idProvincia', opciones.idProvincia);
        if (opciones.idsCiudad?.length)
            params = params.set('idsCiudad', opciones.idsCiudad.join(','));
        if (opciones.idsTipoPropiedad?.length)
            params = params.set('idsTipoPropiedad', opciones.idsTipoPropiedad.join(','));
        if (opciones.idsTipoMoneda?.length)
            params = params.set('idsTipoMoneda', opciones.idsTipoMoneda.join(','));
        if (opciones.precioMin != null)
            params = params.set('precioMin', opciones.precioMin);
        if (opciones.precioMax != null)
            params = params.set('precioMax', opciones.precioMax);
        if (opciones.superficieMin != null)
            params = params.set('superficieMin', opciones.superficieMin);
        if (opciones.ambientes?.length)
            params = params.set('ambientes', opciones.ambientes.join(','));
        return params;
    }
    getById(id) {
        return this.http.get(`${this.baseUrl}/${id}`);
    }
    getByIdForAdmin(id) {
        return this.http.get(`${this.baseUrl}/administracion/${id}`);
    }
    registerView(id) {
        return this.http.post(`${this.baseUrl}/${id}/visualizacion`, {});
    }
    getByAdvertiser(id) {
        return this.http.get(`${this.baseUrl}/anunciante/${id}`, {
            params: { activa: 'true' },
        });
    }
    update(id, payload) {
        return this.http.patch(`${this.baseUrl}/${id}`, payload);
    }
    static ɵfac = function ListingService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ListingService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: ListingService, factory: ListingService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ListingService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
