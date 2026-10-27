import { isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CotizacionesService, HistorialDolar } from '../../shared/services/cotizaciones.service';

@Component({
  selector: 'app-cotizaciones-admin',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './cotizaciones-admin.component.html',
  styleUrl: './cotizaciones-admin.component.scss',
})
export class CotizacionesAdminComponent {
  private readonly api = inject(CotizacionesService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly datos = signal<HistorialDolar | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected desde = '';
  protected hasta = '';
  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) this.cargar();
  }
  protected cargar(pagina = 1, verificar = false): void {
    if (this.cargando()) return;
    if (this.desde && this.hasta && this.desde > this.hasta) {
      this.error.set('La fecha desde no puede ser posterior a hasta.');
      return;
    }
    this.cargando.set(true);
    this.error.set('');
    const consulta = verificar
      ? this.api.verificar()
      : this.api.listar(this.desde, this.hasta, pagina);
    consulta.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (datos) => {
        this.datos.set(datos);
        this.cargando.set(false);
        if (verificar) {
          this.desde = '';
          this.hasta = '';
        }
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo consultar el historial del dólar.');
        this.cargando.set(false);
      },
    });
  }
  protected fecha(valor: string | null | undefined): string {
    return valor
      ? new Date(valor).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })
      : 'Sin datos';
  }
  protected importe(valor: string): string {
    return Number(valor).toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 6,
    });
  }
}
