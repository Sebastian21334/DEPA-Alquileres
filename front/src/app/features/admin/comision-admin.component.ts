import { Component, DestroyRef, effect, inject, input, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { AdminService } from './admin.service';

/** Comisión de DEPA aplicable a nuevas reservas. Se consulta cada vez que se abre la sección. */
@Component({
  selector: 'app-comision-admin',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './comision-admin.component.html',
  styleUrl: './comision-admin.component.scss',
})
export class ComisionAdminComponent {
  private readonly api = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  protected actual: number | null = null;
  protected nueva: number | null = null;
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  /** Si la sección está a la vista: se abre desde el menú o directamente con `/admin#comision`. */
  readonly activa = input(false);

  constructor() {
    effect(() => {
      if (this.activa()) untracked(() => this.cargar());
    });
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.api.obtenerComisionDepa().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ porcentaje }) => {
        this.actual = porcentaje;
        this.nueva = porcentaje;
        this.cargando.set(false);
      },
      error: (error: Error) => {
        this.actual = null;
        this.cargando.set(false);
        this.error.set(error.message || 'No se pudo consultar la comisión.');
      },
    });
  }

  protected guardar(): void {
    const porcentaje = this.nueva;
    if (porcentaje == null || !Number.isFinite(porcentaje) || porcentaje < 0 || porcentaje > 100 || Math.abs(Math.round(porcentaje * 100) - porcentaje * 100) > 1e-8) {
      this.toast.mostrar('Ingresá un porcentaje entre 0 y 100 con hasta dos decimales.', 'error');
      return;
    }
    this.api.actualizarComisionDepa(porcentaje).subscribe({
      next: (resultado) => {
        this.actual = resultado.porcentaje;
        this.toast.mostrar('Comisión actualizada para nuevas reservas.', 'exito');
      },
      error: (e: Error) => this.toast.mostrar(e.message, 'error'),
    });
  }
}
