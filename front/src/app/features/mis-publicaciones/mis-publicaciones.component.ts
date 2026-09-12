import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { concatMap, from } from 'rxjs';
import { LucideEye, LucideImagePlus, LucideMapPin, LucideSquarePlus, LucideTrash2, LucideX } from '@lucide/angular';
import { AuthService } from '../../core/services/auth.service';
import { GestionPublicacionesService } from '../../shared/services/gestion-publicaciones.service';
import { Publicacion } from '../../shared/models/publicacion.model';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_IMAGEN = 10 * 1024 * 1024;

// Panel del anunciante verificado para administrar sus publicaciones: ver,
// eliminar y gestionar la galería de imágenes de cada una.
@Component({
  selector: 'app-mis-publicaciones',
  standalone: true,
  imports: [RouterLink, SpinnerComponent, LucideEye, LucideImagePlus, LucideMapPin, LucideSquarePlus, LucideTrash2, LucideX],
  templateUrl: './mis-publicaciones.component.html',
  styleUrl: './mis-publicaciones.component.scss',
})
export class MisPublicacionesComponent {
  private readonly auth = inject(AuthService);
  private readonly gestion = inject(GestionPublicacionesService);

  protected readonly publicaciones = signal<Publicacion[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly aviso = signal(inject(ActivatedRoute).snapshot.queryParamMap.get('aviso') ?? '');
  protected readonly expandida = signal<number | null>(null);
  protected readonly confirmandoBorrado = signal<number | null>(null);
  protected readonly ocupada = signal<number | null>(null);
  protected readonly errorFila = signal<{ id: number; mensaje: string } | null>(null);

  protected readonly activas = computed(() => this.publicaciones().filter((p) => p.activa).length);

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    const id = Number(this.auth.currentUser()?.sub);
    this.gestion.listarMias(id).subscribe({
      next: (lista) => {
        this.publicaciones.set(lista);
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

  protected eliminar(pub: Publicacion): void {
    this.ocupada.set(pub.id);
    this.gestion.eliminar(pub.id).subscribe({
      next: () => {
        this.publicaciones.update((lista) => lista.filter((p) => p.id !== pub.id));
        this.confirmandoBorrado.set(null);
        this.ocupada.set(null);
      },
      error: (err: Error) => this.fallo(pub.id, err),
    });
  }

  protected subirImagenes(pub: Publicacion, event: Event): void {
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
          this.actualizar(pub.id, (p) => ({ ...p, activa: true, imagenes: [...(p.imagenes ?? []), { id: imagen.id, url: imagen.url }] })),
        error: (err: Error) => this.fallo(pub.id, err),
        complete: () => this.ocupada.set(null),
      });
  }

  protected eliminarImagen(pub: Publicacion, idImagen: number): void {
    this.ocupada.set(pub.id);
    this.gestion.eliminarImagen(idImagen).subscribe({
      next: () => {
        this.actualizar(pub.id, (p) => ({ ...p, imagenes: (p.imagenes ?? []).filter((i) => i.id !== idImagen) }));
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
    this.publicaciones.update((lista) => lista.map((p) => (p.id === id ? cambio(p) : p)));
  }

  private fallo(id: number, err: Error): void {
    this.errorFila.set({ id, mensaje: err.message });
    this.ocupada.set(null);
  }
}
