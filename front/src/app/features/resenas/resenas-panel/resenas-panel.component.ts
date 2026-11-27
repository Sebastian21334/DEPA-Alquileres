import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom, finalize, from, switchMap } from 'rxjs';
import { LucideInfo, LucideLogIn, LucideMessageSquareHeart, LucideX } from '@lucide/angular';
import { ApiError } from '../../../core/interceptors/api-error';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EsqueletoListaComponent } from '../../../shared/components/esqueleto-lista/esqueleto-lista.component';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import type { ImagenCargaResena } from '../carga-imagenes-resena/carga-imagenes-resena.component';
import { ResenaCardComponent } from '../resena-card/resena-card.component';
import { ResenaFormularioComponent } from '../resena-formulario/resena-formulario.component';
import {
  MAX_BYTES_IMAGEN_RESENA,
  MAX_IMAGENES_RESENA,
  TIPOS_IMAGEN_RESENA,
} from '../resenas.constantes';
import {
  CrearResenaPayload,
  MotivoNoPuedeResenar,
  Resena,
  ResenasObjetivo,
  ResumenResenas,
  TipoObjetivoResena,
} from '../resenas.model';
import { ResenasService } from '../resenas.service';
import { ResenasResumenComponent } from '../resenas-resumen/resenas-resumen.component';

interface ArchivoResena {
  archivo: File;
  url: string;
}

@Component({
  selector: 'app-resenas-panel',
  standalone: true,
  imports: [
    RouterLink,
    RevealDirective,
    ResenaCardComponent,
    ResenaFormularioComponent,
    ResenasResumenComponent,
    ConfirmDialogComponent,
    EsqueletoListaComponent,
    LucideMessageSquareHeart,
    LucideLogIn,
    LucideInfo,
    LucideX,
  ],
  templateUrl: './resenas-panel.component.html',
  styleUrl: './resenas-panel.component.scss',
})
export class ResenasPanelComponent implements OnInit, OnDestroy {
  readonly tipo = input.required<TipoObjetivoResena>();
  readonly idObjetivo = input.required<number>();
  readonly titulo = input('Reseñas');
  readonly resumenCambio = output<{ promedio: number | null; cantidad: number }>();

