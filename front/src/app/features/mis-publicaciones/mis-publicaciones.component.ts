import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { concatMap, from, type Subscription } from 'rxjs';
import { LucideEye, LucideImagePlus, LucideMapPin, LucideSquarePlus, LucideTrash2, LucideX } from '@lucide/angular';
import { GestionPublicacionesService, type PagoPublicacion } from '../../shared/services/gestion-publicaciones.service';
import { Publicacion } from '../../shared/models/publicacion.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { GaleriaImagenesComponent } from '../../shared/components/galeria-imagenes/galeria-imagenes.component';
import { moverImagen } from '../../shared/utils/orden-imagenes';

const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_IMAGEN = 10 * 1024 * 1024;

// Panel del anunciante verificado para administrar sus publicaciones: ver,
// activar, desactivar, mover a la papelera, restaurar y gestionar sus imágenes.
@Component({
  selector: 'app-mis-publicaciones',
  standalone: true,
  imports: [RouterLink, SpinnerComponent, GaleriaImagenesComponent, LucideEye, LucideImagePlus, LucideMapPin, LucideSquarePlus, LucideTrash2, LucideX],
  templateUrl: './mis-publicaciones.component.html',
  styleUrl: './mis-publicaciones.component.scss',
})
export class MisPublicacionesComponent {
  private readonly gestion = inject(GestionPublicacionesService);
  private readonly destroyRef = inject(DestroyRef);
  private solicitudLiquidaciones?: Subscription;

  private readonly todas = signal<Publicacion[]>([]);
  protected readonly publicaciones = computed(() => this.todas().filter((p) => !p.eliminada));
  protected readonly papelera = computed(() => this.todas().filter((p) => p.eliminada));
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly aviso = signal(inject(ActivatedRoute).snapshot.queryParamMap.get('aviso') ?? '');
  protected readonly resultado = signal('');
  protected readonly expandida = signal<number | null>(null);
  protected readonly liquidacionesAbiertas = signal<number | null>(null);
  protected readonly liquidaciones = signal<PagoPublicacion[] | null>(null);
  protected readonly errorLiquidaciones = signal(false);
  protected readonly confirmandoBorrado = signal<number | null>(null);
  protected readonly ocupada = signal<number | null>(null);
  protected readonly errorFila = signal<{ id: number; mensaje: string } | null>(null);

