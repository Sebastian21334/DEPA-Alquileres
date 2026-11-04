import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-galeria-imagenes',
  standalone: true,
  templateUrl: './galeria-imagenes.component.html',
  styleUrl: './galeria-imagenes.component.scss',
})
export class GaleriaImagenesComponent {
  readonly fotos = input.required<readonly { url: string }[]>();
  readonly disabled = input(false);
  readonly minimo = input(0);
  readonly reordenar = output<{ desde: number; hasta: number }>();
  readonly quitar = output<number>();
  protected readonly arrastrada = signal<number | null>(null);

  protected iniciar(event: DragEvent, index: number): void {
    if (this.disabled()) { event.preventDefault(); return; }
    this.arrastrada.set(index);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
    }
  }

  protected permitir(event: DragEvent): void {
    if (this.disabled() || this.arrastrada() === null) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  }

  protected soltar(event: DragEvent, hasta: number): void {
    event.preventDefault();
    event.stopPropagation();
    const desde = this.arrastrada();
    this.arrastrada.set(null);
    if (!this.disabled() && desde !== null && desde !== hasta) this.reordenar.emit({ desde, hasta });
  }
}