  private readonly service = inject(ResenasService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly router = inject(Router);
  private readonly confirmacion = viewChild.required<ConfirmDialogComponent>('confirmacion');
  private readonly confirmacionDenuncia = viewChild.required<ConfirmDialogComponent>('confirmacionDenuncia');
  private readonly formularioRef = viewChild<ElementRef<HTMLElement>>('formularioRef');
  private readonly lightboxCerrar = viewChild<ElementRef<HTMLButtonElement>>('cerrarLightbox');
  private focoAnterior: HTMLElement | null = null;

  protected readonly cargando = signal(true);
  protected readonly cargandoMas = signal(false);
  protected readonly error = signal('');
  protected readonly resenas = signal<Resena[]>([]);
  protected readonly resumen = signal<ResumenResenas>({ promedio: null, cantidad: 0, distribucion: [] });
  protected readonly miResena = signal<Resena | null>(null);
  protected readonly puedeResenar = signal(false);
  protected readonly motivoNoPuede = signal<MotivoNoPuedeResenar | null>(null);
  protected readonly pagina = signal(1);
  protected readonly totalPaginas = signal(1);
  protected readonly enviando = signal(false);
  protected readonly eliminando = signal(false);
  protected readonly editando = signal(false);
  protected readonly formAbierto = signal(false);
  protected readonly archivos = signal<ArchivoResena[]>([]);
  protected readonly imagenesAEliminar = signal<ReadonlySet<number>>(new Set());
  protected readonly imagenAmpliada = signal<string | null>(null);
  protected readonly resenaAEliminar = signal<Resena | null>(null);
  protected readonly resenaADenunciar = signal<Resena | null>(null);
  protected readonly denunciando = signal(false);
  protected readonly denunciadas = signal<ReadonlySet<number>>(new Set());

  protected readonly puedeEscribir = computed(() => this.puedeResenar() && !this.miResena());
  protected readonly miResenaOculta = computed(() => {
    const resena = this.miResena();
    return resena && resena.visible === false ? resena : null;
  });
  protected readonly miResenaVisible = computed(() => {
    const resena = this.miResena();
    return resena && resena.visible !== false ? resena : null;
  });
  protected readonly motivoMensaje = computed(() => {
    switch (this.motivoNoPuede()) {
      case 'SESION': return 'Iniciá sesión para dejar tu reseña.';
      case 'SIN_ESTADIA': return 'Solo pueden reseñar quienes completaron una estadía.';
      case 'PROPIO': return 'No podés reseñar tu propio contenido.';
      default: return '';
    }
  });
  protected readonly imagenesActuales = computed(() => this.miResena()?.imagenes ?? []);
  protected readonly cantidadImagenes = computed(() =>
    this.imagenesActuales().filter((imagen) => !this.imagenesAEliminar().has(imagen.id)).length + this.archivos().length,
  );
  protected readonly imagenesCarga = computed<ImagenCargaResena[]>(() => {
    const existentes = this.imagenesActuales().map((imagen) => ({
      id: imagen.id,
      url: imagen.url,
      nombre: `Imagen ${imagen.id} de la reseña`,
      tamano: null,
      existente: true,
      marcada: this.imagenesAEliminar().has(imagen.id),
    }));
    const nuevas = this.archivos().map((archivo, indice) => ({
      id: -(indice + 1),
      url: archivo.url,
      nombre: archivo.archivo.name,
      tamano: archivo.archivo.size,
      existente: false,
      marcada: false,
    }));
    return [...existentes, ...nuevas];
  });
  protected readonly tituloId = computed(() => `resenas-${this.tipo()}-${this.idObjetivo()}`);

  ngOnInit(): void {
    this.cargar(1, true);
  }

  ngOnDestroy(): void {
    this.revocarArchivos();
  }

  protected cargar(pagina: number, reemplazar: boolean): void {
    if (reemplazar) {
      this.cargando.set(true);
    } else {
      this.cargandoMas.set(true);
    }
    this.error.set('');
    this.service.listar(this.tipo(), this.idObjetivo(), pagina)
      .pipe(
        finalize(() => {
          this.cargando.set(false);
          this.cargandoMas.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (datos) => this.aplicarRespuesta(datos, reemplazar),
        error: () => this.error.set('No pudimos cargar las reseñas. Volvé a intentar en unos instantes.'),
      });
  }

  protected recargar(): void {
    this.cargar(1, true);
  }

  protected verMas(): void {
    if (this.cargandoMas() || this.pagina() >= this.totalPaginas()) return;
    this.cargar(this.pagina() + 1, false);
  }

  protected esPropia(resena: Resena): boolean {
    return this.miResena()?.id === resena.id;
  }

  protected abrirFormulario(): void {
    if (!this.auth.isAuthenticated) {
      void this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.formAbierto.set(true);
    this.editando.set(false);
    this.limpiarArchivos();
    this.imagenesAEliminar.set(new Set());
    this.desplazarAlFormulario();
  }

  protected editarResena(resena: Resena): void {
    this.formAbierto.set(true);
    this.editando.set(true);
    this.miResena.set(resena);
    this.limpiarArchivos();
    this.imagenesAEliminar.set(new Set());
    this.desplazarAlFormulario();
  }

  protected cancelarFormulario(): void {
    this.formAbierto.set(false);
    this.editando.set(false);
    this.limpiarArchivos();
    this.imagenesAEliminar.set(new Set());
  }

  protected guardarResena(payload: CrearResenaPayload): void {
    if (this.enviando()) return;
    const actual = this.miResena();
    const operacion = this.editando() && actual
      ? this.service.actualizar(actual.id, payload)
      : this.service.crear(this.tipo(), this.idObjetivo(), payload);

    this.enviando.set(true);
    operacion.pipe(
      switchMap((resena) => from(this.persistirAdjuntos(resena.id))),
      finalize(() => this.enviando.set(false)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: () => {
        this.toast.mostrar(this.editando() ? 'Reseña actualizada.' : 'Reseña publicada. ¡Gracias!', 'exito');
        this.cancelarFormulario();
        this.cargar(1, true);
      },
      error: (error: ApiError) => this.toast.mostrar(error.message, 'error'),
    });
  }

  protected agregarArchivos(seleccionados: File[]): void {
    if (!seleccionados.length) return;

    const disponibles = MAX_IMAGENES_RESENA - this.cantidadImagenes();
    if (disponibles <= 0) {
      this.toast.mostrar(`Una reseña puede tener hasta ${MAX_IMAGENES_RESENA} imágenes.`, 'advertencia');
      return;
    }
    const aceptados = seleccionados.slice(0, disponibles);
    for (const archivo of aceptados) {
      if (!TIPOS_IMAGEN_RESENA.some((tipo) => tipo === archivo.type)) {
        this.toast.mostrar('Solo se permiten imágenes JPEG, PNG, WEBP o HEIC.', 'error');
        continue;
      }
      if (archivo.size > MAX_BYTES_IMAGEN_RESENA) {
        this.toast.mostrar(`Cada imagen puede pesar hasta ${this.maximoEnMb()} MB.`, 'error');
        continue;
      }
      this.archivos.update((lista) => [...lista, { archivo, url: URL.createObjectURL(archivo) }]);
    }
    if (seleccionados.length > disponibles) {
      this.toast.mostrar(`Solo podés agregar ${disponibles} imagen(es) más.`, 'advertencia');
    }
  }

  protected quitarImagen(id: number): void {
    if (id < 0) {
      this.quitarArchivo(Math.abs(id) - 1);
      return;
    }
    this.imagenesAEliminar.update((actuales) => {
      const siguientes = new Set(actuales);
      if (siguientes.has(id)) siguientes.delete(id);
      else siguientes.add(id);
      return siguientes;
    });
  }

  private quitarArchivo(indice: number): void {
    const archivo = this.archivos()[indice];
    if (!archivo) return;
    URL.revokeObjectURL(archivo.url);
    this.archivos.update((lista) => lista.filter((_, i) => i !== indice));
  }

  protected solicitarDenuncia(resena: Resena): void {
    if (!this.auth.isAuthenticated) {
      void this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.resenaADenunciar.set(resena);
    this.confirmacionDenuncia().abrir();
  }

  protected denunciarConfirmada(): void {
    const resena = this.resenaADenunciar();
    if (!resena || this.denunciando()) return;
    this.denunciando.set(true);
    this.service.denunciar(resena.id)
      .pipe(
        finalize(() => this.denunciando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.denunciadas.update((actuales) => new Set(actuales).add(resena.id));
          this.cerrarDenuncia();
          this.toast.mostrar('Gracias. La denuncia fue enviada.', 'exito');
        },
        error: (error: ApiError) => {
          this.cerrarDenuncia();
          this.toast.mostrar(error.message, 'error');
        },
      });
  }

  protected cerrarDenuncia(): void {
    this.confirmacionDenuncia().cerrar();
    this.resenaADenunciar.set(null);
  }

  protected confirmarEliminar(resena: Resena): void {
    this.resenaAEliminar.set(resena);
    this.confirmacion().abrir();
  }

  protected eliminarConfirmada(): void {
    const resena = this.resenaAEliminar();
    if (!resena || this.eliminando()) return;
    this.eliminando.set(true);
    this.service.eliminar(resena.id)
      .pipe(
        finalize(() => this.eliminando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.cerrarConfirmacion();
          this.toast.mostrar('Reseña eliminada.', 'exito');
          if (this.editando() && this.miResena()?.id === resena.id) this.cancelarFormulario();
          this.cargar(1, true);
        },
        error: (error: ApiError) => this.toast.mostrar(error.message, 'error'),
      });
  }

  protected cerrarConfirmacion(): void {
    this.confirmacion().cerrar();
    this.resenaAEliminar.set(null);
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

  private aplicarRespuesta(datos: ResenasObjetivo, reemplazar: boolean): void {
    this.resenas.set(reemplazar ? datos.resenas : [...this.resenas(), ...datos.resenas]);
    this.resumen.set({
      promedio: datos.promedio,
      cantidad: datos.cantidad,
      distribucion: datos.distribucion,
    });
    this.miResena.set(datos.miResena);
    this.puedeResenar.set(datos.puedeResenar);
    this.motivoNoPuede.set(datos.motivoNoPuede ?? null);
    this.pagina.set(datos.pagina);
    this.totalPaginas.set(datos.totalPaginas);
    this.resumenCambio.emit({ promedio: datos.promedio, cantidad: datos.cantidad });
  }

  private async persistirAdjuntos(idResena: number): Promise<void> {
    const eliminar = [...this.imagenesAEliminar()];
    let fallos = 0;
    for (const idImagen of eliminar) {
      try {
        await firstValueFrom(this.service.eliminarImagen(idResena, idImagen));
      } catch {
        fallos++;
      }
    }
    for (const { archivo } of this.archivos()) {
      try {
        await firstValueFrom(this.service.subirImagen(idResena, archivo));
      } catch {
        fallos++;
      }
    }
    if (fallos) {
      this.toast.mostrar('La reseña se guardó, pero algunas imágenes no se pudieron subir.', 'advertencia');
    }
  }

  private desplazarAlFormulario(): void {
    const reducir = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => {
      this.formularioRef()?.nativeElement.scrollIntoView({
        behavior: reducir ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  }

  private limpiarArchivos(): void {
    this.revocarArchivos();
    this.archivos.set([]);
  }

  private revocarArchivos(): void {
    for (const archivo of this.archivos()) URL.revokeObjectURL(archivo.url);
  }

  private maximoEnMb(): number {
    const megas = MAX_BYTES_IMAGEN_RESENA / (1024 * 1024);
    return Number.isInteger(megas) ? megas : Number(megas.toFixed(1));
  }
}
