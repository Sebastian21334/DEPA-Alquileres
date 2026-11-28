import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnInit,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize, type Observable } from 'rxjs';
import { LucideSearch, LucideTriangleAlert, LucideX } from '@lucide/angular';
import { ApiError } from '../../core/interceptors/api-error';
import { ToastService } from '../../core/services/toast.service';
import { EsqueletoListaComponent } from '../../shared/components/esqueleto-lista/esqueleto-lista.component';
import { EstrellasComponent } from '../resenas/estrellas/estrellas.component';
import {
  ESTADOS_RESENAS_ADMINISTRACION,
  MAX_CARACTERES_MOTIVO_MODERACION,
  MIN_CARACTERES_MOTIVO_MODERACION,
  type EstadoResenasAdministracion,
} from '../resenas/resenas.constantes';
import type { ResenaAdministracion, ResolucionDenunciaResena } from '../resenas/resenas.model';
import { ResenasService } from '../resenas/resenas.service';

@Component({
  selector: 'app-resenas-admin',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink, EsqueletoListaComponent, EstrellasComponent, LucideSearch, LucideTriangleAlert, LucideX],
  templateUrl: './resenas-admin.component.html',
  styleUrl: './resenas-admin.component.scss',
})
export class ResenasAdminComponent implements OnInit {
  private readonly service = inject(ResenasService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly lightboxCerrar = viewChild<ElementRef<HTMLButtonElement>>('cerrarImagenAdmin');
  private focoAnterior: HTMLElement | null = null;

  protected readonly datos = signal<ResenaAdministracion[]>([]);
  protected readonly historial = signal<ResolucionDenunciaResena[]>([]);
  protected readonly historialError = signal(false);
  protected readonly historialCargando = signal(false);
  protected readonly rechazoId = signal<number | null>(null);
  protected motivoRechazo = '';
  protected readonly estado = signal<EstadoResenasAdministracion>('todas');
  protected readonly query = signal('');
  protected readonly pagina = signal(1);
  protected readonly paginas = signal(1);
  protected readonly total = signal(0);
  readonly resenasLoading = signal(true);
  protected readonly busy = signal<string | null>(null);
  protected readonly ocultarId = signal<number | null>(null);
  protected motivo = '';
  protected readonly imagenAmpliada = signal<string | null>(null);
  protected readonly estados = ESTADOS_RESENAS_ADMINISTRACION;
  protected readonly MIN_CARACTERES_MOTIVO = MIN_CARACTERES_MOTIVO_MODERACION;
  protected readonly MAX_CARACTERES_MOTIVO = MAX_CARACTERES_MOTIVO_MODERACION;

  protected nombreAdministrador(item: ResolucionDenunciaResena): string {
    return [item.administrador_nombre, item.administrador_apellido].filter(Boolean).join(' ').trim() || 'Administrador no disponible';
  }

  ngOnInit(): void {
    this.load(1);
    this.cargarHistorial();
  }

  protected cargarHistorial(): void {
    if (this.historialCargando()) return;
    this.historialCargando.set(true);
    this.historialError.set(false);
    this.service.historialDenuncias().pipe(finalize(() => this.historialCargando.set(false)), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (datos) => { this.historial.set(datos); this.historialError.set(false); },
      error: () => this.historialError.set(true),
    });
  }

  protected rechazarDenuncia(resena: ResenaAdministracion): void {
    const motivo = this.motivoRechazo.trim();
    if (motivo.length < 5 || motivo.length > 300) {
      this.toast.mostrar('Escribí un motivo de entre 5 y 300 caracteres.', 'advertencia');
      return;
    }
    this.ejecutar(`${resena.id}-denuncia`, this.service.resolverDenuncia(resena.id, false, motivo), () => {
      this.rechazoId.set(null);
      this.recargar();
      this.cargarHistorial();
      this.toast.mostrar('Denuncia rechazada.', 'exito');
    });
  }

  recargar(): void {
    this.load(this.pagina());
  }

