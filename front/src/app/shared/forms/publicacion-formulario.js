import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { forkJoin, map } from 'rxjs';
import { CatalogoService } from '../services/catalogo.service';
import { admiteReservasPorFecha, } from '../models/catalogo.model';
import { decimalesValidator } from '../validators/decimales.validator';
import { formatearEntero, formatearImporte } from '../utils/formato-numero';
import { PUBLICACION_LIMITES } from './publicacion-limites.generated';
import * as i0 from "@angular/core";
const PATRON_TITULO_PUBLICACION = /^(?=\S)(?=.*[\p{L}\p{Nd}])(?!.*[\uFE0F\u20E3])[\p{L}\p{M}\p{Nd} ,:.]+(?<! )$/u;
// Los límites se generan desde contratos/publicacion.json; no editar a mano.
// Formulario de una publicación, único para el alta (CrearPublicacionComponent) y la
// edición (PublicationFormComponent). Cada pantalla lo declara en sus `providers`, así
// que vive lo mismo que el componente. Las validaciones replican los DTO del back
// (crear-publicacion.dto.ts y actualizar-publicacion.dto.ts).
export class PublicacionFormulario {
    catalogos = inject(CatalogoService);
    tiposPropiedad = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tiposPropiedad" }] : /* istanbul ignore next */ []));
    modalidades = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "modalidades" }] : /* istanbul ignore next */ []));
    monedas = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "monedas" }] : /* istanbul ignore next */ []));
    provincia = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "provincia" }] : /* istanbul ignore next */ []));
    ciudad = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ciudad" }] : /* istanbul ignore next */ []));
    nombresUbicacion = signal({ provincia: '', localidad: '' }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "nombresUbicacion" }] : /* istanbul ignore next */ []));
    latitud = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "latitud" }] : /* istanbul ignore next */ []));
    longitud = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "longitud" }] : /* istanbul ignore next */ []));
    idModalidad = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "idModalidad" }] : /* istanbul ignore next */ []));
    nombreProvincia = computed(() => this.nombresUbicacion().provincia, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "nombreProvincia" }] : /* istanbul ignore next */ []));
    nombreCiudad = computed(() => this.nombresUbicacion().localidad, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "nombreCiudad" }] : /* istanbul ignore next */ []));
    ubicacionConfirmada = computed(() => this.latitud() !== null && this.longitud() !== null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ubicacionConfirmada" }] : /* istanbul ignore next */ []));
    esTemporaria = computed(() => admiteReservasPorFecha(this.modalidades().find((item) => item.id === this.idModalidad())), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "esTemporaria" }] : /* istanbul ignore next */ []));
    limites = PUBLICACION_LIMITES;
    precioMaximoTexto = formatearImporte(PUBLICACION_LIMITES.precioMaximo);
    superficieMaximaTexto = formatearEntero(PUBLICACION_LIMITES.superficieMaxima);
    ambientesMaximosTexto = String(PUBLICACION_LIMITES.ambientesMaximos);
    form = inject(FormBuilder).nonNullable.group({
        titulo: ['', [Validators.required, Validators.minLength(15), Validators.maxLength(255), Validators.pattern(PATRON_TITULO_PUBLICACION)]],
        descripcion: ['', [Validators.required, Validators.maxLength(5000)]],
        idTipoPropiedad: [null, Validators.required],
        idModalidad: [null, Validators.required],
        idTipoMoneda: [null, Validators.required],
        precio: [null, [Validators.required, Validators.min(1), Validators.max(PUBLICACION_LIMITES.precioMaximo), decimalesValidator(2)]],
        idProvincia: [null, Validators.required],
        idCiudad: [null, Validators.required],
        direccion: ['', [Validators.required, Validators.maxLength(255)]],
        cantidad_ambientes: [null, [Validators.required, Validators.min(1), Validators.max(PUBLICACION_LIMITES.ambientesMaximos), decimalesValidator(0)]],
        superficie: [null, [Validators.required, Validators.min(1), Validators.max(PUBLICACION_LIMITES.superficieMaxima), decimalesValidator(2)]],
    });
    constructor() {
        const { idModalidad, idProvincia, idCiudad, direccion } = this.form.controls;
        idModalidad.valueChanges.pipe(takeUntilDestroyed()).subscribe((id) => this.idModalidad.set(id));
        idProvincia.valueChanges.pipe(takeUntilDestroyed()).subscribe((id) => {
            this.provincia.set(id);
            idCiudad.setValue(null);
            this.limpiarUbicacion();
        });
        idCiudad.valueChanges.pipe(takeUntilDestroyed()).subscribe((id) => {
            this.ciudad.set(id);
            this.limpiarUbicacion();
        });
        // Cambiar la dirección invalida el punto confirmado en el mapa.
        direccion.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.limpiarUbicacion());
    }
    /** Trae los catálogos que alimentan los selects; cada pantalla decide cómo mostrar el error. */
    cargarCatalogos() {
        return forkJoin({
            tipos: this.catalogos.getTiposPropiedad(),
            modalidades: this.catalogos.getModalidades(),
            monedas: this.catalogos.getTiposMoneda(),
        }).pipe(map(({ tipos, modalidades, monedas }) => {
            this.tiposPropiedad.set(tipos);
            this.modalidades.set(modalidades);
            this.monedas.set(monedas);
        }));
    }
    /** Completa el formulario con una publicación existente (modo edición). */
    cargar(publicacion) {
        // Sin emitir eventos: si no, el cambio de provincia borraría la ciudad y la ubicación.
        this.form.patchValue({
            titulo: publicacion.titulo,
            descripcion: publicacion.descripcion,
            precio: Number(publicacion.precio),
            direccion: publicacion.direccion,
            cantidad_ambientes: publicacion.cantidad_ambientes,
            superficie: Number(publicacion.superficie),
            idTipoMoneda: publicacion.tipoMoneda?.id ?? null,
            idModalidad: publicacion.modalidad?.id ?? null,
            idProvincia: publicacion.provincia?.id ?? null,
            idCiudad: publicacion.ciudad?.id ?? null,
            idTipoPropiedad: publicacion.tipoPropiedad?.id ?? null,
        }, { emitEvent: false });
        this.idModalidad.set(publicacion.modalidad?.id ?? null);
        this.provincia.set(publicacion.provincia?.id ?? null);
        this.ciudad.set(publicacion.ciudad?.id ?? null);
        this.latitud.set(publicacion.latitud == null ? null : Number(publicacion.latitud));
        this.longitud.set(publicacion.longitud == null ? null : Number(publicacion.longitud));
    }
    seleccionarProvincia(id) {
        this.form.controls.idProvincia.setValue(id);
        this.form.controls.idProvincia.markAsTouched();
    }
    seleccionarLocalidad(id) {
        this.form.controls.idCiudad.setValue(id);
    }
    confirmarUbicacion(ubicacion) {
        this.latitud.set(ubicacion.latitud);
        this.longitud.set(ubicacion.longitud);
    }
    invalido(campo) {
        const control = this.form.controls[campo];
        return control.invalid && control.touched;
    }
    /** Permite mostrar un mensaje específico cuando el valor supera el máximo. */
    excedeMaximo(campo) {
        const control = this.form.controls[campo];
        return control.hasError('max') && control.touched;
    }
    /** Permite mostrar un mensaje específico cuando el valor supera los decimales permitidos. */
    excedeDecimales(campo) {
        const control = this.form.controls[campo];
        return control.hasError('decimales') && control.touched;
    }
    /** Arma el cuerpo de POST/PATCH /publicaciones. Requiere un formulario válido y la ubicación confirmada. */
    payload() {
        const v = this.form.getRawValue();
        return {
            titulo: v.titulo.trim(),
            descripcion: v.descripcion.trim(),
            precio: Number(v.precio),
            direccion: v.direccion.trim(),
            latitud: this.latitud(),
            longitud: this.longitud(),
            cantidad_ambientes: Number(v.cantidad_ambientes),
            superficie: Number(v.superficie),
            idTipoMoneda: Number(v.idTipoMoneda),
            idModalidad: Number(v.idModalidad),
            idProvincia: Number(v.idProvincia),
            idCiudad: Number(v.idCiudad),
            idTipoPropiedad: Number(v.idTipoPropiedad),
        };
    }
    limpiarUbicacion() {
        this.latitud.set(null);
        this.longitud.set(null);
    }
    static ɵfac = function PublicacionFormulario_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || PublicacionFormulario)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: PublicacionFormulario, factory: PublicacionFormulario.ɵfac });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(PublicacionFormulario, [{
        type: Injectable
    }], () => [], null); })();
