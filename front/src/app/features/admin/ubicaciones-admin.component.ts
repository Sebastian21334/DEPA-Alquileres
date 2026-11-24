import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
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
  protected readonly provincias = signal<AdminProvince[]>([]);
  protected readonly ciudades = signal<AdminCity[]>([]);
  protected readonly provinciaElegida = signal<number | null>(null);

  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID)))
      this.api.listarProvincias().subscribe({
        next: (provincias) => this.provincias.set(provincias),
        error: (e: Error) => this.toast.mostrar(e.message, 'error'),
      });
  }

  protected elegirProvincia(id: number): void {
    this.provinciaElegida.set(id);
    this.api.listarCiudades(id).subscribe({
      next: (ciudades) => this.ciudades.set(ciudades),
      error: (e: Error) => this.toast.mostrar(e.message, 'error'),
    });
  }
}
