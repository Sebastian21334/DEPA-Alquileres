import { Injectable, computed, signal } from '@angular/core';

/** Cuenta operaciones concurrentes; cada finalizador solo puede liberar su propia carga. */
@Injectable({ providedIn: 'root' })
export class CargaService {
  private readonly pendientes = signal(0);
  private readonly indicadoresLocales = signal(0);
  readonly activa = computed(() => this.pendientes() > 0);
  readonly indicadorLocalVisible = computed(() => this.indicadoresLocales() > 0);

  registrarIndicadorLocal(): (visible: boolean) => void {
    let visibleActual = false;
    return visible => {
      if (visible === visibleActual) return;
      visibleActual = visible;
      this.indicadoresLocales.update(total => total + (visible ? 1 : -1));
    };
  }

  iniciar(): () => void {
    this.pendientes.update(total => total + 1);
    let finalizada = false;
    return () => {
      if (finalizada) return;
      finalizada = true;
      this.pendientes.update(total => total - 1);
    };
  }
}
