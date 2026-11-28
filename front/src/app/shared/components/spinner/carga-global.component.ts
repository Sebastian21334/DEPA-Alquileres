import { Component, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationSkipped, NavigationStart, Router } from '@angular/router';
import { filter, map, of, switchMap, timer } from 'rxjs';
import { CargaService } from '../../../core/services/carga.service';

@Component({
  selector: 'app-carga-global',
  template: `
    <div class="sr-only" role="status">{{ mostrando() ? (navegando() ? 'Abriendo página…' : 'Cargando…') : '' }}</div>
    @if (mostrando()) {
      <div class="carga-global" aria-hidden="true"></div>
    }
  `,
  styles: `
    .carga-global {
      position: fixed;
      inset: 0 0 auto;
      z-index: 10000;
      height: 3px;
      overflow: hidden;
      pointer-events: none;
      background: var(--color-border);
    }
    .carga-global::before {
      content: '';
      display: block;
      width: 35%;
      height: 100%;
      background: var(--color-primary, #f47818);
      animation: avanzando 1.3s ease-in-out infinite;
    }
    @keyframes avanzando {
      from { transform: translateX(-100%); }
      to { transform: translateX(286%); }
    }
    @media (prefers-reduced-motion: reduce) {
      .carga-global::before { animation: none; }
    }
  `,
})
export class CargaGlobalComponent {
  private readonly carga = inject(CargaService);
  private readonly router = inject(Router);
  protected readonly navegando = toSignal(this.router.events.pipe(
    filter(event => event instanceof NavigationStart || event instanceof NavigationEnd ||
      event instanceof NavigationCancel || event instanceof NavigationError || event instanceof NavigationSkipped),
    map(event => event instanceof NavigationStart),
  ), { initialValue: !!this.router.currentNavigation() });
  private readonly activa = computed(() => !this.carga.indicadorLocalVisible() &&
    (this.navegando() || this.carga.activa()));

  private readonly transcurrioDemora = toSignal(toObservable(this.activa).pipe(
    switchMap(activa => activa ? timer(450).pipe(map(() => true)) : of(false)),
  ), { initialValue: false });
  protected readonly mostrando = computed(() => this.activa() && this.transcurrioDemora());
}
