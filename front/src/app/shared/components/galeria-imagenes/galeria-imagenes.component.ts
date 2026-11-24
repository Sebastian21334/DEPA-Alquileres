import { Component, DestroyRef, ElementRef, afterRenderEffect, inject, input, output, signal, viewChildren } from '@angular/core';
import { moverImagen } from '../../utils/orden-imagenes';

export interface FotoGaleria { url: string; nombre?: string; }

@Component({
  selector: 'app-galeria-imagenes',
  standalone: true,
  templateUrl: './galeria-imagenes.component.html',
  styleUrl: './galeria-imagenes.component.scss',
})
export class GaleriaImagenesComponent {
  readonly fotos = input.required<readonly FotoGaleria[]>();
  readonly disabled = input(false);
  readonly minimo = input(0);
  readonly quitarDeshabilitado = input(false);
  /** En false (adjuntos de un formulario) no hay portada ni orden; solo la miniatura, el nombre y «Quitar». */
  readonly ordenable = input(true);
  readonly reordenar = output<{ desde: number; hasta: number }>();
  readonly quitar = output<number>();
  protected readonly arrastrada = signal<number | null>(null);
  protected readonly destino = signal<number | null>(null);
  private readonly tarjetas = viewChildren<ElementRef<HTMLElement>>('tarjetaFoto');
  private readonly espacios = viewChildren<ElementRef<HTMLElement>>('espacioFoto');
  private posiciones = new Map<string, DOMRect>();
  private readonly animaciones = new Set<Animation>();

  constructor() {
    afterRenderEffect(() => {
      const fotos = this.fotos();
      const tarjetas = this.tarjetas();
      if (!this.ordenable()) {
        this.cancelarAnimaciones();
        this.posiciones.clear();
        return;
      }
      const espacios = this.espacios().map(espacio => espacio.nativeElement.getBoundingClientRect());
      const desde = this.arrastrada(), hasta = this.destino();
      const vistaPrevia = desde !== null && hasta !== null;
      const orden = vistaPrevia ? moverImagen(fotos, desde, hasta) : fotos;
      const destinos = new Map(orden.map((foto, index) => [foto.url, espacios[index]]));
      this.cancelarAnimaciones();
      const reducirMovimiento = tarjetas[0]?.nativeElement.ownerDocument.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? true;
      tarjetas.forEach((tarjeta, index) => {
        const url = fotos[index]?.url;
        const base = espacios[index], destino = url ? destinos.get(url) : undefined;
        const anterior = (url ? this.posiciones.get(url) : undefined) ?? base;
        if (!base || !destino || !anterior) return;
        const x = anterior.left - base.left, y = anterior.top - base.top;
        const finalX = destino.left - base.left, finalY = destino.top - base.top;
        if (Math.abs(x) < 1 && Math.abs(y) < 1 && Math.abs(finalX) < 1 && Math.abs(finalY) < 1) return;
        const animacion = tarjeta.nativeElement.animate([
          { transform: `translate(${x}px, ${y}px)` },
          { transform: `translate(${finalX}px, ${finalY}px)` },
        ], { duration: reducirMovimiento ? 0 : 240, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: vistaPrevia ? 'both' : 'none' });
        this.animaciones.add(animacion);
        if (!vistaPrevia) {
          void animacion.finished.then(() => this.animaciones.delete(animacion), () => this.animaciones.delete(animacion));
        }
      });
      this.posiciones = new Map([...destinos].filter((entrada): entrada is [string, DOMRect] => !!entrada[1]));
    });
    inject(DestroyRef).onDestroy(() => this.cancelarAnimaciones());
  }

  protected textoAlternativo(foto: FotoGaleria, index: number): string {
    if (!this.ordenable()) return foto.nombre ?? `imagen ${index + 1}`;
    return `Foto ${index + 1}${index === 0 ? ', portada' : ''}`;
  }

  protected iniciar(event: DragEvent, index: number): void {
    if (this.disabled() || !this.ordenable()) { event.preventDefault(); return; }
    this.posiciones = this.capturarPosiciones();
    this.arrastrada.set(index);
    this.destino.set(null);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
    }
  }

  protected permitir(event: DragEvent, index: number): void {
    if (this.disabled() || !this.ordenable() || this.arrastrada() === null) return;
    event.preventDefault();
    const hasta = this.indiceDestino(event, index);
    const destino = hasta === this.arrastrada() ? null : hasta;
    if (this.destino() !== destino) {
      this.posiciones = this.capturarPosiciones();
      this.destino.set(destino);
    }
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  }

  protected finalizar(): void {
    if (this.arrastrada() === null) return;
    this.posiciones = this.capturarPosiciones();
    this.arrastrada.set(null);
    this.destino.set(null);
  }

  protected soltar(event: DragEvent, index: number): void {
    event.preventDefault();
    event.stopPropagation();
    const desde = this.arrastrada();
    const hasta = this.indiceDestino(event, index);
    this.finalizar();
    if (desde !== null) this.mover(desde, hasta);
  }

  private indiceDestino(event: DragEvent, fallback: number): number {
    // Los espacios permanecen fijos mientras las tarjetas se desplazan por encima.
    const index = this.espacios().findIndex(espacio => {
      const rect = espacio.nativeElement.getBoundingClientRect();
      return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    });
    return index < 0 ? fallback : index;
  }

  protected mover(desde: number, hasta: number): void {
    if (this.disabled() || !this.ordenable() || desde === hasta) return;
    this.posiciones = this.capturarPosiciones();
    this.reordenar.emit({ desde, hasta });
  }

  private capturarPosiciones(): Map<string, DOMRect> {
    const posiciones = new Map<string, DOMRect>();
    this.tarjetas().forEach((tarjeta, index) => {
      const url = this.fotos()[index]?.url;
      if (url) posiciones.set(url, tarjeta.nativeElement.getBoundingClientRect());
    });
    return posiciones;
  }

  private cancelarAnimaciones(): void {
    this.animaciones.forEach(animacion => animacion.cancel());
    this.animaciones.clear();
  }
}
