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
  readonly local = input(true);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly carga = inject(CargaService);

  constructor() {
    // Si ya se ve un logo en el contenido, evita duplicarlo en el panel global.
    afterRenderEffect(onCleanup => {
      if (!this.local() || typeof IntersectionObserver === 'undefined') return;
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