  protected search(value: string): void {
    this.query.set(value);
    this.load(1);
  }

  protected cambiarEstado(valor: string): void {
    const estado = ESTADOS_RESENAS_ADMINISTRACION.find((item) => item.valor === valor)?.valor;
    if (!estado) return;
    this.estado.set(estado);
    this.load(1);
  }

  protected load(page: number): void {
    if (page < 1 || page > this.paginas()) return;
    this.resenasLoading.set(true);
    this.ocultarId.set(null);
    this.service.listarAdministracion(this.estado(), page, 10, this.query())
      .pipe(
        finalize(() => this.resenasLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (resultado) => {
          this.datos.set(resultado.datos);
          this.pagina.set(resultado.pagina);
          this.paginas.set(resultado.totalPaginas);
          this.total.set(resultado.total);
        },
        error: (error: ApiError) => {
          this.datos.set([]);
          this.pagina.set(1);
          this.paginas.set(1);
          this.total.set(0);
          this.toast.mostrar(error.message, 'error');
        },
      });
  }

  protected abrirOcultar(resena: ResenaAdministracion): void {
    this.motivo = resena.motivo_moderacion ?? '';
    this.ocultarId.set(resena.id);
  }

  protected confirmarOcultar(resena: ResenaAdministracion): void {
    const motivo = this.motivo.trim();
    if (motivo.length < MIN_CARACTERES_MOTIVO_MODERACION || motivo.length > MAX_CARACTERES_MOTIVO_MODERACION) {
      this.toast.mostrar(
        `Escribí un motivo de entre ${MIN_CARACTERES_MOTIVO_MODERACION} y ${MAX_CARACTERES_MOTIVO_MODERACION} caracteres.`,
        'advertencia',
      );
      return;
    }
    this.ejecutar(
      `${resena.id}-ocultar`,
      this.service.moderar(resena.id, false, motivo),
      () => {
        this.ocultarId.set(null);
        this.recargar();
        this.cargarHistorial();
        this.toast.mostrar('Reseña ocultada.', 'exito');
      },
    );
  }

  protected restaurar(resena: ResenaAdministracion): void {
    this.ejecutar(
      `${resena.id}-restaurar`,
      this.service.moderar(resena.id, true),
      () => {
        this.recargar();
        this.toast.mostrar('Reseña restaurada.', 'exito');
      },
    );
  }

  protected quitarDenuncia(resena: ResenaAdministracion): void {
    this.ejecutar(
      `${resena.id}-denuncia`,
      this.service.quitarDenuncia(resena.id),
      () => {
        this.recargar();
        this.toast.mostrar('Denuncia retirada. La reseña vuelve a quedar sin revisión.', 'exito');
      },
    );
  }

  protected fechaResena(resena: ResenaAdministracion): string {
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(resena.fecha));
  }

  protected objetivoLink(resena: ResenaAdministracion): (string | number)[] {
    return resena.objetivo.tipo === 'PUBLICACION'
      ? ['/publicaciones', resena.objetivo.id]
      : ['/perfil', resena.objetivo.id];
  }

  protected verImagen(url: string): void {
    this.focoAnterior = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    this.imagenAmpliada.set(url);
    setTimeout(() => this.lightboxCerrar()?.nativeElement.focus());
  }

  protected cerrarImagen(): void {
    const anterior = this.focoAnterior;
    this.focoAnterior = null;
    this.imagenAmpliada.set(null);
    setTimeout(() => anterior?.focus());
  }

  @HostListener('document:keydown.escape')
  protected cerrarImagenConEscape(): void {
    if (this.imagenAmpliada()) this.cerrarImagen();
  }

  private ejecutar<T>(clave: string, solicitud: Observable<T>, exito: (valor: T) => void): void {
    if (this.busy()) return;
    this.busy.set(clave);
    solicitud.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (valor) => {
        exito(valor);
        this.busy.set(null);
      },
      error: (error: ApiError) => {
        this.toast.mostrar(error.message, 'error');
        this.busy.set(null);
      },
    });
  }
}
