import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideStar } from '@lucide/angular';
import { formatearPromedio, porcentajeResenas } from '../../../shared/utils/resenas';
import { EstrellasComponent } from '../estrellas/estrellas.component';
import { ResumenResenas } from '../resenas.model';

@Component({
  selector: 'app-resenas-resumen',
  standalone: true,
  imports: [EstrellasComponent, LucideStar],
  templateUrl: './resenas-resumen.component.html',
  styleUrl: './resenas-resumen.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResenasResumenComponent {
  readonly titulo = input('Reseñas');
  readonly tituloId = input.required<string>();
  readonly resumen = input.required<ResumenResenas>();

  protected readonly formatearPromedio = formatearPromedio;
  protected readonly promedio = computed(() => this.resumen().promedio);
  protected readonly cantidad = computed(() => this.resumen().cantidad);
  protected readonly mostrarResumen = computed(() =>
    this.cantidad() > 0 && this.promedio() !== null,
  );
  protected readonly distribucion = computed(() =>
    this.resumen().distribucion.map((fila) => ({
      ...fila,
      porcentaje: porcentajeResenas(fila.cantidad, this.cantidad()),
    })),
  );
}
