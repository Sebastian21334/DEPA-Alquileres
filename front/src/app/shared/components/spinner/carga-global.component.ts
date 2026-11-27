import { Component, ElementRef, afterRenderEffect, computed, inject, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationSkipped, NavigationStart, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { CargaService } from '../../../core/services/carga.service';
import { SpinnerComponent } from './spinner.component';

@Component({
  selector: 'app-carga-global',
  imports: [SpinnerComponent],
  template: `
    <div #indicador popover="manual" class="carga-global" [class.carga-global--activa]="activa()">
      <app-spinner [local]="false" [label]="navegando() ? 'Abriendo página…' : 'Cargando…'" />
      <span aria-hidden="true">{{ navegando() ? 'Abriendo página…' : 'Cargando…' }}</span>
    </div>
  `,
  styles: `
    .carga-global {
      display: none; position: fixed; inset: 50% auto auto 50%; margin: 0;
      transform: translate(-50%, -50%); width: max-content;
      z-index: 10000; max-width: calc(100vw - 2rem); padding: .5rem 1.25rem .9rem;
      border: 1px solid var(--color-border); border-radius: 16px;
      background: var(--color-surface); color: var(--color-text);
      box-shadow: 0 8px 32px rgb(16 24 40 / 18%); pointer-events: none;
      text-align: center; font-size: .85rem;
    }
    .carga-global--activa { display: grid; justify-items: center; animation: depa-fade-in .15s ease .15s both; }
    .carga-global::backdrop { pointer-events: none; }
  `,
})
export class CargaGlobalComponent {
  protected readonly carga = inject(CargaService);
  private readonly router = inject(Router);
  private readonly indicador = viewChild<ElementRef<HTMLElement>>('indicador');
  protected readonly navegando = toSignal(this.router.events.pipe(
    filter(event => event instanceof NavigationStart || event instanceof NavigationEnd ||
      event instanceof NavigationCancel || event instanceof NavigationError || event instanceof NavigationSkipped),
    map(event => event instanceof NavigationStart),
  ), { initialValue: !!this.router.currentNavigation() });
  protected readonly activa = computed(() => this.navegando() ||
    (this.carga.activa() && !this.carga.indicadorLocalVisible()));

  constructor() {
    // La capa superior permite ver la carga también al guardar desde un <dialog>.
    // Es no modal: conserva el foco y permite seguir usando la página.
    afterRenderEffect(() => {
      const activo = this.activa();
      const elemento = this.indicador()?.nativeElement;
      if (!elemento?.showPopover) return;
      if (activo && !elemento.matches(':popover-open')) elemento.showPopover();
      else if (!activo && elemento.matches(':popover-open')) elemento.hidePopover();
    });
  }
}
