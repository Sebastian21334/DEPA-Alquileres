import { Component, EventEmitter, Output, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { admiteReservasPorFecha } from '../../models/catalogo.model';
import { LucideArrowRight, LucideBadgeCheck, LucideBed, LucideBookmark, LucideHouse, LucideMapPin, LucideRuler, } from '@lucide/angular';
import { AuthService } from '../../../core/services/auth.service';
import { FavoritesService } from '../../services/favorites.service';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';
import { environment } from '../../../../environments/environment';
import { homeCardImage, HOME_CARD_IMAGE_SIZES } from '../../utils/home-card-image';
import * as i0 from "@angular/core";
const _c0 = a0 => ["/publicaciones", a0];
function ListingCardComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "img", 21);
    i0.ɵɵlistener("error", function ListingCardComponent_Conditional_3_Template_img_error_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.usarImagenOriginal()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const imagen_r3 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("src", imagen_r3.src, i0.ɵɵsanitizeUrl)("alt", ctx_r1.publicacion().titulo);
    i0.ɵɵattribute("srcset", imagen_r3.srcset)("sizes", imagen_r3.srcset ? ctx_r1.imageSizes : null)("width", ctx_r1.miniaturaInicio() ? 572 : null)("height", ctx_r1.miniaturaInicio() ? 400 : null);
} }
function ListingCardComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 4);
    i0.ɵɵtext(1, "Sin imagen");
    i0.ɵɵelementEnd();
} }
function ListingCardComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 5);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.publicacion().modalidad?.nombre);
} }
function ListingCardComponent_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 8);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 22);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 14);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.tipoAnuncianteTexto);
} }
function ListingCardComponent_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 11);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "relativeTime");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, ctx_r1.publicacion().fecha_publicacion));
} }
function ListingCardComponent_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 12);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(1, "svg", 23);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("size", 16);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.ubicacion);
} }
function ListingCardComponent_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li");
    i0.ɵɵelement(1, "span", 24);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 25);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 18);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.tipoPropiedadTexto);
} }
function ListingCardComponent_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li");
    i0.ɵɵelement(1, "span", 24);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelement(2, "svg", 26);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("size", 18);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("", ctx_r1.superficie, " m\u00B2");
} }
// Tarjeta reutilizable de una publicación (prototipo "Card"): foto con badge de
// modalidad y tipo de anunciante, título + ubicación, columna de características
// (ambientes y m², que son las que existen en la entidad) y precio con botón "Ver".
export class ListingCardComponent {
    auth = inject(AuthService);
    favorites = inject(FavoritesService);
    router = inject(Router);
    publicacion = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "publicacion" }] : /* istanbul ignore next */ []));
    miniaturaInicio = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "miniaturaInicio" }] : /* istanbul ignore next */ []));
    vistaMapa = input(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "vistaMapa" }] : /* istanbul ignore next */ []));
    favoriteChange = new EventEmitter();
    savingFavorite = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "savingFavorite" }] : /* istanbul ignore next */ []));
    falloMiniatura = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "falloMiniatura" }] : /* istanbul ignore next */ []));
    imageSizes = HOME_CARD_IMAGE_SIZES;
    imagenTarjeta = computed(() => {
        const url = this.publicacion().imagenes?.[0]?.url;
        return url ? homeCardImage(url, this.miniaturaInicio() && environment.production && this.falloMiniatura() !== url) : null;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "imagenTarjeta" }] : /* istanbul ignore next */ []));
    usarImagenOriginal() {
        if (this.imagenTarjeta()?.srcset)
            this.falloMiniatura.set(this.imagenPrincipal);
    }
    get isFavorite() {
        return this.favorites.isFavorite(this.publicacion().id);
    }
    toggleFavorite() {
        if (this.savingFavorite())
            return;
        if (!this.auth.isAuthenticated) {
            this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
            return;
        }
        this.savingFavorite.set(true);
        this.favorites.toggle(this.publicacion().id)
            .pipe(finalize(() => this.savingFavorite.set(false)))
            .subscribe({ next: (result) => this.favoriteChange.emit(result.favorito) });
    }
    get precioFormateado() {
        return Number(this.publicacion().precio).toLocaleString('es-AR', { maximumFractionDigits: 0 });
    }
    get superficie() {
        return Number(this.publicacion().superficie).toLocaleString('es-AR', { maximumFractionDigits: 0 });
    }
    get esTemporaria() {
        return admiteReservasPorFecha(this.publicacion().modalidad);
    }
    get imagenPrincipal() {
        return this.publicacion().imagenes?.[0]?.url ?? null;
    }
    get verificado() {
        return this.publicacion().anunciante?.verificado ?? false;
    }
    get tipoAnuncianteTexto() {
        return this.publicacion().anunciante?.tipoAnunciante?.nombre ?? 'Anunciante';
    }
    get ubicacion() {
        const p = this.publicacion();
        return [p.ciudad?.nombre, p.provincia?.nombre].filter(Boolean).join(', ');
    }
    get ambientesTexto() {
        const cantidad = this.publicacion().cantidad_ambientes;
        return `${cantidad} ${cantidad === 1 ? 'ambiente' : 'ambientes'}`;
    }
    get tipoPropiedadTexto() {
        return this.publicacion().tipoPropiedad?.nombre ?? 'Estadía temporal';
    }
    static ɵfac = function ListingCardComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ListingCardComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ListingCardComponent, selectors: [["app-listing-card"]], inputs: { publicacion: [1, "publicacion"], miniaturaInicio: [1, "miniaturaInicio"], vistaMapa: [1, "vistaMapa"] }, outputs: { favoriteChange: "favoriteChange" }, decls: 31, vars: 32, consts: [[1, "card"], [1, "card__top"], ["tabindex", "-1", "aria-hidden", "true", 1, "card__media", 3, "routerLink"], ["loading", "lazy", "decoding", "async", 3, "src", "alt"], [1, "card__media-placeholder"], [1, "badge", "badge--modalidad"], ["type", "button", 1, "card__save", 3, "click", "disabled"], ["lucideBookmark", "", 3, "size"], [1, "badge", "badge--verified"], [1, "card__body"], [1, "card__title"], [1, "card__published"], [1, "card__location"], [1, "card__specs"], ["lucideBed", "", "aria-hidden", "true", 3, "size"], [1, "card__footer"], [1, "card__price"], [1, "card__currency"], [1, "card__period"], [1, "card__cta", 3, "routerLink"], ["lucideArrowRight", "", "aria-hidden", "true", 3, "size"], ["loading", "lazy", "decoding", "async", 3, "error", "src", "alt"], ["lucideBadgeCheck", "", 3, "size"], ["lucideMapPin", "", 3, "size"], ["aria-hidden", "true", 1, "card__divider"], ["lucideHouse", "", "aria-hidden", "true", 3, "size"], ["lucideRuler", "", "aria-hidden", "true", 3, "size"]], template: function ListingCardComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "article", 0)(1, "div", 1)(2, "a", 2);
            i0.ɵɵconditionalCreate(3, ListingCardComponent_Conditional_3_Template, 1, 6, "img", 3)(4, ListingCardComponent_Conditional_4_Template, 2, 0, "div", 4);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(5, ListingCardComponent_Conditional_5_Template, 2, 1, "span", 5);
            i0.ɵɵelementStart(6, "button", 6);
            i0.ɵɵlistener("click", function ListingCardComponent_Template_button_click_6_listener() { return ctx.toggleFavorite(); });
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(7, "svg", 7);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(8, ListingCardComponent_Conditional_8_Template, 3, 2, "span", 8);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(9, "div", 9)(10, "h3", 10);
            i0.ɵɵtext(11);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(12, ListingCardComponent_Conditional_12_Template, 3, 3, "p", 11);
            i0.ɵɵconditionalCreate(13, ListingCardComponent_Conditional_13_Template, 3, 2, "p", 12);
            i0.ɵɵelementStart(14, "ul", 13)(15, "li");
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(16, "svg", 14);
            i0.ɵɵtext(17);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(18, ListingCardComponent_Conditional_18_Template, 4, 2, "li")(19, ListingCardComponent_Conditional_19_Template, 4, 2, "li");
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(20, "div", 15)(21, "p", 16)(22, "span", 17);
            i0.ɵɵtext(23);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(24, "strong");
            i0.ɵɵtext(25);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(26, "span", 18);
            i0.ɵɵtext(27);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(28, "a", 19);
            i0.ɵɵtext(29);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelement(30, "svg", 20);
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            let tmp_3_0;
            i0.ɵɵclassProp("card--temporary", ctx.esTemporaria)("card--map", ctx.vistaMapa());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(28, _c0, ctx.publicacion().id));
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_3_0 = ctx.imagenTarjeta()) ? 3 : 4, tmp_3_0);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.publicacion().modalidad?.nombre ? 5 : -1);
            i0.ɵɵadvance();
            i0.ɵɵclassProp("is-active", ctx.isFavorite);
            i0.ɵɵproperty("disabled", ctx.savingFavorite());
            i0.ɵɵattribute("aria-label", ctx.isFavorite ? "Quitar de favoritos" : "Guardar en favoritos")("aria-pressed", ctx.isFavorite);
            i0.ɵɵadvance();
            i0.ɵɵproperty("size", 19);
            i0.ɵɵattribute("fill", ctx.isFavorite ? "currentColor" : "none");
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.verificado ? 8 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(ctx.publicacion().titulo);
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.vistaMapa() ? 12 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.ubicacion ? 13 : -1);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("size", 19);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate(ctx.ambientesTexto);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.esTemporaria ? 18 : 19);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(ctx.publicacion().tipoMoneda?.nombre || "Moneda no informada");
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1("$", ctx.precioFormateado);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1("/ ", ctx.esTemporaria ? "d\u00EDa" : "mes");
            i0.ɵɵadvance();
            i0.ɵɵproperty("routerLink", i0.ɵɵpureFunction1(30, _c0, ctx.publicacion().id));
            i0.ɵɵattribute("aria-label", "Ver propiedad: " + ctx.publicacion().titulo);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1("", ctx.vistaMapa() ? "Ver detalles" : "Ver propiedad", " ");
            i0.ɵɵadvance();
            i0.ɵɵproperty("size", 17);
        } }, dependencies: [RouterLink, LucideArrowRight, LucideBadgeCheck, LucideBed, LucideBookmark, LucideHouse, LucideMapPin, LucideRuler, RelativeTimePipe], styles: ["[_nghost-%COMP%] { display: block; height: 100%; min-width: 0; }\r\n\r\n.card[_ngcontent-%COMP%] {\r\n  --%NS%tone: var(--%NS%color-primary);\r\n  position: relative;\r\n  display: flex;\r\n  flex-direction: column;\r\n  min-width: 0;\r\n  height: 100%;\r\n  overflow: hidden;\r\n  border-radius: 9px;\r\n  background: #fff;\r\n  box-shadow: 0 5px 16px rgba(25, 45, 75, .14);\r\n  transition: transform .25s ease, box-shadow .25s ease;\r\n}\r\n.card--temporary[_ngcontent-%COMP%] { --%NS%tone: var(--%NS%color-secondary); }\r\n.card[_ngcontent-%COMP%]:hover { transform: translateY(-5px); box-shadow: 0 16px 32px rgba(25, 45, 75, .19); }\r\n\r\n.card__top[_ngcontent-%COMP%] { position: relative; flex: 0 0 auto; }\r\n.card__media[_ngcontent-%COMP%] { display: block; aspect-ratio: 1.43; overflow: hidden; background: #e5e7eb; }\r\n.card__media[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .45s ease; }.card[_ngcontent-%COMP%]:hover   .card__media[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] { transform: scale(1.05); }\r\n.card__media-placeholder[_ngcontent-%COMP%] { display: grid; height: 100%; place-items: center; color: var(--%NS%color-text-muted); background: linear-gradient(135deg, #dbe5ef, #f4f7fb); }\r\n\r\n.badge[_ngcontent-%COMP%] { position: absolute; display: inline-flex; align-items: center; gap: .3rem; border-radius: 999px; font-size: .72rem; font-weight: 800; }\r\n.badge--modalidad[_ngcontent-%COMP%] { top: .75rem; left: .75rem; padding: .43rem .7rem; color: #fff; background: var(--%NS%tone); box-shadow: 0 3px 7px #0003; }\r\n.badge--verified[_ngcontent-%COMP%] { right: .6rem; bottom: .6rem; padding: .3rem .55rem; color: #1b2942; background: #fff; box-shadow: 0 2px 7px #0003; }.badge--verified[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { color: #155ed4; }\r\n.card__save[_ngcontent-%COMP%] { position: absolute; top: .65rem; right: .65rem; display: grid; width: 2.25rem; height: 2.25rem; place-items: center; border: 0; border-radius: 50%; background: #fff; color: #1b2942; box-shadow: 0 2px 7px #0003; cursor: pointer; transition: color .2s ease, transform .2s ease; }.card__save[_ngcontent-%COMP%]:hover { color: var(--%NS%color-secondary); transform: scale(1.06); }.card__save.is-active[_ngcontent-%COMP%] { color: var(--%NS%color-secondary); }.card__save[_ngcontent-%COMP%]:disabled { cursor: wait; opacity: .7; }\r\n\r\n.card__body[_ngcontent-%COMP%] { display: flex; flex: 1; min-width: 0; min-height: 166px; flex-direction: column; padding: .85rem 1rem 1.1rem; }\r\n.card__title[_ngcontent-%COMP%] { overflow-wrap: anywhere; margin: 0; color: #0f1f3d; font-size: 1.06rem; font-weight: 800; line-height: 1.16; display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }\r\n.card__published[_ngcontent-%COMP%] { margin: .34rem 0 0; color: #7a879b; font-size: .72rem; font-weight: 650; }\r\n.card__location[_ngcontent-%COMP%] { overflow-wrap: anywhere; display: flex; align-items: center; gap: .3rem; margin: .32rem 0 .7rem; color: #61708a; font-size: .76rem; }.card__location[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { color: var(--%NS%color-secondary); flex: 0 0 auto; }\r\n.card__specs[_ngcontent-%COMP%] { display: flex; flex-wrap: wrap; align-items: center; gap: .4rem .7rem; margin: 0 0 .9rem; padding: 0; color: #5d6b82; list-style: none; font-size: .76rem; }.card__specs[_ngcontent-%COMP%]   li[_ngcontent-%COMP%] { display: inline-flex; align-items: center; min-width: 0; gap: .35rem; overflow-wrap: anywhere; }.card__specs[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { color: #233654; flex: 0 0 auto; }.card__divider[_ngcontent-%COMP%] { flex: 0 0 auto; width: 1px; height: 1rem; background: #d5dbe5; }\r\n.card__footer[_ngcontent-%COMP%] { display: flex; flex-direction: column; gap: .8rem; margin-top: auto; }\r\n.card__price[_ngcontent-%COMP%] { min-width: 0; max-width: 100%; margin: 0; color: #101f3a; }\r\n.card__price[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { min-width: 0; overflow-wrap: anywhere; font-size: 1.45rem; line-height: 1.2; letter-spacing: -.03em; }\r\n.card__currency[_ngcontent-%COMP%], .card__period[_ngcontent-%COMP%] { color: #66758c; font-size: .76rem; font-weight: 700; }\r\n.card__currency[_ngcontent-%COMP%] { display: block; margin-bottom: .15rem; overflow-wrap: anywhere; }\r\n.card__period[_ngcontent-%COMP%] { display: inline-block; margin-left: .35rem; white-space: nowrap; }\r\n.card__cta[_ngcontent-%COMP%] { display: inline-flex; flex: 0 0 auto; align-items: center; justify-content: center; gap: .35rem; padding: .6rem .72rem; border-radius: 7px; background: var(--%NS%tone); color: #fff; font-size: .75rem; font-weight: 800; white-space: nowrap; text-decoration: none; box-shadow: 0 4px 9px color-mix(in srgb, var(--%NS%tone), transparent 65%); transition: filter .2s ease, transform .2s ease; }.card__cta[_ngcontent-%COMP%]:hover { filter: brightness(1.08); transform: translateY(-1px); }.card__cta[_ngcontent-%COMP%]   svg[_ngcontent-%COMP%] { flex: 0 0 auto; transition: transform .2s ease; }.card__cta[_ngcontent-%COMP%]:hover   svg[_ngcontent-%COMP%] { transform: translateX(3px); }\r\n.card__save[_ngcontent-%COMP%]:focus-visible, .card__cta[_ngcontent-%COMP%]:focus-visible { outline: 3px solid var(--%NS%color-accent); outline-offset: 3px; }\r\n\r\n@media (max-width: 540px) { .card__body[_ngcontent-%COMP%] { min-height: 0; }.card__title[_ngcontent-%COMP%] { font-size: 1.15rem; }.card__price[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { font-size: 1.55rem; } }\r\n\r\n.card--map[_ngcontent-%COMP%] {\r\n  display: grid;\r\n  grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);\r\n  height: auto;\r\n  padding: .5rem;\r\n  box-shadow: none;\r\n}\r\n.card--%NS%map[_ngcontent-%COMP%]:hover { transform: none; box-shadow: none; }\r\n.card--map[_ngcontent-%COMP%]   .card__top[_ngcontent-%COMP%] { min-width: 0; min-height: 8rem; }\r\n.card--map[_ngcontent-%COMP%]   .card__media[_ngcontent-%COMP%] {\r\n  position: absolute;\r\n  inset: 0;\r\n  aspect-ratio: auto;\r\n  border-radius: var(--%NS%radius-sm);\r\n}\r\n.card--%NS%map[_ngcontent-%COMP%]:hover   .card__media[_ngcontent-%COMP%]   img[_ngcontent-%COMP%] { transform: none; }\r\n.card--map[_ngcontent-%COMP%]   .card__body[_ngcontent-%COMP%] { min-height: 0; padding: .25rem .3rem .2rem .75rem; }\r\n.card--map[_ngcontent-%COMP%]   .card__title[_ngcontent-%COMP%] { padding-right: 1.5rem; font-size: 1rem; }\r\n.card--map[_ngcontent-%COMP%]   .card__location[_ngcontent-%COMP%], .card--map[_ngcontent-%COMP%]   .card__specs[_ngcontent-%COMP%] { margin-bottom: .4rem; }\r\n.card--map[_ngcontent-%COMP%]   .card__footer[_ngcontent-%COMP%] { gap: .45rem; }\r\n.card--map[_ngcontent-%COMP%]   .card__price[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] { font-size: 1.15rem; }\r\n.card--map[_ngcontent-%COMP%]   .card__save[_ngcontent-%COMP%], .card--map[_ngcontent-%COMP%]   .badge--verified[_ngcontent-%COMP%] { display: none; }\r\n.card--map[_ngcontent-%COMP%]   .badge--modalidad[_ngcontent-%COMP%] { top: .35rem; left: .35rem; padding: .32rem .45rem; font-size: .65rem; }\r\n\r\n@media (max-width: 360px) {\r\n  .card--map[_ngcontent-%COMP%] { grid-template-columns: minmax(0, 1fr) minmax(0, 1.85fr); }\r\n  .card--map[_ngcontent-%COMP%]   .card__body[_ngcontent-%COMP%] { padding-left: .5rem; }\r\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ListingCardComponent, [{
        type: Component,
        args: [{ selector: 'app-listing-card', standalone: true, imports: [RouterLink, RelativeTimePipe, LucideArrowRight, LucideBadgeCheck, LucideBed, LucideBookmark, LucideHouse, LucideMapPin, LucideRuler], template: "<article class=\"card\" [class.card--temporary]=\"esTemporaria\" [class.card--map]=\"vistaMapa()\">\r\n  <div class=\"card__top\">\r\n    <a class=\"card__media\" [routerLink]=\"['/publicaciones', publicacion().id]\" tabindex=\"-1\" aria-hidden=\"true\">\r\n      @if (imagenTarjeta(); as imagen) {\r\n        <img [src]=\"imagen.src\" [attr.srcset]=\"imagen.srcset\" [attr.sizes]=\"imagen.srcset ? imageSizes : null\"\r\n          [attr.width]=\"miniaturaInicio() ? 572 : null\" [attr.height]=\"miniaturaInicio() ? 400 : null\"\r\n          [alt]=\"publicacion().titulo\" loading=\"lazy\" decoding=\"async\" (error)=\"usarImagenOriginal()\" />\r\n      } @else {\r\n        <div class=\"card__media-placeholder\">Sin imagen</div>\r\n      }\r\n    </a>\r\n\r\n    @if (publicacion().modalidad?.nombre) {\r\n      <span class=\"badge badge--modalidad\">{{ publicacion().modalidad?.nombre }}</span>\r\n    }\r\n    <button\r\n      type=\"button\"\r\n      class=\"card__save\"\r\n      [class.is-active]=\"isFavorite\"\r\n      [disabled]=\"savingFavorite()\"\r\n      [attr.aria-label]=\"isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'\"\r\n      [attr.aria-pressed]=\"isFavorite\"\r\n      (click)=\"toggleFavorite()\"\r\n    ><svg lucideBookmark [size]=\"19\" [attr.fill]=\"isFavorite ? 'currentColor' : 'none'\"></svg></button>\r\n    @if (verificado) {\r\n      <span class=\"badge badge--verified\"><svg lucideBadgeCheck [size]=\"14\"></svg> {{ tipoAnuncianteTexto }}</span>\r\n    }\r\n  </div>\r\n\r\n  <div class=\"card__body\">\r\n    <h3 class=\"card__title\">{{ publicacion().titulo }}</h3>\r\n    @if (!vistaMapa()) {\r\n      <p class=\"card__published\">{{ publicacion().fecha_publicacion | relativeTime }}</p>\r\n    }\r\n    @if (ubicacion) {\r\n      <p class=\"card__location\"><svg lucideMapPin [size]=\"16\"></svg>{{ ubicacion }}</p>\r\n    }\r\n\r\n    <ul class=\"card__specs\">\r\n      <li><svg lucideBed [size]=\"19\" aria-hidden=\"true\"></svg>{{ ambientesTexto }}</li>\r\n      @if (esTemporaria) {\r\n        <li><span class=\"card__divider\" aria-hidden=\"true\"></span><svg lucideHouse [size]=\"18\" aria-hidden=\"true\"></svg>{{ tipoPropiedadTexto }}</li>\r\n      } @else {\r\n        <li><span class=\"card__divider\" aria-hidden=\"true\"></span><svg lucideRuler [size]=\"18\" aria-hidden=\"true\"></svg>{{ superficie }} m\u00B2</li>\r\n      }\r\n    </ul>\r\n\r\n    <div class=\"card__footer\">\r\n      <p class=\"card__price\">\r\n        <span class=\"card__currency\">{{ publicacion().tipoMoneda?.nombre || 'Moneda no informada' }}</span>\r\n        <strong>${{ precioFormateado }}</strong><span class=\"card__period\">/ {{ esTemporaria ? 'd\u00EDa' : 'mes' }}</span>\r\n      </p>\r\n      <a class=\"card__cta\" [routerLink]=\"['/publicaciones', publicacion().id]\" [attr.aria-label]=\"'Ver propiedad: ' + publicacion().titulo\">{{ vistaMapa() ? 'Ver detalles' : 'Ver propiedad' }} <svg lucideArrowRight [size]=\"17\" aria-hidden=\"true\"></svg></a>\r\n    </div>\r\n  </div>\r\n</article>\r\n", styles: [":host { display: block; height: 100%; min-width: 0; }\r\n\r\n.card {\r\n  --tone: var(--color-primary);\r\n  position: relative;\r\n  display: flex;\r\n  flex-direction: column;\r\n  min-width: 0;\r\n  height: 100%;\r\n  overflow: hidden;\r\n  border-radius: 9px;\r\n  background: #fff;\r\n  box-shadow: 0 5px 16px rgba(25, 45, 75, .14);\r\n  transition: transform .25s ease, box-shadow .25s ease;\r\n}\r\n.card--temporary { --tone: var(--color-secondary); }\r\n.card:hover { transform: translateY(-5px); box-shadow: 0 16px 32px rgba(25, 45, 75, .19); }\r\n\r\n.card__top { position: relative; flex: 0 0 auto; }\r\n.card__media { display: block; aspect-ratio: 1.43; overflow: hidden; background: #e5e7eb; }\r\n.card__media img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .45s ease; }.card:hover .card__media img { transform: scale(1.05); }\r\n.card__media-placeholder { display: grid; height: 100%; place-items: center; color: var(--color-text-muted); background: linear-gradient(135deg, #dbe5ef, #f4f7fb); }\r\n\r\n.badge { position: absolute; display: inline-flex; align-items: center; gap: .3rem; border-radius: 999px; font-size: .72rem; font-weight: 800; }\r\n.badge--modalidad { top: .75rem; left: .75rem; padding: .43rem .7rem; color: #fff; background: var(--tone); box-shadow: 0 3px 7px #0003; }\r\n.badge--verified { right: .6rem; bottom: .6rem; padding: .3rem .55rem; color: #1b2942; background: #fff; box-shadow: 0 2px 7px #0003; }.badge--verified svg { color: #155ed4; }\r\n.card__save { position: absolute; top: .65rem; right: .65rem; display: grid; width: 2.25rem; height: 2.25rem; place-items: center; border: 0; border-radius: 50%; background: #fff; color: #1b2942; box-shadow: 0 2px 7px #0003; cursor: pointer; transition: color .2s ease, transform .2s ease; }.card__save:hover { color: var(--color-secondary); transform: scale(1.06); }.card__save.is-active { color: var(--color-secondary); }.card__save:disabled { cursor: wait; opacity: .7; }\r\n\r\n.card__body { display: flex; flex: 1; min-width: 0; min-height: 166px; flex-direction: column; padding: .85rem 1rem 1.1rem; }\r\n.card__title { overflow-wrap: anywhere; margin: 0; color: #0f1f3d; font-size: 1.06rem; font-weight: 800; line-height: 1.16; display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }\r\n.card__published { margin: .34rem 0 0; color: #7a879b; font-size: .72rem; font-weight: 650; }\r\n.card__location { overflow-wrap: anywhere; display: flex; align-items: center; gap: .3rem; margin: .32rem 0 .7rem; color: #61708a; font-size: .76rem; }.card__location svg { color: var(--color-secondary); flex: 0 0 auto; }\r\n.card__specs { display: flex; flex-wrap: wrap; align-items: center; gap: .4rem .7rem; margin: 0 0 .9rem; padding: 0; color: #5d6b82; list-style: none; font-size: .76rem; }.card__specs li { display: inline-flex; align-items: center; min-width: 0; gap: .35rem; overflow-wrap: anywhere; }.card__specs svg { color: #233654; flex: 0 0 auto; }.card__divider { flex: 0 0 auto; width: 1px; height: 1rem; background: #d5dbe5; }\r\n.card__footer { display: flex; flex-direction: column; gap: .8rem; margin-top: auto; }\r\n.card__price { min-width: 0; max-width: 100%; margin: 0; color: #101f3a; }\r\n.card__price strong { min-width: 0; overflow-wrap: anywhere; font-size: 1.45rem; line-height: 1.2; letter-spacing: -.03em; }\r\n.card__currency, .card__period { color: #66758c; font-size: .76rem; font-weight: 700; }\r\n.card__currency { display: block; margin-bottom: .15rem; overflow-wrap: anywhere; }\r\n.card__period { display: inline-block; margin-left: .35rem; white-space: nowrap; }\r\n.card__cta { display: inline-flex; flex: 0 0 auto; align-items: center; justify-content: center; gap: .35rem; padding: .6rem .72rem; border-radius: 7px; background: var(--tone); color: #fff; font-size: .75rem; font-weight: 800; white-space: nowrap; text-decoration: none; box-shadow: 0 4px 9px color-mix(in srgb, var(--tone), transparent 65%); transition: filter .2s ease, transform .2s ease; }.card__cta:hover { filter: brightness(1.08); transform: translateY(-1px); }.card__cta svg { flex: 0 0 auto; transition: transform .2s ease; }.card__cta:hover svg { transform: translateX(3px); }\r\n.card__save:focus-visible, .card__cta:focus-visible { outline: 3px solid var(--color-accent); outline-offset: 3px; }\r\n\r\n@media (max-width: 540px) { .card__body { min-height: 0; }.card__title { font-size: 1.15rem; }.card__price strong { font-size: 1.55rem; } }\r\n\r\n.card--map {\r\n  display: grid;\r\n  grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);\r\n  height: auto;\r\n  padding: .5rem;\r\n  box-shadow: none;\r\n}\r\n.card--map:hover { transform: none; box-shadow: none; }\r\n.card--map .card__top { min-width: 0; min-height: 8rem; }\r\n.card--map .card__media {\r\n  position: absolute;\r\n  inset: 0;\r\n  aspect-ratio: auto;\r\n  border-radius: var(--radius-sm);\r\n}\r\n.card--map:hover .card__media img { transform: none; }\r\n.card--map .card__body { min-height: 0; padding: .25rem .3rem .2rem .75rem; }\r\n.card--map .card__title { padding-right: 1.5rem; font-size: 1rem; }\r\n.card--map .card__location, .card--map .card__specs { margin-bottom: .4rem; }\r\n.card--map .card__footer { gap: .45rem; }\r\n.card--map .card__price strong { font-size: 1.15rem; }\r\n.card--map .card__save, .card--map .badge--verified { display: none; }\r\n.card--map .badge--modalidad { top: .35rem; left: .35rem; padding: .32rem .45rem; font-size: .65rem; }\r\n\r\n@media (max-width: 360px) {\r\n  .card--map { grid-template-columns: minmax(0, 1fr) minmax(0, 1.85fr); }\r\n  .card--map .card__body { padding-left: .5rem; }\r\n}\r\n"] }]
    }], null, { publicacion: [{ type: i0.Input, args: [{ isSignal: true, alias: "publicacion", required: true }] }], miniaturaInicio: [{ type: i0.Input, args: [{ isSignal: true, alias: "miniaturaInicio", required: false }] }], vistaMapa: [{ type: i0.Input, args: [{ isSignal: true, alias: "vistaMapa", required: false }] }], favoriteChange: [{
            type: Output
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ListingCardComponent, { className: "ListingCardComponent", filePath: "src/app/shared/components/listing-card/listing-card.component.ts", lineNumber: 31 }); })();
