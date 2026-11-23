import { Location } from '@angular/common';
import { computed, Directive, inject, input } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Enlace «Volver» a la pantalla anterior de DEPA, como la flecha del navegador.
 * Si se entró directo (enlace pegado o recarga), lleva a la ruta de respaldo.
 * Uso: `<a appVolver="/admin" fragmentoVolver="reclamos">← Volver</a>`.
 */
@Directive({
  selector: 'a[appVolver]',
  host: { '[attr.href]': 'href()', '(click)': 'volver($event)' },
})
export class VolverDirective {
  /** Ruta de respaldo. */
  readonly appVolver = input.required<string>();
  readonly fragmentoVolver = input<string>();
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly destino = computed(() => this.router.createUrlTree([this.appVolver()], { fragment: this.fragmentoVolver() }));
  protected readonly href = computed(() => this.router.serializeUrl(this.destino()));

  protected volver(evento: MouseEvent): void {
    // Con Ctrl, Shift, Alt o la rueda, el respaldo se abre en otra pestaña como cualquier enlace.
    if (evento.button !== 0 || evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return;
    evento.preventDefault();
    if (this.router.lastSuccessfulNavigation()?.previousNavigation) this.location.back();
    else void this.router.navigateByUrl(this.destino());
  }
}
