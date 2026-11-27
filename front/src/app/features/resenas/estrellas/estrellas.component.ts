import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { LucideStar } from '@lucide/angular';
import { porcentajeEstrellas } from '../../../shared/utils/resenas';

let siguienteGrupo = 0;

@Component({
  selector: 'app-estrellas',
  standalone: true,
  imports: [LucideStar],
  templateUrl: './estrellas.component.html',
  styleUrl: './estrellas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstrellasComponent {
  readonly valor = input.required<number>();
  readonly interactivo = input(false);
  readonly tamano = input<'sm' | 'md' | 'lg'>('md');
  readonly etiqueta = input('Calificación');
  readonly seleccion = output<number>();

  protected readonly estrellas = [1, 2, 3, 4, 5];
  protected readonly preview = signal(0);
  protected readonly nombreGrupo = `estrellas-${siguienteGrupo++}`;
  protected readonly porcentaje = computed(() => porcentajeEstrellas(this.valor()));
  protected readonly tamanoPx = computed(() =>
    this.tamano() === 'sm' ? 15 : this.tamano() === 'lg' ? 30 : 19,
  );
  protected readonly valorVisible = computed(() => this.preview() || this.valor());

  protected seleccionar(puntaje: number): void {
    this.seleccion.emit(puntaje);
  }

  protected previsualizar(puntaje: number): void {
    this.preview.set(puntaje);
  }

  protected limpiarPreview(): void {
    this.preview.set(0);
  }
}
