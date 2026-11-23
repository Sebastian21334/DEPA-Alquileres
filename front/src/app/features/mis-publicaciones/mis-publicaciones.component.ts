import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type { Subscription } from 'rxjs';
import { LucideEye, LucideMapPin, LucidePencil, LucideSquarePlus, LucideTrash2, LucideX } from '@lucide/angular';
import { GestionPublicacionesService, type PagoPublicacion } from '../../shared/services/gestion-publicaciones.service';
import { Publicacion } from '../../shared/models/publicacion.model';
import { admiteReservasPorFecha } from '../../shared/models/catalogo.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { HistorialLiquidacionesComponent } from '../../shared/components/historial-liquidaciones/historial-liquidaciones.component';

// Panel del anunciante verificado para administrar sus publicaciones: ver,
// activar, desactivar, mover a la papelera y restaurar. Las imágenes se gestionan en Editar.
@Component({
  selector: 'app-mis-publicaciones',
  standalone: true,
  imports: [RouterLink, SpinnerComponent, HistorialLiquidacionesComponent, LucideEye, LucideMapPin, LucidePencil, LucideSquarePlus, LucideTrash2, LucideX],
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
  protected readonly esTemporaria = admiteReservasPorFecha;
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly aviso = signal(inject(ActivatedRoute).snapshot.queryParamMap.get('aviso') ?? '');
  protected readonly resultado = signal('');
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

  protected eliminar(pub: Publicacion): void {
    if (this.ocupada() !== null) return;
    this.ocupada.set(pub.id);
    this.errorFila.set(null);
    this.resultado.set('');
    this.gestion.eliminar(pub.id).subscribe({
      next: (eliminada) => {
        this.actualizar(pub.id, () => eliminada);
        this.confirmandoBorrado.set(null);
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
