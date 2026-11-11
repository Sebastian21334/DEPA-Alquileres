import { Injectable, signal } from '@angular/core';

type TipoToast = 'info' | 'exito' | 'error' | 'advertencia';

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly aviso = signal<{ mensaje: string; tipo: TipoToast } | null>(null);
  private timer: ReturnType<typeof setTimeout> | null = null;

  mostrar(mensaje: string, tipo: TipoToast = 'info'): void {
    this.aviso.set({ mensaje, tipo });
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.cerrar(), tipo === 'error' || tipo === 'advertencia' ? 9000 : 6000);
  }

  cerrar(): void {
    this.aviso.set(null);
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
