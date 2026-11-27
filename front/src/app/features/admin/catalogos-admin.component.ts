import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, computed, DestroyRef, ElementRef, inject, Injector, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { LucideLayers3, LucidePlus, LucidePencil, LucideTrash2, LucideSearch, LucideX } from '@lucide/angular';
import { finalize, forkJoin, type Observable } from 'rxjs';
import { ToastService } from '../../core/services/toast.service';
import { AdminCatalogItem, AdminCatalogDatos, AdminService, CatalogKey } from './admin.service';

interface SeccionCatalogo {
  clave: CatalogKey;
  etiqueta: string;
  descripcion: string;
  items: AdminCatalogItem[];
}

@Component({
  selector: 'app-catalogos-admin',
  standalone: true,
  imports: [FormsModule, LucideLayers3, LucidePlus, LucidePencil, LucideTrash2, LucideSearch, LucideX],
  templateUrl: './catalogos-admin.component.html',
  styleUrl: './catalogos-admin.component.scss',
})
export class CatalogosAdminComponent {
  private readonly api = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');
  readonly cargando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly errorCarga = signal('');
  protected readonly error = signal('');
  protected readonly busqueda = signal('');
  protected readonly seleccion = signal<{ seccion: SeccionCatalogo; item?: AdminCatalogItem; eliminar: boolean } | null>(null);
  protected nombre = '';
  protected descripcion = '';
  protected permiteReservas = false;
  protected readonly catalogos = signal<SeccionCatalogo[]>([
    { clave: 'tipos-anunciante', etiqueta: 'Tipos de anunciante', descripcion: 'Quiénes publican en DEPA.', items: [] },
    { clave: 'tipos-propiedad', etiqueta: 'Tipos de propiedad', descripcion: 'Opciones para clasificar los inmuebles.', items: [] },
    { clave: 'modalidades', etiqueta: 'Modalidades', descripcion: 'Formas de alquilar y reservar.', items: [] },
    { clave: 'tipos-moneda', etiqueta: 'Monedas', descripcion: 'Monedas de los precios publicados.', items: [] },
  ]);
  protected readonly total = computed(() => this.catalogos().reduce((total, seccion) => total + seccion.items.length, 0));
  protected readonly visibles = computed(() => {
    const q = this.busqueda().trim().toLocaleLowerCase('es');
    return this.catalogos().map((seccion) => ({ ...seccion, items: seccion.items.filter((item) =>
      `${item.nombre} ${item.descripcion ?? ''} ${seccion.etiqueta}`.toLocaleLowerCase('es').includes(q)) }));
  });

  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) this.cargar();
  }

  cargar(): void {
    if (this.cargando() || this.guardando()) return;
    this.cargando.set(true);
    this.errorCarga.set('');
    const secciones = this.catalogos();
    forkJoin(secciones.map((seccion) => this.api.listarCatalogo(seccion.clave)))
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.cargando.set(false))).subscribe({
      next: (valores) => this.catalogos.set(secciones.map((seccion, i) => ({ ...seccion, items: valores[i] }))),
      error: () => this.errorCarga.set('No pudimos cargar los catálogos. Volvé a intentar.'),
    });
  }

  protected abrir(seccion: SeccionCatalogo, item?: AdminCatalogItem, eliminar = false): void {
    this.seleccion.set({ seccion, item, eliminar });
    this.nombre = item?.nombre ?? '';
    this.descripcion = item?.descripcion ?? '';
    this.permiteReservas = item?.admite_reservas_por_fecha ?? item?.permite_reservas_por_fecha ?? false;
    this.error.set('');
    afterNextRender(() => this.dialogo().nativeElement.showModal(), { injector: this.injector });
  }

  protected cerrar(event?: Event): void {
    event?.preventDefault();
    if (this.guardando()) return;
    this.dialogo().nativeElement.close();
    this.seleccion.set(null);
  }

  protected confirmar(): void {
    const seleccion = this.seleccion();
    if (!seleccion || this.guardando()) return;
    const { seccion, item, eliminar } = seleccion;
    const datos: AdminCatalogDatos = { nombre: this.nombre.trim(), descripcion: this.descripcion.trim() || null };
    if (!eliminar && !datos.nombre) return;
    if (seccion.clave === 'modalidades') datos.permite_reservas_por_fecha = this.permiteReservas;
    const solicitud: Observable<AdminCatalogItem | void> = eliminar && item ? this.api.eliminarCatalogo(seccion.clave, item.id)
      : item ? this.api.actualizarCatalogo(seccion.clave, item.id, datos) : this.api.crearCatalogo(seccion.clave, datos);
    this.guardando.set(true);
    this.error.set('');
    solicitud.pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.guardando.set(false))).subscribe({
      next: (guardado) => {
        this.catalogos.update((secciones) => secciones.map((actual) => {
          if (actual.clave !== seccion.clave) return actual;
          const items = actual.items.filter((valor) => valor.id !== item?.id);
          if (guardado) items.push(guardado);
          return { ...actual, items: items.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')) };
        }));
        this.dialogo().nativeElement.close();
        this.seleccion.set(null);
        this.toast.mostrar(eliminar ? 'Elemento eliminado.' : item ? 'Cambios guardados.' : 'Elemento agregado.', 'exito');
      },
      error: (e: Error) => this.error.set(e.message || 'No pudimos completar la operación. Volvé a intentar.'),
    });
  }
}
