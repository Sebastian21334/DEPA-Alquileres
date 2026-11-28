import { Component, ElementRef, afterRenderEffect, inject, input } from '@angular/core';
import { CargaService } from '../../../core/services/carga.service';

// Indicador compartido de carga con la identidad visual de DEPA.
@Component({
  selector: 'app-spinner',
  standalone: true,
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
})
export class SpinnerComponent {
  readonly label = input('Cargando…');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly carga = inject(CargaService);

  constructor() {
    // El indicador global se oculta mientras haya feedback de carga visible en el contenido.
    afterRenderEffect(onCleanup => {
      if (typeof IntersectionObserver === 'undefined') return;
      const actualizar = this.carga.registrarIndicadorLocal();
      const observador = new IntersectionObserver(([entrada]) => actualizar(entrada.isIntersecting));
      observador.observe(this.host.nativeElement);
      onCleanup(() => {
        observador.disconnect();
        actualizar(false);
      });
    });
  }
}
