import { Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Anima la entrada de un bloque cuando aparece en pantalla (fade + desplazamiento).
 *
 *   <section appReveal>…</section>
 *   <app-card appReveal="zoom" [revealDelay]="$index * 70" />
 *
 * Solo corre en el navegador (afterNextRender): el HTML de SSR sale visible y
 * recién al hidratar se oculta y anima, así nunca queda contenido invisible si
 * falla JS. Los estilos (.reveal, .reveal--*) viven en styles.css.
 */
export class RevealDirective {
    /** Variante de animación: 'up' (por defecto), 'left', 'right' o 'zoom'. */
    appReveal = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "appReveal" }] : /* istanbul ignore next */ []));
    /** Retardo en ms, útil para escalonar grillas. */
    revealDelay = input(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "revealDelay" }] : /* istanbul ignore next */ []));
    el = inject((ElementRef));
    observer;
    constructor() {
        afterNextRender(() => {
            const el = this.el.nativeElement;
            if (typeof IntersectionObserver === 'undefined')
                return;
            el.classList.add('reveal', `reveal--${this.appReveal() || 'up'}`);
            el.style.setProperty('--reveal-delay', `${Math.min(this.revealDelay(), 900)}ms`);
            this.observer = new IntersectionObserver((entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting)
                        continue;
                    el.classList.add('is-visible');
                    this.observer?.disconnect();
                }
            }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
            this.observer.observe(el);
        });
    }
    ngOnDestroy() {
        this.observer?.disconnect();
    }
    static ɵfac = function RevealDirective_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || RevealDirective)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: RevealDirective, selectors: [["", "appReveal", ""]], inputs: { appReveal: [1, "appReveal"], revealDelay: [1, "revealDelay"] } });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(RevealDirective, [{
        type: Directive,
        args: [{ selector: '[appReveal]', standalone: true }]
    }], () => [], { appReveal: [{ type: i0.Input, args: [{ isSignal: true, alias: "appReveal", required: false }] }], revealDelay: [{ type: i0.Input, args: [{ isSignal: true, alias: "revealDelay", required: false }] }] }); })();
