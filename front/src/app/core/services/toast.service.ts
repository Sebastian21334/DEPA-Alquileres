import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly mensaje = signal<string | null>(null);
  private timer: ReturnType<typeof setTimeout> | null = null;

  mostrar(mensaje: string): void {
    this.mensaje.set(mensaje);
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.cerrar(), 6000);
  }

  cerrar(): void {
    this.mensaje.set(null);
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
