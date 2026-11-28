import { isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, type Subscription } from 'rxjs';
import { ToastService } from '../../core/services/toast.service';
import { AdminCity, AdminProvince, AdminService } from './admin.service';

/** Consulta de provincias y ciudades; se cargan por seed o migración. */
@Component({
  selector: 'app-ubicaciones-admin',
  standalone: true,
  templateUrl: './ubicaciones-admin.component.html',
  styleUrl: './ubicaciones-admin.component.scss',
})
export class UbicacionesAdminComponent {
  private readonly api = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private consultaCiudades?: Subscription;
  readonly cargando = signal(false);
  protected readonly provincias = signal<AdminProvince[]>([]);
  protected readonly ciudades = signal<AdminCity[]>([]);
  protected readonly provinciaElegida = signal<number | null>(null);

  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) this.cargar();
  }

  cargar(): void {
    if (this.cargando()) return;
    this.cargando.set(true);
    this.api.listarProvincias().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.cargando.set(false)),
    ).subscribe({
      next: (provincias) => this.provincias.set(provincias),
      error: (e: Error) => this.toast.mostrar(e.message, 'error'),
    });
    const provincia = this.provinciaElegida();
    if (provincia !== null) this.elegirProvincia(provincia);
  }

  protected elegirProvincia(id: number): void {
    if (this.provinciaElegida() !== id) this.ciudades.set([]);
    this.provinciaElegida.set(id);
    this.consultaCiudades?.unsubscribe();
    this.consultaCiudades = this.api.listarCiudades(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (ciudades) => this.ciudades.set(ciudades),
      error: (e: Error) => this.toast.mostrar(e.message, 'error'),
    });
  }
}
