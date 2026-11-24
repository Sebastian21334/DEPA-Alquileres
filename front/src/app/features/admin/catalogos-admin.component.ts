import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ToastService } from '../../core/services/toast.service';
import { AdminCatalogItem, AdminService, CatalogKey } from './admin.service';

interface SeccionCatalogo {
  clave: CatalogKey;
  etiqueta: string;
  items: AdminCatalogItem[];
}

/** Consulta de los catálogos del sistema; se cargan por seed o migración. */
@Component({
  selector: 'app-catalogos-admin',
  standalone: true,
  templateUrl: './catalogos-admin.component.html',
  styleUrl: './catalogos-admin.component.scss',
})
export class CatalogosAdminComponent {
  private readonly api = inject(AdminService);
  private readonly toast = inject(ToastService);
  protected readonly catalogos = signal<SeccionCatalogo[]>([
    { clave: 'tipos-anunciante', etiqueta: 'Tipos de anunciante', items: [] },
    { clave: 'tipos-propiedad', etiqueta: 'Tipos de propiedad', items: [] },
    { clave: 'modalidades', etiqueta: 'Modalidades', items: [] },
    { clave: 'tipos-moneda', etiqueta: 'Monedas', items: [] },
  ]);

  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) this.cargar();
  }

  private cargar(): void {
    const secciones = this.catalogos();
    forkJoin(secciones.map((seccion) => this.api.listarCatalogo(seccion.clave))).subscribe({
      next: (valores) => this.catalogos.set(secciones.map((seccion, i) => ({ ...seccion, items: valores[i] }))),
      error: (e: Error) => this.toast.mostrar(e.message, 'error'),
    });
  }
}
