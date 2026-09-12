import { Directive, ElementRef, OnDestroy, afterNextRender, inject, input } from '@angular/core';

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
@Directive({ selector: '[appReveal]', standalone: true })
export class RevealDirective implements OnDestroy {
  /** Variante de animación: 'up' (por defecto), 'left', 'right' o 'zoom'. */
  readonly appReveal = input<'' | 'up' | 'left' | 'right' | 'zoom'>('');
  /** Retardo en ms, útil para escalonar grillas. */
  readonly revealDelay = input(0);

  private readonly el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  constructor() {
    afterNextRender(() => {
      const el = this.el.nativeElement;
      if (typeof IntersectionObserver === 'undefined') return;

      el.classList.add('reveal', `reveal--${this.appReveal() || 'up'}`);
      el.style.setProperty('--reveal-delay', `${Math.min(this.revealDelay(), 900)}ms`);

      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            el.classList.add('is-visible');
            this.observer?.disconnect();
          }
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
      );
      this.observer.observe(el);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
