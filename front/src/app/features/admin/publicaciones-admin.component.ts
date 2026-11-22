import { isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { LucideSearch } from '@lucide/angular';
import { Observable, Subscription } from 'rxjs';
import { ToastService } from '../../core/services/toast.service';
import { Publicacion } from '../../shared/models/publicacion.model';
import { AdminService } from './admin.service';

@Component({
  selector: 'app-publicaciones-admin',
  standalone: true,
  imports: [FormsModule, LucideSearch],
  templateUrl: './publicaciones-admin.component.html',
  styleUrl: './publicaciones-admin.component.scss',
})
export class PublicacionesAdminComponent {
  private readonly api = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private publicationsRequest?: Subscription;
  protected readonly publications = signal<Publicacion[]>([]);
  protected readonly publicationQuery = signal('');
  protected readonly bajaId = signal<number | null>(null);
  protected bajaReason = '';
  protected readonly publicationsPage = signal(1);
  protected readonly publicationsTotal = signal(0);
  protected readonly publicationsPages = signal(1);
  // El panel padre lo usa para su indicador global de carga.
  readonly publicationsLoading = signal(true);
  protected readonly busy = signal<string | null>(null);

  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) this.loadPublications(1);
  }

  recargar(): void {
    this.loadPublications(this.publicationsPage());
  }

  protected searchPublications(value: string): void {
    this.publicationQuery.set(value);
    this.loadPublications(1);
  }

  protected loadPublications(page: number): void {
    if (page < 1 || page > this.publicationsPages()) return;
    this.publicationsRequest?.unsubscribe();
    this.publicationsLoading.set(true);
    this.bajaId.set(null);
    this.publicationsRequest = this.api.listarPublicaciones(page, this.publicationQuery().trim())
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (result) => {
          this.publications.set(result.datos);
          this.publicationsPage.set(result.pagina);
          this.publicationsTotal.set(result.total);
          this.publicationsPages.set(result.totalPaginas);
          this.publicationsLoading.set(false);
        },
        error: (error: Error) => {
          this.publications.set([]);
          this.publicationsTotal.set(0);
          this.publicationsPage.set(1);
          this.publicationsPages.set(1);
          this.toast.mostrar(error.message, 'error');
          this.publicationsLoading.set(false);
        },
      });
  }

  protected openBaja(publication: Publicacion): void {
    this.bajaReason = publication.motivo_baja_admin ?? '';
    this.bajaId.set(publication.id);
  }

  protected confirmBaja(publication: Publicacion): void {
    if (this.busy()) return;
    const motivo = this.bajaReason.trim();
    if (!motivo || motivo.length > 500) return;
    this.ejecutar(
      `publication-${publication.id}`,
      this.api.darDeBajaPublicacion(publication.id, motivo),
      ({ publicacion, correoEnviado }) => {
        this.publications.update((items) =>
          items.map((item) => (item.id === publicacion.id ? publicacion : item)),
        );
        this.bajaId.set(null);
        if (!correoEnviado) {
          this.toast.mostrar(
            'La publicación fue desactivada, pero no se pudo enviar el correo. Podés repetir la baja para reintentar el aviso.',
            'advertencia',
          );
          return;
        }
        this.toast.mostrar('Publicación desactivada. El motivo quedó guardado en la cuenta del dueño.', 'exito');
      },
    );
  }

  private ejecutar<T>(clave: string, solicitud: Observable<T>, exito: (valor: T) => void): void {
    this.busy.set(clave);
    solicitud.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (valor) => {
        exito(valor);
        this.busy.set(null);
      },
      error: (error: Error) => {
        this.toast.mostrar(error.message, 'error');
        this.busy.set(null);
      },
    });
  }
}