  protected readonly activas = computed(() => this.publicaciones().filter((p) => p.activa).length);

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    this.gestion.listarConPapelera().subscribe({
      next: (lista) => {
        this.todas.set(lista);
        this.cargando.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.cargando.set(false);
      },
    });
  }

  protected alternarImagenes(id: number): void {
    this.expandida.update((actual) => (actual === id ? null : id));
    this.errorFila.set(null);
  }

  protected alternarLiquidaciones(id: number): void {
    if (this.liquidacionesAbiertas() === id) {
      this.solicitudLiquidaciones?.unsubscribe();
      this.liquidacionesAbiertas.set(null);
      return;
    }
    this.liquidacionesAbiertas.set(id);
    this.cargarLiquidaciones(id);
  }

  protected cargarLiquidaciones(id: number): void {
    this.solicitudLiquidaciones?.unsubscribe();
    this.liquidaciones.set(null);
    this.errorLiquidaciones.set(false);
    this.solicitudLiquidaciones = this.gestion.listarLiquidaciones(id).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: pagos => this.liquidaciones.set(pagos),
      error: () => this.errorLiquidaciones.set(true),
    });
  }

  protected importeLiquidacion(pago: PagoPublicacion): string {
    if (pago.importe === null) return 'Importe sin registrar';
    const importe = pago.importe.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return [pago.moneda, importe].filter(Boolean).join(' ');
  }

  protected fechaLiquidacion(valor: string): string {
    return new Date(valor).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
  }

  protected eliminar(pub: Publicacion): void {
    if (this.ocupada() !== null) return;
    this.ocupada.set(pub.id);
    this.errorFila.set(null);
    this.resultado.set('');
    this.gestion.eliminar(pub.id).subscribe({
      next: (eliminada) => {
        this.actualizar(pub.id, () => eliminada);
        this.confirmandoBorrado.set(null);
        if (this.expandida() === pub.id) this.expandida.set(null);
        this.resultado.set('La publicación se movió a la Papelera. Podés restaurarla desde allí.');
        this.ocupada.set(null);
      },
      error: (err: Error) => this.fallo(pub.id, err),
    });
  }

  protected restaurar(pub: Publicacion): void {
    if (this.ocupada() !== null) return;
    this.ocupada.set(pub.id);
    this.errorFila.set(null);
    this.resultado.set('');
    this.gestion.restaurar(pub.id).subscribe({
      next: (restaurada) => {
        this.actualizar(pub.id, () => restaurada);
        this.resultado.set('La publicación volvió a Mis publicaciones como inactiva.');
        this.ocupada.set(null);
      },
      error: (err: Error) => this.fallo(pub.id, err),
    });
  }

  protected alternarActividad(pub: Publicacion): void {
    if (this.ocupada() !== null) return;
    this.ocupada.set(pub.id);
    this.errorFila.set(null);
    this.resultado.set('');
    this.gestion.cambiarActividad(pub.id, !pub.activa).subscribe({
      next: (actualizada) => {
        this.actualizar(pub.id, () => actualizada);
        this.resultado.set(actualizada.activa ? 'Publicación activada.' : 'Publicación desactivada. Ya no aparece en el feed.');
        this.ocupada.set(null);
      },
      error: (err: Error) => this.fallo(pub.id, err),
    });
  }

  protected subirImagenes(pub: Publicacion, event: Event): void {
    if (this.ocupada() !== null) return;
    const input = event.target as HTMLInputElement;
    const archivos = Array.from(input.files ?? []);
    input.value = '';
    const validos = archivos.filter((a) => TIPOS_IMAGEN.includes(a.type) && a.size <= MAX_IMAGEN);
    this.errorFila.set(
      validos.length < archivos.length
        ? { id: pub.id, mensaje: 'Algunos archivos se descartaron: solo imágenes de hasta 10 MB.' }
        : null,
    );
    if (!validos.length) return;

    this.ocupada.set(pub.id);
    from(validos)
      .pipe(concatMap((archivo) => this.gestion.subirImagen(pub.id, archivo)))
      .subscribe({
        next: (imagen) =>
          // El backend activa la publicación al recibir su primera imagen.
          this.actualizar(pub.id, (p) => ({ ...p, activa: p.activa || (!p.motivo_baja_admin && !p.imagenes?.length), imagenes: [...(p.imagenes ?? []), { id: imagen.id, url: imagen.url }] })),
        error: (err: Error) => this.fallo(pub.id, err),
        complete: () => this.ocupada.set(null),
      });
  }

  protected eliminarImagen(pub: Publicacion, idImagen: number): void {
    if (this.ocupada() !== null) return;
    this.ocupada.set(pub.id);
    this.gestion.eliminarImagen(idImagen).subscribe({
      next: () => {
        this.actualizar(pub.id, (p) => ({ ...p, imagenes: (p.imagenes ?? []).filter((i) => i.id !== idImagen) }));
        this.ocupada.set(null);
      },
      error: (err: Error) => this.fallo(pub.id, err),
    });
  }

  protected ordenarImagenes(pub: Publicacion, cambio: { desde: number; hasta: number }): void {
    if (this.ocupada() !== null) return;
    const imagenes = moverImagen(pub.imagenes ?? [], cambio.desde, cambio.hasta);
    this.ocupada.set(pub.id);
    this.errorFila.set(null);
    this.gestion.ordenarImagenes(pub.id, imagenes.map((imagen) => imagen.id)).subscribe({
      next: (ordenadas) => {
        this.actualizar(pub.id, (p) => ({ ...p, imagenes: ordenadas }));
        this.ocupada.set(null);
      },
      error: (err: Error) => this.fallo(pub.id, err),
    });
  }

  protected precio(p: Publicacion): string {
    return `${p.tipoMoneda?.nombre ?? '$'} ${Number(p.precio).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
  }

  protected ubicacion(p: Publicacion): string {
    return [p.direccion, p.ciudad?.nombre, p.provincia?.nombre].filter(Boolean).join(', ');
  }

  protected fecha(valor: string): string {
    return new Date(valor).toLocaleDateString('es-AR', { timeZone: 'UTC' });
  }

  private actualizar(id: number, cambio: (p: Publicacion) => Publicacion): void {
    this.todas.update((lista) => lista.map((p) => (p.id === id ? cambio(p) : p)));
  }

  private fallo(id: number, err: Error): void {
    this.errorFila.set({ id, mensaje: err.message });
    this.ocupada.set(null);
  }
}
